// الخدمات الاختيارية (Online) بأقل عدد طلبات: إحصاءات مجهولة، أخطاء مختصرة، تذاكر دعم، وإعدادات (تحديث/إعلان/صيانة).
// اللعبة لا تعتمد على شيء هنا: بلا إنترنت أو بلا خادم (OPS_URL فارغ) كل شيء يُحفظ محلياً بحدود ثم يُتجاهل بهدوء.
// الحماية من التكلفة: طابور محلي بحد ٢٠٠ حدث، دفعة واحدة كل ١٠ دقائق على الأكثر (أو عند تجمّع ٢٠ حدثاً/إغلاق اللعبة/عودة الإنترنت)،
// رقم فريد لكل دفعة (الخادم يتجاهل المكرر)، تراجع تدريجي بعد الفشل (٥ محاولات ثم ٦ ساعات)، والإعدادات مرة كل ٢٤ ساعة —
// وتأتي غالباً في رد الدفعة نفسها فلا تحتاج طلباً مستقلاً. الطلبات من نوع text/plain حتى لا يرسل المتصفح طلب CORS تمهيدياً.
import { APP_VERSION, OPS_URL } from './version.js';

const KEY = 'ramimath_ops', MAX_Q = 200, BATCH_AT = 20, PER_BATCH = 50, MIN_GAP = 10 * 60e3, CFG_TTL = 24 * 3600e3, MAX_TRIES = 5;
export const EVENTS = ['first_launch', 'app_open', 'session_start', 'level_completed', 'adventure_started', 'adventure_completed', 'error_occurred', 'support_ticket'];
const LOW = new Set(['app_open', 'session_start']);   // أول ما يُحذف إن امتلأ الطابور
const hex = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('').slice(0, n).toUpperCase();
const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

let S = load(); const subs = [];
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && /^USER-[0-9A-F]{8}$/.test(s.uid)) return s; } catch (e) {}
  return { uid: 'USER-' + hex(8), fresh: true, q: [], pend: null, last: 0, tries: 0, next: 0, cfg: null, cfgAt: 0, errs: {}, errDay: '', tk: [], my: [], seen: {} };
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
// أثناء التطوير والاختبار (localhost) ووضع المعاينة (?preview=1) لا نرسل للخادم الحقيقي حتى لا تختلط الإحصاءات، إلا بعنوان اختبار صريح
const url = () => { let u = /^(localhost|127\.)/.test(location.hostname) || /[?&]preview=1/.test(location.search) ? '' : OPS_URL; try { u = localStorage.getItem('ramimath_ops_url') || u; } catch (e) {} return (u || '').replace(/\/+$/, ''); };

/* بيانات الجهاز: تقريبية وعامة فقط (لا نص المتصفح الكامل، لا موقع، لا اسم) */
export const env = (() => {
  const ua = navigator.userAgent || '', touch = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && touch) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Macintosh/.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
  const dev = !touch ? 'desktop' : Math.min(screen.width, screen.height) >= 600 ? 'tablet' : 'phone';
  const app = document.referrer.startsWith('android-app://') ? 'android' : (() => { try { return matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches ? 'installed' : 'web'; } catch (e) { return 'web'; } })();
  return { v: APP_VERSION, os, dev, app };
})();
export const uid = () => S.uid;
export const config = () => S.cfg;
export const seen = (k, set) => { if (set) { S.seen[k] = Date.now(); persist(); } return S.seen[k]; };
export const myTickets = () => S.my.slice(-10).reverse();
export function onConfig(f) { subs.push(f); if (S.cfg) setTimeout(() => f(S.cfg), 0); }

export function track(ev, x) {
  if (!EVENTS.includes(ev)) return;
  S.q.push(x ? [ev, Math.floor(Date.now() / 1000), String(x).slice(0, 32)] : [ev, Math.floor(Date.now() / 1000)]);
  while (S.q.length > MAX_Q) { const i = S.q.findIndex(e => LOW.has(e[0])); S.q.splice(i >= 0 ? i : 0, 1); }
  persist(); if (S.q.length >= BATCH_AT) flush('full');
}

/* الأخطاء: تُجمع حسب نوعها مع عدد مرات تكرارها، بحد ١٠ أنواع في اليوم، ورسالة مختصرة فقط */
export function reportError(err, where) {
  try {
    const d = day(); if (S.errDay !== d) { S.errs = {}; S.errDay = d; }
    const msg = String((err && (err.message || err.reason)) || err || 'unknown').slice(0, 120), sig = (where || '') + '|' + msg.slice(0, 80);
    let e = S.errs[sig];
    if (!e) { if (Object.keys(S.errs).length >= 10) return; e = S.errs[sig] = { id: 'ERR-' + hex(6), t: String((err && err.name) || where || 'Error').slice(0, 40), m: msg, c: 0, d }; track('error_occurred'); }
    e.c++; e.sent = false; persist();
  } catch (x) {}
}

