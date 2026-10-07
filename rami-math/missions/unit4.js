// الوحدة ٤ (الأعداد ٢) في «القلعة»: ثلاث عشرة مهمة، كل مهارة عددية فعلٌ في المكان
import { ar, wait, rr, clamp } from '../core/util.js';
import { say, puff, bubble } from '../world/entities.js';
import { sfx } from '../core/sound.js';
import { R, shuffle, near, changed, dec, sg, finish, panel, sheetOpen, sheetClose, hiDPI, msgBox, setMsg, btn, numPad, counters } from './bench.js';
import { BW, ST4, B4, H_B } from '../world/fort.js';
import { PAL, INK, onRoof, bigSign, tag } from '../world/art.js';
import { rial } from './shop.js';

const nArab = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫', '.').trim();
const same = (a, b) => Math.round(a * 1000) === Math.round(b * 1000);
/* محطة قياسية: الوقوف عندها يُظهر زر فتح الطاولة */
const at = (st, key, label) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 40, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return near(W, { x: st.x, y: st.y + 16 }, 50) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; },
  draw(d, t, active, done) { return done ? [{ y: st.y + 30, draw: c => bubble(c, st.x, st.y - 64, '✓', '#1FA05A') }] : []; }
});
const roundsDone = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;

/* ═══ ٢٤. خط الأعداد والتقدير — «جسر القلعة» ═══ */
export const numberLineEstimate = {
  id: 'numberLineEstimate', giver: 'hamdan',
  intro: n => [{ who: 'hamdan', text: `مرحباً يا ${n}! أنا حمدان حارس الجسر. ممشى الجسر خط أعداد، لكن لم يبقَ عليه إلا علامتا الطرفين.` },
    { who: 'hamdan', text: 'امشِ على الممشى وقدّر موضع كل عدد، ثم ثبّت الراية هناك.' }],
  begin(d) { d.rounds = [{ lo: 0, hi: 1000, mid: 1, v: R(12, 88) * 10 + R(1, 9) }, { lo: 2000, hi: 3000, mid: 0, v: 2000 + R(12, 88) * 10 }, { lo: 4000, hi: 5000, mid: 0, v: 4000 + R(15, 85) * 10 + R(1, 9) }]; d.r = 0; d.flags = []; },
  goal: d => { const r = d.rounds[Math.min(d.r, 2)]; return `🚩 ثبّت الراية عند ${ar(r.v)} على ممشى الجسر ${roundsDone(d, 3)}`; },
  target: (d, W) => Math.abs(W.player.y - BW.y) < 40 ? null : { x: (BW.x0 + BW.x1) / 2, y: BW.y },
  taps: () => [],
  actions(W, d) { const p = W.player; return Math.abs(p.y - BW.y) < 22 && p.x >= BW.x0 - 4 && p.x <= BW.x1 + 4 ? [{ key: 'flag', label: '🚩 ثبّت الراية هنا', kind: 'go', run: () => this.plant(W, d) }] : []; },
  async plant(W, d) {
    const r = d.rounds[d.r], x = clamp(W.player.x, BW.x0, BW.x1), val = r.lo + (x - BW.x0) / (BW.x1 - BW.x0) * (r.hi - r.lo);
    if (Math.abs(val - r.v) <= .04 * (r.hi - r.lo)) { sfx('win'); d.flags.push({ x, v: r.v }); say(x, BW.y - 70, `✓ ${ar(r.v)}`, '#1FA05A', 1600); d.r++; changed();
      if (d.r >= 3) await finish(W, 'numberLineEstimate', [{ who: 'hamdan', text: 'ثلاث رايات في مواضعها! عينك دقيقة في التقدير.' }]); }
    else { sfx('cough'); say(x, BW.y - 70, `هنا نحو ${ar(Math.round(val / 10) * 10)}، والمطلوب ${ar(r.v)}`, '#C2304A', 2400); }
  },
  // أعمدة الأرقام على طرفي الجسر قائمة وبدقة الشاشة (كانت على الأرض فتبهت في 3D)
  draw(d, t, active, done) {
    if (!d.rounds || done) return []; const r = d.rounds[Math.min(d.r, 2)], out = [];
    const post = (x, v) => out.push({ y: BW.y - 10, x, draw: c => bigSign(c, x, BW.y - 10, v, { fs: 22, h: 40, bg: '#1E8A5C', line: '#fff' }) });
    post(BW.x0, ar(r.lo)); post(BW.x1, ar(r.hi)); if (r.mid) post((BW.x0 + BW.x1) / 2, ar((r.lo + r.hi) / 2));
    return out;
  },
  ground(c, d, active, done) {
    if (!d.rounds) return;
    (d.flags || []).forEach(f => { c.fillStyle = 'rgba(60,35,10,.2)'; c.beginPath(); c.ellipse(f.x + 4, BW.y - 10, 6, 2, 0, 0, 7); c.fill(); c.fillStyle = '#5B3A1E'; c.fillRect(f.x - 1.5, BW.y - 46, 3, 36); c.fillStyle = '#E3B04B'; c.beginPath(); c.arc(f.x, BW.y - 47, 2.2, 0, 7); c.fill(); c.fillStyle = '#E2475C'; c.beginPath(); c.moveTo(f.x + 1.5, BW.y - 45); c.quadraticCurveTo(f.x + 12, BW.y - 46, f.x + 24, BW.y - 39); c.quadraticCurveTo(f.x + 12, BW.y - 35, f.x + 1.5, BW.y - 32); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .7; c.stroke(); });
  }
};

