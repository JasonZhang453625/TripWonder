const assert=require('node:assert/strict');
const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_URL||'http://127.0.0.1:8765/';
const wait=(page,ms)=>page.waitForTimeout(ms);
async function idle(page){await page.waitForFunction(()=>!window.ChallengeMotion?.busy);}
async function finish(page){
  const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:72})).toString('base64url');
  await page.goto(base+'?challenge='+token);
  await page.locator('.cover-page').waitFor();await idle(page);
  if(await page.locator('.rules-popover').count())await page.locator('[data-action="close"]').click();
  await page.locator('.cover-enter').click();await page.locator('.scene-counter').waitFor();await idle(page);
  const count=Number((await page.locator('.scene-counter').textContent()).split('/')[1]);
  for(let n=1;n<=count;n++){
    await page.locator('[data-action="next-scene"]').click();
    if(n<count)await page.locator('.scene-counter').filter({hasText:`${n+1} / ${count}`}).waitFor();
    await idle(page);
  }
  for(let n=0;n<3;n++){await page.locator('[data-option="0"]').click();await page.locator('[data-action="submit"]').click();await idle(page);}
  await page.locator('.guess-map').click({position:{x:170,y:260}});
  await page.locator('[data-action="guess-submit"]').click();await page.locator('[data-action="show-result"]').click();await idle(page);
  await page.locator('.result-page').waitFor();
}
async function swipe(cdp,page,from,to,{steps=5,delay=16,cancel=false,x=180}={}){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:from}]});
  for(let i=1;i<=steps;i++){
    await wait(page,delay);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:from+(to-from)*i/steps}]});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
}
const state=page=>page.evaluate(()=>{
  const app=document.querySelector('#app'),hero=document.querySelector('.result-hero');
  return {scroll:app.scrollTop,hero:hero.getBoundingClientRect().height,height:app.clientHeight,
    compact:Math.min(296,Math.round(app.clientHeight*.68)),bar:document.querySelector('.result-topbar').getBoundingClientRect().y};
});
async function atStage(page,compact){
  await wait(page,900);const s=await state(page);
  assert.ok(Math.abs(s.hero-(compact?s.compact:s.height))<1,JSON.stringify(s));
  assert.ok(Math.abs(s.scroll)<1,'native scroll starts at zero at either reveal endpoint: '+JSON.stringify(s));
}
async function trace(page){
  await page.evaluate(()=>{
    const app=document.querySelector('#app'),descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'scrollTop');
    window.resultWrites=[];window.resultFrames=[];
    Object.defineProperty(app,'scrollTop',{configurable:true,get(){return descriptor.get.call(this)},set(value){resultWrites.push(value);descriptor.set.call(this,value)}});
    let frame;const sample=()=>{resultFrames.push({y:app.scrollTop,h:document.querySelector('.result-hero').getBoundingClientRect().height});frame=requestAnimationFrame(sample)};
    sample();window.stopResultTrace=()=>{cancelAnimationFrame(frame);delete app.scrollTop;return{writes:resultWrites,frames:resultFrames}};
  });
}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const errors=[];
  try{
    let page=await browser.newPage({...devices['iPhone 13'],viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
    await finish(page);const cdp=await page.context().newCDPSession(page),bar=(await state(page)).bar;
    await page.locator('.result-scroll-cue').click();await wait(page,700);
    // Real compositor-driven fling from the bottom, followed by its momentum tail.
    await page.locator('#app').evaluate(app=>app.scrollTop=app.scrollHeight);await wait(page,100);
    await trace(page);
    await swipe(cdp,page,75,810,{steps:4,delay:12});await wait(page,1300);
    const fling=await page.evaluate(()=>stopResultTrace());
    assert.equal(fling.writes.length,0,'native return fling must never fight JS scrollTop writes: '+JSON.stringify(fling.writes.slice(0,12)));
    assert.ok(fling.frames.every(f=>Math.abs(f.h-296)<1),'native fling must not restart the reveal animation');
    await atStage(page,true);assert.equal((await state(page)).bar,bar);
    console.log('PASS fast native return from bottom: zero corrective scroll writes, no reveal flicker, fixed toolbar');
    await swipe(cdp,page,160,270);await atStage(page,false);
    await swipe(cdp,page,470,450,{delay:65});await atStage(page,false);
    await swipe(cdp,page,470,380);await atStage(page,true);
    await swipe(cdp,page,160,240,{cancel:true});await atStage(page,true);
    await swipe(cdp,page,160,275);await atStage(page,false);
    await swipe(cdp,page,470,400,{cancel:true});await atStage(page,false);
    console.log('PASS fresh touch expands, short drag returns, cancelled gestures settle at their origin');
    await swipe(cdp,page,460,350);await atStage(page,true);
    await swipe(cdp,page,560,200);await wait(page,700);assert.ok((await state(page)).scroll>80,'details still scroll normally: '+JSON.stringify(await state(page)));
    await page.locator('.result-topbar [data-action="share"]').click();const modalScroll=(await state(page)).scroll;
    await page.locator('.result-page').dispatchEvent('wheel',{deltaY:-300});await wait(page,200);assert.equal((await state(page)).scroll,modalScroll);
    await page.locator('[data-action="close"]').click();await page.locator('#modal-root .modal-overlay').waitFor({state:'detached'});
    await swipe(cdp,page,75,810,{steps:4,delay:12});await wait(page,1300);await atStage(page,true);
    for(const viewport of [{width:320,height:568},{width:844,height:390},{width:390,height:844}]){
      await page.setViewportSize(viewport);await atStage(page,true);
    }
    await page.emulateMedia({reducedMotion:'reduce'});await swipe(cdp,page,150,260);await atStage(page,false);
    await swipe(cdp,page,470,360);await atStage(page,true);
    console.log('PASS details, share modal, portrait/landscape resize, reduced motion');
    if(process.env.TRIPWONDER_RESULT_SCREENSHOT)await page.screenshot({path:process.env.TRIPWONDER_RESULT_SCREENSHOT});
    await page.close();
    page=await browser.newPage({viewport:{width:1440,height:1040}});page.on('pageerror',e=>errors.push(e.message));
    await finish(page);await page.locator('.result-scroll-cue').click();await atStage(page,true);
    await page.locator('.result-hero').hover();await page.mouse.wheel(0,-80);await atStage(page,false);
    await page.mouse.wheel(0,12);await atStage(page,false);
    await page.mouse.wheel(0,85);
    for(const delta of [60,30,12]){await wait(page,90);await page.mouse.wheel(0,delta);}
    await atStage(page,true);
    await page.mouse.wheel(0,350);await wait(page,300);assert.ok((await state(page)).scroll>80);
    await page.mouse.wheel(0,-1000);
    for(const delta of [-400,-160,-60]){await wait(page,65);await page.mouse.wheel(0,delta);}
    await atStage(page,true);
    await page.mouse.wheel(0,-90);await atStage(page,false);
    await page.locator('.result-scroll-cue').focus();await page.keyboard.press('Escape');
    await page.locator('#app').evaluate(app=>{app.tabIndex=-1;app.focus()});
    await page.keyboard.press('PageDown');await atStage(page,true);
    await page.keyboard.press('PageUp');await atStage(page,false);
    assert.deepEqual(errors,[]);
    console.log('PASS wheel momentum boundaries, fresh wheel expansion, keyboard, no browser errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
