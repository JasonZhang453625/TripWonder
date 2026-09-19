const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
for(const [name,opts] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{...devices['iPhone 13'],deviceScaleFactor:1}],['landscape',{...devices['iPhone 13 landscape'],deviceScaleFactor:1}]]){
 const page=await browser.newPage(opts),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8765/');await page.locator('.entry').click();
 const panel=page.locator('.rules-popover');await panel.waitFor();await panel.evaluate(e=>Promise.all(e.getAnimations().map(a=>a.finished)));
 assert.equal(await page.locator('.sheet').count(),0);assert.equal(await page.locator('#app').evaluate(e=>e.inert),true);
 const r=await panel.boundingBox(),a=await page.locator('[data-action="rules"]').boundingBox(),phone=await page.locator('#phone').boundingBox();assert.ok(Math.abs(r.x+r.width-a.x-a.width)<2);assert.ok(Math.abs(r.y-a.y-a.height-12)<2);assert.ok(r.y+r.height<=phone.y+phone.height-8);
 assert.match(await panel.textContent(),/优惠券/);assert.match(await panel.textContent(),/30、30、40/);
 if(name==='mobile')await page.screenshot({path:'preview-rules-popover.png'});
 await page.locator('[aria-label="关闭玩法"]').click();await panel.waitFor({state:'detached'});assert.equal(await page.locator('#app').evaluate(e=>e.inert),false);assert.equal(await page.locator('[data-action="rules"]').evaluate(e=>e===document.activeElement),true);
 await page.locator('[data-action="rules"]').click();await panel.waitFor();await page.keyboard.press('Escape');await panel.waitFor({state:'detached'});
 await page.locator('[data-action="rules"]').click();await panel.waitFor();await page.locator('[data-action="rules-start"]').click();await page.locator('.photo-viewport').waitFor();assert.equal(await page.locator('#app').evaluate(e=>e.inert),false);
 await page.locator('[data-action="leave"]').click();await page.locator('.sheet [data-go="cover"]').click();await panel.waitFor();assert.match(await page.locator('[data-action="rules-start"]').textContent(),/继续探索/);
 await page.emulateMedia({reducedMotion:'reduce'});await page.keyboard.press('Escape');await panel.waitFor({state:'detached'});assert.deepEqual(errors,[]);await page.close();
}await browser.close();console.log('PASS: auto rules; top-right anchor; desktop/mobile/landscape fit; animated close/reopen; focus restoration; start/resume; reduced motion');})().catch(e=>{console.error(e);process.exit(1)});
