const fs = require('node:fs');
const path = require('node:path');

// WebGL textures from file:// must be data URLs for the local, build-free preview.
// Usage: node build-immersive-assets.cjs <scene-id> <scene-asset-dir> <atlas-jpeg|none>
// Pass `none` for periphery:'blur' scenes; the viewer derives the soft edge from the photo.
const root = __dirname;
const id = process.argv[2] || 'xuankong';
const relativeDir = process.argv[3] || 'photo-library/datong/xuankong/immersive';
const atlasName = process.argv[4] || 'atlas-repaired.jpg';
if (!/^[a-z0-9-]+$/.test(id) || !/^([a-z0-9-]+\.jpe?g|none)$/.test(atlasName)) throw Error('Invalid scene id or atlas filename');
const directory = path.resolve(root, relativeDir);
if (!directory.startsWith(root + path.sep)) throw Error('Asset directory must be inside the prototype');
const asset = name => fs.readFileSync(path.join(directory, name)).toString('base64');
const output = `window.IMMERSIVE_ASSETS=window.IMMERSIVE_ASSETS||{};window.IMMERSIVE_ASSETS[${JSON.stringify(id)}]={source:"data:image/jpeg;base64,${asset('photo.jpg')}"${atlasName === 'none' ? '' : `,atlas:"data:image/jpeg;base64,${asset(atlasName)}"`}};`;
const target = path.join(root, `immersive-${id}-assets.js`);
fs.writeFileSync(target, output);
console.log(`Wrote ${path.basename(target)} (${output.length} characters)`);
