// مهمة «دكان العم ناصر»: الأعداد العشرية هنا نقود حقيقية تُدفع على الطاولة
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait, rr } from '../core/util.js';
import { earn } from '../rewards/goodDeeds.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';
import { complete, data } from './quests.js';
import { PAL, INK, pattern, signboard, FLAGS } from '../world/art.js';
import { shade } from '../core/util.js';

export const SHOP = { x: 210, y: 1032 };
export const GARDEN = { x: 305, y: 1604, w: 220, h: 80 };   // حديقة المدرسة: في ساحة المدرسة (world/village.js: SCHOOL)
const ITEMS = {
  seeds: { icon: '🌱', name: 'كيس بذور', price: 1250 },
  bucket: { icon: '🪣', name: 'دلو', price: 2500 },
  shovel: { icon: '⛏️', name: 'مجرفة', price: 3750 },
  fert: { icon: '🧴', name: 'كيس سماد', price: 1250 },
  pot: { icon: '🪴', name: 'أصيص', price: 750 },
  note: { icon: '📒', name: 'دفتر', price: 400 },
  water: { icon: '💧', name: 'قارورة ماء', price: 200 }
};
const SETS = {
  // استراتيجيات ذهنية للضرب: كميات كبيرة بأسعار تسهّل المضاعفة والتنصيف
  multiplyStrategies: [
    { who: 'المدرسة تحتاج', list: [['note', 25]] },
    { who: 'والمزرعة تحتاج', list: [['pot', 16]] },
    { who: 'والمسجد يحتاج', list: [['water', 50]] }
  ],
  // جمع الأعداد العشرية: أصناف مختلفة تُجمع أسعارها
  decimalAdd: [
    { who: 'يوسف يحتاج لحديقة المدرسة', list: [['seeds', 1], ['bucket', 1], ['shovel', 1]] },
    { who: 'والعم حمد يطلب للمزرعة', list: [['fert', 1], ['seeds', 1], ['pot', 1]] },
    { who: 'وأم خالد تريد لبيتها', list: [['pot', 1], ['bucket', 1], ['seeds', 1]] }
  ]
};
const MONEY = [
  { v: 5000, label: '٥ ريال', note: '#8E6CC9' }, { v: 1000, label: '١ ريال', note: '#3E9B6E' }, { v: 500, label: 'نصف ريال', note: '#C98A3A' },
  { v: 100, label: '١٠٠ بيسة' }, { v: 50, label: '٥٠ بيسة' }
];
export const rial = b => `${ar(Math.floor(b / 1000))}٫${ar(String(b % 1000).padStart(3, '0'))} ريال`;

const $ = id => document.getElementById(id);

