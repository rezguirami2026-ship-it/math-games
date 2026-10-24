// ٣-١ رسم شبكات للمجسمات — «خط الطيّ»: خط إنتاج في مصنع التغليف يقصّ ألواح الكرتون شبكاتٍ ثم يطويها صناديق.
// الطالب يختار الشبكة التي تكوّن مكعباً، ويعدّ أوجه الهرم والمنشور، ويحدد مقاسات وجه في شبكة متوازي المستطيلات.
// بعد الإجابة الصحيحة تنطوي الشبكة في المشهد. التحدي: ٨ أسئلة جديدة من مخرج 8Gs3 (الكتاب ص٤٩–٥١).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf, multi } from '../../../missions/challenge.js';

const who = { name: 'مشرفة الخط سعاد', face: '👩🏽‍🔧', id: 'suad' };
// شبكات بخلايا [عمود، صف]: ٤ تكوّن مكعباً (معروفة) و٤ لا تكوّنه
const CUBE_OK = [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]]];
const CUBE_NO = [[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1]], [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]].map(([x, y]) => [x, y]).slice(0, 5).concat([[2, 2]]), [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]];
const COLS = ['#E11D48', '#F59E0B', '#16A34A', '#2563EB', '#7C3AED', '#0EA5E9'];

function drawNet(g, cells, x, y, u, fold) {
  cells.forEach(([cx, cy], k) => { const px = x + cx * u, py = y + cy * u; g.save(); if (fold && k) { g.globalAlpha = 1 - fold * .6; } g.fillStyle = COLS[k % 6]; g.fillRect(px, py, u - 2, u - 2); g.strokeStyle = '#7C2D12'; g.lineWidth = 2; g.setLineDash([5, 4]); g.strokeRect(px, py, u - 2, u - 2); g.restore(); });
}
function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {};
  g.fillStyle = '#F5EBDD'; g.fillRect(0, 0, w, h); g.fillStyle = '#3F3F46'; g.fillRect(0, h * .78, w, h * .22);   // سير الإنتاج
  g.fillStyle = '#52525B'; for (let x = (t * 60) % 40 - 40; x < w; x += 40) g.fillRect(x, h * .8, 20, h * .02);
  g.font = '800 15px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
  if (r.nets) {   // أربع شبكات مرقّمة على السير
    const u = Math.min(28, w / 22), slot = w / 4;
    r.nets.forEach((cells, k) => { const mx = Math.max(...cells.map(c => c[0])) + 1, my = Math.max(...cells.map(c => c[1])) + 1, x0 = slot * (3 - k) + (slot - mx * u) / 2, y0 = h * .14 + (h * .5 - my * u) / 2;
      g.fillStyle = '#E7D5B8'; g.fillRect(slot * (3 - k) + 8, h * .08, slot - 16, h * .62); drawNet(g, cells, x0, y0, u, S.done && k === r.ans ? Math.min(1, (S.fold = (S.fold || 0) + .02)) : 0);
      g.fillStyle = '#1E2433'; g.fillText(['أ', 'ب', 'ج', 'د'][k], slot * (3 - k) + slot / 2, h * .76); });
    if (!S.done) S.fold = 0;
    return;
  }
  // مجسم مرسوم بإسقاط مائل مع شبكته (أو بلا شبكة قبل الحل)
  const cx = w * .28, cy = h * .52, s = Math.min(w, h) * .2;
  if (r.solid === 'pyramid') { g.fillStyle = '#93C5FD'; g.beginPath(); g.moveTo(cx - s, cy + s * .4); g.lineTo(cx + s * .6, cy + s * .4); g.lineTo(cx, cy - s); g.fill(); g.fillStyle = '#60A5FA'; g.beginPath(); g.moveTo(cx + s * .6, cy + s * .4); g.lineTo(cx + s, cy); g.lineTo(cx, cy - s); g.fill(); g.strokeStyle = '#1E3A8A'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(cx - s, cy + s * .4); g.lineTo(cx - s * .4, cy); g.lineTo(cx + s, cy); g.moveTo(cx - s * .4, cy); g.lineTo(cx, cy - s); g.stroke(); g.setLineDash([]); }
  else if (r.solid === 'prism') { g.fillStyle = '#FCD34D'; g.beginPath(); g.moveTo(cx - s, cy + s * .5); g.lineTo(cx - s * .6, cy - s * .4); g.lineTo(cx - s * .2, cy + s * .5); g.fill(); g.fillStyle = '#FBBF24'; g.beginPath(); g.moveTo(cx - s * .6, cy - s * .4); g.lineTo(cx + s * .8, cy - s * .7); g.lineTo(cx + s * 1.2, cy + s * .2); g.lineTo(cx - s * .2, cy + s * .5); g.fill(); g.strokeStyle = '#92400E'; g.lineWidth = 2; g.stroke(); }
  else if (r.solid === 'tetra') { g.fillStyle = '#86EFAC'; g.beginPath(); g.moveTo(cx - s, cy + s * .5); g.lineTo(cx + s, cy + s * .5); g.lineTo(cx, cy - s); g.fill(); g.fillStyle = '#4ADE80'; g.beginPath(); g.moveTo(cx + s, cy + s * .5); g.lineTo(cx + s * .2, cy + s * .15); g.lineTo(cx, cy - s); g.fill(); g.strokeStyle = '#14532D'; g.lineWidth = 2; g.stroke(); }
  else if (r.dims) { const [L, Wd, Hh] = r.dims, k = s / Math.max(L, Wd, Hh) * 1.3, a = L * k, b = Hh * k, d = Wd * k * .5;
    g.fillStyle = '#C4B5FD'; g.fillRect(cx - a / 2, cy - b / 2, a, b); g.fillStyle = '#A78BFA'; g.beginPath(); g.moveTo(cx - a / 2, cy - b / 2); g.lineTo(cx - a / 2 + d, cy - b / 2 - d); g.lineTo(cx + a / 2 + d, cy - b / 2 - d); g.lineTo(cx + a / 2, cy - b / 2); g.fill();
    g.fillStyle = '#8B5CF6'; g.beginPath(); g.moveTo(cx + a / 2, cy - b / 2); g.lineTo(cx + a / 2 + d, cy - b / 2 - d); g.lineTo(cx + a / 2 + d, cy + b / 2 - d); g.lineTo(cx + a / 2, cy + b / 2); g.fill();
    g.fillStyle = '#1E2433'; g.font = '800 14px Cairo'; g.fillText(`${N(L)} سم`, cx, cy + b / 2 + 18); g.fillText(`${N(Hh)} سم`, cx - a / 2 - 26, cy); g.fillText(`${N(Wd)} سم`, cx + a / 2 + d + 22, cy - b / 2 - d / 2); }
  g.fillStyle = '#7C2D12'; g.font = '800 15px Cairo'; g.fillText(r.cap || '', cx, h * .1);
  if (S.done && r.after) { g.fillStyle = '#16A34A'; g.beginPath(); g.roundRect(w * .55, h * .3, w * .4, 60, 14); g.fill(); g.fillStyle = '#FFF'; g.font = '900 17px Cairo'; g.fillText(r.after, w * .75, h * .3 + 37); }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
