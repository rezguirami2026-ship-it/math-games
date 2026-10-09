// شخصية بشرية بهيكل عظمي: ورك وركبة وكاحل، وكتف ومرفق ورسغ، تُحسب من زوايا المفاصل ثم تُسقط على منظور ثلاثة أرباع.
// الحركات: وقوف، مشي، جري، التقاط، وضع، تفاعل، احتفال، حمل. الوجه مفصّل حين تكون الشخصية كبيرة، ومبسّط حين تصغر.
import { shade, rr } from '../core/util.js';

export const SKINS = ['#F3CDA6', '#DDA779', '#B97F52', '#8B5A38'];
export const ACCENTS = ['#2F6FB2', '#C0392B', '#2E8B57', '#8E44AD'];
export const INK = 'rgba(43,26,32,.62)';   // الخط المحيطي المشترك لكل رسوم العالم
const HAIR = '#251A15';
export const HERO_H = 64;                    // طول الطفل بوحدات العالم (البالغ أطول بـ١٠٪)
export function heightOf(h) { return HERO_H * (h.kind === 'man' || h.kind === 'woman' ? 1.1 : 1) * (h.tall || 1) * (h.s || 1); }

/* أطوال العظام (وحدات العالم، الطفل) */
const B = { ankle: 2.6, shin: 13.4, thigh: 13.4, torso: 17.2, neck: 2.6, R: 5.9, RH: 6.5, upper: 10, fore: 9.2, hipW: 2.7, shW: 6.9 };

/* h = { x, y, dir, phase, moving, carry, kind, skin, robe, accent, s, bend, beard, mark, gear, pants, shoe, anim, animT,
         build (عرض الجسم)، tall (الطول)، elder (انحناء خفيف)، hat: 'straw'|'cap'، glasses، vest، apron، postbag، tool: 'hoe'|'cane' } — (x, y) موضع القدمين
   حركات إضافية لأهل القرية: wave (تلويح)، talk (كلام باليدين) */
