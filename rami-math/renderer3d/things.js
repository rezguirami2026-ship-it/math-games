// المركبات والقطع الكبيرة التي كانت ثنائية الأبعاد: الشاحنات والشاحنة الصغيرة، دكان ناصر، محطة الحافلات، المراكب (الداو)،
// الطائرة، مضخات الوقود، منصة التخرّج، كوخ المضخة، وبرجا الجرس. المواضع من ثوابت اللعبة؛ الحالة قراءة فقط.
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl, sphere, archShape, extrude, merlon } from './geom.js';
import { material, thatchMaterial } from './textures.js';
import { signMesh } from './omani.js';
import { SHOP } from '../missions/shop.js';
import { STATION } from '../world/market.js';
import { PIER_Y, SEA_X, SHIP_COLS } from '../world/harbor.js';
import { PUMPS } from '../world/caravan.js';
import { STAGE, ST } from '../world/workshop.js';
import { FI } from '../world/village.js';

const flat = (c, r = .6, m = 0) => material('flat', c, { rough: r, metal: m });

/* ── الشاحنة: مقصورة برتقالية بزجاج ومصابيح، صندوق معدني مضلّع، عجلات بإطارات، وحمولة صناديق أو غطاء أخضر ── */
function truckModel() {
  const g = new THREE.Group(), P = new Parts(), body = flat('#D8752C', .45, .2), bed = flat('#A9B3BE', .5, .5), dark = flat('#1E1E24', .8);
  P.add(bed, box(56, 4, 30, -13, 13, 0)); [-1, 1].forEach(sd => P.add(bed, box(56, 14, 2, -13, 22, sd * 14)));
  P.add(bed, box(2, 14, 30, -40, 22, 0)); P.add(flat('#8E99A5', .5, .5), box(2, 16, 30, 14, 23, 0));
  for (let k = 0; k < 6; k++) [-1, 1].forEach(sd => P.add(flat('#8E99A5', .5, .5), box(1.2, 14, .6, -38 + k * 9, 22, sd * 15.2)));
  P.add(body, box(26, 30, 30, 28, 24, 0, 4)); P.add(body, box(10, 14, 30, 44, 15, 0, 3));                 // المقصورة ومقدّمتها
  P.add(flat('#9CC8DA', .15, .2), box(1, 12, 24, 41.2, 31, 0)); [-1, 1].forEach(sd => P.add(flat('#9CC8DA', .15, .2), box(16, 10, 1, 28, 31, sd * 15.2)));
  P.add(flat('#FFE7A0', .3), box(1, 4, 6, 49.2, 15, -10)); P.add(flat('#FFE7A0', .3), box(1, 4, 6, 49.2, 15, 10)); P.add(flat('#3A3A44', .6), box(2, 5, 30, 49.5, 8, 0));
  [[-28, -15], [-28, 15], [-12, -15], [-12, 15], [32, -15], [32, 15]].forEach(([x, z]) => { P.add(dark, cyl(7, 7, 5, 0, 0, 0, 14).rotateX(Math.PI / 2).translate(x, 7, z)); P.add(flat('#9AA5B1', .4, .6), cyl(3, 3, 5.4, 0, 0, 0, 10).rotateX(Math.PI / 2).translate(x, 7, z)); });
  g.add(P.build());
  const crates = []; for (let k = 0; k < 8; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(11, 9, 11), material('wood', '#C9894A')); c.position.set(-34 + (k % 4) * 12.5, 20 + Math.floor(k / 4) * 9.5, (k % 2 ? 5 : -5)); c.castShadow = true; c.visible = false; g.add(c); crates.push(c); }
  const tarp = new THREE.Mesh(new THREE.BoxGeometry(56, 16, 31, 1, 2, 1), flat('#3F7D5A', .9)); tarp.position.set(-13, 34, 0); tarp.castShadow = true; tarp.visible = false; g.add(tarp);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, crates, tarp, body: g.children[0] };
}
export function vehicles() {
  const group = new THREE.Group(), pool = new Map();
  return { group, update(list) {
    const seen = new Set();
    list.forEach(v => {
      let T = pool.get(v.id); if (!T) { T = truckModel(); T.yaw = 0; T.lx = v.x; T.ly = v.y; pool.set(v.id, T); group.add(T.g); }
      seen.add(v.id); T.g.visible = true;
      const dx = v.x - T.lx, dy = v.y - T.ly; if (dx * dx + dy * dy > .05) { const want = Math.atan2(-dy, dx); let d = want - T.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); T.yaw += d * .2; }   // تتجه إلى حيث تسير
      T.lx = v.x; T.ly = v.y;
      T.g.position.set(v.x + (v.shake ? Math.sin(performance.now() / 30) * 2 : 0), -(v.sag || 0) * .3, v.y - 4); T.g.rotation.y = T.yaw; T.g.scale.setScalar(v.s || 1);
      T.tarp.visible = !!v.covered; T.crates.forEach((c, i) => { c.visible = !v.covered && i < Math.min(8, v.load || 0); });
    });
    pool.forEach((T, id) => { if (!seen.has(id)) T.g.visible = false; });
  } };
}

