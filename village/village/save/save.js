// الحفظ: عالم الطالب يبقى كما تركه
import { VERSION } from '../core/state.js';
/* وضع المعاينة (?preview): حفظ منفصل تماماً، فلا يمس تقدّم الطالب الحقيقي على الجهاز */
export const PREVIEW = (() => { try { return new URLSearchParams(location.search).has('preview'); } catch (e) { return false; } })();
const KEY = PREVIEW ? 'ramimath_village_preview' : 'ramimath_village_v1';
let timer = 0;
export function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.v === VERSION ? s : null; } catch (e) { return null; }
}
export function saveNow(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
export function saveSoon(state) { clearTimeout(timer); timer = setTimeout(() => saveNow(state), 300); }
export function wipeSave() { try { localStorage.removeItem(KEY); } catch (e) {} }

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
    return s && s.v === VERSION && s.hero && s.hero.name && s.missions && s.world ? s : null;
  } catch (e) { return null; }
}
