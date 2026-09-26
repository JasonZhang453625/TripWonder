const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const base='http://127.0.0.1:8765/';
const token=Buffer.from(JSON.stringify({cityId:'zhangjiajie',score:0})).toString('base64url');
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy);
async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}}
async function close(page){await page.locator('#modal-root .sheet-close').click();await page.locator('#modal-root .sheet').waitFor({state:'detached'});}
async function enter(page,url=base){
  await page.goto(url+'?challenge='+token);await page.locator('#app .cover-page').waitFor();
  if(await page.locator('.rules-popover').count())await page.locator('[aria-label="关闭玩法"]').click();
  await idle(page);await page.locator('#app [data-action="start"]').click();
  await scene(page,1);
}
async function scene(page,n){
  await page.locator('#app .scene-counter').filter({hasText:`${n} / 4`}).waitFor();
  await page.locator('.scene-transition').waitFor({state:'detached'});await idle(page);
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-rendered'),'true');
  assert.equal(await page.locator('#app .photo-plane>img').count(),0);
}
async function openClue(page,index){
  const root=page.locator('#app .photo-viewport'),marker=page.locator(`#app [data-clue="${index}"]`);
  const bounds=await root.boundingBox();
  for(let attempt=0;attempt<14;attempt++){
    const p=await marker.evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
    if(p.x>=45&&p.x<=bounds.width-45&&p.y>=125&&p.y<=bounds.height-120)break;
    const dx=p.x<45?80:p.x>bounds.width-45?-80:0,dy=p.y<125?60:p.y>bounds.height-120?-60:0;
    await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();
    await page.mouse.move(bounds.x+bounds.width/2+dx,bounds.y+bounds.height/2+dy,{steps:8});await page.mouse.up();
    await page.waitForTimeout(240);
  }
  await marker.click();await page.locator('#modal-root #clue-text').waitFor();
}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const errors=[],report={};
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    page.on('pageerror',e=>errors.push(e.message));
    const requests=[],failed=[];page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
    await enter(page);const city=await page.evaluate(()=>window.TRIPWONDER_CATALOG.cities.find(c=>c.id==='zhangjiajie'));
    assert.equal(await page.evaluate(()=>window.TRIPWONDER_CATALOG.cities.length),8);
    await page.waitForFunction(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/photo-library/zhangjiajie/')&&r.name.includes('/immersive-blur/photo.jpg')).length===4);
    report.preloadedAllFourBeforeNext=true;
    const sizes=['8841x4415','2670x1781','3000x1996','1680x1120'];
    for(let i=0;i<4;i++){
      await scene(page,i+1);
      assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-source-size'),sizes[i]);
      assert.equal(await page.locator('#app [data-clue]').count(),3);
      assert.equal(await page.locator('#app [data-action="next-scene"]').innerText(),i===3?'开始答题':'下一处');
      assert.ok(!/张家界|湖南/.test(await page.locator('#app').innerText()),'destination stays concealed during exploration');
      await shot(page,`zhangjiajie-scene-${i+1}`);
      const wheelPoint=await page.evaluate(()=>{
        for(const x of [80,310,120,270])for(const y of [350,450,550]){
          if(document.elementFromPoint(x,y)?.tagName==='CANVAS')return {x,y};
        }
        throw new Error('No unobstructed canvas point for zoom');
      });
      await page.mouse.move(wheelPoint.x,wheelPoint.y);await page.mouse.wheel(0,5000);
      await page.waitForFunction(()=>{const d=document.querySelector('#app .photo-viewport').dataset;return Math.abs(Number(d.zoom)-Number(d.minZoom))<.001;});
      for(let j=0;j<3;j++){
        await openClue(page,j);assert.equal(await page.locator('#modal-root #clue-text').textContent(),city.scenes[i].hotspots[j].text);
        if(j===0)await shot(page,`zhangjiajie-clue-${i+1}`);await close(page);
      }
      await page.locator('#app [data-action="next-scene"]').click();
    }
    await page.locator('#app .quiz-page').waitFor();await idle(page);
    const fullRequests=requests.filter(x=>x.includes('/photo-library/zhangjiajie/')&&x.includes('/immersive-blur/photo.jpg'));
    assert.equal(fullRequests.length,4,'four scene changes reuse four preloaded files');
    report.scenes=4;report.nativeSizes=sizes;report.hotspots=12;
    for(let i=0;i<3;i++){
      await idle(page);assert.equal(await page.locator('#app .quiz-question').textContent(),city.questions[i].q);
      await page.locator(`#app [data-option="${city.questions[i].answer}"]`).click();await page.locator('#app [data-action="submit"]').click();await idle(page);
    }
    await page.locator('#app .guess-map').waitFor();assert.equal(await page.locator('#app [data-recall]').count(),4);
    await page.locator('#app [data-recall="3"]').click();assert.match(await page.locator('#modal-root .sheet').innerText(),/九十九道弯通向哪里/);await close(page);
    await page.locator('#app .guess-map').click({position:{x:200,y:300}});await page.locator('#app [data-action="guess-submit"]').click();
    await page.locator('#app .guess-card [data-action="show-result"]').click();await page.locator('#app .result-page').waitFor();await idle(page);
    assert.match(await page.locator('#app .result-region').textContent(),/湖南.*张家界/);
    assert.match(await page.locator('#app .result-score-breakdown').textContent(),/线索答题\s*60/);await shot(page,'zhangjiajie-result');
    await page.locator('#app [data-action="share"]').click();assert.equal(await page.locator('.share-preview').getAttribute('data-scene'),'zjj-tianzishan');await close(page);
    await page.locator('#app [data-go="route"]').click();await page.locator('#app .route-hero').waitFor();await idle(page);
    assert.match(await page.locator('#app .route-hero').innerText(),/张家界/);
    const names=await page.locator('#app .route-stop strong').allTextContents();assert.ok(names.length>0);assert.equal(new Set(names).size,names.length);assert.ok(names.every(n=>city.stops.some(stop=>stop.name===n)));report.route=names;
    await page.locator('#app [data-action="save-trip"]').click();await page.locator('#modal-root [data-go="itinerary"]').click();await idle(page);assert.match(await page.locator('#app').innerText(),/张家界/);
    await page.locator('#app [data-go="home"]').click();await idle(page);
    await page.locator('#app .bottom-nav [data-go="profile"]').click();await idle(page);
    await page.locator('#app [data-go="atlas"]').click();await idle(page);
    assert.equal(await page.locator('.collection-destination').count(),8);assert.match(await page.locator('[data-city="zhangjiajie"]').textContent(),/张家界/);report.quizMapResultShareRouteAtlas=true;
    assert.deepEqual(failed,[]);await page.close();

    const library=await browser.newPage();await library.goto(base+'photos.html');await library.locator('[data-filter="zhangjiajie"]').click();
    assert.equal(await library.locator('.photo-card').count(),4);assert.equal(await library.locator('.photo-card a[href$="original.avif"]').count(),1);report.library=true;await library.close();
    const file=await browser.newPage({viewport:{width:390,height:844}});file.on('pageerror',e=>errors.push(e.message));
    await enter(file,pathToFileURL(path.resolve('index.html')).href);await file.locator('#app [data-action="next-scene"]').click();await scene(file,2);
    assert.equal(await file.locator('#app .photo-viewport').getAttribute('data-source-size'),'2670x1781');report.filePreview=true;await file.close();
    assert.deepEqual(errors,[]);const result={passed:true,report,errors};
    if(artifacts)fs.writeFileSync(path.join(artifacts,'zhangjiajie-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
