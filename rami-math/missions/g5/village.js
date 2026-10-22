// الصف الخامس — قرية الخير (الوحدة ١: الأعداد الكاملة، والوحدة ٢: الجمع والطرح في الكتاب).
// خمس محطات قرب أصحابها، لكل درس أداة مختلفة في يد الطالب: عجلات عدّاد، بوابات سباق، عقد خرز، ميزان، دفتر وقارب.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable } from '../../world/art.js';
import { bubble } from '../../world/entities.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, sheetClose, msgBox, setMsg, btn } from '../bench.js';
import { H, step, at, advance, kp, out, shadowE } from './common.js';

/* المحطات: أماكن مفتوحة قرب كل صاحب مهمة (فُحصت بالتصادم: لا مبنى ولا جدار تحتها) */
export const ST5V = {
  meter: { x: 1375, y: 1395 },   // راشد: عدّاد خزان الماء
  race: { x: 523, y: 898 },      // يوسف: سباق الهجن (شمال مكتب البريد حتى لا يعلو سقفه في 3D)
  beads: { x: 1030, y: 622 },    // أم خالد: عقد اللؤلؤ
  scale: { x: 1078, y: 992 },    // العم حمد: ميزان التمر
  box: { x: 288, y: 938 }        // العم ناصر: صندوق الخير
};
const PV = [100000, 10000, 1000, 100, 10, 1], PLACE = ['مئات الآلاف', 'عشرات الآلاف', 'الآلاف', 'المئات', 'العشرات', 'الآحاد'];
const SHORT = ['مئات آلاف', 'عشرات آلاف', 'آلاف', 'مئات', 'عشرات', 'آحاد'];
const digits6 = n => PV.map(p => Math.floor(n / p) % 10);

