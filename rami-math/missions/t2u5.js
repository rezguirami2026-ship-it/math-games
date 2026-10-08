// الفصل الثاني — الوحدة ٥ (الهندسة) في «ورشة البنّاء»: آخر خمسة دروس، وبها تكتمل الدروس الـ٦٩
import { ar, wait, rr, clamp } from '../core/util.js';
import { bubble } from '../world/entities.js';
import { sfx } from '../core/sound.js';
import { R, shuffle, near, changed, sg, finish, panel, sheetOpen, sheetClose, hiDPI, msgBox, setMsg, btn, numPad, counters } from './bench.js';
import { ST9 } from '../world/workshop.js';
import { drawSolid } from './unit3.js';

const at = (st, key, label) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 44, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return near(W, { x: st.x, y: st.y + 16 }, 52) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; },
  draw(d, t, active, done) { return done ? [{ y: st.y + 30, draw: c => bubble(c, st.x, st.y - 160, '✓', '#1FA05A') }] : []; }
});
const step = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;
async function advance(mod, W, d, n, id, lines) { sfx('win'); d.r++; changed(); if (d.r >= n) { sheetClose(); await finish(W, id, lines, 50); } else mod.open(W, d, '✓ أحسنت!', 'ok'); }
const pt = (x, y) => `(${sg(x)}، ${sg(y)})`;

/* ═══ ٦٥. تصنيف الأشكال — «بلاط حمود» ═══ */
const QUADS = {
  sq: { n: 'مربع', p: [[16, 8], [48, 8], [48, 40], [16, 40]], eq: 1, rt: 1, two: 1, one: 0 },
  rect: { n: 'مستطيل', p: [[6, 12], [58, 12], [58, 38], [6, 38]], eq: 0, rt: 1, two: 1, one: 0 },
  rh: { n: 'معيّن', p: [[32, 4], [54, 24], [32, 44], [10, 24]], eq: 1, rt: 0, two: 1, one: 0 },
  para: { n: 'متوازي أضلاع', p: [[16, 10], [60, 10], [48, 38], [4, 38]], eq: 0, rt: 0, two: 1, one: 0 },
  trap: { n: 'شبه منحرف', p: [[20, 10], [44, 10], [58, 38], [6, 38]], eq: 0, rt: 0, two: 0, one: 1 },
  kite: { n: 'طائرة ورقية', p: [[32, 4], [48, 18], [32, 44], [16, 18]], eq: 0, rt: 0, two: 0, one: 0 },
  irr: { n: 'رباعي عام', p: [[10, 12], [50, 6], [58, 40], [18, 34]], eq: 0, rt: 0, two: 0, one: 0 }
};
const RULES = [{ t: 'اختر كل بلاطة أضلاعها الأربعة متساوية', ok: q => q.eq }, { t: 'اختر كل بلاطة زواياها الأربع قائمة', ok: q => q.rt },
  { t: 'اختر كل بلاطة فيها زوج واحد فقط من الأضلاع المتوازية', ok: q => q.one }, { t: 'اختر كل بلاطة كل ضلعين متقابلين فيها متوازيان', ok: q => q.two }];
