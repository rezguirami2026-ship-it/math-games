// الصف الخامس — سوق الجمعية (الوحدات ١٩–٢١ في الكتاب): قياس الأقمشة وترتيبها، مؤقت الفرن، تقويم بشهرين،
// اختيار الرف بالمساحة، وقطع الإطارات حول الصور.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable, stall } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, msgBox, btn } from '../bench.js';
import { ruler, lshape } from '../../content/chArt.js';
import { step, at, advance, kp, out, shadowE } from './common.js';

export const ST5C = { cloth: { x: 704, y: 3838 }, oven: { x: 424, y: 3840 }, calendar: { x: 1549, y: 3839 }, shelves: { x: 1044, y: 3818 }, frames: { x: 424, y: 4198 } };
const N = n => ar(n);
const sign = (c, x, y, t, bg, dx = 96) => bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg });
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'], DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const pad2 = n => String(n).padStart(2, '0');

const PROPS = {
  cloth(c, x, y) { workTable(c, x, y); ['#B0476A', '#2F6FB2', '#E3B04B'].forEach((col, k) => { c.fillStyle = col; c.fillRect(x - 26, y - 40 + k * 3, 52 - k * 8, 3); }); c.fillStyle = '#C9CED4'; c.fillRect(x + 14, y - 46, 12, 2); sign(c, x, y, '✂️ قماش الخيّاطة', '#B0476A'); },
  oven(c, x, y, d, t) { shadowE(c, x, y, 30); c.fillStyle = '#C9A06A'; c.beginPath(); c.arc(x, y - 24, 26, Math.PI, 0); c.fill(); c.fillRect(x - 26, y - 24, 52, 24); c.fillStyle = '#3B2E22'; c.beginPath(); c.arc(x, y - 14, 10, Math.PI, 0); c.fill(); c.fillRect(x - 10, y - 14, 20, 14);
    c.fillStyle = `rgba(255,${140 + 40 * Math.sin(t * 4)},40,.8)`; c.fillRect(x - 7, y - 10, 14, 8); sign(c, x, y, '🍞 فرن الخبز', '#B5651D', -96); },
  calendar(c, x, y) { shadowE(c, x, y, 26); c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 40, 4, 40); c.fillStyle = '#FFFDF6'; rr(c, x - 24, y - 80, 48, 42, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .7; c.stroke(); c.fillStyle = '#E2475C'; c.fillRect(x - 24, y - 80, 48, 9);
    c.fillStyle = '#9AA3B8'; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) c.fillRect(x - 20 + i * 9, y - 66 + j * 8, 6, 5); sign(c, x, y, '📅 تقويم الجمعية', '#E2475C'); },
  shelves(c, x, y) { shadowE(c, x, y, 34); c.fillStyle = '#8A5A30'; c.fillRect(x - 32, y - 70, 4, 70); c.fillRect(x + 28, y - 70, 4, 70); [0, 1, 2].forEach(k => { c.fillStyle = PAL.woodLight; c.fillRect(x - 32, y - 22 - k * 22, 64, 4);
    ['#E2475C', '#2F6FB2', '#FFC23D', '#2E9E5B'].forEach((col, j) => { if ((j + k) % 2) { c.fillStyle = col; c.fillRect(x - 26 + j * 14, y - 36 - k * 22, 10, 14); } }); }); sign(c, x, y, '🗄️ رفوف العرض', '#2E8B57'); },
  frames(c, x, y) { shadowE(c, x, y, 26); [[-14, '#C9A24A'], [12, '#8A5A30']].forEach(([dx, col], k) => { c.fillStyle = col; rr(c, x + dx - 14, y - 52 - k * 6, 28, 36, 2); c.fill(); c.fillStyle = '#BFE6F5'; c.fillRect(x + dx - 9, y - 47 - k * 6, 18, 26); }); sign(c, x, y, '🖼️ إطارات الصور', '#8A5A30'); }
};
const station = (k, label) => at(ST5C[k], k, label, PROPS[k]);

