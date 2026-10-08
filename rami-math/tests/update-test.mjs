// اختبار وصول التحديث إلى تطبيق مفتوح على الهاتف: نسخة قديمة تعمل، ننشر نسخة جديدة، ثم «يعود» الطالب إلى التطبيق
// (دون إعادة فتحه) فيجب أن تصله النسخة الجديدة كاملة. ويعمل بلا إنترنت بعدها. يخدم الملفات على 127.0.0.2 (الخدمة لا تُسجَّل على localhost).
// node update-test.mjs
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), sleep = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
let ver = 'A';   // النسخة المنشورة: نغيّر رقم sw.js ونصاً ظاهراً في main.js
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = join(ROOT, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  let body = readFileSync(f);
  if (p === '/sw.js') body = Buffer.from(String(body).replace(/qaryat-alkhair-[0-9a-f]+/, 'qaryat-alkhair-test' + ver));
  if (p === '/main.js') body = Buffer.from(String(body).replace(/const V3D = '[^']*'/, `const V3D = 'نسخة ${ver}'`));
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' }); res.end(body);
});
await new Promise(r => server.listen(8123, '127.0.0.2', r));
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 400, height: 780 } }); const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
const verNow = () => page.evaluate(() => (document.querySelector('.ver3d') || {}).textContent || [...document.scripts].length && window.__V || '').catch(() => '');
const V = async () => page.evaluate(async () => { const t = await (await fetch('main.js')).text(); return (t.match(/const V3D = '([^']*)'/) || [])[1]; });
await page.goto('http://127.0.0.2:8123/?3d=1'); await sleep(4000); await page.reload(); await sleep(3000);
const r1 = await V();
ver = 'B';   // نشر نسخة جديدة والتطبيق مفتوح
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await sleep(500);
const nav = page.waitForNavigation({ timeout: 25000 }).then(() => true, () => false);
await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });   // الطالب يعود إلى التطبيق
const reloaded = await nav; await sleep(2500);
const r2 = await V();
await ctx.setOffline(true); await page.reload(); await sleep(3000);
const offline = await page.evaluate(() => !!document.getElementById('bNew') || !!document.querySelector('.home2, #screen'));
const r3 = await V().catch(() => 'x');
console.log([
  `${r1 === 'نسخة A' ? '✅' : '❌'} النسخة الأولى تعمل (${r1})`,
  `${reloaded ? '✅' : '❌'} العودة إلى التطبيق تجلب النسخة الجديدة وتعيد التحميل وحدها`,
  `${r2 === 'نسخة B' ? '✅' : '❌'} بعد العودة: النسخة الجديدة (${r2})`,
  `${offline && r3 === 'نسخة B' ? '✅' : '❌'} بلا إنترنت تعمل النسخة الجديدة كاملة (${r3})`,
  `${errs.length ? '❌' : '✅'} لا أخطاء ${errs.slice(0, 2).join(' | ')}`
].join('\n'));
await b.close(); server.close();
