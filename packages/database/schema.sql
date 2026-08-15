CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_code TEXT UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_sound_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artist_id, version)
);

CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  mode TEXT NOT NULL,
  provider TEXT,
  provider_task_id TEXT,
  model TEXT,
  request JSONB NOT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  error JSONB,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS provider_task_id TEXT;
ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS generation_jobs_status_created_idx
  ON generation_jobs (status, created_at);
CREATE INDEX IF NOT EXISTS generation_jobs_user_created_idx
  ON generation_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS generation_jobs_provider_task_idx
  ON generation_jobs (provider_task_id) WHERE provider_task_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL,
  owner_id UUID,
  kind TEXT NOT NULL,
  uri TEXT NOT NULL,
  mime_type TEXT,
  storage_provider TEXT,
  object_key TEXT,
  checksum_sha256 TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS storage_provider TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS object_key TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT;
CREATE INDEX IF NOT EXISTS media_assets_owner_idx ON media_assets (owner_type, owner_id);
