// الفصل ٤ «المحوّلات»: خريطة سكك الأشغال القديمة من الأعلى كمخطط مضيء. الطالب ينقر المحوّلات (كل محوّل يوجّه السكة إلى أحد
// طريقين، والسهم يبيّن اتجاهه)، ثم يضغط «أطلق العربة» فتسير على الطريق المرسوم: إن وصلت الحاجز حطمته، وإن وصلت نهاية مسدودة
// اصطدمت بالصخور وعادت. مستويان: محوّلان ثم ثلاثة.
import { canvasStage } from '../../../quest.js';
import { ar } from '../../../../core/util.js';

const LEVELS = [
  { n: { s: [.1, .72], a: [.36, .72], b: [.36, .32], d1: [.66, .72], c: [.66, .32], g: [.9, .32], d2: [.66, .1] },
    e: { s: 'a', a: ['b', 'd1'], b: 'c', c: ['d2', 'g'] }, init: { a: 1, c: 0 } },
  { n: { s: [.08, .5], a: [.26, .5], b: [.26, .2], c: [.26, .8], e: [.52, .2], h: [.52, .8], d1: [.82, .2], d2: [.82, .8], f: [.52, .5], i: [.72, .5], g: [.92, .5], d3: [.72, .3] },
    e: { s: 'a', a: ['b', 'c'], b: 'e', c: 'h', e: ['d1', 'f'], h: ['f', 'd2'], f: 'i', i: ['d3', 'g'] }, init: { a: 0, e: 0, h: 1, i: 0 } }
];
export default async function (api) {
  const S = canvasStage(api); let lv = 0, sw = { ...LEVELS[0].init }, run = null, crash = 0, tries = 0, msgDead = false;
  const L = () => LEVELS[lv], next = id => { const e = L().e[id]; return e == null ? null : Array.isArray(e) ? e[sw[id]] : e; };
  const route = () => { const p = ['s']; for (let k = 0; k < 20; k++) { const n = next(p[p.length - 1]); if (!n) break; p.push(n); } return p; };
  const P = (id, w, h) => { const [x, y] = L().n[id], m = 70; return { x: m + x * (w - m * 2), y: 120 + y * (h - 260) }; };
  const ctl = S.controls([{ id: 'go', label: '🛒 أطلق العربة', big: true }], () => { if (run) return; run = { path: route(), i: 0, u: 0 }; api.step(1); api.sfx('engine'); });
  ctl.box.querySelector('button').style.width = '190px'; ctl.box.querySelector('button').style.fontSize = '20px';
  S.cv.addEventListener('pointerdown', e => { if (run) return; const b = S.cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    Object.keys(sw).forEach(id => { const p = P(id, S.w, S.h); if (Math.hypot(p.x - x, p.y - y) < 38) { sw[id] ^= 1; api.sfx('pick'); api.step(0); } }); });
  window.__qch = { get sw() { return sw; }, get lv() { return lv; }, get run() { return run; }, go: () => ctl.box.querySelector('button').onpointerdown(new Event('pointerdown')) };   // للاختبار الآلي
  api.say('هذه خريطة السكك. كل دائرة صفراء محوّل: انقرها لتغيّر اتجاه السكة، ثم أطلق العربة نحو الحاجز ⛔.', 8000);
  await S.run((g, w, h, dt, t) => {
    // المخطط: خلفية زرقاء بشبكة، السكك المرسومة، الطريق الحالي مضيء
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0F2A4A'); bg.addColorStop(1, '#0A1C33'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,180,255,.08)'; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const live = new Set(); const r = route(); r.forEach((id, k) => { if (k) live.add(r[k - 1] + '>' + id); });
    Object.entries(L().e).forEach(([a, e]) => (Array.isArray(e) ? e : [e]).forEach(b => { const A = P(a, w, h), B = P(b, w, h), on = live.has(a + '>' + b);
      g.strokeStyle = on ? '#FDE68A' : 'rgba(148,163,184,.45)'; g.lineWidth = on ? 9 : 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
      if (on) { g.strokeStyle = 'rgba(253,230,138,.25)'; g.lineWidth = 20; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); }
      g.strokeStyle = on ? '#92400E' : 'rgba(30,41,59,.9)'; g.lineWidth = 2; g.setLineDash([3, 9]); g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); g.setLineDash([]); }));
    // النهايات: الحاجز والصخور
    Object.keys(L().n).forEach(id => { const p = P(id, w, h);
      if (id === 'g') { const hit = crash && t - crash < 1.2; g.fillStyle = hit ? '#F97316' : '#B91C1C'; g.beginPath(); g.roundRect(p.x - 26, p.y - 30, 52, 60, 10); g.fill(); g.fillStyle = '#FFF'; g.font = '900 28px Cairo'; g.textAlign = 'center'; g.fillText('⛔', p.x, p.y + 10); }
      else if (id[0] === 'd') { g.fillStyle = '#78716C'; [[-12, 4], [10, 2], [0, -10]].forEach(([a, b]) => { g.beginPath(); g.arc(p.x + a, p.y + b, 13, 0, 7); g.fill(); }); }
      else if (id === 's') { g.fillStyle = '#22C55E'; g.beginPath(); g.arc(p.x, p.y, 14, 0, 7); g.fill(); g.fillStyle = '#FFF'; g.font = '800 13px Cairo'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText('البداية', p.x, p.y + 34); } });
    // المحوّلات: دائرة صفراء وسهم نحو الطريق المختار
    Object.keys(sw).forEach(id => { const p = P(id, w, h), q = P(L().e[id][sw[id]], w, h), a = Math.atan2(q.y - p.y, q.x - p.x);
      g.fillStyle = '#FACC15'; g.beginPath(); g.arc(p.x, p.y, 26 + (run ? 0 : Math.sin(t * 4) * 2), 0, 7); g.fill(); g.strokeStyle = '#78350F'; g.lineWidth = 3; g.stroke();
      g.save(); g.translate(p.x, p.y); g.rotate(a); g.fillStyle = '#78350F'; g.beginPath(); g.moveTo(16, 0); g.lineTo(-4, -11); g.lineTo(-4, 11); g.fill(); g.fillRect(-14, -4, 12, 8); g.restore(); });
    // العربة تسير على الطريق
    let cart = P('s', w, h);
    if (run) { const a = P(run.path[run.i], w, h), nb = run.path[run.i + 1];
      if (nb) { const b = P(nb, w, h), L2 = Math.hypot(b.x - a.x, b.y - a.y); run.u += dt * 260 / L2; if (run.u >= 1) { run.u = 0; run.i++; } cart = { x: a.x + (b.x - a.x) * Math.min(1, run.u), y: a.y + (b.y - a.y) * Math.min(1, run.u) }; }
      else { cart = a; const end = run.path[run.i];
        if (end === 'g') { if (!crash) { crash = t; api.sfx('gate'); api.say(lv === 0 ? 'دوّى الحاجز الأول وتحطم! لكن أمامنا حاجز أعمق… خريطته أصعب.' : 'تحطم الحاجز الأخير! أسمع صوت العمّ سالم خلفه.'); }
          if (t - crash > 1.8) { crash = 0; run = null; if (lv === 0) { lv = 1; sw = { ...LEVELS[1].init }; } else { api.step(2); return true; } } }
        else if (!run.back) { run.back = t; tries++; api.sfx('cough'); if (!msgDead || tries % 2 === 0) { msgDead = true; api.hint('اصطدمت العربة بالصخور في طريق مسدود. تتبّع الطريق المضيء من البداية بإصبعك، وغيّر المحوّل الذي يحيد به.'); } }
        else if (t - run.back > 1.2) run = null; } }
    const shake = crash && t - crash < .5 ? (Math.random() - .5) * 8 : 0;
    g.save(); g.translate(cart.x + shake, cart.y); g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(2, 10, 22, 7, 0, 0, 7); g.fill(); g.fillStyle = '#9CA3AF'; g.beginPath(); g.roundRect(-20, -14, 40, 24, 6); g.fill(); g.fillStyle = '#7A6B5C'; g.beginPath(); g.ellipse(0, -14, 16, 7, 0, Math.PI, 0); g.fill(); g.fillStyle = '#111'; [-12, 12].forEach(o => { g.beginPath(); g.arc(o, 10, 5, 0, 7); g.fill(); }); g.restore();
    g.fillStyle = 'rgba(255,253,246,.95)'; g.beginPath(); g.roundRect(w - 190, h - 104, 170, 40, 12); g.fill(); g.fillStyle = '#1E2433'; g.font = '800 15px Cairo'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(`⛔ الحاجز ${ar(lv + 1)} من ٢`, w - 105, h - 78);
    return false;
  });
}
