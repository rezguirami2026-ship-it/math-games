// العناصر التفاعلية في العالم: تُرسم من حالة اللعبة، وتتحرك في المشاهد
import { ar, rr, shade, lerp } from '../core/util.js';
import { PARK, FARM_PARK, PILE, SIGNAL } from './village.js';

export const fx = { particles: [], bubbles: [], floaters: [] };

export function makeTrucks(state) {
  const done = !!state.world.delivered;
  return PARK.map((p, i) => ({ i, x: done ? FARM_PARK[i].x : p.x, y: done ? FARM_PARK[i].y : p.y, path: null, covered: done, sag: 0, flash: 0, shake: 0, cough: 0 }));
}
export function truckColliders(trucks) { return trucks.map(t => ({ x: t.x - 32, y: t.y - 22, w: 64, h: 24 })); }

/* شاحنة من الأعلى تتجه يميناً: صندوق الحمولة يعرض الصناديق فعلياً */
export function drawTruck(ctx, t, load, showLabel) {
  const sx = t.shake ? Math.sin(performance.now() / 30) * 2 : 0;
  ctx.save(); ctx.translate(t.x + sx, t.y + t.sag);
  ctx.fillStyle = 'rgba(40,25,10,.25)'; ctx.beginPath(); ctx.ellipse(2, 4, 40, 8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#26262F';
  [[-26, -24], [-26, 0], [18, -24], [18, 0]].forEach(([x, y]) => { rr(ctx, x, y - t.sag * .4, 12, 6, 2); ctx.fill(); });
  // صندوق الحمولة
  ctx.fillStyle = t.flash ? '#FF8A8A' : '#9AA5B8'; rr(ctx, -38, -30, 56, 32, 4); ctx.fill();
  ctx.fillStyle = '#7D889C'; rr(ctx, -35, -27, 50, 26, 3); ctx.fill();
  if (t.covered) {
    ctx.fillStyle = '#3F7D5A'; rr(ctx, -37, -29, 54, 30, 4); ctx.fill();
    ctx.strokeStyle = '#2C5A40'; ctx.lineWidth = 1.5;
    for (let x = -30; x < 16; x += 11) { ctx.beginPath(); ctx.moveTo(x, -29); ctx.lineTo(x, 1); ctx.stroke(); }
  } else {
    const n = Math.min(load, 8);
    for (let k = 0; k < n; k++) {
      const c = k % 4, r = Math.floor(k / 4), x = -33 + c * 12, y = -24 + r * 12;
      ctx.fillStyle = '#D79B57'; rr(ctx, x, y, 11, 10, 1.5); ctx.fill();
      ctx.strokeStyle = '#A66C2E'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  // المقصورة
  ctx.fillStyle = t.flash ? '#E8590C' : '#F08A24'; rr(ctx, 18, -30, 22, 32, 6); ctx.fill();
  ctx.fillStyle = '#BFE3F7'; rr(ctx, 30, -26, 7, 24, 3); ctx.fill();
  ctx.fillStyle = shade('#F08A24', -30); ctx.fillRect(18, -30, 3, 32);
  ctx.restore();
  if (showLabel) bubble(ctx, t.x - 10, t.y - 50, ar(load), t.flash ? '#E2475C' : '#2A1B66');
}

/* كومة الصناديق أمام المستودع */
export function drawPile(ctx, n) {
  const rows = [6, 5, 5, 4, 3, 1]; let k = 0;
  ctx.save(); ctx.translate(PILE.x, PILE.y);
  ctx.fillStyle = 'rgba(60,35,10,.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 50, 9, 0, 0, 7); ctx.fill();
  for (let r = 0; r < rows.length && k < n; r++) {
    const cnt = Math.min(rows[r], n - k);
    for (let c = 0; c < cnt; c++, k++) {
      const x = -cnt * 8 + c * 16, y = -12 - r * 11;
      ctx.fillStyle = '#D79B57'; rr(ctx, x, y, 15, 12, 2); ctx.fill();
      ctx.strokeStyle = '#A66C2E'; ctx.lineWidth = 1; ctx.stroke();
      ctx.strokeStyle = '#F4D7A1'; ctx.beginPath(); ctx.moveTo(x + 7.5, y); ctx.lineTo(x + 7.5, y + 12); ctx.stroke();
    }
  }
  ctx.restore();
  bubble(ctx, PILE.x, PILE.y - 90, n ? '📦 ' + ar(n) : 'فارغة', '#2A1B66');
}

/* إشارة الانطلاق */
export function drawSignal(ctx, green) {
  const s = SIGNAL;
  ctx.fillStyle = 'rgba(60,35,10,.2)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 3, 10, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4A4F63'; ctx.fillRect(s.x - 2.5, s.y - 54, 5, 56);
  ctx.fillStyle = '#2B2E3B'; rr(ctx, s.x - 11, s.y - 80, 22, 34, 6); ctx.fill();
  ctx.fillStyle = green ? '#3A3A3A' : '#FF4D5E'; ctx.beginPath(); ctx.arc(s.x, s.y - 71, 6, 0, 7); ctx.fill();
  ctx.fillStyle = green ? '#3BE07A' : '#2F3A2F'; ctx.beginPath(); ctx.arc(s.x, s.y - 55, 6, 0, 7); ctx.fill();
}

/* بقعة زراعة: أرض فارغة أو نخلة نامية */
export function drawSpot(ctx, s, empty) {
  if (!empty) return;
  ctx.fillStyle = '#C79F68'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 20, 9, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#A97F4C'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 12, 5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#7D5A36'; ctx.fillRect(s.x + 16, s.y - 24, 3, 24);
  ctx.fillStyle = '#F4E3B8'; rr(ctx, s.x + 6, s.y - 36, 24, 14, 3); ctx.fill();
  ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🌱', s.x + 18, s.y - 25);
}

/* ── مؤثرات: دخان، تراب، فقاعات كلام، أرقام طافية ── */
export function puff(x, y, color, n) {
  for (let i = 0; i < (n || 6); i++) fx.particles.push({ x, y, vx: (Math.random() - .5) * 26, vy: -20 - Math.random() * 25, r: 4 + Math.random() * 5, life: 1, c: color || '#ddd' });
}
export function say(x, y, text, color, ms) { fx.bubbles.push({ x, y, text, color: color || '#2A1B66', until: performance.now() + (ms || 2200) }); }
export function floatUp(x, y, text, color) { fx.floaters.push({ x, y, text, color: color || '#1FA05A', t: 0 }); }
export function updateFx(dt) {
  fx.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.r += 6 * dt; p.life -= dt * .9; });
  fx.particles = fx.particles.filter(p => p.life > 0);
  const now = performance.now(); fx.bubbles = fx.bubbles.filter(b => b.until > now);
  fx.floaters.forEach(f => { f.t += dt; }); fx.floaters = fx.floaters.filter(f => f.t < 1.6);
}
export function drawFx(ctx) {
  fx.particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life) * .7; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;
  fx.bubbles.forEach(b => bubble(ctx, b.x, b.y, b.text, b.color));
  fx.floaters.forEach(f => {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.6); ctx.font = '900 20px Cairo, sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(f.text, f.x, f.y - f.t * 40);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y - f.t * 40); ctx.globalAlpha = 1;
  });
}
export function bubble(ctx, x, y, text, color) {
  ctx.font = '900 14px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = '#fff'; rr(ctx, x - w / 2, y - 13, w, 26, 12); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 6, y + 12); ctx.lineTo(x, y + 19); ctx.lineTo(x + 6, y + 12); ctx.fill();
  ctx.fillStyle = color; ctx.fillText(text, x, y + 1); ctx.textBaseline = 'alphabetic';
}
export function moveAlong(t, dt, speed) {   // يحرّك الشاحنة على مسارها
  if (!t.path || !t.path.length) return false;
  const p = t.path[0], dx = p.x - t.x, dy = p.y - t.y, d = Math.hypot(dx, dy), st = speed * dt;
  if (d <= st) { t.x = p.x; t.y = p.y; t.path.shift(); } else { t.x += dx / d * st; t.y += dy / d * st; }
  return true;
}
