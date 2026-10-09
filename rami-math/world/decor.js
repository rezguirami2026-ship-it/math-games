// زينة القرية: يشتريها الطالب بالجواهر 💎 التي يجمعها في التحديات والأنشطة، فتظهر في ساحة البئر وتكبر قريته معه.
// رسم ثنائي الأبعاد قائم (يُرسم في العرضين: في 3D بدقة الشاشة فوق المشهد). زينة فقط: لا تصادم.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar, shade } from '../core/util.js';

export const DECOR = [
  { id: 'flowers', icon: '🌷', name: 'أصيص زهور', price: 5, x: 1022, y: 498 },
  { id: 'lantern', icon: '🏮', name: 'فانوس عُماني', price: 8, x: 1198, y: 498 },
  { id: 'bench', icon: '🪑', name: 'مقعد خشبي', price: 10, x: 1040, y: 538 },
  { id: 'flag', icon: '🚩', name: 'سارية علم عُمان', price: 12, x: 1110, y: 408 },
  { id: 'palm', icon: '🌴', name: 'نخلة صغيرة', price: 15, x: 1222, y: 450 },
  { id: 'swing', icon: '🎠', name: 'أرجوحة الأطفال', price: 20, x: 990, y: 452 },
  { id: 'fountain', icon: '⛲', name: 'نافورة صغيرة', price: 30, x: 1180, y: 540 },
  { id: 'camel', icon: '🐪', name: 'تمثال جمل', price: 40, x: 1110, y: 556 },
  { id: 'statue', icon: '🗿', name: 'تمثال حامي القرية', price: 0, reward: true, x: 1058, y: 424 },
  { id: 'bell', icon: '🔔', name: 'جرس الوادي', price: 0, reward: true, x: 1166, y: 418 },
  { id: 'anchor', icon: '⚓', name: 'المرساة الذهبية', price: 0, reward: true, x: 1250, y: 470 },
  { id: 'sundisk', icon: '☀️', name: 'قرص الشمس الذهبي', price: 0, reward: true, x: 970, y: 520 },
  { id: 'festlamp', icon: '🏮', name: 'فانوس المهرجان الكبير', price: 0, reward: true, x: 990, y: 600 },
  { id: 'astrolabe', icon: '🧭', name: 'إسطرلاب الفلكي حمدان', price: 0, reward: true, x: 1240, y: 520 }   // جائزة مغامرة «إنقاذ القرية» (لا تُباع)
];
export const gems = () => (game.state && game.state.gems) || 0;
export function addGems(n) { const s = game.state; s.gems = (s.gems || 0) + n; bus.emit('gems'); }
export const owned = id => !!(game.state.decor && game.state.decor[id]);
export function buy(id) {
  const s = game.state, d = DECOR.find(x => x.id === id); if (!d || owned(id) || gems() < d.price) return false;
  s.gems -= d.price; s.decor = s.decor || {}; s.decor[id] = Date.now(); sfx('win'); bus.emit('gems'); bus.emit('save'); return true;
}
/* الحفظ القديم: الجواهر تُحسب مما جُمع في التحديات المنتهية */
export function initGems(s) {
  if (s.gems != null) return;
  s.gems = Object.values((s.quests && s.quests.data) || {}).reduce((a, d) => a + ((d && d.ch && d.ch.gems) || 0), 0);
}

