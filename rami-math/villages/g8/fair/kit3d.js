// مهرجان الألعاب مجسّماً: المسرح بعارضة أضواء تومض، والدوّامة تدور بخيولها، والعجلة الدوّارة بعرباتها القائمة، والخيمة المخططة،
// وبرج الأرجوحة بكراسيه، وأكشاك الدروس، وعربات الحلوى، والبالونات، وحبال الرايات، وبيوت حديثة ومسجد وشوارع حيّة، ونصب حجري النرد.
import { Parts, box } from '../../../renderer3d/geom.js';
import { material } from '../../../renderer3d/textures.js';
import { omaniHouse, omaniMosque, signMesh, SCALE_H } from '../../../renderer3d/omani.js';
import { palms, mountains, clouds, sidrTree } from '../../../renderer3d/nature.js';
import { streetLamps, bench } from '../../../renderer3d/props.js';
import { houseGroup3D } from '../../houses.js';
import { streetBuild3D } from '../../street.js';

const FLAGC = ['#DB2777', '#FFFFFF', '#2563EB', '#FACC15', '#16A34A'];
/* وجه حجر نرد بنقاطه (نسيج قماش) */
export function dieMats(THREE) {
  const P = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .22], [.75, .22], [.25, .5], [.75, .5], [.25, .78], [.75, .78]] };
  const out = {}; for (let n = 1; n <= 6; n++) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#F8FAFC'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#CBD5E1'; g.lineWidth = 6; g.strokeRect(3, 3, 122, 122);
    g.fillStyle = n === 1 ? '#DC2626' : '#1E293B'; P[n].forEach(([a, b]) => { g.beginPath(); g.arc(a * 128, b * 128, 12, 0, 7); g.fill(); });
    const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; out[n] = new THREE.MeshStandardMaterial({ map: tx, roughness: .35 }); }
  return out;
}
/* حجر نرد: الأعلى t والشمال n والشرق e (والمقابلان يكملان ٧) — ترتيب أوجه الصندوق: +x، −x، +y، −y، +z (الجنوب)، −z */
export const dieFaces = (M, t, n, e) => [M[e], M[7 - e], M[t], M[7 - t], M[7 - n], M[n]];
function stripes(THREE, a, b, n, vertical = true) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? b : a; if (vertical) g.fillRect(k * 256 / n, 0, 256 / n + 1, 64); else g.fillRect(0, k * 64 / n, 256, 64 / n + 1); }
  const tx = new THREE.CanvasTexture(c); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function kit3d(THREE, { def: D }) {
  const W = D.size.w, root = new THREE.Group(), ticks = [], K = D.kit, flat = c => material('flat', c, { rough: .6 }), metal = (c, r = .3) => material('metal', c, { rough: r, metal: .65 });
  const glowM = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .9, roughness: .4 });
  // المسرح
  { const S = D.STAGE, P = new Parts(); P.add(material('wood', '#6D28D9'), box(S.w, 34, S.h, S.x + S.w / 2, 17, S.y + S.h / 2)); P.add(material('wood', '#4C1D95'), box(S.w - 20, 110, 6, S.x + S.w / 2, 34 + 55, S.y + 14));
    P.add(metal('#334155'), box(S.w, 8, 8, S.x + S.w / 2, 34 + 128, S.y + 20)); [S.x + 4, S.x + S.w - 4].forEach(x => P.add(metal('#334155'), box(8, 128, 8, x, 34 + 64, S.y + 20)));
    root.add(P.build()); const cur = new THREE.Mesh(new THREE.PlaneGeometry(S.w - 30, 108), new THREE.MeshStandardMaterial({ color: '#991B1B', roughness: .8 })); cur.position.set(S.x + S.w / 2, 34 + 55, S.y + 18); root.add(cur);
    const bulbs = []; for (let q = 0; q < 9; q++) { const m = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 8), glowM(FLAGC[q % 5])); m.position.set(S.x + 18 + q * (S.w - 36) / 8, 34 + 120, S.y + 26); root.add(m); bulbs.push(m); }
    ticks.push(t => bulbs.forEach((m, q) => { m.material.emissiveIntensity = Math.sin(t * 4 + q * 1.3) > -.2 ? 1.4 : .05; }));
    const sg = signMesh('🎤 مسرح المهرجان', 18); sg.position.set(S.x + S.w / 2, 34 + 148, S.y + 26); root.add(sg); }
  // الدوّامة: كل ما عليها يدور، والخيول تصعد وتنزل
  { const C = D.CAROUSEL, G = new THREE.Group(); G.position.set(C.x, 0, C.y); root.add(G);
    const base = new Parts(); base.add(material('wood', '#BE185D'), new THREE.CylinderGeometry(C.r, C.r + 4, 12, 32).translate(0, 6, 0)); base.add(flat('#FBCFE8'), new THREE.CylinderGeometry(C.r - 4, C.r - 4, 2, 32).translate(0, 13, 0)); const bm = base.build(); bm.position.set(C.x, 0, C.y); root.add(bm);
    const spin = new THREE.Group(); G.add(spin); const P = new Parts(); P.add(flat('#F9A8D4'), new THREE.CylinderGeometry(12, 12, 120, 14).translate(0, 72, 0)); spin.add(P.build());
    const horses = []; for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4, h = new THREE.Group(), col = ['#FFFFFF', '#FDE68A', '#BAE6FD', '#FBCFE8'][q % 4];
      h.add(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 120, 6).translate(0, 60, 0), metal('#FDE68A')));
      const body = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(8, 20, 4, 8) : new THREE.CylinderGeometry(8, 8, 28, 8), flat(col)); body.rotation.z = Math.PI / 2; body.position.y = 46; h.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(8, 18, 9), flat(col)); head.position.set(15, 58, 0); head.rotation.z = -.4; h.add(head);
      h.position.set(Math.cos(a) * C.r * .78, 0, Math.sin(a) * C.r * .78); h.rotation.y = -a; spin.add(h); horses.push(h); }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(C.r * 1.08, 70, 24, 1, true), new THREE.MeshStandardMaterial({ map: stripes(THREE, '#DB2777', '#FFFFFF', 24), roughness: .7, side: THREE.DoubleSide })); roof.position.y = 132 + 35; spin.add(roof);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(C.r * 1.08, C.r * 1.08, 10, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#9D174D', side: THREE.DoubleSide })); rim.position.y = 132; spin.add(rim);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(22, 12), new THREE.MeshStandardMaterial({ color: '#FACC15', side: THREE.DoubleSide })); flag.position.set(11, 214, 0); spin.add(flag); const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 30, 6), metal('#FACC15')); pole.position.y = 205; spin.add(pole);
    ticks.push(t => { spin.rotation.y = -K.t * .6; horses.forEach((h, q) => { const b = Math.sin(K.t * 3 + q * 1.7) * 8; h.children[1].position.y = 46 + b; h.children[2].position.y = 58 + b; }); }); }
  // العجلة الدوّارة
  { const Wh = D.WHEEL, hy = Wh.hub, P = new Parts(); [-1, 1].forEach(s => [-22, 22].forEach(z => { const L = Math.hypot(110, hy), g = new THREE.BoxGeometry(8, L, 8); g.rotateZ(Math.atan2(110, hy) * s); g.translate(Wh.x + s * 55, hy / 2, Wh.y - 20 + z); P.add(metal('#475569'), g, { uv: false }); }));
    P.add(metal('#64748B'), box(240, 16, 50, Wh.x, 8, Wh.y - 20)); P.add(metal('#1E293B'), new THREE.CylinderGeometry(6, 6, 56, 10).rotateX(Math.PI / 2).translate(Wh.x, hy, Wh.y - 20), { uv: false }); root.add(P.build());
    const wheel = new THREE.Group(); wheel.position.set(Wh.x, hy, Wh.y - 20); root.add(wheel); const Q = new Parts();
    [-14, 14].forEach(z => { Q.add(metal('#E2E8F0', .4), new THREE.TorusGeometry(Wh.r, 3, 6, 48).translate(0, 0, z), { uv: false }); Q.add(metal('#94A3B8', .4), new THREE.TorusGeometry(Wh.r - 14, 1.5, 4, 48).translate(0, 0, z), { uv: false }); });
    for (let q = 0; q < 16; q++) { const a = q * Math.PI / 8, g = new THREE.BoxGeometry(Wh.r, 2, 2); g.translate(Wh.r / 2, 0, 0); g.rotateZ(a); [-14, 14].forEach(z => Q.add(metal('#CBD5E1', .4), g.clone().translate(0, 0, z), { uv: false })); }
    wheel.add(Q.build()); const lights = []; for (let q = 0; q < 16; q++) { const a = q * Math.PI / 8, m = new THREE.Mesh(new THREE.SphereGeometry(3.5, 8, 6), glowM('#FACC15')); m.position.set(Math.cos(a) * Wh.r, Math.sin(a) * Wh.r, 16); wheel.add(m); lights.push(m); }
    const gond = []; for (let q = 0; q < 8; q++) { const col = ['#DB2777', '#F97316', '#2563EB', '#FACC15', '#16A34A'][q % 5], g = new THREE.Group(), P2 = new Parts();
      P2.add(flat(col), box(30, 20, 26, 0, -22, 0)); P2.add(flat('#F8FAFC'), box(32, 3, 28, 0, -10, 0)); P2.add(metal('#334155'), box(2, 12, 2, 0, -6, 0)); g.add(P2.build()); root.add(g); gond.push(g); }
    ticks.push(() => { const a0 = -K.t * .18; wheel.rotation.z = a0; lights.forEach((m, q) => { m.material.emissiveIntensity = Math.sin(K.t * 3 + q) > 0 ? 1.5 : .2; });
      gond.forEach((g, q) => { const a = a0 + q * Math.PI / 4; g.position.set(Wh.x + Math.cos(a) * Wh.r, hy + Math.sin(a) * Wh.r, Wh.y - 20); }); });
    const sg = signMesh('🎡 العجلة الدوّارة', 18); sg.position.set(Wh.x, 34, Wh.y + 8); root.add(sg); }
  // الخيمة الكبيرة
  { const Tn = D.TENT, wallH = 80, wall = new THREE.Mesh(new THREE.CylinderGeometry(Tn.r, Tn.r, wallH, 32, 1, true), new THREE.MeshStandardMaterial({ map: stripes(THREE, '#DC2626', '#FFFFFF', 32), roughness: .8, side: THREE.DoubleSide }));
    wall.position.set(Tn.x, wallH / 2, Tn.y); root.add(wall); const roof = new THREE.Mesh(new THREE.ConeGeometry(Tn.r * 1.05, 150, 32, 1, true), new THREE.MeshStandardMaterial({ map: stripes(THREE, '#B91C1C', '#FEE2E2', 32), roughness: .8, side: THREE.DoubleSide }));
    roof.position.set(Tn.x, wallH + 75, Tn.y); root.add(roof); const door = new THREE.Mesh(new THREE.PlaneGeometry(48, 60), new THREE.MeshStandardMaterial({ color: '#1F2937' })); door.position.set(Tn.x, 30, Tn.y + Tn.r + 1); root.add(door);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), new THREE.MeshStandardMaterial({ color: '#FACC15', side: THREE.DoubleSide })); flag.position.set(Tn.x + 13, wallH + 180, Tn.y); root.add(flag); const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 40, 6), metal('#FACC15')); pole.position.set(Tn.x, wallH + 170, Tn.y); root.add(pole);
    ticks.push(t => { flag.rotation.y = Math.sin(t * 2) * .25; }); const sg = signMesh('🎪 الخيمة الكبيرة', 18); sg.position.set(Tn.x, 100, Tn.y + Tn.r + 6); root.add(sg); }
  // برج الأرجوحة
  { const Sw = D.SWING, P = new Parts(); P.add(metal('#CBD5E1', .4), new THREE.CylinderGeometry(7, 9, Sw.H, 14).translate(Sw.x, Sw.H / 2, Sw.y), { uv: false }); root.add(P.build());
    const top = new THREE.Group(); top.position.set(Sw.x, Sw.H, Sw.y); root.add(top); top.add(new THREE.Mesh(new THREE.CylinderGeometry(Sw.r * .5, Sw.r * .5, 10, 24), flat('#2563EB'))); const cone = new THREE.Mesh(new THREE.ConeGeometry(Sw.r * .5, 36, 24), flat('#DB2777')); cone.position.y = 23; top.add(cone);
    const arms = []; for (let q = 0; q < 10; q++) { const a = q * Math.PI / 5, arm = new THREE.Group(); arm.rotation.y = a; top.add(arm); const piv = new THREE.Group(); piv.position.x = Sw.r * .45; arm.add(piv);
      piv.add(new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 80, 4).translate(0, -40, 0), metal('#64748B'))); const seat = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 12), flat(['#DB2777', '#F97316', '#2563EB', '#FACC15', '#16A34A'][q % 5])); seat.position.y = -82; piv.add(seat); arms.push(piv); }
    ticks.push(() => { top.rotation.y = -K.t * 1.1; arms.forEach(p => { p.rotation.z = .45 + Math.sin(K.t * .4) * .06; }); }); }
  // أكشاك الدروس: صندوق بفتحة ومظلة مخططة ولافتة
  D.stations.forEach(s => { const P = new Parts(), x = s.x, z = s.y - 44; P.add(material('plaster', s.col), box(104, 70, 24, x, 35, z)); P.add(flat('#3B2A1E'), box(90, 26, 2, x, 36, z + 12.5)); P.add(material('wood', '#C9955A'), box(110, 6, 30, x, 22, z + 4));
    root.add(P.build()); const aw = new THREE.Mesh(new THREE.BoxGeometry(112, 3, 26), new THREE.MeshStandardMaterial({ map: stripes(THREE, s.col, '#F4E3B8', 8), roughness: .7 })); aw.position.set(x, 64, z + 20); aw.rotation.x = .35; root.add(aw);
    const m = signMesh(`${s.icon} ${s.label}`, 16); m.position.set(x, 92, z + 14); root.add(m); });
  // عربات الحلوى، والبالونات، وأعمدة حبال الرايات بأعلامها
  const wood = material('wood', '#7A4A2A');
  D.STALLS.forEach(([x, y, c]) => { const P = new Parts(); [[-38, -26], [38, -26], [-38, 4], [38, 4]].forEach(([a, b]) => P.add(wood, box(5, 70, 5, x + a, 35, y + b - 12))); P.add(material('wood', '#9A6A3E'), box(80, 8, 30, x, 30, y - 15)); P.add(wood, box(80, 22, 28, x, 15, y - 15)); for (let k = 0; k < 5; k++) P.add(flat(k % 2 ? '#F2E6C9' : c), box(17.6, 3, 44, x - 35 + k * 17.6, 72, y - 12)); root.add(P.build()); });
  D.BALLOONS.forEach(([x, y], i) => { const P = new Parts(); P.add(material('wood', '#7C4A1E'), box(24, 30, 20, x, 15, y - 10)); root.add(P.build());
    const cols = i ? ['#F43F5E', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'] : ['#DB2777', '#38BDF8', '#FACC15', '#F97316', '#22C55E'];
    cols.forEach((c, k) => { const b = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 10).scale(1, 1.2, 1), new THREE.MeshStandardMaterial({ color: c, roughness: .25 })); root.add(b); const a = (k - 2) * .3;
      ticks.push(t => b.position.set(x + Math.sin(a + Math.sin(t * 1.4 + k) * .05) * 70, 30 + 70 + Math.cos(a) * 10 + (k % 2) * 10, y - 10)); }); });
  { const P = new Parts(); D.STRINGS.flat().forEach(([x, y]) => P.add(metal('#64748B'), box(5, 124, 5, x, 62, y))); root.add(P.build());
    D.STRINGS.forEach(([a, b], i) => { const A = new THREE.Vector3(a[0], 124, a[1]), B = new THREE.Vector3(b[0], 124, b[1]); for (let k = 0; k < 12; k++) { const u = (k + .5) / 12, p = A.clone().lerp(B, u); p.y -= Math.sin(u * Math.PI) * 26;
      const f = new THREE.Mesh(new THREE.ConeGeometry(6, 15, 3), flat(FLAGC[(k + i) % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }); }
  // البيوت والمسجد والنخيل والإنارة والشوارع
  const LIB = { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H };
  D.HOMES.forEach(Hm => { const hg = houseGroup3D(THREE, Hm, LIB); root.add(hg.group); ticks.push(hg.tick); });
  root.add(omaniMosque(D.MOSQUE, D.MINARET));
  root.add(palms(D.PALMS.map(([x, y, s]) => ({ x, y, s }))));
  const lamps = streetLamps(D.LAMPS.map(([x, y]) => ({ x, y }))); lamps.setLit(false); root.add(lamps.group);
  const street = streetBuild3D(THREE, D.life, D.STREET, { Parts, box, material, signMesh, bench }); root.add(street.group);
  // نصب النردين في الدوّار، وقوس المهرجان
  { const R = D.RING, M = dieMats(THREE), P = new Parts(); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(56, 58, 14, 28).translate(R.x, 7, R.y)); root.add(P.build());
    const d1 = new THREE.Mesh(new THREE.BoxGeometry(46, 46, 46), dieFaces(M, 5, 4, 3)); d1.position.set(R.x - 30, 14 + 23, R.y); d1.rotation.y = .3; root.add(d1);
    const d2 = new THREE.Mesh(new THREE.BoxGeometry(42, 42, 42), dieFaces(M, 6, 2, 3)); d2.position.set(R.x + 30, 14 + 21 + 8, R.y - 4); d2.rotation.set(.2, -.5, .35); root.add(d2);
    const A = new Parts(), y = D.YARD - 40; [-92, 92].forEach(o => A.add(material('stone', '#DB2777'), box(12, 150, 12, R.x + o, 75, y))); A.add(material('stone', '#DB2777'), box(212, 14, 14, R.x, 150, y)); root.add(A.build());
    const sg = signMesh('🎡 مهرجان الألعاب', 22); sg.position.set(R.x, 126, y + 8); root.add(sg); }
  { const a = new THREE.Vector3(254, 115, 1000), b = new THREE.Vector3(506, 115, 1000); for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 22; const f = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 3), flat(FLAGC[k % 5])); f.rotation.x = Math.PI; f.position.copy(p).add(new THREE.Vector3(0, -8, 0)); root.add(f); ticks.push(t => { f.rotation.z = Math.sin(t * 3 + k) * .15; }); } }
  if (!D._inWorld) try { root.add(mountains({ x0: 0, z0: 0, x1: W, z1: D.size.h })); } catch (e) {}
  let sky = null; try { sky = clouds({ x0: 0, z0: 0, x1: W, z1: D.size.h }); root.add(sky); } catch (e) { sky = null; }
  return { group: root, update(t, st, cam) { ticks.forEach(f => f(t)); street.update(t); if (sky && sky.userData.tick) sky.userData.tick(t, cam); } };
}
