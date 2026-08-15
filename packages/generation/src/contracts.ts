export type GenerationStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type GenerationMode =
  | "full-song"
  | "instrumental"
  | "extend"
  | "repaint"
  | "cover"
  | "add-layer"
  | "stems";

export type AudioFormat = "wav" | "wav32" | "flac" | "mp3" | "opus" | "aac";

export interface RightsAttestation {
  ownsPromptContent: boolean;
  ownsLyrics?: boolean;
  ownsReferenceAudio?: boolean;
  authorizedForModelUse?: boolean;
}

export interface GenerationRequest {
  requestId: string;
  userId: string;
  artistId?: string;
  title?: string;
  lyrics?: string;
  prompt: string;
  mode: GenerationMode;
  language?: string;
  genre?: string;
  subgenre?: string;
  mood?: string[];
  bpm?: number;
  key?: string;
  timeSignature?: "2" | "3" | "4" | "6";
  durationSeconds?: number;
  candidateCount?: number;
  outputFormat?: AudioFormat;
  thinking?: boolean;
  model?: string;
  referenceAssetId?: string;
  sourceAssetId?: string;
  masterTuningHz?: 432 | 440;
  rights: RightsAttestation;
}

export interface GenerationArtifact {
  id: string;
  kind: "master" | "preview" | "stem" | "waveform" | "metadata";
  uri: string;
  mimeType?: string;
  durationSeconds?: number;
  providerPath?: string;
}

export interface GenerationJob {
  id: string;
  request: GenerationRequest;
  status: GenerationStatus;
  provider?: string;
  providerTaskId?: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
  artifacts: GenerationArtifact[];
  error?: {
    code: string;
    message: string;
  };
}

export function assertGenerationRights(request: GenerationRequest): void {
  if (!request.rights?.ownsPromptContent) {
    throw new Error("Generation request requires rights attestation for prompt content.");
  }

  if (request.lyrics?.trim() && request.rights.ownsLyrics !== true) {
    throw new Error("Lyrics require an explicit ownership or authorization attestation.");
  }

  if (request.referenceAssetId && request.rights.ownsReferenceAudio !== true) {
    throw new Error("Reference audio requires an explicit ownership or authorization attestation.");
  }

  if (request.sourceAssetId && request.rights.ownsReferenceAudio !== true) {
    throw new Error("Source audio requires an explicit ownership or authorization attestation.");
  }
}
