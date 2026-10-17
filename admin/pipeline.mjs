// "生成 journey" pipeline: uploads -> image variants -> MiMo hotspots (community browsing) ->
// MiMo questions/location/stops (vision, from the photos, independent of the hotspots) -> validated journey in SQLite.
// Each step is resumable: results are kept in job.state, so a retry only redoes what failed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {ADMIN_DIR, DATA_DIR, getJob, updateJob, saveJourney} from './db.mjs';
import {chatJson, MODEL} from './mimo.mjs';

const require = createRequire(import.meta.url);
const UGCContract = require('../ugc-contract.js');
export const ROOT = path.resolve(ADMIN_DIR, '..');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, {recursive: true});

let sharp;
try { sharp = require('sharp'); } catch {
  sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
}

export const STEPS = [
  {key: 'images', label: '图片转换'},
  {key: 'hotspots', label: '讲解点生成'},
  {key: 'questions', label: '题目生成'},
  {key: 'location', label: '地图位置与路线'},
  {key: 'save', label: '写入数据库'}
];
export const RESERVED_IDS = ['datong', 'shenzhen', 'suzhou', 'guilin', 'hongkong', 'beijing', 'shanghai', 'zhangjiajie'];
// quizSeconds is the whole challenge clock (exploring + answering), as in the game.
export const DEFAULT_RULES = {quizSeconds: 60, points: [20, 20, 20], guess: {max: 40, fullKm: 25, decayKm: 450}};
const TAGS = ['建筑', '历史', '地理', '自然', '城市', '生活', '体验', '文化', '美食', '交通'];
const INTERESTS = ['建筑', '文化', '摄影', '自然', '美食'];
const CHINA = {minLat: 3.5, maxLat: 54, minLng: 73, maxLng: 136};

