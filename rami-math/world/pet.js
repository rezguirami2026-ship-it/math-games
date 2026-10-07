// الرفيق «سهيل»: جمل صغير ينضم إلى البطل عند المستوى ٢، يتبعه بخطوات مرحة ويكبر مع المستوى. زينة فقط (لا تصادم).
// يُرسم عنصراً قائماً في العرضين، ويمكن إخفاؤه من الحقيبة (state.pet.hidden).
import { game } from '../core/state.js';
import { levelOf } from '../core/levels.js';

const P = { x: 0, y: 0, phase: 0, moving: false, dir: 1, init: false };
export const petOn = () => { const s = game.state; return !!s && levelOf(s).n >= 2 && !(s.pet && s.pet.hidden); };
export function updatePet(dt, pl) {
  if (!petOn()) { P.init = false; return; }
  if (!P.init) { P.x = pl.x - 30; P.y = pl.y + 6; P.init = true; }
  const tx = pl.x - 34 * (pl.dir === 'left' ? -1 : 1), ty = pl.y + 8, dx = tx - P.x, dy = ty - P.y, d = Math.hypot(dx, dy);
  if (d > 260) { P.x = tx; P.y = ty; }   // انتقل البطل بعيداً (بوابة أو انتقال): يلحق به فوراً
  P.moving = d > 6; if (P.moving) { const sp = Math.min(d, (d > 60 ? 230 : 140) * dt); P.x += dx / d * sp; P.y += dy / d * sp; P.phase += sp * .12; if (Math.abs(dx) > 2) P.dir = dx > 0 ? 1 : -1; }
}
export function petItems(view, t) {
  if (!petOn() || !P.init || (view && (P.x < view.x - 60 || P.x > view.x + view.w + 60 || P.y < view.y - 60 || P.y > view.y + view.h + 120))) return [];
  const k = .75 + Math.min(9, levelOf(game.state).n) * .05;
  return [{ y: P.y, x: P.x, draw: c => calf(c, P.x, P.y, k, t) }];
}
function calf(c, x, y, k, t) {
  const bob = P.moving ? Math.abs(Math.sin(P.phase)) * 2 : Math.sin(t * 2) * .6, leg = P.moving ? Math.sin(P.phase) * 3 : 0;
  c.save(); c.translate(x, y); c.scale(P.dir * k, k);
  c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(4, 0, 15, 4, 0, 0, 7); c.fill();
  c.fillStyle = '#C9955A'; [[-9, leg], [-4, -leg], [5, leg], [10, -leg]].forEach(([lx, sw]) => c.fillRect(lx + sw * .4, -14, 3, 14));
  c.fillStyle = '#D9A86C'; c.beginPath(); c.ellipse(0, -18 - bob, 14, 7, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-1, -23 - bob, 7, 5, 0, 0, 7); c.fill();   // الجسم والسنام
  c.beginPath(); c.moveTo(10, -20 - bob); c.quadraticCurveTo(17, -26 - bob, 16, -34 - bob); c.lineTo(21, -34 - bob); c.quadraticCurveTo(22, -24 - bob, 14, -16 - bob); c.fill();   // الرقبة
  c.beginPath(); c.ellipse(21, -35 - bob, 5.5, 3.6, .1, 0, 7); c.fill();   // الرأس
  c.fillStyle = '#B0773E'; c.beginPath(); c.ellipse(18, -38 - bob, 1.6, 2.6, -.4, 0, 7); c.fill();   // الأذن
  c.fillStyle = '#2A1B66'; c.beginPath(); c.arc(22, -36 - bob, 1.1, 0, 7); c.fill();
  c.fillStyle = '#E2475C'; c.fillRect(-6, -21 - bob, 12, 2.2); c.fillStyle = '#FFC23D'; c.fillRect(-2, -21 - bob, 4, 2.2);   // حزام مزخرف
  c.restore();
}
