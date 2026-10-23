// الصف السابع — ورشة المجسمات (الوحدة ١٥ في كتاب الفصل الثاني: العبارات الجبرية والصيغ، و١٦: الرسوم البيانية، و١٧: الحجم ومساحة السطح).
// تسع محطات في ورشة البنّاء: ألواح الأرضية وجداول الخلطة، ثم مخطط الموقع وخيوط الشاقول وسكة العربة ومنحدر الرافعة على المستوى الإحداثي،
// ثم قوالب الخرسانة وتغليف الصناديق وطلاء المجسمات. الجولات من missions/g7/kit.js.
import { ar } from '../../core/util.js';
import { mission, R, shuf, opts } from './kit.js';
import { pt, solidNet } from '../../content/chGeo.js';
import { plane, cuboid } from '../../content/g7/geo7.js';
import { E, } from '../../content/g7/challenges2.js';
import { E2, lineEq, QUAD } from '../../content/g7/challenges9.js';

/* المحطات: أماكن محطات الخامس التسع في الورشة نفسها (فُحصت بالتصادم واللقطات)، واللافتة في الجهة نفسها */
export const ST7W = {
  floor: { x: 526, y: 5719 },     // محسن: ألواح الأرضية
  mix: { x: 948, y: 5719 },       // حمود: جداول الخلطة
  site: { x: 1786, y: 5718 },     // آمنة: مخطط الموقع
  plumb: { x: 2206, y: 5718 },    // زينب: خيوط الشاقول
  rail: { x: 1306, y: 5898 },     // جابر: سكة العربة
  ramp: { x: 888, y: 5899 },      // محسن: منحدر الرافعة
  molds: { x: 466, y: 5899 },     // حمود: قوالب الخرسانة
  wrap: { x: 2146, y: 5898 },     // آمنة: تغليف الصناديق
  paint: { x: 1726, y: 5898 }     // جابر: طلاء المجسمات
};
const N = ar;
const big = s => `<div class="g7big">${s}</div>`;
const svg = s => `<div class="g7svg">${s}</div>`;
const nz = (a, b) => { const v = R(a, b); return v === 0 ? b : v; };
const NEG = { dot: false, neg: true };

/* ═══ ١٥-١ فك الأقواس وترتيب العمليات — «ألواح الأرضية» ═══ */
export const expand7b = mission({
  id: 'expand7b', giver: 'mohsen', st: ST7W.floor, key: 'floor', label: '🧱 ألواح الأرضية', icon: '🧱', bg: '#2F5C9E', side: 1,
  intro: n => [{ who: 'mohsen', text: `أهلاً يا ${n}! نحسب ألواح أرضية البيت بعبارات فيها أقواس وقوى.` },
    { who: 'mohsen', text: 'الأقواس أولاً، ثم القوى، ثم الضرب والقسمة، ثم الجمع والطرح. والعدد أمام القوس يُضرب في كل حد بإشارته.' }],
  goal: '🧱 احسب ألواح أرضية محسن', end: 'الأرضية مكتملة! ترتيب العمليات واحد في الأعداد والجبر.',
  make() {
    const a = R(2, 9), b = R(2, 5), c = R(2, 4), k = -R(2, 5), p = R(2, 5), q = -R(1, 9), right = E2([[k * p, 'س'], [k * q]]), x = R(2, 5), y = R(2, 6), z = R(2, 4), w = R(1, 6);
    return [{ t: 'kp', a, b, c, ans: a + b * c * c, dot: false }, { t: 'pick', k, p, q, col: 0, opts: opts(right, [E2([[k * p, 'س'], [q]]), E2([[k * p, 'س'], [-k * q]]), E2([[p, 'س'], [k * q]]), E2([[k + p, 'س'], [k * q]])]), ans: right },
      { t: 'kp', x, y, z, w, ans: x + z, dot: false }];
  },
  view(r) {
    if (r.a) return { text: `عدد ألواح الغرفة: <b>${N(r.a)} + ${N(r.b)} × ${N(r.c)}²</b>. كم لوحاً؟`, visual: big('🧱'), hint: 'القوة أولاً، ثم الضرب، ثم الجمع.', bad: v => v === (r.a + r.b) * r.c * r.c ? 'جمعتَ قبل الضرب والقوة: القوة أولاً ثم الضرب.' : v === r.a + (r.b * r.c) ** 2 ? 'القوة على العدد ' + N(r.c) + ' وحده، لا على حاصل الضرب.' : null };
    if (r.k) return { text: `فُكّ أقواس عبارة الحافة: <b>${N(r.k)}(${E([[r.p, 'س'], [r.q]])})</b>`, visual: big('📐'), hint: `اضرب ${N(r.k)} (بإشارته السالبة) في كل حد: سالب × سالب = موجب.` };
    const k = r.x * r.y - r.z * r.w;
    return { text: `بسّط: <b>${N(r.x)}(س + ${N(r.y)}) + ${N(r.z)}(س − ${N(r.w)})</b> = ؟س${k ? ` ${k < 0 ? '−' : '+'} ${N(Math.abs(k))}` : ''}. ما معامل س؟`, visual: big('🧮'), hint: 'فُكّ القوسين، ثم اجمع حدود س.' };
  }
});

