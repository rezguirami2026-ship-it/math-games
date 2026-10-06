// قطع الدروس والمحطات الثابتة مجسّمة: طاولات العمل، السبورة، أعمدة الملعب، لوحات المواعيد والتقويم، إشارات الرصيف،
// البسطات، الصناديق، مظلة الشاطئ، السير الناقل، آلة التعبئة، لوحات البيانات، كشك الدوّار، أعمدة وحبال الزينة، اللافتة الإرشادية، والإشارة الضوئية.
// (رسومات الدروس المتغيرة فوقها — الأرقام والعلامات — تبقى مرسومة في مكانها فوق المشهد.)
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl, sphere } from './geom.js';
import { material } from './textures.js';
import { signMesh } from './omani.js';
import { BENCH, BOARD, BAYS, TIMETABLE, CAL, SQUARE, FLOOD } from '../world/market.js';
import { FRAME_TABLE, GIFT_TABLE, ROOF_TABLE, CRATES } from '../world/harbor.js';
import { ST4 } from '../world/fort.js';
import { ST5, ST6, STALLS, BUNTING, FUNPARK } from '../world/festival.js';
import { LANTERNS } from '../world/coop.js';
import { POLES, TABLES, STAGE, ST } from '../world/workshop.js';
import { SIGNAL } from '../world/village.js';

const flat = (c, r = .6, m = 0) => material('flat', c, { rough: r, metal: m });
const WD = () => material('wood', '#7A4A2A'), WDL = () => material('wood', '#9C6438'), STEEL = () => flat('#4B4F57', .45, .6);

/* طاولة عمل خشبية بأدوات حسب النوع */
function table(P, x, y, tools) {
  P.add(WDL(), box(70, 7, 30, x, 30, y - 14, 1)); [[-30, -24], [30, -24], [-30, -4], [30, -4]].forEach(([dx, dz]) => P.add(WD(), box(4, 27, 4, x + dx, 13.5, y + dz)));
  P.add(WD(), box(64, 2, 24, x, 10, y - 14));
  if (tools === 'frames') { P.add(STEEL(), cyl(.9, .9, 26, 0, 0, 0, 6).rotateZ(.9).translate(x - 10, 42, y - 14)); P.add(STEEL(), cyl(.9, .9, 26, 0, 0, 0, 6).rotateZ(-.9).translate(x + 2, 42, y - 14)); P.add(flat('#E2475C'), sphere(2, x - 4, 50, y - 14)); }
  if (tools === 'gifts') [['#E85D75', -18], ['#2F6FB2', 0], ['#2E8B57', 18]].forEach(([c, dx]) => { P.add(flat(c), box(12, 10, 12, x + dx, 38.5, y - 14)); P.add(flat('#FFC23D'), box(2.4, 10.4, 12.4, x + dx, 38.5, y - 14)); });
  if (tools === 'roof') { P.add(material('wood', '#D9A066'), box(44, 3, 10, x - 4, 35, y - 14)); P.add(flat('#A9B4BF', .4, .5), cyl(8, 8, 1.4, 0, 0, 0, 16, false).rotateX(Math.PI / 2).translate(x + 18, 40, y - 10)); }
  if (tools === 'scale') { P.add(STEEL(), cyl(1, 1, 16, x, 42, y - 14, 6)); P.add(STEEL(), box(30, 1.4, 1.4, x, 50, y - 14)); [-15, 15].forEach(dx => P.add(flat('#A9B4BF', .4, .6), cyl(7, 5, 2, x + dx, 46, y - 14, 14))); }
  if (tools === 'recipe') { P.add(flat('#F2E6C9', .8), box(30, 1.6, 20, x, 34.5, y - 14)); P.add(flat('#B8413A', .7), box(4, 2, 20, x, 34.8, y - 14)); }
}
/* بسطة سوق: قائمان، منضدة ببضاعة، ومظلة مخططة */
function stall(P, x, y, col) {
  [-38, 36].forEach(dx => P.add(WD(), box(5, 66, 5, x + dx, 33, y - 10)));
  P.add(WDL(), box(82, 6, 24, x, 30, y - 10)); P.add(flat('#7A4A2A', .8), box(80, 26, 20, x, 14, y - 10));
  ['#C46A1E', '#4E7A34', '#E3B04B', '#B8413A'].forEach((g, k) => { for (let i = 0; i < 3; i++) P.add(flat(g, .6), sphere(3.4, x - 30 + k * 18 + i * 4, 36, y - 14 + (i % 2) * 6, 8, 6)); });
  for (let k = 0; k < 5; k++) P.add(k % 2 ? flat('#F2E6C9', .7) : flat(col, .6), box(17.6, 2.2, 30, 0, 0, 0).rotateX(.3).translate(x - 35 + k * 17.6, 66, y - 8));   // المظلة على رأسي القائمين
}
/* لوح على قائمين (سبورة، لوح بيانات) */
function board(P, x, y, w, h, faceCol, frameCol, legH) {
  [-w / 2 + 6, w / 2 - 6].forEach(dx => P.add(WD(), box(4, legH + h, 4, x + dx, (legH + h) / 2, y - 6)));
  P.add(material('wood', frameCol), box(w, h, 4, x, legH + h / 2, y - 6)); P.add(flat(faceCol, .9), box(w - 6, h - 6, 1, x, legH + h / 2, y - 3.6));
}
/* حبل زينة: رايات مثلثة أو فوانيس، بين قائمين */
function rope(g, a, b, sag, n, kind) {
  const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push(new THREE.Vector3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - Math.sin(Math.PI * u) * sag, a.z + (b.z - a.z) * u)); }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#4A3424' })));
  const cols = ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF', '#2F6FB2'];
  for (let k = 1; k < n; k++) {
    const u = k / n, p = new THREE.Vector3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - Math.sin(Math.PI * u) * sag, a.z + (b.z - a.z) * u);
    let m;
    if (kind === 'flag') { const s = new THREE.Shape(); s.moveTo(-6, 0); s.lineTo(6, 0); s.lineTo(0, -12); s.closePath(); m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color: cols[k % 5], side: THREE.DoubleSide, roughness: .8 })); }
    else { m = new THREE.Mesh(new THREE.OctahedronGeometry(3, 0), new THREE.MeshStandardMaterial({ color: cols[k % 4], emissive: cols[k % 4], emissiveIntensity: .8 })); m.scale.y = 1.5; p.y -= 5; }
    m.position.copy(p); g.add(m);
  }
}

