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
    # Agrandissement volontaire : il chasse complètement hors du canevas
    # le cadre, le médaillon et les marges intégrés aux images recréées.
    sx, sy = 1.17, 1.13
    nw, nh = round(W * sx), round(H * sy)
    big = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    return big.crop((left, top, left + W, top + H))

def paste_badge(result, template):
    # Médaillon historique exact, sans recopier son arrière-plan rectangulaire.
    box = (454, 0, 570, 116)
    badge = template.crop(box)
    mask = Image.new("L", badge.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((4, 0, badge.width-5, badge.height-7), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.45))
    result.paste(badge, box[:2], mask)

def extract_title_mask(template):
    arr = np.asarray(template.convert("RGB"))
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    lum = 0.299*r + 0.587*g + 0.114*b
    chroma = np.maximum.reduce([r,g,b]) - np.minimum.reduce([r,g,b])
    yy, xx = np.mgrid[0:H, 0:W]
    # Les lettres des anciennes cartes sont les seuls pixels presque blancs
    # dans cette zone centrale du cartouche.
    region = (xx > 150) & (xx < 875) & (yy > 1350) & (yy < 1465)
    mask = ((lum > 205) & (chroma < 42) & region).astype("uint8") * 255
    return Image.fromarray(mask, "L").filter(ImageFilter.GaussianBlur(0.35))

def add_title_band(result, template):
    rgba = result.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    # Cartouche sombre standard, même hauteur que les cartes d'origine.
    od.rectangle((0, 1304, W, 1494), fill=(4, 11, 16, 176))
    rgba = Image.alpha_composite(rgba, overlay)

    mask = extract_title_mask(template)
    # Ombre noire très légère derrière le titre.
    shadow = mask.filter(ImageFilter.MaxFilter(5))
    black = Image.new("RGBA", (W, H), (0,0,0,185))
    rgba.paste(black, (2,2), shadow)
    rgba.paste(template.convert("RGBA"), (0,0), mask)
    return rgba.convert("RGB")

def add_frame(result):
    d = ImageDraw.Draw(result)
    # Double filet CRISTARIVA : mêmes positions que le gabarit historique.
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
    print(f"cadre standard CRISTARIVA applique: {new_name}")
