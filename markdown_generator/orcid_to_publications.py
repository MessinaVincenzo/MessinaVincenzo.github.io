#!/usr/bin/env python3
"""Generate _publications entries from a public ORCID record.

Reads the ORCID public API (no authentication required) and writes one
markdown file per work into _publications/.

Works that ORCID has no publication year for are written with
`published: false`. They would otherwise render as "Published in , 1900",
because _includes/archive-single.html falls back to 1900-01-01 for a
missing date. Fill in the year and venue, then flip the flag.

Usage:
    python markdown_generator/orcid_to_publications.py [ORCID_ID]
"""

import json
import os
import re
import sys
import urllib.request

ORCID_ID = sys.argv[1] if len(sys.argv) > 1 else "0009-0003-2626-635X"
API = "https://pub.orcid.org/v3.0"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "_publications")

# ORCID work types -> keys of `publication_category` in _config.yml
CATEGORY = {
    "journal-article": "manuscripts",
    "conference-paper": "conferences",
    "book": "books",
    "book-chapter": "books",
    "dissertation-thesis": "theses",
}

# Scopus normalises venue names into a form that reads badly on a website.
VENUE_FIXES = {
    "Proceedings of the International Astronautical Congress Iac":
        "Proceedings of the International Astronautical Congress (IAC)",
    "IFAC Papersonline": "IFAC-PapersOnLine",
    "AIAA Science and Technology Forum and Exposition AIAA Scitech Forum 2025":
        "AIAA SciTech Forum 2025",
}

# Tokens that must keep their casing when an ALL-CAPS title is normalised.
ACRONYMS = {
    "CUBESATS": "CubeSats", "CUBESAT": "CubeSat", "IAC": "IAC", "AIAA": "AIAA",
    "IEEE": "IEEE", "HAN": "HAN", "40N": "40N", "IFAC": "IFAC", "AI": "AI",
}
LOWERCASE = {
    "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "nor",
    "of", "on", "or", "the", "to", "using", "with", "via",
}


def get(url):
    req = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "orcid-to-publications",
    })
    with urllib.request.urlopen(req, timeout=40) as resp:
        return json.load(resp)


def titlecase(title):
    """Normalise an ALL-CAPS title. Mixed-case titles are left untouched."""
    letters = [c for c in title if c.isalpha()]
    if not letters or not all(c.isupper() for c in letters):
        return title

    out = []
    for i, word in enumerate(title.split()):
        core = word.strip(":,.()-")
        if core in ACRONYMS:
            out.append(word.replace(core, ACRONYMS[core]))
        elif i > 0 and core.lower() in LOWERCASE and not out[-1].endswith(":"):
            out.append(word.lower())
        else:
            # Capitalise each part so "REAL-WORLD" becomes "Real-World".
            out.append("-".join(p.capitalize() for p in word.split("-")))
    return " ".join(out)


def slugify(title):
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return s[:72].rstrip("-")


def yaml_str(value):
    """Emit a single-quoted YAML scalar."""
    return "'" + str(value).replace("'", "''") + "'"


def main():
    summaries = get(f"{API}/{ORCID_ID}/works")
    putcodes = [g["work-summary"][0]["put-code"] for g in summaries["group"]]
    bulk = get(f"{API}/{ORCID_ID}/works/" + ",".join(str(p) for p in putcodes))

    os.makedirs(OUT_DIR, exist_ok=True)
    written, drafts, skipped = [], [], []

    for entry in bulk["bulk"]:
        work = entry["work"]
        title = titlecase(work["title"]["title"]["value"])

        date = work.get("publication-date") or {}
        year = (date.get("year") or {}).get("value")

        venue = ((work.get("journal-title") or {}).get("value") or "")
        venue = VENUE_FIXES.get(venue, venue)

        ext_ids = (work.get("external-ids") or {}).get("external-id") or []
        doi = next(
            (x["external-id-value"] for x in ext_ids
             if x["external-id-type"] == "doi"),
            None,
        )
        url = f"https://doi.org/{doi}" if doi else (work.get("url") or {}).get("value", "")

        authors = "; ".join(
            c["credit-name"]["value"]
            for c in (work.get("contributors") or {}).get("contributor", [])
            if c.get("credit-name")
        )

        category = CATEGORY.get(work.get("type"), "manuscripts")

        bits = [b for b in (authors, f"({year})" if year else None) if b]
        citation = " ".join(bits)
        citation = f'{citation}. "{title}."' if citation else f'"{title}."'
        if venue:
            citation += f" <i>{venue}</i>."

        if year:
            # ORCID often records only a year; archive-single renders %Y only.
            date_str = f"{year}-01-01"
            name = f"{date_str}-{slugify(title)}.md"
        else:
            date_str = None
            name = f"{slugify(title)}.md"

        front = [
            "---",
            f"title: {yaml_str(title)}",
            "collection: publications",
            f"category: {category}",
            f"permalink: /publication/{slugify(title)}",
        ]
        if date_str:
            front.append(f"date: {date_str}")
        if venue:
            front.append(f"venue: {yaml_str(venue)}")
        if url:
            front.append(f"paperurl: {yaml_str(url)}")
        front.append(f"citation: {yaml_str(citation)}")
        if not date_str:
            front.append("published: false  # TODO: add year and venue, then set true")
        front.append("---")
        front.append("")

        # Additive only. The files in _publications/ are curated by hand from
        # the CV, which is more complete than ORCID; never overwrite them.
        path = os.path.join(OUT_DIR, name)
        if os.path.exists(path):
            skipped.append(name)
            continue

        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("\n".join(front))

        (written if date_str else drafts).append(name)

    for name in sorted(written):
        print(f"  wrote  {name}")
    for name in sorted(drafts):
        print(f"  DRAFT  {name}  (published: false)")
    print(f"\n{len(written)} new, {len(drafts)} drafts needing a year/venue, "
          f"{len(skipped)} left untouched (already present)")


if __name__ == "__main__":
    main()
