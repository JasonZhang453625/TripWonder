// Start the repository HTTP server first. Output artifacts stay outside Git.
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const base=process.env.TRIPWONDER_URL || 'http://127.0.0.1:8766/';
const output=process.env.TRIPWONDER_TEST_ARTIFACTS || path.join(os.tmpdir(),'tripwonder-sphere-game');
fs.mkdirSync(output,{recursive:true});
const CITIES=['zhangjiajie','guilin','beijing','shanghai','shenzhen','hongkong','suzhou','datong'];
// The challenge has no clues or notes; they are browsed in the community once a city has been challenged.
// mode 'challenge' opens the city's cover through a friend link; 'browse' stops on the community feed (see browse()).
async function cover(browser,city,mode='challenge'){
 const page=await browser.newPage({viewport:{width:390,height:780},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(/THREE.WebGLProgram: Shader Error/.test(m.text()))errors.push(m.text());});
 if(mode==='browse'){
  await page.addInitScript(cities=>{try{localStorage.setItem('tripwonder-v2',JSON.stringify({version:2,challenged:Object.fromEntries(cities.map(id=>[id,{at:1,result:{score:60}}]))}));}catch{}},CITIES);
  await page.goto(base);await page.locator('#app .th-wonder').waitFor();await page.evaluate(()=>window.HomePromo?.dismiss());
  await page.locator('#app .th-wonder').click();await page.locator('.cm-entry[data-go="feed"]').click();await page.locator('#app .cm-feed').waitFor();
 }else{
  const token=Buffer.from(JSON.stringify({cityId:city,score:0})).toString('base64url');
  await page.goto(base+'?challenge='+token);await page.locator('#app .cover-page').waitFor();
  if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
 }
 await page.evaluate(()=>{const Original=window.ImmersivePhotoViewer;window.ImmersivePhotoViewer=class extends Original{constructor(...args){super(...args);window.testSphereViewer=this;}};});
 return {page,errors};
}
// Opening a journey's photos from the feed goes straight into its first scene.
async function browse(page,city){await page.locator('#app [data-journey="'+city+'"] .cm-post-gallery').click();await ready(page);}
async function ready(page){await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();await page.locator('.scene-transition').waitFor({state:'detached'});}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{channel:'chrome'})});
 const report=[];
 try{
  for(const city of CITIES){
   const {page,errors}=await cover(browser,city,'browse');
   await browse(page,city);
   const count=await page.evaluate(city=>TRIPWONDER_CATALOG.cities.find(c=>c.id===city).scenes.length,city);
   for(let index=0;index<count;index++){
    if(index){await page.locator('#app [data-action="next-scene"]').click();await ready(page);}
    const data=await page.evaluate(()=>{const v=window.testSphereViewer;return {id:v.config.id,projection:v.root.dataset.projection,size:v.root.dataset.sourceSize,aspect:v.sourceAspect,eye:v.eye};});
    assert.equal(data.projection,'sphere');assert.equal(data.eye,undefined);
    // Verify photo-anchored clue projection and clickability, even near the photo edges.
    const markerCount=await page.evaluate(()=>testSphereViewer.markers.filter(m=>m.element.matches('.hotspot')).length);
    assert.ok(markerCount>0,`${data.id} shows its clues when browsing`);
    for(let n=0;n<markerCount;n++){
     const marker=await page.evaluate(n=>{const v=testSphereViewer,m=v.markers.filter(m=>m.element.matches('.hotspot'))[n];v.state.yaw=v.state.targetYaw=(m.u-.5)*v.projection.horizontalSpan*180/Math.PI;v.state.pitch=v.state.targetPitch=(.5-m.v)*v.projection.verticalSpan*180/Math.PI;v.updateCamera();v.renderer.render(v.scene,v.camera);return {hidden:m.hidden,u:m.u,v:m.v};},n);
     assert.equal(marker.hidden,false,`${data.id} clue ${n} unreachable`);
     await page.locator('#app [data-clue="'+n+'"]').click();await page.locator('.clue-dialog').waitFor();await page.keyboard.press('Escape');await page.locator('.clue-dialog-overlay').waitFor({state:'detached'});
    }
    await page.evaluate(()=>{const v=testSphereViewer;v.state.yaw=v.state.targetYaw=v.homeYaw();v.state.pitch=v.state.targetPitch=0;v.updateCamera();v.renderer.render(v.scene,v.camera);});
    if(index===0)await page.locator('#phone').screenshot({path:path.join(output,city+'.png')});
    report.push(data);
   }
   assert.deepEqual(errors,[]);console.log('PASS city',city,count);await page.close();
  }
  // Challenge: no clues; leaving the quiz asks first, and "keep playing" stays on the quiz.
  {
   const {page,errors}=await cover(browser,'beijing');
   await page.locator('#app [data-action="start"]').click();await ready(page);
   assert.equal(await page.locator('#app .hotspot').count(),0,'the challenge has no clues');
   // The last scene's next button starts the quiz.
   for(let step=0;step<10&&!(await page.locator('.quiz-page').count());step++){await page.waitForFunction(()=>!window.ChallengeMotion?.busy&&!document.querySelector('.scene-transition'));await page.evaluate(()=>document.querySelector('#app [data-action="next-scene"]')?.click());await page.waitForTimeout(700);}
   await page.locator('.quiz-page').waitFor();
   await page.locator('#app [data-action="quiz-back"]').click();await page.locator('.abandon-actions').waitFor();
   await page.locator('.abandon-actions [data-action="close"]').click();await page.locator('.abandon-actions').waitFor({state:'detached'});
   assert.equal(await page.locator('#app .quiz-page').count(),1,'keep playing stays on the quiz');
   assert.deepEqual(errors,[]);await page.close();
  }
  // Unregistered, newly supplied horizontal image: no scene configuration, no baked assets.
  const {page,errors}=await cover(browser,'beijing','browse');
  await page.evaluate(async()=>{
   const p=TRIPWONDER_CATALOG.cities.find(c=>c.id==='beijing').scenes[0].photo;
   const canvas=document.createElement('canvas');canvas.width=4096;canvas.height=1024;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#2369a4';ctx.fillRect(0,0,4096,512);ctx.fillStyle='#3b7431';ctx.fillRect(0,512,4096,512);ctx.fillStyle='#e0b761';ctx.fillRect(1900,200,300,650);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
   delete window.IMMERSIVE_SCENES[p.id];p.src=URL.createObjectURL(blob);p.original={src:p.src};
  });
  await browse(page,'beijing');
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-source-size'),'4096x1024');
  const canvas=page.locator('#app canvas.immersive-canvas');const box=await canvas.boundingBox();
  const cdp=await page.context().newCDPSession(page);
  // Start the drag on bare photo: a note or clue under the finger keeps the touch for itself.
  const from=await page.evaluate(()=>{const r=document.querySelector('#app .photo-viewport').getBoundingClientRect();for(const y of [350,420,300,480])for(const x of [90,60,130,40])if(document.elementFromPoint(r.left+x,r.top+y)?.matches('canvas.immersive-canvas'))return {x:r.left+x,y:r.top+y};return null;});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+200,y:from.y+30,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>Math.abs(testSphereViewer.state.yaw)>1);
  await page.mouse.move(box.x+195,box.y+350);await page.mouse.wheel(0,-5000);
  await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)===3);
  await canvas.dblclick({position:{x:195,y:350}});
  await page.waitForFunction(()=>Number(document.querySelector('#app .photo-viewport').dataset.zoom)===1);
  // A plain tap on the photo writes a note there: placement uses photoAt() and persists in source-photo UV coordinates.
  const spot=await page.locator('#app .photo-viewport').evaluate(root=>{const r=root.getBoundingClientRect();for(const y of [.45,.6,.35])for(const x of [.5,.3,.7]){const at={x:r.left+r.width*x,y:r.top+r.height*y},n=document.elementFromPoint(at.x,at.y);if(n&&root.contains(n)&&!n.closest('button,a,.tw-bubble,.tw-bundle,.hotspot'))return at;}return null;});
  await page.touchscreen.tap(spot.x,spot.y);await page.locator('.tw-compose').waitFor();
  await page.locator('.tw-compose textarea').fill('球幕留言测试');await page.locator('[data-compose-submit]').click();
  await page.waitForFunction(()=>document.querySelector('.tw-bubble.mine'));
  assert.equal(await page.evaluate(()=>Object.values(TWStore.get().bubbles).flat().some(n=>n.text==='球幕留言测试'&&n.u>=0&&n.u<=1&&n.v>=0&&n.v<=1)),true);
  await page.setViewportSize({width:360,height:720});await page.waitForTimeout(100);
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-projection'),'sphere');
  assert.deepEqual(errors,[]);await page.close();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({scenes:report,unregisteredImage:true,touchDrag:true,zoom:true,notePlacement:true},null,2));
  console.log(JSON.stringify({scenes:report.length,cities:8,unregisteredImage:true,touchDrag:true,zoom:true,notePlacement:true,output}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
