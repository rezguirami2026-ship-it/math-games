// الصف الخامس — ورشة البنّاء (الوحدات ٢٧–٣٢ في الكتاب): فتح ضلفة النافذة بالمنقلة، دعامات مثلثة من كومة،
// خطوط تماثل النجمة، إكمال بلاط متماثل، شبكات القوالب، نقل الغرفة على المخطط، خلاطة الإسمنت، جدول المشروع، وتبليط غرفة بمساحة ومحيط.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, msgBox, btn } from '../bench.js';
import { jug, dial } from '../../content/chArt.js';
import { protractor, fan, shape, net, cubeNet, BAD_NETS, solidNet, pt } from '../../content/chGeo.js';
import { step, at, advance, kp, out, shadowE } from './common.js';

export const ST5W = { windows: { x: 1306, y: 5898 }, roof: { x: 466, y: 5899 }, star: { x: 888, y: 5899 }, mosaic: { x: 1726, y: 5898 }, molds: { x: 2146, y: 5898 },
  plan: { x: 526, y: 5719 }, mixer: { x: 1210, y: 6335 }, schedule: { x: 950, y: 6335 }, tiling: { x: 710, y: 6235 } };   // الثلاث الأخيرة في حي «القياس (٢)» جنوب السور الداخلي
const N = n => ar(n);
const deg = v => `${ar(v)}°`;
const sign = (c, x, y, t, bg, dx = 96) => bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg });
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const KIND = v => v < 90 ? 'حادة' : v === 90 ? 'قائمة' : 'منفرجة';
const TYPE = ['متطابق الأضلاع', 'متطابق الضلعين', 'مختلف الأضلاع'];
const triType = s => s[0] === s[2] ? 0 : s[0] === s[1] || s[1] === s[2] ? 1 : 2;   // s مرتبة تصاعدياً

const PROPS = {
  windows(c, x, y, d, t) { shadowE(c, x, y, 26); c.fillStyle = '#E8D9BC'; c.fillRect(x - 24, y - 70, 48, 60); c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(x - 24, y - 70, 48, 60); c.fillStyle = '#9FD3EE'; c.fillRect(x - 18, y - 64, 36, 48);
    const a = .5 + .35 * Math.sin(t * 1.2); c.fillStyle = PAL.wood; c.beginPath(); c.moveTo(x - 18, y - 64); c.lineTo(x - 18 + 18 * Math.cos(a), y - 66); c.lineTo(x - 18 + 18 * Math.cos(a), y - 14); c.lineTo(x - 18, y - 16); c.fill(); sign(c, x, y, '🪟 زوايا النوافذ', '#E3B04B'); },
  roof(c, x, y) { shadowE(c, x, y, 34); c.strokeStyle = '#8A5A30'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 32, y - 8); c.lineTo(x, y - 58); c.lineTo(x + 32, y - 8); c.closePath(); c.moveTo(x, y - 58); c.lineTo(x, y - 8); c.stroke(); c.lineCap = 'butt'; sign(c, x, y, '🔺 دعامات السقف', '#2F6FB2', -96); },
  star(c, x, y) { shadowE(c, x, y, 24); c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 30, 4, 30); c.fillStyle = '#C0392B'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, r = i % 2 ? 11 : 24; c.lineTo(x + r * Math.cos(a), y - 56 + r * Math.sin(a)); } c.closePath(); c.fill();
    c.fillStyle = '#F4F1E8'; c.beginPath(); c.arc(x, y - 56, 6, 0, 7); c.fill(); sign(c, x, y, '✴️ نجمة الزخرفة', '#C0392B'); },
  mosaic(c, x, y) { shadowE(c, x, y, 28); c.fillStyle = PAL.wood; c.fillRect(x - 3, y - 26, 6, 26); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i === j || i + j === 3) ? '#2F6FB2' : '#F2E6C9'; c.fillRect(x - 24 + i * 12, y - 76 + j * 12, 11, 11); } sign(c, x, y, '🧩 بلاط الموزاييك', '#8B5A2B', -96); },
  molds(c, x, y) { workTable(c, x, y); c.fillStyle = '#C9A06A'; c.fillRect(x - 26, y - 52, 18, 14); c.fillStyle = '#B0895A'; c.beginPath(); c.moveTo(x - 2, y - 38); c.lineTo(x + 8, y - 58); c.lineTo(x + 18, y - 38); c.fill(); c.fillStyle = '#FFE3A3'; c.fillRect(x + 20, y - 44, 10, 6); sign(c, x, y, '📦 قوالب البناء', '#7B3F98'); },
  plan(c, x, y) { shadowE(c, x, y, 26); c.fillStyle = PAL.wood; c.fillRect(x - 20, y - 30, 4, 30); c.fillRect(x + 16, y - 30, 4, 30); c.fillStyle = '#2F5C9E'; rr(c, x - 28, y - 78, 56, 48, 3); c.fill(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = .6;
    for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(x - 28 + i * 8, y - 78); c.lineTo(x - 28 + i * 8, y - 30); c.stroke(); } for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(x - 28, y - 78 + j * 8); c.lineTo(x + 28, y - 78 + j * 8); c.stroke(); } c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.strokeRect(x - 16, y - 66, 20, 16); sign(c, x, y, '📐 مخطط البيت', '#2F5C9E'); },
  mixer(c, x, y, d, t) { shadowE(c, x, y, 30); c.fillStyle = '#5E6874'; c.fillRect(x - 22, y - 16, 44, 6); c.save(); c.translate(x, y - 40); c.rotate(-.35 + .05 * Math.sin(t * 3)); c.fillStyle = '#E3742B'; c.beginPath(); c.ellipse(0, 0, 22, 18, 0, 0, 7); c.fill(); c.fillStyle = '#3B2E22'; c.beginPath(); c.ellipse(16, -4, 6, 9, 0, 0, 7); c.fill(); c.restore(); sign(c, x, y, '🪣 خلاطة الإسمنت', '#E3742B'); },
  schedule(c, x, y) { shadowE(c, x, y, 26); c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 30, 4, 30); c.fillStyle = '#FFFDF6'; rr(c, x - 30, y - 76, 60, 46, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .7; c.stroke();
    ['#E2475C', '#2E9E5B', '#2F6FB2'].forEach((col, k) => { c.fillStyle = col; c.fillRect(x - 24 + k * 12, y - 68 + k * 12, 20, 8); }); sign(c, x, y, '🗓️ جدول المشروع', '#8B5A2B'); },
  tiling(c, x, y) { shadowE(c, x, y, 30); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { c.fillStyle = (i + j) % 2 ? '#C9A06A' : '#F2E6C9'; c.fillRect(x - 28 + i * 14, y - 30 + j * 9, 13, 8); } c.fillStyle = '#7B3F98'; c.fillRect(x - 30, y - 34, 60, 3); sign(c, x, y, '🟫 تبليط الغرفة', '#7B3F98'); }
};
const station = (k, label) => at(ST5W[k], k, label, PROPS[k]);

