const path = require('node:path');
const fs = require('node:fs');
const sharp = require('sharp');

const files = [
  ['zhuozheng', 'original.jpg'],
  ['shizilin', 'source-1280.jpg'],
  ['huqiu', 'oriented.jpg'],
];

async function main() {
  for (const [id, file] of files) {
    const source = path.join(__dirname, id, file);
    for (const [kind, width, quality] of [
      ['screen', 1080, 78],
      ['thumb', 480, 74],
    ]) {
      const target = path.join(__dirname, id, `${kind}.webp`);
      await sharp(source)
        .rotate() // Honor EXIF orientation before resizing.
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 5 })
        .toFile(target);
      const image = await sharp(target).metadata();
      console.log(`${id}/${kind}: ${image.width}x${image.height}, ${fs.statSync(target).size} bytes`);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
