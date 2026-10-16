// SQLite store (node:sqlite): journey documents, their status, and generation jobs.
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ADMIN_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(ADMIN_DIR, 'data');
fs.mkdirSync(DATA_DIR, {recursive: true});

export const db = new DatabaseSync(process.env.TRIPWONDER_DB || path.join(DATA_DIR, 'tripwonder.db'));
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS destination_journeys (
  destination_id TEXT PRIMARY KEY CHECK (length(destination_id) BETWEEN 1 AND 80),
  journey TEXT NOT NULL CHECK (json_valid(journey))
);
CREATE TABLE IF NOT EXISTS journey_meta (
  destination_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  review TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  input TEXT NOT NULL,
  steps TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '{}',
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);
// journey_meta.status: ready | disabled.  jobs.status: queued | running | done | failed.

const now = () => new Date().toISOString();
const parse = text => (text == null ? null : JSON.parse(text));

export function listJourneys() {
  return db.prepare(`SELECT j.journey, m.status, m.review, m.created_at AS createdAt
    FROM destination_journeys j JOIN journey_meta m USING (destination_id) ORDER BY m.created_at`).all()
    .map(row => ({...parse(row.journey), status: row.status, review: row.review, createdAt: row.createdAt}));
}
export function getJourney(id) {
  const row = db.prepare('SELECT journey FROM destination_journeys WHERE destination_id = ?').get(id);
  return row ? parse(row.journey) : null;
}
export function saveJourney(id, journey, {status = 'ready', review = 'pending'} = {}) {
  const t = now();
  db.exec('BEGIN');
  try {
    db.prepare(`INSERT INTO destination_journeys (destination_id, journey) VALUES (?, ?)
      ON CONFLICT(destination_id) DO UPDATE SET journey = excluded.journey`).run(id, JSON.stringify(journey));
    db.prepare(`INSERT INTO journey_meta (destination_id, status, review, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(destination_id) DO UPDATE SET status = excluded.status, review = excluded.review, updated_at = excluded.updated_at`)
      .run(id, status, review, t, t);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function setStatus(id, status) {
  return db.prepare('UPDATE journey_meta SET status = ?, updated_at = ? WHERE destination_id = ?').run(status, now(), id).changes > 0;
}
export function setReview(id, review) {
  return db.prepare('UPDATE journey_meta SET review = ?, updated_at = ? WHERE destination_id = ?').run(review, now(), id).changes > 0;
}
export function deleteJourney(id) {
  db.prepare('DELETE FROM destination_journeys WHERE destination_id = ?').run(id);
  db.prepare('DELETE FROM journey_meta WHERE destination_id = ?').run(id);
}

const jobRow = row => row && ({...row, input: parse(row.input), steps: parse(row.steps), state: parse(row.state)});
export function createJob(job) {
  const t = now();
  db.prepare(`INSERT INTO jobs (id, destination_id, name, status, input, steps, state, created_at, updated_at)
    VALUES (?, ?, ?, 'queued', ?, ?, '{}', ?, ?)`).run(job.id, job.destinationId, job.name, JSON.stringify(job.input), JSON.stringify(job.steps), t, t);
}
export function getJob(id) { return jobRow(db.prepare('SELECT * FROM jobs WHERE id = ?').get(id)); }
export function listJobs() { return db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all().map(jobRow); }
export function updateJob(id, patch) {
  const next = {...getJob(id), ...patch};
  db.prepare('UPDATE jobs SET status = ?, steps = ?, state = ?, error = ?, updated_at = ? WHERE id = ?')
    .run(next.status, JSON.stringify(next.steps), JSON.stringify(next.state), next.error ?? null, now(), id);
}
export function deleteJob(id) { db.prepare('DELETE FROM jobs WHERE id = ?').run(id); }
// A job left running by a crashed process can never finish by itself.
export function failStaleJobs() {
  db.prepare(`UPDATE jobs SET status = 'failed', error = '服务重启，任务中断，可点击重试继续', updated_at = ? WHERE status IN ('running','queued')`).run(now());
}
