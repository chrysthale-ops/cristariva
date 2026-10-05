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


def detect_card_bbox(im: Image.Image):
    """Repère l'encombrement réel de la carte dans son canevas clair."""
    a = np.asarray(im.convert("RGB"), dtype=np.int16)
    bg = corner_background(im)
    delta = np.max(np.abs(a - bg), axis=2)
    mask = delta > 18

    h, w = mask.shape
    col_counts = mask.sum(axis=0)
    row_counts = mask.sum(axis=1)

    # Le cadre vertical occupe une grande partie de la hauteur. Le médaillon
    # supérieur est plus étroit, d'où un seuil horizontal plus bas pour les lignes.
    xs = np.flatnonzero(col_counts >= max(8, int(h * 0.15)))
    ys = np.flatnonzero(row_counts >= max(8, int(w * 0.09)))

    if len(xs) < 2 or len(ys) < 2:
        xs = np.flatnonzero(col_counts >= max(4, int(h * 0.05)))
        ys = np.flatnonzero(row_counts >= max(4, int(w * 0.04)))

    if len(xs) < 2 or len(ys) < 2:
        raise RuntimeError("Impossible de repérer le cadre de la carte")

    return (int(xs[0]), int(ys[0]), int(xs[-1]) + 1, int(ys[-1]) + 1)


def dimensions(box):
    return box[2] - box[0], box[3] - box[1]


def close_box(a, b, tol=2):
    return max(abs(x - y) for x, y in zip(a, b)) <= tol


def normalize_one(path: Path, ref_size, ref_box):
    im = Image.open(path).convert("RGB")
    if im.size != ref_size:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {ref_size}")

    before = detect_card_bbox(im)
    if close_box(before, ref_box):
        return False, before, before

    src_w, src_h = dimensions(before)
    dst_w, dst_h = dimensions(ref_box)
    scale_x, scale_y = dst_w / src_w, dst_h / src_h

    # Garde-fou : cette correction ne doit enlever que des marges de canevas,
    # jamais effectuer un recadrage massif de l'illustration.
    if not (0.82 <= scale_x <= 1.22 and 0.82 <= scale_y <= 1.22):
        raise RuntimeError(
            f"{path.name}: écart trop important ({before} -> {ref_box}, "
            f"échelles {scale_x:.3f}/{scale_y:.3f})"
        )

    crop = im.crop(before).resize((dst_w, dst_h), Image.Resampling.LANCZOS)
    bg = tuple(int(round(v)) for v in corner_background(im))
    result = Image.new("RGB", ref_size, bg)
    result.paste(crop, (ref_box[0], ref_box[1]))
    result.save(path, "WEBP", quality=95, method=6)

    check = Image.open(path).convert("RGB")
    after = detect_card_bbox(check)
    if not close_box(after, ref_box, tol=3):
        raise RuntimeError(f"{path.name}: contrôle final incorrect {after}, cible {ref_box}")
    return True, before, after


def main():
    missing = [p.name for p in EXPECTED if not p.exists()]
    if missing:
        raise RuntimeError(f"Cartes manquantes: {', '.join(missing)}")

    reference = Image.open(REFERENCE).convert("RGB")
    ref_size = reference.size
    ref_box = detect_card_bbox(reference)
    rw, rh = dimensions(ref_box)

    print(f"Référence 020.webp: canevas={ref_size}, cadre={ref_box}, taille={rw}x{rh}")

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

    # Contrôle global : 80 cartes, même canevas et même encombrement visuel.
    for path in EXPECTED:
        im = Image.open(path).convert("RGB")
        if im.size != ref_size:
            raise RuntimeError(f"{path.name}: taille finale incorrecte {im.size}")
        box = detect_card_bbox(im)
        if not close_box(box, ref_box, tol=3):
            raise RuntimeError(f"{path.name}: cadre final {box}, attendu {ref_box}")

    print(f"Cartes corrigées: {len(changed)}")
    print(" ".join(changed) if changed else "Aucune carte à corriger")
    print(f"Cartes déjà conformes: {len(unchanged)}")


if __name__ == "__main__":
    main()
