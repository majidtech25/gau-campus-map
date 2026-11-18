# GaU Campus Map: "Find your way" 🗺️

A mobile page for Garissa University: pick **You are at** and **Going to**, and get the
walking route drawn on a simple campus map (walkways as lines, places as dots; tap a dot to
pick it) plus landmark directions
(*"At the New Administration Block, turn right."*). Built by **The Stonecoders**.
Separate from the [GaU QR Tour](https://github.com/majidtech25/gau-qr-tour).

## Try it

- Live: `https://majidtech25.github.io/gau-campus-map/`
- Preset route: `?from=gate&to=admissions`
- Gate QR opens with **You are at: Main Gate** already filled: `?from=gate`

## Files

| File | What |
|---|---|
| `index.html` | The page |
| `js/data.js` | **The campus**: places, junctions, walkways (traced from the team's GIS layout map) |
| `js/map.js` | Route-finding, map drawing, directions. No edits needed for new data |
| `js/i18n.js` | All text (EN complete; SW/SO for native speakers) |
| `css/style.css` | Styling |
| `pilot/` | QR codes + printable A4 signs (`GaU-Campus-Map-QR.pdf`) |
| `tools/make_qr.py` | QR generator (error correction H) |

## How the data works

Coordinates in `js/data.js` are **pixels on the team's original layout map** (2576 × 1822).
The page draws only walkways and place dots from them, with no building outlines and no map image.

- **place**: shows in the dropdowns (`name`, `cat`). Put it at the building's entrance, on a walkway.
- **junction**: a path crossing. `near` is the landmark used in directions.
- **bend**: just a corner; never announced.
- **edges**: one `["a", "b"]` per walkway segment (the purple lines on the map).

Turns are announced only at real junctions (3+ paths meet). There are no distances yet,
because the map image has no scale. With the GIS file's real coordinates we can add
"about N metres / N minutes".

## To check before going live (walk-through)

- [ ] **New Library**: no walkway is drawn to it on the map; the link from the registrar path is assumed
- [ ] **Pitches** (Hockey Girls, Handball, Netball, Volleyball, Basketball): the GIS map draws no paths to them; the links from the nearest road are assumed. Walk them
- [ ] **Basketball pitches**: route goes down the Football Pitch's west side (assumed)
- [ ] Field washrooms ↔ New Lecture Halls / Police: is there a direct path? (the map shows none, so routes go round)
- [ ] Walk at least 5 routes with the page open and check every turn
- [ ] Credit: confirm who made the layout map the data was traced from (GIS lab?) and fill the footer credit

**Sources:** buildings and walkways from the layout map (full_uni_Layout1). Fields, Graduation
Square (= Hockey Boys Pitch) and main roads vs pathways from the team's GIS map (Nov 2026),
aligned to the same coordinates by matching buildings (error a few px).

## QR codes

| File | Opens |
|---|---|
| `pilot/qr-map-pilot.*` | `…/gau-campus-map/?campaign=pilot&ref=qr` |
| `pilot/qr-map-gate.*` | `…/?from=gate&campaign=gate&ref=qr` |

**Printable:** `pilot/GaU-Campus-Map-QR.pdf` (2 × A4). Page 1 is the general sign, for anywhere on campus.
Page 2 is the Main Gate sign, which opens with "You are at: Main Gate" filled in. Print at 100%
and test-scan with 3+ phones. 

Scans are counted in GoatCounter (`majid.goatcounter.com`) under **Campaigns**.
Regenerate: `python tools/make_qr.py "<url>" pilot <name>`.

## Run locally

```bash
python -m http.server 8000   # open http://localhost:8000
```
