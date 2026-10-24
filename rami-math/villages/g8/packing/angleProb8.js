// ٣-٣ حل مسائل الزوايا — «سيور الإنتاج»: سيران متوازيان (عليهما سهمان) يقطعهما ذراع آلي مائل. الطالب يجد الزوايا المتناظرة
// والمتبادلة والمتقابلة بالرأس والتي على خط مستقيم، ويذكر السبب، ويكتشف خطأ فريدة في واجبها. التحدي: ٨ أسئلة من 8Gs2 (الكتاب ص٥٦–٥٩).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';

const who = { name: 'الفنية هند', face: '👩🏽‍🏭', id: 'hind' };
const deg = v => `${N(v)}°`;
// عند كل تقاطع أربع زوايا: ٠ أعلى اليمين، ١ أعلى اليسار، ٢ أسفل اليسار، ٣ أسفل اليمين (القاطع من أعلى اليمين إلى أسفل اليسار)
const val = (th, p) => p % 2 ? 180 - th : th;
const REASON = { corr: 'زاويتان متناظرتان', alt: 'زاويتان متبادلتان', vert: 'زاويتان متقابلتان بالرأس', line: 'زاويتان على خط مستقيم' };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}, th = r.th || 60;
  g.fillStyle = '#EEF2F7'; g.fillRect(0, 0, w, h);
  const y1 = h * .32, y2 = h * .7, sl = 1 / Math.tan(th * Math.PI / 180), cx = w * .5;
  // السيران: شريطان رماديان بأسطوانات وسهمان (علامة التوازي)
  [y1, y2].forEach(y => { g.fillStyle = '#52525B'; g.fillRect(w * .04, y - 10, w * .92, 20); g.fillStyle = '#71717A'; for (let x = (t * 50) % 30 + w * .04; x < w * .96; x += 30) g.fillRect(x, y - 10, 12, 20);
    g.fillStyle = '#F59E0B'; g.beginPath(); g.moveTo(w * .85, y - 18); g.lineTo(w * .89, y - 24); g.lineTo(w * .85, y - 30); g.fill(); });
  // الذراع القاطع
  const I1 = { x: cx + (h * .5 - y1) * sl * .0 + (y2 - y1) * sl / 2, y: y1 }, I2 = { x: cx - (y2 - y1) * sl / 2, y: y2 };
  const dx = (I1.x - I2.x) / (y2 - y1), top = { x: I1.x + dx * (y1 - h * .04), y: h * .04 }, bot = { x: I2.x - dx * (h * .96 - y2), y: h * .96 };
  g.strokeStyle = '#0EA5E9'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(top.x, top.y); g.lineTo(bot.x, bot.y); g.stroke(); g.lineCap = 'butt';
  g.fillStyle = '#0369A1'; g.beginPath(); g.arc(top.x, top.y + 6, 10, 0, 7); g.fill();
  // الزوايا المطلوبة: أقواس بألوان وقيم (المجهولة «؟» حتى الحل)
  const a = Math.atan2(y2 - y1, I1.x - I2.x);   // اتجاه القاطع إلى الأعلى (زاوية رياضية موجبة = قياس الزاوية الحادة)
  const rays = [0, a, Math.PI, a + Math.PI];   // يمين، أعلى القاطع، يسار، أسفل القاطع (بإحداثيات الشاشة)
  const arcs = r.arcs || [];
  arcs.forEach(([at, p, txt, col]) => { const I = at ? I2 : I1, s0 = [0, a, Math.PI, a + Math.PI][p], s1 = [a, Math.PI, a + Math.PI, Math.PI * 2][p];
    g.fillStyle = col; g.globalAlpha = .28; g.beginPath(); g.moveTo(I.x, I.y); g.arc(I.x, I.y, 46, -s1, -s0); g.closePath(); g.fill(); g.globalAlpha = 1;   // إسفين ملوّن يوضح الزاوية
    g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(I.x, I.y, 46, -s1, -s0); g.stroke(); const m = -(s0 + s1) / 2; g.fillStyle = col; g.font = '900 16px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
    g.fillText(txt === '?' ? (S.done ? deg(r.ans) : '؟') : txt, I.x + Math.cos(m) * 70, I.y + Math.sin(m) * 70 + 6); });
  if (r.err) {   // واجب فريدة: مستقيمان متقاطعان بقيم خاطئة
    g.fillStyle = '#FFFDF6'; g.fillRect(w * .05, h * .05, w * .9, h * .9); const C = { x: w * .5, y: h * .5 }; g.strokeStyle = '#1E2433'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(C.x - 160, C.y - 50); g.lineTo(C.x + 160, C.y + 50); g.moveTo(C.x - 160, C.y + 50); g.lineTo(C.x + 160, C.y - 50); g.stroke();
    g.fillStyle = '#B91C1C'; g.font = '900 17px Cairo'; g.textAlign = 'center'; [[0, -36, r.err[0]], [-90, 6, r.err[1]], [0, 46, r.err[2]], [90, 6, r.err[3]]].forEach(([ox, oy, v]) => g.fillText(deg(v), C.x + ox, C.y + oy));
    g.fillStyle = '#475569'; g.font = '800 14px Cairo'; g.fillText('واجب فريدة', w * .5, h * .14);
  }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  const th = R(5, 15) * 5, kinds = [['corr', [0, 0, 1, 0]], ['alt', [0, 2, 1, 0]], ['vert', [0, 0, 0, 2]], ['line', [0, 0, 0, 1]]];
  if (i <= 3) { const [kind, [atA, pA, atB, pB]] = kinds[i], given = val(th, pA), ans = val(th, pB);
    return { q: `زاوية الذراع مع السير ${atA ? 'السفلي' : 'العلوي'}، وهي الزرقاء، قياسها <b>${deg(given)}</b>. أوجد قياس الزاوية البرتقالية.`, input: { type: 'num' }, ok: x => x === ans,
      hint: { corr: 'الزاويتان في الموضع نفسه عند تقاطعين على خطين متوازيين: كيف تكونان؟', alt: 'الزاويتان بين السيرين وعلى جهتين مختلفتين من الذراع: كيف تكونان؟', vert: 'الزاويتان متقابلتان عند التقاطع نفسه، كالمقص المفتوح.', line: 'الزاويتان معاً تكوّنان خطاً مستقيماً: كم مجموعهما؟' }[kind],
      bad: x => x === 180 - ans ? 'هذا مكمّل الزاوية. انظر: هل الزاويتان متساويتان أم مجموعهما ١٨٠°؟' : '', good: `أحسنت! ${REASON[kind]}.`,
      data: { th, ans, arcs: [[atA, pA, deg(given), '#2563EB'], [atB, pB, '?', '#EA580C']] } }; }
  const x = R(25, 40), err = [180 - x, x, 180 - x - R(5, 15), x + R(5, 15)], opts = ['الزاويتان المتقابلتان بالرأس يجب أن تتساويا', 'مجموع الزوايا حول نقطة يجب أن يكون ١٨٠°', 'الزاويتان على خط مستقيم يجب أن تتساويا'], sh = opts.map((o, j) => [Math.random(), o, j]).sort((a, b) => a[0] - b[0]);
  return { q: 'في واجب فريدة: مستقيمان متقاطعان، وكتبت قياسات الزوايا الأربع. ما الخطأ في إجابتها؟', input: { type: 'pick', opts: sh.map(o => o[1]) }, ok: k => sh[k][2] === 0,
    hint: 'قارن الزاويتين المتقابلتين بالرأس في الأعلى والأسفل: ماذا يجب أن يكون بينهما؟', bad: k => sh[k][2] === 1 ? 'المجموع حول النقطة ٣٦٠°، لا ١٨٠°.' : '', data: { th: 60, err } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const a = fresh(() => R(25, 75)); items.push(num(`زاويتان على خط مستقيم، إحداهما ${deg(a)}. ما الأخرى؟`, 180 - a, 'مجموع الزوايا على خط مستقيم ١٨٠°.', '8Gs2')); }
  { const v = fresh(() => [R(60, 120), R(60, 100)]); items.push(num(`ثلاث زوايا حول نقطة: ${deg(v[0])} و${deg(v[1])} والثالثة مجهولة. ما قياسها؟`, 360 - v[0] - v[1], 'مجموع الزوايا حول نقطة ٣٦٠°.', '8Gs2')); }
  { const a = fresh(() => R(25, 80)); items.push(num(`زاوية قياسها ${deg(a)}. ما قياس الزاوية المقابلة لها بالرأس؟`, a, 'المتقابلتان بالرأس متساويتان.', '8Gs2')); }
  { const a = fresh(() => R(25, 80)); items.push(num(`خطان متوازيان يقطعهما قاطع. إحدى الزاويتين المتناظرتين ${deg(a)}. ما الأخرى؟`, a, 'المتناظرتان متساويتان حين يكون الخطان متوازيين.', '8Gs2')); }
  { const a = fresh(() => R(25, 80)); items.push(num(`في متوازي أضلاع زاوية قياسها ${deg(a)}. ما قياس الزاوية المجاورة لها؟`, 180 - a, 'الزاويتان المتجاورتان في متوازي الأضلاع بين ضلعين متوازيين: كم مجموعهما؟', '8Gs2')); }
  items.push(choice('الزاويتان بين خطين متوازيين وعلى جهتين مختلفتين من القاطع هما:', 'متبادلتان', ['متناظرتان', 'متقابلتان بالرأس', 'على خط مستقيم'], 'تخيّل حرف Z: أين تقع الزاويتان؟', '8Gs2'));
  items.push(tf('الزوايا المتقابلة في متوازي الأضلاع متساوية.', true, 'استعمل الزوايا المتناظرة والمتبادلة مع الأضلاع المتوازية.', '8Gs2', 'بإثبات الكتاب (مثال ٣-٣): كل زاويتين متقابلتين متساويتان.'));
  items.push(tf('المتناظرتان مجموعهما ١٨٠° دائماً.', false, 'هل هما في الموضع نفسه أم في موضعين متكاملين؟', '8Gs2', 'المتناظرتان متساويتان، والمجموع ١٨٠° للزاويتين على خط مستقيم.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'سيور الإنتاج', icon: '⚙️', who, rounds: 5, make, draw,
  intro: ['السيران متوازيان تماماً، والذراع الآلي يقطعهما مائلاً ليوجّه الصناديق.', 'إن عرفت زاوية واحدة عرفت الزوايا الأخرى كلها… بشرط أن تعرف السبب!'],
  outro: ['ضبطتَ الذراع على كل الزوايا، واكتشفت خطأ فريدة أيضاً.', 'لنختبر الأسباب بأسئلة الخط.'],
  challenge: { title: 'تحدي مسائل الزوايا', make: challenge }
});
export { make, challenge };
