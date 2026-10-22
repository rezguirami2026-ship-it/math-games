// الصف الخامس — طريق القافلة (الوحدات ٢٢–٢٦ في الكتاب): تسعة دروس في العدد والكسور والنسبة.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable, stall } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, msgBox, btn } from '../bench.js';
import { H, step, at, advance, kp, out, shadowE } from './common.js';

export const ST5K = {
  camelCalc: { x: 446, y: 5018 }, stations: { x: 866, y: 5018 }, waterskins: { x: 1526, y: 5018 }, flags: { x: 2190, y: 5019 }, loaves: { x: 1306, y: 5339 },   /* الصف الجنوبي خلف الشارع لا على حافته */
  loads: { x: 1746, y: 5018 }, dates: { x: 506, y: 4718 }, well: { x: 944, y: 4738 }, coffee: { x: 1385, y: 4739 }
};
const N = n => ar(n);
const fr = (n, d) => `<span class="frac"><b>${ar(n)}</b><i>${ar(d)}</i></span>`;
const pc = v => `${ar(v)}٪`;
const sign = (c, x, y, t, bg, dx = 96) => bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg });

const PROPS = {
  camelCalc(c, x, y, d, t) { shadowE(c, x, y, 30); c.fillStyle = '#C9A06A'; c.beginPath(); c.ellipse(x, y - 24, 22, 11, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(x - 4, y - 36, 9, 8, 0, 0, 7); c.fill(); c.fillRect(x + 16, y - 48, 5, 22); c.beginPath(); c.ellipse(x + 22, y - 50, 7, 5, 0, 0, 7); c.fill();
    c.fillStyle = '#8A5A30'; [-12, -4, 8, 14].forEach(dx => c.fillRect(x + dx, y - 16, 3, 16)); sign(c, x, y, '🐪 حساب الجمّال', '#B5651D', -98); },
  stations(c, x, y) { shadowE(c, x, y, 20); c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 60, 4, 60); [['#2F6FB2', -1], ['#E2475C', 1]].forEach(([col, k], i) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 58 + i * 16); c.lineTo(x + k * 28, y - 52 + i * 16); c.lineTo(x, y - 46 + i * 16); c.fill(); }); sign(c, x, y, '🚏 مسافات المحطات', '#2F6FB2'); },
  waterskins(c, x, y) { shadowE(c, x, y, 26); ['#8A5A30', '#A0703A', '#7A4B22'].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.ellipse(x - 16 + k * 16, y - 14, 8, 13, 0, 0, 7); c.fill(); c.fillStyle = '#5BA9CC'; c.fillRect(x - 18 + k * 16, y - 24, 4, 4); }); sign(c, x, y, '💧 قِرَب الماء', '#1F5D7A'); },
  flags(c, x, y, d, t) { shadowE(c, x, y, 26); [['#E2475C', -16], ['#FFC23D', 0], ['#2E9E5B', 16]].forEach(([col, dx], k) => { c.fillStyle = PAL.wood; c.fillRect(x + dx - 1, y - 56, 2, 56); c.fillStyle = col; c.beginPath(); c.moveTo(x + dx + 1, y - 56); c.lineTo(x + dx + 14 + Math.sin(t * 3 + k) * 2, y - 50); c.lineTo(x + dx + 1, y - 44); c.fill(); }); sign(c, x, y, '🚩 رايات القافلة', '#C0392B', -100); },
  loaves(c, x, y) { workTable(c, x, y); [[-14, 1], [10, .75]].forEach(([dx, k]) => { c.fillStyle = '#D9A866'; c.beginPath(); c.moveTo(x + dx, y - 38); c.arc(x + dx, y - 38, 10, -Math.PI / 2, -Math.PI / 2 + k * 2 * Math.PI); c.closePath(); c.fill(); }); sign(c, x, y, '🫓 أرغفة الرحلة', '#B5651D'); },
  loads(c, x, y) { shadowE(c, x, y, 30); [[-18, '#C46A1E', 22], [6, '#8A5A30', 30], [26, '#B8413A', 18]].forEach(([dx, col, h]) => { c.fillStyle = col; rr(c, x + dx - 9, y - h, 18, h, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .6; c.stroke(); }); sign(c, x, y, '📦 أحمال الجمال', '#8A5A30'); },
  dates(c, x, y) { workTable(c, x, y); c.fillStyle = '#7A3E1C'; for (let k = 0; k < 9; k++) { c.beginPath(); c.ellipse(x - 20 + (k % 5) * 9, y - 38 - Math.floor(k / 5) * 5, 3.5, 2.2, 0, 0, 7); c.fill(); } sign(c, x, y, '🌴 تقاسم التمر', '#7A3E1C', -98); },
  well(c, x, y) { shadowE(c, x, y, 30); c.fillStyle = '#9A8F84'; rr(c, x - 24, y - 26, 48, 26, 6); c.fill(); c.fillStyle = '#1F5D7A'; c.beginPath(); c.ellipse(x, y - 26, 20, 6, 0, 0, 7); c.fill(); c.fillStyle = PAL.wood; c.fillRect(x - 24, y - 60, 4, 34); c.fillRect(x + 20, y - 60, 4, 34); c.fillRect(x - 24, y - 62, 48, 4);
    c.fillStyle = '#8A5A30'; c.fillRect(x - 5, y - 50, 10, 10); sign(c, x, y, '🪣 لغز البئر', '#1F5D7A'); },
  coffee(c, x, y, d, t) { workTable(c, x, y); c.fillStyle = '#C9A24A'; c.beginPath(); c.moveTo(x - 6, y - 32); c.lineTo(x + 6, y - 32); c.lineTo(x + 4, y - 52); c.lineTo(x - 4, y - 52); c.fill(); c.beginPath(); c.moveTo(x + 4, y - 48); c.quadraticCurveTo(x + 16, y - 52, x + 14, y - 44); c.strokeStyle = '#C9A24A'; c.lineWidth = 2; c.stroke();
    c.fillStyle = `rgba(255,255,255,${.4 + .3 * Math.sin(t * 3)})`; c.fillRect(x - 1, y - 62, 2, 8); sign(c, x, y, '☕ وصفة القهوة', '#6B4520'); }
};
const station = (k, label) => at(ST5K[k], k, label, PROPS[k]);

