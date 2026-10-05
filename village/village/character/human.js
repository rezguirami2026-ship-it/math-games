// شخصية بشرية تُرسم بالكود بأسلوب 2.5D: نسب حقيقية، ضوء من أعلى اليسار، خط محيطي، وحركات (وقوف، مشي، جري، التقاط، وضع، تفاعل، احتفال)
import { shade, rr } from '../core/util.js';

export const SKINS = ['#F3CDA6', '#DDA779', '#B97F52', '#8B5A38'];
export const ACCENTS = ['#2F6FB2', '#C0392B', '#2E8B57', '#8E44AD'];
export const INK = 'rgba(43,26,32,.62)';   // الخط المحيطي المشترك لكل رسوم العالم
const HAIR = '#2A1E19';

/* h = { x, y, dir:'down'|'up'|'left'|'right', phase, moving, carry, kind:'boy'|'girl'|'man'|'woman',
         skin, robe, accent, s, bend, beard, mark, gear, pants, shoe,
         anim:'idle'|'walk'|'run'|'pickup'|'place'|'interact'|'celebrate', animT: ٠..١ } — (x, y) موضع القدمين */
export const HERO_H = 64;   // طول الطفل بوحدات العالم (البالغ أطول بـ١٢٪)
export function heightOf(h) { return HERO_H * (h.kind === 'man' || h.kind === 'woman' ? 1.12 : 1) * (h.s || 1); }

