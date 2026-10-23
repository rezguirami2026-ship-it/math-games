// أحياء الصف السابع مجسّمة: سور منخفض من الجص بشريط بلون الحي وأعمدة بتيجان، وبوابة بعمودين وقوس ولافتة،
// ومصراعان يدوران (أو عارضة تُرفع في السور الشمالي-الجنوبي). من بيانات content/g7/districts.js نفسها فوق مستطيلات التصادم.
import * as THREE from '../lib/three/three.module.min.js';
import { Parts, box, sphere } from './geom.js';
import { material } from './textures.js';
import { signMesh } from './omani.js';

const FH = 34, PH = 74;   // ارتفاع السور، وارتفاع عمودي البوابة
const flat = (c, r = .6) => material('flat', c, { rough: r });
const PLASTER = () => material('plaster', '#E6D7B8');
function fence(P, x0, z0, x1, z1, col) {   // قطعة سور على امتداد x أو z
  const ew = z0 === z1, len = ew ? x1 - x0 : z1 - z0; if (len <= 4) return;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = ew ? len : 12, D = ew ? 12 : len;
  P.add(PLASTER(), box(W, FH, D, cx, FH / 2, cz)); P.add(flat(col), box(ew ? len : 12.6, 6, ew ? 12.6 : len, cx, FH - 12, cz));
  P.add(material('plaster', '#F1E6CC'), box(ew ? len : 14, 3, ew ? 14 : len, cx, FH + 1.5, cz));
  for (let s = 60; s < len - 10; s += 120) { const x = ew ? x0 + s : cx, z = ew ? cz : z0 + s; P.add(PLASTER(), box(14, FH + 10, 14, x, (FH + 10) / 2, z)); P.add(flat(col, .4), sphere(4, x, FH + 14, z, 10, 8)); }
}
/* بوابة حي: الإرجاع مجموعة فيها userData.setOpen(k) مثل بوابات المناطق */
export function districtGate(d) {
  const g = new THREE.Group(), P = new Parts(), G = d.gate, col = d.cols[0], ew = G.ew !== undefined;
  if (ew) { fence(P, G.a, G.ew + 6, G.g0 - 22, G.ew + 6, col); fence(P, G.g1 + 22, G.ew + 6, G.z, G.ew + 6, col); }
  else { fence(P, G.ns + 6, G.a, G.ns + 6, G.g0 - 18, col); fence(P, G.ns + 6, G.g1 + 18, G.ns + 6, G.z, col); }
  const pil = ew ? [[G.g0 - 11, G.ew + 6], [G.g1 + 11, G.ew + 6]] : [[G.ns + 6, G.g0 - 9], [G.ns + 6, G.g1 + 9]];
  pil.forEach(([x, z]) => { P.add(PLASTER(), box(22, PH, 22, x, PH / 2, z)); P.add(flat(col, .5), box(24, 6, 24, x, PH - 10, z)); P.add(material('plaster', '#F1E6CC'), box(26, 4, 26, x, PH + 2, z)); P.add(flat('#E3B04B', .3), sphere(5, x, PH + 8, z, 12, 8)); });
  // القوس فوق الممر: عارضة بلون الحي وحافة ذهبية
  const span = ew ? G.g1 - G.g0 + 44 : G.g1 - G.g0 + 36, mx = ew ? (G.g0 + G.g1) / 2 : G.ns + 6, mz = ew ? G.ew + 6 : (G.g0 + G.g1) / 2;
  P.add(flat(col, .5), box(ew ? span : 14, 12, ew ? 14 : span, mx, PH + 10, mz)); P.add(flat('#E3B04B', .3), box(ew ? span : 15, 2.5, ew ? 15 : span, mx, PH + 3, mz));
  g.add(P.build());
  const label = `${d.icon} ${d.name}`, sg = signMesh(label, 15);
  sg.geometry.computeBoundingBox(); const sw = sg.geometry.boundingBox.max.x * 2, room = ew ? G.g1 - G.g0 + 30 : 120;
  if (sw > room) sg.scale.set(room / sw, room / sw, 1);
  if (ew) sg.position.set(mx, PH + 30, mz + 8); else sg.position.set(G.ns + 6, PH + 30, G.g0 - 9 + 12);
  g.add(sg);
  if (ew) {   // مصراعان على مفصلين عند طرفي الممر، ينفتحان نحو الجنوب (داخل الحي)
    const leafW = (G.g1 - G.g0) / 2, leaves = [-1, 1].map(sd => {
      const pv = new THREE.Group(); pv.position.set(sd < 0 ? G.g0 : G.g1, 0, G.ew + 6);
      const lp = new Parts(); lp.add(material('wood', '#7A4A2A'), box(leafW, 46, 4, -sd * leafW / 2, 23, 0), { scale: 1 / 50 }); lp.add(flat(col, .5), box(leafW - 6, 5, 4.6, -sd * leafW / 2, 26, 0));
      pv.add(lp.build()); g.add(pv); return { pv, sd };
    });
    g.userData.setOpen = k => leaves.forEach(({ pv, sd }) => { pv.rotation.y = sd * k * 1.45; });
  } else {   // عارضة بلون الحي تُرفع
    const bar = new THREE.Group(); bar.position.set(G.ns + 6, 30, G.g0);
    const bm = new Parts(); bm.add(flat(col, .5), box(7, 7, G.g1 - G.g0, 0, 0, (G.g1 - G.g0) / 2)); for (let z = 14; z < G.g1 - G.g0; z += 24) bm.add(flat('#FFF6E2', .5), box(7.6, 7.6, 6, 0, 0, z));
    bar.add(bm.build()); g.add(bar);
    g.userData.setOpen = k => { bar.rotation.x = -k * 1.35; };
  }
  return g;
}
