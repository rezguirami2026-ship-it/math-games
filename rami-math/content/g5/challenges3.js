// تحديات الصف الخامس — الميناء (الوحدة ٥: الأشكال، والوحدة ٦: الموقع والحركة في الكتاب).
// ٨ جولات لكل درس تغطي مخرجاته (content/g5/outcomes.js). الإحداثيات في الربع الأول فقط كما في المنهج.
import { ar } from '../../core/util.js';
import { choice, multi, num, tf, sort, pickN, fresh, error } from '../../missions/challenge.js';
import { shape, net, cubeNet, BAD_NETS, solid, pt } from '../chGeo.js';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const N = n => ar(n);
const shuffle = a => pickN(a, a.length);
const INK = '#2A1B66', ACC = '#E2475C', FILL = '#FFE3A3';
/* شبكة الربع الأول من ٠ إلى n: نقاط بأسماء، ومضلعات، وخط مرآة رأسي أو أفقي */
function quad({ n = 8, pts = [], shapes = [], mirror = null } = {}) {
  const s = 24, o = 22, X = x => o + x * s, Y = y => o + (n - y) * s, W = o * 2 + n * s; let g = `<svg viewBox="0 0 ${W} ${W}" class="chGrid" style="max-width:${W}px">`;
  for (let i = 0; i <= n; i++) g += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(n)}" stroke="#D5DBE8"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}" stroke="#D5DBE8"/>`;
  g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(n) + 8}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(n) - 8}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = 0; i <= n; i++) g += `<text x="${X(i)}" y="${Y(0) + 15}" font-size="10" font-weight="800" fill="${INK}" text-anchor="middle">${ar(i)}</text>` + (i ? `<text x="${X(0) - 8}" y="${Y(i) + 4}" font-size="10" font-weight="800" fill="${INK}" text-anchor="end">${ar(i)}</text>` : '');
  if (mirror) g += mirror.x != null ? `<line x1="${X(mirror.x)}" y1="${Y(0)}" x2="${X(mirror.x)}" y2="${Y(n)}" stroke="#2E9E5B" stroke-width="3" stroke-dasharray="6 4"/>` : `<line x1="${X(0)}" y1="${Y(mirror.y)}" x2="${X(n)}" y2="${Y(mirror.y)}" stroke="#2E9E5B" stroke-width="3" stroke-dasharray="6 4"/>`;
  shapes.forEach(sh => { g += `<polygon points="${sh.p.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="${sh.c || FILL}" fill-opacity=".85" stroke="${INK}" stroke-width="2" ${sh.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    if (sh.l) { const cx = sh.p.reduce((a, q) => a + q[0], 0) / sh.p.length, cy = sh.p.reduce((a, q) => a + q[1], 0) / sh.p.length; g += `<text x="${X(cx)}" y="${Y(cy) + 5}" font-size="14" font-weight="900" fill="${INK}" text-anchor="middle">${sh.l}</text>`; } });
  pts.forEach(p => { g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" fill="${p.c || ACC}"/>` + (p.l ? `<text x="${X(p.x) + 8}" y="${Y(p.y) - 7}" font-size="13" font-weight="900" fill="${p.c || ACC}">${p.l}</text>` : ''); });
  return g + '</svg>';
}
/* زوج خطوط: متوازيان أو متعامدان أو متقاطعان بزاوية أخرى، بميل عشوائي */
function linePair(kind) {
  const a = R(0, 170) * Math.PI / 180, d = kind === 'par' ? 0 : kind === 'perp' ? Math.PI / 2 : (R(25, 65) * Math.PI / 180), L = 70;
  const seg = (cx, cy, t) => `<line x1="${cx - L * Math.cos(t)}" y1="${cy - L * Math.sin(t)}" x2="${cx + L * Math.cos(t)}" y2="${cy + L * Math.sin(t)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  const off = kind === 'par' ? 26 : 0, nx = -Math.sin(a) * off, ny = Math.cos(a) * off;
  return `<svg viewBox="0 0 200 160" class="chShape" style="width:200px;height:160px">${seg(100 - nx, 80 - ny, a)}${seg(100 + nx, 80 + ny, a + d)}</svg>`;
}
const LETTERS = { par: ['N', 'Z'], perp: ['L', 'T'], both: ['E', 'F', 'H'] };
const TYPE = ['متطابق الأضلاع', 'متطابق الضلعين', 'مختلف الأضلاع'];
const triType = (a, b, c) => a === b && b === c ? 0 : a === b || b === c || a === c ? 1 : 2;
const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;

export const CH = {
  /* ٥-١ الخطوط المتوازية والمتعامدة: Gs5 */
  parallelPerp5: { who: 'saif', title: 'تحدي سيف', lines: [{ who: 'saif', text: 'حبال المرسى مشدودة كما يجب! تميّز المتوازي من المتعامد في كل مكان.' }],
    make() {
      const it = [];
      { const k = pickN(['par', 'perp', 'other'], 1)[0], lab = { par: 'متوازيان', perp: 'متعامدان', other: 'متقاطعان وليسا متعامدين' };
        it.push(choice('صِف الخطين:', lab[k], Object.keys(lab).filter(x => x !== k).map(x => lab[x]), 'المتوازيان لا يلتقيان أبداً، والمتعامدان يلتقيان بزاوية قائمة.', 'Gs5', { art: linePair(k) })); }
      { const k = pickN(['par', 'perp'], 1)[0], L2 = k === 'par' ? ['par', 'par', 'other', 'perp'] : ['perp', 'perp', 'other', 'par'];
        it.push(choice(`أي رسم فيه خطان <b>${k === 'par' ? 'متوازيان' : 'متعامدان'}</b>؟`, linePair(k), [linePair('other'), linePair(k === 'par' ? 'perp' : 'par')], k === 'par' ? 'المسافة بين المتوازيين ثابتة.' : 'المتعامدان يصنعان زاوية قائمة مثل ركن الورقة.', 'Gs5')); }
      { const L = [...pickN(LETTERS.par, 2).map(l => ({ label: l, bin: 0 })), ...pickN(LETTERS.perp, 2).map(l => ({ label: l, bin: 1 })), ...pickN(LETTERS.both, 2).map(l => ({ label: l, bin: 2 }))];
        it.push(sort('افرز الحروف حسب الخطوط فيها:', ['خطوط متوازية فقط', 'خطوط متعامدة فقط', 'متوازية ومتعامدة'], L, 'تخيّل كل خط مستقيم في الحرف: هل يوجد خطان لا يلتقيان؟ هل يوجد خطان بزاوية قائمة؟', 'Gs5')); }
      { const S = pickN([['المسافة بين خطين متوازيين ثابتة دائماً.', true, 'لهذا لا يلتقيان مهما مددناهما.'], ['الخطان المتوازيان يلتقيان إذا مددناهما بما يكفي.', false, 'المسافة بينهما ثابتة فلا يلتقيان أبداً.'],
          ['الخطان المتعامدان يلتقيان بزاوية قياسها ٩٠°.', true, 'الزاوية القائمة قياسها ٩٠°.'], ['كل خطين متقاطعين متعامدان.', false, 'قد يتقاطعان بزاوية حادة أو منفرجة.']], 1)[0];
        it.push(tf(S[0], S[1], 'فكّر في قضبان السكة وركن الورقة.', 'Gs5', S[2])); }
      { const K = pickN([['square', 2], ['rect', 2], ['para', 2], ['trap', 1], ['kite', 0], ['right', 0], ['rhombus', 2]], 1)[0];
        it.push(num('كم <b>زوجاً</b> من الأضلاع المتوازية في هذا الشكل؟', K[1], 'مرّر إصبعك على كل ضلعين متقابلين: هل يبقى البعد بينهما ثابتاً؟', 'Gs5', { dot: false, art: shape(K[0]) })); }
      { const K = pickN([['square', 4], ['rect', 4], ['right', 1], ['trap', 0], ['para', 0], ['rhombus', 0]], 1)[0];
        it.push(num('كم <b>زاوية قائمة</b> في هذا الشكل؟', K[1], 'ضلعان متعامدان يصنعان زاوية قائمة: ابحث عن أركان مثل ركن الورقة.', 'Gs5', { dot: false, art: shape(K[0]) })); }
      { const P = shuffle(['قضبان سكة الحديد', 'حافتا المسطرة الطويلتان', 'درجات السلّم']).slice(0, 2), Q = shuffle(['ركن الكتاب', 'عمود الإنارة والأرض', 'عقربا الساعة عند الثالثة تماماً']).slice(0, 2);
        it.push(sort('افرز ما تراه في الميناء:', ['خطوط متوازية', 'خطوط متعامدة'], [...P.map(l => ({ label: l, bin: 0 })), ...Q.map(l => ({ label: l, bin: 1 }))], 'المتوازية لا تلتقي، والمتعامدة تلتقي بزاوية قائمة.', 'Gs5')); }
      { const a = R(2, 6), same = R(0, 1) === 1, b = same ? a : a + R(1, 3);
        it.push(tf(`قاس سيف المسافة بين حبلين عند طرفيهما: <b>${N(a)}</b> سم و<b>${N(b)}</b> سم. فقال: «الحبلان متوازيان».`, same, 'المتوازيان تكون المسافة بينهما ثابتة عند أي موضع.', 'Gs5', same ? 'المسافة ثابتة.' : 'المسافة تتغير، فالحبلان سيلتقيان.')); }
      return it;
    } },

  /* ٥-٢ المثلثات: Gs1 */
  triangles5a: { who: 'layla', title: 'تحدي ليلى', lines: [{ who: 'layla', text: 'أشرعة مصنّفة بدقة! تعرف المثلث متطابق الأضلاع ومتطابق الضلعين ومختلف الأضلاع.' }],
    make() {
      const f = fresh(), it = [];
      { const t = R(0, 2), a = f(3, 9), b = t === 0 ? a : t === 1 ? a : f(3, 9), c = t === 0 ? a : t === 1 ? f(3, 9) : f(3, 9); const S = shuffle([a, b, c]);
        it.push(choice(`شراع مثلث أطوال أضلاعه: <b>${S.map(N).join(' سم، ')} سم</b>. ما نوعه؟`, TYPE[triType(...S)], TYPE.filter((_, i) => i !== triType(...S)), 'قارن الأطوال: هل الثلاثة متساوية؟ أم اثنان فقط؟', 'Gs1')); }
      { const s = f(3, 12);
        it.push(num(`صنعت ريم مثلثاً <b>متطابق الأضلاع</b> من خيط، طول ضلعه <b>${N(s)}</b> سم. كم سنتيمتراً طول الخيط؟`, 3 * s, 'الأضلاع الثلاثة متساوية: اجمعها.', 'Gs1', { dot: false })); }
      { const a = f(3, 6), b = a + R(1, 3), L = shuffle([a, b, b + 2, a - 1, a + b + 5].filter((v, i, A) => v > 0 && A.indexOf(v) === i));
        it.push(multi(`مثلث <b>متطابق الضلعين</b>، قاست ليلى ضلعين منه: <b>${N(a)}</b> سم و<b>${N(b)}</b> سم. ما الأطوال الممكنة للضلع الثالث؟`, L.map(v => N(v) + ' سم'), s => [a, b].map(v => N(v) + ' سم').includes(s), 'في متطابق الضلعين ضلعان متساويان: الثالث يساوي أحد الضلعين.', 'Gs1')); }
      { const L = [], used = new Set();
        for (let t = 0; L.length < 6 && t < 40; t++) { const k = L.length % 3, a = R(3, 9), b = k === 0 ? a : k === 1 ? a : R(3, 9), c = k === 0 ? a : R(3, 9); const S = [a, b, c].sort((x, y) => x - y), key = S.join('-'); if (used.has(key) || triType(...S) !== k) continue; used.add(key); L.push({ label: S.map(N).join(' ، '), bin: k }); }
        it.push(sort('افرز الأشرعة حسب أطوال أضلاعها (سم):', TYPE, L, 'ثلاثة متساوية، أو اثنان فقط، أو لا تساوي.', 'Gs1')); }
      { const S = pickN([['جميع المثلثات لها ثلاثة أضلاع.', true, 'المثلث مضلع له ثلاثة أضلاع وثلاث زوايا.'], ['قد يكون المثلث متطابق الضلعين قائم الزاوية.', true, 'مثل نصف المربع المقطوع من ركن إلى ركن.'],
          ['تحتوي جميع المثلثات على ثلاثة خطوط تماثل.', false, 'متطابق الأضلاع فقط له ثلاثة خطوط تماثل.'], ['أضلاع المثلث مختلف الأضلاع ليس لها الطول نفسه.', true, 'لذلك سُمي مختلف الأضلاع.'],
          ['الضلعان المتطابقان في متطابق الضلعين أطول دائماً من الضلع الثالث.', false, 'قد يكونان أقصر منه، مثل ٤ و٤ و٧.']], 1)[0];
        it.push(tf(S[0], S[1], 'جرّب أمثلة بأطوال مختلفة.', 'Gs1', S[2])); }
      { const iso = R(0, 1) === 1, x0 = R(1, 3), y0 = R(1, 2), w = R(2, 3) * 2, h = R(2, 4);
        const P = iso ? [[x0, y0], [x0 + w, y0], [x0 + w / 2, y0 + h]] : [[x0, y0], [x0 + w, y0], [x0 + w + R(1, 2), y0 + h]], sd = [d2(P[0], P[1]), d2(P[1], P[2]), d2(P[0], P[2])], t = sd[0] === sd[1] || sd[1] === sd[2] || sd[0] === sd[2] ? 1 : 2;
        it.push(choice('ما نوع المثلث المرسوم على الشبكة؟', TYPE[t], TYPE.filter((_, i) => i !== t), 'عُدّ المربعات أو قارن أطوال الأضلاع: هل يتساوى ضلعان؟', 'Gs1', { art: quad({ n: 10, shapes: [{ p: P }] }) })); }
      { const s = f(3, 8);
        it.push(num(`مثلث كبير متطابق الأضلاع مكوّن من ٤ مثلثات صغيرة متطابقة الأضلاع. طول ضلع الصغير <b>${N(s)}</b> سم. كم سنتيمتراً يحتاج خيط يحيط بالمثلث الكبير؟`, 6 * s, 'ضلع الكبير = ضلعان من الصغير، والمحيط = ٣ أضلاع.', 'Gs1', { dot: false })); }
      { const a = f(4, 9), right = `${N(a)} سم، ${N(a)} سم، ${N(a)} سم`;
        it.push(choice('أي أطوال تصنع مثلثاً <b>متطابق الأضلاع</b>؟', right, [`${N(a)} سم، ${N(a)} سم، ${N(a + 2)} سم`, `${N(a)} سم، ${N(a + 1)} سم، ${N(a + 2)} سم`, `${N(a + 1)} سم، ${N(a)} سم، ${N(a)} سم`], 'الأضلاع الثلاثة متساوية تماماً.', 'Gs1')); }
      return it;
    } },

  /* ٥-٣ المكعب ومتوازي المستطيلات: Gs4 */
  cuboids5: { who: 'reem', title: 'تحدي ريم', lines: [{ who: 'reem', text: 'صناديق الشحن مطوية بإتقان! تتخيّل المجسم من شبكته.' }],
    make() {
      const f = fresh(), it = [];
      { const bad = pickN(BAD_NETS, 3);
        it.push(choice('أي شبكة تُطوى <b>مكعباً مغلقاً</b>؟', net(cubeNet()), bad.map(b => net(b)), 'ست مربعات، ولا يتقابل مربعان فوق بعضهما عند الطي. جرّب الطي في خيالك.', 'Gs4')); }
      { const Q = pickN([['أوجه', 6, 'وجه'], ['رؤوس', 8, 'رأس'], ['أحرف', 12, 'حرف']], 1)[0];
        it.push(num(`كم <b>${Q[0]}</b> لمتوازي المستطيلات؟`, Q[1], 'تخيّل صندوقاً: عُدّ من الأعلى ثم الأسفل ثم الجوانب.', 'Gs4', { dot: false, art: solid('prism', 4) })); }
      { const S = pickN([['في متوازي المستطيلات كل وجهين متقابلين متطابقان.', true, 'الغطاء يطابق القاع، والجانب يطابق الجانب المقابل.'], ['كل أوجه متوازي المستطيلات مربعات.', false, 'أوجهه مستطيلات، والمكعب وحده أوجهه مربعات.'],
          ['المكعب متوازي مستطيلات أوجهه الستة مربعات متطابقة.', true, 'لذلك المكعب نوع خاص من متوازي المستطيلات.'], ['شبكة المكعب المغلق فيها خمسة مربعات.', false, 'المغلق ستة أوجه، والمفتوح (بلا غطاء) خمسة.']], 1)[0];
        it.push(tf(S[0], S[1], 'تخيّل علبة حقيقية.', 'Gs4', S[2])); }
      { const open = R(0, 1) === 1;
        it.push(num(`كم مربعاً في شبكة صندوق مكعب <b>${open ? 'مفتوح من الأعلى (بلا غطاء)' : 'مغلق'}</b>؟`, open ? 5 : 6, 'عُدّ أوجه الصندوق، والمفتوح ينقصه الغطاء.', 'Gs4', { dot: false })); }
      { const [a, b, c] = pickN([2, 3, 4, 5, 6, 7], 3), fx = (p, q) => `${N(p)} × ${N(q)}`, right = [fx(a, b), fx(a, b), fx(a, c), fx(a, c), fx(b, c), fx(b, c)].join(' ، ');
        it.push(choice('أي مجموعة من المستطيلات الستة (بالسنتيمتر) تصنع <b>متوازي مستطيلات</b>؟', right, [[fx(a, b), fx(a, b), fx(a, c), fx(a, c), fx(b, c), fx(a, b)].join(' ، '), [fx(a, b), fx(a, c), fx(b, c), fx(a, b), fx(a, c), fx(c, c)].join(' ، '), [fx(a, a), fx(a, b), fx(a, c), fx(a, c), fx(b, c), fx(b, c)].join(' ، ')], 'كل وجه له وجه مقابل يطابقه: ثلاثة أزواج متطابقة.', 'Gs4')); }
      { const a = f(2, 5), b = f(2, 4), c = R(3, 4);
        it.push(num(`صندوق على شكل متوازي مستطيلات من مكعبات صغيرة: <b>${N(a)}</b> في الطول، و<b>${N(b)}</b> في العرض، و<b>${N(c)}</b> طبقات. كم مكعباً صغيراً فيه؟`, a * b * c, 'عُدّ مكعبات الطبقة الواحدة (الطول × العرض)، ثم اضرب في عدد الطبقات.', 'Gs4', { dot: false })); }
      { const [a, b, c] = pickN([2, 3, 4, 5, 6], 3), fx = (p, q) => `${N(p)} × ${N(q)}`;
        it.push(choice(`شبكة متوازي مستطيلات فيها خمسة مستطيلات: ${[fx(a, b), fx(a, b), fx(a, c), fx(a, c), fx(b, c)].join(' ، ')}. ما المستطيل الناقص؟`, fx(b, c), [fx(a, b), fx(a, c), fx(a, a)], 'الأوجه أزواج متطابقة: أيّ مستطيل بلا شريك؟', 'Gs4')); }
      { const good = cubeNet(), bad = pickN(BAD_NETS, 1)[0], ok = R(0, 1) === 1;
        it.push(tf('هل تُطوى هذه الشبكة مكعباً مغلقاً؟', ok, 'تخيّل أن المربع الأوسط هو القاع، ثم اطوِ الباقي حوله.', 'Gs4', ok ? 'نعم: كل مربع يصير وجهاً مختلفاً.' : 'لا: يتقابل وجهان فوق بعضهما ويبقى وجه مفتوح.', { art: net(ok ? good : bad) })); }
      return it;
    } },

  /* ٦-١ الإحداثيات: Gp1 (الربع الأول) */
  coords5a: { who: 'badr', title: 'تحدي بدر', lines: [{ who: 'badr', text: 'كل عوامة في مكانها! تقرأ الإحداثيات أفقياً ثم رأسياً.' }],
    make() {
      const it = [], used = new Set(), P = () => { for (let t = 0; t < 80; t++) { const x = R(1, 7), y = R(1, 7); if (x !== y && !used.has(x + ',' + y)) { used.add(x + ',' + y); return [x, y]; } } return [R(1, 7), R(1, 7)]; };
      { const [x, y] = P();
        it.push(choice('ما إحداثيات العوامة <b>أ</b>؟', pt(x, y), [pt(y, x), pt(x + 1, y), pt(x, y - 1)], 'نقرأ العدد على المحور الأفقي (س) أولاً، ثم الرأسي (ص).', 'Gp1', { art: quad({ pts: [{ x, y, l: 'أ' }] }) })); }
      { const ps = [P(), P(), P(), P()], L = ['أ', 'ب', 'ج', 'د'], k = R(0, 3);
        it.push(choice(`أي نقطة إحداثياتها <b>${pt(...ps[k])}</b>؟`, L[k], L.filter((_, i) => i !== k), 'اذهب أفقياً بالعدد الأول، ثم اصعد بالعدد الثاني.', 'Gp1', { art: quad({ pts: ps.map(([x, y], i) => ({ x, y, l: L[i] })) }) })); }
      { const x = R(1, 4), y = R(1, 3), w = R(2, 3), h = R(2, 4), C = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], k = R(0, 3), rest = C.filter((_, i) => i !== k), [mx, my] = C[k];
        it.push(choice(`ثلاثة مفاتيح عند ثلاثة أركان مستطيل: ${rest.map(p => pt(...p)).join(' و')}. أين المفتاح الرابع؟`, pt(mx, my), [pt(my, mx), pt(mx + 1, my), pt(mx, my + 1)].filter(s => s !== pt(mx, my)), 'ارسم المستطيل: الركن الرابع يشارك ركناً في (س) وآخر في (ص).', 'Gp1')); }
      { const S = pickN([[0, R(1, 6), 'على المحور ص', true], [R(1, 6), 0, 'على المحور س', true], [0, R(1, 6), 'على المحور س', false], [R(1, 6), 0, 'على المحور ص', false]], 1)[0];
        it.push(tf(`النقطة <b>${pt(S[0], S[1])}</b> تقع ${S[2]}.`, S[3], 'إذا كان (س) صفراً فالنقطة على المحور ص، وإذا كان (ص) صفراً فهي على المحور س.', 'Gp1', S[0] === 0 ? 'س = ٠ فهي على المحور ص.' : 'ص = ٠ فهي على المحور س.')); }
      { const c = R(0, 2), on = shuffle([1, 2, 3, 4, 5].map(x => [x, x + c]).filter(([, y]) => y <= 8)).slice(0, 3), off = [[2, 2 + c + 2], [4, 4 + c + 1], [6, 6 + c - 2]].filter(([x, y]) => y >= 0 && y <= 8 && y - x !== c), L = shuffle([...on, ...off]);
        it.push(multi(`رُسم خط يمر بالنقطتين ${pt(1, 1 + c)} و${pt(5, 5 + c)}. اختر النقاط الواقعة عليه:`, L.map(p => pt(...p)), s => on.some(p => pt(...p) === s), `على هذا الخط: (ص) يزيد على (س) بـ ${N(c)} دائماً.`, 'Gp1', { art: quad({ pts: [{ x: 1, y: 1 + c, l: '' }, { x: 5, y: 5 + c, l: '' }], shapes: [] }) })); }
      { const y = R(1, 7), a = R(0, 3), b = a + R(2, 5);
        it.push(num(`كم وحدة بين العوامتين ${pt(a, y)} و${pt(b, y)}؟`, b - a, 'العوامتان على الخط الأفقي نفسه: اطرح الإحداثيين (س).', 'Gp1', { dot: false })); }
      { const x = R(2, 6), y = pickN([1, 2, 3, 4, 5, 6].filter(v => v !== x), 1)[0], right = pt(x, y);   // س ≠ ص حتى يختلف الخيار المعكوس
        it.push(choice(`انطلق قارب من نقطة الأصل ${pt(0, 0)}: <b>${N(x)}</b> وحدات أفقياً، ثم <b>${N(y)}</b> وحدات رأسياً. أين يصل؟`, right, [pt(y, x), pt(x + y, 0), pt(x, x)].filter(s => s !== right), 'الحركة الأفقية تعطي (س)، والرأسية تعطي (ص).', 'Gp1')); }
      { const L = [[0, R(1, 7)], [0, R(1, 7)], [R(1, 7), 0], [R(1, 7), 0], [R(1, 7), R(1, 7)], [R(1, 7), R(1, 7)]].filter((p, i, A) => A.findIndex(q => q[0] === p[0] && q[1] === p[1]) === i);
        it.push(sort('افرز النقاط:', ['على المحور س', 'على المحور ص', 'ليست على محور'], L.map(p => ({ label: pt(...p), bin: p[1] === 0 ? 0 : p[0] === 0 ? 1 : 2 })), 'انظر إلى الصفر: في (س) أم في (ص)؟', 'Gp1')); }
      return it;
    } },

  /* ٦-٢ الانسحاب والانعكاس: Gp2 (الانعكاس في خط مرآة)، Gp3 (الانسحاب) */
  transReflect5: { who: 'hind', title: 'تحدي هند', lines: [{ who: 'hind', text: 'رصيف المرايا يعكس كل شيء كما توقعت! تعرف الانسحاب والانعكاس.' }],
    make() {
      const it = [];
      { const x = R(1, 3), y = R(1, 3), dx = R(1, 4), dy = R(1, 3), right = pt(x + dx, y + dy);
        it.push(choice(`انسحب القارب <b>${N(dx)}</b> وحدات يميناً و<b>${N(dy)}</b> وحدات لأعلى. أين يصبح الرأس ${pt(x, y)}؟`, right, [pt(x + dy, y + dx), pt(x + dx, y), pt(x - dx < 0 ? x + dx + 1 : x - dx, y + dy)].filter(s => s !== right), 'اليمين يزيد (س)، والأعلى يزيد (ص).', 'Gp3')); }
      { const x = R(0, 2), y = R(0, 2), dx = R(2, 4), dy = R(1, 3), A = [[x, y], [x + 2, y], [x + 1, y + 2]], B = A.map(([p, q]) => [p + dx, q + dy]), d = (a, b) => `${N(a)} وحدات يميناً و${N(b)} لأعلى`;
        it.push(choice('صِف انسحاب الشكل <b>أ</b> إلى الشكل <b>ب</b>:', d(dx, dy), [d(dy, dx), d(dx + 1, dy), d(dx, dy + 1)].filter(s => s !== d(dx, dy)), 'اختر رأساً في أ واتبعه حتى نظيره في ب: عُدّ يميناً ثم لأعلى.', 'Gp3', { art: quad({ shapes: [{ p: A, l: 'أ' }, { p: B, l: 'ب', c: '#BFE6F5' }] }) })); }
      { const k = R(3, 5), x = k - R(1, 3), y = R(1, 7), r = 2 * k - x, right = pt(r, y);
        it.push(choice(`المرآة هي الخط الرأسي عند س = <b>${N(k)}</b>. أين صورة النقطة ${pt(x, y)}؟`, right, [pt(x, y + 2 * (k - x) > 8 ? y - 1 : y + 2 * (k - x)), pt(r + 1, y), pt(k, y)].filter(s => s !== right), 'الصورة على البعد نفسه من المرآة لكن في الجهة الأخرى، و(ص) لا يتغير.', 'Gp2', { art: quad({ pts: [{ x, y, l: 'أ' }], mirror: { x: k } }) })); }
      { const k = R(3, 5), y = k - R(1, 3), x = R(1, 7), r = 2 * k - y, right = pt(x, r);
        it.push(choice(`المرآة هي الخط الأفقي عند ص = <b>${N(k)}</b>. أين صورة النقطة ${pt(x, y)}؟`, right, [pt(r, x), pt(x, r + 1), pt(x, k)].filter(s => s !== right), 'في المرآة الأفقية لا يتغير (س)، والبعد عن المرآة يبقى كما هو.', 'Gp2', { art: quad({ pts: [{ x, y, l: 'أ' }], mirror: { y: k } }) })); }
      { const S = pickN([['الانسحاب لا يغيّر شكل الجسم ولا حجمه.', true, 'يتحرك الجسم في خط مستقيم فقط.'], ['الانعكاس يكبّر الشكل.', false, 'الصورة في المرآة بالحجم نفسه.'], ['في الانسحاب يدور الشكل.', false, 'الانسحاب حركة في خط مستقيم دون دوران.'], ['صورة النقطة في المرآة على البعد نفسه من خط المرآة.', true, 'لكن في الجهة المقابلة.']], 1)[0];
        it.push(tf(S[0], S[1], 'تخيّل قارباً ينزلق، ثم تخيّله في المرآة.', 'Gp3', S[2])); }
      { const y = R(1, 7), a = R(0, 3), b = a + R(2, 5);
        it.push(num(`انسحبت عوامة من ${pt(a, y)} إلى ${pt(b, y)}. كم وحدة انسحبت يميناً؟`, b - a, 'الانسحاب الأفقي = الفرق بين الإحداثيين (س).', 'Gp3', { dot: false })); }
      { const k = R(3, 5), x = k - R(1, 2), y = R(2, 6), cand = [[2 * k - x, y], [2 * k - x + 1, y], [x, 8 - y], [2 * k - x, y + 1 > 8 ? y - 1 : y + 1]], L = ['ب', 'ج', 'د', 'هـ'], ord = shuffle([0, 1, 2, 3]);
        it.push(choice('أي نقطة هي صورة <b>أ</b> بالانعكاس في خط المرآة الأخضر؟', L[ord.indexOf(0)], L.filter((_, i) => i !== ord.indexOf(0)), 'عُدّ المربعات من أ إلى المرآة، ثم العدد نفسه في الجهة الأخرى.', 'Gp2', { art: quad({ pts: [{ x, y, l: 'أ' }, ...ord.map((ci, i) => ({ x: cand[ci][0], y: cand[ci][1], l: L[i], c: '#2F6FB2' }))], mirror: { x: k } }) })); }
      { const x = R(1, 3), y = R(1, 3), dx = R(2, 4), dy = R(1, 3), k = x + dx === y + dy ? R(0, 1) : R(0, 2), sx = x + dx + (k === 0 ? 1 : 0), sy = y + dy + (k === 1 ? 1 : 0);   // تبديل (س، ص) خطأ فقط حين يختلفان
        it.push(error(`نقلت هند الرأس ${pt(x, y)} انسحاباً <b>${N(dx)}</b> يميناً و<b>${N(dy)}</b> لأعلى. في أي خطوة أخطأت؟`, [`س الجديد = ${N(x)} + ${N(dx)} = ${N(sx)}`, `ص الجديد = ${N(y)} + ${N(dy)} = ${N(sy)}`, `الرأس الجديد ${k === 2 ? pt(sy, sx) : pt(sx, sy)}`], k, 'تحقّق من كل جمع، ومن ترتيب (س، ص).', 'Gp3')); }
      return it;
    } }
};
