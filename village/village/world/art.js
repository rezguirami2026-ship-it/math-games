// اللغة البصرية المشتركة للعالم: لوحة الألوان، اتجاه الشمس، المواد، والمكوّنات المعمارية.
// كل عنصر في العالم يُرسم بهذه الأدوات حتى يبدو أنه من لعبة واحدة: ضوء من أعلى اليسار، ظل نحو الأسفل يميناً، خط محيطي دافئ.
import { shade, mix, rr, rng } from '../core/util.js';
import { INK } from '../character/human.js';
export { INK };

export const PAL = {
  sand: '#E3CB9C', sandLight: '#EFDCB4', sandDark: '#CDB07D', dust: '#D8BE8C',
  plaster: '#EEE2CB', plasterWarm: '#E9D3B0', plasterRose: '#EBD8C6', stone: '#BFA884', stoneDark: '#9C8664',
  wood: '#7A4A2A', woodLight: '#9C6438', teal: '#2F6B73', navy: '#2A3F5F', terracotta: '#B8613E',
  asphalt: '#4A4D57', curb: '#D6CDBF', paver: '#D9C9A6', metal: '#9AA5B1', glass: '#7FB2C8',
  leaf: '#4E7A34', leafLight: '#79A84A', leafDark: '#355A25', water: '#3E9CC9', waterLight: '#9ED8F0'
};
/* الشمس: من أعلى اليسار. الظل لكل وحدة ارتفاع ينزاح يميناً وأسفل */
export const SUN = { dx: .5, dy: .3, color: 'rgba(70,42,20,.24)', soft: 'rgba(70,42,20,.10)' };

/* ── الأنسجة: بلاطة صغيرة مولّدة مرة واحدة بدقة مضاعفة، وتُكرَّر كنمط (النمط محفوظ لكل لوحة رسم) ── */
const tiles = new Map(), ctxPatterns = new WeakMap();
function tile(key, size, paint) {
  if (tiles.has(key)) return tiles.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size * 2;
  const x = c.getContext('2d'); x.scale(2, 2); paint(x, size);
  tiles.set(key, c); return c;
}
export function pattern(ctx, key) {
  let m = ctxPatterns.get(ctx); if (!m) ctxPatterns.set(ctx, m = new Map());
  if (m.has(key)) return m.get(key);
  const p = ctx.createPattern(tile(key, ...TILES[key]), 'repeat');
  if (p.setTransform) p.setTransform(new DOMMatrix().scale(.5));
  m.set(key, p); return p;
}

/* ── ذاكرة الصور (Sprite cache): ما هو ثابت يُرسم مرة واحدة بدقة الشاشة الحالية ثم يُنسخ في كل إطار ──
   (bx, by, bw, bh) مستطيل الصورة بإحداثيات العالم، وpaint يرسم بإحداثيات العالم نفسها. maxScale يحدّ الذاكرة. */
