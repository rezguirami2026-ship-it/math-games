// الفصل ٣ «النهر الجوفي»: نهر يجري في كهف واسع، وفيه صفوف صخور تطفو ثم تغوص بإيقاع. الطالب ينقر الصخرة التالية (أو يضغط ⬆)
// حين تطفو فيقفز البطل إليها؛ وإن غاصت تحته انزلق إلى الصخرة السابقة الآمنة (رشّة ماء فقط، بلا عقاب).
import { canvasStage } from '../../../quest.js';
import { ar } from '../../../../core/util.js';

const ROWS = 6;
export default async function (api) {
  const S = canvasStage(api);
  // كل صف: ثلاث صخور بمواضع وأطوار مختلفة؛ الصخرة الطافية تبقى ٢٫٤ ثانية من ٣٫٦
  const rows = Array.from({ length: ROWS }, (_, r) => [0, 1, 2].map(c => ({ c, ph: (r * .9 + c * 1.3) % 3.6, per: 3.6 - r * .12 })));
  const st = { row: -1, col: 1, hop: 0, from: null, slip: 0, splash: [], done: 0, tries: 0 };
  const up = (s, t) => ((t + s.ph) % s.per) < s.per * .62, rise = (s, t) => { const u = ((t + s.ph) % s.per) / s.per; return u < .62 ? Math.min(1, Math.min(u, .62 - u) * 8) : 0; };
  let T = 0, geo = null;
  const jump = (r, c) => { if (st.hop > 0 || st.done) return; if (r !== st.row + 1 || Math.abs(c - st.col) > 1 && st.row >= 0) return api.hint('اقفز إلى صخرة في الصف الذي أمامك مباشرة، قريبة منك.');
    const s = r < ROWS ? rows[r][c] : null; if (s && !up(s, T)) { st.tries++; api.sfx('cough'); return api.hint('هذه الصخرة تحت الماء الآن… انتظر حتى تطفو فوق السطح ثم اقفز.'); }
    st.from = { r: st.row, c: st.col }; st.row = r; st.col = c; st.hop = .45; api.sfx('drop'); if (r === 0) api.step(0); if (r === ROWS) { st.done = T; api.step(2); } };
  S.cv.addEventListener('pointerdown', e => { if (!geo) return; const b = S.cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    let best = null, bd = 60; for (let r = 0; r <= ROWS; r++) for (let c = 0; c < 3; c++) { const p = geo(r, c); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = [r, c]; } } if (best) jump(best[0], best[0] === ROWS ? 1 : best[1]); });
  api.onKey(e => { if (e.type !== 'keydown') return; if (e.key === 'ArrowUp' || e.key === ' ') jump(st.row + 1, st.row + 1 === ROWS ? 1 : st.col); else if (e.key === 'ArrowLeft') st.col = Math.max(0, st.col - (st.row < 0 ? 1 : 0)); else if (e.key === 'ArrowRight') st.col = Math.min(2, st.col + (st.row < 0 ? 1 : 0)); else return; e.preventDefault(); });
  window.__qch = { st, rows, jump, up: s => up(s, T), ROWS };   // للاختبار الآلي
  api.say('النهر سريع، لكن الصخور تطفو ثم تغوص. راقب الصخرة حتى تخرج من الماء، ثم انقرها لتقفز إليها.', 7500);
  await S.run((g, w, h, dt, t) => {
    T = t; const top = 170, bot = h - 120, rowH = (bot - top) / (ROWS + 1), colW = Math.min(150, w / 4.2);
    geo = (r, c) => ({ x: w / 2 + (c - 1) * colW, y: bot - (r + 1) * rowH + (r === ROWS ? -10 : 0) }); const start = { x: w / 2, y: bot + 40 };
    // الماء يجري من اليمين إلى اليسار بموجات، والضفتان صخريتان
    const wg = g.createLinearGradient(0, top, 0, bot); wg.addColorStop(0, '#0E4D7A'); wg.addColorStop(1, '#1B6FA3'); g.fillStyle = wg; g.fillRect(0, top - rowH * .6, w, bot - top + rowH * .7);
    g.strokeStyle = 'rgba(190,230,255,.35)'; g.lineWidth = 2; for (let y = top; y < bot; y += 22) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * .03 - t * 4 + y) * 4); g.stroke(); }
    g.fillStyle = '#6B5845'; g.fillRect(0, bot + 6, w, h - bot); g.fillRect(0, 0, w, top - rowH * .6); g.fillStyle = '#7E6A55'; g.fillRect(0, bot + 6, w, 14); g.fillRect(0, top - rowH * .6 - 14, w, 14);
    g.fillStyle = '#FFFDF6'; g.font = '900 18px Cairo'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText('🌿 الضفة الأخرى: الأشغال القديمة', w / 2, top - rowH * .6 - 24);
    // الصخور
    rows.forEach((row, r) => row.forEach(s => { const p = geo(r, s.c), k = rise(s, t), wob = Math.sin(t * 3 + r + s.c) * 2;
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(p.x, p.y + 8, 42, 12, 0, 0, 7); g.fill();
      g.globalAlpha = .35 + .65 * k; g.fillStyle = k > .5 ? '#9A8B78' : '#5E5A55'; g.beginPath(); g.ellipse(p.x, p.y - k * 8 + wob, 36, 18 + k * 4, 0, 0, 7); g.fill(); g.fillStyle = '#B7A893'; g.beginPath(); g.ellipse(p.x - 6, p.y - k * 8 - 5 + wob, 20, 8, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      if (r === st.row + 1 && k > .6) { g.strokeStyle = `rgba(250,204,21,${.6 + .4 * Math.sin(t * 8)})`; g.lineWidth = 4; g.beginPath(); g.ellipse(p.x, p.y - k * 8 + wob, 42, 24, 0, 0, 7); g.stroke(); } }));
    // انزلاق: إن غاصت الصخرة تحت البطل يعود إلى السابقة
    if (st.row >= 0 && st.row < ROWS && st.hop <= 0 && !up(rows[st.row][st.col], t)) { const p = geo(st.row, st.col); st.splash.push({ x: p.x, y: p.y, l: 1 }); api.sfx('cough'); st.row--; if (st.row >= 0 && !up(rows[st.row][st.col], t)) st.row = -1; if (st.row < 0) st.col = 1; st.hop = .35; st.from = null;
      if (!st.slipT) { st.slipT = 1; api.hint('غاصت الصخرة! لا تبقَ طويلاً: اقفز إلى التالية وهي ما زالت طافية.'); } }
    if (st.row >= 2) api.step(1);
    st.hop = Math.max(0, st.hop - dt);
    const pos = st.row < 0 ? start : geo(st.row, st.row === ROWS ? 1 : st.col), prev = st.from ? (st.from.r < 0 ? start : geo(st.from.r, st.from.c)) : pos, u = st.hop > 0 ? 1 - st.hop / .45 : 1;
    const hx = prev.x + (pos.x - prev.x) * u, hy = prev.y + (pos.y - prev.y) * u - Math.sin(u * Math.PI) * 50;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(hx, (prev.y + (pos.y - prev.y) * u) + 4, 16, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#F7F5EF'; g.beginPath(); g.roundRect(hx - 11, hy - 44, 22, 40, 8); g.fill(); g.fillStyle = '#C68A5B'; g.beginPath(); g.arc(hx, hy - 52, 10, 0, 7); g.fill(); g.fillStyle = '#F7F5EF'; g.beginPath(); g.ellipse(hx, hy - 58, 11, 5, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#FFC46B'; g.beginPath(); g.arc(hx + 14, hy - 26, 5, 0, 7); g.fill();
    st.splash.forEach(s => { s.l -= dt * 1.5; g.strokeStyle = `rgba(220,240,255,${Math.max(0, s.l)})`; g.lineWidth = 3; g.beginPath(); g.arc(s.x, s.y, 50 * (1 - s.l) + 10, 0, 7); g.stroke(); }); st.splash = st.splash.filter(s => s.l > 0);
    g.fillStyle = 'rgba(255,253,246,.95)'; g.beginPath(); g.roundRect(w - 170, h - 104, 150, 40, 12); g.fill(); g.fillStyle = '#1E2433'; g.font = '800 15px Cairo'; g.fillText(`🪨 الصف ${ar(Math.max(0, st.row + 1))} من ${ar(ROWS)}`, w - 95, h - 78);
    return st.done && t - st.done > 1.2;
  });
}
