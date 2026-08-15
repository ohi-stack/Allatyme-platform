const ARCHITECTURE = Object.freeze({
  product: "ALLATYME AURA",
  foundationModel: "ARIA-1",
  synthesisEngine: "AMUSE",
});

export function buildAriaPlan(request) {
  const prompt = request?.prompt?.trim();
  if (!prompt) throw new Error("ALLATYME AURA requires a generation prompt.");
  if (!request?.rights?.ownsPromptContent) throw new Error("Prompt-content rights attestation is required.");
  if (request.lyrics?.trim() && request.rights?.ownsLyrics !== true) {
    throw new Error("Lyrics rights attestation is required.");
  }
  if ((request.referenceAssetId || request.sourceAssetId) && request.rights?.ownsReferenceAudio !== true) {
    throw new Error("Reference/source audio requires explicit ownership or authorization attestation.");
  }

  return {
    architecture: ARCHITECTURE,
    requestId: request.requestId,
    normalizedPrompt: prompt,
    normalizedLyrics: request.lyrics?.trim() || undefined,
    mode: request.mode,
    metadata: {
      artistId: request.artistId,
      language: request.language || "en",
      genre: request.genre,
      subgenre: request.subgenre,
      mood: Array.isArray(request.mood) ? request.mood : [],
      bpm: request.bpm,
      key: request.key,
      timeSignature: request.timeSignature,
      durationSeconds: request.durationSeconds,
      candidateCount: Math.min(Math.max(Number(request.candidateCount || 2), 1), 8),
      outputFormat: request.outputFormat || "wav",
      masterTuningHz: Number(request.masterTuningHz || 432),
    },
    assets: {
      referenceAssetId: request.referenceAssetId,
      sourceAssetId: request.sourceAssetId,
    },
    rights: request.rights,
    providerPolicy: {
      preferredProvider: "ace-step-1.5",
      fallbackProviders: ["yue", "diffrhythm"],
      exposeProviderToClient: false,
    },
  };
}

export function buildAmuseDispatch(plan) {
  return {
    requestId: plan.requestId,
    engine: "AMUSE",
    modelIdentity: "ARIA-1",
    providerPolicy: plan.providerPolicy,
    prompt: plan.normalizedPrompt,
    lyrics: plan.normalizedLyrics,
    mode: plan.mode,
    language: plan.metadata.language,
    genre: plan.metadata.genre,
    subgenre: plan.metadata.subgenre,
    mood: plan.metadata.mood,
    bpm: plan.metadata.bpm,
    key: plan.metadata.key,
    timeSignature: plan.metadata.timeSignature,
    durationSeconds: plan.metadata.durationSeconds,
    candidateCount: plan.metadata.candidateCount,
    outputFormat: plan.metadata.outputFormat,
    masterTuningHz: plan.metadata.masterTuningHz,
    referenceAssetId: plan.assets.referenceAssetId,
    sourceAssetId: plan.assets.sourceAssetId,
    rights: plan.rights,
  };
}

export function publicGenerationIdentity() {
  return { product: "ALLATYME AURA", model: "ARIA-1", engine: "AMUSE" };
}
