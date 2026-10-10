# يولّد صوت كل سطر من script.json بأصوات Microsoft العُمانية (edge-tts)، ويكتب المدد في timing.json
# الاستعمال: python voice.py <مجلد الإخراج>
import asyncio, json, os, re, subprocess, sys
import edge_tts, imageio_ffmpeg
import edge_tts.constants as _C, edge_tts.communicate as _CM, edge_tts.drm as _D
for _m in (_C, _CM, _D):   # الخدمة ترفض (403) رقم نسخة المتصفح القديم داخل edge-tts 7.2.8
    if hasattr(_m, 'CHROMIUM_FULL_VERSION'): _m.CHROMIUM_FULL_VERSION = '147.0.3700.60'
    if hasattr(_m, 'CHROMIUM_MAJOR_VERSION'): _m.CHROMIUM_MAJOR_VERSION = '147'
    if hasattr(_m, 'SEC_MS_GEC_VERSION'): _m.SEC_MS_GEC_VERSION = '1-147.0.3700.60'

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
FF = imageio_ffmpeg.get_ffmpeg_exe()
S = json.load(open(os.path.join(HERE, 'script.json'), encoding='utf-8'))

def dur(path):
    err = subprocess.run([FF, '-i', path], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)

async def main():
    timing = []
    for sc in S['scenes']:
        for i, line in enumerate(sc['lines']):
            who, text = line[0], (line[2] if len(line) > 2 else line[1])   # النص المشكول للنطق إن وُجد
            v = S['voices'][who]; f = os.path.join(OUT, f"{sc['id']}_{i}.mp3")
            if not os.path.exists(f):
                for attempt in range(8):
                    try: await edge_tts.Communicate(text, v['voice'], rate=v['rate'], pitch=v['pitch']).save(f); break
                    except Exception as e: print('retry', sc['id'], i, str(e)[:30]); await asyncio.sleep(4 + attempt * 3)
            timing.append({'scene': sc['id'], 'i': i, 'who': who, 'file': f, 'dur': round(dur(f), 3)})
    json.dump(timing, open(os.path.join(OUT, 'timing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('lines', len(timing), 'speech seconds', round(sum(t['dur'] for t in timing), 1))

asyncio.run(main())
