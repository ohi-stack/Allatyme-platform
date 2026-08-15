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
  | "stems";

export interface RightsAttestation {
  ownsPromptContent: boolean;
  ownsLyrics: boolean;
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
  durationSeconds?: number;
  candidateCount?: number;
  referenceAssetId?: string;
  rights: RightsAttestation;
}

export interface GenerationArtifact {
  id: string;
  kind: "master" | "preview" | "stem" | "waveform" | "metadata";
  uri: string;
  mimeType?: string;
  durationSeconds?: number;
}

export interface GenerationJob {
  id: string;
  request: GenerationRequest;
  status: GenerationStatus;
  provider?: string;
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
  if (!request.rights.ownsPromptContent || !request.rights.ownsLyrics) {
    throw new Error("Generation request requires rights attestation for prompt content and lyrics.");
  }

  if (request.referenceAssetId && request.rights.ownsReferenceAudio !== true) {
    throw new Error("Reference audio requires an explicit ownership or authorization attestation.");
  }
}
