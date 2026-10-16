const test = require('node:test');
const assert = require('node:assert/strict');
const { projection } = require('./sphere-math.js');

for (const ratio of [1.01, 4/3, 3/2, 5996/3683, 16/9, 8841/4415, 21/9, 4, 8]) {
  test(`perspective rays remain inside a ${ratio.toFixed(3)}:1 landscape photo`, () => {
    const p = projection(ratio, .5);
    for (const yaw of [-p.yawLimit, 0, p.yawLimit]) {
      for (const pitch of [-p.pitchLimit, 0, p.pitchLimit]) {
        for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) {
          let x = (i/5-1)*p.ty*.5, y = (j/5-1)*p.ty, z = 1;
          const norm = Math.hypot(x,y,z); x/=norm; y/=norm; z/=norm;
          const py = Math.cos(pitch)*y+Math.sin(pitch)*z;
          const pz = -Math.sin(pitch)*y+Math.cos(pitch)*z;
          const rx = Math.cos(yaw)*x+Math.sin(yaw)*pz;
          const rz = -Math.sin(yaw)*x+Math.cos(yaw)*pz;
          const u = .5+Math.atan2(rx,rz)/p.horizontalSpan;
          const v = .5-Math.asin(py)/p.verticalSpan;
          assert.ok(u>=0 && u<=1 && v>=0 && v<=1, `outside photo: ${u},${v}`);
        }
      }
    }
  });
}
test('portrait and invalid inputs are rejected', () => {
  for (const ratio of [0, 1, .5, NaN, Infinity]) assert.throws(() => projection(ratio,.5));
});