/* زاوية صغيرة مرسومة: ذراع أفقي وذراع بزاوية th */
const angSvg = th => { const a = th * Math.PI / 180, ex = 46 + Math.cos(a) * 36, ey = 52 - Math.sin(a) * 36;
  return `<svg viewBox="0 0 100 60" style="width:96px;height:58px"><line x1="46" y1="52" x2="92" y2="52" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><line x1="46" y1="52" x2="${ex}" y2="${ey}" stroke="#8A5A30" stroke-width="3" stroke-linecap="round"/><path d="M${46 + 12} 52 A12 12 0 0 0 ${46 + Math.cos(a) * 12} ${52 - Math.sin(a) * 12}" fill="none" stroke="#E2475C" stroke-width="1.8"/></svg>`; };

/* ═══ ٢٧-١ الزوايا — «زوايا النوافذ» (فتح الضلفة بالمنقلة، اختيار نوع الزاوية، زاويتان على خط مستقيم) ═══ */
export const angles5 = Object.assign({
  id: 'angles5', giver: 'mohsen',
  intro: n => [{ who: 'mohsen', text: `أهلاً يا ${n}! أنا محسن النجار. نوافذ البيت الجديد تُفتح بزوايا محددة.` },
    { who: 'mohsen', text: 'ضع مركز المنقلة على رأس الزاوية، وابدأ العدّ من الصفر الذي يقع عليه الذراع الأول.' }],
  begin(d) { const t = [R(4, 16), R(19, 32)][R(0, 1)] * 5, ks = shuffle(['حادة', 'قائمة', 'منفرجة']), want = ks[0];
    d.rounds = [{ t: 'open', ans: t }, { t: 'kind', want, cards: shuffle([R(3, 16) * 5, 90, R(20, 33) * 5]) }, { t: 'line', a: R(5, 31) * 5 }]; d.r = 0; d.ang = 90; },
  goal: d => `🪟 افتح نوافذ محسن ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'mohsen', text: 'كل نافذة بزاويتها الصحيحة! تقيس الزوايا وتصنّفها كالنجار الماهر.' }];
    if (r.t === 'line') return kp(this, W, d, { title: '🪟 ضلفة على العتبة', visual: fan([r.a, 180 - r.a], [deg(r.a), '؟'], true), text: `الضلفة تصنع مع العتبة المستقيمة زاوية <b>${deg(r.a)}</b>. كم الزاوية الأخرى؟`, ans: 180 - r.a, n: 3, id: 'angles5', msg, kind, opts: { dot: false }, lines: L, hint: 'الزوايا على خط مستقيم مجموعها ١٨٠°.' });
    if (r.t === 'kind') {
      sheetOpen(`<h3>🪟 نوع الزاوية</h3>${msgBox((msg ? msg + ' ' : '') + `اضغط النافذة التي زاويتها <b>${r.want}</b>.`, kind)}
        <div class="g5cards">${r.cards.map((v, i) => `<button class="g5card shelf" data-i="${i}">${angSvg(v)}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-i]').forEach(b => b.onclick = async e => { e.stopPropagation(); const v = r.cards[+b.dataset.i];
        if (KIND(v) === r.want) await advance(this, W, d, 3, 'angles5', L); else { sfx('cough'); this.open(W, d, `هذه الزاوية ${KIND(v)}. تذكّر: الحادة أصغر من الزاوية القائمة (٩٠°)، والمنفرجة أكبر منها.`, 'bad'); } });
      return out();
    }
    sheetOpen(`<h3>🪟 افتح الضلفة</h3>${msgBox((msg ? msg + ' ' : '') + `افتح الضلفة بزاوية <b>${deg(r.ans)}</b> تماماً، ثم ثبّتها.`, kind)}${protractor(d.ang)}
      <div class="row2" style="direction:ltr">${[[-15, '−١٥°'], [-5, '−٥°'], [5, '+٥°'], [15, '+١٥°']].map(([v, l]) => `<button class="act" data-a="${v}">${l}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔩 ثبّت الضلفة</button></div>`);
    panel().querySelectorAll('[data-a]').forEach(b => b.onclick = e => { e.stopPropagation(); d.ang = Math.max(0, Math.min(180, d.ang + +b.dataset.a)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { if (d.ang === r.ans) await advance(this, W, d, 3, 'angles5', L);
      else { sfx('cough'); this.open(W, d, `الضلفة مفتوحة ${d.ang < r.ans ? 'أقل' : 'أكثر'} من المطلوب. اقرأ التدريج الذي يبدأ من الصفر عند الذراع الأفقي.`, 'bad'); } });
  }
}, station('windows', '🪟 زوايا النوافذ'));

/* ═══ ٢٨-١ المثلثات — «دعامات السقف» (اختيار ثلاث دعامات تصنع مثلثاً من النوع المطلوب) ═══ */
export const triangles5b = Object.assign({
  id: 'triangles5b', giver: 'hamood',
  intro: n => [{ who: 'hamood', text: `حياك يا ${n}! أنا حمود. سقف الورشة يُحمل على دعامات مثلثة.` },
    { who: 'hamood', text: 'اختر ثلاث دعامات: الأطوال تحدد نوع المثلث. وانتبه: الدعامتان القصيرتان يجب أن تكونا معاً أطول من الثالثة، وإلا لن تلتقيا!' }],
  begin(d) {
    const pile = sol => shuffle(sol.concat([R(15, 18), R(3, 9), R(3, 9), R(3, 9)]));
    const a = R(4, 8), b = R(4, 7), c = R(3, 5);
    d.rounds = [{ want: 0, pile: pile([a, a, a]) }, { want: 1, pile: pile([b, b, b + 2]) }, { want: 2, pile: pile([c, c + 1, c + 2]) }]; d.r = 0; d.sel = [];
  },
  goal: d => `🔺 ركّب دعامات حمود ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hamood', text: 'سقف متين على دعامات صحيحة! تعرف أنواع المثلثات من أطوال أضلاعها.' }];
    sheetOpen(`<h3>🔺 دعامة مثلثة</h3>${msgBox((msg ? msg + ' ' : '') + `اختر ٣ دعامات تصنع مثلثاً <b>${TYPE[r.want]}</b>.`, kind)}
      <div class="g5cards">${r.pile.map((v, i) => `<button class="g5card strip${d.sel.includes(i) ? ' on' : ''}" data-i="${i}">🪵 ${N(v)} م</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.sel.length === 3 ? '' : ' disabled'}>🔨 ركّب الدعامة</button></div>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else if (d.sel.length < 3) d.sel.push(i); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const s = d.sel.map(i => r.pile[i]).sort((a, b) => a - b); d.sel = [];
      if (s[0] + s[1] <= s[2]) { sfx('cough'); return this.open(W, d, `الدعامتان ${N(s[0])} م و${N(s[1])} م معاً أقصر من ${N(s[2])} م أو تساويها: لا تلتقيان أبداً!`, 'bad'); }
      if (triType(s) === r.want) await advance(this, W, d, 3, 'triangles5b', L); else { sfx('cough'); this.open(W, d, `هذا مثلث ${TYPE[triType(s)]}. قارن الأطوال الثلاثة: كم منها متساوٍ؟`, 'bad'); } });
  }
}, station('roof', '🔺 دعامات السقف'));

/* ═══ ٢٨-٢ التماثل في المضلعات — «نجمة الزخرفة» (اختيار خطوط التماثل، وأصغر دوران ينطبق به الشكل) ═══ */
const SYM = {
  rect: { name: 'البلاطة المستطيلة', pts: [[15, 35], [105, 35], [105, 85], [15, 85]], lines: [[60, 25, 60, 95, 1], [5, 60, 115, 60, 1], [15, 35, 105, 85, 0], [105, 35, 15, 85, 0]] },
  square: { name: 'البلاطة المربعة', pts: [[25, 25], [95, 25], [95, 95], [25, 95]], lines: [[60, 15, 60, 105, 1], [15, 60, 105, 60, 1], [25, 25, 95, 95, 1], [95, 25, 25, 95, 1]] },
  iso: { name: 'المثلث المتطابق الضلعين', pts: [[60, 12], [100, 100], [20, 100]], lines: [[60, 4, 60, 108, 1], [20, 100, 80, 56, 0], [10, 70, 110, 70, 0]] },
  kite: { name: 'بلاطة الطائرة الورقية', pts: [[60, 10], [92, 42], [60, 110], [28, 42]], lines: [[60, 4, 60, 114, 1], [18, 42, 102, 42, 0], [28, 42, 92, 80, 0]] }
};
export const polySymmetry5 = Object.assign({
  id: 'polySymmetry5', giver: 'amna',
  intro: n => [{ who: 'amna', text: `مرحباً يا ${n}! أنا آمنة. أزخرف واجهة البيت بنجوم وبلاطات متماثلة.` },
    { who: 'amna', text: 'خط التماثل يقسم الشكل نصفين ينطبقان عند الطيّ. والتماثل الدوراني: يبدو الشكل كما هو قبل أن يُكمل دورة كاملة.' }],
  begin(d) { const s2 = ['square', 'iso', 'kite'][R(0, 2)], n = [3, 5, 6, 8][R(0, 3)], small = 360 / n;
    const wr = shuffle([30, 45, 60, 72, 90, 120].filter(v => v % small !== 0)).slice(0, 3);
    d.rounds = [{ t: 'lines', k: 'rect' }, { t: 'lines', k: s2 }, { t: 'rot', n, opts: shuffle([small].concat(wr)) }]; d.r = 0; d.sel = []; },
  goal: d => `✴️ زخرفة آمنة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'amna', text: 'زخرفة متناظرة تماماً! تعرف خطوط التماثل والتماثل الدوراني.' }];
    if (r.t === 'rot') {
      sheetOpen(`<h3>✴️ دوران النجمة</h3>${msgBox((msg ? msg + ' ' : '') + `زخرفة على شكل مضلع منتظم له <b>${N(r.n)}</b> أضلاع. ما <b>أصغر</b> زاوية ندير بها الزخرفة فتنطبق على نفسها؟`, kind)}
        <div class="g5center">${shape('n' + r.n)}</div><div class="g5cards">${r.opts.map((v, i) => `<button class="g5card" data-o="${i}">↻ ${deg(v)}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-o]').forEach(b => b.onclick = async e => { e.stopPropagation(); const v = r.opts[+b.dataset.o];
        if (v === 360 / r.n) await advance(this, W, d, 3, 'polySymmetry5', L); else { sfx('cough'); this.open(W, d, `بعد دوران ${deg(v)} لا تنطبق الرؤوس على الرؤوس. الدورة الكاملة ٣٦٠° تُقسم بالتساوي على عدد الرؤوس.`, 'bad'); } });
      return out();
    }
    const S = SYM[r.k], COL = ['#E2475C', '#2F6FB2', '#2E9E5B', '#B5651D'];
    const svg = `<svg viewBox="0 0 120 120" style="width:170px;height:170px"><polygon points="${S.pts.map(p => p.join(',')).join(' ')}" fill="#FFE3A3" stroke="${INK}" stroke-width="2.2"/>${S.lines.map((l, i) => `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="${COL[i]}" stroke-width="${d.sel.includes(i) ? 3.4 : 1.6}" stroke-dasharray="${d.sel.includes(i) ? '' : '5 3'}"/>`).join('')}</svg>`;
    sheetOpen(`<h3>✴️ خطوط التماثل</h3>${msgBox((msg ? msg + ' ' : '') + `اختر <b>كل</b> خطوط التماثل في ${S.name}، ولا تختر غيرها.`, kind)}<div class="g5center">${svg}</div>
      <div class="g5cards">${S.lines.map((l, i) => `<button class="g5card${d.sel.includes(i) ? ' on' : ''}" data-l="${i}" style="color:${COL[i]}">━ الخط ${N(i + 1)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ تحقّق</button></div>`);
    panel().querySelectorAll('[data-l]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.l, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else d.sel.push(i); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const extra = d.sel.some(i => !S.lines[i][4]), miss = S.lines.some((l, i) => l[4] && !d.sel.includes(i)); d.sel = [];
      if (!extra && !miss) await advance(this, W, d, 3, 'polySymmetry5', L);
      else { sfx('cough'); this.open(W, d, extra ? 'اخترت خطاً لو طويت الشكل عليه لما انطبق النصفان.' : 'بقي خط تماثل لم تختره: جرّب الطيّ في كل اتجاه.', 'bad'); } });
  }
}, station('star', '✴️ نجمة الزخرفة'));

/* ═══ ٢٨-٣ التماثل في الأنماط — «بلاط الموزاييك» (إكمال نمط متماثل حول خط أو خطين) ═══ */
export const patternSymmetry5 = Object.assign({
  id: 'patternSymmetry5', giver: 'zainab',
  intro: n => [{ who: 'zainab', text: `أهلاً يا ${n}! أنا زينب. أرضية المجلس موزاييك، لكن العمال وضعوا جزءاً منه فقط.` },
    { who: 'zainab', text: 'الخط الأحمر مرآة: كل بلاطة ملوّنة لها صورة على البعد نفسه في الجهة الأخرى.' }],
  begin(d) {
    const cells = (k, xm, ym) => { const s = new Set(); for (let t = 0; t < 40 && s.size < k; t++) s.add(`${R(0, xm)},${R(0, ym)}`); return [...s].map(v => v.split(',').map(Number)); };
    d.rounds = [{ two: false, given: cells(4, 2, 5) }, { two: true, given: cells(3, 2, 2) }, { two: true, given: cells(4, 2, 2) }]; d.r = 0; d.on = [];
  },
  full(r) { const s = new Set(); r.given.forEach(([x, y]) => { s.add(`${x},${y}`); s.add(`${5 - x},${y}`); if (r.two) { s.add(`${x},${5 - y}`); s.add(`${5 - x},${5 - y}`); } }); return s; },
  goal: d => `🧩 أكمل موزاييك زينب ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'zainab', text: 'أرضية متماثلة في الاتجاهين! تكمل الأنماط كما تعكسها المرآة.' }], giv = new Set(r.given.map(c => c.join(',')));
    sheetOpen(`<h3>🧩 بلاط الموزاييك</h3>${msgBox((msg ? msg + ' ' : '') + `لوّن البلاطات الناقصة ليصبح النمط متماثلاً حول ${r.two ? '<b>الخطين</b> الأحمرين' : 'الخط الأحمر <b>الرأسي</b>'}.`, kind)}
      <div class="g5mosaic${r.two ? ' two' : ''}">${Array.from({ length: 36 }, (_, i) => { const x = i % 6, y = Math.floor(i / 6), k = `${x},${y}`;
        return `<button class="g5tile${giv.has(k) ? ' fix' : d.on.includes(k) ? ' on' : ''}${x === 2 ? ' mx' : ''}${r.two && y === 2 ? ' my' : ''}" data-c="${k}"${giv.has(k) ? ' disabled' : ''}></button>`; }).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ تحقّق</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.c, i = d.on.indexOf(k); if (i >= 0) d.on.splice(i, 1); else d.on.push(k); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const want = this.full(r), have = new Set([...giv, ...d.on]), extra = [...have].some(k => !want.has(k)), miss = [...want].some(k => !have.has(k));
      if (!extra && !miss) { d.on = []; await advance(this, W, d, 3, 'patternSymmetry5', L); }
      else { sfx('cough'); d.on = []; this.open(W, d, extra ? 'بعض البلاطات الملوّنة ليست صورة لبلاطة أصلية: عُدّ المربعات من الخط الأحمر.' : 'بقيت بلاطات ليس لها صورة في المرآة.', 'bad'); } });
  }
}, station('mosaic', '🧩 بلاط الموزاييك'));

/* ═══ ٢٨-٤ الأشكال الثلاثية الأبعاد والشبكات — «قوالب البناء» (شبكة القالب، شبكة المكعب، رؤوس وأحرف) ═══ */
const SOLIDS = { triPrism: 'منشور ثلاثي', sqPyr: 'هرم رباعي', cuboid: 'متوازي مستطيلات', tetra: 'هرم ثلاثي' };
const COUNT = [['المكعب', 'رؤوس', 8], ['المكعب', 'أحرف', 12], ['المنشور الثلاثي', 'رؤوس', 6], ['المنشور الثلاثي', 'أحرف', 9], ['الهرم الرباعي', 'رؤوس', 5], ['الهرم الرباعي', 'أحرف', 8]];
export const netsShapes5 = Object.assign({
  id: 'netsShapes5', giver: 'jaber',
  intro: n => [{ who: 'jaber', text: `أهلاً يا ${n}! أنا جابر. أصنع قوالب البناء من ألواح تُطوى.` },
    { who: 'jaber', text: 'الشبكة هي المجسم مفروداً: عُدّ أوجهها وانظر إلى أشكالها قبل أن تطويها في خيالك.' }],
  begin(d) { const ks = Object.keys(SOLIDS), want = ks[R(0, 3)], good = cubeNet(), q = COUNT[R(0, COUNT.length - 1)];
    const cards = shuffle([good].concat(shuffle(BAD_NETS).slice(0, 2)));   /* رقم الشبكة الصحيحة لا مرجعها: الحفظ ينسخ المصفوفات */
    d.rounds = [{ t: 'net', want, cards: shuffle(ks) }, { t: 'cube', cards, gi: cards.indexOf(good) }, { t: 'count', q }]; d.r = 0; },
  goal: d => `📦 جهّز قوالب جابر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'jaber', text: 'قوالب مطوية بإتقان! تتخيّل المجسم من شبكته وتعرف أوجهه وأحرفه ورؤوسه.' }];
    if (r.t === 'count') return kp(this, W, d, { title: '📦 عُدّ في القالب', text: `قالب على شكل <b>${r.q[0]}</b>. كم <b>${r.q[1]}</b> له؟`, ans: r.q[2], n: 3, id: 'netsShapes5', msg, kind, opts: { dot: false }, lines: L, hint: r.q[1] === 'رؤوس' ? 'الرأس نقطة تلتقي عندها الأحرف: عُدّ رؤوس القاعدة ثم ما فوقها.' : 'الحرف خط يلتقي عنده وجهان: عُدّ أحرف القاعدة ثم الأحرف الجانبية.' });
    const isCube = r.t === 'cube';
    sheetOpen(`<h3>📦 ${isCube ? 'شبكة الصندوق' : 'شبكة القالب'}</h3>${msgBox((msg ? msg + ' ' : '') + (isCube ? 'نحتاج صندوقاً على شكل <b>مكعب</b>. اضغط الشبكة التي تُطوى مكعباً.' : `نحتاج قالباً على شكل <b>${SOLIDS[r.want]}</b>. اضغط شبكته.`), kind)}
      <div class="g5cards nets">${r.cards.map((c, i) => `<button class="g5card shelf" data-i="${i}">${isCube ? net(c) : solidNet(c)}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-i]').forEach(b => b.onclick = async e => { e.stopPropagation(); const i = +b.dataset.i, c = r.cards[i];
      if (isCube ? i === r.gi : c === r.want) await advance(this, W, d, 3, 'netsShapes5', L);
      else { sfx('cough'); this.open(W, d, isCube ? 'عند طيّ هذه الشبكة يتراكب وجهان ويبقى وجه مفتوحاً.' : `هذه شبكة ${SOLIDS[c]}. عُدّ الأوجه وانظر: مثلثات أم مستطيلات؟`, 'bad'); } });
    out();
  }
}, station('molds', '📦 قوالب البناء'));

