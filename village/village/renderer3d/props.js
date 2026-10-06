// قطع الشارع والساحة: أعمدة إنارة بفوانيس تضيء، مقاعد، والبئر الحجرية بإطارها الخشبي ودلوها
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, cyl, sphere } from './geom.js';
import { material } from './textures.js';

/* أعمدة الإنارة: تعيد { group, setLit(on) } — الفانوس يتوهج وضوء نقطي صغير عند الإضاءة */
export function streetLamps(list) {
  const P = new Parts(), glassOff = new THREE.MeshStandardMaterial({ color: '#C9D3DA', roughness: .2, metalness: .1, transparent: true, opacity: .75 });
  const glass = [];
  const metal = material('metal', '#3D4250', { rough: .5, metal: .7 }), brass = material('metal', '#B8862E', { rough: .35, metal: .9 });
  list.forEach(({ x, y }) => {
    P.add(material('stone', '#BBA684'), box(10, 8, 10, x, 4, y, 1));
    P.add(metal, cyl(1.5, 2.2, 78, x, 47, y, 8)); P.add(metal, cyl(3, 3, 3, x, 10, y, 8));
    P.add(metal, box(16, 1.6, 1.6, x + 7, 84, y)); P.add(brass, cyl(.6, 4.5, 4, x + 14, 82, y, 8));
    P.add(brass, cyl(5.5, 1.5, 5, x + 14, 92, y, 6)); P.add(brass, sphere(1.4, x + 14, 95.5, y));
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.2, 9, 6), glassOff); gl.position.set(x + 14, 85.5, y); glass.push(gl);
  });
  const g = P.build(); glass.forEach(m => g.add(m));
  const glow = new THREE.MeshStandardMaterial({ color: '#FFE3A0', emissive: '#FFB64A', emissiveIntensity: 1.6, roughness: .4 });
  const lights = list.map(({ x, y }) => { const l = new THREE.PointLight('#FFC870', 0, 140, 1.6); l.position.set(x + 14, 84, y); g.add(l); return l; });
  let on = null;
  return { group: g, setLit(v) { if (v === on) return; on = v; glass.forEach(m => m.material = v ? glow : glassOff); lights.forEach(l => l.intensity = v ? 2200 : 0); } };
}

/* مقعد: ألواح خشبية على قوائم معدنية */
export function bench(P, x, y) {
  const wd = material('wood', '#9C6438'), mt = material('metal', '#3D3A3A', { rough: .6, metal: .5 });
  [-15, 15].forEach(dx => { P.add(mt, box(2.4, 13, 12, x + dx, 6.5, y - 4)); });
  [0, 4.2, 8.4].forEach(dz => P.add(wd, box(40, 2, 3.6, x, 13.5, y - 9 + dz, .6)));
  [0, 4.4].forEach(dy => P.add(wd, box(40, 3.4, 1.8, x, 19 + dy, y - 11.5, .6)));
}

/* البئر: حلقة حجرية مخروطة، فوهة داكنة (أو ماء حين تعود المياه)، قائمان، عارضة، بكرة، حبل ودلو */
export function well(cx, cy, r, full) {
  const P = new Parts(), st = material('stone', '#B9A27C'), wd = material('wood', '#7A4A2A');
  const ring = new THREE.LatheGeometry([new THREE.Vector2(r - 5, 0), new THREE.Vector2(r + 2, 0), new THREE.Vector2(r + 1, 22), new THREE.Vector2(r + 3, 24), new THREE.Vector2(r - 6, 24), new THREE.Vector2(r - 5, 2)], 28);
  ring.translate(cx, 0, cy); P.add(st, ring, { scale: 1 / 40 });
  P.add(material('stone', '#A8926C'), cyl(r + 9, r + 11, 5, cx, 2.5, cy, 28));
  [-1, 1].forEach(sd => { P.add(wd, box(4, 60, 4, cx + sd * (r - 2), 30 + 22, cy, .8)); });
  const g = P.build();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, r * 2 + 8, 8), wd); beam.rotation.z = Math.PI / 2; beam.position.set(cx, 80, cy); beam.castShadow = true; g.add(beam);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(5, 1.2, 6, 16), wd); wheel.position.set(cx, 80, cy); g.add(wheel);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 36, 5), material('flat', '#8A6A44')); rope.position.set(cx, 62, cy); g.add(rope);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.5, 7, 10), material('metal', '#7A8792', { rough: .5, metal: .6 })); bucket.position.set(cx, 42, cy); bucket.castShadow = true; g.add(bucket);
  const water = new THREE.Mesh(new THREE.CircleGeometry(r - 5, 24), new THREE.MeshStandardMaterial({ color: full ? '#2E7FA8' : '#1C1612', roughness: full ? .15 : 1 }));
  water.rotation.x = -Math.PI / 2; water.position.set(cx, full ? 18 : 6, cy); g.add(water);
  g.userData.setFull = v => { water.material.color.set(v ? '#2E7FA8' : '#1C1612'); water.material.roughness = v ? .15 : 1; water.position.y = v ? 18 : 6; };
  return g;
}
