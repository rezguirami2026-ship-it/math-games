// الصف الخامس — الميناء (الوحدة ٥: الأشكال، والوحدة ٦: الموقع والحركة في الكتاب).
// خمس محطات: حبال تُدار حتى تتوازى أو تتعامد، لوح دبابيس للأشرعة، شبكة صندوق تُطوى فعلاً، عوامات على الإحداثيات،
// وقارب يُنقل بالأسهم ويُعكس في المرآة. الشبكات في الربع الأول كما في المنهج.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, panel, sheetOpen, msgBox, btn } from '../bench.js';
import { step, at, advance, out, shadowE } from './common.js';

/* المحطات: أماكن مفتوحة قرب أصحابها في الميناء (فُحصت بالتصادم وبعيدة عن محطات السادس) */
export const ST5H = {
  ropes: { x: 2630, y: 560 },     // سيف: حبال المرسى
  sails: { x: 2832, y: 352 },     // ليلى: أشرعة السفن
  boxes: { x: 2412, y: 394 },     // ريم: صناديق الشحن
  buoys: { x: 2820, y: 1265 },    // بدر: عوامات الميناء
  mirror: { x: 2442, y: 1360 }    // هند: رصيف المرايا (جنوب البركة؛ غرب x = 2300 سور الميناء)
};
const N = n => ar(n);
const pt = (x, y) => `(${ar(x)}، ${ar(y)})`;
const SQ = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;

