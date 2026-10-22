// الصف الخامس — السوق الأسبوعي (الوحدة ٣: الضرب والقسمة، والوحدة ٤: المضاعفات والمربعات والعوامل في الكتاب).
// سبع محطات قرب أصحابها: صواني تُرتَّب صفوفاً، بساط شبكة الضرب، طلبيات بالأقواس، آلة تعبئة بالطرح المتكرر،
// بلاط مربع ولوحة مضاعفات، بوابات فرز القسمة، وجسور العوامل.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable, stall } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, msgBox, setMsg, btn, numPad } from '../bench.js';
import { H, step, at, advance, kp, out, shadowE } from './common.js';

/* المحطات: أماكن مفتوحة قرب أصحابها في السوق (فُحصت بالتصادم) */
export const ST5M = {
  trays: { x: 1966, y: 1000 },    // شيخة: صواني الحلوى
  carpet: { x: 1706, y: 426 },    // مبارك: بساط الضرب
  orders: { x: 2000, y: 570 },    // خالد: طلبيات المطعم
  spice: { x: 2000, y: 895 },     // عبدالله: آلة تعبئة البهارات (جنوب لوحة الحافلات)
  tiles: { x: 1670, y: 1460 },    // جمعة: بلاط الساحة
  gates: { x: 2140, y: 880 },     // خالد: بوابات الفرز (الساحة جنوب الشارع)
  bridges: { x: 1840, y: 520 }    // مبارك: جسور العوامل
};
const N = n => ar(n);

/* ── رسوم المحطات ── */
function sign(c, x, y, t, bg) { bigSign(c, x, y + 6, t, { fs: 12, h: 30, bg }); }
function traysProp(c, x, y) {   // طاولة عليها صينيتان من الحلوى مرصوصة صفوفاً
  workTable(c, x, y);
  [[-16, '#C9A06A'], [14, '#B5651D']].forEach(([dx, col]) => { c.fillStyle = col; rr(c, x + dx - 12, y - 38, 24, 9, 2); c.fill(); c.strokeStyle = INK; c.lineWidth = .6; c.stroke();
    c.fillStyle = '#F5D27A'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(x + dx - 8 + i * 5.3, y - 36 + j * 4, 1.8, 0, 7); c.fill(); } });
  sign(c, x - 100, y, '🍬 صواني الحلوى', '#B0476A');
}
function carpetProp(c, x, y) {   // بساط معلّق بأربعة أقسام ملوّنة (طريقة الشبكة)
  shadowE(c, x, y, 40);
  c.fillStyle = PAL.wood; c.fillRect(x - 42, y - 70, 4, 70); c.fillRect(x + 38, y - 70, 4, 70); c.fillRect(x - 44, y - 72, 88, 4);
  const C = ['#C0392B', '#E3B04B', '#2E7D5B', '#2F6FB2']; [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j], k) => { c.fillStyle = C[k]; c.fillRect(x - 36 + i * 40, y - 66 + j * 28, i ? 30 : 40, j ? 20 : 28); });
  c.strokeStyle = '#FFF6E2'; c.lineWidth = 1.5; c.strokeRect(x - 36, y - 66, 70, 48); c.beginPath(); c.moveTo(x + 4, y - 66); c.lineTo(x + 4, y - 18); c.moveTo(x - 36, y - 38); c.lineTo(x + 34, y - 38); c.stroke();
  sign(c, x + 98, y, '🧶 بساط الضرب', '#C0392B');
}
function ordersProp(c, x, y) {   // كشك صغير بلوح طلبات
  stall(c, x, y, '#2F6FB2');
  c.fillStyle = '#FFFDF6'; rr(c, x - 14, y - 58, 28, 20, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .6; c.stroke();
  c.fillStyle = '#2A1B66'; [0, 1, 2].forEach(k => c.fillRect(x - 10, y - 54 + k * 5, 20 - k * 5, 1.5));
  sign(c, x + 100, y, '🧾 طلبيات المطعم', '#2F6FB2');
}
function spiceProp(c, x, y, d, t) {   // آلة تعبئة: قمع وأكياس
  shadowE(c, x, y, 34);
  c.fillStyle = '#8994A0'; rr(c, x - 22, y - 46, 44, 46, 4); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#C46A1E'; c.beginPath(); c.moveTo(x - 20, y - 78); c.lineTo(x + 20, y - 78); c.lineTo(x + 5, y - 48); c.lineTo(x - 5, y - 48); c.closePath(); c.fill(); c.stroke();
  [[-34, '#C46A1E'], [32, '#E3B04B'], [44, '#B8413A']].forEach(([dx, col]) => { c.fillStyle = col; rr(c, x + dx - 6, y - 14, 12, 14, 3); c.fill(); c.strokeStyle = INK; c.stroke(); });
  c.fillStyle = '#1E1A30'; rr(c, x - 14, y - 38, 28, 12, 2); c.fill(); c.fillStyle = '#6EF5DE'; c.font = '900 9px Cairo'; c.textAlign = 'center'; c.fillText('⚙', x, y - 29);
  sign(c, x - 75, y + 62, '🌶️ آلة التعبئة', '#C46A1E');   // جنوب غرب الآلة: شمالها موقف الحافلات وشرقها تقويم المهرجان
}
function tilesProp(c, x, y) {   // مربع بلاط على الأرض بجانبه كومة بلاطات
  c.fillStyle = 'rgba(60,35,10,.15)'; c.fillRect(x - 30, y - 20, 60, 30);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#C77B4A' : '#E0A270'; c.fillRect(x - 28 + i * 13, y - 18 + j * 6.5, 12, 5.5); }
  c.fillStyle = '#B5651D'; for (let k = 0; k < 4; k++) c.fillRect(x + 36, y - 4 - k * 4, 16, 3);
  sign(c, x - 96, y, '🟫 بلاط الساحة', '#8A5A30');
}
function gatesProp(c, x, y, d, t) {   // أربع بوابات صغيرة ملوّنة على خط
  shadowE(c, x, y, 50);
  const C = ['#8E6CF6', '#2F6FB2', '#2E9E5B', '#E3B04B'];
  C.forEach((col, k) => { const gx = x - 45 + k * 30; c.fillStyle = col; c.fillRect(gx - 11, y - 44, 4, 44); c.fillRect(gx + 7, y - 44, 4, 44); c.fillRect(gx - 11, y - 48, 22, 6);
    c.fillStyle = '#fff'; c.font = '900 8px Cairo'; c.textAlign = 'center'; c.fillText(['١٠٠', '١٠', '٥', '٢'][k], gx, y - 43.5); });
  sign(c, x + 104, y, '🚦 بوابات الفرز', '#5E6B78');
}
function bridgesProp(c, x, y, d, t) {   // حجارة على جدول ماء وجسر خشبي
  c.fillStyle = '#5BA9CC'; rr(c, x - 44, y - 16, 88, 20, 8); c.fill();
  c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x - 30 + Math.sin(t * 2) * 4, y - 9, 18, 2);
  c.fillStyle = '#9A8F84'; [[-36, -24], [36, -24], [-36, 6], [36, 6]].forEach(([dx, dy]) => { c.beginPath(); c.ellipse(x + dx, y + dy / 3, 9, 6, 0, 0, 7); c.fill(); });
  c.fillStyle = PAL.wood; c.fillRect(x - 30, y - 12, 60, 6); c.strokeStyle = INK; c.lineWidth = .6; c.strokeRect(x - 30, y - 12, 60, 6);
  sign(c, x - 96, y, '🌉 جسور العوامل', '#2E7D5B');
}

