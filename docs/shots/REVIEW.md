# Empire graphics review — rts-yard-5

Stills: `yard-pad.png` · `yard-dc.png` · `yard-lounge-bess.png` · `yard-mcs-market.png` · `yard-phoenix-start.png` · `yard-raising.png`

Replay: `?shot=pad` · `?shot=dc` · `?shot=lounge-bess` · `?shot=mcs-market` · `?shot=start` · `?shot=raising`. Also `?showcase=1&site=phoenix` and `?showcase=1&site=la`.

## Yard rule

The zoomed site overlay (and the inspector thumbnail when it is a Zaps pad) **layers kit sprites on a dirt pad**. Occupancy photos stay map stamps.

Kit sits on a **plaza grid**. `left`/`top` are ground anchors; CSS `--ox`/`--oy` translate each sprite so a raising ghost occupies the same stall it will keep when the job completes.

```
BACK
     [BESS bank]
DC DC DC DC   [LOUNGE]
[MCS bay]     [MARKET]
FRONT
```

| Kit | Footprint | When it appears |
|---|---|---|
| DC | Up to 4 pedestals, even isometric NE row | Ghost in the next stall when the crew starts; solid when complete |
| MCS | Wider canopied bay at the west end of the charger street | Same ghost-in-final-slot rule; does not overlap DC |
| Lounge | Pavilion on the east side | Ghost then solid in that slot |
| BESS | Cabinet bank behind the lounge | Ghost then solid in that slot |
| Market | Kiosk front-east of the lounge | Ghost then solid; no lounge/BESS collision |

Unbuilt dirt stays a survey flag. First pad + kit is the grow-on-deploy reward.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Yard is a planned compound | **FORWARD** | Overlay + inspector share `yardArtHtml`. DC row / MCS bay / lounge / BESS / market keep fixed slots. Ghosts do not jump. |
| Brand | **HOLD** | Official cream/red wordmarks (`viewBox 0 0 932 310`, 1823-byte files). Red kiosk bolt. Palette unchanged. |
| Map | **HOLD** | Painted Western Interconnect. CA pins on land. Pan / zoom / click-in / EXIT / Escape. Occupancy stamps unchanged. |

Economy untouched. Night Shift untouched. Cache `rts-yard-5`.
