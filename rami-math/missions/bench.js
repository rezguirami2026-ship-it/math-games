// أدوات مشتركة لطاولات العمل (المنظر القريب): نافذة، رسائل، لوحة أرقام، عدّادات
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait, neg } from '../core/util.js';
import { earn } from '../rewards/goodDeeds.js';
import { sfx } from '../core/sound.js';
import { complete } from './quests.js';
export const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
export const near = (W, p, r) => Math.hypot(W.player.x - p.x, W.player.y - p.y) < (r || 50);
export const changed = () => { bus.emit('mission'); bus.emit('save'); };
export const dec = v => ar(String(+(+v).toFixed(3))).replace('.', '٫');
export const sg = n => ar(n);
export async function finish(W, id, lines, reward) { sfx('win'); await wait(600); earn(reward || 40, W.player.x, W.player.y - 80); complete(id); if (lines) await W.talk(lines[0].who, lines); }
export const panel = () => document.getElementById('panel');
export function sheetOpen(html) { const el = panel(); el.innerHTML = `<div class="sheet bench">${html}</div>`; el.classList.add('on'); game.busy = true; return el; }
export function sheetClose() { const el = panel(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; }
export function hiDPI(cv) { const r = 2, w = cv.width, h = cv.height; cv.width = w * r; cv.height = h * r; cv.style.width = w + 'px'; cv.style.height = h + 'px'; const c = cv.getContext('2d'); c.scale(r, r); return c; }
export const msgBox = (t, kind) => `<div class="speech ${kind || ''}" id="benchMsg">${t}</div>`;
/* رسالة الطاولة: رسالة النجاح أو التلميح لا تُخفي السؤال أبداً (إن لم تذكره الرسالة نفسها يُضاف تحتها) */
const plain = t => String(t).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
export const qMsg = (msg, kind, q) => { if (!msg) return msgBox(q, kind); if (!q) return msgBox(msg, kind); const pq = plain(q); return msgBox(plain(msg).includes(pq.slice(0, 14)) ? msg : `${msg}<div class="nextQ">${q}</div>`, kind); };
export const setMsg = (t, kind) => { const m = document.getElementById('benchMsg'); if (m) { m.className = 'speech ' + (kind || ''); m.innerHTML = t; } };
export const btn = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = e => { e.stopPropagation(); fn(); }; };
/* لوحة أرقام: تقبل الفاصلة العشرية والسالب، وتعيد القيمة عند الضغط على زر التأكيد */
export function numPad(holder, label, onGo, opts) {
  const o = opts || {}, keys = ['7', '8', '9', '⌫', '4', '5', '6', o.dot === false ? '' : '.', '1', '2', '3', o.neg ? '−' : '', '0'];
  holder.innerHTML = `<div class="lockscr2" id="npd"></div><div class="keys2">${keys.map(k => k ? `<button class="act ghost" data-k="${k}">${k === '.' ? '٫' : k === '⌫' ? '⌫' : k === '−' ? '−' : ar(k)}</button>` : '<span></span>').join('')}<button class="act go" data-k="go">${label}</button></div>`;
  let v = '';
  const show = () => { holder.querySelector('#npd').textContent = v ? (v === '-' ? '−' : v.startsWith('-') ? neg(ar(v.slice(1)).replace('.', '٫')) : ar(v).replace('.', '٫')) : '؟'; };
  holder.querySelectorAll('[data-k]').forEach(b => b.onclick = e => {
    e.stopPropagation(); const k = b.dataset.k; sfx('click');
    if (k === 'go') { if (v && v !== '-' && v !== '.') onGo(parseFloat(v)); return; }
    if (k === '⌫') v = v.slice(0, -1); else if (k === '.') { if (!v.includes('.')) v += v ? '.' : '0.'; } else if (k === '−') { v = v.startsWith('-') ? v.slice(1) : '-' + v; } else if (v.replace('-', '').length < 9) v += k;
    show();
  });
  show();
  return { clear() { v = ''; show(); } };
}
/* عدّادات بأزرار − و+ */
export function counters(holder, items, d, onChange) {
  holder.innerHTML = items.map(([k, lab, max]) => `<div class="cnt"><span>${lab}</span><button class="act ghost" data-c="${k}" data-v="-1">−</button><b id="cv_${k}">${ar(d[k])}</b><button class="act ghost" data-c="${k}" data-v="1">+</button>${max > 20 ? `<button class="act ghost" data-c="${k}" data-v="10">+١٠</button>` : ''}</div>`).join('');
  holder.querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.c, it = items.find(x => x[0] === k); d[k] = Math.max(0, Math.min(it[2], d[k] + +b.dataset.v)); holder.querySelector('#cv_' + k).textContent = ar(d[k]); sfx('click'); if (onChange) onChange(); });
}
