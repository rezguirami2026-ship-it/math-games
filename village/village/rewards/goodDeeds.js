// 💚 نقاط الخير: تُكسب بالمساعدة وتُنفق لتغيير العالم
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar } from '../core/util.js';
import { floatUp } from '../world/entities.js';
import { sfx } from '../core/sound.js';
export function earn(n, x, y) { game.state.good += n; floatUp(x, y, '+' + ar(n) + ' 💚', '#1FA05A'); sfx('good'); bus.emit('good'); bus.emit('save'); }
export function spend(n) { if (game.state.good < n) return false; game.state.good -= n; bus.emit('good'); bus.emit('save'); return true; }
