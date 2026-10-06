from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards" / "amour"
DATA = ROOT / "oracle-amour-data.js"
EXPECTED = [CARDS / f"{i:03d}.webp" for i in range(1, 81)]

# GABARIT MAÎTRE EXTERNE — modèle fourni et validé par l'utilisateur.
# Aucune carte du dépôt n'est utilisée comme référence de forme, de position,
# de taille ou de typographie. Les WebP GitHub ne fournissent que l'illustration.
CANVAS = (512, 768)
IVORY = (250, 248, 240)
GOLD = (177, 145, 77)
GOLD_LIGHT = (211, 190, 132)
NAVY = (25, 48, 72)
NUMBER = (126, 104, 60)

# Le médaillon du numéro est centré et volontairement légèrement coupé en haut,
# comme sur le modèle validé. Sa taille couvre les anciens médaillons variables.
TOP_OUTER = (184, -34, 328, 66)
TOP_INNER = (191, -27, 321, 59)
TOP_NUMBER_CENTER = (256, 27)
NUMBER_FONT_SIZE = 31

# Cartouche titre : proportions, position et centrage issus du modèle externe.
# Il est légèrement plus grand que les anciennes plaques afin de les recouvrir
# entièrement sans effacer ni reconstruire l'illustration.
BOTTOM_OUTER = (61, 637, 451, 720)
BOTTOM_INNER = (68, 644, 444, 713)
BOTTOM_RADIUS = 27
BOTTOM_INNER_RADIUS = 23
TITLE_CENTER = (256, 678)
TITLE_MAX_WIDTH = 306
TITLE_FONT_SIZE = 25
TITLE_MIN_SIZE = 18
TITLE_TRACKING = 1.15


def find_font(name: str) -> Path:
    for root in [Path("/usr/local/share/fonts"), Path("/usr/share/fonts")]:
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
        out[idx] = json.loads('"' + raw + '"')
    missing = [i for i in range(1, 81) if i not in out]
    if missing:
        raise RuntimeError(f"Titres manquants dans oracle-amour-data.js: {missing}")
    return out


def tracking_width(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    tracking: float,
) -> float:
    return sum(draw.textlength(ch, font=font) for ch in text) + max(0, len(text) - 1) * tracking


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


def fitted_title_font(draw: ImageDraw.ImageDraw, text: str) -> ImageFont.FreeTypeFont:
    # La taille maître reste identique. Seuls les titres exceptionnellement longs
    # descendent juste assez pour rester dans le cartouche, sans changer graisse
    # ni famille typographique.
    for size in range(TITLE_FONT_SIZE, TITLE_MIN_SIZE - 1, -1):
        font = ImageFont.truetype(str(FONT_REGULAR), size=size)
        if tracking_width(draw, text, font, TITLE_TRACKING) <= TITLE_MAX_WIDTH:
            return font
    return ImageFont.truetype(str(FONT_REGULAR), size=TITLE_MIN_SIZE)


def draw_top_medallion(draw: ImageDraw.ImageDraw, idx: int) -> None:
    draw.ellipse(TOP_OUTER, fill=IVORY, outline=GOLD, width=3)
    draw.ellipse(TOP_INNER, outline=GOLD_LIGHT, width=1)
    font = ImageFont.truetype(str(FONT_REGULAR), size=NUMBER_FONT_SIZE)
    text = str(idx)
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text(
        (TOP_NUMBER_CENTER[0] - w / 2, TOP_NUMBER_CENTER[1] - h / 2 - bbox[1]),
        text,
        font=font,
        fill=NUMBER,
    )


def draw_bottom_cartouche(draw: ImageDraw.ImageDraw, title: str) -> None:
    # Corps ivoire à double filet or, dimensionné pour masquer toute ancienne plaque.
    draw.rounded_rectangle(
        BOTTOM_OUTER,
        radius=BOTTOM_RADIUS,
        fill=IVORY,
        outline=GOLD,
        width=3,
    )
    draw.rounded_rectangle(
        BOTTOM_INNER,
        radius=BOTTOM_INNER_RADIUS,
        outline=GOLD_LIGHT,
        width=1,
    )

    # Ornements latéraux sobres du modèle validé.
    cy = TITLE_CENTER[1]
    draw.line((78, cy, 109, cy), fill=GOLD, width=1)
    draw.polygon([(73, cy), (78, cy - 4), (83, cy), (78, cy + 4)], fill=GOLD)
    draw.line((403, cy, 434, cy), fill=GOLD, width=1)
    draw.polygon([(429, cy), (434, cy - 4), (439, cy), (434, cy + 4)], fill=GOLD)

    text = title.upper()
    font = fitted_title_font(draw, text)
    draw_tracking_text(draw, TITLE_CENTER, text, font, NAVY, TITLE_TRACKING)


def process_one(path: Path, idx: int, title: str) -> None:
    im = Image.open(path).convert("RGB")
    if im.size != CANVAS:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {CANVAS}")

    # Pas d'inpainting, pas de recadrage, pas de modification de luminosité :
    # on conserve intégralement l'illustration puis on recouvre seulement les
    # zones des cartouches avec le gabarit maître externe.
    draw = ImageDraw.Draw(im)
    draw_top_medallion(draw, idx)
    draw_bottom_cartouche(draw, title)
    im.save(path, "WEBP", quality=96, method=6)


def main() -> None:
    missing = [p.name for p in EXPECTED if not p.exists()]
    if missing:
        raise RuntimeError(f"Cartes manquantes: {', '.join(missing)}")

    titles = read_titles()
    for i, path in enumerate(EXPECTED, start=1):
        process_one(path, i, titles[i])
        print(f"HARMONISÉ {path.name}: {titles[i]}")

    sizes = {Image.open(p).size for p in EXPECTED}
    if sizes != {CANVAS}:
        raise RuntimeError(f"Canevas finaux incohérents: {sizes}")

    print("80/80 cartes harmonisées sur le gabarit externe validé.")


if __name__ == "__main__":
    main()
