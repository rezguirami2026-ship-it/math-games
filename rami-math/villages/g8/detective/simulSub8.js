// ١٠-٣ حل معادلتين آنياً بالتعويض — «الشاهدان»: المفتش جاسم يستمع إلى شاهدين، لكل منهما معادلة، والقيمتان المجهولتان تحققان المعادلتين معاً.
// المجموع والفرق، والتعويض بـ ص = …، وخطوات التعويض، وأي زوج يحقق المعادلتين، ومسألة التذاكر. الإجابات في خانتين (س وص).
// الشاهدان بفقاعتي كلامهما، والقيمتان «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Ae10 (الكتاب ص٣٧–٣٨).
import { mission } from '../../mission.js';
import { N, R, tm, ex } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { officeBg, say, glow, witness, safe } from './art.js';

const who = { name: 'المفتش جاسم', face: '👮🏽‍♂️', id: 'jasim' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const pair = (x, y) => `(${N(x)}، ${N(y)})`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; officeBg(g, w, h, t);
  say(g, '🗣️ ' + (r.title || 'الشاهدان'), w * .5, h * .12, 18, '#1E3A8A', 900);
  const e = r.eqs || [];
  if (e[0]) witness(g, w * .74, h * .62, Math.min(46, h * .1), '#B45309', e[0]);
  if (e[1]) witness(g, w * .26, h * .62, Math.min(46, h * .1), '#0F766E', e[1]);
  safe(g, w * .5, h * .82, Math.min(70, w * .1), S.done ? N(r.x) : '؟', S.done ? N(r.y) : '؟', !!S.done);
  glow(g, w, h, S);
}
const two = (neg = false) => ({ type: 'blanks', tpl: 'س = {} ، ص = {}', neg });

