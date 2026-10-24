// مضمار السباق في العرض العادي بأدوات العالم المفتوح: مضمار بيضوي أحمر بحارات بيضاء وعشب في وسطه وعدّائين يركضون، ومدرّج ملوّن بجمهور يلوّح،
// وقوس البداية والنهاية، وبرج التوقيت بساعته الرقمية، وعيادة المضمار، وسوق المضمار، وأكشاك الدروس، ونصب ساعة التوقيت في الدوّار.
import { pattern, building3d, box3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const RED = '#DC2626', GOLD = '#FACC15', FLAGS = [RED, '#FFFFFF', '#2563EB', GOLD, '#16A34A'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, O = D.OVAL, St = D.STAND, Ti = D.TIMER;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP);
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paver(130, 150, 2210, 670, '#E5DDCC'); paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#D6CBB4'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#D6CBB4');
    // المضمار: بيضوي أحمر وحارات وعشب داخلي وخط البداية
    g.fillStyle = '#B91C1C'; g.beginPath(); g.ellipse(O.x, O.y, O.rx, O.ry, 0, 0, 7); g.fill();
    g.fillStyle = '#4D9A3A'; g.beginPath(); g.ellipse(O.x, O.y, O.rx - O.lane, O.ry - O.lane * .6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; for (let x = O.x - O.rx; x < O.x + O.rx; x += 50) g.fillRect(x, O.y - O.ry, 25, O.ry * 2);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; for (let k = 1; k < 5; k++) { const f = k / 5; g.beginPath(); g.ellipse(O.x, O.y, O.rx - O.lane * f, O.ry - O.lane * .6 * f, 0, 0, 7); g.stroke(); }
    g.fillStyle = '#FFFFFF'; g.fillRect(D.ARCH.x - 3, O.y + O.ry - O.lane * .6, 6, O.lane * .6); for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#111' : '#FFF'; g.fillRect(D.ARCH.x + 4, O.y + O.ry - O.lane * .6 + k * O.lane * .075, 8, O.lane * .075); }
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#E5DCC9'));
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84); [D.CLINIC, D.SHOP].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H)); boxShadow(g, St.x, St.y, St.w, St.h, St.H); boxShadow(g, Ti.x - Ti.s / 2, Ti.y - Ti.s / 2, Ti.s, Ti.s, Ti.H);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  // العدّاؤون على الحارات
  const groundLive = (c, t) => { for (let k = 0; k < 4; k++) { const f = (k + .5) / 5, a = t * (.35 + k * .04) + k, rx = O.rx - O.lane * f, ry = O.ry - O.lane * .6 * f, x = O.x + Math.cos(a) * rx, y = O.y + Math.sin(a) * ry;
    c.fillStyle = ['#FDE047', '#60A5FA', '#F472B6', '#FFFFFF'][k]; c.beginPath(); c.arc(x, y - 8, 5, 0, 7); c.fill(); c.fillRect(x - 3, y - 4, 6, 9); } };
  const items = t => {
    const out = [], k = D.kit;
    // المدرّج: درجات ملونة وجمهور يلوّح
    out.push({ x: St.x + St.w / 2, y: St.y + St.h, draw: c => box3d(c, 'g8rastand', St, '#94A3B8',
      cc => { cc.fillStyle = '#CBD5E1'; cc.fillRect(St.x, St.y - St.H, St.w, St.h); },
      cc => { const yb = St.y + St.h, yt = yb - St.H; for (let r = 0; r < 4; r++) { cc.fillStyle = ['#2563EB', '#DC2626', '#FACC15', '#16A34A'][r]; cc.fillRect(St.x, yt + r * St.H / 4, St.w, St.H / 4 - 3); }
        for (let q = 0; q < 50; q++) { const x = St.x + 10 + (q * 97 % (St.w - 20)), y = yt + 8 + (q % 4) * St.H / 4; cc.fillStyle = ['#7C2D12', '#C68A5B', '#A8764E'][q % 3]; cc.beginPath(); cc.arc(x, y, 4, 0, 7); cc.fill(); }
        cc.strokeStyle = '#334155'; cc.lineWidth = 1.2; cc.strokeRect(St.x, yt, St.w, St.H); }) });
    // قوس البداية والنهاية
    const Ar = D.ARCH; out.push({ x: Ar.x, y: Ar.y, draw: c => upright(c, Ar.x, Ar.y, cc => { cc.fillStyle = RED; cc.fillRect(Ar.x - 116, Ar.y - 120, 12, 120); cc.fillRect(Ar.x + 104, Ar.y - 120, 12, 120); cc.fillRect(Ar.x - 120, Ar.y - 136, 240, 26);
      cc.fillStyle = '#FFF'; cc.font = '900 16px Cairo'; cc.textAlign = 'center'; cc.direction = 'rtl'; cc.fillText('🏁 البداية والنهاية', Ar.x, Ar.y - 117); }) });
    // برج التوقيت بساعته الرقمية
    out.push({ x: Ti.x, y: Ti.y + Ti.s / 2, draw: c => { box3d(c, 'g8ratimer', { x: Ti.x - Ti.s / 2, y: Ti.y - Ti.s / 2, w: Ti.s, h: Ti.s, H: Ti.H }, '#475569', cc => { cc.fillStyle = '#64748B'; cc.fillRect(Ti.x - Ti.s / 2, Ti.y - Ti.s / 2 - Ti.H, Ti.s, Ti.s); }, cc => { cc.fillStyle = '#334155'; cc.fillRect(Ti.x - Ti.s / 2, Ti.y + Ti.s / 2 - Ti.H, Ti.s, Ti.H); });
      upright(c, Ti.x, Ti.y + Ti.s / 2, cc => { const y = Ti.y + Ti.s / 2 - Ti.H + 10; cc.fillStyle = '#0F172A'; cc.fillRect(Ti.x - 40, y, 80, 30); const sec = Math.floor(k.t) % 60, cs = Math.floor((k.t % 1) * 100); cc.fillStyle = '#F87171'; cc.font = '900 18px Consolas, monospace'; cc.textAlign = 'center'; cc.direction = 'ltr'; cc.fillText(`${String(sec).padStart(2, '0')}:${String(cs).padStart(2, '0')}`, Ti.x, y + 22); }); } });
    [D.CLINIC, D.SHOP].forEach((b, i) => out.push({ x: b.x + b.w / 2, y: b.y + b.h, draw: c => building3d(c, 'g8ra' + i, b) }));
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8ra' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', RED]) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8ra' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8ramosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8raminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب ساعة التوقيت العملاقة
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      cc.fillStyle = '#57534E'; cc.fillRect(R.x - 4, y - 50, 8, 40); cc.fillStyle = '#CBD5E1'; cc.beginPath(); cc.arc(R.x, y - 96, 46, 0, 7); cc.fill(); cc.fillStyle = '#FFFFFF'; cc.beginPath(); cc.arc(R.x, y - 96, 38, 0, 7); cc.fill(); cc.fillStyle = '#64748B'; cc.fillRect(R.x - 6, y - 150, 12, 10);
      const a = k.t * 1.2 - Math.PI / 2; cc.strokeStyle = RED; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(R.x, y - 96); cc.lineTo(R.x + Math.cos(a) * 32, y - 96 + Math.sin(a) * 32); cc.stroke(); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = RED; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = q % 2 ? '#111' : '#FFF'; cc.fillRect(R.x - 100 + q * 22, YARD - 177, 11, 11); }
      signboard(cc, R.x, YARD - 142, '🏁 مضمار السباق'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    D.BANNERS.forEach(([a, b], i) => bunting(c, elev(a[0], a[1], 120), elev(b[0], b[1], 120), 26, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t));
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, groundLive, items, over, station };
}
