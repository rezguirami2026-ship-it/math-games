// الوحدة ٣ (الهندسة) في «الميناء»: الأشكال والمجسمات والزوايا والتحويلات والإحداثيات أفعال حقيقية
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait, rr, clamp } from '../core/util.js';
import { say, puff, bubble } from '../world/entities.js';
import { PAL, INK, signboard } from '../world/art.js';
import { earn } from '../rewards/goodDeeds.js';
import { sfx } from '../core/sound.js';
import { complete } from './quests.js';
import { PIER_Y, SEA_X, CRATES, FRAME_TABLE, GIFT_TABLE, BOATHOUSE, ROOF_TABLE, FISH, FISH_STAND, POOL, POOL_STAND, MILL, MILL_STAND, BEACH } from '../world/harbor.js';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const near = (W, p, r) => Math.hypot(W.player.x - p.x, W.player.y - p.y) < (r || 50);
const changed = () => { bus.emit('mission'); bus.emit('save'); };
const sg = n => n < 0 ? '\u2066−' + ar(-n) + '\u2069' : ar(n);          // السالب يُعرض صحيحاً داخل النص العربي
const pt = (x, y) => `(${sg(x)}، ${sg(y)})`;
async function finish(W, id, lines, reward) { sfx('win'); await wait(600); earn(reward || 40, W.player.x, W.player.y - 80); complete(id); if (lines) await W.talk(lines[0].who, lines); }
const panel = () => document.getElementById('panel');
function sheetOpen(html) { const el = panel(); el.innerHTML = `<div class="sheet bench">${html}</div>`; el.classList.add('on'); game.busy = true; return el; }
function sheetClose() { const el = panel(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; }
function hiDPI(cv) { const r = 2, w = cv.width, h = cv.height; cv.width = w * r; cv.height = h * r; cv.style.width = w + 'px'; cv.style.height = h + 'px'; const c = cv.getContext('2d'); c.scale(r, r); return c; }
const msgBox = (t, kind) => `<div class="speech ${kind || ''}" id="benchMsg">${t}</div>`;
const setMsg = (t, kind) => { const m = document.getElementById('benchMsg'); if (m) { m.className = 'speech ' + (kind || ''); m.innerHTML = t; } };

/* ── رسم الأشكال والمجسمات ── */
const SHAPES = {
  tri: ['tri_eq', 'tri_right', 'tri_iso', 'tri_scal'], quad: ['square', 'rect', 'rhombus', 'trap', 'para', 'kite'], solid: ['cube', 'cyl', 'cone', 'sphere', 'pyr']
};
export function shapeIcon(c, k, x, y, s) {
  const P = pts => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(x + a * s, y + b * s) : c.moveTo(x + a * s, y + b * s)); c.closePath(); c.fill(); c.stroke(); };
  c.lineWidth = 2; c.strokeStyle = '#2A1B66'; c.fillStyle = '#9CC9F5';
  const F = {
    tri_eq: () => P([[0, -.5], [.5, .4], [-.5, .4]]), tri_right: () => P([[-.45, -.45], [-.45, .4], [.5, .4]]), tri_iso: () => P([[0, -.55], [.3, .45], [-.3, .45]]), tri_scal: () => P([[-.15, -.45], [.55, .4], [-.5, .3]]),
    square: () => P([[-.4, -.4], [.4, -.4], [.4, .4], [-.4, .4]]), rect: () => P([[-.55, -.3], [.55, -.3], [.55, .3], [-.55, .3]]), rhombus: () => P([[0, -.5], [.4, 0], [0, .5], [-.4, 0]]),
    trap: () => P([[-.25, -.35], [.25, -.35], [.5, .35], [-.5, .35]]), para: () => P([[-.3, -.35], [.55, -.35], [.3, .35], [-.55, .35]]), kite: () => P([[0, -.5], [.35, -.1], [0, .5], [-.35, -.1]]),
    cube: () => { c.fillStyle = '#F5C77E'; P([[-.4, -.2], [.2, -.2], [.2, .45], [-.4, .45]]); c.fillStyle = '#E6A955'; P([[.2, -.2], [.45, -.45], [.45, .2], [.2, .45]]); c.fillStyle = '#FBD99A'; P([[-.4, -.2], [-.15, -.45], [.45, -.45], [.2, -.2]]); },
    cyl: () => { c.fillStyle = '#F5C77E'; c.beginPath(); c.moveTo(x - .35 * s, y - .3 * s); c.lineTo(x - .35 * s, y + .35 * s); c.ellipse(x, y + .35 * s, .35 * s, .12 * s, 0, Math.PI, 0, true); c.lineTo(x + .35 * s, y - .3 * s); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#FBD99A'; c.beginPath(); c.ellipse(x, y - .3 * s, .35 * s, .12 * s, 0, 0, 7); c.fill(); c.stroke(); },
    cone: () => { c.fillStyle = '#F5C77E'; c.beginPath(); c.moveTo(x, y - .5 * s); c.lineTo(x + .38 * s, y + .35 * s); c.ellipse(x, y + .35 * s, .38 * s, .12 * s, 0, 0, Math.PI); c.closePath(); c.fill(); c.stroke(); },
    sphere: () => { const g = c.createRadialGradient(x - .15 * s, y - .15 * s, 2, x, y, .45 * s); g.addColorStop(0, '#FFE7B0'); g.addColorStop(1, '#D8913E'); c.fillStyle = g; c.beginPath(); c.arc(x, y, .42 * s, 0, 7); c.fill(); c.stroke(); },
    pyr: () => { c.fillStyle = '#F5C77E'; P([[-.45, .35], [.15, .45], [0, -.5]]); c.fillStyle = '#E6A955'; P([[.15, .45], [.45, .2], [0, -.5]]); }
  };
  (F[k] || F.square)();
}
const clsOf = k => SHAPES.tri.includes(k) ? 'tri' : SHAPES.quad.includes(k) ? 'quad' : 'solid';

