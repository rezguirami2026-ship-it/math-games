// ٥-٦ التحليل إلى عوامل — «صانعة الصناديق»: عائشة تصنع صناديق خشبية مستطيلة من لوحين متجاورين لهما الارتفاع نفسه. مساحة
// اللوحين معاً عبارة جبرية، والطالب يجد الارتفاع المشترك (العامل المشترك الأكبر) وما يبقى داخل القوس، ويكتشف تحليلاً ناقصاً.
// التحدي: ٨ أسئلة من 8Ae5 (الكتاب ص٩٠–٩١).
import { mission } from '../../mission.js';
import { N, R, gcd, ex, pw } from '../../math.js';
import { choice, tf, num } from '../../../missions/challenge.js';
import { parchment, expr, say, TEAL } from './art.js';

const who = { name: 'عائشة صانعة الصناديق', face: '👩🏽‍🎨', id: 'aisha' };
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  if (r.parts) {   // لوحان متجاوران بالارتفاع نفسه: المساحتان مكتوبتان، والارتفاع وطولا اللوحين يظهران بعد الحل
    const x0 = w * .18, y0 = h * .2, H = h * .5, tot = w * .64, w1 = tot * r.parts[0] / (r.parts[0] + r.parts[1]);
    [[x0, w1, '#FDE68A'], [x0 + w1, tot - w1, '#BBF7D0']].forEach(([x, ww, col], k) => { g.fillStyle = col; g.fillRect(x, y0, ww, H); g.strokeStyle = '#7C4A1E'; g.lineWidth = 4; g.strokeRect(x, y0, ww, H);
      for (let yy = y0 + 14; yy < y0 + H; yy += 16) { g.strokeStyle = 'rgba(124,74,30,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, yy); g.lineTo(x + ww - 4, yy); g.stroke(); }
      expr(g, r.areas[k], x + ww / 2, y0 + H / 2 + 8, 22); if (S.done) expr(g, r.lens[k], x + ww / 2, y0 + H + 30, 20, TEAL); });
    if (S.done) { g.save(); g.translate(x0 - 16, y0 + H / 2); g.rotate(-Math.PI / 2); expr(g, r.fac, 0, 0, 22, TEAL); g.restore(); }
    else say(g, '؟', x0 - 16, y0 + H / 2 + 8, 24, '#94A3B8');
  }
  if (r.err) { g.fillStyle = '#FFFDF6'; g.fillRect(w * .1, h * .2, w * .8, h * .4); say(g, 'تحليل لينا', w * .5, h * .3, 15, '#64748B'); expr(g, r.err, w * .5, h * .48, 24, '#B91C1C'); }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}
const T = (c, v = '') => `${c === 1 && v ? '' : N(c)}${v}`;

