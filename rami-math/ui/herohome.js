// «بيت البطل»: يكبر مع التقدّم. كل غرفة تُفتح بإكمال وحدة، ويؤثّثها الطالب بالجواهر (كل قطعة تُرسم في مكانها من الغرفة).
// ومن الخارج: يزدان البيت بحديقة وفوانيس وعلم بعدد الغرف المفتوحة (عناصر قائمة تظهر في العرضين).
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';
import { finaleOpen } from '../missions/activity.js';
import { UNITS } from '../content/lessons.js';

/* الغرف: unit = فهرس الوحدة التي تفتحها (-1 مفتوحة دائماً)؛ items: [معرّف، اسم، سعر] بترتيب الرسم */
export const ROOMS = [
  { id: 'majlis', name: 'المجلس', icon: '🛋️', unit: -1, wall: '#F3E4C8', floor: '#C9A27A', items: [['rug', 'سجادة عُمانية', 8], ['cushions', 'وسائد المجلس', 10], ['dallah', 'دلّة القهوة', 6], ['lamp', 'فانوس معلّق', 8]] },
  { id: 'bed', name: 'غرفة النوم', icon: '🛏️', unit: 0, wall: '#E6EEF5', floor: '#B89A7A', items: [['bed', 'سرير مريح', 12], ['chest', 'صندوق مندوس', 10], ['frame', 'لوحة جبل شمس', 8], ['plant', 'نبتة خضراء', 5]] },
  { id: 'library', name: 'المكتبة', icon: '📚', unit: 2, wall: '#EFE6D6', floor: '#A88462', items: [['shelf', 'رفّ الكتب', 12], ['desk', 'طاولة الدراسة', 10], ['globe', 'كرة أرضية', 8], ['board', 'سبّورة الرياضيات', 8]] },
  { id: 'kitchen', name: 'المطبخ', icon: '🍲', unit: 3, wall: '#F5EBDC', floor: '#BFA07E', items: [['stove', 'موقد الطبخ', 10], ['jars', 'جرار الماء', 6], ['dates', 'صينية التمر', 6], ['pots', 'قدور نحاسية', 8]] },
  { id: 'garden', name: 'الحديقة', icon: '🌴', unit: 5, wall: '#BFE3F2', floor: '#8DBB5E', items: [['palm', 'نخلة', 10], ['fountain', 'نافورة', 14], ['swing', 'أرجوحة', 10], ['flowers', 'أحواض الزهور', 6]] },
  { id: 'roof', name: 'السطح', icon: '🌙', unit: 8, wall: '#1F2A55', floor: '#C9B48E', items: [['lights', 'حبل الأضواء', 10], ['scope', 'تلسكوب النجوم', 14], ['flag', 'علم عُمان', 6], ['seat', 'جلسة السطح', 10]] }
];
const st = () => { const s = game.state; s.home = s.home || { items: {} }; return s.home; };
export const roomOpen = r => r.unit < 0 || finaleOpen(r.unit);
export const openRooms = () => ROOMS.filter(roomOpen).length;
const has = id => !!st().items[id];