/* شبكة الربع الأول قابلة للنقر: كل تقاطع زر خفي data-p="x,y" */
function qgrid({ n = 8, pts = [], shapes = [], mirror = null, click = false, w = 300 } = {}) {
  const s = 30, o = 24, X = x => o + x * s, Y = y => o + (n - y) * s, W = o * 2 + n * s; let g = `<svg viewBox="0 0 ${W} ${W}" class="g5q" style="max-width:${w}px">`;
  for (let i = 0; i <= n; i++) g += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(n)}" stroke="#D5DBE8"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}" stroke="#D5DBE8"/>`;
  g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(n) + 8}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(n) - 8}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = 0; i <= n; i++) g += `<text x="${X(i)}" y="${Y(0) + 16}" font-size="11" font-weight="800" fill="${INK}" text-anchor="middle">${ar(i)}</text>` + (i ? `<text x="${X(0) - 9}" y="${Y(i) + 4}" font-size="11" font-weight="800" fill="${INK}" text-anchor="end">${ar(i)}</text>` : '');
  if (mirror) g += mirror.x != null ? `<line x1="${X(mirror.x)}" y1="${Y(0)}" x2="${X(mirror.x)}" y2="${Y(n)}" stroke="#2E9E5B" stroke-width="4" stroke-dasharray="7 5"/>` : `<line x1="${X(0)}" y1="${Y(mirror.y)}" x2="${X(n)}" y2="${Y(mirror.y)}" stroke="#2E9E5B" stroke-width="4" stroke-dasharray="7 5"/>`;
  shapes.forEach(sh => { g += `<polygon points="${sh.p.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="${sh.c || '#FFE3A3'}" fill-opacity=".85" stroke="${INK}" stroke-width="2" ${sh.dash ? 'stroke-dasharray="6 4"' : ''}/>`; });
  pts.forEach(p => { g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="6" fill="${p.c || '#E2475C'}" stroke="#fff" stroke-width="1.5"/>` + (p.l ? `<text x="${X(p.x) + 9}" y="${Y(p.y) - 8}" font-size="14" font-weight="900" fill="${p.c || '#E2475C'}">${p.l}</text>` : ''); });
  if (click) for (let x = 0; x <= n; x++) for (let y = 0; y <= n; y++) g += `<circle class="hit" data-p="${x},${y}" cx="${X(x)}" cy="${Y(y)}" r="12" fill="transparent"/>`;
  return g + '</svg>';
}
const onPoint = fn => panel().querySelectorAll('[data-p]').forEach(c => c.addEventListener('click', e => { e.stopPropagation(); const [x, y] = c.dataset.p.split(',').map(Number); fn(x, y); }));

/* ── رسوم المحطات ── */
function sign(c, x, y, t, bg, dx = 96) { bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg }); }
function ropesProp(c, x, y, d, t) {   // عمودا مرسى وحبلان
  shadowE(c, x, y, 40);
  [[-30], [30]].forEach(([dx]) => { c.fillStyle = '#5E6B78'; rr(c, x + dx - 6, y - 30, 12, 30, 3); c.fill(); c.fillStyle = '#8994A0'; c.beginPath(); c.ellipse(x + dx, y - 30, 7, 3, 0, 0, 7); c.fill(); });
  c.strokeStyle = '#C9A06A'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 30, y - 24); c.quadraticCurveTo(x, y - 12 + Math.sin(t) * 2, x + 30, y - 24); c.stroke();
  c.beginPath(); c.moveTo(x - 30, y - 14); c.quadraticCurveTo(x, y - 2 + Math.sin(t + 1) * 2, x + 30, y - 14); c.stroke();
  sign(c, x, y, '⚓ حبال المرسى', '#2F6B73');
}
function sailsProp(c, x, y, d, t) {   // صاري وشراع مثلث ولوح دبابيس
  shadowE(c, x, y, 34);
  c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 80, 4, 80);
  c.fillStyle = '#FFF6E2'; c.beginPath(); c.moveTo(x + 2, y - 78); c.lineTo(x + 34 + Math.sin(t * 2) * 2, y - 24); c.lineTo(x + 2, y - 24); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#C9A06A'; rr(c, x - 40, y - 34, 30, 30, 3); c.fill(); c.stroke(); c.fillStyle = INK; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(x - 33 + i * 8, y - 27 + j * 8, 1.4, 0, 7); c.fill(); }
  sign(c, x, y, '⛵ أشرعة السفن', '#B0476A', -100);
}
function boxesProp(c, x, y) {   // صناديق شحن مكدسة وشبكة مفرودة
  workTable(c, x, y);
  c.fillStyle = '#FFE3A3'; [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]].forEach(([i, j]) => { c.fillRect(x - 22 + i * 9, y - 44 + j * 5, 8.5, 4.6); }); c.strokeStyle = INK; c.lineWidth = .5;
  [[-48, '#B5651D'], [46, '#8A5A30']].forEach(([dx, col]) => { c.fillStyle = col; rr(c, x + dx - 10, y - 20, 20, 20, 2); c.fill(); c.stroke(); });
  sign(c, x, y, '📦 صناديق الشحن', '#8A5A30');
}
function buoysProp(c, x, y, d, t) {   // لوح شبكة صغير وعوامات حمراء
  shadowE(c, x, y, 34);
  c.fillStyle = '#1F5D7A'; rr(c, x - 26, y - 56, 52, 44, 4); c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = .7;
  for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x - 26 + i * 8.7, y - 56); c.lineTo(x - 26 + i * 8.7, y - 12); c.stroke(); c.beginPath(); c.moveTo(x - 26, y - 56 + i * 7.3); c.lineTo(x + 26, y - 56 + i * 7.3); c.stroke(); }
  c.fillStyle = PAL.wood; c.fillRect(x - 3, y - 12, 6, 12);
  [[34, 0], [46, 4]].forEach(([dx, ph]) => { const by = y - 6 + Math.sin(t * 2 + ph) * 2; c.fillStyle = '#E2475C'; c.beginPath(); c.arc(x + dx, by, 6, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(x + dx - 6, by - 1.5, 12, 3); });
  sign(c, x, y, '🛟 عوامات الميناء', '#C0392B', -102);
}
function mirrorProp(c, x, y, d, t) {   // مرآة كبيرة في إطار خشبي
  shadowE(c, x, y, 30);
  c.fillStyle = PAL.wood; rr(c, x - 22, y - 74, 44, 66, 6); c.fill();
  const g = c.createLinearGradient(x - 16, y - 68, x + 16, y - 14); g.addColorStop(0, '#E8F6FF'); g.addColorStop(.5, '#9FD3E8'); g.addColorStop(1, '#D6EEF8');
  c.fillStyle = g; rr(c, x - 16, y - 68, 32, 54, 4); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x - 10 + Math.sin(t) * 3, y - 64, 4, 46);
  c.fillStyle = '#6B4520'; c.fillRect(x - 3, y - 8, 6, 8);
  sign(c, x, y, '🪞 رصيف المرايا', '#2E9E5B', -98);   // يميناً شبكة الشاطئ (درس السادس)
}

/* ═══ ٥-١ الخطوط المتوازية والمتعامدة — «حبال المرسى» (إدارة الحبل الثاني) ═══ */
function ropesSvg(a1, a2) {
  const L = 95, line = (cx, cy, a, col) => { const r = a * Math.PI / 180; return `<line x1="${cx - L * Math.cos(r)}" y1="${cy + L * Math.sin(r)}" x2="${cx + L * Math.cos(r)}" y2="${cy - L * Math.sin(r)}" stroke="${col}" stroke-width="7" stroke-linecap="round"/>`; };
  return `<svg viewBox="0 0 240 220" class="g5q" style="max-width:240px"><rect x="0" y="0" width="240" height="220" rx="14" fill="#BFE6F5"/>${line(120, 110, a1, '#B5651D')}${line(120, a2 % 180 === a1 % 180 ? 70 : 110, a2, '#2A1B66')}</svg>`;
}
export const parallelPerp5 = Object.assign({
  id: 'parallelPerp5', giver: 'saif',
  intro: n => [{ who: 'saif', text: `أهلاً يا ${n}! الريح أفلتت حبال المرسى، والسفن تحتاج حبالاً مشدودة بدقة.` },
    { who: 'saif', text: 'الحبل البني مثبّت. أدر الحبل الأزرق حتى يصبح موازياً له أو متعامداً عليه كما يطلب الربّان.' }],
  begin(d) { const a = [0, 30, 45, 60, 90, 120, 135][R(0, 6)]; d.rounds = shuffle(['par', 'perp']).concat([['par', 'perp'][R(0, 1)]]).map((k, i) => ({ k, a1: (a + i * 30) % 180 })); d.r = 0; d.a2 = (d.rounds[0].a1 + 60) % 180; },
  goal: d => `⚓ شدّ حبال المرسى ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>⚓ حبال المرسى</h3>${msgBox((msg ? msg + ' ' : '') + `أدر الحبل الأزرق حتى يصبح <b>${r.k === 'par' ? 'موازياً' : 'متعامداً على'}</b> ${r.k === 'par' ? 'للحبل البني' : 'الحبل البني'}.`, kind)}
      <div class="g5center">${ropesSvg(r.a1, d.a2)}</div>
      <div class="row2"><button class="act" id="rotL">↺ أدر ١٥°</button><button class="act" id="rotR">↻ أدر ١٥°</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⚓ اربط الحبل</button></div>`);
    btn('rotL', () => { d.a2 = (d.a2 + 15) % 180; sfx('click'); this.open(W, d, msg, kind); });
    btn('rotR', () => { d.a2 = (d.a2 + 165) % 180; sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const diff = ((d.a2 - r.a1) % 180 + 180) % 180, ok = r.k === 'par' ? diff === 0 : diff === 90;
      if (ok) await advance(this, W, d, 3, 'parallelPerp5', [{ who: 'saif', text: 'كل الحبال مشدودة كما ينبغي! تميّز التوازي من التعامد بنظرة.' }], d2 => { d2.a2 = (d2.rounds[d2.r].a1 + 45) % 180; });
      else { sfx('cough'); this.open(W, d, r.k === 'par' ? 'الحبلان سيلتقيان إذا مددناهما! المتوازيان تبقى المسافة بينهما ثابتة.' : 'الزاوية بينهما ليست قائمة. تخيّل ركن الورقة.', 'bad'); }
    });
  }
}, at(ST5H.ropes, 'ropes', '⚓ حبال المرسى', ropesProp));

/* ═══ ٥-٢ المثلثات — «أشرعة السفن» (ثلاثة دبابيس على لوح) ═══ */
const KIND = { iso: 'متطابق الضلعين', sca: 'مختلف الأضلاع', rightIso: 'قائم الزاوية ومتطابق الضلعين' };
function triKind(P) {
  const [a, b, c] = [SQ(P[0], P[1]), SQ(P[1], P[2]), SQ(P[0], P[2])].sort((x, y) => x - y), area2 = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]));
  if (!area2) return 'line';
  const iso = a === b || b === c, right = a + b === c;
  return iso && right ? 'rightIso' : iso ? 'iso' : 'sca';
}
export const triangles5a = Object.assign({
  id: 'triangles5a', giver: 'layla',
  intro: n => [{ who: 'layla', text: `مرحباً يا ${n}! أنا ليلى خيّاطة الأشرعة. أرسم كل شراع بثلاثة دبابيس على اللوح.` },
    { who: 'layla', text: 'اختر ثلاثة دبابيس لتصنع الشراع المطلوب. تستطيع أن تقيس الأضلاع بعدّ المربعات.' }],
  begin(d) { d.rounds = shuffle(['iso', 'sca']).concat(['rightIso']); d.r = 0; d.pins = []; },
  goal: d => `⛵ خِط أشرعة ليلى ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const k = d.rounds[d.r], P = d.pins;
    sheetOpen(`<h3>⛵ شراع ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + `اختر ثلاثة دبابيس لشراع <b>${KIND[k]}</b>.`, kind)}
      <div class="g5center">${qgrid({ n: 6, click: true, pts: P.map(([x, y]) => ({ x, y })), shapes: P.length === 3 ? [{ p: P, c: '#FFF6E2' }] : [], w: 260 })}</div>
      <div class="row2"><button class="act ghost" id="pClr"${P.length ? '' : ' disabled'}>↩ أزل الدبابيس</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${P.length === 3 ? '' : ' disabled'}>⛵ ارفع الشراع</button></div>`);
    onPoint((x, y) => { if (P.some(p => p[0] === x && p[1] === y)) d.pins = P.filter(p => p[0] !== x || p[1] !== y); else if (P.length < 3) P.push([x, y]); sfx('click'); this.open(W, d, msg, kind); });
    btn('pClr', () => { d.pins = []; this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const got = triKind(P);
      if (got === k || (k === 'iso' && got === 'rightIso')) { d.pins = []; await advance(this, W, d, 3, 'triangles5a', [{ who: 'layla', text: 'أشرعة جميلة ومتينة! تعرف أنواع المثلثات من أطوال أضلاعها.' }]); }
      else { sfx('cough'); d.pins = []; this.open(W, d, got === 'line' ? 'الدبابيس الثلاثة على خط واحد: هذا ليس مثلثاً!' : `هذا شراع ${KIND[got]}، والمطلوب ${KIND[k]}. قارن أطوال الأضلاع.`, 'bad'); }
    });
  }
}, at(ST5H.sails, 'sails', '⛵ أشرعة السفن', sailsProp));

