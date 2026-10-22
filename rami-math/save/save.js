// الحفظ: عالم الطالب يبقى كما تركه
import { VERSION } from '../core/state.js';
import { GRADE, gradeInfo } from '../content/grade.js';
/* وضع المعاينة (?preview): حفظ منفصل تماماً، فلا يمس تقدّم الطالب الحقيقي على الجهاز */
export const PREVIEW = (() => { try { return new URLSearchParams(location.search).has('preview'); } catch (e) { return false; } })();
/* لكل صف حفظه حتى لا تختلط النجوم: السادس يبقى على مفتاحه القديم (حفظ الطلاب الحاليين)، و_g5 و_g7 للصفين الآخرين */
const keyOf = g => (PREVIEW ? 'ramimath_village_preview' : 'ramimath_village_v1') + (g === 6 ? '' : '_g' + g);
const KEY = keyOf(GRADE);
let timer = 0;
const BAK = KEY + '_bak';
/* تنظيف الحفظ عند دخوله اللعبة (من الجهاز أو من رمز التقدّم): الاسم نص عادي قصير بلا رموز HTML،
   والألوان والنوع من القيم المسموحة، والعدادات أعداد صحيحة غير سالبة، والأقسام الأساسية موجودة.
   لا يغيّر شيئاً في حفظ سليم صنعته اللعبة نفسها */
export const cleanName = n => String(n == null ? '' : n).replace(/[<>&"'`\\\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
const HEX = /^#[0-9a-fA-F]{3,8}$/, obj = o => o && typeof o === 'object' && !Array.isArray(o);
const count = v => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, 1e7) : 0; };
export function sanitizeSave(s) {
  if (!obj(s) || s.v !== VERSION || !obj(s.hero) || !obj(s.missions) || !obj(s.world)) return null;
  const h = s.hero;
  h.name = cleanName(h.name) || 'بطل';
  if (h.kind !== 'boy' && h.kind !== 'girl') h.kind = 'boy';
  if (!gradeInfo(s.grade)) s.grade = 6;   // الحفظ قبل دعم الصفوف كان للسادس
  if (!HEX.test(h.skin || '')) h.skin = '#DDA779';
  if (!HEX.test(h.color || '')) h.color = '#2F6FB2';
  ['good', 'gems', 'carry'].forEach(k => { if (k in s) s[k] = count(s[k]); });
  if (!obj(s.quests)) s.quests = { done: {}, started: {}, data: {} };
  ['done', 'started', 'data'].forEach(k => { if (!obj(s.quests[k])) s.quests[k] = {}; });
  if (!obj(s.story)) s.story = { chapter: 1, introDone: true };
  if (!obj(s.player) || !Number.isFinite(+s.player.x) || !Number.isFinite(+s.player.y)) s.player = { x: 1380, y: 640, dir: 'left' };
  ['achievements', 'talked'].forEach(k => { if (!obj(s[k])) s[k] = {}; });
  return s;
}
/* القراءة: الحفظ الرئيسي، فإن تلف (مثلاً انقطاع أثناء الكتابة) فالنسخة الاحتياطية — فلا يضيع تقدّم الطالب بصمت */
const read = k => { try { return sanitizeSave(JSON.parse(localStorage.getItem(k) || 'null')); } catch (e) { return null; } };
export function loadSave() {
  const s = read(KEY) || read(BAK);
  if (s) try { localStorage.setItem(BAK, JSON.stringify(s)); } catch (e) {}   // آخر حفظ سليم معروف (يُحدَّث عند كل فتح)
  return s;
}
export function saveNow(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
/* حفظ مغامرة صف آخر في مكانها (رمز تقدّم لصف غير المفتوح الآن) */
export function saveFor(grade, state) { try { localStorage.setItem(keyOf(grade), JSON.stringify(state)); } catch (e) {} }
export function saveSoon(state) { clearTimeout(timer); timer = setTimeout(() => saveNow(state), 300); }
export function wipeSave() { try { localStorage.removeItem(KEY); localStorage.removeItem(BAK); } catch (e) {} }

/* رمز التقدّم: نسخة نصية من الحفظ يحتفظ بها الطالب أو يرسلها لمعلمه، وتُستعاد على أي جهاز.
   الصيغة: RM1. ثم الحفظ مضغوطاً (deflate) بترميز base64url؛ وRM0. للحفظ غير المضغوط إن لم يدعم المتصفح الضغط. */
const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
export async function exportCode(state) {
  const raw = new TextEncoder().encode(JSON.stringify(state));
  if (typeof CompressionStream === 'undefined') return 'RM0.' + b64(raw);
  return 'RM1.' + b64(await pipe(raw, new CompressionStream('deflate-raw')));
}
/* يعيد الحفظ من الرمز، أو null إن كان الرمز تالفاً أو ليس من هذه اللعبة */
export async function importCode(code) {
  try {
    const m = /^RM([01])\.([A-Za-z0-9_-]+)$/.exec(String(code).replace(/\s+/g, ''));
    if (!m) return null;
    let bytes = unb64(m[2]);
    if (m[1] === '1') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    const s = JSON.parse(new TextDecoder().decode(bytes));
    return sanitizeSave(s);   // رمز من خارج الجهاز: يُنظَّف قبل أن يُعرض أو يُحفظ
  } catch (e) { return null; }
}