/* ── رسم الغرفة ── */
function drawRoom(c, r, W, H) {
  const g = c.createLinearGradient(0, 0, 0, H * .62); g.addColorStop(0, r.wall); g.addColorStop(1, shade(r.wall, -12)); c.fillStyle = g; c.fillRect(0, 0, W, H * .62);
  c.fillStyle = r.floor; c.fillRect(0, H * .62, W, H * .38); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += 40) c.fillRect(x, H * .62, 1.5, H * .38);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, H * .62 - 4, W, 6);
  if (r.id === 'roof') { c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { c.globalAlpha = .4 + (i % 3) * .2; c.beginPath(); c.arc((i * 97) % W, (i * 53) % (H * .55), 1.2 + (i % 2), 0, 7); c.fill(); } c.globalAlpha = 1; c.fillStyle = '#FFF2B0'; c.beginPath(); c.arc(W * .82, H * .16, 18, 0, 7); c.fill(); c.fillStyle = '#1F2A55'; c.beginPath(); c.arc(W * .82 + 7, H * .14, 16, 0, 7); c.fill(); }
  else if (r.id === 'garden') { c.fillStyle = '#FFF6D0'; c.beginPath(); c.arc(W * .15, H * .15, 20, 0, 7); c.fill(); }
  else { c.fillStyle = shade(r.wall, -20); [W * .3, W * .7].forEach(x => { c.beginPath(); c.moveTo(x - 26, H * .42); c.lineTo(x - 26, H * .2); c.arc(x, H * .2, 26, Math.PI, 0); c.lineTo(x + 26, H * .42); c.fill(); }); c.fillStyle = '#9FD3EC'; [W * .3, W * .7].forEach(x => { c.beginPath(); c.moveTo(x - 20, H * .4); c.lineTo(x - 20, H * .21); c.arc(x, H * .21, 20, Math.PI, 0); c.lineTo(x + 20, H * .4); c.fill(); }); }
  r.items.forEach(([id], i) => { if (has(id)) ITEM[id](c, W, H); else ghost(c, SLOT[id](W, H), i); });
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, v + k)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
function ghost(c, [x, y, w, h]) { c.save(); c.setLineDash([6, 5]); c.strokeStyle = 'rgba(90,60,20,.45)'; c.lineWidth = 2; c.strokeRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x, y, w, h); c.restore(); c.fillStyle = 'rgba(90,60,20,.55)'; c.font = '900 22px Cairo,sans-serif'; c.textAlign = 'center'; c.fillText('+', x + w / 2, y + h / 2 + 8); }
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
/* موضع كل قطعة [x, y, w, h] من أبعاد الغرفة */
const SLOT = {
  rug: (W, H) => [W * .25, H * .72, W * .5, H * .2], cushions: (W, H) => [W * .05, H * .52, W * .9, H * .14], dallah: (W, H) => [W * .44, H * .62, W * .12, H * .14], lamp: (W, H) => [W * .45, H * .02, W * .1, H * .22],
  bed: (W, H) => [W * .52, H * .48, W * .42, H * .3], chest: (W, H) => [W * .06, H * .58, W * .22, H * .2], frame: (W, H) => [W * .42, H * .08, W * .2, H * .2], plant: (W, H) => [W * .32, H * .5, W * .1, H * .28],
  shelf: (W, H) => [W * .05, H * .1, W * .26, H * .6], desk: (W, H) => [W * .45, H * .5, W * .3, H * .26], globe: (W, H) => [W * .8, H * .44, W * .12, H * .3], board: (W, H) => [W * .42, H * .06, W * .3, H * .22],
  stove: (W, H) => [W * .06, H * .4, W * .22, H * .36], jars: (W, H) => [W * .32, H * .54, W * .18, H * .22], dates: (W, H) => [W * .55, H * .66, W * .18, H * .12], pots: (W, H) => [W * .76, H * .38, W * .18, H * .2],
  palm: (W, H) => [W * .04, H * .1, W * .22, H * .72], fountain: (W, H) => [W * .38, H * .5, W * .24, H * .3], swing: (W, H) => [W * .7, H * .2, W * .22, H * .56], flowers: (W, H) => [W * .3, H * .82, W * .4, H * .12],
  lights: (W, H) => [W * .02, H * .04, W * .96, H * .16], scope: (W, H) => [W * .7, H * .42, W * .16, H * .34], flag: (W, H) => [W * .08, H * .18, W * .16, H * .5], seat: (W, H) => [W * .32, H * .62, W * .32, H * .22]
};
const ITEM = {
  rug(c, W, H) { const [x, y, w, h] = SLOT.rug(W, H); c.fillStyle = '#9E2B25'; rr(c, x, y, w, h, 6); c.fill(); c.strokeStyle = '#E3B04B'; c.lineWidth = 3; rr(c, x + 6, y + 6, w - 12, h - 12, 4); c.stroke(); c.fillStyle = '#1F4E79'; c.beginPath(); c.moveTo(x + w / 2, y + 10); c.lineTo(x + w / 2 + 26, y + h / 2); c.lineTo(x + w / 2, y + h - 10); c.lineTo(x + w / 2 - 26, y + h / 2); c.fill(); },
  cushions(c, W, H) { const [x, y, w, h] = SLOT.cushions(W, H); ['#B0243C', '#2E6B4A', '#1F4E79', '#C9971C', '#7B3F98'].forEach((col, i) => { c.fillStyle = col; rr(c, x + i * w / 5 + 4, y, w / 5 - 8, h, 10); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + i * w / 5 + 10, y + 6, w / 5 - 20, 4); }); c.fillStyle = '#8A5A30'; c.fillRect(x, y + h - 6, w, 8); },
  dallah(c, W, H) { const [x, y, w, h] = SLOT.dallah(W, H), cx = x + w / 2; c.fillStyle = '#D9A13A'; c.beginPath(); c.ellipse(cx, y + h * .65, w * .34, h * .32, 0, 0, 7); c.fill(); c.fillRect(cx - w * .12, y + h * .15, w * .24, h * .3); c.beginPath(); c.moveTo(cx + w * .1, y + h * .4); c.quadraticCurveTo(cx + w * .55, y + h * .2, cx + w * .5, y); c.lineWidth = 4; c.strokeStyle = '#D9A13A'; c.stroke(); c.fillStyle = '#9A6A10'; c.beginPath(); c.arc(cx, y + h * .12, 5, 0, 7); c.fill(); },
  lamp(c, W, H) { const [x, y, w, h] = SLOT.lamp(W, H), cx = x + w / 2; c.strokeStyle = '#5A3A1E'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, y + h * .3); c.stroke(); c.fillStyle = 'rgba(255,200,80,.35)'; c.beginPath(); c.arc(cx, y + h * .65, 34, 0, 7); c.fill(); c.fillStyle = '#C9971C'; c.beginPath(); c.moveTo(cx - 14, y + h * .4); c.lineTo(cx + 14, y + h * .4); c.lineTo(cx + 10, y + h * .9); c.lineTo(cx - 10, y + h * .9); c.closePath(); c.fill(); c.fillStyle = '#FFE08A'; c.fillRect(cx - 7, y + h * .48, 14, h * .32); },
  bed(c, W, H) { const [x, y, w, h] = SLOT.bed(W, H); c.fillStyle = '#7A4A2A'; c.fillRect(x, y + h * .45, w, h * .55); c.fillRect(x, y, 10, h); c.fillStyle = '#F4F1E8'; rr(c, x + 8, y + h * .3, w - 10, h * .3, 8); c.fill(); c.fillStyle = '#2F6FB2'; rr(c, x + w * .35, y + h * .32, w * .63, h * .3, 6); c.fill(); c.fillStyle = '#fff'; rr(c, x + 14, y + h * .18, w * .22, h * .2, 8); c.fill(); },
  chest(c, W, H) { const [x, y, w, h] = SLOT.chest(W, H); c.fillStyle = '#8A5A30'; rr(c, x, y, w, h, 6); c.fill(); c.strokeStyle = '#E3B04B'; c.lineWidth = 3; c.strokeRect(x + 6, y + 6, w - 12, h - 12); c.fillStyle = '#E3B04B'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x + 14 + i * (w - 28) / 4, y + h / 2, 3, 0, 7); c.fill(); } },
  frame(c, W, H) { const [x, y, w, h] = SLOT.frame(W, H); c.fillStyle = '#C9971C'; c.fillRect(x, y, w, h); c.fillStyle = '#9FD3EC'; c.fillRect(x + 6, y + 6, w - 12, h - 12); c.fillStyle = '#8C6448'; c.beginPath(); c.moveTo(x + 6, y + h - 6); c.lineTo(x + w * .4, y + h * .35); c.lineTo(x + w * .6, y + h * .55); c.lineTo(x + w * .8, y + h * .3); c.lineTo(x + w - 6, y + h - 6); c.fill(); },
  plant(c, W, H) { const [x, y, w, h] = SLOT.plant(W, H), cx = x + w / 2; c.fillStyle = '#B5651D'; c.fillRect(cx - w * .3, y + h * .7, w * .6, h * .3); c.fillStyle = '#2E8B57'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(cx + (i - 2.5) * 6, y + h * .4 - (i % 2) * 14, 8, 22, (i - 2.5) * .3, 0, 7); c.fill(); } },
  shelf(c, W, H) { const [x, y, w, h] = SLOT.shelf(W, H); c.fillStyle = '#7A4A2A'; c.fillRect(x, y, w, h); const cols = ['#B0243C', '#1F4E79', '#2E8B57', '#C9971C', '#7B3F98', '#E85D75']; for (let r = 0; r < 4; r++) { c.fillStyle = '#5A3A1E'; c.fillRect(x, y + (r + 1) * h / 4 - 5, w, 5); for (let b = 0; b < 6; b++) { c.fillStyle = cols[(r + b) % 6]; c.fillRect(x + 6 + b * (w - 12) / 6, y + r * h / 4 + 8 + (b % 2) * 4, (w - 12) / 6 - 3, h / 4 - 14 - (b % 2) * 4); } } },
  desk(c, W, H) { const [x, y, w, h] = SLOT.desk(W, H); c.fillStyle = '#8A5A30'; c.fillRect(x, y, w, 10); c.fillRect(x + 6, y, 8, h); c.fillRect(x + w - 14, y, 8, h); c.fillStyle = '#F4F1E8'; c.fillRect(x + w * .2, y - 6, w * .3, 6); c.fillStyle = '#E3B04B'; c.fillRect(x + w * .6, y - 18, 6, 18); c.beginPath(); c.arc(x + w * .6 + 3, y - 20, 10, Math.PI, 0); c.fill(); },
  globe(c, W, H) { const [x, y, w, h] = SLOT.globe(W, H), cx = x + w / 2; c.fillStyle = '#7A4A2A'; c.fillRect(cx - 3, y + h * .5, 6, h * .4); c.fillRect(cx - 14, y + h - 6, 28, 6); c.fillStyle = '#2F9BD6'; c.beginPath(); c.arc(cx, y + h * .32, w * .42, 0, 7); c.fill(); c.fillStyle = '#5DBB63'; c.beginPath(); c.ellipse(cx - 6, y + h * .28, 9, 6, .4, 0, 7); c.fill(); c.beginPath(); c.ellipse(cx + 8, y + h * .4, 6, 8, 0, 0, 7); c.fill(); },
  board(c, W, H) { const [x, y, w, h] = SLOT.board(W, H); c.fillStyle = '#7A4A2A'; c.fillRect(x - 4, y - 4, w + 8, h + 8); c.fillStyle = '#2F4F3F'; c.fillRect(x, y, w, h); c.fillStyle = '#fff'; c.font = '900 20px Cairo,sans-serif'; c.textAlign = 'center'; c.fillText('٣ × ٤ = ١٢', x + w / 2, y + h / 2 + 7); },
  stove(c, W, H) { const [x, y, w, h] = SLOT.stove(W, H); c.fillStyle = '#B8AE98'; rr(c, x, y, w, h, 6); c.fill(); c.fillStyle = '#3A2A20'; c.beginPath(); c.arc(x + w / 2, y + h * .65, w * .28, Math.PI, 0); c.fill(); c.fillStyle = '#FF8A1E'; c.beginPath(); c.arc(x + w / 2, y + h * .65, w * .16, Math.PI, 0); c.fill(); c.fillStyle = '#5E564C'; c.beginPath(); c.ellipse(x + w / 2, y + 6, w * .3, 8, 0, 0, 7); c.fill(); },
  jars(c, W, H) { const [x, y, w, h] = SLOT.jars(W, H); [0, 1, 2].forEach(i => { const cx = x + w * (.2 + i * .3), s = 1 - i * .12; c.fillStyle = ['#B5651D', '#C27A48', '#A8582A'][i]; c.beginPath(); c.ellipse(cx, y + h * .6, w * .14 * s, h * .38 * s, 0, 0, 7); c.fill(); c.fillRect(cx - 5, y + h * .14, 10, h * .14); }); },
  dates(c, W, H) { const [x, y, w, h] = SLOT.dates(W, H); c.fillStyle = '#C9971C'; c.beginPath(); c.ellipse(x + w / 2, y + h * .6, w / 2, h * .4, 0, 0, 7); c.fill(); c.fillStyle = '#5A2A10'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(x + w * .2 + (i % 5) * w * .15, y + h * .45 + Math.floor(i / 5) * 8, 6, 4, .4, 0, 7); c.fill(); } },
  pots(c, W, H) { const [x, y, w, h] = SLOT.pots(W, H); c.fillStyle = '#7A4A2A'; c.fillRect(x, y, w, 5); [0, 1, 2].forEach(i => { c.fillStyle = '#C87533'; c.beginPath(); c.arc(x + w * (.2 + i * .3), y + 22, 11, 0, Math.PI); c.fill(); c.fillRect(x + w * (.2 + i * .3) - 1, y + 3, 2, 10); }); },
  palm(c, W, H) { const [x, y, w, h] = SLOT.palm(W, H), cx = x + w / 2; c.fillStyle = '#8A5A30'; c.fillRect(cx - 6, y + h * .25, 12, h * .75); c.fillStyle = '#2E8B57'; for (let i = 0; i < 7; i++) { c.save(); c.translate(cx, y + h * .25); c.rotate(-Math.PI / 2 + (i - 3) * .45); c.beginPath(); c.ellipse(w * .32, 0, w * .34, 9, 0, 0, 7); c.fill(); c.restore(); } c.fillStyle = '#B5651D'; c.beginPath(); c.arc(cx, y + h * .3, 6, 0, 7); c.fill(); },
  fountain(c, W, H) { const [x, y, w, h] = SLOT.fountain(W, H), cx = x + w / 2; c.fillStyle = '#B8AE98'; c.beginPath(); c.ellipse(cx, y + h * .78, w / 2, h * .2, 0, 0, 7); c.fill(); c.fillStyle = '#4FB6FF'; c.beginPath(); c.ellipse(cx, y + h * .74, w * .42, h * .13, 0, 0, 7); c.fill(); c.fillStyle = '#B8AE98'; c.fillRect(cx - 5, y + h * .25, 10, h * .5); c.strokeStyle = '#9FDCFF'; c.lineWidth = 3; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(cx, y + h * .25); c.quadraticCurveTo(cx + s * w * .3, y, cx + s * w * .38, y + h * .7); c.stroke(); }); },
  swing(c, W, H) { const [x, y, w, h] = SLOT.swing(W, H); c.strokeStyle = '#7A4A2A'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w * .15, y); c.lineTo(x + w * .85, y); c.lineTo(x + w, y + h); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * .35, y); c.lineTo(x + w * .35, y + h * .7); c.moveTo(x + w * .65, y); c.lineTo(x + w * .65, y + h * .7); c.stroke(); c.fillStyle = '#E2475C'; c.fillRect(x + w * .3, y + h * .7, w * .4, 8); },
  flowers(c, W, H) { const [x, y, w, h] = SLOT.flowers(W, H); c.fillStyle = '#7A5230'; c.fillRect(x, y + h * .4, w, h * .6); for (let i = 0; i < 12; i++) { c.fillStyle = ['#E85D75', '#FFC23D', '#9C6BFF', '#fff'][i % 4]; c.beginPath(); c.arc(x + 10 + i * (w - 20) / 11, y + h * .35 - (i % 2) * 5, 6, 0, 7); c.fill(); } },
  lights(c, W, H) { const [x, y, w, h] = SLOT.lights(W, H); c.strokeStyle = '#333'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 10); c.quadraticCurveTo(x + w / 2, y + h, x + w, y + 10); c.stroke(); for (let i = 1; i < 14; i++) { const u = i / 14, px = x + w * u, py = y + 10 + Math.sin(Math.PI * u) * (h - 18); c.fillStyle = ['#FFD54A', '#FF7AB6', '#7CD6FF', '#7BE495'][i % 4]; c.beginPath(); c.arc(px, py + 5, 5, 0, 7); c.fill(); } },
  scope(c, W, H) { const [x, y, w, h] = SLOT.scope(W, H); c.strokeStyle = '#5E6874'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * .5, y + h * .5); c.lineTo(x + w * .2, y + h); c.moveTo(x + w * .5, y + h * .5); c.lineTo(x + w * .8, y + h); c.stroke(); c.save(); c.translate(x + w * .5, y + h * .45); c.rotate(-.7); c.fillStyle = '#C9971C'; c.fillRect(-6, -h * .4, 12, h * .55); c.fillStyle = '#1F2A55'; c.fillRect(-8, -h * .42, 16, 6); c.restore(); },
  flag(c, W, H) { const [x, y, w, h] = SLOT.flag(W, H); c.fillStyle = '#7A4A2A'; c.fillRect(x, y, 5, h); const fx = x + 5, fy = y + 4, fw = w * .9, fh = h * .45; c.fillStyle = '#DB161B'; c.fillRect(fx, fy, fw * .3, fh); c.fillStyle = '#fff'; c.fillRect(fx + fw * .3, fy, fw * .7, fh / 3); c.fillStyle = '#DB161B'; c.fillRect(fx + fw * .3, fy + fh / 3, fw * .7, fh / 3); c.fillStyle = '#008000'; c.fillRect(fx + fw * .3, fy + fh * 2 / 3, fw * .7, fh / 3); },
  seat(c, W, H) { const [x, y, w, h] = SLOT.seat(W, H); c.fillStyle = '#7B3F98'; rr(c, x, y + h * .3, w, h * .7, 10); c.fill(); ['#FFC23D', '#E85D75', '#2F9BD6'].forEach((col, i) => { c.fillStyle = col; rr(c, x + 8 + i * (w - 16) / 3, y, (w - 16) / 3 - 6, h * .45, 8); c.fill(); }); }
};

