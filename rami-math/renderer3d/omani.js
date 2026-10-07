// العمارة العُمانية بالكود: جدران جص طيني على قاعدة حجرية، حاجز سطح بشُرَف مسنّنة، أبواب خشبية مقوّسة بمسامير نحاسية،
// نوافذ مقوّسة بمشربيات ومصاريع، مزاريب خشبية، فتحات تهوية مثلثة، أبراج ركنية، مسجد بقبة ومئذنة.
// الإحداثيات: نقطة اللعبة (x, y) هي (x, ارتفاع, y) في المشهد؛ الواجهة الأمامية نحو +z (جنوباً، نحو الكاميرا).
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl, sphere, archShape, archPath, extrude, merlon, taper } from './geom.js';
import { material, bandTexture, latticeTexture, adobe, rugMaterial, thatchMaterial } from './textures.js';

export const SCALE_H = 1.38;   // المباني في الرسم ثنائي الأبعاد منخفضة؛ في المجسّم نرفعها لتناسب طول الشخصيات

const M = {
  stone: () => material('stone', '#C9B48E'),
  stoneDark: () => material('stone', '#A8926C'),
  wood: c => material('wood', c || '#7A4A2A'),
  brass: () => material('metal', '#C99A3A', { rough: .35, metal: .85 }),
  dark: () => material('flat', '#2A2420', { rough: 1 }),
  glass: () => material('flat', '#33505E', { rough: .25 }),
  white: () => material('flat', '#F4F2EC', { rough: .55 }),
  steel: () => material('metal', '#9AA5B1', { rough: .5, metal: .6 }),
  gold: () => material('metal', '#E3B04B', { rough: .3, metal: 1 })
};
let latticeMat = null, bandMats = new Map();
const lattice = () => latticeMat || (latticeMat = new THREE.MeshStandardMaterial({ map: latticeTexture(), transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }));
const band = col => { if (!bandMats.has(col)) { const t = bandTexture(col); t.wrapS = THREE.RepeatWrapping; bandMats.set(col, new THREE.MeshStandardMaterial({ map: t, roughness: .9 })); } return bandMats.get(col); };

/* لافتة مثبتة: لوح أخضر مزرق بحافة ذهبية ونص عربي (خامة canvas) */
const signCache = new Map();
export function signMesh(text, h = 16) {
  const key = text + '|' + h;
  if (!signCache.has(key)) {
    // دقة مضاعفة (خط ٨٨) حتى يبقى النص حاداً عند التقريب وعلى الشاشات الكثيفة؛ ويُعاد الرسم إذا لم يكن خط Cairo قد حُمّل بعد
    const S = 2, F = `900 ${44 * S}px Cairo, sans-serif`, c = document.createElement('canvas'), x = c.getContext('2d'); x.font = F;
    const tw = Math.ceil(x.measureText(text).width * 1.12) + 56 * S; c.width = tw; c.height = 76 * S;   // هامش ١٢٪ احتياطاً لعرض الخط
    const paint = () => { x.clearRect(0, 0, c.width, c.height); x.font = F; x.direction = 'rtl';
      x.fillStyle = '#2F6B73'; x.beginPath(); x.roundRect(3 * S, 3 * S, tw - 6 * S, 70 * S, 14 * S); x.fill(); x.lineWidth = 5 * S; x.strokeStyle = '#E3B04B'; x.stroke();
      x.fillStyle = '#FFF6E2'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, tw / 2, 41 * S); };
    paint();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
    if (document.fonts && !document.fonts.check(F, text)) document.fonts.load(F, text).then(() => { paint(); t.needsUpdate = true; }).catch(() => {});
    signCache.set(key, { mat: new THREE.MeshStandardMaterial({ map: t, roughness: .6 }), aspect: tw / (76 * S) });
  }
  const s = signCache.get(key), m = new THREE.Mesh(new THREE.BoxGeometry(h * s.aspect, h, 1.2), [M.wood(), M.wood(), M.wood(), M.wood(), s.mat, M.wood()]);
  m.castShadow = true; return m;
}