/* ═══ ١٥-٢ استنتاج واستخدام الصيغ — «جداول الخلطة» ═══ */
export const formulas7b = mission({
  id: 'formulas7b', giver: 'hamood', st: ST7W.mix, key: 'mix', label: '🪣 جداول الخلطة', icon: '🪣', bg: '#E3742B', side: 1,
  intro: n => [{ who: 'hamood', text: `يا ${n}! خلطات الإسمنت تتغير مع درجة الحرارة، ولكل خلطة صيغة.` },
    { who: 'hamood', text: 'عوّض بالعدد بإشارته، وتذكّر: مربع السالب موجب، ومكعبه سالب.' }],
  goal: '🪣 املأ جداول خلطة حمود', end: 'الجداول مكتملة! التعويض بالإشارة يعطي الجواب الصحيح.',
  make() {
    const a = R(2, 5), b = R(1, 9), x = -R(1, 6), c = R(2, 4), d = R(1, 9), y = -R(2, 4), e = R(2, 5), g = R(1, 9), z = R(2, 9);
    return [{ t: 'kp', a, b, x, ans: a * x + b, neg: true, dot: false }, { t: 'kp', c, d, y, ans: c * y * y + d, neg: true, dot: false }, { t: 'kp', e, g, v: e * z + g, ans: z, dot: false }];
  },
  view(r) {
    if (r.x != null) return { text: `كمية الماء (لتر): <b>م = ${E([[r.a, 'ح'], [r.b]])}</b>، ودرجة الحرارة ح = <b>${N(r.x)}</b>. كم لتراً؟`, visual: big(`${N(r.a)} × (${N(r.x)}) + ${N(r.b)}`), hint: 'اضرب المعامل في العدد السالب (الناتج سالب)، ثم أضف.', bad: v => v === r.a * -r.x + r.b ? 'نسيتَ الإشارة السالبة.' : null };
    if (r.y != null) return { text: `صيغة الإسمنت: <b>${E([[r.c, 'س²'], [r.d]])}</b>. احسبها حين س = <b>${N(r.y)}</b>.`, visual: big(`${N(r.c)} × (${N(r.y)})² + ${N(r.d)}`), hint: 'ربّع س أولاً: (سالب)² موجب. ثم اضرب ثم أضف.', bad: v => v === -r.c * r.y * r.y + r.d ? 'مربع العدد السالب موجب.' : v === (r.c * r.y) ** 2 + r.d ? 'القوة على س وحدها قبل الضرب في المعامل.' : null };
    return { text: `الخلطة تتبع <b>ص = ${E([[r.e, 'س'], [r.g]])}</b>، واحتجنا ص = <b>${N(r.v)}</b>. كم س؟`, visual: big(`${N(r.v)} = ${E([[r.e, 'س'], [r.g]])}`), hint: 'عوّض ص ثم حلّ: اطرح الثابت ثم اقسم على المعامل.' };
  }
});

