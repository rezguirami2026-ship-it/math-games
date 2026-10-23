// ٢-٢ الضرب في قوى العدد ١٠ والقسمة عليها — «رافعة الحاويات»: جدول القيمة المكانية رصيفٌ بخانات، والأرقام حاويات ملوّنة.
// الفاصلة العشرية ثابتة (عمود الرصيف)، والرافعة تنقل الحاويات يساراً عند الضرب في ١٠ ويميناً عند القسمة، فيرى الطالب أن
// الضرب في ١٠ أس سالب هو القسمة على ١٠ أس موجب. التحدي: ٨ أسئلة جديدة من مخرج 8Np1 (الكتاب ص٣٥–٣٨).
import { mission } from '../../mission.js';
import { N, R, eq, pw, fr, drawMath } from '../../math.js';
import { choice, num, tf, multi } from '../../../missions/challenge.js';

const who = { name: 'مشغّلة الرافعة نوال', face: '👷🏽‍♀️', id: 'nawal' };
const COLS = ['#E11D48', '#2563EB', '#F59E0B', '#16A34A', '#7C3AED', '#0EA5E9'];
const PLACES = ['آلاف', 'مئات', 'عشرات', 'آحاد', 'أجزاء من العشرة', 'أجزاء من المئة', 'أجزاء من الألف', 'أجزاء من عشرة آلاف'];
// تفكيك العدد إلى أرقام في الخانات: المفتاح أس العشرة (٣ للآلاف … −٤)
const digits = v => { const s = (Math.round(v * 1e6) / 1e6).toFixed(6), [a, b] = s.split('.'), out = {}; [...a].reverse().forEach((d, i) => { out[i] = +d; }); [...b].forEach((d, i) => { out[-(i + 1)] = +d; }); return out; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : { v: 25 }, k = S.r && S.r.input.type === 'dial' ? S.v : (S.done && r.k != null ? r.k : 0), val = r.v * Math.pow(10, k);
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#BEE3F8'); sky.addColorStop(1, '#EAF6FF'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = '#2B7BB9'; g.fillRect(0, h * .78, w, h * .22);
  // الرصيف بالخانات (من اليمين: الكبرى… لأن الجدول عربي)، والعمود الأصفر للفاصلة
  const n = PLACES.length, cw = Math.min(88, (w - 40) / n), x0 = (w - cw * n) / 2, y0 = h * .44, ch = h * .3;
  g.fillStyle = '#9CA3AF'; g.fillRect(x0 - 8, y0 + ch, cw * n + 16, 14);
  const colX = e => x0 + (3 - e) * cw;   // e = ٣ (آلاف) في أقصى اليسار… −٤ في أقصى اليمين
  g.font = '700 11px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
  for (let e = 3; e >= -4; e--) { const x = colX(e); g.fillStyle = e >= 0 ? '#E5E7EB' : '#FEF3C7'; g.fillRect(x + 2, y0, cw - 4, ch); g.fillStyle = '#334155'; g.fillText(PLACES[3 - e], x + cw / 2, y0 - 8); }
  g.fillStyle = '#FACC15'; g.fillRect(colX(0) + cw - 4, y0 - 4, 8, ch + 18); g.fillStyle = '#1E2433'; g.beginPath(); g.arc(colX(0) + cw, y0 + ch - 10, 6, 0, 7); g.fill();
  // الحاويات تنزلق بنعومة نحو خاناتها
  const D = digits(val); S.shift = S.shift == null ? k : S.shift + (k - S.shift) * .15;
  const base = digits(r.v);
  Object.keys(base).forEach(key => { const e0 = +key, d = base[e0]; const ee = e0 + S.shift; if (ee > 3.4 || ee < -4.4) return; const x = colX(ee);
    if (d === 0 && (e0 > 0 && !Object.keys(base).some(q => +q > e0 && base[q]) || e0 < 0 && !Object.keys(base).some(q => +q < e0 && base[q]))) return;
    g.fillStyle = COLS[(e0 + 10) % COLS.length]; g.beginPath(); g.roundRect(x + 8, y0 + ch - 54, cw - 16, 48, 6); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke();
    for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(x + 8 + j * (cw - 16) / 4, y0 + ch - 50); g.lineTo(x + 8 + j * (cw - 16) / 4, y0 + ch - 10); g.stroke(); }
    g.fillStyle = '#FFF'; g.font = '900 24px Cairo'; g.fillText(N(d), x + cw / 2, y0 + ch - 22); });
  // الرافعة فوق الرصيف
  const cx = colX(0) + cw / 2 + Math.sin(t * .8) * 6; g.fillStyle = '#F59E0B'; g.fillRect(x0 - 20, h * .1, cw * n + 40, 12); g.fillRect(x0 - 20, h * .1, 12, y0 - h * .1);
  g.fillStyle = '#B45309'; g.fillRect(cx - 18, h * .1 + 12, 36, 14); g.strokeStyle = '#374151'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, h * .1 + 26); g.lineTo(cx, y0 - 20); g.stroke();
  // اللوحة: العدد والعملية (النتيجة بعد الحل فقط)
  g.fillStyle = '#FFFDF6'; g.beginPath(); g.roundRect(w * .5 - 160, h * .17, 320, 46, 12); g.fill(); g.strokeStyle = '#F59E0B'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#1E2433'; drawMath(g, r.label || [], w / 2, h * .17 + 31, 20);
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

