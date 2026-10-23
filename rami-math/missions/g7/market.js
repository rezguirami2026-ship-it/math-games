// الصف السابع — سوق الجبر (الوحدة ٢ في الكتاب: العبارات الجبرية والمعادلات والصيغ).
// خمس محطات في ساحة السوق: أكياس الحلوى تصير عبارة، وسلال تفرز الحدود المتشابهة، وطلبيات تُفكّ أقواسها،
// وآلة أسعار بصيغة، وميزان بكفّتين تُحل عليه المعادلة. المعامِلات تُضبط بعدّادات ± والعبارة تظهر حيّة.
import { ar } from '../../core/util.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, panel, sheetOpen, msgBox, btn } from '../bench.js';
import { step, at, advance, kp, out } from '../g5/common.js';
import { prop } from './village.js';
import { E } from '../../content/g7/challenges2.js';

/* المحطات: أماكن محطات الخامس في السوق نفسها (فُحصت بالتصادم واللقطات) */
export const ST7M = {
  bags: { x: 1966, y: 1000 },     // الجدة شيخة: أكياس السوق
  sort: { x: 1706, y: 426 },      // مبارك: فرز البضائع
  orders: { x: 2000, y: 570 },    // المدرب خالد: طلبيات الجملة
  prices: { x: 2000, y: 895 },    // عبدالله: آلة الأسعار
  scale: { x: 1670, y: 1460 }     // جمعة: الكفّتان
};
const INT = { dot: false };
/* عدّاد معامل: − القيمة + */
const ctr = (k, label, v) => `<div class="g7ctr"><button class="g5card sm" data-c="${k}" data-v="-10">−١٠</button><button class="g5card" data-c="${k}" data-v="-1">−</button><b>${label}: ${ar(v)}</b><button class="g5card" data-c="${k}" data-v="1">+</button><button class="g5card sm" data-c="${k}" data-v="10">+١٠</button></div>`;
function counters(mod, W, d, msg, kind) {
  panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.c; d.cf[k] = Math.max(-99, Math.min(99, (d.cf[k] || 0) + +b.dataset.v)); sfx('click'); mod.open(W, d, msg, kind); });
}
const live = s => `<div class="g7big g7alg">${s}</div>`;