/* ═══ ١٦-١ تحديد مواضع الإحداثيات — «مخطط الموقع» ═══ */
const QS = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'];
export const coords7 = mission({
  id: 'coords7', giver: 'amna', st: ST7W.site, key: 'site', label: '🗺️ مخطط الموقع', icon: '🗺️', bg: '#8B5A2B', side: 1,
  intro: n => [{ who: 'amna', text: `أهلاً يا ${n}! مخطط موقع البناء شبكة إحداثيات بأرباعها الأربعة، والبوابة عند الأصل.` },
    { who: 'amna', text: 'الإحداثي الأول أفقي (س) والثاني رأسي (ص)، والسالب يسار الأصل أو تحته.' }],
  goal: '🗺️ حدّد مواقع آمنة', end: 'المخطط دقيق! (س، ص): أفقياً أولاً ثم رأسياً، والإشارات تحدد الربع.',
  make() {
    const x = nz(-4, 4), y = nz(-4, 4), right = pt(x, y), u = nz(-6, 6), v = nz(-6, 6), x1 = -R(1, 4), x2 = R(1, 4), y1 = -R(1, 4), y2 = R(1, 4);
    return [{ t: 'pick', x, y, opts: opts(right, [pt(y, x), pt(-x, y), pt(x, -y), pt(-x, -y)]), ans: right }, { t: 'pick', u, v, opts: QS.slice(), ans: QUAD(u, v) }, { t: 'kp', x1, x2, y1, y2, ans: x1, ...NEG }];
  },
  view(r) {
    if (r.x != null) return { text: 'ركّز العمال وتداً عند النقطة أ. ما إحداثياتها؟', visual: svg(plane({ n: 5, pts: [{ x: r.x, y: r.y, l: 'أ' }] })), hint: 'تحرّك من الأصل أفقياً أولاً (س)، ثم رأسياً (ص)، وانتبه لجهة السالب.' };
    if (r.u != null) return { text: `الرافعة عند النقطة <b>${pt(r.u, r.v)}</b>. في أي ربع تقع؟`, visual: svg(plane({ n: 6 })), hint: 'الأول (+، +)، الثاني (−، +)، الثالث (−، −)، الرابع (+، −).' };
    return { text: `ثلاثة أركان لأساس مستطيل: ${pt(r.x1, r.y1)} و${pt(r.x2, r.y1)} و${pt(r.x2, r.y2)}. ما الإحداثي السيني للركن الرابع؟`, visual: svg(plane({ n: 5, pts: [{ x: r.x1, y: r.y1 }, { x: r.x2, y: r.y1 }, { x: r.x2, y: r.y2 }] })), hint: 'الركن الرابع فوق الركن الأول مباشرة: له الإحداثي السيني نفسه.' };
  }
});