/* ── رسوم المحطات في العالم ── */
function tankProp(c, x, y, d) {   // خزان ماء أسطواني على قاعدة، وعدّاد بستة أرقام
  shadowE(c, x, y, 44);
  c.fillStyle = PAL.wood; [[-30], [24]].forEach(([dx]) => c.fillRect(x + dx, y - 34, 6, 34));
  const g = c.createLinearGradient(x - 36, 0, x + 36, 0); g.addColorStop(0, '#9FD3E8'); g.addColorStop(.45, '#5BA9CC'); g.addColorStop(1, '#2E6F96');
  c.fillStyle = g; rr(c, x - 36, y - 104, 72, 70, 10); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; rr(c, x - 36, y - 104, 72, 70, 10); c.stroke();
  c.fillStyle = '#BFE6F5'; c.beginPath(); c.ellipse(x, y - 104, 36, 8, 0, 0, 7); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; [-80, -58].forEach(dy => { c.beginPath(); c.moveTo(x - 34, y + dy); c.lineTo(x + 34, y + dy); c.stroke(); });
  const v = d.dg ? d.dg : [0, 0, 0, 0, 0, 0];
  c.fillStyle = '#1E1A30'; rr(c, x - 40, y - 30, 80, 20, 4); c.fill();
  c.fillStyle = '#6EF5DE'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.direction = 'ltr'; c.fillText(v.map(ar).join(' '), x, y - 15); c.direction = 'inherit';
  bigSign(c, x - 104, y + 6, '💧 عدّاد الخزان', { fs: 12, h: 30, bg: '#2E6F96' });
}
function raceProp(c, x, y, d, t) {   // خط النهاية: عمودان وراية مقلّمة وأعلام ترفرف
  shadowE(c, x, y, 50);
  c.fillStyle = '#8A8F98'; c.fillRect(x - 48, y - 70, 5, 70); c.fillRect(x + 43, y - 70, 5, 70);
  for (let k = 0; k < 8; k++) for (let j = 0; j < 2; j++) { c.fillStyle = (k + j) % 2 ? '#fff' : '#1E1A30'; c.fillRect(x - 43 + k * 10.75, y - 70 + j * 8, 10.75, 8); }
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 43, y - 70, 86, 16);
  [-46, 46].forEach((dx, i) => { const w = Math.sin(t * 4 + i) * 3; c.fillStyle = i ? '#E2475C' : '#FFC23D'; c.beginPath(); c.moveTo(x + dx, y - 92); c.lineTo(x + dx + 16 + w, y - 86); c.lineTo(x + dx, y - 80); c.closePath(); c.fill(); c.fillStyle = '#6B4520'; c.fillRect(x + dx - 1, y - 92, 2, 22); });
  bigSign(c, x + 112, y + 6, '🐪 سباق الهجن', { fs: 12, h: 30, bg: '#B5651D' });
}
function beadsProp(c, x, y, d, t) {   // طاولة عليها عقد خرز ملوّن
  workTable(c, x, y);
  const C = ['#E2475C', '#FFC23D', '#3FA3F5', '#2E9E5B', '#8E6CF6', '#F5F0E6'];
  for (let k = 0; k < 9; k++) { const a = Math.PI * (k / 8), bx = x - 24 + k * 6, by = y - 34 - Math.sin(a) * 6; c.fillStyle = C[k % 6]; c.beginPath(); c.arc(bx, by, 3.2, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = .6; c.stroke(); }
  bigSign(c, x - 96, y + 6, '📿 عقد اللؤلؤ', { fs: 12, h: 30, bg: '#7B3F98' });
}
function scaleProp(c, x, y, d, t) {   // ميزان بكفّتين وسلّتا تمر
  shadowE(c, x, y, 40);
  c.fillStyle = '#6B4520'; c.fillRect(x - 3, y - 64, 6, 64); c.fillRect(x - 16, y - 4, 32, 5);
  const tilt = Math.sin(t * 1.5) * .04; c.save(); c.translate(x, y - 64); c.rotate(tilt);
  c.strokeStyle = '#4A3420'; c.lineWidth = 3; c.beginPath(); c.moveTo(-36, 0); c.lineTo(36, 0); c.stroke();
  [-36, 36].forEach(dx => { c.lineWidth = 1; c.beginPath(); c.moveTo(dx, 0); c.lineTo(dx - 12, 26); c.moveTo(dx, 0); c.lineTo(dx + 12, 26); c.stroke();
    c.fillStyle = '#C9A06A'; c.beginPath(); c.ellipse(dx, 27, 15, 5, 0, 0, 7); c.fill(); c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#7A3E1C'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(dx - 7 + k * 3.5, 22 - (k % 2) * 2, 2.6, 1.8, 0, 0, 7); c.fill(); } });
  c.restore(); c.fillStyle = '#FFC23D'; c.beginPath(); c.arc(x, y - 64, 4, 0, 7); c.fill();
  bigSign(c, x + 104, y + 6, '⚖️ ميزان التمر', { fs: 12, h: 30, bg: '#B5651D' });
}
function boxProp(c, x, y, d, t) {   // صندوق الخير الأخضر بقلب وفتحة، ودفتر بجانبه
  shadowE(c, x, y, 30);
  c.fillStyle = '#1F7A4D'; rr(c, x - 22, y - 46, 44, 46, 5); c.fill(); c.fillStyle = '#2E9E5B'; rr(c, x - 22, y - 52, 44, 10, 4); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1; rr(c, x - 22, y - 52, 44, 52, 5); c.stroke();
  c.fillStyle = '#1E1A30'; c.fillRect(x - 10, y - 49, 20, 3);
  c.fillStyle = '#FF6B81'; c.beginPath(); c.moveTo(x, y - 14); c.bezierCurveTo(x - 14, y - 24, x - 8, y - 36, x, y - 28); c.bezierCurveTo(x + 8, y - 36, x + 14, y - 24, x, y - 14); c.fill();
  bigSign(c, x + 92, y + 6, '💚 صندوق الخير', { fs: 12, h: 30, bg: '#1F7A4D' });
}

/* ═══ ١-١ القيمة المكانية — «عدّاد خزان الماء» (عجلات بست منازل) ═══ */
export const placeValue5 = Object.assign({
  id: 'placeValue5', giver: 'rashed',
  intro: n => [{ who: 'rashed', text: `أهلاً يا ${n}! عدّاد خزان القرية تعطّل، ويحتاج من يضبط أرقامه بيده.` },
    { who: 'rashed', text: 'للعدّاد ست عجلات: مئات الآلاف، ثم عشرات الآلاف، ثم الآلاف، ثم المئات والعشرات والآحاد. كل رقم قيمته من منزلته.' }],
  begin(d) {
    const n0 = (() => { const g = PV.map((p, i) => i === 0 ? R(1, 9) : R(0, 9)); g[R(2, 4)] = 0; return g.reduce((s, x, i) => s + x * PV[i], 0); })();
    const n1 = R(10, 98) * 1000 + R(100, 999), p = R(1, 3), dg = digits6(n1)[p], k = R(1, Math.max(1, 9 - dg)) * PV[p];
    const x = R(12, 98) * 10 + R(1, 9), mul = R(0, 1) === 1;
    d.rounds = [{ t: 'exp', ans: n0 }, { t: 'add', from: n1, add: k, ans: n1 + k }, mul ? { t: 'mul', x, ans: x * 100 } : { t: 'div', x: x * 100, ans: x }];
    d.r = 0; d.dg = [0, 0, 0, 0, 0, 0];
  },
  text(r) {
    if (r.t === 'exp') return `اضبط العدّاد على: <b>${digits6(r.ans).map((g, i) => g ? ar(g * PV[i]) : null).filter(Boolean).join(' + ')}</b>`;
    if (r.t === 'add') return `العدّاد يقرأ <b>${ar(r.from)}</b>، ثم دخل الخزان <b>${ar(r.add)}</b> لتر. اضبط القراءة الجديدة.`;
    if (r.t === 'mul') return `يستهلك بيت راشد <b>${ar(r.x)}</b> لتراً في الشهر، وتستهلك المدرسة <b>١٠٠</b> مرة قدر ذلك. اضبط العدّاد على استهلاك المدرسة.`;
    return `ماء الخزان الكبير <b>${ar(r.x)}</b> لتر، ويُقسَم بالتساوي على <b>١٠٠</b> بيت. اضبط العدّاد على نصيب البيت الواحد.`;
  },
  goal: d => `💧 اضبط عدّاد الخزان ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], wheel = i => `<div class="wheel"><button class="act ghost" data-w="${i}" data-v="1">▲</button><b id="wd${i}">${ar(d.dg[i])}</b><button class="act ghost" data-w="${i}" data-v="-1">▼</button><small class="wlab">${SHORT[i]}</small></div>`;
    sheetOpen(`<h3>💧 عدّاد خزان الماء</h3>${msgBox(msg ? `${msg} ${this.text(r)}` : this.text(r), kind)}<div class="dials g5dials">${[0, 1, 2, 3, 4, 5].map(wheel).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ ثبّت القراءة</button></div>`);
    panel().querySelectorAll('[data-w]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.w; d.dg[i] = (d.dg[i] + +b.dataset.v + 10) % 10; panel().querySelector('#wd' + i).textContent = ar(d.dg[i]); sfx('click'); });
    out();
    btn('benchGo', async () => {
      const want = digits6(r.ans), k = want.findIndex((g, i) => g !== d.dg[i]);
      if (k < 0) await advance(this, W, d, 3, 'placeValue5', [{ who: 'rashed', text: 'العدّاد يعمل بدقة! تعرف قيمة كل رقم حتى مئات الآلاف، وأثر الضرب والقسمة على ١٠٠.' }],
        d2 => { d2.dg = d2.rounds[d2.r].t === 'add' ? digits6(d2.rounds[d2.r].from) : [0, 0, 0, 0, 0, 0]; });
      else { sfx('cough'); setMsg(`الماء لا يطابق القراءة: راجع عجلة <b>${PLACE[k]}</b>. ${r.t === 'mul' || r.t === 'div' ? 'الضرب في ١٠٠ ينقل الأرقام منزلتين يساراً، والقسمة تنقلها منزلتين يميناً.' : ''} ${this.text(r)}`, 'bad'); }
    });
  }
}, at(ST5V.meter, 'meter', '💧 عدّاد الخزان', tankProp));

/* ═══ ١-٢ الترتيب والتقريب — «سباق الهجن» (بوابات الانطلاق ولوح المسافات) ═══ */
const camelNums = (lo, hi) => { const base = R(lo, hi), ds = [R(1, 9), R(1, 9), R(1, 9)], out = new Set([base]);
  for (let t = 0; out.size < 5 && t < 50; t++) out.add(base + (R(0, 1) ? 1 : -1) * ds[R(0, 2)] * [1000, 100, 10][R(0, 2)] * (R(0, 1) ? 1 : 10)); return [...out].filter(v => v > 0).slice(0, 5); };
export const orderRound5 = Object.assign({
  id: 'orderRound5', giver: 'yousef',
  intro: n => [{ who: 'yousef', text: `يا ${n}! اليوم سباق الهجن، والحكَم يحتاج مساعداً سريعاً.` },
    { who: 'yousef', text: 'رتّب الجمال في بوابات الانطلاق حسب أرقامها، ثم سجّل مسافات الأشواط مقرّبة على لوح النتائج.' }],
  begin(d) {
    let a = camelNums(120000, 880000); while (a.length < 5) a.push(R(100000, 999999));
    let b = camelNums(12000, 88000); while (b.length < 5) b.push(R(10000, 99999));
    const x1 = R(1101, 9899), x2 = R(1101, 9899), u1 = [10, 100][R(0, 1)], u2 = 1000;
    d.rounds = [{ t: 'ord', up: true, list: a }, { t: 'ord', up: false, list: b }, { t: 'rnd', x: x1 % 10 === 5 ? x1 + 1 : x1, u: u1 }, { t: 'rnd', x: x2 % 1000 === 500 ? x2 + 1 : x2, u: u2 }];
    d.r = 0; d.slots = [];
  },
  goal: d => `🐪 ساعد حكَم السباق ${step(d, 4)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'rnd') return kp(this, W, d, { title: '🏁 لوح النتائج', text: `طول الشوط <b>${ar(r.x)}</b> م. اكتبه على اللوح مقرّباً لأقرب <b>${ar(r.u)}</b>.`, ans: Math.round(r.x / r.u) * r.u, n: 4, id: 'orderRound5', msg, kind, opts: { dot: false },
      hint: `ليس هذا التقريب: انظر إلى الرقم الذي على يمين منزلة ${ar(r.u)}؛ ٥ أو أكثر نقرّب للأعلى.`, lines: [{ who: 'yousef', text: 'سباق منظّم! رتّبتَ الجمال بالأرقام وقرّبتَ المسافات بدقة.' }],
      visual: `<div class="g5track">${'🐪'.repeat(3)}<span>🏁</span></div>` });
    const free = r.list.map((v, i) => i).filter(i => !d.slots.includes(i));
    sheetOpen(`<h3>🐪 بوابات الانطلاق</h3>${msgBox((msg ? msg + ' ' : '') + `ضع الجمال في البوابات حسب أرقامها <b>${r.up ? 'تصاعدياً (من الأصغر إلى الأكبر)' : 'تنازلياً (من الأكبر إلى الأصغر)'}</b>. اضغط جملاً ليدخل البوابة التالية، واضغط البوابة لتخرجه.`, kind)}
      <div class="g5slots">${r.list.map((_, k) => `<button class="g5slot${d.slots[k] !== undefined ? ' on' : ''}" data-s="${k}"><small>${ar(k + 1)}</small>${d.slots[k] !== undefined ? `🐪 <b>${ar(r.list[d.slots[k]])}</b>` : '—'}</button>`).join('')}</div>
      <div class="g5cards">${free.map(i => `<button class="g5card" data-c="${i}">🐪 ${ar(r.list[i])}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.slots.length < r.list.length ? ' disabled' : ''}>🏁 ابدأ السباق</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); d.slots.push(+b.dataset.c); sfx('pick'); this.open(W, d); });
    panel().querySelectorAll('[data-s]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.s; if (d.slots[k] === undefined) return; d.slots.splice(k, 1); sfx('drop'); this.open(W, d); });
    out();
    btn('benchGo', async () => {
      const seq = d.slots.map(i => r.list[i]), bad = seq.findIndex((v, k) => k > 0 && (r.up ? v < seq[k - 1] : v > seq[k - 1]));
      if (bad < 0) { d.slots = []; await advance(this, W, d, 4, 'orderRound5', null); }
      else { sfx('cough'); d.slots = []; this.open(W, d, `الحكَم أوقف السباق: الجمل في البوابة ${ar(bad + 1)} ليس في مكانه. قارن الأرقام من أكبر منزلة.`, 'bad'); }
    });
  }
}, at(ST5V.race, 'race', '🐪 بوابات السباق', raceProp));

/* ═══ ١-٣ المتتاليات (١) — «عقد اللؤلؤ» (خرزات ناقصة وصينية خرز) ═══ */
export const sequences5a = Object.assign({
  id: 'sequences5a', giver: 'umkhalid',
  intro: n => [{ who: 'umkhalid', text: `أهلاً يا ${n}! انقطعت عقودي وضاعت بعض خرزاتها.` },
    { who: 'umkhalid', text: 'خرزات كل عقد متتالية بخطوة ثابتة. اختر الخرزة الناقصة، ثم اختر من الصينية الخرزة التي تكمل القاعدة.' }],
  begin(d) {
    const mk = (a, s, n, holes, kind) => ({ terms: Array.from({ length: n }, (_, i) => a + i * s), holes, s, kind });
    const s0 = R(3, 12), a0 = R(20, 90);
    const s1 = -R(3, 9) * 5, a1 = -s1 * R(2, 3) + R(1, 4) * 5;               // تنزل وتعبر الصفر
    const k2 = [25, 50][R(0, 1)], a2 = k2 * R(2, 12);
    d.rounds = [mk(a0, s0, 6, shuffle([1, 2, 3, 4]).slice(0, 2).sort(), 'up'), mk(a1, s1, 7, [3, 5, 6], 'down'), mk(a2, k2, 6, shuffle([1, 2, 3, 4, 5]).slice(0, 2).sort(), 'mult')];
    d.r = 0; d.fill = {}; d.sel = null;
  },
  tray(r) {   // الخرزات الصحيحة ومعها خرزات تشبهها: خطوة ناقصة أو زائدة، أو إشارة معكوسة
    const right = r.holes.map(i => r.terms[i]), wrong = new Set();
    right.forEach(v => [v + Math.sign(r.s) * 5, v - Math.sign(r.s) * 5, r.kind === 'down' ? -v : v + r.s * 3, v + r.s * 2].forEach(w => { if (!right.includes(w) && !r.terms.includes(w)) wrong.add(w); }));
    return [...right, ...[...wrong].slice(0, 4)];
  },
  goal: d => `📿 أكمل عقود أم خالد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (!d.trays) d.trays = {};
    const tray = d.trays[d.r] = d.trays[d.r] || shuffle(this.tray(r)), used = Object.values(d.fill);
    const lead = r.kind === 'down' ? 'هذا العقد ينزل، وقد يعبر الصفر إلى الأعداد السالبة.' : r.kind === 'mult' ? `خرزات هذا العقد من مضاعفات ${ar(r.s)}.` : 'أوجد الخطوة بين خرزتين متجاورتين.';
    sheetOpen(`<h3>📿 عقد ${ar(d.r + 1)}</h3>${msgBox(msg ? `${msg} ${lead}` : lead, kind)}
      <div class="g5beads">${r.terms.map((v, i) => r.holes.includes(i) ? `<button class="g5bead hole${d.sel === i ? ' sel' : ''}${d.fill[i] !== undefined ? ' full' : ''}" data-h="${i}">${d.fill[i] !== undefined ? ar(d.fill[i]) : '؟'}</button>` : `<span class="g5bead">${ar(v)}</span>`).join('<i></i>')}</div>
      <p class="muted">${d.sel === null ? 'اختر خرزة ناقصة (؟) أولاً' : 'اختر من الصينية الخرزة المناسبة'}</p>
      <div class="g5tray">${tray.map(v => `<button class="g5bead${used.includes(v) ? ' used' : ''}" data-v="${v}"${used.includes(v) || d.sel === null ? ' disabled' : ''}>${ar(v)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${r.holes.every(i => d.fill[i] !== undefined) ? '' : ' disabled'}>🔗 اربط العقد</button></div>`);
    panel().querySelectorAll('[data-h]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.h; if (d.fill[i] !== undefined) delete d.fill[i]; d.sel = i; sfx('click'); this.open(W, d, msg, kind); });
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); d.fill[d.sel] = +b.dataset.v; const nx = r.holes.find(i => d.fill[i] === undefined); d.sel = nx === undefined ? null : nx; sfx('drop'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const bad = r.holes.find(i => d.fill[i] !== r.terms[i]);
      if (bad === undefined) { d.fill = {}; d.sel = null; await advance(this, W, d, 3, 'sequences5a', [{ who: 'umkhalid', text: 'عقودي عادت أجمل مما كانت! تعرف قاعدة كل متتالية، صعوداً ونزولاً وتحت الصفر.' }]); }
      else { sfx('cough'); delete d.fill[bad]; d.sel = bad; this.open(W, d, `انفرط العقد: الخرزة رقم ${ar(bad + 1)} لا تتبع القاعدة. ما الخطوة بين الخرزات؟`, 'bad'); }
    });
  }
}, at(ST5V.beads, 'beads', '📿 عقد اللؤلؤ', beadsProp));

