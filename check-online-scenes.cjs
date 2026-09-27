// Verify the deployed website with separate desktop and phone-sized browser profiles.
// These are browser simulations, not claims about physical phones or every network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_BASE_URL||'https://trip-guessr.vercel.app/';
const out=process.env.TRIPWONDER_TEST_ARTIFACTS;
const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
const texture=x=>x.includes('/shenzhen/')&&x.includes('/immersive-blur/photo.jpg');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const errors=[],report={base,profiles:[],environment:'Desktop Edge with separate browser contexts and simulated device viewports'};
  const expected=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'immersive-viewer.js'))).digest('hex').slice(0,12);
  try{
    for(const profile of [{name:'desktop',viewport:{width:1280,height:900}}, {name:'phone',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}]){
      const {name,...options}=profile,context=await browser.newContext(options),rounds=[];
      for(let round=0;round<2;round++){
        const page=await context.newPage();page.setDefaultTimeout(90000);
        page.on('pageerror',e=>errors.push(e.message));
        const headers=[];page.on('response',r=>{if(texture(r.url()))headers.push({status:r.status(),cache:r.headers()['cache-control']});});
        await page.goto(base+'?challenge='+token);
        await page.locator('#app .cover-page').waitFor();
        assert.match(await page.locator('script[src^="immersive-viewer.js"]').getAttribute('src'),new RegExp(expected+'$'),'deployed bundle matches this change');
        // A first-time visitor starts the actual full-resolution image on the cover.
        await page.waitForFunction(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/shenzhen/futian/immersive-blur/photo.jpg')));
        assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/immersive-blur/photo.jpg')).length),1);
        if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
        const entered=Date.now();await page.locator('#app [data-action="start"]').click();
        await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();
        await page.locator('.scene-transition').waitFor({state:'detached'});
        const firstRevealMs=Date.now()-entered;
        await page.waitForFunction(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/shenzhen/')&&r.name.includes('/immersive-blur/photo.jpg')).length===3);
        await page.waitForFunction(()=>ImmersiveSceneMedia.status().decodedScenes.includes('sz-houhai'));
        const clicked=Date.now();await page.locator('#app [data-action="next-scene"]').click();
        await page.locator('#app .scene-counter').filter({hasText:'2 / 3'}).waitFor();
        await page.locator('.scene-transition').waitFor({state:'detached'});
        const nextRevealMs=Date.now()-clicked;
        assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-source-size'),'7002x4668');
        assert.equal(await page.locator('#app .photo-plane>img').count(),0);
        assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-max-zoom'),'3');
        assert.equal(headers.length,3);
        assert.ok(headers.every(h=>h.status===200&&h.cache?.includes('max-age=31536000')&&h.cache.includes('immutable')),'Vercel sends durable browser caching headers');
        const files=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/shenzhen/')&&r.name.includes('/immersive-blur/photo.jpg')).map(r=>({file:r.name.split('/shenzhen/')[1],transferBytes:r.transferSize,encodedBytes:r.encodedBodySize,durationMs:Math.round(r.duration)})));
        if(round===1)assert.ok(files.every(f=>f.transferBytes===0),'a new page visit reuses browser cache, without downloading scene bytes again');
        rounds.push({visit:round?'return':'first',firstRevealMs,nextRevealMs,files,headers});
        if(out&&round===0){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`online-${name}.png`)});}
        await page.close();
      }
      report.profiles.push({name,rounds});await context.close();
    }
    assert.deepEqual(errors,[]);
    const result={passed:true,report,errors};
    if(out)fs.writeFileSync(path.join(out,'online-scene-report.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
