const { chromium, devices } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

const base = 'http://127.0.0.1:8765/';
const cityIds = ['datong', 'shenzhen', 'suzhou', 'guilin', 'hongkong', 'beijing', 'shanghai'];

async function openToday(page, expectAutoRules) {
  await page.locator('.entry').click();
  await page.locator('.cover-page').waitFor();
  if (expectAutoRules) await page.locator('.rules-popover').waitFor();
  else assert.equal(await page.locator('.rules-popover').count(), 0, 'rules do not automatically reopen after the first city');
  assert.equal(await page.locator('.daily-card').count(), 0, 'entry opens a cover without a daily list');
}

// Destinations have 1–3 scenes: read N from the counter and walk exactly N scenes into the quiz.
async function exploreAll(page) {
  const total = Number((await page.locator('.scene-counter').textContent()).split('/')[1]);
  for (let i = 1; i < total; i++) {
    await page.locator('[data-action="next-scene"]').click();
    await page.locator('.scene-counter').filter({hasText:`${i+1} / ${total}`}).waitFor();
  }
  await page.locator('[data-action="next-scene"]').click();
}

async function closeRules(page) {
  await page.evaluate(() => document.querySelector('.rules-popover [data-action="close"]')?.click());
  await page.locator('.rules-popover').waitFor({state: 'hidden'});
}

