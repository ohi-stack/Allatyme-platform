export const ALLATYME_GENERATION_ARCHITECTURE = {
  product: "ALLATYME AURA",
  foundationModel: "ARIA-1",
  synthesisEngine: "AMUSE",
} as const;

export type AuraSurface = "web" | "admin" | "api" | "worker";

export interface AuraGenerationIntent {
  requestId: string;
  userId: string;
  surface: AuraSurface;
  artistId?: string;
  title?: string;
  lyrics?: string;
  prompt: string;
  mode: "full-song" | "instrumental" | "extend" | "repaint" | "cover" | "add-layer" | "stems";
  language?: string;
  genre?: string;
  subgenre?: string;
  mood?: string[];
  bpm?: number;
  key?: string;
  timeSignature?: "2" | "3" | "4" | "6";
  durationSeconds?: number;
  candidateCount?: number;
  outputFormat?: "wav" | "wav32" | "flac" | "mp3" | "opus" | "aac";
  referenceAssetId?: string;
  sourceAssetId?: string;
  masterTuningHz?: 432 | 440;
  rights: {
    ownsPromptContent: boolean;
    ownsLyrics?: boolean;
    ownsReferenceAudio?: boolean;
    authorizedForModelUse?: boolean;
  };
}

export interface AriaPlan {
  architecture: typeof ALLATYME_GENERATION_ARCHITECTURE;
  requestId: string;
  normalizedPrompt: string;
  normalizedLyrics?: string;
  mode: AuraGenerationIntent["mode"];
  metadata: {
    artistId?: string;
    language: string;
    genre?: string;
    subgenre?: string;
    mood: string[];
    bpm?: number;
    key?: string;
    timeSignature?: "2" | "3" | "4" | "6";
    durationSeconds?: number;
    candidateCount: number;
    outputFormat: NonNullable<AuraGenerationIntent["outputFormat"]>;
    masterTuningHz: 432 | 440;
  };
  assets: {
    referenceAssetId?: string;
    sourceAssetId?: string;
  };
  rights: AuraGenerationIntent["rights"];
  providerPolicy: {
    preferredProvider: "ace-step-1.5";
    fallbackProviders: Array<"yue" | "diffrhythm">;
    exposeProviderToClient: false;
  };
}

export interface AmuseDispatch {
  requestId: string;
  engine: "AMUSE";
  modelIdentity: "ARIA-1";
  provider: "ace-step-1.5" | "yue" | "diffrhythm";
  payload: {
    prompt: string;
    lyrics?: string;
    mode: AuraGenerationIntent["mode"];
    language: string;
    genre?: string;
    subgenre?: string;
    mood?: string[];
    bpm?: number;
    key?: string;
    timeSignature?: "2" | "3" | "4" | "6";
    durationSeconds?: number;
    candidateCount: number;
    outputFormat: NonNullable<AuraGenerationIntent["outputFormat"]>;
    masterTuningHz: 432 | 440;
    referenceAssetId?: string;
    sourceAssetId?: string;
    rights: AuraGenerationIntent["rights"];
  };
}

export function buildAriaPlan(intent: AuraGenerationIntent): AriaPlan {
  const prompt = intent.prompt?.trim();
  if (!prompt) throw new Error("ALLATYME AURA requires a generation prompt.");
  if (!intent.rights?.ownsPromptContent) {
    throw new Error("ALLATYME AURA requires rights attestation for prompt content.");
  }
  if (intent.lyrics?.trim() && intent.rights.ownsLyrics !== true) {
    throw new Error("ARIA-1 requires explicit ownership or authorization for supplied lyrics.");
  }
  if ((intent.referenceAssetId || intent.sourceAssetId) && intent.rights.ownsReferenceAudio !== true) {
    throw new Error("ARIA-1 requires explicit ownership or authorization for supplied audio.");
  }

  return {
    architecture: ALLATYME_GENERATION_ARCHITECTURE,
    requestId: intent.requestId,
    normalizedPrompt: prompt,
    normalizedLyrics: intent.lyrics?.trim() || undefined,
    mode: intent.mode,
    metadata: {
      artistId: intent.artistId,
      language: intent.language || "en",
      genre: intent.genre,
      subgenre: intent.subgenre,
      mood: intent.mood || [],
      bpm: intent.bpm,
      key: intent.key,
      timeSignature: intent.timeSignature,
      durationSeconds: intent.durationSeconds,
      candidateCount: Math.min(Math.max(intent.candidateCount || 2, 1), 8),
      outputFormat: intent.outputFormat || "wav",
      masterTuningHz: intent.masterTuningHz || 432,
    },
    assets: {
      referenceAssetId: intent.referenceAssetId,
      sourceAssetId: intent.sourceAssetId,
    },
    rights: intent.rights,
    providerPolicy: {
      preferredProvider: "ace-step-1.5",
      fallbackProviders: ["yue", "diffrhythm"],
      exposeProviderToClient: false,
    },
  };
}

export function buildAmuseDispatch(plan: AriaPlan): AmuseDispatch {
  return {
    requestId: plan.requestId,
    engine: "AMUSE",
    modelIdentity: "ARIA-1",
    provider: plan.providerPolicy.preferredProvider,
    payload: {
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
    },
  };
}