/* ═══ ١٦. تمييز الأشكال — «حمولة الميناء» ═══ */
const SHIPS = [{ cls: 'tri', label: 'المثلثات' }, { cls: 'quad', label: 'الرباعيات' }, { cls: 'solid', label: 'المجسمات' }];
const DROP = PIER_Y.map(y => ({ x: SEA_X - 20, y }));
export const shapesIdentify = {
  id: 'shapesIdentify', giver: 'saif',
  intro: n => [
    { who: 'saif', text: `أهلاً يا ${n}! أنا القبطان سيف. البضائع وصلت في صناديق عليها أشكال.` },
    { who: 'saif', text: 'السفينة الحمراء للمثلثات، والزرقاء للرباعيات، والخضراء للمجسمات. حمّل كل صندوق على سفينته.' }
  ],
  begin(d) { d.crates = shuffle([...shuffle(SHAPES.tri).slice(0, 3), ...shuffle(SHAPES.quad).slice(0, 3), ...shuffle(SHAPES.solid).slice(0, 2)]); d.i = 0; d.hand = false; d.load = [0, 0, 0]; },
  goal: d => d.hand ? '🚢 حمّل الصندوق على السفينة المناسبة لشكله' : `📦 خذ الصندوق التالي من رصيف البضائع (${ar(d.i)} من ${ar(8)})`,
  target: d => d.hand ? null : CRATES,
  taps: () => [{ x: CRATES.x, y: CRATES.y - 14, hit: 40, approach: { x: CRATES.x, y: CRATES.y + 26 } }].concat(DROP.map(p => ({ x: p.x, y: p.y, hit: 34, approach: p }))),
  actions(W, d) {
    const out = [];
    if (!d.hand && d.i < 8 && near(W, { x: CRATES.x, y: CRATES.y + 18 }, 44)) out.push({ key: 'crates', label: '📦 خذ الصندوق', run: () => { d.hand = true; sfx('pick'); changed(); } });
    if (d.hand) DROP.forEach((p, j) => { if (near(W, p, 44)) out.push({ key: 'ship' + j, label: `🚢 حمّله على سفينة ${SHIPS[j].label}`, kind: 'go', run: () => this.drop(W, d, j) }); });
    return out;
  },
  async drop(W, d, j) {
    const k = d.crates[d.i];
    if (clsOf(k) === SHIPS[j].cls) { d.load[j]++; d.i++; d.hand = false; sfx('drop'); say(DROP[j].x, DROP[j].y - 60, '✓', '#1FA05A', 1000); changed();
      if (d.i >= 8) await finish(W, 'shapesIdentify', [{ who: 'saif', text: 'كل صندوق على سفينته الصحيحة! نبحر مع المد.' }]); }
    else { sfx('cough'); say(DROP[j].x, DROP[j].y - 60, `هذه سفينة ${SHIPS[j].label} فقط`, '#C2304A', 2200); }
  },
  hand: d => d.hand ? { n: 1, label: ' ' } : null,
  handDraw(c, x, y, d) { if (!d.hand) return; c.fillStyle = '#FFFDF6'; rr(c, x - 22, y - 22, 44, 44, 10); c.fill(); shapeIcon(c, d.crates[d.i], x, y, 36); },
  draw(d, t, active, done) {
    if (!d.crates) return [];
    const out = [{ y: CRATES.y, draw: c => { const left = 8 - d.i - (d.hand ? 1 : 0); for (let i = 0; i < left; i++) { c.fillStyle = '#D79B57'; rr(c, CRATES.x - 30 + (i % 4) * 15, CRATES.y - 12 - Math.floor(i / 4) * 14, 14, 13, 2); c.fill(); }
      if (left > 0 && active) { c.fillStyle = '#FFFDF6'; rr(c, CRATES.x - 24, CRATES.y - 84, 48, 48, 10); c.fill(); shapeIcon(c, d.crates[d.i + (d.hand ? 1 : 0)] || d.crates[d.i], CRATES.x, CRATES.y - 60, 38); } } }];
    PIER_Y.forEach((y, j) => out.push({ y: y + 1, draw: c => bubble(c, SEA_X - 40, y - 34, `${SHIPS[j].label}${d.load[j] ? ' — ' + ar(d.load[j]) : ''}`, ['#C0392B', '#2F6FB2', '#2E8B57'][j]) }));
    return out;
  }
};