/* باب عُماني: إطار مقوّس بارز، مصراعان بألواح، مسامير نحاسية، حلقتا طرق، عتبة، وشريط زخرفي فوقه */
function door(P, cx, zf, w, h, col, frameMat) {
  const sur = archShape(w + 14, h + 9); sur.holes.push(archPath(w, h));
  P.add(frameMat, extrude(sur, 4, cx, 0, zf));
  P.add(M.dark(), extrude(archShape(w + 1, h + .5), .6, cx, 0, zf - .2));
  const half = w / 2 - .6, lh = h;   // المصراعان: نصف القوس لكلٍّ منهما
  [-1, 1].forEach(sd => {
    const s = new THREE.Shape(), r = w / 2, sh = h - r * 1.18;
    if (sd < 0) { s.moveTo(-r + .5, 0); s.lineTo(-r + .5, sh); s.quadraticCurveTo(-r + .5, sh + r * 1.05, -.5, h - 1); s.lineTo(-.5, 0); }
    else { s.moveTo(.5, 0); s.lineTo(.5, h - 1); s.quadraticCurveTo(r - .5, sh + r * 1.05, r - .5, sh); s.lineTo(r - .5, 0); }
    s.closePath(); P.add(M.wood(col), extrude(s, 2.2, cx, 0, zf + .4), { scale: 1 / 60 });
    for (let row = 0; row < 6; row++) for (let k = 0; k < 2; k++) {   // صفوف المسامير
      const yy = 9 + row * (lh * .78 / 6), xx = cx + sd * (half * (.3 + k * .45));
      if (yy < sh + 4) P.add(M.brass(), sphere(1.15, xx, yy, zf + 2.9, 6, 4));
    }
    P.add(M.brass(), new THREE.TorusGeometry(2.2, .45, 5, 10).translate(cx + sd * 3.5, h * .5, zf + 3));
  });
  P.add(M.stone(), box(w + 22, 3, 7, cx, 1.5, zf + 3.5));   // العتبة
  P.add(band('#E9D9B8'), box(w + 18, 7, 1, cx, h + 15, zf + .6), { uv: false });
}
/* نافذة مقوّسة: إطار بارز، زجاج داكن، مشربية، عتبة، ومصراعان خشبيان مفتوحان */
function windowArch(P, cx, y0, zf, w, h, frameMat, shutter) {
  const sur = archShape(w + 8, h + 6); sur.holes.push(archPath(w, h));
  P.add(frameMat, extrude(sur, 3, cx, y0, zf));
  P.add(M.glass(), extrude(archShape(w, h), .5, cx, y0, zf));
  P.add(lattice(), extrude(archShape(w - 1, h - 1), .4, cx, y0, zf + 1.2), { scale: 1 / 26 });
  P.add(M.stone(), box(w + 12, 2.6, 5, cx, y0 - 1, zf + 2.5));
  if (shutter) [-1, 1].forEach(sd => P.add(M.wood(shutter), box(w / 2, h * .72, 1.4, cx + sd * (w * .78), y0 + h * .38, zf + 1.6)));
}
/* حاجز السطح بشُرَف مسنّنة على الحواف الأربع، ومزاريب خشبية بارزة من الأمام */
function parapet(P, x0, z0, w, d, H, mat, spout = true) {
  const t = 4.5, ph = 9;
  P.add(mat, box(w, ph, t, x0 + w / 2, H + ph / 2, z0 + d - t / 2));
  P.add(mat, box(w, ph, t, x0 + w / 2, H + ph / 2, z0 + t / 2));
  P.add(mat, box(t, ph, d - 2 * t, x0 + t / 2, H + ph / 2, z0 + d / 2));
  P.add(mat, box(t, ph, d - 2 * t, x0 + w - t / 2, H + ph / 2, z0 + d / 2));
  const n = Math.max(3, Math.round(w / 15)), nd = Math.max(2, Math.round(d / 15));
  for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * w / n; P.add(mat, merlon(x, H + ph, z0 + d - t / 2)); P.add(mat, merlon(x, H + ph, z0 + t / 2)); }
  for (let i = 1; i < nd - 1; i++) { const z = z0 + (i + .5) * d / nd; P.add(mat, merlon(x0 + t / 2, H + ph, z, Math.PI / 2)); P.add(mat, merlon(x0 + w - t / 2, H + ph, z, Math.PI / 2)); }
  if (spout) [.22, .78].forEach(k => P.add(M.wood('#6B4520'), box(3.2, 3.2, 13, x0 + w * k, H + 2, z0 + d + 5)));
}
/* رؤوس الجسور الخشبية (الدعون) بارزة من الجدار تحت السطح: صف على الواجهة والجانبين */
function beamEnds(P, x0, z0, w, d, y, k) {
  const bw = material('wood', '#6E4524'), n = Math.max(4, Math.round(w / 17)), nd = Math.max(3, Math.round(d / 17));
  for (let i = 0; i < n; i++) P.add(bw, cyl(1.7, 1.7, 7, 0, 0, 0, 7).rotateX(Math.PI / 2).translate(x0 + (i + .5) * w / n, y, z0 + d - k + 3));
  for (let i = 0; i < nd; i++) { const z = z0 + (i + .5) * d / nd; P.add(bw, cyl(1.7, 1.7, 7, 0, 0, 0, 7).rotateZ(Math.PI / 2).translate(x0 + k - 3, y, z)); P.add(bw, cyl(1.7, 1.7, 7, 0, 0, 0, 7).rotateZ(Math.PI / 2).translate(x0 + w - k + 3, y, z)); }
}
/* نافذة عُمانية مستطيلة: عتب خشبي بارز، إطار جص، شبك حديدي بقضبان، ومصراعان خشبيان */
function windowRect(P, cx, y0, zf, w, h, frameM, shutter) {
  P.add(frameM, box(w + 8, h + 8, 2.4, cx, y0 + h / 2, zf + 1.2));
  P.add(M.glass(), box(w, h, .8, cx, y0 + h / 2, zf + 2.2));
  const iron = material('metal', '#2E2A26', { rough: .6, metal: .5 });
  for (let i = 1; i < 4; i++) P.add(iron, box(.9, h, .9, cx - w / 2 + i * w / 4, y0 + h / 2, zf + 3));
  P.add(iron, box(w, .9, .9, cx, y0 + h * .55, zf + 3));
  P.add(M.wood('#5E3A1E'), box(w + 16, 4.2, 5, cx, y0 + h + 6, zf + 2.6));   // العتب الخشبي
  P.add(M.stone(), box(w + 10, 2.4, 5, cx, y0 - 1.6, zf + 2.4));
  if (shutter) [-1, 1].forEach(sd => P.add(M.wood(shutter), box(w / 2, h, 1.2, cx + sd * (w * .76), y0 + h / 2, zf + 2.4)));
}
/* غرفة علوية على السطح (تنوّع في هيئة البيوت) */
function upperRoom(P, x0, z0, w, d, H, wallM, trimM, key) {
  const rw = Math.min(w * .42, 78), rd = Math.min(d * .5, 60), rx = key % 2 ? x0 + 10 : x0 + w - 10 - rw, rz = z0 + 8, rh = 42;
  P.add(wallM, taper(box(rw, rh, rd, rx + rw / 2, H + rh / 2, rz + rd / 2, 2), rx + rw / 2, rz + rd / 2, H, rh, .03));
  parapet(P, rx, rz, rw, rd, H + rh, wallM, false);
  windowArch(P, rx + rw / 2, H + 12, rz + rd, 16, 22, trimM, '#2F6B73');
  beamEnds(P, rx, rz, rw, rd, H + rh - 5, 0);
}
/* جرّة فخارية (خرس/جحلة) */
function jar(P, x, y, z, s = 1, col = '#B5653A') {
  const g = new THREE.LatheGeometry([[0, 0], [3.2, .3], [5.4, 4], [5.8, 7.5], [4.4, 11], [2.2, 12.6], [2.6, 14], [0, 14]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 16);
  g.translate(x, y, z); P.add(material('flat', col, { rough: .85 }), g, { uv: false });
}
/* أصيص بنبتة خضراء */
function pot(P, x, z, s = 1) {
  const g = new THREE.LatheGeometry([[0, 0], [3.6, 0], [4.4, 7], [5, 8], [0, 8]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 14); g.translate(x, 0, z);
  P.add(material('flat', '#A8552F', { rough: .9 }), g, { uv: false });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, b = new THREE.IcosahedronGeometry(3.2 * s, 1); b.translate(x + Math.cos(a) * 2.6 * s, 10.5 * s + (i % 2) * 2, z + Math.sin(a) * 2.2 * s); P.add(material('flat', i % 2 ? '#4E7A34' : '#5E9040', { rough: .85 }), b, { uv: false }); }
}
/* فانوس جداري نحاسي بجانب الباب */
function wallLantern(P, x, y, zf) {
  const br = material('metal', '#B8862E', { rough: .35, metal: .9 });
  P.add(br, box(1.4, 1.4, 6, x, y + 8, zf + 3)); P.add(br, cyl(3.6, 1.4, 3, x, y + 9, zf + 6, 6)); P.add(br, cyl(.6, 3.2, 3, x, y - 1, zf + 6, 6));
  P.add(material('flat', '#FFE3A0', { emissive: '#FFB64A', ei: .9 }), cyl(2.8, 2.4, 7, x, y + 4, zf + 6, 6));
}
/* عريش من سعف النخيل على السطح: أربعة قوائم وسقف مائل */
function arish(P, x, z, w, d, H) {
  const wd = material('wood', '#7A5230');
  [[0, 0], [w, 0], [0, d], [w, d]].forEach(([a, c]) => P.add(wd, box(2.6, 24, 2.6, x + a, H + 12, z + c)));
  P.add(thatchMaterial(), box(w + 10, 2.4, d + 10, x + w / 2, H + 25, z + d / 2), { scale: 1 / 40 });
  P.add(wd, box(w + 6, 1.6, 2, x + w / 2, H + 24, z)); P.add(wd, box(w + 6, 1.6, 2, x + w / 2, H + 24, z + d));
}
/* فتحات تهوية مثلثة (ثلاث فتحات صغيرة) — لمسة عُمانية على الجدار */
function vents(P, cx, y, zf) { [[0, 7], [-5, 0], [5, 0]].forEach(([dx, dy]) => P.add(M.dark(), box(3, 5, 1, cx + dx, y + dy, zf + .3))); }

/* خزان ماء، مكيّف، صحن لاقط */
function roofProps(P, b, x0, z0, w, d, H) {
  if (b.tank) {
    const tx = x0 + w - 26, tz = z0 + 22;
    [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(([a, c]) => P.add(M.steel(), box(1.6, 10, 1.6, tx + a, H + 5, tz + c)));
    P.add(M.white(), cyl(10, 10, 18, tx, H + 19, tz, 18)); P.add(M.white(), cyl(4, 9.8, 3, tx, H + 29.5, tz, 18));
  }
  if (b.ac) { const ax = x0 + 26, az = z0 + 20; P.add(M.white(), box(20, 12, 13, ax, H + 6, az, 1.5)); P.add(M.dark(), cyl(4.2, 4.2, .6, 0, 0, 0, 12).rotateX(Math.PI / 2).translate(ax - 4, H + 6, az + 6.6)); }
  if (b.dish) { const dx = x0 + w / 2 + 30, dz = z0 + 18; P.add(M.steel(), box(1.4, 12, 1.4, dx, H + 6, dz)); P.add(M.white(), sphere(9, 0, 0, 0, 12, 6, Math.PI * 2, Math.PI / 2.6).rotateX(-1.1).translate(dx, H + 14, dz + 2)); }
  if (b.stair) { const sx = x0 + 18, sz = z0 + d - 34; P.add(material('plaster', b.wall), box(26, 20, 26, sx, H + 10, sz, 1.5)); P.add(M.wood('#6B4520'), box(12, 15, 1.4, sx, H + 8, sz + 13.5)); }
}

/* ── البيت العُماني ── b = { x, y, w, h, H, wall, door, mosque?, tank?, ac?, dish?, stair?, sign?, style? } */
export function omaniHouse(b, opts = {}) {
  const P = new Parts(), x0 = b.x, z0 = b.y, w = b.w, d = b.h, H = Math.round((b.H || 96) * SCALE_H), zf = z0 + d;
  const key = Math.round(x0 * 7 + z0 * 3) % 97, rectWin = !b.mosque && key % 3 === 1;   // بذرة ثابتة لكل بيت: نوع النوافذ والغرفة العلوية
  const mud = b.mud ?? (!b.mosque && b.style !== 'shop' && key % 2 === 0);   // بيوت من اللِّبن المكشوف بين البيوت المجصّصة: تباين لوني عُماني أصيل
  const wallM = mud ? adobe(['#D4B78E', '#CBAA80', '#DCC29C'][key % 3]) : material('plaster', b.wall || '#EFE3CC'), trimM = material('plaster', mud ? '#E9D6B4' : '#F6EEDD');
  P.add(M.stoneDark(), box(w + 5, 12, d + 5, x0 + w / 2, 6, z0 + d / 2, 1.5));   // قاعدة حجرية
  P.add(wallM, taper(box(w, H, d, x0 + w / 2, H / 2, z0 + d / 2, 3), x0 + w / 2, z0 + d / 2, 0, H, .025));   // الجسم: يضيق قليلاً نحو الأعلى
  P.add(trimM, box(w * .975 + 2, 3.2, d * .975 + 2, x0 + w / 2, H - 2, z0 + d / 2));                   // إفريز تحت الحاجز
  beamEnds(P, x0, z0, w, d, H - 9, w * .0125);
  P.add(material('plaster', b.wall || '#EFE3CC', { roof: 1 }), box(w - 9, 1.2, d - 9, x0 + w / 2, H + .6, z0 + d / 2));
  parapet(P, x0, z0, w, d, H, wallM);
  // الواجهة: باب في الوسط، نافذتان، وفتحات تهوية
  const shop = b.style === 'shop', mosque = b.style === 'mosque';
  const dw = shop ? 40 : (b.doorW || 34), dh = Math.round((b.doorH || 66) * 1.18);
  door(P, x0 + w / 2, zf, dw, dh, b.door || '#7A4A2A', trimM);
  if (!b.mosque) { wallLantern(P, x0 + w / 2 - dw / 2 - 13, dh - 16, zf); if (w > 150) wallLantern(P, x0 + w / 2 + dw / 2 + 13, dh - 16, zf); }
  if (!shop && !mosque) { pot(P, x0 + w / 2 - dw / 2 - 16, zf + 3.5, .8); pot(P, x0 + w / 2 + dw / 2 + 16, zf + 3.5, .8); }
  const wy = mosque ? 30 : 38, ww = mosque ? 24 : 22, wh = mosque ? 52 : 36;
  const wx = w > 160 ? [x0 + 30, x0 + w - 30] : [x0 + 24, x0 + w - 24];
  if (!shop) wx.forEach(x => rectWin ? windowRect(P, x, wy + 2, zf, 20, 28, trimM, '#7A4A2A') : windowArch(P, x, wy, zf, ww, wh, trimM, mosque ? null : '#2F6B73'));
  else [x0 + 26, x0 + w - 26].forEach(x => windowArch(P, x, 30, zf, 26, 42, trimM, null));
  vents(P, x0 + w / 2, H - 16, zf);
  if (H >= 180) {   // طابق ثانٍ: إفريز، نوافذ علوية، ومشربية بارزة فوق الباب
    const fy = Math.round(H * .5);
    P.add(trimM, box(w + 3, 5, 3, x0 + w / 2, fy, zf + 1.5));
    const n = w > 180 ? 3 : 2; for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * w / n; if (Math.abs(x - (x0 + w / 2)) > 20) windowArch(P, x, fy + 18, zf, 20, 30, trimM, '#2F6B73'); }
    const bx = x0 + w / 2, by = fy + 14;
    P.add(M.wood('#5E3A1E'), box(50, 4, 16, bx, by, zf + 8)); P.add(M.wood('#5E3A1E'), box(50, 4, 16, bx, by + 44, zf + 8));
    P.add(lattice(), box(46, 40, .6, bx, by + 22, zf + 15.5), { scale: 1 / 26 });
    [-1, 1].forEach(sd => { P.add(lattice(), box(.6, 40, 14, bx + sd * 23, by + 22, zf + 8), { scale: 1 / 26 }); P.add(M.wood('#5E3A1E'), box(3, 44, 3, bx + sd * 24, by + 22, zf + 15)); P.add(M.wood('#5E3A1E'), box(3, 8, 10, bx + sd * 18, by - 6, zf + 5)); });
  }
  if (opts.tower) {   // برج ركني دائري بشُرَف (بطراز بهلا ونزوى)
    const r = 15, tx = opts.tower === 'left' ? x0 + r : x0 + w - r, tz = zf - r, th = H + 34;
    P.add(wallM, cyl(r * .88, r, th, tx, th / 2, tz, 20)); P.add(M.stoneDark(), cyl(r + 2, r + 2.5, 12, tx, 6, tz, 20));
    P.add(trimM, cyl(r * .95, r * .95, 4, tx, th + 2, tz, 20));
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; P.add(wallM, merlon(tx + Math.cos(a) * r * .82, th + 4, tz + Math.sin(a) * r * .82, -a + Math.PI / 2, .9)); }
    [.45, .7].forEach(k => P.add(M.dark(), box(3, 9, 1, tx, th * k, tz + r * .92)));
  }
  if (!mosque && !shop && H < 180 && w >= 165 && !b.stair) upperRoom(P, x0, z0, w, d, H, wallM, trimM, key);
  roofProps(P, b, x0, z0, w, d, H);
  if (!mosque && !shop) {   // حياة السطح: عريش أو سجادة مفروشة، وجرار ماء
    if (key % 3 === 0 && !b.tank) arish(P, x0 + w - 62, z0 + d - 56, 44, 34, H);
    else { const rg = new THREE.PlaneGeometry(30, 44).rotateX(-Math.PI / 2); rg.rotateY(.25); rg.translate(x0 + w * .35, H + 1.6, z0 + d * .55); P.add(rugMaterial(['#9E2B25', '#1F4E79', '#2E6B4A'][key % 3]), rg, { uv: false }); }
    jar(P, x0 + 16, H + 1, z0 + d - 18, .9); jar(P, x0 + 27, H + 1, z0 + d - 15, .7, '#C27A48');
  }
  const g = P.build();
  if (b.sign) { const s = signMesh(b.sign, 15); s.position.set(x0 + w / 2, dh + 31, zf + 2.2); g.add(s); }
  g.userData = { H, foot: { x: x0, z: z0, w, d } };
  return g;
}

