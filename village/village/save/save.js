// الحفظ: عالم الطالب يبقى كما تركه
import { VERSION } from '../core/state.js';
const KEY = 'ramimath_village_v1';
let timer = 0;
export function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.v === VERSION ? s : null; } catch (e) { return null; }
}
export function saveNow(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
export function saveSoon(state) { clearTimeout(timer); timer = setTimeout(() => saveNow(state), 300); }
export function wipeSave() { try { localStorage.removeItem(KEY); } catch (e) {} }
