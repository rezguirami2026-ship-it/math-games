// أيقونات شريط اللعب العلوي (SVG بتدرجات ولمعة بدل الرموز التعبيرية): كأس، خريطة، حقيبة، قلب، نجمة المستوى.
// تُحقن داخل إطارات مثمنة ذهبية (ui/modern.css: .oct). المعرّفات (ids) تبقى كما هي في index.html.
const G = (id, a, b, c) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/>${c ? `<stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>` : `<stop offset="1" stop-color="${b}"/>`}</linearGradient>`;
const shine = '<ellipse cx="18" cy="13" rx="9" ry="4" fill="#fff" opacity=".45" transform="rotate(-20 18 13)"/>';
export const HUD_ICONS = {
  trophy: `<svg viewBox="0 0 48 48"><defs>${G('htG1', '#FFF2B0', '#F5B82E', '#B97A10')}${G('htG2', '#8A5A24', '#5A3612')}</defs>
    <path d="M14 9h20v9c0 7-4.5 12-10 12S14 25 14 18z" fill="url(#htG1)" stroke="#7A4E0E" stroke-width="1.4"/>
    <path d="M14 12H8c0 7 3 10 7 10M34 12h6c0 7-3 10-7 10" fill="none" stroke="#E0A21E" stroke-width="3" stroke-linecap="round"/>
    <rect x="21" y="29" width="6" height="6" fill="#D9961C" stroke="#7A4E0E" stroke-width="1"/><rect x="15" y="35" width="18" height="6" rx="2" fill="url(#htG2)" stroke="#3E220A" stroke-width="1"/>
    <path d="M20 13l1.6 3.4 3.7.4-2.8 2.5.8 3.7L20 21.1 16.7 23l.8-3.7-2.8-2.5 3.7-.4z" fill="#FFF7D6" opacity=".9" transform="translate(4 0)"/>
    <path d="M17 11h4v11c-2-1-4-4-4-8z" fill="#fff" opacity=".35"/></svg>`,
  map: `<svg viewBox="0 0 48 48"><defs>${G('hmG1', '#FFF3D4', '#F1D69A', '#D9B26A')}</defs>
    <path d="M7 12l11-4 12 4 11-4v28l-11 4-12-4-11 4z" fill="url(#hmG1)" stroke="#8A5A24" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M18 8v28M30 12v28" stroke="#C49A55" stroke-width="1.2"/>
    <path d="M11 30c4-2 6-8 11-7s6 6 11 2 4-9 4-9" fill="none" stroke="#D63B3B" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/>
    <path d="M34 13l4 4M38 13l-4 4" stroke="#D63B3B" stroke-width="2.4" stroke-linecap="round"/><circle cx="11" cy="30" r="2.4" fill="#2E8B57" stroke="#fff" stroke-width="1"/>
    <path d="M9 14l8-3v6l-8 3z" fill="#9BD3F0" opacity=".7"/></svg>`,
  bag: `<svg viewBox="0 0 48 48"><defs>${G('hbG1', '#7EC4FF', '#2F7DE0', '#1A4FA3')}${G('hbG2', '#5FB0FF', '#1F5FBF')}</defs>
    <path d="M17 13c0-5 3-8 7-8s7 3 7 8" fill="none" stroke="#173F86" stroke-width="3"/>
    <rect x="10" y="12" width="28" height="30" rx="9" fill="url(#hbG1)" stroke="#123676" stroke-width="1.6"/>
    <path d="M10 22h28" stroke="#123676" stroke-width="1.4" opacity=".6"/><rect x="15" y="27" width="18" height="12" rx="4" fill="url(#hbG2)" stroke="#123676" stroke-width="1.4"/>
    <rect x="21.5" y="20" width="5" height="6" rx="1.5" fill="#FFC23D" stroke="#9C6B16" stroke-width="1"/><path d="M18 31h12" stroke="#BFE0FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M13 15c3-2 8-2 10-1" stroke="#fff" stroke-width="2.4" opacity=".5" stroke-linecap="round"/></svg>`,
  heart: `<svg viewBox="0 0 48 48"><defs>${G('hhG1', '#B8F28A', '#4CC23A', '#1F8A2A')}</defs>
    <path d="M24 41S7 30 7 18.5C7 12 11.5 8 16.5 8c3.6 0 6 2 7.5 4.5C25.5 10 27.9 8 31.5 8 36.5 8 41 12 41 18.5 41 30 24 41 24 41z" fill="url(#hhG1)" stroke="#145E1C" stroke-width="1.8"/>
    <path d="M14 13c-3 1-4.5 4-4 7" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round" fill="none"/>${shine}</svg>`,
  gem: `<svg viewBox="0 0 48 48"><defs>${G('hgG1', '#C8F7FF', '#4CC9F0', '#3A57D0')}</defs><path d="M14 8h20l9 11-19 23L5 19z" fill="url(#hgG1)" stroke="#1D3A8A" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 19h38M14 8l5 11 5 23 5-23 5-11" fill="none" stroke="#1D3A8A" stroke-width="1.2" opacity=".7"/><path d="M15 11l3 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></svg>`,
  star: `<svg viewBox="0 0 48 48"><defs>${G('hsG1', '#FFF4B8', '#FFC23D', '#D98A10')}</defs>
    <path d="M14 30l-4 12 6-3 3 5 3-11M34 30l4 12-6-3-3 5-3-11" fill="#D63B3B" stroke="#7A1F1F" stroke-width="1"/>
    <path d="M24 4l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L24 32.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8z" fill="url(#hsG1)" stroke="#8A5A10" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M24 9l3.5 7.2" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/></svg>`
};
/* يملأ أزرار الشريط العلوي بالأيقونات داخل الإطارات */
export function mountHudIcons() {
  const put = (id, k) => { const el = document.getElementById(id); if (el) el.innerHTML = `<i class="oct"><b>${HUD_ICONS[k]}</b></i>`; };
  put('bAch', 'trophy'); put('bMap', 'map'); put('bBag', 'bag');
  const lv = document.getElementById('lvlI'); if (lv) lv.outerHTML = `<i class="oct sm" id="lvlI"><b>${HUD_ICONS.star}</b></i>`;
  const mp = document.getElementById('gemPill'); if (mp && !mp.querySelector('.oct')) mp.innerHTML = `<i class="oct sm"><b>${HUD_ICONS.gem}</b></i> <b id="gemN">${(document.getElementById('gemN') || {}).textContent || '٠'}</b>`;
  const gp = document.getElementById('goodPill'); if (gp && !gp.querySelector('.oct')) gp.innerHTML = `<i class="oct sm"><b>${HUD_ICONS.heart}</b></i> <b id="goodN">${(document.getElementById('goodN') || {}).textContent || '٠'}</b>`;
}