/* واجهة الطاولة: لوحة الأسعار، طلب الزبون، النقود، والصينية */
export function openCounter(W, lesson) {
  const m = data(lesson), ROUNDS = SETS[lesson]; m.round = m.round || 0; m.tries = m.tries || 0;
  game.busy = true;
  const tray = [];
  const el = $('panel');
  const render = (say, mood) => {
    const fin = m.round >= ROUNDS.length, r = ROUNDS[Math.min(m.round, ROUNDS.length - 1)];   // بعد آخر طلب لا يوجد طلب جديد
    el.innerHTML = `<div class="sheet shop">
      <div class="shop-head"><span class="keeper">🧔🏽</span><div class="speech ${mood || ''}">${say || 'أهلاً! الأسعار على اللوحة، وادفع المبلغ بالضبط.'}</div></div>
      <div class="board">${Object.values(ITEMS).filter(it => ROUNDS.some(r => r.list.some(([k]) => ITEMS[k] === it))).map(it => `<div class="tag"><span>${it.icon}</span><b>${it.name}</b><small>${rial(it.price)}</small></div>`).join('')}</div>
      ${fin ? '' : `<div class="order"><small>${r.who}:</small> ${r.list.map(([k, n]) => `<b>${n > 1 ? ar(n) + ' × ' : ''}${ITEMS[k].icon} ${ITEMS[k].name}</b>`).join(' ، ')}</div>`}
      <div class="tray" id="tray">${tray.length ? tray.map((v, i) => chip(v, i)).join('') : '<span class="empty">ضع النقود هنا</span>'}</div>
      <div class="wallet">${MONEY.map(c => `<button class="money ${c.note ? 'note' : 'coin'}" style="${c.note ? 'background:' + c.note : ''}" data-v="${c.v}">${c.label}</button>`).join('')}</div>
      <div class="shop-acts"><button class="act ghost" id="shopBack">رجوع إلى القرية</button><button class="act go" id="shopPay" ${tray.length ? '' : 'disabled'}>ادفع للعم ناصر</button></div>
    </div>`;
    el.classList.add('on');
    el.querySelectorAll('.money').forEach(b => b.onclick = e => { e.stopPropagation(); if (tray.length < 20) { tray.push(+b.dataset.v); sfx('pick'); render(say, mood); } });
    el.querySelectorAll('.chip').forEach(b => b.onclick = e => { e.stopPropagation(); tray.splice(+b.dataset.i, 1); sfx('drop'); render(say, mood); });
    $('shopBack').onclick = e => { e.stopPropagation(); close(); };
    $('shopPay').onclick = e => { e.stopPropagation(); pay(); };
  };
  const chip = (v, i) => { const c = MONEY.find(x => x.v === v); return `<button class="chip ${c.note ? 'note' : 'coin'}" style="${c.note ? 'background:' + c.note : ''}" data-i="${i}">${c.label}</button>`; };
  const close = () => { el.classList.remove('on'); el.innerHTML = ''; game.busy = false; };
  async function pay() {
    const r = ROUNDS[m.round], total = r.list.reduce((a, [k, n]) => a + ITEMS[k].price * n, 0), paid = tray.reduce((a, b) => a + b, 0);
    m.tries++;
    if (paid === total) {
      sfx('win');
      r.list.forEach(([k, n]) => { for (let q = 0; q < n; q++) game.state.inventory.push(k); });
      tray.length = 0; m.round++; bus.emit('save');
      if (m.round >= ROUNDS.length) {
        render('بارك الله فيك! حسابك دقيق مثل التاجر الأمين. الحاجات كلها وصلت لأصحابها.', 'ok');
        await wait(1800); close();
        earn(40, W.player.x, W.player.y - 80);
        if (lesson === 'decimalAdd') {
          game.state.missions.shop.status = 'done'; game.state.gear.owned.shovel = Date.now(); unlock('trader'); complete(lesson);
          await W.talk('yousef', [{ who: 'yousef', text: 'وصلت الأدوات! انظر، زرعنا حديقة المدرسة في ساحة المدرسة جنوب القرية.' }]);
          W.toast('⛏️ حصلت على مجرفة المزارع، جرّبها في خزانة البطل');
        } else { complete(lesson); await W.talk('naser', [{ who: 'naser', text: 'حساب سريع وذكي! مضاعفة هنا وتنصيف هناك، والمبلغ صحيح.' }]); }
        return;
      }
      render('تمام، المبلغ بالضبط! خذ حاجاتك. عندي طلب آخر…', 'ok');
    } else if (paid < total) { sfx('cough'); render('المبلغ ناقص يا صديقي، عُدّ النقود مرة أخرى.', 'bad'); }
    else { sfx('drop'); tray.length = 0; render('هذا أكثر من الثمن! أعدت لك النقود، ادفع المبلغ بالضبط.', 'bad'); }
  }
  render();
}

