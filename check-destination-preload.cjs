const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
const url='http://127.0.0.1:8765/?challenge='+token;
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;

async function instrument(page){
  await page.addInitScript(()=>{
    const audit=window.preloadAudit={files:[],created:[],revoked:[]};
    const fetchFile=window.fetch;
    window.fetch=async function(url,options){
      if(!String(url).includes('/immersive-blur/photo.jpg'))return fetchFile.call(this,url,options);
      const item={url:String(url),priority:options?.priority,aborted:false,done:false};audit.files.push(item);
      options.signal.addEventListener('abort',()=>item.aborted=true,{once:true});
      const response=await fetchFile.call(this,url,options),read=response.blob.bind(response);
      response.blob=async()=>{const blob=await read();item.done=true;return blob;};
      return response;
    };
    const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
    URL.createObjectURL=blob=>{const url=create(blob);audit.created.push(url);return url;};
    URL.revokeObjectURL=url=>{audit.revoked.push(url);return revoke(url);};
  });
}
async function gate(page,scene){
  let release;const pending=new Promise(resolve=>release=resolve);
  await page.route(`**/shenzhen/${scene}/immersive-blur/photo.jpg*`,async route=>{await pending;await route.continue().catch(()=>{});});
  return release;
}
async function cover(page){
  await page.goto(url);await page.locator('#app .cover-page').waitFor();
  if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
}
async function scene(page,n){
  await page.locator('#app .scene-counter').filter({hasText:`${n} / 3`}).waitFor();
  await page.locator('.scene-transition').waitFor({state:'detached'});
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-rendered'),'true');
  assert.equal(await page.locator('#app .photo-plane>img').count(),0);
}

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const errors=[],report={};
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    page.on('pageerror',e=>errors.push(e.message));await instrument(page);
    const first=await gate(page,'futian'),second=await gate(page,'houhai');
    await cover(page);
    await page.waitForFunction(()=>preloadAudit.files.length===1);
    assert.equal(await page.evaluate(()=>preloadAudit.files.length),1,'cover starts only the first full-resolution scene');
    await page.locator('#app [data-action="start"]').click();
    await page.waitForFunction(()=>preloadAudit.files.length===1);await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>preloadAudit.files.length),1,'first image has priority over preloading');
    first();await scene(page,1);
    await page.waitForFunction(()=>preloadAudit.files.length===3);
    const pending=await page.evaluate(()=>preloadAudit.files);
    assert.deepEqual(pending.map(x=>x.priority),['low','low','low']);
    assert.ok(pending.every(x=>x.url.includes('/shenzhen/')),'only the selected destination preloads');
    assert.equal(pending.find(x=>x.url.includes('/houhai/')).done,false,'current scene is usable while a background download is blocked');
    assert.equal(await page.locator('.immersive-canvas').count(),1,'background loading does not create extra GPU viewers');
    second();await page.waitForFunction(()=>preloadAudit.files.length===3&&preloadAudit.files.every(x=>x.done)&&preloadAudit.created.length===3);
    report.allDownloadedBeforeNext=true;
    await page.waitForFunction(()=>ImmersiveSceneMedia.status().decodedScenes.includes('sz-houhai'));
    assert.deepEqual((await page.evaluate(()=>ImmersiveSceneMedia.status().decodedScenes)).sort(),['sz-futian','sz-houhai']);
    assert.equal(await page.locator('.immersive-canvas').count(),1,'preparing next pixels does not allocate a background GPU viewer');
    report.nextDecodedBeforeClick=true;

    // With every file cached, scene changes must work even when the image server becomes unavailable.
    let unexpectedRequests=0;
    const noNetwork=route=>{unexpectedRequests++;return route.abort('failed');};
    await page.route('**/immersive-blur/photo.jpg*',noNetwork);
    report.switchMilliseconds=[];
    for(const [action,n] of [['next-scene',2],['next-scene',3],['prev-scene',2],['prev-scene',1]]){
      const started=Date.now();await page.locator(`#app [data-action="${action}"]`).click();await scene(page,n);
      report.switchMilliseconds.push(Date.now()-started);
    }
    assert.equal(unexpectedRequests,0);
    assert.equal(await page.evaluate(()=>preloadAudit.files.length),3);
    report.cachedForwardAndBack=true;
    if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,'destination-preloaded.png')});}
    await page.locator('#app [data-action="leave"]').click();await page.locator('#app .cover-page').waitFor();
    const released=await page.evaluate(()=>preloadAudit);
    assert.deepEqual([...released.revoked].sort(),[...released.created].sort(),'leaving releases every cached file');
    assert.deepEqual(await page.evaluate(()=>ImmersiveSceneMedia.status().decodedScenes),[],'leaving releases decoded images');
    await page.locator('#app [data-action="start"]').click();await scene(page,1);
    await page.waitForFunction(()=>preloadAudit.created.length===6);
    assert.equal(await page.evaluate(()=>preloadAudit.files.length),3,'re-entry reuses exact bytes even if server caching is disabled');
    assert.equal(unexpectedRequests,0);
    report.reenterWithoutNetwork=true;await page.close();

    // Cancel background downloads without first clicking Next; late responses must not restore exploration.
    const cancel=await browser.newPage({viewport:{width:390,height:844}});
    cancel.on('pageerror',e=>errors.push(e.message));await instrument(cancel);
    const releaseSecond=await gate(cancel,'houhai'),releaseThird=await gate(cancel,'qianhai');
    await cover(cancel);await cancel.locator('#app [data-action="start"]').click();await scene(cancel,1);
    await cancel.waitForFunction(()=>preloadAudit.files.length===3);
    await cancel.locator('#app [data-action="leave"]').click();await cancel.locator('#app .cover-page').waitFor();
    assert.ok(await cancel.evaluate(()=>preloadAudit.files.every(x=>x.aborted)));
    assert.equal(await cancel.evaluate(()=>preloadAudit.revoked.length),1);
    releaseSecond();releaseThird();await cancel.waitForTimeout(300);
    assert.equal(await cancel.locator('.scene-staging,.scene-transition,#app .explore-page').count(),0);
    report.cancelAndRelease=true;await cancel.close();
    assert.deepEqual(errors,[]);
    const result={passed:true,report,errors};
    if(artifacts)fs.writeFileSync(path.join(artifacts,'destination-preload-report.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
