const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8787/';
const output=process.env.TRIPWONDER_TEST_ARTIFACTS;
const idle=p=>p.waitForFunction(()=>!ChallengeMotion.busy&&!document.querySelector('.scene-transition'));
async function openOfficial(p){
 await p.goto(base);await p.locator('.th-wonder').waitFor();await p.evaluate(()=>HomePromo.dismiss());
 await p.locator('.th-wonder').click();await p.locator('.cm-hub').waitFor();await idle(p);
 await p.locator('.cm-entry[data-go="feed"]').click();await p.locator('.cm-feed').waitFor();await idle(p);
 await p.locator('[data-journey="shenzhen"] .cm-post-gallery').click();await p.locator('[data-journey-comments]').waitFor();await idle(p);
}
async function ratio(p){return p.locator('.journey-comments-panel').evaluate(e=>e.getBoundingClientRect().height/e.closest('.journey-comments-layer').getBoundingClientRect().height);}
async function drag(p,dy){const box=await p.locator('.journey-comments-head').boundingBox();const x=box.x+box.width/2,y=box.y+12;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x,y+dy,{steps:12});await p.mouse.up();await p.waitForTimeout(320);}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const width of [390,1280]){
  const p=await browser.newPage({viewport:{width,height:width===390?844:1080},hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('tripwonder-bubble-filter','off');localStorage.setItem('tripwonder-v2',JSON.stringify({version:2,challenged:{shenzhen:{at:1,result:{score:80}}}}));});
  await openOfficial(p);
  assert.equal(await p.locator('#phone.immersive').count(),1);assert.equal(await p.locator('#app .cm-gallery').count(),0);
  assert.equal(await p.locator('.photo-viewport[data-rendered="true"]').count(),1);
  assert.equal(await p.locator('.journey-comments-layer').isVisible(),false);
  assert.equal(await p.locator('.tw-bubble-bar,[data-bubble-filter],[data-bubble-new]').count(),0,'old scene toolbar removed');
  assert.equal(await p.locator('[data-journey-comments]').count(),1,'one comments control');
  const style=await p.locator('[data-journey-comments]').evaluate(e=>{const s=getComputedStyle(e);return {color:s.backgroundColor,blur:s.backdropFilter,bottom:s.bottom};});
  assert.notEqual(style.color,'rgb(255, 255, 255)');assert.ok(style.blur.includes('blur'));assert.equal(style.bottom,'30px');
  // Panning and pinching must stay photo gestures; a plain background tap writes a note.
  const photoBox=await p.locator('.photo-viewport').boundingBox();
  await p.mouse.move(photoBox.x+photoBox.width*.5,photoBox.y+photoBox.height*.55);await p.mouse.down();await p.mouse.move(photoBox.x+photoBox.width*.7,photoBox.y+photoBox.height*.62,{steps:10});await p.mouse.up();
  assert.equal(await p.locator('.tw-compose').count(),0,'drag does not compose');
  const clearPoint=()=>p.locator('.photo-viewport').evaluate(root=>{const r=root.getBoundingClientRect();for(const y of [.45,.6,.35])for(const x of [.45,.65,.25]){const at={x:r.left+r.width*x,y:r.top+r.height*y},n=document.elementFromPoint(at.x,at.y);if(n&&root.contains(n)&&!n.closest('button,.tw-bubble,.tw-bundle,.hotspot'))return at;}throw Error('No clear photo point');});
  let safe=await clearPoint();await p.mouse.dblclick(safe.x,safe.y);await p.waitForTimeout(300);assert.equal(await p.locator('.tw-compose').count(),0,'double click resets photo without creating a note');
  const gesture=await p.context().newCDPSession(p);safe=await clearPoint();
  const pinch=[{x:safe.x-25,y:safe.y,id:31},{x:safe.x+25,y:safe.y,id:32}];
  await gesture.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pinch});
  await gesture.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...pinch[0],x:safe.x-60},{...pinch[1],x:safe.x+60}]});
  await gesture.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(300);
  assert.equal(await p.locator('.tw-compose').count(),0,'pinching does not compose');
  safe=await clearPoint();
  await p.mouse.click(safe.x,safe.y);await p.locator('.tw-compose').waitFor();
  assert.equal(await p.locator('[data-compose-kind],.tw-compose-kinds').count(),0);
  await p.locator('.tw-compose textarea').fill('点击画面留下的位置留言');assert.equal(await p.locator('[data-compose-submit]').isEnabled(),true);
  await p.locator('[data-compose-submit]').click();await p.locator('.tw-compose').waitFor({state:'detached'});
  assert.equal(await p.locator('.tw-bubble.fresh').count(),1);
  const saved=await p.evaluate(()=>Object.values(TWStore.get().bubbles).flat().find(n=>n.text==='点击画面留下的位置留言'));
  assert.ok(saved);assert.equal(saved.kind,undefined,'note does not store a visited category');
  await p.locator('[data-journey-comments]').click();await p.waitForTimeout(350);
  assert.equal(await p.locator('[data-comment-filter],select[name="kind"]').count(),0,'comments have no visited categories');
  assert.ok(Math.abs(await ratio(p)-.52)<.015,'opens half screen');
  if(output){fs.mkdirSync(output,{recursive:true});await p.screenshot({path:path.join(output,`half-${width}.png`)});}
  await drag(p,-150);assert.ok(await ratio(p)>.98,'drag expands full screen');
  await drag(p,130);assert.ok(Math.abs(await ratio(p)-.52)<.015,'drag down restores half screen');
  const listBox=await p.locator('.cm-board').boundingBox(),cdp=await p.context().newCDPSession(p);
  const touchPoint={x:Math.round(listBox.x+listBox.width/2),y:Math.round(listBox.y+75),id:1};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchPoint]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...touchPoint,y:touchPoint.y-80}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForTimeout(320);assert.ok(await ratio(p)>.98,'swiping the comment list expands full screen');
  await p.locator('[data-comment-compose]').click();await p.locator('.cm-comment-form textarea').fill('沉浸照片下的评论测试');
  await p.waitForTimeout(320);assert.ok(await ratio(p)>.98,'typing expands the sheet');
  await p.locator('.cm-comment-send').click();assert.ok((await p.locator('.cm-comments').innerText()).includes('沉浸照片下的评论测试'));
  const like=p.locator('.cm-like').first();await like.click();assert.equal(await like.getAttribute('aria-pressed'),'true');
  await p.locator('[data-comment-reply]').first().click();await p.locator('.cm-comment-form textarea').fill('回复也正常');await p.locator('.cm-comment-send').click();assert.ok((await p.locator('.cm-comments').innerText()).includes('回复也正常'));
  await p.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));await p.waitForTimeout(260);
  assert.equal(await p.locator('.journey-comments-layer').isVisible(),false,'system back dismisses sheet first');
  assert.equal(await p.locator('.photo-viewport[data-rendered="true"]').count(),1);
  await p.locator('[data-journey-comments]').click();await p.waitForTimeout(320);await drag(p,130);
  await p.waitForTimeout(240);assert.equal(await p.locator('.journey-comments-layer').isVisible(),false,'drag down from half screen closes');
  await p.locator('[data-action="next-scene"]').click();await idle(p);assert.match(await p.locator('.scene-counter').textContent(),/2\s*\/\s*3/);
  await p.locator('[data-journey-comments]').click();await p.waitForTimeout(330);assert.ok((await p.locator('.cm-comments').innerText()).includes('沉浸照片下的评论测试'),'comments remain attached to whole journey');
  await p.locator('.journey-comments-close').click();await p.waitForTimeout(260);
  if(output)await p.screenshot({path:path.join(output,`immersive-${width}.png`)});
  await p.locator('[data-action="leave"]').click();await p.locator('.cm-feed').waitFor();await idle(p);
  assert.equal(await p.locator('.journey-comments-layer,.scene-staging').count(),0);
  await p.locator('[data-journey="ugc-shapowei"] [data-feed-discuss]').first().click();await p.locator('.cm-journey').waitFor();await idle(p);
  assert.equal(await p.locator('.cm-board.is-locked').count(),1,'unplayed UGC comments stay locked');
  assert.equal(await p.locator('.photo-viewport[data-rendered="true"]').count(),1,'unplayed player journey still uses immersive photos');
  assert.equal(await p.locator('.hotspot').count(),0,'unplayed player scene does not reveal clue hotspots');
  assert.deepEqual(errors,[]);console.log(`PASS ${width}: immersive view, half/full drag, comments, replies, likes, system back, scene navigation, UGC lock`);await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
