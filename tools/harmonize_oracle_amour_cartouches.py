from __future__ import annotations

import json
import re
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards" / "amour"
DATA = ROOT / "oracle-amour-data.js"
EXPECTED = [CARDS / f"{i:03d}.webp" for i in range(1, 81)]

# IMPORTANT : ces constantes reproduisent le gabarit EXTERNE validé par
# l'utilisateur le 5 octobre 2026. Aucune carte présente dans GitHub n'est
# utilisée comme référence de position, forme ou typographie.
CANVAS = (512, 768)
IVORY = (250, 248, 240)
GOLD = (181, 151, 82)
GOLD_LIGHT = (211, 192, 137)
NAVY = (23, 49, 76)
NUMBER = (129, 106, 57)

# Cartouche numéro : médaillon centré, légèrement coupé par le bord supérieur.
TOP_OUTER = (204, -18, 308, 61)
TOP_INNER = (210, -12, 302, 55)

# Cartouche titre : proportions du modèle validé, identiques sur les 80 cartes.
BOTTOM_OUTER = [
    (68, 706), (78, 690), (94, 683), (418, 683), (434, 690),
    (444, 706), (434, 722), (418, 729), (94, 729), (78, 722),
]
BOTTOM_INNER = [
    (75, 706), (84, 694), (98, 688), (414, 688), (428, 694),
    (437, 706), (428, 718), (414, 724), (98, 724), (84, 718),
]
TITLE_CENTER = (256, 706)
TITLE_MAX_WIDTH = 292
TITLE_FONT_SIZE = 24
TITLE_MIN_SIZE = 20
TITLE_TRACKING = 1.05
NUMBER_FONT_SIZE = 30


def find_font(name: str) -> Path:
    candidates = [
        Path("/usr/share/fonts/truetype/cinzel") / name,
        Path("/usr/share/fonts/opentype/cinzel") / name,
    ]
    for p in candidates:
        if p.exists():
            return p
    for root in [Path("/usr/share/fonts"), Path("/usr/local/share/fonts")]:
        if root.exists():
            matches = list(root.rglob(name))
            if matches:
                return matches[0]
    fallback = Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf")
    if fallback.exists():
        return fallback
    raise RuntimeError("Police Cinzel/serif introuvable")


FONT_REGULAR = find_font("Cinzel-Regular.ttf")


def read_titles() -> dict[int, str]:
    s = DATA.read_text(encoding="utf-8")
    out: dict[int, str] = {}
    for m in re.finditer(r'\{"id":(\d+),"name":"((?:\\.|[^"\\])*)"', s):
        idx = int(m.group(1))
        raw = m.group(2)
        name = json.loads('"' + raw + '"')
        out[idx] = name
    missing = [i for i in range(1, 81) if i not in out]
    if missing:
        raise RuntimeError(f"Titres manquants dans oracle-amour-data.js: {missing}")
    return out


def tracking_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, tracking: float) -> float:
    widths = [draw.textlength(ch, font=font) for ch in text]
    return sum(widths) + max(0, len(text) - 1) * tracking


def draw_tracking_text(
    draw: ImageDraw.ImageDraw,
    center: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    tracking: float,
) -> None:
    total = tracking_width(draw, text, font, tracking)
    x = center[0] - total / 2
    bbox = draw.textbbox((0, 0), text, font=font)
    text_h = bbox[3] - bbox[1]
    y = center[1] - text_h / 2 - bbox[1]
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking


def title_font(draw: ImageDraw.ImageDraw, text: str) -> ImageFont.FreeTypeFont:
    for size in range(TITLE_FONT_SIZE, TITLE_MIN_SIZE - 1, -1):
        f = ImageFont.truetype(str(FONT_REGULAR), size=size)
        if tracking_width(draw, text, f, TITLE_TRACKING) <= TITLE_MAX_WIDTH:
            return f
    return ImageFont.truetype(str(FONT_REGULAR), size=TITLE_MIN_SIZE)


