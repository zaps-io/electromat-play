# Empire graphics review — rts-yard-11

Stills: `board.png` · `yard-empty.png` · `yard-phoenix-start.png` · `yard-dc.png` · `yard-dc2.png` · `yard-dc4.png` · `yard-mcs.png` · `yard-lounge-bess.png` · `yard-mcs-market.png`

Replay: `?shot=empty` · `?shot=start` · `?shot=dc` · `?shot=dc2` · `?shot=dc4` · `?shot=mcs` · `?shot=lounge-bess` · `?shot=mcs-market` / `?shot=full`. Showcase board: `?showcase=1`.

## Framing

Goldilocks yard scale **unchanged**: full pad + a bit of sand margin, about **76% of the yard box** (cap 800).

## This pass

Victor: the packed compound still does not layout well **while adding pieces**. Think chessboard / Age of Empires / StarCraft — not a mega-block that appears all at once, and not a bounding-box lot.

Fixed **square** 5×4 build grid (cell NE step == SE step). Kit lands on permanent integer cells. Ghosts occupy the same cells as the finished piece. Asphalt is a **tile union** of occupied + reserved cells — grows cell by cell, no giant empty rectangle, no sand gaps between sibling DCs.

```
        c0     c1     c2     c3     c4
   r0  BESS   BESS   BESS   BESS    —      rear cabinets
   r1  MCS    DC0    DC1    DC2    DC3     kit rank
   r2  MCS    aisle  aisle  aisle  aisle   drive
   r3  LNG    LNG    MKT    MKT     —      civic
```

| Kit | Cells | Grow rule |
|---|---|---|
| DC | `(1+i,1)` + reserved aisle `(1+i,2)` | Next empty stall left-to-right under one shared cream canopy (seams at cell edges) |
| MCS | `(0,1)+(0,2)` | Truck bay wall-in on the west flank, same two cells forever |
| BESS | `(0..3,0)` | Four cabinets, one per cell, shared only as contiguous tiles |
| Lounge | `(0,3)+(1,3)` | Pavilion sits on two civic tiles |
| Market | `(2,3)+(3,3)` | Awning kiosk on two civic tiles |
| Plaza | Occupied + reserved tiles only | Checkerboard etch + stall paint. Faint 5×4 board under kit |

Pieces sit **in** their squares (tile visible around the silhouette). No random rotation. Photoreal kit PNGs stay on the deploy tray.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Incremental grow is a chessboard | **REVIEW** | 1 DC = one stall + aisle. 2–4 DC fill the next cells. MCS wall-ins. Civic/BESS snap to reserved ranks. |
| Yard framing | **HOLD** | Stack still ~76% of yard (cap 800). |
| Brand | **HOLD** | Official cream/red wordmarks (`viewBox 0 0 932 310`, 1823-byte files). |
| Map | **HOLD** | Default zoom 1. Pan / zoom / click-in / EXIT. |

Economy untouched. Night Shift untouched. Cache `rts-yard-11`.
