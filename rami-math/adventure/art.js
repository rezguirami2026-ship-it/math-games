// رسوم عالم المغامرات: بلاطات من الأعلى بلمسة 2.5D (جدران بواجهة، أشجار قائمة)، وعناصر تفاعلية.
// كل بلاطة ثابتة تُرسم مرة لكل مقياس ثم تُنسخ (ذاكرة صغيرة)، والمتحرك (الماء، النار، الأضواء) يُرسم حياً.
export const T = 48;   // طول البلاطة بوحدات العالم

/* ألوان كل عالم */
export const THEMES = {
  village: { g: ['#E6CF9C', '#E3C994', '#EAD7A9'], g2: '#D9BE86', path: '#CFA972', wall: ['#E9DCC2', '#C9B48E', '#A88E66'], floor: '#C8A27A', water: ['#3FA7C9', '#2A86AE'], tree: 'palm', grass: '#8DB85A', night: .58 },
  camp: { g: ['#D8C08C', '#CFB57F', '#DCC593'], g2: '#C4A66E', path: '#BE9C66', wall: ['#B48B5E', '#8C6640', '#6A4A2C'], floor: '#9C7A54', water: ['#3FA7C9', '#2A86AE'], tree: 'palm', grass: '#7FA84E', night: .48 },
  island: { g: ['#F2E2B0', '#EDD9A0', '#F5E8BE'], g2: '#7DBA5C', path: '#E2CC92', wall: ['#9AA0A6', '#7A8086', '#5C6268'], floor: '#8C7A62', water: ['#36B6D6', '#1E8FB8'], tree: 'palm', grass: '#6FB04E', night: 0 },
  jungle: { g: ['#6FA84E', '#679F47', '#76B055'], g2: '#5A9140', path: '#B79A68', wall: ['#7C8B6C', '#5E6C50', '#455238'], floor: '#8A7458', water: ['#2E9CB8', '#1F7F9C'], tree: 'round', grass: '#4F8A3A', night: .15 },
  cave: { g: ['#6B6158', '#655B52', '#71665D'], g2: '#5C534B', path: '#7A6E62', wall: ['#4A423C', '#3A332E', '#2A2420'], floor: '#5E554C', water: ['#2E6E8E', '#1F5470'], tree: 'rock', grass: '#4E5E44', night: .82 },
  desert: { g: ['#F0CF8E', '#EAC67F', '#F3D79C'], g2: '#E2B86E', path: '#D9AE66', wall: ['#D9A86A', '#B8854A', '#8F6234'], floor: '#C79A62', water: ['#4BB3C8', '#2E93AE'], tree: 'cactus', grass: '#9AAE5A', night: 0 },
  ruins: { g: ['#D8CDB4', '#D0C4AA', '#DDD3BC'], g2: '#BFB397', path: '#C9BB9C', wall: ['#BFB49C', '#9C907A', '#78705C'], floor: '#B5A98E', water: ['#4FA0B8', '#33809A'], tree: 'round', grass: '#8FAE62', night: .1 },
  storm: { g: ['#C9B98E', '#C2B286', '#CFC096'], g2: '#B8A87A', path: '#A8936A', wall: ['#C9BCA0', '#A39578', '#7E7158'], floor: '#A88E6A', water: ['#5E8EA6', '#47768E'], tree: 'round', grass: '#6E8A4E', night: .3 },
  castle: { g: ['#7E7A86', '#78747F', '#85818D'], g2: '#6C6875', path: '#8E8A96', wall: ['#5A5664', '#46424F', '#332F3B'], floor: '#6A5E66', water: ['#3D4E7A', '#2C3A60'], tree: 'dead', grass: '#4E5A44', night: .55 }
};

const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const cache = new Map();
/* بلاطة مخزنة: مفتاح النوع + المظهر + المقياس */
function cached(key, sc, paint) {
  const k = key + '@' + sc; let c = cache.get(k);
  if (!c) { c = document.createElement('canvas'); c.width = c.height = Math.ceil(T * sc); const x = c.getContext('2d'); x.scale(sc, sc); paint(x); cache.set(k, c); if (cache.size > 600) cache.delete(cache.keys().next().value); }
  return c;
}
export const clearArtCache = () => cache.clear();