/* ═══ ٢٩-١ الإحداثيات والتحويلات — «مخطط البيت» (انسحاب إلى موضع مرسوم، انسحاب بالوصف، انعكاس نقطة) ═══ */
const ROOM = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]];
export const coordTransform5 = Object.assign({
  id: 'coordTransform5', giver: 'hamood',
  intro: n => [{ who: 'hamood', text: `أهلاً من جديد يا ${n}! هذا مخطط البيت على شبكة الإحداثيات.` },
    { who: 'hamood', text: 'الإحداثي الأول (س) أفقي والثاني (ص) رأسي. الانسحاب ينقل الشكل دون أن يدور، والانعكاس يقلبه في المرآة.' }],
  begin(d) { const s1 = [R(0, 2), R(0, 2)], m1 = [R(2, 4), R(1, 3)], s2 = [R(3, 5), R(0, 2)], m2 = [-R(1, 3), R(2, 4)], k = R(4, 5), A = [R(Math.max(1, 2 * k - 8), k - 1), R(1, 7)];
    d.rounds = [{ t: 'ghost', s: s1, m: m1 }, { t: 'words', s: s2, m: m2 }, { t: 'mirror', k, A }]; d.r = 0; d.off = [0, 0]; },
  goal: d => `📐 مخطط حمود ${step(d, 3)}`,
  plane(r, d) { const u = 22, X = x => 18 + x * u, Y = y => 196 - y * u; let s = `<svg viewBox="0 0 214 214" style="width:220px;height:220px;direction:ltr"><rect width="214" height="214" fill="#F4F8FF"/>`;
    for (let i = 0; i <= 8; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(8)}" stroke="#C5D3EA" stroke-width="1"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(8)}" y2="${Y(i)}" stroke="#C5D3EA" stroke-width="1"/><text x="${X(i)}" y="210" font-size="10" text-anchor="middle" fill="#5E6874">${ar(i)}</text><text x="8" y="${Y(i) + 4}" font-size="10" text-anchor="middle" fill="#5E6874">${ar(i)}</text>`;
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(8)}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(8)}" stroke="${INK}" stroke-width="2"/>`;
    const poly = (o, st) => `<polygon points="${ROOM.map(([a, b]) => `${X(o[0] + a)},${Y(o[1] + b)}`).join(' ')}" ${st}/>`;
    if (r.t === 'mirror') { const P = [r.A[0] + d.off[0], r.A[1] + d.off[1]]; return s + `<line x1="${X(r.k)}" y1="${Y(0)}" x2="${X(r.k)}" y2="${Y(8)}" stroke="#E2475C" stroke-width="2.5" stroke-dasharray="6 3"/><circle cx="${X(r.A[0])}" cy="${Y(r.A[1])}" r="6" fill="#2F6FB2"/><text x="${X(r.A[0]) - 9}" y="${Y(r.A[1]) - 8}" font-size="12" font-weight="900" fill="#2F6FB2">أ</text><circle cx="${X(P[0])}" cy="${Y(P[1])}" r="7" fill="none" stroke="#E3742B" stroke-width="3"/></svg>`; }
    if (r.t === 'ghost') s += poly([r.s[0] + r.m[0], r.s[1] + r.m[1]], 'fill="none" stroke="#2E9E5B" stroke-width="2.5" stroke-dasharray="5 3"');
    return s + poly([r.s[0] + d.off[0], r.s[1] + d.off[1]], `fill="#FFE3A3" stroke="${INK}" stroke-width="2.2" opacity=".92"`) + `<circle cx="${X(r.s[0] + d.off[0])}" cy="${Y(r.s[1] + d.off[1])}" r="4" fill="#E2475C"/></svg>`; },
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hamood', text: 'المخطط مضبوط تماماً! تنقل الأشكال وتعكسها على شبكة الإحداثيات.' }];
    const dir = (v, a, b) => v === 0 ? '' : `${N(Math.abs(v))} ${Math.abs(v) === 1 ? 'وحدة' : Math.abs(v) === 2 ? 'وحدتين' : 'وحدات'} ${v > 0 ? a : b}`;
    const say = r.t === 'mirror' ? `المرآة هي الخط الأحمر س = ${N(r.k)}. حرّك الدائرة البرتقالية إلى <b>صورة النقطة أ</b> ${pt(...r.A)}.`
      : r.t === 'ghost' ? 'انقل الغرفة لتنطبق على المكان المرسوم بالخط الأخضر.' : `انقل الغرفة <b>${dir(r.m[0], 'يميناً', 'يساراً')}</b> و<b>${dir(r.m[1], 'لأعلى', 'لأسفل')}</b>.`;
    const cur = r.t === 'mirror' ? [r.A[0] + d.off[0], r.A[1] + d.off[1]] : [r.s[0] + d.off[0], r.s[1] + d.off[1]];
    sheetOpen(`<h3>📐 مخطط البيت</h3>${msgBox((msg ? msg + ' ' : '') + say, kind)}<div class="g5center">${this.plane(r, d)}</div><p class="muted">${r.t === 'mirror' ? 'الدائرة' : 'الركن الأحمر'} الآن عند ${pt(...cur)}</p>
      <div class="row2" style="direction:ltr">${[['L', '⬅️'], ['D', '⬇️'], ['U', '⬆️'], ['R', '➡️']].map(([k, l]) => `<button class="act" data-m="${k}">${l}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📌 ثبّت</button></div>`);
    panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = { L: [-1, 0], R: [1, 0], U: [0, 1], D: [0, -1] }[b.dataset.m], o = [d.off[0] + v[0], d.off[1] + v[1]], p = r.t === 'mirror' ? [r.A[0] + o[0], r.A[1] + o[1]] : [r.s[0] + o[0], r.s[1] + o[1]], w = r.t === 'mirror' ? 0 : 2;
      if (p[0] >= 0 && p[1] >= 0 && p[0] + w <= 8 && p[1] + w <= 8) { d.off = o; sfx('click'); } this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const ok = r.t === 'mirror' ? cur[0] === 2 * r.k - r.A[0] && cur[1] === r.A[1] : d.off[0] === r.m[0] && d.off[1] === r.m[1];
      if (ok) { d.off = [0, 0]; await advance(this, W, d, 3, 'coordTransform5', L); }
      else { sfx('cough'); this.open(W, d, r.t === 'mirror' ? (cur[1] !== r.A[1] ? 'في المرآة الرأسية يبقى الإحداثي (ص) كما هو.' : 'عُدّ بُعد النقطة أ عن المرآة، ثم اذهب البعد نفسه في الجهة الأخرى.') : 'الغرفة ليست في مكانها: قارن الحركة الأفقية أولاً ثم الرأسية.', 'bad'); } });
  }
}, station('plan', '📐 مخطط البيت'));

/* ═══ ٣٠-١ الحجم والسعة والكتلة — «خلاطة الإسمنت» (ماء باللتر يُصبّ بالمليلتر، رمل بالكيلوغرام يوزن بالغرام، عدد الدلاء) ═══ */
export const volCapMass5 = Object.assign({
  id: 'volCapMass5', giver: 'amna',
  intro: n => [{ who: 'amna', text: `أهلاً يا ${n}! خلطة الإسمنت تحتاج مقادير دقيقة من الماء والرمل.` },
    { who: 'amna', text: 'اللتر ١٠٠٠ مليلتر، والكيلوغرام ١٠٠٠ غرام. حوّل قبل أن تصبّ أو تزن.' }],
  begin(d) { const ml = R(22, 58) * 50, g = R(12, 48) * 100, cap = [250, 500][R(0, 1)], tank = R(2, 5);
    d.rounds = [{ t: 'water', ans: ml }, { t: 'sand', ans: g }, { t: 'buckets', cap, tank }]; d.r = 0; d.amt = 0; },
  goal: d => `🪣 خلطة آمنة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'amna', text: 'خلطة مثالية! تقيس السعة والكتلة وتحوّل بين وحداتها بدقة.' }];
    if (r.t === 'buckets') return kp(this, W, d, { title: '🪣 دلاء الماء', text: `خزان الخلاطة يتسع <b>${N(r.tank)} ل</b>. كم دلواً سعته <b>${N(r.cap)} مل</b> يملؤه؟`, ans: r.tank * 1000 / r.cap, n: 3, id: 'volCapMass5', msg, kind, opts: { dot: false }, lines: L, hint: 'حوّل اللترات إلى مليلترات، ثم اقسم على سعة الدلو.' });
    const water = r.t === 'water', steps = water ? [[500, '+٥٠٠ مل'], [100, '+١٠٠ مل'], [50, '+٥٠ مل']] : [[1000, '+١ كغم'], [500, '+٥٠٠ غم'], [100, '+١٠٠ غم']];
    sheetOpen(`<h3>🪣 ${water ? 'ماء الخلطة' : 'رمل الخلطة'}</h3>${msgBox((msg ? msg + ' ' : '') + (water ? `صُبّ <b>${dec(r.ans / 1000)} ل</b> من الماء تماماً في الإبريق.` : `زِن <b>${dec(r.ans / 1000)} كغم</b> من الرمل تماماً.`), kind)}
      <div class="g5center">${water ? jug({ max: 3000, step: 500, level: d.amt }) : dial(5, d.amt / 1000)}</div>
      <div class="row2" style="direction:ltr">${steps.map(([v, l]) => `<button class="act" data-s="${v}">${l}</button>`).join('')}<button class="act ghost" id="sClr">${water ? 'أفرغ' : 'أنزل الكل'}</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">${water ? '💧 صُبّ في الخلاطة' : '⚖️ أضف إلى الخلاطة'}</button></div>`);
    panel().querySelectorAll('[data-s]').forEach(b => b.onclick = e => { e.stopPropagation(); d.amt = Math.min(water ? 3000 : 5000, d.amt + +b.dataset.s); sfx('click'); this.open(W, d, msg, kind); });
    btn('sClr', () => { d.amt = 0; this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { if (d.amt === r.ans) { d.amt = 0; await advance(this, W, d, 3, 'volCapMass5', L); }
      else { sfx('cough'); const less = d.amt < r.ans; d.amt = 0; this.open(W, d, `${less ? 'أقل' : 'أكثر'} من المطلوب! ${water ? 'اضرب اللترات في ١٠٠٠ لتعرف المليلترات.' : 'اضرب الكيلوغرامات في ١٠٠٠ لتعرف الغرامات.'}`, 'bad'); } });
  }
}, station('mixer', '🪣 خلاطة الإسمنت'));

