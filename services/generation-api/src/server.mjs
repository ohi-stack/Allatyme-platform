import http from "node:http";
import { randomUUID } from "node:crypto";
import {
  initStore,
  closeStore,
  healthSnapshot,
  createJob,
  getJob,
  listJobs,
  claimNextJob,
  setProvider,
  completeJob,
  failJob,
} from "./store.mjs";

const port = Number(process.env.PORT || 4100);
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";
const allowedOrigin = process.env.WEB_BASE_URL || "http://localhost:3000";

function headers(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    ...extra,
  };
}

function json(res, status, body) {
  res.writeHead(status, headers());
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isInternal(req) {
  if (!internalToken) return true;
  return req.headers.authorization === `Bearer ${internalToken}`;
}

function validateRights(body) {
  const rights = body?.rights;
  if (!rights?.ownsPromptContent) return "Prompt-content rights attestation is required.";
  if (body?.lyrics?.trim() && !rights?.ownsLyrics) return "Lyrics rights attestation is required.";
  if ((body?.referenceAssetId || body?.sourceAssetId) && !rights?.ownsReferenceAudio) {
    return "Reference/source audio requires explicit ownership or authorization attestation.";
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers({ "content-type": "text/plain" }));
    return res.end();
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    try {
      const state = await healthSnapshot();
      return json(res, 200, { service: "generation-api", status: "ok", persistence: "postgres+redis", ...state });
    } catch (error) {
      return json(res, 503, { service: "generation-api", status: "degraded", message: String(error?.message || error) });
    }
  }

  if (req.method === "POST" && url.pathname === "/v1/generations") {
    try {
      const body = await readJson(req);
      if (!body.prompt || !body.mode) return json(res, 400, { error: "prompt and mode are required" });
      const rightsError = validateRights(body);
      if (rightsError) return json(res, 422, { error: rightsError });

      const id = randomUUID();
      const request = {
        ...body,
        requestId: body.requestId || id,
        userId: body.userId || "local-dev",
        candidateCount: Math.min(Math.max(Number(body.candidateCount || 2), 1), 8),
        outputFormat: body.outputFormat || "wav",
        masterTuningHz: Number(body.masterTuningHz || 432),
      };
      const job = await createJob({ id, request });
      return json(res, 202, job);
    } catch (error) {
      return json(res, 500, { error: "generation_create_failed", message: String(error?.message || error) });
    }
  }

  if (req.method === "GET" && url.pathname === "/v1/generations") {
    const items = await listJobs({
      userId: url.searchParams.get("userId") || undefined,
      limit: url.searchParams.get("limit") || 25,
      offset: url.searchParams.get("offset") || 0,
    });
    return json(res, 200, { items });
  }

  const generationMatch = url.pathname.match(/^\/v1\/generations\/([^/]+)$/);
  if (req.method === "GET" && generationMatch) {
    const job = await getJob(generationMatch[1]);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    return json(res, 200, job);
  }

  if (url.pathname.startsWith("/v1/internal/") && !isInternal(req)) {
    return json(res, 401, { error: "unauthorized" });
  }

  if (req.method === "POST" && url.pathname === "/v1/internal/jobs/next") {
    const job = await claimNextJob();
    if (!job) {
      res.writeHead(204, headers());
      return res.end();
    }
    return json(res, 200, job);
  }

  const providerMatch = url.pathname.match(/^\/v1\/internal\/jobs\/([^/]+)\/provider$/);
  if (req.method === "POST" && providerMatch) {
    const body = await readJson(req);
    const job = await setProvider(providerMatch[1], body);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    return json(res, 200, job);
  }

  const completeMatch = url.pathname.match(/^\/v1\/internal\/jobs\/([^/]+)\/complete$/);
  if (req.method === "POST" && completeMatch) {
    const body = await readJson(req);
    const job = await completeJob(completeMatch[1], body);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    return json(res, 200, job);
  }

  const failMatch = url.pathname.match(/^\/v1\/internal\/jobs\/([^/]+)\/fail$/);
  if (req.method === "POST" && failMatch) {
    const body = await readJson(req);
    const job = await failJob(failMatch[1], body);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    return json(res, 200, job);
  }

  return json(res, 404, { error: "not_found" });
});

await initStore();
server.listen(port, () => console.log(`generation-api listening on :${port} with durable Postgres/Redis persistence`));

async function shutdown(signal) {
  console.log(`[generation-api] ${signal}; shutting down`);
  server.close(async () => {
    await closeStore();
    process.exit(0);
  });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
