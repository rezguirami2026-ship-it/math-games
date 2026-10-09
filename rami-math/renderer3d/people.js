// الشخصيات العُمانية مجسّمة (Stylized): دشداشة بفرّاخة، كمّة مطرزة أو مصرّ، عباءة ولحاف للنساء، وجه كرتوني يرمش،
// وهيكل بمفاصل (ورك، ركبة، كتف، مرفق) تُحرَّك إجرائياً: سكون، مشي، جري، التقاط، وضع، تفاعل، احتفال، تلويح، كلام، حمل.
// الانتقال بين الحركات ناعم: كل زاوية تقترب من هدفها في كل إطار (لا قفز بين الوضعيات).
// الطبقة تقرأ فقط: موضع الشخصية وحالتها من اللعبة، ولا تغيّر شيئاً.
import * as THREE from '../lib/three/three.module.min.js';
import { mergeVertices, mergeGeometries } from '../lib/three/addons/BufferGeometryUtils.js';

const HERO_H = 64;
const cache = new Map();
const once = (k, f) => cache.has(k) ? cache.get(k) : (cache.set(k, f()), cache.get(k));
/* إضاءة حافة دافئة خفيفة على كل مواد الشخصيات: تفصلها عن الأرض والجدران فتبدو كشخصيات الألعاب */
function rim(m, k = .32) {
  m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
    totalEmissiveRadiance += vec3(1.0, .9, .74) * pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0) * ${k.toFixed(2)};`); };
  m.customProgramCacheKey = () => 'rim' + k; return m;
}
const mat = (color, rough = .75, extra = {}) => once('m|' + color + rough + JSON.stringify(extra), () => rim(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra })));
const smoothGeo = g => { g.deleteAttribute('normal'); const m = mergeVertices(g, 1e-4); m.computeVertexNormals(); return m; };

/* ── خامات القماش والتطريز (canvas) ── */
function clothTexture(color) {
  return once('cloth|' + color, () => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = color; x.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 64; i += 2) { x.fillStyle = `rgba(0,0,0,${i % 4 ? .025 : .045})`; x.fillRect(0, i, 64, 1); x.fillStyle = 'rgba(255,255,255,.035)'; x.fillRect(i, 0, 1, 64); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.colorSpace = THREE.SRGBColorSpace; return t;
  });
}
const cloth = (color, rough = .9) => once('cl|' + color, () => rim(new THREE.MeshStandardMaterial({ map: clothTexture(color), roughness: rough, side: THREE.DoubleSide })));
/* تطريز عُماني (للثوب والسروال والكمّين): شريط من معيّنات ونقاط وخطوط بالذهبي وألوان متداخلة */
function embroidery(base, c1, c2) {
  return once(`emb|${base}|${c1}|${c2}`, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 256, 64);
    x.fillStyle = c1; x.fillRect(0, 4, 256, 4); x.fillRect(0, 56, 256, 4);
    for (let i = 0; i < 16; i++) { const cx = i * 16 + 8; x.fillStyle = i % 2 ? c1 : c2; x.beginPath(); x.moveTo(cx, 14); x.lineTo(cx + 7, 32); x.lineTo(cx, 50); x.lineTo(cx - 7, 32); x.closePath(); x.fill(); x.fillStyle = base; x.beginPath(); x.arc(cx, 32, 2.6, 0, 7); x.fill(); x.fillStyle = c1; x.beginPath(); x.arc(cx + 8, 20, 1.6, 0, 7); x.arc(cx + 8, 44, 1.6, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); t.colorSpace = THREE.SRGBColorSpace;
    return rim(new THREE.MeshStandardMaterial({ map: t, roughness: .55, metalness: .15, side: THREE.DoubleSide }));
  });
}
/* اللحاف: قماش مطبوع بزهور صغيرة وحافة مطرزة */
function lahafMat(acc) {
  return once('lahaf|' + acc, () => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = acc; x.fillRect(0, 0, 128, 128);
    const lt = new THREE.Color(acc).offsetHSL(0, -.1, .22).getStyle(), dk = new THREE.Color(acc).offsetHSL(.05, 0, -.12).getStyle();
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const cx = i * 32 + (j % 2) * 16 + 8, cy = j * 32 + 8; x.fillStyle = lt; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(a) * 3.2, cy + Math.sin(a) * 3.2, 2.2, 0, 7); x.fill(); } x.fillStyle = '#F2C94C'; x.beginPath(); x.arc(cx, cy, 1.6, 0, 7); x.fill(); x.fillStyle = dk; x.fillRect(cx + 10, cy + 10, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace;
    return rim(new THREE.MeshStandardMaterial({ map: t, roughness: .85, side: THREE.DoubleSide }));
  });
}
/* الكمّة العُمانية: أرضية بيضاء/ملوّنة بتطريز هندسي بلون مميز */
function kummaTexture(acc) {
  return once('kumma|' + acc, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#F7F4EC'; x.fillRect(0, 0, 256, 64);
    x.strokeStyle = acc; x.fillStyle = acc; x.lineWidth = 2.2;
    for (let i = 0; i < 16; i++) { const cx = i * 16 + 8; x.beginPath(); x.moveTo(cx, 8); x.lineTo(cx + 6, 18); x.lineTo(cx, 28); x.lineTo(cx - 6, 18); x.closePath(); x.stroke(); x.fillRect(cx - 1.5, 16.5, 3, 3); }
    for (let i = 0; i < 32; i++) { x.beginPath(); x.arc(i * 8 + 4, 40, 2, 0, 7); x.fill(); }
    x.fillRect(0, 50, 256, 3); x.fillRect(0, 58, 256, 2);
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  });
}
/* المصرّ (العمامة العُمانية): نقش مربعات ملونة */
function massarTexture(acc) {
  return once('massar|' + acc, () => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = acc; x.fillRect(0, 0, 128, 64);
    x.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 128; i += 12) { x.fillRect(i, 0, 3, 64); } for (let j = 0; j < 64; j += 12) x.fillRect(0, j, 128, 3);
    x.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 6; i < 128; i += 12) x.fillRect(i, 0, 2, 64);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 2); t.colorSpace = THREE.SRGBColorSpace; return t;
  });
}
/* الوجه: عينان كبيرتان بلمعة، حاجبان، أنف صغير، فم مبتسم، وخدود. نسختان: مفتوح العينين ومغمض (للرمش) */
function faceTexture(skin, female, closed, beard, v = 0) {
  return once(`face|${skin}|${female}|${closed}|${beard}|${v}`, () => {
    const IRIS = ['#5A3418', '#3B2414', '#6B4A22', '#2F3F2A'][v % 4], smileW = [8, 9.5, 7, 10][v % 4], browArch = [21, 23, 19, 22][(v >> 2) % 4], openSmile = v % 3 === 1;
    const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = skin; x.fillRect(0, 0, W, H);
    const cx = W * .25, cy = H * .54;   // مركز الوجه على خامة الكرة (الوجه نحو +z)
    x.save(); x.translate(cx, cy); x.scale(1.3, 1.22); x.translate(-cx, -cy);   // ملامح أكبر (أسلوب كرتوني)
    x.fillStyle = 'rgba(255,120,110,.22)'; [-1, 1].forEach(s => { x.beginPath(); x.ellipse(cx + s * 30, cy + 18, 13, 8, 0, 0, 7); x.fill(); });
    [-1, 1].forEach(s => {
      const ex = cx + s * 19, ey = cy - 4;
      if (closed) { x.strokeStyle = '#2A1C16'; x.lineWidth = 3.2; x.lineCap = 'round'; x.beginPath(); x.arc(ex, ey - 2, 7, .25, Math.PI - .25); x.stroke(); }
      else {
        x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(ex, ey, 9, 11, 0, 0, 7); x.fill();
        const ig = x.createRadialGradient(ex + s * .5, ey + 1, 1, ex + s * .5, ey + 2, 7.5); ig.addColorStop(0, new THREE.Color(IRIS).offsetHSL(0, 0, .18).getStyle()); ig.addColorStop(1, IRIS);   // قزحية ملونة بتدرج
        x.fillStyle = ig; x.beginPath(); x.ellipse(ex + s * .5, ey + 1.5, 6.6, 8, 0, 0, 7); x.fill();
        x.fillStyle = '#0E0806'; x.beginPath(); x.ellipse(ex + s * .5, ey + 2, 3.3, 4.2, 0, 0, 7); x.fill();
        x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(ex - 2.2, ey - 2.8, 2.8, 3.2, -.4, 0, 7); x.fill(); x.beginPath(); x.arc(ex + 2.8, ey + 4.5, 1.2, 0, 7); x.fill();   // لمعتان
        x.strokeStyle = '#1E120C'; x.lineWidth = 3.4; x.lineCap = 'round'; x.beginPath(); x.ellipse(ex, ey, 9, 11, 0, Math.PI * 1.08, Math.PI * 1.92); x.stroke();   // جفن علوي
        x.strokeStyle = 'rgba(120,70,50,.35)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(ex, ey + .5, 8.4, 10.4, 0, Math.PI * .2, Math.PI * .8); x.stroke();
        x.strokeStyle = '#1E120C'; x.lineWidth = female ? 2 : 1.3; (female ? [-.15, .25, .6] : [.6]).forEach(a => { x.beginPath(); x.moveTo(ex + s * (5.5 + a * 4), ey - 9 - a * 2.4); x.lineTo(ex + s * (8.5 + a * 6), ey - (female ? 14 : 12) - a * 3); x.stroke(); });   // رموش
      }
      x.strokeStyle = '#2A1C16'; x.lineWidth = female ? 2.6 : 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(ex - s * 7, ey - 17); x.quadraticCurveTo(ex, ey - browArch, ex + s * 9.5, ey - 15.5); x.stroke();
    });
    if (openSmile) { x.fillStyle = '#7A2E26'; x.beginPath(); x.moveTo(cx - smileW, cy + 17); x.quadraticCurveTo(cx, cy + 30, cx + smileW, cy + 17); x.closePath(); x.fill(); x.fillStyle = '#FFFFFF'; x.fillRect(cx - smileW * .6, cy + 17.5, smileW * 1.2, 3); }
    else { x.strokeStyle = '#7A2E26'; x.lineWidth = 3.2; x.beginPath(); x.arc(cx, cy + 16, smileW, .38, Math.PI - .38); x.stroke(); }
    if (female) { x.fillStyle = 'rgba(200,80,90,.25)'; x.beginPath(); x.ellipse(cx, cy + 22, 5, 2, 0, 0, 7); x.fill(); }
    if (beard) { x.fillStyle = beard; x.beginPath(); x.moveTo(cx - 34, cy + 2); x.quadraticCurveTo(cx - 32, cy + 52, cx, cy + 56); x.quadraticCurveTo(cx + 32, cy + 52, cx + 34, cy + 2); x.quadraticCurveTo(cx + 22, cy + 30, cx + 10, cy + 26); x.quadraticCurveTo(cx, cy + 32, cx - 10, cy + 26); x.quadraticCurveTo(cx - 22, cy + 30, cx - 34, cy + 2); x.fill();
      x.beginPath(); x.ellipse(cx, cy + 13, 15, 4, 0, Math.PI, 0); x.fill(); }
    x.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  });
}

/* ── الأشكال المشتركة (تُنشأ مرة واحدة) ── */
const G = {};
function geos() {
  if (G.ready) return G; G.ready = true;
  // الدشداشة: قطعة دوّارة من الكتفين إلى الذيل، تتسع للأسفل
  const lathe = (pts, seg = 28) => new THREE.LatheGeometry(pts.slice().reverse().map(([a, b]) => new THREE.Vector2(a, b)), seg);   // النقاط من أعلى لأسفل؛ تُعكس حتى تتجه الأوجه للخارج
  const robe = (sh, hem, H) => lathe([[0, H + .5], [sh * .62, H + .4], [sh, H - 2.5], [sh * 1.02, H * .62], [sh * 1.08, H * .38], [hem, 1.2], [hem * .98, 0], [0, 0]]);
  G.lathe = lathe;
  G.robeKid = robe(7.2, 9.4, 33); G.robeAdult = robe(7.8, 10.4, 37);
  G.abaya = lathe([[0, 34], [4.6, 33.6], [7.4, 31], [7.8, 22], [9, 10], [11.2, 1], [11, 0], [0, 0]]);
  G.head = (() => { const g = smoothGeo(new THREE.SphereGeometry(1, 36, 24)), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); if (y < -.15) { const k = 1 - Math.min(1, (-.15 - y) * .55) * .22; p.setX(i, p.getX(i) * k); } if (z > .3 && y < .1 && y > -.6) p.setZ(i, z * 1.04); } g.computeVertexNormals(); return g; })();   // ذقن أنعم وخدود ممتلئة
  G.nose = (() => { const g = new THREE.SphereGeometry(1, 12, 10); g.scale(.9, 1, 1.05); return g; })();
  G.sphere = smoothGeo(new THREE.SphereGeometry(1, 14, 10));
  G.limb = new THREE.CapsuleGeometry(1, 1, 4, 10);   // يُحجَّم لكل عظمة
  G.shoe = (() => { const g = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(2.3, 1.3, 3.6); g.translate(0, 0, .9); return g; })();
  G.kumma = new THREE.CylinderGeometry(1, 1.02, 1, 28, 1, false); G.kummaTop = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
  G.massar = (() => { const g = new THREE.TorusGeometry(1, .42, 10, 28); g.rotateX(Math.PI / 2); g.scale(1, .9, 1); return g; })();
  G.tassel = new THREE.CylinderGeometry(.55, .25, 6.5, 8).translate(0, -3.25, 0);
  G.box = new THREE.BoxGeometry(1, 1, 1);
  G.dome = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  // اللحاف: كرة بفتحة أمامية للوجه (الوجه نحو +z عند phi = π/2)
  // اللحاف: قمة كاملة تغطي الجبهة، وجانبان بفتحة للوجه فقط
  G.hijab = mergeGeometries([new THREE.SphereGeometry(1, 32, 8, 0, Math.PI * 2, 0, Math.PI * .34), new THREE.SphereGeometry(1, 32, 14, Math.PI / 2 + .74, Math.PI * 2 - 1.48, Math.PI * .34, Math.PI * .42)]);
  G.faceRing = (() => { const g = new THREE.TorusGeometry(1, .09, 8, 24, Math.PI * 1.25); g.rotateZ(-Math.PI * .125 - Math.PI / 2 + Math.PI); return g; })();
  G.drape = lathe([[5.6, 0], [7.8, -5], [8.9, -10], [9.2, -12.5]]);
  G.sleeve = new THREE.CylinderGeometry(1, 1.12, 1, 14, 1, true);
  G.brim = new THREE.CylinderGeometry(1, 1, .5, 28);
  G.ring = new THREE.TorusGeometry(1, .14, 6, 16);
  G.stick = new THREE.CylinderGeometry(.55, .55, 1, 6);
  G.shadow = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
  return G;
}
let shadowMat = null;
function blob() {
  if (!shadowMat) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, 'rgba(30,20,10,.5)'); g.addColorStop(1, 'rgba(30,20,10,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); shadowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }); }
  const m = new THREE.Mesh(G.shadow, shadowMat); m.renderOrder = 3; return m;
}
const mesh = (geo, m, cast = true) => { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = false; return o; };
const pivot = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); return g; };

/* ── بناء شخصية من مظهرها ── look = { kind, skin, robe, accent, beard, hat, glasses, vest, apron, postbag, tool, build, tall, elder, gear, s } */
export function buildPerson(look) {
  geos();
  const kind = look.kind || 'man', female = kind === 'girl' || kind === 'woman', adult = kind === 'man' || kind === 'woman';
  const skin = look.skin || '#DDA779', acc = look.accent || (female ? '#2E8B57' : '#2F6FB2');
  const robeC = look.robe || (female ? '#8E3B5E' : '#F4F1E8');
  const root = new THREE.Group(), body = pivot(0, 0, 0); root.add(body);
  const S = (adult ? 1.1 : 1) * (look.tall || 1) * (look.s || 1), sx = look.build || 1;
  body.scale.set(sx, 1, sx);
  const skinM = mat(skin, .62), robeM = cloth(robeC);
  // الساقان: تظهران تحت الذيل (سروال وصندل)
  const hipY = adult ? 15.5 : 14, legLen = hipY - 2.2, pants = female ? new THREE.Color(acc).offsetHSL(0, 0, -.12).getStyle() : '#ECE6DA';
  const legs = [-1, 1].map(sd => {
    const hip = pivot(sd * 2.6, hipY, 0), knee = pivot(0, -legLen / 2, 0); body.add(hip); hip.add(knee);
    const th = mesh(G.limb, mat(pants, .85)); th.scale.set(2.1, legLen / 4, 2.1); th.position.y = -legLen / 4; hip.add(th);
    const sh = mesh(G.limb, mat(pants, .85)); sh.scale.set(1.8, legLen / 4, 1.8); sh.position.y = -legLen / 4; knee.add(sh);
    const ankle = pivot(0, -legLen / 2 + .2, 0); knee.add(ankle);
    if (female) { const cuff = mesh(new THREE.CylinderGeometry(2.3, 2.5, 2.6, 14), embroidery(pants, '#E3B04B', acc)); cuff.position.y = 1.4; ankle.add(cuff); }   // كفّة السروال المطرزة
    const foot = mesh(G.shoe, mat(look.shoe || (adult ? '#5A3B26' : '#3E2C20'), .7)); foot.position.set(0, -1.4, .2); ankle.add(foot);
    const skinFoot = mesh(G.sphere, skinM); skinFoot.scale.set(1.7, 1, 2.6); skinFoot.position.set(0, -.6, .9); ankle.add(skinFoot);
    return { hip, knee, ankle };
  });
  // الجذع والثوب
  const torso = pivot(0, 0, 0); body.add(torso);
  const robe = mesh(female ? G.abaya : adult ? G.robeAdult : G.robeKid, robeM); robe.position.y = 4; robe.scale.set(1, 1, .82); torso.add(robe);   // الذيل فوق الكعبين فيظهر الصندل
  const robeTop = (female ? 34 : adult ? 37 : 33) + 4;
  if (!female) {   // الفرّاخة: شُرّابة الدشداشة العُمانية عند العنق، وشق الصدر
    const tas = mesh(G.tassel, mat(look.tassel || '#E9E2D0', .7)); tas.position.set(0, robeTop - 2.4, 6.2); torso.add(tas);
    const slit = mesh(G.box, mat('#D9D2C2', .9)); slit.scale.set(.4, 7, .3); slit.position.set(0, robeTop - 5.5, 6.05); torso.add(slit);
  } else {   // الثوب العُماني: تطريز عريض عند الذيل، وصدرية مطرزة، وحزام، وسروال مطرز يظهر عند الكاحل
    const gold = '#E3B04B', emb = look.elder ? embroidery('#1E1A22', gold, '#B03A48') : embroidery(new THREE.Color(robeC).offsetHSL(0, 0, -.14).getStyle(), gold, acc);
    const hemB = mesh(new THREE.CylinderGeometry(10.9, 11.3, 5, 28, 1, true), emb); hemB.scale.z = .82; hemB.position.y = 4 + 2.8; torso.add(hemB);
    const midB = mesh(new THREE.CylinderGeometry(9.1, 9.5, 2, 28, 1, true), emb); midB.scale.z = .82; midB.position.y = 4 + 11; torso.add(midB);
    const yoke = mesh(new THREE.CylinderGeometry(6.4, 7.6, 9, 24, 1, true, -.9, 1.8), emb); yoke.scale.z = .82; yoke.position.y = robeTop - 5.5; torso.add(yoke);
    const belt = mesh(new THREE.CylinderGeometry(7.75, 8, 2, 24), mat(gold, .4, { metalness: .6 })); belt.scale.z = .82; belt.position.y = 4 + 21; torso.add(belt);
    const neck = mesh(new THREE.TorusGeometry(3.4, .45, 6, 18, Math.PI), mat(gold, .3, { metalness: .9 })); neck.rotation.set(Math.PI / 2 + .4, 0, Math.PI); neck.position.set(0, robeTop - 1.8, 4.6); torso.add(neck);
    const pend = mesh(G.sphere, mat(gold, .3, { metalness: .9 })); pend.scale.set(1.1, 1.4, .6); pend.position.set(0, robeTop - 5.2, 6.4); torso.add(pend);
  }
  if (look.vest) { const v = mesh(new THREE.LatheGeometry([[6.6, 15.5], [8.1, 13], [7.9, 8], [6.4, 0]].map(([a, b]) => new THREE.Vector2(a, b)), 24, Math.PI * .58, Math.PI * 1.84), cloth(look.vest)); v.scale.z = .86; v.position.y = robeTop - 16; torso.add(v); }
  if (look.apron) { const a = mesh(G.box, cloth(look.apron)); a.scale.set(10, 19, .6); a.position.set(0, robeTop - 17, 7.8); a.rotation.x = -.08; torso.add(a); const str = mesh(G.box, cloth(look.apron)); str.scale.set(1, 7, .4); [-3.5, 3.5].forEach(dx => { const s2 = str.clone(); s2.position.set(dx, robeTop - 4, 6.4); torso.add(s2); }); }
  if (look.postbag) { const b = mesh(G.box, mat('#8B5A2B', .75)); b.scale.set(6, 7, 2.6); b.position.set(7.4, robeTop - 21, 1); torso.add(b); const st = mesh(G.box, mat('#6B4520', .75)); st.scale.set(1.2, 20, .6); st.rotation.z = .55; st.position.set(1, robeTop - 10, 6.3); torso.add(st); }
  if (look.gear && look.gear.cape) {   // وشاح حامي القرية: نصف أسطوانة مفتوحة خلف الظهر تتسع نحو الأسفل
    const ch = robeTop - 6, cp = mesh(new THREE.CylinderGeometry(8, 11.5, ch, 20, 1, true, Math.PI * .58, Math.PI * .84), new THREE.MeshStandardMaterial({ color: look.gear.cape, roughness: .7, side: THREE.DoubleSide }));
    cp.scale.z = .9; cp.position.set(0, 6 + ch / 2, -.6); torso.add(cp);
    const hem = mesh(new THREE.CylinderGeometry(11.6, 11.6, 1.2, 20, 1, true, Math.PI * .58, Math.PI * .84), new THREE.MeshStandardMaterial({ color: '#E3B04B', metalness: .5, roughness: .4, side: THREE.DoubleSide })); hem.scale.z = .9; hem.position.set(0, 6.6, -.6); torso.add(hem);
  }
  if (look.gear && look.gear.medal) {   // وسام البطل الأكبر الذهبي على الصدر
    const rib = mat('#C0392B', .7); [-1, 1].forEach(sd => { const r = mesh(G.box, rib); r.scale.set(1.6, 6, .5); r.position.set(sd * 1.6, robeTop - 5, 7.4); r.rotation.z = sd * .35; torso.add(r); });
    const disc = mesh(new THREE.CylinderGeometry(2.6, 2.6, .8, 20), mat('#FFD54A', .25, { metalness: .9, emissive: '#7A5200', emissiveIntensity: .35 })); disc.rotation.x = Math.PI / 2; disc.position.set(0, robeTop - 9.5, 7.9); torso.add(disc);
  }
  if (look.gear && look.gear.bag) { const b = mesh(G.box, mat(acc, .7)); b.scale.set(9, 11, 4); b.position.set(0, robeTop - 11, -8); torso.add(b); }
  // الذراعان: كتف ← مرفق ← يد
  const shY = robeTop - 2.5, upper = adult ? 10.5 : 9.5, fore = adult ? 9.8 : 9;
  const arms = [-1, 1].map(sd => {
    const sh = pivot(sd * 7.3, shY, 0), el = pivot(0, -upper, 0); torso.add(sh); sh.add(el);
    const j = mesh(G.sphere, robeM); j.scale.setScalar(2.75); sh.add(j);                                          // مفصل الكتف يندمج بالثوب
    const u = mesh(G.sleeve, robeM); u.scale.set(2.45, upper, 2.45); u.position.y = -upper / 2; sh.add(u);
    const e = mesh(G.sphere, robeM); e.scale.setScalar(2.55); el.add(e);
    const f = mesh(G.sleeve, robeM); f.scale.set(2.35, fore, 2.35); f.position.y = -fore / 2; el.add(f);           // كم واسع كأكمام الدشداشة
    const wr = mesh(G.limb, skinM); wr.scale.set(1.25, .6, 1.25); wr.position.y = -fore - .2; el.add(wr);
    const hand = mesh(G.sphere, skinM); hand.scale.set(2, 2.3, 1.8); hand.position.y = -fore - 2.2; el.add(hand);
    if (female) { const cf = mesh(new THREE.CylinderGeometry(2.45, 2.65, 2.2, 14, 1, true), embroidery(robeC, '#E3B04B', acc)); cf.position.y = -fore + 1; el.add(cf);
      const bg = mesh(new THREE.TorusGeometry(1.45, .32, 6, 14), mat('#E3B04B', .3, { metalness: .9 })); bg.rotation.x = Math.PI / 2; bg.position.y = -fore - .5; el.add(bg); }
    const th = mesh(G.sphere, skinM); th.scale.set(.75, 1.2, .75); th.position.set(-sd * 1.6, -fore - 1.4, .9); el.add(th);   // الإبهام
    return { sh, el, hand };
  });
  if (look.tool) {   // عصا أو معول في اليد اليمنى
    const st = mesh(G.stick, mat('#7A4A2A', .8)); st.scale.set(1, look.tool === 'cane' ? 38 : 44, 1); st.position.set(0, -fore + 6 - (look.tool === 'cane' ? 19 : 22) + 14, 1.2); arms[1].el.add(st);
    if (look.tool === 'hoe') { const bl = mesh(G.box, mat('#8E99A5', .5, { metalness: .6 })); bl.scale.set(1, 6, 7); bl.position.set(0, -fore - 22, 4); arms[1].el.add(bl); }
    else { const hk = mesh(new THREE.TorusGeometry(2.4, .55, 6, 10, Math.PI), mat('#7A4A2A', .8)); hk.position.set(0, -fore + 25, 3.6); hk.rotation.y = Math.PI / 2; arms[1].el.add(hk); }
  }
  // الرأس
  const neck = pivot(0, robeTop - .5, 0), head = pivot(0, 0, 0); torso.add(neck); neck.add(head);
  const R = adult ? 8 : 9.4, hy = R * .95 + 1.2;   // رأس الطفل أكبر نسبياً (نسب كرتونية مناسبة للعمر)
  const nk = mesh(G.limb, skinM); nk.scale.set(2.6, 1, 2.4); nk.position.y = .8; neck.add(nk);
  const beardC = look.beard && adult && !female ? look.beard : null;
  const fv = Math.abs([...String(look.id || look.name || look.kind)].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7)) % 16;   // تنوع الملامح لكل شخصية
  const faceOpen = faceTexture(skin, female, false, beardC, fv), faceClosed = faceTexture(skin, female, true, beardC, fv);
  const headM = rim(new THREE.MeshStandardMaterial({ map: faceOpen, roughness: .55 }), .22);
  const hd = mesh(G.head, headM); hd.scale.set(R, R * 1.04, R * .96); hd.position.y = hy; head.add(hd);
  const nose = mesh(G.nose, mat(new THREE.Color(skin).offsetHSL(0, .02, -.03).getStyle(), .55)); nose.scale.setScalar(R * (adult ? .15 : .12)); nose.position.set(0, hy - R * .1, R * .95); head.add(nose);   // أنف مجسّم صغير
  [-1, 1].forEach(sd => { const ear = mesh(G.sphere, skinM); ear.scale.set(1.3, 2, 1); ear.position.set(sd * R * .97, hy, 0); head.add(ear); });
  if (female) {   // اللحاف: يغطي الرأس ويحيط الوجه وينسدل على الكتفين
    const lc = look.elder ? '#1E1A22' : (look.lahaf || acc), hm = lahafMat(lc), hj = mesh(G.hijab, hm); hj.scale.set(R * 1.1, R * 1.12, R * 1.08); hj.rotation.x = .25; hj.position.set(0, hy + .2, -.3); head.add(hj);
    const ring = mesh(new THREE.TorusGeometry(1, .075, 8, 32, Math.PI * 1.15), embroidery(new THREE.Color(lc).offsetHSL(0, 0, -.06).getStyle(), '#E3B04B', '#F2E6C9'));
    ring.rotation.z = Math.PI / 2 - Math.PI * .075 + Math.PI; ring.rotation.z = -Math.PI * .075; ring.scale.set(R * .74, R * .78, R); ring.position.set(0, hy - R * .02, R * .72); ring.rotation.x = -.3; head.add(ring);   // حافة اللحاف المطرزة حول الوجه (قوس علوي)
    const dr = mesh(G.drape, hm); dr.scale.set(R / 8.6, 1.35, R / 9.2); dr.position.y = hy - R * .55; head.add(dr);
    const tail = mesh(new THREE.PlaneGeometry(1, 1), hm); tail.scale.set(R * 1.4, R * 2.4, 1); tail.position.set(0, hy - R * 1.5, -R * .95); tail.rotation.x = .12; head.add(tail);   // طرف اللحاف المنسدل على الظهر
  } else if (look.hat === 'straw') {
    const br = mesh(G.brim, mat('#D9B76A', .9)); br.scale.set(R * 1.85, 1, R * 1.85); br.position.y = hy + R * .62; head.add(br);
    const cr = mesh(G.kumma, mat('#C9A55A', .9)); cr.scale.set(R * .82, R * .7, R * .82); cr.position.y = hy + R * .85; head.add(cr);
  } else if (look.hat === 'cap') {
    const cp = mesh(G.dome, mat(acc, .8)); cp.scale.set(R * 1.04, R * .78, R * 1.04); cp.position.y = hy + R * .32; head.add(cp);
    const vz = mesh(G.box, mat(new THREE.Color(acc).offsetHSL(0, 0, -.1).getStyle(), .8)); vz.scale.set(R * 1.2, .7, R * .9); vz.position.set(0, hy + R * .45, R * .95); vz.rotation.x = .15; head.add(vz);
  } else if (adult || look.head === 'massar') {   // المصرّ العُماني للرجال (وللبطل إن اختاره من الخزانة)
    const mm = rim(new THREE.MeshStandardMaterial({ map: massarTexture(look.massar || acc), roughness: .9 }));
    [[.5, 1.02, 0], [.72, .96, .12], [.92, .84, -.1]].forEach(([y, r, tilt]) => { const ms = mesh(G.massar, mm); ms.scale.set(R * r, R * .62, R * r); ms.rotation.x = tilt; ms.position.y = hy + R * y; head.add(ms); });   // لفّات المصرّ
    const top = mesh(G.dome, mm); top.scale.set(R * .78, R * .42, R * .78); top.position.y = hy + R * 1.05; head.add(top);
    const tail = mesh(G.box, mm); tail.scale.set(R * .35, R * .9, R * .12); tail.position.set(R * .55, hy + R * .1, -R * .8); tail.rotation.z = .2; head.add(tail);   // طرف المصرّ المتدلي خلف الأذن
  } else {   // الكمّة المطرزة للأولاد
    const km = mesh(G.kumma, rim(new THREE.MeshStandardMaterial({ map: kummaTexture(acc), roughness: .85 }))); km.scale.set(R * .97, R * .66, R * .97); km.position.y = hy + R * .72; head.add(km);
    const kt = mesh(G.kummaTop, mat('#F7F4EC', .85)); kt.scale.set(R * .97, 1, R * .97); kt.position.y = hy + R * 1.05; head.add(kt);
    const hair = mesh(G.dome, mat('#2A1C16', .7)); hair.scale.set(R * 1.01, R * .5, R * 1.01); hair.rotation.x = Math.PI; hair.position.set(0, hy + R * .42, -R * .08); hair.visible = false; head.add(hair);
  }
  if (look.gear && look.gear.crown) {   // تاج قرية الخير فوق الرأس (فوق الكمة أو اللحاف)
    const gold = mat('#FFD54A', .25, { metalness: .9, emissive: '#6A4500', emissiveIntensity: .3 }), cy = hy + R * (female ? 1.12 : 1.02) + (look.hat ? 2.5 : 0), cr = new THREE.Group(); cr.position.y = cy;
    const band = mesh(new THREE.CylinderGeometry(R * .62, R * .66, R * .32, 28, 1, true), gold); band.material.side = THREE.DoubleSide; cr.add(band);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, sp = mesh(new THREE.ConeGeometry(R * .13, R * .42, 6), gold); sp.position.set(Math.sin(a) * R * .62, R * .34, Math.cos(a) * R * .62); cr.add(sp); }
    [['#E2475C', 0], ['#2F9BD6', 1.1], ['#2E8B57', -1.1]].forEach(([c, a]) => { const j = mesh(G.sphere, mat(c, .2, { metalness: .3 })); j.scale.setScalar(R * .09); j.position.set(Math.sin(a) * R * .66, 0, Math.cos(a) * R * .66); cr.add(j); });
    head.add(cr);
  }
  if (look.glasses) [-1, 1].forEach(sd => { const g = mesh(G.ring, mat('#2B2B2B', .4)); g.scale.setScalar(2.3); g.position.set(sd * 2.9, hy + .3, R * .93); head.add(g); });
  // حمل الصناديق: كومة أمام الصدر
  const carry = new THREE.Group(); carry.position.set(0, shY - 12, 7.5); torso.add(carry);
  const crateM = mat('#C9894A', .85);
  for (let i = 0; i < 6; i++) { const b = mesh(G.box, crateM); b.scale.set(8, 6, 7); b.position.set((i % 2) * .8, i * 6.2, 0); b.visible = false; carry.add(b); }
  const sh = blob(); sh.scale.set(9 * sx, 1, 7 * sx); sh.position.y = .3; root.add(sh);
  root.scale.setScalar(S);
  root.traverse(o => { if (o.isMesh && o !== sh) o.castShadow = true; });
  [body, torso, neck, head, ...legs.flatMap(l => [l.hip, l.knee, l.ankle]), ...arms.flatMap(a => [a.sh, a.el])].forEach(p => mergeChildren(p, hd));   // أقل draw calls
  return { root, body, torso, legs, arms, neck, head, headM, faceOpen, faceClosed, carry, adult, female, elder: !!look.elder,
    pose: null, yaw: 0, blinkT: Math.random() * 3, lastX: null, lastY: null };
}

/* دمج الأجزاء الثابتة داخل كل مفصل حسب المادة: الشخصية الواحدة من ~٥٠ رسمة إلى ~١٥، والحركة كما هي (المفاصل لا تُدمج) */
function mergeChildren(pv, keep) {
  const by = new Map(), drop = [];
  pv.children.forEach(o => { if (!o.isMesh || o === keep || Array.isArray(o.material)) return; o.updateMatrix(); const g = o.geometry.clone().applyMatrix4(o.matrix); const k = o.material; if (!by.has(k)) by.set(k, []); by.get(k).push(g.index ? g.toNonIndexed() : g); drop.push(o); });
  by.forEach((list, m) => { if (list.length < 2) return; list.forEach(g => { ['uv1', 'uv2'].forEach(a => g.getAttribute(a) && g.deleteAttribute(a)); if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); });
    const merged = mergeGeometries(list); if (!merged) return; const mm = new THREE.Mesh(merged, m); mm.castShadow = true; pv.add(mm);
    drop.filter(o => o.material === m).forEach(o => pv.remove(o)); });
}
/* ── الوضعيات: زوايا المفاصل (راديان) لكل حركة، ثم تقترب الوضعية الحالية منها بنعومة ── */
const ZERO = () => ({ hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, shL: 0, shR: 0, shLz: 0, shRz: 0, elL: 0, elR: 0, lean: 0, bob: 0, headX: 0, headY: 0, twist: 0, crouch: 0 });
function targetPose(st, P, t) {
  const p = ZERO(), a = st.anim, k = st.animT || 0, s = Math.sin(k * Math.PI);
  const walking = st.moving && !a, run = walking && st.run, ph = (st.phase || 0) * .62;
  if (walking) {
    const A = run ? .78 : .5, sw = Math.sin(ph);
    p.hipL = A * sw; p.hipR = -A * sw;
    p.kneeL = (run ? 1.1 : .7) * Math.max(0, -Math.cos(ph)); p.kneeR = (run ? 1.1 : .7) * Math.max(0, Math.cos(ph));
    p.shL = -A * .75 * sw; p.shR = A * .75 * sw; p.elL = p.elR = run ? -1.1 : -.35;
    p.bob = Math.abs(Math.cos(ph)) * (run ? 1.6 : .9); p.lean = run ? .16 : .05; p.twist = sw * .06;
  } else {
    p.bob = Math.sin(t * 1.8 + P.seed) * .18; p.shLz = .06; p.shRz = -.06; p.elL = p.elR = -.12;   // تنفّس هادئ
    p.headY = Math.sin(t * .37 + P.seed) * .18; p.headX = Math.sin(t * .23 + P.seed) * .04;      // نظرات خفيفة حوله
  }
  if (P.elder) { p.lean += .14; p.headX -= .1; }
  if (a === 'pickup' || a === 'place') { const m = a === 'pickup' ? 1 : .6; p.lean = .7 * s * m; p.hipL = p.hipR = -.25 * s * m; p.kneeL = p.kneeR = .9 * s * m; p.crouch = 5 * s * m; p.shL = p.shR = -.9 * s * m; p.elL = p.elR = -.3; }
  if (a === 'interact') { p.shR = -1.25 * s; p.elR = -.4 * s; p.lean = .1 * s; }
  if (a === 'celebrate') { const j = Math.abs(Math.sin(k * Math.PI * 2)); p.shL = p.shR = -2.6; p.shLz = .35; p.shRz = -.35; p.elL = p.elR = -.3; p.bob = j * 9; p.kneeL = p.kneeR = .5 * (1 - j); }
  if (a === 'wave') { p.shR = -2.75; p.shRz = -.25; p.elR = -.5 - .45 * Math.sin(t * 9); p.headY = .15; }
  if (a === 'talk') { p.shR = -.75 + Math.sin(t * 5) * .2; p.elR = -1 + Math.sin(t * 7) * .25; p.shL = -.4 + Math.sin(t * 4 + 1) * .15; p.elL = -.9; p.headX = Math.sin(t * 6) * .05; }
  if (st.carry) { p.shL = p.shR = -1.15; p.elL = p.elR = -.55; p.shLz = .18; p.shRz = -.18; p.lean = Math.max(p.lean, -.04); }
  return p;
}

/* تحديث شخصية في كل إطار. st = { x, y, moving, phase, run, anim, animT, carry, dir } */
export function animatePerson(P, st, dt, t) {
  P.seed = P.seed ?? Math.random() * 10;
  // الاتجاه: من الحركة الفعلية، وإلا من dir. الدوران ناعم بأقصر طريق
  let want = P.yaw;
  if (P.lastX !== null) { const dx = st.x - P.lastX, dy = st.y - P.lastY; if (dx * dx + dy * dy > .02) want = Math.atan2(dx, dy); else if (st.face) want = Math.atan2(st.face.x - st.x, st.face.y - st.y); else if (!st.moving && st.dir && !P.lockDir) want = { down: 0, up: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[st.dir] ?? want; }   // الواقف ينظر إلى البطل إن اقترب
  P.still = st.moving ? 0 : (P.still || 0) + dt; if (st.faceCam && P.still > 1.2 && !st.anim) want = 0;   // البطل الواقف يلتفت نحو الكاميرا
  P.lastX = st.x; P.lastY = st.y;
  let d = want - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw += d * Math.min(1, dt * 10);
  P.root.position.set(st.x, 0, st.y); P.root.rotation.y = P.yaw;
  const tp = targetPose(st, P, t), k = Math.min(1, dt * 12);
  if (!P.pose) P.pose = tp; else for (const key in tp) P.pose[key] += (tp[key] - P.pose[key]) * k;
  const q = P.pose;
  P.body.position.y = q.bob * .5 - q.crouch; P.torso.rotation.x = q.lean; P.torso.rotation.y = q.twist;
  P.legs[0].hip.rotation.x = -q.hipL; P.legs[1].hip.rotation.x = -q.hipR; P.legs[0].knee.rotation.x = q.kneeL; P.legs[1].knee.rotation.x = q.kneeR;
  P.legs.forEach(l => { l.ankle.rotation.x = -l.hip.rotation.x * .4 - l.knee.rotation.x * .6; });
  P.arms[0].sh.rotation.x = q.shL; P.arms[1].sh.rotation.x = q.shR; P.arms[0].sh.rotation.z = q.shLz; P.arms[1].sh.rotation.z = q.shRz;
  P.arms[0].el.rotation.x = q.elL; P.arms[1].el.rotation.x = q.elR;
  P.head.rotation.x = q.headX - q.lean * .5; P.head.rotation.y = q.headY;
  // الرمش: كل ٢–٥ ثوانٍ لمدة قصيرة
  P.blinkT -= dt; const closed = P.blinkT < 0;
  if (P.blinkT < -.12) P.blinkT = 2 + Math.random() * 3;
  const want2 = closed ? P.faceClosed : P.faceOpen; if (P.headM.map !== want2) P.headM.map = want2;
  const n = Math.min(6, st.carry || 0); P.carry.children.forEach((b, i) => { b.visible = i < n; });
}
