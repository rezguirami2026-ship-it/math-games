// المناطق السبع خارج قلب القرية مجسّمة: كل منطقة تصدّر R3D (مبانٍ، نخيل، شجيرات، مقاعد، آبار، أكشاك، بوابة) من ثوابتها نفسها،
// فتقع المجسّمات على أرضيات التصادم بالضبط. البوابات تُفتح بحركة حسب حالة اللعبة (قراءة فقط).
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl, sphere, archShape, archPath, extrude, merlon } from './geom.js';
import { material, adobe } from './textures.js';
import { omaniHouse, signMesh, stoneWall, SCALE_H } from './omani.js';
import { palms, shrubs } from './nature.js';
import { bench, well } from './props.js';
import { fader } from './world.js';
import { R3D as MARKET } from '../world/market.js';
import { R3D as HARBOR } from '../world/harbor.js';
import { R3D as FORT } from '../world/fort.js';
import { R3D as FEST } from '../world/festival.js';
import { R3D as COOP } from '../world/coop.js';
import { R3D as CARAVAN } from '../world/caravan.js';
import { R3D as WORK } from '../world/workshop.js';
import { R3D as DATA } from '../world/datayard.js';

const ORDER = [MARKET, HARBOR, FORT, FEST, COOP, CARAVAN, WORK, DATA];   // بترتيب REGIONS في main.js (لحالة البوابات)
const flat = (c, r = .6, m = 0) => material('flat', c, { rough: r, metal: m });
const STONE = () => material('stone', '#CDB58C'), WALLTOP = () => material('plaster', '#D8C49C');

/* ── بوابة شرق-غرب (القلعة، المهرجان، الجمعية، القافلة، الورشة): سور بشُرَف، برجان، عتبة بلافتة، ومصراعان يدوران ── */
function gateEW([Y, x0, x1, label]) {
  const g = new THREE.Group(), P = new Parts(), H = 72, TH = 104;
  stoneWall(P, 0, Y + 6, x0 - 24, Y + 6, H, 12); stoneWall(P, x1 + 24, Y + 6, 2930, Y + 6, H, 12);
  [x0 - 19, x1 + 19].forEach(tx => {   // برجان دائريان بشُرَف
    P.add(STONE(), cyl(17, 19, TH, tx, TH / 2, Y + 4, 18)); P.add(WALLTOP(), cyl(20, 20, 6, tx, TH + 3, Y + 4, 18));
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; P.add(WALLTOP(), merlon(tx + Math.cos(a) * 17, TH + 6, Y + 4 + Math.sin(a) * 17, -a + Math.PI / 2, .85)); }
    [.4, .65].forEach(k => P.add(flat('#2A2420', 1), box(3, 10, 1, tx, TH * k, Y + 22)));
  });
  P.add(WALLTOP(), box(x1 - x0 + 30, 16, 16, (x0 + x1) / 2, 84, Y + 6));   // العتبة فوق الممر
  g.add(P.build());
  const s = signMesh(label, 19); s.position.set((x0 + x1) / 2, 84, Y + 15); g.add(s);
  const leafW = (x1 - x0) / 2, leaves = [-1, 1].map(sd => {   // المصراعان على مفصلين عند طرفي الممر
    const pv = new THREE.Group(); pv.position.set(sd < 0 ? x0 : x1, 0, Y + 6);
    const lp = new Parts(); lp.add(material('wood', '#7A4A2A'), box(leafW, 66, 5, -sd * leafW / 2, 33, 0), { scale: 1 / 50 });
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) lp.add(flat('#C99A3A', .35, .85), sphere(1.4, -sd * (8 + k * (leafW - 16) / 2), 10 + r * 15, 2.8, 6, 4));
    pv.add(lp.build()); g.add(pv); return { pv, sd };
  });
  g.userData.setOpen = k => leaves.forEach(({ pv, sd }) => { pv.rotation.y = -sd * k * 1.45; });   // ينفتحان نحو الداخل (شمالاً) فلا يحجبان الممر
  return g;
}
/* ── بوابة شمال-جنوب (السوق، الميناء): سور بطول العالم الشمالي، برجان، وعارضة خشبية تُرفع ── */
function gateNS(X) {
  const g = new THREE.Group(), P = new Parts();
  stoneWall(P, X + 6, 0, X + 6, 556, 56, 12); stoneWall(P, X + 6, 722, X + 6, 1700, 56, 12);
  [[X - 8, 556, 28, 40], [X - 8, 690, 28, 32]].forEach(([x, z, w, d]) => { P.add(STONE(), box(w, 80, d, x + w / 2, 40, z + d / 2, 1.5)); for (let k = 0; k < 2; k++) P.add(WALLTOP(), merlon(x + 7 + k * 14, 80, z + d - 3)); });
  g.add(P.build());
  const bar = new THREE.Group(); bar.position.set(X + 6, 30, 600);
  const bm = new Parts(); bm.add(material('wood', '#8A5A30'), box(8, 8, 86, 0, 0, 43), { scale: 1 / 40 }); [12, 42, 72].forEach(z => bm.add(flat('#D9A23A', .4), box(9, 9, 4, 0, 0, z)));
  bar.add(bm.build()); g.add(bar);
  g.userData.setOpen = k => { bar.rotation.x = -k * 1.35; };
  return g;
}