const sprites = new Map();
export function sprite(ctx, key, bx, by, bw, bh, paint, maxScale = 3) {
  const m = ctx.getTransform(), s = Math.max(1, Math.min(maxScale, Math.floor(Math.hypot(m.a, m.b) * 2) / 2));
  const k = key + '@' + s;
  let c = sprites.get(k);
  if (c) { sprites.delete(k); sprites.set(k, c); }   // الأحدث استعمالاً في آخر القائمة
  else {
    c = document.createElement('canvas'); c.width = Math.ceil(bw * s); c.height = Math.ceil(bh * s);
    const x = c.getContext('2d'); x.scale(s, s); x.translate(-bx, -by); paint(x);
    sprites.set(k, c);
    while (sprites.size > 140) sprites.delete(sprites.keys().next().value);   // حدّ للذاكرة على الأجهزة الضعيفة
  }
  ctx.drawImage(c, bx, by, bw, bh);
}
const speckle = (x, s, n, cols, rmin, rmax, seed) => { const R = rng(seed); for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(R() * cols.length)]; x.globalAlpha = .35 + R() * .45; x.beginPath(); x.ellipse(R() * s, R() * s, rmin + R() * (rmax - rmin), (rmin + R() * (rmax - rmin)) * .7, R() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; };
const TILES = {
  sand: [192, (x, s) => { x.fillStyle = PAL.sand; x.fillRect(0, 0, s, s); speckle(x, s, 160, [PAL.sandLight, PAL.sandDark, '#D6BC8A', '#F2E2C0'], .5, 1.6, 3); speckle(x, s, 6, ['#C9A979'], 1.6, 3, 9); }],
  asphalt: [128, (x, s) => { x.fillStyle = PAL.asphalt; x.fillRect(0, 0, s, s); speckle(x, s, 240, ['#5A5D68', '#3E414A', '#626672'], .3, .9, 5); }],
  pavers: [32, (x, s) => {   // بلاط متداخل للأرصفة والساحات
    x.fillStyle = shade(PAL.paver, -26); x.fillRect(0, 0, s, s);
    const b = (px, py, w, h, k) => { x.fillStyle = shade(PAL.paver, k); rr(x, px + .6, py + .6, w - 1.2, h - 1.2, 1.2); x.fill(); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(px + 1, py + 1, w - 2, 1); };
    b(0, 0, 16, 8, 4); b(16, 0, 16, 8, -2); b(8, 8, 16, 8, 0); b(-8, 8, 16, 8, 6); b(24, 8, 16, 8, 6); b(0, 16, 16, 8, -3); b(16, 16, 16, 8, 3); b(8, 24, 16, 8, -1); b(-8, 24, 16, 8, 2); b(24, 24, 16, 8, 2);
  }],
  plaster: [96, (x, s) => { x.clearRect(0, 0, s, s); speckle(x, s, 70, ['rgba(120,90,50,.18)', 'rgba(255,255,255,.35)'], .6, 2.2, 11); }],
  soil: [64, (x, s) => { x.fillStyle = '#9C6B42'; x.fillRect(0, 0, s, s); speckle(x, s, 90, ['#8A5B36', '#B07C4E', '#7A4F2E'], .4, 1.3, 13); }],
  soilWet: [64, (x, s) => { x.fillStyle = '#6E4A2E'; x.fillRect(0, 0, s, s); speckle(x, s, 90, ['#5E3E26', '#83593A', '#4F3420'], .4, 1.3, 17); }]
};

/* ── الظلال الملقاة ── */
export function boxShadow(ctx, x, y, w, d, H) {   // ظل صندوق أرضيته (x,y,w,d) وارتفاعه H
  const dx = SUN.dx * H, dy = SUN.dy * H;
  const poly = k => { ctx.beginPath(); ctx.moveTo(x + w, y + 2); ctx.lineTo(x + w + dx * k, y + dy * k); ctx.lineTo(x + w + dx * k, y + d + dy * k); ctx.lineTo(x + dx * k, y + d + dy * k); ctx.lineTo(x, y + d); ctx.closePath(); ctx.fill(); };
  ctx.fillStyle = SUN.soft; poly(1.12); ctx.fillStyle = SUN.color; poly(1);
  ctx.fillStyle = 'rgba(60,35,15,.22)'; ctx.fillRect(x - 2, y + d - 1, w + 4, 4);   // ظل التلامس (Ambient Occlusion) عند القاعدة
}
export function blobShadow(ctx, x, y, r, H) {   // ظل جسم مستدير (شجرة، عمود)
  ctx.fillStyle = SUN.soft; ctx.beginPath(); ctx.ellipse(x + SUN.dx * H * .55, y + SUN.dy * H * .4, r * 1.25, r * .5, .35, 0, 7); ctx.fill();
  ctx.fillStyle = SUN.color; ctx.beginPath(); ctx.ellipse(x + SUN.dx * H * .45, y + SUN.dy * H * .32, r, r * .38, .35, 0, 7); ctx.fill();
}

/* ── المبنى: صندوق بجدار أمامي بارتفاع حقيقي وسطح بحاجز (منظور ثلاثة أرباع) ──
   b = { x, y, w, h (عمق الأرضية), H (ارتفاع الجدار), wall, door, roof?, style, sign?, ac?, tank?, dish?, faded? } */
