// أدوات مشتركة لاختبار المغامرات: تشغيل اللعبة، فتح مغامرة، تنفيذ أفعال بالنقر كاللاعب مع تمرير الحوارات، ونتائج.
import { chromium } from 'playwright-core';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function openAdventure(id, { d3 = false, w = 1000, h = 640 } = {}) {
  const b = await chromium.launch({ channel: 'chrome' }); const page = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://localhost:8000/?preview=1' + (d3 ? '' : '&2d=1')); await page.evaluate(() => localStorage.clear()); await page.reload(); await sleep(2500);
  if (await page.$('#bNew')) { await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo'); }
  await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 90000 }); await sleep(1500);
  for (let i = 0; i < 12 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
  await page.evaluate(async id => { window.__adv = null; (await import('/adventure/index.js')).playAdventure(id); }, id);
  await page.waitForFunction(() => window.__adv, null, { timeout: 20000 });
  await page.evaluate(() => {
    const z = ms => new Promise(r => setTimeout(r, ms));
    window.__do = async fn => {
      let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
      for (let i = 0; i < 500; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; }
      return p;
    };
  });
  await page.evaluate(() => window.__do(() => new Promise(r => setTimeout(r, 900))));
  const results = [];
  const T = {
    page, b, errs, results,
    ok: (n, c, i = '') => { results.push([c ? '✅' : '❌', n, i]); },
    act: src => page.evaluate(`window.__do(A => ${src})`),
    tap: id => page.evaluate(`window.__do(A => A.tapEnt('${id}'))`),
    tile: (x, y) => page.evaluate(`window.__do(A => A.tapTile(${x}, ${y}))`),
    go: (x, y) => page.evaluate(`window.__do(A => A.goTile(${x}, ${y}))`),
    st: () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, stars: A.S.stars, goal: document.querySelector('.advGoal').textContent }; }),
    ev: (fn, arg) => page.evaluate(fn, arg),
    shot: async (out, n) => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); },
    done: async () => {
      T.ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
      console.log(results.map(r => r.join(' ')).join('\n'));
      console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`); await b.close();
    }
  };
  return T;
}
