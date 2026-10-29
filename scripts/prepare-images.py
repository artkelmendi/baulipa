from pathlib import Path
from PIL import Image

source = Path.home() / '.codex/generated_images/01a188f6-71e4-7302-8c59-3d0cfebf8ca6'
target = Path(__file__).resolve().parents[1] / 'public/images'
images = {
    'pool-hero': 'exec-5b2068e0-7fe0-41a8-a1a9-a325d3b02298.png',
    'pool-terrace': 'exec-9b0a150d-e3f6-43db-b0c7-ab85d4328671.png',
    'pool-compact': 'exec-1335b404-7648-4bbb-8fab-ec77d43cadd7.png',
    'product-cleaner': 'exec-3ae8d865-11b7-4b19-b47f-900c2350f2a5.png',
    'product-care': 'exec-a46595a0-afc0-4918-ad60-a79cddc384d2.png',
    'product-pump': 'exec-0e7dea29-2326-4856-bbe8-baa0cfc8b234.png',
    'product-tools': 'exec-c1461243-8e79-441a-8a1a-f8be13ab12c9.png',
}
for name, filename in images.items():
    image = Image.open(source / filename).convert('RGB')
    image.thumbnail((1800, 1200) if name.startswith('pool') else (850, 850))
    image.save(target / f'{name}.webp', 'WEBP', quality=85, method=6)
    print(f'{name}: {(target / f"{name}.webp").stat().st_size // 1024} KB')
