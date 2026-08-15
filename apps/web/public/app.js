const API = window.ALLATYME_GENERATION_API_URL || "http://localhost:4100";
const form = document.querySelector("#generatorForm");
const generateButton = document.querySelector("#generateButton");
const apiStatus = document.querySelector("#apiStatus");
const jobStatus = document.querySelector("#jobStatus");
const emptyState = document.querySelector("#emptyState");
const jobDetails = document.querySelector("#jobDetails");
const jobId = document.querySelector("#jobId");
const jobProvider = document.querySelector("#jobProvider");
const jobModel = document.querySelector("#jobModel");
const jobUpdated = document.querySelector("#jobUpdated");
const jobError = document.querySelector("#jobError");
const artifacts = document.querySelector("#artifacts");

let pollTimer = null;

function setStatus(element, text, tone = "neutral") {
  element.textContent = text;
  element.className = `status-pill ${tone}`;
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.error || `${response.status} ${response.statusText}`);
  return body;
}

async function checkHealth() {
  try {
    const health = await api("/health");
    setStatus(apiStatus, `Generation API online · ${health.queue?.queued || 0} queued`, "good");
  } catch {
    setStatus(apiStatus, "Generation API offline", "bad");
  }
}

function numberOrUndefined(value) {
  if (value === "" || value == null) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function renderArtifacts(items = []) {
  artifacts.innerHTML = "";
  if (!items.length) return;

  items.forEach((item, index) => {
    const card = document.createElement("section");
    card.className = "artifact";
    const header = document.createElement("header");
    header.innerHTML = `<strong>Candidate ${index + 1}</strong><span>${item.durationSeconds ? `${Math.round(item.durationSeconds)}s` : item.kind || "master"}</span>`;
    card.append(header);

    if (item.uri) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = item.uri;
      card.append(audio);

      const link = document.createElement("a");
      link.href = item.uri;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open generated audio ↗";
      card.append(link);
    }
    artifacts.append(card);
  });
}

function renderJob(job) {
  emptyState.classList.add("hidden");
  jobDetails.classList.remove("hidden");
  jobId.textContent = job.id || "—";
  jobProvider.textContent = job.provider || "Waiting for worker";
  jobModel.textContent = job.model || job.request?.model || "Runtime default";
  jobUpdated.textContent = job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "—";

  const tone = job.status === "succeeded" ? "good" : job.status === "failed" ? "bad" : "busy";
  setStatus(jobStatus, job.status || "unknown", tone);

  if (job.error?.message) {
    jobError.textContent = job.error.message;
    jobError.classList.remove("hidden");
  } else {
    jobError.textContent = "";
    jobError.classList.add("hidden");
  }

  renderArtifacts(job.artifacts || []);
}

async function pollJob(id) {
  clearTimeout(pollTimer);
  try {
    const job = await api(`/v1/generations/${encodeURIComponent(id)}`);
    renderJob(job);
    if (["queued", "running"].includes(job.status)) {
      pollTimer = setTimeout(() => pollJob(id), 2500);
    } else {
      generateButton.disabled = false;
      generateButton.textContent = "Generate song";
      await checkHealth();
    }
  } catch (error) {
    setStatus(jobStatus, "Polling error", "bad");
    jobError.textContent = error.message;
    jobError.classList.remove("hidden");
    generateButton.disabled = false;
    generateButton.textContent = "Generate song";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearTimeout(pollTimer);
  const data = new FormData(form);
  const lyrics = String(data.get("lyrics") || "").trim();

  if (lyrics && data.get("ownsLyrics") !== "on") {
    alert("Confirm that you own or are authorized to use the lyrics before generation.");
    return;
  }

  const payload = {
    title: String(data.get("title") || "").trim() || undefined,
    artistId: String(data.get("artistId") || "").trim() || undefined,
    prompt: String(data.get("prompt") || "").trim(),
    lyrics: lyrics || undefined,
    mode: String(data.get("mode") || "full-song"),
    genre: String(data.get("genre") || "").trim() || undefined,
    subgenre: String(data.get("subgenre") || "").trim() || undefined,
    mood: String(data.get("mood") || "").split(",").map((value) => value.trim()).filter(Boolean),
    language: String(data.get("language") || "en").trim() || "en",
    bpm: numberOrUndefined(data.get("bpm")),
    key: String(data.get("key") || "").trim() || undefined,
    timeSignature: String(data.get("timeSignature") || "4"),
    durationSeconds: numberOrUndefined(data.get("durationSeconds")),
    candidateCount: numberOrUndefined(data.get("candidateCount")),
    outputFormat: String(data.get("outputFormat") || "wav"),
    masterTuningHz: numberOrUndefined(data.get("masterTuningHz")),
    model: String(data.get("model") || "").trim() || undefined,
    thinking: data.get("thinking") === "on",
    rights: {
      ownsPromptContent: data.get("ownsPromptContent") === "on",
      ownsLyrics: lyrics ? data.get("ownsLyrics") === "on" : true,
    },
  };

  generateButton.disabled = true;
  generateButton.textContent = "Submitting…";
  setStatus(jobStatus, "Submitting", "busy");
  artifacts.innerHTML = "";
  jobError.classList.add("hidden");

  try {
    const job = await api("/v1/generations", { method: "POST", body: JSON.stringify(payload) });
    renderJob(job);
    generateButton.textContent = "Generating…";
    pollJob(job.id);
  } catch (error) {
    setStatus(jobStatus, "Submission failed", "bad");
    emptyState.classList.add("hidden");
    jobDetails.classList.remove("hidden");
    jobError.textContent = error.message;
    jobError.classList.remove("hidden");
    generateButton.disabled = false;
    generateButton.textContent = "Generate song";
  }
});

checkHealth();
setInterval(checkHealth, 15000);
