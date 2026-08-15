import http from "node:http";
import { createHash } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const port = Number(process.env.PORT || 4400);
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";
const endpoint = process.env.OBJECT_STORAGE_ENDPOINT || "";
const region = process.env.OBJECT_STORAGE_REGION || "us-east-1";
const bucket = process.env.OBJECT_STORAGE_BUCKET || "";
const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY || "";
const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_KEY || "";
const publicBase = (process.env.OBJECT_STORAGE_PUBLIC_BASE_URL || "").replace(/\/$/, "");
const maxBytes = Number(process.env.MEDIA_INGEST_MAX_BYTES || 536870912);

const s3 = new S3Client({
  region,
  endpoint: endpoint || undefined,
  forcePathStyle: String(process.env.OBJECT_STORAGE_FORCE_PATH_STYLE || "true") === "true",
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
});

function authOk(req) {
  if (!internalToken) return true;
  return req.headers.authorization === `Bearer ${internalToken}`;
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

function sourceAllowlist() {
  const values = (process.env.MEDIA_SOURCE_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  for (const candidate of [process.env.AUDIO_PROCESSING_URL, process.env.MODEL_RUNTIME_URL]) {
    if (candidate) values.push(candidate);
  }
  return new Set(values.map((value) => new URL(value).origin));
}

function validateSource(value) {
  const source = new URL(value);
  if (!["http:", "https:"].includes(source.protocol)) throw new Error("Only HTTP(S) media sources are accepted.");
  if (!sourceAllowlist().has(source.origin)) throw new Error(`Media source origin is not allowlisted: ${source.origin}`);
  return source;
}

function sanitizeKey(value) {
  return value.replace(/[^a-zA-Z0-9._/-]+/g, "-").replace(/\.{2,}/g, ".").replace(/^\/+/, "");
}

async function fetchSource(source) {
  const headers = {};
  const audioOrigin = process.env.AUDIO_PROCESSING_URL ? new URL(process.env.AUDIO_PROCESSING_URL).origin : null;
  if (audioOrigin && source.origin === audioOrigin && internalToken) headers.authorization = `Bearer ${internalToken}`;
  const response = await fetch(source, { headers, signal: AbortSignal.timeout(180_000) });
  if (!response.ok) throw new Error(`Media download failed: ${response.status}`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength && contentLength > maxBytes) throw new Error("Media source exceeds configured size limit.");
  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength > maxBytes) throw new Error("Media source exceeds configured size limit.");
  return { body, contentType: response.headers.get("content-type") || "application/octet-stream" };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return json(res, endpoint && bucket ? 200 : 503, {
      service: "media-ingestion",
      status: endpoint && bucket ? "ok" : "not_configured",
      bucket: bucket || null,
    });
  }
  if (!authOk(req)) return json(res, 401, { error: "unauthorized" });

  if (req.method === "POST" && req.url === "/v1/ingest") {
    try {
      if (!endpoint || !bucket) throw new Error("Object storage is not configured.");
      const body = await readJson(req);
      if (!body.sourceUrl || !body.objectKey) return json(res, 400, { error: "sourceUrl and objectKey are required" });
      const source = validateSource(body.sourceUrl);
      const objectKey = sanitizeKey(body.objectKey);
      const fetched = await fetchSource(source);
      const checksumSha256 = createHash("sha256").update(fetched.body).digest("hex");
      const contentType = body.contentType || fetched.contentType;

      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: fetched.body,
        ContentType: contentType,
        Metadata: {
          "allatyme-job-id": String(body.metadata?.jobId || ""),
          "allatyme-artifact-id": String(body.metadata?.artifactId || ""),
          "sha256": checksumSha256,
        },
      }));

      const uri = `s3://${bucket}/${objectKey}`;
      const publicUrl = publicBase ? `${publicBase}/${objectKey.split("/").map(encodeURIComponent).join("/")}` : null;
      return json(res, 201, {
        uri,
        publicUrl,
        storageProvider: "s3-compatible",
        bucket,
        objectKey,
        checksumSha256,
        contentType,
        bytes: fetched.body.byteLength,
      });
    } catch (error) {
      return json(res, 422, { error: "media_ingestion_failed", message: String(error?.message || error) });
    }
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(port, () => console.log(`media-ingestion listening on :${port}`));
