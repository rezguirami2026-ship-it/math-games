// مضمار السباق مجسّماً: المدرّج بدرجاته الملوّنة وجمهوره، وقوس البداية والنهاية، وبرج التوقيت بشاشة رقمية، وعدّاؤون يركضون على الحارات،
// وعيادة المضمار وسوقه، وأكشاك الدروس، وبيوت حديثة ومسجد وشوارع حيّة، ونصب ساعة التوقيت بعقرب يدور.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#DC2626', '#FFFFFF', '#2563EB', '#FACC15', '#16A34A'];
function stripes(THREE, a, b, n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 }), O = D.OVAL;
  // المدرّج: أربع درجات صاعدة بألوانها وجمهور
  { const S = D.STAND, P = new Parts(), cols = ['#16A34A', '#FACC15', '#DC2626', '#2563EB']; for (let r = 0; r < 4; r++) P.add(flat(cols[r]), box(S.w, (r + 1) * S.H / 4, S.h / 4, S.x + S.w / 2, (r + 1) * S.H / 8, S.y + S.h - (r + .5) * S.h / 4));
    root.add(P.build()); const fans = []; for (let q = 0; q < 40; q++) { const r = q % 4, m = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6), flat(['#7C2D12', '#C68A5B', '#A8764E'][q % 3])); m.position.set(S.x + 10 + (q * 97 % (S.w - 20)), (r + 1) * S.H / 4 + 5, S.y + S.h - (r + .5) * S.h / 4); root.add(m); fans.push(m); }
    ticks.push(t => fans.forEach((m, q) => { m.position.y = ((q % 4) + 1) * D.STAND.H / 4 + 5 + Math.max(0, Math.sin(t * 3 + q)) * 3; })); }
  // قوس البداية
  { const Ar = D.ARCH, P = new Parts(); [-110, 110].forEach(o => P.add(flat('#DC2626'), box(12, 120, 12, Ar.x + o, 60, Ar.y))); P.add(flat('#DC2626'), box(240, 26, 12, Ar.x, 123, Ar.y)); root.add(P.build());
    const sg = signMesh('🏁 البداية والنهاية', 18); sg.position.set(Ar.x, 123, Ar.y + 7); root.add(sg); }
  // برج التوقيت
  { const Ti = D.TIMER, P = new Parts(); P.add(material('plaster', '#334155'), box(Ti.s, Ti.H, Ti.s, Ti.x, Ti.H / 2, Ti.y)); root.add(P.build());
    const c = document.createElement('canvas'); c.width = 128; c.height = 48; const g = c.getContext('2d'), tx = new THREE.CanvasTexture(c); const scr = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshBasicMaterial({ map: tx })); scr.position.set(Ti.x, Ti.H - 25, Ti.y + Ti.s / 2 + 1); root.add(scr);
    let last = -1; ticks.push(t => { const cs = Math.floor(t * 10); if (cs === last) return; last = cs; g.fillStyle = '#0F172A'; g.fillRect(0, 0, 128, 48); g.fillStyle = '#F87171'; g.font = '900 30px Consolas, monospace'; g.textAlign = 'center'; g.fillText(`${String(Math.floor(t) % 60).padStart(2, '0')}:${String(Math.floor((t % 1) * 100)).padStart(2, '0')}`, 64, 34); tx.needsUpdate = true; }); }
  // العدّاؤون على الحارات
  { const runners = [0, 1, 2, 3].map(k => { const g = new THREE.Group(), P = new Parts(); P.add(flat(['#FDE047', '#60A5FA', '#F472B6', '#FFFFFF'][k]), box(8, 14, 6, 0, 16, 0)); P.add(flat('#C68A5B'), new THREE.SphereGeometry(5, 8, 6).translate(0, 28, 0), { uv: false }); P.add(flat('#1F2937'), box(6, 10, 5, 0, 5, 0)); g.add(P.build()); root.add(g); return g; });
    ticks.push(t => runners.forEach((g, k) => { const f = (k + .5) / 5, a = t * (.35 + k * .04) + k, x = O.x + Math.cos(a) * (O.rx - O.lane * f), z = O.y + Math.sin(a) * (O.ry - O.lane * .6 * f); g.position.set(x, Math.abs(Math.sin(t * 10 + k)) * 2, z); g.rotation.y = -a; })); }
  root.add(omaniHouse({ ...D.CLINIC })); root.add(omaniHouse({ ...D.SHOP }));
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
    const face = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 10, 28), [metal('#CBD5E1'), new THREE.MeshStandardMaterial({ color: '#FFFFFF' }), metal('#CBD5E1')]); face.rotation.x = Math.PI / 2; face.position.set(R.x, 98, R.y); root.add(face);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(4, 32, 2).translate(0, 16, 0), flat('#DC2626')); hand.position.set(R.x, 98, R.y + 6); root.add(hand); ticks.push(t => { hand.rotation.z = -t * 1.2; });
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#DC2626'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#DC2626'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🏁 مضمار السباق', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
