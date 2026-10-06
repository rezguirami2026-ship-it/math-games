// الفصل الثاني — الوحدة ٢ (معالجة البيانات) في «ساحة المهرجان»: الرسم والقطاعات والمتوسط والاستبيان والاحتمال
import { game } from '../core/state.js';
import { ar, wait, rr, clamp } from '../core/util.js';
import { say, bubble } from '../world/entities.js';
import { sfx } from '../core/sound.js';
import { drawHuman } from '../character/human.js';
import { R, shuffle, near, changed, finish, panel, sheetOpen, sheetClose, hiDPI, msgBox, setMsg, btn, numPad } from './bench.js';
import { ST6, PIEFIELD, PALMS6, VISITORS } from '../world/festival.js';

const at = (st, key, label) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 40, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return near(W, { x: st.x, y: st.y + 16 }, 50) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; }
});
const step = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;
const COLS = ['#2E8B57', '#FFC23D', '#4DABF7'];

/* ═══ ٤٢. الجداول والرسومات البيانية — «لوح الرحلة» ═══ */
function graphFrame(c, maxD) {
  const X = t => 40 + t * 52, Y = v => 196 - v / maxD * 170;
  c.clearRect(0, 0, 320, 220); c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, 320, 220);
  c.strokeStyle = 'rgba(42,27,102,.12)'; c.lineWidth = 1;
  for (let v = 0; v <= maxD; v += maxD / 10) { c.beginPath(); c.moveTo(X(0), Y(v)); c.lineTo(X(5), Y(v)); c.stroke(); }
  for (let t = 0; t <= 5; t++) { c.beginPath(); c.moveTo(X(t), Y(0)); c.lineTo(X(t), Y(maxD)); c.stroke(); }
  c.strokeStyle = '#2A1B66'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(0), Y(maxD)); c.lineTo(X(0), Y(0)); c.lineTo(X(5) + 6, Y(0)); c.stroke();
  c.fillStyle = '#2A1B66'; c.font = '800 10px Cairo, sans-serif'; c.textAlign = 'center';
  for (let t = 0; t <= 5; t++) c.fillText(ar(t), X(t), Y(0) + 13);
  c.textAlign = 'right'; for (let v = 0; v <= maxD; v += maxD / 5) c.fillText(ar(v), X(0) - 4, Y(v) + 3);
  c.textAlign = 'center'; c.fillText('الزمن (ساعات)', X(2.5), 218); c.save(); c.translate(10, Y(maxD / 2)); c.rotate(-Math.PI / 2); c.fillText('المسافة (كم)', 0, 0); c.restore();
  return { X, Y };
}
export const lineGraphs = Object.assign({
  id: 'lineGraphs', giver: 'hamid',
  intro: n => [{ who: 'hamid', text: `أهلاً يا ${n}! أنا حامد سائق حافلة المهرجان. حافلتي تسير بسرعة ثابتة.` },
    { who: 'hamid', text: 'ارسم رحلتي على اللوح من الجدول، ثم اقرأ من الرسم ما يسألك عنه الركاب.' }],
  begin(d) { const s = [30, 40, 50, 60][R(0, 3)], s2 = [40, 50, 60][R(0, 2)], t2 = R(2, 4), k3 = R(2, 5); d.rounds = [{ t: 'plot', s }, { t: 'read', s: s2, ask: 'd', at: t2, ans: s2 * t2 }, { t: 'read', s: s2, ask: 't', at: s2 * k3, ans: k3 }]; d.r = 0; d.pts = {}; },
  goal: d => `📈 ارسم رحلة الحافلة واقرأها ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], maxD = r.s * 5;
    if (r.t === 'plot') {
      sheetOpen(`<h3>📈 لوح الرحلة</h3><table class="tt"><tr><th>الزمن (س)</th>${[1, 2, 3, 4, 5].map(t => `<td>${ar(t)}</td>`).join('')}</tr><tr><th>المسافة (كم)</th>${[1, 2, 3, 4, 5].map(t => `<td>${ar(r.s * t)}</td>`).join('')}</tr></table>
        ${msgBox(msg || 'اضغط على الرسم لتضع نقطة كل ساعة في مكانها، ثم ارسم الخط', kind)}<canvas id="gr" width="320" height="222" style="touch-action:none"></canvas>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📈 ارسم الخط</button></div>`);
      const cv = panel().querySelector('#gr'), c = hiDPI(cv);
      const draw = () => { const { X, Y } = graphFrame(c, maxD); const ps = [0, 1, 2, 3, 4, 5].filter(t => d.pts[t] !== undefined || t === 0);
        c.fillStyle = '#E2475C'; ps.forEach(t => { const v = t === 0 ? 0 : d.pts[t]; c.beginPath(); c.arc(X(t), Y(v), 5, 0, 7); c.fill(); }); };
      draw();
      cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; const t = Math.round((x - 40) / 52); if (t < 1 || t > 5) return;
        const v = clamp(Math.round(((196 - y) / 170 * maxD) / (maxD / 10)) * (maxD / 10), 0, maxD); d.pts[t] = v; sfx('click'); draw(); });
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { const bad = [1, 2, 3, 4, 5].filter(t => d.pts[t] !== r.s * t).length;
        if (!bad) { sfx('win'); d.r++; d.pts = {}; changed(); this.open(W, d, '✓ الرسم مطابق للجدول! الآن اقرأ رسم رحلة أخرى…', 'ok'); }
        else { sfx('cough'); setMsg(`${ar(bad)} من النقاط ليست في مكانها حسب الجدول`, 'bad'); } });
    } else {
      sheetOpen(`<h3>📈 رحلة أخرى</h3>${msgBox((msg ? msg + ' ' : '') + (r.ask === 'd' ? `كم كيلومتراً قطعت الحافلة بعد <b>${ar(r.at)}</b> ساعات؟` : `بعد كم ساعة قطعت الحافلة <b>${ar(r.at)}</b> كيلومتراً؟`), kind)}<canvas id="gr" width="320" height="222"></canvas><div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
      const c = hiDPI(panel().querySelector('#gr')), { X, Y } = graphFrame(c, maxD);
      c.strokeStyle = '#E2475C'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(5), Y(maxD)); c.stroke();
      const pad = numPad(panel().querySelector('#pad'), r.ask === 'd' ? 'الجواب (كم)' : 'الجواب (ساعات)', async v => { if (v === r.ans) { sfx('win'); d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'lineGraphs', [{ who: 'hamid', text: 'تقرأ الرسم الخطي كالسائق الخبير! الركاب يعرفون مواعيدهم الآن.' }]); } else this.open(W, d, '✓ صحيح!', 'ok'); } else { sfx('cough'); pad.clear(); setMsg('القراءة غير صحيحة، تتبّع الخط من المحور إلى الآخر', 'bad'); } }, { dot: false });
      btn('benchOut', () => { sheetClose(); changed(); });
    }
  },
  draw(d, t, active, done) { return done ? [{ y: ST6.graph.y + 30, draw: c => bubble(c, ST6.graph.x, ST6.graph.y - 146, '✓', '#1FA05A') }] : []; }
}, at(ST6.graph, 'graph', '📈 لوح الرحلة'));

