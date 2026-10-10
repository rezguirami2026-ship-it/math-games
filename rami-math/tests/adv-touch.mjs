// اختبار اللمس على الهاتف في المغامرات: لمس العالم يقدّم الحوار، نقرة تمشي، وسحب الإصبع عصا تحكم. node adv-touch.mjs <مجلد اللقطات> [مغامرات,مفصولة,بفواصل]
import { chromium } from 'playwright-core';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome' });
const ADVS = (process.argv[3] || 'rescue').split(',');
for (const [tag, q] of [['3d', '?preview=1'], ['2d', '?preview=1&2d=1']]) for (const id of ADVS) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:8000/' + q); await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 }); await sleep(2500);
  for (let i = 0; i < 14 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
  await page.evaluate(async id => { window.__adv = null; (await import('/adventure/index.js')).playAdventure(id); }, id); await page.waitForFunction(() => window.__adv, null, { timeout: 30000 });
  await page.waitForSelector('.advDlg.on', { timeout: 8000 }).catch(() => {});
  let n = 0; for (let i = 0; i < 40 && await page.$('.advDlg.on'); i++) { await page.touchscreen.tap(200, 250); n++; await sleep(350); }   // لمس العالم (لا الصندوق) يقدّم الحوار
  await sleep(600);
  const h0 = await page.evaluate(() => window.__adv.hero());
  // نقرة: نبحث عن بلاطة مفتوحة قريبة ونلمسها على الشاشة
  await page.touchscreen.tap(270, 400); await sleep(2200); const h1 = await page.evaluate(() => window.__adv.hero());
  const cdp = await ctx.newCDPSession(page); const sx = 195, sy = 560;
  const drag = async (dx, dy) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] }); for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + dx * i / 8, y: sy + dy * i / 8 }] }); await sleep(40); } await sleep(900); const h = await page.evaluate(() => window.__adv.hero()); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(200); return h; };
  const hL = await drag(-70, 0), hR = await drag(70, 0), hU = await drag(0, -70), hD = await drag(0, 70);
  const moved = [h0, h1, hL, hR, hU, hD].map(h => h.x + ',' + h.y).join(' → ');
  console.log(tag, id, `dlg-taps ${n}`, '|', moved, errs.length ? '| ERR ' + errs.join('/') : '');
  if (id === ADVS[0]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] }); for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + i * 9, y: sy - i * 5 }] }); await sleep(40); } await sleep(300); await page.screenshot({ path: `${process.argv[2]}/stick-${tag}.png` }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  await ctx.close();
}
await b.close();
