// بوابة القرية التالية (الصفان ٨ و٩): كالبوابات بين مناطق الصفوف ٥–٧. على الحافة الجنوبية لكل قرية (def.gate = { x, y })
// برجان حجريان وعارضة عليها لافتة القرية التالية، ومصراعان خشبيان مغلقان حتى تكتمل دروس القرية، ثم يُفتحان بحركة
// ويمرّ البطل منهما إلى القرية التالية. G = { x, y, open (٠..١ متحرك)، want (مفتوحة؟)، label } يحدّثه runtime.js.
import { upright, signboard } from '../world/art.js';

export const GATE_W = 150, POST = 26, LINTEL = 150;   // عرض الممر بين البرجين، وعرض البرج، وارتفاع العارضة

/* عناصر الرسم ثنائي الأبعاد: البرجان والعارضة واللافتة، والمصراعان بزاوية فتحهما */
export function gateItems2D(G, t) {
  const { x, y } = G, half = GATE_W / 2, out = [];
  const tower = (cc, cx) => { cc.fillStyle = '#C9B48E'; cc.fillRect(cx - POST / 2, y - LINTEL - 20, POST, LINTEL + 20); cc.fillStyle = '#A88E66'; cc.fillRect(cx + POST / 2 - 6, y - LINTEL - 20, 6, LINTEL + 20);
    cc.fillStyle = '#E9DCC2'; for (let k = 0; k < 3; k++) cc.fillRect(cx - POST / 2 - 3 + k * 11, y - LINTEL - 32, 8, 12);
    cc.fillStyle = 'rgba(80,50,20,.25)'; for (let yy = y - LINTEL; yy < y; yy += 18) cc.fillRect(cx - POST / 2, yy, POST, 2); };
  out.push({ x, y: y - 2, draw: c => upright(c, x, y, cc => {
    // ضوء القرية التالية يظهر بين البرجين حين تُفتح
    if (G.open > .02) { const gl = cc.createLinearGradient(0, y - LINTEL, 0, y); gl.addColorStop(0, `rgba(255,236,170,${.0})`); gl.addColorStop(1, `rgba(255,236,170,${.55 * G.open})`); cc.fillStyle = gl; cc.fillRect(x - half, y - LINTEL, GATE_W, LINTEL); }
    // المصراعان: يدوران حول البرجين (يضيق عرضهما الظاهر مع الفتح)
    const leaf = half * (1 - G.open * .82), col = '#7A4A22';
    [[x - half, 1], [x + half, -1]].forEach(([px, s]) => { const x0 = s > 0 ? px : px - leaf; cc.fillStyle = col; cc.fillRect(x0, y - 112, leaf, 112); cc.fillStyle = '#5C3A1A';
      for (let k = 1; k < 4; k++) cc.fillRect(x0, y - 112 + k * 28, leaf, 3); cc.fillStyle = '#D4A017'; for (let k = 0; k < 3; k++) cc.fillRect(x0 + (s > 0 ? leaf - 8 : 4), y - 100 + k * 34, 4, 4); });
    if (G.open < .05) { cc.fillStyle = '#D4A017'; cc.beginPath(); cc.arc(x, y - 58, 9, 0, 7); cc.fill(); cc.fillStyle = '#5C3A1A'; cc.fillRect(x - 2, y - 60, 4, 8); }   // القفل
    tower(cc, x - half - POST / 2); tower(cc, x + half + POST / 2);
    cc.fillStyle = '#B49A74'; cc.fillRect(x - half - POST, y - LINTEL - 22, GATE_W + POST * 2, 20); cc.fillStyle = '#D8C4A2'; cc.fillRect(x - half - POST, y - LINTEL - 22, GATE_W + POST * 2, 5);
    signboard(cc, x, y - LINTEL + 6, G.label);
  }) });
  return out;
}

/* المجسّم: برجان وعارضة ولافتة، ومصراعان على مفصلين يدوران بقيمة G.open */
export function gate3D(THREE, G, { Parts, box, material, signMesh }) {
  const g = new THREE.Group(), { x, y } = G, half = GATE_W / 2, P = new Parts(), stone = material('stone', '#C9B48E'), trim = material('plaster', '#E9DCC2');
  [x - half - POST / 2, x + half + POST / 2].forEach(cx => { P.add(stone, box(POST + 4, LINTEL * 1.25, POST + 4, cx, LINTEL * .625, y)); for (let k = 0; k < 3; k++) P.add(trim, box(8, 12, POST + 6, cx - 11 + k * 11, LINTEL * 1.25 + 6, y)); });
  P.add(stone, box(GATE_W + POST * 2 + 8, 22, POST, x, LINTEL * 1.25 - 11, y)); P.add(trim, box(GATE_W + POST * 2 + 10, 5, POST + 2, x, LINTEL * 1.25 - 1, y));
  g.add(P.build());
  const sign = signMesh(G.label, 18); sign.position.set(x, LINTEL * 1.25 - 11, y + POST / 2 + 2); g.add(sign);
  const wood = material('wood', '#7A4A22'), gold = material('metal', '#D4A017', { metal: .7, rough: .3 });
  const leaves = [-1, 1].map(s => { const hinge = new THREE.Group(); hinge.position.set(x + s * half, 0, y); const L = new Parts();
    L.add(wood, box(half, 140, 7, -s * half / 2, 70, 0)); for (let k = 1; k < 4; k++) L.add(material('wood', '#5C3A1A'), box(half, 4, 8, -s * half / 2, k * 35, 0)); L.add(gold, box(6, 6, 9, -s * (half - 8), 72, 0));
    hinge.add(L.build()); g.add(hinge); return { hinge, s }; });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(GATE_W, LINTEL), new THREE.MeshBasicMaterial({ color: '#FFECAA', transparent: true, opacity: 0, depthWrite: false })); glow.position.set(x, LINTEL / 2, y - 4); g.add(glow);
  return { group: g, update() { leaves.forEach(({ hinge, s }) => { hinge.rotation.y = s * G.open * 1.75; }); glow.material.opacity = .45 * G.open; } };
}

/* هل البطل في الممر بعد البوابة (يعبرها جنوباً)؟ */
export const throughGate = (G, h) => G.open > .9 && Math.abs(h.x - G.x) < GATE_W / 2 - 10 && h.y > G.y - 8;
