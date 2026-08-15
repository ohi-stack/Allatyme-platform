# Artists Package

Shared AMG artist identity, registry, and sound-profile contracts.

`ArtistSoundProfile` is the generation-facing identity layer for an artist. It stores composition, vocal, arrangement, signature-intro, delivery, and provenance constraints without embedding model weights or training audio.

Production rule: an artist profile may guide prompting when `approvedForGeneration=true`; training/fine-tuning assets require a separate rights record and `trainingAssetsAuthorized=true`.
