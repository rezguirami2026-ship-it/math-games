// مغامرات القرى (الصفان ٨ و٩): محرك جديد غير محرك مغامرات الصفوف ٥–٧. المغامرة فصول، لكل فصل نوع لعب مختلف ومشهده الخاص.
// المنظِّم هنا: بطاقة الفصل (اسمه وهدفه بجملة)، قائمة الخطوات تتلوّن بالأخضر، جهاز لاسلكي يرشد منه رفيق القصة، شريط الفصول،
// حفظ الفصل الحالي (state.vil.quest[id]) والاستئناف منه، والاحتفال الختامي بالألعاب النارية والجائزة.
// def = { id, title, icon, radio: { name, face }, chapters: [{ title, icon, goal, steps: [..], load: () => import(...) }], finale: { lines, rewards }, grant(state) }
// الفصل: default async (api) → يحلّ عند انتهائه. api = { stage, W, H, step(i), say(نص), hint(نص), sfx, wait(ms), keys, onKey(fn) }
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
export async function runQuest(def, state, onDone) {
  const rec = ((state.vil.quest = state.vil.quest || {})[def.id] = (state.vil.quest || {})[def.id] || { ch: 0 });
  const root = document.createElement('div'); root.className = 'qz';
  root.innerHTML = `<div class="qz-stage"></div>
    <div class="qz-top"><button class="qz-x" aria-label="خروج">✕</button><div class="qz-title"><b>${def.icon} ${def.title}</b><div class="qz-chs"></div></div></div>
    <div class="qz-steps"></div>
    <div class="qz-radio" hidden><span class="qz-face">${def.radio.face}</span><div><b>📻 ${def.radio.name}</b><p></p></div></div>`;
  document.body.append(root);
  const $ = s => root.querySelector(s), stage = $('.qz-stage');
  $('.qz-steps').onclick = () => { const el = $('.qz-steps'); el.classList.toggle('mini'); };
  let alive = true, keyFns = [];
  const onKey = e => keyFns.forEach(f => f(e)); addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const close = () => { alive = false; removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); root.remove(); };
  let quit = null; const quitP = new Promise(r => { quit = r; });
  $('.qz-x').onclick = () => { close(); onDone(null); quit('quit'); };
  const chips = () => { $('.qz-chs').innerHTML = def.chapters.map((c, i) => `<i class="${i < rec.ch ? 'on' : i === rec.ch ? 'cur' : ''}" title="${c.title}">${i < rec.ch ? '✓' : ar(i + 1)}</i>`).join(''); };
  let radioT = 0;
  const say = (text, ms = 5200) => { const r = $('.qz-radio'); r.hidden = false; r.querySelector('p').innerHTML = text; r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); sfx('pick'); clearTimeout(radioT); radioT = setTimeout(() => { r.hidden = true; }, ms); };
  const card = c => new Promise(res => {   // بطاقة الفصل: رقمه واسمه وهدفه بجملة واحدة وخطواته
    const el = document.createElement('div'); el.className = 'qz-card';
    el.innerHTML = `<div><small>الفصل ${ar(rec.ch + 1)} من ${ar(def.chapters.length)}</small><i>${c.icon}</i><h2>${c.title}</h2><p>${c.goal}</p>
      <ol>${c.steps.map(s => `<li>${s}</li>`).join('')}</ol><button>▶ ابدأ</button></div>`;
    root.append(el); sfx('newRegion'); el.querySelector('button').onclick = () => { el.remove(); res(); };
  });
  while (alive && rec.ch < def.chapters.length) {
    const c = def.chapters[rec.ch]; chips();
    await card(c); if (!alive) return;
    $('.qz-steps').innerHTML = c.steps.map((s, i) => `<div data-i="${i}"><span>${ar(i + 1)}</span>${s}</div>`).join('');
    $('.qz-steps div').classList.add('cur'); $('.qz-steps').classList.remove('mini'); setTimeout(() => $('.qz-steps').classList.add('mini'), 5000);   // بعد قليل تبقى الخطوة الحالية وحدها (النقر يعرضها كلها)
    stage.innerHTML = ''; keyFns = [];
    const api = { stage, get W() { return stage.clientWidth; }, get H() { return stage.clientHeight; }, sfx, wait, say,
      step: i => { const d = $(`.qz-steps [data-i="${i}"]`); if (!d || d.classList.contains('on')) return; d.classList.remove('cur'); d.classList.add('on'); const n = d.nextElementSibling; if (n) n.classList.add('cur'); sfx('win'); },
      hint: t => say('💡 ' + t, 6500), onKey: f => keyFns.push(f), get alive() { return alive; } };
    const mod = (await c.load()).default;
    const r = await Promise.race([mod(api), quitP]); if (r === 'quit' || !alive) return;
    rec.ch++; state._save && state._save();
    stage.innerHTML = '';
  }
  // الختام: ألعاب نارية وحوار وجائزة
  chips(); $('.qz-steps').innerHTML = ''; $('.qz-radio').hidden = true;
  const first = !rec.done; rec.done = true; rec.plays = (rec.plays || 0) + 1; if (first && def.grant) def.grant(state); state._save && state._save();
  const cv = document.createElement('canvas'); cv.className = 'qz-fire'; stage.append(cv); const g = cv.getContext('2d'); const sparks = [];
  const fit = () => { cv.width = stage.clientWidth; cv.height = stage.clientHeight; }; fit();
  let raf = 0; const fw = () => { if (!alive) return; g.fillStyle = 'rgba(10,14,40,.25)'; g.fillRect(0, 0, cv.width, cv.height);
    if (Math.random() < .06) { const x = cv.width * (.15 + Math.random() * .7), y = cv.height * (.15 + Math.random() * .35), col = ['#FFC94A', '#FF6B9A', '#5FD3FF', '#7CF5C8', '#B28CFF'][Math.floor(Math.random() * 5)]; for (let i = 0; i < 60; i++) { const a = Math.random() * 7, v = 1 + Math.random() * 4; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, col }); } sfx('win'); }
    sparks.forEach(s => { s.x += s.vx; s.y += s.vy; s.vy += .04; s.l -= .012; g.fillStyle = s.col; g.globalAlpha = Math.max(0, s.l); g.beginPath(); g.arc(s.x, s.y, 2.4, 0, 7); g.fill(); }); g.globalAlpha = 1;
    for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].l <= 0) sparks.splice(i, 1); raf = requestAnimationFrame(fw); };
  fw();
  for (const l of def.finale.lines) { say(`<b>${l.who}:</b> ${l.t}`, 3800); await wait(3600); if (!alive) return; }
  const end = document.createElement('div'); end.className = 'qz-card qz-end';
  end.innerHTML = `<div><i>${def.icon}</i><h2>أتممتَ المغامرة!</h2><p>${def.title}</p>${first ? `<div class="qz-rw">${def.finale.rewards.map(r => `<span>${r}</span>`).join('')}</div>` : '<p class="qz-mut">العب الفصول من جديد متى شئت.</p>'}<button>🏡 العودة إلى القرية</button></div>`;
  root.append(end);
  await new Promise(r => { end.querySelector('button').onclick = r; });
  if (!rec.replay) rec.ch = 0;   // المرة القادمة تبدأ من الفصل الأول
  cancelAnimationFrame(raf); close(); onDone({ stars: 3, gems: 0 });
}

