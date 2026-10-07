// الأحياء الحديثة داخل عالم اللعب (مواضعها من ثوابت اللعبة نفسها، وعوائقها في ملفات المناطق):
// حيّ العمارات (world/coop.js)، مدينة الألعاب (world/festival.js)، وميناء الحاويات (world/caravan.js).
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl } from './geom.js';
import { material } from './textures.js';
import { signMesh } from './omani.js';
import { fader } from './world.js';
import { BLOCKS, CARS } from '../world/coop.js';
import { FUNPARK, RIDES } from '../world/festival.js';
import { PORT, STACKS, CRANE } from '../world/caravan.js';

const R0 = seed => (a => () => (a = (a * 9301 + 49297) % 233280) / 233280)(seed);
const cache = new Map();
const flat = (c, r = .6, m = 0) => material('flat', c, { rough: r, metal: m });

/* ── واجهة عمارة: نوافذ بإطارات وزجاج يعكس السماء، بعضها مضاء أو بستارة، وطابق أرضي بمحلات ── */
function facade(wall, floors, cols, seed) {
  const key = 'fa' + wall + floors + cols + seed; if (cache.has(key)) return cache.get(key);
  const fw = 64, fh = 64, c = document.createElement('canvas'); c.width = cols * fw; c.height = floors * fh; const x = c.getContext('2d'), R = R0(seed);
  x.fillStyle = wall; x.fillRect(0, 0, c.width, c.height);
  for (let j = 0; j < floors; j++) for (let i = 0; i < cols; i++) {
    const px = i * fw, py = j * fh;
    x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(px, py + fh - 5, fw, 5);
    if (j === floors - 1) { x.fillStyle = '#2E3A42'; x.fillRect(px + 5, py + 18, fw - 10, fh - 18); x.fillStyle = 'rgba(255,230,170,.55)'; x.fillRect(px + 8, py + 22, fw - 16, 18); x.fillStyle = ['#C0392B', '#2F6FB2', '#2E8B57', '#E3B04B'][(i + seed) % 4]; x.fillRect(px + 2, py + 6, fw - 4, 12); continue; }
    const lit = R() < .2, wx = px + 13, wy = py + 11, ww = fw - 26, wh = fh - 24;
    x.fillStyle = '#D9D2C4'; x.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
    const g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, lit ? '#FFE6A8' : '#9CC3DA'); g.addColorStop(1, lit ? '#F2C46E' : '#3E5A6B');
    x.fillStyle = g; x.fillRect(wx, wy, ww, wh); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(wx + 2, wy + 2, 5, wh - 4);
    x.fillStyle = '#C9C2B4'; x.fillRect(wx + ww / 2 - 1, wy, 2, wh);
    if (R() < .3) { x.fillStyle = 'rgba(240,230,210,.92)'; x.fillRect(wx, wy, ww * .45, wh); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: .8 }); cache.set(key, m); return m;
}

