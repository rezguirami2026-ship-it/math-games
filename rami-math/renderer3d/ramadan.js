// أجواء رمضان في العرض ثلاثي الأبعاد: سماء غروب وهلال، شمس منخفضة دافئة، نوافذ مضيئة، وحبال فوانيس ملونة تتوهج بين البيوت.
// تُفعَّل من SEASON.ramadan (core/season.js) — نفس مفتاح النسخة العادية وزر الحقيبة.
import * as THREE from '../lib/three/three.module.min.js';
import { HOUSES, SOUTH, WELL } from '../world/village.js';

const DAY = { top: '#5FA8E8', mid: '#A9D4F2', hor: '#F2E2C2', fog: '#EAD9B8', sun: '#FFE9C4', sunI: 2.7, hemiS: '#CFE4FA', hemiG: '#B08D62', hemiI: 1.05, exp: .92 };
const DUSK = { top: '#2A2464', mid: '#C2547A', hor: '#FFB067', fog: '#C9876E', sun: '#FF9A55', sunI: 1.6, hemiS: '#7C6BC9', hemiG: '#7A4A3A', hemiI: .8, exp: 1.02 };

/* حبل فوانيس: منحنى متدلٍّ بين نقطتين على ارتفاع، وفوانيس صغيرة متوهجة بألوان متناوبة */
function lanternRope(a, b, n, sag = 22) {
  const g = new THREE.Group(), pts = [];
  for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push(new THREE.Vector3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - Math.sin(Math.PI * u) * sag, a.z + (b.z - a.z) * u)); }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#3A2A1E' })));
  const cols = ['#FFC94A', '#4FD1C5', '#FF6B6B', '#B794F4'];
  for (let k = 1; k <= n; k++) {
    const u = k / (n + 1), p = new THREE.Vector3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - Math.sin(Math.PI * u) * sag - 6, a.z + (b.z - a.z) * u);
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(3.2, 0), new THREE.MeshStandardMaterial({ color: cols[k % 4], emissive: cols[k % 4], emissiveIntensity: 2.2 }));
    m.scale.y = 1.5; m.position.copy(p); g.add(m);
  }
  return g;
}

export function ramadan(scene, { sky, sun, hemi, renderer, village }) {
  const deco = new THREE.Group(); deco.visible = false; scene.add(deco);
  // الهلال: قرص ذهبي متوهج يقطعه قرص بلون السماء
  const moon = new THREE.Group();
  const m1 = new THREE.Mesh(new THREE.CircleGeometry(160, 40), new THREE.MeshBasicMaterial({ color: '#FFE7A0', fog: false }));
  const m2 = new THREE.Mesh(new THREE.CircleGeometry(150, 40), new THREE.MeshBasicMaterial({ color: '#3A2F70', fog: false })); m2.position.set(70, 30, 1);
  moon.add(m1, m2); moon.position.set(400, 2600, -6000); deco.add(moon);
  // حبال الفوانيس بين البيوت حول ساحة البئر وعلى الشارع
  const top = b => new THREE.Vector3(b.x + b.w / 2, (b.H || 96) * 1.38 + 6, b.y + b.h);
  [[0, 3], [3, 4], [1, 4], [2, 4], [6, 5]].forEach(([i, j]) => { if (HOUSES[i] && HOUSES[j]) deco.add(lanternRope(top(HOUSES[i]), top(HOUSES[j]), 9, 28)); });
  [[40, 612], [612, 870], [870, 1220]].forEach(([x1, x2]) => deco.add(lanternRope(new THREE.Vector3(x1 + 14, 86, 594), new THREE.Vector3(x2 + 14, 86, 594), 7, 18)));
  deco.add(lanternRope(top(SOUTH[0]), top(SOUTH[1]), 12, 40));
  const glowLights = []; [[WELL.x, 80, WELL.y + 30], [700, 80, 640], [1100, 70, 640]].forEach(([x, y, z]) => { const l = new THREE.PointLight('#FFB866', 0, 260, 1.4); l.position.set(x, y, z); deco.add(l); glowLights.push(l); });
  // النوافذ: الزجاج الداكن يتوهج بلون دافئ
  const glass = []; scene.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material) && o.material.color && o.material.color.getHexString() === '33505e') glass.push(o.material); });
  let on = null;
  const lit = m => { m.emissive = m.emissive || new THREE.Color(); m.emissive.set(on ? '#FFB45A' : '#000000'); m.emissiveIntensity = on ? .9 : 0; };
  return {
    collect(g) { g.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material) && o.material.color && o.material.color.getHexString() === '33505e' && !glass.includes(o.material)) { glass.push(o.material); lit(o.material); } }); },   // نوافذ المناطق المبنية لاحقاً
    set(v, L) {
      if (v === on) return; on = v; const P = v ? DUSK : DAY;
      const u = sky.material.uniforms; u.top.value.set(P.top); u.mid.value.set(P.mid); u.hor.value.set(P.hor);
      scene.fog.color.set(P.fog); sun.color.set(P.sun); sun.intensity = P.sunI; hemi.color.set(P.hemiS); hemi.groundColor.set(P.hemiG); hemi.intensity = P.hemiI;
      renderer.toneMappingExposure = P.exp; deco.visible = v; glowLights.forEach(l => l.intensity = v ? 2600 : 0);
      glass.forEach(m => { m.emissive = m.emissive || new THREE.Color(); m.emissive.set(v ? '#FFB45A' : '#000000'); m.emissiveIntensity = v ? .9 : 0; });
      if (village && village.forceLamps) village.forceLamps(v);
      renderer.shadowMap.needsUpdate = true;
    },
    tick(t) { if (!on) return; deco.children.forEach((c, i) => { if (c.isGroup) c.children.forEach((m, k) => { if (m.isMesh) m.material.emissiveIntensity = 1.6 + Math.sin(t * 4 + k * 1.3 + i) * .6; }); }); }
  };
}
