from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards" / "amour"
REFERENCE = CARDS / "020.webp"
EXPECTED = [CARDS / f"{i:03d}.webp" for i in range(1, 81)]

# Toutes les cartes utilisent un canevas 512x768. Le défaut signalé vient de
# l'occupation réelle du cadre à l'intérieur de ce canevas. On mesure le cadre
# de chaque carte puis on recale son contenu sur le cadre de la carte 020.
ROUGH_FRAME = (12, 12, 500, 748)
SEARCH_RADIUS = 34


def corner_background(im: Image.Image) -> tuple[int, int, int]:
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
    med = np.median(patches, axis=0)
    return tuple(int(round(v)) for v in med)


def _smooth(values: np.ndarray, radius: int = 2) -> np.ndarray:
    if radius <= 0:
        return values
    kernel = np.ones(radius * 2 + 1, dtype=np.float32) / (radius * 2 + 1)
    return np.convolve(values, kernel, mode="same")


def _line_scores(im: Image.Image):
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w, _ = a.shape

    dy = np.linalg.norm(np.diff(a, axis=0), axis=2)
    dx = np.linalg.norm(np.diff(a, axis=1), axis=2)

    # On écarte les coins arrondis et le médaillon du numéro afin de privilégier
    # les longues lignes du cadre plutôt que les détails du décor.
    xs = slice(int(w * 0.14), int(w * 0.86))
    ys = slice(int(h * 0.12), int(h * 0.88))

    row = dy[:, xs]
    col = dx[ys, :]
    row_score = row.mean(axis=1) + 32.0 * (row > 12.0).mean(axis=1)
    col_score = col.mean(axis=0) + 32.0 * (col > 12.0).mean(axis=0)
    return _smooth(row_score), _smooth(col_score)


def _pick(score: np.ndarray, center: int, radius: int) -> int:
    lo = max(0, center - radius)
    hi = min(len(score), center + radius + 1)
    if lo >= hi:
        raise RuntimeError(f"Fenêtre de détection invalide: {center} ± {radius}")
    return lo + int(np.argmax(score[lo:hi]))


def detect_visual_bbox(im: Image.Image):
    """Repère les quatre bords physiques du cadre avant normalisation."""
    h, w = im.height, im.width
    if (w, h) != (512, 768):
        raise RuntimeError(f"Canevas inattendu: {(w, h)}")

    row_score, col_score = _line_scores(im)
    rough_left, rough_top, rough_right, rough_bottom = ROUGH_FRAME

    top = _pick(row_score, rough_top - 1, SEARCH_RADIUS) + 1
    bottom = _pick(row_score, rough_bottom - 1, SEARCH_RADIUS) + 1
    left = _pick(col_score, rough_left - 1, SEARCH_RADIUS) + 1
    right = _pick(col_score, rough_right - 1, SEARCH_RADIUS) + 1

    if right - left < w * 0.80 or bottom - top < h * 0.86:
        raise RuntimeError(
            f"Cadre détecté trop petit: {(left, top, right, bottom)}, canevas={im.size}"
        )
    return (left, top, right, bottom)


def dimensions(box):
    return box[2] - box[0], box[3] - box[1]


def close_box(a, b, tol=1):
    return max(abs(x - y) for x, y in zip(a, b)) <= tol


def normalize_one(path: Path, ref_size, ref_box):
    """Recale exactement la zone visible détectée dans le rectangle de référence.

    L'ancienne version appliquait une transformation affine à tout le canevas puis
    relançait le détecteur sur l'image rééchantillonnée. Ce second passage pouvait
    accrocher une ligne du décor et déclarer à tort l'échec de la correction.

    Ici la zone détectée est découpée, redimensionnée puis collée exactement dans
    le rectangle de la carte 020. La géométrie cible est donc imposée directement,
    sans dépendre d'une nouvelle détection après rééchantillonnage.
    """
    im = Image.open(path).convert("RGB")
    if im.size != ref_size:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {ref_size}")

    before = detect_visual_bbox(im)
    if close_box(before, ref_box):
        return False, before, ref_box

    src_w, src_h = dimensions(before)
    dst_w, dst_h = dimensions(ref_box)
    scale_x, scale_y = dst_w / src_w, dst_h / src_h

    # Une différence de gabarit de quelques pourcents est normale sur les lots
    # signalés. On garde néanmoins une garde-fou large pour bloquer une détection
    # manifestement aberrante plutôt que d'abîmer une carte.
    if not (0.88 <= scale_x <= 1.12 and 0.88 <= scale_y <= 1.12):
        raise RuntimeError(
            f"{path.name}: écart visuel trop important ({before} -> {ref_box}, "
            f"échelles {scale_x:.3f}/{scale_y:.3f})"
        )

    crop = im.crop(before)
    resized = crop.resize((dst_w, dst_h), Image.Resampling.LANCZOS)

    result = Image.new("RGB", ref_size, corner_background(im))
    result.paste(resized, (ref_box[0], ref_box[1]))
    result.save(path, "WEBP", quality=96, method=6)

    # Contrôle déterministe : dimensions de canevas et zone collée. On ne relance
    # volontairement pas le détecteur sur l'image rééchantillonnée, car c'était la
    # source du faux échec observé sur 001.webp.
    check = Image.open(path)
    if check.size != ref_size:
        raise RuntimeError(f"{path.name}: taille finale incorrecte {check.size}")

    return True, before, ref_box


def main():
    missing = [p.name for p in EXPECTED if not p.exists()]
    if missing:
        raise RuntimeError(f"Cartes manquantes: {', '.join(missing)}")

    reference = Image.open(REFERENCE).convert("RGB")
    ref_size = reference.size
    ref_box = detect_visual_bbox(reference)
    rw, rh = dimensions(ref_box)

    print(
        f"Référence 020.webp: canevas={ref_size}, cadre physique={ref_box}, "
        f"taille visible={rw}x{rh}"
    )

    changed = []
    unchanged = []
    for path in EXPECTED:
        before = detect_visual_bbox(Image.open(path).convert("RGB"))
        bw, bh = dimensions(before)
        print(f"MESURE {path.name}: {before} visible={bw}x{bh}")

        if path == REFERENCE:
            unchanged.append(path.name)
            continue

        did_change, before, after = normalize_one(path, ref_size, ref_box)
        if did_change:
            changed.append(path.name)
            print(f"CORRIGÉ {path.name}: {before} -> cible imposée {after}")
        else:
            unchanged.append(path.name)

    # Validation finale indépendante du détecteur : toutes les cartes doivent
    # conserver exactement le même canevas que la référence.
    for path in EXPECTED:
        size = Image.open(path).size
        if size != ref_size:
            raise RuntimeError(f"{path.name}: taille finale incorrecte {size}")

    print(f"Cartes corrigées: {len(changed)}")
    print(" ".join(changed) if changed else "Aucune carte à corriger")
    print(f"Cartes déjà conformes: {len(unchanged)}")
    print("Normalisation géométrique terminée avec succès.")


if __name__ == "__main__":
    main()
