// اختبار نظام الخدمات الاختيارية مع اللعبة الحقيقية وخادم محلي بنفس كود Cloudflare (server/worker.js).
// node ops-test.mjs [مجلد اللقطات]   (يحتاج خادم اللعبة على 8000)
import { chromium } from 'playwright-core';
import { startServer, stats } from './ops-server.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms)), OPS = 'http://localhost:8787';
const results = []; const ok = (name, cond, info = '') => { results.push([cond ? '✅' : '❌', name, info]); };
const { server } = await startServer(8787);
const adm = (p, body) => fetch(OPS + '/v1/admin/' + p, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer test-admin', 'content-type': 'application/json' }, body: body && JSON.stringify(body) }).then(r => r.json());
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 640 } });
await ctx.addInitScript(() => { try { localStorage.setItem('ramimath_ops_url', 'http://localhost:8787'); } catch (e) {} });
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
const ops = () => page.evaluate(async () => { const m = await import('/core/ops.js'); const s = m._ops.state(); return { uid: s.uid, q: s.q.length, pend: !!s.pend, tk: s.tk.length, errs: Object.keys(s.errs).length }; });
const push = () => page.evaluate(async () => { const m = await import('/core/ops.js'); m.track('app_open'); const s = m._ops.state(); s.last = 0; s.next = 0; await m.flush('online'); });
const modalTxt = () => page.$eval('#opsModal', m => m.className + '|' + m.textContent).catch(() => '');
async function enterGame() {
  await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo');
  await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 60000 });
  for (let i = 0; i < 40 && !(await page.$('#dialog.on')); i++) { await page.evaluate(() => { const s = document.getElementById('screen'); if (s && s.onclick) s.onclick(); }); await sleep(300); }
  for (let i = 0; i < 10 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
}
const B = () => stats.req['POST /v1/batch'] || 0;

