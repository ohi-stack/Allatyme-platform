import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT || 4100);

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateRights(body) {
  const rights = body?.rights;
  if (!rights?.ownsPromptContent) return "Prompt-content rights attestation is required.";
  if (body?.lyrics && !rights?.ownsLyrics) return "Lyrics rights attestation is required.";
  if (body?.referenceAssetId && !rights?.ownsReferenceAudio) {
    return "Reference audio requires explicit ownership or authorization attestation.";
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { service: "generation-api", status: "ok" });
  }

  if (req.method === "POST" && req.url === "/v1/generations") {
    try {
      const body = await readJson(req);
      if (!body.prompt || !body.mode) {
        return json(res, 400, { error: "prompt and mode are required" });
      }

      const rightsError = validateRights(body);
      if (rightsError) return json(res, 422, { error: rightsError });

      const now = new Date().toISOString();
      const job = {
        id: randomUUID(),
        status: "queued",
        createdAt: now,
        updatedAt: now,
        request: body,
      };

      // V1 boundary: persist this job and enqueue it for apps/worker.
      // The API deliberately does not call a model provider directly.
      return json(res, 202, job);
    } catch (error) {
      return json(res, 400, { error: "invalid_json", message: String(error?.message || error) });
    }
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`generation-api listening on :${port}`);
});
