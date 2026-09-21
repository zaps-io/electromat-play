# Empire playtest — rts-yard-14

Stills: `board.png` · `yard-empty.png` · `rival-blocked.png` · `contested-share.png` · `field-call.png`

Replay: `?shot=board` · `?shot=empty` · `?shot=rival` · `?shot=contested` · `?shot=event` · `?shot=raising` · `?showcase=1`.

## Ownership (Victor)

Rival yards are **not** claimable dirt. VOLTSPAN / GRIDHAWK / ARCWAY compounds stay theirs. Deploying a pad on Los Angeles, Dallas, Denver, San Diego, El Paso, or Salt Lake City is blocked. The tray wears an amber **RIVAL SITE** why-chip and short copy. Empty Flagstaff / Tucson / Vegas still take a DC kit.

Contested means both already have a live (or raising) pad. You keep building on **your** yard and fight on price/share. You do not seize their compound.

## Interactivity

- **Price.** On a shared market, moving your $/kWh updates the Zaps vs rival share meters live and toasts the shift (`Vegas share 41% → 48%`). `[` `]` nudge a cent.
- **Contested view.** Site overlay + inspector show dual share meters. Rival-only sites show 0 / 100 and hide the slider.
- **Field calls.** Not log spam: rival undercut → MATCH / HOLD; grid strain (no BESS, high demand) → RAISE PRICE / WAIT. Badge reads **CALL**. Rare deals still use **DEALS**.
- **Construction.** Ghosts keep countdowns. Click a raising badge to inspect the job. Finished kit pops harder and toasts online.
- **Hotkeys.** `C` DC · `M` MCS · `B` BESS · `L` lounge · `K` market. Empty sites stay live in the tray.

## Framing (hold)

Goldilocks yard scale **unchanged**: full pad + a bit of sand margin, about **76% of the yard box** (cap 800). Chessboard snap, nearest-city hits (r=70), pause-on-new-game, EXIT/Esc, official 1.8KB wordmarks, economy core numbers.

## Playtest notes

1. Open `?shot=rival` — LA overlay reads RIVAL SITE, every tray tile is amber `RIVAL SITE`, DC click does not enqueue.
2. Open `?shot=empty` — Flagstaff dirt, DC is live, click queues a 2-month raise.
3. Open `?shot=contested` — Vegas meters Zaps vs VOLTSPAN; drag price, share toast/flash.
4. Open `?shot=event` — FIELD CALL sheet, MATCH PRICE vs HOLD RATE.
5. Phoenix still starts paused. Esc still exits the yard.

## Verdict

| Bar | Grade | Evidence |
|---|---|---|
| Rival pad seizure | **FIX** | LA/Dallas/Denver tray = RIVAL SITE; enqueue no-ops |
| Empty claim | **HOLD** | Flagstaff DC still deploys |
| Contested share | **RAISE** | Dual meters + price toast |
| Decision events | **RAISE** | Undercut / strain field calls |
| Construction pop | **HOLD+** | Click-inspect + louder pop |
| Flagstaff after Phoenix | **HOLD** | Distance pick, radius 70 |
| Explore without the year racing | **HOLD** | Boot paused; 1× is slow |
| Yard framing | **HOLD** | Stack still ~76% of yard (cap 800) |
| Brand | **HOLD** | Official cream/red wordmarks |

Economy untouched except share reacting to the price you already set. Night Shift untouched. Cache `rts-yard-14`.
