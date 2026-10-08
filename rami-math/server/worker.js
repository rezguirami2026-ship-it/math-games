// خادم الخدمات الاختيارية للعبة «قرية الخير» — Cloudflare Worker واحد + قاعدة D1 صغيرة.
// نقاط النهاية العامة: POST /v1/batch (دفعة أحداث مجمّعة، ترد بالإعدادات) و GET /v1/config.
// لوحة التحكم: GET /admin، وواجهتها /v1/admin/* بكلمة سر (env.ADMIN_TOKEN، تُضبط بـ wrangler secret).
// الحماية من التكلفة: حجم الدفعة ≤ ٨ كيلوبايت، ≤ ٥٠ حدثاً، صف واحد مكتوب لكل دفعة غالباً، الدفعة المكررة تُتجاهل، حد ٤٠ دفعة لكل جهاز يومياً،
// الإعدادات في ذاكرة الخادم ٥ دقائق (لا قراءة قاعدة بيانات مع كل طلب)، وتنظيف يومي للبيانات القديمة.
import ADMIN_HTML from './admin.html';

const EVENTS = new Set(['first_launch', 'app_open', 'session_start', 'level_completed', 'adventure_started', 'adventure_completed', 'error_occurred', 'support_ticket']);
const TK_TYPES = new Set(['bug', 'idea', 'crash', 'help']), TK_STATUS = new Set(['new', 'progress', 'resolved', 'closed']);
const OS = new Set(['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'ChromeOS', 'Other']), DEV = new Set(['phone', 'tablet', 'desktop']), APP = new Set(['web', 'installed', 'android']);
const MAX_BODY = 8192, MAX_PER_DAY = 40;
const DEFAULT_CFG = { latest: { v: '1.0.0', notes: [] }, min: '1.0.0', history: [], ann: { on: false }, maint: { on: false, online: true } };
let cfgCache = null, cfgAt = 0;

const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
const cut = (s, n) => String(s == null ? '' : s).slice(0, n);
const ver = v => /^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v) ? v : '0.0.0';
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...cors, ...extra } });

async function getCfg(env) {
  if (cfgCache && Date.now() - cfgAt < 300e3) return cfgCache;
  const r = await env.DB.prepare('SELECT val FROM config WHERE k = ?').bind('cfg').first();
  cfgCache = r ? { ...DEFAULT_CFG, ...JSON.parse(r.val) } : DEFAULT_CFG; cfgAt = Date.now(); return cfgCache;
}
const publicCfg = c => ({ latest: c.latest, min: c.min, ann: c.ann && c.ann.on ? c.ann : { on: false }, maint: c.maint });