/* مشهد فصل على قماش: يتكيف مع حجم الشاشة، وحلقة رسم بالزمن الحقيقي. frame(g, w, h, dt, t) تعيد true لإنهاء الحلقة */
export function canvasStage(api) {
  const cv = document.createElement('canvas'); api.stage.append(cv); const g = cv.getContext('2d');
  let dpr = 1, w = 0, h = 0; const fit = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = api.stage.clientWidth; h = api.stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; }; fit(); addEventListener('resize', fit);
  const S = { cv, g, get w() { return w; }, get h() { return h; } };
  S.run = frame => new Promise(res => { let last = performance.now(), t = 0;
    const loop = now => { if (!api.alive) return res(); const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      let end = false; try { end = frame(g, w, h, dt, t); } catch (e) { console.error('[قرية الخير] مشهد الفصل', e); end = true; }
      if (end) { removeEventListener('resize', fit); res(); } else requestAnimationFrame(loop); };
    requestAnimationFrame(loop); });
  /* أزرار التحكم الكبيرة أسفل الشاشة: [{ id, label, big }] → حالة الضغط held[id] ونقرات tap(id) */
  S.controls = (list, onTap) => { const box = document.createElement('div'); box.className = 'qz-ctl'; box.innerHTML = list.map(b => `<button data-id="${b.id}" class="${b.big ? 'big' : ''}">${b.label}</button>`).join(''); api.stage.append(box);
    const held = {}; box.querySelectorAll('button').forEach(b => { const id = b.dataset.id;
      b.onpointerdown = e => { e.preventDefault(); held[id] = true; b.classList.add('on'); onTap && onTap(id); }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => { held[id] = false; b.classList.remove('on'); }; });
    return { held, box }; };
  return S;
}
