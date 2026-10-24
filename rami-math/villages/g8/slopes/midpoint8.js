// ١١-١ نقطة المنتصف للقطعة المستقيمة — «محطة المنتصف»: المرشدة لمياء تضع استراحة في منتصف كل مسار تزلج. الطالب ينقر المنتصف على الشبكة،
// ويحسبه بالوسط الحسابي للإحداثيات (السيني ثم الصادي)، وبإحداثيات سالبة وكسرية، ويجد الطرف الآخر من المنتصف. التحدي: ٨ أسئلة من 8Gp1 (الكتاب ص٤٧–٤٨).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane, pt } from './art.js';

const who = { name: 'المرشدة لمياء', face: '🧕🏽', id: 'lamya' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const NM = [['أ', 'ب'], ['ج', 'د'], ['ع', 'ف'], ['ك', 'ل']];
const seg = (lo, hi, even = true) => { let a, b; do { a = [R(lo, hi), R(lo, hi)]; b = [R(lo, hi), R(lo, hi)]; } while ((a[0] === b[0] && a[1] === b[1]) || Math.hypot(a[0] - b[0], a[1] - b[1]) < 3 || (even && ((a[0] + b[0]) % 2 || (a[1] + b[1]) % 2))); return [a, b]; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t);
  const s = Math.min(w * .55, h * .78), x = w * .5 - s / 2, y = h * .1;
  const pts = (r.ends || []).map((p, k) => ({ p, l: `${r.nm[k]}${pt(...p)}` }));
  if (S.done && r.mid) pts.push({ p: r.mid, l: `م${pt(...r.mid)}`, col: '#EA580C' });
  if (r.knownMid && !S.done) pts.push({ p: r.knownMid, l: `م${pt(...r.knownMid)}`, col: '#EA580C' });
  plane(g, x, y, s, r.lo ?? -6, r.hi ?? 6, { pts, segs: r.ends && r.ends.length === 2 ? [[r.ends[0], r.ends[1]]] : S.done && r.full ? [[r.full[0], r.full[1]]] : [], lab: r.lab || 1 });
  glow(g, w, h, S);
}