/* ═══ ١٦-٢ الخطوط الموازية للمحاور — «خيوط الشاقول» ═══ */
export const axisLines7 = mission({
  id: 'axisLines7', giver: 'zainab', st: ST7W.plumb, key: 'plumb', label: '📏 خيوط الشاقول', icon: '📏', bg: '#7B3F98', side: 1,
  intro: n => [{ who: 'zainab', text: `يا ${n}! نشدّ خيوط الشاقول رأسية، وخيوط المستوى أفقية، على مخطط الموقع.` },
    { who: 'zainab', text: 'الخط الرأسي معادلته س = عدد، والأفقي معادلته ص = عدد.' }],
  goal: '📏 شدّ خيوط زينب', end: 'الخيوط مشدودة! س = ك رأسي، وص = ك أفقي.',
  make() {
    const k = nz(-4, 4), j = nz(-4, 4), a = nz(-4, 4), b = nz(-4, 4), ri = pt(a, b);
    return [{ t: 'pick', k, opts: opts(`س = ${N(k)}`, [`ص = ${N(k)}`, `س = ${N(-k)}`, `ص = ${N(-k)}`]), ans: `س = ${N(k)}` }, { t: 'pick', j, opts: opts(`ص = ${N(j)}`, [`س = ${N(j)}`, `ص = ${N(-j)}`, `س = ${N(-j)}`]), ans: `ص = ${N(j)}` },
      { t: 'pick', a, b, opts: opts(ri, [pt(b, a), pt(a, 0), pt(0, b), pt(-a, b)]), ans: ri }];
  },
  view(r) {
    if (r.k != null) return { text: 'ما معادلة خيط الشاقول الرأسي المرسوم؟', visual: svg(plane({ n: 5, lines: [{ x: r.k, col: '#1E4FBF' }] })), hint: 'كل نقاط الخط الرأسي لها الإحداثي السيني نفسه.' };
    if (r.j != null) return { text: 'ما معادلة خيط المستوى الأفقي المرسوم؟', visual: svg(plane({ n: 5, lines: [{ y: r.j }] })), hint: 'كل نقاط الخط الأفقي لها الإحداثي الصادي نفسه.' };
    return { text: `شدّت زينب خيطين: <b>س = ${N(r.a)}</b> و<b>ص = ${N(r.b)}</b>. أين يتقاطعان؟`, visual: svg(plane({ n: 5, lines: [{ x: r.a, col: '#1E4FBF' }, { y: r.b }] })), hint: 'نقطة التقاطع على الخطين معاً: إحداثيها السيني من الأول والصادي من الثاني.' };
  }
});

/* ═══ ١٦-٣ رسم مخططات بيانية للمعادلات — «سكة العربة» ═══ */
export const graphEq7 = mission({
  id: 'graphEq7', giver: 'jaber', st: ST7W.rail, key: 'rail', label: '🛤️ سكة العربة', icon: '🛤️', bg: '#E3B04B', side: 1,
  intro: n => [{ who: 'jaber', text: `أهلاً يا ${n}! نمدّ سكة لعربة الطوب على مخطط الموقع، وتتبع السكة معادلة.` },
    { who: 'jaber', text: 'نكتب جدول قيم: نختار س ونحسب ص، ثم نصل النقاط فنحصل على خط مستقيم.' }],
  goal: '🛤️ مُدّ سكة جابر', end: 'السكة ممدودة! جدول القيم يعطي نقاطاً على خط مستقيم.',
  make() {
    const m = R(2, 4), c = nz(-5, 5), x = -R(1, 3), m2 = shuf([1, 2, -1])[0]; let c2 = nz(-2, 2); if (m2 < 0) c2 = Math.abs(c2);
    const right = lineEq(m2, c2), c3 = R(2, 6), L = [[0, c3], [1, c3 - 1], [2, c3 - 2], [3, c3], [-1, c3 + 2]];
    return [{ t: 'kp', m, c, x, ans: m * x + c, ...NEG }, { t: 'pick', m: m2, c: c2, col: 0, opts: opts(right, [lineEq(m2, -c2 || 1), lineEq(m2 + 1, c2), lineEq(m2 * 2, c2), lineEq(1 - m2, c2 + 1)]), ans: right, gr: 1 },
      { t: 'multi', c: c3, opts: L.map(p => pt(p[0], p[1])), ok: L.filter(([a, b]) => b === c3 - a).map(p => pt(p[0], p[1])) }];
  },
  view(r) {
    if (r.gr) return { text: 'ما معادلة السكة المرسومة؟', visual: svg(plane({ n: 5, lines: [{ m: r.m, c: r.c }] })), hint: 'أين تقطع السكة محور الصادات؟ وكم ترتفع (أو تنخفض) لكل خطوة يميناً؟' };
    if (r.ok) return { text: `اختر كل نقطة تقع على السكة <b>ص = ${N(r.c)} − س</b>:`, visual: big('🛤️'), hint: 'عوّض س في المعادلة: هل يساوي الناتج الإحداثي الصادي؟', bad: g => g.length < r.ok.length ? 'بقيت نقطة على السكة لم تخترها.' : null };
    return { text: `جدول قيم السكة <b>${lineEq(r.m, r.c)}</b>: حين س = ${N(r.x)}، ص = ؟`, visual: big(`${N(r.m)} × (${N(r.x)}) ${r.c < 0 ? '−' : '+'} ${N(Math.abs(r.c))}`), hint: 'عوّض س بإشارتها السالبة، ثم احسب.' };
  }
});

