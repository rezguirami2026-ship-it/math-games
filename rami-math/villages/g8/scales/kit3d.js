// ميناء الموازين مجسّماً بمكتبة العالم المفتوح: بحر حقيقي بموج (nature.sea)، مستودع (omani.warehouse)، بيوت حديثة (houses.js)،
// مسجد، نخيل وإنارة، وشوارع حيّة (street.js)؛ ومن صنع القرية: مراسٍ خشبية، قوارب تتهادى وقارب يبحر، أكوام حاويات ملوّنة،
// رافعة جسرية تتحرك عربتها، برج مراقبة بضوء أحمر، أكشاك سوق السمك، ونصب المرساة في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, warehouse, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree, sea } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], flat = c => material('flat', c, { rough: .6 }), wood = material('wood', '#7A4A2A');
  // البحر والرصيف والمراسي
  const water = sea(-1600, -2600, D.SEA); root.add(water); ticks.push(t => water.userData.tick(t));
  { const P = new Parts(); P.add(material('stone', '#A8A29E'), box(W + 3200, 30, D.QUAY - D.SEA + 6, W / 2, -12, (D.SEA + D.QUAY) / 2));
    D.PIERS.forEach(([x, wd, top]) => { P.add(material('wood', '#9A6A3E'), box(wd, 6, D.QUAY - top, x + wd / 2, 3, (top + D.QUAY) / 2)); for (let y = top; y < D.SEA; y += 60) [x, x + wd].forEach(px => P.add(material('wood', '#5C3A20'), box(7, 40, 7, px, -10, y))); });
    root.add(P.build()); }
  // القوارب: بدن ملوّن، سطح أبيض، قمرة بنافذة زرقاء
  const boatMesh = col => { const g = new THREE.Group(), P = new Parts(); const hull = new THREE.CylinderGeometry(20, 14, 92, 10, 1, false, 0, Math.PI); hull.rotateZ(Math.PI / 2); hull.rotateX(Math.PI); hull.scale(1, .7, 1);
    P.add(material('flat', col, { rough: .4 }), hull); P.add(flat('#FFFDF6'), box(84, 3, 30, 0, 1, 0)); P.add(flat('#F8FAFC'), box(26, 22, 22, -6, 13, 0)); P.add(flat('#93C5FD'), box(27, 8, 16, -6, 16, 0)); g.add(P.build()); return g; };
  const boats = D.BOATS.map((b, k) => { const m = boatMesh(b.c); m.position.set(b.x, 0, b.y); root.add(m); return { m, b, k }; });
  const sailer = boatMesh('#0F766E'); root.add(sailer);
  ticks.push(t => { boats.forEach(({ m, b, k }) => { m.position.y = Math.sin(t * 1.6 + k) * 2.5; m.rotation.z = Math.sin(t * 1.2 + k) * .04; });
    sailer.position.set(D.boatLife.sail.x, Math.sin(t * 1.6) * 2.5, 330); sailer.rotation.y = D.boatLife.sail.dir > 0 ? 0 : Math.PI; });
  // ساحة الحاويات
  { const P = new Parts(); D.STACKS.forEach((s, k) => { for (let j = 0; j < s.n; j++) { const col = [s.col, '#0EA5E9', '#F59E0B'][(j + k) % 3]; P.add(material('metal', col, { rough: .55, metal: .35 }), box(s.w, 42, s.h, s.x + s.w / 2, 21 + j * 44, s.y + s.h / 2));
      for (let r = 8; r < s.w; r += 12) P.add(material('metal', new THREE.Color(col).multiplyScalar(.8).getStyle(), { rough: .6, metal: .3 }), box(2, 38, s.h + 1, s.x + r, 21 + j * 44, s.y + s.h / 2)); } }); root.add(P.build()); }
  // الرافعة الجسرية: قائمتان وعارضة علوية وعربة تتحرك وحاوية معلّقة
  { const C = D.CRANE, top = 300, P = new Parts(), yel = material('metal', '#F59E0B', { rough: .4, metal: .5 });
    [C.x0, C.x1].forEach(x => [C.y - 120, C.y + 120].forEach(z => P.add(yel, box(16, top, 16, x, top / 2, z)))); [C.x0, C.x1].forEach(x => P.add(yel, box(18, 18, 260, x, top, C.y)));
    P.add(yel, box(C.x1 - C.x0 + 60, 20, 26, (C.x0 + C.x1) / 2, top + 14, C.y)); root.add(P.build());
    const trol = new THREE.Group(); const T2 = new Parts(); T2.add(material('metal', '#B45309', { metal: .5 }), box(44, 18, 34, 0, top, 0)); T2.add(material('metal', '#374151'), box(2, 110, 2, 0, top - 60, 0)); T2.add(material('metal', '#2563EB', { rough: .5, metal: .35 }), box(80, 38, 34, 0, top - 130, 0));
    trol.add(T2.build()); trol.position.z = C.y; root.add(trol); ticks.push(t => { trol.position.x = C.x0 + (C.x1 - C.x0) * (.5 + .4 * Math.sin(t * .4)); trol.position.y = Math.sin(t) * 10; }); }
  // المستودع وبرج المراقبة
  root.add(warehouse(D.WAREHOUSE, D.WAREHOUSE.H));
  { const Tw = D.TOWER, P = new Parts(); P.add(material('plaster', '#F1F5F9'), new THREE.CylinderGeometry(Tw.r - 6, Tw.r, Tw.H * SCALE_H, 20).translate(Tw.x, Tw.H * SCALE_H / 2, Tw.y - 20));
    P.add(material('flat', '#38BDF8', { rough: .1 }), new THREE.CylinderGeometry(Tw.r + 4, Tw.r + 4, 34, 20).translate(Tw.x, Tw.H * SCALE_H + 17, Tw.y - 20));
    P.add(material('plaster', '#E2E8F0'), new THREE.CylinderGeometry(Tw.r + 10, Tw.r + 10, 8, 20).translate(Tw.x, Tw.H * SCALE_H + 38, Tw.y - 20)); root.add(P.build());
    const red = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), new THREE.MeshStandardMaterial({ color: '#DC2626', emissive: '#DC2626', emissiveIntensity: 2 })); red.position.set(Tw.x, Tw.H * SCALE_H + 70, Tw.y - 20); root.add(red); ticks.push(t => { red.material.emissiveIntensity = 1 + Math.abs(Math.sin(t * 2)) * 2; }); }
  // أكشاك سوق السمك والسوق الداخلي
  const stall = (x, y, c) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15));
    for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); };
  D.MARKET.forEach(([x, y, c]) => stall(x, y, c)); D.STALLS.forEach(([x, y, c]) => stall(x, y, c));
  // البيوت والمسجد والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب المرساة وقوس الميناء واللافتات
  { const R = D.RING, P = new Parts(), dark = material('metal', '#334155', { rough: .4, metal: .7 }); P.add(dark, box(10, 110, 10, R.x, 55, R.y)); P.add(dark, box(60, 9, 9, R.x, 88, R.y));
    const arc = new THREE.TorusGeometry(36, 5, 8, 20, Math.PI); arc.rotateZ(Math.PI); arc.translate(R.x, 40, R.y); P.add(dark, arc); P.add(dark, new THREE.TorusGeometry(10, 4, 8, 16).translate(R.x, 118, R.y)); root.add(P.build());
    const A = new Parts(), y = D.YARD - 30; [-92, 92].forEach(o => A.add(material('metal', '#0E7490', { metal: .4 }), box(12, 150, 12, 1150 + o, 75, y))); A.add(material('metal', '#0E7490', { metal: .4 }), box(212, 14, 14, 1150, 150, y)); root.add(A.build());
    const sg = signMesh('⚓ ميناء الموازين', 22); sg.position.set(1150, 126, y + 8); root.add(sg);
    D.stations.forEach(s => { const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(s.x, s.kind === 'crane' ? 80 : s.kind === 'tower' ? 60 : 96, s.y + 4); root.add(m); }); }
  // رايات فوق الشارع، وجبال بعيدة جنوباً، وسحب
  { const a = new THREE.Vector3(1024, 115, 1000), b = new THREE.Vector3(1276, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(['#0EA5E9', '#FFFFFF', '#F59E0B', '#0F766E'][k % 4])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