/* ═══ ١٩-١ قياس ورسم الخطوط — «قماش الخيّاطة» ═══ */
export const measureLines5 = Object.assign({
  id: 'measureLines5', giver: 'ruqaya',
  intro: n => [{ who: 'ruqaya', text: `أهلاً يا ${n}! أنا رقية الخيّاطة. أقيس كل شيء بالمليمتر، ولا يضيع عندي قماش.` },
    { who: 'ruqaya', text: 'السنتيمتر ١٠ مليمترات، والمتر ١٠٠ سنتيمتر. انتبه: المسطرة لا تبدأ دائماً من الصفر!' }],
  begin(d) {
    const a = R(1, 3), mm = R(23, 64); const L = shuffle([[R(31, 38), 'mm'], [R(4, 4) * 10, 'cm'], [R(41, 48), 'mm'], [R(51, 58), 'cmd']]), tot = R(11, 19) * 10, cut = R(3, 8) * 10 + 5;
    d.rounds = [{ t: 'measure', a, mm: mm % 10 ? mm : mm + 3 }, { t: 'order', L }, { t: 'left', tot, cut }]; d.r = 0; d.pick = [];
  },
  goal: d => `✂️ ساعد رقية في القماش ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'ruqaya', text: 'قماش مقصوص ومرتب بلا خطأ! تقيس وتحوّل وترتب الأطوال.' }];
    if (r.t === 'measure') return kp(this, W, d, { title: '✂️ قياس الشريط', visual: ruler({ cm: 10, seg: [r.a, r.a + r.mm / 10] }), text: 'كم <b>مليمتراً</b> طول الشريط الأحمر؟', ans: r.mm, n: 3, id: 'measureLines5', msg, kind, opts: { dot: false }, lines: L, hint: 'الشريط لا يبدأ من الصفر: اطرح بدايته من نهايته.' });
    if (r.t === 'left') return kp(this, W, d, { title: '✂️ بقية اللفّة', text: `لفّة قماش طولها <b>${dec(r.tot / 100)} م</b>، قصّت رقية منها <b>${N(r.cut)} سم</b>. كم سنتيمتراً بقي؟`, ans: r.tot - r.cut, n: 3, id: 'measureLines5', msg, kind, opts: { dot: false }, lines: L, hint: 'حوّل المتر إلى سنتيمترات (× ١٠٠) ثم اطرح.' });
    const lab = ([v, u]) => u === 'mm' ? `${N(v)} مم` : u === 'cm' ? `${N(v / 10)} سم` : `${dec(v / 10)} سم`;
    sheetOpen(`<h3>✂️ ترتيب الأقمشة</h3>${msgBox((msg ? msg + ' ' : '') + 'اضغط الأقمشة من <b>الأقصر</b> إلى <b>الأطول</b>.', kind)}
      <div class="g5slots">${d.pick.map(i => `<span class="g5slot on"><b>${lab(r.L[i])}</b></span>`).join('') || '<span class="muted">—</span>'}</div>
      <div class="g5cards">${r.L.map((x, i) => `<button class="g5card" data-i="${i}"${d.pick.includes(i) ? ' disabled' : ''}>🧵 ${lab(x)}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = async e => { e.stopPropagation(); d.pick.push(+b.dataset.i); sfx('pick');
      if (d.pick.length < r.L.length) return this.open(W, d, msg, kind);
      const seq = d.pick.map(i => r.L[i][0]); d.pick = [];
      if (seq.every((v, k) => !k || v > seq[k - 1])) await advance(this, W, d, 3, 'measureLines5', L); else { sfx('cough'); this.open(W, d, 'الترتيب غير صحيح: حوّل كل الأطوال إلى المليمتر ثم قارن.', 'bad'); } });
    out();
  }
}, station('cloth', '✂️ قماش الخيّاطة'));

/* ═══ ٢٠-١ قياس الوقت — «فرن الخبز» (مؤقت بالساعات والدقائق والثواني) ═══ */
export const measureTime5 = Object.assign({
  id: 'measureTime5', giver: 'jamal',
  intro: n => [{ who: 'jamal', text: `حياك يا ${n}! أنا جمال الخبّاز. مؤقت الفرن يحتاج من يضبطه بدقة.` },
    { who: 'jamal', text: 'احسب مدة الخَبز من الجدول، ثم اضبط المؤقت بالساعات والدقائق والثواني.' }],
  begin(d) { const a = R(8, 11) * 60 + R(30, 55), d1 = R(25, 50), b = R(12, 14) * 60 + R(1, 11) * 5, d2 = 60 + R(1, 11) * 5, s3 = R(2, 4) * 60 + R(1, 5) * 10;
    d.rounds = [{ say: `الكعك يدخل الفرن <b>${this.hm(a)}</b> ويخرج <b>${this.hm(a + d1)}</b>. اضبط المؤقت على مدة الخَبز.`, ans: d1 * 60 }, { say: `الخبز يدخل <b>${this.hm(b)}</b> ويخرج <b>${this.hm(b + d2)}</b>. اضبط المؤقت.`, ans: d2 * 60 }, { say: `وصفة الرقاق تقول: <b>${N(s3)} ثانية</b>. اضبط المؤقت بالدقائق والثواني.`, ans: s3 }];
    d.r = 0; d.sec = 0; },
  hm(m) { return `<span class="ltr" dir="ltr">${ar(pad2(Math.floor(m / 60) % 24))}:${ar(pad2(m % 60))}</span>`; },
  goal: d => `🍞 اضبط فرن جمال ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], h = Math.floor(d.sec / 3600), m = Math.floor(d.sec % 3600 / 60), s = d.sec % 60;
    sheetOpen(`<h3>🍞 مؤقت الفرن</h3>${msgBox((msg ? msg + ' ' : '') + r.say, kind)}
      <div class="g5digital">${`<span class="ltr" dir="ltr">${ar(h)}:${ar(pad2(m))}:${ar(pad2(s))}</span>`}</div><p class="muted">ساعات : دقائق : ثوانٍ</p>
      <div class="row2" style="direction:ltr">${[[3600, '+١ ساعة'], [600, '+١٠ د'], [60, '+١ د'], [10, '+١٠ ث']].map(([v, l]) => `<button class="act" data-s="${v}">${l}</button>`).join('')}<button class="act ghost" id="sClr">٠</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔥 شغّل الفرن</button></div>`);
    panel().querySelectorAll('[data-s]').forEach(b => b.onclick = e => { e.stopPropagation(); d.sec = Math.min(4 * 3600, d.sec + +b.dataset.s); sfx('click'); this.open(W, d, msg, kind); });
    btn('sClr', () => { d.sec = 0; this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.sec === r.ans) { d.sec = 0; await advance(this, W, d, 3, 'measureTime5', [{ who: 'jamal', text: 'خبز ذهبي في وقته تماماً! تحسب المدد وتحوّل بين الساعات والدقائق والثواني.' }]); }
      else { sfx('cough'); this.open(W, d, d.sec < r.ans ? 'المؤقت أقصر من اللازم: سيخرج الخبز نيئاً!' : 'المؤقت أطول من اللازم: سيحترق الخبز!', 'bad'); }
    });
  }
}, station('oven', '🍞 فرن الخبز'));

