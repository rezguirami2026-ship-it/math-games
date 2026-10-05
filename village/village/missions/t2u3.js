// الفصل الثاني — الوحدة ٣ (العدد) في «سوق الجمعية»: أحد عشر كشكاً، لكل مهارة عددية فعل مختلف
import { ar, wait, rr, clamp } from '../core/util.js';
import { bubble } from '../world/entities.js';
import { sfx } from '../core/sound.js';
import { R, shuffle, near, changed, dec, sg, finish, panel, sheetOpen, sheetClose, hiDPI, msgBox, setMsg, btn, numPad, counters } from './bench.js';
import { ST7 } from '../world/coop.js';

const at = (st, key, label) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 44, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return near(W, { x: st.x, y: st.y + 16 }, 52) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; },
  draw(d, t, active, done) { return done ? [{ y: st.y + 30, draw: c => bubble(c, st.x, st.y - 160, '✓', '#1FA05A') }] : []; }
});
const step = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;
const H = v => Math.round(v * 1000);                    // مقارنة دقيقة حتى جزء من ألف
const fr = (n, d) => `<span class="frac"><b>${ar(n)}</b><i>${ar(d)}</i></span>`;
async function advance(mod, W, d, n, id, lines) { sfx('win'); d.r++; changed(); if (d.r >= n) { sheetClose(); await finish(W, id, lines); } else mod.open(W, d, '✓ أحسنت!', 'ok'); }
/* جولة بلوحة أرقام: نص، جواب، ورسالة خطأ مساعدة */
function kp(mod, W, d, o) {
  const text = o.text;
  sheetOpen(`<h3>${o.title}</h3>${o.visual || ''}${msgBox(o.msg ? `${o.msg} ${text}` : text, o.kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
  const pad = numPad(panel().querySelector('#pad'), o.label || '✓ الجواب', async v => { if (H(v) === H(o.ans)) await advance(mod, W, d, o.n, o.id, o.lines); else { sfx('cough'); pad.clear(); setMsg(`${o.hint || 'ليس صحيحاً.'} ${text}`, 'bad'); } }, o.opts || {});
  btn('benchOut', () => { sheetClose(); changed(); });
  if (o.after) o.after();
}
/* بانٍ للكسر (والعدد الكسري): عدّادات للبسط والمقام والعدد الصحيح */
function fracBuilder(holder, d, whole) {
  counters(holder, (whole ? [['fw', 'العدد الصحيح', 20]] : []).concat([['fn', 'البسط', 20], ['fd', 'المقام', 20]]), d);
}

/* ═══ ٤٧. نظام الأعداد (٢) — «خزينة الجمعية» (عجلات القفل) ═══ */
export const numberSystem2 = Object.assign({
  id: 'numberSystem2', giver: 'jamal',
  intro: n => [{ who: 'jamal', text: `أهلاً يا ${n}! أنا جمال أمين خزينة الجمعية. رموز الخزائن مكتوبة ألغازاً.` },
    { who: 'jamal', text: 'أدر عجلات القفل لتكوّن الرمز: المئات والعشرات والآحاد، ثم بعد الفاصلة الأعشار وأجزاء المئة.' }],
  begin(d) { const k1 = R(10000, 99949), k2 = R(1000, 9999), k3 = R(1000, 9999), x10 = R(0, 1);
    d.rounds = [{ text: `الرمز هو ${dec(k1 / 100)} مقرّباً إلى أقرب عدد صحيح`, ans: Math.round(k1 / 100) }, { text: `الرمز هو ${dec(k2 / 100)} مقرّباً إلى أقرب جزء من عشرة`, ans: Math.round(k2 / 10) / 10 },
      x10 ? { text: `الرمز هو ${dec(k3 / 100)} × ١٠`, ans: k3 / 10 } : { text: `الرمز هو ${dec(k3 / 1000)} × ١٠٠`, ans: k3 / 10 }]; d.r = 0; d.dg = [0, 0, 0, 0, 0]; },
  goal: d => `🔐 افتح أقفال الخزائن ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], wheel = i => `<div class="wheel"><button class="act ghost" data-w="${i}" data-v="1">▲</button><b id="wd${i}">${ar(d.dg[i])}</b><button class="act ghost" data-w="${i}" data-v="-1">▼</button></div>`;
    sheetOpen(`<h3>🔐 قفل الخزينة ${ar(d.r + 1)}</h3>${msgBox(msg ? `${msg} ${r.text}` : r.text, kind)}<div class="dials">${wheel(0)}${wheel(1)}${wheel(2)}<span>٫</span>${wheel(3)}${wheel(4)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔓 افتح الخزينة</button></div>`);
    panel().querySelectorAll('[data-w]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.w; d.dg[i] = (d.dg[i] + +b.dataset.v + 10) % 10; panel().querySelector('#wd' + i).textContent = ar(d.dg[i]); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { const v = d.dg[0] * 100 + d.dg[1] * 10 + d.dg[2] + d.dg[3] / 10 + d.dg[4] / 100;
      if (Math.round(v * 100) === Math.round(r.ans * 100)) { d.dg = [0, 0, 0, 0, 0]; await advance(this, W, d, 3, 'numberSystem2', [{ who: 'jamal', text: 'انفتحت الخزائن الثلاث! تعرف منزلة كل رقم حتى أجزاء المئة.' }]); }
      else { sfx('cough'); setMsg(`القفل لم ينفتح: ${dec(v)} ليس الرمز. ${r.text}`, 'bad'); } });
  }
}, at(ST7.vault, 'vault', '🔐 قفل الخزينة'));

