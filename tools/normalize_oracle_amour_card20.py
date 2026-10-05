from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards" / "amour"
REFERENCE = CARDS / "020.webp"
EXPECTED = [CARDS / f"{i:03d}.webp" for i in range(1, 81)]


def corner_background(im: Image.Image) -> np.ndarray:
    a = np.asarray(im.convert("RGB"), dtype=np.int16)
    h, w, _ = a.shape
    s = max(8, min(h, w) // 50)
    patches = np.concatenate(
        [
            a[:s, :s].reshape(-1, 3),
            a[:s, -s:].reshape(-1, 3),
            a[-s:, :s].reshape(-1, 3),
            a[-s:, -s:].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(patches, axis=0)


def longest_run(indices: np.ndarray):
    if len(indices) == 0:
        return None
    best = cur_start = cur_end = int(indices[0])
    best_start = best_end = best
    for raw in indices[1:]:
        value = int(raw)
        if value == cur_end + 1:
            cur_end = value
        else:
            if cur_end - cur_start > best_end - best_start:
                best_start, best_end = cur_start, cur_end
            cur_start = cur_end = value
    if cur_end - cur_start > best_end - best_start:
        best_start, best_end = cur_start, cur_end
    return best_start, best_end


def detect_visual_bbox(im: Image.Image):
    """Mesure la taille *apparente* du cadre, pas seulement le canevas.

    Les cartes 21+ avaient le même fichier 512x768 que la carte 20, mais leur
    véritable cadre était environ 3 % plus petit, entouré d'une marge claire.
    L'ancien détecteur était trompé par quelques pixels décoratifs isolés dans
    cette marge. On repère désormais le plus long bloc continu sombre du cadre.
    """
    a = np.asarray(im.convert("RGB"), dtype=np.int16)
    gray = a.mean(axis=2)
    h, w = gray.shape

    # Hauteur apparente : les bords gauche/droit sont présents sur quasiment
    # toute la hauteur de la carte et restent fiables malgré le cartouche central.
    side = np.concatenate(
        [gray[:, : max(40, int(w * 0.10))], gray[:, -max(40, int(w * 0.10)) :]],
        axis=1,
    )
    row_strength = (side < 220).mean(axis=1)
    yr = longest_run(np.flatnonzero(row_strength >= 0.30))

    # Largeur apparente : mesure dans la grande zone centrale de l'illustration.
    y0, y1 = int(h * 0.07), int(h * 0.91)
    col_strength = (gray[y0:y1, :] < 220).mean(axis=0)
    xr = longest_run(np.flatnonzero(col_strength >= 0.30))

    if xr is None or yr is None:
        raise RuntimeError("Impossible de repérer le cadre visuel de la carte")

    x0, x1 = xr
    top, bottom = yr
    if (x1 - x0 + 1) < w * 0.75 or (bottom - top + 1) < h * 0.80:
        raise RuntimeError(
            f"Cadre visuel détecté trop petit: x={xr}, y={yr}, canevas={im.size}"
        )

    return (x0, top, x1 + 1, bottom + 1)


def dimensions(box):
    return box[2] - box[0], box[3] - box[1]


def close_box(a, b, tol=2):
    return max(abs(x - y) for x, y in zip(a, b)) <= tol


def normalize_one(path: Path, ref_size, ref_box):
    im = Image.open(path).convert("RGB")
    if im.size != ref_size:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {ref_size}")

    before = detect_visual_bbox(im)
    if close_box(before, ref_box):
        return False, before, before

    src_w, src_h = dimensions(before)
    dst_w, dst_h = dimensions(ref_box)
    scale_x, scale_y = dst_w / src_w, dst_h / src_h

    # L'écart observé est faible (environ 3 % pour les cartes 21+). Un écart
    # supérieur à 10 % indique une mauvaise détection et bloque la modification.
    if not (0.90 <= scale_x <= 1.10 and 0.90 <= scale_y <= 1.10):
        raise RuntimeError(
            f"{path.name}: écart visuel trop important ({before} -> {ref_box}, "
            f"échelles {scale_x:.3f}/{scale_y:.3f})"
        )

    inv_x = 1.0 / scale_x
    inv_y = 1.0 / scale_y
    src_x0, src_y0 = before[0], before[1]
    dst_x0, dst_y0 = ref_box[0], ref_box[1]
    coeffs = (
        inv_x,
        0.0,
        src_x0 - dst_x0 * inv_x,
        0.0,
        inv_y,
        src_y0 - dst_y0 * inv_y,
    )

    bg = tuple(int(round(v)) for v in corner_background(im))
    result = im.transform(
        ref_size,
        Image.Transform.AFFINE,
        coeffs,
        resample=Image.Resampling.BICUBIC,
        fillcolor=bg,
    )
    result.save(path, "WEBP", quality=95, method=6)

    check = Image.open(path).convert("RGB")
    after = detect_visual_bbox(check)
    if not close_box(after, ref_box, tol=3):
        raise RuntimeError(f"{path.name}: contrôle final incorrect {after}, cible {ref_box}")
    return True, before, after


def main():
    missing = [p.name for p in EXPECTED if not p.exists()]
    if missing:
        raise RuntimeError(f"Cartes manquantes: {', '.join(missing)}")

    reference = Image.open(REFERENCE).convert("RGB")
    ref_size = reference.size
    ref_box = detect_visual_bbox(reference)
    rw, rh = dimensions(ref_box)

    print(f"Référence 020.webp: canevas={ref_size}, cadre visuel={ref_box}, taille={rw}x{rh}")

    changed = []
    unchanged = []
    for path in EXPECTED:
        if path == REFERENCE:
            unchanged.append(path.name)
            continue
        did_change, before, after = normalize_one(path, ref_size, ref_box)
        if did_change:
            changed.append(path.name)
            print(f"CORRIGÉ {path.name}: {before} -> {after}")
        else:
            unchanged.append(path.name)

    for path in EXPECTED:
        im = Image.open(path).convert("RGB")
        if im.size != ref_size:
            raise RuntimeError(f"{path.name}: taille finale incorrecte {im.size}")
        box = detect_visual_bbox(im)
        if not close_box(box, ref_box, tol=3):
            raise RuntimeError(f"{path.name}: cadre visuel final {box}, attendu {ref_box}")

    print(f"Cartes corrigées: {len(changed)}")
    print(" ".join(changed) if changed else "Aucune carte à corriger")
    print(f"Cartes déjà conformes: {len(unchanged)}")


if __name__ == "__main__":
    main()
