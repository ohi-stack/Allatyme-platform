const DEFAULT_MODEL = process.env.ACESTEP_MODEL || "acestep-v15-xl-turbo";

function joinPrompt(request) {
  return [
    request.prompt,
    request.genre ? `Genre: ${request.genre}.` : "",
    request.subgenre ? `Subgenre: ${request.subgenre}.` : "",
    Array.isArray(request.mood) && request.mood.length ? `Mood: ${request.mood.join(", ")}.` : "",
    request.mode === "instrumental" ? "Instrumental only. No lead vocals." : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function taskTypeFor(mode) {
  switch (mode) {
    case "cover":
      return "cover";
    case "repaint":
      return "repaint";
    case "add-layer":
      return "lego";
    case "extend":
      return "complete";
    case "stems":
      return "extract";
    default:
      return "text2music";
  }
}

function authHeaders(token) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function parseResponse(response) {
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.code >= 400 || body?.error) {
    const message = body?.error || body?.message || `${response.status} ${response.statusText}`;
    throw new Error(`ACE-Step runtime error: ${message}`);
  }
  return body;
}

export function createAceStepProvider({ runtimeUrl, runtimeToken }) {
  const baseUrl = runtimeUrl.replace(/\/$/, "");

  async function submit(request) {
    const taskType = taskTypeFor(request.mode);

    if (["cover", "repaint", "lego", "complete", "extract"].includes(taskType) && !request.sourceAudioPath) {
      throw new Error(`${request.mode} requires sourceAudioPath resolved by the trusted worker/media layer.`);
    }

    const payload = {
      prompt: joinPrompt(request),
      lyrics: request.mode === "instrumental" ? "" : request.lyrics || "",
      task_type: taskType,
      vocal_language: request.language || "en",
      audio_format: request.outputFormat || "wav",
      model: request.model || DEFAULT_MODEL,
      thinking: request.thinking ?? true,
      use_format: true,
      use_cot_caption: true,
      use_cot_language: true,
      batch_size: Math.min(Math.max(Number(request.candidateCount || 2), 1), 8),
      ...(request.bpm ? { bpm: request.bpm } : {}),
      ...(request.key ? { key_scale: request.key } : {}),
      ...(request.timeSignature ? { time_signature: request.timeSignature } : {}),
      ...(request.durationSeconds ? { audio_duration: request.durationSeconds } : {}),
      ...(request.referenceAudioPath ? { reference_audio_path: request.referenceAudioPath } : {}),
      ...(request.sourceAudioPath ? { src_audio_path: request.sourceAudioPath } : {}),
    };

    const response = await fetch(`${baseUrl}/release_task`, {
      method: "POST",
      headers: authHeaders(runtimeToken),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
    const body = await parseResponse(response);
    const providerTaskId = body?.data?.task_id;
    if (!providerTaskId) throw new Error("ACE-Step did not return a task_id.");

    return {
      provider: "ace-step-1.5",
      providerTaskId,
      status: "queued",
      model: payload.model,
    };
  }

  async function query(providerTaskId) {
    const response = await fetch(`${baseUrl}/query_result`, {
      method: "POST",
      headers: authHeaders(runtimeToken),
      body: JSON.stringify({ task_id_list: [providerTaskId] }),
      signal: AbortSignal.timeout(30_000),
    });
    const body = await parseResponse(response);
    const task = Array.isArray(body?.data) ? body.data[0] : null;
    if (!task) throw new Error("ACE-Step returned no task status.");

    if (task.status === 0) {
      return { providerTaskId, status: "running", artifacts: [] };
    }

    if (task.status === 2) {
      return {
        providerTaskId,
        status: "failed",
        artifacts: [],
        error: { code: "provider_generation_failed", message: "ACE-Step generation failed." },
      };
    }

    let results = [];
    try {
      results = typeof task.result === "string" ? JSON.parse(task.result) : task.result || [];
    } catch {
      throw new Error("ACE-Step returned an unreadable result payload.");
    }

    const artifacts = results
      .filter((item) => item?.file)
      .map((item, index) => ({
        id: `${providerTaskId}:${index}`,
        kind: "master",
        uri: new URL(item.file, `${baseUrl}/`).toString(),
        providerPath: item.file,
        durationSeconds: item?.metas?.duration,
        mimeType: undefined,
        metadata: {
          bpm: item?.metas?.bpm,
          key: item?.metas?.keyscale,
          timeSignature: item?.metas?.timesignature,
          seed: item?.seed_value,
          lmModel: item?.lm_model,
          ditModel: item?.dit_model,
        },
      }));

    return {
      providerTaskId,
      status: "succeeded",
      artifacts,
      provider: "ace-step-1.5",
    };
  }

  async function listModels() {
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: authHeaders(runtimeToken),
      signal: AbortSignal.timeout(15_000),
    });
    return parseResponse(response);
  }

  return { submit, query, listModels };
}
