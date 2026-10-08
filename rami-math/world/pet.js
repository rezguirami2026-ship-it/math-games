// الرفيق «سهيل»: جمل صغير ينضم إلى البطل عند المستوى ٢، يتبعه بخطوات مرحة ويكبر مع المستوى. زينة فقط (لا تصادم).
// يُرسم عنصراً قائماً في العرضين، ويمكن إخفاؤه من الحقيبة (state.pet.hidden).
import { game } from '../core/state.js';
import { levelOf } from '../core/levels.js';
import { shade } from '../core/util.js';

const P = { x: 0, y: 0, phase: 0, moving: false, dir: 1, init: false };
export const petOn = () => { const s = game.state; return !!s && levelOf(s).n >= 2 && !(s.pet && s.pet.hidden); };
export function updatePet(dt, pl) {
  if (!petOn()) { P.init = false; return; }
  if (!P.init) { P.x = pl.x - 30; P.y = pl.y + 6; P.init = true; }
  const tx = pl.x - 34 * (pl.dir === 'left' ? -1 : 1), ty = pl.y + 8, dx = tx - P.x, dy = ty - P.y, d = Math.hypot(dx, dy);
  if (d > 260) { P.x = tx; P.y = ty; }   // انتقل البطل بعيداً (بوابة أو انتقال): يلحق به فوراً
  P.moving = d > 6; if (P.moving) { const sp = Math.min(d, (d > 60 ? 230 : 140) * dt); P.x += dx / d * sp; P.y += dy / d * sp; P.phase += sp * .12; }
  // ينظر حيث ينظر البطل (يمين/يسار)؛ وحين يمشي البطل للأعلى أو الأسفل يتبع اتجاه حركته الأفقية
  if (pl.dir === 'left') P.dir = -1; else if (pl.dir === 'right') P.dir = 1; else if (P.moving && Math.abs(dx) > 4) P.dir = dx > 0 ? 1 : -1;
}
export function petItems(view, t) {
  if (!petOn() || !P.init || (view && (P.x < view.x - 60 || P.x > view.x + view.w + 60 || P.y < view.y - 60 || P.y > view.y + view.h + 120))) return [];
  const k = .9 + Math.min(9, levelOf(game.state).n) * .05;
  return [{ y: P.y, x: P.x, draw: c => calf(c, P.x, P.y, k, t) }];
}
function calf(c, x, y, k, t) {
  const mv = P.moving, ph = P.phase, bob = mv ? Math.abs(Math.sin(ph)) * 1.8 : Math.sin(t * 2) * .5, sw = mv ? Math.sin(ph) * 4 : 0;
  const nod = mv ? Math.sin(ph * 2) * 1.2 : Math.sin(t * 1.3) * .8, blink = (t % 4) < .12, tail = Math.sin(t * 3) * .25;
  const line = 'rgba(92,56,24,.55)', B = -bob;
  c.save(); c.translate(x, y); c.scale(P.dir * k, k); c.lineCap = 'round'; c.lineJoin = 'round';
  c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(3, 0, 17, 4.2, 0, 0, 7); c.fill();   // الظل
  const leg = (hx, s, col) => { c.strokeStyle = col; c.lineWidth = 3.2; c.beginPath(); c.moveTo(hx, -17 + B); c.lineTo(hx + s * .5, -8); c.lineTo(hx + s, -.5); c.stroke();
    c.fillStyle = shade(col, -25); c.beginPath(); c.ellipse(hx + s + .6, -.4, 2.2, 1.1, 0, 0, 7); c.fill(); };
  leg(-8, -sw, '#B47D45'); leg(9, sw, '#B47D45');   // الساقان البعيدتان (أغمق)
  c.strokeStyle = '#B98A55'; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, -21 + B); c.quadraticCurveTo(-18, -16 + B, -16 + tail * 4, -11 + B); c.stroke();   // الذيل
  c.fillStyle = '#7A5230'; c.beginPath(); c.arc(-16 + tail * 4, -10.5 + B, 1.4, 0, 7); c.fill();
  const g = c.createLinearGradient(0, -36 + B, 0, -12 + B); g.addColorStop(0, '#EDC690'); g.addColorStop(1, '#C98F52');
  c.fillStyle = g; c.strokeStyle = line; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-15, -19 + B); c.quadraticCurveTo(-15, -26 + B, -9, -26 + B); c.bezierCurveTo(-6, -38 + B, 4, -38 + B, 7, -27 + B);   // الظهر والسنام
  c.quadraticCurveTo(12, -26 + B, 13, -22 + B); c.bezierCurveTo(16, -27 + B, 18, -33 + B + nod, 19, -37 + B + nod);   // الرقبة صاعدة
  c.lineTo(23, -36 + B + nod); c.bezierCurveTo(21, -31 + B + nod, 19, -23 + B, 14, -16 + B); c.quadraticCurveTo(0, -12 + B, -12, -14 + B); c.quadraticCurveTo(-16, -15 + B, -15, -19 + B); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,240,210,.35)'; c.beginPath(); c.ellipse(-1, -31 + B, 5, 2.5, -.2, 0, 7); c.fill();   // لمعة السنام
  // الرأس: جمجمة وخطم أفتح وأذن وعين
  const hy = -38 + B + nod; c.fillStyle = '#E2B479'; c.beginPath(); c.ellipse(22, hy, 5.6, 3.9, .15, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#EED0A0'; c.beginPath(); c.ellipse(27, hy + 1.6, 3.6, 2.8, .2, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6B4520'; c.beginPath(); c.arc(29.3, hy + 1, .7, 0, 7); c.fill(); c.strokeStyle = '#8A5A2E'; c.lineWidth = .8; c.beginPath(); c.moveTo(26.5, hy + 3.4); c.quadraticCurveTo(28, hy + 4.2, 29.5, hy + 3); c.stroke();
  c.fillStyle = '#C48A4E'; c.beginPath(); c.ellipse(18.6, hy - 3.2, 1.6, 2.7, -.6, 0, 7); c.fill();
  if (blink) { c.strokeStyle = '#2A1B66'; c.lineWidth = .9; c.beginPath(); c.moveTo(21.2, hy - .8); c.lineTo(23.6, hy - .8); c.stroke(); }
  else { c.fillStyle = '#fff'; c.beginPath(); c.arc(22.6, hy - .9, 1.5, 0, 7); c.fill(); c.fillStyle = '#2A1B66'; c.beginPath(); c.arc(23, hy - .8, .9, 0, 7); c.fill(); }
  // بطانية مزخرفة على الظهر بشراريب
  c.fillStyle = '#C8102E'; c.beginPath(); c.moveTo(-9, -26 + B); c.quadraticCurveTo(-1, -29 + B, 8, -26 + B); c.lineTo(9, -18 + B); c.quadraticCurveTo(-1, -16 + B, -10, -18 + B); c.closePath(); c.fill();
  c.fillStyle = '#FFC23D'; c.fillRect(-9.5, -22.5 + B, 18.5, 1.8); c.fillStyle = '#1F8A3B'; c.fillRect(-9.5, -20.4 + B, 18.5, 1.2);
  ['#FFC23D', '#fff', '#FFC23D', '#fff', '#FFC23D'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-8 + i * 4, -16.6 + B + Math.sin(t * 4 + i) * .3, 1.1, 0, 7); c.fill(); });
  leg(-11, sw, '#C9955A'); leg(12, -sw, '#C9955A');   // الساقان القريبتان
  c.restore();
}