/* اختيار من بطاقات ثم سؤال بلوحة الأرقام: نمط تتشاركه عدة مهام */
function pickThen(mod, W, d, o) {
  if (d.picked === d.r) return kp(mod, W, d, Object.assign({}, o.after, { msg: o.msg, kind: o.kind }));
  if (!d.order) d.order = {}; const opts = d.order[d.r] = d.order[d.r] || shuffle(o.opts);
  sheetOpen(`<h3>${o.title}</h3>${msgBox((o.msg ? o.msg + ' ' : '') + o.text, o.kind)}<div class="g5cards col">${opts.map((x, i) => `<button class="g5card" data-o="${i}">${x}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
  panel().querySelectorAll('[data-o]').forEach(b => b.onclick = e => { e.stopPropagation();
    if (opts[+b.dataset.o] === o.right) { d.picked = d.r; sfx('drop'); changed(); mod.open(W, d, '✓ استراتيجية صحيحة! الآن احسب.', 'ok'); } else { sfx('cough'); mod.open(W, d, o.bad, 'bad'); } });
  out();
}

/* ═══ ٢٢-١ استخدام الاستراتيجيات الذهنية — «حساب الجمّال» ═══ */
export const mentalStrategies5 = Object.assign({
  id: 'mentalStrategies5', giver: 'mansour',
  intro: n => [{ who: 'mansour', text: `أهلاً يا ${n}! أنا منصور الجمّال. نحسب أحمال القافلة في رؤوسنا بلا ورق.` },
    { who: 'mansour', text: 'اختر الحيلة المناسبة لكل عملية، ثم احسب الجواب.' }],
  begin(d) { const a = R(2001, 7999), k = [299, 399, 499][R(0, 2)], b = R(14, 39), m = [19, 21][R(0, 1)], c = R(3, 7) * 1000 + R(1, 9), e = c - 1000 - R(2, 9);
    d.rounds = [{ q: `${N(a)} − ${N(k)}`, right: `اطرح ${N(k + 1)} ثم أضف ١`, wrong: [`اطرح ${N(k + 1)} ثم اطرح ١`, `اطرح ${N(k - 99)} ثم اطرح ٩٩`], ans: a - k },
      { q: `${N(b)} × ${N(m)}`, right: `${N(b)} × ٢٠ ثم ${m === 19 ? 'اطرح' : 'أضف'} ${N(b)}`, wrong: [`${N(b)} × ٢٠ ثم ${m === 19 ? 'أضف' : 'اطرح'} ${N(b)}`, `${N(b)} × ١٠ ثم ضاعف`], ans: b * m },
      { q: `${N(c)} − ${N(e)}`, right: `عُدّ من ${N(e)} إلى ${N(Math.ceil(e / 1000) * 1000)} ثم إلى ${N(c)}`, wrong: [`اجمع ${N(c)} و${N(e)}`, `اطرح ١٠٠٠ ثم أضف ${N(c % 10)}`], ans: c - e }];
    d.r = 0; d.picked = -1; },
  goal: d => `🐪 احسب مع منصور ${step(d, 3)}`,
  open(W, d, msg, kind) { const r = d.rounds[d.r];
    pickThen(this, W, d, { title: '🐪 حساب الجمّال', text: `ما الحيلة الأنسب لحساب <b>${r.q}</b>؟`, opts: [r.right, ...r.wrong], right: r.right, bad: 'هذه الحيلة لا تعطي الجواب الصحيح: فكّر ماذا أضفنا أو طرحنا زيادة.', msg, kind,
      after: { title: '🐪 الجواب', text: `${r.q} = ؟ (${r.right})`, ans: r.ans, n: 3, id: 'mentalStrategies5', opts: { dot: false }, hint: 'طبّق الحيلة خطوة خطوة.', lines: [{ who: 'mansour', text: 'حسابات القافلة صحيحة كلها! تختار الحيلة الذهنية المناسبة.' }] } }); }
}, station('camelCalc', '🐪 حساب الجمّال'));

/* ═══ ٢٣-١ الأعداد العشرية والكسور العشرية — «مسافات المحطات» (منزلق على خط أعداد) ═══ */
export const decimalsFractions5 = Object.assign({
  id: 'decimalsFractions5', giver: 'sultan',
  intro: n => [{ who: 'sultan', text: `مرحباً يا ${n}! أنا سلطان دليل القافلة. على الخريطة محطات بين المدن، ومسافاتها أعداد عشرية.` },
    { who: 'sultan', text: 'حرّك العلامة على خط الأعداد إلى مكان المحطة تماماً.' }],
  begin(d) { const a = R(1, 9) / 10, w = R(2, 6), b = w + R(11, 89) / 100, v = R(1015, 8985) / 100;
    d.rounds = [{ lo: 0, hi: 1, st: 0.1, v: a }, { lo: w, hi: w + 1, st: 0.01, v: Math.round(b * 100) / 100 }, { t: 'rnd', v: v % 1 === 0.5 ? v + 0.01 : v }]; d.r = 0; d.pos = null; },
  goal: d => `🚏 ضع المحطات على الخريطة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'sultan', text: 'المحطات في أماكنها بدقة جزء من مئة! تعرف الأعداد العشرية جيداً.' }];
    if (r.t === 'rnd') return kp(this, W, d, { title: '🚏 لوحة الطريق', text: `المسافة إلى الواحة <b>${dec(r.v)}</b> كم. اكتبها على اللوحة مقرّبة لأقرب كيلومتر.`, ans: Math.round(r.v), n: 3, id: 'decimalsFractions5', msg, kind, opts: { dot: false }, lines: L, hint: 'انظر إلى رقم الأجزاء من عشرة.' });
    const n = Math.round((r.hi - r.lo) / r.st), pos = d.pos === null ? Math.round(n / 2) : d.pos, val = Math.round((r.lo + pos * r.st) * 100) / 100;
    const ticks = Array.from({ length: n + 1 }, (_, i) => i).filter(i => r.st === 0.1 || i % 10 === 0 || i % 5 === 0);
    sheetOpen(`<h3>🚏 خط المسافات</h3>${msgBox((msg ? msg + ' ' : '') + `ضع المحطة عند <b>${dec(r.v)}</b> كم.`, kind)}
      <div class="g5nl"><div class="bar">${ticks.map(i => `<i style="left:${i / n * 100}%" class="${i % (r.st === 0.1 ? 5 : 10) === 0 ? 'big' : ''}"></i>`).join('')}<b style="left:${pos / n * 100}%">▼</b></div>
        <div class="lab"><span>${dec(r.lo)}</span><span>${dec(r.hi)}</span></div></div>
      <input type="range" id="nlR" min="0" max="${n}" step="1" value="${pos}" class="g5range">
      <p class="muted">العلامة الآن عند: <b id="nlV">${dec(val)}</b></p>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🚏 ثبّت المحطة</button></div>`);
    const cur = () => Math.round((r.lo + (d.pos === null ? pos : d.pos) * r.st) * 100) / 100;   /* المنزلق يحدّث العلامة فقط: إعادة رسم اللوحة تقطع السحب */
    panel().querySelector('#nlR').addEventListener('input', e => { d.pos = +e.target.value; panel().querySelector('.g5nl .bar b').style.left = d.pos / n * 100 + '%'; panel().querySelector('#nlV').textContent = dec(cur()); });
    out();
    btn('benchGo', async () => {
      const v = cur(); if (H(v) === H(r.v)) { d.pos = null; await advance(this, W, d, 3, 'decimalsFractions5', L); }
      else { sfx('cough'); this.open(W, d, `العلامة عند ${dec(v)}، والمحطة عند ${dec(r.v)}: ${v < r.v ? 'تحرّك إلى اليمين' : 'تحرّك إلى اليسار'}.`, 'bad'); }
    });
  }
}, station('stations', '🚏 مسافات المحطات'));

/* ═══ ٢٤-١ النسب المئوية — «قِرَب الماء» (تلوين شبكة المئة) ═══ */
export const percentages5 = Object.assign({
  id: 'percentages5', giver: 'lubna',
  intro: n => [{ who: 'lubna', text: `أهلاً يا ${n}! أنا لبنى. كل قربة ماء مقسومة مئة جزء، والنسبة المئوية تخبرنا كم جزءاً امتلأ.` },
    { who: 'lubna', text: 'املأ القربة بالنسبة المطلوبة: ١٠ أجزاء أو جزءاً واحداً في كل ضغطة.' }],
  begin(d) { const a = R(12, 88), h = [[50, 'النصف'], [25, 'الربع'], [75, 'ثلاثة أرباع']][R(0, 2)], tot = R(2, 8) * 20, p = [10, 25, 50][R(0, 2)];
    d.rounds = [{ t: 'fill', v: a, say: `املأ القربة <b>${pc(a)}</b>.` }, { t: 'fill', v: h[0], say: `املأ <b>${h[1]}</b> القربة.` }, { t: 'of', tot, p }]; d.r = 0; d.k = 0; },
  goal: d => `💧 املأ قِرَب لبنى ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'lubna', text: 'القِرَب ممتلئة بالنسب الصحيحة! تعرف أن النسبة المئوية أجزاء من مئة.' }];
    if (r.t === 'of') return kp(this, W, d, { title: '💧 قِرَب القافلة', text: `في القافلة <b>${N(r.tot)}</b> قربة، و<b>${pc(r.p)}</b> منها للجمال. كم قربة للجمال؟`, ans: r.tot * r.p / 100, n: 3, id: 'percentages5', msg, kind, opts: { dot: false }, lines: L, hint: r.p === 50 ? '٥٠٪ = النصف.' : r.p === 25 ? '٢٥٪ = الربع.' : '١٠٪ = العُشر.' });
    sheetOpen(`<h3>💧 قربة الماء</h3>${msgBox((msg ? msg + ' ' : '') + r.say, kind)}
      <div class="g5center"><div class="g5g100">${Array.from({ length: 100 }, (_, i) => `<i class="${i < d.k ? 'on' : ''}"></i>`).join('')}</div></div>
      <p class="muted">الممتلئ الآن: ${pc(d.k)}</p>
      <div class="row2" style="direction:ltr">${[[-10, '−١٠'], [-1, '−١'], [1, '+١'], [10, '+١٠']].map(([v, l]) => `<button class="act" data-k="${v}">${l}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">💧 اربط القربة</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); d.k = Math.max(0, Math.min(100, d.k + +b.dataset.k)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { if (d.k === r.v) { d.k = 0; await advance(this, W, d, 3, 'percentages5', L); } else { sfx('cough'); this.open(W, d, d.k < r.v ? 'القربة لم تمتلئ بالقدر المطلوب.' : 'فاضت القربة! أكثر من المطلوب.', 'bad'); } });
  }
}, station('waterskins', '💧 قِرَب الماء'));