/* ═══ ٢٥. تاريخ الأعداد (الهيروغليفية) — «نقوش المتحف» ═══ */
export const GLY = {
  1000: '<svg viewBox="0 0 24 40"><path d="M12 38V14" stroke="currentColor" stroke-width="3"/><path d="M12 14C4 12 3 4 7 2c2 6 4 8 5 12 1-4 3-6 5-12 4 2 3 10-5 12z" fill="currentColor"/></svg>',
  100: '<svg viewBox="0 0 24 40"><path d="M12 30c-6 0-8-6-6-10s8-5 11-2 2 9-3 9-5-4-3-6 5-1 5 1" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 30v8" stroke="currentColor" stroke-width="2.6"/></svg>',
  10: '<svg viewBox="0 0 24 40"><path d="M5 38V18C5 8 19 8 19 18v20" fill="none" stroke="currentColor" stroke-width="3.2"/></svg>',
  1: '<svg viewBox="0 0 24 40"><path d="M12 4v32" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/></svg>'
};
export const glyphs = n => [1000, 100, 10, 1].map(v => GLY[v].repeat(Math.floor(n / v) % 10)).join('');
export const hieroNumbers = Object.assign({
  id: 'hieroNumbers', giver: 'muna',
  intro: n => [{ who: 'muna', text: `أهلاً يا ${n}! أنا منى أمينة المتحف. أبواب قاعة المصريين القدماء مغلقة بأقفال من نقوش.` },
    { who: 'muna', text: 'العصا ١، والقوس ١٠، واللفافة ١٠٠، وزهرة اللوتس ١٠٠٠. انقش العدد لتفتح الباب، أو اقرأ النقش واكتب عدده.' }],
  begin(d) { const D = () => R(1, 5); d.rounds = [{ t: 'w', v: D() * 100 + D() * 10 + D() }, { t: 'w', v: R(1, 3) * 1000 + D() * 100 + D() }, { t: 'r', v: R(1, 4) * 1000 + R(0, 5) * 100 + R(1, 5) * 10 + R(0, 5) }]; d.r = 0; d.cur = []; },
  goal: d => `🏺 افتح أبواب قاعة المتحف ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'w') {
      const sum = () => d.cur.reduce((a, b) => a + b, 0);
      sheetOpen(`<h3>🏺 باب القاعة ${ar(d.r + 1)}</h3>${msgBox(msg || `انقش العدد <b>${ar(r.v)}</b> بالرموز المصرية القديمة لتفتح الباب`, kind)}
        <div class="hiero" id="ins"></div>
        <div class="row2">${[1000, 100, 10, 1].map(v => `<button class="act ghost glyb" data-g="${v}">${GLY[v]}</button>`).join('')}<button class="act ghost" id="gBack">⌫</button></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔓 افتح الباب</button></div>`);
      const draw = () => { panel().querySelector('#ins').innerHTML = d.cur.length ? glyphs(sum()) : '<span class="muted">انقش هنا</span>'; };
      draw();
      panel().querySelectorAll('[data-g]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.cur.length < 24) { d.cur.push(+b.dataset.g); sfx('click'); draw(); } });
      btn('gBack', () => { d.cur.pop(); draw(); });
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { if (sum() === r.v) { d.cur = []; await this.next(W, d); } else { sfx('cough'); setMsg('الباب لا ينفتح: النقش لا يساوي العدد المطلوب', 'bad'); } });
    } else {
      sheetOpen(`<h3>🏺 الباب الأخير</h3>${msgBox(msg || 'اقرأ النقش على الباب واكتب العدد الذي يمثله', kind)}<div class="hiero">${glyphs(r.v)}</div><div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
      const pad = numPad(panel().querySelector('#pad'), '🔓 افتح', async v => { if (v === r.v) await this.next(W, d); else { sfx('cough'); pad.clear(); setMsg('الرقم لا يطابق النقش، اقرأه مرة أخرى', 'bad'); } }, { dot: false });
      btn('benchOut', () => { sheetClose(); changed(); });
    }
  },
  async next(W, d) { sfx('win'); d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'hieroNumbers', [{ who: 'muna', text: 'انفتحت الأبواب الثلاثة! تقرأ نقوش الفراعنة كعالم آثار.' }]); } else this.open(W, d, '✓ انفتح الباب! الباب التالي…', 'ok'); }
}, at(ST4.museum, 'museum', '🏺 باب المتحف'));

