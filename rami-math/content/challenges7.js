// تحديات الفصل الثاني — الوحدة ٣ (الأعداد والكسور — الجمعية): ٨ جولات لكل درس من الدروس الاثني عشر. القواعد نفسها.
import { ar } from '../core/util.js';
import { choice, multi, order, num, tf, sort, match, pickN, fresh, line, memory, error } from '../missions/challenge.js';
import { nline, dec } from './chArt.js';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => pickN(a, a.length);
const N = n => ar(n);
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const fr = (n, d) => `<span class="frac"><b>${ar(n)}</b><i>${ar(d)}</i></span>`;
const mx = (w, n, d) => { if (!n) return ar(w); const g = gcd(n, d); n /= g; d /= g; return w ? `${ar(w)} و${fr(n, d)}` : fr(n, d); };   // عدد كسري في أبسط صورة
const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const pc = n => `${ar(n)}٪`;
const fv = (f, gen) => { for (let t = 0; t < 60; t++) { const v = +gen().toFixed(3); if (!f.has('d' + v)) { f.mark('d' + v); return v; } } return +gen().toFixed(3); };
const hundred = k => { let s = '<svg viewBox="0 0 202 202" class="chClock" style="width:160px;height:160px">'; for (let i = 0; i < 100; i++) s += `<rect x="${1 + (i % 10) * 20}" y="${1 + Math.floor(i / 10) * 20}" width="20" height="20" fill="${i < k ? '#3FA3F5' : '#fff'}" stroke="#9AA3B8" stroke-width="1"/>`; return s + '</svg>'; };
const ROMAN = n => { const T = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of T) while (n >= v) { s += r; n -= v; } return s; };
const rom = n => `<b dir="ltr" class="ltr">${ROMAN(n)}</b>`;

