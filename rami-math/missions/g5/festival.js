// الصف الخامس — ساحة المهرجان (الوحدات ١٠–١٤ في الكتاب): أحد عشر درساً، لكل درس أداة مختلفة في يد الطالب.
import { ar, rr } from '../../core/util.js';
import { INK, PAL, bigSign, workTable, stall } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { R, shuffle, changed, dec, panel, sheetOpen, msgBox, setMsg, btn, numPad } from '../bench.js';
import { H, step, at, advance, kp, out, shadowE } from './common.js';

/* المحطات (اختيرت آلياً: لا تصادم، متباعدة، بعيدة عن محطات السادس، ثم رُوجعت بالصور) */
export const ST5E = {
  rockets: { x: 2382, y: 2952 }, sage: { x: 1224, y: 2832 }, thermo: { x: 1615, y: 2966 }, tickets: { x: 420, y: 2985 },
  juice: { x: 884, y: 2890 }, gifts: { x: 2082, y: 2972 }, mirror: { x: 950, y: 2760 }, track: { x: 1775, y: 2866 },
  score: { x: 280, y: 2890 }, shop: { x: 624, y: 2985 }, rides: { x: 1922, y: 2952 }
};
const N = n => ar(n);
const sign = (c, x, y, t, bg, dx = 96) => bigSign(c, x + dx, y + 6, t, { fs: 12, h: 30, bg });
const pole = (c, x, y, h, col) => { c.fillStyle = col || PAL.wood; c.fillRect(x - 2, y - h, 4, h); };

/* ── رسوم المحطات ── */
const PROPS = {
  rockets(c, x, y, d, t) { shadowE(c, x, y, 26); pole(c, x - 14, y, 70); pole(c, x + 14, y, 70); for (let k = 0; k < 6; k++) { c.fillStyle = PAL.woodLight; c.fillRect(x - 14, y - 10 - k * 11, 28, 3); }
    [-24, 24].forEach((dx, i) => { const yy = y - 40 - Math.abs(Math.sin(t * 2 + i)) * 8; c.fillStyle = i ? '#E2475C' : '#3FA3F5'; c.beginPath(); c.moveTo(x + dx, yy - 14); c.lineTo(x + dx + 5, yy); c.lineTo(x + dx - 5, yy); c.closePath(); c.fill(); });
    sign(c, x, y, '🎆 سلّم الألعاب النارية', '#8E6CF6', 104); /* يساره يقف طارق */ },
  sage(c, x, y) { shadowE(c, x, y, 24); c.fillStyle = '#5E4B8B'; rr(c, x - 18, y - 46, 36, 46, 6); c.fill(); c.fillStyle = '#FFE7A0'; c.beginPath(); c.arc(x, y - 56, 12, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(x - 4, y - 57, 2, 0, 7); c.arc(x + 4, y - 57, 2, 0, 7); c.fill();
    sign(c, x, y, '🦉 تحدي الحكيم', '#5E4B8B'); },
  thermo(c, x, y) { shadowE(c, x, y, 16); c.fillStyle = '#F5F0E6'; rr(c, x - 8, y - 84, 16, 76, 8); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); c.fillStyle = '#E2475C'; c.fillRect(x - 3, y - 50, 6, 40); c.beginPath(); c.arc(x, y - 10, 8, 0, 7); c.fill();
    sign(c, x, y, '🌡️ مقياس الحرارة', '#C0392B'); },
  tickets(c, x, y) { stall(c, x, y, '#2F6FB2'); c.fillStyle = '#FFC23D'; [-12, 0, 12].forEach(dx => c.fillRect(x + dx - 4, y - 44, 8, 12)); sign(c, x, y, '🎫 شباك التذاكر', '#2F6FB2', 104); },
  juice(c, x, y) { workTable(c, x, y); ['#F28C28', '#E2475C', '#FFC23D', '#2E9E5B'].forEach((col, k) => { const cx = x - 21 + k * 14; c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(cx - 5, y - 46, 10, 14); c.fillStyle = col; c.fillRect(cx - 5, y - 46 + (k + 1) * 2.5, 10, 14 - (k + 1) * 2.5); });
    sign(c, x, y, '🧃 أكواب العصير', '#F28C28'); },
  gifts(c, x, y) { stall(c, x, y, '#B0476A'); [[-14, '#3FA3F5'], [2, '#FFC23D'], [16, '#2E9E5B']].forEach(([dx, col]) => { c.fillStyle = col; c.fillRect(x + dx - 6, y - 46, 12, 12); c.fillStyle = '#fff'; c.fillRect(x + dx - 1, y - 46, 2, 12); });
    sign(c, x, y, '🎁 كشك الهدايا', '#B0476A', 104); },
  mirror(c, x, y, d, t) { shadowE(c, x, y, 26); c.fillStyle = '#C9A24A'; rr(c, x - 22, y - 80, 44, 72, 20); c.fill(); const g = c.createLinearGradient(x - 16, y - 74, x + 16, y - 14); g.addColorStop(0, '#E8F6FF'); g.addColorStop(1, '#A9C8F0'); c.fillStyle = g; rr(c, x - 16, y - 74, 32, 60, 16); c.fill();
    c.fillStyle = `rgba(255,255,255,${.3 + .3 * Math.sin(t * 3)})`; c.fillRect(x - 8, y - 66, 4, 40); sign(c, x, y, '🪞 المرآة السحرية', '#C9A24A', -96); },
  track(c, x, y) { c.fillStyle = '#C46A1E'; c.fillRect(x - 46, y - 10, 92, 12); c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) c.fillRect(x - 40 + k * 20, y - 5, 10, 2); pole(c, x + 44, y, 40); c.fillStyle = '#1E1A30'; c.fillRect(x + 44, y - 40, 18, 12);
    sign(c, x, y, '🏃 مضمار السباق', '#C46A1E', -106); },
  score(c, x, y) { shadowE(c, x, y, 30); pole(c, x - 26, y, 60); pole(c, x + 26, y, 60); c.fillStyle = '#1E1A30'; rr(c, x - 32, y - 76, 64, 34, 4); c.fill(); c.fillStyle = '#FFC23D'; c.font = '900 12px Cairo'; c.textAlign = 'center'; c.fillText('١٢٣٤', x, y - 54);
    sign(c, x, y, '🏆 لوحة النقاط', '#1F5D7A', -96); },
  shop(c, x, y) { stall(c, x, y, '#2E8B57'); c.fillStyle = '#FF6B81'; [-14, 0, 14].forEach(dx => { c.beginPath(); c.arc(x + dx, y - 42, 5, 0, 7); c.fill(); }); sign(c, x, y, '🍭 دكان المهرجان', '#2E8B57', 104); },
  rides(c, x, y, d, t) { shadowE(c, x, y, 36); c.fillStyle = '#8994A0'; c.fillRect(x - 40, y - 8, 80, 4); [-24, 0, 24].forEach((dx, k) => { c.fillStyle = ['#E2475C', '#3FA3F5', '#FFC23D'][k]; rr(c, x + dx - 10, y - 24, 20, 16, 4); c.fill(); c.fillStyle = '#1E1A30'; c.beginPath(); c.arc(x + dx - 5, y - 7, 3, 0, 7); c.arc(x + dx + 5, y - 7, 3, 0, 7); c.fill(); });
    sign(c, x, y, '🎡 عربات الملاهي', '#E2475C', -100); /* يمينها كشك الهدايا */ }
};
const station = (k, label) => at(ST5E[k], k, label, PROPS[k]);

