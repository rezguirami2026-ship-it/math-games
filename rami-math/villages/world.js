// عالم الصف الواحد المتصل (الصفان ٨ و٩) كالعالم المفتوح في الصفوف ٥–٧: القرى متجاورة من الغرب إلى الشرق على الطريق الكبير نفسه،
// وبين كل قريتين وادٍ جاف عليه جسر الطريق، وسور حجري يمتد شمالاً وجنوباً ببوابة على الطريق (برجان وحاجز يرتفع) تُفتح بإنهاء دروس
// القرية التي غربها. كل قرية تبقى بملفها وإحداثياتها المحلية (villages/g<الصف>/<القرية>/index.js): هنا تُزاح بـ ox فقط.
// يعيد def مركّباً بعقد القرية نفسه (runtime.js وview2d.js وview3d.js لا تعرف أنها عالم): الأرض والعناصر والمجسّمات من القرى
// القريبة من البطل فقط، والمجسّمات تُبنى حين يقترب منها أول مرة.
import { CAM, pattern, upright, signboard, stoneBox, sidrCached, boxShadow, shade } from '../world/art.js';

export const CW = 420;   // عرض الوادي بين قريتين
const NEAR = 2600;       // ما يُرسم من القرى حول البطل (بكسل)

export function composeWorld(entries) {
  // entries: [{ u, def, next: { name, icon, built } | null }] بالترتيب
  const regions = [], connectors = []; let x = 0;
  entries.forEach((e, i) => {
    const d = e.def, w = d.size.w, R = { i, u: e.u, def: d, ox: x, w, cx: x + w / 2 };
    R.local = Object.assign(Object.create(d), { _inWorld: true });
    regions.push(R); x += w;
    if (e.next) {   // وادٍ وسور ببوابة شرق القرية (إلى التالية، أو مغلقة إن لم تُبنَ)
      const road = d.STREET ? d.STREET.road : { y0: 1196, y1: 1284 };
      connectors.push({ x0: x, x1: x + CW, wx: x + 70, y0: road.y0, y1: road.y1, u: e.u, region: i, label: `${e.next.icon} ${e.next.name}`, built: e.next.built, open: 0, want: false, seen: false, last: i === entries.length - 1 });
      x += CW;
    }
  });
  const H = Math.max(...regions.map(r => r.def.size.h)), W = x;
  const shift = (o, ox) => ({ ...o, x: o.x + ox });
  const regionAt = gx => { let best = regions[0]; regions.forEach(r => { if (gx >= r.ox - CW / 2) best = r; }); return best; };

  // التصادم: مستطيلات القرى مزاحة، والوادي صلب إلا الطريق وأرصفته
  const solids = [], obstacles = [], stations = [], people = [], walkers = [];
  regions.forEach(R => { const o = R.ox, d = R.def;
    (d.solids || []).forEach(s => solids.push({ ...s, x: s.x + o }));
    (d.obstacles || []).forEach(s => obstacles.push(shift(s, o)));
    (d.stations || []).forEach(s => stations.push({ ...s, x: s.x + o, stand: s.stand ? shift(s.stand, o) : undefined, _u: R.u, _local: s, _R: R }));
    (d.people || []).forEach(p => people.push({ ...p, x: p.x + o, _u: R.u }));
    (d.walkers || []).forEach(w => walkers.push({ ...w, path: w.path.map(([a, b]) => [a + o, b]) })); });
  connectors.forEach(C => { solids.push({ x: C.x0, y: 0, w: CW, h: C.y0 - 28 }, { x: C.x0, y: C.y1 + 28, w: CW, h: H - C.y1 - 28 }); });
  if (!connectors.length || !connectors[connectors.length - 1].last) solids.push({ x: W - 4, y: 0, w: 4, h: H });

  // حياة القرى: كل قرية تُحدَّث بنسخة من الحالة إحداثياتها محلية، وما تضيفه من مارّة (أطفال، دراجة، جالسون) يُعاد مزاحاً
  const wrapped = new WeakMap();
  const wrapW = (w, ox) => { let p = wrapped.get(w); if (!p) { p = new Proxy(w, { get: (t, k) => k === 'x' ? t.x + ox : t[k] }); wrapped.set(w, p); } return p; };
  const subSt = R => { if (!R.st) R.st = {}; return R.st; };
  const bindSt = (R, st) => { const s = subSt(R); if (Object.getPrototypeOf(s) !== st) Object.setPrototypeOf(s, st); s.hero = { ...st.hero, x: st.hero.x - R.ox }; return s; };
  const near = (R, hx, d = NEAR) => hx > R.ox - d && hx < R.ox + R.w + d;

  const def = {
    id: 'world', size: { w: W, h: H }, regions, connectors, regionAt,
    start: { ...regions[0].def.start }, mood: regions[0].def.mood,
    solids, obstacles, stations, people, walkers,
    lessons: Object.assign({}, ...regions.map(R => R.def.lessons || {})),
    get ambience() { return (def._cur && def._cur.def.ambience) || 'village'; }, get music() { return (def._cur && def._cur.def.music) || 'village'; },
    update(dt, st, api) {
      const hx = st.hero.x, extra = [];
      regions.forEach(R => { if (!near(R, hx) || !R.def.update) return; const s = bindSt(R, st); s.walkersExtra = null; R.def.update(dt, s, api); (s.walkersExtra || []).forEach(w => extra.push(wrapW(w, R.ox))); });
      st.walkersExtra = extra;
    },
    kit2d: () => kit2dWorld(def),
    kit3d: (THREE, o) => kit3dWorld(THREE, o, def)
  };
  def._bindSt = bindSt; def._near = near;
  return def;
}

