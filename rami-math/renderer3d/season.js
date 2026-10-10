// زينة المواسم في العرض ثلاثي الأبعاد (الأعياد واليوم الوطني): رايات مثلثة ملونة بين البيوت وفوق الشارع، وعناقيد بالونات
// حول ساحة البئر، ولافتة التهنئة. تُبنى مرة لكل موسم وتُخفى في غيره. نهار عادي (لا تغيّر السماء كرمضان).
import * as THREE from '../lib/three/three.module.min.js';
import { HOUSES, SOUTH, WELL } from '../world/village.js';

function pennants(a, b, n, sag, cols) {
  const g = new THREE.Group(), pts = [], P = u => new THREE.Vector3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - Math.sin(Math.PI * u) * sag, a.z + (b.z - a.z) * u);
  for (let k = 0; k <= 24; k++) pts.push(P(k / 24));
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#3A2A1E' })));
  const pos = [], col = [], c = new THREE.Color();
  for (let k = 0; k < n; k++) {
    const p1 = P((k + .12) / n), p2 = P((k + .88) / n), m = p1.clone().add(p2).multiplyScalar(.5); m.y -= 11;
    c.set(cols[k % cols.length]); pos.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, m.x, m.y, m.z); for (let j = 0; j < 3; j++) col.push(c.r, c.g, c.b);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  const flags = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .8 })); flags.userData.flags = true; g.add(flags);
  return g;
}
function balloonCluster(x, z, cols) {
  const g = new THREE.Group(), sph = new THREE.SphereGeometry(7, 14, 10);
  cols.slice(0, 5).forEach((c, k) => {
    const a = (k - 2) * .35, h = 62 + (k % 2) * 10, bx = Math.sin(a) * 26, bz = Math.cos(a * 1.7) * 6;
    const b = new THREE.Mesh(sph, new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: .05 })); b.scale.y = 1.2; b.position.set(bx, h, bz); g.add(b);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2, 0), new THREE.Vector3(bx, h - 8, bz)]), new THREE.LineBasicMaterial({ color: '#5A4636' })));
  });
  g.position.set(x, 0, z); return g;
}
function bannerMesh(text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d');
  c.fillStyle = '#2A1B66'; c.beginPath(); c.roundRect(4, 4, 504, 88, 14); c.fill(); c.strokeStyle = '#E3B04B'; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#FFE7A0'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; let fs = 50; do { c.font = `900 ${fs}px Cairo, sans-serif`; fs -= 2; } while (c.measureText(text).width > 460 && fs > 20); c.fillText(text, 256, 52);   // يصغر الخط حتى يتسع
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(170, 32), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
  return m;
}
export function seasonDeco(scene) {
  let cur = null, deco = null;
  const build = S => {
    const g = new THREE.Group(), top = b => new THREE.Vector3(b.x + b.w / 2, (b.H || 96) * 1.38 + 6, b.y + b.h);
    [[0, 3], [3, 4], [1, 4], [2, 4], [6, 5]].forEach(([i, j]) => { if (HOUSES[i] && HOUSES[j]) g.add(pennants(top(HOUSES[i]), top(HOUSES[j]), 12, 26, S.cols)); });
    [[40, 612], [612, 870], [870, 1220]].forEach(([x1, x2]) => g.add(pennants(new THREE.Vector3(x1 + 14, 86, 594), new THREE.Vector3(x2 + 14, 86, 594), 11, 16, S.cols)));
    if (SOUTH[0] && SOUTH[1]) g.add(pennants(top(SOUTH[0]), top(SOUTH[1]), 14, 36, S.cols));
    g.add(balloonCluster(WELL.x - 70, WELL.y + 34, S.cols), balloonCluster(WELL.x + 76, WELL.y + 30, S.cols.slice().reverse()));
    const bn = bannerMesh(S.banner); bn.position.set(1045, 74, 596); g.add(bn);
    return g;
  };
  return {
    set(S) {
      if (S === cur) return; cur = S;
      if (deco) { scene.remove(deco); deco.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); deco = null; }
      if (S) { deco = build(S); scene.add(deco); }
    },
    tick(t) { if (!deco) return; deco.children.forEach((c, i) => { if (c.isGroup && c.children.length > 2 && !c.children[1].userData.flags) c.position.y = Math.sin(t * 1.3 + i) * 2.5; }); }
  };
}
