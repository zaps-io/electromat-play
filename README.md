# Play ZAPS EMPIRE

**Public board:** [https://zaps-io.github.io/electromat-play/](https://zaps-io.github.io/electromat-play/)

The station is not built yet. The continent already is.

Static Civ / Command & Conquer charging-empire. Phoenix HQ. Sixteen cities across AZ NV CA NM CO UT TX. Deploy DC chargers, MCS, BESS, lounges, and markets. Cut deals, fight price wars, and hold the corridor against VOLTSPAN, GRIDHAWK, and ARCWAY (later REDNODE and AMPFIELD).

This is **not** the FPV night-shift game.

## Brand

Official cream/red Zaps wordmarks only (`assets/brand/zaps-wordmark-only-*.svg`, viewBox 0 0 932 310 path fills). Kiosk bolt is `assets/brand/bolt-*.svg`. Letterforms are never generated. No CRT, scanlines, or mix-blend on the mark.

Palette: `#E63225` identity · `#1E1E24` charcoal · `#E89A2E` amber (information) · `#00D4F5` cyan (structure) · `#F5F0E8` cream yards · `#B8BCC0` chrome.

## How to play

1. Open the public link and click **OPEN THE BOARD**.
2. Read the Phoenix briefing, then enter the continent.
3. Click a city to zoom the yard to town scale. Compounds are 3/4-overhead RTS bases: Dispenser 1000 pedestals under a canopy, Power Cabinet 1500 cubes, DCC, rectifiers, BESS farm, lounge pavilion. The yard grows as kit lands.
4. Empty dirt can be claimed. Rival compounds (VOLTSPAN, GRIDHAWK, ARCWAY) stay theirs — compete on price and share, do not build on their pad.
5. The calendar **starts paused**. Speed it with PAUSE / 1× / 2× / 4× (or keys `Space`, `1`, `2`, `4`). 1× is a slow read-the-UI month. `C` `M` `B` `L` `K` deploy kit; `[` `]` nudge price.
6. SAVE / LOAD writes this browser’s `localStorage`.
7. Field calls (undercut / grid strain) ask MATCH or HOLD. Rare deals still use the **DEALS** badge — never a modal stack.

Win by majority share in 12 cities, by holding all seven states with MCS in four cities, or by filling the treasury.

## Local

Any static server from this directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
