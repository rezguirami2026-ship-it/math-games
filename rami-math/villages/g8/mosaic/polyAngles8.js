// ١٢-٣ حل مسائل الزوايا — «سقف القبة»: المهندس باسم يرسم زخارف سقف القبة بخطوط متوازية ومضلعات. حقائق الزوايا معاً: المتبادلة
// والمتناظرة بين متوازيين، والزوايا على خط مستقيم، والزاوية الخارجية للمثلث، ومجموع زوايا الخماسي في شكل فيه ضلعان متوازيان، ومثلث داخل
// السداسي المنتظم، وسبب كل خطوة. الزاوية المطلوبة «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Gs4 (الكتاب ص٧٤–٧٥).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { tileBg, say, glow, regular, poly, deg, NAVY, GOLD } from './art.js';

const who = { name: 'المهندس باسم', face: '👷🏽‍♂️', id: 'basim' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

function parallels(g, w, h, lab1, lab2) {
  g.strokeStyle = NAVY; g.lineWidth = 3; [h * .35, h * .65].forEach(y => { g.beginPath(); g.moveTo(w * .12, y); g.lineTo(w * .88, y); g.stroke(); g.fillStyle = NAVY; g.beginPath(); g.moveTo(w * .5 + 8, y); g.lineTo(w * .5 - 4, y - 6); g.lineTo(w * .5 - 4, y + 6); g.fill(); });
  g.strokeStyle = GOLD; g.beginPath(); g.moveTo(w * .3, h * .85); g.lineTo(w * .7, h * .15); g.stroke();
  const x1 = w * .3 + (w * .4) * (.85 - .65) / .7, x2 = w * .3 + (w * .4) * (.85 - .35) / .7; say(g, lab1, x1 + 34, h * .65 - 10, 16, NAVY, 900); say(g, lab2, x2 - 34, h * .35 + 24, 16, '#DC2626', 900);
}
function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; tileBg(g, w, h, t); say(g, '🕌 ' + (r.title || 'سقف القبة'), w * .5, h * .08, 18, NAVY, 900);
  const A = S.done ? deg(r.ans) : '؟';
  if (r.kind === 'par') parallels(g, w, h, deg(r.a), A);
  else if (r.kind === 'line') { g.strokeStyle = NAVY; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .12, h * .6); g.lineTo(w * .88, h * .6); g.stroke(); const a = r.a * Math.PI / 180; g.strokeStyle = GOLD; g.beginPath(); g.moveTo(w * .5, h * .6); g.lineTo(w * .5 + Math.cos(Math.PI - a) * h * .35, h * .6 - Math.sin(a) * h * .35); g.stroke(); say(g, deg(r.a), w * .5 - 50, h * .55, 16, NAVY, 900); say(g, A, w * .5 + 50, h * .55, 16, '#DC2626', 900); }
  else if (r.kind === 'tri') { poly(g, [[w * .25, h * .75], [w * .62, h * .75], [w * .45, h * .25]], [deg(r.a), '', deg(r.b)], { fill: '#FDE68A' }); g.strokeStyle = NAVY; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .62, h * .75); g.lineTo(w * .85, h * .75); g.stroke(); say(g, A, w * .7, h * .7, 16, '#DC2626', 900); }
  else if (r.kind === 'pent') { const P = [[w * .2, h * .3], [w * .62, h * .3], [w * .82, h * .52], [w * .6, h * .76], [w * .2, h * .76]]; poly(g, P, r.labs.map(l => l === '؟' ? A : l), { fill: '#BFDBFE' });
    [[P[0], P[1]], [P[4], P[3]]].forEach(([a, b]) => { const mx = (a[0] + b[0]) / 2, my = a[1]; g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(mx + 9, my); g.lineTo(mx - 3, my - 7); g.lineTo(mx - 3, my + 7); g.fill(); }); }
  else if (r.kind === 'hex') { const P = regular(g, w * .5, h * .55, Math.min(w, h) * .3, 6, { fill: '#BBF7D0' }); g.strokeStyle = '#DC2626'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(P[0][0], P[0][1]); g.lineTo(P[2][0], P[2][1]); g.stroke(); say(g, A, P[1][0] - 26, P[1][1] - 4, 16, '#DC2626', 900); }
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const a = R(9, 30) * 5, alt = Math.random() < .5, ans = alt ? a : a;
    return { q: `خطا الزخرفة متوازيان ويقطعهما خط ذهبي. إحدى الزوايا ${deg(a)}. ما قياس الزاوية المتبادلة معها؟`, input: { type: 'num' }, sol: ans, ok: v => v === ans,
      hint: 'ما العلاقة بين زاويتين متبادلتين بين مستقيمين متوازيين؟', bad: v => v === 180 - a ? 'هذه الزاوية المكمّلة: المتبادلتان متساويتان.' : '',
      good: `المتبادلتان متساويتان: ${deg(a)}`, data: { kind: 'par', a, ans, title: 'خطان متوازيان' } }; }
  if (i === 1) { const a = R(5, 31) * 5;
    return { q: `زاوية على خط مستقيم في زخرفة السقف قياسها ${deg(a)}. ما قياس الزاوية المجاورة لها على الخط نفسه؟`, input: { type: 'num' }, sol: 180 - a, ok: v => v === 180 - a,
      hint: 'كم مجموع الزوايا على خط مستقيم عند نقطة؟', bad: v => v === 360 - a ? 'المجموع على خط مستقيم ١٨٠° لا ٣٦٠°.' : '',
      good: `١٨٠° − ${deg(a)} = ${deg(180 - a)}`, data: { kind: 'line', a, ans: 180 - a, title: 'على خط مستقيم' } }; }
  if (i === 2) { let a, b; do { a = R(6, 16) * 5; b = R(6, 16) * 5; } while (a + b >= 170);
    return { q: `في مثلث من زخرفة القبة زاويتان ${deg(a)} و${deg(b)}. ما قياس الزاوية الخارجية عند الرأس الثالث؟`, input: { type: 'num' }, sol: a + b, ok: v => v === a + b,
      hint: 'الزاوية الخارجية للمثلث تساوي مجموع أي زاويتين؟', bad: v => v === 180 - a - b ? 'هذه الزاوية الداخلية الثالثة: الخارجية مكمّلتها.' : '',
      good: `${deg(a)} + ${deg(b)} = ${deg(a + b)}`, data: { kind: 'tri', a, b, ans: a + b, title: 'الزاوية الخارجية للمثلث' } }; }
  if (i === 3) { let p, q, t; do { p = R(14, 26) * 5; q = R(20, 30) * 5; t = R(20, 30) * 5; } while (360 - q - t < 60 || 360 - q - t > 160);
    const x = 360 - q - t;
    return { q: `في خماسي من زخرفة السقف الضلعان العلوي والسفلي متوازيان، وقياسات ثلاث من زواياه ${deg(p)} و${deg(q)} و${deg(t)} كما في الرسم. ما قياس الزاوية المعلَّمة بعلامة الاستفهام؟`, input: { type: 'num' }, sol: x, ok: v => v === x,
      hint: 'ما الزاوية المجهولة عند الضلع الأيسر بين المتوازيين؟ ثم ما مجموع زوايا الخماسي؟', bad: v => v === 540 - p - q - t ? 'نسيت الزاوية الخامسة عند الضلع الأيسر: أوجدها من المتوازيين.' : v === 360 - p - q - t ? 'مجموع زوايا الخماسي ٥٤٠°.' : '',
      good: `الزاوية اليسرى ${deg(180 - p)} ← ${deg(540)} − ${deg(180)} − ${deg(q)} − ${deg(t)} = ${deg(x)}`, data: { kind: 'pent', labs: [deg(p), deg(q), '؟', deg(t), ''], ans: x, title: 'خماسي بضلعين متوازيين' } }; }
  if (i === 4) { return { q: 'وُصل رأسان بينهما رأس واحد في سداسي منتظم فتكوّن مثلث متطابق الضلعين. ما قياس كل من زاويتي قاعدته؟', input: { type: 'num' }, sol: 30, ok: v => v === 30,
      hint: 'ما الزاوية الداخلية للسداسي المنتظم؟ وهي زاوية رأس المثلث. والزاويتان الباقيتان متساويتان.', bad: v => v === 60 ? 'هذا لو كان المثلث متطابق الأضلاع: زاوية رأسه ١٢٠°.' : v === 120 ? 'هذه زاوية الرأس.' : '',
      good: '(١٨٠° − ١٢٠°) ÷ ٢ = ٣٠°', data: { kind: 'hex', ans: 30, title: 'مثلث في السداسي' } }; }
  const a = R(9, 30) * 5, kind = pick([['المتبادلة', 'لأن الزاويتين المتبادلتين بين متوازيين متساويتان'], ['المتناظرة', 'لأن الزاويتين المتناظرتين بين متوازيين متساويتان']]);
  const right = kind[1], opts = shuf([right, 'لأن مجموع زوايا المثلث ١٨٠°', 'لأن الزوايا حول نقطة مجموعها ٣٦٠°', 'لأن الزاويتين متقابلتان بالرأس فقط']);
  return { q: `قال باسم: الزاوية ${kind[0]} لزاوية قياسها ${deg(a)} بين خطين متوازيين قياسها ${deg(a)} أيضاً. ما السبب؟`, input: { type: 'pick', opts }, ok: v => opts[v] === right,
    hint: 'أي خاصية تخص المستقيمات المتوازية؟', bad: () => 'هذه حقيقة صحيحة لكنها لا تفسر هذه الخطوة.',
    good: right, data: { kind: 'par', a, ans: a, title: 'لماذا؟' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const a = fresh(() => R(8, 30) * 5); items.push(num(`زاوية متناظرة لزاوية قياسها ${deg(a)} بين متوازيين. ما قياسها؟`, a, 'المتناظرتان متساويتان.', '8Gs4')); }
  { const a = fresh(() => R(4, 32) * 5); items.push(num(`زاويتان على خط مستقيم إحداهما ${deg(a)}. ما الأخرى؟`, 180 - a, '١٨٠° − الزاوية.', '8Gs4')); }
  { const [a, b] = fresh(() => [R(6, 14) * 5, R(6, 14) * 5]); items.push(num(`زاويتان داخليتان في مثلث ${deg(a)} و${deg(b)}. ما الزاوية الخارجية عند الرأس الثالث؟`, a + b, 'مجموع الزاويتين.', '8Gs4')); }
  items.push(num('زوايا حول نقطة: ١٢٠° و٩٠° و٨٠° وزاوية رابعة. ما الرابعة؟', 70, '٣٦٠° − المجموع.', '8Gs4'));
  items.push(tf('الزاويتان المتبادلتان بين مستقيمين متوازيين متساويتان.', true, 'تذكّر شكل Z.', '8Gs4', 'خاصية المتوازيين.'));
  items.push(tf('مجموع الزاويتين الداخليتين بين متوازيين على جهة واحدة من القاطع ٣٦٠°.', false, 'هل هما على خط واحد؟', '8Gs4', 'مجموعهما ١٨٠°.'));
  items.push(choice('في السداسي المنتظم قياس الزاوية الداخلية:', '١٢٠°', ['٦٠°', '١٠٨°', '١٣٥°'], '١٨٠ − ٦٠.', '8Gs4'));
  { const p = fresh(() => R(15, 22) * 5); items.push(num(`في شبه منحرف زاويتان على ضلع واحد بين ضلعين متوازيين، إحداهما ${deg(p)}. ما الأخرى؟`, 180 - p, 'مجموعهما ١٨٠°.', '8Gs4')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'سقف القبة', icon: '🕌', who, rounds: 6, make, draw,
  intro: ['أنا باسم، مهندس الدار. زخارف القبة خطوط متوازية ومضلعات متداخلة.', 'كل زاوية مجهولة نكشفها بحقيقة نعرفها… واذكر السبب دائماً!'],
  outro: ['رائع! سقف القبة كله بزوايا صحيحة.', 'تحدي مسائل الزوايا.'],
  challenge: { title: 'تحدي الزوايا', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
