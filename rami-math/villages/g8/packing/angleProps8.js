// ٣-٢ شرح خصائص الزوايا — «مختبر الزوايا»: لوح قصّ في المصنع. الطالب يجد الزاوية المجهولة في المثلث (١٨٠°) والرباعي (٣٦٠°)،
// والزاوية الخارجية للمثلث (= مجموع الداخليتين المقابلتين)، ويختار سبب خطوة في برهان مجموع زوايا المثلث (الخط الموازي).
// بعد الحل تنفصل زوايا المثلث وتصطف على خط مستقيم. التحدي: ٨ أسئلة جديدة من مخرج 8Gs1 (الكتاب ص٥٢–٥٤).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';

const who = { name: 'المهندس طارق', face: '👨🏽‍🔬', id: 'tariq' };
const deg = v => `${N(v)}°`;
const arcLbl = (g, p, a0, a1, txt, col, r = 30) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(p.x, p.y, r, a0, a1, false); g.stroke(); const m = (a0 + a1) / 2; g.fillStyle = col; g.font = '900 15px Cairo'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(txt, p.x + Math.cos(m) * (r + 18), p.y + Math.sin(m) * (r + 18) + 5); };
const ang = (p, q) => Math.atan2(q.y - p.y, q.x - p.x);
function arcAt(g, P, A, B, txt, col, r) { let a0 = ang(P, A), a1 = ang(P, B); let d = a1 - a0; while (d < 0) d += Math.PI * 2; if (d > Math.PI) { [a0, a1] = [a1, a0]; d = Math.PI * 2 - d; } arcLbl(g, P, a0, a0 + d, txt, col, r); }

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {};
  g.fillStyle = '#FFF7ED'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(194,65,12,.08)'; g.lineWidth = 1; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const show = (v, known) => known || S.done ? deg(v) : '؟';
  if (r.tri) {   // مثلث برؤوسه وزواياه، ومدّ ضلع للزاوية الخارجية عند الحاجة
    const [A, B, C] = r.tri.map(([x, y]) => ({ x: w * x, y: h * y })), [a, b, c] = r.v, k = r.known;
    g.fillStyle = 'rgba(251,191,36,.25)'; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.lineTo(C.x, C.y); g.closePath(); g.fill(); g.strokeStyle = '#7C2D12'; g.lineWidth = 3; g.stroke();
    if (r.ext) { const E = { x: C.x + (C.x - B.x) * .45, y: C.y + (C.y - B.y) * .45 }; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(C.x, C.y); g.lineTo(E.x, E.y); g.stroke(); g.setLineDash([]); arcAt(g, C, A, E, show(r.ext, k[3]), '#DC2626', 26); }
    arcAt(g, A, B, C, show(a, k[0]), '#2563EB', 30); arcAt(g, B, A, C, show(b, k[1]), '#16A34A', 30); if (!r.ext || r.showC) arcAt(g, C, A, B, show(c, k[2]), '#9333EA', 30);
    g.fillStyle = '#1E2433'; g.font = '900 17px Cairo'; [['أ', A], ['ب', B], ['ج', C]].forEach(([n, P]) => g.fillText(n, P.x + (P.x < w / 2 ? -16 : 16), P.y + (P.y < h / 2 ? -12 : 22)));
    if (S.done && !r.ext) {   // الزوايا الثلاث تصطف على خط مستقيم
      const ox = w * .78, oy = h * .82, L = 70; g.strokeStyle = '#1E2433'; g.lineWidth = 3; g.beginPath(); g.moveTo(ox - L * 1.2, oy); g.lineTo(ox + L * 1.2, oy); g.stroke();
      let a0 = Math.PI; [[a, '#2563EB'], [b, '#16A34A'], [c, '#9333EA']].forEach(([v, col]) => { const a1 = a0 + v * Math.PI / 180; g.fillStyle = col; g.globalAlpha = .55; g.beginPath(); g.moveTo(ox, oy); g.arc(ox, oy, L, a0, a1); g.fill(); g.globalAlpha = 1; a0 = a1; });
      g.fillStyle = '#1E2433'; g.font = '800 14px Cairo'; g.fillText('١٨٠° على خط مستقيم', ox, oy + 22); }
  } else if (r.quad) {
    const P = r.quad.map(([x, y]) => ({ x: w * x, y: h * y })), cols = ['#2563EB', '#16A34A', '#9333EA', '#DC2626'];
    g.fillStyle = 'rgba(96,165,250,.2)'; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fill(); g.strokeStyle = '#1E3A8A'; g.lineWidth = 3; g.stroke();
    P.forEach((p, i) => arcAt(g, p, P[(i + 3) % 4], P[(i + 1) % 4], show(r.v[i], r.known[i]), cols[i], 28));
  } else if (r.proof) {   // برهان: خط موازٍ لضلع يمر بالرأس، والزاويتان المتبادلتان
    const A = { x: w * .5, y: h * .2 }, B = { x: w * .22, y: h * .82 }, C = { x: w * .78, y: h * .82 };
    g.strokeStyle = '#7C2D12'; g.lineWidth = 3; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.lineTo(C.x, C.y); g.closePath(); g.stroke();
    g.strokeStyle = '#0EA5E9'; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(w * .1, A.y); g.lineTo(w * .9, A.y); g.stroke(); g.setLineDash([]);
    arcAt(g, B, A, C, 'ب', '#16A34A', 30); arcAt(g, A, { x: w * .1, y: A.y }, B, 'د', '#16A34A', 30); arcAt(g, C, A, B, 'ج', '#9333EA', 30); arcAt(g, A, C, { x: w * .9, y: A.y }, 'هـ', '#9333EA', 30); arcAt(g, A, B, C, 'أ', '#2563EB', 22);
    g.fillStyle = '#0369A1'; g.font = '800 14px Cairo'; g.textAlign = 'center'; g.fillText('خط موازٍ للضلع ب ج', w * .8, A.y - 12);
  }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function triAngles() { for (let k = 0; k < 50; k++) { const a = R(30, 95), b = R(30, 95), c = 180 - a - b; if (c >= 25) return [a, b, c]; } return [60, 60, 60]; }
