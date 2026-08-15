import http from "node:http";
import { createAceStepProvider } from "./providers/ace-step.mjs";

const port = Number(process.env.PORT || 4200);
const providerName = process.env.MODEL_PROVIDER || "ace-step";
const runtimeUrl = process.env.MODEL_RUNTIME_URL || "";
const runtimeToken = process.env.MODEL_RUNTIME_TOKEN || "";
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isAuthorized(req) {
  if (!internalToken) return true;
  return req.headers.authorization === `Bearer ${internalToken}`;
}

function getProvider() {
  if (!runtimeUrl) return null;
  if (providerName === "ace-step" || providerName === "ace-step-1.5") {
    return createAceStepProvider({ runtimeUrl, runtimeToken });
  }
  throw new Error(`Unsupported MODEL_PROVIDER: ${providerName}`);
}

function normalizeInferenceBody(body) {
  if (body?.engine === "AMUSE" && body?.modelIdentity === "ARIA-1") {
    return {
      ...body,
      providerPolicy: undefined,
    };
  }
  return body;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, {
      service: "model-gateway",
      status: "ok",
      provider: providerName,
      runtimeConfigured: Boolean(runtimeUrl),
      internalArchitecture: { modelIdentity: "ARIA-1", engine: "AMUSE" },
    });
  }

  if (req.method === "GET" && req.url === "/v1/models") {
    if (!runtimeUrl) {
      return json(res, 200, {
        provider: providerName,
        models: [],
        runtimeConfigured: false,
        note: "Configure MODEL_RUNTIME_URL to query runtime models. Model weights are never stored in this repository.",
      });
    }

    try {
      const provider = getProvider();
      const result = await provider.listModels();
      return json(res, 200, { provider: providerName, runtimeConfigured: true, runtime: result });
    } catch (error) {
      return json(res, 502, { error: "model_runtime_unavailable", message: String(error?.message || error) });
    }
  }

  if (req.method === "POST" && req.url === "/v1/inference") {
    if (!isAuthorized(req)) return json(res, 401, { error: "unauthorized" });
    if (!runtimeUrl) {
      return json(res, 503, {
        error: "model_runtime_not_configured",
        message: "Set MODEL_RUNTIME_URL before inference can be dispatched.",
      });
    }

    try {
      const rawBody = await readJson(req);
      const body = normalizeInferenceBody(rawBody);
      if (!body.prompt || !body.mode) return json(res, 400, { error: "prompt and mode are required" });
      const provider = getProvider();
      const result = await provider.submit(body);
      return json(res, 202, {
        ...result,
        architecture: rawBody?.engine === "AMUSE" ? { modelIdentity: "ARIA-1", engine: "AMUSE" } : undefined,
      });
    } catch (error) {
      return json(res, 502, { error: "provider_submit_failed", message: String(error?.message || error) });
    }
  }

  if (req.method === "POST" && req.url === "/v1/inference/status") {
    if (!isAuthorized(req)) return json(res, 401, { error: "unauthorized" });
    if (!runtimeUrl) return json(res, 503, { error: "model_runtime_not_configured" });

    try {
      const body = await readJson(req);
      if (!body.providerTaskId) return json(res, 400, { error: "providerTaskId is required" });
      const provider = getProvider();
      const result = await provider.query(body.providerTaskId);
      return json(res, 200, result);
    } catch (error) {
      return json(res, 502, { error: "provider_status_failed", message: String(error?.message || error) });
    }
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`model-gateway listening on :${port} using ${providerName} behind ARIA-1/AMUSE`);
});