/* ═══ ١٠-١ المتتاليات (٢) — «سلّم الألعاب النارية» (درجات ناقصة تُكتب) ═══ */
export const sequences5b = Object.assign({
  id: 'sequences5b', giver: 'tariq',
  intro: n => [{ who: 'tariq', text: `أهلاً يا ${n}! أنا طارق مسؤول الألعاب النارية. على كل درجة من السلّم عدد، وبعضها انمحى.` },
    { who: 'tariq', text: 'اضغط درجة ممحوة واكتب عددها. المتتالية قد تنزل تحت الصفر، أو تتضاعف، أو تزيد خطوتها كل مرة.' }],
  begin(d) {
    const s = R(3, 7), a = s * R(2, 3) - R(1, s - 1), k2 = R(2, 4);
    d.rounds = [{ terms: Array.from({ length: 7 }, (_, i) => a - i * s), holes: [4, 6], rule: `تنزل ${N(s)} في كل درجة` },
      { terms: Array.from({ length: 6 }, (_, i) => k2 * 2 ** i), holes: [3, 5], rule: 'كل عدد ضِعف الذي قبله' },
      { terms: [1, 3, 6, 10, 15, 21, 28], holes: [4, 6], rule: 'الخطوة تزيد واحداً كل مرة' }];
    d.r = 0; d.fill = {}; d.sel = null;
  },
  goal: d => `🎆 أكمل سلالم طارق ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>🎆 سلّم ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + 'اضغط درجة ممحوة (؟) ثم اكتب عددها.', kind)}
      <div class="g5ladder">${r.terms.map((v, i) => r.holes.includes(i) ? `<button class="g5rung hole${d.sel === i ? ' sel' : ''}" data-h="${i}">${d.fill[i] !== undefined ? N(d.fill[i]) : '؟'}</button>` : `<span class="g5rung">${N(v)}</span>`).join('')}</div>
      <div id="pad"></div><div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${r.holes.every(i => d.fill[i] !== undefined) ? '' : ' disabled'}>🎆 أطلق الصواريخ</button></div>`);
    panel().querySelectorAll('[data-h]').forEach(b => b.onclick = e => { e.stopPropagation(); d.sel = +b.dataset.h; sfx('click'); this.open(W, d, msg, kind); });
    numPad(panel().querySelector('#pad'), d.sel === null ? 'اختر درجة' : '✓ اكتب على الدرجة', v => { if (d.sel === null) return; d.fill[d.sel] = v; const nx = r.holes.find(i => d.fill[i] === undefined); d.sel = nx === undefined ? null : nx; sfx('drop'); this.open(W, d, msg, kind); }, { neg: true, dot: false });
    out();
    btn('benchGo', async () => {
      const bad = r.holes.find(i => d.fill[i] !== r.terms[i]);
      if (bad === undefined) { d.fill = {}; d.sel = null; await advance(this, W, d, 3, 'sequences5b', [{ who: 'tariq', text: 'السماء تلمع! تعرف قاعدة كل متتالية، صعوداً ونزولاً وتحت الصفر.' }]); }
      else { sfx('cough'); delete d.fill[bad]; d.sel = bad; this.open(W, d, 'صاروخ لم ينطلق: إحدى الدرجات لا تتبع القاعدة. انظر إلى الدرجات المجاورة.', 'bad'); }
    });
  }
}, station('rockets', '🎆 سلّم الألعاب'));

