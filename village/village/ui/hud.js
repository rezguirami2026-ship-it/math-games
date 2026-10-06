// واجهة اللعب: العالم يأخذ الشاشة، والأدوات صغيرة. حوار وأزرار سياقية ولوحات بسيطة.
import { game } from '../core/state.js';
import { ar } from '../core/util.js';
import { drawHuman } from '../character/human.js';
import { ACH } from '../achievements/achievements.js';
import { sound, sfx } from '../core/sound.js';
import { exportCode } from '../save/save.js';
import { progress } from '../missions/quests.js';
import { ramadanPref, setRamadanPref, PREF_LABEL } from '../core/season.js';
const $ = id => document.getElementById(id);
window.addEventListener('pointerup', () => clearInterval(hud._hold));
export const hud = {
  init(api) {
    this.api = api;
    $('bBag').onclick = () => this.panel('bag'); $('bMap').onclick = () => this.panel('map'); $('bAch').onclick = () => this.panel('ach');
    // الضغط خارج اللوحة يغلق نوافذ المعلومات فقط؛ لوحات الدروس والدكان والخزانة تُغلق بزر «رجوع» الذي يحرّر اللعب
    $('panel').onclick = e => { const lesson = $('panel').querySelector('.bench, .shop, .wardrobe'); if ((e.target.id === 'panel' && !lesson) || e.target.closest('[data-close]')) this.closePanel(); };
  },
  show(on) { $('hud').classList.toggle('on', on); },
  good() { $('goodN').textContent = ar(game.state.good); const p = $('goodPill'); p.classList.remove('pulse'); void p.offsetWidth; p.classList.add('pulse'); },
  objective(t) {   // مؤشر المهمة: يظهر واضحاً حين يتغير ثم يخفت بعد خمس ثوانٍ
    if (this._o === t) return;
    this._o = t; const el = $('objective'); el.textContent = t;
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
    clearTimeout(this._of); this._of = setTimeout(() => el.classList.remove('fresh'), 5000);
  },
  actions(list) {
    const key = list.map(a => (a.key || '') + ':' + a.label + (a.disabled ? '0' : '1')).join('|');   // الهدف جزء من المفتاح
    if (key === this._ak) return; this._ak = key;
    const box = $('actions'); box.innerHTML = '';
    list.forEach(a => {
      const b = document.createElement('button'); b.className = 'act ' + (a.kind || ''); b.innerHTML = a.label; b.disabled = !!a.disabled;
      if (a.hold) {   // ضغط مطوّل: يتكرر الفعل ما دام الإصبع على الزر
        const start = e => { e.preventDefault(); e.stopPropagation(); if (game.busy) return; a.run(); clearInterval(hud._hold); hud._hold = setInterval(() => { if (!game.busy) a.run(); }, 260); };
        b.addEventListener('pointerdown', start);
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => clearInterval(hud._hold)));
      } else b.onclick = e => { e.stopPropagation(); if (!game.busy) { a.run(); this._ak = null; } };
      box.append(b);
    });
  },
  /* حوار داخل العالم: فقاعة كلام صغيرة فوق رأس المتكلم تتبعه، أو سطر صغير أسفل الشاشة للراوي.
     الضغط في أي مكان ينتقل للسطر التالي. يعيد وعداً يُحلّ عند آخر سطر */
  dialog(lines, people) {
    return new Promise(res => {
      const box = $('dialog'); let i = 0, opened = performance.now(), raf = 0; game.busy = true; box.classList.add('on');
      const place = () => {   // تتبّع المتكلم: الفقاعة فوق رأسه، ولا تخرج عن الشاشة
        const L = lines[i], a = this.api.anchor && this.api.anchor(L.who, people[L.who]);
        box.classList.toggle('caption', !a);
        if (a) {
          const w = box.offsetWidth, h = box.offsetHeight, x = Math.max(8, Math.min(innerWidth - w - 8, a.x - w / 2)), y = Math.max(70, a.y - h - 16);
          box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.setProperty('--tail', Math.max(16, Math.min(w - 16, a.x - x)) + 'px');
        } else { box.style.left = ''; box.style.top = ''; }
        raf = requestAnimationFrame(place);
      };
      const showLine = () => {
        const L = lines[i], who = people[L.who] || { name: 'الراوي' };
        $('dName').textContent = L.who === 'narrator' ? '' : who.name; $('dText').textContent = L.text; sfx('talk');
        box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
      };
      const close = () => { cancelAnimationFrame(raf); box.classList.remove('on', 'caption'); box.onclick = null; removeEventListener('pointerdown', anywhere, true); game.busy = false; res(); };
      const next = e => { if (e) e.stopPropagation(); i++; if (i >= lines.length) close(); else showLine(); };
      const anywhere = e => { if (box.contains(e.target) || performance.now() - opened < 250 || $('panel').classList.contains('on')) return; e.stopPropagation(); e.preventDefault(); next(); };
      box.onclick = next; addEventListener('pointerdown', anywhere, true);
      showLine(); place();
    });
  },
  toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(this._t); this._t = setTimeout(() => t.classList.remove('on'), 3000); },
  closePanel() { $('panel').classList.remove('on'); },
  panel(kind) {
    sfx('talk');
    const s = game.state, el = $('panel'); let body = '';
    if (kind === 'ach') {
      const got = ACH.filter(a => s.achievements[a.id]).length;
      body = `<h3>🏆 الإنجازات <small>${ar(got)} / ${ar(ACH.length)}</small></h3>` + ACH.map(a => `<div class="ach ${s.achievements[a.id] ? 'on' : ''}"><span>${a.icon}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`).join('');
    }
    if (kind === 'bag') {
      body = `<h3>🎒 حقيبة ${s.hero.name}</h3>
        <div class="bagrow"><span>📦 صناديق بين يديك</span><b>${ar(s.carry)}</b></div>
        <div class="bagrow"><span>💚 نقاط الخير</span><b>${ar(s.good)}</b></div>
        ${(() => { const c = {}; (s.inventory || []).forEach(k => c[k] = (c[k] || 0) + 1); const I = { seeds: '🌱 بذور', bucket: '🪣 دلو', shovel: '⛏️ مجرفة', fert: '🧴 سماد', pot: '🪴 أصيص' };
          return Object.keys(c).length ? Object.keys(c).map(k => `<div class="bagrow"><span>${I[k] || k}</span><b>${ar(c[k])}</b></div>`).join('') : '<div class="bagrow muted"><span>🧰 الأدوات</span><b>تشتريها من دكان العم ناصر</b></div>'; })()}
        <button class="act ghost" id="sndBtn">${sound.on ? '🔊 الصوت يعمل' : '🔇 الصوت متوقف'}</button>
        <button class="act ghost" id="codeBtn">🔑 رمز حفظ التقدّم</button>
        <button class="act ghost" id="ramBtn">🌙 أجواء رمضان: ${PREF_LABEL[ramadanPref()]}</button>`;
    }
    if (kind === 'code') {
      const p = progress();
      body = `<h3>🔑 رمز تقدّمك</h3>
        <p class="muted">أنجزتَ ${ar(p.done)} من ${ar(p.total)} درساً. انسخ هذا الرمز واحتفظ به أو أرسله لمعلمك، وتستطيع استعادة مغامرتك به على أي جهاز من شاشة البداية.</p>
        <textarea id="codeBox" class="codebox" readonly dir="ltr">…</textarea>
        <button class="act go" id="copyBtn">📋 انسخ الرمز</button>`;
    }
    if (kind === 'map') body = `<h3>🗺️ قرية الخير</h3><canvas id="mini" width="320" height="363"></canvas><p class="muted">الأحمر: أنت — الأخضر: مهمتك — الأصفر: أهل القرية</p><h3>📜 رحلة الدروس</h3><div id="qlog"></div>`;
    el.innerHTML = `<div class="sheet">${body}<button class="act" data-close>رجوع إلى العالم</button></div>`;
    el.classList.add('on');
    if (kind === 'bag') {
      $('sndBtn').onclick = e => { e.stopPropagation(); sound.on = !sound.on; this.panel('bag'); };
      $('codeBtn').onclick = e => { e.stopPropagation(); this.panel('code'); };
      $('ramBtn').onclick = e => { e.stopPropagation(); const nx = { auto: 'on', on: 'off', off: 'auto' }[ramadanPref()]; setRamadanPref(nx); sfx('click'); this.panel('bag'); };
    }
    if (kind === 'code') {
      const box = $('codeBox');
      exportCode(s).then(code => { box.value = code; });
      $('copyBtn').onclick = async e => {
        e.stopPropagation(); box.focus(); box.select();
        let ok = false; try { await navigator.clipboard.writeText(box.value); ok = true; } catch (err) { try { ok = document.execCommand('copy'); } catch (err2) {} }
        $('copyBtn').textContent = ok ? '✓ نُسخ الرمز' : 'حدّد الرمز وانسخه يدوياً';
      };
    }
    if (kind === 'map') { this.api.drawMini($('mini')); $('qlog').innerHTML = this.api.questLog(); const now = $('qlog').querySelector('.now'); if (now) setTimeout(() => now.scrollIntoView({ block: 'center' }), 50); }
  }
};