export function drawHuman(ctx, h) {
  const s = h.s || 1, dir = h.dir || 'down', side = dir === 'left' || dir === 'right', back = dir === 'up';
  const female = h.kind === 'girl' || h.kind === 'woman', adult = h.kind === 'man' || h.kind === 'woman';
  const now = performance.now(), seed = (h.x || 0) * .37 + (h.y || 0) * .11;
  const anim = h.bend ? 'pickup' : h.anim || (h.moving ? 'walk' : 'idle'), at = h.bend ? .5 : (h.animT || 0);
  const run = anim === 'run', walking = anim === 'walk' || run, ph = h.phase || 0, sw = walking ? Math.sin(ph) : 0;
  const pulse = Math.sin(at * Math.PI);                                  // ذروة الحركة القصيرة في منتصفها
  const crouch = anim === 'pickup' ? pulse * 7 : anim === 'place' ? pulse * 4.5 : 0;
  const jump = anim === 'celebrate' ? Math.abs(Math.sin(at * Math.PI * 2)) * 13 : 0;
  const bob = walking ? Math.abs(sw) * (run ? 2.6 : 1.5) : 0, breathe = walking ? 0 : Math.sin(now / 720 + seed) * .45;
  const lean = run ? .1 : anim === 'pickup' ? pulse * .12 : 0;
  const robe = h.robe || (female ? '#B5476A' : '#F4F1E8'), skin = h.skin || SKINS[1];
  const L = dir === 'left' ? 1 : -1;                                     // جهة الضوء في الإحداثيات المحلية (الرسم ينعكس عند النظر يساراً)
  const W = adult ? 1.08 : 1, Hk = adult ? 1.12 : 1;

  ctx.save(); ctx.translate(h.x, h.y); ctx.scale(dir === 'left' ? -s : s, s);
  // الظل: ظل تلامس تحت القدمين وظل ملقى نحو الأسفل يميناً، ويصغر عند القفز
  const sh = 1 - jump / 30;
  ctx.fillStyle = 'rgba(40,24,12,.13)'; ctx.beginPath(); ctx.ellipse(-L * 7, 2.5, 17 * sh, 5 * sh, -L * .25, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(40,24,12,.28)'; ctx.beginPath(); ctx.ellipse(0, 0, 11 * sh, 3.6 * sh, 0, 0, 7); ctx.fill();

  ctx.translate(0, -bob - jump + crouch * .6); ctx.rotate(dir === 'left' ? -lean : lean * (side ? 1 : 0)); ctx.scale(W, Hk);

  const top = -46 + crouch * .5, hem = -5, stride = run ? 8 : 5;
  const wT = side ? 8.5 : 10, wB = side ? 10.5 : 12.5;
  const G = h.gear || {};

  // ── الساقان والحذاء (يظهران تحت الثوب)
  const legs = side ? [[-1.5, sw * stride], [2, -sw * stride]] : [[-4, sw * stride * .45], [4, -sw * stride * .45]];
  legs.forEach(([lx, ly], i) => {
    const fx = side ? lx + ly : lx, fy = side ? -Math.max(0, Math.sin(ph + i * Math.PI)) * (run ? 3 : 1.5) * (walking ? 1 : 0) : ly * .35;
    ctx.fillStyle = h.pants || (female ? '#4E3B57' : '#E7E1D3'); rr(ctx, fx - 2.4, hem - 4 + fy, 4.8, 6, 2); ctx.fill();
    shoe(ctx, h, fx, fy, side, adult, female);
  });

  if (back && h.carry) boxes(ctx, h.carry, top + 4, side);
  if (G.shovel && !back) shovelGear(ctx);
  // ── الذراع البعيدة
  const armSw = walking ? -sw * (run ? 7 : 4.5) : 0;
  const pose = armPose(anim, pulse, at, armSw, side);
  if (side && !h.carry) arm(ctx, -2, top + 6, pose.far[0], top + pose.far[1], skin, robe, -L, true);

  // ── الثوب: جسم بأكتاف منحنية، وتظليل من جهة الظل، وطيّات
  const breath = 1 + breathe * .012;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, breath); ctx.translate(0, -top);
  ctx.beginPath();   // كتفان مستديران، خصر أضيق قليلاً، ثم اتساع نحو الذيل
  const sway = walking ? sw * (run ? 2 : 1.2) : 0;
  ctx.moveTo(-wT - 1, top + 5); ctx.bezierCurveTo(-wT - 1, top - 1, -4, top - 2.6, 0, top - 2.6); ctx.bezierCurveTo(4, top - 2.6, wT + 1, top - 1, wT + 1, top + 5);
  ctx.quadraticCurveTo(wT - .4, top + 13, wT - .2, top + 18);
  ctx.lineTo(wB + sway * .5, hem); ctx.quadraticCurveTo(sway, hem + 2.6, -wB + sway * .5, hem);
  ctx.lineTo(-wT + .2, top + 18); ctx.quadraticCurveTo(-wT + .4, top + 13, -wT - 1, top + 5); ctx.closePath();
  const g = ctx.createLinearGradient(L * wB, 0, -L * wB, 0);
  g.addColorStop(0, shade(robe, 10)); g.addColorStop(.55, robe); g.addColorStop(1, shade(robe, -34));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.strokeStyle = shade(robe, -30); ctx.globalAlpha = .55; ctx.lineWidth = .8;   // طيّات القماش
  [[-4, 0], [3.5, 1]].forEach(([fx, k]) => { ctx.beginPath(); ctx.moveTo(fx * .5, top + 14); ctx.quadraticCurveTo(fx + sway * .4, top + 26, fx * 1.3 + sway, hem - 1 - k); ctx.stroke(); });
  ctx.globalAlpha = 1;
  if (female) {   // حاشية الثوب المطرّزة
    ctx.strokeStyle = h.accent || '#E3B04B'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-wB + 1.5, hem - 3); ctx.quadraticCurveTo(sway, hem - .6, wB - 1.5 + sway * .5, hem - 3); ctx.stroke();
    if (!back) { ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(side ? 4 : 0, top + 2); ctx.lineTo(side ? 4.5 : 0, top + 16); ctx.stroke(); }
  } else if (!back) {   // الفراخة: شرّابة الدشداشة العمانية وطوق الرقبة
    const fx = side ? 4 : 0;
    ctx.strokeStyle = shade(robe, -22); ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(fx - 2.2, top - 1.4); ctx.quadraticCurveTo(fx, top + 1.6, fx + 2.2, top - 1.4); ctx.stroke();
    ctx.strokeStyle = h.accent || '#C8A15A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(fx, top + .8); ctx.lineTo(fx + .4, top + 13); ctx.stroke();
    ctx.fillStyle = h.accent || '#C8A15A'; ctx.beginPath(); ctx.ellipse(fx + .4, top + 14.6, 1.3, 2, 0, 0, 7); ctx.fill();
  }
  ctx.restore();

  // ── العتاد فوق الثوب
  if (G.bag) {
    if (back) { ctx.fillStyle = '#7A4E2C'; rr(ctx, -8.5, top + 4, 17, 21, 4); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#9B6A3C'; rr(ctx, -8.5, top + 4, 17, 7, 3); ctx.fill(); ctx.fillStyle = '#E3B04B'; ctx.fillRect(-1.5, top + 9, 3, 3); }
    else if (side) { ctx.fillStyle = '#7A4E2C'; rr(ctx, -14, top + 5, 8, 18, 3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); }
    else { ctx.strokeStyle = '#6B4325'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5.5, top + 1); ctx.lineTo(-6.5, top + 16); ctx.moveTo(5.5, top + 1); ctx.lineTo(6.5, top + 16); ctx.stroke(); }
  }
  if (G.shovel && back) shovelGear(ctx);
  if (G.flask) { ctx.strokeStyle = '#6B4A2A'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-wT + 2, top + 3); ctx.lineTo(wB - 4, top + 22); ctx.stroke(); ctx.fillStyle = '#2D7DB8'; rr(ctx, wB - 7, top + 20, 7, 10, 3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = '#BFE7FB'; ctx.fillRect(wB - 5.5, top + 22, 1.4, 5); }

  // ── الذراعان القريبتان
  if (h.carry) { arm(ctx, -wT + 1, top + 5, -6, top + 15, skin, robe, L); arm(ctx, wT - 1, top + 5, 6, top + 15, skin, robe, -L); }
  else if (side) arm(ctx, 1.5, top + 5, pose.near[0], top + pose.near[1], skin, robe, L);
  else { arm(ctx, -wT + .6, top + 5, pose.l[0], top + pose.l[1], skin, robe, L); arm(ctx, wT - .6, top + 5, pose.r[0], top + pose.r[1], skin, robe, -L); }

  // ── الرقبة والرأس
  const hx = side ? 1.6 : 0, hy = top - 9.2, R = 7.4;
  ctx.fillStyle = shade(skin, -18); rr(ctx, hx - 2.4, top - 4, 4.8, 5, 1.5); ctx.fill();
  if (female) hijab(ctx, h, hx, hy, R, side, back, L);
  else head(ctx, h, hx, hy, R, side, back, skin, L);
  if (!back) face(ctx, h, hx, hy + (female ? .8 : 0), side, skin, now, seed, anim);
  if (!female) (adult ? massar : kumma)(ctx, h, hx, hy, R, side, back);
  if (!back && h.carry) boxes(ctx, h.carry, top + 15, side);
  ctx.restore();

  if (h.mark) {   // علامة المهمة فوق الرأس: ماسة ذهبية تطفو
    const y = h.y - (heightOf(h) + 18 * s) - Math.abs(Math.sin(now / 320)) * 4;
    ctx.save(); ctx.translate(h.x, y);
    ctx.fillStyle = 'rgba(255,194,61,.28)'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFC23D'; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(9, 0); ctx.lineTo(0, 11); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8A5A00'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#3A2400'; ctx.font = '900 12px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(h.mark, 0, 1); ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }
}

