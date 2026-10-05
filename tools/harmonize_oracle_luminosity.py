from __future__ import annotations

import csv
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
REFERENCE = ROOT / "cards/003-joie-final.webp"
REPORT = ROOT / "reports/cristariva-luminosity-report.csv"

# Reference profile taken from the active Joie card.  We correct luminance only:
# no crop, no redraw, no hue replacement, no resizing.
QUANTILES = np.array([0.18, 0.50, 0.80, 0.92], dtype=np.float64)
WEIGHTS = np.array([0.15, 0.35, 0.30, 0.20], dtype=np.float64)
BLEND_STRENGTH = 0.90
MIN_IMPROVEMENT = 0.004


def active_card_paths() -> list[Path]:
    text = INDEX.read_text(encoding="utf-8")
    match = re.search(r"const\s+DATA\s*=\s*(\{.*?\})\s*;\s*let\s+state\s*=", text, flags=re.S)
    if not match:
        raise RuntimeError("Impossible de trouver le bloc const DATA dans index.html")

    data = json.loads(match.group(1))
    cards: list[dict] = []
    for group in ("main", "relation", "dating"):
        values = data.get(group)
        if not isinstance(values, list):
            raise RuntimeError(f"Groupe DATA.{group} absent ou invalide")
        cards.extend(values)

    if len(cards) != 130:
        raise RuntimeError(f"130 cartes actives attendues, {len(cards)} trouvées")

    rels: list[str] = []
    for expected_id, card in enumerate(cards, start=1):
        if int(card.get("id", -1)) != expected_id:
            raise RuntimeError(
                f"Ordre des cartes invalide: id {card.get('id')} rencontré, {expected_id} attendu"
            )
        raw = str(card.get("image", ""))
        rel = raw.split("?", 1)[0].strip()
        if not rel.startswith("cards/"):
            raise RuntimeError(f"Chemin d'image invalide pour la carte {expected_id}: {raw}")
        if rel.startswith("cards/amour/") or rel.startswith("cards/tarot/"):
            raise RuntimeError(f"Autre jeu détecté dans l'oracle CRISTARIVA: {rel}")
        rels.append(rel)

    if len(set(rels)) != 130:
        duplicates = sorted({p for p in rels if rels.count(p) > 1})
        raise RuntimeError(f"Chemins d'images non uniques: {duplicates}")

    paths = [ROOT / rel for rel in rels]
    missing = [str(p.relative_to(ROOT)) for p in paths if not p.exists()]
    if missing:
        raise FileNotFoundError(f"Cartes actives manquantes: {missing}")

    if paths[2].resolve() != REFERENCE.resolve():
        raise RuntimeError(f"La carte 3 active n'est pas la référence Joie attendue: {paths[2]}")
    return paths


def to_rgb_alpha(image: Image.Image) -> tuple[np.ndarray, np.ndarray | None]:
    if "A" in image.getbands():
        rgba = np.asarray(image.convert("RGBA"), dtype=np.float32) / 255.0
        return rgba[..., :3], rgba[..., 3:4]
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0
    return rgb, None


def luminance(rgb: np.ndarray) -> np.ndarray:
    # Perceptual sRGB luma; appropriate for visual brightness harmonisation.
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def analysis_values(rgb: np.ndarray, alpha: np.ndarray | None) -> np.ndarray:
    h, w = rgb.shape[:2]
    # Ignore the thin decorative edge when measuring the scene's exposure.
    y0, y1 = int(round(h * 0.045)), int(round(h * 0.955))
    x0, x1 = int(round(w * 0.045)), int(round(w * 0.955))
    crop = rgb[y0:y1, x0:x1]
    y = luminance(crop)
    mask = (y > 0.025) & (y < 0.985)
    if alpha is not None:
        a = alpha[y0:y1, x0:x1, 0]
        mask &= a > 0.95
    values = y[mask]
    if values.size < 1000:
        values = y.reshape(-1)
    if values.size > 350_000:
        stride = int(np.ceil(values.size / 350_000))
        values = values[::stride]
    return values.astype(np.float64, copy=False)


def stats(rgb: np.ndarray, alpha: np.ndarray | None) -> np.ndarray:
    return np.quantile(analysis_values(rgb, alpha), QUANTILES)


def weighted_error(q: np.ndarray, target: np.ndarray) -> float:
    denom = np.maximum(target, 0.08)
    return float(np.sum(WEIGHTS * ((q - target) / denom) ** 2))


def fit_tone(source_q: np.ndarray, target_q: np.ndarray) -> tuple[float, float, float, float]:
    baseline = weighted_error(source_q, target_q)
    best_score = baseline
    best_gamma = 1.0
    best_scale = 1.0

    # Independent exposure/gamma fit for every card.  The small regularisation
    # keeps natural scene contrast instead of flattening all cards identically.
    for gamma in np.linspace(0.62, 1.42, 81):
        base = np.power(np.maximum(source_q, 1e-6), gamma)
        for scale in np.linspace(0.68, 1.58, 91):
            predicted = np.clip(scale * base, 0.0, 1.0)
            err = weighted_error(predicted, target_q)
            penalty = 0.012 * (np.log(scale) ** 2) + 0.012 * ((gamma - 1.0) ** 2)
            score = err + float(penalty)
            if score < best_score:
                best_score = score
                best_gamma = float(gamma)
                best_scale = float(scale)

    mapped_q = np.clip(
        best_scale * np.power(np.maximum(source_q, 1e-6), best_gamma), 0.0, 1.0
    )
    fitted_q = (1.0 - BLEND_STRENGTH) * source_q + BLEND_STRENGTH * mapped_q
    fitted_error = weighted_error(fitted_q, target_q)

    if baseline <= 1e-12 or fitted_error >= baseline * (1.0 - MIN_IMPROVEMENT):
        return 1.0, 1.0, baseline, baseline
    return best_gamma, best_scale, baseline, fitted_error


