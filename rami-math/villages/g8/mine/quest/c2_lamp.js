// الفصل ٢ «ضوء المصباح»: نفق مظلم من الأعلى، والضوء دائرة حول البطل فقط. الشظايا البلّورية الثلاث لا تُرى إلا في الضوء،
// والمصباح يخفت فيُملأ من جرار الزيت المضيئة، وسهم صغير على حافة الضوء يشير إلى أقرب هدف. ثم تنفتح البوابة البلّورية.
// الحركة: النقر على المكان (يمشي البطل إليه) أو الأسهم.
import { canvasStage } from '../../../quest.js';
import { ar } from '../../../../core/util.js';

const MAP = [
  '##########################',
  '#.....#.........#........#',
  '#.##..#..####...#..####..#',
  '#..#.....#..#......#.....#',
  '##.#######..####.###.##.##',
  '#........#.....#.....#...#',
  '#.######.#.###.#####.#.#.#',
  '#.#....#...#.......#...#.#',
  '#.#.##.#####.#####.#####.#',
  '#...#..........#.........#',
  '##########################'
];
export default async function (api) {
  const S = canvasStage(api), CW = 64, Wm = MAP[0].length, Hm = MAP.length;
  const wall = (x, y) => { const r = MAP[Math.floor(y)]; return !r || r[Math.floor(x)] !== '.'; };
  const hero = { x: 1.5, y: 1.5, tx: null, ty: null, dir: 0 }, shards = [[11.5, 3.5], [3.5, 7.5], [22.5, 5.5]].map(([x, y]) => ({ x, y, got: false }));
  const oils = [[5.5, 9.5], [13.5, 5.5], [18.5, 1.5]].map(([x, y]) => ({ x, y })), door = { x: 24.5, y: 9.5 };
  let fuel = 1, got = 0, done = false, warned = false; const keys = {};
  api.onKey(e => { const k = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[e.key]; if (k) { keys[k] = e.type === 'keydown'; hero.tx = null; e.preventDefault(); } });
  let cam = { x: hero.x, y: hero.y };
  S.cv.addEventListener('pointerdown', e => { const b = S.cv.getBoundingClientRect(), Z = scale(); hero.tx = (e.clientX - b.left - S.w / 2) / Z / CW + cam.x; hero.ty = (e.clientY - b.top - S.h / 2) / Z / CW + cam.y; });
  const scale = () => Math.min(1.25, Math.max(.7, Math.min(S.w, S.h) / 560));
  window.__qch = { hero, shards, oils, door, MAP, get got() { return got; } };   // للاختبار الآلي
  api.say('النفق مظلم جداً… ضوء مصباحك يكشف ما حولك فقط. ابحث عن ثلاث شظايا بلّورية تلمع.', 7000);
  await S.run((g, w, h, dt, t) => {
    // الحركة: نحو النقطة المنقورة أو بالأسهم، مع انزلاق على الجدران
    let mx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), my = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    if (!mx && !my && hero.tx != null) { const dx = hero.tx - hero.x, dy = hero.ty - hero.y, d = Math.hypot(dx, dy); if (d < .08) hero.tx = null; else { mx = dx / d; my = dy / d; } }
    const n = Math.hypot(mx, my); if (n) { mx /= n; my /= n; hero.dir = Math.atan2(my, mx); const sp = 3.6 * dt, r = .28;
      if (!wall(hero.x + mx * sp + Math.sign(mx) * r, hero.y)) hero.x += mx * sp; if (!wall(hero.x, hero.y + my * sp + Math.sign(my) * r)) hero.y += my * sp; hero.walk = (hero.walk || 0) + dt * 10; }
    cam.x += (hero.x - cam.x) * .12; cam.y += (hero.y - cam.y) * .12;
    fuel = Math.max(.18, fuel - dt * .028);
    if (fuel < .45 && !warned) { warned = true; api.hint('ضوء المصباح يصغر! جرّة الزيت المضيئة تملؤه، ابحث عن أقربها.'); }
    oils.forEach(o => { if (Math.hypot(o.x - hero.x, o.y - hero.y) < .6 && fuel < .98) { fuel = 1; warned = false; api.sfx('pick'); api.step(1); } });
    shards.forEach(s => { if (!s.got && Math.hypot(s.x - hero.x, s.y - hero.y) < .55) { s.got = true; got++; api.sfx('win'); api.say(got < 3 ? `شظية ${['', 'أولى', 'ثانية'][got]}! بقي ${ar(3 - got)}.` : 'جمعتَ الشظايا الثلاث! البوابة البلّورية في آخر النفق تلمع الآن.'); if (got === 3) api.step(0); } });
    if (got === 3 && Math.hypot(door.x - hero.x, door.y - hero.y) < .7 && !done) { done = t; api.step(2); }
    // الرسم بالعالم: الأرض والجدران
    const Z = scale(); g.fillStyle = '#05060A'; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.scale(Z, Z); g.translate(-cam.x * CW, -cam.y * CW);
    for (let y = 0; y < Hm; y++) for (let x = 0; x < Wm; x++) { const px = x * CW, py = y * CW;
      if (MAP[y][x] === '.') { g.fillStyle = (x + y) % 2 ? '#5C4E40' : '#56493C'; g.fillRect(px, py, CW, CW); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(px + (x * 17 % 40), py + (y * 23 % 40), 10, 6); }
      else { g.fillStyle = '#2E241C'; g.fillRect(px, py, CW, CW); if (MAP[y + 1] && MAP[y + 1][x] === '.') { g.fillStyle = '#4A3A2C'; g.fillRect(px, py + CW - 16, CW, 16); g.fillStyle = '#6B5845'; g.fillRect(px, py + CW - 16, CW, 4); } } }
    oils.forEach(o => { const x = o.x * CW, y = o.y * CW, gl = g.createRadialGradient(x, y, 2, x, y, 60); gl.addColorStop(0, 'rgba(255,190,100,.55)'); gl.addColorStop(1, 'rgba(255,190,100,0)'); g.fillStyle = gl; g.fillRect(x - 60, y - 60, 120, 120); g.fillStyle = '#B88A2E'; g.beginPath(); g.roundRect(x - 10, y - 14, 20, 26, 6); g.fill(); g.fillStyle = '#FFE08A'; g.beginPath(); g.arc(x, y - 18, 5 + Math.sin(t * 7) * 1, 0, 7); g.fill(); });
    const dg = g.createRadialGradient(door.x * CW, door.y * CW, 4, door.x * CW, door.y * CW, 70); dg.addColorStop(0, got === 3 ? 'rgba(124,245,200,.8)' : 'rgba(124,245,200,.15)'); dg.addColorStop(1, 'rgba(124,245,200,0)'); g.fillStyle = dg; g.fillRect(door.x * CW - 70, door.y * CW - 70, 140, 140);
    g.fillStyle = got === 3 ? '#7CF5C8' : '#3A5A50'; g.fillRect(door.x * CW - 20, door.y * CW - 28, 40, 56);
    shards.forEach(s => { if (s.got) return; const x = s.x * CW, y = s.y * CW, k = 9 + Math.sin(t * 3 + s.x) * 2; g.fillStyle = '#B28CFF'; g.beginPath(); g.moveTo(x, y - k * 1.6); g.lineTo(x + k, y); g.lineTo(x, y + k * 1.6); g.lineTo(x - k, y); g.fill(); g.fillStyle = '#EDE4FF'; g.beginPath(); g.moveTo(x, y - k * 1.6); g.lineTo(x + k * .4, y - 2); g.lineTo(x, y); g.fill(); });
    // البطل من الأعلى: كتفان ورأس بغترة ومصباح في يده
    const hx = hero.x * CW, hy = hero.y * CW; g.save(); g.translate(hx, hy); g.rotate(hero.dir); g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(3, 3, 18, 14, 0, 0, 7); g.fill();
    g.fillStyle = '#F7F5EF'; g.beginPath(); g.ellipse(0, 0, 13, 18, 0, 0, 7); g.fill(); g.fillStyle = '#E5E7EB'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = '#FFC46B'; g.beginPath(); g.arc(16, 10, 5, 0, 7); g.fill(); g.restore();
    g.restore();
    // الظلام: كل شيء أسود إلا دائرة المصباح ومخروطه، وتوهج جرار الزيت والبوابة
    const toS = (x, y) => [w / 2 + (x - cam.x) * CW * Z, h / 2 + (y - cam.y) * CW * Z], R = (1.6 + fuel * 2.4) * CW * Z, [sx, sy] = toS(hero.x, hero.y);
    g.save(); g.fillStyle = 'rgba(3,4,8,.97)'; g.beginPath(); g.rect(0, 0, w, h);
    const hole = (x, y, r) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2, true); };
    hole(sx, sy, R); oils.forEach(o => { const [x, y] = toS(o.x, o.y); hole(x, y, 46 * Z); }); if (got === 3) { const [x, y] = toS(door.x, door.y); hole(x, y, 60 * Z); }
    g.fill('evenodd'); g.restore();
    const sg = g.createRadialGradient(sx, sy, R * .55, sx, sy, R); sg.addColorStop(0, 'rgba(3,4,8,0)'); sg.addColorStop(1, 'rgba(3,4,8,.97)'); g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, R + 1, 0, 7); g.fill();
    // سهم على حافة الضوء نحو أقرب هدف
    const tgt = got < 3 ? shards.filter(s => !s.got).sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y))[0] : door;
    if (tgt && Math.hypot(tgt.x - hero.x, tgt.y - hero.y) > 1.6) { const a = Math.atan2(tgt.y - hero.y, tgt.x - hero.x), ax = sx + Math.cos(a) * (R - 18), ay = sy + Math.sin(a) * (R - 18);
      g.save(); g.translate(ax, ay); g.rotate(a); g.fillStyle = got < 3 ? '#C4B5FD' : '#7CF5C8'; g.globalAlpha = .7 + .3 * Math.sin(t * 5); g.beginPath(); g.moveTo(12, 0); g.lineTo(-8, -9); g.lineTo(-4, 0); g.lineTo(-8, 9); g.fill(); g.restore(); }
    // مقياس الزيت
    g.fillStyle = 'rgba(255,253,246,.95)'; g.beginPath(); g.roundRect(w - 180, h - 120, 160, 50, 14); g.fill(); g.fillStyle = '#1E2433'; g.font = '800 14px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
    g.fillText(`🏮 الزيت · 💎 ${ar(got)} من ٣`, w - 100, h - 100); g.fillStyle = '#E2E8F0'; g.fillRect(w - 165, h - 90, 130, 10); g.fillStyle = fuel < .45 ? '#F97316' : '#F59E0B'; g.fillRect(w - 35 - 130 * fuel, h - 90, 130 * fuel, 10);
    return done && t - done > 1.4;
  });
}
