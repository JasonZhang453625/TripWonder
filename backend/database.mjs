import {readFile, mkdir} from 'node:fs/promises';
import {validateDestinationId, validateJourney} from './journey.mjs';

// Injected query interface lets local PostgreSQL and Neon run the same SQL.
export class JourneyDatabase {
  constructor(connection) { this.connection = connection; }
  async initialize() {
    await this.connection.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  }
  async get(id) {
    validateDestinationId(id);
    const {rows} = await this.connection.query(
      'SELECT journey FROM destination_journeys WHERE destination_id = $1', [id]);
    return rows[0]?.journey ?? null;
  }
  async dictionary() {
    const {rows} = await this.connection.query(
      'SELECT destination_id, journey FROM destination_journeys ORDER BY destination_id');
    return Object.fromEntries(rows.map(row => [row.destination_id, row.journey]));
  }
  async save(id, journey) {
    const document = validateJourney(id, journey);
    await this.connection.query(`INSERT INTO destination_journeys (destination_id, journey)
      VALUES ($1, $2::jsonb) ON CONFLICT (destination_id)
      DO UPDATE SET journey = EXCLUDED.journey`, [id, JSON.stringify(document)]);
  }
  // Import missing destinations only: running the seed again never overwrites
  // photos or questions edited after the first import. One statement is atomic.
  async importMissing(dictionary) {
    const documents = Object.entries(dictionary).map(([id, journey]) => ({
      destination_id: id, journey: validateJourney(id, journey)
    }));
    const {rows} = await this.connection.query(`INSERT INTO destination_journeys (destination_id, journey)
      SELECT destination_id, journey FROM jsonb_to_recordset($1::jsonb)
      AS input(destination_id text, journey jsonb)
      ON CONFLICT (destination_id) DO NOTHING RETURNING destination_id`, [JSON.stringify(documents)]);
    return rows.map(row => row.destination_id);
  }
}

export async function connectDatabase({local = false} = {}) {
  if (local) {
    const {PGlite} = await import('@electric-sql/pglite');
    const directory = new URL('./.local/', import.meta.url);
    await mkdir(directory, {recursive: true});
    const db = new PGlite(new URL('journeys', directory).pathname);
    await db.waitReady;
    return {database: new JourneyDatabase(db), close: () => db.close()};
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; use --local for a local database');
  const {neon} = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  const connection = {query: (query, params = []) => sql.query(query, params, {fullResults: true})};
  return {database: new JourneyDatabase(connection), close: async () => {}};
}
