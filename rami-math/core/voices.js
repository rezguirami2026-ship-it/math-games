// أصوات الشخصيات: جمل قصيرة مسجّلة بالأصوات العُمانية (assets/voice/<النوع>_<الجملة>.mp3، تُولَّد من tests/voice/gen.py).
// النوع من مظهر الشخصية (رجل، امرأة، شيخ، جدّة، ولد)، ولكل شخصية سرعة نطق ثابتة قليلاً فلا تتشابه أصواتهم.
// التحية مرة كل ٤٥ ثانية للشخصية نفسها على الأكثر، والإطراء مع الإجابة الصحيحة، والشكر عند إنهاء الدرس.
import { voice } from './sound.js';
const KEY = 'ramimath_voices';
export const voices = { on: (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } })() };
export function setVoices(v) { voices.on = v; try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) {} }
const hash = id => [...String(id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
export const vtype = n => !n ? 'man' : n.kind === 'boy' ? 'boy' : n.kind === 'woman' ? (n.elder ? 'gran' : 'woman') : (n.elder ? 'old' : 'man');
const rate = id => .94 + (Math.abs(hash(id)) % 13) / 100;
let cast = {}, heroKind = 'boy';
export const setCast = (npcs, kind) => { cast = {}; npcs.forEach(n => { cast[n.id] = n; }); heroKind = kind || 'boy'; };
const last = {};
const play = (id, k) => { if (!voices.on || !cast[id]) return false; voice(`${vtype(cast[id])}_${k}`, rate(id)); last[id] = Date.now(); return true; };
export function greet(id) { if (Date.now() - (last[id] || 0) < 45000) return; play(id, 'g' + (1 + (Math.abs(hash(id)) + (last.n = (last.n || 0) + 1)) % 3)); }
export function praise(id) { const k = ['p1', 'p2', 'p3', heroKind === 'girl' ? 'af' : 'am']; play(id, k[Math.floor(Math.random() * k.length)]); }
export function thanks(id) { play(id, 't1'); }
