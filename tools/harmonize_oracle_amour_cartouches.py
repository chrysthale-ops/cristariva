from __future__ import annotations

import io
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards" / "amour"
DATA = ROOT / "oracle-amour-data.js"
EXPECTED = [CARDS / f"{i:03d}.webp" for i in range(1, 81)]

# GABARIT MAÎTRE EXTERNE — modèle fourni et validé par l'utilisateur.
# Aucune carte du dépôt n'est utilisée comme référence de forme, de position,
# de taille ou de typographie. Les WebP GitHub ne servent que d'illustrations.
CANVAS = (512, 768)
IVORY = (250, 248, 240)
GOLD = (177, 145, 77)
GOLD_LIGHT = (211, 190, 132)
NAVY = (25, 48, 72)
NUMBER = (126, 104, 60)

# Médaillon supérieur du modèle validé : onglet ivoire étroit, rectangulaire à
# angles très arrondis, partiellement coupé par le bord supérieur.
TOP_OUTER = (198, -22, 314, 53)
TOP_INNER = (204, -16, 308, 46)
TOP_RADIUS = 21
TOP_INNER_RADIUS = 16
TOP_NUMBER_CENTER = (256, 25)
NUMBER_FONT_SIZE = 25

# Cartouche inférieur du modèle validé : plus bas, plus étroit et plus compact
# que les essais r6/r8, avec corps arrondi et petites pointes latérales.
BOTTOM_BODY = (76, 689, 436, 741)
BOTTOM_INNER = (83, 695, 429, 735)
BOTTOM_RADIUS = 14
BOTTOM_INNER_RADIUS = 10
BOTTOM_LEFT_TIP = (66, 715)
BOTTOM_RIGHT_TIP = (446, 715)
TITLE_CENTER = (256, 715)
TITLE_MAX_WIDTH = 276
TITLE_FONT_SIZE = 22
TITLE_TRACKING = 1.0
TITLE_LINE_GAP = 1

# Zone de l'ancien cartouche qui resterait visible au-dessus du nouveau.
# Elle est reconstruite à partir de l'illustration immédiatement voisine, avant
# de poser le gabarit maître. Cela évite les doubles cartouches et les aplats
# clairs produits par les anciens essais d'effacement.
RESTORE_BOX = (58, 648, 454, 692)


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


def restore_old_bottom_cartouche(im: Image.Image) -> Image.Image:
    """Masque seulement la partie de l'ancien cartouche encore visible.

    Le remplissage est une réflexion locale de la bande d'illustration située
    juste au-dessus. Le masque est limité aux pixels clairs/peu chromatiques de
    l'ancienne plaque puis adouci ; aucune référence visuelle GitHub n'est
    utilisée pour définir le nouveau gabarit.
    """
    x0, y0, x1, y1 = RESTORE_BOX
    arr = np.array(im, dtype=np.uint8)
    roi = arr[y0:y1, x0:x1]
    mx = roi.max(axis=2)
    mn = roi.min(axis=2)

    # Ivoire, beige, gris clair et filet doré de l'ancien cartouche.
    mask = ((mx > 130) & ((mx - mn) < 105)).astype(np.uint8) * 255
    mask_img = Image.fromarray(mask, mode="L")
    mask_img = mask_img.filter(ImageFilter.MaxFilter(9))
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(1.8))

    h = y1 - y0
    reflected = im.crop((x0, y0 - h, x1, y0)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    current = im.crop((x0, y0, x1, y1))
    repaired = Image.composite(reflected, current, mask_img)

    out = im.copy()
    out.paste(repaired, (x0, y0))
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
    """Conserve taille, graisse et espacement identiques sur les 80 cartes.

    Un titre qui ne tient pas est réparti sur deux lignes au lieu d'être réduit.
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
    draw.rounded_rectangle(
        BOTTOM_BODY,
        radius=BOTTOM_RADIUS,
        fill=IVORY,
        outline=GOLD,
        width=3,
    )

    lx, ly = BOTTOM_LEFT_TIP
    rx, ry = BOTTOM_RIGHT_TIP
    draw.polygon([(lx, ly), (BOTTOM_BODY[0] + 1, ly - 8), (BOTTOM_BODY[0] + 1, ly + 8)], fill=IVORY)
    draw.line([(lx, ly), (BOTTOM_BODY[0] + 1, ly - 8)], fill=GOLD, width=2)
    draw.line([(lx, ly), (BOTTOM_BODY[0] + 1, ly + 8)], fill=GOLD, width=2)
    draw.polygon([(rx, ry), (BOTTOM_BODY[2] - 1, ry - 8), (BOTTOM_BODY[2] - 1, ry + 8)], fill=IVORY)
    draw.line([(rx, ry), (BOTTOM_BODY[2] - 1, ry - 8)], fill=GOLD, width=2)
    draw.line([(rx, ry), (BOTTOM_BODY[2] - 1, ry + 8)], fill=GOLD, width=2)

    draw.rounded_rectangle(
        BOTTOM_INNER,
        radius=BOTTOM_INNER_RADIUS,
        outline=GOLD_LIGHT,
        width=1,
    )

    cy = TITLE_CENTER[1]
    draw.line((90, cy, 119, cy), fill=GOLD, width=1)
    draw.polygon([(84, cy), (90, cy - 3), (96, cy), (90, cy + 3)], fill=GOLD)
    draw.line((393, cy, 422, cy), fill=GOLD, width=1)
    draw.polygon([(416, cy), (422, cy - 3), (428, cy), (422, cy + 3)], fill=GOLD)

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

    # Les retouches existantes 31–40 restaurent uniquement les zones qui avaient
    # été détériorées lors des essais précédents ; elles ne servent pas de modèle.
    patch_path = ROOT / "assets" / "amour-cartouche-restoration" / f"{idx:03d}.webp"
    if 31 <= idx <= 40:
        if not patch_path.exists():
            raise RuntimeError(f"Retouche de cartouche manquante : {patch_path}")
        with Image.open(patch_path) as source_patch:
            patch = source_patch.convert("RGBA")
        if patch.size != CANVAS:
            raise RuntimeError(f"Dimensions incorrectes : {patch_path}")
        im.paste(patch, (0, 0), patch)

    # Descendre le nouveau cartouche impose de reconstruire la fine bande de
    # l'ancien cartouche qui serait sinon visible au-dessus.
    im = restore_old_bottom_cartouche(im)

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
