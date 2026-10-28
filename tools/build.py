"""Build a portable, single-file game using only Python's standard library."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
html = (root / 'src/shell.html').read_text()
html = html.replace('<link rel="stylesheet" href="src/style.css" />', '<style>\n' + (root / 'src/style.css').read_text() + '\n</style>')
for name in ('engine', 'art', 'game'):
    html = html.replace(f'<script src="src/{name}.js"></script>', '<script>\n' + (root / f'src/{name}.js').read_text() + '\n</script>')
assert 'src/style.css' not in html and '<script src=' not in html
(root / 'index.html').write_text(html)
print('Built index.html: all code, styles, art and audio embedded; no network dependencies.')