/* ── دكان العم ناصر: جدار خلفي برفوف وبضاعة، قائمان، مظلة مخططة، منضدة، ولافتة ── */
export function shop3d() {
  const P = new Parts(), x = SHOP.x, z = SHOP.y, wd = material('wood', '#7A4A2A');
  P.add(material('plaster', '#D9B98A'), box(128, 86, 8, x, 43, z - 46));
  [-30, -8].forEach(dy => P.add(wd, box(116, 3, 12, x, 86 + dy - 30, z - 40)));
  const goods = ['#2E6B9E', '#E6DCC4', '#7A8792', '#4E7A34', '#C46A1E', '#E6DCC4'];
  [34, 56].forEach((y, r) => goods.forEach((col, i) => P.add(flat(col, .7), box(12, 12 + (i % 2) * 4, 9, x - 50 + i * 20, y + 6, z - 40))));
  [-62, 58].forEach(dx => P.add(wd, box(6, 108, 6, x + dx, 54, z - 4)));
  for (let k = 0; k < 7; k++) P.add(k % 2 ? flat('#F4E3B8', .7) : flat('#2F6B73', .6), box(20, 2.4, 52, 0, 0, 0).rotateX(.32).translate(x - 64 + (k + .5) * 18.6, 104, z - 20));
  P.add(material('wood', '#9C6438'), box(124, 6, 22, x, 32, z - 4)); P.add(flat('#2F6B73', .7), box(120, 28, 18, x, 15, z - 4));
  const g = P.build(); const s = signMesh('دكان ناصر', 20); s.position.set(x, 120, z + 6); g.add(s); return g;
}

/* ── محطة الحافلات: سقف مسطح على قوائم، مقاعد، وحافة زرقاء ── */
export function busStation() {
  const P = new Parts(), S = STATION, H = 96, steel = flat('#55595F', .45, .6);
  [S.x + 10, S.x + S.w / 2, S.x + S.w - 10].forEach(x => P.add(steel, cyl(3, 3, H, x, H / 2, S.y + 30, 10)));
  P.add(flat('#E2DDD2', .6), box(S.w + 20, 6, 50, S.x + S.w / 2, H + 3, S.y + 14)); P.add(flat('#2F6B73', .6), box(S.w + 22, 8, 2, S.x + S.w / 2, H - 2, S.y + 39.5));
  [S.x + 75, S.x + S.w - 85].forEach(x => { P.add(material('wood', '#9C6438'), box(70, 3, 14, x, 16, S.y + 22)); P.add(material('wood', '#9C6438'), box(70, 12, 2, x, 26, S.y + 16)); [-30, 30].forEach(dx => P.add(steel, box(2, 16, 12, x + dx, 8, S.y + 22))); });
  const g = P.build(); const s = signMesh('محطة الحافلات', 19); s.position.set(S.x + S.w / 2, H - 4, S.y + 42); g.add(s); return g;
}

