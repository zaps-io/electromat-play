# Empire playtest — rts-yard-15

Replay stills (paused board, no title): `?shot=board` · `?shot=empty` (Flagstaff dirt) · `?shot=raising` · `?shot=full` · `?shot=rival` (LA blocked tray) · `?shot=contested` (Vegas share meters) · `?shot=event` (MATCH/HOLD field call) · `?showcase=1`.

## Visual (Terminal Electromat)

Yards are miniature Electromat compounds, not generic RTS cubes.

- **DC** — Slim Zeus row: tall brushed-aluminum pedestals, charcoal recess, amber display, red mark, twin holsters, cyan base hairline, short cables.
- **Canopy** — thin cream roof, cylindrical aluminum posts, recessed warm coffers, cyan edge, thin red fascia.
- **Lounge** — cream pavilion silhouette, smoked portals with amber glow, aluminum lip. No forced cyan in the lounge core.
- **MCS** — truck island: low charcoal cabinet + heavier dispensers under an aluminum bay.
- **BESS** — cabinet farm with amber data strips (not cyan-capped cubes).
- **Market** — charcoal kiosk, cream awning, amber board.

Chessboard snap and Goldilocks frame (76% / cap 800) are unchanged.

## Systems

- Contested markets pull harder on price (elasticity 1.85) and take corridor pull from neighboring pads.
- Rivals prefer fighting cities you already hold — lounge/market first, occasional cent cuts.
- Field calls fire earlier and more often (about every 2–4 months): undercut, grid strain, amenity lounge, corridor poach. The sheet auto-opens. MATCH / HOLD / QUEUE LOUNGE stay real decisions.
- HUD campaign track shows continental share plus MAJORITY / STATES / MCS toward the win.

## UX

Deploy tray and inspector are amber-on-charcoal terminal UI. CHARGE / RELAX / DEPART triad on the inspector. Toasts stack (up to 3), stats tick, share meters animate.

## Ownership (hold from #24)

Rival yards are **not** claimable dirt. VOLTSPAN / GRIDHAWK / ARCWAY compounds stay theirs. Deploying a pad on Los Angeles, Dallas, Denver, San Diego, El Paso, or Salt Lake City is blocked. The tray wears an amber **RIVAL SITE** why-chip. Empty Flagstaff / Tucson / Vegas still take a DC kit.

Contested means both already have a live (or raising) pad. You keep building on **your** yard and fight on price/share. You do not seize their compound.

## Framing (hold)

Goldilocks yard scale **unchanged**: full pad + a bit of sand margin, about **76% of the yard box** (cap 800). Chessboard snap, nearest-city hits (r=70), pause-on-new-game, EXIT/Esc, official 1.8KB wordmarks.

## Playtest notes

1. Open `?shot=empty` — Flagstaff dirt, DC live, Slim Zeus ghost on hover.
2. Open `?shot=raising` — Phoenix ghosts with coffered canopy already live on the two-stall row.
3. Open `?shot=full` — Flagstaff reads as a station: Zeus row, MCS island, BESS farm, lounge pavilion, market kiosk.
4. Open `?shot=rival` — LA overlay reads RIVAL SITE, tray chips amber, DC click does not enqueue.
5. Open `?shot=contested` — Vegas meters Zaps vs VOLTSPAN; drag price, share toast/flash.
6. Open `?shot=board` — campaign track under the resource bar. Phoenix still starts paused.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Instant-read silhouettes | **RAISE** | Zeus ≠ MCS island ≠ BESS farm ≠ lounge pavilion ≠ market kiosk |
| Terminal Electromat look | **RAISE** | cream coffers, Slim Zeus, lounge portals |
| Rival pad seizure | **HOLD** | LA/Dallas/Denver tray = RIVAL SITE; enqueue no-ops |
| Empty claim | **HOLD** | Flagstaff DC still deploys |
| Contested share | **RAISE** | steeper price fight + corridor pull + heat |
| Decision events | **RAISE** | undercut / strain / amenity / poach, auto-open |
| Win / progress | **RAISE** | HUD campaign track MAJORITY / STATES / MCS |
| Construction pop | **HOLD+** | louder pop, enqueue toast, meter tick |
| Flagstaff after Phoenix | **HOLD** | Distance pick, radius 70 |
| Explore without the year racing | **HOLD** | Boot paused; 1× is slow |
| Yard framing | **HOLD** | Stack still ~76% of yard (cap 800) |
| Brand | **HOLD** | Official cream/red wordmarks |

Economy core numbers untouched except share reacting harder when a market is contested. Night Shift untouched. Cache `rts-yard-15`.
