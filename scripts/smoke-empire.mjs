#!/usr/bin/env node
/* rts-yard-15: terminal kit, contested depth, field calls, campaign track, cache. */
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

if (!html.includes('content="rts-yard-15"') || !html.includes("styles.css?v=rts-yard-15") || !html.includes("game.js?v=rts-yard-15")) {
  fail("index.html cache is not rts-yard-15");
} else ok("index.html cache rts-yard-15");

if (!game.includes("rts-yard-15") || !css.includes("rts-yard-15") || !review.includes("rts-yard-15")) {
  fail("game/styles/REVIEW cache is not rts-yard-15");
} else ok("game/styles/REVIEW cache rts-yard-15");

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

if (!game.includes('if (rivalSite(city)) return "RIVAL SITE"')) {
  fail("blockedReason must refuse rival compounds");
} else ok("blockedReason returns RIVAL SITE on rival pads");

if (!game.includes("function rivalSite") || !game.includes("function contestedCity") || !game.includes("function playerClaiming")) {
  fail("ownership helpers missing");
} else ok("ownership helpers present");

if (!game.includes("shareDuelHtml") || !css.includes(".share-duel") || !html.includes("site-overlay-intel")) {
  fail("contested share meters missing");
} else ok("contested share meters + site intel");

if (!game.includes('type: "undercut"') || !game.includes("GRID STRAIN") || !game.includes("MATCH PRICE")) {
  fail("field-call decision events missing");
} else ok("field-call undercut + grid strain");

if (!game.includes("applyPlayerPrice") || !game.includes("flashShare")) {
  fail("price share feedback missing");
} else ok("price share toast / flash");

if (!game.includes('c: "dc"') || !game.includes('k: "market"')) {
  fail("kit hotkeys missing");
} else ok("kit hotkeys C M B L K");

if (!game.includes('name === "rival"') || !game.includes('name === "contested"')) {
  fail("rival / contested shot modes missing");
} else ok("shot=rival and shot=contested");

if (!html.includes("Rival compounds stay theirs")) {
  fail("briefing should state rival pads are sealed");
} else ok("briefing ownership line");

if (!game.includes("function cofferGrid") || !css.includes(".site-coffer") || !game.includes("cylPost")) {
  fail("terminal canopy coffers / columns missing");
} else ok("cream canopy coffers + cylindrical posts");

if (!game.includes("holsterL") || !game.includes("holsterR") || !game.includes("site-dc-cable")) {
  fail("Slim Zeus DC row missing twin holsters");
} else ok("Slim Zeus DC row with twin holsters");

if (!css.includes(".site-lounge-edge") || !css.includes("#c8c2b6")) {
  fail("lounge must stay cream/amber, not cyan structure");
} else ok("lounge pavilion without forced cyan");

if (!game.includes("function winProgress") || !html.includes("hud-campaign") || !css.includes(".camp-bar")) {
  fail("campaign win track missing");
} else ok("HUD campaign track / winProgress");

if (!game.includes('type: "amenity"') || !game.includes('type: "poach"') || !game.includes("QUEUE LOUNGE")) {
  fail("amenity / poach field calls missing");
} else ok("amenity + poach field calls");

if (!game.includes("if (state.pendingEvent) openDealSheet()")) {
  fail("field calls must auto-open the sheet");
} else ok("field calls auto-open");

if (!html.includes("insp-triad") || !game.includes("CHARGE") || !css.includes(".insp-triad")) {
  fail("CHARGE / RELAX / DEPART triad missing");
} else ok("inspector CHARGE / RELAX / DEPART");

if (!game.includes("corridorPull") || !game.includes("contested ? 1.85")) {
  fail("contested price elasticity / corridor pull missing");
} else ok("contested markets pull harder on price");

if (!css.includes("toast-pop") || !css.includes("stat-tick") || !css.includes("transition: width 0.45s ease")) {
  fail("audio-less juice animations missing");
} else ok("toast / stat / meter juice");

if (process.exitCode) {
  console.error("smoke-empire failed");
  process.exit(process.exitCode);
}
console.log("smoke-empire passed");
