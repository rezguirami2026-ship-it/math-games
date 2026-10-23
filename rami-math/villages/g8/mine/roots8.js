// ١-٢ الجذور التربيعية والجذور التكعيبية — «عروق البلّور»: عروق مربعة من بلاطات بلّورية ومكعبات من مكعبات صغيرة.
// الجولات: ضلع المربع من مساحته (حتى ٢٠ × ٢٠)، حرف المكعب من حجمه (حتى ٥ × ٥ × ٥)، بين أي عددين يقع الجذر، وتقديره لأقرب عدد كامل.
// التحدي: ٨ أسئلة جديدة من مخرج 8Ni2 (الكتاب ص١٩–٢١).
import { mission } from '../../mission.js';
import { N, R, rt } from '../../math.js';
import { choice, num, tf, multi } from '../../../missions/challenge.js';

const who = { name: 'المنقّبة مريم', face: '👷🏽‍♀️', id: 'maryam' };
const COL = ['#5FD3FF', '#B28CFF', '#7CF5C8', '#FFB347'];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}, bg = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * .7);
  bg.addColorStop(0, '#1C1830'); bg.addColorStop(1, '#09080F'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const c = COL[(S.i || 0) % COL.length];
  if (r.cube) {   // مكعب متساوي القياس من مكعبات صغيرة (الحرف = القيمة الحالية)
    const n = Math.max(1, Math.min(6, S.r.input.type === 'dial' ? S.v : r.n)), u = Math.min(22, (h - 40) / (n * 1.6 + 1)), ox = w / 2, oy = h / 2 + n * u * .55;
    const cubeAt = (x, y, z) => { const px = ox + (x - y) * u * .87, py = oy + (x + y) * u * .5 - z * u;
      g.fillStyle = c; g.globalAlpha = .9; g.beginPath(); g.moveTo(px, py - u); g.lineTo(px + u * .87, py - u * .5); g.lineTo(px, py); g.lineTo(px - u * .87, py - u * .5); g.fill();
      g.fillStyle = '#ffffff33'; g.fill(); g.fillStyle = c; g.globalAlpha = .65; g.beginPath(); g.moveTo(px - u * .87, py - u * .5); g.lineTo(px, py); g.lineTo(px, py + u); g.lineTo(px - u * .87, py + u * .5); g.fill();
      g.globalAlpha = .4; g.beginPath(); g.moveTo(px, py); g.lineTo(px + u * .87, py - u * .5); g.lineTo(px + u * .87, py + u * .5); g.lineTo(px, py + u); g.fill(); g.globalAlpha = 1; };
    for (let z = 0; z < n; z++) for (let y = n - 1; y >= 0; y--) for (let x = n - 1; x >= 0; x--) cubeAt(n - 1 - x, n - 1 - y, z);
    g.fillStyle = '#FFD27A'; g.font = '800 15px Cairo'; g.textAlign = 'center'; g.fillText(`${N(n)} × ${N(n)} × ${N(n)} = ${N(n ** 3)} مكعباً`, w / 2, 22);
    return;
  }
  // مربع من بلاطات: الضلع s، والهدف (المساحة) يظهر عرقاً متوهجاً
  const s = Math.max(1, Math.min(20, S.r && S.r.input.type === 'dial' ? S.v : (r.s || 5))), A = r.area, u = Math.min((w - 40) / 21, (h - 50) / 21), x0 = w / 2 - s * u / 2, y0 = h / 2 - s * u / 2 + 10;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const k = y * s + x; g.fillStyle = A && k >= A ? '#ffffff14' : c; g.globalAlpha = A && k >= A ? 1 : .55 + .35 * Math.sin(t * 2 + x * .4 + y * .3) ** 2; g.fillRect(x0 + x * u + 1, y0 + y * u + 1, u - 2, u - 2); }
  g.globalAlpha = 1; g.strokeStyle = '#FFD27A'; g.lineWidth = 2; g.strokeRect(x0, y0, s * u, s * u);
  g.fillStyle = '#FFD27A'; g.font = '800 15px Cairo'; g.textAlign = 'center';
  g.fillText(`${N(s)} × ${N(s)} = ${N(s * s)} بلاطة` + (A ? `   ·   العرق: ${N(A)}` : ''), w / 2, 20);
  if (A && S.r.input.type === 'dial') { const d = s * s - A; g.fillStyle = d === 0 ? '#4ADE80' : '#FFB38A'; g.fillText(d === 0 ? 'تطابق تام ✓' : d > 0 ? `زادت ${N(d)} بلاطة` : `نقصت ${N(-d)} بلاطة`, w / 2, h - 8); }
}

