import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), T = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/json' };
const srv = createServer(async (q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).slice(1) || 'index.html'; try { const b = await readFile(join(ROOT, p)); r.writeHead(200, { 'content-type': T[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(r => srv.listen(0, r));
const [w, h] = (process.argv[2] || '375x667').split('x').map(Number);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto(`http://localhost:${srv.address().port}/?2d=1&preview=1`); await p.waitForTimeout(3000);
const res = await p.evaluate(async () => {
  const { runChallenge } = await import('./missions/challenge.js'); const out = [];
  for (let u = 1; u <= 9; u++) { const { CH } = await import(`./content/challenges${u}.js`);
    for (const [id, c] of Object.entries(CH)) { const items = c.make();
      for (let k = 0; k < items.length; k++) { const d = { ch: { items, i: k, firstTry: 0, tries: 0, gems: 0, streak: 0 } }; runChallenge(window.__game.W, d, Object.assign({ id: 'x' }, c));
        await new Promise(r => setTimeout(r, 30)); const s = document.querySelector('#panel .sheet'); const over = s.scrollHeight - s.clientHeight;
        if (over > 2) out.push(`${id}#${k} ${items[k].type} +${over}px`); } } }
  return out; });
console.log(`${w}x${h}: ${res.length} بحاجة لتمرير`); console.log(res.join('\n')); await b.close(); srv.close();