const sh = (c, x, y, rx) => { c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 6, y, rx, rx * .3, 0, 0, 7); c.fill(); };
const DRAW = {
  flowers(c, x, y) { sh(c, x, y, 12); c.fillStyle = '#B8613E'; c.beginPath(); c.moveTo(x - 11, y - 18); c.lineTo(x + 11, y - 18); c.lineTo(x + 8, y); c.lineTo(x - 8, y); c.fill(); c.fillStyle = '#D9824E'; c.fillRect(x - 12, y - 20, 24, 4);
    [[-6, -26, '#E2475C'], [0, -30, '#FFC23D'], [6, -26, '#F08AB0'], [-2, -24, '#fff']].forEach(([dx, dy, col]) => { c.fillStyle = '#3E8A3A'; c.fillRect(x + dx - .7, y + dy, 1.4, 8); c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, 4, 0, 7); c.fill(); }); },
  lantern(c, x, y, t) { sh(c, x, y, 8); c.fillStyle = '#3D3A3A'; c.fillRect(x - 2, y - 50, 4, 50); c.fillStyle = '#C9971C'; c.fillRect(x - 9, y - 66, 18, 4); c.fillRect(x - 6, y - 48, 12, 3);
    c.fillStyle = `rgba(255,214,110,${.75 + Math.sin(t * 3) * .15})`; c.fillRect(x - 7, y - 62, 14, 14); c.strokeStyle = '#8A6A10'; c.lineWidth = 1.2; c.strokeRect(x - 7, y - 62, 14, 14); c.fillStyle = 'rgba(255,220,120,.25)'; c.beginPath(); c.arc(x, y - 55, 16, 0, 7); c.fill(); },
  bench(c, x, y) { sh(c, x, y, 20); c.fillStyle = '#6B4520'; [-16, 14].forEach(dx => c.fillRect(x + dx, y - 12, 3, 12)); c.fillStyle = '#9C6438'; c.fillRect(x - 20, y - 14, 40, 5); c.fillRect(x - 20, y - 26, 40, 4); c.fillStyle = '#7A4A22'; c.fillRect(x - 20, y - 9, 40, 2); },
  flag(c, x, y, t) { sh(c, x, y, 8); c.fillStyle = '#9AA0A6'; c.fillRect(x - 2, y - 80, 4, 80); c.fillStyle = '#E3B04B'; c.beginPath(); c.arc(x, y - 82, 3, 0, 7); c.fill();
    const w = k => Math.sin(t * 4 + k) * 2.5; c.fillStyle = '#C8102E'; c.beginPath(); c.moveTo(x + 2, y - 78); c.quadraticCurveTo(x + 18, y - 78 + w(0), x + 34, y - 78 + w(1)); c.lineTo(x + 34, y - 58 + w(1)); c.quadraticCurveTo(x + 18, y - 58 + w(0), x + 2, y - 58); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 12, y - 78 + w(.3) * .5); c.quadraticCurveTo(x + 18, y - 78 + w(0), x + 34, y - 78 + w(1)); c.lineTo(x + 34, y - 71 + w(1)); c.lineTo(x + 12, y - 71 + w(.3) * .5); c.fill();   // علم عُمان: أبيض فوق، أحمر في الوسط، أخضر تحت، وشريط أحمر عند السارية
    c.fillStyle = '#009639'; c.beginPath(); c.moveTo(x + 12, y - 65 + w(.3) * .5); c.lineTo(x + 34, y - 65 + w(1)); c.lineTo(x + 34, y - 58 + w(1)); c.lineTo(x + 12, y - 58 + w(.3) * .5); c.fill(); },
  palm(c, x, y, t) { sh(c, x, y, 14); c.strokeStyle = '#7A5230'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 4, y - 30, x + 2, y - 56); c.stroke();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .45 + Math.sin(t * 1.5 + i) * .05; c.strokeStyle = i % 2 ? '#2F8A3A' : '#46A845'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 2, y - 56); c.quadraticCurveTo(x + 2 + Math.cos(a) * 14, y - 64 + Math.sin(a) * 10, x + 2 + Math.cos(a) * 24, y - 52 + Math.sin(a) * 14 + 12); c.stroke(); }
    c.fillStyle = '#D98A10'; [[-3, -53], [4, -52], [0, -50]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + 2 + dx, y + dy, 2.6, 0, 7); c.fill(); }); },
  swing(c, x, y, t) { sh(c, x, y, 24); c.strokeStyle = '#6B4520'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 22, y); c.lineTo(x - 16, y - 50); c.lineTo(x + 16, y - 50); c.lineTo(x + 22, y); c.stroke();
    const a = Math.sin(t * 2) * .35, sx = x + Math.sin(a) * 34, sy = y - 50 + Math.cos(a) * 34; c.strokeStyle = '#555'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 6, y - 50); c.lineTo(sx - 6, sy); c.moveTo(x + 6, y - 50); c.lineTo(sx + 6, sy); c.stroke(); c.fillStyle = '#E2475C'; c.fillRect(sx - 9, sy - 2, 18, 5); },
  fountain(c, x, y, t) { sh(c, x, y, 26); c.fillStyle = shade('#C9C0AE', -20); c.beginPath(); c.ellipse(x, y - 6, 26, 9, 0, 0, 7); c.fill(); c.fillStyle = '#C9C0AE'; c.beginPath(); c.ellipse(x, y - 10, 26, 9, 0, 0, 7); c.fill();
    c.fillStyle = '#5FB8E8'; c.beginPath(); c.ellipse(x, y - 11, 21, 6.5, 0, 0, 7); c.fill(); c.fillStyle = '#B8AE98'; c.fillRect(x - 3, y - 34, 6, 24); c.fillStyle = '#C9C0AE'; c.beginPath(); c.ellipse(x, y - 34, 10, 3.5, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(150,215,255,.9)'; c.lineWidth = 1.6; for (let i = 0; i < 4; i++) { const ph = (t * 1.4 + i / 4) % 1, dx = (i % 2 ? 1 : -1) * (6 + ph * 10); c.beginPath(); c.moveTo(x, y - 36); c.quadraticCurveTo(x + dx * .6, y - 50, x + dx, y - 14); c.stroke(); } },
  statue(c, x, y) { sh(c, x, y, 22); c.fillStyle = '#A89E8C'; c.fillRect(x - 18, y - 16, 36, 16); c.fillStyle = '#C2B8A4'; c.fillRect(x - 20, y - 20, 40, 6);
    c.fillStyle = '#B5AB97'; c.beginPath(); c.moveTo(x - 10, y - 20); c.lineTo(x - 13, y - 52); c.lineTo(x + 13, y - 52); c.lineTo(x + 10, y - 20); c.fill();   // الثوب
    c.fillStyle = '#9C2A3C'; c.beginPath(); c.moveTo(x - 12, y - 50); c.quadraticCurveTo(x - 20, y - 36, x - 15, y - 22); c.lineTo(x - 9, y - 26); c.closePath(); c.fill();   // الوشاح
    c.fillStyle = '#C9BFA9'; c.beginPath(); c.arc(x, y - 60, 8, 0, 7); c.fill(); c.strokeStyle = '#B5AB97'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 11, y - 48); c.lineTo(x + 20, y - 66); c.stroke();
    c.fillStyle = '#FFD54A'; c.beginPath(); c.arc(x + 21, y - 70, 4, 0, 7); c.fill(); c.fillStyle = '#5A4632'; c.font = '900 8px Cairo'; c.textAlign = 'center'; c.fillText('حامي القرية', x, y - 6); },
  bell(c, x, y) { sh(c, x, y, 20); c.fillStyle = '#6B4520'; c.fillRect(x - 20, y - 64, 5, 64); c.fillRect(x + 15, y - 64, 5, 64); c.fillRect(x - 22, y - 68, 44, 6);
    c.fillStyle = '#C9971C'; c.beginPath(); c.moveTo(x - 6, y - 60); c.lineTo(x + 6, y - 60); c.quadraticCurveTo(x + 8, y - 40, x + 13, y - 34); c.lineTo(x - 13, y - 34); c.quadraticCurveTo(x - 8, y - 40, x - 6, y - 60); c.fill(); c.fillStyle = '#8A6A10'; c.beginPath(); c.arc(x, y - 33, 3, 0, 7); c.fill(); },
  anchor(c, x, y) { sh(c, x, y, 16); c.fillStyle = '#B8AE98'; c.fillRect(x - 14, y - 8, 28, 8); c.strokeStyle = '#D9A13A'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - 50); c.lineTo(x, y - 14); c.moveTo(x - 10, y - 42); c.lineTo(x + 10, y - 42); c.moveTo(x - 14, y - 22); c.quadraticCurveTo(x, y - 6, x + 14, y - 22); c.stroke(); c.beginPath(); c.arc(x, y - 54, 4, 0, 7); c.stroke(); },
  sundisk(c, x, y, t) { sh(c, x, y, 18); c.fillStyle = '#B8AE98'; c.fillRect(x - 8, y - 34, 16, 34); c.fillStyle = '#C9BFA9'; c.fillRect(x - 14, y - 6, 28, 6);
    c.fillStyle = `rgba(255,214,90,${.25 + Math.sin(t * 2) * .1})`; c.beginPath(); c.arc(x, y - 48, 22, 0, 7); c.fill(); c.fillStyle = '#FFC23D'; c.beginPath(); c.arc(x, y - 48, 14, 0, 7); c.fill(); c.strokeStyle = '#C98A0E'; c.lineWidth = 2; c.stroke(); },
  astrolabe(c, x, y) { sh(c, x, y, 14); c.fillStyle = '#6B4520'; c.fillRect(x - 3, y - 30, 6, 30); c.strokeStyle = '#D9A13A'; c.lineWidth = 3; c.beginPath(); c.arc(x, y - 44, 14, 0, 7); c.stroke();
    c.lineWidth = 1.5; c.beginPath(); c.arc(x, y - 44, 8, 0, 7); c.moveTo(x - 14, y - 44); c.lineTo(x + 14, y - 44); c.moveTo(x, y - 58); c.lineTo(x, y - 30); c.stroke(); c.fillStyle = '#FFD54A'; c.beginPath(); c.arc(x + 5, y - 49, 2.5, 0, 7); c.fill(); },
  festlamp(c, x, y, t) { sh(c, x, y, 12); c.fillStyle = '#3D3A3A'; c.fillRect(x - 2, y - 64, 4, 64); c.fillStyle = `rgba(255,170,60,${.25 + Math.sin(t * 3) * .08})`; c.beginPath(); c.arc(x, y - 70, 20, 0, 7); c.fill();
    c.fillStyle = '#E2475C'; c.beginPath(); c.ellipse(x, y - 70, 10, 13, 0, 0, 7); c.fill(); c.fillStyle = '#FFD54A'; c.fillRect(x - 6, y - 84, 12, 4); c.fillRect(x - 6, y - 60, 12, 3); },
  camel(c, x, y) { sh(c, x, y, 26); c.fillStyle = '#B48550'; c.fillRect(x - 24, y - 8, 48, 8); c.fillStyle = '#C9955A';
    [-14, -6, 8, 16].forEach(dx => c.fillRect(x + dx, y - 26, 4, 18)); c.beginPath(); c.ellipse(x, y - 30, 20, 9, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(x - 2, y - 38, 9, 7, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(x + 16, y - 32); c.quadraticCurveTo(x + 26, y - 40, x + 24, y - 52); c.lineTo(x + 30, y - 52); c.quadraticCurveTo(x + 32, y - 40, x + 20, y - 28); c.fill(); c.beginPath(); c.ellipse(x + 30, y - 52, 6, 3.5, 0, 0, 7); c.fill(); c.fillStyle = '#2A1B66'; c.beginPath(); c.arc(x + 31, y - 53, 1, 0, 7); c.fill(); }
};
export function decorItems(view) {
  const s = game.state; if (!s || !s.decor) return [];
  return DECOR.filter(d => s.decor[d.id] && (!view || (d.x > view.x - 80 && d.x < view.x + view.w + 80 && d.y > view.y - 60 && d.y < view.y + view.h + 140)))
    .map(d => ({ y: d.y, x: d.x, draw: c => DRAW[d.id](c, d.x, d.y, performance.now() / 1000) }));
}
/* متجر الزينة (لوحة) */
export function openDecorShop(onClose) {
  const el = document.getElementById('panel');
  const draw = (msg) => {
    el.innerHTML = `<div class="sheet decorShop"><h3>🛍️ متجر زينة القرية</h3>
      <p class="dsGems">💎 جواهرك: <b>${ar(gems())}</b></p><p class="muted">اجمع الجواهر بالإجابة في التحديات والأنشطة، ثم زيّن ساحة البئر في قريتك.</p>${msg ? `<p class="dsMsg">${msg}</p>` : ''}
      <div class="dsGrid">${DECOR.filter(d => !d.reward).map(d => { const own = owned(d.id), can = gems() >= d.price;
        return `<div class="dsItem ${own ? 'own' : ''}"><span>${d.icon}</span><b>${d.name}</b>${own ? '<em>✓ في قريتك</em>' : `<button class="act ${can ? 'go' : 'ghost'}" data-buy="${d.id}" ${can ? '' : 'disabled'}>💎 ${ar(d.price)}</button>`}</div>`; }).join('')}</div>
      <button class="act" data-close>رجوع إلى العالم</button></div>`;
    el.classList.add('on');
    el.querySelectorAll('[data-buy]').forEach(b => b.onclick = e => { e.stopPropagation(); const d = DECOR.find(x => x.id === b.dataset.buy); if (buy(d.id)) draw(`🎉 أُضيف «${d.name}» إلى ساحة البئر!<br><button class="act go dsSee" data-see="${d.id}">👀 شاهدها في قريتك</button>`); });
    el.querySelectorAll('[data-see]').forEach(b => b.onclick = e => { e.stopPropagation(); el.classList.remove('on'); el.innerHTML = ''; if (onClose) onClose(); bus.emit('decorShow', b.dataset.see); });
  };
  draw();
}
