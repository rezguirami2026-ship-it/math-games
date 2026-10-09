// لقطات لافتات المباني في 3D (المتحف ودار الذهب والسوق...): node sign-shots.mjs <مجلد>
import { chromium } from 'playwright-core';
const sleep = ms => new Promise(r => setTimeout(r, ms)), out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h, tag] of [[1000, 640, 'desk'], [390, 800, 'phone']]) {
const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'phone' ? 2 : 1 });
await page.goto('http://localhost:8000/?preview=1'); await page.evaluate(() => localStorage.clear()); await page.reload(); await sleep(2500);
if (await page.$('#bNew')) { await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo'); }
await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 }); await sleep(1500);
for (let i = 0; i < 12 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
await page.evaluate(() => document.querySelectorAll('.region,#toast').forEach(e => e.remove()));
for (const [n, x, y] of [['museum', 390, 2180], ['market', 1790, 760]]) {
  await page.evaluate(([x, y]) => { const g = window.__game, p = g.W.player; p.x = x; p.y = y; g.eng.snap(p); }, [x, y]); await sleep(3000);
  await page.evaluate(() => document.querySelectorAll('.region,#toast').forEach(e => e.classList.remove('on'))); await page.screenshot({ path: `${out}/sign-${n}-${tag}.png` }); }
await page.close(); }
await b.close();