// ---------- input validation (also used by the HTTP layer) ----------
export function normalizeInput(raw) {
  const fail = message => { throw Object.assign(new Error(message), {status: 400}); };
  const str = (value, max) => String(value ?? '').trim().slice(0, max);
  const id = str(raw.id, 40).toLowerCase();
  if (!/^[a-z][a-z0-9-]{1,39}$/.test(id)) fail('目的地标识只能用小写英文字母、数字和短横线，并以字母开头（如 chengdu）');
  if (RESERVED_IDS.includes(id)) fail('该标识已被内置目的地占用');
  const name = str(raw.name, 20);
  if (!name) fail('请填写目的地名称');
  const region = str(raw.region, 20);
  if (!region) fail('请填写所在省份/地区');
  const scenesIn = Array.isArray(raw.scenes) ? raw.scenes : [];
  if (scenesIn.length < 3 || scenesIn.length > 9) fail('请上传 3–9 张场景图片');
  const scenes = scenesIn.map((scene, index) => {
    const uploadId = str(scene.uploadId, 64);
    if (!/^[a-f0-9-]{36}$/.test(uploadId) || !findUpload(uploadId)) fail(`第 ${index + 1} 张图片尚未上传成功`);
    const sceneName = str(scene.name, 24);
    if (!sceneName) fail(`请填写第 ${index + 1} 张图片的景点名称`);
    return {name: sceneName, note: str(scene.note, 120), uploadId, credit: str(scene.credit, 80), license: str(scene.license, 60), filename: str(scene.filename, 120)};
  });
  const num = (value, label, min, max, dflt) => {
    if (value === '' || value == null) return dflt;
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) fail(`${label}需在 ${min}–${max} 之间`);
    return n;
  };
  const r = raw.rules || {};
  const points = Array.isArray(r.points) ? r.points.map(Number) : DEFAULT_RULES.points;
  if (points.length !== 3 || points.some(p => !Number.isInteger(p) || p < 1 || p > 100)) fail('三道题的分值需为 1–100 的整数');
  const g = r.guess || {};
  const rules = {
    quizSeconds: num(r.quizSeconds, '答题倒计时（秒）', 10, 600, DEFAULT_RULES.quizSeconds),
    points,
    guess: {
      max: num(g.max, '定位满分', 1, 100, DEFAULT_RULES.guess.max),
      fullKm: num(g.fullKm, '满分半径（公里）', 0, 1000, DEFAULT_RULES.guess.fullKm),
      decayKm: num(g.decayKm, '距离衰减尺度（公里）', 10, 5000, DEFAULT_RULES.guess.decayKm)
    }
  };
  if (!Number.isInteger(rules.quizSeconds)) fail('倒计时需为整数秒');
  if (points.reduce((a, b) => a + b, 0) + rules.guess.max !== 100) fail('三道题分值之和加定位满分需等于 100（结果页按百分制展示）');
  let lat = null, lng = null;
  if (raw.lat !== '' && raw.lat != null || raw.lng !== '' && raw.lng != null) {
    lat = Number(raw.lat); lng = Number(raw.lng);
    if (!inChina(lat, lng)) fail('坐标需为中国境内的纬度、经度（纬度 3.5–54，经度 73–136）');
  }
  // Official journeys join today's challenge; UGC journeys appear in the community after review, without rewards.
  const channel = raw.channel === 'ugc' ? 'ugc' : 'official';
  const title = str(raw.title, 20);
  if (channel === 'ugc' && !title) fail('玩家 Journey 需要一个不含地名的挑战标题');
  if (channel === 'ugc' && title.includes(name)) fail('挑战标题不能包含目的地名称');
  let authored;
  if (raw.questions != null) {
    if (channel !== 'ugc') fail('自主出题仅用于玩家 Journey');
    if (lat == null) fail('自主出题请填写目的地坐标');
    try { authored = UGCContract.questions(raw.questions, scenes.length, name, region); } catch (error) { fail(error.message); }
    if ([name, ...region.split(/[·,，\s]+/)].filter(s => s.length >= 2).some(word => (title + String(raw.intro || '')).includes(word))) fail('挑战标题和介绍不能透露目的地或所在城市');
  }
  const ugc = channel === 'ugc' ? {title, boardEnabled: raw.boardEnabled !== false, author: {name: str(raw.author, 16) || '玩家'}} : {};
  return {id, name, nameEn: str(raw.nameEn, 60), region, intro: str(raw.intro, 400), lat, lng, rules, scenes, channel, ...ugc, ...(authored ? {questions: authored} : {})};
}
const inChina = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) &&
  lat >= CHINA.minLat && lat <= CHINA.maxLat && lng >= CHINA.minLng && lng <= CHINA.maxLng;

export function findUpload(uploadId) {
  return fs.readdirSync(UPLOAD_DIR).map(f => path.join(UPLOAD_DIR, f)).find(f => path.basename(f).startsWith(uploadId + '.')) || null;
}

// ---------- job runner ----------
const running = new Set();
export const isRunning = id => running.has(id);

export function startJob(jobId) {
  if (running.has(jobId)) return;
  running.add(jobId);
  run(jobId).catch(error => console.error('job crashed', jobId, error)).finally(() => running.delete(jobId));
}

async function run(jobId) {
  let job = getJob(jobId);
  const {input} = job;
  const state = job.state || {};
  const steps = job.steps;
  updateJob(jobId, {status: 'running', error: null});
  const set = (key, status, detail = '') => {
    const step = steps.find(s => s.key === key);
    Object.assign(step, {status, detail});
    updateJob(jobId, {steps, state});
  };
  let current = null;
  try {
    for (const {key} of STEPS) {
      if (steps.find(s => s.key === key).status === 'done') continue;
      current = key;
      set(key, 'running', '');
      const result = await STEP_FUNCS[key]({input, state, jobId, progress: detail => set(key, 'running', detail)});
      set(key, result?.skipped ? 'skipped' : 'done', result?.detail || '');
    }
    updateJob(jobId, {status: 'done', state: {}, steps, error: null});
    for (const scene of input.scenes) { const f = findUpload(scene.uploadId); if (f) fs.rmSync(f, {force: true}); }
  } catch (error) {
    console.error(`[job ${jobId}] ${current} failed:`, error.message);
    if (current) { Object.assign(steps.find(s => s.key === current), {status: 'failed', detail: error.message}); }
    updateJob(jobId, {status: 'failed', steps, state, error: `${STEPS.find(s => s.key === current)?.label || ''}失败：${error.message}`});
  }
}

