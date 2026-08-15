# Audio Processing Service

Internal post-generation audio pipeline.

V0.1 performs delivery normalization and applies the requested 432 Hz or 440 Hz reference before storage. The 432 Hz path uses FFmpeg's `rubberband` pitch filter at the exact 432/440 ratio so duration is preserved. If the runtime FFmpeg build does not contain the rubberband filter, processing fails explicitly; the service never labels unprocessed 440 Hz audio as 432 Hz.

Requirements:
- FFmpeg on `PATH` (or `FFMPEG_PATH`)
- FFmpeg build with `rubberband` for 432 Hz processing
- `AUDIO_SOURCE_ALLOWLIST` containing approved model-runtime origins
- `INTERNAL_SERVICE_TOKEN` in production

This is a controlled delivery-processing stage, not a claim of full professional mastering parity.