/* ═══ ١٠-٢ العبارات العامة — «تحدي الحكيم» (حكم ثم مثال مناقض) ═══ */
const STATES = [
  { s: 'مجموع عددين فرديين عدد زوجي', ok: true }, { s: 'مجموع عددين زوجيين عدد زوجي', ok: true },
  { s: 'مجموع عدد فردي وعدد زوجي عدد زوجي', ok: false, ex: () => { const a = R(3, 20) * 2 + 1, b = R(2, 20) * 2; return { good: `${N(a)} + ${N(b)} = ${N(a + b)}`, bad: [`${N(b)} + ${N(b + 2)} = ${N(2 * b + 2)}`, `${N(a)} + ${N(a + 2)} = ${N(2 * a + 2)}`, `${N(b + 4)} + ${N(b)} = ${N(2 * b + 4)}`] }; } },
  { s: 'الفرق بين عددين فرديين عدد فردي', ok: false, ex: () => { const a = R(6, 20) * 2 + 1, b = R(1, 5) * 2 + 1; return { good: `${N(a)} − ${N(b)} = ${N(a - b)}`, bad: [`${N(a + 1)} − ${N(b)} = ${N(a + 1 - b)}`, `${N(a)} − ${N(b + 1)} = ${N(a - b - 1)}`, `${N(a + 3)} − ${N(b + 1)} = ${N(a - b + 2)}`] }; } },
  { s: 'كل مضاعف للعدد ٥ آحاده ٥', ok: false, ex: () => { const m = R(2, 9) * 10; return { good: N(m), bad: [N(m + 5), N(m - 5), N(m + 15)] }; } },
  { s: 'حاصل ضرب أي عدد في عدد زوجي عدد زوجي', ok: true }, { s: 'مجموع ثلاثة أعداد متتالية من مضاعفات ٣', ok: true },
  { s: 'إذا أضفنا ٥ إلى أي عدد كان الناتج فردياً', ok: false, ex: () => { const a = R(2, 20) * 2 + 1; return { good: `${N(a)} + ٥ = ${N(a + 5)}`, bad: [`${N(a + 1)} + ٥ = ${N(a + 6)}`, `${N(a + 3)} + ٥ = ${N(a + 8)}`, `${N(a - 1)} + ٥ = ${N(a + 4)}`] }; } }
];
export const generalStatements5 = Object.assign({
  id: 'generalStatements5', giver: 'mudhaffar',
  intro: n => [{ who: 'mudhaffar', text: `مرحباً يا ${n}! أنا مظفّر، حكيم المهرجان. أقول عبارات عامة، بعضها صحيح دائماً وبعضها خاطئ.` },
    { who: 'mudhaffar', text: 'جرّب العبارة بأمثلة. إن كانت خاطئة فأثبت ذلك بمثال مناقض واحد يخالفها.' }],
  begin(d) { const T = shuffle(STATES.filter(x => x.ok)).slice(0, 1), F = shuffle(STATES.filter(x => !x.ok)).slice(0, 2); d.rounds = shuffle([...T, ...F]).map(x => ({ s: x.s, ok: x.ok, ex: x.ex ? x.ex() : null })); d.r = 0; d.stage = 0; },
  goal: d => `🦉 أجب عن تحدي الحكيم ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'mudhaffar', text: 'أصبحتَ حكيماً مثلي! تختبر العبارات وتجد المثال المناقض.' }];
    if (d.stage === 1) {
      if (!d.opts) d.opts = {}; const o = d.opts[d.r] = d.opts[d.r] || shuffle([r.ex.good, ...r.ex.bad]);
      sheetOpen(`<h3>🦉 المثال المناقض</h3>${msgBox((msg ? msg + ' ' : '') + `«${r.s}» خاطئة. اختر المثال الذي يُثبت ذلك:`, kind)}<div class="g5cards col">${o.map((t, i) => `<button class="g5card" data-o="${i}">${t}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-o]').forEach(b => b.onclick = async e => { e.stopPropagation(); if (o[+b.dataset.o] === r.ex.good) { d.stage = 0; await advance(this, W, d, 3, 'generalStatements5', L); } else { sfx('cough'); this.open(W, d, 'هذا المثال يوافق العبارة ولا يناقضها.', 'bad'); } });
      return out();
    }
    sheetOpen(`<h3>🦉 تحدي الحكيم</h3>${msgBox((msg ? msg + ' ' : '') + `يقول الحكيم: «<b>${r.s}</b>». ما رأيك؟`, kind)}
      <div class="row2"><button class="act go" id="sTrue">✓ صحيحة دائماً</button><button class="act" id="sFalse">✗ خاطئة</button></div><button class="act ghost" id="benchOut">رجوع</button>`);
    btn('sTrue', async () => { if (r.ok) await advance(this, W, d, 3, 'generalStatements5', L); else { sfx('cough'); this.open(W, d, 'جرّب أمثلة أكثر: هل تجد مثالاً يخالفها؟', 'bad'); } });
    btn('sFalse', () => { if (!r.ok) { d.stage = 1; sfx('drop'); changed(); this.open(W, d); } else { sfx('cough'); this.open(W, d, 'جرّب أمثلة كثيرة: كلها توافق العبارة.', 'bad'); } });
    out();
  }
}, station('sage', '🦉 تحدي الحكيم'));

/* ═══ ١٠-٣ الموجبة والسالبة — «مقياس الحرارة» (زئبق يرتفع وينخفض) ═══ */
export const negatives5 = Object.assign({
  id: 'negatives5', giver: 'nawal',
  intro: n => [{ who: 'nawal', text: `أهلاً يا ${n}! أنا نوال راصدة الطقس. مقياس الحرارة هنا يحتاج من يحرّكه.` },
    { who: 'nawal', text: 'تحت الصفر أعداد سالبة: كلما نزلنا صار الجو أبرد. حرّك الزئبق إلى الدرجة الصحيحة.' }],
  begin(d) {
    const t1 = R(2, 7), d1 = R(t1 + 2, t1 + 8), t2 = -R(3, 8), u2 = R(1 - t2, 9 - t2), L = shuffle([-R(6, 9), -R(1, 3), R(1, 4), R(5, 9)]);
    d.rounds = [{ say: `الحرارة <b>${N(t1)}°</b>، ثم انخفضت <b>${N(d1)}</b> درجات ليلاً. اضبط المقياس.`, ans: t1 - d1 }, { say: `الحرارة على جبل شمس <b>${N(t2)}°</b>، ثم ارتفعت <b>${N(u2)}</b> درجة ظهراً. اضبط المقياس.`, ans: t2 + u2 },
      { say: `سُجّلت هذه الدرجات في أربع مدن: ${L.map(v => `<b>${N(v)}°</b>`).join('، ')}. اضبط المقياس على <b>أبردها</b>.`, ans: Math.min(...L) }];
    d.r = 0; d.t = 0;
  },
  goal: d => `🌡️ اضبط مقياس الحرارة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], ticks = Array.from({ length: 21 }, (_, i) => 10 - i);
    sheetOpen(`<h3>🌡️ مقياس الحرارة</h3>${msgBox((msg ? msg + ' ' : '') + r.say, kind)}
      <div class="g5thermo">${ticks.map(v => `<div class="tk${v === d.t ? ' on' : ''}${v <= d.t ? ' fill' : ''}${v < 0 ? ' neg' : ''}"><i></i><span>${v % 2 === 0 ? N(v) + '°' : ''}</span></div>`).join('')}</div>
      <div class="row2"><button class="act" id="tUp">⬆ ارفع درجة</button><button class="act" id="tDn">⬇ اخفض درجة</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ سجّل الدرجة</button></div>`);
    btn('tUp', () => { d.t = Math.min(10, d.t + 1); sfx('click'); this.open(W, d, msg, kind); });
    btn('tDn', () => { d.t = Math.max(-10, d.t - 1); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      if (d.t === r.ans) { d.t = 0; await advance(this, W, d, 3, 'negatives5', [{ who: 'nawal', text: 'نشرة الطقس دقيقة! تقرأ الدرجات تحت الصفر وتحسب الارتفاع والانخفاض.' }]); }
      else { sfx('cough'); this.open(W, d, d.t > r.ans ? 'المقياس أعلى من الدرجة الصحيحة.' : 'المقياس أدنى من الدرجة الصحيحة.', 'bad'); }
    });
  }
}, station('thermo', '🌡️ مقياس الحرارة'));

