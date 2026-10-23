// ١-١ الأعداد الموجهة — «مصعد المنجم»: مقطع في بئر المنجم، السطح صفر، والبرج فوقه موجب والطوابق تحته سالبة.
// الجولات: صعود ونزول (جمع)، المسافة بين طابقين (طرح السالب)، نزول متكرر (ضرب)، رحلات متساوية (قسمة)، وحرارة الأعماق (أعداد عشرية سالبة).
// التحدي: ٨ أسئلة جديدة في كل مرة من مخرجات الدرس (الكتاب ص١٥–١٨).
import { mission } from '../../mission.js';
import { N, P, R, R1, eq } from '../../math.js';
import { choice, num, tf, order } from '../../../missions/challenge.js';

const who = { name: 'المنقّب صالح', face: '👷🏽‍♂️', id: 'saleh' };
const TOP = 4, BOT = -10;   // البرج حتى ٤ والبئر حتى ١٠−

/* المشهد: مقطع واضح في المنجم — سماء فوق السطح، طبقات الأرض تحته، البرج والبئر والقفص، وخط أعداد رأسي كبير بجانبه.
   الأرقام تُكتب بخطوة تناسب ارتفاع المشهد فلا تتداخل، وشارة بجانب القفص تقول طابقه الحالي. */