/* ═══ ٤٨. تاريخ الأعداد (٢) — «لوح الرومان» ═══ */
const ROM = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const toRoman = n => { let s = ''; for (const [v, r] of ROM) while (n >= v) { s += r; n -= v; } return s; };
export const numberHistory2 = Object.assign({
  id: 'numberHistory2', giver: 'ruqaya',
  intro: n => [{ who: 'ruqaya', text: `مرحباً يا ${n}! أنا رقية معلمة التاريخ. لوح الرومان ينتظر من ينقش عليه.` },
    { who: 'ruqaya', text: 'I واحد، V خمسة، X عشرة، L خمسون، C مئة، D خمسمئة، M ألف. والرمز الأصغر قبل الأكبر يُطرح منه، مثل IV = ٤.' }],
  begin(d) { d.rounds = [{ t: 'w', v: [44, 49, 94, 99, 39, 48, 74, 89][R(0, 7)] }, { t: 'w', v: R(101, 399) }, { t: 'r', v: R(400, 1999) }]; d.r = 0; d.s = ''; },
  goal: d => `🏛️ انقش على لوح الرومان ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'r') return kp(this, W, d, { title: '🏛️ النقش الأخير', visual: `<div class="roman">${toRoman(r.v)}</div>`, text: 'اقرأ النقش الروماني واكتب العدد', ans: r.v, opts: { dot: false }, n: 3, id: 'numberHistory2', lines: [{ who: 'ruqaya', text: 'تكتب وتقرأ الأرقام الرومانية كمؤرخ حقيقي!' }], msg, kind, hint: 'العدد لا يطابق النقش.' });
    sheetOpen(`<h3>🏛️ لوح الرومان</h3>${msgBox(msg ? `${msg} انقش العدد <b>${ar(r.v)}</b>` : `انقش العدد <b>${ar(r.v)}</b> بالرموز الرومانية`, kind)}<div class="roman" id="rs">${d.s || '…'}</div>
      <div class="row2">${['M', 'D', 'C', 'L', 'X', 'V', 'I'].map(x => `<button class="act ghost rb" data-r="${x}">${x}</button>`).join('')}<button class="act ghost" id="rBack">⌫</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🏛️ انقش</button></div>`);
    const show = () => { panel().querySelector('#rs').textContent = d.s || '…'; };
    panel().querySelectorAll('[data-r]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.s.length < 14) { d.s += b.dataset.r; sfx('click'); show(); } });
    btn('rBack', () => { d.s = d.s.slice(0, -1); show(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (d.s === toRoman(r.v)) { d.s = ''; await advance(this, W, d, 3, 'numberHistory2', null); } else { sfx('cough'); setMsg(`النقش ${d.s || 'فارغ'} لا يساوي ${ar(r.v)}. تذكّر قاعدة الطرح: IV = ٤ و IX = ٩ و XL = ٤٠ و XC = ٩٠`, 'bad'); } });
  }
}, at(ST7.roman, 'roman', '🏛️ لوح الرومان'));

/* ═══ ٤٩. الجمع والطرح (١) — «بقالة سعود» (ميزان المعادلة) ═══ */
export const addSub1 = Object.assign({
  id: 'addSub1', giver: 'saud',
  intro: n => [{ who: 'saud', text: `يا هلا يا ${n}! أنا سعود صاحب البقالة. دفتر الحساب فيه أعداد ممسوحة.` },
    { who: 'saud', text: 'أكمل العدد المفقود حتى يتوازن الميزان، واحسب الفروق والمجاميع بدقة.' }],
  begin(d) { const a = R(150, 499), t = a + R(120, 450), lo = -R(2, 9), hi = R(1, 12), x = R(100, 999), y = R(100, 999), z = R(10, 200);
    d.rounds = [{ text: `${ar(a)} + ▢ = ${ar(t)}. ما العدد المفقود؟`, ans: t - a, a, t }, { text: `في الصباح كانت الحرارة ${sg(lo)}°، وفي الظهر ${ar(hi)}°. كم الفرق بينهما؟`, ans: hi - lo }, { text: `مجموع الفاتورة: ${dec(x / 10)} + ${dec(y / 100)} + ${ar(z)}`, ans: x / 10 + y / 100 + z }]; d.r = 0; },
  goal: d => `🧾 أكمل دفتر البقالة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    kp(this, W, d, { title: '🧾 دفتر البقالة', text: r.text, ans: r.ans, n: 3, id: 'addSub1', msg, kind, lines: [{ who: 'saud', text: 'الدفتر مكتمل وموزون! لا ينقص منه شيء.' }],
      visual: d.r === 0 ? `<div class="scaleq"><span>${ar(r.a)} + ؟</span><b>⚖️</b><span>${ar(r.t)}</span></div>` : '', hint: d.r === 0 ? 'الميزان لم يتوازن.' : 'الحساب غير صحيح.' });
  }
}, at(ST7.grocery, 'grocery', '🧾 دفتر البقالة'));

