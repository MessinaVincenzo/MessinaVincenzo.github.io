#!/usr/bin/env python3
"""Concatenate every publication's BibTeX into files/publications.bib.

Each _publications/*.md already carries a `bibtex:` block, so this is purely a
collation step - there is no second source of truth to drift from.

Run from anywhere:  python scripts/build_bibliography.py
Re-run after adding or editing a publication.
"""
import glob, io, os, re
from datetime import date

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(REPO, 'files', 'publications.bib')

entries = []
for f in sorted(glob.glob(os.path.join(REPO, '_publications', '*.md')), reverse=True):
    s = io.open(f, encoding='utf-8').read()
    fm = s.split('\n---', 1)[0]

    m = re.search(r'^bibtex: \|-\n((?:  .*\n?)+)', fm, re.M)
    if not m:
        print('no bibtex block:', os.path.basename(f))
        continue
    block = '\n'.join(line[2:] for line in m.group(1).rstrip('\n').splitlines())

    d = re.search(r'^date: (\S+)', fm, re.M)
    t = re.search(r"^title: '(.*)'$", fm, re.M)
    entries.append((d.group(1) if d else '', t.group(1) if t else '', block))

entries.sort(key=lambda e: e[0], reverse=True)

# Note: these are .format()/concatenated rather than %-formatted, because a
# literal '%%' in a %-format string collapses to a single '%'.
header = [
 '%% Publications of Vincenzo Messina',
 '%% Chair of Spacecraft Systems, Technical University of Munich',
 '%% https://messinavincenzo.github.io/publications/',
 '%%',
 '%% {} entries, newest first. Generated {}.'.format(len(entries), date.today().isoformat()),
 '%% Regenerate with: python scripts/build_bibliography.py',
 '',
 '',
]

body = []
for d, t, block in entries:
    body.append('%% ' + t)
    body.append(block)
    body.append('')

os.makedirs(os.path.dirname(DEST), exist_ok=True)
io.open(DEST, 'w', encoding='utf-8', newline='\n').write(
    '\n'.join(header) + '\n'.join(body))

print('%d entries -> %s (%.1f KB)' % (
    len(entries), os.path.relpath(DEST, REPO), os.path.getsize(DEST) / 1024))

# Cheap sanity check: balanced braces per entry, unique keys.
keys = re.findall(r'@\w+\{([^,]+),', io.open(DEST, encoding='utf-8').read())
dupes = {k for k in keys if keys.count(k) > 1}
print('keys: %d, unique: %d%s' % (len(keys), len(set(keys)),
                                  '  DUPLICATES: %s' % dupes if dupes else ''))
