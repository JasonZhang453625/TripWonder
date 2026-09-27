// Rebuild the checked-in browser bundle. Uses the existing local dependencies.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
let esbuild;
const localDeps=path.resolve(root,'../trial/云冈3D视差样例/node_modules');
try { esbuild=require('esbuild'); } catch { esbuild=require(path.join(localDeps,'esbuild')); }
(async()=>{
  await esbuild.build({entryPoints:[path.join(root,'immersive-viewer-src.js')],outfile:path.join(root,'immersive-viewer.js'),nodePaths:[localDeps],bundle:true,format:'iife',minify:true,legalComments:'eof'});
  let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const name of ['immersive-viewer.js','app.js']){
    const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex').slice(0,12);
    html=html.replace(new RegExp(name.replaceAll('.','\\.')+'\\?v=[^"\\s]+','g'),name+'?v='+hash);
  }
  fs.writeFileSync(path.join(root,'index.html'),html);
})().catch(error=>{console.error(error);process.exitCode=1;});