/* ═══ ٥٠. الضرب والقسمة — «سوق السمك» ═══ */
export const mulDiv = Object.assign({
  id: 'mulDiv', giver: 'obaid',
  intro: n => [{ who: 'obaid', text: `أهلاً يا ${n}! أنا عبيد بائع السمك. الزبائن كثيرون والآلة الحاسبة تعطلت.` },
    { who: 'obaid', text: 'احسب ثمن كل طلب بالريال والبيسة وسجّله في الصندوق.' }],
  begin(d) { const p = R(5, 16) * 250, n = R(2, 4), k = R(31, 199), q = R(2, 5), u = R(3, 12) * 250;
    d.rounds = [{ text: `سمك الكنعد بـ ${dec(p / 1000)} ريال للكيلو، والزبون يريد ${ar(n)} كيلو. كم الثمن؟`, ans: p * n / 1000 }, { text: `زبونان يتقاسمان ${dec(k / 10)} كغ من الروبيان بالتساوي. كم نصيب كل واحد؟`, ans: k / 20 },
      { text: `${ar(q)} أسماك بـ ${dec(q * u / 1000)} ريال. كم ثمن السمكة الواحدة؟`, ans: u / 1000 }]; d.r = 0; },
  goal: d => `🐟 احسب طلبات سوق السمك ${step(d, 3)}`,
  open(W, d, msg, kind) { const r = d.rounds[d.r]; kp(this, W, d, { title: '🐟 صندوق سوق السمك', text: r.text, ans: r.ans, label: '🧾 سجّل', n: 3, id: 'mulDiv', msg, kind, lines: [{ who: 'obaid', text: 'حسابات دقيقة كالميزان! الزبائن راضون.' }], hint: 'المبلغ غير صحيح.' }); }
}, at(ST7.fish, 'fish', '🐟 صندوق السمك'));

