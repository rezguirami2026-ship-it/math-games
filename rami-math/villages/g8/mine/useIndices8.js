// ١-٤ استخدام الأسس — «بوابة القوانين»: بوابة المنجم الكبرى بأربعة أقفال، كل قفل قانون من قوانين الأسس (الكتاب ص٢٣–٢٦):
// الضرب (جمع الأسس)، القسمة (طرح الأسس، وقد يكون الناتج سالباً)، قوة القوة (ضرب الأسس)، ثم إيجاد الأس المجهول س.
// التحدي: ٨ أسئلة جديدة من مخرجي 8Ni3 و8Nc4.
import { mission } from '../../mission.js';
import { N, R, pw, fr } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';

const who = { name: 'حارس البوابة حمدان', face: '💂🏽‍♂️', id: 'hamdan' };

function draw(g, w, h, t, S) {
  const open = S.i + (S.done ? 1 : 0), cx = w / 2, top = 16, bot = h - 8, gw = Math.min(w * .62, 330);
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#FBF3E2'); bg.addColorStop(1, '#E8D6B5'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // العمودان والعتبة
  g.fillStyle = '#5A5048'; g.fillRect(cx - gw / 2 - 30, top, 30, bot - top); g.fillRect(cx + gw / 2, top, 30, bot - top); g.fillStyle = '#463E37'; g.fillRect(cx - gw / 2 - 40, top, gw + 80, 26);
  // المصراعان: ينفتحان حين تُفتح الأقفال الأربعة
  const k = open >= 5 ? Math.min(1, (S.doorT = (S.doorT || 0) + .012)) : 0, half = gw / 2 * (1 - k * .85);
  const leaf = (x0, wd, side) => { const gr = g.createLinearGradient(x0, 0, x0 + wd, 0); gr.addColorStop(0, '#3E3A36'); gr.addColorStop(1, '#55504A'); g.fillStyle = gr; g.fillRect(x0, top + 26, wd, bot - top - 26);
    g.strokeStyle = '#2A2724'; g.lineWidth = 3; for (let y = top + 50; y < bot; y += 34) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + wd, y); g.stroke(); } };
  if (k > 0) { const lg = g.createRadialGradient(cx, h / 2, 10, cx, h / 2, gw); lg.addColorStop(0, `rgba(255,214,120,${.8 * k})`); lg.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = lg; g.fillRect(cx - gw / 2, top + 26, gw, bot - top - 26); }
  leaf(cx - gw / 2, half, -1); leaf(cx + gw / 2 - half, half, 1);
  // الأقفال الأربعة: تتوهج ذهباً حين تُفتح
  if (k < .3) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], n) => {
    const x = cx + a * gw * .2, y = top + 26 + (bot - top - 26) * (.5 + b * .2), on = n < open, cur = n === S.i && !S.done;
    g.fillStyle = on ? '#FFC94A' : '#2A2724'; g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill();
    g.strokeStyle = cur ? `rgba(255,201,74,${.5 + .5 * Math.sin(t * 5)})` : on ? '#FFE7A8' : '#6E6358'; g.lineWidth = 3; g.stroke();
    g.save(); g.translate(x, y); g.rotate(on ? Math.PI / 2 : (cur ? Math.sin(t * 3) * .2 : 0)); g.fillStyle = on ? '#7A4A00' : '#8C8F96'; g.fillRect(-3, -14, 6, 28); g.restore();
  });
  if (S.r && S.r.data.expr) { g.fillStyle = '#FFFFFFE6'; g.fillRect(cx - 120, h - 40, 240, 30); g.fillStyle = '#7C2D12'; g.font = '800 15px Cairo'; g.textAlign = 'center'; g.fillText(S.r.data.expr, cx, h - 20); }
}

