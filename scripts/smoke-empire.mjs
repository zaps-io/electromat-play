import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
let failed = 0;
const ok = (msg) => console.log("OK  ", msg);
const fail = (msg) => {
  failed = 1;
  console.error("FAIL", msg);
};

const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "styles.css"), "utf8");
const game = readFileSync(join(root, "game.js"), "utf8");
const review = readFileSync(join(root, "docs/shots/REVIEW.md"), "utf8");

if (/WattEV|wattev/i.test(html + css + game)) fail("WattEV branding leaked");
else ok("no WattEV branding");

for (const hex of ["#E63225", "#1E1E24", "#E89A2E", "#00D4F5", "#F5F0E8"]) {
  if (!css.toLowerCase().includes(hex.toLowerCase()) && !game.toLowerCase().includes(hex.toLowerCase())) {
    fail(`palette ${hex} missing`);
  }
}
if (!failed) ok("Zaps palette");

const cream = statSync(join(root, "assets/brand/zaps-wordmark-only-cream.svg")).size;
const red = statSync(join(root, "assets/brand/zaps-wordmark-only-red.svg")).size;
if (cream !== 1823 || red !== 1823) fail(`wordmarks must stay 1823 bytes (cream ${cream}, red ${red})`);
else ok("official 1823-byte wordmarks");

if (!html.includes("zaps-wordmark-only-cream.svg?v=canon-1823")) fail("cream wordmark not on the board");
else ok("wordmark on the resource bar");

for (const name of ["PILOT AGE", "FLEET AGE", "MEGAWATT AGE"]) {
  if (!game.includes(name)) fail(`missing age ${name}`);
}
if (!failed) ok("three ages");

for (const kind of ["hq", "dc", "mcs", "bess", "lounge", "market", "substation", "depot"]) {
  if (!game.includes(`${kind}:`)) fail(`missing building ${kind}`);
}
if (!failed) ok("command-card buildings");

for (const name of [
  "Compact EV hatch",
  "Sedan",
  "SUV",
  "Pickup",
  "Delivery van",
  "Box truck",
  "Class 8 semi",
  "Electric school bus",
]) {
  if (!game.includes(name)) fail(`missing vehicle ${name}`);
}
if (!game.includes('kind === "mcs"') && !game.includes("building.kind !== \"mcs\"")) {
  /* semi gate is the explicit return below */
}
if (!game.includes('kind === "semi" && building.kind !== "mcs"')) fail("semis must be refused off MCS");
else ok("eight vehicle types, semis on MCS only");

if (!game.includes("window.__EMPIRE_SMOKE__")) fail("smoke handle missing");
else ok("__EMPIRE_SMOKE__ successor");
for (const fn of ["crewScreen", "padScreen", "fast", "paid", "age"]) {
  if (!game.includes(`${fn}:`)) fail(`smoke.${fn} missing`);
}
if (!failed) ok("smoke can select, build, pay, and age");

const stills = [
  "docs/shots/aoe-region.png",
  "docs/shots/aoe-compound.png",
  "docs/shots/aoe-build.png",
  "docs/shots/aoe-select.png",
  "docs/shots/aoe-age.png",
  "docs/shots/aoe-vehicles.png",
  "docs/shots/aoe-contest.png",
];
for (const rel of stills) {
  const p = join(root, rel);
  if (!existsSync(p)) fail(`${rel} missing`);
  else if (statSync(p).size < 80000) fail(`${rel} too small`);
  else if (!review.includes(rel.split("/").pop())) fail(`REVIEW missing ${rel}`);
}
if (!failed) ok("seven AoE stills listed");

if (failed) {
  console.error("smoke-empire failed");
  process.exit(1);
}
console.log("smoke-empire passed");