/* تذكرة دعم: تُحفظ على الجهاز وتُرسل مع أقرب دفعة (حد ٥ تذاكر غير مرسلة) */
export const TICKET_TYPES = { bug: '🐛 الإبلاغ عن مشكلة', idea: '💡 اقتراح', crash: '🎮 اللعبة توقفت', help: '❓ مساعدة' };
export function ticket(type, desc) {
  if (!TICKET_TYPES[type] || S.tk.length >= 5) return null;
  const t = { id: 'T-' + hex(6), type, desc: String(desc || '').trim().slice(0, 500), d: new Date().toISOString() };
  S.tk.push(t); S.my.push({ id: t.id, type, d: t.d }); S.my = S.my.slice(-20); track('support_ticket'); persist(); flush('ticket');
  return t.id;
}

function setCfg(c) { if (!c || typeof c !== 'object') return; S.cfg = c; S.cfgAt = Date.now(); persist(); subs.forEach(f => { try { f(c); } catch (e) {} }); }
async function getConfig() {
  S.cfgAt = Date.now() - CFG_TTL + 3600e3; persist();   // إن فشل الطلب: محاولة واحدة بعد ساعة، لا أكثر
  try { const r = await fetch(url() + '/v1/config', { signal: AbortSignal.timeout(8000) }); if (r.ok) setCfg(await r.json()); } catch (e) {}
}

/* الإرسال المجمّع. reason: launch | full | end | online | ticket */
export async function flush(reason) {
  try {
    if (!url() || !navigator.onLine || S.busy) return;
    const now = Date.now(); if (S.next > now) return;
    const m = S.cfg && S.cfg.maint, paused = m && m.on && m.online;   // صيانة الخدمات Online: نوقف الإرسال فقط (اللعب مستمر)
    const gap = reason === 'ticket' ? 30e3 : reason === 'end' ? 120e3 : MIN_GAP;
    const unsentErr = Object.values(S.errs).filter(e => !e.sent);
    if (!S.pend && !paused && (S.q.length || unsentErr.length || S.tk.length) && now - S.last >= gap)
      S.pend = { b: 'B' + hex(10), uid: S.uid, ...env, ev: S.q.splice(0, PER_BATCH), err: unsentErr.slice(0, 10).map(({ id, t, m, c, d }) => ({ id, t, m, c, d })), tk: S.tk.splice(0, 5) };
    if (!S.pend || paused || now - S.last < gap) { if (now - S.cfgAt > (paused ? 3 * 3600e3 : CFG_TTL)) getConfig(); persist(); return; }   // أثناء الصيانة نسأل كل ٣ ساعات لنعرف انتهاءها
    S.last = now; persist();
    const body = JSON.stringify(S.pend), ids = S.pend.err.map(e => e.id);
    if (reason === 'end' && navigator.sendBeacon) { navigator.sendBeacon(url() + '/v1/batch', new Blob([body], { type: 'text/plain' })); return; }   // عند الإغلاق: الدفعة تبقى محفوظة، وإعادة إرسالها لاحقاً يتجاهلها الخادم
    S.busy = true;
    const r = await fetch(url() + '/v1/batch', { method: 'POST', body, headers: { 'content-type': 'text/plain' }, keepalive: body.length < 60000, signal: AbortSignal.timeout(10000) });
    if (!r.ok && r.status !== 409) throw new Error('HTTP ' + r.status);
    const res = await r.json().catch(() => ({}));
    S.pend = null; S.tries = 0; ids.forEach(id => { const e = Object.values(S.errs).find(x => x.id === id); if (e) e.sent = true; });
    if (res.cfg) setCfg(res.cfg);
  } catch (e) {
    S.tries++; S.next = Date.now() + (S.tries >= MAX_TRIES ? 6 * 3600e3 : 30e3 * 2 ** S.tries); if (S.tries >= MAX_TRIES) S.tries = 0;
  } finally { S.busy = false; persist(); }
}

/* بداية الجلسة: يُستدعى مرة عند تشغيل اللعبة، والإرسال بعد ٤ ثوانٍ حتى لا يزاحم التحميل */
export function startOps() {
  S.busy = false;
  if (S.fresh) { track('first_launch'); S.fresh = false; }
  track('app_open'); track('session_start'); persist();
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); flush('end'); }
    else if (hiddenAt && Date.now() - hiddenAt > 30 * 60e3) track('session_start');
  });
  addEventListener('online', () => setTimeout(() => flush('online'), 3000));
  addEventListener('error', e => reportError(e.error || e.message, 'window'));
  addEventListener('unhandledrejection', e => reportError(e.reason, 'promise'));
  setTimeout(() => flush('launch'), 4000);
}
// للاختبار فقط
export const _ops = { state: () => S, reset: () => { S = load(); } };