/* ═══ ١٧. خصائص الأشكال ثلاثية الأبعاد — «ورشة الهياكل» ═══ */
const SOLIDS = [{ name: 'مكعب', t: 'prism', n: 4 }, { name: 'منشور ثلاثي', t: 'prism', n: 3 }, { name: 'منشور خماسي', t: 'prism', n: 5 }, { name: 'منشور سداسي', t: 'prism', n: 6 }, { name: 'هرم رباعي', t: 'pyr', n: 4 }, { name: 'هرم ثلاثي', t: 'pyr', n: 3 }];
const counts = s => s.t === 'prism' ? { v: 2 * s.n, e: 3 * s.n, f: s.n + 2 } : { v: s.n + 1, e: 2 * s.n, f: s.n + 1 };
export function drawSolid(c, s, cx, cy) {
  const rx = 62, ry = 20, h = 78, base = []; for (let i = 0; i < s.n; i++) { const a = Math.PI / 2 + i * 2 * Math.PI / s.n + (s.n === 4 ? Math.PI / 4 : .3); base.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  const front = i => Math.sin(Math.PI / 2 + i * 2 * Math.PI / s.n + (s.n === 4 ? Math.PI / 4 : .3)) > -0.05;
  c.lineWidth = 2.2; c.strokeStyle = '#2A1B66';
  const seg = (a, b, dash) => { c.setLineDash(dash ? [5, 4] : []); c.globalAlpha = dash ? .45 : 1; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.globalAlpha = 1; c.setLineDash([]); };
  if (s.t === 'prism') {
    const top = base.map(([x, y]) => [x, y - h]);
    c.fillStyle = 'rgba(156,201,245,.35)'; c.beginPath(); top.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
    for (let i = 0; i < s.n; i++) { const j = (i + 1) % s.n, back = !front(i) && !front(j); seg(base[i], base[j], back); seg(top[i], top[j], false); seg(base[i], top[i], !front(i)); }
    base.concat(top).forEach(([x, y]) => { c.fillStyle = '#E2475C'; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); });
  } else {
    const apex = [cx, cy - h - 10];
    for (let i = 0; i < s.n; i++) { const j = (i + 1) % s.n; seg(base[i], base[j], !front(i) && !front(j)); seg(base[i], apex, !front(i)); }
    base.concat([apex]).forEach(([x, y]) => { c.fillStyle = '#E2475C'; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); });
  }
}
export const shapes3D = {
  id: 'shapes3D', giver: 'reem',
  intro: n => [
    { who: 'reem', text: `مرحباً يا ${n}! أنا المهندسة ريم. أصنع هياكل المجسمات من الوصلات والقضبان والألواح.` },
    { who: 'reem', text: 'كل رأس يحتاج وصلة، وكل حرف يحتاج قضيباً، وكل وجه يحتاج لوحاً. جهّز العدد الصحيح من كل نوع واصنع الهيكل.' }
  ],
  begin(d) { d.rounds = shuffle(SOLIDS.map((_, i) => i)).slice(0, 3); d.r = 0; d.v = 0; d.e = 0; d.f = 0; },
  goal: d => `🔧 اصنع هيكل ${SOLIDS[d.rounds[Math.min(d.r, 2)]].name} على طاولة ريم (${ar(Math.min(d.r + 1, 3))} من ${ar(3)})`,
  target: () => FRAME_TABLE,
  taps: () => [{ x: FRAME_TABLE.x, y: FRAME_TABLE.y - 20, hit: 40, approach: { x: FRAME_TABLE.x, y: FRAME_TABLE.y + 24 } }],
  actions(W, d) { return near(W, { x: FRAME_TABLE.x, y: FRAME_TABLE.y + 16 }, 48) ? [{ key: 'frames', label: '🔧 طاولة الهياكل', kind: 'go', run: () => this.open(W, d) }] : []; },
  open(W, d, msg, kind) {
    const s = SOLIDS[d.rounds[d.r]];
    const row = (k, lab) => `<div class="cnt"><span>${lab}</span><button class="act ghost" data-k="${k}" data-v="-1">−</button><b id="c_${k}">${ar(d[k])}</b><button class="act ghost" data-k="${k}" data-v="1">+</button></div>`;
    sheetOpen(`<h3>🔧 طاولة الهياكل: ${s.name}</h3>${msgBox(msg || `جهّز ما يلزم لصنع هيكل <b>${s.name}</b>`, kind)}
      <canvas id="solid" width="300" height="150"></canvas>
      ${row('v', '🔴 وصلات (رؤوس)')}${row('e', '📏 قضبان (أحرف)')}${row('f', '🟦 ألواح (أوجه)')}
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔧 اصنع الهيكل</button></div>`);
    const c = hiDPI(document.getElementById('solid')); drawSolid(c, s, 150, 112);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k; d[k] = clamp(d[k] + +b.dataset.v, 0, 30); document.getElementById('c_' + k).textContent = ar(d[k]); sfx('click'); });
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
    document.getElementById('benchGo').onclick = async e => {
      e.stopPropagation();
      const want = counts(s), bad = ['v', 'e', 'f'].find(k => d[k] !== want[k]);
      if (bad) { sfx('cough'); const nm = { v: 'الوصلات', e: 'القضبان', f: 'الألواح' }[bad]; setMsg(`الهيكل لم يكتمل: عدد ${nm} ${d[bad] < want[bad] ? 'لا يكفي' : 'أكثر من اللازم'}`, 'bad'); return; }
      sfx('win'); d.r++; d.v = 0; d.e = 0; d.f = 0; changed();
      if (d.r >= 3) { sheetClose(); await finish(W, 'shapes3D', [{ who: 'reem', text: 'ثلاثة هياكل متقنة! عرفتَ الرؤوس والأحرف والأوجه بدقة.' }]); }
      else this.open(W, d, `✓ اكتمل هيكل ${s.name}! التالي: <b>${SOLIDS[d.rounds[d.r]].name}</b>`, 'ok');
    };
  }
};