const quadSvg = k => `<svg viewBox="0 0 64 48" style="width:64px;height:48px"><polygon points="${QUADS[k].p.map(p => p.join(',')).join(' ')}" fill="#9CC9F5" stroke="#2A1B66" stroke-width="2"/></svg>`;
export const classifyShapes = Object.assign({
  id: 'classifyShapes', giver: 'hamood',
  intro: n => [{ who: 'hamood', text: `أهلاً يا ${n}! أنا حمود معلم البلاط. أزيّن صحن المسجد ببلاطات رباعية.` },
    { who: 'hamood', text: 'كل صف في الزخرفة يحتاج بلاطات بخاصية معينة. اختر كل البلاطات التي تحققها، ولا شيء غيرها.' }],
  begin(d) { d.rounds = shuffle([0, 1, 2, 3]).slice(0, 3).map(k => ({ k, tiles: shuffle(Object.keys(QUADS)) })); d.r = 0; d.sel = []; },
  goal: d => `🕌 صنّف بلاطات المسجد ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], rule = RULES[r.k];
    sheetOpen(`<h3>🕌 بلاط المسجد</h3>${msgBox(msg ? `${msg} ${rule.t}` : rule.t, kind)}<div class="stones quads">${r.tiles.map((k, i) => `<button class="stone ${d.sel.includes(i) ? 'on' : ''}" data-i="${i}">${quadSvg(k)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🕌 ركّب الصف</button></div>`);
    panel().querySelectorAll('.stone').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else d.sel.push(i); b.classList.toggle('on'); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const bad = d.sel.map(i => r.tiles[i]).filter(k => !rule.ok(QUADS[k])), miss = r.tiles.filter((k, i) => rule.ok(QUADS[k]) && !d.sel.includes(i));
      if (!bad.length && !miss.length) { d.sel = []; await advance(this, W, d, 3, 'classifyShapes', [{ who: 'hamood', text: 'زخرفة متقنة! تعرف خصائص كل رباعي: المربع مستطيل ومعيّن معاً.' }]); }
      else { sfx('cough'); setMsg(bad.length ? `«${QUADS[bad[0]].n}» لا يحقق الشرط. ${rule.t}` : `بقيت بلاطة «${QUADS[miss[0]].n}» تحقق الشرط ولم تخترها. ${rule.t}`, 'bad'); }
    });
  }
}, at(ST9.tiles, 'tiles', '🕌 لوح البلاط'));

