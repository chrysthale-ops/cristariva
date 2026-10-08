"""Build small catalogue images from the current validated deck sources."""
import hashlib
import io
import json
import re
from pathlib import Path
from urllib.parse import unquote

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'cards/catalog-thumbs/v1'


def array_after(file, marker):
    text = (ROOT / file).read_text(encoding='utf-8')
    return json.JSONDecoder().raw_decode(text.split(marker, 1)[1].lstrip())[0]


def sources():
    data = array_after('index.html', 'const DATA =')
    base = [c for group in ('main', 'relation', 'dating') for c in data[group]]
    love = array_after('oracle-amour-data.js', 'const all=')
    majors = [c for c in array_after('tarot-divinatoire-data.js', 'const cards=') if c['id'] <= 22]
    loader = (ROOT / 'tarot-minor-sprite-loader.js').read_text(encoding='utf-8')
    names = re.findall(r'^\s*(\d+):"([^"]+)"', loader, re.M)
    minors = [{'id': int(i), 'image': './cards/tarot/cartes mineures HD/' + name} for i, name in names]
    decks = {'cristariva': base, 'amour': love, 'tarot': majors + minors}
    for deck, expected in [('cristariva', 130), ('amour', 80), ('tarot', 78)]:
        assert len(decks[deck]) == expected, (deck, len(decks[deck]))
        assert len({c['id'] for c in decks[deck]}) == expected
    return decks


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {'version': 1, 'decks': {}, 'metrics': {}}
    unique = {}
    for deck, cards in sources().items():
        records = {}
        before = after = 0
        for c in cards:
            record = {}
            for lang in ('fr', 'en'):
                source = c.get('imageEn') if lang == 'en' else c.get('image')
                source = source or c['image']
                file = ROOT / unquote(source.split('?', 1)[0].removeprefix('./'))
                raw = file.read_bytes()
                assert raw, f'Empty source: {file}'
                digest = hashlib.sha256(raw).hexdigest()[:16]
                key = (deck, c['id'], digest)
                if key not in unique:
                    with Image.open(io.BytesIO(raw)) as source_image:
                        image = ImageOps.exif_transpose(source_image).convert('RGB')
                        image.thumbnail((320, 500), Image.Resampling.LANCZOS)
                        buffer = io.BytesIO()
                        image.save(buffer, format='WEBP', quality=60, method=6)
                        encoded = buffer.getvalue()
                        assert 1000 < len(encoded) < 80000, (file, len(encoded))
                        Image.open(io.BytesIO(encoded)).verify()
                        name = f'{deck}/{c["id"]:03d}-{digest}.webp'
                        target = OUT / name
                        target.parent.mkdir(parents=True, exist_ok=True)
                        temp = target.with_suffix('.tmp')
                        temp.write_bytes(encoded)
                        temp.replace(target)
                        unique[key] = {'src': './cards/catalog-thumbs/v1/' + name, 'width': image.width, 'height': image.height}
                record[lang] = unique[key]
                if lang == 'fr':
                    before += len(raw)
                    after += (ROOT / record[lang]['src'].removeprefix('./')).stat().st_size
            records[str(c['id'])] = record
        manifest['decks'][deck] = records
        manifest['metrics'][deck] = {'count': len(cards), 'source_bytes': before, 'thumbnail_bytes': after}
    # Loaded before catalogue renderers, without an extra network round trip.
    (ROOT / 'catalog-thumbnails-data.js').write_text('window.CR_CATALOG_THUMBNAILS=' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(json.dumps(manifest['metrics'], ensure_ascii=False))


if __name__ == '__main__':
    build()