/* ── كشك محطة الدرس: جدار خلفي، سقف خشبي، مظلة مخططة، رفوف بضاعة، منضدة ولافتة ── */
function kiosk(s) {
  const P = new Parts(), x0 = s.x - 52, z0 = s.y - 56, w = 104, d = 24, H = 96, col = s.col, zf = z0 + d;
  const wall = material('plaster', new THREE.Color(col).lerp(new THREE.Color('#F4EAD8'), .7).getStyle());
  P.add(wall, box(w, H, 6, s.x, H / 2, z0 + 3)); [-1, 1].forEach(sd => P.add(wall, box(6, H, d, s.x + sd * (w / 2 - 3), H / 2, z0 + d / 2)));
  P.add(material('wood', '#9C6438'), box(w + 12, 5, d + 14, s.x, H + 2.5, z0 + d / 2 + 4));
  for (let k = 0; k < 6; k++) P.add(k % 2 ? flat('#F4E3B8', .7) : flat(col, .6), box((w + 12) / 6, 2.4, 22, 0, 0, 0).rotateX(.42).translate(x0 - 6 + (k + .5) * (w + 12) / 6, H - 10, zf + 8));   // المظلة المخططة
  const G = s.goods || ['#C46A1E', '#4E7A34', '#E3B04B'];
  [34, 54].forEach((y, r) => { P.add(material('wood', '#7A4A2A'), box(w - 14, 2.4, 10, s.x, y, z0 + 11)); for (let k = 0; k < 8; k++) P.add(flat(G[(k + r) % G.length], .6), sphere(4, x0 + 14 + k * 11, y + 4.5, z0 + 11, 8, 6)); });
  P.add(material('wood', '#9C6438'), box(w + 4, 5, 14, s.x, 30, zf + 5)); P.add(flat(col, .7), box(w, 26, 12, s.x, 14, zf + 5));
  for (let k = 0; k < 6; k++) P.add(flat('#FFFFFF', .7), box(2, 22, .6, x0 + 12 + k * 16, 14, zf + 11.3));
  const g = P.build(); const sg = signMesh(s.sign, 17); sg.position.set(s.x, H - 22, zf + 8); g.add(sg);
  return g;
}

