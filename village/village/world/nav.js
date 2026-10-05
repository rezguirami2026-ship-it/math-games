// إيجاد الطريق (A*) بكومة ثنائية: سريع حتى في الخريطة الكبيرة
import { WORLD } from './village.js';
const C = 20, COLS = Math.ceil(WORLD.w / C), ROWS = Math.ceil(WORLD.h / C);
function heap() {
  const a = [];
  return {
    get size() { return a.length; },
    push(n) { a.push(n); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } },
    pop() { const top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  };
}
export function findPath(sx, sy, tx, ty, blocked) {
  const free = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS && !blocked(c * C + C / 2, r * C + C / 2);
  const clear = (a, b) => { const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 6); for (let i = 1; i <= n; i++) { const t = i / n; if (blocked(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false; } return true; };
  const start = { x: sx, y: sy }, goal = { x: tx, y: ty };
  if (!blocked(tx, ty) && clear(start, goal)) return [goal];
  let sc = Math.floor(sx / C), sr = Math.floor(sy / C), tc = Math.floor(tx / C), tr = Math.floor(ty / C);
  if (!free(tc, tr)) {
    let best = null, bd = 1e9;
    for (let r = -6; r <= 6; r++) for (let c = -6; c <= 6; c++) if (free(tc + c, tr + r)) { const d = c * c + r * r; if (d < bd) { bd = d; best = [tc + c, tr + r]; } }
    if (!best) return []; [tc, tr] = best; goal.x = tc * C + C / 2; goal.y = tr * C + C / 2;
  }
  const key = (c, r) => r * COLS + c, g = new Map([[key(sc, sr), 0]]), from = new Map(), open = heap(), closed = new Set();
  open.push([0, sc, sr]);
  let found = false, guard = 0;
  while (open.size && guard++ < 40000) {
    const [, c, r] = open.pop(), k = key(c, r);
    if (closed.has(k)) continue; closed.add(k);
    if (c === tc && r === tr) { found = true; break; }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nc = c + dc, nr = r + dr; if (!free(nc, nr)) continue;
      if (dc && dr && (!free(c + dc, r) || !free(c, r + dr))) continue;
      const nk = key(nc, nr), ng = g.get(k) + (dc && dr ? 1.414 : 1);
      if (ng < (g.has(nk) ? g.get(nk) : 1e9)) { g.set(nk, ng); from.set(nk, k); open.push([ng + Math.hypot(nc - tc, nr - tr), nc, nr]); }
    }
  }
  if (!found) return [];
  const cells = []; let k = key(tc, tr);
  while (k !== undefined && k !== key(sc, sr)) { cells.unshift({ x: (k % COLS) * C + C / 2, y: Math.floor(k / COLS) * C + C / 2 }); k = from.get(k); }
  if (cells.length) cells[cells.length - 1] = goal;
  const out = []; let cur = start, i = 0;
  while (i < cells.length) { let j = cells.length - 1; while (j > i && !clear(cur, cells[j])) j--; out.push(cells[j]); cur = cells[j]; i = j + 1; }
  return out;
}
