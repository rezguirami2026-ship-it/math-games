// الصف السابع — قرية الخير (الوحدة ١ في الكتاب: الأعداد الصحيحة والقوى والجذور).
// ثماني محطات قرب أصحابها، لكل درس أداة في يد الطالب: مقياس البئر، دفتر الإشارات، تقويم الفلج، أحواض الشتلات، الغربال وشجرة العوامل،
// إطار النحل وصانع القوى، صندوق المكعبات، ولوح الأقواس. الأدوات المشتركة من missions/g5/common.js.
import { ar } from '../../core/util.js';
import { bigSign, workTable } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, panel, sheetOpen, msgBox, setMsg, btn } from '../bench.js';
import { step, at, advance, kp, out } from '../g5/common.js';

/* المحطات: أماكن مفتوحة فُحصت بالتصادم (خمس منها أماكن محطات الخامس نفسها، ولا يظهر صفّان معاً) */
export const ST7V = {
  well: { x: 1078, y: 992 },     // العم حمد: مصعد البئر
  ledger: { x: 288, y: 938 },    // العم ناصر: دفتر الدكان
  falaj: { x: 523, y: 898 },     // يوسف: مواعيد الفلج
  beds: { x: 1030, y: 622 },     // أم خالد: أحواض الزهور
  sieve: { x: 1375, y: 1395 },   // راشد: غربال البذور
  hive: { x: 709, y: 990 },      // العم سالم: خلايا النحل (على الرمل جنوب الطريق، لا في موقف الشاحنات)
  crates: { x: 568, y: 1390 },   // سعيد: صناديق التمر المكعبة
  board: { x: 1100, y: 389 }     // أم خالد: لغز اللوح
};
const P = n => n < 0 ? `(${ar(n)})` : ar(n);
const pw = (b, e) => `<span dir="ltr">${ar(b)}<sup>${ar(e)}</sup></span>`;
const gcd = (a, b) => b ? gcd(b, a % b) : a, lcm = (a, b) => a / gcd(a, b) * b;
const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
const NEG = { neg: true, dot: false }, INT = { dot: false };

/* رسم المحطة في العالم: طاولة عليها رمز الأداة، ولافتة باسمها */
export const prop = (icon, label, bg, side = -1) => (c, x, y) => {
  workTable(c, x, y);
  c.font = '26px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText(icon, x, y - 34);
  bigSign(c, x + side * 104, y + 6, label, { fs: 12, h: 30, bg });
};