/* ═══ ٥١. الجمع والطرح (٢) — «لعبة العشرات» (أزواج مجموعها ١٠) ═══ */
const pairSet = () => { const out = []; while (out.length < 3) { const a = R(0, 1) ? R(1, 99) * 10 : R(101, 989); if (a === 500 || out.some(p => p[0] === a || p[1] === a)) continue; out.push([a, 1000 - a]); } return out; };
export const addSub2 = Object.assign({
  id: 'addSub2', giver: 'hessa',
  intro: n => [{ who: 'hessa', text: `أهلاً يا ${n}! أنا حصة صاحبة لعبة العشرات.` },
    { who: 'hessa', text: 'في كل لوح ستة أعداد عشرية، اضغط كل عددين مجموعهما ١٠ بالضبط حتى يفرغ اللوح.' }],
  begin(d) { const a = R(31, 89), s = a + R(41, 99); d.rounds = [{ t: 'p', tiles: shuffle(pairSet().flat()) }, { t: 'p', tiles: shuffle(pairSet().flat()) }, { t: 'k', text: `▢ + ${dec((s - a) / 10)} = ${dec(s / 10)}. ما العدد المفقود؟`, ans: a / 10 }]; d.r = 0; d.gone = []; d.pick = -1; },
  goal: d => `🔟 أكمل ألواح العشرات ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '🔟 اللوح الأخير', text: r.text, ans: r.ans, n: 3, id: 'addSub2', msg, kind, lines: [{ who: 'hessa', text: 'ترى العشرات كأنها مكتوبة أمامك! أنت بطل التكملة.' }] });
    sheetOpen(`<h3>🔟 لوح العشرات ${ar(d.r + 1)}</h3>${msgBox(msg ? `${msg} اختر كل عددين مجموعهما ١٠` : 'اختر كل عددين مجموعهما ١٠ بالضبط', kind)}
      <div class="tiles">${r.tiles.map((v, i) => `<button class="tile ${d.gone.includes(i) ? 'gone' : ''} ${d.pick === i ? 'on' : ''}" data-i="${i}">${dec(v / 100)}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('.tile').forEach(b => b.onclick = async e => {
      e.stopPropagation(); const i = +b.dataset.i; if (d.gone.includes(i)) return;
      if (d.pick < 0 || d.pick === i) { d.pick = d.pick === i ? -1 : i; sfx('click'); this.open(W, d, msg, kind); return; }
      const a = r.tiles[d.pick], c = r.tiles[i];
      if (a + c === 1000) { d.gone.push(d.pick, i); d.pick = -1; sfx('good'); if (d.gone.length >= 6) { d.gone = []; await advance(this, W, d, 3, 'addSub2', null); } else this.open(W, d, `✓ ${dec(a / 100)} + ${dec(c / 100)} = ١٠`, 'ok'); }
      else { sfx('cough'); d.pick = -1; this.open(W, d, `${dec(a / 100)} + ${dec(c / 100)} = ${dec((a + c) / 100)} وليس ١٠.`, 'bad'); }
    });
    btn('benchOut', () => { sheetClose(); changed(); });
  }
}, at(ST7.pairs, 'pairs', '🔟 لوح العشرات'));

/* ═══ ٥٢. قوانين الحساب — «آلة الأقواس» (ترتيب العمليات) ═══ */
const PREC = o => (o === '×' || o === '÷') ? 2 : 1;
export function validOp(tk) {   // أول عملية يجب تنفيذها: داخل أعمق قوس، الضرب والقسمة قبل الجمع والطرح، بترتيب القراءة (من اليمين)
  let lo = 0, hi = tk.length - 1;
  for (let i = 0; i < tk.length; i++) if (tk[i] === '(') { let j = i + 1; while (tk[j] !== ')' && tk[j] !== '(') j++; if (tk[j] === ')') { lo = i + 1; hi = j - 1; break; } }
  let best = -1; for (let i = lo; i <= hi; i++) if (typeof tk[i] === 'string' && '+−×÷'.includes(tk[i]) && (best < 0 || PREC(tk[i]) > PREC(tk[best]))) best = i;
  return best;
}
const calc = (a, o, b) => o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : a / b;
function exprs() {
  const a = R(2, 9), b = R(2, 6), c = R(2, 5), k = R(2, 6);
  const T1 = R(0, 1) ? [R(3, 12), '+', b * k, '÷', b] : [R(10, 30), '+', a, '×', c, '−', R(1, 9)];
  const T2 = R(0, 1) ? ['(', a, '+', R(2, 9), ')', '×', c, '−', R(1, 9)] : [R(2, 6), '×', '(', R(8, 15), '−', R(2, 7), ')', '+', R(1, 9)];
  return [T1, T2];
}
export const operationLaws = Object.assign({
  id: 'operationLaws', giver: 'adil',
  intro: n => [{ who: 'adil', text: `يا ${n}! أنا عادل، وهذه آلة الأقواس. تحسب أي عبارة بشرط أن تختار العملية الصحيحة في كل مرة.` },
    { who: 'adil', text: 'اضغط العملية التي تُنفَّذ أولاً: ما داخل الأقواس، ثم الضرب والقسمة، ثم الجمع والطرح، من اليمين إلى اليسار.' }],
  begin(d) { const [t1, t2] = exprs(), x = R(3, 12), m = R(2, 6), p = R(1, 9); d.rounds = [{ t: 'm', tk: t1 }, { t: 'm', tk: t2 }, { t: 'k', text: `فكّرتُ في عدد، ضربته في ${ar(m)} ثم أضفت ${ar(p)} فصار ${ar(x * m + p)}. ما العدد؟`, ans: x }]; d.r = 0; d.cur = null; },
  goal: d => `⚙️ شغّل آلة الأقواس ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '⚙️ الآلة العكسية', text: r.text, ans: r.ans, opts: { dot: false }, n: 3, id: 'operationLaws', msg, kind, lines: [{ who: 'adil', text: 'الآلة تعمل بإتقان! تعرف ترتيب العمليات وعكسها.' }], hint: 'جرّب العكس: اطرح أولاً ثم اقسم.' });
    if (!d.cur) d.cur = r.tk.slice();
    const tk = d.cur, done = tk.length === 1;
    sheetOpen(`<h3>⚙️ آلة الأقواس</h3>${msgBox(msg || (done ? `النتيجة: ${ar(tk[0])}` : 'اضغط العملية التي تُنفَّذ أولاً'), kind)}
      <div class="expr">${tk.map((x, i) => typeof x === 'number' ? `<span class="num">${ar(x)}</span>` : '+−×÷'.includes(x) ? `<button class="tok" data-i="${i}">${x}</button>` : `<span class="par">${x}</span>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button>${done ? '<button class="act go" id="benchGo">✓ التالي</button>' : ''}</div>`);
    panel().querySelectorAll('.tok').forEach(b => b.onclick = e => {
      e.stopPropagation(); const i = +b.dataset.i;
      if (i !== validOp(tk)) { sfx('cough'); this.open(W, d, 'تعطّلت الآلة! الأقواس أولاً، ثم الضرب والقسمة، ثم الجمع والطرح، من اليمين إلى اليسار.', 'bad'); return; }
      tk.splice(i - 1, 3, calc(tk[i - 1], tk[i], tk[i + 1])); sfx('click');
      for (let j = 0; j < tk.length - 2; j++) if (tk[j] === '(' && typeof tk[j + 1] === 'number' && tk[j + 2] === ')') tk.splice(j, 3, tk[j + 1]);
      changed(); this.open(W, d, tk.length === 1 ? `✓ النتيجة ${ar(tk[0])}` : '✓ خطوة صحيحة، تابع', 'ok');
    });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { d.cur = null; await advance(this, W, d, 3, 'operationLaws', null); });
  }
}, at(ST7.machine, 'machine', '⚙️ آلة الأقواس'));

/* ═══ ٥٣. الكسور والقسمة — «كعك لطيفة» ═══ */
export const fractionDiv = Object.assign({
  id: 'fractionDiv', giver: 'latifa',
  intro: n => [{ who: 'latifa', text: `أهلاً يا ${n}! أنا لطيفة، أخبز الكعك للأطفال وأوزّعه بالعدل.` },
    { who: 'latifa', text: 'القسمة تعطي كسوراً أحياناً: ٣ كعكات على ٤ أطفال تعني لكل طفل ثلاثة أرباع كعكة.' }],
  begin(d) { const kids = R(3, 6), cakes = R(1, kids - 1), x = R(50, 499) * 2 + 1, q = [3, 4, 5][R(0, 2)], p = R(1, q - 1), v = p * R(3, 12);
    d.rounds = [{ t: 'f', cakes, kids, text: `${ar(cakes)} كعكات تُقسم على ${ar(kids)} أطفال بالتساوي. كم نصيب كل طفل من الكعكة؟ اكتبه كسراً.` }, { t: 'k', text: `${ar(x)} ÷ ٢ = ؟ (اكتب الناتج عدداً عشرياً)`, ans: x / 2 }, { t: 'k', text: `إذا كان ${fr(p, q)} عددٍ يساوي ${ar(v)}، فما العدد كله؟`, ans: v * q / p }]; d.r = 0; d.fn = 0; d.fd = 0; },
  goal: d => `🍰 وزّع الكعك بالكسور ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '🍰 حسابات الكعك', text: r.text, ans: r.ans, n: 3, id: 'fractionDiv', msg, kind, lines: [{ who: 'latifa', text: 'كل طفل نال نصيبه بالعدل، والحساب بالكسور صار سهلاً!' }] });
    sheetOpen(`<h3>🍰 توزيع الكعك</h3>${msgBox(msg ? `${msg} ${r.text}` : r.text, kind)}<canvas id="cake" width="300" height="90"></canvas><div id="fb"></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🍰 وزّع</button></div>`);
    const c = hiDPI(panel().querySelector('#cake'));
    const draw = () => { c.clearRect(0, 0, 300, 90); for (let i = 0; i < r.cakes; i++) { const x = 40 + i * 70; c.fillStyle = '#F5C77E'; c.beginPath(); c.arc(x, 45, 30, 0, 7); c.fill(); const n = Math.max(1, d.fd || 1); c.strokeStyle = '#8B5A2B'; c.lineWidth = 2; for (let k = 0; k < n && n > 1; k++) { const a = k * 2 * Math.PI / n; c.beginPath(); c.moveTo(x, 45); c.lineTo(x + 30 * Math.cos(a), 45 + 30 * Math.sin(a)); c.stroke(); } } };
    draw(); fracBuilder(panel().querySelector('#fb'), d); panel().querySelector('#fb').addEventListener('click', draw);
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (d.fd > 0 && d.fn * r.kids === r.cakes * d.fd) { d.fn = d.fd = 0; await advance(this, W, d, 3, 'fractionDiv', null); } else { sfx('cough'); setMsg(`${d.fd ? `${ar(d.fn)}/${ar(d.fd)}` : 'هذا'} ليس نصيب كل طفل. ${r.text}`, 'bad'); } });
  }
}, at(ST7.cakes, 'cakes', '🍰 طاولة الكعك'));