function speckle(x, col, n, seed) { x.fillStyle = col; for (let i = 0; i < n; i++) { const a = hash(seed, i), b = hash(i, seed + 3); x.beginPath(); x.ellipse(4 + a * (T - 8), 4 + b * (T - 8), 1.6 + hash(a, b) * 1.6, 1.1 + hash(b, a), 0, 0, 7); x.fill(); } }

/* أرضية: أساس + حبيبات، والمسار والعشب والأرضية الداخلية */
function ground(x, th, v) {
  x.fillStyle = th.g[0]; x.fillRect(0, 0, T, T); speckle(x, 'rgba(0,0,0,.05)', 5, v + 1); speckle(x, 'rgba(255,255,255,.08)', 3, v + 9);
}
const PAINT = {
  '.': (x, th, v) => ground(x, th, v),
  ',': (x, th, v) => { ground(x, th, v); x.fillStyle = th.grass; for (let i = 0; i < 5; i++) { const a = hash(v, i) * T, b = hash(i, v) * T; x.beginPath(); x.moveTo(a, b + 5); x.lineTo(a - 2, b - 2); x.lineTo(a + 1, b + 4); x.lineTo(a + 3, b - 3); x.lineTo(a + 3, b + 5); x.fill(); }
    if (v % 3 === 0) { ['#F2C14E', '#E2475C', '#fff'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(8 + hash(v, i + 7) * 30, 8 + hash(i + 7, v) * 30, 2.2, 0, 7); x.fill(); }); } },
  '_': (x, th, v) => { x.fillStyle = th.path; x.fillRect(0, 0, T, T); speckle(x, 'rgba(90,60,30,.12)', 6, v + 4); speckle(x, 'rgba(255,255,255,.1)', 3, v + 2); },
  'f': (x, th, v) => { x.fillStyle = th.floor; x.fillRect(0, 0, T, T); x.strokeStyle = 'rgba(0,0,0,.14)'; x.lineWidth = 1; for (let i = 0; i <= 3; i++) { x.beginPath(); x.moveTo(0, i * 16); x.lineTo(T, i * 16); x.stroke(); }
    for (let r = 0; r < 3; r++) { const o = (r + v) % 2 ? 0 : 24; x.beginPath(); x.moveTo(o, r * 16); x.lineTo(o, r * 16 + 16); x.stroke(); } },
  's': (x, th, v) => { x.fillStyle = '#F0DDA8'; x.fillRect(0, 0, T, T); x.strokeStyle = 'rgba(180,140,70,.25)'; x.lineWidth = 1.2; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(0, 10 + i * 14 + v % 4); x.quadraticCurveTo(T / 2, 4 + i * 14, T, 10 + i * 14); x.stroke(); } },
  '=': (x, th, v) => { x.fillStyle = th.water[1]; x.fillRect(0, 0, T, T); x.fillStyle = '#8A5A30'; x.fillRect(0, 4, T, T - 8); x.fillStyle = '#A8723E'; for (let i = 0; i < 4; i++) x.fillRect(1 + i * 12, 5, 10, T - 10); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(0, T - 6, T, 2); },
  '~': (x, th, v) => { const g = x.createLinearGradient(0, 0, 0, T); g.addColorStop(0, th.water[0]); g.addColorStop(1, th.water[1]); x.fillStyle = g; x.fillRect(0, 0, T, T); },
  '#': (x, th, v) => {   // جدار: سطح فاتح وواجهة سفلية أغمق بحجارة
    x.fillStyle = th.wall[1]; x.fillRect(0, 0, T, T); x.fillStyle = th.wall[0]; x.fillRect(0, 0, T, T * .62);
    x.strokeStyle = 'rgba(0,0,0,.16)'; x.lineWidth = 1; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) x.strokeRect(c * 16 + (r % 2 ? 8 : 0) - 8, T * .62 + r * 9, 16, 9);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 0, T, 3); x.fillStyle = th.wall[2]; x.fillRect(0, T - 3, T, 3);
  },
  '"': (x, th, v) => { ground(x, th, v); x.fillStyle = 'rgba(0,0,0,.15)'; x.beginPath(); x.ellipse(T / 2, T - 8, 20, 6, 0, 0, 7); x.fill();   // شجيرة شوك (تُقص بالمنجل)
    const c = ['#5E8C3A', '#4C7A2E', '#6E9C46']; for (let i = 0; i < 6; i++) { x.fillStyle = c[i % 3]; x.beginPath(); x.arc(10 + (i % 3) * 14, 16 + Math.floor(i / 3) * 12, 11, 0, 7); x.fill(); }
    x.strokeStyle = '#3A2A18'; x.lineWidth = 1.4; for (let i = 0; i < 5; i++) { const a = 8 + hash(v, i) * 32, b = 10 + hash(i, v) * 26; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 4, b - 4); x.stroke(); } },
  'R': (x, th, v) => { ground(x, th, v); x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(T / 2 + 3, T - 8, 20, 6, 0, 0, 7); x.fill();   // صخرة متشققة (تُكسر بالمعول)
    const g = x.createLinearGradient(0, 6, 0, T); g.addColorStop(0, '#B8B0A4'); g.addColorStop(1, '#7E766C'); x.fillStyle = g; x.beginPath(); x.moveTo(6, T - 8); x.lineTo(9, 16); x.lineTo(22, 7); x.lineTo(38, 11); x.lineTo(43, T - 8); x.closePath(); x.fill();
    x.strokeStyle = '#4E463E'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(24, 9); x.lineTo(21, 20); x.lineTo(27, 27); x.lineTo(23, 36); x.stroke(); },
  'c': (x, th, v) => { x.fillStyle = th.g[0]; x.fillRect(0, 0, T, T); speckle(x, 'rgba(0,0,0,.15)', 6, v + 5); },
  ' ': x => { x.fillStyle = '#1A1420'; x.fillRect(0, 0, T, T); }
};
export const SOLID_TILES = new Set(['#', '~', '"', 'R', ' ', 'T']);
export function drawTile(c, ch, theme, tx, ty, sc) {
  const th = THEMES[theme], v = Math.floor(hash(tx, ty) * 9);
  const k = ch === 'T' || ch === '_' || ch === '~' ? '.' : ch, p = PAINT[k] || PAINT['.'];
  c.drawImage(cached(theme + k + v, sc, x => p(x, th, v)), tx * T - .3, ty * T - .3, T + .6, T + .6);   // تداخل بسيط يمنع خطوط الشبكة
}
/* الطرق والماء أشكالاً ناعمة متصلة فوق الأرض (بلا حواف مربعة) */
export function drawSoft(c, tiles, theme, t) {
  const th = THEMES[theme];
  const has = (x, y, set) => tiles.some(q => q[0] === x && q[1] === y && set.includes(q[2]));
  // كل بلاطة مستطيل متصل بجيرانه، والزوايا الخارجية فقط مستديرة
  const blob = (list, set, pad, r, col) => { c.fillStyle = col; list.forEach(([x, y]) => { const L = has(x - 1, y, set), Rr = has(x + 1, y, set), U = has(x, y - 1, set), D = has(x, y + 1, set);
    c.beginPath(); c.roundRect(x * T - pad, y * T - pad, T + pad * 2, T + pad * 2, [!U && !L ? r : 0, !U && !Rr ? r : 0, !D && !Rr ? r : 0, !D && !L ? r : 0]); c.fill(); }); };
  const path = tiles.filter(q => q[2] === '_'); blob(path, '_', 2, 12, th.path);
  c.fillStyle = 'rgba(255,255,255,.07)'; path.forEach(([x, y]) => { c.beginPath(); c.ellipse(x * T + 14 + (x * 7 % 13), y * T + 18 + (y * 5 % 11), 5, 2.5, 0, 0, 7); c.fill(); });
  const w = tiles.filter(q => q[2] === '~' || q[2] === '=');
  blob(w, '~=', 7, 18, 'rgba(255,240,200,.55)'); blob(w, '~=', 1, 14, th.water[0]);
}
/* لمعان الماء حياً */
export function drawWaterFx(c, tx, ty, t) {
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; const o = (t * 14 + hash(tx, ty) * 40) % 40;
  c.beginPath(); c.moveTo(tx * T + 6 + o * .3, ty * T + 14 + (o % 18)); c.quadraticCurveTo(tx * T + 16 + o * .3, ty * T + 10 + (o % 18), tx * T + 26 + o * .3, ty * T + 14 + (o % 18)); c.stroke();
}