/* ═══ ١-١ جمع وطرح الأعداد الصحيحة — «مصعد البئر» (مقياس رأسي من +١٠ إلى −٢٥) ═══ */
const TOP = 10, BOT = -25;
function wellGauge(lv, mark) {
  const rows = []; for (let v = TOP; v >= BOT; v--) rows.push(`<div class="g7wr${v === 0 ? ' zero' : ''}${v === lv ? ' on' : ''}${v === mark ? ' mark' : ''}"><small>${v % 5 === 0 ? ar(v) : ''}</small><i></i>${v === lv ? '<b>🪣</b>' : ''}</div>`);
  return `<div class="g7well">${rows.join('')}</div>`;
}
export const addSubInt7 = Object.assign({
  id: 'addSubInt7', giver: 'hamad',
  intro: n => [{ who: 'hamad', text: `أهلاً يا ${n}! بكرة البئر تحتاج من يحرّك الدلو بالأمتار الصحيحة.` },
    { who: 'hamad', text: 'سطح الأرض صفر: ما فوقه موجب، وما تحته سالب. الصعود جمع والنزول طرح.' }],
  begin(d) {
    const s = -R(8, 15), up = R(4, 9), down = R(3, up - 1), top = R(2, 6), b = -R(6, 14), s2 = R(-6, 3), ops = [-R(5, 9), R(3, 7), -R(4, 8)];   // الصعود أكبر من النزول، فلا يكون الجواب نقطة البداية
    if (ops[0] + ops[1] + ops[2] === 0) ops[2]--;
    d.rounds = [{ t: 'move', s, ops: [up, -down] }, { t: 'gap', top, b }, { t: 'move', s: s2, ops }];
    d.rounds.forEach(r => { if (r.t === 'move') r.ans = r.ops.reduce((a, x) => a + x, r.s); });
    d.r = 0; d.lv = d.rounds[0].s; d.lvr = 0;
  },
  goal: d => `🪣 حرّك دلو البئر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hamad', text: 'الدلو يصل حيث تريد بالضبط! الأعداد الصحيحة صارت سهلة عليك.' }];
    if (r.t === 'gap') return kp(this, W, d, { title: '🪣 حبل البئر', visual: wellGauge(r.b, r.top), text: `حافة البكرة على ارتفاع <b>${ar(r.top)}</b> م فوق السطح، والدلو على <b>${ar(r.b)}</b> م. كم متراً من الحبل بين البكرة والدلو؟`, ans: r.top - r.b, n: 3, id: 'addSubInt7', msg, kind, opts: INT, lines: L,
      hint: `ليس هذا الطول: المسافة = الأعلى − الأسفل = ${ar(r.top)} − ${P(r.b)}، وطرح العدد السالب جمع.` });
    if (d.lvr !== d.r) { d.lv = r.s; d.lvr = d.r; }   // كل جولة تبدأ من موضع الدلو المذكور فيها
    const say = r.ops.map(v => v > 0 ? `اصعد <b>${ar(v)}</b> م` : `انزل <b>${ar(-v)}</b> م`).join('، ثم ');
    sheetOpen(`<h3>🪣 مصعد البئر</h3>${msgBox((msg ? msg + ' ' : '') + `الدلو الآن عند <b>${ar(r.s)}</b> م. ${say}، ثم ثبّت الدلو.`, kind)}
      <div class="g7row">${wellGauge(d.lv)}<div class="g5cards col"><button class="g5card" data-v="5">▲ ٥ م</button><button class="g5card" data-v="1">▲ ١ م</button><button class="g5card" data-v="-1">▼ ١ م</button><button class="g5card" data-v="-5">▼ ٥ م</button></div></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ ثبّت الدلو</button></div>`);
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); d.lv = Math.max(BOT, Math.min(TOP, d.lv + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.lv === r.ans) await advance(this, W, d, 3, 'addSubInt7', L);
      else { sfx('cough'); const flip = r.ops.reduce((a, x) => a - x, r.s) === d.lv; d.lv = r.s; this.open(W, d, flip ? 'الدلو ذهب في الاتجاه المعاكس! الصعود نحو الموجب (لأعلى)، والنزول نحو السالب.' : 'الدلو ليس في مكانه. أعدناه إلى البداية: نفّذ الأوامر بالترتيب وعُدّ الأمتار على المقياس.', 'bad'); }
    });
  }
}, at(ST7V.well, 'well', '🪣 مصعد البئر', prop('🪣', '🪣 مصعد البئر', '#2E6F96', 1)));

/* ═══ ١-١ب ضرب وقسمة الأعداد الصحيحة — «دفتر الدكان» (الربح موجب والخسارة سالبة) ═══ */
export const mulDivInt7 = Object.assign({
  id: 'mulDivInt7', giver: 'naser',
  intro: n => [{ who: 'naser', text: `يا ${n}! دفتر الدكان فيه أرباح وخسائر تتكرر كل يوم.` },
    { who: 'naser', text: 'نكتب الربح موجباً والخسارة سالبة، ونضرب ونقسم بإشاراتها.' }],
  begin(d) {
    const l = R(3, 9), k = R(4, 8), q = R(3, 9), m = R(3, 7), A = [R(2, 6), R(2, 5), R(2, 4)], neg = R(0, 1);
    const tgt = A.reduce((a, x) => a * x, 1) * (neg ? -1 : 1);
    d.rounds = [{ t: 'loss', l, k }, { t: 'debt', q, m }, { t: 'sign', A, tgt }];
    d.r = 0; d.sg = [1, 1, 1];
  },
  goal: d => `📒 رتّب دفتر العم ناصر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'naser', text: 'دفتر مضبوط! إشارات الضرب والقسمة لا تخدعك أبداً.' }];
    if (r.t === 'loss') return kp(this, W, d, { title: '📒 دفتر الدكان', text: `خسر الدكان <b>${ar(r.l)}</b> ريالات كل يوم لمدة <b>${ar(r.k)}</b> أيام. اكتب التغيّر في الرصيد بإشارته (الخسارة سالبة).`, ans: -r.l * r.k, n: 3, id: 'mulDivInt7', msg, kind, opts: NEG, lines: L,
      hint: 'ليس هذا التغيّر: الخسارة اليومية عدد سالب، اضربه في عدد الأيام وانتبه للإشارة (زر −).' });
    if (r.t === 'debt') return kp(this, W, d, { title: '📒 تقسيط الدَّين', text: `على الدكان دَين <b>${ar(-r.q * r.m)}</b> ريالاً، يُسدَّد بالتساوي في <b>${ar(r.m)}</b> أيام. اكتب نصيب اليوم الواحد بإشارته.`, ans: -r.q, n: 3, id: 'mulDivInt7', msg, kind, opts: NEG, lines: L,
      hint: 'ليس هذا النصيب: اقسم الدَّين (سالب) على عدد الأيام (موجب): ما إشارة الناتج؟ تحقّق بالضرب.' });
    const f = r.A.map((a, i) => `<button class="g5card" data-i="${i}">${P(d.sg[i] * a)}</button>`).join('<b class="g7op">×</b>');
    sheetOpen(`<h3>📒 إشارات الدفتر</h3>${msgBox((msg ? msg + ' ' : '') + `اضغط العوامل لتغيير إشاراتها حتى يصبح الناتج <b>${ar(r.tgt)}</b>.`, kind)}
      <div class="g5cards g7expr">${f}<b class="g7op">=</b><b class="g7res">${ar(r.tgt)}</b></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ سجّل في الدفتر</button></div>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); d.sg[+b.dataset.i] *= -1; sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const v = r.A.reduce((a, x, i) => a * x * d.sg[i], 1);
      if (v === r.tgt) await advance(this, W, d, 3, 'mulDivInt7', L);
      else { sfx('cough'); this.open(W, d, `الناتج الآن ${ar(v)}: الإشارة لا تطابق. عُدّ العوامل السالبة: عددها الزوجي يعطي موجباً، والفردي يعطي سالباً.`, 'bad'); }
    });
  }
}, at(ST7V.ledger, 'ledger', '📒 دفتر الدكان', prop('📒', '📒 دفتر الدكان', '#1F7A4D', 1)));

/* ═══ ١-٢ المضاعفات — «مواعيد الفلج» (تقويم أيام: متى تُفتح القنوات معاً؟) ═══ */
const PAIRS = [[4, 6], [6, 8], [6, 9], [4, 10], [6, 10], [8, 12], [9, 12], [10, 15], [4, 14], [12, 18]];
const TRIPLES = [[2, 3, 5], [3, 4, 6], [2, 5, 6], [4, 5, 10], [3, 5, 6], [2, 7, 4], [3, 4, 5]];
export const multiples7 = Object.assign({
  id: 'multiples7', giver: 'yousef',
  intro: n => [{ who: 'yousef', text: `يا ${n}! قنوات الفلج تُفتح كل عدد من الأيام، وأبي يريد معرفة متى تُفتح معاً.` },
    { who: 'yousef', text: 'اضغط في التقويم اليوم الذي تُفتح فيه القنوات كلها معاً أول مرة.' }],
  begin(d) {
    const [p1, p2] = shuffle(PAIRS).slice(0, 2), t = TRIPLES[R(0, TRIPLES.length - 1)];
    d.rounds = [{ ch: p1 }, { ch: p2 }, { ch: t }].map(r => ({ ...r, ans: r.ch.reduce(lcm, 1) }));
    d.r = 0;
  },
  goal: d => `💧 جد موعد التقاء قنوات الفلج ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], max = 60, L = [{ who: 'yousef', text: 'عرفتَ موعد كل التقاء! المضاعف المشترك الأصغر نظّم الري كله.' }];
    const names = r.ch.map(v => `كل <b>${ar(v)}</b> أيام`).join(' و');
    sheetOpen(`<h3>💧 تقويم الفلج</h3>${msgBox((msg ? msg + ' ' : '') + `${r.ch.length === 2 ? 'قناتان تُفتحان' : 'ثلاث قنوات تُفتح'}: ${names}، وفُتحت كلها اليوم (يوم ٠). في أي يوم تُفتح كلها معاً من جديد؟`, kind)}
      <div class="g5board g7days">${Array.from({ length: max }, (_, i) => `<button class="g5card" data-day="${i + 1}">${ar(i + 1)}</button>`).join('')}</div>
      <button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-day]').forEach(b => b.onclick = async e => {
      e.stopPropagation(); const v = +b.dataset.day;
      if (v === r.ans) return advance(this, W, d, 3, 'multiples7', L);
      sfx('cough'); const open = r.ch.filter(c => v % c === 0);
      this.open(W, d, open.length === r.ch.length ? `في اليوم ${ar(v)} تُفتح كلها فعلاً، لكنها التقت قبله! ابحث عن أصغر يوم مشترك.` : open.length ? `في اليوم ${ar(v)} تُفتح ${open.length === 1 ? 'قناة واحدة' : 'قناتان'} فقط (${open.map(c => `كل ${ar(c)}`).join(' و')}). اكتب مضاعفات كل عدد وقارن.` : `في اليوم ${ar(v)} لا تُفتح أي قناة: هو ليس مضاعفاً لأي من الأعداد.`, 'bad');
    });
    out();
  }
}, at(ST7V.falaj, 'falaj', '💧 مواعيد الفلج', prop('📅', '💧 مواعيد الفلج', '#2E6F96', 1)));

/* ═══ ١-٣ العوامل وقابلية القسمة — «أحواض الزهور» (صفوف متساوية، أكبر عامل مشترك، اختبار القسمة) ═══ */
const TESTS = { 3: 'مجموع أرقامه يقبل القسمة على ٣', 9: 'مجموع أرقامه يقبل القسمة على ٩', 4: 'العدد المكوّن من آخر رقمين يقبل القسمة على ٤' };
export const factors7 = Object.assign({
  id: 'factors7', giver: 'umkhalid',
  intro: n => [{ who: 'umkhalid', text: `أهلاً يا ${n}! عندي شتلات كثيرة وأريدها في أحواض منسّقة.` },
    { who: 'umkhalid', text: 'كل حوض صفوف متساوية بلا شتلة زائدة: هذه هي العوامل.' }],
  begin(d) {
    const n = [24, 36, 48, 60, 72][R(0, 4)], fs = []; for (let k = 4; k < 10; k++) if (n % k === 0) fs.push(k);
    const [a, b] = [[24, 36], [18, 30], [16, 40], [20, 30], [28, 42], [36, 48], [27, 45], [32, 48]][R(0, 7)];
    const k = [3, 9, 4][R(0, 2)], cards = []; for (let t = 0; cards.length < 6 && t < 300; t++) { const v = R(102, 998), ok = v % k === 0; if (cards.includes(v) || cards.filter(x => (x % k === 0) === ok).length >= 3) continue; cards.push(v); }
    d.rounds = [{ t: 'rows', n, lo: 3, hi: 10 }, { t: 'beds', a, b }, { t: 'test', k, cards }];
    d.r = 0; d.k = 2; d.on = [];
  },
  goal: d => `🌷 نسّق أحواض أم خالد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'umkhalid', text: 'الأحواض منسّقة بلا شتلة زائدة! العوامل واختبارات القسمة بين يديك.' }];
    if (r.t === 'test') {
      sheetOpen(`<h3>🌷 صناديق البذور</h3>${msgBox((msg ? msg + ' ' : '') + `اختر كل صندوق يمكن توزيع بذوره على <b>${ar(r.k)}</b> أحواض بالتساوي. اختبار القسمة على ${ar(r.k)}: ${TESTS[r.k]}.`, kind)}
        <div class="g5cards">${r.cards.map((v, i) => `<button class="g5card${d.on.includes(i) ? ' on' : ''}" data-c="${i}">🌱 ${ar(v)}</button>`).join('')}</div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ وزّع البذور</button></div>`);
      panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.c, j = d.on.indexOf(i); if (j >= 0) d.on.splice(j, 1); else d.on.push(i); sfx('click'); this.open(W, d, msg, kind); });
      out();
      return btn('benchGo', async () => {
        const bad = r.cards.findIndex((v, i) => (v % r.k === 0) !== d.on.includes(i));
        if (bad < 0) { d.on = []; await advance(this, W, d, 3, 'factors7', L); }
        else { sfx('cough'); const v = r.cards[bad]; this.open(W, d, `راجع الصندوق ${ar(v)}: ${r.k === 4 ? `آخر رقمين ${ar(v % 100)}` : `مجموع أرقامه ${ar(String(v).split('').reduce((s, x) => s + +x, 0))}`}. هل يقبل القسمة على ${ar(r.k)}؟`, 'bad'); }
      });
    }
    const isRows = r.t === 'rows', k = d.k, n = isRows ? r.n : null;
    const grid = isRows ? `<div class="g7beds">${Array.from({ length: k }, (_, i) => `<div>${'🌱'.repeat(Math.min(Math.floor(n / k), 24))}</div>`).join('')}${n % k ? `<div class="left">${'🥀'.repeat(n % k)} ${ar(n % k)} زائدة</div>` : ''}</div>`
      : `<div class="g7beds">${Array.from({ length: Math.min(k, 12) }, () => `<div>🌹×${ar(Math.floor(r.a / k))} 🌿×${ar(Math.floor(r.b / k))}</div>`).join('')}</div>`;
    const text = isRows ? `رتّب <b>${ar(r.n)}</b> شتلة في صفوف متساوية، عدد الصفوف أكثر من <b>${ar(r.lo)}</b> وأقل من <b>${ar(r.hi)}</b>، بلا شتلة زائدة.`
      : `عندي <b>${ar(r.a)}</b> شتلة ورد و<b>${ar(r.b)}</b> شتلة ريحان. أريد <b>أكبر عدد</b> من الأحواض المتماثلة، في كل حوض العدد نفسه من كل نوع، بلا شتلة زائدة.`;
    sheetOpen(`<h3>🌷 ${isRows ? 'صفوف الشتلات' : 'أحواض متماثلة'}</h3>${msgBox((msg ? msg + ' ' : '') + text, kind)}
      <div class="g7ctr"><button class="g5card" data-v="-1">−</button><b>${ar(k)} ${isRows ? 'صفوف' : 'أحواض'}</b><button class="g5card" data-v="1">+</button></div>${grid}
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ ازرع</button></div>`);
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); d.k = Math.max(2, Math.min(isRows ? 12 : 24, d.k + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (isRows) {
        if (n % k === 0 && k > r.lo && k < r.hi) { d.k = 2; return advance(this, W, d, 3, 'factors7', L); }
        sfx('cough'); this.open(W, d, n % k ? `بقيت ${ar(n % k)} شتلة زائدة: ${ar(k)} ليس عاملاً للعدد ${ar(n)}. جرّب عدداً يقسم ${ar(n)} دون باقٍ.` : `الصفوف متساوية، لكن عددها يجب أن يكون أكثر من ${ar(r.lo)} وأقل من ${ar(r.hi)}.`, 'bad');
      } else {
        if (r.a % k === 0 && r.b % k === 0 && k === gcd(r.a, r.b)) { d.k = 2; return advance(this, W, d, 3, 'factors7', L); }
        sfx('cough'); this.open(W, d, r.a % k || r.b % k ? `${ar(k)} لا يقسم ${r.a % k ? ar(r.a) : ar(r.b)} دون باقٍ. ابحث عن عامل مشترك للعددين.` : `${ar(k)} عامل مشترك، لكن يمكن أحواض أكثر! ابحث عن العامل المشترك الأكبر.`, 'bad');
      }
    });
  }
}, at(ST7V.beds, 'beds', '🌷 أحواض الزهور', prop('🌷', '🌷 أحواض الزهور', '#7B3F98', -1)));

