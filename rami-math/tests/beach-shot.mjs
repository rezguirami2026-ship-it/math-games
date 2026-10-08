// لقطة شبكة إحداثيات الشاطئ في 3D والعادي (هل يحجبها السور؟): node beach-shot.mjs <مجلد>
import { chromium } from 'playwright-core';
const sleep = ms => new Promise(r => setTimeout(r, ms)), out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const q of ['', '&2d=1']) {
  const page = await b.newPage({ viewport: { width: 1000, height: 640 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:8000/?preview=1' + q); await page.evaluate(() => localStorage.clear()); await page.reload(); await sleep(2500);
  if (await page.$('#bNew')) { await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo'); }
  await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 }); await sleep(1500);
  for (let i = 0; i < 12 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
  await page.evaluate(async () => { const { BEACH } = await import('/world/harbor.js'); const g = window.__game, p = g.W.player; p.x = BEACH.ox + 40; p.y = BEACH.oy - 60; g.eng.snap(p); });
  await sleep(3500); await page.screenshot({ path: `${out}/beach${q ? '-2d' : '-3d'}.png` }); console.log(q || '3d', errs); await page.close();
}
await b.close();
