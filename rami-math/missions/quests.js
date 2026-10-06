// نظام المهام: يتبع ترتيب دروس المنهج حرفياً — الدرس التالي لا يبدأ قبل إنهاء السابق
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { LESSONS, UNITS } from '../content/lessons.js';
export function Q() { const s = game.state; s.quests = s.quests || { done: {}, started: {}, data: {} }; return s.quests; }
export const current = () => LESSONS.find(l => !Q().done[l.id]) || null;
export const isDone = id => !!Q().done[id];
export const isStarted = id => !!Q().started[id];
export const data = id => { const q = Q(); return (q.data[id] = q.data[id] || {}); };
export const unitOf = l => UNITS[l.u];
export function start(id) { Q().started[id] = Date.now(); bus.emit('mission'); bus.emit('save'); }
export function complete(id) { const q = Q(); if (q.done[id]) return; q.done[id] = Date.now(); bus.emit('lessonDone', id); bus.emit('mission'); bus.emit('save'); }
export function progress() { const q = Q(); return { done: LESSONS.filter(l => q.done[l.id]).length, total: LESSONS.length }; }
