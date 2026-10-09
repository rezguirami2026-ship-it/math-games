// قاعة الأبطال: أوسمة المغامرات التسع (المكتمل ذهبي لامع، والباقي ظلال)، والتقدّم بالنجوم.
// والاحتفال الكبير حين تكتمل التسع: قرع طبول، أوسمة تطير وتصطف حول البطل، أشعة ذهبية وألعاب نارية ونفير وهتاف،
// تهاني الأصدقاء، إحصاءات تتصاعد، ووسام «البطل الأكبر» الذهبي يُرتدى، وشهادة باسم البطل تُحفظ صورة.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx, cheer } from '../core/sound.js';
import { ar } from '../core/util.js';
import { LESSONS, UNITS } from '../content/lessons.js';
import { drawHuman } from '../character/human.js';
import { heroLookWorn } from '../ui/wardrobe.js';
import { ADVENTURES, advUnlocked, playAdventure } from './index.js';

const rec = id => ((game.state.adventures || {})[id]) || {};
export const allDone = s => !!s && ADVENTURES.every(a => ((s.adventures || {})[a.id] || {}).done);
const totals = () => { const s = game.state; return { done: ADVENTURES.filter(a => rec(a.id).done).length, stars: ADVENTURES.reduce((n, a) => n + (rec(a.id).best || 0), 0) }; };
const starRow = n => '★★★★★'.split('').map((c, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('');

/* ── القاعة ── */
export function openHall() {
  const s = game.state; if (!s) return; document.querySelector('.hall')?.remove();
  const t = totals(), all = allDone(s), h = document.createElement('div'); h.className = 'hall';
  const card = (a, i) => {
    const R = rec(a.id), open = advUnlocked(a) && !a.soon, k = R.done ? 'done' : open ? 'open' : 'locked';
    return `<button class="hm ${k}" data-a="${a.id}" style="--d:${i * 60}ms"><span class="hmCoin"><span>${k === 'locked' ? '🔒' : a.icon}</span></span>
      <b>${a.title}</b>${R.done ? `<span class="hmStars">${starRow(R.best || 0)}</span><small>${a.prize || ''}</small>` : `<small>${k === 'open' ? (R.st ? '▶ تابع المغامرة' : '▶ ابدأ المغامرة') : `تُفتح بعد وحدة «${UNITS[a.unit].title}»`}</small>`}</button>`;
  };
  h.innerHTML = `<div class="hallIn"><button class="hallX" aria-label="إغلاق">✕</button>
    <h2>🏛️ قاعة الأبطال</h2><p class="hallSub">أوسمة <b>${s.hero.name}</b> في مغامرات قرية الخير</p>
    <div class="hallProg"><div class="hallRing" style="--p:${t.done / ADVENTURES.length}"><b>${ar(t.done)}</b><small>من ${ar(ADVENTURES.length)}</small></div>
      <div><b>${all ? '👑 أكملتَ المغامرات كلها!' : `أكملتَ ${ar(t.done)} من ${ar(ADVENTURES.length)} مغامرات`}</b><span>⭐ ${ar(t.stars)} من ${ar(ADVENTURES.length * 5)} نجمة مخفية</span></div></div>
    <div class="hallGrid">${ADVENTURES.map(card).join('')}</div>
    ${all ? '<button class="act big go hallGrand">👑 احتفال البطل الأكبر</button>' : '<p class="hallHint">👑 أكمل المغامرات التسع لتنال لقب «بطل قرية الخير الأكبر» ووسامه الذهبي</p>'}</div>`;
  document.body.appendChild(h); sfx('region'); game.busy = true;
  const close = () => { h.classList.add('out'); setTimeout(() => h.remove(), 250); game.busy = false; };
  h.querySelector('.hallX').onclick = close;
  h.querySelectorAll('.hm.open, .hm.done').forEach(b => b.onclick = () => { close(); playAdventure(b.dataset.a); });
  const g = h.querySelector('.hallGrand'); if (g) g.onclick = () => { close(); grandCelebration(); };
}

/* يُستدعى بعد كل مغامرة: إن اكتملت التسع لأول مرة يبدأ الاحتفال الكبير */
export function checkGrand() {
  const s = game.state; if (!allDone(s) || s.grandSeen) return;
  s.grandSeen = Date.now(); s.gear = s.gear || { owned: {}, worn: {} }; s.gear.owned.medal = s.gear.owned.medal || Date.now(); bus.emit('save');
  setTimeout(() => grandCelebration(), 600);
}

/* ── الاحتفال الكبير ── */
const CHEERS = n => [
  ['الشيخ الحارث', `فخورون بك يا ${n}! قرية الخير كلها تحتفل بك.`], ['القبطان سيف', 'أشجع بحّار عرفته البحار!'], ['الجدة شيخة', 'أضأتَ قلوبنا كما أضأتَ الفوانيس.'],
  ['الجد سعيد', 'من المدرّجات إلى القمة… أنت بطل بقلب طيب.'], ['جابر دليل القافلة', 'النجوم تعرف اسمك الآن!'], ['الجد ماجد', 'سيروي الأطفال حكايتك جيلاً بعد جيل.'],
  ['النجار مبارك', 'بنيتَ جسوراً… وبنيتَ صداقات.'], ['ظافر', 'علّمتني أن النور يُشارَك. شكراً لك.'], ['زياد', `عندما أكبر أريد أن أصبح مثل ${n}!`]
];
export function grandCelebration() {
  const s = game.state; if (!s || document.querySelector('.grand')) return;
  const name = s.hero.name, girl = s.hero.kind === 'girl', wasBusy = game.busy; game.busy = true;
  const g = document.createElement('div'); g.className = 'grand';
  g.innerHTML = `<canvas class="gFx"></canvas><div class="gIntro"><p></p></div>
    <div class="gMain"><div class="gTop"><div class="gRib">👑 ${girl ? 'بطلة قرية الخير الكبرى' : 'بطل قرية الخير الأكبر'}</div><h1 class="gName">${name}</h1><p class="gCheer"><b></b><span></span></p></div>
      <div class="gStage"><canvas class="gHero" width="360" height="400"></canvas>${ADVENTURES.map((a, i) => `<span class="gMedal" style="--i:${i}"><span>${a.icon}</span></span>`).join('')}</div>
      <div class="gBottom"><div class="gStats"></div><p class="gPrize">🏅 حصلتَ على <b>وسام البطل الأكبر الذهبي</b>: ${girl ? 'ارتديه' : 'ارتدِه'} الآن، أو من خزانة البطل</p>
        <div class="gBtns"><button class="act go" data-wear>🏅 ${girl ? 'ارتدي' : 'ارتدِ'} الوسام</button><button class="act go" data-cert>📜 شهادتي</button><button class="act ghost" data-home>🏠 العودة إلى القرية</button></div></div></div>
    <button class="gSkip">تخطَّ ‹‹</button>`;
  document.body.appendChild(g);
  const fx = fireworks(g.querySelector('.gFx')); let live = true, skip = null, heroOn = false, t0 = performance.now();
  const wait = ms => new Promise(r => { const id = setTimeout(r, ms); skip = () => { clearTimeout(id); r(); }; });
  g.onclick = e => { if (!e.target.closest('button') && skip) skip(); };
  let fast = false; g.querySelector('.gSkip').onclick = e => { e.stopPropagation(); fast = true; if (skip) skip(); };
  // البطل يقفز فرحاً في الوسط
  const hc = g.querySelector('.gHero'), hx = hc.getContext('2d');
  const look = () => { const L = heroLookWorn(s); L.gear = Object.assign({}, L.gear, { medal: !!(s.gear && s.gear.worn.medal) || heroOn }); return L; };
  const loopHero = now => { if (!live) return; hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, 360, 400);
    hx.fillStyle = 'rgba(255,214,90,.25)'; hx.beginPath(); hx.ellipse(180, 372, 96, 18, 0, 0, 7); hx.fill();
    drawHuman(hx, Object.assign(look(), { x: 180, y: 370, s: 3.6, dir: 'down', anim: 'celebrate', animT: ((now - t0) / 900) % 1 }));
    requestAnimationFrame(loopHero); };
  requestAnimationFrame(loopHero);
  const end = () => { live = false; fx.stop(); g.classList.add('out'); setTimeout(() => g.remove(), 400); game.busy = wasBusy; bus.emit('save'); };
  g.querySelector('[data-home]').onclick = e => { e.stopPropagation(); end(); };
  g.querySelector('[data-cert]').onclick = e => { e.stopPropagation(); sfx('pick'); showCertificate(g); };
  const wear = g.querySelector('[data-wear]');
  wear.onclick = e => { e.stopPropagation(); s.gear = s.gear || { owned: {}, worn: {} }; s.gear.owned.medal = s.gear.owned.medal || Date.now(); s.gear.worn.medal = true; heroOn = true; bus.emit('save'); cheer('sparkle'); fx.burst(.5, .45, 60); wear.disabled = true; wear.textContent = '✅ الوسام على صدرك'; };
  if (s.gear && s.gear.worn.medal) { wear.disabled = true; wear.textContent = '✅ الوسام على صدرك'; }

  (async () => {
    const intro = g.querySelector('.gIntro'), ip = intro.querySelector('p');
    for (const line of ['في قرية الخير…', 'تسع مغامرات…', `وبطل ${girl ? 'واحدة' : 'واحد'}!`]) { if (fast) break; ip.textContent = line; ip.classList.remove('on'); void ip.offsetWidth; ip.classList.add('on'); cheer('roll'); await wait(1500); }
    intro.classList.add('gone'); g.classList.add('stage1');
    // الأوسمة تطير وتصطف حول البطل واحداً واحداً
    const medals = [...g.querySelectorAll('.gMedal')];
    for (let i = 0; i < medals.length; i++) { medals[i].classList.add('in'); if (!fast) { cheer('medal', i); const r = medals[i].getBoundingClientRect(); fx.burst((r.left + r.width / 2) / innerWidth, (r.top + r.height / 2) / innerHeight, 18); await wait(330); } }
    g.classList.add('stage2'); cheer('fanfare'); setTimeout(() => cheer('crowd'), 1300); fx.start();
    await wait(fast ? 0 : 2200);
    g.classList.add('stage3');
    // تهاني الأصدقاء تتوالى بلا توقف
    const cb = g.querySelector('.gCheer'), list = CHEERS(name); let k = 0;
    const next = () => { if (!live) return; const [w, txt] = list[k++ % list.length]; cb.querySelector('b').textContent = w + ':'; cb.querySelector('span').textContent = ' ' + txt; cb.classList.remove('on'); void cb.offsetWidth; cb.classList.add('on'); setTimeout(next, 2800); };
    next();
    // الإحصاءات تتصاعد
    const t = totals(), done = LESSONS.filter(l => s.quests && s.quests.done && s.quests.done[l.id]).length, badges = Object.keys(s.achievements || {}).length;
    const stats = [['⭐', t.stars, 'نجمة مخفية'], ['💎', s.gems || 0, 'جوهرة'], ['📚', done, 'درساً'], ['🏅', badges, 'إنجازاً']];
    g.querySelector('.gStats').innerHTML = stats.map(([i, , l]) => `<div><span>${i}</span><b>٠</b><small>${l}</small></div>`).join('');
    const bs = [...g.querySelectorAll('.gStats b')], T0 = performance.now();
    const count = now => { const p = Math.min(1, (now - T0) / 1600), e = 1 - Math.pow(1 - p, 3); bs.forEach((b, j) => { b.textContent = ar(Math.round(stats[j][1] * e)); }); if (p < 1 && live) requestAnimationFrame(count); else if (live) cheer('sparkle'); };
    requestAnimationFrame(count);
    g.querySelector('.gSkip').remove(); skip = null;
  })();
}

/* ألعاب نارية وقصاصات ملونة وأشعة ذهبية دوّارة على لوحة واحدة */
function fireworks(c) {
  const x = c.getContext('2d'), P = [], C = ['#FFD54A', '#FF7AB6', '#7CD6FF', '#7BE495', '#FFFFFF', '#FFB347', '#C59BFF'];
  let W = 0, H = 0, on = false, live = true, last = performance.now(), nextBoom = 0, rays = 0;
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = c.width = innerWidth * d; H = c.height = innerHeight * d; }; size(); addEventListener('resize', size);
  const burst = (fx, fy, n = 70, col) => { const cx = fx * W, cy = fy * H, k = col || C[Math.floor(Math.random() * C.length)], sc = W / 900;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (1.5 + Math.random() * 4.5) * sc * 60; P.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, col: Math.random() < .2 ? '#FFFFFF' : k, r: (1.5 + Math.random() * 2) * sc, kind: 'spark' }); } };
  const confetti = () => { const sc = W / 900; for (let i = 0; i < (Math.random() < .5 ? 1 : 2); i++) P.push({ x: Math.random() * W, y: -10, vx: (Math.random() - .5) * 40 * sc, vy: (60 + Math.random() * 80) * sc, life: 1, col: C[Math.floor(Math.random() * C.length)], r: (4 + Math.random() * 4) * sc, kind: 'conf', a: Math.random() * 6, va: (Math.random() - .5) * 8 }); };
  const frame = now => { if (!live) return; const dt = Math.min(.05, (now - last) / 1000); last = now; x.clearRect(0, 0, W, H);
    if (on) { rays += dt * .25; const cx = W / 2, cy = H * .47, R = Math.max(W, H);   // أشعة ذهبية خلف البطل
      x.save(); x.translate(cx, cy); x.rotate(rays); for (let i = 0; i < 16; i++) { x.rotate(Math.PI / 8); const gr = x.createLinearGradient(0, 0, R * .6, 0); gr.addColorStop(0, 'rgba(255,214,90,.32)'); gr.addColorStop(1, 'rgba(255,214,90,0)'); x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0); x.lineTo(R * .6, -R * .05); x.lineTo(R * .6, R * .05); x.fill(); } x.restore();
      if (now > nextBoom) { nextBoom = now + 650 + Math.random() * 700; burst(.12 + Math.random() * .76, .1 + Math.random() * .3, 80); cheer('boom'); }
      confetti(); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i];
      if (p.kind === 'spark') { p.vy += 140 * dt * (W / 900); p.vx *= .985; p.vy *= .985; p.life -= dt * .7; }
      else { p.a += p.va * dt; p.vx += Math.sin(now / 400 + i) * 2 * dt; p.life -= dt * .12; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0 || p.y > H + 20) { P.splice(i, 1); continue; }
      x.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5)); x.fillStyle = p.col;
      if (p.kind === 'spark') { x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
      else { x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillRect(-p.r, -p.r * .45, p.r * 2, p.r * .9); x.restore(); } }
    x.globalAlpha = 1; requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  return { burst, start: () => { on = true; }, stop: () => { live = false; removeEventListener('resize', size); } };
}

