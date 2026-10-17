// Real-browser acceptance for entry prewarming, canvas reuse and bounded cold navigation.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy);
async function home(page){await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.th-wonder').waitFor();await page.evaluate(()=>HomePromo.dismiss());}
async function warmed(page){await page.waitForFunction(()=>document.querySelector('[data-hub-prewarm]')?.dataset.hubRenderer==='three');await page.waitForTimeout(100);}
function watch(){
  window.entryAudit={frames:[],long:[]};
  new PerformanceObserver(list=>entryAudit.long.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
  document.addEventListener('click',event=>{
    if(!event.target.closest('.th-wonder'))return;
    entryAudit.click=performance.now();let last=performance.now(),count=0;
    requestAnimationFrame(function frame(now){entryAudit.frames.push(now-last);last=now;if(++count<60)requestAnimationFrame(frame);});
    const observer=new MutationObserver(()=>{
      const page=document.querySelector('.cm-hub:not([data-hub-prewarm])');
      if(page&&!entryAudit.visible){entryAudit.visible=performance.now();entryAudit.threeAtEntry=page.dataset.hubRenderer==='three';}
      if(page?.dataset.hubRenderer==='three'&&!entryAudit.ready){entryAudit.ready=performance.now();observer.disconnect();}
    });observer.observe(document,{subtree:true,attributes:true,childList:true});
  },true);
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const [name,options] of [['mobile',{...devices['iPhone 13'],deviceScaleFactor:1}],['desktop',{viewport:{width:1440,height:1080}}]]){
   const page=await browser.newPage(options),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await page.addInitScript(watch);
   // Unrelated fonts must not gate the system-font card texture.
   await page.addInitScript(()=>Object.defineProperty(document.fonts,'ready',{get:()=>new Promise(()=>{})}));
   await home(page);await warmed(page);
   const before=await page.evaluate(()=>{window.warmCanvas=document.querySelector('[data-hub-prewarm] canvas');return HubCards3D.inspect().frames;});
   await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>HubCards3D.inspect().frames),before,'hidden prewarm does not animate');
   assert.equal(await page.locator('[data-hub-prewarm]').getAttribute('aria-hidden'),'true');assert.ok(await page.locator('[data-hub-prewarm]').evaluate(e=>e.inert));assert.equal(await page.locator('[data-hub-prewarm]').isVisible(),false);
   await page.locator('.th-wonder').click();await page.locator('.cm-hub').waitFor();await idle(page);await page.waitForTimeout(200);
   const result=await page.evaluate(()=>({readyMs:entryAudit.ready-entryAudit.click,maxFrame:Math.max(...entryAudit.frames),threeAtEntry:entryAudit.threeAtEntry,reused:document.querySelector('.hub3d-stage canvas')===warmCanvas,long:entryAudit.long.filter(e=>e.start>=entryAudit.click&&e.start<entryAudit.click+500)}));
   assert.ok(result.reused&&result.threeAtEntry,'prepared 3D canvas appears with the page, without a native-card flash');assert.ok(result.readyMs<180,'warm entry is immediate even at 4x CPU throttle');console.log(name,JSON.stringify(result));
   await page.locator('.cm-hub [data-go="home"]').click();await idle(page);await warmed(page);
   await page.locator('.th-nav [data-go="profile"]').click();await idle(page);assert.equal(await page.locator('[data-hub-prewarm],.hub3d-stage').count(),0,'leaving home releases unused prewarm');assert.equal(await page.evaluate(()=>HubCards3D.inspect()),null);
   assert.deepEqual(errors,[]);await page.close();
  }
  const cold=await browser.newPage({...devices['iPhone 13'],deviceScaleFactor:1});await cold.addInitScript(watch);
  let unblock;const gate=new Promise(resolve=>{unblock=resolve;});
  const releaseGate=setTimeout(()=>unblock(),8000);
  await cold.route('**/photo-library/**/thumb.webp*',async route=>{await gate;try{await route.continue();}catch{}});
  await home(cold);await cold.locator('.th-wonder').click();await cold.locator('.cm-hub:not([data-hub-prewarm])').waitFor();
  const delay=await cold.evaluate(()=>entryAudit.visible-entryAudit.click);assert.ok(delay<500,'slow card images cannot block navigation');assert.equal(await cold.locator('.cm-entry-community').isVisible(),true);
  unblock();clearTimeout(releaseGate);await cold.waitForFunction(()=>document.querySelector('.cm-hub')?.dataset.hubRenderer==='three');await idle(cold);await cold.locator('.cm-entry-community').click();await cold.locator('.cm-feed').waitFor();await idle(cold);await cold.close();
  console.log('PASS: prewarmed canvas reused at entry; hidden stage stays idle/inert; unrelated fonts cannot block; mobile/desktop at 4x CPU; abandoned warmup disposed; cold navigation bounded with stalled images.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
