from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "cards" / "amour"
REFERENCE = CARDS / "020.webp"
EXPECTED = [CARDS / f"{i:03d}.webp" for i in range(1, 81)]

# Les cartes sont toutes sur un canevas 512x768. Le défaut signalé ne vient pas
# du canevas mais de la position réelle du cadre : sur certaines cartes, le bord
# inférieur (et parfois supérieur) est décalé de quelques pixels. Le précédent
# contrôle par seuil de luminosité pouvait confondre le décor avec le cadre.
# On repère désormais les quatre lignes physiques du cadre par leurs transitions
# de pixels, dans une fenêtre volontairement étroite autour du gabarit validé.
ROUGH_FRAME = (12, 12, 500, 748)
SEARCH_RADIUS = 34


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


def _smooth(values: np.ndarray, radius: int = 2) -> np.ndarray:
    if radius <= 0:
        return values
    kernel = np.ones(radius * 2 + 1, dtype=np.float32) / (radius * 2 + 1)
    return np.convolve(values, kernel, mode="same")


def _line_scores(im: Image.Image):
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w, _ = a.shape

    # Gradient RGB plutôt qu'un simple seuil sombre : le filet doré/blanc du
    # cadre est ainsi détecté même s'il est très clair.
    dy = np.linalg.norm(np.diff(a, axis=0), axis=2)
    dx = np.linalg.norm(np.diff(a, axis=1), axis=2)

    # Écarter les coins arrondis et le médaillon du numéro : on recherche une
    # ligne présente sur une grande partie du bord et non un détail local.
    xs = slice(int(w * 0.14), int(w * 0.86))
    ys = slice(int(h * 0.12), int(h * 0.88))

    # Une vraie ligne de cadre produit à la fois un gradient moyen et une grande
    # proportion de pixels en transition. Cette combinaison résiste bien aux
    # fleurs, lanternes et textes du décor.
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
    """Repère les quatre bords physiques du cadre de la carte.

    Contrairement à l'ancien détecteur, cette mesure ne dépend pas de la quantité
    de pixels sombres dans l'illustration. Elle suit les lignes du cadre elles-mêmes,
    ce qui permet de distinguer des écarts de longueur de quelques pixels.
    """
    h, w = im.height, im.width
    if (w, h) != (512, 768):
        raise RuntimeError(f"Canevas inattendu: {(w, h)}")

    row_score, col_score = _line_scores(im)
    rough_left, rough_top, rough_right, rough_bottom = ROUGH_FRAME

    # diff(axis=0) indexe la transition entre y et y+1 : +1 restitue la
    # coordonnée du bord entrant. Idem horizontalement.
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
    im = Image.open(path).convert("RGB")
    if im.size != ref_size:
        raise RuntimeError(f"{path.name}: canevas {im.size}, attendu {ref_size}")

    before = detect_visual_bbox(im)
    if close_box(before, ref_box):
        return False, before, before

    src_w, src_h = dimensions(before)
    dst_w, dst_h = dimensions(ref_box)
    scale_x, scale_y = dst_w / src_w, dst_h / src_h

    # La correction doit rester un recalage léger. Au-delà de 8 %, on bloque
    # plutôt que de risquer de déformer une illustration mal détectée.
    if not (0.92 <= scale_x <= 1.08 and 0.92 <= scale_y <= 1.08):
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
        # PIL n'accepte pas LANCZOS pour une transformation affine.
        resample=Image.Resampling.BICUBIC,
        fillcolor=bg,
    )
    result.save(path, "WEBP", quality=96, method=6)

    check = Image.open(path).convert("RGB")
    after = detect_visual_bbox(check)
    if not close_box(after, ref_box, tol=2):
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
            print(f"CORRIGÉ {path.name}: {before} -> {after}")
        else:
            unchanged.append(path.name)

    for path in EXPECTED:
        im = Image.open(path).convert("RGB")
        if im.size != ref_size:
            raise RuntimeError(f"{path.name}: taille finale incorrecte {im.size}")
        box = detect_visual_bbox(im)
        if not close_box(box, ref_box, tol=2):
            raise RuntimeError(f"{path.name}: cadre final {box}, attendu {ref_box}")

    print(f"Cartes corrigées: {len(changed)}")
    print(" ".join(changed) if changed else "Aucune carte à corriger")
    print(f"Cartes déjà conformes: {len(unchanged)}")


if __name__ == "__main__":
    main()
