// شخصية بشرية تُرسم بالكود: تمشي وتلتفت وتحمل وتنحني — لا صورة ثابتة ولا دائرة بوجه
import { shade, rr } from '../core/util.js';

export const SKINS = ['#F3CDA6', '#DDA779', '#B97F52', '#8B5A38'];
export const ACCENTS = ['#2F6FB2', '#C0392B', '#2E8B57', '#8E44AD'];

/* h = { x, y, dir:'down'|'up'|'left'|'right', phase, moving, carry, kind:'boy'|'girl'|'man'|'woman',
         skin, robe, accent, s, bend, beard, mark } — (x, y) هي موضع القدمين */
export function drawHuman(ctx, h) {
  const s = h.s || 1, ph = h.phase || 0, mv = h.moving ? 1 : 0, sw = Math.sin(ph);
  const dir = h.dir || 'down', side = dir === 'left' || dir === 'right', back = dir === 'up';
  const female = h.kind === 'girl' || h.kind === 'woman';
  const adult = h.kind === 'man' || h.kind === 'woman';
  const bob = mv ? Math.abs(sw) * 1.6 : Math.sin(performance.now() / 650 + (h.x || 0)) * .45;
  const robe = h.robe || (female ? '#D85C7B' : '#F7F5EF'), skin = h.skin || SKINS[1];
  const H = adult ? 1.1 : 1;   // البالغ أطول قليلاً

  ctx.save(); ctx.translate(h.x, h.y); ctx.scale(dir === 'left' ? -s : s, s);
  // الظل
  ctx.fillStyle = 'rgba(60,35,10,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 4.5, 0, 0, 7); ctx.fill();
  ctx.translate(0, -bob - (h.bend ? -3 : 0)); ctx.scale(1, H);

  // الساقان والحذاء
  const l = mv ? sw * 4 : 0;
  const legs = side ? [[-1, l], [2.5, -l]] : [[-4.5, l * .55], [4.5, -l * .55]];
  legs.forEach(([lx, ly]) => {
    const sx = side ? lx + ly * .9 : lx, sy = side ? 0 : ly;
    ctx.fillStyle = h.pants || (female ? '#5D4A66' : '#E9E4D8'); rr(ctx, sx - 2.2, -10 + sy, 4.4, 8, 2); ctx.fill();
    ctx.fillStyle = h.shoe || '#4A3426'; ctx.beginPath(); ctx.ellipse(sx + (side ? 1.6 : 0), -1.6 + sy, side ? 4.3 : 3.2, 2.4, 0, 0, 7); ctx.fill();
  });

  const G = h.gear || {};
  if (G.shovel && !back) shovel(ctx);                       // المجرفة خلف الظهر
  if (G.bag && side) { ctx.fillStyle = '#8B5E34'; rr(ctx, -15, -35, 9, 19, 3); ctx.fill(); }
  if (back && h.carry) boxes(ctx, h.carry, -26);
  const top = -37, hem = -7, wt = side ? 9 : 11, wb = side ? 11 : 13.5, armSw = mv ? -sw * 4 : 0;
  // الذراع البعيدة في الوضع الجانبي
  if (side && !h.carry && !h.bend) arm(ctx, -3, top + 6, -2 - armSw, top + 21, skin, robe);

  // الثوب
  ctx.fillStyle = robe; ctx.beginPath();
  ctx.moveTo(-wt, top + 3); ctx.quadraticCurveTo(0, top - 2, wt, top + 3);
  ctx.lineTo(wb, hem); ctx.quadraticCurveTo(0, hem + 2.5, -wb, hem); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(robe, -40); ctx.globalAlpha = .22;
  ctx.beginPath(); ctx.moveTo(wt * .25, top + 4); ctx.lineTo(wb, hem); ctx.quadraticCurveTo(wb * .5, hem + 2, wb * .2, hem + 1); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  if (female) {   // زخرفة الثوب
    ctx.strokeStyle = shade(robe, 45); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-wb + 2, hem - 3); ctx.lineTo(wb - 2, hem - 3); ctx.stroke();
  } else if (!back) {   // الفراخة: شرّابة الدشداشة العمانية
    const fx = side ? 4.5 : 0;
    ctx.strokeStyle = h.accent || '#C8A15A'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(fx, top + 1.5); ctx.lineTo(fx + .5, top + 12); ctx.stroke();
    ctx.fillStyle = h.accent || '#C8A15A'; ctx.beginPath(); ctx.arc(fx + .5, top + 13.2, 1.5, 0, 7); ctx.fill();
  }

  // الذراعان
  if (h.carry) { arm(ctx, -wt + 1, top + 5, -6, top + 13, skin, robe); arm(ctx, wt - 1, top + 5, 6, top + 13, skin, robe); }
  else if (h.bend) { arm(ctx, -wt + 1, top + 5, -5, top + 24, skin, robe); arm(ctx, wt - 1, top + 5, 6, top + 25, skin, robe); }
  else if (side) arm(ctx, 2, top + 5, 3 + armSw, top + 21, skin, robe);
  else { arm(ctx, -wt + .5, top + 5, -wt - 1.6, top + 20 + armSw * .6, skin, robe); arm(ctx, wt - .5, top + 5, wt + 1.6, top + 20 - armSw * .6, skin, robe); }

  // العتاد فوق الثوب
  if (G.bag) {
    if (back) { ctx.fillStyle = '#8B5E34'; rr(ctx, -9, top + 4, 18, 20, 4); ctx.fill(); ctx.fillStyle = '#A9743F'; rr(ctx, -9, top + 4, 18, 7, 3); ctx.fill(); ctx.fillStyle = '#E3B04B'; ctx.fillRect(-1.5, top + 9, 3, 3); }
    else if (!side) { ctx.strokeStyle = '#7A4F2A'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-6, top + 3); ctx.lineTo(-7, top + 17); ctx.moveTo(6, top + 3); ctx.lineTo(7, top + 17); ctx.stroke(); }
  }
  if (G.shovel && back) shovel(ctx);
  if (G.flask) { ctx.strokeStyle = '#6B4A2A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-wt + 2, top + 4); ctx.lineTo(wb - 4, top + 20); ctx.stroke(); ctx.fillStyle = '#2D9CDB'; rr(ctx, wb - 7, top + 18, 7, 10, 3); ctx.fill(); ctx.fillStyle = '#BFE7FB'; ctx.fillRect(wb - 5.5, top + 20, 1.6, 5); }
  // الرأس
  const hx = side ? 1.5 : 0, hy = top - 8.6;
  if (female) hijab(ctx, h, hx, hy, side, back);
  else { ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, 8.6, 0, 7); ctx.fill(); }
  if (!back) face(ctx, h, hx, hy + (female ? 1 : 0), side, skin);
  if (!female) (h.kind === 'man' ? massar : kumma)(ctx, h, hx, hy, side, back);
  if (!back && h.carry) boxes(ctx, h.carry, top + 13);
  ctx.restore();

  if (h.mark) {   // علامة فوق الرأس (مهمة متاحة)
    const y = h.y - 70 * s * H - Math.abs(Math.sin(performance.now() / 300)) * 4;
    ctx.fillStyle = '#FFC23D'; ctx.beginPath(); ctx.arc(h.x, y, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#3A2400'; ctx.font = '900 13px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(h.mark, h.x, y + 1);
  }
}