let cur = 'majlis';
export function openHome(openWardrobe) {
  const s = game.state, el = document.getElementById('panel'); game.busy = true; sfx('talk');
  if (!roomOpen(ROOMS.find(r => r.id === cur))) cur = 'majlis';
  const draw = msg => {
    const r = ROOMS.find(x => x.id === cur), gm = s.gems || 0, n = ROOMS.reduce((k, x) => k + x.items.filter(([id]) => has(id)).length, 0);
    el.innerHTML = `<div class="sheet home"><h3>🏠 بيت ${s.hero.name}</h3>
      <div class="hmTop"><span>🏠 الغرف: <b>${ar(openRooms())} / ${ar(ROOMS.length)}</b></span><span>🪑 القطع: <b>${ar(n)} / ${ar(ROOMS.length * 4)}</b></span><span>💎 <b>${ar(gm)}</b></span></div>
      <div class="hmTabs">${ROOMS.map(x => `<button class="${x.id === cur ? 'on' : ''} ${roomOpen(x) ? '' : 'lock'}" data-r="${x.id}">${roomOpen(x) ? x.icon : '🔒'} ${x.name}</button>`).join('')}</div>
      <canvas id="hmCv" width="680" height="380"></canvas>
      ${msg ? `<div class="hmMsg">${msg}</div>` : ''}
      <div class="hmItems">${r.items.map(([id, name, price]) => `<div class="hmIt ${has(id) ? 'own' : ''}"><b>${name}</b>${has(id) ? '<small>✓ في مكانها</small>' : `<button class="act go" data-buy="${id}" ${gm < price ? 'disabled' : ''}>ضعها ${ar(price)} 💎</button>`}</div>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="hmWard">🚪 خزانة البطل</button><button class="act" id="hmOut">اخرج إلى القرية</button></div></div>`;
    el.classList.add('on');
    const cv = document.getElementById('hmCv'), c = cv.getContext('2d'); drawRoom(c, r, cv.width, cv.height);
    el.querySelectorAll('[data-r]').forEach(b => b.onclick = e => { e.stopPropagation(); const x = ROOMS.find(q => q.id === b.dataset.r);
      if (!roomOpen(x)) { sfx('cough'); return draw(`🔒 تُفتح «${x.name}» بإكمال وحدة «${UNITS[x.unit].title}» (الفصل ${UNITS[x.unit].term === 1 ? 'الأول' : 'الثاني'}).`); }
      cur = x.id; sfx('click'); draw(); });
    el.querySelectorAll('[data-buy]').forEach(b => b.onclick = e => { e.stopPropagation(); const it = r.items.find(([id]) => id === b.dataset.buy); if (!it || (s.gems || 0) < it[2]) return;
      s.gems -= it[2]; st().items[it[0]] = Date.now(); bus.emit('gems'); bus.emit('save'); sfx('win'); draw(`✨ وضعتَ «${it[1]}» في ${r.name}!`); });
    document.getElementById('hmOut').onclick = e => { e.stopPropagation(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
    document.getElementById('hmWard').onclick = e => { e.stopPropagation(); el.classList.remove('on'); el.innerHTML = ''; game.busy = false; setTimeout(openWardrobe, 60); };
  };
  draw();
}

/* ── خارج البيت: زينة تزداد مع الغرف المفتوحة (house = مستطيل بيت البطل) ── */
export function homeExterior(house, view) {
  const k = game.state ? openRooms() : 0, out = []; if (k < 2) return out;
  const x0 = house.x, y = house.y + house.h + 8, x1 = house.x + house.w;
  if (view && (x1 < view.x - 100 || x0 > view.x + view.w + 100 || y < view.y - 100 || y > view.y + view.h + 160)) return out;
  out.push({ y: y + 2, x: x0 + 18, draw: c => { c.fillStyle = '#7A5230'; c.fillRect(x0 + 4, y - 4, 30, 10); ['#E85D75', '#FFC23D', '#9C6BFF'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(x0 + 10 + i * 10, y - 6, 4.5, 0, 7); c.fill(); }); } });
  if (k >= 3) out.push({ y: y + 2, x: x1 - 18, draw: c => { c.fillStyle = '#7A5230'; c.fillRect(x1 - 34, y - 4, 30, 10); ['#FFC23D', '#E85D75', '#fff'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(x1 - 28 + i * 10, y - 6, 4.5, 0, 7); c.fill(); }); } });
  if (k >= 4) [x0 + 46, x1 - 46].forEach(px => out.push({ y: y + 1, x: px, draw: c => { const t = performance.now() / 1000; c.fillStyle = '#3D3A3A'; c.fillRect(px - 1.5, y - 40, 3, 40); c.fillStyle = `rgba(255,190,80,${.3 + Math.sin(t * 3 + px) * .08})`; c.beginPath(); c.arc(px, y - 44, 12, 0, 7); c.fill(); c.fillStyle = '#E3A21A'; c.fillRect(px - 5, y - 50, 10, 12); } }));
  if (k >= 5) out.push({ y: y - 1, x: x0 + 76, draw: c => { c.fillStyle = '#8A5A30'; c.fillRect(x0 + 74, y - 34, 5, 34); c.fillStyle = '#2E8B57'; for (let i = 0; i < 6; i++) { c.save(); c.translate(x0 + 76, y - 34); c.rotate(-Math.PI / 2 + (i - 2.5) * .5); c.beginPath(); c.ellipse(13, 0, 14, 4, 0, 0, 7); c.fill(); c.restore(); } } });
  if (k >= 6) out.push({ y: y + 3, x: x1 - 6, draw: c => { const fx = x1 - 6, fy = y - 62; c.fillStyle = '#5A3A1E'; c.fillRect(fx, fy, 3, 62); c.fillStyle = '#DB161B'; c.fillRect(fx + 3, fy, 8, 16); c.fillStyle = '#fff'; c.fillRect(fx + 11, fy, 18, 5.3); c.fillStyle = '#DB161B'; c.fillRect(fx + 11, fy + 5.3, 18, 5.3); c.fillStyle = '#008000'; c.fillRect(fx + 11, fy + 10.6, 18, 5.4); } });
  return out;
}
