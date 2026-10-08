// تشغيل خادم الخدمات محلياً بنفس كود Cloudflare (server/worker.js) فوق SQLite المدمج في Node، مع عدّ الطلبات والكتابات.
// node ops-server.mjs [port]   — يُستخدم في tests/ops-test.mjs وفي تقدير الحمل
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), srv = join(here, '..', 'server');
export const stats = { req: {}, written: 0, read: 0 };
export function makeDB() {
  const db = new DatabaseSync(':memory:'); db.exec(readFileSync(join(srv, 'schema.sql'), 'utf8'));
  const stmt = (sql, a = []) => ({
    bind: (...b) => stmt(sql, b),
    first: async () => { const r = db.prepare(sql).get(...a); stats.read++; if (r && /^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) stats.written++; return r || null; },   // INSERT … RETURNING يكتب صفاً
    all: async () => { const r = db.prepare(sql).all(...a); stats.read += r.length; return { results: r }; },
    run: async () => { const r = db.prepare(sql).run(...a); stats.written += Number(r.changes); return { meta: { changes: Number(r.changes) } }; },
    _sql: sql, _a: a
  });
  return { raw: db, prepare: sql => stmt(sql), batch: async list => { db.exec('BEGIN'); try { const out = []; for (const s of list) out.push(await s.run()); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; } } };
}
export async function loadWorker() {
  const src = readFileSync(join(srv, 'worker.js'), 'utf8').replace("import ADMIN_HTML from './admin.html';", 'const ADMIN_HTML = ' + JSON.stringify(readFileSync(join(srv, 'admin.html'), 'utf8')) + ';');
  const f = join(mkdtempSync(join(tmpdir(), 'ops-')), 'worker.mjs'); writeFileSync(f, src);
  return (await import(pathToFileURL(f).href)).default;
}
export async function startServer(port = 8787, env = {}) {
  const W = await loadWorker(), E = { DB: makeDB(), ADMIN_TOKEN: 'test-admin', ...env };
  const s = createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks), key = req.method + ' ' + req.url.split('?')[0]; stats.req[key] = (stats.req[key] || 0) + 1;
    if (E.offline) { req.socket.destroy(); return; }
    const r = await W.fetch(new Request('http://localhost:' + port + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), E);
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
  });
  await new Promise(r => s.listen(port, r)); return { server: s, env: E, W };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { const p = +process.argv[2] || 8787; await startServer(p); console.log('ops server on http://localhost:' + p + '/admin  (token: test-admin)'); }
