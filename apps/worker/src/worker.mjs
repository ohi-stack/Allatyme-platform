import { buildAriaPlan, buildAmuseDispatch, publicGenerationIdentity } from "./architecture.mjs";

const generationApiUrl = (process.env.GENERATION_API_URL || "http://localhost:4100").replace(/\/$/, "");
const modelGatewayUrl = (process.env.MODEL_GATEWAY_URL || "http://localhost:4200").replace(/\/$/, "");
const audioProcessingUrl = (process.env.AUDIO_PROCESSING_URL || "http://localhost:4300").replace(/\/$/, "");
const mediaIngestionUrl = (process.env.MEDIA_INGESTION_URL || "http://localhost:4400").replace(/\/$/, "");
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";
const pollMs = Number(process.env.WORKER_POLL_MS || 2000);
const providerPollMs = Number(process.env.PROVIDER_POLL_MS || 3000);
const providerTimeoutMs = Number(process.env.PROVIDER_TIMEOUT_MS || 20 * 60 * 1000);

function headers() {
  const value = { "content-type": "application/json" };
  if (internalToken) value.authorization = `Bearer ${internalToken}`;
  return value;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message || body?.error || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return body;
}

async function nextJob() {
  return requestJson(`${generationApiUrl}/v1/internal/jobs/next`, { method: "POST", body: "{}" });
}

async function recordProvider(jobId, dispatch) {
  return requestJson(`${generationApiUrl}/v1/internal/jobs/${jobId}/provider`, { method: "POST", body: JSON.stringify(dispatch) });
}

async function completeJob(jobId, result) {
  return requestJson(`${generationApiUrl}/v1/internal/jobs/${jobId}/complete`, { method: "POST", body: JSON.stringify(result) });
}

async function failJob(jobId, error) {
  return requestJson(`${generationApiUrl}/v1/internal/jobs/${jobId}/fail`, {
    method: "POST",
    body: JSON.stringify({ code: "worker_generation_failed", message: String(error?.message || error) }),
  }).catch(() => null);
}

async function dispatch(request) {
  return requestJson(`${modelGatewayUrl}/v1/inference`, { method: "POST", body: JSON.stringify(request) });
}

async function queryProvider(providerTaskId) {
  return requestJson(`${modelGatewayUrl}/v1/inference/status`, { method: "POST", body: JSON.stringify({ providerTaskId }) });
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function extensionFor(format) {
  return ({ wav: "wav", flac: "flac", mp3: "mp3", opus: "opus", aac: "m4a" })[format] || "wav";
}

async function finalizeArtifact(job, artifact, index) {
  if (!artifact?.uri) throw new Error(`Generated artifact ${index} has no source URI.`);
  const outputFormat = job.request.outputFormat || "wav";
  const tuningHz = Number(job.request.masterTuningHz || 432);

  const processed = await requestJson(`${audioProcessingUrl}/v1/process`, {
    method: "POST",
    body: JSON.stringify({
      sourceUrl: artifact.uri,
      tuningHz,
      outputFormat,
      jobId: job.id,
      artifactId: artifact.id || `${job.id}:${index}`,
    }),
  });

  const objectKey = `generations/${job.request.userId}/${job.id}/${String(index + 1).padStart(2, "0")}.${extensionFor(outputFormat)}`;
  const stored = await requestJson(`${mediaIngestionUrl}/v1/ingest`, {
    method: "POST",
    body: JSON.stringify({
      sourceUrl: processed.url,
      objectKey,
      contentType: processed.mimeType,
      metadata: { jobId: job.id, artifactId: artifact.id || `${job.id}:${index}` },
    }),
  });

  return {
    ...artifact,
    uri: stored.uri,
    deliveryUrl: stored.publicUrl || null,
    mimeType: stored.contentType,
    storageProvider: stored.storageProvider,
    objectKey: stored.objectKey,
    checksumSha256: stored.checksumSha256,
    metadata: {
      ...(artifact.metadata || {}),
      providerUri: artifact.uri,
      tuningHz,
      processing: processed.processing,
      storageBytes: stored.bytes,
    },
  };
}

async function processJob(job) {
  const identity = publicGenerationIdentity();
  console.log(`[worker] ${identity.product} -> ${identity.model} -> ${identity.engine}; dispatching ${job.id}`);
  try {
    const ariaPlan = buildAriaPlan(job.request);
    const amuseDispatch = buildAmuseDispatch(ariaPlan);
    const dispatchResult = await dispatch(amuseDispatch);

    await recordProvider(job.id, {
      ...dispatchResult,
      architecture: identity,
      providerInternal: true,
    });

    const started = Date.now();
    while (Date.now() - started < providerTimeoutMs) {
      const result = await queryProvider(dispatchResult.providerTaskId);
      if (result.status === "succeeded") {
        const finalized = [];
        for (const [index, artifact] of (result.artifacts || []).entries()) {
          finalized.push(await finalizeArtifact(job, artifact, index));
        }
        if (!finalized.length) throw new Error("AMUSE provider succeeded but returned no audio artifacts.");

        await completeJob(job.id, {
          model: "ARIA-1",
          engine: "AMUSE",
          product: "ALLAWAVE",
          provider: result.provider || dispatchResult.provider,
          providerInternal: true,
          runtimeModel: dispatchResult.model,
          artifacts: finalized,
        });
        console.log(`[worker] completed ${job.id} through ALLAWAVE/ARIA-1/AMUSE with ${finalized.length} stored artifact(s)`);
        return;
      }
      if (result.status === "failed") throw new Error(result.error?.message || "AMUSE provider generation failed.");
      await sleep(providerPollMs);
    }
    throw new Error(`AMUSE provider timed out after ${providerTimeoutMs}ms.`);
  } catch (error) {
    console.error(`[worker] failed ${job.id}:`, error);
    await failJob(job.id, error);
  }
}

async function main() {
  const identity = publicGenerationIdentity();
  console.log(`[worker] ${identity.product} worker online; model=${identity.model}; engine=${identity.engine}; queue=${generationApiUrl}; gateway=${modelGatewayUrl}`);
  for (;;) {
    try {
      const job = await nextJob();
      if (!job) { await sleep(pollMs); continue; }
      await processJob(job);
    } catch (error) {
      console.error("[worker] loop error:", error);
      await sleep(Math.max(pollMs, 5000));
    }
  }
}

main().catch((error) => {
  console.error("[worker] fatal:", error);
  process.exitCode = 1;
});
