#!/usr/bin/env python3
"""Editable Pillow motion-graphics starter. Copy alongside video_tools.py.
Use source-time storyboard scenes; extend draw_scene for bespoke visual explanations.
"""
import argparse
import json
import math
import subprocess
import sys
from functools import lru_cache
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
try:
    from video_tools import settings
except ModuleNotFoundError:
    sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
    from video_tools import settings

COLORS={'background':'#f3f2eb','ink':'#183d36','muted':'#788c83','accent':'#087b66',
        'pale':'#e4eee4','highlight':'#d4eea2','line':'#d7e0d6','card':'#ffffff'}


def ease(x):
    x=max(0,min(1,x)); return x*x*(3-2*x)


class Canvas:
    def __init__(self,c):
        self.c=c; self.w=c['width']; self.h=c['height']; self.p={**COLORS,**c.get('palette',{})}
        self.image=Image.new('RGB',(self.w,self.h),self.p['background']); self.d=ImageDraw.Draw(self.image)
    def box(self,box,fill='card',radius=16):
        self.d.rounded_rectangle(tuple(map(round,box)),radius=round(radius),fill=self.p.get(fill,fill))
    def line(self,points,fill='line',width=3):
        self.d.line(points,fill=self.p.get(fill,fill),width=max(1,round(width)),joint='curve')
    def dot(self,x,y,r,fill='accent'):
        self.d.ellipse((x-r,y-r,x+r,y+r),fill=self.p.get(fill,fill))
    def text(self,x,y,text,size,fill='ink',bold=False,width=None,anchor='lt'):
        size=max(12,round(size)); minimum=max(12,round(size*.72))
        while True:
            font=getfont(str(self.c['_font']),size,int(self.c.get('font_bold_index',8) if bold else self.c.get('font_index',2)))
            if width is None or font.getlength(text)<=width: break
            size-=1
            if size<minimum: raise ValueError(f'Label too long for this layout; shorten it or customize the scene: {text}')
        self.d.text((round(x),round(y)),text,font=font,fill=self.p.get(fill,fill),anchor=anchor)


@lru_cache(None)
def getfont(path,size,index):
    return ImageFont.truetype(path,size,index=index)


def common(c,scene):
    q=Canvas(c); w,h=q.w,q.h; portrait=h>w
    q.text(w*.055,h*.045,c.get('series','口播图解'),h*.014,'muted',width=w*.89)
    q.text(w*.055,h*.10,c['topic'],min(w*.061,h*.049),bold=True,width=w*.89)
    q.text(w*.055,h*.235,scene['headline'],min(w*.048,h*.032),bold=True,width=w*.86)
    if scene.get('note'): q.text(w*.055,h*.293,scene['note'],h*.018,'muted',width=w*.86)
    chapters=c.get('chapters',[])
    if portrait:
        bottom=min(h*.73,c['portrait']['y']-c['portrait']['border']-h*.022)
        q.line([(w*.055,bottom+h*.03),(w*.945,bottom+h*.03)])
        nav_top=max(h*.785,bottom+h*.055); nav_w=c['portrait']['x']-w*.09
        step=min(h*.05,(h*.965-nav_top)/max(1,len(chapters)))
        for i,chapter in enumerate(chapters):
            y=nav_top+i*step; active=chapter['id']==scene.get('chapter')
            if active: q.box((w*.055,y,nav_w+w*.055,y+step*.83),'accent',12)
            q.text(w*.07,y+step*.20,f'{i+1}  {chapter["title"]}',min(h*.018,step*.48),
                   'card' if active else 'muted',active,width=nav_w-w*.03)
        body=(w*.055,h*.38,w*.945,bottom)
    else:
        body=(w*.055,h*.38,min(w*.76,c['portrait']['x']-w*.025),h*.75)
        step=w*.70/max(1,len(chapters))
        for i,chapter in enumerate(chapters):
            x=w*.055+i*step; y=h*.86; active=chapter['id']==scene.get('chapter')
            if active: q.box((x,y,x+step*.94,y+h*.072),'accent',10)
            q.text(x+step*.05,y+h*.024,f'{i+1} {chapter["title"]}',h*.022,
                   'card' if active else 'muted',active,width=step*.84)
    if body[3]-body[1]<h*.14 or body[2]-body[0]<w*.35:
        raise ValueError('Portrait leaves insufficient diagram area; customize the layout')
    return q,body


