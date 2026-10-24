// ٢-١ ضرب الكسور العشرية وقسمتها ذهنياً — «ميزان السمك»: بسطة سمك بميزان رقمي ولوحة أسعار. الطالب يحسب ذهنياً:
// يتجاهل الفاصلة ثم يعيدها بعدد المنازل، ويقسم على كسر عشري بضرب البسط والمقام في ١٠ أو ١٠٠، ويتوقّع هل الناتج أكبر أم أصغر.
// التحدي: ٨ أسئلة جديدة من مخرجات 8Nc1 و8Ne5 و8Nc6 (الكتاب ص٣١–٣٥).
import { mission } from '../../mission.js';
import { N, R, R1, eq, fr } from '../../math.js';
import { choice, num, tf, match } from '../../../missions/challenge.js';

const who = { name: 'البائع حمود', face: '🧑🏽‍🍳', id: 'hamood' };
const FISH = ['🐟 كنعد', '🐠 هامور', '🐡 شعري', '🦈 جيذر', '🦐 روبيان'];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {};
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#BFE6FF'); sky.addColorStop(1, '#E8F6FF'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  // البحر والمرفأ خلف البسطة
  g.fillStyle = '#3B9AD9'; g.fillRect(0, h * .32, w, h * .14); g.fillStyle = 'rgba(255,255,255,.5)'; for (let x = (t * 30) % 40 - 40; x < w; x += 40) g.fillRect(x, h * .38, 18, 2);
  g.fillStyle = '#F2D7A6'; g.fillRect(0, h * .46, w, h * .54);
  // مظلة البسطة المخططة
  const ax = w * .08, aw = w * .84; for (let k = 0; k < 10; k++) { g.fillStyle = k % 2 ? '#FFFFFF' : '#0E7490'; g.fillRect(ax + k * aw / 10, h * .06, aw / 10 + 1, h * .1); }
  g.fillStyle = '#0B5F75'; g.fillRect(ax, h * .16, aw, 6);
  // الطاولة والثلج والأسماك
  g.fillStyle = '#E6F4FA'; g.beginPath(); g.roundRect(w * .08, h * .55, w * .5, h * .3, 14); g.fill();
  for (let i = 0; i < 6; i++) { const x = w * .12 + i * w * .07, y = h * .66 + (i % 2) * 18; g.fillStyle = ['#7FA6C9', '#C98F6B', '#9FB7C9'][i % 3]; g.beginPath(); g.ellipse(x, y, 26, 10, -.2, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + 24, y); g.lineTo(x + 36, y - 9); g.lineTo(x + 36, y + 9); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x - 16, y - 2, 2, 0, 7); g.fill(); }
  // الميزان الرقمي: كفة وشاشة
  const sx = w * .74, sy = h * .62; g.fillStyle = '#9CA3AF'; g.beginPath(); g.ellipse(sx, sy - 10, 70, 14, 0, 0, 7); g.fill(); g.fillStyle = '#4B5563'; g.fillRect(sx - 60, sy, 120, 70);
  g.fillStyle = '#052E16'; g.beginPath(); g.roundRect(sx - 52, sy + 10, 104, 46, 8); g.fill();
  g.fillStyle = '#4ADE80'; g.font = '900 22px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
  g.fillText(r.kg != null ? `${N(r.kg)} كغ` : '—', sx, sy + 42);
  if (r.fish) { g.font = '28px Cairo'; g.fillText(r.fish.split(' ')[0], sx, sy - 22); }
  // لوحة السعر
  if (r.price != null) { g.fillStyle = '#FFFDF6'; g.beginPath(); g.roundRect(w * .62, h * .2, w * .3, 54, 12); g.fill(); g.strokeStyle = '#0E7490'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#0E7490'; g.font = '800 15px Cairo'; g.fillText(r.fish || '', w * .77, h * .2 + 22); g.fillStyle = '#1E2433'; g.font = '900 18px Cairo'; g.fillText(`${N(r.price)} ريال للكيلوغرام`, w * .77, h * .2 + 44); }
  if (S.done && r.show) { g.fillStyle = '#16A34A'; g.beginPath(); g.roundRect(w * .1, h * .2, w * .44, 48, 12); g.fill(); g.fillStyle = '#FFF'; g.font = '900 20px Cairo'; g.fillText(r.show, w * .32, h * .2 + 32); }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

const fish = () => FISH[R(0, FISH.length - 1)];
function make(i) {
  if (i === 0) { for (let k = 0; k < 40; k++) { const p = R(4, 15), d = R(2, 9) / 10, a = Math.round(p * d * 10) / 10; if (a % 1 === 0) continue; const f = fish();
    return { q: `اشترت سلمى <b>${N(d)}</b> كغ من ${f.split(' ')[1]} سعره <b>${N(p)}</b> ريال للكيلوغرام. كم ريالاً تدفع؟`, input: { type: 'num', dot: true }, ok: v => eq(v, a),
      hint: `تجاهل الفاصلة أولاً: كم يساوي ${N(p)} × ${N(d * 10)}؟ ثم كم رقماً بعد الفاصلة في العدد ${N(d)}؟`, bad: v => eq(v, p * d * 10) ? 'نسيت إعادة الفاصلة العشرية.' : '', data: { kg: d, price: p, fish: f, show: `${N(p)} × ${N(d)} = ${N(a)}` } }; } }
  if (i === 1) { for (let k = 0; k < 40; k++) { const a = R(2, 9) / 10, b = R(11, 25) / 100, c = Math.round(a * b * 1000) / 1000; if (b * 100 % 10 === 0) continue;
    return { q: `قطعة سمك وزنها <b>${N(b)}</b> كغ، وثمن الكيلوغرام في العرض <b>${N(a)}</b> ريال. كم ريالاً ثمنها؟`, input: { type: 'num', dot: true }, ok: v => eq(v, c),
      hint: `${N(a * 10)} × ${N(b * 100)} = ؟ بلا فاصلة. ثم عُدّ المنازل العشرية في العددين معاً: كم منزلة يجب أن تكون في الناتج؟`, bad: v => eq(v * 10, c) || eq(v / 10, c) ? 'الأرقام صحيحة، لكن موضع الفاصلة لا: عُدّ المنازل العشرية في العاملين.' : '', data: { kg: b, price: a, fish: fish(), show: `${N(a)} × ${N(b)} = ${N(c)}` } }; } }
  if (i === 2) { for (let k = 0; k < 40; k++) { const q = R(12, 48), d = R(2, 8) / 10, total = Math.round(q * d * 10) / 10;
    return { q: `عند البائع <b>${N(total)}</b> كغ من الروبيان، يعبّئها في أكياس وزن كل كيس <b>${N(d)}</b> كغ. كم كيساً يملأ؟`, input: { type: 'num' }, ok: v => v === q,
      hint: `اكتب القسمة كسراً: ${fr(N(total), N(d))}. اضرب البسط والمقام في ١٠ لتحذف الفاصلة: ماذا تصير؟`, bad: v => eq(v, total / d / 100) || eq(v, total / d / 10) ? 'القسمة على عدد بين ٠ و١ تعطي عدداً أكبر من المقسوم.' : '', data: { kg: d, fish: '🦐 روبيان', show: `${N(total)} ÷ ${N(d)} = ${N(q)}` } }; } }
  if (i === 3) { const a = R(20, 90), d = R(2, 9) / 10, mul = Math.random() < .5, opts = ['أكبر من ' + N(a), 'أصغر من ' + N(a), 'يساوي ' + N(a)], ans = mul ? 1 : 0;
    return { q: `دون أن تحسب: هل ناتج <b>${N(a)} ${mul ? '×' : '÷'} ${N(d)}</b> أكبر من ${N(a)} أم أصغر منه؟`, input: { type: 'pick', opts }, ok: k => k === ans,
      hint: mul ? 'إذا أخذت جزءاً فقط من الشيء (أقل من واحد كامل)، هل يزيد أم ينقص؟' : 'كم مرة يتسع العدد لجزء أصغر من الواحد: أقل أم أكثر من عدد الآحاد؟', data: { kg: d, show: mul ? 'الضرب في عدد بين ٠ و١ يصغّر' : 'القسمة على عدد بين ٠ و١ تكبّر' } }; }
  for (let k = 0; k < 60; k++) { const a = R(2, 9) / 10, b = R(12, 48), c = R(2, 9) / 10, e = R(2, 9) / 10, top = a * b, bot = c * e, v = Math.round(top / bot * 1000) / 1000; if (v % 1 || v > 200 || top % 1 === 0 && false) continue;
    return { q: `أوجد ذهنياً: ${fr(`${N(a)} × ${N(b)}`, `${N(c)} × ${N(e)}`)}`, input: { type: 'num', dot: true }, ok: x => eq(x, v),
      hint: 'احسب البسط وحده ثم المقام وحده، ثم اضرب الاثنين في ١٠ أو ١٠٠ لتحذف الفاصلة من المقام.', data: { show: `= ${N(v)}` } }; }
  return make(0);
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [a, b] = fresh(() => [R(3, 15), R(2, 9)]); items.push(num(`احسب ذهنياً: ${N(a)} × ${N(b / 10)}`, Math.round(a * b) / 10, 'اضرب بلا فاصلة، ثم أعد منزلة عشرية واحدة.', '8Ne5', { dot: true })); }
  { const [a, b] = fresh(() => [R(2, 9), R(2, 9)]); items.push(num(`احسب ذهنياً: ${N(a / 10)} × ${N(b / 100)}`, Math.round(a * b) / 1000, 'كم منزلة عشرية في العاملين معاً؟ هذا عدد المنازل في الناتج.', '8Ne5', { dot: true })); }
  { const [q, d] = fresh(() => [R(11, 60), R(2, 9)]); items.push(num(`احسب ذهنياً: ${N(q * d / 10)} ÷ ${N(d / 10)}`, q, 'اضرب المقسوم والمقسوم عليه في ١٠ ليصير المقسوم عليه عدداً كاملاً.', '8Ne5')); }
  { const [q, d] = fresh(() => [R(2, 9), R(2, 9)]); items.push(num(`احسب ذهنياً: ${N(q * d / 100)} ÷ ${N(d / 100)}`, q, 'كم مرة يجب أن تضرب في ١٠ ليصير المقسوم عليه عدداً كاملاً؟', '8Ne5')); }
  { const a = fresh(() => R(25, 95)); items.push(tf(`${N(a)} × ${N(.7)} أكبر من ${N(a)}`, false, 'الضرب في عدد أقل من ١: هل يزيد أم ينقص؟', '8Nc6', `الضرب في عدد بين ٠ و١ يعطي ناتجاً أصغر من العدد الأول.`)); }
  { const a = fresh(() => R(25, 95)); items.push(choice(`أي العمليات ناتجها أكبر من ${N(a)}؟`, `${N(a)} ÷ ${N(.5)}`, [`${N(a)} × ${N(.5)}`, `${N(a)} × ${N(.9)}`, `${N(a)} ÷ ${N(5)}`], 'القسمة على عدد بين ٠ و١ تكبّر الناتج.', '8Nc6')); }
  { const pairs = fresh(() => { const x = [R(2, 9), R(2, 9), R(2, 9)]; return x; }); const [a, b, c] = pairs;
    items.push(match('صِل كل عملية بناتجها:', [[`${N(a / 10)} × ${N(10 * b)}`, N(a * b)], [`${N(b)} × ${N(c / 100)}`, N(b * c / 100)], [`${N(a)} × ${N(.5)}`, N(a / 2)], [`${N(c)} ÷ ${N(.1)}`, N(c * 10)]].filter((p, i, arr) => arr.findIndex(q => q[1] === p[1]) === i), 'احسب كل عملية ذهنياً بتجاهل الفاصلة ثم إعادتها.', '8Nc1')); }
  { const [p, kg] = fresh(() => [R(6, 14), R(2, 9)]); const tot = Math.round(p * kg) / 10; items.push(num(`سعر كيلوغرام الكنعد ${N(p)} ريال. كم ثمن ${N(kg / 10)} كغ منه؟`, tot, 'السعر × الوزن، والوزن أقل من كيلوغرام: الناتج أقل من السعر.', '8Nc1', { dot: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'ميزان السمك', icon: '⚖️', who, rounds: 5, make, draw,
  intro: ['أهلاً بك في سوق السمك! الزبائن يشترون بالكيلوغرام وأجزائه، والحاسبة تعطّلت اليوم.', 'سأعلّمك سراً: تجاهل الفاصلة واحسب، ثم أعدها في مكانها.'],
  outro: ['حسابك أسرع من الحاسبة! وعرفت أن الضرب في عدد أقل من واحد يصغّر، والقسمة عليه تكبّر.', 'لنختبر سرعتك بأسئلة السوق.'],
  challenge: { title: 'تحدي الحساب الذهني', make: challenge }
});
export { make, challenge };
