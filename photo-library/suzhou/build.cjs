// Rebuild the three current Suzhou scenes, including metadata and sphere assets.
const path=require('node:path');
require('node:child_process').execFileSync(process.execPath,[
  path.resolve(__dirname,'../../scripts/build-landscape-media.cjs'),
  'suzhou-zhuozheng','suzhou-huqiu','suzhou-shantang'
],{cwd:path.resolve(__dirname,'../..'),stdio:'inherit'});