/* ═══ ٤٣. المخططات الدائرية — «تقسيم الأرض» ═══ */
const NAMES = ['النخيل', 'الخضروات', 'البرسيم'];
const FR = [[50, 25, 25, 'نصف الأرض نخيل، وربعها خضروات، والباقي برسيم'], [25, 50, 25, 'ربع الأرض نخيل، ونصفها خضروات، والباقي برسيم'], [20, 30, 50, 'خُمس الأرض نخيل، و٣ من ١٠ منها خضروات، والباقي برسيم'], [40, 35, 25, 'خُمسا الأرض نخيل، وربعها برسيم، والباقي خضروات']];
const AN = [[180, 108, 72], [90, 162, 108], [144, 126, 90], [216, 72, 72]];
function drawPie(c, cx, cy, rad, pcts) {
  let a = -Math.PI / 2; const tot = pcts.reduce((x, y) => x + y, 0);
  pcts.forEach((p, i) => { const s = p / 100 * 2 * Math.PI; c.fillStyle = COLS[i]; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, rad, a, a + s); c.closePath(); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); a += s; });
  if (tot < 100) { c.fillStyle = '#E8DCC0'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, rad, a, -Math.PI / 2 + 2 * Math.PI); c.closePath(); c.fill(); }
}
export const pieCharts = Object.assign({
  id: 'pieCharts', giver: 'sara',
  intro: n => [{ who: 'sara', text: `مرحباً يا ${n}! أنا سارة المهندسة الزراعية. الحقل الدائري يُقسّم قطاعات.` },
    { who: 'sara', text: 'اضبط نسبة كل قطاع كما في الخطة، فالحقل كله ١٠٠٪، والدائرة كلها ٣٦٠°.' }],
  begin(d) { const f = FR[R(0, 3)], an = AN[R(0, 3)], N = [200, 400, 300][R(0, 2)], p = [15, 35, 45, 65][R(0, 3)];
    d.rounds = [{ t: 'f', ans: f.slice(0, 3), text: f[3] }, { t: 'a', ans: an.map(a => Math.round(a / 3.6)), text: `قطاع النخيل زاويته ${ar(an[0])}°، والخضروات ${ar(an[1])}°، والبرسيم ${ar(an[2])}°.` }, { t: 'n', N, p, ans: N * p / 100 }]; d.r = 0; d.p = [0, 0, 0]; },
  goal: d => `🥧 قسّم الحقل الدائري ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t !== 'n') {
      sheetOpen(`<h3>🥧 خطة الحقل</h3>${msgBox(msg || r.text + ' اضبط نسبة كل قطاع.', kind)}<canvas id="pie" width="300" height="150"></canvas>
        ${NAMES.map((nm, i) => `<div class="cnt"><span style="color:${COLS[i]}">● ${nm}</span><button class="act ghost" data-i="${i}" data-v="-5">−٥٪</button><b id="pv${i}">${ar(d.p[i])}٪</b><button class="act ghost" data-i="${i}" data-v="5">+٥٪</button></div>`).join('')}
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🌱 ازرع القطاعات</button></div>`);
      const c = hiDPI(panel().querySelector('#pie')); const draw = () => { c.clearRect(0, 0, 300, 150); drawPie(c, 150, 75, 68, d.p); };
      draw();
      panel().querySelectorAll('[data-i]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i; d.p[i] = clamp(d.p[i] + +b.dataset.v, 0, 100); panel().querySelector('#pv' + i).textContent = ar(d.p[i]) + '٪'; sfx('click'); draw(); });
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { const tot = d.p.reduce((a, b) => a + b, 0);
        if (tot !== 100) { sfx('cough'); setMsg(tot < 100 ? 'بقي جزء من الحقل بلا زراعة! المجموع يجب أن يكون ١٠٠٪' : 'القطاعات أكبر من الحقل! المجموع يجب أن يكون ١٠٠٪', 'bad'); return; }
        const k = d.p.findIndex((v, i) => v !== r.ans[i]);
        if (k >= 0) { sfx('cough'); setMsg(`قطاع ${NAMES[k]} لا يطابق الخطة`, 'bad'); return; }
        sfx('win'); d.r++; d.p = [0, 0, 0]; changed(); this.open(W, d, '✓ الحقل مقسّم كما في الخطة!', 'ok'); });
    } else {
      sheetOpen(`<h3>🥧 شتلات الليمون</h3>${msgBox(msg || `زرعنا <b>${ar(r.N)}</b> شتلة، و<b>${ar(r.p)}٪</b> منها شتلات ليمون. كم شتلة ليمون زرعنا؟`, kind)}<canvas id="pie" width="300" height="150"></canvas><div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
      const c = hiDPI(panel().querySelector('#pie')); drawPie(c, 150, 75, 68, [r.p, 100 - r.p, 0]);
      const pad = numPad(panel().querySelector('#pad'), '🌱 عدد الشتلات', async v => { if (v === r.ans) { sfx('win'); d.r++; changed(); sheetClose(); await finish(W, 'pieCharts', [{ who: 'sara', text: 'الحقل الدائري مزروع بنسبه الصحيحة! انظر إلى ألوانه.' }]); } else { sfx('cough'); pad.clear(); setMsg(`ليس ${v}. احسب ${ar(r.p)}٪ من ${ar(r.N)}`, 'bad'); } }, { dot: false });
      btn('benchOut', () => { sheetClose(); changed(); });
    }
  },
  ground(c, d, active, done) { if (!done) return; const P = PIEFIELD, ans = d.rounds ? d.rounds[0].ans : [50, 25, 25]; let a = -Math.PI / 2; ans.forEach((p, i) => { const s = p / 100 * 2 * Math.PI; c.fillStyle = COLS[i]; c.beginPath(); c.moveTo(P.x, P.y); c.arc(P.x, P.y, P.r - 4, a, a + s); c.closePath(); c.fill(); a += s; }); }
}, at(ST6.pie, 'pie', '🥧 خطة الحقل'));

