// Rebuild the selected landscape originals, derivatives and versioned sphere assets.
// Sources and licenses: photo-library/landscape-sources.json. Originals must already be present.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const root=path.resolve(__dirname,'..');
const selected=process.argv.slice(2);
const sources=require('../photo-library/landscape-sources.json').filter(s=>!selected.length||selected.includes(s.id));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function objectEnd(text,start){
  let depth=0,quote=null,escape=false;
  for(let i=start;i<text.length;i++){
    const c=text[i];
    if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{'||c==='[')depth++;
    if((c==='}'||c===']')&&--depth===0)return i+1;
  }
  throw Error('Unbalanced source object');
}
function rewrite(file,needle,value){
  const target=path.join(root,file),text=fs.readFileSync(target,'utf8'),at=text.indexOf(needle);
  if(at<0)throw Error(`Missing ${needle} in ${file}`);
  const start=at+needle.length,end=objectEnd(text,start);
  fs.writeFileSync(target,text.slice(0,start)+JSON.stringify(value,null,2)+text.slice(end));
}
function read(file){const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);return context.window;}
function syncContent(photos){
  // Registered static scenes use their versioned scene config (including focus and
  // file:// assets). Keep original/hash metadata in photo.json, not the upload seam.
  const registered=Object.fromEntries(Object.entries(photos).map(([id,p])=>{
    const copy={...p};delete copy.original;delete copy.sourceSha256;return [id,copy];
  }));
  const original=read('data.js').PHOTOS.map(p=>photos[p.id]?{...registered[p.id],name:p.name,city:p.city,status:p.status,note:'原生超高清横图；完整保留来源画面，未裁切、未扩图、未放大。'}:p);
  rewrite('data.js','window.PHOTOS = ',original);
  const manifest=read('media-manifest.js').MEDIA_ASSETS;
  for(const p of original)if(photos[p.id])manifest[p.id]={originalBytes:photos[p.id].original.bytes,thumb:p.thumb,screen:p.screen,detail:p.detail};
  rewrite('media-manifest.js','window.MEDIA_ASSETS = ',manifest);
  if(photos['sz-futian'])rewrite('content/shenzhen.js','      photo: ',registered['sz-futian']);
  const suzhou=read('content/suzhou.js').CITY_SUZHOU;
  suzhou.scenes.forEach(s=>{if(photos[s.id])s.photo=registered[s.id];});
  rewrite('content/suzhou.js','  scenes: ',suzhou.scenes);
  const zjjFile=path.join(root,'content/zhangjiajie.js'),zjj=fs.readFileSync(zjjFile,'utf8');
  const start=zjj.indexOf('  const photos = ')+17;
  const map=JSON.parse(zjj.slice(start,objectEnd(zjj,start)));
  for(const [id,p] of Object.entries(registered))if(id.startsWith('zjj-'))map[id]=p;
  rewrite('content/zhangjiajie.js','  const photos = ',map);
  const ugc=read('content/ugc-media.js').UGC_MEDIA;
  if(photos['ugc-shibati-new-street'])ugc['ugc-shibati-new-street']=photos['ugc-shibati-new-street'];
  rewrite('content/ugc-media.js','window.UGC_MEDIA = ',ugc);
}
async function build(){
  const photos={};let config=fs.readFileSync(path.join(root,'immersive-scenes.js'),'utf8').replace(/\r\n/g,'\n');
  for(const source of sources){
    const dir=`photo-library/${source.city}/${source.dir}`,src=`${dir}/original.jpg`;
    const input=path.join(root,src),bytes=fs.readFileSync(input),m=await sharp(bytes).metadata();
    if(m.format!=='jpeg'||(m.orientation&&m.orientation!==1)||m.width<m.height||m.width<3840||m.height<2160)throw Error(`Not an upright UHD landscape: ${src}`);
    const sha=hash(bytes),version=sha.slice(0,12),photo={id:source.id,src,width:m.width,height:m.height,sourceSha256:sha,
      original:{src,width:m.width,height:m.height,bytes:bytes.length,untouched:true},credit:source.credit,license:source.license,licenseUrl:source.licenseUrl,source:source.source};
    for(const [kind,width,quality] of [['thumb',640,78],['screen',1440,85],['detail',2400,90]]){
      const dest=`${dir}/${kind}.webp`,info=await sharp(bytes).resize({width,withoutEnlargement:true}).webp({quality,effort:5}).toFile(path.join(root,dest));
      photo[kind]={src:dest+'?v='+version,width:info.width,height:info.height,bytes:info.size};
    }
    const immersive=`${dir}/immersive-blur`;fs.mkdirSync(path.join(root,immersive),{recursive:true});
    fs.writeFileSync(path.join(root,immersive,'photo.jpg'),bytes);
    fs.writeFileSync(path.join(root,immersive,'provenance.json'),JSON.stringify({source:'../original.jpg',sourceSha256:sha,displaySize:[m.width,m.height],displaySha256:sha,sourceAspect:m.width/m.height,encoding:source.encoding||'original JPEG bytes',sourcePage:source.source},null,2)+'\n');
    fs.writeFileSync(path.join(root,dir,'photo.json'),JSON.stringify({city:source.city,dir:source.dir,...photo,sourceFile:src,originalFilename:source.title.replace(/^File:/,''),downloadUrl:source.downloadUrl,takenAt:source.takenAt},null,2)+'\n');
    if(source.city!=='ugc'){
      execFileSync(process.execPath,[path.join(root,'build-immersive-assets.cjs'),source.id,immersive,'none'],{stdio:'pipe'});
      const block=`  '${source.id}': {\n    ...SPHERE_SCENE,\n    id: '${source.id}',\n    assetScript: 'immersive-${source.id}-assets.js?v=${version}',\n    sourceUrl: '${immersive}/photo.jpg?v=${version}',\n    sourceAspect: ${m.width/m.height}${source.focusX===undefined?'':`,\n    focusX: ${source.focusX}`}\n  }`;
      const re=new RegExp("  (?:'"+source.id+"'|"+source.id+"): \\{[\\s\\S]*?\\n  \\}");
      if(re.test(config))config=config.replace(re,block);else config=config.replace(/\n};/,',\n'+block+'\n};');
    }
    photos[source.id]=photo;console.log(`${source.id}: ${m.width}x${m.height}, ${bytes.length} bytes`);
  }
  fs.writeFileSync(path.join(root,'immersive-scenes.js'),config);
  syncContent(photos);
  return photos;
}
module.exports={build};
if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});
