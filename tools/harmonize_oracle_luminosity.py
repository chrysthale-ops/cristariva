from __future__ import annotations

import csv
import re
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
REFERENCE = ROOT / "cards/003-joie-final.webp"
REPORT = ROOT / "reports/cristariva-luminosity-report.csv"

# We harmonize brightness only. Hue, composition, framing, text and subjects are not redrawn.
# Each active card is calibrated independently against the active Joie card.
QUANTILES = np.array([0.20, 0.50, 0.80, 0.92], dtype=np.float64)
WEIGHTS = np.array([0.15, 0.35, 0.30, 0.20], dtype=np.float64)
BLEND_STRENGTH = 0.90


def active_card_paths() -> list[Path]:
    text = INDEX.read_text(encoding="utf-8")
    match = re.search(r"const\s+CRISTARIVA_CARDS\s*=\s*\[(.*?)\n\s*\];", text, flags=re.S)
    if not match:
        raise RuntimeError("Impossible de trouver CRISTARIVA_CARDS dans index.html")
    block = match.group(1)
    rels = re.findall(r'image\s*:\s*"(cards/[^\"]+)"', block)
    # Exclude the two other decks if their image fields ever appear in the same block by mistake.
    rels = [p for p in rels if not p.startswith("cards/amour/") and not p.startswith("cards/tarot/")]
    if len(rels) != 130:
        raise RuntimeError(f"130 cartes actives attendues, {len(rels)} trouvées")
    if len(set(rels)) != 130:
        raise RuntimeError("Les 130 chemins d'images actifs ne sont pas uniques")
    paths = [ROOT / p for p in rels]
    missing = [str(p.relative_to(ROOT)) for p in paths if not p.exists()]
    if missing:
        raise FileNotFoundError(f"Cartes actives manquantes: {missing}")
    if paths[2].resolve() != REFERENCE.resolve():
        raise RuntimeError(f"La carte 3 active n'est pas la référence attendue: {paths[2]}")
    return paths


def to_rgb_and_alpha(image: Image.Image) -> tuple[np.ndarray, np.ndarray | None]:
    alpha = None
    if "A" in image.getbands():
        rgba = np.asarray(image.convert("RGBA"), dtype=np.float32) / 255.0
        alpha = rgba[..., 3:4]
        rgb = rgba[..., :3]
    else:
        rgb = np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0
    return rgb, alpha


def luminance(rgb: np.ndarray) -> np.ndarray:
    # Perceptual sRGB luminance is appropriate here because the requested correction is visual brightness.
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def analysis_values(rgb: np.ndarray, alpha: np.ndarray | None) -> np.ndarray:
    h, w = rgb.shape[:2]
    # Ignore the very edge where the gold frame can dominate the statistics.
    y0, y1 = int(round(h * 0.045)), int(round(h * 0.955))
    x0, x1 = int(round(w * 0.045)), int(round(w * 0.955))
    crop = rgb[y0:y1, x0:x1]
    y = luminance(crop)
    mask = (y > 0.025) & (y < 0.985)
    if alpha is not None:
        a = alpha[y0:y1, x0:x1, 0]
        mask &= a > 0.95
    vals = y[mask]
    if vals.size < 1000:
        vals = y.reshape(-1)
    # Keep the job fast and deterministic for 130 high-resolution cards.
    if vals.size > 350_000:
        stride = int(np.ceil(vals.size / 350_000))
        vals = vals[::stride]
    return vals.astype(np.float64, copy=False)


def stats(rgb: np.ndarray, alpha: np.ndarray | None) -> np.ndarray:
    return np.quantile(analysis_values(rgb, alpha), QUANTILES)


def weighted_error(q: np.ndarray, target: np.ndarray) -> float:
    denom = np.maximum(target, 0.08)
    return float(np.sum(WEIGHTS * ((q - target) / denom) ** 2))


def fit_tone(source_q: np.ndarray, target_q: np.ndarray) -> tuple[float, float, float, float]:
    baseline = weighted_error(source_q, target_q)
    best = (baseline, 1.0, 1.0)

    # Independent exposure/gamma search per card. Regularization prevents a scene from being flattened
    # simply because its composition naturally contains more dark or light pixels than Joie.
    gammas = np.linspace(0.62, 1.42, 81)
    scales = np.linspace(0.68, 1.58, 91)
    for gamma in gammas:
        base = np.power(np.maximum(source_q, 1e-6), gamma)
        for scale in scales:
            predicted = np.clip(scale * base, 0.0, 1.0)
            err = weighted_error(predicted, target_q)
            penalty = 0.012 * (np.log(scale) ** 2) + 0.012 * ((gamma - 1.0) ** 2)
            score = err + float(penalty)
            if score < best[0]:
                best = (score, float(gamma), float(scale))

    _, gamma, scale = best
    mapped_q = np.clip(scale * np.power(np.maximum(source_q, 1e-6), gamma), 0.0, 1.0)
    fitted = (1.0 - BLEND_STRENGTH) * source_q + BLEND_STRENGTH * mapped_q
    fitted_error = weighted_error(fitted, target_q)

    # Never make a card objectively farther from the Joie reference.
    if fitted_error >= baseline * 0.995:
        return 1.0, 1.0, baseline, baseline
    return gamma, scale, baseline, fitted_error