/* ═══ ٢٤-٢ الكسور المتكافئة والعشرية والمئوية — «رايات القافلة» (لكل كسر رايتاه) ═══ */
const TRIO = [[1, 2, 0.5, 50], [1, 4, 0.25, 25], [3, 4, 0.75, 75], [1, 5, 0.2, 20], [2, 5, 0.4, 40], [1, 10, 0.1, 10], [7, 10, 0.7, 70], [3, 5, 0.6, 60]];
export const equivFractions5 = Object.assign({
  id: 'equivFractions5', giver: 'wafa',
  intro: n => [{ who: 'wafa', text: `هلا يا ${n}! أنا وفاء. لكل جمل راية بكسر، ويجب أن ترفرف بجانبها رايتا عددها العشري ونسبتها المئوية.` },
    { who: 'wafa', text: 'اختر الراية العشرية والراية المئوية المساويتين للكسر.' }],
  begin(d) { d.rounds = shuffle(TRIO).slice(0, 3); d.r = 0; d.sel = {}; },
  goal: d => `🚩 ارفع رايات وفاء ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r]; if (!d.cards) d.cards = {};
    const cards = d.cards[d.r] = d.cards[d.r] || { decs: shuffle([r[2], ...shuffle(TRIO.filter(x => x[3] !== r[3]).map(x => x[2])).slice(0, 3)]), pcs: shuffle([r[3], ...shuffle(TRIO.filter(x => x[3] !== r[3]).map(x => x[3])).slice(0, 3)]) };
    sheetOpen(`<h3>🚩 راية ${N(d.r + 1)}: ${fr(r[0], r[1])}</h3>${msgBox((msg ? msg + ' ' : '') + `اختر العدد العشري والنسبة المئوية المساويين لـ ${fr(r[0], r[1])}.`, kind)}
      <p class="muted">العدد العشري:</p><div class="g5cards">${cards.decs.map(v => `<button class="g5card${d.sel.d === v ? ' on' : ''}" data-d="${v}">${dec(v)}</button>`).join('')}</div>
      <p class="muted">النسبة المئوية:</p><div class="g5cards">${cards.pcs.map(v => `<button class="g5card${d.sel.p === v ? ' on' : ''}" data-p="${v}">${pc(v)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.sel.d !== undefined && d.sel.p !== undefined ? '' : ' disabled'}>🚩 ارفع الرايات</button></div>`);
    panel().querySelectorAll('[data-d]').forEach(b => b.onclick = e => { e.stopPropagation(); d.sel.d = +b.dataset.d; sfx('click'); this.open(W, d, msg, kind); });
    panel().querySelectorAll('[data-p]').forEach(b => b.onclick = e => { e.stopPropagation(); d.sel.p = +b.dataset.p; sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const ok1 = H(d.sel.d) === H(r[2]), ok2 = d.sel.p === r[3]; d.sel = {};
      if (ok1 && ok2) await advance(this, W, d, 3, 'equivFractions5', [{ who: 'wafa', text: 'الرايات متطابقة! الكسر والعدد العشري والنسبة المئوية قيمة واحدة.' }]);
      else { sfx('cough'); this.open(W, d, !ok1 ? 'الراية العشرية لا تساوي الكسر: حوّله إلى أجزاء من عشرة أو مئة.' : 'الراية المئوية لا تساوي الكسر: كم من مئة؟', 'bad'); } });
  }
}, station('flags', '🚩 رايات القافلة'));