const SQ = Array.from({ length: 20 }, (_, k) => (k + 1) ** 2);
function make(i) {
  if (i === 0) { const s = R(6, 20), A = s * s; return { q: `عرق بلّوري مربع فيه <b>${N(A)}</b> بلاطة. اضبط طول ضلع المربع ليطابق العرق.`, input: { type: 'dial', start: 3, min: 1, max: 20, show: v => N(v), label: '💎 اقطع العرق' },
    ok: v => v === s, hint: 'أي عدد إذا ضربته في نفسه أعطاك عدد البلاطات؟', bad: v => v * v > A ? 'المربع أكبر من العرق.' : 'المربع أصغر من العرق.', data: { area: A } }; }
  if (i === 1) { const n = R(2, 5); return { q: `بلّورة مكعبة مكوّنة من <b>${N(n ** 3)}</b> مكعباً صغيراً. ما طول حرفها؟`, input: { type: 'dial', start: 1, min: 1, max: 6, show: v => N(v), label: '🧊 ثبّت الحرف' },
    ok: v => v === n, hint: 'أي عدد إذا ضربته في نفسه ثلاث مرات أعطاك عدد المكعبات؟', bad: v => v ** 3 > n ** 3 ? 'المكعب أكبر من البلّورة.' : 'المكعب أصغر من البلّورة.', data: { cube: true, n } }; }
  if (i === 2) {   // بين أي عددين صحيحين متتاليين يقع الجذر
    const s = R(5, 18), A = s * s + R(1, 2 * s); const opts = [[s, s + 1], [s - 1, s], [s + 1, s + 2], [Math.floor(A / 10), Math.floor(A / 10) + 1]].map(([a, b]) => `${N(a)} و${N(b)}`);
    const uniq = [...new Set(opts)]; if (uniq.length < 4) return make(2);
    const sh = uniq.map((o, k) => [Math.random(), o, k]).sort((a, b) => a[0] - b[0]);
    return { q: `عرق فيه <b>${N(A)}</b> بلاطة لا يكوّن مربعاً كاملاً. ${rt(A)} يقع بين أي عددين صحيحين متتاليين؟`, input: { type: 'pick', opts: sh.map(x => x[1]) },
      ok: k => sh[k][2] === 0, hint: 'ما أقرب عددين مربعين كاملين للعدد، أحدهما أصغر منه والآخر أكبر؟', bad: k => sh[k][2] === 3 ? 'الجذر ليس العدد مقسوماً على ١٠.' : '', data: { area: A, s } };
  }
  if (i === 3) {   // التقدير لأقرب عدد كامل (بعيداً عن المنتصف حتى لا يلتبس)
    for (let k = 0; k < 50; k++) { const A = R(30, 399), r0 = Math.sqrt(A), f = r0 % 1; if (SQ.includes(A) || Math.abs(f - .5) < .15) continue;
      const near = Math.round(r0); return { q: `قدّر قيمة ${rt(A)} لأقرب عدد كامل.`, input: { type: 'num' }, ok: v => v === near,
        hint: 'بين أي مربعين كاملين يقع العدد؟ وإلى أيهما هو أقرب؟', bad: v => v === Math.floor(r0) + Math.ceil(r0) - near ? 'العدد بين هذين، لكن إلى أيّ المربعين هو أقرب؟' : '', data: { area: A, s: near } }; }
  }
  for (let k = 0; k < 50; k++) {   // الجذر التكعيبي: بين أي مكعبين وأقرب عدد كامل
    const V = R(10, 120), c = Math.cbrt(V), f = c % 1; if ([8, 27, 64].includes(V) || Math.abs(f - .5) < .15) continue;
    const near = Math.round(c); return { q: `قدّر قيمة ${rt(V, 3)} لأقرب عدد كامل.`, input: { type: 'num' }, ok: v => v === near,
      hint: 'ما المكعبات الكاملة: ١ و٨ و٢٧ و٦٤ و١٢٥؟ بين أيها يقع العدد، وإلى أيها هو أقرب؟', data: { cube: true, n: near } };
  }
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); if (!used.has(v)) { used.add(v); return v; } } return f(); };
  { const s = fresh(() => R(11, 20)); items.push(num(`احسب: ${rt(s * s)}`, s, 'أي عدد إذا ضربته في نفسه أعطاك ما تحت الجذر؟', '8Ni2')); }
  { const n = fresh(() => R(2, 5)); items.push(num(`احسب: ${rt(n ** 3, 3)}`, n, 'أي عدد إذا ضربته في نفسه ثلاث مرات أعطاك ما تحت الجذر؟', '8Ni2')); }
  { const s = fresh(() => R(6, 17)), A = s * s + R(1, 2 * s); used.add(A);
    items.push(choice(`${rt(A)} يقع بين العددين:`, `${N(s)} و${N(s + 1)}`, [`${N(s - 1)} و${N(s)}`, `${N(s + 1)} و${N(s + 2)}`], 'ما المربع الكامل الذي قبل العدد مباشرة، وما الذي بعده؟', '8Ni2')); }
  { let A, near; for (let k = 0; k < 60; k++) { A = fresh(() => R(40, 390)); const r0 = Math.sqrt(A); if (Math.abs(r0 % 1 - .5) > .15 && r0 % 1) { near = Math.round(r0); break; } }
    items.push(num(`قدّر قيمة ${rt(A)} لأقرب عدد كامل.`, near, 'بين أي مربعين كاملين يقع؟ وأيهما أقرب إليه؟', '8Ni2')); }
  { const s = fresh(() => R(4, 12)), A = s * s - R(1, s - 1);
    items.push(choice(`أي جملة عددية صحيحة؟`, `${N(s - 1)} < ${rt(A)} < ${N(s)}`, [`${N(s)} < ${rt(A)} < ${N(s + 1)}`, `${N(s - 2)} < ${rt(A)} < ${N(s - 1)}`], `ما مربع ${N(s - 1)}؟ وما مربع ${N(s)}؟ أين يقع ${N(A)} بينهما؟`, '8Ni2')); }
  { const s = fresh(() => R(12, 19)); items.push(tf(`${rt(s * s * 4)} = ${N(4 * s)}`, false, 'جرّب: اضرب العدد في نفسه، هل تحصل على ما تحت الجذر؟', '8Ni2', `${rt(s * s * 4)} = ${N(2 * s)} لأن ${N(2 * s)} × ${N(2 * s)} = ${N(4 * s * s)}`)); }
  { const pool = [1, 4, 8, 9, 16, 25, 27, 36, 49, 64, 81, 100, 125, 12, 18, 20, 32, 50]; const opts = pool.sort(() => Math.random() - .5).slice(0, 6);
    if (!opts.some(v => [8, 27, 64, 125, 1].includes(v))) opts[0] = 27;
    items.push(multi('اختر الأعداد التي جذرها التكعيبي عدد صحيح:', opts, v => [1, 8, 27, 64, 125].includes(v), 'أي هذه الأعداد ناتج ضرب عدد في نفسه ثلاث مرات؟', '8Ni2')); }
  { let V, near; for (let k = 0; k < 60; k++) { V = fresh(() => R(10, 120)); const c = Math.cbrt(V); if (![8, 27, 64].includes(V) && Math.abs(c % 1 - .5) > .15) { near = Math.round(c); break; } }
    items.push(num(`قدّر قيمة ${rt(V, 3)} لأقرب عدد كامل.`, near, 'ما المكعبان الكاملان اللذان يقع بينهما العدد؟ وأيهما أقرب؟', '8Ni2')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'عروق البلّور', icon: '💎', who, rounds: 5, make, draw,
  intro: ['في هذا الكهف تنمو البلّورات مربعات ومكعبات.', 'إذا عرفنا عدد البلاطات في العرق، نستطيع أن نجد طول ضلعه: هذا هو الجذر.'],
  outro: ['رائع! الجذر التربيعي يعطينا الضلع من المساحة، والتكعيبي يعطينا الحرف من الحجم.', 'لنختبر ما تعلمته قبل أن تمضي إلى كهف التضاعف.'],
  challenge: { title: 'تحدي الجذور', make: challenge }
});

export { make, challenge };   // للفحص الآلي (tests/fuzz-villages.mjs)
