// ١٤-٣ حل مسائل القياس — «عيادة المضمار»: الممرضة لبنى تحل مسائل قياس بخطوات: تحويل الوحدات المترية (لتر ومل، كغم وغم، كم وم)
// ووحدات الزمن، والنسبة المئوية من كتلة، وكم يوماً يكفي الدواء، وماء العدّائين، وطول المضمار بعدة لفات. القيمة المطلوبة «؟» حتى يحلّ الطالب.
// التحدي: ٨ أسئلة من 8Ml1 (الكتاب ص٩٦–٩٧).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { trackBg, say, glow } from './art.js';

const who = { name: 'الممرضة لبنى', face: '👩🏽‍⚕️', id: 'lubna' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const r3 = v => Math.round(v * 1000) / 1000;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; trackBg(g, w, h, t);
  g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.roundRect(w * .08, h * .36, w * .84, h * .5, 16); g.fill(); g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.stroke();
  say(g, '🩺 ' + (r.title || 'عيادة المضمار'), w * .5, h * .45, 18, '#B91C1C', 900);
  (r.lines || []).forEach((l, k) => say(g, l, w * .5, h * .55 + k * 26, 16, '#334155', 800));
  say(g, S.done ? r.ans : r.ask || '', w * .5, h * .82, 18, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const m = R(10, 60), p = pick([21, 75, 4, 15, 30, 12]), ans = r3(m * p / 100);
    return { q: `كتلة ميدالية السباق ${N(m)} غم، و${N(p)}٪ منها نحاس. كم غراماً من النحاس فيها؟`, input: { type: 'num', dot: true }, sol: ans, ok: v => eq(v, ans),
      hint: 'النسبة المئوية من الكتلة: كيف تحسب جزءاً من مئة من الكتلة؟', bad: v => eq(v, m * p) ? 'لا تنس القسمة على ١٠٠.' : '',
      good: `${N(p)}٪ × ${N(m)} = ${N(ans)} غم`, data: { title: 'ميدالية السباق', lines: [`الكتلة ${N(m)} غم`, `النحاس ${N(p)}٪`], ask: 'النحاس = ؟', ans: `النحاس ${N(ans)} غم` } }; }
  if (i === 1) { let L, ml, times, days; do { L = pick([.3, .2, .25, .5, .4]); ml = pick([5, 10]); times = pick([2, 3, 4]); days = L * 1000 / (ml * times); } while (!eq(days * 2, Math.round(days * 2)) || days > 30);
    return { q: `زجاجة دواء فيها ${N(L)} لتر، والجرعة ${N(ml)} مل ${times === 2 ? 'مرتين' : `${N(times)} مرات`} في اليوم. كم يوماً تكفي الزجاجة؟`, input: { type: 'num', dot: true }, sol: days, ok: v => eq(v, days),
      hint: 'كم ملّيلتراً في اليوم؟ وحوّل اللترات إلى ملّيلترات قبل القسمة.', bad: v => eq(v, L / (ml * times)) ? 'حوّل اللتر إلى ملّيلترات أولاً.' : '',
      good: `${N(L * 1000)} مل ÷ ${N(ml * times)} مل = ${N(days)} يوم`, data: { title: 'زجاجة الدواء', lines: [`${N(L)} لتر`, `${N(ml)} مل × ${N(times)} مرات يومياً`], ask: 'الأيام = ؟', ans: `تكفي ${N(days)} يوم` } }; }
  if (i === 2) { const n = R(12, 40), ml = pick([250, 330, 500, 750]), L = r3(n * ml / 1000);
    return { q: `يشرب كل عدّاء من ${N(n)} عدّاءً قارورة ماء سعتها ${N(ml)} مل. كم لتراً يشربون معاً؟`, input: { type: 'num', dot: true }, sol: L, ok: v => eq(v, L),
      hint: 'كم ملّيلتراً كلها؟ وكم ملّيلتراً في اللتر الواحد؟', bad: v => eq(v, n * ml) ? 'هذا بالملّيلترات: حوّل إلى لترات.' : '',
      good: `${N(n * ml)} مل = ${N(L)} لتر`, data: { title: 'ماء العدّائين', lines: [`${N(n)} عدّاءً`, `${N(ml)} مل لكل عدّاء`], ask: 'باللتر = ؟', ans: `${N(L)} لتر` } }; }
  if (i === 3) { const lap = pick([400, 250, 800]), laps = R(3, 12), km = r3(lap * laps / 1000);
    return { q: `طول اللفة في مضمار القرية ${N(lap)} م. ركض عادل ${N(laps)} ${laps > 10 ? 'لفة' : 'لفات'}. كم كيلومتراً ركض؟`, input: { type: 'num', dot: true }, sol: km, ok: v => eq(v, km),
      hint: 'اضرب طول اللفة في عدد اللفات، ثم حوّل الأمتار إلى كيلومترات.', bad: v => eq(v, lap * laps) ? 'هذا بالأمتار: كم متراً في الكيلومتر؟' : '',
      good: `${N(lap * laps)} م = ${N(km)} كم`, data: { title: 'لفات المضمار', lines: [`اللفة ${N(lap)} م`, `${N(laps)} لفات`], ask: 'بالكيلومتر = ؟', ans: `${N(km)} كم` } }; }
  if (i === 4) { const mins = R(65, 200), hh = Math.floor(mins / 60), mm = mins % 60;
    return { q: `استغرق سباق الدراجات ${N(mins)} دقيقة. كم ساعة ودقيقة؟ اكتب الساعات ثم الدقائق.`, input: { type: 'blanks', tpl: '{} ساعة و{} دقيقة' }, sol: [hh, mm], ok: v => v[0] === hh && v[1] === mm,
      hint: 'كم ساعة كاملة في هذه الدقائق؟ وكم دقيقة تبقى؟', bad: v => v[0] === hh ? 'الساعات صحيحة! راجع الدقائق الباقية.' : '',
      good: `${N(mins)} = ${N(hh * 60)} + ${N(mm)}`, data: { title: 'زمن السباق', lines: [`${N(mins)} دقيقة`], ask: 'ساعات ودقائق = ؟', ans: `${N(hh)} ساعة و${N(mm)} دقيقة` } }; }
  const kg = pick([1.6, 3.2, 2.4, 0.8]), g1 = pick([400, 800, 200]);
  return { q: `كيس حبوب طاقة للعدّائين كتلته ${N(kg)} كغم، تُوزّع في أكياس صغيرة كتلة كل منها ${N(g1)} غم. كم كيساً صغيراً يمتلئ؟`, input: { type: 'num' }, sol: kg * 1000 / g1, ok: v => v === kg * 1000 / g1,
    hint: 'هل الكتلتان بالوحدة نفسها؟ حوّل ثم اقسم.', bad: v => v === Math.round(kg / g1) ? 'حوّل الكيلوغرامات إلى غرامات أولاً.' : '',
    good: `${N(kg * 1000)} غم ÷ ${N(g1)} = ${N(kg * 1000 / g1)}`, data: { title: 'حبوب الطاقة', lines: [`${N(kg)} كغم`, `${N(g1)} غم لكل كيس`], ask: 'الأكياس = ؟', ans: `${N(kg * 1000 / g1)} كيساً` } };
}