/* ═══ ٤٤. المتوسط الإحصائي — «موسم الحصاد» ═══ */
export const statsAverage = Object.assign({
  id: 'statsAverage', giver: 'khalfan',
  intro: n => [{ who: 'khalfan', text: `حيّاك يا ${n}! أنا خلفان صاحب النخيل. حصاد السلال غير متساوٍ.` },
    { who: 'khalfan', text: 'وزّع التمر بين السلال حتى تتساوى كلها، فالعدد الذي تتساوى عنده هو المتوسط. ثم احسب متوسطات المحصول.' }],
  begin(d) { const m = R(4, 7), dv = shuffle([-3, -1, 0, 2, 2]); const v2 = [R(38, 52), R(38, 52), R(38, 52)]; const s2 = v2.reduce((a, b) => a + b, 0); const last2 = 4 * R(42, 48) - s2;
    const m3 = R(36, 45), v3 = [R(30, 50), R(30, 50), R(30, 50), R(30, 50)], x3 = 5 * m3 - v3.reduce((a, b) => a + b, 0);
    d.rounds = [{ t: 'eq', start: dv.map(x => m + x), m }, { t: 'mean', vals: v2.concat([last2]), ans: (s2 + last2) / 4 }, { t: 'miss', m: m3, vals: v3, ans: x3 }];
    if (d.rounds[1].vals[3] < 20 || d.rounds[1].vals[3] > 70 || x3 < 10 || x3 > 80) return this.begin(d);
    d.r = 0; d.bk = d.rounds[0].start.slice(); d.hand = -1; },
  goal: d => `🧺 حصاد النخيل ومتوسطه ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'eq') {
      sheetOpen(`<h3>🧺 سلال التمر</h3>${msgBox(msg || 'اضغط سلة لتأخذ منها تمرة، ثم اضغط سلة أخرى لتضعها فيها، حتى تتساوى السلال الخمس', kind)}<canvas id="bk" width="320" height="170" style="touch-action:none"></canvas>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🧺 تساوت السلال</button></div>`);
      const cv = panel().querySelector('#bk'), c = hiDPI(cv), X = i => 34 + i * 63;
      const draw = () => { c.clearRect(0, 0, 320, 170); d.bk.forEach((n, i) => { c.fillStyle = d.hand === i ? '#FFE7A0' : '#C98A3A'; rr(c, X(i) - 24, 128, 48, 30, 6); c.fill(); for (let k = 0; k < n; k++) { c.fillStyle = '#7A3E12'; c.beginPath(); c.ellipse(X(i) - 8 + (k % 2) * 16, 122 - Math.floor(k / 2) * 11, 7, 5, 0, 0, 7); c.fill(); } });
        if (d.hand >= 0) { c.fillStyle = '#2A1B66'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText('تمرة بيدك ✋', 160, 14); } };
      draw();
      cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), i = Math.round((e.clientX - b.left - 34) / 63); if (i < 0 || i > 4) return;
        if (d.hand < 0) { if (d.bk[i] > 0) { d.bk[i]--; d.hand = i; sfx('pick'); } } else { d.bk[i]++; d.hand = -1; sfx('drop'); } draw(); });
      btn('benchOut', () => { if (d.hand >= 0) { d.bk[d.hand]++; d.hand = -1; } sheetClose(); changed(); });
      btn('benchGo', async () => { if (d.hand < 0 && d.bk.every(v => v === d.bk[0])) { sfx('win'); d.r++; changed(); this.open(W, d, `✓ كل سلة فيها ${ar(r.m)}، وهذا هو المتوسط! الآن متوسط المحصول…`, 'ok'); } else { sfx('cough'); setMsg('السلال لم تتساوَ بعد', 'bad'); } });
    } else {
      const text = r.t === 'mean' ? `محصول ٤ نخلات: ${r.vals.map(ar).join('، ')} كغ. ما متوسط محصول النخلة؟` : `متوسط محصول ٥ نخلات ${ar(r.m)} كغ. محصول أربع منها: ${r.vals.map(ar).join('، ')} كغ. كم محصول الخامسة؟`;
      sheetOpen(`<h3>🧺 متوسط المحصول</h3>${msgBox(msg ? msg + ' ' + text : text, kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
      const pad = numPad(panel().querySelector('#pad'), '⚖️ الجواب (كغ)', async v => { if (v === r.ans) { sfx('win'); d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'statsAverage', [{ who: 'khalfan', text: 'عرفتَ المتوسط بالسلال وبالحساب! موسم حصاد مبارك.' }]); } else this.open(W, d, '✓ صحيح!', 'ok'); } else { sfx('cough'); pad.clear(); setMsg(r.t === 'mean' ? 'المتوسط = مجموع القيم ÷ عددها' : 'المجموع الكلي = المتوسط × العدد', 'bad'); } }, { dot: false });
      btn('benchOut', () => { sheetClose(); changed(); });
    }
  },
  draw(d, t, active, done) { return done ? PALMS6.map(p => ({ y: p.y + 14, x: p.x, draw: c => {   // سلة خوص ممتلئة تمراً عند كل نخلة
    const x = p.x + 4, y = p.y + 14;
    c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 3, y, 12, 3.5, 0, 0, 7); c.fill();
    c.fillStyle = '#5E2E10'; c.beginPath(); c.ellipse(x, y - 13, 10, 3.5, 0, 0, 7); c.fill(); c.fillStyle = '#8A4A1C'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x - 6 + k * 2.4, y - 14 - (k % 2) * 1.5, 2, 2.6, 0, 0, 7); c.fill(); }
    c.fillStyle = '#C98A3A'; c.beginPath(); c.moveTo(x - 10, y - 13); c.lineTo(x - 8, y); c.lineTo(x + 8, y); c.lineTo(x + 10, y - 13); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(110,60,20,.55)'; c.lineWidth = .8; [-9, -5, -1].forEach(o => { c.beginPath(); c.moveTo(x - 10, y + o); c.lineTo(x + 10, y + o); c.stroke(); }); c.strokeStyle = '#2B1E14'; c.lineWidth = .7; c.strokeRect(x - 10, y - 13, 20, 13);
  } })) : []; }
}, at(ST6.harvest, 'harvest', '🧺 سلال التمر'));

