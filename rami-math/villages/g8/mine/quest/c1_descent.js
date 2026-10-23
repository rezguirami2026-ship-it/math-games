// الفصل ١ «النزول»: مقطع جانبي في بئر المنجم. القفص يتدلّى من حبل ويتأرجح، والطالب يدفعه يميناً ويساراً ليتفادى العوارض
// البارزة من الجدارين ويجمع البلّورات، ثم يضغط «توقّف» حين تصل المحطة السفلية إلى الإطار الأخضر. الاصطدام يهزّ القفص فقط.
import { canvasStage } from '../../../quest.js';
import { ar, neg } from '../../../../core/util.js';

const DEPTH = 60;   // متراً حتى المحطة السفلية
export default async function (api) {
  const S = canvasStage(api), M = 26;   // بكسل لكل متر
  const beams = [], gems = [];
  for (let d = 8; d < DEPTH - 6; d += 5 + Math.random() * 2.5) { const side = beams.length % 2 ? 1 : -1; beams.push({ d, side, len: .28 + Math.random() * .16 }); gems.push({ d: d + 2.2, x: -side * (.15 + Math.random() * .12), got: false }); }
  const st = { x: 0, vx: 0, d: 0, v: 0, started: false, hits: 0, got: 0, shake: 0, stop: false, msg: 0 };
  const ctl = S.controls([{ id: 'L', label: '◀' }, { id: 'R', label: '▶' }, { id: 'B', label: '⏬ انزل', big: true }], id => {
    if (id === 'B') { if (!st.started) { st.started = true; api.step(0); api.say('أحسنت! حرّك القفص بالسهمين بعيداً عن العوارض، واجمع البلّورات.'); ctl.box.querySelector('[data-id=B]').textContent = '✋ توقّف'; }
      else if (!st.stop) { const left = DEPTH - st.d; if (left < 2.2) { st.stop = true; } else { api.hint(`ما زالت المحطة بعيدة: ${ar(Math.round(left))} أمتار. اضغط «توقّف» حين تدخل المحطة الإطار الأخضر.`); } } } });
  api.onKey(e => { const k = { ArrowLeft: 'L', ArrowRight: 'R', ' ': 'B', ArrowDown: 'B' }[e.key]; if (!k) return; if (k === 'B') { if (e.type === 'keydown') ctl.box.querySelector('[data-id=B]').onpointerdown(e); } else ctl.held[k] = e.type === 'keydown'; e.preventDefault(); });
  window.__qch = { st, beams, ctl, DEPTH };   // للاختبار الآلي
  api.say('أنا العمّ سالم… أسمعك عبر اللاسلكي! اضغط «انزل» ليبدأ القفص بالنزول.', 7000);
  await S.run((g, w, h, dt, t) => {
    const cx = w / 2, shaftW = Math.min(w * .7, 520), L = cx - shaftW / 2, R = cx + shaftW / 2, cageY = h * .42;
    if (st.started && !st.stop) { st.v = Math.min(3.2, st.v + dt * 1.2); }
    if (st.stop) st.v = Math.max(0, st.v - dt * 6);
    st.d = Math.min(DEPTH + .5, st.d + st.v * dt);
    const push = (ctl.held.R ? 1 : 0) - (ctl.held.L ? 1 : 0); st.vx += push * dt * 2.4 - st.x * dt * 1.6; st.vx *= .96; st.x = Math.max(-.42, Math.min(.42, st.x + st.vx * dt));
    // الاصطدام بالعوارض: هزّة وتباطؤ (بلا عقاب)
    beams.forEach(b => { if (b.hit || Math.abs(b.d - st.d) > .6) return; const reach = -.5 + b.len; if ((b.side < 0 && st.x - .09 < reach) || (b.side > 0 && st.x + .09 > -reach)) { b.hit = true; st.hits++; st.shake = .5; st.v *= .35; st.vx = -b.side * .9; api.sfx('cough'); if (st.hits === 1) api.hint('انتبه! العارضة تبرز من الجدار: حرّك القفص إلى الجهة الأخرى قبل أن تصلها.'); } });
    gems.forEach(q => { if (q.got || Math.abs(q.d - st.d) > .7 || Math.abs(q.x - st.x) > .12) return; q.got = true; st.got++; api.sfx('pick'); if (st.got === 5) api.step(2); });
    if (st.d > beams[Math.min(3, beams.length - 1)].d && !st.s1) { st.s1 = 1; api.step(1); }
    st.shake = Math.max(0, st.shake - dt);
    // الرسم: جداران صخريان بطبقات تتحرك للأعلى، العوارض، البلّورات، الحبل والقفص، والمحطة السفلية
    const sh = st.shake ? (Math.random() - .5) * 10 * st.shake : 0; g.save(); g.translate(sh, 0);
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#3B2A1E'); bg.addColorStop(1, '#1A120C'); g.fillStyle = bg; g.fillRect(-20, 0, w + 40, h);
    const yOf = d => cageY + (d - st.d) * M;
    g.fillStyle = '#4A3A2C'; g.fillRect(L, 0, shaftW, h);
    for (let d = Math.floor(st.d - 20); d < st.d + 30; d++) { const y = yOf(d); if (y < -30 || y > h + 30) continue; g.fillStyle = d % 2 ? '#5A4636' : '#53402F'; g.fillRect(L, y, shaftW, M); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(L + (d * 37 % shaftW), y + 6, 24, 4); }
    [[0, L, -1], [R, w, 1]].forEach(([a, b]) => { const gr = g.createLinearGradient(a, 0, b, 0); gr.addColorStop(0, '#2A1E15'); gr.addColorStop(1, '#3E2E22'); g.fillStyle = gr; g.fillRect(a, 0, b - a, h);
      for (let d = Math.floor(st.d - 20); d < st.d + 30; d += 2) { const y = yOf(d); g.fillStyle = 'rgba(255,220,180,.06)'; g.beginPath(); g.ellipse(a + (b - a) * ((d * 13 % 7) / 7), y, 26, 12, 0, 0, 7); g.fill(); } });
    // أمتار العمق على الجدار
    g.font = '800 14px Cairo'; g.textAlign = 'center'; g.direction = 'rtl';
    for (let d = Math.ceil((st.d - 15) / 5) * 5; d < st.d + 25; d += 5) { const y = yOf(d); if (d < 0) continue; g.fillStyle = 'rgba(255,240,210,.85)'; g.fillRect(L - 4, y - 1, 12, 2); g.fillText(d ? `${neg(ar(d))} م` : '٠ م', L - 38, y + 5); }
    beams.forEach(b => { const y = yOf(b.d); if (y < -40 || y > h + 40) return; const bw = shaftW * b.len, x0 = b.side < 0 ? L : R - bw;
      g.fillStyle = b.hit ? '#5C3A20' : '#8B5A33'; g.fillRect(x0, y - 9, bw, 18); g.fillStyle = '#6A4428'; g.fillRect(x0, y + 5, bw, 4); g.strokeStyle = '#3B2414'; g.lineWidth = 2; g.strokeRect(x0, y - 9, bw, 18);
      g.fillStyle = '#DC2626'; for (let k = 0; k < bw; k += 26) g.fillRect(x0 + k + (b.side < 0 ? bw - 26 : 0) * 0, y - 9, 13, 4); });
    gems.forEach(q => { if (q.got) return; const y = yOf(q.d); if (y < -30 || y > h + 30) return; const x = cx + q.x * shaftW, s = 9 + Math.sin(t * 4 + q.d) * 1.5;
      const gl = g.createRadialGradient(x, y, 1, x, y, 26); gl.addColorStop(0, 'rgba(95,211,255,.7)'); gl.addColorStop(1, 'rgba(95,211,255,0)'); g.fillStyle = gl; g.fillRect(x - 26, y - 26, 52, 52);
      g.fillStyle = '#5FD3FF'; g.beginPath(); g.moveTo(x, y - s * 1.4); g.lineTo(x + s, y); g.lineTo(x, y + s * 1.4); g.lineTo(x - s, y); g.fill(); g.fillStyle = '#E0F7FF'; g.beginPath(); g.moveTo(x, y - s * 1.4); g.lineTo(x + s * .4, y - 2); g.lineTo(x, y); g.fill(); });
    // المحطة السفلية والإطار الأخضر
    const py = yOf(DEPTH); g.fillStyle = '#6A4428'; g.fillRect(L, py + 30, shaftW, 22); g.fillStyle = '#FFC46B'; [L + 20, R - 20].forEach(x => { g.beginPath(); g.arc(x, py + 22, 6, 0, 7); g.fill(); });
    g.strokeStyle = st.stop ? '#22C55E' : `rgba(34,197,94,${.5 + .4 * Math.sin(t * 5)})`; g.lineWidth = 5; g.setLineDash([12, 8]); g.strokeRect(L + 8, cageY - 60, shaftW - 16, 120); g.setLineDash([]);
    // الحبل والقفص والبطل داخله
    const x = cx + st.x * shaftW, tilt = st.vx * .25; g.strokeStyle = '#9CA3AF'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, 0); g.lineTo(x, cageY - 44); g.stroke();
    g.save(); g.translate(x, cageY); g.rotate(tilt);
    g.fillStyle = 'rgba(255,200,110,.18)'; g.beginPath(); g.arc(0, 0, 70, 0, 7); g.fill();
    g.fillStyle = '#C9CED6'; g.fillRect(-34, -44, 68, 88); g.fillStyle = '#F2C67E'; g.beginPath(); g.arc(0, -6, 12, 0, 7); g.fill(); g.fillStyle = '#F7F5EF'; g.fillRect(-12, 6, 24, 30); g.fillStyle = '#E5E7EB'; g.beginPath(); g.ellipse(0, -16, 13, 6, 0, Math.PI, 0); g.fill();
    g.strokeStyle = '#4B5563'; g.lineWidth = 3; g.strokeRect(-34, -44, 68, 88); for (let k = -24; k <= 24; k += 12) { g.beginPath(); g.moveTo(k, -44); g.lineTo(k, 44); g.stroke(); }
    g.fillStyle = '#FFC46B'; g.beginPath(); g.arc(0, -36, 5, 0, 7); g.fill(); g.restore();
    g.restore();
    // العدّاد
    g.fillStyle = 'rgba(255,253,246,.95)'; g.beginPath(); g.roundRect(w - 170, h - 210, 150, 84, 16); g.fill(); g.fillStyle = '#1E2433'; g.direction = 'rtl'; g.textAlign = 'center'; g.font = '800 14px Cairo';
    g.fillText('العمق', w - 95, h - 186); g.font = '900 24px Cairo'; g.fillText(`${Math.round(st.d) ? neg(ar(Math.round(st.d))) : '٠'} م`, w - 95, h - 160); g.font = '800 14px Cairo'; g.fillText(`💎 ${ar(st.got)} من ${ar(gems.length)}`, w - 95, h - 136);
    if (st.stop && st.v <= 0) { if (!st.endT) { st.endT = t; api.step(3); api.say('وصلتَ إلى المحطة السفلية! أمامك نفق مظلم… أشعل مصباحك.'); } if (t - st.endT > 2.2) return true; }
    if (st.d >= DEPTH + .5 && !st.stop) { st.stop = true; api.hint('تجاوزتَ المحطة قليلاً… لا بأس، توقّف القفص.'); }
    return false;
  });
}
