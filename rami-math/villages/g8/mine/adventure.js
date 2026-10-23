// مغامرة منجم الأعماق: «رحلة العربة» — بعد فتح البوابة الكبرى تنطلق عربة البطل على السكة في أنفاق المنجم العميقة حتى قاعة الكنز.
// منظور ثلاثي الأبعاد من خلف العربة (إسقاط منظوري على القماش، خفيف على كل الأجهزة): ثلاث سكك، صخور ساقطة تُتفادى بالانتقال،
// وسكة مكسورة يُقفز فوقها، وبلّورات تُجمع. بلا عقاب: الاصطدام يبطئ العربة لحظة فقط. التحكم: الأسهم/المسافة أو السحب والنقر.
import { sfx, cheer } from '../../../core/sound.js';
import { ar } from '../../../core/util.js';

const LEN = 2600;   // طول الرحلة بالأمتار حتى قاعة الكنز
export function playAdventure({ onDone }) {
  const box = document.createElement('div'); box.className = 'vadv';
  box.innerHTML = `<canvas></canvas><div class="vadv-top"><b>🎢 رحلة العربة</b><span class="vadv-gem">💎 <i>٠</i></span><span class="vadv-bar"><i></i></span><button class="vadv-x" aria-label="خروج">✕</button></div>
    <div class="vadv-tip">⬅️ ➡️ لتبديل السكة · ⬆️ أو انقر للقفز فوق السكة المكسورة</div>`;
  document.body.append(box);
  const cv = box.querySelector('canvas'), g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; };
  size(); addEventListener('resize', size);
  // المسار: عناصر على مسافات ثابتة (لا عشوائية بلا حد): صخور، كسور، بلّورات
  const things = [], R = (a, b) => a + Math.random() * (b - a);
  for (let z = 140; z < LEN - 120; z += R(38, 70)) {
    const k = Math.random();
    if (k < .3) things.push({ z, lane: Math.floor(R(0, 3)), kind: 'rock' });
    else if (k < .45 && z > 400) things.push({ z, lane: -1, kind: 'gap' });   // كسر يعبر السكك الثلاث
    else { const lane = Math.floor(R(0, 3)); for (let j = 0; j < 4; j++) things.push({ z: z + j * 7, lane, kind: 'gem', c: ['#5FD3FF', '#B28CFF', '#7CF5C8', '#FFB347'][Math.floor(R(0, 4))] }); }
  }
  const totalGems = things.filter(t => t.kind === 'gem').length;
  const S = { z: 0, v: 26, lane: 1, lx: 1, jump: 0, jv: 0, gems: 0, hits: 0, slow: 0, t: 0, done: false, shake: 0, flash: 0 };
  // الإدخال
  const left = () => { if (S.lane > 0) { S.lane--; sfx('pick'); } }, right = () => { if (S.lane < 2) { S.lane++; sfx('pick'); } }, jump = () => { if (S.jump <= 0) { S.jv = 1.9; S.jump = .001; sfx('drop'); } };
  const onKey = e => { if (S.done) return; if (e.key === 'ArrowLeft' || e.key === 'a') left(); else if (e.key === 'ArrowRight' || e.key === 'd') right(); else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') jump(); else return; e.preventDefault(); };
  addEventListener('keydown', onKey);
  let px0 = 0, py0 = 0;
  cv.addEventListener('pointerdown', e => { px0 = e.clientX; py0 = e.clientY; });
  cv.addEventListener('pointerup', e => { const dx = e.clientX - px0, dy = e.clientY - py0;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? left : right)(); else if (dy < -30) jump(); else if (Math.abs(dx) < 12) { const x = e.clientX / W; x < .3 ? left() : x > .7 ? right() : jump(); } });
  // الإسقاط: منحنى النفق يتمايل يميناً ويساراً مع المسافة
  const curve = z => Math.sin(z * .004) * 1.6 + Math.sin(z * .011) * .7, hill = z => Math.sin(z * .006) * .35;
  const FOV = () => H * .9, camH = 1.6;
  const proj = (x, y, dz) => { const s = FOV() / Math.max(.6, dz); return { x: W / 2 + x * s, y: H * .42 + (camH - y) * s, s }; };
  let raf = 0, last = performance.now();
  function frame(now) {
    const all = Math.min(.12, (now - last) / 1000); last = now;
    for (let left = all; left > 1e-4 && !S.done; left -= .025) step(Math.min(.025, left));   // خطوات صغيرة بالزمن الحقيقي: نفس المدة على كل الأجهزة
    S.shake = Math.max(0, S.shake - all); S.flash = Math.max(0, S.flash - all);
    draw(); raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    S.t += dt;
    {
      S.v = Math.min(52, S.v + dt * 1.1) * (S.slow > 0 ? .55 : 1); S.slow = Math.max(0, S.slow - dt);
      S.z += S.v * dt; S.lx += (S.lane - S.lx) * Math.min(1, dt * 10);
      if (S.jump > 0) { S.jump += S.jv * dt * 3; S.jv -= dt * 6; if (S.jump <= 0) { S.jump = 0; S.jv = 0; } }
      // الاصطدام والجمع عند وصول العنصر إلى العربة
      for (const t of things) { if (t.hit || t.z > S.z + 1.2 || t.z < S.z - 1) continue;
        const same = t.lane === -1 || Math.abs(t.lane - S.lx) < .45;
        if (!same) continue; t.hit = true;
        if (t.kind === 'gem') { if (S.jump < .8) { S.gems++; sfx('pick'); S.flash = .3; } else t.hit = false; }
        else if (t.kind === 'rock' || (t.kind === 'gap' && S.jump < .35)) { S.hits++; S.slow = .9; S.shake = .5; sfx('cough'); }
      }
      if (S.z >= LEN) { S.done = true; finish(); }
    }
  }
  function draw() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sh = S.shake ? (Math.random() - .5) * 10 * S.shake : 0; g.save(); g.translate(sh, sh * .5);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#05050A'); bg.addColorStop(.42, '#140F0C'); bg.addColorStop(1, '#0A0806'); g.fillStyle = bg; g.fillRect(-20, -20, W + 40, H + 40);
    const z0 = S.z, c0 = curve(z0), lane = k => (k - 1) * 1.1;
    // شرائح النفق من البعيد إلى القريب: أرضية، جدران، دعامات، مصابيح
    const far = 90, step = 1.5;
    for (let d = far; d > .8; d -= step) {
      const z = z0 + d, z2 = z0 + d - step, cx = curve(z) - c0 - S.lx * 1.1 + 1.1, cx2 = curve(z2) - c0 - S.lx * 1.1 + 1.1, hy = hill(z) - hill(z0), hy2 = hill(z2) - hill(z0);
      const a = proj(cx - 2.4, hy, d), b = proj(cx + 2.4, hy, d), a2 = proj(cx2 - 2.4, hy2, d - step), b2 = proj(cx2 + 2.4, hy2, d - step);
      const fog = Math.max(0, 1 - d / far), lit = .35 + .65 * Math.pow(Math.max(0, Math.cos((z % 60) / 60 * Math.PI * 2)), 6);   // ضوء المصابيح كل ٦٠ متراً
      const shade = (r, gg, bb, k = 1) => `rgb(${Math.round(r * fog * k * lit)},${Math.round(gg * fog * k * lit)},${Math.round(bb * fog * k * lit)})`;
      g.fillStyle = shade(70, 58, 48); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(b2.x, b2.y); g.lineTo(a2.x, a2.y); g.fill();
      // الجداران والسقف (مقطع مضلع)
      const wl = proj(cx - 2.4, hy + 3.2, d), wr = proj(cx + 2.4, hy + 3.2, d), wl2 = proj(cx2 - 2.4, hy2 + 3.2, d - step), wr2 = proj(cx2 + 2.4, hy2 + 3.2, d - step);
      g.fillStyle = shade(88, 72, 60, .9); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(wl.x, wl.y); g.lineTo(wl2.x, wl2.y); g.lineTo(a2.x, a2.y); g.fill();
      g.fillStyle = shade(62, 50, 42, .9); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(wr.x, wr.y); g.lineTo(wr2.x, wr2.y); g.lineTo(b2.x, b2.y); g.fill();
      g.fillStyle = shade(40, 33, 28); g.beginPath(); g.moveTo(wl.x, wl.y); g.lineTo(wr.x, wr.y); g.lineTo(wr2.x, wr2.y); g.lineTo(wl2.x, wl2.y); g.fill();
      // السكك الثلاث: عوارض وقضبان
      if (Math.floor(z / 2) !== Math.floor(z2 / 2)) for (let k = 0; k < 3; k++) { const p1 = proj(cx + lane(k) - .45, hy, d), p2 = proj(cx + lane(k) + .45, hy, d); g.strokeStyle = shade(110, 70, 40); g.lineWidth = Math.max(1, p1.s * .12); g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.stroke(); }
      for (let k = 0; k < 3; k++) for (const o of [-.3, .3]) { const p1 = proj(cx + lane(k) + o, hy, d), p2 = proj(cx2 + lane(k) + o, hy2, d - step); g.strokeStyle = shade(170, 175, 185); g.lineWidth = Math.max(1, p1.s * .05); g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.stroke(); }
      // دعامة خشبية كل ٢٠ متراً، ومصباح عليها كل ٦٠
      if (Math.floor(z / 20) !== Math.floor(z2 / 20)) {
        const l0 = proj(cx - 2.3, hy, d), l1 = proj(cx - 2.3, hy + 3.1, d), r0 = proj(cx + 2.3, hy, d), r1 = proj(cx + 2.3, hy + 3.1, d);
        g.strokeStyle = shade(120, 80, 48); g.lineWidth = Math.max(2, l0.s * .22); g.beginPath(); g.moveTo(l0.x, l0.y); g.lineTo(l1.x, l1.y); g.lineTo(r1.x, r1.y); g.lineTo(r0.x, r0.y); g.stroke();
        if (Math.floor(z / 60) !== Math.floor(z2 / 60)) { const lp = proj(cx, hy + 2.9, d), r = lp.s * .9 * fog; const gl = g.createRadialGradient(lp.x, lp.y, 0, lp.x, lp.y, r * 3); gl.addColorStop(0, `rgba(255,190,110,${.8 * fog})`); gl.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gl; g.fillRect(lp.x - r * 3, lp.y - r * 3, r * 6, r * 6); g.fillStyle = `rgba(255,220,160,${fog})`; g.beginPath(); g.arc(lp.x, lp.y, Math.max(1.5, r * .25), 0, 7); g.fill(); }
      }
      // العناصر في هذه الشريحة
      for (const t of things) { if (t.hit || t.z > z || t.z <= z2) continue; const fz = fog;
        if (t.kind === 'gap') { const p1 = proj(cx - 1.9, hy, d), p2 = proj(cx + 1.9, hy, d), p3 = proj(cx + 1.9, hy, d - 1.2), p4 = proj(cx - 1.9, hy, d - 1.2); g.fillStyle = '#000'; g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.lineTo(p4.x, p4.y); g.fill(); g.strokeStyle = `rgba(255,120,60,${.6 * fz})`; g.lineWidth = 2; g.stroke(); continue; }
        const p = proj(cx + lane(t.lane), hy + (t.kind === 'gem' ? .5 + Math.sin(S.t * 4 + t.z) * .08 : 0), d), s = p.s;
        if (t.kind === 'rock') { g.fillStyle = shade(120, 104, 90, 1.2); g.beginPath(); g.moveTo(p.x - s * .5, p.y); g.lineTo(p.x - s * .35, p.y - s * .55); g.lineTo(p.x + s * .1, p.y - s * .7); g.lineTo(p.x + s * .45, p.y - s * .4); g.lineTo(p.x + s * .5, p.y); g.fill(); g.fillStyle = shade(80, 68, 58, 1.2); g.beginPath(); g.moveTo(p.x + s * .1, p.y - s * .7); g.lineTo(p.x + s * .45, p.y - s * .4); g.lineTo(p.x + s * .5, p.y); g.lineTo(p.x + s * .05, p.y); g.fill(); }
        else { const r = s * .2; const gl = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3); gl.addColorStop(0, t.c + 'aa'); gl.addColorStop(1, t.c + '00'); g.fillStyle = gl; g.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6); g.fillStyle = t.c; g.beginPath(); g.moveTo(p.x, p.y - r * 1.5); g.lineTo(p.x + r, p.y); g.lineTo(p.x, p.y + r * 1.5); g.lineTo(p.x - r, p.y); g.fill(); }
      }
    }
    // العربة من الخلف ويدا البطل على حافتها
    const jy = S.jump * H * .12, cx = W / 2, cy = H * .86 - jy, cw = Math.min(W * .34, 300), ch = cw * .42;
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(cx, H * .93, cw * .5, ch * .18, 0, 0, 7); g.fill();
    const body = g.createLinearGradient(0, cy - ch, 0, cy); body.addColorStop(0, '#8C8F96'); body.addColorStop(1, '#4A4E58'); g.fillStyle = body;
    g.beginPath(); g.moveTo(cx - cw / 2, cy - ch); g.lineTo(cx + cw / 2, cy - ch); g.lineTo(cx + cw * .44, cy); g.lineTo(cx - cw * .44, cy); g.fill();
    g.fillStyle = '#5C4033'; g.fillRect(cx - cw / 2 - 4, cy - ch - 8, cw + 8, 10); g.fillStyle = '#2B2B2F'; [-.36, .36].forEach(o => { g.beginPath(); g.arc(cx + cw * o, cy + 4, ch * .22, 0, 7); g.fill(); });
    g.fillStyle = '#C68A5B'; [-.3, .3].forEach(o => { g.beginPath(); g.ellipse(cx + cw * o, cy - ch - 6, 12, 8, 0, 0, 7); g.fill(); });
    g.restore();
    if (S.flash) { g.fillStyle = `rgba(255,220,120,${S.flash * .35})`; g.fillRect(0, 0, W, H); }
    box.querySelector('.vadv-gem i').textContent = ar(S.gems);
    box.querySelector('.vadv-bar i').style.width = Math.min(100, S.z / LEN * 100) + '%';
  }
  function finish() {
    const pct = S.gems / Math.max(1, totalGems), stars = pct >= .6 ? 3 : pct >= .35 ? 2 : 1;
    try { cheer('fanfare'); } catch (e) {}
    const end = document.createElement('div'); end.className = 'vm vm-end';
    end.innerHTML = `<div class="vm-card"><div class="vm-burst">🏆</div><div class="vm-stars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}" style="animation-delay:${k * .18}s">★</span>`).join('')}</div>
      <h3>وصلتَ إلى قاعة الكنز!</h3><p>جمعتَ ${ar(S.gems)} بلّورة من ${ar(totalGems)}</p><p class="vm-mut">تستطيع ركوب العربة مرة أخرى من بوابة المنجم متى شئت.</p><button class="vm-go">متابعة</button></div>`;
    document.body.append(end);
    end.querySelector('.vm-go').onclick = () => { end.remove(); close(); onDone({ stars, gems: S.gems }); };
  }
  function close() { cancelAnimationFrame(raf); removeEventListener('keydown', onKey); removeEventListener('resize', size); box.remove(); }
  box.querySelector('.vadv-x').onclick = () => { close(); onDone(null); };
  setTimeout(() => box.querySelector('.vadv-tip').classList.add('off'), 4000);
  raf = requestAnimationFrame(frame);
  S.things = things; window.__vadv = S;   // للاختبار الآلي
}
