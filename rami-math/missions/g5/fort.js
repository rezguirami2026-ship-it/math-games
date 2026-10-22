// الصف الخامس — القلعة (الوحدة ٧: الكتلة، والوحدة ٨: الوقت، والوحدة ٩: المساحة والمحيط في الكتاب).
// خمس محطات في ساحة القلعة: ميزان بمؤشر، ساعة البرج الرقمية، جدول نوبات وتقويم، سجادة من مربعات، وسور حديقة.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, msgBox, setMsg, btn, numPad } from '../bench.js';
import { dial, analog, ruler, timetable, WEEK } from '../../content/chArt.js';
import { step, at, advance, kp, out, shadowE } from './common.js';

/* المحطات: الساحة المفتوحة بين صفّي مباني القلعة (فُحصت بالتصادم) */
export const ST5F = {
  scale: { x: 292, y: 1870 },     // حمدان: مخزن الحبوب
  clock: { x: 440, y: 2148 },     // منى: ساعة البرج (شرق المتحف: جنوبه سقف مخزن الحبوب يحجب ما خلفه)
  roster: { x: 560, y: 2235 },    // زيد: نوبات الحراسة
  carpet: { x: 880, y: 2250 },    // عائشة: سجاد القاعة
  fence: { x: 1210, y: 2250 }     // فهد: سور البستان
};
const N = n => ar(n);
const pad2 = n => String(n).padStart(2, '0');
const digital = mins => `<span class="ltr" dir="ltr">${ar(pad2(Math.floor(mins / 60) % 24))}:${ar(pad2(mins % 60))}</span>`;
const twelve = mins => { const h = Math.floor(mins / 60) % 24, m = mins % 60; return `<span class="ltr" dir="ltr">${ar(h % 12 || 12)}:${ar(pad2(m))}</span> ${h < 12 ? 'صباحاً' : 'مساءً'}`; };

/* ── رسوم المحطات ── */
function sign(c, x, y, t, bg, dx = 96) { bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg }); }
function scaleProp(c, x, y) {   // ميزان بقرص وكيسا حبوب
  shadowE(c, x, y, 34);
  c.fillStyle = '#5E6B78'; rr(c, x - 16, y - 30, 32, 30, 4); c.fill(); c.fillStyle = '#F5F0E6'; c.beginPath(); c.arc(x, y - 44, 18, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = '#E2475C'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 44); c.lineTo(x + 10, y - 54); c.stroke();
  [[-34, '#D9B97A'], [32, '#C9A06A']].forEach(([dx, col]) => { c.fillStyle = col; rr(c, x + dx - 10, y - 22, 20, 22, 6); c.fill(); c.strokeStyle = INK; c.lineWidth = .6; c.stroke(); });
  sign(c, x, y, '🌾 مخزن الحبوب', '#8A5A30');
}
function clockProp(c, x, y, d, t) {   // عمود ساعة صغير بوجه رقمي
  shadowE(c, x, y, 22);
  c.fillStyle = '#C9B48A'; rr(c, x - 12, y - 70, 24, 70, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#1E1A30'; rr(c, x - 22, y - 92, 44, 22, 4); c.fill(); c.fillStyle = '#6EF5DE'; c.font = '900 11px Cairo'; c.textAlign = 'center';
  c.fillText(Math.floor(t) % 2 ? '١٢:٠٠' : '١٢ ٠٠', x, y - 77);
  sign(c, x, y, '🕰️ ساعة البرج', '#2F6B73', -92);
}
function rosterProp(c, x, y) {   // لوح نوبات على حامل
  shadowE(c, x, y, 26);
  c.fillStyle = PAL.wood; c.fillRect(x - 20, y - 60, 4, 60); c.fillRect(x + 16, y - 60, 4, 60);
  c.fillStyle = '#FFFDF6'; rr(c, x - 26, y - 70, 52, 40, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
  c.fillStyle = '#2A1B66'; for (let k = 0; k < 4; k++) { c.fillRect(x - 20, y - 64 + k * 8, 16, 2); c.fillRect(x + 2, y - 64 + k * 8, 18, 2); }
  sign(c, x, y, '📋 نوبات الحراسة', '#5E6B78');
}
function carpetProp(c, x, y) {   // سجادة مفرودة بنقوش ومربعات
  c.fillStyle = 'rgba(60,35,10,.18)'; c.fillRect(x - 38, y - 14, 80, 26);
  c.fillStyle = '#A8323A'; c.fillRect(x - 40, y - 18, 80, 26); c.strokeStyle = '#FFD27A'; c.lineWidth = 2; c.strokeRect(x - 36, y - 14, 72, 18);
  c.strokeStyle = 'rgba(255,210,122,.6)'; c.lineWidth = .8; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x - 36 + i * 12, y - 14); c.lineTo(x - 36 + i * 12, y + 4); c.stroke(); }
  sign(c, x, y, '🟩 سجاد القاعة', '#A8323A', -100);
}
function fenceProp(c, x, y) {   // قطعة سور خشبي وشتلة
  shadowE(c, x, y, 34);
  c.fillStyle = PAL.wood; for (let k = 0; k < 5; k++) { c.fillRect(x - 36 + k * 18, y - 30, 6, 30); c.beginPath(); c.moveTo(x - 36 + k * 18, y - 30); c.lineTo(x - 33 + k * 18, y - 36); c.lineTo(x - 30 + k * 18, y - 30); c.fill(); }
  c.fillRect(x - 40, y - 24, 82, 4); c.fillRect(x - 40, y - 12, 82, 4);
  c.fillStyle = '#4E7A34'; c.beginPath(); c.arc(x + 4, y - 40, 7, 0, 7); c.fill();
  sign(c, x, y, '🌿 سور البستان', '#2E7D5B');
}

