#!/usr/bin/env python3
"""Copy the neutral editable starter into a NEW project directory."""
import argparse
from pathlib import Path
import shutil
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('destination',type=Path)
a=p.parse_args()
root=Path(__file__).resolve().parents[1]
dest=a.destination.expanduser().resolve()
if dest.exists():p.error('Destination already exists; refusing to overwrite. Choose a new project directory.')
shutil.copytree(root/'assets/starter',dest)
print(f'Created {dest}\nNext: edit story.json; npm install; npm run build; npm run render.\nThe starter is a fictional layout demo, not publishable news.')
