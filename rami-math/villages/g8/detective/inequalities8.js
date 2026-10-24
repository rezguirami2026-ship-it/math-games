// ١٠-٥ المتباينات — «خط الأعداد السري»: الضابط عزيز يرسم مجموعات الحل على خط الأعداد: يحرّك الطالب طرف الشعاع، ويختار دائرة مفتوحة
// (لا يتضمن العدد) أو مغلقة (يتضمنه)، واتجاه الشعاع؛ ثم يكتب المتباينة من رسمها، ويحل متباينة خطية ويمثلها، وأصغر أو أكبر عدد صحيح،
// وعدد الأعداد الصحيحة بين حدين، ومحيط المثلث «على الأقل». الشعاع لا يظهر إلا ما يحرّكه الطالب. التحدي: ٨ أسئلة من 8Ae12 (الكتاب ص٤١–٤٢).
import { mission } from '../../mission.js';
import { N, R, tm, ex } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { officeBg, say, glow, numLine, NAVY } from './art.js';

const who = { name: 'الضابط عزيز', face: '👮🏽', id: 'aziz' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
// الإشارات الأربع: [النص، مغلقة؟، نحو الأكبر؟]
const SG = [['<', false, false], ['>', false, true], ['≤', true, false], ['≥', true, true]];
const raySol = (v, k) => ({ v, closed: SG[k][1], right: SG[k][2] });
const same = (a, b) => Math.abs(a.v - b.v) < 1e-9 && a.closed === b.closed && a.right === b.right;
const why = (v, s) => Math.abs(v.v - s.v) > 1e-9 ? 'راجع موضع الطرف: أي عدد في المتباينة؟' : v.closed !== s.closed ? (s.closed ? 'الإشارة فيها «أو يساوي»: هل العدد نفسه من الحل؟' : 'الإشارة بلا «يساوي»: هل العدد نفسه من الحل؟') : 'الاتجاه: هل الحلول أصغر من العدد أم أكبر؟';

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; officeBg(g, w, h, t);
  say(g, '📏 ' + (r.title || 'خط الأعداد السري'), w * .5, h * .14, 18, NAVY, 900);
  if (r.lines) r.lines.forEach((l, k) => say(g, l, w * .5, h * .26 + k * 30, 19, '#7C2D12', 900));
  const sol = r.show ? r.show : S.done ? r.sol : (S.v && typeof S.v === 'object' ? S.v : null);
  numLine(g, w * .1, h * .7, w * .8, r.lo ?? -6, r.hi ?? 6, sol, { step: r.step || 1, label: r.label || 1 });
  if (S.done && r.ans) say(g, r.ans, w * .5, h * .9, 18, '#15803D', 900);
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const a = R(-4, 4), k = R(0, 3), v = pick(['س', 'ص', 'م']), sol = raySol(a, k);
    return { q: `مثّل مجموعة حل المتباينة ${v} ${SG[k][0]} ${N(a)} على خط الأعداد.`, input: { type: 'ray', min: -6, max: 6, start: 0 }, sol, ok: x => same(x, sol),
      hint: 'أين يقع العدد على الخط؟ وهل هو نفسه من الحل؟ وفي أي اتجاه بقية الحلول؟', bad: x => why(x, sol),
      good: `${v} ${SG[k][0]} ${N(a)}`, data: { title: 'مثّل المتباينة', lines: [`${v} ${SG[k][0]} ${N(a)}`], sol, ans: `${v} ${SG[k][0]} ${N(a)}` } }; }
  if (i === 1) { const a = pick([-3, -2, -1, 2, 3, 4, 10, -20, 15]), k = R(0, 3), big = Math.abs(a) >= 10, opts0 = SG.map(([s]) => `س ${s} ${N(a)}`), opts = shuf(opts0);
    return { q: 'اكتب المتباينة التي تصف مجموعة الحل المرسومة.', input: { type: 'pick', opts }, ok: x => opts[x] === opts0[k],
      hint: 'الدائرة المفتوحة أم المغلقة: هل العدد من الحل؟ والسهم: نحو الأصغر أم الأكبر؟', bad: () => 'انظر إلى الدائرة أولاً ثم إلى اتجاه السهم.',
      good: opts0[k], data: { title: 'اقرأ الرسم', show: raySol(a, k), lo: big ? -30 : -6, hi: big ? 30 : 6, step: big ? 5 : 1, label: big ? 2 : 1, ans: opts0[k] } }; }
  if (i === 2) { let a, b, c, k; do { a = pick([2, 4]); b = R(-6, 9); c = R(-6, 12); k = R(0, 3); } while (Math.abs((c - b) / a) > 5 || (c - b) % a !== 0 && (c - b) * 2 % a !== 0);
    const x = (c - b) / a, sol = raySol(x, k), v = 'س';
    return { q: `حلّ المتباينة ${ex([a, v], [b])} ${SG[k][0]} ${N(c)} ثم مثّل مجموعة الحل على خط الأعداد.`, input: { type: 'ray', min: -6, max: 6, step: .5, start: 0 }, sol, ok: q => same(q, sol),
      hint: 'تُحل المتباينة كالمعادلة: ما الذي تطرحه أولاً؟ وعلى ماذا تقسم؟', bad: q => why(q, sol),
      good: `${tm(a, v)} ${SG[k][0]} ${N(c - b)} ← ${v} ${SG[k][0]} ${N(x)}`, data: { title: 'حلّ ثم مثّل', lines: [`${ex([a, v], [b])} ${SG[k][0]} ${N(c)}`], sol, step: .5, label: 2, ans: `${v} ${SG[k][0]} ${N(x)}` } }; }
  if (i === 3) { const big = Math.random() < .5, a = R(-9, 9) + .5, k = big ? pick([3, 1]) : pick([2, 0]), ans = big ? Math.ceil(a) : Math.floor(a);
    return { q: `يمثّل م عدداً صحيحاً. ما ${big ? 'أصغر' : 'أكبر'} قيمة ممكنة للعدد م إذا كانت م ${SG[k][0]} ${N(a)}؟`, input: { type: 'num', neg: true }, sol: ans, ok: v => v === ans,
      hint: `مثّل المتباينة على خط الأعداد: ما أول عدد صحيح ${big ? 'على يمين' : 'على يسار'} الطرف؟`, bad: v => v === (big ? ans - 1 : ans + 1) ? 'هل يحقق هذا العدد المتباينة؟ عوّض وتحقق.' : '',
      good: `م = ${N(ans)}`, data: { title: 'عدد صحيح', lines: [`م ${SG[k][0]} ${N(a)}`], sol: raySol(a, k), ans: `م = ${N(ans)}`, step: 1 } }; }
  if (i === 4) { let lo, hi, k1, k2; do { lo = R(-5, 2); hi = R(lo + 4, Math.min(6, lo + 8)); k1 = R(0, 1); k2 = R(0, 1); } while (hi - lo < 4);
    const L = k1 ? '≤' : '<', H = k2 ? '≤' : '<', from = k1 ? lo : lo + 1, to = k2 ? hi : hi - 1, cnt = to - from + 1;
    return { q: `يمثّل م عدداً صحيحاً حيث ${N(lo)} ${L} م ${H} ${N(hi)}. كم عدداً صحيحاً يمكن أن يكون م؟`, input: { type: 'num' }, sol: cnt, ok: v => v === cnt,
      hint: 'هل الطرفان نفساهما من الحل؟ اكتب الأعداد الصحيحة بينهما وعدّها.', bad: v => v === hi - lo + 1 || v === hi - lo - 1 || v === hi - lo ? 'انتبه للطرفين: أيهما داخل وأيهما خارج؟' : '',
      good: `من ${N(from)} إلى ${N(to)}: ${N(cnt)} أعداد`, data: { title: 'أعداد بين حدين', lines: [`${N(lo)} ${L} م ${H} ${N(hi)}`], ans: `${N(cnt)} أعداد صحيحة` } }; }
  let p, q, P0; do { p = R(1, 5); q = R(1, 6); P0 = R(30, 80); } while ((P0 - p - q) % 3 !== 0);
  const x = (P0 - p - q) / 3, sol = raySol(x, 3);
  return { q: `أضلاع مثلث س + ${N(p)} و س و س + ${N(q)} سم، ومحيطه ${N(P0)} سم على الأقل. اكتب المتباينة وحلها ومثّل مجموعة الحل.`, input: { type: 'ray', min: 0, max: 30, step: 1, start: 10 }, sol, ok: v => same(v, sol),
    hint: '«على الأقل» تعني أكبر من العدد أو تساويه. اجمع الأضلاع الثلاثة أولاً.', bad: v => why(v, sol),
    good: `٣س + ${N(p + q)} ≥ ${N(P0)} ← س ≥ ${N(x)}`, data: { title: 'محيط المثلث', lines: [`(س + ${N(p)}) + س + (س + ${N(q)}) ≥ ${N(P0)}`], sol, lo: 0, hi: 30, step: 1, label: 5, ans: `س ≥ ${N(x)}` } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b, c] = fresh(() => { let a, b, c; do { a = R(2, 5); b = R(1, 9); c = R(b + a, 40); } while ((c - b) % a); return [a, b, c]; }); items.push(choice(`حل المتباينة ${ex([a, 'س'], [b])} < ${N(c)}:`, `س < ${N((c - b) / a)}`, [`س > ${N((c - b) / a)}`, `س < ${N(c - b)}`, `س ≤ ${N((c - b) / a)}`], 'حلها كالمعادلة مع إبقاء الإشارة.', '8Ae12')); }
  items.push(choice('الدائرة المغلقة على خط الأعداد تعني أن العدد:', 'من مجموعة الحل', ['ليس من مجموعة الحل', 'أكبر عدد ممكن', 'صفر دائماً'], 'مغلقة = مشمول.', '8Ae12'));
  { const a = fresh(() => R(-8, 8) + .5); items.push(num(`م عدد صحيح و م ≥ ${N(a)}. ما أصغر قيمة للعدد م؟`, Math.ceil(a), 'أول عدد صحيح بعد الطرف.', '8Ae12', { neg: true })); }
  { const a = fresh(() => R(-8, 8)); items.push(num(`م عدد صحيح و م < ${N(a)}. ما أكبر قيمة للعدد م؟`, a - 1, 'العدد نفسه ليس من الحل.', '8Ae12', { neg: true })); }
  items.push(tf('المتباينة س > ٣٫٥ تتضمن العدد ٣٫٥.', false, 'هل الإشارة فيها «يساوي»؟', '8Ae12', 'تُرسم بدائرة مفتوحة.'));
  items.push(tf('«على الأقل ٥٠» تعني ٥٠ أو أكثر.', true, 'هل ٥٠ نفسها مقبولة؟', '8Ae12', 'نكتبها ≥ ٥٠.'));
  { const [lo, hi] = fresh(() => { const l = R(-4, 1); return [l, R(l + 3, 6)]; }); items.push(num(`كم عدداً صحيحاً م يحقق ${N(lo)} ≤ م < ${N(hi)}؟`, hi - lo, 'الطرف الأيسر داخل والأيمن خارج.', '8Ae12')); }
  { const [k, c] = fresh(() => [R(2, 4), R(3, 9)]); items.push(num(`حلّ المتباينة ${N(k)}(س + ١) ≥ ${N(k * (c + 1))}. ما أصغر قيمة للعدد س؟`, c, 'اقسم على العدد خارج القوس ثم اطرح.', '8Ae12')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'خط الأعداد السري', icon: '📏', who, rounds: 6, make, draw,
  intro: ['أنا الضابط عزيز. المشتبه به لم يترك رقماً واحداً… ترك مجموعة أرقام!', 'المتباينة تصف مجموعة كاملة من الحلول، وأنا أرسمها على خط الأعداد: دائرة وسهم. هيا نرسم.'],
  outro: ['رائع! صار خط الأعداد يكشف كل الاحتمالات.', 'تحدي المتباينات.'],
  challenge: { title: 'تحدي المتباينات', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