def draw_scene(c,scene,t):
    q,(x0,y0,x1,y1)=common(c,scene); w,h=x1-x0,y1-y0
    items=scene.get('items',[]); kind=scene.get('kind','cards'); age=t-scene['start']
    if not 1<=len(items)<=8: raise ValueError('Starter scenes need 1–8 concise items; extend the renderer for larger diagrams')
    fs=min(c['height']*.02,w*.051)
    if kind=='focus':
        if len(items)!=1: raise ValueError('focus expects one item')
        q.box((x0,y0+w*.03,x1,y1-w*.03),'pale',24)
        q.text((x0+x1)/2,(y0+y1)/2,items[0],fs*1.75,'accent',True,width=w*.85,anchor='mm')
    elif kind in ('cards','overview'):
        cols=min(3 if c['height']>c['width'] else 4,len(items)); rows=math.ceil(len(items)/cols)
        cw=w/cols; ch=h/rows
        for i,label in enumerate(items):
            x=x0+(i%cols)*cw; y=y0+(i//cols)*ch+18*(1-ease((age-i*.14)/.45))
            q.box((x+cw*.03,y,x+cw*.97,y+ch*.87),'card',18)
            q.dot(x+cw*.5,y+ch*.31,min(cw*.16,ch*.15),'highlight')
            q.text(x+cw*.5,y+ch*.31,str(i+1),fs*1.1,'accent',True,anchor='mm')
            q.text(x+cw*.5,y+ch*.66,label,fs,'ink',True,width=cw*.86,anchor='mm')
        if kind=='overview':
            # Parallel alternatives; this intentionally has no sequential arrows.
            q.line([(x0+w*.08,y1),(x1-w*.08,y1)],'line',2)
    elif kind=='flow':
        vertical=c['height']>c['width'] and len(items)>3
        points=[]
        for i in range(len(items)):
            ratio=i/max(1,len(items)-1)
            points.append((x0+w*.5,y0+h*(.12+.76*ratio)) if vertical else (x0+w*(.10+.80*ratio),y0+h*.43))
        if len(points)>1:
            q.line(points,'line',3)
            segment=int(age/2.0)%max(1,len(points)-1); p=(age/2)%1
            a,b=points[segment:segment+2]
            q.dot(a[0]+(b[0]-a[0])*p,a[1]+(b[1]-a[1])*p,5)
        for i,((x,y),label) in enumerate(zip(points,items)):
            r=min(w*.07,h*.095); q.dot(x,y,r,'highlight' if i==int(age/2)%len(items) else 'pale')
            q.text(x,y,str(i+1),fs,'accent',True,anchor='mm')
            if vertical: q.text(x+r*1.65,y,label,fs,bold=True,width=w*.32,anchor='lm')
            else: q.text(x,y+r*2.1,label,fs,bold=True,width=w/len(items)*.91,anchor='mm')
    else: raise ValueError(f'Unknown starter scene kind: {kind}')
    return q.image


def frame(c,scenes,t):
    candidates=[i for i,s in enumerate(scenes) if s['start']<=t<s['end']]
    if len(candidates)!=1: raise ValueError(f'Storyboard has a gap/overlap at source time {t}')
    i=candidates[0]; s=scenes[i]; image=draw_scene(c,s,t)
    transition=min(float(c.get('transition',.35)),(s['end']-s['start'])/3)
    if i and transition>0 and t-s['start']<transition:
        image=Image.blend(draw_scene(c,scenes[i-1],t),image,ease((t-s['start'])/transition))
    return image


def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('config'); p.add_argument('--stills',action='store_true'); p.add_argument('--overwrite',action='store_true')
    args=p.parse_args(); c=settings(args.config)
    c['_font']=(c['_root']/c.get('font','/System/Library/Fonts/PingFang.ttc')).resolve()
    if not c['_font'].is_file(): raise ValueError('Set font to an installed CJK font file; do not silently use missing glyphs')
    scenes=json.loads((c['_root']/c.get('storyboard','storyboard.json')).read_text())
    if not scenes: raise ValueError('Empty storyboard')
    for i,s in enumerate(scenes):
        if s['end']<=s['start'] or (i and abs(s['start']-scenes[i-1]['end'])>.0001): raise ValueError('Storyboard scenes must have positive lengths and be contiguous in source time')
    if scenes[0]['start']>c['_start'] or scenes[-1]['end']+.0001<c['_start']+c['_duration']: raise ValueError('Storyboard does not cover the requested window')
    previews=c['_root']/'work/preview'; previews.mkdir(parents=True,exist_ok=True)
    for i,s in enumerate(scenes):
        a=max(s['start'],c['_start']); b=min(s['end'],c['_start']+c['_duration'])
        if b>a: frame(c,scenes,(a+b)/2).save(previews/f'scene-{i:02d}.jpg',quality=94)
    if args.stills: print(previews); return
    c['background'].parent.mkdir(parents=True,exist_ok=True)
    cmd=['ffmpeg','-v','error','-y' if args.overwrite else '-n','-f','rawvideo','-pix_fmt','rgb24','-s',f"{c['width']}x{c['height']}",
         '-r',c['fps'],'-i','-','-an','-vf','scale=out_color_matrix=bt709:out_range=tv','-c:v','libx264','-preset','fast','-crf','17',
         '-threads','4','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',str(c['background'])]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
        for n in range(c['_frames']):
            t=c['_start']+n/c['_fps']
            proc.stdin.write(frame(c,scenes,t).tobytes())
            if n%max(1,round(c['_fps']*10))==0: print(f'{n}/{c["_frames"]} frames',flush=True)
        proc.stdin.close()
    except BaseException:
        proc.stdin.close(); proc.terminate(); proc.wait(); raise
    if proc.wait(): raise RuntimeError('Background encoding failed')
    print(c['background'])


if __name__=='__main__': main()
