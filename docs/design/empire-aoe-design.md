# Zaps Empire — AoE Rebuild Spec

_Source: Claude Fable (claude-fable-5-1), 2026-10-11, plus a critique of 3 live screenshots. Concept art: `docs/design/art/`._

## 1. Pillars
- **Every number has a sprite.** Income, crews, rivals are moving units with sound, never silent text.
- **AoE grammar, literally.** Ages, villagers, four resources, 3×3 command grid, minimap, horn alerts.
- **Charging is the war.** Cars plugging in = income; rivals steal cars, permits and megawatts.

## 2. Core mapping

| AoE | Zaps | Rules |
|---|---|---|
| Villager | **Crew truck** (red pickup, hard-hat crew) | Gather/build/repair. Trained at HQ ($15K, 20s). Start with 3. Idle-crew button cycles idle trucks. |
| Food | **Capital $** | Earned per kWh sold (floating +$). Spent on everything. |
| Wood | **Copper/Steel** | Crews haul from Scrapyard nodes to Warehouse/HQ. Spent on hardware. |
| Gold | **Permits** | Crews gather slowly at City Hall node; Permit Office boosts. Spent on ages, MCS, new cities. |
| Stone | **Grid MW** | Pool from Substation+BESS. Kits consume MW; overdraw = brownout (dark stalls, 50% income). |
| Town Center | **Site HQ** | Trains crews, researches ages, dropsite. Garrison: crews inside are immune to protests. 1 per city. |
| Barracks/army | **Sales Depot → Vans** | Vans "raid" rival cities, stealing share. Lawyers (Permit Office) dispel protests. |
| Market | **Market kit** | Trade Copper↔Capital; hosts price slider. |
| Walls | **Perimeter fence** | Auto-extends around built tiles; protesters must path around. |
| Relics | **Fleet contracts** | Capture neutral depot nodes on map → guaranteed semi traffic. |

## 3. Buildings

| Building | Role | Cost | Size | Silhouette @32px |
|---|---|---|---|---|
| Site HQ | Crews, ages, dropsite | start free; expansion $80K/30P | 3×3 | Red cube, white roof with tall antenna mast |
| DC Charger | 2 stalls, cars | $20K/10Cu/0.3MW | 1×1 | Two white posts under thin red canopy bar |
| MCS Charger | 1 semi bay | $60K/30St/10P/1MW | 2×3 | Black gantry arch (car-wash shape), yellow cable |
| BESS | +2MW buffer | $40K/20St | 2×1 | White container, three cyan vent slots |
| Substation | +5MW (max 2) | $70K/40St/10P | 2×2 | Grey lattice tower with insulators, fenced |
| Warehouse | Cu/St dropsite | $15K | 2×2 | Tan corrugated shed, big roll-up door |
| Lounge | +50% kWh/visit, loyalty | $25K/10Cu | 2×2 | Amber-glowing glass box, flat overhang |
| Market | Trade, price slider, snack $ | $30K | 2×1 | Red-striped awning kiosk |
| Permit Office | +Permit rate, lawyers | $35K/10P | 1×2 | Cream civic box, columns, flagpole |
| Sales Depot | Trains vans, scouts | $45K/20St | 2×2 | Garage with van nose protruding, red stripe |

## 4. Ages
- **Pilot** (start): HQ, DC, Warehouse, Market, fence. Base: dirt pad, chain-link, one pickup.
- **Fleet**: needs 4 DC + Warehouse; $120K/40St/20P, 60s at HQ. Unlocks BESS, Lounge, Permit Office, Sales Depot, SUV/van/pickup traffic, second city. Visual: asphalt paving, lit canopy signage, paved access road, HQ gains second storey.
- **Megawatt**: needs Substation + Lounge + 2 cities; $300K/100St/60P, 90s. Unlocks MCS, semis, e-bus, second Substation, fleet contracts. Visual: concrete, full LED canopies with night glow, HQ tower, highway off-ramp with semis.

## 5. Rival AI
- **Scripted build orders** (AoE II style): VOLTSPAN "fast Fleet", GRIDHAWK "boom" (Warehouses, Substations), ARCWAY "rush" (early vans + protests). REDNODE/AMPFIELD spawn at Fleet/Megawatt. Each tick: walk priority list, execute first affordable goal.
- **Expansion**: claim nearest unowned city; a coloured truck convoy drives the highway with an ETA bar — player can race it.
- **Price war**: when share in a contested city < target, undercut player by 10%; ping "VOLTSPAN undercut Phoenix!" Rival pricing visible on pins.
- **Harassment**: *Permit protest* — picketers walk to a kit, disable it 30s unless lawyer or garrison; *Undercut*; *Grid congestion* — rival buys MW from shared substation, forcing brownouts.
- **Knobs**: resource multiplier (0.7/1.0/1.3), reaction delay (30/15/5s), aggression (protest rate), map vision (cheat on Hard).

