const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(initial = {}) {
  const data = {
    wallet: {balance: 0, best: {}, ledger: [], ...(initial.wallet || {})},
    redemptions: []
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
