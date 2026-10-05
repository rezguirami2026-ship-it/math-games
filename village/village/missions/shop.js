// مهمة «دكان العم ناصر»: الأعداد العشرية هنا نقود حقيقية تُدفع على الطاولة
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { ar, wait, rr } from '../core/util.js';
import { earn } from '../rewards/goodDeeds.js';
import { unlock } from '../achievements/achievements.js';
import { sfx } from '../core/sound.js';
import { complete, data } from './quests.js';

export const SHOP = { x: 210, y: 1032 };
export const GARDEN = { x: 380, y: 1040, w: 220, h: 80 };
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
          await W.talk('yousef', [{ who: 'yousef', text: 'وصلت الأدوات! انظر، زرعنا حديقة المدرسة قرب الطريق.' }]);
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

/* الدكان في العالم، وحديقة المدرسة التي تظهر بعد إتمام المشتريات */
export function drawShop(ctx) {
  const x = SHOP.x, y = SHOP.y;
  ctx.fillStyle = 'rgba(60,35,10,.2)'; ctx.fillRect(x - 70, y - 2, 140, 10);
  ctx.fillStyle = '#9B6B3D'; ctx.fillRect(x - 64, y - 64, 6, 64); ctx.fillRect(x + 58, y - 64, 6, 64);
  for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#F4E3B8' : '#2E8B57'; ctx.fillRect(x - 70 + k * 17.5, y - 82, 17.5, 22); }
  ctx.fillStyle = '#B07A3B'; rr(ctx, x - 62, y - 30, 124, 30, 4); ctx.fill();
  ['🌱', '🪣', '⛏️', '🧴', '🪴'].forEach((e, k) => { ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(e, x - 48 + k * 24, y - 34); });
  ctx.fillStyle = '#FFFDF6'; rr(ctx, x - 40, y - 108, 80, 22, 6); ctx.fill();
  ctx.fillStyle = '#5B4636'; ctx.font = '900 13px Cairo, sans-serif'; ctx.fillText('دكان ناصر', x, y - 92);
}
export function drawGarden(ctx, done) {
  const g = GARDEN;
  ctx.fillStyle = done ? '#8FCB6A' : '#C9A46B'; rr(ctx, g.x, g.y, g.w, g.h, 12); ctx.fill();
  ctx.strokeStyle = '#8B6A43'; ctx.lineWidth = 2; ctx.strokeRect(g.x + 3, g.y + 3, g.w - 6, g.h - 6);
  if (done) {
    const cols = ['#E85D75', '#FFC23D', '#9C6BFF', '#FF8A3D', '#4DABF7'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
      const px = g.x + 18 + c * 23, py = g.y + 18 + r * 22;
      ctx.fillStyle = '#2E7D32'; ctx.fillRect(px - 1, py, 2, 8); ctx.fillStyle = cols[(r + c) % 5]; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 7); ctx.fill();
    }
  }
  ctx.fillStyle = '#5B4636'; ctx.font = '900 13px Cairo, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(done ? 'حديقة المدرسة 🌼' : 'حديقة المدرسة — تنتظر الأدوات', g.x + g.w / 2, g.y + g.h + 18);
}
