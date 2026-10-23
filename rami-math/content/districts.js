// أحياء الصف المختار: السابع (وحداته الـ١٧ أكثر من مناطق العالم) والخامس (وحدتاه الأخيرتان في الورشة)؛ السادس بلا أحياء
import { GRADE } from './grade.js';
import { DISTRICTS as G5 } from './g5/districts.js';
import { DISTRICTS as G7 } from './g7/districts.js';
export const DISTRICTS = GRADE === 7 ? G7 : GRADE === 5 ? G5 : [];
export const districtAt = (x, y) => DISTRICTS.find(d => d.rects.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1)) || null;