/* ═══ ٢٠-٢ استخدام التقويمات — «تقويم الجمعية» (تاريخ عبر شهرين، شهر بعد أشهر، الأعمار) ═══ */
export const calendars5 = Object.assign({
  id: 'calendars5', giver: 'hessa',
  intro: n => [{ who: 'hessa', text: `مرحباً يا ${n}! أنا حصة، أنظّم مواعيد الجمعية على التقويم.` },
    { who: 'hessa', text: 'تذكّر عدد أيام كل شهر: أبريل ويونيو وسبتمبر ونوفمبر ٣٠ يوماً، وفبراير ٢٨، والباقي ٣١.' }],
  begin(d) { const m = [2, 4, 6, 7][R(0, 3)], day = R(20, 27), gap = R(DAYS[m] - day + 3, DAYS[m] - day + 12), first = R(0, 6), m0 = R(0, 4), k = R(4, 7), y = R(2013, 2017);
    d.rounds = [{ t: 'date', m, day, gap, first }, { t: 'month', m0, k }, { t: 'age', y }]; d.r = 0; },
  goal: d => `📅 نظّم تقويم حصة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hessa', text: 'المواعيد كلها في مكانها! تحسب الأيام والشهور والسنوات بدقة.' }];
    if (r.t === 'age') return kp(this, W, d, { title: '🎂 أعمار الأعضاء', text: `انضمّ عضو إلى الجمعية عام <b>${N(r.y)}</b>. كم سنة مضت على انضمامه في عام <b>${N(2026)}</b>؟`, ans: 2026 - r.y, n: 3, id: 'calendars5', msg, kind, opts: { dot: false }, lines: L, hint: 'اطرح السنة الأقدم من الأحدث.' });
    if (r.t === 'month') {
      sheetOpen(`<h3>📅 موعد بعد أشهر</h3>${msgBox((msg ? msg + ' ' : '') + `سوق الجمعية الكبير في <b>${MONTHS[r.m0]}</b>، والسوق التالي بعد <b>${N(r.k)}</b> أشهر. اضغط شهره.`, kind)}
        <div class="g5cards">${MONTHS.map((x, i) => `<button class="g5card" data-m="${i}">${x}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-m]').forEach(b => b.onclick = async e => { e.stopPropagation(); const i = +b.dataset.m;
        if (i === r.m0 + r.k) await advance(this, W, d, 3, 'calendars5', L); else { sfx('cough'); this.open(W, d, `${MONTHS[i]} بعد ${N((i - r.m0 + 12) % 12)} أشهر من ${MONTHS[r.m0]}، وليس بعد ${N(r.k)}.`, 'bad'); } });
      return out();
    }
    const cal = (mi, f0) => `<div class="g5cal small"><div class="ttl">${MONTHS[mi]}</div>${Array.from({ length: f0 }, () => '<span></span>').join('')}${Array.from({ length: DAYS[mi] }, (_, i) => `<button class="g5day${mi === r.m && i + 1 === r.day ? ' today' : ''}" data-d="${mi}-${i + 1}">${N(i + 1)}</button>`).join('')}</div>`;
    sheetOpen(`<h3>📅 تقويم الجمعية</h3>${msgBox((msg ? msg + ' ' : '') + `اليوم <b>${N(r.day)} ${MONTHS[r.m]}</b>. موعد التسليم بعد <b>${N(r.gap)}</b> يوماً. اضغط تاريخه.`, kind)}
      <div class="g5two">${cal(r.m, r.first)}${cal(r.m + 1, (r.first + DAYS[r.m]) % 7)}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-d]').forEach(b => b.onclick = async e => { e.stopPropagation(); const [mi, dd] = b.dataset.d.split('-').map(Number), want = r.day + r.gap - DAYS[r.m];
      if (mi === r.m + 1 && dd === want) await advance(this, W, d, 3, 'calendars5', L);
      else { const got = mi === r.m ? dd - r.day : DAYS[r.m] - r.day + dd; sfx('cough'); this.open(W, d, `هذا التاريخ بعد ${N(got)} يوماً، والمطلوب ${N(r.gap)}. أكمل أيام ${MONTHS[r.m]} أولاً.`, 'bad'); } });
    out();
  }
}, station('calendar', '📅 تقويم الجمعية'));