function make(i) {
  if (i === 0) { const good = CUBE_OK[R(0, 3)], nets = shuffle([good, ...shuffle(CUBE_NO).slice(0, 3)]), ans = nets.indexOf(good);
    return { q: 'أي شبكة على السير تنطوي فتكوّن <b>مكعباً</b>؟', input: { type: 'pick', opts: ['أ', 'ب', 'ج', 'د'] }, ok: k => k === ans,
      hint: 'تخيّل أنك ترفع الأوجه حول وجه القاعدة: هل يلتقي وجهان فوق بعضهما؟ وهل يبقى وجه بلا مكان؟', data: { nets, ans } }; }
  if (i === 1) return { q: 'كم وجهاً مثلثاً في شبكة <b>الهرم الرباعي المنتظم</b>؟', input: { type: 'num' }, ok: v => v === 4, hint: 'القاعدة مربعة: كم ضلعاً لها؟ عند كل ضلع يرتفع وجه واحد إلى الرأس.', bad: v => v === 5 ? 'هذا عدد الأوجه كلها، والقاعدة ليست مثلثاً.' : '', data: { solid: 'pyramid', cap: 'هرم رباعي منتظم', after: '٤ مثلثات + مربع واحد' } };
  if (i === 2) { const ask = R(0, 1); return { q: ask ? 'كم <b>مستطيلاً</b> في شبكة <b>المنشور الثلاثي</b>؟' : 'كم <b>مثلثاً</b> في شبكة <b>المنشور الثلاثي</b>؟', input: { type: 'num' }, ok: v => v === (ask ? 3 : 2),
    hint: ask ? 'كم ضلعاً للمثلث في طرف المنشور؟ يقابل كل ضلع وجه جانبي مستطيل.' : 'المنشور له طرفان متطابقان: ما شكل كل طرف؟', data: { solid: 'prism', cap: 'منشور ثلاثي', after: '٢ مثلثان + ٣ مستطيلات' } }; }
  if (i === 3) return { q: 'شبكة <b>رباعي الأسطح المنتظم</b> كم وجهاً فيها، وكلها من أي شكل؟', input: { type: 'pick', opts: ['٤ مثلثات متطابقة الأضلاع', '٣ مثلثات ومربع', '٤ مثلثات ومربع', '٦ مربعات'] }, ok: k => k === 0,
    hint: '«رباعي» يعني أربعة، و«منتظم» يعني أن الأوجه متطابقة. هل فيه وجه مربع؟', bad: k => k === 2 ? 'هذا الهرم الرباعي، له قاعدة مربعة.' : '', data: { solid: 'tetra', cap: 'رباعي الأسطح المنتظم', after: '٤ مثلثات متطابقة الأضلاع' } };
  const L = R(5, 9), Wd = R(2, 4), Hh = R(3, 6); if (L === Hh || Wd === Hh) return make(4);
  const opts = shuffle([[`${N(L)} سم × ${N(Wd)} سم`, 1], [`${N(L)} سم × ${N(L)} سم`, 0], [`${N(Wd)} سم × ${N(Wd)} سم`, 0], [`${N(Hh)} سم × ${N(Hh)} سم`, 0]]);
  return { q: `صندوق متوازي المستطيلات أبعاده ${N(L)} سم و${N(Wd)} سم و${N(Hh)} سم. ما مقاسا <b>وجه القاعدة</b> في شبكته؟`, input: { type: 'pick', opts: opts.map(o => o[0]) }, ok: k => opts[k][1] === 1,
    hint: 'القاعدة يلامسها الطول والعرض، لا الارتفاع. أي بعدين على الأرض؟', data: { dims: [L, Wd, Hh], cap: 'صندوق متوازي المستطيلات', after: `القاعدة ${N(L)} × ${N(Wd)}` } };
}

