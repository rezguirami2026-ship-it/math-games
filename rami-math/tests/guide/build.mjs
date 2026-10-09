// يبني «الدليل التشغيلي والتعريفي» لقرية الخير: صفحات 16:9 (1280×720) بالعربية من اليمين، صور حقيقية مرقّمة، ثم PDF.
// الاستعمال: node build.mjs <مجلد العمل: فيه img/ و marks.json و perf.json و cred/> <ملف PDF الناتج>
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
const W = process.argv[2], OUTPDF = process.argv[3];
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..', '..');
const marks = JSON.parse(fs.readFileSync(path.join(W, 'img', 'marks.json'), 'utf8'));
const perf = JSON.parse(fs.readFileSync(path.join(W, 'perf.json'), 'utf8'));
const url = p => 'file:///' + p.replace(/\\/g, '/');
const IMG = n => url(path.join(W, 'img', n + '.jpg'));
const CRED = n => url(path.join(W, 'cred', n));
const FONT = f => url(path.join(ROOT, 'assets', 'fonts', f));
const AR = n => String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]).replace(/\./g, '٫');

/* صورة مرقّمة: دوائر ذهبية فوق مواضع الأزرار الحقيقية، وشرح كل رقم بجانبها */
const CROP = { challenge: [.28, 0, .44, 1], 'challenge-hint': [.28, 0, .44, 1], map: [.33, 0, .34, 1], bag: [.33, 0, .34, 1], bag2: [.33, 0, .34, 1], code: [.33, 0, .34, 1], achievements: [.33, 0, .34, 1], charity: [.33, 0, .34, 1], wardrobe: [.33, 0, .34, 1], wardrobe2: [.33, 0, .34, 1], support: [.33, .2, .34, .6], about: [.33, 0, .34, 1], decor: [.33, 0, .34, 1], 'adv-list': [.33, 0, .34, 1], 'adv-log': [.42, 0, .5, .78] };
function shotHtml(name, w, dots = '') { const c = CROP[name]; if (!c) return `<div class="shot" style="width:${w}px"><img src="${IMG(name)}">${dots}</div>`;
  const [cx, cy, cw, ch] = c, h = Math.round(w * (ch * 9) / (cw * 16)); return `<div class="shot" style="width:${w}px;height:${h}px"><img style="position:absolute;width:${(100 / cw).toFixed(2)}%;left:${(-cx / cw * 100).toFixed(2)}%;top:${(-cy / ch * 100).toFixed(2)}%;max-width:none" src="${IMG(name)}">${dots}</div>`; }
function fig(name, cap, notes = [], { w = 700, side = true } = {}) {
  const m = (marks[name] || []).filter(r => notes.some(([n]) => n === r.n)), c = CROP[name] || [0, 0, 1, 1];
  const dots = m.map(r => `<i class="dot" style="left:${(((r.x + r.w / 2) / r.W - c[0]) / c[2] * 100).toFixed(2)}%;top:${(((r.y + r.h / 2) / r.H - c[1]) / c[3] * 100).toFixed(2)}%">${AR(r.n)}</i>`).join('');
  const legend = notes.length ? `<ol class="legend">${notes.map(([n, t]) => `<li><b>${AR(n)}</b><span>${t}</span></li>`).join('')}</ol>` : '';
  return `<figure class="fig ${side ? 'side' : ''}">${shotHtml(name, w, dots)}${side ? legend : ''}<figcaption>${cap}</figcaption>${side ? '' : legend}</figure>`;
}
const tall = (name, cap, w) => `<figure class="fig"><div class="shot" style="width:${w}px"><img src="${IMG(name)}"></div><figcaption>${cap}</figcaption></figure>`;
const img = (name, cap, w) => `<figure class="fig">${shotHtml(name, w)}<figcaption>${cap}</figcaption></figure>`;
let pageNo = 0; const TOC = [];
function page(chapter, title, body, { cls = '' } = {}) {
  pageNo++; if (chapter && !TOC.find(t => t.ch === chapter)) TOC.push({ ch: chapter, p: pageNo });
  return `<section class="page ${cls}"><header><span class="ch">${chapter || ''}</span><span class="brand">✦ قرية الخير · الدليل التشغيلي</span></header><h2>${title}</h2><div class="body">${body}</div>
    <footer><span>إعداد الأستاذ رامي الرزقي · مدرسة الخوير للتعليم الأساسي (٥–٩)</span><span class="pn">${AR(pageNo)}</span></footer></section>`;
}

