# تركيب الفيديو: اللقطات + أصوات الأبطال في مواضعها + موسيقى تنخفض تلقائياً حين يتكلمون، ثم ترميز H.264 خفيف للويب.
# الاستعمال: python mux.py <OUT> <ملف الإخراج.mp4>
import json, os, subprocess, sys
import imageio_ffmpeg
OUT, DEST = sys.argv[1], sys.argv[2]
FF = imageio_ffmpeg.get_ffmpeg_exe()
plan = json.load(open(os.path.join(OUT, 'plan.json'), encoding='utf-8'))
aud = plan['audio']
args = [FF, '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(OUT, 'frames', 'f%05d.jpg'), '-i', os.path.join(OUT, 'music.wav')]
for a in aud: args += ['-i', a['file']]
f = []
for k, a in enumerate(aud):
    ms = int(a['at'] * 1000); f.append(f"[{k + 2}:a]aresample=44100,adelay={ms}|{ms},apad=whole_dur={plan['total']:.2f}[v{k}]")
f.append(''.join(f'[v{k}]' for k in range(len(aud))) + f"amix=inputs={len(aud)}:normalize=0,volume=1.6[voc]")
f.append('[voc]asplit=2[voc1][voc2]')
f.append("[1:a]aresample=44100,volume=0.30[mus]")
f.append('[mus][voc1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]')
f.append('[duck][voc2]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[aout]')
args += ['-filter_complex', ';'.join(f), '-map', '0:v', '-map', '[aout]',
         '-vf', 'scale=out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '2200k', '-bufsize', '4400k', '-pix_fmt', 'yuv420p', '-r', '30',
         '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-movflags', '+faststart', '-shortest', DEST]
subprocess.run(args, check=True)
print('ok', DEST, round(os.path.getsize(DEST) / 1048576, 1), 'MB')