/* ═══ ٣-١ حقائق الضرب والقسمة — «صواني الحلوى» (صفوف وأعمدة حية، ثم طلبات كبيرة) ═══ */
export const multFacts5 = Object.assign({
  id: 'multFacts5', giver: 'shaikha',
  intro: n => [{ who: 'shaikha', text: `هلا يا ${n}! عندي طلبيات حلوى عمانية لعرس كبير.` },
    { who: 'shaikha', text: 'رتّب القطع في الصواني صفوفاً متساوية: عدد الصفوف × عدد القطع في الصف = كل القطع. ثم احسب الطلبات الكبيرة.' }],
  begin(d) {
    const a = R(6, 9), b = R(4, 9), c = R(6, 9), e = R(3, 8), q = R(21, 99), k = R(3, 9), u = R(112, 299);
    d.rounds = [{ t: 'arr', n: a * b, rows: a, ans: b }, { t: 'arr', n: c * e, cols: c, ans: e }, { t: 'div', n: k * q, per: k, ans: q }, { t: 'mul', price: u, n: R(3, 9) }];
    d.r = 0; d.rw = 1; d.cl = 1;
  },
  goal: d => `🍬 جهّز صواني شيخة ${step(d, 4)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'shaikha', text: 'الصواني جاهزة ومرتبة! تعرف جداول الضرب وتقسم وتضرب الأعداد الكبيرة.' }];
    if (r.t === 'div') return kp(this, W, d, { title: '📦 طلب كبير', text: `طلب العرس <b>${N(r.n)}</b> قطعة، وفي كل علبة <b>${N(r.per)}</b> قطع. كم علبة نحتاج؟`, ans: r.ans, n: 4, id: 'multFacts5', msg, kind, opts: { dot: false }, lines: L, hint: 'العلب لا تكفي أو تزيد: اقسم بالتجميع (١٠ علب، ٢٠ علبة…).' });
    if (r.t === 'mul') return kp(this, W, d, { title: '💰 حساب الصواني', text: `ثمن الصينية <b>${N(r.price)}</b> بيسة. كم ثمن <b>${N(r.n)}</b> صوانٍ بالبيسة؟`, ans: r.price * r.n, n: 4, id: 'multFacts5', msg, kind, opts: { dot: false }, lines: L, hint: `ليس هذا الثمن: جزّئ ${N(r.price)} إلى مئات وعشرات وآحاد واضرب كل جزء.` });
    const fixedRows = r.rows !== undefined; if (fixedRows) d.rw = r.rows; else d.cl = r.cols;
    const grid = `<div class="g5arr" style="grid-template-columns:repeat(${d.cl},1fr)">${'<i></i>'.repeat(d.rw * d.cl)}</div>`;
    const ctl = (k, lab, v) => `<div class="cnt g5cnt"><span>${lab}</span><button class="act ghost" data-a="${k}" data-v="-1">−</button><b>${N(v)}</b><button class="act ghost" data-a="${k}" data-v="1">+</button></div>`;
    sheetOpen(`<h3>🍬 صينية ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + (fixedRows ? `رتّب <b>${N(r.n)}</b> قطعة في <b>${N(r.rows)}</b> صفوف متساوية. كم قطعة في كل صف؟` : `رتّب <b>${N(r.n)}</b> قطعة في صينية فيها <b>${N(r.cols)}</b> قطع في كل صف. كم صفاً؟`), kind)}
      ${grid}<p class="muted">في الصينية الآن: ${N(d.rw)} × ${N(d.cl)}</p>
      <div class="row2">${fixedRows ? ctl('cl', 'قطع في الصف', d.cl) : ctl('rw', 'الصفوف', d.rw)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ الصينية جاهزة</button></div>`);
    panel().querySelectorAll('[data-a]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.a; d[k] = Math.max(1, Math.min(10, d[k] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.rw * d.cl === r.n) { d.rw = 1; d.cl = 1; await advance(this, W, d, 4, 'multFacts5', L); }
      else { sfx('cough'); this.open(W, d, d.rw * d.cl < r.n ? 'بقيت قطع خارج الصينية!' : 'الصينية فيها أماكن فارغة!', 'bad'); }
    });
  }
}, at(ST5M.trays, 'trays', '🍬 صواني الحلوى', traysProp));

/* ═══ ٣-٢ الطرق الكتابية للضرب — «بساط الضرب» (شبكة يملؤها الطالب خانةً خانة) ═══ */
export const writtenMult5 = Object.assign({
  id: 'writtenMult5', giver: 'mubarak',
  intro: n => [{ who: 'mubarak', text: `مرحباً يا ${n}! أنا مبارك نسّاج البُسط. كل بساط أصنعه هو عملية ضرب!` },
    { who: 'mubarak', text: 'نجزّئ العددين إلى عشرات وآحاد، فيصير البساط أقساماً. احسب كل قسم، ثم اجمع الأقسام.' }],
  begin(d) {
    const p = () => R(2, 9) * 10 + R(1, 9), a = R(3, 9), b = R(11, 89) / 10;
    d.rounds = [{ a: p(), b: R(1, 4) * 10 + R(1, 9) }, { a: p(), b: p() }, { dec: true, a: b % 1 === 0 ? b + .3 : b, b: a }];
    d.r = 0; d.cells = {}; d.sel = 0;
  },
  parts(r) {
    if (r.dec) { const w = Math.floor(r.a), f = Math.round((r.a - w) * 10) / 10; return { rows: [N(r.b)], cols: [N(w), dec(f)], vals: [w * r.b, Math.round(f * r.b * 10) / 10], total: Math.round(r.a * r.b * 10) / 10 }; }
    const A = [r.a - r.a % 10, r.a % 10], B = [r.b - r.b % 10, r.b % 10];
    return { rows: B.map(N), cols: A.map(N), vals: [A[0] * B[0], A[1] * B[0], A[0] * B[1], A[1] * B[1]], total: r.a * r.b };
  },
  goal: d => `🧶 أكمل بُسط مبارك ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], P = this.parts(r), nc = P.cols.length, show = k => d.cells[k] === undefined ? '؟' : (r.dec ? dec(d.cells[k]) : N(d.cells[k]));
    const cell = k => `<button class="g5cell${d.sel === k ? ' sel' : ''}" data-cell="${k}">${show(k)}</button>`;
    sheetOpen(`<h3>🧶 بساط ${r.dec ? dec(r.a) : N(r.a)} × ${N(r.b)}</h3>${msgBox((msg ? msg + ' ' : '') + 'اضغط خانة ثم اكتب ناتجها، وفي الأخير اكتب المجموع.', kind)}
      <table class="g5grid"><tr><th>×</th>${P.cols.map(c => `<th>${c}</th>`).join('')}</tr>${P.rows.map((rw, i) => `<tr><th>${rw}</th>${P.cols.map((_, j) => `<td>${cell(i * nc + j)}</td>`).join('')}</tr>`).join('')}
      <tr><th colspan="${nc}">المجموع</th><td>${cell('t')}</td></tr></table>
      <div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-cell]').forEach(b => b.onclick = e => { e.stopPropagation(); d.sel = b.dataset.cell === 't' ? 't' : +b.dataset.cell; sfx('click'); this.open(W, d, msg, kind); });
    out();
    numPad(panel().querySelector('#pad'), d.sel === null ? 'اختر خانة' : '✓ ضع في الخانة', async v => {
      if (d.sel === null) return;
      d.cells[d.sel] = v; const keys = P.vals.map((_, k) => k).concat(['t']), nx = keys.find(k => d.cells[k] === undefined); d.sel = nx === undefined ? null : nx; sfx('drop');
      if (nx !== undefined) return this.open(W, d, msg, kind);
      const bad = P.vals.findIndex((x, k) => H(d.cells[k]) !== H(x));
      if (bad < 0 && H(d.cells.t) === H(P.total)) { d.cells = {}; d.sel = 0; await advance(this, W, d, 3, 'writtenMult5', [{ who: 'mubarak', text: 'بُسط متقنة! تجزّئ وتضرب وتجمع، حتى مع الأعداد العشرية.' }]); }
      else { sfx('cough'); const k = bad >= 0 ? bad : 't'; delete d.cells[k]; d.sel = k; this.open(W, d, bad >= 0 ? 'إحدى الخانات غير صحيحة، صحّحتُ مكانها: اضرب رأس العمود في رأس الصف.' : 'الخانات صحيحة لكن المجموع لا يطابق: اجمعها من جديد.', 'bad'); }
    }, { dot: !!r.dec });
  }
}, at(ST5M.carpet, 'carpet', '🧶 بساط الضرب', carpetProp));

/* ═══ ٣-٣ تدريبات ضرب إضافية — «طلبيات المطعم» (العبارة ذات الأقواس ثم الحساب) ═══ */
export const moreMult5 = Object.assign({
  id: 'moreMult5', giver: 'khalid',
  intro: n => [{ who: 'khalid', text: `أهلاً يا ${n}! المطعم مزدحم وورقة الطلبات تحتاج حساباً دقيقاً.` },
    { who: 'khalid', text: 'اختر العبارة التي تصف الطلب (والأقواس تُحسب أولاً)، ثم احسب الفاتورة.' }],
  begin(d) {
    const t1 = R(3, 6), x = R(3, 6), y = R(3, 5), p = R(3, 9) * 100 + R(10, 90), m = R(3, 6), g = R(4, 8), s = R(5, 9), e = R(2, g - 1);
    d.rounds = [
      { text: `على كل طاولة من <b>${N(t1)}</b> طاولات: <b>${N(x)}</b> صحون أرز و<b>${N(y)}</b> صحون سمك. كم صحناً كلها؟`, ok: `(${N(x)} + ${N(y)}) × ${N(t1)}`, bad: [`${N(x)} + ${N(y)} × ${N(t1)}`, `${N(x)} × ${N(y)} + ${N(t1)}`], ans: (x + y) * t1 },
      { text: `عائلة من <b>${N(g)}</b> أشخاص، يدفع كل شخص <b>${N(s)}</b> ريالات، وخصم المطعم <b>${N(e)}</b> ريالات من الفاتورة كلها. كم تدفع العائلة؟`, ok: `(${N(g)} × ${N(s)}) − ${N(e)}`, bad: [`${N(g)} × (${N(s)} − ${N(e)})`, `${N(g)} + ${N(s)} − ${N(e)}`], ans: g * s - e },
      { text: `اشترى المطعم <b>${N(m)}</b> أكياس دقيق، وزن الكيس <b>${N(p)}</b> غم. قدّر أولاً ثم احسب الوزن كله بالغرام.`, ok: `${N(p)} × ${N(m)} ≈ ${N(Math.round(p / 100) * 100 * m)}`, bad: [`${N(p)} × ${N(m)} ≈ ${N(Math.round(p / 100) * 10 * m)}`, `${N(p)} × ${N(m)} ≈ ${N(Math.round(p / 100) * 1000 * m)}`], ans: p * m }];
    d.r = 0; d.pick = -1;
  },
  goal: d => `🧾 احسب طلبيات المطعم ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (d.pick === d.r) return kp(this, W, d, { title: '🧾 الفاتورة', text: `${r.text}<br>العبارة: <b>${r.ok}</b>`, ans: r.ans, n: 3, id: 'moreMult5', msg, kind, opts: { dot: false }, hint: 'الحساب لا يطابق: ما داخل القوسين أولاً، ثم الضرب، ثم الجمع والطرح.',
      lines: [{ who: 'khalid', text: 'فواتير بلا خطأ! تكتب العبارة بالأقواس وتقدّر قبل أن تحسب.' }] });
    if (!d.opts) d.opts = {}; const opts = d.opts[d.r] = d.opts[d.r] || shuffle([r.ok, ...r.bad]);
    sheetOpen(`<h3>🧾 طلب ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + r.text + '<br>اختر العبارة المناسبة:', kind)}
      <div class="g5cards col">${opts.map((o, i) => `<button class="g5card" data-o="${i}">${o}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-o]').forEach(b => b.onclick = e => { e.stopPropagation();
      if (opts[+b.dataset.o] === r.ok) { d.pick = d.r; sfx('drop'); changed(); this.open(W, d, '✓ العبارة صحيحة! الآن احسبها.', 'ok'); }
      else { sfx('cough'); this.open(W, d, 'هذه العبارة تصف طلباً آخر: فكّر ماذا يُحسب أولاً.', 'bad'); } });
    out();
  }
}, at(ST5M.orders, 'orders', '🧾 طلبيات المطعم', ordersProp));
/* ═══ ٣-٤ الطرق الكتابية للقسمة — «آلة التعبئة» (الطرح المتكرر، ثم قرار التقريب) ═══ */
export const writtenDiv5 = Object.assign({
  id: 'writtenDiv5', giver: 'abdullah',
  intro: n => [{ who: 'abdullah', text: `حياك يا ${n}! آلة تعبئة البهارات تعبّئ بالدفعات: ١٠ أكياس أو ٥ أو كيساً واحداً.` },
    { who: 'abdullah', text: 'اطرح الدفعات من الكمية حتى يبقى أقل من كيس. عدد الأكياس هو ناتج القسمة، وما يبقى هو الباقي.' }],
  begin(d) {
    const b = R(4, 9), q = R(23, 79), r = R(1, b - 1), per = [6, 8, 12][R(0, 2)], need = R(8, 14) * per + R(1, per - 1), price = R(6, 9), money = R(6, 12) * price + R(1, price - 1);
    d.rounds = [{ t: 'chunk', n: b * q + r, b }, { t: 'up', per, need }, { t: 'down', price, money }];
    d.r = 0; d.used = [];
  },
  goal: d => `🌶️ عبّئ بهارات عبدالله ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'abdullah', text: 'تعبئة متقنة! تقسم بالطرح المتكرر، وتعرف متى نقرّب الناتج للأكبر ومتى للأصغر.' }];
    if (r.t === 'up') return kp(this, W, d, { title: '🛍️ أكياس الزبون', text: `يريد زبون <b>${N(r.need)}</b> غم من الكركم، والكيس يتسع <b>${N(r.per)}</b> غم. كم كيساً نحتاج لنعبّئ الكمية كلها؟`, ans: Math.ceil(r.need / r.per), n: 3, id: 'writtenDiv5', msg, kind, opts: { dot: false }, lines: L, hint: 'فكّر في الباقي: هل نتركه بلا كيس؟' });
    if (r.t === 'down') return kp(this, W, d, { title: '💰 مال الزبون', text: `مع زبون <b>${N(r.money)}</b> ريالاً، وكيس الزعفران بـ <b>${N(r.price)}</b> ريالات. كم كيساً يستطيع أن يشتري؟`, ans: Math.floor(r.money / r.price), n: 3, id: 'writtenDiv5', msg, kind, opts: { dot: false }, lines: L, hint: 'هل يكفي الباقي لكيس كامل؟' });
    const left = r.n - d.used.reduce((s, x) => s + x * r.b, 0), bags = d.used.reduce((s, x) => s + x, 0);
    sheetOpen(`<h3>🌶️ آلة التعبئة</h3>${msgBox((msg ? msg + ' ' : '') + `في القمع <b>${N(r.n)}</b> غم، والكيس <b>${N(r.b)}</b> غم. عبّئ بالدفعات حتى يبقى أقل من كيس.`, kind)}
      <div class="g5chunk">${d.used.map(x => `<div>− ${N(x * r.b)} <small>(${N(x)} × ${N(r.b)})</small></div>`).join('')}<div class="left">الباقي في القمع: <b>${N(left)}</b> غم · أكياس: <b>${N(bags)}</b></div></div>
      <div class="row2">${[10, 5, 1].map(x => `<button class="act" data-x="${x}"${x * r.b > left ? ' disabled' : ''}>📦 ${N(x)} ${x === 1 ? 'كيس' : 'أكياس'}</button>`).join('')}<button class="act ghost" id="cUndo"${d.used.length ? '' : ' disabled'}>↩ تراجع</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ انتهت التعبئة</button></div>`);
    panel().querySelectorAll('[data-x]').forEach(b => b.onclick = e => { e.stopPropagation(); d.used.push(+b.dataset.x); sfx('drop'); this.open(W, d, msg, kind); });
    btn('cUndo', () => { d.used.pop(); sfx('pick'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (left < r.b) { d.used = []; await advance(this, W, d, 3, 'writtenDiv5', L); }
      else { sfx('cough'); this.open(W, d, `ما زال في القمع ${N(left)} غم، وهذا يكفي كيساً آخر على الأقل.`, 'bad'); }
    });
  }
}, at(ST5M.spice, 'spice', '🌶️ آلة التعبئة', spiceProp));

/* ═══ ٤-١ المضاعفات والمربعات — «بلاط الساحة» (مربع من البلاط، ولوحة المضاعفات) ═══ */
export const multSquares5 = Object.assign({
  id: 'multSquares5', giver: 'juma',
  intro: n => [{ who: 'juma', text: `أهلاً يا ${n}! أنا جمعة البنّاء. أريد ساحات مربعة من البلاط.` },
    { who: 'juma', text: 'المربع أضلاعه متساوية: ٥ بلاطات × ٥ بلاطات = ٢٥ بلاطة، و٢٥ عدد مربع. ثم ساعدني في لوحة المضاعفات.' }],
  begin(d) {
    const s = R(4, 10), lim = [30, 45, 55, 70, 90, 99][R(0, 5)], k = [6, 7, 8, 9][R(0, 3)];
    d.rounds = [{ t: 'sq', n: s * s, ans: s }, { t: 'max', lim, ans: Math.floor(Math.sqrt(lim)) }, { t: 'mult', k, top: 60 }];
    d.r = 0; d.side = 1; d.marks = [];
  },
  goal: d => `🟫 ساعد جمعة في البلاط ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'juma', text: 'ساحات مربعة تماماً! تعرف الأعداد المربعة ومضاعفات ٦ و٧ و٨ و٩.' }];
    if (r.t === 'mult') {
      sheetOpen(`<h3>🔢 لوحة المضاعفات</h3>${msgBox((msg ? msg + ' ' : '') + `لوّن كل <b>مضاعفات ${N(r.k)}</b> على اللوحة (حتى ${N(r.top)}).`, kind)}
        <div class="g5board">${Array.from({ length: r.top }, (_, i) => `<button class="g5n${d.marks.includes(i + 1) ? ' on' : ''}" data-m="${i + 1}">${N(i + 1)}</button>`).join('')}</div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ انتهيت</button></div>`);
      panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = +b.dataset.m, i = d.marks.indexOf(v); if (i >= 0) d.marks.splice(i, 1); else d.marks.push(v); sfx('click'); this.open(W, d, msg, kind); });
      out();
      return btn('benchGo', async () => {
        const want = Array.from({ length: Math.floor(r.top / r.k) }, (_, i) => (i + 1) * r.k), extra = d.marks.filter(v => v % r.k), miss = want.filter(v => !d.marks.includes(v));
        if (!extra.length && !miss.length) { d.marks = []; await advance(this, W, d, 3, 'multSquares5', L); }
        else { sfx('cough'); d.marks = d.marks.filter(v => v % r.k === 0); this.open(W, d, extra.length ? `لوّنتَ عدداً ليس من مضاعفات ${N(r.k)}، فأزلته.` : `بقيت مضاعفات لم تلوّنها: عُدّ بخطوة ${N(r.k)}.`, 'bad'); }
      });
    }
    const n = d.side;
    sheetOpen(`<h3>🟫 ساحة مربعة</h3>${msgBox((msg ? msg + ' ' : '') + (r.t === 'sq' ? `ابنِ ساحة مربعة من <b>${N(r.n)}</b> بلاطة بالضبط.` : `عندنا <b>${N(r.lim)}</b> بلاطة. ابنِ <b>أكبر</b> ساحة مربعة ممكنة.`), kind)}
      <div class="g5arr tiles" style="grid-template-columns:repeat(${n},1fr)">${'<i></i>'.repeat(n * n)}</div><p class="muted">الساحة: ${N(n)} × ${N(n)} = ${N(n * n)} بلاطة</p>
      <div class="row2"><div class="cnt g5cnt"><span>طول الضلع</span><button class="act ghost" data-s="-1">−</button><b>${N(n)}</b><button class="act ghost" data-s="1">+</button></div></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ ابنِ الساحة</button></div>`);
    panel().querySelectorAll('[data-s]').forEach(b => b.onclick = e => { e.stopPropagation(); d.side = Math.max(1, Math.min(10, d.side + +b.dataset.s)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (n === r.ans) { d.side = 1; await advance(this, W, d, 3, 'multSquares5', L); }
      else { sfx('cough'); this.open(W, d, r.t === 'sq' ? (n * n < r.n ? 'بقي بلاط لم يُستعمل.' : 'البلاط لا يكفي هذه الساحة.') : (n * n > r.lim ? 'البلاط لا يكفي هذه الساحة!' : 'تستطيع بناء ساحة مربعة أكبر.'), 'bad'); }
    });
  }
}, at(ST5M.tiles, 'tiles', '🟫 بلاط الساحة', tilesProp));

