// ١١-٧ الرسوم البيانية العملية — «منحنى الرحلة»: مدير المنتجع يوسف يكتب صيغاً خطية لمسائل من الواقع: قيمة عربة الرمل تنخفض كل سنة،
// وشجرة الغاف تطول كل سنة، وخزان الماء يفرغ. الطالب يختار الصيغة، ويحسب قيمة بعد زمن، ويجد الزمن لقيمة معلومة (من الرسم والصيغة)،
// ويفسر معنى الميل. التحدي: ٨ أسئلة من 8As4 (الكتاب ص٦٣–٦٤).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane } from './art.js';

const who = { name: 'مدير المنتجع يوسف', face: '🧔🏽‍♂️', id: 'yousef8' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
// المسائل: [النص، الحرف، القيمة الأولى، التغيّر في السنة، الوحدة]
const CASES = () => pick([
  { what: 'قيمة عربة الرمل', fem: 1, v: 'ط', u: 'ألف ريال', a: pick([20, 18, 24]), d: pick([-1.5, -2, -1]), tl: 'الزمن بالسنوات' },
  { what: 'ارتفاع شجرة الغاف', v: 'ص', u: 'متر', a: pick([6, 4, 3]), d: pick([.5, 1, .25]), tl: 'الزمن بالسنوات' },
  { what: 'الماء في خزان المنتجع', v: 'ح', u: 'ألف لتر', a: pick([30, 24, 40]), d: pick([-2, -3, -4]), tl: 'الزمن بالأيام' }]);
const f = C => `${C.v} = ${N(C.a)} ${C.d < 0 ? '−' : '+'} ${N(Math.abs(C.d))}م`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t); const C = r.C;
  if (!C) return; const s = Math.min(w * .5, h * .72), x = w * .5 - s / 2, y = h * .12, top = Math.max(C.a, C.a + C.d * 10), k = 10 / Math.ceil(top / 10) / 10;
  plane(g, x, y, s, 0, 10, { lines: [{ m: C.d * k, c: C.a * k }], pts: S.done && r.p ? [{ p: [r.p[0], r.p[1] * k], col: '#EA580C', l: '' }] : [], lab: 2 });
  say(g, `${C.what}`, w * .5, h * .07, 16, '#7C3AED', 900); say(g, S.done ? r.ans : (r.ask || ''), w * .5, h * .95, 17, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  const C = CASES(), dir = (C.fem ? 'ت' : 'ي') + (C.d < 0 ? 'نخفض' : 'زيد'), maxM = Math.floor((C.a - 1) / Math.max(.01, -C.d));
  const story = `${C.what} الآن ${N(C.a)} ${C.u}، و${dir} بمقدار ${N(Math.abs(C.d))} ${C.u} كل ${C.tl.includes('أيام') ? 'يوم' : 'سنة'}`;
  if (i === 0) { const right = f(C), opts = shuf([right, `${C.v} = ${N(Math.abs(C.d))} ${C.d < 0 ? '−' : '+'} ${N(C.a)}م`, `${C.v} = ${N(C.a)} ${C.d < 0 ? '+' : '−'} ${N(Math.abs(C.d))}م`, `${C.v} = ${N(C.a)}م ${C.d < 0 ? '−' : '+'} ${N(Math.abs(C.d))}`]);
    return { q: `${story}. أي صيغة تعطي ${C.what} بعد م؟`, input: { type: 'pick', opts }, ok: v => opts[v] === right,
      hint: 'ما القيمة عند البداية حين م = ٠؟ وماذا يحدث لها مع كل وحدة زمن؟', bad: () => 'عند م = ٠ يجب أن تكون القيمة هي القيمة الأولى، والتغيّر مضروب في م.',
      good: right, data: { C, ask: 'الصيغة: ؟', ans: right } }; }
  if (i === 1 || i === 3) { const m = R(3, Math.min(6, C.d < 0 ? maxM : 6)), val = C.a + C.d * m;
    return { q: `${story}، والصيغة ${f(C)}. كم تصبح بعد ${N(m)} ${C.tl.includes('أيام') ? 'أيام' : 'سنوات'}؟`, input: { type: 'num', dot: true }, sol: val, ok: v => eq(v, val),
      hint: 'عوّض بالزمن مكان م في الصيغة.', bad: v => eq(v, C.a + C.d) ? `هذه بعد وحدة زمن واحدة فقط.` : eq(v, C.a - C.d * m) ? 'راجع الإشارة: هل القيمة تزيد أم تنقص؟' : '',
      good: `${N(C.a)} ${C.d < 0 ? '−' : '+'} ${N(Math.abs(C.d))} × ${N(m)} = ${N(val)}`, data: { C, p: [m, val], ask: `م = ${N(m)} ← ؟`, ans: `${N(val)} ${C.u}` } }; }
  if (i === 2 || i === 4) { const m = R(2, Math.min(8, C.d < 0 ? maxM : 8)), val = C.a + C.d * m;
    return { q: `${story}، والصيغة ${f(C)}. بعد كم ${C.tl.includes('أيام') ? 'يوماً' : 'سنة'} تصبح ${N(val)} ${C.u}؟`, input: { type: 'num', dot: true }, sol: m, ok: v => eq(v, m),
      hint: `عوّض ${C.v} = ${N(val)} في الصيغة، ثم حلّ المعادلة لإيجاد م. أو اقرأ من الرسم.`, bad: v => eq(v, val) ? 'هذه القيمة نفسها: المطلوب الزمن.' : '',
      good: `${N(val)} = ${f(C).split(' = ')[1]} ← م = ${N(m)}`, data: { C, p: [m, val], ask: `${C.v} = ${N(val)} ← م = ؟`, ans: `م = ${N(m)}` } }; }
  const right = `${C.what} ${dir} ${N(Math.abs(C.d))} ${C.u} كل ${C.tl.includes('أيام') ? 'يوم' : 'سنة'}`, opts = shuf([right, `${C.what} عند البداية ${N(Math.abs(C.d))} ${C.u}`, `${C.what} ${(C.fem ? 'ت' : 'ي') + (C.d < 0 ? 'زيد' : 'نخفض')} ${N(Math.abs(C.d))} ${C.u} كل ${C.tl.includes('أيام') ? 'يوم' : 'سنة'}`, `${C.what} ${C.fem ? 'تتضاعف' : 'يتضاعف'} كل ${C.tl.includes('أيام') ? 'يوم' : 'سنة'}`]);
  return { q: `في الصيغة ${f(C)} ميل الرسم البياني ${N(C.d)}. ماذا يعني الميل هنا؟`, input: { type: 'pick', opts }, ok: v => opts[v] === right,
    hint: 'الميل = التغيّر في القيمة لكل وحدة زمن. وإشارته؟', bad: () => 'الميل يخبرنا كم تتغير القيمة في كل وحدة زمن وفي أي اتجاه.',
    good: right, data: { C, ask: 'معنى الميل؟', ans: right } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f2 => { for (let k = 0; k < 60; k++) { const x = f2(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f2(); };
  items.push(num('قيمة سيارة ط = ٢٠ − ١٫٥م بآلاف الريالات. كم قيمتها بعد ٤ سنوات بآلاف الريالات؟', 14, 'عوّض م = ٤.', '8As4', { dot: true }));
  items.push(num('قيمة سيارة ط = ٢٠ − ١٫٥م بآلاف الريالات. بعد كم سنة تصبح ١١ ألفاً؟', 6, 'حلّ ٢٠ − ١٫٥م = ١١.', '8As4', { dot: true }));
  items.push(num('شجرة ارتفاعها ص = ٦ + ٠٫٥س متراً بعد س سنة. كم ارتفاعها بعد ٥ سنوات بالمتر؟', 8.5, 'عوّض س = ٥.', '8As4', { dot: true }));
  items.push(num('شجرة ارتفاعها ص = ٦ + ٠٫٥س متراً. بعد كم سنة يصبح ارتفاعها ١٠ أمتار؟', 8, 'حلّ ٦ + ٠٫٥س = ١٠.', '8As4'));
  items.push(tf('في الصيغة ط = ٢٠ − ١٫٥م، العدد ٢٠ هو القيمة عند البداية.', true, 'عوّض م = ٠.', '8As4', 'ط = ٢٠ حين م = ٠.'));
  items.push(tf('الميل السالب في الرسم العملي يعني أن الكمية تزيد مع الزمن.', false, 'ماذا يحدث للرسم النازل؟', '8As4', 'الميل السالب = نقصان.'));
  { const [a, d] = fresh(() => [pick([30, 40]), pick([2, 4, 5])]); items.push(choice(`خزان فيه ${N(a)} ألف لتر ويفقد ${N(d)} آلاف لتر يومياً. الصيغة:`, `ح = ${N(a)} − ${N(d)}م`, [`ح = ${N(a)} + ${N(d)}م`, `ح = ${N(d)} − ${N(a)}م`, `ح = ${N(a)}م − ${N(d)}`], 'القيمة الأولى ثم التغيّر × الزمن.', '8As4')); }
  { const [a, d, m] = fresh(() => [pick([30, 40]), pick([2, 4]), R(2, 6)]); items.push(num(`ح = ${N(a)} − ${N(d)}م. ما ح بعد ${N(m)} أيام؟`, a - d * m, 'عوّض.', '8As4')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'منحنى الرحلة', icon: '📈', who, rounds: 6, make, draw,
  intro: ['أنا يوسف، مدير المنتجع. أخطط لكل شيء بالرسوم البيانية: العربات والأشجار والماء.', 'لكل منها قيمة في البداية وتغيّر ثابت كل يوم أو سنة… فالصيغة خطية ورسمها مستقيم!'],
  outro: ['أحسنت! صارت خطط المنتجع واضحة.', 'تحدي الرسوم البيانية العملية.'],
  challenge: { title: 'تحدي الرسوم العملية', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
