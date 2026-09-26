const assert=require('node:assert/strict');
const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base='http://127.0.0.1:8765/';
const token=id=>Buffer.from(JSON.stringify({cityId:id,score:72})).toString('base64url');
const current=page=>page.locator('.cover-page').getAttribute('data-cover-city');
async function closeRules(page){
  await page.locator('.cover-page').waitFor();
  await page.waitForFunction(()=>!ChallengeMotion.busy);
  if(await page.locator('.rules-popover').count()){
    await page.locator('[data-action="close"]').click();
    await page.locator('.rules-popover').waitFor({state:'detached'});
  }
}
async function open(page,url=base){
  await page.goto(url);
  if(await page.locator('.trip-home').count()){
    await page.keyboard.press('Escape');await page.locator('.hp-layer').waitFor({state:'detached'});
    await page.locator('.th-wonder').click();
  }
  await closeRules(page);
}
async function swipe(page,direction,{small=false,vertical=false,cancel=false,touch=false}={}){
  const box=await page.locator('.cover-page').boundingBox(),old=await current(page);
  const x=box.x+box.width*(direction===1?.72:.28),y=box.y+box.height*.52;
  const dx=vertical?0:(direction===1?-1:1)*(small?14:box.width*.45),dy=vertical?-130:0;
  if(touch){
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let n=1;n<=6;n++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*n/6,y:y+dy*n/6}]});
    await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await cdp.detach();
  }else{
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up();
  }
  if(small||vertical||cancel){await page.waitForTimeout(450);assert.equal(await current(page),old);}
  else await page.waitForFunction(id=>document.querySelector('.cover-page')?.dataset.coverCity!==id,old);
  await page.waitForFunction(()=>!document.querySelector('.cover-changing'));
}
async function idle(page){await page.waitForFunction(()=>!ChallengeMotion.busy);await page.locator('.scene-transition').waitFor({state:'detached'});}
async function complete(page){
  await page.locator('.cover-enter').click();await page.locator('.scene-counter').waitFor();await idle(page);
  const total=Number((await page.locator('.scene-counter').textContent()).split('/')[1]);
  for(let i=1;i<=total;i++){
    await page.locator('[data-action="next-scene"]').click();
    if(i<total)await page.locator('.scene-counter').filter({hasText:`${i+1} / ${total}`}).waitFor();
    await idle(page);
  }
  for(let i=0;i<3;i++){
    await page.locator('[data-option="0"]').click();await page.locator('[data-action="submit"]').click();await idle(page);
  }
  await page.locator('.guess-map').click({position:{x:170,y:260}});
  await page.locator('[data-action="guess-submit"]').click();await page.locator('[data-action="show-result"]').click();await idle(page);
  await page.locator('.result-page').waitFor();
}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1040}});page.on('pageerror',e=>errors.push(e.message));
    await open(page);
    const initial=await current(page),seen=[initial];
    assert.equal(await page.locator('.cover-dock button').count(),3);
    assert.equal(await page.locator('[data-action="skip"],.cover-pagination,.cover-dots,.cover-swipe-hint').count(),0);
    const style=await page.locator('.cover-enter').evaluate(el=>{const s=getComputedStyle(el);return{fill:s.backgroundColor,image:s.backgroundImage,shadow:s.boxShadow}});
    assert.deepEqual(style,{fill:'rgb(50, 100, 255)',image:'none',shadow:'none'});
    assert.notEqual(await page.locator('.cover-dock').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
    const top=await page.locator('.immersive-top').boundingBox(),dock=await page.locator('.cover-dock').boundingBox();
    for(let n=0;n<5;n++){await swipe(page,1);seen.push(await current(page));}
    assert.equal(seen.at(-1),initial);assert.equal(new Set(seen).size,5);
    assert.deepEqual(await page.locator('.immersive-top').boundingBox(),top);assert.deepEqual(await page.locator('.cover-dock').boundingBox(),dock);
    await swipe(page,-1);assert.equal(await current(page),seen[4]);await swipe(page,1);
    await swipe(page,1,{small:true});await swipe(page,1,{vertical:true});
    await page.locator('.cover-hero').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(id=>document.querySelector('.cover-page').dataset.coverCity!==id,initial);
    assert.equal(await current(page),seen[1]);
    await page.locator('[data-go="atlas"]').click();await page.locator('.atlas-page').waitFor();assert.equal(await page.locator('.collection-destination').count(),5);
    await page.locator('.page-head [data-go="cover"]').click();await page.locator('.cover-page').waitFor();assert.equal(await current(page),seen[1]);
    await page.locator('[data-go="ranking"]').click();await page.locator('.ranking-page').waitFor();
    await page.locator('.page-head [data-go="cover"]').click();await page.locator('.cover-page').waitFor();
    await page.reload();await page.locator('.trip-home').waitFor();await page.keyboard.press('Escape');await page.locator('.th-wonder').click();await closeRules(page);assert.equal(await current(page),initial);
    console.log('PASS dock styling, five unique cities, wrap in both directions, small/vertical gestures, keyboard, collections, refresh');

    // Save the live cover, using the reference pagoda when it is in today's draw.
    if(seen.includes('suzhou')){
      while(await current(page)!=='suzhou')await swipe(page,1);
    }
    if(process.env.TRIPWONDER_COVER_SCREENSHOT)await page.locator('.phone').screenshot({path:process.env.TRIPWONDER_COVER_SCREENSHOT});
    const beforeFailure=await current(page);
    await page.evaluate(()=>{window.savedPrepare=SceneMedia.prepare;SceneMedia.prepare=(...args)=>args[1]?savedPrepare(...args):Promise.reject(new Error('Test unavailable photo'));});
    await page.locator('.cover-hero').focus();await page.keyboard.press('ArrowRight');
    await page.locator('#toast.show').filter({hasText:'照片暂未载入'}).waitFor();
    assert.equal(await current(page),beforeFailure);assert.equal(await page.locator('.cover-enter').isEnabled(),true);
    await page.evaluate(()=>{SceneMedia.prepare=savedPrepare;delete window.savedPrepare;});await swipe(page,1);
    console.log('PASS failed photo stays on current destination and allows retry');
    // Resume a partially explored city after browsing away and back.
    await open(page,base+'?challenge='+token('shenzhen'));
    await page.locator('.cover-enter').click();await page.locator('.scene-counter').waitFor();await idle(page);
    await page.locator('[data-action="next-scene"]').click();await page.locator('.scene-counter').filter({hasText:'2 / 3'}).waitFor();await idle(page);
    await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();await swipe(page,1);await swipe(page,-1);
    assert.equal(await current(page),'shenzhen');await page.locator('.cover-enter').click();await page.locator('.scene-counter').filter({hasText:'2 / 3'}).waitFor();await idle(page);
    assert.notEqual(await page.locator('.explore-page .primary').evaluate(el=>getComputedStyle(el).backgroundImage),'none');
    console.log('PASS per-city exploration resume and unchanged exploration glass');

    const mobile=await browser.newPage({...devices['iPhone 13']});mobile.on('pageerror',e=>errors.push(e.message));
    await open(mobile);const start=await current(mobile);
    await swipe(mobile,1,{touch:true});assert.notEqual(await current(mobile),start);
    await swipe(mobile,-1,{touch:true});assert.equal(await current(mobile),start);
    await swipe(mobile,1,{touch:true,cancel:true});await swipe(mobile,1,{touch:true,vertical:true});
    await mobile.locator('[data-action="rules"]').click();
    await mobile.locator('.cover-page').dispatchEvent('keydown',{key:'ArrowRight'});assert.equal(await current(mobile),start);
    await mobile.locator('[data-action="close"]').click();await mobile.locator('.rules-popover').waitFor({state:'detached'});
    for(const viewport of [{width:320,height:568},{width:844,height:390}]){
      await mobile.setViewportSize(viewport);const b=await mobile.locator('.cover-dock').boundingBox();
      assert.ok(b.x>=0&&b.x+b.width<=viewport.width&&b.y+b.height<=viewport.height);
      assert.equal(await mobile.locator('.cover-enter').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
      assert.equal(await mobile.locator('.cover-page').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
    }
    await mobile.emulateMedia({reducedMotion:'reduce'});await swipe(mobile,1,{touch:true});
    console.log('PASS touch swipe, cancellation, modal blocking, 320px and landscape layout, reduced motion');

    // A full challenge still reaches the result, including an invitation outside today's draw.
    const library=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.map(c=>c.id)),outside=library.find(id=>!seen.includes(id));
    if(outside){await open(page,base+'?challenge='+token(outside));assert.equal(await current(page),outside);const cycle=new Set([outside]);for(let i=0;i<5;i++){await swipe(page,1);cycle.add(await current(page));}assert.equal(cycle.size,5);assert.equal(await current(page),outside);}
    await open(page,base+'?challenge='+token('suzhou'));await complete(page);
    assert.match(await page.locator('.result-details .demo-note').textContent(),/1 \/ 5/);
    assert.deepEqual(errors,[]);console.log('PASS out-of-draw invitation, complete challenge, five-city result count, no browser errors');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
