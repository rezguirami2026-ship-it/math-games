// الزراعة: نقاط الخير تتحول إلى نخلة تنمو أمام اللاعب وتبقى في العالم
import { game, TREE_COST } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait } from '../core/util.js';
import { TREE_SPOTS } from '../world/village.js';
import { say, puff, floatUp } from '../world/entities.js';
import { spend } from '../rewards/goodDeeds.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';
export async function plant(W, i) {
  const s = game.state; if (s.world.trees[i] || game.busy) return;
  if (!spend(TREE_COST)) return say(W.player.x, W.player.y - 80, `أحتاج ${ar(TREE_COST)} 💚`, '#C2304A');
  game.busy = true; const sp = TREE_SPOTS[i]; W.player.dir = 'up'; W.player.act = 'plant';
  for (let k = 0; k < 4; k++) { puff(sp.x, sp.y, '#B98B5E', 4); sfx('drop'); await wait(300); }
  W.player.act = null; s.world.trees[i] = Date.now(); sfx('plant');
  floatUp(sp.x, sp.y - 70, 'نخلة جديدة 🌴', '#1FA05A');
  bus.emit('mission'); bus.emit('save');
  unlock('tree1'); if (s.world.trees.filter(Boolean).length === 3) { unlock('grove'); s.gear.owned.gold = Date.now(); bus.emit('save'); W.toast && W.toast('⭐ فُتح التطريز الذهبي في خزانة البطل'); }
  game.busy = false;
}
