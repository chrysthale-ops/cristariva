from __future__ import annotations

import json
import io
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

# Médaillon supérieur du modèle validé : centré, ivoire, double filet or et
# légèrement coupé par le bord supérieur. Hauteur visible : 62 px au lieu de 86.
TOP_OUTER = (179, -38, 333, 62)
TOP_INNER = (186, -31, 326, 55)
TOP_NUMBER_CENTER = (256, 24)
NUMBER_FONT_SIZE = 27

# Cartouche inférieur du modèle validé : plaque ivoire allongée, pointes latérales,
# double filet or et titre centré. Hauteur : 75 px au lieu de 100.
# Les anciennes bordures qui dépassaient sur 31–40 sont restaurées séparément.
BOTTOM_OUTER = [
    (30, 691), (48, 668), (66, 654), (446, 654), (464, 668),
    (482, 691), (464, 715), (446, 729), (66, 729), (48, 715),
]
BOTTOM_INNER = [
    (40, 691), (57, 674), (74, 661), (438, 661), (455, 674),
    (472, 691), (455, 710), (438, 722), (74, 722), (57, 710),
]
TITLE_CENTER = (256, 692)
TITLE_MAX_WIDTH = 318
TITLE_FONT_SIZE = 23
TITLE_MIN_SIZE = 18
TITLE_TRACKING = 1.0


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
    # Même famille et même graisse sur tout le jeu. Seuls les titres qui ne
    # peuvent physiquement tenir sur une ligne descendent de quelques points.
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
    draw.polygon(BOTTOM_OUTER, fill=IVORY)
    draw.line(BOTTOM_OUTER + [BOTTOM_OUTER[0]], fill=GOLD, width=3, joint="curve")
    draw.line(BOTTOM_INNER + [BOTTOM_INNER[0]], fill=GOLD_LIGHT, width=1, joint="curve")

    cy = TITLE_CENTER[1]
    # Ornements latéraux fixes et symétriques du modèle validé.
    draw.line((61, cy, 102, cy), fill=GOLD, width=1)
    draw.polygon([(55, cy), (61, cy - 4), (67, cy), (61, cy + 4)], fill=GOLD)
    draw.line((410, cy, 451, cy), fill=GOLD, width=1)
    draw.polygon([(445, cy), (451, cy - 4), (457, cy), (451, cy + 4)], fill=GOLD)

    text = title.upper()
    font = fitted_title_font(draw, text)
    draw_tracking_text(draw, TITLE_CENTER, text, font, NAVY, TITLE_TRACKING)


def process_one(path: Path, idx: int, title: str) -> None:
    im = Image.open(path).convert("RGB")
    if im.size != CANVAS:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {CANVAS}")

    # Illustration, cadre général, palette, luminosité et longueur restent
    # inchangés. Seules les deux zones de cartouche sont recouvertes.
    # Les retouches ImageGen sont limitées par un masque aux anciennes plaques.
    # Aucun pixel du reste de l'illustration ne provient des images générées.
    patch_path = ROOT / "assets" / "amour-cartouche-restoration" / f"{idx:03d}.webp"
    if 31 <= idx <= 40:
        if not patch_path.exists():
            raise RuntimeError(f"Retouche de cartouche manquante : {patch_path}")
        with Image.open(patch_path) as source_patch:
            patch = source_patch.convert("RGBA")
        if patch.size != CANVAS:
            raise RuntimeError(f"Dimensions incorrectes : {patch_path}")
        im.paste(patch, (0, 0), patch)
    draw = ImageDraw.Draw(im)
    draw_top_medallion(draw, idx)
    draw_bottom_cartouche(draw, title)
    # Encoder et vérifier avant le remplacement, sans recompression avec pertes.
    encoded = io.BytesIO()
    im.save(encoded, "WEBP", lossless=True, method=6)
    payload = encoded.getvalue()
    with Image.open(io.BytesIO(payload)) as check:
        check.load()
        if check.size != CANVAS:
            raise RuntimeError(f"Encodage incorrect : {path.name}")
    path.write_bytes(payload)


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