/* ── العرض العادي: الأرض والعناصر من القرى القريبة (بإزاحتها وكاميرا محلية للميل)، والوادي والسور والبوابة ── */
function kit2dWorld(D) {
  const kits = new Map(), kitOf = R => { let k = kits.get(R); if (!k) { k = R.def.kit2d(R.local); kits.set(R, k); } return k; };
  const H = D.size.h, vis = st => D.regions.filter(R => D._near(R, st.hero.x));
  const local = (R, c, f) => { c.save(); c.translate(R.ox, 0); CAM.x -= R.ox; try { f(); } finally { CAM.x += R.ox; c.restore(); } };
  function ground(g, x0, y0, w, h) {
    D.regions.forEach(R => { if (R.ox > x0 + w || R.ox + R.w < x0) return; g.save(); g.beginPath(); g.rect(R.ox, 0, R.w, H); g.clip(); g.translate(R.ox, 0); kitOf(R).ground(g, x0 - R.ox, y0, w, h); g.restore(); });
    D.connectors.forEach(C => { if (C.x0 > x0 + w || C.x1 < x0) return; g.save(); g.beginPath(); g.rect(C.x0, 0, CW, H); g.clip(); wadi(g, C, H); g.restore(); });
  }
  function items(t, st) {
    const out = [];
    vis(st).forEach(R => { const s = D._bindSt(R, st);
      kitOf(R).items(t, s).forEach(i => out.push({ x: i.x != null ? i.x + R.ox : undefined, y: i.y, draw: c => local(R, c, () => i.draw(c)) })); });
    D.connectors.forEach(C => { if (Math.abs(st.hero.x - C.wx) < NEAR) out.push(...connectorItems(C, t, H)); });
    return out;
  }
  return {
    ground, items,
    groundLive: (c, t, st) => vis(st).forEach(R => { const k = kitOf(R); if (k.groundLive) local(R, c, () => k.groundLive(c, t, D._bindSt(R, st))); }),
    over: (c, t, st) => vis(st).forEach(R => { const k = kitOf(R); if (k.over) local(R, c, () => k.over(c, t, D._bindSt(R, st))); }),
    station: (c, s, t, st) => { const R = s._R; local(R, c, () => kitOf(R).station(c, s._local, t, D._bindSt(R, st))); }
  };
}