/* ── المسجد: قاعة، رواق أمامي بأقواس مدببة، قبة بيضاء على رقبة، هلال ذهبي، ومئذنة مثمّنة بشرفة ── */
export function omaniMosque(b, minaret) {
  const g = omaniHouse(Object.assign({}, b, { style: 'mosque' }));
  const P = new Parts(), x0 = b.x, z0 = b.y, w = b.w, d = b.h, H = g.userData.H, zf = z0 + d, wallM = material('plaster', '#F7F3EA');
  // محاريب زخرفية غائرة على جانبي الباب بدل رواق بارز (المسجد يبقى داخل أرضيته فلا تتغير المسارات)
  [x0 + w * .3, x0 + w * .7].forEach(cx => P.add(material('plaster', '#EDE6D6'), extrude(archShape(18, 40), 1.2, cx, 70, zf)));
  // القبة على رقبة مثمّنة
  const cx = x0 + w * .44, cz = z0 + d * .46, R = Math.min(w, d) * .3;
  P.add(wallM, cyl(R * 1.05, R * 1.1, 14, cx, H + 7, cz, 16));
  const dome = new THREE.SphereGeometry(R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2); dome.scale(1, 1.18, 1); dome.translate(cx, H + 14, cz);
  P.add(material('plaster', '#FBF8F2'), dome);
  P.add(M.gold(), cyl(.9, 1.4, 10, cx, H + 14 + R * 1.18 + 5, cz, 8)); P.add(M.gold(), sphere(2.4, cx, H + 14 + R * 1.18 + 9, cz));
  P.add(M.gold(), new THREE.TorusGeometry(3.6, .8, 6, 14, Math.PI * 1.4).rotateZ(-Math.PI * .2).translate(cx, H + 14 + R * 1.18 + 16, cz));
  // المئذنة: قاعدة مربعة حتى السطح، ساق مثمّن، شرفة بشُرَف، ساق أنحف، قمة مخروطية وهلال
  const m = minaret, mx = m.x + m.s / 2, mz = m.y + m.s / 2, top = H + Math.round(m.H * 1.25);
  P.add(wallM, box(m.s + 4, H + 16, m.s + 4, mx, (H + 16) / 2, mz, 2));
  P.add(wallM, cyl(12, 13.5, top - H - 16, mx, (top + H + 16) / 2, mz, 8));
  P.add(M.stone(), cyl(17, 13, 6, mx, top + 3, mz, 8));
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; P.add(wallM, merlon(mx + Math.cos(a) * 14.5, top + 6, mz + Math.sin(a) * 14.5, -a + Math.PI / 2, .7)); }
  P.add(wallM, cyl(8, 9, 26, mx, top + 19, mz, 8)); [0, 1, 2, 3].forEach(k => { const a = k * Math.PI / 2; P.add(M.dark(), box(2.4, 8, 1, mx + Math.cos(a) * 8.7, top + 21, mz + Math.sin(a) * 8.7).rotateY(0)); });
  const cone = new THREE.ConeGeometry(10.5, 18, 8); cone.translate(mx, top + 41, mz); P.add(material('plaster', '#F7F3EA'), cone);
  P.add(M.gold(), sphere(1.8, mx, top + 51, mz)); P.add(M.gold(), new THREE.TorusGeometry(3, .7, 6, 14, Math.PI * 1.4).rotateZ(-Math.PI * .2).translate(mx, top + 57, mz));
  g.add(P.build());
  return g;
}

