// Visible assistant -> editable route -> save -> reopen, including mobile layouts.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8795/';
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy&&!document.querySelector('.scene-transition'));
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const errors=[];
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await page.locator('.th-app[data-go="itinerary"]').click();
    await page.locator('.ip-page').waitFor();
    assert.equal(await page.locator('.ip-cities button').count(),5);
    assert.match(await page.locator('.ip-route-card').innerText(),/舟山·海天佛国三日文化之旅/);
    const before=await page.locator('.ip-ideas').innerText();
    await page.locator('[data-ip="refresh"]').click();
    assert.notEqual(await page.locator('.ip-ideas').innerText(),before);
    await page.locator('[data-ip="generate"]').click();
    assert.equal(await page.locator('#ip-prompt').evaluate(el=>el===document.activeElement),true);
    await page.locator('[data-ip-city="北京"]').click();
    await page.locator('[data-ip="date"]').click();await page.locator('#ip-date').fill('2026-11-01');await page.locator('[data-ip="save-date"]').click();
    await page.locator('[data-ip="people"]').click();await page.locator('[data-ip-choice="people:3"]').click();
    await page.locator('[data-ip="theme"]').click();await page.locator('[data-ip-choice="theme:文化"]').click();
    await page.locator('#ip-prompt').fill('北京三日文化之旅');await page.locator('[data-ip="generate"]').click();
    await page.locator('.route-tabs').waitFor();assert.equal(await page.locator('.day-card').count(),3);
    assert.equal(await page.locator('#route-date').inputValue(),'2026-11-01');assert.equal(await page.locator('#route-theme').inputValue(),'文化');
    await page.locator('[data-action="save-trip"]').click();await page.locator('#modal-root [data-go="itinerary"]').click();
    assert.match(await page.locator('.ip-route-card').innerText(),/北京/);
    await page.locator('.ip-route-card').click();await page.locator('.route-tabs').waitFor();assert.equal(await page.locator('#route-date').inputValue(),'2026-11-01');
    await page.locator('.page-head [data-go="itinerary"]').first().click();
    assert.equal(await page.locator('[data-ip="people"]').innerText(),'3人');
    await page.locator('[data-ip="all"]').first().click();assert.match(await page.locator('.ip-dialog').innerText(),/北京/);await page.locator('.sheet-close').click();
    await page.locator('[data-ip="manual"]').click();await page.locator('[data-ip-start="shenzhen"]').click();await page.locator('.route-tabs').waitFor();
    assert.match(await page.locator('.route-hero h2').innerText(),/深圳/);
    await page.locator('.page-head [data-go="itinerary"]').first().click();
    await page.locator('#ip-prompt').fill('<img src=x onerror=alert(1)>');
    await page.locator('[data-ip="refresh"]').click();assert.equal(await page.locator('#ip-prompt').inputValue(),'<img src=x onerror=alert(1)>');
    for(const width of [320,390,430]){
      await page.setViewportSize({width,height:844});
      assert.equal(await page.locator('#app').evaluate(el=>el.scrollWidth>el.clientWidth+1),false,`no page overflow at ${width}px`);
      assert.equal(await page.locator('.ip-mic').evaluate(el=>el.getBoundingClientRect().right<=el.closest('.ip-input-frame').getBoundingClientRect().right),true);
    }
    await page.locator('.ip-back').click();await page.locator('.th-ai').click();await page.locator('.ip-page').waitFor();
    assert.deepEqual(errors,[]);
    const resultPage=await browser.newPage({viewport:{width:390,height:844}});
    resultPage.on('pageerror',e=>errors.push(e.message));
    await resultPage.clock.setFixedTime(new Date());
    const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
    await resultPage.goto(`${base}?challenge=${token}`);
    await resultPage.locator('.rules-popover [data-action="close"]').click();
    await resultPage.locator('#app [data-action="start"]').click();await resultPage.locator('.photo-viewport').waitFor();
    await resultPage.clock.setFixedTime(new Date(await resultPage.evaluate(()=>Date.now())+61000));
    await resultPage.locator('.guess-map').waitFor();await idle(resultPage);
    await resultPage.locator('.guess-map').click({position:{x:160,y:250}});
    await resultPage.locator('[data-action="guess-submit"]').click();await resultPage.locator('[data-action="show-result"]').click();
    await resultPage.locator('.result-page').waitFor();await idle(resultPage);
    await resultPage.locator('#app [data-go="route"]').click();await resultPage.locator('.ip-page').waitFor();
    assert.equal(await resultPage.locator('#ip-prompt').inputValue(),'深圳');
    await resultPage.locator('[data-ip-city="北京"]').click();await resultPage.locator('[data-ip="generate"]').click();
    await resultPage.locator('.route-tabs').waitFor();await resultPage.locator('.page-head [data-go="itinerary"]').first().click();
    await resultPage.locator('.ip-back').click();await resultPage.locator('.result-page').waitFor();await idle(resultPage);
    assert.match(await resultPage.locator('.result-page').innerText(),/深圳/,'returns to the original challenge result after planning a different city');
    assert.deepEqual(errors,[]);await resultPage.close();
    if(process.env.TRIPWONDER_TEST_ARTIFACTS){await page.setViewportSize({width:390,height:844});await page.locator('#ip-prompt').fill('');await page.screenshot({path:process.env.TRIPWONDER_TEST_ARTIFACTS});}
    console.log('PASS: assistant controls, input safety, route generation/save/reopen, manual creation, result origin return, entry/back, 320/390/430px layouts; no JS errors');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
