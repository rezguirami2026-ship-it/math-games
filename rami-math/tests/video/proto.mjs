import { chromium } from 'playwright-core';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] });
const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript({ path: new URL('./vtime.js', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') });
await page.goto('http://localhost:8000/?preview=1'); await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000, polling: 200 }); await sleep(3000);
await page.evaluate(() => window.__vt.start());
const t0 = Date.now();
for (let f = 0; f < 90; f++) {
  await page.evaluate(f => { const p = window.__game.W.player; p.x = 900 + f * 6; p.y = 760; window.__vt.step(1000 / 30); }, f);
  await page.screenshot({ path: `${out}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
}
console.log('ms/frame', (Date.now() - t0) / 90);
await b.close();
