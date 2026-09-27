// Local browser timing: separates file transfer, image preparation, GPU setup, and reveal.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const esbuild=require('D:/携程/trial/云冈3D视差样例/node_modules/esbuild');
const root=__dirname,phase=process.env.TRIPWONDER_PERF_PHASE||'current';
const out=process.env.TRIPWONDER_TEST_ARTIFACTS;
const nodePaths=['D:/携程/trial/云冈3D视差样例/node_modules'];
async function instrumentBundle(){
  let source=fs.readFileSync(path.join(root,'immersive-viewer-src.js'),'utf8');
  source=source.replace('const cfg = this.config;',`const cfg = this.config;
    const measurement={scene:cfg.id,started:performance.now()};
    const mark=name=>{measurement[name]=Math.round(performance.now()-measurement.started);};
    (window.sceneMeasurements??=[]).push(measurement);`);
  source=source.replace('const canvas = document.createElement',"mark('imagesReady');\n    const canvas = document.createElement");
  source=source.replace('await renderer.compileAsync',"mark('rendererSetup');\n    await renderer.compileAsync");
  source=source.replace('renderer.render(this.scene, this.camera);',"mark('shaderReady');\n    renderer.render(this.scene, this.camera);\n    mark('firstRender');");
  const build=await esbuild.build({stdin:{contents:source,resolveDir:root,loader:'js'},nodePaths,bundle:true,format:'iife',minify:true,write:false});
  return build.outputFiles[0].text;
}
(async()=>{
  const bundle=await instrumentBundle();
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const report={phase,environment:'Desktop Edge, 390x844, software WebGL, local HTTP; not phone timings',cities:[]},errors=[];
  try{
    for(const city of (process.env.TRIPWONDER_PERF_CITIES||'shenzhen,zhangjiajie,datong').split(',')){
      const page=await browser.newPage({viewport:{width:390,height:844}});
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/immersive-viewer.js*',route=>route.fulfill({body:bundle,contentType:'text/javascript'}));
      const token=Buffer.from(JSON.stringify({cityId:city,score:0})).toString('base64url');
      await page.goto('http://127.0.0.1:8765/?challenge='+token);
      await page.locator('#app .cover-page').waitFor();
      if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
      const count=await page.evaluate(id=>TRIPWONDER_CATALOG.cities.find(c=>c.id===id).scenes.length,city);
      const switches=[];
      for(let i=0;i<count;i++){
        const start=Date.now();
        await page.locator(`#app [data-action="${i?'next-scene':'start'}"]`).click();
        await page.locator('#app .scene-counter').filter({hasText:`${i+1} / ${count}`}).waitFor();
        await page.locator('.scene-transition').waitFor({state:'detached'});
        switches.push(Date.now()-start);
        await page.waitForFunction(n=>performance.getEntriesByType('resource').filter(x=>x.name.includes('/immersive-blur/photo.jpg')).length===n,count);
        await page.waitForTimeout(Number(process.env.TRIPWONDER_PERF_DWELL||1500));
      }
      const data=await page.evaluate(()=>({measurements:window.sceneMeasurements,files:performance.getEntriesByType('resource').filter(x=>x.name.includes('/immersive-blur/photo.jpg')).map(x=>({url:x.name.split('/photo-library/')[1],duration:Math.round(x.duration),transferMB:+(x.encodedBodySize/1024/1024).toFixed(2)}))}));
      report.cities.push({city,switches,...data});await page.close();
    }
    report.errors=errors;if(errors.length)throw Error(errors.join('; '));
    if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,`scene-performance-${phase}.json`),JSON.stringify(report,null,2));}
    console.log(JSON.stringify(report));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
