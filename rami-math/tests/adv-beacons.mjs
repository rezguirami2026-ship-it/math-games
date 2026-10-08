// لقطات المنارات الثلاث في «إنقاذ القرية» (هل تظهر للاعب؟): node adv-beacons.mjs <مجلد>
import { openAdventure, sleep } from './adv-lib.mjs';
const out = process.argv[2];
const T = await openAdventure('rescue', { d3: true });
await T.ev(() => { const A = window.__adv; A.S.flags.met = 1; A.S.flags.salem = 1; A.S.flags.yousef = 1; A.S.flags.naser = 1; A.S.flags.tower_open = 1; A.S.flags.maryam = 1; A.give('fire', 1, true); A.give('lantern', 1, true); });
for (const [id, x, y] of [['bc1', 8, 8], ['bc2', 21, 8], ['bc3', 13, 18]]) {
  await T.ev(([x, y]) => window.__adv.tp(x, y), [x, y]); await sleep(1800); await T.shot(out, 'beacon-' + id);
}
await T.done();
