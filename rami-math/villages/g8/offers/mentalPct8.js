// ٨-١ استخدام الطرق الذهنية — «لوحة الأسعار»: التاجر ثويني يعلّق بطاقات العروض. الطالب يكوّن النسبة من قطع سهلة (٥٠٪، ٢٥٪، ١٠٪، ٥٪، ١٪)
// بالجمع والطرح كما في الكتاب (٥٨٪ = ٥٠٪ + ١٠٪ − ٢٪)، ثم يحسب النسبة من المبلغ ذهنياً، ويستعمل حقيقة معروفة (٢٦٪ من ٧٨ = ٢٠٫٢٨) لإيجاد غيرها،
// ونسباً أكبر من ١٠٠٪ وأصغر من ١٪، وجدول النسب من ٥٪. بلا آلة حاسبة. التحدي: ٨ أسئلة من 8Nc1 (الكتاب ص١٣١–١٣٢).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { souqBg, say, glow, tag, pctBar, board, pc, ORANGE, TEAL } from './art.js';

const who = { name: 'التاجر ثويني', face: '🧔🏽', id: 'thuwaini' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const CHIPS = [50, 25, 10, 5, 1];
const TARGETS = [58, 85, 35, 49, 77, 99, 45, 65, 15, 95, 38, 72, 48, 26];
const ITEMS = ['مكتب خشبي', 'شاشة حاسوب', 'دراجة هوائية', 'خيمة رحلات', 'ساعة حائط', 'سجادة صلاة', 'حقيبة سفر', 'ثلاجة صغيرة'];
const greedy = p => { const out = []; let r = p; CHIPS.forEach(c => { while (r >= c) { out.push(c); r -= c; } }); return out; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; souqBg(g, w, h, t);
  board(g, w * .05, h * .08, w * .9, h * .84, ORANGE);
  say(g, '🏷️ ' + (r.title || 'لوحة الأسعار'), w * .5, h * .19, 19, '#9A3412', 900);
  if (r.table) {   // جدول النسب: خانة معروفة وخانة «؟»
    const n = r.table.length, cw = w * .8 / n;
    r.table.forEach(([p, v], k) => { const x = w * .9 - (k + 1) * cw, hl = v === null; g.fillStyle = '#FFEDD5'; g.fillRect(x + 3, h * .3, cw - 6, h * .16); g.fillStyle = hl ? '#FEF9C3' : '#FFFFFF'; g.fillRect(x + 3, h * .47, cw - 6, h * .18);
      g.strokeStyle = '#FDBA74'; g.lineWidth = 2; g.strokeRect(x + 3, h * .3, cw - 6, h * .35);
      say(g, pc(p), x + cw / 2, h * .41, 16, '#9A3412', 900); say(g, v === null ? (S.done ? N(r.ans) : '؟') : v === '' ? '' : N(v), x + cw / 2, h * .59, 17, hl ? ORANGE : '#334155', 900); });
    say(g, 'المبلغ بالريال', w * .5, h * .76, 14, '#78716C');
  } else {
    if (r.price != null) tag(g, w * .78, h * .38, 130, 82, r.item || 'السعر', N(r.price) + ' ريال', { t });
    if (r.fact) { g.fillStyle = '#ECFEFF'; g.beginPath(); g.roundRect(w * .1, h * .3, w * .5, 50, 12); g.fill(); g.strokeStyle = TEAL; g.lineWidth = 2; g.stroke(); say(g, r.fact, w * .35, h * .3 + 32, 17, TEAL, 900); }
    const parts = r.chips ? (S.v || []) : S.done && r.parts ? r.parts : [];
    pctBar(g, w * .12, h * .58, w * .76, parts);
    say(g, S.done ? r.ansTxt : r.askTxt, w * .5, h * .86, 18, S.done ? '#15803D' : '#9A3412', 900);
  }
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const p = pick(TARGETS), it = pick(ITEMS), price = R(4, 90) * 100;
    return { q: `على بطاقة ${it} عرض: ادفع ${pc(p)} من السعر فقط. كوّن ${pc(p)} من القطع السهلة.`, input: { type: 'chips', chips: CHIPS, neg: true, max: 8 }, sol: greedy(p),
      ok: v => v.reduce((a, b) => a + b, 0) === p,
      hint: 'ما أكبر قطعة لا تتجاوز النسبة المطلوبة؟ وكم يبقى بعدها؟',
      bad: v => { const s = v.reduce((a, b) => a + b, 0); return s > p ? `المجموع ${pc(s)}: أكبر من المطلوب.` : `المجموع ${pc(s)}: أقل من المطلوب.`; },
      good: `كوّنت ${pc(p)} من قطع سهلة الحساب.`, data: { chips: true, item: it, price, askTxt: `المطلوب: ${pc(p)}`, ansTxt: `${pc(p)} ✓`, title: 'عروض اليوم' } }; }
  if (i === 1) { const p = pick(TARGETS), it = pick(ITEMS), price = R(3, 90) * 100, ans = p * price / 100;
    return { q: `سعر ${it} ${N(price)} ريال، ودفع زبون ${pc(p)} منه مقدّماً. كم ريالاً دفع؟`, input: { type: 'num' }, sol: ans, ok: v => v === ans,
      hint: 'ما ٥٠٪ من السعر؟ وما ١٠٪ منه؟ وما ١٪؟ كيف تكوّن النسبة المطلوبة منها؟',
      bad: v => v === price - ans ? 'هذا ما بقي عليه، لا ما دفعه.' : v === p * price / 10 ? 'راجع موضع الفاصلة: ١٪ هو جزء من مئة.' : '',
      good: `${pc(p)} من ${N(price)} = ${N(ans)} ريال`, data: { item: it, price, parts: greedy(p), askTxt: `${pc(p)} من ${N(price)} = ؟`, ansTxt: `${pc(p)} من ${N(price)} = ${N(ans)}`, title: 'الدفعة المقدّمة' } }; }
  if (i === 2) { let a, B; do { a = R(6, 24) * 2; B = R(15, 150) * 2; } while ((a * B) % 100 === 0);
    const F = a * B / 100, K = pick([['نصف', a / 2, B, .5], ['ضعف', a * 2, B, 2], ['', a * 2.5, B, 2.5], ['', a * 4, B, 4], ['', a, B / 2, .5], ['', a, B * 2, 2]].filter(k => k[1] <= 150 && k[2] % 1 === 0));
    const ans = Math.round(F * K[3] * 1000) / 1000;
    return { q: `يعرف ثويني أن ${pc(a)} من ${N(B)} = ${N(F)}. استخدم هذه الحقيقة لإيجاد ${pc(K[1])} من ${N(K[2])}.`, input: { type: 'num', dot: true }, sol: ans, ok: v => eq(v, ans),
      hint: K[2] === B ? `كم مرة تحتوي ${pc(K[1])} على ${pc(a)}؟` : K[1] === a ? `كيف تغيّر العدد ${N(B)}؟ وماذا يحدث للنتيجة؟` : 'ما الذي تغيّر: النسبة أم العدد أم كلاهما؟',
      bad: v => eq(v, F) ? 'هذه الحقيقة نفسها: ما الذي تغيّر؟' : '', good: `${pc(K[1])} من ${N(K[2])} = ${N(ans)}`, data: { fact: `${pc(a)} من ${N(B)} = ${N(F)}`, askTxt: `${pc(K[1])} من ${N(K[2])} = ؟`, ansTxt: `${pc(K[1])} من ${N(K[2])} = ${N(ans)}`, title: 'حقيقة معروفة' } }; }
  if (i === 3) { const p = pick([110, 120, 125, 150, 175, 200, 250]), step = { 110: 10, 120: 5, 125: 4, 150: 2, 175: 4, 200: 1, 250: 2 }[p]; let n0; do n0 = R(12, 400); while (n0 % step);
    const ans = p * n0 / 100;
    return { q: `يبيع ثويني في العادة ${N(n0)} قطعة في الأسبوع، وفي أسبوع العيد باع ${pc(p)} من هذا العدد. كم قطعة باع في أسبوع العيد؟`, input: { type: 'num' }, sol: ans, ok: v => v === ans,
      hint: `${pc(100)} هي العدد كله. فماذا تضيف إليها لتصل إلى ${pc(p)}؟`, bad: v => v === ans - n0 ? 'هذه الزيادة وحدها: أين العدد المعتاد؟' : v < n0 ? `${pc(p)} أكبر من الكل، فالجواب أكبر من ${N(n0)}.` : '',
      good: `${pc(p)} من ${N(n0)} = ${N(ans)}`, data: { item: 'المعتاد', price: null, parts: [100, p - 100].filter(x => x > 0 && x <= 100), askTxt: `${pc(p)} من ${N(n0)} = ؟`, ansTxt: `${pc(p)} من ${N(n0)} = ${N(ans)}`, title: 'أسبوع العيد' } }; }
  if (i === 4) { const [p, step] = pick([[.5, 200], [12.5, 8], [2.5, 40], [7.5, 40], [1.5, 200]]); let n0; do n0 = R(2, 40) * step; while (n0 > 9000);
    const ans = Math.round(p * n0 / 100 * 1000) / 1000;
    return { q: `يتبرع السوق بـ ${pc(p)} من أرباح هذا الشهر، والأرباح ${N(n0)} ريال. كم ريالاً يتبرع؟`, input: { type: 'num', dot: true }, sol: ans, ok: v => eq(v, ans),
      hint: p === 12.5 ? 'ما ٢٥٪ من المبلغ؟ و١٢٫٥٪ كم منها؟' : p < 1 ? 'ما ١٪ من المبلغ؟ والنسبة المطلوبة كم منه؟' : 'ما ١٠٪ من المبلغ؟ وما ١٪ منه؟ وكيف تكوّن النسبة منهما؟',
      bad: v => eq(v, ans * 10) || eq(v, ans / 10) ? 'راجع موضع الفاصلة.' : '', good: `${pc(p)} من ${N(n0)} = ${N(ans)}`, data: { price: n0, item: 'الأرباح', askTxt: `${pc(p)} من ${N(n0)} = ؟`, ansTxt: `${pc(p)} من ${N(n0)} = ${N(ans)}`, title: 'صندوق الخير' } }; }
  const A = R(6, 45) * 2, cols = [5, 20, 40, 60, 80, 120], k = R(1, 5), ans = A * cols[k] / 5;
  return { q: `في جدول ثويني ${pc(5)} من المبلغ = ${N(A)} ريال. كم ريالاً ${pc(cols[k])} من المبلغ نفسه؟`, input: { type: 'num' }, sol: ans, ok: v => v === ans,
    hint: `كم مرة تحتوي ${pc(cols[k])} على ${pc(5)}؟`, bad: v => v === A * cols[k] ? `هل ${pc(cols[k])} تساوي ${N(cols[k])} مرة من ${pc(5)}؟` : '',
    good: `${pc(cols[k])} = ${N(cols[k] / 5)} × ${pc(5)} = ${N(ans)}`, data: { table: cols.map((p, j) => [p, j === 0 ? A : j === k ? null : '']), ans, title: 'جدول النسب' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const n0 = fresh(() => R(12, 98) * 10); items.push(choice(`${pc(10)} من ${N(n0)} يساوي:`, N(n0 / 10), [N(n0 / 100), N(n0), N(n0 / 10 + 10)], 'اقسم على ١٠.', '8Nc1')); }
  { const n0 = fresh(() => R(3, 90) * 100); items.push(num(`احسب ${pc(1)} من ${N(n0)} ذهنياً.`, n0 / 100, 'اقسم على ١٠٠.', '8Nc1')); }
  { const p = fresh(() => pick([85, 58, 45, 95])), right = { 85: '٥٠٪ + ٢٥٪ + ١٠٪', 58: '٥٠٪ + ١٠٪ − ٢٪', 45: '٥٠٪ − ٥٪', 95: '١٠٠٪ − ٥٪' }[p];
    const wr = ['٥٠٪ + ٢٥٪ + ٥٪', '٥٠٪ + ١٠٪ + ٢٪', '٥٠٪ − ١٠٪', '١٠٠٪ − ١٠٪', '٥٠٪ + ٥٪', '٢٥٪ + ٢٥٪ + ١٠٪'].filter(x => x !== right).sort(() => Math.random() - .5).slice(0, 3);
    items.push(choice(`أي الطرق تعطي ${pc(p)}؟`, right, wr, 'اجمع القطع واطرح ما يُطرح.', '8Nc1')); }
  { const [a, b] = fresh(() => pick([[30, 65], [20, 45], [40, 15], [25, 36], [60, 35]])); items.push(tf(`${pc(a)} من ${N(b)} يساوي ${pc(b)} من ${N(a)}.`, true, 'احسب الطرفين: كلاهما حاصل ضرب العددين مقسوماً على ١٠٠.', '8Nc1', `كلاهما ${N(a * b / 100)}`)); }
  { const n0 = fresh(() => R(6, 60) * 2); items.push(num(`احسب ${pc(150)} من ${N(n0)}.`, n0 * 1.5, '١٥٠٪ = ١٠٠٪ + ٥٠٪.', '8Nc1')); }
  items.push(choice(`${pc(12.5)} من مبلغ تساوي:`, 'ثُمن المبلغ', ['ربع المبلغ', 'نصف المبلغ', 'عُشر المبلغ'], 'كم مرة تدخل ١٢٫٥ في ١٠٠؟', '8Nc1'));
  { const [a, B] = fresh(() => pick([[26, 78], [19, 256], [27, 430], [24, 150]])), F = a * B / 100; items.push(num(`إذا كان ${pc(a)} من ${N(B)} = ${N(F)}، فما ${pc(a / 2)} من ${N(B)}؟`, F / 2, 'النسبة نصف ما كانت.', '8Nc1')); }
  items.push(tf('لا يمكن أن تزيد النسبة المئوية من كمية على ١٠٠٪.', false, 'هل يمكن أن يصبح السعر ضعف ما كان؟', '8Nc1', 'مثلاً ١٥٠٪ من ٦٢ = ٩٣.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'لوحة الأسعار', icon: '🏷️', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في سوق العروض! أنا ثويني، أعلّق بطاقات العروض كل صباح.', 'لا أحتاج آلة حاسبة: بعض النسب سهلة جداً، ومنها أكوّن الصعبة. جرّب معي.'],
  outro: ['ممتاز! صارت النسب الصعبة سهلة حين تقسمها إلى قطع.', 'والآن تحدٍّ سريع في الطرق الذهنية.'],
  challenge: { title: 'تحدي الطرق الذهنية', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