/* ═══ ١-٤ الأعداد الأولية — «غربال البذور» (غربال إراتوستين على ٢–٥٠، ثم شجرة العوامل) ═══ */
const MAXS = 50, mult = ps => { const s = new Set(); for (const p of ps) for (let v = p * 2; v <= MAXS; v += p) s.add(v); return s; };
export const primes7 = Object.assign({
  id: 'primes7', giver: 'rashed',
  intro: n => [{ who: 'rashed', text: `يا ${n}! في الورشة غربال قديم: يُسقط الأعداد المؤلفة ويُبقي الأولية.` },
    { who: 'rashed', text: 'هذه طريقة إراتوستين: اشطب مضاعفات كل عدد أولي، فيبقى الأولي وحده.' }],
  begin(d) {
    const n = [60, 72, 84, 90, 126, 150, 132, 140][R(0, 7)];
    d.rounds = [{ t: 'sieve', pre: [2], strike: [3] }, { t: 'sieve', pre: [2, 3], strike: [5, 7] }, { t: 'tree', n }];
    d.r = 0; d.x = []; d.cur = 0; d.fs = [];
  },
  goal: d => `🌾 غربل البذور مع راشد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'rashed', text: 'الغربال أبقى الأعداد الأولية وحدها، والشجرة حلّلت العدد إلى عوامله الأولية!' }];
    if (r.t === 'tree') {
      if (!d.cur) d.cur = r.n;
      sheetOpen(`<h3>🌳 شجرة العوامل</h3>${msgBox((msg ? msg + ' ' : '') + `حلّل العدد <b>${ar(r.n)}</b> إلى عوامل أولية: اختر عدداً أولياً يقسم العدد الحالي حتى تصل إلى ١.`, kind)}
        <div class="g7tree">${ar(r.n)}${d.fs.length ? ` = ${d.fs.map(ar).join(' × ')}${d.cur > 1 ? ` × <b>${ar(d.cur)}</b>` : ''}` : ''}</div>
        <div class="g5cards">${[2, 3, 5, 7, 11].map(p => `<button class="g5card" data-p="${p}">÷ ${ar(p)}</button>`).join('')}</div>
        <button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-p]').forEach(b => b.onclick = async e => {
        e.stopPropagation(); const p = +b.dataset.p;
        if (d.cur % p) { sfx('cough'); return this.open(W, d, `${ar(d.cur)} لا يقبل القسمة على ${ar(p)}. جرّب عدداً أولياً آخر (اختبارات القسمة تساعدك).`, 'bad'); }
        sfx('click'); d.fs.push(p); d.cur /= p; changed();
        if (d.cur === 1) { d.cur = 0; d.fs = []; return advance(this, W, d, 3, 'primes7', L); }
        this.open(W, d, msg, kind);
      });
      return out();
    }
    const pre = mult(r.pre), want = mult(r.strike);
    const cell = v => { const off = pre.has(v) || d.x.includes(v); return `<button class="g5card g7cell${off ? ' off' : ''}${pre.has(v) ? ' pre' : ''}" data-n="${v}"${pre.has(v) ? ' disabled' : ''}>${ar(v)}</button>`; };
    sheetOpen(`<h3>🌾 غربال إراتوستين</h3>${msgBox((msg ? msg + ' ' : '') + `${r.pre.length > 1 ? 'شُطبت مضاعفات ٢ و٣.' : 'شُطبت مضاعفات ٢.'} اشطب الآن كل مضاعفات <b>${r.strike.map(ar).join(' و')}</b> (ما عدا ${r.strike.length > 1 ? 'العددين نفسيهما' : 'العدد نفسه'}).`, kind)}
      <div class="g5board g7sieve">${Array.from({ length: MAXS - 1 }, (_, i) => cell(i + 2)).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ غربل</button></div>`);
    panel().querySelectorAll('[data-n]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = +b.dataset.n, j = d.x.indexOf(v); if (j >= 0) d.x.splice(j, 1); else d.x.push(v); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const need = [...want].filter(v => !pre.has(v)), miss = need.filter(v => !d.x.includes(v)), extra = d.x.filter(v => !want.has(v));
      if (!miss.length && !extra.length) { d.x = []; return advance(this, W, d, 3, 'primes7', L); }
      sfx('cough'); this.open(W, d, extra.length ? `شطبتَ ${ar(extra[0])}، وهو ليس من مضاعفات ${r.strike.map(ar).join(' أو ')}. ${isPrime(extra[0]) ? 'إنه عدد أولي!' : ''}` : `بقي ${miss.length === 1 ? 'عدد لم يُشطب' : `${ar(miss.length)} أعداد لم تُشطب`} من مضاعفات ${r.strike.map(ar).join(' و')}. عُدّ بخطوات ثابتة.`, 'bad');
    });
  }
}, at(ST7V.sieve, 'sieve', '🌾 غربال البذور', prop('🌾', '🌾 غربال البذور', '#B5651D', -1)));