export function lessonProps() {
  const g = new THREE.Group(), P = new Parts(), anim = [];
  // السوق
  table(P, BENCH.x, BENCH.y, null); P.add(STEEL(), box(10, 8, 8, BENCH.x - 22, 38, BENCH.y - 14)); P.add(STEEL(), box(30, 1, 8, BENCH.x + 14, 34.5, BENCH.y - 14));
  [-1, 0, 1].forEach(k => P.add(WD(), box(3, 70, 3, 0, 0, 0).rotateZ(k * .14).translate(BOARD.x + k * 12, 35, BOARD.y - (k ? 0 : 8)))); P.add(WDL(), box(58, 38, 4, BOARD.x, 52, BOARD.y - 2)); P.add(flat('#2F4F3F', .9), box(52, 32, 1, BOARD.x, 52, BOARD.y + .5));
  FLOOD.forEach(([x, y]) => { P.add(flat('#4B4747', .5, .5), cyl(2, 2.6, 120, x, 60, y, 8)); P.add(flat('#2E2B2B', .5, .5), box(26, 14, 8, x, 124, y)); for (let k = 0; k < 3; k++) P.add(flat('#FFF3C8', .2), cyl(2.6, 2.6, 1, 0, 0, 0, 10).rotateX(Math.PI / 2).translate(x - 7 + k * 7, 124, y + 4.2)); });
  BAYS.forEach(b => { P.add(flat('#55595F', .5, .5), cyl(1.6, 1.6, 70, b.x - 52, 35, b.y - 30, 8)); const s = signMesh(b.id, 18); s.position.set(b.x - 52, 78, b.y - 28); g.add(s); });
  [-24, 24].forEach(dx => P.add(flat('#4B4747', .5, .5), box(4, 40, 4, TIMETABLE.x + dx, 20, TIMETABLE.y - 4))); P.add(flat('#2A2D35', .5), box(72, 50, 6, TIMETABLE.x, 64, TIMETABLE.y - 4)); P.add(flat('#12151B', .3), box(62, 38, 1, TIMETABLE.x, 64, TIMETABLE.y - .6));
  for (let i = 0; i < 3; i++) [-14, 14].forEach(dx => P.add(flat('#FFB938', .4, 0), box(22, 4, .6, TIMETABLE.x + dx, 74 - i * 11, TIMETABLE.y)));
  [-40, 40].forEach(dx => P.add(WD(), box(5, 40, 5, CAL.x + dx, 20, CAL.y - 6))); P.add(WDL(), box(100, 68, 5, CAL.x, 70, CAL.y - 6)); P.add(flat('#EADDC0', .9), box(92, 60, 1, CAL.x, 70, CAL.y - 3.2));
  P.add(material('wood', '#6E4524'), new THREE.CylinderGeometry(.01, 66, 18, 4, 1).rotateY(Math.PI / 4).scale(1, 1, .3).translate(CAL.x, 113, CAL.y - 6));
  [[SQUARE.x + 50, '#2F6B73'], [SQUARE.x + 220, '#B8613E']].forEach(([x, col]) => stall(P, x, SQUARE.y + 174, col));
  // الميناء
  [[FRAME_TABLE, 'frames'], [GIFT_TABLE, 'gifts'], [ROOF_TABLE, 'roof']].forEach(([tb, k]) => table(P, tb.x, tb.y, k));
  [[-46, 0, 0], [-30, 0, 0], [-38, 0, 1], [36, 0, 0], [50, 0, 0]].forEach(([dx, dz, lvl]) => P.add(material('wood', '#C9894A'), box(14, 12, 14, CRATES.x + dx, 6 + lvl * 12, CRATES.y + 4 + dz)));
  P.add(material('wood', '#7A4A2A'), cyl(1.2, 1.2, 60, 2820, 30, 1400, 6)); P.add(flat('#E85D75', .7), new THREE.ConeGeometry(36, 14, 12, 1, true).translate(2820, 64, 1400)); [[-20, 2], [10, 6]].forEach(([dx, dz]) => P.add(flat('#F2F0EA', .7), box(22, 4, 12, 2820 + dx, 6, 1400 + dz)));
  // القلعة
  [[ST4.trip, '#2E8B57'], [ST4.change, '#7B3F98']].forEach(([s, col]) => stall(P, s.x, s.y - 22, col));
  const C = ST4.conveyor; [C.x - 100, C.x - 30, C.x + 40, C.x + 96].forEach(x => P.add(STEEL(), box(5, 28, 5, x, 14, C.y - 34))); P.add(flat('#7E8996', .4, .5), box(224, 8, 22, C.x, 32, C.y - 34)); P.add(flat('#2E333B', .9), box(216, 1, 18, C.x, 36.6, C.y - 34));
  [-1, 1].forEach(sd => P.add(flat('#5E6874', .4, .6), cyl(5, 5, 22, 0, 0, 0, 12).rotateX(Math.PI / 2).translate(C.x + sd * 110, 32, C.y - 34)));
  const K = ST4.pack; P.add(flat('#B07430', .5, .3), box(60, 52, 34, K.x, 26, K.y - 40)); P.add(flat('#C98A3A', .5, .3), box(62, 8, 36, K.x, 56, K.y - 40)); P.add(flat('#FFE7A0', .3), box(40, 14, 1, K.x, 38, K.y - 22.6));
  const led = new THREE.Mesh(new THREE.SphereGeometry(3, 10, 8), new THREE.MeshStandardMaterial({ color: '#3BE07A', emissive: '#3BE07A', emissiveIntensity: 1 })); led.position.set(K.x + 14, 20, K.y - 22.5); g.add(led);
  anim.push(t => { led.material.emissiveIntensity = (t * 2 % 1) < .5 ? 1.6 : .2; });
  // ساحة المهرجان
  [[ST6.graph, 'line'], [ST6.survey, 'bars']].forEach(([s, kind]) => {   // لوحا البيانات: محوران أبيضان، وخط صاعد أو أعمدة صفراء
    board(P, s.x, s.y - 50, 108, 64, '#2F4F3F', '#9C6438', 36); const bx = s.x, bz = s.y - 52.8, by = 36;
    P.add(flat('#FFFFFF', .5), box(80, 1.6, .4, bx, by + 12, bz)); P.add(flat('#FFFFFF', .5), box(1.6, 44, .4, bx - 38, by + 33, bz));
    if (kind === 'line') P.add(flat('#FFC23D', .4), box(84, 1.8, .5, 0, 0, 0).rotateZ(.44).translate(bx, by + 30, bz));
    else [16, 28, 10].forEach((h, i) => P.add(flat('#FFC23D', .4), box(12, h, .5, bx - 22 + i * 22, by + 13 + h / 2, bz)));
  });
  const S = ST6.spinner; [-56, 50].forEach(dx => P.add(WD(), box(6, 76, 6, S.x + dx, 38 + 40, S.y - 64)));
  for (let k = 0; k < 7; k++) P.add(k % 2 ? flat('#F2E6C9', .7) : flat('#E85D75', .6), box(18.3, 2.4, 30, 0, 0, 0).rotateX(.3).translate(S.x - 55 + k * 18.3, 132, S.y - 56));
  P.add(WDL(), box(104, 8, 20, S.x, 46, S.y - 56)); P.add(flat('#7A4A2A', .8), box(104, 10, 18, S.x, 38, S.y - 56));
  const wheel = new THREE.Group(); wheel.position.set(S.x, 96, S.y - 62);
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(27, 8, i * Math.PI / 4, Math.PI / 4), new THREE.MeshStandardMaterial({ color: i % 2 ? '#2F6FB2' : '#E2475C', side: THREE.DoubleSide, roughness: .6 })); wheel.add(m); }
  g.add(wheel); anim.push(t => { wheel.rotation.z = -t * .8; });
  [[ST5.scale, 'scale'], [ST5.recipe, 'recipe']].forEach(([s, k]) => table(P, s.x, s.y - 18, k));
  STALLS.forEach(([x, y, col]) => stall(P, x, y, col));
  BUNTING.forEach(([x1, x2, y, h]) => { [x1, x2].forEach(x => P.add(WD(), box(4, h * 1.3, 4, x, h * .65, y))); rope(g, new THREE.Vector3(x1, h * 1.3, y), new THREE.Vector3(x2, h * 1.3, y), 26, Math.max(6, Math.round((x2 - x1) / 34)), 'flag'); });
  // الجمعية
  LANTERNS.forEach(([a, b, y]) => { [a, b].forEach(x => P.add(WD(), box(4, 104, 4, x, 52, y))); rope(g, new THREE.Vector3(a, 104, y), new THREE.Vector3(b, 104, y), 30, 14, 'lantern'); });
  // الورشة
  POLES.forEach(([x, y]) => P.add(WD(), box(4, 120, 4, x, 60, y)));
  const [pa, pb] = POLES; rope(g, new THREE.Vector3(pa[0], 120, pa[1]), new THREE.Vector3(STAGE.x - 146, 170, ST.y + 14), 22, 6, 'lantern'); rope(g, new THREE.Vector3(STAGE.x + 146, 170, ST.y + 14), new THREE.Vector3(pb[0], 120, pb[1]), 22, 6, 'lantern');
  TABLES.forEach(([x, y, k]) => table(P, x, y, k));
  // القرية: لافتة إرشادية والإشارة الضوئية
  P.add(WD(), box(4, 70, 4, 784, 35, 586)); [['المستودع', -1, 58], ['المزرعة', 1, 70]].forEach(([t, sd, h]) => { const s = signMesh(t + (sd < 0 ? ' ←' : ' →'), 12); s.position.set(784 + sd * 34, h, 586); g.add(s); });
  P.add(flat('#3D3A3A', .5, .5), cyl(2, 2, 60, SIGNAL.x, 30, SIGNAL.y - 4, 8)); P.add(flat('#2B2B2B', .5), box(14, 30, 10, SIGNAL.x, 70, SIGNAL.y - 4));
  const red = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), new THREE.MeshStandardMaterial({ color: '#E2475C' })), green = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), new THREE.MeshStandardMaterial({ color: '#3BE07A' }));
  red.position.set(SIGNAL.x, 78, SIGNAL.y + 1.5); green.position.set(SIGNAL.x, 63, SIGNAL.y + 1.5); g.add(red, green);
  g.add(P.build());
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.tick = (t, sig) => { anim.forEach(f => f(t)); red.material.emissive.set(sig ? '#000' : '#E2475C'); red.material.emissiveIntensity = sig ? 0 : 1.4; green.material.emissive.set(sig ? '#3BE07A' : '#000'); green.material.emissiveIntensity = sig ? 1.4 : 0; };
  return g;
}
