const test = require('node:test');
const assert = require('node:assert/strict');
const api = import('../sphere-projection.mjs');

for (const imageAspect of [.5625, .75, 1.0001, 4/3, 1.5, 16/9, 2, 21/9, 4, 8, 32]) {
  test(`sphere rays stay inside photo at aspect ${imageAspect}`, async () => {
    const {sphereProjection, spherePhotoAt, sphereScreenAt} = await api;
    for (const viewport of [.5, 390/844, 1, 2]) for (const zoom of [1, 1.5, 3]) {
      const p = sphereProjection(imageAspect, viewport, zoom);
      for (const yaw of [-p.yawLimit, 0, p.yawLimit]) for (const pitch of [-p.pitchLimit, 0, p.pitchLimit]) {
        for (let i=0;i<=8;i++) for (let j=0;j<=8;j++) {
          const sx=i/8,sy=j/8;
          const photo=spherePhotoAt(sx,sy,yaw,pitch,p);
          assert.ok(photo.u>=0 && photo.u<=1 && photo.v>=0 && photo.v<=1, JSON.stringify({imageAspect,viewport,zoom,photo}));
          const screen=sphereScreenAt(photo.u,photo.v,yaw,pitch,p);
          assert.ok(screen.forward>0);
          assert.ok(Math.abs(screen.x-sx)<1e-8 && Math.abs(screen.y-sy)<1e-8,'marker/placement projection must invert the rendered ray');
        }
      }
    }
  });
}
test('invalid dimensions rejected', async () => {
  const {sphereProjection} = await api;
  for(const value of [0,-1,NaN,Infinity])assert.throws(()=>sphereProjection(value,.5),RangeError);
});
