// طلاب المدرسة: زينة حيّة في ساحة المدرسة (لا تصادم ولا مهام). أربعة يلعبون الكرة حول الملعب وراء الكرة، وبنتان تقفزان بالحبل أمام الباب.
// يُرسمون بالأدوات نفسها: drawNpc في العرض العادي، وقائمة people3d في 3D.
import { PITCH, SCHOOL } from './village.js';

const KIDS = [
  { id: 'kid0', name: 'طالب', kind: 'boy', robe: '#F7F5EF', accent: '#2F6FB2', skin: '#B97F52', role: 'ball', k: 0 },
  { id: 'kid1', name: 'طالب', kind: 'boy', robe: '#EAF2F8', accent: '#C0392B', skin: '#D9A374', role: 'ball', k: 1 },
  { id: 'kid2', name: 'طالب', kind: 'boy', robe: '#F7F5EF', accent: '#2E8B57', skin: '#8B5A38', role: 'ball', k: 2 },
  { id: 'kid3', name: 'طالب', kind: 'boy', robe: '#FFF8E7', accent: '#7B3F98', skin: '#C98E5F', role: 'ball', k: 3 },
  { id: 'kid4', name: 'طالبة', kind: 'girl', robe: '#B0476A', accent: '#FFC23D', skin: '#DDA779', role: 'rope', k: 0 },
  { id: 'kid5', name: 'طالبة', kind: 'girl', robe: '#2F6B73', accent: '#F4F1E8', skin: '#C98E5F', role: 'rope', k: 1 }
].map(k => Object.assign(k, { x: 0, y: 0, phase: 0, dir: 'down', moving: false, anim: null }));
const ball = { x: PITCH.x + PITCH.w / 2, y: PITCH.y + PITCH.h / 2, h: 0 };
const C = { x: PITCH.x + PITCH.w / 2, y: PITCH.y + PITCH.h / 2 + 4 }, RX = PITCH.w / 2 - 26, RY = PITCH.h / 2 - 18;
const ROPE = { x: SCHOOL.x + SCHOOL.w / 2, y: SCHOOL.y + SCHOOL.h + 12 };

let clock = 0;
export function updateKids(dt) {
  const t = clock += Math.max(0, Math.min(.1, dt || 0));   // ساعة خاصة بالطلاب
  KIDS.forEach(k => {
    if (k.role === 'ball') {   // يدورون حول الملعب بسرعات مختلفة قليلاً، ويتجهون نحو الكرة
      const a = t * (.55 + k.k * .06) + k.k * Math.PI / 2, nx = C.x + Math.cos(a) * RX * (1 - k.k * .08), ny = C.y + Math.sin(a) * RY * (1 - k.k * .1);
      const dx = nx - k.x, dy = ny - k.y; k.moving = Math.hypot(dx, dy) > .05; k.phase += Math.hypot(dx, dy) * .17;
      if (k.moving) k.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      k.x = nx; k.y = ny; k.anim = null;
    } else { k.x = ROPE.x + (k.k ? 30 : -30); k.y = ROPE.y; k.moving = false; k.dir = k.k ? 'left' : 'right'; k.anim = { name: 'celebrate', t: (t * 1.3 + k.k * .5) % 1 }; }
  });
  // الكرة أمام اللاعب الذي معه الدور (يتبدل كل ثانيتين ونصف)، تقفز قليلاً
  const lead = KIDS[(Math.floor(t / 2.5) % 4 + 4) % 4], ox = { right: 12, left: -12 }[lead.dir] || 0, oy = { down: 10, up: -10 }[lead.dir] || 0;
  ball.x += (lead.x + ox - ball.x) * .18; ball.y += (lead.y + oy - ball.y) * .18; ball.h = Math.abs(Math.sin(t * 7)) * 6;
}
const inV = (v, x, y) => !v || (x > v.x - 80 && x < v.x + v.w + 80 && y > v.y - 60 && y < v.y + v.h + 120);
/* للعرض العادي ولطبقة 3D: عناصر قائمة (الكرة والحبل، والطلاب في العرض العادي فقط) */
export function kidsItems(drawNpc, view, three) {
  if (!inV(view, C.x, C.y)) return [];
  const out = [{ y: ball.y, x: ball.x, draw: c => { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(ball.x + 2, ball.y + 1, 5, 2, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ball.x, ball.y - 5 - ball.h, 5, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#222'; c.beginPath(); c.arc(ball.x, ball.y - 5 - ball.h, 1.8, 0, 7); c.fill(); } }];
  const r = KIDS[4], swing = Math.sin((r.anim ? r.anim.t : 0) * Math.PI * 2);
  out.push({ y: ROPE.y + 1, x: ROPE.x, draw: c => { c.strokeStyle = '#E2475C'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ROPE.x - 26, ROPE.y - 16); c.quadraticCurveTo(ROPE.x, ROPE.y - 16 + swing * 22, ROPE.x + 26, ROPE.y - 16); c.stroke(); } });
  if (!three) KIDS.forEach(k => out.push({ y: k.y, x: k.x, lean: .5, draw: cc => drawNpc(cc, k, null) }));
  return out;
}
export function kidsPeople3d(view) {
  return KIDS.filter(k => inV(view, k.x, k.y)).map(k => ({ id: k.id, look: k, lookKey: k.id, x: k.x, y: k.y, moving: k.moving, phase: k.phase, dir: k.dir, anim: k.anim && !k.moving ? k.anim.name : null, animT: k.anim ? k.anim.t : 0, carry: 0 }));
}