## 6. Traffic = income loop

| Vehicle | kWh | Stall | Weight Pilot/Fleet/Mega |
|---|---|---|---|
| Compact hatch | 20 | DC | 35/25/15 |
| Sedan | 40 | DC | 50/35/25 |
| SUV | 60 | DC | 15/20/20 |
| Pickup | 80 | DC | 0/10/10 |
| Delivery van | 70 | DC | 0/8/10 |
| Box truck | 150 | DC (occupies 2 stalls) or MCS | 0/2/8 |
| Semi + trailer | 600 | **MCS only** | 0/0/10 |
| E-bus | 300 | **MCS only** | 0/0/2 |

Spawn every 2–6s on the access road, rate = city demand × price elasticity × loyalty. Vehicle picks nearest free matching stall; queue cap 3 per stall; waiting >20s → honk, balk, exit, −loyalty. Semis/e-bus balk immediately if no free MCS; never enter DC queues. Plug sequence: park → cable snakes out → arc pulses → bar fills → on unplug a green "+$X" floats from the stall and flies to the Capital counter. Brownout halves charge speed and darkens canopies. Monthly turn still prints a summary toast.

## 7. HUD (1600×900)
- **Top resource bar** (0,0,1600×40): five chips left 💲Capital ⚡Grid MW (used/cap) 📄Permits 🔩Copper/Steel 👷Crews (idle/total), each ~140px with icon+count; Share % sits beside the age emblem; centre **age emblem** 80px plus city name; right: clock, pause/1/2/4 buttons.
- **Minimap** bottom-left (0,700,260×200): charcoal bevel, red/cyan/amber/violet dots, pulsing pings, click to jump.
- **Selection panel** bottom-centre (280,700,760×200): 160px portrait, name, HP/utilisation/queue bars, garrison slots, price slider when HQ/Market selected.
- **Command grid** bottom-right (1300,690,3×3 of 70px): hotkeys Q W E / A S D / Z X C, hover tooltip with cost, greyed if unaffordable.
- **Idle crew button** 60px at (0,630), flashes with idle count; hotkey period.
- **Notifications** right column (1320,60,260×240), stack of 5, click jumps camera; horn SFX on attack-class events.
- Frame: #1E1E24 panels, amber #E89A2E bevels, red #E63225 player accents, cream text. Wordmark area top-centre kept clear.

## 8. Live-build critique: 5 gaps and where they're fixed
1. **Nothing alive.** Frozen sedans, no crews, no motion → §2 crew trucks, §6 vehicle lifecycle, §9 steps 2–3.
2. **Pad floats in black void.** Flat identical tiles, no shadows → §4 age visuals, §9 step 1 (terrain, shadows, fence, night).
3. **SaaS dashboard HUD.** About 40% of the screen is chrome and stat tables → §7, done wholesale.
4. **Strategic map unreadable.** Satellite photo, text-box labels, tiny rival icons → §5 convoys, §9 step 7 (parchment, territory fill, shroud, sprite pins).
5. **No feedback or threat.** Silent income, strain only shown as text → §5 harassment, §6 floating +$, §7 pings and horn.

## 9. 2-hour build order (120 min)
1. **Terrain world** (15): tile desert 3 screens beyond pad, highway, saguaros, drop shadows, perimeter fence. *Check: no black pixels; pad sits in landscape.*
2. **Vehicle loop** (20): spawn → road → stall → cable → +$ float → exit; queue/balk. *Check: 5 cars at different stages, one green +$.*
3. **Crew trucks** (15): drive from HQ, hammer scaffold with progress bar, return idle. *Check: truck beside scaffold, bar half full.*
4. **HUD skeleton** (20): top bar, command grid with hotkeys, selection panel, idle button. *Check: screenshot matches §7 boxes.*
5. **Resources** (10): Cu/St nodes, Permits, MW pool with brownout. *Check: four counters change over 1 min.*
6. **Ages** (10): research button, unlock gating, paving swap. *Check: Fleet base visibly paved.*
7. **Strategic map repaint** (10): parchment, shroud, territory fill, pins as sprites. *Check: ownership readable at thumbnail size.*
8. **Rival script + convoy** (10): VOLTSPAN list, convoy on highway with ETA. *Check: cyan truck mid-road.*
9. **Alerts** (5): ping, horn, notification stack. *Check: "Undercut!" toast plus minimap pulse.*
10. **Night cycle + polish** (5): day/night tint, canopy glow, dust. *Check: night shot with amber/cyan glow.*