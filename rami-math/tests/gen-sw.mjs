// يولّد sw.js: قائمة كل ملفات اللعبة (عدا الاختبارات) لتُحفظ عند التثبيت فتعمل بلا إنترنت، ورقم نسخة من محتواها.
// شغّله قبل كل نشر: node tests/gen-sw.mjs   (الرقم يتغير تلقائياً حين يتغير أي ملف، فيصل التحديث للطلاب)
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['tests', 'node_modules', '.git', 'sw.js', 'CLAUDE.md', 'README.md']);
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { if (SKIP.has(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(relative(ROOT, p).replace(/\\/g, '/')); } })(ROOT);
files.sort();
const h = createHash('sha1'); files.forEach(f => { h.update(f); h.update(readFileSync(join(ROOT, f))); });
const VERSION = h.digest('hex').slice(0, 10);
const list = ['./', ...files.filter(f => f !== 'index.html').map(f => './' + f), './index.html'];
const sw = `// خدمة العمل بلا إنترنت لتطبيق «قرية الخير» (مولّد بـ tests/gen-sw.mjs — لا تعدّله يدوياً)
// الاستراتيجية: الشبكة أولاً لكل الملفات (بلا ذاكرة المتصفح المؤقتة) فيصل كل تحديث فوراً؛ والمحفوظ فقط بلا إنترنت أو إن تأخرت الشبكة ٤ ثوانٍ.
const CACHE = 'qaryat-alkhair-${VERSION}';
const FILES = ${JSON.stringify(list, null, 0)};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('qaryat-alkhair-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url); if (r.method !== 'GET' || u.origin !== location.origin) return;
  const key = r.mode === 'navigate' ? './index.html' : r;
  e.respondWith(new Promise(done => {
    let settled = false; const finish = v => { if (!settled && v) { settled = true; done(v); } };
    const cached = () => caches.match(key, { ignoreSearch: true });
    fetch(new Request(r, { cache: 'no-cache' })).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(key, cp)); } finish(res); })
      .catch(() => cached().then(hit => finish(hit || Response.error())));
    setTimeout(() => cached().then(hit => finish(hit)), 4000);   // شبكة بطيئة جداً: المحفوظ
  }));
});
`;
writeFileSync(join(ROOT, 'sw.js'), sw);
console.log(`sw.js: ${list.length} ملفاً، النسخة ${VERSION}`);
