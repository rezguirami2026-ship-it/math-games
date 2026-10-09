// «بستان البيانات»: منطقة وحدة «معالجة البيانات» (الفصل الثاني، الوحدة ٢) جنوب ساحة المهرجان، تُفتح بإنهاء وحدة «القياس».
// المحطات نفسها (لوح الرحلة، الحقل الدائري، الحصاد، الاستبيان، الدوّار) ثوابتها في festival.js؛ هنا السور والبوابة والأرض والزينة.
import { rr } from '../core/util.js';
import { FLAGS, INK, PAL, pattern, sprite, gateEW, gateEWShadows } from './art.js';
import { FUNPARK } from './festival.js';
export const WALL6_Y = 3040, GATE6 = { x0: 1190, x1: 1290 }, YARD = { x: 0, y: WALL6_Y + 12, w: FUNPARK.x, h: 3500 - WALL6_Y - 12 };
// أحواض زهور على شكل أعمدة بيانية (زينة أرضية بلا تصادم)
const BEDS = [[300, 3100, [3, 5, 2, 4]], [1440, 3460, [2, 4, 5, 3]], [2160, 3110, [4, 2, 5, 3]]];
export function datayardColliders(open) {
  const c = [{ x: 0, y: WALL6_Y, w: GATE6.x0, h: 12 }, { x: GATE6.x1, y: WALL6_Y, w: FUNPARK.x - GATE6.x1, h: 12 }, { x: FUNPARK.x + FUNPARK.w, y: WALL6_Y, w: 2930 - FUNPARK.x - FUNPARK.w, h: 12 }];
  if (!open) c.push({ x: GATE6.x0, y: WALL6_Y - 4, w: GATE6.x1 - GATE6.x0, h: 20 });
  return c;
}
export function drawDatayardGround(ctx) {
  gateEWShadows(ctx, WALL6_Y, GATE6.x0, GATE6.x1);
  // عشب البستان بمربعات خفيفة (شبكة بيانية)، وممشى من البوابة إلى بوابة الجمعية، وممشى عرضي بين المحطات
  sprite(ctx, 'datayard-lawn', YARD.x, YARD.y, YARD.w, YARD.h, c => {
    c.fillStyle = '#B7D08A'; c.fillRect(YARD.x, YARD.y, YARD.w, YARD.h);
    c.fillStyle = 'rgba(255,255,255,.07)'; for (let y = YARD.y; y < YARD.y + YARD.h; y += 40) for (let x = (y / 40) % 2 ? 0 : 40; x < YARD.w; x += 80) c.fillRect(x, y, 40, 40);
    c.strokeStyle = 'rgba(70,110,40,.18)'; c.lineWidth = 1; for (let x = 0; x <= YARD.w; x += 40) { c.beginPath(); c.moveTo(x, YARD.y); c.lineTo(x, YARD.y + YARD.h); c.stroke(); } for (let y = YARD.y; y <= YARD.y + YARD.h; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(YARD.w, y); c.stroke(); }
    c.fillStyle = 'rgba(90,130,50,.35)'; for (let i = 0; i < 260; i++) { const x = (i * 97) % YARD.w, y = YARD.y + (i * 53) % YARD.h; c.fillRect(x, y, 2, 3); }
    c.fillStyle = pattern(c, 'pavers'); rr(c, GATE6.x0 + 8, YARD.y - 2, GATE6.x1 - GATE6.x0 - 16, YARD.h + 4, 8); c.fill();
    rr(c, 300, 3296, 2150, 44, 18); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; rr(c, GATE6.x0 + 8, YARD.y - 2, GATE6.x1 - GATE6.x0 - 16, YARD.h + 4, 8); c.stroke(); rr(c, 300, 3296, 2150, 44, 18); c.stroke();
    BEDS.forEach(([bx, by, hs]) => {
      c.fillStyle = shadeSoil; rr(c, bx - 6, by - 6, hs.length * 22 + 8, 64, 8); c.fill();
      hs.forEach((h, i) => { const col = ['#E85D75', '#FFC23D', '#2F9BD6', '#9C6BFF'][i % 4]; for (let k = 0; k < h; k++) { c.fillStyle = col; c.beginPath(); c.arc(bx + i * 22 + 8, by + 50 - k * 10, 5, 0, 7); c.fill(); } });
      c.strokeStyle = 'rgba(60,40,20,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx - 2, by + 56); c.lineTo(bx + hs.length * 22, by + 56); c.stroke();
    });
  });
}
const shadeSoil = '#8A6A44';
export function datayardDrawables(open) {
  return FLAGS.three ? [] : [{ y: WALL6_Y + 12, draw: c => gateEW(c, 'datagate', WALL6_Y, GATE6.x0, GATE6.x1, open, 'بستان البيانات') }];   // في 3D: البوابة مجسّمة
}
export const R3D = { gateEW: [WALL6_Y, GATE6.x0, GATE6.x1, 'بستان البيانات'], benches: [[700, 3330], [1900, 3290]], shrubs: [[200, 3080, '#7FBF4F', 13], [2400, 3080, '#D9478C', 13], [160, 3470, '#7FBF4F', 13]] };