/* ═══ ٢٦. النظام العشري والقيمة المكانية — «ميزان الذهب» ═══ */
export const decimalSystem = Object.assign({
  id: 'decimalSystem', giver: 'zaid',
  intro: n => [{ who: 'zaid', text: `حيّاك يا ${n}! أنا زيد الصائغ. ذهبي في سبائك: الكبيرة غرام كامل، والقطعة عُشر غرام، والحبة جزء من مئة.` },
    { who: 'zaid', text: 'ضع على الميزان القطع التي تساوي الوزن المطلوب بالضبط.' }],
  begin(d) { d.rounds = [R(1, 5) + R(1, 9) / 10 + R(1, 9) / 100, R(1, 5) + R(1, 9) / 100, R(1, 9) / 10 + R(1, 9) / 100].map(v => +v.toFixed(2)); d.r = 0; d.a = 0; d.b = 0; d.c = 0; },
  goal: d => `⚖️ زِن ${dec(d.rounds[Math.min(d.r, 2)])} غرام من الذهب ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const v = d.rounds[d.r];
    sheetOpen(`<h3>⚖️ ميزان الذهب</h3>${msgBox(msg || `ضع على الكفة <b>${dec(v)}</b> غرام بالضبط`, kind)}<canvas id="pan" width="300" height="90"></canvas><div id="cnt"></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⚖️ زِن</button></div>`);
    const c = hiDPI(panel().querySelector('#pan'));
    const draw = () => { c.clearRect(0, 0, 300, 90); c.fillStyle = '#C9A24A'; rr(c, 40, 70, 220, 8, 4); c.fill(); let x = 50;
      for (let i = 0; i < d.a; i++) { c.fillStyle = '#E8B730'; rr(c, x, 46, 26, 22, 3); c.fill(); x += 28; }
      for (let i = 0; i < d.b; i++) { c.fillStyle = '#F2CC55'; rr(c, x, 54, 12, 14, 2); c.fill(); x += 14; }
      for (let i = 0; i < d.c; i++) { c.fillStyle = '#FBE08A'; c.beginPath(); c.arc(x + 4, 64, 4, 0, 7); c.fill(); x += 9; } };
    counters(panel().querySelector('#cnt'), [['a', '🟨 سبيكة (١ غرام)', 9], ['b', '🔸 قطعة (٠٫١ غرام)', 9], ['c', '🔹 حبة (٠٫٠١ غرام)', 9]], d, draw);
    draw();
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const want = [Math.floor(v), Math.floor(Math.round(v * 100) / 10) % 10, Math.round(v * 100) % 10], got = [d.a, d.b, d.c];
      const k = want.findIndex((x, i) => x !== got[i]);
      if (k < 0) { sfx('win'); d.r++; d.a = d.b = d.c = 0; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'decimalSystem', [{ who: 'zaid', text: 'وزن دقيق حتى أجزاء المئة! كل رقم في منزلته.' }]); } else this.open(W, d, `✓ وزن صحيح! التالي: <b>${dec(d.rounds[d.r])}</b> غرام`, 'ok'); }
      else { sfx('cough'); setMsg(`الكفة لا تتوازن: ${['السبائك', 'القطع (الأعشار)', 'الحبات (أجزاء المئة)'][k]} غير صحيحة`, 'bad'); }
    });
  }
}, at(ST4.gold, 'gold', '⚖️ ميزان الذهب'));

/* ═══ ٢٧. العمليات على الأعداد العشرية — «مطبخ الحلوى» ═══ */
export const decimalOperations = Object.assign({
  id: 'decimalOperations', giver: 'aisha',
  intro: n => [{ who: 'aisha', text: `أهلاً يا ${n}! أنا عائشة، أطبخ الحلوى العمانية للمهرجان.` },
    { who: 'aisha', text: 'الميزان الرقمي معطّل، فاحسب الوزن واكتبه أنت، وأنا أضع المقادير.' }],
  begin(d) { const a1 = R(105, 195) / 100, b1 = R(3, 9) / 10, a2 = R(2, 4), b2 = R(105, 190) / 100, a3 = [.25, .3, .4, .15, .35][R(0, 4)], n3 = R(3, 6);
    d.rounds = [{ text: `في القِدر ${dec(a1)} كغ سكر، وأضفنا ${dec(b1)} كغ. كم أصبح الوزن؟`, ans: a1 + b1 }, { text: `معنا ${ar(a2)} كغ طحين، واستعملنا ${dec(b2)} كغ. كم بقي؟`, ans: a2 - b2 }, { text: `القِدر الواحد يحتاج ${dec(a3)} كغ سمن. كم نحتاج لـ${ar(n3)} قدور؟`, ans: a3 * n3 }]; d.r = 0; },
  goal: d => `🍯 احسب مقادير الحلوى ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>🍯 مطبخ الحلوى</h3>${msgBox(msg || r.text, kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
    const pad = numPad(panel().querySelector('#pad'), '⚖️ زِن (كغ)', async v => { if (same(v, r.ans)) { sfx('win'); d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'decimalOperations', [{ who: 'aisha', text: 'المقادير مضبوطة، والحلوى ستكون أطيب حلوى في المهرجان!' }]); } else this.open(W, d, `✓ مضبوط! ${d.rounds[d.r].text}`, 'ok'); } else { sfx('cough'); pad.clear(); setMsg(`${dec(v)} كغ لا تكفي للوصفة أو تزيد عليها. ${r.text}`, 'bad'); } });
    btn('benchOut', () => { sheetClose(); changed(); });
  }
}, at(ST4.kitchen, 'kitchen', '🍯 مطبخ الحلوى'));

