export interface ArtistSoundProfile {
  artistId: string;
  version: number;
  status: "draft" | "approved" | "retired";
  identity: {
    displayName: string;
    registryCode?: string;
    primaryGenre: string;
    secondaryGenres?: string[];
    languages?: string[];
    emotionalLane?: string;
  };
  composition: {
    bpmRange?: [number, number];
    preferredKeys?: string[];
    timeSignatures?: string[];
    instrumentation?: string[];
    arrangementNotes?: string[];
    hookCharacteristics?: string[];
    avoid?: string[];
  };
  vocals?: {
    presentation?: "female" | "male" | "mixed" | "instrumental";
    character?: string[];
    delivery?: string[];
    signatureIntro?: string[];
    recurringAdlibs?: string[];
  };
  generation: {
    promptPrefix?: string;
    promptSuffix?: string;
    defaultDurationSeconds?: number;
    defaultCandidateCount?: number;
    enhancedPlanning?: boolean;
  };
  delivery?: {
    tuningReferenceHz?: 432 | 440;
    targetLufs?: number;
    preferredFormats?: Array<"wav" | "flac" | "mp3" | "opus" | "aac">;
  };
  provenance: {
    authoredBy: string;
    approvedForGeneration: boolean;
    trainingAssetsAuthorized: boolean;
    notes?: string[];
  };
}

export function buildArtistPrompt(profile: ArtistSoundProfile, creativeDirection: string): string {
  const parts = [
    profile.generation.promptPrefix,
    `Artist identity: ${profile.identity.displayName}.`,
    `Primary genre: ${profile.identity.primaryGenre}.`,
    profile.identity.secondaryGenres?.length ? `Secondary genres: ${profile.identity.secondaryGenres.join(", ")}.` : undefined,
    profile.identity.emotionalLane ? `Emotional lane: ${profile.identity.emotionalLane}.` : undefined,
    profile.composition.instrumentation?.length ? `Preferred instrumentation: ${profile.composition.instrumentation.join(", ")}.` : undefined,
    profile.composition.arrangementNotes?.length ? `Arrangement: ${profile.composition.arrangementNotes.join(" ")}` : undefined,
    profile.composition.hookCharacteristics?.length ? `Hook direction: ${profile.composition.hookCharacteristics.join("; ")}.` : undefined,
    profile.composition.avoid?.length ? `Avoid: ${profile.composition.avoid.join("; ")}.` : undefined,
    creativeDirection,
    profile.generation.promptSuffix,
  ];
  return parts.filter(Boolean).join(" ").trim();
}
