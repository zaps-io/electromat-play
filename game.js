/* ZAPS EMPIRE — Civ / C&C charging-continent board. Not the night-shift walk. */
/* empire-build: branded-compounds-1 */
(() => {
  const SAVE_KEY = "zaps-empire-v2";
  const SAVE_LEGACY = "zaps-empire-v1";
  const YOU = "zaps";
  const TICK = { 0: 0, 1: 1800, 2: 900, 4: 450 };
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

  const BUILD = {
    dc: {
      id: "dc",
      name: "DC CHARGER",
      cost: 180000,
      months: 2,
      icon: "assets/station.svg",
      unique: false,
    },
    mcs: {
      id: "mcs",
      name: "MCS",
      cost: 420000,
      months: 3,
      icon: "assets/station.svg",
      unique: false,
    },
    bess: {
      id: "bess",
      name: "BESS",
      cost: 650000,
      months: 4,
      icon: "assets/bess.svg",
      unique: true,
    },
    lounge: {
      id: "lounge",
      name: "LOUNGE",
      cost: 280000,
      months: 3,
      icon: "assets/lounge.svg",
      unique: true,
    },
    market: {
      id: "market",
      name: "MARKET",
      cost: 220000,
      months: 2,
      icon: "assets/market.svg",
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
    { id: "sacramento", name: "Sacramento", state: "CA", x: 130, y: 230, demand: 90, truck: 25, land: 1.15, neighbors: ["reno", "la"] },
    { id: "reno", name: "Reno", state: "NV", x: 230, y: 175, demand: 55, truck: 30, land: 0.9, neighbors: ["sacramento", "vegas", "slc"] },
    { id: "slc", name: "Salt Lake City", state: "UT", x: 400, y: 130, demand: 95, truck: 40, land: 1.05, neighbors: ["reno", "stgeorge", "grandjunction", "denver"] },
    { id: "grandjunction", name: "Grand Junction", state: "CO", x: 520, y: 210, demand: 40, truck: 35, land: 0.82, neighbors: ["denver", "flagstaff", "santafe", "slc"] },
    { id: "denver", name: "Denver", state: "CO", x: 640, y: 155, demand: 120, truck: 35, land: 1.2, neighbors: ["santafe", "grandjunction", "slc"] },
    { id: "la", name: "Los Angeles", state: "CA", x: 155, y: 430, demand: 210, truck: 55, land: 1.7, neighbors: ["vegas", "sandiego", "sacramento"] },
    { id: "vegas", name: "Las Vegas", state: "NV", x: 300, y: 330, demand: 140, truck: 50, land: 1.35, neighbors: ["phoenix", "la", "stgeorge", "reno"] },
    { id: "stgeorge", name: "St. George", state: "UT", x: 360, y: 285, demand: 45, truck: 28, land: 0.85, neighbors: ["vegas", "flagstaff", "slc"] },
    { id: "flagstaff", name: "Flagstaff", state: "AZ", x: 400, y: 370, demand: 50, truck: 22, land: 0.88, neighbors: ["phoenix", "stgeorge", "grandjunction"] },
    { id: "phoenix", name: "Phoenix", state: "AZ", x: 420, y: 455, demand: 150, truck: 45, land: 1.0, neighbors: ["tucson", "flagstaff", "vegas", "albuquerque"] },
    { id: "sandiego", name: "San Diego", state: "CA", x: 175, y: 535, demand: 130, truck: 30, land: 1.4, neighbors: ["la", "tucson"] },
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
      speed: 1,
      log: ["Phoenix HQ online. Two DC stalls live. The dirt still outnumbers you."],
      queue: [],
      cities,
      unlocked: ["voltspan", "gridhawk", "arcway"],
      debtStreak: 0,
      nextDeal: 48 + Math.floor(Math.random() * 20),
      pendingDeal: null,
      warFired: false,
      over: null,
    };
  }

  function hasCap(site) {
    return site.dc + site.mcs > 0;
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

  function recomputeShare(city) {
    const attr = {};
    let sum = 0;
    for (const f of factionIds()) {
      const site = city.sites[f];
      if (!hasCap(site)) {
        attr[f] = 0;
        continue;
      }
      const price = Math.max(0.26, city.price[f] || 0.42);
      const war = city.war > 0 ? 1.12 : 1;
      const a =
        capacity(site) *
        amenity(site) *
        Math.pow(0.48 / price, 1.4) *
        war;
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
    const el = document.createElement("div");
    el.className = `toast ${kind}`;
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => el.remove(), 4200);
    while (host.children.length > 1) host.firstElementChild.remove();
  }

  function crewsBusy() {
    return state.queue.filter((q) => q.left > 0 && q.faction === YOU).length;
  }

  function jobsFor(cityId, faction = YOU) {
    return state.queue.filter((q) => q.city === cityId && q.faction === faction && q.left > 0);
  }

  function raisingType(cityId, type, faction = YOU) {
    return state.queue.some((q) => q.city === cityId && q.type === type && q.faction === faction && q.left > 0);
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
    if (state.cash < deployCost(type, cityId)) return "NEED CASH";
    if (crewsBusy() >= MAX_CREWS) return "CREWS FULL";
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

  function enqueue(type, cityId, faction = YOU) {
    const spec = BUILD[type];
    const cost = faction === YOU ? deployCost(type, cityId) : Math.round(spec.cost * 0.9);
    if (faction === YOU) {
      if (!canDeploy(type, cityId)) return false;
      state.cash -= cost;
      if (state.landOption) state.landOption = 0;
    }
    state.queue.push({
      faction,
      city: cityId,
      type,
      left: spec.months,
      cost,
    });
    if (faction === YOU) {
      log(`${spec.name} queued in ${CITY_BY_ID[cityId].name} · ${spec.months} mo · ${money(cost)}`);
    }
    renderAll();
    return true;
  }

  function finishBuild(job) {
    const city = state.cities[job.city];
    const site = city.sites[job.faction];
    if (BUILD[job.type].unique) site[job.type] = 1;
    else site[job.type] += 1;
    const who = job.faction === YOU ? "Zaps" : RIVALS[job.faction].name;
    log(`${who} brings ${BUILD[job.type].name} online in ${CITY_BY_ID[job.city].name}.`, job.faction === YOU ? "good" : "bad");
  }

  function activeRivals() {
    return Object.values(RIVALS).filter((r) => state.month >= r.unlock);
  }

  function rivalCash(rid) {
    return 900000 + state.month * 120000 + presenceCount(rid) * 180000;
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
        (hasCap(city.sites[YOU]) ? 30 : 0);
      return score(b, cb) - score(a, ca);
    });

    const targetId = targets[0];
    if (!targetId) return;
    const site = state.cities[targetId].sites[rid];
    const budget = rivalCash(rid);
    let type = "dc";
    if (hasCap(site) && site.dc >= 2 && site.mcs < 2) type = "mcs";
    else if (hasCap(site) && !site.lounge && site.dc >= 2) type = "lounge";
    else if (hasCap(site) && !site.bess && state.month > 10) type = "bess";
    else if (hasCap(site) && !site.market && site.lounge) type = "market";
    if (budget > BUILD[type].cost && state.queue.filter((q) => q.faction === rid).length < 2) {
      enqueue(type, targetId, rid);
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
    const hot = Boolean(state.pendingDeal);
    badge.classList.toggle("hidden", !hot);
    badge.classList.toggle("hot", hot);
    if (!hot) $("deal-sheet").classList.add("hidden");
  }

  function openDealSheet() {
    const sheet = $("deal-sheet");
    if (!state?.pendingDeal) {
      sheet.classList.add("hidden");
      return;
    }
    const deal = DEALS[state.pendingDeal];
    if (!deal) {
      state.pendingDeal = null;
      sheet.classList.add("hidden");
      return;
    }
    sheet.innerHTML = "";
    const k = document.createElement("p");
    k.className = "kicker";
    k.textContent = "INCOMING DEAL";
    const h = document.createElement("h3");
    h.textContent = deal.title;
    const p = document.createElement("p");
    p.textContent = deal.body;
    const row = document.createElement("div");
    row.className = "modal-actions";
    const yes = document.createElement("button");
    yes.className = "btn-primary";
    yes.textContent = deal.yes;
    yes.addEventListener("click", () => {
      deal.accept();
      state.pendingDeal = null;
      sheet.classList.add("hidden");
      renderAll();
    });
    const no = document.createElement("button");
    no.className = "btn-ghost";
    no.textContent = deal.no;
    no.addEventListener("click", () => {
      log(`Passed: ${deal.title}.`);
      state.pendingDeal = null;
      sheet.classList.add("hidden");
      renderAll();
    });
    row.append(yes, no);
    sheet.append(k, h, p, row);
    sheet.classList.remove("hidden");
  }

  function checkEnd() {
    const citiesHeld = presenceCount(YOU);
    const statesHeld = new Set(
      CITIES.filter((c) => hasCap(state.cities[c.id].sites[YOU])).map((c) => c.state)
    ).size;
    const mcsCities = CITIES.filter((c) => state.cities[c.id].sites[YOU].mcs > 0).length;
    const majority = CITIES.filter((c) => (state.cities[c.id].share[YOU] || 0) >= 0.5).length;

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

    for (const job of state.queue) job.left -= 1;
    const done = state.queue.filter((j) => j.left <= 0);
    state.queue = state.queue.filter((j) => j.left > 0);
    for (const job of done) finishBuild(job);

    for (const r of activeRivals()) rivalAct(r.id);

    state.month += 1;
    if (state.month % 2 === 0) {
      log(`P&L ${money(lastNet)} · cash ${money(state.cash)}`);
    }
    maybeDeal();
    checkEnd();
    renderAll();
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
    if (state.warFired == null) state.warFired = false;
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
    renderAll();
  }

  function newGame() {
    hideModal();
    $("deal-sheet").classList.add("hidden");
    state = freshState();
    selected = "phoenix";
    lastNet = 0;
    setSpeed(1);
    showBoard();
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
      b.classList.toggle("active", Number(b.dataset.speed) === v);
    });
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.toggle("hidden", el.id !== id));
  }

  function showBoard() {
    showScreen("board-screen");
    setSpeed(state.speed || 1);
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
    const you = hasCap(city.sites[YOU]);
    const them = activeRivals().some((r) => hasCap(city.sites[r.id]));
    if (you && them) return "contested zaps";
    if (you) return "zaps";
    if (them) return "rival hostile";
    return "dirt";
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
      g += `<rect x="${px}" y="${py}" width="11" height="8.4" fill="${live ? "#1a2830" : "#16161c"}"/>`;
      if (live) {
        g += `<rect x="${px + 1}" y="${py + 1}" width="9" height="3.2" fill="#2a4048" opacity="0.9"/>`;
        g += `<rect x="${px + 1}" y="${py + 4.6}" width="9" height="2.8" fill="${PAL.cream}" opacity="0.35"/>`;
      }
    }
    const roof = isoBox(x - 3, y - bodyH, 42, 24, 2.8, live, null, live ? SURF.cream : SURF.charcoal);
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
      g += isoBox(x + w * t, y - 1, 2.2, 2, colH, live, null, post).g;
    });
    const roof = isoBox(x - 3, y - lift, w + 6, d, 2.6, live, null, live ? SURF.cream : SURF.charcoal);
    g += roof.g;
    const { p } = roof;
    if (live) {
      g += `<path d="M${p.flT.join(" ")} L${p.frT.join(" ")} L${p.brT.join(" ")} L${p.blT.join(" ")} Z" fill="none" stroke="${PAL.cyan}" stroke-width="1.45"/>`;
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

  function compoundMarkup(city) {
    return wrapCompoundSvg(compoundParts(city));
  }

  function mapSpriteKind(city, meta) {
    const you = hasCap(city.sites[YOU]) || jobsFor(city.id).some((j) => j.faction === YOU && (j.type === "dc" || j.type === "mcs"));
    const rival = strongestRival(city);
    const them = !you && rival && hasCap(city.sites[rival.id]);
    const raising = jobsFor(city.id).length > 0;
    if (you) {
      const site = city.sites[YOU];
      if (meta.id === "phoenix" || (site.lounge > 0 && site.dc >= 2)) return "hq";
      if (meta.id === "vegas" || site.dc <= 1) return "vegas";
      return "tucson";
    }
    if (them) return "voltspan";
    if (raising) return "dirt";
    return "flag";
  }

  function iconMarkup(city, selectedHere, meta) {
    const kind = mapSpriteKind(city, meta);
    const raising = jobsFor(meta.id).length > 0;
    let g = "";
    if (selectedHere) {
      g += `<ellipse cx="64" cy="80" rx="40" ry="11" fill="none" stroke="${PAL.cyan}" stroke-width="1.8"/>`;
    }
    if (kind === "flag") {
      g += surveyFlag(28, 72, 1.35);
    } else if (kind === "dirt") {
      g += dirtPad(22, 74, 58, 32);
      if (raising) g += scaffold(40, 60, 18, 10, 10);
    } else if (kind === "vegas") {
      g += dirtPad(20, 76, 62, 34);
      g += concretePad(34, 68, 22, 12);
      g += slimZeus(40, 66, 0.72, false);
      g += canopy(32, 68, 26, 14, 13, true, [0.18, 0.82]);
    } else if (kind === "tucson") {
      g += dirtPad(14, 78, 78, 36);
      g += concretePad(26, 70, 36, 14);
      g += slimZeus(30, 68, 0.68, false);
      g += slimZeus(44, 68, 0.68, false);
      g += charcoalCabinet(28, 52, 0.55, true);
      g += charcoalCabinet(48, 50, 0.55, true);
    } else if (kind === "hq") {
      g += dirtPad(8, 80, 96, 40);
      g += concretePad(16, 70, 52, 16);
      g += concretePad(70, 66, 28, 16);
      for (let i = 0; i < 4; i += 1) g += slimZeus(18 + i * 11, 68, 0.58, false);
      g += canopy(14, 70, 54, 16, 14, true);
      g += charcoalCabinet(20, 50, 0.52, false);
      g += loungePavilion(72, 62, true, false);
    } else {
      g += voltspanYard(18, 72, 1.05);
    }
    return `<svg viewBox="0 0 128 88" class="map-icon-svg" overflow="visible" aria-hidden="true">${g}</svg>`;
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
      btn.className = `city-node ${occ} ${selected === meta.id ? "selected" : ""} ${raising ? "raising" : ""} tier-${tier}`;
      btn.style.left = `${(meta.x / 1200) * 100}%`;
      btn.style.top = `${(meta.y / 800) * 100}%`;
      btn.title = `${meta.name}, ${meta.state}`;
      btn.addEventListener("click", () => {
        selected = meta.id;
        renderAll();
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
        kit.textContent = bits.join(" · ");
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

  function applyMapZoom() {
    const frame = $("map-frame");
    if (!frame) return;
    frame.classList.remove("zoomed", "focus-city");
    frame.style.transform = "";
    frame.style.transformOrigin = "";
  }

  function renderInspector() {
    const meta = CITY_BY_ID[selected];
    const city = state.cities[selected];
    recomputeShare(city);
    $("insp-kicker").textContent = `${meta.state} // BASE`;
    $("insp-name").textContent = meta.name;
    $("insp-phase").textContent = campaignPhase();
    const you = city.sites[YOU];
    $("insp-blurb").textContent = you.dc || you.mcs
      ? `Your price ${city.price[YOU].toFixed(2)}/kWh. Share ${Math.round((city.share[YOU] || 0) * 100)}%. Grid ${you.bess ? "STABLE" : "STRAINED"}. Crews ${crewsBusy()}/${MAX_CREWS}.`
      : `Unbuilt dirt. Land multiplier ${meta.land.toFixed(2)}. Neighbors: ${meta.neighbors.map((id) => CITY_BY_ID[id].name).join(", ")}. Drop a pad to raise a compound.`;

    $("insp-compound").innerHTML = compoundMarkup(city, true);

    const mine = jobsFor(selected);
    const qel = $("insp-queue");
    if (!mine.length) {
      qel.innerHTML = "";
    } else {
      qel.innerHTML = mine
        .map((j) => {
          const spec = BUILD[j.type];
          const pct = Math.max(6, Math.round(((spec.months - j.left) / spec.months) * 100));
          return `<div class="job"><span>${spec.name}</span><span>${j.left} MO</span><div class="bar"><span style="width:${pct}%"></span></div></div>`;
        })
        .join("");
    }

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
    html += `<div class="price-row"><label>Price ${city.price[YOU].toFixed(2)} / kWh</label><input id="price-slider" type="range" min="0.28" max="0.58" step="0.01" value="${city.price[YOU]}"></div>`;
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
      slider.addEventListener("change", () => {
        city.price[YOU] = Number(slider.value);
        city.war = Math.max(city.war, 2);
        renderAll();
      });
    }
  }

  function renderTray() {
    const grid = $("tray-grid");
    grid.innerHTML = "";
    for (const spec of Object.values(BUILD)) {
      const cost = selected ? deployCost(spec.id, selected) : spec.cost;
      const block = blockedReason(spec.id, selected);
      const btn = document.createElement("button");
      btn.className = "deploy";
      btn.disabled = Boolean(block);
      const status = block
        ? `<small class="blocked">${money(cost)} · ${block}</small>`
        : `<small class="ready">${money(cost)} · ${spec.months} mo · READY</small>`;
      btn.innerHTML = `<img src="${spec.icon}" alt=""><span>${spec.name}${status}</span>`;
      btn.addEventListener("click", () => enqueue(spec.id, selected));
      grid.appendChild(btn);
    }
  }

  function renderHud() {
    const y = Math.floor((state.month - 1) / 12) + 1;
    const m = ((state.month - 1) % 12) + 1;
    $("stat-date").textContent = `Y${y} M${String(m).padStart(2, "0")}`;
    $("stat-cash").textContent = money(state.cash);
    $("stat-cash").style.color = state.cash < 0 ? PAL.amber : "";
    $("stat-share").textContent = `${Math.round(continentalShare() * 100)}%`;
    $("stat-cities").textContent = `${presenceCount(YOU)}/16`;
    $("stat-crews").textContent = `${crewsBusy()}/${MAX_CREWS}`;
    $("stat-net").textContent = money(lastNet);
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
    applyMapZoom();
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
      if (e.code === "Space" && state && !$("board-screen").classList.contains("hidden")) {
        e.preventDefault();
        setSpeed(state.speed ? 0 : 1);
      }
      if (e.key === "1") setSpeed(1);
      if (e.key === "2") setSpeed(2);
      if (e.key === "4") setSpeed(4);
      if (e.key === "Escape") {
        hideModal();
        $("deal-sheet").classList.add("hidden");
      }
      if ((e.key === "d" || e.key === "D") && state?.pendingDeal) openDealSheet();
    });

    const params = new URLSearchParams(location.search);
    if (params.get("showcase") === "1") {
      state = freshState();
      applyShowcase();
      const pick = params.get("select");
      if (pick && CITY_BY_ID[pick]) selected = pick;
      showBoard();
      setSpeed(0);
      renderAll();
    }
  }

  boot();
})();
