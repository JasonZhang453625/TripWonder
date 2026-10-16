// Actual Three.js models, elastic corner pressure, routing, renderer lifecycle and fallback.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/',artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const idle=p=>p.waitForFunction(()=>!window.ChallengeMotion?.busy);
const state=p=>p.evaluate(()=>HubCards3D.inspect());
async function hub(p,three=true){await p.goto(base);await p.locator('.th-wonder').waitFor();await p.evaluate(()=>HomePromo.dismiss());await p.locator('.th-wonder').click();await p.locator('.cm-hub').waitFor();await idle(p);await p.waitForFunction(three=>document.querySelector('.cm-hub')?.dataset.hubRenderer===(three?'three':'fallback'),three);}
async function shot(p,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await p.locator('#phone').screenshot({path:path.join(artifacts,name+'.png')});}}
async function back(p){await p.locator('.cm-feed [data-go="hub"]').click();await idle(p);await p.waitForFunction(()=>document.querySelector('.cm-hub')?.dataset.hubRenderer==='three');}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
  await hub(p);const cards=p.locator('.cm-entry');let audit=await state(p);
  assert.equal(audit.cards.length,2);assert.equal(await p.locator('.hub3d-stage canvas[data-renderer="three"]').count(),1);assert.ok(audit.calls<=8&&audit.triangles<12000);await shot(p,'desktop-resting');
  for(let index=0;index<2;index++)for(const [name,x,y] of [['top-left',-1,-1],['top-right',1,-1],['bottom-left',-1,1],['bottom-right',1,1]]){
   const card=cards.nth(index),b=await card.boundingBox();await p.mouse.move(b.x+(x<0?30:b.width-30),b.y+(y<0?30:b.height-30));await p.mouse.down();await p.waitForTimeout(230);
   const model=(await state(p)).cards[index];assert.ok(model.press>.75,`${index}/${name}: actual mesh deformation`);assert.ok(model.touch[0]*x>0&&model.touch[1]*y<0,'local dent follows the touched corner');assert.ok(model.rotation[0]*y<0&&model.rotation[1]*x>0,'model tilts away at the touched corner');
   if(name==='top-right')await shot(p,`card-${index}-pressed`);
   await p.mouse.move(b.x-12,b.y+b.height/2);await p.mouse.up();await p.waitForTimeout(230);
   const rebound=(await state(p)).cards[index];assert.ok(rebound.press<0,'spring crosses rest rather than just easing to zero');
   await p.waitForTimeout(650);assert.ok(Math.abs((await state(p)).cards[index].press)<.015,'spring settles');assert.equal(await p.locator('.cm-hub').count(),1,'release outside cancels navigation');
  }
  const b=await cards.first().boundingBox();await p.mouse.move(b.x+35,b.y+35);await p.mouse.down();await cards.first().dispatchEvent('pointercancel',{pointerId:1,bubbles:true});await p.mouse.up();await p.waitForTimeout(300);assert.equal(await p.locator('.cm-hub').count(),1);
  await cards.nth(1).focus();await p.keyboard.down(' ');await p.waitForTimeout(160);assert.ok((await state(p)).cards[1].press>.3);await p.keyboard.up(' ');await p.locator('.cm-feed').waitFor();await idle(p);assert.equal(await state(p),null,'renderer disposed after leaving');
  for(let i=0;i<3;i++){await back(p);assert.equal(await p.locator('canvas[data-renderer="three"]').count(),1);await cards.nth(1).click();await p.locator('.cm-feed').waitFor();await idle(p);assert.equal(await state(p),null);}
  await back(p);const before=(await state(p)).frames;await p.waitForTimeout(1100);const after=(await state(p)).frames;assert.ok(after-before>=15&&after-before<=40,'idle rendering is capped near 30 fps');
  await cards.first().click();await p.locator('.cover-page').waitFor();await idle(p);assert.equal(await p.locator('.hub3d-stage').count(),0);await p.locator('.rules-popover [data-action="close"]').click();await p.locator('[data-action="start"]').click();await p.locator('.explore-page').waitFor();await p.waitForFunction(()=>!document.querySelector('.scene-transition'));assert.equal(await p.locator('#timer').textContent(),'01:00','one-minute clock preserved');assert.equal(await state(p),null,'no hub renderer beside the sphere viewer');assert.deepEqual(errors,[]);await p.close();
  for(const [name,options] of [['mobile',{...devices['iPhone 13'],deviceScaleFactor:1}],['narrow',{...devices['iPhone 13'],viewport:{width:320,height:640},deviceScaleFactor:1}],['landscape',{...devices['iPhone 13'],viewport:{width:844,height:390},deviceScaleFactor:1}],['reduced',{...devices['iPhone 13'],deviceScaleFactor:1,reducedMotion:'reduce'}]]){
   const page=await browser.newPage(options),issues=[];page.on('pageerror',e=>issues.push(e.message));await hub(page);
   assert.ok(await page.locator('.cm-hub').evaluate(e=>e.scrollHeight<=e.clientHeight));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot(page,name);
   await page.setViewportSize({width:430,height:850});await page.waitForTimeout(200);const model=await state(page);assert.equal(model.cards.length,2);assert.equal(await page.locator('canvas[data-renderer="three"]').count(),1);
   if(name==='reduced'){const frames=model.frames;await page.waitForTimeout(350);assert.equal((await state(page)).frames,frames,'no idle animation with reduced motion');}
   const r=await page.locator('.cm-entry-community').boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await page.locator('.cm-feed').waitFor();await idle(page);assert.deepEqual(issues,[]);await page.close();
  }
  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/i.test(kind)?null:get.call(this,kind,...args);};});
  await hub(fallback,false);assert.equal(await fallback.locator('.cm-hub.is-three-ready').count(),0);await fallback.locator('.cm-entry-community').click();await fallback.locator('.cm-feed').waitFor();await idle(fallback);await fallback.close();
  console.log('PASS: one Three.js canvas / two extruded models / 6 draw calls; local dents at all corners; real spring overshoot and settling; cancellation; keyboard/touch; single-context lifecycle; ~30 fps idle cap; one-minute challenge; 320px/landscape/reduced motion; WebGL fallback.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