const sceneId = (input, index) => `${input.id}-s${index + 1}`;
const sceneDir = (input, index) => `photo-library/${input.id}/s${index + 1}`;
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const abs = rel => path.join(ROOT, rel);

// ---------- step 1: image variants ----------
async function stepImages({input, state, progress}) {
  state.photos ||= {};
  for (const [index, scene] of input.scenes.entries()) {
    const id = sceneId(input, index);
    if (state.photos[id]) continue;
    progress(`${index + 1}/${input.scenes.length}`);
    const upload = findUpload(scene.uploadId);
    if (!upload) throw new Error(`上传文件丢失：${scene.name}`);
    const meta = await sharp(upload).metadata();
    const ext = {jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif', heif: 'avif', gif: 'png'}[meta.format];
    if (!ext) throw new Error(`${scene.name}：不支持的图片格式 ${meta.format}`);
    const dir = sceneDir(input, index);
    fs.mkdirSync(abs(dir), {recursive: true});
    const original = `${dir}/original.${ext}`;
    fs.copyFileSync(upload, abs(original));
    fs.mkdirSync(abs(`${dir}/immersive-blur`), {recursive: true});
    if (meta.format === 'jpeg' && (!meta.orientation || meta.orientation === 1)) fs.copyFileSync(upload, abs(`${dir}/immersive-blur/photo.jpg`));
    else await sharp(upload).rotate().jpeg({quality: 95}).toFile(abs(`${dir}/immersive-blur/photo.jpg`));
    const variant = async (name, edge, quality) => {
      const info = await sharp(upload).rotate().resize(edge, edge, {fit: 'inside', withoutEnlargement: true}).webp({quality}).toFile(abs(`${dir}/${name}.webp`));
      return {src: `${dir}/${name}.webp`, width: info.width, height: info.height, bytes: info.size};
    };
    const thumb = await variant('thumb', 640, 80), screen = await variant('screen', 1440, 82), detail = await variant('detail', 2400, 84);
    const oriented = meta.orientation >= 5 && meta.orientation <= 8;
    const upright = oriented ? {width: meta.height, height: meta.width} : {width: meta.width, height: meta.height};
    state.photos[id] = {
      src: original, width: screen.width, height: screen.height, screen, thumb, detail,
      credit: scene.credit || '用户提供', ...(scene.license ? {license: scene.license} : {}),
      original: {src: original, ...upright, bytes: fs.statSync(abs(original)).size, untouched: true},
      sourceSha256: sha256(abs(original)), originalFilename: scene.filename || path.basename(upload)
    };
    fs.writeFileSync(abs(`${dir}/photo.json`), JSON.stringify({city: input.id, dir: `s${index + 1}`, id, ...state.photos[id]}, null, 2) + '\n');
  }
  return {detail: `${input.scenes.length} 张 · 缩略图 / 展示图 / 细节图`};
}

// ---------- prompts ----------
function loadPrompt(name) {
  const text = fs.readFileSync(path.join(ADMIN_DIR, 'prompts', name), 'utf8');
  const [, system, user] = text.match(/## system\s+([\s\S]*?)\s+## user\s+([\s\S]*)$/) || [];
  if (!system) throw new Error(`提示词文件格式错误：${name}`);
  return {system: system.trim(), user: user.trim()};
}
const fill = (template, vars) => template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');

// Words that would give the answer away. A scene name of 4+ characters also bans its first two
// characters, which is where proper nouns usually sit (故宫弘义阁 -> 故宫).
function bannedWords(input) {
  const words = new Set();
  const add = word => { if (word && word.length >= 2) words.add(word); };
  add(input.name); add(input.name.replace(/(特别行政区|市|县|区)$/, ''));
  add(input.region.replace(/(省|市|自治区|特别行政区)$/, '')); add(input.region);
  for (const scene of input.scenes) {
    add(scene.name);
    if (scene.name.length >= 4) add(scene.name.slice(0, 2));
  }
  return [...words];
}
const leaks = (text, banned) => banned.filter(word => String(text).includes(word));

// ---------- step 2: hotspots (vision, one call per scene; shown only when browsing in the community) ----------
async function stepHotspots({input, state, progress}) {
  state.hotspots ||= {}; state.types ||= {}; state.recognized ||= {};
  if (input.questions) {
    for (const [index] of input.scenes.entries()) { const id = sceneId(input, index); state.hotspots[id] = UGCContract.observations(); state.types[id] = '玩家实景'; }
    return {detail: '自主出题 · 保留原始画面，提供三个观察位置'};
  }
  const banned = bannedWords(input), prompt = loadPrompt('scene-hotspots.md');
  const pending = input.scenes.map((scene, index) => ({scene, index, id: sceneId(input, index)})).filter(x => !state.hotspots[x.id]);
  let done = input.scenes.length - pending.length;
  progress(`${done}/${input.scenes.length}`);
  const errors = [];
  const queue = [...pending];
  await Promise.all(Array.from({length: Math.min(3, queue.length)}, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        const result = await hotspotsForScene(input, item, prompt, banned, state);
        Object.assign(state.hotspots, {[item.id]: result.hotspots});
        state.types[item.id] = result.type; state.recognized[item.id] = result.recognized;
        progress(`${++done}/${input.scenes.length}`);
      } catch (error) { errors.push(`${item.scene.name}：${error.message}`); }
    }
  }));
  if (errors.length) throw new Error(errors.join('；'));
  return {detail: `${input.scenes.length} 处 × 3 个讲解点`};
}