/* ═══ ٥٤. النسب المئوية — «تخفيضات العيد» ═══ */
const FP = [[1, 4], [3, 4], [2, 5], [3, 10], [7, 20], [1, 2], [4, 5], [3, 5]];
export const percentages = Object.assign({
  id: 'percentages', giver: 'ghanim',
  intro: n => [{ who: 'ghanim', text: `عيدك مبارك يا ${n}! أنا غانم، ومحلي فيه تخفيضات العيد.` },
    { who: 'ghanim', text: 'لوّن شبكة المئة لتعرف النسبة، واحسب الأسعار بعد الخصم.' }],
  begin(d) { const [a, b] = FP[R(0, 7)]; let P, pc; do { P = R(4, 20) * 5; pc = [10, 20, 25, 30, 40, 50][R(0, 5)]; } while ((P * pc) % 100); const g = R(3, 13) * 5;
    d.rounds = [{ t: 'g', a, b, ans: a * 100 / b }, { t: 'k', text: `ثوب العيد بـ ${ar(P)} ريالاً، وعليه خصم ${ar(pc)}٪. كم سعره الجديد؟`, ans: P - P * pc / 100 }, { t: 'k', text: `حافلة الزوار تحمل ٢٠٠ زائر، نزل منهم ${ar(g)}٪ عند السوق. كم زائراً بقي فيها؟`, ans: 200 * (100 - g) / 100 }]; d.r = 0; d.pc = 0; },
  goal: d => `🏷️ أكمل لافتات تخفيضات العيد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '🏷️ لافتة السعر', text: r.text, ans: r.ans, n: 3, id: 'percentages', msg, kind, lines: [{ who: 'ghanim', text: 'كل اللافتات صحيحة! الزبائن يعرفون كم يوفّرون.' }], hint: 'احسب النسبة من المبلغ أولاً.' });
    sheetOpen(`<h3>🏷️ شبكة المئة</h3>${msgBox(msg ? `${msg} ما النسبة المئوية التي تساوي ${fr(r.a, r.b)}؟` : `ما النسبة المئوية التي تساوي ${fr(r.a, r.b)}؟ لوّن الشبكة`, kind)}<canvas id="hg" width="200" height="200"></canvas>
      <div class="cnt"><span>النسبة</span><button class="act ghost" data-p="-10">−١٠</button><button class="act ghost" data-p="-1">−١</button><b id="pcv">${ar(d.pc)}٪</b><button class="act ghost" data-p="1">+١</button><button class="act ghost" data-p="10">+١٠</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🏷️ ثبّت</button></div>`);
    const c = hiDPI(panel().querySelector('#hg'));
    const draw = () => { c.clearRect(0, 0, 200, 200); for (let i = 0; i < 100; i++) { c.fillStyle = i < d.pc ? '#E2475C' : '#F4EBD6'; c.fillRect(2 + (i % 10) * 19.6, 2 + Math.floor(i / 10) * 19.6, 17.6, 17.6); } };
    draw();
    panel().querySelectorAll('[data-p]').forEach(b => b.onclick = e => { e.stopPropagation(); d.pc = clamp(d.pc + +b.dataset.p, 0, 100); panel().querySelector('#pcv').textContent = ar(d.pc) + '٪'; sfx('click'); draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (d.pc === r.ans) { d.pc = 0; await advance(this, W, d, 3, 'percentages', null); } else { sfx('cough'); setMsg(`${ar(d.pc)}٪ لا تساوي ${fr(r.a, r.b)}. حوّل الكسر إلى مقام ١٠٠`, 'bad'); } });
  }
}, at(ST7.sale, 'sale', '🏷️ لافتات التخفيض'));

/* ═══ ٥٥. استخدام النسبة والتناسب — «خلطات شمسة» ═══ */
export const ratioProportion = Object.assign({
  id: 'ratioProportion', giver: 'shamsa',
  intro: n => [{ who: 'shamsa', text: `حيّاك يا ${n}! أنا شمسة، وخلطاتي سرّها النسبة الصحيحة.` },
    { who: 'shamsa', text: 'إذا تضاعف العدد تضاعفت المقادير، والنسبة ٢ : ٣ تعني جزأين مقابل ثلاثة أجزاء.' }],
  begin(d) { const per = R(2, 4), p1 = R(3, 6), p2 = p1 * R(2, 3), a = R(2, 4), b = a + R(1, 3), k = R(2, 6) * 5, ra = R(1, 3), rb = ra + R(1, 3), kk = R(2, 5);
    d.rounds = [{ t: 'c1', text: `عصير ${ar(p1)} أشخاص يحتاج ${ar(per * p1)} برتقالة. كم برتقالة لعصير ${ar(p2)} شخصاً؟`, ans: per * p2 }, { t: 'k', text: `نسبة العصير إلى الماء ${ar(a)} : ${ar(b)}، ولدينا ${ar(a * k)} مل عصير. كم مل من الماء نضيف؟`, ans: b * k },
      { t: 'c2', ra, rb, T: (ra + rb) * kk, text: `وزّعي ${ar((ra + rb) * kk)} تمرة بين مريم وسلمى بنسبة ${ar(ra)} : ${ar(rb)}.`, A: ra * kk, B: rb * kk }]; d.r = 0; d.o = 0; d.A = 0; d.B = 0; },
  goal: d => `🥣 حضّر خلطات شمسة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '🥣 قِدر الخلط', text: r.text, ans: r.ans, opts: { dot: false }, n: 3, id: 'ratioProportion', msg, kind, lines: null, hint: 'النسبة لم تُحفظ.' });
    const items = r.t === 'c1' ? [['o', '🍊 برتقال', 120]] : [['A', '👧 مريم', 60], ['B', '👧 سلمى', 60]];
    sheetOpen(`<h3>🥣 ${r.t === 'c1' ? 'سلة البرتقال' : 'توزيع التمر'}</h3>${msgBox(msg ? `${msg} ${r.text}` : r.text, kind)}<div id="cnt"></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🥣 حضّر</button></div>`);
    counters(panel().querySelector('#cnt'), items, d);
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const ok = r.t === 'c1' ? d.o === r.ans : (d.A === r.A && d.B === r.B);
      if (ok) { d.o = d.A = d.B = 0; await advance(this, W, d, 3, 'ratioProportion', [{ who: 'shamsa', text: 'خلطات متناسبة تماماً! سرّ الطعم في النسبة.' }]); }
      else { sfx('cough'); setMsg(r.t === 'c2' && d.A + d.B !== r.T ? `مجموع الحصتين يجب أن يكون ${ar(r.T)}` : `النسبة غير محفوظة. ${r.text}`, 'bad'); }
    });
  }
}, at(ST7.mix, 'mix', '🥣 طاولة الخلط'));