/* ═══ ١٨. الشبكات — «علب الهدايا» ═══ */
const ROLL = { E: s => ({ U: s.W, D: s.E, N: s.N, S: s.S, E: s.U, W: s.D }), W: s => ({ U: s.E, D: s.W, N: s.N, S: s.S, E: s.D, W: s.U }), N: s => ({ U: s.S, D: s.N, N: s.U, S: s.D, E: s.E, W: s.W }), S: s => ({ U: s.N, D: s.S, N: s.D, S: s.U, E: s.E, W: s.W }) };
export function cubeNet(cells) {   // يطوي الشبكة بمكعب متدحرج: صالحة إذا غطّت الخلايا الستة ستة أوجه مختلفة
  if (cells.length !== 6) return 'count';
  const key = ([x, y]) => x + ',' + y, set = new Set(cells.map(key)), seen = new Map(), q = [[cells[0], { U: 0, D: 1, N: 2, S: 3, E: 4, W: 5 }]];
  seen.set(key(cells[0]), 1);
  const faces = new Set([1]);
  while (q.length) {
    const [[x, y], s] = q.shift();
    for (const [dir, dx, dy] of [['E', 1, 0], ['W', -1, 0], ['N', 0, -1], ['S', 0, 1]]) {
      const n = [x + dx, y + dy]; if (!set.has(key(n)) || seen.has(key(n))) continue;
      const ns = ROLL[dir](s); seen.set(key(n), 1); faces.add(ns.D); q.push([n, ns]);
    }
  }
  if (seen.size < 6) return 'apart';
  return faces.size === 6 ? 'ok' : 'overlap';
}
function canon(cells) {
  const T = [p => p, ([x, y]) => [-y, x], ([x, y]) => [-x, -y], ([x, y]) => [y, -x]], out = [];
  for (const m of [p => p, ([x, y]) => [-x, y]]) for (const t of T) { const ps = cells.map(p => t(m(p))), mx = Math.min(...ps.map(p => p[0])), my = Math.min(...ps.map(p => p[1])); out.push(ps.map(([x, y]) => (x - mx) + ',' + (y - my)).sort().join(';')); }
  return out.sort()[0];
}
export const nets = {
  id: 'nets', giver: 'layla',
  intro: n => [
    { who: 'layla', text: `أهلاً يا ${n}! أنا ليلى صاحبة دكان الهدايا. أريد علباً مكعبة من الورق المقوّى.` },
    { who: 'layla', text: 'صمم على اللوح شبكة من ستة مربعات تنطوي علبةً مغلقة. وأريد ثلاث علب، كل واحدة بشبكة مختلفة!' }
  ],
  begin(d) { d.found = []; d.cells = []; },
  goal: d => `📦 صمم شبكة علبة مكعبة جديدة (${ar(d.found.length)} من ${ar(3)})`,
  target: () => GIFT_TABLE,
  taps: () => [{ x: GIFT_TABLE.x, y: GIFT_TABLE.y - 20, hit: 40, approach: { x: GIFT_TABLE.x, y: GIFT_TABLE.y + 24 } }],
  actions(W, d) { return near(W, { x: GIFT_TABLE.x, y: GIFT_TABLE.y + 16 }, 48) ? [{ key: 'gifts', label: '📦 لوح العلب', kind: 'go', run: () => this.open(W, d) }] : []; },
  open(W, d, msg, kind) {
    const CW = 5, CH = 4, Z = 44;
    sheetOpen(`<h3>📦 لوح علب الهدايا</h3>${msgBox(msg || 'اضغط المربعات لتصمم شبكة من ستة وجوه، ثم اطوِها', kind)}
      <canvas id="net" width="${CW * Z + 8}" height="${CH * Z + 8}"></canvas>
      <div class="row2"><button class="act ghost" id="netClear">↺ امسح</button><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📦 اطوِ العلبة</button></div>`);
    const cv = document.getElementById('net'), c = hiDPI(cv);
    const draw = () => { c.clearRect(0, 0, CW * Z + 8, CH * Z + 8); for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const on = d.cells.some(p => p[0] === x && p[1] === y); c.fillStyle = on ? '#F5C77E' : '#F4EBD6'; rr(c, 4 + x * Z + 2, 4 + y * Z + 2, Z - 4, Z - 4, 6); c.fill(); if (on) { c.strokeStyle = '#C98A3A'; c.lineWidth = 2; c.stroke(); } } };
    draw();
    cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), x = Math.floor((e.clientX - b.left - 4) / Z), y = Math.floor((e.clientY - b.top - 4) / Z); if (x < 0 || y < 0 || x >= CW || y >= CH) return;
      const i = d.cells.findIndex(p => p[0] === x && p[1] === y); if (i >= 0) d.cells.splice(i, 1); else if (d.cells.length < 6) d.cells.push([x, y]); sfx('click'); draw(); });
    document.getElementById('netClear').onclick = e => { e.stopPropagation(); d.cells = []; draw(); };
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
    document.getElementById('benchGo').onclick = async e => {
      e.stopPropagation();
      const r = cubeNet(d.cells), M = { count: 'العلبة تحتاج ستة وجوه بالضبط', apart: 'بعض الوجوه منفصلة عن الشبكة', overlap: 'عند الطيّ تتراكب الوجوه ويبقى جانب مفتوح' };
      if (r !== 'ok') { sfx('cough'); setMsg(M[r], 'bad'); return; }
      const k = canon(d.cells); if (d.found.includes(k)) { sfx('cough'); setMsg('هذه الشبكة صنعتَ منها علبة من قبل، جرّب شكلاً جديداً', 'bad'); return; }
      d.found.push(k); d.cells = []; sfx('win'); changed();
      if (d.found.length >= 3) { sheetClose(); await finish(W, 'nets', [{ who: 'layla', text: 'ثلاث علب من ثلاث شبكات مختلفة! الهدايا جاهزة.' }]); }
      else this.open(W, d, `✓ انطوت علبة محكمة! صمم شبكة مختلفة للعلبة ${ar(d.found.length + 1)}`, 'ok');
    };
  },
  draw(d, t, active, done) { const n = (d.found || []).length; return n ? [{ y: GIFT_TABLE.y + 1, draw: c => { for (let i = 0; i < n; i++) { const x = GIFT_TABLE.x - 20 + i * 18, y = GIFT_TABLE.y - 34; c.fillStyle = ['#E85D75', '#2F6FB2', '#2E8B57'][i]; rr(c, x - 7, y, 14, 12, 2); c.fill(); c.fillStyle = '#FFC23D'; c.fillRect(x - 1, y, 2, 12); } } }] : []; }
};