function make(i) {
  const nm = pick(NM);
  if (i === 0) { const [a, b] = seg(-5, 5), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return { q: `أين تضع لمياء الاستراحة في منتصف المسار ${nm.join('')}؟ انقر نقطة المنتصف.`, input: { type: 'grid', x0: -6, x1: 6, y0: -6, y1: 6, n: 1, given: [[...a, nm[0]], [...b, nm[1]], ], segs: [[a, b]] }, sol: [m], ok: v => v[0][0] === m[0] && v[0][1] === m[1],
      hint: 'كم خطوة أفقية بين الطرفين؟ نصفها من أين؟ وكذلك الخطوات الرأسية.', bad: v => v[0][0] === m[0] ? 'الإحداثي السيني صحيح! راجع الصادي.' : v[0][1] === m[1] ? 'الإحداثي الصادي صحيح! راجع السيني.' : '',
      good: `المنتصف ${pt(...m)}`, data: { ends: [a, b], nm, mid: m } }; }
  if (i === 1 || i === 2) { const [a, b] = seg(i === 1 ? 0 : -9, i === 1 ? 10 : 9), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], k = i === 1 ? 0 : 1;
    return { q: `طرفا مسار التزلج ${nm[0]}${pt(...a)} و${nm[1]}${pt(...b)}. ما الإحداثي ${k ? 'الصادي' : 'السيني'} لنقطة منتصف القطعة ${nm.join('')}؟`, input: { type: 'num', neg: true }, sol: m[k], ok: v => v === m[k],
      hint: `اجمع الإحداثيين ${k ? 'الصاديين' : 'السينيين'} للطرفين. ثم ماذا تفعل بالمجموع؟`, bad: v => v === a[k] + b[k] ? 'هذا المجموع: والمنتصف نصفه.' : v === m[1 - k] ? `هذا الإحداثي ${k ? 'السيني' : 'الصادي'}.` : v === (b[k] - a[k]) / 2 || v === (a[k] - b[k]) / 2 ? 'المنتصف بجمع الإحداثيين لا بطرحهما.' : '',
      good: `(${N(a[k])} + ${N(b[k])}) ÷ ٢ = ${N(m[k])}`, data: { ends: [a, b], nm, mid: m, lo: i === 1 ? 0 : -10, hi: i === 1 ? 10 : 10, lab: 2 } }; }
  if (i === 3) { const [a, b] = seg(-6, 8, false), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (m[0] % 1 === 0 && m[1] % 1 === 0) b[0] += 1; const m2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return { q: `طرفا القطعة ${nm.join('')} هما ${nm[0]}${pt(...a)} و${nm[1]}${pt(...b)}. ما الإحداثي السيني لنقطة المنتصف؟`, input: { type: 'num', neg: true, dot: true }, sol: m2[0], ok: v => eq(v, m2[0]),
      hint: 'المنتصف لا يكون دائماً عدداً كاملاً: اجمع السينيين واقسم على ٢.', bad: v => eq(v, a[0] + b[0]) ? 'لا تنس القسمة على ٢.' : eq(v, m2[1]) ? 'هذا الإحداثي الصادي.' : '',
      good: `المنتصف ${pt(...m2)}`, data: { ends: [a, b], nm, mid: m2, lo: -8, hi: 10, lab: 2 } }; }
  if (i === 4) { const [a, b] = seg(-5, 5), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return { q: `نقطة منتصف القطعة ${nm.join('')} هي م${pt(...m)}، وأحد طرفيها ${nm[0]}${pt(...a)}. انقر الطرف الآخر ${nm[1]}.`, input: { type: 'grid', x0: -6, x1: 6, y0: -6, y1: 6, n: 1, given: [[...a, nm[0]], [...m, 'م']] }, sol: [b], ok: v => v[0][0] === b[0] && v[0][1] === b[1],
      hint: `كم خطوة من ${nm[0]} إلى م أفقياً ورأسياً؟ استمر بالخطوات نفسها بعد م.`, bad: v => v[0][0] === 2 * a[0] - m[0] ? 'اتجاهك معكوس: الطرف الآخر بعد م لا قبل ' + nm[0] + '.' : '',
      good: `${nm[1]}${pt(...b)}`, data: { ends: [a], nm, knownMid: m, full: [a, b], mid: m } }; }
  const [a, b] = seg(-9, 9), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], opts = [pt(...m), pt(a[0] + b[0], a[1] + b[1]), pt(m[1], m[0]), pt((b[0] - a[0]) / 2, (b[1] - a[1]) / 2)].filter((v, k, A) => A.indexOf(v) === k), sh = opts.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  return { q: `يمر الطريق الترابي بين ${nm[0]}${pt(...a)} و${nm[1]}${pt(...b)}. ما إحداثيات نقطة منتصفه؟`, input: { type: 'pick', opts: sh }, ok: v => sh[v] === pt(...m),
    hint: 'المنتصف = (متوسط السينيين، متوسط الصاديين).', bad: v => sh[v] === pt(m[1], m[0]) ? 'رتّب الإحداثيين: السيني أولاً.' : 'تحقق من الجمع ثم القسمة على ٢ لكل إحداثي.',
    good: `م${pt(...m)}`, data: { ends: [a, b], nm, mid: m, lo: -10, hi: 10, lab: 2 } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b] = fresh(() => seg(-8, 8)); items.push(choice(`منتصف القطعة بين ${pt(...a)} و${pt(...b)}:`, pt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), [pt(a[0] + b[0], a[1] + b[1]), pt((a[1] + b[1]) / 2, (a[0] + b[0]) / 2), pt((b[0] - a[0]) / 2, (b[1] - a[1]) / 2)], 'متوسط كل إحداثي.', '8Gp1')); }
  { const [a, b] = fresh(() => seg(0, 12)); items.push(num(`ما الإحداثي السيني لمنتصف القطعة بين ${pt(...a)} و${pt(...b)}؟`, (a[0] + b[0]) / 2, 'اجمع السينيين واقسم على ٢.', '8Gp1', { neg: true })); }
  { const [a, b] = fresh(() => seg(-10, 10)); items.push(num(`ما الإحداثي الصادي لمنتصف القطعة بين ${pt(...a)} و${pt(...b)}؟`, (a[1] + b[1]) / 2, 'اجمع الصاديين واقسم على ٢.', '8Gp1', { neg: true })); }
  { const [a, m] = fresh(() => [[R(-4, 4), R(-4, 4)], [R(-4, 4), R(-4, 4)]]); items.push(num(`منتصف قطعة م${pt(...m)} وأحد طرفيها ${pt(...a)}. ما الإحداثي السيني للطرف الآخر؟`, 2 * m[0] - a[0], 'الطرف الآخر بعد المنتصف بالمسافة نفسها.', '8Gp1', { neg: true })); }
  items.push(tf('منتصف القطعة بين (١، ٥) و(٥، ١) هو (٣، ٣).', true, 'احسب المتوسطين.', '8Gp1', '(١ + ٥) ÷ ٢ = ٣ للإحداثيين.'));
  items.push(tf('منتصف القطعة بين (١٠، ٤) و(٤−، ٦−) هو (٧، ٥).', false, 'اجمع مع الإشارات.', '8Gp1', 'المنتصف (٣، ١−).'));
  { const [a, b] = fresh(() => seg(-6, 6, false)); const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; items.push(num(`ما الإحداثي السيني لمنتصف القطعة بين ${pt(...a)} و${pt(...b)}؟`, m[0], 'قد يكون الجواب كسراً عشرياً.', '8Gp1', { neg: true, dot: true })); }
  items.push(choice('نقطة منتصف القطعة المستقيمة هي النقطة التي:', 'تقسمها إلى قطعتين متساويتين', ['تقع على محور السينات', 'إحداثياها متساويان', 'أقرب إلى نقطة الأصل'], 'ماذا تعني كلمة المنتصف؟', '8Gp1'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'محطة المنتصف', icon: '📍', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في منحدرات التزلج! أنا لمياء، أرشد المتزلجين على الكثبان.', 'في منتصف كل مسار أضع استراحة بماء بارد. لكن أين المنتصف تماماً؟ الإحداثيات تخبرنا!'],
  outro: ['ممتاز! كل استراحة في منتصف مسارها تماماً.', 'تحدي نقطة المنتصف.'],
  challenge: { title: 'تحدي المنتصف', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