/* ═══ ٤-٢ اختبارات قابلية القسمة — «بوابات الفرز» (أول بوابة يعبرها العدد، ثم بطاقات الأرقام) ═══ */
const GATES = [100, 10, 5, 2];
const firstGate = v => { const k = GATES.findIndex(g => v % g === 0); return k < 0 ? 4 : k; };
const perms = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perms(a.filter((_, j) => j !== i)).map(p => [x, ...p]));
export const divisibility5 = Object.assign({
  id: 'divisibility5', giver: 'khalid',
  intro: n => [{ who: 'khalid', text: `يا ${n}! صناديق السوق مرقّمة، وبوابات الفرز تقبل الأعداد حسب قابلية القسمة.` },
    { who: 'khalid', text: 'البوابات بالترتيب: ١٠٠ ثم ١٠ ثم ٥ ثم ٢. أرسل كل صندوق إلى أول بوابة يقبل عدده القسمة عليها، وإلا فإلى «لا بوابة».' }],
  begin(d) {
    const mk = [() => R(11, 99) * 100, () => R(11, 199) * 10 + (R(0, 1) ? 0 : 0), () => R(101, 999) * 10 + 5, () => R(101, 999) * 2 + (R(0, 1) ? 0 : 0), () => R(1001, 4999) * 2 + 1];
    const list = []; const kinds = shuffle([0, 1, 1, 2, 2, 3, 3, 4]);
    kinds.forEach(k => { let v = mk[k](); if (k === 1 && v % 100 === 0) v += 10; if (k === 3 && v % 10 === 0) v += 2; if (k === 4 && v % 5 === 0) v += 2; list.push(v); });
    const D1 = [5, ...shuffle([1, 2, 3, 4, 6, 7, 8, 9]).slice(0, 3)], D2 = [0, 5, ...shuffle([1, 2, 3, 4, 6, 7, 8, 9]).slice(0, 2)];
    d.rounds = [{ t: 'sort', list }, { t: 'build', digits: D1, text: 'كوّن <b>أكبر</b> عدد فردي يقبل القسمة على ٥', ok: v => v % 5 === 0 && v % 2 === 1, best: Math.max(...perms(D1).filter(p => p[0]).map(p => +p.join('')).filter(v => v % 5 === 0 && v % 2)) },
      { t: 'build', digits: D2, text: 'كوّن <b>أصغر</b> عدد أكبر من ١٠٠٠ يقبل القسمة على ١٠', ok: v => v > 1000 && v % 10 === 0, best: Math.min(...perms(D2).filter(p => p[0]).map(p => +p.join('')).filter(v => v > 1000 && v % 10 === 0)) }];
    d.r = 0; d.i = 0; d.slots = [];
  },
  goal: d => `🚦 افرز صناديق السوق ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'khalid', text: 'فرز بلا خطأ! يكفيك النظر إلى رقم الآحاد والعشرات.' }];
    if (r.t === 'sort') {
      const v = r.list[d.i];
      sheetOpen(`<h3>🚦 بوابات الفرز</h3>${msgBox((msg ? msg + ' ' : '') + `الصندوق ${N(d.i + 1)} من ${N(r.list.length)}: إلى أي بوابة يذهب؟`, kind)}
        <div class="g5box">📦 <b>${N(v)}</b></div>
        <div class="row2">${GATES.map((g, k) => `<button class="act" data-g="${k}">🚦 ÷ ${N(g)}</button>`).join('')}<button class="act ghost" data-g="4">✋ لا بوابة</button></div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-g]').forEach(b => b.onclick = async e => { e.stopPropagation();
        const k = +b.dataset.g, want = firstGate(v);
        if (k === want) { sfx('drop'); d.i++; changed(); if (d.i >= r.list.length) { d.i = 0; await advance(this, W, d, 3, 'divisibility5', L); } else this.open(W, d, '✓', 'ok'); }
        else { sfx('cough'); this.open(W, d, k < 4 && v % GATES[k] !== 0 ? `البوابة ÷ ${N(GATES[k])} رفضت الصندوق: انظر إلى آخر رقم أو رقمين.` : 'الصندوق يعبر بوابة قبلها! البوابات بالترتيب: ١٠٠ ثم ١٠ ثم ٥ ثم ٢.', 'bad'); } });
      return out();
    }
    const val = d.slots.length === 4 ? +d.slots.map(i => r.digits[i]).join('') : null;
    sheetOpen(`<h3>🔢 بطاقات الأرقام</h3>${msgBox((msg ? msg + ' ' : '') + `${r.text} من البطاقات (كل بطاقة مرة واحدة).`, kind)}
      <div class="g5slots ltr">${[0, 1, 2, 3].map(k => `<button class="g5slot${d.slots[k] !== undefined ? ' on' : ''}" data-s="${k}">${d.slots[k] !== undefined ? `<b>${N(r.digits[d.slots[k]])}</b>` : '—'}</button>`).join('')}</div>
      <div class="g5cards">${r.digits.map((g, i) => `<button class="g5card" data-c="${i}"${d.slots.includes(i) ? ' disabled' : ''}>${N(g)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${val === null ? ' disabled' : ''}>✓ ثبّت العدد</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.slots.length < 4) d.slots.push(+b.dataset.c); sfx('pick'); this.open(W, d, msg, kind); });
    panel().querySelectorAll('[data-s]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.s; if (d.slots[k] === undefined) return; d.slots.splice(k, 1); sfx('drop'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (val === r.best) { d.slots = []; await advance(this, W, d, 3, 'divisibility5', L); }
      else { sfx('cough'); d.slots = []; this.open(W, d, !r.ok(val) || val < 1000 ? `${N(val)} لا يحقق الشرط: انظر إلى رقم الآحاد.` : `${N(val)} يحقق الشرط، لكن يوجد عدد ${r.text.includes('أكبر</b>') ? 'أكبر' : 'أصغر'} منه.`, 'bad'); }
    });
  }
}, at(ST5M.gates, 'gates', '🚦 بوابات الفرز', gatesProp));