/* ── العمارة: كتلة بواجهات، شرفات بدرابزين، مكيّفات، سطح بخزانات وغرفة درج، ومدخل بمظلة ولافتة ── */
function apartment(b, i) {
  const g = new THREE.Group(), FH = 22, H = b.f * FH, x = b.x + b.w / 2, z = b.y + b.h / 2, w = b.w, d = b.h;
  const cols = Math.max(2, Math.round(w / 34)), colsD = Math.max(2, Math.round(d / 34));
  const fF = facade(b.wall, b.f, cols, i * 7 + 1), fS = facade(b.wall, b.f, colsD, i * 7 + 2), roof = flat(new THREE.Color(b.wall).offsetHSL(0, 0, -.1).getStyle(), .9);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), [fS, fS, roof, roof, fF, fF]); body.position.set(x, H / 2, z); body.castShadow = body.receiveShadow = true; g.add(body);
  const P = new Parts(), slab = flat('#EEE8DC', .8), rail = flat('#5E6874', .5, .6), ac = flat('#F2F2EE'), trim = flat(new THREE.Color(b.wall).offsetHSL(0, 0, -.06).getStyle(), .8);
  for (let f = 1; f < b.f; f++) {
    const y = f * FH;
    for (let k = 0; k < cols; k += 2) { const bx = b.x + (k + .5) * w / cols; P.add(slab, box(w / cols * .92, 2.2, 8, bx, y, b.y + d + 4)); P.add(rail, box(w / cols * .92, 7, .8, bx, y + 4.6, b.y + d + 7.8)); }
    if (f % 2) P.add(ac, box(9, 6, 6, b.x + w - 8, y + 6, b.y + d + 3));
    if (f % 3 === 0) P.add(trim, box(w + 1.5, 2, d + 1.5, x, y - 1, z));
  }
  P.add(trim, box(w + 4, 6, d + 4, x, H + 3, z));
  const R = R0(i + 3); for (let k = 0; k < 3; k++) P.add(flat('#F4F6F7', .4), cyl(7, 7, 13, b.x + 18 + R() * (w - 36), H + 12, b.y + 16 + R() * (d - 32), 14));
  P.add(flat('#D9DEE2'), box(26, 14, 18, x + w / 4, H + 7, z - d / 4));
  P.add(flat('#E85D75', .6), box(46, 2, 14, x, 26, b.y + d + 7)); P.add(rail, box(1.2, 24, 1.2, x - 21, 13, b.y + d + 13)); P.add(rail, box(1.2, 24, 1.2, x + 21, 13, b.y + d + 13));   // مظلة المدخل
  g.add(P.build());
  const s = signMesh('عمارة ' + ['النخيل', 'الوادي', 'الريم', 'السلام', 'الأمل', 'الخير'][i % 6], 16); s.position.set(x, 34, b.y + d + 1); g.add(s);
  return g;
}
/* سيارة: جسم بزوايا ناعمة، زجاج، عجلات، ومصابيح */
function car(x, z, col, P) {
  P.add(flat(col, .35, .3), box(46, 12, 22, x, 9, z, 3)); P.add(flat(col, .35, .3), box(26, 9, 20, x - 2, 19, z, 3));
  P.add(flat('#2C3E50', .15, .2), box(27, 7, 20.6, x - 2, 19.5, z));
  [[-14, -11], [14, -11], [-14, 11], [14, 11]].forEach(([a, c]) => P.add(flat('#1E1E1E', .8), cyl(4.4, 4.4, 3, 0, 0, 0, 12).rotateX(Math.PI / 2).translate(x + a, 4.4, z + c)));
  P.add(flat('#FFF4D6', .3), box(1, 3, 5, x + 23, 10, z - 6)); P.add(flat('#FFF4D6', .3), box(1, 3, 5, x + 23, 10, z + 6));
}
export function residential() {
  const g = new THREE.Group(), fades = []; BLOCKS.forEach((b, i) => { const a = apartment(b, i); g.add(a); fades.push(fader(a, b, b.f * 22)); });   // العمارة التي يقف البطل خلفها تصير شفافة
  g.userData.fade = pl => fades.forEach(f => f(pl));
  const P = new Parts(); CARS.forEach(([x, y, col]) => car(x, y - 2, col, P));
  const pole = flat('#3D4250', .5, .7);
  [[1990, 3810], [2240, 3810], [2520, 3810], [2780, 3810], [2110, 3940], [2400, 3940], [2680, 3940]].forEach(([x, y]) => { P.add(pole, cyl(1.5, 2, 70, x, 35, y, 8)); P.add(pole, box(18, 1.6, 1.6, x + 8, 70, y)); P.add(flat('#FFE3A0', .3), box(10, 3, 5, x + 16, 68, y)); });   // أعمدة إنارة الشارع
  g.add(P.build());
  return g;
}