export function building(ctx, b, t) {
  const { x, w, H } = b, yb = b.y + b.h, yt = yb - H, ry = b.y - H;   // yb قاعدة الجدار الأمامي، yt أعلاه، ry أعلى السطح
  const wall = b.wall || PAL.plaster;
  if (b.faded) ctx.globalAlpha = .42;
  // السطح: أرضية مرتفعة يحيطها حاجز
  ctx.fillStyle = shade(wall, 6); ctx.fillRect(x, ry, w, b.h);
  ctx.fillStyle = shade(wall, -8); ctx.fillRect(x + 7, ry + 7, w - 14, b.h - 14);
  ctx.fillStyle = 'rgba(80,50,20,.10)'; ctx.fillRect(x + 7, ry + 7, w - 14, 5); ctx.fillRect(x + 7, ry + 7, 5, b.h - 14);   // ظل الحاجز الداخلي
  ctx.fillStyle = pattern(ctx, 'plaster'); ctx.fillRect(x, ry, w, b.h);
  roofProps(ctx, b, ry, t);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x, ry, w, b.h);
  // الجدار الأمامي: تدرج ضوء من اليسار، قاعدة حجرية، وجص بملمس
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shade(wall, 4)); g.addColorStop(1, shade(wall, -16));
  ctx.fillStyle = g; ctx.fillRect(x, yt, w, H);
  ctx.fillStyle = pattern(ctx, 'plaster'); ctx.fillRect(x, yt, w, H);
  const vg = ctx.createLinearGradient(0, yt, 0, yb); vg.addColorStop(0, 'rgba(255,240,210,.18)'); vg.addColorStop(.7, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,40,15,.16)');
  ctx.fillStyle = vg; ctx.fillRect(x, yt, w, H);
  ctx.fillStyle = shade(PAL.stone, -4); ctx.fillRect(x, yb - 9, w, 9); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, yb - 9, w, 1.4);   // القاعدة
  // الحاجز المسنّن (الشُّرَف العُمانية) على الحافة الأمامية للسطح
  crenels(ctx, x, yt, w, wall);
  // الفتحات: باب في الوسط ونوافذ على الجانبين
  const dw = b.doorW || 38, dh = b.doorH || 70, dx = x + w / 2 - dw / 2;
  const win = b.style === 'shop' ? [] : (w > 160 ? [x + 18, x + w - 18 - 26] : [x + 14, x + w - 14 - 24]);
  win.forEach((wx, i) => windowArch(ctx, wx, yt + 26, w > 160 ? 26 : 24, 32, b.style, i));
  door(ctx, dx, yb - dh, dw, dh, b.door || PAL.wood, b.style);
  if (b.ac) acUnit(ctx, x + w - 34, yt + 10);
  if (b.lamp !== false) wallLamp(ctx, x + w / 2, yb - dh - 9, t);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x, yt, w, H);
  if (b.sign) signboard(ctx, x + w / 2, yt + 14, b.sign);
  ctx.globalAlpha = 1;
}
/* كتلة حجرية (سور، برج): أرضية (x,y,w,d) بارتفاع H — سطح علوي بشُرَف، ووجه أمامي بمداميك حجر */
export function stoneBox(ctx, x, y, w, d, H, col, crenel = true) {
  const yb = y + d, yt = yb - H, ry = y - H;
  ctx.fillStyle = shade(col, 12); ctx.fillRect(x, ry, w, d);
  ctx.fillStyle = 'rgba(80,50,20,.12)'; ctx.fillRect(x + 3, ry + 3, w - 6, d - 6);
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shade(col, 2)); g.addColorStop(1, shade(col, -18));
  ctx.fillStyle = g; ctx.fillRect(x, yt, w, H);
  ctx.strokeStyle = 'rgba(80,55,30,.28)'; ctx.lineWidth = .8;   // مداميك الحجر
  for (let yy = yt + 8, r = 0; yy < yb; yy += 8, r++) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); for (let xx = x + (r % 2 ? 6 : 12); xx < x + w; xx += 14) { ctx.beginPath(); ctx.moveTo(xx, yy - 8); ctx.lineTo(xx, yy); ctx.stroke(); } }
  ctx.fillStyle = 'rgba(70,40,15,.16)'; ctx.fillRect(x, yb - 6, w, 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.strokeRect(x, ry, w, d); ctx.strokeRect(x, yt, w, H);
  if (crenel) crenels(ctx, x, yt, w, col, true);
}
function crenels(ctx, x, yt, w, wall, noSpout) {   // شُرَف مسنّنة بخطوات، مع ميزاب خشبي
  const n = Math.max(4, Math.round(w / 15)), cw = w / n;
  for (let i = 0; i < n; i++) {
    const cx = x + i * cw + cw / 2;
    ctx.fillStyle = shade(wall, 10); ctx.beginPath(); ctx.moveTo(cx - cw * .38, yt); ctx.lineTo(cx - cw * .38, yt - 5); ctx.lineTo(cx - cw * .2, yt - 5); ctx.lineTo(cx - cw * .2, yt - 9); ctx.lineTo(cx + cw * .2, yt - 9); ctx.lineTo(cx + cw * .2, yt - 5); ctx.lineTo(cx + cw * .38, yt - 5); ctx.lineTo(cx + cw * .38, yt); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
  }
  if (noSpout) return;
  ctx.fillStyle = PAL.wood; ctx.fillRect(x + w * .78, yt + 2, 4, 11); ctx.fillStyle = shade(PAL.wood, -25); ctx.fillRect(x + w * .78, yt + 11, 4, 2);   // الميزاب
  ctx.fillStyle = 'rgba(80,50,20,.12)'; ctx.fillRect(x + w * .78 + 1, yt + 13, 2, 22);
}
export function door(ctx, x, y, w, h, col, style) {   // باب خشبي مقوّس بإطار حجري ومسامير
  ctx.fillStyle = shade(PAL.stone, 8); ctx.beginPath(); ctx.moveTo(x - 4, y + h); ctx.lineTo(x - 4, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2 + 4, Math.PI, 0); ctx.lineTo(x + w + 4, y + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shade(col, 12)); g.addColorStop(1, shade(col, -20));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = shade(col, -40); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 2); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  // ألواح منقوشة ومسامير نحاسية
  ctx.strokeStyle = shade(col, -28); ctx.lineWidth = .8;
  [[x + 4, y + w / 2 + 4], [x + w / 2 + 3, y + w / 2 + 4]].forEach(([px, py]) => { ctx.strokeRect(px, py, w / 2 - 7, h * .3); ctx.strokeRect(px, py + h * .36, w / 2 - 7, h * .3); });
  ctx.fillStyle = '#E3B04B'; for (let r = 0; r < 4; r++) for (const px of [x + 3, x + w - 3]) { ctx.beginPath(); ctx.arc(px, y + w / 2 + 6 + r * h * .16, .9, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x + w / 2 - 3, y + h * .62, 1.3, 0, 7); ctx.arc(x + w / 2 + 3, y + h * .62, 1.3, 0, 7); ctx.fill();
  ctx.fillStyle = shade(PAL.stone, -10); ctx.fillRect(x - 6, y + h, w + 12, 4);   // العتبة
}
function windowArch(ctx, x, y, w, h, style, i) {   // نافذة مقوّسة بمشربية خشبية ودرفتين
  ctx.fillStyle = shade(PAL.stone, 6); ctx.beginPath(); ctx.moveTo(x - 3, y + h + 3); ctx.lineTo(x - 3, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2 + 3, Math.PI, 0); ctx.lineTo(x + w + 3, y + h + 3); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#9CC8DA'); g.addColorStop(1, '#3E6E85');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(x, y + h * .7); ctx.lineTo(x + w * .7, y); ctx.lineTo(x + w, y); ctx.lineTo(x, y + h); ctx.fill();   // انعكاس السماء
  ctx.strokeStyle = PAL.wood; ctx.lineWidth = 1.2;   // مشربية
  for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + k * w / 4, y); ctx.lineTo(x + k * w / 4, y + h); ctx.stroke(); }
  for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x, y + w / 2 + k * (h - w / 2) / 4); ctx.lineTo(x + w, y + w / 2 + k * (h - w / 2) / 4); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = shade(PAL.stone, -6); ctx.fillRect(x - 4, y + h + 1, w + 8, 4);   // عتبة النافذة
  if (i === 0 && style !== 'plain') { ctx.fillStyle = '#C2564F'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + 2 + k * (w - 4) / 4, y + h - .5, 1.8, 0, 7); ctx.fill(); } ctx.fillStyle = PAL.leaf; ctx.fillRect(x - 2, y + h + .5, w + 4, 2); }   // أصيص زهور
}
function acUnit(ctx, x, y) {   // مكيّف حديث على الجدار
  ctx.fillStyle = '#E8ECEF'; rr(ctx, x, y, 24, 15, 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  ctx.strokeStyle = '#9AA5B1'; ctx.lineWidth = .7; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + 3, y + 4 + k * 2.6); ctx.lineTo(x + 21, y + 4 + k * 2.6); ctx.stroke(); }
  ctx.fillStyle = 'rgba(70,40,15,.18)'; ctx.fillRect(x + 2, y + 15, 20, 3);
}
export function wallLamp(ctx, x, y, t) {   // فانوس جداري دافئ فوق الباب
  ctx.fillStyle = 'rgba(255,200,110,.18)'; ctx.beginPath(); ctx.arc(x, y + 2, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#3A2E26'; ctx.fillRect(x - 1, y - 6, 2, 3);
  ctx.fillStyle = '#FFD98A'; ctx.beginPath(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y - 3); ctx.lineTo(x + 2.2, y + 4); ctx.lineTo(x - 2.2, y + 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3A2E26'; ctx.lineWidth = .8; ctx.stroke();
}
export function signboard(ctx, x, y, text) {   // لافتة مثبتة على الواجهة (لا فقاعات عائمة)
  ctx.font = '900 12px Cairo, sans-serif'; const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(60,35,15,.25)'; rr(ctx, x - w / 2 + 2, y - 9 + 2, w, 19, 4); ctx.fill();
  ctx.fillStyle = PAL.teal; rr(ctx, x - w / 2, y - 9, w, 19, 4); ctx.fill(); ctx.strokeStyle = '#E3B04B'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#FFF6E2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1); ctx.textBaseline = 'alphabetic';
}
function roofProps(ctx, b, ry, t) {   // ما على السطح: خزان ماء، صحن لاقط، درج السطح
  if (b.tank) {
    const tx = b.x + b.w - 34, ty = ry + 20;
    ctx.fillStyle = 'rgba(70,42,20,.22)'; ctx.beginPath(); ctx.ellipse(tx + 9, ty + 18, 13, 5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#7A8792'; ctx.fillRect(tx - 9, ty + 6, 2, 10); ctx.fillRect(tx + 7, ty + 6, 2, 10);
    const g = ctx.createLinearGradient(tx - 10, 0, tx + 10, 0); g.addColorStop(0, '#F4F6F7'); g.addColorStop(1, '#B9C3CA');
    ctx.fillStyle = g; rr(ctx, tx - 10, ty - 10, 20, 18, 4); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
    ctx.fillStyle = '#DDE3E7'; ctx.beginPath(); ctx.ellipse(tx, ty - 10, 10, 3.4, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  if (b.dish) {
    const dx = b.x + 26, dy = ry + 26;
    ctx.fillStyle = '#C9D0D6'; ctx.beginPath(); ctx.ellipse(dx, dy, 8, 6, -.5, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
    ctx.strokeStyle = '#6E7A84'; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 6, dy - 5); ctx.stroke();
  }
  if (b.stair) {
    const sx = b.x + 22, sy = ry + b.h - 46;
    ctx.fillStyle = shade(b.wall || PAL.plaster, -14); ctx.fillRect(sx, sy + 8, 34, 18); ctx.fillStyle = shade(b.wall || PAL.plaster, 8); ctx.fillRect(sx, sy, 34, 9);
    ctx.fillStyle = shade(PAL.wood, -10); rr(ctx, sx + 12, sy + 12, 10, 14, 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.strokeRect(sx, sy, 34, 26);
  }
}

/* ── النبات ── */
/* نخلة ثابتة من الذاكرة، تتمايل بإمالة الصورة حول قاعدتها (لا إعادة رسم في كل إطار) */
export function palmCached(ctx, x, y, sc, dry, t) {
  const sway = Math.sin((t || 0) * 1.1 + x * .01) * .035, v = Math.round(Math.abs(Math.sin(x * .07)) * 3);
  ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, -sway, 1, 0, 0);
  sprite(ctx, `palm|${dry ? 1 : 0}|${sc}|${v}`, -64 * sc, -140 * sc, 128 * sc, 150 * sc, c => palm(c, 0, 0, sc, dry, 0, v));
  ctx.restore();
}
export function palm(ctx, x, y, sc, dry, t, variant) {   // نخلة: جذع بحراشف، وسعف بوريقات، وعذوق تمر
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const H = 80, sway = Math.sin((t || 0) * 1.1 + x * .01) * .04, lean = variant !== undefined ? (variant - 1.5) * 4 : Math.sin(x * .07) * 6;
  const cx = k => lean * k * k;   // انحناء الجذع
  // الجذع: مستدق ومنحنٍ، مضاء من اليسار، بحراشف ماسية
  ctx.beginPath(); for (let i = 0; i <= 10; i++) { const k = i / 10; ctx.lineTo(cx(k) - (6 - k * 2), -k * H); } for (let i = 10; i >= 0; i--) { const k = i / 10; ctx.lineTo(cx(k) + (6 - k * 2), -k * H); } ctx.closePath();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
  const g = ctx.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#B48A57'); g.addColorStop(.6, '#8C6239'); g.addColorStop(1, '#5E3F22');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(60,35,15,.45)'; ctx.lineWidth = .8;
  for (let i = 0; i < 16; i++) { const k = i / 16, yy = -k * H - 2, xx = cx(k), w = 6 - k * 2; ctx.beginPath(); ctx.moveTo(xx - w, yy); ctx.lineTo(xx, yy - 4); ctx.lineTo(xx + w, yy); ctx.stroke(); }
  ctx.restore();
  const top = [lean, -H - 1], leaves = dry ? ['#9C8148', '#BFA265', '#86703F'] : [PAL.leafDark, PAL.leaf, PAL.leafLight];
  // سعفة: جريدة منحنية ووريقات رفيعة على الجانبين تقصر نحو الطرف
  const frond = (a, len, col, droop) => {
    const ex = top[0] + Math.cos(a) * len, ey = top[1] + Math.sin(a) * len * .5 + droop, mx = top[0] + Math.cos(a) * len * .55, my = top[1] + Math.sin(a) * len * .28 - 7;
    ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 1.5; ctx.beginPath();   // كل وريقات السعفة في مسار واحد
    for (let k = 1; k <= 12; k++) {
      const u = k / 13, qx = (1 - u) * (1 - u) * top[0] + 2 * (1 - u) * u * mx + u * u * ex, qy = (1 - u) * (1 - u) * top[1] + 2 * (1 - u) * u * my + u * u * ey;
      const tx = 2 * (1 - u) * (mx - top[0]) + 2 * u * (ex - mx), ty = 2 * (1 - u) * (my - top[1]) + 2 * u * (ey - my), tl = Math.hypot(tx, ty) || 1, l = 11 * Math.sin(Math.PI * (u * .85 + .1));
      [1, -1].forEach(sd => { const nx = -ty / tl * sd, ny = tx / tl * sd; ctx.moveTo(qx, qy); ctx.lineTo(qx + (nx * .8 + tx / tl * .55) * l, qy + (ny * .8 + tx / tl * .1) * l + l * .45); });
    }
    ctx.stroke();
    ctx.strokeStyle = shade(col, -30); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
  };
  if (!dry) [-2.2, -1, 2.6].forEach(a => frond(a, 26, '#9C8148', 22));   // سعف يابس متدلٍّ تحت التاج
  const A = dry ? [-2.9, -2.3, -1.6, -.9, -.25, .35, 3.6] : [-2.95, -2.45, -1.95, -1.45, -.95, -.45, .05, .55, 3.0, 3.55, -1.7, -1.2];
  A.forEach((a, i) => frond(a + sway * (i % 2 ? 1 : -1), dry ? 30 : 38, leaves[i % 3], dry ? 18 : 9));
  if (!dry) { ['#C46A1E', '#A8561A', '#D98A2B', '#B9601C'].forEach((c, i) => { ctx.fillStyle = c; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(top[0] - 5 + i * 3.4 + (k % 2), top[1] + 5 + k * 1.8, 1.7, 0, 7); ctx.fill(); } }); }   // عذوق التمر
  ctx.restore();
}
export function shrub(ctx, x, y, r, flowers) {   // شجيرة (جهنمية) بزهور وردية أو خضراء فقط
  const R = rng(Math.round(x * 7 + y));
  ctx.fillStyle = INK; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; ctx.ellipse(x + Math.cos(a) * r * .45, y - r * .55 + Math.sin(a) * r * .3, r * .55 + .8, r * .48 + .8, 0, 0, 7); } ctx.fill();
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; ctx.fillStyle = i < 3 ? PAL.leaf : PAL.leafDark; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * .45, y - r * .55 + Math.sin(a) * r * .3, r * .55, r * .48, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = PAL.leafLight; ctx.beginPath(); ctx.ellipse(x - r * .25, y - r * .8, r * .35, r * .25, 0, 0, 7); ctx.fill();
  if (flowers) { ctx.fillStyle = flowers; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(x + (R() - .5) * r * 1.5, y - r * .55 + (R() - .6) * r, 1.3 + R(), 0, 7); ctx.fill(); } }
}
/* عمود إنارة شارع: قاعدة، عمود، وفانوس بطراز عربي */
export function streetLamp(ctx, x, y, t, lit) {
  ctx.fillStyle = '#3D3A3A'; ctx.fillRect(x - 3, y - 6, 6, 6); ctx.fillStyle = '#4B4747'; ctx.fillRect(x - 1.5, y - 62, 3, 58);
  ctx.strokeStyle = '#4B4747'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.quadraticCurveTo(x + 2, y - 70, x + 10, y - 68); ctx.stroke();
  if (lit) { ctx.fillStyle = 'rgba(255,205,120,.22)'; ctx.beginPath(); ctx.arc(x + 10, y - 60, 14, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#2E2B2B'; ctx.beginPath(); ctx.moveTo(x + 5, y - 66); ctx.lineTo(x + 15, y - 66); ctx.lineTo(x + 10, y - 71); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lit ? '#FFE3A0' : '#E8D9B0'; ctx.beginPath(); ctx.moveTo(x + 6, y - 66); ctx.lineTo(x + 14, y - 66); ctx.lineTo(x + 12.5, y - 57); ctx.lineTo(x + 7.5, y - 57); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2E2B2B'; ctx.lineWidth = .8; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 10, y - 66); ctx.lineTo(x + 10, y - 57); ctx.stroke();
}
export function bench(ctx, x, y) {   // مقعد خشبي بقوائم معدنية
  ctx.fillStyle = 'rgba(70,42,20,.2)'; ctx.fillRect(x - 18 + 4, y - 2, 36, 5);
  ctx.fillStyle = '#3D3A3A'; ctx.fillRect(x - 16, y - 10, 2.5, 10); ctx.fillRect(x + 13.5, y - 10, 2.5, 10);
  ctx.fillStyle = PAL.woodLight; rr(ctx, x - 18, y - 13, 36, 5, 1.5); ctx.fill(); ctx.fillStyle = PAL.wood; rr(ctx, x - 18, y - 22, 36, 5, 1.5); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.strokeRect(x - 18, y - 13, 36, 5); ctx.strokeRect(x - 18, y - 22, 36, 5);
  ctx.fillStyle = '#3D3A3A'; ctx.fillRect(x - 15, y - 17, 2, 5); ctx.fillRect(x + 13, y - 17, 2, 5);
}
export { shade, mix, rr };
