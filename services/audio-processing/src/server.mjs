import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const port = Number(process.env.PORT || 4300);
const publicBaseUrl = (process.env.AUDIO_PROCESSING_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, "");
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";
const modelRuntimeUrl = process.env.MODEL_RUNTIME_URL || "";
const modelRuntimeToken = process.env.MODEL_RUNTIME_TOKEN || "";
const tempRoot = process.env.AUDIO_TEMP_DIR || path.join(os.tmpdir(), "allatyme-audio");
const maxBytes = Number(process.env.AUDIO_SOURCE_MAX_BYTES || 536870912);
const artifacts = new Map();

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

function allowedOrigins() {
  const values = (process.env.AUDIO_SOURCE_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (modelRuntimeUrl) values.push(new URL(modelRuntimeUrl).origin);
  return new Set(values.map((value) => new URL(value).origin));
}

function validateSource(value) {
  const source = new URL(value);
  if (!["http:", "https:"].includes(source.protocol)) throw new Error("Only HTTP(S) source audio is accepted.");
  const allowed = allowedOrigins();
  if (!allowed.has(source.origin)) throw new Error(`Audio source origin is not allowlisted: ${source.origin}`);
  return source;
}

function extFor(format) {
  return ({ wav: "wav", flac: "flac", mp3: "mp3", opus: "opus", aac: "m4a" })[format] || "wav";
}

function mimeFor(format) {
  return ({ wav: "audio/wav", flac: "audio/flac", mp3: "audio/mpeg", opus: "audio/ogg", aac: "audio/mp4" })[format] || "audio/wav";
}

async function downloadSource(source, filePath) {
  const headers = {};
  if (modelRuntimeUrl && source.origin === new URL(modelRuntimeUrl).origin && modelRuntimeToken) {
    headers.authorization = `Bearer ${modelRuntimeToken}`;
  }
  const response = await fetch(source, { headers, signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Source download failed: ${response.status}`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength && contentLength > maxBytes) throw new Error("Source audio exceeds configured size limit.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > maxBytes) throw new Error("Source audio exceeds configured size limit.");
  await fs.writeFile(filePath, buffer);
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.FFMPEG_PATH || "ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg failed (${code}): ${stderr.slice(-2000)}`)));
  });
}

async function processAudio({ sourceUrl, tuningHz = 432, outputFormat = "wav", jobId, artifactId }) {
  const source = validateSource(sourceUrl);
  const id = randomUUID();
  const dir = path.join(tempRoot, String(jobId || "unscoped"));
  await fs.mkdir(dir, { recursive: true });
  const inputPath = path.join(dir, `${id}.input`);
  const outputPath = path.join(dir, `${id}.${extFor(outputFormat)}`);
  await downloadSource(source, inputPath);

  const filters = [];
  const numericTuning = Number(tuningHz || 440);
  if (numericTuning === 432) {
    // 432/440 = 0.981818..., approximately -31.77 cents while preserving duration.
    // This requires FFmpeg built with the rubberband filter; failure is explicit rather than silently mislabeling audio.
    filters.push("rubberband=pitch=0.9818181818181818");
  } else if (numericTuning !== 440) {
    throw new Error("V1 processing currently supports 432 Hz or 440 Hz reference only.");
  }
  filters.push("loudnorm=I=-14:TP=-1:LRA=11");

  const args = ["-hide_banner", "-y", "-i", inputPath, "-vn", "-af", filters.join(",")];
  if (outputFormat === "wav") args.push("-c:a", "pcm_s24le");
  if (outputFormat === "flac") args.push("-c:a", "flac");
  if (outputFormat === "mp3") args.push("-c:a", "libmp3lame", "-q:a", "2");
  if (outputFormat === "opus") args.push("-c:a", "libopus", "-b:a", "192k");
  if (outputFormat === "aac") args.push("-c:a", "aac", "-b:a", "256k");
  args.push(outputPath);

  await runFfmpeg(args);
  await fs.rm(inputPath, { force: true });
  artifacts.set(id, { path: outputPath, mimeType: mimeFor(outputFormat), createdAt: Date.now() });

  return {
    id: artifactId || id,
    url: `${publicBaseUrl}/v1/audio/${id}`,
    mimeType: mimeFor(outputFormat),
    tuningHz: numericTuning,
    processing: {
      tuningReferenceApplied: numericTuning,
      loudnessTargetLufs: -14,
      tempoPreservedFor432: numericTuning === 432,
      pipeline: "ffmpeg-rubberband+loudnorm",
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { service: "audio-processing", status: "ok", ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg" });
  }
  if (!authOk(req)) return json(res, 401, { error: "unauthorized" });

  if (req.method === "POST" && url.pathname === "/v1/process") {
    try {
      const body = await readJson(req);
      if (!body.sourceUrl) return json(res, 400, { error: "sourceUrl is required" });
      const result = await processAudio(body);
      return json(res, 201, result);
    } catch (error) {
      return json(res, 422, { error: "audio_processing_failed", message: String(error?.message || error) });
    }
  }

  const audioMatch = url.pathname.match(/^\/v1\/audio\/([^/]+)$/);
  if (req.method === "GET" && audioMatch) {
    const artifact = artifacts.get(audioMatch[1]);
    if (!artifact) return json(res, 404, { error: "processed_audio_not_found" });
    res.writeHead(200, { "content-type": artifact.mimeType, "cache-control": "private, max-age=300" });
    return createReadStream(artifact.path).pipe(res);
  }

  return json(res, 404, { error: "not_found" });
});

await fs.mkdir(tempRoot, { recursive: true });
server.listen(port, () => console.log(`audio-processing listening on :${port}`));
