import os
from PIL import Image

dir_path = r"C:\Users\admin\.gemini\antigravity-ide\brain\2b6e9b33-12e2-4a91-8717-3cd3f4d8f0e1"
files = ["media__1784245567226.png", "media__1784245567241.png", "media__1784247679627.png"]

for f in files:
    path = os.path.join(dir_path, f)
    if os.path.exists(path):
        img = Image.open(path)
        print(f"File: {f} | Size: {img.size} | Format: {img.format} | Mode: {img.mode}")
    else:
        print(f"File: {f} not found")
