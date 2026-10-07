// يولّد أيقونات التطبيق من tests/app-icon.html: node app-icon.mjs ../assets/icons (مع خادم محلي على 8000 من مجلد اللعبة)
import { chromium } from 'playwright-core';
const out = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [q, name, size] of [['', 'icon-512', 512], ['', 'icon-192', 192], ['?mask=1', 'maskable-512', 512], ['?mask=1', 'apple-180', 180]]) {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: size / 512 });
  await page.goto('http://localhost:8000/tests/app-icon.html' + q); await page.waitForSelector('body[data-ready]');
  await page.locator('#w').screenshot({ path: `${out}/${name}.png`, omitBackground: !q });
  await page.close();
}
await browser.close();
