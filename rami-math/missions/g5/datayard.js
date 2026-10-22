// الصف الخامس — بستان البيانات (الوحدات ١٥–١٨ في الكتاب): استبيان بعلامات العدّ، أعمدة تُبنى بالتدريج، كيس كرات للاحتمال،
// نقاط حرارة على رسم خطي، وفرز الفاكهة لإيجاد المنوال.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable, stall } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, panel, sheetOpen, msgBox, btn } from '../bench.js';
import { step, at, advance, kp, out, shadowE } from './common.js';

export const ST5D = { survey: { x: 862, y: 3372 }, bars: { x: 556, y: 3147 }, luck: { x: 1722, y: 3306 }, weather: { x: 1222, y: 3376 }, basket: { x: 2342, y: 3392 } };
const N = n => ar(n);
const sign = (c, x, y, t, bg, dx = 96) => bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg });
const FR = [['🍊', 'برتقال'], ['🥭', 'مانجو'], ['🍋', 'ليمون'], ['🍍', 'أناناس']];
const WORDS = ['مستحيل', 'غير مرجّح', 'متساوي الفرص', 'مرجّح', 'مؤكد'];
const likeWord = (k, n) => k === 0 ? WORDS[0] : k === n ? WORDS[4] : 2 * k === n ? WORDS[2] : 2 * k < n ? WORDS[1] : WORDS[3];