/* ═══ ١٦-٤ المعادلات في صورة ص = م س + جـ — «منحدر الرافعة» ═══ */
export const ymxc7 = mission({
  id: 'ymxc7', giver: 'mohsen', st: ST7W.ramp, key: 'ramp', label: '🏗️ منحدر الرافعة', icon: '🏗️', bg: '#2F6FB2', side: 1,
  intro: n => [{ who: 'mohsen', text: `يا ${n}! منحدر الرافعة خط مستقيم، ومعادلته على صورة ص = م س + جـ.` },
    { who: 'mohsen', text: 'م ميل الخط (كم يرتفع لكل خطوة)، وجـ نقطة قطعه لمحور الصادات.' }],
  goal: '🏗️ اضبط منحدر محسن', end: 'المنحدر مضبوط! م للانحدار، وجـ لنقطة البداية على محور الصادات.',
  make() {
    let m = nz(-5, 6), c = nz(-8, 8); if (m < 0 && c < 0) c = -c; let m2 = nz(-5, 6), c2 = nz(-8, 8); if (m2 < 0 && c2 < 0) c2 = -c2;
    const m3 = R(2, 4), c3 = nz(-5, 5), right = lineEq(m3, c3);
    return [{ t: 'kp', m, c, ans: m, ...NEG }, { t: 'kp', m: m2, c: c2, ans: c2, ...NEG, cut: 1 }, { t: 'pick', m: m3, c: c3, opts: opts(right, [lineEq(c3, m3), lineEq(m3, -c3), lineEq(m3 + 1, c3)]), ans: right }];
  },
  view(r) {
    if (r.opts) return { text: `منحدر جديد ميله <b>${N(r.m)}</b> ويقطع محور الصادات عند <b>${N(r.c)}</b>. ما معادلته؟`, visual: big('ص = م س + جـ'), hint: 'ضع الميل مكان م، ونقطة القطع مكان جـ.' };
    if (r.cut) return { text: `المنحدر <b>${lineEq(r.m, r.c)}</b>. عند أي قيمة لـ ص يقطع محور الصادات؟`, visual: svg(plane({ n: Math.max(5, Math.abs(r.c) + 1), lines: [{ m: r.m, c: r.c }] })), hint: 'محور الصادات حيث س = ٠: يبقى الثابت جـ وحده.', bad: v => v === r.m ? 'هذا الميل م: المطلوب جـ.' : null };
    return { text: `المنحدر <b>${lineEq(r.m, r.c)}</b>. ما ميله م؟`, visual: big('🏗️ ⟋'), hint: 'الميل م هو معامل س.', bad: v => v === r.c ? 'هذا الثابت جـ (نقطة القطع): الميل معامل س.' : v === -r.m ? 'انتبه للإشارة.' : null };
  }
});

