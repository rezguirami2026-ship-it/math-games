// ٤-١ كتابة الكسر في أبسط صورة — «صحون القصّ»: صحن حلوى دائري مقطّع قطعاً صغيرة متساوية، بقي منها جزء. الطالب يدير القاطع
// ليجمع القطع الصغيرة في أكبر قطع متساوية لا تقطع الحلوى (العامل المشترك الأكبر)، ثم يكتب كسوراً أكبر في أبسط صورة،
// ويتحقق من واجب فهد بالعملية العكسية. التحدي: ٨ أسئلة من 8Nf1 (الكتاب ص٦٢).
import { mission } from '../../mission.js';
import { N, R, fr, gcd, fOk, fBad, fEq } from '../../math.js';
import { choice, num, tf, multi } from '../../../missions/challenge.js';
import { kitchen, dish, fracC, say, HALWA } from './art.js';

const who = { name: 'الجدة شيخة', face: '👵🏽', id: 'sheikha' };
/* كسر يُبسَّط: أبسط صورته a/b ومضروب في k */
const pair = (bMin, bMax, kMin, kMax, cap) => { for (let t = 0; t < 80; t++) { const b = R(bMin, bMax), a = R(1, b - 1), k = R(kMin, kMax); if (gcd(a, b) === 1 && b * k <= cap) return { a, b, k, n: a * k, d: b * k }; } return { a: 3, b: 4, k: 6, n: 18, d: 24 }; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; kitchen(g, w, h, h * .7);
  if (r.mode === 'dish') {
    const k = r.tried || 1, R0 = Math.min(w * .26, h * .38);
    dish(g, w * .36, h * .48, R0, r.d, r.n, S.done ? r.k : k, t);
    fracC(g, r.n, r.d, w * .78, h * .3, 30, HALWA);
    if (k > 1) { const ok = r.d % k === 0 && r.n % k === 0; say(g, ok ? `قطع كبرى من ${N(k)} قطع ✓` : 'القاطع يقطع الحلوى!', w * .78, h * .62, 16, ok ? '#15803D' : '#B91C1C'); if (ok) fracC(g, r.n / k, r.d / k, w * .78, h * .8, 26, '#15803D'); }
  } else if (r.mode === 'board') {   // سبورة الوصفة: كسر كبير، وبعد الحل سلسلة القسمة إلى أبسط صورة
    g.fillStyle = '#1F3A2E'; g.fillRect(w * .1, h * .08, w * .8, h * .56); g.strokeStyle = '#A16207'; g.lineWidth = 8; g.strokeRect(w * .1, h * .08, w * .8, h * .56);
    say(g, 'كمية الحلوى المطلوبة من الصينية', w * .5, h * .17, 15, '#E2E8F0');
    fracC(g, r.n, r.d, w * .72, h * .36, 34, '#FDE68A');
    if (S.done) { say(g, `÷ ${N(r.k)}`, w * .5, h * .33, 20, '#86EFAC'); g.strokeStyle = '#86EFAC'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .62, h * .4); g.lineTo(w * .4, h * .4); g.stroke(); fracC(g, r.a, r.b, w * .3, h * .36, 34, '#86EFAC'); }
    else say(g, '؟', w * .3, h * .42, 40, 'rgba(226,232,240,.5)');
  } else if (r.mode === 'fahd') {   // ورقة واجب فهد
    g.fillStyle = '#FFFDF6'; g.fillRect(w * .12, h * .06, w * .76, h * .6); g.strokeStyle = '#CBD5E1'; g.lineWidth = 1; for (let y = h * .16; y < h * .64; y += 22) { g.beginPath(); g.moveTo(w * .12, y); g.lineTo(w * .88, y); g.stroke(); }
    say(g, 'واجب فهد', w * .5, h * .13, 15, '#475569');
    fracC(g, r.n, r.d, w * .66, h * .32, 30, '#1E3A8A'); say(g, '=', w * .5, h * .38, 30, '#1E3A8A'); fracC(g, r.p, r.q, w * .34, h * .32, 30, '#1E3A8A');
    say(g, `التحقق: ${N(r.p)} × ${N(r.m)} و ${N(r.q)} × ${N(r.m)}`, w * .5, h * .58, 15, '#B45309');
  }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i <= 1) { const P = i ? pair(3, 6, 4, 12, 60) : pair(2, 5, 2, 8, 40), D = { mode: 'dish', ...P };   // D.tried: آخر قاطع ثبّته الطالب (يُرسم بعد التثبيت فقط)
    return { q: `صحن فيه ${N(P.d)} قطعة متساوية، بقي منها ${N(P.n)} (أي ${fr(P.n, P.d)} الصحن). أدِر القاطع لتجمع القطع في <b>أكبر</b> قطع متساوية لا تقطع الحلوى. كم قطعة صغيرة في كل قطعة كبيرة؟`,
      input: { type: 'dial', min: 1, max: 12, start: 1, show: v => `${N(v)} ${v === 1 ? 'قطعة' : v === 2 ? 'قطعتان' : v <= 10 ? 'قطع' : 'قطعة'}` }, ok: v => { D.tried = v; return v === P.k; },
      hint: 'أي عدد يقسم عدد القطع الباقية وعدد قطع الصحن كله معاً؟ وهل يوجد عدد أكبر منه يقسمهما أيضاً؟',
      bad: v => v === 1 ? 'ما زالت القطع صغيرة كما هي.' : P.n % v === 0 && P.d % v === 0 ? `${N(v)} عامل مشترك فعلاً، لكنه ليس الأكبر.` : P.d % v === 0 ? 'هذا العدد يقسم قطع الصحن كله، لكنه يقطع الحلوى الباقية.' : 'هذا العدد لا يقسم قطع الصحن بالتساوي.',
      good: `أحسنت! ${N(P.k)} هو العامل المشترك الأكبر، فصار الكسر ${fr(P.a, P.b)}.`, data: D }; }
  if (i <= 3) { const P = i === 2 ? pair(3, 12, 6, 15, 150) : pair(5, 15, 7, 18, 240);
    return { q: `تطلب الوصفة ${fr(P.n, P.d)} صينية من الحلوى. اكتب هذا الكسر في <b>أبسط صورة</b>.`, input: { type: 'frac' }, ok: v => fOk(v, P.a, P.b),
      hint: 'ابحث عن عدد يقسم البسط والمقام معاً، واقسم عليه… ثم اسأل: هل بقي عامل مشترك؟',
      bad: v => fBad(v, P.a, P.b) || (v.n === P.n / gcd(P.n, P.d) ? 'هل قسمت المقام على العدد نفسه الذي قسمت عليه البسط؟' : ''), good: `أحسنت! ${fr(P.n, P.d)} = ${fr(P.a, P.b)}، بالقسمة على ${N(P.k)}.`, data: { mode: 'board', ...P } }; }
  // واجب فهد: إجابته صحيحة في أبسط صورة، أو صحيحة القيمة غير مبسطة (قسم على عامل أولي فقط)، أو خاطئة
  const P = pair(3, 9, 4, 12, 120), real = R(0, 2), sp = [2, 3, 5, 7, 11].find(x => P.k % x === 0) || P.k;
  let p = P.a, q = P.b, m = P.k;
  if (real === 1 && sp < P.k) { p = P.n / sp; q = P.d / sp; m = sp; }
  if (real === 2) { p = P.a + 1 < P.b ? P.a + 1 : P.a - 1 || 1; if (fEq({ w: 0, n: p, d: q }, P.a, P.b)) q = P.b + 1; m = Math.round(P.d / q); }
  const truth = fEq({ w: 0, n: p, d: q }, P.a, P.b) ? (gcd(p, q) === 1 ? 0 : 1) : 2;
  const opts = ['صحيحة وفي أبسط صورة', 'القيمة صحيحة لكنها ليست في أبسط صورة', 'خاطئة: الكسر الناتج لا يساوي الكسر الأصلي'];
  return { q: `كتب فهد أن ${fr(P.n, P.d)} = ${fr(p, q)}، ويتحقق بضرب البسط والمقام في العدد نفسه. ما رأيك في إجابته؟`, input: { type: 'pick', opts }, ok: k => k === truth,
    hint: 'اضرب بسط إجابته ومقامها في العدد نفسه: هل تعود إلى الكسر الأصلي تماماً؟ ثم هل لبسطها ومقامها عامل مشترك؟',
    bad: k => k === 0 && truth === 1 ? 'قيمتها صحيحة، لكن هل لبسطها ومقامها عامل مشترك بعد؟' : k !== 2 && truth === 2 ? 'جرّب التحقق: هل يعطي الضرب البسط والمقام الأصليين معاً؟' : '',
    good: truth === 0 ? 'أحسنت! إجابة فهد صحيحة تماماً.' : `أحسنت! أبسط صورة هي ${fr(P.a, P.b)}.`, data: { mode: 'fahd', ...P, p, q, m } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const P = fresh(() => pair(3, 9, 3, 9, 81)); items.push(choice(`أبسط صورة للكسر ${fr(P.n, P.d)} هي:`, fr(P.a, P.b), [fr(P.a * 2, P.b * 2), fr(P.a, P.b + 1), fr(P.a + 1, P.b + 1)], 'اقسم البسط والمقام على العدد نفسه حتى لا يبقى عامل مشترك.', '8Nf1')); }
  { const P = fresh(() => pair(3, 9, 4, 12, 108)); items.push(num(`ما العامل المشترك الأكبر للعددين ${N(P.n)} و${N(P.d)}؟`, P.k, 'اكتب عوامل كل عدد: ما أكبر عامل يظهر في القائمتين؟', '8Nf1')); }
  { const P = fresh(() => pair(4, 11, 5, 12, 132)); items.push(num(`اكتب ${fr(P.n, P.d)} في أبسط صورة. ما مقام الكسر الناتج؟`, P.b, 'بعد القسمة على العامل المشترك الأكبر لا يبقى للبسط والمقام عامل مشترك.', '8Nf1')); }
  { const P = fresh(() => pair(3, 8, 2, 9, 72)), m1 = R(2, 4), m2 = R(5, 7), good = [fr(P.a * m1, P.b * m1), fr(P.a * m2, P.b * m2)];
    items.push(multi(`أي الكسور الآتية تساوي ${fr(P.a, P.b)}؟ (اختر كل الصحيح)`, [...good, fr(P.a + m1, P.b + m1), fr(P.a * m1, P.b * m2)], v => good.includes(v), 'كسر يساوي غيره إذا ضُرب البسط والمقام في العدد نفسه.', '8Nf1')); }
  items.push(tf(`الكسر ${fr(9, 16)} في أبسط صورة.`, true, 'هل يوجد عدد غير ١ يقسم ٩ و١٦ معاً؟', '8Nf1', 'عوامل ٩: ١، ٣، ٩، وعوامل ١٦: ١، ٢، ٤، ٨، ١٦، والمشترك ١ فقط.'));
  items.push(tf(`لتبسيط ${fr(60, 72)} يجب القسمة على العامل المشترك الأكبر مرة واحدة فقط.`, false, 'هل نصل إلى النتيجة نفسها إذا قسمنا على عامل واحد في كل مرة؟', '8Nf1', 'يمكن القسمة على ٢ ثم ٢ ثم ٣، فنصل إلى ٥/٦ أيضاً.'));
  { const P = fresh(() => pair(3, 7, 2, 6, 42)); items.push(num(`${fr(P.a, P.b)} = ؟/${N(P.d)}. ما البسط الناقص؟`, P.n, 'بكم ضُرب المقام؟ اضرب البسط في العدد نفسه.', '8Nf1')); }
  { const P = fresh(() => pair(5, 12, 6, 14, 168)); items.push(choice(`كتبت سلمى ${fr(P.n, P.d)} في أبسط صورة. أي تحقق صحيح؟`, `${N(P.a)} × ${N(P.k)} = ${N(P.n)} و ${N(P.b)} × ${N(P.k)} = ${N(P.d)}`, [`${N(P.a)} + ${N(P.k)} = ${N(P.n)}`, `${N(P.n)} − ${N(P.a)} = ${N(P.d)} − ${N(P.b)}`, `${N(P.a)} × ${N(P.b)} = ${N(P.n)}`], 'التحقق بالعملية العكسية: كيف رجعنا من الكسر المبسط إلى الأصلي؟', '8Nf1')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'صحون القصّ', icon: '🍰', who, rounds: 5, make, draw,
  intro: ['يا أهلاً! صحون الحلوى مقطّعة قطعاً صغيرة جداً، والضيوف يريدون قطعاً أكبر.', 'اجمع القطع الصغيرة في قطع كبيرة متساوية… من غير أن تقطع الحلوى!'],
  outro: ['صارت الصحون مرتبة، والكسور كلها في أبسط صورة.', 'لنختبر التبسيط بأسئلة متنوعة.'],
  challenge: { title: 'تحدي أبسط صورة', make: challenge }
});
export { make, challenge };
