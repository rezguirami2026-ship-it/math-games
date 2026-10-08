-- قاعدة بيانات صغيرة جداً (Cloudflare D1): صف واحد لكل جهاز نشط في اليوم يحمل عدادات أحداثه — لا تسجيل لكل حدث.
-- كل دفعة تكتب صفاً واحداً تقريباً (التحديث نفسه يمنع عدّ الدفعة المكررة عبر lb = رقم آخر دفعة).
CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, first TEXT, v TEXT, os TEXT, dev TEXT, app TEXT);
CREATE TABLE IF NOT EXISTS daily_active (day TEXT, uid TEXT, v TEXT, os TEXT, dev TEXT, n INTEGER DEFAULT 1, lb TEXT,
  first_launch INTEGER DEFAULT 0, app_open INTEGER DEFAULT 0, session_start INTEGER DEFAULT 0, level_completed INTEGER DEFAULT 0,
  adventure_started INTEGER DEFAULT 0, adventure_completed INTEGER DEFAULT 0, error_occurred INTEGER DEFAULT 0, support_ticket INTEGER DEFAULT 0,
  PRIMARY KEY (day, uid));
CREATE TABLE IF NOT EXISTS errors (id TEXT PRIMARY KEY, day TEXT, v TEXT, os TEXT, dev TEXT, type TEXT, msg TEXT, c INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, created TEXT, type TEXT, descr TEXT, v TEXT, os TEXT, dev TEXT, status TEXT DEFAULT 'new', note TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, val TEXT);
