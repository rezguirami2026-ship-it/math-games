// الشخصيات العُمانية مجسّمة (Stylized): دشداشة بفرّاخة، كمّة مطرزة أو مصرّ، عباءة ولحاف للنساء، وجه كرتوني يرمش،
// وهيكل بمفاصل (ورك، ركبة، كتف، مرفق) تُحرَّك إجرائياً: سكون، مشي، جري، التقاط، وضع، تفاعل، احتفال، تلويح، كلام، حمل.
// الانتقال بين الحركات ناعم: كل زاوية تقترب من هدفها في كل إطار (لا قفز بين الوضعيات).
// الطبقة تقرأ فقط: موضع الشخصية وحالتها من اللعبة، ولا تغيّر شيئاً.
import * as THREE from '../lib/three/three.module.min.js';
import { mergeVertices } from '../lib/three/addons/BufferGeometryUtils.js';

const HERO_H = 64;
const cache = new Map();
const once = (k, f) => cache.has(k) ? cache.get(k) : (cache.set(k, f()), cache.get(k));
const mat = (color, rough = .75, extra = {}) => once('m|' + color + rough + JSON.stringify(extra), () => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }));
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
const cloth = (color, rough = .9) => once('cl|' + color, () => new THREE.MeshStandardMaterial({ map: clothTexture(color), roughness: rough, side: THREE.DoubleSide }));
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
function faceTexture(skin, female, closed, beard) {
  return once(`face|${skin}|${female}|${closed}|${beard}`, () => {
    const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = skin; x.fillRect(0, 0, W, H);
    const cx = W * .25, cy = H * .54;   // مركز الوجه على خامة الكرة (الوجه نحو +z)
    x.save(); x.translate(cx, cy); x.scale(1.3, 1.22); x.translate(-cx, -cy);   // ملامح أكبر (أسلوب كرتوني)
    x.fillStyle = 'rgba(255,120,110,.22)'; [-1, 1].forEach(s => { x.beginPath(); x.ellipse(cx + s * 30, cy + 18, 13, 8, 0, 0, 7); x.fill(); });
    [-1, 1].forEach(s => {
      const ex = cx + s * 19, ey = cy - 4;
      if (closed) { x.strokeStyle = '#2A1C16'; x.lineWidth = 3.2; x.lineCap = 'round'; x.beginPath(); x.arc(ex, ey - 2, 7, .25, Math.PI - .25); x.stroke(); }
      else {
        x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(ex, ey, 8.5, 10.5, 0, 0, 7); x.fill();
        x.fillStyle = '#3B2414'; x.beginPath(); x.ellipse(ex + s * .5, ey + 1.5, 6, 7.5, 0, 0, 7); x.fill();
        x.fillStyle = '#120A06'; x.beginPath(); x.ellipse(ex + s * .5, ey + 2, 3.4, 4.3, 0, 0, 7); x.fill();
        x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(ex - 2, ey - 2.5, 2.4, 0, 7); x.fill(); x.beginPath(); x.arc(ex + 2.5, ey + 4, 1.1, 0, 7); x.fill();
        x.strokeStyle = '#2A1C16'; x.lineWidth = 2.4; x.beginPath(); x.ellipse(ex, ey, 8.5, 10.5, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
        if (female) { x.lineWidth = 1.6; [-.2, .2, .55].forEach(a => { x.beginPath(); x.moveTo(ex + s * (6 + a * 5), ey - 8 - a * 3); x.lineTo(ex + s * (9 + a * 6), ey - 12 - a * 3); x.stroke(); }); }
      }
      x.strokeStyle = '#2A1C16'; x.lineWidth = female ? 2.4 : 3.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(ex - s * 7, ey - 16); x.quadraticCurveTo(ex, ey - 21, ex + s * 9, ey - 15); x.stroke();
    });
    x.strokeStyle = 'rgba(120,60,40,.45)'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(cx - 2, cy + 8); x.quadraticCurveTo(cx + 3, cy + 13, cx - 1, cy + 15); x.stroke();
    x.strokeStyle = '#7A2E26'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy + 18, 8, .35, Math.PI - .35); x.stroke();
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
  G.head = smoothGeo(new THREE.SphereGeometry(1, 32, 20));
  G.sphere = smoothGeo(new THREE.SphereGeometry(1, 14, 10));
  G.limb = new THREE.CapsuleGeometry(1, 1, 4, 10);   // يُحجَّم لكل عظمة
  G.shoe = (() => { const g = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(2.3, 1.3, 3.6); g.translate(0, 0, .9); return g; })();
  G.kumma = new THREE.CylinderGeometry(1, 1.02, 1, 28, 1, false); G.kummaTop = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
  G.massar = (() => { const g = new THREE.TorusGeometry(1, .42, 10, 28); g.rotateX(Math.PI / 2); g.scale(1, .9, 1); return g; })();
  G.tassel = new THREE.CylinderGeometry(.55, .25, 6.5, 8).translate(0, -3.25, 0);
  G.box = new THREE.BoxGeometry(1, 1, 1);
  G.dome = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  // اللحاف: كرة بفتحة أمامية للوجه (الوجه نحو +z عند phi = π/2)
  G.hijab = new THREE.SphereGeometry(1, 32, 20, Math.PI / 2 + .78, Math.PI * 2 - 1.56, 0, Math.PI * .74);
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
    const foot = mesh(G.shoe, mat(adult ? '#5A3B26' : '#3E2C20', .7)); foot.position.set(0, -1.4, .2); ankle.add(foot);
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
  } else {   // حزام ملون عند الخصر
    const belt = mesh(new THREE.CylinderGeometry(7.75, 8, 2.2, 24), mat(acc, .7)); belt.scale.z = .82; belt.position.y = 22; torso.add(belt);
  }
  if (look.vest) { const v = mesh(new THREE.LatheGeometry([[6.6, 15.5], [8.1, 13], [7.9, 8], [6.4, 0]].map(([a, b]) => new THREE.Vector2(a, b)), 24, Math.PI * .58, Math.PI * 1.84), cloth(look.vest)); v.scale.z = .86; v.position.y = robeTop - 16; torso.add(v); }
  if (look.apron) { const a = mesh(G.box, cloth(look.apron)); a.scale.set(10, 19, .6); a.position.set(0, robeTop - 17, 7.8); a.rotation.x = -.08; torso.add(a); const str = mesh(G.box, cloth(look.apron)); str.scale.set(1, 7, .4); [-3.5, 3.5].forEach(dx => { const s2 = str.clone(); s2.position.set(dx, robeTop - 4, 6.4); torso.add(s2); }); }
  if (look.postbag) { const b = mesh(G.box, mat('#8B5A2B', .75)); b.scale.set(6, 7, 2.6); b.position.set(7.4, robeTop - 21, 1); torso.add(b); const st = mesh(G.box, mat('#6B4520', .75)); st.scale.set(1.2, 20, .6); st.rotation.z = .55; st.position.set(1, robeTop - 10, 6.3); torso.add(st); }
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
  const faceOpen = faceTexture(skin, female, false, beardC), faceClosed = faceTexture(skin, female, true, beardC);
  const headM = new THREE.MeshStandardMaterial({ map: faceOpen, roughness: .6 });
  const hd = mesh(G.head, headM); hd.scale.set(R, R * 1.04, R * .96); hd.position.y = hy; head.add(hd);
  [-1, 1].forEach(sd => { const ear = mesh(G.sphere, skinM); ear.scale.set(1.3, 2, 1); ear.position.set(sd * R * .97, hy, 0); head.add(ear); });
  if (female) {   // اللحاف: يغطي الرأس ويحيط الوجه وينسدل على الكتفين
    const hm = cloth(acc, .85), hj = mesh(G.hijab, hm); hj.scale.set(R * 1.1, R * 1.12, R * 1.08); hj.rotation.x = .25; hj.position.set(0, hy + .2, -.3); head.add(hj);
    const ring = mesh(G.faceRing, mat(new THREE.Color(acc).offsetHSL(0, 0, -.08).getStyle(), .8)); ring.scale.set(R * .78, R * .86, R); ring.position.set(0, hy - R * .05, R * .82); head.add(ring);
    const dr = mesh(G.drape, hm); dr.scale.set(R / 8.6, 1, R / 9.2); dr.position.y = hy - R * .55; head.add(dr);
  } else if (look.hat === 'straw') {
    const br = mesh(G.brim, mat('#D9B76A', .9)); br.scale.set(R * 1.85, 1, R * 1.85); br.position.y = hy + R * .62; head.add(br);
    const cr = mesh(G.kumma, mat('#C9A55A', .9)); cr.scale.set(R * .82, R * .7, R * .82); cr.position.y = hy + R * .85; head.add(cr);
  } else if (look.hat === 'cap') {
    const cp = mesh(G.dome, mat(acc, .8)); cp.scale.set(R * 1.04, R * .78, R * 1.04); cp.position.y = hy + R * .32; head.add(cp);
    const vz = mesh(G.box, mat(new THREE.Color(acc).offsetHSL(0, 0, -.1).getStyle(), .8)); vz.scale.set(R * 1.2, .7, R * .9); vz.position.set(0, hy + R * .45, R * .95); vz.rotation.x = .15; head.add(vz);
  } else if (adult) {   // المصرّ العُماني للرجال
    const mm = new THREE.MeshStandardMaterial({ map: massarTexture(look.massar || acc), roughness: .9 });
    [[.5, 1.02, 0], [.72, .96, .12], [.92, .84, -.1]].forEach(([y, r, tilt]) => { const ms = mesh(G.massar, mm); ms.scale.set(R * r, R * .62, R * r); ms.rotation.x = tilt; ms.position.y = hy + R * y; head.add(ms); });   // لفّات المصرّ
    const top = mesh(G.dome, mm); top.scale.set(R * .78, R * .42, R * .78); top.position.y = hy + R * 1.05; head.add(top);
    const tail = mesh(G.box, mm); tail.scale.set(R * .35, R * .9, R * .12); tail.position.set(R * .55, hy + R * .1, -R * .8); tail.rotation.z = .2; head.add(tail);   // طرف المصرّ المتدلي خلف الأذن
  } else {   // الكمّة المطرزة للأولاد
    const km = mesh(G.kumma, new THREE.MeshStandardMaterial({ map: kummaTexture(acc), roughness: .85 })); km.scale.set(R * .97, R * .66, R * .97); km.position.y = hy + R * .72; head.add(km);
    const kt = mesh(G.kummaTop, mat('#F7F4EC', .85)); kt.scale.set(R * .97, 1, R * .97); kt.position.y = hy + R * 1.05; head.add(kt);
    const hair = mesh(G.dome, mat('#2A1C16', .7)); hair.scale.set(R * 1.01, R * .5, R * 1.01); hair.rotation.x = Math.PI; hair.position.set(0, hy + R * .42, -R * .08); hair.visible = false; head.add(hair);
  }
  if (look.glasses) [-1, 1].forEach(sd => { const g = mesh(G.ring, mat('#2B2B2B', .4)); g.scale.setScalar(2.3); g.position.set(sd * 2.9, hy + .3, R * .93); head.add(g); });
  // حمل الصناديق: كومة أمام الصدر
  const carry = new THREE.Group(); carry.position.set(0, shY - 12, 7.5); torso.add(carry);
  const crateM = mat('#C9894A', .85);
  for (let i = 0; i < 6; i++) { const b = mesh(G.box, crateM); b.scale.set(8, 6, 7); b.position.set((i % 2) * .8, i * 6.2, 0); b.visible = false; carry.add(b); }
  const sh = blob(); sh.scale.set(9 * sx, 1, 7 * sx); sh.position.y = .3; root.add(sh);
  root.scale.setScalar(S);
  root.traverse(o => { if (o.isMesh && o !== sh) o.castShadow = true; });
  return { root, body, torso, legs, arms, neck, head, headM, faceOpen, faceClosed, carry, adult, female, elder: !!look.elder,
    pose: null, yaw: 0, blinkT: Math.random() * 3, lastX: null, lastY: null };
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
