// لقطات محطة الحافلات أثناء الدرس: لوحات فوق الحافلات، وبطاقة المسافر أثناء مرافقته. node bus-shots.mjs <مجلد>
import { chromium } from 'playwright-core';
const sleep = ms => new Promise(r => setTimeout(r, ms)), out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h, tag, q] of [[1000, 640, 'desk', ''], [390, 800, 'phone', '?2d=1']]) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'phone' ? 2 : 1 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:8000/' + q); await page.evaluate(() => localStorage.clear()); await page.reload(); await sleep(1500);
  await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo');
  await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 }); await sleep(1500);
  for (let i = 0; i < 40 && !(await page.$('#dialog.on')); i++) { await page.evaluate(() => { const s = document.getElementById('screen'); if (s && s.onclick) s.onclick(); }); await sleep(300); }
  for (let i = 0; i < 12 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
  await page.evaluate(async () => { const g = window.__game, Q = await import('/missions/quests.js'), { LESSONS } = await import('/content/lessons.js');
    LESSONS.slice(0, LESSONS.findIndex(l => l.id === 'timeTables')).forEach(l => { Q.Q().done[l.id] = 1; }); g.state.levelSeen = 99; g.state.daily = { last: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() }; Q.start('timeTables');
    const d = Q.data('timeTables'); g.MODS.timeTables.begin(d); const p = g.W.player; p.x = 1800; p.y = 900; g.eng.snap(p); });
  await sleep(2000); await page.screenshot({ path: `${out}/bus-${tag}-1.png` });
  await page.evaluate(async () => { const Q = await import('/missions/quests.js'), d = Q.data('timeTables'); d.follow = 0; d.pax[0].st = 'follow'; });
  await sleep(1500); await page.screenshot({ path: `${out}/bus-${tag}-2.png` });
  console.log(tag, errs); await page.close();
}
await b.close();
