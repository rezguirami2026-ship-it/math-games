# يولّد صوت كل سطر من script.json بأصوات Microsoft العُمانية (edge-tts)، ويكتب المدد في timing.json
# الاستعمال: python voice.py <مجلد الإخراج>
import asyncio, json, os, re, subprocess, sys
import edge_tts, imageio_ffmpeg

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
        for i, (who, text) in enumerate(sc['lines']):
            v = S['voices'][who]; f = os.path.join(OUT, f"{sc['id']}_{i}.mp3")
            if not os.path.exists(f):
                await edge_tts.Communicate(text, v['voice'], rate=v['rate'], pitch=v['pitch']).save(f)
            timing.append({'scene': sc['id'], 'i': i, 'who': who, 'file': f, 'dur': round(dur(f), 3)})
    json.dump(timing, open(os.path.join(OUT, 'timing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('lines', len(timing), 'speech seconds', round(sum(t['dur'] for t in timing), 1))

asyncio.run(main())
