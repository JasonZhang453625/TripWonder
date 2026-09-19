const {chromium,devices} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = 'http://127.0.0.1:8765/';
const waitScene = (page,n) => page.waitForFunction(n=>document.querySelector('.scene-counter')?.textContent===`${n} / 3`,n);
const begin = async page => {await page.goto(url);await page.locator('.entry').click();await page.locator('[data-action="rules-start"]').click();await waitScene(page,1)};
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const errors=[], report={};
 const make=async()=>{const p=await browser.newPage({...devices['iPhone 13']});p.on('pageerror',e=>errors.push(e.message));return p};
 // Hold the next scene response. The existing decoded image and controls must stay mounted.
 const page=await make();let release;const gate=new Promise(r=>release=r);let nextRequests=0;
 await page.route('**/huayan/screen.webp',async route=>{nextRequests++;await gate;await route.continue()});
 await begin(page);await page.waitForTimeout(300);
 const old=await page.locator('.photo-plane>img').elementHandle();const header=await page.locator('.immersive-top').elementHandle();
 await page.locator('[data-action="next-scene"]').click();await page.waitForTimeout(500);
 assert.equal(await page.locator('.scene-counter').textContent(),'1 / 3');
 assert.ok(await old.evaluate(e=>e.isConnected&&e.complete&&e.naturalWidth===1080));
 assert.equal(await page.locator('[data-action="next-scene"]').isDisabled(),true);
 // A second synthetic click cannot skip a scene or start a duplicate request.
 await page.evaluate(()=>document.querySelector('[data-action="next-scene"]').click());release();await waitScene(page,2);
 assert.equal(nextRequests,1);assert.ok(await header.evaluate(e=>e.isConnected));
 assert.ok(await page.locator('.photo-plane>img').evaluate(e=>e.complete&&e.naturalWidth>0));
 report.slowTransition='old decoded photo retained; shell retained; one request; no skipped scene';await page.close();

 // Failure retains the old scene; the same button retries successfully.
 const retry=await make();let fail=true;
 await retry.route('**/huayan/screen.webp',r=>fail?r.abort('failed'):r.continue());await begin(retry);
 await retry.locator('[data-action="next-scene"]').click();
 await retry.waitForFunction(()=>!document.querySelector('[data-action="next-scene"]').disabled);
 assert.equal(await retry.locator('.scene-counter').textContent(),'1 / 3');assert.equal(await retry.locator('.photo-plane>img').evaluate(e=>e.naturalWidth),1080);
 fail=false;await retry.locator('[data-action="next-scene"]').click();await waitScene(retry,2);report.retry=true;await retry.close();

 // Late completion must not navigate back after the user leaves or the timer expires.
 const stale=await make();let releaseStale;const staleGate=new Promise(r=>releaseStale=r);
 await stale.route('**/huayan/screen.webp',async r=>{await staleGate;await r.continue().catch(()=>{})});await begin(stale);
 await stale.locator('[data-action="next-scene"]').click();await stale.locator('[data-action="early-quiz"]').click();await stale.locator('[data-action="confirm-quiz"]').click();
 releaseStale();await stale.waitForTimeout(300);assert.equal(await stale.locator('.quiz-top').count(),1);report.lateResponseIgnored=true;await stale.close();

 // Timer expiration cancels a pending scene without adding its unseen questions.
 const timed=await make();let releaseTimed;const timedGate=new Promise(r=>releaseTimed=r);
 await timed.route('**/huayan/screen.webp',async r=>{await timedGate;await r.continue().catch(()=>{})});await begin(timed);
 await timed.clock.install();await timed.locator('[data-action="next-scene"]').click();await timed.clock.fastForward(181000);
 await timed.locator('.quiz-top').waitFor();releaseTimed();assert.equal(await timed.locator('.photo-viewport').count(),0);report.timeoutDuringLoad=true;await timed.close();

 // Real browser network throttling + 4x CPU slowdown; no original JPEG requests.
 const slow=await make(),cdp=await slow.context().newCDPSession(slow);const requests=[];
 slow.on('request',r=>{if(/photo-library/.test(r.url()))requests.push(r.url())});
 await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:250*1024,uploadThroughput:128*1024});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await begin(slow);
 for(let n=2;n<=3;n++){await slow.locator('[data-action="next-scene"]').click();await waitScene(slow,n)}
 assert.ok(requests.every(r=>r.endsWith('.webp')));assert.ok(requests.filter(r=>/screen.webp$/.test(r)).length<=3);
 report.throttled={latencyMs:150,downloadKBps:250,cpuSlowdown:4,requests};
 await slow.screenshot({path:'preview-media-mobile.png',animations:'disabled'});await slow.close();

 // Data saver does not speculatively fetch the next photo or any video.
 const saver=await make();const saverRequests=[];
 await saver.addInitScript(()=>{const connection=new EventTarget();connection.saveData=true;connection.effectiveType='4g';Object.defineProperty(navigator,'connection',{get:()=>connection})});
 saver.on('request',r=>saverRequests.push(r.url()));await begin(saver);await saver.waitForTimeout(400);
 assert.ok(!saverRequests.some(u=>/huayan\/screen|xuankong\/screen/.test(u)));report.dataSaver=true;await saver.close();

 // Generate a tiny video in the browser: exercise real decode, not a mocked playing event.
 const video=await make();await video.goto(url);
 await video.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=108;canvas.height=144;const ctx=canvas.getContext('2d'),stream=canvas.captureStream(12);
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
  const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start();let n=0;
  const frame=setInterval(()=>{ctx.fillStyle=++n%2?'#2855f7':'#4475fc';ctx.fillRect(0,0,108,144)},60);
  await new Promise(r=>setTimeout(r,450));recorder.stop();await done;clearInterval(frame);stream.getTracks().forEach(t=>t.stop());
  window.fixtureURL=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));SCENES[0].video={sources:[{src:fixtureURL,type:'video/webm'}]};
 });
 await video.locator('.entry').click();await video.locator('[data-action="rules-start"]').click();await video.locator('.scene-video.ready').waitFor();
 assert.equal(await video.locator('.photo-plane>img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
 assert.equal(await video.locator('video').evaluate(e=>e.muted&&e.playsInline&&!e.paused&&e.videoWidth>0),true);
 const element=await video.locator('video').elementHandle();
 await video.evaluate(()=>{window.testHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>testHidden});document.dispatchEvent(new Event('visibilitychange'))});
 assert.ok(await element.evaluate(e=>e.paused&&!e.getAttribute('src')&&!e.isConnected));
 await video.evaluate(()=>{testHidden=false;document.dispatchEvent(new Event('visibilitychange'))});await video.locator('.scene-video.ready').waitFor();
 const resumed=await video.locator('video').elementHandle();await video.locator('[data-action="next-scene"]').click();await waitScene(video,2);
 assert.ok(await resumed.evaluate(e=>e.paused&&!e.getAttribute('src')&&!e.isConnected));
 await video.evaluate(()=>URL.revokeObjectURL(fixtureURL));report.video='real WebM decode; poster retained; visibility cleanup/resume; scene exit releases decoder';await video.close();

 for(const mode of ['failure','autoplay','reduced']){
  const p=await make();await p.goto(url);
  if(mode==='reduced')await p.emulateMedia({reducedMotion:'reduce'});
  await p.evaluate(mode=>{SCENES[0].video={sources:[{src:'missing-test-video.mp4',type:'video/mp4'}]};if(mode==='autoplay')HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'))}},mode);
  await p.locator('.entry').click();await p.locator('[data-action="rules-start"]').click();await waitScene(p,1);
  await p.waitForFunction(()=>!document.querySelector('video'));assert.ok(await p.locator('.photo-plane>img').evaluate(e=>e.complete&&e.naturalWidth>0));await p.close();
 }
 report.videoFallback=true;assert.deepEqual(errors,[]);report.errors=errors;
 fs.writeFileSync('check-media-result.json',JSON.stringify(report,null,2));await browser.close();console.log('PASS: slow load, retry, stale response, timer race, throttled mobile, data saver, real video decode/lifecycle, autoplay/error/reduced-motion poster fallback');
})().catch(e=>{console.error(e);process.exit(1)});
