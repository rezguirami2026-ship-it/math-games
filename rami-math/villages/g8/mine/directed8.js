// ١-١ الأعداد الموجهة — «مصعد المنجم»: مقطع في بئر المنجم، السطح صفر، والبرج فوقه موجب والطوابق تحته سالبة.
// الجولات: صعود ونزول (جمع)، المسافة بين طابقين (طرح السالب)، نزول متكرر (ضرب)، رحلات متساوية (قسمة)، وحرارة الأعماق (أعداد عشرية سالبة).
// التحدي: ٨ أسئلة جديدة في كل مرة من مخرجات الدرس (الكتاب ص١٥–١٨).
import { mission } from '../../mission.js';
import { N, P, R, R1, eq } from '../../math.js';
import { choice, num, tf, order } from '../../../missions/challenge.js';

const who = { name: 'المنقّب صالح', face: '👷🏽‍♂️', id: 'saleh' };
const TOP = 4, BOT = -10;   // البرج حتى ٤ والبئر حتى ١٠−

/* المشهد: البئر والطوابق وخط الأعداد الرأسي، والقفص عند S.v (أو عند موضع الجولة) */
function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : { from: 0 }, y0 = 18, y1 = h - 14, yOf = v => y0 + (TOP - v) / (TOP - BOT) * (y1 - y0), sx = w * .5;
  // الأرض: سماء فوق السطح وصخر تحته بطبقات
  const sky = g.createLinearGradient(0, 0, 0, yOf(0)); sky.addColorStop(0, '#16223F'); sky.addColorStop(1, '#3B4C7A'); g.fillStyle = sky; g.fillRect(0, 0, w, yOf(0));
  for (let v = 0; v > BOT; v--) { g.fillStyle = v % 2 ? '#2A221C' : '#30271F'; g.fillRect(0, yOf(v), w, yOf(v - 1) - yOf(v) + 1); }
  g.fillStyle = '#5B7F3A'; g.fillRect(0, yOf(0) - 4, w, 5);
  // البرج فوق السطح
  g.strokeStyle = '#8C8F96'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx - 34, yOf(0)); g.lineTo(sx - 10, yOf(TOP) + 6); g.lineTo(sx + 10, yOf(TOP) + 6); g.lineTo(sx + 34, yOf(0)); g.stroke();
  for (let v = 1; v < TOP; v++) { g.beginPath(); g.moveTo(sx - 34 + 24 * v / TOP, yOf(v)); g.lineTo(sx + 34 - 24 * v / TOP, yOf(v)); g.stroke(); }
  g.fillStyle = '#B88A2E'; g.beginPath(); g.arc(sx, yOf(TOP) + 6, 8, 0, 7); g.fill();
  // البئر
  g.fillStyle = '#0B0A08'; g.fillRect(sx - 26, yOf(0), 52, y1 - yOf(0));
  g.strokeStyle = '#6A4428'; g.lineWidth = 2; for (let v = 0; v >= BOT; v--) { g.beginPath(); g.moveTo(sx - 26, yOf(v)); g.lineTo(sx + 26, yOf(v)); g.stroke(); }
  // خط الأعداد الرأسي على اليمين (أرقام هندية، والسالب «٣−»)
  const nx = w * .5 + 70; g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(nx, yOf(TOP)); g.lineTo(nx, yOf(BOT)); g.stroke();
  g.font = '700 13px Cairo'; g.textAlign = 'left'; g.textBaseline = 'middle';
  for (let v = TOP; v >= BOT; v--) { g.fillStyle = v === 0 ? '#FFD27A' : v > 0 ? '#BFD4FF' : '#E8C9A8'; g.fillRect(nx - 5, yOf(v) - 1, 10, 2); g.fillText(N(v), nx + 10, yOf(v)); }
  g.fillStyle = '#FFD27A'; g.font = '800 12px Cairo'; g.textAlign = 'right'; g.fillText('السطح', sx - 40, yOf(0) - 10);
  // سهم العملية (من نقطة البداية إلى الهدف) حين تُعرض
  if (r.arrow) { const a = yOf(r.arrow[0]), b = yOf(r.arrow[1]), x = sx - 60; g.strokeStyle = '#FFC94A'; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(x, a); g.lineTo(x, b); g.stroke(); g.setLineDash([]); g.fillStyle = '#FFC94A'; g.beginPath(); g.moveTo(x - 7, b + (b > a ? -10 : 10)); g.lineTo(x + 7, b + (b > a ? -10 : 10)); g.lineTo(x, b); g.fill(); }
  // الحبل والقفص: يتحرك بنعومة نحو القيمة الحالية
  const want = S.r && S.r.input.type === 'dial' ? S.v : (S.done && r.answer != null ? r.answer : r.from);
  S.cy = S.cy == null ? want : S.cy + (want - S.cy) * .12;
  const cy = yOf(S.cy);
  g.strokeStyle = '#9A9A9A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, yOf(TOP) + 6); g.lineTo(sx, cy - 16); g.stroke();
  g.fillStyle = '#4A4E58'; g.fillRect(sx - 20, cy - 16, 40, 30); g.strokeStyle = '#C9CCD3'; g.lineWidth = 2; g.strokeRect(sx - 20, cy - 16, 40, 30);
  for (let k = -12; k <= 12; k += 8) { g.beginPath(); g.moveTo(sx + k, cy - 14); g.lineTo(sx + k, cy + 12); g.stroke(); }
  g.fillStyle = '#FFC46B'; g.beginPath(); g.arc(sx, cy - 6, 3.5 + Math.sin(t * 8) * .5, 0, 7); g.fill();
  if (S.pulse > 0) { g.strokeStyle = `rgba(74,222,128,${S.pulse})`; g.lineWidth = 4; g.strokeRect(sx - 24 - (1 - S.pulse) * 10, cy - 20 - (1 - S.pulse) * 10, 48 + (1 - S.pulse) * 20, 38 + (1 - S.pulse) * 20); }
  // لوحة الحرارة في جولة الأعماق
  if (r.temps) { g.font = '800 13px Cairo'; g.textAlign = 'center'; r.temps.forEach((v, k) => { const yy = yOf(-2 - k * 2); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(sx - 150, yy - 12, 70, 24); g.fillStyle = v < 0 ? '#9FD6FF' : '#FFB38A'; g.fillText(`🌡️ ${N(v)}°`, sx - 115, yy); }); }
}