/* موضع اليدين حسب الحركة: [x, y] نسبةً إلى أعلى الثوب.
   جانبياً: near اليد القريبة وfar البعيدة. أمامياً وخلفياً: l اليسرى وr اليمنى */
function armPose(anim, p, at, sw, side) {
  if (side) {
    if (anim === 'celebrate') return { near: [4, -12], far: [-3, -12] };
    if (anim === 'pickup') return { near: [8, 22 + p * 9], far: [5, 22 + p * 9] };
    if (anim === 'place') return { near: [3 + 11 * p, 17 + 4 * p], far: [8 * p, 17 + 4 * p] };
    if (anim === 'interact') return { near: [3 + 11 * p, 19 - 7 * p], far: [-2, 20] };
    return { near: [3 + sw, 20], far: [-2 - sw, 20] };
  }
  if (anim === 'celebrate') { const w = Math.sin(at * Math.PI * 4) * 2; return { l: [-9 - w, -13], r: [9 + w, -13] }; }
  if (anim === 'pickup') return { l: [-6, 23 + p * 9], r: [6, 23 + p * 9] };
  if (anim === 'place') return { l: [-6, 17 + p * 4], r: [6, 17 + p * 4] };
  if (anim === 'interact') return { l: [-11.5, 20], r: [9 + 4 * p, 18 - 8 * p] };
  return { l: [-11.5, 20 + sw * .4], r: [11.5, 20 - sw * .4] };
}
function arm(ctx, x1, y1, x2, y2, skin, robe, lit, far) {
  const mx = x1 + (x2 - x1) * .5 + (x1 >= 0 ? 1.4 : -1.4), my = y1 + (y2 - y1) * .52;   // المرفق ينثني قليلاً للخارج
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = shade(robe, far ? -30 : lit > 0 ? 4 : -16); ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.stroke();
  ctx.strokeStyle = far ? shade(skin, -16) : skin; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.fillStyle = far ? shade(skin, -16) : skin; ctx.beginPath(); ctx.arc(x2, y2, 2.2, 0, 7); ctx.fill();
}
function shoe(ctx, h, x, y, side, adult, female) {
  if (adult) { ctx.fillStyle = h.shoe || '#4A3426'; ctx.beginPath(); ctx.ellipse(x + (side ? 1.5 : 0), -1.3 + y, side ? 4.4 : 3.3, 2.2, 0, 0, 7); ctx.fill(); return; }
  // حذاء رياضي: نعل فاتح وجسم ملوّن
  ctx.fillStyle = '#F2F0EA'; ctx.beginPath(); ctx.ellipse(x + (side ? 1.8 : 0), -1 + y, side ? 5 : 3.6, 2.1, 0, 0, 7); ctx.fill();
  ctx.fillStyle = h.shoe || (female ? '#7B4F8E' : '#35587A'); ctx.beginPath(); ctx.ellipse(x + (side ? 1.4 : 0), -2.5 + y, side ? 4.2 : 3.1, 2.3, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(x + (side ? 1.8 : 0), -1.4 + y, side ? 5 : 3.6, 2.6, 0, 0, 7); ctx.stroke();
}
function head(ctx, h, hx, hy, R, side, back, skin, L) {
  // الأذنان ثم الرأس، والشعر القصير يطل تحت الكمّة
  if (!back) { ctx.fillStyle = shade(skin, -10); [side ? [-3, 1] : [-R + .4, 1], side ? null : [R - .4, 1]].forEach(e => { if (e) { ctx.beginPath(); ctx.ellipse(hx + e[0], hy + e[1], 1.9, 2.6, 0, 0, 7); ctx.fill(); } }); }
  const g = ctx.createRadialGradient(hx + L * 3, hy - 3, 1, hx, hy, R * 1.2);
  g.addColorStop(0, shade(skin, 14)); g.addColorStop(.7, skin); g.addColorStop(1, shade(skin, -22));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(hx, hy, R * (side ? .96 : 1), R * 1.05, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // الشعر: نصف الرأس العلوي (يغطيه معظمه غطاء الرأس فيظهر خط شعر طبيعي عند الصدغين)
  ctx.save(); ctx.beginPath(); ctx.ellipse(hx, hy, R * (side ? .96 : 1), R * 1.05, 0, 0, 7); ctx.clip();
  ctx.fillStyle = HAIR;
  if (back) ctx.fillRect(hx - R, hy - R * 1.1, R * 2, R * 1.75);
  else if (side) { ctx.beginPath(); ctx.moveTo(hx + 4, hy - R * 1.1); ctx.lineTo(hx + 1, hy - 2.2); ctx.quadraticCurveTo(hx - 1.5, hy + .5, hx - 2, hy + 3.5); ctx.lineTo(hx - R - 1, hy + 4); ctx.lineTo(hx - R - 1, hy - R * 1.1); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(hx - R, hy - R * 1.1); ctx.lineTo(hx - R, hy + .4); ctx.quadraticCurveTo(hx - R + 1.6, hy - 2.6, hx - 3, hy - 3.4); ctx.lineTo(hx + 3, hy - 3.4); ctx.quadraticCurveTo(hx + R - 1.6, hy - 2.6, hx + R, hy + .4); ctx.lineTo(hx + R, hy - R * 1.1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function face(ctx, h, hx, hy, side, skin, now, seed, anim) {
  const blink = ((now / 1000 + seed) % 3.9) < .12, happy = anim === 'celebrate';
  ctx.fillStyle = '#21140F'; ctx.strokeStyle = '#21140F';
  const eye = (x, y) => {
    if (blink || happy) { ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(x, y + (happy ? .8 : 0), 1.4, happy ? Math.PI * 1.1 : .1, happy ? Math.PI * 1.9 : Math.PI - .1); ctx.stroke(); return; }
    ctx.beginPath(); ctx.ellipse(x, y, 1.15, 1.55, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + .4, y - .5, .45, 0, 7); ctx.fill(); ctx.fillStyle = '#21140F';
  };
  const brow = (x, y, k) => { ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(x - 1.6 * k, y); ctx.quadraticCurveTo(x, y - .9, x + 1.6 * k, y + .2); ctx.stroke(); };
  if (h.beard) {   // لحية قصيرة على الفك، تحت الفم
    ctx.fillStyle = h.beard; ctx.beginPath();
    if (side) { ctx.moveTo(hx - 2.6, hy + 1); ctx.quadraticCurveTo(hx - 1, hy + 8.4, hx + 4.6, hy + 7.4); ctx.quadraticCurveTo(hx + 7, hy + 6, hx + 6.6, hy + 4.8); ctx.lineTo(hx + 3.4, hy + 5.4); ctx.quadraticCurveTo(hx + .6, hy + 4.6, hx - .4, hy + 1); }
    else { ctx.moveTo(hx - 6.6, hy + 1); ctx.quadraticCurveTo(hx - 5.8, hy + 8.6, hx, hy + 8.8); ctx.quadraticCurveTo(hx + 5.8, hy + 8.6, hx + 6.6, hy + 1); ctx.quadraticCurveTo(hx + 5, hy + 5.6, hx + 2.6, hy + 5.6); ctx.lineTo(hx - 2.6, hy + 5.6); ctx.quadraticCurveTo(hx - 5, hy + 5.6, hx - 6.6, hy + 1); }
    ctx.fill(); ctx.fillStyle = '#21140F';
  }
  if (side) {
    eye(hx + 3.9, hy - .2); brow(hx + 3.9, hy - 3, 1);
    ctx.fillStyle = shade(skin, -14); ctx.beginPath(); ctx.moveTo(hx + 6.6, hy); ctx.lineTo(hx + 8.4, hy + 2.2); ctx.lineTo(hx + 6.6, hy + 2.6); ctx.fill();
    ctx.strokeStyle = '#7A4232'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(hx + 5, hy + 4.4); ctx.lineTo(hx + 6.6, hy + 4.2); ctx.stroke();
  } else {
    eye(hx - 2.8, hy); eye(hx + 2.8, hy); brow(hx - 2.8, hy - 2.8, 1); brow(hx + 2.8, hy - 2.8, -1);
    ctx.fillStyle = shade(skin, -16); ctx.beginPath(); ctx.ellipse(hx + .3, hy + 2.2, .9, .6, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7A4232'; ctx.lineWidth = .9; ctx.beginPath();
    if (happy) { ctx.fillStyle = '#7A3226'; ctx.ellipse(hx, hy + 4.2, 1.8, 1.2, 0, 0, Math.PI); ctx.fill(); } else { ctx.arc(hx, hy + 3.2, 1.7, .25 * Math.PI, .75 * Math.PI); ctx.stroke(); }
    if (!h.beard) { ctx.fillStyle = 'rgba(214,98,90,.18)'; ctx.beginPath(); ctx.arc(hx - 4.4, hy + 2.4, 1.5, 0, 7); ctx.arc(hx + 4.4, hy + 2.4, 1.5, 0, 7); ctx.fill(); }
  }
}
function kumma(ctx, h, hx, hy, R, side, back) {   // الكمّة العمانية: قبعة مستديرة مطرّزة بحافة واضحة
  const c = h.accent || '#2F6FB2';
  ctx.fillStyle = '#FBFAF6'; ctx.beginPath(); ctx.moveTo(hx - R - .6, hy - 2.4); ctx.bezierCurveTo(hx - R, hy - 11, hx + R, hy - 11, hx + R + .6, hy - 2.4); ctx.quadraticCurveTo(hx, hy - .4, hx - R - .6, hy - 2.4); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(hx + 3, hy - 5, 4, 3.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = c;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(hx + i * 2.1, hy - 3.6 + Math.abs(i) * .15, .65, 0, 7); ctx.fill(); }
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(hx + i * 2.3, hy - 6.4, .55, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(hx, hy - 8.6, .55, 0, 7); ctx.fill();
}
function massar(ctx, h, hx, hy, R, side, back) {   // المصر: العمامة العمانية الملفوفة
  const c = h.accent || '#7B3F98';
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(hx - R - 1.6, hy - 1.6); ctx.bezierCurveTo(hx - R - 1, hy - 12.5, hx + R + 1, hy - 12.5, hx + R + 1.6, hy - 1.6); ctx.quadraticCurveTo(hx, hy + .6, hx - R - 1.6, hy - 1.6); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();
  ctx.strokeStyle = shade(c, 55); ctx.lineWidth = .9;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(hx - R - .5 + i, hy - 3 - i * 2.4); ctx.quadraticCurveTo(hx, hy - 5.4 - i * 2.6, hx + R + .5 - i, hy - 3.6 - i * 2.4); ctx.stroke(); }
  if (!side && !back) { ctx.fillStyle = shade(c, 25); ctx.beginPath(); ctx.ellipse(hx + 5.5, hy - 9, 2.6, 2, .4, 0, 7); ctx.fill(); }
}
function hijab(ctx, h, hx, hy, R, side, back, L) {   // حجاب ملفوف يؤطّر الوجه وينسدل على الكتفين
  const c = h.accent || '#2F6FB2';
  const g = ctx.createLinearGradient(hx + L * 10, 0, hx - L * 10, 0); g.addColorStop(0, shade(c, 14)); g.addColorStop(1, shade(c, -26));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(hx, hy - .6, R + 2.4, R + 2.8, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - R - 2, hy + 1); ctx.quadraticCurveTo(hx - R - 4, hy + 10, hx - 11.5, hy + 14.5); ctx.quadraticCurveTo(hx, hy + 17.5, hx + 11.5, hy + 14.5); ctx.quadraticCurveTo(hx + R + 4, hy + 10, hx + R + 2, hy + 1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(hx, hy - .6, R + 2.4, R + 2.8, 0, Math.PI * .95, Math.PI * 2.05); ctx.stroke();
  if (!back) {
    ctx.fillStyle = h.skin || SKINS[1]; ctx.beginPath(); ctx.ellipse(hx + (side ? 3 : 0), hy + 1.2, side ? 4.8 : 5.9, 6.9, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = shade(c, -30); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(hx + (side ? 3 : 0), hy + 1.2, side ? 4.8 : 5.9, 6.9, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  }
}
function shovelGear(ctx) {
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(-11, -10); ctx.lineTo(10, -54); ctx.stroke();
  ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-11, -10); ctx.lineTo(10, -54); ctx.stroke();
  ctx.fillStyle = '#A9B4BF'; ctx.beginPath(); ctx.moveTo(8, -52); ctx.lineTo(16, -63); ctx.lineTo(13, -47); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
}
function boxes(ctx, n, y0, side) {   // كومة صناديق بين يدي البطل، بوجه علوي وجانبي
  for (let k = 0; k < n; k++) {
    const y = y0 - 8.4 * (k + 1), x = (side ? -3 : -6.5) + (k % 2 ? .7 : -.7);
    ctx.fillStyle = '#C98A4B'; rr(ctx, x, y, 13, 8.4, 1.5); ctx.fill();
    ctx.fillStyle = '#E2AC6C'; ctx.fillRect(x + .6, y + .5, 11.8, 2.2);
    ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.strokeRect(x, y, 13, 8.4);
    ctx.strokeStyle = '#8E5A26'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + 6.5, y + 2.6); ctx.lineTo(x + 6.5, y + 8.4); ctx.stroke();
  }
}
