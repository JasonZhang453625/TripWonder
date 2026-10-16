// Local admin + preview server for TripWonder.
//   node admin/server.mjs            -> http://127.0.0.1:8787/photos.html
// Serves the static prototype, the /api used by photos.html / journey-new.html, and
// /db-journeys.js, which hands journeys stored in SQLite to the game (index.html).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {
  listJourneys, getJourney, setStatus, setReview, deleteJourney, createJob, getJob, listJobs, updateJob, deleteJob, failStaleJobs
} from './db.mjs';
import {hasKey, MODEL} from './mimo.mjs';
import {ROOT, UPLOAD_DIR, STEPS, DEFAULT_RULES, normalizeInput, startJob, isRunning, findUpload} from './pipeline.mjs';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); } catch {
  sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
}
const PORT = Number(process.env.PORT || 8787), HOST = '127.0.0.1';
const MAX_UPLOAD = 60 * 1024 * 1024;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.md': 'text/markdown; charset=utf-8'
};

failStaleJobs();

const send = (res, status, body, headers = {}) => {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {'Content-Type': typeof body === 'object' && !Buffer.isBuffer(body) ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...headers});
  res.end(data);
};
const readBody = (req, limit) => new Promise((resolve, reject) => {
  const chunks = []; let size = 0;
  req.on('data', chunk => { size += chunk.length; if (size > limit) { reject(Object.assign(new Error('文件过大'), {status: 413})); req.destroy(); } else chunks.push(chunk); });
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});
const readJson = async req => { try { return JSON.parse((await readBody(req, 2e6)).toString('utf8') || '{}'); } catch { throw Object.assign(new Error('请求内容不是有效 JSON'), {status: 400}); } };

// Journeys that finished generation and were not switched off are what the game loads.
const playable = () => listJourneys().filter(j => j.status === 'ready').map(j => ({...j, source: 'db'}));

function publicJob(job) {
  const {input, state, ...rest} = job;
  return {...rest, running: isRunning(job.id), sceneCount: input.scenes.length};
}