function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : { from: 0 }, y0 = 30, y1 = h - 16, yOf = v => y0 + (TOP - v) / (TOP - BOT) * (y1 - y0), gap = (y1 - y0) / (TOP - BOT);
  const sx = w * .42, nx = sx + 120, step = gap < 17 ? 2 : 1, fs = Math.max(13, Math.min(18, gap * .8));
  g.direction = 'rtl';
  // السماء والسطح
  const sky = g.createLinearGradient(0, 0, 0, yOf(0)); sky.addColorStop(0, '#9FD3F5'); sky.addColorStop(1, '#DDF0FB'); g.fillStyle = sky; g.fillRect(0, 0, w, yOf(0));
  g.fillStyle = '#FFE08A'; g.beginPath(); g.arc(w * .85, yOf(TOP) + 6, 16, 0, 7); g.fill();
  // طبقات الأرض بألوان تتدرج مع العمق
  for (let v = 0; v > BOT; v--) { const k = -v / -BOT; g.fillStyle = `rgb(${Math.round(176 - k * 90)},${Math.round(126 - k * 70)},${Math.round(84 - k * 45)})`; g.fillRect(0, yOf(v), w, yOf(v - 1) - yOf(v) + 1); }
  g.fillStyle = '#6BAA3E'; g.fillRect(0, yOf(0) - 6, w, 7);
  // البرج فوق السطح
  g.strokeStyle = '#7A4A2A'; g.lineWidth = 4; g.beginPath(); g.moveTo(sx - 38, yOf(0)); g.lineTo(sx - 12, yOf(TOP) + 8); g.lineTo(sx + 12, yOf(TOP) + 8); g.lineTo(sx + 38, yOf(0)); g.stroke();
  g.lineWidth = 2.5; for (let v = 1; v < TOP; v++) { const k = 38 - 26 * v / TOP; g.beginPath(); g.moveTo(sx - k, yOf(v)); g.lineTo(sx + k, yOf(v)); g.stroke(); }
  g.fillStyle = '#C08A2E'; g.beginPath(); g.arc(sx, yOf(TOP) + 8, 9, 0, 7); g.fill();
  // البئر
  g.fillStyle = '#2B2118'; g.fillRect(sx - 28, yOf(0), 56, y1 - yOf(0));
  g.strokeStyle = '#8B5A33'; g.lineWidth = 2; for (let v = 0; v >= BOT; v--) { g.beginPath(); g.moveTo(sx - 28, yOf(v)); g.lineTo(sx + 28, yOf(v)); g.stroke(); }
  // أسماء أجزاء المكان
  g.font = '800 15px Cairo'; g.textAlign = 'right'; g.textBaseline = 'middle';
  const tag = (txt, x, y, bg, fg) => { const tw = g.measureText(txt).width + 16; g.fillStyle = bg; g.beginPath(); g.roundRect(x - tw, y - 13, tw, 26, 9); g.fill(); g.fillStyle = fg; g.fillText(txt, x - 8, y + 1); };
  tag('برج المنجم', sx - 150, yOf(TOP / 2), '#FFFFFFDD', '#7A4A2A');
  tag('سطح الأرض = ٠', sx - 150, yOf(0), '#6BAA3E', '#fff');
  tag('بئر المنجم', sx - 150, yOf(BOT / 2), '#00000055', '#FFE7C2');
  // خط الأعداد الرأسي: الموجب فوق والسالب تحت، بخطوة لا تتداخل
  g.strokeStyle = '#1E2433'; g.lineWidth = 3; g.beginPath(); g.moveTo(nx, yOf(TOP)); g.lineTo(nx, yOf(BOT)); g.stroke();
  g.font = `800 ${fs}px Cairo`; g.textAlign = 'left';
  for (let v = TOP; v >= BOT; v--) {
    const yy = yOf(v), big = v % step === 0; g.fillStyle = '#1E2433'; g.fillRect(nx - (big ? 8 : 4), yy - 1.5, big ? 16 : 8, 3);
    if (!big) continue; const txt = N(v), tw = g.measureText(txt).width;
    g.fillStyle = v === 0 ? '#FFE08A' : '#FFFFFFE6'; g.beginPath(); g.roundRect(nx + 12, yy - fs * .7, tw + 12, fs * 1.4, 7); g.fill();
    g.fillStyle = v > 0 ? '#1D4ED8' : v < 0 ? '#B91C1C' : '#1E2433'; g.direction = 'ltr'; g.fillText(txt, nx + 18, yy + 1); g.direction = 'rtl';
  }
  // سهم العملية حين يُعرض
  if (r.arrow && S.done) {   // يُرسم بعد الحل فقط: قبل ذلك يكشف الجواب
    const a = yOf(r.arrow[0]), b = yOf(r.arrow[1]), x = sx + 48; g.strokeStyle = '#F59E0B'; g.lineWidth = 4; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(x, a); g.lineTo(x, b); g.stroke(); g.setLineDash([]); g.fillStyle = '#F59E0B'; g.beginPath(); g.moveTo(x - 9, b + (b > a ? -12 : 12)); g.lineTo(x + 9, b + (b > a ? -12 : 12)); g.lineTo(x, b); g.fill(); }
  // القفص: يتحرك بنعومة نحو القيمة الحالية، وشارة طابقه بجانبه
  const want = S.r && S.r.input.type === 'dial' ? S.v : (S.done && r.answer != null ? r.answer : r.from);
  S.cy = S.cy == null ? want : S.cy + (want - S.cy) * .12;
  const cy = yOf(S.cy), ch = Math.min(34, gap * 1.6), cw = 44;
  g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, yOf(TOP) + 8); g.lineTo(sx, cy - ch / 2); g.stroke();
  g.fillStyle = '#E9EDF3'; g.fillRect(sx - cw / 2, cy - ch / 2, cw, ch); g.strokeStyle = '#475569'; g.lineWidth = 3; g.strokeRect(sx - cw / 2, cy - ch / 2, cw, ch);
  g.lineWidth = 2; for (let k = -14; k <= 14; k += 7) { g.beginPath(); g.moveTo(sx + k, cy - ch / 2 + 3); g.lineTo(sx + k, cy + ch / 2 - 3); g.stroke(); }
  g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(sx, cy - ch / 4, 4, 0, 7); g.fill();
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 5; g.strokeRect(sx - cw / 2 - 8 - (1 - S.pulse) * 10, cy - ch / 2 - 8 - (1 - S.pulse) * 10, cw + 16 + (1 - S.pulse) * 20, ch + 16 + (1 - S.pulse) * 20); }
  const lv = Math.round(S.cy), bt = `الطابق ${N(lv)}`; g.font = '900 16px Cairo'; g.textAlign = 'right'; const bw = g.measureText(bt).width + 20;
  g.fillStyle = '#1D4ED8'; g.beginPath(); g.roundRect(sx - cw / 2 - 10 - bw, cy - 15, bw, 30, 10); g.fill(); g.fillStyle = '#fff'; g.fillText(bt, sx - cw / 2 - 20, cy + 1);
  // لوحات الحرارة في جولة الأعماق
  if (r.temps) { g.font = '800 16px Cairo'; g.textAlign = 'center'; r.temps.forEach((v, k) => { const yy = yOf(-2 - k * 2), x = w * .82; g.fillStyle = '#FFFFFFE6'; g.beginPath(); g.roundRect(x - 50, yy - 15, 100, 30, 9); g.fill(); g.fillStyle = v < 0 ? '#1D4ED8' : '#C2410C'; g.fillText(`🌡️ ${N(v)}°`, x, yy + 1); }); }
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
    return { q: `يعمل عامل في الطابق <b>${N(a)}</b> من البرج، وزميله في الطابق <b>${N(b)}</b>. كم طابقاً بينهما؟`,
      input: { type: 'num' }, ok: v => v === d, hint: 'كم طابقاً من الأول إلى السطح؟ وكم طابقاً من السطح إلى الثاني؟',
      bad: v => v === a + b ? 'طرح العدد السالب يساوي جمع معكوسه: فكّر في المسافة كاملة.' : '', data: { from: a, answer: b, arrow: [a, b] } };
  }
  if (i === 2) {   // ضرب: نزول متكرر
    const k = R(2, 3), n = R(2, k === 3 ? 3 : 4), b = -k * n;   // لا يتجاوز قاع البئر (١٠−)
    return { q: `ينزل القفص <b>${N(k)}</b> طوابق في كل رحلة، بدأ من السطح وقام بـ <b>${N(n)}</b> رحلات. أين يصل؟`,
      input: { type: 'dial', start: 0, min: BOT, max: TOP, show: v => N(v), label: '🛗 أوقف القفص هنا' }, ok: v => v === b,
      hint: 'كم طابقاً ينزل في الرحلات كلها معاً؟ وفي أي جهة من السطح يكون؟', bad: v => v === -b ? 'العدد صحيح لكن الإشارة: هل القفص فوق السطح أم تحته؟' : '', data: { from: 0, answer: b, arrow: [0, b] } };
  }
  if (i === 3) {   // قسمة: رحلات متساوية
    const n = R(2, 4), k = R(2, 3), b = -n * k;
    return { q: `نزل القفص من السطح إلى الطابق <b>${N(b)}</b> في <b>${N(n)}</b> رحلات متساوية. كم تغيّر رقم الطابق في كل رحلة؟`,
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
