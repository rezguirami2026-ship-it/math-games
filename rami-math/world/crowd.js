// أهل القرية المتجولون: يزداد عددهم مع تقدّم الطالب (القرية تزدهر بإنجازه). زينة حيّة بلا تصادم ولا مهام،
// يمشون على أرصفة الطريق الرئيسي والطريق الشمالي ذهاباً وإياباً. يُرسمون كطلاب المدرسة: drawNpc في العادي وpeople3d في 3D.
import { game } from '../core/state.js';
const LOOKS = [
  ['man', '#F4F1E8', '#2F6FB2', '#C98E5F'], ['woman', '#7B3F98', '#E3B04B', '#D9A374'], ['boy', '#F7F5EF', '#C0392B', '#B97F52'], ['man', '#EFE6D2', '#2E8B57', '#8B5A38'],
  ['girl', '#D85C7B', '#2E8B57', '#DDA779'], ['woman', '#2F6B73', '#F4F1E8', '#C98E5F'], ['man', '#F7F5EF', '#7A4A2A', '#B97F52'], ['boy', '#EAF2F8', '#2F6FB2', '#D9A374'],
  ['woman', '#B0476A', '#FFC23D', '#B97F52'], ['man', '#F4F1E8', '#5E6B78', '#C98E5F']
];
// مسارات [x1,y1,x2,y2]: أرصفة الطريق الرئيسي (y≈594 و688) والطريق الشمالي (x≈692 و778)
const PATHS = [[790, 594, 1470, 594], [1480, 688, 800, 688], [692, 140, 692, 586], [778, 586, 778, 160], [900, 594, 1400, 594], [1350, 688, 850, 688], [692, 560, 692, 220], [1200, 594, 820, 594], [960, 688, 1460, 688], [778, 240, 778, 570]];
const W = LOOKS.map((l, i) => ({ id: 'crowd' + i, name: 'من أهل القرية', kind: l[0], robe: l[1], accent: l[2], skin: l[3], x: 0, y: 0, phase: 0, dir: 'down', moving: true, anim: null, u: (i * .37) % 1, sp: 38 + (i * 7) % 18, back: false, p: PATHS[i] }));
export const crowdCount = () => { const s = game.state; if (!s || !s.quests) return 0; return Math.min(W.length, Math.floor(Object.keys(s.quests.done || {}).length / 7)); };
export function updateCrowd(dt) {
  const n = crowdCount();
  for (let i = 0; i < n; i++) { const w = W[i], [x1, y1, x2, y2] = w.p, L = Math.hypot(x2 - x1, y2 - y1);
    w.u += (w.back ? -1 : 1) * w.sp * Math.min(.1, dt) / L; if (w.u >= 1) { w.u = 1; w.back = true; } if (w.u <= 0) { w.u = 0; w.back = false; }
    const nx = x1 + (x2 - x1) * w.u, ny = y1 + (y2 - y1) * w.u, dx = nx - w.x, dy = ny - w.y; w.phase += Math.hypot(dx, dy) * .17;
    if (Math.hypot(dx, dy) > .01) w.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); w.x = nx; w.y = ny; }
}
const inV = (v, x, y) => !v || (x > v.x - 80 && x < v.x + v.w + 80 && y > v.y - 60 && y < v.y + v.h + 120);
export const crowdItems = (drawNpc, view) => W.slice(0, crowdCount()).filter(w => inV(view, w.x, w.y)).map(w => ({ y: w.y, x: w.x, lean: .5, draw: c => drawNpc(c, w, null) }));
export const crowdPeople3d = view => W.slice(0, crowdCount()).filter(w => inV(view, w.x, w.y)).map(w => ({ id: w.id, look: w, lookKey: w.id, x: w.x, y: w.y, moving: true, phase: w.phase, dir: w.dir, anim: null, animT: 0 }));