function shovel(ctx) {
  ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-11, -12); ctx.lineTo(10, -52); ctx.stroke();
  ctx.fillStyle = '#9AA5B1'; ctx.beginPath(); ctx.moveTo(8, -50); ctx.lineTo(16, -60); ctx.lineTo(13, -46); ctx.closePath(); ctx.fill();
}
function arm(ctx, x1, y1, x2, y2, skin, robe) {
  const mx = x1 + (x2 - x1) * .55, my = y1 + (y2 - y1) * .55;
  ctx.lineCap = 'round';
  ctx.strokeStyle = shade(robe, -12); ctx.lineWidth = 4.6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.stroke();
  ctx.strokeStyle = skin; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x2, y2, 2.1, 0, 7); ctx.fill();
}

function face(ctx, h, hx, hy, side, skin) {
  ctx.fillStyle = '#2B1D14';
  if (side) {
    ctx.beginPath(); ctx.arc(hx + 4.2, hy - .2, 1.15, 0, 7); ctx.fill();
    ctx.fillStyle = shade(skin, -18); ctx.beginPath(); ctx.arc(hx + 8.2, hy + 1.8, 1.6, 0, 7); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(hx - 3.1, hy, 1.15, 0, 7); ctx.arc(hx + 3.1, hy, 1.15, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7A4A32'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy + 2.6, 2.4, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(230,110,110,.25)'; ctx.beginPath(); ctx.arc(hx - 5, hy + 2.4, 1.6, 0, 7); ctx.arc(hx + 5, hy + 2.4, 1.6, 0, 7); ctx.fill();
  }
  if (h.beard) { ctx.fillStyle = h.beard; ctx.beginPath(); ctx.ellipse(hx + (side ? 3 : 0), hy + 5.4, side ? 4.5 : 6, 3.4, 0, 0, Math.PI); ctx.fill(); }
}

function kumma(ctx, h, hx, hy, side, back) {   // الكمّة العمانية المطرّزة
  ctx.fillStyle = '#FBFAF6'; ctx.beginPath(); ctx.ellipse(hx, hy - 2.6, 9.3, 7.4, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = h.accent || '#2F6FB2';
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(hx + i * 2.4, hy - 3.6, .8, 0, 7); ctx.fill(); }
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(hx + i * 2.6, hy - 6.6, .7, 0, 7); ctx.fill(); }
}
function massar(ctx, h, hx, hy, side, back) {   // المصر: العمامة العمانية الملوّنة
  const c = h.accent || '#7B3F98';
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(hx, hy - 3, 10.4, 7.6, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = shade(c, 60); ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(hx, hy - 3 - i * 2.2, 10.2 - i * 1.4, 2.2, 0, Math.PI, 0); ctx.stroke(); }
  if (!side) { ctx.fillStyle = shade(c, 25); ctx.beginPath(); ctx.arc(hx + 6, hy - 8.5, 2.4, 0, 7); ctx.fill(); }
}
function hijab(ctx, h, hx, hy, side, back) {
  const c = h.accent || '#2F6FB2';
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(hx, hy - .5, 10.6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - 10.2, hy + 1); ctx.lineTo(hx - 12.5, hy + 13); ctx.quadraticCurveTo(hx, hy + 16, hx + 12.5, hy + 13); ctx.lineTo(hx + 10.2, hy + 1); ctx.closePath(); ctx.fill();
  if (!back) { ctx.fillStyle = h.skin || SKINS[1]; ctx.beginPath(); ctx.ellipse(hx + (side ? 3 : 0), hy + 1.2, side ? 5.2 : 6.4, 7.2, 0, 0, 7); ctx.fill(); }
}
function boxes(ctx, n, y0) {   // كومة صناديق بين يدي البطل
  for (let k = 0; k < n; k++) {
    const y = y0 - 8.2 * (k + 1), x = -6 + (k % 2 ? .8 : -.8);
    ctx.fillStyle = '#D79B57'; rr(ctx, x, y, 12, 8, 1.5); ctx.fill();
    ctx.strokeStyle = '#A66C2E'; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = '#F4D7A1'; ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + 6, y + 8); ctx.stroke();
  }
}