/* ── المراكب الراسية: بدن خشبي مقوّس، سطح، صاري وشراع مثلث بلون كل سفينة (ألوان درس تمييز الأشكال) ── */
export function dhows() {
  const g = new THREE.Group(), boats = [];
  PIER_Y.forEach((y, i) => {
    const b = new THREE.Group(), P = new Parts(), hull = material('wood', '#8B5A2B');
    const sh = new THREE.Shape(); sh.moveTo(-80, 14); sh.quadraticCurveTo(-70, -4, -30, -8); sh.lineTo(40, -8); sh.quadraticCurveTo(76, -4, 92, 20); sh.lineTo(-80, 20); sh.closePath();
    const hg = new THREE.ExtrudeGeometry(sh, { depth: 34, bevelEnabled: false }); hg.translate(0, 0, -17); P.add(hull, hg, { scale: 1 / 50 });
    P.add(material('wood', '#C9A06A'), box(160, 3, 32, 4, 20, 0)); P.add(flat(SHIP_COLS[i], .6), box(172, 4, 35, 6, 14, 0));
    P.add(material('wood', '#5A3A1A'), cyl(1.8, 2.2, 110, 0, 75, 0, 8));
    b.add(P.build());
    const sail = new THREE.Shape(); sail.moveTo(0, 0); sail.lineTo(0, 92); sail.quadraticCurveTo(46, 50, 70, 4); sail.closePath();
    const sm = new THREE.Mesh(new THREE.ShapeGeometry(sail), new THREE.MeshStandardMaterial({ color: '#F4EEDC', side: THREE.DoubleSide, roughness: .8 })); sm.position.set(2, 26, 0); sm.castShadow = true; b.add(sm);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshStandardMaterial({ color: SHIP_COLS[i], side: THREE.DoubleSide })); fl.position.set(9, 130, 0); b.add(fl);
    b.position.set(SEA_X + 118, 0, y + 12); b.rotation.y = Math.PI; b.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(b); boats.push(b);   // البدن بمحاذاة الرصيف والشراع مواجه للكاميرا
  });
  g.userData.tick = t => boats.forEach((b, i) => { b.position.y = Math.sin(t * 1.4 + i * 2) * 1.6; b.rotation.z = Math.sin(t * 1.1 + i) * .025; });
  return g;
}

/* ── الطائرة على المدرج ── */
export function plane3d() {
  const P = new Parts(), x = 1180, z = 4612, white = flat('#F4F6F8', .35, .2), blue = flat('#2F6FB2', .4);
  P.add(white, cyl(9, 9, 92, 0, 0, 0, 16).rotateZ(Math.PI / 2).translate(x, 14, z)); P.add(white, sphere(9, x + 46, 14, z, 16, 10)); P.add(white, cyl(9, 2, 22, 0, 0, 0, 16).rotateZ(Math.PI / 2).translate(x - 57, 16, z));
  P.add(blue, box(92, 3, 18.4, x, 12, z)); P.add(flat('#2C3E50', .15), box(8, 5, 14, x + 46, 18, z));
  P.add(white, box(30, 2.4, 150, x - 4, 11, z, 1)); P.add(white, box(14, 2, 56, x - 58, 18, z, 1)); P.add(flat('#C0392B', .5), box(16, 26, 2.4, x - 60, 32, z, 1));
  for (let k = 0; k < 8; k++) [-1, 1].forEach(sd => P.add(flat('#3E5A66', .2), box(4, 4, 1, x - 26 + k * 9, 18, z + sd * 9)));
  [[x + 30, 0], [x - 8, -18], [x - 8, 18]].forEach(([wx, dz]) => { P.add(flat('#7A8792', .5, .5), box(2, 6, 2, wx, 3, z + dz)); P.add(flat('#1E1E24', .8), cyl(3, 3, 3, 0, 0, 0, 10).rotateX(Math.PI / 2).translate(wx, 3, z + dz)); });
  return P.build();
}
/* ── مضخات الوقود ── */
export function pumps3d() {
  const P = new Parts(); PUMPS.forEach(x => { P.add(material('stone', '#BBA684'), box(36, 6, 18, x, 3, 4798)); P.add(flat('#D9483B', .4, .2), box(22, 50, 14, x, 31, 4796, 3)); P.add(flat('#E8F4F0', .2), box(14, 10, 1, x, 44, 4803.5)); P.add(flat('#2B2B2B', .6), box(3, 3, 3, x + 13, 38, 4796)); P.add(flat('#FFFFFF', .5), box(22.4, 3, 14.4, x, 26, 4796)); });
  const canopy = new Parts(); canopy.add(flat('#F4F2EC', .5), box(280, 8, 90, (PUMPS[0] + PUMPS[1]) / 2, 110, 4790)); canopy.add(flat('#C0392B', .5), box(282, 10, 2, (PUMPS[0] + PUMPS[1]) / 2, 104, 4836)); [PUMPS[0] - 120, PUMPS[1] + 120].forEach(x => canopy.add(flat('#55595F', .45, .6), cyl(3, 3, 106, x, 53, 4790, 8)));
  const g = P.build(); g.add(canopy.build()); return g;
}

