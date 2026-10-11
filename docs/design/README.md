# Empire AoE rebuild — design refs (2026-10-11)

- `empire-aoe-design.md`: rebuild spec from Claude Fable (claude-fable-5-1). Under 1,200 words, with the live-build critique folded in as section 8.
- `empire-live-critique.md`: the full 5-gap critique of 3 live screenshots.
- `art/*.jpg.b64`: concept art from gpt-image-2.5-sunburst via gpt-6-astra, 1536x1024. They're base64-encoded JPEG (q88) because the GitHub connector only writes text. Lossless PNG masters are on the shared box at `/workspace/electromat-iter-2026-10-11/art/`.

Decode them with `python3 docs/design/art/decode.py`, which writes `docs/design/art/*.jpg`. Don't commit the decoded JPEGs unless you mean to.

| File | What it is |
|---|---|
| a_hero_compound | AoE-style hero shot of the Arizona compound: canopies, MCS semi bay, BESS, lounge, substation, crew trucks building, EV queue, red banners |
| b_hud_mock | Full AoE-layout HUD: resource bar, age emblem, minimap, selection panel, 3x5 command grid |
| c_building_sheet | 8 buildings at a consistent iso angle: HQ, DC canopy, MCS gantry, BESS, substation, lounge, solar carport, crew depot |
| d_vehicle_sheet | 8 vehicles in SE view: hatch, sedan, SUV, pickup, step van, box truck, semi + trailer, e-bus |

The art contains no text or logos. The game overlays the official Zaps SVG.
