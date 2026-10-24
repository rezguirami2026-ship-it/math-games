// مزارع الأفلاج مجسّمةً: ساقية الفلج بحافتين حجريتين وماء يلمع، أم الفلج ببكرة ودلو، الشريعة، الأثر (مزولة)، الجابية، حقول البرسيم،
// بيوت الطين وبرج الحارة، البيدر وكومة القش، بيتا زراعة نصف أسطوانيين، الخزّانات الأسطوانية بسلالمها، بيت المضخة، برج المراقبة،
// بيوت حديثة ومسجد وشوارع حيّة، ونصب الجرّة يصبّ الماء في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree, shrubs } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  const stone = c => material('stone', c), K = D.kit, waterMat = new THREE.MeshStandardMaterial({ color: '#3B82C4', roughness: .12, metalness: .25, transparent: true, opacity: .92 });
  // ساقية الفلج: حافتان حجريتان وماء بينهما
  { const P = new Parts(); D.CH.forEach(([a, b, c, d]) => { const hor = b === d, L = Math.hypot(c - a, d - b), mx = (a + c) / 2, mz = (b + d) / 2;
      [-1, 1].forEach(s => P.add(stone('#A8A29E'), hor ? box(L + 22, 10, 5, mx, 5, mz + s * 8.5) : box(5, 10, L + 22, mx + s * 8.5, 5, mz)));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(hor ? L + 12 : 12, hor ? 12 : L + 12).rotateX(-Math.PI / 2), waterMat); m.position.set(mx, 3, mz); root.add(m); });
    root.add(P.build()); }
  // أم الفلج: بئر حجرية بإطار خشبي وبكرة ودلو
  { const S = D.SRC, P = new Parts(); P.add(stone('#9C948A'), new THREE.CylinderGeometry(S.r, S.r + 2, 22, 22, 1, true).translate(S.x, 11, S.y)); P.add(stone('#B9B2A8'), new THREE.TorusGeometry(S.r, 4, 6, 22).rotateX(Math.PI / 2).translate(S.x, 22, S.y));
    P.add(flat('#1E3A5F'), new THREE.CircleGeometry(S.r - 3, 20).rotateX(-Math.PI / 2).translate(S.x, 14, S.y));
    [-1, 1].forEach(s => P.add(material('wood', '#7A4A2A'), box(6, 70, 6, S.x + s * (S.r - 4), 35, S.y))); P.add(material('wood', '#7A4A2A'), box(S.r * 2, 6, 6, S.x, 70, S.y));
    root.add(P.build()); const bucket = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 10, 10), material('wood', '#8B5A33')); root.add(bucket);
    ticks.push(() => bucket.position.set(S.x, 42 + Math.sin(K.t * .9) * 10, S.y));
    const sg = signMesh('💧 أم الفلج', 16); sg.position.set(S.x - 70, 70, S.y + 30); root.add(sg); }
  // الشريعة والأثر
  { const Sh = D.SHARIA, P = new Parts(); P.add(stone('#B9B2A8'), box(68, 8, 52, Sh.x, 4, Sh.y)); [[-30, 0], [30, 0], [0, 26]].forEach(([dx, dz]) => P.add(material('wood', '#7A4A2A'), box(6, 24, 6, Sh.x + dx, 12, Sh.y + dz)));
    const dl = D.DIAL; P.add(material('wood', '#6B4520'), box(6, 70, 6, dl.x, 35, dl.y)); for (let q = 0; q < 5; q++) { const a = -Math.PI * .9 + q * Math.PI * .2; P.add(stone('#9C948A'), new THREE.CylinderGeometry(7, 8, 4, 8).translate(dl.x + Math.cos(a) * 66, 2, dl.y + Math.sin(a) * 66)); }
    root.add(P.build()); const sh = new THREE.Mesh(new THREE.PlaneGeometry(60, 5).translate(30, 0, 0).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .35 })); sh.position.set(dl.x, 1.5, dl.y); root.add(sh);
    ticks.push(() => { sh.rotation.y = -(-Math.PI * .9 + ((K.t * .03) % 1) * Math.PI * .8); }); }
  // الجابية: حلقة حجرية وماء
  { const J = D.JABIA, P = new Parts(); P.add(stone('#A8A29E'), new THREE.CylinderGeometry(J.r + 10, J.r + 12, 20, 32, 1, true).translate(J.x, 10, J.y)); P.add(stone('#B9B2A8'), new THREE.TorusGeometry(J.r + 10, 5, 6, 32).rotateX(Math.PI / 2).translate(J.x, 20, J.y));
    root.add(P.build()); const w = new THREE.Mesh(new THREE.CircleGeometry(J.r + 8, 32).rotateX(-Math.PI / 2), waterMat); w.position.set(J.x, 12, J.y); root.add(w); }
  // حقول البرسيم
  { const P = new Parts(); D.PLOTS.forEach(([x, y, w, h], i) => { P.add(material('wood', '#8B6B47'), box(w, 4, h, x + w / 2, 2, y + h / 2)); for (let yy = y + 8; yy < y + h - 4; yy += 12) P.add(flat(i % 2 ? '#65A30D' : '#7FB24A'), box(w - 10, 6, 7, x + w / 2, 6, yy)); }); root.add(P.build()); }
  // حوض السقي
  { const B = D.BASIN, P = new Parts(); P.add(stone('#CBB892'), box(B.w, 26, B.h, B.x + B.w / 2, 13, B.y + B.h / 2)); root.add(P.build()); const w = new THREE.Mesh(new THREE.PlaneGeometry(B.w - 16, B.h - 14).rotateX(-Math.PI / 2), waterMat); w.position.set(B.x + B.w / 2, 26.5, B.y + B.h / 2); root.add(w); }
  // الحارة القديمة: بيوت طين وبرج بشرفات
  D.OLD.forEach(b => root.add(omaniHouse({ ...b })));
  { const F = D.FORT, P = new Parts(), h3 = F.H; P.add(stone('#C8A273'), new THREE.CylinderGeometry(F.r - 4, F.r, h3, 22).translate(F.x, h3 / 2, F.y)); for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI * 2; P.add(stone('#B08A5C'), box(12, 14, 12, F.x + Math.cos(a) * (F.r - 6), h3 + 7, F.y + Math.sin(a) * (F.r - 6))); } root.add(P.build()); }
  // البيدر وكومة القش
  { const B = D.BAIDAR, P = new Parts(); P.add(flat('#D9BE8A'), new THREE.CylinderGeometry(B.r, B.r, 2, 32).translate(B.x, 1, B.y)); P.add(stone('#A8865A'), new THREE.TorusGeometry(B.r, 4, 5, 32).rotateX(Math.PI / 2).translate(B.x, 2, B.y));
    P.add(flat('#EAB308'), new THREE.SphereGeometry(30, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, .75, .8).translate(B.x + B.r - 20, 0, B.y + 10)); root.add(P.build()); }
  // بيتا الزراعة: نصف أسطوانة شفافة بأضلاع ونباتات
  D.GREEN.forEach((b, i) => { const R0 = b.h / 2, P = new Parts(); for (let x = b.x + 20; x < b.x + b.w - 10; x += 26) P.add(flat(i ? '#16A34A' : '#65A30D'), new THREE.SphereGeometry(8, 8, 6).translate(x, 6, b.y + b.h / 2));
    for (let x = b.x; x <= b.x + b.w; x += 30) P.add(metal('#94A3B8'), new THREE.TorusGeometry(R0, 1.2, 4, 16, Math.PI).rotateY(Math.PI / 2).translate(x, 0, b.y + b.h / 2), { uv: false });
    root.add(P.build()); const skin = new THREE.Mesh(new THREE.CylinderGeometry(R0, R0, b.w, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#E2F0E8', roughness: .3, transparent: true, opacity: .55, side: THREE.DoubleSide })); skin.position.set(b.x + b.w / 2, 0, b.y + b.h / 2); root.add(skin); });
  // الخزّانات الأسطوانية وسلالمها، وبيت المضخة، وبرج المراقبة
  { const P = new Parts(); D.TANKS.forEach(([x, y, r, h]) => { P.add(material('metal', '#F8FAFC', { rough: .45, metal: .2 }), new THREE.CylinderGeometry(r, r, h, 28).translate(x, h / 2, y)); P.add(material('metal', '#CBD5E1', { rough: .45, metal: .2 }), new THREE.CylinderGeometry(r + 1, r + 1, 4, 28).translate(x, h, y));
      [-6, 6].forEach(o => P.add(metal('#475569'), box(2, h, 2, x + r * .55 + o, h / 2, y + r * .85))); for (let yy = 10; yy < h; yy += 12) P.add(metal('#475569'), box(14, 1.5, 2, x + r * .55, yy, y + r * .85)); }); root.add(P.build()); }
  root.add(omaniHouse({ ...D.PUMP, wall: '#E7E2D5', door: '#1D4ED8', style: 'shop', sign: 'بيت المضخة' }));
  { const Wt = D.WATCH, P = new Parts(); P.add(stone('#D2B48C'), new THREE.CylinderGeometry(Wt.r - 4, Wt.r, Wt.H, 20).translate(Wt.x, Wt.H / 2, Wt.y)); P.add(stone('#C2A27A'), new THREE.CylinderGeometry(Wt.r + 4, Wt.r, 14, 20).translate(Wt.x, Wt.H + 7, Wt.y));
    P.add(material('wood', '#B91C1C'), box(3, 50, 3, Wt.x, Wt.H + 39, Wt.y)); root.add(P.build()); const flag = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), new THREE.MeshStandardMaterial({ color: '#16A34A', side: THREE.DoubleSide })); flag.position.set(Wt.x + 16, Wt.H + 56, Wt.y); root.add(flag);
    ticks.push(t => { flag.rotation.y = Math.sin(t * 2) * .2; }); }
  // البيوت والمسجد والأكشاك والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); });
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب الجرّة في الدوّار، وقوس القرية ولافتات المحطات
  { const R = D.RING, P = new Parts(); P.add(stone('#E7E5E4'), new THREE.CylinderGeometry(46, 48, 14, 24).translate(R.x, 7, R.y)); P.add(stone('#9A7B4F'), box(10, 80, 10, R.x + 25, 40, R.y)); root.add(P.build());
    const w = new THREE.Mesh(new THREE.CircleGeometry(40, 24).rotateX(-Math.PI / 2), waterMat); w.position.set(R.x, 14.5, R.y); root.add(w);
    const jar = new THREE.Group(); jar.position.set(R.x + 10, 104, R.y); jar.rotation.z = .9; root.add(jar);
    const body = new THREE.Mesh(new THREE.SphereGeometry(26, 18, 14).scale(1, 1.3, 1), material('plaster', '#B4643C')); jar.add(body); const neck = new THREE.Mesh(new THREE.CylinderGeometry(9, 12, 16, 14), material('plaster', '#8C4A2B')); neck.position.y = 38; jar.add(neck);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 92, 8), new THREE.MeshStandardMaterial({ color: '#93C5FD', transparent: true, opacity: .75, emissive: '#60A5FA', emissiveIntensity: .3 })); stream.position.set(R.x - 24, 60, R.y); root.add(stream);
    ticks.push(t => { stream.scale.x = stream.scale.z = 1 + Math.sin(t * 8) * .12; });
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(stone('#15803D'), box(12, 150, 12, R.x + o, 75, y))); A.add(stone('#15803D'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('💧 مزارع الأفلاج', 22); sg.position.set(R.x, 126, y + 8); root.add(sg);
    D.stations.forEach(s => { const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(s.x, 92, s.y + 4); root.add(m); }); }
  { const a = new THREE.Vector3(1914, 115, 1000), b = new THREE.Vector3(2166, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(['#15803D', '#FFFFFF', '#B91C1C', '#FACC15'][k % 4])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