/* ═══ ٣١-١ المزيد عن الوقت — «جدول المشروع» (مراحل بالشهور عبر سنتين، الأيام والأسابيع، العقود) ═══ */
export const moreTime5 = Object.assign({
  id: 'moreTime5', giver: 'zainab',
  intro: n => [{ who: 'zainab', text: `يا ${n}، أنا من تنظّم جدول مشروع البيت. المراحل طويلة: أسابيع وشهور وسنوات!` },
    { who: 'zainab', text: 'الأسبوع ٧ أيام، والسنة ١٢ شهراً، والعقد ١٠ سنوات، والقرن ١٠٠ سنة.' }],
  begin(d) { const m0 = R(4, 10), a = R(2, 4), b = R(3, 6), w = R(3, 8), k = R(2, 9);
    d.rounds = [{ t: 'months', m0, a, b }, { t: 'weeks', w }, { t: 'decades', k }]; d.r = 0; },
  goal: d => `🗓️ جدول زينب ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'zainab', text: 'جدول المشروع منظم تماماً! تحسب الفترات بالأيام والأسابيع والشهور والسنوات.' }];
    if (r.t === 'weeks') return kp(this, W, d, { title: '🗓️ مرحلة السقف', text: `مرحلة السقف تستغرق <b>${N(r.w * 7)}</b> يوماً. كم أسبوعاً؟`, ans: r.w, n: 3, id: 'moreTime5', msg, kind, opts: { dot: false }, lines: L, hint: 'الأسبوع ٧ أيام: اقسم على ٧.' });
    if (r.t === 'decades') return kp(this, W, d, { title: '🗓️ عمر البئر', text: `حُفرت بئر الورشة قبل <b>${N(r.k)}</b> عقود. كم سنة مضت على حفرها؟`, ans: r.k * 10, n: 3, id: 'moreTime5', msg, kind, opts: { dot: false }, lines: L, hint: 'العقد ١٠ سنوات.' });
    sheetOpen(`<h3>🗓️ مراحل البناء</h3>${msgBox((msg ? msg + ' ' : '') + `يبدأ البناء أول <b>${MONTHS[r.m0]} ${N(2026)}</b>: الأساس <b>${N(r.a)}</b> أشهر، ثم الجدران <b>${N(r.b)}</b> أشهر. اضغط الشهر الذي تنتهي فيه الجدران وتبدأ المرحلة التالية في أوله.`, kind)}
      <div class="g5cards">${Array.from({ length: 24 }, (_, i) => `<button class="g5card month${i === r.m0 ? ' on' : ''}" data-m="${i}">${MONTHS[i % 12]}<small>${N(2026 + Math.floor(i / 12))}</small></button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-m]').forEach(b => b.onclick = async e => { e.stopPropagation(); const i = +b.dataset.m;
      if (i === r.m0 + r.a + r.b) await advance(this, W, d, 3, 'moreTime5', L); else { sfx('cough'); this.open(W, d, i <= r.m0 ? 'هذا الشهر قبل بداية البناء أو عندها.' : `هذا بعد ${N(i - r.m0)} أشهر من البداية. اجمع مدة الأساس ومدة الجدران.`, 'bad'); } });
    out();
  }
}, station('schedule', '🗓️ جدول المشروع'));

/* ═══ ٣٢-١ المساحة والمحيط — «تبليط الغرفة» (بناء غرفة مستطيلة بمساحة ومحيط معلومين) ═══ */
const ROOMS = [[12, 14], [12, 16], [24, 20], [24, 22], [18, 18], [18, 22], [20, 18], [20, 24], [16, 16], [16, 20], [36, 24], [36, 26], [30, 22], [30, 26]];
export const areaPerimeter5 = Object.assign({
  id: 'areaPerimeter5', giver: 'jaber',
  intro: n => [{ who: 'jaber', text: `أهلاً يا ${n}! غرف البيت تحتاج بلاطاً على الأرض وحاشية حول الجدران.` },
    { who: 'jaber', text: 'المساحة عدد البلاطات (الطول × العرض)، والمحيط طول الحاشية حولها. غرفتان بالمساحة نفسها قد يختلف محيطهما!' }],
  begin(d) { const As = shuffle([12, 24, 18, 20, 16, 36, 30]).slice(0, 3); d.rounds = As.map(A => { const c = ROOMS.filter(x => x[0] === A); return c[R(0, c.length - 1)]; }); d.r = 0; d.w = 2; d.h = 2; },
  goal: d => `🟫 بلّط غرف جابر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const [A, P] = d.rounds[d.r], L = [{ who: 'jaber', text: 'غرف مبلّطة ومحاطة بالحاشية تماماً! تحسب المساحة والمحيط معاً.' }], u = 16;
    const svg = `<svg viewBox="0 0 ${d.w * u + 8} ${d.h * u + 8}" style="width:${d.w * u + 8}px;max-width:100%">${Array.from({ length: d.w * d.h }, (_, i) => `<rect x="${4 + (i % d.w) * u}" y="${4 + Math.floor(i / d.w) * u}" width="${u}" height="${u}" fill="${(i % d.w + Math.floor(i / d.w)) % 2 ? '#C9A06A' : '#F2E6C9'}" stroke="#8A6A40" stroke-width=".6"/>`).join('')}<rect x="3" y="3" width="${d.w * u + 2}" height="${d.h * u + 2}" fill="none" stroke="#7B3F98" stroke-width="3"/></svg>`;
    const ctl = (k, lab) => `<div class="cnt mini"><button class="act" data-k="${k}" data-v="-1">−</button><b>${lab}: ${N(d[k])} م</b><button class="act" data-k="${k}" data-v="1">+</button></div>`;
    sheetOpen(`<h3>🟫 تبليط الغرفة</h3>${msgBox((msg ? msg + ' ' : '') + `ابنِ غرفة مستطيلة مساحتها <b>${N(A)} م²</b> ومحيطها <b>${N(P)} م</b>.`, kind)}
      <div class="g5center">${svg}</div><div class="row2">${ctl('w', 'الطول')}${ctl('h', 'العرض')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🧱 بلّط</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k; d[k] = Math.max(1, Math.min(12, d[k] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const a = d.w * d.h, p = 2 * (d.w + d.h);
      if (a === A && p === P) { d.w = d.h = 2; await advance(this, W, d, 3, 'areaPerimeter5', L); }
      else { sfx('cough'); this.open(W, d, a !== A ? `مساحة هذه الغرفة ${N(d.w)} × ${N(d.h)} = ${N(a)} م²، والمطلوب ${N(A)} م².` : `المساحة صحيحة، لكن المحيط ${N(p)} م. جرّب طولاً وعرضاً آخرين لهما الناتج نفسه.`, 'bad'); } });
  }
}, station('tiling', '🟫 تبليط الغرفة'));

export const G5U9 = { angles5, triangles5b, polySymmetry5, patternSymmetry5, netsShapes5, coordTransform5, volCapMass5, moreTime5, areaPerimeter5 };
