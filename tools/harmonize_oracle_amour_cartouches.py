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

# R13 — cartouche haut entièrement dans la carte, identique sur les 80 cartes.
TOP_OUTER = (198, 2, 314, 54)
TOP_INNER = (204, 7, 308, 48)
TOP_RADIUS = 18
TOP_INNER_RADIUS = 14
TOP_NUMBER_CENTER = (256, 27)
NUMBER_FONT_SIZE = 23

# Zone occupée par l'ancien grand médaillon circulaire.
# Avant de poser le nouveau cartouche, cette zone est reconstruite à partir de
# deux bandes latérales de LA MÊME illustration. Cela supprime les anciens arcs,
# doubles contours, ombres et débordements sans prendre une autre carte comme
# modèle graphique.
TOP_RESTORE_LEFT_SOURCE = (70, 0, 174, 94)
TOP_RESTORE_RIGHT_SOURCE = (338, 0, 442, 94)
TOP_RESTORE_TARGET = (154, 0, 358, 94)
TOP_RESTORE_ELLIPSE = (154, -24, 358, 94)
TOP_RESTORE_FEATHER = 8

# Cartouche inférieur compact validé sur le principe.
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

# Zone de restauration de l'ancien cartouche inférieur. Elle commence assez
# haut pour englober le filet blanc horizontal signalé sur les captures.
RESTORE_BOX = (48, 628, 464, 694)


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


def restore_old_top_cartouche(im: Image.Image) -> Image.Image:
    """Supprime le grand médaillon haut historique avant de poser le nouveau.

    Les zones latérales immédiatement voisines du médaillon servent de matière
    de restauration. Elles sont étirées vers le centre puis fondues par un masque
    elliptique progressif. Le centre est ensuite largement recouvert par le
    nouveau cartouche maître ; seules les zones qui dépassaient auparavant
    restent visibles, sans ancien liseré ni double contour.
    """
    lx0, ly0, lx1, ly1 = TOP_RESTORE_LEFT_SOURCE
    rx0, ry0, rx1, ry1 = TOP_RESTORE_RIGHT_SOURCE
    tx0, ty0, tx1, ty1 = TOP_RESTORE_TARGET
    target_w = tx1 - tx0
    target_h = ty1 - ty0

    left = im.crop((lx0, ly0, lx1, ly1)).resize(
        (target_w, target_h), Image.Resampling.LANCZOS
    )
    right = im.crop((rx0, ry0, rx1, ry1)).resize(
        (target_w, target_h), Image.Resampling.LANCZOS
    )

    la = np.asarray(left, dtype=np.float32)
    ra = np.asarray(right, dtype=np.float32)
    blend_axis = np.linspace(0.0, 1.0, target_w, dtype=np.float32)[None, :, None]
    blended = np.clip(la * (1.0 - blend_axis) + ra * blend_axis, 0, 255).astype(np.uint8)
    donor = Image.fromarray(blended, mode="RGB")

    replacement = im.copy()
    replacement.paste(donor, (tx0, ty0))

    mask = Image.new("L", CANVAS, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse(TOP_RESTORE_ELLIPSE, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(TOP_RESTORE_FEATHER))

    return Image.composite(replacement, im, mask)


def restore_old_bottom_cartouche(im: Image.Image) -> Image.Image:
    """Supprime les restes de l'ancien cartouche inférieur sans barres parasites."""
    x0, y0, x1, y1 = RESTORE_BOX
    arr = np.array(im, dtype=np.uint8)
    roi = arr[y0:y1, x0:x1]
    mx = roi.max(axis=2)
    mn = roi.min(axis=2)
    spread = mx - mn

    pale = (mx > 120) & (spread < 115)
    seam = (mx > 165) & (spread < 85)
    goldish = (
        (roi[:, :, 0] > 105)
        & (roi[:, :, 1] > 80)
        & (roi[:, :, 2] < 155)
        & ((roi[:, :, 0].astype(int) - roi[:, :, 2].astype(int)) < 130)
    )
    color_mask = pale | seam | goldish

    geom = Image.new("L", (x1 - x0, y1 - y0), 0)
    gd = ImageDraw.Draw(geom)
    old_shape = [
        (70 - x0, 676 - y0),
        (86 - x0, 642 - y0),
        (426 - x0, 642 - y0),
        (442 - x0, 676 - y0),
        (426 - x0, 710 - y0),
        (86 - x0, 710 - y0),
    ]
    gd.polygon(old_shape, fill=255)
    geom_mask = np.array(geom) > 0

    yy = np.arange(y0, y1)[:, None]
    xx = np.arange(x0, x1)[None, :]
    mandatory_top_band = (
        (yy >= 638)
        & (yy <= 660)
        & (xx >= 82)
        & (xx <= 430)
    )

    mask = ((color_mask & geom_mask) | mandatory_top_band).astype(np.uint8) * 255
    mask_img = Image.fromarray(mask, mode="L")
    mask_img = mask_img.filter(ImageFilter.MaxFilter(9))
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(2.5))

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
    arr = np.array(im, dtype=np.uint8)
    roi = arr[628:689, 55:457]
    mx = roi.max(axis=2)
    mn = roi.min(axis=2)
    return int(((mx > 215) & ((mx - mn) < 32)).sum())


def top_residual_metric(im: Image.Image) -> int:
    """Mesure les grandes plages blanc/ivoire hors du nouveau cartouche haut."""
    arr = np.array(im, dtype=np.uint8)
    yy, xx = np.mgrid[0:100, 0:512]
    old_area = (((xx - 256) / 105.0) ** 2 + ((yy + 8) / 100.0) ** 2) <= 1.0
    new_area = (xx >= 190) & (xx <= 322) & (yy <= 61)
    roi = old_area & (~new_area)
    top = arr[:100]
    mx = top.max(axis=2)
    mn = top.min(axis=2)
    neutral_bright = (mx > 238) & ((mx - mn) < 18)
    return int((neutral_bright & roi).sum())


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

    # Ordre impératif : supprimer d'abord les anciens cartouches, puis poser le
    # gabarit maître unique. Ainsi aucun ancien contour ne peut rester dessous.
    im = restore_old_top_cartouche(im)
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
    top_scores: dict[int, int] = {}
    for i, path in enumerate(EXPECTED, start=1):
        process_one(path, i, titles[i])
        with Image.open(path) as check:
            rgb = check.convert("RGB")
            seam_scores[i] = count_white_seam_pixels(rgb)
            top_scores[i] = top_residual_metric(rgb)
        print(
            f"HARMONISÉ {path.name}: {titles[i]} — "
            f"couture-bas={seam_scores[i]} résidu-haut={top_scores[i]}"
        )

    sizes = {Image.open(p).size for p in EXPECTED}
    if sizes != {CANVAS}:
        raise RuntimeError(f"Canevas finaux incohérents: {sizes}")

    worst_bottom = sorted(seam_scores.items(), key=lambda kv: kv[1], reverse=True)[:10]
    worst_top = sorted(top_scores.items(), key=lambda kv: kv[1], reverse=True)[:10]
    print("Top scores couture blanche bas:", worst_bottom)
    print("Top scores résidu ancien cartouche haut:", worst_top)
    print("80/80 cartes harmonisées r13 : ancien cartouche haut neutralisé avant le nouveau.")


if __name__ == "__main__":
    main()
