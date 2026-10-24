// مكتب المحقق مجسّماً: مكتب المحقق بمصباح أزرق يومض، ومقهى الشهود بطاولتين ومظلتين، والمحكمة بأعمدتها وجملونها، ومتحف القرية، وبرج المراقبة
// بكشاف يدور، وساحة الشريط الأصفر بأقماعها وقاعدة الجرّة الفارغة، وأكشاك الدروس، وبيوت حديثة ومسجد وشوارع حيّة، ونصب العدسة المكبّرة.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#1E3A8A', '#FFFFFF', '#B45309', '#FACC15', '#15803D'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  const glowM = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1, roughness: .4 });
  [D.HQ, D.CAFE, D.COURT, D.MUSEUM].forEach(b => root.add(omaniHouse({ ...b })));
  // المصباح الأزرق فوق مكتب المحقق
  { const H3 = D.HQ.H * SCALE_H, lamp = new THREE.Mesh(new THREE.SphereGeometry(9, 14, 10), glowM('#3B82F6')); lamp.position.set(D.HQ.x + 40, H3 + 14, D.HQ.y + D.HQ.h - 10); root.add(lamp);
    const P = new Parts(); P.add(metal('#334155'), box(8, 12, 8, D.HQ.x + 40, H3 + 4, D.HQ.y + D.HQ.h - 10)); root.add(P.build());
    ticks.push(t => { const on = Math.sin(t * 5) > 0; lamp.material.emissiveIntensity = on ? 1.8 : .15; }); }
  // طاولتا المقهى بمظلتين مخططتين
  D.TABLES.forEach(([x, y], i) => { const P = new Parts(); P.add(metal('#78350F'), box(4, 70, 4, x, 35, y)); P.add(material('wood', '#A16207'), new THREE.CylinderGeometry(22, 22, 3, 18).translate(x, 22, y), { uv: false }); [-1, 1].forEach(sd => P.add(material('wood', '#57534E'), box(12, 16, 12, x + sd * 26, 8, y))); root.add(P.build());
    const u = new THREE.Mesh(new THREE.ConeGeometry(40, 20, 16, 1, true), new THREE.MeshStandardMaterial({ map: stripes(THREE, i ? '#1E3A8A' : '#B45309', '#FFFFFF', 16), roughness: .7, side: THREE.DoubleSide })); u.position.set(x, 80, y); root.add(u); });
  // أعمدة المحكمة وجملونها وميزانها
  { const C = D.COURT, zf = C.y + C.h + 8, Hc = 126 * SCALE_H, P = new Parts();
    for (let q = 0; q < 6; q++) { const x = C.x + 30 + q * (C.w - 60) / 5; P.add(material('plaster', '#FAFAF9'), new THREE.CylinderGeometry(8, 9, Hc, 14).translate(x, Hc / 2, zf), { uv: false }); P.add(material('plaster', '#D6D3D1'), box(22, 8, 22, x, Hc + 4, zf)); }
    P.add(material('plaster', '#E7E5E4'), box(C.w - 10, 10, 28, C.x + C.w / 2, Hc + 13, zf)); root.add(P.build());
    const ped = new THREE.BufferGeometry(), x0 = C.x + 8, x1 = C.x + C.w - 8, y0 = Hc + 18, y1 = Hc + 52, zz = zf + 14;
    ped.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, zz, x1, y0, zz, (x0 + x1) / 2, y1, zz, x0, y0, zz - 26, (x0 + x1) / 2, y1, zz - 26, x1, y0, zz - 26], 3)); ped.setIndex([0, 1, 2, 3, 4, 5, 0, 2, 4, 0, 4, 3, 1, 5, 4, 1, 4, 2]); ped.computeVertexNormals();
    root.add(new THREE.Mesh(ped, new THREE.MeshStandardMaterial({ color: '#E7E5E4', roughness: .6, side: THREE.DoubleSide })));
    const S = new Parts(), sx = (x0 + x1) / 2; S.add(metal('#A16207'), box(2, 18, 2, sx, y0 + 12, zz + 1)); S.add(metal('#A16207'), box(30, 2, 2, sx, y0 + 20, zz + 1)); [-14, 14].forEach(o => S.add(metal('#A16207'), new THREE.CylinderGeometry(6, 3, 3, 12).translate(sx + o, y0 + 12, zz + 1), { uv: false })); root.add(S.build()); }
  // برج المراقبة وكشافه
  { const T = D.TOWER, P = new Parts(); P.add(material('stone', '#D6CFC2'), new THREE.CylinderGeometry(T.r, T.r + 4, T.H, 24).translate(T.x, T.H / 2, T.y), { uv: false }); P.add(material('stone', '#57534E'), new THREE.CylinderGeometry(T.r + 10, T.r + 10, 8, 24).translate(T.x, T.H + 4, T.y), { uv: false });
    root.add(P.build()); const roof = new THREE.Mesh(new THREE.ConeGeometry(T.r + 6, 46, 20), flat('#1E3A8A')); roof.position.set(T.x, T.H + 36, T.y); root.add(roof);
    const head = new THREE.Group(); head.position.set(T.x, T.H + 14, T.y); root.add(head); const lamp = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 12, 12), glowM('#FEF9C3')); lamp.rotation.z = Math.PI / 2; lamp.position.x = 10; head.add(lamp);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(40, 240, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#FEF9C3', transparent: true, opacity: .12, side: THREE.DoubleSide, depthWrite: false })); beam.rotation.z = Math.PI / 2 + .35; beam.position.set(130, -40, 0); head.add(beam);
    ticks.push(t => { head.rotation.y = -t * .7; }); }
  // ساحة الشريط الأصفر
  { const S = D.SCENE, P = new Parts(); P.add(material('stone', '#A8A29E'), box(44, 50, 44, S.x + 120, 25, S.y + 85)); P.add(material('stone', '#D6D3D1'), box(56, 8, 56, S.x + 120, 50, S.y + 85));
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => P.add(flat('#F97316'), new THREE.ConeGeometry(8, 40, 10).translate(S.x + a * S.w, 20, S.y + b * S.h), { uv: false })); root.add(P.build());
    const tapeTx = stripes(THREE, '#FACC15', '#111827', 20), pts = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    for (let q = 0; q < 4; q++) { const [ax, ay] = pts[q], [bx, by] = pts[q + 1], x1 = S.x + ax * S.w, z1 = S.y + ay * S.h, x2 = S.x + bx * S.w, z2 = S.y + by * S.h, L = Math.hypot(x2 - x1, z2 - z1);
      const tp = new THREE.Mesh(new THREE.PlaneGeometry(L, 5), new THREE.MeshStandardMaterial({ map: tapeTx, side: THREE.DoubleSide })); tp.position.set((x1 + x2) / 2, 30, (z1 + z2) / 2); tp.rotation.y = -Math.atan2(z2 - z1, x2 - x1); root.add(tp); }
    const sg = signMesh('❓ الجرّة المسروقة', 16); sg.position.set(S.x + 120, 76, S.y + 108); root.add(sg); }
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
  // نصب العدسة المكبّرة، وقوس الحي
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y));
    const h = new THREE.CylinderGeometry(6, 7, 60, 12); h.rotateZ(.5); h.translate(R.x + 10, 14 + 30, R.y); P.add(material('wood', '#78350F'), h, { uv: false });
    P.add(metal('#A16207', .35), new THREE.TorusGeometry(36, 5, 10, 28).translate(R.x - 20, 14 + 90, R.y), { uv: false }); root.add(P.build());
    const lens = new THREE.Mesh(new THREE.CircleGeometry(34, 28), new THREE.MeshStandardMaterial({ color: '#BAE6FD', transparent: true, opacity: .45, roughness: .05, metalness: .2, side: THREE.DoubleSide })); lens.position.set(R.x - 20, 14 + 90, R.y); root.add(lens);
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#1E3A8A'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#1E3A8A'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🔎 مكتب المحقق', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
