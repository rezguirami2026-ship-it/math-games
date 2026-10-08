// الوحدة ٢ (القياس) في «السوق الأسبوعي»: المسطرة والوقت والتقويم والسياج أدوات لعب حقيقية
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait, rr, clamp } from '../core/util.js';
import { say, puff, bubble } from '../world/entities.js';
import { PAL, INK, pattern } from '../world/art.js';
import { earn } from '../rewards/goodDeeds.js';
import { sfx } from '../core/sound.js';
import { complete } from './quests.js';
import { drawHuman } from '../character/human.js';
import { BENCH, FIELD, BOARD, BAYS, TIMETABLE, CAL, PEN } from '../world/market.js';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const near = (W, p, r) => Math.hypot(W.player.x - p.x, W.player.y - p.y) < (r || 50);
const changed = () => { bus.emit('mission'); bus.emit('save'); };
const dec = v => ar(String(+v.toFixed(3))).replace('.', '٫');
const notTen = (a, b) => { let v = R(a, b); if (v % 10 === 0) v += 3; return v; };
async function finish(W, id, lines, reward) { sfx('win'); await wait(600); earn(reward || 40, W.player.x, W.player.y - 80); complete(id); if (lines) await W.talk(lines[0].who, lines); }
const panel = () => document.getElementById('panel');
function sheetOpen(html) { const el = panel(); el.innerHTML = `<div class="sheet bench">${html}</div>`; el.classList.add('on'); game.busy = true; return el; }
function sheetClose() { const el = panel(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; }
function hiDPI(cv) { const r = 2, w = cv.width, h = cv.height; cv.width = w * r; cv.height = h * r; cv.style.width = w + 'px'; cv.style.height = h + 'px'; const c = cv.getContext('2d'); c.scale(r, r); return c; }
function ruler(c, x0, y, ppm, maxMm) {
  c.fillStyle = '#F7E7A6'; rr(c, x0 - 8, y, maxMm * ppm + 16, 34, 4); c.fill(); c.strokeStyle = '#B79A4A'; c.lineWidth = 1; c.stroke();
  for (let i = 0; i <= maxMm; i++) {
    const x = x0 + i * ppm, h = i % 10 === 0 ? 14 : i % 5 === 0 ? 10 : 6;
    c.strokeStyle = '#3A2E1E'; c.lineWidth = i % 10 === 0 ? 1.4 : .8; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + h); c.stroke();
    if (i % 10 === 0) { c.fillStyle = '#3A2E1E'; c.font = '900 11px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(ar(i / 10), x, y + 28); }
  }
  c.fillStyle = '#7A6A4A'; c.font = '700 9px Cairo, sans-serif'; c.textAlign = 'left'; c.fillText('سم', x0 + maxMm * ppm + 2, y + 28);
}
const msgBox = (t, kind) => `<div class="speech ${kind || ''}" id="benchMsg">${t}</div>`;

/* ═══ ١١. رسم وقياس الخطوط — «ورشة النجار» ═══ */
export const lengthMeasure = {
  id: 'lengthMeasure', giver: 'mubarak',
  intro: n => [
    { who: 'mubarak', text: `أهلاً يا ${n}! أنا مبارك، أصنع قوارب خشبية صغيرة للصيادين.` },
    { who: 'mubarak', text: 'أحتاج قطعاً بأطوال دقيقة، والطلبات مكتوبة بوحدات مختلفة: ملم وسم ومتر. حرّك المنشار على المسطرة واقطع كل قطعة بطولها تماماً.' }
  ],
  begin(d) { const a = notTen(31, 95), b = notTen(31, 97), c = R(7, 19) * 5; d.rounds = [{ mm: a, txt: `${ar(a)} ملم` }, { mm: b, txt: `${dec(b / 10)} سم` }, { mm: c, txt: `${dec(c / 1000)} م` }]; d.r = 0; d.pos = 50; },
  goal: d => { const r = Math.min(d.r, 2); return `🪚 اقطع قطعة طولها ${d.rounds[r].txt} على طاولة النجار (${ar(r + 1)} من ${ar(3)})`; },
  target: () => BENCH,
  taps: () => [{ x: BENCH.x, y: BENCH.y - 20, hit: 40, approach: { x: BENCH.x, y: BENCH.y + 24 } }],
  actions(W, d) { return near(W, { x: BENCH.x, y: BENCH.y + 16 }, 48) ? [{ key: 'bench', label: '🪚 طاولة النجار', kind: 'go', run: () => this.open(W, d) }] : []; },
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    sheetOpen(`<h3>🪚 طاولة النجار</h3>${msgBox(msg || `اقطع قطعة طولها <b>${r.txt}</b>`, kind)}
      <canvas id="cut" width="340" height="120"></canvas>
      <div class="row2"><button class="act ghost" data-d="-10">−١ سم</button><button class="act ghost" data-d="-1">−١ ملم</button><button class="act ghost" data-d="1">+١ ملم</button><button class="act ghost" data-d="10">+١ سم</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🪚 اقطع</button></div>`);
    const cv = document.getElementById('cut'), c = hiDPI(cv), x0 = 18, ppm = 3;
    const draw = () => {
      c.clearRect(0, 0, 340, 120);
      c.fillStyle = '#D9A066'; rr(c, x0, 22, 102 * ppm, 30, 3); c.fill();
      c.strokeStyle = '#B07A3B'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x0, 28 + k * 7); c.lineTo(x0 + 102 * ppm, 30 + k * 7); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x0, 22, 2, 30);
      ruler(c, x0, 56, ppm, 100);
      const sx = x0 + d.pos * ppm;
      c.strokeStyle = '#E2475C'; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(sx, 8); c.lineTo(sx, 92); c.stroke(); c.setLineDash([]);
      c.font = '18px sans-serif'; c.textAlign = 'center'; c.fillText('🪚', sx, 16);
    };
    draw();
    panel().querySelectorAll('[data-d]').forEach(b => b.onclick = e => { e.stopPropagation(); d.pos = clamp(d.pos + +b.dataset.d, 1, 100); sfx('click'); draw(); });
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
    document.getElementById('benchGo').onclick = async e => {
      e.stopPropagation();
      if (d.pos === r.mm) {
        sfx('win'); d.r++; d.pos = 50; changed();
        if (d.r >= d.rounds.length) { sheetClose(); await finish(W, 'lengthMeasure', [{ who: 'mubarak', text: 'قطع دقيقة كأنها من يد نجار قديم! اكتمل القارب.' }]); }
        else this.open(W, d, `✓ قطعة ممتازة! الطلب التالي: <b>${d.rounds[d.r].txt}</b>`, 'ok');
      } else { sfx('cough'); this.open(W, d, d.pos < r.mm ? `القطعة أقصر من ${r.txt}، جرّب مرة أخرى` : `القطعة أطول من ${r.txt}، جرّب مرة أخرى`, 'bad'); }
    };
  },
  draw(d, t, active, done) {
    if (!done) return [];
    const x = BENCH.x - 70, y = BENCH.y + 30;
    return [{ y, x, draw: c => {   // القارب المكتمل على حاملين خشبيين بجانب الورشة: بدن بألواح، حافة ذهبية، وشراع
      c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 8, y + 2, 42, 6, 0, 0, 7); c.fill();
      c.fillStyle = PAL.wood; [-24, 20].forEach(dx => { c.fillRect(x + dx, y - 12, 4, 12); c.fillRect(x + dx - 6, y - 14, 16, 3); });
      const g = c.createLinearGradient(0, y - 34, 0, y - 10); g.addColorStop(0, '#A06A36'); g.addColorStop(1, '#6E4524'); c.fillStyle = g;
      c.beginPath(); c.moveTo(x - 40, y - 34); c.quadraticCurveTo(x - 30, y - 10, x, y - 12); c.quadraticCurveTo(x + 30, y - 10, x + 42, y - 36); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
      c.strokeStyle = 'rgba(40,20,5,.35)'; c.lineWidth = .8; [-26, -20].forEach(o => { c.beginPath(); c.moveTo(x - 36, y + o - 2); c.quadraticCurveTo(x, y + o + 10, x + 38, y + o - 4); c.stroke(); });
      c.fillStyle = '#E3B04B'; c.beginPath(); c.moveTo(x - 40, y - 34); c.quadraticCurveTo(x, y - 30, x + 42, y - 36); c.lineTo(x + 42, y - 33); c.quadraticCurveTo(x, y - 27, x - 40, y - 31); c.closePath(); c.fill();
      c.strokeStyle = '#5A3A1A'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x, y - 78); c.stroke();
      c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(x + 2, y - 76); c.quadraticCurveTo(x + 24, y - 56, x + 2, y - 34); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
    } }];
  }
};

