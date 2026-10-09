// الرفيق «سهيل»: جمل صغير ينضم إلى البطل عند المستوى ٢، يتبعه بخطوات مرحة ويكبر مع المستوى. زينة فقط (لا تصادم).
// يُرسم عنصراً قائماً في العرضين، ويمكن إخفاؤه من الحقيبة (state.pet.hidden).
import { game } from '../core/state.js';
import { levelOf } from '../core/levels.js';
import { shade } from '../core/util.js';
import { petLook } from '../ui/minigames.js';

const P = { x: 0, y: 0, phase: 0, moving: false, dir: 1, init: false, v: 0, hop: 0, hopT: 0, sniff: null };
/* يقفز فرحاً مع كل إجابة صحيحة، ويشمّ الكنز القريب (علامة فوق رأسه) */
export const petHop = () => { P.hopT = .55; };
export const setSniff = t => { P.sniff = t || null; };
const TR = [];   // أثر البطل: النقاط التي مشى عليها فعلاً (كلها طرق مفتوحة)
const GAP = 44;  // المسافة التي يقف عندها الجمل خلف البطل
export const petOn = () => { const s = game.state; return !!s && levelOf(s).n >= 2 && !(s.pet && s.pet.hidden); };
/* مكان مفتوح خلف البطل (عند أول ظهور أو بعد انتقال مفاجئ عبر بوابة) */
function placeBehind(pl, blocked) {
  const back = pl.dir === 'left' ? 1 : pl.dir === 'right' ? -1 : 0, up = pl.dir === 'up' ? 1 : pl.dir === 'down' ? -1 : 0;
  const tries = [[back * 40, up * 34], [-34, 8], [34, 8], [0, 34], [0, -30], [-50, 0], [50, 0]];
  for (const [dx, dy] of tries) { const x = pl.x + dx, y = pl.y + dy; if (!blocked || !blocked(x, y)) return { x, y }; }
  return { x: pl.x, y: pl.y + 2 };
}
/* الجمل يمشي على أثر البطل بالضبط فلا يعبر جداراً ولا يعلق خلف عائق، بسرعة تتغير بنعومة،
   ويقف خلف البطل على مسافة، وينتظر إن عاد البطل نحوه بدل أن يمر من خلاله */
