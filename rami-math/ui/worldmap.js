// خريطة العالم المرسومة (لوحة 🗺️): رقّ بحواف وبوصلة، البحر شرقاً، كل منطقة بأرضها وأسوارها وشعارها واسمها على شريط،
// الطرق الرئيسة، معالم القرية (البيوت، المزرعة، البركة، المدرسة، البئر)، المناطق المقفلة مظللة بقفل،
// وعلامات: أنت، والمهمة الحالية، ومن ينتظرك. تُرسم بدقة مضاعفة.
const WW = 3200, WH = 6500, SEA = 2930;
const ZONES = [   // [المعرّف، الاسم، الرمز، x0، y0، x1، y1، لون الأرض، فهرس البوابة في REGIONS (-1 = مفتوحة دائماً)]
  ['village', 'قرية الخير', '🏡', 0, 0, 1500, 1712, '#E9D6A2', -1],
  ['market', 'السوق الأسبوعي', '🛒', 1500, 0, 2300, 1712, '#EFCB97', 0],
  ['harbor', 'الميناء', '⚓', 2300, 0, SEA, 1712, '#F1DDB0', 1],
  ['fort', 'القلعة', '🏰', 0, 1712, SEA, 2600, '#DCC39A', 2],
  ['festival', 'ساحة المهرجان', '🎪', 0, 2600, SEA, 3040, '#EBCFC0', 3],
  ['datayard', 'بستان البيانات', '📊', 0, 3040, 2500, 3500, '#CFE3B0', 7],
  ['coop', 'سوق الجمعية', '🏪', 0, 3500, SEA, 4500, '#D9DDB4', 4],
  ['caravan', 'طريق القافلة', '🐪', 0, 4500, SEA, 5500, '#EBCB93', 5],
  ['workshop', 'ورشة البنّاء', '🛠️', 0, 5500, SEA, WH, '#D8C7AE', 6]
];
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const rnd = (a => () => (a = (a * 9301 + 49297) % 233280) / 233280)(7);
const SPECKS = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd()]);