export function drawHuman(ctx, h) {
  const s = h.s || 1, dir = h.dir || 'down', side = dir === 'left' || dir === 'right', back = dir === 'up';
  const female = h.kind === 'girl' || h.kind === 'woman', adult = h.kind === 'man' || h.kind === 'woman';
  const now = performance.now(), seed = (h.x || 0) * .37 + (h.y || 0) * .11;
  let anim = h.bend ? 'pickup' : h.anim || (h.moving ? 'walk' : 'idle');
  if (h.carry && (anim === 'idle' || anim === 'walk' || anim === 'run')) anim = h.moving ? 'carryWalk' : 'carry';
  const at = h.bend ? .5 : (h.animT || 0), p = Math.sin(at * Math.PI);
  const robe = h.robe || (female ? '#8E3B5E' : '#F4F1E8'), skin = h.skin || SKINS[1], acc = h.accent || (female ? '#2E8B57' : '#2F6FB2');
  const L = dir === 'left' ? 1 : -1;   // جهة الضوء محلياً (الرسم ينعكس عند النظر يساراً)

  /* ── ١. زوايا المفاصل حسب الحركة ── */
  const walking = anim === 'walk' || anim === 'run' || anim === 'carryWalk', run = anim === 'run';
  const ph = (h.phase || 0) * .62, A = run ? .62 : walking ? .42 : 0;
  const legs = [0, 1].map(i => {
    const q = ph + i * Math.PI;
    let a = A * Math.sin(q), b = walking ? .1 + (run ? 1.25 : .75) * Math.max(0, Math.cos(q)) : .04;
    if (anim === 'pickup') { a = .62 * p; b = 1.25 * p; }
    if (anim === 'place') { a = .35 * p; b = .7 * p; }
    if (anim === 'celebrate') { const j = Math.abs(Math.sin(at * Math.PI * 2)); a = .25 * j; b = .55 * j; }
    if (anim === 'idle') a = Math.sin(now / 1900 + seed + i) * .02;
    return { a, b, q };
  });
  const ext = l => B.thigh * Math.cos(l.a) + B.shin * Math.cos(l.a - l.b);
  const jump = anim === 'celebrate' ? Math.abs(Math.sin(at * Math.PI * 2)) * 12 : 0;
  const hipV = -(B.ankle + Math.max(ext(legs[0]), ext(legs[1]))) - jump - (anim === 'idle' ? Math.sin(now / 760 + seed) * .25 : 0);
  const lean = (run ? .16 : anim === 'pickup' ? .55 * p : anim === 'place' ? .28 * p : 0) + (h.elder ? .12 : 0);
  const arms = [0, 1].map(i => {   // i=0 الذراع المقابلة للساق 0
    const q = ph + i * Math.PI;
    let c = walking ? -(run ? .85 : .55) * Math.sin(q) : Math.sin(now / 1900 + seed + i) * .03, e = walking ? (run ? 1.45 : .22 + .25 * Math.max(0, -Math.sin(q))) : .12;
    if (anim === 'pickup') { c = .35 + .5 * p; e = .25; }
    if (anim === 'place') { c = .5 + .5 * p; e = .35 - .2 * p; }
    if (anim === 'interact' && i === 1) { c = 1.45 * p; e = .1; }
    if (anim === 'celebrate') { c = Math.PI - .42 + Math.sin(at * Math.PI * 6) * .12 * (i ? 1 : -1); e = .15; }
    if (anim === 'carry' || anim === 'carryWalk') { c = .42; e = 1.2; }
    if (anim === 'wave' && i === 1) { c = Math.PI * .8 + Math.sin(at * Math.PI * 8) * .2; e = .55; }
    if (anim === 'talk') { const k = Math.sin(at * Math.PI * 4 + i * 1.7); c = i ? .55 + .25 * k : .2 + .1 * k; e = i ? .95 + .2 * k : .5; }
    if (h.tool === 'cane' && i === 1 && !walking) { c = .28; e = .3; }
    return { c, e };
  });

  /* ── ٢. الإسقاط: نقطة الجسم (جانبي lat، أمامي fwd، رأسي v) ← نقطة الرسم ── */
  const P = (lat, fwd, v) => side ? [fwd, v + lat * .12] : back ? [-lat, v - fwd * .32] : [lat, v + fwd * .32];
  const rot = (fwd, v) => { const dv = v - hipV, cs = Math.cos(lean), sn = Math.sin(lean); return [fwd * cs + dv * sn, hipV + dv * cs - fwd * sn]; };   // ميل الجذع حول الورك
  const leg = (i, l) => {
    const lat = (i ? 1 : -1) * B.hipW * (1 + l.b * .25), kf = B.thigh * Math.sin(l.a), kv = hipV + B.thigh * Math.cos(l.a);
    const af = kf + B.shin * Math.sin(l.a - l.b), av = kv + B.shin * Math.cos(l.a - l.b);
    return { hip: P(lat * .8, 0, hipV), knee: P(lat, kf, kv), ankle: P(lat, af, av), toeUp: Math.max(0, l.b - .3) * .5, lat };
  };
  const shV = hipV - B.torso;
  const arm = (i, a) => {
    const lat = (i ? 1 : -1) * B.shW, [sf, sv] = rot(.4, shV + 1.4);
    const ef = sf + B.upper * Math.sin(a.c), ev = sv + B.upper * Math.cos(a.c), wf = ef + B.fore * Math.sin(a.c + a.e), wv = ev + B.fore * Math.cos(a.c + a.e);
    const out = side ? 0 : (anim === 'celebrate' ? 3.5 : anim === 'carry' || anim === 'carryWalk' ? -2.5 : .5);   // الذراعان قريبتان من الجسم في الوقوف
    return { sh: P(lat, sf, sv), el: P(lat + Math.sign(lat) * out * .6, ef, ev), wr: P(lat + Math.sign(lat) * out, wf, wv), lat };
  };
  const LG = legs.map((l, i) => leg(i, l)), AR = arms.map((a, i) => arm(i, a));

  ctx.save(); ctx.translate(h.x, h.y); ctx.scale(dir === 'left' ? -s : s, s);
  const ppu = Math.hypot(ctx.getTransform().a, ctx.getTransform().b);   // بكسل لكل وحدة: لتحديد مستوى التفاصيل
  const detail = B.R * ppu * (adult ? 1.1 : 1) >= 11;
  // الظل: ظل تلامس وظل ملقى نحو الأسفل يميناً، يصغران عند القفز
  const sh = 1 - jump / 28;
  ctx.fillStyle = 'rgba(40,24,12,.14)'; ctx.beginPath(); ctx.ellipse(-L * 8, 2.6, 18 * sh, 5.2 * sh, -L * .22, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(40,24,12,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 11 * sh, 3.4 * sh, 0, 0, 7); ctx.fill();
  const bw = h.build || 1;
  ctx.scale((adult ? 1.06 : 1) * bw, (adult ? 1.1 : 1) * (h.tall || 1));

  const G = h.gear || {};
  // ترتيب الرسم: الأطراف البعيدة أولاً. جانبياً: البعيد lat<0 (يمين النظر إلى +x)
  const farLeg = side ? 0 : back ? 1 : 0, nearLeg = 1 - farLeg;
  const farArm = side ? 0 : -1;
  if (back && h.carry) boxes(ctx, h.carry, AR[1].wr[0] - 6, AR[1].wr[1] - 2);
  if (G.cape && !back) cape(ctx, shV, hipV, G.cape, side, ph);   // الوشاح خلف الجسم (ومن الخلف يُرسم فوقه)
  if (G.shovel && !back) shovelGear(ctx, shV);
  if (side) drawArm(ctx, AR[0], robe, skin, acc, female, true, L);
  drawLeg(ctx, LG[farLeg], h, female, adult, acc, true, side);
  drawLeg(ctx, LG[nearLeg], h, female, adult, acc, false, side);
  // ── الثوب: التنورة تتبع الركبتين، والجذع يميل مع الحركة
  skirt(ctx, LG, hipV, robe, acc, female, side, back, L, ph, walking);
  torso(ctx, rot, P, hipV, shV, robe, acc, female, adult, side, back, L, G);
  if (G.flask) flask(ctx, P, rot, shV);
  if (G.cape && back) cape(ctx, shV, hipV, G.cape, side, ph);
  outfit(ctx, h, rot, P, hipV, shV, side, back);   // سترة، مريلة، حقيبة بريد
  if (G.medal && !back) medal(ctx, shV, side);
  if (side) { if (h.carry) boxes(ctx, h.carry, AR[1].wr[0] - 3, AR[1].wr[1] + 1); drawArm(ctx, AR[1], robe, skin, acc, female, false, L); }
  else { drawArm(ctx, AR[0], robe, skin, acc, female, false, L); drawArm(ctx, AR[1], robe, skin, acc, female, false, -L); if (!back && h.carry) boxes(ctx, h.carry, -6.5, AR[0].wr[1] + 1); }
  if (G.shovel && back) shovelGear(ctx, shV);
  if (h.tool) tool(ctx, h.tool, AR[1].wr, shV, walking);
  // ── الرأس (لا يتسع مع عرض الجسم)
  const [nf, nv] = rot(side ? .9 : 0, shV - B.neck), [nx, ny] = P(0, nf, nv), hx = nx + (side ? .5 : 0), hy = ny - B.RH + 1;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(1 / bw, 1); ctx.translate(-hx, -hy);
  ctx.fillStyle = shade(skin, -20); rr(ctx, nx - 2.1, ny - 1.5, 4.2, B.neck + 3, 1.5); ctx.fill();
  if (female) hijab(ctx, h, hx, hy, side, back, L, acc, skin, detail);
  else headShape(ctx, hx, hy, side, back, skin, L, detail);
  if (!back) (detail ? faceHi : faceLo)(ctx, h, hx, hy + (female ? .5 : 0), side, skin, now, seed, anim, female);
  if (h.glasses && !back) glasses(ctx, hx, hy + (female ? .5 : 0), side);
  if (h.hat) hat(ctx, h.hat, hx, hy, side, back, acc);
  else if (!female) (adult ? massar : kumma)(ctx, h, hx, hy, side, back, acc, detail);
  ctx.restore();
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

/* طرف مدبّب من نقطة إلى نقطة بنهايتين مستديرتين؛ grow يكبّره (للخط المحيطي) */
function limb(ctx, a, b, w0, w1, col, grow = 0) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, r0 = w0 / 2 + grow, r1 = w1 / 2 + grow;
  ctx.beginPath(); ctx.moveTo(a[0] + nx * r0, a[1] + ny * r0); ctx.lineTo(b[0] + nx * r1, b[1] + ny * r1);
  ctx.arc(b[0], b[1], r1, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true); ctx.lineTo(a[0] - nx * r0, a[1] - ny * r0);
  ctx.arc(a[0], a[1], r0, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
}
function drawLeg(ctx, g, h, female, adult, acc, far, side) {
  const pants = h.pants || (female ? shade(acc, -18) : '#E9E3D6'), k = far ? -26 : 0;
  limb(ctx, g.knee, g.ankle, 4.2, 3.6, INK, .7); limb(ctx, g.knee, g.ankle, 4.2, 3.6, shade(pants, k));
  if (female) { ctx.strokeStyle = shade(acc, 40); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(g.ankle[0] - 2, g.ankle[1] - 1.6); ctx.lineTo(g.ankle[0] + 2, g.ankle[1] - 1.6); ctx.stroke(); }   // تطريز السروال العُماني
  // الحذاء: جانبياً يمتد للأمام ويرفع مقدمته أثناء الخطو، وأمامياً بيضاوي
  const [x, y] = g.ankle;
  ctx.save(); ctx.translate(x, y + 1.2);
  if (side) ctx.rotate(-g.toeUp);
  const sole = adult ? '#3E2C20' : '#F2F0EA', top = h.shoe || (adult ? '#4A3426' : female ? '#6E4A82' : '#35587A');
  ctx.fillStyle = INK; ctx.beginPath(); side ? ctx.ellipse(1.6, .6, 4.9, 2.4, 0, 0, 7) : ctx.ellipse(0, .6, 3.2, 2.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = shade(sole, far ? -20 : 0); ctx.beginPath(); side ? ctx.ellipse(1.6, .9, 4.4, 1.6, 0, 0, 7) : ctx.ellipse(0, .9, 2.7, 1.7, 0, 0, 7); ctx.fill();
  ctx.fillStyle = shade(top, far ? -22 : 0); ctx.beginPath(); side ? ctx.ellipse(1.2, -.2, 3.8, 1.9, 0, Math.PI, 0) : ctx.ellipse(0, -.1, 2.5, 2, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
}
function drawArm(ctx, g, robe, skin, acc, female, far, lit) {
  const sl = shade(robe, far ? -30 : lit > 0 ? 6 : -12);
  limb(ctx, g.sh, g.el, 4.8, 4.2, INK, .7); limb(ctx, g.el, g.wr, 4.2, 3.6, INK, .7);   // الخط المحيطي للذراع كلها أولاً، فلا يظهر خط عند المرفق
  limb(ctx, g.sh, g.el, 4.8, 4.2, sl); limb(ctx, g.el, g.wr, 4.2, 3.6, sl);
  if (female) { ctx.strokeStyle = shade(acc, far ? 0 : 30); ctx.lineWidth = 1.3; const dx = g.wr[0] - g.el[0], dy = g.wr[1] - g.el[1], d = Math.hypot(dx, dy) || 1, cx = g.wr[0] - dx / d * 1.6, cy = g.wr[1] - dy / d * 1.6; ctx.beginPath(); ctx.moveTo(cx - dy / d * 2, cy + dx / d * 2); ctx.lineTo(cx + dy / d * 2, cy - dx / d * 2); ctx.stroke(); }   // كُم مطرّز
  // اليد: كف وإبهام
  const dx = g.wr[0] - g.el[0], dy = g.wr[1] - g.el[1], d = Math.hypot(dx, dy) || 1, hx = g.wr[0] + dx / d * 2, hy = g.wr[1] + dy / d * 2, sk = far ? shade(skin, -18) : skin;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(hx, hy, 2.4, 2.8, Math.atan2(dy, dx) - Math.PI / 2, 0, 7); ctx.fill();
  ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(hx, hy, 1.8, 2.2, Math.atan2(dy, dx) - Math.PI / 2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx - dy / d * 1.5, hy + dx / d * 1.5, .8, 1.3, Math.atan2(dy, dx), 0, 7); ctx.fill();
}
function skirt(ctx, LG, hipV, robe, acc, female, side, back, L, ph, walking) {
  // التنورة من الخصر إلى ما فوق الكاحل؛ حوافها تتبع الركبتين والكاحلين
  const wv = hipV - 3, hem = Math.min(-7, hipV + 22.5);
  ctx.beginPath();
  if (side) {
    // القماش يمتد بين الساقين لكنه لا يلحق الكاحلين كاملاً، فلا ينفرد كالشراع
    const fr = Math.max(5.6, LG[0].knee[0] + 2.4, LG[1].knee[0] + 2.4, LG[0].ankle[0] * .7 + 1.2, LG[1].ankle[0] * .7 + 1.2), bk = Math.min(-5.4, LG[0].knee[0] - 2.6, LG[1].knee[0] - 2.6, LG[0].ankle[0] * .7 - 1.2, LG[1].ankle[0] * .7 - 1.2);
    const fh = Math.min(hem, Math.min(LG[0].ankle[1], LG[1].ankle[1]) - 3.2);
    ctx.moveTo(-4.6, wv); ctx.lineTo(4.2, wv); ctx.quadraticCurveTo(fr + .6, (wv + fh) / 2, fr, fh); ctx.quadraticCurveTo((fr + bk) / 2, fh + 1.6, bk, hem); ctx.quadraticCurveTo(bk - .8, (wv + hem) / 2, -4.6, wv);
  } else {
    const lift = i => Math.max(0, (hem + 4) - LG[i].ankle[1]) * .5;   // الساق المرفوعة ترفع طرف الذيل
    const wl = 9.6 + Math.abs(LG[0].knee[0] - LG[1].knee[0]) * .2, l0 = lift(back ? 1 : 0), l1 = lift(back ? 0 : 1);
    ctx.moveTo(-5.4, wv); ctx.lineTo(5.4, wv); ctx.quadraticCurveTo(8, (wv + hem) / 2, wl, hem - l1); ctx.quadraticCurveTo(0, hem + 2.2 - (l0 + l1) / 2, -wl, hem - l0); ctx.quadraticCurveTo(-8, (wv + hem) / 2, -5.4, wv);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(L * 11, 0, -L * 11, 0); g.addColorStop(0, shade(robe, 10)); g.addColorStop(.55, robe); g.addColorStop(1, shade(robe, -32));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // طيّات تتبع حركة الساقين
  ctx.save(); ctx.clip(); ctx.strokeStyle = shade(robe, -28); ctx.globalAlpha = .5; ctx.lineWidth = .8;
  const k = walking ? Math.sin(ph) * 1.6 : 0;
  [-3, 1.5, 5].forEach((x, i) => { ctx.beginPath(); ctx.moveTo(x * .5, wv + 2); ctx.quadraticCurveTo(x + k * (i - 1), (wv + hem) / 2, x * 1.4 + k, hem); ctx.stroke(); });
  ctx.restore();
  if (female) { ctx.strokeStyle = shade(acc, 35); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(side ? -5 : -9, hem - 1.6); ctx.lineTo(side ? 6 : 9, hem - 1.6); ctx.stroke(); }
}
function torso(ctx, rot, P, hipV, shV, robe, acc, female, adult, side, back, L, G) {
  // الجذع: صدر وكتفان مستديران؛ جانبياً صدر للأمام وظهر مستقيم
  const pts = side
    ? [[-3.6, hipV - 1], [-4, shV + 6], [-3.2, shV + 1], [-.6, shV - 1.6], [2, shV - .8], [4.3, shV + 5], [4.4, shV + 11], [4, hipV - 1]]
    : [[-5.6, hipV - 1], [-6.3, shV + 9], [-8, shV + 2.6], [-6.4, shV - 1.4], [0, shV - 2.2], [6.4, shV - 1.4], [8, shV + 2.6], [6.3, shV + 9], [5.6, hipV - 1]];
  // جانبياً: النقاط (أمام، رأسي) تميل مع الجذع. أمامياً: (عرض، رأسي) والميل يظهر هبوطاً للأمام
  const xy = pts.map(([f, v]) => side ? rot(f, v) : (([rf, rv]) => P(f, rf, rv))(rot(0, v)));
  const path = () => { ctx.beginPath(); xy.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
  const g = ctx.createLinearGradient(L * 9, 0, -L * 9, 0); g.addColorStop(0, shade(robe, 12)); g.addColorStop(.5, robe); g.addColorStop(1, shade(robe, -30));
  path(); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();   // بلا خط عند الخصر: الجذع يتصل بالتنورة كقطعة واحدة
  const [cx, cy] = side ? rot(2.4, shV) : (([rf, rv]) => P(0, rf, rv))(rot(0, shV));
  if (back) { if (G.bag) { ctx.fillStyle = '#7A4E2C'; rr(ctx, -6.5, shV + 1, 13, 15, 3.5); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke(); ctx.fillStyle = '#9B6A3C'; rr(ctx, -6.5, shV + 1, 13, 5, 2.5); ctx.fill(); } return; }
  if (female) {   // صدرية مطرّزة على الثوب
    ctx.fillStyle = shade(acc, 12); ctx.globalAlpha = .9;
    if (side) { ctx.beginPath(); ctx.ellipse(cx + .8, cy + 5, 2.2, 4.6, 0, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-4, shV - .4); ctx.quadraticCurveTo(0, shV + 2, 4, shV - .4); ctx.lineTo(2.6, shV + 10); ctx.quadraticCurveTo(0, shV + 11.5, -2.6, shV + 10); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2D27A'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, shV + 2 + i * 2.2, .55, 0, 7); ctx.fill(); } }
    ctx.globalAlpha = 1;
  } else {   // طوق الدشداشة والفراخة (الشرّابة)
    ctx.strokeStyle = shade(robe, -26); ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(cx - 2.4, cy - 1.6); ctx.quadraticCurveTo(cx, cy + 1.4, cx + 2.4, cy - 1.6); ctx.stroke();
    ctx.strokeStyle = acc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy + .4); ctx.lineTo(cx + (side ? .8 : .3), cy + 11); ctx.stroke();
    ctx.fillStyle = acc; ctx.beginPath(); ctx.ellipse(cx + (side ? .9 : .3), cy + 12.6, 1.1, 1.9, 0, 0, 7); ctx.fill();
  }
  if (G.bag && side) { const [bx, by] = rot(-5.5, shV + 3); ctx.fillStyle = '#7A4E2C'; rr(ctx, bx - 3.5, by, 6, 14, 2.5); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke(); }
  if (G.bag && !side) { ctx.strokeStyle = '#6B4325'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(-4.6, shV - .6); ctx.lineTo(-5.2, shV + 12); ctx.moveTo(4.6, shV - .6); ctx.lineTo(5.2, shV + 12); ctx.stroke(); }
}
function headShape(ctx, hx, hy, side, back, skin, L, detail) {
  // الرأس: جبهة عريضة وفك أضيق وذقن؛ الأذنان عند مستوى العينين
  const R = B.R, RH = B.RH;
  if (!back) { ctx.fillStyle = shade(skin, -12); (side ? [[-2.2]] : [[-R + .2], [R - .2]]).forEach(([ex]) => { ctx.beginPath(); ctx.ellipse(hx + ex, hy + .6, 1.5, 2.3, 0, 0, 7); ctx.fill(); }); }
  ctx.beginPath();
  if (side) { ctx.moveTo(hx - R + .4, hy - 1); ctx.bezierCurveTo(hx - R + .2, hy - RH * 1.25, hx + R + .6, hy - RH * 1.2, hx + R - .2, hy - .5); ctx.lineTo(hx + R + .9, hy + 1.6); ctx.lineTo(hx + R - .1, hy + 2.4); ctx.quadraticCurveTo(hx + R - .3, hy + RH - .6, hx + 2.4, hy + RH); ctx.quadraticCurveTo(hx - 1.4, hy + RH, hx - 2.4, hy + 3); ctx.quadraticCurveTo(hx - R, hy + 2.6, hx - R + .4, hy - 1); }
  else { ctx.moveTo(hx - R, hy - .4); ctx.bezierCurveTo(hx - R, hy - RH * 1.3, hx + R, hy - RH * 1.3, hx + R, hy - .4); ctx.bezierCurveTo(hx + R, hy + 3.6, hx + 2.6, hy + RH, hx, hy + RH); ctx.bezierCurveTo(hx - 2.6, hy + RH, hx - R, hy + 3.6, hx - R, hy - .4); }
  ctx.closePath();
  const g = ctx.createRadialGradient(hx + L * 2.6, hy - 2.2, .5, hx, hy, R * 1.25); g.addColorStop(0, shade(skin, 14)); g.addColorStop(.65, skin); g.addColorStop(1, shade(skin, -24));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();
  // الشعر القصير: يغطي أعلى الرأس، ويظهر عند الصدغين والقفا
  ctx.save(); ctx.clip(); ctx.fillStyle = HAIR;
  if (back) ctx.fillRect(hx - R - 1, hy - RH * 1.3, R * 2 + 2, RH * 1.7);
  else if (side) { ctx.beginPath(); ctx.moveTo(hx + 3, hy - RH * 1.3); ctx.lineTo(hx + 1.6, hy - 2.6); ctx.quadraticCurveTo(hx - .6, hy - 1.4, hx - .9, hy + 2.6); ctx.lineTo(hx - R - 1, hy + 3.6); ctx.lineTo(hx - R - 1, hy - RH * 1.3); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(hx - R - 1, hy - RH * 1.3); ctx.lineTo(hx - R - 1, hy + .8); ctx.quadraticCurveTo(hx - R + 1.2, hy - 2.2, hx - 2.6, hy - 3.2); ctx.quadraticCurveTo(hx, hy - 3.6, hx + 2.6, hy - 3.2); ctx.quadraticCurveTo(hx + R - 1.2, hy - 2.2, hx + R + 1, hy + .8); ctx.lineTo(hx + R + 1, hy - RH * 1.3); ctx.closePath(); ctx.fill(); }
  if (detail && !back) { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(hx - L * 2, hy - 4.6, 2.6, 1, -.3 * L, 0, 7); ctx.fill(); }
  ctx.restore();
}
/* الوجه المفصّل: عينان ببياض وقزحية وجفن، حاجبان، أنف بظل، شفتان */
function faceHi(ctx, h, hx, hy, side, skin, now, seed, anim, female) {
  const blink = ((now / 1000 + seed) % 4.1) < .11, happy = anim === 'celebrate', iris = h.eyes || '#4A2E1E', brow = h.beard || (female ? '#2A1D18' : HAIR);
  if (h.beard) beardShape(ctx, h, hx, hy, side);
  const eye = (x, y, w) => {
    if (blink || happy) { ctx.strokeStyle = '#2A1A14'; ctx.lineWidth = .7; ctx.beginPath(); happy ? ctx.arc(x, y + .9, 1.3, Math.PI * 1.15, Math.PI * 1.85) : (ctx.moveTo(x - w, y + .2), ctx.quadraticCurveTo(x, y + .9, x + w, y + .2)); ctx.stroke(); return; }
    ctx.fillStyle = '#FBF7F2'; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y - 1.4, x + w, y); ctx.quadraticCurveTo(x, y + 1.1, x - w, y); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(x + (side ? .35 : 0), y, .85, 0, 7); ctx.fill(); ctx.fillStyle = '#120A07'; ctx.beginPath(); ctx.arc(x + (side ? .35 : 0), y, .42, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + .35, y - .35, .24, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1E120D'; ctx.lineWidth = .62; ctx.beginPath(); ctx.moveTo(x - w - .15, y + .1); ctx.quadraticCurveTo(x, y - 1.55, x + w + .2, y - .05); ctx.stroke();   // الجفن العلوي والرموش
  };
  const browL = (x, y, k) => { ctx.strokeStyle = brow; ctx.lineWidth = .85; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 1.4 * k, y + .3); ctx.quadraticCurveTo(x - .2 * k, y - .7, x + 1.5 * k, y - .1); ctx.stroke(); };
  if (side) {
    eye(hx + 3.1, hy + .4, 1.05); browL(hx + 3.1, hy - 1.6, 1);
    ctx.fillStyle = shade(skin, -20); ctx.beginPath(); ctx.ellipse(hx + 5.6, hy + 2.5, .55, .35, 0, 0, 7); ctx.fill();   // فتحة الأنف
    ctx.strokeStyle = '#8A4A3A'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(hx + 4, hy + 4.3); ctx.quadraticCurveTo(hx + 4.9, hy + (happy ? 4.9 : 4.6), hx + 5.5, hy + 4.2); ctx.stroke();
    ctx.fillStyle = 'rgba(200,90,80,.16)'; ctx.beginPath(); ctx.arc(hx + 2.4, hy + 3, 1.3, 0, 7); ctx.fill();
    return;
  }
  eye(hx - 2.3, hy + .5, 1.15); eye(hx + 2.3, hy + .5, 1.15); browL(hx - 2.3, hy - 1.5, 1); browL(hx + 2.3, hy - 1.5, -1);
  // الأنف: ظل على جانب الظل وطرف ناعم وفتحتان
  ctx.strokeStyle = shade(skin, -26); ctx.lineWidth = .55; ctx.beginPath(); ctx.moveTo(hx + .5, hy + .2); ctx.quadraticCurveTo(hx + 1, hy + 1.8, hx + .9, hy + 2.4); ctx.stroke();
  ctx.fillStyle = shade(skin, -24); ctx.beginPath(); ctx.ellipse(hx - .7, hy + 2.75, .42, .28, 0, 0, 7); ctx.ellipse(hx + .7, hy + 2.75, .42, .28, 0, 0, 7); ctx.fill();
  // الشفتان
  if (happy) { ctx.fillStyle = '#6E2A22'; ctx.beginPath(); ctx.moveTo(hx - 1.8, hy + 3.9); ctx.quadraticCurveTo(hx, hy + 6.2, hx + 1.8, hy + 3.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(hx - 1.2, hy + 3.95, 2.4, .5); }
  else {
    ctx.strokeStyle = '#7E3E32'; ctx.lineWidth = .62; ctx.beginPath(); ctx.moveTo(hx - 1.5, hy + 4.1); ctx.quadraticCurveTo(hx, hy + 4.55, hx + 1.5, hy + 4.1); ctx.stroke();
    ctx.fillStyle = 'rgba(178,92,80,.45)'; ctx.beginPath(); ctx.ellipse(hx, hy + 4.75, 1, .4, 0, 0, 7); ctx.fill();
  }
  if (!h.beard) { ctx.fillStyle = 'rgba(205,95,85,.14)'; ctx.beginPath(); ctx.arc(hx - 3.6, hy + 2.6, 1.3, 0, 7); ctx.arc(hx + 3.6, hy + 2.6, 1.3, 0, 7); ctx.fill(); }
}
/* الوجه المبسّط عند الحجم الصغير: نفس الملامح بخطوط أقل */
function faceLo(ctx, h, hx, hy, side, skin, now, seed, anim, female) {
  const blink = ((now / 1000 + seed) % 4.1) < .11, happy = anim === 'celebrate';
  if (h.beard) beardShape(ctx, h, hx, hy, side);
  ctx.fillStyle = '#1E120D'; ctx.strokeStyle = '#1E120D';
  const eye = (x, y) => { if (blink || happy) { ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - .9, y); ctx.lineTo(x + .9, y); ctx.stroke(); } else { ctx.beginPath(); ctx.ellipse(x, y, .78, 1, 0, 0, 7); ctx.fill(); } };
  ctx.lineWidth = .8;
  if (side) { eye(hx + 3.2, hy + .5); ctx.beginPath(); ctx.moveTo(hx + 2.2, hy - 1.4); ctx.lineTo(hx + 4.2, hy - 1.5); ctx.stroke(); }
  else { eye(hx - 2.3, hy + .5); eye(hx + 2.3, hy + .5); ctx.beginPath(); ctx.moveTo(hx - 3.3, hy - 1.3); ctx.lineTo(hx - 1.3, hy - 1.5); ctx.moveTo(hx + 1.3, hy - 1.5); ctx.lineTo(hx + 3.3, hy - 1.3); ctx.stroke(); }
  ctx.fillStyle = shade(skin, -22); ctx.beginPath(); ctx.ellipse(hx + (side ? 5.3 : .3), hy + 2.5, .7, .45, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#7E3E32'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(hx + (side ? 3.9 : -1.4), hy + 4.2); ctx.quadraticCurveTo(hx + (side ? 4.7 : 0), hy + (happy ? 5.3 : 4.7), hx + (side ? 5.3 : 1.4), hy + 4.2); ctx.stroke();
}
function beardShape(ctx, h, hx, hy, side) {   // لحية قصيرة مشذّبة على الفك
  ctx.fillStyle = h.beard; ctx.beginPath();
  if (side) { ctx.moveTo(hx - 2.2, hy + 1.6); ctx.quadraticCurveTo(hx - 1, hy + 7.4, hx + 3, hy + 7); ctx.quadraticCurveTo(hx + 5.8, hy + 6.2, hx + 5.6, hy + 4.4); ctx.lineTo(hx + 3.4, hy + 4.9); ctx.quadraticCurveTo(hx + .4, hy + 4.4, hx - .6, hy + 1.6); }
  else { ctx.moveTo(hx - B.R + .2, hy + 1); ctx.quadraticCurveTo(hx - 5, hy + 7.6, hx, hy + 7.8); ctx.quadraticCurveTo(hx + 5, hy + 7.6, hx + B.R - .2, hy + 1); ctx.quadraticCurveTo(hx + 4.4, hy + 4.6, hx + 2.2, hy + 4.7); ctx.lineTo(hx - 2.2, hy + 4.7); ctx.quadraticCurveTo(hx - 4.4, hy + 4.6, hx - B.R + .2, hy + 1); }
  ctx.fill();
}
function kumma(ctx, h, hx, hy, side, back, acc, detail) {   // الكمّة العمانية: قبعة مستديرة مطرّزة
  const R = B.R;
  ctx.beginPath(); ctx.moveTo(hx - R - .5, hy - 2.6); ctx.bezierCurveTo(hx - R, hy - 10.6, hx + R, hy - 10.6, hx + R + .5, hy - 2.6); ctx.quadraticCurveTo(hx, hy - .6, hx - R - .5, hy - 2.6); ctx.closePath();
  const g = ctx.createLinearGradient(hx - R, 0, hx + R, 0); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#DCD8CE');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.fillStyle = acc;
  const n = detail ? 9 : 6;
  for (let r = 0; r < 3; r++) for (let i = 0; i < n - r * 2; i++) { const t = (i + .5) / (n - r * 2) - .5, x = hx + t * (2 * R - r * 3), y = hy - 3.4 - r * 2.3 + Math.abs(t) * 1.2; if (detail) { ctx.beginPath(); ctx.moveTo(x, y - .7); ctx.lineTo(x + .55, y); ctx.lineTo(x, y + .7); ctx.lineTo(x - .55, y); ctx.fill(); } else { ctx.beginPath(); ctx.arc(x, y, .5, 0, 7); ctx.fill(); } }
  ctx.fillRect(hx - R - 1, hy - 2.9, 2 * R + 2, .7);
  ctx.restore();
}
function massar(ctx, h, hx, hy, side, back, acc, detail) {   // المصر: العمامة العمانية الملفوفة
  const R = B.R;
  ctx.beginPath(); ctx.moveTo(hx - R - 1.5, hy - 1.6); ctx.bezierCurveTo(hx - R - 1, hy - 12, hx + R + 1, hy - 12, hx + R + 1.5, hy - 1.6); ctx.quadraticCurveTo(hx, hy + .4, hx - R - 1.5, hy - 1.6); ctx.closePath();
  const g = ctx.createLinearGradient(hx - R, 0, hx + R, 0); g.addColorStop(0, shade(acc, 18)); g.addColorStop(1, shade(acc, -24));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  ctx.strokeStyle = shade(acc, 60); ctx.lineWidth = .7;
  for (let i = 0; i < (detail ? 4 : 3); i++) { ctx.beginPath(); ctx.moveTo(hx - R - .5 + i * .8, hy - 2.6 - i * 2); ctx.quadraticCurveTo(hx + (i % 2 ? 1 : -1), hy - 5.2 - i * 2.1, hx + R + .5 - i * .8, hy - 3.4 - i * 2); ctx.stroke(); }
  if (!side && !back) { ctx.fillStyle = shade(acc, 28); ctx.beginPath(); ctx.ellipse(hx + 4.6, hy - 8.4, 2.2, 1.7, .4, 0, 7); ctx.fill(); }
}
function hijab(ctx, h, hx, hy, side, back, L, acc, skin, detail) {   // حجاب ملفوف يؤطّر الوجه وينسدل على الكتفين
  const R = B.R, RH = B.RH;
  const g = ctx.createLinearGradient(hx + L * 9, 0, hx - L * 9, 0); g.addColorStop(0, shade(acc, 14)); g.addColorStop(1, shade(acc, -28));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(hx + (side ? -.6 : 0), hy - .8, R + 2, RH + 2.2, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - R - 1.6, hy + 1); ctx.quadraticCurveTo(hx - R - 3.4, hy + 9, hx - 9.4, hy + 13.4); ctx.quadraticCurveTo(hx, hy + 16.4, hx + 9.4, hy + 13.4); ctx.quadraticCurveTo(hx + R + 3.4, hy + 9, hx + R + 1.6, hy + 1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.beginPath(); ctx.ellipse(hx + (side ? -.6 : 0), hy - .8, R + 2, RH + 2.2, 0, Math.PI * .92, Math.PI * 2.08); ctx.stroke();
  if (detail) { ctx.strokeStyle = shade(acc, -34); ctx.lineWidth = .6; ctx.globalAlpha = .6; ctx.beginPath(); ctx.moveTo(hx - 6, hy + 9); ctx.quadraticCurveTo(hx, hy + 12, hx + 6, hy + 9); ctx.stroke(); ctx.globalAlpha = 1; }
  if (back) return;
  // فتحة الوجه
  const fx = hx + (side ? 2.4 : 0), fw = side ? 4.2 : 5, fh = RH - .2;
  ctx.beginPath(); ctx.ellipse(fx, hy + 1, fw, fh, 0, 0, 7);
  const sg = ctx.createRadialGradient(fx + L * 2, hy - 1, .5, fx, hy + 1, fw * 1.4); sg.addColorStop(0, shade(skin, 14)); sg.addColorStop(.7, skin); sg.addColorStop(1, shade(skin, -18));
  ctx.fillStyle = sg; ctx.fill();
  ctx.strokeStyle = shade(acc, -36); ctx.lineWidth = .9; ctx.beginPath(); ctx.ellipse(fx, hy + 1, fw, fh, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
}
function flask(ctx, P, rot, shV) {
  const [ax, ay] = rot(-3, shV), [bx, by] = rot(3.5, shV + 15);
  ctx.strokeStyle = '#6B4A2A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = '#2D7DB8'; rr(ctx, bx - 2.5, by - 1, 6, 9, 2.5); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
}
function cape(ctx, shV, hipV, col, side, ph) {   // وشاح حامي القرية (جائزة مغامرة)
  const w = side ? 4.5 : 7.5, f = side ? 9 : 12.5, sw = Math.sin(ph * 2) * 1.6, by = hipV + 15;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-w, shV + 2); ctx.lineTo(w, shV + 2); ctx.quadraticCurveTo(f + 1, (shV + hipV) / 2, f + sw, by);
  ctx.quadraticCurveTo(sw, by + 3, -f + sw, by); ctx.quadraticCurveTo(-f - 1, (shV + hipV) / 2, -w, shV + 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  ctx.strokeStyle = '#E3B04B'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(f + sw - 1, by - 1); ctx.quadraticCurveTo(sw, by + 2, -f + sw + 1, by - 1); ctx.stroke();
}
function medal(ctx, shV, side) {   // وسام البطل الأكبر: شريطان على شكل V وقرص ذهبي على الصدر
  const cx = side ? 2 : 0, cy = shV + 13;
  ctx.fillStyle = '#C0392B'; ctx.beginPath(); ctx.moveTo(cx - 4.5, shV + 1); ctx.lineTo(cx - 1.2, cy - 2); ctx.lineTo(cx + 1.2, cy - 2); ctx.lineTo(cx + 4.5, shV + 1); ctx.lineTo(cx + 2, shV + 1); ctx.lineTo(cx, cy - 6); ctx.lineTo(cx - 2, shV + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFD54A'; ctx.beginPath(); ctx.arc(cx, cy, 3.8, 0, 7); ctx.fill(); ctx.strokeStyle = '#9A6A10'; ctx.lineWidth = .8; ctx.stroke();
  ctx.fillStyle = '#FFF4C4'; ctx.beginPath(); ctx.arc(cx - 1, cy - 1, 1.2, 0, 7); ctx.fill();
}
function shovelGear(ctx, shV) {
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(-10, shV + 34); ctx.lineTo(9, shV - 6); ctx.stroke();
  ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 2.1; ctx.beginPath(); ctx.moveTo(-10, shV + 34); ctx.lineTo(9, shV - 6); ctx.stroke();
  ctx.fillStyle = '#A9B4BF'; ctx.beginPath(); ctx.moveTo(7.5, shV - 4); ctx.lineTo(15, shV - 14); ctx.lineTo(12.5, shV + 1); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
}
function boxes(ctx, n, x0, y0) {   // كومة صناديق بين اليدين، بوجه علوي مضاء
  for (let k = 0; k < n; k++) {
    const y = y0 - 8.4 * (k + 1), x = x0 + (k % 2 ? .7 : -.7);
    ctx.fillStyle = '#C98A4B'; rr(ctx, x, y, 13, 8.4, 1.5); ctx.fill();
    ctx.fillStyle = '#E2AC6C'; ctx.fillRect(x + .6, y + .5, 11.8, 2.2);
    ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.strokeRect(x, y, 13, 8.4);
    ctx.strokeStyle = '#8E5A26'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + 6.5, y + 2.6); ctx.lineTo(x + 6.5, y + 8.4); ctx.stroke();
  }
}

/* ── أزياء المهن ── */
function outfit(ctx, h, rot, P, hipV, shV, side, back) {
  const poly = pts => { ctx.beginPath(); pts.forEach(([f, v, l], i) => { const [rf, rv] = rot(side ? f : 0, v), [x, y] = P(side ? 0 : l, rf, rv); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
  if (h.vest) {   // سترة عاكسة: لوحان أماميان وشريطان فضيان (ظهر كامل من الخلف)
    const parts = side ? [[[-3.4, shV + 2], [3.6, shV + 2], [3.8, hipV - 1], [-3.6, hipV - 1]]]
      : back ? [[[0, shV + 1, -6.6], [0, shV + 1, 6.6], [0, hipV - 1, 6], [0, hipV - 1, -6]]]
      : [[[0, shV + 1, -6.8], [0, shV + 2, -1.9], [0, hipV - 1, -1.9], [0, hipV - 1, -6.2]], [[0, shV + 1, 6.8], [0, shV + 2, 1.9], [0, hipV - 1, 1.9], [0, hipV - 1, 6.2]]];
    parts.forEach(pt => { poly(pt.map(([f, v, l]) => [f, v, l || 0])); ctx.fillStyle = h.vest; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke(); });
    ctx.fillStyle = '#E8ECEF'; [shV + 8, shV + 12].forEach(v => parts.forEach(pt => { const lo = pt[0], hi = pt[1]; poly([[lo[0], v, lo[2] || 0], [hi[0], v, hi[2] || 0], [hi[0], v + 1.6, hi[2] || 0], [lo[0], v + 1.6, lo[2] || 0]]); ctx.fill(); }));
  }
  if (h.apron && !back) {   // مريلة صاحب الدكان من الخصر إلى الركبة
    poly(side ? [[1.2, hipV - 5], [5, hipV - 5], [5.6, hipV + 15], [1.6, hipV + 15]] : [[0, hipV - 5, -5.6], [0, hipV - 5, 5.6], [0, hipV + 15, 6.2], [0, hipV + 15, -6.2]]);
    ctx.fillStyle = h.apron; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
    if (!side) { ctx.strokeStyle = shade(h.apron, -30); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-3.6, shV + 1); ctx.lineTo(-3, hipV - 5); ctx.moveTo(3.6, shV + 1); ctx.lineTo(3, hipV - 5); ctx.stroke(); ctx.fillStyle = shade(h.apron, -20); rr(ctx, -3, hipV + 2, 6, 5, 1); ctx.fill(); }
  }
  if (h.postbag) {   // حقيبة البريد بحزام مائل
    ctx.strokeStyle = '#5B3A22'; ctx.lineWidth = 1.4; ctx.beginPath();
    if (!side) { ctx.moveTo(back ? 5 : -5, shV - .5); ctx.lineTo(back ? -5 : 5, hipV - 3); } else { ctx.moveTo(.5, shV); ctx.lineTo(-4, hipV - 3); }
    ctx.stroke();
    const bx = side ? -9 : back ? -11 : 4, by = hipV - 7;
    ctx.fillStyle = '#2F6B73'; rr(ctx, bx, by, 8, 9, 1.6); ctx.fill(); ctx.fillStyle = shade('#2F6B73', -20); rr(ctx, bx, by, 8, 4, 1.4); ctx.fill();
    ctx.fillStyle = '#E3B04B'; ctx.fillRect(bx + 3, by + 4.5, 2, 2); ctx.strokeStyle = INK; ctx.lineWidth = .6; ctx.strokeRect(bx, by, 8, 9);
  }
}
function tool(ctx, kind, wr, shV, walking) {   // عصا كبير السن، أو معول المزارع يتكئ عليه
  ctx.lineCap = 'round';
  if (kind === 'cane') {
    const bx = wr[0] + 2.5, top = wr[1] - 1;
    ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx - .5, top); ctx.quadraticCurveTo(bx - .8, top - 3, bx - 3.5, top - 2); ctx.stroke();
    ctx.strokeStyle = '#7A4A2A'; ctx.lineWidth = 1.6; ctx.stroke();
    return;
  }
  if (kind === 'hoe' && !walking) {
    const gx = wr[0] + 4, top = shV - 14;
    ctx.strokeStyle = INK; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(gx, -1); ctx.lineTo(wr[0] - 1, top); ctx.stroke();
    ctx.strokeStyle = '#9C6438'; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = '#8E99A4'; ctx.beginPath(); ctx.moveTo(gx - 1, -1); ctx.lineTo(gx + 7, 0); ctx.lineTo(gx + 6, 2.4); ctx.lineTo(gx - 1, 1.4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .6; ctx.stroke();
  }
}
function glasses(ctx, hx, hy, side) {
  ctx.strokeStyle = '#2A1E19'; ctx.lineWidth = .55;
  if (side) { ctx.beginPath(); ctx.arc(hx + 3.2, hy + .4, 1.7, 0, 7); ctx.moveTo(hx + 1.5, hy); ctx.lineTo(hx - 1.6, hy - .3); ctx.stroke(); return; }
  ctx.beginPath(); ctx.arc(hx - 2.3, hy + .5, 1.75, 0, 7); ctx.moveTo(hx + 4.05, hy + .5); ctx.arc(hx + 2.3, hy + .5, 1.75, 0, 7); ctx.moveTo(hx - .55, hy + .3); ctx.lineTo(hx + .55, hy + .3); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(hx - 2.8, hy, .5, 0, 7); ctx.arc(hx + 1.8, hy, .5, 0, 7); ctx.fill();
}
function hat(ctx, kind, hx, hy, side, back, acc) {
  const R = B.R;
  if (kind === 'straw') {   // قبعة خوص عريضة الحافة للمزارع
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(hx, hy - 3.4, 11.8, 4.1, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#D9B76A'; ctx.beginPath(); ctx.ellipse(hx, hy - 3.4, 11, 3.5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(140,100,40,.45)'; ctx.lineWidth = .5; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.ellipse(hx, hy - 3.4, 11 - k * 2.2, 3.5 - k * .7, 0, 0, 7); ctx.stroke(); }
    const g = ctx.createLinearGradient(hx - 6, 0, hx + 6, 0); g.addColorStop(0, '#E3C27A'); g.addColorStop(1, '#B38E48');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx - 5.6, hy - 3.6); ctx.bezierCurveTo(hx - 5.6, hy - 12.5, hx + 5.6, hy - 12.5, hx + 5.6, hy - 3.6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
    ctx.fillStyle = '#7A4A2A'; ctx.fillRect(hx - 5.6, hy - 6.2, 11.2, 1.8);
    return;
  }
  if (kind === 'cap') {   // قبعة رياضية حديثة
    ctx.fillStyle = acc; ctx.beginPath(); ctx.moveTo(hx - R - .3, hy - 1.6); ctx.bezierCurveTo(hx - R, hy - 10.5, hx + R, hy - 10.5, hx + R + .3, hy - 1.6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
    ctx.fillStyle = shade(acc, -28);
    if (side) { ctx.beginPath(); ctx.ellipse(hx + R + 2.4, hy - 2.2, 4.6, 1.5, -.1, 0, 7); ctx.fill(); }
    else if (!back) { ctx.beginPath(); ctx.ellipse(hx, hy - 1.4, 6.8, 2.4, 0, 0, Math.PI); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy - 8.6, .8, 0, 7); ctx.fill();
  }
}