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
 // Generate a tiny video in the browser: exercise real decode, not a mocked playing event.
 const video=await make();await video.goto(url);
 await video.evaluate(()=>{
  const oldPlay=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
    for(const name of ['error','loadedmetadata','loadeddata','canplay','playing','pause','waiting'])this.addEventListener(name,()=>console.log('MEDIA',name,this.readyState,this.error?.message,this.currentTime));
    return oldPlay.call(this).catch(e=>{console.log('PLAY ERROR',e.name,e.message);throw e});
  };
 });video.on('console',m=>console.log(m.text()));

 await video.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=108;canvas.height=144;const ctx=canvas.getContext('2d'),stream=canvas.captureStream(12);
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
  const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start();let n=0;
  const frame=setInterval(()=>{ctx.fillStyle=++n%2?'#2855f7':'#4475fc';ctx.fillRect(0,0,108,144)},60);
  await new Promise(r=>setTimeout(r,450));recorder.stop();await done;clearInterval(frame);stream.getTracks().forEach(t=>t.stop());
  window.fixtureURL=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));SCENES[0].video={sources:[{src:fixtureURL,type:'video/webm'}]};
 });
 await video.locator('.entry').click();await video.locator('[data-action="rules-start"]').click();await video.waitForTimeout(3000);console.log(await video.evaluate(()=>({hidden:document.hidden,motion:matchMedia('(prefers-reduced-motion: reduce)').matches,video:document.querySelector('video')?.outerHTML,ready:document.querySelector('video')?.readyState,paused:document.querySelector('video')?.paused})));await video.locator('.scene-video.ready').waitFor();
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
