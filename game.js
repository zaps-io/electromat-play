/* ZAPS EMPIRE — Civ / C&C charging-continent board. Not the night-shift walk. */
/* empire-build: rts-yard-18 */
(() => {
  const SAVE_KEY = "zaps-empire-v2";
  const SAVE_LEGACY = "zaps-empire-v1";
  const YOU = "zaps";
  // 1× is read-the-UI pace (~5.6s / month). Start paused so explore is free.
  const TICK = { 0: 0, 1: 5600, 2: 2400, 4: 1000 };
  const CITY_HIT_R = 70;
  const MAX_CREWS = 3;
  const PAL = {
    red: "#E63225",
    charcoal: "#1E1E24",
    amber: "#E89A2E",
    cyan: "#00D4F5",
    cream: "#F5F0E8",
    steel: "#B8BCC0",
    pad: "#F5F0E8",
    dirt: "#1E1E24",
    ink: "#121217",
    panel: "#26262e",
    lot: "#F5F0E8",
  };
  const BOLT = "assets/brand/bolt-red.svg";
  const SPRITE_V = "rts-yard-18";
  const MAP_SPRITES = {
    flag: `assets/sprites/survey-flag.png?v=${SPRITE_V}`,
    dirt: `assets/sprites/dirt-pad.png?v=${SPRITE_V}`,
    vegas: `assets/sprites/vegas.png?v=${SPRITE_V}`,
    tucson: `assets/sprites/tucson.png?v=${SPRITE_V}`,
    plaza: `assets/sprites/plaza.png?v=${SPRITE_V}`,
    hq: `assets/sprites/phoenix-hq.png?v=${SPRITE_V}`,
    voltspan: `assets/sprites/voltspan.png?v=${SPRITE_V}`,
    rival: `assets/sprites/rival-depot.png?v=${SPRITE_V}`,
  };
  const SPRITE_ASPECT = {
    flag: "197 / 280",
    dirt: "220 / 131",
    vegas: "159 / 220",
    tucson: "239 / 181",
    plaza: "235 / 240",
    hq: "280 / 196",
    voltspan: "240 / 204",
    rival: "240 / 167",
  };
  const KIT_V = "rts-yard-18";
  const KIT_SPRITES = {
    dc: `assets/sprites/kit-dc.png?v=${KIT_V}`,
    mcs: `assets/sprites/kit-mcs.png?v=${KIT_V}`,
    bess: `assets/sprites/kit-bess.png?v=${KIT_V}`,
    lounge: `assets/sprites/kit-lounge.png?v=${KIT_V}`,
    market: `assets/sprites/kit-market.png?v=${KIT_V}`,
  };

  /*
   * Chessboard / AoE build grid on the 220×131 dirt diamond.
   * Equal cells (step NE == step SE). Every kit owns permanent
   * integer cells. Ghosts use the same slots as the finished piece.
   * Asphalt is a TILE UNION of occupied + reserved cells — never a
   * bounding-box empty lot, never sand between siblings.
   *
   *        c0     c1     c2     c3     c4
   *   r0  BESS   BESS   BESS   BESS    —      rear cabinets
   *   r1  MCS    DC0    DC1    DC2    DC3     kit rank
   *   r2  MCS    aisle  aisle  aisle  aisle   drive
   *   r3  LNG    LNG    MKT    MKT     —      civic
   *
   * DC fills left-to-right under one shared canopy. Photoreal kit
   * PNGs stay on the deploy tray. Yard is stylized RTS pieces.
   */
  const GRID = {
    x: 14.9,
    y: 53.2,
    ne: 39.0,
    se: 31.2,
    cols: 5,
    rows: 4,
    neK: 0.97,
    seK: 1.01,
  };
  const SLOTS = {
    dc: [
      { c: 1, r: 1, aisle: { c: 1, r: 2 } },
      { c: 2, r: 1, aisle: { c: 2, r: 2 } },
      { c: 3, r: 1, aisle: { c: 3, r: 2 } },
      { c: 4, r: 1, aisle: { c: 4, r: 2 } },
    ],
    mcs: [
      { c: 0, r: 1 },
      { c: 0, r: 2 },
    ],
    bess: [
      { c: 0, r: 0 },
      { c: 1, r: 0 },
      { c: 2, r: 0 },
      { c: 3, r: 0 },
    ],
    lounge: [
      { c: 0, r: 3 },
      { c: 1, r: 3 },
    ],
    market: [
      { c: 2, r: 3 },
      { c: 3, r: 3 },
    ],
  };
  const SITE_TYPE_NAME = {
    hq: "PHOENIX HQ",
    tucson: "TUCSON YARD",
    vegas: "VEGAS STALL",
    plaza: "ZAPS PLAZA",
    dirt: "DIRT PAD",
    flag: "SURVEY FLAG",
    voltspan: "VOLTSPAN",
    rival: "RIVAL DEPOT",
  };

  const BUILD = {
    dc: {
      id: "dc",
      name: "DC CHARGER",
      cost: 180000,
      months: 2,
      icon: `assets/sprites/kit-dc.png?v=${KIT_V}`,
      unique: false,
    },
    mcs: {
      id: "mcs",
      name: "MCS",
      cost: 420000,
      months: 3,
      icon: `assets/sprites/kit-mcs.png?v=${KIT_V}`,
      unique: false,
    },
    bess: {
      id: "bess",
      name: "BESS",
      cost: 650000,
      months: 4,
      icon: `assets/sprites/kit-bess.png?v=${KIT_V}`,
      unique: true,
    },
    lounge: {
      id: "lounge",
      name: "LOUNGE",
      cost: 280000,
      months: 3,
      icon: `assets/sprites/kit-lounge.png?v=${KIT_V}`,
      unique: true,
    },
    market: {
      id: "market",
      name: "MARKET",
      cost: 220000,
      months: 2,
      icon: `assets/sprites/kit-market.png?v=${KIT_V}`,
      unique: true,
    },
  };

  const RIVALS = {
    voltspan: { id: "voltspan", name: "VOLTSPAN", color: "#00D4F5", home: "la", unlock: 0, priceBias: 1.08 },
    gridhawk: { id: "gridhawk", name: "GRIDHAWK", color: "#E89A2E", home: "dallas", unlock: 0, priceBias: 0.9 },
    arcway: { id: "arcway", name: "ARCWAY", color: "#B8BCC0", home: "denver", unlock: 0, priceBias: 1.02 },
    rednode: { id: "rednode", name: "REDNODE", color: "#B8BCC0", home: "vegas", unlock: 18, priceBias: 0.94 },
    ampfield: { id: "ampfield", name: "AMPFIELD", color: "#00D4F5", home: "albuquerque", unlock: 24, priceBias: 1.0 },
  };

  const CITIES = [
    { id: "sacramento", name: "Sacramento", state: "CA", x: 235, y: 225, demand: 90, truck: 25, land: 1.15, neighbors: ["reno", "la"] },
    { id: "reno", name: "Reno", state: "NV", x: 285, y: 175, demand: 55, truck: 30, land: 0.9, neighbors: ["sacramento", "vegas", "slc"] },
    { id: "slc", name: "Salt Lake City", state: "UT", x: 400, y: 130, demand: 95, truck: 40, land: 1.05, neighbors: ["reno", "stgeorge", "grandjunction", "denver"] },
    { id: "grandjunction", name: "Grand Junction", state: "CO", x: 520, y: 210, demand: 40, truck: 35, land: 0.82, neighbors: ["denver", "flagstaff", "santafe", "slc"] },
    { id: "denver", name: "Denver", state: "CO", x: 640, y: 155, demand: 120, truck: 35, land: 1.2, neighbors: ["santafe", "grandjunction", "slc"] },
    { id: "la", name: "Los Angeles", state: "CA", x: 225, y: 455, demand: 210, truck: 55, land: 1.7, neighbors: ["vegas", "sandiego", "sacramento"] },
    { id: "vegas", name: "Las Vegas", state: "NV", x: 300, y: 330, demand: 140, truck: 50, land: 1.35, neighbors: ["phoenix", "la", "stgeorge", "reno"] },
    { id: "stgeorge", name: "St. George", state: "UT", x: 360, y: 285, demand: 45, truck: 28, land: 0.85, neighbors: ["vegas", "flagstaff", "slc"] },
    { id: "flagstaff", name: "Flagstaff", state: "AZ", x: 400, y: 370, demand: 50, truck: 22, land: 0.88, neighbors: ["phoenix", "stgeorge", "grandjunction"] },
    { id: "phoenix", name: "Phoenix", state: "AZ", x: 420, y: 455, demand: 150, truck: 45, land: 1.0, neighbors: ["tucson", "flagstaff", "vegas", "albuquerque"] },
    { id: "sandiego", name: "San Diego", state: "CA", x: 245, y: 555, demand: 130, truck: 30, land: 1.4, neighbors: ["la", "tucson"] },
    { id: "tucson", name: "Tucson", state: "AZ", x: 455, y: 545, demand: 80, truck: 30, land: 0.92, neighbors: ["phoenix", "elpaso", "sandiego"] },
    { id: "santafe", name: "Santa Fe", state: "NM", x: 600, y: 330, demand: 48, truck: 18, land: 0.95, neighbors: ["albuquerque", "denver", "grandjunction"] },
    { id: "albuquerque", name: "Albuquerque", state: "NM", x: 580, y: 420, demand: 85, truck: 40, land: 0.98, neighbors: ["phoenix", "santafe", "elpaso", "dallas"] },
    { id: "elpaso", name: "El Paso", state: "TX", x: 590, y: 560, demand: 75, truck: 55, land: 0.9, neighbors: ["tucson", "albuquerque", "dallas"] },
    { id: "dallas", name: "Dallas", state: "TX", x: 900, y: 430, demand: 170, truck: 80, land: 1.25, neighbors: ["albuquerque", "elpaso"] },
  ];

  const CITY_BY_ID = Object.fromEntries(CITIES.map((c) => [c.id, c]));

  const DEALS = {
    westbound: {
      title: "WESTBOUND FLEET",
      body: "A corridor hauler wants MCS in two cities. Sign and take a 12-month truck offtake — or keep the stalls public.",
      yes: "SIGN OFTAKE",
      no: "KEEP PUBLIC",
      accept() {
        state.cash += 420000;
        log("Fleet offtake signed. +$420K now, truck demand lifts where you hold MCS.", "deal");
        toast("Offtake signed. +$420K.", "good");
        for (const c of CITIES) if (state.cities[c.id].sites[YOU].mcs) state.cities[c.id].truckBoost += 8;
      },
    },
    rebate: {
      title: "UTILITY REBATE",
      body: "The interconnect desk will rebate a BESS if you commit to peak shave in any live city.",
      yes: "TAKE REBATE",
      no: "PASS",
      accept() {
        const live = CITIES.find((c) => hasCap(state.cities[c.id].sites[YOU]));
        if (!live) return;
        if (!state.cities[live.id].sites[YOU].bess) {
          state.cities[live.id].sites[YOU].bess = 1;
          log(`Rebate BESS drops in ${live.name}.`, "good");
          toast(`Rebate BESS online in ${live.name}.`, "good");
        } else {
          state.cash += 280000;
          log("Rebate arrives as cash. +$280K.", "good");
          toast("Rebate arrives as cash. +$280K.", "good");
        }
      },
    },
    land: {
      title: "LAND OPTION",
      body: "A dirt parcel next to an empty node is cheap this month. Exercise and the next deploy anywhere is 30% off.",
      yes: "EXERCISE",
      no: "LET IT GO",
      accept() {
        state.landOption = 1;
        log("Land option live. Next deploy is 30% off.", "deal");
        toast("Land option live. Next deploy −30%.", "deal");
      },
    },
    ceiling: {
      title: "PRICE CEILING",
      body: "A city desk wants a consumer ceiling. Drop Phoenix price to $0.34/kWh for 6 months in exchange for loyalty.",
      yes: "CUT PHOENIX",
      no: "HOLD RATE",
      accept() {
        state.cities.phoenix.price[YOU] = 0.34;
        state.cities.phoenix.war = 0;
        log("Phoenix ceiling accepted. Share should thicken.", "deal");
        toast("Phoenix ceiling accepted.", "deal");
      },
    },
    surge: {
      title: "CREW SURGE",
      body: "A civil crew can burn a month of calendar if you float their overtime.",
      yes: "PAY OVERTIME ($180K)",
      no: "KEEP THE QUEUE",
      accept() {
        if (state.cash < 180000) {
          log("Overtime declined — treasury too thin.", "bad");
          toast("Treasury too thin for overtime.", "bad");
          return;
        }
        state.cash -= 180000;
        for (const q of state.queue) if (q.faction === YOU) q.left = Math.max(1, q.left - 1);
        log("Crew surge. Your jobs pull one month forward.", "good");
        toast("Crew surge. Jobs pull one month forward.", "good");
      },
    },
  };

  const $ = (id) => document.getElementById(id);
  const money = (n) => {
    const sign = n < 0 ? "-" : "";
    const v = Math.abs(Math.round(n));
    if (v >= 1e6) return `${sign}$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `${sign}$${(v / 1e3).toFixed(0)}K`;
    return `${sign}$${v}`;
  };

  let state = null;
  let selected = "phoenix";
  let timer = null;
  let lastNet = 0;
  let mapCam = { scale: 1, x: 0, y: 0 };
  let interconnectCam = { scale: 1, x: 0, y: 0 };
  let siteView = null;
  let mapDrag = null;
  let lastPan = false;
  let armedKit = null;
  let hoverKit = null;
  let slotOverride = null;
  let inspectJob = null;
  let pops = [];
  let yardFlash = null;
  let queuePulse = 0;
  let lastPriceToast = { city: "", at: 0, from: 0, to: 0 };

  function emptySite() {
    return { dc: 0, mcs: 0, bess: 0, lounge: 0, market: 0 };
  }

  function factionIds() {
    return [YOU, ...Object.keys(RIVALS)];
  }

  function cityState(id) {
    const sites = {};
    const price = {};
    for (const f of factionIds()) {
      sites[f] = emptySite();
      price[f] = 0.42;
    }
    return {
      id,
      congestion: 0.2,
      sites,
      price,
      war: 0,
      truckBoost: 0,
    };
  }

  function freshState() {
    const cities = {};
    for (const c of CITIES) cities[c.id] = cityState(c.id);

    cities.phoenix.sites.zaps.dc = 2;
    cities.phoenix.sites.zaps.lounge = 1;
    cities.phoenix.price.zaps = 0.4;

    cities.la.sites.voltspan.dc = 3;
    cities.sandiego.sites.voltspan.dc = 1;
    cities.la.price.voltspan = 0.46;

    cities.dallas.sites.gridhawk.dc = 3;
    cities.elpaso.sites.gridhawk.dc = 1;
    cities.dallas.price.gridhawk = 0.36;

    cities.denver.sites.arcway.dc = 2;
    cities.slc.sites.arcway.dc = 1;
    cities.denver.price.arcway = 0.43;

    return {
      month: 1,
      cash: 2400000,
      speed: 0,
      log: ["Phoenix HQ online. Two DC stalls live. The dirt still outnumbers you."],
      queue: [],
      cities,
      unlocked: ["voltspan", "gridhawk", "arcway"],
      debtStreak: 0,
      nextDeal: 48 + Math.floor(Math.random() * 20),
      pendingDeal: null,
      pendingEvent: null,
      nextEvent: 2 + Math.floor(Math.random() * 2),
      pendingFork: null,
      forkShown: false,
      buildPath: null,
      warFired: false,
      over: null,
      crewPosture: "raise",
      idleMonths: 0,
      pressure: 0,
      pressureEventAt: 0,
      lastObjective: "",
      objective: {
        id: "expand",
        kind: "expand",
        title: "CLAIM A NEIGHBOR",
        detail: "Land DC or MCS on Flagstaff or Tucson before month 4. Rival pads stay theirs.",
        left: 3,
        total: 3,
      },
      scout: null,
      intel: {},
      skirmish: null,
    };
  }

  function hasCap(site) {
    return site.dc + site.mcs > 0;
  }

  function rivalHolders(city) {
    return activeRivals().filter((r) => city.sites[r.id] && hasCap(city.sites[r.id]));
  }

  function playerClaiming(city) {
    return (
      hasCap(city.sites[YOU]) ||
      jobsFor(city.id, YOU).some((j) => j.type === "dc" || j.type === "mcs")
    );
  }

  // Rival holds the pad and Zaps has no live/raising claim.
  // Empty dirt stays claimable. Contested (both present) stays your yard.
  function rivalSite(city) {
    return rivalHolders(city).length > 0 && !playerClaiming(city);
  }

  function contestedCity(city) {
    return playerClaiming(city) && rivalHolders(city).length > 0;
  }

  function capacity(site) {
    return site.dc * 1 + site.mcs * 2.35 + site.bess * 0.35;
  }

  function amenity(site) {
    return 1 + (site.lounge ? 0.14 : 0) + (site.market ? 0.1 : 0);
  }

  function siteCount(site) {
    return site.dc + site.mcs + (site.bess ? 1 : 0) + (site.lounge ? 1 : 0) + (site.market ? 1 : 0);
  }

  function compoundTier(site) {
    const n = siteCount(site);
    if (n >= 6) return 3;
    if (n >= 3) return 2;
    if (n >= 1) return 1;
    return 0;
  }

  function corridorPull(city, faction) {
    const meta = CITY_BY_ID[city.id];
    if (!meta) return 1;
    let n = 0;
    for (const nid of meta.neighbors) {
      const neighbor = state.cities[nid];
      if (neighbor && hasCap(neighbor.sites[faction])) n += 1;
    }
    return 1 + Math.min(0.16, n * 0.04);
  }

  function recomputeShare(city) {
    const attr = {};
    let sum = 0;
    const contested = hasCap(city.sites[YOU]) && rivalHolders(city).length > 0;
    const exp = contested ? 1.85 : 1.4;
    for (const f of factionIds()) {
      const site = city.sites[f];
      if (!hasCap(site)) {
        attr[f] = 0;
        continue;
      }
      const price = Math.max(0.26, city.price[f] || 0.42);
      const war = city.war > 0 ? 1.12 : 1;
      let a =
        capacity(site) *
        amenity(site) *
        Math.pow(0.48 / price, exp) *
        war *
        corridorPull(city, f);
      if (state.skirmish && state.skirmish.city === city.id) {
        if (f === YOU) a *= 1 + (state.skirmish.you || 0) / 700;
        else if (f === state.skirmish.rival) a *= 1 + (state.skirmish.them || 0) / 700;
      }
      if (state.crewPosture === "respond" && contested && f === YOU) a *= 1.06;
      attr[f] = a;
      sum += a;
    }
    const share = {};
    for (const f of factionIds()) share[f] = sum ? attr[f] / sum : 0;
    city.share = share;
    return share;
  }

  function allShares() {
    for (const id of Object.keys(state.cities)) recomputeShare(state.cities[id]);
  }

  function cityIncome(city, faction) {
    const site = city.sites[faction];
    if (!hasCap(site)) return 0;
    const meta = CITY_BY_ID[city.id];
    const share = city.share[faction] || 0;
    const dcKwh = site.dc * 620 * 26 * (meta.demand / 100);
    const mcsKwh = site.mcs * 2800 * 14 * ((meta.truck + (city.truckBoost || 0)) / 40);
    const bess = site.bess ? 1.16 : 1;
    const kwh = (dcKwh + mcsKwh) * share * amenity(site) * bess;
    const retail = site.market ? share * 2200 * (meta.demand / 80) : 0;
    const lounge = site.lounge ? share * 1600 : 0;
    return kwh * city.price[faction] + retail + lounge;
  }

  function cityOpex(city, faction) {
    const site = city.sites[faction];
    const stalls = site.dc + site.mcs;
    if (!stalls && !site.bess && !site.lounge && !site.market) return 0;
    const meta = CITY_BY_ID[city.id];
    return stalls * 1400 * meta.land + site.bess * 900 + site.lounge * 700 + site.market * 600;
  }

  function presenceCount(faction) {
    return CITIES.filter((c) => hasCap(state.cities[c.id].sites[faction])).length;
  }

  function continentalShare() {
    let you = 0;
    let all = 0;
    for (const c of CITIES) {
      const city = state.cities[c.id];
      recomputeShare(city);
      const cap = factionIds().reduce((s, f) => s + capacity(city.sites[f]), 0);
      if (!cap) continue;
      you += (city.share[YOU] || 0) * c.demand;
      all += c.demand;
    }
    return all ? you / all : 0;
  }

  function campaignPhase() {
    const n = presenceCount(YOU);
    if (n >= 10) return "PHASE EMPIRE";
    if (n >= 4) return "PHASE CORRIDOR";
    return "PHASE HQ";
  }

  function log(msg, kind = "") {
    state.log.unshift({ t: state.month, msg, kind });
    state.log = state.log.slice(0, 40);
    renderTicker();
  }

  function toast(msg, kind = "deal") {
    const host = $("toasts");
    if (!host) return;
    // identical kit-complete toast already on screen — one node per completion
    if (msg.indexOf("COMPLETE ·") !== -1 && [...host.children].some((n) => n.textContent === msg)) return;
    const el = document.createElement("div");
    el.className = `toast ${kind} pop-in`;
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => el.remove(), 4600);
    while (host.children.length > 3) host.firstElementChild.remove();
  }

  function setStat(id, value, warn) {
    const el = $(id);
    if (!el) return;
    if (el.textContent !== value) {
      el.textContent = value;
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
    if (warn != null) el.classList.toggle("warn", Boolean(warn));
  }

  function flashShare(city, from, to) {
    city.shareFlash = { from, to, until: Date.now() + 1400 };
    const delta = to - from;
    if (delta === 0) {
      toast(`${CITY_BY_ID[city.id].name} share holds ${to}%`, "deal");
      return;
    }
    toast(
      `${CITY_BY_ID[city.id].name} share ${from}% → ${to}%`,
      delta > 0 ? "good" : "bad"
    );
  }

  function applyPlayerPrice(city, next, prevShare) {
    const prev = prevShare != null ? prevShare : Math.round((city.share[YOU] || 0) * 100);
    city.price[YOU] = Math.max(0.28, Math.min(0.58, +Number(next).toFixed(2)));
    city.war = Math.max(city.war, 2);
    recomputeShare(city);
    const after = Math.round((city.share[YOU] || 0) * 100);
    if (rivalHolders(city).length && hasCap(city.sites[YOU])) {
      const now = Date.now();
      const same =
        lastPriceToast.city === city.id &&
        now - lastPriceToast.at < 900 &&
        lastPriceToast.from === prev &&
        lastPriceToast.to === after;
      if (!same) {
        flashShare(city, prev, after);
        lastPriceToast = { city: city.id, at: now, from: prev, to: after };
      }
    }
  }

  function crewCap() {
    return state?.crewPosture === "respond" ? MAX_CREWS - 1 : MAX_CREWS;
  }

  function crewsBusy() {
    const builds = state.queue.filter((q) => q.left > 0 && q.faction === YOU).length;
    const scouting = state.scout && state.scout.left > 0 ? 1 : 0;
    return builds + scouting;
  }

  function jobsFor(cityId, faction = YOU) {
    return state.queue.filter((q) => q.city === cityId && q.faction === faction && q.left > 0);
  }

  function raisingCount(cityId, type, faction = YOU) {
    return state.queue.filter((q) => q.city === cityId && q.type === type && q.faction === faction && q.left > 0).length;
  }

  function raisingType(cityId, type, faction = YOU) {
    return raisingCount(cityId, type, faction) > 0;
  }

  function deployCost(type, cityId) {
    const meta = CITY_BY_ID[cityId];
    let n = Math.round(BUILD[type].cost * meta.land);
    if (state.landOption) n = Math.round(n * 0.7);
    return n;
  }

  function blockedReason(type, cityId) {
    if (state.over) return "CAMPAIGN OVER";
    const city = state.cities[cityId];
    const spec = BUILD[type];
    const site = city.sites[YOU];
    if (rivalSite(city)) return "RIVAL SITE";
    if (state.cash < deployCost(type, cityId)) return "NEED CASH";
    if (crewsBusy() >= crewCap()) return "CREWS FULL";
    if (spec.unique && (site[type] > 0 || state.queue.some((q) => q.city === cityId && q.type === type && q.faction === YOU))) {
      return "ALREADY BUILT";
    }
    if (
      (type === "mcs" || type === "lounge" || type === "market" || type === "bess") &&
      !hasCap(site) &&
      !state.queue.some((q) => q.city === cityId && q.faction === YOU && (q.type === "dc" || q.type === "mcs"))
    ) {
      return "NEED PAD";
    }
    return "";
  }

  function canDeploy(type, cityId) {
    return !blockedReason(type, cityId);
  }

  function liveDcIndexList(site) {
    if (Array.isArray(site.dcSlots) && site.dcSlots.length === site.dc) {
      return site.dcSlots.filter((n) => n >= 0 && n < 4).slice(0, site.dc);
    }
    return Array.from({ length: Math.min(4, Math.max(0, site.dc)) }, (_, i) => i);
  }

  function emptyDcSlots(used) {
    return [0, 1, 2, 3].filter((i) => !used.has(i));
  }

  function runLength(set) {
    let best = 0;
    let cur = 0;
    for (let i = 0; i < 4; i += 1) {
      if (set.has(i)) {
        cur += 1;
        if (cur > best) best = cur;
      } else cur = 0;
    }
    return best;
  }

  // Prefer the stall that closes a canopy gap or reaches the 3-stall coffer
  // row. Lounge column (DC slot 0) wins only when the canopy score ties.
  function smartDcSlot(used, city) {
    const empty = emptyDcSlots(used);
    if (!empty.length) return null;
    const lounge = city.sites[YOU].lounge > 0 || raisingType(city.id, "lounge");
    let best = empty[0];
    let bestScore = -Infinity;
    for (const i of empty) {
      const next = new Set(used);
      next.add(i);
      const left = used.has(i - 1);
      const right = used.has(i + 1);
      const run = runLength(next);
      let score = 0;
      if (left || right) score += 5;
      if (left && right) score += 8;
      if (run >= 3 && runLength(used) < 3) score += 7;
      else if (run >= 2 && runLength(used) < 2) score += 3;
      if (lounge && i === 0) score += 1.5;
      score += (4 - i) * 0.05;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  }

  function chosenSlot(city, type, used) {
    if (
      slotOverride &&
      slotOverride.city === city.id &&
      slotOverride.type === type &&
      Number.isInteger(slotOverride.slot) &&
      !used.has(slotOverride.slot)
    ) {
      return slotOverride.slot;
    }
    if (type === "dc") return smartDcSlot(used, city);
    return 0;
  }

  function dcPlacement(city, previewType) {
    const site = city.sites[YOU];
    const live = liveDcIndexList(site);
    const used = new Set(live);
    const raising = [];
    for (const job of jobList(city.id, "dc")) {
      let slot = Number.isInteger(job.slot) ? job.slot : -1;
      if (slot < 0 || slot > 3 || used.has(slot)) {
        slot = [0, 1, 2, 3].find((i) => !used.has(i));
      }
      if (slot == null) continue;
      used.add(slot);
      raising.push({ slot, job, preview: false });
    }
    if (previewType === "dc" && used.size < 4 && !blockedReason("dc", city.id)) {
      const slot = chosenSlot(city, "dc", used);
      if (slot != null && !used.has(slot)) {
        used.add(slot);
        raising.push({ slot, job: null, preview: true });
      }
    }
    return { live, raising, used };
  }

  function dcJobView(item) {
    if (!item) return null;
    if (item.preview) return { left: BUILD.dc.months, pct: 0.22, preview: true };
    return { left: item.job.left, pct: jobPct(item.job, "dc"), preview: false };
  }

  function signedMoney(n) {
    if (n < 0) return money(n);
    return `+${money(n)}`;
  }

  function placementRead(city, type) {
    if (!city || !BUILD[type] || blockedReason(type, city.id)) return "";
    const site = city.sites[YOU];
    const snap = {
      dc: site.dc,
      mcs: site.mcs,
      bess: site.bess,
      lounge: site.lounge,
      market: site.market,
      share: city.share,
    };
    let label = "";
    let tail = "";
    if (type === "dc") {
      const plan = dcPlacement(city, null);
      const slot = chosenSlot(city, "dc", plan.used);
      const next = new Set(plan.used);
      if (slot != null) next.add(slot);
      const beforeRun = runLength(plan.used);
      const run = runLength(next);
      const gap = slot != null && plan.used.has(slot - 1) && plan.used.has(slot + 1);
      const completes = gap || (run >= 3 && beforeRun < 3) || (run >= 2 && beforeRun === 1);
      const loungeAdj = (snap.lounge > 0 || raisingType(city.id, "lounge")) && slot === 0;
      let why = completes ? "COMPLETES CANOPY" : `CANOPY ${Math.min(4, plan.used.size + 1)}/4`;
      if (loungeAdj && completes) why = "COMPLETES CANOPY · LOUNGE ADJACENT";
      else if (loungeAdj) why = "LOUNGE ADJACENT";
      const n = slot == null ? snap.dc + 1 : slot + 1;
      label = `DC ${n} · ${why}`;
      tail = emptyDcSlots(plan.used).length > 1 ? " · CLICK CELL" : "";
    } else if (type === "lounge") {
      label = snap.market > 0 ? "LOUNGE · ADJACENT MARKET · amenity pull" : "LOUNGE · AMENITY PULL +14%";
    } else if (type === "market") {
      label = snap.lounge > 0 ? "MARKET · ADJACENT LOUNGE · amenity pull" : "MARKET · AMENITY PULL +10%";
    } else if (type === "mcs") label = "MCS · CORRIDOR PULL";
    else if (type === "bess") label = "BESS · GRID ×1.16";
    const beforeNet = cityIncome(city, YOU) - cityOpex(city, YOU);
    const beforeShare = city.share[YOU] || 0;
    try {
      if (BUILD[type].unique) site[type] = 1;
      else site[type] += 1;
      recomputeShare(city);
      const afterNet = cityIncome(city, YOU) - cityOpex(city, YOU);
      const afterShare = city.share[YOU] || 0;
      const dNet = afterNet - beforeNet;
      const dShare = Math.round((afterShare - beforeShare) * 100);
      const shareBit = rivalHolders(city).length
        ? ` · share ${dShare >= 0 ? "+" : ""}${dShare}%`
        : "";
      return `${label} · est. ${signedMoney(dNet)}/mo${shareBit}${tail}`;
    } finally {
      site.dc = snap.dc;
      site.mcs = snap.mcs;
      site.bess = snap.bess;
      site.lounge = snap.lounge;
      site.market = snap.market;
      city.share = snap.share;
      recomputeShare(city);
    }
  }

  function enqueue(type, cityId, faction = YOU) {
    const spec = BUILD[type];
    const cost = faction === YOU ? deployCost(type, cityId) : Math.round(spec.cost * 0.9);
    if (faction === YOU) {
      if (!canDeploy(type, cityId)) return false;
      state.cash -= cost;
      if (state.landOption) state.landOption = 0;
    }
    const city = state.cities[cityId];
    const claimEmpty =
      faction === YOU &&
      !hasCap(city.sites[YOU]) &&
      !rivalSite(city) &&
      (type === "dc" || type === "mcs");
    let slot = null;
    if (faction === YOU && type === "dc") {
      const plan = dcPlacement(city, null);
      slot = chosenSlot(city, "dc", plan.used);
      slotOverride = null;
    }
    state.queue.push({
      faction,
      city: cityId,
      type,
      left: spec.months,
      cost,
      claimEmpty,
      slot,
    });
    if (faction === YOU) {
      log(`${spec.name} queued in ${CITY_BY_ID[cityId].name} · ${spec.months} mo · ${money(cost)}`);
      toast(`${spec.name} raising · ${CITY_BY_ID[cityId].name}`, "good");
    }
    renderAll();
    return true;
  }

  function finishBuild(job) {
    const city = state.cities[job.city];
    if (job.faction === YOU && rivalSite(city) && !job.claimEmpty) {
      state.cash += job.cost || 0;
      log(`Crews cannot seize ${CITY_BY_ID[job.city].name} — rival compound.`, "bad");
      toast(`RIVAL SITE · ${CITY_BY_ID[job.city].name} stays theirs.`, "bad");
      return;
    }
    const site = city.sites[job.faction];
    let placedSlot = null;
    if (job.type === "dc" && job.faction === YOU) {
      const live = liveDcIndexList(site);
      placedSlot = Number.isInteger(job.slot) && !live.includes(job.slot)
        ? job.slot
        : [0, 1, 2, 3].find((i) => !live.includes(i));
      site.dc += 1;
      if (placedSlot != null) site.dcSlots = live.concat(placedSlot);
    } else if (BUILD[job.type].unique) site[job.type] = 1;
    else site[job.type] += 1;
    if (job.faction === YOU) {
      pops.push({
        city: job.city,
        type: job.type,
        slot: placedSlot != null ? placedSlot : Math.max(0, site[job.type] - 1),
        until: Date.now() + 2200,
      });
      yardFlash = { city: job.city, until: Date.now() + 780 };
      toast(`${BUILD[job.type].name} COMPLETE · ${CITY_BY_ID[job.city].name}`, "good");
    }
    const who = job.faction === YOU ? "Zaps" : RIVALS[job.faction].name;
    log(`${who} brings ${BUILD[job.type].name} online in ${CITY_BY_ID[job.city].name}.`, job.faction === YOU ? "good" : "bad");
  }

  function activeRivals() {
    return Object.values(RIVALS).filter((r) => state.month >= r.unlock);
  }

  function rivalCash(rid) {
    return 900000 + state.month * 120000 + presenceCount(rid) * 180000;
  }

  function rivalBuildType(site, fighting) {
    const path = state.buildPath;
    if (path === "amenity") {
      if (hasCap(site) && site.mcs < 2) return "mcs";
      if (hasCap(site) && site.dc < 3) return "dc";
      if (hasCap(site) && !site.bess && state.month > 8) return "bess";
      if (hasCap(site) && !site.lounge) return "lounge";
      return "dc";
    }
    if (path === "corridor") {
      if (hasCap(site) && !site.lounge) return "lounge";
      if (hasCap(site) && site.lounge && !site.market) return "market";
      if (hasCap(site) && site.dc >= 2 && site.mcs < 1) return "mcs";
      if (hasCap(site) && !site.bess && state.month > 10) return "bess";
      return site.dc < 3 ? "dc" : "mcs";
    }
    if (fighting && hasCap(site) && !site.lounge) return "lounge";
    if (fighting && hasCap(site) && !site.market && site.lounge) return "market";
    if (hasCap(site) && site.dc >= 2 && site.mcs < 2) return "mcs";
    if (hasCap(site) && !site.lounge && site.dc >= 2) return "lounge";
    if (hasCap(site) && !site.bess && state.month > 10) return "bess";
    if (hasCap(site) && !site.market && site.lounge) return "market";
    return "dc";
  }

  function rivalAct(rid) {
    const rival = RIVALS[rid];
    if (state.month === rival.unlock) {
      state.unlocked.push(rid);
      const home = state.cities[rival.home];
      home.sites[rid].dc = Math.max(home.sites[rid].dc, 2);
      log(`${rival.name} enters ${CITY_BY_ID[rival.home].name}.`, "bad");
    }
    const mine = CITIES.filter((c) => hasCap(state.cities[c.id].sites[rid]));
    const frontier = new Set(mine.map((c) => c.id));
    for (const c of mine) for (const n of c.neighbors) frontier.add(n);
    if (!frontier.size) frontier.add(rival.home);

    const targets = [...frontier].sort((a, b) => {
      const ca = state.cities[a];
      const cb = state.cities[b];
      const score = (id, city) =>
        CITY_BY_ID[id].demand * (1.15 - (city.share[rid] || 0)) -
        capacity(city.sites[rid]) * 20 +
        (hasCap(city.sites[YOU]) ? 55 : 0);
      return score(b, cb) - score(a, ca);
    });

    const targetId = targets[0];
    if (!targetId) return;
    const city = state.cities[targetId];
    const site = city.sites[rid];
    const budget = rivalCash(rid);
    const fighting = hasCap(city.sites[YOU]);
    const type = rivalBuildType(site, fighting);
    if (budget > BUILD[type].cost && state.queue.filter((q) => q.faction === rid).length < 2) {
      enqueue(type, targetId, rid);
    }
    const path = state.buildPath;
    const cutP = path === "amenity" ? 0.46 : path === "corridor" ? 0.18 : 0.28;
    const cutStep = path === "amenity" ? 0.02 : 0.01;
    if (fighting && Math.random() < cutP) {
      city.price[rid] = Math.max(0.28, +(city.price[rid] - cutStep).toFixed(2));
    }
    maybeRivalWar(rid, targetId);
  }

  function maybeRivalWar(rid, targetId) {
    if (state.warFired) return;
    const city = state.cities[targetId];
    const rival = RIVALS[rid];
    if (!hasCap(city.sites[YOU])) return;
    if ((city.share[YOU] || 0) <= 0.45 || city.price[rid] <= 0.32) return;
    if (Math.random() > 0.02) return;
    state.warFired = true;
    city.price[rid] = Math.max(0.28, +(city.price[rid] - 0.03).toFixed(2));
    city.war = 3;
    const cityName = CITY_BY_ID[targetId].name;
    log(`${rival.name} opens a price war in ${cityName}.`, "deal");
    toast(`${rival.name} PRICE WAR · ${cityName}`, "bad");
    if (!state.pendingDeal && !state.pendingEvent) {
      state.pendingEvent = { type: "undercut", city: targetId, rival: rid, cut: 0.03, war: true };
    }
  }

  function tryUndercutEvent() {
    const spots = CITIES.filter((c) => {
      const city = state.cities[c.id];
      return hasCap(city.sites[YOU]) && rivalHolders(city).length;
    });
    if (!spots.length || Math.random() > 0.62) return false;
    const meta = spots[Math.floor(Math.random() * spots.length)];
    const city = state.cities[meta.id];
    const rival = strongestRival(city);
    if (!rival) return false;
    const cut = 0.03;
    city.price[rival.id] = Math.max(0.28, +(city.price[rival.id] - cut).toFixed(2));
    if (state.crewPosture === "respond") {
      city.price[rival.id] = Math.min(0.58, +(city.price[rival.id] + 0.01).toFixed(2));
    }
    state.pendingEvent = { type: "undercut", city: meta.id, rival: rival.id, cut };
    log(`${rival.name} undercuts in ${meta.name}.`, "deal");
    toast(`${rival.name} UNDERCUTS · ${meta.name}`, "bad");
    openSkirmish(meta.id, rival.id, "price");
    return true;
  }

  function tryStrainEvent() {
    const strained = CITIES.filter((c) => {
      const city = state.cities[c.id];
      return hasCap(city.sites[YOU]) && !city.sites[YOU].bess && CITY_BY_ID[c.id].demand >= 80;
    });
    if (!strained.length || Math.random() > 0.5) return false;
    const meta = strained[Math.floor(Math.random() * strained.length)];
    state.pendingEvent = { type: "strain", city: meta.id };
    log(`Grid strain in ${meta.name}. Desk wants a call.`, "deal");
    toast(`GRID STRAIN · ${meta.name}`, "deal");
    return true;
  }

  function tryAmenityEvent() {
    const spots = CITIES.filter((c) => {
      const city = state.cities[c.id];
      const rival = strongestRival(city);
      return (
        hasCap(city.sites[YOU]) &&
        rival &&
        city.sites[rival.id].lounge &&
        !city.sites[YOU].lounge
      );
    });
    if (!spots.length || Math.random() > 0.55) return false;
    const meta = spots[Math.floor(Math.random() * spots.length)];
    const city = state.cities[meta.id];
    const rival = strongestRival(city);
    state.pendingEvent = { type: "amenity", city: meta.id, rival: rival.id };
    log(`${rival.name} lounge is drawing share in ${meta.name}.`, "deal");
    toast(`${rival.name} LOUNGE · ${meta.name}`, "deal");
    openSkirmish(meta.id, rival.id, "amenity");
    return true;
  }

  function tryPoachEvent() {
    const spots = CITIES.filter((c) => {
      const city = state.cities[c.id];
      return hasCap(city.sites[YOU]) && rivalHolders(city).length && (city.share[YOU] || 0) >= 0.62;
    });
    if (!spots.length || Math.random() > 0.58) return false;
    const meta = spots[Math.floor(Math.random() * spots.length)];
    const city = state.cities[meta.id];
    const rival = strongestRival(city);
    if (!rival) return false;
    city.price[rival.id] = Math.max(0.28, +(city.price[rival.id] - 0.02).toFixed(2));
    state.pendingEvent = { type: "poach", city: meta.id, rival: rival.id, cut: 0.02 };
    log(`${rival.name} poaches ${meta.name} with a corridor rate.`, "deal");
    toast(`${rival.name} POACHES · ${meta.name}`, "bad");
    openSkirmish(meta.id, rival.id, "price");
    return true;
  }

  function threatCall(city) {
    if (!city || !contestedCity(city)) return null;
    const rival = strongestRival(city);
    if (!rival) return null;
    const you = city.sites[YOU];
    const them = city.sites[rival.id];
    const yours = city.price[YOU] || 0.42;
    const theirs = city.price[rival.id] || 0.42;
    if (yours - theirs >= 0.015) {
      return { id: "UNDERCUT", chip: "UNDERCUT", action: "price", key: "[", verb: "CUT PRICE" };
    }
    if ((them.lounge || them.market) && !you.lounge && !raisingType(city.id, "lounge")) {
      return { id: "AMENITY GAP", chip: "AMENITY GAP", action: "lounge", key: "L", verb: "QUEUE LOUNGE" };
    }
    if (!you.bess && !raisingType(city.id, "bess") && (them.bess || (CITY_BY_ID[city.id]?.demand || 0) >= 70)) {
      return { id: "GRID STRAIN", chip: "GRID STRAIN", action: "bess", key: "B", verb: "QUEUE BESS" };
    }
    if (!you.lounge && !raisingType(city.id, "lounge")) {
      return { id: "AMENITY GAP", chip: "AMENITY GAP", action: "lounge", key: "L", verb: "QUEUE LOUNGE" };
    }
    return { id: "UNDERCUT", chip: "UNDERCUT", action: "price", key: "[", verb: "CUT PRICE" };
  }

  function undercutCallOpen(city) {
    const ev = state && state.pendingEvent;
    return Boolean(ev && ev.type === "undercut" && city && ev.city === city.id);
  }

  function threatChipHtml(city) {
    const t = threatCall(city);
    if (!t) return "";
    // Field-call UNDERCUT already owns this chrome. Don't stack CUT PRICE [ above the dock.
    if (t.id === "UNDERCUT" && undercutCallOpen(city)) return "";
    return `<button type="button" class="threat-chip" data-threat="${t.action}">${t.chip}<span>${t.verb} ${t.key}</span></button>`;
  }

  function answerThreat(city) {
    const t = threatCall(city);
    if (!t || !city) return false;
    const meta = CITY_BY_ID[city.id];
    if (t.action === "price") {
      const rival = strongestRival(city);
      const theirs = rival ? city.price[rival.id] : city.price[YOU] - 0.02;
      const cut = city.price[YOU] > theirs
        ? Math.max(0.28, +Number(theirs).toFixed(2))
        : Math.max(0.28, +(city.price[YOU] - 0.02).toFixed(2));
      applyPlayerPrice(city, cut);
      toast(`CUT PRICE · ${meta.name} ${city.price[YOU].toFixed(2)}`, "deal");
      return true;
    }
    const type = t.action === "lounge" ? "lounge" : "bess";
    if (!canDeploy(type, city.id)) {
      toast(`${BUILD[type].name} · ${blockedReason(type, city.id)}`, "bad");
      return false;
    }
    return enqueue(type, city.id);
  }

  function forkSpec() {
    return {
      kicker: "BUILD ORDER",
      title: "MCS CORRIDOR OR LOUNGE + MARKET",
      body: "Rush MCS and pull trucks along the corridor, or thicken lounge and market on the pads you hold. Both win. Rivals pressure the path you leave open.",
      yes: "MCS CORRIDOR",
      no: "LOUNGE + MARKET",
      accept() {
        state.buildPath = "corridor";
        state.forkShown = true;
        log("Build order: MCS corridor. Rivals will race lounges.", "deal");
        toast("MCS CORRIDOR · rivals race lounges.", "deal");
      },
      decline() {
        state.buildPath = "amenity";
        state.forkShown = true;
        log("Build order: lounge + market. Rivals will cut the corridor.", "deal");
        toast("LOUNGE + MARKET · rivals cut the corridor.", "deal");
      },
    };
  }

  function offerBuildFork() {
    if (!state || state.over || state.buildPath || state.forkShown || state.pendingFork) return;
    if (state.month > 4) return;
    if (state.pendingDeal || state.pendingEvent) return;
    state.pendingFork = { at: state.month };
    state.forkShown = true;
    toast("BUILD ORDER · MCS corridor or lounge + market.", "deal");
    openDealSheet();
  }

  function maybeFieldCall() {
    if (state.over || state.pendingDeal || state.pendingEvent || state.pendingFork) return;
    if (state.month < (state.nextEvent || 2)) return;
    const fired =
      tryUndercutEvent() || tryStrainEvent() || tryAmenityEvent() || tryPoachEvent();
    state.nextEvent = state.month + (fired ? 2 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2));
  }

  function fieldCallSpec(ev) {
    if (!ev) return null;
    if (ev.type === "undercut") {
      const meta = CITY_BY_ID[ev.city];
      const rival = RIVALS[ev.rival];
      const city = state.cities[ev.city];
      const posted = (city.price[ev.rival] || 0.42).toFixed(2);
      return {
        kicker: ev.war ? "PRICE WAR" : "FIELD CALL",
        title: `${rival.name} UNDERCUTS`,
        body: `${rival.name} just posted $${posted}/kWh in ${meta.name}. Match the cut or hold rate and give share. You cannot take their pad.${state.crewPosture === "respond" ? " Crew on call blunted the cut." : ""}`,
        yes: "MATCH PRICE",
        no: "HOLD RATE",
        accept() {
          const before = Math.round((city.share[YOU] || 0) * 100);
          city.price[YOU] = Math.max(0.28, +(city.price[YOU] - (ev.cut || 0.03)).toFixed(2));
          recomputeShare(city);
          const after = Math.round((city.share[YOU] || 0) * 100);
          flashShare(city, before, after);
          log(`Matched ${rival.name} in ${meta.name}. Share ${before}% → ${after}%.`, "deal");
        },
        decline() {
          recomputeShare(city);
          const sh = Math.round((city.share[YOU] || 0) * 100);
          log(`Held rate in ${meta.name}. ${rival.name} keeps the cut · share ${sh}%.`, "bad");
          toast(`Held ${meta.name}. Share ${sh}%.`, "bad");
        },
      };
    }
    if (ev.type === "strain") {
      const meta = CITY_BY_ID[ev.city];
      const city = state.cities[ev.city];
      return {
        kicker: "FIELD CALL",
        title: "GRID STRAIN",
        body: `${meta.name} is pulling hard without BESS. Raise price to shed load, or wait it out. Rival dirt stays theirs.`,
        yes: "RAISE PRICE",
        no: "WAIT IT OUT",
        accept() {
          const before = city.price[YOU];
          city.price[YOU] = Math.min(0.58, +(city.price[YOU] + 0.04).toFixed(2));
          recomputeShare(city);
          log(`Raised ${meta.name} ${before.toFixed(2)} → ${city.price[YOU].toFixed(2)}/kWh to shed load.`, "deal");
          toast(`${meta.name} ${city.price[YOU].toFixed(2)}/kWh · load shed.`, "deal");
        },
        decline() {
          log(`Waited out strain in ${meta.name}. Grid stays tight.`, "bad");
          toast(`${meta.name} grid still strained.`, "bad");
        },
      };
    }
    if (ev.type === "amenity") {
      const meta = CITY_BY_ID[ev.city];
      const rival = RIVALS[ev.rival];
      const city = state.cities[ev.city];
      const canLounge = canDeploy("lounge", ev.city);
      return {
        kicker: "FIELD CALL",
        title: `${rival.name} LOUNGE`,
        body: `${rival.name} opened a lounge in ${meta.name}. Match the amenity on your pad, or hold and bleed share. Their dirt stays theirs.`,
        yes: canLounge ? "QUEUE LOUNGE" : "CUT PRICE",
        no: "HOLD RATE",
        accept() {
          const before = Math.round((city.share[YOU] || 0) * 100);
          if (canLounge) {
            enqueue("lounge", ev.city);
            log(`Lounge queued in ${meta.name} to match ${rival.name}.`, "deal");
            toast(`Lounge raising in ${meta.name}.`, "good");
          } else {
            city.price[YOU] = Math.max(0.28, +(city.price[YOU] - 0.03).toFixed(2));
            recomputeShare(city);
            flashShare(city, before, Math.round((city.share[YOU] || 0) * 100));
            log(`Cut ${meta.name} to match ${rival.name} lounge pull.`, "deal");
          }
        },
        decline() {
          recomputeShare(city);
          const sh = Math.round((city.share[YOU] || 0) * 100);
          log(`Held amenities in ${meta.name}. ${rival.name} lounge keeps the pull · share ${sh}%.`, "bad");
          toast(`Held ${meta.name}. Share ${sh}%.`, "bad");
        },
      };
    }
    if (ev.type === "poach") {
      const meta = CITY_BY_ID[ev.city];
      const rival = RIVALS[ev.rival];
      const city = state.cities[ev.city];
      const posted = (city.price[ev.rival] || 0.42).toFixed(2);
      return {
        kicker: "FIELD CALL",
        title: `${rival.name} POACHES`,
        body: `${rival.name} posted $${posted}/kWh on the ${meta.name} corridor. Match the poach or hold your rate.`,
        yes: "MATCH PRICE",
        no: "HOLD RATE",
        accept() {
          const before = Math.round((city.share[YOU] || 0) * 100);
          city.price[YOU] = Math.max(0.28, +(city.price[YOU] - (ev.cut || 0.02)).toFixed(2));
          recomputeShare(city);
          flashShare(city, before, Math.round((city.share[YOU] || 0) * 100));
          log(`Matched ${rival.name} poach in ${meta.name}.`, "deal");
        },
        decline() {
          recomputeShare(city);
          const sh = Math.round((city.share[YOU] || 0) * 100);
          log(`Held ${meta.name}. ${rival.name} keeps the poach · share ${sh}%.`, "bad");
          toast(`Held ${meta.name}. Share ${sh}%.`, "bad");
        },
      };
    }
    if (ev.type === "pressure") {
      const meta = CITY_BY_ID[ev.city];
      const rival = RIVALS[ev.rival] || RIVALS.voltspan;
      const can = canDeploy("dc", ev.city);
      return {
        kicker: "CORRIDOR PRESSURE",
        title: `${meta.name.toUpperCase()} OR THEY ROLL`,
        body: `${rival.name} is pricing around a one-city fort. Queue a DC on empty dirt in ${meta.name}, or stay home and their crews roll in. Beat them to the pad. A pad you already hold stays yours.`,
        yes: can ? "QUEUE DC" : "CANNOT QUEUE",
        no: "STAY HOME",
        accept() {
          if (canDeploy("dc", ev.city)) {
            enqueue("dc", ev.city);
            log(`Answered corridor pressure. DC queued in ${meta.name}.`, "deal");
          } else {
            toast(`Cannot queue DC · ${blockedReason("dc", ev.city)}`, "bad");
            pressureRivalClaim(ev.city, rival.id);
          }
        },
        decline() {
          pressureRivalClaim(ev.city, rival.id);
        },
      };
    }
    return null;
  }

  function maybeDeal() {
    if (state.over || state.pendingDeal) return;
    if (state.month < state.nextDeal) return;
    state.nextDeal = state.month + 40 + Math.floor(Math.random() * 24);
    if (Math.random() > 0.12) return;
    const ids = Object.keys(DEALS);
    state.pendingDeal = ids[Math.floor(Math.random() * ids.length)];
    const deal = DEALS[state.pendingDeal];
    log(`Deal waiting: ${deal.title}.`, "deal");
    toast(`DEAL AVAILABLE — ${deal.title}`, "deal");
  }

  function renderDealChrome() {
    const badge = $("btn-deals");
    if (!badge || !state) return;
    const hot = Boolean(state.pendingDeal || state.pendingEvent || state.pendingFork);
    badge.classList.toggle("hidden", !hot);
    badge.classList.toggle("hot", hot);
    badge.textContent = state.pendingFork ? "FORK" : state.pendingEvent ? "CALL" : "DEALS";
    if (!hot) $("deal-sheet").classList.add("hidden");
  }

  function activeChoice() {
    if (state?.pendingFork) {
      return {
        spec: forkSpec(),
        clear() {
          state.pendingFork = null;
          state.forkShown = true;
        },
      };
    }
    if (state?.pendingEvent) {
      const spec = fieldCallSpec(state.pendingEvent);
      if (spec) return { spec, clear: () => { state.pendingEvent = null; } };
    }
    if (state?.pendingDeal && DEALS[state.pendingDeal]) {
      return {
        spec: { kicker: "INCOMING DEAL", ...DEALS[state.pendingDeal] },
        clear: () => { state.pendingDeal = null; },
      };
    }
    return null;
  }

  function openDealSheet() {
    const sheet = $("deal-sheet");
    const choice = activeChoice();
    if (!choice) {
      sheet.classList.add("hidden");
      return;
    }
    const { spec } = choice;
    sheet.innerHTML = "";
    const k = document.createElement("p");
    k.className = "kicker";
    k.textContent = spec.kicker || "INCOMING DEAL";
    const h = document.createElement("h3");
    h.textContent = spec.title;
    const p = document.createElement("p");
    p.textContent = spec.body;
    const row = document.createElement("div");
    row.className = "modal-actions";
    const yes = document.createElement("button");
    yes.className = "btn-primary";
    yes.textContent = spec.yes;
    yes.addEventListener("click", () => {
      spec.accept();
      choice.clear();
      sheet.classList.add("hidden");
      renderAll();
    });
    const no = document.createElement("button");
    no.className = "btn-ghost";
    no.textContent = spec.no;
    no.addEventListener("click", () => {
      if (spec.decline) spec.decline();
      else log(`Passed: ${spec.title}.`);
      choice.clear();
      sheet.classList.add("hidden");
      renderAll();
    });
    row.append(yes, no);
    sheet.append(k, h, p, row);
    sheet.classList.toggle("field-call", Boolean(state.pendingEvent) && !state.pendingFork);
    sheet.classList.toggle("build-fork", Boolean(state.pendingFork));
    sheet.classList.remove("hidden");
  }

  function winProgress() {
    const cities = presenceCount(YOU);
    const states = new Set(
      CITIES.filter((c) => hasCap(state.cities[c.id].sites[YOU])).map((c) => c.state)
    ).size;
    const mcs = CITIES.filter((c) => state.cities[c.id].sites[YOU].mcs > 0).length;
    const majority = CITIES.filter((c) => (state.cities[c.id].share[YOU] || 0) >= 0.5).length;
    return {
      majority,
      needMajority: 12,
      states,
      needStates: 7,
      mcs,
      needMcs: 4,
      cities,
      cash: state.cash,
      needCash: 25000000,
      share: continentalShare(),
    };
  }

  function checkEnd() {
    const { cities: citiesHeld, states: statesHeld, mcs: mcsCities, majority } = winProgress();

    if (majority >= 12 || (statesHeld >= 7 && mcsCities >= 4 && citiesHeld >= 10) || state.cash >= 25000000) {
      state.over = "win";
      setSpeed(0);
      showModal({
        kicker: "CONTINENT SECURED",
        title: "THE BOARD IS HELD",
        body: `Month ${state.month}. ${citiesHeld} cities live, ${statesHeld} states, majority in ${majority}. The station was not built yet. The continent already was — and now it is yours.`,
        actions: [{ label: "KEEP PLAYING", primary: true, run: hideModal }],
      });
      log("Victory condition reached.", "good");
      return;
    }
    if (state.cash < 0) state.debtStreak += 1;
    else state.debtStreak = 0;
    if (state.debtStreak >= 4 || (state.month >= 12 && citiesHeld === 0 && state.cash < 200000)) {
      state.over = "lose";
      setSpeed(0);
      showModal({
        kicker: "TREASURY DARK",
        title: "THE CORRIDOR MOVES ON",
        body: "Four months red, or the dirt took you back. VOLTSPAN, GRIDHAWK, and ARCWAY keep building.",
        actions: [{ label: "NEW CAMPAIGN", primary: true, run: newGame }],
      });
      log("Campaign lost.", "bad");
    }
  }

  function openingObjective() {
    return {
      id: "expand",
      kind: "expand",
      title: "CLAIM A NEIGHBOR",
      detail: "Land DC or MCS on Flagstaff or Tucson before month 4. Rival pads stay theirs.",
      left: 3,
      total: 3,
    };
  }

  function normalizeOps() {
    if (!state) return;
    if (!state.crewPosture) state.crewPosture = "raise";
    if (!state.intel || typeof state.intel !== "object") state.intel = {};
    if (state.skirmish === undefined) state.skirmish = null;
    if (state.scout === undefined) state.scout = null;
    if (state.pressure == null) state.pressure = 0;
    if (state.idleMonths == null) state.idleMonths = 0;
    if (state.lastObjective == null) state.lastObjective = "";
    if (state.pressureEventAt == null) state.pressureEventAt = 0;
    if (!state.objective) state.objective = openingObjective();
  }

  function loungeRaceCity() {
    const held = CITIES.filter((c) => hasCap(state.cities[c.id].sites[YOU]) && !state.cities[c.id].sites[YOU].lounge);
    const open = held.find((c) => {
      const rival = strongestRival(state.cities[c.id]);
      return !rival || !state.cities[c.id].sites[rival.id].lounge;
    });
    return (open || held[0] || null)?.id || null;
  }

  function holdCity() {
    const contested = CITIES.find((c) => contestedCity(state.cities[c.id]));
    return contested ? contested.id : null;
  }

  function candidateObjectives() {
    const list = [];
    if (!["flagstaff", "tucson"].some((id) => hasCap(state.cities[id].sites[YOU]))) list.push(openingObjective());
    const border = !hasCap(state.cities.vegas.sites[YOU])
      ? {
        id: "border",
        kind: "border",
        title: "OPEN THE VEGAS BORDER",
        detail: "Put a pad in Las Vegas, on the VOLTSPAN side of the map. LA stays theirs.",
        left: 4,
        total: 4,
      }
      : null;
    const mcs = !CITIES.some((c) => state.cities[c.id].sites[YOU].mcs > 0)
      ? {
        id: "mcs",
        kind: "mcs",
        title: "LAND MCS ON THE CORRIDOR",
        detail: "Raise MCS on a pad you hold. Trucks follow the bay. Rival depots stay sealed.",
        left: 4,
        total: 4,
      }
      : null;
    const loungeCity = loungeRaceCity();
    let lounge = null;
    if (loungeCity) {
      const rival = strongestRival(state.cities[loungeCity]);
      lounge = {
        id: `lounge-${loungeCity}`,
        kind: "lounge",
        title: `LOUNGE BEFORE ${rival ? rival.name : "A RIVAL"}`,
        detail: `Open a lounge in ${CITY_BY_ID[loungeCity].name} before their amenity sticks. You cannot take their pad.`,
        left: 4,
        total: 4,
        city: loungeCity,
        rivalLoungeAtStart: Boolean(rival && state.cities[loungeCity].sites[rival.id].lounge),
      };
    }
    const holdId = holdCity();
    const hold = holdId
      ? {
        id: `hold-${holdId}`,
        kind: "hold",
        title: `HOLD 45% ${CITY_BY_ID[holdId].name.toUpperCase()}`,
        detail: "Keep Zaps share at 45% or better for 3 months. Price, lounge, or BESS. Their dirt stays theirs.",
        left: 5,
        total: 5,
        city: holdId,
        floor: 0.45,
        need: 3,
        streak: 0,
        shown: Math.round((state.cities[holdId].share?.[YOU] || 0) * 100),
      }
      : null;
    const third = presenceCount(YOU) < 3
      ? {
        id: "third",
        kind: "third",
        title: "OPEN A THIRD CITY",
        detail: "Phoenix plus one neighbor is still a fort. Land a third pad on empty dirt.",
        left: 5,
        total: 5,
      }
      : null;
    const path = state.buildPath;
    const rest = path === "amenity"
      ? [lounge, border, hold, mcs, third]
      : path === "corridor"
        ? [mcs, border, hold, lounge, third]
        : [border, mcs, lounge, hold, third];
    for (const item of rest) if (item) list.push(item);
    return list;
  }

  function pickObjective() {
    const all = candidateObjectives();
    return all.find((o) => o.id !== state.lastObjective) || all[0] || {
      id: "endure",
      kind: "endure",
      title: "HOLD THE MONTH",
      detail: "No fresh arc. Keep cash above water while the next contest forms.",
      left: 3,
      total: 3,
    };
  }

  function objectiveMet(obj) {
    if (!obj) return false;
    if (obj.kind === "expand") return ["flagstaff", "tucson"].some((id) => hasCap(state.cities[id].sites[YOU]));
    if (obj.kind === "border") return hasCap(state.cities.vegas.sites[YOU]);
    if (obj.kind === "mcs") return CITIES.some((c) => state.cities[c.id].sites[YOU].mcs > 0);
    if (obj.kind === "third") return presenceCount(YOU) >= 3;
    if (obj.kind === "endure") return obj.left <= 1 && state.cash >= 0;
    if (obj.kind === "lounge") {
      const city = state.cities[obj.city];
      return Boolean(city && city.sites[YOU].lounge > 0);
    }
    if (obj.kind === "hold") {
      const city = state.cities[obj.city];
      if (!city || !hasCap(city.sites[YOU])) {
        obj.streak = 0;
        obj.shown = 0;
        return false;
      }
      recomputeShare(city);
      obj.shown = Math.round((city.share[YOU] || 0) * 100);
      if ((city.share[YOU] || 0) + 1e-6 >= (obj.floor || 0.45)) obj.streak = (obj.streak || 0) + 1;
      else obj.streak = 0;
      return obj.streak >= (obj.need || 3);
    }
    return false;
  }

  function grantObjective(obj) {
    const pay = { expand: 180000, border: 160000, mcs: 150000, lounge: 140000, hold: 200000, third: 170000, endure: 60000 }[obj.kind] || 100000;
    state.cash += pay;
    state.pressure = Math.max(0, (state.pressure || 0) - 24);
    log(`Objective held: ${obj.title}. +${money(pay)}.`, "good");
    toast(`OBJECTIVE HELD · ${obj.title} · +${money(pay)}`, "good");
  }

  function failObjective(obj) {
    if (obj.kind !== "endure") {
      state.cash -= 40000;
      state.pressure = Math.min(100, (state.pressure || 0) + 18);
      nudgeRivalTempo();
    }
    log(`Objective missed: ${obj.title}.`, "bad");
    toast(`OBJECTIVE MISSED · ${obj.title}`, "bad");
  }

  function tickObjective() {
    normalizeOps();
    const obj = state.objective;
    if (!obj) {
      state.objective = pickObjective();
      return;
    }
    if (obj.kind === "lounge" && obj.city) {
      const city = state.cities[obj.city];
      const rival = city && strongestRival(city);
      if (rival && city.sites[rival.id].lounge && !city.sites[YOU].lounge && !obj.rivalLoungeAtStart) {
        failObjective(obj);
        state.lastObjective = obj.id;
        state.objective = pickObjective();
        return;
      }
    }
    if (objectiveMet(obj)) {
      grantObjective(obj);
      state.lastObjective = obj.id;
      state.objective = pickObjective();
      return;
    }
    obj.left -= 1;
    if (obj.left <= 0) {
      failObjective(obj);
      state.lastObjective = obj.id;
      state.objective = pickObjective();
    }
  }

  function nudgeRivalTempo() {
    const bumped = [];
    for (const c of CITIES) {
      const city = state.cities[c.id];
      const rival = strongestRival(city);
      if (!rival || !hasCap(city.sites[rival.id])) continue;
      const nearYou = hasCap(city.sites[YOU]) || c.neighbors.some((id) => hasCap(state.cities[id].sites[YOU]));
      if (!nearYou) continue;
      city.price[rival.id] = Math.max(0.28, +(city.price[rival.id] - 0.01).toFixed(2));
      bumped.push(c.name);
      if (bumped.length >= 2) break;
    }
    if (bumped.length) log(`Rival tempo: ${bumped.join(", ")} prices slip.`, "bad");
  }

  function tickIdleCrews(worked) {
    if (state.month < 2 || worked) {
      state.idleMonths = 0;
      return;
    }
    state.idleMonths = (state.idleMonths || 0) + 1;
    if (state.idleMonths < 2) return;
    state.cash -= 25000;
    state.pressure = Math.min(100, (state.pressure || 0) + 6);
    nudgeRivalTempo();
    if (state.idleMonths === 2) {
      log("Crews sat idle. −$25K standby and rivals take the month.", "bad");
      toast("Crews idle. −$25K · rivals take the tempo.", "bad");
    }
  }

  function tickTurtlePressure() {
    if (presenceCount(YOU) >= 2) {
      state.pressure = Math.max(0, (state.pressure || 0) - 12);
      return;
    }
    if (state.month < 4) return;
    state.pressure = Math.min(100, (state.pressure || 0) + 16);
    if (state.pendingEvent || state.pendingDeal || state.pendingFork) return;
    if (state.pressureEventAt && state.month - state.pressureEventAt < 3) return;
    const cityId = ["flagstaff", "tucson", "vegas", "albuquerque"].find((id) => {
      const city = state.cities[id];
      return city && !playerClaiming(city) && !rivalHolders(city).length;
    });
    if (!cityId) return;
    const rival = activeRivals()[0];
    state.pressureEventAt = state.month;
    state.pendingEvent = { type: "pressure", city: cityId, rival: rival ? rival.id : "voltspan" };
    log(`Corridor pressure on ${CITY_BY_ID[cityId].name}. Claim it or rival crews roll onto empty dirt.`, "bad");
    toast(`CORRIDOR PRESSURE · ${CITY_BY_ID[cityId].name}`, "bad");
  }

  function pressureRivalClaim(cityId, rid) {
    const city = state.cities[cityId];
    if (!city || !RIVALS[rid] || playerClaiming(city) || rivalHolders(city).length) return false;
    if (state.queue.some((q) => q.city === cityId && q.faction === rid)) return false;
    state.queue.push({
      faction: rid,
      city: cityId,
      type: "dc",
      left: BUILD.dc.months,
      cost: 0,
      claimEmpty: true,
    });
    log(`${RIVALS[rid].name} crews roll toward empty dirt in ${CITY_BY_ID[cityId].name}. Beat them to the pad.`, "bad");
    toast(`${RIVALS[rid].name} CREWS · ${CITY_BY_ID[cityId].name} · ${BUILD.dc.months} MO`, "bad");
    return true;
  }

  function openSkirmish(cityId, rivalId, kind) {
    if (!cityId || !rivalId || state.skirmish) return false;
    const city = state.cities[cityId];
    if (!city || !contestedCity(city)) return false;
    state.skirmish = {
      city: cityId,
      rival: rivalId,
      kind: kind === "amenity" ? "amenity" : "price",
      you: 12,
      them: 12,
      left: 3,
    };
    const label = state.skirmish.kind === "amenity" ? "AMENITY RACE" : "PRICE WAR";
    log(`${label} in ${CITY_BY_ID[cityId].name}. Fill the meter before ${RIVALS[rivalId].name}.`, "deal");
    toast(`${label} · ${CITY_BY_ID[cityId].name}`, "deal");
    return true;
  }

  function tickSkirmish() {
    const sk = state.skirmish;
    if (!sk) return;
    const city = state.cities[sk.city];
    if (!city || !contestedCity(city)) {
      state.skirmish = null;
      return;
    }
    const youSite = city.sites[YOU];
    const themSite = city.sites[sk.rival] || emptySite();
    let you = 6;
    let them = 6;
    if (sk.kind === "price") {
      const gap = (city.price[sk.rival] || 0.42) - (city.price[YOU] || 0.42);
      if (gap > 0.005) you += 14;
      else if (gap < -0.005) them += 14;
      else {
        you += 8;
        them += 8;
      }
      if (youSite.bess) you += 4;
      if (themSite.bess) them += 4;
    } else {
      if (youSite.lounge) you += 12;
      if (themSite.lounge) them += 12;
      if (youSite.market) you += 6;
      if (themSite.market) them += 6;
      if (raisingType(city.id, "lounge")) you += 5;
    }
    if (state.crewPosture === "respond") you += 8;
    sk.you = Math.min(100, sk.you + you);
    sk.them = Math.min(100, sk.them + them);
    sk.left -= 1;
    if (sk.you >= 100 || sk.them >= 100 || sk.left <= 0) resolveSkirmish();
  }

  function resolveSkirmish() {
    const sk = state.skirmish;
    if (!sk) return;
    const city = state.cities[sk.city];
    const rival = RIVALS[sk.rival];
    const youWin = sk.you >= sk.them;
    const name = CITY_BY_ID[sk.city].name;
    if (youWin) {
      state.cash += 120000;
      if (city) city.price[YOU] = Math.max(0.28, +(city.price[YOU] - 0.01).toFixed(2));
      log(`Skirmish held in ${name}. +$120K.`, "good");
      toast(`SKIRMISH HELD · ${name} · +$120K`, "good");
    } else if (rival && city) {
      city.price[rival.id] = Math.max(0.28, +(city.price[rival.id] - 0.02).toFixed(2));
      log(`${rival.name} wins the ${name} skirmish. Their price sticks.`, "bad");
      toast(`SKIRMISH LOST · ${rival.name} keeps ${name}`, "bad");
    }
    if (city) recomputeShare(city);
    state.skirmish = null;
  }

  function scoutBlock(cityId) {
    if (!cityId || !CITY_BY_ID[cityId]) return "PICK A CITY";
    if (state.scout && state.scout.left > 0) return "SCOUT OUT";
    if (state.cash < 40000) return "NEED CASH";
    if (crewsBusy() >= crewCap()) return "CREWS FULL";
    return "";
  }

  function launchScout(cityId) {
    const block = scoutBlock(cityId);
    if (block) {
      toast(`SCOUT · ${block}`, "bad");
      return false;
    }
    const city = state.cities[cityId];
    const rival = strongestRival(city) || activeRivals()[0];
    if (!rival) {
      toast("SCOUT · no rival in range.", "bad");
      return false;
    }
    state.cash -= 40000;
    const next = rivalBuildType(city.sites[rival.id], hasCap(city.sites[YOU]));
    state.scout = {
      city: cityId,
      left: 1,
      rival: rival.id,
      kit: BUILD[next] ? BUILD[next].name : "DC CHARGER",
      price: city.price[rival.id] || 0.42,
    };
    log(`Scout dispatched to ${CITY_BY_ID[cityId].name}. One crew, one month.`, "deal");
    toast(`SCOUT · ${CITY_BY_ID[cityId].name} · 1 mo`, "deal");
    renderAll();
    return true;
  }

  function tickScout() {
    if (!state.scout || state.scout.left == null) return;
    state.scout.left -= 1;
    if (state.scout.left > 0) return;
    const sc = state.scout;
    state.intel[sc.city] = {
      rival: sc.rival,
      kit: sc.kit,
      price: sc.price,
      until: state.month + 4,
    };
    const rival = RIVALS[sc.rival];
    log(`Intel: ${rival ? rival.name : "Rival"} next ${sc.kit} · $${Number(sc.price).toFixed(2)}/kWh in ${CITY_BY_ID[sc.city].name}.`, "deal");
    toast(`INTEL · ${rival ? rival.name : "RIVAL"} next ${sc.kit} · $${Number(sc.price).toFixed(2)}`, "good");
    state.scout = null;
  }

  function intelHtml(city) {
    const info = state.intel && state.intel[city.id];
    if (!info || info.until < state.month) return "";
    const rival = RIVALS[info.rival];
    return `<p class="intel-line">INTEL · ${rival ? rival.name : "RIVAL"} next ${info.kit} · $${Number(info.price).toFixed(2)}/kWh · fades M${String(info.until).padStart(2, "0")}</p>`;
  }

  function skirmishHtml() {
    const sk = state.skirmish;
    if (!sk || !CITY_BY_ID[sk.city]) return "";
    const rival = RIVALS[sk.rival];
    const label = sk.kind === "amenity" ? "AMENITY RACE" : "PRICE WAR";
    const name = CITY_BY_ID[sk.city].name.toUpperCase();
    return `<div class="skirmish" data-kind="${sk.kind}">
      <div class="skirmish-hd"><b>${label}</b><span>${name} · ${Math.max(0, sk.left)} MO</span></div>
      <div class="skirmish-track you"><i style="width:${sk.you}%"></i></div>
      <div class="skirmish-track them"><i style="width:${sk.them}%"></i></div>
      <div class="skirmish-lbl"><span>ZAPS ${sk.you}</span><span>${rival ? rival.name : "RIVAL"} ${sk.them}</span></div>
    </div>`;
  }

  function renderOps() {
    const strip = $("ops-strip");
    if (!strip || !state) return;
    normalizeOps();
    const obj = state.objective;
    const posture = state.crewPosture;
    const cap = crewCap();
    const busy = crewsBusy();
    const scoutCity = selected && CITY_BY_ID[selected] ? CITY_BY_ID[selected].name.toUpperCase() : "CITY";
    const block = selected ? scoutBlock(selected) : "PICK A CITY";
    let scoutText = `SCOUT ${scoutCity} · $40K`;
    if (state.scout && state.scout.left > 0) scoutText = `SCOUT OUT · ${state.scout.left} MO`;
    else if (block) scoutText = `SCOUT · ${block}`;
    const pct = obj && obj.total ? Math.max(8, Math.round((Math.max(0, obj.left) / obj.total) * 100)) : 0;
    const holdBit = obj && obj.kind === "hold" ? ` · ${obj.streak || 0}/${obj.need || 3} MO AT ${obj.shown != null ? obj.shown : "—"}%` : "";
    const pressure = state.pressure || 0;
    const pressureKicker = pressure >= 30 && presenceCount(YOU) < 2 ? " · CORRIDOR PRESSURE" : "";
    strip.innerHTML = `
      <div class="ops-objective">
        <p class="kicker">OBJECTIVE${pressureKicker}</p>
        <b>${obj ? obj.title : "—"}</b>
        <span>${obj ? obj.detail : ""}${holdBit}${obj ? ` · ${Math.max(0, obj.left)} MO LEFT` : ""}</span>
        <em class="ops-clock"><i style="width:${pct}%"></i></em>
        ${pressure > 0 ? `<em class="ops-pressure" style="width:${pressure}%"></em>` : ""}
      </div>
      <div class="ops-skirmish">${skirmishHtml()}</div>
      <div class="crew-fork">
        <button type="button" data-posture="raise" class="${posture === "raise" ? "on" : ""}">RAISE</button>
        <button type="button" data-posture="respond" class="${posture === "respond" ? "on" : ""}">RESPOND</button>
        <span class="crew-read">${posture === "respond" ? "1 ON CALL" : state.idleMonths >= 2 ? "IDLE" : `${busy}/${cap}`}</span>
        <button type="button" id="btn-scout"${block ? " disabled" : ""}>${scoutText}</button>
      </div>`;
  }

  function bindOps() {
    const strip = $("ops-strip");
    if (!strip || strip.dataset.bound) return;
    strip.dataset.bound = "1";
    strip.addEventListener("click", (e) => {
      if (!state) return;
      const posture = e.target.closest("[data-posture]");
      if (posture) {
        const next = posture.getAttribute("data-posture") === "respond" ? "respond" : "raise";
        state.crewPosture = next;
        if (next === "respond") state.idleMonths = 0;
        log(next === "respond"
          ? "Crew posture RESPOND. One crew stays on call — build cap is 2, contested share holds firmer."
          : "Crew posture RAISE. All three crews can build. Idle crews give rivals the month.", "deal");
        toast(next === "respond" ? "RESPOND · 1 crew on call. Build cap 2." : "RAISE · all 3 crews can build.", "deal");
        renderAll();
        return;
      }
      if (e.target.closest("#btn-scout")) launchScout(selected);
    });
  }

  function tickMonth() {
    if (!state || state.over) return;
    allShares();
    let income = 0;
    let opex = 0;
    for (const c of CITIES) {
      const city = state.cities[c.id];
      if (city.war > 0) city.war -= 1;
      income += cityIncome(city, YOU);
      opex += cityOpex(city, YOU);
    }
    lastNet = income - opex;
    state.cash += lastNet;

    const crewsWorked = crewsBusy() > 0 || state.crewPosture === "respond";
    for (const job of state.queue) job.left -= 1;
    queuePulse = Date.now();
    const done = state.queue.filter((j) => j.left <= 0);
    state.queue = state.queue.filter((j) => j.left > 0);
    for (const job of done) finishBuild(job);
    tickScout();

    for (const r of activeRivals()) rivalAct(r.id);

    state.month += 1;
    tickIdleCrews(crewsWorked);
    tickTurtlePressure();
    tickSkirmish();
    tickObjective();
    if (state.month % 2 === 0) {
      log(`P&L ${money(lastNet)} · cash ${money(state.cash)}`);
    }
    maybeDeal();
    maybeFieldCall();
    checkEnd();
    renderAll();
    if (state.pendingEvent) openDealSheet();
    persistQuiet();
  }

  function persistQuiet() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (_) {
      /* ignore quota */
    }
  }

  function saveManual() {
    persistQuiet();
    log("Campaign saved to this browser.", "good");
  }

  function readSave() {
    return localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_LEGACY);
  }

  function hydrate(raw) {
    state = JSON.parse(raw);
    if (state.nextDeal == null) state.nextDeal = state.month + 48;
    if (state.pendingDeal === undefined) state.pendingDeal = null;
    if (state.pendingEvent === undefined) state.pendingEvent = null;
    if (state.nextEvent == null) state.nextEvent = state.month + 2;
    if (state.warFired == null) state.warFired = false;
    normalizeOps();
    if (Array.isArray(state.queue)) {
      state.queue = state.queue.filter((q) => {
        if (q.faction !== YOU) return true;
        const city = state.cities[q.city];
        if (city && rivalSite(city) && !q.claimEmpty) {
          state.cash += q.cost || 0;
          return false;
        }
        return true;
      });
    }
    selected = hasCap(state.cities.phoenix.sites[YOU])
      ? "phoenix"
      : CITIES.find((c) => hasCap(state.cities[c.id].sites[YOU]))?.id || "phoenix";
  }

  function loadManual() {
    const raw = readSave();
    if (!raw) {
      log("No save found.", "bad");
      toast("No save found.", "bad");
      return;
    }
    hydrate(raw);
    log("Campaign loaded.", "good");
    showBoard();
    bindMapControls();
    bindOps();
    offerBuildFork();
    renderAll();
  }

  function newGame() {
    hideModal();
    $("deal-sheet").classList.add("hidden");
    state = freshState();
    selected = "phoenix";
    lastNet = 0;
    armedKit = null;
    hoverKit = null;
    slotOverride = null;
    inspectJob = null;
    pops = [];
    yardFlash = null;
    lastPriceToast = { city: "", at: 0, from: 0, to: 0 };
    siteView = null;
    showBoard();
    bindMapControls();
    bindOps();
    offerBuildFork();
    renderAll();
  }

  function setSpeed(v) {
    if (state) state.speed = v;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (v && TICK[v]) timer = setInterval(tickMonth, TICK[v]);
    document.querySelectorAll(".speed button").forEach((b) => {
      const on = Number(b.dataset.speed) === v;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("board-screen")?.classList.toggle("is-paused", v === 0);
    const read = $("speed-readout");
    if (read) {
      read.textContent = v === 0 ? "PAUSED" : `${v}× LIVE`;
      read.dataset.speed = String(v);
    }
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.toggle("hidden", el.id !== id));
  }

  function showBoard() {
    showScreen("board-screen");
    setSpeed(0);
  }

  function showModal({ kicker, title, body, actions }) {
    const card = $("modal-card");
    card.innerHTML = "";
    const k = document.createElement("p");
    k.className = "kicker";
    k.textContent = kicker;
    const h = document.createElement("h2");
    h.textContent = title;
    const p = document.createElement("p");
    p.textContent = body;
    const row = document.createElement("div");
    row.className = "modal-actions";
    for (const a of actions) {
      const b = document.createElement("button");
      b.className = a.primary ? "btn-primary" : "btn-ghost";
      b.textContent = a.label;
      b.addEventListener("click", a.run);
      row.appendChild(b);
    }
    card.append(k, h, p, row);
    $("deal-sheet")?.classList.add("hidden");
    $("modal").classList.remove("hidden");
  }

  function hideModal() {
    $("modal").classList.add("hidden");
  }

  function renderTicker() {
    const el = $("ticker");
    if (!el || !state) return;
    el.innerHTML = state.log
      .map((row) => {
        if (typeof row === "string") return `<div>${row}</div>`;
        return `<div class="${row.kind || ""}">M${String(row.t).padStart(2, "0")} · ${row.msg}</div>`;
      })
      .join("");
  }

  function renderCorridors() {
    const svg = $("corridor-layer");
    if (!svg) return;
    svg.innerHTML = "";
  }

  function occupantClass(city) {
    const kind = mapSpriteKind(city, CITY_BY_ID[city.id]);
    if (kind === "hq" || kind === "tucson" || kind === "vegas" || kind === "plaza") {
      const them = activeRivals().some((r) => hasCap(city.sites[r.id]));
      return them ? "contested zaps" : "zaps";
    }
    if (kind === "voltspan" || kind === "rival") return "rival hostile";
    return "dirt";
  }

  function inspectorPhase(kind, city) {
    if (city && contestedCity(city)) return "CONTESTED";
    if (city && rivalSite(city)) return "RIVAL SITE";
    if (kind === "hq") return "ZAPS HQ";
    if (kind === "tucson" || kind === "vegas" || kind === "plaza") return "ZAPS YARD";
    if (kind === "voltspan") return "VOLTSPAN COMPOUND";
    if (kind === "rival") return "RIVAL DEPOT";
    if (kind === "dirt") return "RAISING";
    return "UNBUILT";
  }

  function inspectorBlurb(city, meta, kind) {
    const you = city.sites[YOU];
    const neighbors = meta.neighbors.map((id) => CITY_BY_ID[id].name).join(", ");
    const land = meta.land.toFixed(2);
    const rival = strongestRival(city);
    if (rivalSite(city)) {
      return `${rival ? rival.name : "A rival"} holds this pad. You cannot deploy here. Compete on price and empty dirt — not their compound.`;
    }
    if (contestedCity(city)) {
      return `Contested with ${rival ? rival.name : "a rival"}. Your price ${city.price[YOU].toFixed(2)}/kWh · share ${Math.round((city.share[YOU] || 0) * 100)}%. Cut price or hold — do not seize their pad.`;
    }
    if (kind === "hq" || kind === "tucson" || kind === "vegas" || kind === "plaza") {
      return `Your price ${city.price[YOU].toFixed(2)}/kWh. Share ${Math.round((city.share[YOU] || 0) * 100)}%. Grid ${you.bess ? "STABLE" : "STRAINED"}. Crews ${crewsBusy()}/${MAX_CREWS}.`;
    }
    if (kind === "dirt") {
      return `Raising. Land multiplier ${land}. Neighbors: ${neighbors}.`;
    }
    return `Unbuilt dirt. Land multiplier ${land}. Neighbors: ${neighbors}. Drop a pad to raise a compound.`;
  }

  function shareDuelHtml(city) {
    const rival = strongestRival(city);
    const youPct = Math.round((city.share[YOU] || 0) * 100);
    const themPct = rival ? Math.round((city.share[rival.id] || 0) * 100) : 0;
    const flash = city.shareFlash && city.shareFlash.until > Date.now();
    const themName = rival ? rival.name : "OPEN";
    const themColor = rival ? rival.color : PAL.steel;
    const heat = city.war > 0 ? " heat" : "";
    return `<div class="share-duel${flash ? " flash" : ""}${heat}" data-city="${city.id}">
      <div class="share-head"><span>ZAPS ${youPct}%</span><span>${themName} ${themPct}%</span></div>
      <div class="share-bar" role="img" aria-label="Zaps ${youPct} percent, ${themName} ${themPct} percent">
        <i class="you" style="width:${youPct}%"></i>
        <i class="them" style="width:${themPct}%;--them:${themColor}"></i>
      </div>
    </div>`;
  }

  function strongestRival(city) {
    let best = null;
    let cap = 0;
    for (const r of activeRivals()) {
      const c = capacity(city.sites[r.id]);
      if (c > cap) {
        cap = c;
        best = r;
      }
    }
    return best;
  }

  /* 3/4-overhead RTS kit. Buildings, not labeled lots. */
  const ISO = { sx: 0.56, sy: 0.4 };

  function isoPts(x, y, w, d, h) {
    const dx = d * ISO.sx;
    const dy = d * ISO.sy;
    return {
      dx,
      dy,
      fl: [x, y],
      fr: [x + w, y],
      br: [x + w + dx, y - dy],
      bl: [x + dx, y - dy],
      flT: [x, y - h],
      frT: [x + w, y - h],
      brT: [x + w + dx, y - h - dy],
      blT: [x + dx, y - h - dy],
    };
  }

  const SURF = {
    alum: { top: "#d8dbdf", front: "#b4b8be", side: "#8a9096", edge: "#5c6268" },
    cream: { top: "#F5F0E8", front: "#ddd6c8", side: "#b8b09e", edge: "#8a8478" },
    charcoal: { top: "#3c3c44", front: "#2a2a32", side: "#1c1c22", edge: "#0e0e12" },
    steel: { top: "#4a5258", front: "#32383e", side: "#242a30", edge: PAL.cyan },
    dirt: { top: "#c8a66c", front: "#a88850", side: "#8a6a3c", edge: "#6a502c" },
    concrete: { top: "#d4d0c8", front: "#b8b4ac", side: "#9c9890", edge: "#7a7670" },
  };

  function poly(pts, fill, stroke, sw) {
    return `<path d="M${pts.map((p) => p.join(" ")).join(" L")} Z" fill="${fill}" stroke="${stroke || "none"}" stroke-width="${sw || 0.55}" stroke-linejoin="round"/>`;
  }

  function kitTone(live, edge) {
    if (live) {
      return { top: PAL.cream, front: "#d4cec2", side: "#b4aea2", edge: edge || PAL.cyan };
    }
    return { top: "#3a3a44", front: "#2c2c34", side: "#22222a", edge: "rgba(0,212,245,0.45)" };
  }

  function isoBox(x, y, w, d, h, live, edge, tone) {
    const p = isoPts(x, y, w, d, h);
    const c = tone || kitTone(live, edge);
    let g = poly([p.fr, p.frT, p.brT, p.br], c.side, c.edge, 0.55);
    g += poly([p.fl, p.fr, p.frT, p.flT], c.front, c.edge, 0.55);
    g += poly([p.flT, p.frT, p.brT, p.blT], c.top, c.edge, 0.7);
    return { g, p, c };
  }

  function isoShadow(x, y, w, d) {
    const p = isoPts(x, y + 1.2, w, d, 0);
    return `<path d="M${[p.fl, p.fr, p.br, p.bl].map((pt) => pt.join(" ")).join(" L")} Z" fill="#0c0c10" opacity="0.45"/>`;
  }

  function scaffold(x, y, w, d, h) {
    const p = isoPts(x, y, w, d, h);
    return (
      `<path d="M${p.fl.join(" ")} L${p.flT.join(" ")} L${p.frT.join(" ")} L${p.fr.join(" ")}" fill="none" stroke="${PAL.amber}" stroke-width="1.1"/>` +
      `<path d="M${p.fr.join(" ")} L${p.frT.join(" ")} L${p.brT.join(" ")}" fill="none" stroke="${PAL.amber}" stroke-width="0.9"/>` +
      `<path d="M${p.fl[0]} ${p.fl[1] - h * 0.5} L${p.fr[0]} ${p.fr[1] - h * 0.5}" fill="none" stroke="${PAL.amber}" stroke-width="0.8"/>` +
      `<path d="M${p.fl[0] + 2} ${p.fl[1]} L${(p.flT[0] + p.frT[0]) / 2} ${p.flT[1] - 4} L${p.fr[0] - 2} ${p.fr[1]}" fill="none" stroke="${PAL.amber}" stroke-width="1"/>`
    );
  }

  function dirtPad(x, y, w, d) {
    const slab = isoBox(x, y, w, d, Math.max(3, d * 0.12), true, null, SURF.dirt);
    let g = isoShadow(x - 1, y + 1, w + 2, d + 1);
    g += slab.g;
    const { p } = slab;
    const cracks = [
      [0.18, 0.35, 0.42, 0.62],
      [0.55, 0.22, 0.78, 0.48],
      [0.3, 0.7, 0.62, 0.82],
    ];
    cracks.forEach(([ax, ay, bx, by]) => {
      const a = [
        p.fl[0] + (p.fr[0] - p.fl[0]) * ax + (p.bl[0] - p.fl[0]) * ay,
        p.fl[1] + (p.fr[1] - p.fl[1]) * ax + (p.bl[1] - p.fl[1]) * ay,
      ];
      const b = [
        p.fl[0] + (p.fr[0] - p.fl[0]) * bx + (p.bl[0] - p.fl[0]) * by,
        p.fl[1] + (p.fr[1] - p.fl[1]) * bx + (p.bl[1] - p.fl[1]) * by,
      ];
      g += `<path d="M${a.join(" ")} L${b.join(" ")}" fill="none" stroke="#8a6a3c" stroke-width="0.7" opacity="0.55"/>`;
    });
    g += `<ellipse cx="${p.fl[0] + w * 0.22}" cy="${p.fl[1] - 1.2}" rx="2.1" ry="1.1" fill="#6a7a48" opacity="0.75"/>`;
    g += `<ellipse cx="${p.fr[0] - w * 0.18}" cy="${p.fr[1] - 2}" rx="1.6" ry="0.9" fill="#5a6a40" opacity="0.7"/>`;
    g += `<ellipse cx="${p.bl[0] + 4}" cy="${p.bl[1] + 0.6}" rx="1.4" ry="0.8" fill="#7a6240" opacity="0.8"/>`;
    return g;
  }

  function concretePad(x, y, w, d) {
    const box = isoBox(x, y, w, d, 1.4, true, null, SURF.concrete);
    return isoShadow(x, y, w, d) + box.g;
  }

  function slimZeus(x, y, s, labeled) {
    const w = 5.2 * s;
    const d = 3.8 * s;
    const h = 16.5 * s;
    let g = isoShadow(x - 0.6 * s, y, w + 1.2 * s, d);
    const body = isoBox(x, y, w, d, h, true, null, SURF.alum);
    g += body.g;
    const { p } = body;
    const faceW = Math.max(1.6, w - 1.6 * s);
    const faceH = Math.max(4, h * 0.62);
    g += `<rect x="${p.flT[0] + 0.8 * s}" y="${p.flT[1] + 2.2 * s}" width="${faceW}" height="${faceH}" fill="#2a2a32"/>`;
    const amberH = Math.max(1.1, 2.1 * s);
    g += `<rect x="${p.flT[0] + 1.1 * s}" y="${p.flT[1] + 3.1 * s}" width="${Math.max(1.2, faceW - 0.6 * s)}" height="${amberH}" fill="${PAL.amber}"/>`;
    g += `<rect x="${p.flT[0] + 1.35 * s}" y="${p.flT[1] + 3.1 * s + amberH + 0.55 * s}" width="${Math.max(1.1, 1.85 * s)}" height="${Math.max(1.15, 1.55 * s)}" fill="${PAL.red}"/>`;
    if (labeled && s >= 0.95) {
      g += `<text x="${p.flT[0] + 1.25 * s}" y="${p.flT[1] + 4.7 * s}" fill="${PAL.charcoal}" font-size="${Math.max(2.1, 2.4 * s)}" font-family="Share Tech Mono, monospace">PLUG IN</text>`;
    }
    const base = isoPts(x - 0.4 * s, y + 0.4 * s, w + 0.8 * s, d + 0.4 * s, 0);
    g += `<path d="M${[base.fl, base.fr, base.br, base.bl].map((pt) => pt.join(" ")).join(" L")} Z" fill="none" stroke="${PAL.cyan}" stroke-width="${Math.max(0.7, 0.9 * s)}"/>`;
    const holsterY = p.fl[1] - h * 0.42;
    g += `<rect x="${p.fl[0] - 1.3 * s}" y="${holsterY}" width="${1.2 * s}" height="${2.4 * s}" fill="#2a2a32" stroke="#8a9096" stroke-width="0.35"/>`;
    g += `<rect x="${p.fr[0] + 0.1 * s}" y="${holsterY}" width="${1.2 * s}" height="${2.4 * s}" fill="#2a2a32" stroke="#8a9096" stroke-width="0.35"/>`;
    g += `<path d="M${p.fl[0] - 0.6 * s} ${holsterY + 2.2 * s} Q${p.fl[0] - 4.2 * s} ${p.fl[1] - 2 * s} ${p.fl[0] - 1.4 * s} ${p.fl[1] + 0.4 * s}" fill="none" stroke="#1a1a1e" stroke-width="${Math.max(0.9, 1.15 * s)}"/>`;
    g += `<path d="M${p.fr[0] + 0.7 * s} ${holsterY + 2.2 * s} Q${p.fr[0] + 4.4 * s} ${p.fr[1] - 1.6 * s} ${p.fr[0] + 1.8 * s} ${p.fr[1] + 0.4 * s}" fill="none" stroke="#1a1a1e" stroke-width="${Math.max(0.9, 1.15 * s)}"/>`;
    return g;
  }

  function charcoalCabinet(x, y, s, warn) {
    const w = 14 * s;
    const d = 8 * s;
    const h = 12 * s;
    let g = isoShadow(x, y, w, d);
    const box = isoBox(x, y, w, d, h, true, null, SURF.charcoal);
    g += box.g;
    const { p } = box;
    for (let i = 0; i < 4; i += 1) {
      g += `<rect x="${p.flT[0] + 1.2 * s}" y="${p.flT[1] + 2 * s + i * 2.1 * s}" width="${w - 2.4 * s}" height="${1.2 * s}" fill="#1a1a20" opacity="0.7"/>`;
    }
    if (warn) {
      g += `<rect x="${p.flT[0] + w * 0.35}" y="${p.flT[1] + 1.1 * s}" width="${2.4 * s}" height="${2.4 * s}" fill="${PAL.amber}"/>`;
    }
    return g;
  }

  function dispenser1000(x, y, live) {
    return slimZeus(x, y, live ? 1 : 0.85, live);
  }

  function powerCabinet1500(x, y, live) {
    let g = isoShadow(x, y, 30, 20);
    const box = isoBox(x, y, 28, 18, 30, live);
    g += box.g;
    const { p } = box;
    for (let i = 0; i < 6; i += 1) {
      g += `<rect x="${p.flT[0] + 2.4}" y="${p.flT[1] + 5.4 + i * 3.6}" width="23.2" height="1.9" fill="${live ? PAL.charcoal : PAL.steel}" opacity="${live ? 0.82 : 0.28}"/>`;
    }
    if (live) {
      g += `<rect x="${p.flT[0] + 2}" y="${p.flT[1] + 2}" width="24" height="2.2" fill="${PAL.cyan}"/>`;
      g += `<rect x="${p.frT[0] + 2.4}" y="${p.frT[1] + 7}" width="2" height="10" fill="${PAL.amber}" opacity="0.9"/>`;
    }
    return g;
  }

  function dccCombiner(x, y, live) {
    let g = isoShadow(x, y, 16, 12);
    const box = isoBox(x, y, 14, 11, 16, live);
    g += box.g;
    const { p } = box;
    g += `<rect x="${p.flT[0] + 3}" y="${p.flT[1] + 4.5}" width="8" height="7" fill="${live ? PAL.amber : "#3a3a44"}" opacity="${live ? 0.92 : 0.4}"/>`;
    g += `<rect x="${p.flT[0] + 4.2}" y="${p.flT[1] + 6}" width="5.6" height="1.1" fill="${PAL.charcoal}" opacity="0.55"/>`;
    g += `<rect x="${p.flT[0] + 4.2}" y="${p.flT[1] + 8.2}" width="5.6" height="1.1" fill="${PAL.charcoal}" opacity="0.55"/>`;
    return g;
  }

  function rectifierCab(x, y, live) {
    let g = isoShadow(x, y, 12, 9);
    const box = isoBox(x, y, 11, 8, 13, live);
    g += box.g;
    const { p } = box;
    g += `<rect x="${p.flT[0] + 2}" y="${p.flT[1] + 3}" width="7" height="6.5" fill="${live ? "#2a2a32" : "#1a1a20"}"/>`;
    if (live) g += `<rect x="${p.flT[0] + 8.4}" y="${p.flT[1] + 1.6}" width="1.4" height="1.4" fill="${PAL.cyan}"/>`;
    return g;
  }

  function bessFarm(x, y, live, raising) {
    let g = "";
    const blocks = [
      [x, y, 18, 13, 11],
      [x + 22, y - 4, 18, 13, 12],
      [x + 8, y + 10, 16, 11, 10],
    ];
    blocks.forEach(([bx, by, w, d, h], i) => {
      g += isoShadow(bx, by, w, d);
      const box = isoBox(bx, by, w, d, h, live);
      g += box.g;
      if (live) {
        g += `<rect x="${box.p.flT[0] + 2}" y="${box.p.flT[1] + 3}" width="${w - 4}" height="2" fill="${i === 1 ? PAL.amber : PAL.cyan}"/>`;
      }
    });
    g += isoBox(x + 40, y + 8, 9, 7, 10, live).g;
    if (raising) g += scaffold(x, y, 48, 24, 16);
    return g;
  }

  function loungePavilion(x, y, live, raising) {
    const bodyH = 14;
    let g = isoShadow(x - 2, y, 42, 22);
    const patio = isoBox(x - 2, y + 6, 20, 10, 1.2, live, null, SURF.concrete);
    g += patio.g;
    g += isoBox(x + 1, y + 8, 6, 3.2, 1.6, live, null, SURF.cream).g;
    g += isoBox(x + 10, y + 8, 6, 3.2, 1.6, live, null, SURF.cream).g;
    const body = isoBox(x, y, 36, 20, bodyH, live, null, live ? SURF.cream : SURF.charcoal);
    g += body.g;
    const { p } = body;
    for (let i = 0; i < 2; i += 1) {
      const px = p.flT[0] + 4 + i * 14;
      const py = p.flT[1] + 3.2;
      g += `<rect x="${px}" y="${py}" width="11" height="8.4" fill="${live ? "#2a2018" : "#16161c"}"/>`;
      if (live) {
        g += `<rect x="${px + 1}" y="${py + 1.4}" width="9" height="3.4" fill="${PAL.amber}" opacity="0.28"/>`;
        g += `<rect x="${px + 1}" y="${py + 5}" width="9" height="2.4" fill="${PAL.cream}" opacity="0.22"/>`;
      }
    }
    g += `<rect x="${p.flT[0] + 30}" y="${p.flT[1] + 3.4}" width="3.2" height="2.2" fill="${PAL.red}"/>`;
    const roof = isoBox(x - 3, y - bodyH, 42, 24, 2.2, live, null, live ? SURF.alum : SURF.charcoal);
    g += roof.g;
    if (raising) g += scaffold(x, y, 36, 20, 16);
    return g;
  }

  function canopy(x, y, w, d, lift, live, columns) {
    let g = "";
    const colH = lift - 2;
    const spots = columns || [0.08, 0.36, 0.64, 0.92];
    const post = live ? SURF.alum : SURF.charcoal;
    spots.forEach((t) => {
      g += isoBox(x + w * t, y - 1, 1.8, 1.8, colH, live, null, post).g;
    });
    const roof = isoBox(x - 3, y - lift, w + 6, d, 2.1, live, null, live ? SURF.cream : SURF.charcoal);
    g += roof.g;
    const { p } = roof;
    if (live) {
      g += `<path d="M${p.flT.join(" ")} L${p.frT.join(" ")} L${p.brT.join(" ")} L${p.blT.join(" ")} Z" fill="none" stroke="${PAL.cyan}" stroke-width="1.2"/>`;
      const top = [p.flT, p.frT, p.brT, p.blT];
      g += cofferGrid(top, Math.max(2, spots.length), 2);
    }
    return g;
  }

  function marketKiosk(x, y, live, raising) {
    const bodyH = 14;
    let g = isoShadow(x, y, 30, 18);
    const box = isoBox(x, y, 26, 16, bodyH, live);
    g += box.g;
    const { p } = box;
    g += `<rect x="${p.flT[0] + 4}" y="${p.flT[1] + 4}" width="18" height="7" fill="${live ? "#141c20" : "#16161c"}"/>`;
    if (live) g += `<rect x="${p.flT[0] + 6}" y="${p.flT[1] + 7}" width="14" height="2.6" fill="${PAL.amber}" opacity="0.85"/>`;
    const roof = isoBox(x - 3, y - bodyH, 32, 20, 2.8, live);
    g += roof.g;
    if (raising) g += scaffold(x, y, 26, 16, 16);
    return g;
  }

  function surveyFlag(x, y, s) {
    let g = dirtPad(x, y, 36 * s, 22 * s);
    const poleX = x + 16 * s;
    const poleY = y - 2 * s;
    g += `<rect x="${poleX}" y="${poleY - 22 * s}" width="${0.9 * s}" height="${24 * s}" fill="#8a9096"/>`;
    g += `<path d="M${poleX + 0.9 * s} ${poleY - 21 * s} L${poleX + 14 * s} ${poleY - 16 * s} L${poleX + 0.9 * s} ${poleY - 11 * s} Z" fill="${PAL.cream}" stroke="#d4cec2" stroke-width="0.4"/>`;
    g += `<circle cx="${poleX + 0.45 * s}" cy="${poleY - 22.6 * s}" r="${1.15 * s}" fill="${PAL.cyan}"/>`;
    g += `<path d="M${poleX - 3 * s} ${poleY + 2 * s} L${poleX} ${poleY} L${poleX + 3.2 * s} ${poleY + 2 * s}" fill="none" stroke="#8a9096" stroke-width="${0.7 * s}"/>`;
    return g;
  }

  function dirtParts() {
    return { kind: "dirt", ax: 40, ay: 48, w: 90, h: 58, inner: dirtPad(8, 46, 58, 34) };
  }

  function flagParts() {
    return { kind: "flag", ax: 28, ay: 40, w: 72, h: 52, inner: surveyFlag(6, 40, 1.15) };
  }

  function voltspanYard(x, y, s) {
    let g = concretePad(x, y, 70 * s, 40 * s);
    const stripe = isoPts(x + 2 * s, y + 2 * s, 66 * s, 8 * s, 0);
    g += poly([stripe.fl, stripe.fr, stripe.br, stripe.bl], "#1e1e24", "none", 0);
    for (let i = 0; i < 7; i += 1) {
      const t0 = i / 7;
      const t1 = (i + 0.45) / 7;
      const a = [stripe.fl[0] + (stripe.fr[0] - stripe.fl[0]) * t0, stripe.fl[1] + (stripe.fr[1] - stripe.fl[1]) * t0];
      const b = [stripe.fl[0] + (stripe.fr[0] - stripe.fl[0]) * t1, stripe.fl[1] + (stripe.fr[1] - stripe.fl[1]) * t1];
      const c = [stripe.bl[0] + (stripe.br[0] - stripe.bl[0]) * t1, stripe.bl[1] + (stripe.br[1] - stripe.bl[1]) * t1];
      const d = [stripe.bl[0] + (stripe.br[0] - stripe.bl[0]) * t0, stripe.bl[1] + (stripe.br[1] - stripe.bl[1]) * t0];
      g += poly([a, b, c, d], PAL.amber, "none", 0);
    }
    const hall = isoBox(x + 14 * s, y - 6 * s, 36 * s, 22 * s, 20 * s, true, PAL.cyan, SURF.steel);
    g += hall.g;
    const { p } = hall;
    g += `<rect x="${p.flT[0] + 3 * s}" y="${p.flT[1] + 6 * s}" width="${12 * s}" height="${10 * s}" fill="#1a1a20" stroke="${PAL.cyan}" stroke-width="0.7"/>`;
    g += `<rect x="${p.flT[0] + 18 * s}" y="${p.flT[1] + 6 * s}" width="${12 * s}" height="${10 * s}" fill="#1a1a20" stroke="${PAL.cyan}" stroke-width="0.7"/>`;
    g += isoBox(x + 52 * s, y - 2 * s, 10 * s, 10 * s, 14 * s, true, PAL.cyan, SURF.steel).g;
    g += isoBox(x + 4 * s, y + 4 * s, 10 * s, 7 * s, 7 * s, true, null, SURF.charcoal).g;
    g += isoBox(x + 22 * s, y - 26 * s, 6 * s, 5 * s, 3 * s, true, null, SURF.charcoal).g;
    g += isoBox(x + 32 * s, y - 26 * s, 6 * s, 5 * s, 3 * s, true, null, SURF.charcoal).g;
    return g;
  }

  function rivalParts(city) {
    const rival = strongestRival(city);
    if (!rival) return flagParts();
    const raising = jobsFor(city.id, rival.id).length > 0;
    let g = voltspanYard(24, 150, 2.1);
    if (raising) g += scaffold(60, 120, 50, 28, 22);
    return { kind: "rival", ax: 100, ay: 150, w: 220, h: 180, inner: g };
  }

  function zapsParts(city) {
    const site = city.sites[YOU];
    const owned = hasCap(site) || jobsFor(city.id).some((j) => j.type === "dc" || j.type === "mcs");
    const dc = site.dc;
    const raisingDc = raisingType(city.id, "dc");
    let g = dirtPad(40, 250, 220, 120);
    if (!owned) {
      if (raisingDc) g += scaffold(90, 200, 40, 24, 20);
      return { kind: "zaps", ax: 150, ay: 250, w: 320, h: 280, inner: g };
    }
    g += concretePad(58, 238, 150, 42);
    const n = Math.min(4, Math.max(1, dc));
    for (let i = 0; i < n; i += 1) g += slimZeus(66 + i * 22, 232, 1.05, true);
    if (dc > 0 || raisingDc) g += canopy(54, 236, 20 + n * 22, 28, 24, dc > 0, n >= 3 ? [0.08, 0.36, 0.64, 0.92] : [0.18, 0.82]);
    g += charcoalCabinet(70, 188, 1.15, true);
    if (dc >= 2) g += charcoalCabinet(102, 182, 1.05, true);
    if (site.bess > 0 || raisingType(city.id, "bess")) {
      g += bessFarm(130, 176, site.bess > 0, raisingType(city.id, "bess") && site.bess < 1);
    }
    if (site.lounge > 0 || raisingType(city.id, "lounge")) {
      g += loungePavilion(196, 200, site.lounge > 0, raisingType(city.id, "lounge") && site.lounge < 1);
    }
    if (site.mcs > 0 || raisingType(city.id, "mcs")) {
      const live = site.mcs > 0;
      g += slimZeus(66, 258, 1.15, live);
      g += slimZeus(92, 258, 1.15, live);
      g += canopy(58, 262, 56, 22, 22, live, [0.12, 0.88]);
      if (!live) g += scaffold(60, 250, 50, 20, 16);
    }
    if (site.market > 0 || raisingType(city.id, "market")) {
      g += marketKiosk(210, 236, site.market > 0, raisingType(city.id, "market") && site.market < 1);
    }
    if (raisingDc && dc < 1) g += scaffold(80, 210, 36, 20, 16);
    return { kind: "zaps", ax: 150, ay: 250, w: 360, h: 290, inner: g };
  }

  function compoundParts(city) {
    const you = hasCap(city.sites[YOU]) || jobsFor(city.id).some((j) => j.faction === YOU && (j.type === "dc" || j.type === "mcs"));
    if (you) return zapsParts(city);
    if (activeRivals().some((r) => hasCap(city.sites[r.id]))) return rivalParts(city);
    if (jobsFor(city.id).length) return dirtParts();
    return flagParts();
  }

  function wrapCompoundSvg(part) {
    return `<svg viewBox="0 0 ${part.w} ${part.h}" class="compound-svg" overflow="visible" aria-hidden="true">${part.inner}</svg>`;
  }

  function compoundMarkup(city, meta) {
    const resolved = meta || CITY_BY_ID[city.id];
    const kind = mapSpriteKind(city, resolved);
    if (playerYard(city) || kind === "dirt" || kind === "flag") {
      const baseKind = yardBaseKind(city, resolved);
      return `<div class="insp-yard" data-kind="${baseKind}">${yardArtHtml(city, resolved, { banner: false })}</div>`;
    }
    const src = MAP_SPRITES[kind] || MAP_SPRITES.flag;
    return `<img class="insp-sprite" src="${src}" alt="" data-kind="${kind}" draggable="false">`;
  }

  function otherRivalLive(city) {
    return Object.keys(RIVALS).some((id) => id !== "voltspan" && city.sites[id] && hasCap(city.sites[id]));
  }

  function mapSpriteKind(city, meta) {
    const site = city.sites[YOU];
    const zapsLive = hasCap(site);
    const voltspanLive = city.sites.voltspan && hasCap(city.sites.voltspan);
    const raising = jobsFor(city.id).length > 0;
    if (zapsLive) {
      if (meta.id === "phoenix") return "hq";
      if (meta.id === "vegas") return "vegas";
      if (meta.id === "tucson") return "tucson";
      return "plaza";
    }
    if (voltspanLive && !otherRivalLive(city)) return "voltspan";
    if (voltspanLive || otherRivalLive(city)) return "rival";
    if (raising) return "dirt";
    return "flag";
  }

  function iconMarkup(city, selectedHere, meta) {
    const kind = mapSpriteKind(city, meta);
    const src = MAP_SPRITES[kind] || MAP_SPRITES.flag;
    return `<img class="map-sprite" src="${src}" alt="" data-kind="${kind}" draggable="false">`;
  }

  function renderCities() {
    const layer = $("city-layer");
    layer.innerHTML = "";
    for (const meta of CITIES) {
      const city = state.cities[meta.id];
      recomputeShare(city);
      const youSite = city.sites[YOU];
      const btn = document.createElement("button");
      const occ = occupantClass(city);
      const raising = jobsFor(meta.id).length > 0;
      const tier = compoundTier(youSite);
      const sharp = rivalSite(city);
      const nodeRival = strongestRival(city);
      btn.className = `city-node ${occ} ${selected === meta.id ? "selected" : ""} ${raising ? "raising" : ""} ${siteView === meta.id ? "site-focus" : ""} ${sharp ? "sharp-rival" : ""} tier-${tier}`;
      if (nodeRival && (sharp || contestedCity(city))) btn.style.setProperty("--rival", nodeRival.color);
      btn.dataset.city = meta.id;
      btn.style.left = `${(meta.x / 1200) * 100}%`;
      btn.style.top = `${(meta.y / 800) * 100}%`;
      btn.title = `${meta.name}, ${meta.state}`;
      btn.tabIndex = 0;
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        enterSite(meta.id);
      });
      const icon = document.createElement("div");
      icon.className = "map-icon";
      icon.innerHTML = iconMarkup(city, selected === meta.id, meta);
      btn.append(icon);
      if (youSite.dc || youSite.mcs) {
        const kit = document.createElement("span");
        kit.className = "city-kit";
        const bits = [];
        if (youSite.dc) bits.push(`${youSite.dc} DC`);
        if (youSite.mcs) bits.push(`${youSite.mcs} MCS`);
        if (contestedCity(city)) bits.push("CONTESTED");
        kit.textContent = bits.join(" · ");
        btn.append(kit);
      } else if (rivalSite(city)) {
        const kit = document.createElement("span");
        const rival = strongestRival(city);
        kit.className = "city-kit rival-tag";
        kit.textContent = rival ? rival.name : "RIVAL";
        btn.append(kit);
      }
      const label = document.createElement("span");
      label.className = "city-label";
      label.textContent = meta.id === "phoenix" && youSite.dc
        ? `${meta.name.toUpperCase()} ★`
        : meta.name.toUpperCase();
      btn.append(label);
      layer.appendChild(btn);
    }
  }

  function applyMapCam() {
    const cam = $("map-cam");
    if (!cam) return;
    cam.style.transform = `translate(${mapCam.x}px, ${mapCam.y}px) scale(${mapCam.scale})`;
    $("btn-exit-site")?.classList.toggle("hidden", !siteView);
    $("map-stage")?.classList.toggle("site-open", Boolean(siteView));
  }

  function overlayBaseKind(kind) {
    return MAP_SPRITES[kind] ? kind : "dirt";
  }

  // Zaps-owned or Zaps-raising cities grow kit on a dirt pad. Occupancy
  // photos (hq / plaza / tucson / vegas) stay map stamps so the zoomed
  // yard cannot freeze on a compound that already paints BESS / lounge.
  function playerYard(city) {
    const site = city.sites[YOU];
    return hasCap(site) || jobsFor(city.id).some((j) => j.faction === YOU);
  }

  function yardBaseKind(city, meta) {
    // Claimable empties and Zaps yards share the dirt chessboard.
    // Rival compounds keep their photos. Do not paint a survey-flag hero.
    if (rivalSite(city)) return overlayBaseKind(mapSpriteKind(city, meta));
    return "dirt";
  }

  function jobList(cityId, type) {
    return jobsFor(cityId).filter((j) => j.type === type);
  }

  function jobPct(job, type) {
    const months = BUILD[type].months;
    return Math.max(0.12, Math.min(1, (months - job.left) / months));
  }

  function prunePops() {
    const now = Date.now();
    pops = pops.filter((p) => p.until > now);
  }

  function kitOccupancy(city) {
    const site = city.sites[YOU];
    const raising = {
      dc: raisingCount(city.id, "dc"),
      mcs: raisingCount(city.id, "mcs"),
      bess: site.bess < 1 ? raisingCount(city.id, "bess") : 0,
      lounge: site.lounge < 1 ? raisingCount(city.id, "lounge") : 0,
      market: site.market < 1 ? raisingCount(city.id, "market") : 0,
    };
    const previewDc = hoverKit === "dc" && city.id === selected;
    const dcPlan = dcPlacement(city, previewDc ? "dc" : null);
    const occ = {
      cityId: city.id,
      dc: Math.min(4, dcPlan.live.length + dcPlan.raising.length),
      mcs: Math.min(2, Math.max(0, site.mcs) + raising.mcs),
      bess: Math.min(1, Math.max(0, site.bess) + (raising.bess ? 1 : 0)),
      lounge: Math.min(1, Math.max(0, site.lounge) + (raising.lounge ? 1 : 0)),
      market: Math.min(1, Math.max(0, site.market) + (raising.market ? 1 : 0)),
      raising,
      live: site,
      dcPlan,
      jobs: {
        dc: jobList(city.id, "dc"),
        mcs: jobList(city.id, "mcs"),
        bess: jobList(city.id, "bess"),
        lounge: jobList(city.id, "lounge"),
        market: jobList(city.id, "market"),
      },
      preview: null,
    };
    const cap = { dc: 4, mcs: 2, bess: 1, lounge: 1, market: 1 };
    if (
      hoverKit &&
      hoverKit !== "dc" &&
      city.id === selected &&
      cap[hoverKit] &&
      !blockedReason(hoverKit, city.id) &&
      occ[hoverKit] < cap[hoverKit]
    ) {
      occ[hoverKit] += 1;
      occ.preview = hoverKit;
      if (hoverKit === "mcs") occ.raising[hoverKit] += 1;
      else occ.raising[hoverKit] = 1;
    }
    if (dcPlan.raising.some((item) => item.preview)) occ.preview = "dc";
    return occ;
  }

  function isoPadQuad(x, y, ne, se) {
    const neX = ne;
    const neY = -ne * 0.97;
    const seX = se;
    const seY = se * 1.01;
    return [
      [x, y],
      [x + seX, y + seY],
      [x + seX + neX, y + seY + neY],
      [x + neX, y + neY],
    ];
  }

  function svgPts(pts) {
    return pts.map((p) => p.map((n) => n.toFixed(2)).join(",")).join(" ");
  }

  function overlaySvg(cls, inner, extra = "") {
    return (
      `<svg class="site-overlay-svg ${cls}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"${extra}>` +
      inner +
      `</svg>`
    );
  }

  function gridStep() {
    return { ne: GRID.ne / GRID.cols, se: GRID.se / GRID.rows };
  }

  function gridXY(col, row) {
    const { ne, se } = gridStep();
    return {
      x: GRID.x + ne * col + se * row,
      y: GRID.y - ne * GRID.neK * col + se * GRID.seK * row,
    };
  }

  function gridQuad(col, row, dc, dr) {
    const o = gridXY(col, row);
    const { ne, se } = gridStep();
    return isoPadQuad(o.x, o.y, ne * dc, se * dr);
  }

  function liftPts(pts, h) {
    return pts.map((p) => [p[0], p[1] - h]);
  }

  function insetQuad(pts, t) {
    const cx = pts.reduce((s, p) => s + p[0], 0) / 4;
    const cy = pts.reduce((s, p) => s + p[1], 0) / 4;
    return pts.map((p) => [p[0] + (cx - p[0]) * t, p[1] + (cy - p[1]) * t]);
  }

  function lerp2(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function quadPoint(pts, u, v) {
    const a = lerp2(pts[0], pts[1], u);
    const b = lerp2(pts[3], pts[2], u);
    return lerp2(a, b, v);
  }

  function subQuad(pts, u0, v0, u1, v1) {
    return [
      quadPoint(pts, u0, v0),
      quadPoint(pts, u1, v0),
      quadPoint(pts, u1, v1),
      quadPoint(pts, u0, v1),
    ];
  }

  function cofferGrid(top, cols, rows) {
    let g = "";
    const padU = 0.06;
    const padV = 0.1;
    const uSpan = (1 - padU * 2) / cols;
    const vSpan = (1 - padV * 2) / rows;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const u0 = padU + c * uSpan + 0.012;
        const v0 = padV + r * vSpan + 0.02;
        const cell = subQuad(top, u0, v0, u0 + uSpan - 0.024, v0 + vSpan - 0.04);
        g += `<polygon class="site-coffer" points="${svgPts(cell)}" />`;
        g += `<polygon class="site-coffer-glow" points="${svgPts(insetQuad(cell, 0.22))}" />`;
      }
    }
    return g;
  }

  function cylPost(c, r, w, d, h, tone) {
    const foot = insetQuad(gridQuad(c, r, w, d), 0);
    const body = isoPrism(foot, h, tone);
    let g = body.g;
    g += faceRect(body, 0.08, 0.08, 0.28, 0.84, "rgba(245,240,232,0.28)");
    return g;
  }

  function ghostTone(kind) {
    if (kind === "lounge") {
      return { top: "#c8c2b4", front: "#9a9488", side: "#7a7468", edge: "rgba(245,240,232,0.95)" };
    }
    if (kind === "market") {
      return { top: "#6a5a48", front: "#4a3e34", side: "#3a322c", edge: "rgba(232,154,46,0.95)" };
    }
    if (kind === "mcs") {
      // Electric violet — distinct from cyan DC/BESS and amber MARKET, never error-red.
      return { top: "#9a86c8", front: "#7a68b0", side: "#645694", edge: "rgba(216,196,255,1)" };
    }
    if (kind === "bess") {
      return { top: "#3a4a52", front: "#2a383e", side: "#222e34", edge: "rgba(0,212,245,0.95)" };
    }
    return { top: "#5a6e78", front: "#3e5058", side: "#324048", edge: "rgba(0,212,245,0.95)" };
  }

  function growH(base, ghost, pct) {
    if (!ghost) return base;
    return base * (0.68 + 0.32 * Math.max(0.18, Math.min(1, pct || 0.18)));
  }

  function slotJob(occ, type, ghostIndex) {
    const job = occ.jobs?.[type]?.[ghostIndex];
    if (job) return { left: job.left, pct: jobPct(job, type), preview: false };
    if (occ.preview === type) return { left: BUILD[type].months, pct: 0.22, preview: true };
    return { left: BUILD[type].months, pct: 0.22, preview: false };
  }

  function slotPop(occ, type, index) {
    prunePops();
    return pops.some((p) => p.city === occ.cityId && p.type === type && (p.slot == null || p.slot === index));
  }

  function isoPrism(foot, h, tone) {
    const top = liftPts(foot, h);
    const [, se, ne] = foot;
    const [swT, seT, neT, nwT] = top;
    let g = poly([se, seT, neT, ne], tone.side, tone.edge, 0.26);
    g += poly([foot[0], se, seT, swT], tone.front, tone.edge, 0.26);
    g += poly([swT, seT, neT, nwT], tone.top, tone.edge, 0.34);
    return { g, foot, top, sw: foot[0], se, ne, nw: foot[3], swT, seT, neT, nwT };
  }

  function faceRect(prism, inset, topPad, wFrac, hFrac, fill) {
    const spanX = prism.seT[0] - prism.swT[0];
    const spanY = prism.se[1] - prism.swT[1];
    const x = prism.swT[0] + spanX * inset;
    const y = prism.swT[1] + Math.max(1.1, spanY * topPad);
    const w = Math.max(0.7, spanX * wFrac);
    const h = Math.max(0.8, (prism.sw[1] - prism.swT[1]) * hFrac);
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}"/>`;
  }

  function wrapBldg(cls, ghost, inner, pop, preview) {
    const bits = ["site-bldg", cls];
    if (ghost) bits.push("raising");
    if (preview) bits.push("preview");
    if (pop) bits.push("pop");
    const kind = (cls || "").replace(/^kit-/, "").replace(/-unit$/, "");
    const inspect = ghost && !preview ? ` data-inspect="${kind}"` : "";
    return `<g class="${bits.join(" ")}"${inspect}>${inner}</g>`;
  }

  function occupiedTiles(occ) {
    const tiles = new Map();
    const add = (c, r, kind) => {
      const key = `${c},${r}`;
      if (!tiles.has(key)) tiles.set(key, { c, r, kind });
    };
    if (occ.dcPlan) {
      const seen = new Set();
      const paint = (idx) => {
        const slot = SLOTS.dc[idx];
        if (!slot || seen.has(idx)) return;
        seen.add(idx);
        add(slot.c, slot.r, "dc");
      };
      occ.dcPlan.live.forEach(paint);
      occ.dcPlan.raising.forEach((item) => paint(item.slot));
    } else {
      for (let i = 0; i < occ.dc; i += 1) {
        const slot = SLOTS.dc[i];
        if (!slot) continue;
        add(slot.c, slot.r, "dc");
      }
    }
    if (occ.mcs) SLOTS.mcs.forEach((s) => add(s.c, s.r, "mcs"));
    if (occ.bess) SLOTS.bess.forEach((s) => add(s.c, s.r, "bess"));
    if (occ.lounge) SLOTS.lounge.forEach((s) => add(s.c, s.r, "lounge"));
    if (occ.market) SLOTS.market.forEach((s) => add(s.c, s.r, "market"));
    return [...tiles.values()];
  }

  function tilePaintOrder(a, b) {
    return a.r - a.c - (b.r - b.c) || a.r - b.r || b.c - a.c;
  }

  function stallPaint(c, r) {
    const stall = insetQuad(gridQuad(c + 0.16, r + 0.38, 0.68, 0.48), 0);
    const mid = insetQuad(gridQuad(c + 0.47, r + 0.42, 0.06, 0.38), 0);
    return (
      `<polygon class="site-stall" points="${svgPts(stall)}" />` +
      `<polygon class="site-stall-hash" points="${svgPts(mid)}" />`
    );
  }

  function boardEtch() {
    let g = "";
    for (let r = 0; r < GRID.rows; r += 1) {
      for (let c = 0; c < GRID.cols; c += 1) {
        const odd = (c + r) % 2;
        const quad = gridQuad(c, r, 1, 1);
        g += `<polygon class="site-board-grout" points="${svgPts(insetQuad(quad, 0.02))}" />`;
        g += `<polygon class="site-board-etch${odd ? " odd" : ""}" points="${svgPts(insetQuad(quad, 0.08))}" />`;
      }
    }
    return g;
  }

  function reservedMark(occ, c, r) {
    if (occ.dcPlan) {
      const hit = occ.dcPlan.raising.find((item) => {
        const slot = SLOTS.dc[item.slot];
        return slot && slot.c === c && slot.r === r;
      });
      if (hit) {
        const job = dcJobView(hit);
        return { kind: "dc", label: `DC ${hit.slot + 1}`, ...job };
      }
    } else {
      for (let i = occ.live.dc; i < occ.dc; i += 1) {
        const slot = SLOTS.dc[i];
        if (slot && slot.c === c && slot.r === r) {
          return { kind: "dc", label: `DC ${i + 1}`, ...slotJob(occ, "dc", i - occ.live.dc) };
        }
      }
    }
    if (occ.raising.mcs) {
      const live = occ.live.mcs;
      for (let i = 0; i < SLOTS.mcs.length; i += 1) {
        const slot = SLOTS.mcs[i];
        if (i >= live && slot.c === c && slot.r === r) {
          return { kind: "mcs", label: i === live ? "MCS" : "", ...slotJob(occ, "mcs", i - live) };
        }
      }
    }
    if (occ.raising.bess && SLOTS.bess.some((s) => s.c === c && s.r === r)) {
      return {
        kind: "bess",
        label: c === SLOTS.bess[0].c && r === SLOTS.bess[0].r ? "BESS" : "",
        ...slotJob(occ, "bess", 0),
      };
    }
    if (occ.raising.lounge && SLOTS.lounge.some((s) => s.c === c && s.r === r)) {
      return { kind: "lounge", label: c === SLOTS.lounge[0].c ? "LOUNGE" : "", ...slotJob(occ, "lounge", 0) };
    }
    if (occ.raising.market && SLOTS.market.some((s) => s.c === c && s.r === r)) {
      return { kind: "market", label: c === SLOTS.market[0].c ? "MARKET" : "", ...slotJob(occ, "market", 0) };
    }
    return null;
  }

  function ghostBadge(c, r, title, job) {
    if (!title) return "";
    const q = gridQuad(c, r, 1, 1);
    const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
    const cy = Math.min(q[0][1], q[1][1], q[2][1], q[3][1]) - 4.4;
    const count = job?.preview ? "SET" : `${job?.left ?? ""} MO`;
    const inspect = job?.preview ? "" : ` data-inspect="${(title.split(" ")[0] || "").toLowerCase()}"`;
    const focus = inspectJob && title.toLowerCase().startsWith(inspectJob) ? " focus" : "";
    return (
      `<g class="site-ghost-badge${job?.preview ? " preview" : ""}${focus}"${inspect}>` +
      `<rect class="site-ghost-plate" x="${(cx - 6.8).toFixed(2)}" y="${(cy - 5.0).toFixed(2)}" width="13.6" height="6.5" rx="0.7"/>` +
      `<text class="site-ghost-label" x="${cx.toFixed(2)}" y="${(cy - 1.2).toFixed(2)}" text-anchor="middle">${title}</text>` +
      `<text class="site-ghost-count" x="${cx.toFixed(2)}" y="${(cy + 2.2).toFixed(2)}" text-anchor="middle">${count}</text>` +
      `</g>`
    );
  }

  function slotPickHits(occ) {
    if (occ.preview !== "dc" || !occ.dcPlan) return "";
    const used = new Set(occ.dcPlan.live);
    for (const item of occ.dcPlan.raising) {
      if (!item.preview) used.add(item.slot);
    }
    const empty = emptyDcSlots(used);
    if (empty.length < 2) return "";
    const picked = occ.dcPlan.raising.find((item) => item.preview)?.slot;
    return empty
      .map((i) => {
        const slot = SLOTS.dc[i];
        if (!slot) return "";
        const quad = insetQuad(gridQuad(slot.c, slot.r, 1, 1), 0.08);
        const on = i === picked ? " on" : "";
        return `<polygon class="site-slot-hit${on}" data-place="dc" data-slot="${i}" points="${svgPts(quad)}" />`;
      })
      .join("");
  }

  function ghostCaptions(occ) {
    let g = "";
    if (occ.dcPlan) {
      for (const item of occ.dcPlan.raising) {
        const slot = SLOTS.dc[item.slot];
        if (slot) g += ghostBadge(slot.c, slot.r, `DC ${item.slot + 1}`, dcJobView(item));
      }
    } else {
      for (let i = occ.live.dc; i < occ.dc; i += 1) {
        const slot = SLOTS.dc[i];
        if (slot) g += ghostBadge(slot.c, slot.r, `DC ${i + 1}`, slotJob(occ, "dc", i - occ.live.dc));
      }
    }
    if (occ.raising.mcs && occ.live.mcs < occ.mcs) {
      g += ghostBadge(SLOTS.mcs[0].c, SLOTS.mcs[0].r, "MCS", slotJob(occ, "mcs", 0));
    }
    if (occ.raising.bess) g += ghostBadge(SLOTS.bess[1].c, SLOTS.bess[1].r, "BESS", slotJob(occ, "bess", 0));
    if (occ.raising.lounge) g += ghostBadge(SLOTS.lounge[0].c, SLOTS.lounge[0].r, "LOUNGE", slotJob(occ, "lounge", 0));
    if (occ.raising.market) g += ghostBadge(SLOTS.market[0].c, SLOTS.market[0].r, "MARKET", slotJob(occ, "market", 0));
    return g;
  }

  function plazaGeom(occ) {
    const tiles = occupiedTiles(occ);
    if (!tiles.length) return "";
    const ordered = tiles.slice().sort(tilePaintOrder);
    let lifts = "";
    let curbs = "";
    let decks = "";
    let paint = "";
    let reserve = "";
    for (const { c, r, kind } of ordered) {
      const quad = gridQuad(c, r, 1, 1);
      const odd = (c + r) % 2;
      const mark = reservedMark(occ, c, r);
      lifts += `<polygon class="site-plaza-lift" points="${svgPts(insetQuad(quad, -0.02))}" />`;
      curbs += `<polygon class="site-tile-curb" points="${svgPts(insetQuad(quad, 0.03))}" />`;
      decks += `<polygon class="site-tile${odd ? " odd" : ""} kind-${kind}${mark ? " reserved" : ""}" points="${svgPts(insetQuad(quad, 0.11))}" />`;
      if (mark) {
        reserve += `<polygon class="site-tile-reserve kind-${mark.kind}${mark.preview ? " preview" : ""}" points="${svgPts(insetQuad(quad, 0.04))}" />`;
        const pct = mark.pct || 0.12;
        reserve += `<polygon class="site-tile-progress kind-${mark.kind}" points="${svgPts(insetQuad(quad, 0.18 + (1 - pct) * 0.28))}" />`;
      }
      if (kind === "dc") paint += stallPaint(c, r);
      if (kind === "mcs") {
        paint += `<polygon class="site-stall mcs" points="${svgPts(insetQuad(quad, 0.2))}" />`;
      }
      if (kind === "bess") {
        paint += `<polygon class="site-equip" points="${svgPts(insetQuad(quad, 0.22))}" />`;
      }
      if (kind === "lounge" || kind === "market") {
        paint += `<polygon class="site-walk" points="${svgPts(insetQuad(quad, 0.2))}" />`;
      }
    }
    return boardEtch() + lifts + curbs + decks + paint + reserve;
  }

  function pitchedRoof(foot, rise, tone) {
    const [sw, se, ne, nw] = foot;
    const midL = [(sw[0] + nw[0]) / 2, (sw[1] + nw[1]) / 2 - rise];
    const midR = [(se[0] + ne[0]) / 2, (se[1] + ne[1]) / 2 - rise];
    let g = poly([sw, se, midR, midL], tone.front, tone.edge, 0.28);
    g += poly([se, ne, midR], tone.side, tone.edge, 0.26);
    g += poly([nw, ne, midR, midL], tone.top, tone.edge, 0.34);
    g += poly([sw, nw, midL], tone.front, tone.edge, 0.26);
    return { g, midL, midR };
  }

  function drawBess(occ) {
    if (!occ.bess) return "";
    const ghost = Boolean(occ.raising.bess);
    const job = ghost ? slotJob(occ, "bess", 0) : null;
    const tone = ghost ? ghostTone("bess") : SURF.charcoal;
    const h = growH(8.4, ghost, job?.pct);
    let g = "";
    SLOTS.bess.forEach((slot, i) => {
      const plinth = isoPrism(insetQuad(gridQuad(slot.c + 0.16, slot.r + 0.18, 0.68, 0.64), 0.02), 0.85, ghost ? ghostTone("bess") : SURF.concrete);
      const box = isoPrism(insetQuad(gridQuad(slot.c + 0.22, slot.r + 0.22, 0.56, 0.56), 0.02), h, tone);
      g += plinth.g + box.g;
      g += `<polygon class="site-bess-cap" points="${svgPts(insetQuad(box.top, 0.16))}" />`;
      g += faceRect(box, 0.12, 0.08, 0.76, 0.07, PAL.amber);
      g += faceRect(box, 0.14, 0.28, 0.72, 0.08, ghost ? "#243038" : "#141418");
      g += faceRect(box, 0.14, 0.42, 0.72, 0.08, ghost ? "#243038" : "#141418");
      g += faceRect(box, 0.14, 0.56, 0.72, 0.08, ghost ? "#243038" : "#141418");
      if (!ghost && i === 1) g += faceRect(box, 0.72, 0.1, 0.14, 0.1, PAL.red);
    });
    return wrapBldg("kit-bess", ghost, g, slotPop(occ, "bess", 0), job?.preview);
  }

  function drawMcs(occ) {
    if (!occ.mcs) return "";
    const n = occ.mcs;
    const live = occ.live.mcs;
    const raising = occ.raising.mcs;
    const bayGhost = raising && live < 1;
    const roofTone = bayGhost ? ghostTone("mcs") : SURF.alum;
    const postTone = bayGhost ? ghostTone("mcs") : SURF.alum;
    const lift = 11.4;
    const bay = insetQuad(gridQuad(0.08, 1.08, 0.84, 1.84), 0.02);
    let g = "";
    const cab = isoPrism(insetQuad(gridQuad(0.14, 1.22, 0.52, 1.56), 0.02), growH(6.2, bayGhost, 0.7), bayGhost ? ghostTone("mcs") : SURF.charcoal);
    g += cab.g;
    g += faceRect(cab, 0.1, 0.12, 0.8, 0.1, PAL.amber);
    g += faceRect(cab, 0.1, 0.3, 0.8, 0.12, bayGhost ? "#2a2020" : "#141418");
    g += faceRect(cab, 0.1, 0.5, 0.8, 0.12, bayGhost ? "#2a2020" : "#141418");
    g += faceRect(cab, 0.72, 0.14, 0.16, 0.1, PAL.red);
    [
      [0.1, 1.12],
      [0.1, 2.72],
    ].forEach(([c, r]) => {
      g += cylPost(c, r, 0.16, 0.14, lift, postTone);
    });
    for (let i = 0; i < n; i += 1) {
      const ghost = raising && i >= live;
      const job = ghost ? slotJob(occ, "mcs", i - live) : null;
      const tone = ghost ? ghostTone("mcs") : SURF.charcoal;
      const h = growH(10.6, ghost, job?.pct);
      const foot = insetQuad(gridQuad(0.36, 1.22 + i * 0.82, 0.48, 0.52), 0.02);
      const body = isoPrism(foot, h, tone);
      let unit = body.g;
      unit += faceRect(body, 0.12, 0.1, 0.76, 0.58, ghost ? "#2a2020" : "#1a1a20");
      unit += faceRect(body, 0.16, 0.14, 0.66, 0.1, PAL.amber);
      unit += faceRect(body, 0.2, 0.3, 0.22, 0.08, PAL.red);
      unit += `<polygon class="site-mcs-ring" points="${svgPts(insetQuad(foot, -0.1))}" />`;
      g += wrapBldg("kit-mcs-unit", ghost, unit, slotPop(occ, "mcs", i), job?.preview);
    }
    const roof = isoPrism(liftPts(bay, lift), 1.15, roofTone);
    g += roof.g;
    g += `<polygon class="site-mcs-edge" points="${svgPts(insetQuad(roof.top, 0.08))}" />`;
    g += `<polygon class="site-roof-under" points="${svgPts(insetQuad(roof.top, 0.18))}" />`;
    return wrapBldg("kit-mcs", bayGhost, g, slotPop(occ, "mcs", 0) && live >= 1, occ.preview === "mcs" && live < 1);
  }

  function drawDcUnit(slot, ghost, job, pop) {
    const tone = ghost ? ghostTone("dc") : SURF.alum;
    const h = growH(16.8, ghost, job?.pct);
    const foot = insetQuad(gridQuad(slot.c + 0.34, slot.r + 0.42, 0.32, 0.38), 0);
    const body = isoPrism(foot, h, tone);
    const hat = isoPrism(liftPts(insetQuad(foot, 0.08), h), ghost ? 0.7 : 0.55, ghost ? ghostTone("dc") : SURF.alum);
    let unit = body.g + hat.g;
    unit += faceRect(body, 0.1, 0.07, 0.8, 0.72, ghost ? "#243038" : "#1E1E24");
    unit += faceRect(body, 0.16, 0.1, 0.68, 0.12, PAL.amber);
    unit += faceRect(body, 0.22, 0.26, 0.24, 0.09, PAL.red);
    unit += `<polygon class="site-dc-ring" points="${svgPts(insetQuad(foot, -0.18))}" />`;
    const leftHook = insetQuad(gridQuad(slot.c + 0.26, slot.r + 0.54, 0.08, 0.08), 0);
    const rightHook = insetQuad(gridQuad(slot.c + 0.66, slot.r + 0.54, 0.08, 0.08), 0);
    const holsterL = isoPrism(liftPts(leftHook, h * 0.48), 1.2, ghost ? ghostTone("dc") : SURF.charcoal);
    const holsterR = isoPrism(liftPts(rightHook, h * 0.48), 1.2, ghost ? ghostTone("dc") : SURF.charcoal);
    unit += holsterL.g + holsterR.g;
    if (!ghost) {
      const a = holsterL.sw;
      const b = holsterR.se;
      unit += `<path class="site-dc-cable" d="M${a[0].toFixed(2)} ${a[1].toFixed(2)} Q${(a[0] - 1.8).toFixed(2)} ${(a[1] + 2.4).toFixed(2)} ${(a[0] - 0.3).toFixed(2)} ${(a[1] + 4.4).toFixed(2)}" />`;
      unit += `<path class="site-dc-cable" d="M${b[0].toFixed(2)} ${b[1].toFixed(2)} Q${(b[0] + 2.0).toFixed(2)} ${(b[1] + 2.2).toFixed(2)} ${(b[0] + 0.4).toFixed(2)} ${(b[1] + 4.2).toFixed(2)}" />`;
    }
    return wrapBldg("kit-dc-unit", ghost, unit, pop, job?.preview);
  }

  function drawDcCanopy(occ) {
    const liveSlots = occ.dcPlan ? occ.dcPlan.live : Array.from({ length: occ.live.dc }, (_, i) => i);
    if (!liveSlots.length) return "";
    const contiguous = liveSlots.every((s, i) => s === i);
    const live = contiguous ? liveSlots.length : Math.max(...liveSlots) - Math.min(...liveSlots) + 1;
    const origin = contiguous ? 1 : SLOTS.dc[Math.min(...liveSlots)].c;
    const lift = 15.6;
    let g = "";
    if (contiguous) {
      for (let i = 0; i <= live; i += 1) {
        g += cylPost(1 + i - 0.03, 1.02, 0.07, 0.08, lift, SURF.alum);
      }
    } else {
      for (const i of liveSlots) {
        const slot = SLOTS.dc[i];
        if (slot) g += cylPost(slot.c - 0.03, slot.r + 0.02, 0.07, 0.08, lift, SURF.alum);
      }
    }
    const street = insetQuad(gridQuad(origin, 0.96, live + 0.02, 0.42), 0);
    const roof = isoPrism(liftPts(street, lift), 0.62, SURF.cream);
    g += roof.g;
    g += `<polygon class="site-roof-deck" points="${svgPts(roof.top)}" />`;
    g += cofferGrid(roof.top, Math.max(3, live * 2), 1);
    const fascia = [
      lerp2(roof.swT, roof.seT, 0.03),
      lerp2(roof.swT, roof.seT, 0.97),
      lerp2(roof.sw, roof.se, 0.97),
      lerp2(roof.sw, roof.se, 0.03),
    ];
    g += `<polygon class="site-roof-fascia" points="${svgPts(fascia)}" />`;
    return wrapBldg("kit-dc-canopy", false, g);
  }

  function drawDcRow(occ) {
    if (occ.dc < 1) return "";
    let g = "";
    if (occ.dcPlan) {
      for (const i of occ.dcPlan.live) {
        const slot = SLOTS.dc[i];
        if (slot) g += drawDcUnit(slot, false, null, slotPop(occ, "dc", i));
      }
      for (const item of occ.dcPlan.raising) {
        const slot = SLOTS.dc[item.slot];
        if (slot) g += drawDcUnit(slot, true, dcJobView(item), false);
      }
    } else {
      for (let i = 0; i < occ.dc; i += 1) {
        const slot = SLOTS.dc[i];
        if (!slot) continue;
        const ghost = i >= occ.live.dc;
        const job = ghost ? slotJob(occ, "dc", i - occ.live.dc) : null;
        g += drawDcUnit(slot, ghost, job, slotPop(occ, "dc", i));
      }
    }
    return wrapBldg("kit-dc", false, g);
  }

  function drawLounge(occ) {
    if (!occ.lounge) return "";
    const ghost = Boolean(occ.raising.lounge);
    const job = ghost ? slotJob(occ, "lounge", 0) : null;
    const tone = ghost ? ghostTone("lounge") : SURF.cream;
    const h = growH(9.2, ghost, job?.pct);
    const foot = insetQuad(gridQuad(0.12, 3.08, 1.76, 0.72), 0.02);
    const patio = isoPrism(insetQuad(gridQuad(0.28, 3.56, 0.96, 0.3), 0), 0.7, ghost ? ghostTone("lounge") : SURF.concrete);
    const planter = isoPrism(insetQuad(gridQuad(1.54, 3.6, 0.24, 0.2), 0), 1.2, ghost ? ghostTone("lounge") : SURF.alum);
    const body = isoPrism(foot, h, tone);
    let g = patio.g + planter.g + body.g;
    g += faceRect(body, 0.88, 0.12, 0.08, 0.16, PAL.red);
    const roof = isoPrism(liftPts(insetQuad(foot, -0.08), h + 0.55), 1.05, ghost ? tone : SURF.alum);
    g += roof.g;
    if (!ghost) {
      g += `<polygon class="site-lounge-edge" points="${svgPts(insetQuad(roof.top, 0.1))}" />`;
      g += cofferGrid(roof.top, 3, 1);
    }
    const front = [body.swT, body.seT, body.se, body.sw];
    const glass = ghost ? "#243038" : "#1a1410";
    g += `<polygon class="site-portal" points="${svgPts(subQuad(front, 0.07, 0.16, 0.42, 0.84))}" fill="${glass}" />`;
    g += `<polygon class="site-portal" points="${svgPts(subQuad(front, 0.5, 0.16, 0.85, 0.84))}" fill="${glass}" />`;
    if (!ghost) {
      g += `<polygon class="site-portal-glow" points="${svgPts(subQuad(front, 0.1, 0.22, 0.39, 0.48))}" />`;
      g += `<polygon class="site-portal-glow" points="${svgPts(subQuad(front, 0.53, 0.22, 0.82, 0.48))}" />`;
    }
    return wrapBldg("kit-lounge", ghost, g, slotPop(occ, "lounge", 0), job?.preview);
  }

  function drawMarket(occ) {
    if (!occ.market) return "";
    const ghost = Boolean(occ.raising.market);
    const job = ghost ? slotJob(occ, "market", 0) : null;
    const tone = ghost ? ghostTone("market") : SURF.charcoal;
    const awn = ghost ? ghostTone("lounge") : SURF.cream;
    const h = growH(7.8, ghost, job?.pct);
    const foot = insetQuad(gridQuad(2.28, 3.22, 1.44, 0.52), 0.02);
    const body = isoPrism(foot, h, tone);
    let g = body.g;
    const front = [body.swT, body.seT, body.se, body.sw];
    g += `<polygon class="site-market-board" points="${svgPts(subQuad(front, 0.1, 0.18, 0.62, 0.72))}" />`;
    if (!ghost) g += `<polygon class="site-portal-glow" points="${svgPts(subQuad(front, 0.16, 0.32, 0.56, 0.52))}" />`;
    g += faceRect(body, 0.76, 0.16, 0.14, 0.16, PAL.red);
    const awning = isoPrism(liftPts(insetQuad(gridQuad(2.2, 3.52, 1.58, 0.22), 0), h * 0.7), 0.7, awn);
    g += awning.g;
    return wrapBldg("kit-market", ghost, g, slotPop(occ, "market", 0), job?.preview);
  }

  function kitLayersHtml(city) {
    const occ = kitOccupancy(city);
    const any = occ.dc + occ.mcs + occ.bess + occ.lounge + occ.market;
    const inner =
      (any ? plazaGeom(occ) : boardEtch()) +
      drawBess(occ) +
      drawMcs(occ) +
      drawLounge(occ) +
      drawMarket(occ) +
      drawDcCanopy(occ) +
      drawDcRow(occ) +
      ghostCaptions(occ) +
      slotPickHits(occ);
    return overlaySvg(any ? "site-compound" : "site-compound empty-board", inner);
  }

  function siteRaisingBanner(cityId) {
    const mine = jobsFor(cityId);
    if (!mine.length) return "";
    const live = state.cities[cityId].sites[YOU];
    const seen = {};
    const bits = mine.map((j) => {
      seen[j.type] = (seen[j.type] || 0) + 1;
      if (j.type === "dc") return `DC ${ (live.dc || 0) + seen.dc } ${j.left} MO`;
      return `${BUILD[j.type].name} ${j.left} MO`;
    });
    return `<div class="site-raising">${bits.join(" · ")}</div>`;
  }

  function rivalCutHtml(city) {
    const rival = strongestRival(city);
    const color = rival ? rival.color : PAL.amber;
    return (
      `<svg class="site-rival-cut" viewBox="0 0 240 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">` +
      `<g fill="none" stroke="${color}" stroke-width="3.4" stroke-linejoin="miter">` +
      `<polygon points="46,122 170,122 198,80 74,80"/>` +
      `<polygon points="78,78 94,34 190,34 170,78"/>` +
      `<polygon points="110,34 110,14 158,14 158,34"/>` +
      `<polygon points="26,136 72,136 84,110 38,110"/>` +
      `<polygon points="176,112 214,112 226,90 188,90"/>` +
      `</g></svg>`
    );
  }

  function yardArtHtml(city, meta, { banner = true } = {}) {
    const baseKind = yardBaseKind(city, meta);
    const base = MAP_SPRITES[baseKind] || MAP_SPRITES.dirt;
    let html = `<img class="site-base" src="${base}" alt="" draggable="false" data-kind="${baseKind}">`;
    if (baseKind === "dirt" || baseKind === "flag") html += kitLayersHtml(city);
    if (rivalSite(city)) html += rivalCutHtml(city);
    if (banner) html += siteRaisingBanner(meta.id);
    return html;
  }

  function parseAspect(aspectStr) {
    const parts = String(aspectStr || "220 / 131").split("/");
    const aw = Number(parts[0]) || 220;
    const ah = Number(parts[1]) || 131;
    return { aw, ah, css: `${aw} / ${ah}` };
  }

  // Goldilocks yard frame: full pad + a bit of sand (~76% of the yard
  // box). Not the old 88%/820 canopy crop, not the 46%/460 postage stamp.
  function frameSiteStack(stack, aspectStr) {
    const { aw, ah, css } = parseAspect(aspectStr);
    stack.style.aspectRatio = css;
    const yard = $("site-yard");
    if (!yard) return;
    const boxW = yard.clientWidth;
    const boxH = yard.clientHeight;
    if (boxW < 40 || boxH < 40) return;
    const ratio = aw / ah;
    const maxW = Math.min(boxW * 0.76, 800);
    const maxH = Math.min(boxH * 0.92, 520);
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    stack.style.width = `${Math.round(w)}px`;
    stack.style.maxWidth = `${Math.round(w)}px`;
  }

  function inspectRaising(type) {
    if (!type || !BUILD[type]) return;
    inspectJob = type;
    const job = siteView ? jobList(siteView, type)[0] : null;
    if (job) {
      toast(`${BUILD[type].name} raising · ${job.left} mo left. Click the queue to keep it in view.`, "deal");
    } else {
      toast(`${BUILD[type].name} — no live job on this pad.`, "deal");
    }
    renderInspector();
    renderSiteYard();
  }

  function bindYardInspect() {
    const yard = $("site-yard");
    if (!yard || yard.dataset.inspectBound) return;
    yard.dataset.inspectBound = "1";
    yard.addEventListener("click", (e) => {
      const place = e.target.closest("[data-place]");
      if (place && hoverKit && siteView) {
        e.preventDefault();
        e.stopPropagation();
        slotOverride = {
          city: siteView,
          type: place.getAttribute("data-place"),
          slot: Number(place.getAttribute("data-slot")),
        };
        renderSiteYard();
        return;
      }
      const hit = e.target.closest("[data-inspect]");
      if (!hit) return;
      const type = hit.getAttribute("data-inspect");
      if (type) inspectRaising(type);
    });
    yard.addEventListener("mouseleave", (e) => {
      const next = e.relatedTarget;
      if (next && next.closest && next.closest(".tray, #site-yard, #site-overlay")) return;
      if (hoverKit) {
        hoverKit = null;
        renderSiteYard();
      }
    });
  }

  function bindYardFrame() {
    const yard = $("site-yard");
    if (!yard || yard.dataset.frameBound) return;
    yard.dataset.frameBound = "1";
    const ro = new ResizeObserver(() => {
      const stack = $("site-stack");
      if (!stack || !siteView) return;
      frameSiteStack(stack, stack.style.aspectRatio || "220 / 131");
    });
    ro.observe(yard);
  }

  function renderSiteYard() {
    const overlay = $("site-overlay");
    if (!overlay) return;
    overlay.classList.toggle("hidden", !siteView);
    if (!siteView || !state) return;
    const meta = CITY_BY_ID[siteView];
    const city = state.cities[siteView];
    const kind = mapSpriteKind(city, meta);
    const baseKind = yardBaseKind(city, meta);
    $("site-overlay-kicker").textContent = `${meta.name.toUpperCase()} // SITE`;
    const sealed = rivalSite(city);
    const contested = contestedCity(city);
    $("site-overlay-type").textContent = sealed
      ? "RIVAL SITE"
      : contested
        ? "CONTESTED"
        : SITE_TYPE_NAME[baseKind] || SITE_TYPE_NAME[kind] || "SITE";
    const intel = $("site-overlay-intel");
    const rival = strongestRival(city);
    const intelExtra = `${intelHtml(city)}${state.skirmish && state.skirmish.city === city.id ? skirmishHtml() : ""}`;
    if (intel) {
      if (sealed) {
        intel.className = "site-intel rival";
        intel.innerHTML = `${shareDuelHtml(city)}<p>RIVAL SITE · ${rival ? rival.name : "They"} hold this pad. Compete on price and empty dirt — you cannot seize the compound.</p>${intelExtra}`;
      } else if (contested) {
        intel.className = "site-intel contested";
        intel.innerHTML = `${shareDuelHtml(city)}<p>CONTESTED · ${rival ? rival.name : "A rival"} shares this market. Answer the chip — price, lounge, or BESS. Their dirt stays theirs.</p>${threatChipHtml(city)}${intelExtra}`;
      } else if (intelExtra) {
        intel.className = "site-intel";
        intel.innerHTML = intelExtra;
      } else {
        intel.className = "site-intel hidden";
        intel.innerHTML = "";
      }
    }
    const note = document.querySelector(".site-overlay-note");
    if (note) {
      note.textContent = sealed
        ? "Rival compound. Tray shows RIVAL SITE — kit will not land here. ESC or EXIT returns to the Western Interconnect."
        : "Kit ghosts show a countdown and fill as crews work. Click a raising job to inspect. Complete pops in place. ESC or EXIT returns to the Western Interconnect.";
    }
    const stack = $("site-stack");
    if (!stack) return;
    const consequence = $("site-consequence");
    if (consequence) {
      const held = yardFlash && yardFlash.hold && yardFlash.city === city.id;
      const popped = pops.find((p) => p.city === city.id && p.until > Date.now());
      const line = held && popped
        ? `${BUILD[popped.type].name} COMPLETE`
        : !sealed && hoverKit
          ? placementRead(city, hoverKit)
          : "";
      consequence.textContent = line;
      consequence.classList.toggle("hidden", !line);
    }
    const site = city.sites[YOU];
    const aspect = SPRITE_ASPECT[baseKind] || "220 / 131";
    frameSiteStack(stack, aspect);
    requestAnimationFrame(() => frameSiteStack(stack, aspect));
    stack.dataset.kind = baseKind;
    stack.dataset.layout = playerYard(city) ? "plaza" : baseKind;
    stack.dataset.dc = String(site.dc);
    stack.dataset.mcs = String(site.mcs);
    stack.dataset.bess = String(site.bess);
    stack.dataset.lounge = String(site.lounge);
    stack.dataset.market = String(site.market);
    stack.dataset.sealed = sealed ? "1" : "0";
    if (rival && (sealed || contested)) stack.dataset.rival = rival.id;
    else delete stack.dataset.rival;
    const flashing = yardFlash && yardFlash.city === city.id && (yardFlash.hold || yardFlash.until > Date.now());
    const popping = pops.some((p) => p.city === city.id && p.until > Date.now());
    stack.classList.toggle("yard-flash", Boolean(flashing));
    stack.classList.toggle("hold", Boolean(yardFlash && yardFlash.hold && yardFlash.city === city.id));
    stack.classList.toggle("kit-complete", popping);
    stack.innerHTML = yardArtHtml(city, meta, { banner: true });
  }

  function clampCam() {
    const stage = $("map-stage");
    if (!stage) return;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    mapCam.scale = Math.min(3.4, Math.max(1, mapCam.scale));
    const slackX = sw * 0.45;
    const slackY = sh * 0.45;
    const minX = sw - sw * mapCam.scale - slackX;
    const maxX = slackX;
    const minY = sh - sh * mapCam.scale - slackY;
    const maxY = slackY;
    mapCam.x = Math.min(maxX, Math.max(minX, mapCam.x));
    mapCam.y = Math.min(maxY, Math.max(minY, mapCam.y));
  }

  function zoomAt(cx, cy, nextScale) {
    const prev = mapCam.scale;
    mapCam.scale = nextScale;
    clampCam();
    const k = mapCam.scale / prev;
    mapCam.x = cx - (cx - mapCam.x) * k;
    mapCam.y = cy - (cy - mapCam.y) * k;
    clampCam();
    applyMapCam();
  }

  function enterSite(id) {
    if (!CITY_BY_ID[id] || !state) return;
    if (!siteView) interconnectCam = { ...mapCam };
    selected = id;
    siteView = id;
    renderAll();
  }

  function exitSite() {
    siteView = null;
    hoverKit = null;
    slotOverride = null;
    inspectJob = null;
    mapCam = { ...interconnectCam };
    clampCam();
    renderAll();
  }

  function mapPointFromClient(clientX, clientY) {
    const frame = $("map-frame");
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 1200,
      y: ((clientY - rect.top) / rect.height) * 800,
    };
  }

  function nearestCity(x, y, r = CITY_HIT_R) {
    let best = null;
    let bestD = Infinity;
    for (const c of CITIES) {
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best && bestD <= r ? best : null;
  }

  function cityAtClient(clientX, clientY) {
    const pt = mapPointFromClient(clientX, clientY);
    if (!pt) return null;
    return nearestCity(pt.x, pt.y);
  }

  function bindMapControls() {
    const stage = $("map-stage");
    if (!stage || stage.dataset.bound) return;
    stage.dataset.bound = "1";
    stage.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".map-tools") || e.target.closest(".site-overlay")) return;
      mapDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: mapCam.x, oy: mapCam.y, moved: false };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("panning");
    });
    stage.addEventListener("pointermove", (e) => {
      if (!mapDrag || mapDrag.id !== e.pointerId) return;
      const dx = e.clientX - mapDrag.x;
      const dy = e.clientY - mapDrag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) mapDrag.moved = true;
      if (!mapDrag.moved) return;
      mapCam.x = mapDrag.ox + dx;
      mapCam.y = mapDrag.oy + dy;
      clampCam();
      applyMapCam();
    });
    const endDrag = (e) => {
      if (!mapDrag || mapDrag.id !== e.pointerId) return;
      lastPan = mapDrag.moved;
      mapDrag = null;
      stage.classList.remove("panning");
      if (lastPan) e.preventDefault();
    };
    stage.addEventListener("pointerup", (e) => {
      const dragged = mapDrag && mapDrag.id === e.pointerId && mapDrag.moved;
      endDrag(e);
      if (dragged || lastPan) return;
      if (siteView) return;
      if (e.target.closest(".map-tools") || e.target.closest(".site-overlay")) return;
      const city = cityAtClient(e.clientX, e.clientY);
      if (city) enterSite(city.id);
    });
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const next = mapCam.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
      zoomAt(cx, cy, next);
    }, { passive: false });
    $("btn-zoom-in")?.addEventListener("click", () => {
      const r = stage.getBoundingClientRect();
      zoomAt(r.width / 2, r.height / 2, mapCam.scale * 1.2);
    });
    $("btn-zoom-out")?.addEventListener("click", () => {
      const r = stage.getBoundingClientRect();
      zoomAt(r.width / 2, r.height / 2, mapCam.scale / 1.2);
    });
    $("btn-exit-site")?.addEventListener("click", exitSite);
    $("btn-exit-site-overlay")?.addEventListener("click", exitSite);
    bindYardFrame();
    bindYardInspect();
    const intel = $("site-overlay-intel");
    if (intel && !intel.dataset.bound) {
      intel.dataset.bound = "1";
      intel.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-threat]");
        if (!chip || !siteView || !state) return;
        answerThreat(state.cities[siteView]);
        renderAll();
      });
    }
  }

  function renderInspector() {
    const meta = CITY_BY_ID[selected];
    const city = state.cities[selected];
    recomputeShare(city);
    $("insp-kicker").textContent = `${meta.state} // BASE`;
    $("insp-name").textContent = meta.name;
    const kind = mapSpriteKind(city, meta);
    $("insp-phase").textContent = inspectorPhase(kind, city);
    const you = city.sites[YOU];
    const triad = $("insp-triad");
    if (triad) {
      const charge = hasCap(you);
      const relax = you.lounge > 0;
      triad.innerHTML =
        `<span class="${charge ? "on" : ""}">CHARGE</span>` +
        `<span class="${relax ? "on" : ""}">RELAX</span>` +
        `<span class="on">DEPART</span>`;
    }
    $("insp-blurb").textContent = inspectorBlurb(city, meta, kind);

    $("insp-compound").innerHTML = compoundMarkup(city, meta);
    $("insp-compound").dataset.kind = kind;

    const mine = jobsFor(selected);
    const qel = $("insp-queue");
    if (!mine.length) {
      qel.innerHTML = "";
    } else {
      qel.innerHTML = mine
        .map((j) => {
          const spec = BUILD[j.type];
          const pct = Math.max(6, Math.round(((spec.months - j.left) / spec.months) * 100));
          const focus = inspectJob === j.type ? " focus" : "";
          const pulse = Date.now() - queuePulse < 900 ? " tick" : "";
          return `<div class="job${focus}" data-job="${j.type}"><span>${spec.name}</span><span>${j.left} MO</span><div class="bar${pulse}"><span style="width:${pct}%"></span></div></div>`;
        })
        .join("");
    }

    const sealed = rivalSite(city);
    const contested = contestedCity(city);
    const rows = [
      ["Demand", meta.demand],
      ["Truck", meta.truck],
      ["Your DC", you.dc],
      ["Your MCS", you.mcs],
      ["BESS", you.bess ? "YES" : "—"],
      ["Lounge", you.lounge ? "YES" : "—"],
      ["Market", you.market ? "YES" : "—"],
      ["Income/mo", money(cityIncome(city, YOU) - cityOpex(city, YOU))],
    ];
    let html = `<div class="insp-grid">${rows.map(([k, v]) => `<div>${k}<br><b>${v}</b></div>`).join("")}</div>`;
    if (sealed || contested || rivalHolders(city).length) {
      html += shareDuelHtml(city);
    }
    if (sealed) {
      html += `<p class="insp-rule">RIVAL SITE · kit stays in the tray. Win this market from yards you already hold.</p>`;
    } else {
      html += `<div class="price-row"><label>Price ${city.price[YOU].toFixed(2)} / kWh <small>[ ]</small></label><input id="price-slider" type="range" min="0.28" max="0.58" step="0.01" value="${city.price[YOU]}"></div>`;
    }
    html += `<div class="factions">`;
    for (const f of factionIds()) {
      if (!hasCap(city.sites[f]) && f !== YOU) continue;
      const name = f === YOU ? "ZAPS" : RIVALS[f].name;
      const sh = Math.round((city.share[f] || 0) * 100);
      html += `<div class="faction-row"><span>${name}</span><span>${sh}% · ${city.sites[f].dc} DC · ${city.sites[f].mcs} MCS · ${city.price[f].toFixed(2)}</span></div>`;
    }
    html += `</div>`;
    $("insp-body").innerHTML = html;
    const slider = $("price-slider");
    if (slider) {
      slider.addEventListener("input", () => {
        if (city._shareBefore == null) city._shareBefore = Math.round((city.share[YOU] || 0) * 100);
        const label = slider.closest(".price-row")?.querySelector("label");
        city.price[YOU] = Number(slider.value);
        recomputeShare(city);
        if (label) {
          label.innerHTML = `Price ${city.price[YOU].toFixed(2)} / kWh <small>[ ]</small>`;
        }
        const duel = $("insp-body").querySelector(".share-duel");
        if (duel) duel.outerHTML = shareDuelHtml(city);
      });
      slider.addEventListener("change", () => {
        const prev = city._shareBefore;
        city._shareBefore = null;
        applyPlayerPrice(city, Number(slider.value), prev);
        renderAll();
      });
    }
  }

  function renderTray() {
    const grid = $("tray-grid");
    grid.innerHTML = "";
    const target = CITY_BY_ID[selected];
    const label = $("tray-label");
    if (label) {
      const city = selected ? state.cities[selected] : null;
      if (city && rivalSite(city)) {
        const rival = strongestRival(city);
        label.innerHTML = `RIVAL<span>${target.name.toUpperCase()}</span><em>${rival ? rival.name : "HELD"}</em>`;
      } else if (city && contestedCity(city)) {
        label.innerHTML = `CONTESTED<span>${target.name.toUpperCase()}</span>`;
      } else {
        label.innerHTML = target
          ? `DEPLOY<span>${target.name.toUpperCase()}</span>`
          : "DEPLOY";
      }
    }
    for (const spec of Object.values(BUILD)) {
      const cost = selected ? deployCost(spec.id, selected) : spec.cost;
      const block = selected ? blockedReason(spec.id, selected) : "PICK A CITY";
      const raisingN = selected ? raisingCount(selected, spec.id) : 0;
      const soon = selected ? jobList(selected, spec.id)[0] : null;
      const btn = document.createElement("button");
      btn.className = [
        "deploy",
        raisingN ? "raising" : "",
        !block && !raisingN ? "live" : "",
        block ? "is-blocked" : "",
        armedKit === spec.id ? "selected" : "",
      ]
        .filter(Boolean)
        .join(" ");
      btn.disabled = Boolean(block);
      btn.dataset.kit = spec.id;
      btn.setAttribute("aria-pressed", armedKit === spec.id ? "true" : "false");
      btn.title = raisingN
        ? `${spec.name} raising ×${raisingN} in ${target.name} · ${soon ? `${soon.left} mo left` : ""}`
        : block
          ? `${spec.name} — ${block}`
          : `Deploy ${spec.name} in ${target.name} · ${money(cost)} · ${spec.months} mo`;
      const short = spec.id === "dc" ? "DC" : spec.name;
      const status = raisingN
        ? `<small class="ready">RAISING${raisingN > 1 ? ` ×${raisingN}` : ""}${soon ? ` · ${soon.left} MO` : ""}</small>`
        : block
          ? `<small class="why">${block}</small>`
          : `<small class="ready">${money(cost)} · ${spec.months} MO</small>`;
      btn.innerHTML = `<img src="${spec.icon}" alt="" draggable="false"><span class="deploy-copy"><b>${short}</b>${status}</span>`;
      btn.addEventListener("mouseenter", () => {
        if (hoverKit !== spec.id) slotOverride = null;
        hoverKit = spec.id;
        renderSiteYard();
      });
      btn.addEventListener("mouseleave", (e) => {
        const next = e.relatedTarget;
        if (next && next.closest && next.closest("#site-yard, #site-overlay")) return;
        if (hoverKit === spec.id) hoverKit = null;
        renderSiteYard();
      });
      btn.addEventListener("click", () => {
        armedKit = spec.id;
        if (!block) enqueue(spec.id, selected);
        else renderTray();
      });
      grid.appendChild(btn);
    }
  }

  function renderHud() {
    const y = Math.floor((state.month - 1) / 12) + 1;
    const m = ((state.month - 1) % 12) + 1;
    const track = winProgress();
    setStat("stat-date", `Y${y} M${String(m).padStart(2, "0")}`);
    setStat("stat-cash", money(state.cash), state.cash < 0);
    setStat("stat-share", `${Math.round(track.share * 100)}%`);
    setStat("stat-cities", `${track.cities}/16`);
    setStat("stat-crews", `${crewsBusy()}/${crewCap()}`, crewsBusy() >= crewCap() || (state.idleMonths || 0) >= 2);
    setStat("stat-net", money(lastNet), lastNet < 0);
    const camp = $("hud-campaign");
    if (camp) {
      const majPct = Math.min(100, Math.round((track.majority / track.needMajority) * 100));
      camp.innerHTML =
        `<div class="camp-bar" role="img" aria-label="Continental share ${Math.round(track.share * 100)} percent">` +
        `<i style="width:${Math.round(track.share * 100)}%"></i></div>` +
        `<div class="camp-goals">` +
        `<span${track.majority >= track.needMajority ? ' class="hot"' : ""}>MAJORITY ${track.majority}/${track.needMajority}</span>` +
        `<span${track.states >= track.needStates ? ' class="hot"' : ""}>STATES ${track.states}/${track.needStates}</span>` +
        `<span${track.mcs >= track.needMcs ? ' class="hot"' : ""}>MCS ${track.mcs}/${track.needMcs}</span>` +
        `<span class="camp-fill">${majPct}%</span>` +
        `</div>`;
    }
    renderDealChrome();
  }

  function renderAll() {
    if (!state) return;
    allShares();
    renderHud();
    renderCorridors();
    renderCities();
    renderInspector();
    renderTray();
    renderTicker();
    applyMapCam();
    renderSiteYard();
    renderOps();
  }

  function hasSave() {
    return Boolean(readSave());
  }

  function applyShowcase() {
    const phx = state.cities.phoenix.sites.zaps;
    phx.dc = 4;
    phx.mcs = 2;
    phx.bess = 1;
    phx.lounge = 1;
    phx.market = 1;
    state.cities.tucson.sites.zaps.dc = 2;
    state.cities.tucson.sites.zaps.lounge = 1;
    state.queue.push({ faction: YOU, city: "tucson", type: "mcs", left: 2, cost: 0 });
    state.cities.flagstaff.sites.zaps.dc = 1;
    state.cities.vegas.sites.zaps.dc = 2;
    state.cities.vegas.sites.voltspan.dc = 2;
    selected = "phoenix";
    lastNet = 18000;
    state.log = [
      { t: 1, msg: "Phoenix HQ compound complete. Pad, four DC, MCS bay, BESS, lounge, market.", kind: "good" },
      { t: 1, msg: "Tucson MCS raising. Flagstaff pad live. Vegas contested with VOLTSPAN.", kind: "deal" },
    ];
  }

  function applyShot(name) {
    const z = (id) => state.cities[id].sites.zaps;
    if (name === "board" || name === "map") {
      selected = "phoenix";
      return null;
    }
    if (name === "pad" || name === "empty") {
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "dc") {
      z("flagstaff").dc = 1;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "dc2") {
      z("flagstaff").dc = 2;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "dc3") {
      z("flagstaff").dc = 3;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "dc4") {
      z("flagstaff").dc = 4;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "mcs") {
      z("flagstaff").dc = 2;
      z("flagstaff").mcs = 1;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "lounge-bess") {
      z("flagstaff").dc = 2;
      z("flagstaff").lounge = 1;
      z("flagstaff").bess = 1;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "mcs-market" || name === "full") {
      z("flagstaff").dc = 4;
      z("flagstaff").lounge = 1;
      z("flagstaff").bess = 1;
      z("flagstaff").mcs = 1;
      z("flagstaff").market = 1;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "start" || name === "phoenix") {
      selected = "phoenix";
      return "phoenix";
    }
    if (name === "dc1") {
      z("flagstaff").dc = 1;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "dc2-raising" || name === "raising-dc" || name === "raising-dc2" || name === "raising-ghosts") {
      state.queue.push(
        { faction: YOU, city: "flagstaff", type: "dc", left: 2, cost: 0 },
        { faction: YOU, city: "flagstaff", type: "dc", left: 1, cost: 0 }
      );
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "raising") {
      state.queue.push(
        { faction: YOU, city: "phoenix", type: "dc", left: 2, cost: 0 },
        { faction: YOU, city: "phoenix", type: "bess", left: 3, cost: 0 },
        { faction: YOU, city: "phoenix", type: "market", left: 1, cost: 0 }
      );
      selected = "phoenix";
      return "phoenix";
    }
    if (name === "ghosts" || name === "raising-mcs" || name === "mcs-ghost") {
      z("flagstaff").dc = 2;
      state.queue.push(
        { faction: YOU, city: "flagstaff", type: "mcs", left: 3, cost: 0 },
        { faction: YOU, city: "flagstaff", type: "bess", left: 4, cost: 0 },
        { faction: YOU, city: "flagstaff", type: "market", left: 2, cost: 0 }
      );
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "rival" || name === "rival-blocked") {
      selected = "la";
      return "la";
    }
    if (name === "contested") {
      z("vegas").dc = 2;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.price.zaps = 0.4;
      state.cities.vegas.price.voltspan = 0.36;
      selected = "vegas";
      return "vegas";
    }
    if (name === "event" || name === "undercut" || name === "choice") {
      z("vegas").dc = 2;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.price.zaps = 0.42;
      state.cities.vegas.price.voltspan = 0.33;
      state.pendingEvent = { type: "undercut", city: "vegas", rival: "voltspan", cut: 0.03 };
      selected = "vegas";
      return "vegas";
    }
    if (name === "hover" || name === "consequence") {
      z("flagstaff").dc = 2;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "fork" || name === "build-order") {
      state.pendingFork = { at: state.month };
      state.forkShown = true;
      state.buildPath = null;
      selected = "phoenix";
      return null;
    }
    if (name === "pop" || name === "complete") {
      z("flagstaff").dc = 2;
      selected = "flagstaff";
      return "flagstaff";
    }
    if (name === "amenity-gap") {
      z("vegas").dc = 2;
      z("vegas").lounge = 0;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.sites.voltspan.lounge = 1;
      state.cities.vegas.price.zaps = 0.38;
      state.cities.vegas.price.voltspan = 0.4;
      selected = "vegas";
      return "vegas";
    }
    if (name === "strain") {
      z("vegas").dc = 2;
      z("vegas").bess = 0;
      z("vegas").lounge = 1;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.sites.voltspan.bess = 1;
      state.cities.vegas.price.zaps = 0.36;
      state.cities.vegas.price.voltspan = 0.38;
      selected = "vegas";
      return "vegas";
    }
    if (name === "objective" || name === "arc") {
      state.month = 7;
      state.buildPath = "corridor";
      state.forkShown = true;
      state.pendingFork = null;
      z("vegas").dc = 2;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.price.zaps = 0.38;
      state.cities.vegas.price.voltspan = 0.44;
      state.objective = {
        id: "hold-vegas",
        kind: "hold",
        title: "HOLD 45% LAS VEGAS",
        detail: "Keep Zaps share at 45% or better for 3 months. Price, lounge, or BESS. Their dirt stays theirs.",
        left: 4,
        total: 5,
        city: "vegas",
        floor: 0.45,
        need: 3,
        streak: 1,
        shown: 54,
      };
      state.pressure = 18;
      selected = "vegas";
      return "vegas";
    }
    if (name === "crew" || name === "posture") {
      state.month = 3;
      state.crewPosture = "respond";
      state.forkShown = true;
      state.pendingFork = null;
      state.objective = {
        id: "expand",
        kind: "expand",
        title: "CLAIM A NEIGHBOR",
        detail: "Land DC or MCS on Flagstaff or Tucson before month 4. Rival pads stay theirs.",
        left: 2,
        total: 3,
      };
      selected = "phoenix";
      return null;
    }
    if (name === "scout" || name === "intel") {
      state.month = 5;
      state.forkShown = true;
      state.pendingFork = null;
      z("vegas").dc = 2;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.price.zaps = 0.4;
      state.cities.vegas.price.voltspan = 0.36;
      state.intel.vegas = { rival: "voltspan", kit: "LOUNGE", price: 0.34, until: 9 };
      state.objective = {
        id: "lounge-vegas",
        kind: "lounge",
        title: "LOUNGE BEFORE VOLTSPAN",
        detail: "Open a lounge in Las Vegas before their amenity sticks. You cannot take their pad.",
        left: 3,
        total: 4,
        city: "vegas",
        rivalLoungeAtStart: false,
      };
      selected = "vegas";
      return "vegas";
    }
    if (name === "skirmish" || name === "war") {
      state.month = 6;
      state.forkShown = true;
      state.pendingFork = null;
      z("vegas").dc = 2;
      z("vegas").lounge = 1;
      state.cities.vegas.sites.voltspan.dc = 2;
      state.cities.vegas.sites.voltspan.lounge = 0;
      state.cities.vegas.price.zaps = 0.37;
      state.cities.vegas.price.voltspan = 0.43;
      state.crewPosture = "respond";
      state.skirmish = { city: "vegas", rival: "voltspan", kind: "price", you: 62, them: 41, left: 2 };
      state.objective = {
        id: "hold-vegas",
        kind: "hold",
        title: "HOLD 45% LAS VEGAS",
        detail: "Keep Zaps share at 45% or better for 3 months. Price, lounge, or BESS. Their dirt stays theirs.",
        left: 3,
        total: 5,
        city: "vegas",
        floor: 0.45,
        need: 3,
        streak: 2,
        shown: 58,
      };
      selected = "vegas";
      return "vegas";
    }
    return null;
  }

  function openBoard() {
    state = freshState();
    selected = "phoenix";
    showScreen("briefing-screen");
  }

  function boot() {
    if (hasSave()) $("btn-continue").classList.remove("hidden");
    $("btn-open-board").addEventListener("click", openBoard);
    $("btn-continue").addEventListener("click", () => {
      loadManual();
    });
    $("btn-enter").addEventListener("click", () => {
      if (!state) state = freshState();
      showBoard();
      bindMapControls();
      bindOps();
      offerBuildFork();
      renderAll();
    });
    $("btn-save").addEventListener("click", saveManual);
    $("btn-load").addEventListener("click", loadManual);
    $("btn-deals").addEventListener("click", openDealSheet);
    $("btn-new").addEventListener("click", () => {
      showModal({
        kicker: "RESET",
        title: "Abandon this campaign?",
        body: "Phoenix will be the only Zaps node again.",
        actions: [
          { label: "RESET", primary: true, run: newGame },
          { label: "CANCEL", run: hideModal },
        ],
      });
    });
    document.querySelectorAll(".speed button").forEach((b) => {
      b.addEventListener("click", () => setSpeed(Number(b.dataset.speed)));
    });
    document.addEventListener("keydown", (e) => {
      const onBoard = state && !$("board-screen").classList.contains("hidden");
      const typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (e.code === "Space" && onBoard) {
        e.preventDefault();
        setSpeed(state.speed ? 0 : 1);
      }
      if (e.key === "1") setSpeed(1);
      if (e.key === "2") setSpeed(2);
      if (e.key === "4") setSpeed(4);
      if (e.key === "Escape") {
        if (siteView) {
          exitSite();
          return;
        }
        hideModal();
        $("deal-sheet").classList.add("hidden");
      }
      if ((e.key === "d" || e.key === "D") && (state?.pendingDeal || state?.pendingEvent)) openDealSheet();
      if (!onBoard || typing || state.over) return;
      const kitKey = { c: "dc", m: "mcs", b: "bess", l: "lounge", k: "market" }[e.key.toLowerCase()];
      if (kitKey && selected) {
        e.preventDefault();
        armedKit = kitKey;
        if (canDeploy(kitKey, selected)) enqueue(kitKey, selected);
        else renderTray();
      }
      if ((e.key === "r" || e.key === "R") && selected) {
        e.preventDefault();
        state.crewPosture = state.crewPosture === "respond" ? "raise" : "respond";
        if (state.crewPosture === "respond") state.idleMonths = 0;
        toast(state.crewPosture === "respond" ? "RESPOND · 1 crew on call. Build cap 2." : "RAISE · all 3 crews can build.", "deal");
        renderAll();
      }
      if ((e.key === "s" || e.key === "S") && selected) {
        e.preventDefault();
        launchScout(selected);
      }
      if ((e.key === "[" || e.key === "]") && selected) {
        const city = state.cities[selected];
        if (!rivalSite(city)) {
          e.preventDefault();
          if (e.key === "[" && threatCall(city)?.action === "price") {
            answerThreat(city);
            renderAll();
            return;
          }
          const step = e.key === "]" ? 0.01 : -0.01;
          applyPlayerPrice(city, city.price[YOU] + step);
          renderAll();
        }
      }
    });

    const params = new URLSearchParams(location.search);
    const shot = params.get("shot");
    if (params.get("showcase") === "1" || shot) {
      state = freshState();
      if (params.get("showcase") === "1") applyShowcase();
      const shotCity = shot ? applyShot(shot) : null;
      const pick = params.get("select");
      if (pick && CITY_BY_ID[pick]) selected = pick;
      showBoard();
      bindMapControls();
      bindOps();
      setSpeed(0);
      renderAll();
      const site = params.get("site") || shotCity;
      if (site && CITY_BY_ID[site]) enterSite(site);
      if (state.pendingEvent || state.pendingDeal || state.pendingFork) openDealSheet();
      if (shot === "hover" || shot === "consequence") {
        hoverKit = "dc";
        renderSiteYard();
      }
      if (shot === "pop" || shot === "complete") {
        pops.push({ city: "flagstaff", type: "dc", slot: 1, until: Date.now() + 86400000 });
        yardFlash = { city: "flagstaff", until: Date.now() + 86400000, hold: true };
        toast("DC CHARGER COMPLETE · Flagstaff", "good");
        renderSiteYard();
      }
    }
  }

  window.__EMPIRE_SMOKE__ = {
    build: "rts-yard-18",
    hitR: CITY_HIT_R,
    goldilocks: 0.76,
    nearestCity,
    cities: CITIES.map((c) => ({ id: c.id, name: c.name, x: c.x, y: c.y })),
    paused: () => !state || state.speed === 0,
    getState: () => state,
    getSite: () => siteView,
    getSelected: () => selected,
    slots: SLOTS,
    grid: { cols: GRID.cols, rows: GRID.rows },
    blockedReason,
    canDeploy,
    rivalSite: (id) => rivalSite(state.cities[id]),
    contestedCity: (id) => contestedCity(state.cities[id]),
    enterSite,
    enqueue,
    applyPlayerPrice: (id, price) => applyPlayerPrice(state.cities[id], price),
    placementRead: (id, type) => placementRead(state.cities[id], type),
    smartSlot: (id) => {
      const plan = dcPlacement(state.cities[id], null);
      return smartDcSlot(plan.used, state.cities[id]);
    },
    threat: (id) => threatCall(state.cities[id]),
    undercutCallOpen: (id) => undercutCallOpen(state.cities[id]),
    objective: () => state.objective,
    crewPosture: () => state.crewPosture,
    setPosture: (p) => {
      state.crewPosture = p === "respond" ? "respond" : "raise";
      renderAll();
    },
    scoutBlock: (id) => scoutBlock(id || selected),
    launchScout: (id) => launchScout(id || selected),
    intel: (id) => state.intel[id] || null,
    skirmish: () => state.skirmish,
    crewCap,
    completeToasts: () => {
      toast("DC CHARGER COMPLETE · Flagstaff", "good");
      toast("DC CHARGER COMPLETE · Flagstaff", "good");
      return [...document.querySelectorAll("#toasts .toast")].filter((n) => n.textContent.includes("COMPLETE ·")).length;
    },
    answerThreat: (id) => answerThreat(state.cities[id]),
    setHover: (type) => {
      hoverKit = type;
      if (siteView) renderSiteYard();
    },
    buildPath: () => state.buildPath,
    pickPath: (path) => {
      state.buildPath = path === "amenity" ? "amenity" : "corridor";
      state.forkShown = true;
      state.pendingFork = null;
    },
    rivalPlan: (cityId) => rivalBuildType(state.cities[cityId].sites.voltspan, true),
  };

  boot();
})();