/* d = { player, target, npcs:[{x,y,waiting}], open:[...], village:{houses, farm, farmGreen, pond, school, well, warehouse}, castle, moat, funpark, piers, place } */
export function drawWorldMap(cv, d) {
  const DPR = 2, CW = 340, CH = Math.round(CW * WH / WW) + 20;
  if (cv.width !== CW * DPR) { cv.width = CW * DPR; cv.height = CH * DPR; cv.style.width = CW + 'px'; cv.style.height = CH + 'px'; cv.style.flex = 'none'; }
  const c = cv.getContext('2d'), k = (CW - 20) / WW, X = x => 10 + x * k, Y = y => 10 + y * k;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, CW, CH);
  // الرقّ
  const g = c.createLinearGradient(0, 0, CW, CH); g.addColorStop(0, '#F6E6BE'); g.addColorStop(.5, '#EFD9A6'); g.addColorStop(1, '#E4C68A');
  c.fillStyle = g; rr(c, 2, 2, CW - 4, CH - 4, 14); c.fill();
  SPECKS.forEach(([a, b, s]) => { c.fillStyle = `rgba(120,80,30,${.05 + s * .08})`; c.beginPath(); c.arc(4 + a * (CW - 8), 4 + b * (CH - 8), .6 + s * 1.4, 0, 7); c.fill(); });
  // المناطق
  ZONES.forEach(([id, name, icon, x0, y0, x1, y1, col]) => {
    c.fillStyle = col; c.fillRect(X(x0), Y(y0), (x1 - x0) * k, (y1 - y0) * k);
    c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(X(x0 + (x1 - x0) * ((i * .37) % 1)), Y(y0 + (y1 - y0) * ((i * .61 + .2) % 1)), 14, 5, 0, 0, 7); c.fill(); }
  });
  // البحر شرقاً بأمواج
  const sg = c.createLinearGradient(X(SEA), 0, CW, 0); sg.addColorStop(0, '#7CC8EE'); sg.addColorStop(1, '#2F86C9');
  c.fillStyle = sg; c.beginPath(); c.moveTo(X(SEA), Y(0)); for (let y = 0; y <= WH; y += 120) c.lineTo(X(SEA) + Math.sin(y / 300) * 3, Y(y)); c.lineTo(CW - 10, Y(WH)); c.lineTo(CW - 10, Y(0)); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; for (let y = 200; y < WH; y += 380) { const sx = X(SEA) + 6; c.beginPath(); c.moveTo(sx, Y(y)); c.quadraticCurveTo(sx + 4, Y(y) - 3, sx + 8, Y(y)); c.quadraticCurveTo(sx + 12, Y(y) + 3, sx + 16, Y(y)); c.stroke(); }
  // الطرق: الشارع الرئيس، شارع القرية الشمالي، وطريق الجنوب عبر البوابات
  const road = (x0, y0, x1, y1, w) => { c.strokeStyle = '#6B6E7A'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(x0), Y(y0)); c.lineTo(X(x1), Y(y1)); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = .8; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); };
  road(0, 640, SEA, 640, 5); road(735, 0, 735, 600, 4);
  c.strokeStyle = '#B68A55'; c.lineWidth = 4; c.lineCap = 'round'; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(X(1240), Y(680)); c.lineTo(X(1240), Y(WH - 300)); c.stroke(); c.setLineDash([]);
  // معالم القرية
  const V = d.village;
  c.fillStyle = V.farmGreen ? '#7CB35A' : '#C9A46B'; rr(c, X(V.farm.x), Y(V.farm.y), V.farm.w * k, V.farm.h * k, 3); c.fill();
  c.strokeStyle = V.farmGreen ? '#4E8A3A' : '#A4824E'; c.lineWidth = .8; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(X(V.farm.x + 10), Y(V.farm.y + i * V.farm.h / 6)); c.lineTo(X(V.farm.x + V.farm.w - 10), Y(V.farm.y + i * V.farm.h / 6)); c.stroke(); }
  c.fillStyle = '#4FB3E8'; rr(c, X(V.pond.x), Y(V.pond.y), V.pond.w * k, V.pond.h * k, 6); c.fill(); c.strokeStyle = '#2F7FB0'; c.lineWidth = 1; c.stroke();
  const house = (b, roof) => { const x = X(b.x), y = Y(b.y), w = b.w * k, h = b.h * k; c.fillStyle = 'rgba(70,45,20,.25)'; c.fillRect(x + 1.5, y + 1.5, w, h); c.fillStyle = '#F3E4C4'; c.fillRect(x, y, w, h); c.fillStyle = roof; c.fillRect(x, y, w, h * .45); c.strokeStyle = '#7A5A30'; c.lineWidth = .8; c.strokeRect(x, y, w, h); };
  V.houses.forEach(b => house(b, '#C8875A')); house(V.warehouse, '#8FA0B5'); house(V.school, '#3F7FB0');
  { const s = V.school; c.strokeStyle = '#555'; c.lineWidth = .8; c.beginPath(); c.moveTo(X(s.x + s.w - 6), Y(s.y)); c.lineTo(X(s.x + s.w - 6), Y(s.y) - 9); c.stroke(); c.fillStyle = '#fff'; c.fillRect(X(s.x + s.w - 6), Y(s.y) - 9, 6, 2); c.fillStyle = '#C8102E'; c.fillRect(X(s.x + s.w - 6), Y(s.y) - 7, 6, 1.5); c.fillStyle = '#009639'; c.fillRect(X(s.x + s.w - 6), Y(s.y) - 5.5, 6, 2); }
  c.fillStyle = '#9C8B72'; c.beginPath(); c.arc(X(V.well.x), Y(V.well.y), 3, 0, 7); c.fill(); c.fillStyle = '#4FB3E8'; c.beginPath(); c.arc(X(V.well.x), Y(V.well.y), 1.6, 0, 7); c.fill();
  // معالم المناطق الأخرى
  c.fillStyle = '#4FB3E8'; c.fillRect(X(d.moat.x), Y(d.moat.y), d.moat.w * k, d.moat.h * k);
  { const C = d.castle, x = X(C.x), y = Y(C.y), w = C.w * k, h = C.h * k; c.fillStyle = '#C9A06A'; c.fillRect(x, y, w, h); c.fillStyle = '#B48550'; [[0, 0], [w - 6, 0], [0, h - 6], [w - 6, h - 6]].forEach(([a, b]) => c.fillRect(x + a - 1, y + b - 1, 8, 8)); c.strokeStyle = '#7A5A30'; c.lineWidth = .8; c.strokeRect(x, y, w, h); }
  { const F = d.funpark, cx = X(F.x + F.w / 2), cy = Y(F.y + F.h * .35); c.strokeStyle = '#E2475C'; c.lineWidth = 1.4; c.beginPath(); c.arc(cx, cy, 9, 0, 7); c.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); c.stroke(); } }
  c.strokeStyle = '#8A5A30'; c.lineWidth = 2; d.piers.forEach(py => { c.beginPath(); c.moveTo(X(SEA - 60), Y(py)); c.lineTo(X(SEA + 200), Y(py)); c.stroke(); });
  // الأسوار بين المناطق والبوابات
  c.strokeStyle = '#8A6238'; c.lineWidth = 2.2; c.setLineDash([5, 2]);
  [[1500, 0, 1500, 1712], [2300, 0, 2300, 1712], [0, 1712, SEA, 1712], [0, 2600, SEA, 2600], [0, 3500, SEA, 3500], [0, 4500, SEA, 4500], [0, 5500, SEA, 5500]].forEach(([a, b, e, f]) => { c.beginPath(); c.moveTo(X(a), Y(b)); c.lineTo(X(e), Y(f)); c.stroke(); });
  c.setLineDash([]);
  // المناطق المقفلة، وأشرطة الأسماء
  ZONES.forEach(([id, name, icon, x0, y0, x1, y1, col, gi]) => {
    const locked = gi >= 0 && !d.open[gi], narrow = (Math.min(x1, SEA) - x0) * k < 120, cx = X((x0 + Math.min(x1, SEA)) / 2), cy = Y(y0) + 20 + (id === 'harbor' ? 26 : 0);
    if (locked) { c.fillStyle = 'rgba(70,50,30,.42)'; c.fillRect(X(x0), Y(y0), (Math.min(x1, SEA) - x0) * k, (y1 - y0) * k);
      c.font = '20px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🔒', X((x0 + Math.min(x1, SEA)) / 2), Y((y0 + y1) / 2)); }
    c.font = `900 ${narrow ? 9.5 : 11}px Cairo, sans-serif`; c.direction = 'rtl'; const tw = c.measureText(name).width + 24;
    c.fillStyle = 'rgba(60,35,10,.3)'; rr(c, cx - tw / 2 + 1, cy - 9 + 1.5, tw, 18, 9); c.fill();
    c.fillStyle = locked ? '#8A8478' : d.place === id ? '#E2475C' : '#7A4A22'; rr(c, cx - tw / 2, cy - 9, tw, 18, 9); c.fill();
    c.strokeStyle = '#FFD772'; c.lineWidth = 1; rr(c, cx - tw / 2 + 1.5, cy - 7.5, tw - 3, 15, 7.5); c.stroke();
    c.fillStyle = '#FFF6E2'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, cx - 6, cy + 1); c.font = '11px sans-serif'; c.direction = 'ltr'; c.fillText(icon, cx + tw / 2 - 10, cy + 1);
  });
  // من ينتظرك، والمهمة، وأنت
  const zoneOf = (x, y) => ZONES.find(z => x >= z[3] && x < z[5] && y >= z[4] && y < z[6]), lockedAt = (x, y) => { const z = zoneOf(x, y); return z && z[8] >= 0 && !d.open[z[8]]; };
  d.npcs.filter(n => !lockedAt(n.x, n.y)).forEach(n => { c.fillStyle = n.waiting ? '#FFC23D' : 'rgba(255,255,255,.85)'; c.strokeStyle = '#5A3A10'; c.lineWidth = .8; c.beginPath(); c.arc(X(n.x), Y(n.y), n.waiting ? 4.2 : 2.2, 0, 7); c.fill(); c.stroke();
    if (n.waiting) { c.fillStyle = '#5A3A10'; c.font = '900 7px Cairo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', X(n.x), Y(n.y) + .5); } });
  if (d.target) { const x = X(d.target.x), y = Y(d.target.y); c.fillStyle = 'rgba(46,158,91,.25)'; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill();
    c.fillStyle = '#2E9E5B'; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.8 : 6.5; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
  { const x = X(d.player.x), y = Y(d.player.y); c.fillStyle = 'rgba(194,48,74,.25)'; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill();
    c.fillStyle = '#C2304A'; c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 2); c.bezierCurveTo(x - 9, y - 8, x - 6, y - 17, x, y - 17); c.bezierCurveTo(x + 6, y - 17, x + 9, y - 8, x, y + 2); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y - 10.5, 3, 0, 7); c.fill(); }
  // البوصلة في البحر
  { const x = CW - 26, y = CH - 40; c.fillStyle = 'rgba(255,248,230,.9)'; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill(); c.strokeStyle = '#7A4A22'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#C2304A'; c.beginPath(); c.moveTo(x, y - 11); c.lineTo(x + 3.5, y); c.lineTo(x - 3.5, y); c.fill(); c.fillStyle = '#2A1B66'; c.beginPath(); c.moveTo(x, y + 11); c.lineTo(x + 3.5, y); c.lineTo(x - 3.5, y); c.fill();
    c.font = '900 8px Cairo, sans-serif'; c.fillStyle = '#7A4A22'; c.textAlign = 'center'; c.fillText('ش', x, y - 15); }
  // الإطار
  c.strokeStyle = '#7A4A22'; c.lineWidth = 3; rr(c, 3, 3, CW - 6, CH - 6, 13); c.stroke(); c.strokeStyle = '#D9A63A'; c.lineWidth = 1.2; rr(c, 7, 7, CW - 14, CH - 14, 10); c.stroke();
  return { y: Y(d.player.y) / CH };
}