async function hotspotsForScene(input, {scene, index, id}, prompt, banned, state) {
  const image = 'data:image/webp;base64,' + fs.readFileSync(abs(state.photos[id].screen.src)).toString('base64');
  let retryNote = '', lastProblem = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const user = fill(prompt.user, {
      destinationName: input.name, region: input.region, sceneName: scene.name,
      sceneNote: scene.note ? `；${scene.note}` : '', banned: banned.join('、'), retryNote
    });
    const {json} = await chatJson({system: prompt.system, user, images: [image]});
    const problems = [];
    const parsed = parseHotspots(json, banned, problems);
    if (parsed) return {hotspots: parsed, type: String(json.type || '').trim().slice(0, 8) || '景点实景', recognized: String(json.recognized || '')};
    lastProblem = problems.join('；');
    retryNote = `**上一次输出不合格，原因：${lastProblem}。请修正后重新输出。**\n\n`;
  }
  throw new Error(`讲解点多次生成仍不合格（${lastProblem}）`);
}

function parseHotspots(json, banned, problems) {
  const list = Array.isArray(json?.hotspots) ? json.hotspots : [];
  if (list.length < 3) { problems.push('需要恰好 3 个讲解点'); return null; }
  const out = list.slice(0, 3).map(h => {
    const num = v => Math.round(Math.min(94, Math.max(6, Number(v) / 10)) * 10) / 10;
    return {x: num(h.x), y: num(h.y), title: String(h.title ?? '').trim(), tag: TAGS.includes(h.tag) ? h.tag : '文化', text: String(h.text ?? '').trim()};
  });
  for (const [i, h] of out.entries()) {
    if (!Number.isFinite(h.x) || !Number.isFinite(h.y)) problems.push(`第 ${i + 1} 个坐标无效`);
    if (h.title.length < 2 || h.title.length > 16) problems.push(`第 ${i + 1} 个标题长度应为 4–12 字`);
    if (h.text.length < 40 || h.text.length > 200) problems.push(`第 ${i + 1} 个正文应为 60–120 字（当前 ${h.text.length}）`);
    const hit = leaks(h.title + h.text, banned);
    if (hit.length) problems.push(`第 ${i + 1} 个讲解点出现了禁用词「${hit.join('、')}」`);
  }
  for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
    if (Math.hypot(out[a].x - out[b].x, out[a].y - out[b].y) < 12) problems.push('讲解点之间距离太近，请分散在画面不同位置');
  }
  return problems.length ? null : out;
}
// ---------- step 3: questions + location + stops (vision, all scenes in one call) ----------
// The model looks at the photos themselves, not at the hotspots: today's challenge shows no hotspots, so every
// question has to be answerable by looking carefully and reasoning with common sense, from easy to hard.
const QUESTION_IMAGE_EDGE = 1024;
async function sceneImage(state, id) {
  const buffer = await sharp(abs(state.photos[id].screen.src))
    .resize(QUESTION_IMAGE_EDGE, QUESTION_IMAGE_EDGE, {fit: 'inside', withoutEnlargement: true}).webp({quality: 78}).toBuffer();
  return 'data:image/webp;base64,' + buffer.toString('base64');
}