export const CH = {
  /* ١. نظام الأعداد (٢): Nn1، Nn5، Nn9، Nn11 */
  numberSystem2: { who: 'jamal', title: 'تحدي أمين الخزينة', lines: [{ who: 'jamal', text: 'الخزينة مرتبة حتى آخر بيسة! أحسنت.' }],
    make() {
      const f = fresh(), it = [];
      { const a = f(301, 899, z => z % 10 >= 5 && z % 10 <= 7) / 100, S = [0, 1, 2].map(i => +(a + i / 100).toFixed(2));
        it.push(num(`أكمل العدّ: ${S.map(dec).join('، ')}، ؟`, +(a + .03).toFixed(2), 'نضيف جزءاً واحداً من مئة (٠٫٠١) كل مرة.', 'Nn1')); }
      { const w = R(2, 4), F = [`${ar(w)}`, mx(w - 1, 2, 3), mx(w - 1, 1, 3)];
        it.push(choice(`أكمل العدّ التنازلي بالأثلاث: ${F.join('، ')}، ؟`, ar(w - 1), [mx(w - 1, 1, 3), mx(w - 2, 2, 3), mx(w - 1, 2, 3)].filter(x => x !== ar(w - 1)), 'نطرح ثلثاً في كل مرة: ثلاثة أثلاث تكوّن واحداً.', 'Nn1')); }
      { const v = fv(f, () => R(101, 999) / 100);
        it.push(num(`${dec(v)} × ١٠٠ = ؟`, Math.round(v * 100), 'الضرب في ١٠٠ ينقل كل رقم منزلتين إلى منزلة أكبر.', 'Nn5', { dot: false })); }
      { const v = fv(f, () => R(101, 999) / 10);
        it.push(num(`${dec(v)} ÷ ١٠ = ؟`, +(v / 10).toFixed(2), 'القسمة على ١٠ تنقل كل رقم منزلة إلى منزلة أصغر.', 'Nn5')); }
      { const v = fv(f, () => R(101, 999) / 100), r = Math.round(v * 10) / 10;
        it.push(choice(`قرّب <b>${dec(v)}</b> ريال لأقرب جزء من عشرة:`, dec(r), [dec(+(r + .1).toFixed(1)), dec(+(r - .1).toFixed(1)), dec(Math.round(v))].filter(s => s !== dec(r)), 'انظر إلى رقم الأجزاء من مئة.', 'Nn9')); }
      { const ps = []; for (let t = 0; ps.length < 4 && t < 200; t++) { const v = fv(f, () => R(101, 999) / 100), r = ar(Math.round(v)); if (Math.round(v * 100) % 100 !== 50 && !ps.some(p => p[1] === r)) ps.push([dec(v), r]); }
        it.push(match('صِل كل مبلغ بتقريبه لأقرب ريال:', ps, 'انظر إلى رقم الأجزاء من عشرة: ٥ أو أكثر نقرّب إلى الأعلى.', 'Nn9')); }
      { const L = [-f(20, 60), -f(1, 9), 0, f(5, 40), f(100, 300)];
        it.push(order('أرصدة صناديق الجمعية (بالريال). رتّبها من <b>الأصغر</b> إلى <b>الأكبر</b>:', L.map(v => ({ v, label: N(v) })), (p, q) => p.v - q.v, 'الرصيد السالب دَين: أصغر من الصفر.', 'Nn11')); }
      { const a = -f(3, 9), b = -f(11, 19), right = R(0, 1) === 1;
        it.push(tf(`${N(right ? a : b)} > ${N(right ? b : a)}`, right, 'العدد الأقرب إلى الصفر من السالبة هو الأكبر.', 'Nn11', `${N(a)} أكبر من ${N(b)}.`)); }
      return it;
    } },

  /* ٢. تاريخ الأعداد (٢): Nn20، Nn14، Nn16، Ps3 */
  numberHistory2: { who: 'ruqaya', title: 'تحدي المعلمة رقية', lines: [{ who: 'ruqaya', text: 'تعرف تاريخ الأعداد وتقرأ أرقام الرومان!' }],
    make() {
      const f = fresh(), it = [], key = [['C', 100], ['L', 50], ['X', 10], ['V', 5], ['I', 1]].map(([r, v]) => `<span class="ltr" dir="ltr">${r} = ${ar(v)}</span>`).join(' ، ');
      { const n = f.take([24, 39, 46, 58, 73, 84, 92, 67, 115, 140]);
        it.push(num(`ما قيمة العدد الروماني ${rom(n)}؟`, n, 'اجمع القيم، وإذا جاء رمز أصغر قبل رمز أكبر فاطرحه (IX = ٩، XL = ٤٠).', 'Nn20', { dot: false, tail: key })); }
      { const n = f.take([14, 29, 34, 49, 66, 78, 99, 44]), opts = [ROMAN(n), ROMAN(n + 10), ROMAN(n - 2), ROMAN(n) .replace('IV', 'IIII').replace('IX', 'VIIII')].filter((v, i, A) => A.indexOf(v) === i);
        it.push(choice(`كيف كتب الرومان العدد <b>${ar(n)}</b>؟`, `<b dir="ltr" class="ltr">${opts[0]}</b>`, opts.slice(1).map(o => `<b dir="ltr" class="ltr">${o}</b>`), 'اكتب العشرات أولاً ثم الآحاد. ٤ = IV و٩ = IX.', 'Nn20', { tail: key })); }
      { const ns = [0, 1, 2, 3].map(() => f.take([12, 17, 21, 36, 45, 53, 62, 75, 88, 101, 150]));
        it.push(match('صِل كل عدد روماني بقيمته:', ns.map(n => [rom(n), ar(n)]), 'اقرأ الرموز من اليسار.', 'Nn20', { tail: key })); }
      { const Q = pickN([['لماذا في الساعة ٦٠ دقيقة؟', 'لأن البابليين استخدموا نظاماً عددياً أساسه ٦٠', ['لأن الرومان اختاروا ذلك', 'لأن في اليوم ٦٠ ساعة', 'لا يوجد سبب']],
          ['العالم المسلم الذي ألّف كتاباً في الحساب نقل الأرقام والصفر إلى العالم:', 'الخوارزمي', ['ابن بطوطة', 'ابن ماجد', 'المتنبي']],
          ['أهم ميزة في نظامنا العشري مقارنة بالأرقام الرومانية:', 'القيمة المكانية والصفر', ['الرموز الكثيرة', 'عدم وجود الصفر', 'الكتابة بالحروف']]], 1)[0];
        it.push(choice(Q[0], Q[1], Q[2], 'فكّر في تاريخ الأعداد الذي درسته.', 'Nn20')); }
      { const base = f(2, 6), L = shuffle([base + .5, base + .05, base + .55, base + .45, base + .4]);
        it.push(order('رتّب الأعداد من <b>الأصغر</b> إلى <b>الأكبر</b>:', L.map(v => ({ v, label: dec(+v.toFixed(2)) })), (p, q) => p.v - q.v, 'أضف صفراً لتتساوى المنازل: ٣٫٥ = ٣٫٥٠.', 'Nn14')); }
      { const km = fv(f, () => R(1, 9) + R(1, 99) / 1000);
        it.push(num(`طول طريق الرحلة التاريخية <b>${dec(km)}</b> كم. كم متراً؟`, Math.round(km * 1000), 'الكيلومتر ١٠٠٠ متر: اضرب في ١٠٠٠ (ثلاث منازل).', 'Nn16', { dot: false })); }
      { const X = 1.5, list = [0, 1, 2].map(() => ({ label: dec(fv(f, () => 1.5 + R(1, 45) / 100)), bin: 0 })).concat([0, 1, 2].map(() => ({ label: dec(fv(f, () => 1.5 - R(1, 45) / 100)), bin: 1 })));
        it.push(sort(`قارن كل عدد بـ <b>${dec(X)}</b>:`, [`أكبر من ${dec(X)}`, `أصغر من ${dec(X)}`], list, '١٫٥ = ١٫٥٠: قارن الأجزاء من عشرة ثم من مئة.', 'Nn14')); }
      { const w = R(2, 7), b = R(1, 3), a = 2 * b, v = w + a / 10 + b / 100;
        it.push(choice(`لغز رقية: أنا عدد عشري بين ${ar(w)} و${ar(w + 1)}، رقم الأجزاء من عشرة فيّ ضعف رقم الأجزاء من مئة، ومجموع أرقامي ${ar(w + a + b)}. من أنا؟`, dec(v), [dec(w + b / 10 + a / 100), dec(w + 1 + a / 10 + b / 100), dec(+(w + a / 10 + (b + 1) / 100).toFixed(2))], 'جرّب كل خيار مع الشروط الثلاثة.', 'Ps3')); }
      return it;
    } },

  /* ٣. الجمع والطرح (١): Nc1، Nc2، Nc3، Nc4 */
  addSub1: { who: 'saud', title: 'تحدي البقّال سعود', lines: [{ who: 'saud', text: 'حساب سريع ودقيق! حسابات البقالة سليمة.' }],
    make() {
      const f = fresh(), it = [], tp = shuffle([1, 2, 3, 4]);
      it.push(match('صِل كل عدد بالعدد الذي يكمله إلى <b>١</b>:', tp.slice(0, 3).map(p => { const a = R(0, 1) ? p : 10 - p; return [dec(a / 10), dec((10 - a) / 10)]; }), 'المجموع عشرة أجزاء من عشرة.', 'Nc1'));
      { const a = fv(f, () => R(11, 89) / 10);
        it.push(num(`${dec(a)} + ؟ = ١٠`, +(10 - a).toFixed(1), 'أكمل إلى العدد الكامل التالي، ثم إلى ١٠.', 'Nc2')); }
      { const a = f(11, 89, z => z % 10 !== 0);
        it.push(num(`${dec(a / 100)} + ؟ = ١`, (100 - a) / 100, 'الأجزاء من مئة يجب أن يكون مجموعها ١٠٠.', 'Nc2')); }
      { const k = pickN([25, 4], 1)[0], yes = [0, 1, 2].map(() => k * f(11, 99)), no = [0, 1, 2].map(() => k * f(11, 99) + pickN(k === 25 ? [5, 10, 15] : [1, 2, 3], 1)[0]);
        it.push(multi(`اختر <b>كل</b> المبالغ (بالبيسة) التي تقبل القسمة على <b>${ar(k)}</b>:`, yes.concat(no), z => z % k === 0, k === 25 ? 'تنتهي بـ ٠٠ أو ٢٥ أو ٥٠ أو ٧٥.' : 'آخر رقمين يقبلان القسمة على ٤.', 'Nc3')); }
      { const a = f(21, 69) * 100, b = f(11, 29) * 100;
        it.push(num(`${ar(a)} + ${ar(b)} = ؟`, a + b, 'فكّر بالمئات.', 'Nc4', { dot: false })); }
      { const a = fv(f, () => R(51, 99) / 10), b = fv(f, () => R(11, 49) / 10);
        it.push(num(`${dec(a)} − ${dec(b)} = ؟`, +(a - b).toFixed(1), 'اطرح الآحاد ثم الأجزاء من عشرة.', 'Nc4')); }
      { const a = f(11, 89, z => z % 10 !== 0 && z !== 50), right = R(0, 1) === 1, b = right ? 100 - a : 100 - a + pickN([10, -10], 1)[0];
        it.push(tf(`<b>${dec(a / 100)} + ${dec(b / 100)} = ١</b>`, right, 'هل مجموع الأجزاء من مئة ١٠٠؟', 'Nc2', `${dec(a / 100)} + ${dec((100 - a) / 100)} = ١.`)); }
      { const p = fv(f, () => R(31, 89) / 10);
        it.push(choice(`اشترى زبون بـ <b>${dec(p)}</b> ريال ودفع ١٠ ريالات. كم الباقي؟`, `${dec(+(10 - p).toFixed(1))} ريال`, [`${dec(+(10 - p + 1).toFixed(1))} ريال`, `${dec(+(10 - p - .1).toFixed(1))} ريال`, `${dec(+(p - 1).toFixed(1))} ريال`].filter(s => s !== `${dec(+(10 - p).toFixed(1))} ريال`), 'أكمل من السعر إلى ١٠.', 'Nc2')); }
      return it;
    } },

  /* ٤. الضرب والقسمة: Nc5، Nc6، Nc7، Nc9، Pt1 */
  mulDiv: { who: 'obaid', title: 'تحدي بائع السمك', lines: [{ who: 'obaid', text: 'وزنت السمك وحسبت ثمنه في رأسك! رائع.' }],
    make() {
      const f = fresh(), it = [];
      { const a = f(3, 9), b = f(2, 9);
        it.push(num(`${ar(a)} × ${dec(b / 10)} = ؟`, +(a * b / 10).toFixed(1), `${ar(a)} × ${ar(b)} = ${ar(a * b)}، والناتج أصغر بعشر مرات.`, 'Nc7')); }
      { const d = f(3, 9), q = f(2, 9);
        it.push(num(`${dec(d * q / 10)} ÷ ${ar(d)} = ؟`, q / 10, `${ar(d * q)} ÷ ${ar(d)} = ${ar(q)}، والناتج أصغر بعشر مرات.`, 'Nc7')); }
      { const a = f(36, 99);
        it.push(num(`سمكة كتلتها <b>${ar(a)}</b> غم، وأخرى ضعفها. كم كتلة الثانية؟`, 2 * a, 'ضاعف العشرات ثم الآحاد.', 'Nc9', { dot: false })); }
      { const a = f(61, 99) * 2 + 100;
        it.push(num(`ما نصف <b>${ar(a)}</b>؟`, a / 2, 'نصّف المئات ثم الباقي.', 'Nc9', { dot: false })); }
      { const a = fv(f, () => R(21, 79) / 10), b = pickN([.9, 1.1, .8], 1)[0];
        it.push(num(`${dec(a)} + ${dec(b)} = ؟`, +(a + b).toFixed(1), `${dec(b)} قريب من ١: أضف ١ ثم عدّل.`, 'Nc5')); }
      { const a = f(431, 879), b = pickN([198, 299, 399, 201], 1)[0];
        it.push(num(`${ar(a)} − ${ar(b)} = ؟`, a - b, 'اطرح المئات الكاملة القريبة ثم عدّل.', 'Nc6', { dot: false })); }
      { const k = f(3, 8), w = f(2, 8);
        it.push(choice(`ما أذكى طريقة لحساب <b>${dec(w + .9)} × ${ar(k)}</b>؟`, `${ar(w + 1)} × ${ar(k)} ثم نطرح ${dec(k / 10)}`, [`${ar(w + 1)} × ${ar(k)} ثم نطرح ${ar(k)}`, `${ar(w)} × ${ar(k)} ثم نجمع ٠٫٩`, `${ar(w + 1)} × ${ar(k)} ثم نجمع ${dec(k / 10)}`], `${dec(w + .9)} = ${ar(w + 1)} − ٠٫١، فنطرح ${ar(k)} × ٠٫١.`, 'Pt1')); }
      { const ps = [0, 1, 2, 3].map(() => { for (;;) { const a = R(3, 9), b = R(2, 9); if (!f.has('m' + a * b)) { f.mark('m' + a * b); return [`${ar(a)} × ${dec(b / 10)}`, dec(a * b / 10)]; } } });
        it.push(match('صِل كل ضرب بناتجه:', ps, 'اضرب كأنها أعداد كاملة، ثم اجعل الناتج أصغر بعشر مرات.', 'Nc7')); }
      return it;
    } },

  /* ٥. الجمع والطرح (٢): Nc12، Nc13، Pt1 */
  addSub2: { who: 'hessa', title: 'تحدي لعبة العشرات', lines: [{ who: 'hessa', text: 'ربحت لعبة العشرات! حسابك سريع ودقيق.' }],
    make() {
      const f = fresh(), it = [];
      { const a = fv(f, () => R(101, 199) / 10 + R(0, 1) * .05), b = fv(f, () => R(11, 69) / 10);
        it.push(num(`${dec(a)} + ${dec(b)} = ؟`, +(a + b).toFixed(2), 'رتّب الفواصل فوق بعضها.', 'Nc12')); }
      { const b = fv(f, () => R(301, 899) / 100);
        it.push(num(`٢٠ − ${dec(b)} = ؟`, +(20 - b).toFixed(2), `اكتب ٢٠ = ٢٠٫٠٠ ثم اطرح، أو أكمل من ${dec(b)} إلى ٢٠.`, 'Nc12')); }
      { const a = -f(3, 12), b = f(4, 15);
        it.push(num(`كانت الحرارة <b>${N(a)}°</b> فجراً وصارت <b>${N(b)}°</b> ظهراً. بكم درجة ارتفعت؟`, b - a, 'من السالب إلى الصفر، ثم من الصفر إلى الموجب.', 'Nc13', { dot: false })); }
      { const a = -f(13, 25), b = -f(2, 9);
        it.push(num(`ما الفرق بين <b>${N(a)}</b> و<b>${N(b)}</b>؟`, b - a, 'عُدّ الخطوات بينهما على خط الأعداد.', 'Nc13', { dot: false })); }
      { const a = f(12, 19), w = f(3, 8);
        it.push(choice(`ما أسهل طريقة لحساب <b>${ar(a)} − ${dec(w + .99)}</b>؟`, `${ar(a)} − ${ar(w + 1)} ثم نجمع ٠٫٠١`, [`${ar(a)} − ${ar(w + 1)} ثم نطرح ٠٫٠١`, `${ar(a)} − ${ar(w)} ثم نطرح ٠٫٩٩`, 'نطرح كل رقم من الذي فوقه دون ترتيب'], 'طرحنا أكثر من المطلوب بـ ٠٫٠١، فنعيده.', 'Pt1')); }
      { const list = [0, 1, 2].map(() => { const a = fv(f, () => R(51, 79) / 10), b = fv(f, () => R(31, 49) / 10); return { label: `${dec(a)} + ${dec(b)}`, bin: a + b > 10 ? 0 : 1 }; }).concat([0, 1, 2].map(() => { const a = fv(f, () => R(11, 39) / 10), b = fv(f, () => R(11, 49) / 10); return { label: `${dec(a)} + ${dec(b)}`, bin: a + b > 10 ? 0 : 1 }; }));
        if (new Set(list.map(x => x.bin)).size < 2) list[0].bin = 1 - list[0].bin, list[0].label = `${dec(9.5)} + ${dec(2.5)}`, list[0].bin = 0;
        it.push(sort('قدّر: هل الناتج أكبر من ١٠؟', ['أكبر من ١٠', 'ليس أكبر من ١٠'], list, 'اجمع الآحاد أولاً.', 'Pt1')); }
      { const a = fv(f, () => R(41, 89) / 10), b = fv(f, () => R(101, 399) / 100), right = R(0, 1) === 1, shown = right ? +(a - b).toFixed(2) : +(a - b / 10).toFixed(3);
        it.push(tf(`حسبت حصة: <b>${dec(a)} − ${dec(b)} = ${dec(shown)}</b>`, right && shown >= 0, `اكتب ${dec(a)} = ${dec(a)}٠ ثم اطرح.`, 'Nc12', `الناتج الصحيح ${dec(+(a - b).toFixed(2))}.`)); }
      { const ps = [0, 1, 2, 3, 4].map(() => { const a = fv(f, () => R(21, 99) / 10), b = fv(f, () => R(11, 99) / 100); return [`${dec(a)} + ${dec(b)}`, dec(+(a + b).toFixed(2))]; }).filter((p, i, A) => A.findIndex(q => q[1] === p[1]) === i).slice(0, 3);
        it.push(match('صِل كل عملية بناتجها:', ps, 'رتّب الفواصل.', 'Nc12')); }
      return it;
    } },

  /* ٦. قوانين الحساب: Nc17، Nc19، Nc20، Nc22، Ps6 */
  operationLaws: { who: 'adil', title: 'تحدي آلة الأقواس', lines: [{ who: 'adil', text: 'الآلة تعمل بالترتيب الصحيح بفضلك!' }],
    make() {
      const f = fresh(), it = [];
      { const a = f(2, 9), b = f(2, 9), c = f(3, 6);
        it.push(num(`(${ar(a)} + ${ar(b)}) × ${ar(c)} = ؟`, (a + b) * c, 'ما بين الأقواس أولاً.', 'Nc22', { dot: false })); }
      { const a = f(10, 20), b = f(2, 9), c = f(2, 6);
        it.push(num(`${ar(a)} + ${ar(b)} × ${ar(c)} = ؟`, a + b * c, 'الضرب قبل الجمع إذا لم توجد أقواس.', 'Nc22', { dot: false })); }
      { const k = f(2, 5), p = f(3, 7), e = f(1, 3);
        it.push(choice(`اشترى عادل <b>${ar(k)}</b> علب بسعر <b>${ar(p)}</b> ريالات للعلبة، وكيساً بـ <b>${ar(e)}</b> ريال. أي عبارة تعطي المبلغ كله؟`, `${ar(k)} × ${ar(p)} + ${ar(e)}`, [`${ar(k)} × (${ar(p)} + ${ar(e)})`, `${ar(k)} + ${ar(p)} × ${ar(e)}`, `(${ar(k)} + ${ar(p)}) × ${ar(e)}`], 'ثمن العلب (ضرب) ثم أضف الكيس.', 'Ps6')); }
      { const Q = pickN([[7, 2], [9, 4], [11, 4], [13, 2], [3, 4], [9, 2], [7, 4]], 1)[0];
        it.push(num(`${ar(Q[0])} ÷ ${ar(Q[1])} = ؟ (اكتب الناتج عدداً عشرياً)`, Q[0] / Q[1], 'الباقي يُقسم أيضاً: نصف = ٠٫٥، ربع = ٠٫٢٥.', 'Nc20')); }
      { const d = pickN([3, 4, 5], 1)[0], n = f(d * 2 + 1, d * 5 - 1, z => z % d !== 0), w = Math.floor(n / d), r = n % d;
        it.push(choice(`وزّع عادل <b>${ar(n)}</b> كعكات على <b>${ar(d)}</b> أطفال بالتساوي (ويمكن تقسيم الكعكة). نصيب كل طفل:`, mx(w, r, d), [mx(w, r, 10), mx(w + 1, r, d), mx(w, d - r === r ? (r % (d - 1)) + 1 : d - r, d)].filter((x, i, A) => A.indexOf(x) === i), `${ar(n)} ÷ ${ar(d)} = ${ar(w)} والباقي ${ar(r)}، والباقي يُقسم على ${ar(d)}.`, 'Nc20')); }
      { const dv = pickN([12, 15, 16, 18, 24], 1)[0], q = f(11, 39), n = dv * q; f.mark(n);
        it.push(num(`${ar(n)} ÷ ${ar(dv)} = ؟`, q, `جرّب مضاعفات ${ar(dv)}.`, 'Nc19', { dot: false })); }
      { let a, b, c; for (let t = 0; t < 100; t++) { a = R(3, 9); b = R(2, 5); c = R(2, 4); if (new Set([(a + b) * c, a + b * c, a * b + c]).size === 3) break; }
        it.push(match('صِل كل عبارة بقيمتها:', [[`(${ar(a)} + ${ar(b)}) × ${ar(c)}`, ar((a + b) * c)], [`${ar(a)} + ${ar(b)} × ${ar(c)}`, ar(a + b * c)], [`${ar(a)} × ${ar(b)} + ${ar(c)}`, ar(a * b + c)]].filter((p, i, A) => A.findIndex(q => q[1] === p[1]) === i), 'نفّذ الأقواس، ثم الضرب، ثم الجمع.', 'Nc17')); }
      { const a = f(10, 19), b = f(2, 6), c = f(2, 3), right = R(0, 1) === 1;
        it.push(tf(right ? `(${ar(a)} − ${ar(b)}) × ${ar(c)} = ${ar((a - b) * c)}` : `(${ar(a)} − ${ar(b)}) × ${ar(c)} = ${ar(a - b * c)}`, right, 'الأقواس أولاً.', 'Nc22', `(${ar(a)} − ${ar(b)}) × ${ar(c)} = ${ar(a - b)} × ${ar(c)} = ${ar((a - b) * c)}.`)); }
      return it;
    } },

  /* ٧. الكسور والقسمة: Nc21، Nc22، Pt5، Ps1 */
  fractionDiv: { who: 'latifa', title: 'تحدي صانعة الكعك', lines: [{ who: 'latifa', text: 'قسمت الكعك بعدل! كل واحد أخذ نصيبه.' }],
    make() {
      const f = fresh(), it = [];
      { const d = pickN([3, 4, 5, 6], 1)[0], n = d * f(3, 9);
        it.push(num(`${fr(1, d)} من <b>${ar(n)}</b> = ؟`, n / d, `اقسم ${ar(n)} على ${ar(d)}.`, 'Nc21', { dot: false })); }
      { const [k, d] = pickN([[3, 4], [2, 3], [3, 5], [5, 6], [2, 5]], 1)[0], n = d * f(3, 12);
        it.push(num(`${fr(k, d)} من <b>${ar(n)}</b> = ؟`, n / d * k, `أوجد ${fr(1, d)} أولاً (${ar(n)} ÷ ${ar(d)})، ثم اضرب في ${ar(k)}.`, 'Nc21', { dot: false })); }
      { const n = R(2, 4), d = n + R(1, 3);
        it.push(choice(`قسمت لطيفة <b>${ar(n)}</b> كعكات على <b>${ar(d)}</b> أطفال بالتساوي. نصيب كل طفل:`, fr(n, d), [fr(d, n), fr(1, d), fr(n, d + 1)], `${ar(n)} ÷ ${ar(d)} = ${fr(n, d)}.`, 'Nc21')); }
      { const ps = [[2, 30], [4, 32], [5, 45], [3, 36], [6, 42], [8, 48]];
        it.push(match('صِل كل كسر من عدد بالناتج:', shuffle(ps).slice(0, 3).map(([d, n]) => [`${fr(1, d)} من ${ar(n)}`, ar(n / d)]), 'اقسم العدد على المقام.', 'Nc21')); }
      { const n = f(4, 12) * 3, right = n * 2 / 3 > n / 2;
        it.push(tf(`${fr(2, 3)} من ${ar(n)} أكبر من نصف ${ar(n)}.`, right, `${fr(2, 3)} أكبر من ${fr(1, 2)} دائماً.`, 'Pt5', `${fr(2, 3)} من ${ar(n)} = ${ar(n * 2 / 3)}، والنصف ${ar(n / 2)}.`)); }
      { const n = f(4, 8) * 3;
        it.push(num(`في الصينية <b>${ar(n)}</b> قطعة كعك، أكل الضيوف ${fr(2, 3)} منها. كم قطعة بقيت؟`, n / 3, `بقي ${fr(1, 3)}.`, 'Ps1', { dot: false })); }
      { const [k, d] = pickN([[3, 5], [2, 7], [4, 9], [3, 8]], 1)[0], n = d * f(3, 7);
        it.push(choice(`لحساب ${fr(k, d)} من ${ar(n)}:`, `نقسم ${ar(n)} على ${ar(d)} ثم نضرب الناتج في ${ar(k)}`, [`نقسم ${ar(n)} على ${ar(k)} ثم نضرب في ${ar(d)}`, `نجمع ${ar(n)} و${ar(k)} و${ar(d)}`, `نطرح ${ar(k)} من ${ar(n)}`], 'المقام يقسم، والبسط يضرب.', 'Ps1')); }
      { const list = [[1, 2, 30], [1, 3, 36], [3, 4, 20], [1, 4, 28], [2, 5, 15], [3, 10, 50]].map(([k, d, n]) => ({ label: `${fr(k, d)} من ${ar(n)}`, bin: n / d * k > 10 ? 0 : 1 }));
        it.push(sort('صنّف حسب الناتج:', ['أكبر من ١٠', 'من ١٠ فأقل'], pickN(list, 6), 'احسب كل كسر من العدد.', 'Pt5')); }
      return it;
    } },

  /* ٨. النسب المئوية: Nn28، Nn29، Ps8 */
  percentages: { who: 'ghanim', title: 'تحدي تخفيضات العيد', lines: [{ who: 'ghanim', text: 'حسبت التخفيضات كلها! زبائن العيد سعداء.' }],
    make() {
      const f = fresh(), it = [];
      it.push(match('صِل كل كسر بالنسبة المئوية التي تساويه:', shuffle([[fr(1, 2), pc(50)], [fr(1, 4), pc(25)], [fr(1, 10), pc(10)], [fr(1, 100), pc(1)], [fr(3, 4), pc(75)]]).slice(0, 4), 'النسبة المئوية = عدد الأجزاء من ١٠٠.', 'Nn28'));
      { const n = f(12, 90) * 2;
        it.push(num(`${pc(50)} من <b>${ar(n)}</b> ريالاً = ؟`, n / 2, '٥٠٪ يعني النصف.', 'Nn29', { dot: false })); }
      { const n = f(5, 40) * 4;
        it.push(num(`${pc(25)} من <b>${ar(n)}</b> = ؟`, n / 4, '٢٥٪ يعني الربع.', 'Nn29', { dot: false })); }
      { const n = f(5, 99) * 10;
        it.push(num(`${pc(10)} من <b>${ar(n)}</b> = ؟`, n / 10, '١٠٪ يعني العُشر: اقسم على ١٠.', 'Nn29', { dot: false })); }
      { const p = f(4, 20) * 4, d = pickN([25, 50], 1)[0];
        it.push(num(`ثوب سعره <b>${ar(p)}</b> ريالاً، وعليه تخفيض <b>${pc(d)}</b>. كم سعره بعد التخفيض؟`, p - p * d / 100, `أوجد ${pc(d)} من ${ar(p)} ثم اطرحه من السعر.`, 'Ps8', { dot: false })); }
      { const k = f(11, 89, z => z % 10 !== 0);
        it.push(choice('ما النسبة المئوية للمربعات الملوّنة؟', pc(k), [pc(100 - k), pc(k + 10), pc(Math.round(k / 10))].filter(s => s !== pc(k)), 'عُدّ الصفوف الكاملة (كل صف ١٠) ثم المربعات الباقية.', 'Nn28', { art: hundred(k) })); }
      { const p = pickN([10, 20, 25, 50], 1)[0], n = f(2, 9) * 20, right = R(0, 1) === 1;
        it.push(tf(`${pc(p)} من ${ar(n)} = ${ar(right ? n * p / 100 : n * p / 100 + 5)}`, right, `${pc(p)} = ${fr(p / gcd(p, 100), 100 / gcd(p, 100))}.`, 'Nn29', `${pc(p)} من ${ar(n)} = ${ar(n * p / 100)}.`)); }
      { const L = shuffle([[.2, pc(20)], [.5, fr(1, 2)], [.7, dec(.7)], [.25, fr(1, 4)], [.9, pc(90)]]);
        it.push(order('رتّب من <b>الأصغر</b> إلى <b>الأكبر</b>:', L.map(([v, l]) => ({ v, label: l })), (p, q) => p.v - q.v, 'حوّل كل شيء إلى نسبة مئوية: ½ = ٥٠٪، ٠٫٧ = ٧٠٪.', 'Nn28')); }
      return it;
    } },

  /* ٩. النسبة والتناسب: Nn30، Pt1، Ps4 */
  ratioProportion: { who: 'shamsa', title: 'تحدي خلطة الحلوى', lines: [{ who: 'shamsa', text: 'الخلطة متناسبة تماماً! طعمها كما يجب.' }],
    make() {
      const f = fresh(), it = [];
      { const s = f(2, 3), fl = f(4, 5), k = f(3, 5);
        it.push(num(`لكل <b>${ar(fl)}</b> أكواب طحين نضع <b>${ar(s)}</b> كوب سكر. كم كوب سكر نضع مع <b>${ar(fl * k)}</b> كوب طحين؟`, s * k, `${ar(fl * k)} = ${ar(k)} أضعاف ${ar(fl)}.`, 'Nn30', { dot: false })); }
      { const per = f(2, 4);
        it.push(match(`جدول الخلطة: لكل كيلوغرام من التمر نحتاج <b>${ar(per)}</b> أكواب ماء. صِل:`, [2, 3, 5, 6].map(n => [`${ar(n)} كغم تمر`, `${ar(n * per)} أكواب`]), 'اضرب في عدد الأكواب لكل كيلوغرام.', 'Ps4')); }
      { const a = f(2, 4), b = f(3, 6, z => z !== a), k = f(3, 6);
        it.push(choice(`لكل <b>${ar(a)}</b> علب حمراء توجد <b>${ar(b)}</b> علب زرقاء. إذا كان عندنا <b>${ar(a * k)}</b> علبة حمراء، فكم الزرقاء؟`, ar(b * k), [ar(b + a * k - a), ar(a * k + b), ar(b * k + k)].filter(s => s !== ar(b * k)), `كم مرة ${ar(a)} في ${ar(a * k)}؟`, 'Nn30')); }
      { const n = f(3, 5), c = f(2, 4) * n, m = f(6, 9);
        it.push(num(`<b>${ar(n)}</b> علب حلوى ثمنها <b>${ar(c)}</b> ريالاً. كم ثمن <b>${ar(m)}</b> علب؟`, c / n * m, 'أوجد ثمن العلبة الواحدة أولاً.', 'Pt1', { dot: false })); }
      { const [a, b] = pickN([[2, 3], [3, 4], [1, 5], [2, 5]], 1)[0], k = R(3, 5);
        it.push(choice(`أي خلطة لها النسبة نفسها: <b>${ar(a)}</b> سكر لكل <b>${ar(b)}</b> طحين؟`, `${ar(a * k)} سكر لكل ${ar(b * k)} طحين`, [`${ar(a + k)} سكر لكل ${ar(b + k)} طحين`, `${ar(b * k)} سكر لكل ${ar(a * k)} طحين`, `${ar(a * k)} سكر لكل ${ar(b * k + 1)} طحين`], 'النسبة المتكافئة: نضرب العددين في العدد نفسه.', 'Nn30')); }
      { const [a, b] = pickN([[2, 3], [3, 5], [1, 4]], 1)[0], yes = [2, 3, 5].map(k => ({ label: `${ar(a * k)} : ${ar(b * k)}`, bin: 0 })), no = [[a * 2, b * 2 + 1], [a + 2, b + 2], [b, a]].map(([x, y]) => ({ label: `${ar(x)} : ${ar(y)}`, bin: 1 }));
        it.push(sort(`أي خلطة بالنسبة نفسها <b>${ar(a)} : ${ar(b)}</b>؟`, ['بالنسبة نفسها', 'نسبة مختلفة'], yes.concat(no), 'هل ضربنا العددين في العدد نفسه؟', 'Nn30')); }
      { const a = f(2, 4), b = f(5, 8), right = R(0, 1) === 1;
        it.push(tf(`إذا كانت <b>${ar(a)}</b> أكواب تكفي <b>${ar(b)}</b> أشخاص، فإن <b>${ar(a * 2)}</b> أكواب تكفي <b>${ar(right ? b * 2 : b + 2)}</b> أشخاص.`, right, 'ضاعفنا الأكواب: كم يتضاعف عدد الأشخاص؟', 'Nn30', `الضعف يكفي ${ar(b * 2)} أشخاص.`)); }
      { const w = f(1, 2), t = f(3, 5), m = f(2, 6);
        it.push(num(`خلطة شراب: لكل <b>${ar(w)}</b> كوب عصير نضع <b>${ar(t)}</b> أكواب ماء. صنعت شمسة خلطة فيها <b>${ar((w + t) * m)}</b> كوباً. كم كوب عصير فيها؟`, w * m, `كل ${ar(w + t)} أكواب من الخلطة فيها ${ar(w)} عصير: كم مجموعة من ${ar(w + t)} في ${ar((w + t) * m)}؟`, 'Ps4', { dot: false })); }
      return it;
    } },

  /* ١٠. الكسور: Nn21، Nn22، Nn24 */
  fractions: { who: 'raya', title: 'تحدي ريا', lines: [{ who: 'raya', text: 'تقارن الكسور وترتبها مثل خبيرة شوكولاتة!' }],
    make() {
      const f = fresh(), it = [];
      { const d = f(7, 12), a = R(1, d - 1); let b; do b = R(1, d - 1); while (b === a);
        it.push(choice('أي الكسرين أكبر؟', fr(Math.max(a, b), d), [fr(Math.min(a, b), d), 'متساويان'], 'المقام نفسه: قارن البسطين.', 'Nn21')); }
      { const [d1, k] = pickN([[4, 2], [3, 2], [5, 2], [4, 3], [3, 3]], 1)[0], d2 = d1 * k, a = R(1, d1 - 1), b = R(1, d2 - 1), A = a * k;
        if (A === b) it.push(choice(`قارن: ${fr(a, d1)} و${fr(b, d2)}`, 'متساويان', [`${fr(a, d1)} أكبر`, `${fr(b, d2)} أكبر`], `حوّل ${fr(a, d1)} إلى ${fr(A, d2)}.`, 'Nn21'));
        else it.push(choice(`قارن: ${fr(a, d1)} و${fr(b, d2)}`, A > b ? `${fr(a, d1)} أكبر` : `${fr(b, d2)} أكبر`, [A > b ? `${fr(b, d2)} أكبر` : `${fr(a, d1)} أكبر`, 'متساويان'], `حوّل ${fr(a, d1)} إلى أجزاء من ${ar(d2)}: ${fr(A, d2)}.`, 'Nn21')); }
      { const [n, d] = pickN([[1, 2], [1, 3], [2, 3], [1, 4]], 1)[0], yes = [2, 3, 4, 5].map(k => fr(n * k, d * k)), no = [fr(n * 2, d * 2 + 1), fr(n + 1, d + 1), fr(n * 3, d * 2)];
        it.push(multi(`اختر <b>كل</b> الكسور التي تكافئ ${fr(n, d)}:`, yes.concat(no), x => yes.includes(x), 'الكسر المكافئ: نضرب البسط والمقام في العدد نفسه.', 'Nn22')); }
      { const L = shuffle([[1, 8], [3, 8], [1, 2], [3, 4], [5, 8], [1, 4]]).slice(0, 5);
        it.push(order('رتّب قطع الشوكولاتة من <b>الأصغر</b> إلى <b>الأكبر</b>:', L.map(([n, d]) => ({ v: n / d, label: fr(n, d) })), (p, q) => p.v - q.v, 'حوّلها كلها إلى أثمان: ½ = ⁴⁄₈، ¼ = ²⁄₈.', 'Nn21')); }
      { const [n, d] = pickN([[3, 4], [2, 3], [3, 5], [5, 6], [1, 4]], 1)[0], k = f(2, 4);
        it.push(num(`${fr(n, d)} = ${fr('؟', d * k)}`, n * k, `المقام ضُرب في ${ar(k)}، فاضرب البسط في ${ar(k)} أيضاً.`, 'Nn22', { dot: false })); }
      { const w = R(0, 2), [n, d] = pickN([[1, 4], [3, 4], [1, 2], [1, 3], [2, 3]], 1)[0], v = w + n / d, opts = [[w, n, d], [w + 1, n, d], [w, d - n === n ? n : d - n, d], [Math.max(0, w - 1) === w ? w + 2 : w - 1, n, d]];
        it.push(choice('إلى أي عدد يشير السهم؟', mx(w, n, d), opts.slice(1).map(o => mx(...o)).filter(s => s !== mx(w, n, d)), `بين كل عددين كاملين ${ar(d === 2 ? 2 : d)} أقسام متساوية.`, 'Nn24', { art: nline(0, 3, v, 1 / d, d) })); }
      { const P = shuffle([[1, 2, 4, 8], [1, 3, 2, 6], [3, 4, 6, 8], [2, 5, 4, 10], [1, 4, 3, 12], [2, 3, 8, 12]]).slice(0, 4);
        it.push(match('صِل كل كسر بكسر يكافئه:', P.map(([a, b, c, d]) => [fr(a, b), fr(c, d)]), 'اضرب أو اقسم البسط والمقام في العدد نفسه.', 'Nn22')); }
      { const L = shuffle([[2, 3], [3, 8], [5, 6], [1, 5], [4, 10], [7, 10], [3, 4], [2, 8]]).slice(0, 6);
        it.push(sort('صنّف الكسور بالمقارنة مع النصف:', ['أكبر من ½', 'أصغر من ½'], L.map(([n, d]) => ({ label: fr(n, d), bin: n / d > .5 ? 0 : 1 })), 'قارن البسط بنصف المقام.', 'Nn21')); }
      return it;
    } },

  /* ١١. الأعداد الكسرية: Nn25، Nn26، Ps6 */
  mixedNumbers: { who: 'humaid', title: 'تحدي حارس البراميل', lines: [{ who: 'humaid', text: 'تحوّل الكسور كما أملأ البراميل! أحسنت.' }],
    make() {
      const f = fresh(), it = [];
      { const d = pickN([3, 4, 5], 1)[0], n = f(d + 1, 4 * d - 1, z => z % d !== 0 && gcd(z % d, d) === 1), w = Math.floor(n / d), r = n % d;
        it.push(choice(`اكتب ${fr(n, d)} عدداً كسرياً:`, mx(w, r, d), [mx(w + 1, r, d), mx(w, d - r === r ? (r % 2) + 1 : d - r, d), mx(r, w, d)].filter((x, i, A) => A.indexOf(x) === i && x !== mx(w, r, d)), `كم مرة ${ar(d)} في ${ar(n)}؟ والباقي يبقى بسطاً.`, 'Nn25')); }
      { const d = pickN([3, 4, 5, 6], 1)[0], w = f(2, 4), r = R(1, d - 1);
        it.push(num(`${mx(w, r, d)} = ${fr('؟', d)}`, w * d + r, `${ar(w)} × ${ar(d)} + ${ar(r)}.`, 'Nn25', { dot: false })); }
      { const [n, d] = pickN([[6, 8], [9, 12], [10, 15], [8, 12], [4, 10], [12, 16]], 1)[0], [a, b] = simp(n, d);
        it.push(choice(`اختصر ${fr(n, d)} إلى أبسط صورة:`, fr(a, b), [fr(n / 2, d / 2) === fr(a, b) ? fr(a + 1, b) : fr(n / 2, d / 2), fr(b, a), fr(a, b + 1)].filter(x => x !== fr(a, b)), 'اقسم البسط والمقام على أكبر عدد يقسمهما معاً.', 'Nn26')); }
      { const ps = []; for (let t = 0; ps.length < 4 && t < 200; t++) { const d = pickN([2, 3, 4, 5], 1)[0], n = R(d + 1, 3 * d), r = n % d; const m = mx(Math.floor(n / d), r, d); if (!r || gcd(n, d) !== 1 || ps.some(p => p[0] === fr(n, d) || p[1] === m)) continue; ps.push([fr(n, d), m]); }
        it.push(match('صِل كل كسر غير اعتيادي بالعدد الكسري الذي يساويه:', ps, 'اقسم البسط على المقام.', 'Nn25')); }
      { const yes = shuffle([[3, 4], [2, 5], [5, 7], [1, 6], [4, 9]]).slice(0, 3), no = shuffle([[2, 4], [6, 9], [4, 10], [3, 12], [5, 15]]).slice(0, 3);
        it.push(multi('اختر <b>كل</b> الكسور المكتوبة في <b>أبسط صورة</b>:', yes.concat(no).map(([n, d]) => fr(n, d)), x => yes.some(([n, d]) => fr(n, d) === x), 'في أبسط صورة: لا يوجد عدد (غير ١) يقسم البسط والمقام معاً.', 'Nn26')); }
      { const [n, d] = pickN([[12, 16], [15, 20], [18, 24], [14, 21], [20, 25]], 1)[0], [a, b] = simp(n, d);
        it.push(num(`${fr(n, d)} = ${fr('؟', b)} في أبسط صورة. ما البسط؟`, a, `اقسم على ${ar(d / b)}.`, 'Nn26', { dot: false })); }
      { const k = f(5, 9), [p, q] = pickN([[3, 4], [2, 3], [1, 2]], 1)[0], tot = k * p, w = Math.floor(tot / q), r = tot % q;
        it.push(choice(`<b>${ar(k)}</b> براميل، في كل برميل ${fr(p, q)} من الماء. إذا جمعنا الماء كله، كم برميلاً يملأ؟`, mx(w, r, q), [mx(w + 1, r, q), fr(tot, q * k), mx(w, r, q * 2)].filter(x => x !== mx(w, r, q)), `${ar(k)} × ${fr(p, q)} = ${fr(tot, q)}، ثم حوّله إلى عدد كسري.`, 'Ps6')); }
      { const L = shuffle([[5, 4], [7, 3], [3, 2], [9, 4], [8, 3]]).slice(0, 4), lab = ([n, d], i) => i % 2 ? fr(n, d) : mx(Math.floor(n / d), n % d, d);
        it.push(order('رتّب من <b>الأصغر</b> إلى <b>الأكبر</b>:', L.map((x, i) => ({ v: x[0] / x[1], label: lab(x, i) })), (p, q) => p.v - q.v, 'حوّلها كلها إلى أعداد كسرية ثم قارن.', 'Nn25')); }
      return it;
    } },

  /* ١٢. الكسور والكسور العشرية: Nn23، Nn27، Nn28 */
  decimalFractions: { who: 'umkhalid', title: 'تحدي خزانات البيوت', lines: [{ who: 'umkhalid', text: 'كل خزان امتلأ بالمقدار الصحيح! شكراً لك.' }],
    make() {
      const f = fresh(), it = [];
      it.push(match('صِل كل كسر بالعدد العشري الذي يساويه:', shuffle([[fr(1, 2), dec(.5)], [fr(1, 4), dec(.25)], [fr(3, 4), dec(.75)], [fr(1, 10), dec(.1)], [fr(1, 5), dec(.2)], [fr(3, 10), dec(.3)]]).slice(0, 4), 'حوّل الكسر إلى أجزاء من ١٠ أو ١٠٠.', 'Nn23'));
      { const [n, d] = pickN([[3, 8], [1, 8], [5, 8], [7, 8], [3, 4], [1, 4]], 1)[0];
        it.push(num(`${ar(n)} ÷ ${ar(d)} = ؟ (اكتب الناتج عدداً عشرياً)`, n / d, `الكسر ${fr(n, d)} يعني ${ar(n)} ÷ ${ar(d)}.`, 'Nn27')); }
      { const n = f(1, 9);
        it.push(num(`اكتب ${fr(n, 10)} عدداً عشرياً:`, n / 10, 'أجزاء من عشرة: رقم واحد بعد الفاصلة.', 'Nn23')); }
      { const [n, a, b] = pickN([[35, 7, 20], [45, 9, 20], [15, 3, 20], [8, 2, 25], [6, 3, 50], [64, 16, 25]], 1)[0];
        it.push(choice(`اكتب <b>${dec(n / 100)}</b> كسراً في أبسط صورة:`, fr(a, b), [fr(n, 10), fr(a, b * 2), fr(b, a)].filter(x => x !== fr(a, b)), `${dec(n / 100)} = ${fr(n, 100)}، ثم اختصر.`, 'Nn23')); }
      { const L = shuffle([[.3, dec(.3)], [.5, fr(1, 2)], [.25, fr(1, 4)], [.8, dec(.8)], [.65, dec(.65)]]);
        it.push(order('رتّب كميات الماء من <b>الأقل</b> إلى <b>الأكثر</b>:', L.map(([v, l]) => ({ v, label: l })), (p, q) => p.v - q.v, 'حوّل الكسور إلى أعداد عشرية.', 'Nn23')); }
      { const v = f(11, 99, z => z % 10 !== 0);
        it.push(num(`${dec(v / 100)} = ؟٪`, v, 'العدد العشري × ١٠٠ = النسبة المئوية.', 'Nn28', { dot: false })); }
      { const yes = shuffle([dec(.5), fr(2, 4), pc(50), fr(5, 10), fr(3, 6)]).slice(0, 3), no = shuffle([dec(.05), fr(1, 5), pc(5), fr(5, 100), dec(.15)]).slice(0, 3);
        it.push(sort('أي الكميات تساوي <b>النصف</b>؟', ['تساوي النصف', 'لا تساويه'], yes.map(l => ({ label: l, bin: 0 })).concat(no.map(l => ({ label: l, bin: 1 }))), 'النصف = ٠٫٥ = ٥٠٪.', 'Nn28')); }
      { const S = pickN([[`${dec(.25)} = ${fr(1, 4)}`, true, '٠٫٢٥ = ٢٥ جزءاً من ١٠٠ = ربع.'], [`${dec(.4)} = ${fr(1, 4)}`, false, '٠٫٤ = ⁴⁄₁₀ = ⅖.'], [`${fr(3, 4)} = ${dec(.75)}`, true, '٣ ÷ ٤ = ٠٫٧٥.'], [`${fr(1, 5)} = ${dec(.5)}`, false, '١ ÷ ٥ = ٠٫٢.']], 1)[0];
        it.push(tf(S[0], S[1], 'اقسم البسط على المقام.', 'Nn23', S[2])); }
      return it;
    } }
};