/* ── القلعة: أسوار طين بشُرَف، أبراج ركنية دائرية، بوابة كبرى بمصراعين، وبرج رئيسي (الصرح) بعلم ── */
function castle(K, H0) {
  const P = new Parts(), H = Math.round(H0 * SCALE_H), T = 20, wm = adobe('#C9A77C'), top = material('plaster', '#D8C49C'), x0 = K.x, z0 = K.y, w = K.w, d = K.h;
  P.add(wm, box(w, H, T, x0 + w / 2, H / 2, z0 + d - T / 2)); P.add(wm, box(w, H, T, x0 + w / 2, H / 2, z0 + T / 2));
  P.add(wm, box(T, H, d, x0 + T / 2, H / 2, z0 + d / 2)); P.add(wm, box(T, H, d, x0 + w - T / 2, H / 2, z0 + d / 2));
  P.add(material('sand', '#fff'), box(w - 2 * T, 2, d - 2 * T, x0 + w / 2, 1, z0 + d / 2));
  for (let i = 0; i < Math.round(w / 16); i++) { const x = x0 + (i + .5) * w / Math.round(w / 16); P.add(top, merlon(x, H, z0 + d - T / 2)); P.add(top, merlon(x, H, z0 + T / 2)); }
  for (let i = 0; i < Math.round(d / 16); i++) { const z = z0 + (i + .5) * d / Math.round(d / 16); P.add(top, merlon(x0 + T / 2, H, z, Math.PI / 2)); P.add(top, merlon(x0 + w - T / 2, H, z, Math.PI / 2)); }
  for (let x = x0 + 60; x < x0 + w - 40; x += 60) if (Math.abs(x - (x0 + w / 2)) > 70) P.add(flat('#2A2420', 1), box(4, 14, 1, x, H * .6, z0 + d + .3));   // مزاغل
  [[x0, z0], [x0 + w, z0], [x0, z0 + d], [x0 + w, z0 + d]].forEach(([tx, tz]) => {   // الأبراج الدائرية بطراز نزوى
    const r = 34, th = H + 40; P.add(wm, cyl(r * .9, r, th, tx, th / 2, tz, 24)); P.add(top, cyl(r * .96, r * .96, 6, tx, th + 3, tz, 24));
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; P.add(top, merlon(tx + Math.cos(a) * r * .88, th + 6, tz + Math.sin(a) * r * .88, -a + Math.PI / 2)); }
    [.45, .7].forEach(k => P.add(flat('#2A2420', 1), box(4, 12, 1, tx, th * k, tz + r * .95)));
  });
  const gx = x0 + w / 2, zf = z0 + d, gw = 70, gh = 92;   // البوابة الكبرى
  const sur = archShape(gw + 26, gh + 14); sur.holes.push(archPath(gw, gh)); P.add(material('stone', '#B9A27C'), extrude(sur, 6, gx, 0, zf));
  P.add(material('wood', '#6E4524'), extrude(archShape(gw, gh), 3, gx, 0, zf - 1), { scale: 1 / 60 });
  for (let r = 0; r < 6; r++) for (let k = -2; k <= 2; k++) P.add(flat('#C99A3A', .35, .85), sphere(1.8, gx + k * 12, 12 + r * 12, zf + 2.6, 6, 4));
  const kx = x0 + w * .62, kz = z0 + d * .42, kw = 120, kd = 100, kh = H + 74;   // الصرح
  P.add(wm, box(kw, kh, kd, kx, kh / 2, kz, 2));
  for (let i = 0; i < 8; i++) { const x = kx - kw / 2 + (i + .5) * kw / 8; P.add(top, merlon(x, kh, kz + kd / 2 - 2)); P.add(top, merlon(x, kh, kz - kd / 2 + 2)); }
  [kh * .55, kh * .78].forEach(y => [-30, 0, 30].forEach(dx => P.add(flat('#2A2420', 1), extrude(archShape(10, 18), .6, kx + dx, y, kz + kd / 2))));
  P.add(material('metal', '#9AA5B1', { rough: .5, metal: .6 }), cyl(1.4, 1.4, 60, kx, kh + 30, kz, 6));
  const g = P.build();
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(36, 22), (() => { const c = document.createElement('canvas'); c.width = 72; c.height = 44; const x = c.getContext('2d'); x.fillStyle = '#C8102E'; x.fillRect(0, 0, 72, 44); x.fillStyle = '#FFFFFF'; x.fillRect(22, 0, 50, 15); x.fillStyle = '#009639'; x.fillRect(22, 29, 50, 15); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: .7 }); })());   // علم عُمان
  flag.position.set(kx + 18, kh + 48, kz); g.add(flag); g.userData.tick = t => { flag.rotation.y = Math.sin(t * 2) * .25; };
  return g;
}

