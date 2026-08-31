# Play ZAPS EMPIRE

**Public board:** [https://zaps-io.github.io/electromat-play/](https://zaps-io.github.io/electromat-play/)

The station is not built yet. The continent already is.

Static Civ / Command & Conquer charging-empire. Phoenix HQ. Sixteen cities across AZ NV CA NM CO UT TX. Deploy DC chargers, MCS, BESS, lounges, and markets. Cut deals, fight price wars, and hold the corridor against VOLTSPAN, GRIDHAWK, and ARCWAY (later REDNODE and AMPFIELD).

This is **not** the FPV night-shift game.

## Brand

Official cream/red Zaps wordmarks only (`assets/brand/wordmark-*.svg` and the kiosk bolt). Letterforms are never generated.

Palette: `#E63225` identity · `#1E1E24` charcoal · `#E89A2E` amber (information) · `#00D4F5` cyan (structure) · `#F5F0E8` cream yards · `#B8BCC0` chrome.

## How to play

1. Open the public link and click **OPEN THE BOARD**.
2. Read the Phoenix briefing, then enter the continent.
3. Click a city to zoom the yard. Each DC stall is a full cream lot. Phoenix HQ should read like an AoE town as you add kit.
4. Speed the calendar with PAUSE / 1× / 2× / 4× (or keys `Space`, `1`, `2`, `4`).
5. SAVE / LOAD writes this browser’s `localStorage`.
6. Incentive popups are almost gone. A deal, if it ever appears, is a toast plus the **DEALS** badge. A price war fires at most once per campaign, as a toast — never a modal stack.

Win by majority share in 12 cities, by holding all seven states with MCS in four cities, or by filling the treasury.

## Local

Any static server from this directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