/* ── الشهادة: لوحة رسمية باسم البطل، تُعرض وتُحفظ صورة ── */
function certificate() {
  const s = game.state, girl = s.hero.kind === 'girl', W = 1400, H = 990, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const bg = x.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * .7); bg.addColorStop(0, '#FFFBEF'); bg.addColorStop(1, '#F3E2B8'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  // إطار مزدوج ونقش عُماني على الحواف
  x.strokeStyle = '#1F4E79'; x.lineWidth = 18; x.strokeRect(30, 30, W - 60, H - 60); x.strokeStyle = '#C9971C'; x.lineWidth = 5; x.strokeRect(56, 56, W - 112, H - 112);
  x.fillStyle = '#C9971C'; for (let i = 90; i < W - 90; i += 34) { [[i, 74], [i, H - 74]].forEach(([px, py]) => { x.beginPath(); x.moveTo(px, py - 7); x.lineTo(px + 7, py); x.lineTo(px, py + 7); x.lineTo(px - 7, py); x.fill(); }); }
  for (let j = 110; j < H - 110; j += 34) { [[74, j], [W - 74, j]].forEach(([px, py]) => { x.beginPath(); x.moveTo(px, py - 7); x.lineTo(px + 7, py); x.lineTo(px, py + 7); x.lineTo(px - 7, py); x.fill(); }); }
  // علم عُمان صغير في الزاوية وختم ذهبي
  const flag = (fx, fy) => { x.fillStyle = '#DB161B'; x.fillRect(fx, fy, 30, 72); x.fillStyle = '#FFFFFF'; x.fillRect(fx + 30, fy, 78, 24); x.fillStyle = '#DB161B'; x.fillRect(fx + 30, fy + 24, 78, 24); x.fillStyle = '#008000'; x.fillRect(fx + 30, fy + 48, 78, 24); x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 1; x.strokeRect(fx, fy, 108, 72); };
  flag(W - 220, 110);
  x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = '#1F4E79';
  x.font = '900 34px Cairo, sans-serif'; x.fillText('قرية الخير · رامي ماث', W / 2, 150);
  const tg = x.createLinearGradient(0, 180, 0, 270); tg.addColorStop(0, '#E8B53A'); tg.addColorStop(1, '#9A6A10'); x.fillStyle = tg;
  x.font = '900 84px Cairo, sans-serif'; x.fillText('شهادة بطولة', W / 2, 265);
  x.fillStyle = '#3A3160'; x.font = '700 34px Cairo, sans-serif'; x.fillText(girl ? 'تشهد قرية الخير بأن البطلة' : 'تشهد قرية الخير بأن البطل', W / 2, 345);
  x.fillStyle = '#1F4E79'; x.font = '900 104px Cairo, sans-serif'; x.fillText(s.hero.name, W / 2, 470);
  x.strokeStyle = '#C9971C'; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 300, 500); x.lineTo(W / 2 + 300, 500); x.stroke();
  x.fillStyle = '#3A3160'; x.font = '700 34px Cairo, sans-serif';
  x.fillText(girl ? 'أكملت مغامرات قرية الخير التسع بشجاعة وصبر وقلب طيب،' : 'أكمل مغامرات قرية الخير التسع بشجاعة وصبر وقلب طيب،', W / 2, 570);
  x.fillText(girl ? 'فاستحقت لقب «بطلة قرية الخير الكبرى» 👑' : 'فاستحق لقب «بطل قرية الخير الأكبر» 👑', W / 2, 625);
  // أيقونات المغامرات التسع
  x.font = '54px sans-serif'; ADVENTURES.forEach((a, i) => { const px = W / 2 + (i - 4) * 104; x.fillStyle = 'rgba(227,176,75,.18)'; x.beginPath(); x.arc(px, 712, 44, 0, 7); x.fill(); x.strokeStyle = '#C9971C'; x.lineWidth = 3; x.stroke(); x.fillStyle = '#000'; x.fillText(a.icon, px, 732); });
  const t = totals(), d = new Date();
  x.fillStyle = '#3A3160'; x.font = '700 28px Cairo, sans-serif'; x.fillText(`⭐ ${ar(t.stars)} نجمة مخفية من ${ar(ADVENTURES.length * 5)}`, W / 2, 815);
  x.textAlign = 'right'; x.font = '700 26px Cairo, sans-serif'; x.fillText(`التاريخ: ${ar(d.getDate())} / ${ar(d.getMonth() + 1)} / ${ar(d.getFullYear())}`, W - 150, 890);
  x.textAlign = 'left'; x.fillText('إعداد: أ. رامي الرزقي', 150, 890);
  // الختم
  const sx = W / 2, sy = 880; x.fillStyle = '#C9971C'; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; x.beginPath(); x.arc(sx + Math.cos(a) * 56, sy + Math.sin(a) * 56, 9, 0, 7); x.fill(); }
  x.beginPath(); x.arc(sx, sy, 56, 0, 7); x.fill(); x.fillStyle = '#E8B53A'; x.beginPath(); x.arc(sx, sy, 44, 0, 7); x.fill(); x.textAlign = 'center'; x.font = '48px sans-serif'; x.fillStyle = '#000'; x.fillText('👑', sx, sy + 17);
  return c;
}
function showCertificate(host) {
  const c = certificate(), url = c.toDataURL('image/png'), m = document.createElement('div'); m.className = 'gCert';
  m.innerHTML = `<div class="gCertIn"><img alt="شهادة البطولة" src="${url}"><div class="gBtns"><button class="act go" data-save>💾 احفظ الشهادة صورة</button><button class="act ghost" data-back>رجوع</button></div>
    <p class="gCertTip">إن لم تُحفظ الصورة على جهازك: التقط لقطة شاشة لها 📸</p></div>`;
  (host || document.body).appendChild(m);
  m.onclick = e => e.stopPropagation();
  m.querySelector('[data-back]').onclick = () => m.remove();
  m.querySelector('[data-save]').onclick = () => { try { const a = document.createElement('a'); a.href = url; a.download = `شهادة-${game.state.hero.name}.png`; document.body.appendChild(a); a.click(); a.remove(); cheer('sparkle'); } catch (e) {} };
}
export { showCertificate };