(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, {waitUntil:'domcontentloaded'});
    assert.deepEqual((await page.evaluate(() => window.TRIPWONDER_CATALOG.cities.map(city => city.id))).sort(), [...cityIds].sort());
    assert.equal(await page.locator('[data-go="daily"]').count(), 0, 'no navigation still targets the removed daily view');

    await openToday(page, true);
    const firstCover = await page.locator('.cover-hero img').getAttribute('src');
    const enter = await page.locator('.cover-actions > .primary').boundingBox();
    const skip = await page.locator('.cover-actions > [data-action="skip"]').boundingBox();
    assert.ok(enter && skip && Math.abs(enter.y - skip.y) < 2, 'enter and skip sit on one row');
    assert.ok(Math.abs(enter.width - skip.width) < 2 && Math.abs(enter.height - skip.height) < 2, 'enter and skip have equal dimensions');
    await page.locator('[data-action="rules-start"]').click();await page.locator('[data-action="start"]').click();
    await page.locator('.photo-plane img').evaluate(image => image.decode());
    assert.equal(await page.locator('.zoom-controls,.viewer-tools,[data-action="notebook"],[data-action="language"],[data-action="early-quiz"]').count(), 0, 'extra exploration controls are absent');
    assert.equal(await page.locator('.hotspot').count(), 3);
    await page.locator('.hotspot').first().click();
    assert.ok((await page.locator('#clue-text').textContent()).length > 20);
    await page.locator('[data-action="close"]').click();
    await exploreAll(page);
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-option="0"]').click();
      await page.locator('[data-action="submit"]').click();
      assert.equal(await page.locator('.answer-feedback').count(), 0, 'answers are not revealed between questions');
    }
    await page.locator('.guess-map').click({position:{x:200,y:300}});await page.locator('[data-action="guess-submit"]').click();await page.locator('.guess-card [data-action="show-result"]').click();
    assert.equal(await page.locator('.result-hero').count(), 1);
    assert.equal(await page.locator('.answer-line[data-review]').count(), 3);
    assert.equal(await page.locator('[data-action="next-city"]').count(), 1, 'result offers the next destination');
    await page.locator('[data-action="share"]').first().click();
    const invitation = await page.locator('#invite-link').inputValue();
    assert.ok(invitation.includes('challenge='), 'share creates a challenge URL');
    await page.locator('[data-action="close"]').click();

    const guest = await browser.newPage({viewport:{width:390,height:844}});
    await guest.goto(invitation, {waitUntil:'domcontentloaded'});
    await guest.locator('.rules-popover').waitFor();
    await guest.locator('[data-action="rules-start"]').click();await guest.locator('[data-action="start"]').click();
    await guest.locator('.photo-viewport .immersive-canvas').waitFor();
    await exploreAll(guest);
    for (let i = 0; i < 3; i++) {
      await guest.locator('[data-option="0"]').click();
      await guest.locator('[data-action="submit"]').click();
    }
    await guest.locator('.guess-map').click({position:{x:200,y:300}});await guest.locator('[data-action="guess-submit"]').click();await guest.locator('.guess-card [data-action="show-result"]').click();
    assert.equal(await guest.locator('.friend-compare').count(), 1, 'invited challenge compares scores');
    await guest.close();

    await page.locator('[data-action="next-city"]').click();
    await page.locator('.cover-page').waitFor();
    assert.equal(await page.locator('.rules-popover').count(), 0, 'result progression does not automatically reopen rules');
    assert.notEqual(await page.locator('.cover-hero img').getAttribute('src'), firstCover, 'next destination advances in the daily order');
    await page.locator('.immersive-top [data-action="rules"]').click();
    await page.locator('.rules-popover').waitFor();
    await closeRules(page);
    await page.locator('.cover-page [data-go="home"]').click();
    await openToday(page, false);
    await page.locator('[data-go="atlas"]').click();
    await page.locator('.atlas-item').first().click();
    await page.locator('.result-hero').waitFor();
    await page.locator('[data-go="route"]').last().click();
    assert.equal(await page.locator('.route-controls select').count(), 2);
    await page.locator('[data-days="3"]').click();
    assert.equal(await page.locator('.day-card').count(), 3);
    await page.locator('[data-action="save-trip"]').click();
    await page.locator('[data-go="itinerary"]').last().click();
    assert.ok(await page.locator('.itinerary-card').count());
    await page.reload({waitUntil:'domcontentloaded'});
    await openToday(page, true);
    assert.equal(await page.locator('.cover-hero img').getAttribute('src'), firstCover, 'reload restarts from the first destination');
    await page.locator('[data-action="rules-start"]').click();await page.locator('[data-action="start"]').click();
    await page.locator('.scene-counter').filter({hasText:/^1 \/ \d+$/}).waitFor();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.bottom-nav [data-go="itinerary"]').click();
    assert.equal(await page.locator('.itinerary-card').count(), 0, 'saved itinerary does not survive reload');
    assert.deepEqual(errors, [], 'no browser page errors');

    const skipContext = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const skipPage = await skipContext.newPage();
    const skipErrors = [];
    skipPage.on('pageerror', error => skipErrors.push(error.message));
    await skipPage.goto(base, {waitUntil:'domcontentloaded'});
    await openToday(skipPage, true);
    const covers = [];
    await closeRules(skipPage);
    for (let i = 0; i < cityIds.length; i++) {
      covers.push(await skipPage.locator('.cover-hero img').getAttribute('src'));
      if (i === 1) {
        await skipPage.locator('.immersive-top [data-action="rules"]').click();
        await skipPage.locator('.rules-popover').waitFor();
        await closeRules(skipPage);
      }
      await skipPage.locator('[data-action="skip"]').click();
      if (i < cityIds.length - 1) {
        await skipPage.waitForFunction(previous => {
          const image = document.querySelector('.cover-page .cover-hero img');
          return image && image.getAttribute('src') !== previous;
        }, covers[i]);
        assert.equal(await skipPage.locator('.rules-popover').count(), 0, 'skip does not automatically reopen rules in later cities');
      }
    }
    assert.equal(new Set(covers).size, cityIds.length, 'skip visits each destination once');
    await skipPage.locator('.entry').waitFor();
    assert.equal(await skipPage.locator('.daily-card').count(), 0, 'all skipped returns to home instead of a daily list');
    await openToday(skipPage, false);
    assert.equal(await skipPage.locator('.cover-hero img').getAttribute('src'), covers[0], 'returning from home can revisit the first skipped destination');
    assert.deepEqual(skipErrors, [], 'skip flow has no browser page errors');
    await skipContext.close();

    const reentryContext = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const reentryPage = await reentryContext.newPage();
    await reentryPage.goto(base, {waitUntil:'domcontentloaded'});
    await openToday(reentryPage, true);
    await closeRules(reentryPage);
    await reentryPage.locator('.cover-page [data-go="home"]').click();
    await openToday(reentryPage, false);
    await reentryPage.reload({waitUntil:'domcontentloaded'});
    await openToday(reentryPage, true);
    await closeRules(reentryPage);
    await reentryPage.locator('.immersive-top [data-action="rules"]').click();
    await reentryPage.locator('.rules-popover').waitFor();
    await reentryContext.close();

    const context = await browser.newContext({...devices['iPhone 13']});
    const phone = await context.newPage();
    await phone.goto(base, {waitUntil:'domcontentloaded'});
    assert.equal(await phone.evaluate(() => document.documentElement.classList.contains('mobile-device')), true, 'mobile device recognized');
    assert.equal(await phone.locator('.statusbar').evaluate(el => getComputedStyle(el).display), 'none', 'fake status bar hidden on mobile');
    assert.equal(await phone.locator('.phone').evaluate(el => Math.round(el.getBoundingClientRect().width)), await phone.evaluate(() => innerWidth), 'phone fills mobile viewport');
    await openToday(phone, true);
    await phone.locator('[data-action="rules-start"]').click();await phone.locator('[data-action="start"]').click();
    await phone.locator('.photo-viewport').waitFor();
    assert.equal(await phone.locator('.photo-viewport').evaluate(el => Math.round(el.getBoundingClientRect().height)), await phone.evaluate(() => innerHeight), 'exploration photo fills mobile viewport');
    await context.close();
    console.log('PASS: all destinations, fresh reload, per-page rules, next/skip progression, unified reveal, route/save, immersive mobile layout');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
