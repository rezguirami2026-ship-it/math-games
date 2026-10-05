// إيجاد الطريق (A*): البطل يلتف حول المباني والشاحنات بنفسه
import { WORLD } from './village.js';
const C = 20, COLS = Math.ceil(WORLD.w / C), ROWS = Math.ceil(WORLD.h / C);
export function findPath(sx, sy, tx, ty, blocked) {
  const free = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS && !blocked(c * C + C / 2, r * C + C / 2);
  const clear = (a, b) => { const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 6); for (let i = 1; i <= n; i++) { const t = i / n; if (blocked(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false; } return true; };
  const start = { x: sx, y: sy }, goal = { x: tx, y: ty };
  if (!blocked(tx, ty) && clear(start, goal)) return [goal];
  let sc = Math.floor(sx / C), sr = Math.floor(sy / C), tc = Math.floor(tx / C), tr = Math.floor(ty / C);
  if (!free(tc, tr)) {   // أقرب خلية متاحة إلى الهدف
    let best = null, bd = 1e9;
    for (let r = -6; r <= 6; r++) for (let c = -6; c <= 6; c++) if (free(tc + c, tr + r)) { const d = c * c + r * r; if (d < bd) { bd = d; best = [tc + c, tr + r]; } }
    if (!best) return []; [tc, tr] = best; goal.x = tc * C + C / 2; goal.y = tr * C + C / 2;
  }
  const key = (c, r) => r * COLS + c, g = new Map([[key(sc, sr), 0]]), from = new Map(), open = [[0, sc, sr]], closed = new Set();
  const h = (c, r) => Math.hypot(c - tc, r - tr);
  let found = false, guard = 0;
  while (open.length && guard++ < 6000) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, c, r] = open.splice(bi, 1)[0], k = key(c, r);
    if (closed.has(k)) continue; closed.add(k);
    if (c === tc && r === tr) { found = true; break; }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nc = c + dc, nr = r + dr; if (!free(nc, nr)) continue;
      if (dc && dr && (!free(c + dc, r) || !free(c, r + dr))) continue;   // لا قطع للزوايا
      const nk = key(nc, nr), ng = g.get(k) + (dc && dr ? 1.414 : 1);
      if (ng < (g.has(nk) ? g.get(nk) : 1e9)) { g.set(nk, ng); from.set(nk, k); open.push([ng + h(nc, nr), nc, nr]); }
    }
  }
  if (!found) return [];
  const cells = []; let k = key(tc, tr);
  while (k !== undefined && k !== key(sc, sr)) { cells.unshift({ x: (k % COLS) * C + C / 2, y: Math.floor(k / COLS) * C + C / 2 }); k = from.get(k); }
  if (cells.length) cells[cells.length - 1] = goal;
  const out = []; let cur = start, i = 0;   // تنعيم: تخطٍّ ما دام الخط مكشوفاً
  while (i < cells.length) { let j = cells.length - 1; while (j > i && !clear(cur, cells[j])) j--; out.push(cells[j]); cur = cells[j]; i = j + 1; }
  return out;
}