/* ── المستودع: مبنى حديث بين بيوت الطين: جدار خرساني بشريط أصفر، باب لفّاف معدني، باب جانبي، نافذة مكتب، ورصيف تحميل ── */
export function warehouse(b, H0) {
  const P = new Parts(), x0 = b.x, z0 = b.y, w = b.w, d = b.h, H = Math.round(H0 * SCALE_H), zf = z0 + d;
  const conc = material('plaster', '#D3CBBB');
  P.add(conc, box(w, H, d, x0 + w / 2, H / 2, z0 + d / 2, 2));
  P.add(material('flat', '#E2B04B'), box(w + .6, 6, d + .6, x0 + w / 2, H - 14, z0 + d / 2));
  P.add(material('metal', '#A9B4BF', { rough: .55, metal: .5 }), box(w + 6, 4, d + 6, x0 + w / 2, H + 2, z0 + d / 2));
  for (let i = 0; i < 14; i++) P.add(material('metal', '#C3CCD4', { rough: .5, metal: .5 }), box(2, 1.6, d + 4, x0 + 10 + i * (w - 20) / 13, H + 4.6, z0 + d / 2));
  const dx = x0 + 150, dw = 120, dh = 96;
  P.add(M.steel(), box(dw + 10, dh + 10, 3, dx, (dh + 10) / 2, zf + 1));
  for (let i = 0; i < 18; i++) P.add(material('metal', i % 2 ? '#8E99A5' : '#A3AEB9', { rough: .5, metal: .55 }), box(dw, dh / 18, 1.5, dx, 4 + i * dh / 18 + dh / 36, zf + 2.8));
  P.add(M.dark(), box(dw, 14, 1, dx, 7, zf + 3.6));
  door(P, x0 + 44, zf, 30, 74, '#6B4520', material('plaster', '#E6DFD2'));
  P.add(M.stone(), box(52, 34, 3, x0 + w - 50, 70, zf + 1)); P.add(M.glass(), box(44, 26, 1, x0 + w - 50, 70, zf + 2.8));
  P.add(material('stone', '#9C9484'), box(w + 10, 8, 14, x0 + w / 2, 4, zf + 7));
  const g = P.build(); const s = signMesh('المستودع', 15); s.position.set(dx, H - 30, zf + 2.6); g.add(s);
  return g;
}

/* ── سور حجري بشُرَف (للبوابات بين المناطق): خط من (x1,z1) إلى (x2,z2) ── */
export function stoneWall(P, x1, z1, x2, z2, H = 70, t = 12) {
  const len = Math.hypot(x2 - x1, z2 - z1), cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, ang = Math.atan2(z2 - z1, x2 - x1);
  const g = box(len, H, t, 0, H / 2, 0); g.rotateY(-ang); g.translate(cx, 0, cz); P.add(material('stone', '#CDB58C'), g, { scale: 1 / 70 });
  const n = Math.round(len / 15);
  for (let i = 0; i < n; i++) { const k = (i + .5) / n; P.add(material('plaster', '#D8C49C'), merlon(x1 + (x2 - x1) * k, H, z1 + (z2 - z1) * k, -ang)); }
}
