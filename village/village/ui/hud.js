// واجهة اللعب: العالم يأخذ الشاشة، والأدوات صغيرة. حوار وأزرار سياقية ولوحات بسيطة.
import { game } from '../core/state.js';
import { ar } from '../core/util.js';
import { drawHuman } from '../character/human.js';
import { ACH } from '../achievements/achievements.js';
import { sound, sfx } from '../core/sound.js';
const $ = id => document.getElementById(id);
export const hud = {
  init(api) {
    this.api = api;
    $('bBag').onclick = () => this.panel('bag'); $('bMap').onclick = () => this.panel('map'); $('bAch').onclick = () => this.panel('ach');
    $('panel').onclick = e => { if (e.target.id === 'panel' || e.target.closest('[data-close]')) this.closePanel(); };
  },
  show(on) { $('hud').classList.toggle('on', on); },
  good() { $('goodN').textContent = ar(game.state.good); const p = $('goodPill'); p.classList.remove('pulse'); void p.offsetWidth; p.classList.add('pulse'); },
  objective(t) { if (this._o !== t) { this._o = t; $('objective').textContent = t; } },
  actions(list) {
    const key = list.map(a => (a.key || '') + ':' + a.label + (a.disabled ? '0' : '1')).join('|');   // الهدف جزء من المفتاح
    if (key === this._ak) return; this._ak = key;
    const box = $('actions'); box.innerHTML = '';
    list.forEach(a => {
      const b = document.createElement('button'); b.className = 'act ' + (a.kind || ''); b.innerHTML = a.label; b.disabled = !!a.disabled;
      b.onclick = e => { e.stopPropagation(); if (!game.busy) { a.run(); this._ak = null; } };
      box.append(b);
    });
  },
  /* حوار: يعيد وعداً يُحلّ عند آخر سطر */
  dialog(lines, people) {
    return new Promise(res => {
      const box = $('dialog'); let i = 0; game.busy = true; box.classList.add('on');
      const showLine = () => {
        const L = lines[i], who = people[L.who] || { name: 'الراوي' };
        $('dName').textContent = who.name; $('dText').textContent = L.text; sfx('talk');
        const c = $('portrait'), x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
        if (L.who === 'narrator') { x.font = '56px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🌴', 48, 52); }
        else drawHuman(x, Object.assign({}, who, { x: 48, y: 150, s: 1.75, dir: 'down', moving: false, carry: 0, mark: null }));
      };
      const next = e => { if (e) e.stopPropagation(); i++; if (i >= lines.length) { box.classList.remove('on'); box.onclick = null; game.busy = false; res(); } else showLine(); };
      box.onclick = next; showLine();
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
        <div class="bagrow muted"><span>🧰 أدوات المغامرة</span><b>تُفتح في الفصل الثاني</b></div>
        <button class="act ghost" id="sndBtn">${sound.on ? '🔊 الصوت يعمل' : '🔇 الصوت متوقف'}</button>`;
    }
    if (kind === 'map') body = `<h3>🗺️ قرية الخير</h3><canvas id="mini" width="320" height="246"></canvas><p class="muted">أنت ●  الأصفر: أهل القرية</p>`;
    el.innerHTML = `<div class="sheet">${body}<button class="act" data-close>رجوع إلى العالم</button></div>`;
    el.classList.add('on');
    if (kind === 'bag') $('sndBtn').onclick = e => { e.stopPropagation(); sound.on = !sound.on; this.panel('bag'); };
    if (kind === 'map') this.api.drawMini($('mini'));
  }
};
