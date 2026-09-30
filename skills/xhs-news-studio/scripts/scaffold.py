#!/usr/bin/env python3
"""Copy the neutral editable starter into a NEW project directory."""
import argparse
import json
from pathlib import Path
import shutil
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('destination',type=Path)
p.add_argument('--max-images',type=int,default=18,help='Maximum images including cover; default personal XHS limit: 18')
a=p.parse_args()
if a.max_images<1:p.error('--max-images must be a positive integer')
root=Path(__file__).resolve().parents[1]
dest=a.destination.expanduser().resolve()
if dest.exists():p.error('Destination already exists; refusing to overwrite. Choose a new project directory.')
shutil.copytree(root/'assets/starter',dest)
story_path=dest/'story.json'
story=json.loads(story_path.read_text())
story['maxImages']=a.max_images
story_path.write_text(json.dumps(story,ensure_ascii=False,indent=2)+'\n')
print(f'Created {dest}\nNext: edit story.json; npm install; npm run build; npm run render.\nThe starter is a fictional layout demo, not publishable news.')
