# Empire graphics review — rts-yard-6

Stills: `yard-pad.png` · `yard-dc.png` · `yard-lounge-bess.png` · `yard-mcs-market.png` · `yard-phoenix-start.png` · `yard-raising.png`

Replay: `?shot=pad` · `?shot=dc` · `?shot=lounge-bess` · `?shot=mcs-market` · `?shot=start` · `?shot=raising`.

## Yard rule

The zoomed site overlay (and the inspector thumbnail) layers kit on a dirt diamond. Occupancy photos stay map stamps.

Once a crew starts, an **asphalt island + tan curb** pours under the kit zone. A **shared cream canopy** (cyan edge, red-banded posts) spans the DC row. MCS keeps its own wider bay at the west end.

`left`/`top` are ground anchors; CSS `--ox`/`--oy` keep a raising ghost in the final stall.

```
BACK
     [BESS bank]
DC DC DC DC   [LOUNGE]
[MCS bay]     [MARKET]
FRONT
```

| Kit | Footprint | When it appears |
|---|---|---|
| Plaza | Asphalt island + curb under the compound | Ghost/solid with first kit |
| DC | Up to 4 pedestals under one canopy | Ghost in the next stall; solid when complete |
| MCS | Wider canopied bay at the west end | Same ghost-in-final-slot rule |
| Lounge | Pavilion east of the charger street | Ghost then solid |
| BESS | Cabinet bank behind the lounge | Ghost then solid |
| Market | Kiosk front-east | Ghost then solid |

Unbuilt dirt stays a survey flag.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Yard is a planned compound | **REVIEW** | Plaza + shared DC canopy + fixed slots. Overlay and inspector share `yardArtHtml`. Ghosts do not jump. Hold merge until Victor signs the stills. |
| Brand | **HOLD** | Official cream/red wordmarks (`viewBox 0 0 932 310`, 1823-byte files). Palette unchanged. |
| Map | **HOLD** | Pan / zoom / click-in / EXIT / Escape. Occupancy stamps unchanged. |

Economy untouched. Night Shift untouched. Cache `rts-yard-6`.