/* ── برج الساعة: جسم حجري، ساعات على أربعة أوجه بعقارب تتحرك، شرفة بشُرَف، وسقف هرمي ── */
function clockTower(T) {
  const P = new Parts(), s = T.s, H = Math.round(T.H * SCALE_H * .85), x = T.x, z = T.y - s / 2, wm = material('stone', '#D2B47E'), top = material('plaster', '#E6D3B0');
  P.add(wm, box(s, H, s, x, H / 2, z, 2)); P.add(top, box(s + 10, 6, s + 10, x, H * .35, z)); P.add(top, box(s + 12, 6, s + 12, x, H, z));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; [[-1], [0], [1]].forEach(([k]) => P.add(top, merlon(x + Math.cos(a) * (s / 2 + 3) - Math.sin(a) * k * 18, H + 3, z + Math.sin(a) * (s / 2 + 3) + Math.cos(a) * k * 18, -a + Math.PI / 2, .9))); }
  P.add(material('plaster', '#B8613E'), new THREE.ConeGeometry(s * .72, 50, 4).rotateY(Math.PI / 4).translate(x, H + 34, z));
  P.add(flat('#E3B04B', .3, .9), sphere(4, x, H + 62, z));
  const door = archShape(26, 44); P.add(material('wood', '#6E4524'), extrude(door, 1, x, 0, z + s / 2));
  const g = P.build(), hands = [];
  const face = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const k = c.getContext('2d'); k.fillStyle = '#FFFDF6'; k.beginPath(); k.arc(64, 64, 60, 0, 7); k.fill(); k.lineWidth = 6; k.strokeStyle = '#2A1B66'; k.stroke(); k.fillStyle = '#2A1B66'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; k.fillRect(64 + Math.cos(a) * 50 - 3, 64 + Math.sin(a) * 50 - 3, 6, 6); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: .5, transparent: true }); })();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2, cf = new THREE.Group(); cf.position.set(x + Math.sin(a) * (s / 2 + .6), H - 34, z + Math.cos(a) * (s / 2 + .6)); cf.rotation.y = a;
    const f = new THREE.Mesh(new THREE.CircleGeometry(20, 32), face); cf.add(f);
    const hr = new THREE.Mesh(new THREE.BoxGeometry(2.4, 11, .8), flat('#2A1B66')); hr.geometry.translate(0, 5, .6); const mn = new THREE.Mesh(new THREE.BoxGeometry(1.6, 16, .8), flat('#C0392B')); mn.geometry.translate(0, 7.5, 1);
    cf.add(hr, mn); hands.push([hr, mn]); g.add(cf);
  }
  g.userData.tick = t => hands.forEach(([h, m]) => { h.rotation.z = -t / 24; m.rotation.z = -t / 2; });
  return g;
}