const TRI = [[.5, .18], [.18, .8], [.72, .8]];
function make(i) {
  if (i === 0) { const v = triAngles();
    return { q: `في المثلث أ ب ج: و(أ) = <b>${deg(v[0])}</b> و و(ب) = <b>${deg(v[1])}</b>. أوجد و(ج).`, input: { type: 'num' }, ok: x => x === v[2], hint: 'ما مجموع قياسات زوايا أي مثلث؟ اطرح منه ما تعرفه.',
      bad: x => x === 360 - v[0] - v[1] ? 'هذا مجموع زوايا الشكل الرباعي، لا المثلث.' : '', data: { tri: TRI, v, known: [1, 1, 0] } }; }
  if (i === 1) { for (let k = 0; k < 60; k++) { const v = [R(60, 120), R(60, 120), R(60, 120)]; const d = 360 - v[0] - v[1] - v[2]; if (d < 50 || d > 150) continue; v.push(d);
    return { q: `في الشكل الرباعي: ثلاث زوايا قياساتها ${deg(v[0])} و${deg(v[1])} و${deg(v[2])}. أوجد قياس الزاوية الرابعة.`, input: { type: 'num' }, ok: x => x === d,
      hint: 'ارسم القطر في ذهنك: كم مثلثاً يقسم الرباعي؟ إذن ما مجموع زواياه؟', bad: x => x === 180 - v[0] - v[1] - v[2] ? 'استعملتَ ١٨٠°، لكن القطر يقسم الرباعي إلى مثلثين.' : '', data: { quad: [[.2, .22], [.8, .15], [.88, .82], [.14, .78]], v, known: [1, 1, 1, 0] } }; } }
  if (i === 2) { const v = triAngles(), ex = v[0] + v[1];
    return { q: `مُدّ الضلع ب ج إلى خارج المثلث. إذا كان و(أ) = <b>${deg(v[0])}</b> و و(ب) = <b>${deg(v[1])}</b>، فما قياس الزاوية الخارجية عند ج؟`, input: { type: 'num' }, ok: x => x === ex,
      hint: 'الزاوية الخارجية مع الداخلية عند ج على خط مستقيم. أو تذكّر: بماذا تساوي الزاوية الخارجية؟', bad: x => x === v[2] ? 'هذه الزاوية الداخلية عند ج.' : '', data: { tri: TRI, v, ext: ex, known: [1, 1, 0, 0] } }; }
  if (i === 3) { const v = triAngles(), ex = v[0] + v[1];
    return { q: `الزاوية الخارجية عند ج قياسها <b>${deg(ex)}</b>، و و(أ) = <b>${deg(v[0])}</b>. أوجد و(ب).`, input: { type: 'num' }, ok: x => x === v[1],
      hint: 'الزاوية الخارجية تساوي مجموع الداخليتين المقابلتين لها: أي زاويتين؟', bad: x => x === 180 - ex ? 'هذه الزاوية الداخلية عند ج، لا عند ب.' : '', data: { tri: TRI, v, ext: ex, known: [1, 0, 0, 1] } }; }
  const opts = ['زاويتان متبادلتان', 'زاويتان متناظرتان', 'زاويتان متقابلتان بالرأس', 'زاويتان على خط مستقيم'], sh = opts.map((o, j) => [Math.random(), o, j]).sort((a, b) => a[0] - b[0]);
  return { q: 'في برهان مجموع زوايا المثلث رسمنا خطاً موازياً للضلع ب ج. لماذا و(د) = و(ب)؟', input: { type: 'pick', opts: sh.map(x => x[1]) }, ok: k => sh[k][2] === 0,
    hint: 'الزاويتان بين خطين متوازيين يقطعهما الضلع أ ب: هل هما في جهتين مختلفتين من القاطع وداخل المتوازيين؟', bad: k => sh[k][2] === 1 ? 'المتناظرتان في الجهة نفسها من القاطع، وهاتان في جهتين مختلفتين.' : '', data: { proof: true } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const v = fresh(triAngles); items.push(num(`مثلث زاويتاه ${deg(v[0])} و${deg(v[1])}. ما قياس الزاوية الثالثة؟`, v[2], 'مجموع زوايا المثلث ١٨٠°.', '8Gs1')); }
  { const v = fresh(triAngles); items.push(num(`مثلث زاويتاه ${deg(v[0])} و${deg(v[1])}. ما قياس الزاوية الخارجية المقابلة لهما؟`, v[0] + v[1], 'الخارجية = مجموع الداخليتين المقابلتين.', '8Gs1')); }
  { const v = fresh(() => [R(70, 110), R(70, 110), R(70, 110)]); items.push(num(`شكل رباعي ثلاث زواياه ${deg(v[0])} و${deg(v[1])} و${deg(v[2])}. ما الرابعة؟`, 360 - v[0] - v[1] - v[2], 'مجموع زوايا الرباعي ٣٦٠°.', '8Gs1')); }
  { const a = fresh(() => R(20, 80)); items.push(num(`مثلث متطابق الضلعين، قياس كل من زاويتي قاعدته ${deg(a)}. ما قياس زاوية رأسه؟`, 180 - 2 * a, 'كم مجموع زاويتي القاعدة معاً؟ ثم أكمل إلى ١٨٠°.', '8Gs1')); }
  items.push(tf('مجموع زوايا الشكل الرباعي ١٨٠°.', false, 'كم مثلثاً يقسمه القطر؟', '8Gs1', 'القطر يقسمه مثلثين، فمجموع زواياه ٣٦٠°.'));
  items.push(tf('الزاوية الخارجية للمثلث تساوي مجموع الزاويتين الداخليتين المقابلتين لها.', true, 'جرّب بمثلث زواياه ٥٠° و٦٠° و٧٠°.', '8Gs1', 'لأن الخارجية والداخلية المجاورة لها على خط مستقيم.'));
  { const ex = fresh(() => R(100, 150)), a = R(30, ex - 30); items.push(num(`زاوية خارجية لمثلث قياسها ${deg(ex)}، وإحدى الداخليتين المقابلتين ${deg(a)}. ما الأخرى؟`, ex - a, 'الخارجية = الداخليتان المقابلتان معاً.', '8Gs1')); }
  items.push(choice('في البرهان رسمنا خطاً موازياً لضلع المثلث. الزاويتان اللتان على جانبي القاطع وبين المتوازيين:', 'متبادلتان ومتساويتان', ['متناظرتان ومجموعهما ١٨٠°', 'متقابلتان بالرأس', 'متكاملتان دائماً'], 'هل هما في جهة واحدة من القاطع أم في جهتين؟', '8Gs1'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'مختبر الزوايا', icon: '📐', who, rounds: 5, make, draw,
  intro: ['آلة القصّ تحتاج زوايا دقيقة، وإلا جاءت قطع الصناديق مائلة.', 'سأريك سراً قديماً: زوايا أي مثلث، إذا قصصتها ووضعتها جنباً إلى جنب، تكوّن خطاً مستقيماً!'],
  outro: ['ممتاز! الآن تعرف لماذا مجموع زوايا المثلث ١٨٠°، والرباعي ٣٦٠°، وكيف تحسب الزاوية الخارجية.', 'هيا إلى أسئلة المختبر.'],
  challenge: { title: 'تحدي خصائص الزوايا', make: challenge }
});
export { make, challenge };