/* ═══ ٧-١ الكتلة — «مخزن الحبوب» (غرفات على ميزان بقرص) ═══ */
export const mass5 = Object.assign({
  id: 'mass5', giver: 'hamdan',
  intro: n => [{ who: 'hamdan', text: `أهلاً يا ${n}! أنا حمدان أمين المخزن. أكياس الحبوب تُوزن بالكيلوغرام والغرام.` },
    { who: 'hamdan', text: 'الكيلوغرام = ١٠٠٠ غرام، وعلى قرص الميزان كل كيلوغرام عشرة أقسام، كل قسم ١٠٠ غرام.' }],
  begin(d) { const [a, b] = shuffle(Array.from({ length: 18 }, (_, i) => i + 11)).slice(0, 2); d.rounds = [{ t: 'kg', w: a }, { t: 'g', w: b }, { t: 'read', w: R(3, 27) }]; d.r = 0; d.w = 0; },   // w بوحدة ١٠٠ غم (١٫١ إلى ٢٫٨ كغم)
  goal: d => `🌾 زِن أكياس حمدان ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'hamdan', text: 'أكياس موزونة بدقة! تقرأ الميزان بين التقسيمات وتحوّل الكيلوغرامات إلى غرامات.' }];
    if (r.t === 'read') return kp(this, W, d, { title: '🌾 قراءة الميزان', visual: `<div class="g5center">${dial(3, r.w / 10)}</div>`, text: 'كم <b>غراماً</b> يزن هذا الكيس؟', ans: r.w * 100, n: 3, id: 'mass5', msg, kind, opts: { dot: false }, lines: L, hint: 'ليست هذه القراءة: عُدّ الكيلوغرامات الكاملة، ثم الأقسام الصغيرة (كل قسم ١٠٠ غم).' });
    const want = r.t === 'kg' ? `<b>${dec(r.w / 10)} كغم</b>` : `<b>${N(r.w * 100)} غم</b>`;
    sheetOpen(`<h3>🌾 ميزان المخزن</h3>${msgBox((msg ? msg + ' ' : '') + `املأ الكيس حتى يزن ${want} تماماً.`, kind)}
      <div class="g5center">${dial(3, d.w / 10)}</div>
      <div class="row2"><button class="act" data-w="10">🥄 +١ كغم</button><button class="act" data-w="1">🥄 +١٠٠ غم</button><button class="act ghost" data-w="-1"${d.w ? '' : ' disabled'}>↩ −١٠٠ غم</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.w ? '' : ' disabled'}>✓ اربط الكيس</button></div>`);
    panel().querySelectorAll('[data-w]').forEach(b => b.onclick = e => { e.stopPropagation(); d.w = Math.max(0, Math.min(30, d.w + +b.dataset.w)); sfx(+b.dataset.w > 0 ? 'drop' : 'pick'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.w === r.w) { d.w = 0; await advance(this, W, d, 3, 'mass5', L); }
      else { sfx('cough'); this.open(W, d, d.w < r.w ? 'الكيس أخف من المطلوب.' : 'الكيس أثقل من المطلوب.', 'bad'); }
    });
  }
}, at(ST5F.scale, 'scale', '🌾 مخزن الحبوب', scaleProp));

/* ═══ ٨-١ قراءة الوقت — «ساعة البرج» (ضبط ساعة رقمية بنظام ٢٤ ساعة) ═══ */
export const readTime5 = Object.assign({
  id: 'readTime5', giver: 'muna',
  intro: n => [{ who: 'muna', text: `مرحباً يا ${n}! ساعة البرج الرقمية تعمل بنظام ٢٤ ساعة، لكنها توقفت.` },
    { who: 'muna', text: 'اضبطها كما أطلب: بعد الظهر نضيف ١٢ إلى الساعة، ومنتصف الليل ٠٠:٠٠.' }],
  begin(d) {
    const t1 = R(13, 22) * 60 + R(1, 11) * 5, h2 = R(1, 11), m2 = R(0, 11) * 5, t3 = R(9, 20) * 60 + R(0, 11) * 5, add = [35, 45, 50, 75, 90][R(0, 4)];
    d.rounds = [{ say: `اضبط الساعة على <b>${twelve(t1)}</b>.`, ans: t1 }, { say: 'اضبط الساعة على الوقت الذي تُظهره ساعة العقارب، وهو <b>صباحاً</b>.', ans: h2 * 60 + m2, art: analog(h2, m2) },
      { say: `الساعة الآن <b>${digital(t3)}</b>. اضبطها على الوقت بعد <b>${N(add)}</b> دقيقة.`, ans: t3 + add }];
    d.r = 0; d.t = 12 * 60;
  },
  goal: d => `🕰️ اضبط ساعة البرج ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], b = (k, v, lab) => `<button class="act ghost" data-t="${v}">${lab}</button>`;
    sheetOpen(`<h3>🕰️ ساعة البرج</h3>${msgBox((msg ? msg + ' ' : '') + r.say, kind)}${r.art ? `<div class="g5center">${r.art}</div>` : ''}
      <div class="g5digital">${digital(d.t)}</div>
      <div class="row2" style="direction:ltr">${b('h', 60, '+١ ساعة')}${b('h', -60, '−١ ساعة')}${b('m', 5, '+٥ د')}${b('m', -5, '−٥ د')}${b('m', 1, '+١ د')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔔 شغّل الساعة</button></div>`);
    panel().querySelectorAll('[data-t]').forEach(x => x.onclick = e => { e.stopPropagation(); d.t = (d.t + +x.dataset.t + 1440) % 1440; sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.t === r.ans % 1440) { d.t = 12 * 60; await advance(this, W, d, 3, 'readTime5', [{ who: 'muna', text: 'دقّت ساعة البرج في وقتها! تقرأ الوقت بالعقارب وبنظام ٢٤ ساعة.' }]); }
      else { sfx('cough'); this.open(W, d, Math.floor(d.t / 60) !== Math.floor(r.ans % 1440 / 60) ? 'الساعة (العددان الأولان) غير صحيحة.' : 'الساعة صحيحة، لكن الدقائق غير صحيحة.', 'bad'); }
    });
  }
}, at(ST5F.clock, 'clock', '🕰️ ساعة البرج', clockProp));