/* ═══ ٤-٣ العوامل — «جسور العوامل» (وصل حجرين حاصل ضربهما العدد) ═══ */
const pairsOf = n => { const p = []; for (let a = 1; a * a <= n; a++) if (n % a === 0) p.push([a, n / a]); return p; };
export const factors5 = Object.assign({
  id: 'factors5', giver: 'mubarak',
  intro: n => [{ who: 'mubarak', text: `عدتَ يا ${n}! على جدول الماء حجارة مرقّمة، وأريد جسوراً بين كل حجرين حاصل ضربهما العدد المكتوب على اللوح.` },
    { who: 'mubarak', text: 'كل جسر زوج من العوامل. ابحث عن الأزواج كلها، وقد يكون العامل شريك نفسه.' }],
  begin(d) {
    const ns = shuffle([24, 30, 36, 40, 48]).slice(0, 2).concat([[16, 36][R(0, 1)]]);
    if (ns[0] === ns[2] || ns[1] === ns[2]) ns[2] = ns[2] === 16 ? 36 : 16;
    d.rounds = ns.map(n => ({ n, stones: shuffle([...new Set([...pairsOf(n).flat(), ...shuffle([5, 7, 9, 11, 14, 15, 18, 20, 25, 27].filter(x => n % x !== 0)).slice(0, 3)])]) }));
    d.r = 0; d.done = []; d.sel = null;
  },
  goal: d => `🌉 ابنِ جسور العوامل ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], all = pairsOf(r.n);
    sheetOpen(`<h3>🌉 جسور العدد ${N(r.n)}</h3>${msgBox((msg ? msg + ' ' : '') + `اضغط حجرين حاصل ضربهما <b>${N(r.n)}</b> لتبني جسراً. الجسور المبنية: ${N(d.done.length)}`, kind)}
      <div class="g5bridges">${d.done.map(([a, b]) => `<span>${N(a)} × ${N(b)}</span>`).join('') || '<small>لا جسور بعد</small>'}</div>
      <div class="g5cards">${r.stones.map(v => `<button class="g5card stone${d.sel === v ? ' on' : ''}" data-v="${v}">${N(v)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ بنيتُ كل الجسور</button></div>`);
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = +b.dataset.v;
      if (d.sel === null) { d.sel = v; sfx('click'); return this.open(W, d, msg, kind); }
      const a = Math.min(d.sel, v), c = Math.max(d.sel, v); d.sel = null;
      if (a * c !== r.n) { sfx('cough'); return this.open(W, d, `${N(a)} × ${N(c)} = ${N(a * c)}، وليس ${N(r.n)}. الجسر لم يُبنَ.`, 'bad'); }
      if (d.done.some(p => p[0] === a)) { sfx('cough'); return this.open(W, d, 'هذا الجسر مبني من قبل! ابحث عن زوج آخر.', 'bad'); }
      d.done.push([a, c]); d.done.sort((x, y) => x[0] - y[0]); sfx('drop'); changed(); this.open(W, d, `✓ جسر ${N(a)} × ${N(c)}`, 'ok'); });
    out();
    btn('benchGo', async () => {
      if (d.done.length === all.length) { d.done = []; d.sel = null; await advance(this, W, d, 3, 'factors5', [{ who: 'mubarak', text: 'كل الجسور قائمة! تجد أزواج العوامل كاملة دون أن تنسى زوجاً.' }]); }
      else { sfx('cough'); this.open(W, d, `ما زالت جسور ناقصة: ابدأ من ١ × ${N(r.n)} ثم ٢ و٣ و٤ …`, 'bad'); }
    });
  }
}, at(ST5M.bridges, 'bridges', '🌉 جسور العوامل', bridgesProp));

export const G5U2 = { multFacts5, writtenMult5, moreMult5, writtenDiv5, multSquares5, divisibility5, factors5 };
