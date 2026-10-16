import {connectDatabase} from '../database.mjs';
import {loadExistingJourneys} from '../import-catalog.mjs';

// Node --env-file is optional; Vercel supplies DATABASE_URL to server processes.
const args = process.argv.slice(2);
const local = args.includes('--local');
const [command, id] = args.filter(arg => arg !== '--local');
if (!['init', 'seed', 'get'].includes(command) || (command === 'get' && !id)) {
  console.error('Usage: database.mjs init|seed|get <destination-id> [--local]');
  process.exitCode = 1;
} else {
  let connection;
  try {
    // Validate all source materials before touching a seed target.
    const dictionary = command === 'seed' ? loadExistingJourneys() : undefined;
    connection = await connectDatabase({local});
    if (command === 'init') {
      await connection.database.initialize();
      console.log('Journey table initialized');
    } else if (command === 'seed') {
      const inserted = await connection.database.importMissing(dictionary);
      console.log(JSON.stringify({imported: inserted, existingSkipped: Object.keys(dictionary).length - inserted.length}));
    } else {
      const journey = await connection.database.get(id);
      if (!journey) throw new Error('Destination not found');
      console.log(JSON.stringify(journey, null, 2));
    }
  } catch (error) {
    // Do not print driver errors which may contain a connection string.
    console.error(error instanceof TypeError ? error.message : 'Database command failed; check configuration, schema and destination ID.');
    process.exitCode = 1;
  } finally { await connection?.close(); }
}
