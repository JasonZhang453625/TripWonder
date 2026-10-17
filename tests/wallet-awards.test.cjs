const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(initial = {}) {
  const data = {
    wallet: {balance: 0, best: {}, ledger: [], ...(initial.wallet || {})},
    redemptions: [],
    challenged: {}
  };
  const window = {
    I18N: {t: zh => zh, f: (item, key) => item[key]},
    TWStore: {get: () => data, update: fn => fn(data)},
    TW_OFFERS: {coupons: [], sponsors: []}
  };
  const context = vm.createContext({window});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'wallet.js'), 'utf8'), context);
  return {wallet: window.Wallet, data};
}

function setupStore(initial) {
  const storage = new Map([['tripwonder-v2', JSON.stringify(initial)]]);
  const window = {};
  const localStorage = {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key)
  };
  const context = vm.createContext({window, localStorage, URL, location: {href: 'https://tripwonder.test/'}});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'tw-store.js'), 'utf8'), context);
  return {store: window.TWStore, storage};
}

test('coins do not increase for quiz speed or completing several destinations', () => {
  const {wallet, data} = setup();
  for (const cityId of ['beijing', 'shanghai', 'suzhou']) {
    const result = wallet.award({cityId, day: '2026-10-17', score: 28, quizRemaining: 180000});
    assert.equal(result.total, 3);
    assert.equal(result.items.length, 1);
    assert.match(result.items[0].zh, /探索得分/);
  }
  assert.equal(data.wallet.balance, 9);
  assert.ok(data.wallet.ledger.every(entry => !entry.items.some(item => /答题速度|今日完成/.test(item.zh))));
  assert.equal(data.wallet.ledger.some(entry => entry.refs?.some(ref => ref.startsWith('daily:'))), false);
});

test('a destination pays only once per day, even if the score or PK result improves', () => {
  const {wallet, data} = setup();
  const first = wallet.award({cityId: 'suzhou', day: '2026-10-17', score: 28});
  const balanceAfterFirst = data.wallet.balance;
  const firstBest = {...data.wallet.best['suzhou@2026-10-17']};
  const ledgerAfterFirst = data.wallet.ledger.length;
  const replay = wallet.award({cityId: 'suzhou', day: '2026-10-17', score: 100, pk: {outcome: 'win'}});

  assert.equal(first.total, 3);
  assert.equal(replay.total, 0);
  assert.equal(replay.repeat, true);
  assert.equal(data.wallet.balance, balanceAfterFirst);
  assert.equal(data.wallet.best['suzhou@2026-10-17'].score, firstBest.score);
  assert.equal(data.wallet.best['suzhou@2026-10-17'].medal, firstBest.medal);
  assert.equal(data.wallet.best['suzhou@2026-10-17'].pk, firstBest.pk);
  assert.equal(data.wallet.ledger.length, ledgerAfterFirst);

  const nextDay = wallet.award({cityId: 'suzhou', day: '2026-10-18', score: 28});
  assert.equal(nextDay.total, 3);
});

test('a persisted completion blocks a duplicate award after the wallet is reset', () => {
  const {wallet, data} = setup();
  data.challenged.suzhou = {completedDay: '2026-10-17', result: {score: 28, date: '2026-10-17'}};
  const replay = wallet.award({cityId: 'suzhou', day: '2026-10-17', score: 100});
  assert.equal(replay.total, 0);
  assert.equal(data.wallet.balance, 0);
  assert.deepEqual(Object.keys(data.wallet.best), []);
});

test('resetting demo data keeps today’s completed destination locked across reload', () => {
  const initial = {
    version: 2,
    challenged: {suzhou: {completedDay: '2026-10-17', result: {score: 28, date: '2026-10-17'}}}
  };
  const {store, storage} = setupStore(initial);
  store.reset();
  assert.equal(store.get().wallet.balance, 0);
  assert.equal(store.get().challenged.suzhou.completedDay, '2026-10-17');
  assert.equal(JSON.parse(storage.get('tripwonder-v2')).challenged.suzhou.result.score, 28);
});

test('earned card hides reward breakdown and places balance before Points Mall', () => {
  const {wallet} = setup({wallet: {balance: 22}});
  const markup = wallet.earnedCard({total: 16, items: [
    {amount: 3, zh: '探索得分 28'},
    {amount: 3, zh: '答题速度'},
    {amount: 10, zh: '今日完成 3 城'}
  ]});
  assert.match(markup, /\+<span data-coin-count="16">16<\/span>/);
  assert.match(markup, /余额 <b>22<\/b>/);
  assert.ok(markup.indexOf('余额') < markup.indexOf('积分商城'));
  assert.doesNotMatch(markup, /探索得分|答题速度|今日完成|tw-earned-items/);
});

test('earned card omits the replay and score-refresh explanation', () => {
  const {wallet} = setup();
  const markup = wallet.earnedCard({total: 0, items: [], repeat: true});
  assert.doesNotMatch(markup, /今天这个目的地的奖励已经领过了|刷新最高分可以补发|Improve your best score/);
});