function challenge() {
  const items = [];
  items.push(num('عقد كتلته ٢٠ غم، و٢١٪ منه نحاس. كم غراماً من النحاس؟', 4.2, '٢١ ÷ ١٠٠ × ٢٠.', '8Ml1', { dot: true }));
  items.push(num('زجاجة ٠٫٣ لتر، والجرعة ٤٠ مل يومياً. كم يوماً تكفي؟', 7.5, '٣٠٠ ÷ ٤٠.', '8Ml1', { dot: true }));
  items.push(choice('اللتر الواحد يساوي:', '١٠٠٠ مل', ['١٠٠ مل', '١٠ مل', '١٠٠٠٠ مل'], 'ملّي = جزء من ألف.', '8Ml1'));
  items.push(choice('٢٫٥ كم بالأمتار:', '٢٥٠٠ م', ['٢٥٠ م', '٢٥ م', '٢٥٠٠٠ م'], 'اضرب في ١٠٠٠.', '8Ml1'));
  items.push(tf('١٥٠ دقيقة تساوي ساعتين ونصف.', true, '١٢٠ + ٣٠.', '8Ml1', '١٥٠ ÷ ٦٠ = ٢٫٥.'));
  items.push(tf('٣٥٠ غم أكبر من ٠٫٤ كغم.', false, 'حوّل ٠٫٤ كغم إلى غرامات.', '8Ml1', '٠٫٤ كغم = ٤٠٠ غم.'));
  items.push(num('مضمار لفته ٤٠٠ م. كم كيلومتراً في ٥ لفات؟', 2, '٢٠٠٠ م.', '8Ml1', { dot: true }));
  items.push(num('٢٤ قارورة سعة كل منها ٥٠٠ مل. كم لتراً معاً؟', 12, '١٢٠٠٠ مل.', '8Ml1', { dot: true }));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'عيادة المضمار', icon: '🩺', who, rounds: 6, make, draw,
  intro: ['أنا لبنى، ممرضة المضمار. أحسب الدواء والماء والمسافات للعدّائين.', 'سرّي: أكتب كل خطوة، وأوحّد الوحدات قبل أي حساب.'],
  outro: ['ممتاز! كل قياس في وحدته الصحيحة.', 'تحدي مسائل القياس.'],
  challenge: { title: 'تحدي القياس', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