/* ═══ ٢٤-٣ الأعداد الكسرية والكسور غير الاعتيادية — «أرغفة الرحلة» ═══ */
export const mixedNumbers5 = Object.assign({
  id: 'mixedNumbers5', giver: 'buthaina',
  intro: n => [{ who: 'buthaina', text: `أهلاً يا ${n}! أنا بثينة. قطّعتُ أرغفة الرحلة أرباعاً وأثلاثاً.` },
    { who: 'buthaina', text: 'حوّل القطع إلى أرغفة كاملة وقطع باقية، أو العكس.' }],
  begin(d) { const d1 = [3, 4, 5][R(0, 2)], w1 = R(1, 3), n1 = R(1, d1 - 1), d2 = [3, 4][R(0, 1)], w2 = R(1, 3), n2 = R(1, d2 - 1);
    d.rounds = [{ t: 'toMixed', dd: d1, num: w1 * d1 + n1, w: w1, n: n1 }, { t: 'toImp', dd: d2, w: w2, n: n2 }, { t: 'toMixed', dd: d2, num: (w2 + 1) * d2 + 1, w: w2 + 1, n: 1 }]; d.r = 0; d.a = 0; d.b = 0; },
  goal: d => `🫓 رتّب أرغفة بثينة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'buthaina', text: 'الأرغفة مرتبة: كاملة وقطعاً! تحوّل بين الكسور غير الاعتيادية والأعداد الكسرية.' }];
    const ctl = (k, lab, v) => `<div class="cnt g5cnt"><span>${lab}</span><button class="act ghost" data-k="${k}" data-v="-1">−</button><b>${N(v)}</b><button class="act ghost" data-k="${k}" data-v="1">+</button></div>`;
    const piece = r.dd === 3 ? 'أثلاث' : r.dd === 4 ? 'أرباع' : 'أخماس';
    const say = r.t === 'toMixed' ? `معنا ${fr(r.num, r.dd)} رغيف (أي ${N(r.num)} ${piece}). كم رغيفاً كاملاً وكم قطعة باقية؟` : `معنا ${N(r.w)} ${fr(r.n, r.dd)} رغيف. كم قطعة (${piece}) في المجموع؟`;
    sheetOpen(`<h3>🫓 الأرغفة</h3>${msgBox((msg ? msg + ' ' : '') + say, kind)}
      <div class="row2">${r.t === 'toMixed' ? ctl('a', 'أرغفة كاملة', d.a) + ctl('b', `قطع (${piece})`, d.b) : ctl('a', `كل القطع (${piece})`, d.a)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🫓 رتّب السلة</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k; d[k] = Math.max(0, Math.min(30, d[k] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const ok = r.t === 'toMixed' ? d.a === r.w && d.b === r.n : d.a === r.w * r.dd + r.n;
      if (ok) { d.a = 0; d.b = 0; await advance(this, W, d, 3, 'mixedNumbers5', L); }
      else { sfx('cough'); this.open(W, d, r.t === 'toMixed' ? `كل رغيف كامل = ${N(r.dd)} قطع. اقسم ${N(r.num)} على ${N(r.dd)}: الناتج أرغفة كاملة والباقي قطع.` : `كل رغيف كامل = ${N(r.dd)} قطع: اضرب ثم أضف القطع الباقية.`, 'bad'); }
    });
  }
}, station('loaves', '🫓 أرغفة الرحلة'));

