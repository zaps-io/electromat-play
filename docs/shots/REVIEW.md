# Empire playtest — rts-yard-20

Replay stills (paused board, no title): `?shot=board` · `?shot=empty` (Flagstaff dirt chessboard) · `?shot=ghosts` (MCS violet ring and edge) · `?shot=raising` · `?shot=full` · `?shot=rival` (LA blocked tray) · `?shot=contested` (Vegas UNDERCUT chip) · `?shot=event` (field-call only — threat chip suppressed) · `?shot=hover` (canopy consequence) · `?shot=fork` · `?shot=pop` (one complete toast) · `?shot=objective` (hold-share arc) · `?shot=crew` (crew tokens on the Phoenix yard) · `?shot=scout` (Vegas detector on the yard) · `?shot=scout-map` (Vegas + LA pulses on the map) · `?shot=skirmish` (price-war tug lane) · `?shot=fog` (Vegas DET plus 1-hop INTEL, distant rivals muted) · `?shot=pin-fight` (Vegas map-pin tug) · `?shot=waypoint` (crew pips on Flagstaff and Tucson) · `?showcase=1`.

Checked-in frames: `yard-empty.png` · `yard-pad.png` · `yard-ghosts.png` · `yard-event.png` · `yard-raising.png` · `yard-full.png` · `yard-rival.png` · `yard-contested.png` · `yard-hover.png` · `yard-threat.png` · `yard-fork.png` · `yard-pop.png` · `yard-objective.png` · `yard-crew.png` · `yard-scout.png` · `yard-scout-map.png` · `yard-skirmish.png` · `yard-fog.png` · `yard-pin-fight.png` · `yard-waypoint.png`.

## rts-yard-20

Playtest-19 scored 9/10. Three interconnect reads, still no combat units and no pad seizure.

- **Interconnect fog.** A detector still rings the scouted city for 4 months (`DET n`, free refresh). For that same pulse it radiates one hop along the corridor: neighbors wear a soft INTEL glow, and the corridor segment lights cyan. Rival pins you have not detected, and that are not adjacent to a live detector, stay muted and read UNKNOWN. A city you already hold, or a scout still in the air, is not fog. Echo cities do not get the price line or the free refresh.
- **Map-pin fight.** PRICE WAR and AMENITY RACE keep the yard tug lane and the ops meters. The contested city's map pin also shows a small Zaps/rival tug and a PUSH chip, and the pin flashes. Click the chip or the pin (or press `P`) to push. Double-click the pin to open the yard. Nobody takes the pad. No units, no flanking.
- **Crew select → waypoint.** Click a crew token, or press `1` `2` `3` on a yard, to select it. Click it again to cycle RAISE → RESPOND → SCOUT. SCOUT and `S` arm the selected crew and wait for a city click — they do not launch at the open yard. Clicking a city then sets that crew's SCOUT or RESPOND target. Map pips sit on every Zaps city (and on a rival pin only while a scout is assigned there), not only Phoenix. Yard tokens stay on Zaps yards. Rival yards still have none.

## Tried and dropped

- Fogging the whole painted continent. Only unknown rival pins mute. Dirt and Zaps yards stay readable.
- A second detector badge on the hop. Neighbors get INTEL, not `DET n`, and not the free refresh.
- Replacing the yard tug with the map pin. Both stay. The pin is the interconnect read.
- Marching tokens as combat units, or paying a skirmish with the rival pad.

## Holds from rts-yard-19

- Scout pulse, yard tug lane, and the three crew tokens.
- Ops objectives, corridor pressure, and the build-order fork.
- Rival pads stay sealed. LA, Dallas, and Denver still read RIVAL SITE.
- Empty claimable yards stay a dirt chessboard. No survey-flag hero.
- Field calls dock on the map column. Inspector price and `[` `]` stay visible.
- MCS ring and roof edge stay violet (`#d8c4ff`). DC rings stay cyan.
- An open UNDERCUT field call hides the contested UNDERCUT chip.
- A kit completion emits one toast node. The yard flash and in-place pop stay.
- Goldilocks frame stays 76% / cap 800.
- Official 1.8KB wordmarks (`?v=canon-1823`) are unchanged.
- On the continent map, `1` `2` `4` are still speed.

## Playtest notes

1. Open `?shot=fog` — Vegas wears `DET 4`. Phoenix, Los Angeles, St. George, and Reno wear INTEL, and the corridors from Vegas glow. Dallas, Denver, Salt Lake City, El Paso, and San Diego stay muted UNKNOWN.
2. Open `?shot=pin-fight` — the Vegas pin flashes and shows a red/cyan tug labeled PUSH. Clicking it moves Zaps the same way `P` does. The yard lane is still there if you open the site.
3. Open `?shot=waypoint` — crew 1 is selected on Flagstaff (RESPOND), crew 2 is on Tucson (SCOUT), crew 3 stays on Phoenix. The hint reads CLICK A CITY.
4. Select a crew, press `S` or cycle to SCOUT, then click a different city. The scout does not auto-launch at the yard you had open.
5. Open `?shot=empty` and `?shot=rival` — dirt chessboard, LA still RIVAL SITE, no crew tokens on the rival pad.
6. Open `?shot=scout-map` — Vegas `DET 4` and LA `DET 2` still pulse. Their neighbors pick up the hop glow.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Interconnect fog | **RAISE** | DET on the scouted city, INTEL one hop, UNKNOWN rivals muted |
| Map-pin fight | **RAISE** | Pin tug + PUSH, click or `P`, yard lane kept |
| Crew waypoint | **RAISE** | Select then city, pips on Flagstaff and Tucson |
| Rival pad seizure | **HOLD** | LA/Dallas/Denver tray = RIVAL SITE |
| Empty claim | **HOLD** | Flagstaff dirt chessboard |
| Field-call dock | **HOLD** | price visible |
| MCS violet / one toast | **HOLD** | `#d8c4ff`, single COMPLETE node |
| Yard framing | **HOLD** | ~76% of yard, cap 800 |
| Brand | **HOLD** | Official cream/red wordmarks |
| Scout pulse / yard tug / tokens | **HOLD** | rts-yard-19 reads stay |

Night Shift untouched. Cache `rts-yard-20`.