/* الجولات: أعداد جديدة لكل جولة */
function make(i) {
  if (i === 0) {   // جمع: صعود أو نزول من طابق سالب أو موجب
    const a = R(-6, 2, true), up = Math.random() < .5, k = R(3, 7), b = a + (up ? k : -k);
    if (b > TOP || b < BOT) return make(0);
    return { q: `القفص عند الطابق <b>${N(a)}</b>، ثم ${up ? 'صعد' : 'نزل'} <b>${N(k)}</b> طوابق. حرّك القفص إلى حيث يتوقف.`,
      input: { type: 'dial', start: a, min: BOT, max: TOP, show: v => N(v), label: '🛗 أوقف القفص هنا' }, ok: v => v === b,
      hint: up ? 'حين يصعد القفص، هل يكبر رقم الطابق أم يصغر؟ وكم خطوة يقطع؟' : 'حين ينزل القفص تحت السطح، هل يبتعد عن الصفر أم يقترب؟ وكم خطوة يقطع؟',
      bad: v => v === a - (up ? k : -k) ? 'هذا عكس الاتجاه.' : '', data: { from: a, answer: b, arrow: [a, b] } };
  }
  if (i === 1) {   // طرح عدد سالب: المسافة بين طابق موجب وطابق سالب
    const a = R(1, 4), b = -R(3, 9), d = a - b;
    return { q: `يعمل عامل في الطابق <b>${N(a)}</b> من البرج، وزميله في الطابق <b>${N(b)}</b>. كم طابقاً بينهما؟<br><small>(${N(a)} − ${P(b)})</small>`,
      input: { type: 'num' }, ok: v => v === d, hint: 'كم طابقاً من الأول إلى السطح؟ وكم طابقاً من السطح إلى الثاني؟',
      bad: v => v === a + b ? 'طرح العدد السالب يساوي جمع معكوسه: فكّر في المسافة كاملة.' : '', data: { from: a, answer: b, arrow: [a, b] } };
  }
  if (i === 2) {   // ضرب: نزول متكرر
    const k = R(2, 3), n = R(2, k === 3 ? 3 : 4), b = -k * n;   // لا يتجاوز قاع البئر (١٠−)
    return { q: `ينزل القفص <b>${N(k)}</b> طوابق في كل رحلة، بدأ من السطح وقام بـ <b>${N(n)}</b> رحلات. أين يصل؟<br><small>(${N(n)} × ${P(-k)})</small>`,
      input: { type: 'dial', start: 0, min: BOT, max: TOP, show: v => N(v), label: '🛗 أوقف القفص هنا' }, ok: v => v === b,
      hint: 'كم طابقاً ينزل في الرحلات كلها معاً؟ وفي أي جهة من السطح يكون؟', bad: v => v === -b ? 'العدد صحيح لكن الإشارة: هل القفص فوق السطح أم تحته؟' : '', data: { from: 0, answer: b, arrow: [0, b] } };
  }
  if (i === 3) {   // قسمة: رحلات متساوية
    const n = R(2, 4), k = R(2, 3), b = -n * k;
    return { q: `نزل القفص من السطح إلى الطابق <b>${N(b)}</b> في <b>${N(n)}</b> رحلات متساوية. كم تغيّر رقم الطابق في كل رحلة؟<br><small>(${P(b)} ÷ ${N(n)})</small>`,
      input: { type: 'num', neg: true }, ok: v => v === -k, hint: 'التغيّر نزول: هل يكون موجباً أم سالباً؟ وما العدد الذي إذا ضربته في عدد الرحلات أعطاك الطابق الأخير؟',
      bad: v => v === k ? 'المقدار صحيح، لكن النزول تغيّر سالب.' : '', data: { from: 0, answer: b, arrow: [0, b] } };
  }
  // حرارة الأعماق: متوسط أربع قراءات عشرية فيها سالب (الكتاب: الوسط الحسابي لدرجات الحرارة)
  for (let k = 0; k < 60; k++) {
    const temps = [R1(0.5, 3), -R1(0.5, 4), R1(0.5, 2.5), -R1(1, 4)], s = temps.reduce((a, b) => a + b, 0), m = s / 4;
    if (eq(m * 10, Math.round(m * 10)) && !eq(m, 0)) return { q: `قرأ المنقّب الحرارة في أربعة طوابق: ${temps.map(v => `<b>${N(v)}°</b>`).join(' و')}. ما الوسط الحسابي لدرجات الحرارة؟`,
      input: { type: 'num', neg: true, dot: true }, ok: v => eq(v, m), hint: 'ما مجموع القراءات الأربع (انتبه للسالبة)؟ ثم على كم تقسم المجموع؟',
      bad: v => eq(v, s) ? 'هذا هو المجموع: بقيت خطوة واحدة.' : '', data: { from: 0, temps } };
  }
  return make(0);
}

