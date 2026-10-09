# موسيقى خلفية مولّدة للفيديو: عود مقطوف (Karplus-Strong) على مقام الراست، ونغمة قرار، ودفّ خفيف. بلا ملفات ولا حقوق.
# الاستعمال: python music.py <الملف.wav> <المدة بالثواني>
import math, random, struct, sys, wave

OUT, DUR = sys.argv[1], float(sys.argv[2])
SR = 22050
N = int(SR * (DUR + 2))
buf = [0.0] * N
random.seed(7)

def pluck(f, t, vol, dur):
    """وتر مقطوف: ضجيج يمر بخط تأخير بطول الموجة مع ترشيح، فيصير صوت وتر دافئاً"""
    start = int(t * SR); n = int(dur * SR); p = max(2, int(SR / f))
    line = [random.uniform(-1, 1) for _ in range(p)]; idx = 0
    for i in range(n):
        j = start + i
        if j >= N: break
        nxt = (idx + 1) % p; v = line[idx]
        line[idx] = .4985 * (v + line[nxt]); idx = nxt
        env = min(1.0, i / 60.0)
        buf[j] += v * vol * env

def drum(t, low):
    start = int(t * SR); n = int((.28 if low else .09) * SR); ph = 0.0
    for i in range(n):
        j = start + i
        if j >= N: break
        k = i / n
        if low:   # «دُم»: نغمة منخفضة تنزلق
            f = 110 * (1 - .5 * k); ph += 2 * math.pi * f / SR; buf[j] += math.sin(ph) * .5 * (1 - k) ** 2
        else:     # «تَك»: نقرة قصيرة
            buf[j] += random.uniform(-1, 1) * .16 * (1 - k) ** 3

RAST = [0, 2, 3.5, 5, 7, 9, 10.5, 12]
ROOT = 293.66 / 2   # ري منخفضة
BPM = 96; beat = 60 / BPM / 2
# جملتان لحنيتان مبهجتان تتناوبان (درجات المقام، و None صمت)
A = [4, None, 3, 4, 5, None, 4, 3, 2, None, 3, 2, 1, None, 0, None]
B = [0, 2, 4, None, 5, 4, 3, None, 4, 5, 7, None, 5, 4, 2, None]
t = 0.0; step = 0
while t < DUR:
    ph = A if (step // 16) % 2 == 0 else B
    d = ph[step % 16]
    if d is not None: pluck(ROOT * 2 * 2 ** (RAST[d] / 12), t, .22, beat * 3)
    if step % 8 == 0: pluck(ROOT * 2 ** (RAST[[0, 0, 3, 4][(step // 8) % 4]] / 12), t, .2, beat * 8)
    if step % 8 in (0, 3): drum(t, True)
    if step % 8 in (2, 6): drum(t, False)
    t += beat; step += 1

# دخول وخروج تدريجيان، وتسوية المستوى
fi, fo = int(1.5 * SR), int(3 * SR); end = int(DUR * SR)
peak = max(1e-6, max(abs(x) for x in buf))
with wave.open(OUT, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    out = bytearray()
    for i in range(end):
        g = min(1.0, i / fi, (end - i) / fo)
        out += struct.pack('<h', int(max(-1, min(1, buf[i] / peak * .8 * g)) * 32767))
    w.writeframes(bytes(out))
print('music ok', DUR)
