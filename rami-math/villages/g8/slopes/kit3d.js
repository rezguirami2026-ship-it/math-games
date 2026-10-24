// منحدرات التزلج مجسّماً: كثبان رملية ناعمة، ومسارات تزلج خشبية تنحدر من قممها بمتزلجين ينزلقون، ومصعد كراسٍ بأعمدة وكابل وكراسٍ تتحرك،
// واستراحة المنتجع، وبرج الإنقاذ برايته، وأكشاك الدروس، وبيوت حديثة ومسجد وشوارع حيّة، ونصب «ص = م س + جـ» في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#0369A1', '#FFFFFF', '#F59E0B', '#DC2626', '#15803D'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 }), L = D.LIFT;
  // الكثبان: نصف كرة مفلطحة لكل كثيب
  const sand = new THREE.MeshStandardMaterial({ color: '#E9C07A', roughness: .95 });
  D.DUNES.forEach(([x, y, w, d, H2]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), sand); m.scale.set(w / 2, H2, d * .9); m.position.set(x + w / 2, 0, y + d / 2); m.receiveShadow = true; root.add(m); });
  const duneH = (x, z) => { let h = 0; D.DUNES.forEach(([dx, dy, w, d, H2]) => { const u = (x - dx - w / 2) / (w / 2), v = (z - dy - d / 2) / (d * .9); const r = u * u + v * v; if (r < 1) h = Math.max(h, H2 * Math.sqrt(1 - r)); }); return h; };
  // مسارات التزلج: لوح خشبي من القمة إلى القاعدة، ومتزلج ينزلق عليه
  D.RUNS.forEach(([x1, y1, x2, y2, col], j) => { const h1 = Math.max(60, duneH(x1, y1)), A = new THREE.Vector3(x1, h1, y1), B = new THREE.Vector3(x2, 1, y2), len = A.distanceTo(B);
    const plank = new THREE.Mesh(new THREE.BoxGeometry(30, 3, len), new THREE.MeshStandardMaterial({ map: stripes(THREE, '#C08A4E', '#A87440', 16), roughness: .8 })); plank.position.copy(A).lerp(B, .5); plank.lookAt(B); root.add(plank);
    [-1, 1].forEach(sd => { const rail = new THREE.Mesh(new THREE.BoxGeometry(2, 5, len), flat(col)); rail.position.copy(plank.position); rail.quaternion.copy(plank.quaternion); rail.translateX(sd * 15); rail.translateY(3); root.add(rail); });
    const sk = new THREE.Group(), P = new Parts(); P.add(flat(col), box(18, 3, 6, 0, 1.5, 0)); P.add(flat(['#F97316', '#2563EB', '#16A34A', '#DB2777'][j % 4]), box(8, 14, 6, 0, 10, 0)); P.add(flat('#C68A5B'), box(7, 7, 7, 0, 21, 0)); sk.add(P.build()); root.add(sk);
    ticks.push(() => { const u = (K.t * .18 + j * .27) % 1; sk.position.copy(A).lerp(B, u); sk.position.y += 3; sk.lookAt(B.x, sk.position.y, B.z); });
    const sg = signMesh(`الميل ${['٠٫٥', '١', '٢', '١٫٥'][j % 4]}`, 14); sg.position.set(x2, 22, y2 + 16); root.add(sg); });
  // مصعد الكراسي: أعمدة وكابل وكراسٍ تتحرك
  { const P = new Parts(), tops = []; for (let q = 0; q < L.n; q++) { const u = q / (L.n - 1), x = L.x0 + (L.x1 - L.x0) * u, z = L.y0 + (L.y1 - L.y0) * u, base = duneH(x, z) * .8, hh = 110 + base; P.add(metal('#475569'), box(8, hh, 8, x, hh / 2, z)); P.add(metal('#475569'), box(36, 6, 6, x, hh, z)); tops.push(new THREE.Vector3(x, hh, z)); }
    root.add(P.build()); const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tops), new THREE.LineBasicMaterial({ color: '#334155' })); root.add(cable);
    const chairs = Array.from({ length: 7 }, (_, q) => { const g = new THREE.Group(), C = new Parts(); C.add(metal('#475569'), box(2, 18, 2, 0, -9, 0)); C.add(flat(FLAGC[q % 5] === '#FFFFFF' ? '#F59E0B' : FLAGC[q % 5]), box(18, 4, 12, 0, -20, 0)); C.add(flat('#334155'), box(18, 10, 2, 0, -14, -6)); g.add(C.build()); root.add(g); return g; });
    ticks.push(() => chairs.forEach((g, q) => { const u = (K.t * .04 + q / 7) % 1, seg = Math.min(L.n - 2, Math.floor(u * (L.n - 1))), f = u * (L.n - 1) - seg; g.position.copy(tops[seg]).lerp(tops[seg + 1], f); })); }
  root.add(omaniHouse({ ...D.LODGE }));
  // برج الإنقاذ
  { const Rs = D.RESCUE, P = new Parts(), wd = material('wood', '#8A6136'); [[-18, -18], [18, -18], [-18, 18], [18, 18]].forEach(([a, b]) => P.add(wd, box(6, 110, 6, Rs.x + a * .8, 55, Rs.y + b * .8))); P.add(wd, box(56, 6, 56, Rs.x, 110, Rs.y));
    P.add(flat('#DC2626'), box(52, 30, 52, Rs.x, 128, Rs.y)); P.add(flat('#FFFFFF'), box(8, 22, 1, Rs.x, 128, Rs.y + 26.6)); P.add(flat('#FFFFFF'), box(22, 8, 1, Rs.x, 128, Rs.y + 26.6)); root.add(P.build());
    const roof = new THREE.Mesh(new THREE.ConeGeometry(42, 24, 4), flat('#B91C1C')); roof.rotation.y = Math.PI / 4; roof.position.set(Rs.x, 155, Rs.y); root.add(roof);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(24, 13), new THREE.MeshStandardMaterial({ color: '#FACC15', side: THREE.DoubleSide })); flag.position.set(Rs.x + 12, 190, Rs.y); root.add(flag); const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 36, 6), metal('#FACC15')); pole.position.set(Rs.x, 180, Rs.y); root.add(pole);
    ticks.push(t => { flag.rotation.y = Math.sin(t * 2) * .25; }); }
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
  // نصب الدوّار: لوح شبكة عليه مستقيم ونقطتان، وقوس المنتجع
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y)); P.add(metal('#57534E'), box(6, 24, 6, R.x, 26, R.y)); root.add(P.build());
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#F8FAFC'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#CBD5E1'; for (let q = 0; q <= 8; q++) { g.beginPath(); g.moveTo(q * 16, 0); g.lineTo(q * 16, 128); g.moveTo(0, q * 16); g.lineTo(128, q * 16); g.stroke(); }
    g.strokeStyle = '#0369A1'; g.lineWidth = 6; g.beginPath(); g.moveTo(6, 116); g.lineTo(122, 12); g.stroke(); g.fillStyle = '#EA580C'; [[38, 87], [90, 41]].forEach(([a, b]) => { g.beginPath(); g.arc(a, b, 6, 0, 7); g.fill(); });
    const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; const board = new THREE.Mesh(new THREE.BoxGeometry(88, 88, 4), [flat('#475569'), flat('#475569'), flat('#475569'), flat('#475569'), new THREE.MeshStandardMaterial({ map: tx }), flat('#475569')]); board.position.set(R.x, 82, R.y); root.add(board);
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#0369A1'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#0369A1'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🏂 منحدرات التزلج', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