/* ═══ ٢-١ كتابة العبارات الجبرية — «أكياس السوق» (أكياس فيها ن حبة، وحبات منفردة) ═══ */
export const algExpr7 = Object.assign({
  id: 'algExpr7', giver: 'shaikha',
  intro: n => [{ who: 'shaikha', text: `أهلاً يا ${n}! أبيع الحلوى في أكياس، لكني نسيت كم حبة في الكيس الواحد.` },
    { who: 'shaikha', text: 'نسمّي عدد الحبات في الكيس «ن»، ونكتب ما على البسطة عبارة جبرية.' }],
  begin(d) {
    const k1 = R(2, 5), m1 = R(2, 9), k2 = R(2, 6), m2 = R(2, 9), k3 = R(3, 6), m3 = R(2, 6);
    d.rounds = [{ t: 'pic', a: k1, b: m1 }, { t: 'say', a: k2, b: -m2 }, { t: 'eat', a: k3, b: -m3 }];
    d.r = 0; d.cf = { a: 0, b: 0 };
  },
  goal: d => `🍬 اكتب عبارات أكياس الحلوى ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'shaikha', text: 'كل بسطة صارت عبارة جبرية صحيحة! الحرف ن يحفظ مكان العدد الذي لا نعرفه.' }];
    const text = r.t === 'pic' ? `على البسطة <b>${ar(r.a)}</b> أكياس (في كل كيس ن حبة) و<b>${ar(r.b)}</b> حبات منفردة. اكتب عدد الحبات كلها.`
      : r.t === 'say' ? `اكتب: «<b>${r.a === 2 ? 'ضعف' : ar(r.a) + ' أمثال'}</b> عدد حبات الكيس، ناقص <b>${ar(-r.b)}</b>».`
      : `اشترى زبون <b>${ar(r.a)}</b> أكياس، ثم أكل منها <b>${ar(-r.b)}</b> حبات. كم حبة بقيت معه؟`;
    const pic = r.t === 'say' ? '' : `<div class="g7pic">${'🛍️'.repeat(r.a)}${r.t === 'pic' ? ' + ' + '🍬'.repeat(r.b) : ` − ${'🍬'.repeat(-r.b)}`}</div>`;
    sheetOpen(`<h3>🍬 أكياس السوق</h3>${msgBox((msg ? msg + ' ' : '') + text, kind)}${pic}
      ${ctr('a', 'معامل ن', d.cf.a)}${ctr('b', 'العدد', d.cf.b)}${live(E([[d.cf.a, 'ن'], [d.cf.b]]))}
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ اكتب على اللوحة</button></div>`);
    counters(this, W, d, msg, kind); out();
    btn('benchGo', async () => {
      if (d.cf.a === r.a && d.cf.b === r.b) { d.cf = { a: 0, b: 0 }; return advance(this, W, d, 3, 'algExpr7', L); }
      sfx('cough'); this.open(W, d, d.cf.a !== r.a ? 'معامل ن لا يطابق: كم كيساً (أو كم مرة) يتكرر العدد ن؟' : d.cf.b === -r.b ? 'الإشارة معكوسة: هل الحبات تُضاف أم تُطرح؟' : 'العدد الحر لا يطابق: كم حبة خارج الأكياس، وهل تُضاف أم تُطرح؟', 'bad');
    });
  }
}, at(ST7M.bags, 'bags', '🍬 أكياس السوق', prop('🛍️', '🍬 أكياس السوق', '#C2304A', -1)));

/* ═══ ٢-٢ تجميع الحدود المتشابهة — «فرز البضائع» (سلة س وسلة ص وسلة الأعداد) ═══ */
function likeRound(kind) {
  for (let t = 0; t < 50; t++) {
    const n = kind === 2 ? 5 : 4, vs = ['س', 'ص', ''], terms = [];
    for (let i = 0; i < n; i++) { const v = kind === 0 ? vs[i % 2] : vs[i % 3], c = (kind === 0 || i === 0 ? 1 : R(0, 2) ? 1 : -1) * R(1, 7); terms.push([c, v]); }
    const sum = v => terms.filter(x => x[1] === v).reduce((a, x) => a + x[0], 0), want = { x: sum('س'), y: sum('ص'), k: sum('') };
    if (terms[0][0] > 0 && want.x > 0 && want.y !== 0) return { terms: shuffle(terms.slice(1)).length ? [terms[0], ...shuffle(terms.slice(1))] : terms, want };
  }
  return { terms: [[3, 'س'], [2, 'ص'], [4, 'س'], [1, 'ص']], want: { x: 7, y: 3, k: 0 } };
}
export const likeTerms7 = Object.assign({
  id: 'likeTerms7', giver: 'mubarak',
  intro: n => [{ who: 'mubarak', text: `يا ${n}! البضائع اختلطت: صناديق س وصناديق ص وقطع مفردة.` },
    { who: 'mubarak', text: 'نجمع كل نوع في سلته: الحدود المتشابهة فقط تُجمع معاً.' }],
  begin(d) { d.rounds = [likeRound(0), likeRound(1), likeRound(2)]; d.r = 0; d.cf = { x: 0, y: 0, k: 0 }; },
  goal: d => `🧺 افرز بضائع مبارك ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'mubarak', text: 'السلال مرتّبة! جمعتَ الحدود المتشابهة وتركتَ المختلفة كما هي.' }];
    sheetOpen(`<h3>🧺 فرز البضائع</h3>${msgBox((msg ? msg + ' ' : '') + `بسّط العبارة: اضبط ما في كل سلة.`, kind)}${live(E(r.terms))}
      ${ctr('x', 'سلة س', d.cf.x)}${ctr('y', 'سلة ص', d.cf.y)}${ctr('k', 'سلة الأعداد', d.cf.k)}
      <div class="g7res2">= ${E([[d.cf.x, 'س'], [d.cf.y, 'ص'], [d.cf.k]])}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ أغلق السلال</button></div>`);
    counters(this, W, d, msg, kind); out();
    btn('benchGo', async () => {
      const w = r.want, bad = d.cf.x !== w.x ? 'س' : d.cf.y !== w.y ? 'ص' : d.cf.k !== w.k ? 'الأعداد' : null;
      if (!bad) { d.cf = { x: 0, y: 0, k: 0 }; return advance(this, W, d, 3, 'likeTerms7', L); }
      sfx('cough'); this.open(W, d, `سلة ${bad} لا تطابق: اجمع ${bad === 'الأعداد' ? 'الأعداد وحدها' : `معاملات حدود ${bad} فقط`} مع إشاراتها (الحد المطروح سالب).`, 'bad');
    });
  }
}, at(ST7M.sort, 'sort', '🧺 فرز البضائع', prop('🧺', '🧺 فرز البضائع', '#8A5A30', 1)));

