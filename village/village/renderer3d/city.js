// المدينة الحديثة حول القرية (خلفية حقيقية خارج منطقة اللعب، فلا تمس المسارات):
// عمارات سكنية بواجهات ونوافذ وشرفات ومكيّفات، ميناء حاويات برافعة وسفينة، ومدينة ألعاب برافعة دوّارة ودوّامة خيل وزحاليق.
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl, sphere } from './geom.js';
import { material } from './textures.js';
import { signMesh } from './omani.js';

const R0 = seed => (a => () => (a = (a * 9301 + 49297) % 233280) / 233280)(seed);

/* ── واجهة عمارة (خامة): صفوف نوافذ بإطارات، بعضها مضاء، وألواح جدار، وطابق أرضي بمحلات ── */
const facadeCache = new Map();
function facade(wall, floors, cols, seed) {
  const key = wall + floors + cols + seed; if (facadeCache.has(key)) return facadeCache.get(key);
  const fw = 64, fh = 64, c = document.createElement('canvas'); c.width = cols * fw; c.height = floors * fh; const x = c.getContext('2d'), R = R0(seed);
  x.fillStyle = wall; x.fillRect(0, 0, c.width, c.height);
  for (let j = 0; j < floors; j++) for (let i = 0; i < cols; i++) {
    const px = i * fw, py = j * fh, ground = j === floors - 1;
    x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(px, py + fh - 5, fw, 5);                         // خط البلاطة بين الطوابق
    if (ground) { x.fillStyle = '#2E3A42'; x.fillRect(px + 6, py + 14, fw - 12, fh - 14); x.fillStyle = ['#C0392B', '#2F6FB2', '#2E8B57', '#E3B04B'][(i + seed) % 4]; x.fillRect(px + 2, py + 6, fw - 4, 10); continue; }
    const lit = R() < .18, wx = px + 14, wy = py + 12, ww = fw - 28, wh = fh - 26;
    x.fillStyle = '#D9D2C4'; x.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);                         // إطار النافذة
    const g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, lit ? '#FFE6A8' : '#7FA3B8'); g.addColorStop(1, lit ? '#F2C46E' : '#3E5A6B');
    x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(wx + 2, wy + 2, 5, wh - 4);                // لمعة الزجاج
    x.fillStyle = '#C9C2B4'; x.fillRect(wx + ww / 2 - 1, wy, 2, wh);
    if (R() < .3) { x.fillStyle = 'rgba(240,230,210,.9)'; x.fillRect(wx, wy, ww * .45, wh); }    // ستارة
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: .85 }); facadeCache.set(key, m); return m;
}

/* عمارة: كتلة بواجهات، شرفات بارزة لكل طابق، مكيّفات، خزانات وصحون على السطح، وحاجز */
function apartment(x, z, w, d, floors, wall, seed) {
  const g = new THREE.Group(), FH = 22, H = floors * FH, cols = Math.max(2, Math.round(w / 34)), colsD = Math.max(2, Math.round(d / 34));
  const fF = facade(wall, floors, cols, seed), fS = facade(wall, floors, colsD, seed + 1), roof = material('flat', new THREE.Color(wall).offsetHSL(0, 0, -.08).getStyle(), { rough: .9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), [fS, fS, roof, roof, fF, fF]); body.position.set(x, H / 2, z); body.castShadow = body.receiveShadow = true; g.add(body);
  const P = new Parts(), slab = material('flat', '#EEE8DC', { rough: .8 }), rail = material('metal', '#5E6874', { rough: .5, metal: .6 }), ac = material('flat', '#F2F2EE', { rough: .6 });
  for (let f = 1; f < floors; f++) {   // شرفات على الواجهة الأمامية (جنوباً نحو الكاميرا)
    const y = f * FH;
    for (let i = 0; i < cols; i += 2) { const bx = x - w / 2 + (i + .5) * w / cols; P.add(slab, box(w / cols * .9, 2.2, 9, bx, y, z + d / 2 + 4.5)); P.add(rail, box(w / cols * .9, 7, .8, bx, y + 4.6, z + d / 2 + 8.8)); }
    if (f % 2) P.add(ac, box(9, 6, 6, x + w / 2 - 8, y + 6, z + d / 2 + 3));
  }
  P.add(roof, box(w + 2, 5, d + 2, x, H + 2.5, z));                                              // حاجز السطح
  const R = R0(seed); for (let k = 0; k < 3; k++) { const tx = x - w / 2 + 16 + R() * (w - 32), tz = z - d / 2 + 16 + R() * (d - 32); P.add(material('flat', '#F4F6F7', { rough: .4 }), cyl(7, 7, 13, tx, H + 11, tz, 14)); }
  P.add(material('flat', '#D9DEE2', { rough: .6 }), box(22, 12, 16, x + w / 4, H + 8, z - d / 4));  // غرفة الدرج
  g.add(P.build());
  return g;
}

