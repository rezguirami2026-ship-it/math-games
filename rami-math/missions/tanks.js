// مهمة «خزانات البيوت»: الكسور هنا مستوى ماء حقيقي يضخه اللاعب بيده
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, clamp, wait, rr } from '../core/util.js';
import { say, puff, floatUp } from '../world/entities.js';
import { earn } from '../rewards/goodDeeds.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';
import { complete } from './quests.js';

export const TANKS = [{ x: 1030, y: 292, house: 0 }, { x: 1052, y: 452, house: 3 }, { x: 1458, y: 522, house: 4 }];
const POOL = {
  f: [[1, 2, 5], [2, 5, 4], [3, 5, 6], [4, 5, 8], [1, 5, 2], [3, 10, 3], [7, 10, 7]].map(([n, d, v]) => ({ t: 'f', n, d, v })),
  d: [['٠٫٧', 7], ['٠٫٣', 3], ['٠٫٩', 9], ['٠٫٢', 2], ['٠٫٦', 6]].map(([s, v]) => ({ t: 'd', s, v })),
  p: [['٤٠٪', 4], ['٨٠٪', 8], ['١٠٪', 1], ['٧٠٪', 7], ['٥٠٪', 5]].map(([s, v]) => ({ t: 'p', s, v }))
};
const M = () => game.state.missions.tanks;
const changed = () => { bus.emit('mission'); bus.emit('save'); };
const pick = a => a[Math.floor(Math.random() * a.length)];

export function setup() {
  const m = M(); if (m.targets) return;
  let f, d, p;
  do { f = pick(POOL.f); d = pick(POOL.d); p = pick(POOL.p); } while (new Set([f.v, d.v, p.v]).size < 3);
  m.targets = [f, d, p].sort(() => Math.random() - .5);
}
export function pump(W, i, dir) {
  const m = M(); if (m.done[i]) return;
  const nv = clamp(m.levels[i] + dir, 0, 10); if (nv === m.levels[i]) return;
  m.levels[i] = nv; sfx(dir > 0 ? 'pick' : 'drop');
  if (dir > 0) puff(TANKS[i].x, TANKS[i].y - 70, '#9fd8ff', 2);
  changed();
}
export async function seal(W, i) {
  const s = game.state, m = M(), tk = TANKS[i], want = m.targets[i].v, got = m.levels[i];
  m.tries++;
  if (got === want) {
    m.done[i] = true; sfx('win'); changed();
    say(tk.x, tk.y - 118, 'وصل الماء إلى البيت!', '#1FA05A', 2200);
    earn(15, tk.x, tk.y - 90);
    if (m.done.every(Boolean)) {
      m.status = 'done'; s.gear.owned.flask = Date.now(); complete('decimalFractions'); changed();
      await wait(1200); earn(30, W.player.x, W.player.y - 80); unlock('waterkeeper');
      await W.talk('umkhalid', [
        { who: 'umkhalid', text: 'امتلأت الخزانات كلها بالقدر الذي يحتاجه كل بيت، لا قطرة زائدة ولا ناقصة!' },
        { who: 'umkhalid', text: 'خذ هذه القربة هديةً مني، تجدها في خزانة البطل.' }
      ]);
      W.toast('💧 حصلت على قربة الماء، جرّبها في خزانة البطل');
    }
    return;
  }
  if (got > want) { sfx('cough'); for (let k = 0; k < 3; k++) puff(tk.x + (k - 1) * 12, tk.y - 82, '#7cc8ff', 5); say(tk.x, tk.y - 118, 'فاض الماء! أكثر من حاجة البيت', '#C2304A', 2400); }
  else { sfx('drop'); say(tk.x, tk.y - 118, 'الماء لا يكفي هذا البيت', '#B7791F', 2400); }
}

/* رسم الخزان: عشرة أقسام بلا أرقام، ولوحة الهدف بالكسر أو العشري أو النسبة */
export function drawTank(ctx, i, level, target, done, t) {
  const tk = TANKS[i], x = tk.x, y = tk.y, w = 34, h = 62;
  ctx.fillStyle = 'rgba(60,35,10,.2)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 24, 6, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#7B6A55'; ctx.lineWidth = 3;
  [[-13, 0], [13, 0]].forEach(([dx]) => { ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.lineTo(x + dx * .7, y - 22); ctx.stroke(); });
  const top = y - 22 - h;
  ctx.fillStyle = '#E8EEF3'; rr(ctx, x - w / 2, top, w, h, 8); ctx.fill();
  if (level > 0) {
    const lh = (h - 6) * level / 10;
    ctx.save(); rr(ctx, x - w / 2 + 3, top + 3, w - 6, h - 6, 6); ctx.clip();
    ctx.fillStyle = done ? '#2D9CDB' : '#56B4F0'; ctx.fillRect(x - w / 2, top + h - 3 - lh, w, lh + 3);
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(x - w / 2, top + h - 3 - lh + Math.sin(t * 4) * 1.2, w, 2);
    ctx.restore();
  }
  ctx.strokeStyle = '#6E7F8E'; ctx.lineWidth = 1.2;
  for (let k = 1; k < 10; k++) { const yy = top + 3 + (h - 6) * (1 - k / 10); ctx.beginPath(); ctx.moveTo(x + w / 2 - (k === 5 ? 12 : 7), yy); ctx.lineTo(x + w / 2 - 1, yy); ctx.stroke(); }
  ctx.strokeStyle = done ? '#1FA05A' : '#5E6B78'; ctx.lineWidth = 2.4; rr(ctx, x - w / 2, top, w, h, 8); ctx.stroke();
  // لوحة الهدف
  const sy = top - 30;
  ctx.fillStyle = done ? '#1FA05A' : '#FFFDF6'; rr(ctx, x - 22, sy - 16, 44, 30, 8); ctx.fill();
  ctx.strokeStyle = '#C9A46B'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = done ? '#fff' : '#2A1B66'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (done) { ctx.font = '900 18px Cairo, sans-serif'; ctx.fillText('✓', x, sy); }
  else if (target.t === 'f') {
    ctx.font = '900 12px Cairo, sans-serif'; ctx.fillText(ar(target.n), x, sy - 7); ctx.fillText(ar(target.d), x, sy + 8);
    ctx.fillRect(x - 7, sy, 14, 1.6);
  } else { ctx.font = '900 14px Cairo, sans-serif'; ctx.fillText(target.s, x, sy + 1); }
  ctx.textBaseline = 'alphabetic';
}
/* أحواض الزهور أمام البيت الذي وصله الماء */
export function drawFlowers(ctx, house) {
  const y = house.y + house.h + 6, cols = ['#E85D75', '#FFC23D', '#9C6BFF', '#FF8A3D'];
  ctx.fillStyle = '#8B5A2B'; rr(ctx, house.x + 8, y - 4, 40, 9, 3); ctx.fill(); rr(ctx, house.x + house.w - 48, y - 4, 40, 9, 3); ctx.fill();
  [house.x + 12, house.x + house.w - 44].forEach(x0 => { for (let k = 0; k < 4; k++) { ctx.fillStyle = '#3E8E41'; ctx.fillRect(x0 + k * 9 + 3, y - 9, 2, 6); ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.arc(x0 + k * 9 + 4, y - 10, 3.4, 0, 7); ctx.fill(); } });
}
