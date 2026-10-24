// مطبخ الحلوى مجسّماً: بيت الحلوى والمقطرة والدكّان (omaniHouse)، قدور نحاسية على مواقد حجرية بنار تتراقص ومجاديف تدور وبخار،
// بستان نخيل بمسطاح تمر، أحواض ورد بشجيرات مزهرة، جرار تقطير فخارية بأنبوب نحاسي، مناحل ونحل يدور، طاولة تعبئة بعلب،
// بيوت حديثة ومسجد وشوارع حيّة، ونصب الدلّة العملاقة بفنجانين في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree, shrubs } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const LIDS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED'];
export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .35) => material('metal', c, { rough: r, metal: .6 });
  const glow = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .9, transparent: true, opacity: .9 });
  // المباني
  root.add(omaniHouse({ ...D.HOUSE, wall: '#F5E6C8', door: '#7C2D12', style: 'shop', sign: 'بيت الحلوى' }));
  root.add(omaniHouse({ ...D.STILL, wall: '#FBCFE8', door: '#9D174D', style: 'shop', sign: 'مقطرة الورد' }));
  root.add(omaniHouse({ ...D.SHOP, wall: '#FDE68A', door: '#B45309', style: 'shop', sign: 'دكّان الحلوى' }));
  // القدور النحاسية: موقد حجري، نار، قدر، حلوى، مجداف يدور، وبخار
  D.POTS.forEach(([x, y], k) => {
    const P = new Parts(); P.add(material('stone', '#78716C'), new THREE.CylinderGeometry(44, 48, 18, 18).translate(x, 9, y));
    P.add(metal('#C27A3A'), new THREE.SphereGeometry(38, 20, 12, 0, Math.PI * 2, Math.PI * .45, Math.PI * .55).scale(1, .9, 1).translate(x, 58, y));
    P.add(metal('#8A4F1F'), new THREE.TorusGeometry(37, 3, 8, 24).rotateX(Math.PI / 2).translate(x, 64, y));
    P.add(material('flat', '#A8481E', { rough: .3 }), new THREE.CircleGeometry(34, 24).rotateX(-Math.PI / 2).translate(x, 62, y));
    for (let i = 0; i < 4; i++) P.add(material('wood', '#5C3A20'), box(36, 6, 6, x + (i - 1.5) * 8, 20, y + (i % 2 ? 10 : -10)));
    root.add(P.build());
    const fire = Array.from({ length: 3 }, (_, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(7, 22, 6), glow(i % 2 ? '#F97316' : '#FACC15')); m.position.set(x - 14 + i * 14, 28, y + 30); root.add(m); return m; });
    const paddle = new THREE.Group(), pm = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 80, 6), material('wood', '#7C4A1E')); pm.position.y = 30; pm.rotation.z = .35; paddle.add(pm); root.add(paddle);
    const steam = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 6), new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: .4, depthWrite: false })); root.add(m); return m; });
    ticks.push(t => { fire.forEach((m, i) => m.scale.y = .8 + Math.sin(t * 9 + i * 2 + k) * .3); const a = t * 1.6 + k; paddle.position.set(x + Math.cos(a) * 16, 62, y + Math.sin(a) * 16); paddle.rotation.y = -a;
      steam.forEach((m, i) => { const u = (t * .3 + i / 4 + k * .1) % 1; m.position.set(x - 10 + i * 7 + Math.sin(t + i) * 5, 70 + u * 110, y); m.scale.setScalar(1 + u * 1.6); m.material.opacity = .4 * (1 - u); }); });
  });
  // كومة الحطب
  { const P = new Parts(); for (let k = 0; k < 6; k++) P.add(material('wood', k % 2 ? '#7C4A1E' : '#92400E'), new THREE.CylinderGeometry(5, 5, 60, 8).rotateZ(Math.PI / 2).translate(1390 + (k % 3) * 4, 6 + Math.floor(k / 3) * 10 + (k % 3) * 0, 490 - (k % 3) * 11)); root.add(P.build()); }
  // البستان: نخيل ومسطاح التمر
  root.add(palms(D.GROVE.map(([x, y, s]) => ({ x, y, s }))));
  { const P = new Parts(); D.MATS.forEach(([x, y, w, h]) => { P.add(material('wood', '#D9B86C'), box(w, 1.5, h, x + w / 2, .75, y + h / 2));
    for (let i = 0; i < 60; i++) P.add(flat(i % 3 ? '#7C2D12' : '#A16207'), new THREE.SphereGeometry(3, 5, 4).scale(1.4, .7, 1).translate(x + 8 + (i * 37) % (w - 16), 2.2, y + 6 + (i * 23) % (h - 12))); }); root.add(P.build()); }
  // أحواض الورد
  { const P = new Parts(), list = []; D.ROSES.forEach((b, j) => { P.add(material('stone', '#D6C7AE'), box(b.w, 14, b.h, b.x + b.w / 2, 7, b.y + b.h / 2)); P.add(flat('#6B4A2E'), box(b.w - 8, 1, b.h - 8, b.x + b.w / 2, 14.5, b.y + b.h / 2));
    for (let x = b.x + 22; x < b.x + b.w - 10; x += 34) list.push({ x, y: b.y + b.h / 2, f: 1, r: 13 }); }); root.add(P.build()); const sh = shrubs(list); sh.position.y = 14; root.add(sh); }
  // جرار التقطير والأنبوب وقارورة الاستقبال
  D.JARS.forEach(([x, y], k) => { const P = new Parts(); P.add(material('flat', '#B45309', { rough: .8 }), new THREE.SphereGeometry(26, 16, 12).scale(1, .95, 1).translate(x, 34, y)); P.add(material('flat', '#92400E', { rough: .8 }), new THREE.CylinderGeometry(8, 9, 14, 10).translate(x, 64, y));
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, 70, y), new THREE.Vector3(x + 30, 86, y), new THREE.Vector3(x + 44, 34, y)); P.add(metal('#C27A3A'), new THREE.TubeGeometry(curve, 14, 2.5, 6));
    P.add(new THREE.MeshStandardMaterial({ color: '#F472B6', transparent: true, opacity: .7, roughness: .1 }), new THREE.CylinderGeometry(8, 8, 26, 12).translate(x + 44, 13, y)); root.add(P.build());
    const fl = new THREE.Mesh(new THREE.ConeGeometry(8, 18, 6), glow('#F97316')); fl.position.set(x, 9, y + 18); root.add(fl); ticks.push(t => fl.scale.y = .8 + Math.sin(t * 8 + k) * .3); });
  // المناحل والنحل
  D.HIVES.forEach(([x, y], k) => { const P = new Parts(); for (let j = 0; j < 3; j++) P.add(material('wood', j % 2 ? '#F59E0B' : '#FBBF24'), box(40, 14, 28, x, 7 + j * 14, y - 12)); P.add(material('wood', '#78350F'), box(48, 5, 34, x, 45, y - 12)); root.add(P.build());
    const bees = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(2.6, 6, 4).scale(1.4, 1, 1), flat('#FACC15')); root.add(m); return m; });
    ticks.push(t => bees.forEach((m, i) => { const a = t * (2 + i * .3) + i * 1.3 + k; m.position.set(x + Math.cos(a) * (22 + i * 4), 40 + Math.sin(a * 1.4) * 12, y - 12 + Math.sin(a) * (16 + i * 3)); })); });
  // طاولة التعبئة والعلب
  { const Tb = D.TABLE, P = new Parts(); P.add(material('wood', '#92400E'), box(Tb.w, 6, Tb.h, Tb.x + Tb.w / 2, 34, Tb.y + Tb.h / 2)); [[6, 6], [Tb.w - 6, 6], [6, Tb.h - 6], [Tb.w - 6, Tb.h - 6]].forEach(([a, b]) => P.add(material('wood', '#78350F'), box(5, 32, 5, Tb.x + a, 16, Tb.y + b)));
    for (let k = 0; k < 6; k++) { const jx = Tb.x + 14 + k * 20, jz = Tb.y + Tb.h / 2; P.add(new THREE.MeshStandardMaterial({ color: '#E2E8F0', transparent: true, opacity: .55, roughness: .1 }), new THREE.CylinderGeometry(7, 7, 18, 10).translate(jx, 46, jz)); P.add(flat('#7A2E12'), new THREE.CylinderGeometry(6, 6, 14, 10).translate(jx, 44, jz)); P.add(flat(LIDS[k % 5]), new THREE.CylinderGeometry(8, 8, 4, 10).translate(jx, 57, jz)); }
    root.add(P.build()); }
  // البيوت والمسجد والأكشاك والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); });
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب الدلّة: جسم مخروطي منحنٍ بغطاء وقبة ومنقار ومقبض، وفنجانان، على قاعدة
  { const R = D.RING, gold = metal('#D4A017', .25), P = new Parts();
    P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(52, 56, 16, 24).translate(R.x, 8, R.y));
    const prof = [[0, 0], [34, 2], [40, 30], [30, 60], [15, 76], [12, 112], [16, 116], [10, 132], [3, 142], [0, 146]].map(([r, h]) => new THREE.Vector2(r, h));
    P.add(gold, new THREE.LatheGeometry(prof, 24).translate(R.x, 16, R.y)); P.add(gold, new THREE.SphereGeometry(5, 10, 8).translate(R.x, 166, R.y));
    const sp = new THREE.CatmullRomCurve3([new THREE.Vector3(R.x - 30, 60, R.y), new THREE.Vector3(R.x - 52, 90, R.y), new THREE.Vector3(R.x - 62, 128, R.y)]); P.add(gold, new THREE.TubeGeometry(sp, 12, 4.5, 8));
    const hd = new THREE.CatmullRomCurve3([new THREE.Vector3(R.x + 28, 40, R.y), new THREE.Vector3(R.x + 54, 76, R.y), new THREE.Vector3(R.x + 16, 108, R.y)]); P.add(gold, new THREE.TubeGeometry(hd, 12, 3.5, 8));
    [-62, 62].forEach(o => { P.add(flat('#F8FAFC'), new THREE.CylinderGeometry(12, 8, 16, 14, 1, true).translate(R.x + o, 24, R.y + 20)); P.add(metal('#B45309'), new THREE.TorusGeometry(12, 1.6, 6, 16).rotateX(Math.PI / 2).translate(R.x + o, 32, R.y + 20)); });
    root.add(P.build());
    // قوس المطبخ ولافتاته
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('wood', '#B45309'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('wood', '#B45309'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🍯 مطبخ الحلوى', 22); sg.position.set(R.x, 126, y + 8); root.add(sg);
    D.stations.forEach(s => { const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(s.x, 92, s.y + 4); root.add(m); }); }
  // رايات فوق الشارع الكبير
  { const a = new THREE.Vector3(634, 115, 1000), b = new THREE.Vector3(886, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(['#B45309', '#FFFFFF', '#DB2777', '#16A34A'][k % 4])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