async function stepQuestions({input, state, progress}) {
  if (state.generated) return {detail: '3 道题 · 由易到难'};
  if (input.questions) { state.generated = {questions: input.questions, location: {lat: input.lat, lng: input.lng}, stops: []}; return {detail: '已保留发布者的三道原题与答案'}; }
  const banned = bannedWords(input), prompt = loadPrompt('journey-questions.md');
  const ids = input.scenes.map((_, index) => sceneId(input, index));
  const images = await Promise.all(ids.map(id => sceneImage(state, id)));
  const scenesText = input.scenes.map((scene, index) =>
    `【第${index + 1}处 · sceneIndex ${index} · 第 ${index + 1} 张照片 · 「${scene.name}」${scene.note ? ` · 备注：${scene.note}` : ''}】`).join('\n');
  let retryNote = '', lastProblem = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    progress(attempt > 1 ? `第 ${attempt} 次生成` : '');
    const user = fill(prompt.user, {
      destinationName: input.name, region: input.region, sceneCount: String(input.scenes.length),
      coordHint: input.lat == null ? '未提供' : `${input.lat}, ${input.lng}`, banned: banned.join('、'),
      scenes: scenesText, retryNote
    });
    const {json} = await chatJson({system: prompt.system, user, images});
    const problems = [];
    const questions = parseQuestions(json, input, banned, problems);
    if (questions) {
      state.generated = {questions, location: json.location || {}, stops: Array.isArray(json.stops) ? json.stops : []};
      return {detail: '3 道题 · 由易到难'};
    }
    lastProblem = problems.join('；');
    retryNote = `**上一次输出不合格，原因：${lastProblem}。请修正后重新输出。**\n\n`;
  }
  throw new Error(`题目多次生成仍不合格（${lastProblem}）`);
}

// Stems and options must not test book knowledge. The explanation may still cite a statistic's year.
const KNOWLEDGE = [
  [/\d{3,4}\s*年/, '考了年份'],
  [/(秦|汉|晋|隋|唐|宋|辽|金|元|明|清|北魏|民国)(朝|代|时期)/, '考了朝代'],
  [/谁(设计|建造|修建|题写)|哪位|哪首诗|诗句|出自/, '考了人物或诗文出处']
];