/* ═══ ١٢. رسم الخطوط — «خطوط الملعب» ═══ */
export const lineDrawing = {
  id: 'lineDrawing', giver: 'khalid',
  intro: n => [
    { who: 'khalid', text: `يا ${n}! ملعب السوق جديد، وليس فيه خط واحد.` },
    { who: 'khalid', text: 'ارسم كل خط على لوحي بطوله الدقيق مستخدماً المسطرة، وأنا أنقله إلى الملعب بالطلاء.' }
  ],
  begin(d) { const a = notTen(31, 99), b = notTen(31, 115), c = notTen(40, 115); d.rounds = [{ mm: a, txt: `${dec(a / 10)} سم` }, { mm: b, txt: `${ar(b)} ملم` }, { mm: c, txt: `${dec(c / 1000)} م` }]; d.r = 0; d.end = 0; },
  goal: d => { const r = Math.min(d.r, 2); return `✏️ ارسم خطاً طوله ${d.rounds[r].txt} على لوح المدرب (${ar(r + 1)} من ${ar(3)})`; },
  target: () => BOARD,
  taps: () => [{ x: BOARD.x, y: BOARD.y - 30, hit: 40, approach: { x: BOARD.x, y: BOARD.y + 22 } }],
  actions(W, d) { return near(W, { x: BOARD.x, y: BOARD.y + 14 }, 46) ? [{ key: 'board', label: '✏️ لوح المدرب', kind: 'go', run: () => this.open(W, d) }] : []; },
  open(W, d, msg, kind) {
    const r = d.rounds[d.r]; d.end = 0;
    sheetOpen(`<h3>✏️ لوح المدرب</h3>${msgBox(msg || `اسحب القلم على المسطرة لترسم خطاً طوله <b>${r.txt}</b>`, kind)}
      <canvas id="draw" width="340" height="130" style="touch-action:none"></canvas>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✏️ ثبّت الخط</button></div>`);
    const cv = document.getElementById('draw'), c = hiDPI(cv), x0 = 18, ppm = 2.5;
    const draw = () => {
      c.clearRect(0, 0, 340, 130); c.fillStyle = '#2F4F3F'; rr(c, 4, 4, 332, 66, 8); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x0, 44, 4, 0, 7); c.fill();
      if (d.end > 0) { c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, 44); c.lineTo(x0 + d.end * ppm, 44); c.stroke(); c.font = '16px sans-serif'; c.textAlign = 'center'; c.fillText('✏️', x0 + d.end * ppm + 6, 36); }
      ruler(c, x0, 76, ppm, 120);
    };
    draw();
    const setX = e => { const b = cv.getBoundingClientRect(); d.end = clamp(Math.round((e.clientX - b.left - x0) / ppm), 0, 120); draw(); };
    let down = false;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); down = true; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); setX(e); });
    cv.addEventListener('pointermove', e => { if (down) setX(e); });
    cv.addEventListener('pointerup', () => { down = false; });
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
    document.getElementById('benchGo').onclick = async e => {
      e.stopPropagation(); if (!d.end) return;
      if (d.end === r.mm) {
        sfx('win'); d.r++; changed();
        if (d.r >= d.rounds.length) { sheetClose(); await finish(W, 'lineDrawing', [{ who: 'khalid', text: 'الملعب جاهز بخطوط دقيقة! سنلعب أول مباراة الليلة.' }]); }
        else this.open(W, d, `✓ نقلتُ الخط إلى الملعب! التالي: <b>${d.rounds[d.r].txt}</b>`, 'ok');
      } else { sfx('cough'); this.open(W, d, d.end < r.mm ? `الخط أقصر من ${r.txt}` : `الخط أطول من ${r.txt}`, 'bad'); }
    };
  },
  ground(c, d, active, done) {   // خطوط الملعب تظهر تدريجياً
    const n = done ? 3 : (d.r || 0), F = FIELD, cx = F.x + F.w / 2, cy = F.y + F.h / 2;
    c.strokeStyle = '#fff'; c.lineWidth = 3;
    if (n >= 1) { c.strokeRect(F.x + 12, F.y + 12, F.w - 24, F.h - 24); c.beginPath(); c.moveTo(cx, F.y + 12); c.lineTo(cx, F.y + F.h - 12); c.stroke(); }
    if (n >= 2) { c.beginPath(); c.arc(cx, cy, 40, 0, 7); c.stroke(); }
    if (n >= 3) { c.strokeRect(F.x + 12, cy - 60, 50, 120); c.strokeRect(F.x + F.w - 62, cy - 60, 50, 120); c.fillStyle = '#fff'; c.fillRect(F.x + 2, cy - 24, 10, 48); c.fillRect(F.x + F.w - 12, cy - 24, 10, 48); }
  }
};

