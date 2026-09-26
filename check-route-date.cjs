const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto('http://127.0.0.1:8765/');
    await page.locator('.entry').click();
    await page.locator('.rules-popover').waitFor();
    assert.equal(await page.locator('.daily-card').count(),0,'home entry bypasses the removed daily list');
    await page.locator('.rules-popover [data-action="close"]').click();
    await page.locator('.rules-popover').waitFor({state:'hidden'});
    const shenzhenSource=await page.evaluate(() => {
      const city=window.TRIPWONDER_CATALOG.cities.find(c=>c.id==='shenzhen');
      return SceneMedia.source(city.scenes[0].photo,true).src;
    });
    for(let i=0;i<5 && await page.locator('.cover-hero img').getAttribute('src')!==shenzhenSource;i++){
      const previous=await page.locator('.cover-hero img').getAttribute('src');
      await page.locator('[data-action="skip"]').click();
      await page.waitForFunction(previous => document.querySelector('.cover-hero img')?.getAttribute('src')!==previous,previous);
    }
    assert.equal(await page.locator('.cover-hero img').getAttribute('src'),shenzhenSource,'reached Shenzhen in this page session');
    await page.locator('[data-action="start"]').click();
    for(let i=0;i<3;i++)await page.locator('[data-action="next-scene"]').click();
    for(let i=0;i<3;i++){
      await page.locator('[data-option="0"]').click();
      await page.locator('[data-action="submit"]').click();
    }
    await page.locator('.guess-map').click({position:{x:200,y:300}});await page.locator('[data-action="guess-submit"]').click();await page.locator('.guess-card [data-action="show-result"]').click();
    await page.locator('.result-hero').waitFor();
    await page.locator('[data-go="route"]').last().click();
    await page.locator('[data-days="3"]').click();
    await page.locator('#route-date').fill('2026-09-28');
    await page.locator('#route-date').dispatchEvent('change');
    assert.ok(!(await page.locator('.day-card').first().innerText()).includes('关山月美术馆'),'Monday group moved away from day one');
    assert.equal(await page.locator('.availability-warning').count(),0,'reordered three-day route avoids known closure');
    await page.locator('[data-days="1"]').click();
    await page.locator('[data-swap="0-0"]').click();
    await page.locator('[data-stop="关山月美术馆"]').click();
    assert.ok((await page.locator('.availability-warning').innerText()).includes('周一闭馆'),'manual conflict is visible');
    console.log('PASS: opening-day regrouping and manual conflict warning in a fresh page session');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