def apply_tone(rgb: np.ndarray, gamma: float, scale: float) -> np.ndarray:
    if abs(gamma - 1.0) < 1e-9 and abs(scale - 1.0) < 1e-9:
        return rgb.copy()

    y = luminance(rgb)
    mapped = np.clip(scale * np.power(np.maximum(y, 1e-6), gamma), 0.0, 1.0)

    # Protect absolute blacks and near-whites (frame/text glints) from strong shifts.
    shadow_gate = np.clip((y - 0.018) / 0.085, 0.0, 1.0)
    highlight_gate = np.clip((0.995 - y) / 0.105, 0.0, 1.0)
    local_strength = BLEND_STRENGTH * shadow_gate * highlight_gate
    new_y = y + local_strength * (mapped - y)

    # Scale RGB together to retain hue/chroma as much as possible.
    ratio = (new_y + 1e-5) / (y + 1e-5)
    ratio = np.clip(ratio, 0.55, 2.05)
    out = np.clip(rgb * ratio[..., None], 0.0, 1.0)
    return out.astype(np.float32)


def save_preserving_format(
    path: Path,
    rgb: np.ndarray,
    alpha: np.ndarray | None,
    info: dict,
) -> None:
    rgb8 = np.clip(np.rint(rgb * 255.0), 0, 255).astype(np.uint8)
    if alpha is not None:
        a8 = np.clip(np.rint(alpha * 255.0), 0, 255).astype(np.uint8)
        pixels = np.concatenate([rgb8, a8], axis=2)
        image = Image.fromarray(pixels, mode="RGBA")
    else:
        image = Image.fromarray(rgb8, mode="RGB")

    kwargs: dict = {}
    if info.get("icc_profile"):
        kwargs["icc_profile"] = info["icc_profile"]
    if info.get("exif"):
        kwargs["exif"] = info["exif"]

    suffix = path.suffix.lower()
    if suffix == ".webp":
        kwargs.update(quality=96, method=6)
        image.save(path, format="WEBP", **kwargs)
    elif suffix == ".png":
        kwargs.update(compress_level=6)
        image.save(path, format="PNG", **kwargs)
    else:
        raise RuntimeError(f"Format inattendu pour {path}: {suffix}")


def main() -> None:
    cards = active_card_paths()

    with Image.open(REFERENCE) as ref_image:
        ref_rgb, ref_alpha = to_rgb_alpha(ref_image)
        target_q = stats(ref_rgb, ref_alpha)

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, object]] = []

    for card_id, path in enumerate(cards, start=1):
        rel = path.relative_to(ROOT).as_posix()
        with Image.open(path) as im:
            original_size = im.size
            original_info = dict(im.info)
            rgb, alpha = to_rgb_alpha(im)

        before_q = stats(rgb, alpha)
        before_error = weighted_error(before_q, target_q)

        if path.resolve() == REFERENCE.resolve():
            gamma, scale = 1.0, 1.0
            after_rgb = rgb
            after_q = before_q
            after_error = before_error
            status = "reference_inchangee"
        else:
            gamma, scale, _, predicted_error = fit_tone(before_q, target_q)
            after_rgb = apply_tone(rgb, gamma, scale)
            after_q = stats(after_rgb, alpha)
            after_error = weighted_error(after_q, target_q)

            # Pixel gates can make the realised result differ slightly from the
            # quantile-only fit.  Never publish a card farther from Joie.
            if after_error > before_error + 1e-9 or predicted_error >= before_error:
                gamma, scale = 1.0, 1.0
                after_rgb = rgb
                after_q = before_q
                after_error = before_error
                status = "deja_proche"
            else:
                status = "harmonisee"
                save_preserving_format(path, after_rgb, alpha, original_info)
                with Image.open(path) as check:
                    if check.size != original_size:
                        raise RuntimeError(
                            f"Dimensions modifiées pour {rel}: {original_size} -> {check.size}"
                        )

        rows.append(
            {
                "id": card_id,
                "path": rel,
                "status": status,
                "width": original_size[0],
                "height": original_size[1],
                "gamma": f"{gamma:.4f}",
                "exposure_scale": f"{scale:.4f}",
                "q18_before": f"{before_q[0]:.5f}",
                "q50_before": f"{before_q[1]:.5f}",
                "q80_before": f"{before_q[2]:.5f}",
                "q92_before": f"{before_q[3]:.5f}",
                "q18_after": f"{after_q[0]:.5f}",
                "q50_after": f"{after_q[1]:.5f}",
                "q80_after": f"{after_q[2]:.5f}",
                "q92_after": f"{after_q[3]:.5f}",
                "distance_before": f"{before_error:.7f}",
                "distance_after": f"{after_error:.7f}",
            }
        )
        print(
            f"{card_id:03d}/130 {rel}: {status}; "
            f"gamma={gamma:.3f}, scale={scale:.3f}, distance={before_error:.5f}->{after_error:.5f}"
        )

    fieldnames = list(rows[0].keys())
    with REPORT.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    changed = sum(row["status"] == "harmonisee" for row in rows)
    unchanged = sum(row["status"] == "deja_proche" for row in rows)
    print(f"Terminé: {changed} cartes ajustées, {unchanged} déjà proches, Joie inchangée.")
    print("Référence Joie q18/q50/q80/q92:", ", ".join(f"{v:.5f}" for v in target_q))
    print("Rapport:", REPORT.relative_to(ROOT))


if __name__ == "__main__":
    main()
