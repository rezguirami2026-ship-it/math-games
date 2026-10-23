// نقطة البدء: الصف المختار يحدد التطبيق. الصفوف ٥ و٦ و٧ في العالم المفتوح (main.js كما هو)،
// والثامن والتاسع في القرى المستقلة (villages/app.js). لا يُحمَّل أحدهما مع الآخر.
import { GRADE, VILLAGES } from './content/grade.js';
(VILLAGES(GRADE) ? import('./villages/app.js') : import('./main.js'))
  .catch(e => { console.error('[قرية الخير] تعذّر بدء اللعبة', e); document.body.insertAdjacentHTML('beforeend', '<p style="position:fixed;inset:auto 0 40% 0;text-align:center;font:18px sans-serif">تعذّر تحميل اللعبة. أعد فتح الصفحة.</p>'); });
