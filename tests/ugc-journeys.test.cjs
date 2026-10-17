const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function load() {
  const context = vm.createContext({window: {}});
  for (const file of ['data.js', 'media-manifest.js', ...fs.readdirSync(path.join(root, 'content')).filter(f => f.endsWith('.js')).map(f => `content/${f}`), 'catalog.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  }
  return context;
}
function community(context, data = {prefs: {}, ugcPlayed: {}}) {
  Object.assign(context, {
    document: {addEventListener() {}},
    FormData: class { constructor(form) { this.fields = form.fields; } get(name) { return this.fields[name] ?? null; } }
  });
  context.window.I18N = {t: zh => zh, isEn: () => false, f: (item, key) => item[key]};
  context.window.TWStore = {get: () => data, update: fn => fn(data)};
  vm.runInContext(fs.readFileSync(path.join(root, 'community.js'), 'utf8'), context);
  return context.window.Community;
}

test('three initialized UGC journeys contain distinct photos and matching quiz scenes', () => {
  const {window} = load();
  assert.equal(window.UGC_JOURNEYS.length, 3);
  for (const journey of window.UGC_JOURNEYS) {
    assert.equal(journey.scenes.length, 3, journey.id);
    assert.equal(new Set(journey.scenes.map(s => s.photo.sourceSha256)).size, 3, `${journey.id}: distinct sources`);
    assert.equal(new Set(journey.questions.map(q => q.sceneId)).size, 3);
    assert.ok(journey.questions.every(q => journey.scenes.some(s => s.id === q.sceneId)));
    assert.equal(journey.sampleRevision, window.UGC_SAMPLE_REVISION);
  }
});

test('publish form accepts 3 and 9 photos and rejects 2 and 10', () => {
  const api = community(load());
  const fields = {name: '海边', title: '周末慢行', region: '福建', lat: '24.4', lng: '118.1'};
  for (let i = 0; i < 3; i++) {
    fields[`q${i}`] = `问题${i}`;
    fields[`a${i}`] = '0';
    for (let j = 0; j < 4; j++) fields[`o${i}-${j}`] = `选项${j}`;
  }
  const form = count => ({fields, querySelector: () => ({files: {length: count}})});
  assert.match(api.validate(form(2)), /至少.*3/);
  assert.equal(api.validate(form(3)), '');
  assert.equal(api.validate(form(9)), '');
  assert.match(api.validate(form(10)), /最多.*9/);
});

test('community hides reviewed journeys outside the 3–9 photo range', () => {
  const context = load(), base = context.window.UGC_JOURNEYS[0];
  context.window.DB_JOURNEYS = [2, 3, 9, 10].map(count => ({...base, id: `player-${count}`, scenes: Array.from({length: count}, (_, i) => ({...base.scenes[i % 3], id: `player-${count}-${i}`}))}));
  community(context);
  const ids = Array.from(context.window.TRIPWONDER_CATALOG.ugc, j => j.id);
  assert.ok(!ids.includes('player-2') && !ids.includes('player-10'));
  assert.ok(ids.includes('player-3') && ids.includes('player-9'));
});

test('sample reinitialization resets only the three sample play records once', () => {
  const context = load();
  const data = {prefs: {ugcSampleRevision: 'old', theme: 'light'}, ugcPlayed: {'player-custom': {score: 99}}, challenged: {suzhou: {score: 88}}, wallet: {balance: 80}, boardComments: {'ugc-shapowei': [{text: '保留评论'}]}, bubbles: {scene: [{text: '保留气泡'}]}};
  for (const j of context.window.UGC_JOURNEYS) data.ugcPlayed[j.id] = {score: 70};
  const api = community(context, data), before = structuredClone(data);
  api.initializeSamples();
  assert.deepEqual(data.ugcPlayed, {'player-custom': {score: 99}});
  for (const key of ['challenged', 'wallet', 'boardComments', 'bubbles']) assert.deepEqual(data[key], before[key]);
  assert.equal(data.prefs.theme, 'light');
  assert.equal(data.prefs.ugcSampleRevision, context.window.UGC_SAMPLE_REVISION);
  data.ugcPlayed['ugc-shapowei'] = {score: 100};
  api.initializeSamples();
  assert.equal(data.ugcPlayed['ugc-shapowei'].score, 100);
});

test('backend input and saved journey validation enforce the same photo range', async () => {
  process.env.TRIPWONDER_DB = ':memory:';
  const {validateJourney, normalizeInput} = await import('../admin/pipeline.mjs');
  const {window} = load(), base = window.UGC_JOURNEYS[0];
  const photos = window.UGC_JOURNEYS.flatMap(j => j.scenes);
  for (const count of [2, 10]) {
    assert.throws(() => normalizeInput({id: 'test-ugc', name: '地点', region: '福建', scenes: Array(count).fill({})}), /3–9/);
    assert.throws(() => validateJourney({...base, scenes: Array.from({length: count}, (_, i) => photos[i % photos.length])}), /3–9/);
  }
  validateJourney(base);
  validateJourney({...base, scenes: photos});
});
