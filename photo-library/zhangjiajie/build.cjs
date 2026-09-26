// Rebuild only Zhangjiajie from its standardized originals; never download or alter them.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const root=path.resolve(__dirname,'../..');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources=[
  {id:'zjj-tianzishan',dir:'tianzishan',ext:'jpg',originalFilename:'tianzishan_wulingyuan_zhangjiajie.jpg',focusX:.48,credit:'chensiyuan / Wikimedia Commons',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',source:'https://commons.wikimedia.org/wiki/File:1_tianzishan_wulingyuan_zhangjiajie_2012.jpg'},
  {id:'zjj-misty-peaks',dir:'misty-peaks',ext:'avif',originalFilename:'photo-1514920735211-8c697444a248.avif',focusX:.62,credit:'Joshua Sortino / Unsplash',license:'Unsplash License',licenseUrl:'https://unsplash.com/license',source:'https://unsplash.com/photos/aerial-view-of-mountains-gii7lF4y0WY'},
  {id:'zjj-tianmen-cave',dir:'tianmen-cave',ext:'jpg',originalFilename:'Tianmen_38330-Zhangjiajie.jpg',focusX:.48,credit:'xiquinhosilva / Wikimedia Commons',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',source:'https://commons.wikimedia.org/wiki/File:Tianmen_38330-Zhangjiajie_(49047525877).jpg'},
  {id:'zjj-winding-road',dir:'winding-road',ext:'jpg',originalFilename:'Winding_road,_Tianmen_Mountain.jpg',focusX:.54,credit:'王计 / Wikimedia Commons',license:'CC BY 2.5',licenseUrl:'https://creativecommons.org/licenses/by/2.5/',source:'https://commons.wikimedia.org/wiki/File:Winding_road,_Tianmen_Mountain.jpg'}
];
(async()=>{
  const photos={};let scenes=fs.readFileSync(path.join(root,'immersive-scenes.js'),'utf8');
  for(const item of sources){
    const dir='photo-library/zhangjiajie/'+item.dir,src=dir+'/original.'+item.ext,input=path.join(root,src);
    const sourceSha256=hash(input),meta=await sharp(input).metadata();
    const photo={city:'zhangjiajie',dir:item.dir,id:item.id,src,sourceFile:src,originalFilename:item.originalFilename,sourceSha256,original:{src,width:meta.width,height:meta.height,bytes:fs.statSync(input).size,untouched:true},credit:item.credit,license:item.license,licenseUrl:item.licenseUrl,source:item.source};
    for(const [kind,width,quality] of [['thumb',640,80],['screen',1440,88],['detail',2400,92]]){
      const output=path.join(root,dir,kind+'.webp'),info=await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality,effort:5}).toFile(output);
      photo[kind]={src:dir+'/'+kind+'.webp',width:info.width,height:info.height,bytes:info.size};
    }
    const immersive=path.join(root,dir,'immersive-blur');fs.mkdirSync(immersive,{recursive:true});
    const texture=path.join(immersive,'photo.jpg'),copy=meta.format==='jpeg'&&(!meta.orientation||meta.orientation===1);
    if(copy)fs.copyFileSync(input,texture);
    else await sharp(input).rotate().flatten({background:'#fff'}).jpeg({quality:98,chromaSubsampling:'4:4:4',mozjpeg:true}).toFile(texture);
    if(hash(input)!==sourceSha256)throw Error('Original changed: '+src);
    const display=await sharp(texture).metadata(),displayHash=hash(texture),version=displayHash.slice(0,12);
    fs.writeFileSync(path.join(root,dir,'photo.json'),JSON.stringify(photo,null,2)+'\n');
    const provenance={scene:item.id,city:'zhangjiajie',source:'../original.'+item.ext,sourceSha256,displayPhoto:'photo.jpg',displaySize:[display.width,display.height],displaySha256:displayHash,sourceAspect:display.width/display.height,periphery:'blurred projection of the original photo, rendered at runtime (no AI content)',encoding:copy?'original JPEG bytes':'JPEG quality 98, 4:4:4, native pixel dimensions',preparedAt:new Date().toISOString()};
    fs.writeFileSync(path.join(immersive,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');
    execFileSync(process.execPath,[path.join(root,'build-immersive-assets.cjs'),item.id,dir+'/immersive-blur','none'],{stdio:'pipe'});
    photos[item.id]={src,width:meta.width,height:meta.height,screen:photo.screen,thumb:photo.thumb,detail:photo.detail,credit:item.credit,license:item.license,licenseUrl:item.licenseUrl,source:item.source};
    const block=`  '${item.id}': {\n    ...BLUR_SCENE,\n    id: '${item.id}',\n    assetScript: 'immersive-${item.id}-assets.js?v=${version}',\n    sourceUrl: '${dir}/immersive-blur/photo.jpg?v=${version}',\n    sourceAspect: ${display.width/display.height},\n    focusX: ${item.focusX}\n  }`;
    const pattern=new RegExp("  '"+item.id+"': \\{[\\s\\S]*?\\n  \\}");
    if(pattern.test(scenes))scenes=scenes.replace(pattern,block);
    else scenes=scenes.replace(/\n};\s*$/,',\n'+block+'\n};\n');
    console.log(JSON.stringify({id:item.id,size:[display.width,display.height],bytes:fs.statSync(texture).size,originalVerified:true}));
  }
  const contentFile=path.join(root,'content/zhangjiajie.js'),content=fs.readFileSync(contentFile,'utf8');
  const pattern=/  \/\/ BEGIN GENERATED PHOTO METADATA[\s\S]*?  \/\/ END GENERATED PHOTO METADATA/;
  if(!pattern.test(content))throw Error('Photo metadata markers missing');
  fs.writeFileSync(contentFile,content.replace(pattern,'  // BEGIN GENERATED PHOTO METADATA\n  const photos = '+JSON.stringify(photos,null,2)+';\n  // END GENERATED PHOTO METADATA'));
  fs.writeFileSync(path.join(root,'immersive-scenes.js'),scenes);
})().catch(error=>{console.error(error);process.exitCode=1;});