const PROPS = {
  survey(c, x, y) { shadowE(c, x, y, 24); c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 56, 4, 56); c.fillStyle = '#FFFDF6'; rr(c, x - 22, y - 74, 44, 32, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .7; c.stroke();
    c.fillStyle = '#2A1B66'; for (let k = 0; k < 3; k++) { c.fillRect(x - 16, y - 68 + k * 9, 8, 2); for (let j = 0; j < 3; j++) c.fillRect(x - 4 + j * 4, y - 70 + k * 9, 1.5, 6); } sign(c, x, y, '📋 استبيان الفاكهة', '#E2475C'); },
  bars(c, x, y) { shadowE(c, x, y, 30); c.fillStyle = '#2A3A4A'; rr(c, x - 30, y - 70, 60, 44, 4); c.fill(); ['#3FA3F5', '#FFC23D', '#2E9E5B', '#E2475C'].forEach((col, k) => { const h = [20, 32, 14, 26][k]; c.fillStyle = col; c.fillRect(x - 24 + k * 13, y - 30 - h, 9, h); });
    c.fillStyle = PAL.wood; c.fillRect(x - 24, y - 26, 4, 26); c.fillRect(x + 20, y - 26, 4, 26); sign(c, x, y, '📊 لوحة الأعمدة', '#2F6FB2'); },
  luck(c, x, y, d, t) { shadowE(c, x, y, 24); c.fillStyle = '#7B3F98'; rr(c, x - 22, y - 40, 44, 40, 6); c.fill(); c.fillStyle = '#FFC23D'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('؟', x, y - 14);
    [['#E2475C', -12], ['#3FA3F5', 10]].forEach(([col, dx], i) => { c.fillStyle = col; c.beginPath(); c.arc(x + dx, y - 48 - Math.abs(Math.sin(t * 2 + i)) * 6, 5, 0, 7); c.fill(); }); sign(c, x, y, '🎲 صندوق الحظ', '#7B3F98'); },
  weather(c, x, y, d, t) { shadowE(c, x, y, 20); c.fillStyle = '#C9CED4'; c.fillRect(x - 2, y - 80, 4, 80); c.fillStyle = '#F5F0E6'; rr(c, x - 16, y - 40, 32, 22, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .6; c.stroke();
    c.save(); c.translate(x, y - 84); c.rotate(t * 3); c.fillStyle = '#E2475C'; for (let k = 0; k < 3; k++) { c.rotate(Math.PI * 2 / 3); c.beginPath(); c.arc(0, -9, 3.5, 0, 7); c.fill(); } c.restore(); sign(c, x, y, '🌤️ محطة الطقس', '#1F5D7A'); },
  basket(c, x, y) { workTable(c, x, y); [['#F28C28', -16], ['#E3B04B', 0], ['#FFE45C', 16]].forEach(([col, dx]) => { c.fillStyle = col; c.beginPath(); c.arc(x + dx, y - 38, 6, 0, 7); c.fill(); }); sign(c, x, y, '🧺 سلة الأكثر', '#8A5A30', -96); }
};
const station = (k, label) => at(ST5D[k], k, label, PROPS[k]);

/* ═══ ١٥-١ الأسئلة والاستبيانات — «استبيان الفاكهة» (علامات العدّ إجابةً إجابة) ═══ */
export const survey5 = Object.assign({
  id: 'survey5', giver: 'sara',
  intro: n => [{ who: 'sara', text: `أهلاً يا ${n}! أنا سارة. نريد أن نعرف الفاكهة المفضلة لأهل البستان.` },
    { who: 'sara', text: 'كل إجابة تصلك ضع لها علامة عدّ في صف فاكهتها. ثم نحسب المجموع ونختار أسئلة استبياننا القادم.' }],
  begin(d) { const ans = Array.from({ length: R(10, 13) }, () => R(0, 3)); d.rounds = [{ t: 'tally', ans }, { t: 'total', ans }, { t: 'q' }]; d.r = 0; d.i = 0; d.cnt = [0, 0, 0, 0]; },
  goal: d => `📋 أكمل استبيان سارة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'sara', text: 'استبيان دقيق! تجمع البيانات بعلامات العدّ وتختار الأسئلة المناسبة.' }];
    const sheet = cnt => `<table class="chTable">${FR.map(([e, n], k) => `<tr><th>${e} ${n}</th><td class="ltr" dir="ltr">${'<s>||||</s> '.repeat(Math.floor(cnt[k] / 5))}${'|'.repeat(cnt[k] % 5)}</td></tr>`).join('')}</table>`;
    if (r.t === 'total') return kp(this, W, d, { title: '📋 مجموع الاستبيان', visual: sheet(d.cnt), text: 'كم شخصاً أجاب عن الاستبيان؟', ans: r.ans.length, n: 3, id: 'survey5', msg, kind, opts: { dot: false }, lines: L, hint: 'ليس هذا المجموع: عُدّ كل حزمة خمساً، ثم العلامات المفردة.' });
    if (r.t === 'q') { const Q = [['ماذا تفضّل في الاستراحة: فاكهة أم حلوى؟', 1], ['كم عمرك؟', 0], ['ما لون حقيبتك؟', 0]]; if (!d.qo) d.qo = shuffle(Q);
      sheetOpen(`<h3>📋 الاستبيان القادم</h3>${msgBox((msg ? msg + ' ' : '') + 'فرضيتنا: «أهل البستان يفضّلون الفاكهة على الحلوى». أي سؤال نضعه في الاستبيان؟', kind)}<div class="g5cards col">${d.qo.map((q, i) => `<button class="g5card" data-q="${i}">${q[0]}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-q]').forEach(b => b.onclick = async e => { e.stopPropagation(); if (d.qo[+b.dataset.q][1]) await advance(this, W, d, 3, 'survey5', L); else { sfx('cough'); this.open(W, d, 'هذا السؤال لا يجمع بيانات عن الفرضية.', 'bad'); } });
      return out(); }
    const cur = r.ans[d.i];
    sheetOpen(`<h3>📋 ورقة جمع البيانات</h3>${msgBox((msg ? msg + ' ' : '') + `الإجابة ${N(d.i + 1)} من ${N(r.ans.length)}: «أفضّل <b>${FR[cur][1]}</b> ${FR[cur][0]}». ضع علامة في صفها.`, kind)}
      ${sheet(d.cnt)}<div class="row2">${FR.map(([e, n], k) => `<button class="act" data-k="${k}">${e} ${n}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = async e => { e.stopPropagation(); const k = +b.dataset.k;
      if (k !== cur) { sfx('cough'); return this.open(W, d, 'العلامة في صف آخر! اقرأ الإجابة جيداً.', 'bad'); }
      d.cnt[k]++; d.i++; sfx('drop'); changed();
      if (d.i >= r.ans.length) await advance(this, W, d, 3, 'survey5', L); else this.open(W, d); });
    out();
  }
}, station('survey', '📋 استبيان الفاكهة'));

/* ═══ ١٥-٢ فحص البيانات — «لوحة الأعمدة» (بناء الأعمدة بالتدريج) ═══ */
const SP = ['الجري', 'السباحة', 'الدراجة', 'الإبحار'];
function barsSvg(h, max, stepV) {
  const W2 = 240, H2 = 150, L = 34, y = v => 10 + H2 - v / max * H2; let s = `<svg viewBox="0 0 ${W2 + L + 10} ${H2 + 40}" class="g5q" style="max-width:300px">`;
  for (let v = 0; v <= max; v += stepV) s += `<line x1="${L}" y1="${y(v)}" x2="${L + W2}" y2="${y(v)}" stroke="#E3E7F0"/><text x="${L - 4}" y="${y(v) + 4}" font-size="10" font-weight="800" fill="${INK}" text-anchor="end">${ar(v)}</text>`;
  h.forEach((v, i) => { const x = L + 12 + i * 58; s += `<rect x="${x}" y="${y(v)}" width="34" height="${H2 + 10 - y(v)}" fill="${['#3FA3F5', '#FFC23D', '#2E9E5B', '#E2475C'][i]}" stroke="${INK}"/><text x="${x + 17}" y="${H2 + 26}" font-size="11" font-weight="900" fill="${INK}" text-anchor="middle">${SP[i].replace('ال', '')}</text>`; });
  return s + `<line x1="${L}" y1="${y(0)}" x2="${L + W2}" y2="${y(0)}" stroke="${INK}" stroke-width="2"/></svg>`;
}
export const checkData5 = Object.assign({
  id: 'checkData5', giver: 'hamid',
  intro: n => [{ who: 'hamid', text: `مرحباً يا ${n}! أنا حامد. عندي جداول، وأريدها أعمدة على اللوحة ليفهمها الجميع.` },
    { who: 'hamid', text: 'ارفع كل عمود حتى يطابق الجدول. انتبه للتدريج: كم يزيد كل خط في المحور الرأسي؟' }],
  begin(d) { const a = shuffle([5, 10, 15, 20, 25, 30, 35, 40]).slice(0, 4), b = shuffle([10, 20, 30, 40, 50, 60, 70, 80]).slice(0, 4); d.rounds = [{ v: a, max: 40, st: 5 }, { v: b, max: 80, st: 10 }, { t: 'read', v: b }]; d.r = 0; d.h = [0, 0, 0, 0]; },
  goal: d => `📊 ارسم لوحات حامد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hamid', text: 'لوحات واضحة ودقيقة! تبني الأعمدة بالتدريج المناسب وتقرأ منها.' }];
    if (r.t === 'read') { const i = r.v.indexOf(Math.max(...r.v)), j = r.v.indexOf(Math.min(...r.v));
      return kp(this, W, d, { title: '📊 قراءة اللوحة', visual: barsSvg(r.v, 80, 10), text: `بكم يزيد عدد طلاب <b>${SP[i]}</b> على طلاب <b>${SP[j]}</b>؟`, ans: r.v[i] - r.v[j], n: 3, id: 'checkData5', msg, kind, opts: { dot: false }, lines: L, hint: 'اقرأ ارتفاع العمودين ثم اطرح.' }); }
    sheetOpen(`<h3>📊 لوحة ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + 'ارفع الأعمدة حتى تطابق الجدول.', kind)}
      <table class="chTable"><tr><th>النشاط</th>${SP.map(s => `<td>${s}</td>`).join('')}</tr><tr><th>الطلاب</th>${r.v.map(v => `<td>${N(v)}</td>`).join('')}</tr></table>
      <div class="g5center">${barsSvg(d.h, r.max, r.st)}</div>
      <div class="row2" style="direction:ltr">${SP.map((s, i) => `<div class="g5bctl"><button class="act ghost" data-b="${i}" data-v="1">▲</button><button class="act ghost" data-b="${i}" data-v="-1">▼</button></div>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📊 علّق اللوحة</button></div>`);
    panel().querySelectorAll('[data-b]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.b; d.h[i] = Math.max(0, Math.min(r.max, d.h[i] + r.st * +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const bad = r.v.findIndex((v, i) => v !== d.h[i]);
      if (bad < 0) { d.h = [0, 0, 0, 0]; await advance(this, W, d, 3, 'checkData5', L); }
      else { sfx('cough'); this.open(W, d, `عمود «${SP[bad]}» لا يطابق الجدول: كل خط يزيد ${N(r.st)}.`, 'bad'); } });
  }
}, station('bars', '📊 لوحة الأعمدة'));

/* ═══ ١٦-١ الاحتمال — «صندوق الحظ» (كيس يُملأ حتى يصير الحدث كما يُطلب) ═══ */
export const chance5 = Object.assign({
  id: 'chance5', giver: 'noor',
  intro: n => [{ who: 'noor', text: `أهلاً يا ${n}! أنا نور، أعدّ صندوق الحظ لألعاب البستان.` },
    { who: 'noor', text: 'في الكيس ١٠ كرات. اختر كم كرة حمراء (والباقي زرقاء) حتى يصبح سحب كرة حمراء كما أطلب.' }],
  begin(d) { d.rounds = shuffle(WORDS).slice(0, 3); d.r = 0; d.red = 3; },
  goal: d => `🎲 جهّز صندوق الحظ ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const w = d.rounds[d.r];
    sheetOpen(`<h3>🎲 صندوق الحظ</h3>${msgBox((msg ? msg + ' ' : '') + `اجعل سحب كرة حمراء <b>${w}</b>.`, kind)}
      <div class="g5bag">${Array.from({ length: 10 }, (_, i) => `<i class="${i < d.red ? 'r' : 'b'}"></i>`).join('')}</div>
      <div class="row2"><div class="cnt g5cnt"><span>الكرات الحمراء</span><button class="act ghost" data-k="-1">−</button><b>${N(d.red)}</b><button class="act ghost" data-k="1">+</button></div></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🎲 أغلق الصندوق</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); d.red = Math.max(0, Math.min(10, d.red + +b.dataset.k)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const got = likeWord(d.red, 10);
      if (got === w) await advance(this, W, d, 3, 'chance5', [{ who: 'noor', text: 'صندوق حظ عادل وواضح! تصف الأحداث بلغة الاحتمال بدقة.' }]);
      else { sfx('cough'); this.open(W, d, `بهذا الكيس يكون سحب الحمراء «${got}»، والمطلوب «${w}».`, 'bad'); } });
  }
}, station('luck', '🎲 صندوق الحظ'));

/* ═══ ١٧-١ الرسم البياني الخطي — «محطة الطقس» (نقاط تُرفع ثم تقدير بين نقطتين) ═══ */
const HRS = ['٨', '٩', '١٠', '١١', '١٢', '١'];
function lineSvg(h, max) {
  const L = 34, W2 = 250, H2 = 150, x = i => L + 20 + i * 44, y = v => 10 + H2 - v / max * H2; let s = `<svg viewBox="0 0 ${W2 + L + 10} ${H2 + 40}" class="g5q" style="max-width:300px">`;
  for (let v = 0; v <= max; v += 4) s += `<line x1="${L}" y1="${y(v)}" x2="${L + W2}" y2="${y(v)}" stroke="#E3E7F0"/><text x="${L - 4}" y="${y(v) + 4}" font-size="10" font-weight="800" fill="${INK}" text-anchor="end">${ar(v)}</text>`;
  s += `<polyline points="${h.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="#E2475C" stroke-width="3"/>`;
  h.forEach((v, i) => s += `<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="#E2475C"/><text x="${x(i)}" y="${H2 + 26}" font-size="11" font-weight="900" fill="${INK}" text-anchor="middle">${HRS[i]}</text>`);
  return s + `<line x1="${L}" y1="${y(0)}" x2="${L + W2}" y2="${y(0)}" stroke="${INK}" stroke-width="2"/></svg>`;
}
export const lineGraph5 = Object.assign({
  id: 'lineGraph5', giver: 'khalfan',
  intro: n => [{ who: 'khalfan', text: `أهلاً يا ${n}! أنا خلفان راصد محطة الطقس. سجّلتُ الحرارة كل ساعة.` },
    { who: 'khalfan', text: 'ارفع كل نقطة إلى درجتها على الرسم. الحرارة تتغير باستمرار، فالخط بين النقاط له معنى.' }],
  begin(d) { const base = R(7, 10) * 2, up = shuffle([2, 4, 6]); /* زوجي: النقاط تتحرك بخطوات ٢ */ const T = [base, base + up[0], base + up[0] + up[1], base + up[0] + up[1] + up[2]]; T.push(T[3] - 2, T[3] - 2 - R(1, 2) * 2);
    const i = R(0, 4); d.rounds = [{ t: 'plot', T }, { t: 'mid', T, i }, { t: 'mean' }]; d.r = 0; d.h = [0, 0, 0, 0, 0, 0]; },
  goal: d => `🌤️ سجّل طقس خلفان ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'khalfan', text: 'نشرة الطقس جاهزة! ترسم الخط وتقرأ ما بين النقاط بفهم.' }];
    if (r.t === 'mid') return kp(this, W, d, { title: '🌤️ ما بين القراءتين', visual: `<div class="g5center">${lineSvg(r.T, 40)}</div>`, text: `قدّر الحرارة عند منتصف المسافة بين الساعة <b>${HRS[r.i]}</b> والساعة <b>${HRS[r.i + 1]}</b>.`, ans: (r.T[r.i] + r.T[r.i + 1]) / 2, n: 3, id: 'lineGraph5', msg, kind, lines: L, hint: 'منتصف الخط بين النقطتين: نصف المسافة بين الدرجتين.' });
    if (r.t === 'mean') {
      sheetOpen(`<h3>🌤️ سؤال الراصد</h3>${msgBox((msg ? msg + ' ' : '') + 'عدد زوار البستان سُجّل يومي الأحد والاثنين. هل للنقطة «بين الأحد والاثنين» على الخط معنى؟', kind)}
        <div class="row2"><button class="act" id="mYes">نعم، لها معنى</button><button class="act" id="mNo">لا، ليس لها معنى</button></div><button class="act ghost" id="benchOut">رجوع</button>`);
      btn('mNo', async () => await advance(this, W, d, 3, 'lineGraph5', L));
      btn('mYes', () => { sfx('cough'); this.open(W, d, 'لا يوجد يوم بين الأحد والاثنين! بخلاف الحرارة التي تتغير كل لحظة.', 'bad'); });
      return out();
    }
    sheetOpen(`<h3>🌤️ رسم الحرارة</h3>${msgBox((msg ? msg + ' ' : '') + 'ارفع كل نقطة إلى درجة الحرارة في الجدول.', kind)}
      <table class="chTable"><tr><th>الساعة</th>${HRS.map(h => `<td>${h}</td>`).join('')}</tr><tr><th>الحرارة°</th>${r.T.map(v => `<td>${N(v)}</td>`).join('')}</tr></table>
      <div class="g5center">${lineSvg(d.h, 40)}</div>
      <div class="row2" style="direction:ltr">${HRS.map((_, i) => `<div class="g5bctl"><button class="act ghost" data-p="${i}" data-v="1">▲</button><button class="act ghost" data-p="${i}" data-v="-1">▼</button></div>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🌤️ انشر النشرة</button></div>`);
    panel().querySelectorAll('[data-p]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.p; d.h[i] = Math.max(0, Math.min(40, d.h[i] + 2 * +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const bad = r.T.findIndex((v, i) => v !== d.h[i]);
      if (bad < 0) { d.h = [0, 0, 0, 0, 0, 0]; await advance(this, W, d, 3, 'lineGraph5', L); }
      else { sfx('cough'); this.open(W, d, `نقطة الساعة ${HRS[bad]} ليست في مكانها: كل خط يزيد ٤، فالنقطة بين خطين تعني زيادة ٢.`, 'bad'); } });
  }
}, station('weather', '🌤️ محطة الطقس'));

/* ═══ ١٨-١ إيجاد المنوال — «سلة الأكثر» (فرز الفاكهة ثم المنوال) ═══ */
export const mode5 = Object.assign({
  id: 'mode5', giver: 'yaqoob',
  intro: n => [{ who: 'yaqoob', text: `حياك يا ${n}! أنا يعقوب. قطفنا فاكهة كثيرة مختلطة في سلة واحدة.` },
    { who: 'yaqoob', text: 'افرز كل ثمرة في صندوقها، ثم أخبرني: أي فاكهة هي المنوال (الأكثر تكراراً)؟' }],
  begin(d) {
    const mk = () => { const m = R(0, 3), c = [R(1, 3), R(1, 3), R(1, 3), R(1, 3)]; c[m] = Math.max(...c) + R(1, 2); return { items: shuffle(c.flatMap((k, i) => Array(k).fill(i))), m }; };
    let L; for (let t = 0; t < 30; t++) { const m = R(1, 6); L = shuffle([m, m, m, R(1, 6), R(1, 6), R(1, 6), R(1, 6), R(1, 6)]); const c = {}; L.forEach(v => c[v] = (c[v] || 0) + 1); const mx = Math.max(...Object.values(c)); if (Object.values(c).filter(x => x === mx).length === 1) break; }
    d.rounds = [mk(), mk(), { t: 'dice', L }]; d.r = 0; d.i = 0; d.cnt = [0, 0, 0, 0];
  },
  goal: d => `🧺 افرز سلة يعقوب ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'yaqoob', text: 'الصناديق مرتبة والمنوال واضح! تجد القيمة الأكثر تكراراً بسرعة.' }];
    if (r.t === 'dice') { const c = {}; r.L.forEach(v => c[v] = (c[v] || 0) + 1); const m = +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
      return kp(this, W, d, { title: '🎲 رميات النرد', text: `رمى يعقوب النرد ٨ مرات: ${r.L.map(N).join('، ')}. ما المنوال؟`, ans: m, n: 3, id: 'mode5', msg, kind, opts: { dot: false }, lines: L, hint: 'ليس هذا المنوال: عُدّ مرات ظهور كل وجه.' }); }
    const done = d.i >= r.items.length;
    sheetOpen(`<h3>🧺 سلة ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + (done ? 'فرزتَ كل الثمار. اضغط صندوق <b>المنوال</b>.' : `الثمرة التالية: <b>${FR[r.items[d.i]][0]}</b> — اضغط صندوقها.`), kind)}
      <div class="g5basket">${r.items.slice(d.i).map(k => `<span>${FR[k][0]}</span>`).join('')}</div>
      <div class="row2">${FR.map(([e, n], k) => `<button class="act g5crate" data-k="${k}">${e} ${n}<b>${N(d.cnt[k])}</b></button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = async e => { e.stopPropagation(); const k = +b.dataset.k;
      if (!done) { if (k !== r.items[d.i]) { sfx('cough'); return this.open(W, d, 'هذا صندوق ثمرة أخرى!', 'bad'); } d.cnt[k]++; d.i++; sfx('drop'); changed(); return this.open(W, d); }
      if (k === r.m) { d.i = 0; d.cnt = [0, 0, 0, 0]; await advance(this, W, d, 3, 'mode5', L); }
      else { sfx('cough'); this.open(W, d, 'هذا ليس الصندوق الأكثر امتلاءً: قارن الأعداد.', 'bad'); } });
    out();
  }
}, station('basket', '🧺 سلة الأكثر'));

export const G5U6 = { survey5, checkData5, chance5, lineGraph5, mode5 };
