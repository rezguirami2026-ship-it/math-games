// ٧-٤ الاحتمالات التجريبية والنظرية — «مختبر الرمي»: سناء تبني آلة ترمي العملات وحجر النرد رمياً حقيقياً (عشوائياً في كل مرة).
// التكرار النسبي = التكرار ÷ عدد الرميات (الاحتمال التجريبي)، والاحتمال النظري من النتائج المرجحة بالتساوي، والحكم على عدالة العملة
// (الرميات القليلة لا تكفي دليلاً)، وجمع نتائج الطلاب لتقدير أوثق، والعدد المتوقع في رميات كثيرة. التحدي: ٨ أسئلة من 8Db4 (ص١٢٤–١٢٦).
import { mission } from '../../mission.js';
import { N, R, fr, gcd, fEq, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { ar } from '../../../core/util.js';
import { fairBg, say, glow, coin, face, spinner, freqBars, PINK, BLUE, GREEN } from './art.js';

const who = { name: 'سناء مهندسة المختبر', face: '🧪', id: 'sanaa' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const NAMES = ['زينب', 'راشد', 'خديجة', 'فهد', 'عائشة'];
const SCOL = [['الأحمر', PINK], ['الأزرق', BLUE], ['الأخضر', GREEN], ['الأصفر', '#EAB308']];
const times = k => k === 1 ? 'مرة واحدة' : k === 2 ? 'مرتين' : k <= 10 ? `${ar(k)} مرات` : `${ar(k)} مرة`;
const rolls = n => Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6));

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; fairBg(g, w, h, t);
  // آلة الرمي: صندوق زجاجي يهتز
  const mx = w * .17, my = h * .2, mw = w * .22, mh = h * .5, sh = S.done ? 0 : Math.sin(t * 20) * 2;
  g.fillStyle = '#5B21B6'; g.beginPath(); g.roundRect(mx - 8, my + mh, mw + 16, h * .12, 8); g.fill(); g.fillStyle = 'rgba(219,234,254,.75)'; g.strokeStyle = '#7C3AED'; g.lineWidth = 4; g.beginPath(); g.roundRect(mx + sh, my, mw, mh, 12); g.fill(); g.stroke();
  say(g, '🧪 آلة الرمي', mx + mw / 2, my + mh + h * .08, 14, '#FFFFFF');
  if (r.mode === 'coins') {
    const n = r.res.length, per = Math.ceil(Math.sqrt(n)), cs = Math.min(mw / per, mh / per) * .42;
    if (n <= 10) r.res.forEach((v, k) => coin(g, mx + mw * ((k % 3) + .5) / 3 + sh, my + cs + Math.floor(k / 3) * cs * 2.2, cs, v ? 'ص' : 'ك'));
    else { coin(g, mx + mw * .3, my + mh * .3, mw * .14, 'ص'); coin(g, mx + mw * .7, my + mh * .3, mw * .14, 'ك'); say(g, ar(r.heads), mx + mw * .3, my + mh * .65, 20, '#1E3A8A'); say(g, ar(r.res.length - r.heads), mx + mw * .7, my + mh * .65, 20, '#1E3A8A'); }
    say(g, `${ar(r.res.length)} رميات: صورة ${ar(r.heads)} · كتابة ${ar(r.res.length - r.heads)}`, w * .66, h * .3, 17, '#4C1D95');
    if (S.done && r.ans) say(g, r.ans, w * .66, h * .5, 20, GREEN);
  } else if (r.mode === 'die') {   // جدول تكرار حقيقي من رميات الآلة
    face(g, mx + mw / 2 - 26 + sh, my + mh / 2 - 26, 52, 1 + Math.floor(t * 6) % 6);
    freqBars(g, w * .46, h * .18, w * .48, h * .56, [1, 2, 3, 4, 5, 6].map(v => ar(v)), r.f, { anim: Math.min(1, S.anim * 1.4), col: '#7C3AED' });
    say(g, `${ar(r.n)} رمية لحجر النرد`, w * .7, h * .12, 16, '#4C1D95'); if (S.done && r.ans) say(g, r.ans, w * .7, h * .92, 18, GREEN);
  } else if (r.mode === 'spin') {
    spinner(g, mx + mw / 2, my + mh / 2, Math.min(mw, mh) * .42, r.secs.map(c => ''), r.secs.map(c => SCOL[c][1]), S.done ? 0 : t * 3);
    say(g, `دوّار بـ ${ar(r.secs.length)} أقسام متكافئة`, w * .66, h * .32, 17, '#4C1D95'); if (S.done) say(g, r.ans, w * .66, h * .52, 20, GREEN);
  } else if (r.mode === 'team') {   // نتائج الطلاب
    const cw = w * .5 / r.names.length; r.names.forEach((nm, k) => { const x = w * .95 - (k + 1) * cw; g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(x + 3, h * .26, cw - 6, h * .4, 10); g.fill(); say(g, nm, x + cw / 2, h * .36, 14, '#4C1D95'); say(g, ar(r.c[k]), x + cw / 2, h * .52, 22, BLUE); say(g, `من ${ar(20)}`, x + cw / 2, h * .61, 12, '#64748B'); });
    say(g, r.title, w * .7, h * .17, 15, '#4C1D95'); if (S.done) say(g, r.ans, w * .7, h * .8, 19, GREEN);
  } else if (r.mode === 'expect') {
    face(g, mx + mw / 2 - 26 + sh, my + mh / 2 - 26, 52, 6); say(g, `${ar(r.N)} رمية`, w * .66, h * .32, 22, '#4C1D95'); say(g, S.done ? `المتوقع ≈ ${ar(r.ans)} مرة` : 'كم مرة نتوقع؟', w * .66, h * .52, 19, S.done ? GREEN : '#334155');
  }
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { let n = 10, k; do k = R(1, 9); while (k === 5); const res = Array.from({ length: n }, (_, j) => j < k ? 1 : 0).sort(() => Math.random() - .5), tails = Math.random() < .4, a = (tails ? n - k : k) / n;
    return { q: `رمت آلة سناء عملة ${ar(n)} مرات فظهرت الصورة ${times(k)}. ما الاحتمال التجريبي لظهور ${tails ? 'الكتابة' : 'الصورة'}؟`, input: { type: 'num', dot: true }, ok: v => eq(v, a),
      hint: 'التكرار النسبي = عدد مرات ظهور النتيجة ÷ عدد الرميات كلها.', bad: v => eq(v, .5) ? 'هذا الاحتمال النظري: والمطلوب من نتائج التجربة نفسها.' : eq(v, 1 - a) ? 'هذا احتمال الوجه الآخر.' : eq(v, tails ? n - k : k) ? 'هذا التكرار: اقسمه على عدد الرميات.' : '',
      good: `${ar(tails ? n - k : k)} ÷ ${ar(n)} = ${N(a)}`, data: { mode: 'coins', res, heads: k, ans: `الاحتمال التجريبي = ${N(a)}` } }; }
  if (i === 1) {   // هل العملة عادلة؟
    const sc = R(0, 2), n = sc === 0 ? 10 : 100, k = sc === 0 ? pick([2, 8, 7, 3]) : sc === 1 ? pick([78, 80, 22, 81, 19]) : pick([48, 52, 47, 53]), res = Array.from({ length: n }, (_, j) => j < k ? 1 : 0);
    const opts = ['نعم: الرميات كثيرة والنتيجة بعيدة جداً عن النصف', 'لا دليل كافٍ: الرميات قليلة، ونتائج التجارب القليلة تختلف كثيراً', 'لا: النتيجة قريبة من الاحتمال النظري ٠٫٥', 'نعم: أي اختلاف عن النصف يثبت أنها غير عادلة'];
    return { q: `رُميت عملة ${ar(n)} ${n === 10 ? 'مرات' : 'مرة'} فظهرت الصورة ${times(k)}. هل هذا دليل على أن العملة غير عادلة؟`, input: { type: 'pick', opts }, ok: v => v === sc,
      hint: 'فكّر في أمرين: كم رمية؟ وكم تبعد النتيجة عن الاحتمال النظري ٠٫٥؟', bad: v => v === 3 ? 'التجارب تختلف دائماً قليلاً حتى مع العملة العادلة.' : '',
      good: ['الرميات المئة كثيرة، والنتيجة بعيدة: دليل قوي.', 'عشر رميات قليلة: قد تتكرر الصورة صدفة.', 'التجربة قريبة جداً من النظرية.'][sc], data: { mode: 'coins', res, heads: k, ans: `${N(k / n)} مقابل ${N(.5)}` } }; }
  if (i === 2) {   // رميات حقيقية لحجر النرد
    const n = pick([20, 50]), res = rolls(n), f = [1, 2, 3, 4, 5, 6].map(v => res.filter(x => x === v).length), v = pick([1, 2, 3, 4, 5, 6].filter(x => f[x - 1] > 0)), a = f[v - 1] / n;
    return { q: `رمت الآلة حجر نرد ${ar(n)} رمية، والأعمدة تبيّن تكرار كل عدد. ما التكرار النسبي للعدد ${ar(v)}؟`, input: { type: 'num', dot: true }, ok: x => eq(x, a),
      hint: 'اقرأ تكرار العدد من عموده، ثم اقسمه على عدد الرميات.', bad: x => eq(x, f[v - 1]) ? 'هذا التكرار نفسه: اقسمه على عدد الرميات.' : eq(x, Math.round(1000 / 6) / 1000) || eq(x, .17) ? 'هذا قريب من الاحتمال النظري ١ من ٦: والمطلوب من التجربة.' : '',
      good: `${ar(f[v - 1])} ÷ ${ar(n)} = ${N(a)}`, data: { mode: 'die', f, n, ans: `${ar(v)}: ${N(a)}، والنظري ≈ ${N(.167)}` } }; }
  if (i === 3) {   // الاحتمال النظري لدوّار
    const n = R(5, 8), c = R(2, n - 2), col = R(0, 3), others = [0, 1, 2, 3].filter(x => x !== col);
    const secs = Array.from({ length: n }, (_, j) => j < c ? col : pick(others)).sort(() => Math.random() - .5);
    return { q: `صنعت سناء دوّاراً بـ ${ar(n)} أقسام متكافئة، ${ar(c)} منها باللون ${SCOL[col][0]}. ما الاحتمال النظري أن يقف السهم على اللون ${SCOL[col][0]}؟`, input: { type: 'frac' }, sol: { w: 0, n: c, d: n }, ok: v => fEq(v, c, n),
      hint: 'الاحتمال النظري لا يحتاج تجربة: كم قسماً متكافئاً؟ وكم منها باللون المطلوب؟', bad: v => fEq(v, n - c, n) ? 'هذا احتمال الأقسام الأخرى.' : v && v.n === 1 && v.d === n ? 'كم قسماً باللون المطلوب؟' : '',
      good: `${fr(c, n)}`, data: { mode: 'spin', secs, ans: `النظري = ${ar(c)} من ${ar(n)}` } }; }
  if (i === 4) {   // جمع نتائج الطلاب
    const m = pick([2, 5]), names = NAMES.slice(0, m), c = names.map(() => R(8, 15)), tot = c.reduce((s, x) => s + x, 0), n = 20 * m, a = tot / n;
    return { q: `رمى كل طالب ستة أحجار نرد معاً ${ar(20)} مرة، وعدّ المرات التي ظهر فيها ٦ مرة واحدة على الأقل. اجمع نتائج ${m === 2 ? 'الطالبين' : 'الطلاب الخمسة'} لتجد تقديراً أوثق للاحتمال التجريبي.`, input: { type: 'num', dot: true }, ok: v => eq(v, a),
      hint: 'اجمع التكرارات كلها، واجمع عدد الرميات كلها، ثم اقسم.', bad: v => c.some(x => eq(v, x / 20)) ? 'هذا تقدير طالب واحد: اجمع النتائج كلها.' : eq(v, tot) ? 'هذا مجموع التكرارات: اقسمه على عدد الرميات كلها.' : eq(v, tot / 20) ? `عدد الرميات كلها ${ar(20)} × ${ar(m)}.` : '',
      good: `${ar(tot)} ÷ ${ar(n)} = ${N(a)}`, data: { mode: 'team', names, c, title: 'مرات ظهور ٦ (مرة على الأقل)', ans: `${ar(tot)} من ${ar(n)} = ${N(a)}` } }; }
  const Nn = pick([60, 120, 300, 600, 180, 240]);
  return { q: `حجر نرد عادل يُرمى ${ar(Nn)} مرة. كم مرة تقريباً نتوقع أن يظهر العدد ٦؟`, input: { type: 'num' }, ok: v => v === Nn / 6,
    hint: 'الاحتمال النظري للعدد ٦ كم؟ وكم يكون هذا الجزء من عدد الرميات كلها؟', bad: v => v === Nn / 2 ? 'النصف للعملة! لحجر النرد ستة أوجه.' : v === 6 || v === 1 ? 'المطلوب عدد مرات من الرميات كلها.' : '',
    good: `${ar(Nn)} ÷ ${ar(6)} = ${ar(Nn / 6)} (والتجربة الحقيقية تقترب منه ولا تساويه دائماً)`, data: { mode: 'expect', N: Nn, ans: Nn / 6 } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const k = fresh(() => { let x; do x = R(1, 9); while (x === 5); return x; }); items.push(num(`رُميت عملة ${ar(10)} مرات فظهرت الكتابة ${times(k)}. ما الاحتمال التجريبي لظهور الكتابة؟`, k / 10, 'التكرار ÷ عدد الرميات.', '8Db4')); }
  { const [f, n] = fresh(() => { const n = pick([20, 50]); let f; do f = R(1, 12); while (f * 100 % n); return [f, n]; }); items.push(num(`ظهر العدد ٣ في ${ar(f)} من ${ar(n)} رمية لحجر نرد. ما التكرار النسبي للعدد ٣؟`, f / n, 'التكرار النسبي = التكرار ÷ إجمالي الرميات.', '8Db4')); }
  { const Nn = fresh(() => pick([60, 120, 300, 600])); items.push(num(`حجر نرد عادل يُرمى ${ar(Nn)} مرة. العدد المتوقع لظهور ٥ تقريباً:`, Nn / 6, 'الاحتمال النظري × عدد الرميات.', '8Db4')); }
  items.push(choice('أيّ التجارب تعطي تقديراً أوثق للاحتمال؟', '٢٠٠ رمية', ['٢٠ رمية', '١٠ رميات', 'كلها متساوية'], 'كلما زاد عدد مرات التجربة…', '8Db4'));
  items.push(choice('الاحتمال النظري لظهور الصورة عند رمي عملة عادلة:', N(.5), [N(.25), N(1), N(.1)], 'وجهان مرجحان بالتساوي.', '8Db4'));
  items.push(tf('إذا كررت التجربة نفسها فقد تحصل على نتائج مختلفة.', true, 'هل تتكرر رميات النرد نفسها دائماً؟', '8Db4', 'الاحتمال التجريبي يختلف من تجربة لأخرى.'));
  items.push(tf('رمى سامي حجر نرد ٣٠٠ مرة، فيجب أن يظهر كل عدد ٥٠ مرة تماماً، وإلا فهو غير عادل.', false, 'هل التجربة تساوي النظرية تماماً؟', '8Db4', 'نتوقع قرابة ٥٠ لكل عدد، لا ٥٠ بالضبط.'));
  items.push(tf('لمعرفة احتمال أن تنبت بذرة، نحتاج إلى تجربة لا إلى نتائج مرجحة بالتساوي.', true, 'هل للإنبات نتائج مرجحة بالتساوي نعرفها مسبقاً؟', '8Db4', 'لا احتمال نظري هنا؛ التجربة تعطينا التقدير.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'مختبر الرمي', icon: '🧪', who, rounds: 6, make, draw,
  intro: ['أنا سناء. بنيت آلة ترمي العملات وحجر النرد رمياً حقيقياً، ولا أعرف نتيجتها قبل أن تقف!', 'الاحتمال النظري نعرفه من النتائج المرجحة بالتساوي، والتجريبي من نتائج التجربة: التكرار ÷ عدد الرميات. لنقارن بينهما.'],
  outro: ['رائع! عرفت أن الرميات الكثيرة تقرّب التجربة من النظرية.', 'لنختبر الاحتمالات التجريبية والنظرية بأسئلة متنوعة.'],
  challenge: { title: 'تحدي التجربة والنظرية', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