/* ── حيّ العمارات: صفوف بارتفاعات وألوان مختلفة، وشوارع بينها ── */
export function cityBlocks(x0, z0, x1, z1, seed = 3) {
  const g = new THREE.Group(), R = R0(seed), walls = ['#EFE9DE', '#E8DCC6', '#F2EEE6', '#E2D3BA', '#ECE3D3', '#D8CCB8'];
  for (let z = z0; z < z1; z += 210) for (let x = x0; x < x1; x += 190 + R() * 40) {
    const w = 120 + R() * 50, d = 90 + R() * 30, floors = 8 + Math.floor(R() * 8) + (z < z0 + 220 ? 4 : 0);   // الأبعد أعلى: خط سماء متدرج
    g.add(apartment(x + w / 2, z + d / 2, w, d, floors, walls[Math.floor(R() * walls.length)], Math.floor(R() * 1000)));
  }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 + 200, z1 - z0 + 200), material('flat', '#C9C3B6', { rough: 1 })); road.rotation.x = -Math.PI / 2; road.position.set((x0 + x1) / 2, .2, (z0 + z1) / 2); road.receiveShadow = true; g.add(road);
  return g;
}

/* ── ميناء الحاويات: رصيف خرساني، أكوام حاويات ملونة مضلّعة، رافعة جسرية، وسفينة حاويات راسية ── */
let ribbed = null;
function containerMat(col) {
  const key = 'cont' + col; if (facadeCache.has(key)) return facadeCache.get(key);
  const c = document.createElement('canvas'); c.width = 128; c.height = 32; const x = c.getContext('2d');
  x.fillStyle = col; x.fillRect(0, 0, 128, 32);
  for (let i = 0; i < 128; i += 5) { x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(i, 0, 1.5, 32); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(i + 2, 0, 1, 32); }
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, 128, 2); x.fillRect(0, 30, 128, 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: .6, metalness: .3 }); facadeCache.set(key, m); return m;
}
export function containerPort(x0, z0, x1, z1, seaX) {
  const g = new THREE.Group(), R = R0(9), cols = ['#C0392B', '#2F6FB2', '#2E8B57', '#E3B04B', '#7B3F98', '#D35400', '#5E6874', '#16A085'];
  const quay = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 8, z1 - z0), material('stone', '#A8A398')); quay.position.set((x0 + x1) / 2, 4, (z0 + z1) / 2); quay.receiveShadow = true; g.add(quay);
  const CW = 150, CH = 34, CD = 36, geo = new THREE.BoxGeometry(CW, CH, CD);
  const byCol = new Map(), M4 = new THREE.Matrix4();
  for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) {
    const stack = 1 + Math.floor(R() * 4), x = x0 + 120 + i * (CW + 16), z = z0 + 80 + row * (CD * 2 + 26);
    for (let s = 0; s < stack; s++) for (let k = 0; k < 2; k++) { const col = cols[Math.floor(R() * cols.length)]; if (!byCol.has(col)) byCol.set(col, []); byCol.get(col).push(new THREE.Matrix4().makeTranslation(x, 8 + CH / 2 + s * CH, z + k * (CD + 2))); }
  }
  byCol.forEach((ms, col) => { const im = new THREE.InstancedMesh(geo, containerMat(col), ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = im.receiveShadow = true; g.add(im); });
  // الرافعة الجسرية على حافة الرصيف
  const P = new Parts(), yel = material('metal', '#E3A21A', { rough: .5, metal: .4 }), cx = seaX - 60;
  [[-70, -90], [70, -90], [-70, 90], [70, 90]].forEach(([dx, dz]) => P.add(yel, box(10, 300, 10, cx + dx, 150, (z0 + z1) / 2 + dz)));
  P.add(yel, box(160, 14, 14, cx, 300, (z0 + z1) / 2 - 90)); P.add(yel, box(160, 14, 14, cx, 300, (z0 + z1) / 2 + 90));
  P.add(yel, box(14, 14, 520, cx - 40, 312, (z0 + z1) / 2 + 60)); P.add(yel, box(14, 14, 520, cx + 40, 312, (z0 + z1) / 2 + 60));
  P.add(material('flat', '#F4F2EC'), box(40, 26, 30, cx, 290, (z0 + z1) / 2 + 160));
  g.add(P.build());
  // سفينة حاويات راسية في البحر
  const S = new Parts(), hull = material('flat', '#1F3A5A', { rough: .6 }), red = material('flat', '#9E2B25', { rough: .6 }), sz = (z0 + z1) / 2 + 120;
  S.add(hull, box(170, 40, 900, seaX + 140, 18, sz)); S.add(red, box(172, 10, 902, seaX + 140, 2, sz));
  S.add(material('flat', '#F4F2EC'), box(120, 70, 80, seaX + 140, 73, sz + 380));
  for (let i = 0; i < 7; i++) for (let s = 0; s < 2; s++) S.add(containerMat(cols[(i + s) % cols.length]), box(150, CH, 90, seaX + 140, 38 + CH / 2 + s * CH, sz - 340 + i * 100), { uv: false });
  g.add(S.build());
  return g;
}

