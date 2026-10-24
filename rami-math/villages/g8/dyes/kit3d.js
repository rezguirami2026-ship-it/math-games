// مصبغة الألوان مجسّماً: حواف أحواض الصبغ الحجرية فوق ألوانها المرسومة في الأرض، وحبال التجفيف بأقمشة تتموج، وتعاونية النسيج ومحل الطلاء
// وعلبه، ومخزن الجملة المعدني وصناديقه، وأكشاك الدروس، وبسطات، وحبال الرايات، وبيوت حديثة ومسجد وشوارع حيّة، ونصب عجلة الألوان الدوّارة.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#DC2626', '#FACC15', '#2563EB', '#16A34A', '#7C3AED'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  // حواف الأحواض: حلقات حجرية منخفضة، وسطح الصبغ لامع قليلاً فوق الأرض
  { const P = new Parts(), stone = material('stone', '#CDB48E'); D.VATS.forEach(([x, y, r]) => { P.add(stone, new THREE.CylinderGeometry(r + 9, r + 10, 14, 24, 1, true).translate(x, 7, y), { uv: false }); P.add(stone, new THREE.RingGeometry(r, r + 9, 24).rotateX(-Math.PI / 2).translate(x, 14, y), { uv: false }); });
    root.add(P.build());
    D.VATS.forEach(([x, y, r, col], k) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshStandardMaterial({ color: col, roughness: .15, metalness: .05 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 8, y); root.add(m); ticks.push(t => { m.position.y = 8 + Math.sin(t * 1.3 + k) * .6; }); }); }
  // قناة الماء والجسر
  { const C = D.CANAL, P = new Parts(); P.add(material('stone', '#7C6A52'), box(C.x1 - C.x0, 6, 4, (C.x0 + C.x1) / 2, 3, C.y - 14)); P.add(material('stone', '#7C6A52'), box(C.x1 - C.x0, 6, 4, (C.x0 + C.x1) / 2, 3, C.y + 14));
    P.add(material('wood', '#B08A5A'), box(70, 6, 44, C.x1 - 43, 4, C.y)); root.add(P.build());
    const w = new THREE.Mesh(new THREE.PlaneGeometry(C.x1 - C.x0 - 8, 22), new THREE.MeshStandardMaterial({ color: '#3B82C4', roughness: .1, metalness: .1, transparent: true, opacity: .85 })); w.rotation.x = -Math.PI / 2; w.position.set((C.x0 + C.x1) / 2, 1.5, C.y); root.add(w); }
  // حبال التجفيف: أعمدة وأقمشة معلّقة تتموج مع الريح
  { const P = new Parts(), wood = material('wood', '#7A4A22'); D.LINES.forEach(([a, b, y]) => [a, (a + b) / 2, b].forEach(x => { P.add(wood, box(6, 130, 6, x, 65, y)); P.add(wood, box(24, 5, 6, x, 130, y)); })); root.add(P.build());
    D.LINES.forEach(([a, b, y], j) => { for (let q = 0; q < 9; q++) { const x = a + 20 + q * (b - a - 40) / 8, len = 70 + (q % 3) * 10, top = 126 - Math.sin(Math.PI * (x - a) / (b - a)) * 12;
      const cl = new THREE.Mesh(new THREE.PlaneGeometry(28, len, 1, 6).translate(0, -len / 2, 0), new THREE.MeshStandardMaterial({ color: D.VATS[(q + j * 3) % 12][3], roughness: .9, side: THREE.DoubleSide })); cl.position.set(x, top, y); root.add(cl);
      ticks.push(t => { cl.rotation.x = Math.sin(t * 2 + q + j) * .12; }); } }); }
  root.add(omaniHouse({ ...D.COOP })); root.add(omaniHouse({ ...D.PAINT }));
  { const P = new Parts(), z = D.PAINT.y + D.PAINT.h + 10; for (let q = 0; q < 7; q++) { const x = D.PAINT.x + 22 + q * 34; P.add(flat(FLAGC[q % 5]), new THREE.CylinderGeometry(11, 11, 22, 14).translate(x, 11, z), { uv: false }); P.add(metal('#E5E7EB'), new THREE.CylinderGeometry(11.5, 11.5, 3, 14).translate(x, 23, z), { uv: false }); } root.add(P.build()); }
  // مخزن الجملة: جسم معدني مموج وسقف مقوّس وباب لفّاف ولافتة
  { const S = D.STORE, H3 = S.H, P = new Parts(); P.add(material('metal', '#E2E8F0', { rough: .5, metal: .4 }), box(S.w, H3, S.h, S.x + S.w / 2, H3 / 2, S.y + S.h / 2));
    for (let x = S.x + 8; x < S.x + S.w; x += 12) P.add(metal('#94A3B8', .5), box(2, H3, 2, x, H3 / 2, S.y + S.h + .5));
    P.add(metal('#64748B', .5), box(120, 84, 3, S.x + S.w / 2, 42, S.y + S.h + 1.5)); P.add(flat('#0F766E'), box(S.w, 24, 3, S.x + S.w / 2, H3 - 12, S.y + S.h + 2));
    root.add(P.build()); const roof = new THREE.Mesh(new THREE.CylinderGeometry(S.h / 2, S.h / 2, S.w, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), metal('#CBD5E1', .45)); roof.position.set(S.x + S.w / 2, H3, S.y + S.h / 2); roof.scale.set(1, .35, 1); root.add(roof);
    const sg = signMesh('📦 مخزن الجملة', 18); sg.position.set(S.x + S.w / 2, H3 - 12, S.y + S.h + 4); root.add(sg);
    const C = new Parts(); D.CRATES.forEach(([x, y], i) => { const h = 34 + (i % 2) * 14; C.add(material('wood', ['#A16207', '#7C3AED', '#0F766E'][i % 3]), box(52, h, 22, x, h / 2, y - 11)); }); root.add(C.build()); }
  // أكشاك الدروس
  D.stations.forEach(s => { const P = new Parts(), x = s.x, z = s.y - 44; P.add(material('plaster', s.col), box(104, 70, 24, x, 35, z)); P.add(flat('#3B2A1E'), box(90, 26, 2, x, 36, z + 12.5)); P.add(material('wood', '#C9955A'), box(110, 6, 30, x, 22, z + 4));
    root.add(P.build()); const aw = new THREE.Mesh(new THREE.BoxGeometry(112, 3, 26), new THREE.MeshStandardMaterial({ map: stripes(THREE, s.col, '#F4E3B8', 8), roughness: .7 })); aw.position.set(x, 64, z + 20); aw.rotation.x = .35; root.add(aw);
    const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(x, 92, z + 14); root.add(m); });
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); });
  { const P = new Parts(); D.BANNERS.flat().forEach(([x, y]) => P.add(metal('#64748B'), box(5, 124, 5, x, 62, y))); root.add(P.build());
    D.BANNERS.forEach(([a, b], i) => { const A = new THREE.Vector3(a[0], 124, a[1]), B = new THREE.Vector3(b[0], 124, b[1]); for (let k = 0; k < 12; k++) { const u = (k + .5) / 12, p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * 26;
      const f = new THREE.Mesh(new THREE.ConeGeometry(6, 15, 3), flat(FLAGC[(k + i) % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }); }
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب عجلة الألوان، وقوس القرية
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y)); P.add(metal('#57534E'), box(8, 80, 8, R.x, 54, R.y)); root.add(P.build());
    const wheel = new THREE.Group(); wheel.position.set(R.x, 104, R.y + 4); root.add(wheel);
    ['#DC2626', '#F97316', '#FACC15', '#16A34A', '#2563EB', '#7C3AED'].forEach((c, q) => { const m = new THREE.Mesh(new THREE.CircleGeometry(40, 8, q * Math.PI / 3, Math.PI / 3), new THREE.MeshStandardMaterial({ color: c, roughness: .4, side: THREE.DoubleSide })); wheel.add(m); });
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 4, 16), flat('#FFFFFF')); hub.rotation.x = Math.PI / 2; wheel.add(hub); ticks.push(() => { wheel.rotation.z = K.t * .3; });
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#7C3AED'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#7C3AED'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🎨 مصبغة الألوان', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
