// Browser regression for community push/pop direction and result return state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.TRIPWONDER_BASE || 'http://127.0.0.1:8787/';
const output = process.env.TRIPWONDER_TEST_ARTIFACTS;
const idle = page => page.waitForFunction(() => !window.ChallengeMotion?.busy && !document.querySelector('.scene-transition'));
async function transition(page, selector, target, back) {
  await page.evaluate(() => { window.navigationFrames = []; });
  if(typeof selector==='function')await selector(page);else await page.locator(selector).click();
  await page.locator(`#app > .page[data-view="${target}"]:not([data-slide-layer="outgoing"])`).waitFor();
  await idle(page);
  const frames = await page.evaluate(() => window.navigationFrames.filter(f => f.layer));
  assert.equal(frames.find(f => f.layer === 'outgoing')?.end, back ? 'translate3d(100%,0,0)' : 'translate3d(-28%,0,0)', `${selector}: outgoing ${back ? 'pop' : 'push'}`);
  assert.equal(frames.find(f => f.layer === 'incoming')?.start, back ? 'translate3d(-28%,0,0)' : 'translate3d(100%,0,0)', `${selector}: incoming ${back ? 'pop' : 'push'}`);
  assert.equal(await page.locator('#app > .page').count(), 1, 'only one page after transition');
  assert.equal(await page.locator('#app[aria-busy],#app > [inert],[data-slide-layer]').count(), 0, 'no stale transition layers or locks');
}
async function enterFeed(page) {
  await page.goto(base);
  await page.locator('.th-wonder').waitFor();
  await page.evaluate(() => HomePromo.dismiss());
  await page.locator('.th-wonder').click();
  await page.locator('.cm-hub').waitFor(); await idle(page);
  await page.locator('.cm-entry[data-go="feed"]').click();
  await page.locator('.cm-feed').waitFor(); await idle(page);
}
async function finishGame(page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.setFixedTime(new Date(now + 61000));
  await page.locator('.guess-map').waitFor(); await idle(page);
  await page.locator('.guess-map').click({position:{x:160,y:250}});
  await page.locator('[data-action="guess-submit"]').click();
  await page.locator('[data-action="show-result"]').click();
  await page.locator('.result-page').waitFor(); await idle(page);
  await page.locator('.result-scroll-cue').evaluate(e => e.click());
  await page.waitForTimeout(600);
}
const resultState = page => page.evaluate(() => ({height:document.querySelector('.result-intro').getBoundingClientRect().height,scroll:document.querySelector('#app').scrollTop,ugc:!!document.querySelector('.result-ugc')}));
async function assertResult(page, before) {
  const after = await resultState(page);
  assert.equal(after.ugc,before.ugc,'return preserves official/UGC result mode');
  assert.ok(Math.abs(after.height-before.height)<2,'return preserves expanded result panel');
  assert.ok(Math.abs(after.scroll-before.scroll)<3,`return preserves result scroll: ${before.scroll} -> ${after.scroll}`);
}
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const report = [], errors = [];
  try {
    const page = await browser.newPage({viewport:{width:Number(process.env.TRIPWONDER_TEST_WIDTH)||390,height:Number(process.env.TRIPWONDER_TEST_HEIGHT)||844},hasTouch:true});
    if(process.env.TRIPWONDER_APP_SOURCE)await page.route('**/app.js?*',route=>route.fulfill({path:process.env.TRIPWONDER_APP_SOURCE,contentType:'text/javascript'}));
    page.on('pageerror',e => errors.push(e.message));
    await page.clock.setFixedTime(new Date());
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      Element.prototype.animate = function(frames,options) {
        (window.navigationFrames ||= []).push({view:this.dataset.view,layer:this.dataset.slideLayer,start:frames[0]?.transform,end:frames[frames.length-1]?.transform});
        return animate.call(this,frames,options);
      };
    });
    await enterFeed(page);
    await page.locator('[data-journey="ugc-shapowei"] .cm-post-gallery').click();
    await page.locator('.explore-page').waitFor(); await idle(page);
    await transition(page,'[data-action="leave"]','feed',true);
    report.push('player game returns to feed with pop direction');
    await page.locator('[data-journey="ugc-shapowei"] .cm-post-gallery').click();
    await page.locator('.explore-page').waitFor(); await idle(page);
    await finishGame(page);
    const comments = '.result-ugc .result-discuss';
    assert.equal(await page.locator(comments).getAttribute('class'),'content-card result-discuss','player result shares the official comment card');
    assert.equal((await page.locator(comments+' strong').textContent()).trim(),'去社区看看大家怎么说');
    await page.locator(comments).scrollIntoViewIfNeeded();
    const beforeComments = await resultState(page);
    await transition(page,comments,'journey',false);
    assert.equal(await page.locator('.photo-viewport[data-rendered="true"]').count(),1,'UGC comments use the same immersive scene');
    assert.equal(await page.locator('.tw-bubble-bar,[data-bubble-filter],[data-bubble-new]').count(),0);
    assert.equal(await page.locator('[data-journey-comments]').count(),1);
    const half=await page.locator('.journey-comments-panel').evaluate(e=>e.getBoundingClientRect().height/e.parentElement.getBoundingClientRect().height);
    assert.ok(Math.abs(half-.52)<.015,'player comments open half screen');
    await page.locator('.journey-comments-expand').click();await page.waitForTimeout(300);
    assert.equal(await page.locator('.journey-comments-panel').getAttribute('data-size'),'full');
    await page.locator('[data-comment-compose]').click();await page.locator('.cm-comment-form textarea').fill('玩家旅程也使用同款评论抽屉');await page.locator('.cm-comment-send').click();
    assert.ok((await page.locator('.cm-comments').innerText()).includes('玩家旅程也使用同款评论抽屉'));
    assert.equal(await page.locator('select[name="kind"],[data-comment-filter]').count(),0);
    if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,'player-comments-full.png')});}
    await page.locator('.journey-comments-close').click();await page.waitForTimeout(240);
    const at=await page.locator('.photo-viewport').evaluate(root=>{const r=root.getBoundingClientRect();for(const x of [.5,.3,.7])for(const y of [.5,.65,.35]){const p={x:r.left+r.width*x,y:r.top+r.height*y},n=document.elementFromPoint(p.x,p.y);if(n&&root.contains(n)&&!n.closest('button,.tw-bubble,.tw-bundle,.hotspot'))return p;}throw Error('No clear player photo point');});
    await page.mouse.click(at.x,at.y);await page.locator('.tw-compose').waitFor();await page.locator('.tw-compose textarea').fill('玩家旅程点图也能留言');await page.locator('[data-compose-submit]').click();await page.locator('.tw-compose').waitFor({state:'detached'});
    assert.equal(await page.locator('.tw-bubble.fresh').count(),1,'completed player scenes support direct tap notes');
    await page.evaluate(() => {
      const prepare=SceneMedia.prepare;
      SceneMedia.prepare=(...args)=>{SceneMedia.prepare=prepare;return Promise.reject(new Error('Simulated retryable image failure'));};
    });
    await page.locator('[data-action="leave"]').click(); await idle(page);
    assert.equal(await page.locator('.cm-journey').count(),1,'failed preparation leaves the comments page visible');
    assert.equal(await page.locator('#app[aria-busy]').count(),0,'failed preparation unlocks navigation');
    await transition(page,'[data-action="leave"]','result',true);
    await assertResult(page,beforeComments);
    report.push('UGC result opens comments with push and returns with pop plus restored state, including retry after image failure');
    await page.locator('.result-actions [data-go="feed"]').scrollIntoViewIfNeeded();
    const beforeFeed = await resultState(page);
    await transition(page,'.result-actions [data-go="feed"]','feed',false);
    await transition(page,'.cm-feed .page-head [data-go="result"]','result',true);
    await assertResult(page,beforeFeed);
    await transition(page,'.result-actions [data-go="feed"]','feed',false);
    await transition(page,p=>p.evaluate(()=>dispatchEvent(new PopStateEvent('popstate'))),'result',true);
    await assertResult(page,beforeFeed);
    report.push('more journeys opens feed with push and feed back restores originating result');
    await transition(page,'.result-topbar [data-action="result-exit"]','feed',true);
    assert.equal(await page.locator('.cm-feed .page-head [data-go="hub"]').count(),1,'popping the game does not push its result under the feed');
    report.push('UGC result top back returns to original feed');
    await page.locator('[data-journey="ugc-shapowei"] [data-feed-discuss]').first().click();
    await page.locator('.cm-journey').waitFor(); await idle(page);
    await page.locator('.journey-comments-close').click();await page.waitForTimeout(240);
    await page.locator('[data-action="next-scene"]').click();await idle(page);
    assert.match(await page.locator('.scene-counter').textContent(),/2\s*\/\s*3/);
    await transition(page,'[data-action="leave"]','feed',true);
    report.push('completed player journey browses all scenes and returns to feed');
    await page.locator('.cm-feed-scroll').evaluate(e => { e.scrollTop=260; });
    const feedScroll = await page.locator('.cm-feed-scroll').evaluate(e => e.scrollTop);
    await page.locator('[data-journey="ugc-shapowei"] [data-feed-discuss]').first().evaluate(e => e.click());
    await page.locator('.cm-journey').waitFor(); await idle(page);
    await page.locator('.journey-comments-close').click();await page.waitForTimeout(240);
    await transition(page,'[data-action="leave"]','feed',true);
    assert.equal(await page.locator('.cm-feed-scroll').evaluate(e => e.scrollTop),feedScroll,'nested feed scrolling restored');
    report.push('feed returns at the original scroll position');

    // Official results use the same child-page contract without changing the challenge mode.
    const token=Buffer.from(JSON.stringify({cityId:'datong',score:0})).toString('base64url');
    await page.goto(base+'?challenge='+token);
    await page.locator('.cover-page').waitFor(); await idle(page);
    if(await page.locator('.rules-popover').count()) {await page.locator('[data-action="rules-start"]').click(); await page.locator('.rules-popover').waitFor({state:'detached'});}
    await page.locator('[data-action="start"]').click();
    await page.locator('.explore-page').waitFor(); await idle(page);
    await finishGame(page);
    await page.locator('.result-discuss').scrollIntoViewIfNeeded();
    const beforeOfficial = await resultState(page);
    await transition(page,'.result-discuss','journey',false);
    await page.locator('.journey-comments-close').click();await page.waitForTimeout(240);
    await transition(page,'[data-action="leave"]','result',true);
    await assertResult(page,beforeOfficial);
    report.push('official result -> immersive journey comments -> original result');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.result-discuss').click(); await page.locator('.cm-journey').waitFor(); await idle(page);
    await page.locator('.journey-comments-close').click();await page.waitForTimeout(20);
    await page.locator('[data-action="leave"]').click(); await page.locator('.result-page').waitFor(); await idle(page);
    assert.equal(await page.locator('#app > .page').count(),1);
    await assertResult(page,beforeOfficial);
    report.push('reduced motion retains return state without stale layers');
    assert.deepEqual(errors,[],'no browser errors');
    if(output){fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'navigation-results.json'),JSON.stringify({report,errors},null,2));await page.screenshot({path:path.join(output,'official-result-return.png')});}
    console.log(JSON.stringify({passed:report,errors},null,2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e);process.exitCode=1; });
