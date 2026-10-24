// ١٢-٤ نظرية فيثاغورس — «سقالة الترميم»: المرمّمة أسماء ترمّم الجدران العالية. في المثلث القائم مربع طول الوتر يساوي مجموع مربعي الضلعين
// الآخرين (أ² = ب² + ج²): الوتر من الضلعين، وضلع من الوتر والآخر، والسلّم على الحائط، وقطر بلاطة مستطيلة، وهل المثلث قائم؟ وأقرب منزلة
// عشرية بالآلة الحاسبة. أطوال المطلوب «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Gs6 (الكتاب ص٧٧–٧٨).
import { mission } from '../../mission.js';
import { N, R, eq, pw, rt } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { tileBg, say, glow, rightTri, NAVY } from './art.js';

const who = { name: 'المرمّمة أسماء', face: '👩🏽‍🔧', id: 'asma' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const r1 = v => Math.round(v * 10) / 10;
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15], [20, 21, 29], [12, 16, 20]];
const lab = (v, u) => `${N(v)} ${u}`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; tileBg(g, w, h, t); say(g, '🪜 ' + (r.title || 'سقالة الترميم'), w * .5, h * .1, 18, NAVY, 900);
  if (r.ladder) { const x0 = w * .72, y0 = h * .82; g.fillStyle = '#E7D3B5'; g.fillRect(x0, h * .15, 26, y0 - h * .15); g.strokeStyle = '#78350F'; g.lineWidth = 2; for (let y = h * .2; y < y0; y += 18) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 26, y); g.stroke(); }
    g.fillStyle = '#A3A3A3'; g.fillRect(w * .1, y0, w * .8, 8); const bx = x0 - w * .3, ty = h * .25; g.strokeStyle = '#B45309'; g.lineWidth = 6; g.beginPath(); g.moveTo(bx, y0); g.lineTo(x0, ty); g.stroke(); g.lineWidth = 3; for (let k = 1; k < 8; k++) { const u = k / 8, px = bx + (x0 - bx) * u, py = y0 + (ty - y0) * u; g.beginPath(); g.moveTo(px - 8, py - 4); g.lineTo(px + 8, py + 4); g.stroke(); }
    say(g, r.la, (bx + x0) / 2 - 30, (y0 + ty) / 2 - 6, 16, '#DC2626', 900); say(g, S.done || r.knownB ? r.lb : '؟', (bx + x0) / 2, y0 + 26, 16, NAVY, 900); say(g, S.done || !r.askH ? r.lh : '؟', x0 + 50, (y0 + ty) / 2, 16, NAVY, 900); }
  else if (r.tri) rightTri(g, w * .2, h * .2, w * .5, h * .58, r.tri[0] === null && !S.done ? '؟' : r.tri[0], r.tri[1] === null && !S.done ? '؟' : r.tri[1], r.tri[2] === null && !S.done ? '؟' : r.tri[2]);
  if (r.cap) say(g, S.done ? r.done : r.cap, w * .5, h * .95, 16, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const [a, b, c] = pick(TRIPLES), k = pick([1, 1, 2, 10]), u = k === 10 ? 'سم' : 'م';
    return { q: `في جدار الدار مثلث قائم ضلعاه القائمان ${lab(a * k, u)} و${lab(b * k, u)}. ما طول الوتر؟`, input: { type: 'num', calc: true, dot: true }, sol: c * k, ok: v => eq(v, c * k),
      hint: 'ربّع الضلعين واجمعهما: هذا مربع الوتر. ثم ما العدد الذي مربعه هذا المجموع؟', bad: v => eq(v, (a + b) * k) ? 'لا تجمع الطولين مباشرة: اجمع مربعيهما.' : eq(v, (a * a + b * b) * k * k) ? 'هذا مربع الوتر: خذ الجذر التربيعي.' : '',
      good: `أ² = ${pw(a * k, 2)} + ${pw(b * k, 2)} = ${N(c * c * k * k)} ← أ = ${N(c * k)}`, data: { tri: [lab(a * k, u), lab(b * k, u), null], cap: 'الوتر = ؟', done: `الوتر ${lab(c * k, u)}`, title: 'طول الوتر' } }; }
  if (i === 1) { const [a, b, c] = pick(TRIPLES);
    return { q: `وتر مثلث قائم ${lab(c, 'م')} وأحد ضلعيه القائمين ${lab(b, 'م')}. ما طول الضلع الآخر؟`, input: { type: 'num', calc: true, dot: true }, sol: a, ok: v => eq(v, a),
      hint: 'الوتر هو الأطول: مربع الضلع المجهول = مربع الوتر − مربع الضلع المعلوم.', bad: v => eq(v, r1(Math.sqrt(c * c + b * b))) ? 'جمعت المربعين: الوتر هو الأطول، فاطرح.' : eq(v, c - b) ? 'اطرح المربعين لا الطولين.' : '',
      good: `${pw(c, 2)} − ${pw(b, 2)} = ${N(a * a)} ← ${N(a)}`, data: { tri: [lab(b, 'م'), null, lab(c, 'م')], cap: 'الضلع = ؟', done: `الضلع ${lab(a, 'م')}`, title: 'ضلع قائم' } }; }
  if (i === 2) { let L, d; do { L = R(30, 80) / 10; d = R(8, 25) / 10; } while (d >= L || eq(r1(Math.sqrt(L * L - d * d)), Math.sqrt(L * L - d * d)));
    const hgt = r1(Math.sqrt(L * L - d * d));
    return { q: `أسندت أسماء سلّماً طوله ${N(L)} م إلى حائط رأسي، والمسافة الأفقية بين أسفل السلّم والحائط ${N(d)} م. كم ارتفاع أعلى السلّم على الحائط لأقرب منزلة عشرية؟`, input: { type: 'num', calc: true, dot: true }, sol: hgt, ok: v => eq(v, hgt),
      hint: 'السلّم هو الوتر. أي الضلعين مجهول؟ اطرح المربعين ثم خذ الجذر.', bad: v => eq(v, r1(Math.sqrt(L * L + d * d))) ? 'السلّم هو الوتر الأطول: اطرح لا تجمع.' : eq(v, r1(L - d)) ? 'اطرح المربعين لا الطولين.' : '',
      good: `${rt(`${pw(L, 2)} − ${pw(d, 2)}`)} ≈ ${N(hgt)} م`, data: { ladder: 1, la: `${N(L)} م`, lb: `${N(d)} م`, lh: `${N(hgt)} م`, knownB: 1, askH: 1, cap: 'الارتفاع = ؟', done: `الارتفاع ≈ ${N(hgt)} م`, title: 'السلّم على الحائط' } }; }
  if (i === 3) { let a, b; do { a = R(10, 60); b = R(10, 60); } while (a === b || eq(r1(Math.hypot(a, b)), Math.hypot(a, b)));
    const d = r1(Math.hypot(a, b));
    return { q: `بلاطة مستطيلة طولها ${N(a)} سم وعرضها ${N(b)} سم. ما طول قطرها لأقرب منزلة عشرية بالسنتيمتر؟`, input: { type: 'num', calc: true, dot: true }, sol: d, ok: v => eq(v, d),
      hint: 'القطر يقسم المستطيل إلى مثلثين قائمين: ما الوتر فيهما؟', bad: v => eq(v, a + b) ? 'اجمع المربعين لا الطولين.' : '',
      good: `${rt(`${pw(a, 2)} + ${pw(b, 2)}`)} ≈ ${N(d)}`, data: { tri: [`${N(b)} سم`, `${N(a)} سم`, null], cap: 'القطر = ؟', done: `القطر ≈ ${N(d)} سم`, title: 'قطر البلاطة' } }; }
  if (i === 4) { const right = Math.random() < .5, [a, b, c] = pick(TRIPLES), cc = right ? c : c + pick([1, -1]);
    return { q: `أطوال أضلاع مثلث في الزخرفة ${N(a)} و${N(b)} و${N(cc)} سم. هل هو مثلث قائم الزاوية؟`, input: { type: 'pick', opts: ['نعم، قائم الزاوية', 'لا، ليس قائماً'] }, ok: v => v === (right ? 0 : 1),
      hint: 'هل مربع أطول ضلع يساوي مجموع مربعي الضلعين الآخرين؟', bad: () => `${pw(a, 2)} + ${pw(b, 2)} = ${N(a * a + b * b)}، و${pw(cc, 2)} = ${N(cc * cc)}.`,
      good: right ? `${N(a * a)} + ${N(b * b)} = ${N(c * c)}` : `${N(a * a + b * b)} ≠ ${N(cc * cc)}`, data: { tri: [`${N(a)}`, `${N(b)}`, `${N(cc)}`], cap: 'قائم؟', done: right ? 'قائم الزاوية' : 'ليس قائماً', title: 'هل هو قائم؟' } }; }
  let a, b; do { a = R(12, 40) / 10; b = R(12, 40) / 10; } while (eq(r1(Math.hypot(a, b)), Math.hypot(a, b)));
  const c = r1(Math.hypot(a, b));
  return { q: `مثلث قائم ضلعاه القائمان ${N(a)} م و${N(b)} م. ما طول وتره لأقرب منزلة عشرية؟`, input: { type: 'num', calc: true, dot: true }, sol: c, ok: v => eq(v, c),
    hint: 'ربّع الضلعين واجمع، ثم الجذر التربيعي بالآلة الحاسبة، ثم قرّب.', bad: v => eq(v, r1(a + b)) ? 'اجمع المربعين لا الطولين.' : '',
    good: `${rt(`${pw(a, 2)} + ${pw(b, 2)}`)} ≈ ${N(c)}`, data: { tri: [`${N(a)} م`, `${N(b)} م`, null], cap: 'الوتر = ؟', done: `الوتر ≈ ${N(c)} م`, title: 'أطوال عشرية' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b, c] = fresh(() => pick(TRIPLES)); items.push(num(`مثلث قائم ضلعاه القائمان ${N(a)} و${N(b)}. ما طول الوتر؟`, c, 'أ² = ب² + ج².', '8Gs6')); }
  { const [a, b, c] = fresh(() => pick(TRIPLES)); items.push(num(`وتر مثلث قائم ${N(c)} وأحد ضلعيه ${N(a)}. ما الضلع الآخر؟`, b, 'اطرح المربعين.', '8Gs6')); }
  items.push(choice('في المثلث القائم، الوتر هو:', 'الضلع المقابل للزاوية القائمة', ['أقصر الأضلاع', 'الضلع المجاور للزاوية القائمة', 'أي ضلع'], 'أطول ضلع.', '8Gs6'));
  items.push(tf('المثلث الذي أضلاعه ٦ و٨ و١٠ قائم الزاوية.', true, '٣٦ + ٦٤.', '8Gs6', '٣٦ + ٦٤ = ١٠٠.'));
  items.push(tf('المثلث الذي أضلاعه ٤ و٥ و٦ قائم الزاوية.', false, '١٦ + ٢٥ = ٤١.', '8Gs6', '٤١ ≠ ٣٦.'));
  items.push(num('سلّم طوله ٥ م أسفله على بعد ٣ م من الحائط. كم ارتفاع أعلاه بالأمتار؟', 4, '٢٥ − ٩ = ١٦.', '8Gs6'));
  items.push(num('مثلث قائم ضلعاه القائمان ١٫٢ م و٠٫٩ م. ما وتره بالأمتار؟', 1.5, '١٫٤٤ + ٠٫٨١ = ٢٫٢٥.', '8Gs6', { dot: true }));
  { const [a, b, c] = fresh(() => pick(TRIPLES)); items.push(choice(`أطوال ${N(a)} و${N(b)} و${N(c)}:`, 'تكوّن مثلثاً قائماً', ['لا تكوّن مثلثاً قائماً', 'تكوّن مثلثاً متطابق الأضلاع'], 'قارن مربع الأطول بمجموع مربعي الآخرين.', '8Gs6')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'سقالة الترميم', icon: '🪜', who, rounds: 6, make, draw,
  intro: ['أنا أسماء، أرمّم جدران الدار العالية. السلالم والدعامات كلها مثلثات قائمة.', 'ولي صديق قديم اسمه فيثاغورس: مربع الوتر يساوي مجموع مربعي الضلعين الآخرين!'],
  outro: ['ممتاز! كل سلّم وكل دعامة بطولها الصحيح.', 'تحدي نظرية فيثاغورس.'],
  challenge: { title: 'تحدي فيثاغورس', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
