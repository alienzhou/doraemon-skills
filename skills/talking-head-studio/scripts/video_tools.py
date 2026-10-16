#!/usr/bin/env python3
"""Local media inspection, circular portrait composition, and verification.
Python standard library + ffmpeg/ffprobe. No downloads, transcription, or uploads.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
import tempfile
from fractions import Fraction
from pathlib import Path


def run(args, **kw):
    return subprocess.run([str(x) for x in args], check=True, **kw)


def probe(path):
    r=run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',path],capture_output=True,text=True)
    return json.loads(r.stdout)


def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda:f.read(8*1024*1024),b''): h.update(b)
    return h.hexdigest()


def stream(info, kind):
    items=[s for s in info['streams'] if s['codec_type']==kind and not s.get('disposition',{}).get('attached_pic')]
    if not items: raise ValueError(f'No {kind} stream')
    return items[0]


def dump(path,data):
    path=Path(path); path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')


def inspect(args):
    p=Path(args.source).resolve(); info=probe(p)
    v=stream(info,'video'); duration=float(info['format']['duration'])
    report={'source':str(p),'sha256':digest(p),'size':p.stat().st_size,
            'mtime_ns':p.stat().st_mtime_ns,'media':info,'frames':[]}
    if args.frames:
        folder=Path(args.frames).resolve(); folder.mkdir(parents=True,exist_ok=True)
        for i in range(args.count):
            visual_end=min(duration,float(v.get('duration',duration)))
            t=max(0,visual_end-1/float(Fraction(v['avg_frame_rate'])))*i/max(1,args.count-1)
            out=folder/f'frame-{i:02d}-{t:.3f}.png'
            run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',p,'-map',f'0:{v["index"]}',
                 '-frames:v','1','-vf','scale=640:640:force_original_aspect_ratio=decrease,format=rgb24','-update','1',out])
            if not out.is_file() or not out.stat().st_size: raise ValueError(f'Frame extraction returned no image at {t}')
            report['frames'].append({'time':t,'file':str(out)})
    if args.output: dump(args.output,report)
    print(json.dumps({'source':str(p),'duration':duration,'size':p.stat().st_size,
                      'sha256':report['sha256'],'frames':report['frames']},ensure_ascii=False,indent=2))


def settings(path):
    path=Path(path).resolve(); c=json.loads(path.read_text()); root=path.parent
    for key in ('source','background','output'):
        c[key]=(root/c[key]).resolve()
    if c['output'] in (c['source'],c['background']): raise ValueError('Output cannot replace an input')
    c['_root']=root; c['_config']=path
    info=probe(c['source']); v=stream(info,'video'); a=stream(info,'audio')
    if c.get('source_sha256') and digest(c['source'])!=c['source_sha256']:
        raise ValueError('Source changed: re-inspect and realign the storyboard/crop before updating source_sha256')
    if v.get('sample_aspect_ratio','1:1') not in ('1:1','0:1','N/A'):
        raise ValueError('Non-square source pixels: normalize SAR and review the crop first')
    if v.get('color_transfer') in ('smpte2084','arib-std-b67') or v.get('color_primaries')=='bt2020':
        raise ValueError('HDR/wide-gamut source needs an explicit color-conversion workflow')
    c['fps']=str(c.get('fps',30)); c['_fps']=float(Fraction(c['fps']))
    if not 1<=c['_fps']<=120: raise ValueError('fps must be between 1 and 120')
    if abs(float(v.get('start_time',0))-float(a.get('start_time',0)))>1/c['_fps']:
        raise ValueError('Source audio/video start times differ: align explicitly before using this helper')
    c['width'],c['height']=int(c['width']),int(c['height'])
    if any(x<=0 or x%2 for x in (c['width'],c['height'])): raise ValueError('Output dimensions must be positive even integers')
    total=float(info['format']['duration']); window=c.get('window',{})
    c['_start']=float(window.get('start',0))
    c['_duration']=float(window['duration']) if window.get('duration') is not None else total-c['_start']
    if c['_start']<0 or c['_duration']<=0 or c['_start']+c['_duration']>total+.0001:
        raise ValueError('Requested window is outside source duration')
    c['_frames']=math.ceil(c['_duration']*c['_fps']-1e-7)
    c['_full']=abs(c['_start'])<1e-8 and abs(c['_duration']-total)<.0001
    c['_copy_audio']=c['_full'] and a['codec_name'] in ('aac','alac')
    p=c['portrait']; x,y,w,h=map(float,p['crop'])
    if x<0 or y<0 or w<=0 or h<=0 or x+w>1.000001 or y+h>1.000001:
        raise ValueError('portrait.crop must be normalized [x,y,width,height] inside the auto-rotated source')
    for key in ('x','y','size'): p[key]=int(p[key])
    p['border']=int(p.get('border',4))
    if p['size']<32 or p['size']%2 or p['x']%2 or p['y']%2 or p['border']<0:
        raise ValueError('Portrait x/y and size must be even; size >= 32; border >= 0')
    if min(p['x']-p['border'],p['y']-p['border'])<0 or p['x']+p['size']+p['border']>c['width'] or p['y']+p['size']+p['border']>c['height']:
        raise ValueError('Portrait or its border is outside the output canvas')
    c['_matrix']=c.get('source_matrix') or ('bt709' if v.get('color_space')=='bt709' else 'bt601')
    if c['_matrix'] not in ('bt601','bt709'): raise ValueError('source_matrix must be bt601 or bt709')
    video_duration=float(v.get('duration',total))
    c['_pad']=max(0,c['_start']+c['_frames']/c['_fps']-video_duration)+2/c['_fps']
    if c['_pad']>1: raise ValueError('Source video ends over 1 second before requested audio: inspect the source instead of freezing it')
    c['_video_index']=v['index']; c['_audio_index']=a['index']
    return c


def face_filter(c):
    x,y,w,h=c['portrait']['crop']; d=c['portrait']['size']
    return (f"fps={c['fps']},crop=iw*{w}:ih*{h}:iw*{x}:ih*{y},"
            f"scale={d}:{d}:force_original_aspect_ratio=increase:flags=lanczos:in_color_matrix={c['_matrix']}:out_color_matrix=bt709,"
            f"crop={d}:{d},setsar=1")


def alpha(d):
    return f"format=yuva420p,geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':a='255*clip(({d/2}-hypot(X-{(d-1)/2},Y-{(d-1)/2})),0,1)'"


def source_args(c):
    return (['-ss',str(c['_start'])] if c['_start'] else [])+['-i',str(c['source'])]


def compose(args):
    c=settings(args.config); bg=probe(c['background']); b=stream(bg,'video')
    if (b['width'],b['height'])!=(c['width'],c['height']): raise ValueError('Background dimensions do not match config')
    if b.get('color_space')!='bt709': raise ValueError('Render/convert the background to BT.709 before composition')
    bg_frames=int(b.get('nb_frames',0)); bg_fps=float(Fraction(b['avg_frame_rate']))
    if bg_frames and abs(bg_fps-c['_fps'])<.001:
        too_short=bg_frames<c['_frames']
    else:
        too_short=float(b.get('duration',bg['format']['duration']))+1/bg_fps<c['_frames']/c['_fps']
    if too_short: raise ValueError('Background is too short; render every output frame for this window')
    p=c['portrait']; d=p['size']; border=p['border']; outer=d+2*border
    graph=f"[0:{c['_video_index']}]{face_filter(c)},tpad=stop_mode=clone:stop_duration={c['_pad']},{alpha(d)}[face];"
    graph+=f"[1:v]fps={c['fps']},setpts=PTS-STARTPTS,setsar=1[bg];"
    if border:
        graph+=f"color=c=white:s={outer}x{outer}:r={c['fps']}:d={c['_frames']/c['_fps']},{alpha(outer)}[ring];"
        graph+=f"[bg][ring]overlay=x={p['x']-border}:y={p['y']-border}:shortest=1[board];"
    else: graph+='[bg]null[board];'
    graph+=f"[board][face]overlay=x={p['x']}:y={p['y']}:shortest=1,format=yuv420p[v]"
    c['output'].parent.mkdir(parents=True,exist_ok=True)
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y' if args.overwrite else '-n']+source_args(c)
    cmd+=['-i',c['background'],'-filter_complex',graph,'-map','[v]','-map',f"0:{c['_audio_index']}",
          '-frames:v',str(c['_frames']),'-c:v','libx264','-preset','fast','-crf',str(c.get('crf',18)),'-threads','4']
    cmd+=['-c:a','copy'] if c['_copy_audio'] else ['-c:a','aac','-b:a','192k']
    if not c['_full']: cmd+=['-t',str(c['_duration'])]
    cmd+=['-map_metadata','-1','-map_chapters','-1','-color_primaries','bt709','-color_trc','bt709',
          '-colorspace','bt709','-movflags','+faststart',c['output']]
    run(cmd)
    print(json.dumps({'output':str(c['output']),'frames':c['_frames'],'audio':'stream copy' if c['_copy_audio'] else 'AAC encode'},ensure_ascii=False))


def audio_hash(path):
    return run(['ffmpeg','-v','error','-i',path,'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-'],capture_output=True,text=True).stdout.strip()


def verify(args):
    c=settings(args.config); info=probe(c['output']); v=stream(info,'video'); a=stream(info,'audio')
    if len(info['streams'])!=2: raise ValueError('Expected exactly one video and one audio stream')
    if (v['width'],v['height'])!=(c['width'],c['height']): raise ValueError('Wrong output dimensions')
    if abs(float(Fraction(v['avg_frame_rate']))-c['_fps'])>.001: raise ValueError('Wrong output fps')
    if abs(float(info['format']['duration'])-c['_duration'])>1/c['_fps']+.005: raise ValueError('Output duration does not cover the requested window')
    if abs(float(a['duration'])-c['_duration'])>max(.05,1/c['_fps']): raise ValueError('Audio duration does not cover the requested window')
    frame_count=int(v.get('nb_frames',0))
    if frame_count not in (c['_frames']-1,c['_frames']): raise ValueError(f'Unexpected frame count: {frame_count}')
    report={'output':str(c['output']),'duration':info['format']['duration'],'frames':frame_count,
            'audio_bit_exact':None,'manual_review':['human crop','chapter content and timing','no burned-in speech subtitles']}
    if c['_copy_audio']:
        expected=audio_hash(c['source']); actual=audio_hash(c['output'])
        if expected!=actual: raise ValueError('Copied original audio hash differs')
        report.update(audio_bit_exact=True,audio_hash=actual)
    if args.face_check:
        p=c['portrait']; inner=int(p['size']*.65)//2*2; margin=(p['size']-inner)//2
        graph=f"[0:v]crop={inner}:{inner}:{p['x']+margin}:{p['y']+margin},setsar=1[outface];"
        graph+=f"[1:{c['_video_index']}]{face_filter(c)},crop={inner}:{inner}:{margin}:{margin}[reference];"
        graph+='[outface][reference]ssim=stats_file=ssim.txt:shortest=1[v]'
        with tempfile.TemporaryDirectory(prefix='portrait-check-') as tmp:
            run(['ffmpeg','-v','error','-i',c['output']]+source_args(c)+['-filter_complex',graph,'-map','[v]',
                 '-t',str(c['_duration']),'-an','-f','null','-'],cwd=tmp)
            values=[float(x) for x in re.findall(r'All:([\d.]+)',(Path(tmp)/'ssim.txt').read_text())]
        if len(values)<frame_count-3 or min(values)<.93: raise ValueError('Portrait similarity/coverage check failed; inspect A/V alignment and crop')
        report['portrait']={'frames_checked':len(values),'min_ssim':min(values),'mean_ssim':sum(values)/len(values)}
    if args.report: dump(args.report,report)
    print(json.dumps(report,ensure_ascii=False,indent=2))


def main():
    p=argparse.ArgumentParser(description=__doc__); sub=p.add_subparsers(dest='command',required=True)
    s=sub.add_parser('inspect'); s.add_argument('source'); s.add_argument('--output'); s.add_argument('--frames'); s.add_argument('--count',type=int,default=8); s.set_defaults(fn=inspect)
    s=sub.add_parser('compose'); s.add_argument('config'); s.add_argument('--overwrite',action='store_true'); s.set_defaults(fn=compose)
    s=sub.add_parser('verify'); s.add_argument('config'); s.add_argument('--face-check',action='store_true'); s.add_argument('--report'); s.set_defaults(fn=verify)
    args=p.parse_args()
    try: args.fn(args)
    except (ValueError,KeyError,FileNotFoundError) as e: p.exit(2,f'Error: {e}\n')


if __name__=='__main__': main()