/* ═══ ٤٥. استخدام الإحصاء — «استبيان القرية» ═══ */
const GAMES3 = ['🎯 الرماية', '🏃 السباق', '🧩 الألغاز'];
const LOOK = [['#7B3F98', 'woman'], ['#F4F1E8', 'man'], ['#2E6E8E', 'boy'], ['#C0392B', 'girl'], ['#2E8B57', 'man'], ['#E3B04B', 'woman'], ['#F7F5EF', 'boy'], ['#8E3B5E', 'girl']];
export const usingStats = {
  id: 'usingStats', giver: 'noor',
  intro: n => [{ who: 'noor', text: `أهلاً يا ${n}! أنا نور، منظمة ألعاب المهرجان. نريد إضافة لعبة جديدة يحبها الزوار.` },
    { who: 'noor', text: 'اسأل الزوار الثمانية في الساحة عن لعبتهم المفضلة، ثم مثّل النتائج على لوح الاستبيان، واختر اللعبة الأنسب.' }],
  begin(d) { let c; do { c = Array.from({ length: 8 }, () => R(0, 2)); } while ((() => { const t = [0, 1, 2].map(k => c.filter(x => x === k).length), mx = Math.max(...t); return t.filter(x => x === mx).length > 1; })()); d.ans = c; d.asked = Array(8).fill(false); d.bars = [0, 0, 0]; d.stage = 'ask'; },
  goal: d => d.stage === 'ask' ? `📋 اسأل زوار الساحة عن لعبتهم المفضلة (${ar(d.asked.filter(Boolean).length)} من ${ar(8)})` : '📊 مثّل النتائج على لوح الاستبيان وقرّر',
  target: d => d.stage === 'ask' ? VISITORS.find((v, i) => !d.asked[i]) : ST6.survey,
  taps: d => VISITORS.map((v, i) => ({ x: v.x, y: v.y - 26, hit: 30, approach: { x: v.x, y: v.y + 24 } })).concat([{ x: ST6.survey.x, y: ST6.survey.y - 24, hit: 40, approach: { x: ST6.survey.x, y: ST6.survey.y + 22 } }]),
  actions(W, d) {
    const out = [];
    VISITORS.forEach((v, i) => { if (!d.asked[i] && near(W, { x: v.x, y: v.y + 10 }, 42)) out.push({ key: 'v' + i, label: '📋 اسأل الزائر', run: () => { d.asked[i] = true; sfx('talk'); say(v.x, v.y - 80, `أحب ${GAMES3[d.ans[i]]}`, '#2A1B66', 2400); if (d.asked.every(Boolean)) d.stage = 'chart'; changed(); } }); });
    if (near(W, { x: ST6.survey.x, y: ST6.survey.y + 16 }, 50)) out.push({ key: 'survey', label: '📊 لوح الاستبيان', kind: 'go', run: () => this.open(W, d), disabled: d.stage === 'ask' });
    return out;
  },
  open(W, d, msg, kind) {
    const tally = [0, 1, 2].map(k => d.ans.filter((x, i) => x === k && d.asked[i]).length);
    const marks = n => '<span class="tl">' + '|'.repeat(n).replace(/\|\|\|\|\|/g, '<s>||||</s> ') + '</span>';
    sheetOpen(`<h3>📊 لوح الاستبيان</h3><div class="clip">${GAMES3.map((g, k) => `<div><b>${g}</b>${marks(tally[k])}</div>`).join('')}</div>${msgBox(msg || 'مثّل علامات العدّ بأعمدة، ثم اعرض المخطط', kind)}
      <canvas id="bars" width="300" height="140"></canvas>${GAMES3.map((g, k) => `<div class="cnt"><span>${g}</span><button class="act ghost" data-k="${k}" data-v="-1">−</button><b id="bv${k}">${ar(d.bars[k])}</b><button class="act ghost" data-k="${k}" data-v="1">+</button></div>`).join('')}
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📊 اعرض المخطط</button></div>`);
    const c = hiDPI(panel().querySelector('#bars'));
    const draw = () => { c.clearRect(0, 0, 300, 140); c.strokeStyle = '#2A1B66'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, 10); c.lineTo(30, 120); c.lineTo(290, 120); c.stroke(); c.fillStyle = '#7A6A4A'; c.font = '800 10px Cairo, sans-serif'; c.textAlign = 'right'; for (let v = 0; v <= 8; v += 2) c.fillText(ar(v), 26, 124 - v * 13); d.bars.forEach((v, k) => { c.fillStyle = COLS[k]; c.fillRect(60 + k * 80, 120 - v * 13, 46, v * 13); }); };
    draw();
    panel().querySelectorAll('[data-k]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.k; d.bars[k] = clamp(d.bars[k] + +b.dataset.v, 0, 8); panel().querySelector('#bv' + k).textContent = ar(d.bars[k]); sfx('click'); draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', () => {
      const k = d.bars.findIndex((v, i) => v !== tally[i]);
      if (k >= 0) { sfx('cough'); setMsg(`عمود ${GAMES3[k]} لا يطابق علامات العدّ`, 'bad'); return; }
      sfx('win'); changed();
      sheetOpen(`<h3>📊 القرار</h3>${msgBox('المخطط جاهز. أي لعبة نضيفها للمهرجان؟ (الأكثر تكراراً هو المنوال)', 'ok')}<div class="row2">${GAMES3.map((g, k) => `<button class="act" data-pick="${k}">${g}</button>`).join('')}</div><button class="act ghost" id="benchOut">رجوع</button>`);
      panel().querySelectorAll('[data-pick]').forEach(b => b.onclick = async e => { e.stopPropagation(); const best = tally.indexOf(Math.max(...tally));
        if (+b.dataset.pick === best) { sheetClose(); await finish(W, 'usingStats', [{ who: 'noor', text: `قرار مبني على البيانات! سنضيف ${GAMES3[best]} لأنها اختيار أكثر الزوار.` }]); }
        else { sfx('cough'); setMsg('انظر إلى المخطط: أي عمود هو الأطول؟', 'bad'); } });
      btn('benchOut', () => { sheetClose(); changed(); });
    });
  },
  draw(d, t, active, done) {
    if (!d.ans) return [];
    return VISITORS.map((v, i) => ({ y: v.y, draw: c => { drawHuman(c, { x: v.x, y: v.y, kind: LOOK[i][1], robe: LOOK[i][0], accent: '#FFC23D', skin: ['#DDA779', '#B97F52', '#C98E5F'][i % 3], dir: 'down', s: .95 }); if (d.asked[i]) bubble(c, v.x, v.y - 74, '✓', '#1FA05A'); } }));
  }
};

