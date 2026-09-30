#!/usr/bin/env python3
"""Package selected PNGs and copy only when current render inputs still match."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parent

def need(ok,msg):
    if not ok:raise SystemExit(msg)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
s=json.loads((root/'story.json').read_text())
max_images=s.get('maxImages',18)
need(type(max_images) is int and max_images>=1,'maxImages must be a positive integer.')
need(len(s['pages'])+1<=max_images,'Image budget exceeded, including cover.')
need(s.get('draft') is False,'Refusing to package draft/demo. Replace sample content and complete review first.')
need(all(x.get('type')!='synthetic' for x in s['sources']),'Replace fictional sources before publishing.')
qa=json.loads((root/'output/qa.json').read_text())
need(qa.get('ok'),'Rendering checks failed.')
for p,h in {**qa['inputHashes'],**qa['outputHashes']}.items():
    f=root/p;need(f.is_file() and digest(f)==h,'Stale or missing output/input: '+p+'. Rebuild and render.')
review=root/'review.md';need(review.exists() and len(review.read_text().strip())>30,'Write actual visual and factual observations to review.md first.')
names=json.loads((root/'pages.json').read_text())
need(len(names)==len(s['pages'])+1 and len(names)<=max_images,'Page list differs from the image budget.')
files=[root/'output'/Path(n).with_suffix('.png') for n in names]+[root/'post-copy.md',root/'sources.md']
archive=root/'output/publish.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in files:z.write(p,p.name)
with zipfile.ZipFile(archive) as z:
    for p in files:need(z.read(p.name)==p.read_bytes(),'ZIP differs: '+p.name)
(root/'output/manifest.json').write_text(json.dumps({p.name:digest(p) for p in files},indent=2))
print(f'Packaged and verified {len(files)} files: {archive}')