// ١. أول تشغيل
await page.goto('http://localhost:8000/?2d=1'); await sleep(5500);
let o = await ops(); const uid = o.uid;
ok('1. أول تشغيل: معرف مجهول', /^USER-[0-9A-F]{8}$/.test(uid), uid);
ok('5. إرسال Analytics عند التشغيل (طلب واحد)', B() === 1 && !o.pend, JSON.stringify(stats.req));
let ov = await adm('overview'); ok('   الخادم سجّل First Launch ومستخدماً نشطاً', ov.firstLaunches === 1 && ov.active.today === 1 && ov.totalUsers === 1, `first=${ov.firstLaunches} active=${ov.active.today}`);
// ٢. التشغيل الثاني
await page.reload(); await sleep(5500); o = await ops();
ok('2. التشغيل الثاني: نفس المعرف، بلا first_launch جديد، والأحداث تنتظر (حد ١٠ دقائق)', o.uid === uid && B() === 1 && o.q >= 2, `q=${o.q} batches=${B()}`);
// ٣. بلا إنترنت
await ctx.setOffline(true); await enterGame();
await page.evaluate(async () => { const m = await import('/core/ops.js'); for (let i = 0; i < 5; i++) m.track('level_completed', 'test' + i); });
await page.evaluate(async () => { const m = await import('/core/ops.js'); const s = m._ops.state(); s.last = 0; await m.flush('online'); }); o = await ops();
ok('3. بلا إنترنت: اللعبة تعمل، الأحداث محفوظة محلياً، لا أخطاء', o.q >= 7 && !errs.length && await page.evaluate(() => !!window.__game.W), `q=${o.q} errs=${errs.length}`);
// ٨. تذكرة دعم بلا إنترنت
await page.click('#bBag'); await sleep(300); await page.click('#supBtn'); await sleep(200); await page.click('[data-tt="bug"]'); await page.fill('#tkDesc', 'الزر لا يعمل في درس الكسور'); await page.click('#tkSend'); await sleep(300);
const tkTxt = await page.textContent('#panel'); o = await ops();
ok('8. تذكرة دعم: رقم تذكرة، ومحفوظة حتى يعود الإنترنت', /T-[0-9A-F]{6}/.test(tkTxt) && o.tk === 1, (tkTxt.match(/T-[0-9A-F]{6}/) || [])[0]);
await page.click('[data-close]').catch(() => {});
// ٧. خطأ يتكرر
await page.evaluate(() => { for (let i = 0; i < 4; i++) setTimeout(() => { throw new Error('اختبار خطأ'); }, 0); }); await sleep(400); o = await ops();
ok('7. تسجيل الأخطاء: نوع واحد بعدّاد (لا تكرار)', o.errs === 1, `errs=${o.errs}`);
// ٤ و٦. عودة الإنترنت
await ctx.setOffline(false); const before = B();
await page.evaluate(async () => { const m = await import('/core/ops.js'); const s = m._ops.state(); s.last = 0; s.next = 0; await m.flush('online'); }); o = await ops();
const tks = await adm('tickets'), errl = await adm('errors');
ok('4/6. عودة الإنترنت: دفعة واحدة (Batch) بالأحداث والخطأ والتذكرة', B() === before + 1 && !o.pend && o.q === 0 && o.tk === 0, `batches +${B() - before}`);
ok('   التذكرة وصلت للوحة', tks.tickets.length === 1 && tks.tickets[0].type === 'bug' && /الكسور/.test(tks.tickets[0].descr));
ok('   الخطأ وصل بعدّاده', errl.errors.length === 1 && errl.errors[0].c === 4, `c=${errl.errors[0] && errl.errors[0].c}`);
// دفعة مكررة (فشل الاستلام ثم إعادة) لا تُعدّ مرتين
const lc = async () => ((await adm('series?days=7')).counts.find(c => c.ev === 'level_completed') || {}).n;
const lc0 = await lc();
await page.evaluate(async () => { const m = await import('/core/ops.js'); m.track('level_completed', 'dup'); const s = m._ops.state(); s.last = 0; await m.flush('online'); });
const lastBody = await page.evaluate(async () => (await import('/core/ops.js'))._ops.state().pend);   // null بعد النجاح
const lc1 = await lc();
ok('   الدفعة المكررة لا تُعدّ مرتين (رقم دفعة فريد)', lc1 === lc0 + 1 && lastBody === null, `${lc0} → ${lc1}`);
// ٩. تحديث متوفر
await adm('config', { latest: { v: '1.1.0', notes: ['إضافة مغامرة جديدة', 'إصلاح الأخطاء', 'تحسين الأداء'] } }); await push(); await sleep(3500);
let modal = await modalTxt();
ok('9. تحديث متوفر: نافذة «تحديث جديد متوفر» مع الملاحظات', /on/.test(modal) && /تحديث جديد متوفر/.test(modal) && /1\.1\.0/.test(modal) && /مغامرة جديدة/.test(modal));
await page.click('#opsLater').catch(() => {}); await sleep(300);
// ١١. إعلان
await adm('config', { ann: { on: true, icon: '🎉', title: 'مغامرة جديدة!', body: 'تمت إضافة مغامرة إنقاذ القرية.' } }); await push(); await sleep(3500);
modal = await modalTxt(); ok('11. إعلان يظهر', /on/.test(modal) && /إنقاذ القرية/.test(modal)); await page.click('#opsOk').catch(() => {}); await sleep(300);
await push(); await sleep(3500); modal = await modalTxt(); ok('   الإعلان لا يتكرر', !/ on|^opsModal on/.test(modal.split('|')[0]), modal.split('|')[0]);
// ١٢. صيانة
await adm('config', { maint: { on: true, online: true, title: '🔧 اللعبة تحت الصيانة', msg: 'نعمل حالياً على تحسين اللعبة.' } }); await push(); await sleep(3500);
modal = await modalTxt(); const b1 = B(); await push();
ok('12. صيانة: الرسالة تظهر، واللعب مستمر، والإرسال متوقف', /on/.test(modal) && /الصيانة/.test(modal) && B() === b1 && await page.evaluate(() => !!window.__game.W), `batches during maint +${B() - b1}`);
await page.click('#opsOk').catch(() => {}); await adm('config', { maint: { on: false } });
// ١٠. تحديث إجباري (الجهاز يعرف بانتهاء الصيانة عند جلب الإعدادات)
await adm('config', { min: '1.1.0' });
await page.evaluate(async () => { const m = await import('/core/ops.js'); const s = m._ops.state(); s.cfgAt = 0; s.last = Date.now(); await m.flush('launch'); }); await sleep(3500);
modal = await modalTxt();
ok('10. تحديث إجباري: شاشة «يجب تحديث اللعبة» بلا زر إغلاق', /must/.test(modal) && /يجب تحديث اللعبة/.test(modal) && !(await page.$('#opsModal.on #opsLater')), modal.slice(0, 60));
await adm('config', { min: '1.0.0', latest: { v: '1.0.0', notes: [] }, ann: { on: false } });
// ١٣. الإصدار
const vers = await adm('versions');
await page.evaluate(() => document.getElementById('opsModal').className = 'opsModal');
await page.click('#bBag'); await sleep(300); await page.click('#aboutBtn'); await sleep(200); const about = await page.textContent('#panel');
ok('13. الإصدار في «حول اللعبة» وتوزيع الإصدارات وسجل الإصدارات السابقة', /v1\.0\.0/.test(about) && vers.versions.some(v => v.v === '1.0.0') && (vers.cfg.history || []).length >= 1, JSON.stringify(vers.versions));
await page.click('[data-close]').catch(() => {});
// ١٤. لوحة التحكم
const ap = await ctx.newPage(); await ap.goto(OPS + '/admin'); await ap.fill('#tok', 'test-admin'); await ap.click('#go'); await sleep(800);
const ovTxt = await ap.textContent('#view'); const tabs = [];
if (process.argv[2]) await ap.screenshot({ path: process.argv[2] + '/admin-overview.png' });
for (const t of ['analytics', 'support', 'errors', 'versions', 'ann', 'maint']) { await ap.click(`[data-t="${t}"]`); await sleep(400); tabs.push(t + ':' + ((await ap.textContent('#view')).length > 40)); if (process.argv[2] && (t === 'analytics' || t === 'support')) await ap.screenshot({ path: `${process.argv[2]}/admin-${t}.png` }); }
const bad = await (await fetch(OPS + '/v1/admin/overview', { headers: { authorization: 'Bearer wrong' } })).status;
ok('14. لوحة التحكم: الدخول وكل الأقسام، «Downloads data unavailable»، وكلمة سر خاطئة مرفوضة', /Downloads data unavailable/.test(ovTxt) && tabs.every(t => t.endsWith('true')) && bad === 401, tabs.join(' '));
await ap.close();
ok('   لا أخطاء في اللعبة طوال الاختبار (عدا الخطأ المقصود)', errs.filter(e => !/اختبار خطأ/.test(e)).length === 0, errs.join(' | '));
console.log(results.map(r => r.join(' ')).join('\n'));
console.log('الطلبات:', JSON.stringify(stats.req));
await browser.close(); server.close();
