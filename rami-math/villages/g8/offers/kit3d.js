// سوق العروض مجسّماً: دكاكين السوق المسقوف ورواق أقواسه، وبرج الساعة بعقربين يدوران وقبة، ومعرض السيارات الزجاجي وسياراته (الوسطى على منصة تدور)،
// وبنك السوق بأعمدته وجملونه، وأكشاك الدروس، وبسطات الفاكهة، وحبال الرايات بلافتات التخفيضات، وبيوت حديثة ومسجد وشوارع حيّة، ونصب «٪».
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#EA580C', '#FFFFFF', '#DC2626', '#FACC15', '#0F766E'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
function textPlane(THREE, txt, w, h, bg, fg, fs = 40) {
  const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w); const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = `900 ${fs}px Cairo`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText(txt, c.width / 2, c.height / 2);
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, roughness: .6, side: THREE.DoubleSide }));
}
/* سيارة صغيرة: هيكل وقمرة زجاجية وأربع عجلات */
function carMesh(THREE, col, flat, metal) {
  const g = new THREE.Group(), P = new Parts(); P.add(material('metal', col, { rough: .3, metal: .5 }), box(100, 24, 46, 0, 22, 0)); P.add(material('metal', col, { rough: .3, metal: .5 }), box(56, 20, 42, -4, 44, 0));
  P.add(flat('#1E293B'), box(58, 14, 44, -4, 46, 0)); P.add(flat('#FDE68A'), box(2, 6, 10, 50, 26, -14)); P.add(flat('#FDE68A'), box(2, 6, 10, 50, 26, 14)); P.add(flat('#FCA5A5'), box(2, 6, 10, -50, 26, -14)); P.add(flat('#FCA5A5'), box(2, 6, 10, -50, 26, 14));
  g.add(P.build()); [[-32, -23], [32, -23], [-32, 23], [32, 23]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 8, 14), metal('#111827')); w.rotation.x = Math.PI / 2; w.position.set(x, 11, z); g.add(w); });
  return g;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  // الدكاكين ورواق الأقواس
  D.SHOPS.forEach(s => root.add(omaniHouse({ ...s })));
  { const A = D.ARCADE, P = new Parts(), H3 = A.H, n = 7, aw = (A.x1 - A.x0) / n, stone = material('plaster', '#EBD7B4');
    P.add(stone, box(A.x1 - A.x0, 12, A.d, (A.x0 + A.x1) / 2, H3 - 6, A.y + A.d / 2));   // السقف
    P.add(material('plaster', '#C2410C'), box(A.x1 - A.x0, 6, 2, (A.x0 + A.x1) / 2, H3 - 16, A.y + A.d + 1));
    for (let q = 0; q <= n; q++) { const x = A.x0 + q * aw; P.add(stone, box(18, H3 - 12, 18, Math.min(A.x1 - 9, Math.max(A.x0 + 9, x)), (H3 - 12) / 2, A.y + A.d - 9)); }
    for (let q = 0; q < n; q++) { const cx = A.x0 + (q + .5) * aw; const arch = new THREE.TorusGeometry(aw / 2 - 9, 7, 6, 16, Math.PI); arch.scale(1, .55, 1); arch.translate(cx, H3 - 30, A.y + A.d - 9); P.add(stone, arch, { uv: false }); }
    for (let x = A.x0 + 6; x < A.x1; x += 18) P.add(stone, box(10, 9, 6, x, H3 + 4, A.y + A.d - 3));
    root.add(P.build()); const sg = signMesh('🏷️ السوق المسقوف', 18); sg.position.set((A.x0 + A.x1) / 2, H3 + 22, A.y + A.d + 2); root.add(sg); }
  // برج الساعة
  { const T = D.TOWER, P = new Parts(), z = T.y - T.s / 2, Ht = T.H; P.add(material('plaster', '#E8D2A8'), box(T.s, Ht, T.s, T.x, Ht / 2, z)); P.add(material('plaster', '#D6BC8E'), box(T.s + 10, 10, T.s + 10, T.x, Ht, z)); P.add(material('plaster', '#D6BC8E'), box(T.s + 8, 14, T.s + 8, T.x, 7, z));
    P.add(material('wood', '#3B2A1E'), box(18, 36, 2, T.x, 18, z + T.s / 2 + 1)); root.add(P.build());
    const dome = new THREE.Mesh(new THREE.SphereGeometry(T.s * .42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), material('metal', '#0F766E', { rough: .35, metal: .3 })); dome.position.set(T.x, Ht + 5, z); root.add(dome);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(4, 22, 8), metal('#FACC15')); fin.position.set(T.x, Ht + 5 + T.s * .42 + 8, z); root.add(fin);
    const hands = [];
    [[0, 1], [Math.PI / 2, 1], [Math.PI, 1], [-Math.PI / 2, 1]].forEach(([ry]) => { const face = new THREE.Group(); face.rotation.y = ry; face.position.set(T.x, Ht - 34, z); root.add(face);
      const dial = new THREE.Mesh(new THREE.CircleGeometry(20, 28), new THREE.MeshStandardMaterial({ color: '#FFFBEB', roughness: .5 })); dial.position.z = T.s / 2 + .6; face.add(dial);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(20, 2, 6, 28), metal('#7C2D12', .5)); ring.position.z = T.s / 2 + .8; face.add(ring);
      const h1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 11, 1).translate(0, 5, 0), flat('#1C1917')), h2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 16, 1).translate(0, 7.5, 0), flat('#1C1917'));
      h1.position.z = h2.position.z = T.s / 2 + 1.4; face.add(h1, h2); hands.push([h1, h2]); });
    ticks.push(() => hands.forEach(([h1, h2]) => { h1.rotation.z = -K.t * .05; h2.rotation.z = -K.t * .6; })); }
  // معرض السيارات الزجاجي وسياراته
  { const S = D.SHOWROOM, P = new Parts(), H3 = S.H; P.add(material('plaster', '#E2E8F0'), box(S.w, 8, S.h, S.x + S.w / 2, H3 - 4, S.y + S.h / 2)); P.add(flat('#1E293B'), box(S.w, 22, 4, S.x + S.w / 2, H3 - 14, S.y + S.h + 2));
    for (let q = 0; q <= 6; q++) P.add(metal('#334155'), box(6, H3 - 8, 6, S.x + q * S.w / 6, (H3 - 8) / 2, S.y + S.h));
    P.add(material('plaster', '#CBD5E1'), box(S.w, H3, 6, S.x + S.w / 2, H3 / 2, S.y + 3)); P.add(material('plaster', '#CBD5E1'), box(6, H3, S.h, S.x + 3, H3 / 2, S.y + S.h / 2)); P.add(material('plaster', '#CBD5E1'), box(6, H3, S.h, S.x + S.w - 3, H3 / 2, S.y + S.h / 2));
    root.add(P.build());
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(S.w, H3 - 30), new THREE.MeshStandardMaterial({ color: '#93C5FD', transparent: true, opacity: .38, roughness: .05, metalness: .3, side: THREE.DoubleSide })); glass.position.set(S.x + S.w / 2, (H3 - 30) / 2, S.y + S.h); root.add(glass);
    const sg = signMesh('🚗 معرض السيارات', 18); sg.position.set(S.x + S.w / 2, H3 - 14, S.y + S.h + 5); root.add(sg);
    // سيارتان داخل المعرض
    [[S.x + 100, '#F59E0B'], [S.x + S.w - 100, '#0EA5E9']].forEach(([x, col]) => { const c = carMesh(THREE, col, flat, metal); c.position.set(x, 0, S.y + S.h / 2 + 10); c.rotation.y = .5; root.add(c); });
    D.CARS.forEach(([x, y, col], i) => { const c = carMesh(THREE, col, flat, metal); c.position.set(x, i === 1 ? 6 : 0, y - 12); root.add(c);
      if (i === 1) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(74, 76, 6, 32), metal('#94A3B8', .4)); pl.position.set(x, 3, y - 12); root.add(pl); ticks.push(() => { c.rotation.y = K.t * .5; });
        const tg = textPlane(THREE, '−١٠٪', 46, 20, '#EA580C', '#FFFFFF', 64); tg.position.set(x, 88, y - 12); root.add(tg); ticks.push(t => { tg.rotation.y = Math.sin(t) * .3; }); } }); }
  // بنك السوق: مبنى بطابقين وأعمدة وجملون
  { const B = D.BANK; root.add(omaniHouse({ ...B })); const P = new Parts(), zf = B.y + B.h + 6, Hc = 118 * SCALE_H;
    for (let q = 0; q < 6; q++) { const x = B.x + 24 + q * (B.w - 48) / 5; P.add(material('plaster', '#F8FAFC'), new THREE.CylinderGeometry(7, 8, Hc, 14).translate(x, Hc / 2, zf), { uv: false }); P.add(material('plaster', '#CBD5E1'), box(20, 8, 20, x, Hc + 4, zf)); P.add(material('plaster', '#CBD5E1'), box(20, 6, 20, x, 3, zf)); }
    P.add(material('plaster', '#E2E8F0'), box(B.w - 10, 10, 26, B.x + B.w / 2, Hc + 13, zf));
    const ped = new THREE.BufferGeometry(), x0 = B.x + 8, x1 = B.x + B.w - 8, y0 = Hc + 18, y1 = Hc + 48, zz = zf + 12;
    ped.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, zz, x1, y0, zz, (x0 + x1) / 2, y1, zz, x0, y0, zz - 24, (x0 + x1) / 2, y1, zz - 24, x1, y0, zz - 24], 3)); ped.setIndex([0, 1, 2, 3, 4, 5, 0, 2, 4, 0, 4, 3, 1, 5, 4, 1, 4, 2]); ped.computeVertexNormals();
    root.add(P.build()); root.add(new THREE.Mesh(ped, new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: .6, side: THREE.DoubleSide })));
    const logo = new THREE.Mesh(new THREE.CircleGeometry(8, 20), flat('#0F766E')); logo.position.set((x0 + x1) / 2, y0 + 10, zz + .5); root.add(logo); }
  // أكشاك الدروس
  D.stations.forEach(s => { const P = new Parts(), x = s.x, z = s.y - 44; P.add(material('plaster', s.col), box(104, 70, 24, x, 35, z)); P.add(flat('#3B2A1E'), box(90, 26, 2, x, 36, z + 12.5)); P.add(material('wood', '#C9955A'), box(110, 6, 30, x, 22, z + 4));
    root.add(P.build()); const aw = new THREE.Mesh(new THREE.BoxGeometry(112, 3, 26), new THREE.MeshStandardMaterial({ map: stripes(THREE, s.col, '#F4E3B8', 8), roughness: .7 })); aw.position.set(x, 64, z + 20); aw.rotation.x = .35; root.add(aw);
    const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(x, 92, z + 14); root.add(m); });
  // بسطات الفاكهة بفاكهتها
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12));
    ['#F97316', '#DC2626', '#FACC15', '#65A30D'].forEach((fc, k) => { for (let q = 0; q < 3; q++) P.add(flat(fc), new THREE.SphereGeometry(5, 8, 6).translate(x - 30 + k * 20 + q * 4, 38 + q * 3, y - 18 + (q % 2) * 6), { uv: false }); });
    root.add(P.build()); });
  // حبال الرايات ولافتات التخفيضات
  { const P = new Parts(); D.BANNERS.flat().forEach(([x, y]) => P.add(metal('#64748B'), box(5, 124, 5, x, 62, y))); root.add(P.build());
    const SIGNS = ['تخفيضات ٥٠٪', 'عروض اليوم', 'خصم ٢٥٪', 'اشترِ ٣ بسعر ٢'];
    D.BANNERS.forEach(([a, b], i) => { const A = new THREE.Vector3(a[0], 124, a[1]), B = new THREE.Vector3(b[0], 124, b[1]); for (let k = 0; k < 12; k++) { const u = (k + .5) / 12, p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * 26;
      const f = new THREE.Mesh(new THREE.ConeGeometry(6, 15, 3), flat(FLAGC[(k + i) % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); }
      const sg = textPlane(THREE, SIGNS[i % 4], 96, 26, '#DC2626', '#FFFFFF', 34); const m = A.clone().lerp(B, .5); sg.position.set(m.x, m.y - 46, m.z); root.add(sg); ticks.push(t => { sg.rotation.z = Math.sin(t * 1.6 + i) * .05; }); }); }
  // البيوت والمسجد والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب «٪» في الدوّار، وقوس السوق
  { const R = D.RING, P = new Parts(), or = material('metal', '#EA580C', { rough: .35, metal: .3 }); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y));
    const bar = new THREE.CylinderGeometry(7, 7, 110, 12); bar.rotateZ(-.5); bar.translate(R.x, 14 + 55, R.y); P.add(or, bar, { uv: false });
    P.add(or, new THREE.TorusGeometry(15, 5, 8, 20).translate(R.x - 26, 14 + 88, R.y), { uv: false }); P.add(or, new THREE.TorusGeometry(15, 5, 8, 20).translate(R.x + 26, 14 + 24, R.y), { uv: false }); root.add(P.build());
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#C2410C'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#C2410C'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🏷️ سوق العروض', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
