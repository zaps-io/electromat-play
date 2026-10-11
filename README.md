# Play ZAPS EMPIRE

**Public board:** [https://zaps-io.github.io/electromat-play/](https://zaps-io.github.io/electromat-play/)

The station is not built yet. The continent already is.

An Age of Empires loop on the Western Interconnect. One isometric map from the region down to a site. Crew trucks build the chargers. Traffic drives in and pays. Voltspan, Gridhawk, and Arcway contest the plots.

This is **not** the FPV night-shift game.

## Brand

Official cream/red Zaps wordmarks only (`assets/brand/zaps-wordmark-only-*.svg`, viewBox 0 0 932 310 path fills). Kiosk bolt is `assets/brand/bolt-*.svg`. Letterforms are never generated. No CRT, scanlines, or mix-blend on the mark.

Palette: `#E63225` identity · `#1E1E24` charcoal · `#E89A2E` amber (information) · `#00D4F5` cyan (structure) · `#F5F0E8` cream yards · `#B8BCC0` chrome.

## How to play

1. Open the public link. You start on the Phoenix plot in the Pilot Age.
2. Drag a box or click a crew truck. Right-click the ground to move, a resource node to gather, or a scaffold to build.
3. The command card at the bottom left raises buildings. `W` arms a DC row, then click a free pad on your plot. Semis arrive only after an MCS bay (`E`, Fleet Age).
4. The top bar is Capital, Grid MW, Permits, Copper, and Steel. The minimap is the bottom right.
5. Advance the age from the top plaque. Pilot is L2 and DC. Fleet unlocks MCS and BESS. Megawatt unlocks the depot and the substation tie-in.
6. Arrow keys pan. The wheel zooms from the region down to a site. A scout van clears the fog.

## Local

Any static server from this directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
