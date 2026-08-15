const generationApiUrl = (process.env.GENERATION_API_URL || "http://localhost:4100").replace(/\/$/, "");
const modelGatewayUrl = (process.env.MODEL_GATEWAY_URL || "http://localhost:4200").replace(/\/$/, "");
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
  const response = await fetch(url, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
  });

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
  return requestJson(`${generationApiUrl}/v1/internal/jobs/${jobId}/provider`, {
    method: "POST",
    body: JSON.stringify(dispatch),
  });
}

async function completeJob(jobId, result) {
  return requestJson(`${generationApiUrl}/v1/internal/jobs/${jobId}/complete`, {
    method: "POST",
    body: JSON.stringify(result),
  });
}

async function failJob(jobId, error) {
  return requestJson(`${generationApiUrl}/v1/internal/jobs/${jobId}/fail`, {
    method: "POST",
    body: JSON.stringify({ code: "worker_generation_failed", message: String(error?.message || error) }),
  }).catch(() => null);
}

async function dispatch(request) {
  return requestJson(`${modelGatewayUrl}/v1/inference`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

async function queryProvider(providerTaskId) {
  return requestJson(`${modelGatewayUrl}/v1/inference/status`, {
    method: "POST",
    body: JSON.stringify({ providerTaskId }),
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processJob(job) {
  console.log(`[worker] dispatching ${job.id}`);
  try {
    const dispatchResult = await dispatch(job.request);
    await recordProvider(job.id, dispatchResult);

    const started = Date.now();
    while (Date.now() - started < providerTimeoutMs) {
      const result = await queryProvider(dispatchResult.providerTaskId);
      if (result.status === "succeeded") {
        await completeJob(job.id, {
          provider: result.provider || dispatchResult.provider,
          model: dispatchResult.model,
          artifacts: result.artifacts || [],
        });
        console.log(`[worker] completed ${job.id} with ${(result.artifacts || []).length} artifact(s)`);
        return;
      }

      if (result.status === "failed") {
        throw new Error(result.error?.message || "Provider generation failed.");
      }

      await sleep(providerPollMs);
    }

    throw new Error(`Provider timed out after ${providerTimeoutMs}ms.`);
  } catch (error) {
    console.error(`[worker] failed ${job.id}:`, error);
    await failJob(job.id, error);
  }
}

async function main() {
  console.log(`[worker] ALLATYME generation worker online; queue=${generationApiUrl}; gateway=${modelGatewayUrl}`);

  for (;;) {
    try {
      const job = await nextJob();
      if (!job) {
        await sleep(pollMs);
        continue;
      }
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