/* ── منارة الميناء: برج أسطواني مخطط أحمر وأبيض، شرفة، ومصباح يدور شعاعه ── */
function lighthouse(L) {
  const g = new THREE.Group(), H = Math.round(L.H * SCALE_H), cx = L.x + L.s / 2, cz = L.y + L.s / 2;
  const stripes = (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 128; const x = c.getContext('2d'); for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#C0392B' : '#F7F3EA'; x.fillRect(0, i * 128 / 6, 16, 128 / 6); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: .6 }); })();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(13, 19, H, 24), stripes); body.position.set(cx, H / 2, cz); body.castShadow = true; g.add(body);
  const P = new Parts(); P.add(flat('#3D3A3A', .5, .5), cyl(20, 20, 4, cx, H + 2, cz, 20)); P.add(flat('#3D3A3A', .5, .5), cyl(.8, .8, 10, cx + 19, H + 9, cz, 4));
  P.add(flat('#C0392B', .5), new THREE.ConeGeometry(15, 18, 20).translate(cx, H + 32, cz));
  g.add(P.build());
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 16, 16), new THREE.MeshStandardMaterial({ color: '#FFF1B8', emissive: '#FFC94A', emissiveIntensity: 1.6 })); lamp.position.set(cx, H + 15, cz); g.add(lamp);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(30, 260, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#FFF0B0', transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide }));
  beam.geometry.translate(0, -130, 0); beam.geometry.rotateZ(Math.PI / 2); const piv = new THREE.Group(); piv.position.set(cx, H + 15, cz); piv.add(beam); g.add(piv);
  g.userData.tick = t => { piv.rotation.y = t * .8; };
  return g;
}

/* مدخنة المطبخ بدخان، وساعات مركز الاتصالات على الواجهة */
function chimney(b, H) {
  const g = new THREE.Group(), cx = b.x + b.w - 50, cz = b.y + 30, P = new Parts();
  P.add(material('stone', '#B5A58A'), box(18, 40, 18, cx, H + 20, cz)); g.add(P.build());
  const puffs = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: .5, depthWrite: false })); g.add(m); puffs.push(m); }
  g.userData.tick = t => puffs.forEach((m, i) => { const k = (t * .35 + i / 5) % 1; m.position.set(cx + k * 16 + Math.sin(t + i) * 3, H + 44 + k * 70, cz); m.scale.setScalar(5 + k * 12); m.material.opacity = .55 * (1 - k); });
  return g;
}

export function buildRegions({ quality }) {
  const group = new THREE.Group(), fades = [], ticks = [], gates = [];
  const palmList = [], shrubList = [], P = new Parts();
  ORDER.forEach((R, ri) => {
    (R.buildings || []).forEach(b => { const o = omaniHouse(b); group.add(o); fades.push(fader(o, b, (b.H || 90) * SCALE_H)); if (b.chimney) { const c = chimney(b, (b.H || 90) * SCALE_H + 9); group.add(c); ticks.push(c.userData.tick); } });
    (R.palms || []).forEach(p => palmList.push(p));
    (R.shrubs || []).forEach(([x, y, f, r]) => shrubList.push({ x, y, f, r: r || 12 }));
    (R.benches || []).forEach(([x, y]) => bench(P, x, y));
    (R.wells || []).forEach(([x, y, r]) => group.add(well(x, y, r, true)));
    (R.kiosks || []).forEach(s => group.add(kiosk(s)));
    if (R.castle) { const c = castle(R.castle, R.castleH); group.add(c); ticks.push(c.userData.tick); fades.push(fader(c, R.castle, R.castleH * SCALE_H + 80)); }
    if (R.clockTower) { const c = clockTower(R.clockTower); group.add(c); ticks.push(c.userData.tick); }
    if (R.lighthouse) { const c = lighthouse(R.lighthouse); group.add(c); ticks.push(c.userData.tick); }
    const gt = R.gateEW ? gateEW(R.gateEW) : R.gateNS !== undefined ? gateNS(R.gateNS) : null;
    if (gt) { group.add(gt); gates[ri] = gt; }
  });
  group.add(palms(palmList)); group.add(shrubs(shrubList)); group.add(P.build());
  return {
    group,
    update(t, pl, open) {
      ticks.forEach(f => f(t)); if (pl) fades.forEach(f => f(pl));
      if (open) gates.forEach((g, i) => g && g.userData.setOpen(+open[i] || 0));
    }
  };
}