function make(i) {
  if (i === 0) { const g = R(2, 6), k = R(1, 4), m = [1, 2, 3, 5, 7].filter(x => gcd(x, k) === 1 && x !== k)[R(0, 2)], a = g * k, b = g * m;
    return { q: `حلّل إلى عوامل: ${ex([a, 'س'], [b])}`, input: { type: 'blanks', tpl: k === 1 ? '{}(س + {})' : '{}({}س + {})' }, sol: k === 1 ? [g, m] : [g, k, m],
      ok: x => k === 1 ? x[0] === g && x[1] === m : x[0] === g && x[1] === k && x[2] === m,
      hint: 'ما أكبر عدد يقسم الحدين معاً؟ ضعه خارج القوس، واقسم كل حد عليه.', bad: x => x[0] !== g && gcd(a, b) % x[0] === 0 && x[0] > 1 ? 'هذا عامل مشترك، لكنه ليس الأكبر.' : '', good: `أحسنت! تحقّق بالفك: ${N(g)} × ${T(k, 'س')} = ${T(a, 'س')}.`,
      data: { parts: [k + 1, m], areas: [[T(a, 'س')], [N(b)]], lens: [[T(k, 'س')], [N(m)]], fac: [N(g)] } }; }
  if (i === 1) { const g = R(2, 5), k = R(2, 5), m = [1, 2, 3, 5, 7].filter(x => gcd(x, k) === 1)[R(0, 2)], a = g * k, b = g * m;
    return { q: `حلّل إلى عوامل: ${ex([a], [-b, 'ص'])}`, input: { type: 'blanks', tpl: m === 1 ? '{}({} − ص)' : '{}({} − {}ص)' }, sol: m === 1 ? [g, k] : [g, k, m],
      ok: x => x[0] === g && x[1] === k && (m === 1 || x[2] === m), hint: 'العامل المشترك الأكبر خارج القوس، وإشارة الطرح تبقى داخله.', bad: () => '', good: 'أحسنت!',
      data: { parts: [k, m + 1], areas: [[N(a)], [T(b, 'ص')]], lens: [[N(k)], [T(m, 'ص')]], fac: [N(g)] } }; }
  if (i === 2) { const g = R(2, 6), m = R(2, 5), a = g, b = g * m;
    return { q: `حلّل إلى عوامل: ${ex([a, 'ل'], [b, 'ل م'])}`, input: { type: 'blanks', tpl: g === 1 ? 'ل({} + {}م)' : '{}ل(١ + {}م)' }, sol: [g, m], ok: x => x[0] === g && x[1] === m,
      hint: 'الحدّان فيهما الحرف ل والعدد نفسه: أخرجهما معاً خارج القوس.', bad: x => x[0] === g && x[1] === b ? 'اقسم الحد الثاني كله على العامل المشترك.' : '', good: `أحسنت! ${N(g)}ل(١ + ${N(m)}م)`,
      data: { parts: [1.4, m + 1], areas: [[T(a, 'ل')], [T(b, 'ل م')]], lens: [['١'], [T(m, 'م')]], fac: [T(g, 'ل')] } }; }
  if (i === 3) { const k = R(2, 9);
    return { q: `حلّل إلى عوامل: ${pw('س', 2)} − ${N(k)}س`, input: { type: 'blanks', tpl: 'س(س − {})' }, sol: [k], ok: x => x[0] === k,
      hint: 'ما الحرف المشترك بين الحدين؟ اقسم كل حد عليه.', bad: x => x[0] === k * k ? 'اقسم ' + N(k) + 'س على س.' : '', good: 'أحسنت! تحقّق: س × س = س أسّها ٢.',
      data: { parts: [3, k], areas: [[{ b: 'س', e: N(2) }], [`${N(k)}س`]], lens: [['س'], [N(k)]], fac: ['س'] } }; }
  // تحليل ناقص: أُخرج عامل مشترك غير الأكبر
  const G = R(2, 4) * 2, k = R(2, 5), m = [1, 3, 5, 7].filter(x => gcd(x, k) === 1)[R(0, 1)], a = G * k, b = G * m, part = G / 2, full = R(0, 1);
  const shown = full ? [G, k, m] : [part, 2 * k, 2 * m], opts = shuffle(['التحليل صحيح وكامل', 'صحيح لكنه غير كامل: يمكن إخراج عامل أكبر', 'خاطئ: الفك لا يعطي العبارة الأصلية']);
  const right = full ? 'التحليل صحيح وكامل' : 'صحيح لكنه غير كامل: يمكن إخراج عامل أكبر';
  return { q: `حلّلت لينا: ${ex([a, 'س'], [b])} = ${N(shown[0])}(${ex([shown[1], 'س'], [shown[2]])}). ما رأيك؟`, input: { type: 'pick', opts }, ok: x => opts[x] === right,
    hint: 'افكك القوس للتحقق، ثم انظر: هل بقي عامل مشترك بين الحدين داخل القوس؟', bad: () => '', good: full ? 'أحسنت! التحليل كامل.' : `أحسنت! التحليل الكامل ${N(G)}(${ex([k, 'س'], [m])}).`,
    data: { err: [`${T(a, 'س')} + ${N(b)} = ${N(shown[0])}(${T(shown[1], 'س')} + ${N(shown[2])})`] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [g, m] = fresh(() => [R(2, 9), [1, 3, 5, 7][R(0, 3)]]); items.push(choice(`${ex([g, 'س'], [g * m])} =`, `${N(g)}(س + ${N(m)})`, [`${N(g)}(س + ${N(g * m)})`, `س(${N(g)} + ${N(g * m)})`, `${N(g * m)}(س + ${N(g)})`], 'العامل المشترك الأكبر خارج القوس.', '8Ae5')); }
  { const [a, b] = fresh(() => [R(2, 6) * 2, R(1, 5) * 2 + 1]); const g = gcd(a, b * 2); items.push(num(`ما العامل المشترك الأكبر للحدين ${N(a)}س و${N(b * 2)}؟`, g, 'أكبر عدد يقسم المعاملين.', '8Ae5')); }
  { const [k] = fresh(() => [R(2, 9)]); items.push(choice(`${pw('ص', 2)} + ${N(k)}ص =`, `ص(ص + ${N(k)})`, [`ص(${N(k)}ص)`, `${N(k)}(${pw('ص', 2)} + ص)`, `ص(ص + ${N(k)}ص)`], 'الحرف المشترك ص.', '8Ae5')); }
  items.push(tf('٦س + ٩ = ٣(٢س + ٣)', true, 'افكك القوس للتحقق.', '8Ae5', '٣ × ٢س = ٦س، ٣ × ٣ = ٩.'));
  items.push(tf('التحليل ١٢س + ١٨ = ٢(٦س + ٩) تحليل كامل.', false, 'هل بقي عامل مشترك داخل القوس؟', '8Ae5', 'التحليل الكامل ٦(٢س + ٣).'));
  items.push(choice('التحليل إلى عوامل هو عكس:', 'فك الأقواس', ['حل المعادلة', 'التعويض', 'تبسيط الكسر'], 'ماذا نفعل حين نضرب ما خارج القوس في ما داخله؟', '8Ae5'));
  { const [g, m] = fresh(() => [R(2, 6), R(2, 6)]); items.push(choice(`${N(g)}ل + ${N(g * m)}ل م =`, `${N(g)}ل(١ + ${N(m)}م)`, [`${N(g)}(ل + ${N(m)}م)`, `ل(${N(g)} + ${N(m)}م)`, `${N(g)}ل(${N(m)}م)`], 'العامل المشترك فيه عدد وحرف.', '8Ae5')); }
  { const [k] = fresh(() => [R(2, 9)]); items.push(num(`${pw('س', 2)} − ${N(k)}س = س(س − ؟)`, k, 'اقسم الحد الثاني على س.', '8Ae5')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'صانعة الصناديق', icon: '📦', who, rounds: 5, make, draw,
  intro: ['أصنع كل صندوق من لوحين متجاورين لهما الارتفاع نفسه.', 'أعرف مساحة اللوحين فقط… فما الارتفاع المشترك؟ هذا هو التحليل إلى عوامل!'],
  outro: ['عرفتَ الارتفاع المشترك لكل الصناديق.', 'لنختبر التحليل بأسئلة متنوعة.'],
  challenge: { title: 'تحدي التحليل إلى عوامل', make: challenge }
});
export { make, challenge };
