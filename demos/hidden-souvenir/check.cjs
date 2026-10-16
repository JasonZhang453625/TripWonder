const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach(source => new vm.Script(source));
for (const name of ['xingping', 'yulong', 'longji']) {
  assert.ok(fs.existsSync(path.join(__dirname, '../../photo-library/guilin', name, 'original.jpg')));
}

function openDemo(store = new Map(), blocked = false) {
  const elements = new Map();
  const timers = new Map();
  let timerId = 0;
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      clientWidth: 1000, clientHeight: 700, style: {}, complete: true,
      naturalWidth: 5996, naturalHeight: 3683, open: false,
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {}, addEventListener() {}, setPointerCapture() {},
      getBoundingClientRect() {
        if (id === 'passenger') return {
          left: parseFloat(this.style.left), top: parseFloat(this.style.top),
          width: parseFloat(this.style.width), height: parseFloat(this.style.height),
        };
        return { left: 0, top: 0, width: 1000, height: 700 };
      },
      showModal() { this.open = true; }, close() { this.open = false; },
      append() {}, remove() {},
    });
    return elements.get(id);
  }
  const thumbs = [0, 1, 2].map(i => element(`thumb${i}`));
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => thumbs, createElement: () => element('spark') },
    localStorage: {
      getItem(key) { if (blocked) throw Error('storage unavailable'); return store.get(key) || null; },
      setItem(key, value) { if (blocked) throw Error('storage unavailable'); store.set(key, value); },
      removeItem(key) { if (blocked) throw Error('storage unavailable'); store.delete(key); },
    },
    window: { addEventListener() {} },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  });
  scripts.forEach(source => vm.runInContext(source, context));
  function flush() {
    for (const [id, fn] of [...timers]) { timers.delete(id); fn(); }
  }
  function pointer(x = .16, y = .92) {
    return { target: { closest: () => null }, pointerId: 1, clientX: x * 1000,
      clientY: (700 - 1000 * 3683 / 5996) / 2 + y * 1000 * 3683 / 5996 };
  }
  function tap() {
    const event = pointer();
    element('viewer').onpointerdown(event);
    element('viewer').onpointerup(event);
    flush();
  }
  return { element, context, store, flush, pointer, tap };
}

const demo = openDemo();
demo.tap();
assert.equal(demo.element('gift').open, false, 'first photo contains no egg');
demo.element('next').onclick();
assert.equal(demo.element('passenger').hidden, false);
assert.equal(parseFloat(demo.element('passenger').style.width), 26, 'smaller collectible at desktop width');
const start = demo.pointer();
demo.element('viewer').onpointerdown(start);
demo.element('viewer').onpointermove({ ...start, clientX: start.clientX + 20 });
demo.element('viewer').onpointerup(start);
demo.flush();
assert.equal(demo.element('gift').open, false, 'dragging out and back must not discover an egg');
demo.element('next').onclick();
demo.tap();
assert.equal(demo.element('gift').open, false, 'third photo contains no egg');
demo.element('prev').onclick();
demo.tap();
assert.equal(demo.element('gift').open, true);
assert.equal(demo.store.size, 0, 'discovery alone does not save a collection');
demo.element('collect').onclick();
assert.equal(demo.store.size, 1);
assert.equal(demo.element('topCount').textContent, '1 / 1');
assert.equal(demo.element('passenger').hidden, true, 'collected passenger disappears');
demo.tap();
assert.equal(demo.element('gift').open, false, 'former location is inactive after collection');
assert.equal(demo.store.size, 1);
const restored = openDemo(demo.store);
restored.element('next').onclick();
assert.equal(restored.element('topCount').textContent, '1 / 1');
assert.equal(restored.element('passenger').hidden, true, 'collected passenger remains absent after reload');
restored.element('confirmReset').onclick();
restored.element('next').onclick();
assert.equal(restored.store.size, 0);
assert.equal(restored.element('passenger').hidden, false, 'reset restores the passenger');
const unavailable = openDemo(new Map(), true);
unavailable.element('next').onclick();
unavailable.tap();
unavailable.element('collect').onclick();
assert.equal(unavailable.element('passenger').hidden, true);
assert.ok(unavailable.element('saveNote').textContent.includes('无法保存'));
const peeking = openDemo();
peeking.element('next').onclick();
// A rendered, raised tip is clickable even outside the original normalized area.
peeking.element('passenger').getBoundingClientRect = () => ({ left: 150, top: 580, width: 11, height: 13 });
const tip = { ...peeking.pointer(), clientX: 151, clientY: 581 };
peeking.element('viewer').onpointerdown(tip);
peeking.element('viewer').onpointerup(tip);
peeking.flush();
assert.equal(peeking.element('gift').open, true, 'hit testing follows rendered bounds including animation');
console.log('PASS: script syntax, photo paths, size, single egg, drag rejection, collect/disappear, persistence, reset, storage fallback');
