// ٢-٣ التقريب — «ملصقات الشحنات»: ميزان المستودع يقرأ الوزن بدقة كبيرة، وطابعة الملصقات تحتاج الوزن مقرّباً حسب طلب الربّان:
// لمنازل عشرية أو لأرقام معنوية (مع الأصفار التي تحفظ قيمة العدد). بعد الحل يُطبع الملصق ويُلصق على الصندوق.
// التحدي: ٨ أسئلة جديدة من مخرج 8Np2 (الكتاب ص٣٨–٤٢).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';

const who = { name: 'أمين المستودع خلفان', face: '🧔🏽', id: 'khalfan' };
const DP = ['', 'منزلة عشرية واحدة', 'منزلتين عشريتين', 'ثلاث منازل عشرية', 'أربع منازل عشرية', 'خمس منازل عشرية'];
const SF = ['', 'رقم معنوي واحد', 'رقمين معنويين', 'ثلاثة أرقام معنوية', 'أربعة أرقام معنوية'];
const rDP = (v, d) => Math.round(v * Math.pow(10, d) + 1e-9) / Math.pow(10, d);
const rSF = (v, s) => { const e = Math.floor(Math.log10(Math.abs(v))) - s + 1; return Math.round(v / Math.pow(10, e) + 1e-9) * Math.pow(10, e); };
const fmt = (v, d) => N(+v.toFixed(Math.max(0, d)));

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {};
  g.fillStyle = '#EEF2F6'; g.fillRect(0, 0, w, h); g.fillStyle = '#D9DEE5'; for (let x = 0; x < w; x += 60) g.fillRect(x, 0, 2, h * .6);
  g.fillStyle = '#B9A07A'; g.fillRect(0, h * .6, w, h * .4);
  // رفوف خلفية بصناديق
  for (let i = 0; i < 6; i++) { g.fillStyle = ['#C9894A', '#B87A3E', '#D49A5A'][i % 3]; g.fillRect(20 + i * 70, h * .12 + (i % 2) * 40, 60, 50); }
  // الميزان والصندوق
  const sx = w * .32, sy = h * .7; g.fillStyle = '#6B7280'; g.fillRect(sx - 90, sy, 180, 22); g.fillStyle = '#C9894A'; g.fillRect(sx - 70, sy - 90, 140, 90); g.strokeStyle = '#8B5A33'; g.lineWidth = 3; g.strokeRect(sx - 70, sy - 90, 140, 90);
  g.beginPath(); g.moveTo(sx - 70, sy - 45); g.lineTo(sx + 70, sy - 45); g.stroke();
  g.fillStyle = '#111827'; g.beginPath(); g.roundRect(sx - 95, sy + 28, 190, 40, 8); g.fill(); g.fillStyle = '#4ADE80'; g.font = '900 22px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
  if (r.raw != null) g.fillText(`${r.rawTxt} ${r.unit || 'كغ'}`, sx, sy + 56);
  // الطابعة والملصق: يُطبع بعد الحل فقط
  const px = w * .74, py = h * .4; g.fillStyle = '#374151'; g.beginPath(); g.roundRect(px - 80, py - 40, 160, 80, 12); g.fill(); g.fillStyle = '#111'; g.fillRect(px - 60, py + 30, 120, 6);
  g.fillStyle = '#93C5FD'; g.fillRect(px - 50, py - 28, 100, 22); g.fillStyle = '#1E3A8A'; g.font = '800 12px Cairo'; g.fillText(r.need || '', px, py - 12);
  if (S.done && r.label) { S.lab = Math.min(1, (S.lab || 0) + .04); const ly = py + 36 + S.lab * 40; g.fillStyle = '#FFFDF6'; g.fillRect(px - 56, py + 36, 112, S.lab * 44); g.fillStyle = '#B91C1C'; g.font = '900 18px Cairo'; if (S.lab > .6) g.fillText(r.label, px, ly - 6); }
  else S.lab = 0;
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i === 0 || i === 1) { const d = i + 1; for (let k = 0; k < 60; k++) { const v = R(1000, 99999) / 10000, a = rDP(v, d); if (eq(rDP(v, d + 2), a)) continue;
    return { q: `وزن الصندوق <b>${N(v)}</b> كغ. قرّبه إلى <b>${DP[d]}</b> للملصق.`, input: { type: 'num', dot: true }, ok: x => eq(x, a),
      hint: `انظر إلى الرقم في المنزلة ${d === 1 ? 'العشرية الأولى' : 'العشرية الثانية'}، ثم إلى الرقم الذي على يمينه مباشرة: هل هو ٥ أو أكبر؟`,
      bad: x => eq(x, Math.trunc(v * Math.pow(10, d)) / Math.pow(10, d)) && !eq(x, a) ? 'حذفتَ الأرقام دون أن تنظر إلى الرقم التالي: هل كان ٥ أو أكبر؟' : '', data: { raw: v, rawTxt: N(v), need: DP[d], label: `${fmt(a, d)} كغ` } }; } }
  if (i === 2) { for (let k = 0; k < 60; k++) { const v = R(1100, 9800); const a = rSF(v, 1); if (a === v) continue;
    return { q: `حمولة السفينة <b>${N(v)}</b> كغ. قرّبها إلى <b>رقم معنوي واحد</b>.`, input: { type: 'num' }, ok: x => x === a,
      hint: 'الرقم المعنوي الأول هو أول رقم من اليسار. انظر إلى الرقم الذي بعده، ولا تنسَ أن الأصفار تحفظ قيمة العدد.', bad: x => x < 10 ? 'العدد المقرّب يجب أن يبقى قريباً من الأصلي: أعد الأصفار مكان الأرقام المحذوفة.' : '', data: { raw: v, rawTxt: N(v), need: SF[1], label: `${N(a)} كغ` } }; } }
  if (i === 3) { for (let k = 0; k < 60; k++) { const v = R(1000, 9999) / 100000, a = rSF(v, 3); if (eq(a, v)) continue; const d = 6;
    return { q: `كتلة عيّنة الرمل <b>${N(v)}</b> كغ. قرّبها إلى <b>ثلاثة أرقام معنوية</b>.`, input: { type: 'num', dot: true }, ok: x => eq(x, a),
      hint: 'الأصفار في بداية الكسر العشري ليست أرقاماً معنوية: ابدأ العدّ من أول رقم غير صفري.', bad: x => eq(x, rDP(v, 3)) ? 'هذا تقريب لثلاث منازل عشرية، لا لثلاثة أرقام معنوية.' : '', data: { raw: v, rawTxt: N(v), need: SF[3], label: `${N(+a.toPrecision(3))} كغ` } }; } }
  for (let k = 0; k < 60; k++) { const v = R(10001, 99999) / 1000, a = rSF(v, 2), wrong = [rDP(v, 2), Math.trunc(v), rSF(v, 3)].map(x => N(x));
    const opts = [N(a), ...wrong].filter((o, j, arr) => arr.indexOf(o) === j); if (opts.length < 4) continue; const sh = opts.map((o, j) => [Math.random(), o, j]).sort((x, y) => x[0] - y[0]);
    return { q: `أي ملصق يقرّب <b>${N(v)}</b> إلى <b>رقمين معنويين</b>؟`, input: { type: 'pick', opts: sh.map(x => x[1]) }, ok: j => sh[j][2] === 0,
      hint: 'عُدّ رقمين من أول رقم غير صفري، ثم انظر إلى الرقم الثالث.', bad: j => sh[j][2] === 1 ? 'هذا تقريب لمنزلتين عشريتين.' : sh[j][2] === 3 ? 'هذا ثلاثة أرقام معنوية.' : '', data: { raw: v, rawTxt: N(v), need: SF[2], label: N(a) } }; }
  return make(0);
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const v = fresh(() => R(10001, 99999) / 10000); items.push(num(`قرّب ${N(v)} إلى منزلة عشرية واحدة.`, rDP(v, 1), 'انظر إلى الرقم في المنزلة العشرية الثانية: هل هو ٥ أو أكبر؟', '8Np2', { dot: true })); }
  { const v = fresh(() => R(100001, 999999) / 100000); items.push(num(`قرّب ${N(v)} إلى ثلاث منازل عشرية.`, rDP(v, 3), 'الرقم في المنزلة الرابعة يقرر: أبقِ أو زِد واحداً.', '8Np2', { dot: true })); }
  { const v = fresh(() => R(1100, 9800)); items.push(num(`قرّب ${N(v)} إلى رقم معنوي واحد.`, rSF(v, 1), 'أبقِ الرقم الأول (مع التقريب) واملأ الباقي أصفاراً.', '8Np2')); }
  { const v = fresh(() => R(11000, 98000)); items.push(num(`قرّب ${N(v)} إلى رقمين معنويين.`, rSF(v, 2), 'رقمان من اليسار، ثم أصفار حتى يبقى العدد بالحجم نفسه.', '8Np2')); }
  { const v = fresh(() => R(1001, 9999) / 100000); items.push(num(`قرّب ${N(v)} إلى رقمين معنويين.`, +rSF(v, 2).toPrecision(2), 'الأصفار الأولى بعد الفاصلة ليست معنوية.', '8Np2', { dot: true })); }
  { const v = fresh(() => R(1001, 9999) / 1000); const a = rDP(v, 2), opts = [N(a), N(rDP(v, 1)), N(Math.trunc(v * 100) / 100 === a ? a + .01 : Math.trunc(v * 100) / 100), N(rSF(v, 2) * 10)].filter((o, j, arr) => arr.indexOf(o) === j);
    while (opts.length < 3) opts.push(N(a + opts.length * .01)); items.push(choice(`${N(v)} مقرّباً إلى منزلتين عشريتين هو:`, opts[0], opts.slice(1, 4), 'انظر إلى المنزلة الثالثة.', '8Np2')); }
  items.push(tf(`العدد ${N(.0036)} فيه رقمان معنويان.`, true, 'لا تُعدّ الأصفار التي قبل أول رقم غير صفري.', '8Np2', 'الأصفار الأولى تحدد موضع الرقم فقط، فالمعنويان هما ٣ و٦.'));
  { const v = fresh(() => R(4501, 4999)); items.push(tf(`${N(v)} مقرّباً إلى رقم معنوي واحد هو ${N(4000)}`, false, 'انظر إلى الرقم الثاني: هل هو ٥ أو أكبر؟', '8Np2', `الرقم الثاني ٥ أو أكبر، فالتقريب ${N(5000)}.`)); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'ملصقات الشحنات', icon: '🏷️', who, rounds: 5, make, draw,
  intro: ['ميزان المستودع دقيق جداً، يقرأ الوزن بأرقام كثيرة.', 'لكن ملصقات الشحن صغيرة: علينا تقريب كل وزن كما يطلب الربّان، بمنازل عشرية أو بأرقام معنوية.'],
  outro: ['ملصقاتك دقيقة! والآن تعرف الفرق بين المنازل العشرية والأرقام المعنوية.', 'هيا إلى أسئلة المستودع.'],
  challenge: { title: 'تحدي التقريب', make: challenge }
});
export { make, challenge };
