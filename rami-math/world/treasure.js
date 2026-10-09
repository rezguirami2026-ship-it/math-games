// الكنوز المخفية: ١٦ صندوقاً في أركان العالم (اثنان في كل منطقة). يظهر الصندوق حين تُفتح منطقته، ويُفتح بلغز من درس أنجزته.
// المكافأة ٥ 💎، ويبقى مفتوحاً. لا مؤقت ولا عقاب. المواضع اختيرت آلياً: يمكن الوصول إليها وبعيدة عن الشخصيات.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';
import { LESSONS } from '../content/lessons.js';
import { runChallenge, pickN } from '../missions/challenge.js';
import { sheetOpen, sheetClose, btn } from '../missions/bench.js';

// [المعرّف، x، y، فهرس بوابة المنطقة (-1 للقرية)]
export const TREASURES = [
  ['t1', 1110, 270, -1], ['t2', 60, 1530, -1], ['t3', 1790, 550, 0], ['t4', 2000, 1460, 0], ['t5', 2380, 550, 1], ['t6', 2450, 970, 1],
  ['t7', 1670, 2140, 2], ['t8', 690, 1790, 2], ['t9', 1390, 3170, 7], ['t10', 2650, 3380, 3], ['t11', 2090, 3790, 4], ['t12', 480, 4280, 4],
  ['t13', 410, 5210, 5], ['t14', 1950, 4790, 5], ['t15', 130, 6350, 6], ['t16', 1880, 6140, 6]
].map(([id, x, y, g]) => ({ id, x, y, g }));
const found = () => { const s = game.state; return (s.treasure = s.treasure || {}); };
export const treasureCount = () => Object.keys(found()).length;
const avail = (t, open) => t.g < 0 || !!open[t.g];
export function nearTreasure(pl, open) { return TREASURES.find(t => !found()[t.id] && avail(t, open) && Math.hypot(pl.x - t.x, pl.y - (t.y + 14)) < 50) || null; }

export function treasureItems(view, open, t0) {
  return TREASURES.filter(t => avail(t, open) && (!view || (t.x > view.x - 60 && t.x < view.x + view.w + 60 && t.y > view.y - 60 && t.y < view.y + view.h + 120))).map(t => ({ y: t.y, x: t.x, draw: c => chest(c, t.x, t.y, !!found()[t.id], t0) }));
}
function chest(c, x, y, opened, t) {
  c.save(); c.translate(x, y); c.scale(1.4, 1.4); c.translate(-x, -y);
  c.fillStyle = 'rgba(60,35,10,.25)'; c.beginPath(); c.ellipse(x + 6, y, 18, 5, 0, 0, 7); c.fill();
  if (!opened) { const k = .5 + Math.sin(t * 3 + x) * .5; c.fillStyle = `rgba(255,214,90,${.25 + k * .25})`; c.beginPath(); c.arc(x, y - 12, 22 + k * 4, 0, 7); c.fill();
    c.fillStyle = '#FFF4B8'; [[-16, -30], [14, -34], [0, -40]].forEach(([dx, dy], i) => { const s = 2 + Math.sin(t * 4 + i * 2) * 1.5; c.beginPath(); c.moveTo(x + dx, y + dy - s * 2); c.lineTo(x + dx + s * .6, y + dy - s * .6); c.lineTo(x + dx + s * 2, y + dy); c.lineTo(x + dx + s * .6, y + dy + s * .6); c.lineTo(x + dx, y + dy + s * 2); c.lineTo(x + dx - s * .6, y + dy + s * .6); c.lineTo(x + dx - s * 2, y + dy); c.lineTo(x + dx - s * .6, y + dy - s * .6); c.fill(); }); }
  c.fillStyle = '#7A4A22'; c.fillRect(x - 14, y - 16, 28, 16); c.fillStyle = '#9C6438'; c.fillRect(x - 14, y - 14, 28, 3);
  if (opened) { c.fillStyle = '#5A3412'; c.fillRect(x - 14, y - 30, 28, 14); c.fillStyle = '#FFD54A'; c.fillRect(x - 11, y - 18, 22, 3); }
  else { c.fillStyle = '#8A5A2A'; c.beginPath(); c.moveTo(x - 15, y - 16); c.quadraticCurveTo(x, y - 30, x + 15, y - 16); c.fill(); }
  c.fillStyle = '#E3B04B'; c.fillRect(x - 15, y - 9, 30, 3); c.fillRect(x - 2, y - 16, 4, 9); c.strokeStyle = '#3E220A'; c.lineWidth = 1; c.strokeRect(x - 14, y - 16, 28, 16);
  c.restore();
}
/* فتح الكنز: لغز واحد من درس منجز (أو من القيمة المكانية) */
export function openTreasure(W, t, MODS, quests) {
  const done = LESSONS.filter(l => quests.isDone(l.id) && MODS[l.id] && MODS[l.id].challenge), l = done.length ? pickN(done, 1)[0] : LESSONS[0], ch = MODS[l.id].challenge;
  sheetOpen(`<div class="chEnd acIntro"><div class="chTreasure">🎁</div><h3>وجدتَ صندوق كنز!</h3><p class="muted">الصندوق مقفل بلغز من درس «${l.title}». حلّه لتفتحه وتنال ٥ 💎.</p>
    <button class="act big go" id="acGo">حلّ اللغز 🔓</button><button class="act ghost" id="acBack">لاحقاً</button></div>`);
  document.querySelector('#panel .sheet').classList.add('chSheet');
  btn('acBack', () => sheetClose());
  btn('acGo', () => {
    const items = [pickN(ch.make(), 1)[0]], d = { ch: { items, i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } };
    found(); game.state.treasureRun = d;
    runChallenge(W, d, { id: 'treasure', who: ch.who, title: '🎁 لغز الكنز', make: () => items,
      exit: () => { delete game.state.treasureRun; },
      onDone: () => {
        delete game.state.treasureRun; found()[t.id] = Date.now(); game.state.gems = (game.state.gems || 0) + 5; bus.emit('gems'); bus.emit('save'); sfx('win');
        sheetOpen(`<div class="chEnd"><div class="chTreasure">💎</div><h3>فُتح الكنز!</h3><p class="chGot">+٥ 💎</p><p class="muted">وجدتَ ${ar(treasureCount())} من ${ar(TREASURES.length)} كنزاً. ابحث عن الباقي في أركان العالم!</p><button class="act big go" id="acEnd">رائع!</button></div>`);
        document.querySelector('#panel .sheet').classList.add('chSheet'); btn('acEnd', () => sheetClose());
      } });
  });
}
