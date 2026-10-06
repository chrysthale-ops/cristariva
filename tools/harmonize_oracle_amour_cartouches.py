from __future__ import annotations

import io
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

# Modèle validé : le médaillon supérieur est une plaque rectangulaire à angles
# fortement arrondis, partiellement coupée par le bord supérieur. Il ne s'agit
# PAS d'une ellipse. Les dimensions reproduisent la proportion du modèle fourni.
TOP_OUTER = (188, -24, 324, 52)
TOP_INNER = (195, -18, 317, 46)
TOP_RADIUS = 24
TOP_INNER_RADIUS = 19
TOP_NUMBER_CENTER = (256, 24)
NUMBER_FONT_SIZE = 25

# Modèle validé : cartouche inférieur large et compact, avec un corps arrondi
# et de petites pointes latérales. Il recouvre entièrement l'ancien cartouche
# sans laisser apparaître sa bordure supérieure ou inférieure.
BOTTOM_BODY = (42, 654, 470, 731)
BOTTOM_INNER = (50, 661, 462, 724)
BOTTOM_RADIUS = 17
BOTTOM_INNER_RADIUS = 13
BOTTOM_LEFT_TIP = (30, 692)
BOTTOM_RIGHT_TIP = (482, 692)
TITLE_CENTER = (256, 692)
TITLE_MAX_WIDTH = 310
TITLE_FONT_SIZE = 22
TITLE_TRACKING = 1.0
TITLE_LINE_GAP = 1


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
    center: tuple[float, float],
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


def split_title(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> list[str]:
    """Conserve exactement la même taille et le même espacement sur les 80 cartes.

    Les titres trop longs sont répartis sur deux lignes plutôt que réduits.
    """
    if tracking_width(draw, text, font, TITLE_TRACKING) <= TITLE_MAX_WIDTH:
        return [text]

    words = text.split()
    if len(words) == 1:
        raise RuntimeError(f"Titre trop long pour le gabarit à taille constante : {text!r}")

    candidates: list[tuple[float, str, str]] = []
    for cut in range(1, len(words)):
        left = " ".join(words[:cut])
        right = " ".join(words[cut:])
        wl = tracking_width(draw, left, font, TITLE_TRACKING)
        wr = tracking_width(draw, right, font, TITLE_TRACKING)
        if wl <= TITLE_MAX_WIDTH and wr <= TITLE_MAX_WIDTH:
            candidates.append((abs(wl - wr), left, right))

    if not candidates:
        raise RuntimeError(
            f"Titre impossible à répartir sur deux lignes à taille constante : {text!r}"
        )

    _, left, right = min(candidates, key=lambda item: item[0])
    return [left, right]


def draw_top_medallion(draw: ImageDraw.ImageDraw, idx: int) -> None:
    draw.rounded_rectangle(
        TOP_OUTER,
        radius=TOP_RADIUS,
        fill=IVORY,
        outline=GOLD,
        width=3,
    )
    draw.rounded_rectangle(
        TOP_INNER,
        radius=TOP_INNER_RADIUS,
        outline=GOLD_LIGHT,
        width=1,
    )

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
    # Corps large et arrondi du modèle maître.
    draw.rounded_rectangle(
        BOTTOM_BODY,
        radius=BOTTOM_RADIUS,
        fill=IVORY,
        outline=GOLD,
        width=3,
    )

    # Petites pointes latérales, plus douces que l'ancien polygone anguleux.
    lx, ly = BOTTOM_LEFT_TIP
    rx, ry = BOTTOM_RIGHT_TIP
    draw.polygon([(lx, ly), (BOTTOM_BODY[0] + 1, ly - 9), (BOTTOM_BODY[0] + 1, ly + 9)], fill=IVORY)
    draw.line([(lx, ly), (BOTTOM_BODY[0] + 1, ly - 9)], fill=GOLD, width=2)
    draw.line([(lx, ly), (BOTTOM_BODY[0] + 1, ly + 9)], fill=GOLD, width=2)
    draw.polygon([(rx, ry), (BOTTOM_BODY[2] - 1, ry - 9), (BOTTOM_BODY[2] - 1, ry + 9)], fill=IVORY)
    draw.line([(rx, ry), (BOTTOM_BODY[2] - 1, ry - 9)], fill=GOLD, width=2)
    draw.line([(rx, ry), (BOTTOM_BODY[2] - 1, ry + 9)], fill=GOLD, width=2)

    draw.rounded_rectangle(
        BOTTOM_INNER,
        radius=BOTTOM_INNER_RADIUS,
        outline=GOLD_LIGHT,
        width=1,
    )

    cy = TITLE_CENTER[1]
    draw.line((59, cy, 101, cy), fill=GOLD, width=1)
    draw.polygon([(53, cy), (59, cy - 3), (65, cy), (59, cy + 3)], fill=GOLD)
    draw.line((411, cy, 453, cy), fill=GOLD, width=1)
    draw.polygon([(447, cy), (453, cy - 3), (459, cy), (453, cy + 3)], fill=GOLD)

    text = title.upper()
    font = ImageFont.truetype(str(FONT_REGULAR), size=TITLE_FONT_SIZE)
    lines = split_title(draw, text, font)
    if len(lines) == 1:
        draw_tracking_text(draw, TITLE_CENTER, lines[0], font, NAVY, TITLE_TRACKING)
        return

    bbox = draw.textbbox((0, 0), "Ag", font=font)
    line_h = bbox[3] - bbox[1]
    total_h = line_h * 2 + TITLE_LINE_GAP
    first_y = TITLE_CENTER[1] - total_h / 2 + line_h / 2
    second_y = first_y + line_h + TITLE_LINE_GAP
    draw_tracking_text(draw, (TITLE_CENTER[0], first_y), lines[0], font, NAVY, TITLE_TRACKING)
    draw_tracking_text(draw, (TITLE_CENTER[0], second_y), lines[1], font, NAVY, TITLE_TRACKING)


def process_one(path: Path, idx: int, title: str) -> None:
    im = Image.open(path).convert("RGB")
    if im.size != CANVAS:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {CANVAS}")

    # Illustration, cadre général, palette, luminosité et longueur restent inchangés.
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

    print("80/80 cartes harmonisées sur le modèle externe validé.")


if __name__ == "__main__":
    main()
