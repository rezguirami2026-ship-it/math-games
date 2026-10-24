// ٥-٤ التعويض في العبارات الجبرية — «مرصد النجوم»: على الأسطرلاب الكبير أقراص تحمل قيم الحروف (موجبة وسالبة)، والفلكي هلال
// يحتاج قيمة كل عبارة ليضبط المرصد. التعويض بترتيب العمليات: الأقواس، ثم الأسس، ثم الضرب والقسمة، ثم الجمع والطرح.
// التحدي: ٨ أسئلة من 8Ae8 (الكتاب ص٨٥–٨٧).
import { mission } from '../../mission.js';
import { N, P, R, pw, fr, ex } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { star, say, GOLD } from './art.js';

const who = { name: 'الفلكي هلال', face: '👨🏽‍🔬', id: 'hilal' };
const nz = (a, b) => R(a, b, true);

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {};
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#0B1E3F'); sky.addColorStop(1, '#1E3A5F'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 40; k++) { const x = (k * 97) % w, y = (k * 53) % (h * .6), tw = .5 + Math.sin(t * 2 + k) * .5; g.fillStyle = `rgba(255,255,255,${.3 + tw * .6})`; g.fillRect(x, y, 2, 2); }
  // الأسطرلاب: حلقة نحاسية وأقراص القيم
  const cx = w * .3, cy = h * .52, R0 = Math.min(w, h) * .32;
  g.strokeStyle = GOLD; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R0 * .7, 0, 7); g.stroke();
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R0 * .88, cy + Math.sin(a) * R0 * .88); g.lineTo(cx + Math.cos(a) * R0, cy + Math.sin(a) * R0); g.stroke(); }
  g.save(); g.translate(cx, cy); g.rotate(t * .15); g.strokeStyle = '#FDE68A'; g.lineWidth = 3; g.beginPath(); g.moveTo(-R0 * .8, 0); g.lineTo(R0 * .8, 0); g.stroke(); g.restore();
  star(g, cx, cy, 10, '#FDE68A');
  (r.vals || []).forEach(([v, val], k) => { const x = w * .66 + (k % 2) * w * .18, y = h * .24 + Math.floor(k / 2) * h * .2; g.fillStyle = '#1E293B'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke();
    say(g, `${v} = ${N(val)}`, x, y + 6, 17, '#FDE68A'); });
  if (S.done && r.ans != null) say(g, `القيمة = ${N(r.ans)} ✓`, w * .75, h * .88, 20, '#86EFAC');
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i === 0) { const a = R(2, 7), b = R(2, 7), l = nz(-6, 8), m = R(-6, -2), ans = a * l - b * m;
    return { q: `عوّض: ${ex([a, 'ل'], [-b, 'م'])} عندما ل = ${N(l)}، م = ${N(m)}.`, input: { type: 'num', neg: true }, ok: v => v === ans,
      hint: `اضرب أولاً، ثم انتبه: طرح عدد سالب يساوي جمع…؟`, bad: v => v === a * l + b * m ? 'طرح العدد السالب: هل يصير جمعاً أم طرحاً؟' : '', good: `أحسنت! ${N(a)} × ${P(l)} − ${N(b)} × ${P(m)} = ${N(ans)}`, data: { vals: [['ل', l], ['م', m]], ans } }; }
  if (i === 1) { const a = R(2, 4), b = R(1, 3), x = R(-5, -2), y = R(1, 3), ans = a * x * x - b * y ** 3;
    return { q: `عوّض: ${ex([a, 'س', 2], [-b, 'ص', 3])} عندما س = ${N(x)}، ص = ${N(y)}.`, input: { type: 'num', neg: true }, ok: v => v === ans,
      hint: 'الأسس قبل الضرب: كم يساوي مربع عدد سالب؟', bad: v => v === -a * x * x - b * y ** 3 ? 'مربع العدد السالب موجب.' : v === a * 2 * x - b * y ** 3 ? 'س أسّها ٢ تعني س × س، لا ٢ × س.' : '', good: `أحسنت! ${P(x)} أسّها ٢ = ${N(x * x)}.`, data: { vals: [['س', x], ['ص', y]], ans } }; }
  if (i === 2) { const d = R(2, 4), hh = R(-5, -1) * 2, k = R(3, 9), ans = d * (k - 4 * hh / 2);
    return { q: `عوّض: د(${N(k)} − ${fr('٤ح', 2)}) عندما د = ${N(d)}، ح = ${N(hh)}.`, input: { type: 'num', neg: true }, ok: v => v === ans,
      hint: 'ابدأ بما داخل القوس: احسب الكسر أولاً، ثم الطرح، ثم اضرب في د.', bad: v => v === d * (k + 4 * hh / 2) ? 'انتبه لإشارة الكسر حين ح سالبة.' : '', good: 'أحسنت!', data: { vals: [['د', d], ['ح', hh]], ans } }; }
  if (i === 3) { const x = R(-9, -2), sq = R(0, 1), ans = sq ? x * x : -(x * x);
    return { q: sq ? `ما قيمة ${pw('س', 2)} عندما س = ${N(x)}؟` : `ما قيمة −${pw('س', 2)} عندما س = ${N(x)}؟`, input: { type: 'num', neg: true }, ok: v => v === ans,
      hint: sq ? 'س أسّها ٢ = س × س: ما إشارة ضرب سالبين؟' : 'الأس يُطبَّق على س وحدها، ثم تأتي إشارة السالب.', bad: v => v === -ans ? 'انتبه للإشارة.' : v === 2 * x ? 'الأس ليس ضرباً في ٢.' : '', good: 'أحسنت!', data: { vals: [['س', x]], ans } }; }
  for (let k = 0; k < 80; k++) { const a = R(2, 6), b = nz(-9, 9), c = R(2, 5), p = R(-9, 9, true), q = R(2, 9), top = a * p + b; if (top % c === 0 && top !== 0) { const ans = top / c + q;
    return { q: `عوّض: ${fr(ex([a, 'ع'], [b]), c)} + ${N(q)} عندما ع = ${N(p)}.`, input: { type: 'num', neg: true }, ok: v => v === ans,
      hint: 'خط الكسر كالقوس: احسب البسط كله أولاً، ثم اقسم، ثم أضف.', bad: v => v === a * p + b / c + q ? 'البسط كله يُقسم، لا الحد الأخير وحده.' : '', good: 'أحسنت!', data: { vals: [['ع', p]], ans } }; } }
  return make(0);
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [x, y] = fresh(() => [R(-6, -1), R(2, 6)]); items.push(num(`س + ٢ص عندما س = ${N(x)}، ص = ${N(y)}`, x + 2 * y, 'اضرب أولاً ثم اجمع.', '8Ae8', { neg: true })); }
  { const [d, y] = fresh(() => [R(2, 9), R(-5, -1)]); items.push(num(`٢د − ص عندما د = ${N(d)}، ص = ${N(y)}`, 2 * d - y, 'طرح السالب جمع.', '8Ae8', { neg: true })); }
  { const [x] = fresh(() => [R(-6, -2)]); items.push(choice(`قيمة ${pw('س', 2)} عندما س = ${N(x)}:`, N(x * x), [N(-x * x), N(2 * x), N(-2 * x)], 'مربع العدد السالب موجب.', '8Ae8')); }
  { const [x] = fresh(() => [R(-4, -2)]); items.push(num(`${pw('س', 3)} عندما س = ${N(x)}`, x ** 3, 'ثلاثة أعداد سالبة مضروبة: ما الإشارة؟', '8Ae8', { neg: true })); }
  items.push(tf('عند التعويض نحسب الأسس قبل الضرب.', true, 'تذكّر ترتيب العمليات.', '8Ae8', 'الأقواس ثم الأسس ثم الضرب والقسمة ثم الجمع والطرح.'));
  items.push(tf(`إذا كانت س = ${N(-3)} فإن ٢س = ${N(-5)}.`, false, '٢س تعني ٢ × س.', '8Ae8', '٢ × (٣−) = ٦−.'));
  { const [a, b] = fresh(() => [R(2, 6), R(-6, -2)]); items.push(num(`أ × ب عندما أ = ${N(a)}، ب = ${N(b)}`, a * b, 'موجب × سالب = ؟', '8Ae8', { neg: true })); }
  { const [p, q] = fresh(() => [R(-9, -2), R(-9, -2)]); items.push(num(`ل − م عندما ل = ${N(p)}، م = ${N(q)}`, p - q, 'طرح السالب جمع الموجب.', '8Ae8', { neg: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'مرصد النجوم', icon: '🔭', who, rounds: 5, make, draw,
  intro: ['الليلة نرصد النجوم! أقراص الأسطرلاب تحمل قيم الحروف، وبعضها سالب.', 'عوّض بالقيم واحسب بترتيب العمليات، فيُضبط المرصد على النجم الصحيح.'],
  outro: ['ضُبط المرصد، وظهر النجم واضحاً في المنظار!', 'لنختبر التعويض بأسئلة متنوعة.'],
  challenge: { title: 'تحدي التعويض', make: challenge }
});
export { make, challenge };
