import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {PGlite} from '@electric-sql/pglite';
import {JourneyDatabase} from '../database.mjs';
import {loadExistingJourneys} from '../import-catalog.mjs';
import {createJourneyPreview} from '../scripts/preview.mjs';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const output = process.env.TRIPWONDER_TEST_ARTIFACTS || path.join(tmpdir(), 'tripwonder-journey-sphere');
await mkdir(output, {recursive: true});
const engine = new PGlite();
const database = new JourneyDatabase(engine);
let preview, browser;
try {
  await database.initialize();
  const dictionary = loadExistingJourneys();
  await database.importMissing(dictionary);
  const edited = structuredClone(dictionary.beijing);
  const question = '数据库联调：这张照片里的景观是什么？';
  edited.questions[0].q = question;
  // Replace an existing scene's photo through the real database, preserving ID.
  const wide = dictionary.zhangjiajie.scenes[0].photo;
  edited.scenes[0].photo.sphere.asset = {...wide.displaySource, sha256: wide.sourceSha256};
  await database.save('beijing', edited);
  preview = await createJourneyPreview(database, 0);
  browser = await chromium.launch({headless:true, ...(process.env.BROWSER_PATH ?
    {executablePath:process.env.BROWSER_PATH} : {channel:'chrome'})});
  const page = await browser.newPage({viewport:{width:390,height:780},hasTouch:true});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {if (/THREE.WebGLProgram: Shader Error/.test(m.text())) errors.push(m.text());});
  const token = Buffer.from(JSON.stringify({cityId:'beijing',score:0})).toString('base64url');
  const open = async () => {
    await page.goto(preview.url + '?challenge=' + token);
    await page.locator('#app .cover-page').waitFor();
    if (await page.locator('.rules-popover').count()) await page.locator('[data-action="rules-start"]').click();
    await page.evaluate(() => {
      const Original = window.ImmersivePhotoViewer;
      window.ImmersivePhotoViewer = class extends Original {
        constructor(...args) {super(...args); window.integrationViewer = this;}
      };
    });
    await page.locator('#app [data-action="start"]').click();
  };
  const ready = async () => {
    await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();
    await page.locator('.scene-transition').waitFor({state:'detached'});
  };
  await open(); await ready();
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-projection'), 'sphere');
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-source-size'), `${wide.displaySource.width}x${wide.displaySource.height}`);
  assert.ok((await page.evaluate(() => integrationViewer.config.sourceUrl)).includes(wide.displaySource.src));
  assert.equal(await page.evaluate(() => TRIPWONDER_CATALOG.photoById.size), 23);
  // Actual input events exercise the renderer created from database materials.
  const canvas = page.locator('#app canvas.immersive-canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 110, box.y + 300); await page.mouse.down();
  await page.mouse.move(box.x + 260, box.y + 320, {steps:8}); await page.mouse.up();
  await page.waitForFunction(() => Math.abs(integrationViewer.state.yaw) > 1);
  await page.mouse.wheel(0, -5000);
  await page.waitForFunction(() => Number(document.querySelector('#app .photo-viewport').dataset.zoom) === 3);
  await canvas.dblclick({position:{x:190,y:300}});
  await page.waitForFunction(() => Number(document.querySelector('#app .photo-viewport').dataset.zoom) === 1);
  await page.locator('#phone').screenshot({path:path.join(output,'database-sphere.png')});
  // Reach the real quiz and confirm that its text came from the edited database.
  for (let i=1; i<edited.scenes.length; i++) {
    await page.locator('#app [data-action="next-scene"]').click(); await ready();
  }
  await page.locator('#app [data-action="next-scene"]').click();
  await page.locator('.quiz-page').waitFor();
  assert.ok((await page.locator('#app').innerText()).includes(question));
  await page.locator('#phone').screenshot({path:path.join(output,'database-question.png')});
  await page.locator('#app [data-action="quiz-back"]').click(); await ready();
  // A second write with the SAME scene ID must use a new image/cache key.
  const replacement = dictionary.shanghai.scenes[0].photo;
  edited.scenes[0].photo.sphere.asset = {...replacement.displaySource, sha256:replacement.sourceSha256};
  await database.save('beijing', edited);
  await open(); await ready();
  assert.ok((await page.evaluate(() => integrationViewer.config.sourceUrl)).includes(replacement.displaySource.src));
  assert.equal(await page.locator('#app .photo-viewport').getAttribute('data-source-size'), `${replacement.displaySource.width}x${replacement.displaySource.height}`);
  assert.deepEqual(errors, []);
  // Development server must not expose database files or credentials.
  for (const name of ['backend/.env', 'backend/.local/journeys/PG_VERSION', '.git/config']) {
    assert.equal((await fetch(preview.url + name)).status, 404);
  }
  const result = {databaseRoundtrip:true,gameCatalog:true,sphereRendering:true,drag:true,zoom:true,
    databaseQuestion:true,quizReturn:true,sameSceneReplacement:true,errors,output};
  await writeFile(path.join(output,'results.json'), JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
} finally {
  await browser?.close(); await preview?.close(); await engine.close();
}