/* ═══ ٨-٢ الجداول الزمنية — «نوبات الحراسة» (وقت ممسوح، انتظار، يوم على التقويم) ═══ */
export const timetables5 = Object.assign({
  id: 'timetables5', giver: 'zaid',
  intro: n => [{ who: 'zaid', text: `أهلاً يا ${n}! أنا زيد قائد الحرس. جدول النوبات تبلّل بالمطر وانمسح جزء منه.` },
    { who: 'zaid', text: 'كل دورية تستغرق الوقت نفسه بين الأبراج. اكتب الأوقات بأربعة أرقام، مثل ١٣٤٧ للوقت ١٣:٤٧.' }],
  begin(d) {
    const T = ['البوابة', 'برج الماء', 'برج الشرق', 'القصر'], legs = [R(12, 25), R(15, 30), R(20, 45)], a0 = R(8, 10) * 60 + R(0, 5) * 10 + R(0, 9), b0 = a0 + R(2, 4) * 60 + R(0, 3) * 5;
    const A = [a0, a0 + legs[0], a0 + legs[0] + legs[1], a0 + legs[0] + legs[1] + legs[2]], B = A.map(x => x - a0 + b0), k = R(1, 3), w = R(7, 28), first = R(0, 6), day = R(2, 12), gap = R(7, 16);
    d.rounds = [{ t: 'miss', T, A, B, k }, { t: 'wait', T, A, w }, { t: 'cal', first, day, gap }]; d.r = 0;
  },
  goal: d => `📋 أصلح جدول النوبات ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'zaid', text: 'جدول النوبات مكتمل! تقرأ الجداول وتحسب الفترات والأيام بدقة.' }];
    if (r.t === 'miss') { const tt = `<table class="tt"><tr><th>الموقع</th><th>الدورية ١</th><th>الدورية ٢</th></tr>${r.T.map((s, i) => `<tr><td>${s}</td><td>${digital(r.A[i])}</td><td>${i === r.k ? '<b>؟</b>' : digital(r.B[i])}</td></tr>`).join('')}</table>`;
      const ans = Math.floor(r.B[r.k] / 60) * 100 + r.B[r.k] % 60;
      return kp(this, W, d, { title: '📋 جدول النوبات', visual: tt, text: `متى تصل الدورية ٢ إلى <b>${r.T[r.k]}</b>؟ (اكتب الوقت بأربعة أرقام)`, ans, n: 3, id: 'timetables5', msg, kind, opts: { dot: false }, lines: L, hint: 'كل دورية تستغرق الوقت نفسه: احسب المدة في الدورية ١ وأضفها.' }); }
    if (r.t === 'wait') { const tt = `<table class="tt"><tr><th>الموقع</th><th>الدورية</th></tr>${r.T.map((s, i) => `<tr><td>${s}</td><td>${digital(r.A[i])}</td></tr>`).join('')}</table>`;
      return kp(this, W, d, { title: '⏳ انتظار الدورية', visual: tt, text: `وصلتَ إلى <b>${r.T[2]}</b> الساعة <b>${digital(r.A[2] - r.w)}</b>. كم دقيقة تنتظر الدورية؟`, ans: r.w, n: 3, id: 'timetables5', msg, kind, opts: { dot: false }, lines: L, hint: 'اطرح وقت وصولك من وقت الدورية.' }); }
    const cells = Array.from({ length: r.first }, () => '<span></span>').concat(Array.from({ length: 31 }, (_, i) => `<button class="g5day${i + 1 === r.day ? ' today' : ''}" data-day="${i + 1}">${N(i + 1)}</button>`)).join('');
    sheetOpen(`<h3>📅 تقويم الحراسة — مايو</h3>${msgBox((msg ? msg + ' ' : '') + `آخر نوبة ليلية كانت يوم <b>${N(r.day)}</b> مايو، والنوبة التالية بعد <b>${N(r.gap)}</b> يوماً. اضغط يومها في التقويم.`, kind)}
      <div class="g5cal">${WEEK.map(w => `<b>${w}</b>`).join('')}${cells}</div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-day]').forEach(b => b.onclick = async e => { e.stopPropagation(); const v = +b.dataset.day;
      if (v === r.day + r.gap) await advance(this, W, d, 3, 'timetables5', L);
      else { sfx('cough'); this.open(W, d, `يوم ${N(v)} بعد ${N(v - r.day)} يوماً من آخر نوبة، وليس بعد ${N(r.gap)}.`, 'bad'); } });
    out();
  }
}, at(ST5F.roster, 'roster', '📋 نوبات الحراسة', rosterProp));

