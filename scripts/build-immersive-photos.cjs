// Build native-resolution scene textures from the standardized local originals.
// JPEG inputs are copied byte for byte when already upright; other inputs retain
// their pixel dimensions and use JPEG quality 98 with 4:4:4 colour sampling.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
let sharp;
try { sharp = require('sharp'); } catch { sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
const root = path.resolve(__dirname, '..');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const context = {window:{}};
for (const file of ['data.js','media-manifest.js',...fs.readdirSync(path.join(root,'content')).filter(x=>x.endsWith('.js')).map(x=>'content/'+x),'catalog.js']) vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);

(async()=>{
  const configFile=path.join(root,'immersive-scenes.js');
  let config=fs.readFileSync(configFile,'utf8');
  config=config.replace('dir with photo.jpg, 1600 px tall','dir with native-resolution photo.jpg');
  for(const city of context.window.TRIPWONDER_CATALOG.cities)for(const scene of city.scenes){
    const dir=path.posix.dirname(context.window.MEDIA_ASSETS[scene.id].screen.src.split('?')[0]);
    const photo=JSON.parse(fs.readFileSync(path.join(root,dir,'photo.json'),'utf8'));
    const source=photo.displaySource?.src||photo.original.src;
    const input=path.join(root,source),target=path.join(root,dir,'immersive-blur/photo.jpg');
    const before=hash(input),info=await sharp(input).metadata();
    const copy=info.format==='jpeg'&&(!info.orientation||info.orientation===1);
    if(copy)fs.copyFileSync(input,target);
    else await sharp(input).rotate().flatten({background:'#fff'}).jpeg({quality:98,chromaSubsampling:'4:4:4',mozjpeg:true}).toFile(target);
    if(hash(input)!==before)throw Error('Original was modified: '+source);
    const display=await sharp(target).metadata(),displayHash=hash(target),version=displayHash.slice(0,12);
    const provPath=path.join(root,dir,'immersive-blur/provenance.json');
    const prov=JSON.parse(fs.readFileSync(provPath,'utf8'));
    Object.assign(prov,{source:path.relative(path.dirname(target),input).replaceAll('\\','/'),sourceSha256:before,displaySize:[display.width,display.height],displaySha256:displayHash,sourceAspect:display.width/display.height,encoding:copy?'original JPEG bytes':'JPEG quality 98, 4:4:4, native pixel dimensions',preparedAt:new Date().toISOString()});
    fs.writeFileSync(provPath,JSON.stringify(prov,null,2)+'\n');
    execFileSync(process.execPath,[path.join(root,'build-immersive-assets.cjs'),scene.id,dir+'/immersive-blur','none'],{stdio:'pipe'});
    const begin=config.indexOf("id: '"+scene.id+"'");
    const end=config.indexOf('\n  }',begin);
    if(begin<0||end<0)throw Error('Missing scene config: '+scene.id);
    let block=config.slice(begin,end);
    block=block.replace(/assetScript: '[^']+'/,"assetScript: 'immersive-"+scene.id+"-assets.js?v="+version+"'");
    block=block.replace(/\n    sourceUrl: '[^']+',?/,'');
    block=block.replace(/(assetScript: '[^']+',)/,"$1\n    sourceUrl: '"+dir+'/immersive-blur/photo.jpg?v='+version+"',");
    block=block.replace(/sourceAspect: [\d.]+/,'sourceAspect: '+display.width/display.height);
    config=config.slice(0,begin)+block+config.slice(end);
    console.log(JSON.stringify({scene:scene.id,pixels:[display.width,display.height],bytes:fs.statSync(target).size,originalJpeg:copy}));
  }
  fs.writeFileSync(configFile,config);
})().catch(error=>{console.error(error);process.exitCode=1});