/* ═══ ٢٨. تطبيقات على الأعداد العشرية — «ميزانية الرحلة» ═══ */
const TRIP = [['💧', 'ماء', 750], ['🌴', 'تمر', 1250], ['🍞', 'خبز', 500], ['🍪', 'بسكويت', 900], ['🧃', 'عصير', 650], ['🍬', 'حلوى', 1100], ['🍊', 'فاكهة', 1350], ['🧀', 'جبن', 1600]];
export const decimalApplications = Object.assign({
  id: 'decimalApplications', giver: 'fahad',
  intro: n => [{ who: 'fahad', text: `يا ${n}! أنا فهد قائد رحلة الكشافة. لكل مجموعة ميزانية محددة.` },
    { who: 'fahad', text: 'اختر الأصناف التي مجموع أسعارها يساوي الميزانية بالضبط، لا ريال يضيع ولا بيسة تنقص.' }],
  begin(d) { d.rounds = [2, 3, 3].map(k => { const s = shuffle(TRIP.map((_, i) => i)).slice(0, k); return { k, budget: s.reduce((a, i) => a + TRIP[i][2], 0) }; }); d.r = 0; d.sel = []; },
  goal: d => `🧺 اشترِ بالميزانية بالضبط ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>🧺 دكان الرحلة</h3>${msgBox(msg || `اختر <b>${ar(r.k)}</b> أصناف مجموع أسعارها <b>${rial(r.budget)}</b> بالضبط`, kind)}
      <div class="board">${TRIP.map(([e, n, p], i) => `<button class="tag pick ${d.sel.includes(i) ? 'on' : ''}" data-i="${i}"><span>${e}</span><b>${n}</b><small>${rial(p)}</small></button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🧺 ادفع</button></div>`);
    panel().querySelectorAll('.pick').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else if (d.sel.length < 4) d.sel.push(i); b.classList.toggle('on'); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const s = d.sel.reduce((a, i) => a + TRIP[i][2], 0);
      if (d.sel.length !== r.k) { sfx('cough'); setMsg(`المجموعة تحتاج ${ar(r.k)} أصناف بالضبط`, 'bad'); return; }
      if (s !== r.budget) { sfx('cough'); setMsg(s > r.budget ? 'المجموع أكبر من الميزانية!' : 'بقي مال من الميزانية لم يُصرف', 'bad'); return; }
      sfx('win'); d.r++; d.sel = []; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'decimalApplications', [{ who: 'fahad', text: 'كل مجموعة اشترت بميزانيتها بالضبط. حسابك يصلح لأمين صندوق!' }]); } else this.open(W, d, '✓ تمام! المجموعة التالية…', 'ok');
    });
  }
}, at(ST4.trip, 'trip', '🧺 دكان الرحلة'));

/* ═══ ٢٩. الأعداد الصحيحة — «بئر القلعة» ═══ */
export const integers = Object.assign({
  id: 'integers', giver: 'harith',
  intro: n => [{ who: 'harith', text: `مرحباً يا ${n}! أنا الحارث حارس البئر. سطح الأرض عندنا صفر، وتحته طوابق سالبة.` },
    { who: 'harith', text: 'حرّك الدلو كما في التعليمات، وثبّته في الطابق الذي ينتهي إليه.' }],
  begin(d) { const s1 = R(-2, 3), a1 = R(5, 8), b1 = R(2, 4), s2 = R(1, 5), a2 = R(7, 10), s3 = R(-5, -2), a3 = R(2, 4), b3 = R(5, 8);
    d.rounds = [{ s: s1, text: `الدلو عند ${sg(s1)}. ينزل ${ar(a1)} طوابق ثم يصعد ${ar(b1)}.`, ans: s1 - a1 + b1 }, { s: s2, text: `مقياس الحرارة يشير إلى ${sg(s2)}°، ثم تنخفض الحرارة ${ar(a2)} درجات.`, ans: s2 - a2 }, { s: s3, text: `الدلو عند ${sg(s3)}. يصعد ${ar(a3)} ثم ينزل ${ar(b3)}.`, ans: s3 + a3 - b3 }]; d.r = 0; d.lvl = d.rounds[0].s; },
  goal: d => `🪣 حرّك دلو البئر بحسب التعليمات ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>🪣 بئر القلعة</h3>${msgBox(msg || r.text, kind)}<canvas id="gauge" width="300" height="250"></canvas>
      <div class="row2"><button class="act ghost" id="up">▲ اصعد</button><button class="act ghost" id="down">▼ انزل</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🪣 ثبّت هنا</button></div>`);
    const c = hiDPI(panel().querySelector('#gauge')), Y = v => 125 - v * 11;
    const draw = () => { c.clearRect(0, 0, 300, 250); c.fillStyle = '#8B6A43'; c.fillRect(110, Y(10), 80, Y(-10) - Y(10)); c.fillStyle = '#3B2B1A'; c.fillRect(120, Y(0), 60, Y(-10) - Y(0));
      c.fillStyle = '#7CC36B'; c.fillRect(90, Y(0) - 3, 120, 6);
      for (let v = -10; v <= 10; v++) { c.fillStyle = v === 0 ? '#2A1B66' : '#7A6A4A'; c.fillRect(200, Y(v) - .5, v % 2 ? 6 : 12, 1.5); if (v % 2 === 0) { c.font = '800 11px Cairo, sans-serif'; c.textAlign = 'left'; c.fillText(v < 0 ? '−' + ar(-v) : ar(v), 216, Y(v) + 4); } }
      c.fillStyle = '#C98A3A'; rr(c, 135, Y(d.lvl) - 10, 30, 18, 4); c.fill(); c.strokeStyle = '#5B3A1E'; c.beginPath(); c.moveTo(150, Y(10)); c.lineTo(150, Y(d.lvl) - 10); c.stroke(); };
    draw();
    btn('up', () => { d.lvl = clamp(d.lvl + 1, -10, 10); sfx('click'); draw(); });
    btn('down', () => { d.lvl = clamp(d.lvl - 1, -10, 10); sfx('click'); draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (d.lvl === r.ans) { sfx('win'); d.r++; if (d.r < 3) d.lvl = d.rounds[d.r].s; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'integers', [{ who: 'harith', text: 'تصعد وتنزل بين الموجب والسالب كأنك تعرف البئر منذ صغرك!' }]); } else this.open(W, d, `✓ صحيح! ${d.rounds[d.r].text}`, 'ok'); }
      else { sfx('cough'); setMsg(`الدلو عند ${sg(d.lvl)}، والتعليمات تنتهي في طابق آخر. ${r.text}`, 'bad'); } });
  }
}, at(ST4.well, 'well', '🪣 دلو البئر'));

/* ═══ ٣٠. المضاعفات المشتركة — «أجراس القلعة» ═══ */
const lcm = (a, b) => { const g = (x, y) => y ? g(y, x % y) : x; return a * b / g(a, b); };
export const commonMultiples = Object.assign({
  id: 'commonMultiples', giver: 'qais',
  intro: n => [{ who: 'qais', text: `يا ${n}! أنا قيس قارع الأجراس. الجرس الأحمر والأزرق يرنّان كل منهما بعد عدد ثابت من الدقائق.` },
    { who: 'qais', text: 'اختر أول دقيقة يرنّ فيها الجرسان معاً، ثم اقرعهما.' }],
  begin(d) { d.rounds = shuffle([[4, 6], [6, 9], [8, 12], [5, 6], [3, 4], [6, 10], [4, 10]]).slice(0, 3); d.r = 0; d.min = 1; d.shown = 0; },
  goal: d => `🔔 متى يرنّ الجرسان معاً؟ ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const [a, b] = d.rounds[d.r];
    sheetOpen(`<h3>🔔 أجراس القلعة</h3>${msgBox(msg || `الجرس الأحمر يرنّ كل <b>${ar(a)}</b> دقائق، والأزرق كل <b>${ar(b)}</b> دقائق. متى يرنّان معاً أول مرة؟`, kind)}
      <canvas id="tl" width="320" height="90"></canvas>
      <div class="row2"><button class="act ghost" data-m="-5">−٥</button><button class="act ghost" data-m="-1">−١</button><button class="act ghost" data-m="1">+١</button><button class="act ghost" data-m="5">+٥</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔔 اقرع عند الدقيقة المختارة</button></div>`);
    const c = hiDPI(panel().querySelector('#tl')), X = m => 10 + m * 5;
    const draw = () => { c.clearRect(0, 0, 320, 90); c.fillStyle = '#7A6A4A'; c.fillRect(X(0), 48, 300, 2);
      for (let m = 0; m <= 60; m++) { c.fillRect(X(m), 44, 1, m % 5 ? 6 : 10); if (m % 10 === 0) { c.font = '800 10px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(ar(m), X(m), 70); } }
      for (let m = a; m <= d.shown; m += a) { c.fillStyle = '#C0392B'; c.beginPath(); c.arc(X(m), 34, 4, 0, 7); c.fill(); }
      for (let m = b; m <= d.shown; m += b) { c.fillStyle = '#2F6FB2'; c.beginPath(); c.arc(X(m), 22, 4, 0, 7); c.fill(); }
      c.fillStyle = '#2A1B66'; c.beginPath(); c.moveTo(X(d.min), 52); c.lineTo(X(d.min) - 6, 62); c.lineTo(X(d.min) + 6, 62); c.fill(); c.font = '900 12px Cairo, sans-serif'; c.fillText('د ' + ar(d.min), X(d.min), 86); };
    draw();
    panel().querySelectorAll('[data-m]').forEach(bt => bt.onclick = e => { e.stopPropagation(); d.min = clamp(d.min + +bt.dataset.m, 1, 60); sfx('click'); draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      d.shown = d.min; draw(); const L = lcm(a, b), ra = d.min % a === 0, rb = d.min % b === 0;
      if (ra && rb && d.min === L) { sfx('win'); await wait(700); d.r++; d.min = 1; d.shown = 0; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'commonMultiples', [{ who: 'qais', text: 'دوّى الجرسان معاً في اللحظة نفسها! تعرف المضاعف المشترك الأصغر.' }]); } else this.open(W, d, '✓ رنّا معاً! الجرسان التاليان…', 'ok'); }
      else { sfx('cough'); setMsg(ra && rb ? `يرنّان معاً في الدقيقة ${ar(d.min)}، لكن هل هذه أول مرة؟` : `في الدقيقة ${ar(d.min)} ${!ra ? 'الجرس الأحمر صامت' : 'الجرس الأزرق صامت'}`, 'bad'); }
    });
  },
  draw(d, t, active, done) { return done ? [{ y: 1832, draw: c => { [2380, 2480].forEach(x => { c.strokeStyle = '#FFC23D'; c.lineWidth = 2; for (let k = 1; k <= 2; k++) { c.beginPath(); c.arc(x, 1792, 14 * k + Math.sin(t * 6) * 3, -2.4, -.7); c.stroke(); } }); } }] : []; }
}, (() => { const s = at(ST4.bells, 'bells', '🔔 حبل الأجراس'); delete s.draw; return s; })());