/* ═══ ١١-١ النظام العشري — «شباك التذاكر» (عجلات بالأجزاء من عشرة ومئة، ترتيب، تقريب) ═══ */
export const decimals5 = Object.assign({
  id: 'decimals5', giver: 'safiya',
  intro: n => [{ who: 'safiya', text: `هلا يا ${n}! أنا صفية بائعة التذاكر. الأسعار فيها أجزاء من عشرة وأجزاء من مئة.` },
    { who: 'safiya', text: 'أول رقم بعد الفاصلة أجزاء من عشرة، والثاني أجزاء من مئة.' }],
  begin(d) {
    const a = R(11, 59), b = R(11, 99), base = R(2, 8), L = shuffle([base + 0.05, base + 0.5, base + 0.45, base + 0.55]), v = R(301, 899);
    d.rounds = [{ t: 'wheel', a, b, ans: a * 100 + b }, { t: 'ord', L }, { t: 'rnd', v: v % 10 === 5 || v % 100 === 50 ? v + 1 : v }]; d.r = 0; d.dg = [0, 0, 0, 0]; d.picked = [];
  },
  goal: d => `🎫 ساعد صفية في التذاكر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'safiya', text: 'التذاكر مسعّرة ومرتبة! تعرف قيمة كل رقم بعد الفاصلة.' }];
    if (r.t === 'rnd') return kp(this, W, d, { title: '🎫 السعر المقرّب', text: `سعر التذكرة <b>${dec(r.v / 100)}</b> ريال. اكتبه مقرّباً لأقرب ريال كامل.`, ans: Math.round(r.v / 100), n: 3, id: 'decimals5', msg, kind, opts: { dot: false }, lines: L, hint: 'ليس هذا التقريب: انظر إلى رقم الأجزاء من عشرة.' });
    if (r.t === 'ord') {
      sheetOpen(`<h3>🎫 لوحة الأسعار</h3>${msgBox((msg ? msg + ' ' : '') + 'اضغط الأسعار بالترتيب من <b>الأرخص</b> إلى <b>الأغلى</b>.', kind)}
        <div class="g5slots">${d.picked.map(i => `<span class="g5slot on"><b>${dec(r.L[i])}</b></span>`).join('') || '<span class="muted">—</span>'}</div>
        <div class="g5cards">${r.L.map((v, i) => `<button class="g5card" data-i="${i}"${d.picked.includes(i) ? ' disabled' : ''}>${dec(v)}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-i]').forEach(b => b.onclick = async e => { e.stopPropagation(); d.picked.push(+b.dataset.i); sfx('pick');
        if (d.picked.length < r.L.length) return this.open(W, d, msg, kind);
        const seq = d.picked.map(i => r.L[i]); d.picked = [];
        if (seq.every((v, k) => !k || v > seq[k - 1])) await advance(this, W, d, 3, 'decimals5', L); else { sfx('cough'); this.open(W, d, 'الترتيب غير صحيح: اكتب كل سعر بمنزلتين عشريتين (٠٫٥ = ٠٫٥٠) ثم قارن.', 'bad'); } });
      return out();
    }
    const lab = ['عشرات', 'آحاد', 'أجزاء من عشرة', 'أجزاء من مئة'], wheel = i => `<div class="wheel"><button class="act ghost" data-w="${i}" data-v="1">▲</button><b>${N(d.dg[i])}</b><button class="act ghost" data-w="${i}" data-v="-1">▼</button><small class="wlab">${lab[i]}</small></div>`;
    sheetOpen(`<h3>🎫 آلة الأسعار</h3>${msgBox((msg ? msg + ' ' : '') + `اكتب السعر: <b>${N(r.a)}</b> ريالاً و<b>${N(r.b)}</b> من مئة.`, kind)}
      <div class="dials g5dials">${wheel(0)}${wheel(1)}<span>٫</span>${wheel(2)}${wheel(3)}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🎫 اطبع التذكرة</button></div>`);
    panel().querySelectorAll('[data-w]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.w; d.dg[i] = (d.dg[i] + +b.dataset.v + 10) % 10; sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const v = d.dg[0] * 1000 + d.dg[1] * 100 + d.dg[2] * 10 + d.dg[3];
      if (v === r.ans) { d.dg = [0, 0, 0, 0]; await advance(this, W, d, 3, 'decimals5', L); }
      else { sfx('cough'); this.open(W, d, `طُبع ${dec(v / 100)} وليس السعر المطلوب: الأجزاء من مئة تأخذ منزلتين بعد الفاصلة.`, 'bad'); } });
  }
}, station('tickets', '🎫 شباك التذاكر'));

/* ═══ ١٢-١ حقائق الأعداد العشرية — «أكواب العصير» (كوبان يملآن لتراً) ═══ */
export const decimalFacts5 = Object.assign({
  id: 'decimalFacts5', giver: 'umsaid',
  intro: n => [{ who: 'umsaid', text: `حياك يا ${n}! أنا أم سعيد. أملأ أباريق العصير من الأكواب، ولا أريد أن تفيض.` },
    { who: 'umsaid', text: 'اختر كوبين مجموعهما يملأ الإبريق تماماً: لتراً واحداً، أو ١٠ لترات للجرار الكبيرة.' }],
  begin(d) {
    const mk1 = () => { const a = R(1, 9), others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== a && x !== 10 - a)).slice(0, 3); return { tot: 1, cups: shuffle([a, 10 - a, ...others]).map(x => x / 10) }; };
    const a = R(11, 89), others = shuffle([12, 23, 34, 46, 57, 68, 71, 85].filter(x => x !== a && x !== 100 - a && x + a !== 100)).slice(0, 3);
    d.rounds = [mk1(), mk1(), { tot: 10, cups: shuffle([a, 100 - a, ...others]).map(x => x / 10) }]; d.r = 0; d.pick = [];
  },
  goal: d => `🧃 املأ أباريق أم سعيد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>🧃 ${r.tot === 1 ? 'إبريق لتر واحد' : 'جرّة ١٠ لترات'}</h3>${msgBox((msg ? msg + ' ' : '') + `اختر كوبين مجموعهما <b>${N(r.tot)}</b> ل تماماً.`, kind)}
      <div class="g5cards">${r.cups.map((v, i) => `<button class="g5card cup${d.pick.includes(i) ? ' on' : ''}" data-c="${i}">🥤 ${dec(v)} ل</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.pick.length === 2 ? '' : ' disabled'}>🧃 اسكب</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.c, k = d.pick.indexOf(i); if (k >= 0) d.pick.splice(k, 1); else if (d.pick.length < 2) d.pick.push(i); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const s = Math.round((r.cups[d.pick[0]] + r.cups[d.pick[1]]) * 10); d.pick = [];
      if (s === r.tot * 10) await advance(this, W, d, 3, 'decimalFacts5', [{ who: 'umsaid', text: 'الأباريق ملأى تماماً بلا قطرة زائدة! تعرف الأزواج العشرية التي تكمل ١ و١٠.' }]);
      else { sfx('cough'); this.open(W, d, s > r.tot * 10 ? 'فاض العصير! المجموع أكثر من المطلوب.' : 'الإبريق لم يمتلئ: المجموع أقل من المطلوب.', 'bad'); } });
  }
}, station('juice', '🧃 أكواب العصير'));

/* ═══ ١٢-٢ استراتيجيات الضرب — «كشك الهدايا» (آلة خطوات: ×٢٠ ثم تعديل، ×١٠٠ ثم ÷٤) ═══ */
export const multStrategies5 = Object.assign({
  id: 'multStrategies5', giver: 'tariq',
  intro: n => [{ who: 'tariq', text: `عدتَ يا ${n}! في كشك الهدايا آلة حاسبة ذكية، لكنها لا تعرف الضرب في ١٩ و٢١ و٢٥ مباشرة.` },
    { who: 'tariq', text: 'استخدم أزرارها بثلاث خطوات على الأكثر لتصل إلى الناتج: مثلاً ×٢٥ = ×١٠٠ ثم ÷٤.' }],
  begin(d) { d.rounds = shuffle([19, 21, 25]).map(k => ({ a: k === 25 ? R(3, 12) * 4 : R(12, 39), k })); d.r = 0; d.ops = []; },
  goal: d => `🎁 احسب أثمان الهدايا ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], OPS = [['×٢٠', v => v * 20], ['×١٠٠', v => v * 100], ['÷٤', v => v / 4], [`+${N(r.a)}`, v => v + r.a], [`−${N(r.a)}`, v => v - r.a], ['×٢', v => v * 2]];
    sheetOpen(`<h3>🎁 آلة الهدايا</h3>${msgBox((msg ? msg + ' ' : '') + `ثمن الهدية <b>${N(r.a)}</b> بيسة، والطلب <b>${N(r.k)}</b> هدية. أوصل الآلة إلى <b>${N(r.a)} × ${N(r.k)}</b> بثلاث خطوات على الأكثر.`, kind)}
      <div class="g5chunk"><div>${N(r.a)}${d.ops.map(i => ` ← <b>${OPS[i][0]}</b>`).join('')}</div></div>
      <div class="row2">${OPS.map((o, i) => `<button class="act" data-op="${i}"${d.ops.length >= 3 ? ' disabled' : ''}>${o[0]}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="oUndo"${d.ops.length ? '' : ' disabled'}>↩ تراجع</button><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.ops.length ? '' : ' disabled'}>⚙️ شغّل الآلة</button></div>`);
    panel().querySelectorAll('[data-op]').forEach(b => b.onclick = e => { e.stopPropagation(); d.ops.push(+b.dataset.op); sfx('click'); this.open(W, d, msg, kind); });
    btn('oUndo', () => { d.ops.pop(); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const v = d.ops.reduce((x, i) => OPS[i][1](x), r.a); d.ops = [];
      if (H(v) === H(r.a * r.k)) await advance(this, W, d, 3, 'multStrategies5', [{ who: 'tariq', text: 'آلة الهدايا تحبك! تضرب في ١٩ و٢١ و٢٥ بخطوات ذكية.' }]);
      else { sfx('cough'); this.open(W, d, `خرج من الآلة ${Number.isInteger(v) ? N(v) : dec(v)}، وهذا ليس ${N(r.a)} × ${N(r.k)}. ${r.k === 25 ? '٢٥ = ١٠٠ ÷ ٤' : r.k === 19 ? '١٩ = ٢٠ − ١' : '٢١ = ٢٠ + ١'}`, 'bad'); } });
  }
}, station('gifts', '🎁 كشك الهدايا'));

/* ═══ ١٢-٣ المضاعفة والتنصيف — «المرآة السحرية» (كل ضغطة يكتب الطالب ناتجها) ═══ */
export const doubleHalve5 = Object.assign({
  id: 'doubleHalve5', giver: 'mudhaffar',
  intro: n => [{ who: 'mudhaffar', text: `عدتَ يا ${n}! المرآة السحرية تضاعف العدد أو تنصّفه، لكنها لا تُظهر الناتج: أنت تكتبه.` },
    { who: 'mudhaffar', text: 'اضغط «ضاعف» أو «نصّف»، ثم اكتب العدد الجديد. أوصل العدد إلى الهدف.' }],
  begin(d) {
    const b = R(31, 49) * 100, c = R(11, 29) / 10;
    d.rounds = [{ from: R(21, 45) * 10, steps: 2, dir: 2 }, { from: b * 2, steps: 1, dir: 0.5 }, { from: c, steps: 2, dir: 2 }].map(x => ({ ...x, to: x.from * x.dir ** x.steps }));
    d.r = 0; d.cur = d.rounds[0].from; d.pend = null;
  },
  goal: d => `🪞 اعبر المرآة السحرية ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], show = v => Number.isInteger(v) ? N(v) : dec(v);
    sheetOpen(`<h3>🪞 المرآة السحرية</h3>${msgBox((msg ? msg + ' ' : '') + `العدد الآن <b>${show(d.cur)}</b> والهدف <b>${show(r.to)}</b>. ${d.pend ? `اكتب ناتج <b>${d.pend === 2 ? 'المضاعفة' : 'التنصيف'}</b>.` : 'اختر: ضاعف أم نصّف؟'}`, kind)}
      <div class="row2"><button class="act" id="mDbl"${d.pend ? ' disabled' : ''}>✖️ ضاعف</button><button class="act" id="mHalf"${d.pend ? ' disabled' : ''}>➗ نصّف</button></div>
      <div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
    btn('mDbl', () => { d.pend = 2; sfx('click'); this.open(W, d, msg, kind); });
    btn('mHalf', () => { d.pend = 0.5; sfx('click'); this.open(W, d, msg, kind); });
    if (d.pend) numPad(panel().querySelector('#pad'), '✓ هذا هو الناتج', async v => {
      const want = d.cur * d.pend;
      if (H(v) !== H(want)) { sfx('cough'); return this.open(W, d, `ليس ناتج ${d.pend === 2 ? 'مضاعفة' : 'تنصيف'} ${show(d.cur)}. جزّئ العدد ثم ${d.pend === 2 ? 'ضاعف' : 'نصّف'} كل جزء.`, 'bad'); }
      d.cur = want; d.pend = null; sfx('drop');
      if (H(d.cur) === H(r.to)) await advance(this, W, d, 3, 'doubleHalve5', [{ who: 'mudhaffar', text: 'عبرتَ المرآة! تضاعف وتنصّف الأعداد الكبيرة والعشرية بثقة.' }], d2 => { d2.cur = d2.rounds[d2.r].from; });
      else if (Math.abs(d.cur) > Math.abs(r.to) * 8 || Math.abs(d.cur) < Math.abs(r.to) / 8) { d.cur = r.from; this.open(W, d, 'ابتعدتَ كثيراً عن الهدف، فعاد العدد إلى البداية.', 'bad'); }
      else this.open(W, d, '✓', 'ok');
    }, { dot: true });
    out();
  }
}, station('mirror', '🪞 المرآة السحرية'));

/* ═══ ١٣-١ الطرح — «مضمار السباق» (قفزات العدّ التصاعدي، ثم التعويض) ═══ */
const JUMPS = [1000, 100, 10, 1];
export const subtract5 = Object.assign({
  id: 'subtract5', giver: 'nawal',
  intro: n => [{ who: 'nawal', text: `عدتَ يا ${n}! في مضمار السباق نجد الفرق بالقفز من العدد الصغير إلى الكبير.` },
    { who: 'nawal', text: 'اقفز بالآلاف والمئات والعشرات والآحاد حتى تصل تماماً. مجموع القفزات هو الفرق.' }],
  begin(d) {
    const mk = () => { const b = R(12, 38) * 100 + R(11, 89), a = b + R(1, 3) * 1000 + R(1, 9) * 100 + R(1, 9) * 10 + R(1, 9); return { t: 'jump', a, b }; };
    const x = R(2001, 6999), k = [99, 199, 299, 399][R(0, 3)];
    d.rounds = [mk(), mk(), { t: 'comp', x, k }]; d.r = 0; d.j = [];
  },
  goal: d => `🏃 احسب فروق السباق ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'nawal', text: 'حسابات المضمار دقيقة! تجد الفرق بالعدّ التصاعدي وتعوّض المضاعفات القريبة.' }];
    if (r.t === 'jump' && d.reached === d.r) return this.diff(W, d, r, L, msg, kind);   // وصل من قبل: يبقى سؤال الفرق
    if (r.t === 'comp') return kp(this, W, d, { title: '🏃 الحساب السريع', text: `${N(r.x)} − ${N(r.k)} = ؟ (اطرح ${N(r.k + 1)} ثم صحّح)`, ans: r.x - r.k, n: 3, id: 'subtract5', msg, kind, opts: { dot: false }, lines: L, hint: `ليس هذا: طرحنا ${N(r.k + 1)}، أي أكثر من المطلوب بواحد.` });
    const pos = r.b + d.j.reduce((s, x) => s + x, 0);
    sheetOpen(`<h3>🏃 قفزات المضمار</h3>${msgBox((msg ? msg + ' ' : '') + `اقفز من <b>${N(r.b)}</b> إلى <b>${N(r.a)}</b> تماماً.`, kind)}
      <div class="g5chunk"><div>${N(r.b)}${d.j.map(x => ` + <b>${N(x)}</b>`).join('')}</div><div class="left">وصلتَ إلى: <b>${N(pos)}</b></div></div>
      <div class="row2">${JUMPS.map(x => `<button class="act" data-j="${x}">🦘 +${N(x)}</button>`).join('')}<button class="act ghost" id="jUndo"${d.j.length ? '' : ' disabled'}>↩</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.j.length ? '' : ' disabled'}>🏁 خط النهاية</button></div>`);
    panel().querySelectorAll('[data-j]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.j.length < 40) d.j.push(+b.dataset.j); sfx('drop'); this.open(W, d, msg, kind); });
    btn('jUndo', () => { d.j.pop(); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', () => {
      if (pos !== r.a) { sfx('cough'); return this.open(W, d, pos < r.a ? 'لم تصل بعد إلى خط النهاية.' : 'تجاوزتَ خط النهاية! تراجع قليلاً.', 'bad'); }
      d.j = []; d.reached = d.r; changed(); this.diff(W, d, r, L);
    });
  },
  diff(W, d, r, L, msg, kind) { kp(this, W, d, { title: '🏃 الفرق', text: `وصلتَ! كم الفرق بين <b>${N(r.a)}</b> و<b>${N(r.b)}</b>؟ (اجمع قفزاتك)`, ans: r.a - r.b, n: 3, id: 'subtract5', msg, kind, opts: { dot: false }, lines: L, hint: 'اجمع القفزات كلها.' }); }
}, station('track', '🏃 مضمار السباق'));

/* ═══ ١٣-٢ الجمع — «لوحة النقاط» (جمع عمودي يكتب فيه الطالب كل منزلة) ═══ */
export const add5 = Object.assign({
  id: 'add5', giver: 'safiya',
  intro: n => [{ who: 'safiya', text: `مرحباً مجدداً يا ${n}! لوحة نقاط المسابقات تحتاج من يجمع الفرق عمودياً.` },
    { who: 'safiya', text: 'ابدأ من اليمين: اكتب رقم كل منزلة في المجموع، ولا تنسَ الحمل إلى المنزلة التالية.' }],
  begin(d) { const p = () => R(1201, 4999); d.rounds = [{ a: p(), b: p(), dp: 0 }, { a: p(), b: p(), dp: 0 }, { a: R(101, 899), b: R(101, 899), dp: 2 }]; d.r = 0; d.dg = []; },
  goal: d => `🏆 اجمع لوحة النقاط ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], s = r.a + r.b, len = String(s).length, cols = Math.max(len, String(r.a).length), sd = String(s).padStart(cols, ' ');
    const fmt = (v, i) => r.dp && i === cols - r.dp ? `٫${v}` : v, row = n => String(n).padStart(cols, ' ').split('').map((ch, i) => `<td>${ch === ' ' ? '' : fmt(ar(ch), i)}</td>`).join('');
    const k = d.dg.length, active = cols - 1 - k;
    sheetOpen(`<h3>🏆 لوحة النقاط</h3>${msgBox((msg ? msg + ' ' : '') + (r.dp ? 'اجمع الأعداد العشرية (الفاصلة تحت الفاصلة).' : 'اجمع عمودياً.') + ` اضغط رقم المنزلة ${k < cols ? 'المضيئة' : ''}.`, kind)}
      <table class="g5col"><tr><td></td>${row(r.a)}</tr><tr><td>+</td>${row(r.b)}</tr><tr class="sum"><td>=</td>${sd.split('').map((ch, i) => `<td class="${i === active ? 'act' : ''}">${i > active && d.dg[cols - 1 - i] !== undefined ? fmt(ar(d.dg[cols - 1 - i]), i) : ''}</td>`).join('')}</tr></table>
      <div class="g5digits">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => `<button class="act" data-d="${x}"${k >= cols ? ' disabled' : ''}>${ar(x)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="dUndo"${k ? '' : ' disabled'}>↩</button><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${k === cols ? '' : ' disabled'}>🏆 ثبّت المجموع</button></div>`);
    panel().querySelectorAll('[data-d]').forEach(b => b.onclick = e => { e.stopPropagation(); d.dg.push(+b.dataset.d); sfx('click'); this.open(W, d, msg, kind); });
    btn('dUndo', () => { d.dg.pop(); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => {
      const want = String(s).padStart(cols, '0').split('').reverse().map(Number), bad = want.findIndex((v, i) => v !== d.dg[i]);
      if (bad < 0) { d.dg = []; await advance(this, W, d, 3, 'add5', [{ who: 'safiya', text: 'لوحة النقاط صحيحة! تجمع الأعداد الكبيرة والعشرية مع الحمل.' }]); }
      else { sfx('cough'); d.dg = d.dg.slice(0, bad); this.open(W, d, 'رقم في المجموع غير صحيح، فمسحتُه وما بعده. هل نسيت الحمل؟', 'bad'); }
    });
  }
}, station('score', '🏆 لوحة النقاط'));

