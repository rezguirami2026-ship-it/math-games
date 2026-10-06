// الطبيعة: نخيل بتمايل مع الريح (instancing: draw call واحد لكل جزء)، سدر، شجيرات مزهرة، صخور، جبال الحجر البعيدة، سماء وبحر.
import * as THREE from '../lib/three/three.module.min.js';
import { mergeGeometries, mergeVertices } from '../lib/three/addons/BufferGeometryUtils.js';
const smooth = g => { g.deleteAttribute('normal'); g.deleteAttribute('uv'); const m = mergeVertices(g, .01); m.computeVertexNormals(); return m; };   // تنعيم الكتل المستديرة (بلا أوجه مسطحة)
import { material, frondTexture } from './textures.js';

export const wind = { value: 0 };   // الزمن المشترك لتمايل النبات

/* يضيف تمايلاً بالريح لمادة: الإزاحة تزيد مع الارتفاع (فوق bendFrom)، والطور يختلف حسب موضع النسخة */
function windy(mat, bendFrom, amp) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uTime = wind;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float hgt = max(position.y - ${bendFrom.toFixed(1)}, 0.0) / 100.0;
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x * 0.031 + instanceMatrix[3].z * 0.017;
      #else
        float ph = 0.0;
      #endif
      float s = sin(uTime * 1.25 + ph) * 0.6 + sin(uTime * 2.7 + ph * 1.7) * 0.25;
      transformed.x += s * hgt * hgt * ${amp.toFixed(1)};
      transformed.z += cos(uTime * 1.05 + ph) * hgt * hgt * ${(amp * .45).toFixed(1)};`);
  };
  mat.customProgramCacheKey = () => 'windy' + bendFrom + amp;
  return mat;
}

/* ── النخلة: جذع منحنٍ بحلقات، تاج من سعف مقوّس، وعذوق تمر ── */
function palmTemplate(H = 132) {
  const lean = 7;
  const trunk = new THREE.CylinderGeometry(3.6, 5.6, H, 10, 14, false); trunk.translate(0, H / 2, 0);
  const p = trunk.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = y / H, ring = 1 + .1 * Math.max(0, Math.sin(y * 1.1)); p.setX(i, p.getX(i) * ring + lean * k * k); p.setZ(i, p.getZ(i) * ring); }
  trunk.computeVertexNormals();
  const top = new THREE.Vector3(lean, H, 0), fr = [];
  const N = 13;
  for (let i = 0; i < N; i++) {
    const L = 58 + (i % 3) * 8, g = new THREE.PlaneGeometry(22, L, 2, 8); g.translate(0, L / 2, 0);
    const q = g.attributes.position;
    for (let k = 0; k < q.count; k++) { const y = q.getY(k), t = y / L; q.setZ(k, -Math.pow(t, 1.6) * L * .62 + Math.abs(q.getX(k)) * .35); q.setX(k, q.getX(k) * (1 - t * .55)); }   // السعفة تنحني للأسفل وتتقعّر
    g.computeVertexNormals();
    const up = i < 4;   // سعفات علوية أكثر انتصاباً
    g.rotateX(up ? -1.05 : -.42 - (i % 2) * .18); g.rotateY(i / N * Math.PI * 2 + (i % 2) * .2); g.translate(top.x, top.y - 2, top.z);
    fr.push(g);
  }
  const dates = []; for (let k = 0; k < 4; k++) { const a = k * 1.6 + .4, c = new THREE.SphereGeometry(4.2, 7, 5); c.scale(1, 1.4, 1); c.translate(top.x + Math.cos(a) * 6, H - 9, Math.sin(a) * 6); dates.push(c); }
  const crown = new THREE.SphereGeometry(5.5, 8, 6); crown.translate(top.x, H - 1, 0);
  return { trunk: mergeGeometries([trunk, crown]), fronds: mergeGeometries(fr), dates: mergeGeometries(dates), H };
}
let PT = null;
const trunkMat = () => { const m = material('wood', '#8A6238').clone(); m.map = m.map.clone(); m.map.repeat.set(1, 3); m.map.needsUpdate = true; return m; };
/* palms: [{x, y, s?, dry?}] → Group من ثلاث InstancedMesh (جذوع، سعف، تمر) */
export function palms(list, { dry = false } = {}) {
  PT = PT || palmTemplate();
  const g = new THREE.Group(), n = list.length; if (!n) return g;
  const fm = windy(new THREE.MeshStandardMaterial({ map: frondTexture(), alphaTest: .45, side: THREE.DoubleSide, roughness: .8, color: dry ? '#C9A35E' : '#FFFFFF' }), 70, 9);
  const tm = windy(trunkMat(), 30, 3), dm = windy(new THREE.MeshStandardMaterial({ color: dry ? '#8A5A2A' : '#D9822B', roughness: .6 }), 30, 3);
  const meshes = [[PT.trunk, tm], [PT.fronds, fm], [PT.dates, dm]].map(([geo, mat]) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; });
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), E = new THREE.Euler();
  list.forEach((p, i) => {
    const r = Math.sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453, f = r - Math.floor(r), sc = (p.s || 1) * (.86 + f * .28);
    E.set(0, f * Math.PI * 2, 0); Q.setFromEuler(E); S.set(sc, sc * (.92 + f * .2), sc); M4.compose(new THREE.Vector3(p.x, 0, p.y), Q, S);
    meshes.forEach(m => m.setMatrixAt(i, M4));
  });
  return g;
}

/* ── السدرة: جذع متفرّع وتاج كثيف من كتل مستديرة ── */
export function sidrTree(x, z, s = 1) {
  const g = new THREE.Group(), bark = material('wood', '#6B4A30');
  const t = new THREE.CylinderGeometry(4, 7, 46, 8); t.translate(0, 23, 0);
  const b1 = new THREE.CylinderGeometry(2.4, 3.8, 34, 6); b1.rotateZ(.6); b1.translate(-11, 52, 0);
  const b2 = new THREE.CylinderGeometry(2.4, 3.8, 32, 6); b2.rotateZ(-.55); b2.translate(11, 50, 3);
  const wood = new THREE.Mesh(mergeGeometries([t, b1, b2]), bark); wood.castShadow = wood.receiveShadow = true; g.add(wood);
  const blobs = []; const R = (a => () => (a = (a * 9301 + 49297) % 233280) / 233280)(Math.round(x + z));
  for (let i = 0; i < 11; i++) { const r = 16 + R() * 10; let b = smooth(new THREE.IcosahedronGeometry(r, 3)); const p = b.attributes.position;
    for (let k = 0; k < p.count; k++) { const v = new THREE.Vector3().fromBufferAttribute(p, k), n = 1 + .12 * Math.sin(v.x * .5 + i) * Math.cos(v.z * .45); p.setXYZ(k, v.x * n, v.y * n * .82, v.z * n); }
    b.computeVertexNormals(); const a = i / 11 * Math.PI * 2; b.translate(Math.cos(a) * (i ? 22 : 0) + (R() - .5) * 8, 70 + R() * 18 + (i ? 0 : 14), Math.sin(a) * (i ? 16 : 0)); blobs.push(b); }
  const leaves = windy(new THREE.MeshStandardMaterial({ color: '#5B8A3A', roughness: .8 }), 50, 2.5);
  const crown = new THREE.Mesh(mergeGeometries(blobs), leaves); crown.castShadow = crown.receiveShadow = true; g.add(crown);
  g.position.set(x, 0, z); g.scale.setScalar(s); return g;
}

/* ── شجيرة جهنمية مزهرة ── */
export function shrubs(list) {
  const leaf = [], flower = [];
  list.forEach(({ x, y, f, r = 12 }) => {
    const R = (a => () => (a = (a * 9301 + 49297) % 233280) / 233280)(Math.round(x * 7 + y));
    for (let i = 0; i < 6; i++) { const b = smooth(new THREE.IcosahedronGeometry(r * (.55 + R() * .3), 2)); const a = i / 6 * Math.PI * 2; b.translate(x + Math.cos(a) * r * .5, r * .55 + R() * r * .4, y + Math.sin(a) * r * .35); leaf.push(b); }
    if (f) for (let i = 0; i < 14; i++) { const a = R() * Math.PI * 2, h = R(); const s = new THREE.IcosahedronGeometry(1.8, 0); s.translate(x + Math.cos(a) * r * .9, r * (.5 + h * .7), y + Math.sin(a) * r * .7); flower.push(s); }
  });
  const g = new THREE.Group();
  if (leaf.length) { const m = new THREE.Mesh(mergeGeometries(leaf), windy(new THREE.MeshStandardMaterial({ color: '#4E7A34', roughness: .85 }), 6, 1.2)); m.castShadow = m.receiveShadow = true; g.add(m); }
  if (flower.length) { const m = new THREE.Mesh(mergeGeometries(flower), windy(new THREE.MeshStandardMaterial({ color: '#D9478C', roughness: .7 }), 6, 1.2)); m.castShadow = true; g.add(m); }
  return g;
}

/* ── جبال الحجر: سلاسل بعيدة حول العالم، بتدرج لوني ويبتلعها الضباب ── */
export function mountains(bounds) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: '#B08A62', roughness: 1, flatShading: true });
  const far = new THREE.MeshStandardMaterial({ color: '#9C8A86', roughness: 1, flatShading: true });
  const R = (a => () => (a = (a * 9301 + 49297) % 233280) / 233280)(42);
  const ridge = (x1, z1, x2, z2, dist, m, hMin, hMax) => {
    const len = Math.hypot(x2 - x1, z2 - z1), n = Math.ceil(len / 260);
    for (let i = 0; i <= n; i++) {
      const k = i / n, h = hMin + R() * (hMax - hMin), r = 220 + R() * 260, c = new THREE.ConeGeometry(r, h, 7, 3);
      const p = c.attributes.position; for (let j = 0; j < p.count; j++) { const y = p.getY(j); if (y > -h / 2 + 1 && y < h / 2 - 1) { p.setX(j, p.getX(j) * (.8 + R() * .4)); p.setZ(j, p.getZ(j) * (.8 + R() * .4)); p.setY(j, y + (R() - .5) * h * .15); } }
      c.computeVertexNormals(); c.translate(x1 + (x2 - x1) * k + (R() - .5) * 120, h / 2 - 20, z1 + (z2 - z1) * k + (R() - .5) * 120);
      const mesh = new THREE.Mesh(c, m); g.add(mesh);
    }
  };
  const { x0, z0, x1, z1 } = bounds;
  /* تلال صخرية قريبة خلف حافة القرية (طبقة الخلفية الأولى): منخفضة، بلون رملي، وتظهر في أعلى الشاشة */
  const hill = new THREE.MeshStandardMaterial({ color: '#C39A68', roughness: 1 });
  const hillRow = (x1h, z1h, x2h, z2h, hMin, hMax, rMin, rMax) => {
    const len = Math.hypot(x2h - x1h, z2h - z1h), n = Math.ceil(len / 150);
    for (let i = 0; i <= n; i++) {
      const k = i / n, h = hMin + R() * (hMax - hMin), r = rMin + R() * (rMax - rMin), c = smooth(new THREE.DodecahedronGeometry(r, 2));
      const p = c.attributes.position; for (let j = 0; j < p.count; j++) { const v = new THREE.Vector3().fromBufferAttribute(p, j); const s = 1 + (Math.sin(v.x * .05 + i) * Math.cos(v.z * .04) * .18); p.setXYZ(j, v.x * s, Math.max(-r * .2, v.y) * (h / r) * s, v.z * s); }
      c.computeVertexNormals(); c.translate(x1h + (x2h - x1h) * k + (R() - .5) * 60, 0, z1h + (z2h - z1h) * k + (R() - .5) * 60);
      const m = new THREE.Mesh(c, hill); m.receiveShadow = true; g.add(m);
    }
  };
  hillRow(x0 - 200, z0 - 330, x1 + 300, z0 - 330, 90, 210, 120, 200);
  hillRow(x0 - 330, z0 - 200, x0 - 330, z1 + 200, 90, 200, 120, 190);
  ridge(x0 - 700, z0 - 700, x1 + 900, z0 - 700, 0, mat, 260, 520);      // الشمال
  ridge(x0 - 700, z0 - 600, x0 - 700, z1 + 600, 0, mat, 240, 480);      // الغرب
  ridge(x0 - 1300, z0 - 1200, x1 + 1500, z0 - 1300, 0, far, 420, 760);   // سلسلة أبعد خلفها
  ridge(x0 - 700, z1 + 700, x1 + 300, z1 + 700, 0, mat, 220, 420);      // الجنوب
  return g;
}

/* ── السماء: قبة بتدرج من الأزرق إلى ضباب دافئ عند الأفق ── */
export function sky(color = { top: '#5FA8E8', mid: '#A9D4F2', horizon: '#F2E2C2' }) {
  const geo = new THREE.SphereGeometry(9000, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(color.top) }, mid: { value: new THREE.Color(color.mid) }, hor: { value: new THREE.Color(color.horizon) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.6, h)) : mix(hor, mid, smoothstep(-0.02, 0.12, h)); gl_FragColor = vec4(c, 1.0); }'
  });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = -10; m.frustumCulled = false; return m;
}

/* ── البحر شرق العالم: سطح بلمعان وتموج متحرك ── */
export function sea(x0, z0, z1) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const img = x.createImageData(128, 128);
  for (let j = 0; j < 128; j++) for (let i = 0; i < 128; i++) { const a = Math.sin(i * .2 + Math.sin(j * .15) * 2) * .5 + Math.sin(j * .31 + i * .07) * .5, k = (j * 128 + i) * 4; img.data[k] = 128 + a * 50; img.data[k + 1] = 128 + Math.cos(j * .2) * 40; img.data[k + 2] = 255; img.data[k + 3] = 255; }
  x.putImageData(img, 0, 0);
  const n = new THREE.CanvasTexture(c); n.wrapS = n.wrapT = THREE.RepeatWrapping; n.repeat.set(40, 120);
  const mat = new THREE.MeshStandardMaterial({ color: '#2B8FC2', roughness: .22, metalness: .1, normalMap: n, normalScale: new THREE.Vector2(.35, .35) });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4000, z1 - z0 + 4000), mat); m.rotation.x = -Math.PI / 2; m.position.set(x0 + 2000, -3, (z0 + z1) / 2); m.receiveShadow = true;
  m.userData.tick = t => { n.offset.set(t * .01, t * .006); };
  return m;
}
