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


def detect_visual_bbox(im: Image.Image):
    """Repère le corps visuel réellement occupé par la carte.

    L'ancien contrôle suivait aussi les petits éléments décoratifs isolés dans les
    marges. Il pouvait donc déclarer deux cartes conformes alors que l'une restait
    visiblement plus courte. Ici on exige qu'une ligne/colonne soit occupée sur une
    grande partie du cadre. Pour la hauteur, on mesure surtout les bandes latérales
    afin que le cartouche blanc du titre ne fausse pas le bas de la carte.
    """
    a = np.asarray(im.convert("RGB"), dtype=np.int16)
    bg = corner_background(im)
    delta = np.max(np.abs(a - bg), axis=2)
    mask = delta > 18

    h, w = mask.shape

    y0, y1 = int(h * 0.10), int(h * 0.90)
    frac_x = mask[y0:y1].mean(axis=0)
    xs = np.flatnonzero(frac_x >= 0.55)

    left = mask[:, int(w * 0.05):int(w * 0.35)]
    right = mask[:, int(w * 0.65):int(w * 0.95)]
    side_bands = np.concatenate([left, right], axis=1)
    frac_y = side_bands.mean(axis=1)
    ys = np.flatnonzero(frac_y >= 0.55)

    if len(xs) < 2 or len(ys) < 2:
        raise RuntimeError("Impossible de repérer le corps visuel de la carte")

    return (int(xs[0]), int(ys[0]), int(xs[-1]) + 1, int(ys[-1]) + 1)


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

    print(f"Référence 020.webp: canevas={ref_size}, corps visuel={ref_box}, taille={rw}x{rh}")

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
            raise RuntimeError(f"{path.name}: corps visuel final {box}, attendu {ref_box}")

    print(f"Cartes corrigées: {len(changed)}")
    print(" ".join(changed) if changed else "Aucune carte à corriger")
    print(f"Cartes déjà conformes: {len(unchanged)}")


if __name__ == "__main__":
    main()