/* ═══ ٥-٣ المكعب ومتوازي المستطيلات — «صناديق الشحن» (شبكة تُطوى فعلاً) ═══ */
// طيّ الشبكة: ندحرج مكعباً من خلية إلى جارتها، والوجه الملامس للأرض في كل خلية يجب أن يكون مختلفاً
function foldFaces(cells) {
  const key = (x, y) => x + ',' + y, set = new Set(cells.map(([x, y]) => key(x, y))), seen = new Map(), q = [[cells[0][0], cells[0][1], { D: 0, U: 1, N: 2, S: 3, E: 4, W: 5 }]];
  seen.set(key(cells[0][0], cells[0][1]), 0);
  const roll = { E: c => ({ D: c.E, E: c.U, U: c.W, W: c.D, N: c.N, S: c.S }), W: c => ({ D: c.W, W: c.U, U: c.E, E: c.D, N: c.N, S: c.S }), N: c => ({ D: c.N, N: c.U, U: c.S, S: c.D, E: c.E, W: c.W }), S: c => ({ D: c.S, S: c.U, U: c.N, N: c.D, E: c.E, W: c.W }) };
  while (q.length) { const [x, y, c] = q.shift(); [['E', 1, 0], ['W', -1, 0], ['N', 0, -1], ['S', 0, 1]].forEach(([dir, dx, dy]) => { const k = key(x + dx, y + dy); if (set.has(k) && !seen.has(k)) { const nc = roll[dir](c); seen.set(k, nc.D); q.push([x + dx, y + dy, nc]); } }); }
  return seen.size === cells.length ? new Set(seen.values()).size === cells.length : false;
}
export const cuboids5 = Object.assign({
  id: 'cuboids5', giver: 'reem',
  intro: n => [{ who: 'reem', text: `أهلاً يا ${n}! أنا ريم، أصنع صناديق الشحن من ألواح كرتون مفرودة.` },
    { who: 'reem', text: 'لوّن مربعات الشبكة التي تُطوى صندوقاً مكعباً. الصندوق المغلق ستة أوجه، والمفتوح خمسة.' }],
  begin(d) { d.rounds = [{ need: 6, closed: true }, { need: 5, closed: false }, { need: 6, closed: true, differ: true }]; d.r = 0; d.cells = []; d.first = null; },
  goal: d => `📦 اصنع صناديق ريم ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], C = d.cells, on = (x, y) => C.some(c => c[0] === x && c[1] === y);
    sheetOpen(`<h3>📦 صندوق ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + `لوّن <b>${N(r.need)}</b> مربعات تُطوى صندوقاً مكعباً <b>${r.closed ? 'مغلقاً' : 'مفتوحاً من الأعلى'}</b>${r.differ ? '، بشكل يختلف عن شبكتك الأولى' : ''}.`, kind)}
      <div class="g5net">${Array.from({ length: 4 }, (_, y) => Array.from({ length: 5 }, (_, x) => `<button class="g5sq${on(x, y) ? ' on' : ''}" data-c="${x},${y}"></button>`).join('')).join('')}</div>
      <p class="muted">المربعات الملوّنة: ${N(C.length)} من ${N(r.need)}</p>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${C.length === r.need ? '' : ' disabled'}>📦 اطوِ الصندوق</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const [x, y] = b.dataset.c.split(',').map(Number);
      if (on(x, y)) d.cells = C.filter(c => c[0] !== x || c[1] !== y); else if (C.length < r.need) C.push([x, y]); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const norm = cs => { const mx = Math.min(...cs.map(c => c[0])), my = Math.min(...cs.map(c => c[1])); return cs.map(([x, y]) => (x - mx) + ',' + (y - my)).sort().join('|'); };
      if (!foldFaces(C)) { sfx('cough'); return this.open(W, d, 'عند الطي يتراكب وجهان أو ينفصل مربع، فلا يُغلق الصندوق. جرّب ترتيباً آخر.', 'bad'); }
      if (r.differ && norm(C) === d.first) { sfx('cough'); return this.open(W, d, 'هذه شبكتك الأولى نفسها! جرّب ترتيباً مختلفاً للمربعات.', 'bad'); }
      if (d.r === 0) d.first = norm(C);
      d.cells = []; await advance(this, W, d, 3, 'cuboids5', [{ who: 'reem', text: 'صناديق متقنة! تتخيّل المكعب من شبكته، المغلق والمفتوح.' }]);
    });
  }
}, at(ST5H.boxes, 'boxes', '📦 صناديق الشحن', boxesProp));