/* مخطط الأداء: إطارات في الثانية لكل وضع ومستوى إبطاء المعالج (قيم مقيسة) */
function perfChart() {
  const modes = [['2D', 'ثنائي الأبعاد', '#2F9BD6'], ['3D-low', 'ثلاثي (جودة منخفضة)', '#2E8B57'], ['3D-high', 'ثلاثي (جودة عالية)', '#E3A21A']], thr = [1, 4, 6];
  const Wd = 620, Hd = 300, max = 60, bw = 46, gap = 18, grp = modes.length * bw + 40;
  let s = `<svg viewBox="0 0 ${Wd} ${Hd + 60}" width="${Wd}" height="${Hd + 60}" style="direction:ltr">`;
  [0, 15, 30, 45, 60].forEach(v => { const y = Hd - v / max * (Hd - 20); s += `<line x1="40" x2="${Wd}" y1="${y}" y2="${y}" stroke="${v === 30 ? '#C0392B' : '#D8CBB0'}" stroke-dasharray="${v === 30 ? '6 4' : ''}"/><text x="32" y="${y + 5}" text-anchor="end" font-size="13" fill="#5A4A2A">${AR(v)}</text>`; });
  s += `<text x="${Wd - 4}" y="${Hd - 30 / max * (Hd - 20) - 6}" text-anchor="end" font-size="12" fill="#C0392B">حدّ السلاسة المستهدف (٣٠)</text>`;
  thr.forEach((t, gi) => {
    const x0 = 70 + gi * (grp + gap * 2);
    modes.forEach(([k, , col], mi) => { const r = perf.find(p => p.mode === k && p.thr === t); const v = r && r.fps ? r.fps : 0, h = v / max * (Hd - 20);
      s += `<rect x="${x0 + mi * bw}" y="${Hd - h}" width="${bw - 6}" height="${h}" rx="5" fill="${col}"/><text x="${x0 + mi * bw + (bw - 6) / 2}" y="${Hd - h - 6}" text-anchor="middle" font-size="13" font-weight="900" fill="#2A1B66">${AR(v)}</text>`; });
    s += `<text x="${x0 + grp / 2 - 20}" y="${Hd + 24}" text-anchor="middle" font-size="14" font-weight="900" fill="#2A1B66">${t === 1 ? 'سرعة المعالج الكاملة' : `معالج أبطأ ${AR(t)} مرات`}</text>`;
  });
  s += `<line x1="40" x2="${Wd}" y1="${Hd}" y2="${Hd}" stroke="#5A4A2A"/></svg>`;
  const legend = modes.map(([, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('');
  return `<div class="chart">${s}<div class="chartLeg">${legend}</div></div>`;
}
const P = r => (perf.find(p => p.mode === r[0] && p.thr === r[1]) || {}).fps;

// ═══════════════════ الصفحات ═══════════════════
const pages = [];
// الغلاف
pages.push(`<section class="page cover"><img class="cbg" src="${IMG('home')}"><div class="cshade"></div>
  <div class="clogos"><img src="${CRED('moe.png')}"><i></i><img src="${CRED('school.png')}"></div>
  <div class="ctext"><div class="ctag">دليل تشغيلي وتعريفي</div><h1>قرية الخير</h1><div class="csub">لعبة تعليمية تفاعلية في الرياضيات · الصف السادس · سلطنة عُمان</div>
    <div class="cline"></div><div class="cby"><small>إعداد وتنفيذ</small><b>الأستاذ رامي الرزقي</b><span>مدرسة الخوير للتعليم الأساسي (٥–٩)</span></div>
    <div class="cmeta">الإصدار ١٫١٤٫٠ · ${AR(new Date().getFullYear())}</div></div>
  <div class="cphoto"><img src="${CRED('me.jpg')}"></div></section>`);
pages.push('__TOC__');

// ١. التعريف باللعبة
pages.push(page('١. التعريف باللعبة', 'فكرة اللعبة وأهدافها', `<div class="cols"><div class="txt">
  <p class="lead">«قرية الخير» عالم مفتوح يتجوّل فيه الطالب ببطله، ويساعد أهل القرية في مهام يومية حقيقية. كل مهمة درس من دروس منهج الرياضيات للصف السادس، والرياضيات فيها هي طريقة اللعب نفسها: يحمل الصناديق بالقيمة المكانية، ويبني السياج بالمساحة والمحيط، وينزل البئر بالأعداد السالبة.</p>
  <h3>الأهداف التعليمية</h3><ul>
  <li>تغطية <b>الدروس التسعة والستين</b> لمنهج الصف السادس بترتيبها الرسمي، في <b>تسع وحدات</b> عبر فصلين دراسيين.</li>
  <li>تحويل المفهوم المجرد إلى فعل ملموس داخل العالم، ثم قياس الفهم بتحدٍّ مرتبط بمخرجات التعلم الرسمية.</li>
  <li>تعزيز المثابرة: الخطأ يقابله تلميح يساعد، لا عقاب ولا خسارة.</li></ul>
  <h3>الفئة المستهدفة</h3><p>طلاب الصف السادس (الحلقة الثانية من التعليم الأساسي) في سلطنة عُمان، والمعلمون وأولياء الأمور.</p>
  <h3>مبادئ التصميم</h3><div class="chips"><span>⏱️ بلا مؤقت</span><span>🤝 بلا عقاب</span><span>💡 تلميح عند الخطأ</span><span>🔤 عربية من اليمين</span><span>🔢 أرقام عربية</span><span>📴 تعمل بلا إنترنت</span></div>
  </div>${img('world-start', 'العالم المفتوح: البطل في قرية الخير والهدف الحالي ظاهر أعلى الشاشة', 560)}</div>`));
pages.push(page('١. التعريف باللعبة', 'بنية اللعبة: تسع وحدات في تسع مناطق', `<div class="cols"><div class="txt">
  <p>كل وحدة دراسية لها منطقة في العالم، تُحيط بها أسوار وبوابة. تنفتح البوابة حين يُكمل الطالب الوحدة السابقة، فيتقدّم في العالم كما يتقدّم في المنهج.</p>
  <table class="tbl" style="font-size:13.5px"><tr><th>الفصل</th><th>الوحدة</th><th>المنطقة في اللعبة</th></tr>
  <tr><td rowspan="4">الأول</td><td>١. الأعداد</td><td>🏡 قرية الخير</td></tr><tr><td>٢. القياس</td><td>🛒 السوق الأسبوعي</td></tr><tr><td>٣. الهندسة</td><td>⚓ الميناء</td></tr><tr><td>٤. الأعداد (٢)</td><td>🏰 القلعة</td></tr>
  <tr><td rowspan="5">الثاني</td><td>١. القياس</td><td>🎪 ساحة المهرجان</td></tr><tr><td>٢. معالجة البيانات</td><td>📊 بستان البيانات</td></tr><tr><td>٣. العدد</td><td>🏪 سوق الجمعية</td></tr><tr><td>٤. القياس (٢)</td><td>🐪 طريق القافلة</td></tr><tr><td>٥. الهندسة</td><td>🛠️ ورشة البنّاء</td></tr></table>
  <p class="note">بعد آخر درس تظهر «منصة التخرّج» هدفاً أخيراً.</p></div>
  ${fig('map', 'خريطة العالم ورحلة الدروس', [['1', 'خريطة العالم: المناطق المقفلة مظلّلة بقفل'], ['2', 'رحلة الدروس: كل الدروس بالترتيب، ومنها الأنشطة']], { w: 300, side: true })}</div>`));

// ٢. التشغيل
pages.push(page('٢. طريقة تشغيل اللعبة', 'الوصول إلى اللعبة وتثبيتها', `<div class="cols"><div class="txt">
  <h3>على المتصفح</h3><p>تُفتح اللعبة من الرابط:<br><code>rezguirami2026-ship-it.github.io/math-games/rami-math</code><br>وتعمل على متصفحات الحاسوب والهواتف والأجهزة اللوحية الحديثة، بلا تنزيل برامج إضافية.</p>
  <h3>كتطبيق على الجهاز</h3><ul><li><b>الحاسوب والأندرويد:</b> من الحقيبة زر «📲 ثبّت اللعبة كتطبيق» حين يتيحه المتصفح، فتُضاف أيقونة «قرية الخير».</li>
  <li><b>تطبيق أندرويد</b> مستقل باسم اللعبة وأيقونتها، يحمّل اللعبة من الموقع فتصله التحديثات تلقائياً.</li></ul>
  <h3>بلا إنترنت</h3><p>بعد الفتح الأول تُحفظ ملفات اللعبة على الجهاز، فتعمل دون اتصال. يُستثنى <b>الفيديو التعريفي</b> لأنه كبير الحجم، فيحتاج اتصالاً.</p>
  <h3>التحديثات</h3><p>تُنزَّل النسخة الجديدة في الخلفية وتُطبَّق حين لا يكون الطالب في منتصف مهمة، دون فقدان التقدّم.</p></div>
  ${fig('video', 'الفيديو التعريفي يظهر عند أول فتح للعبة على الجهاز، ويمكن مشاهدته لاحقاً من الشاشة الرئيسية أو الحقيبة', [['1', 'زر التشغيل (المتصفحات تشترط لمسة لتشغيل الصوت)'], ['2', 'بدء اللعب أو تخطّي الفيديو']], { w: 560, side: false })}</div>`));
pages.push(page('٢. طريقة تشغيل اللعبة', 'الشاشة الرئيسية', fig('home', 'الشاشة الرئيسية: البطل المجسّم، واسم اللعبة، وأزرار البدء', [['1', 'ابدأ المغامرة (أو «تابع المغامرة» إن وُجد حفظ)'], ['2', 'رحلة الدروس: تقدّم الطالب في الوحدات'], ['3', 'الإنجازات: الأوسمة والنجوم'], ['4', 'حسابي: بيانات البطل وتقدّمه'], ['5', 'فيديو تعريفي باللعبة'], ['6', 'لديّ رمز تقدّم: لاستعادة مغامرة محفوظة']], { w: 820 })));
pages.push(page('٢. طريقة تشغيل اللعبة', 'إنشاء البطل والبدء', fig('hero', 'اختيار البطل: الشخصية ولون البشرة ولون التطريز والاسم', [['1', 'بطل'], ['2', 'بطلة'], ['3', 'لون البشرة (٤ خيارات)'], ['4', 'لون التطريز (٤ خيارات)'], ['5', 'اسم البطل: يظهر في الحوارات والشهادة'], ['6', 'الانطلاق إلى القرية']], { w: 820 })));
pages.push(page('٢. طريقة تشغيل اللعبة', 'واجهة اللعب الأساسية', fig('world-start', 'العالم: يمشي البطل إلى حيث يضغط الطالب، ويتحدث مع الشخصيات من أزرار الفعل أسفل الشاشة', [['1', 'المستوى ولقبه'], ['2', 'نقاط الخير 💚'], ['3', 'الجواهر 💎'], ['4', 'الحقيبة'], ['5', 'الخريطة ورحلة الدروس'], ['6', 'الأوسمة والإنجازات'], ['7', 'الهدف الحالي (والسهم الذهبي يدلّ على مكانه)'], ['8', 'أزرار الفعل: تحدّث، احمل، ضع…']], { w: 820 })));
pages.push(page('٢. طريقة تشغيل اللعبة', 'الجولة التعريفية والحوار', `<div class="two">${img('tour', 'جولة تعريفية من ٨ خطوات بعد مقدمة القصة: ضوء ذهبي حول كل زر وشرح موجز، ويمكن تخطّيها أو إعادتها من الحقيبة', 590)}${img('dialog', 'الحوار: فقاعة فوق رأس المتكلم باسمه، والضغط في أي مكان يتقدّم بالحديث', 590)}</div>`));

// ٣. الألعاب والتحديات
pages.push(page('٣. الألعاب والتحديات', 'الدرس مهمة حقيقية في العالم', `<div class="cols"><div class="txt">
  <p class="lead">لا تُعرض الدروس شاشاتِ أسئلة، بل مهامّ يؤديها البطل بالحركة والتفاعل. أمثلة من دروس اللعبة:</p>
  <table class="tbl"><tr><th>الدرس</th><th>المهمة في العالم</th><th>الفعل الرياضي</th></tr>
  <tr><td>القيمة المكانية</td><td>شحنة الآلاف</td><td>حمل صناديق الآلاف والمئات والعشرات والآحاد إلى العربة</td></tr>
  <tr><td>العوامل والمضاعفات</td><td>صفوف البستان</td><td>زراعة الفسائل في صفوف متساوية</td></tr>
  <tr><td>المساحة والمحيط</td><td>سياج الحظيرة</td><td>بناء حظيرة بمساحة ومحيط محددين</td></tr>
  <tr><td>الأعداد الصحيحة</td><td>بئر القلعة</td><td>النزول والصعود بالأعداد السالبة</td></tr>
  <tr><td>المخططات الدائرية</td><td>تقسيم الأرض</td><td>توزيع المزرعة بالقطاعات</td></tr>
  <tr><td>النسب المئوية</td><td>تخفيضات العيد</td><td>حساب الخصم</td></tr>
  <tr><td>السنوات الكبيسة</td><td>جدار القرن</td><td>تمييز السنوات الكبيسة</td></tr></table></div>
  ${fig('mission', 'مهمة «شحنة الآلاف»: البطل يحمل صناديق الآلاف إلى العربة حتى يطابق الطلب', [['1', 'الهدف الحالي وتقدّم الجولة'], ['2', 'أفعال المهمة: احمل صندوقاً، أعِد صندوقاً…']], { w: 520, side: false })}</div>`));
pages.push(page('٣. الألعاب والتحديات', 'تحدّي الشخصية: أسئلة متنوعة بلا مؤقت', `<div class="cols"><div class="txt">
  <p>بعد كل مهمة يأتي «تحدّي الشخصية»: <b>ثماني جولات</b> بأنواع مختلفة، مرتبطة بمخرجات التعلم الرسمية للدرس، وبأعداد جديدة كل مرة.</p>
  <div class="chips wrap"><span>اختيار من متعدد</span><span>اختيار أكثر من إجابة</span><span>إدخال عدد</span><span>ترتيب</span><span>بناء</span><span>تصنيف</span><span>توصيل</span><span>صح أو خطأ</span><span>سهم على خط الأعداد</span><span>بطاقات الذاكرة</span><span>اكتشف الخطأ</span></div>
  <ul><li>الخطأ يقابله <b>تلميح</b> يوضّح الفكرة دون كشف الإجابة، ويبقى السؤال حتى يحلّه الطالب.</li><li>كل إجابة صحيحة تمنح <b>جوهرة 💎</b>، والنجوم (١–٣) تعكس الإجابات من المحاولة الأولى.</li></ul></div>
  <div class="two">${img('challenge', 'سؤال من التحدي', 250)}${fig('challenge-hint', 'بعد إجابة خاطئة: التلميح', [['1', 'رسالة التلميح']], { w: 250, side: false })}</div></div>`));
pages.push(page('٣. الألعاب والتحديات', 'أنشطة إضافية للتعلّم والتكرار', `<div class="grid3">
  <div class="card"><b>🎲 نشاط الدرس</b><p>من «رحلة الدروس»: ٦ جولات من مولّد الدرس نفسه، يكرّرها الطالب متى شاء، ويُحفظ أفضل نتائجه.</p></div>
  <div class="card"><b>⚡ تحدّي الخبير</b><p>يُفتح بعد ثلاث نجوم في الدرس: جولات أصعب لمن أتقن.</p></div>
  <div class="card"><b>📅 مهمة اليوم</b><p>مراجعة قصيرة من ٣ جولات من الدروس السابقة، مع سلسلة أيام متتالية.</p></div>
  <div class="card"><b>👑 ختام الوحدة</b><p>مغامرة مراجعة من ١٠ جولات في نهاية الوحدة.</p></div>
  <div class="card"><b>🎁 الكنوز المخفية</b><p>١٦ كنزاً في أركان العالم (كنزان في أغلب المناطق)، يُفتح كل منها بلغز من درس أنجزه الطالب.</p></div>
  <div class="card"><b>🎓 منصة التخرّج</b><p>الهدف الأخير بعد الدروس التسعة والستين.</p></div></div>`));

// ٤. المهمات والمغامرات
pages.push(page('٤. المهمات والمغامرات', 'استكشاف العوالم وفتح المناطق', `<div class="grid2">${img('festival', 'ساحة المهرجان: لافتة المنطقة عند الدخول أول مرة', 560)}${img('datayard', 'بستان البيانات: منطقة وحدة معالجة البيانات', 560)}${img('fort', 'القلعة', 560)}${img('harbor', 'الميناء', 560)}</div>`));
pages.push(page('٤. المهمات والمغامرات', 'المغامرات التسع: مغامرة بعد كل وحدة', `<div class="cols"><table class="tbl sm"><tr><th>الوحدة</th><th>المغامرة</th><th>ما يفعله البطل</th><th>الجائزة</th></tr>
  <tr><td>١</td><td>🏘️ إنقاذ القرية</td><td>تسلّل بين الحراس وإنقاذ الأهالي وإيقاد المنارات</td><td>الوشاح والتمثال</td></tr>
  <tr><td>٢</td><td>🌪️ العاصفة الكبرى</td><td>الاحتماء من الريح، إصلاح الجسر، قرع الجرس</td><td>جرس الوادي</td></tr>
  <tr><td>٣</td><td>🏝️ الجزيرة المفقودة</td><td>شقّ الأدغال، لغز المرايا، بناء الطوف</td><td>المرساة الذهبية</td></tr>
  <tr><td>٤</td><td>🏛️ سر المدينة القديمة</td><td>رموز البوابة، تماثيل تُدار، المذبح</td><td>قرص الشمس</td></tr>
  <tr><td>٥</td><td>🏮 فوانيس المهرجان</td><td>ترتيب ألوان الراية، حوار بالاختيار</td><td>فانوس المهرجان</td></tr>
  <tr><td>٦</td><td>🗼 الفنار والضباب</td><td>جرار الزيت، عدسات الفنار، مرآة الشعاع</td><td>الفنار الصغير</td></tr>
  <tr><td>٧</td><td>🏜️ مهمة في الصحراء</td><td>الاهتداء بالنجوم وعبور الكثبان</td><td>الإسطرلاب</td></tr>
  <tr><td>٨</td><td>⛰️ قمة جبل شمس</td><td>ريّ المدرّجات، الجسر المعلّق، صندوق القمة</td><td>رُجمة القمة</td></tr>
  <tr><td>٩</td><td>🏰 القلعة المظلمة</td><td>الجسر بين الحراس، نور القمر، حوار سيد الظلال</td><td>قنديل الخير</td></tr></table>
  <div class="txt" style="flex:.7"><p>المغامرات <b>بلا حساب</b>: قصص وشخصيات وألغاز تكافئ الطالب على إنهاء الوحدة. لكل مغامرة خمس نجوم مخفية، وجائزة في ساحة القرية، ووسام.</p>${fig('adv-list', 'لوحة المغامرات من الحقيبة', [['1', 'قاعة الأبطال'], ['2', 'بطاقة مغامرة']], { w: 230, side: false })}</div></div>`));
pages.push(page('٤. المهمات والمغامرات', 'اللعب داخل المغامرة', `<div class="cols">${fig('adv-castle', 'مغامرة «القلعة المظلمة» ثلاثية الأبعاد: الماسة الذهبية فوق الهدف دائماً', [['1', 'اسم المغامرة والهدف الحالي'], ['2', 'النجوم المخفية التي وُجدت'], ['3', 'سجل المهام'], ['4', 'تلميح'], ['5', 'حفظ والخروج']], { w: 600, side: false })}
  <div class="stack">${img('adv-log', 'سجل المهام: ما أُنجز وما بقي', 300)}${img('adv-dialog', 'حوار الشخصيات بصورة المتكلم', 400)}</div></div>`));
pages.push(page('٤. المهمات والمغامرات', 'قاعة الأبطال والاحتفال الكبير', `<div class="grid3i">${img('hall', 'قاعة الأبطال: أوسمة المغامرات ونجومها وجوائزها', 400)}${img('grand', 'الاحتفال الكبير بعد المغامرات التسع: لقب «بطل قرية الخير الأكبر» والوسام الذهبي', 400)}${img('certificate', 'شهادة بطولة باسم الطالب تُحفظ صورة', 400)}</div>`));

// ٥. الشخصيات والتخصيص
pages.push(page('٥. الشخصيات والتخصيص', 'خزانة البطل', `<div class="cols">${fig('wardrobe', 'خزانة البطل: معاينة مجسّمة تدور، وكل قطعة بأيقونتها وطريقة فتحها', [['1', 'البطل بما يرتديه'], ['2', 'قطعة ملبوسة بإطار ذهبي']], { w: 290, side: false })}
  <div class="txt"><h3>كيف تُفتح القطع</h3><ul>
  <li><b>بالمهام:</b> حقيبة المغامر، قربة الماء، مجرفة المزارع، التطريز الذهبي (بزراعة ٣ نخلات).</li>
  <li><b>بإكمال الوحدات (٩ قطع):</b> نظارة المستكشف، عصا الرحّالة، سترة البحّار، حقيبة المراسل، البشت المذهّب، وشاح المهرجان، التطريز الفضي، سترة القافلة، تاج قرية الخير.</li>
  <li><b>بالمغامرات:</b> وشاح حامي القرية، ووسام البطل الأكبر الذهبي.</li>
  <li><b>بالشراء بالجواهر (متجر الأزياء):</b> ٣ أحذية، و٣ ألوان مصرّ للبطل، و٣ ألوان لحاف للبطلة.</li></ul>
  <p class="note">قطعتان من خانة واحدة لا تُلبسان معاً (وشاحان مثلاً). <b>التسريحة:</b> غير متاحة، لأن البطل يرتدي الكمّة أو المصرّ والبطلة اللحاف، فاستُعيض عنها بتغيير غطاء الرأس.</p></div></div>`));
pages.push(page('٥. الشخصيات والتخصيص', 'متجر الأزياء والبطل في العالم', `<div class="two">${img('wardrobe2', 'متجر الأزياء داخل الخزانة: «اشترِ» بالجواهر', 290)}${img('hero-dressed', 'البطل في الساحة بما اختاره، والجمل «سهيل» يرافقه (من المستوى ٢)، وجوائز المغامرات في الساحة', 780)}</div>`));

// ٦. الحقيبة
pages.push(page('٦. حقيبة البطل', 'محتويات الحقيبة ووظائفها', `<div class="two">${fig('bag', 'أعلى الحقيبة: ما يحمله البطل، ونقاط الخير، والكنوز، والمستوى', [['1', 'متجر زينة القرية'], ['2', 'المغامرات'], ['3', 'صندوق الخير'], ['4', 'خزانة البطل'], ['5', 'الصوت'], ['6', 'الموسيقى'], ['7', 'رمز حفظ التقدّم']], { w: 300, side: true })}${fig('bag2', 'أسفل الحقيبة: المساعدة والإعدادات', [['1', 'جولة تعريفية'], ['2', 'الفيديو التعريفي'], ['3', 'حول اللعبة'], ['4', 'الدعم الفني'], ['5', 'العرض: عادي أو ثلاثي الأبعاد'], ['6', 'جودة الرسوم']], { w: 300, side: true })}</div>`));

// ٧. الأوسمة
pages.push(page('٧. الأوسمة والإنجازات', 'المستويات والأوسمة', `<div class="cols"><div class="txt">
  <h3>المستويات العشرة</h3><p>تُحسب نقاط الخبرة من التقدّم الفعلي ولا تنقص أبداً: ١٠ نقاط لكل درس + ٥ لكل نجمة، و٣ لكل مرة يُلعب فيها النشاط (حتى ٥ مرات).</p>
  <div class="chips wrap"><span>🌱 مستكشف صغير</span><span>🧭 مستكشف</span><span>🤝 مساعد القرية</span><span>🏡 صديق الأهالي</span><span>🛤️ حارس الطريق</span><span>🏪 بطل السوق</span><span>🏰 فارس القلعة</span><span>🌟 نجم المهرجان</span><span>🗝️ أمين القرية</span><span>👑 حكيم قرية الخير</span></div>
  <h3>الأوسمة (٢٨ وساماً)</h3><p>لكل وسام شرط واضح وشريط تقدّم ظاهر، مثل: «المثابر» (٢٠ جولة بعد محاولة خاطئة)، «سلسلة النار»، «صائد الكنوز»، أوسمة المغامرات التسع، «يد الخير» و«القلب الكريم» للعطاء. وإنجازات خاصة لكل وحدة ولإكمال الفصلين.</p>
  <p class="note">الهدف: مكافأة الجهد والمثابرة لا السرعة، فلا وسام مرتبط بالوقت.</p></div>
  ${img('achievements', 'لوحة الأوسمة: المفتوح ملوّن، والمقفل بشرطه وتقدّمه', 300)}</div>`));

// ٨. نقاط الخير
pages.push(page('٨. نقاط الخير والقيم', 'نقاط الخير وصندوق الخير', `<div class="cols"><div class="txt">
  <h3>كيف تُكتسب 💚</h3><ul><li>إنجاز مهمة الدرس ومساعدة أهل القرية (غالباً ٤٠ نقطة).</li><li>إنهاء نشاط الدرس (٥ + ٥ لكل نجمة).</li><li>مهام خاصة، مثل ملء خزانات البيوت وإطلاق قافلة المزرعة.</li></ul>
  <h3>كيف تُستعمل</h3><ul><li><b>زراعة النخيل</b> في القرية (٢٠ نقطة للنخلة)، وزراعة ثلاث نخلات تفتح «التطريز الذهبي».</li>
  <li><b>صندوق الخير:</b> التبرّع لأعمال تنفع أهل القرية: إفطار صائم، سقيا الماء، كتب لمكتبة المدرسة، كسوة العيد. يشكر صاحب الحاجة الطالب، ويظهر أثر دائم (برّادة ماء في الساحة)، ووسامان للعطاء.</li></ul>
  <p class="note">التبرّع لا يمنح جواهر مقابله: الغاية القيمة نفسها، أن يرى الطالب أثر عطائه في غيره.</p></div>
  ${img('charity', 'صندوق الخير بعد التبرّع لسقيا الماء: شكر العم ناصر', 290)}</div>`));

// ٩. الحفظ
pages.push(page('٩. التقدّم وحفظ الإنجازات', 'الحفظ التلقائي ورمز التقدّم', `<div class="cols"><div class="txt">
  <h3>الحفظ التلقائي</h3><p>يُحفظ التقدّم على الجهاز نفسه بعد كل خطوة مهمة (إنهاء درس، شراء، مغامرة…)، فيجده الطالب كما تركه حين يعود، حتى دون إنترنت.</p>
  <h3>رمز التقدّم</h3><p>من الحقيبة ← «🔑 رمز حفظ التقدّم» يظهر رمز نصّي يحمل المغامرة كلها (الدروس، النجوم، الجوائز، المغامرات). ينسخه الطالب ويحتفظ به أو يرسله لمعلمه.</p>
  <p>للاستعادة: الشاشة الرئيسية ← «لديّ رمز تقدّم» ← لصق الرمز. تعرض اللعبة اسم البطل وعدد دروسه قبل التأكيد، وترفض الرمز التالف.</p>
  <p class="note">لا يوجد حساب على خادم ولا مزامنة تلقائية بين الأجهزة: النقل بين الأجهزة يكون برمز التقدّم. مسح بيانات المتصفح يمسح الحفظ، لذا يُنصح بنسخ الرمز دورياً.</p></div>
  ${fig('code', 'رمز التقدّم في الحقيبة', [['1', 'الرمز'], ['2', 'نسخ الرمز']], { w: 290, side: false })}</div>`));

// ١٠. الدعم الفني
pages.push(page('١٠. الدعم الفني وحل المشكلات', 'الدعم الفني داخل اللعبة', `<div class="cols"><div class="txt">
  <p>من الحقيبة ← «🛟 الدعم الفني» يختار الطالب نوع الرسالة: <b>الإبلاغ عن مشكلة، اقتراح، اللعبة توقفت، مساعدة</b>، ويكتب وصفه. تُرسل الرسالة إلى لوحة تحكم المعلم مع رقم تثبيت مجهول (لا اسم ولا بيانات شخصية)، وتُحفظ على الجهاز إن لم يتوفر إنترنت وتُرسل لاحقاً.</p>
  <p>وفي «ℹ️ حول اللعبة» يظهر رقم الإصدار والنسخة، وما تجمعه اللعبة من إحصاءات مجهولة.</p>
  <p class="note">لا تتضمن اللعبة رقم هاتف أو بريداً للدعم؛ قناة الدعم الوحيدة هي نموذج الدعم الفني داخلها.</p></div>
  <div class="two">${img('support', 'نموذج الدعم الفني', 260)}${img('about', 'حول اللعبة: الإصدار والخصوصية', 260)}</div></div>`));
pages.push(page('١٠. الدعم الفني وحل المشكلات', 'مشكلات شائعة وحلولها', `<table class="tbl big"><tr><th>المشكلة</th><th>السبب المحتمل</th><th>الحل</th></tr>
  <tr><td>اللعبة بطيئة أو متقطعة</td><td>العرض ثلاثي الأبعاد على جهاز محدود</td><td>الحقيبة ← «✨ الجودة: منخفضة»، أو «🎮 العرض: عادي». (تفعل اللعبة ذلك تلقائياً عند البطء الشديد)</td></tr>
  <tr><td>لا تُفتح أول مرة</td><td>لا اتصال عند الفتح الأول</td><td>الاتصال بالإنترنت مرة واحدة؛ بعدها تعمل دون اتصال</td></tr>
  <tr><td>الفيديو التعريفي لا يعمل</td><td>يحتاج اتصالاً</td><td>مشاهدته لاحقاً من الشاشة الرئيسية أو الحقيبة عند توفر الإنترنت</td></tr>
  <tr><td>ضاع التقدّم</td><td>مسح بيانات المتصفح أو تغيير الجهاز</td><td>الشاشة الرئيسية ← «لديّ رمز تقدّم» ← لصق الرمز المحفوظ</td></tr>
  <tr><td>لم يظهر التحديث الجديد</td><td>التحديث يُطبَّق حين لا يكون الطالب في مهمة</td><td>إغلاق اللعبة وفتحها مجدداً</td></tr>
  <tr><td>لا صوت</td><td>الصوت أو الموسيقى متوقفة، أو لم يلمس الطالب الشاشة بعد</td><td>الحقيبة ← «🔊 الصوت» و«🎵 الموسيقى»، ثم لمسة على الشاشة</td></tr>
  <tr><td>الطالب لا يعرف ماذا يفعل</td><td>—</td><td>الهدف أعلى الشاشة، والسهم الذهبي، وزر التلميح 💡 في المغامرات، والجولة التعريفية</td></tr></table>`));

// ١١. الإعدادات
pages.push(page('١١. الإعدادات والتحكم', 'الإعدادات المتاحة', `<div class="cols"><table class="tbl"><tr><th>الإعداد</th><th>مكانه</th><th>الوظيفة</th></tr>
  <tr><td>🔊 الصوت</td><td>الحقيبة</td><td>المؤثرات الصوتية تشغيل/إيقاف</td></tr><tr><td>🎵 الموسيقى</td><td>الحقيبة</td><td>موسيقى خلفية مولّدة لكل منطقة ومغامرة</td></tr>
  <tr><td>🎮 العرض</td><td>الحقيبة</td><td>ثلاثي الأبعاد أو عادي (ثنائي الأبعاد)</td></tr><tr><td>✨ الجودة</td><td>الحقيبة (في 3D)</td><td>تلقائية / عالية / منخفضة</td></tr>
  <tr><td>🌙 أجواء رمضان</td><td>الحقيبة</td><td>تلقائي حسب الشهر الهجري، أو تشغيل/إيقاف</td></tr><tr><td>🐪 الرفيق سهيل</td><td>الحقيبة</td><td>إظهار الجمل المرافق أو إخفاؤه</td></tr>
  <tr><td>🧭 الجولة / 🎬 الفيديو</td><td>الحقيبة والرئيسية</td><td>إعادة الشرح في أي وقت</td></tr></table>
  <div class="txt"><div style="float:left;margin:0 0 0 14px">${tall('phone-bag', 'الحقيبة على الهاتف', 150)}</div><h3>التحكم</h3><ul><li><b>اللمس أو الفأرة:</b> الضغط على الأرض للمشي، وعلى الشخصيات والأشياء للتفاعل، وأزرار الفعل أسفل الشاشة.</li><li><b>لوحة المفاتيح:</b> الأسهم للمشي في المغامرات.</li></ul></div></div>`));

// ١٢. المميزات
pages.push(page('١٢. المميزات التعليمية والتقنية', 'ما يميّز «قرية الخير»', `<div class="grid2c">
  <div class="card"><b>📘 مطابقة المنهج</b><p>٦٩ درساً بالترتيب الرسمي، وتحديات مرتبطة بمخرجات التعلم، وقواعد المعلم في كتابة الأعداد (بلا فاصلة آلاف، والسالب بصيغته العربية).</p></div>
  <div class="card"><b>🎮 الرياضيات فعل</b><p>المفهوم يُطبَّق بالحركة داخل العالم، ثم يُقاس بالتحدي، ثم يُثبَّت بالنشاط ومهمة اليوم.</p></div>
  <div class="card"><b>💡 تعلّم من الخطأ</b><p>تلميح بعد كل خطأ، بلا عقاب ولا مؤقت، ووسام للمثابرة.</p></div>
  <div class="card"><b>💚 قيم</b><p>نقاط الخير، وزراعة النخيل، وصندوق الخير، وقصص المغامرات عن التعاون واللطف.</p></div>
  <div class="card"><b>📴 بلا إنترنت وبلا تثبيت</b><p>تطبيق ويب تقدّمي يعمل على الحاسوب والهاتف، ويُثبَّت كتطبيق.</p></div>
  <div class="card"><b>🧊 عرضان</b><p>ثلاثي الأبعاد للأجهزة القادرة، وثنائي الأبعاد للمحدودة، بالمحتوى نفسه كاملاً.</p></div>
  <div class="card"><b>🔒 خصوصية</b><p>لا تُرسل أسماء ولا بيانات شخصية؛ إحصاءات مجهولة قليلة فقط لتحسين اللعبة.</p></div>
  <div class="card"><b>✅ اختبار آلي شامل</b><p>تُلعب الدروس الـ٦٩ والمغامرات التسع آلياً قبل كل نشر، مع التحقق من فتح البوابات في وقتها.</p></div></div>`));

// ١٣. 2D و 3D
pages.push(page('١٣. ثنائي الأبعاد وثلاثي الأبعاد', 'المكان نفسه بالعرضين', `<div class="two">${img('world-2d', 'العرض العادي (2D): رسم مسطّح بمنظور مائل خفيف، سريع وخفيف على الجهاز', 590)}${img('hero-dressed', 'العرض ثلاثي الأبعاد (3D): مجسّمات وإضاءة وظلال وعمق ومنظور', 590)}</div>
  <p class="cap2">ساحة القرية في الحالتين: المحتوى والمهام واحدة، والفرق في طريقة الرسم واستهلاك موارد الجهاز.</p>`));
pages.push(page('١٣. ثنائي الأبعاد وثلاثي الأبعاد', 'مزايا كل تقنية', `<div class="two"><div class="card big"><b>🟦 ثنائي الأبعاد (2D)</b><ul>
  <li>يعمل على الأجهزة محدودة الإمكانات وبلا معالج رسومات قوي.</li><li>استجابة سريعة واستهلاك أقل للبطارية والذاكرة.</li><li>وضوح كامل للنصوص والأرقام والرسوم الرياضية.</li><li>كافٍ تماماً لأنشطة لا تحتاج عمقاً بصرياً.</li></ul></div>
  <div class="card big"><b>🟩 ثلاثي الأبعاد (3D)</b><ul><li>عوالم قابلة للاستكشاف بعمق ومنظور حقيقي.</li><li>شخصيات بشرية مجسّمة بمفاصل وحركات طبيعية.</li><li>إضاءة وظلال وطقس (ليل، مطر، ضباب، غروب) تجعل المغامرات أكثر واقعية وتشويقاً.</li>
  <li>يتطلّب معالج رسومات يدعم WebGL، وذاكرة ومعالجاً أقوى.</li></ul></div></div>
  <div class="two" style="margin-top:14px">${img('adv-mountain-2d', 'مغامرة «قمة جبل شمس» في 2D', 420)}${img('adv-mountain', 'المغامرة نفسها في 3D: جروف صخرية ورُجَم', 420)}</div>`));
pages.push(page('١٣. ثنائي الأبعاد وثلاثي الأبعاد', 'كيف تختار اللعبة العرض المناسب تلقائياً', `<div class="flow">
  <div class="step"><b>١</b><span>هل يدعم الجهاز WebGL؟</span><small>لا ← العرض العادي (2D)</small></div><i>←</i>
  <div class="step"><b>٢</b><span>هل الجهاز محدود؟</span><small>ذاكرة ٣ غيغابايت أو أقل، أو جهاز لمس بأربع أنوية أو أقل ← 2D</small></div><i>←</i>
  <div class="step"><b>٣</b><span>قياس أول ٥ ثوانٍ في 3D</span><small>أقل من ٢٦ إطاراً/ث ← خفض الجودة</small></div><i>←</i>
  <div class="step"><b>٤</b><span>إن بقي بطيئاً جداً</span><small>أقل من ١٥ إطاراً/ث ← انتقال إلى 2D مع رسالة للطالب</small></div></div>
  <table class="tbl" style="margin-top:18px"><tr><th>فئة الجهاز</th><th>أمثلة عامة</th><th>التوصية</th></tr>
  <tr><td>ضعيف</td><td>هواتف وأجهزة لوحية قديمة، ذاكرة ≤ ٣ غيغابايت</td><td>العرض العادي (2D) — تختاره اللعبة تلقائياً</td></tr>
  <tr><td>متوسط</td><td>حواسيب برسوميات مدمجة، هواتف حديثة متوسطة</td><td>3D بجودة منخفضة (أو تلقائية)</td></tr>
  <tr><td>قوي</td><td>حواسيب ببطاقة رسوميات، هواتف رائدة</td><td>3D بجودة عالية</td></tr></table>
  <p class="note">جدول الفئات توصيات عامة؛ النتائج المقيسة فعلاً في الصفحة التالية. ويبقى اختيار الطالب من «🎮 العرض» محترماً فلا تغيّره اللعبة.</p>`));
pages.push(page('١٣. ثنائي الأبعاد وثلاثي الأبعاد', 'نتائج اختبار الأداء المقيسة', `<div class="cols">${perfChart()}<div class="txt">
  <h3>ظروف القياس</h3><ul><li>حاسوب التطوير: معالج AMD Ryzen 5 PRO 5650U (٦ أنوية) برسوميات Radeon مدمجة، ذاكرة ١٥ غيغابايت، Windows 11.</li><li>متصفح Chrome مُدار آلياً، نافذة ١٢٨٠×٧٢٠، ساحة القرية والبطل يمشي، ٥ ثوانٍ لكل قياس.</li>
  <li>«معالج أبطأ ٤ و٦ مرات» إبطاء محاكى للمعالج فقط (CPU throttling) لتقريب الأجهزة الأضعف؛ معالج الرسومات لم يُبطَّأ.</li></ul>
  <h3>القراءة</h3><ul><li>2D يبلغ ${AR(P(['2D', 1]))} إطاراً/ث بسرعة كاملة، ويبقى أعلى من الأوضاع الأخرى عند الإبطاء.</li><li>3D بجودة منخفضة ${AR(P(['3D-low', 1]))} إطاراً/ث على هذا الحاسوب: مناسب.</li><li>3D بجودة عالية ${AR(P(['3D-high', 1]))} إطاراً/ث على الرسوميات المدمجة: أقل من الحدّ، فتخفض اللعبة الجودة تلقائياً.</li></ul>
  <p class="note">قيم مقيسة على جهاز واحد في بيئة اختبار آلية، والأجهزة الفعلية الأخرى قد تختلف.</p></div></div>`));
pages.push(page('١٣. ثنائي الأبعاد وثلاثي الأبعاد', 'الموازنة بين الجودة والسلاسة', `<div class="cols"><table class="tbl"><tr><th>العنصر</th><th>جودة عالية</th><th>جودة منخفضة</th></tr>
  <tr><td>دقة الرسم</td><td>كاملة حتى كثافة شاشة الجهاز</td><td>حتى ١٫٣ من كثافة الشاشة</td></tr>
  <tr><td>المؤثرات اللاحقة (توهج، تنعيم)</td><td>مفعّلة</td><td>متوقفة</td></tr>
  <tr><td>تحديث الظلال</td><td>كل إطارين</td><td>كل ثلاثة إطارات</td></tr>
  <tr><td>دقة خريطة الظلال</td><td>٢٠٤٨ (الحاسوب)</td><td>١٠٢٤</td></tr>
  <tr><td>رسوم الأرض المتغيرة</td><td>أدق وأسرع تحديثاً</td><td>أخف</td></tr></table>
  <div class="txt"><h3>متى نخفّض؟</h3><ul><li>حين يقل معدل الإطارات عن ٢٦ في الثانية: تُخفض الجودة أولاً (أقل أثراً على المظهر).</li><li>حين يقل عن ١٥: يُنتقل إلى 2D، لأن التقطّع يضر بالتعلم أكثر من بساطة الرسم.</li></ul>
  <div style="float:left;margin:0 0 0 14px">${tall('phone-world', 'العالم على الهاتف', 130)}</div><h3>تحميل خفيف</h3><p>محرك المغامرات ومكتبة الرسوم ثلاثية الأبعاد لا تُحمَّل إلا عند الحاجة، فيقلّ ما يُنزَّل عند فتح اللعبة في العرض العادي بنحو ٤٥٪.</p>
</div></div>`));

// ما لم يُنفّذ
pages.push(page('حدود الإصدار الحالي', 'ميزات غير متوفرة في هذا الإصدار', `<table class="tbl big"><tr><th>الميزة</th><th>الحالة</th></tr>
  <tr><td>تسريحة الشعر</td><td>غير متاحة؛ يُخصَّص غطاء الرأس (كمّة/مصرّ للبطل، لحاف للبطلة) بما يناسب الزي العُماني</td></tr>
  <tr><td>تقرير تقدّم للمعلم أو لوحة فصل</td><td>غير متاحة؛ يرسل الطالب رمز التقدّم لمعلمه، ولوحة التحكم تعرض إحصاءات مجهولة عامة لا بيانات طلاب بأسمائهم</td></tr>
  <tr><td>حسابات ومزامنة تلقائية بين الأجهزة</td><td>غير متاحة؛ النقل برمز التقدّم</td></tr>
  <tr><td>اللعب الجماعي</td><td>غير متاح؛ اللعبة فردية</td></tr>
  <tr><td>تعليق صوتي للشخصيات داخل اللعبة</td><td>غير متاح؛ الحوار مكتوب، والصوت البشري في الفيديو التعريفي فقط</td></tr>
  <tr><td>الفيديو التعريفي دون إنترنت</td><td>غير متاح؛ يحتاج اتصالاً لكبر حجمه</td></tr></table>`));

// الخاتمة
pages.push(page('الخاتمة', 'القيمة التعليمية والتقنية للمشروع', `<div class="cols"><div class="txt">
  <p class="lead">تقدّم «قرية الخير» منهج الرياضيات للصف السادس كاملاً في عالم عُماني حيّ، يتعلّم فيه الطالب بالفعل لا بالتلقين: يطبّق المفهوم بيده داخل العالم، ثم يُقاس فهمه بتحدٍّ مرتبط بمخرجات التعلم، ثم يُكافأ بمغامرة وقصة وقيمة.</p>
  <ul><li><b>تعليمياً:</b> ٦٩ درساً، وتحدٍّ لكل درس بأحد عشر نوعاً من الأسئلة، وتلميحات تعلّم من الخطأ، وأنشطة للتكرار والمراجعة.</li>
  <li><b>تحفيزياً:</b> مستويات وأوسمة ونجوم وجواهر، وتسع مغامرات، وخزانة بطل، واحتفال وشهادة لمن يُكمل.</li>
  <li><b>قيمياً:</b> نقاط الخير، وصندوق الخير، وقصص عن التعاون واللطف والإصغاء.</li>
  <li><b>تقنياً:</b> تعمل بلا إنترنت وعلى كل الأجهزة، بعرضين يختار بينهما الجهاز تلقائياً، واختبار آلي شامل قبل كل تحديث.</li></ul></div>
  ${img('grand', 'لحظة «بطل قرية الخير الأكبر»', 520)}</div>`));

// المراجع
pages.push(page('المراجع', 'المراجع التقنية', `<ol class="refs">
  <li>Khronos Group. <i>WebGL Overview</i>. https://www.khronos.org/webgl/</li>
  <li>MDN Web Docs. <i>WebGL API</i>. https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API</li>
  <li>three.js. <i>Documentation</i>. https://threejs.org/docs/</li>
  <li>MDN Web Docs. <i>Progressive web apps</i>. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps</li>
  <li>MDN Web Docs. <i>Service Worker API</i>. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API</li>
  <li>MDN Web Docs. <i>Web Audio API</i>. https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API</li>
  <li>MDN Web Docs. <i>Window: localStorage property</i>. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage</li>
  <li>MDN Web Docs. <i>Navigator: deviceMemory property</i>. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory</li>
  <li>Chrome DevTools Protocol. <i>Emulation.setCPUThrottlingRate</i>. https://chromedevtools.github.io/devtools-protocol/tot/Emulation/</li>
  <li>web.dev. <i>Rendering performance</i>. https://web.dev/articles/rendering-performance</li></ol>
  <p class="note">مصادر المحتوى التعليمي: منهج الرياضيات للصف السادس في سلطنة عُمان (ترتيب الدروس ومخرجات التعلم كما اعتمدها المعلّم). كل ما في هذا الدليل من وظائف وصور مأخوذ من الإصدار ١٫١٤٫٠ من اللعبة نفسها.</p>`));

// الفهرس
const tocHtml = page(null, 'الفهرس', `<div class="toc">${TOC.map(t => `<div><span>${t.ch}</span><i></i><b>${AR(t.p + 0)}</b></div>`).join('')}</div>`);
const ix = pages.indexOf('__TOC__'); pages[ix] = tocHtml;

const CSS = `
@font-face{font-family:Cairo;font-weight:700;src:url(${FONT('cairo-arabic-700-normal.woff2')}) format('woff2')}
@font-face{font-family:Cairo;font-weight:900;src:url(${FONT('cairo-arabic-900-normal.woff2')}) format('woff2')}
@font-face{font-family:Cairo;font-weight:700;src:url(${FONT('cairo-latin-700-normal.woff2')}) format('woff2');unicode-range:U+0000-00FF}
@font-face{font-family:Cairo;font-weight:900;src:url(${FONT('cairo-latin-900-normal.woff2')}) format('woff2');unicode-range:U+0000-00FF}
@page{size:1280px 720px;margin:0}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{font-family:Cairo,'Segoe UI',sans-serif;font-weight:700;direction:rtl;color:#22204A;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:1280px;height:720px;position:relative;overflow:hidden;page-break-after:always;background:linear-gradient(180deg,#FFFDF7,#FBF3E1);padding:70px 46px 52px}
.page::before{content:"";position:absolute;inset:0;opacity:.05;background:repeating-linear-gradient(45deg,transparent 0 22px,#C9971C 22px 23px),repeating-linear-gradient(-45deg,transparent 0 22px,#C9971C 22px 23px);pointer-events:none}
header{position:absolute;top:0;left:0;right:0;height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 46px;background:linear-gradient(90deg,#1F4E79,#2F6B73);color:#FFF6E2;border-bottom:4px solid #E3B04B}
header .ch{font:900 17px Cairo}header .brand{font-size:14px;opacity:.9}
h2{margin:0 0 14px;font:900 30px/1.3 Cairo;color:#1F4E79;position:relative;padding-right:18px}h2::before{content:"";position:absolute;right:0;top:8px;bottom:8px;width:6px;border-radius:3px;background:#E3B04B}
h3{margin:8px 0 4px;font:900 18px Cairo;color:#2F6B73}
p,li{font-size:15.5px;line-height:1.75;margin:0 0 6px}ul{margin:0 0 6px;padding-right:20px}
.lead{font-size:17px;line-height:1.85}
.note{font-size:13.5px;background:#FFF4D6;border-right:4px solid #E3B04B;border-radius:8px;padding:6px 12px;color:#5A4200}
footer{position:absolute;bottom:0;left:0;right:0;height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 46px;font-size:12.5px;color:#7A6A4A;border-top:1px solid #E7D9B8;background:#FFFBF0}
footer .pn{font:900 15px Cairo;color:#fff;background:#1F4E79;border-radius:12px;padding:0 12px}
.cols{display:flex;gap:26px;align-items:flex-start}.cols>.txt{flex:1;min-width:300px}
.two{display:flex;gap:20px;justify-content:center}.stack{display:flex;flex-direction:column;gap:8px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;justify-items:center}.grid2 .shot{width:540px!important}.grid2 img{height:228px;object-fit:cover}.grid2 figcaption{margin-top:4px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.grid2c{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.grid3i{display:flex;gap:16px;justify-content:center}
.fig{margin:0;display:flex;flex-direction:column;align-items:center}.fig.side{flex-direction:row-reverse;flex-wrap:wrap;align-items:flex-start;gap:20px;justify-content:center}
.fig.side figcaption{width:100%;order:3}
.shot{position:relative;border-radius:12px;overflow:hidden;box-shadow:0 0 0 3px #E3B04B,0 10px 26px rgba(30,20,60,.25);flex:none}.shot img{display:block;width:100%}
figcaption{font-size:13.5px;color:#4A3E2A;text-align:center;margin-top:8px;line-height:1.6;max-width:840px}
.dot{position:absolute;transform:translate(50%,-50%);width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFF1B8,#E3A21A);border:2.5px solid #fff;box-shadow:0 0 0 2px #8A5A00,0 4px 10px rgba(0,0,0,.45);font:900 15px/26px Cairo;color:#3A2400;text-align:center;font-style:normal}
.legend{list-style:none;padding:0;margin:8px 0 0;display:flex;flex-wrap:wrap;gap:6px 14px;max-width:880px;justify-content:center}.fig.side .legend{flex-direction:column;max-width:330px;margin:0;justify-content:flex-start}
.legend li{display:flex;align-items:center;gap:8px;font-size:14px;margin:0;line-height:1.5}.legend b{flex:none;width:26px;height:26px;border-radius:50%;background:#1F4E79;color:#FFE3A0;text-align:center;font:900 14px/26px Cairo}
.tbl{border-collapse:collapse;width:100%;flex:1.15;min-width:0;font-size:14.5px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 0 0 1px #E3CFA0}
.tbl th{background:#1F4E79;color:#FFF6E2;padding:5px 10px;font-weight:900;text-align:right}.tbl td{padding:4px 10px;border-top:1px solid #EFE3C8;vertical-align:top;line-height:1.55}
.tbl tr:nth-child(even) td{background:#FFF9EC}.tbl.sm{font-size:13.5px;flex:1.2}.tbl.sm td{padding:5px 8px}.tbl.big{font-size:15.5px}
.chips{display:flex;gap:8px;margin:6px 0 8px}.chips.wrap{flex-wrap:wrap}.chips span{background:#EAF2FA;border:1px solid #A9C6E2;color:#1F4E79;border-radius:16px;padding:3px 12px;font-size:14px}
.card{background:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 0 0 1.5px #E7D3A6,0 6px 16px rgba(60,40,10,.08)}.card b{display:block;font:900 17px Cairo;color:#1F4E79;margin-bottom:4px}.card p{font-size:14px;margin:0}
.card.big{flex:1}.card.big li{font-size:15px}
.cap2{text-align:center;font-size:15px;margin-top:12px}
.flow{display:flex;align-items:stretch;gap:8px;justify-content:center}.flow i{align-self:center;font-style:normal;font-size:26px;color:#E3A21A}
.step{flex:1;background:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 0 0 1.5px #E7D3A6;text-align:center}.step b{display:inline-block;width:30px;height:30px;border-radius:50%;background:#1F4E79;color:#FFE3A0;font:900 16px/30px Cairo}
.step span{display:block;font:900 15px Cairo;margin:4px 0}.step small{font-size:13px;color:#5A4A2A;line-height:1.6;display:block}
.chart{background:#fff;border-radius:14px;padding:12px;box-shadow:0 0 0 1.5px #E7D3A6;font-family:Cairo}.chart text{font-family:Cairo}
.chartLeg{display:flex;gap:16px;justify-content:center;font-size:13.5px}.chartLeg i{display:inline-block;width:14px;height:14px;border-radius:4px;margin-left:6px;vertical-align:middle}
.toc{columns:2;column-gap:60px;margin-top:10px}.toc div{display:flex;align-items:baseline;gap:8px;font:900 19px/2.3 Cairo;break-inside:avoid}.toc i{flex:1;border-bottom:2px dotted #C9B48A}.toc b{color:#1F4E79}
.refs li{direction:ltr;text-align:left;font-size:14px;font-family:'Segoe UI',Arial,sans-serif;font-weight:400}.refs{padding-left:24px}
code{direction:ltr;unicode-bidi:embed;background:#EAF2FA;padding:1px 8px;border-radius:6px;font-size:14px}
.cover{padding:0;background:#0B2A4A}.cbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(2px) saturate(1.1)}
.cshade{position:absolute;inset:0;background:linear-gradient(270deg,rgba(5,21,40,.94) 0%,rgba(11,42,74,.86) 55%,rgba(11,42,74,.35) 100%)}
.clogos{position:absolute;top:0;right:70px;height:150px;width:520px;display:flex;align-items:center;justify-content:center;gap:28px;background:linear-gradient(180deg,#FFFDF6,#F6EBD2);border-radius:0 0 36px 36px;box-shadow:0 0 0 4px #E3B04B,0 14px 30px rgba(0,0,0,.4)}
.clogos img{height:118px;mix-blend-mode:multiply}.clogos i{width:3px;height:96px;background:linear-gradient(#fff0,#C9971C,#fff0)}
.ctext{position:absolute;right:70px;top:190px;width:640px;color:#fff}
.ctag{display:inline-block;font:900 20px Cairo;color:#3A2400;background:linear-gradient(180deg,#FFF1B8,#FFD54A 55%,#E3A21A);border-radius:24px;padding:3px 22px}
.cover h1{margin:6px 0 0;font:900 96px/1.15 Cairo;background:linear-gradient(180deg,#FFFFFF,#FFE88A 45%,#E3A21A);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 rgba(0,0,0,.35))}
.csub{font-size:21px;color:#E8F0FA}.cline{height:3px;width:420px;margin:18px 0;background:linear-gradient(270deg,#E3B04B,transparent)}
.cby small{display:block;font-size:17px;color:#C9D8EA}.cby b{display:block;font:900 40px/1.4 Cairo;color:#FFD54A}.cby span{font-size:17px;color:#FFE3A0}
.cmeta{margin-top:16px;font-size:15px;color:#C9D8EA}
.cphoto{position:absolute;left:80px;bottom:0;width:340px;height:500px;border-radius:170px 170px 0 0;overflow:hidden;border:6px solid #E3B04B;border-bottom:0;box-shadow:0 0 50px rgba(255,214,90,.35)}
.cphoto img{width:100%;height:100%;object-fit:cover;object-position:50% 6%}`;

const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>دليل قرية الخير</title><style>${CSS}</style></head><body>${pages.join('\n')}</body></html>`;
const HTMLF = path.join(W, 'guide.html'); fs.writeFileSync(HTMLF, html);
const b = await chromium.launch({ channel: 'chrome' }); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
await pg.goto(url(HTMLF)); await pg.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 1500));
const n = await pg.evaluate(() => document.querySelectorAll('.page').length);
// فحص الفيضان: أي صفحة يتجاوز محتواها الإطار
const over = await pg.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => { const b = p.querySelector('.body'); if (!b) return null; const r = b.getBoundingClientRect(), pr = p.getBoundingClientRect(); return r.bottom > pr.bottom - 38 ? i + 1 : null; }).filter(Boolean));
await pg.pdf({ path: OUTPDF, width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
for (const k of process.argv.slice(4)) { const i = +k; await pg.evaluate(i => document.querySelectorAll('.page')[i - 1].scrollIntoView(), i); await pg.screenshot({ path: path.join(W, `p${i}.png`) }); }
await b.close();
console.log('صفحات', n, '| فيضان في الصفحات:', over.join(',') || 'لا شيء', '| PDF:', (fs.statSync(OUTPDF).size / 1048576).toFixed(1), 'MB');
