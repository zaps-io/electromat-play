# Empire graphics review — rts-yard-4

Stills: `yard-pad.png` · `yard-dc.png` · `yard-lounge-bess.png` · `yard-mcs-market.png` · `yard-phoenix-start.png` · `yard-raising.png`

Replay: `?shot=pad` · `?shot=dc` · `?shot=lounge-bess` · `?shot=mcs-market` · `?shot=start` · `?shot=raising`. Also `?showcase=1&site=phoenix` and `?showcase=1&site=la`.

## Yard rule

The zoomed site overlay (and the inspector thumbnail when it is a Zaps pad) **layers kit sprites on a dirt pad**. Occupancy photos stay map stamps.

| Kit | When it appears |
|---|---|
| DC / MCS | Ghost stall as soon as the crew starts; another live stall when the job completes. Up to 4 DC / 2 MCS slots. |
| BESS / lounge / market | Ghost as soon as the crew starts; solid when complete. |

Prefer visible construction (`.site-kit.raising`) over a frozen HQ render. Phoenix HQ no longer paints a full compound that already includes unbuilt BESS.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Yard follows inventory | **FORWARD** | Overlay `data-dc` / `data-mcs` / `data-bess` / `data-lounge` / `data-market` match the inspector counts. Adding a DC adds a stall. |
| Brand | **HOLD** | Official cream/red wordmarks (`viewBox 0 0 932 310`, 1823-byte files). Red kiosk bolt. Palette unchanged. |
| Map | **HOLD** | Painted Western Interconnect. CA pins on land. Pan / zoom / click-in / EXIT / Escape. Occupancy stamps unchanged. |

Economy untouched. Night Shift untouched. Cache `rts-yard-4`.
