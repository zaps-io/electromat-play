# Empire graphics review — rts-yard-12

Stills: `board.png` · `yard-empty.png` · `yard-dc1.png` · `yard-dc2-raising.png` · `yard-dc4.png` · `yard-full.png`

Replay: `?shot=empty` · `?shot=dc` / `?shot=dc1` · `?shot=dc2-raising` · `?shot=dc4` · `?shot=full` · `?shot=start` · `?showcase=1`.

## Playtest fix

- **City picks** use nearest-stamp hit testing in map units (radius 70). Phoenix’s HQ photo no longer steals Flagstaff / Tucson. Zoom and pan do not change who wins.
- **Calendar starts PAUSED.** 1× is ~5.6s / month. PAUSE is amber fill, 1× cyan, 4× red, plus a PAUSED / n× LIVE readout.
- **Raising DCs** each own a chess cell: dashed cyan reserve, `DC 1` / `DC 2` labels, no shared ghost canopy.
- **1280×800:** inspector queue + site stats scroll; event log stays docked under the yard (including while a site is open).

## Framing

Goldilocks yard scale **unchanged**: full pad + a bit of sand margin, about **76% of the yard box** (cap 800).

## Grow grid (hold)

```
        c0     c1     c2     c3     c4
   r0  BESS   BESS   BESS   BESS    —      rear cabinets
   r1  MCS    DC0    DC1    DC2    DC3     kit rank
   r2  MCS    aisle  aisle  aisle  aisle   drive
   r3  LNG    LNG    MKT    MKT     —      civic
```

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Flagstaff after Phoenix | **FIX** | Distance pick, not the HQ rectangle |
| Explore without the year racing | **FIX** | Boot paused; 1× is slow |
| Two raising DCs | **FIX** | Two reserved cells, two labels |
| 1280×800 HUD | **FIX** | Scroll dock for stats; log stays |
| Yard framing | **HOLD** | Stack still ~76% of yard (cap 800). |
| Brand | **HOLD** | Official cream/red wordmarks. |

Economy untouched. Night Shift untouched. Cache `rts-yard-12`.