/* التحدي: أسئلة متنوعة بأعداد جديدة لا تتكرر بين الجولات */
function challenge() {
  const used = new Set(), pick = f => { for (let k = 0; k < 50; k++) { const v = f(); const key = JSON.stringify(v); if (!used.has(key)) { used.add(key); return v; } } return f(); };
  const items = [];
  { const [a, b] = pick(() => [-R(3, 9), R(2, 8)]); items.push(num(`احسب: <b>${P(a)} + ${N(b)}</b>`, a + b, 'على خط الأعداد: من أين تبدأ؟ وفي أي اتجاه تتحرك حين تجمع عدداً موجباً؟', '8Nc4', { neg: true })); }
  { const [a, b] = pick(() => [R(-5, 6, true), -R(2, 9)]); items.push(num(`احسب: <b>${P(a)} − ${P(b)}</b>`, a - b, 'طرح العدد السالب يساوي جمع معكوسه: ما معكوس العدد المطروح؟', '8Nc4', { neg: true })); }
  { const [a, b] = pick(() => [-R(2, 9), R(2, 9)]); items.push(num(`احسب: <b>${P(a)} × ${N(b)}</b>`, a * b, 'إشارتان مختلفتان في الضرب: هل الناتج موجب أم سالب؟ ثم اضرب المقدارين.', '8Nc4', { neg: true })); }
  { const [q, b] = pick(() => [R(2, 9), -R(2, 9)]); items.push(num(`احسب: <b>${P(q * b)} ÷ ${P(b)}</b>`, q, 'إشارتان متطابقتان في القسمة: ماذا تكون إشارة الناتج؟', '8Nc4', { neg: true })); }
  { const [a, b] = pick(() => [R1(1, 6), -R1(2, 9)]); items.push(num(`احسب: <b>${N(a)} + ${P(b)}</b>`, Math.round((a + b) * 10) / 10, 'أيهما أبعد عن الصفر؟ إشارته هي إشارة الناتج، ثم اطرح الأصغر من الأكبر.', '8Nc4', { neg: true, dot: true })); }
  { const [b, s] = pick(() => [-R1(1, 5), R(1, 6)]); items.push(num(`أوجد العدد المفقود: <b>□ + ${N(s)} = ${N(Math.round((b + s) * 10) / 10)}</b>`, b, 'أي عملية تعكس الجمع؟ طبّقها على الطرفين.', '8Nc4', { neg: true, dot: true })); }
  { const n = pick(() => R(2, 4)), neg = n % 2 === 1;
    items.push(choice(`ما إشارة ناتج ضرب <b>${N(n + 1)}</b> أعداد سالبة؟`, (n + 1) % 2 ? 'سالب' : 'موجب', [(n + 1) % 2 ? 'موجب' : 'سالب', 'صفر'], 'كل عددين سالبين ناتج ضربهما موجب: كم زوجاً لديك، وهل يبقى عدد وحده؟', '8Nc4')); }
  { const vals = pick(() => [-R1(1, 4), R(-3, -1), R1(0.5, 3), 0, -R1(4, 6)]);
    items.push(order('رتّب درجات حرارة الطوابق من الأبرد إلى الأدفأ:', vals.map(v => ({ v, label: `${N(v)}°` })), (a, b) => a.v - b.v, 'أي العددين السالبين أبعد عن الصفر؟ الأبعد هو الأبرد.', '8Nc4')); }
  return items.sort(() => Math.random() - .5).slice(0, 8);
}

export default mission({
  title: 'مصعد المنجم', icon: '🛗', who, rounds: 5, make, draw,
  intro: ['أهلاً بك في منجم الأعماق! سطح الأرض عندنا هو الصفر.', 'طوابق البرج فوق السطح موجبة، وطوابق البئر تحته سالبة. ساعدني في تشغيل المصعد.'],
  outro: ['ممتاز! صرتَ تتحرك بين الموجب والسالب كأنك منقّب قديم.', 'قبل أن تنزل إلى كهف البلّور، أجب عن أسئلة المصعد.'],
  challenge: { title: 'تحدي الأعداد الموجهة', make: challenge }
});

export { make, challenge };   // للفحص الآلي (tests/fuzz-villages.mjs)