/* ═══ ٣١. استراتيجيات الجمع والطرح — «الحساب السريع» ═══ */
const MONEY = [[5000, '٥ ريال', '#8E6CC9'], [1000, '١ ريال', '#3E9B6E'], [500, 'نصف ريال', '#C98A3A'], [100, '١٠٠ بيسة'], [50, '٥٠ بيسة']];
export const mentalAddSub = Object.assign({
  id: 'mentalAddSub', giver: 'mariam',
  intro: n => [{ who: 'mariam', text: `أهلاً يا ${n}! أنا مريم، وزحمة السوق اليوم كبيرة.` },
    { who: 'mariam', text: 'كل زبون يدفع ورقة أكبر من ثمن مشترياته، فأعطه الباقي بسرعة وبدقة.' }],
  begin(d) { d.rounds = [0, 1, 2, 3].map(() => { const p = R(23, 99) * 50; const P = [1000, 5000, 10000].find(x => x > p); return { p, P }; }); d.r = 0; d.tray = []; },
  goal: d => `🪙 أعطِ الزبائن الباقي ${roundsDone(d, 4)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    const render = (m, k) => {
      sheetOpen(`<h3>🪙 كشك مريم — الزبون ${ar(d.r + 1)}</h3>${msgBox(m || `ثمن مشترياتي <b>${rial(r.p)}</b>، وهذه <b>${rial(r.P)}</b>. كم الباقي؟`, k)}
        <div class="tray">${d.tray.length ? d.tray.map((v, i) => { const c = MONEY.find(x => x[0] === v); return `<button class="chip ${c[2] ? 'note' : 'coin'}" style="${c[2] ? 'background:' + c[2] : ''}" data-t="${i}">${c[1]}</button>`; }).join('') : '<span class="empty">ضع الباقي هنا</span>'}</div>
        <div class="wallet">${MONEY.map(([v, l, col]) => `<button class="money ${col ? 'note' : 'coin'}" style="${col ? 'background:' + col : ''}" data-v="${v}">${l}</button>`).join('')}</div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🪙 أعطه الباقي</button></div>`);
      panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.tray.length < 16) { d.tray.push(+b.dataset.v); sfx('pick'); render(m, k); } });
      panel().querySelectorAll('[data-t]').forEach(b => b.onclick = e => { e.stopPropagation(); d.tray.splice(+b.dataset.t, 1); sfx('drop'); render(m, k); });
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { const s = d.tray.reduce((a, b) => a + b, 0), ch = r.P - r.p;
        if (s === ch) { sfx('win'); d.r++; d.tray = []; changed(); if (d.r >= 4) { sheetClose(); await finish(W, 'mentalAddSub', [{ who: 'mariam', text: 'أربعة زبائن راضون! تحسب الباقي أسرع من الآلة.' }]); } else this.open(W, d, '✓ شكراً! الزبون التالي…', 'ok'); }
        else { sfx('cough'); d.tray = []; render(s < ch ? 'الباقي ناقص! عُدّ مرة أخرى' : 'أعطيتني أكثر من الباقي! عُدّ مرة أخرى', 'bad'); } });
    };
    render(msg, kind);
  }
}, at(ST4.change, 'change', '🪙 كشك مريم'));

/* ═══ ٣٢. استراتيجيات ذهنية للضرب (٢) — «مخزن الحبوب» ═══ */
export const multiplyStrategies2 = Object.assign({
  id: 'multiplyStrategies2', giver: 'khamis',
  intro: n => [{ who: 'khamis', text: `يا ${n}! أنا خميس أمين مخزن الحبوب. على اللوح حقيقة نعرفها، والطلبات تُحسب منها.` },
    { who: 'khamis', text: 'لا تحسب من البداية: استنتج من الحقيقة المعروفة بالمضاعفة أو التنصيف أو إضافة مجموعة.' }],
  begin(d) { const a = R(12, 25), b = R(6, 12) * 2, c = a * b;
    d.rounds = [{ fact: [a, b, c], q: [2 * a, b], ans: 2 * a * b }, { fact: [a, b, c], q: [a + 1, b], ans: (a + 1) * b }, { fact: [a, b, c], q: [a, b / 2], ans: a * b / 2 }]; d.r = 0; },
  goal: d => `🌾 احسب أوزان طلبات المخزن ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], [a, b, c] = r.fact;
    sheetOpen(`<h3>🌾 مخزن الحبوب</h3><div class="factb">الحقيقة المعروفة: <b>${ar(a)} × ${ar(b)} = ${ar(c)}</b></div>${msgBox(msg || `الطلب: <b>${ar(r.q[0])} × ${ar(r.q[1])}</b> كيلوغرام. كم الوزن؟`, kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
    const pad = numPad(panel().querySelector('#pad'), '⚖️ زِن الطلب', async v => { if (v === r.ans) { sfx('win'); d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'multiplyStrategies2', [{ who: 'khamis', text: 'استنتجتَ كل طلب من حقيقة واحدة! هذا هو الحساب الذكي.' }]); } else this.open(W, d, '✓ الوزن صحيح! الطلب التالي…', 'ok'); } else { sfx('cough'); pad.clear(); setMsg('الميزان لا يتوازن. استنتج من الحقيقة المعروفة', 'bad'); } }, { dot: false });
    btn('benchOut', () => { sheetClose(); changed(); });
  }
}, at(ST4.grain, 'grain', '🌾 لوح المخزن'));

/* ═══ ٣٣. قواعد قابلية القسمة — «أكياس التمر» (سير متحرك) ═══ */
export const divisibility = Object.assign({
  id: 'divisibility', giver: 'saleh',
  intro: n => [{ who: 'saleh', text: `أهلاً يا ${n}! أنا صالح تاجر التمر. الأكياس تمر على السير، وعلى كل كيس عدد تمراته.` },
    { who: 'saleh', text: 'اسحب من السير الأكياس التي تُقسم تمراتها بالتساوي حسب الطلب، واترك غيرها يمضي.' }],
  begin(d) { d.rounds = shuffle([3, 9, 4, 5, 6]).slice(0, 3); d.r = 0; d.got = 0; },
  goal: d => `🌴 اسحب أكياس التمر المناسبة ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const n = d.rounds[d.r], RULE = { 3: 'على ٣', 9: 'على ٩', 4: 'على ٤', 5: 'على ٥', 6: 'على ٦' };
    sheetOpen(`<h3>🌴 سير أكياس التمر</h3>${msgBox(msg || `اسحب الأكياس التي تُقسم تمراتها <b>${RULE[n]}</b> بالتساوي (${ar(d.got)} من ${ar(3)})`, kind)}<canvas id="belt" width="320" height="130" style="touch-action:none"></canvas><button class="act ghost" id="benchOut">رجوع</button>`);
    const cv = panel().querySelector('#belt'), c = hiDPI(cv); let sacks = [], last = 0, live = true, spawn = 0;
    const mk = () => { let v = R(100, 999); if (Math.random() < .5) v = Math.ceil(v / n) * n; return { v, x: 340, ok: v % n === 0 }; };
    const loop = now => { if (!live || !document.getElementById('belt')) return; const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; spawn -= dt; if (spawn <= 0) { sacks.push(mk()); spawn = 1.25; }
      sacks.forEach(s => s.x -= 55 * dt); sacks = sacks.filter(s => s.x > -40 && !s.gone); cv.__sacks = sacks;   // للاختبار الآلي
      c.clearRect(0, 0, 320, 130); c.fillStyle = '#5E6B78'; rr(c, 0, 76, 320, 22, 6); c.fill(); c.fillStyle = '#3B4452'; for (let i = 0; i < 16; i++) c.fillRect(((i * 22 - now / 18) % 330 + 330) % 330 - 5, 80, 3, 14);
      sacks.forEach(s => { c.fillStyle = '#B8874E'; rr(c, s.x - 24, 34, 48, 44, 10); c.fill(); c.fillStyle = '#7A4F2A'; c.fillRect(s.x - 8, 30, 16, 6); c.fillStyle = '#FFFDF6'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(ar(s.v), s.x, 62); });
      requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    cv.addEventListener('pointerdown', async e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; const s = sacks.find(k => Math.abs(k.x - x) < 28 && y > 26 && y < 84); if (!s) return; s.gone = true;
      if (s.ok) { d.got++; sfx('pick'); setMsg(`✓ ${ar(s.v)} يُقسم ${RULE[n]} (${ar(d.got)} من ${ar(3)})`, 'ok'); if (d.got >= 3) { live = false; d.r++; d.got = 0; changed(); await wait(600); if (d.r >= 3) { sheetClose(); await finish(W, 'divisibility', [{ who: 'saleh', text: 'قواعد القسمة في رأسك كالمسطرة! كل كيس في مكانه.' }]); } else this.open(W, d, 'طلب جديد على السير…', 'ok'); } }
      else { sfx('cough'); setMsg(`${ar(s.v)} لا يُقسم ${RULE[n]} بالتساوي، فانسكب الكيس!`, 'bad'); } });
    btn('benchOut', () => { live = false; sheetClose(); changed(); });
  }
}, at(ST4.conveyor, 'belt', '🌴 سير الأكياس'));