/* ═══ ٢٥-١ الجمع والطرح (٢) — «أحمال الجمال» (حملان مجموعهما الحمولة) ═══ */
export const addSub5b = Object.assign({
  id: 'addSub5b', giver: 'faisal',
  intro: n => [{ who: 'faisal', text: `حياك يا ${n}! أنا فيصل. كل جمل يحمل حملين على جانبيه، ومجموعهما يجب أن يساوي حمولته.` },
    { who: 'faisal', text: 'اختر حملين مجموعهما الحمولة بالضبط. الأوزان بالكيلوغرام وفيها منزلتان عشريتان.' }],
  begin(d) { const mk = () => { const a = R(1201, 3999), b = R(1201, 3999), others = [a + R(11, 99), b - R(11, 99), a + b - R(1201, 2000)].filter(x => x > 0 && x !== a && x !== b); return { bags: shuffle([a, b, ...others.slice(0, 3)]).map(x => x / 100), cap: (a + b) / 100 }; };
    const s = R(5001, 9999), t = R(1001, 4999); d.rounds = [mk(), mk(), { t: 'sub', s: s / 100, u: t / 100 }]; d.r = 0; d.on = []; },
  goal: d => `📦 حمّل جمال فيصل ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'faisal', text: 'الجمال متوازنة الحمل! تجمع وتطرح الأعداد العشرية بدقة.' }];
    if (r.t === 'sub') return kp(this, W, d, { title: '📦 بعد السوق', text: `حمولة الجمل <b>${dec(r.s)}</b> كغم، بيع منها <b>${dec(r.u)}</b> كغم. كم بقي؟`, ans: Math.round((r.s - r.u) * 100) / 100, n: 3, id: 'addSub5b', msg, kind, lines: L, hint: 'ضع الفاصلة تحت الفاصلة، وتحقّق بالجمع.' });
    sheetOpen(`<h3>📦 جمل ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + `حمولة الجمل <b>${dec(r.cap)}</b> كغم. اختر حملين مجموعهما الحمولة بالضبط.`, kind)}
      <div class="g5cards">${r.bags.map((v, i) => `<button class="g5card${d.on.includes(i) ? ' on' : ''}" data-i="${i}">📦 ${dec(v)} كغم</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.on.length === 2 ? '' : ' disabled'}>🐪 حمّل الجمل</button></div>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.on.indexOf(i); if (k >= 0) d.on.splice(k, 1); else if (d.on.length < 2) d.on.push(i); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const s = Math.round((r.bags[d.on[0]] + r.bags[d.on[1]]) * 100); d.on = [];
      if (s === Math.round(r.cap * 100)) await advance(this, W, d, 3, 'addSub5b', L); else { sfx('cough'); this.open(W, d, s > r.cap * 100 ? 'الحمل أثقل من الحمولة!' : 'الحمل أخف من الحمولة!', 'bad'); } });
  }
}, station('loads', '📦 أحمال الجمال'));

/* ═══ ٢٥-٢ الكسور والقسمة — «تقاسم التمر» (الباقي كسراً، والكسر من كمية) ═══ */
export const fractionsDivision5 = Object.assign({
  id: 'fractionsDivision5', giver: 'mansour',
  intro: n => [{ who: 'mansour', text: `عدتَ يا ${n}! نقتسم الأرغفة والتمر بين المسافرين بالعدل التام.` },
    { who: 'mansour', text: 'إذا بقي باقٍ قسمناه أجزاءً: الباقي يصبح كسراً مقامه عدد المسافرين.' }],
  begin(d) { const b = [3, 4, 5][R(0, 2)], q = R(2, 6), r0 = R(1, b - 1), dd = [3, 4][R(0, 1)], qq = R(3, 8) * dd, nn = R(2, dd - 1);
    d.rounds = [{ t: 'share', b, n: b * q + r0, w: q, r: r0 }, { t: 'of', dd, qq, nn }, { t: 'of1', dd: [2, 3, 4, 5][R(0, 3)], k: R(3, 9) }]; d.r = 0; d.w = 0; d.p = 0; },
  goal: d => `🌴 اقسم مع منصور ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'mansour', text: 'قسمة عادلة تماماً! الباقي صار كسراً، وتجد الكسر من أي كمية.' }];
    if (r.t === 'of') return kp(this, W, d, { title: '🌴 حصة القافلة', text: `${fr(r.nn, r.dd)} من <b>${N(r.qq)}</b> تمرة للجمّالين. كم تمرة؟`, ans: r.qq / r.dd * r.nn, n: 3, id: 'fractionsDivision5', msg, kind, opts: { dot: false }, lines: L, hint: `اقسم على ${N(r.dd)} ثم اضرب في ${N(r.nn)}.` });
    if (r.t === 'of1') return kp(this, W, d, { title: '🌴 تمر الضيوف', text: `${fr(1, r.dd)} من <b>${N(r.k * r.dd)}</b> تمرة للضيوف. كم تمرة؟`, ans: r.k, n: 3, id: 'fractionsDivision5', msg, kind, opts: { dot: false }, lines: L, hint: `اقسم على ${N(r.dd)}.` });
    const ctl = (k, lab, v, mx) => `<div class="cnt g5cnt"><span>${lab}</span><button class="act ghost" data-k="${k}" data-v="-1">−</button><b>${N(v)}</b><button class="act ghost" data-k="${k}" data-v="1">+</button></div>`;
    sheetOpen(`<h3>🫓 تقاسم الأرغفة</h3>${msgBox((msg ? msg + ' ' : '') + `<b>${N(r.n)}</b> أرغفة تُقسم على <b>${N(r.b)}</b> مسافرين بالتساوي. كم يأخذ كل مسافر؟`, kind)}
      <div class="g5center"><div class="g5mix"><b>${N(d.w)}</b> ${fr(d.p, r.b)}</div></div>
      <div class="row2">${ctl('w', 'أرغفة كاملة', d.w)}${ctl('p', `البسط (من ${N(r.b)})`, d.p)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🫓 وزّع</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k; d[k] = Math.max(0, Math.min(k === 'p' ? r.b - 1 : 20, d[k] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.w === r.w && d.p === r.r) { d.w = 0; d.p = 0; await advance(this, W, d, 3, 'fractionsDivision5', L); }
      else { sfx('cough'); this.open(W, d, d.w !== r.w ? `كم مرة ${N(r.b)} في ${N(r.n)}؟ هذه الأرغفة الكاملة.` : 'الباقي يُقسم أيضاً: يصبح بسطاً مقامه عدد المسافرين.', 'bad'); }
    });
  }
}, station('dates', '🌴 تقاسم التمر'));

/* ═══ ٢٥-٣ العمليات العكسية والأقواس — «لغز البئر» (عكس السلسلة) ═══ */
export const inverseBrackets5 = Object.assign({
  id: 'inverseBrackets5', giver: 'sultan',
  intro: n => [{ who: 'sultan', text: `يا ${n}! في هذا البئر لغز قديم: أُنزل عدد في الدلو، فمرّ بعمليات وخرج عدد آخر.` },
    { who: 'sultan', text: 'اعكس العمليات بترتيب معاكس: آخر عملية تُعكس أولاً، حتى تجد العدد الأول.' }],
  begin(d) { const mk = () => { const x = R(3, 12), a = R(2, 5), b = R(3, 15); return { x, a, b, y: x * a + b }; }; d.rounds = [mk(), mk(), { t: 'br' }]; d.r = 0; d.ops = []; },
  goal: d => `🪣 حلّ لغز البئر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'sultan', text: 'فككتَ لغز البئر! العمليات العكسية والأقواس طوع يدك.' }];
    if (r.t === 'br') { if (!d.br) d.br = { a: R(2, 6), b: R(2, 6), c: R(3, 6) }; const { a, b, c } = d.br, opts = shuffle([`(${N(a)} + ${N(b)}) × ${N(c)}`, `${N(a)} + (${N(b)} × ${N(c)})`, `${N(a)} + ${N(b)} × ${N(c)}`]);
      sheetOpen(`<h3>🪣 لوح البئر</h3>${msgBox((msg ? msg + ' ' : '') + `على اللوح الناتج <b>${N((a + b) * c)}</b>. أي عبارة تعطيه؟`, kind)}<div class="g5cards col">${opts.map(o => `<button class="g5card" data-o="${o}">${o}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-o]').forEach(bt => bt.onclick = async e => { e.stopPropagation(); if (bt.dataset.o === `(${N(a)} + ${N(b)}) × ${N(c)}`) await advance(this, W, d, 3, 'inverseBrackets5', L); else { sfx('cough'); this.open(W, d, 'هذه العبارة تعطي ناتجاً آخر: ما داخل القوسين أولاً.', 'bad'); } });
      return out(); }
    const OPS = [[`− ${N(r.b)}`, v => v - r.b], [`+ ${N(r.b)}`, v => v + r.b], [`÷ ${N(r.a)}`, v => v / r.a], [`× ${N(r.a)}`, v => v * r.a]];
    const cur = d.ops.reduce((v, i) => OPS[i][1](v), r.y);
    sheetOpen(`<h3>🪣 لغز البئر</h3>${msgBox((msg ? msg + ' ' : '') + `نزل عدد في الدلو: <b>× ${N(r.a)}</b> ثم <b>+ ${N(r.b)}</b>، فخرج <b>${N(r.y)}</b>. اعكس العمليات لتجد العدد الأول.`, kind)}
      <div class="g5chunk"><div>${N(r.y)}${d.ops.map(i => ` ← <b>${OPS[i][0]}</b>`).join('')}</div><div class="left">في الدلو الآن: <b>${Number.isInteger(cur) ? N(cur) : dec(Math.round(cur * 100) / 100)}</b></div></div>
      <div class="row2">${OPS.map((o, i) => `<button class="act" data-op="${i}"${d.ops.length >= 2 ? ' disabled' : ''}>${o[0]}</button>`).join('')}<button class="act ghost" id="oUndo"${d.ops.length ? '' : ' disabled'}>↩</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.ops.length === 2 ? '' : ' disabled'}>🪣 هذا العدد الأول</button></div>`);
    panel().querySelectorAll('[data-op]').forEach(b => b.onclick = e => { e.stopPropagation(); d.ops.push(+b.dataset.op); sfx('click'); this.open(W, d, msg, kind); });
    btn('oUndo', () => { d.ops.pop(); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const ok = d.ops[0] === 0 && d.ops[1] === 2; d.ops = [];
      if (ok) await advance(this, W, d, 3, 'inverseBrackets5', L); else { sfx('cough'); this.open(W, d, 'آخر عملية كانت «+»، فنعكسها أولاً بالطرح، ثم نعكس الضرب بالقسمة.', 'bad'); } });
  }
}, station('well', '🪣 لغز البئر'));

