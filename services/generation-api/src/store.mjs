import pg from "pg";
import { createClient } from "redis";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;
const queueKey = process.env.GENERATION_QUEUE_KEY || "allatyme:generation:queued";

if (!databaseUrl) throw new Error("DATABASE_URL is required for durable generation persistence.");
if (!redisUrl) throw new Error("REDIS_URL is required for the durable generation queue.");

const pool = new Pool({ connectionString: databaseUrl, max: Number(process.env.DB_POOL_MAX || 10) });
const redis = createClient({ url: redisUrl });
redis.on("error", (error) => console.error("[generation-api] redis error", error));

function rowToJob(row) {
  if (!row) return null;
  const result = row.result || {};
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
    completedAt: row.completed_at?.toISOString?.() || row.completed_at || null,
    provider: row.provider || null,
    providerTaskId: row.provider_task_id || null,
    model: row.model || null,
    attemptCount: row.attempt_count || 0,
    artifacts: Array.isArray(result.artifacts) ? result.artifacts : [],
    request: row.request,
    error: row.error || undefined,
  };
}

export async function initStore() {
  if (!redis.isOpen) await redis.connect();
  await pool.query("SELECT 1");
  await redis.ping();
}

export async function closeStore() {
  await Promise.allSettled([pool.end(), redis.isOpen ? redis.quit() : Promise.resolve()]);
}

export async function healthSnapshot() {
  const [{ rows }, redisState] = await Promise.all([
    pool.query(`SELECT status, COUNT(*)::int AS count FROM generation_jobs GROUP BY status`),
    redis.ping(),
  ]);
  const counts = Object.fromEntries(rows.map((row) => [row.status, row.count]));
  return { postgres: "ok", redis: redisState === "PONG" ? "ok" : redisState, counts };
}

export async function createJob(job) {
  const { rows } = await pool.query(
    `INSERT INTO generation_jobs (id, user_id, status, mode, request, result)
     VALUES ($1, $2, 'queued', $3, $4::jsonb, '{}'::jsonb)
     RETURNING *`,
    [job.id, job.request.userId, job.request.mode, JSON.stringify(job.request)],
  );
  await redis.lPush(queueKey, job.id);
  return rowToJob(rows[0]);
}

export async function getJob(id) {
  const { rows } = await pool.query(`SELECT * FROM generation_jobs WHERE id = $1`, [id]);
  return rowToJob(rows[0]);
}

export async function listJobs({ userId, limit = 25, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const values = [];
  let where = "";
  if (userId) {
    values.push(userId);
    where = `WHERE user_id = $${values.length}`;
  }
  values.push(safeLimit, safeOffset);
  const limitRef = `$${values.length - 1}`;
  const offsetRef = `$${values.length}`;
  const { rows } = await pool.query(
    `SELECT * FROM generation_jobs ${where} ORDER BY created_at DESC LIMIT ${limitRef} OFFSET ${offsetRef}`,
    values,
  );
  return rows.map(rowToJob);
}

async function claimById(id) {
  const { rows } = await pool.query(
    `UPDATE generation_jobs
       SET status = 'running', claimed_at = NOW(), updated_at = NOW(), attempt_count = attempt_count + 1
     WHERE id = $1 AND status = 'queued'
     RETURNING *`,
    [id],
  );
  return rowToJob(rows[0]);
}

export async function claimNextJob() {
  for (let i = 0; i < 10; i += 1) {
    const id = await redis.rPop(queueKey);
    if (!id) break;
    const job = await claimById(id);
    if (job) return job;
  }

  // Repair path: Postgres is authoritative if a Redis enqueue was lost.
  const { rows } = await pool.query(
    `UPDATE generation_jobs
       SET status = 'running', claimed_at = NOW(), updated_at = NOW(), attempt_count = attempt_count + 1
     WHERE id = (
       SELECT id FROM generation_jobs
       WHERE status = 'queued'
       ORDER BY created_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING *`,
  );
  return rowToJob(rows[0]);
}

export async function setProvider(id, { provider, providerTaskId, model }) {
  const { rows } = await pool.query(
    `UPDATE generation_jobs
       SET provider = COALESCE($2, provider),
           provider_task_id = COALESCE($3, provider_task_id),
           model = COALESCE($4, model),
           updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, provider || null, providerTaskId || null, model || null],
  );
  return rowToJob(rows[0]);
}

export async function completeJob(id, { provider, model, artifacts = [] }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE generation_jobs
         SET status = 'succeeded',
             provider = COALESCE($2, provider),
             model = COALESCE($3, model),
             result = $4::jsonb,
             error = NULL,
             completed_at = NOW(),
             updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, provider || null, model || null, JSON.stringify({ artifacts })],
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    for (const artifact of artifacts) {
      await client.query(
        `INSERT INTO media_assets (owner_type, owner_id, kind, uri, mime_type, storage_provider, object_key, checksum_sha256, metadata)
         VALUES ('generation_job', $1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
        [
          id,
          artifact.kind || "master",
          artifact.uri,
          artifact.mimeType || null,
          artifact.storageProvider || null,
          artifact.objectKey || null,
          artifact.checksumSha256 || null,
          JSON.stringify(artifact.metadata || {}),
        ],
      );
    }

    await client.query("COMMIT");
    return rowToJob(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function failJob(id, { code, message }) {
  const { rows } = await pool.query(
    `UPDATE generation_jobs
       SET status = 'failed', error = $2::jsonb, completed_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, JSON.stringify({ code: code || "generation_failed", message: message || "Generation failed." })],
  );
  return rowToJob(rows[0]);
}