/* ── مدينة الألعاب: سياج ملون، أرضية مطاطية، دولاب هواء دوّار، دوّامة خيل بمظلة مخططة، برج زحليقة، أراجيح، وبوابة بلافتة ── */
export function amusementPark(cx, cz) {
  const g = new THREE.Group(), P = new Parts(), anim = [];
  const floor = new THREE.Mesh(new THREE.CircleGeometry(300, 40), (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const cols = ['#4FA3D9', '#F2B33D', '#E85D75', '#5DBB63']; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = cols[(i + j * 3) % 4]; x.fillRect(i * 16, j * 16, 16, 16); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: 1 }); })());
  floor.rotation.x = -Math.PI / 2; floor.position.set(cx, .5, cz); floor.receiveShadow = true; g.add(floor);
  const white = material('flat', '#F4F2EC', { rough: .5 }), red = material('flat', '#E2475C', { rough: .5 }), blue = material('flat', '#2F6FB2', { rough: .5 }), yel = material('flat', '#FFC23D', { rough: .5 }), steel = material('metal', '#C9D3DA', { rough: .4, metal: .6 });
  // السياج
  for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2; if (Math.abs(a - Math.PI * .25) < .12) continue; P.add([red, yel, blue][k % 3], box(4, 20, 4, cx + Math.cos(a) * 300, 10, cz + Math.sin(a) * 300)); }
  // دولاب الهواء
  const wheel = new THREE.Group(), WX = cx - 60, WZ = cz - 80, WR = 130, WY = WR + 40;
  [-14, 14].forEach(dz => { P.add(steel, box(8, WY + 10, 8, 0, 0, 0).rotateZ(.32).translate(WX - 34, WY / 2, WZ + dz)); P.add(steel, box(8, WY + 10, 8, 0, 0, 0).rotateZ(-.32).translate(WX + 34, WY / 2, WZ + dz)); });
  const rimM = new THREE.Mesh(new THREE.TorusGeometry(WR, 3, 8, 64), steel), rim2 = rimM.clone(); rimM.position.z = -10; rim2.position.z = 10; wheel.add(rimM, rim2);
  for (let i = 0; i < 16; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, WR, 6), steel); sp.position.set(Math.cos(i / 16 * Math.PI * 2) * WR / 2, Math.sin(i / 16 * Math.PI * 2) * WR / 2, 0); sp.rotation.z = i / 16 * Math.PI * 2 - Math.PI / 2; wheel.add(sp); }
  const gondolas = [];
  for (let i = 0; i < 12; i++) { const gd = new THREE.Group(); const cab = new THREE.Mesh(new THREE.CylinderGeometry(9, 8, 14, 10), [red, blue, yel, material('flat', '#5DBB63')][i % 4]); cab.position.y = -12; const top = new THREE.Mesh(new THREE.ConeGeometry(10, 6, 10), white); top.position.y = -3; gd.add(cab, top); gd.children.forEach(o => o.castShadow = true); wheel.add(gd); gondolas.push(gd); }
  wheel.position.set(WX, WY, WZ); g.add(wheel);
  anim.push(t => { wheel.rotation.z = t * .12; gondolas.forEach((gd, i) => { const ang = i / 12 * Math.PI * 2; gd.position.set(Math.cos(ang) * WR, Math.sin(ang) * WR, 0); gd.rotation.z = -t * .12; }); });
  // دوّامة الخيل
  const car = new THREE.Group(), KX = cx + 110, KZ = cz + 40;
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(70, 34, 16), (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 16; const x = c.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : '#E2475C'; x.fillRect(i * 16, 0, 16, 16); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: .6 }); })());
  canopy.position.y = 78; car.add(canopy);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(66, 68, 8, 24), material('flat', '#F2E6C9', { rough: .6 })); base.position.y = 4; car.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 70, 10), material('metal', '#E3B04B', { rough: .3, metal: .9 })); pole.position.y = 40; car.add(pole);
  const horses = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, h = new THREE.Group(); const rod = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 60, 6), material('metal', '#E3B04B', { metal: .9, rough: .3 })); rod.position.y = 30; const body = new THREE.Mesh(new THREE.CapsuleGeometry(5, 14, 4, 8), [white, yel, blue, red][i % 4]); body.rotation.z = Math.PI / 2; body.position.y = 26; const head = new THREE.Mesh(new THREE.CapsuleGeometry(3, 7, 4, 8), [white, yel, blue, red][i % 4]); head.position.set(10, 32, 0); head.rotation.z = -.5; h.add(rod, body, head); h.position.set(Math.cos(a) * 48, 4, Math.sin(a) * 48); h.rotation.y = -a; h.children.forEach(o => o.castShadow = true); car.add(h); horses.push(h); }
  car.position.set(KX, 0, KZ); car.children.forEach(o => o.castShadow = true); g.add(car);
  anim.push(t => { car.rotation.y = t * .5; horses.forEach((h, i) => { h.children[1].position.y = 26 + Math.sin(t * 3 + i) * 5; h.children[2].position.y = 32 + Math.sin(t * 3 + i) * 5; }); });
  // برج الزحليقة
  const SX = cx - 150, SZ = cz + 120;
  P.add(blue, box(40, 60, 40, SX, 30, SZ)); P.add(yel, box(46, 6, 46, SX, 63, SZ)); P.add(red, new THREE.ConeGeometry(34, 30, 4).rotateY(Math.PI / 4).translate(SX, 81, SZ));
  const slide = new THREE.Mesh(new THREE.BoxGeometry(18, 3, 90), yel); slide.position.set(SX + 52, 32, SZ); slide.rotation.z = 0; slide.rotation.y = Math.PI / 2; slide.rotation.x = -.62; slide.castShadow = true; g.add(slide);
  // الأراجيح
  const QX = cx + 60, QZ = cz + 170;
  [-60, 60].forEach(dx => { P.add(red, box(5, 60, 5, 0, 0, 0).rotateZ(dx < 0 ? .2 : -.2).translate(QX + dx * .9, 30, QZ - 14)); P.add(red, box(5, 60, 5, 0, 0, 0).rotateZ(dx < 0 ? .2 : -.2).translate(QX + dx * .9, 30, QZ + 14)); });
  P.add(red, box(130, 5, 5, QX, 60, QZ));
  const seats = [-36, -12, 12, 36].map((dx, i) => { const s = new THREE.Group(); const ch1 = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 44, 4), steel); ch1.position.set(0, -22, -5); const ch2 = ch1.clone(); ch2.position.z = 5; const seat = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 12), [yel, blue][i % 2]); seat.position.y = -44; s.add(ch1, ch2, seat); s.position.set(QX + dx, 58, QZ); g.add(s); return s; });
  anim.push(t => seats.forEach((s, i) => { s.rotation.x = Math.sin(t * 1.8 + i * 1.3) * .45; }));
  // البوابة بلافتة
  const GX = cx + Math.cos(Math.PI * .25) * 300, GZ = cz + Math.sin(Math.PI * .25) * 300;
  P.add(red, box(10, 70, 10, GX - 36, 35, GZ - 36)); P.add(red, box(10, 70, 10, GX + 36, 35, GZ + 36));
  g.add(P.build());
  const sign = signMesh('🎡 مدينة الألعاب', 22); sign.position.set(GX, 82, GZ); sign.rotation.y = -Math.PI / 4; g.add(sign);
  g.userData.tick = t => anim.forEach(f => f(t));
  return g;
}
