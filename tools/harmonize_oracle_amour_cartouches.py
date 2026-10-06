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

# R11 — le cartouche haut doit être ENTIEREMENT dans la carte.
# Il touche visuellement le bord supérieur mais aucun pixel ne dépasse le canevas.
TOP_OUTER = (198, 2, 314, 54)
TOP_INNER = (204, 7, 308, 48)
TOP_RADIUS = 18
TOP_INNER_RADIUS = 14
TOP_NUMBER_CENTER = (256, 27)
NUMBER_FONT_SIZE = 23

# Cartouche inférieur compact déjà validé sur le principe en r10.
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

# R11 — l'ancienne plaque commence plus haut que la zone traitée en r10.
# La couture blanche observée sur le site se situe typiquement vers y=645/648.
# On commence donc la restauration à y=632 pour englober complètement le filet
# blanc et doré de l'ancien cartouche, avant de poser le nouveau cartouche.
RESTORE_BOX = (48, 632, 464, 694)


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
    """Supprime les restes visibles de l'ancien cartouche sans toucher au reste.

    La restauration cible les pixels clairs/ivoire/or de l'ancienne plaque et de
    sa couture blanche. Le contenu de remplacement est prélevé dans la bande
    d'illustration directement au-dessus, puis réfléchi localement. Le nouveau
    cartouche recouvre ensuite la majeure partie de cette zone restaurée.
    """
    x0, y0, x1, y1 = RESTORE_BOX
    arr = np.array(im, dtype=np.uint8)
    roi = arr[y0:y1, x0:x1]
    mx = roi.max(axis=2)
    mn = roi.min(axis=2)
    spread = mx - mn

    # Ancien fond ivoire / gris clair / filet blanc.
    pale = (mx > 125) & (spread < 105)
    # Couture blanche très lumineuse observée sur les captures.
    seam = (mx > 175) & (spread < 75)
    # Filet vieux-or peu saturé de l'ancienne plaque.
    goldish = (
        (roi[:, :, 0] > 120)
        & (roi[:, :, 1] > 90)
        & (roi[:, :, 2] < 150)
        & ((roi[:, :, 0].astype(int) - roi[:, :, 2].astype(int)) < 115)
    )
    mask = (pale | seam | goldish).astype(np.uint8) * 255

    mask_img = Image.fromarray(mask, mode="L")
    # Étendre légèrement pour englober les bords anti-crénelés de la couture.
    mask_img = mask_img.filter(ImageFilter.MaxFilter(11))
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(2.0))

    h = y1 - y0
    source_top = max(0, y0 - h)
    reflected = im.crop((x0, source_top, x1, y0)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    if reflected.height != h:
        reflected = reflected.resize((x1 - x0, h), Image.Resampling.BICUBIC)
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
    # Sécurité : aucune coordonnée négative n'est admise pour le cartouche haut.
    if TOP_OUTER[1] < 0 or TOP_INNER[1] < 0:
        raise RuntimeError("Le cartouche haut dépasse du canevas")

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


def count_white_seam_pixels(im: Image.Image) -> int:
    """Détecte une éventuelle ligne blanche résiduelle juste au-dessus du cartouche."""
    arr = np.array(im, dtype=np.uint8)
    roi = arr[632:689, 55:457]
    mx = roi.max(axis=2)
    mn = roi.min(axis=2)
    # Compter les pixels très clairs et quasi neutres, typiques de la couture.
    return int(((mx > 215) & ((mx - mn) < 32)).sum())


def process_one(path: Path, idx: int, title: str) -> None:
    im = Image.open(path).convert("RGB")
    if im.size != CANVAS:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {CANVAS}")

    patch_path = ROOT / "assets" / "amour-cartouche-restoration" / f"{idx:03d}.webp"
    if 31 <= idx <= 40:
        if not patch_path.exists():
            raise RuntimeError(f"Retouche de cartouche manquante : {patch_path}")
        with Image.open(patch_path) as source_patch:
            patch = source_patch.convert("RGBA")
        if patch.size != CANVAS:
            raise RuntimeError(f"Dimensions incorrectes : {patch_path}")
        im.paste(patch, (0, 0), patch)

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
    seam_scores: dict[int, int] = {}
    for i, path in enumerate(EXPECTED, start=1):
        process_one(path, i, titles[i])
        with Image.open(path) as check:
            seam_scores[i] = count_white_seam_pixels(check.convert("RGB"))
        print(f"HARMONISÉ {path.name}: {titles[i]} — score couture={seam_scores[i]}")

    sizes = {Image.open(p).size for p in EXPECTED}
    if sizes != {CANVAS}:
        raise RuntimeError(f"Canevas finaux incohérents: {sizes}")

    # Le contrôle de couture est informatif car certaines illustrations peuvent
    # naturellement contenir des zones blanches. Les planches visuelles restent
    # la validation finale avant fusion.
    worst = sorted(seam_scores.items(), key=lambda kv: kv[1], reverse=True)[:10]
    print("Top scores couture blanche:", worst)
    print("80/80 cartes harmonisées r11 : cartouche haut contenu et zone blanche retraitée.")


if __name__ == "__main__":
    main()
