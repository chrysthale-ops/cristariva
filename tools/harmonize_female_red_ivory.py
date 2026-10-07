from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import re

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards"
VERSION = "20261002-red-ivory-r1"


def polygon_mask(size, polygons):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for poly in polygons:
        draw.polygon(poly, fill=255)
    return np.array(mask) > 0


def recolor_blue_to_burgundy(path, polygons):
    image = Image.open(path).convert("RGB")
    if image.size != (1024, 1536):
        raise ValueError(f"{path.name}: format inattendu {image.size}")
    hsv = np.array(image.convert("HSV"))
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    area = polygon_mask(image.size, polygons)
    blue = (h >= 135) & (h <= 195) & (s >= 28) & (v >= 18) & area

    h2, s2, v2 = h.copy(), s.copy(), v.copy()
    h2[blue] = 251
    s2[blue] = np.clip(np.maximum(s[blue] * 0.92, 120), 0, 230).astype(np.uint8)

    result = Image.fromarray(np.stack([h2, s2, v2], axis=-1).astype(np.uint8), "HSV").convert("RGB")
    result.save(path, "WEBP", quality=94, method=6)


def recolor_dark_fabric_to_burgundy(path, polygons):
    image = Image.open(path).convert("RGB")
    if image.size != (1024, 1536):
        raise ValueError(f"{path.name}: format inattendu {image.size}")
    rgb = np.array(image)
    hsv = np.array(image.convert("HSV"))
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    area = polygon_mask(image.size, polygons)

    cool = (h >= 120) & (h <= 220) & (s >= 18)
    dark = v <= 120
    dark_redish = ((h >= 220) | (h <= 8)) & (v <= 145) & (s >= 20)
    protected = ((h <= 35) | (h >= 245)) & (v >= 125) & (s >= 20)
    fabric = area & (dark | cool | dark_redish) & (~protected)

    out = rgb.astype(np.float32)
    vv = v.astype(np.float32)
    out[..., 0][fabric] = np.clip(vv[fabric] * 1.25 + 20, 30, 180)
    out[..., 1][fabric] = np.clip(vv[fabric] * 0.27 + 3, 5, 48)
    out[..., 2][fabric] = np.clip(vv[fabric] * 0.30 + 5, 8, 54)

    result = Image.fromarray(out.astype(np.uint8), "RGB")
    result.save(path, "WEBP", quality=94, method=6)


# 91 — Sagesse : robe ivoire, châle bleu -> bordeaux.
recolor_blue_to_burgundy(
    CARDS / "091.webp",
    [[
        (410, 640), (570, 630), (625, 700), (610, 850), (675, 970),
        (675, 1230), (620, 1350), (500, 1360), (440, 1240),
        (320, 1320), (190, 1300), (190, 1160), (245, 990),
        (390, 930), (395, 760)
    ]],
)

# 30 — Écoute : la femme de gauche conserve sa robe ivoire ;
# son châle bleu -> bordeaux. La femme de droite reste en rouge.
recolor_blue_to_burgundy(
    CARDS / "030-ecoute-final.webp",
    [[
        (285, 790), (390, 760), (505, 780), (565, 850), (575, 930),
        (530, 1010), (430, 1065), (315, 1035), (245, 950), (255, 850)
    ]],
)

# 37 — Cohésion : la femme de droite conserve sa robe ivoire ;
# son châle sombre bleu -> bordeaux. Les broderies dorées restent intactes.
recolor_dark_fabric_to_burgundy(
    CARDS / "037-cohesion-final.webp",
    [
        [
            (780, 750), (825, 735), (865, 745), (900, 770), (928, 810),
            (932, 865), (915, 920), (875, 938), (835, 910), (798, 885),
            (770, 850), (765, 805)
        ],
        [
            (915, 925), (945, 940), (980, 970), (999, 1020), (1000, 1195),
            (985, 1230), (960, 1220), (940, 1170), (925, 1080)
        ],
        [
            (585, 800), (615, 790), (650, 800), (681, 818), (674, 844),
            (643, 854), (612, 844), (590, 830)
        ],
    ],
)

# 3 — Joie : la femme de droite conserve sa robe ivoire ;
# son châle sombre bleu -> bordeaux.
recolor_dark_fabric_to_burgundy(
    CARDS / "003-joie-final.webp",
    [
        [
            (845, 855), (885, 840), (930, 848), (970, 870), (992, 900),
            (992, 950), (970, 982), (930, 995), (885, 970), (845, 940),
            (825, 900)
        ],
        [
            (615, 935), (665, 910), (725, 905), (790, 920), (850, 945),
            (915, 985), (970, 1040), (990, 1090), (980, 1135), (930, 1150),
            (860, 1135), (790, 1110), (720, 1080), (665, 1060), (625, 1035)
        ],
        [
            (785, 1200), (825, 1188), (855, 1195), (890, 1220), (930, 1245),
            (970, 1270), (995, 1290), (995, 1310), (780, 1310)
        ],
    ],
)

# Forcer le rafraîchissement des quatre images sur le site.
index_path = ROOT / "index.html"
html = index_path.read_text(encoding="utf-8")
for asset in (
    "cards/091.webp",
    "cards/030-ecoute-final.webp",
    "cards/037-cohesion-final.webp",
    "cards/003-joie-final.webp",
):
    pattern = re.escape(asset) + r'(?:\?v=[^"\']+)?'
    html = re.sub(pattern, f"{asset}?v={VERSION}", html)
index_path.write_text(html, encoding="utf-8")

sw_path = ROOT / "service-worker.js"
sw = sw_path.read_text(encoding="utf-8")
sw = re.sub(
    r"const CACHE_NAME='[^']+';",
    "const CACHE_NAME='cristariva-v76-20261002-red-ivory-r1';",
    sw,
    count=1,
)
sw = re.sub(
    r"const APP_VERSION='[^']+';",
    "const APP_VERSION='2026.10.02-red-ivory-r1';",
    sw,
    count=1,
)
sw_path.write_text(sw, encoding="utf-8")

for name in (
    "091.webp",
    "030-ecoute-final.webp",
    "037-cohesion-final.webp",
    "003-joie-final.webp",
):
    im = Image.open(CARDS / name)
    if im.size != (1024, 1536):
        raise AssertionError((name, im.size))
    print(name, im.size)