/* ═══ ٦-١ الإحداثيات — «عوامات الميناء» (وضع العوامات، والركن الرابع) ═══ */
export const coords5a = Object.assign({
  id: 'coords5a', giver: 'badr',
  intro: n => [{ who: 'badr', text: `أهلاً يا ${n}! خريطة الميناء شبكة إحداثيات، والعوامات تدل السفن على الممر الآمن.` },
    { who: 'badr', text: 'العدد الأول أفقياً على المحور (س)، والثاني رأسياً على المحور (ص). اضغط التقاطع الصحيح لتضع العوامة.' }],
  begin(d) {
    const p1 = [R(1, 7), R(1, 7)], p2 = [R(1, 7), R(1, 7)]; if (p2[0] === p2[1]) p2[1] = p2[0] === 7 ? 6 : p2[0] + 1;
    const x = R(1, 4), y = R(1, 3), w = R(2, 3), h = R(2, 4), C = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], k = R(0, 3);
    d.rounds = [{ t: 'put', p: p1 }, { t: 'put', p: p2 }, { t: 'corner', rest: C.filter((_, i) => i !== k), p: C[k] }]; d.r = 0;
  },
  goal: d => `🛟 ضع عوامات بدر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    const text = r.t === 'put' ? `ضع العوامة عند <b>${pt(...r.p)}</b>.` : `ثلاث عوامات عند أركان مستطيل: ${r.rest.map(p => pt(...p)).join(' و')}. اضغط مكان العوامة الرابعة.`;
    sheetOpen(`<h3>🛟 خريطة الميناء</h3>${msgBox((msg ? msg + ' ' : '') + text, kind)}<div class="g5center">${qgrid({ click: true, pts: r.t === 'corner' ? r.rest.map(([x, y]) => ({ x, y })) : [] })}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    out();
    onPoint(async (x, y) => {
      if (x === r.p[0] && y === r.p[1]) await advance(this, W, d, 3, 'coords5a', [{ who: 'badr', text: 'الممر الآمن واضح للسفن! تقرأ الإحداثيات وتحدد مواضعها بدقة.' }]);
      else { sfx('cough'); this.open(W, d, x === r.p[1] && y === r.p[0] ? `وضعتها عند ${pt(x, y)}: بدّلتَ العددين! الأول أفقي (س) والثاني رأسي (ص).` : `العوامة عند ${pt(x, y)}، وليست حيث نريد.`, 'bad'); }
    });
  }
}, at(ST5H.buoys, 'buoys', '🛟 عوامات الميناء', buoysProp));