/* ═══ ١٣. الجداول الزمنية — «محطة الحافلات» ═══ */
const hhmm = m => `${ar(String(Math.floor(m / 60)).padStart(2, '0'))}:${ar(String(m % 60).padStart(2, '0'))}`;
const h12 = m => { const h = Math.floor(m / 60), mi = m % 60, hh = h > 12 ? h - 12 : h; return `${ar(hh)}:${ar(String(mi).padStart(2, '0'))} ${h < 16 ? 'بعد الظهر' : 'مساءً'}`; };
const durTxt = m => { const h = Math.floor(m / 60), mi = m % 60; return `${h ? (h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : ar(h) + ' ساعات') : ''}${h && mi ? ' و' : ''}${mi ? ar(mi) + ' دقيقة' : ''}`; };
const PAX = [{ name: 'سلمى', kind: 'woman', robe: '#7B3F98', accent: '#E3B04B' }, { name: 'يعقوب', kind: 'man', robe: '#F4F1E8', accent: '#2E8B57' }, { name: 'نورة', kind: 'woman', robe: '#2E6E8E', accent: '#C0392B' }];
export const timeTables = {
  id: 'timeTables', giver: 'abdullah',
  intro: n => [
    { who: 'abdullah', text: `مرحباً يا ${n}! أنا عبدالله ناظر المحطة. ثلاثة مسافرين وصلوا ولا يعرفون أي حافلة يركبون.` },
    { who: 'abdullah', text: 'فوق كل حافلة لوحة فيها الرصيف والوجهة وموعد الانطلاق والوصول ومدة الرحلة، بنظام ٢٤ ساعة.' },
    { who: 'abdullah', text: 'اسمع طلب كل مسافر، فتظهر لك بطاقته مع الجدول. قارن، ثم رافقه إلى رصيف الحافلة التي تناسبه.' }
  ],
  begin(d) {
    let deps, durs;
    do { deps = [0, 1, 2].map(() => R(158, 196) * 5); durs = [0, 1, 2].map(() => R(10, 33) * 5); }
    while (Math.min(...[0, 1, 2].map(i => Math.min(...[0, 1, 2].filter(j => j !== i).map(j => Math.abs(deps[i] - deps[j]))))) < 20 || Math.min(...[0, 1, 2].map(i => Math.min(...[0, 1, 2].filter(j => j !== i).map(j => Math.abs(durs[i] - durs[j]))))) < 15 || new Set(deps.map((v, i) => v + durs[i])).size < 3 || Math.min(...[0, 1, 2].map(i => Math.min(...[0, 1, 2].filter(j => j !== i).map(j => Math.abs(deps[i] + durs[i] - deps[j] - durs[j]))))) < 15);
    const dest = shuffle(['نزوى', 'صور', 'صحار', 'عبري', 'إبراء', 'الرستاق']).slice(0, 3);
    d.buses = [0, 1, 2].map(i => ({ bay: i, dest: dest[i], dep: deps[i], dur: durs[i], arr: deps[i] + durs[i] }));
    const by = k => [0, 1, 2].slice().sort((a, b) => d.buses[a][k] - d.buses[b][k]);
    const sDep = by('dep'), sDur = by('dur'), sArr = by('arr');
    const t = d.buses[sDep[1]].dep - R(1, Math.floor((d.buses[sDep[1]].dep - d.buses[sDep[0]].dep) / 5) - 1) * 5;
    const D = d.buses[sDur[0]].dur + Math.floor((d.buses[sDur[1]].dur - d.buses[sDur[0]].dur) / 10) * 5;
    const T = d.buses[sArr[0]].arr + Math.max(5, Math.floor((d.buses[sArr[1]].arr - d.buses[sArr[0]].arr) / 10) * 5);
    const reqs = shuffle([
      { kind: 'dep', bus: sDep[1], text: `أريد أبكر حافلة تنطلق بعد الساعة ${h12(t)}.` },
      { kind: 'dur', bus: sDur[0], text: `رحلتي يجب ألا تزيد مدتها على ${durTxt(D)}.` },
      { kind: 'arr', bus: sArr[0], text: `يجب أن أصل قبل الساعة ${h12(T)}.` }
    ]);
    d.pax = reqs.map((q, i) => Object.assign({}, PAX[i], q, { x: 2160 + i * 34, y: 822, st: 'wait', dir: 'left', phase: 0, moving: false }));
    d.follow = -1; d.leave = 0;
  },
  goal: d => d.follow >= 0 ? `🚌 رافق ${d.pax[d.follow].name} إلى رصيف حافلته` : `🧳 ساعد المسافرين على ركوب حافلاتهم (${ar(d.pax.filter(p => p.st === 'board').length)} من ${ar(3)})`,
  target: d => d.follow >= 0 ? null : (d.pax.find(p => p.st === 'wait') || TIMETABLE),
  taps: d => d.pax.filter(p => p.st === 'wait').map(p => ({ x: p.x, y: p.y - 26, hit: 30, approach: { x: p.x, y: p.y + 24 } }))
    .concat(BAYS.map(b => ({ x: b.x, y: b.y - 20, hit: 34, approach: { x: b.x, y: b.y + 8 } })), [{ x: TIMETABLE.x, y: TIMETABLE.y - 40, hit: 36, approach: { x: TIMETABLE.x, y: TIMETABLE.y + 24 } }]),
  actions(W, d) {
    const out = [];
    if (near(W, { x: TIMETABLE.x, y: TIMETABLE.y + 16 }, 50)) out.push({ key: 'tt', label: '📋 اقرأ الجدول', kind: 'ghost', run: () => this.board(d) });
    if (d.follow < 0) d.pax.forEach((p, i) => { if (p.st === 'wait' && near(W, { x: p.x, y: p.y + 10 }, 40)) out.push({ key: 'pax' + i, label: `🧳 رافِق ${p.name}`, run: () => this.escort(W, d, i) }); });
    else {
      const p = d.pax[d.follow];
      out.push({ key: 'req', label: `💬 طلب ${p.name}`, kind: 'ghost', run: () => { W.paxInfo = p; W.talk('pax', [{ who: 'pax', text: p.text }]); } });
      BAYS.forEach((b, j) => { if (near(W, { x: b.x, y: b.y + 8 }, 40)) out.push({ key: 'bay' + j, label: `🚌 أركبه حافلة الرصيف ${b.id}`, kind: 'go', run: () => this.board2(W, d, j) }); });
    }
    return out;
  },
  /* لوحة فوق كل حافلة: الرصيف والوجهة والانطلاق والوصول والمدة (تُرسم قائمة فتظهر واضحة في العرضين) */
  signs(d) { return d.buses ? d.buses.map(b => ({ b, x: BAYS[b.bay].x, y: 880 })) : []; },
  board(d) {
    sheetOpen(`<h3>📋 جدول الحافلات — بنظام ٢٤ ساعة</h3><table class="tt"><tr><th>الرصيف</th><th>الوجهة</th><th>الانطلاق</th><th>الوصول</th></tr>
      ${d.buses.map(b => `<tr><td>${BAYS[b.bay].id}</td><td>${b.dest}</td><td>${hhmm(b.dep)}</td><td>${hhmm(b.arr)}</td></tr>`).join('')}</table>
      <button class="act" id="benchOut">رجوع إلى المحطة</button>`);
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); };
  },
  async escort(W, d, i) {
    const p = d.pax[i];
    W.paxInfo = p; await W.talk('pax', [{ who: 'pax', text: `أنا ${p.name}. ${p.text}` }]);
    p.st = 'follow'; d.follow = i; changed();
  },
  async board2(W, d, j) {
    const p = d.pax[d.follow], bus = d.buses[j];
    if (p.bus === j) {
      p.st = 'board'; p.on = j; d.follow = -1; sfx('drop'); say(BAYS[j].x, BAYS[j].y - 60, `✓ ركبت ${p.name}`, '#1FA05A', 1600); changed();
      if (d.pax.every(x => x.st === 'board')) { await wait(800); d.leave = performance.now(); sfx('engine'); await wait(3600); await finish(W, 'timeTables', [{ who: 'abdullah', text: 'انطلقت الحافلات في مواعيدها، وكل مسافر في حافلته الصحيحة!' }]); }
    } else {
      sfx('cough');
      const why = p.kind === 'dep' ? `تنطلق ${hhmm(bus.dep)}` : p.kind === 'dur' ? `مدتها ${durTxt(bus.dur)}` : `تصل ${hhmm(bus.arr)}`;
      say(BAYS[j].x, BAYS[j].y - 60, `هذه ${why} ولا تناسب طلبي`, '#C2304A', 2600);
    }
  },
  update(dt, W, d) {
    if (!d.pax) return;
    ttCard(d);
    d.pax.forEach((p, i) => {
      if (p.st !== 'follow') { p.moving = false; return; }
      const tx = W.player.x + 26, ty = W.player.y + 6, dx = tx - p.x, dy = ty - p.y, dd = Math.hypot(dx, dy);
      if (dd > 8) { const st = Math.min(dd - 6, 150 * dt); p.x += dx / dd * st; p.y += dy / dd * st; p.moving = true; p.phase += st * .17; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); } else p.moving = false;
    });
  },
  draw(d, t, active, done) {
    if (!d.buses) return [];
    const out = [], lt = d.leave ? (performance.now() - d.leave) / 1000 : 0;
    d.buses.forEach(b => {
      const order = d.buses.slice().sort((x, y) => x.dep - y.dep).indexOf(b), go = done || (d.leave && lt > order * .8), x = BAYS[b.bay].x + (go ? (done ? 2000 : Math.max(0, lt - order * .8) * 260) : 0), y = 880;
      if (x > 2400) return;
      out.push({ y, draw: c => {
        c.fillStyle = 'rgba(40,25,10,.25)'; c.beginPath(); c.ellipse(x, y + 4, 44, 8, 0, 0, 7); c.fill();
        c.fillStyle = '#E8B13A'; rr(c, x - 42, y - 32, 84, 32, 8); c.fill(); c.fillStyle = '#BFE3F7'; for (let k = 0; k < 4; k++) rr(c, x - 36 + k * 19, y - 26, 14, 11, 3), c.fill();
        c.fillStyle = '#26262F'; c.beginPath(); c.arc(x - 26, y, 6, 0, 7); c.arc(x + 26, y, 6, 0, 7); c.fill();
        c.fillStyle = '#2A1B66'; rr(c, x - 22, y - 46, 44, 14, 4); c.fill(); c.fillStyle = '#fff'; c.font = '900 10px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(b.dest, x, y - 36);
        const n = d.pax.filter(p => p.on === b.bay).length; if (n && !go) bubble(c, x + 30, y - 52, '👤'.repeat(n), '#2A1B66');
      } });
    });
    d.pax.forEach(p => { if (p.st !== 'board') out.push({ y: p.y, draw: c => drawHuman(c, Object.assign({}, p, { s: .92 })) }); });
    if (!d.leave && !done) d.buses.forEach(b => { const x = BAYS[b.bay].x, y = 884, kind = d.follow >= 0 ? d.pax[d.follow].kind : null;
      out.push({ y, x, draw: c => busSign(c, x, y - 52, b, BAYS[b.bay].id, kind) }); });
    return out;
  }
};