function parseQuestions(json, input, banned, problems) {
  const list = Array.isArray(json?.questions) ? json.questions : [];
  if (list.length < 3) { problems.push('需要 3 道题'); return null; }
  const out = list.slice(0, 3).map(q => ({
    level: Number(q.level), sceneIndex: Number(q.sceneIndex), q: String(q.q ?? '').trim(),
    options: Array.isArray(q.options) ? q.options.map(o => String(o).trim()) : [],
    answer: Number(q.answer), explain: String(q.explain ?? '').trim()
  }));
  for (const [i, q] of out.entries()) {
    const n = i + 1;
    if (!Number.isInteger(q.sceneIndex) || q.sceneIndex < 0 || q.sceneIndex >= input.scenes.length) problems.push(`第 ${n} 题 sceneIndex 无效`);
    if (q.q.length < 6 || q.q.length > 70) problems.push(`第 ${n} 题题干长度不合适`);
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.some(o => !o || o.length > 30)) problems.push(`第 ${n} 题需要 4 个互不相同、不超过 16 字的选项`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) problems.push(`第 ${n} 题 answer 需为 0–3`);
    if (!q.explain || q.explain.length > 120) problems.push(`第 ${n} 题解析为空或过长`);
    const hit = leaks([q.q, ...q.options, q.explain].join(' '), banned);
    if (hit.length) problems.push(`第 ${n} 题出现了禁用词「${hit.join('、')}」`);
    const knowledge = KNOWLEDGE.filter(([pattern]) => pattern.test([q.q, ...q.options].join(' '))).map(([, why]) => why);
    if (knowledge.length) problems.push(`第 ${n} 题${knowledge.join('、')}，属于知识性题目，请换成靠观察画面和常识推理的题`);
  }
  if (out.some((q, i) => q.level !== i + 1)) problems.push('3 道题需按 level 1、2、3 由易到难排列');
  if (input.scenes.length >= 3 && new Set(out.map(q => q.sceneIndex)).size < 3) problems.push('3 道题应分别对应 3 个不同场景');
  if (new Set(out.map(q => q.answer)).size < 2) problems.push('3 道题的正确答案位置不要全相同');
  return problems.length ? null : out;
}