async function api(req, res, url) {
  const {pathname} = url, method = req.method;
  if (method !== 'GET') {   // local-only tool: refuse cross-site browser requests
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return send(res, 403, {error: '跨站请求被拒绝'});
  }
  if (pathname === '/api/status' && method === 'GET') return send(res, 200, {ok: true, hasKey: hasKey(), model: MODEL, defaults: DEFAULT_RULES, steps: STEPS});
  if (pathname === '/api/journeys' && method === 'GET') {
    const jobs = listJobs().filter(job => job.status !== 'done').map(publicJob);
    return send(res, 200, {journeys: listJourneys(), jobs});
  }
  if (pathname === '/api/uploads' && method === 'POST') {
    const body = await readBody(req, MAX_UPLOAD);
    let meta;
    try { meta = await sharp(body).metadata(); } catch { return send(res, 400, {error: '无法识别为图片'}); }
    if (!['jpeg', 'png', 'webp', 'avif', 'heif'].includes(meta.format)) return send(res, 400, {error: `不支持的图片格式：${meta.format}`});
    if (Math.min(meta.width, meta.height) < 600) return send(res, 400, {error: '图片太小（短边需 ≥ 600 px）'});
    const uploadId = crypto.randomUUID();
    fs.writeFileSync(path.join(UPLOAD_DIR, uploadId + '.upload'), body);
    return send(res, 200, {uploadId, width: meta.width, height: meta.height, format: meta.format});
  }
  if (pathname === '/api/journeys' && method === 'POST') {
    const input = normalizeInput(await readJson(req));
    if (getJourney(input.id)) return send(res, 409, {error: `目的地「${input.id}」已存在`});
    const jobs = listJobs().filter(job => job.destinationId === input.id);
    if (jobs.some(job => job.status === 'queued' || job.status === 'running')) return send(res, 409, {error: '该目的地正在生成中'});
    for (const old of jobs) deleteJob(old.id);
    const id = crypto.randomUUID();
    createJob({id, destinationId: input.id, name: input.name, input, steps: STEPS.map(s => ({...s, status: 'pending', detail: ''}))});
    startJob(id);
    return send(res, 202, {jobId: id});
  }
  let m;
  if ((m = pathname.match(/^\/api\/jobs\/([a-f0-9-]{36})(\/retry)?$/))) {
    const job = getJob(m[1]);
    if (!job) return send(res, 404, {error: '任务不存在'});
    if (method === 'GET') return send(res, 200, publicJob(job));
    if (method === 'POST' && m[2]) {
      if (job.status !== 'failed' || isRunning(job.id)) return send(res, 409, {error: '只有失败的任务可以重试'});
      const missing = job.input.scenes.find(scene => !findUpload(scene.uploadId));
      if (missing) return send(res, 410, {error: `「${missing.name}」的上传文件已丢失，请重新添加`});
      updateJob(job.id, {steps: job.steps.map(s => s.status === 'failed' || s.status === 'running' ? {...s, status: 'pending', detail: ''} : s), status: 'queued', error: null});
      startJob(job.id);
      return send(res, 202, {jobId: job.id});
    }
    if (method === 'DELETE') {
      if (isRunning(job.id)) return send(res, 409, {error: '任务正在运行'});
      for (const scene of job.input.scenes) { const f = findUpload(scene.uploadId); if (f) fs.rmSync(f, {force: true}); }
      deleteJob(job.id);
      return send(res, 200, {ok: true});
    }
  }
  if ((m = pathname.match(/^\/api\/journeys\/([a-z][a-z0-9-]{0,79})(?:\/(status|review))?$/))) {
    const id = m[1], journey = getJourney(id);
    if (!journey) return send(res, 404, {error: '目的地不存在'});
    if (method === 'GET' && !m[2]) return send(res, 200, journey);
    if (method === 'POST' && m[2] === 'status') {
      const {status} = await readJson(req);
      if (!['ready', 'disabled'].includes(status)) return send(res, 400, {error: 'status 无效'});
      setStatus(id, status); return send(res, 200, {ok: true});
    }
    if (method === 'POST' && m[2] === 'review') {
      const {review} = await readJson(req);
      if (!['pending', 'approved'].includes(review)) return send(res, 400, {error: 'review 无效'});
      setReview(id, review); return send(res, 200, {ok: true});
    }
    if (method === 'DELETE' && !m[2]) {
      deleteJourney(id);
      fs.rmSync(path.join(ROOT, 'photo-library', id), {recursive: true, force: true});
      for (const job of listJobs().filter(j => j.destinationId === id)) deleteJob(job.id);
      return send(res, 200, {ok: true});
    }
  }
  return send(res, 404, {error: '接口不存在'});
}

// The game reads this script; a static deploy simply omits it.
function dbScript(url, res) {
  const journeys = playable();
  const slim = journeys.map(({status, review, createdAt, ...j}) => ({...j, scenes: j.scenes}));
  return send(res, 200, `window.DB_JOURNEYS=${JSON.stringify(slim)};`, {'Content-Type': MIME['.js']});
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(ROOT, '.' + rel);
  const inside = file === ROOT || file.startsWith(ROOT + path.sep);
  const hidden = /(^|[\\/])(admin|\.git|node_modules)([\\/]|$)/.test(path.relative(ROOT, file)) || /(^|[\\/])\./.test(path.relative(ROOT, file));
  if (!inside || hidden || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, 'Not found');
  const headers = {'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache'};
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (url.pathname === '/db-journeys.js') return dbScript(url, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res, error.status || 500, {error: error.message || '服务器错误'});
    else res.end();
  }
}).listen(PORT, HOST, () => console.log(`TripWonder admin: http://${HOST}:${PORT}/photos.html  (MiMo key: ${hasKey() ? 'found' : 'MISSING'}, model ${MODEL})`));