function busSign(c, x, y, b, bay, kind) {   // لوحة الحافلة (عرضها أقل من المسافة بين الأرصفة): الوجهة، ثم الانطلاق والوصول والمدة، وما يطلبه المسافر الحالي بالذهبي
  const W = 100, H = 74, x0 = x - W / 2, y0 = y - H; c.save(); c.direction = 'rtl'; c.textAlign = 'center';
  c.fillStyle = 'rgba(20,20,40,.25)'; rr(c, x0 + 3, y0 + 4, W, H, 9); c.fill();
  c.fillStyle = '#13245C'; rr(c, x0, y0, W, H, 9); c.fill(); c.strokeStyle = '#E2B95A'; c.lineWidth = 2; rr(c, x0 + 1, y0 + 1, W - 2, H - 2, 8); c.stroke();
  c.fillStyle = '#FFD54A'; c.beginPath(); c.arc(x0 + W - 13, y0 + 14, 9, 0, 7); c.fill(); c.fillStyle = '#13245C'; c.font = '900 11px Cairo, sans-serif'; c.fillText(bay, x0 + W - 13, y0 + 18);
  c.fillStyle = '#fff'; c.font = '900 13px Cairo, sans-serif'; c.fillText(b.dest, x - 8, y0 + 18);
  const hi = k => kind === k ? '#FFD54A' : '#D6E4F7'; c.font = '800 10.5px Cairo, sans-serif';
  c.fillStyle = hi('dep'); c.fillText('تنطلق ' + hhmm(b.dep), x, y0 + 35); c.fillStyle = hi('arr'); c.fillText('تصل ' + hhmm(b.arr), x, y0 + 50);
  c.fillStyle = hi('dur'); c.fillText('⏱ ' + durShort(b.dur), x, y0 + 66);
  c.restore();
}
const durShort = m => `${Math.floor(m / 60) ? ar(Math.floor(m / 60)) + ' س' : ''}${Math.floor(m / 60) && m % 60 ? ' ' : ''}${m % 60 ? ar(m % 60) + ' د' : ''}`;
/* بطاقة المسافر أثناء مرافقته: طلبه، والجدول مع إبراز العمود الذي يقارن به (بلا كشف الجواب) */
function ttCard(d) {
  let el = document.getElementById('ttCard'); const on = d.follow >= 0 && !d.leave && !game.busy;
  if (!on) { if (el) el.remove(); return; }
  const p = d.pax[d.follow], key = p.name + d.follow; if (el && el.dataset.k === key) return;
  if (!el) { el = document.createElement('div'); el.id = 'ttCard'; document.body.appendChild(el); }
  el.dataset.k = key; const col = { dep: 'الانطلاق', dur: 'المدة', arr: 'الوصول' }[p.kind];
  el.innerHTML = `<b>🧳 طلب ${p.name}</b><p>${p.text}</p><table class="tt"><tr><th>الرصيف</th><th>الوجهة</th><th class="${p.kind === 'dep' ? 'hl' : ''}">الانطلاق</th><th class="${p.kind === 'dur' ? 'hl' : ''}">المدة</th><th class="${p.kind === 'arr' ? 'hl' : ''}">الوصول</th></tr>
    ${d.buses.map(b => `<tr><td>${BAYS[b.bay].id}</td><td>${b.dest}</td><td class="${p.kind === 'dep' ? 'hl' : ''}">${hhmm(b.dep)}</td><td class="${p.kind === 'dur' ? 'hl' : ''}">${durShort(b.dur)}</td><td class="${p.kind === 'arr' ? 'hl' : ''}">${hhmm(b.arr)}</td></tr>`).join('')}</table>
    <small>💡 قارن عمود «${col}» بطلب ${p.name}، ثم امشِ إلى رصيف الحافلة المناسبة.</small>`;
}