/* ═══ ٩-١ المساحة (١) — «سجاد القاعة» (تلوين مربعات ١ سم²، وقياس بالمليمتر) ═══ */
const isRect = cs => { if (!cs.length) return false; const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]), w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1; return w * h === cs.length; };
const connected = cs => { if (!cs.length) return false; const k = c => c.join(','), set = new Set(cs.map(k)), seen = new Set([k(cs[0])]), q = [cs[0]];
  while (q.length) { const [x, y] = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const n = [x + a, y + b]; if (set.has(k(n)) && !seen.has(k(n))) { seen.add(k(n)); q.push(n); } }); } return seen.size === cs.length; };
export const area5a = Object.assign({
  id: 'area5a', giver: 'aisha',
  intro: n => [{ who: 'aisha', text: `أهلاً يا ${n}! أنا عائشة. نصنع سجاد القاعة من مربعات صغيرة، مساحة كل مربع ١ سم² في نموذجنا.` },
    { who: 'aisha', text: 'المساحة = عدد المربعات التي تغطي السجادة. لوّن المربعات لتصنع السجادة المطلوبة.' }],
  begin(d) { const A = [12, 15, 16, 18, 20, 24][R(0, 5)], B = R(9, 16), mm = R(31, 89); d.rounds = [{ t: 'rect', A }, { t: 'free', A: B === A ? B + 1 : B }, { t: 'ruler', mm: mm % 10 ? mm : mm + 3 }]; d.r = 0; d.cells = []; },
  goal: d => `🟩 انسج سجاد عائشة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'aisha', text: 'سجاد بالمساحة المطلوبة تماماً! تعدّ السنتيمترات المربعة وتقيس بالمليمتر.' }];
    if (r.t === 'ruler') return kp(this, W, d, { title: '📏 خيط الحاشية', visual: ruler({ cm: 10, seg: [0, r.mm / 10] }), text: 'كم <b>مليمتراً</b> طول خيط الحاشية الأحمر؟', ans: r.mm, n: 3, id: 'area5a', msg, kind, opts: { dot: false }, lines: L, hint: 'ليس هذا الطول: كل سنتيمتر ١٠ مليمترات، ثم عُدّ الأقسام الصغيرة.' });
    const C = d.cells, on = (x, y) => C.some(c => c[0] === x && c[1] === y);
    sheetOpen(`<h3>🟩 سجادة ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + (r.t === 'rect' ? `لوّن سجادة <b>مستطيلة</b> مساحتها <b>${N(r.A)} سم²</b>.` : `لوّن سجادة مساحتها <b>${N(r.A)} سم²</b> <b>ليست مستطيلة</b> (مربعاتها متلاصقة).`), kind)}
      <div class="g5net wide">${Array.from({ length: 6 }, (_, y) => Array.from({ length: 8 }, (_, x) => `<button class="g5sq carpet${on(x, y) ? ' on' : ''}" data-c="${x},${y}"></button>`).join('')).join('')}</div>
      <p class="muted">المساحة الملوّنة: ${N(C.length)} سم²</p>
      <div class="row2"><button class="act ghost" id="cClr"${C.length ? '' : ' disabled'}>↩ امسح</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${C.length ? '' : ' disabled'}>✓ السجادة جاهزة</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const [x, y] = b.dataset.c.split(',').map(Number); if (on(x, y)) d.cells = C.filter(c => c[0] !== x || c[1] !== y); else C.push([x, y]); sfx('click'); this.open(W, d, msg, kind); });
    btn('cClr', () => { d.cells = []; this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const n = C.length, shapeOk = r.t === 'rect' ? isRect(C) : connected(C) && !isRect(C);
      if (n === r.A && shapeOk) { d.cells = []; await advance(this, W, d, 3, 'area5a', L); }
      else { sfx('cough'); this.open(W, d, n !== r.A ? `مساحة سجادتك ${N(n)} سم²، والمطلوب ${N(r.A)} سم².` : r.t === 'rect' ? 'المساحة صحيحة، لكن السجادة ليست مستطيلاً.' : (!connected(C) ? 'المربعات يجب أن تتلاصق في قطعة واحدة.' : 'هذه سجادة مستطيلة! المطلوب شكل آخر.'), 'bad'); }
    });
  }
}, at(ST5F.carpet, 'carpet', '🟩 سجاد القاعة', carpetProp));