/* ═══ ١٩. الزوايا في المثلثات — «سقف المرسى» ═══ */
export const triangleAngles = {
  id: 'triangleAngles', giver: 'ali',
  intro: n => [
    { who: 'ali', text: `يا ${n}! أنا علي، أبني سقف مرسى القوارب من دعامات مثلثة.` },
    { who: 'ali', text: 'في كل دعامة زاويتان معروفتان أو معلومة عن شكلها. اضبط الزاوية الناقصة بالمنقلة لتستقر الدعامة.' }
  ],
  begin(d) {
    let a, b; do { a = R(35, 80); b = R(30, 85); } while (a + b > 150);
    const A = R(15, 50) * 2, x = R(25, 65);
    d.rounds = [{ t: 'any', a, b, ans: 180 - a - b, text: `زاويتا القاعدة ${ar(a)}° و${ar(b)}°. اضبط زاوية الرأس.` },
      { t: 'iso', A, ans: (180 - A) / 2, text: `دعامة متساوية الساقين، زاوية رأسها ${ar(A)}°. اضبط إحدى زاويتي القاعدة.` },
      { t: 'right', a: x, ans: 90 - x, text: `دعامة قائمة الزاوية، وفيها زاوية ${ar(x)}°. اضبط الزاوية الثالثة.` }];
    d.r = 0; d.set = 60;
  },
  goal: d => `📐 أكمل زوايا دعامات السقف (${ar(Math.min(d.r, 3))} من ${ar(3)})`,
  target: () => ROOF_TABLE,
  taps: () => [{ x: ROOF_TABLE.x, y: ROOF_TABLE.y - 20, hit: 40, approach: { x: ROOF_TABLE.x, y: ROOF_TABLE.y + 24 } }],
  actions(W, d) { return near(W, { x: ROOF_TABLE.x, y: ROOF_TABLE.y + 16 }, 48) ? [{ key: 'roof', label: '📐 طاولة الدعامات', kind: 'go', run: () => this.open(W, d) }] : []; },
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>📐 الدعامة ${ar(d.r + 1)}</h3>${msgBox(msg || r.text, kind)}
      <canvas id="tri" width="320" height="170"></canvas>
      <div class="row2"><button class="act ghost" data-a="-10">−١٠°</button><button class="act ghost" data-a="-1">−١°</button><button class="act ghost" data-a="1">+١°</button><button class="act ghost" data-a="10">+١٠°</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📐 ثبّت الدعامة</button></div>`);
    const c = hiDPI(document.getElementById('tri'));
    const draw = () => {
      c.clearRect(0, 0, 320, 170);
      let L, Rg, labL, labR, labT, unk;
      if (r.t === 'any') { L = r.a; Rg = r.b; labL = ar(r.a) + '°'; labR = ar(r.b) + '°'; unk = 'T'; }
      else if (r.t === 'iso') { L = Rg = (180 - r.A) / 2; labT = ar(r.A) + '°'; unk = 'L'; }
      else { L = 90; Rg = r.a; labL = '90°'; labR = ar(r.a) + '°'; unk = 'T'; }
      const x1 = 40, x2 = 280, y0 = 150, tl = Math.tan(L * Math.PI / 180), tr = Math.tan(Rg * Math.PI / 180), w = x2 - x1, ax = L === 90 ? x1 : x1 + w * tr / (tl + tr), ay = y0 - (L === 90 ? w * tr : (ax - x1) * tl);
      const sc = Math.min(1, 140 / (y0 - ay)), Ay = y0 - (y0 - ay) * sc, Ax = x1 + (ax - x1) * (L === 90 ? 1 : 1);
      c.fillStyle = 'rgba(217,160,102,.35)'; c.strokeStyle = '#8B5A2B'; c.lineWidth = 5; c.beginPath(); c.moveTo(x1, y0); c.lineTo(x2, y0); c.lineTo(Ax, Ay); c.closePath(); c.fill(); c.stroke();
      const lab = (x, y, t, col) => { c.fillStyle = col || '#2A1B66'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(t, x, y); };
      const mine = '\u2066' + ar(d.set) + '°\u2069';
      if (unk === 'T') { lab(x1 + 30, y0 - 10, labL); lab(x2 - 30, y0 - 10, labR); lab(Ax, Ay + 30, mine, '#E2475C'); }
      else { lab(x1 + 30, y0 - 10, mine, '#E2475C'); lab(x2 - 30, y0 - 10, '؟'); lab(Ax, Ay + 30, labT); }
      if (r.t === 'right') { c.strokeStyle = '#2A1B66'; c.lineWidth = 1.5; c.strokeRect(x1, y0 - 14, 14, 14); }
    };
    draw();
    panel().querySelectorAll('[data-a]').forEach(b => b.onclick = e => { e.stopPropagation(); d.set = clamp(d.set + +b.dataset.a, 1, 179); sfx('click'); draw(); });
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
    document.getElementById('benchGo').onclick = async e => {
      e.stopPropagation();
      if (d.set === r.ans) { sfx('win'); d.r++; d.set = 60; changed();
        if (d.r >= 3) { sheetClose(); await finish(W, 'triangleAngles', [{ who: 'ali', text: 'الدعامات الثلاث مستقرة، ومجموع زوايا كل مثلث ١٨٠° تماماً!' }]); }
        else this.open(W, d, `✓ استقرت الدعامة! ${d.rounds[d.r].text}`, 'ok'); }
      else { sfx('cough'); setMsg(`الدعامة مائلة: مجموع زوايا المثلث لا يساوي ١٨٠° بهذه الزاوية. ${r.text}`, 'bad'); }
    };
  },
  draw(d, t, active, done) {
    const n = done ? 3 : (d.r || 0);
    const B = BOATHOUSE, yb = B.y + B.h, H = 78, cx = B.x + B.w / 2;
    return [{ y: yb, x: cx, draw: c => {   // مرسى مفتوح: قوائم وعارضة، جمالونات تُضاف جولةً بعد جولة، وسقف معدني عند الإكمال
      c.fillStyle = 'rgba(60,35,10,.2)'; c.fillRect(B.x + 10, yb - 2, B.w + 24, 8);
      c.fillStyle = '#7A4A2A'; c.beginPath(); c.moveTo(cx - 54, yb - 30); c.quadraticCurveTo(cx, yb - 4, cx + 54, yb - 30); c.lineTo(cx + 46, yb - 34); c.lineTo(cx - 46, yb - 34); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();   // قارب تحت المرسى
      c.fillStyle = '#E3B04B'; c.fillRect(cx - 46, yb - 37, 92, 3);
      [B.x + 4, B.x + B.w - 12].forEach(x => { c.fillStyle = PAL.wood; c.fillRect(x, yb - H, 8, H); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x, yb - H, 2.5, H); c.strokeStyle = INK; c.lineWidth = .9; c.strokeRect(x, yb - H, 8, H); });
      c.fillStyle = '#6B4520'; c.fillRect(B.x - 2, yb - H - 8, B.w + 4, 10); c.strokeStyle = INK; c.strokeRect(B.x - 2, yb - H - 8, B.w + 4, 10);
      for (let i = 0; i < 3; i++) { const x = B.x + 34 + i * 66, by = yb - H - 8; c.setLineDash(i < n ? [] : [5, 5]); c.lineCap = 'round';
        c.strokeStyle = i < n ? '#8B5A2B' : 'rgba(139,90,43,.3)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 32, by); c.lineTo(x, by - 34); c.lineTo(x + 32, by); c.moveTo(x, by); c.lineTo(x, by - 34); c.stroke();
        if (i < n) { c.strokeStyle = INK; c.lineWidth = .8; c.beginPath(); c.moveTo(x - 32, by); c.lineTo(x, by - 34); c.lineTo(x + 32, by); c.stroke(); } c.setLineDash([]); }
      if (n >= 3) {   // السقف: ألواح معدنية مموجة على الجمالونات
        c.fillStyle = '#A9B4BF'; c.beginPath(); c.moveTo(B.x - 6, yb - H - 6); c.lineTo(B.x + 2, yb - H - 46); c.lineTo(B.x + B.w - 2, yb - H - 46); c.lineTo(B.x + B.w + 6, yb - H - 6); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(70,80,90,.35)'; c.lineWidth = 1; for (let x = B.x + 2; x < B.x + B.w; x += 8) { c.beginPath(); c.moveTo(x - 4, yb - H - 6); c.lineTo(x, yb - H - 46); c.stroke(); }
        c.strokeStyle = INK; c.beginPath(); c.moveTo(B.x - 6, yb - H - 6); c.lineTo(B.x + 2, yb - H - 46); c.lineTo(B.x + B.w - 2, yb - H - 46); c.lineTo(B.x + B.w + 6, yb - H - 6); c.closePath(); c.stroke();
      }
      signboard(c, cx, yb - H - 3, 'مرسى القوارب');
    } }];
  }
};

/* ═══ ٢٠. وصف الانسحاب — «قوارب الصيد» ═══ */
const gp = (gx, gy) => ({ x: FISH.x + gx * FISH.cell, y: FISH.y + gy * FISH.cell });
export const translation = {
  id: 'translation', giver: 'badr',
  intro: n => [
    { who: 'badr', text: `أهلاً يا ${n}! أنا بدر الصياد. قاربي الصغير يتحرك على شبكة الصيد كما أصفه له.` },
    { who: 'badr', text: 'صِف الانسحاب: كم خطوة يميناً أو يساراً، وكم خطوة إلى الأعلى أو الأسفل حتى يصل القارب إلى العوامة. ثم أبحر!' }
  ],
  begin(d) { d.rounds = []; while (d.rounds.length < 3) { const b = [R(0, 5), R(0, 5)], t = [R(0, 5), R(0, 5)]; if (Math.abs(b[0] - t[0]) + Math.abs(b[1] - t[1]) >= 3 && b[0] !== t[0] && b[1] !== t[1]) d.rounds.push({ b, t }); } d.r = 0; d.vx = 0; d.vy = 0; d.anim = null; },
  goal: d => { const h = d.vx ? `${ar(Math.abs(d.vx))} ${d.vx > 0 ? 'يميناً' : 'يساراً'}` : '', v = d.vy ? `${ar(Math.abs(d.vy))} ${d.vy < 0 ? 'إلى الأعلى' : 'إلى الأسفل'}` : ''; return `⛵ أوصل القارب إلى العوامة (${ar(Math.min(d.r + 1, 3))} من ${ar(3)}) — وصفك: ${[h, v].filter(Boolean).join('، ') || 'لا حركة بعد'}`; },
  target: () => FISH_STAND,
  taps: () => [{ x: FISH_STAND.x, y: FISH_STAND.y, hit: 34, approach: FISH_STAND }],
  actions(W, d) {
    if (!near(W, FISH_STAND, 46) || d.anim) return [];
    const add = (x, y) => () => { d.vx = clamp(d.vx + x, -5, 5); d.vy = clamp(d.vy + y, -5, 5); sfx('click'); changed(); };
    return [{ key: 'fish', label: '➡ يميناً', kind: 'ghost', run: add(1, 0) }, { key: 'fish', label: '⬅ يساراً', kind: 'ghost', run: add(-1, 0) }, { key: 'fish', label: '⬆ أعلى', kind: 'ghost', run: add(0, -1) }, { key: 'fish', label: '⬇ أسفل', kind: 'ghost', run: add(0, 1) },
      { key: 'fish', label: '↺ صفّر', kind: 'ghost', run: () => { d.vx = 0; d.vy = 0; changed(); } }, { key: 'fish', label: '⛵ أبحر', kind: 'go', run: () => this.sail(W, d), disabled: !d.vx && !d.vy }];
  },
  async sail(W, d) {
    const r = d.rounds[d.r], to = [r.b[0] + d.vx, r.b[1] + d.vy];
    d.anim = { t0: performance.now(), to }; sfx('engine'); changed(); await wait(1300);
    if (to[0] === r.t[0] && to[1] === r.t[1]) { sfx('win'); say(gp(...r.t).x, gp(...r.t).y - 30, '🐟 صيد وفير!', '#1FA05A', 1600); await wait(900); d.r++; d.vx = 0; d.vy = 0; d.anim = null; changed();
      if (d.r >= 3) await finish(W, 'translation', [{ who: 'badr', text: 'ثلاث رحلات وثلاث شباك ممتلئة! وصفك للانسحاب دقيق.' }]); }
    else { sfx('cough'); const p = gp(...to); say(p.x, p.y - 30, 'أخطأ القارب العوامة', '#C2304A', 2000); await wait(900); d.anim = null; changed(); }
  },
  ground(c, d, active, done, t) {
    if (!d.rounds) return; const F = FISH;
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
    for (let i = 0; i <= F.n; i++) { c.beginPath(); c.moveTo(F.x + i * F.cell, F.y); c.lineTo(F.x + i * F.cell, F.y + F.n * F.cell); c.stroke(); c.beginPath(); c.moveTo(F.x, F.y + i * F.cell); c.lineTo(F.x + F.n * F.cell, F.y + i * F.cell); c.stroke(); }
    if (done) return;
    const r = d.rounds[Math.min(d.r, 2)], tp = gp(...r.t);
    c.fillStyle = '#E2475C'; c.beginPath(); c.arc(tp.x, tp.y, 9, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(tp.x - 9, tp.y - 2, 18, 4);
    let bp = gp(...r.b);
    if (d.anim) { const k = Math.min(1, (performance.now() - d.anim.t0) / 1100), e = gp(...d.anim.to); bp = { x: bp.x + (e.x - bp.x) * k, y: bp.y + (e.y - bp.y) * k }; }
    c.fillStyle = '#8B5A2B'; c.beginPath(); c.moveTo(bp.x - 14, bp.y - 4); c.lineTo(bp.x + 14, bp.y - 4); c.lineTo(bp.x + 9, bp.y + 7); c.lineTo(bp.x - 9, bp.y + 7); c.closePath(); c.fill();
    c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(bp.x, bp.y - 4); c.lineTo(bp.x, bp.y - 22); c.lineTo(bp.x + 11, bp.y - 6); c.closePath(); c.fill();
  }
};

/* ═══ ٢١ و٢٢. الانعكاس والدوران — رسم صورة الشكل على الشبكة ═══ */
function imageMod(cfg) {
  return {
    id: cfg.id, giver: cfg.giver, intro: cfg.intro,
    begin(d) { d.rounds = cfg.make(); d.r = 0; d.pts = []; },
    goal: d => `${cfg.icon} ارسم صورة الشكل على لوح ${cfg.place} (${ar(Math.min(d.r + 1, 3))} من ${ar(3)})`,
    target: () => cfg.stand,
    taps: () => [{ x: cfg.stand.x, y: cfg.stand.y - 20, hit: 40, approach: cfg.stand }],
    actions(W, d) { return near(W, cfg.stand, 46) ? [{ key: cfg.id, label: `${cfg.icon} لوح ${cfg.place}`, kind: 'go', run: () => this.open(W, d) }] : []; },
    open(W, d, msg, kind) {
      const r = d.rounds[d.r], Z = 30, O = 15, N = 8;
      sheetOpen(`<h3>${cfg.icon} ${cfg.title}</h3>${msgBox(msg || r.text, kind)}<canvas id="img" width="${N * Z + 2 * O}" height="${N * Z + 2 * O}" style="touch-action:none"></canvas>
        <div class="row2"><button class="act ghost" id="imgClear">↺ امسح</button><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ تحقّق</button></div>`);
      const cv = document.getElementById('img'), c = hiDPI(cv), X = g => O + g * Z;
      const draw = () => {
        c.clearRect(0, 0, N * Z + 2 * O, N * Z + 2 * O); c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, N * Z + 2 * O, N * Z + 2 * O);
        c.strokeStyle = '#E3D6B5'; c.lineWidth = 1; for (let i = 0; i <= N; i++) { c.beginPath(); c.moveTo(X(i), X(0)); c.lineTo(X(i), X(N)); c.stroke(); c.beginPath(); c.moveTo(X(0), X(i)); c.lineTo(X(N), X(i)); c.stroke(); }
        cfg.guide(c, r, X);
        c.fillStyle = 'rgba(47,111,178,.35)'; c.strokeStyle = '#2F6FB2'; c.lineWidth = 2.5; c.beginPath(); r.shape.forEach(([x, y], i) => i ? c.lineTo(X(x), X(y)) : c.moveTo(X(x), X(y))); c.closePath(); c.fill(); c.stroke();
        d.pts.forEach(([x, y]) => { c.fillStyle = '#E2475C'; c.beginPath(); c.arc(X(x), X(y), 6, 0, 7); c.fill(); });
      };
      draw();
      cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), gx = Math.round((e.clientX - b.left - O) / Z), gy = Math.round((e.clientY - b.top - O) / Z); if (gx < 0 || gy < 0 || gx > N || gy > N) return;
        const i = d.pts.findIndex(p => p[0] === gx && p[1] === gy); if (i >= 0) d.pts.splice(i, 1); else if (d.pts.length < r.shape.length) d.pts.push([gx, gy]); sfx('click'); draw(); });
      document.getElementById('imgClear').onclick = e => { e.stopPropagation(); d.pts = []; draw(); };
      document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
      document.getElementById('benchGo').onclick = async e => {
        e.stopPropagation();
        const want = r.image.map(p => p.join(',')), got = d.pts.map(p => p.join(',')), ok = got.filter(g => want.includes(g)).length;
        if (ok === want.length && got.length === want.length) { sfx('win'); d.r++; d.pts = []; changed();
          if (d.r >= 3) { sheetClose(); await finish(W, cfg.id, cfg.outro); } else this.open(W, d, `✓ صورة صحيحة! ${d.rounds[d.r].text}`, 'ok'); }
        else { sfx('cough'); setMsg(`${ar(ok)} من ${ar(want.length)} رؤوس في مكانها الصحيح. ${r.text}`, 'bad'); }
      };
    },
    draw: cfg.world
  };
}
function polyOK(s) { const k = new Set(s.map(p => p.join(','))); return k.size === s.length && s.every(([x, y]) => x >= 0 && y >= 0 && x <= 8 && y <= 8); }
function randShape(fx, fy, n) { for (;;) { const s = Array.from({ length: n }, () => [fx(), fy()]); const area = s.reduce((a, [x, y], i) => { const [x2, y2] = s[(i + 1) % n]; return a + x * y2 - x2 * y; }, 0); if (polyOK(s) && Math.abs(area) >= 4) return s; } }
export const reflection = imageMod({
  id: 'reflection', giver: 'hind', icon: '🪞', place: 'المرآة', title: 'بركة المرايا', stand: POOL_STAND,
  intro: n => [{ who: 'hind', text: `أهلاً يا ${n}! أنا هند، أرسم لوحات على بلاط بركة المرايا.` }, { who: 'hind', text: 'ارسم صورة كل شكل في خط المرآة الأحمر: ضع رؤوس الصورة على الشبكة، فالصورة على البُعد نفسه من الخط لكن في الجهة الأخرى.' }],
  make: () => [
    (() => { const s = randShape(() => R(0, 3), () => R(1, 7), 3); return { text: 'انعكاس في خط المرآة العمودي', line: 'v', shape: s, image: s.map(([x, y]) => [8 - x, y]) }; })(),
    (() => { const s = randShape(() => R(1, 7), () => R(0, 3), 4); return { text: 'انعكاس في خط المرآة الأفقي', line: 'h', shape: s, image: s.map(([x, y]) => [x, 8 - y]) }; })(),
    (() => { const s = randShape(() => R(0, 3), () => R(0, 8), 3); return { text: 'انعكاس آخر في الخط العمودي', line: 'v', shape: s, image: s.map(([x, y]) => [8 - x, y]) }; })()
  ],
  guide(c, r, X) { c.strokeStyle = '#E2475C'; c.lineWidth = 3; c.setLineDash([8, 5]); c.beginPath(); if (r.line === 'v') { c.moveTo(X(4), X(0)); c.lineTo(X(4), X(8)); } else { c.moveTo(X(0), X(4)); c.lineTo(X(8), X(4)); } c.stroke(); c.setLineDash([]); },
  outro: [{ who: 'hind', text: 'لوحة متناظرة كأن الماء مرآة حقيقية!' }],
  world(d, t, active, done) { if (!done) return []; return [{ y: POOL.y + POOL.h, draw: c => { c.fillStyle = '#2F6FB2'; c.globalAlpha = .55; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(POOL.x + POOL.w / 2 + s * 10, POOL.y + 30); c.lineTo(POOL.x + POOL.w / 2 + s * 50, POOL.y + 60); c.lineTo(POOL.x + POOL.w / 2 + s * 14, POOL.y + 90); c.closePath(); c.fill(); } c.globalAlpha = 1; } }]; }
});
const rot = (s, k) => s.map(([x, y]) => { const dx = x - 4, dy = y - 4; return k === 90 ? [4 - dy, 4 + dx] : k === 180 ? [4 - dx, 4 - dy] : [4 + dy, 4 - dx]; });
export const rotation = imageMod({
  id: 'rotation', giver: 'sulaiman', icon: '🌀', place: 'الطاحونة', title: 'طاحونة الهواء', stand: MILL_STAND,
  intro: n => [{ who: 'sulaiman', text: `مرحباً يا ${n}! أنا سليمان صاحب طاحونة الهواء. أشرعتها انكسرت وأريد تركيبها.` }, { who: 'sulaiman', text: 'كل شراع يدور حول المحور الأحمر. ارسم موضع الشراع بعد الدوران المطلوب.' }],
  make: () => {
    const mk = () => randShape(() => R(4, 7), () => R(1, 4), 3);
    return [{ k: 90, text: 'أدر الشراع ٩٠° مع عقارب الساعة حول المحور' }, { k: 180, text: 'أدر الشراع ١٨٠° حول المحور' }, { k: 270, text: 'أدر الشراع ٩٠° عكس عقارب الساعة حول المحور' }].map(r => { let s; do { s = mk(); } while (!polyOK(rot(s, r.k))); return Object.assign(r, { shape: s, image: rot(s, r.k) }); });
  },
  guide(c, r, X) { c.fillStyle = '#E2475C'; c.beginPath(); c.arc(X(4), X(4), 7, 0, 7); c.fill(); c.strokeStyle = '#E2475C'; c.lineWidth = 2; c.beginPath(); c.arc(X(4), X(4), 18, -1.2, r.k === 270 ? -2.6 : .4, r.k === 270); c.stroke(); },
  outro: [{ who: 'sulaiman', text: 'الأشرعة في مواضعها، والطاحونة تدور من جديد!' }],
  world(d, t, active, done) { return [{ y: MILL.y, draw: c => { const x = MILL.x, y = MILL.y; c.fillStyle = '#C9B48E'; c.beginPath(); c.moveTo(x - 20, y); c.lineTo(x + 20, y); c.lineTo(x + 10, y - 70); c.lineTo(x - 10, y - 70); c.closePath(); c.fill();
    const a = done ? t * 2 : 0.3; for (let i = 0; i < 4; i++) { if (!done && i > 0 && i >= (d.r || 0) + 1) continue; c.save(); c.translate(x, y - 70); c.rotate(a + i * Math.PI / 2); c.fillStyle = '#F4F1E8'; c.fillRect(2, -5, 42, 10); c.restore(); }
    c.fillStyle = '#5B4636'; c.beginPath(); c.arc(x, y - 70, 5, 0, 7); c.fill(); } }]; }
});

/* ═══ ٢٣. الإحداثيات — «خريطة الكنز» ═══ */
const BP = (gx, gy) => ({ x: BEACH.ox + gx * BEACH.u, y: BEACH.oy - gy * BEACH.u });
export const coordinates = {
  id: 'coordinates', giver: 'majid',
  intro: n => [
    { who: 'majid', text: `يا ${n}! أنا الجد ماجد. عندي خريطة كنز قديمة لهذا الشاطئ.` },
    { who: 'majid', text: 'الخريطة تعطي كل كنز بزوج مرتّب (س، ص): الأول على المحور الأفقي والثاني على العمودي. قف عند النقطة واحفر!' }
  ],
  begin(d) { const q = shuffle([[1, 1], [-1, 1], [-1, -1], [1, -1]]).slice(0, 3); d.targets = q.map(([sx, sy]) => [sx * R(1, 5), sy * R(1, 3)]); d.r = 0; d.dug = []; },
  goal: d => { const p = d.targets[Math.min(d.r, 2)]; return `⛏️ احفر عند النقطة ${pt(p[0], p[1])} على شاطئ الإحداثيات (${ar(Math.min(d.r + 1, 3))} من ${ar(3)})`; },
  target: (d, W) => (Math.abs(W.player.x - BEACH.ox) < 240 && Math.abs(W.player.y - BEACH.oy) < 150) ? null : { x: BEACH.ox, y: BEACH.oy },
  taps: () => [],
  actions(W, d) {
    const gx = Math.round((W.player.x - BEACH.ox) / BEACH.u), gy = Math.round((BEACH.oy - W.player.y) / BEACH.u), p = BP(gx, gy);
    if (Math.abs(gx) > BEACH.xr || Math.abs(gy) > BEACH.yr || Math.hypot(W.player.x - p.x, W.player.y - p.y) > 16) return [];
    return [{ key: 'dig' + gx + '_' + gy, label: '⛏️ احفر هنا', kind: 'go', run: () => this.dig(W, d, gx, gy) }];
  },
  async dig(W, d, gx, gy) {
    const p = BP(gx, gy), t = d.targets[d.r]; puff(p.x, p.y, '#E3C98F', 8); sfx('drop');
    if (gx === t[0] && gy === t[1]) { d.dug.push([gx, gy]); d.r++; sfx('win'); say(p.x, p.y - 50, '💰 كنز!', '#1FA05A', 1600); changed();
      if (d.r >= 3) await finish(W, 'coordinates', [{ who: 'majid', text: 'الكنوز الثلاثة! قرأتَ الخريطة كبحّار خبير.' }], 60); }
    else { await wait(300); say(p.x, p.y - 50, `حفرتَ عند ${pt(gx, gy)}، والرمل فارغ`, '#B7791F', 2400); }
  },
  draw(d) { return (d.dug || []).map(([gx, gy]) => { const p = BP(gx, gy); return { y: p.y, x: p.x, draw: c => {   // صندوق كنز مفتوح: حفرة رمل، جسم خشبي بأطواق ذهبية، وغطاء مرفوع يلمع ما بداخله
    c.fillStyle = 'rgba(120,85,40,.35)'; c.beginPath(); c.ellipse(p.x, p.y, 18, 6, 0, 0, 7); c.fill();
    c.fillStyle = '#6E4524'; c.beginPath(); c.moveTo(p.x - 13, p.y - 16); c.lineTo(p.x - 10, p.y - 30); c.lineTo(p.x + 10, p.y - 30); c.lineTo(p.x + 13, p.y - 16); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
    c.fillStyle = '#FFD45E'; c.beginPath(); c.ellipse(p.x, p.y - 16, 11, 3.5, 0, 0, 7); c.fill(); c.fillStyle = '#FFF2B0'; [[-5, -17], [3, -18], [6, -16]].forEach(([dx, dy]) => { c.beginPath(); c.arc(p.x + dx, p.y + dy, 1.6, 0, 7); c.fill(); });
    const g = c.createLinearGradient(p.x - 13, 0, p.x + 13, 0); g.addColorStop(0, '#A06A36'); g.addColorStop(1, '#7A4A22'); c.fillStyle = g; c.fillRect(p.x - 13, p.y - 16, 26, 15);
    c.fillStyle = '#E3B04B'; c.fillRect(p.x - 13, p.y - 16, 26, 2.5); c.fillRect(p.x - 9, p.y - 16, 2.5, 15); c.fillRect(p.x + 6.5, p.y - 16, 2.5, 15); c.fillRect(p.x - 2, p.y - 11, 4, 5);
    c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(p.x - 13, p.y - 16, 26, 15);
  } }; }); }
};

export const UNIT3 = { shapesIdentify, shapes3D, nets, triangleAngles, translation, reflection, rotation, coordinates };
