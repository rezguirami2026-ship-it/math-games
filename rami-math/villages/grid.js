// نموذج القرية المشترك بين العرضين بوحدات العالم المفتوح نفسها (البكسل = وحدة واحدة في 3D): مقاس القرية،
// ومستطيلات التصادم (المباني والجبل والأكشاك)، ودوائر العوائق (النخيل والبئر والناس)، وإيجاد الطريق A* على شبكة خلايا ٢٠.
export const CELL = 20;

export function buildGrid(def) {
  const W = def.size.w, H = def.size.h, C = Math.ceil(W / CELL), Rw = Math.ceil(H / CELL);
  const rects = (def.solids || []).slice(), extra = [];   // extra: دوائر {x, y, r, on?()} تتغير أثناء اللعب
  const inRect = (x, y, r) => rects.some(q => x + r > q.x && x - r < q.x + q.w && y + r > q.y && y - r < q.y + q.h);
  const blocked = (x, y, r = 11) => x < r || y < r || x > W - r || y > H - r || inRect(x, y, r) || extra.some(o => (!o.on || o.on()) && Math.hypot(x - o.x, y - o.y) < o.r + r);
  const solid = (cx, cy) => blocked(cx * CELL + CELL / 2, cy * CELL + CELL / 2, 9);
  return { W, H, rects, extra, blocked, findPath: (a, b) => findPath(C, Rw, solid, a, b, blocked) };
}

/* A* على مراكز الخلايا بثمانية اتجاهات، بحد أعلى للخطوات (لا حلقة بلا نهاية)، ثم تنعيم بخطوط مستقيمة خالية */
export function findPath(C, Rw, solid, a, b, blocked) {
  const toC = p => [Math.max(0, Math.min(C - 1, Math.floor(p.x / CELL))), Math.max(0, Math.min(Rw - 1, Math.floor(p.y / CELL)))];
  const [sx, sy] = toC(a); let [tx, ty] = toC(b);
  if (solid(tx, ty)) {   // نقرة على مبنى أو صخرة: أقرب خلية حرة حولها
    let best = null, bd = 1e9;
    for (let r = 1; r <= 6 && !best; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++)
      if (x >= 0 && y >= 0 && x < C && y < Rw && !solid(x, y)) { const d = Math.hypot(x - tx, y - ty); if (d < bd) { bd = d; best = [x, y]; } }
    if (!best) return []; [tx, ty] = best; b = { x: tx * CELL + CELL / 2, y: ty * CELL + CELL / 2 };
  }
  const N = C * Rw, g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N), open = [];
  const push = (f, i) => { open.push([f, i]); let k = open.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (open[p][0] <= open[k][0]) break; [open[p], open[k]] = [open[k], open[p]]; k = p; } };
  const pop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < open.length && open[l][0] < open[m][0]) m = l; if (r < open.length && open[r][0] < open[m][0]) m = r; if (m === k) break; [open[m], open[k]] = [open[k], open[m]]; k = m; } } return top; };
  const s = sy * C + sx, t = ty * C + tx, h = (x, y) => Math.hypot(x - tx, y - ty);
  g[s] = 0; push(h(sx, sy), s);
  let steps = 0;
  while (open.length && steps++ < N * 4) {
    const [, i] = pop(); if (i === t) break; if (shut[i]) continue; shut[i] = 1;
    const x = i % C, y = (i / C) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= C || ny >= Rw || solid(nx, ny)) continue;
      if (dx && dy && (solid(x + dx, y) || solid(x, y + dy))) continue;
      const j = ny * C + nx, ng = g[i] + (dx && dy ? 1.4142 : 1);
      if (ng < g[j]) { g[j] = ng; from[j] = i; push(ng + h(nx, ny), j); }
    }
  }
  if (from[t] < 0 && t !== s) return [];
  const pts = []; for (let i = t; i !== s && i >= 0; i = from[i]) pts.push({ x: (i % C) * CELL + CELL / 2, y: ((i / C) | 0) * CELL + CELL / 2 });
  pts.reverse(); if (pts.length) pts[pts.length - 1] = { x: b.x, y: b.y };
  const clear = (p, q) => { const n = Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / 8); for (let k = 1; k < n; k++) { const u = k / n; if (blocked(p.x + (q.x - p.x) * u, p.y + (q.y - p.y) * u, 10)) return false; } return true; };
  const out = []; let cur = { x: a.x, y: a.y };
  for (let k = 0; k < pts.length; k++) { if (k + 1 < pts.length && clear(cur, pts[k + 1])) continue; out.push(pts[k]); cur = pts[k]; }
  return out;
}
