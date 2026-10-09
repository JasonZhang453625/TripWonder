// Vercel Build Output API: the existing website plus differential update endpoints.
const fs=require('node:fs'),path=require('node:path');
const {build,walk,sha,relative,mobile,root,out}=require('./build.cjs');
async function hosting(){
  const release=await build();
  const target=path.join(root,'.vercel/output'),staticDir=path.join(target,'static');
  if(target!==path.join(root,'.vercel/output'))throw Error('Invalid hosting output');
  fs.rmSync(target,{recursive:true,force:true});fs.mkdirSync(staticDir,{recursive:true});
  const copy=(file,rel)=>{const dest=path.join(staticDir,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);};
  // Publish the browser build unchanged. Exclude build scripts, keys and native tools.
  for(const entry of fs.readdirSync(root))if(/\.(html|js|css|txt)$/.test(entry)&&!/-src\.js$/.test(entry)&&!/^preview-/.test(entry))copy(path.join(root,entry),entry);
  for(const folder of ['assets','content','photo-library'])for(const file of walk(path.join(root,folder))){
    const rel=relative(root,file);
    if(/(?:^|\/)check-[^/]*\//.test(rel)||/\/immersive\//.test(rel))continue;
    if(/\.(jpg|jpeg|png|avif|webp|woff2?|json|js|md|mp3)$/i.test(rel))copy(file,rel);
  }
  const routes=[{
    src:'/photo-library/[^/]+/[^/]+/immersive-blur/photo\\.jpg',
    has:[{type:'query',key:'v',value:'[a-f0-9]{12}'}],
    headers:{'Cache-Control':'public, max-age=31536000, immutable'},continue:true
  }];
  const prefix=`mobile-updates/bundles/${release.bundleId}`;
  for(const file of walk(out)){
    const href=relative(out,file);copy(file,`${prefix}/${href}`);
    routes.push({src:`/mobile-updates/files/${release.bundleId}`,has:[{type:'query',key:'href',value:href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}],dest:`/${prefix}/${href}`,headers:{'X-Checksum':sha(fs.readFileSync(file)),'Cache-Control':'public, max-age=31536000, immutable'}});
  }
  const feed=`mobile-updates/${release.runtime}.json`;
  fs.mkdirSync(path.join(staticDir,'mobile-updates'),{recursive:true});
  fs.writeFileSync(path.join(staticDir,feed),JSON.stringify(release));
  routes.unshift({src:`/${feed.replace(/\./g,'\\.')}`,headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'https://localhost'},continue:true});
  routes.push({handle:'filesystem'},{src:'/mobile-updates/.*',status:404});
  fs.writeFileSync(path.join(target,'config.json'),JSON.stringify({version:3,routes},null,2));
  console.log(`Vercel output ready: ${target}`);
}
hosting().catch(error=>{console.error(error);process.exitCode=1;});
