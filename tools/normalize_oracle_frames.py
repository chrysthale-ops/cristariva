from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards"

TARGETS = [
    ("003-joie-final.webp", "003.webp"),
    ("007-tempete-final.webp", "007.webp"),
    ("016-stabilite-final.webp", "016.webp"),
    ("021-union-final.webp", "021.webp"),
    ("036-blocage-final.webp", "036.webp"),
    ("037-cohesion-final.webp", "037.webp"),
    ("052-memoire-final.webp", "052.webp"),
    ("088-vision-final.webp", "088.webp"),
]

W, H = 1024, 1536
GOLD = (218, 184, 78)

def scaled_crop(im):
    im = im.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    # Le cadre généré des nouvelles images doit disparaître totalement.
    sx, sy = 1.17, 1.16
    nw, nh = round(W * sx), round(H * sy)
    big = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    return big.crop((left, top, left + W, top + H))

def paste_badge(result, template):
    # Médaillon original de la carte, détouré en cercle.
    box = (454, 0, 570, 116)
    badge = template.crop(box)
    mask = Image.new("L", badge.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((4, 0, badge.width-5, badge.height-7), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.4))
    result.paste(badge, box[:2], mask)

def extract_title_mask(template):
    arr = np.asarray(template.convert("RGB"))
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    lum = 0.299*r + 0.587*g + 0.114*b
    chroma = np.maximum.reduce([r,g,b]) - np.minimum.reduce([r,g,b])
    yy, xx = np.mgrid[0:H, 0:W]
    region = (xx > 145) & (xx < 885) & (yy > 1345) & (yy < 1468)
    # Seules les lettres blanches/gris très clair de l'ancien titre sont gardées.
    mask = ((lum > 208) & (chroma < 38) & region).astype("uint8") * 255
    return Image.fromarray(mask, "L").filter(ImageFilter.GaussianBlur(0.25))

def add_title_band(result, template):
    rgba = result.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    # Presque opaque : masque complètement l'ancien cartouche/titre de l'image
    # recréée, tout en gardant une très légère profondeur visuelle.
    od.rectangle((0, 1292, W, 1495), fill=(4, 11, 16, 238))
    rgba = Image.alpha_composite(rgba, overlay)

    mask = extract_title_mask(template)
    # Fin liseré sombre autour du texte, sans double titre.
    shadow = mask.filter(ImageFilter.MaxFilter(3))
    black = Image.new("RGBA", (W, H), (0,0,0,135))
    rgba.paste(black, (1,1), shadow)
    rgba.paste(template.convert("RGBA"), (0,0), mask)
    return rgba.convert("RGB")

def add_frame(result):
    d = ImageDraw.Draw(result)
    # Double filet standard du jeu CRISTARIVA.
    d.rectangle((20, 22, 1003, 1512), outline=GOLD, width=3)
    d.rectangle((31, 32, 992, 1501), outline=GOLD, width=2)
    return result

for new_name, template_name in TARGETS:
    donor = Image.open(CARDS / new_name).convert("RGB")
    template = Image.open(CARDS / template_name).convert("RGB").resize((W,H), Image.Resampling.LANCZOS)

    result = scaled_crop(donor)
    result = add_title_band(result, template)
    result = add_frame(result)
    paste_badge(result, template)

    result.save(CARDS / new_name, "WEBP", quality=94, method=6)
    print(f"gabarit CRISTARIVA final applique: {new_name}")
