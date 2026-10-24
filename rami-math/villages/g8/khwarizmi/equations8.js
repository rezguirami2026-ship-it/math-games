// ٥-١ كتابة المعادلات وحلها — «الميزان الكبير»: في ساحة دار الحكمة ميزان ذو كفتين. الطالب يكتب المعادلة من شكل (ضلعان متقابلان
// في مستطيل، أو ضلعان متساويان في مثلث) أو من «فكّر في عدد»، ويحلّها بالعمليات العكسية؛ والميزان يعتدل بعد الحل فقط.
// التحدي: ٨ أسئلة من 8Ae1 و8Ae2 (الكتاب ص٧٧–٧٩).
import { mission } from '../../mission.js';
import { N, R, ex } from '../../math.js';
import { choice, num, tf, order } from '../../../missions/challenge.js';
import { parchment, balance, rectLabeled, expr, say, TEAL } from './art.js';

const who = { name: 'العالِم يوسف', face: '👳🏽‍♂️', id: 'yusuf' };
const t = (a, v, b) => `${a === 1 ? '' : N(a)}${v}${b ? (b > 0 ? ' + ' : ' − ') + N(Math.abs(b)) : ''}`;   // «٣س + ٩» نصاً للقماش

function draw(g, w, h, tm, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  if (r.mode === 'rect') rectLabeled(g, w * .28, h * .28, w * .44, h * .42, { top: [r.top], bottom: [r.bottom], right: [r.side], left: [r.side] });
  else if (r.mode === 'tri') { const cx = w * .5, top = h * .14, base = h * .82; g.fillStyle = 'rgba(15,118,110,.12)'; g.strokeStyle = TEAL; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, top); g.lineTo(cx - w * .2, base); g.lineTo(cx + w * .2, base); g.closePath(); g.fill(); g.stroke();
    expr(g, [r.a], cx - w * .17, h * .46, 20); expr(g, [r.b], cx + w * .17, h * .46, 20); [-1, 1].forEach(s => { const mx = cx + s * w * .1, my = (top + base) / 2; g.beginPath(); g.moveTo(mx - 6, my - 4); g.lineTo(mx + 6, my + 4); g.stroke(); }); }
  else balance(g, w * .5, h * .3, S.done ? 0 : r.tilt || .6, [r.left], [r.right], Math.min(1, h / 300));
  if (S.done && r.sol != null) say(g, `${r.v} = ${N(r.sol)} ✓`, w * .5, h * .95, 20, '#15803D');
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i === 0) {   // ضلعان متقابلان في مستطيل: أ(س + ب) = ج
    const x = R(2, 9), a = R(2, 5), b = R(1, 6), c = a * (x + b), Q = `${N(a)}(س + ${N(b)})`;
    return { q: `في المستطيل ضلعان متقابلان طولاهما ${Q} سم و${N(c)} سم. اكتب معادلة وأوجد س.`, input: { type: 'num' }, ok: v => v === x,
      hint: 'الضلعان المتقابلان متساويان: ماذا تفعل بالعدد خارج القوس أولاً؟', bad: v => v === c - b ? 'هل ضربت ما خارج القوس في كل حد داخله؟' : '', good: `أحسنت! ${N(a)}س + ${N(a * b)} = ${N(c)}، فـ س = ${N(x)}.`,
      data: { mode: 'rect', top: Q, bottom: N(c), side: t(R(2, 4), 'ص', 0), v: 'س', sol: x } }; }
  if (i === 1) {   // المجهول في الطرفين: أص − ب = جص + د
    const y = R(2, 9), p = R(4, 8), q = R(2, p - 2), b = R(1, 9), d = (p - q) * y - b;
    if (d <= 0) return make(1);
    return { q: `على الميزان: ${ex([p, 'ص'], [-b])} في كفة، و${ex([q, 'ص'], [d])} في الأخرى، وهما متعادلتان. أوجد ص.`, input: { type: 'num' }, ok: v => v === y,
      hint: `اطرح ${ex([q, 'ص'])} من الكفتين معاً: ماذا يبقى؟`, bad: v => v * (p + q) === b + d ? 'هل جمعتَ الحدّين بدل أن تطرح؟ ما تفعله في كفة تفعله في الأخرى.' : '', good: `أحسنت! ${ex([p - q, 'ص'])} = ${N(b + d)}، فـ ص = ${N(y)}.`,
      data: { mode: 'bal', left: t(p, 'ص', -b), right: t(q, 'ص', d), tilt: -.5, v: 'ص', sol: y } }; }
  if (i === 2) {   // فكّر في عدد
    const n = R(3, 15), m = R(2, 6), k = R(2, 12), res = n * m + k, who2 = ['راشد', 'سامي', 'نور', 'هيثم'][R(0, 3)];
    return { q: `يفكّر ${who2} في عدد، يضربه في ${N(m)} ثم يضيف ${N(k)} فيكون الناتج ${N(res)}. ما العدد؟`, input: { type: 'num' }, ok: v => v === n,
      hint: 'سمِّ العدد س واكتب المعادلة، ثم اعكس العمليات بالترتيب المعاكس.', bad: v => v === (res + k) / m ? 'هل أضفتَ بدل أن تطرح؟ عكس الإضافة الطرح.' : v === res / m - k ? 'اعكس آخر عملية أولاً.' : '', good: `أحسنت! ${N(m)}س + ${N(k)} = ${N(res)}، فـ س = ${N(n)}.`,
      data: { mode: 'bal', left: N(res), right: t(m, 'س', k), tilt: .4, v: 'س', sol: n } }; }
  if (i === 3) {   // مثلث متطابق الضلعين
    const x = R(3, 12), p = R(3, 6), q = R(1, p - 1), b = R(1, 9), d = (p - q) * x + b;
    return { q: `مثلث متطابق الضلعين: الضلعان المتساويان ${ex([q, 'س'], [d])} و${ex([p, 'س'], [b])} سم. أوجد س.`, input: { type: 'num' }, ok: v => v === x,
      hint: 'الضلعان متساويان: اكتب معادلة، ثم اجمع حدود س في طرف والأعداد في الطرف الآخر.', bad: () => '', good: `أحسنت! س = ${N(x)}، وطول كل ضلع ${N(p * x + b)} سم.`,
      data: { mode: 'tri', a: t(q, 'س', d), b: t(p, 'س', b), v: 'س', sol: x } }; }
  // أقواس في الطرفين: أ(س + ب) = ج(س − د)
  for (let k = 0; k < 80; k++) { const x = R(4, 20), a = R(2, 5), c = R(a + 1, 7), b = R(1, 6), d = R(1, 6); if (a * (x + b) === c * (x - d) && x - d > 0) {
    return { q: `كفتا الميزان متعادلتان: ${N(a)}(س + ${N(b)}) و${N(c)}(س − ${N(d)}). أوجد س.`, input: { type: 'num' }, ok: v => v === x,
      hint: 'افكك القوسين أولاً، ثم انقل حدود س إلى طرف واحد.', bad: () => '', good: `أحسنت! س = ${N(x)}.`, data: { mode: 'bal', left: `${N(a)}(س + ${N(b)})`, right: `${N(c)}(س − ${N(d)})`, tilt: .3, v: 'س', sol: x } }; } }
  return make(1);
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [x, a, b] = fresh(() => [R(2, 12), R(2, 9), R(1, 20)]); items.push(num(`حلّ: ${ex([a, 'س'], [b])} = ${N(a * x + b)}`, x, 'اطرح العدد من الطرفين ثم اقسم على معامل س.', '8Ae2')); }
  { const [x, a, b] = fresh(() => [R(2, 9), R(2, 6), R(1, 8)]); items.push(num(`حلّ: ${N(a)}(س − ${N(b)}) = ${N(a * (x - b))}`, x, 'افكك القوس، أو اقسم الطرفين على العدد خارجه أولاً.', '8Ae2')); }
  { const [y, p, q, b] = fresh(() => [R(2, 9), R(5, 9), R(2, 4), R(1, 9)]); items.push(num(`حلّ: ${ex([p, 'ص'], [b])} = ${ex([q, 'ص'], [(p - q) * y + b])}`, y, 'اجمع حدود ص في طرف واحد.', '8Ae2')); }
  items.push(tf('كلمة «الجبر» مشتقة من عنوان كتاب للعالم المسلم محمد بن موسى الخوارزمي.', true, 'تذكّر مقدمة الوحدة.', '8Ae1', 'كتابه «الجبر والمقابلة» نحو سنة ٨٢٠م، وهو أول كتاب في علم الجبر.'));
  items.push(choice('في المعادلة ٥ص − ٤ = ٣ص + ٨، ما الخطوة الأولى المناسبة؟', 'طرح ٣ص من الطرفين', ['جمع ٣ص إلى الطرف الأيمن فقط', 'قسمة الطرفين على ص', 'ضرب الطرفين في ٤'], 'ما تفعله في طرف تفعله في الآخر.', '8Ae2'));
  { const [n, m, k] = fresh(() => [R(3, 12), R(2, 5), R(2, 9)]); items.push(num(`تفكّر سارة في عدد، تضربه في ${N(m)} ثم تطرح ${N(k)} فيكون الناتج ${N(n * m - k)}. ما العدد؟`, n, 'اعكس العمليات بالترتيب المعاكس.', '8Ae2')); }
  items.push(order('رتّب خطوات حل ٣(س + ٣) = ٢٤:', ['٣س + ٩ = ٢٤', '٣س = ١٥', 'س = ٥'], (a, b) => ['٣س + ٩ = ٢٤', '٣س = ١٥', 'س = ٥'].indexOf(a) - ['٣س + ٩ = ٢٤', '٣س = ١٥', 'س = ٥'].indexOf(b), 'افكك القوس، ثم اطرح، ثم اقسم.', '8Ae2'));
  items.push(tf('إذا أضفنا العدد نفسه إلى طرفي معادلة تبقى المعادلة صحيحة.', true, 'فكّر في الميزان.', '8Ae2', 'الكفتان تبقيان متعادلتين.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'الميزان الكبير', icon: '⚖️', who, rounds: 5, make, draw,
  intro: ['مرحباً بك في دار الحكمة! هنا كتب الخوارزمي «الجبر والمقابلة».', 'المعادلة كالميزان: ما تفعله في كفة تفعله في الأخرى، فيبقى متعادلاً.'],
  outro: ['اعتدل الميزان في كل مرة! أنت تحلّ المعادلات كما علّمنا الخوارزمي.', 'لنختبر حل المعادلات بأسئلة متنوعة.'],
  challenge: { title: 'تحدي المعادلات', make: challenge }
});
export { make, challenge };