/* أرض الوادي: رمل وتلال الحافة الشمالية، ومجرى سيل جاف بحصى، والطريق جسر بحاجزين فوقه */
function wadi(g, C, H) {
  const { x0, y0, y1 } = C;
  g.fillStyle = '#E3C796'; g.fillRect(x0, 0, CW, H); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, 0, CW, H);
  g.fillStyle = '#C9A26E'; g.fillRect(x0, 0, CW, 130);
  const mx = x0 + CW / 2 + 30;   // مجرى السيل
  g.fillStyle = '#CDB892'; g.beginPath(); g.moveTo(mx - 60, 0); for (let y = 0; y <= H; y += 60) g.lineTo(mx - 55 + Math.sin(y * .01) * 18, y); for (let y = H; y >= 0; y -= 60) g.lineTo(mx + 55 + Math.sin(y * .01) * 18, y); g.fill();
  for (let i = 0; i < 160; i++) { const y = (i * 137) % H, x = mx + Math.sin(y * .01) * 18 + ((i * 53) % 90) - 45; g.fillStyle = ['#A8A29E', '#D6D3D1', '#8C7A62'][i % 3]; g.beginPath(); g.ellipse(x, y, 3 + i % 4, 2 + i % 3, i, 0, 7); g.fill(); }
  // الطريق والأرصفة يعبران الوادي جسراً
  g.fillStyle = '#D6CFC4'; g.fillRect(x0, y0 - 15, CW, y1 - y0 + 30); g.fillStyle = pattern(g, 'pavers'); g.fillRect(x0, y0 - 15, CW, y1 - y0 + 30);
  g.fillStyle = '#4B5563'; g.fillRect(x0, y0, CW, y1 - y0); g.fillStyle = pattern(g, 'asphalt'); g.fillRect(x0, y0, CW, y1 - y0);
  g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; g.setLineDash([22, 18]); g.beginPath(); g.moveTo(x0, (y0 + y1) / 2); g.lineTo(x0 + CW, (y0 + y1) / 2); g.stroke(); g.setLineDash([]);
  boxShadow(g, C.wx - 7, 130, 14, y0 - 46 - 130, 60); boxShadow(g, C.wx - 7, y1 + 46, 14, H - y1 - 46, 60);
}

/* السور والبرجان والحاجز واللافتة، وأشجار السدر في الوادي */
function connectorItems(C, t, H) {
  const out = [], X = C.wx, { y0, y1 } = C, col = '#CDB58C', k = C.open;
  out.push({ x: X, y: y0 - 46, draw: c => stoneBox(c, X - 7, 130, 14, y0 - 46 - 130, 60, col) });
  out.push({ x: X, y: H, draw: c => stoneBox(c, X - 7, y1 + 46, 14, H - y1 - 46, 60, col) });
  [[y0 - 56, 'n'], [y1 + 18, 's']].forEach(([ty, s]) => out.push({ x: X, y: ty + 38, draw: c => stoneBox(c, X - 24, ty, 48, 38, 112, shade(col, -4)) }));
  // الحاجز: عمود مخطط من البرج الشمالي يسدّ الطريق، ويرتفع حين تُفتح البوابة
  out.push({ x: X, y: y1 + 17, draw: c => upright(c, X, y1 + 17, cc => {
    const px = X, py = y0 - 18 - 52, len = y1 - y0 + 36, a = k * 1.4, ex = px + Math.sin(a) * len * .35, ey = py + Math.cos(a) * len;
    cc.lineCap = 'round'; cc.strokeStyle = '#7F1D1D'; cc.lineWidth = 9; cc.beginPath(); cc.moveTo(px, py); cc.lineTo(ex, ey); cc.stroke();
    cc.strokeStyle = '#FFFFFF'; cc.lineWidth = 6; cc.setLineDash([12, 12]); cc.beginPath(); cc.moveTo(px, py); cc.lineTo(ex, ey); cc.stroke(); cc.setLineDash([]); cc.lineCap = 'butt';
    if (k < .05) { cc.fillStyle = '#D4A017'; cc.beginPath(); cc.arc(ex, ey, 8, 0, 7); cc.fill(); }
    if (k > .02) { cc.fillStyle = `rgba(255,236,170,${.35 * k})`; cc.fillRect(X - 30, y0, 60, y1 - y0); } }) });
  out.push({ x: X, y: y0 - 17, draw: c => upright(c, X, y0 - 18, cc => signboard(cc, X, y0 - 18 - 150, C.want ? `${C.label} ➡` : C.built ? `${C.label} 🔒` : `${C.label} 🚧`)) });
  [[C.x0 + 120, 400], [C.x0 + 300, 820], [C.x0 + 140, 1500], [C.x0 + 330, 1650], [C.x0 + 250, 300]].forEach(([x, y]) => out.push({ x, y, draw: c => sidrCached(c, x, y, .9, t) }));
  return out;
}

