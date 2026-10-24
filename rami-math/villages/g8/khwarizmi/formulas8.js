// ٥-٥ الصيغ واستخدامها — «ساعة الماء»: التاجر بدر يدفع أجور العاملين بالساعة التي تقيسها ساعة الماء، ويحسب سرعة قافلته.
// الطالب يكتب صيغة الأجر، ويعوّض فيها، ويغيّر مجهولها (س = ع ÷ م) ويستعملها، ويجد الزمن من صيغة السرعة النهائية.
// التحدي: ٨ أسئلة من 8Ae7 (الكتاب ص٨٧–٨٩).
import { mission } from '../../mission.js';
import { N, R, eq, fr } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { parchment, slab, say, GOLD, TEAL } from './art.js';

const who = { name: 'التاجر بدر', face: '👨🏽‍💼', id: 'badr' };
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const D1 = (a, b) => R(a * 10, b * 10) / 10;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  // ساعة الماء: إناء علوي يقطر في إناء مدرّج، وعوّامة ترتفع
  const x = w * .2, top = h * .12, lv = .25 + ((t * .03) % .6);
  g.fillStyle = '#B87333'; g.beginPath(); g.moveTo(x - 50, top); g.lineTo(x + 50, top); g.lineTo(x + 30, top + 50); g.lineTo(x - 30, top + 50); g.closePath(); g.fill();
  const d = (t * 1.5) % 1; g.fillStyle = '#38BDF8'; g.beginPath(); g.arc(x, top + 58 + d * 30, 4, 0, 7); g.fill();
  const by = h * .9, bh = h * .52; g.fillStyle = 'rgba(56,189,248,.5)'; g.fillRect(x - 40, by - bh * lv, 80, bh * lv); g.strokeStyle = '#64748B'; g.lineWidth = 3; g.strokeRect(x - 40, by - bh, 80, bh);
  for (let k = 1; k < 10; k++) { g.beginPath(); g.moveTo(x + 40, by - bh * k / 10); g.lineTo(x + 30, by - bh * k / 10); g.stroke(); }
  g.fillStyle = GOLD; g.fillRect(x - 12, by - bh * lv - 10, 24, 10);
  slab(g, w * .42, h * .14, w * .5, h * .5, '#FFFDF6');
  say(g, r.board || 'لوح الأجور', w * .67, h * .27, 18, TEAL);
  (r.lines || []).forEach((l, k) => say(g, l, w * .67, h * .38 + k * 26, 16));
  if (S.done && r.ans) say(g, r.ans, w * .67, h * .8, 20, '#15803D');
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  const legend = ['ع: الأجر بالريال', 'س: عدد الساعات', 'م: الأجر في الساعة'];
  if (i === 0) { const opts = shuffle(['ع = س م', 'ع = س + م', 'س = ع م', fr('م', 'س')]);
    return { q: 'يعمل خالد س ساعة، ويأخذ م ريالاً عن كل ساعة. أي صيغة تعطي أجره الكلي ع؟', input: { type: 'pick', opts: opts.map(o => o.includes('mq-fr') ? `ع = ${o}` : o) }, ok: k => opts[k] === 'ع = س م',
      hint: 'إن عمل ساعتين بأجر ٣ ريالات للساعة، كم يأخذ؟ أي عملية استعملت؟', bad: k => opts[k] === 'ع = س + م' ? 'هل نجمع الساعات والأجر؟ جرّب بأعداد صغيرة.' : '', good: 'أحسنت! ع = س م تعني س × م.', data: { lines: legend } }; }
  if (i === 1) { const s = [6, 7, 8, 8.5, 7.5, 9][R(0, 5)], m = D1(5, 9.5), ans = Math.round(s * m * 100) / 100;
    return { q: `استعمل ع = س م لتجد أجر من عمل س = ${N(s)} ساعات بأجر م = ${N(m)} ريال في الساعة.`, input: { type: 'num', dot: true }, ok: v => eq(v, ans),
      hint: 'عوّض بالقيمتين في الصيغة ثم اضرب. كم منزلة عشرية في الناتج؟', bad: v => eq(v, s + m) ? 'الصيغة ضرب لا جمع.' : '', good: `أحسنت! ع = ${N(ans)} ريالاً.`, data: { lines: [`س = ${N(s)}`, `م = ${N(m)}`, 'ع = س م'], ans: `ع = ${N(ans)}` } }; }
  if (i === 2) { const opts = shuffle([fr('ع', 'م'), 'ع م', fr('م', 'ع'), 'ع − م']);
    return { q: 'غيّر مجهول الصيغة ع = س م لتصبح س هي المجهول. س = ؟', input: { type: 'pick', opts: opts.map(o => `س = ${o}`) }, ok: k => opts[k] === fr('ع', 'م'),
      hint: 'س مضروبة في م: ما العملية العكسية التي تُبقي س وحدها؟ وطبّقها على الطرفين.', bad: k => opts[k] === fr('م', 'ع') ? 'اقسم الطرفين على م: أيّهما في البسط؟' : '', good: 'أحسنت! قسمنا الطرفين على م.', data: { lines: ['ع = س م', '؟ = س'] } }; }
  if (i === 3) { const s = [6, 7, 8, 9, 9.5, 10][R(0, 5)], m = D1(6, 9), e = Math.round(s * m * 100) / 100;
    return { q: `أخذ عامل ع = ${N(e)} ريالاً بأجر م = ${N(m)} ريال في الساعة. استعمل س = ${fr('ع', 'م')} لتجد عدد ساعاته.`, input: { type: 'num', dot: true }, ok: v => eq(v, s),
      hint: 'عوّض ثم اقسم. تحقّق بضرب الناتج في م.', bad: v => eq(v, e * m) ? 'الصيغة قسمة لا ضرب.' : '', good: `أحسنت! س = ${N(s)} ساعات.`, data: { lines: [`ع = ${N(e)}`, `م = ${N(m)}`, 'س = ع ÷ م'], ans: `س = ${N(s)}` } }; }
  const u = R(2, 10), a = R(2, 6), tt = R(3, 12), v = u + a * tt;
  return { q: `صيغة سرعة القافلة: ن = ب + ت ز، حيث ن السرعة النهائية وب الابتدائية وت التسارع وز الزمن. إذا كانت ن = ${N(v)}، ب = ${N(u)}، ت = ${N(a)}، فما الزمن ز؟`, input: { type: 'num' }, ok: x => x === tt,
    hint: 'غيّر المجهول: اطرح ب من الطرفين أولاً، ثم اقسم على ت.', bad: x => x === Math.round((v + u) / a) ? 'اطرح ب لا تجمعها.' : x === Math.round(v / a - u) ? 'اطرح ب قبل القسمة.' : '', good: `أحسنت! ز = (ن − ب) ÷ ت = ${N(tt)}.`,
    data: { board: 'صيغة القافلة', lines: ['ن = ب + ت ز', `ن = ${N(v)}، ب = ${N(u)}`, `ت = ${N(a)}`], ans: `ز = ${N(tt)}` } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [s, m] = fresh(() => [R(3, 9), R(4, 12)]); items.push(num(`ع = س م. أوجد ع عندما س = ${N(s)}، م = ${N(m)}.`, s * m, 'عوّض واضرب.', '8Ae7')); }
  { const [s, m] = fresh(() => [R(3, 9), R(4, 12)]); items.push(num(`س = ع ÷ م. أوجد س عندما ع = ${N(s * m)}، م = ${N(m)}.`, s, 'عوّض واقسم.', '8Ae7')); }
  items.push(choice('في صيغة محيط المستطيل م = ٢ل + ٢ض، مجهول الصيغة هو:', 'م', ['ل', 'ض', '٢'], 'مجهول الصيغة هو الحرف الذي يُكتب وحده في طرف.', '8Ae7'));
  items.push(choice('اجعل ب مجهول الصيغة ن = ب + ت ز:', 'ب = ن − ت ز', ['ب = ن + ت ز', 'ب = ت ز − ن', 'ب = ن ÷ ت ز'], 'اطرح ت ز من الطرفين.', '8Ae7'));
  items.push(choice('اجعل ل مجهول الصيغة ح = ٣ل:', `ل = ${fr('ح', N(3))}`, ['ل = ٣ح', 'ل = ح − ٣', `ل = ${fr(N(3), 'ح')}`], 'اقسم الطرفين على ٣.', '8Ae7'));
  { const [u, a, t] = fresh(() => [R(1, 9), R(2, 5), R(2, 8)]); items.push(num(`ن = ب + ت ز. أوجد ن عندما ب = ${N(u)}، ت = ${N(a)}، ز = ${N(t)}.`, u + a * t, 'الضرب قبل الجمع.', '8Ae7')); }
  items.push(tf('تغيير مجهول الصيغة يعني إعادة ترتيبها ليصبح حرف آخر وحده في طرف.', true, 'ما معنى «مجهول الصيغة»؟', '8Ae7', 'نستعمل العمليات العكسية على الطرفين.'));
  items.push(tf('من ع = س م نحصل على م = ع × س.', false, 'جرّب أعداداً: ١٢ = ٣ × ٤.', '8Ae7', 'الصحيح م = ع ÷ س.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'ساعة الماء', icon: '⏳', who, rounds: 5, make, draw,
  intro: ['ساعة الماء تقيس ساعات عمل الناس في السوق، وأنا أدفع أجورهم بصيغة.', 'الصيغة قاعدة بين متغيّرات: نعوّض فيها، أو نعيد ترتيبها لنجد المجهول الذي نريد.'],
  outro: ['دُفعت الأجور كلها بالعدل، ووصلت القافلة في وقتها.', 'لنختبر الصيغ بأسئلة متنوعة.'],
  challenge: { title: 'تحدي الصيغ', make: challenge }
});
export { make, challenge };
