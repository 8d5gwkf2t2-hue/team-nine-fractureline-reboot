"""Embed pinned vendor code and illustrated assets into a file://-safe single HTML."""
from pathlib import Path
import base64
import json
import struct
root = Path(__file__).resolve().parent.parent
html = (root / 'src/shell.html').read_text()
manifest = json.loads((root / 'assets/manifest.json').read_text())
for hero, config in manifest['characters'].items():
    png = (root / 'assets' / manifest['images'][hero]).read_bytes()
    assert png[:8] == b'\x89PNG\r\n\x1a\n', f'{hero}: PNG expected'
    width, height = struct.unpack('>II', png[16:24])
    assert png[25] == 6, f'{hero}: RGBA transparency required'
    for state in ('idle', 'attack', 'damage', 'defense', 'special'):
        assert state in config['frames'], f'{hero}: missing {state}'
    for frame in config['frames'].values():
        for part in [frame] + frame.get('layers', []):
            x, y, w, h = part['rect']
            assert x >= 0 and y >= 0 and w > 0 and h > 0 and x+w <= width and y+h <= height, f'{hero}: frame out of bounds'
manifest['images'] = {key: 'data:image/png;base64,' + base64.b64encode((root / 'assets' / file).read_bytes()).decode('ascii') for key, file in manifest['images'].items()}
html = html.replace('<!-- ASSET_BUNDLE -->', '<script>window.GameAssets=' + json.dumps(manifest, separators=(',', ':')) + ';</script>')
html = html.replace('<link rel="stylesheet" href="src/style.css" />', '<style>\n' + (root / 'src/style.css').read_text() + '\n</style>')
for src in ['assets/vendor/pixi-legacy-7.4.3.min.js'] + [f'src/{name}.js' for name in ('engine', 'legacy-scene', 'art', 'game')]:
    # Escape literal closing script sequences without changing JS runtime strings.
    code = (root / src).read_text().replace('</script', '<\\/script')
    code = '\n'.join(line.rstrip() for line in code.split('\n'))
    html = html.replace(f'<script src="{src}"></script>', '<script>\n' + code + '\n</script>')
assert 'src/style.css' not in html and '<script src=' not in html
(root / 'index.html').write_text(html)
print(f'Built index.html ({len(html)/1024/1024:.1f} MiB): illustrated assets and PixiJS embedded, no network needed.')