/* ═══ ١٤. التقويمات — «تقويم المهرجان» ═══ */
const WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MON = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const D0 = (y, m, d) => Date.UTC(y, m, d), DAY = 86400000;
const parts = ms => { const x = new Date(ms); return { y: x.getUTCFullYear(), m: x.getUTCMonth(), d: x.getUTCDate(), w: x.getUTCDay() }; };
const said = ms => { const p = parts(ms); return `${WD[p.w]} ${ar(p.d)} ${MON[p.m]}`; };
export const calendars = {
  id: 'calendars', giver: 'shaikha',
  intro: n => [
    { who: 'shaikha', text: `أهلاً يا ${n}! أنا الجدة شيخة، منظمة مهرجان السوق.` },
    { who: 'shaikha', text: 'أريد تثبيت مواعيد المهرجان على التقويم الكبير. اقرأ كل موعد، واضغط يومه على التقويم.' }
  ],
  begin(d) {
    const Y = 2027, m1 = R(0, 9);
    let first = D0(Y, m1, R(1, 7)); const wd = parts(first).w;
    const s2 = D0(Y, R(0, 10), R(18, 26)), n2 = R(6, 11), s3 = D0(Y, R(0, 10), R(10, 24)), k3 = R(1, 4);
    d.rounds = [
      { text: `حصة غوص كل يوم ${WD[wd]}، أولها ${said(first)}. ما تاريخ الحصة الثالثة؟`, ans: first + 14 * DAY, show: first },
      { text: `يبدأ المهرجان ${said(s2)}، والسباق الكبير بعد ${ar(n2)} أيام من البداية. ما تاريخ السباق؟`, ans: s2 + n2 * DAY, show: s2 },
      { text: `ورشة الفخار بعد أسبوعين و${ar(k3)} ${k3 === 1 ? 'يوم' : 'أيام'} من ${said(s3)}. متى الورشة؟`, ans: s3 + (14 + k3) * DAY, show: s3 }
    ];
    d.r = 0;
  },
  goal: d => `📅 ثبّت مواعيد المهرجان على التقويم (${ar(Math.min(d.r, 3))} من ${ar(3)})`,
  target: () => CAL,
  taps: () => [{ x: CAL.x, y: CAL.y - 50, hit: 50, approach: { x: CAL.x, y: CAL.y + 24 } }],
  actions(W, d) { return near(W, { x: CAL.x, y: CAL.y + 16 }, 50) ? [{ key: 'cal', label: '📅 تقويم المهرجان', kind: 'go', run: () => this.open(W, d) }] : []; },
  open(W, d, msg, kind, view) {
    const r = d.rounds[d.r], v = view !== undefined ? view : (() => { const p = parts(r.show); return p.y * 12 + p.m; })();
    const Y = Math.floor(v / 12), M = v % 12, first = new Date(D0(Y, M, 1)).getUTCDay(), days = new Date(Date.UTC(Y, M + 1, 0)).getUTCDate();
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let dd = 1; dd <= days; dd++) cells += `<button class="day" data-day="${dd}">${ar(dd)}</button>`;
    sheetOpen(`<h3>📅 تقويم المهرجان</h3>${msgBox(msg || r.text, kind)}
      <div class="calhead"><button class="act ghost" id="calPrev">▶</button><b>${MON[M]} ${ar(Y)}</b><button class="act ghost" id="calNext">◀</button></div>
      <div class="cal">${['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(w => `<i>${w}</i>`).join('')}${cells}</div>
      <button class="act ghost" id="benchOut">رجوع</button>`);
    document.getElementById('calPrev').onclick = e => { e.stopPropagation(); this.open(W, d, msg, kind, v - 1); };
    document.getElementById('calNext').onclick = e => { e.stopPropagation(); this.open(W, d, msg, kind, v + 1); };
    document.getElementById('benchOut').onclick = e => { e.stopPropagation(); sheetClose(); changed(); };
    panel().querySelectorAll('.day').forEach(b => b.onclick = async e => {
      e.stopPropagation();
      const picked = D0(Y, M, +b.dataset.day);
      if (picked === r.ans) {
        sfx('win'); d.r++; changed();
        if (d.r >= d.rounds.length) { sheetClose(); await finish(W, 'calendars', [{ who: 'shaikha', text: 'التقويم مكتمل ومرتب! الكل يعرف مواعيد المهرجان الآن.' }]); }
        else this.open(W, d, `✓ ثبّتُّ الموعد ${said(picked)}. ${d.rounds[d.r].text}`, 'ok');
      } else { sfx('cough'); b.classList.add('bad'); const m = panel().querySelector('#benchMsg'); m.className = 'speech bad'; m.textContent = `${said(picked)} ليس الموعد الصحيح. ${r.text}`; }
    });
  },
  draw(d, t, active, done) {
    const n = done ? 3 : (d.r || 0); if (!n) return [];
    return [{ y: CAL.y + 1, draw: c => { const cols = ['#E85D75', '#2F6FB2', '#2E8B57']; for (let i = 0; i < n; i++) { c.fillStyle = cols[i]; rr(c, CAL.x - 40 + i * 28, CAL.y - 76, 22, 18, 3); c.fill(); c.fillStyle = '#fff'; c.font = '10px sans-serif'; c.textAlign = 'center'; c.fillText('📌', CAL.x - 29 + i * 28, CAL.y - 62); } } }];
  }
};

