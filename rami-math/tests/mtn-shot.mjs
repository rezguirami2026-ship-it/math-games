// لقطات مناظر «قمة جبل شمس» الثلاث في العرض ثلاثي الأبعاد
import { openAdventure, sleep } from './adv-lib.mjs';
const T = await openAdventure('mountain', { d3: true }); const { page } = T;
for (const [a, x, y] of [['base', 14, 18], ['canyon', 12, 15], ['summit', 12, 9]]) {
  await page.evaluate(([a, x, y]) => window.__adv.goto(a, x, y), [a, x, y]); await sleep(2500);
  for (let i = 0; i < 10 && await page.$('.advDlg.on'); i++) { await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(200); }
  await sleep(800); await page.screenshot({ path: `${process.argv[2]}/${a}.png` });
}
await T.done();
