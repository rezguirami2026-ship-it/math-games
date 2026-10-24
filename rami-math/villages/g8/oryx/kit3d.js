// محمية المها مجسّماً: مركز الزوار، وحظيرة مسيّجة بأشجار الغاف ومها بيضاء بقرون طويلة تمشي وترعى، وحوض الماء، وبرج المراقبة برايته،
// ومشتل الغاف بشتلاته، وأكشاك الدروس، وبيوت حديثة ومسجد وشوارع حيّة، وتمثال المهاة في الدوّار.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#4D7C0F', '#FFFFFF', '#B45309', '#FACC15', '#0F766E'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
/* مهاة مجسّمة: جسم وأرجل بجوارب داكنة ورأس بقناع وقرنان طويلان */
export function oryx3d(THREE, s = 1) {
  const g = new THREE.Group(), wh = new THREE.MeshStandardMaterial({ color: '#FAFAF9', roughness: .7 }), dk = new THREE.MeshStandardMaterial({ color: '#292524', roughness: .6 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10).scale(20, 10, 9), wh); body.position.y = 26; g.add(body);
  [[-13, -5], [-13, 5], [13, -5], [13, 5]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.5, 22, 6), wh); l.position.set(x, 13, z); g.add(l); const f = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 6, 6), dk); f.position.set(x, 3, z); g.add(f); });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 16, 8), wh); neck.position.set(20, 36, 0); neck.rotation.z = -.6; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8).scale(7, 5, 5), wh); head.position.set(27, 44, 0); g.add(head);
  const mask = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 6), dk); mask.position.set(28, 46, 0); g.add(mask);
  [-2, 2].forEach(z => { const h = new THREE.Mesh(new THREE.CylinderGeometry(.6, 1, 30, 6), dk); h.position.set(22, 60, z); h.rotation.z = .35; g.add(h); });
  g.scale.setScalar(s); return g;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  root.add(omaniHouse({ ...D.CENTER }));
  { const P = D.PEN, F = new Parts(), wd = material('wood', '#7A5A30'); for (let x = P.x; x <= P.x + P.w; x += 60) [P.y, P.y + P.h].forEach(y => F.add(wd, box(5, 34, 5, x, 17, y))); for (let y = P.y; y <= P.y + P.h; y += 60) [P.x, P.x + P.w].forEach(x => F.add(wd, box(5, 34, 5, x, 17, y)));
    [8, 18, 28].forEach(h => { [P.y, P.y + P.h].forEach(y => F.add(metal('#78716C', .6), box(P.w, 1, 1, P.x + P.w / 2, h, y), { uv: false })); [P.x, P.x + P.w].forEach(x => F.add(metal('#78716C', .6), box(1, 1, P.h, x, h, P.y + P.h / 2), { uv: false })); });
    root.add(F.build());
    D.GHAF.forEach(([x, y]) => { try { const t = sidrTree(x, y, 1.15); root.add(t); } catch (e) {} });
    const herd = D.ORYX.map(() => { const o = oryx3d(THREE, 1); root.add(o); return o; });
    ticks.push(t => herd.forEach((o, k) => { const [x0, y0] = D.ORYX[k], a = t * .15 + k * 1.7; o.position.set(x0 + Math.sin(a) * 40, 0, y0 + Math.cos(a * .7) * 18); o.rotation.y = Math.cos(a) >= 0 ? 0 : Math.PI; }));
    const T = D.TROUGH, Q = new Parts(); Q.add(material('wood', '#7A5A30'), box(T.w, 10, T.h, T.x + T.w / 2, 5, T.y + T.h / 2)); root.add(Q.build()); const wat = new THREE.Mesh(new THREE.PlaneGeometry(T.w - 8, T.h - 8), new THREE.MeshStandardMaterial({ color: '#3B82C4', roughness: .1 })); wat.rotation.x = -Math.PI / 2; wat.position.set(T.x + T.w / 2, 10.5, T.y + T.h / 2); root.add(wat); }
  // برج المراقبة
  { const Wt = D.WATCH, P = new Parts(), wd = material('wood', '#8A6136'); [[-18, -18], [18, -18], [-18, 18], [18, 18]].forEach(([a, b]) => P.add(wd, box(6, Wt.H, 6, Wt.x + a * .8, Wt.H / 2, Wt.y + b * .8))); P.add(material('wood', '#B98A55'), box(60, 30, 60, Wt.x, Wt.H + 15, Wt.y)); root.add(P.build());
    const roof = new THREE.Mesh(new THREE.ConeGeometry(46, 26, 4), flat('#4D7C0F')); roof.rotation.y = Math.PI / 4; roof.position.set(Wt.x, Wt.H + 43, Wt.y); root.add(roof);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(24, 13), new THREE.MeshStandardMaterial({ color: '#FACC15', side: THREE.DoubleSide })); flag.position.set(Wt.x + 12, Wt.H + 80, Wt.y); root.add(flag); ticks.push(t => { flag.rotation.y = Math.sin(t * 2) * .25; }); }
  // المشتل: شتلات صغيرة
  { const Nu = D.NURSERY, P = new Parts(); for (let r = 0; r < 5; r++) for (let q = 0; q < 12; q++) { const x = Nu.x + 24 + q * 42, z = Nu.y + 26 + r * 44, h = 10 + (q + r) % 3 * 6; P.add(flat('#78350F'), box(2, h, 2, x, h / 2, z)); P.add(flat('#4D7C0F'), new THREE.SphereGeometry(5 + (q + r) % 3 * 2, 8, 6).translate(x, h + 3, z), { uv: false }); } root.add(P.build()); }
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
  { const R = D.RING, P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y)); root.add(P.build());
    const st = oryx3d(THREE, 1.6); st.position.set(R.x - 24, 14, R.y); root.add(st);
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#4D7C0F'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#4D7C0F'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🦌 محمية المها', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
