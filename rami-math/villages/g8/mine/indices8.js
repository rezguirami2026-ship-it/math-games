// ١-٣ الأسس — «كهف التضاعف»: بلّورة سحرية تتضاعف (×الأساس) مع كل خطوة إلى الأمام، وتنقسم (÷الأساس) مع كل خطوة إلى الخلف.
// فيرى الطالب أن الأس صفر يعطي بلّورة واحدة، والأس السالب كسراً منها (الكتاب ص٢٢: جدول قوى العدد ٣ من الأس ٤− إلى ٥).
// التحدي: ٨ أسئلة جديدة من مخرج 8Ni3.
import { mission } from '../../mission.js';
import { N, R, pw, fr, mx } from '../../math.js';
import { choice, num, tf, match } from '../../../missions/challenge.js';

const who = { name: 'الحكيمة نورة', face: '🧙🏽‍♀️', id: 'noura' };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : { b: 3 }, b = r.b || 3, e = S.r && S.r.input.type === 'dial' ? S.v : (r.e ?? 0);
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#F5EEFF'); bg.addColorStop(1, '#E4D7F5'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // شريط الأسس من ٤− إلى ٥ (اليسار − واليمين + كالمحور)
  const lo = -4, hi = 5, xOf = k => 30 + (k - lo) / (hi - lo) * (w - 60), y = h - 30;
  g.strokeStyle = '#4C1D95'; g.lineWidth = 3; g.beginPath(); g.moveTo(xOf(lo), y); g.lineTo(xOf(hi), y); g.stroke();
  g.font = '700 12px Cairo'; g.textAlign = 'center';
  for (let k = lo; k <= hi; k++) { g.fillStyle = k === e ? '#D97706' : '#4C1D95'; g.font = k === e ? '900 16px Cairo' : '700 14px Cairo'; g.beginPath(); g.arc(xOf(k), y, k === e ? 6 : 3, 0, 7); g.fill(); g.fillText(N(k), xOf(k), y + 18); }
  S.ex = S.ex == null ? e : S.ex + (e - S.ex) * .15;
  // البلّورة: عدد كامل من النسخ للأس الموجب، وشريحة من بلّورة للأس السالب
  const cx = w / 2, cy = h / 2 - 10, val = b ** e, glow = 0.6 + 0.4 * Math.sin(t * 2.2);
  const gem = (x, y, s, a = 1) => { g.globalAlpha = a; g.fillStyle = '#FFB347'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * .6, y); g.lineTo(x, y + s); g.lineTo(x - s * .6, y); g.fill(); g.fillStyle = '#FFE1A8'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * .3, y - s * .1); g.lineTo(x, y); g.fill(); g.globalAlpha = 1; };
  const halo = g.createRadialGradient(cx, cy, 4, cx, cy, 120); halo.addColorStop(0, `rgba(255,179,71,${.25 * glow})`); halo.addColorStop(1, 'rgba(255,179,71,0)'); g.fillStyle = halo; g.fillRect(0, 0, w, h);
  if (S.r && S.r.input.type !== 'dial' && !S.done) {   // قبل الحل: لا نرسم الجواب
    g.fillStyle = '#4C1D95'; g.font = '900 64px Cairo'; g.textAlign = 'center'; g.fillText('؟', cx, cy + 22);
  } else if (val >= 1) {
    const n = Math.min(val, 243), cols = Math.ceil(Math.sqrt(n * 2.2)), s = Math.max(3, Math.min(22, (h - 90) / (Math.ceil(n / cols) * 2.2), (w - 60) / (cols * 1.4)));
    for (let k = 0; k < n; k++) { const row = Math.floor(k / cols), col = k % cols, rows = Math.ceil(n / cols); gem(cx + (col - (cols - 1) / 2) * s * 1.4, cy + (row - (rows - 1) / 2) * s * 2.1, s); }
  } else {   // كسر من بلّورة: نرسم البلّورة شفافة وجزءها الملوّن بنسبة القيمة
    const s = 46; gem(cx, cy, s, .18);
    g.save(); g.beginPath(); g.rect(cx - s, cy + s - 2 * s * Math.max(val, .02), 2 * s, 2 * s); g.clip(); gem(cx, cy, s); g.restore();
  }
  g.fillStyle = '#4C1D95'; g.font = '900 19px Cairo'; g.textAlign = 'center';
  if (S.done) g.fillText(val >= 1 ? `${N(b)} أس ${N(e)} = ${N(val)}` : `${N(b)} أس ${N(e)} = ١ ÷ ${N(b ** -e)}`, w / 2, 22);
}

