# ALLATYME Generation Architecture

## Canonical product boundary

ALLATYME users interact with **ALLAWAVE™ — Music Creation Platform**.

ALLAWAVE sends normalized creative intent into **ARIA-1™ — Foundation Music Model**, which acts as the ALLATYME-owned planning/model-identity layer.

ARIA-1 plans are executed by **AMUSE™ Engine — Generation & Synthesis Engine**.

AMUSE dispatches provider-specific inference through `services/model-gateway`.

The current preferred provider is **ACE-Step 1.5**. YuE and DiffRhythm are retained as fallback/evaluation providers and must not be exposed as the public product identity.

```text
ALLAWAVE™
   ↓
ARIA-1™
   ↓
AMUSE™ Engine
   ↓
Model Gateway
   ↓
ACE-Step 1.5 (preferred)
YuE / DiffRhythm (fallback/evaluation)
```

## Responsibility boundaries

### ALLAWAVE™
- User-facing music creation product
- Collects song intent, lyrics, artist, genre, mood, BPM, key, duration and output preferences
- Collects rights attestations for prompt, lyrics and reference/source audio
- Displays ALLATYME job state and generated assets
- Must not expose third-party provider branding as the product identity

### ARIA-1™
- Foundation Music Model identity and planning boundary
- Normalizes prompts and generation controls
- Applies artist and catalog context when available
- Enforces request-level policy and rights requirements before execution
- Produces a provider-neutral `AriaPlan`
- Does not imply that ALLATYME currently owns or has trained a standalone foundation-model checkpoint; the current implementation is an orchestration/model-identity layer over approved generation runtimes

### AMUSE™ Engine
- Generation and synthesis execution layer
- Converts `AriaPlan` into an `AmuseDispatch`
- Selects the approved provider under provider policy
- Sends inference to the internal model gateway
- Coordinates generation modes including full-song, instrumental, extend, repaint, cover, add-layer and stems
- Returns provider-neutral artifacts to ALLAWAVE

### Model Gateway
- Internal provider adapter boundary
- Holds provider-specific API mapping
- Current provider implementation: `services/model-gateway/src/providers/ace-step.mjs`
- Third-party provider details remain internal
- Model weights are not committed to this repository

## Default provider policy

```json
{
  "preferredProvider": "ace-step-1.5",
  "fallbackProviders": ["yue", "diffrhythm"],
  "exposeProviderToClient": false
}
```

Fallback providers are architectural placeholders until adapters, license review, runtime infrastructure and acceptance tests are complete.

## Tuning

The default ALLATYME generation plan uses `masterTuningHz: 432` where applicable. A 440 Hz compatibility option remains available. Frequency selection is a production/branding control and must not be presented as a universal scientific constant.

## Security and rights

Generation requests must preserve the existing rights-attestation checks:
- Prompt content ownership/authorization
- Lyrics ownership/authorization when lyrics are supplied
- Reference/source audio ownership/authorization when audio conditioning or editing is requested

Runtime URLs, tokens and private storage locations stay in environment configuration and must not be committed.

## Implementation files

- `packages/generation/src/contracts.ts` — shared generation job contracts
- `packages/generation/src/architecture.ts` — ALLAWAVE → ARIA-1 → AMUSE contracts and plan builders
- `apps/worker/src/architecture.mjs` — runtime ARIA-1 planner and AMUSE dispatch adapter
- `services/model-gateway/src/server.mjs` — internal model gateway
- `services/model-gateway/src/providers/ace-step.mjs` — ACE-Step provider adapter

## Current execution path

1. ALLAWAVE generation request enters `generation-api`.
2. The worker builds an ARIA-1 plan.
3. The worker converts the plan into an AMUSE dispatch.
4. The model gateway maps the AMUSE payload to the configured ACE-Step runtime.
5. The worker polls generation, applies audio processing/tuning, ingests media, and stores final artifacts.

This keeps product semantics, policy, provider selection and third-party runtime integration separated and testable.