/* ═══ ١-٥ الأسس — «خلايا النحل» (إطار مربع، صانع القوى، قرص مكعب) ═══ */
const POWS = [32, 64, 81, 125, 243, 343, 128, 625, 1000, 216];
export const powers7 = Object.assign({
  id: 'powers7', giver: 'salem',
  intro: n => [{ who: 'salem', text: `يا ${n}! عندي خلايا نحل جديدة، وإطاراتها مربعات ومكعبات.` },
    { who: 'salem', text: 'الأس يخبرنا كم مرة نضرب العدد في نفسه: ٥ أس ٢ يعني ٥ × ٥.' }],
  begin(d) {
    d.rounds = [{ t: 'square', n: R(11, 20) }, { t: 'power', v: POWS[R(0, POWS.length - 1)] }, { t: 'cube', n: R(4, 9) }];
    d.r = 0; d.side = 10; d.b = 2; d.e = 2;
  },
  goal: d => `🐝 جهّز خلايا العم سالم ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'salem', text: 'الخلايا جاهزة! المربعات والمكعبات والأسس صارت لغتك.' }];
    if (r.t === 'cube') return kp(this, W, d, { title: '🐝 قرص الشمع المكعب', text: `قرص شمع مكعب، على كل حرف منه <b>${ar(r.n)}</b> خلايا. كم خلية فيه؟ (${pw(r.n, 3)})`, ans: r.n ** 3, n: 3, id: 'powers7', msg, kind, opts: INT, lines: L,
      hint: `ليس هذا العدد: ${pw(r.n, 3)} = ${ar(r.n)} × ${ar(r.n)} × ${ar(r.n)}. اضرب خطوة خطوة.` });
    if (r.t === 'square') {
      sheetOpen(`<h3>🐝 إطار العسل المربع</h3>${msgBox((msg ? msg + ' ' : '') + `اصنع إطاراً مربعاً فيه <b>${ar(r.n * r.n)}</b> خلية بالضبط. كم خلية على كل ضلع؟`, kind)}
        <div class="g7ctr"><button class="g5card" data-v="-1">−</button><b>${ar(d.side)} على كل ضلع</b><button class="g5card" data-v="1">+</button></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ ركّب الإطار</button></div>`);
      panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); d.side = Math.max(2, Math.min(25, d.side + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
      out();
      return btn('benchGo', async () => {
        if (d.side === r.n) return advance(this, W, d, 3, 'powers7', L);
        sfx('cough'); this.open(W, d, `إطار ضلعه ${ar(d.side)} فيه ${pw(d.side, 2)} = ${ar(d.side * d.side)} خلية، وهذا ${d.side < r.n ? 'أقل' : 'أكثر'} من المطلوب. ابحث عن الجذر التربيعي.`, 'bad');
      });
    }
    sheetOpen(`<h3>🐝 صانع القوى</h3>${msgBox((msg ? msg + ' ' : '') + `في المنحل <b>${ar(r.v)}</b> نحلة. اكتب العدد قوةً: اختر الأساس والأس.`, kind)}
      <div class="g7pow"><div class="g7ctr"><button class="g5card" data-k="b" data-v="-1">−</button><b>الأساس ${ar(d.b)}</b><button class="g5card" data-k="b" data-v="1">+</button></div>
      <div class="g7big">${pw(d.b, d.e)}</div>
      <div class="g7ctr"><button class="g5card" data-k="e" data-v="-1">−</button><b>الأس ${ar(d.e)}</b><button class="g5card" data-k="e" data-v="1">+</button></div></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ تحقّق</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k; d[k] = Math.max(2, Math.min(k === 'b' ? 10 : 7, d[k] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const v = d.b ** d.e;
      if (v === r.v) { d.b = 2; d.e = 2; return advance(this, W, d, 3, 'powers7', L); }
      sfx('cough'); this.open(W, d, `${pw(d.b, d.e)} = ${ar(v)}، وهذا ${v < r.v ? 'أقل' : 'أكثر'} من ${ar(r.v)}. حلّل ${ar(r.v)} إلى عوامل متساوية.`, 'bad');
    });
  }
}, at(ST7V.hive, 'hive', '🐝 خلايا النحل', prop('🐝', '🐝 خلايا النحل', '#C77D0A', -1)));

