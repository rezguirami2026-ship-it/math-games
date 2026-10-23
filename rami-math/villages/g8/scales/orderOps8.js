// ٢-٤ ترتيب العمليات — «برج المراقبة»: لوحة أوامر الرافعات في برج الميناء. كل أمر عملية حسابية، والرافعة تنفّذه بالترتيب الصحيح:
// الأقواس ثم الأسس والجذور ثم الضرب والقسمة ثم الجمع والطرح. يختار الطالب الخطوة الأولى، ويحسب، ويكتشف خطأ في دفتر المتدرّب.
// التحدي: ٨ أسئلة جديدة من مخرجي 8Nc3 و8Nc4 (الكتاب ص٤٢–٤٥).
import { mission } from '../../mission.js';
import { N, P, R, pw, fr } from '../../math.js';
import { choice, num, tf, order } from '../../../missions/challenge.js';

const who = { name: 'مراقب الميناء راشد', face: '👨🏽‍✈️', id: 'rashed' };
const STEPS = ['الأقواس', 'الأسس والجذور', 'الضرب والقسمة', 'الجمع والطرح'];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {};
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1E3A5F'); bg.addColorStop(1, '#274B74'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // النافذة الكبيرة: الميناء والرافعات في الخارج
  g.fillStyle = '#9CD3F5'; g.beginPath(); g.roundRect(w * .05, h * .06, w * .9, h * .42, 14); g.fill(); g.fillStyle = '#2B7BB9'; g.fillRect(w * .05, h * .34, w * .9, h * .14);
  for (let i = 0; i < 3; i++) { const x = w * (.22 + i * .28); g.fillStyle = '#F59E0B'; g.fillRect(x - 4, h * .12, 8, h * .26); g.fillRect(x - 4, h * .12, 70, 8); g.strokeStyle = '#374151'; g.beginPath(); g.moveTo(x + 50, h * .14); g.lineTo(x + 50, h * .24 + Math.sin(t + i) * 8); g.stroke();
    g.fillStyle = ['#E11D48', '#2563EB', '#16A34A'][i]; g.fillRect(x + 38, h * .24 + Math.sin(t + i) * 8, 24, 16); }
  // لوحة الأوامر: العملية بخط كبير وخطوات ترتيب العمليات
  g.fillStyle = '#0F172A'; g.beginPath(); g.roundRect(w * .08, h * .54, w * .84, h * .36, 16); g.fill(); g.strokeStyle = '#38BDF8'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#E0F2FE'; g.font = '900 28px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
  if (r.pwExpr) {   // القوة كما في الكتاب: الأس صغير أعلى يسار الأساس، ثم بقية العملية إلى اليسار
    const E = r.pwExpr, wb = g.measureText(E.b).width, wt = g.measureText(E.tail).width; g.font = '900 17px Cairo'; const we = g.measureText(E.e).width, tot = wb + we + wt, x0 = w / 2 + tot / 2;
    g.textAlign = 'right'; g.font = '900 28px Cairo'; g.fillText(E.b, x0, h * .66); g.font = '900 17px Cairo'; g.fillText(E.e, x0 - wb, h * .66 - 14); g.font = '900 28px Cairo'; g.fillText(E.tail, x0 - wb - we, h * .66); g.textAlign = 'center';
  } else g.fillText(r.expr || '', w / 2, h * .66);
  STEPS.forEach((s, k) => { const x = w * (.8 - k * .2), y = h * .82, lit = S.done || (r.lit != null && k <= r.lit && false);
    g.fillStyle = lit ? '#22C55E' : '#1E293B'; g.beginPath(); g.roundRect(x - w * .09, y - 16, w * .18, 30, 10); g.fill(); g.fillStyle = lit ? '#FFF' : '#94A3B8'; g.font = '800 13px Cairo'; g.fillText(`${N(k + 1)}. ${s}`, x, y + 4); });
  if (S.done && r.res != null) { g.fillStyle = '#22C55E'; g.font = '900 22px Cairo'; g.fillText(`= ${N(r.res)}`, w / 2, h * .74); }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i === 0) { const a = R(2, 9), b = R(2, 9), c = R(2, 9), v = a + b * c;
    return { q: `نفّذ أمر الرافعة: <b>${N(a)} + ${N(b)} × ${N(c)}</b>`, input: { type: 'num' }, ok: x => x === v, hint: 'أي العمليتين تأتي أولاً في الترتيب: الجمع أم الضرب؟',
      bad: x => x === (a + b) * c ? 'جمعتَ أولاً، لكن الضرب يسبق الجمع.' : '', data: { expr: `${N(a)} + ${N(b)} × ${N(c)}`, res: v } }; }
  if (i === 1) { const a = R(3, 9), b = R(2, 4), c = R(2, 9), d = R(2, 9), opts = [`${N(c)} + ${N(d)}`, `${N(b)} × ${N(c)}`, `${N(a)} − ${N(b)}`], sh = opts.map((o, j) => [Math.random(), o, j]).sort((x, y) => x[0] - y[0]);
    return { q: `في الأمر <b>${N(a)} − ${N(b)}(${N(c)} + ${N(d)})</b>: ما الخطوة التي تنفّذها الرافعة أولاً؟`, input: { type: 'pick', opts: sh.map(x => x[1]) }, ok: j => sh[j][2] === 0, hint: 'ابحث عن أول خطوة في قائمة الترتيب أسفل اللوحة: هل في الأمر أقواس؟',
      data: { expr: `${N(a)} − ${N(b)}(${N(c)} + ${N(d)})`, res: a - b * (c + d) } }; }
  if (i === 2) { const a = R(3, 9), b = R(2, 4), c = R(2, 9), d = R(2, 9), v = a - b * (c + d);
    return { q: `احسب الأمر كاملاً: <b>${N(a)} − ${N(b)}(${N(c)} + ${N(d)})</b>`, input: { type: 'num', neg: true }, ok: x => x === v, hint: 'القوس أولاً، ثم الضرب، ثم الطرح. وانتبه: قد يكون الناتج سالباً.',
      bad: x => x === (a - b) * (c + d) ? 'طرحتَ قبل الضرب.' : x === -v ? 'العدد صحيح لكن الإشارة: هل يمكن أن تطرح عدداً أكبر؟' : '', data: { expr: `${N(a)} − ${N(b)}(${N(c)} + ${N(d)})`, res: v } }; }
  if (i === 3) { const a = R(2, 4) * 2, k = 2, d = [2, 4, 8].find(x => (a * a) % x === 0 && x < a * a) || 2, v = a * a / d;
    return { q: `احسب أمر القسمة: <b>${pw(a, 2)} ÷ ${N(d)}</b>`, input: { type: 'num' }, ok: x => x === v, hint: `الأس قبل القسمة: كم يساوي ${pw(a, 2)} أولاً؟`, bad: x => x === Math.pow(a / d, 2) ? 'قسمتَ قبل حساب الأس.' : '',
      data: { pwExpr: { b: N(a), e: N(2), tail: ` ÷ ${N(d)}` }, res: v } }; }
  const a = R(20, 40), b = R(3, 6), c = R(2, 5), right = a - b * c, wrongAns = (a - b) * c;
  return { q: `كتب المتدرّب في دفتره: <b>${N(a)} − ${N(b)} × ${N(c)} = ${N(wrongAns)}</b>. ما الناتج الصحيح؟`, input: { type: 'num', neg: true }, ok: x => x === right,
    hint: 'تتبّع خطوات المتدرّب: أي عملية نفّذ أولاً؟ وأيها كان يجب أن يبدأ بها؟', bad: x => x === wrongAns ? 'هذا جواب المتدرّب نفسه، وهو خطأ.' : '', data: { expr: `${N(a)} − ${N(b)} × ${N(c)}`, res: right } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [a, b, c] = fresh(() => [R(2, 9), R(2, 9), R(2, 9)]); items.push(num(`احسب: ${N(a)} + ${N(b)} × ${N(c)}`, a + b * c, 'الضرب قبل الجمع.', '8Nc3')); }
  { const [a, b, c] = fresh(() => [R(10, 20), R(2, 5), R(2, 6)]); items.push(num(`احسب: ${N(a)} − ${N(b)} × ${N(c)}`, a - b * c, 'الضرب قبل الطرح، والناتج قد يكون سالباً.', '8Nc3', { neg: true })); }
  { const [a, b, c] = fresh(() => [R(2, 6), R(2, 9), R(2, 9)]); items.push(num(`احسب: ${N(a)}(${N(b)} + ${N(c)})`, a * (b + c), 'ما بين القوسين أولاً، ثم الضرب.', '8Nc3')); }
  { const [a, b] = fresh(() => [R(2, 5), R(2, 9)]); items.push(num(`احسب: ${pw(a, 2)} + ${N(b)}`, a * a + b, 'الأس قبل الجمع.', '8Nc3')); }
  { const [a, b] = fresh(() => [R(6, 9), R(2, 5)]); items.push(num(`احسب: (${N(a)} − ${N(b)})${'<sup>٢</sup>'}`, (a - b) * (a - b), 'القوس أولاً ثم الأس.', '8Nc3')); }
  { const [a, b, c] = fresh(() => [R(2, 9), R(2, 9), R(2, 9)]); items.push(choice(`ضع العلامة المناسبة: ${N(a)} + ${N(b)} × ${N(c)} □ (${N(a)} + ${N(b)}) × ${N(c)}`, a + b * c < (a + b) * c ? '<' : a + b * c > (a + b) * c ? '>' : '=', ['<', '>', '='].filter(x => x !== (a + b * c < (a + b) * c ? '<' : a + b * c > (a + b) * c ? '>' : '=')), 'احسب الطرفين كلاً بترتيبه الصحيح، ثم قارن.', '8Nc3')); }
  items.push(order('رتّب خطوات ترتيب العمليات من الأولى إلى الأخيرة:', STEPS.map((s, k) => ({ v: k, label: s })), (a, b) => a.v - b.v, 'ما الذي يحميه القوس؟ وأيهما أقوى: الأس أم الضرب؟', '8Nc3'));
  { const [a, b, c] = fresh(() => [R(20, 40), R(2, 5), R(2, 5)]); items.push(tf(`${N(a)} − ${N(b)} × ${N(c)} = ${N((a - b) * c)}`, (a - b) * c === a - b * c, 'هل نُفّذ الضرب قبل الطرح؟', '8Nc4', `الصحيح: ${N(a)} − ${N(b * c)} = ${N(a - b * c)}`)); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'برج المراقبة', icon: '🗼', who, rounds: 5, make, draw,
  intro: ['من هذا البرج تخرج أوامر الرافعات إلى الرصيف، وكل أمر عملية حسابية.', 'إن نفّذت الرافعة الخطوات بترتيب خاطئ وقعت الحاوية في المكان الخطأ! الترتيب مكتوب أسفل اللوحة.'],
  outro: ['أوامرك دقيقة يا مراقب! واكتشفت خطأ المتدرّب أيضاً.', 'لنختبر ترتيبك بأسئلة البرج.'],
  challenge: { title: 'تحدي ترتيب العمليات', make: challenge }
});
export { make, challenge };