/* ── مدينة الألعاب ── */
export function funpark() {
  const F = FUNPARK, Rd = RIDES, g = new THREE.Group(), P = new Parts(), anim = [];
  const white = flat('#F4F2EC', .5), red = flat('#E2475C', .5), blue = flat('#2F6FB2', .5), yel = flat('#FFC23D', .5), green = flat('#5DBB63', .5), steel = flat('#C9D3DA', .35, .6), gold = flat('#E3B04B', .3, .9);
  // السياج: قوائم ملونة وحاجزان، والمدخل غرباً بقوس ولافتة
  const fence = (x1, z1, x2, z2) => { const n = Math.round(Math.hypot(x2 - x1, z2 - z1) / 24); for (let k = 0; k <= n; k++) { const t = k / n; P.add([red, yel, blue][k % 3], box(4, 22, 4, x1 + (x2 - x1) * t, 11, z1 + (z2 - z1) * t)); } const len = Math.hypot(x2 - x1, z2 - z1), a = Math.atan2(z2 - z1, x2 - x1); [8, 18].forEach(h => P.add(white, box(len, 2.2, 2.2, 0, 0, 0).rotateY(-a).translate((x1 + x2) / 2, h, (z1 + z2) / 2))); };
  fence(F.x, F.y, F.x + F.w, F.y); fence(F.x + F.w, F.y, F.x + F.w, F.y + F.h); fence(F.x, F.y + F.h, F.x + F.w, F.y + F.h); fence(F.x, F.y, F.x, F.gate[0]); fence(F.x, F.gate[1], F.x, F.y + F.h);
  [F.gate[0], F.gate[1]].forEach(z => { P.add(red, box(10, 80, 10, F.x, 40, z)); P.add(yel, cyl(8, 8, 8, F.x, 84, z, 12)); });
  P.add(blue, box(10, 10, F.gate[1] - F.gate[0] + 10, F.x, 82, (F.gate[0] + F.gate[1]) / 2));
  const sign = signMesh('🎡 مدينة الألعاب', 20); sign.position.set(F.x - 6, 98, (F.gate[0] + F.gate[1]) / 2); sign.rotation.y = -Math.PI / 2; g.add(sign);
  // دولاب الهواء: قاعدتان مائلتان، إطاران، أشعة، وعربات تبقى معتدلة
  const W = Rd.wheel, WY = W.r + 36, wheel = new THREE.Group();
  [-16, 16].forEach(dz => { P.add(steel, box(8, WY + 16, 8, 0, 0, 0).rotateZ(.34).translate(W.x - 36, WY / 2, W.y + dz)); P.add(steel, box(8, WY + 16, 8, 0, 0, 0).rotateZ(-.34).translate(W.x + 36, WY / 2, W.y + dz)); });
  P.add(steel, box(110, 8, 40, W.x, 4, W.y));
  [-11, 11].forEach(dz => { const r = new THREE.Mesh(new THREE.TorusGeometry(W.r, 2.6, 8, 72), steel); r.position.z = dz; wheel.add(r); });
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, sp = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, W.r, 6), steel); sp.position.set(Math.cos(a) * W.r / 2, Math.sin(a) * W.r / 2, 0); sp.rotation.z = a - Math.PI / 2; wheel.add(sp); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 30, 16), gold); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  const gondolas = [];
  for (let i = 0; i < 12; i++) { const gd = new THREE.Group(), cab = new THREE.Mesh(new THREE.CylinderGeometry(10, 9, 15, 12), [red, blue, yel, green][i % 4]); cab.position.y = -13; const top = new THREE.Mesh(new THREE.ConeGeometry(11, 7, 12), white); top.position.y = -3; const win = new THREE.Mesh(new THREE.CylinderGeometry(10.2, 9.2, 5, 12, 1, true), flat('#9CC3DA', .2)); win.position.y = -11; gd.add(cab, top, win); wheel.add(gd); gondolas.push(gd); }
  wheel.position.set(W.x, WY, W.y); wheel.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(wheel);
  anim.push(t => { wheel.rotation.z = t * .14; gondolas.forEach((gd, i) => { const a = i / 12 * Math.PI * 2; gd.position.set(Math.cos(a) * W.r, Math.sin(a) * W.r, 0); gd.rotation.z = -t * .14; }); });
  // دوّامة الخيل
  const C = Rd.carousel, car = new THREE.Group();
  const stripe = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 16; const x = c.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : '#E2475C'; x.fillRect(i * 16, 0, 16, 16); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: .55 }); })();
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(C.r + 8, 36, 20), stripe); canopy.position.y = 86; const flag = new THREE.Mesh(new THREE.ConeGeometry(3, 14, 6), yel); flag.position.y = 112;
  const valance = new THREE.Mesh(new THREE.CylinderGeometry(C.r + 8, C.r + 8, 8, 20, 1, true), stripe); valance.position.y = 64;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(C.r, C.r + 3, 9, 28), flat('#F2E6C9', .6)); base.position.y = 4.5;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 64, 12), gold); pole.position.y = 36; car.add(canopy, flag, valance, base, pole);
  const horses = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, h = new THREE.Group(), col = [white, yel, blue, red, green][i % 5];
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 58, 6), gold); rod.position.y = 32;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(5.5, 14, 4, 10), col); body.rotation.z = Math.PI / 2; body.position.y = 28;
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(3, 8, 4, 8), col); neck.position.set(9, 34, 0); neck.rotation.z = -.6;
    const head = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 6, 4, 8), col); head.position.set(13, 38, 0); head.rotation.z = -1.4;
    const legs = [-6, 6].map(dx => { const l = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 10, 6), col); l.position.set(dx, 20, 0); return l; });
    h.add(rod, body, neck, head, ...legs); h.position.set(Math.cos(a) * (C.r - 14), 9, Math.sin(a) * (C.r - 14)); h.rotation.y = -a - Math.PI / 2; car.add(h); horses.push(h); }
  car.position.set(C.x, 0, C.y); car.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(car);
  anim.push(t => { car.rotation.y = t * .55; horses.forEach((h, i) => { h.position.y = 9 + Math.sin(t * 3 + i * 1.3) * 5; }); });
  // برج الزحليقة: برج بسقف هرمي، سلّم، ومنزلق
  const S = Rd.slide;
  P.add(blue, box(44, 64, 44, S.x, 32, S.y - 6)); P.add(yel, box(52, 6, 52, S.x, 66, S.y - 6)); P.add(red, new THREE.ConeGeometry(38, 32, 4).rotateY(Math.PI / 4).translate(S.x, 86, S.y - 6));
  for (let k = 0; k < 7; k++) P.add(steel, box(22, 2, 3, S.x - 34, 8 + k * 9, S.y + 18 - k * 3));
  const slide = new THREE.Mesh(new THREE.BoxGeometry(70, 3, 18), yel); slide.position.set(S.x + 48, 34, S.y); slide.rotation.z = -.62; slide.castShadow = true; g.add(slide);
  [-1, 1].forEach(sd => { const rl = new THREE.Mesh(new THREE.BoxGeometry(70, 6, 2), red); rl.position.set(S.x + 48, 38, S.y + sd * 9); rl.rotation.z = -.62; g.add(rl); });
  // الأراجيح
  const Q = Rd.swings;
  [-65, 65].forEach(dx => [-12, 12].forEach(dz => P.add(red, box(5, 66, 5, 0, 0, 0).rotateZ(dx < 0 ? .16 : -.16).translate(Q.x + dx, 32, Q.y + dz))));
  P.add(red, box(140, 5, 5, Q.x, 64, Q.y));
  const seats = [-42, -14, 14, 42].map((dx, i) => { const s = new THREE.Group(); [-5, 5].forEach(dz => { const ch = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 46, 4), steel); ch.position.set(0, -23, dz); s.add(ch); }); const seat = new THREE.Mesh(new THREE.BoxGeometry(13, 2.4, 13), [yel, blue, green, red][i]); seat.position.y = -46; seat.castShadow = true; s.add(seat); s.position.set(Q.x + dx, 62, Q.y); g.add(s); return s; });
  anim.push(t => seats.forEach((s, i) => { s.rotation.x = Math.sin(t * 1.8 + i * 1.3) * .45; }));
  // كشك التذاكر
  const K = Rd.kiosk; P.add(white, box(44, 34, 24, K.x, 17, K.y - 8)); P.add(red, box(52, 4, 32, K.x, 37, K.y - 8)); P.add(flat('#9CC3DA', .2), box(26, 12, 1, K.x, 22, K.y + 4.2));
  // أعمدة إنارة
  [[F.x + 60, F.y + 60], [F.x + F.w - 60, F.y + F.h - 60], [F.x + 60, F.y + F.h - 60], [F.x + F.w - 60, F.y + 380]].forEach(([x, z]) => { P.add(flat('#3D4250', .5, .7), cyl(1.5, 2, 70, x, 35, z, 8)); P.add(flat('#FFE3A0', .3), cyl(6, 4, 8, x, 72, z, 8)); });
  g.add(P.build());
  g.userData.tick = t => anim.forEach(f => f(t));
  return g;
}

