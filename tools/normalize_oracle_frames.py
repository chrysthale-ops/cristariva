from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards"

TARGETS = [
    ("003-joie-final.webp", "003.webp", 1.10, 1.07),
    ("007-tempete-final.webp", "007.webp", 1.10, 1.07),
    ("016-stabilite-final.webp", "016.webp", 1.10, 1.07),
    ("021-union-final.webp", "021.webp", 1.10, 1.07),
    ("036-blocage-final.webp", "036.webp", 1.06, 1.04),
    ("037-cohesion-final.webp", "037.webp", 1.06, 1.04),
    ("052-memoire-final.webp", "052.webp", 1.06, 1.04),
    ("088-vision-final.webp", "088.webp", 1.06, 1.04),
]

W, H = 1024, 1536
GOLD = (218, 184, 78)
NAVY = (18, 45, 70)

def scaled_crop(im, sx, sy):
    im = im.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    nw, nh = round(W * sx), round(H * sy)
    big = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    return big.crop((left, top, left + W, top + H))

def paste_badge(result, template):
    # Copie du médaillon historique avec un masque circulaire, sans le carré
    # d'arrière-plan de l'ancienne illustration.
    box = (451, 0, 573, 122)
    badge = template.crop(box)
    mask = Image.new("L", badge.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((6, 0, badge.width-7, badge.height-7), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))
    result.paste(badge, box[:2], mask)

def title_mask_from_template(template):
    # Extrait uniquement les lettres claires du titre d'origine. La zone est
    # volontairement limitée au cartouche afin d'éviter tout élément du décor.
    arr = np.asarray(template.convert("RGB"))
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    lum = 0.299*r + 0.587*g + 0.114*b
    neutral = (np.maximum.reduce([r,g,b]) - np.minimum.reduce([r,g,b])) < 75
    yy, xx = np.mgrid[0:H, 0:W]
    region = (xx > 130) & (xx < 900) & (yy > 1330) & (yy < 1468)
    mask = ((lum > 145) & neutral & region).astype("uint8") * 255
    return Image.fromarray(mask, "L").filter(ImageFilter.MaxFilter(3))

def add_standard_title_band(result, template):
    rgba = result.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    # Même hauteur de cartouche que les cartes historiques.
    od.rectangle((0, 1300, W, 1492), fill=(5, 12, 17, 170))
    rgba = Image.alpha_composite(rgba, overlay)

    mask = title_mask_from_template(template)
    # Ombre discrète comme sur les titres d'origine.
    shadow = mask.filter(ImageFilter.MaxFilter(5))
    black = Image.new("RGBA", (W,H), (0,0,0,170))
    rgba.paste(black, (2,2), shadow)
    rgba.paste(template.convert("RGBA"), (0,0), mask)
    return rgba.convert("RGB")

def add_standard_frame(result):
    d = ImageDraw.Draw(result)
    # Gabarit historique CRISTARIVA : double filet doré.
    d.rectangle((20, 22, 1003, 1512), outline=GOLD, width=3)
    d.rectangle((31, 32, 992, 1501), outline=GOLD, width=2)
    return result

for new_name, template_name, sx, sy in TARGETS:
    new_path = CARDS / new_name
    template_path = CARDS / template_name

    donor = Image.open(new_path).convert("RGB")
    template = Image.open(template_path).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)

    # L'agrandissement fait sortir du canevas le cadre/marge généré avec la
    # nouvelle illustration, mais conserve l'image elle-même.
    result = scaled_crop(donor, sx, sy)

    # Le cadre est ensuite recréé dans le gabarit historique exact.
    result = add_standard_title_band(result, template)
    result = add_standard_frame(result)
    paste_badge(result, template)

    result.save(new_path, "WEBP", quality=94, method=6)
    print(f"normalise proprement: {new_name}")
