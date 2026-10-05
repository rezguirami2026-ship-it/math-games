// أهل القرية: يتجولون، يلتفتون إلى البطل، ويطلبون المساعدة
import { drawHuman } from '../character/human.js';
export function makeNpcs() {
  return [
    { id: 'salem', name: 'العم سالم', role: 'سائق القافلة', kind: 'man', robe: '#F4F1E8', accent: '#2F6FB2', skin: '#C98E5F', beard: '#6B6B6B', x: 440, y: 880, home: { x: 440, y: 885, r: 70 } },
    { id: 'umkhalid', name: 'أم خالد', role: 'من أهل القرية', kind: 'woman', robe: '#3E7C6B', accent: '#7B3F98', skin: '#D9A374', x: 1030, y: 520, home: { x: 1020, y: 525, r: 60 } },
    { id: 'yousef', name: 'يوسف', role: 'ابن المزارع', kind: 'boy', robe: '#F7F5EF', accent: '#C0392B', skin: '#B97F52', x: 520, y: 990, home: { x: 520, y: 995, r: 70 } },
    { id: 'naser', name: 'العم ناصر', role: 'صاحب الدكان', kind: 'man', robe: '#EFE6D2', accent: '#2E8B57', skin: '#C98E5F', beard: '#4A4A4A', x: 210, y: 1000, home: { x: 210, y: 996, r: 14 } },
    { id: 'hamad', name: 'العم حمد', role: 'المزارع', kind: 'man', robe: '#E9E1CF', accent: '#B5651D', skin: '#B97F52', beard: '#2B2B2B', x: 1160, y: 930, home: { x: 1160, y: 930, r: 140 } },
    { id: 'saeed', name: 'سعيد', role: 'ساعي البريد', kind: 'man', robe: '#DCE6F0', accent: '#C0392B', skin: '#D9A374', x: 640, y: 1310, home: { x: 640, y: 1312, r: 16 } },
    { id: 'mubarak', name: 'مبارك', role: 'النجار', kind: 'man', robe: '#E9DCC3', accent: '#8B5A2B', skin: '#C98E5F', beard: '#5A5A5A', x: 1636, y: 336, home: { x: 1636, y: 338, r: 12 } },
    { id: 'khalid', name: 'المدرب خالد', role: 'مدرب الفريق', kind: 'man', robe: '#DCEFE3', accent: '#2E8B57', skin: '#B97F52', x: 2060, y: 484, home: { x: 2062, y: 486, r: 18 } },
    { id: 'abdullah', name: 'عبدالله', role: 'ناظر المحطة', kind: 'man', robe: '#E1E6EE', accent: '#2F6FB2', skin: '#D9A374', beard: '#3A3A3A', x: 2070, y: 800, home: { x: 2072, y: 802, r: 12 } },
    { id: 'shaikha', name: 'الجدة شيخة', role: 'منظمة المهرجان', kind: 'woman', robe: '#8E3B5E', accent: '#E3B04B', skin: '#C98E5F', x: 2046, y: 1068, home: { x: 2046, y: 1070, r: 16 } },
    { id: 'juma', name: 'جمعة', role: 'الراعي', kind: 'man', robe: '#EFE6D2', accent: '#7B3F98', skin: '#B97F52', beard: '#2B2B2B', x: 1600, y: 1530, home: { x: 1600, y: 1532, r: 16 } },
    { id: 'rashed', name: 'راشد', role: 'صاحب الورشة', kind: 'man', robe: '#C9D3DD', accent: '#5E6B78', skin: '#B97F52', beard: '#3A3A3A', x: 1290, y: 1320, home: { x: 1290, y: 1322, r: 16 } }
  ].map(n => Object.assign({ dir: 'down', phase: 0, moving: false, target: null, wait: Math.random() * 2 }, n));
}
export const npcVisible = (n, st) => !n.needs || !!st.world[n.needs];
export function updateNpc(n, dt, player, blocked) {
  if (Math.hypot(player.x - n.x, player.y - n.y) < 85 || n.talking) {
    n.moving = false; n.target = null;
    const dx = player.x - n.x, dy = player.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    return;
  }
  if (!n.target) {
    n.moving = false; n.wait -= dt;
    if (n.wait <= 0) { const a = Math.random() * 6.28, r = Math.random() * n.home.r; n.target = { x: n.home.x + Math.cos(a) * r, y: n.home.y + Math.sin(a) * r * .6 }; }
    return;
  }
  const dx = n.target.x - n.x, dy = n.target.y - n.y, d = Math.hypot(dx, dy);
  if (d < 3) { n.target = null; n.wait = 1.5 + Math.random() * 3; n.moving = false; return; }
  const st = 42 * dt, nx = n.x + dx / d * st, ny = n.y + dy / d * st;
  if (blocked(nx, ny)) { n.target = null; n.wait = 1; return; }
  n.x = nx; n.y = ny; n.moving = true; n.phase += st * .17;
  n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
export const drawNpc = (ctx, n, mark) => drawHuman(ctx, Object.assign({}, n, { mark }));
