// محطة الأرصاد مجسّماً: مبنى المحطة، وقبة الرادار على برج بهوائي يدور، وحديقة الأجهزة بسياجها (صندوق الأجهزة، ومقياس المطر، ومروحة الرياح،
// وكيس الرياح)، وبرج الإطلاق بمنطاد يتمايل، واستوديو النشرة بشاشته، وأكشاك الدروس، وبيوت حديثة ومسجد وشوارع حيّة، ونصب ميزان الحرارة.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#0369A1', '#FFFFFF', '#F59E0B', '#DC2626', '#0F766E'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  root.add(omaniHouse({ ...D.STATION })); root.add(omaniHouse({ ...D.STUDIO }));
  { const S = D.STUDIO, H3 = S.H * SCALE_H, scr = new THREE.Mesh(new THREE.PlaneGeometry(108, 42), new THREE.MeshStandardMaterial({ color: '#38BDF8', emissive: '#0EA5E9', emissiveIntensity: .5 })); scr.position.set(S.x + S.w / 2, H3 + 30, S.y + S.h - 4); root.add(scr);
    const fr = new Parts(); fr.add(flat('#0F172A'), box(120, 54, 4, S.x + S.w / 2, H3 + 30, S.y + S.h - 6)); fr.add(metal('#475569'), box(6, 30, 6, S.x + S.w / 2, H3 + 2, S.y + S.h - 8)); root.add(fr.build()); ticks.push(t => { scr.material.emissiveIntensity = .4 + Math.sin(t * 2) * .15; }); }
  // الرادار
  { const Rd = D.RADAR, P = new Parts(); P.add(metal('#94A3B8', .5), box(44, Rd.H, 44, Rd.x, Rd.H / 2, Rd.y)); root.add(P.build());
    const dome = new THREE.Mesh(new THREE.SphereGeometry(Rd.r * .62, 24, 14), new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: .4 })); dome.position.set(Rd.x, Rd.H + 20, Rd.y); root.add(dome);
    const ant = new THREE.Group(); ant.position.set(Rd.x, Rd.H + 20 + Rd.r * .62, Rd.y); root.add(ant); const arm = new THREE.Mesh(new THREE.BoxGeometry(36, 3, 3), metal('#475569')); arm.position.y = 6; ant.add(arm); ticks.push(t => { ant.rotation.y = t * 1.5; }); }
  // سياج الحديقة والأجهزة
  { const G = D.GARDEN, P = new Parts(), wh = flat('#F8FAFC'); for (let x = G.x; x <= G.x + G.w; x += 52) [G.y, G.y + G.h].forEach(y => P.add(wh, box(4, 30, 4, x, 15, y))); [G.y, G.y + G.h].forEach(y => [26, 12].forEach(h => P.add(wh, box(G.w, 3, 2, G.x + G.w / 2, h, y))));
    const Sc = D.SCREEN; P.add(flat('#E5E7EB'), box(8, 50, 8, Sc.x, 25, Sc.y)); P.add(material('wood', '#FFFFFF'), box(60, 52, 40, Sc.x, 64, Sc.y)); P.add(flat('#CBD5E1'), box(68, 6, 46, Sc.x, 93, Sc.y));
    const Ga = D.GAUGE; P.add(metal('#64748B'), new THREE.CylinderGeometry(10, 10, 48, 14).translate(Ga.x, 24, Ga.y), { uv: false });
    const V = D.VANE; P.add(metal('#475569'), box(4, 110, 4, V.x, 55, V.y)); const So = D.SOCK; P.add(metal('#475569'), box(4, 90, 4, So.x, 45, So.y)); root.add(P.build());
    const cups = new THREE.Group(); cups.position.set(V.x, 110, V.y); root.add(cups); for (let q = 0; q < 3; q++) { const a = q * 2.09, arm = new THREE.Mesh(new THREE.BoxGeometry(24, 2, 2).translate(12, 0, 0), metal('#475569')); arm.rotation.y = a; cups.add(arm); const cup = new THREE.Mesh(new THREE.SphereGeometry(6, 10, 8), flat('#F97316')); cup.position.set(Math.cos(a) * 24, 0, -Math.sin(a) * 24); cups.add(cup); }
    ticks.push(t => { cups.rotation.y = t * 5; });
    const sock = new THREE.Mesh(new THREE.ConeGeometry(8, 50, 12, 1, true), new THREE.MeshStandardMaterial({ map: stripes(THREE, '#F97316', '#FFFFFF', 5), side: THREE.DoubleSide })); sock.rotation.z = Math.PI / 2; sock.position.set(So.x + 26, 84, So.y); root.add(sock); ticks.push(t => { sock.rotation.y = Math.sin(t * 2) * .3; }); }
  // برج الإطلاق والمنطاد
  { const Tw = D.TOWER, P = new Parts(); [-1, 1].forEach(s => { const L = Math.hypot(20, Tw.H), g = new THREE.BoxGeometry(5, L, 5); g.rotateZ(-Math.atan2(20, Tw.H) * s); g.translate(Tw.x + s * 18, Tw.H / 2, Tw.y); P.add(metal('#64748B'), g, { uv: false }); });
    for (let y = 30; y < Tw.H; y += 30) P.add(metal('#64748B'), box(52 - y * .14, 3, 3, Tw.x, y, Tw.y)); root.add(P.build());
    const bal = new THREE.Mesh(new THREE.SphereGeometry(34, 20, 16).scale(1, 1.18, 1), new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: .3 })); root.add(bal);
    const box2 = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 12), flat('#F97316')); root.add(box2); const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#334155' })); root.add(rope);
    ticks.push(t => { const x = Tw.x + Math.sin(t * .8) * 14, y = Tw.H + 90 + Math.sin(t * 1.3) * 6; bal.position.set(x, y, Tw.y); box2.position.set(x, y - 48, Tw.y); rope.geometry.setFromPoints([new THREE.Vector3(Tw.x, Tw.H, Tw.y), new THREE.Vector3(x, y - 40, Tw.y)]); }); }
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
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y)); P.add(material('plaster', '#F8FAFC'), new THREE.CylinderGeometry(12, 12, 130, 16).translate(R.x, 14 + 65, R.y), { uv: false });
    P.add(flat('#DC2626'), new THREE.SphereGeometry(16, 14, 10).translate(R.x, 26, R.y), { uv: false }); root.add(P.build());
    const lv = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 1, 10), flat('#DC2626')); lv.position.set(R.x, 40, R.y + 8); root.add(lv); ticks.push(t => { const h = 60 + Math.sin(t * .3) * 10; lv.scale.y = h; lv.position.y = 30 + h / 2; });
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#0369A1'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#0369A1'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🌦️ محطة الأرصاد', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
