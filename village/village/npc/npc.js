// أهل القرية: يتجولون، يلتفتون إلى البطل، ويطلبون المساعدة
import { drawHuman } from '../character/human.js';
export function makeNpcs() {
  return [
    { id: 'salem', name: 'العم سالم', role: 'سائق القافلة', kind: 'man', robe: '#F4F1E8', accent: '#2F6FB2', skin: '#C98E5F', beard: '#6B6B6B', x: 440, y: 880, home: { x: 440, y: 885, r: 70 } },
    { id: 'umkhalid', name: 'أم خالد', role: 'من أهل القرية', kind: 'woman', robe: '#3E7C6B', accent: '#7B3F98', skin: '#D9A374', x: 1030, y: 520, home: { x: 1020, y: 525, r: 60 } },
    { id: 'yousef', name: 'يوسف', role: 'ابن المزارع', kind: 'boy', robe: '#F7F5EF', accent: '#C0392B', skin: '#B97F52', x: 330, y: 1000, home: { x: 330, y: 1010, r: 110 } },
    { id: 'hamad', name: 'العم حمد', role: 'المزارع', kind: 'man', robe: '#E9E1CF', accent: '#B5651D', skin: '#B97F52', beard: '#2B2B2B', x: 1160, y: 930, home: { x: 1160, y: 930, r: 140 }, needs: 'delivered' }
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
