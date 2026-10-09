// يولّد sw.js: قائمة كل ملفات اللعبة (عدا الاختبارات) لتُحفظ عند التثبيت فتعمل بلا إنترنت، ورقم نسخة من محتواها.
// شغّله قبل كل نشر: node tests/gen-sw.mjs   (الرقم يتغير تلقائياً حين يتغير أي ملف، فيصل التحديث للطلاب)
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// حارس النشر: خطأ صياغة في أي ملف يوقف التوليد (فلا يُنشر)
import { execFileSync } from 'child_process';
try { execFileSync(process.execPath, ['--experimental-vm-modules', join(ROOT, 'tests', 'syntax.mjs')], { stdio: ['ignore', 'pipe', 'ignore'] }); }
catch (e) { console.log(String(e.stdout || '')); console.log('⛔ أُلغي توليد sw.js: أصلح خطأ الصياغة أولاً'); process.exit(1); }
const SKIP = new Set(['tests', 'server', 'node_modules', '.git', 'sw.js', 'CLAUDE.md', 'README.md']);
// الفيديو (.mp4) لا يُخزَّن مع التطبيق لكبر حجمه: يُشغَّل من الشبكة مباشرة
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { if (SKIP.has(f) || /.mp4$/.test(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(relative(ROOT, p).replace(/\\/g, '/')); } })(ROOT);
files.sort();
const h = createHash('sha1'); files.forEach(f => { h.update(f); h.update(readFileSync(join(ROOT, f))); });
const VERSION = h.digest('hex').slice(0, 10);
const list = ['./', ...files.filter(f => f !== 'index.html').map(f => './' + f), './index.html'];
const sw = `// خدمة العمل بلا إنترنت لتطبيق «قرية الخير» (مولّد بـ tests/gen-sw.mjs — لا تعدّله يدوياً)
// الاستراتيجية: كل نسخة تُحفظ كاملة دفعة واحدة، وتُقدَّم من الحفظ (سريعة ومتسقة: لا خلط بين ملفات نسختين).
// النسخة الجديدة تُنزَّل في الخلفية وتنتظر؛ والصفحة تفحص التحديث عند الفتح وعند العودة للتطبيق وكل ٢٠ دقيقة،
// ثم تطلب التفعيل في لحظة فراغ (لا تحدٍّ ولا حوار مفتوح) فيُعاد التحميل بالنسخة الجديدة كاملة.
const CACHE = 'qaryat-alkhair-${VERSION}';
const FILES = ${JSON.stringify(list, null, 0)};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))); });
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('qaryat-alkhair-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url); if (r.method !== 'GET' || u.origin !== location.origin || /.mp4$/.test(u.pathname)) return;
  const key = r.mode === 'navigate' ? './index.html' : r;
  e.respondWith(caches.open(CACHE).then(c => c.match(key, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok && r.mode !== 'navigate') c.put(key, res.clone()); return res; }).catch(() => c.match('./index.html')))));
});
`;
writeFileSync(join(ROOT, 'sw.js'), sw);
console.log(`sw.js: ${list.length} ملفاً، النسخة ${VERSION}`);