// ---------- step 4: location, stops, assemble ----------
const km = (a, b) => {
  const rad = d => d * Math.PI / 180, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

async function stepLocation({input, state}) {
  const {questions, location, stops: rawStops} = state.generated;
  const flags = [];
  let lat = input.lat, lng = input.lng;
  const modelPoint = {lat: Number(location.lat), lng: Number(location.lng)};
  const modelOk = inChina(modelPoint.lat, modelPoint.lng);
  if (lat == null) {
    if (!modelOk) throw new Error('模型没有给出有效的中国境内坐标，请在表单里手动填写目的地坐标后重试');
    ({lat, lng} = modelPoint);
    flags.push(location.confident === false ? '坐标由模型估计且置信度低，请务必核对' : '坐标由模型推断，请核对');
  } else if (modelOk && km({lat, lng}, modelPoint) > 150) {
    flags.push(`模型推断的位置（${modelPoint.lat}, ${modelPoint.lng}）与填写的坐标相距 ${Math.round(km({lat, lng}, modelPoint))} 公里，请确认图片与目的地是否对应`);
  }
  const center = {lat, lng};
  const stops = rawStops.map(s => ({lat: Number(s.lat), lng: Number(s.lng), s}))
    .filter(({lat: la, lng: ln}) => inChina(la, ln) && km(center, {lat: la, lng: ln}) <= 80)
    .slice(0, 6).map(({s, lat: la, lng: ln}, i) => ({
      id: `${input.id}-stop-${i + 1}`, name: String(s.name || '').trim(), lat: +la.toFixed(4), lng: +ln.toFixed(4),
      visitMinutes: Math.min(240, Math.max(30, Math.round(Number(s.visitMinutes) || 60))),
      interests: (Array.isArray(s.interests) ? s.interests : []).filter(x => INTERESTS.includes(x)).slice(0, 2),
      openingHours: null, note: String(s.note || '出发前请核对开放时间与预约信息。').trim().slice(0, 60)
    })).filter(s => s.name);
  if (!stops.length) {
    stops.push({id: `${input.id}-stop-1`, name: input.scenes[0].name, lat, lng, visitMinutes: 90, interests: ['文化', '摄影'], openingHours: null, note: '出发前请核对开放时间与预约信息。'});
    flags.push('模型未给出可用的路线站点，已用第一个场景代替');
  }
  state.assembled = {lat: +lat.toFixed(4), lng: +lng.toFixed(4), stops, flags,
    region: input.region, city: String(location.city || '').trim(), reason: String(location.reason || '')};
  return {detail: `${state.assembled.lat}, ${state.assembled.lng} · ${stops.length} 个站点${flags.length ? ' · 待核对' : ''}`};
}

// ---------- step 5: build document, validate, save ----------
async function stepSave({input, state}) {
  const {assembled, generated} = state;
  const scenes = input.scenes.map((scene, index) => {
    const id = sceneId(input, index);
    return {
      id, name: scene.name, type: state.types[id], photo: state.photos[id], hotspots: state.hotspots[id]
    };
  });
  const questions = generated.questions.map((q, i) => ({
    level: q.level, q: q.q, options: q.options, answer: q.answer, points: input.rules.points[i], explain: q.explain, sceneId: sceneId(input, q.sceneIndex)
  }));
  const journey = {
    id: input.id, name: input.name, ...(input.nameEn ? {nameEn: input.nameEn} : {}), region: input.region,
    channel: input.channel || 'official', ...(input.channel === 'ugc' ? {title: input.title, boardEnabled: input.boardEnabled, author: input.author} : {}),
    lat: assembled.lat, lng: assembled.lng, intro: input.intro, rules: input.rules, guess: input.rules.guess,
    scenes, questions, stops: assembled.stops,
    generated: {model: MODEL, at: new Date().toISOString(), flags: assembled.flags, recognized: state.recognized, locationReason: assembled.reason}
  };
  validateJourney(journey);
  saveJourney(input.id, journey, {status: 'ready', review: 'pending'});
  return {detail: '已存入数据库，可在游戏中挑战'};
}

export function validateJourney(journey) {
  const bad = message => { throw new Error('journey 校验失败：' + message); };
  const text = v => typeof v === 'string' && v.trim().length > 0;
  if (!/^[a-z][a-z0-9-]{0,79}$/.test(journey.id) || !text(journey.name)) bad('id / name');
  if (!inChina(journey.lat, journey.lng)) bad('坐标超出中国范围');
  if (!Array.isArray(journey.scenes) || journey.scenes.length < 1) bad('没有场景');
  if (journey.channel === 'ugc' && (journey.scenes.length < 3 || journey.scenes.length > 9)) bad('玩家 Journey 需要 3–9 张场景图片');
  const ids = new Set();
  for (const scene of journey.scenes) {
    if (!text(scene.id) || ids.has(scene.id) || !text(scene.name)) bad('场景 id / 名称');
    ids.add(scene.id);
    const p = scene.photo;
    if (!p?.screen?.src || !p.thumb?.src || !p.detail?.src || !p.width || !p.height) bad(`${scene.id} 缺少图片版本`);
    for (const variant of [p.screen, p.thumb, p.detail, p.original]) {
      if (!variant?.src) bad(`${scene.id} 缺少原始图片`);
      const relative = decodeURIComponent(String(variant.src).split(/[?#]/)[0]);
      const file = path.resolve(ROOT, relative);
      if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) bad(`文件不存在：${variant.src}`);
    }
    if (!Array.isArray(scene.hotspots) || scene.hotspots.length !== 3) bad(`${scene.id} 需要 3 个讲解点`);
    for (const h of scene.hotspots) if (!(h.x >= 0 && h.x <= 100 && h.y >= 0 && h.y <= 100) || !text(h.title) || !text(h.text)) bad(`${scene.id} 讲解点`);
  }
  if (!Array.isArray(journey.questions) || journey.questions.length !== 3) bad('需要 3 道题');
  for (const q of journey.questions) {
    if (!text(q.q) || q.options?.length !== 4 || !q.options.every(text) || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3 || !text(q.explain) || !ids.has(q.sceneId)) bad('题目结构');
  }
}
export const sceneFolder = (id, index) => abs(sceneDir({id}, index));

const STEP_FUNCS = {images: stepImages, hotspots: stepHotspots, questions: stepQuestions, location: stepLocation, save: stepSave};
