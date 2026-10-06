// أدوات الهندسة: تجميع القطع حسب المادة ثم دمجها (draw call واحد لكل مادة)، وإحداثيات خامات بمقياس العالم
import * as THREE from '../lib/three/three.module.min.js';
import { mergeGeometries } from '../lib/three/addons/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from '../lib/three/addons/RoundedBoxGeometry.js';

/* إحداثيات خامة من موضع الرأس في العالم: الخامة تتصل بين القطع ولا تتمدد مع حجم الجدار */
export function worldUV(geo, scale = 1 / 110) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v; if (ay >= ax && ay >= az) { u = x; v = z; } else if (ax >= az) { u = z; v = y; } else { u = x; v = y; }
    uv[i * 2] = u * scale; uv[i * 2 + 1] = v * scale;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}
/* يوحّد الخصائص قبل الدمج (بعض الأشكال بلا uv أو بفهرس) */
function norm(g) { let x = g.index ? g.toNonIndexed() : g; ['uv1', 'uv2'].forEach(a => x.deleteAttribute && x.getAttribute(a) && x.deleteAttribute(a)); if (!x.attributes.normal) x.computeVertexNormals(); return x; }

/* مجمّع: add(مادة، هندسة) ثم build() يعيد Group بشبكة واحدة لكل مادة */
export class Parts {
  constructor() { this.by = new Map(); }
  add(mat, geo, { uv = true, scale } = {}) {
    if (uv) worldUV(geo, scale);
    if (!this.by.has(mat)) this.by.set(mat, []);
    this.by.get(mat).push(norm(geo));
    return geo;
  }
  build({ cast = true, receive = true, ao = true } = {}) {
    const g = new THREE.Group();
    this.by.forEach((list, mat) => {
      if (ao) groundAO(mat);
      const geo = mergeGeometries(list, false); if (!geo) return;
      const m = new THREE.Mesh(geo, mat); m.castShadow = cast && !mat.transparent; m.receiveShadow = receive; g.add(m);
    });
    return g;
  }
}

/* تعتيق القاعدة: كل ما يقترب من الأرض يغمق تدريجياً (بديل خفيف للإطباق المحيطي)، وخطوط خفيفة من الأعلى */
export function groundAO(mat) {
  if (mat.userData.ao) return; mat.userData.ao = 1;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWY;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWY;').replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= mix(0.62, 1.0, smoothstep(0.0, 26.0, vWY)) * mix(0.93, 1.0, smoothstep(26.0, 60.0, vWY));');
  };
  mat.customProgramCacheKey = () => 'ao' + (mat.uuid);
  mat.needsUpdate = true;
}
/* يضيّق الجدار نحو الأعلى قليلاً (كبيوت الطين العُمانية) */
export function taper(geo, cx, cz, y0, H, k) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = Math.max(0, (p.getY(i) - y0) / H); p.setX(i, cx + (p.getX(i) - cx) * (1 - k * t)); p.setZ(i, cz + (p.getZ(i) - cz) * (1 - k * t)); }
  geo.computeVertexNormals(); return geo;
}
/* صندوق بمركز (x, y, z) — y هو الارتفاع */
export function box(w, h, d, x, y, z, r = 0) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - .01, h / 2 - .01, d / 2 - .01)) : new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z); return g;
}
export function cyl(rt, rb, h, x, y, z, seg = 16, open = false) { const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open); g.translate(x, y, z); return g; }
export function sphere(r, x, y, z, ws = 10, hs = 8, phiLen = Math.PI * 2, thetaLen = Math.PI) { const g = new THREE.SphereGeometry(r, ws, hs, 0, phiLen, 0, thetaLen); g.translate(x, y, z); return g; }

/* قوس عُماني مدبّب قليلاً: قاعدة مستطيلة وقمة من قوسين يلتقيان */
export function archShape(w, h, point = .18) {
  const s = new THREE.Shape(), r = w / 2, sh = h - r * (1 + point);
  s.moveTo(-r, 0); s.lineTo(-r, sh);
  s.quadraticCurveTo(-r, sh + r * 1.05, 0, h); s.quadraticCurveTo(r, sh + r * 1.05, r, sh);
  s.lineTo(r, 0); s.lineTo(-r, 0);
  return s;
}
export function archPath(w, h, point = .18) {   // نفس القوس كثقب داخل شكل آخر
  const p = new THREE.Path(), r = w / 2, sh = h - r * (1 + point);
  p.moveTo(-r, 0); p.lineTo(-r, sh); p.quadraticCurveTo(-r, sh + r * 1.05, 0, h); p.quadraticCurveTo(r, sh + r * 1.05, r, sh); p.lineTo(r, 0); p.lineTo(-r, 0);
  return p;
}
/* بثق شكل نحو +z بعمق depth، ثم وضعه عند (x, y, z) */
export function extrude(shape, depth, x, y, z, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: 10 });
  g.translate(x, y, z); return g;
}
/* شُرفة مسنّنة عُمانية بثلاث درجات */
let merlonGeo = null;
export function merlon(x, y, z, rotY = 0, s = 1) {
  if (!merlonGeo) {
    const sh = new THREE.Shape(); const P = [[-5, 0], [5, 0], [5, 5], [3.6, 5], [3.6, 9], [1.8, 9], [1.8, 12.5], [-1.8, 12.5], [-1.8, 9], [-3.6, 9], [-3.6, 5], [-5, 5]];
    P.forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b)); sh.closePath();
    merlonGeo = new THREE.ExtrudeGeometry(sh, { depth: 4.5, bevelEnabled: false }); merlonGeo.translate(0, 0, -2.25);
  }
  const g = merlonGeo.clone(); g.scale(s, s, s); g.rotateY(rotY); g.translate(x, y, z); return g;
}
