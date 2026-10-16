// Development-only loopback server. Database stays server-side; the game receives
// the same catalog.js exported during a configured Vercel build.
import http from 'node:http';
import path from 'node:path';
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {connectDatabase} from '../database.mjs';
import {gameCatalogScript} from '../catalog.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.avif':'image/avif',
  '.webp':'image/webp', '.mp3':'audio/mpeg', '.woff2':'font/woff2'};
export async function createJourneyPreview(database, port = 8770) {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405); res.end(); return;}
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (pathname === '/catalog.js') {
        const script = gameCatalogScript(await database.dictionary());
        res.writeHead(200, {'Content-Type':'text/javascript; charset=utf-8', 'Cache-Control':'no-store'});
        res.end(req.method === 'HEAD' ? undefined : script); return;
      }
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      const parts = relative.split('/');
      const allowed = parts.length === 1 ? /\.(html|js|css|txt)$/.test(relative) :
        ['assets', 'content', 'photo-library', 'demos'].includes(parts[0]);
      const filename = path.resolve(root, relative);
      if (!allowed || parts.some(p => p.startsWith('.')) || !filename.startsWith(root) || !(await stat(filename)).isFile()) {
        res.writeHead(404); res.end(); return;
      }
      const bytes = await readFile(filename);
      res.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream'});
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch {
      res.writeHead(503); res.end('Journey preview could not read the database or resource');
    }
  });
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(port, '127.0.0.1', resolve);});
  return {url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();
  })};
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const connection = await connectDatabase({local: process.argv.includes('--local')});
  const preview = await createJourneyPreview(connection.database, Number(process.env.PORT || 8770));
  console.log(`Journey database → SphereX preview: ${preview.url}`);
  const stop = async () => {await preview.close(); await connection.close(); process.exit();};
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
