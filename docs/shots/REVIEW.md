# Empire graphics review — rts-yard-7

Stills: `board.png` · `yard-phoenix-start.png` · `yard-dc.png` · `yard-lounge-bess.png` · `yard-mcs-market.png`

Replay: `?showcase=1` · `?shot=start` · `?shot=dc` · `?shot=lounge-bess` · `?shot=mcs-market`.

## Framing

Site overlay **letterboxes the lot diamond** so the yard reads as an AoE compound, not a cropped canopy close-up.

- Overlay stack is contained to ~46% of the yard width (cap 460px) and ~50% of yard height (cap 290px).
- Plaza island, shared DC canopy, grow-on-deploy, inventory sync, EXIT, pan, and wordmarks are unchanged.
- Western Interconnect default camera stays at scale 1 (whole southwest visible).

## Yard rule

The site overlay (and the inspector thumbnail) layers kit on a dirt diamond. Occupancy photos stay map stamps.

Once a crew starts, an **asphalt island + tan curb** pours under the kit zone. A **shared cream canopy** (cyan edge, red-banded posts) spans the DC row. MCS keeps its own wider bay at the west end.

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
| Yard framing | **REVIEW** | Overlay stack no longer fills the viewport. Lot diamond + void should read as an RTS base. Hold merge until Victor signs the stills. |
| Yard is a planned compound | **HOLD** | Plaza + shared DC canopy + fixed slots from pass #17. Overlay and inspector share `yardArtHtml`. |
| Brand | **HOLD** | Official cream/red wordmarks (`viewBox 0 0 932 310`, 1823-byte files). Palette unchanged. |
| Map | **HOLD** | Default zoom 1. Pan / zoom / click-in / EXIT / Escape. Occupancy stamps unchanged. |

Economy untouched. Night Shift untouched. Cache `rts-yard-7`.
