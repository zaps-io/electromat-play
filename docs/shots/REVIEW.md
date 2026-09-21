# Empire playtest — rts-yard-18

Replay stills (paused board, no title): `?shot=board` · `?shot=empty` (Flagstaff dirt chessboard) · `?shot=ghosts` (MCS violet ring and edge) · `?shot=raising` · `?shot=full` · `?shot=rival` (LA blocked tray) · `?shot=contested` (Vegas UNDERCUT chip) · `?shot=event` (field-call only — threat chip suppressed) · `?shot=hover` (canopy consequence) · `?shot=fork` · `?shot=pop` (one complete toast) · `?shot=objective` (hold-share arc) · `?shot=crew` (RAISE / RESPOND) · `?shot=scout` (intel line) · `?shot=skirmish` (price-war meters) · `?showcase=1`.

Checked-in frames: `yard-empty.png` · `yard-pad.png` · `yard-ghosts.png` · `yard-event.png` · `yard-raising.png` · `yard-full.png` · `yard-rival.png` · `yard-contested.png` · `yard-hover.png` · `yard-threat.png` · `yard-fork.png` · `yard-pop.png` · `yard-objective.png` · `yard-crew.png` · `yard-scout.png` · `yard-skirmish.png`.

## rts-yard-18

- **Polish.** MCS ring and roof edge use the violet ghost family (`#d8c4ff`, same edge as `ghostTone("mcs")`). DC rings stay cyan. An open UNDERCUT field call hides the contested UNDERCUT chip so CUT PRICE `[` does not stack on the dock. A kit completion emits one toast node; the yard flash and in-place pop stay.
- **Arcs.** The ops strip shows a monthly objective from the first paused month: claim Flagstaff or Tucson, then a path-weighted arc (MCS corridor, Vegas border, lounge race, hold 45% share for 3 months, or a third city). Success pays cash. A miss costs cash and lets rival prices slip. Corridor path prefers MCS. Amenity path prefers the lounge race. Both stay viable.
- **Anti-turtle.** Sitting on Phoenix past month 4 raises corridor pressure. The call is a race for empty dirt: queue a DC or rival crews roll for two months. A pad you already hold is not seized. Rival pads stay theirs.
- **Crews.** RAISE uses all three crews and idle months (no build, no scout, not on call) burn $25K and hand rivals tempo. RESPOND parks one crew: build cap drops to 2, contested share holds a little firmer, undercuts are blunted, and skirmish meters fill faster for Zaps. `R` toggles. This is the villager fork that fit the board.
- **Scout.** `S` or the strip button spends $40K and one crew for one month, then posts the rival's next kit and price on that city for four months.
- **Skirmish.** A contested undercut, poach, or lounge call opens a three-month PRICE WAR or AMENITY RACE. Two meters fill from price gap, amenities, BESS, and the on-call crew. The winner takes a small price step and, for Zaps, $120K. No units.

## Tried and dropped

- Per-crew task cards (one villager each for raise / defend / scout) doubled the tray without a clearer decision than RAISE vs RESPOND plus a scout button.
- Resolving skirmishes in real time inside the month. Monthly meters stay readable at 1× and match the rest of the clock.
- Paying a skirmish win with the rival's pad. That breaks the seal on LA, Dallas, Denver, and the other held depots.
- A second production tab or tech tree. The kit tray is already the build order.

## Holds from rts-yard-17

- Empty claimable yards stay a dirt chessboard. No survey-flag hero.
- Field calls dock on the map column. Inspector price and `[` `]` stay visible.
- Rival pads stay blocked. Tray chip reads RIVAL SITE.
- Goldilocks frame stays 76% / cap 800.
- Official 1.8KB wordmarks (`?v=canon-1823`) are unchanged.
- Hover consequence, smart stall, and the build-order fork stay.

## Playtest notes

1. Open `?shot=objective` — Vegas is contested and the strip reads HOLD 45% LAS VEGAS with a month clock.
2. Open `?shot=crew` — RESPOND is on, build cap reads 1 ON CALL, the expand objective is still the early arc.
3. Open `?shot=scout` — Vegas intel names VOLTSPAN's next kit and price.
4. Open `?shot=skirmish` — PRICE WAR meters show Zaps ahead of VOLTSPAN. RESPOND is on.
5. Open `?shot=ghosts` — MCS ring and roof edge are violet, with the violet stall.
6. Open `?shot=event` — the UNDERCUT field call is the only undercut chrome. Price stays on the inspector.
7. Open `?shot=pop` — one toast, yard flash, consequence line.
8. Open `?shot=empty` and `?shot=rival` — dirt chessboard, LA still RIVAL SITE.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| MCS ring / edge | **FIX** | Violet `#d8c4ff` on ring and edge |
| Single undercut chrome | **FIX** | Field call suppresses the UNDERCUT chip |
| Single complete toast | **FIX** | Duplicate COMPLETE nodes are dropped |
| Mid-game arcs | **RAISE** | Ops strip, hold / MCS / lounge / expand |
| Crew fork | **RAISE** | RAISE vs RESPOND, idle tax, on-call bonus |
| Scout / intel | **RAISE** | $40K, one crew, next kit and price |
| Skirmish meters | **RAISE** | Price war and amenity race, no units |
| Anti-turtle | **RAISE** | Month-4 corridor race on empty dirt |
| Rival pad seizure | **HOLD** | LA/Dallas/Denver tray = RIVAL SITE |
| Empty claim | **HOLD** | Flagstaff dirt chessboard |
| Field-call dock | **HOLD** | price visible |
| Yard framing | **HOLD** | ~76% of yard, cap 800 |
| Placement consequence | **HOLD** | Canopy / amenity / est. income |
| Brand | **HOLD** | Official cream/red wordmarks |

Night Shift untouched. Cache `rts-yard-18`.