/* ═══ ٦٦. تحويل المضلعات — «علم آمنة» (المستوى الإحداثي بأرباعه) ═══ */
function triIn(xr, yr) { for (;;) { const s = [0, 1, 2].map(() => [R(xr[0], xr[1]), R(yr[0], yr[1])]); const a = s[0][0] * (s[1][1] - s[2][1]) + s[1][0] * (s[2][1] - s[0][1]) + s[2][0] * (s[0][1] - s[1][1]); if (Math.abs(a) >= 4 && new Set(s.map(p => p.join())).size === 3) return s; } }
export const transformPolygons = Object.assign({
  id: 'transformPolygons', giver: 'amna',
  intro: n => [{ who: 'amna', text: `مرحباً يا ${n}! أنا آمنة، أخيط علم القرية الجديد على قماش مخطط بمحورين.` },
    { who: 'amna', text: 'كل نقطة لها زوج مرتّب (س، ص). ضع رؤوس الأشكال في أماكنها بعد كل تحويل، فالتحويل يغيّر الموضع ولا يغيّر الشكل.' }],
  begin(d) {
    const x1 = -R(1, 4), x2 = R(1, 4), y1 = R(1, 3), y2 = -R(1, 3);
    const vx = R(2, 4) * (R(0, 1) ? 1 : -1), vy = R(1, 3) * (R(0, 1) ? 1 : -1);
    const s2 = triIn(vx > 0 ? [-5, 1 - vx + 0] : [-1 - vx, 5], vy > 0 ? [-4, 4 - vy] : [-4 - vy, 4]);
    const ax = R(0, 1), s3 = ax ? triIn([1, 5], [-4, 4]) : triIn([-5, 5], [1, 4]);
    d.rounds = [{ t: 'rect', shape: [[x1, y1], [x2, y1], [x2, y2]], image: [[x1, y2]], text: `ثلاثة رؤوس لمستطيل العلم: ${pt(x1, y1)} و${pt(x2, y1)} و${pt(x2, y2)}. ضع الرأس الرابع.` },
      { t: 'tr', shape: s2, image: s2.map(([x, y]) => [x + vx, y + vy]), text: `انقل المثلث ${ar(Math.abs(vx))} وحدات ${vx > 0 ? 'يميناً' : 'يساراً'} و${ar(Math.abs(vy))} ${vy > 0 ? 'إلى الأعلى' : 'إلى الأسفل'}. ضع رؤوس صورته.` },
      { t: 'ref', ax, shape: s3, image: s3.map(([x, y]) => ax ? [-x, y] : [x, -y]), text: `اعكس المثلث في ${ax ? 'محور الصادات (ص)' : 'محور السينات (س)'}. ضع رؤوس صورته.` }];
    d.r = 0; d.pts = [];
  },
  goal: d => `🚩 ارسم شكل علم القرية على المستوى الإحداثي ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], U = 24, O = { x: 150, y: 116 };
    sheetOpen(`<h3>🚩 قماش العلم</h3>${msgBox(msg ? `${msg} ${r.text}` : r.text, kind)}<canvas id="cp" width="300" height="236" style="touch-action:none"></canvas>
      <div class="row2"><button class="act ghost" id="cpClear">↺ امسح</button><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ تحقّق</button></div>`);
    const cv = panel().querySelector('#cp'), c = hiDPI(cv), X = x => O.x + x * U, Y = y => O.y - y * U;
    const draw = () => {
      c.clearRect(0, 0, 300, 236); c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, 300, 236);
      c.strokeStyle = 'rgba(42,27,102,.12)'; c.lineWidth = 1; for (let x = -5; x <= 5; x++) { c.beginPath(); c.moveTo(X(x), Y(4)); c.lineTo(X(x), Y(-4)); c.stroke(); } for (let y = -4; y <= 4; y++) { c.beginPath(); c.moveTo(X(-5), Y(y)); c.lineTo(X(5), Y(y)); c.stroke(); }
      c.strokeStyle = '#2A1B66'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(-5.4), Y(0)); c.lineTo(X(5.4), Y(0)); c.moveTo(X(0), Y(-4.4)); c.lineTo(X(0), Y(4.4)); c.stroke();
      c.fillStyle = '#2A1B66'; c.font = '800 9px Cairo, sans-serif'; c.textAlign = 'center'; for (let x = -5; x <= 5; x++) if (x) c.fillText(ar(x), X(x), Y(0) + 11); for (let y = -4; y <= 4; y++) if (y) c.fillText(ar(y), X(0) - 9, Y(y) + 3);
      c.font = '900 11px Cairo, sans-serif'; c.fillText('س', X(5.4), Y(0) - 6); c.fillText('ص', X(0) + 9, Y(4.4) + 4);
      c.fillStyle = 'rgba(192,57,43,.3)'; c.strokeStyle = '#C0392B'; c.lineWidth = 2.5; c.beginPath(); r.shape.forEach(([x, y], i) => i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))); if (r.t !== 'rect') c.closePath(); c.fill(); c.stroke();
      r.shape.forEach(([x, y]) => { c.fillStyle = '#C0392B'; c.beginPath(); c.arc(X(x), Y(y), 4, 0, 7); c.fill(); });
      d.pts.forEach(([x, y]) => { c.fillStyle = '#1FA05A'; c.beginPath(); c.arc(X(x), Y(y), 6, 0, 7); c.fill(); });
    };
    draw();
    cv.addEventListener('pointerdown', e => { e.stopPropagation(); const b = cv.getBoundingClientRect(), gx = Math.round((e.clientX - b.left - O.x) / U), gy = Math.round((O.y - (e.clientY - b.top)) / U); if (Math.abs(gx) > 5 || Math.abs(gy) > 4) return;
      const i = d.pts.findIndex(p => p[0] === gx && p[1] === gy); if (i >= 0) d.pts.splice(i, 1); else if (d.pts.length < r.image.length) d.pts.push([gx, gy]); sfx('click'); draw(); });
    btn('cpClear', () => { d.pts = []; draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { const want = r.image.map(p => p.join()), ok = d.pts.filter(p => want.includes(p.join())).length;
      if (ok === want.length && d.pts.length === want.length) { d.pts = []; await advance(this, W, d, 3, 'transformPolygons', [{ who: 'amna', text: 'علم القرية مخيط بدقة الإحداثيات! سنرفعه في منصة التخرّج.' }]); }
      else { sfx('cough'); setMsg(`${ar(ok)} من ${ar(want.length)} في مكانها الصحيح. ${r.text}`, 'bad'); } });
  }
}, at(ST9.flag, 'flag', '🚩 قماش العلم'));

/* ═══ ٦٧. رسم وقياس الزوايا — «منقلة محسن» ═══ */
export const measureAngles = Object.assign({
  id: 'measureAngles', giver: 'mohsen',
  intro: n => [{ who: 'mohsen', text: `أهلاً يا ${n}! أنا محسن، أقطع الخشب للأبواب بزوايا دقيقة.` },
    { who: 'mohsen', text: 'الزوايا على مستقيم مجموعها ١٨٠°، وحول نقطة ٣٦٠°، والزاوية القائمة ٩٠°. أدِر المنشار لتكمل القطعة.' }],
  begin(d) { let a1; do { a1 = R(35, 145); } while (Math.abs(a1 - 90) < 6); const a = R(60, 150), b = R(50, 150), c = R(20, 70);
    d.rounds = [{ t: 'line', given: [a1], ans: 180 - a1, text: `على الخط المستقيم زاوية ${ar(a1)}°. اضبط الزاوية التي تكمل الخط.` }, { t: 'pt', given: [a, b], ans: 360 - a - b, text: `قُطعت من الدائرة زاويتان: ${ar(a)}° و${ar(b)}°. اضبط الزاوية المتبقية.` }, { t: 'rt', given: [c], ans: 90 - c, text: `في الزاوية القائمة جزء قياسه ${ar(c)}°. اضبط الجزء المتمم.` }]; d.r = 0; d.set = 30; },
  goal: d => `📐 أكمل قطع المنقلة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>📐 منقلة محسن</h3>${msgBox(msg ? `${msg} ${r.text}` : r.text, kind)}<canvas id="ang" width="300" height="200"></canvas>
      <div class="row2"><button class="act ghost" data-a="-10">−١٠°</button><button class="act ghost" data-a="-1">−١°</button><button class="act ghost" data-a="1">+١°</button><button class="act ghost" data-a="10">+١٠°</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📐 اقطع</button></div>`);
    const c = hiDPI(panel().querySelector('#ang')), O = { x: 150, y: r.t === 'pt' ? 104 : 160 }, Rr = r.t === 'pt' ? 80 : 120;
    const sector = (a0, a1, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(O.x, O.y); c.arc(O.x, O.y, Rr * .7, -a0 * Math.PI / 180, -a1 * Math.PI / 180, true); c.closePath(); c.fill(); };
    const ray = (a, col, w) => { c.strokeStyle = col; c.lineWidth = w || 3; c.beginPath(); c.moveTo(O.x, O.y); c.lineTo(O.x + Rr * Math.cos(-a * Math.PI / 180), O.y + Rr * Math.sin(-a * Math.PI / 180)); c.stroke(); };
    const draw = () => {
      c.clearRect(0, 0, 300, 200); let s = 0;
      r.given.forEach((g, i) => { sector(s, s + g, ['rgba(47,111,178,.35)', 'rgba(31,200,181,.35)'][i]); const m = (s + g / 2) * Math.PI / 180; c.fillStyle = '#2A1B66'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(ar(g) + '°', O.x + Rr * .45 * Math.cos(-m), O.y + Rr * .45 * Math.sin(-m) + 4); s += g; });
      sector(s, s + d.set, 'rgba(226,71,92,.35)'); const m = (s + d.set / 2) * Math.PI / 180; c.fillStyle = '#C2304A'; c.font = '900 13px Cairo, sans-serif'; c.fillText(ar(d.set) + '°', O.x + Rr * .5 * Math.cos(-m), O.y + Rr * .5 * Math.sin(-m) + 4);
      ray(0, '#2A1B66'); s = 0; r.given.forEach(g => { s += g; ray(s, '#2A1B66'); });
      if (r.t === 'line') ray(180, '#2A1B66'); if (r.t === 'rt') { ray(90, '#2A1B66'); c.strokeStyle = '#2A1B66'; c.lineWidth = 1.5; c.strokeRect(O.x, O.y - 14, 14, 14); }
      ray(s + d.set, '#E2475C', 4); c.fillStyle = '#2A1B66'; c.beginPath(); c.arc(O.x, O.y, 4, 0, 7); c.fill();
    };
    draw();
    panel().querySelectorAll('[data-a]').forEach(b => b.onclick = e => { e.stopPropagation(); d.set = clamp(d.set + +b.dataset.a, 1, 359); sfx('click'); draw(); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (d.set === r.ans) { d.set = 30; await advance(this, W, d, 3, 'measureAngles', [{ who: 'mohsen', text: 'قطع دقيقة! الأبواب ستُغلق بإحكام.' }]); } else { sfx('cough'); setMsg(`${ar(d.set)}° لا تكمل ${r.t === 'line' ? 'الخط المستقيم (١٨٠°)' : r.t === 'pt' ? 'الدائرة (٣٦٠°)' : 'القائمة (٩٠°)'}. ${r.text}`, 'bad'); } });
  }
}, at(ST9.protractor, 'protractor', '📐 المنقلة'));

/* ═══ ٦٨. المنشورات والأهرامات — «صناديق زينب» (مطابقة) ═══ */
const SOL = [{ n: 'متوازي مستطيلات', t: 'prism', k: 4 }, { n: 'منشور ثلاثي', t: 'prism', k: 3 }, { n: 'منشور خماسي', t: 'prism', k: 5 }, { n: 'هرم رباعي', t: 'pyr', k: 4 }, { n: 'هرم ثلاثي', t: 'pyr', k: 3 }, { n: 'هرم خماسي', t: 'pyr', k: 5 }];
const geo = s => ({ t: s.t, n: s.k });   // دالة الرسم تحتاج عدد أضلاع القاعدة في n
const cnt = s => s.t === 'prism' ? { V: 2 * s.k, F: s.k + 2, E: 3 * s.k } : { V: s.k + 1, F: s.k + 1, E: 2 * s.k };
function pickDistinct(key) { for (;;) { const p = shuffle(SOL.map((_, i) => i)).slice(0, 3); if (new Set(p.map(i => cnt(SOL[i])[key])).size === 3) return p; } }
export const prisms = Object.assign({
  id: 'prisms', giver: 'zainab',
  intro: n => [{ who: 'zainab', text: `أهلاً يا ${n}! أنا زينب تاجرة التمور. صناديقي على أشكال منشورات وأهرامات.` },
    { who: 'zainab', text: 'كل صندوق يحتاج بطاقة بعدد رؤوسه أو أوجهه. طابق كل صندوق ببطاقته.' }],
  begin(d) { const e = R(0, 5); d.rounds = [{ t: 'm', key: 'V', items: pickDistinct('V') }, { t: 'm', key: 'F', items: pickDistinct('F') }, { t: 'k', s: e, ans: cnt(SOL[e]).E }]; d.r = 0; d.pick = -1; d.gone = []; },
  goal: d => `📦 جهّز بطاقات صناديق التمور ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') {
      sheetOpen(`<h3>📦 الصندوق الأخير</h3><canvas id="sv" width="300" height="140"></canvas>${msgBox(msg ? `${msg} كم حرفاً (حافة) لهذا الصندوق: ${SOL[r.s].n}؟` : `كم حرفاً (حافة) لهذا الصندوق: ${SOL[r.s].n}؟`, kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
      const c = hiDPI(panel().querySelector('#sv')); drawSolid(c, geo(SOL[r.s]), 150, 112);
      const pad = numPad(panel().querySelector('#pad'), '✓ الجواب', async v => { if (v === r.ans) await advance(this, W, d, 3, 'prisms', [{ who: 'zainab', text: 'كل الصناديق ببطاقاتها الصحيحة! التمور جاهزة للسفر.' }]); else { sfx('cough'); pad.clear(); setMsg('عُدّ حواف القاعدة، ثم الحواف الجانبية', 'bad'); } }, { dot: false });
      btn('benchOut', () => { sheetClose(); changed(); });
      return;
    }
    if (!r.order) r.order = shuffle([0, 1, 2]);
    const lab = r.key === 'V' ? 'رؤوس' : 'أوجه';
    sheetOpen(`<h3>📦 ${r.key === 'V' ? 'عدد الرؤوس' : 'عدد الأوجه'}</h3>${msgBox(msg ? `${msg} اضغط صندوقاً ثم بطاقته` : `اضغط صندوقاً ثم بطاقة عدد ${lab}ه`, kind)}
      <div class="match"><div>${r.items.map((s, i) => `<button class="mt ${d.pick === i ? 'on' : ''} ${d.gone.includes(i) ? 'gone' : ''}" data-r="${i}"><canvas width="130" height="74" data-sv="${i}"></canvas><small>${SOL[s].n}</small></button>`).join('')}</div>
      <div>${r.order.map(i => `<button class="mt val ${d.gone.includes(i) ? 'gone' : ''}" data-v="${i}">${ar(cnt(SOL[r.items[i]])[r.key])} ${lab}</button>`).join('')}</div></div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('canvas[data-sv]').forEach(cv => { const c = hiDPI(cv); c.save(); c.translate(65, 64); c.scale(.55, .55); drawSolid(c, geo(SOL[r.items[+cv.dataset.sv]]), 0, 0); c.restore(); });
    panel().querySelectorAll('[data-r]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.r; if (!d.gone.includes(i)) { d.pick = i; sfx('click'); this.open(W, d, msg, kind); } });
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = async e => {
      e.stopPropagation(); const i = +b.dataset.v; if (d.pick < 0 || d.gone.includes(i)) return;
      if (i === d.pick) { d.gone.push(i); d.pick = -1; sfx('good'); if (d.gone.length >= 3) { d.gone = []; await advance(this, W, d, 3, 'prisms', null); } else this.open(W, d, '✓ مطابقة صحيحة!', 'ok'); }
      else { d.pick = -1; sfx('cough'); this.open(W, d, `ليست بطاقته. عُدّ ${lab} الصندوق مرة أخرى.`, 'bad'); }
    });
    btn('benchOut', () => { sheetClose(); changed(); });
  }
}, at(ST9.crates, 'crates', '📦 بطاقات الصناديق'));

