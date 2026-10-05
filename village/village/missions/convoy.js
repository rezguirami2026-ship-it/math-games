// مهمة «قافلة المزرعة»: القسمة هنا ليست سؤالاً، بل توزيع صناديق حقيقي على شاحنات
import { game, BOXES, CARRY_MAX } from '../core/state.js';
import { bus } from '../core/events.js';
import { inspectLoads } from '../math/distribution.js';
import { ar, wait } from '../core/util.js';
import { say, puff } from '../world/entities.js';
import { FARM_PARK, SIGNAL, FARM } from '../world/village.js';
import { earn } from '../rewards/goodDeeds.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';

const M = () => game.state.missions.convoy;
const changed = () => { bus.emit('mission'); bus.emit('save'); };

export function pick(W) {
  const s = game.state, m = M();
  if (m.pile <= 0) return say(W.player.x, W.player.y - 80, 'المستودع فارغ', '#B7791F');
  if (s.carry >= CARRY_MAX) return say(W.player.x, W.player.y - 80, 'لا أستطيع حمل المزيد!', '#C2304A');
  m.pile--; s.carry++; sfx('pick'); changed();
}
export function putBack(W) { const s = game.state, m = M(); if (!s.carry) return; s.carry--; m.pile++; sfx('drop'); changed(); }
export function load(W, i) { const s = game.state, m = M(); if (!s.carry) return; s.carry--; m.loads[i]++; sfx('drop'); puff(W.trucks[i].x - 10, W.trucks[i].y - 30, '#E8D2A6', 3); changed(); }
export function unload(W, i) { const s = game.state, m = M(); if (!m.loads[i] || s.carry >= CARRY_MAX) return; m.loads[i]--; s.carry++; sfx('pick'); changed(); }

export async function launch(W) {
  const s = game.state, m = M();
  if (m.status !== 'active' || game.busy) return;
  if (m.pile > 0 || s.carry > 0) {
    say(SIGNAL.x, SIGNAL.y - 108, m.pile > 0 ? 'صناديق ما زالت في المستودع!' : 'ما زلت تحمل صناديق!', '#C2304A', 2400);
    sfx('cough'); return;
  }
  const r = inspectLoads(m.loads, BOXES);
  m.attempts++; changed();
  game.busy = true; sfx('engine');
  W.trucks.forEach(t => puff(t.x - 42, t.y - 6, '#9a9a9a', 3));
  await wait(700);
  if (!r.equal) {   // العالم يتفاعل مع الخطأ: الثقيلة تهبط وتسعل، والخفيفة تتأرجح
    sfx('cough');
    r.heavy.forEach(i => { const t = W.trucks[i]; t.sag = 4; t.flash = 1; t.shake = 1; say(t.x, t.y - 80, 'ثقيلة!', '#C2304A', 2800); puff(t.x - 42, t.y - 6, '#444', 10); });
    r.light.forEach(i => { const t = W.trucks[i]; t.shake = 1; say(t.x, t.y - 80, 'خفيفة', '#B7791F', 2800); });
    await wait(1500);
    W.trucks.forEach(t => { t.shake = 0; });
    game.busy = false;
    await W.talk('salem', [{ who: 'salem', text: 'الشاحنات الحمراء أثقل من غيرها والأخرى أخف… لن أخاطر بالطريق قبل أن تتساوى الحمولات.' }]);
    W.trucks.forEach(t => { t.sag = 0; t.flash = 0; });   // يبقى الأحمر ظاهراً حتى ينتهي الكلام
    return;
  }
  // نجاح: تُغطّى الحمولات، تدور المحركات، وتنطلق القافلة إلى المزرعة
  W.signalGreen = true; sfx('engine');
  W.trucks.forEach(t => { t.covered = true; puff(t.x - 42, t.y - 6, '#eee', 6); });
  say(SIGNAL.x, SIGNAL.y - 108, 'القافلة جاهزة!', '#1FA05A', 1800);
  await wait(900);
  const order = [5, 4, 3, 2, 1, 0];
  order.forEach((i, k) => setTimeout(() => {
    const t = W.trucks[i];
    t.path = [{ x: t.x, y: 640 }, { x: FARM_PARK[i].x, y: 640 }, { x: FARM_PARK[i].x, y: FARM_PARK[i].y }];
    puff(t.x - 42, t.y - 6, '#eee', 4);
  }, k * 380));
  W.camFollow(W.trucks[0]);
  await wait(400);
  while (W.trucks.some(t => t.path === undefined || t.path === null || t.path.length)) {
    if (W.trucks.every(t => t.path && !t.path.length)) break;
    await wait(200);
  }
  W.trucks.forEach(t => { t.path = null; });
  s.world.delivered = Date.now(); m.status = 'done'; changed();
  W.camFollow({ x: FARM.x + FARM.w / 2, y: FARM.y + FARM.h / 2 });
  sfx('win');
  await wait(2600);
  earn(50, FARM.x + FARM.w / 2, FARM.y + 60);
  unlock('convoy'); if (m.attempts === 1) unlock('sharp');
  await wait(900);
  W.camFollow(null);
  game.busy = false;
  await W.talk('salem', [
    { who: 'salem', text: `أحسنتَ التوزيع! حملت كل شاحنة ${ar(r.share)} صناديق، فوصلت القافلة بسلام.` },
    { who: 'narrator', text: 'عاد الماء يجري في الفلج، وبدأت المزرعة تخضرّ.' }
  ]);
}
