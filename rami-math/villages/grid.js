// نموذج القرية المشترك بين العرضين: شبكة بلاطات (وحدة الطول = بلاطة)، الارتفاعات، التصادم، وإيجاد الطريق.
// الخريطة نصوص (سطر لكل صف، حرف لكل بلاطة) وقاموس legend يحدد لكل حرف: نوع الأرض floor، أو جداراً wall بارتفاعه h.
// العرضان (view3d/view2d) يرسمان هذا النموذج نفسه، فاللعب واحد فيهما.

export function buildGrid(def) {
  const rows = def.map, H = rows.length, W = Math.max(...rows.map(r => r.length));
  const cells = new Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = rows[y][x] || ' ', lg = def.legend[ch] || def.legend[' '] || { wall: 'void', h: 0 };
    cells[y * W + x] = { ch, x, y, ...lg };
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : cells[y * W + x];
  const solidCell = (x, y) => { const c = at(x, y); return !c || !!c.wall || !!c.block; };
  const extra = [];   // عوائق إضافية متغيرة (أبواب مغلقة، أجسام): دوائر {x, y, r, on()}
  const blocked = (px, py, r = .28) => {   // البطل دائرة نصف قطرها r بوحدة البلاطة
    for (const [dx, dy] of [[-r, -r], [r, -r], [-r, r], [r, r], [0, 0]]) if (solidCell(Math.floor(px + dx), Math.floor(py + dy))) return true;
    for (const o of extra) if ((!o.on || o.on()) && Math.hypot(px - o.x, py - o.y) < o.r + r) return true;
    return false;
  };
  return { W, H, cells, at, solidCell, blocked, extra, findPath: (a, b) => findPath(W, H, (x, y) => blocked(x + .5, y + .5, .2), a, b) };
}

/* A* على مراكز البلاطات بثمانية اتجاهات (القطري لا يقطع زاوية جدار). يعيد نقاطاً بوحدة البلاطة، أو [] إن لم يوجد طريق */
export function findPath(W, H, solid, a, b) {
  const sx = Math.floor(a.x), sy = Math.floor(a.y); let tx = Math.floor(b.x), ty = Math.floor(b.y);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return [];
  if (solid(tx, ty)) {   // الهدف داخل جدار (نقرة على صخرة أو طاولة): أقرب بلاطة حرة حوله
    let best = null, bd = 1e9;
    for (let r = 1; r <= 3 && !best; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++)
      if (x >= 0 && y >= 0 && x < W && y < H && !solid(x, y)) { const d = Math.hypot(x - tx, y - ty); if (d < bd) { bd = d; best = [x, y]; } }
    if (!best) return []; [tx, ty] = best;
  }
  const N = W * H, g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
  const open = [], push = (f, i) => { open.push([f, i]); let k = open.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (open[p][0] <= open[k][0]) break; [open[p], open[k]] = [open[k], open[p]]; k = p; } };
  const pop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < open.length && open[l][0] < open[m][0]) m = l; if (r < open.length && open[r][0] < open[m][0]) m = r; if (m === k) break; [open[m], open[k]] = [open[k], open[m]]; k = m; } } return top; };
  const s = sy * W + sx, t = ty * W + tx, h = (x, y) => Math.hypot(x - tx, y - ty);
  g[s] = 0; push(h(sx, sy), s);
  let steps = 0;
  while (open.length && steps++ < N * 4) {   // حد أعلى للخطوات: لا حلقة بلا نهاية
    const [, i] = pop(); if (i === t) break; if (shut[i]) continue; shut[i] = 1;
    const x = i % W, y = (i / W) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || solid(nx, ny)) continue;
      if (dx && dy && (solid(x + dx, y) || solid(x, y + dy))) continue;
      const j = ny * W + nx, ng = g[i] + (dx && dy ? 1.4142 : 1);
      if (ng < g[j]) { g[j] = ng; from[j] = i; push(ng + h(nx, ny), j); }
    }
  }
  if (from[t] < 0 && t !== s) return [];
  const out = []; for (let i = t; i !== s && i >= 0; i = from[i]) out.push({ x: i % W + .5, y: ((i / W) | 0) + .5 });
  out.reverse();
  // تنعيم: نحذف النقاط التي يُرى ما بعدها مباشرة (خط مستقيم بلا عائق)
  const clear = (p, q) => { const n = Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) * 3); for (let k = 1; k < n; k++) { const u = k / n; if (solid(Math.floor(p.x + (q.x - p.x) * u), Math.floor(p.y + (q.y - p.y) * u))) return false; } return true; };
  const sm = []; let cur = { x: a.x, y: a.y };
  for (let k = 0; k < out.length; k++) { if (k + 1 < out.length && clear(cur, out[k + 1])) continue; sm.push(out[k]); cur = out[k]; }
  if (sm.length) sm[sm.length - 1] = { x: Math.min(Math.max(b.x, tx), tx + 1), y: Math.min(Math.max(b.y, ty), ty + 1) };
  return sm;
}
