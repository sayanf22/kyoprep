import os
from PIL import Image

src1 = r"C:\Users\admin\.gemini\antigravity-ide\brain\2b6e9b33-12e2-4a91-8717-3cd3f4d8f0e1\media__1784245567226.png"
src2 = r"C:\Users\admin\.gemini\antigravity-ide\brain\2b6e9b33-12e2-4a91-8717-3cd3f4d8f0e1\media__1784245567241.png"

target_dir = r"d:\Projects with IDE\kyoprep\public\images"
os.makedirs(target_dir, exist_ok=True)

def process_image(src, filename):
    if not os.path.exists(src):
        print(f"Error: {src} not found")
        return
    img = Image.open(src)
    print(f"Loaded {src}: size={img.size}, format={img.format}, mode={img.mode}")
    
    # Save as WebP with 85% quality
    dest = os.path.join(target_dir, filename)
    
    # Convert RGBA to RGB if saving as WebP (or keep RGBA for transparency)
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
        
    img.save(dest, "WEBP", quality=85)
    print(f"Saved {dest} successfully. Size: {os.path.getsize(dest) / 1024:.2f} KB")

process_image(src1, "uploaded_ref1.webp")
process_image(src2, "uploaded_ref2.webp")
