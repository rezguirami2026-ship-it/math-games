// حيوانات ثلاثية الأبعاد بمفاصل بسيطة: الجمل «سهيل» رفيق البطل (أرجل تمشي بخطوات متناوبة، رقبة ورأس يتمايلان، وبطانية مزخرفة).
import * as THREE from '../lib/three/three.module.min.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .8 }, o));
export function buildCamel() {
  const fur = M('#D4A262'), furD = M('#B88446'), hoof = M('#5A3A1E'), dark = M('#2A1B1B'), red = M('#C8102E'), gold = M('#FFC23D', { metalness: .3, roughness: .5 }), green = M('#1F8A3B');
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const add = (g, geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  // الجسم والسنام
  const torso = add(body, new THREE.SphereGeometry(1, 18, 12), fur, 0, 34, 0); torso.scale.set(11, 10, 19);
  const hump = add(body, new THREE.SphereGeometry(1, 16, 12), fur, 0, 45, -2); hump.scale.set(8, 9, 9);
  // البطانية: أحمر بخطوط ذهبية وخضراء وشراريب
  const blanket = add(body, new THREE.CylinderGeometry(11.6, 11.6, 16, 18, 1, true, -Math.PI * .5, Math.PI), red, 0, 37, 1); blanket.rotation.z = Math.PI / 2; blanket.rotation.y = Math.PI / 2; blanket.material.side = THREE.DoubleSide;
  const band = add(body, new THREE.CylinderGeometry(11.8, 11.8, 3, 18, 1, true, -Math.PI * .5, Math.PI), gold, 0, 37, -2); band.rotation.copy(blanket.rotation); band.material.side = THREE.DoubleSide;
  const band2 = add(body, new THREE.CylinderGeometry(11.9, 11.9, 2, 18, 1, true, -Math.PI * .5, Math.PI), green, 0, 37, 4); band2.rotation.copy(blanket.rotation); band2.material.side = THREE.DoubleSide;
  for (let i = 0; i < 5; i++) { add(body, new THREE.SphereGeometry(1.4, 6, 5), i % 2 ? gold : M('#FFFFFF'), -11.5, 30, -6 + i * 3.5); add(body, new THREE.SphereGeometry(1.4, 6, 5), i % 2 ? gold : M('#FFFFFF'), 11.5, 30, -6 + i * 3.5); }
  // الرقبة والرأس
  const neck = new THREE.Group(); neck.position.set(0, 38, 15); body.add(neck);
  const n1 = add(neck, new THREE.CylinderGeometry(3.6, 5, 22, 10), fur, 0, 9, 4); n1.rotation.x = .55;
  const head = new THREE.Group(); head.position.set(0, 20, 12); neck.add(head);
  const skull = add(head, new THREE.SphereGeometry(1, 14, 10), fur, 0, 0, 0); skull.scale.set(4.6, 4.2, 6);
  const snout = add(head, new THREE.SphereGeometry(1, 12, 8), M('#E6C08A'), 0, -1, 6); snout.scale.set(3.4, 3, 3.6);
  [-1, 1].forEach(s => { add(head, new THREE.SphereGeometry(1.1, 8, 6), dark, s * 3.4, 1.6, 3); const ear = add(head, new THREE.ConeGeometry(1.4, 4, 6), furD, s * 3.2, 4.6, -1.6); ear.rotation.z = -s * .5; });
  // الذيل
  const tail = add(body, new THREE.CylinderGeometry(.9, .5, 12, 6), furD, 0, 32, -19); tail.rotation.x = .5;
  // الأرجل: ورك وركبة لكل رجل
  const legs = [[-6, 9], [6, 9], [-6, -10], [6, -10]].map(([x, z]) => {
    const hip = new THREE.Group(); hip.position.set(x, 30, z); body.add(hip);
    add(hip, new THREE.CylinderGeometry(2.8, 2.2, 15, 8), fur, 0, -7.5, 0);
    const knee = new THREE.Group(); knee.position.set(0, -15, 0); hip.add(knee);
    add(knee, new THREE.CylinderGeometry(2, 1.8, 14, 8), furD, 0, -7, 0); const h = add(knee, new THREE.CylinderGeometry(2.4, 2.6, 2.5, 8), hoof, 0, -14.4, .6); h.scale.z = 1.3;
    return { hip, knee };
  });
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { root, body, neck, head, tail, legs, yaw: 0, phase: 0 };
}
/* st = { x, y (موضع اللعبة), dir: 1|-1 (يمين/يسار), moving, phase, k (الحجم) } */
export function animateCamel(C, st, dt, t) {
  C.root.position.set(st.x, 0, st.y); C.root.scale.setScalar(st.k || 1);
  // الاتجاه: من حركته الفعلية، وإلا يميناً/يساراً، وبدوران ناعم
  let want = C.yaw;
  if (C.lx != null && (st.x - C.lx) ** 2 + (st.y - C.ly) ** 2 > .04) want = Math.atan2(st.x - C.lx, st.y - C.ly); else if (!st.moving) want = st.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
  C.lx = st.x; C.ly = st.y;
  let d = want - C.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); C.yaw += d * Math.min(1, dt * 6); C.root.rotation.y = C.yaw;
  // المشية: رجلان متقابلتان معاً، وتمايل خفيف للجسم والرقبة
  const ph = st.phase || 0, mv = st.moving ? 1 : 0, sw = Math.sin(ph * 1.6) * .55 * mv;
  C.legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? sw : -sw; L.hip.rotation.x += (s - L.hip.rotation.x) * Math.min(1, dt * 14); L.knee.rotation.x += ((mv ? Math.max(0, -s) * .9 : 0) - L.knee.rotation.x) * Math.min(1, dt * 14); });
  C.body.position.y = mv ? Math.abs(Math.sin(ph * 1.6)) * 1.4 : Math.sin(t * 1.6) * .25;
  C.neck.rotation.x = (mv ? Math.sin(ph * 3.2) * .08 : Math.sin(t * 1.1) * .05);
  C.head.rotation.y = mv ? 0 : Math.sin(t * .7) * .25;
  C.tail.rotation.z = Math.sin(t * 2.4) * .3;
}
