import { chromium } from 'playwright-core';
const sleep = ms => new Promise(r => setTimeout(r, ms)), out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const page = await b.newPage({ viewport: { width: 1000, height: 640 } }); const shotEarly = async () => {};
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('requestfailed', r => errs.push('FAILED ' + r.url())); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 160)); });
await page.goto('http://localhost:8000/?preview=1'); await page.evaluate(() => localStorage.clear()); await page.reload();
await sleep(2500); if (await page.$('#bNew')) { await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo'); }
await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 }); await sleep(3000);
await page.evaluate(async () => { window.__m = await import('/adventure/index.js'); });
await page.evaluate(() => { window.__m.playAdventure('rescue'); }); await sleep(4000);
await page.screenshot({ path: `${out}/a3-1.png` });
for (let i = 0; i < 4; i++) { await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(300); }
await page.evaluate(() => { window.__adv.use('harith'); }); await sleep(6000); await page.screenshot({ path: `${out}/a3-2.png` });
for (let i = 0; i < 8; i++) { await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(250); }
await page.evaluate(() => { const A = window.__adv; A.give('lantern', 1, true); A.give('sickle', 1, true); A.tp(4, 15); }); await sleep(2500); await page.screenshot({ path: `${out}/a3-3.png` });
await page.evaluate(() => window.__adv.goto('camp', 3, 10)); await sleep(3500);
for (let i = 0; i < 4; i++) { await page.evaluate(() => document.querySelector('.advDlg.on')?.click()); await sleep(250); }
await page.evaluate(() => window.__adv.tp(14, 11)); await sleep(2500); await page.screenshot({ path: `${out}/a3-4.png` });
console.log('3d canvas visible:', await page.evaluate(() => !document.querySelector('.advCv3').hidden), errs.slice(0, 6));
await b.close();
