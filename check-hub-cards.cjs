// Browser acceptance: equal rounded cards, directional corner pressure, cancellation,
// keyboard/touch navigation, and reduced motion. Optional screenshots go outside the repository.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy);
async function hub(page){await page.goto(base);await page.locator('.th-wonder').waitFor();await page.evaluate(()=>HomePromo.dismiss());await page.locator('.th-wonder').click();await page.locator('.cm-hub').waitFor();await idle(page);}
async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.locator('#phone').screenshot({path:path.join(artifacts,name+'.png')});}}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));await hub(page);
    const cards=page.locator('.cm-entry');assert.equal(await cards.count(),2);
    const boxes=await cards.evaluateAll(cards=>cards.map(card=>{const b=card.getBoundingClientRect(),s=getComputedStyle(card);return {x:b.x,y:b.y,width:b.width,height:b.height,radius:parseFloat(s.borderRadius),shadow:s.boxShadow};}));
    assert.ok(Math.abs(boxes[0].height-boxes[1].height)<1);assert.ok(boxes.every(b=>b.radius>=24&&b.shadow!=='none'));assert.ok(boxes[1].y>boxes[0].y+boxes[0].height+10);await shot(page,'cards-resting');
    for(let i=0;i<2;i++)for(const [name,x,y] of [['top-left',-1,-1],['top-right',1,-1],['bottom-left',-1,1],['bottom-right',1,1]]){
      const card=cards.nth(i),box=await card.boundingBox();
      await page.mouse.move(box.x+(x<0?28:box.width-28),box.y+(y<0?28:box.height-28));await page.mouse.down();await page.waitForTimeout(160);
      assert.ok(await card.evaluate(el=>el.classList.contains('is-pressed')));
      const depths=await card.evaluate((el,{x,y})=>{const matrix=new DOMMatrix(getComputedStyle(el).transform),point=(x,y)=>{const p=matrix.transformPoint(new DOMPoint(x,y,0));return p.z/p.w;};return {pressed:point(x*el.offsetWidth/2,y*el.offsetHeight/2),opposite:point(-x*el.offsetWidth/2,-y*el.offsetHeight/2)};},{x,y});
      assert.ok(depths.pressed<depths.opposite-5,`${i}/${name}: the touched corner recedes relative to its opposite`);
      if(name==='top-right')await shot(page,`card-${i}-pressed`);
      await page.mouse.move(box.x-12,box.y+box.height/2);await page.mouse.up();await page.waitForTimeout(320);
      assert.equal(await page.locator('.cm-hub').count(),1,'release outside cancels navigation');assert.equal(await card.getAttribute('style'),'', 'pressure styles are cleared');assert.equal(await card.evaluate(el=>el.classList.contains('is-pressed')),false);
    }
    // A cancelled pointer cannot accidentally activate the card on release.
    const card=cards.first(),box=await card.boundingBox();await page.mouse.move(box.x+40,box.y+40);await page.mouse.down();
    await card.dispatchEvent('pointercancel',{pointerId:1,bubbles:true});await page.mouse.up();await page.waitForTimeout(250);assert.equal(await page.locator('.cm-hub').count(),1);
    await cards.nth(1).focus();await page.keyboard.down(' ');assert.equal(await cards.nth(1).evaluate(el=>el.classList.contains('is-pressed')),true);await page.keyboard.up(' ');await page.locator('.cm-feed').waitFor();await idle(page);
    await page.locator('.cm-feed [data-go="hub"]').click();await idle(page);await cards.first().click();await page.locator('.cover-page').waitFor();await idle(page);assert.equal(await page.locator('.cm-entry.is-pressed').count(),0);
    assert.deepEqual(errors,[]);await page.close();
    for(const [name,options] of [['mobile',{...devices['iPhone 13'],deviceScaleFactor:1}],['narrow',{...devices['iPhone 13'],viewport:{width:320,height:640},deviceScaleFactor:1}],['landscape',{...devices['iPhone 13'],viewport:{width:844,height:390},deviceScaleFactor:1}],['reduced',{...devices['iPhone 13'],deviceScaleFactor:1,reducedMotion:'reduce'}]]){
      const p=await browser.newPage(options),issues=[];p.on('pageerror',e=>issues.push(e.message));await hub(p);
      assert.ok(await p.locator('.cm-hub').evaluate(el=>el.scrollHeight<=el.clientHeight));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const layout=await p.locator('.cm-entry').evaluateAll(cards=>cards.map(card=>({height:card.offsetHeight,overflow:card.scrollWidth-card.clientWidth})));assert.equal(layout[0].height,layout[1].height);assert.ok(layout.every(card=>card.overflow<=0));await shot(p,name);
      if(name==='reduced'){const b=await p.locator('.cm-entry').first().boundingBox();await p.mouse.move(b.x+32,b.y+32);await p.mouse.down();assert.equal(await p.locator('.cm-entry').first().evaluate(el=>getComputedStyle(el).transform),'none');await p.mouse.move(0,0);await p.mouse.up();}
      const b=await p.locator('.cm-entry-community').boundingBox();await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await p.locator('.cm-feed').waitFor();await idle(p);assert.deepEqual(issues,[]);await p.close();
    }
    console.log('PASS: equal rounded 3D cards; all four corners on both cards recede; release outside and pointer cancellation; rebound cleanup; keyboard/touch routes; 320px, landscape and reduced motion; no browser errors.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
