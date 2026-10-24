// ١٢-٢ المزيد من المضلعات — «نوافذ الشمسيات»: المصممة هدى تصمم نوافذ زجاج ملوّن على شكل مضلعات غير منتظمة. مجموع الزوايا الداخلية
// = (ع − ٢) × ١٨٠° لأن المضلع يُقسم إلى ع − ٢ مثلثاً: المجموع، والزاوية الناقصة، والزوايا المتساوية الباقية، وعدد الأضلاع من المجموع،
// وعدد المثلثات، والزاوية الخارجية الناقصة. الزاوية المطلوبة «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Gs4 (الكتاب ص٧٢–٧٣).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { tileBg, say, glow, poly, deg, NAVY } from './art.js';

const who = { name: 'المصممة هدى', face: '👩🏽‍🎨', id: 'huda' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const SUM = n => (n - 2) * 180;
const NM = { 4: 'رباعي', 5: 'خماسي', 6: 'سداسي', 7: 'سباعي', 8: 'ثماني', 9: 'تساعي', 10: 'عشاري', 12: 'اثنا عشري' };
// زوايا مضلع غير منتظم مجموعها (ع − ٢) × ١٨٠ وكل زاوية بين ٦٠ و١٧٠ ومضاعف ٥
function angles(n) { for (let k = 0; k < 400; k++) { const a = Array.from({ length: n - 1 }, () => R(14, 33) * 5), last = SUM(n) - a.reduce((x, y) => x + y, 0); if (last >= 60 && last <= 170 && last % 5 === 0) return [...a, last]; } return Array(n).fill(SUM(n) / n); }
const shape = (n, cx, cy, r) => Array.from({ length: n }, (_, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / n + Math.sin(k * 2.3) * .18, rr = r * (.82 + (k * 37 % 7) / 30); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; tileBg(g, w, h, t);
  say(g, '🪟 ' + (r.title || 'نوافذ الشمسيات'), w * .5, h * .1, 18, NAVY, 900);
  if (r.n) { const P = shape(r.n, w * .5, h * .52, Math.min(w, h) * .3); poly(g, P, (r.labs || []).map(l => l === '؟' && S.done ? deg(r.ans) : l), { fill: ['#BFDBFE', '#FDE68A', '#FBCFE8', '#BBF7D0'][r.n % 4] });
    if (r.tri && S.done) { g.strokeStyle = 'rgba(30,58,138,.5)'; g.setLineDash([5, 4]); g.lineWidth = 2; for (let k = 2; k < r.n - 1; k++) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); g.lineTo(P[k][0], P[k][1]); g.stroke(); } g.setLineDash([]); } }
  if (r.cap) say(g, S.done ? r.done : r.cap, w * .5, h * .94, 16, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const n = pick([5, 6, 7, 8, 9, 10, 12]);
    return { q: `ما مجموع الزوايا الداخلية لنافذة على شكل مضلع ${NM[n]} بالدرجات؟`, input: { type: 'num' }, sol: SUM(n), ok: v => v === SUM(n),
      hint: 'ارسم أقطاراً من رأس واحد: كم مثلثاً تحصل عليه؟ وكم مجموع زوايا المثلث؟', bad: v => v === n * 180 ? 'عدد المثلثات أقل من عدد الأضلاع باثنين.' : v === 360 ? 'هذا مجموع الزوايا الخارجية.' : '',
      good: `(${N(n)} − ٢) × ١٨٠° = ${deg(SUM(n))}`, data: { n, tri: 1, cap: `مضلع ${NM[n]}: المجموع = ؟`, done: `المجموع = ${deg(SUM(n))}`, title: 'مجموع الزوايا' } }; }
  if (i === 1) { const n = pick([4, 5, 6, 7]), a = angles(n), k = R(0, n - 1);
    return { q: `زوايا نافذة على شكل مضلع ${NM[n]}: ${a.filter((_, j) => j !== k).map(deg).join(' و')}. ما قياس الزاوية الناقصة؟`, input: { type: 'num' }, sol: a[k], ok: v => v === a[k],
      hint: 'ما مجموع زوايا هذا المضلع كله؟ واطرح منه الزوايا المعروفة.', bad: v => v === 360 - a.reduce((s, x, j) => j === k ? s : s - x, 0) ? 'استعملت ٣٦٠°: هذا مجموع الخارجية فقط.' : '',
      good: `${deg(SUM(n))} − ${deg(SUM(n) - a[k])} = ${deg(a[k])}`, data: { n, labs: a.map((x, j) => j === k ? '؟' : deg(x)), ans: a[k], cap: 'الزاوية الناقصة = ؟', done: `الناقصة ${deg(a[k])}`, title: 'الزاوية الناقصة' } }; }
  if (i === 2) { const [n, x] = pick([[6, 90], [5, 90], [8, 100], [5, 100], [6, 100], [7, 120], [9, 100]]), rest = (SUM(n) - x) / (n - 1);
    return { q: `زاوية واحدة لنافذة على شكل مضلع ${NM[n]} قياسها ${deg(x)}، وزواياه الأخرى متساوية. ما قياس كل منها؟`, input: { type: 'num', dot: true }, sol: rest, ok: v => Math.abs(v - rest) < .01,
      hint: 'ما مجموع زوايا المضلع؟ اطرح الزاوية المعروفة، ثم وزّع الباقي على الزوايا الأخرى.', bad: v => v === SUM(n) / n ? 'هذا لو كانت الزوايا كلها متساوية.' : '',
      good: `(${deg(SUM(n))} − ${deg(x)}) ÷ ${N(n - 1)} = ${deg(rest)}`, data: { n, labs: [deg(x), ...Array(n - 1).fill('؟')], ans: rest, cap: 'كل زاوية أخرى = ؟', done: `كل زاوية أخرى ${deg(rest)}`, title: 'زوايا متساوية' } }; }
  if (i === 3) { const n = pick([5, 6, 7, 8, 9, 10, 12]);
    return { q: `مجموع الزوايا الداخلية لنافذة مضلعة ${deg(SUM(n))}. كم عدد أضلاعها؟`, input: { type: 'num' }, sol: n, ok: v => v === n,
      hint: 'كم مثلثاً يعطي هذا المجموع؟ وعدد الأضلاع أكثر من عدد المثلثات باثنين.', bad: v => v === n - 2 ? 'هذا عدد المثلثات.' : '',
      good: `${deg(SUM(n))} ÷ ١٨٠° = ${N(n - 2)} مثلثات ← ${N(n)} أضلاع`, data: { n, tri: 1, cap: 'كم ضلعاً؟', done: `${N(n)} أضلاع`, title: 'عدد الأضلاع' } }; }
  if (i === 4) { const n = pick([5, 6, 7, 8, 9, 10]);
    return { q: `ترسم هدى كل الأقطار من رأس واحد لنافذة على شكل مضلع ${NM[n]}. كم مثلثاً تحصل عليه؟`, input: { type: 'num' }, sol: n - 2, ok: v => v === n - 2,
      hint: 'جرّب الرباعي: كم قطراً من رأس واحد؟ وكم مثلثاً؟', bad: v => v === n ? 'الرأس نفسه وجاراه لا يعطيان أقطاراً.' : '',
      good: `${N(n)} − ٢ = ${N(n - 2)}`, data: { n, tri: 1, cap: 'كم مثلثاً؟', done: `${N(n - 2)} مثلثات`, title: 'تقسيم المضلع' } }; }
  const n = pick([5, 6, 7]); let e; do { e = Array.from({ length: n - 1 }, () => R(6, 14) * 5); } while (360 - e.reduce((a, b) => a + b, 0) < 25 || 360 - e.reduce((a, b) => a + b, 0) > 120);
  const last = 360 - e.reduce((a, b) => a + b, 0);
  return { q: `الزوايا الخارجية لنافذة على شكل مضلع ${NM[n]} غير منتظم: ${e.map(deg).join(' و')} وزاوية أخيرة. ما قياس الأخيرة؟`, input: { type: 'num' }, sol: last, ok: v => v === last,
    hint: 'مجموع الزوايا الخارجية لأي مضلع ثابت: كم هو؟', bad: v => v === SUM(n) - e.reduce((a, b) => a + b, 0) ? 'هذا لمجموع الداخلية، والسؤال عن الخارجية.' : '',
    good: `٣٦٠° − ${deg(360 - last)} = ${deg(last)}`, data: { n, cap: 'الخارجية الأخيرة = ؟', done: `الأخيرة ${deg(last)}`, title: 'الزوايا الخارجية' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const n = fresh(() => pick([7, 9, 10, 12])); items.push(num(`ما مجموع الزوايا الداخلية لمضلع ${NM[n]}؟`, SUM(n), '(ع − ٢) × ١٨٠°.', '8Gs4')); }
  items.push(choice('مجموع زوايا المضلع الخماسي:', '٥٤٠°', ['٣٦٠°', '٧٢٠°', '٩٠٠°'], '٣ مثلثات.', '8Gs4'));
  { const a = fresh(() => angles(5)); items.push(num(`أربع زوايا لخماسي: ${a.slice(0, 4).map(deg).join(' و')}. ما الخامسة؟`, a[4], '٥٤٠° − المجموع.', '8Gs4')); }
  items.push(num('سداسي إحدى زواياه ٩٠° والأخرى متساوية. ما قياس كل منها؟', 126, '(٧٢٠ − ٩٠) ÷ ٥.', '8Gs4'));
  items.push(tf('مجموع الزوايا الخارجية للمضلع غير المنتظم أكبر من ٣٦٠°.', false, 'هل يتغير المجموع؟', '8Gs4', 'دائماً ٣٦٠°.'));
  items.push(tf('يُقسم المضلع ذو العشرة أضلاع إلى ٨ مثلثات بأقطار من رأس واحد.', true, 'ع − ٢.', '8Gs4', '١٠ − ٢ = ٨.'));
  { const n = fresh(() => pick([8, 9, 10])); items.push(num(`مجموع الزوايا الداخلية لمضلع ${deg(SUM(n))}. كم ضلعاً له؟`, n, 'اقسم على ١٨٠ ثم أضف ٢.', '8Gs4')); }
  items.push(choice('صيغة مجموع الزوايا الداخلية لمضلع عدد أضلاعه ع:', '(ع − ٢) × ١٨٠°', ['ع × ١٨٠°', '٣٦٠° ÷ ع', '(ع + ٢) × ١٨٠°'], 'عدد المثلثات ع − ٢.', '8Gs4'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'نوافذ الشمسيات', icon: '🪟', who, rounds: 6, make, draw,
  intro: ['أنا هدى، أصمم نوافذ الزجاج الملوّن للدار. نوافذي ليست منتظمة دائماً!', 'لكن مهما اختلفت الزوايا، مجموعها ثابت: قسّم المضلع إلى مثلثات وسترى.'],
  outro: ['ممتاز! كل نافذة بزواياها الصحيحة.', 'تحدي المزيد من المضلعات.'],
  challenge: { title: 'تحدي المضلعات', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
