from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards"

# (nouvelle illustration, ancienne carte = gabarit maître, agrandissement horizontal, vertical)
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

def scaled_crop(im, sx, sy):
    im = im.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    nw, nh = round(W * sx), round(H * sy)
    big = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    return big.crop((left, top, left + W, top + H))

def gold_frame_mask(template):
    arr = np.asarray(template.convert("RGB"))
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    # Cadre doré : sélection volontairement limitée aux bandes périphériques.
    gold = (r > 145) & (g > 105) & (b < 190) & (r > b + 20) & (g > b * 0.72)
    yy, xx = np.mgrid[0:H, 0:W]
    bands = (xx < 52) | (xx > W-53) | (yy < 62) | (yy > H-70)
    mask = (gold & bands).astype("uint8") * 255
    m = Image.fromarray(mask, "L").filter(ImageFilter.MaxFilter(5))
    return m

for new_name, template_name, sx, sy in TARGETS:
    new_path = CARDS / new_name
    template_path = CARDS / template_name
    donor = Image.open(new_path).convert("RGB")
    template = Image.open(template_path).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)

    # 1. L'illustration récente est agrandie juste assez pour sortir son ancien
    #    cadre et ses marges du canevas.
    result = scaled_crop(donor, sx, sy)

    # 2. Le double filet doré est repris pixel pour pixel sur l'ancienne carte,
    #    qui constitue le gabarit historique exact de cette carte.
    mask = gold_frame_mask(template)
    result.paste(template, (0, 0), mask)

    # 3. Le médaillon numéroté original est repris sans aucune interprétation.
    badge = template.crop((442, 0, 582, 128))
    result.paste(badge, (442, 0))

    # 4. Le cartouche inférieur, le titre et le bas du cadre proviennent
    #    intégralement de l'ancienne carte pour garantir police, hauteur,
    #    centrage et géométrie strictement identiques au jeu d'origine.
    bottom = template.crop((0, 1290, W, H))
    result.paste(bottom, (0, 1290))

    result.save(new_path, "WEBP", quality=93, method=6)
    print(f"normalise: {new_name}")