/* ═══ ٥٦. الكسور — «شوكولاتة ريا» ═══ */
const BARS = [[12, 3, 4, 2, 3], [10, 2, 5, 3, 5], [8, 2, 4, 3, 4], [12, 3, 4, 3, 4], [6, 2, 3, 1, 3], [9, 3, 3, 2, 3]];
export const fractions = Object.assign({
  id: 'fractions', giver: 'raya',
  intro: n => [{ who: 'raya', text: `أهلاً يا ${n}! أنا ريا، أبيع ألواح الشوكولاتة بالقطع.` },
    { who: 'raya', text: 'كل طلب كسر من اللوح. اختر القطع التي تساوي الكسر، فاللوح المقسّم ١٢ قطعة ثلثاه ٨ قطع.' }],
  begin(d) { const [b1, b2] = shuffle(BARS).slice(0, 2), g = R(3, 9), y = R(2, 8); d.rounds = [{ t: 'b', bar: b1 }, { t: 'b', bar: b2 }, { t: 'f', g, y }]; d.r = 0; d.sel = []; d.fn = 0; d.fd = 0; },
  goal: d => `🍫 قطّع ألواح الشوكولاتة بالكسور ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'b') {
      const [N, rows, cols, a, b] = r.bar;
      sheetOpen(`<h3>🍫 لوح من ${ar(N)} قطعة</h3>${msgBox(msg ? `${msg} أعطِ الزبون ${fr(a, b)} اللوح` : `الزبون يريد ${fr(a, b)} اللوح. اختر القطع`, kind)}
        <div class="choco" style="grid-template-columns:repeat(${cols},1fr)">${Array.from({ length: N }, (_, i) => `<button class="piece ${d.sel.includes(i) ? 'on' : ''}" data-i="${i}"></button>`).join('')}</div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🍫 أعطِ الزبون</button></div>`);
      panel().querySelectorAll('.piece').forEach(p => p.onclick = e => { e.stopPropagation(); const i = +p.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else d.sel.push(i); p.classList.toggle('on'); sfx('click'); });
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { if (d.sel.length * b === a * N) { d.sel = []; await advance(this, W, d, 3, 'fractions', null); } else { sfx('cough'); setMsg(`${ar(d.sel.length)} من ${ar(N)} لا تساوي ${fr(a, b)}`, 'bad'); } });
    } else {
      sheetOpen(`<h3>🍎 سلة التفاح</h3>${msgBox(msg ? `${msg} في السلة ${ar(r.g)} تفاحات خضراء و${ar(r.y)} حمراء. ما كسر التفاح الأحمر من المجموع؟` : `في السلة ${ar(r.g)} تفاحات خضراء و${ar(r.y)} حمراء. ما كسر التفاح الأحمر من المجموع؟`, kind)}
        <div class="apples">${'🍏'.repeat(r.g)}${'🍎'.repeat(r.y)}</div><div id="fb"></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ الكسر</button></div>`);
      fracBuilder(panel().querySelector('#fb'), d);
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { if (d.fd > 0 && d.fn * (r.g + r.y) === r.y * d.fd) { d.fn = d.fd = 0; await advance(this, W, d, 3, 'fractions', [{ who: 'raya', text: 'تعرف الكسور كما تعرف قطع الشوكولاتة! عيد سعيد.' }]); } else { sfx('cough'); setMsg('الكسر = عدد التفاح الأحمر ÷ عدد التفاح كله', 'bad'); } });
    }
  }
}, at(ST7.choco, 'choco', '🍫 ألواح الشوكولاتة'));

/* ═══ ٥٧. الأعداد الكسرية — «براميل حميد» ═══ */
export const mixedNumbers = Object.assign({
  id: 'mixedNumbers', giver: 'humaid',
  intro: n => [{ who: 'humaid', text: `مرحباً يا ${n}! أنا حميد حارس البراميل. كل برميل مقسّم أجزاءً متساوية.` },
    { who: 'humaid', text: 'املأ البراميل بالمقدار المطلوب، سواء كُتب عدداً كسرياً مثل ٢ و¾ أو كسراً غير اعتيادي مثل ١١/٤.' }],
  begin(d) { const den1 = [3, 4][R(0, 1)], w1 = R(1, 2), n1 = R(1, den1 - 1), den2 = [3, 4][R(0, 1)], tot2 = R(den2 + 1, 3 * den2 - 1), den3 = [3, 4, 5][R(0, 2)], tot3 = R(den3 + 1, 4 * den3 - 1);
    d.rounds = [{ t: 'fill', den: den1, parts: w1 * den1 + n1, text: `املأ ${ar(w1)} و${fr(n1, den1)} برميل` }, { t: 'fill', den: den2, parts: tot2 % den2 ? tot2 : tot2 + 1, text: '' }, { t: 'conv', den: den3, tot: tot3 % den3 ? tot3 : tot3 + 1 }];
    d.rounds[1].text = `املأ ${fr(d.rounds[1].parts, den2)} برميل`; d.r = 0; d.f = 0; d.fw = 0; d.fn = 0; d.fd = 0; },
  goal: d => `🛢️ املأ براميل حميد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'conv') {
      sheetOpen(`<h3>🛢️ دفتر البراميل</h3>${msgBox(msg ? `${msg} حوّل ${fr(r.tot, r.den)} إلى عدد كسري` : `حوّل ${fr(r.tot, r.den)} إلى عدد كسري`, kind)}<div id="fb"></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ سجّل</button></div>`);
      fracBuilder(panel().querySelector('#fb'), d, true);
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { const w = Math.floor(r.tot / r.den), rem = r.tot % r.den;
        if (d.fw === w && d.fd > 0 && d.fn < d.fd && d.fn * r.den === rem * d.fd) { d.fw = d.fn = d.fd = 0; await advance(this, W, d, 3, 'mixedNumbers', [{ who: 'humaid', text: 'البراميل ممتلئة كما طلبنا، والدفتر صحيح! تحوّل بين الصور بسهولة.' }]); }
        else { sfx('cough'); setMsg(`كم مرة يدخل ${ar(r.den)} في ${ar(r.tot)}؟ ذاك هو العدد الصحيح، والباقي هو البسط`, 'bad'); } });
      return;
    }
    const nb = Math.ceil(r.parts / r.den) + 1;
    sheetOpen(`<h3>🛢️ براميل حميد</h3>${msgBox(msg ? `${msg} ${r.text}` : r.text, kind)}<canvas id="br" width="300" height="140"></canvas>
      <div class="row2"><button class="act" id="pump">💧 اضخ (اضغط مطولاً)</button><button class="act ghost" id="back">↩ صرّف جزءاً</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ هذا المقدار</button></div>`);
    const c = hiDPI(panel().querySelector('#br'));
    const draw = () => { c.clearRect(0, 0, 300, 140); const w = Math.min(70, 280 / nb - 10); for (let i = 0; i < nb; i++) { const x = 10 + i * (w + 10), fill = clamp(d.f - i * r.den, 0, r.den); c.fillStyle = '#7CC8F0'; c.fillRect(x, 130 - 120 * fill / r.den, w, 120 * fill / r.den); c.strokeStyle = '#5E6B78'; c.lineWidth = 3; c.strokeRect(x, 10, w, 120); c.lineWidth = 1.2; for (let k = 1; k < r.den; k++) { const y = 130 - 120 * k / r.den; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 12, y); c.stroke(); } } };
    draw();
    let tm = 0; const pump = panel().querySelector('#pump'), stop = () => clearInterval(tm);
    pump.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const add = () => { d.f = Math.min(nb * r.den, d.f + 1); sfx('pick'); draw(); }; add(); stop(); tm = setInterval(add, 320); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => pump.addEventListener(ev, stop));
    btn('back', () => { d.f = Math.max(0, d.f - 1); draw(); });
    btn('benchOut', () => { stop(); sheetClose(); changed(); });
    btn('benchGo', async () => { stop(); if (d.f === r.parts) { d.f = 0; await advance(this, W, d, 3, 'mixedNumbers', null); } else { sfx('cough'); setMsg(d.f > r.parts ? 'الماء أكثر من المطلوب!' : 'الماء أقل من المطلوب!', 'bad'); } });
  }
}, at(ST7.barrels, 'barrels', '🛢️ مضخة البراميل'));

export const T2U3 = { numberSystem2, numberHistory2, addSub1, mulDiv, addSub2, operationLaws, fractionDiv, percentages, ratioProportion, fractions, mixedNumbers };
