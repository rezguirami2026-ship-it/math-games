// الصف الخامس: أدوات مشتركة لمحطات المناطق (طاولة عمل قرب صاحب المهمة، وأداة مرسومة في العالم أثناء الدرس)
import { ar } from '../../core/util.js';
import { bigSign } from '../../world/art.js';
import { sfx } from '../../core/sound.js';
import { near, changed, finish, panel, sheetOpen, sheetClose, msgBox, setMsg, btn, numPad } from '../bench.js';
export const H = v => Math.round(v * 1000);
export const step = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;
/* محطة: سهم ونقر وزر يفتح طاولة العمل، والأداة مرسومة في العالم ما دام الدرس جارياً */
/* مهام انتهت جولاتها وتنتظر الختام: زر المحطة يختفي حتى لا تُفتح الطاولة من جديد في لحظة ما قبل التحدي (في الذاكرة فقط، لا في الحفظ) */
const ENDING = new WeakSet();
export const at = (st, key, label, prop) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 44, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return !ENDING.has(d) && near(W, { x: st.x, y: st.y + 16 }, 52) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; },
  draw(d, t, active, done) { return active ? [{ y: st.y, x: st.x, draw: c => prop(c, st.x, st.y, d, t) }] : done ? [{ y: st.y, x: st.x, draw: c => bigSign(c, st.x, st.y, '✓ ' + label.replace(/^\S+\s/, ''), { fs: 13, h: 34, bg: '#1F8A5A' }) }] : []; }
});
/* الجولة التالية، أو الختام: جملة صاحب المهمة أولاً ثم إنهاء الدرس (finish يفتح «تحدي الشخصية» فوراً، فلو جاءت الجملة بعده لظهرت فوق أسئلته) */
export async function advance(mod, W, d, n, id, lines, next) { sfx('win'); d.r++; if (next && d.r < n) next(d); changed(); if (d.r >= n) { ENDING.add(d); sheetClose(); if (lines) await W.talk(lines[0].who, lines); await finish(W, id, null); } else mod.open(W, d, '✓ أحسنت!', 'ok'); }
/* جولة بلوحة أرقام */
export function kp(mod, W, d, o) {
  sheetOpen(`<h3>${o.title}</h3>${o.visual || ''}${msgBox(o.msg ? `${o.msg} ${o.text}` : o.text, o.kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
  const pad = numPad(panel().querySelector('#pad'), o.label || '✓ الجواب', async v => { if (H(v) === H(o.ans)) await advance(mod, W, d, o.n, o.id, o.lines); else { sfx('cough'); pad.clear(); setMsg(`${o.hint} ${o.text}`, 'bad'); } }, o.opts || {});
  btn('benchOut', () => { sheetClose(); changed(); });
}
export const out = () => btn('benchOut', () => { sheetClose(); changed(); });
export function shadowE(c, x, y, w) { c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 8, y + 2, w, 7, 0, 0, 7); c.fill(); }