/* ═══ ٢-٣ فك الأقواس — «طلبيات الجملة» (ك صناديق في كل منها (أس + ب)) ═══ */
export const expandBrackets7 = Object.assign({
  id: 'expandBrackets7', giver: 'khalid',
  intro: n => [{ who: 'khalid', text: `يا ${n}! الفرق تطلب بالجملة: كل صندوق فيه الطلبية نفسها.` },
    { who: 'khalid', text: 'العدد أمام القوس عدد الصناديق، فيُضرب في كل ما داخل القوس.' }],
  begin(d) {
    d.rounds = [{ k: R(3, 6), a: 1, b: R(2, 9) }, { k: R(3, 7), a: 1, b: -R(2, 9) }, { k: R(2, 5), a: R(2, 4), b: R(1, 7) }];
    d.r = 0; d.cf = { x: 0, k: 0 };
  },
  goal: d => `📦 جهّز طلبيات المدرب خالد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'khalid', text: 'الطلبيات كلها صحيحة! فككتَ الأقواس وضربتَ في كل حد.' }], inner = E([[r.a, 'س'], [r.b]]);
    sheetOpen(`<h3>📦 طلبيات الجملة</h3>${msgBox((msg ? msg + ' ' : '') + `<b>${ar(r.k)}</b> صناديق، في كل صندوق <b>(${inner})</b>. اكتب الطلبية كلها دون أقواس.`, kind)}
      <div class="g7pic">${Array(r.k).fill(`<span class="g7box">(${inner})</span>`).join('')}</div>${live(`${ar(r.k)}(${inner})`)}
      ${ctr('x', 'معامل س', d.cf.x)}${ctr('k', 'العدد', d.cf.k)}<div class="g7res2">= ${E([[d.cf.x, 'س'], [d.cf.k]])}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ أرسل الطلبية</button></div>`);
    counters(this, W, d, msg, kind); out();
    btn('benchGo', async () => {
      if (d.cf.x === r.k * r.a && d.cf.k === r.k * r.b) { d.cf = { x: 0, k: 0 }; return advance(this, W, d, 3, 'expandBrackets7', L); }
      sfx('cough'); this.open(W, d, d.cf.x !== r.k * r.a ? `حدود س لا تطابق: في كل صندوق ${r.a === 1 ? 'س واحدة' : ar(r.a) + 'س'}، وعندك ${ar(r.k)} صناديق.` : d.cf.k === r.b ? 'نسيتَ ضرب العدد الذي داخل القوس في عدد الصناديق.' : 'العدد لا يطابق: اضرب العدد الذي داخل القوس (بإشارته) في عدد الصناديق.', 'bad');
    });
  }
}, at(ST7M.orders, 'orders', '📦 طلبيات الجملة', prop('📦', '📦 طلبيات الجملة', '#1E4FBF', -1)));

/* ═══ ٢-٤ استنتاج واستخدام الصيغ — «آلة الأسعار» (اشتقاق الصيغة، التعويض، والعكس) ═══ */
export const formulas7 = Object.assign({
  id: 'formulas7', giver: 'abdullah',
  intro: n => [{ who: 'abdullah', text: `أهلاً يا ${n}! آلة تعبئة البهارات تحسب السعر بصيغة، لكن الصيغة ضاعت.` },
    { who: 'abdullah', text: 'الصيغة قاعدة تربط الكميات بالحروف: ث للثمن، ون لعدد الأكياس.' }],
  begin(d) {
    const a = R(2, 6), b = [1, 2, 3, 4, 5].filter(v => v !== a)[R(0, 3)], n = R(4, 12), m = R(5, 15);   // سعر الكيس غير التغليف، فلا يصح تبديلهما
    d.rounds = [{ t: 'build', a, b }, { t: 'sub', a, b, n }, { t: 'back', a, b, m }];
    d.r = 0; d.cf = { a: 0, b: 0 };
  },
  goal: d => `🌶️ شغّل آلة أسعار عبدالله ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'abdullah', text: 'الآلة تعمل! اشتققتَ الصيغة وعوّضتَ فيها واستخدمتها بالعكس.' }], f = `ث = ${E([[r.a, 'ن'], [r.b]])}`;
    if (r.t === 'sub') return kp(this, W, d, { title: '🌶️ آلة الأسعار', visual: live(f), text: `طلب زبون <b>${ar(r.n)}</b> أكياس. كم ريالاً الثمن ث؟`, ans: r.a * r.n + r.b, n: 3, id: 'formulas7', msg, kind, opts: INT, lines: L,
      hint: `ليس هذا الثمن: ضع ${ar(r.n)} مكان ن، واضرب قبل أن تجمع.` });
    if (r.t === 'back') return kp(this, W, d, { title: '🌶️ آلة الأسعار', visual: live(f), text: `دفع زبون <b>${ar(r.a * r.m + r.b)}</b> ريالاً. كم كيساً (ن) اشترى؟`, ans: r.m, n: 3, id: 'formulas7', msg, kind, opts: INT, lines: L,
      hint: 'ليس هذا العدد: اطرح التغليف من الثمن أولاً، ثم اقسم على سعر الكيس (العمليات العكسية).' });
    sheetOpen(`<h3>🌶️ آلة الأسعار</h3>${msgBox((msg ? msg + ' ' : '') + `سعر الكيس <b>${ar(r.a)}</b> ريالات، وتغليف الطلب كله <b>${ar(r.b)}</b> ${r.b === 1 ? 'ريال' : r.b === 2 ? 'ريالان' : 'ريالات'}. اكتب صيغة الثمن ث لـ ن كيس.`, kind)}
      ${ctr('a', 'معامل ن', d.cf.a)}${ctr('b', 'العدد الثابت', d.cf.b)}${live(`ث = ${E([[d.cf.a, 'ن'], [d.cf.b]])}`)}
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ ثبّت الصيغة</button></div>`);
    counters(this, W, d, msg, kind); out();
    btn('benchGo', async () => {
      if (d.cf.a === r.a && d.cf.b === r.b) { d.cf = { a: 0, b: 0 }; return advance(this, W, d, 3, 'formulas7', L); }
      sfx('cough'); this.open(W, d, d.cf.a === r.b && d.cf.b === r.a ? 'بدّلتَ الدورين: ما الذي يتكرر مع كل كيس، وما الذي يُدفع مرة واحدة؟' : 'الصيغة لا تعطي الثمن الصحيح: جرّب كيساً واحداً ثم كيسين واحسب الثمن بيدك.', 'bad');
    });
  }
}, at(ST7M.prices, 'prices', '🌶️ آلة الأسعار', prop('🌶️', '🌶️ آلة الأسعار', '#B5651D', 1)));