/* ── أشياء قائمة تُرتّب حسب العمق ── */
export function drawTree(c, kind, x, y, t, seed) {
  c.save(); c.translate(x, y); const sway = Math.sin(t * 1.3 + seed) * .03;
  c.fillStyle = 'rgba(40,30,10,.25)'; c.beginPath(); c.ellipse(6, 0, 20, 6, 0, 0, 7); c.fill();
  if (kind === 'palm') {
    c.strokeStyle = '#7A5230'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -36, 3, -70); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 7; c.setLineDash([2, 6]); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -36, 3, -70); c.stroke(); c.setLineDash([]);
    c.rotate(sway); for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * .44; c.fillStyle = i % 2 ? '#2F8A3A' : '#46A845'; c.beginPath(); c.moveTo(3, -70);
      c.quadraticCurveTo(3 + Math.cos(a) * 22, -82 + Math.sin(a) * 14, 3 + Math.cos(a) * 40, -64 + Math.sin(a) * 6 + 10); c.quadraticCurveTo(3 + Math.cos(a) * 20, -72 + Math.sin(a) * 8, 3, -68); c.fill(); }
    c.fillStyle = '#D98A10'; [[-3, -66], [6, -65], [1, -62]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 3.4, 0, 7); c.fill(); });
  } else if (kind === 'cactus') {
    c.fillStyle = '#5E9C48'; const r = (x0, y0, w, h) => { c.beginPath(); c.roundRect(x0, y0, w, h, w / 2); c.fill(); };
    r(-6, -54, 12, 54); r(-20, -38, 9, 22); r(-20, -22, 18, 7); r(11, -44, 9, 24); r(4, -26, 16, 7);
    c.fillStyle = 'rgba(255,255,255,.18)'; r(-3, -50, 3, 44);
  } else if (kind === 'rock') {
    const g = c.createLinearGradient(0, -40, 0, 0); g.addColorStop(0, '#8A8078'); g.addColorStop(1, '#5A524A'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-20, 0); c.lineTo(-16, -30); c.lineTo(-4, -42); c.lineTo(12, -36); c.lineTo(20, 0); c.closePath(); c.fill();
  } else if (kind === 'dead') {
    c.strokeStyle = '#4A3A30'; c.lineCap = 'round'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -44); c.stroke(); c.lineWidth = 3;
    [[-14, -60, -2, -34], [14, -58, 0, -40], [-10, -46, 0, -28]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(d, e); c.lineTo(a, b); c.stroke(); });
  } else {   // شجرة مستديرة
    c.fillStyle = '#6B4520'; c.fillRect(-4, -26, 8, 26); c.rotate(sway);
    [['#3E7A30', 0, -48, 24], ['#4E8E3A', -12, -40, 16], ['#4E8E3A', 12, -42, 17], ['#5FA246', -2, -56, 15]].forEach(([col, a, b, rr]) => { c.fillStyle = col; c.beginPath(); c.arc(a, b, rr, 0, 7); c.fill(); });
  }
  c.restore();
}

