// الوحدة ١ (الأعداد): كل درس آلية لعب مستقلة في القرية، والرياضيات هي التي تحرك الحدث
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait, rr, clamp, shade } from '../core/util.js';
import { PAL, INK, pattern, sprite, signboard, palm } from '../world/art.js';
import { say, puff, floatUp, bubble } from '../world/entities.js';
import { earn } from '../rewards/goodDeeds.js';
import { sfx } from '../core/sound.js';
import { complete } from './quests.js';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const near = (W, p, r) => Math.hypot(W.player.x - p.x, W.player.y - p.y) < (r || 50);
const changed = () => { bus.emit('mission'); bus.emit('save'); };
const fmtNum = v => { let s = (Math.round(v * 10000) / 10000).toString(); return ar(s).replace('.', '٫'); };
function crate(ctx, x, y, w, label) {
  ctx.fillStyle = '#D79B57'; rr(ctx, x - w / 2, y - w * .8, w, w * .8, 2); ctx.fill(); ctx.strokeStyle = '#A66C2E'; ctx.lineWidth = 1; ctx.stroke();
  if (label && w > 16) { ctx.fillStyle = '#5A3A10'; ctx.font = `900 ${Math.max(8, w * .32)}px Cairo, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(label, x, y - w * .28); }
}
function post(ctx, x, y, text, color) {
  ctx.fillStyle = '#7D5A36'; ctx.fillRect(x - 2, y - 34, 4, 34);
  ctx.fillStyle = color || '#2E7D5B'; rr(ctx, x - 22, y - 52, 44, 22, 5); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '900 13px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, x, y - 36);
}
async function finish(W, id, lines, reward) {
  sfx('win'); await wait(700);
  earn(reward || 40, W.player.x, W.player.y - 80);
  complete(id);
  if (lines) await W.talk(lines[0].who, lines);
}

/* ═══ ١. القيمة المكانية — «شحنة الآلاف» ═══ */
const PILES = [{ v: 1000, x: 140, y: 548, w: 30, label: '١٠٠٠', place: 'الآلاف' }, { v: 100, x: 205, y: 548, w: 24, label: '١٠٠', place: 'المئات' },
  { v: 10, x: 265, y: 548, w: 18, label: '١٠', place: 'العشرات' }, { v: 1, x: 320, y: 548, w: 13, label: '١', place: 'الآحاد' }];
const CART = { x: 520, y: 552 };
const digits = n => [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
export const placeValue = {
  id: 'placeValue', giver: 'salem',
  intro: n => [
    { who: 'salem', text: `أهلاً يا ${n}! قبل أن تتحرك القافلة إلى المزرعة يجب أن نجهّز شحنات البذور.` },
    { who: 'salem', text: 'البذور معبأة في صناديق: الكبير فيه ألف بذرة، ثم مئة، ثم عشر، والصغير فيه بذرة واحدة.' },
    { who: 'salem', text: 'حمّل العربة بعدد البذور المكتوب على لوحتها تماماً، ثم أرسل الشحنة.' }
  ],
  begin(d) { const mk = z => { const a = [R(1, 5), R(1, 6), R(1, 6), R(1, 6)]; if (z) a[R(1, 2)] = 0; return a[0] * 1000 + a[1] * 100 + a[2] * 10 + a[3]; }; d.rounds = [mk(0), mk(1), mk(1)]; d.r = 0; d.cart = [0, 0, 0, 0]; d.hand = null; },
  goal: d => { const r = Math.min(d.r, 2); return `📦 حمّل العربة بـ ${ar(d.rounds[r])} بذرة (شحنة ${ar(r + 1)} من ${ar(3)})`; },
  target: d => d.hand ? CART : { x: 230, y: 540 },
  taps: d => PILES.map(p => ({ x: p.x, y: p.y - 14, hit: 26, approach: { x: p.x, y: p.y + 26 } })).concat([{ x: CART.x, y: CART.y - 12, hit: 40, approach: { x: CART.x, y: CART.y + 30 } }]),
  hand: d => d.hand ? { n: d.hand.n, label: `${ar(d.hand.n)} × ${PILES[d.hand.k].label}` } : null,
  actions(W, d) {
    const out = [];
    PILES.forEach((p, k) => {
      if (!near(W, { x: p.x, y: p.y + 20 }, 34)) return;
      const same = !d.hand || d.hand.k === k;
      out.push({ key: 'pile' + k, label: `📦 احمل صندوق ${p.label}`, disabled: !same || (d.hand && d.hand.n >= 9), run: () => { d.hand = d.hand || { k, n: 0 }; d.hand.n++; sfx('pick'); changed(); } });
      if (d.hand && d.hand.k === k) out.push({ key: 'pile' + k, label: '↩ أعِد صندوقاً', kind: 'ghost', run: () => { d.hand.n--; if (!d.hand.n) d.hand = null; sfx('drop'); changed(); } });
    });
    if (near(W, { x: CART.x, y: CART.y + 20 }, 50)) {
      if (d.hand) out.push({ key: 'cart', label: '⬇ ضع على العربة', run: () => { d.cart[d.hand.k] += d.hand.n; d.hand = null; sfx('drop'); changed(); } });
      else d.cart.forEach((c, k) => { if (c) out.push({ key: 'cart', label: `⬆ أنزل ${PILES[k].label}`, kind: 'ghost', run: () => { d.cart[k]--; d.hand = { k, n: 1 }; sfx('pick'); changed(); } }); });
      out.push({ key: 'cart', label: '🚚 أرسل الشحنة', kind: 'go', disabled: !!d.hand || d.cart.every(c => !c), run: () => this.send(W, d) });
    }
    return out;
  },
  async send(W, d) {
    const want = digits(d.rounds[d.r]), k = want.findIndex((v, i) => v !== d.cart[i]);
    if (k >= 0) { sfx('cough'); say(CART.x, CART.y - 96, `صناديق ${PILES[k].place} لا تطابق الطلب`, '#C2304A', 2600); return; }
    sfx('engine'); puff(CART.x - 30, CART.y, '#eee', 6); say(CART.x, CART.y - 96, `شحنة ${ar(d.rounds[d.r])} بذرة جاهزة!`, '#1FA05A', 2000);
    d.r++; d.cart = [0, 0, 0, 0]; changed();
    if (d.r >= d.rounds.length) await finish(W, 'placeValue', [{ who: 'salem', text: 'أحسنت! الشحنات الثلاث مطابقة تماماً. كل رقم في مكانه الصحيح.' }]);
  },
  draw(d) {
    if (!d.rounds) return [];
    const out = PILES.map(p => ({ y: p.y, draw: c => { for (let i = 0; i < 3; i++) crate(c, p.x + (i % 2) * 3, p.y - i * p.w * .75, p.w, p.label); } }));
    out.push({ y: CART.y, draw: c => {
      c.fillStyle = '#6B4F33'; rr(c, CART.x - 48, CART.y - 16, 96, 14, 3); c.fill();
      [[-36, 0], [36, 0]].forEach(([dx]) => { c.fillStyle = '#26262F'; c.beginPath(); c.arc(CART.x + dx, CART.y, 6, 0, 7); c.fill(); });
      let x = CART.x - 44; d.cart.forEach((n, k) => { for (let i = 0; i < n; i++) crate(c, x + PILES[k].w / 2 + (i % 3) * 2, CART.y - 16 - Math.floor(i / 3) * PILES[k].w * .7 - (i % 3) * 3, PILES[k].w, ''); x += n ? PILES[k].w + 2 : 0; });
      if (d.r < d.rounds.length) bubble(c, CART.x, CART.y - 70, `الطلب: ${ar(d.rounds[d.r])}`, '#2A1B66');
    } });
    return out;
  }
};

/* ═══ ٢. المقارنة والتقريب — «لافتات الطريق» ═══ */
const MARKS = Array.from({ length: 9 }, (_, i) => ({ v: (i + 1) * 100, x: 150 + i * 150, y: 708 }));
const DEPOT = { x: 470, y: 572 };
export const compareRound = {
  id: 'compareRound', giver: 'yousef',
  intro: n => [
    { who: 'yousef', text: `يا ${n}! وصلت طرود لأهل القرية، وكل بيت عند لافتة على الطريق.` },
    { who: 'yousef', text: 'على كل طرد عدد، واللافتات بالمئات. ضع كل طرد عند اللافتة الأقرب إلى عدده.' }
  ],
  begin(d) { const s = new Set(); d.items = []; while (d.items.length < 4) { const v = R(1, 8) * 100 + R(11, 89); if (v % 100 === 50 || s.has(Math.round(v / 100))) continue; s.add(Math.round(v / 100)); d.items.push(v); } d.placed = []; d.hand = null; },
  goal: d => d.hand !== null && d.hand !== undefined ? `📍 ضع الطرد ${ar(d.items[d.hand])} عند أقرب لافتة` : `📦 خذ الطرود من المخزن (${ar(d.placed.length)} من ${ar(4)})`,
  target: d => (d.hand === null || d.hand === undefined) ? DEPOT : null,
  taps: () => [{ x: DEPOT.x, y: DEPOT.y - 10, hit: 34, approach: { x: DEPOT.x, y: DEPOT.y + 26 } }].concat(MARKS.map(m => ({ x: m.x, y: m.y - 30, hit: 30, approach: { x: m.x, y: m.y + 18 } }))),
  hand: d => (d.hand === null || d.hand === undefined) ? null : { n: 1, label: ar(d.items[d.hand]) },
  actions(W, d) {
    const out = [], free = d.hand === null || d.hand === undefined, next = d.items.findIndex((v, i) => !d.placed.some(p => p.i === i));
    if (near(W, { x: DEPOT.x, y: DEPOT.y + 16 }, 46) && free && next >= 0) out.push({ key: 'depot', label: `📦 خذ الطرد ${ar(d.items[next])}`, run: () => { d.hand = next; sfx('pick'); changed(); } });
    if (!free) MARKS.forEach(m => { if (near(W, { x: m.x, y: m.y + 10 }, 44)) out.push({ key: 'mark' + m.v, label: `📍 ضعه عند لافتة ${ar(m.v)}`, run: () => this.drop(W, d, m) }); });
    return out;
  },
  async drop(W, d, m) {
    const v = d.items[d.hand];
    if (Math.round(v / 100) * 100 === m.v) {
      d.placed.push({ i: d.hand, m: m.v }); d.hand = null; sfx('drop'); say(m.x, m.y - 80, `${ar(v)} ← ${ar(m.v)} ✓`, '#1FA05A', 1800); changed();
      if (d.placed.length >= 4) await finish(W, 'compareRound', [{ who: 'yousef', text: 'وصلت الطرود كلها! كل طرد عند اللافتة الأقرب إليه.' }]);
    } else { sfx('cough'); say(m.x, m.y - 80, `${ar(m.v)} ليست الأقرب إلى ${ar(v)}`, '#C2304A', 2400); }
  },
  ground(c, d, active, done) {
    MARKS.forEach(m => post(c, m.x, m.y + 8, ar(m.v), '#2E7D5B'));
    (d.placed || []).forEach(p => { const m = MARKS.find(x => x.v === p.m); crate(c, m.x + 20, m.y + 14, 16, ''); });
    if (active) { c.fillStyle = '#C9B48E'; rr(c, DEPOT.x - 34, DEPOT.y - 10, 68, 24, 6); c.fill(); const left = (d.items || []).length - (d.placed || []).length - ((d.hand === null || d.hand === undefined) ? 0 : 1); for (let i = 0; i < left; i++) crate(c, DEPOT.x - 18 + i * 12, DEPOT.y + 8, 15, ''); bubble(c, DEPOT.x, DEPOT.y - 40, 'مخزن الطرود', '#2A1B66'); }
  }
};

/* ═══ ٣. العوامل والمضاعفات — «صفوف البستان» ═══ */
export const ORCH = { x: 90, y: 1200, cell: 40, n: 6 };
export const factorsMultiples = {
  id: 'factorsMultiples', giver: 'hamad',
  intro: n => [
    { who: 'hamad', text: `جئت في وقتك يا ${n}! عندي فسائل نخيل للبستان الجديد في الجنوب.` },
    { who: 'hamad', text: 'أريد كل مجموعة في صفوف متساوية تماماً، لا فسيلة زائدة ولا مكان فارغ. اضبط الصفوف والأعمدة ثم ازرع.' }
  ],
  begin(d) { const P = [[12, 'rows', 3], [18, 'cols', 6], [20, 'rows', 4], [24, 'rows', 4], [15, 'cols', 5], [16, 'rows', 4], [30, 'rows', 5], [12, 'cols', 6]].filter(([n, , k]) => n % k === 0 && k <= 6 && n / k <= 6); d.rounds = shuffle(P).slice(0, 3); d.r = 0; d.rows = 1; d.cols = 1; d.grown = 0; },   // كل جولة تتسع للبستان (٦ × ٦)
  goal: d => { const [n, kind, k] = d.rounds[Math.min(d.r, d.rounds.length - 1)]; return `🌱 ازرع ${ar(n)} فسيلة ${kind === 'rows' ? `في ${ar(k)} صفوف متساوية` : `بحيث يكون في كل صف ${ar(k)}`}`; },
  target: () => ({ x: ORCH.x + 120, y: ORCH.y + 130 }),
  taps: () => [{ x: ORCH.x + 120, y: ORCH.y + 120, hit: 120, approach: { x: ORCH.x + 120, y: ORCH.y + 262 } }],
  actions(W, d) {
    if (!(W.player.x > ORCH.x - 40 && W.player.x < ORCH.x + 280 && W.player.y > ORCH.y - 40 && W.player.y < ORCH.y + 300)) return [];
    const st = (key, delta) => () => { d[key] = clamp(d[key] + delta, 1, ORCH.n); sfx('click'); changed(); };
    return [
      { key: 'orch', label: '➕ صف', kind: 'ghost', run: st('rows', 1), disabled: d.rows >= 6 }, { key: 'orch', label: '➖ صف', kind: 'ghost', run: st('rows', -1), disabled: d.rows <= 1 },
      { key: 'orch', label: '➕ عمود', kind: 'ghost', run: st('cols', 1), disabled: d.cols >= 6 }, { key: 'orch', label: '➖ عمود', kind: 'ghost', run: st('cols', -1), disabled: d.cols <= 1 },
      { key: 'orch', label: `🌱 ازرع (${ar(d.rows)} × ${ar(d.cols)})`, kind: 'green', run: () => this.plant(W, d) }
    ];
  },
  async plant(W, d) {
    const [n, kind, k] = d.rounds[d.r], c = { x: ORCH.x + 120, y: ORCH.y + 110 };
    if (d.rows * d.cols !== n) { sfx('cough'); say(c.x, c.y - 40, d.rows * d.cols < n ? 'بقيت فسائل بلا مكان!' : 'بقيت حفر فارغة بلا فسائل!', '#C2304A', 2400); return; }
    if ((kind === 'rows' && d.rows !== k) || (kind === 'cols' && d.cols !== k)) { sfx('cough'); say(c.x, c.y - 40, 'العم حمد طلب ترتيباً آخر للصفوف', '#B7791F', 2400); return; }
    sfx('plant'); d.grown = Date.now(); say(c.x, c.y - 40, `${ar(d.rows)} × ${ar(d.cols)} = ${ar(n)} ✓`, '#1FA05A', 1800); changed();
    await wait(1600); d.r++; d.rows = 1; d.cols = 1; d.grown = 0; changed();
    if (d.r >= d.rounds.length) { d.final = [3, 6]; changed(); await finish(W, 'factorsMultiples', [{ who: 'hamad', text: 'بستان مرتب كما أحب! كل صف يساوي الآخر.' }]); }
  },
  ground(c, d, active, done) {   // حوض تربة مرتفع بإطار خشبي، وشتلات ثم نخيل صغير (الرسم فقط؛ منطق الدرس كما هو)
    const O = ORCH, W2 = O.cell * O.n;
    sprite(c, 'orchard-bed', O.x - 12, O.y - 12, W2 + 24, W2 + 48, k => {
      k.fillStyle = 'rgba(70,42,20,.22)'; k.fillRect(O.x + 4, O.y + W2 + 6, W2, 6);
      k.fillStyle = PAL.wood; rr(k, O.x - 8, O.y - 8, W2 + 16, W2 + 16, 8); k.fill(); k.fillStyle = shade(PAL.wood, -22); k.fillRect(O.x - 8, O.y + W2 + 2, W2 + 16, 6);
      k.fillStyle = pattern(k, 'soil'); rr(k, O.x, O.y, W2, W2, 6); k.fill();
      k.strokeStyle = 'rgba(60,35,15,.3)'; k.lineWidth = 1.4; for (let r = 0; r < O.n; r++) { k.beginPath(); k.moveTo(O.x + 6, O.y + O.cell * (r + .5) + 6); k.lineTo(O.x + W2 - 6, O.y + O.cell * (r + .5) + 6); k.stroke(); }
      k.strokeStyle = INK; k.lineWidth = 1; rr(k, O.x - 8, O.y - 8, W2 + 16, W2 + 16, 8); k.stroke();
      signboard(k, O.x + W2 / 2, O.y + W2 + 24, 'بستان العم حمد');
    });
    const rows = done ? 3 : d.rows || 0, cols = done ? 6 : d.cols || 0;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const x = O.x + O.cell * (k + .5), y = O.y + O.cell * (r + .5) + 6;
      if (done || d.grown) palm(c, x, y, .32, false, 0);   // نخلة صغيرة
      else {   // حفرة بشتلة صغيرة
        c.fillStyle = '#5E3E26'; c.beginPath(); c.ellipse(x, y, 7, 3.4, 0, 0, 7); c.fill();
        c.strokeStyle = PAL.leafDark; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 9); c.stroke();
        c.fillStyle = PAL.leafLight; c.beginPath(); c.ellipse(x - 3, y - 8, 3.4, 1.6, -.6, 0, 7); c.ellipse(x + 3, y - 9, 3.4, 1.6, .6, 0, 7); c.fill();
      }
    }
  }
};

/* ═══ ٤. الفردية والزوجية — «ساعي البريد» ═══ */
export const POST = { x: 420, y: 1180, w: 180, h: 100 };
const LETTERS = { x: 510, y: 1318 }, BOX_ODD = { x: 452, y: 1352 }, BOX_EVEN = { x: 568, y: 1352 };
export const oddEven = {
  id: 'oddEven', giver: 'saeed',
  intro: n => [
    { who: 'saeed', text: `مرحباً يا ${n}! أنا سعيد ساعي البريد، والرسائل تراكمت عليّ.` },
    { who: 'saeed', text: 'بيوت الرقم الفردي صندوقها الأحمر، وبيوت الرقم الزوجي صندوقها الأزرق. بعض العناوين مكتوبة عمليةً، فاحسب نوع ناتجها.' }
  ],
  begin(d) {
    const L = [];
    for (let i = 0; i < 3; i++) { const v = R(11, 299); L.push({ t: ar(v), v }); }
    const a = R(11, 49), b = R(11, 49); L.push({ t: `${ar(a)} + ${ar(b)}`, v: a + b });
    const c = R(3, 9), e = R(3, 9); L.push({ t: `${ar(c)} × ${ar(e)}`, v: c * e });
    const f = R(40, 90), g = R(11, 39); L.push({ t: `${ar(f)} − ${ar(g)}`, v: f - g });
    d.letters = shuffle(L); d.i = 0; d.hand = false;
  },
  goal: d => d.hand ? `✉ ضع رسالة «${d.letters[d.i].t}» في صندوقها` : `✉ خذ الرسالة التالية من الكومة (${ar(d.i)} من ${ar(6)})`,
  target: () => LETTERS,
  taps: () => [LETTERS, BOX_ODD, BOX_EVEN].map(p => ({ x: p.x, y: p.y - 14, hit: 30, approach: { x: p.x, y: p.y + 22 } })),
  hand: d => d.hand ? { n: 1, label: d.letters[d.i].t } : null,
  actions(W, d) {
    const out = [];
    if (!d.hand && near(W, { x: LETTERS.x, y: LETTERS.y + 14 }, 40) && d.i < 6) out.push({ key: 'pile', label: `✉ خذ الرسالة`, run: () => { d.hand = true; sfx('pick'); changed(); } });
    if (d.hand) {
      if (near(W, { x: BOX_ODD.x, y: BOX_ODD.y + 16 }, 40)) out.push({ key: 'odd', label: '📮 الصندوق الأحمر (فردي)', run: () => this.drop(W, d, 1) });
      if (near(W, { x: BOX_EVEN.x, y: BOX_EVEN.y + 16 }, 40)) out.push({ key: 'even', label: '📮 الصندوق الأزرق (زوجي)', kind: 'go', run: () => this.drop(W, d, 0) });
    }
    return out;
  },
  async drop(W, d, odd) {
    const L = d.letters[d.i], box = odd ? BOX_ODD : BOX_EVEN;
    if ((L.v % 2) === odd) { d.i++; d.hand = false; sfx('drop'); say(box.x, box.y - 70, '✓', '#1FA05A', 1200); changed();
      if (d.i >= 6) await finish(W, 'oddEven', [{ who: 'saeed', text: 'كل رسالة في صندوقها الصحيح! سأوزعها الآن على البيوت.' }]); }
    else { sfx('cough'); say(box.x, box.y - 70, `ناتجها ${ar(L.v)}، والصندوق خطأ`, '#C2304A', 2400); }
  },
  ground(c, d, active) {
    if (active) { for (let i = 0; i < 6 - (d.i || 0) - (d.hand ? 1 : 0); i++) { c.fillStyle = i % 2 ? '#FFFDF6' : '#F4E3B8'; rr(c, LETTERS.x - 12 + (i % 3) * 3, LETTERS.y - 6 - i * 4, 24, 15, 2); c.fill(); c.strokeStyle = '#C9A46B'; c.stroke(); } }
  },
  draw() {
    const box = (p, col, t) => ({ y: p.y, draw: c => { c.fillStyle = '#5B5B5B'; c.fillRect(p.x - 2, p.y - 30, 4, 30); c.fillStyle = col; rr(c, p.x - 15, p.y - 54, 30, 26, 6); c.fill(); c.fillStyle = '#222'; c.fillRect(p.x - 9, p.y - 46, 18, 3); c.fillStyle = '#fff'; c.font = '900 10px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(t, p.x, p.y - 33); } });
    return [box(BOX_ODD, '#D63B3B', 'فردي'), box(BOX_EVEN, '#2F6FB2', 'زوجي')];
  }
};

/* ═══ ٥. الأعداد الأولية — «فوانيس الساحة» ═══ */
const LAMPS = Array.from({ length: 12 }, (_, i) => ({ x: 700 + (i % 6) * 70, y: i < 6 ? 1280 : 1395 }));
const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const factorPair = n => { for (let i = 2; i * i <= n; i++) if (n % i === 0) return [i, n / i]; return null; };
export const primeNumbers = {
  id: 'primeNumbers', giver: 'umkhalid',
  intro: n => [
    { who: 'umkhalid', text: `الليلة احتفال القرية يا ${n}، وفوانيس الساحة الجنوبية تنتظر من يشعلها.` },
    { who: 'umkhalid', text: 'الفوانيس السحرية لا تضيء إلا إذا كان رقمها عدداً أولياً. أشعلها كلها، واحذر غيرها فإنها تدخّن!' }
  ],
  begin(d) { const P = shuffle([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]).slice(0, 5), C = shuffle([1, 4, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 57]).slice(0, 7); d.nums = shuffle(P.concat(C)); d.lit = []; },
  goal: d => `🏮 أشعل الفوانيس التي أرقامها أعداد أولية (${ar(d.lit.length)} من ${ar(d.nums.filter(isPrime).length)})`,
  target: () => ({ x: 875, y: 1330 }),
  taps: () => LAMPS.map(l => ({ x: l.x, y: l.y - 30, hit: 26, approach: { x: l.x, y: l.y + 22 } })),
  actions(W, d) {
    const out = [];
    LAMPS.forEach((l, i) => { if (!d.lit.includes(i) && near(W, { x: l.x, y: l.y + 12 }, 30)) out.push({ key: 'lamp' + i, label: `🔥 أشعل فانوس ${ar(d.nums[i])}`, run: () => this.light(W, d, i) }); });
    return out;
  },
  async light(W, d, i) {
    const n = d.nums[i], l = LAMPS[i];
    if (isPrime(n)) { d.lit.push(i); sfx('good'); puff(l.x, l.y - 50, '#FFE08A', 6); changed();
      if (d.lit.length >= d.nums.filter(isPrime).length) await finish(W, 'primeNumbers', [{ who: 'umkhalid', text: 'ما أجمل الساحة! كل الفوانيس الأولية مضيئة.' }]); }
    else { sfx('cough'); puff(l.x, l.y - 50, '#555', 8); const f = factorPair(n); say(l.x, l.y - 86, f ? `${ar(n)} = ${ar(f[0])} × ${ar(f[1])}` : `${ar(n)} ليس أولياً`, '#C2304A', 2600); }
  },
  draw(d, t, active, done) {
    if (!d.nums) return [];
    return LAMPS.map((l, i) => ({ y: l.y, draw: c => {
      const on = (d.lit || []).includes(i);
      c.fillStyle = '#4A4F63'; c.fillRect(l.x - 2, l.y - 42, 4, 42);
      if (on) { c.fillStyle = 'rgba(255,200,80,.35)'; c.beginPath(); c.arc(l.x, l.y - 52, 22 + Math.sin(t * 5 + i) * 2, 0, 7); c.fill(); }
      c.fillStyle = on ? '#FFC23D' : '#6B6F80'; rr(c, l.x - 9, l.y - 64, 18, 22, 5); c.fill();
      c.fillStyle = '#2B2E3B'; rr(c, l.x - 13, l.y - 68, 26, 6, 3); c.fill();
      if (!done) { c.fillStyle = '#FFFDF6'; rr(c, l.x - 14, l.y - 92, 28, 18, 5); c.fill(); c.fillStyle = '#2A1B66'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(ar(d.nums[i]), l.x, l.y - 79); }
    } }));
  }
};

/* ═══ ٦. الضرب والقسمة على ١٠ و١٠٠ و١٠٠٠ — «آلة الورشة» ═══ */
export const SHOPW = { x: 1120, y: 1180, w: 180, h: 100 };
const MACH = { x: 1360, y: 1340 };
const OPS = [['×', 10], ['×', 100], ['×', 1000], ['÷', 10], ['÷', 100], ['÷', 1000]];
export const powerOf10 = {
  id: 'powerOf10', giver: 'rashed',
  intro: n => [
    { who: 'rashed', text: `أهلاً يا ${n}! أنا راشد صاحب الورشة. آلتي تكبّر الأعداد وتصغّرها، لكنها تحتاج يداً دقيقة.` },
    { who: 'rashed', text: 'في كل مرة يظهر عدد على الشاشة وهدف على اللوحة. اضغط الذراع المناسب مرة واحدة لتحوّل العدد إلى الهدف.' }
  ],
  begin(d) { const P = [[3.7, 370], [4200, 4.2], [0.56, 56], [75, 0.75], [2.5, 2500], [860, 8.6], [0.09, 9], [31, 0.031]]; d.rounds = shuffle(P).slice(0, 4); d.r = 0; d.show = null; },
  goal: d => { const r = Math.min(d.r, d.rounds.length - 1); return `⚙️ حوّل ${fmtNum(d.rounds[r][0])} إلى ${fmtNum(d.rounds[r][1])} بضغطة واحدة (${ar(r + 1)} من ${ar(4)})`; },
  target: () => MACH,
  taps: () => [{ x: MACH.x, y: MACH.y - 30, hit: 40, approach: { x: MACH.x, y: MACH.y + 30 } }],
  actions(W, d) {
    if (!near(W, { x: MACH.x, y: MACH.y + 20 }, 50) || d.show !== null) return [];
    return OPS.map(([o, k]) => ({ key: 'mach', label: `${o}${ar(k)}`, kind: o === '×' ? '' : 'ghost', run: () => this.press(W, d, o, k) }));
  },
  async press(W, d, o, k) {
    const [a, b] = d.rounds[d.r], v = o === '×' ? a * k : a / k;
    d.show = v; sfx('engine'); changed(); await wait(700);
    if (Math.abs(v - b) < 1e-9) { say(MACH.x, MACH.y - 110, '✓ وصلت إلى الهدف', '#1FA05A', 1600); await wait(900); d.r++; d.show = null; changed();
      if (d.r >= d.rounds.length) await finish(W, 'powerOf10', [{ who: 'rashed', text: 'يدك أدق من يدي! الفاصلة تتحرك كما تريد تماماً.' }]); }
    else { sfx('cough'); puff(MACH.x + 20, MACH.y - 70, '#555', 8); say(MACH.x, MACH.y - 110, `خرج ${fmtNum(v)} والهدف ${fmtNum(b)}`, '#C2304A', 2400); await wait(1400); d.show = null; changed(); }
  },
  draw(d, t) {
    if (!d.rounds) return [];
    return [{ y: MACH.y, draw: c => {
      const [a, b] = d.rounds[Math.min(d.r, d.rounds.length - 1)];
      c.fillStyle = 'rgba(60,35,10,.22)'; c.fillRect(MACH.x - 50, MACH.y - 4, 100, 10);
      c.fillStyle = '#5E6B78'; rr(c, MACH.x - 46, MACH.y - 70, 92, 70, 10); c.fill();
      c.fillStyle = '#0E1A12'; rr(c, MACH.x - 36, MACH.y - 60, 72, 24, 5); c.fill();
      c.fillStyle = '#6EF5A0'; c.font = '900 15px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(fmtNum(d.show !== null && d.show !== undefined ? d.show : a), MACH.x, MACH.y - 42);
      c.save(); c.translate(MACH.x - 26, MACH.y - 18); c.rotate(t * 2); c.fillStyle = '#C9A24A'; for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.fillRect(-2, -10, 4, 6); } c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill(); c.restore();
      bubble(c, MACH.x, MACH.y - 92, `الهدف: ${fmtNum(b)}`, '#2A1B66');
    } }];
  }
};

/* ═══ ١٠. المتتاليات — «حجارة البركة» ═══ */
export const POND = { x: 560, y: 1470, w: 500, h: 170 };
const COLS = [700, 810, 920], ROWS = [1497, 1529, 1561, 1593, 1625], BANK_N = { x: 810, y: 1452 }, BANK_S = { x: 810, y: 1668 };
export const sequences = {
  id: 'sequences', giver: 'yousef',
  intro: n => [
    { who: 'yousef', text: `يا ${n}! في وسط بركة الجنوب حجارة عليها أرقام، وصندوق كنز على الضفة الأخرى.` },
    { who: 'yousef', text: 'الحجارة الآمنة تكمل نمط الأرقام المكتوب على اللوحة، والباقية تغطس. اقفز صفاً صفاً حتى تعبر!' }
  ],
  begin(d) {
    const kind = R(0, 2); let seq;
    if (kind === 0) { const s = R(2, 9), k = R(3, 9); seq = Array.from({ length: 8 }, (_, i) => s + k * i); }
    else if (kind === 1) { const s = R(60, 90), k = R(3, 7); seq = Array.from({ length: 8 }, (_, i) => s - k * i); }
    else { const s = R(1, 3); seq = Array.from({ length: 8 }, (_, i) => s * 2 ** i); }
    d.seq = seq; d.rows = seq.slice(3).map(v => { const opts = shuffle([v, v + R(1, 3), v - R(1, 3) || v + 4]); return { opts, ok: opts.indexOf(v) }; });
    d.row = -1; d.crossing = false; d.slips = 0;
  },
  goal: d => d.crossing ? '🪨 اقفز على الحجر الذي يكمل النمط' : '🪨 اذهب إلى ضفة البركة وابدأ العبور',
  target: d => d.crossing ? null : BANK_N,
  taps: d => d.crossing ? (d.row + 1 < 5 ? COLS.map((x, k) => ({ x, y: ROWS[d.row + 1], hit: 24, approach: null, stone: k })) : []) : [{ x: BANK_N.x, y: BANK_N.y - 10, hit: 40, approach: { x: BANK_N.x, y: BANK_N.y } }],
  actions(W, d) {
    if (!d.crossing && near(W, BANK_N, 46)) return [{ key: 'bank', label: '🪨 ابدأ العبور', kind: 'go', run: () => { d.crossing = true; d.row = -1; W.player.x = BANK_N.x; W.player.y = BANK_N.y; W.stones = true; changed(); } }];
    if (d.crossing && d.row + 1 < 5) return COLS.map((x, k) => ({ key: 'stone' + (d.row + 1), label: `🪨 ${ar(d.rows[d.row + 1].opts[k])}`, run: () => this.jump(W, d, k) }));
    return [];
  },
  async jump(W, d, k) {
    if (game.busy) return; game.busy = true;
    const r = d.row + 1, to = { x: COLS[k], y: ROWS[r] }, from = { x: W.player.x, y: W.player.y };
    for (let i = 1; i <= 8; i++) { W.player.x = from.x + (to.x - from.x) * i / 8; W.player.y = from.y + (to.y - from.y) * i / 8 - Math.sin(i / 8 * Math.PI) * 18; await wait(30); }
    if (k === d.rows[r].ok) {
      d.row = r; sfx('pick');
      if (r === 4) { await wait(300); for (let i = 1; i <= 8; i++) { W.player.y = ROWS[4] + (BANK_S.y - ROWS[4]) * i / 8; await wait(30); } W.player.x = BANK_S.x; W.stones = false; d.crossing = false; game.busy = false; changed();
        await finish(W, 'sequences', [{ who: 'narrator', text: `عبرتَ البركة! النمط كان: ${d.seq.map(ar).join('، ')}… وفُتح صندوق الكنز.` }], 50); return; }
    } else {
      sfx('cough'); puff(to.x, to.y, '#7cc8ff', 10); say(to.x, to.y - 50, 'غطس الحجر!', '#C2304A', 1600); d.slips++;
      await wait(700); W.player.x = BANK_N.x; W.player.y = BANK_N.y; d.row = -1;
    }
    game.busy = false; changed();
  },
  ground(c, d, active, done, t) {   // بركة بحافة حجرية مرتفعة، ماء أعمق في الوسط، قصب وزنبق، وحجارة قفز مجسّمة (الرسم فقط)
    const P = POND;
    sprite(c, 'pond', P.x - 12, P.y - 12, P.w + 24, P.h + 30, k => {
      k.fillStyle = shade(PAL.stone, -30); rr(k, P.x - 8, P.y - 2, P.w + 16, P.h + 14, 36); k.fill();
      k.fillStyle = PAL.stone; rr(k, P.x - 8, P.y - 8, P.w + 16, P.h + 14, 36); k.fill();
      const g = k.createRadialGradient(P.x + P.w / 2, P.y + P.h / 2, 10, P.x + P.w / 2, P.y + P.h / 2, P.w / 2); g.addColorStop(0, '#1F6E9E'); g.addColorStop(1, '#4FB3D9');
      k.fillStyle = g; rr(k, P.x, P.y, P.w, P.h, 30); k.fill();
      k.fillStyle = shade(PAL.stone, -38); k.fillRect(P.x + 26, P.y, P.w - 52, 8);   // وجه الحافة الشمالية داخل الماء
      [[P.x + 20, P.y + 30], [P.x + P.w - 30, P.y + 40], [P.x + 30, P.y + P.h - 26], [P.x + P.w - 26, P.y + P.h - 30]].forEach(([x, y]) => { k.strokeStyle = '#5E7A34'; k.lineWidth = 1.6; for (let i = -2; i <= 2; i++) { k.beginPath(); k.moveTo(x + i * 3, y + 8); k.quadraticCurveTo(x + i * 4, y - 6, x + i * 5, y - 16); k.stroke(); } });   // قصب
      [[P.x + 80, P.y + 120], [P.x + 400, P.y + 40], [P.x + 440, P.y + 130]].forEach(([x, y]) => { k.fillStyle = PAL.leaf; k.beginPath(); k.arc(x, y, 9, .4, Math.PI * 2 - .1); k.lineTo(x, y); k.fill(); k.fillStyle = '#F2A7C3'; k.beginPath(); k.arc(x + 3, y - 2, 3, 0, 7); k.fill(); });   // زنبق
      k.strokeStyle = INK; k.lineWidth = 1; rr(k, P.x - 8, P.y - 8, P.w + 16, P.h + 14, 36); k.stroke();
    });
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const x = P.x + 50 + i * 72 + (t * 16 % 26), y = P.y + 30 + (i % 3) * 46; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 9, y - 3, x + 18, y); c.stroke(); }
    if (!d.rows) return;
    signboard(c, BANK_N.x, BANK_N.y - 30, `${d.seq.slice(0, 3).map(ar).join('، ')}، …`);
    d.rows.forEach((row, r) => COLS.forEach((x, k) => {   // صخرة مجسّمة: جانب داكن ثم سطح فاتح، والرقم عليها
      const passed = r <= d.row && k === row.ok, y = ROWS[r];
      c.fillStyle = 'rgba(0,30,50,.25)'; c.beginPath(); c.ellipse(x + 3, y + 6, 27, 9, 0, 0, 7); c.fill();
      c.fillStyle = passed ? '#7E6E54' : '#8C7D62'; c.beginPath(); c.ellipse(x, y + 3, 26, 11, 0, 0, 7); c.fill();
      c.fillStyle = passed ? '#A8977A' : '#C4B497'; c.beginPath(); c.ellipse(x, y - 1, 24, 9.5, 0, 0, 7); c.fill();
      c.strokeStyle = INK; c.lineWidth = .8; c.beginPath(); c.ellipse(x, y + 1, 26, 11, 0, 0, 7); c.stroke();
      c.fillStyle = '#3A2E1E'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(ar(row.opts[k]), x, y + 3);
    }));
    // صندوق الكنز على الضفة الجنوبية: يُفتح ويلمع بعد العبور
    const bx = BANK_S.x + 53, by = BANK_S.y + 4;
    c.fillStyle = '#7A4A2A'; rr(c, bx - 13, by - 14, 26, 14, 2); c.fill(); c.fillStyle = done ? '#FFC23D' : '#9C6438'; rr(c, bx - 13, by - 22, 26, 9, 4); c.fill();
    c.fillStyle = '#E3B04B'; c.fillRect(bx - 2, by - 16, 4, 6); c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(bx - 13, by - 22, 26, 22);
    if (done) { c.fillStyle = 'rgba(255,215,90,.5)'; c.beginPath(); c.arc(bx, by - 22, 10 + Math.sin(t * 4) * 2, 0, 7); c.fill(); }
  }
};

export const UNIT1 = { placeValue, compareRound, factorsMultiples, oddEven, primeNumbers, powerOf10, sequences };
