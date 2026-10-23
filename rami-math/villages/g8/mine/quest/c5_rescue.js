// الفصل ٥ «الإنقاذ»: العمّ سالم عالق تحت عارضة خشبية. البطل يضع الرافعة تحتها ثم يرفعها درجة بعد درجة: مؤشر يتأرجح على قوس،
// والطالب يضغط «ارفع» حين يكون المؤشر في المنطقة الخضراء (تضيق قليلاً مع كل درجة). الضغط خارجها ينزلق بالعارضة درجة فقط.
import { canvasStage } from '../../../quest.js';
import { ar } from '../../../../core/util.js';

const NEED = 4;
export default async function (api) {
  const S = canvasStage(api); const st = { lvl: 0, a: 0, dir: 1, placed: false, flash: 0, ok: 0, out: 0, done: 0, misses: 0, beamY: 0 };
  const zone = () => .2 - st.lvl * .025;   // نصف عرض المنطقة الخضراء (من −١ إلى ١)
  const press = () => { if (st.done) return;
    if (!st.placed) { st.placed = true; api.step(0); api.say('الرافعة تحت العارضة. راقب المؤشر، واضغط «ارفع» حين يدخل المنطقة الخضراء.'); return; }
    if (Math.abs(st.a) < zone()) { st.lvl++; st.ok = 1; api.sfx('win'); if (st.lvl === 2) api.step(1); if (st.lvl >= NEED) { st.done = 1; api.step(1); api.step(2); api.say('ارتفعت العارضة! خرج العمّ سالم… «شكراً يا بني! لكن… أتسمع هذا الصوت؟»', 6000); } }
    else { st.misses++; st.out = 1; if (st.lvl > 0) st.lvl--; api.sfx('cough'); if (st.misses === 1 || st.misses % 3 === 0) api.hint('انتظر حتى يصل المؤشر إلى الوسط الأخضر تماماً، ثم اضغط.'); } };
  const ctl = S.controls([{ id: 'up', label: '⬆ ارفع', big: true }], press);
  api.onKey(e => { if (e.type === 'keydown' && (e.key === ' ' || e.key === 'ArrowUp')) { press(); e.preventDefault(); } });
  window.__qch = { st, zone, press };   // للاختبار الآلي
  api.say('العمّ سالم هنا تحت العارضة! اضغط «ارفع» لتضع الرافعة تحتها أولاً.', 7000);
  let doneT = 0;
  await S.run((g, w, h, dt, t) => {
    if (st.placed && !st.done) { const sp = 1.3 + st.lvl * .35; st.a += st.dir * dt * sp; if (Math.abs(st.a) > 1) { st.a = Math.sign(st.a); st.dir *= -1; } }
    st.ok = Math.max(0, st.ok - dt * 2); st.out = Math.max(0, st.out - dt * 2);
    const targetY = st.done ? 1.4 : st.lvl / NEED; st.beamY += (targetY - st.beamY) * Math.min(1, dt * 6);
    // الحجرة: جدران صخرية دافئة بضوء المصباح
    const bg = g.createRadialGradient(w / 2, h * .55, 40, w / 2, h * .55, Math.max(w, h) * .7); bg.addColorStop(0, '#6B5236'); bg.addColorStop(1, '#1E150E'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const fy = h * .72; g.fillStyle = '#4A3A2C'; g.fillRect(0, fy, w, h - fy); g.fillStyle = '#5A4636'; g.fillRect(0, fy, w, 10);
    // العمّ سالم مستلقٍ ثم يقف
    const sx = w / 2 + 40; if (!st.done) { g.fillStyle = '#6B5A48'; g.beginPath(); g.roundRect(sx - 70, fy - 26, 120, 26, 12); g.fill(); g.fillStyle = '#A8764E'; g.beginPath(); g.arc(sx + 60, fy - 16, 14, 0, 7); g.fill(); g.fillStyle = '#E3B04B'; g.beginPath(); g.ellipse(sx + 62, fy - 26, 16, 7, 0, Math.PI, 0); g.fill(); g.fillStyle = '#E5E5E5'; g.beginPath(); g.ellipse(sx + 60, fy - 6, 9, 6, 0, 0, Math.PI); g.fill(); }
    else { const up = Math.min(1, (t - (doneT || (doneT = t))) * 1.2); g.fillStyle = '#6B5A48'; g.beginPath(); g.roundRect(sx + 20 - 14, fy - 40 - 60 * up, 28, 40 + 60 * up, 10); g.fill(); g.fillStyle = '#A8764E'; g.beginPath(); g.arc(sx + 20, fy - 54 - 60 * up, 14, 0, 7); g.fill(); g.fillStyle = '#E3B04B'; g.beginPath(); g.ellipse(sx + 20, fy - 64 - 60 * up, 16, 7, 0, Math.PI, 0); g.fill(); }
    // العارضة: ترتفع بقدر الدرجات
    const by = fy - 40 - st.beamY * 120, tilt = -.08 + st.beamY * .05;
    g.save(); g.translate(w / 2, by); g.rotate(tilt); g.fillStyle = '#8B5A33'; g.fillRect(-220, -16, 440, 32); g.fillStyle = '#6A4428'; g.fillRect(-220, 10, 440, 6); g.strokeStyle = '#3B2414'; g.lineWidth = 3; g.strokeRect(-220, -16, 440, 32);
    for (let k = -200; k < 220; k += 60) { g.strokeStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.moveTo(k, -14); g.lineTo(k + 20, 14); g.stroke(); } g.restore();
    // الرافعة والبطل
    if (st.placed) { const jx = w / 2 - 120; g.fillStyle = '#DC2626'; g.fillRect(jx - 14, by + 14, 28, fy - by - 14); g.fillStyle = '#9CA3AF'; g.fillRect(jx - 22, fy - 10, 44, 10); g.strokeStyle = '#374151'; g.lineWidth = 6; g.beginPath(); g.moveTo(jx + 10, fy - 40); g.lineTo(jx + 60, fy - 70 + (st.ok ? 20 : 0)); g.stroke(); }
    g.fillStyle = '#F7F5EF'; g.beginPath(); g.roundRect(w / 2 - 210, fy - 72, 30, 70, 10); g.fill(); g.fillStyle = '#C68A5B'; g.beginPath(); g.arc(w / 2 - 195, fy - 84, 13, 0, 7); g.fill(); g.fillStyle = '#F7F5EF'; g.beginPath(); g.ellipse(w / 2 - 195, fy - 92, 14, 6, 0, Math.PI, 0); g.fill();
    // مقياس القوة: قوس بمنطقة خضراء ومؤشر
    if (st.placed && !st.done) { const cx = w / 2, cy = 130, R = Math.min(170, w * .32);
      g.lineWidth = 22; g.strokeStyle = '#E2E8F0'; g.beginPath(); g.arc(cx, cy + R * .2, R, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      const z = zone(), a0 = Math.PI * 1.5 - z * Math.PI * .35, a1 = Math.PI * 1.5 + z * Math.PI * .35; g.strokeStyle = '#22C55E'; g.beginPath(); g.arc(cx, cy + R * .2, R, a0, a1); g.stroke();
      const an = Math.PI * 1.5 + st.a * Math.PI * .35; g.strokeStyle = st.out ? '#DC2626' : '#1E2433'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy + R * .2); g.lineTo(cx + Math.cos(an) * (R + 14), cy + R * .2 + Math.sin(an) * (R + 14)); g.stroke();
      g.fillStyle = '#FFFDF6'; g.beginPath(); g.roundRect(cx - 80, cy + R * .2 + 10, 160, 34, 12); g.fill(); g.fillStyle = '#1E2433'; g.font = '800 16px Cairo'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(`درجة ${ar(st.lvl)} من ${ar(NEED)}`, cx, cy + R * .2 + 33); }
    if (st.ok) { g.fillStyle = `rgba(34,197,94,${st.ok * .25})`; g.fillRect(0, 0, w, h); } if (st.out) { g.fillStyle = `rgba(220,38,38,${st.out * .18})`; g.fillRect(0, 0, w, h); }
    return st.done && doneT && t - doneT > 3;
  });
}