/* ═══ ٦٩. متعدد الأوجه المنتظم — «كريستال جابر» ═══ */
const PLAT = [{ n: 'رباعي الأوجه المنتظم', f: 3, F: 4, V: 4, E: 6 }, { n: 'المكعب', f: 4, F: 6, V: 8, E: 12 }, { n: 'ثماني الأوجه المنتظم', f: 3, F: 8, V: 6, E: 12 }, { n: 'الاثنا عشري المنتظم', f: 5, F: 12, V: 20, E: 30 }, { n: 'العشروني المنتظم', f: 3, F: 20, V: 12, E: 30 }];
const FACE = { 3: ['مثلث', 'M12 3 L22 21 L2 21 Z'], 4: ['مربع', 'M4 4 H20 V20 H4 Z'], 5: ['خماسي', 'M12 2 L22 9.5 L18 21 L6 21 L2 9.5 Z'] };
export const regularPolyhedra = Object.assign({
  id: 'regularPolyhedra', giver: 'jaber',
  intro: n => [{ who: 'jaber', text: `مرحباً يا ${n}! أنا جابر صانع الكريستال. المجسمات المنتظمة خمسة فقط، وكل وجوهها متطابقة.` },
    { who: 'jaber', text: 'لأصهر كريستالة أحتاج شكل وجهها وعدد أوجهها. وقانون أويلر: الأوجه + الرؤوس = الحواف + ٢.' }],
  begin(d) { const [a, b] = shuffle([0, 2, 3, 4]).slice(0, 2), e = [2, 3, 4][R(0, 2)]; d.rounds = [{ t: 'f', s: a }, { t: 'f', s: b }, { t: 'k', s: e, ans: PLAT[e].E }]; d.r = 0; d.face = 0; d.nf = 0; },
  goal: d => `💎 اصهر كريستالات جابر ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], P = PLAT[r.s];
    if (r.t === 'k') {
      const text = `لـ${P.n} ${ar(P.F)} وجهاً و${ar(P.V)} رأساً. كم حافة له؟ (الأوجه + الرؤوس = الحواف + ٢)`;
      sheetOpen(`<h3>💎 لوح أويلر</h3>${msgBox(msg ? `${msg} ${text}` : text, kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
      const pad = numPad(panel().querySelector('#pad'), '✓ الحواف', async v => { if (v === r.ans) await advance(this, W, d, 3, 'regularPolyhedra', [{ who: 'jaber', text: 'الكريستالات تتلألأ! عرفتَ المجسمات المنتظمة كلها وقانون أويلر.' }]); else { sfx('cough'); pad.clear(); setMsg(`الحواف = الأوجه + الرؤوس − ٢. ${text}`, 'bad'); } }, { dot: false });
      btn('benchOut', () => { sheetClose(); changed(); });
      return;
    }
    sheetOpen(`<h3>💎 فرن الكريستال</h3>${msgBox(msg ? `${msg} اصهر كريستالة على شكل ${P.n}` : `اصهر كريستالة على شكل <b>${P.n}</b>: اختر شكل وجوهها وعددها`, kind)}
      <div class="row2">${[3, 4, 5].map(f => `<button class="act ${d.face === f ? '' : 'ghost'} facebtn" data-f="${f}"><svg viewBox="0 0 24 24" style="width:22px;height:22px"><path d="${FACE[f][1]}" fill="#B794F4" stroke="#4A2160" stroke-width="1.5"/></svg> ${FACE[f][0]}</button>`).join('')}</div>
      <div id="cnt"></div><div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🔥 اصهر</button></div>`);
    counters(panel().querySelector('#cnt'), [['nf', '🔷 عدد الأوجه', 24]], d);
    panel().querySelectorAll('.facebtn').forEach(b => b.onclick = e => { e.stopPropagation(); d.face = +b.dataset.f; sfx('click'); this.open(W, d, msg, kind); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      if (d.face === P.f && d.nf === P.F) { d.face = 0; d.nf = 0; await advance(this, W, d, 3, 'regularPolyhedra', null); }
      else { sfx('cough'); setMsg(d.face !== P.f ? `وجوه ${P.n} ليست على شكل ${d.face ? FACE[d.face][0] : 'هذا'}` : `عدد الأوجه لا يطابق ${P.n}`, 'bad'); }
    });
  },
  draw(d, t, active, done) { const s = ST9.crystals; return done ? [[-70, '#B794F4'], [70, '#7CC8F0']].map(([dx, col], i) => ({ y: s.y + 20, x: s.x + dx, draw: c => {   // عناقيد كريستال على قواعد حجرية تتلألأ
    const x = s.x + dx, y = s.y + 20;
    c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 4, y, 16, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#B5A58A'; c.fillRect(x - 13, y - 8, 26, 8); c.strokeStyle = '#2B1E14'; c.lineWidth = .8; c.strokeRect(x - 13, y - 8, 26, 8);
    [[0, 30, 7], [-8, 20, 5], [8, 22, 5]].forEach(([ox, h, r], k) => { const cx = x + ox, by = y - 8, hh = h + Math.sin(t * 2 + i + k) * 1.5;
      c.fillStyle = col; c.beginPath(); c.moveTo(cx - r, by); c.lineTo(cx - r, by - hh * .7); c.lineTo(cx, by - hh); c.lineTo(cx + r, by - hh * .7); c.lineTo(cx + r, by); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(cx - r, by - hh * .7); c.lineTo(cx, by - hh); c.lineTo(cx, by); c.lineTo(cx - r, by); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,20,60,.5)'; c.lineWidth = .7; c.beginPath(); c.moveTo(cx - r, by); c.lineTo(cx - r, by - hh * .7); c.lineTo(cx, by - hh); c.lineTo(cx + r, by - hh * .7); c.lineTo(cx + r, by); c.stroke(); });
    const k = (t * .7 + i * .5) % 1; c.fillStyle = 'rgba(255,255,255,' + Math.sin(k * Math.PI).toFixed(2) + ')'; c.beginPath(); c.arc(x - 2, y - 34, 2.2, 0, 7); c.fill();
  } })).concat([{ y: s.y + 30, draw: c => bubble(c, s.x, s.y - 160, '✓', '#1FA05A') }]) : []; }
}, (() => { const s = at(ST9.crystals, 'crystals', '💎 فرن الكريستال'); delete s.draw; return s; })());

export const T2U5 = { classifyShapes, transformPolygons, measureAngles, prisms, regularPolyhedra };