function make(i) {
  if (i === 0) { let x, y; do { x = R(5, 60); y = R(3, 50); } while (x <= y);
    const S0 = x + y, D = x - y;
    return { q: `قال الشاهد الأول: مجموع العددين ${N(S0)}. وقال الثاني: الفرق بينهما ${N(D)}. إذا كان س الأكبر وص الأصغر، فما العددان؟`, input: two(), sol: [x, y], ok: v => v[0] === x && v[1] === y,
      hint: 'من المعادلة الثانية: س = ص + الفرق. عوّض بها في الأولى. كم ص؟', bad: v => v[0] === y && v[1] === x ? 'س هو الأكبر.' : v[0] + v[1] === S0 ? 'المجموع صحيح، لكن هل الفرق صحيح؟' : '',
      good: `ص + ${N(D)} + ص = ${N(S0)} ← ص = ${N(y)} ، س = ${N(x)}`, data: { title: 'مجموع وفرق', eqs: [`س + ص = ${N(S0)}`, `س − ص = ${N(D)}`], x, y } }; }
  if (i === 1) { let a, b, k, m, x, y; do { a = R(2, 5); b = R(2, 4); k = R(2, 3); m = R(-6, 6, true); x = R(1, 12); y = k * x + m; } while (y <= 0 || a * x + b * y > 150);
    const c = a * x + b * y;
    return { q: `حلّ المعادلتين الآنيتين: ${ex([a, 'س'], [b, 'ص'])} = ${N(c)} و ص = ${ex([k, 'س'], [m])}`, input: two(true), sol: [x, y], ok: v => v[0] === x && v[1] === y,
      hint: 'ص معروفة بدلالة س: ضعها داخل قوسين مكان ص في المعادلة الأولى.', bad: v => v[0] === x ? 'س صحيحة! عوّض بها في المعادلة الثانية لتجد ص.' : '',
      good: `${tm(a, 'س')} + ${N(b)}(${ex([k, 'س'], [m])}) = ${N(c)} ← س = ${N(x)} ، ص = ${N(y)}`, data: { title: 'التعويض', eqs: [`${ex([a, 'س'], [b, 'ص'])} = ${N(c)}`, `ص = ${ex([k, 'س'], [m])}`], x, y } }; }
  if (i === 2) { let a, b, c, x, y; do { a = R(2, 4); b = R(-8, 8, true); c = R(2, 6); x = R(-5, 9, true); y = a * x + b; } while (Math.abs(y) > 40);
    const d = R(1, 5), e = c * x + d * y;
    return { q: `إذا كانت ص = ${ex([a, 'س'], [b])} و ${ex([c, 'س'], [d, 'ص'])} = ${N(e)}، فما قيمة س؟`, input: { type: 'num', neg: true }, sol: x, ok: v => v === x,
      hint: 'عوّض بعبارة ص في المعادلة الثانية، ثم فك الأقواس واجمع حدود س.', bad: v => v === y ? 'هذه قيمة ص، والسؤال عن س.' : '',
      good: `${tm(c, 'س')} + ${N(d)}(${ex([a, 'س'], [b])}) = ${N(e)} ← س = ${N(x)}`, data: { title: 'قيمة س', eqs: [`ص = ${ex([a, 'س'], [b])}`, `${ex([c, 'س'], [d, 'ص'])} = ${N(e)}`], x, y } }; }
  if (i === 3) { let a, b, k, m, x, y; do { a = R(2, 5); b = R(2, 3); k = 2; m = R(-6, -1); x = R(2, 12); y = k * x + m; } while (y <= 0);
    const c = a * x + b * y, ab = b * m, sc = a + b * k;
    const step = (eq, right, wrongs) => { const opts = shuf([right, ...wrongs]); return { eq, opts, ok: opts.indexOf(right) }; };
    const st = [step(`${ex([a, 'س'], [b, 'ص'])} = ${N(c)}`, `ضع ${ex([k, 'س'], [m])} مكان ص داخل قوسين`, [`ضع ${ex([k, 'س'], [m])} مكان س`, 'اجمع المعادلتين']),
      step(`${tm(a, 'س')} + ${N(b)}(${ex([k, 'س'], [m])}) = ${N(c)}`, 'اضرب خارج الأقواس', [`اقسم الطرفين على ${N(b)}`, `اطرح ${N(b)} من الطرفين`]),
      step(`${ex([a, 'س'], [b * k, 'س'], [ab])} = ${N(c)}`, `اجمع حدود س وأضف ${N(-ab)} إلى الطرفين`, [`اطرح ${N(-ab)} من الطرفين`, `اجمع ${N(a)} و${N(c)}`]),
      step(`${tm(sc, 'س')} = ${N(c - ab)}`, `اقسم الطرفين على ${N(sc)}`, [`اطرح ${N(sc)} من الطرفين`, `اضرب الطرفين في ${N(sc)}`]),
      step(`س = ${N(x)}`, `عوّض س = ${N(x)} في ص = ${ex([k, 'س'], [m])}`, ['انتهى الحل', `عوّض س = ${N(x)} في ص = ${N(c)}`])];
    return { q: `حلّ المعادلتين الآنيتين بالتعويض خطوة خطوة: ${st[0].eq} و ص = ${ex([k, 'س'], [m])}`, input: { type: 'steps', steps: st, final: `ص = ${N(y)}` }, sol: st.map(s => s.ok), ok: v => v.length === st.length && v.every((q, j) => q === st[j].ok),
      hint: 'ما المعادلة التي تعطيك ص جاهزة؟ وأين تضعها؟', bad: v => ['التعويض يضع عبارة ص كاملة مكان ص.', 'الأقواس أولاً.', 'اجمع حدود س، وتخلّص من العدد في طرفها.', 'العملية العكسية للضرب.', 'وجدت س فقط: بقيت ص!'][v.length - 1] || '',
      good: `س = ${N(x)} ، ص = ${N(y)}`, data: { title: 'خطوات التعويض', eqs: [`${ex([a, 'س'], [b, 'ص'])} = ${N(c)}`, `ص = ${ex([k, 'س'], [m])}`], x, y } }; }
  if (i === 4) { let x, y, a, b; do { x = R(-5, 9); y = R(-5, 9); a = R(2, 5); b = R(1, 4); } while (x === y || x === 0 || y === 0);
    const e1 = x + y, e2 = a * x - b * y, cands = shuf([[x, y], [y, x], [x, -y], [x + 1, y - 1]].filter((p, k, A) => A.findIndex(q => q + '' === p + '') === k));
    const opts = cands.map(p => pair(...p)), ans = cands.findIndex(p => p[0] === x && p[1] === y);
    return { q: `أي زوج (س، ص) يحقق المعادلتين معاً: س + ص = ${N(e1)} و ${ex([a, 'س'], [-b, 'ص'])} = ${N(e2)}؟`, input: { type: 'pick', opts }, ok: v => v === ans,
      hint: 'عوّض بكل زوج في المعادلتين: هل تتحقق كلتاهما؟', bad: v => { const [p, q] = cands[v]; return p + q === e1 ? 'يحقق الأولى فقط: جرّبه في الثانية.' : 'لا يحقق الأولى.'; },
      good: `${pair(x, y)} يحقق المعادلتين`, data: { title: 'أي زوج؟', eqs: [`س + ص = ${N(e1)}`, `${ex([a, 'س'], [-b, 'ص'])} = ${N(e2)}`], x, y } }; }
  const [A1, C1] = pick([[3, 2], [4, 2], [5, 3], [2, 1]]); let x, y; do { x = R(6, 15); y = R(6, 15); } while (x === y);
  const tot = x + y, money = A1 * x + C1 * y;
  const rl = n => n === 1 ? 'ريال واحد' : n === 2 ? 'ريالان' : `${N(n)} ريالات`;
  return { q: `بِيعت ${N(tot)} تذكرة لعرض المتحف: تذكرة الكبير ${rl(A1)} والصغير ${rl(C1)}، والمبلغ كله ${N(money)} ريالاً. إذا كان س عدد تذاكر الكبار وص عدد تذاكر الصغار، فكم كلٌّ منهما؟`, input: two(), sol: [x, y], ok: v => v[0] === x && v[1] === y,
    hint: 'اكتب معادلة للعدد ومعادلة للمال. من الأولى: ص = المجموع − س.', bad: v => v[0] + v[1] === tot ? 'العدد صحيح، لكن هل المال صحيح؟' : '',
    good: `س + ص = ${N(tot)} و ${ex([A1, 'س'], [C1, 'ص'])} = ${N(money)}`, data: { title: 'تذاكر المتحف', eqs: [`س + ص = ${N(tot)}`, `${ex([A1, 'س'], [C1, 'ص'])} = ${N(money)}`], x, y } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [x, y] = fresh(() => { let a, b; do { a = R(10, 50); b = R(2, 30); } while (a <= b); return [a, b]; }); items.push(num(`مجموع عددين ${N(x + y)} والفرق بينهما ${N(x - y)}. ما العدد الأكبر؟`, x, 'س = ص + الفرق، ثم عوّض.', '8Ae10')); }
  { const [x, k, m] = fresh(() => [R(1, 9), R(2, 4), R(-3, 5)]); const y = k * x + m; items.push(num(`إذا كانت ص = ${ex([k, 'س'], [m])} و س + ص = ${N(x + y)}، فما س؟`, x, 'عوّض بعبارة ص في المعادلة الثانية.', '8Ae10', { neg: true })); }
  { const [x, y] = fresh(() => [R(1, 9), R(1, 9)]); items.push(choice(`حل المعادلتين س + ص = ${N(x + y)} و س − ص = ${N(x - y)}:`, pair(x, y), [pair(y, x), pair(x + 1, y - 1), pair(x, -y)], 'عوّض بالزوج في المعادلتين.', '8Ae10')); }
  items.push(tf('المعادلتان الآنيتان تتحققان بالقيمتين نفسيهما في الوقت ذاته.', true, 'ما معنى «آنياً»؟', '8Ae10', 'آنياً = معاً في الوقت نفسه.'));
  items.push(tf('عند التعويض بـ ص = ٢س − ٥ في ٣س + ٢ص = ٦٠ نكتب ٣س + ٢ × ٢س − ٥ = ٦٠ بلا أقواس.', false, 'هل تُضرب ٢ في الحدين معاً؟', '8Ae10', 'نكتب ٣س + ٢(٢س − ٥) = ٦٠.'));
  { const [x, a] = fresh(() => [R(2, 9), R(2, 4)]); items.push(num(`إذا كانت ص = ${tm(a, 'س')} و س + ص = ${N((a + 1) * x)}، فما ص؟`, a * x, 'أوجد س أولاً.', '8Ae10')); }
  { const [x, y] = fresh(() => [R(2, 12), R(2, 12)]); items.push(num(`س + ص = ${N(x + y)} و ص = ${N(y)}. ما س؟`, x, 'عوّض مباشرة.', '8Ae10')); }
  { const [x, y] = fresh(() => [R(3, 10), R(2, 8)]); items.push(num(`٣س + ٢ص = ${N(3 * x + 2 * y)} و ص = ${N(y)}. ما س؟`, x, 'عوّض بقيمة ص ثم حل.', '8Ae10')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'الشاهدان', icon: '🗣️', who, rounds: 6, make, draw,
  intro: ['أنا المفتش جاسم. عندي شاهدان، كل واحد يعطيني معلومة عن رقمي الخزنة.', 'كل معلومة وحدها لا تكفي… لكن المعلومتين معاً تكشفان الرقمين. هذا هو الحل الآني!'],
  outro: ['انفتحت الخزنة! الرقمان يحققان كلام الشاهدين معاً.', 'تحدي الحل بالتعويض.'],
  challenge: { title: 'تحدي التعويض', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