/* ═══ ١٥. المساحة والمحيط — «سياج الحظيرة» ═══ */
export const areaPerimeterT1 = {
  id: 'areaPerimeterT1', giver: 'juma',
  intro: n => [
    { who: 'juma', text: `السلام عليكم يا ${n}! أنا جمعة الراعي، وأغنامي تحتاج حظائر جديدة.` },
    { who: 'juma', text: 'كل مربع في الأرض متر واحد. اضبط طول الحظيرة وعرضها، ثم ابنِ السياج.' }
  ],
  begin(d) {
    const AP = shuffle([[24, 20], [30, 22], [36, 24], [40, 26], [42, 26], [20, 18], [28, 22], [18, 18], [32, 24]]).slice(0, 2).map(([A, P]) => ({ A, P }));
    AP.push({ P: [28, 32, 36][R(0, 2)], max: true });
    d.rounds = AP; d.r = 0; d.l = 1; d.w = 1; d.built = 0;
  },
  goal: d => { const r = d.rounds[Math.min(d.r, 2)]; return r.max ? `🐑 معك ${ar(r.P)} م من السياج بالضبط: ابنِ بها أكبر حظيرة ممكنة` : `🐑 ابنِ حظيرة مساحتها ${ar(r.A)} م² ومحيطها ${ar(r.P)} م`; },
  target: () => ({ x: PEN.x + 160, y: PEN.y + 330 }),
  taps: () => [{ x: PEN.x + 160, y: PEN.y + 160, hit: 160, approach: { x: PEN.x + 160, y: PEN.y + 340 } }],
  actions(W, d) {
    const S = PEN.cell * PEN.n;
    if (!(W.player.x > PEN.x - 50 && W.player.x < PEN.x + S + 50 && W.player.y > PEN.y - 50 && W.player.y < PEN.y + S + 60)) return [];
    const st = (k, v) => () => { d[k] = clamp(d[k] + v, 1, PEN.n); d.built = 0; sfx('click'); changed(); };
    return [
      { key: 'pen', label: '➕ الطول', kind: 'ghost', run: st('l', 1), disabled: d.l >= 10 }, { key: 'pen', label: '➖ الطول', kind: 'ghost', run: st('l', -1), disabled: d.l <= 1 },
      { key: 'pen', label: '➕ العرض', kind: 'ghost', run: st('w', 1), disabled: d.w >= 10 }, { key: 'pen', label: '➖ العرض', kind: 'ghost', run: st('w', -1), disabled: d.w <= 1 },
      { key: 'pen', label: '🔨 ابنِ السياج', kind: 'green', run: () => this.build(W, d) }
    ];
  },
  async build(W, d) {
    const r = d.rounds[d.r], A = d.l * d.w, P = 2 * (d.l + d.w), c = { x: PEN.x + 160, y: PEN.y + 120 };
    let msg = null;
    if (r.max) { if (P !== r.P) msg = `معك ${ar(r.P)} م من السياج بالضبط، لا أقل ولا أكثر`; else if (d.l !== d.w) msg = 'السياج يكفي، لكن هل هذه أكبر مساحة ممكنة؟'; }
    else if (A !== r.A) msg = A < r.A ? 'الأغنام لا تتسع في هذه الحظيرة' : 'الحظيرة أكبر مما يحتاجه القطيع';
    else if (P !== r.P) msg = `السياج المتوفر ${ar(r.P)} م بالضبط`;
    if (msg) { sfx('cough'); say(c.x, c.y, msg, '#C2304A', 2600); return; }
    d.built = Date.now(); sfx('plant'); say(c.x, c.y, `✓ ${ar(d.l)} × ${ar(d.w)} = ${ar(A)} م²`, '#1FA05A', 1800); changed();
    await wait(1800); d.r++;
    if (d.r >= d.rounds.length) { d.final = [d.l, d.w]; changed(); await finish(W, 'areaPerimeterT1', [{ who: 'juma', text: 'حظائر واسعة ومحكمة! الأغنام سعيدة.' }]); return; }
    d.l = 1; d.w = 1; d.built = 0; changed();
  },
  ground(c, d, active, done) {
    const [l, w] = done && d.final ? d.final : [d.l || 0, d.w || 0]; if (!l) return;
    const x = PEN.x, y = PEN.y, cs = PEN.cell, built = done || d.built;
    const W2 = l * cs, H2 = w * cs;
    if (!built) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, W2, H2); c.strokeStyle = '#2A1B66'; c.lineWidth = 2; c.setLineDash([6, 5]); c.strokeRect(x, y, W2, H2); c.setLineDash([]); return; }
    c.fillStyle = pattern(c, 'grass'); c.fillRect(x, y, W2, H2); c.fillStyle = 'rgba(60,35,10,.18)'; c.fillRect(x, y, W2, 6);   // عشب الحظيرة
    const rail = (x1, y1, x2, y2) => { c.strokeStyle = '#6B4520'; c.lineWidth = 2.4; [10, 4].forEach(h => { c.beginPath(); c.moveTo(x1, y1 - h); c.lineTo(x2, y2 - h); c.stroke(); }); };
    const postAt = (px, py) => { c.fillStyle = '#5A3A1A'; c.fillRect(px - 2, py - 15, 4, 16); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(px - 2, py - 15, 1.2, 16); };
    rail(x, y, x + W2, y); for (let i = 0; i <= l; i++) postAt(x + i * cs, y);   // السياج الخلفي والجانبان
    for (let j = 0; j <= w; j++) { postAt(x, y + j * cs); postAt(x + W2, y + j * cs); } rail(x, y, x, y + H2); rail(x + W2, y, x + W2, y + H2);
    for (let k = 0; k < Math.min(6, l * w / 4); k++) {   // خراف: صوف، رأس داكن، وأرجل
      const sx = x + 16 + (k * 37) % Math.max(20, W2 - 30), sy = y + 22 + Math.floor(k * 37 / Math.max(20, W2 - 30)) * 26 % Math.max(20, H2 - 30);
      c.fillStyle = 'rgba(40,60,20,.25)'; c.beginPath(); c.ellipse(sx + 2, sy + 1, 10, 3, 0, 0, 7); c.fill();
      c.fillStyle = '#2E2620'; [-5, -1, 3, 6].forEach(dx => c.fillRect(sx + dx, sy - 4, 1.8, 5));
      c.fillStyle = '#F4F1E8'; [[-4, -8], [0, -10], [4, -8], [0, -6]].forEach(([dx, dy]) => { c.beginPath(); c.arc(sx + dx, sy + dy, 5, 0, 7); c.fill(); });
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .7; c.beginPath(); c.ellipse(sx, sy - 8, 9, 5.5, 0, 0, 7); c.stroke();
      c.fillStyle = '#3A2E1E'; c.beginPath(); c.ellipse(sx + 10, sy - 10, 3.2, 4, .3, 0, 7); c.fill(); }
    rail(x, y + H2, x + W2, y + H2); for (let i = 0; i <= l; i++) postAt(x + i * cs, y + H2);   // السياج الأمامي
  }
};

export const UNIT2 = { lengthMeasure, lineDrawing, timeTables, calendars, areaPerimeterT1 };