/* ── المجسّم: مجموعة لكل قرية تُبنى حين يقترب البطل منها (مزاحة بـ ox)، والوادي والسور والبوابة، وجبال حول العالم كله ── */
function kit3dWorld(THREE, o, D) {
  const root = new THREE.Group(), built = new Map(); let lib = null;
  const ensureLib = async () => lib || (lib = { ...(await import('../renderer3d/geom.js')), ...(await import('../renderer3d/textures.js')), ...(await import('../renderer3d/omani.js')), ...(await import('../renderer3d/nature.js')) });
  const gates = D.connectors.map(C => ({ C, g: null }));
  ensureLib().then(L => {
    gates.forEach(G => { G.g = gate3D(THREE, G.C, L, D.size.h); root.add(G.g.group); });
    try { root.add(L.mountains({ x0: 0, z0: 0, x1: D.size.w, z1: D.size.h })); } catch (e) {}
  });
  let pending = false;
  function ensure(hx) {
    if (pending) return;
    const R = D.regions.filter(R => !built.has(R) && D._near(R, hx, 900)).sort((a, b) => Math.abs(a.cx - hx) - Math.abs(b.cx - hx))[0];
    if (!R) return;
    pending = true;
    setTimeout(() => { try { const K = R.def.kit3d(THREE, { ...o, def: R.local }); K.group.position.x = R.ox; root.add(K.group); built.set(R, K); } catch (e) { console.error('[قرية الخير] بناء مجسّم القرية', R.def.id, e); built.set(R, null); } pending = false; }, 0);
  }
  return { group: root, update(t, st, cam) {
    ensure(st.hero.x);
    built.forEach((K, R) => { if (!K) return; const on = D._near(R, st.hero.x, 1800); K.group.visible = on; if (on && K.update) K.update(t, D._bindSt(R, st), cam); });
    gates.forEach(G => G.g && G.g.update());
  } };
}

/* البوابة مجسّمة: سور حجري شمالاً وجنوباً، برجان، وحاجز مخطط يرتفع، ولافتة القرية التالية فوق البرج */
function gate3D(THREE, C, L, H) {
  const { Parts, box, material, signMesh } = L, g = new THREE.Group(), P = new Parts(), stone = material('stone', '#CDB58C'), X = C.wx;
  P.add(stone, box(14, 80, C.y0 - 46 - 130, X, 40, (130 + C.y0 - 46) / 2)); P.add(stone, box(14, 80, H - C.y1 - 46, X, 40, (C.y1 + 46 + H) / 2));
  [[C.y0 - 37], [C.y1 + 37]].forEach(([z]) => { P.add(stone, box(48, 150, 38, X, 75, z)); for (let k = 0; k < 3; k++) P.add(material('plaster', '#E9DCC2'), box(10, 12, 40, X - 15 + k * 15, 156, z)); });
  for (let x = C.x0 + 20; x < C.x1 - 10; x += 40) [C.y0 - 15, C.y1 + 15].forEach(z => P.add(material('stone', '#A8A29E'), box(30, 14, 6, x, 7, z)));   // حاجزا الجسر
  g.add(P.build());
  const pivot = new THREE.Group(); pivot.position.set(X, 52, C.y0 - 18); const len = C.y1 - C.y0 + 36;
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, len, 10), new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: .5 })); bar.rotation.x = Math.PI / 2; bar.position.z = len / 2; pivot.add(bar);
  for (let k = 1; k < 6; k += 2) { const s = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.3, len / 6, 10), new THREE.MeshStandardMaterial({ color: '#FFFFFF' })); s.rotation.x = Math.PI / 2; s.position.z = len * (k + .5) / 6; pivot.add(s); }
  g.add(pivot);
  let label = '', sign = null;
  return { group: g, update() {
    pivot.rotation.x = -C.open * 1.4;
    const txt = C.want ? `${C.label} ➡` : C.built ? `${C.label} 🔒` : `${C.label} 🚧`;
    if (txt !== label) { label = txt; if (sign) g.remove(sign); sign = signMesh(txt, 20); sign.position.set(X, 182, C.y0 - 37); g.add(sign); }
  } };
}