/* ═══ ٢١-١ المساحة (٢) — «رفوف العرض» (اختيار الرف بالمساحة، الضلع الناقص، شكل مركّب) ═══ */
export const area5b = Object.assign({
  id: 'area5b', giver: 'saud',
  intro: n => [{ who: 'saud', text: `أهلاً يا ${n}! أنا سعود. بضائع الجمعية الجديدة تحتاج رفوفاً بمساحات محددة.` },
    { who: 'saud', text: 'مساحة المستطيل = الطول × العرض. احسب قبل أن تختار.' }],
  begin(d) { const A = [24, 30, 36, 40, 48][R(0, 4)], fac = []; for (let a = 2; a * a <= A; a++) if (A % a === 0 && A / a <= 12) fac.push([A / a, a]); const good = fac[R(0, fac.length - 1)];
    const opts = shuffle([good, [good[0] + 1, good[1]], [good[0], good[1] + 1], [good[0] - 1, good[1] + 1]].filter(([a, b]) => a * b !== A || (a === good[0] && b === good[1])));
    const W2 = R(3, 9), L2 = R(5, 12), BW = R(7, 10), BH = R(5, 8), w = R(2, BW - 3), h = R(2, BH - 3);
    d.rounds = [{ t: 'pick', A, opts, good }, { t: 'side', A: L2 * W2, L: L2, ans: W2 }, { t: 'L', BW, BH, w, h }]; d.r = 0; },
  goal: d => `🗄️ جهّز رفوف سعود ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'saud', text: 'الرفوف على مقاسها تماماً! تستخدم قانون المساحة كالمهندسين.' }];
    if (r.t === 'side') return kp(this, W, d, { title: '🗄️ عرض الرف', text: `رف مساحته <b>${N(r.A)} سم²</b> وطوله <b>${N(r.L)} سم</b>. كم سنتيمتراً عرضه؟`, ans: r.ans, n: 3, id: 'area5b', msg, kind, opts: { dot: false }, lines: L, hint: 'العرض = المساحة ÷ الطول.' });
    if (r.t === 'L') return kp(this, W, d, { title: '🗄️ أرضية المعرض', visual: lshape(r.BW, r.BH, r.w, r.h, 'م'), text: 'كم متراً مربعاً مساحة أرضية المعرض؟', ans: r.BW * r.BH - r.w * r.h, n: 3, id: 'area5b', msg, kind, opts: { dot: false }, lines: L, hint: 'قسّم الشكل إلى مستطيلين، أو اطرح الركن المقصوص من المستطيل الكامل.' });
    const s = 12;
    sheetOpen(`<h3>🗄️ اختر الرف</h3>${msgBox((msg ? msg + ' ' : '') + `علب العطور تحتاج رفاً مساحته <b>${N(r.A)} سم²</b> تماماً. اضغط الرف المناسب.`, kind)}
      <div class="g5cards">${r.opts.map(([a, b], i) => `<button class="g5card shelf" data-o="${i}"><svg viewBox="0 0 ${a * s + 4} ${b * s + 4}" style="width:${a * s * .9}px"><rect x="2" y="2" width="${a * s}" height="${b * s}" fill="#E8C99A" stroke="${INK}" stroke-width="2"/></svg><small>${N(a)} سم × ${N(b)} سم</small></button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-o]').forEach(b => b.onclick = async e => { e.stopPropagation(); const [a, c] = r.opts[+b.dataset.o];
      if (a * c === r.A) await advance(this, W, d, 3, 'area5b', L); else { sfx('cough'); this.open(W, d, `مساحة هذا الرف ${N(a)} × ${N(c)} = ${N(a * c)} سم²، وليست ${N(r.A)}.`, 'bad'); } });
    out();
  }
}, station('shelves', '🗄️ رفوف العرض'));

/* ═══ ٢١-٢ المحيط (٢) — «إطارات الصور» (قطع إطار من كومة، ومحيط إطار منتظم) ═══ */
export const perimeter5b = Object.assign({
  id: 'perimeter5b', giver: 'latifa',
  intro: n => [{ who: 'latifa', text: `أهلاً يا ${n}! أنا لطيفة. أصنع إطارات للصور من قطع خشبية.` },
    { who: 'latifa', text: 'الإطار يحيط بالصورة: قطعتان بطولها وقطعتان بعرضها. ومحيطه مجموع القطع كلها.' }],
  begin(d) { const Lp = R(18, 30), Wp = R(10, 16), pile = shuffle([Lp, Lp, Wp, Wp, Lp + 2, Wp - 1, Lp - 3]), s = R(6, 14), n6 = [5, 6, 8][R(0, 2)];
    d.rounds = [{ t: 'pile', Lp, Wp, pile }, { t: 'per', Lp, Wp }, { t: 'reg', s, n: n6 }]; d.r = 0; d.sel = []; },
  goal: d => `🖼️ اصنع إطارات لطيفة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'latifa', text: 'إطارات متقنة بلا قطعة زائدة! تحسب المحيط لكل شكل.' }];
    if (r.t === 'per') return kp(this, W, d, { title: '🖼️ شريط الزينة', text: `نريد شريط زينة حول الإطار الذي صنعته (${N(r.Lp)} سم × ${N(r.Wp)} سم). كم سنتيمتراً طوله؟`, ans: 2 * (r.Lp + r.Wp), n: 3, id: 'perimeter5b', msg, kind, opts: { dot: false }, lines: L, hint: 'المحيط = ٢ × (الطول + العرض).' });
    if (r.t === 'reg') return kp(this, W, d, { title: '🖼️ إطار منتظم', text: `إطار على شكل مضلع منتظم له <b>${N(r.n)}</b> أضلاع، طول كل ضلع <b>${N(r.s)} سم</b>. كم سنتيمتراً من الخشب نحتاج؟`, ans: r.n * r.s, n: 3, id: 'perimeter5b', msg, kind, opts: { dot: false }, lines: L, hint: 'الأضلاع متساوية: عددها × طول الضلع.' });
    sheetOpen(`<h3>🖼️ قطع الإطار</h3>${msgBox((msg ? msg + ' ' : '') + `صورة طولها <b>${N(r.Lp)} سم</b> وعرضها <b>${N(r.Wp)} سم</b>. اختر ٤ قطع تصنع إطارها.`, kind)}
      <div class="g5cards">${r.pile.map((v, i) => `<button class="g5card strip${d.sel.includes(i) ? ' on' : ''}" data-i="${i}">🪵 ${N(v)} سم</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.sel.length === 4 ? '' : ' disabled'}>🔨 ركّب الإطار</button></div>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else if (d.sel.length < 4) d.sel.push(i); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const v = d.sel.map(i => r.pile[i]).sort((a, b) => a - b), want = [r.Wp, r.Wp, r.Lp, r.Lp].sort((a, b) => a - b); d.sel = [];
      if (v.every((x, i) => x === want[i])) await advance(this, W, d, 3, 'perimeter5b', L);
      else { sfx('cough'); this.open(W, d, 'القطع لا تحيط بالصورة تماماً: نحتاج قطعتين بطول الصورة وقطعتين بعرضها.', 'bad'); } });
  }
}, station('frames', '🖼️ إطارات الصور'));

export const G5U7 = { measureLines5, measureTime5, calendars5, area5b, perimeter5b };
