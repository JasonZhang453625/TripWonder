const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const esbuild=require('esbuild');
const mobile=path.resolve(__dirname,'..'),root=path.dirname(mobile),out=path.join(mobile,'www');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const relative=(base,file)=>path.relative(base,file).split(path.sep).join('/');
const write=(name,data)=>{const dest=path.join(out,name);fs.mkdirSync(path.dirname(dest),{recursive:true});if(/\.(js|css|html|json|md|txt)$/.test(name))data=Buffer.from(data).toString('utf8').replace(/\r\n/g,'\n');fs.writeFileSync(dest,data);};

async function build() {
  if(out!==path.join(mobile,'www'))throw Error('Invalid output directory');
  fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
  const config=JSON.parse(fs.readFileSync(path.join(mobile,'release.json'),'utf8'));
  const pkg=JSON.parse(fs.readFileSync(path.join(mobile,'package.json'),'utf8').replace(/^\uFEFF/,''));
  const contract=[JSON.stringify(config),JSON.stringify(pkg.dependencies),fs.readFileSync(path.join(mobile,'capacitor.config.json'))];
  // Native-source changes create a different feed; installed older binaries keep their compatible channel.
  const android=path.join(mobile,'android');
  if(fs.existsSync(android))for(const file of walk(android).filter(f=>{
    const rel=relative(android,f);
    return ['app/build.gradle','variables.gradle','build.gradle'].includes(rel)||(/^app\/src\/main\/.+\.(java|xml)$/.test(rel)&&!rel.startsWith('app/src/main/assets/')&&!rel.endsWith('/xml/config.xml'));
  }).sort())contract.push(relative(android,file),fs.readFileSync(file));
  const runtime=`android-${config.nativeRevision}-${sha(Buffer.concat(contract.map(x=>Buffer.from(x.toString().replace(/\r\n/g,'\n'))))).slice(0,12)}`;
  const indexSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const entries=[...indexSource.matchAll(/(?:src|href)="([^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]).filter(p=>/^[^/]+\.(js|css)$/.test(p));
  for(const entry of new Set(entries)) {
    const source=fs.readFileSync(path.join(root,entry),'utf8');
    write(entry,source.replace(/(photo-library\/[^/'"\s]+\/[^/'"\s]+\/)original\.(?:jpg|jpeg|png|avif|webp)/gi,'$1immersive-blur/photo.jpg'));
  }
  for(const folder of ['content','assets'])for(const file of walk(path.join(root,folder))) {
    const rel=relative(root,file);
    if(rel.endsWith('.js'))write(rel,fs.readFileSync(file,'utf8').replace(/(photo-library\/[^/'"\s]+\/[^/'"\s]+\/)original\.(?:jpg|jpeg|png|avif|webp)/gi,'$1immersive-blur/photo.jpg'));
    else write(rel,fs.readFileSync(file));
  }
  const {publishedJourneys,publishedScript}=await import('../../admin/export.mjs');
  write('published-journeys.js',publishedScript(await publishedJourneys()).replace(/(photo-library\/[^/'"\s]+\/[^/'"\s]+\/)original\.(?:jpg|jpeg|png|avif|webp)/gi,'$1immersive-blur/photo.jpg'));
  const sceneFiles=walk(path.join(root,'photo-library')).filter(f=>/(?:[\\/](?:thumb|screen|detail)\.webp|[\\/]immersive-blur[\\/]photo\.jpg|[\\/]ATTRIBUTION\.md)$/.test(f));
  for(const file of sceneFiles)write(relative(root,file),fs.readFileSync(file));
  write('THREE-LICENSE.txt',fs.readFileSync(path.join(root,'THREE-LICENSE.txt')));
  write('native.css',fs.readFileSync(path.join(mobile,'src/native.css')));
  let html=indexSource;
  html=html.replace('</head>','<link rel="stylesheet" href="native.css">\n</head>');
  html=html.replace(/<script src="app\.js/, '<script src="native.js"></script>\n  <script src="app.js');
  write('index.html',html);
  const nativeOptions={entryPoints:[path.join(mobile,'src/native.js')],bundle:true,minify:true,write:false,format:'iife',target:'chrome89',define:{__PUBLIC_ORIGIN__:JSON.stringify(config.origin),__RUNTIME__:JSON.stringify(runtime),__BUNDLE_ID__:JSON.stringify('0'.repeat(24))}};
  const placeholder=(await esbuild.build(nativeOptions)).outputFiles[0].contents;
  write('native.js',placeholder);
  const inputs=walk(out).sort().map(f=>({href:relative(out,f),checksum:sha(fs.readFileSync(f))}));
  const bundleId=sha(JSON.stringify(inputs)).slice(0,24);
  nativeOptions.define.__BUNDLE_ID__=JSON.stringify(bundleId);
  write('native.js',(await esbuild.build(nativeOptions)).outputFiles[0].contents);
  const manifest=walk(out).sort().map(f=>({href:relative(out,f),checksum:sha(fs.readFileSync(f)),sizeInBytes:fs.statSync(f).size}));
  write('capawesome-live-update-manifest.json',JSON.stringify(manifest));
  const result={schema:1,runtime,bundleId,url:`${config.origin}/mobile-updates/files/${bundleId}`,files:manifest.length,bytes:manifest.reduce((n,f)=>n+f.sizeInBytes,0)};
  fs.writeFileSync(path.join(mobile,'build-report.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));return result;
}
module.exports={build,walk,sha,relative,mobile,root,out};
if(require.main===module)build().catch(error=>{console.error(error);process.exitCode=1;});