/* ═══ ١-٦ القوى (الأسس والجذور) — «صناديق التمر المكعبة» (الضلع من الحجم، الجذر السالب، تقدير الجذر) ═══ */
export const powersRoots7 = Object.assign({
  id: 'powersRoots7', giver: 'saeed',
  intro: n => [{ who: 'saeed', text: `أهلاً يا ${n}! أرسل التمر في صناديق مكعبة، وأحتاج طول ضلع كل صندوق.` },
    { who: 'saeed', text: 'الجذر التكعيبي يعطي الضلع من الحجم، والجذر التربيعي يعطي الضلع من المساحة.' }],
  begin(d) {
    const n = R(5, 12), x = R(n * n + 1, (n + 1) * (n + 1) - 1);
    d.rounds = [{ t: 'cube', n: R(4, 10) }, { t: 'neg', m: R(6, 15) }, { t: 'est', x, n }];
    d.r = 0; d.side = 3;
  },
  goal: d => `📦 جهّز صناديق التمر مع سعيد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'saeed', text: 'الصناديق كلها بمقاساتها الصحيحة! الجذور التربيعية والتكعيبية في يدك.' }];
    if (r.t === 'neg') return kp(this, W, d, { title: '📦 الجذران', text: `للعدد <b>${ar(r.m * r.m)}</b> جذران تربيعيان. اكتب الجذر التربيعي <b>السالب</b>.`, ans: -r.m, n: 3, id: 'powersRoots7', msg, kind, opts: NEG, lines: L,
      hint: 'ليس هذا الجذر: ابحث عن العدد الذي مربعه يساوي العدد، ثم اكتبه بإشارة سالبة (زر −).' });
    if (r.t === 'est') {
      const opts = shuffle([r.n - 1, r.n, r.n + 1, Math.floor(r.x / 2)].filter((v, i, A) => A.indexOf(v) === i && v > 0));
      sheetOpen(`<h3>📦 بطاقة المقاس</h3>${msgBox((msg ? msg + ' ' : '') + `قاعدة صندوق مربعة مساحتها <b>${ar(r.x)}</b> سم². طول ضلعها <span dir="ltr">√${ar(r.x)}</span> سم. بين أي عددين صحيحين متتاليين يقع؟`, kind)}
        <div class="g5cards">${opts.map(v => `<button class="g5card" data-a="${v}">${ar(v)} و${ar(v + 1)}</button>`).join('')}</div>
        <button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-a]').forEach(b => b.onclick = async e => {
        e.stopPropagation(); const v = +b.dataset.a;
        if (v === r.n) return advance(this, W, d, 3, 'powersRoots7', L);
        sfx('cough'); this.open(W, d, `${pw(v, 2)} = ${ar(v * v)} و${pw(v + 1, 2)} = ${ar((v + 1) * (v + 1))}: هل يقع ${ar(r.x)} بينهما؟`, 'bad');
      });
      return out();
    }
    const v = d.side ** 3;
    sheetOpen(`<h3>📦 صندوق مكعب</h3>${msgBox((msg ? msg + ' ' : '') + `الصندوق المكعب يتسع <b>${ar(r.n ** 3)}</b> علبة صغيرة مكعبة. اضبط طول ضلعه (بالعلب).`, kind)}
      <div class="g7ctr"><button class="g5card" data-v="-1">−</button><b>الضلع ${ar(d.side)}</b><button class="g5card" data-v="1">+</button></div>
      <div class="g7big">${pw(d.side, 3)} = ${ar(v)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ اصنع الصندوق</button></div>`);
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); d.side = Math.max(2, Math.min(15, d.side + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.side === r.n) { d.side = 3; return advance(this, W, d, 3, 'powersRoots7', L); }
      sfx('cough'); this.open(W, d, `الصندوق يتسع ${ar(v)} علبة، والمطلوب ${ar(r.n ** 3)}: ${v < r.n ** 3 ? 'كبّر' : 'صغّر'} الضلع. الضلع هو الجذر التكعيبي للحجم.`, 'bad');
    });
  }
}, at(ST7V.crates, 'crates', '📦 صناديق التمر', prop('📦', '📦 صناديق التمر', '#8A5A30', 1)));