/* ═══ ٢-٥ كتابة المعادلات وحلها — «الكفّتان» (أزل من الكفتين معاً حتى يبقى كيس واحد) ═══ */
const eqRound = (a, x, b) => ({ a, x, b, c: a * x + b });
export const equations7 = Object.assign({
  id: 'equations7', giver: 'juma',
  intro: n => [{ who: 'juma', text: `يا ${n}! على الميزان أكياس قمح لا نعرف وزنها، وأوزان كل منها كيلوغرام.` },
    { who: 'juma', text: 'الكفّتان متعادلتان: ما تزيله من كفة أزله من الأخرى، حتى يبقى كيس واحد.' }],
  begin(d) {
    d.rounds = [{ t: 'write', ...eqRound(R(2, 5), R(3, 9), R(1, 9)) }, eqRound(1, R(4, 12), R(3, 9)), eqRound(R(2, 4), R(3, 9), R(2, 11))];
    d.r = 0; d.bl = null;
  },
  goal: d => `⚖️ وازن كفّتي جمعة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'juma', text: 'عرفتَ وزن الكيس دون أن تفتحه! المعادلة تُحل بالعمليات نفسها على الطرفين.' }];
    if (r.t === 'write') {
      const right = `${E([[r.a, 'س'], [r.b]])} = ${ar(r.c)}`, opts = d.wopts || (d.wopts = shuffle([right, `${E([[r.b, 'س'], [r.a]])} = ${ar(r.c)}`, `${ar(r.a)}(س + ${ar(r.b)}) = ${ar(r.c)}`, `${E([[1, 'س'], [r.a + r.b]])} = ${ar(r.c)}`]));
      sheetOpen(`<h3>⚖️ الكفّتان</h3>${msgBox((msg ? msg + ' ' : '') + `في الكفة اليمنى <b>${ar(r.a)}</b> أكياس وزن كل منها س كغم و<b>${ar(r.b)}</b> كغم، وفي اليسرى <b>${ar(r.c)}</b> كغم، والميزان متعادل. أي معادلة تصف الميزان؟`, kind)}
        <div class="g7pic">${'🛍️'.repeat(r.a)} ${'🔸'.repeat(Math.min(r.b, 9))} ⚖️ ${ar(r.c)} كغم</div>
        <div class="g5cards col">${opts.map((s, i) => `<button class="g5card" data-o="${i}">${s}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-o]').forEach(b => b.onclick = async e => {
        e.stopPropagation();
        if (opts[+b.dataset.o] === right) { d.wopts = null; return advance(this, W, d, 3, 'equations7', L); }
        sfx('cough'); this.open(W, d, 'هذه المعادلة لا تصف الميزان: الأكياس تُضرب في س، والكيلوغرامات المنفردة تُضاف، والطرف الآخر بعد =.', 'bad');
      });
      return out();
    }
    if (!d.bl || d.bl.r !== d.r) d.bl = { r: d.r, a: r.a, b: r.b, c: r.c };
    const s = d.bl, done = s.a === 1 && s.b === 0;
    sheetOpen(`<h3>⚖️ الكفّتان</h3>${msgBox((msg ? msg + ' ' : '') + (done ? `بقي كيس واحد يوازن <b>${ar(s.c)}</b> كغم!` : 'أزل من الكفتين معاً حتى يبقى في اليمنى كيس واحد وحده.'), kind)}
      <div class="g7bal"><div class="pan">${'🛍️'.repeat(s.a)}${s.b ? ` + <b>${ar(s.b)}</b> كغم` : ''}</div><b class="g7op">=</b><div class="pan"><b>${ar(s.c)}</b> كغم</div></div>
      ${live(`${E([[s.a, 'س'], [s.b]])} = ${ar(s.c)}`)}
      <div class="g5cards"><button class="g5card" data-m="1">− ١ كغم من الكفتين</button><button class="g5card" data-m="5">− ٥ كغم من الكفتين</button><button class="g5card" data-m="d">÷ عدد الأكياس</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${done ? '' : ' disabled'}>✓ وزن الكيس ${done ? ar(s.c) : '؟'} كغم</button></div>`);
    panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => {
      e.stopPropagation(); const m = b.dataset.m;
      if (m === 'd') {
        if (s.a === 1) { sfx('cough'); return this.open(W, d, 'في الكفة كيس واحد فقط: لا حاجة إلى القسمة.', 'bad'); }
        if (s.b) { sfx('cough'); return this.open(W, d, `في الكفة اليمنى ${ar(s.b)} كغم مع الأكياس: لو قسمتَ الأكياس وحدها لاختل الميزان. أزل الكيلوغرامات المنفردة أولاً.`, 'bad'); }
        s.c /= s.a; s.a = 1; sfx('pick'); changed(); return this.open(W, d, msg, kind);
      }
      const k = +m;
      if (s.b < k) { sfx('cough'); return this.open(W, d, `في الكفة اليمنى ${ar(s.b)} كغم منفردة فقط: لا يمكن إزالة ${ar(k)} كغم منها.`, 'bad'); }
      s.b -= k; s.c -= k; sfx('drop'); changed(); this.open(W, d, msg, kind);
    });
    out();
    btn('benchGo', async () => { if (s.a === 1 && s.b === 0 && s.c === r.x) { d.bl = null; return advance(this, W, d, 3, 'equations7', L); } });
  }
}, at(ST7M.scale, 'scale', '⚖️ الكفّتان', prop('⚖️', '⚖️ الكفّتان', '#1F7A4D', -1)));

export const G7U2 = { algExpr7, likeTerms7, expandBrackets7, formulas7, equations7 };
