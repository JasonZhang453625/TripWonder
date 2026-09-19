const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const scenarios=[
  ['iphone', {...devices['iPhone 13']}],
  ['android', {...devices['Pixel 7']}],
  ['ipad-desktop', {viewport:{width:1024,height:768},hasTouch:true,userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'}],
  ['desktop-touch', {viewport:{width:1440,height:1000},hasTouch:true}]
 ];
 for(const [name,opts] of scenarios){
  const context=await browser.newContext(opts),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(name==='ipad-desktop')await page.addInitScript(()=>Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5}));
  await page.goto('http://127.0.0.1:8765/');
  const mobile=name!=='desktop-touch';assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('mobile-device')),mobile,name);
  const checkFit=async()=>{const metrics=await page.evaluate(()=>{const r=document.querySelector('.phone').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,iw:innerWidth,ih:innerHeight,scroll:document.documentElement.scrollWidth}});assert.deepEqual([metrics.x,metrics.y,metrics.w,metrics.h],[0,0,metrics.iw,metrics.ih],name);assert.equal(metrics.scroll,metrics.iw,name)};
  if(!mobile){assert.ok(await page.locator('.presentation').isVisible());assert.ok(await page.locator('.phone').evaluate(e=>e.clientWidth<500));await context.close();continue}
  await checkFit();assert.equal(await page.locator('.presentation').isVisible(),false);assert.equal(await page.locator('.statusbar').isVisible(),false);assert.equal(await page.locator('.home-indicator').isVisible(),false);
  await page.locator('.entry').click();await page.locator('[data-action="start"]').click();await page.locator('.photo-plane img').evaluate(e=>e.decode());
  await checkFit();assert.equal(await page.locator('.photo-viewport').evaluate(e=>e.clientHeight),await page.evaluate(()=>innerHeight));
  if(name==='iphone')await page.screenshot({path:'preview-mobile-device.png',animations:'disabled'});
  await page.setViewportSize({width:844,height:390});await checkFit();
  // Safe areas simulated as CSS variables; real inset values depend on OS/browser.
  await page.evaluate(()=>{for(const [k,v] of Object.entries({'--safe-left':'44px','--safe-right':'44px','--safe-bottom':'21px'}))document.documentElement.style.setProperty(k,v)});
  for(const selector of ['[data-action="leave"]','[data-action="next-scene"]','[data-action="notebook"]','[data-action="language"]','[data-action="zoom-reset"]']){
   const box=await page.locator(selector).boundingBox();assert.ok(box.x>=44&&box.x+box.width<=800&&box.y>=0&&box.y+box.height<=369,selector+' safe bounds');
  }
  if(name==='iphone')await page.screenshot({path:'preview-mobile-landscape.png',animations:'disabled'});
  await page.locator('[data-action="early-quiz"]').click();await page.locator('[data-action="confirm-quiz"]').click();await checkFit();
  for(const answer of [0,1,2]){await page.locator(`[data-option="${answer}"]`).click();await page.locator('[data-action="submit"]').click();await page.locator('[data-action="next-question"]').click()}
  assert.match(await page.locator('.score').textContent(),/100/);await checkFit();
  await page.locator('#app [data-go="route"]').click();await page.locator('[data-action="save-trip"]').click();await page.locator('.sheet [data-go="itinerary"]').click();await checkFit();
  await page.setViewportSize({width:390,height:650});await checkFit();assert.deepEqual(errors,[]);await context.close();
 }
 await browser.close();console.log('PASS: iPhone, Android, iPad desktop UA; landscape safe areas; viewport resize; quiz/result/route/itinerary; desktop touch unchanged');
})().catch(e=>{console.error(e);process.exit(1)});