/* ═══ ١٧-١ حساب حجم متوازي المستطيلات — «قوالب الخرسانة» ═══ */
export const volume7 = mission({
  id: 'volume7', giver: 'hamood', st: ST7W.molds, key: 'molds', label: '🧊 قوالب الخرسانة', icon: '🧊', bg: '#5E6B78', side: -1,
  intro: n => [{ who: 'hamood', text: `أهلاً يا ${n}! نصبّ الخرسانة في قوالب على شكل متوازي مستطيلات.` },
    { who: 'hamood', text: 'الحجم = الطول × العرض × الارتفاع، ويُقاس بوحدات مكعبة. و١٠٠٠ سم³ = ١ لتر.' }],
  goal: '🧊 املأ قوالب حمود', end: 'القوالب ممتلئة! الحجم ثلاثة أبعاد مضروبة.',
  make() {
    const l = R(4, 12), w = R(2, 8), h = R(2, 9), l2 = R(4, 10), w2 = R(2, 6), h2 = R(2, 9), L = shuf([10, 20, 25])[0], H = shuf([10, 20])[0];
    return [{ t: 'kp', l, w, h, ans: l * w * h, dot: false }, { t: 'kp', V: l2 * w2 * h2, l: l2, w: w2, ans: h2, dot: false }, { t: 'kp', L, H, ans: L * 10 * H / 1000 }];
  },
  view(r) {
    if (r.V) return { text: `قالب حجمه <b>${N(r.V)} سم³</b>، طوله ${N(r.l)} سم وعرضه ${N(r.w)} سم. كم ارتفاعه؟`, visual: big(`${N(r.V)} ÷ (${N(r.l)} × ${N(r.w)})`), hint: 'الارتفاع = الحجم ÷ (الطول × العرض).' };
    if (r.L) return { text: `خزان ماء الخلطة أبعاده ${N(r.L)} سم × ١٠ سم × ${N(r.H)} سم. كم لتراً يتسع؟`, visual: svg(cuboid(r.L, 10, r.H)), hint: 'احسب الحجم بالسنتيمتر المكعب، ثم اقسم على ١٠٠٠.', bad: v => v === r.L * 10 * r.H ? 'هذا بالسنتيمتر المكعب: اقسم على ١٠٠٠ لتحصل على اللترات.' : null };
    return { text: 'كم سنتيمتراً مكعباً من الخرسانة يملأ هذا القالب؟', visual: svg(cuboid(r.l, r.w, r.h)), hint: 'اضرب الأبعاد الثلاثة.', bad: v => v === 2 * (r.l * r.w + r.l * r.h + r.w * r.h) ? 'هذه مساحة السطح: الحجم ضرب الأبعاد الثلاثة.' : v === r.l + r.w + r.h ? 'جمعتَ الأبعاد: الحجم حاصل ضربها.' : null };
  }
});

/* ═══ ١٧-٢ مساحة سطح المكعب ومتوازي المستطيلات — «تغليف الصناديق» ═══ */
export const surfaceArea7 = mission({
  id: 'surfaceArea7', giver: 'amna', st: ST7W.wrap, key: 'wrap', label: '🎁 تغليف الصناديق', icon: '🎁', bg: '#7B3F98', side: 1,
  intro: n => [{ who: 'amna', text: `يا ${n}! نغلّف صناديق الأدوات بورق مقوّى، ونحتاج مساحة السطح بالضبط.` },
    { who: 'amna', text: 'مساحة السطح مجموع مساحات الأوجه الستة؛ والأوجه المتقابلة متطابقة.' }],
  goal: '🎁 غلّف صناديق آمنة', end: 'الصناديق مغلّفة بلا هدر! ٦ أوجه، كل وجهين متقابلين متطابقان.',
  make() {
    const s = R(2, 9), l = R(3, 10), w = R(2, 6), h = R(2, 6), t = R(2, 7);
    return [{ t: 'kp', s, ans: 6 * s * s, dot: false }, { t: 'kp', l, w, h, ans: 2 * (l * w + l * h + w * h), dot: false }, { t: 'kp', A: 6 * t * t, ans: t, dot: false }];
  },
  view(r) {
    if (r.A) return { text: `صندوق مكعب احتاج <b>${N(r.A)} سم²</b> من الورق تماماً. كم طول ضلعه؟`, visual: big(`${N(r.A)} ÷ ٦ = ؟²`), hint: 'اقسم على ٦ لتجد مساحة الوجه الواحد، ثم ابحث عن العدد الذي مربعه يساويها.' };
    if (r.l) return { text: 'كم سنتيمتراً مربعاً من الورق يغلّف هذا الصندوق؟', visual: svg(cuboid(r.l, r.w, r.h)), hint: '٢ × (ط × ع + ط × ر + ع × ر).', bad: v => v === r.l * r.w * r.h ? 'هذا الحجم: الغلاف يغطي الأوجه (مساحة السطح).' : v === r.l * r.w + r.l * r.h + r.w * r.h ? 'حسبتَ ثلاثة أوجه فقط: لكل وجه وجه مقابل.' : null };
    return { text: `صندوق مكعب طول ضلعه <b>${N(r.s)} سم</b>. كم سنتيمتراً مربعاً من الورق يغلّفه؟`, visual: big('🎁'), hint: 'للمكعب ٦ أوجه مربعة متطابقة: ٦ × الضلع × الضلع.', bad: v => v === r.s ** 3 ? 'هذا الحجم: المطلوب مساحة الأوجه.' : v === 4 * r.s * r.s ? 'للمكعب ٦ أوجه لا ٤.' : null };
  }
});

