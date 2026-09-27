const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app.js', 'utf8');
assert.doesNotMatch(source, /localStorage\.(?:getItem|setItem)\s*\(/, 'page state must not survive refresh');
const bootOnly = source.replace(
  /  if\(invitation\)loadView\('cover',0\);else render\(\);\s*\}\)\(\);\s*$/,
  `  window.__bootState = {
    view: s.view, scene: s.scene, deadline: s.deadline, cityId: s.cityId,
    firstCityId: order[0], visited: [...s.visited], rulesSeen: s.rulesSeen,
    daily: s.daily, benefits: s.benefits, itineraries: s.itineraries,
    bookmarks: s.bookmarks
  };
})();`
);
assert.notEqual(bootOnly, source, 'bootstrap probe must replace the startup call');

function boot(url, oldRecord, replaceFails = false) {
  const calls = {read: 0, removed: [], replaced: []};
  const location = {href: url};
  const window = {addEventListener: () => {}, TRIPWONDER_CATALOG: {cities: [
    {id: 'datong'}, {id: 'shenzhen'}, {id: 'suzhou'}, {id: 'guilin'}, {id: 'hongkong'}
  ]}};
  const context = {
    window, location, URL,
    // Chinese i18n stub; the language preference lives in i18n.js, not app state.
    I18N: {lang: 'zh', isEn: () => false, t: zh => zh, f: (item, key) => item?.[key], term: value => value, place: value => value},
    document: {querySelector: () => ({addEventListener: () => {}}), addEventListener: () => {}},
    localStorage: {
      getItem: () => { calls.read++; return oldRecord; },
      removeItem: key => calls.removed.push(key)
    },
    history: {
      state: null,
      replaceState: (_, __, next) => {
        if (replaceFails) throw new Error('History API unavailable for file URL');
        calls.replaced.push(next); location.href = next;
      }
    }
  };
  vm.runInNewContext(bootOnly, context, {filename: 'app.js'});
  return {state: window.__bootState, calls, location};
}

const stale = JSON.stringify({day: '2026-09-25', daily: {datong: {result: {score: 100}}},
  itineraries: {datong: {city: '大同'}}, rulesSeen: true});
for (const url of [
  'file:///D:/TripWonder/index.html?preview=xuankong',
  'file:///D:/TripWonder/index.html'
]) {
  const {state, calls, location} = boot(url, stale);
  assert.equal(state.view, 'home');
  assert.equal(state.scene, 0);
  assert.equal(state.deadline, 0);
  assert.equal(state.cityId, state.firstCityId);
  assert.deepEqual(Array.from(state.visited), [0]);
  assert.equal(state.rulesSeen, false);
  for (const field of ['daily', 'benefits', 'itineraries', 'bookmarks'])
    assert.deepEqual(Object.keys(state[field]), [], `${field} starts empty`);
  assert.equal(calls.read, 0, 'old browser state is never restored');
  assert.deepEqual(calls.removed, ['tripwonder-challenges-v1']);
  assert.equal(new URL(location.href).searchParams.has('preview'), false);
}
const blockedHistory = boot('file:///D:/TripWonder/index.html?preview=xuankong', stale, true);
assert.equal(blockedHistory.state.view, 'home');
assert.equal(blockedHistory.state.scene, 0);
console.log('PASS: reload starts fresh; stale state and preview shortcut are ignored');
