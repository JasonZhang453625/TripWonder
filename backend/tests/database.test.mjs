import test from 'node:test';
import vm from 'node:vm';
import {gameCatalogScript} from '../catalog.mjs';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {JourneyDatabase} from '../database.mjs';
import {loadExistingJourneys} from '../import-catalog.mjs';
import {toSpherePhoto, validateJourney} from '../journey.mjs';

const source = loadExistingJourneys();

test('existing eight destinations preserve scenes, clues, quiz answers and source materials', () => {
  assert.equal(Object.keys(source).length, 8);
  assert.equal(Object.values(source).flatMap(j => j.scenes).length, 23);
  assert.equal(Object.values(source).flatMap(j => j.questions).length, 24);
  assert.equal(source.suzhou.scenes.length, 1);
  assert.equal(source.suzhou.questions.length, 3);
  assert.equal(source.zhangjiajie.scenes.length, 4);
  assert.equal(source.zhangjiajie.questions.length, 3);
  assert.equal(source.datong.scenes[0].photo.originalFilename, '微信图片_20260919174904_59_26.jpg');
  assert.equal(source.suzhou.scenes[0].photo.original.src, 'photo-library/suzhou/huqiu/original.jpg');
  for (const journey of Object.values(source)) {
    assert.equal(validateJourney(journey.id, journey).id, journey.id);
    for (const scene of journey.scenes) assert.equal(scene.hotspots.length, 3);
    for (const question of journey.questions) assert.ok(question.qEn);
  }
});

test('sphere adapter uses oriented display source without overwriting stored original', () => {
  const photo = source.suzhou.scenes[0].photo;
  const copy = structuredClone(photo);
  const viewerPhoto = toSpherePhoto(photo);
  assert.equal(viewerPhoto.original.src, 'photo-library/suzhou/huqiu/oriented.jpg');
  assert.equal(viewerPhoto.width, 3024);
  assert.equal(viewerPhoto.height, 4032);
  assert.equal(viewerPhoto.version, photo.displaySource.sha256);
  assert.deepEqual(photo, copy);
  const transformed = {...photo, sphere: {projection: 'sphere', asset: {
    src: 'https://example.com/sphere.jpg', width: 6000, height: 3000, sha256: 'new-content'
  }}};
  assert.equal(toSpherePhoto(transformed).src, transformed.sphere.asset.src);
  assert.equal(toSpherePhoto(transformed).sourceSha256, 'new-content');
  delete transformed.sphere.asset.sha256;
  assert.equal(toSpherePhoto(transformed).sourceSha256, undefined);
});

test('PostgreSQL roundtrip, unique destination, safe reseed and atomic imports', async () => {
  const connection = new PGlite();
  const db = new JourneyDatabase(connection);
  try {
    await db.initialize();
    await db.initialize();
    assert.equal((await db.importMissing(source)).length, 8);
    assert.deepEqual(await db.dictionary(), source);
    assert.equal(await db.get('unknown'), null);
    const edited = structuredClone(source.suzhou);
    edited.questions[0].q = '数据库编辑后的问题';
    edited.scenes[0].photo.original.src = 'https://example.com/upload.jpg';
    await db.save('suzhou', edited);
    assert.deepEqual(await db.get('suzhou'), edited);
    assert.deepEqual(await db.importMissing(source), []);
    assert.deepEqual(await db.get('suzhou'), edited);
    assert.equal(Object.keys(await db.dictionary()).length, 8);
    await assert.rejects(db.save('suzhou', source.datong), /match/);
    await assert.rejects(db.get("suzhou' OR 1=1--"), /destination/);
    const badAnswer = structuredClone(edited);
    badAnswer.questions[0].answer = 99;
    await assert.rejects(db.save('suzhou', badAnswer), /Question/);
    const first = {...source.suzhou, id: 'new-city'};
    await assert.rejects(db.importMissing({'new-city': first, bad: source.datong}), /match/);
    assert.equal(await db.get('new-city'), null);
    await assert.rejects(connection.query(`INSERT INTO destination_journeys VALUES ('invalid', '{}')`));
    await assert.rejects(connection.query(`INSERT INTO destination_journeys VALUES ('invalid',
      '{"id":null,"name":"bad","scenes":[],"questions":[]}')`));
    assert.deepEqual(await db.get('suzhou'), edited);
  } finally { await connection.close(); }
});

test('journey material relationships reject duplicate scenes and missing references', () => {
  const duplicate = structuredClone(source.suzhou);
  duplicate.scenes.push(duplicate.scenes[0]);
  assert.throws(() => validateJourney('suzhou', duplicate), /unique/);
  const missing = structuredClone(source.suzhou);
  missing.questions[0].sceneId = 'not-in-this-journey';
  assert.throws(() => validateJourney('suzhou', missing), /Question/);
  const malformed = structuredClone(source.suzhou);
  malformed.scenes[0].hotspots[0].x = 101;
  assert.throws(() => validateJourney('suzhou', malformed), /Hotspot/);
});

test('local database persists journeys after closing and reopening', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'tripwonder-journeys-'));
  let connection;
  try {
    connection = new PGlite(directory);
    const first = new JourneyDatabase(connection);
    await first.initialize();
    await first.save('suzhou', source.suzhou);
    await connection.close();
    connection = new PGlite(directory);
    assert.deepEqual(await new JourneyDatabase(connection).get('suzhou'), source.suzhou);
  } finally { await connection?.close(); await rm(directory, {recursive: true, force: true}); }
});

test('database catalog adapter installs real viewer photos, indexes and current questions', async () => {
  const connection = new PGlite();
  const db = new JourneyDatabase(connection);
  try {
    await db.initialize(); await db.importMissing(source);
    const edited = structuredClone(source.suzhou);
    edited.questions[0].q = '由数据库更新的题目';
    await db.save('suzhou', edited);
    const window = {MEDIA_ASSETS: {}};
    vm.runInNewContext(gameCatalogScript(await db.dictionary()), {window});
    const catalog = window.TRIPWONDER_CATALOG;
    assert.equal(catalog.cities.length, 8);
    assert.equal(catalog.photoById.size, 23);
    assert.equal(catalog.cities.find(c => c.id === 'suzhou').questions[0].q, edited.questions[0].q);
    assert.equal(catalog.photoById.get('suzhou-huqiu').original.src, edited.scenes[0].photo.displaySource.src);
    assert.equal(window.MEDIA_ASSETS['suzhou-huqiu'].thumb.src, edited.scenes[0].photo.thumb.src);
    assert.throws(() => gameCatalogScript({}), /empty/);
    assert.equal((await db.get('suzhou')).scenes[0].photo.original.src, source.suzhou.scenes[0].photo.original.src);
  } finally { await connection.close(); }
});