/* ═══ ٢٦-١ النسبة والتناسب — «وصفة القهوة» (تكبير المقادير) ═══ */
const ING = [['☕ ملاعق قهوة', 2], ['🌿 حبات هيل', 3], ['💧 أكواب ماء', 4]];
export const ratio5 = Object.assign({
  id: 'ratio5', giver: 'lubna',
  intro: n => [{ who: 'lubna', text: `عدتَ يا ${n}! وصفة قهوة القافلة تكفي ٣ ضيوف، والليلة يأتي ضيوف أكثر.` },
    { who: 'lubna', text: 'إذا تضاعف عدد الضيوف تضاعفت كل المقادير. اضبط المقادير كلها بالنسبة نفسها.' }],
  begin(d) { const k1 = R(2, 3), k2 = k1 === 2 ? 4 : 2, base = ING.map(([n, v]) => v + R(0, 1)); d.rounds = [{ k: k1, base }, { k: k2, base }, { t: 'beads', r: R(3, 4), sets: R(3, 6) }]; d.r = 0; d.q = [0, 0, 0]; },
  goal: d => `☕ حضّر قهوة لبنى ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'lubna', text: 'قهوة بطعم واحد مهما كثر الضيوف! تستخدم النسبة والتناسب بإتقان.' }];
    if (r.t === 'beads') return kp(this, W, d, { title: '📿 عقد القافلة', text: `في العقد خرزة زرقاء لكل <b>${N(r.r)}</b> خرزات حمراء، وفيه <b>${N(r.sets * (r.r + 1))}</b> خرزة. كم خرزة زرقاء؟`, ans: r.sets, n: 3, id: 'ratio5', msg, kind, opts: { dot: false }, lines: L, hint: `كل مجموعة ${N(r.r + 1)} خرزات فيها زرقاء واحدة.` });
    sheetOpen(`<h3>☕ وصفة لـ ${N(3 * r.k)} ضيفاً</h3>${msgBox((msg ? msg + ' ' : '') + `الوصفة الأصلية لـ <b>٣</b> ضيوف. اضبط المقادير لـ <b>${N(3 * r.k)}</b> ضيفاً.`, kind)}
      <table class="chTable"><tr><th>المقدار</th><td>لـ ٣ ضيوف</td><td>لـ ${N(3 * r.k)}</td></tr>${ING.map(([n], i) => `<tr><th>${n}</th><td>${N(r.base[i])}</td><td><div class="cnt g5cnt mini"><button class="act ghost" data-i="${i}" data-v="-1">−</button><b>${N(d.q[i])}</b><button class="act ghost" data-i="${i}" data-v="1">+</button></div></td></tr>`).join('')}</table>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">☕ قدّم القهوة</button></div>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i; d.q[i] = Math.max(0, Math.min(30, d.q[i] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const bad = r.base.findIndex((v, i) => d.q[i] !== v * r.k);
      if (bad < 0) { d.q = [0, 0, 0]; await advance(this, W, d, 3, 'ratio5', L); } else { sfx('cough'); this.open(W, d, `مقدار «${ING[bad][0]}» لا يناسب: الضيوف صاروا ${N(r.k)} أمثال، فاضرب كل مقدار في ${N(r.k)}.`, 'bad'); } });
  }
}, station('coffee', '☕ وصفة القهوة'));

export const G5U8 = { mentalStrategies5, decimalsFractions5, percentages5, equivFractions5, mixedNumbers5, addSub5b, fractionsDivision5, inverseBrackets5, ratio5 };
