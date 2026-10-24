// ميزان الخوارزمي مجسّماً: دار الحكمة والمدرسة والورشة (omaniHouse) بقباب، رواق مقوّس، مرصد برج دائري بقبة ومنظار، الميزان الكبير
// يتمايل، حديقة رباعية بأحواض وشجيرات مزهرة ونافورة وماء جارٍ، جناح ساعة الماء، بيوت حديثة ومسجد وشوارع حيّة، ونصب ذات الحلق يدور.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree, shrubs } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  const plaster = c => material('plaster', c), gold = metal('#C8961E', .25), K = D.kit;
  const domeAt = (P, x, y, z, r, col = '#F1ECE2') => { P.add(plaster(col), new THREE.CylinderGeometry(r, r, r * .45, 20).translate(x, y + r * .22, z)); P.add(plaster(col), new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, y + r * .45, z)); P.add(gold, new THREE.CylinderGeometry(1.5, 1.5, 16, 6).translate(x, y + r * 1.45 + 8, z)); };
  // دار الحكمة بقبتين ورواق
  { const L = D.LIB, H3 = L.H * SCALE_H; root.add(omaniHouse({ ...L, wall: '#F3E9D2', door: '#0F766E', style: 'shop', sign: 'دار الحكمة' }));
    const P = new Parts(); domeAt(P, L.x + 140, H3, L.y + L.h * .55, 54); domeAt(P, L.x + L.w - 140, H3, L.y + L.h * .55, 54);
    const ay = L.y + L.h + 30; for (let x = L.x + 20; x < L.x + L.w - 10; x += 64) P.add(plaster('#E9DCC2'), box(10, 80, 10, x + 5, 40, ay));
    P.add(plaster('#E9DCC2'), box(L.w - 20, 14, 26, L.x + L.w / 2, 86, ay)); for (let x = L.x + 20; x < L.x + L.w - 70; x += 64) P.add(plaster('#D8C4A2'), new THREE.TorusGeometry(26, 3.5, 6, 16, Math.PI).translate(x + 37, 70, ay + 6));
    root.add(P.build()); }
  // المرصد: برج دائري بقبة ومنظار
  { const O = D.OBS, P = new Parts(), h3 = O.H * 1.05; P.add(material('stone', '#DCC9A3'), new THREE.CylinderGeometry(O.r - 4, O.r, h3, 24).translate(O.x, h3 / 2, O.y)); domeAt(P, O.x, h3, O.y, O.r * .8, '#E2E8F0');
    P.add(metal('#B87333'), new THREE.CylinderGeometry(6, 9, 90, 12).rotateZ(-.9).translate(O.x + 30, h3 + O.r * .7, O.y)); root.add(P.build()); }
  // الميزان الكبير يتمايل
  { const B = D.BAL, P = new Parts(); P.add(material('stone', '#9A7B4F'), box(90, 16, 60, B.x, 8, B.y)); P.add(gold, new THREE.CylinderGeometry(6, 8, 170, 12).translate(B.x, 95, B.y)); root.add(P.build());
    const beam = new THREE.Group(); beam.position.set(B.x, 180, B.y); const bm = new THREE.Mesh(new THREE.BoxGeometry(240, 10, 10), gold); beam.add(bm);
    const pans = [-1, 1].map(s => { const g = new THREE.Group(); g.position.x = s * 115; const pan = new THREE.Mesh(new THREE.CylinderGeometry(40, 30, 6, 20), gold); pan.position.y = -70; g.add(pan);
      [[-30, 0], [30, 0], [0, -30], [0, 30]].forEach(([a, b]) => { const ch = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 72, 4), metal('#8B6914')); ch.position.set(a / 2, -35, b / 2); ch.lookAt(0, 0, 0); g.add(ch); }); beam.add(g); return g; });
    root.add(beam); ticks.push(() => { beam.rotation.z = Math.sin(K.t * .8) * .06; pans.forEach(p => { p.rotation.z = -beam.rotation.z; }); }); }
  // الحديقة الرباعية
  { const G = D.GARDEN, P = new Parts(), list = [], cols = ['#F472B6', '#FACC15', '#A855F7', '#EF4444'];
    D.BEDS.forEach((b, j) => { P.add(material('stone', '#D6C7AE'), box(b.w, 14, b.h, b.x + b.w / 2, 7, b.y + b.h / 2)); P.add(flat('#5B4636'), box(b.w - 8, 1, b.h - 8, b.x + b.w / 2, 14.5, b.y + b.h / 2)); for (let x = b.x + 22; x < b.x + b.w - 10; x += 32) for (let y = b.y + 26; y < b.y + b.h - 10; y += 38) list.push({ x, y, f: 1, r: 12 }); });
    const water = new THREE.Mesh(new THREE.BoxGeometry(12, 2, G.h), new THREE.MeshStandardMaterial({ color: '#4FA3D9', roughness: .1 })); water.position.set(G.x + G.w / 2, 1, G.y + G.h / 2); root.add(water);
    const water2 = water.clone(); water2.scale.set(G.w / 12, 1, 12 / G.h); water2.position.set(G.x + G.w / 2, 1, G.y + G.h / 2); root.add(water2);
    P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(34, 36, 14, 24).translate(G.x + G.w / 2, 7, G.y + G.h / 2 + 10)); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(4, 5, 40, 10).translate(G.x + G.w / 2, 30, G.y + G.h / 2 + 10));
    root.add(P.build()); const sh = shrubs(list); sh.position.y = 14; root.add(sh); }
  // المدرسة والورشة والصناديق
  { const S = D.SCHOOL; root.add(omaniHouse({ ...S, wall: '#FDE8C8', door: '#1E3A8A', style: 'shop', sign: 'المدرسة' })); const P = new Parts(); domeAt(P, S.x + S.w / 2, S.H * SCALE_H, S.y + S.h * .5, 40); root.add(P.build()); }
  root.add(omaniHouse({ ...D.SHOP, wall: '#EAD9BF', door: '#9D174D', style: 'shop', sign: 'ورشة الصناديق' }));
  { const P = new Parts(); [[0, 0, 0], [34, 0, 0], [17, 30, 0]].forEach(([dx, dy]) => P.add(material('wood', '#B8834A'), box(30, 30, 30, 2009 + dx, 15 + dy, 675))); root.add(P.build()); }
  // جناح ساعة الماء
  { const C = D.CLOCK, P = new Parts(); [[-30, -30], [30, -30], [-30, 30], [30, 30]].forEach(([a, b]) => P.add(plaster('#E9DCC2'), box(8, 100, 8, C.x + a, 50, C.y + b))); P.add(plaster('#E9DCC2'), box(72, 10, 72, C.x, 104, C.y)); domeAt(P, C.x, 109, C.y, 30);
    P.add(metal('#B87333'), new THREE.CylinderGeometry(20, 14, 18, 18).translate(C.x, 40, C.y)); root.add(P.build()); }
  // البيوت والمسجد والأكشاك والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); });
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب ذات الحلق في الدوّار، وقوس القرية ولافتات المحطات
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(40, 44, 16, 20).translate(R.x, 8, R.y)); P.add(metal('#9A7B4F'), new THREE.CylinderGeometry(5, 6, 60, 10).translate(R.x, 46, R.y)); root.add(P.build());
    const sph = new THREE.Group(); sph.position.set(R.x, 130, R.y); root.add(sph);
    const rings = [[gold, 0, 0], [metal('#0F766E'), Math.PI / 2, 0], [metal('#B87333'), .5, .9]].map(([m, rx, ry]) => { const r = new THREE.Mesh(new THREE.TorusGeometry(52, 3, 8, 40), m); r.rotation.set(rx, ry, 0); sph.add(r); return r; });
    const core = new THREE.Mesh(new THREE.SphereGeometry(9, 14, 10), new THREE.MeshStandardMaterial({ color: '#FDE68A', emissive: '#F59E0B', emissiveIntensity: .6 })); sph.add(core);
    ticks.push(() => { sph.rotation.y = K.t * .4; rings[1].rotation.y = K.t * .7; rings[2].rotation.x = .5 + K.t * .5; });
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#0F766E'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#0F766E'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('📜 ميزان الخوارزمي', 22); sg.position.set(R.x, 126, y + 8); root.add(sg);
    D.stations.forEach(s => { const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(s.x, 92, s.y + 4); root.add(m); }); }
  { const a = new THREE.Vector3(1534, 115, 1000), b = new THREE.Vector3(1786, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(['#0F766E', '#FFFFFF', '#C8961E', '#1E3A8A'][k % 4])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
