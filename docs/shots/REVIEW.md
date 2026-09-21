# Empire playtest — rts-yard-19

Replay stills (paused board, no title): `?shot=board` · `?shot=empty` (Flagstaff dirt chessboard) · `?shot=ghosts` (MCS violet ring and edge) · `?shot=raising` · `?shot=full` · `?shot=rival` (LA blocked tray) · `?shot=contested` (Vegas UNDERCUT chip) · `?shot=event` (field-call only — threat chip suppressed) · `?shot=hover` (canopy consequence) · `?shot=fork` · `?shot=pop` (one complete toast) · `?shot=objective` (hold-share arc) · `?shot=crew` (crew tokens on the Phoenix yard) · `?shot=scout` (Vegas detector on the yard) · `?shot=scout-map` (Vegas + LA pulses on the map) · `?shot=skirmish` (price-war tug lane) · `?showcase=1`.

Checked-in frames: `yard-empty.png` · `yard-pad.png` · `yard-ghosts.png` · `yard-event.png` · `yard-raising.png` · `yard-full.png` · `yard-rival.png` · `yard-contested.png` · `yard-hover.png` · `yard-threat.png` · `yard-fork.png` · `yard-pop.png` · `yard-objective.png` · `yard-crew.png` · `yard-scout.png` · `yard-scout-map.png` · `yard-skirmish.png`.

## rts-yard-19

Experiment on top of the 10/10 yard-18 ops pass. Three AoE/StarCraft reads, still no combat units and no pad seizure.

- **Scout pulse.** The first scout is still $40K and one crew for one month. When it lands, the city keeps a fading detector for 4 months: a cyan radar on the map pin (`DET n`) and a SCOUTED badge on the yard. Intel refresh on that city is free while the pulse is up and renews the fade. A second scout can go to another city at the same time (two flights max). The scout button follows the city you are looking at — `SCOUT OUT` only if that city already has a crew in the air.
- **Spatial skirmish.** PRICE WAR and AMENITY RACE still use the ops-strip meters. The same fight is now a tug lane on the yard drive rank: Zaps red fills from the near end, the rival color from the far end. Click the strip, the yard banner, the HUD meter, or press `P` to push Zaps. An on-call crew pushes a little harder. The winner is still a small price step and, for Zaps, $120K. Nobody takes the pad.
- **Crew tokens.** Three worker pips sit on a Zaps yard (and a smaller set on the Phoenix map pin). Click a token, or press `1` `2` `3` while the yard is open, to cycle that crew RAISE → RESPOND → SCOUT on the open city. `R` and the strip still flip the whole fork. Build cap is the number of crews on RAISE. A crew in the air or on call is not idle. Idle RAISE crews still burn standby cash and hand rivals the month. Rival pads do not get your tokens. Speed keys `1` and `2` still change speed on the continent map.

## Tried and dropped

- Per-crew task cards in the tray. Yard-18 already found they doubled the tray. Tokens on the yard are the lighter version.
- A second $40K charge to refresh intel while the detector is still ringing.
- Resolving the tug inside the month clock. The lane click is the within-month push; the meters still tick with the calendar.
- Paying a skirmish win with the rival's pad.
- Marching crew tokens between cities, or any real combat unit.

## Holds from rts-yard-18

- Ops objectives, corridor pressure, and the build-order fork.
- Rival pads stay sealed. LA, Dallas, and Denver still read RIVAL SITE.
- Empty claimable yards stay a dirt chessboard. No survey-flag hero.
- Field calls dock on the map column. Inspector price and `[` `]` stay visible.
- MCS ring and roof edge stay violet (`#d8c4ff`). DC rings stay cyan.
- An open UNDERCUT field call hides the contested UNDERCUT chip.
- A kit completion emits one toast node. The yard flash and in-place pop stay.
- Goldilocks frame stays 76% / cap 800.
- Official 1.8KB wordmarks (`?v=canon-1823`) are unchanged.

## Playtest notes

1. Open `?shot=scout-map` — Vegas wears a bright `DET 4` radar. LA wears a dimmer `DET 2` from the second scout. Phoenix HQ shows the three crew pips.
2. Open `?shot=scout` — the Vegas yard shows the SCOUTED detector and the free-refresh intel line. The strip button reads REFRESH LAS VEGAS · FREE.
3. Open `?shot=skirmish` — the drive rank is a red/cyan tug. Zaps is ahead. PUSH P is on the yard. The HUD meters are still there.
4. Open `?shot=crew` — Phoenix yard tokens: crew 1 is CALL (picked), 2 and 3 are RAISE. The strip still reads 1 ON CALL.
5. Open `?shot=empty` and `?shot=rival` — dirt chessboard, LA still RIVAL SITE, no crew tokens on the rival pad.
6. On a yard, `1` `2` `3` assign that crew. On the map, `1` `2` `4` are still speed.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Scout pulse | **RAISE** | Map radar + yard SCOUTED, 4 months, free refresh, second scout |
| Spatial skirmish | **RAISE** | Drive-rank tug, click or `P`, meters kept |
| Crew tokens | **RAISE** | 1–3 selectable, RAISE / RESPOND / SCOUT, idle tax stays |
| Rival pad seizure | **HOLD** | LA/Dallas/Denver tray = RIVAL SITE |
| Empty claim | **HOLD** | Flagstaff dirt chessboard |
| Field-call dock | **HOLD** | price visible |
| MCS violet / one toast | **HOLD** | `#d8c4ff`, single COMPLETE node |
| Yard framing | **HOLD** | ~76% of yard, cap 800 |
| Brand | **HOLD** | Official cream/red wordmarks |

Night Shift untouched. Cache `rts-yard-19`.