/* ═══ ١٣-٣ جمع وطرح المبالغ المالية — «دكان المهرجان» (الباقي بقطع النقود) ═══ */
const COINS = [500, 100, 50, 25, 10, 5];
export const money5 = Object.assign({
  id: 'money5', giver: 'umsaid',
  intro: n => [{ who: 'umsaid', text: `أهلاً يا ${n}! الزبائن كثيرون في دكان المهرجان، أعطِ كل زبون الباقي بالضبط.` },
    { who: 'umsaid', text: 'الريال = ١٠٠٠ بيسة. اجمع الأثمان، ثم أعطِ الباقي بقطع النقود.' }],
  begin(d) {
    const mk = () => { const items = [R(3, 9) * 50, R(2, 9) * 25, R(1, 6) * 100].slice(0, R(2, 3)), tot = items.reduce((a, b) => a + b, 0), paid = Math.ceil((tot + 1) / 1000) * 1000; return { items, tot, paid }; };
    d.rounds = [mk(), mk(), mk()]; d.r = 0; d.coins = [];
  },
  goal: d => `🍭 أعطِ الزبائن الباقي ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], got = d.coins.reduce((a, b) => a + b, 0), P = ['🍭 حلوى', '🎈 بالون', '🥤 عصير'];
    sheetOpen(`<h3>🍭 زبون ${N(d.r + 1)}</h3>${msgBox((msg ? msg + ' ' : '') + `اشترى: ${r.items.map((v, i) => `${P[i]} <b>${N(v)}</b> بيسة`).join('، ')}، ودفع <b>${N(r.paid / 1000)} ريال</b>. أعطه الباقي.`, kind)}
      <div class="g5chunk"><div class="left">في يدك للزبون: <b>${N(got)}</b> بيسة</div></div>
      <div class="row2">${COINS.map(c => `<button class="act" data-c="${c}">🪙 ${N(c)}</button>`).join('')}<button class="act ghost" id="cUndo"${d.coins.length ? '' : ' disabled'}>↩</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo"${d.coins.length ? '' : ' disabled'}>🤝 سلّم الباقي</button></div>`);
    panel().querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.coins.length < 30) d.coins.push(+b.dataset.c); sfx('drop'); this.open(W, d, msg, kind); });
    btn('cUndo', () => { d.coins.pop(); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const want = r.paid - r.tot;
      if (got === want) { d.coins = []; await advance(this, W, d, 3, 'money5', [{ who: 'umsaid', text: 'كل زبون خرج سعيداً بالباقي الصحيح! تحسب بالريال والبيسة بدقة.' }]); }
      else { sfx('cough'); this.open(W, d, got > want ? 'أعطيتَ الزبون أكثر من الباقي!' : 'الباقي ناقص: الزبون ينتظر.', 'bad'); } });
  }
}, station('shop', '🍭 دكان المهرجان'));

