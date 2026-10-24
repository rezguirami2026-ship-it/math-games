// مصنع التغليف مجسّماً: قاعة بسقف معدني ونوافذ علوية (omani.warehouse) ومدخنة حمراء بدخان، سير إنتاج بصناديق تتحرك، منصّات صناديق،
// رافعة شوكية تتجول، خزان ماء، مختبر، بحيرة حقيقية ببطّ، بيوت حديثة ومسجد وشوارع حيّة، ونصب المكعب في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, warehouse, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const BOXC = ['#E11D48', '#F59E0B', '#16A34A', '#2563EB', '#7C3AED', '#0EA5E9'];
export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .45) => material('metal', c, { rough: r, metal: .5 });
  const cardboard = c => material('flat', c, { rough: .85 });
  const boxGeo = (s, x, y, z) => box(s, s, s, x, y, z);
  // القاعة والمختبر
  root.add(warehouse(D.HALL, D.HALL.H)); root.add(omaniHouse({ ...D.LAB, wall: '#FDE68A', door: '#1E3A8A', style: 'shop' }));
  // المدخنة ودخانها
  { const Ch = D.CHIMNEY, Hh = Ch.H * 1.1, P = new Parts(); P.add(material('stone', '#B91C1C'), new THREE.CylinderGeometry(Ch.r - 6, Ch.r, Hh, 16).translate(Ch.x, Hh / 2, Ch.y)); P.add(flat('#F8FAFC'), new THREE.CylinderGeometry(Ch.r - 4, Ch.r - 4, 14, 16).translate(Ch.x, Hh * .8, Ch.y)); root.add(P.build());
    const puffs = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(14, 10, 8), new THREE.MeshStandardMaterial({ color: '#E5E7EB', transparent: true, opacity: .55, depthWrite: false })); root.add(m); return m; });
    ticks.push(t => puffs.forEach((m, k) => { const u = (t * .25 + k / 7) % 1; m.position.set(Ch.x + u * 50 + Math.sin(t + k) * 8, Hh + u * 160, Ch.y); m.scale.setScalar(1 + u * 2); m.material.opacity = .55 * (1 - u); })); }
  // خزان الماء
  { const Tw = D.TOWERW, P = new Parts(); [[-28, -28], [28, -28], [-28, 28], [28, 28]].forEach(([a, b]) => P.add(metal('#64748B'), box(6, Tw.H, 6, Tw.x + a, Tw.H / 2, Tw.y + b))); P.add(metal('#38BDF8', .3), new THREE.CylinderGeometry(Tw.r, Tw.r, 60, 20).translate(Tw.x, Tw.H + 30, Tw.y)); P.add(metal('#7DD3FC', .3), new THREE.ConeGeometry(Tw.r + 4, 24, 20).translate(Tw.x, Tw.H + 72, Tw.y)); root.add(P.build()); }
  // سير الإنتاج والصناديق المتحركة
  { const B = D.BELT, P = new Parts(); P.add(metal('#3F3F46'), box(B.x1 - B.x0, 12, 34, (B.x0 + B.x1) / 2, 30, B.y - 15)); for (let x = B.x0 + 20; x < B.x1; x += 120) P.add(metal('#71717A'), box(8, 30, 30, x, 15, B.y - 15)); root.add(P.build());
    const bx = D.fac.boxes.map((_, k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), cardboard(BOXC[k % 6])); m.castShadow = true; root.add(m); return m; });
    ticks.push(() => bx.forEach((m, k) => { m.position.set(B.x0 + 20 + D.fac.boxes[k] * (B.x1 - B.x0 - 40), 51, B.y - 15); })); }
  // منصّات الصناديق ورصيف التحميل
  { const P = new Parts(); D.PALLETS.forEach(([x, y], k) => { P.add(material('wood', '#9A6A3E'), box(64, 8, 30, x, 4, y - 12)); for (let j = 0; j < 3; j++) P.add(cardboard(BOXC[(k + j) % 6]), boxGeo(28, x - 16 + (j % 2) * 32, 22 + (j > 1 ? 30 : 0), y - 12)); });
    P.add(material('stone', '#94A3B8'), box(D.DOCK.w, 30, D.DOCK.h, D.DOCK.x + D.DOCK.w / 2, 15, D.DOCK.y + D.DOCK.h / 2)); root.add(P.build()); }
  // الرافعة الشوكية
  const fork = new THREE.Group(); { const P = new Parts(); P.add(metal('#FACC15', .5), box(40, 24, 30, 0, 20, 0)); P.add(metal('#1F2937'), box(4, 26, 4, -12, 44, -12)); P.add(metal('#1F2937'), box(4, 26, 4, -12, 44, 12)); P.add(metal('#1F2937'), box(30, 4, 30, -4, 58, 0));
    P.add(metal('#374151'), box(4, 50, 26, 22, 25, 0)); P.add(metal('#374151'), box(24, 3, 20, 34, 6, 0)); P.add(cardboard('#2563EB'), boxGeo(22, 34, 19, 0)); [[-12, -16], [12, -16], [-12, 16], [12, 16]].forEach(([a, b]) => P.add(flat('#111827'), new THREE.CylinderGeometry(7, 7, 5, 12).rotateX(Math.PI / 2).translate(a, 7, b)));
    fork.add(P.build()); root.add(fork); ticks.push(() => { fork.position.set(D.fac.fork.x, 0, D.fac.fork.y); fork.rotation.y = -(D.fac.fork.ang || 0); }); }
  // البحيرة والبطّ
  { const Pd = D.POND, water = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: '#2B86C5', roughness: .12, metalness: .15 })); water.rotation.x = -Math.PI / 2; water.scale.set(Pd.rx, Pd.ry, 1); water.position.set(Pd.x, .6, Pd.y); root.add(water);
    const ducks = D.fac.ducks.map((_, k) => { const g = new THREE.Group(), P = new Parts(); P.add(flat(k % 2 ? '#F8FAFC' : '#A16207'), new THREE.SphereGeometry(9, 10, 8).scale(1.4, .8, 1)); P.add(flat(k % 2 ? '#F8FAFC' : '#A16207'), new THREE.SphereGeometry(5, 8, 6).translate(10, 9, 0)); P.add(flat('#F59E0B'), box(5, 2, 3, 16, 9, 0)); g.add(P.build()); root.add(g); return g; });
    ticks.push(t => { water.material.color.setHSL(.57, .62, .47 + Math.sin(t) * .02); ducks.forEach((g, k) => { const a = D.fac.t * .15 + D.fac.ducks[k]; g.position.set(Pd.x + Math.cos(a) * Pd.rx * .55, 2 + Math.sin(t * 2 + k) * .8, Pd.y + Math.sin(a) * Pd.ry * .45); g.rotation.y = -a - Math.PI / 2; }); }); }
  // البيوت والمسجد والأكشاك والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); });
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب المكعب وقوس المصنع واللافتات
  { const R = D.RING, P = new Parts(); P.add(cardboard('#F59E0B'), boxGeo(62, R.x - 10, 36, R.y)); P.add(cardboard('#E11D48'), box(4, 56, 56, R.x + 44, 30, R.y)); P.add(cardboard('#2563EB'), box(4, 56, 56, R.x - 66, 30, R.y)); root.add(P.build());
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(metal('#EA580C'), box(12, 150, 12, 1150 + o, 75, y))); A.add(metal('#EA580C'), box(212, 14, 14, 1150, 150, y)); root.add(A.build());
    const sg = signMesh('📦 مصنع التغليف', 22); sg.position.set(1150, 126, y + 8); root.add(sg);
    const sh = signMesh('مصنع التغليف', 26); sh.position.set(D.HALL.x + D.HALL.w / 2, D.HALL.H * SCALE_H + 20, D.HALL.y + D.HALL.h + 4); root.add(sh);
    D.stations.forEach(s => { const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(s.x, 92, s.y + 4); root.add(m); }); }
  { const a = new THREE.Vector3(1024, 115, 1000), b = new THREE.Vector3(1276, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(['#EA580C', '#FFFFFF', '#2563EB', '#16A34A'][k % 4])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
