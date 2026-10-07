// تجميع قلب القرية مجسّماً من ثوابت اللعبة نفسها (قراءة فقط): كل مبنى فوق أرضية تصادمه تماماً، فالمسارات لا تتغير.
import * as THREE from '../lib/three/three.module.min.js';
import { HOUSES, SOUTH, WAREHOUSE, WELL, PALMS, SIDRS, FARM_PALMS, LAMPS, SHRUBS, MINARET, H_SOUTH, H_WARE, SCHOOL } from '../world/village.js';
import { omaniHouse, omaniMosque, warehouse, signMesh } from './omani.js';
import { material } from './textures.js';
import { box } from './geom.js';
import { palms, sidrTree, shrubs, groundScatter } from './nature.js';
import { ROADS, FARM, PARK } from '../world/village.js';
import { POND } from '../missions/unit1.js';
import { streetLamps, bench, well } from './props.js';
import { Parts } from './geom.js';

/* ظل تلامس ناعم حول قاعدة المبنى (بديل خفيف للـ AO): مستطيل بتدرج شفاف على الأرض */
let aoTex = null;
function contactShadow(x, z, w, d, pad = 26) {
  if (!aoTex) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 8, 32, 32, 32); gr.addColorStop(0, 'rgba(40,25,10,.55)'); gr.addColorStop(.55, 'rgba(40,25,10,.3)'); gr.addColorStop(1, 'rgba(40,25,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); aoTex = new THREE.CanvasTexture(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w + pad * 2, d + pad * 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.position.set(x + w / 2, .6, z + d / 2); m.renderOrder = 2; return m;
}

/* أبراج ركنية لبعض البيوت حتى تختلف المباني (بطراز بهلا) */
const TOWERS = { 0: 'left', 4: 'right', 6: 'left' };

/* المبنى الذي يقف البطل خلفه يصير شبه شفاف (بانتقال ناعم)، فلا يحجب الشخصية أبداً */
const fadeCache = new Map();
function fadedOf(m) { if (Array.isArray(m)) return m.map(fadedOf); if (!fadeCache.has(m)) { const f = m.clone(); f.transparent = true; f.depthWrite = false; f.userData.baseOpacity = m.opacity ?? 1; fadeCache.set(m, f); } return fadeCache.get(m); }
export function fader(obj, foot, H) {
  const meshes = []; obj.traverse(o => { if (o.isMesh) meshes.push({ o, base: o.material }); });
  let a = 1;
  return pl => {
    const behind = pl.x > foot.x - 10 && pl.x < foot.x + foot.w + 10 && pl.y < foot.y + foot.h - 2 && pl.y > foot.y - H * .9;
    const to = behind ? .35 : 1; if (Math.abs(a - to) < .01 && (a === 1) === (to === 1)) return;
    a += (to - a) * .2; if (Math.abs(a - to) < .02) a = to;
    meshes.forEach(({ o, base }) => { if (a >= .999) { o.material = base; } else { const f = fadedOf(base); (Array.isArray(f) ? f : [f]).forEach(x => { x.opacity = a * x.userData.baseOpacity; }); o.material = f; } });
  };
}
export function buildVillage({ quality }) {
  const group = new THREE.Group(), fades = [];
  const put = (obj, b, H) => { group.add(obj); fades.push(fader(obj, { x: b.x, y: b.y, w: b.w, h: b.h }, H)); };
  HOUSES.forEach((b, i) => put(b.mosque ? omaniMosque(b, MINARET) : omaniHouse(i === 2 ? Object.assign({}, b, { sign: '🚪 خزانة البطل' }) : b, { tower: TOWERS[i] }), b, (b.H || 96) * 1.6));   // بيت البطل: لافتة الخزانة على واجهته
  SOUTH.forEach(b => put(omaniHouse(Object.assign({}, b, { H: H_SOUTH, style: 'shop' })), b, H_SOUTH * 1.6));
  put(warehouse(WAREHOUSE, H_WARE), WAREHOUSE, H_WARE * 1.6);
  put(omaniHouse(SCHOOL), SCHOOL, SCHOOL.H * 1.6);   // مدرسة القرية
  HOUSES.concat(SOUTH, [WAREHOUSE, SCHOOL]).forEach(b => group.add(contactShadow(b.x, b.y, b.w, b.h)));
  const wl = well(WELL.x, WELL.y, WELL.r + 4, false); group.add(wl);
  group.add(palms(PALMS));
  const farmGreen = palms(FARM_PALMS.map(p => ({ ...p, s: .95 }))), farmDry = palms(FARM_PALMS.map(p => ({ ...p, s: .95 })), { dry: true });
  group.add(farmGreen, farmDry);
  SIDRS.forEach(p => group.add(sidrTree(p.x, p.y)));
  group.add(shrubs(SHRUBS.map(s => ({ x: s.x, y: s.y, f: s.f, r: 11 }))));
  const lamps = streetLamps(LAMPS); group.add(lamps.group);
  // (أُزيلت الحصى والعشب المبعثر بطلب المستخدم: الأرض أنظف)
  const P = new Parts(); bench(P, 1196, 548);
  // لافتة المزرعة: كبيرة على عمودين عند بوابتها (كانت مرسومة على الأرض فتظهر صغيرة باهتة)
  const fx = FARM.x + FARM.w / 2, WDm = material('wood', '#7A4A2A'); [-66, 66].forEach(dx => P.add(WDm, box(7, 124, 7, fx + dx, 62, FARM.y - 14)));
  group.add(P.build());
  const fs = signMesh('🌾 مزرعة القرية', 30); fs.position.set(fx, 126, FARM.y - 12); group.add(fs);
  let forced = false;
  return {
    group, forceLamps(v) { forced = v; },
    update(state, t, pl) {
      if (pl) fades.forEach(f => f(pl));
      const delivered = !!state.world.delivered;
      farmGreen.visible = delivered; farmDry.visible = !delivered;
      wl.userData.setFull(delivered);
      lamps.setLit(forced || !!(state.quests && state.quests.done.primeNumbers));   // تضيء بعد درس الأعداد الأولية، وفي رمضان
    }
  };
}
