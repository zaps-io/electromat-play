# Empire playtest — rts-yard-17

Replay stills (paused board, no title): `?shot=board` · `?shot=empty` (Flagstaff dirt chessboard) · `?shot=ghosts` (MCS violet + BESS/MARKET) · `?shot=raising` · `?shot=full` · `?shot=rival` (LA blocked tray, sharper silhouette) · `?shot=contested` (Vegas UNDERCUT chip) · `?shot=event` (MATCH/HOLD field call, inspector price visible) · `?shot=hover` (canopy consequence) · `?shot=fork` (MCS corridor vs lounge + market) · `?shot=pop` (kit complete) · `?showcase=1`.

Checked-in frames: `yard-empty.png` · `yard-pad.png` · `yard-ghosts.png` · `yard-event.png` · `yard-raising.png` · `yard-full.png` · `yard-rival.png` · `yard-contested.png` · `yard-hover.png` · `yard-threat.png` · `yard-fork.png` · `yard-pop.png`.

## rts-yard-17

- **Placement.** Hovering a kit ghost prints one line: canopy / lounge adjacency, estimated income, and share when a rival is in the market. With more than one empty DC stall, the ghost prefers the cell that closes a canopy gap or finishes the 2-stall / 3-stall row, and leans toward the lounge column when that score ties. Click another empty stall to override, then deploy as usual.
- **Threats.** Rival compounds on the map and in the yard wear a harder silhouette in their color. Contested sites show one counter chip — UNDERCUT (`[`), AMENITY GAP (`L`), or GRID STRAIN (`B`). The chip click and the matching hotkey do that action. Pads stay theirs.
- **Build order.** Early game opens a fork sheet: MCS corridor rush or lounge + market. Both stay viable. Corridor makes rivals race amenities. Amenity makes rivals push MCS and cut price harder.
- **Finish.** A completed kit pops harder, the yard flashes, the queue meter ticks, and the toast names the kit (`DC CHARGER COMPLETE · Flagstaff`).

## Holds from rts-yard-16

- Empty claimable yards stay a dirt chessboard. No survey-flag hero.
- MCS raising ghosts stay violet, not error red.
- Field calls dock on the map column. Inspector price and `[` `]` stay visible.
- Rival pads (LA, Dallas, Denver, San Diego, El Paso, Salt Lake City) stay blocked. Tray chip reads RIVAL SITE.
- Goldilocks frame stays 76% / cap 800.
- Official 1.8KB wordmarks (`?v=canon-1823`) are unchanged.

## Playtest notes

1. Open `?shot=hover` — Flagstaff has two live stalls. The DC ghost sits on the third cell. The amber line reads COMPLETES CANOPY and an income estimate. Two empty stalls are clickable.
2. Open `?shot=contested` — Vegas shows UNDERCUT and CUT PRICE `[`. Clicking the chip matches VOLTSPAN. The pad is still yours to build on.
3. Open `?shot=fork` — BUILD ORDER sheet offers MCS CORRIDOR and LOUNGE + MARKET. The board stays up. The calendar stays paused.
4. Open `?shot=pop` — Flagstaff flashes and the toast names DC CHARGER COMPLETE.
5. Open `?shot=empty` — dirt chessboard, DC click still queues.
6. Open `?shot=rival` — LA silhouette is harder, tray is RIVAL SITE, DC does not enqueue.
7. Open `?shot=event` — field call docks beside the yard. Price stays on the inspector.
8. Open `?shot=ghosts` — MCS ghost is still violet.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Placement consequence | **RAISE** | Hover line: canopy / amenity / est. income |
| Smart slot + override | **RAISE** | Completes canopy row; click cell moves the ghost |
| Threat chip | **RAISE** | UNDERCUT / AMENITY GAP / GRID STRAIN, one click or hotkey |
| Rival silhouette | **RAISE** | Hard color edge on rival compounds |
| Build-order fork | **RAISE** | MCS corridor vs lounge + market changes rival pressure |
| Kit-complete juice | **RAISE** | Louder pop, yard flash, meter tick, named toast |
| Rival pad seizure | **HOLD** | LA/Dallas/Denver tray = RIVAL SITE |
| Empty claim | **HOLD** | Flagstaff dirt chessboard |
| MCS ghost language | **HOLD** | violet |
| Field-call dock | **HOLD** | price visible |
| Yard framing | **HOLD** | ~76% of yard, cap 800 |
| Brand | **HOLD** | Official cream/red wordmarks |

Night Shift untouched. Cache `rts-yard-17`.
