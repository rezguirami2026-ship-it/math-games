// ٧-٣ كتابة قائمة بالنتائج المحتملة (فضاء الإمكانات) — «طاولة النردين»: مهند يدير لعبة حجري النرد الأحمر والأزرق.
// جدول النتائج كما في الكتاب يُعلَّم بالنقر (جولات «علّم النتائج»): أزواج النردين، وعملة مع حجر نرد، وقلمان يُسحبان بلا إرجاع (القطر مستحيل «×»)؛
// وجولات احتمال من الجدول: مجموع النردين، ومجموع دوّارين بثلاثة أقسام، وحجر ورقة مقص أو ناتج ضرب النردين. التحدي: ٨ أسئلة من 8Db3 (ص١٢١–١٢٣).
import { mission } from '../../mission.js';
import { N, R, fr, gcd, fEq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { ar } from '../../../core/util.js';
import { fairBg, say, glow, outTable, spinner, coin, face, PINK, BLUE, GREEN } from './art.js';

const who = { name: 'مهند صاحب طاولة النرد', face: '🎲', id: 'muhannad' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const D6 = [1, 2, 3, 4, 5, 6], H6 = D6.map(v => ar(v));
const pair = (a, b) => `(${ar(a)}، ${ar(b)})`;
const same = (a, b) => a.length === b.length && a.every((v, k) => v === b[k]);
/* جولة تعليم: rows × cols، والخلايا التي تحقق cond */
function cells(q, rows, cols, cell, cond, hint, data, extra = {}) {
  const sol = []; rows.forEach((_, i) => cols.forEach((_, j) => { if ((!extra.off || !extra.off(i, j)) && cond(i, j)) sol.push(i * cols.length + j); }));
  return { q, input: { type: 'cells', rows, cols, cell, off: extra.off, corner: extra.corner }, sol, ok: v => Array.isArray(v) && same(v, sol), hint,
    bad: v => { if (!Array.isArray(v)) return ''; const miss = sol.filter(k => !v.includes(k)).length, extra2 = v.filter(k => !sol.includes(k)).length;
      return extra2 && miss ? 'بعض ما علّمته لا يحقق الشرط، وفاتتك نتائج تحققه.' : extra2 ? `علّمت ${ar(extra2)} ${extra2 === 1 ? 'نتيجة لا تحققه' : extra2 === 2 ? 'نتيجتين لا تحققانه' : 'نتائج لا تحققه'}.` : `فاتتك ${miss === 1 ? 'نتيجة واحدة تحققه' : miss === 2 ? 'نتيجتان تحققانه' : ar(miss) + ' نتائج تحققه'}.`; },
    good: `${ar(sol.length)} من ${ar(rows.length * cols.length - (extra.off ? rows.reduce((s, _, i) => s + cols.filter((_, j) => extra.off(i, j)).length, 0) : 0))} نتيجة`, data };
}
const fq = (q, k, n, hint, data) => ({ q, input: { type: 'frac' }, sol: { w: 0, n: k, d: n }, ok: v => fEq(v, k, n), hint,
  bad: v => fEq(v, n - k, n) ? 'هذا احتمال الحالة الأخرى! أعد قراءة المطلوب.' : v && v.d && v.d !== n && v.d % n && n % v.d ? `كم نتيجة في الجدول كله؟` : v && v.n === n && v.d === k ? 'قلبت الكسر: النتائج المطلوبة في البسط.' : '',
  good: `${fr(k, n)}${gcd(k, n) > 1 ? ` = ${fr(k / gcd(k, n), n / gcd(k, n))}` : ''}`, data: { ...data, k, n } });

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; fairBg(g, w, h, t);
  if (r.mode === 'mark') {   // جولات التعليم: الأداة نفسها هي الجدول، والمشهد يعرض أدوات اللعبة
    const s = Math.min(70, h * .3);
    if (r.kind === 'dice') { face(g, w * .36, h * .3, s, 1 + Math.floor(t * 2) % 6, '#FCA5A5'); face(g, w * .56, h * .3, s, 1 + Math.floor(t * 2 + 3) % 6, '#93C5FD'); say(g, 'الأحمر', w * .36 + s / 2, h * .3 + s + 24, 15, '#B91C1C'); say(g, 'الأزرق', w * .56 + s / 2, h * .3 + s + 24, 15, BLUE); }
    if (r.kind === 'coin') { coin(g, w * .38, h * .45, s * .5, Math.floor(t) % 2 ? 'ص' : 'ك'); face(g, w * .54, h * .45 - s / 2, s, 1 + Math.floor(t * 2) % 6); }
    if (r.kind === 'pens') { r.pens.forEach((c, k) => { const x = w * .3 + k * 46; g.fillStyle = c ? '#EF4444' : '#3B82F6'; g.beginPath(); g.roundRect(x, h * .25, 16, h * .42, 6); g.fill(); g.fillStyle = '#334155'; g.beginPath(); g.moveTo(x, h * .67); g.lineTo(x + 16, h * .67); g.lineTo(x + 8, h * .76); g.fill(); say(g, c ? 'أحمر' : `أزرق${ar(k + 1)}`, x + 8, h * .86, 12); }); }
    say(g, r.title, w * .5, h * .16, 18, '#7C2D12'); if (S.done) say(g, '✓ ' + r.title, w * .5, h * .94, 17, GREEN);
  } else if (r.mode === 'table') {   // جدول قيم (مجموع أو ضرب أو نتيجة اللعبة) يُضاء ما يحقق الشرط بعد الحل
    say(g, r.title, w * .5, h * .1, 17, '#7C2D12');
    outTable(g, w * .14, h * .14, w * .72, h * .8, r.rows, r.cols, (i, j) => r.val(i, j), (i, j) => S.done && r.hl(i, j));
  } else if (r.mode === 'spin') {   // دوّاران وجدول مجموع فارغ حتى الحل
    const sr = Math.min(h * .2, w * .1); spinner(g, w * .14, h * .32, sr, r.a.map(v => ar(v)), [PINK, '#F97316', '#A855F7'], t * 2); spinner(g, w * .14, h * .76, sr, r.b.map(v => ar(v)), [BLUE, '#0EA5E9', GREEN], -t * 1.7);
    outTable(g, w * .32, h * .12, w * .6, h * .8, r.a.map(v => ar(v)), r.b.map(v => ar(v)), (i, j) => S.done ? ar(r.a[i] + r.b[j]) : '؟', (i, j) => S.done && r.hl(i, j));
  }
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) {   // أزواج النردين
    const sm = R(4, 10), T = pick([[`مجموعهما ${ar(sm)}`, (a, b) => a + b + 2 === sm], ['العددان متساويان', (a, b) => a === b], [`الفرق بينهما ${ar(2)}`, (a, b) => Math.abs(a - b) === 2], ['العدد ٦ على حجر واحد على الأقل', (a, b) => a === 5 || b === 5]]);
    return cells(`يرمي مهند حجري نرد أحمر وأزرق معاً، والجدول فيه النتائج الـ٣٦. انقر كل النتائج التي ${T[0]}.`, H6, H6, (a, b) => pair(a + 1, b + 1), T[1],
      'امشِ على الجدول بترتيب: صفاً بعد صف، وافحص كل زوج. لا تنسَ أن (٢، ٥) غير (٥، ٢).', { mode: 'mark', kind: 'dice', title: `النتائج التي ${T[0]}` }, { corner: 'الأحمر↓ الأزرق←' });
  }
  if (i === 1) {   // احتمال من جدول المجموع
    const s = R(4, 10), m = R(0, 2), T = [[`يساوي ${ar(s)}`, (a, b) => a + b === s], [`أصغر من ${ar(s)}`, (a, b) => a + b < s], [`${ar(s)} أو أكثر`, (a, b) => a + b >= s]][m];
    const k = D6.flatMap(a => D6.filter(b => T[1](a, b))).length;
    return fq(`يُرمى حجرا نرد ويُجمع العددان. الجدول يبيّن المجموع لكل نتيجة. ما احتمال أن يكون المجموع ${T[0]}؟`, k, 36, 'كم خلية في الجدول كله؟ وكم خلية تحقق الشرط؟',
      { mode: 'table', title: 'مجموع حجري النرد', rows: H6, cols: H6, val: (a, b) => ar(a + b + 2), hl: (a, b) => T[1](a + 1, b + 1) });
  }
  if (i === 2) {   // عملة وحجر نرد
    const T = pick([['صورة وعدد زوجي', (c, d) => c === 0 && d % 2 === 0], ['كتابة و٥ أو ٦', (c, d) => c === 1 && d >= 5], ['كتابة والعدد ١', (c, d) => c === 1 && d === 1], ['صورة وعدد أكبر من ٣', (c, d) => c === 0 && d > 3], ['العدد ٤ مع أي وجه للعملة', (c, d) => d === 4]]);
    return cells(`يرمي هلال عملة وحجر نرد. للعملة وجهان: صورة (ص) وكتابة (ك). انقر النتائج التي فيها ${T[0]}.`, ['ص', 'ك'], H6, (c, d) => `${c ? 'ك' : 'ص'}${ar(d + 1)}`, (c, d) => T[1](c, d + 1),
      'كل وجه للعملة يلتقي بكل عدد من الستة: ما النتائج التي تحقق الشرطين معاً؟', { mode: 'mark', kind: 'coin', title: `عملة وحجر نرد: ${T[0]}` }, { corner: 'العملة↓' });
  }
  if (i === 3) {   // دوّاران بثلاثة أقسام متكافئة
    let a, b; do { a = [R(1, 3), R(1, 4), R(2, 5)].sort((x, y) => x - y); b = [R(1, 3), R(2, 5), R(3, 6)].sort((x, y) => x - y); } while (new Set(a.flatMap(x => b.map(y => x + y))).size < 4);
    const tots = a.flatMap(x => b.map(y => x + y)), m = R(0, 2), v = pick(tots), even = m === 2;
    const T = [[`يساوي ${ar(v)}`, s => s === v], [`${ar(v)} أو أكثر`, s => s >= v], ['عدداً زوجياً', s => s % 2 === 0]][m], k = tots.filter(T[1]).length;
    if (!k || k === 9) return make(3);
    return fq(`لدى نور دوّاران بثلاثة أقسام متكافئة: الأول عليه ${a.map(x => ar(x)).join('، ')} والثاني ${b.map(x => ar(x)).join('، ')}. يُدار الاثنان ويُجمع العددان. ما احتمال أن يكون المجموع ${T[0]}؟`, k, 9,
      'أكمل جدول المجموع في ذهنك: كم نتيجة كلها؟ وكم منها تحقق الشرط؟ والأعداد المكررة على الدوّار قسمان مختلفان.', { mode: 'spin', a, b, hl: (i2, j) => T[1](a[i2] + b[j]), even });
  }
  if (i === 4) {   // قلمان بلا إرجاع: القطر مستحيل
    const pens = [0, 0, 0, 0, 1], SH = ['أ١', 'أ٢', 'أ٣', 'أ٤', 'ح'], labs = ['أزرق١', 'أزرق٢', 'أزرق٣', 'أزرق٤', 'أحمر'], T = pick([['القلمان أزرقان', (a, b) => !pens[a] && !pens[b]], ['القلم الأول أحمر', a => pens[a] === 1], ['أحد القلمين أحمر', (a, b) => pens[a] + pens[b] === 1]]);
    return cells(`في جيب حسن ٤ أقلام زرقاء وقلم أحمر. يسحب قلماً دون أن ينظر ثم قلماً آخر دون أن يعيد الأول. الصفوف القلم الأول والأعمدة الثاني. انقر النتائج التي فيها: ${T[0]}.`, labs, labs, (a, b) => `${SH[a]} ${SH[b]}`, T[1],
      'لماذا خلايا القطر «×»؟ ثم افحص كل خلية: ما لون القلم الأول (صفها) والثاني (عمودها)؟', { mode: 'mark', kind: 'pens', pens, title: T[0] }, { off: (a, b) => a === b, corner: 'الأول↓ الثاني←' });
  }
  // حجر ورقة مقص، أو ناتج ضرب النردين
  if (Math.random() < .5) {
    const O = ['حجر', 'ورقة', 'مقص'], beats = (a, b) => (a === 0 && b === 2) || (a === 2 && b === 1) || (a === 1 && b === 0), T = pick([['ألا يختارا الشيء نفسه', (a, b) => a !== b], ['أن يهزم مهند خديجة', beats], ['أن يتعادلا', (a, b) => a === b]]);
    const k = [0, 1, 2].flatMap(a => [0, 1, 2].filter(b => T[1](a, b))).length;
    return fq(`يلعب مهند وخديجة «حجر، ورقة، مقص» ويختار كل منهما عشوائياً. الحجر يهزم المقص، والمقص يهزم الورقة، والورقة تهزم الحجر. ما احتمال ${T[0]}؟`, k, 9,
      'كم نتيجة في الجدول؟ اقرأ كل خلية: ماذا اختار مهند (الصف) وماذا اختارت خديجة (العمود)؟', { mode: 'table', title: 'مهند↓ خديجة←', rows: O, cols: O, val: (a, b) => a === b ? 'تعادل' : beats(a, b) ? 'مهند' : 'خديجة', hl: T[1] });
  }
  const v = pick([4, 6, 12, 8, 10]), m = R(0, 1), T = [[`يساوي ${ar(v)}`, p => p === v], [`أكبر من ${ar(v)}`, p => p > v]][m], k = D6.flatMap(a => D6.filter(b => T[1](a * b))).length;
  return fq(`ترمي سناء حجري نرد وتضرب العددين. الجدول يبيّن ناتج الضرب. ما احتمال أن يكون الناتج ${T[0]}؟`, k, 36, 'كم خلية كلها؟ وكم خلية تحقق الشرط؟ عدّ بترتيب.',
    { mode: 'table', title: 'ناتج ضرب حجري النرد', rows: H6, cols: H6, val: (a, b) => ar((a + 1) * (b + 1)), hl: (a, b) => T[1]((a + 1) * (b + 1)) });
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  const F = (k, n) => { const g = gcd(k, n); return fr(k / g, n / g); };
  items.push(num('يُرمى حجرا نرد ذوا ستة أوجه معاً. كم نتيجة متنافية هناك؟', 36, 'ست نتائج للأول مع كل واحدة من ست للثاني.', '8Db3'));
  items.push(num('ترمي سارة ثلاث عملات معاً. كم نتيجة مرجحة بالتساوي هناك؟', 8, 'لكل عملة وجهان: ٢ × ٢ × ٢.', '8Db3'));
  { const s = fresh(() => R(5, 9)), k = D6.flatMap(a => D6.filter(b => a + b === s)).length; items.push(choice(`احتمال أن يكون مجموع حجري نرد ${ar(s)}:`, F(k, 36), [fr(1, 11), F(k, 12), fr(1, s)].filter(x => x !== F(k, 36)), 'ارسم جدول المجموع: كم خلية تساوي المجموع؟', '8Db3')); }
  items.push(choice('أكبر مجموع ممكن عند رمي حجري نرد:', ar(12), [ar(11), ar(36), ar(6)], '٦ + ٦', '8Db3'));
  items.push(choice('تقول مها: «هناك أحد عشر مجموعاً ممكناً، فاحتمال المجموع ٣ هو ١ من ١١». ما الخطأ؟', 'المجاميع ليست مرجحة بالتساوي', ['المجاميع الممكنة عشرة فقط', 'المجموع ٣ مستحيل', 'لا خطأ في قولها'], 'هل يظهر المجموع ٧ بعدد المرات نفسه التي يظهر بها المجموع ٢؟', '8Db3'));
  items.push(choice('احتمال الحصول على صورة وكتابة عند رمي عملتين:', fr(1, 2), [fr(1, 3), fr(1, 4), fr(3, 4)], 'النتائج الأربع: صص، صك، كص، كك.', '8Db3'));
  items.push(tf('عند سحب قلمين بلا إرجاع، النتيجة (أزرق١، أزرق١) مستحيلة.', true, 'هل يمكن أن تسحب القلم نفسه مرتين؟', '8Db3', 'لذلك خلايا القطر «×».'));
  items.push(tf('في لعبة «حجر، ورقة، مقص» بين لاعبين، عدد النتائج الممكنة ٦.', false, 'لكل لاعب ثلاثة خيارات: ٣ × ٣.', '8Db3', 'النتائج ٩.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'طاولة النردين', icon: '🎲', who, rounds: 6, make, draw,
  intro: ['أنا مهند، وعلى طاولتي حجرا نرد: أحمر وأزرق. لكل رمية ٣٦ نتيجة!', 'السر أن تكتب كل النتائج بترتيب في جدول، ثم تعدّ ما تريد. هيا نعلّم الجدول معاً.'],
  outro: ['ممتاز! جدولك المنظّم لا يفوته شيء.', 'لنختبر فضاء الإمكانات بأسئلة متنوعة.'],
  challenge: { title: 'تحدي فضاء الإمكانات', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