/* ═══ ٣٤. الضرب — «بلاط السطح» (نموذج المساحة) ═══ */
export const multiplyT2 = Object.assign({
  id: 'multiplyT2', giver: 'murad',
  intro: n => [{ who: 'murad', text: `يا ${n}! أنا مراد البنّاء. سأبلّط سطح بيتي، والسطح مستطيل كبير.` },
    { who: 'murad', text: 'قسّمته أربعة أجزاء ليسهل الحساب: احسب بلاط كل جزء، ثم المجموع.' }],
  begin(d) { d.rounds = [0, 1].map(() => [R(12, 38), R(12, 29)].map(v => v % 10 ? v : v + 3)); d.r = 0; },
  goal: d => `🧱 احسب بلاط السطح ${roundsDone(d, 2)}`,
  open(W, d, msg, kind) {
    const [a, b] = d.rounds[d.r], a1 = Math.floor(a / 10) * 10, a0 = a % 10, b1 = Math.floor(b / 10) * 10, b0 = b % 10;
    const parts = [[a1, b1], [a1, b0], [a0, b1], [a0, b0]];
    sheetOpen(`<h3>🧱 سطح ${ar(a)} × ${ar(b)}</h3>${msgBox(msg || 'اكتب عدد البلاط في كل جزء، ثم المجموع', kind)}
      <div class="amodel"><i></i><b>${ar(a1)}</b><b>${ar(a0)}</b><b>${ar(b1)}</b>${parts.slice(0, 2).map((p, i) => `<input inputmode="numeric" data-p="${i}" placeholder="${ar(p[0])}×${ar(p[1])}">`).join('')}<b>${ar(b0)}</b>${parts.slice(2).map((p, i) => `<input inputmode="numeric" data-p="${i + 2}" placeholder="${ar(p[0])}×${ar(p[1])}">`).join('')}</div>
      <div class="cnt"><span>المجموع</span><input inputmode="numeric" id="tot" class="totin"></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🧱 بلّط السطح</button></div>`);
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const vals = [...panel().querySelectorAll('[data-p]')].map(i => +nArab(i.value)), wrong = parts.filter((p, i) => vals[i] !== p[0] * p[1]).length, tot = +nArab(panel().querySelector('#tot').value);
      if (wrong) { sfx('cough'); setMsg(`${ar(wrong)} من الأجزاء الأربعة حسابها غير صحيح`, 'bad'); return; }
      if (tot !== a * b) { sfx('cough'); setMsg('الأجزاء صحيحة، لكن المجموع غير صحيح', 'bad'); return; }
      sfx('win'); d.r++; changed(); if (d.r >= 2) { sheetClose(); await finish(W, 'multiplyT2', [{ who: 'murad', text: 'السطح مبلّط بلا بلاطة زائدة ولا ناقصة!' }]); } else this.open(W, d, '✓ السطح الأول جاهز! والسطح الثاني…', 'ok');
    });
  },
  draw(d, t, active, done) { const b = Object.assign({}, B4.roof, { H: H_B }); return done ? [{ y: b.y + b.h + 1, draw: c => onRoof(c, b, (r, ry) => {   // بلاط القرميد على السطح نفسه: صفوف متراكبة بظل
    for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) { const x = b.x + 12 + i * 22.6 + (j % 2) * 6, y = ry + 12 + j * 19; if (x + 20 > b.x + b.w - 8) continue;
      r.fillStyle = '#9E3A2A'; r.fillRect(x, y + 12, 20, 4); r.fillStyle = j % 2 ? '#C0503A' : '#B8452F'; r.beginPath(); r.moveTo(x, y + 12); r.lineTo(x, y + 3); r.quadraticCurveTo(x + 10, y - 3, x + 20, y + 3); r.lineTo(x + 20, y + 12); r.closePath(); r.fill();
      r.fillStyle = 'rgba(255,220,190,.25)'; r.fillRect(x + 3, y + 2, 3, 9); }
    r.strokeStyle = INK; r.lineWidth = 1; r.strokeRect(b.x + 8, ry + 8, b.w - 16, b.h - 16);
  }) }] : []; }
}, (() => { const s = at(ST4.roof, 'roof', '🧱 مخطط السطح'); delete s.draw; return s; })());