function make(i) {
  if (i === 0) { const b = R(2, 3), e = b === 2 ? R(3, 5) : R(2, 4), v = b ** e;   // الأس ضمن المؤشر (حتى ٥)
    return { q: `البلّورة تتضاعف ${N(b)} مرات مع كل خطوة. حرّك المؤشر حتى يصير عددها <b>${N(v)}</b>. ما الأس؟`, input: { type: 'dial', start: 0, min: -4, max: 5, show: k => pw(b, k), label: '✨ ثبّت الأس' },
      ok: k => k === e, hint: `كم مرة تضرب ${N(b)} في نفسه لتصل إلى ${N(v)}؟`, bad: k => b ** k > v ? 'تجاوزتَ العدد المطلوب.' : 'لم تصل بعد.', data: { b } }; }
  if (i === 1) { const b = R(2, 9); return { q: `حرّك المؤشر إلى الأس <b>صفر</b>. كم يساوي ${pw(b, 0)}؟`, input: { type: 'num' }, ok: v => v === 1,
    hint: 'انظر إلى المشهد: عند الأس ١ كم بلّورة؟ وماذا يحدث حين تقسم على الأساس خطوة إلى الخلف؟', bad: v => v === 0 ? 'الصفر يعني لا شيء، لكن البلّورة ما زالت هنا!' : v === b ? 'هذا عند الأس ١.' : '', data: { b, e: 0 } }; }
  if (i === 2) { const b = R(2, 4), e = -R(1, 3), d = b ** -e, opts = [fr(1, d), N(-d), fr(1, d * b), N(d)], sh = opts.map((o, k) => [Math.random(), o, k]).sort((a, c) => a[0] - c[0]);
    return { q: `البلّورة تنقسم إلى ${N(b)} أجزاء مع كل خطوة إلى الخلف. كم يساوي ${pw(b, e)}؟`, input: { type: 'pick', opts: sh.map(x => x[1]) }, ok: k => sh[k][2] === 0,
      hint: `الأس السالب يعني قسمة: كم مرة تقسم البلّورة الواحدة على ${N(b)}؟`, bad: k => sh[k][2] === 1 ? 'الأس السالب لا يجعل العدد سالباً: هل يمكن أن يكون عدد البلّورات سالباً؟' : '', data: { b, e } }; }
  if (i === 3) { const b = R(5, 9), e = 2, d = b * b, opts = [pw(b, -2), pw(b, 2), pw(-b, 2), pw(b, -1)], sh = opts.map((o, k) => [Math.random(), o, k]).sort((a, c) => a[0] - c[0]);
    return { q: `اكتب ${fr(1, d)} في صورة قوة للعدد ${N(b)}.`, input: { type: 'pick', opts: sh.map(x => x[1]) }, ok: k => sh[k][2] === 0,
      hint: `${N(d)} = ${N(b)} × ${N(b)}. وحين يكون العدد في المقام، ماذا تكون إشارة الأس؟`, bad: k => sh[k][2] === 1 ? `${pw(b, 2)} = ${N(d)} وليس جزءاً منه.` : '', data: { b, e: -2 } }; }
  const b = R(2, 3), a = R(2, 3);   // مجموع قوى (تمرين ٥ في الكتاب): يكتب الناتج كسراً
  const v = b ** a + b + 1 + 1 / b, whole = b ** a + b + 1, opts = [mx(whole, 1, b), N(whole + 1), N(whole), mx(whole, 1, b * b)], sh = opts.map((o, k) => [Math.random(), o, k]).sort((x, y) => x[0] - y[0]);
  return { q: `أوجد ناتج: ${pw(b, a)} + ${pw(b, 1)} + ${pw(b, 0)} + ${pw(b, -1)}`, input: { type: 'pick', opts: sh.map(x => x[1]) }, ok: k => sh[k][2] === 0,
    hint: `احسب كل قوة وحدها: ما قيمة ${pw(b, 0)}؟ وما قيمة ${pw(b, -1)}؟`, bad: k => sh[k][2] === 2 ? `نسيت قيمة ${pw(b, -1)}.` : sh[k][2] === 1 ? `${pw(b, -1)} ليست ١.` : '', data: { b, e: a } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [b, e] = fresh(() => [R(2, 5), R(2, 4)]); items.push(num(`احسب: ${pw(b, e)}`, b ** e, `اضرب ${N(b)} في نفسه: كم مرة؟`, '8Ni3')); }
  { const b = fresh(() => R(2, 12)); items.push(num(`احسب: ${pw(b, 0)}`, 1, 'ماذا يحدث حين تقسم قوة على نفسها؟ مثلاً: ٣ ÷ ٣', '8Ni3')); }
  { const [b, e] = fresh(() => [R(2, 5), -R(1, 3)]); const d = b ** -e;
    items.push(choice(`${pw(b, e)} تساوي:`, fr(1, d), [N(-d), fr(1, d * b), N(b * -e)], 'الأس السالب يعني مقلوب القوة الموجبة: ما القوة الموجبة أولاً؟', '8Ni3')); }
  { const [b] = fresh(() => [R(3, 7)]); items.push(choice(`اكتب ${fr(1, b ** 3)} في صورة قوة:`, pw(b, -3), [pw(b, 3), pw(-b, 3), pw(b * b * b, 0)], 'العدد في المقام: أي إشارة للأس تعني «واحد مقسوم على»؟', '8Ni3')); }
  { const [b, e] = fresh(() => [R(2, 3), R(2, 4)]); items.push(tf(`${pw(b, -e)} عدد سالب`, false, 'هل يمكن أن تنتج القسمة على عدد موجب عدداً سالباً؟', '8Ni3', `${pw(b, -e)} = ${fr(1, b ** e)}، وهو عدد موجب أصغر من ١`)); }
  { const b = fresh(() => R(2, 3)), es = [-2, -1, 0, 1, 2];
    items.push(match(`صِل كل قوة للعدد ${N(b)} بقيمتها:`, es.map(e => [pw(b, e), e < 0 ? fr(1, b ** -e) : N(b ** e)]), 'ابدأ من الأس صفر: كم قيمته؟ ثم اضرب أو اقسم على الأساس خطوة خطوة.', '8Ni3')); }
  { const [b, e] = fresh(() => [10, R(2, 5)]); items.push(num(`كم صفراً في ${pw(b, e)} عند كتابتها عدداً؟`, e, 'كل ضرب في ١٠ يضيف صفراً: كم مرة ضربنا؟', '8Ni3')); }
  { const [b] = fresh(() => [R(2, 3)]); const v = b ** 2 + b + 1; items.push(num(`احسب: ${pw(b, 2)} + ${pw(b, 1)} + ${pw(b, 0)}`, v, `ما قيمة ${pw(b, 0)}؟ احسب كل قوة ثم اجمع.`, '8Ni3')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'كهف التضاعف', icon: '✨', who, rounds: 5, make, draw,
  intro: ['انظر إلى هذه البلّورة السحرية: مع كل خطوة إلى الأمام تتضاعف، ومع كل خطوة إلى الخلف تنقسم.', 'الأس يخبرنا كم خطوة مشينا. فماذا يحدث عند الصفر؟ وماذا وراءه؟'],
  outro: ['الآن تعرف سر الكهف: الأس صفر يعطي واحداً، والأس السالب يعطي كسراً.', 'أجب عن أسئلة الكهف، ثم امضِ إلى البوابة الكبرى.'],
  challenge: { title: 'تحدي الأسس', make: challenge }
});

export { make, challenge };   // للفحص الآلي (tests/fuzz-villages.mjs)
