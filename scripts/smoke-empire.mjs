#!/usr/bin/env node
/* rts-yard-13: Flagstaff/Tucson hits, paused start, Goldilocks, cache. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const game = readFileSync(join(root, "game.js"), "utf8");
const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "styles.css"), "utf8");
const review = readFileSync(join(root, "docs/shots/REVIEW.md"), "utf8");

const fail = (msg) => {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
};
const ok = (msg) => console.log(`OK   ${msg}`);

if (!html.includes('content="rts-yard-13"') || !html.includes("styles.css?v=rts-yard-13") || !html.includes("game.js?v=rts-yard-13")) {
  fail("index.html cache is not rts-yard-13");
} else ok("index.html cache rts-yard-13");

if (!game.includes("rts-yard-13") || !css.includes("rts-yard-13") || !review.includes("rts-yard-13")) {
  fail("game/styles/REVIEW cache is not rts-yard-13");
} else ok("game/styles/REVIEW cache rts-yard-13");

if (!game.includes("const CITY_HIT_R = 70")) fail("CITY_HIT_R must stay 70");
else ok("CITY_HIT_R = 70");

if (!game.includes("Math.min(boxW * 0.76, 800)")) fail("Goldilocks frame drifted");
else ok("Goldilocks 76% / cap 800");

const grid = game.match(/const GRID = \{[\s\S]*?cols:\s*(\d+),\s*rows:\s*(\d+)/);
if (!grid || grid[1] !== "5" || grid[2] !== "4") fail("chessboard GRID cols/rows changed");
else ok("chessboard 5×4 unchanged");

const slots = [
  ["dc", "c: 1, r: 1"],
  ["mcs", "c: 0, r: 1"],
  ["bess", "c: 0, r: 0"],
  ["lounge", "c: 0, r: 3"],
  ["market", "c: 2, r: 3"],
];
for (const [kind, token] of slots) {
  if (!game.includes(token)) fail(`SLOTS.${kind} snap drifted (${token})`);
}
if (!process.exitCode) ok("SLOTS snap unchanged");

const cream = readFileSync(join(root, "assets/brand/zaps-wordmark-only-cream.svg"));
const red = readFileSync(join(root, "assets/brand/zaps-wordmark-only-red.svg"));
if (cream.byteLength !== 1823 || red.byteLength !== 1823) {
  fail(`wordmarks must stay 1823 bytes (cream ${cream.byteLength}, red ${red.byteLength})`);
} else ok("official 1.8KB cream/red wordmarks");

if (!/speed:\s*0/.test(game)) fail("freshState must start paused (speed: 0)");
else ok("freshState starts PAUSED");

if (!html.includes('data-speed="0" class="active"')) fail("PAUSE is not the default HUD control");
else ok("HUD PAUSE is default active");

const citiesMatch = game.match(/const CITIES = (\[[\s\S]*?\n  \]);/);
if (!citiesMatch) {
  fail("could not extract CITIES");
} else {
  const cities = Function(`"use strict"; return ${citiesMatch[1]}`)();
  const nearest = (x, y, r = 70) => {
    let best = null;
    let bestD = Infinity;
    for (const c of cities) {
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best && bestD <= r ? best : null;
  };
  const flag = cities.find((c) => c.id === "flagstaff");
  const tuc = cities.find((c) => c.id === "tucson");
  const phx = cities.find((c) => c.id === "phoenix");
  if (!flag || !tuc || !phx) fail("missing Flagstaff/Tucson/Phoenix");
  const hitFlag = nearest(flag.x, flag.y);
  const hitTuc = nearest(tuc.x, tuc.y);
  const hitPhx = nearest(phx.x, phx.y);
  if (hitFlag?.id !== "flagstaff") fail(`Flagstaff pin resolved ${hitFlag?.id}`);
  else ok("Flagstaff click stays Flagstaff");
  if (hitTuc?.id !== "tucson") fail(`Tucson pin resolved ${hitTuc?.id}`);
  else ok("Tucson click stays Tucson");
  if (hitPhx?.id !== "phoenix") fail(`Phoenix pin resolved ${hitPhx?.id}`);
  else ok("Phoenix click stays Phoenix");
  // HQ photo is large on screen; a click on Flagstaff/Tucson coords must not snap to Phoenix.
  if (nearest(flag.x, flag.y)?.id === "phoenix") fail("Phoenix stole Flagstaff");
  if (nearest(tuc.x, tuc.y)?.id === "phoenix") fail("Phoenix stole Tucson");
  const towardPhxFromFlag = nearest(flag.x + 6, flag.y + 18);
  if (towardPhxFromFlag?.id !== "flagstaff") fail(`near-Flagstaff click resolved ${towardPhxFromFlag?.id}`);
  else ok("near-Flagstaff still Flagstaff");
  const towardPhxFromTuc = nearest(tuc.x - 10, tuc.y - 20);
  if (towardPhxFromTuc?.id !== "tucson") fail(`near-Tucson click resolved ${towardPhxFromTuc?.id}`);
  else ok("near-Tucson still Tucson");
}

if (!game.includes("ghostBadge") || !css.includes("kit-pop")) {
  fail("construction badge / complete pop missing");
} else ok("raising badges + complete pop present");

if (!css.includes(".deploy.selected") || !css.includes(".deploy .why")) {
  fail("tray selected/disabled styles missing");
} else ok("tray selected + disabled reason styles");

if (process.exitCode) {
  console.error("smoke-empire failed");
  process.exit(process.exitCode);
}
console.log("smoke-empire passed");
