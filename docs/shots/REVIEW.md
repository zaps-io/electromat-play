# Empire playtest — design spec pass

One isometric Western Interconnect, drawn to `docs/design/empire-aoe-design.md`. The camera pans from the parchment region down to a site. Crew trucks are the villagers. Traffic is the payoff.

Stills at 1600×900:

- `aoe-region.png` — parchment strategic map, territory fill, shroud, sprite pins
- `aoe-compound.png` — Phoenix in the desert with the building-sheet silhouettes
- `aoe-build.png` — crew truck beside a scaffold, progress bar half full
- `aoe-select.png` — box selection and the 3×3 command grid
- `aoe-age.png` — Fleet Age banner over a paved pad
- `aoe-vehicles.png` — labeled 2:1 roster of the eight vehicle types
- `aoe-contest.png` — Voltspan contesting a Zaps plot
- `aoe-traffic.png` — five cars at different stages and a green +$
- `aoe-convoy.png` — cyan Voltspan truck on the highway with an ETA bar
- `aoe-alert.png` — Undercut! toast and a minimap pulse
- `aoe-night.png` — night tint with amber and cyan canopy glow

## Loop

- Select crews with a click or a box. Right-click moves them, sends them to a scrapyard or city hall, or puts them on a scaffold. `.` cycles idle crews.
- The top bar is Capital, Grid MW used/capacity, Permits, Copper/Steel, and idle/total crews. The age emblem, city name, and share sit under the wordmark. The clock and pause/1/2/4 are on the right.
- The command grid is bottom-right, hotkeys Q W E / A S D / Z X C. Tab flips to the permit office, crew training, and the scout. A button greys out when the age or the cost blocks it.
- Ages follow the spec. Pilot is HQ, DC, Warehouse, Market, and the fence. Fleet needs 4 DC chargers and a Warehouse, then $120K / 40 steel / 20 permits and 60s at HQ. It paves the pad and unlocks BESS, Lounge, Permit Office, Sales Depot, and the first Substation. Megawatt needs a Substation, a Lounge, and a second city.
- Semis and the electric school bus charge only at an MCS bay. A green +$ leaves the stall and flies to Capital. Queues balk after 20s.
- Voltspan, Gridhawk, and Arcway follow scripted build orders. A convoy truck drives the highway with an ETA the player can race.
- Alerts stack on the right. Attack-class events honk and pulse the minimap.

Official cream and red wordmarks stay 1823 bytes. Palette is red `#E63225`, charcoal `#1E1E24`, amber `#E89A2E`, cyan `#00D4F5`, cream `#F5F0E8`.
