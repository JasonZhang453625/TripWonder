// Player co-created journeys use the same tap-to-submit quiz as official challenges.
// Run with TRIPWONDER_BASE set to the local preview or deployed site.
const assert = require('node:assert/strict');
const {chromium, devices} = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.TRIPWONDER_BASE || 'http://127.0.0.1:8765/';
const idle = page => page.waitForFunction(() => !window.ChallengeMotion?.busy && !document.querySelector('.scene-transition'));

async function community(page) {
  await page.goto(base);
  await page.locator('.th-wonder').waitFor();
  await page.evaluate(() => HomePromo.dismiss());
  await page.locator('.th-wonder').click();
  await page.locator('.cm-hub').waitFor(); await idle(page);
  await page.locator('.cm-entry-community').click();
  await page.locator('.cm-feed').waitFor(); await idle(page);
  await page.locator('[data-feed-tab="ugc"]').click(); await idle(page);
}

(async () => {
  const browser = await chromium.launch({channel:'chrome', headless:true});
  const errors = [];
  try {
    const catalog = await browser.newPage();
    await catalog.goto(base);
    await catalog.waitForFunction(() => window.UGC_JOURNEYS?.length > 0);
    const ids = await catalog.evaluate(() => UGC_JOURNEYS.map(journey => journey.id));
    await catalog.close();
    for (const [index, id] of ids.entries()) {
      const page = await browser.newPage({...devices['iPhone 13'], reducedMotion:'reduce'});
      page.on('pageerror', error => errors.push(error.message));
      await page.clock.setFixedTime(new Date());
      await community(page);
      await page.locator(`[data-journey="${id}"] .cm-post-gallery`).click();
      await page.locator('.explore-page').waitFor(); await idle(page);
      const sceneCount = await page.evaluate(id => TRIPWONDER_CATALOG.ugc.find(journey => journey.id === id).scenes.length, id);
      for (let scene = 0; scene < sceneCount; scene++) {
        await page.locator('[data-action="next-scene"]').click(); await idle(page);
      }
      await page.locator('.quiz-page').waitFor();
      assert.equal(await page.locator('.pk-hud').count(), 0, 'this tests ordinary player journeys, independently of PK');
      const answers = await page.evaluate(id => TRIPWONDER_CATALOG.ugc.find(journey => journey.id === id).questions.map(question => question.answer), id);
      for (let question = 0; question < answers.length; question++) {
        assert.equal(await page.locator('.quiz-submit,[data-action="submit"]').count(), 0, 'no confirmation control before answering');
        const choice = question === 1 ? (answers[question] + 1) % 4 : answers[question];
        await page.locator(`[data-option="${choice}"]`).evaluate(button => {button.click(); button.click();});
        await page.locator(`.quiz-reveal.${question === 1 ? 'is-wrong' : 'is-correct'}`).waitFor();
        assert.equal(await page.locator('.quiz-reveal').count(), 1, 'a double activation submits once');
        assert.equal(await page.locator('.option:disabled').count(), 4);
        assert.equal(await page.evaluate(id => TWStore.get().ugcProgress[id].progress.answers.length, id), question + 1);
        const next = page.locator('[data-action="submit"]');
        assert.equal((await next.innerText()).trim(), question === 2 ? '前往地图' : '下一题');
        if (question === 0) {
          const frozen = await page.locator('#timer').innerText();
          await page.clock.setFixedTime(new Date(await page.evaluate(() => Date.now()) + 5000));
          await page.waitForTimeout(280);
          assert.equal(await page.locator('#timer').innerText(), frozen, 'reading the explanation keeps the timer paused');
          if (index === 0) {
            await page.reload();
            await page.locator('.quiz-reveal.is-correct').waitFor(); await idle(page);
            assert.equal(await page.locator('.option:disabled').count(), 4, 'the submitted answer survives reload');
          }
        }
        await next.click(); await idle(page);
      }
      await page.locator('.guess-map').waitFor();
      console.log(`PASS ${id}: tap submits, no confirmation, correct/wrong feedback, no duplicate answers, next/map actions`);
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${ids.length} ordinary player journeys; reload restoration; no browser errors`);
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
