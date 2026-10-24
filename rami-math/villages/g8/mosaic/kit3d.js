// دار الفسيفساء مجسّماً: ورشة البلاط وفرن الطين بدخانه، والدار الكبيرة بنوافذ زجاج ملوّن تتوهج، والقبة الخضراء بنجمتها، والجدار المرمَّم بسقالته،
// والنافورة الثمانية بمائها المتراقص، وأكشاك الدروس، وبيوت حديثة ومسجد وشوارع حيّة، ونصب النجمة الثمانية في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#1E3A8A', '#FFFFFF', '#D97706', '#0F766E', '#DB2777'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
function starShape(THREE, r) { const s = new THREE.Shape(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + Math.PI / 16, rr = k % 2 ? r * .45 : r; k ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return s; }

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  [D.WORK, D.DAR, D.DOME].forEach(b => root.add(omaniHouse({ ...b })));
  // فرن الطين
  { const Kl = D.KILN, m = new THREE.Mesh(new THREE.SphereGeometry(Kl.r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), material('plaster', '#B45309')); m.position.set(Kl.x, 0, Kl.y); root.add(m);
    const fire = new THREE.Mesh(new THREE.CircleGeometry(12, 14), new THREE.MeshStandardMaterial({ color: '#FB923C', emissive: '#F97316', emissiveIntensity: 1 })); fire.position.set(Kl.x, 12, Kl.y + Kl.r - 2); root.add(fire);
    const puffs = [0, 1, 2].map(q => { const p = new THREE.Mesh(new THREE.SphereGeometry(8, 8, 6), new THREE.MeshStandardMaterial({ color: '#A8A29E', transparent: true, opacity: .4, depthWrite: false })); root.add(p); return p; });
    ticks.push(t => { fire.material.emissiveIntensity = .8 + Math.sin(t * 6) * .3; puffs.forEach((p, q) => { const u = (t * .4 + q / 3) % 1; p.position.set(Kl.x + Math.sin(u * 5 + q) * 8, Kl.r + u * 60, Kl.y); p.scale.setScalar(1 + u); p.material.opacity = .4 * (1 - u); }); }); }
  // نوافذ الدار الملونة
  { const Dr = D.DAR, H3 = Dr.H * SCALE_H, cols = ['#2563EB', '#DB2777', '#16A34A', '#F59E0B']; const wins = cols.map((c, q) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(28, 34), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .4, transparent: true, opacity: .85 })); m.position.set(Dr.x + 60 + q * (Dr.w - 120) / 3, H3 * .62, Dr.y + Dr.h + 1.2); root.add(m); return m; });
    ticks.push(t => wins.forEach((m, q) => { m.material.emissiveIntensity = .35 + Math.sin(t * 2 + q) * .2; })); }
  // فناء النجوم: نجوم بارزة قليلاً
  { const C = D.COURT, g1 = new THREE.ShapeGeometry(starShape(THREE, 18)); g1.rotateX(-Math.PI / 2); const P = new Parts();
    for (let y = C.y + 24; y < C.y + C.h; y += 46) for (let x = C.x + 24 + ((y - C.y) / 46 % 2) * 23; x < C.x + C.w; x += 46) P.add(flat((x + y) % 3 ? '#1E3A8A' : '#0F766E'), g1.clone().translate(x, .8, y), { uv: false });
    root.add(P.build()); }
  // قبة خضراء بخطوط ذهبية ونجمة
  { const Dm = D.DOME, H3 = Dm.H * SCALE_H, dome = new THREE.Mesh(new THREE.SphereGeometry(Dm.w * .32, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: stripes(THREE, '#0F766E', '#14B8A6', 16), roughness: .4, metalness: .2 })); dome.position.set(Dm.x + Dm.w / 2, H3, Dm.y + Dm.h / 2); root.add(dome);
    const st = new THREE.Mesh(new THREE.ShapeGeometry(starShape(THREE, 12)), new THREE.MeshStandardMaterial({ color: '#D97706', metalness: .5, roughness: .3, side: THREE.DoubleSide })); st.position.set(Dm.x + Dm.w / 2, H3 + Dm.w * .32 + 14, Dm.y + Dm.h / 2); root.add(st); ticks.push(t => { st.rotation.y = t * .5; }); }
  // الجدار المرمَّم والسقالة
  { const Wr = D.WALLR, P = new Parts(); P.add(material('stone', '#D6C4A0'), box(Wr.w, Wr.H, Wr.h, Wr.x + Wr.w / 2, Wr.H / 2, Wr.y + Wr.h / 2)); P.add(flat('#1E3A8A'), box(Wr.w * .45, Wr.H * .6, 1, Wr.x + Wr.w * .25, Wr.H * .45, Wr.y + Wr.h + .6));
    const z = Wr.y + Wr.h + 30; for (let q = 0; q < 5; q++) P.add(metal('#78716C', .5), box(6, 170, 6, Wr.x + 30 + q * 90, 85, z)); [60, 115, 160].forEach(hh => P.add(material('wood', '#B98A55'), box(372, 6, 26, Wr.x + 210, hh, z - 4))); root.add(P.build()); }
  // النافورة الثمانية
  { const F = D.FOUNT8, P = new Parts(); P.add(material('stone', '#94A3B8'), new THREE.CylinderGeometry(F.r + 10, F.r + 12, 14, 8).translate(F.x, 7, F.y)); P.add(material('stone', '#CBD5E1'), new THREE.CylinderGeometry(6, 8, 34, 10).translate(F.x, 17, F.y), { uv: false }); root.add(P.build());
    const w = new THREE.Mesh(new THREE.CylinderGeometry(F.r, F.r, 2, 8), new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: .1, transparent: true, opacity: .85 })); w.position.set(F.x, 12, F.y); root.add(w);
    const drops = Array.from({ length: 6 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(2.5, 6, 5), new THREE.MeshStandardMaterial({ color: '#BAE6FD', transparent: true, opacity: .9 })); root.add(d); return d; });
    ticks.push(t => drops.forEach((d, q) => { const a = q * Math.PI / 3 + t, u = (t * 1.5 + q / 6) % 1; d.position.set(F.x + Math.cos(a) * u * 26, 36 + Math.sin(u * Math.PI) * 24, F.y + Math.sin(a) * u * 26); d.material.opacity = 1 - u; })); }
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
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y)); P.add(metal('#57534E'), box(8, 40, 8, R.x, 34, R.y)); root.add(P.build());
    const st = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(THREE, 44), { depth: 8, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#1E3A8A', roughness: .4 })); st.position.set(R.x, 98, R.y - 4); root.add(st);
    const ctr = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 10, 16), metal('#D97706')); ctr.rotation.x = Math.PI / 2; ctr.position.set(R.x, 98, R.y + 2); root.add(ctr); ticks.push(t => { st.rotation.z = t * .2; });
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#1E3A8A'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#1E3A8A'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🔷 دار الفسيفساء', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
