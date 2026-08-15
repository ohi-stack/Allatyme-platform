import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT || 4100);
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";
const allowedOrigin = process.env.WEB_BASE_URL || "http://localhost:3000";
const jobs = new Map();

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

function serialize(job) {
  return JSON.parse(JSON.stringify(job));
}

function updateJob(job, patch) {
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  jobs.set(job.id, job);
  return job;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers({ "content-type": "text/plain" }));
    return res.end();
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      service: "generation-api",
      status: "ok",
      queue: {
        total: jobs.size,
        queued: [...jobs.values()].filter((job) => job.status === "queued").length,
        running: [...jobs.values()].filter((job) => job.status === "running").length,
      },
      persistence: "memory-v1",
    });
  }

  if (req.method === "POST" && url.pathname === "/v1/generations") {
    try {
      const body = await readJson(req);
      if (!body.prompt || !body.mode) {
        return json(res, 400, { error: "prompt and mode are required" });
      }

      const rightsError = validateRights(body);
      if (rightsError) return json(res, 422, { error: rightsError });

      const now = new Date().toISOString();
      const id = randomUUID();
      const request = {
        ...body,
        requestId: body.requestId || id,
        userId: body.userId || "local-dev",
        candidateCount: Math.min(Math.max(Number(body.candidateCount || 2), 1), 8),
        outputFormat: body.outputFormat || "wav",
        masterTuningHz: body.masterTuningHz || 432,
      };
      const job = {
        id,
        status: "queued",
        createdAt: now,
        updatedAt: now,
        provider: null,
        providerTaskId: null,
        model: null,
        artifacts: [],
        request,
      };
      jobs.set(id, job);
      return json(res, 202, serialize(job));
    } catch (error) {
      return json(res, 400, { error: "invalid_json", message: String(error?.message || error) });
    }
  }

  const generationMatch = url.pathname.match(/^\/v1\/generations\/([^/]+)$/);
  if (req.method === "GET" && generationMatch) {
    const job = jobs.get(generationMatch[1]);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    return json(res, 200, serialize(job));
  }

  if (url.pathname.startsWith("/v1/internal/") && !isInternal(req)) {
    return json(res, 401, { error: "unauthorized" });
  }

  if (req.method === "POST" && url.pathname === "/v1/internal/jobs/next") {
    const job = [...jobs.values()]
      .filter((candidate) => candidate.status === "queued")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (!job) return json(res, 204, {});
    updateJob(job, { status: "running" });
    return json(res, 200, serialize(job));
  }

  const providerMatch = url.pathname.match(/^\/v1\/internal\/jobs\/([^/]+)\/provider$/);
  if (req.method === "POST" && providerMatch) {
    const job = jobs.get(providerMatch[1]);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    const body = await readJson(req);
    updateJob(job, {
      provider: body.provider || job.provider,
      providerTaskId: body.providerTaskId || job.providerTaskId,
      model: body.model || job.model,
    });
    return json(res, 200, serialize(job));
  }

  const completeMatch = url.pathname.match(/^\/v1\/internal\/jobs\/([^/]+)\/complete$/);
  if (req.method === "POST" && completeMatch) {
    const job = jobs.get(completeMatch[1]);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    const body = await readJson(req);
    updateJob(job, {
      status: "succeeded",
      provider: body.provider || job.provider,
      model: body.model || job.model,
      artifacts: Array.isArray(body.artifacts) ? body.artifacts : [],
      error: undefined,
    });
    return json(res, 200, serialize(job));
  }

  const failMatch = url.pathname.match(/^\/v1\/internal\/jobs\/([^/]+)\/fail$/);
  if (req.method === "POST" && failMatch) {
    const job = jobs.get(failMatch[1]);
    if (!job) return json(res, 404, { error: "generation_not_found" });
    const body = await readJson(req);
    updateJob(job, {
      status: "failed",
      error: {
        code: body.code || "generation_failed",
        message: body.message || "Generation failed.",
      },
    });
    return json(res, 200, serialize(job));
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`generation-api listening on :${port}`);
});
