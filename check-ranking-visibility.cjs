const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(path.join(__dirname, 'collection-pages.js'), 'utf8'), context);
const cities = Array.from({length: 5}, (_, i) => ({
  id: `secret-city-${i}`, name: `隐藏城市${i}`, region: `隐藏省份${i}`,
  scenes: [{id: `secret-photo-${i}`}]
}));
const order = cities.map(city => city.id);
// Check every combination, including skipped/in-progress destinations and completed zero scores.
for (let mask = 0; mask < 32; mask++) {
  const daily = Object.fromEntries(cities.map((city, i) => [city.id,
    mask & (1 << i) ? {result: {score: i * 20, correct: i % 4}} : {skipped: i % 2 === 0, exploring: i % 2 !== 0}
  ]));
  for (const rank of ['今日', '好友榜']) {
    const renderedPhotos = [];
    const html = context.window.CollectionPages.ranking({
      order, cities, daily, rank, esc: String, head: title => `<header>${title}</header>`,
      img: id => { renderedPhotos.push(id); return `<img src="${id}.jpg">`; }
    });
    for (const city of cities) {
      const unlocked = !!daily[city.id].result;
      assert.equal(html.includes(city.name), unlocked, `${rank}: ${city.name}, mask ${mask}`);
      if (!unlocked) {
        for (const value of [city.id, city.region, city.scenes[0].id]) assert.ok(!html.includes(value), value);
        assert.ok(!renderedPhotos.includes(city.scenes[0].id), 'Locked photos must not render');
      }
    }
    const count = Object.values(daily).filter(record => record.result).length;
    assert.equal((html.match(/class="rk-city"/g) || []).length, rank === '今日' ? count : 0);
    assert.equal((html.match(/<small>待解锁<\/small>/g) || []).length, 5 - count);
    if (rank === '今日') assert.equal(html.includes('class="rk-unlock"'), count < 5);
  }
}
console.log('PASS: all 32 unlock combinations on both ranking tabs; no locked names, regions, photos, or links; zero-score results unlock normally.');