function make(i) {
  const b = R(2, 9);
  if (i === 0) { const m = R(2, 6), n = R(2, 6); return { q: `القفل الأول: ${pw(b, m)} × ${pw(b, n)} = ${pw(b, '□')}`, input: { type: 'dial', start: 0, min: -12, max: 15, show: v => pw(b, v), label: '🔓 أدر القفل' },
    ok: v => v === m + n, hint: `${pw(b, m)} يعني ${N(m)} عوامل من ${N(b)}، و${pw(b, n)} يعني ${N(n)} عوامل. كم عاملاً معاً؟`, bad: v => v === m * n ? 'الضرب لا يضرب الأسس: عُدّ العوامل.' : '', data: {} }; }
  if (i === 1) { const m = R(2, 5), n = m + R(1, 3); return { q: `القفل الثاني: ${pw(b, m)} ÷ ${pw(b, n)} = ${pw(b, '□')}`, input: { type: 'dial', start: 0, min: -12, max: 15, show: v => pw(b, v), label: '🔓 أدر القفل' },
    ok: v => v === m - n, hint: 'في القسمة تختصر العوامل المشتركة: أيهما فيه عوامل أكثر، البسط أم المقام؟ وماذا يعني أن يبقى العامل في المقام؟', bad: v => v === n - m ? 'المقدار صحيح، لكن العوامل الباقية في المقام: ماذا تكون إشارة الأس؟' : '', data: {} }; }
  if (i === 2) { const m = R(2, 4), n = R(2, 3); return { q: `القفل الثالث: (${pw(b, m)})<sup>${N(n)}</sup> = ${pw(b, '□')}`, input: { type: 'dial', start: 0, min: -12, max: 15, show: v => pw(b, v), label: '🔓 أدر القفل' },
    ok: v => v === m * n, hint: `(${pw(b, m)})<sup>${N(n)}</sup> تعني ${pw(b, m)} مضروباً في نفسه ${N(n)} مرات: كم عاملاً من ${N(b)} في المجموع؟`, bad: v => v === m + n ? 'هذا لو ضربنا قوتين فقط: هنا القوة نفسها تتكرر.' : '', data: {} }; }
  if (i === 3) { const a = R(2, 5), x = R(2, 6), c = a + x; return { q: `القفل الرابع: أوجد قيمة س: ${pw(10, a)} × ${pw(10, 'س')} = ${pw(10, c)}`, input: { type: 'num', neg: true }, ok: v => v === x,
    hint: 'حين تضرب قوتين للأساس نفسه تجمع الأسس: ما العدد الذي إذا أضفته إلى الأس الأول أعطاك الأس الناتج؟', bad: v => v === c + a ? 'لو جمعتَ هذا العدد لتجاوزت الأس الناتج.' : '', data: {} }; }
  const m = R(3, 6), n = R(2, 5), p = R(2, 4), r0 = m + n - p;   // القفل الأخير: قانونان معاً
  return { q: `المفتاح الأخير: (${pw(2, m)} × ${pw(2, n)}) ÷ ${pw(2, p)} = ${pw(2, '□')}`, input: { type: 'dial', start: 0, min: -12, max: 15, show: v => pw(2, v), label: '🗝️ افتح البوابة' },
    ok: v => v === r0, hint: 'ابدأ بما بين القوسين: ماذا تفعل بالأسس عند الضرب؟ ثم ماذا تفعل عند القسمة؟', bad: v => v === m + n ? 'لم تكمل خطوة القسمة.' : '', good: 'انفتحت البوابة الكبرى! 🎉', data: {} };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [b, m, n] = fresh(() => [R(2, 9), R(2, 6), R(3, 6)]); items.push(choice(`بسّط: ${pw(b, m)} × ${pw(b, n)}`, pw(b, m + n), [pw(b, m * n), pw(b * b, m + n), pw(b, Math.abs(m - n) || m + n + 1)], 'كم عاملاً من الأساس في الطرفين معاً؟', '8Ni3')); }
  { const [b, m, n] = fresh(() => [R(2, 9), R(5, 9), R(2, 4)]); items.push(choice(`بسّط: ${pw(b, m)} ÷ ${pw(b, n)}`, pw(b, m - n), [pw(b, m + n), pw(b, m * n), pw(b, n - m)], 'كم عاملاً يُختصر من البسط والمقام؟ وكم يبقى في البسط؟', '8Ni3')); }
  { const [b, m, n] = fresh(() => [R(2, 9), R(2, 3), R(4, 6)]); items.push(num(`أكمل الأس: ${pw(b, m)} ÷ ${pw(b, n)} = ${pw(b, '□')}`, m - n, 'في القسمة نطرح الأسس: أي الأسين أكبر؟ وماذا تعني إشارة الناتج؟', '8Ni3', { neg: true })); }
  { const [m, n] = fresh(() => [R(2, 4), R(2, 3)]); items.push(num(`أكمل الأس: (${pw(2, m)})<sup>${N(n)}</sup> = ${pw(2, '□')}`, m * n, 'كم مرة تتكرر القوة؟ وكم عاملاً من ٢ في كل منها؟', '8Ni3')); }
  { const [a, x] = fresh(() => [R(2, 5), R(2, 5)]); items.push(num(`أوجد قيمة س: ${pw(10, a)} × ${pw(10, 'س')} = ${pw(10, a + x)}`, x, 'ما الذي يُجمع إلى الأس الأول ليعطي الأس الناتج؟', '8Ni3', { neg: true })); }
  { const [a, x] = fresh(() => [R(5, 8), R(1, 4)]); items.push(num(`أوجد قيمة س: ${pw(10, a)} ÷ ${pw(10, 'س')} = ${pw(10, a - x)}`, x, 'في القسمة يُطرح الأس: ما العدد الذي إذا طرحته من الأس الأول أعطاك الناتج؟', '8Ni3', { neg: true })); }
  { const [b, m, n] = fresh(() => [R(2, 5), R(2, 4), R(2, 4)]); items.push(tf(`${pw(b, m)} × ${pw(b, n)} = ${pw(b, m * n)}`, m + n === m * n, 'جرّب بالعدّ: كم عاملاً من الأساس في الطرف الأيسر فعلاً؟', '8Ni3', `${pw(b, m)} × ${pw(b, n)} = ${pw(b, m + n)} لأننا نجمع الأسس في الضرب`)); }
  { const k = fresh(() => R(3, 5)); items.push(choice(`اكتب ${N(2 ** k)} ÷ ${N(2 ** (k + 2))} في صورة قوة للعدد ٢:`, pw(2, -2), [pw(2, 2), pw(2, k * 2 + 2), fr(1, 2)], `${N(2 ** k)} = ${pw(2, k)}، فما ${N(2 ** (k + 2))} في صورة قوة؟ ثم اطرح الأسس.`, '8Nc4')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'بوابة القوانين', icon: '🚪', who, rounds: 5, make, draw,
  intro: ['هذه البوابة الكبرى تحرس أعمق كنوز المنجم.', 'على كل قفل قانون من قوانين الأسس. افتحها كلها، والمفتاح الأخير يجمع قانونين معاً.'],
  outro: ['انفتحت البوابة! أنت الآن سيّد قوانين الأسس.', 'بقي تحدّي البوابة الأخير، ثم تكون قد أنهيت منجم الأعماق كله.'],
  challenge: { title: 'تحدي قوانين الأسس', make: challenge }
});

export { make, challenge };   // للفحص الآلي (tests/fuzz-villages.mjs)