export function updatePet(dt, pl, blocked) {
  if (!petOn()) { P.init = false; return; }
  P.hopT = Math.max(0, P.hopT - dt); P.hop = P.hopT > 0 ? Math.abs(Math.sin((.55 - P.hopT) / .55 * Math.PI * 2)) * 14 : 0;
  if (!P.init || Math.hypot(pl.x - (P.hx ?? pl.x), pl.y - (P.hy ?? pl.y)) > 140) {   // أول ظهور أو انتقال مفاجئ
    const q = placeBehind(pl, blocked); P.x = q.x; P.y = q.y; P.v = 0; TR.length = 0; TR.push({ x: P.x, y: P.y }, { x: pl.x, y: pl.y }); P.init = true;
  }
  P.hx = pl.x; P.hy = pl.y;
  const L = TR[TR.length - 1]; if (Math.hypot(pl.x - L.x, pl.y - L.y) > 5) { TR.push({ x: pl.x, y: pl.y }); if (TR.length > 400) TR.shift(); }
  // البطل عاد نحو الجمل: يقف وينتظر، ويبدأ أثراً جديداً من مكانه
  const direct = Math.hypot(pl.x - P.x, pl.y - P.y);
  if (direct < GAP * .8) { TR.length = 0; TR.push({ x: P.x, y: P.y }, { x: pl.x, y: pl.y }); }
  // طول الأثر الباقي من الجمل إلى البطل
  let left = Math.hypot(TR[0].x - P.x, TR[0].y - P.y); for (let i = 1; i < TR.length; i++) left += Math.hypot(TR[i].x - TR[i - 1].x, TR[i].y - TR[i - 1].y);
  const want = left > GAP + 6 ? Math.min(250, 70 + (left - GAP) * 2.2) : 0;   // يسرع إذا ابتعد، ويبطئ ثم يقف قرب البطل
  P.v += (want - P.v) * Math.min(1, dt * (want > P.v ? 5 : 7));
  let step = P.v * dt, mvx = 0;
  while (step > 0 && TR.length > 1) {
    const t0 = TR[0], d = Math.hypot(t0.x - P.x, t0.y - P.y);
    if (d <= step) { mvx += t0.x - P.x; P.x = t0.x; P.y = t0.y; step -= d; TR.shift(); }
    else { const k = step / d; mvx += (t0.x - P.x) * k; P.x += (t0.x - P.x) * k; P.y += (t0.y - P.y) * k; step = 0; }
  }
  P.moving = P.v > 12;
  if (P.moving) { P.phase += P.v * dt * .12; if (Math.abs(mvx) > P.v * dt * .35) P.dir = mvx > 0 ? 1 : -1; }   // يلتفت فقط حين يتغير اتجاه مشيه فعلاً
  else if (pl.dir === 'left' || pl.dir === 'right') P.dir = pl.dir === 'left' ? -1 : 1;   // واقفاً: ينظر حيث ينظر البطل
}
export const petState = () => ({ x: P.x, y: P.y, dir: P.dir, moving: P.moving, v: P.v });   // للاختبار
export const pet3d = () => petOn() && P.init ? Object.assign({ x: P.x, y: P.y, dir: P.dir, moving: P.moving, phase: P.phase, hop: P.hop, k: .95 + Math.min(9, levelOf(game.state).n) * .05 }, petLook()) : null;
export function petItems(view, t, three) {
  const sn = petOn() && P.init && P.sniff ? [{ y: P.y + 2, x: P.x, draw: c => sniffBubble(c, P.x, P.y - (three ? 74 : 62) - P.hop, t) }] : [];
  if (three) return sn;   // في العرض ثلاثي الأبعاد يُرسم الجمل مجسّماً (renderer3d/animals.js)، وفقاعة الشمّ فوقه
  if (!petOn() || !P.init || (view && (P.x < view.x - 60 || P.x > view.x + view.w + 60 || P.y < view.y - 60 || P.y > view.y + view.h + 120))) return [];
  const k = .9 + Math.min(9, levelOf(game.state).n) * .05;
  return [{ y: P.y, x: P.x, draw: c => calf(c, P.x, P.y - P.hop, k, t) }, ...sn];
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
  const LK = petLook(); c.fillStyle = LK.saddle; c.beginPath(); c.moveTo(-9, -26 + B); c.quadraticCurveTo(-1, -29 + B, 8, -26 + B); c.lineTo(9, -18 + B); c.quadraticCurveTo(-1, -16 + B, -10, -18 + B); c.closePath(); c.fill();
  c.fillStyle = '#FFC23D'; c.fillRect(-9.5, -22.5 + B, 18.5, 1.8); if (LK.bells) { c.fillStyle = '#FFC23D'; [0, 1, 2].forEach(i => { c.beginPath(); c.arc(14 + i * 2.4, -27 + B + i * 2.2, 1.6, 0, 7); c.fill(); }); } c.fillStyle = '#1F8A3B'; c.fillRect(-9.5, -20.4 + B, 18.5, 1.2);
  ['#FFC23D', '#fff', '#FFC23D', '#fff', '#FFC23D'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-8 + i * 4, -16.6 + B + Math.sin(t * 4 + i) * .3, 1.1, 0, 7); c.fill(); });
  leg(-11, sw, '#C9955A'); leg(12, -sw, '#C9955A');   // الساقان القريبتان
  c.restore();
}

function sniffBubble(c, x, y, t) {   // «سهيل يشمّ كنزاً»: فقاعة تنبض فوق رأسه
  const k = 1 + Math.sin(t * 6) * .08; c.save(); c.translate(x, y); c.scale(k, k);
  c.fillStyle = '#FFF8E1'; c.strokeStyle = '#E3A21A'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 17, 13, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-4, 12); c.lineTo(0, 19); c.lineTo(4, 12); c.fill(); c.font = '15px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🎁', 0, 1); c.restore();
}