/* ═══ ٢-١ الجمع والطرح (١) — «حصاد التمور» (ميزان بأثقال، ثم الأوزان العشرية) ═══ */
const WTS = [1000, 100, 10, 1];
export const addSub5a = Object.assign({
  id: 'addSub5a', giver: 'hamad',
  intro: n => [{ who: 'hamad', text: `حياك يا ${n}! موسم التمر بدأ، والميزان يحتاج من يحسب جيداً.` },
    { who: 'hamad', text: 'عُدّ تصاعدياً بالأثقال: الآلاف ثم المئات ثم العشرات ثم الآحاد. ثم احسب أوزان السلال العشرية.' }],
  begin(d) {
    const from = R(11, 49) * 100 + R(10, 99), add = R(1, 3) * 1000 + R(1, 9) * 100 + R(1, 9) * 10 + R(1, 9);
    const a = R(105, 499) / 10, b = R(21, 99) / 10, c = R(305, 899) / 10, e = R(101, Math.floor(c * 10) - 50) / 10;
    d.rounds = [{ t: 'w', from, to: from + add }, { t: 'add', a, b }, { t: 'sub', a: c, b: e }];
    d.r = 0; d.pan = [];
  },
  goal: d => `⚖️ زِن تمر العم حمد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hamad', text: 'موزون بالغرام! تعدّ بالآلاف والمئات وتجمع وتطرح الأعداد العشرية بثقة.' }];
    if (r.t === 'add') return kp(this, W, d, { title: '🧺 سلتان على الميزان', text: `سلة وزنها <b>${dec(r.a)}</b> كغم وأخرى <b>${dec(r.b)}</b> كغم. كم وزنهما معاً؟`, ans: Math.round((r.a + r.b) * 10) / 10, n: 3, id: 'addSub5a', msg, kind, lines: L,
      hint: 'الميزان لا يوافق: اجمع الأعداد الكاملة ثم الأجزاء من عشرة.' });
    if (r.t === 'sub') return kp(this, W, d, { title: '🧺 بعد البيع', text: `في المخزن <b>${dec(r.a)}</b> كغم من التمر، وبيع منها <b>${dec(r.b)}</b> كغم. كم بقي؟`, ans: Math.round((r.a - r.b) * 10) / 10, n: 3, id: 'addSub5a', msg, kind, lines: L,
      hint: 'ليس هذا الباقي: اطرح الأعداد الكاملة ثم الأجزاء من عشرة، وتحقّق بالجمع.' });
    const sum = r.from + d.pan.reduce((s, x) => s + x, 0);
    sheetOpen(`<h3>⚖️ ميزان التمر</h3>${msgBox((msg ? msg + ' ' : '') + `على الميزان <b>${ar(r.from)}</b> غم. أضف أثقالاً حتى يصبح الوزن <b>${ar(r.to)}</b> غم تماماً.`, kind)}
      <div class="g5scale"><span>🧺 ${ar(r.from)}</span>${d.pan.map(x => `<b>+${ar(x)}</b>`).join('')}</div>
      <div class="row2">${WTS.map(w => `<button class="act" data-wt="${w}">⚖️ +${ar(w)}</button>`).join('')}<button class="act ghost" id="wUndo"${d.pan.length ? '' : ' disabled'}>↩ أنزل آخر ثقل</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.pan.length ? '' : ' disabled'}>✓ اقرأ الميزان</button></div>`);
    panel().querySelectorAll('[data-wt]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.pan.length < 30) d.pan.push(+b.dataset.wt); sfx('drop'); this.open(W, d, msg, kind); });
    btn('wUndo', () => { d.pan.pop(); sfx('pick'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (sum === r.to) { d.pan = []; await advance(this, W, d, 3, 'addSub5a', L); }
      else { sfx('cough'); this.open(W, d, `الميزان يقرأ <b>${ar(sum)}</b> غم، والمطلوب ${ar(r.to)}: ${sum < r.to ? 'ما زال ناقصاً' : 'زاد على المطلوب'}. ابدأ بالآلاف، ثم المئات…`, 'bad'); }
    });
  }
}, at(ST5V.scale, 'scale', '⚖️ ميزان التمر', scaleProp));

/* ═══ ٢-٢ جمع المزيد من الأعداد — «صندوق الخير» (دفتر التبرعات وقارب إنقاذ السلاحف) ═══ */
export const addMore5 = Object.assign({
  id: 'addMore5', giver: 'naser',
  intro: n => [{ who: 'naser', text: `أهلاً يا ${n}! جمعنا تبرعات لإنقاذ سلاحف الريماني في جزيرة مصيرة بعد العاصفة.` },
    { who: 'naser', text: 'اجمع أعداداً كثيرة بالطريقة الكتابية: الآحاد ثم العشرات ثم المئات، ولا تنسَ الحمل.' }],
  begin(d) {
    const led = [R(25, 99), R(105, 299), R(25, 99), R(105, 299)];
    const masses = shuffle(Array.from({ length: 8 }, (_, i) => 23 + i + R(0, 1) * 8).filter((v, i, A) => A.indexOf(v) === i)).slice(0, 7), pick = shuffle(masses).slice(0, 4);
    const days = [R(110, 290), R(60, 180), R(60, 180), R(105, 260)], miss = R(0, 3);
    d.rounds = [{ t: 'led', led }, { t: 'boat', masses, cap: pick.reduce((s, x) => s + x, 0) }, { t: 'miss', days, miss }];
    d.r = 0; d.on = [];
  },
  goal: d => `💚 ساعد العم ناصر في صندوق الخير ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'naser', text: 'نجت السلاحف كلها والحساب مضبوط! تجمع أعداداً كثيرة وتتحقق منها.' }];
    const ledger = rows => `<table class="chTable">${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</table>`;
    if (r.t === 'led') return kp(this, W, d, { title: '📒 دفتر التبرعات', visual: ledger(r.led.map((v, i) => [['السبت', 'الأحد', 'الاثنين', 'الثلاثاء'][i], ar(v)])), text: 'كم ريالاً تبرّع أهل القرية في الأيام الأربعة؟', ans: r.led.reduce((s, x) => s + x, 0), n: 3, id: 'addMore5', msg, kind, opts: { dot: false }, lines: L,
      hint: 'المجموع لا يطابق الدفتر: اجمع عموداً عموداً مع الحمل، ثم تحقّق بترتيب آخر.' });
    if (r.t === 'miss') { const known = r.days.map((v, i) => i === r.miss ? '<b>؟</b>' : ar(v)), tot = r.days.reduce((s, x) => s + x, 0);
      return kp(this, W, d, { title: '📒 صفحة ممسوحة', visual: ledger(r.days.map((v, i) => [['الأربعاء', 'الخميس', 'الجمعة', 'السبت'][i], known[i]]).concat([['المجموع', ar(tot)]])), text: 'انمسح مبلغ يوم من الدفتر. كم كان؟', ans: r.days[r.miss], n: 3, id: 'addMore5', msg, kind, opts: { dot: false }, lines: L,
        hint: 'ليس هذا المبلغ: اجمع المبالغ المعروفة، ثم اطرحها من المجموع.' }); }
    sheetOpen(`<h3>🛶 قارب الإنقاذ</h3>${msgBox((msg ? msg + ' ' : '') + `القارب يحمل <b>${ar(r.cap)}</b> كغم تماماً حتى لا يميل. اختر سلاحف مجموع كتلها <b>${ar(r.cap)}</b> كغم بالضبط.`, kind)}
      <div class="g5cards">${r.masses.map((m, i) => `<button class="g5card turtle${d.on.includes(i) ? ' on' : ''}" data-t="${i}">🐢 ${ar(m)} كغم</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.on.length ? '' : ' disabled'}>🛶 أبحر بالقارب</button></div>`);
    panel().querySelectorAll('[data-t]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.t, k = d.on.indexOf(i); if (k >= 0) d.on.splice(k, 1); else d.on.push(i); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const s = d.on.reduce((a, i) => a + r.masses[i], 0);
      if (s === r.cap) { d.on = []; await advance(this, W, d, 3, 'addMore5', L); }
      else { sfx('cough'); this.open(W, d, s > r.cap ? `القارب يميل! مجموع ما اخترت أكثر من ${ar(r.cap)} كغم. اجمع الكتل من جديد.` : `القارب خفيف: مجموع ما اخترت أقل من ${ar(r.cap)} كغم.`, 'bad'); }
    });
  }
}, at(ST5V.box, 'box', '💚 صندوق الخير', boxProp));

export const G5U1 = { placeValue5, orderRound5, sequences5a, addSub5a, addMore5 };
