const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base=process.env.TRIPWONDER_URL || 'http://127.0.0.1:8765/';
const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const shot=async(page,name)=>{if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}};
const counter=page=>page.locator('#app .scene-counter');
async function enter(page,url=base){
  await page.goto(url+'?challenge='+token);
  await page.locator('#app .cover-page').waitFor();
  if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
  await page.locator('#app [data-action="start"]').click();
  await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();
  await page.locator('.scene-transition').waitFor({state:'detached'});
}
async function waitScene(page,n){await counter(page).filter({hasText:`${n} / 3`}).waitFor();await page.locator('.scene-transition').waitFor({state:'detached'});}
async function gateImage(page,part){
  let release,requests=0;
  const gate=new Promise(r=>release=r);
  await page.route('**/'+part+'/{immersive-blur/photo.jpg,original.*,oriented.*}*',async route=>{requests++;await gate;await route.continue().catch(()=>{});});
  return {release,count:()=>requests};
}
(async()=>{
 const browser=await chromium.launch({...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{channel:'chrome'}),headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const errors=[],report={};
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
  const requests=[];page.on('request',r=>requests.push(r.url()));
  const gate=await gateImage(page,'shenzhen/houhai');
  let fail=true,attempts=0;
  await page.route('**/shenzhen/qianhai/{immersive-blur/photo.jpg,original.*,oriented.*}*',route=>{attempts++;return fail?route.abort('failed'):route.continue();});
  await enter(page);const old=await page.locator('#app canvas').elementHandle();
  assert.equal(gate.count(),1,'next scene downloads before clicking next');
  assert.equal(attempts,1,'all destination scenes preload, including the last scene');
  await page.evaluate(()=>{window.sceneFrames=[];window.samplingScene=true;const sample=()=>{if(!window.samplingScene)return;const root=document.querySelector('#app .photo-viewport');window.sceneFrames.push({counter:document.querySelector('#app .scene-counter')?.textContent,rendered:root?.dataset.rendered,plain:root?.querySelectorAll('img').length||0});requestAnimationFrame(sample);};sample();});
  await page.locator('#app [data-action="next-scene"]').click();await page.locator('.scene-transition').waitFor();await page.waitForTimeout(300);
  assert.equal(await counter(page).textContent(),'1 / 3');assert.ok(await old.evaluate(e=>e.isConnected));assert.equal(await page.locator('#app [data-action="next-scene"]').isDisabled(),true);
  assert.equal(await page.locator('#app .photo-plane>img').count(),0);
  await page.locator('#app [data-action="next-scene"]').evaluate(e=>e.click());assert.equal(gate.count(),1);
  await shot(page,'scene-transition-loading');gate.release();await waitScene(page,2);
  assert.equal(await old.evaluate(e=>e.isConnected),false);
  const frames=await page.evaluate(()=>{window.samplingScene=false;return window.sceneFrames});
  assert.ok(frames.some(x=>x.counter==='2 / 3'));
  assert.ok(frames.every(x=>!x.plain&&x.rendered==='true'),'every visible scene was rendered before commit');
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-source-size'),'7002x4668');
  assert.ok(!requests.some(x=>/houhai\/(screen|detail)\./.test(x)),'no intermediate screen/detail image request');
  assert.ok(!requests.some(x=>/immersive-sz-houhai-assets\.js/.test(x)),'HTTP uses the texture directly');
  await shot(page,'scene-transition-ready');report.slowLoad={frames:frames.length,oneRequest:gate.count(),nativeSize:'7002x4668',noFlatImage:true};

  // Both touch pinch and wheel now reach 3x; reset returns to the original framing.
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:145,y:330,id:1},{x:245,y:330,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:45,y:330,id:1},{x:345,y:330,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)>2.99);
  await shot(page,'scene-zoom-3x');
  await page.locator('#app canvas').dblclick({position:{x:195,y:330}});await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)===1);
  await page.mouse.move(195,330);await page.mouse.wheel(0,-5000);await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)===3);report.zoom={pinch:3,wheel:3};
  // Sphere projection stops at 1x, keeping every ray inside the source photo.
  const minimum=Number(await page.locator('#app .photo-viewport').getAttribute('data-min-zoom'));
  assert.equal(minimum,1);
  await page.mouse.wheel(0,5000);
  await page.waitForFunction(()=>{const d=document.querySelector('#app .photo-viewport').dataset;return Math.abs(Number(d.zoom)-Number(d.minZoom))<.001;});
  await shot(page,'scene-zoom-minimum');
  await page.mouse.wheel(0,-5000);await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)===3);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:45,y:330,id:1},{x:345,y:330,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:170,y:330,id:1},{x:220,y:330,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>{const d=document.querySelector('#app .photo-viewport').dataset;return Math.abs(Number(d.zoom)-Number(d.minZoom))<.001;});
  await page.locator('#app canvas').dblclick({position:{x:195,y:330}});await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)===1);
  report.zoom.minimum={pinch:minimum,wheel:minimum,reset:1};

  // A failed target never replaces the current scene; retry starts one fresh request.
  const retained=await page.locator('#app canvas').elementHandle();
  await page.locator('#app [data-action="next-scene"]').click();await page.waitForFunction(()=>!document.querySelector('#app [data-action="next-scene"]').disabled);
  assert.equal(await counter(page).textContent(),'2 / 3');assert.ok(await retained.evaluate(e=>e.isConnected));assert.equal(await page.locator('.scene-staging,.scene-transition').count(),0);
  fail=false;await page.locator('#app [data-action="next-scene"]').click();await waitScene(page,3);assert.equal(attempts,3);report.retry=true;await page.close();

  // Leaving while a texture is loading cancels the staging renderer and prevents a late return.
  const cancel=await browser.newPage({viewport:{width:390,height:844}});cancel.on('pageerror',e=>errors.push(e.message));
  const cancelledGate=await gateImage(cancel,'shenzhen/houhai');await enter(cancel);await cancel.locator('#app [data-action="next-scene"]').click();await cancel.locator('.scene-transition').waitFor();
  await cancel.locator('#app [data-action="leave"]').click();await cancel.locator('#app .cover-page').waitFor();cancelledGate.release();await cancel.waitForTimeout(350);
  assert.equal(await cancel.locator('#app .explore-page,.scene-staging,.scene-transition').count(),0);report.cancel=true;await cancel.close();

  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const reducedGate=await gateImage(reduced,'shenzhen/houhai');await enter(reduced);await reduced.locator('#app [data-action="next-scene"]').click();await reduced.locator('.scene-transition').waitFor();assert.equal(await reduced.locator('.scene-transition-orbit').evaluate(e=>getComputedStyle(e).animationName),'none');reducedGate.release();await waitScene(reduced,2);report.reducedMotion=true;await reduced.close();

  // Keep the existing build-free file:// preview functional, including WebGL textures.
  const offline=await browser.newPage({viewport:{width:390,height:844}});offline.on('pageerror',e=>errors.push(e.message));await enter(offline,pathToFileURL(path.resolve('index.html')).href);assert.equal(await offline.locator('#app .photo-viewport').getAttribute('data-source-size'),'3000x2000');assert.equal(await offline.locator('#app .photo-plane>img').count(),0);report.filePreview=true;await offline.close();
  assert.deepEqual(errors,[]);if(artifacts)fs.writeFileSync(path.join(artifacts,'scene-transition-report.json'),JSON.stringify({passed:true,report,errors},null,2));console.log(JSON.stringify({passed:true,report,errors}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
