// العناصر التفاعلية في العالم: تُرسم من حالة اللعبة، وتتحرك في المشاهد
import { ar, rr, shade, lerp } from '../core/util.js';
import { PARK, FARM_PARK, PILE, SIGNAL } from './village.js';
import { INK } from '../character/human.js';

export const fx = { particles: [], bubbles: [], floaters: [] };

export function makeTrucks(state) {
  const done = !!state.world.delivered;
  return PARK.map((p, i) => ({ i, x: done ? FARM_PARK[i].x : p.x, y: done ? FARM_PARK[i].y : p.y, path: null, covered: done, sag: 0, flash: 0, shake: 0, cough: 0 }));
}
export function truckColliders(trucks) { return trucks.map(t => ({ x: t.x - 32, y: t.y - 22, w: 64, h: 24 })); }

/* صندوق خشبي ثلاثي الأبعاد: وجه علوي مضاء، ووجه أمامي، وألواح */
export function crate3d(ctx, x, y, w, h) {
  const d = w * .45;
  ctx.fillStyle = '#E2AC6C'; ctx.fillRect(x, y - h - d, w, d);
  ctx.fillStyle = '#C48444'; ctx.fillRect(x, y - h, w, h);
  ctx.strokeStyle = '#8E5A26'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + 1, y - h * .5); ctx.lineTo(x + w - 1, y - h * .5); ctx.moveTo(x + w / 2, y - h - d + 1); ctx.lineTo(x + w / 2, y - h); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.strokeRect(x, y - h - d, w, h + d);
}
/* شاحنة بمنظور ثلاثة أرباع تتجه يميناً: جانب ظاهر بعجلات، وسطح الحمولة يعرض الصناديق فعلياً */
export function drawTruck(ctx, t, load, showLabel) {
  const sx = t.shake ? Math.sin(performance.now() / 30) * 2 : 0;
  ctx.save(); ctx.translate(t.x + sx, t.y + t.sag);
  // الظل الملقى نحو الأسفل يميناً
  ctx.fillStyle = 'rgba(70,42,20,.24)'; ctx.beginPath(); ctx.moveTo(-40, 2); ctx.lineTo(42, 2); ctx.lineTo(56, 12); ctx.lineTo(-26, 12); ctx.closePath(); ctx.fill();
  const body = t.flash ? '#D9483B' : '#D8752C', bed = t.flash ? '#D99A9A' : '#A9B3BE';
  // العجلات (تحت الجانب)
  [-27, 22].forEach(x => { ctx.fillStyle = '#1E1E24'; ctx.beginPath(); ctx.ellipse(x, -1 - t.sag * .4, 7, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#9AA5B1'; ctx.beginPath(); ctx.arc(x, -1 - t.sag * .4, 3, 0, 7); ctx.fill(); });
  // صندوق الحمولة: الجانب ثم السطح المفتوح
  const g = ctx.createLinearGradient(0, -26, 0, -6); g.addColorStop(0, shade(bed, 10)); g.addColorStop(1, shade(bed, -22));
  ctx.fillStyle = g; ctx.fillRect(-40, -26, 54, 20);
  ctx.strokeStyle = 'rgba(40,50,60,.3)'; ctx.lineWidth = 1; for (let x = -32; x < 14; x += 9) { ctx.beginPath(); ctx.moveTo(x, -25); ctx.lineTo(x, -7); ctx.stroke(); }
  ctx.fillStyle = shade(bed, -30); ctx.fillRect(-40, -50, 54, 24);   // أرضية الصندوق (من الأعلى)
  ctx.fillStyle = shade(bed, 18); ctx.fillRect(-40, -52, 54, 3); ctx.fillRect(-40, -52, 3, 26); ctx.fillRect(11, -52, 3, 26);   // حواف الصندوق
  if (t.covered) {
    ctx.fillStyle = '#3F7D5A'; rr(ctx, -41, -54, 56, 30, 5); ctx.fill(); ctx.fillStyle = '#356B4C'; ctx.fillRect(-41, -32, 56, 8);
    ctx.strokeStyle = '#E3D2A8'; ctx.lineWidth = 1.2; for (let x = -32; x < 14; x += 12) { ctx.beginPath(); ctx.moveTo(x, -54); ctx.lineTo(x + 2, -24); ctx.stroke(); }
  } else {
    const n = Math.min(load, 8);
    for (let k = n - 1; k >= 0; k--) { const c = k % 4, r = Math.floor(k / 4); crate3d(ctx, -37 + c * 12.5, -30 - r * 10, 11, 7); }
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-40, -52, 54, 46);
  // المقصورة: سقف، جانب بنافذة وباب، ومصباح أمامي
  ctx.fillStyle = shade(body, 16); rr(ctx, 14, -62, 28, 24, 5); ctx.fill();
  const cg = ctx.createLinearGradient(0, -40, 0, -6); cg.addColorStop(0, body); cg.addColorStop(1, shade(body, -26));
  ctx.fillStyle = cg; rr(ctx, 14, -42, 28, 36, 4); ctx.fill();
  ctx.fillStyle = '#9CC8DA'; rr(ctx, 18, -39, 18, 12, 3); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(19, -28); ctx.lineTo(27, -39); ctx.lineTo(31, -39); ctx.lineTo(22, -28); ctx.fill();
  ctx.fillStyle = '#FFE7A0'; ctx.fillRect(39, -16, 3, 5); ctx.fillStyle = '#3A3A44'; ctx.fillRect(14, -10, 28, 4);
  ctx.strokeStyle = shade(body, -40); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(26, -26); ctx.lineTo(26, -10); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; rr(ctx, 14, -62, 28, 56, 5); ctx.stroke();
  ctx.restore();
  if (showLabel) bubble(ctx, t.x - 10, t.y - 74, ar(load), t.flash ? '#E2475C' : '#2A1B66');
}

/* كومة الصناديق أمام المستودع: صناديق ثلاثية الأبعاد مرصوصة */
export function drawPile(ctx, n) {
  const rows = [6, 5, 5, 4, 3, 1]; let k = 0;
  ctx.save(); ctx.translate(PILE.x, PILE.y);
  ctx.fillStyle = 'rgba(70,42,20,.22)'; ctx.beginPath(); ctx.ellipse(10, 4, 54, 10, 0, 0, 7); ctx.fill();
  const placed = [];
  for (let r = 0; r < rows.length && k < n; r++) { const cnt = Math.min(rows[r], n - k); for (let c = 0; c < cnt; c++, k++) placed.push([-cnt * 8 + c * 16, -r * 12]); }
  placed.forEach(([x, y]) => crate3d(ctx, x, y, 15, 10));
  ctx.restore();
  bubble(ctx, PILE.x, PILE.y - 100, n ? '📦 ' + ar(n) : 'فارغة', '#2A1B66');
}

/* إشارة الانطلاق: عمود بصندوق إشارة ثلاثي الأبعاد وضوء متوهج */
export function drawSignal(ctx, green) {
  const s = SIGNAL;
  ctx.strokeStyle = 'rgba(70,42,20,.22)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + 40, s.y + 24); ctx.stroke();
  ctx.fillStyle = '#3D3A3A'; ctx.fillRect(s.x - 4, s.y - 4, 8, 5);
  ctx.fillStyle = '#55595F'; ctx.fillRect(s.x - 2.5, s.y - 56, 5, 54); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(s.x - 2.5, s.y - 56, 1.5, 54);
  ctx.fillStyle = '#1F2228'; rr(ctx, s.x - 10, s.y - 88, 20, 38, 5); ctx.fill(); ctx.fillStyle = '#33373F'; rr(ctx, s.x - 10, s.y - 92, 20, 6, 3); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; rr(ctx, s.x - 10, s.y - 92, 20, 42, 5); ctx.stroke();
  const lamp = (y, on, col) => { if (on) { ctx.fillStyle = col.replace(')', ',.3)').replace('rgb', 'rgba'); ctx.beginPath(); ctx.arc(s.x, y, 11, 0, 7); ctx.fill(); } ctx.fillStyle = on ? col : '#2E3238'; ctx.beginPath(); ctx.arc(s.x, y, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = '#14161A'; ctx.fillRect(s.x - 7, y - 8, 14, 2.4); };
  lamp(s.y - 78, !green, 'rgb(255,77,94)'); lamp(s.y - 60, green, 'rgb(59,224,122)');
}

/* بقعة زراعة: حفرة بتربة محفورة ووتد خشبي بعلامة */
export function drawSpot(ctx, s, empty) {
  if (!empty) return;
  ctx.fillStyle = '#B08458'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 21, 9.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#6E4A2E'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 1, 13, 5.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,230,190,.25)'; ctx.beginPath(); ctx.ellipse(s.x - 4, s.y - 4, 14, 3, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#7A4A2A'; ctx.fillRect(s.x + 17, s.y - 26, 3, 26); ctx.fillStyle = '#F2E6C9'; rr(ctx, s.x + 9, s.y - 36, 20, 12, 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke();
  ctx.strokeStyle = '#4E7A34'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(s.x + 19, s.y - 26.5); ctx.lineTo(s.x + 19, s.y - 32); ctx.stroke(); ctx.fillStyle = '#79A84A'; ctx.beginPath(); ctx.ellipse(s.x + 16.8, s.y - 31.5, 2.4, 1.2, -.5, 0, 7); ctx.ellipse(s.x + 21.2, s.y - 31.5, 2.4, 1.2, .5, 0, 7); ctx.fill();
}

/* ── مؤثرات: دخان، تراب، فقاعات كلام، أرقام طافية ── */
export function puff(x, y, color, n) {
  for (let i = 0; i < (n || 6); i++) fx.particles.push({ x, y, vx: (Math.random() - .5) * 26, vy: -20 - Math.random() * 25, r: 4 + Math.random() * 5, life: 1, c: color || '#ddd' });
}
export function say(x, y, text, color, ms) { fx.bubbles.push({ x, y, text, color: color || '#2A1B66', until: performance.now() + (ms || 2200) }); }
export function floatUp(x, y, text, color) { fx.floaters.push({ x, y, text, color: color || '#1FA05A', t: 0 }); }
/* شرر الإنجاز: نجوم صغيرة تتطاير وتخفت (ذهبي للنجاح، أخضر للزراعة) */
export function sparkle(x, y, n, color) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 30 + Math.random() * 60; fx.particles.push({ kind: 'spark', x: x + Math.cos(a) * 8, y: y + Math.sin(a) * 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, r: 2 + Math.random() * 2.5, life: 1, c: color || '#FFD45C', spin: Math.random() * 6 }); }
}
/* غبار خفيف تحت القدمين عند الالتقاط والوضع */
export function dust(x, y) { for (let i = 0; i < 5; i++) fx.particles.push({ kind: 'dust', x: x + (Math.random() - .5) * 16, y: y - 2, vx: (Math.random() - .5) * 30, vy: -8 - Math.random() * 10, r: 2.5 + Math.random() * 2, life: .8, c: '#D8C3A0' }); }
export function updateFx(dt) {
  fx.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'spark') { p.vy += 60 * dt; p.vx *= .97; p.life -= dt * 1.1; p.spin += dt * 6; } else { p.r += 6 * dt; p.life -= dt * .9; } });
  fx.particles = fx.particles.filter(p => p.life > 0);
  const now = performance.now(); fx.bubbles = fx.bubbles.filter(b => b.until > now);
  fx.floaters.forEach(f => { f.t += dt; }); fx.floaters = fx.floaters.filter(f => f.t < 1.6);
}
export function drawFx(ctx) {
  fx.particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life) * (p.kind === 'spark' ? 1 : .7); ctx.fillStyle = p.c;
    if (p.kind === 'spark') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin); ctx.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? p.r * .38 : p.r * 1.4, a = k * Math.PI / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
  });
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