async function batch(req, env) {
  const raw = await req.text(); if (raw.length > MAX_BODY) return json({ ok: 0, e: 'too_big' }, 413);
  let p; try { p = JSON.parse(raw); } catch (e) { return json({ ok: 0, e: 'bad_json' }, 400); }
  if (!/^USER-[0-9A-F]{8}$/.test(p.uid) || !/^B[0-9A-F]{10}$/.test(p.b)) return json({ ok: 0, e: 'bad_id' }, 400);
  const cfg = publicCfg(await getCfg(env)), today = day(), v = ver(p.v), os = OS.has(p.os) ? p.os : 'Other', dev = DEV.has(p.dev) ? p.dev : 'desktop', app = APP.has(p.app) ? p.app : 'web';
  const DB = env.DB, c = Object.fromEntries([...EVENTS].map(e => [e, 0]));
  (Array.isArray(p.ev) ? p.ev.slice(0, 50) : []).forEach(e => { if (Array.isArray(e) && EVENTS.has(e[0])) c[e[0]]++; });
  // صف واحد: إنشاء نشاط اليوم أو زيادة عداداته — إلا إن كانت الدفعة نفسها (lb) فلا تتغير شيئاً ولا تُعدّ مرتين
  const cols = [...EVENTS], act = await DB.prepare(`INSERT INTO daily_active (day, uid, v, os, dev, n, lb, ${cols.join(', ')}) VALUES (?, ?, ?, ?, ?, 1, ?, ${cols.map(() => '?').join(', ')})
    ON CONFLICT (day, uid) DO UPDATE SET n = n + 1, lb = excluded.lb, v = excluded.v, ${cols.map(k => `${k} = ${k} + excluded.${k}`).join(', ')} WHERE lb IS NOT excluded.lb AND n < ${MAX_PER_DAY} RETURNING n`)
    .bind(today, p.uid, v, os, dev, p.b, ...cols.map(k => c[k])).first();
  if (!act) return json({ ok: 1, dup: 1, cfg });   // دفعة مكررة، أو جهاز تجاوز ٤٠ دفعة اليوم: نتجاهلها بهدوء
  const st = [];
  if (act.n === 1) st.push(DB.prepare('INSERT OR IGNORE INTO users (uid, first, v, os, dev, app) VALUES (?, ?, ?, ?, ?, ?)').bind(p.uid, today, v, os, dev, app));   // مرة في اليوم على الأكثر
  (Array.isArray(p.err) ? p.err.slice(0, 10) : []).forEach(e => { if (!/^ERR-[0-9A-F]{6}$/.test(e.id)) return;
    st.push(DB.prepare('INSERT INTO errors (id, day, v, os, dev, type, msg, c) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET c = MAX(c, excluded.c)')
      .bind(e.id, today, v, os, dev, cut(e.t, 40), cut(e.m, 120), Math.min(9999, e.c | 0) || 1)); });
  (Array.isArray(p.tk) ? p.tk.slice(0, 5) : []).forEach(t => { if (!/^T-[0-9A-F]{6}$/.test(t.id) || !TK_TYPES.has(t.type)) return;
    st.push(DB.prepare('INSERT OR IGNORE INTO tickets (id, created, type, descr, v, os, dev) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(t.id, cut(t.d, 30) || today, t.type, cut(t.desc, 500), v, os, dev)); });
  if (st.length) await DB.batch(st);
  return json({ ok: 1, cfg });
}

/* ── لوحة التحكم ── */
async function admin(req, env, path) {
  if (!env.ADMIN_TOKEN || req.headers.get('authorization') !== 'Bearer ' + env.ADMIN_TOKEN) return json({ ok: 0, e: 'auth' }, 401);
  const DB = env.DB, q = new URL(req.url).searchParams, ago = n => day(Date.now() - n * 86400e3);
  const one = async (sql, ...b) => (await DB.prepare(sql).bind(...b).first()) || {};
  const all = async (sql, ...b) => (await DB.prepare(sql).bind(...b).all()).results || [];
  if (path === 'overview') {
    const cfg = await getCfg(env), tk = await all('SELECT status, COUNT(*) n FROM tickets GROUP BY status');
    return json({ totalUsers: (await one('SELECT COUNT(*) n FROM users')).n || 0, firstLaunches: (await one('SELECT SUM(first_launch) n FROM daily_active')).n || 0,
      downloads: null, downloadsNote: 'Downloads data unavailable',
      active: { today: (await one('SELECT COUNT(*) n FROM daily_active WHERE day = ?', day())).n || 0, d7: (await one('SELECT COUNT(DISTINCT uid) n FROM daily_active WHERE day >= ?', ago(6))).n || 0, d30: (await one('SELECT COUNT(DISTINCT uid) n FROM daily_active WHERE day >= ?', ago(29))).n || 0 },
      currentVersion: cfg.latest.v, minVersion: cfg.min, errors7d: (await one('SELECT COALESCE(SUM(c),0) n FROM errors WHERE day >= ?', ago(6))).n || 0,
      tickets: Object.fromEntries(tk.map(r => [r.status, r.n])), maint: cfg.maint, ann: cfg.ann });
  }
  if (path === 'series') {
    const days = Math.min(90, Math.max(7, +q.get('days') || 30)), from = ago(days - 1);
    const rows = await all(`SELECT day, COUNT(*) active, ${[...EVENTS].map(e => `SUM(${e}) ${e}`).join(', ')} FROM daily_active WHERE day >= ? GROUP BY day ORDER BY day`, from);
    return json({ from, active: rows.map(r => ({ day: r.day, n: r.active })), counts: rows.flatMap(r => [...EVENTS].map(ev => ({ day: r.day, ev, n: r[ev] || 0 }))) });
  }
  if (path === 'versions') return json({ versions: await all('SELECT v, COUNT(DISTINCT uid) n FROM daily_active WHERE day >= ? GROUP BY v ORDER BY n DESC', ago(6)),
    os: await all('SELECT os, COUNT(DISTINCT uid) n FROM daily_active WHERE day >= ? GROUP BY os ORDER BY n DESC', ago(6)), dev: await all('SELECT dev, COUNT(DISTINCT uid) n FROM daily_active WHERE day >= ? GROUP BY dev ORDER BY n DESC', ago(6)), cfg: await getCfg(env) });
  if (path === 'tickets') { const s = q.get('status'); return json({ tickets: TK_STATUS.has(s) ? await all('SELECT * FROM tickets WHERE status = ? ORDER BY created DESC LIMIT 200', s) : await all('SELECT * FROM tickets ORDER BY created DESC LIMIT 200') }); }
  if (path === 'errors') return json({ errors: await all('SELECT * FROM errors WHERE day >= ? ORDER BY c DESC LIMIT 100', ago(29)) });
  if (path === 'ticket' && req.method === 'POST') { const b = await req.json(); if (!TK_STATUS.has(b.status)) return json({ ok: 0 }, 400);
    await DB.prepare('UPDATE tickets SET status = ?, note = ? WHERE id = ?').bind(b.status, cut(b.note, 300), cut(b.id, 12)).run(); return json({ ok: 1 }); }
  if (path === 'config' && req.method === 'POST') {
    const b = await req.json(), old = await getCfg(env), c = { ...old };
    if (b.latest) { const nv = ver(b.latest.v); if (nv !== old.latest.v) c.history = [{ v: old.latest.v, at: day() }, ...(old.history || [])].slice(0, 30); c.latest = { v: nv, notes: (b.latest.notes || []).slice(0, 6).map(n => cut(n, 120)) }; }
    if (b.min) c.min = ver(b.min);
    if (b.ann) c.ann = { on: !!b.ann.on, id: cut(b.ann.id, 20) || 'a' + Date.now().toString(36), icon: cut(b.ann.icon, 4), title: cut(b.ann.title, 80), body: cut(b.ann.body, 300) };
    if (b.maint) c.maint = { on: !!b.maint.on, online: b.maint.online !== false, title: cut(b.maint.title, 80), msg: cut(b.maint.msg, 300) };
    await DB.prepare('INSERT INTO config (k, val) VALUES (?, ?) ON CONFLICT (k) DO UPDATE SET val = excluded.val').bind('cfg', JSON.stringify(c)).run();
    cfgCache = c; cfgAt = Date.now(); return json({ ok: 1, cfg: c });
  }
  return json({ ok: 0, e: 'not_found' }, 404);
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url), path = u.pathname;
    try {
      if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
      if (path === '/v1/batch' && req.method === 'POST') return await batch(req, env);
      if (path === '/v1/config') return json(publicCfg(await getCfg(env)), 200, { 'cache-control': 'public, max-age=3600' });
      if (path === '/admin' || path === '/admin/') return new Response(ADMIN_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
      if (path.startsWith('/v1/admin/')) return await admin(req, env, path.slice(10));
      return json({ ok: 1, name: 'qaryat-alkhair-ops' });
    } catch (e) { return json({ ok: 0, e: 'server' }, 500); }
  },
  /* تنظيف يومي: الأخطاء ٩٠ يوماً، والنشاط اليومي سنة */
  async scheduled(ev, env) {
    const ago = n => day(Date.now() - n * 86400e3);
    await env.DB.batch([env.DB.prepare('DELETE FROM daily_active WHERE day < ?').bind(ago(400)), env.DB.prepare('DELETE FROM errors WHERE day < ?').bind(ago(90))]);   // النشاط اليومي سنة كاملة (صغير)
  }
};