/* ── منصة التخرّج: منصة خشبية بدرجات، قائمان، ولوحة مقوّسة بنصّها (يتغير بعد إكمال الدروس)، وقصاصات احتفال ── */
export function stage3d() {
  const g = new THREE.Group(), P = new Parts(), x = STAGE.x, wd = material('wood', '#8B5A2B'), H = 30;
  P.add(wd, box(ST.w, H, ST.h, ST.x + ST.w / 2, H / 2, ST.y + ST.h / 2)); P.add(material('wood', '#A9743F'), box(ST.w + 4, 3, ST.h + 4, ST.x + ST.w / 2, H + 1.5, ST.y + ST.h / 2));
  P.add(flat('#8E2A22', .9), box(ST.w + 2, 8, ST.h * .2, ST.x + ST.w / 2, H - 6, ST.y + ST.h + 1));
  [[80, 10], [92, 5]].forEach(([w, dy], i) => P.add(material('wood', '#A9743F'), box(w, 10 + i * 10, 14, x, 5 + i * 5, ST.y + ST.h + 7 - i * 7)));
  [-150, 146].forEach(dx => P.add(wd, box(8, 150, 8, x + dx, H + 75, ST.y + 14)));
  g.add(P.build());
  const c = document.createElement('canvas'); c.width = 768; c.height = 160; const ctx = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(300, 62), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .6 })); board.position.set(x, H + 136, ST.y + 18); g.add(board);
  let last = null; const paint = done => { if (done === last) return; last = done; ctx.clearRect(0, 0, 768, 160);
    ctx.fillStyle = done ? '#1F7A4A' : '#3F4C59'; ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(0, 40); ctx.quadraticCurveTo(384, -30, 768, 40); ctx.lineTo(768, 160); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#E3B04B'; ctx.lineWidth = 8; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = '900 36px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillText(done ? '🎓 مبارك! أكملتَ الدروس الـ٦٩' : 'منصة التخرّج — تنتظر بطل الدروس كلها', 384, 110); tex.needsUpdate = true; };
  const conf = []; for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ color: ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF'][i % 4], side: THREE.DoubleSide })); m.visible = false; g.add(m); conf.push(m); }
  g.userData.update = (t, done) => { paint(!!done); conf.forEach((m, i) => { m.visible = !!done; if (!done) return; const k = (t * .4 + i / 30) % 1; m.position.set(x + Math.sin(i * 2.4) * 150, 260 - k * 220, ST.y + 30 + Math.cos(i * 1.7) * 40); m.rotation.set(t * 3 + i, t * 2 + i, 0); }); };
  return g;
}

/* ── كوخ المضخة في المزرعة: جدار، سقف صاج مضلّع، خزان ماء، وأكياس ── */
export function farmShed3d() {
  const P = new Parts(), x = FI.x + 440, z = FI.y + 180, w = 80, d = 46, H = 56;
  P.add(material('plaster', '#D9C9A8'), box(w, H, d, x + w / 2, H / 2, z + d / 2, 1.5));
  P.add(material('metal', '#9AA5B1', { rough: .5, metal: .6 }), box(w + 10, 3, d + 10, x + w / 2, H + 1.5, z + d / 2)); for (let k = 0; k < 11; k++) P.add(material('metal', '#B9C3CC', { rough: .5, metal: .6 }), box(1.4, 1.2, d + 10, x - 4 + k * 8.8, H + 3.4, z + d / 2));
  P.add(material('wood', '#6E4524'), box(22, 40, 2, x + 26, 20, z + d + 1));
  P.add(flat('#F4F6F7', .4), cyl(12, 12, 26, x + w + 14, 13, z + 12, 16));
  [[x - 10, z + d + 6], [x - 2, z + d + 10]].forEach(([bx, bz]) => P.add(flat('#E6D9B8', .9), box(12, 8, 9, bx, 4, bz, 2)));
  return P.build();
}
/* ── برجا الجرس في القلعة: قائمان، قوس، سقف بلون الفريق، وجرس يتأرجح ── */
export function bellTowers() {
  const g = new THREE.Group(), bells = [];
  [[2380, '#C0392B'], [2480, '#2F6FB2']].forEach(([x, col]) => {
    const P = new Parts(), st = material('stone', '#C9AE7E'); [-16, 16].forEach(dx => P.add(st, box(8, 80, 8, x + dx, 40, 1810)));
    P.add(st, box(44, 8, 12, x, 82, 1810)); P.add(flat(col, .6), new THREE.ConeGeometry(30, 26, 4).rotateY(Math.PI / 4).translate(x, 99, 1810)); g.add(P.build());
    const b = new THREE.Group(); b.position.set(x, 76, 1810); const bell = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [9, 0], [8, 3], [6, 12], [3, 16], [0, 17]].map(([a, c]) => new THREE.Vector2(a, -c)), 16), flat('#C99A3A', .3, .9)); bell.castShadow = true; b.add(bell); g.add(b); bells.push(b);
  });
  g.userData.tick = t => bells.forEach((b, i) => { b.rotation.z = Math.sin(t * 2.4 + i) * .12; });
  return g;
}