/* ═══ ١٧-٣ مساحات أسطح المجسمات الأخرى — «طلاء المجسمات» ═══ */
const NETS = [['triPrism', 'منشور ثلاثي'], ['sqPyr', 'هرم رباعي القاعدة'], ['tetra', 'هرم ثلاثي'], ['cuboid', 'متوازي مستطيلات']];
export const otherSurfaces7 = mission({
  id: 'otherSurfaces7', giver: 'jaber', st: ST7W.paint, key: 'paint', label: '🖌️ طلاء المجسمات', icon: '🖌️', bg: '#8B5A2B', side: -1,
  intro: n => [{ who: 'jaber', text: `أهلاً يا ${n}! نطلي مجسمات الزينة في مدخل الورشة: منشورات وأهرامات.` },
    { who: 'jaber', text: 'افرد المجسم شبكة، واحسب مساحة كل وجه فيها، ثم اجمعها.' }],
  goal: '🖌️ اطلِ مجسمات جابر', end: 'المجسمات مطلية! الشبكة تكشف كل الأوجه، ومساحة السطح مجموعها.',
  make() {
    const [k, nm] = shuf(NETS)[0], [a, b, c] = shuf([[3, 4, 5], [6, 8, 10], [5, 12, 13]])[0], L = R(5, 12), s = R(3, 10), h = R(4, 12);
    return [{ t: 'pick', k, opts: NETS.map(x => x[1]), ans: nm }, { t: 'kp', a, b, c, L, ans: a * b + (a + b + c) * L, dot: false }, { t: 'kp', s, h, ans: s * s + 2 * s * h, dot: false }];
  },
  view(r) {
    if (r.k) return { text: 'هذه شبكة المجسم الذي سنطليه. ما اسمه؟', visual: svg(solidNet(r.k)), hint: 'عُدّ الأوجه وانظر إلى أشكالها: مثلثات؟ مستطيلات؟ مربع؟' };
    if (r.L) return { text: `منشور ثلاثي قاعدته مثلث قائم أضلاعه ${N(r.a)} و${N(r.b)} و${N(r.c)} سم، وطوله ${N(r.L)} سم. كم سم² من الطلاء يغطيه؟`, visual: svg(solidNet('triPrism')), hint: `مثلثان مساحة كل منهما ½ × ${N(r.a)} × ${N(r.b)}، وثلاثة مستطيلات طول كل منها ${N(r.L)}.`, bad: v => v === r.a * r.b / 2 * r.L ? 'هذا حجم المنشور: المطلوب مساحة أوجهه.' : v === (r.a + r.b + r.c) * r.L ? 'نسيتَ المثلثين عند الطرفين.' : null };
    return { text: `هرم قاعدته مربع ضلعه ${N(r.s)} سم، وكل وجه جانبي مثلث قاعدته ${N(r.s)} سم وارتفاعه ${N(r.h)} سم. كم سم² مساحة سطحه؟`, visual: svg(solidNet('sqPyr')), hint: 'مساحة المربع + ٤ مثلثات (½ × القاعدة × الارتفاع لكل منها).', bad: v => v === 4 * r.s * r.h / 2 ? 'نسيتَ القاعدة المربعة.' : null };
  }
});

export const G7U9 = { expand7b, formulas7b, coords7, axisLines7, graphEq7, ymxc7, volume7, surfaceArea7, otherSurfaces7 };