/* ═══ ١٤-١ الضرب والقسمة — «عربات الملاهي» (عدد العربات، الضرب، الباقي) ═══ */
export const multDiv5 = Object.assign({
  id: 'multDiv5', giver: 'tariq',
  intro: n => [{ who: 'tariq', text: `آخر مهمة في المهرجان يا ${n}! الزوار يصطفون أمام عربات الملاهي.` },
    { who: 'tariq', text: 'وزّع الزوار على العربات: اضبط عدد العربات حتى يركب الجميع، ثم احسب الرحلات.' }],
  begin(d) { const b = R(4, 8), n = b * R(12, 24) + R(1, b - 1), a = R(12, 29), c = R(13, 25), m = R(4, 9), q = R(31, 79), rr2 = R(1, m - 1);
    d.rounds = [{ t: 'carts', n, b }, { t: 'mul', a, c }, { t: 'rem', m, q, rem: rr2 }]; d.r = 0; d.k = 10; },
  goal: d => `🎡 نظّم عربات الملاهي ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], L = [{ who: 'tariq', text: 'الملاهي منظمة والجميع ركب! تضرب وتقسم وتعرف ماذا تفعل بالباقي.' }];
    if (r.t === 'mul') return kp(this, W, d, { title: '🎡 رحلات اليوم', text: `في كل رحلة <b>${N(r.c)}</b> زائراً، وقامت العربات بـ <b>${N(r.a)}</b> رحلة. كم زائراً ركب؟`, ans: r.a * r.c, n: 3, id: 'multDiv5', msg, kind, opts: { dot: false }, lines: L, hint: 'ليس هذا الناتج: استخدم الشبكة (عشرات وآحاد).' });
    if (r.t === 'rem') return kp(this, W, d, { title: '🎡 آخر الطابور', text: `<b>${N(r.m * r.q + r.rem)}</b> زائراً، وفي كل عربة <b>${N(r.m)}</b>. بعد أن تمتلئ العربات، كم زائراً يبقى؟`, ans: r.rem, n: 3, id: 'multDiv5', msg, kind, opts: { dot: false }, lines: L, hint: 'الباقي أصغر من عدد مقاعد العربة. تحقّق بالضرب.' });
    sheetOpen(`<h3>🎡 عربات الملاهي</h3>${msgBox((msg ? msg + ' ' : '') + `في الطابور <b>${N(r.n)}</b> زائراً، وفي كل عربة <b>${N(r.b)}</b> مقاعد. كم عربة نحتاج حتى يركب <b>الجميع</b>؟`, kind)}
      <div class="row2"><div class="cnt g5cnt"><span>العربات</span><button class="act ghost" data-k="-10">−١٠</button><button class="act ghost" data-k="-1">−</button><b>${N(d.k)}</b><button class="act ghost" data-k="1">+</button><button class="act ghost" data-k="10">+١٠</button></div></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🎡 شغّل العربات</button></div>`);
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); d.k = Math.max(1, Math.min(60, d.k + +b.dataset.k)); sfx('click'); this.open(W, d, msg, kind); });
    out();
    btn('benchGo', async () => { const need = Math.ceil(r.n / r.b);
      if (d.k === need) await advance(this, W, d, 3, 'multDiv5', L);
      else { sfx('cough'); this.open(W, d, d.k * r.b < r.n ? `${N(d.k)} × ${N(r.b)} = ${N(d.k * r.b)}: بقي زوار في الطابور!` : `${N(d.k - 1)} عربة تكفي الجميع: لا نحتاج عربات فارغة.`, 'bad'); } });
  }
}, station('rides', '🎡 عربات الملاهي'));

export const G5U5 = { sequences5b, generalStatements5, negatives5, decimals5, decimalFacts5, multStrategies5, doubleHalve5, subtract5, add5, money5, multDiv5 };
