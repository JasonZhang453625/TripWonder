// Validate the actual shipped scene pixels, not the width/height labels alone.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const ctx={window:{}};
for(const file of ['data.js','media-manifest.js',...fs.readdirSync('content').filter(f=>f.endsWith('.js')).map(f=>'content/'+f),'catalog.js','immersive-scenes.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
  const report=[];
  for(const city of [...ctx.window.TRIPWONDER_CATALOG.cities,...ctx.window.UGC_JOURNEYS]){
    if(city.channel!=='ugc')assert.ok(city.scenes.length>=3,`${city.id}: at least three official scenes`);
    assert.equal(city.questions.length,3,`${city.id}: three questions`);
    for(const question of city.questions)if(question.sceneId)assert.ok(city.scenes.some(s=>s.id===question.sceneId),`${city.id}: question scene exists`);
    for(const scene of city.scenes){
      const photo=scene.photo,variants=photo.screen?photo:ctx.window.MEDIA_ASSETS[scene.id],dir=path.dirname(variants.screen.src.split('?')[0]);
      const meta=JSON.parse(fs.readFileSync(path.join(dir,'photo.json'),'utf8'));
      const file=meta.displaySource?.src||meta.original.src,m=await sharp(file).metadata();
      const width=m.autoOrient?.width||m.width,height=m.autoOrient?.height||m.height;
      assert.ok(width>height&&width>=3840&&height>=2160,`${scene.id}: ${width}x${height} is not UHD landscape`);
      assert.equal(meta.sourceSha256,sha(meta.original.src),`${scene.id}: source hash`);
      const immersive=path.join(dir,'immersive-blur/photo.jpg'),im=await sharp(immersive).metadata();
      assert.equal(im.width,width,`${scene.id}: native immersive width`);assert.equal(im.height,height,`${scene.id}: native immersive height`);
      for(const kind of ['thumb','screen','detail']){
        const f=variants[kind].src.split('?')[0],info=await sharp(f).metadata();
        assert.equal(info.width,variants[kind].width,`${scene.id}: ${kind} width`);
        assert.equal(info.height,variants[kind].height,`${scene.id}: ${kind} height`);
      }
      const config=ctx.window.IMMERSIVE_SCENES[scene.id];
      if(config?.sourceUrl){const version=config.sourceUrl.split('?v=')[1];assert.equal(version,sha(immersive).slice(0,12),`${scene.id}: cached texture version`);}
      assert.equal(scene.hotspots.length,3,`${scene.id}: three matching clues`);
      assert.ok(scene.hotspots.every(h=>h.x>=0&&h.x<=100&&h.y>=0&&h.y<=100),`${scene.id}: clue positions`);
      report.push({city:city.id,scene:scene.id,width,height,megapixels:+(width*height/1e6).toFixed(1)});
    }
  }
  console.log(JSON.stringify(report,null,2));console.log(`PASS: ${report.length} scenes, native UHD landscape originals, derivatives, hashes, scene links and clue coordinates`);
})().catch(e=>{console.error(e);process.exitCode=1;});
