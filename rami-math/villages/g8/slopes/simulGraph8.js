// ١١-٥ حل المعادلات الآنية بالرسم البياني — «تقاطع المسارين»: المنقذ ماجد يضع برج الإنقاذ حيث يتقاطع مساران. نقطة التقاطع تحقق المعادلتين معاً:
// ينقرها الطالب على الشبكة، ويقرأ إحداثييها، ويقدّر حلاً تقريبياً حين لا تقع على تقاطع خطوط الشبكة، ويتحقق جبرياً، ويعرف أن المتوازيين لا يتقاطعان.
// التحدي: ٨ أسئلة من 8As2 (الكتاب ص٥٨–٥٩).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane, pt } from './art.js';
import { yeq } from './lineEq8.js';

const who = { name: 'المنقذ ماجد', face: '🛟', id: 'majid' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
// مستقيمان يتقاطعان في نقطة صحيحة داخل الشبكة
const cross = () => { let m1, m2, x, y; do { m1 = pick([1, 2, -1, -2, .5, 3]); m2 = pick([1, -1, -2, 2, -.5, 0]); x = R(-4, 4); y = R(-4, 4); } while (m1 === m2 || !Number.isInteger(y - m1 * x) || !Number.isInteger(y - m2 * x) || Math.abs(y - m1 * x) > 6 || Math.abs(y - m2 * x) > 6); return { m1, c1: y - m1 * x, m2, c2: y - m2 * x, x, y }; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t);
  const s = Math.min(w * .55, h * .78), x = w * .5 - s / 2, y = h * .1, lo = r.lo ?? -6, hi = r.hi ?? 6;
  plane(g, x, y, s, lo, hi, { lines: (r.lines || []).map((L, k) => ({ ...L, col: k ? '#1E3A8A' : '#7C3AED' })), pts: S.done && r.p ? [{ p: r.p, l: r.pl || pt(...r.p), col: '#EA580C' }] : [], lab: r.lab || 1 });
  (r.lines || []).forEach((L, k) => say(g, yeq(L.m, L.c), w * (k ? .25 : .75), h * .95, 15, k ? '#1E3A8A' : '#7C3AED', 900));
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0 || i === 4) { const P = i === 4 ? (() => { const k = R(-4, 4), m = pick([1, 2, -1, -2]); let x; do x = R(-4, 4); while (!Number.isInteger(k - m * x) || Math.abs(k - m * x) > 6); return { m1: m, c1: k - m * x, m2: 0, c2: k, x, y: k }; })() : cross();
    return { q: `أين يضع ماجد برج الإنقاذ؟ انقر نقطة تقاطع المسارين ${yeq(P.m1, P.c1)} و ${yeq(P.m2, P.c2)}.`, input: { type: 'grid', x0: -6, x1: 6, y0: -6, y1: 6, n: 1, lines: [[P.m1, P.c1, '#7C3AED'], [P.m2, P.c2, '#1E3A8A']] }, sol: [[P.x, P.y]], ok: v => v[0][0] === P.x && v[0][1] === P.y,
      hint: 'ابحث عن النقطة التي يمر بها المستقيمان كلاهما. تحقق بالتعويض في المعادلتين.', bad: v => { const [x, y] = v[0]; return eq(y, P.m1 * x + P.c1) || eq(y, P.m2 * x + P.c2) ? 'هذه النقطة على مستقيم واحد فقط.' : 'هذه النقطة ليست على أي من المستقيمين.'; },
      good: `التقاطع ${pt(P.x, P.y)}`, data: { lines: [{ m: P.m1, c: P.c1 }, { m: P.m2, c: P.c2 }], p: [P.x, P.y] } }; }
  if (i === 1) { const P = cross();
    return { q: 'اقرأ من الرسم حل المعادلتين الآنيتين.', input: { type: 'blanks', tpl: 'س = {} ، ص = {}', neg: true }, sol: [P.x, P.y], ok: v => v[0] === P.x && v[1] === P.y,
      hint: 'الحل هو إحداثيا نقطة التقاطع: السيني أولاً ثم الصادي.', bad: v => v[0] === P.y && v[1] === P.x ? 'بدّلت الإحداثيين: السيني يُقرأ على المحور الأفقي.' : '',
      good: `س = ${N(P.x)} ، ص = ${N(P.y)}`, data: { lines: [{ m: P.m1, c: P.c1 }, { m: P.m2, c: P.c2 }], p: [P.x, P.y] } }; }
  if (i === 2 || i === 3) { let m1, c1, m2, c2, x; do { m1 = pick([.5, 1, -1, 2]); c1 = R(-2, 4); m2 = pick([2.5, 3, -2, 1.5]); c2 = R(-4, 2); x = (c2 - c1) / (m1 - m2); } while (m1 === m2 || Number.isInteger(x) || Math.abs(x) > 4 || Math.abs(m1 * x + c1) > 9 || Math.round(x * 10) / 10 !== x && Math.round(x * 4) / 4 !== x || Math.abs(Math.abs(x % 1) - .5) < .01 || Math.abs(Math.abs((m1 * x + c1) % 1) - .5) < .01);
    const y = m1 * x + c1;
    if (i === 3) return { q: `حلّ المعادلتين ${yeq(m1, c1)} و ${yeq(m2, c2)} جبرياً. ما قيمة س عند نقطة التقاطع؟`, input: { type: 'num', neg: true, dot: true }, sol: x, ok: v => eq(v, x),
      hint: 'ص في المعادلتين واحدة: ساوِ الطرفين الأيمنين وحلّ لإيجاد س.', bad: v => eq(v, y) ? 'هذه قيمة ص.' : '',
      good: `س = ${N(x)} ، ص = ${N(y)}`, data: { lines: [{ m: m1, c: c1 }, { m: m2, c: c2 }], p: [x, y], lo: -6, hi: 10, lab: 2 } };
    const right = pt(Math.round(x), Math.round(y)), opts = shuf([right, pt(Math.round(y), Math.round(x)), pt(Math.round(x) + 2, Math.round(y)), pt(-Math.round(x), Math.round(y))].filter((v, k, A) => A.indexOf(v) === k));
    return { q: 'المساران لا يتقاطعان عند تقاطع خطوط الشبكة. أي نقطة هي الحل التقريبي؟', input: { type: 'pick', opts }, ok: v => opts[v] === right,
      hint: 'قدّر موضع التقاطع على كل محور: إلى أي عدد صحيح هو أقرب؟', bad: () => 'انظر إلى التقاطع: أقرب عدد صحيح على المحور الأفقي ثم على الرأسي.',
      good: `بالتقريب ${right} والدقيق ${pt(x, y)}`, data: { lines: [{ m: m1, c: c1 }, { m: m2, c: c2 }], p: [x, y], lo: -6, hi: 10, lab: 2 } }; }
  const m = pick([1, 2, -1, .5]), c1 = R(-4, 0), c2 = c1 + R(2, 5);
  return { q: `كم حلاً للمعادلتين الآنيتين ${yeq(m, c1)} و ${yeq(m, c2)}؟`, input: { type: 'pick', opts: ['حل واحد', 'لا يوجد حل', 'حلان'] }, ok: v => v === 1,
    hint: 'قارن ميلي المستقيمين: هل يمكن أن يلتقيا؟', bad: () => 'المستقيمان لهما الميل نفسه ومقطعان مختلفان: متوازيان.',
    good: 'متوازيان: لا يتقاطعان', data: { lines: [{ m, c: c1 }, { m, c: c2 }] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const P = fresh(cross); items.push(choice(`نقطة تقاطع المستقيمين ${yeq(P.m1, P.c1)} و ${yeq(P.m2, P.c2)}:`, pt(P.x, P.y), [pt(P.y, P.x), pt(P.x + 1, P.y), pt(0, P.c1)], 'عوّض بالنقطة في المعادلتين.', '8As2')); }
  { const P = fresh(cross); items.push(num(`ما الإحداثي السيني لنقطة تقاطع ${yeq(P.m1, P.c1)} و ${yeq(P.m2, P.c2)}؟`, P.x, 'ساوِ بين العبارتين.', '8As2', { neg: true })); }
  items.push(tf('حل المعادلتين الآنيتين بالرسم قد يكون تقريبياً.', true, 'ماذا لو وقع التقاطع بين خطوط الشبكة؟', '8As2', 'الرسم يعطي تقديراً، والجبر يعطي الدقة.'));
  items.push(tf('المستقيمان ص = ٢س + ١ و ص = ٢س − ٣ يتقاطعان في نقطة واحدة.', false, 'قارن الميلين.', '8As2', 'متوازيان، فلا حل.'));
  items.push(choice('نقطة تقاطع مستقيمين تمثل:', 'حل المعادلتين معاً', ['ميل المستقيمين', 'منتصف المستقيمين', 'المقطع الصادي'], 'تقع على المستقيمين كليهما.', '8As2'));
  { const [k, m] = fresh(() => [R(1, 6), pick([1, 2])]); items.push(num(`المستقيم ص = ${N(k)} أفقي. عند أي قيمة للعدد س يقطع المستقيم ${yeq(m, 0)}؟`, k / m, 'عوّض ص في المعادلة الثانية.', '8As2', { dot: true })); }
  items.push(num('حل المعادلتين ص = ٠٫٥س + ٤ و ص = ٢٫٥س − ٣ جبرياً: ما س؟', 3.5, 'ساوِ: ٠٫٥س + ٤ = ٢٫٥س − ٣.', '8As2', { dot: true }));
  { const P = fresh(cross); items.push(num(`ما الإحداثي الصادي لنقطة تقاطع ${yeq(P.m1, P.c1)} و ${yeq(P.m2, P.c2)}؟`, P.y, 'أوجد س ثم عوّض.', '8As2', { neg: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'تقاطع المسارين', icon: '🛟', who, rounds: 6, make, draw,
  intro: ['أنا ماجد، منقذ المنحدرات. أضع برج الإنقاذ حيث يلتقي مساران حتى أرى المتزلجين في الاثنين.', 'نقطة التقاطع تقع على المسارين معاً… فهي حل معادلتيهما معاً!'],
  outro: ['أحسنت! الأبراج كلها في أماكنها.', 'تحدي الحل بالرسم البياني.'],
  challenge: { title: 'تحدي التقاطع', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