/* ═══ ١-٧ ترتيب العمليات الحسابية — «لغز اللوح» (ضع القوسين ليصيب الناتج الهدف) ═══ */
const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b };
function evalFlat(ns, os) {   // الضرب أولاً ثم الجمع والطرح من اليمين إلى اليسار (ترتيب القراءة)
  const n = ns.slice(), o = os.slice();
  for (let i = 0; i < o.length;) if (o[i] === '×') { n.splice(i, 2, n[i] * n[i + 1]); o.splice(i, 1); } else i++;
  return o.reduce((a, op, i) => OPS[op](a, n[i + 1]), n[0]);
}
const evalBr = (ns, os, i, j) => i < 0 ? evalFlat(ns, os) : evalFlat([...ns.slice(0, i), evalFlat(ns.slice(i, j + 1), os.slice(i, j)), ...ns.slice(j + 1)], [...os.slice(0, i), ...os.slice(j)]);
function puzzle() {
  for (let t = 0; t < 200; t++) {
    const ns = [R(2, 9), R(2, 9), R(2, 9), R(2, 9)], os = [0, 1, 2].map(() => ['+', '−', '×'][R(0, 2)]);
    if (!os.includes('×') || !os.some(o => o !== '×')) continue;
    const flat = evalFlat(ns, os), opts = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (!(i === 0 && j === 3)) opts.push([i, j, evalBr(ns, os, i, j)]);
    const good = opts.filter(([, , v]) => v !== flat && v > 0 && opts.filter(o => o[2] === v).length === 1);
    if (good.length) { const [i, j, v] = good[R(0, good.length - 1)]; return { ns, os, tgt: v, flat, br: [i, j] }; }
  }
  return { ns: [2, 3, 4, 5], os: ['+', '×', '−'], tgt: 15, flat: 9, br: [0, 1] };
}
export const orderOps7 = Object.assign({
  id: 'orderOps7', giver: 'umkhalid',
  intro: n => [{ who: 'umkhalid', text: `يا ${n}! على لوح المجلس لغز قديم: الأعداد والعمليات مكتوبة، والأقواس ضاعت.` },
    { who: 'umkhalid', text: 'تذكّر الترتيب: الأقواس أولاً، ثم الضرب، ثم الجمع والطرح.' }],
  begin(d) { d.rounds = [puzzle(), puzzle(), puzzle()]; d.r = 0; d.br = []; },
  goal: d => `🧮 حلّ لغز اللوح ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'umkhalid', text: 'اللوح كله محلول! ترتيب العمليات والأقواس لا يخفى عليك.' }];
    const [i, j] = d.br.length === 2 ? d.br : [d.br[0] ?? -1, -1];
    const parts = r.ns.map((v, k) => `${k === i ? '<b class="g7br">(</b>' : ''}<button class="g5card${d.br.includes(k) ? ' on' : ''}" data-k="${k}">${ar(v)}</button>${k === j ? '<b class="g7br">)</b>' : ''}`);
    const expr = parts.map((p, k) => k < r.os.length ? `${p}<b class="g7op">${r.os[k]}</b>` : p).join('');
    sheetOpen(`<h3>🧮 لغز اللوح</h3>${msgBox((msg ? msg + ' ' : '') + `اضغط العدد الذي يبدأ عنده القوس ثم العدد الذي ينتهي عنده، ليصبح الناتج <b>${ar(r.tgt)}</b>.`, kind)}
      <div class="g5cards g7expr">${expr}<b class="g7op">=</b><b class="g7res">${ar(r.tgt)}</b></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act ghost" id="g7clr">↺ امسح القوسين</button><button class="act go" id="benchGo"${d.br.length === 2 ? '' : ' disabled'}>✓ تحقّق</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; if (d.br.length >= 2) d.br = []; if (d.br.length === 1 && k === d.br[0]) d.br = []; else { d.br.push(k); d.br.sort((a, b) => a - b); } sfx('click'); this.open(W, d, msg, kind); });
    btn('g7clr', () => { d.br = []; this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const [a, b] = d.br, v = evalBr(r.ns, r.os, a, b);
      if (v === r.tgt) { d.br = []; return advance(this, W, d, 3, 'orderOps7', L); }
      sfx('cough'); d.br = []; this.open(W, d, `بهذين القوسين يصبح الناتج ${ar(v)}، لا ${ar(r.tgt)}. احسب ما داخل القوسين أولاً، ثم الضرب، ثم الجمع والطرح، وجرّب موضعاً آخر.`, 'bad');
    });
  }
}, at(ST7V.board, 'board', '🧮 لغز اللوح', prop('🧮', '🧮 لغز اللوح', '#4A3A8C', 1)));

export const G7U1 = { addSubInt7, mulDivInt7, multiples7, factors7, primes7, powers7, powersRoots7, orderOps7 };