def apply_tone(rgb: np.ndarray, gamma: float, scale: float) -> np.ndarray:
    if abs(gamma - 1.0) < 1e-9 and abs(scale - 1.0) < 1e-9:
        return rgb.copy()

    y = luminance(rgb)
    mapped = np.clip(scale * np.power(np.maximum(y, 1e-6), gamma), 0.0, 1.0)

    # Protect absolute blacks and near-whites (including title lettering and frame glints).
    shadow_gate = np.clip((y - 0.018) / 0.085, 0.0, 1.0)
    highlight_gate = np.clip((0.995 - y) / 0.105, 0.0, 1.0)
    local_strength = BLEND_STRENGTH * shadow_gate * highlight_gate
    new_y = y + local_strength * (mapped - y)

    ratio = (new_y + 1e-5) / (y + 1e-5)
    ratio = np.clip(ratio, 0.55, 2.05)
    out = np.clip(rgb * ratio[..., None], 0.0, 1.0)
    return out.astype(np.float32)


def save_preserving_format(path: Path, rgb: np.ndarray, alpha: np.ndarray | None, info: dict) -> None:
    rgb8 = np.clip(np.rint(rgb * 255.0), 0, 255).astype(np.uint8)
    if alpha is not None:
        a8 = np.clip(np.rint(alpha * 255.0), 0, 255).astype(np.uint8)
        data = np.concatenate([rgb8, a8], axis=2)
        image = Image.fromarray(data, mode="RGBA")
    else:
        image = Image.fromarray(rgb8, mode="RGB")

    save_kwargs: dict = {}
    if info.get("icc_profile"):
        save_kwargs["icc_profile"] = info["icc_profile"]
    if info.get("exif"):
        save_kwargs["exif"] = info["exif"]

    suffix = path.suffix.lower()
    if suffix == ".webp":
        save_kwargs.update(quality=96, method=6)
        image.save(path, format="WEBP", **save_kwargs)
    elif suffix == ".png":
        save_kwargs.update(compress_level=6)
        image.save(path, format="PNG", **save_kwargs)
    else:
        raise RuntimeError(f"Format inattendu pour {path}: {suffix}")


def main() -> None:
    cards = active_card_paths()

    with Image.open(REFERENCE) as ref_im:
        ref_rgb, ref_alpha = to_rgb_and_alpha(ref_im)
        reference_q = stats(ref_rgb, ref_alpha)

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, object]] = []

    for card_id, path in enumerate(cards, start=1):
        rel = path.relative_to(ROOT).as_posix()
        with Image.open(path) as im:
            original_size = im.size
            original_info = dict(im.info)
            rgb, alpha = to_rgb_and_alpha(im)

        before_q = stats(rgb, alpha)

        if path.resolve() == REFERENCE.resolve():
            gamma, scale = 1.0, 1.0
            before_error = after_error = weighted_error(before_q, reference_q)
            after_rgb = rgb
            status = "reference_inchangee"
        else:
            gamma, scale, before_error, _ = fit_tone(before_q, reference_q)
            after_rgb = apply_tone(rgb, gamma, scale)
            after_q_preview = stats(after_rgb, alpha)
            after_error = weighted_error(after_q_preview, reference_q)
            if after_error > before_error + 1e-9:
                # Safety net: leave the source untouched if the pixel-level gates defeated the fit.
                gamma, scale = 1.0, 1.0
                after_rgb = rgb
                after_error = before_error
                status = "deja_proche"
            else:
                status = "harmonisee" if (abs(gamma - 1.0) > 1e-6 or abs(scale - 1.0) > 1e-6) else "deja_proche"

            save_preserving_format(path, after_rgb, alpha, original_info)

            with Image.open(path) as check:
                if check.size != original_size:
                    raise RuntimeError(f"Dimensions modifiées pour {rel}: {original_size} -> {check.size}")

        after_q = stats(after_rgb, alpha)
        rows.append(
            {
                "id": card_id,
                "path": rel,
                "status": status,
                "width": original_size[0],
                "height": original_size[1],
                "gamma": f"{gamma:.4f}",
                "exposure_scale": f"{scale:.4f}",
                "q20_before": f"{before_q[0]:.5f}",
                "q50_before": f"{before_q[1]:.5f}",
                "q80_before": f"{before_q[2]:.5f}",
                "q92_before": f"{before_q[3]:.5f}",
                "q20_after": f"{after_q[0]:.5f}",
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
    print(f"Terminé: {changed} cartes ajustées, Joie conservée telle quelle.")
    print("Référence Joie q20/q50/q80/q92:", ", ".join(f"{v:.5f}" for v in reference_q))
    print("Rapport:", REPORT.relative_to(ROOT))


if __name__ == "__main__":
    main()