function challenge() {
  const items = [];
  items.push(num('كم وجهاً في شبكة المكعب؟', 6, 'كم وجهاً للمكعب نفسه؟', '8Gs3'));
  items.push(num('كم وجهاً في شبكة الهرم الرباعي المنتظم؟', 5, 'قاعدة مربعة، ومثلث عند كل ضلع منها.', '8Gs3'));
  items.push(choice('شبكة المنشور الثلاثي تتكوّن من:', 'مثلثين وثلاثة مستطيلات', ['ثلاثة مثلثات ومستطيلين', 'أربعة مثلثات', 'مثلث وأربعة مستطيلات'], 'المنشور له طرفان متطابقان، ووجه جانبي عند كل ضلع من الطرف.', '8Gs3'));
  items.push(choice('أي مجسم شبكته أربعة مثلثات متطابقة الأضلاع؟', 'رباعي الأسطح المنتظم', ['الهرم الرباعي', 'المنشور الثلاثي', 'المكعب'], 'كم وجهاً فيه، وهل له قاعدة مربعة؟', '8Gs3'));
  items.push(tf('ستة مربعات في صف واحد تكوّن شبكة مكعب.', false, 'جرّب الطي: هل يلتقي الوجهان الأول والأخير؟ وأين الغطاء والقاع؟', '8Gs3', 'الأوجه الستة في صف واحد تلتف حول نفسها دون غطاء ولا قاع.'));
  { const [L, W2, H2] = [R(5, 9), R(2, 4), R(3, 6)]; items.push(num(`صندوق أبعاده ${N(L)} و${N(W2)} و${N(H2)} سم. كم وجهاً في شبكته مقاسه ${N(L)} × ${N(H2)}؟`, 2, 'الأوجه المتقابلة متطابقة: كم وجهاً يقابل الوجه الأمامي؟', '8Gs3')); }
  items.push(multi('اختر المجسمات التي في شبكتها مثلثات:', ['الهرم الرباعي', 'المنشور الثلاثي', 'رباعي الأسطح', 'متوازي المستطيلات', 'المكعب'], o => ['الهرم الرباعي', 'المنشور الثلاثي', 'رباعي الأسطح'].includes(o), 'تخيّل كل مجسم: هل له وجه مثلث؟', '8Gs3'));
  items.push(num('كم مستطيلاً في شبكة متوازي المستطيلات؟', 6, 'كم وجهاً لمتوازي المستطيلات؟ وما شكل كل وجه؟', '8Gs3'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'خط الطيّ', icon: '📦', who, rounds: 5, make, draw,
  intro: ['هنا تُقصّ ألواح الكرتون شبكاتٍ، ثم تطويها الآلة صناديق.', 'إن كانت الشبكة خاطئة لا ينغلق الصندوق! ساعدني في فحص الشبكات قبل الطي.'],
  outro: ['خط الطيّ يعمل بلا أخطاء! أصبحتَ تتخيّل المجسم من شبكته.', 'لنختبر عينك بأسئلة المصنع.'],
  challenge: { title: 'تحدي الشبكات', make: challenge }
});
export { make, challenge };