/* ═══ ٩-٢ المحيط (١) — «سور البستان» (حديقة بطول وعرض، ومحيط مضلع) ═══ */
export const perimeter5a = Object.assign({
  id: 'perimeter5a', giver: 'fahad',
  intro: n => [{ who: 'fahad', text: `حياك يا ${n}! أنا فهد البستاني. أريد سوراً حول حدائق القلعة، والسور يُشترى بالمتر.` },
    { who: 'fahad', text: 'المحيط = مجموع أطوال الأضلاع كلها. اضبط طول الحديقة وعرضها حتى يكفيها السور تماماً.' }],
  begin(d) {
    const P = R(6, 11) * 2, a = R(4, 7), b = R(2, a - 1), sides = Array.from({ length: R(5, 6) }, () => R(2, 9));
    d.rounds = [{ t: 'P', P }, { t: 'PA', P: 2 * (a + b), A: a * b }, { t: 'poly', sides }]; d.r = 0; d.L = 1; d.Wd = 1;
  },
  goal: d => `🌿 سيّج حدائق فهد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'fahad', text: 'كل الحدائق مسيّجة دون نقص ولا زيادة! تحسب المحيط بدقة.' }];
    if (r.t === 'poly') return kp(this, W, d, { title: '🌿 حديقة غير منتظمة', text: `لحديقة ${N(r.sides.length)} أضلاع أطوالها: ${r.sides.map(s => N(s) + ' م').join('، ')}. كم متراً من السور تحتاج؟`, ans: r.sides.reduce((s, x) => s + x, 0), n: 3, id: 'perimeter5a', msg, kind, opts: { dot: false }, lines: L, hint: 'السور لا يكفي أو يزيد: اجمع أطوال كل الأضلاع.' });
    const ctl = (k, lab, v) => `<div class="cnt g5cnt"><span>${lab}</span><button class="act ghost" data-k="${k}" data-v="-1">−</button><b>${N(v)} م</b><button class="act ghost" data-k="${k}" data-v="1">+</button></div>`, s = 22;
    sheetOpen(`<h3>🌿 حديقة ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + (r.t === 'P' ? `معنا سور طوله <b>${N(r.P)} م</b>. اصنع حديقة مستطيلة يحيط بها السور تماماً.` : `اصنع حديقة مستطيلة محيطها <b>${N(r.P)} م</b> ومساحتها <b>${N(r.A)} م²</b>.`), kind)}
      <div class="g5center"><svg viewBox="0 0 ${12 * s + 20} ${10 * s + 20}" class="g5q" style="max-width:300px"><rect x="10" y="10" width="${d.L * s}" height="${d.Wd * s}" fill="#CDEBC4" stroke="#6B4520" stroke-width="4" stroke-dasharray="8 3"/></svg></div>
      <p class="muted">المحيط الآن: ${N(2 * (d.L + d.Wd))} م · المساحة: ${N(d.L * d.Wd)} م²</p>
      <div class="row2">${ctl('L', 'الطول', d.L)}${ctl('Wd', 'العرض', d.Wd)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🌿 ركّب السور</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k; d[k] = Math.max(1, Math.min(k === 'L' ? 12 : 10, d[k] + +b.dataset.v)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const P = 2 * (d.L + d.Wd), ok = P === r.P && (r.t === 'P' || d.L * d.Wd === r.A);
      if (ok) { d.L = 1; d.Wd = 1; await advance(this, W, d, 3, 'perimeter5a', L); }
      else { sfx('cough'); this.open(W, d, P !== r.P ? (P < r.P ? 'يبقى من السور جزء زائد: الحديقة صغيرة.' : 'السور لا يكفي هذه الحديقة!') : 'المحيط صحيح، لكن المساحة ليست المطلوبة. جرّب أبعاداً أخرى بالمحيط نفسه.', 'bad'); }
    });
  }
}, at(ST5F.fence, 'fence', '🌿 سور البستان', fenceProp));

export const G5U4 = { mass5, readTime5, timetables5, area5a, perimeter5a };