/* ═══ ٦-٢ الانسحاب والانعكاس — «رصيف المرايا» (أسهم الانسحاب، ورؤوس الصورة في المرآة) ═══ */
const BOAT = [[0, 0], [3, 0], [2, 1], [1, 1]];
export const transReflect5 = Object.assign({
  id: 'transReflect5', giver: 'hind',
  intro: n => [{ who: 'hind', text: `مرحباً يا ${n}! أنا هند. على رصيف المرايا نحرّك القوارب ونرى صورها في الماء.` },
    { who: 'hind', text: 'الانسحاب حركة في خط مستقيم دون دوران. والانعكاس صورة المرآة: كل نقطة على البعد نفسه من خط المرآة.' }],
  begin(d) {
    const sx = R(0, 1), sy = R(0, 2), dx = R(3, 4), dy = R(3, 4), tx = R(0, 2), ty = R(4, 6), tdx = R(2, 3), tdy = -R(2, 3);   // القارب عرضه ٣: أقصى موضع س = ٥
    const k = R(3, 4), A = [[k - R(1, 2), R(1, 3)], [k - 1, R(4, 6)], [k - R(2, 3), R(5, 7)]];
    d.rounds = [{ t: 'move', at: [sx, sy], to: [sx + dx, sy + dy], say: `انقل القارب <b>${N(dx)}</b> وحدات يميناً و<b>${N(dy)}</b> وحدات لأعلى.` },
      { t: 'move', at: [tx, ty], to: [tx + tdx, ty + tdy], say: 'انقل القارب حتى يطابق ظله المنقّط تماماً.', ghost: true },
      { t: 'mirror', k, A }];
    d.r = 0; d.pos = d.rounds[0].at.slice(); d.img = [];
  },
  goal: d => `🪞 حرّك قوارب هند ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hind', text: 'قوارب وصور في مكانها تماماً! تعرف الانسحاب والانعكاس.' }];
    if (r.t === 'mirror') {
      const want = r.A.map(([x, y]) => [2 * r.k - x, y]);
      sheetOpen(`<h3>🪞 المرآة</h3>${msgBox((msg ? msg + ' ' : '') + 'اضغط رؤوس صورة المثلث في المرآة الخضراء (ثلاثة رؤوس).', kind)}
        <div class="g5center">${qgrid({ click: true, mirror: { x: r.k }, shapes: [{ p: r.A }].concat(d.img.length === 3 ? [{ p: d.img, c: '#BFE6F5' }] : []), pts: d.img.map(([x, y]) => ({ x, y, c: '#2F6FB2' })) })}</div>
        <div class="row2"><button class="act ghost" id="iClr"${d.img.length ? '' : ' disabled'}>↩ امسح الرؤوس</button></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.img.length === 3 ? '' : ' disabled'}>✓ هذه صورته</button></div>`);
      onPoint((x, y) => { if (d.img.some(p => p[0] === x && p[1] === y)) d.img = d.img.filter(p => p[0] !== x || p[1] !== y); else if (d.img.length < 3) d.img.push([x, y]); sfx('click'); this.open(W, d, msg, kind); });
      btn('iClr', () => { d.img = []; this.open(W, d, msg, kind); });
      out();
      return btn('benchGo', async () => {
        const bad = d.img.filter(p => !want.some(q => q[0] === p[0] && q[1] === p[1]));
        if (!bad.length) { d.img = []; await advance(this, W, d, 3, 'transReflect5', L); }
        else { sfx('cough'); d.img = d.img.filter(p => !bad.includes(p)); this.open(W, d, `الرأس ${pt(...bad[0])} ليس صورة لأي رأس: عُدّ المربعات من الرأس إلى المرآة، ثم العدد نفسه بعدها.`, 'bad'); }
      });
    }
    const B = BOAT.map(([x, y]) => [x + d.pos[0], y + d.pos[1]]), G = r.ghost ? BOAT.map(([x, y]) => [x + r.to[0], y + r.to[1]]) : null;
    sheetOpen(`<h3>⛵ انسحاب القارب</h3>${msgBox((msg ? msg + ' ' : '') + r.say, kind)}
      <div class="g5center">${qgrid({ shapes: (G ? [{ p: G, c: '#E8EEF6', dash: true }] : []).concat([{ p: B, c: '#FFC23D' }]) })}</div>
      <div class="row2" style="direction:ltr"><button class="act" data-m="-1,0">⬅</button><button class="act" data-m="0,1">⬆</button><button class="act" data-m="0,-1">⬇</button><button class="act" data-m="1,0">➡</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⚓ ثبّت القارب</button></div>`);
    panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => { e.stopPropagation(); const [mx, my] = b.dataset.m.split(',').map(Number); d.pos = [Math.max(0, Math.min(5, d.pos[0] + mx)), Math.max(0, Math.min(7, d.pos[1] + my))]; sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.pos[0] === r.to[0] && d.pos[1] === r.to[1]) await advance(this, W, d, 3, 'transReflect5', L, d2 => { const n = d2.rounds[d2.r]; if (n.at) d2.pos = n.at.slice(); });
      else { sfx('cough'); d.pos = r.at.slice(); this.open(W, d, r.ghost ? 'القارب لا يطابق ظله: عُدّ الوحدات يميناً أو يساراً ثم لأعلى أو لأسفل.' : 'القارب ليس في المكان المطلوب. أعدتُه إلى البداية: عُدّ الوحدات بدقة.', 'bad'); }
    });
  }
}, at(ST5H.mirror, 'mirror', '🪞 رصيف المرايا', mirrorProp));

export const G5U3 = { parallelPerp5, triangles5a, cuboids5, coords5a, transReflect5 };
