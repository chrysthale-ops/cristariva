from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards"

TARGETS = [
    ("003-joie-final.webp", 3, "Joie"),
    ("007-tempete-final.webp", 7, "Tempête"),
    ("016-stabilite-final.webp", 16, "Stabilité"),
    ("021-union-final.webp", 21, "Union"),
    ("036-blocage-final.webp", 36, "Blocage"),
    ("037-cohesion-final.webp", 37, "Cohésion"),
    ("052-memoire-final.webp", 52, "Mémoire"),
    ("088-vision-final.webp", 88, "Vision"),
]

W, H = 1024, 1536
GOLD = (218, 184, 78)
NAVY = (21, 47, 72)
WHITE = (247, 244, 238)
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"

def scaled_crop(im):
    im = im.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    # Le gabarit généré dans les nouvelles cartes est poussé entièrement
    # hors du canevas : on ne conserve que l'illustration.
    sx, sy = 1.17, 1.24
    nw, nh = round(W * sx), round(H * sy)
    big = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    return big.crop((left, top, left + W, top + H))

def fit_font(text, max_width, start_size):
    size = start_size
    while size > 36:
        font = ImageFont.truetype(FONT_REG, size)
        box = font.getbbox(text)
        if box[2] - box[0] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(FONT_REG, size)

def draw_master_frame(result, number, title):
    rgba = result.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    od = ImageDraw.Draw(overlay)

    # Cartouche sombre calé sur le modèle Émotions. Il s'assombrit vers
    # le bas afin de masquer totalement le titre intégré à l'image source.
    for y in range(1305, H):
        t = (y - 1305) / max(1, H - 1305 - 1)
        alpha = round(184 + (255 - 184) * t)
        od.line((0, y, W, y), fill=(4, 11, 16, alpha), width=1)
    rgba = Image.alpha_composite(rgba, overlay)
    d = ImageDraw.Draw(rgba)

    # Double filet doré, proportions du gabarit historique.
    d.rectangle((20, 22, 1003, 1512), outline=GOLD, width=3)
    d.rectangle((31, 32, 992, 1501), outline=GOLD, width=2)

    # Médaillon identique pour toutes les cartes.
    cx, cy = 512, 51
    d.ellipse((461, 0, 563, 102), fill=NAVY, outline=GOLD, width=3)
    d.ellipse((466, 5, 558, 97), outline=(235, 202, 107), width=2)

    num_font = ImageFont.truetype(FONT_REG, 48)
    num = str(number)
    nb = d.textbbox((0,0), num, font=num_font, stroke_width=1)
    nx = cx - (nb[2]-nb[0])/2
    ny = cy - (nb[3]-nb[1])/2 - 3
    d.text((nx+1, ny+2), num, font=num_font, fill=(0,0,0,150), stroke_width=1, stroke_fill=(0,0,0,110))
    d.text((nx, ny), num, font=num_font, fill=WHITE)

    # Titre centré, mêmes proportions que le modèle maître.
    title_font = fit_font(title, 760, 68)
    tb = d.textbbox((0,0), title, font=title_font, stroke_width=1)
    tx = (W - (tb[2]-tb[0])) / 2
    ty = 1380
    d.text((tx+2, ty+3), title, font=title_font, fill=(0,0,0,190), stroke_width=2, stroke_fill=(0,0,0,180))
    d.text((tx, ty), title, font=title_font, fill=WHITE, stroke_width=1, stroke_fill=(35,35,35,180))

    return rgba.convert("RGB")

for filename, number, title in TARGETS:
    path = CARDS / filename
    donor = Image.open(path).convert("RGB")
    result = scaled_crop(donor)
    result = draw_master_frame(result, number, title)
    result.save(path, "WEBP", quality=94, method=6)
    print(f"gabarit maître Émotions appliqué: {filename}")
