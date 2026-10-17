// Run with: node tests/community-completed.browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const artifacts = process.env.TRIPWONDER_TEST_ARTIFACTS;
const mime = {'.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.mp3':'audio/mpeg'};
const idle = page => page.waitForFunction(() => !window.ChallengeMotion?.busy && !document.querySelector('.scene-transition'));
async function enterFeed(page, base) {
  await page.goto(base);
  await page.locator('.th-wonder').waitFor();
  await page.evaluate(() => HomePromo.dismiss());
  await page.locator('.th-wonder').click();
  await page.locator('.cm-hub').waitFor(); await idle(page);
  await page.locator('.cm-entry-community').click();
  await page.locator('.cm-feed').waitFor(); await idle(page);
}
async function assertBrowse(page) {
  await page.locator('#app > [data-view="journey"]').waitFor(); await idle(page);
  await page.waitForFunction(() => !document.querySelector('.journey-comments-layer')?.hidden);
  assert.equal(await page.locator('.journey-comments-panel').getAttribute('data-size'), 'half');
  const ratio = await page.locator('.journey-comments-panel').evaluate(panel => panel.getBoundingClientRect().height / panel.parentElement.getBoundingClientRect().height);
  assert.ok(Math.abs(ratio - .52) < .015, 'comments open at half screen');
  assert.match(await page.locator('.scene-counter').innerText(), /1\s*\/\s*3/);
  assert.equal(await page.locator('#timer,.quiz-page,.guess-map,[data-action="go-quiz"]').count(), 0, 'browsing has no challenge clock or quiz');
  await page.locator('.photo-viewport[data-rendered="true"]').waitFor();
}
async function backToFeed(page) {
  await page.evaluate(() => dispatchEvent(new PopStateEvent('popstate')));
  await page.waitForFunction(() => document.querySelector('.journey-comments-layer')?.hidden);
  assert.equal(await page.locator('#app > [data-view="journey"]').count(), 1, 'first back only closes comments');
  await page.locator('[data-action="leave"]').click();
  await page.locator('.cm-feed').waitFor(); await idle(page);
}
(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
    fs.readFile(filename, (error, bytes) => {
      if (error) {res.writeHead(404).end();return;}
      res.writeHead(200, {'Content-Type':mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control':'no-store'});
      res.end(bytes);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({channel:'chrome', headless:true});
    const page = await browser.newPage({viewport:{width:390, height:844}, hasTouch:true, reducedMotion:'reduce'});
    const errors = [];page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date());
    const base = `http://127.0.0.1:${server.address().port}/`;
    const id = 'ugc-shapowei', card = `[data-journey="${id}"]`;
    await enterFeed(page, base);
    await page.locator(card + ' .cm-post-gallery').click();
    await page.locator('#app > [data-view="explore"]').waitFor(); await idle(page);
    assert.equal(await page.locator('#timer').count(), 1, 'unplayed journey starts its challenge');
    assert.equal(await page.evaluate(id => !!TWStore.get().ugcPlayed[id], id), false, 'opening does not count as completing');
    // Finish a real round through the timeout and map/result UI.
    const now = await page.evaluate(() => Date.now());
    await page.clock.setFixedTime(new Date(now + 200000));
    await page.locator('.guess-map').waitFor(); await idle(page);
    await page.locator('.guess-map').click({position:{x:160, y:250}});
    await page.locator('[data-action="guess-submit"]').click();
    await page.locator('[data-action="show-result"]').click();
    await page.locator('.result-page').waitFor(); await idle(page);
    const completed = await page.evaluate(id => TWStore.get().ugcPlayed[id], id);
    assert.ok(completed && Number.isFinite(completed.score), 'completing records the journey');
    await page.locator('.result-topbar [data-action="result-exit"]').click();
    await page.locator('.cm-feed').waitFor(); await idle(page);
    await page.locator(card + ' .cm-post-gallery').click(); await assertBrowse(page);
    assert.deepEqual(await page.evaluate(id => TWStore.get().ugcPlayed[id], id), completed, 'reopening keeps the completed score');
    if (artifacts) {
      fs.mkdirSync(artifacts, {recursive:true});
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#toast')).opacity === '0');
      await page.screenshot({path:path.join(artifacts, 'completed-journey-mobile.png')});
    }
    await backToFeed(page);
    await page.locator(card + ' .cm-post-copy').click(); await assertBrowse(page);
    await backToFeed(page);
    // Persisted zero-score records also count as completed, for both kinds of journey.
    const zeroId = await page.evaluate(id => {
      const zeroId = TRIPWONDER_CATALOG.ugc.find(journey => journey.id !== id).id;
      TWStore.update(data => {
        data.ugcPlayed[zeroId] = {at:1, score:0};
        data.challenged.shenzhen = {at:1, result:{score:0}};
      });
      return zeroId;
    }, id);
    await enterFeed(page, base);
    await page.locator(card + ' .cm-post-place').click(); await assertBrowse(page);
    assert.deepEqual(await page.evaluate(id => TWStore.get().ugcPlayed[id], id), completed, 'completion survives reload');
    await backToFeed(page);
    await page.locator(`[data-journey="${zeroId}"] .cm-post-gallery`).click(); await assertBrowse(page);
    assert.equal(await page.evaluate(id => TWStore.get().ugcPlayed[id].score, zeroId), 0);
    await backToFeed(page);
    await page.setViewportSize({width:1280, height:1080});
    await page.locator('[data-feed-tab="official"]').click();
    await page.locator('[data-journey="shenzhen"] .cm-post-gallery').click(); await assertBrowse(page);
    if (artifacts) await page.screenshot({path:path.join(artifacts, 'completed-journey-desktop.png')});
    await backToFeed(page);
    assert.deepEqual(errors, [], 'no browser errors');
    console.log('PASS: unplayed challenge; completed card/photo/title/location → half-screen comments; same-session and reload persistence; zero-score UGC/official; mobile/desktop; back navigation.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});
