# يولّد جمل الشخصيات القصيرة بأصوات Microsoft العُمانية (edge-tts) في assets/voice/<النوع>_<الجملة>.mp3
# الأنواع: رجل، امرأة، شيخ، جدّة، ولد — بتعديل طبقة الصوت وسرعته. الاستعمال: python gen.py
import asyncio, os, subprocess
import edge_tts, imageio_ffmpeg
import edge_tts.constants as _C, edge_tts.communicate as _CM, edge_tts.drm as _D
# الخدمة ترفض (403) رقم نسخة المتصفح القديم داخل edge-tts 7.2.8: نرفعه
for _m in (_C, _CM, _D):
    if hasattr(_m, 'CHROMIUM_FULL_VERSION'): _m.CHROMIUM_FULL_VERSION = '147.0.3700.60'
    if hasattr(_m, 'CHROMIUM_MAJOR_VERSION'): _m.CHROMIUM_MAJOR_VERSION = '147'
    if hasattr(_m, 'SEC_MS_GEC_VERSION'): _m.SEC_MS_GEC_VERSION = '1-147.0.3700.60'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'voice')
FF = imageio_ffmpeg.get_ffmpeg_exe()
TYPES = {
  'man': ('ar-OM-AbdullahNeural', '+0%', '+0Hz'),
  'woman': ('ar-OM-AyshaNeural', '+0%', '+0Hz'),
  'old': ('ar-OM-AbdullahNeural', '-10%', '-14Hz'),
  'gran': ('ar-OM-AyshaNeural', '-10%', '-16Hz'),
  'boy': ('ar-OM-AbdullahNeural', '+6%', '+55Hz'),
}
PHRASES = {
  'g1': 'أَهْلاً وَسَهْلاً!', 'g2': 'يا هَلا وَمَرْحَبا!', 'g3': 'السَّلامُ عَلَيْكُم!',
  'p1': 'رائِع!', 'p2': 'مُمْتاز!', 'p3': 'ما شاءَ الله!',
  't1': 'شُكْراً جَزيلاً!', 'am': 'أَحْسَنْتَ يا بَطَل!', 'af': 'أَحْسَنْتِ يا بَطَلَة!',
}
async def main():
    os.makedirs(OUT, exist_ok=True)
    for t, (v, rate, pitch) in TYPES.items():
        for k, text in PHRASES.items():
            f = os.path.join(OUT, f'{t}_{k}.mp3')
            if os.path.exists(f): continue
            tmp = f + '.raw.mp3'
            for attempt in range(8):   # الخدمة ترفض أحياناً (403) ثم تقبل: نعيد المحاولة بهدوء
                try: await edge_tts.Communicate(text, v, rate=rate, pitch=pitch).save(tmp); break
                except Exception as e: print('retry', t, k, str(e)[:30]); await asyncio.sleep(4 + attempt * 3)
            else: raise SystemExit('edge-tts unavailable')
            # قص الصمت في الطرفين، وضغط إلى ٣٢ ك.ب/ث أحادي
            subprocess.run([FF, '-y', '-loglevel', 'error', '-i', tmp, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,afade=t=in:d=0.02',
                            '-ac', '1', '-ar', '24000', '-b:a', '32k', f], check=True)
            os.remove(tmp)
    print('ok', len(os.listdir(OUT)))
asyncio.run(main())