const P10 = k => ({ b: N(10), e: N(k) });   // ١٠ بأس على القماش
function make(i) {
  if (i === 0) { const v = R(11, 95) / 10, k = R(2, 3), target = Math.round(v * Math.pow(10, k));
    return { q: `حاوية الشحنة رقمها <b>${N(v)}</b>، ونريد رقمها الجديد <b>${N(target)}</b>. أدر الرافعة: في أي قوة للعدد ١٠ نضرب؟`, input: { type: 'dial', start: 0, min: -4, max: 4, show: k => k ? `× ${pw(10, k)}` : '× ١', label: '🏗️ ثبّت الرافعة' },
      ok: x => x === k, hint: 'كل ضرب في ١٠ ينقل كل رقم خانة واحدة إلى اليسار: كم خانة يجب أن ينتقل الرقم الأول؟', bad: x => x === -k ? 'الاتجاه معكوس: العدد يجب أن يكبر.' : '', data: { v, k, label: [`${N(v)} ← ${N(target)}`] } }; }
  if (i === 1) { const v = R(11, 99), k = -R(1, 3), a = Math.round(v * Math.pow(10, k) * 1e4) / 1e4;
    return { q: `أوجد: <b>${N(v)} × ${pw(10, k)}</b>`, input: { type: 'num', dot: true }, ok: x => eq(x, a), hint: `${pw(10, k)} يساوي ${fr(1, Math.pow(10, -k))}. الضرب فيه يساوي القسمة على أي عدد؟`,
      bad: x => eq(x, v * Math.pow(10, -k)) ? 'الأس السالب يعني القسمة لا الضرب.' : '', data: { v, k, label: [`${N(v)} × `, P10(k)] } }; }
  if (i === 2) { const v = R(101, 999), k = R(3, 4), a = Math.round(v / Math.pow(10, k) * 1e6) / 1e6;
    return { q: `أوجد: <b>${N(v)} ÷ ${pw(10, k)}</b>`, input: { type: 'num', dot: true }, ok: x => eq(x, a), hint: `القسمة على ${pw(10, k)} تنقل كل رقم ${N(k)} خانات إلى اليمين. أين تصير الفاصلة؟`,
      bad: x => eq(x * 10, a) || eq(x / 10, a) ? 'اقتربتَ: عُدّ الخانات مرة أخرى.' : '', data: { v, k: -k, label: [`${N(v)} ÷ `, P10(k)] } }; }
  if (i === 3) { const v = R(11, 99) / 100, k = R(2, 3), a = Math.round(v * Math.pow(10, k) * 100) / 100;
    return { q: `أوجد: <b>${N(v)} ÷ ${pw(10, -k)}</b>`, input: { type: 'num', dot: true }, ok: x => eq(x, a), hint: `القسمة على ${pw(10, -k)} أي على ${fr(1, Math.pow(10, k))}: القسمة على كسر بسطه ١ تساوي الضرب في مقلوبه.`,
      bad: x => eq(x, v / Math.pow(10, k)) ? 'القسمة على عدد أصغر من ١ تكبّر الناتج.' : '', data: { v, k, label: [`${N(v)} ÷ `, P10(-k)] } }; }
  const k = R(1, 3), opts = [`÷ ${N(Math.pow(10, k))}`, `× ${N(Math.pow(10, k))}`, `÷ ${pw(10, -k)}`, `× ${N(Math.pow(10, k + 1))}`], sh2 = opts.map((o, j) => [Math.random(), o, j]).sort((a, b) => a[0] - b[0]);
  return { q: `الضرب في <b>${pw(10, -k)}</b> يساوي أي عملية؟`, input: { type: 'pick', opts: sh2.map(x => x[1]) }, ok: j => sh2[j][2] === 0,
    hint: `اكتب ${pw(10, -k)} في صورة كسر: ${fr(1, '؟')}. ماذا يعني الضرب في كسر بسطه واحد؟`, bad: j => sh2[j][2] === 2 ? `القسمة على ${pw(10, -k)} تكبّر العدد، والضرب فيه يصغّره.` : '', data: { v: 3.6, k: -k, label: ['× ', P10(-k)] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [v, k] = fresh(() => [R(11, 99) / 10, R(2, 4)]); items.push(num(`احسب: ${N(v)} × ${pw(10, k)}`, Math.round(v * Math.pow(10, k)), 'كل قوة للعدد ١٠ تنقل الأرقام خانة إلى اليسار.', '8Np1')); }
  { const [v, k] = fresh(() => [R(11, 99), R(1, 3)]); items.push(num(`احسب: ${N(v)} × ${pw(10, -k)}`, Math.round(v * Math.pow(10, -k) * 1e4) / 1e4, 'الأس السالب يعني القسمة على القوة الموجبة.', '8Np1', { dot: true })); }
  { const [v, k] = fresh(() => [R(101, 999), R(2, 4)]); items.push(num(`احسب: ${N(v)} ÷ ${pw(10, k)}`, Math.round(v / Math.pow(10, k) * 1e6) / 1e6, 'القسمة على قوة للعدد ١٠ تنقل الأرقام إلى اليمين.', '8Np1', { dot: true })); }
  { const [v, k] = fresh(() => [R(2, 9) / 100, R(1, 3)]); items.push(num(`احسب: ${N(v)} ÷ ${pw(10, -k)}`, Math.round(v * Math.pow(10, k) * 1e4) / 1e4, 'القسمة على كسر بسطه ١ تساوي الضرب في مقامه.', '8Np1', { dot: true })); }
  items.push(choice(`${N(.1)} تساوي:`, pw(10, -1), [pw(10, 1), pw(-10, 1), pw(10, 0)], 'العُشر واحد مقسوم على ١٠: أي أس يعبّر عن ذلك؟', '8Np1'));
  { const k = fresh(() => R(2, 4)); items.push(multi(`اختر كل ما يساوي ${fr(1, Math.pow(10, k))}:`, [pw(10, -k), N(1 / Math.pow(10, k)), pw(10, k), N(Math.pow(10, k))], o => o === pw(10, -k) || o === N(1 / Math.pow(10, k)), 'واحد مقسوم على قوة للعدد ١٠: أسها سالب، وصورتها العشرية تبدأ بأصفار بعد الفاصلة.', '8Np1')); }
  { const [v, k] = fresh(() => [R(11, 99), R(1, 3)]); items.push(tf(`${N(v)} × ${pw(10, -k)} = ${N(v)} ÷ ${pw(10, k)}`, true, 'هل الضرب في الأس السالب هو القسمة على الأس الموجب؟', '8Np1', 'كلاهما ينقل الأرقام الخانات نفسها إلى اليمين.')); }
  { const v = fresh(() => R(11, 99) / 10); items.push(tf(`${N(v)} ÷ ${pw(10, -2)} أصغر من ${N(v)}`, false, 'القسمة على عدد أصغر من ١: تكبّر أم تصغّر؟', '8Np1', `${N(v)} ÷ ${pw(10, -2)} = ${N(Math.round(v * 100))}، وهو أكبر.`)); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'رافعة الحاويات', icon: '🏗️', who, rounds: 5, make, draw,
  intro: ['هذا رصيف الحاويات: كل خانة فيه منزلة من منازل العدد، والعمود الأصفر هو الفاصلة العشرية.', 'الرافعة لا تحرّك الفاصلة أبداً… بل تنقل الحاويات (الأرقام) يساراً أو يميناً.'],
  outro: ['أتقنتَ الرافعة! الضرب في ١٠ أس سالب هو القسمة على ١٠ أس موجب.', 'لنختبر ذلك بأسئلة الرصيف.'],
  challenge: { title: 'تحدي قوى العشرة', make: challenge }
});
export { make, challenge };