/* ═══ ٤٦. لغة الاحتمال — «ألعاب المهرجان» ═══ */
const WORD = k => k === 0 ? 'مستحيلاً' : k <= 3 ? 'غير مرجّح' : k === 4 ? 'متساوي الاحتمال' : k <= 7 ? 'مرجّحاً' : 'مؤكداً';
const TASKS = [{ text: 'اجعل الوقوف على الأحمر متساوي الاحتمال مع الأزرق', ok: k => k === 4 }, { text: 'اجعل الوقوف على الأحمر غير مرجّح، لكن ليس مستحيلاً', ok: k => k >= 1 && k <= 3 },
  { text: 'اجعل الوقوف على الأحمر مرجّحاً، لكن ليس مؤكداً', ok: k => k >= 5 && k <= 7 }, { text: 'اجعل الوقوف على الأحمر مؤكداً', ok: k => k === 8 }, { text: 'اجعل الوقوف على الأحمر مستحيلاً', ok: k => k === 0 }];
export const probabilityLang = Object.assign({
  id: 'probabilityLang', giver: 'yaqoob',
  intro: n => [{ who: 'yaqoob', text: `أهلاً يا ${n}! أنا يعقوب صاحب كشك الدوّار. لكل جولة شرط في احتمال الأحمر.` },
    { who: 'yaqoob', text: 'لوّن قطاعات الدوّار الثمانية بالأحمر والأزرق حتى يحقق التلوين وصف الاحتمال المطلوب، ثم أدِره.' }],
  begin(d) { d.rounds = shuffle([0, 1, 2]).concat([R(3, 4)]).slice(0, 3); d.r = 0; d.red = Array(8).fill(false); d.rot = 0; },
  goal: d => `🎡 لوّن دوّار المهرجان ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const task = TASKS[d.rounds[d.r]];
    sheetOpen(`<h3>🎡 دوّار المهرجان</h3>${msgBox(msg || task.text + '. اضغط القطاعات لتلوينها.', kind)}<canvas id="sp" width="240" height="240" style="touch-action:none"></canvas>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🎡 أدِر الدوّار</button></div>`);
    const cv = panel().querySelector('#sp'), c = hiDPI(cv);
    const draw = () => { c.clearRect(0, 0, 240, 240); c.save(); c.translate(120, 124); c.rotate(d.rot); for (let i = 0; i < 8; i++) { c.fillStyle = d.red[i] ? '#E2475C' : '#4DABF7'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 100, i * Math.PI / 4, (i + 1) * Math.PI / 4); c.closePath(); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); } c.restore();
      c.fillStyle = '#2A1B66'; c.beginPath(); c.moveTo(120, 30); c.lineTo(110, 8); c.lineTo(130, 8); c.fill(); c.beginPath(); c.arc(120, 124, 8, 0, 7); c.fill(); };
    draw();
    cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), x = e.clientX - b.left - 120, y = e.clientY - b.top - 124; if (Math.hypot(x, y) > 100) return;
      let a = Math.atan2(y, x) - d.rot; a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); const i = Math.floor(a / (Math.PI / 4)); d.red[i] = !d.red[i]; sfx('click'); draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const k = d.red.filter(Boolean).length, t0 = performance.now(); sfx('engine');
      await new Promise(res => { const spin = now => { const p = Math.min(1, (now - t0) / 1200); d.rot += (1 - p) * .35; draw(); if (p < 1 && document.getElementById('sp')) requestAnimationFrame(spin); else res(); }; requestAnimationFrame(spin); });
      if (task.ok(k)) { sfx('win'); d.r++; d.red = Array(8).fill(false); changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'probabilityLang', [{ who: 'yaqoob', text: 'تتكلم لغة الاحتمال بطلاقة! الدوّار جاهز للزوار.' }]); } else this.open(W, d, `✓ مضبوط! ${TASKS[d.rounds[d.r]].text}.`, 'ok'); }
      else { sfx('cough'); setMsg(`بهذا التلوين (${ar(k)} من ${ar(8)} أحمر) يكون الأحمر ${WORD(k)}. ${task.text}.`, 'bad'); }
    });
  },
  draw(d, t, active, done) { return done ? [{ y: ST6.spinner.y + 30, draw: c => bubble(c, ST6.spinner.x, ST6.spinner.y - 156, '✓', '#1FA05A') }] : []; }
}, at(ST6.spinner, 'spinner', '🎡 دوّار المهرجان'));

export const T2U2 = { lineGraphs, pieCharts, statsAverage, usingStats, probabilityLang };
