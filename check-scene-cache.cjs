const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=process.env.TRIPWONDER_TEST_ARTIFACTS;
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const errors=[],report={};
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8765/');
    await page.waitForFunction(()=>window.ImmersiveSceneMedia);
    report.budget=await page.evaluate(async()=>{
      let requests=0;const originalFetch=window.fetch;
      window.fetch=(...args)=>{if(String(args[0]).includes('/immersive-blur/photo.jpg'))requests++;return originalFetch(...args);};
      const scenes=Object.values(IMMERSIVE_SCENES),first=scenes[0];
      for(const config of scenes){
        ImmersiveSceneMedia.setDestination(config.id,[config]);
        await ImmersiveSceneMedia.load(config,new AbortController().signal);
        const status=ImmersiveSceneMedia.status();
        if(status.cacheBytes>status.cacheLimit)throw Error('Cache budget exceeded');
        ImmersiveSceneMedia.clear();
      }
      const deadline=Date.now()+30000;
      while(ImmersiveSceneMedia.status().pendingWrites){
        if(Date.now()>deadline)throw Error('Persistent cache writes did not settle');
        await new Promise(resolve=>setTimeout(resolve,30));
      }
      const store=await caches.open('tripwonder-scene-files-v1');
      const keys=await store.keys();
      const sizes=await Promise.all(keys.map(async key=>Number((await store.match(key)).headers.get('content-length'))));
      const persistentBytes=sizes.reduce((sum,bytes)=>sum+bytes,0);
      if(!persistentBytes)throw Error('No full-resolution files persisted');
      if(persistentBytes>ImmersiveSceneMedia.status().persistentLimit)throw Error('Persistent cache budget exceeded');
      const before=ImmersiveSceneMedia.status(),downloaded=requests;
      // The oldest file must be evicted after loading more than 96 MiB.
      ImmersiveSceneMedia.setDestination(first.id,[first]);
      await ImmersiveSceneMedia.load(first,new AbortController().signal);
      ImmersiveSceneMedia.clear();
      return {...before,persistentBytes,scenes:scenes.length,downloaded,evictedFileReloaded:requests===downloaded+1};
    });
    assert.ok(report.budget.evictedFileReloaded);
    assert.ok(report.budget.cachedFiles<report.budget.scenes);
    assert.deepEqual(report.budget.decodedScenes,[]);
    await page.close();

    const returning=await context.newPage();
    returning.on('pageerror',e=>errors.push(e.message));
    await returning.goto('http://127.0.0.1:8765/');
    await returning.waitForFunction(()=>window.ImmersiveSceneMedia);
    report.returnVisit=await returning.evaluate(async()=>{
      const config=IMMERSIVE_SCENES['zjj-winding-road'];
      ImmersiveSceneMedia.setDestination('return',[config]);
      await ImmersiveSceneMedia.load(config,new AbortController().signal);
      return {hits:ImmersiveSceneMedia.status().persistentHits,networkFiles:performance.getEntriesByType('resource').filter(r=>r.name.includes('/immersive-blur/photo.jpg')).length};
    });
    assert.equal(report.returnVisit.hits,1);assert.equal(report.returnVisit.networkFiles,0);
    await context.close();

    const low=await browser.newPage({viewport:{width:390,height:844}});
    low.on('pageerror',e=>errors.push(e.message));
    await low.addInitScript(()=>{
      Object.defineProperty(navigator,'deviceMemory',{get:()=>2});
      Object.defineProperty(window,'caches',{value:{open:()=>Promise.reject(new DOMException('Storage denied','SecurityError'))}});
    });
    const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
    await low.goto('http://127.0.0.1:8765/?challenge='+token);
    await low.locator('#app .cover-page').waitFor();
    if(await low.locator('.rules-popover').count())await low.locator('[data-action="rules-start"]').click();
    await low.locator('#app [data-action="start"]').click();
    await low.locator('#app .photo-viewport[data-rendered="true"]').waitFor();
    await low.locator('.scene-transition').waitFor({state:'detached'});
    await low.waitForFunction(()=>ImmersiveSceneMedia.status().cachedFiles===3);
    await low.waitForTimeout(1000);
    assert.deepEqual(await low.evaluate(()=>ImmersiveSceneMedia.status().decodedScenes),['sz-futian']);
    await low.locator('#app [data-action="next-scene"]').click();
    await low.locator('#app .scene-counter').filter({hasText:'2 / 3'}).waitFor();
    await low.locator('.scene-transition').waitFor({state:'detached'});
    const size=await low.locator('#app .photo-viewport').getAttribute('data-source-size');
    assert.equal(size,'7002x4668');
    await low.locator('#app [data-action="leave"]').click();
    await low.locator('#app .cover-page').waitFor();
    assert.deepEqual(await low.evaluate(()=>ImmersiveSceneMedia.status().decodedScenes),[]);
    report.lowMemory={backgroundLargeImageSkipped:true,nativeOnDemand:size,pixelsReleasedOnExit:true,storageDeniedFallback:true};
    assert.deepEqual(errors,[]);
    const result={passed:true,report,errors};
    if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'scene-cache-report.json'),JSON.stringify(result,null,2));}
    console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