/* ═══ ٣٥. القسمة (٢) — «توزيع الحلوى» ═══ */
export const division2 = Object.assign({
  id: 'division2', giver: 'zahra',
  intro: n => [{ who: 'zahra', text: `أهلاً يا ${n}! أنا زهرة، أعبّئ الحلوى والتمر لضيوف القلعة.` },
    { who: 'zahra', text: 'اضبط آلة التعبئة بالأعداد الصحيحة، وانتبه: أحياناً يبقى شيء، وأحياناً نحتاج حافلة إضافية!' }],
  begin(d) { let N, k; do { N = R(100, 199); k = R(6, 9); } while (N % k === 0); let P, cap; do { P = R(81, 139); cap = [15, 20, 25][R(0, 2)]; } while (P % cap === 0); const k3 = R(6, 9), q3 = R(15, 30);
    d.rounds = [{ t: 'qr', text: `${ar(N)} قطعة حلوى، والعلبة تتسع ${ar(k)}. كم علبة ممتلئة؟ وكم قطعة تبقى؟`, q: Math.floor(N / k), rm: N % k }, { t: 'up', text: `${ar(P)} زائراً، والحافلة تتسع ${ar(cap)}. كم حافلة نحتاج لنقلهم جميعاً؟`, q: Math.ceil(P / cap) }, { t: 'ex', text: `${ar(k3 * q3)} تمرة توزع على ${ar(k3)} أطباق بالتساوي. كم تمرة في كل طبق؟`, q: q3 }]; d.r = 0; d.n = 0; d.left = 0; },
  goal: d => `🍬 اضبط آلة التعبئة ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r]; d.n = 0; d.left = 0;
    sheetOpen(`<h3>🍬 آلة التعبئة</h3>${msgBox(msg || r.text, kind)}<div id="cnt"></div><div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⚙️ شغّل الآلة</button></div>`);
    counters(panel().querySelector('#cnt'), r.t === 'qr' ? [['n', '📦 علب ممتلئة', 60], ['left', '🍬 قطع متبقية', 20]] : [['n', r.t === 'up' ? '🚌 حافلات' : '🍽️ في كل طبق', 60]], d);
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const ok = r.t === 'qr' ? d.n === r.q && d.left === r.rm : d.n === r.q;
      if (ok) { sfx('win'); d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'division2', [{ who: 'zahra', text: 'تعبئة مثالية! عرفتَ متى نأخذ الباقي ومتى نزيد حافلة.' }]); } else this.open(W, d, `✓ تمت التعبئة! ${d.rounds[d.r].text}`, 'ok'); }
      else { sfx('cough'); setMsg(r.t === 'up' && d.n === r.q - 1 ? 'بقي زوار بلا حافلة!' : 'الآلة توقفت: التوزيع غير صحيح', 'bad'); }
    });
  }
}, at(ST4.pack, 'pack', '🍬 آلة التعبئة'));

/* ═══ ٣٦. الأعداد الخاصة — «حرّاس البوابة» ═══ */
const isSq = n => Number.isInteger(Math.sqrt(n));
const RIDDLES = [
  { text: 'أضئ كل الأعداد المربعة', ok: isSq },
  { text: 'أضئ كل مضاعفات ٢٥', ok: n => n % 25 === 0 },
  { text: 'أضئ الأعداد المربعة الزوجية', ok: n => isSq(n) && n % 2 === 0 },
  { text: 'أضئ مضاعفات ٥ التي ليست من مضاعفات ١٠', ok: n => n % 5 === 0 && n % 10 !== 0 }
];
export const specialNumbers = Object.assign({
  id: 'specialNumbers', giver: 'azzan',
  intro: n => [{ who: 'azzan', text: `قف! أنا عزّان حارس البوابة الداخلية للقلعة.` },
    { who: 'azzan', text: `لا تُفتح البوابة إلا لمن يحل ألغاز الحجارة يا ${n}. أضئ الحجارة التي يطلبها كل لغز، ولا تُضئ غيرها.` }],
  begin(d) { d.rounds = [0, 1, 2].map(() => R(0, 3)).map((k, i) => [0, 1, [2, 3][R(0, 1)]][i]).map(k => { const T = shuffle(Array.from({ length: 100 }, (_, i) => i + 1).filter(RIDDLES[k].ok)).slice(0, 5), F = shuffle(Array.from({ length: 100 }, (_, i) => i + 1).filter(x => !RIDDLES[k].ok(x))).slice(0, 11); return { k, nums: shuffle(T.concat(F)) }; }); d.r = 0; d.sel = []; },
  goal: d => `🛡️ حل ألغاز حجارة البوابة ${roundsDone(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], rd = RIDDLES[r.k];
    sheetOpen(`<h3>🛡️ لغز البوابة ${ar(d.r + 1)}</h3>${msgBox(msg || rd.text, kind)}<div class="stones">${r.nums.map((v, i) => `<button class="stone ${d.sel.includes(i) ? 'on' : ''}" data-i="${i}">${ar(v)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🛡️ افتح البوابة</button></div>`);
    panel().querySelectorAll('.stone').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else d.sel.push(i); b.classList.toggle('on'); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const bad = d.sel.filter(i => !rd.ok(r.nums[i])).length, miss = r.nums.filter((v, i) => rd.ok(v) && !d.sel.includes(i)).length;
      if (!bad && !miss) { sfx('win'); d.r++; d.sel = []; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'specialNumbers', [{ who: 'azzan', text: 'انفتحت البوابة الداخلية! أنت جدير بلقب حارس الأعداد.' }], 60); } else this.open(W, d, '✓ توهجت الحجارة! اللغز التالي…', 'ok'); }
      else { sfx('cough'); setMsg(bad ? 'بعض الحجارة المضيئة لا تحقق اللغز' : `بقيت ${ar(miss)} حجارة تحقق اللغز ولم تُضئها`, 'bad'); }
    });
  }
}, at(ST4.gate, 'gate', '🛡️ حجارة البوابة'));

export const UNIT4 = { numberLineEstimate, hieroNumbers, decimalSystem, decimalOperations, decimalApplications, integers, commonMultiples, mentalAddSub, multiplyStrategies2, divisibility, multiplyT2, division2, specialNumbers };