def remove_existing_bottom_cartouche(rgb: np.ndarray) -> np.ndarray:
    """Retire uniquement l'ancien cartouche clair dans la bande basse.

    Le masque est déterminé par couleur + géométrie et non par comparaison avec
    une carte du dépôt. L'illustration est ensuite reconstituée localement par
    inpainting avant pose du cartouche maître.
    """
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, w = hsv.shape[:2]

    y0, y1 = 625, min(h, 760)
    x0, x1 = 38, min(w, 474)
    roi = hsv[y0:y1, x0:x1]

    # Ivoire / blanc peu saturé, gamme couvrant les anciens cartouches.
    mask_roi = cv2.inRange(roi, np.array([0, 0, 148], np.uint8), np.array([179, 105, 255], np.uint8))
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(mask_roi, 8)

    chosen = None
    best = -1.0
    for k in range(1, n):
        x, y, ww, hh, area = stats[k]
        cx, cy = centroids[k]
        global_cx = x0 + cx
        global_cy = y0 + cy
        if not (150 <= ww <= 420 and 18 <= hh <= 105 and 630 <= global_cy <= 748):
            continue
        if not (125 <= global_cx <= 387):
            continue
        score = area + ww * 9 - abs(global_cx - 256) * 25
        if score > best:
            best = score
            chosen = k

    if chosen is None:
        # Aucun grand cartouche clair détecté : on ne touche pas à l'illustration.
        return rgb

    fullmask = np.zeros((h, w), dtype=np.uint8)
    component = (labels == chosen).astype(np.uint8) * 255
    component = cv2.dilate(component, np.ones((9, 9), np.uint8), iterations=1)
    fullmask[y0:y1, x0:x1] = component

    restored = cv2.inpaint(bgr, fullmask, 5, cv2.INPAINT_TELEA)
    return cv2.cvtColor(restored, cv2.COLOR_BGR2RGB)


def draw_master_cartouches(im: Image.Image, idx: int, title: str) -> Image.Image:
    draw = ImageDraw.Draw(im)

    # Médaillon supérieur du modèle validé.
    draw.ellipse(TOP_OUTER, fill=IVORY, outline=GOLD, width=3)
    draw.ellipse(TOP_INNER, outline=GOLD_LIGHT, width=1)
    num_font = ImageFont.truetype(str(FONT_REGULAR), size=NUMBER_FONT_SIZE)
    nb = str(idx)
    nbbox = draw.textbbox((0, 0), nb, font=num_font)
    nw, nh = nbbox[2] - nbbox[0], nbbox[3] - nbbox[1]
    draw.text((256 - nw / 2, 23 - nh / 2 - nbbox[1]), nb, font=num_font, fill=NUMBER)

    # Cartouche inférieur du modèle validé.
    draw.polygon(BOTTOM_OUTER, fill=IVORY)
    draw.line(BOTTOM_OUTER + [BOTTOM_OUTER[0]], fill=GOLD, width=3, joint="curve")
    draw.line(BOTTOM_INNER + [BOTTOM_INNER[0]], fill=GOLD_LIGHT, width=1, joint="curve")

    # Petits ornements latéraux, fixes et symétriques.
    draw.line((94, 706, 118, 706), fill=GOLD, width=1)
    draw.polygon([(88, 706), (92, 703), (96, 706), (92, 709)], fill=GOLD)
    draw.line((394, 706, 418, 706), fill=GOLD, width=1)
    draw.polygon([(416, 706), (420, 703), (424, 706), (420, 709)], fill=GOLD)

    text = title.upper()
    font = title_font(draw, text)
    draw_tracking_text(draw, TITLE_CENTER, text, font, NAVY, TITLE_TRACKING)
    return im


def process_one(path: Path, idx: int, title: str) -> None:
    im = Image.open(path).convert("RGB")
    if im.size != CANVAS:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {CANVAS}")
    arr = np.asarray(im)
    arr = remove_existing_bottom_cartouche(arr)
    out = Image.fromarray(arr, "RGB")
    out = draw_master_cartouches(out, idx, title)
    out.save(path, "WEBP", quality=96, method=6)


def main() -> None:
    missing = [p.name for p in EXPECTED if not p.exists()]
    if missing:
        raise RuntimeError(f"Cartes manquantes: {', '.join(missing)}")

    titles = read_titles()
    for i, path in enumerate(EXPECTED, start=1):
        process_one(path, i, titles[i])
        print(f"HARMONISÉ {path.name}: {titles[i]}")

    # Contrôle final strict : 80 fichiers et canevas identique.
    sizes = {Image.open(p).size for p in EXPECTED}
    if sizes != {CANVAS}:
        raise RuntimeError(f"Canevas finaux incohérents: {sizes}")
    print("80/80 cartes harmonisées sur le gabarit externe validé.")


if __name__ == "__main__":
    main()