/* عناصر تفاعلية (العالم بوحدات البلاطة: x,y مركز قاعدة البلاطة) */
export function drawThing(c, e, t, A) {
  const x = e.x * T + T / 2, y = e.y * T + T;
  const sh = (rx = 18) => { c.fillStyle = 'rgba(40,25,10,.22)'; c.beginPath(); c.ellipse(x + 3, y - 4, rx, rx * .3, 0, 0, 7); c.fill(); };
  c.save();
  switch (e.kind) {
    case 'chest': { sh(20); const open = e.open; c.fillStyle = '#7A4A22'; c.beginPath(); c.roundRect(x - 18, y - 26, 36, 22, 3); c.fill(); c.fillStyle = '#C9971C'; c.fillRect(x - 18, y - 18, 36, 3); c.fillRect(x - 3, y - 22, 6, 8);
      c.fillStyle = open ? '#4A2A10' : '#9C6438'; c.beginPath(); open ? c.roundRect(x - 18, y - 38, 36, 10, 3) : c.roundRect(x - 19, y - 34, 38, 12, 6); c.fill(); if (open) { c.fillStyle = 'rgba(255,220,120,.5)'; c.fillRect(x - 15, y - 28, 30, 4); } break; }
    case 'lever': { sh(12); c.fillStyle = '#6A6A72'; c.fillRect(x - 12, y - 10, 24, 8); const a = e.on ? .6 : -.6; c.strokeStyle = '#3A3A40'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + Math.sin(a) * 22, y - 8 - Math.cos(a) * 22); c.stroke(); c.fillStyle = e.color || '#E2475C'; c.beginPath(); c.arc(x + Math.sin(a) * 22, y - 8 - Math.cos(a) * 22, 5.5, 0, 7); c.fill(); break; }
    case 'plate': { const on = A.pressed(e); c.fillStyle = on ? '#C9971C' : '#8C8478'; c.beginPath(); c.roundRect(x - 18, y - 32, 36, 28, 5); c.fill(); c.fillStyle = on ? '#FFD54A' : '#A69E92'; c.beginPath(); c.roundRect(x - 14, y - 28, 28, 20, 4); c.fill();
      c.fillStyle = 'rgba(0,0,0,.25)'; c.font = '900 14px Cairo'; c.textAlign = 'center'; c.fillText('◆', x, y - 13); break; }
    case 'block': { const bx = (e.px != null ? e.px : e.x) * T + T / 2, by = (e.py != null ? e.py : e.y) * T + T; c.fillStyle = 'rgba(40,25,10,.25)'; c.fillRect(bx - 20, by - 8, 44, 8);
      c.fillStyle = '#A8723E'; c.fillRect(bx - 21, by - 44, 42, 40); c.strokeStyle = '#6E4520'; c.lineWidth = 3; c.strokeRect(bx - 21, by - 44, 42, 40); c.beginPath(); c.moveTo(bx - 21, by - 44); c.lineTo(bx + 21, by - 4); c.moveTo(bx + 21, by - 44); c.lineTo(bx - 21, by - 4); c.stroke(); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(bx - 19, by - 42, 38, 4); break; }
    case 'gate': { if (e.open) { c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x - 24, y - 6, 48, 4); break; } c.fillStyle = '#3A3A44'; for (let i = 0; i < 5; i++) c.fillRect(x - 22 + i * 10, y - 52, 4, 50); c.fillRect(x - 24, y - 54, 48, 5); c.fillRect(x - 24, y - 26, 48, 4); c.fillStyle = '#8A8A96'; for (let i = 0; i < 5; i++) c.fillRect(x - 21 + i * 10, y - 52, 1.4, 50); break; }
    case 'door': { if (e.open) break; c.fillStyle = '#6B3E1E'; c.beginPath(); c.roundRect(x - 20, y - 54, 40, 52, [16, 16, 0, 0]); c.fill(); c.strokeStyle = '#4A2A10'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 52); c.lineTo(x, y - 2); c.stroke();
      c.fillStyle = '#C9971C'; c.beginPath(); c.arc(x + 9, y - 26, 4, 0, 7); c.fill(); c.fillStyle = '#2A1B10'; c.fillRect(x + 7.5, y - 24, 3, 6); break; }
    case 'sign': { sh(12); c.fillStyle = '#7A4A22'; c.fillRect(x - 3, y - 30, 6, 28); c.fillStyle = '#C9955A'; c.beginPath(); c.roundRect(x - 20, y - 46, 40, 22, 4); c.fill(); c.strokeStyle = '#7A4A22'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#4A2A10'; c.fillRect(x - 13, y - 39, 26, 2); c.fillRect(x - 13, y - 33, 18, 2); break; }
    case 'fire': { sh(14); c.fillStyle = '#6B4520'; c.save(); c.translate(x, y - 6); c.rotate(.5); c.fillRect(-14, -3, 28, 6); c.rotate(-1); c.fillRect(-14, -3, 28, 6); c.restore();
      if (e.lit !== false) { const f = Math.sin(t * 12 + e.x) * 2; c.fillStyle = 'rgba(255,170,40,.25)'; c.beginPath(); c.arc(x, y - 18, 26, 0, 7); c.fill();
        c.fillStyle = '#FF8A1E'; c.beginPath(); c.moveTo(x - 10, y - 8); c.quadraticCurveTo(x - 8, y - 26 - f, x, y - 36 - f); c.quadraticCurveTo(x + 8, y - 26 + f, x + 10, y - 8); c.fill(); c.fillStyle = '#FFD54A'; c.beginPath(); c.moveTo(x - 5, y - 8); c.quadraticCurveTo(x - 3, y - 20, x, y - 26 - f); c.quadraticCurveTo(x + 4, y - 18, x + 5, y - 8); c.fill(); } break; }
    case 'beacon': { sh(16); c.fillStyle = '#8C8478'; c.fillRect(x - 14, y - 34, 28, 30); c.fillStyle = '#6E665C'; c.fillRect(x - 17, y - 38, 34, 6);
      if (e.lit) { const f = Math.sin(t * 10 + e.x) * 3; c.fillStyle = 'rgba(255,170,40,.28)'; c.beginPath(); c.arc(x, y - 52, 40, 0, 7); c.fill(); c.fillStyle = '#FF7A1E'; c.beginPath(); c.moveTo(x - 13, y - 38); c.quadraticCurveTo(x - 9, y - 62 - f, x, y - 76 - f); c.quadraticCurveTo(x + 9, y - 62 + f, x + 13, y - 38); c.fill(); c.fillStyle = '#FFD54A'; c.beginPath(); c.moveTo(x - 6, y - 38); c.quadraticCurveTo(x, y - 54, x, y - 62 - f); c.quadraticCurveTo(x + 4, y - 50, x + 6, y - 38); c.fill(); }
      else { c.fillStyle = '#5A4632'; c.fillRect(x - 10, y - 42, 20, 5); } break; }
    case 'cage': { sh(24); if (!e.open) { c.strokeStyle = '#3A3A44'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x - 22 + i * 8.8, y - 4); c.lineTo(x - 22 + i * 8.8, y - 70); c.stroke(); } c.fillStyle = '#4A4652'; c.fillRect(x - 25, y - 74, 50, 6); c.fillRect(x - 25, y - 6, 50, 5); } break; }
    case 'star': { if (e.got) break; const b = Math.sin(t * 3 + e.x) * 3; c.fillStyle = 'rgba(255,214,90,.3)'; c.beginPath(); c.arc(x, y - 26 + b, 16, 0, 7); c.fill(); c.translate(x, y - 26 + b); c.rotate(t * .8); c.fillStyle = '#FFD54A'; c.strokeStyle = '#C98A0E'; c.lineWidth = 1.5;
      c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 12, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); break; }
    case 'item': { if (e.got) break; const b = Math.sin(t * 3 + e.y) * 2.5; sh(12); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x, y - 24 + b, 17, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,200,60,.9)'; c.lineWidth = 2; c.stroke();
      c.font = '22px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(A.itemIcon(e.item), x, y - 23 + b); break; }
    case 'banner': { c.fillStyle = '#5A4632'; c.fillRect(x - 24, y - 60, 48, 4); const cols = e.colors || []; cols.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - 22 + i * 15, y - 56); c.lineTo(x - 9 + i * 15, y - 56); c.lineTo(x - 15.5 + i * 15, y - 34); c.fill(); });
      c.fillStyle = '#5A4632'; c.fillRect(x - 26, y - 60, 3, 58); c.fillRect(x + 23, y - 60, 3, 58); break; }
    case 'tent': { sh(30); c.fillStyle = e.color || '#8E3B3B'; c.beginPath(); c.moveTo(x - 34, y - 4); c.lineTo(x, y - 60); c.lineTo(x + 34, y - 4); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(x - 9, y - 4); c.lineTo(x, y - 30); c.lineTo(x + 9, y - 4); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 60); c.lineTo(x - 20, y - 4); c.stroke(); break; }
    case 'crates': { sh(24); [[-14, 0], [14, 0], [0, -26]].forEach(([dx, dy]) => { c.fillStyle = '#9C6438'; c.fillRect(x + dx - 13, y + dy - 30, 26, 26); c.strokeStyle = '#6E4520'; c.lineWidth = 2; c.strokeRect(x + dx - 13, y + dy - 30, 26, 26); }); break; }
    case 'barrel': { sh(14); c.fillStyle = '#8A5A30'; c.beginPath(); c.roundRect(x - 13, y - 36, 26, 32, 7); c.fill(); c.fillStyle = '#5A3A1A'; c.fillRect(x - 13, y - 30, 26, 3); c.fillRect(x - 13, y - 14, 26, 3); break; }
    case 'boat': { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x, y - 4, 40, 9, 0, 0, 7); c.fill(); c.fillStyle = '#A8723E'; c.beginPath(); c.moveTo(x - 42, y - 22); c.quadraticCurveTo(x, y + 4, x + 42, y - 22); c.lineTo(x + 36, y - 30); c.lineTo(x - 36, y - 30); c.closePath(); c.fill();
      c.fillStyle = '#E8DCC2'; if (e.sail) { c.fillRect(x - 2, y - 90, 4, 62); c.beginPath(); c.moveTo(x + 2, y - 88); c.lineTo(x + 34, y - 36); c.lineTo(x + 2, y - 36); c.fill(); } break; }
    case 'well': { sh(22); c.fillStyle = '#B8AE98'; c.beginPath(); c.ellipse(x, y - 14, 22, 9, 0, 0, 7); c.fill(); c.fillStyle = '#9C9280'; c.fillRect(x - 22, y - 14, 44, 10); c.fillStyle = '#2A4A5A'; c.beginPath(); c.ellipse(x, y - 14, 16, 6, 0, 0, 7); c.fill(); c.fillStyle = '#6B4520'; c.fillRect(x - 20, y - 52, 4, 40); c.fillRect(x + 16, y - 52, 4, 40); c.fillRect(x - 20, y - 54, 40, 4); break; }
    case 'rot': { sh(14); c.fillStyle = '#BDB39E'; c.beginPath(); c.arc(x, y - 18, 15, 0, 7); c.fill(); c.translate(x, y - 18); c.fillStyle = e.style === 'mirror' ? '#9FC4F0' : '#C9971C';   // نفس اتجاهات العرض ثلاثي الأبعاد: المرآة «/» أو «\»، والسهم ٠=جنوب ١=غرب ٢=شمال ٣=شرق
      if (e.style === 'mirror') { c.rotate((e.r || 0) % 2 ? Math.PI / 4 : -Math.PI / 4); c.fillRect(-14, -3, 28, 6); } else c.rotate(Math.PI / 2 + (e.r || 0) * Math.PI / 2);
      if (e.style === 'mirror') {} else { c.beginPath(); c.moveTo(14, 0); c.lineTo(0, -7); c.lineTo(0, 7); c.fill(); c.fillRect(-12, -2.5, 14, 5); } break; }
    case 'tablet': { sh(14); c.fillStyle = '#B8AE98'; c.fillRect(x - 17, y - 44, 34, 40); c.font = '24px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText((A.symbols || ['🌙', '☀️', '⭐', '🌴'])[e.sym || 0], x, y - 24); break; }
    case 'crystal': if (e.style === 'field') { c.fillStyle = '#9A8466'; c.fillRect(x - 22, y - 30, 44, 34); c.fillStyle = '#6B4A2E'; c.fillRect(x - 18, y - 26, 36, 26); if (e.lit || e.wet) { c.fillStyle = '#5FAE45'; for (let i = 0; i < 9; i++) { const sx = x - 12 + (i % 3) * 12, sy = y - 20 + Math.floor(i / 3) * 9; c.beginPath(); c.moveTo(sx, sy - 8); c.lineTo(sx + 4, sy + 2); c.lineTo(sx - 4, sy + 2); c.fill(); } } break; }
    case 'crystal': { sh(12); c.fillStyle = e.lit ? '#BFF0FF' : '#5AA8D0'; c.beginPath(); c.moveTo(x, y - 50); c.lineTo(x + 11, y - 28); c.lineTo(x, y - 8); c.lineTo(x - 11, y - 28); c.closePath(); c.fill(); if (e.lit) { c.fillStyle = 'rgba(124,214,255,.3)'; c.beginPath(); c.arc(x, y - 28, 26, 0, 7); c.fill(); } break; }
    case 'beam': { sh(12); c.fillStyle = '#B8AE98'; c.fillRect(x - 12, y - 30, 24, 26); c.fillStyle = '#FFD54A'; c.beginPath(); c.arc(x, y - 36, 10, 0, 7); c.fill(); break; }
    case 'fence': { c.strokeStyle = '#7A4A22'; c.lineWidth = 4; c.beginPath(); if (e.vertical) { c.moveTo(x, y - T); c.lineTo(x, y); } else { c.moveTo(x - T / 2, y - 16); c.lineTo(x + T / 2, y - 16); } c.stroke(); break; }
    case 'pillar': { sh(16); c.fillStyle = '#C9BFA9'; c.fillRect(x - 12, y - 70, 24, 66); c.fillStyle = '#B5AB97'; c.fillRect(x - 16, y - 74, 32, 7); break; }
    case 'torchw': { c.fillStyle = '#3A3A44'; c.fillRect(x - 2, y - 40, 4, 36); c.fillStyle = '#FF8A1E'; c.beginPath(); c.arc(x, y - 44, 6 + Math.sin(t * 12) * 1.5, 0, 7); c.fill(); break; }
    case 'site': { if (e.built) { c.fillStyle = '#9C6438'; c.fillRect(x - 24, y - 20, 48, 16); break; } c.strokeStyle = `rgba(255,213,74,${.5 + Math.sin(t * 4) * .3})`; c.lineWidth = 3; c.setLineDash([6, 5]); c.strokeRect(x - 20, y - 40, 40, 36); c.setLineDash([]); break; }
    case 'house': { const w = (e.w || 3) * T, h = (e.h || 2) * T, hx = e.x * T, hy = e.y * T + T;   // مبنى من الأعلى بواجهة
      c.fillStyle = 'rgba(40,25,10,.22)'; c.fillRect(hx + 6, hy - 6, w, 10); c.fillStyle = e.face || '#D9C6A0'; c.fillRect(hx, hy - h * .55, w, h * .55); c.fillStyle = e.roof || '#EFE3C8'; c.fillRect(hx - 2, hy - h - 6, w + 4, h * .45 + 6);
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(hx - 2, hy - h * .55 - 4, w + 4, 4); for (let i = 0; i < w / 12; i++) { c.fillStyle = e.roof || '#EFE3C8'; c.fillRect(hx + i * 12, hy - h - 12, 7, 7); }
      if (!e.noDoor) { c.fillStyle = '#6B3E1E'; c.beginPath(); c.roundRect(hx + w / 2 - 12, hy - 40, 24, 38, [10, 10, 0, 0]); c.fill(); } c.fillStyle = '#2E6B78'; [hx + 14, hx + w - 30].forEach(wx => { c.beginPath(); c.roundRect(wx, hy - h * .45, 16, 20, [8, 8, 0, 0]); c.fill(); }); break; }
  }
  c.restore();
}
/* مخروط رؤية الحارس */
export function drawCone(c, g, alert) {
  const x = g.px * T + T / 2, y = g.py * T + T * .7, a = g.ang, r = (g.range || 4) * T, s = g.fov || .5;
  const grad = c.createRadialGradient(x, y, 4, x, y, r); grad.addColorStop(0, alert ? 'rgba(255,70,70,.45)' : 'rgba(255,220,90,.38)'); grad.addColorStop(1, 'rgba(255,220,90,0)');
  c.fillStyle = grad; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, a - s, a + s); c.closePath(); c.fill();
}