/* ── أنواع تفاعلية إضافية (خط أعداد بسهم، ذاكرة، اكتشف الخطأ): جولة تاسعة في بعض الدروس ── */
const addRound = (id, f) => { const m = CH[id].make; CH[id].make = () => { const it = m(); it.push(f()); return it; }; };

addRound('fractions', () => { const k = pickN([1, 3, 5, 6, 7], 1)[0];
  return line(`اسحب السهم إلى ${k < 4 ? fr(k, 4) : mx(Math.floor(k / 4), k % 4, 4)}:`, 0, 2, k / 4, Array.from({ length: 9 }, (_, i) => ({ v: i / 4, l: i % 4 ? '' : ar(i / 4) })), .06, 'بين كل عددين كاملين أربعة أرباع.', 'Nn24'); });
addRound('percentages', () => memory('لعبة الذاكرة: طابق كل كسر بنسبته المئوية:', [[fr(1, 2), pc(50)], [fr(1, 4), pc(25)], [fr(3, 4), pc(75)], [fr(1, 10), pc(10)]], 'النسبة المئوية: كم جزءاً من ١٠٠.', 'Nn28'));
addRound('decimalFractions', () => memory('لعبة الذاكرة: طابق كل كسر بعدده العشري:', pickN([[fr(1, 2), dec(.5)], [fr(1, 4), dec(.25)], [fr(1, 5), dec(.2)], [fr(3, 10), dec(.3)], [fr(3, 4), dec(.75)]], 4), 'اقسم البسط على المقام.', 'Nn23'));

