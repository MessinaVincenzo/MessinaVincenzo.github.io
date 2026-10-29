#!/usr/bin/env python3
"""Build _data/network.json: the co-author graph and the conference map pins.

Both visualisations on /research-map/ read this one file, so the page stays
declarative and the numbers can never drift from _publications/.

Run from anywhere:  python scripts/build_network.py
Re-run after adding or editing anything in _publications/, or /research-map/
will keep showing the previous figures.
"""
import glob, io, os, re, json
from collections import Counter, defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = 'Vincenzo Messina'

# Same person, two spellings across proceedings. Collapse to one node.
ALIAS = {
    'Clemente Javier Juan Oliver': 'Clemente J. Juan Oliver',
    'Federico Sofio Avogadro': 'Federico Sofio',
    'C. Ryan': 'Charles N. Ryan',
}

# Where each venue actually met. Degrees north / east.
PLACES = {
    'Southampton, United Kingdom': (50.91,  -1.40),
    'Estoril, Portugal':           (38.71,  -9.40),
    'Baku, Azerbaijan':            (40.41,  49.87),
    'Milan, Italy':                (45.46,   9.19),
    'Orlando, USA':                (28.54, -81.38),
    'Toulouse, France':            (43.60,   1.44),
    'Paphos, Cyprus':              (34.78,  32.42),
    'Tempe, USA':                  (33.43,-111.94),
    'Singapore':                   ( 1.35, 103.82),
    'Munich, Germany':             (48.14,  11.58),
    'Bavarian Forest, Germany':    (48.95,  13.40),
    'Raitenhaslach, Germany':      (48.12,  12.84),
}


def fm_block(fm, key):
    """Pull a YAML list that sits under `key:` and stops at the next key."""
    m = re.search(r'^%s:\s*$' % re.escape(key), fm, re.M)
    if not m:
        return []
    out = []
    for line in fm[m.end():].splitlines()[1:] if False else fm[m.end():].splitlines():
        if not line.strip():
            continue
        if re.match(r'^\s+-\s', line):
            out.append(re.sub(r"^\s+-\s*'?(.*?)'?\s*$", r'\1', line))
        elif re.match(r'^\S', line):
            break
    return out


def scalar(fm, key):
    m = re.search(r"^%s:\s*'?(.*?)'?\s*$" % re.escape(key), fm, re.M)
    return m.group(1) if m else ''


papers = []
for f in sorted(glob.glob(os.path.join(REPO, '_publications', '*.md'))):
    s = io.open(f, encoding='utf-8').read()
    fm = s.split('\n---', 1)[0]
    authors = [ALIAS.get(a, a) for a in fm_block(fm, 'author_list')]
    papers.append(dict(
        authors=authors,
        title=scalar(fm, 'title'),
        venue=scalar(fm, 'venue_short'),
        location=scalar(fm, 'location'),
        year=scalar(fm, 'date')[:4],
        category=scalar(fm, 'category'),
        # Take the permalink straight from the front matter. Deriving it from
        # the file path breaks on Windows, where the separator is a backslash.
        url=scalar(fm, 'permalink'),
    ))

assert papers, 'no publications parsed'

# ---- co-author graph -------------------------------------------------------
shared = Counter()           # co-author -> papers shared with Vincenzo
together = Counter()         # unordered pair -> papers shared (any two authors)
titles = defaultdict(list)

for p in papers:
    au = p['authors']
    for a in au:
        if a != V:
            shared[a] += 1
            titles[a].append({'t': p['title'], 'y': p['year'], 'u': p['url']})
    for i in range(len(au)):
        for j in range(i + 1, len(au)):
            together[tuple(sorted((au[i], au[j])))] += 1

nodes = [{'id': V, 'n': len(papers), 'group': 'me'}]
for a, c in shared.most_common():
    nodes.append({'id': a, 'n': c, 'group': 'close' if c >= 3 else 'other',
                  'papers': titles[a]})

ids = {n['id'] for n in nodes}
links = [{'s': a, 't': b, 'w': w} for (a, b), w in together.items()
         if a in ids and b in ids]

# ---- conference map pins ---------------------------------------------------
by_place = defaultdict(lambda: {'events': [], 'years': set()})
for p in papers:
    if not p['location']:
        continue
    e = by_place[p['location']]
    e['events'].append({'kind': 'paper', 'venue': p['venue'],
                        'title': p['title'], 'year': p['year'], 'url': p['url']})
    e['years'].add(p['year'])

# Travel that produced no paper of its own but belongs on the map.
EXTRA = [
    ('Tempe, USA', 'Arizona State University', 'Visiting Scholar with Dr. Paul Grogan',
     '2025', '/posts/2025/08/visiting-scholar-arizona-state/', 'visit'),
    ('Singapore', 'TUM Asia', 'Lecturing Space Mission Design', '2026',
     '/posts/2026/09/teaching-at-tum-asia-singapore/', 'teaching'),
    ('Munich, Germany', 'TUM, Chair of Spacecraft Systems', 'Home institution',
     '2023', '', 'base'),
]
for loc, venue, title, year, url, kind in EXTRA:
    e = by_place[loc]
    e['events'].append({'kind': kind, 'venue': venue, 'title': title,
                        'year': year, 'url': url})
    e['years'].add(year)

pins = []
for loc, e in by_place.items():
    if loc not in PLACES:
        print('WARNING: no coordinates for', loc)
        continue
    lat, lon = PLACES[loc]
    pins.append({'place': loc, 'lat': lat, 'lon': lon,
                 'n': len(e['events']),
                 'first': min(e['years']), 'last': max(e['years']),
                 'events': sorted(e['events'], key=lambda x: x['year'])})
pins.sort(key=lambda p: (-p['n'], p['place']))

out = {
    'generated_from': '_publications/*.md and _posts/*.md',
    'totals': {
        'papers': len(papers),
        'coauthors': len(shared),
        'places': len(pins),
        'venues': len({p['venue'] for p in papers if p['venue']}),
    },
    'nodes': nodes,
    'links': links,
    'pins': pins,
}

dest = os.path.join(REPO, '_data', 'network.json')
io.open(dest, 'w', encoding='utf-8', newline='\n').write(
    json.dumps(out, indent=1, ensure_ascii=False) + '\n')

print('papers      :', len(papers))
print('co-authors  :', len(shared))
print('graph nodes :', len(nodes))
print('graph links :', len(links))
print('map pins    :', len(pins))
print('\ntop co-authors:')
for a, c in shared.most_common(10):
    print('  %2d  %s' % (c, a))
print('\npins:')
for p in pins:
    print('  %-28s %2d events  %s-%s' % (p['place'], p['n'], p['first'], p['last']))
print('\nwrote', dest)
