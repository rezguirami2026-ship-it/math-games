// البطل: حركة بالنقر أو بالأسهم، مع تصادم ينزلق حول المباني
export function createPlayer(st) {
  return { x: st.player.x, y: st.player.y, dir: st.player.dir || 'left', phase: 0, moving: false, target: null, onArrive: null, speed: 150, act: null };
}
export function updatePlayer(p, dt, keys, blocked) {
  let vx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), vy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  if (vx || vy) { p.target = null; p.route = null; p.onArrive = null; }
  else if (p.target) {
    const dx = p.target.x - p.x, dy = p.target.y - p.y, d = Math.hypot(dx, dy);
    if (d < 4) {
      if (p.route && p.route.length > 1) { p.route.shift(); p.target = p.route[0]; return; }   // النقطة التالية في الطريق
      p.route = null; p.target = null; p.moving = false; const f = p.onArrive; p.onArrive = null; if (f) f(); return;
    }
    vx = dx / d; vy = dy / d;
  }
  const len = Math.hypot(vx, vy);
  if (!len) { p.moving = false; return; }
  vx /= len; vy /= len;
  const step = p.speed * dt, ox = p.x, oy = p.y;
  if (!blocked(p.x + vx * step, p.y)) p.x += vx * step;
  if (!blocked(p.x, p.y + vy * step)) p.y += vy * step;
  const moved = Math.hypot(p.x - ox, p.y - oy);
  if (moved < step * .15 && p.target) { p.target = null; p.route = null; p.onArrive = null; p.moving = false; return; }   // طريق مسدود
  p.moving = moved > .01; p.phase += moved * .17;
  p.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
}
