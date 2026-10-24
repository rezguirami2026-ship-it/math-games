// ٧-١ احتمال عدم حدوث نتيجة ما — «لوحة التوقعات»: مذيع المهرجان هيثم يعلّق توقعات الغد على لوحة. لكل توقع شريط احتمال من ٠ إلى ١:
// جزء «يحدث» ملوّن، والطالب يحسب جزء «لا يحدث» = ١ − الاحتمال (يحرّك الفاصل بنفسه في الجولة الأولى)، بالكسور العشرية والنسب المئوية
// والكسور، ثم نتيجة من ثلاث (فوز وخسارة وتعادل)، وجدول أعمار زوار المهرجان. التحدي: ٨ أسئلة من 8Db1 (الكتاب ص١١٦–١١٧).
import { mission } from '../../mission.js';
import { N, R, fr, gcd, fEq, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { fairBg, say, glow, probBar, BLUE, PINK } from './art.js';

const who = { name: 'مذيع المهرجان هيثم', face: '🎙️', id: 'haitham' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const pct = v => `${N(v)}٪`;
const SAME = 'هذا احتمال أن يحدث نفسه! والسؤال عن ألا يحدث.';
const EVENTS = [['أن تمطر يوم المهرجان', 'ألا تمطر'], ['أن يصل القطار الصغير في موعده', 'ألا يصل في موعده'], ['أن تمتلئ الساحة مساءً', 'ألا تمتلئ'], ['أن تهبّ ريح قوية', 'ألا تهبّ ريح قوية']];
const BUS = [['أن تصل حافلة المهرجان مبكراً', 'ألا تصل مبكراً'], ['أن يتأخر العرض أكثر من خمس دقائق', 'ألا يتأخر أكثر من خمس دقائق'], ['أن يربح زائر جائزة الكشك', 'ألا يربحها']];
const WINS = [['أن يفوز فريق القرية بمباراة الشطرنج', 'ألا يفوز'], ['أن يصيب سالم الهدف في لعبة الرماية', 'ألا يصيبه'], ['أن تصعد البالونة فوق العجلة الدوّارة', 'ألا تصعد فوقها']];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; fairBg(g, w, h, t);
  // لوحة التوقعات
  g.fillStyle = '#1E3A8A'; g.beginPath(); g.roundRect(w * .06, h * .1, w * .88, h * .8, 18); g.fill(); g.strokeStyle = '#FACC15'; g.lineWidth = 5; g.stroke();
  say(g, '📊 ' + (r.title || 'لوحة التوقعات'), w * .5, h * .22, 19, '#FDE68A');
  if (r.table) {   // جدول الأعمار: النسب مكتوبة، والمطلوب «؟»
    const cw = w * .8 / r.table.length; r.table.forEach(([lab, v], k) => { const x = w * .9 - (k + 1) * cw; g.fillStyle = r.hl && r.hl.includes(k) && S.done ? '#DCFCE7' : '#FFFFFF'; g.beginPath(); g.roundRect(x + 4, h * .32, cw - 8, h * .34, 10); g.fill();
      say(g, lab, x + cw / 2, h * .42, 14, '#334155'); say(g, pct(v), x + cw / 2, h * .58, 20, BLUE); });
    say(g, S.done ? `${r.ask} = ${r.ans}` : `${r.ask} = ؟`, w * .5, h * .8, 18, S.done ? '#86EFAC' : '#FFFFFF');
  } else {
    const bx = w * .14, bw = w * .72, by = h * .42, q = S.done ? r.q : r.dial ? S.v : null;
    probBar(g, bx, by, bw, r.p, { q, labP: r.labP, labQ: S.done ? r.labQ : r.dial ? N(S.v) : '؟', colP: PINK, colQ: BLUE });
    say(g, `${r.ev}: ${r.pTxt}`, w * .5, h * .34, 16, '#FFFFFF');
    say(g, S.done ? `${r.not}: ${r.ans}` : `${r.not}: ؟`, w * .5, h * .78, 18, S.done ? '#86EFAC' : '#FDE68A');
  }
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const [ev, not] = pick(EVENTS), p = R(1, 9) / 10;   // يحرّك الطالب فاصل الشريط بنفسه
    return { q: `احتمال ${ev} هو ${N(p)}. حرّك المؤشر إلى احتمال ${not}.`, input: { type: 'dial', min: 0, max: 1, step: .1, start: .5, show: v => N(v) }, ok: v => eq(v, 1 - p),
      hint: 'الشريط كله من ٠ إلى ١: إما أن يحدث أو لا يحدث. كم يبقى من الشريط بعد الجزء الملوّن؟', bad: v => eq(v, p) ? SAME : eq(v, 1) ? 'الاحتمال ١ يعني أنه مؤكد، لكن قد يحدث.' : '',
      good: `${N(1)} − ${N(p)} = ${N(1 - p)}`, data: { ev: 'احتمال ' + ev, not: 'احتمال ' + not, p, q: 1 - p, pTxt: N(p), labP: N(p), labQ: N(1 - p), ans: N(1 - p), dial: true, title: 'توقعات الغد' } }; }
  if (i === 1) { const [ev, not] = pick(BUS); let p; do p = R(1, 99) / 100; while (p * 100 % 10 === 0);
    return { q: `يقدّر هيثم احتمال ${ev} بـ ${N(p)}. ما احتمال ${not}؟`, input: { type: 'num', dot: true }, ok: v => eq(v, 1 - p),
      hint: 'مجموع الاحتمالين «يحدث» و«لا يحدث» يساوي كم؟', bad: v => eq(v, p) ? SAME : eq(v, 1 + p) ? 'احتمال أكبر من ١ لا يكون: اطرح لا تجمع.' : '',
      good: `${N(1)} − ${N(p)} = ${N(1 - p)}`, data: { ev: 'احتمال ' + ev, not: 'احتمال ' + not, p, q: 1 - p, pTxt: N(p), labP: N(p), labQ: N(1 - p), ans: N(1 - p), title: 'توقعات الغد' } }; }
  if (i === 2) { const [ev, not] = pick(WINS); let p; do p = R(5, 95); while (p === 50);
    return { q: `احتمال ${ev} هو ${pct(p)}. ما احتمال ${not}؟`, input: { type: 'num', dot: true }, ok: v => v === 100 - p || eq(v, (100 - p) / 100),
      hint: 'النسبة المئوية لكل الاحتمالات معاً هي كم؟', bad: v => v === p || eq(v, p / 100) ? SAME : '',
      good: `${pct(100)} − ${pct(p)} = ${pct(100 - p)}`, data: { ev: 'احتمال ' + ev, not: 'احتمال ' + not, p: p / 100, q: 1 - p / 100, pTxt: pct(p), labP: pct(p), labQ: pct(100 - p), ans: pct(100 - p), title: 'لوحة المباريات' } }; }
  if (i === 3) { let a, b; do { b = R(3, 12); a = R(1, b - 1); } while (gcd(a, b) !== 1);
    const ev = pick([[`أن يقف الدوّار على اللون الأحمر`, 'ألا يقف على الأحمر'], [`أن يسحب زائر بطاقة رابحة`, 'ألا يسحب بطاقة رابحة'], [`أن تفرقع البالونة في لعبة السهام`, 'ألا تفرقع']]);
    return { q: `احتمال ${ev[0]} هو ${fr(a, b)}. ما احتمال ${ev[1]}؟`, input: { type: 'frac' }, sol: { w: 0, n: b - a, d: b }, ok: v => fEq(v, b - a, b),
      hint: 'الواحد الصحيح كم جزءاً من هذه الأجزاء نفسها؟ ثم كم يبقى منه؟', bad: v => fEq(v, a, b) ? SAME : '',
      good: `${N(1)} − ${fr(a, b)} = ${fr(b - a, b)}`, data: { ev: 'احتمال ' + ev[0], not: 'احتمال ' + ev[1], p: a / b, q: 1 - a / b, pTxt: `${N(a)} من ${N(b)}`, labP: '', labQ: '', ans: `${N(b - a)} من ${N(b)}`, title: 'ألعاب الحظ' } }; }
  if (i === 4) { let w1, l1; do { w1 = R(1, 8) / 10; l1 = R(1, 8) / 10; } while (w1 + l1 > .9 || eq(w1, l1));
    const d1 = Math.round((1 - w1 - l1) * 10) / 10, k = R(0, 2), Q = [['ألا يفوز', 1 - w1], ['ألا يخسر', 1 - l1], ['ألا يتعادل', w1 + l1]][k];
    return { q: `يقول مدرب فريق المهرجان: احتمال الفوز في المباراة القادمة ${N(w1)} واحتمال الخسارة ${N(l1)}. ما احتمال ${Q[0]} الفريق؟`, input: { type: 'num', dot: true }, ok: v => eq(v, Q[1]),
      hint: k === 2 ? 'النتائج ثلاث: فوز وخسارة وتعادل. ما احتمال التعادل أولاً؟' : 'ألا يحدث شيء = ١ − احتمال حدوثه.',
      bad: v => k === 2 && eq(v, d1) ? 'هذا احتمال التعادل نفسه: والسؤال عن ألا يتعادل.' : eq(v, k === 1 ? l1 : w1) ? SAME : k === 2 && eq(v, 1 - w1) ? 'ألا يتعادل يعني يفوز أو يخسر.' : '',
      good: `${Q[0]} = ${N(Q[1])}`, data: { ev: `فوز ${N(w1)} · خسارة ${N(l1)}`, not: 'احتمال ' + Q[0], p: k === 1 ? l1 : k === 0 ? w1 : d1, q: Q[1], pTxt: `تعادل = ؟`, labP: '', labQ: N(Q[1]), ans: N(Q[1]), title: 'مباراة المهرجان' } }; }
  // جدول أعمار الزوار: النسب مجموعها ١٠٠٪
  let g; do { g = [R(5, 30), R(15, 45), R(15, 40)]; g.push(100 - g[0] - g[1] - g[2]); } while (g[3] < 5 || new Set(g).size < 4);
  const labs = ['تحت ٢١', 'من ٢١ إلى ٣٥', 'من ٣٦ إلى ٥٥', 'أكبر من ٥٥'], k = R(0, 3), mode = R(0, 2);
  const Q = mode === 0 ? [`ألا يكون عمره ${labs[k]}`, 100 - g[k], [0, 1, 2, 3].filter(j => j !== k)] : mode === 1 ? ['أن يكون عمره ٢١ أو أكثر', 100 - g[0], [1, 2, 3]] : ['أن يكون عمره ٥٥ أو أقل', 100 - g[3], [0, 1, 2]];
  return { q: `يُختار زائر للمهرجان عشوائياً، والجدول يبيّن نسب أعمار الزوار. ما احتمال ${Q[0]}؟`, input: { type: 'num', dot: true }, ok: v => v === Q[1] || eq(v, Q[1] / 100),
    hint: 'ما الفئات التي لا يحقق أصحابها المطلوب؟ ابدأ من ١٠٠٪ واطرحها، أو اجمع الفئات المطلوبة.', bad: v => g.includes(v) ? 'هذه نسبة فئة واحدة: أي الفئات تحقق المطلوب كلها؟' : v > 100 ? 'لا تزيد النسبة على ١٠٠٪.' : '',
    good: `${Q[0]} = ${pct(Q[1])}`, data: { table: labs.map((l, j) => [l, g[j]]), hl: Q[2], ask: 'الاحتمال', ans: pct(Q[1]), title: 'أعمار زوار المهرجان' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const p = fresh(() => R(1, 9) / 10); items.push(choice(`احتمال أن تمطر غداً ${N(p)}. احتمال ألا تمطر:`, N(1 - p), [N(p), N(1 + p), N(Math.round((1.1 - p) * 10) / 10)], 'احتمال عدم الحدوث = ١ − احتمال الحدوث.', '8Db1')); }
  { const p = fresh(() => { let x; do x = R(5, 95); while (x === 50); return x; }); items.push(choice(`احتمال أن يفوز سالم بالمباراة ${pct(p)}. احتمال ألا يفوز:`, pct(100 - p), [pct(p), pct(100 - p + (p > 10 ? 10 : 5)), pct(Math.abs(p - 10) || 15)], 'النسب المئوية لكل الاحتمالات مجموعها ١٠٠٪.', '8Db1')); }
  { const [a, b] = fresh(() => { let a, b; do { b = R(4, 11); a = R(1, b - 1); } while (gcd(a, b) !== 1 || b - a === a); return [a, b]; }); items.push(choice(`احتمال ظهور الرقم المطلوب ${fr(a, b)}. احتمال عدم ظهوره:`, fr(b - a, b), [fr(a, b), fr(1, b - a), fr(b, b - a)], 'كم يبقى من الواحد الصحيح؟', '8Db1')); }
  { const p = fresh(() => { let x; do x = R(1, 99) / 100; while (x * 100 % 10 === 0); return x; }); items.push(num(`احتمال أن تتأخر الحافلة ${N(p)}. ما احتمال ألا تتأخر؟`, 1 - p, 'اطرح من ١.', '8Db1')); }
  { const [w1, l1] = fresh(() => { let a, b; do { a = R(2, 7) / 10; b = R(1, 4) / 10; } while (a + b > .9); return [a, b]; }); items.push(num(`احتمال الفوز ${N(w1)} واحتمال الخسارة ${N(l1)}، وغير ذلك تعادل. ما احتمال ألا يتعادل الفريق؟`, w1 + l1, 'ألا يتعادل يعني أن يفوز أو يخسر.', '8Db1')); }
  items.push(tf('إذا كان احتمال حدوث نتيجة ٠٫٤ فإن احتمال عدم حدوثها ٠٫٦.', true, 'اجمعهما: هل الناتج ١؟', '8Db1', '١ − ٠٫٤ = ٠٫٦'));
  items.push(tf('يمكن أن يكون احتمال نتيجة ما ١٫٢.', false, 'ما أكبر قيمة يمكن أن يأخذها الاحتمال؟', '8Db1', 'الاحتمال بين ٠ و١ دائماً.'));
  { const g = fresh(() => [R(8, 20), R(5, 15)]); items.push(num(`في مسح لألوان السيارات: ${pct(g[0])} حمراء و${pct(g[1])} خضراء. ما النسبة المئوية لاحتمال أن تكون السيارة التالية ليست حمراء ولا خضراء؟`, 100 - g[0] - g[1], 'اطرح النسبتين من ١٠٠٪.', '8Db1')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'لوحة التوقعات', icon: '📊', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في مهرجان الألعاب! أنا هيثم، أعلن توقعات الغد على هذه اللوحة.', 'كل توقع له احتمال أن يحدث. وأنا أريد الوجه الآخر: احتمال ألا يحدث. الشريط كله واحد صحيح… فكّر كم يبقى منه.'],
  outro: ['اكتملت لوحة التوقعات! الآن يعرف الزوار ما يحدث وما لا يحدث.', 'لنختبر احتمال عدم الحدوث بأسئلة متنوعة.'],
  challenge: { title: 'تحدي عدم الحدوث', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