/* الدكان في العالم: كشك بجدار خلفي ورفوف (خلف العم ناصر)، ومنضدة ومظلة قماشية (أمامه) */
export function drawShopBack(ctx) {   // يُرسم قبل العم ناصر: الجدار الخلفي والرفوف
  const x = SHOP.x, y = SHOP.y - 42;
  ctx.fillStyle = '#C9A877'; ctx.fillRect(x - 64, y - 60, 128, 62); ctx.fillStyle = pattern(ctx, 'plaster'); ctx.fillRect(x - 64, y - 60, 128, 62);
  ctx.fillStyle = PAL.wood;[y - 44, y - 22].forEach(sy => ctx.fillRect(x - 58, sy, 116, 4));
  const goods = [['#2E6B9E', 1], ['#E6DCC4', 0], ['#7A8792', 1], ['#4E7A34', 0], ['#C46A1E', 1], ['#E6DCC4', 1]];
  goods.forEach(([c, k], i) => { ctx.fillStyle = c; rr(ctx, x - 54 + i * 18, y - 56 + k * 22, 12, 12, 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .6; ctx.stroke(); });
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 64, y - 60, 128, 62);
}
export function drawShop(ctx) {   // يُرسم بعد العم ناصر: المنضدة، والبضاعة عليها، والمظلة، واللافتة
  const x = SHOP.x, y = SHOP.y;
  ctx.fillStyle = 'rgba(70,42,20,.24)'; ctx.beginPath(); ctx.moveTo(x + 64, y - 40); ctx.lineTo(x + 112, y - 12); ctx.lineTo(x + 112, y + 14); ctx.lineTo(x - 40, y + 14); ctx.lineTo(x - 64, y); ctx.closePath(); ctx.fill();
  // الأعمدة
  [x - 62, x + 58].forEach(px => { ctx.fillStyle = PAL.wood; ctx.fillRect(px, y - 104, 5, 104); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(px, y - 104, 1.5, 104); });
  // المنضدة: سطح خشبي ووجه أمامي بألواح
  ctx.fillStyle = PAL.woodLight; ctx.fillRect(x - 64, y - 46, 128, 16);
  const g = ctx.createLinearGradient(x - 64, 0, x + 64, 0); g.addColorStop(0, '#A06A3A'); g.addColorStop(1, '#6E4524');
  ctx.fillStyle = g; ctx.fillRect(x - 64, y - 30, 128, 30);
  ctx.strokeStyle = 'rgba(40,20,10,.3)'; ctx.lineWidth = 1; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 64 + k * 21.3, y - 30); ctx.lineTo(x - 64 + k * 21.3, y); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 64, y - 46, 128, 46);
  // البضاعة على المنضدة: أكياس بذور، دلو، أصيص
  ctx.fillStyle = '#E6DCC4'; rr(ctx, x - 52, y - 58, 16, 16, 3); ctx.fill(); ctx.fillStyle = '#4E7A34'; ctx.fillRect(x - 48, y - 52, 8, 4);
  ctx.fillStyle = '#2E6B9E'; ctx.beginPath(); ctx.moveTo(x - 24, y - 56); ctx.lineTo(x - 8, y - 56); ctx.lineTo(x - 10, y - 42); ctx.lineTo(x - 22, y - 42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B8613E'; ctx.beginPath(); ctx.moveTo(x + 14, y - 52); ctx.lineTo(x + 28, y - 52); ctx.lineTo(x + 25, y - 42); ctx.lineTo(x + 17, y - 42); ctx.closePath(); ctx.fill(); ctx.fillStyle = PAL.leaf; ctx.beginPath(); ctx.arc(x + 21, y - 55, 5, 0, 7); ctx.fill();
  ctx.fillStyle = '#9AA5B1'; ctx.fillRect(x + 40, y - 60, 3, 18); ctx.fillStyle = '#7A8792'; ctx.beginPath(); ctx.moveTo(x + 36, y - 62); ctx.lineTo(x + 47, y - 62); ctx.lineTo(x + 44, y - 70); ctx.lineTo(x + 39, y - 70); ctx.closePath(); ctx.fill();
  // المظلة: قماش مخطط بحافة متموجة، وظل تحتها
  const ay = y - 112;
  for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#F2E6C9' : '#2F6B73'; ctx.beginPath(); ctx.moveTo(x - 70 + k * 17.5, ay - 18); ctx.lineTo(x - 70 + (k + 1) * 17.5, ay - 18); ctx.lineTo(x - 70 + (k + 1) * 17.5, ay + 12); ctx.quadraticCurveTo(x - 70 + (k + .5) * 17.5, ay + 20, x - 70 + k * 17.5, ay + 12); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x - 70, ay - 18, 140, 8);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 70, ay - 18); ctx.lineTo(x + 70, ay - 18); ctx.stroke();
  signboard(ctx, x, ay - 30, 'دكان ناصر');
}
export function drawGarden(ctx, done) {   // حوض مرتفع بإطار خشبي: تربة تنتظر الأدوات، ثم زهور ونباتات
  const g = GARDEN;
  ctx.fillStyle = 'rgba(70,42,20,.2)'; ctx.fillRect(g.x + 6, g.y + g.h, g.w, 6);
  ctx.fillStyle = shade(PAL.wood, 10); rr(ctx, g.x, g.y, g.w, g.h, 6); ctx.fill();
  ctx.fillStyle = PAL.wood; ctx.fillRect(g.x, g.y + g.h - 8, g.w, 8);
  ctx.fillStyle = pattern(ctx, done ? 'soilWet' : 'soil'); rr(ctx, g.x + 6, g.y + 6, g.w - 12, g.h - 18, 4); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; rr(ctx, g.x, g.y, g.w, g.h, 6); ctx.stroke();
  if (done) {
    const cols = ['#E85D75', '#FFC23D', '#9C6BFF', '#FF8A3D', '#F2F2F2'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
      const px = g.x + 20 + c * 22.5, py = g.y + 18 + r * 18;
      ctx.fillStyle = PAL.leafDark; ctx.beginPath(); ctx.ellipse(px, py + 3, 5, 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = PAL.leaf; ctx.beginPath(); ctx.ellipse(px - 1, py + 1.5, 3.4, 2.2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = cols[(r + c) % 5]; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(px + Math.cos(k * 1.26) * 2.2, py - 2 + Math.sin(k * 1.26) * 2.2, 1.7, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#FFE08A'; ctx.beginPath(); ctx.arc(px, py - 2, 1.1, 0, 7); ctx.fill();
    }
  } else { ctx.strokeStyle = 'rgba(60,35,15,.35)'; ctx.lineWidth = 2; for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.moveTo(g.x + 16, g.y + 20 + r * 16); ctx.lineTo(g.x + g.w - 16, g.y + 20 + r * 16); ctx.stroke(); } }
  if (!FLAGS.three) signboard(ctx, g.x + g.w / 2, g.y + g.h + 16, done ? 'حديقة المدرسة 🌼' : 'حديقة المدرسة');   // في 3D لافتة قائمة (main.js)
}
