# CLAUDE.md: rules for GaU Campus Map (The Stonecoders)

A one-page mobile route-finder for Garissa University: pick "You are at" + "Going to",
get the walking route on the campus map and landmark directions. Separate project from
`gau-qr-tour`; same team, same standards.

## Stack
- Plain HTML + CSS + vanilla JS. No frameworks, no npm, no build step. GitHub Pages from `main` / root.
- External requests allowed: Google Fonts, GoatCounter (one script tag). Nothing else.

## Data rules (non-negotiable)
1. `js/data.js` comes from the team's GIS layout map and walk-throughs. **Never invent a walkway, place or name.** Anything assumed gets a `// CHECK:` comment and a line in README "To check".
2. Coordinates are pixels on the team's original layout map (2576 × 1822). The page draws dots and lines only; no map image, no building outlines.
3. Places go at the entrance, on a walkway. Junction `near` = a landmark a visitor can see.
4. No distances or times until we have a real scale (GIS coordinates). No guessed metres.
5. Private places (residences) are not listed as destinations.

## Code conventions
- Mobile-first, 390 px. Colours only via CSS variables in `:root`.
- All visible text through `js/i18n.js` (EN fallback; SW/SO by native speakers only).
- One IIFE in `map.js`, `"use strict"`. Without JS the map image still shows.
- Don't rewrite the URL on first load: GoatCounter must see `?campaign=…`. Rewrite only after the visitor changes a choice.

## QR rules
- Every printed QR carries `?campaign=<name>&ref=qr`. Gate QRs also carry `from=<gate id>`.
- Permanent (engraved) QRs must use a university-owned address, never `github.io`.

## Git workflow
Same as the tour: each person owns their area, branch → PR → self-check → merge yourself; review after merge.
Self-check: page loads with no console errors at 390 px; 3+ routes give correct turns; no new unverified data.