/* ── ميناء الحاويات ── */
function containerMat(col) {
  const key = 'cont' + col; if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = 128; c.height = 32; const x = c.getContext('2d');
  x.fillStyle = col; x.fillRect(0, 0, 128, 32);
  for (let i = 0; i < 128; i += 5) { x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(i, 0, 1.5, 32); x.fillStyle = 'rgba(255,255,255,.14)'; x.fillRect(i + 2, 0, 1, 32); }
  x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, 0, 128, 2); x.fillRect(0, 30, 128, 2); x.fillRect(0, 0, 3, 32); x.fillRect(125, 0, 3, 32);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: .55, metalness: .3 }); cache.set(key, m); return m;
}
const CCOLS = ['#C0392B', '#2F6FB2', '#2E8B57', '#E3B04B', '#7B3F98', '#16A085'];
export function port() {
  const g = new THREE.Group(), CH = 26, geo = new THREE.BoxGeometry(150, CH, 35), by = new Map();
  STACKS.forEach(([x, y, n, col], i) => { const cols = [col, CCOLS[(i + 2) % 6]];
    for (let s = 0; s < n; s++) for (let k = 0; k < 2; k++) { const c = cols[(s + k) % 2]; if (!by.has(c)) by.set(c, []); by.get(c).push(new THREE.Matrix4().makeTranslation(x + 75, CH / 2 + s * CH, y + 18 + k * 37)); } });
  const stacks = new THREE.Group(); g.add(stacks);
  by.forEach((ms, col) => { const im = new THREE.InstancedMesh(geo, containerMat(col), ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = im.receiveShadow = true; stacks.add(im); });
  const fs = fader(stacks, { x: PORT.x, y: PORT.y, w: 400, h: PORT.h }, 110); g.userData.fade = pl => fs(pl);
  // الرافعة الجسرية: أربعة قوائم صفراء، عارضتان، ذراع ممتد فوق الماء، كابينة، وحاوية معلّقة
  const P = new Parts(), yel = flat('#E3A21A', .5, .4), C = CRANE, top = 230;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => P.add(yel, box(10, top, 10, C.x + a * 70, top / 2, C.y + b * C.span / 2)));
  [-1, 1].forEach(b => P.add(yel, box(160, 12, 12, C.x, top, C.y + b * C.span / 2)));
  [-1, 1].forEach(b => P.add(yel, box(360, 12, 12, C.x + 110, top + 14, C.y + b * 30)));
  P.add(flat('#F4F2EC', .5), box(34, 22, 26, C.x + 40, top - 8, C.y)); P.add(flat('#2C3E50', .2), box(1, 10, 20, C.x + 57.5, top - 6, C.y));
  P.add(flat('#3D3A3A', .6), cyl(.8, .8, 120, C.x + 200, top - 50, C.y, 6)); P.add(containerMat('#C0392B'), box(150, CH, 35, C.x + 200, top - 115, C.y), { uv: false });
  // السفينة الراسية
  const sx = 3060, sz = C.y;
  P.add(flat('#1F3A5A', .5), box(170, 44, 760, sx, 14, sz)); P.add(flat('#9E2B25', .6), box(172, 10, 762, sx, -6, sz));
  P.add(flat('#F4F2EC', .5), box(130, 76, 80, sx, 74, sz + 300)); P.add(flat('#2C3E50', .2), box(132, 10, 60, sx, 92, sz + 300));
  [[PORT.x + 20, PORT.y + 20], [PORT.x + 20, PORT.y + PORT.h - 20]].forEach(([x, z]) => { P.add(flat('#5E6874', .5, .6), cyl(2.5, 3, 150, x, 75, z, 8)); P.add(flat('#FFF4D6', .3), box(26, 8, 10, x, 150, z)); });
  g.add(P.build());
  for (let i = 0; i < 6; i++) for (let s = 0; s < 2; s++) { const m = new THREE.Mesh(new THREE.BoxGeometry(150, CH, 90), containerMat(CCOLS[(i + s) % 6])); m.position.set(sx, 36 + CH / 2 + s * CH, sz - 300 + i * 100); m.castShadow = true; g.add(m); }
  return g;
}
