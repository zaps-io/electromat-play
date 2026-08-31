/* ZAPS EMPIRE — Civ / C&C charging-continent board. Not the night-shift walk. */
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
    const seen = new Set();
    let lines = "";
    for (const c of CITIES) {
      for (const n of c.neighbors) {
        const key = [c.id, n].sort().join("-");
        if (seen.has(key)) continue;
        seen.add(key);
        const b = CITY_BY_ID[n];
        const aLive = hasCap(state.cities[c.id].sites[YOU]);
        const bLive = hasCap(state.cities[n].sites[YOU]);
        const col = aLive && bLive ? PAL.cyan : "#3a3a44";
        lines += `<line x1="${c.x}" y1="${c.y}" x2="${b.x}" y2="${b.y}" stroke="${col}" stroke-width="${aLive && bLive ? 3 : 1.2}" stroke-opacity="0.85"/>`;
      }
    }
    svg.innerHTML = lines;
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

  function lotLabel(x, y, w, h, text, detail) {
    if (!detail) return "";
    return `<text x="${x + w / 2}" y="${y + h - 2.6}" text-anchor="middle" fill="${PAL.amber}" font-size="5.6" font-family="Share Tech Mono, monospace">${text}</text>`;
  }

  function yardSlab(x, y, w, h, live) {
    const fill = live ? PAL.cream : "#2a2a32";
    const stroke = live ? PAL.cyan : "rgba(0,212,245,0.45)";
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.1"/>`;
  }

  function stallMarks(x, y, w, h, n, live) {
    let g = "";
    const gap = w / n;
    for (let i = 0; i < n; i += 1) {
      const sx = x + 1.6 + i * gap;
      g += `<rect x="${sx}" y="${y + 1.4}" width="${gap - 3.2}" height="${h - 2.8}" fill="${live ? PAL.cyan : PAL.charcoal}" fill-opacity="${live ? 0.22 : 0.35}" stroke="${PAL.cyan}" stroke-opacity="${live ? 0.85 : 0.4}" stroke-width="0.7"/>`;
    }
    return g;
  }

  function creamCabinet(x, y, w, h, live) {
    const body = live ? PAL.cream : "#32323a";
    const vent = live ? PAL.charcoal : PAL.steel;
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="${body}" stroke="${PAL.cyan}" stroke-width="1"/>`;
    g += `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.18}" fill="${live ? "#e7e1d6" : "#3a3a44"}"/>`;
    const rows = Math.max(2, Math.floor(h / 7));
    for (let i = 0; i < rows; i += 1) {
      g += `<rect x="${x + 1.6}" y="${y + h * 0.28 + i * 4.2}" width="${w - 3.2}" height="1.5" fill="${vent}" opacity="${live ? 0.85 : 0.35}"/>`;
    }
    if (live) g += `<rect x="${x + w - 3.2}" y="${y + 1.4}" width="1.6" height="1.6" fill="${PAL.cyan}"/>`;
    return g;
  }

  function chargerPost(x, y, live) {
    if (!live) return `<rect x="${x}" y="${y}" width="3.2" height="10" fill="#32323a" stroke="${PAL.cyan}" stroke-opacity="0.4"/>`;
    return (
      `<rect x="${x}" y="${y}" width="3.4" height="11" fill="${PAL.cream}" stroke="${PAL.cyan}"/>` +
      `<rect x="${x + 0.7}" y="${y + 2}" width="2" height="4.2" fill="${PAL.cyan}"/>` +
      `<rect x="${x + 3.2}" y="${y + 6}" width="4.5" height="1.2" fill="${PAL.amber}"/>`
    );
  }

  function dcStall(x, y, w, h, { live, raising, extra, detail }) {
    const building = live || raising;
    let g = yardSlab(x, y, w, h, building);
    g += stallMarks(x + 2, y + h * 0.58, w - 4, h * 0.28, 2, live);
    const cabW = (w - 10) / 2;
    g += creamCabinet(x + 3, y + 4, cabW, h * 0.42, live);
    g += creamCabinet(x + 6 + cabW, y + 4, cabW, h * 0.42, live);
    g += chargerPost(x + 5, y + h * 0.48, live);
    g += chargerPost(x + w - 14, y + h * 0.48, live);
    if (raising) {
      g += `<path d="M${x + 5} ${y + h - 8} L${x + w / 2} ${y + 6} L${x + w - 5} ${y + h - 8}" fill="none" stroke="${PAL.amber}" stroke-width="1.3"/>`;
    }
    if (extra > 0) {
      g += `<text x="${x + w - 5}" y="${y + 8}" text-anchor="end" fill="${PAL.amber}" font-size="6" font-family="Share Tech Mono, monospace">+${extra}</text>`;
    }
    return g + lotLabel(x, y, w, h, raising ? "RAISE DC" : "DC", detail);
  }

  function mcsBay(x, y, w, h, { live, raising, detail }) {
    const building = live || raising;
    let g = yardSlab(x, y, w, h, building);
    g += `<path d="M${x + 4} ${y + h * 0.42} H${x + w - 4} L${x + w - 10} ${y + 5} H${x + 10} Z" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}" stroke-width="1.2"/>`;
    g += `<rect x="${x + 8}" y="${y + 7}" width="${w - 16}" height="3.4" fill="${live ? PAL.cyan : PAL.charcoal}" opacity="${live ? 0.7 : 0.45}"/>`;
    g += `<rect x="${x + 10}" y="${y + h * 0.48}" width="5" height="${h * 0.32}" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}"/>`;
    g += `<rect x="${x + w - 15}" y="${y + h * 0.48}" width="5" height="${h * 0.32}" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}"/>`;
    g += stallMarks(x + 18, y + h * 0.52, w - 36, h * 0.28, 3, live);
    if (raising) g += `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="none" stroke="${PAL.amber}" stroke-dasharray="3 2"/>`;
    return g + lotLabel(x, y, w, h, raising ? "RAISE MCS" : "MCS", detail);
  }

  function bessStack(x, y, w, h, { live, raising, detail }) {
    const building = live || raising;
    let g = yardSlab(x, y, w, h, building);
    const stack = (sx, sy, sw, sh) => creamCabinet(sx, sy, sw, sh, live);
    g += stack(x + 3, y + 10, (w - 8) / 2, h * 0.62);
    g += stack(x + 5 + (w - 8) / 2, y + 6, (w - 8) / 2, h * 0.7);
    if (live) {
      g += `<rect x="${x + 5}" y="${y + 14}" width="${(w - 12) / 2 - 2}" height="2" fill="${PAL.cyan}"/>`;
      g += `<rect x="${x + 7 + (w - 8) / 2}" y="${y + 10}" width="${(w - 12) / 2 - 2}" height="2" fill="${PAL.amber}"/>`;
    }
    if (raising) g += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="none" stroke="${PAL.amber}" stroke-dasharray="3 2"/>`;
    return g + lotLabel(x, y, w, h, raising ? "RAISE BESS" : "BESS", detail);
  }

  function loungeHall(x, y, w, h, { live, raising, detail }) {
    const building = live || raising;
    let g = yardSlab(x, y, w, h, building);
    g += `<path d="M${x + 2} ${y + h * 0.4} H${x + w - 2} L${x + w - 6} ${y + 6} H${x + 6} Z" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}"/>`;
    g += `<rect x="${x + 5}" y="${y + h * 0.4}" width="${w - 10}" height="${h * 0.36}" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}"/>`;
    g += `<rect x="${x + 8}" y="${y + h * 0.46}" width="${w - 16}" height="${h * 0.14}" fill="${live ? PAL.cyan : PAL.charcoal}" opacity="${live ? 0.7 : 0.4}"/>`;
    g += `<rect x="${x + 8}" y="${y + h * 0.66}" width="6" height="5" fill="${PAL.charcoal}"/>`;
    if (live) {
      g += `<rect x="${x + w - 16}" y="${y + h * 0.64}" width="8" height="3.2" fill="${PAL.amber}"/>`;
      g += `<rect x="${x + 16}" y="${y + h * 0.64}" width="6" height="3.2" fill="${PAL.steel}"/>`;
    }
    if (raising) g += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="none" stroke="${PAL.amber}" stroke-dasharray="3 2"/>`;
    return g + lotLabel(x, y, w, h, raising ? "RAISE LNGE" : "LOUNGE", detail);
  }

  function marketHall(x, y, w, h, { live, raising, detail }) {
    const building = live || raising;
    let g = yardSlab(x, y, w, h, building);
    g += `<path d="M${x + 3} ${y + 16} H${x + w - 3} L${x + w - 9} ${y + 5} H${x + 9} Z" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}"/>`;
    g += `<rect x="${x + 6}" y="${y + 16}" width="${w - 12}" height="${h * 0.48}" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}"/>`;
    g += `<rect x="${x + 9}" y="${y + 20}" width="10" height="10" fill="${live ? PAL.charcoal : "#1a1a20"}"/>`;
    g += `<rect x="${x + w - 20}" y="${y + 21}" width="10" height="8" fill="${live ? PAL.cyan : PAL.charcoal}" opacity="${live ? 0.75 : 0.45}"/>`;
    if (live) g += `<rect x="${x + 22}" y="${y + 34}" width="${w - 36}" height="3" fill="${PAL.amber}"/>`;
    if (raising) g += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="none" stroke="${PAL.amber}" stroke-dasharray="3 2"/>`;
    return g + lotLabel(x, y, w, h, raising ? "RAISE MKT" : "MARKET", detail);
  }

  function padDeck(x, y, w, h, { live, detail }) {
    let g = yardSlab(x, y, w, h, live);
    const lanes = detail ? 6 : 4;
    for (let i = 0; i < lanes; i += 1) {
      const mx = x + 5 + i * ((w - 10) / lanes);
      g += `<rect x="${mx}" y="${y + 5}" width="2.4" height="${h - 12}" fill="${PAL.cyan}" opacity="${live ? 0.55 : 0.22}"/>`;
    }
    g += `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="2" fill="${live ? PAL.cream : "#32323a"}" stroke="${PAL.cyan}" stroke-opacity="0.5"/>`;
    return g + lotLabel(x, y, w, h, "PAD", detail);
  }

  function dirtPlot() {
    return `<svg viewBox="0 0 24 24" class="compound-svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="1.5" fill="#2a2a32" stroke="${PAL.cyan}" stroke-opacity="0.5" stroke-dasharray="2 2"/>
      <path d="M8 16 L12 8 L16 16" fill="none" stroke="${PAL.cyan}" stroke-opacity="0.4"/>
    </svg>`;
  }

  function rivalYard(city, detail) {
    const rival = strongestRival(city);
    if (!rival) return dirtPlot();
    const site = city.sites[rival.id];
    const stroke = rival.color;
    const w = 132;
    const h = 96;
    const raising = jobsFor(city.id, rival.id).length > 0;
    let inner = "";
    inner += `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="2" fill="${PAL.charcoal}" stroke="${stroke}" stroke-width="1.6"/>`;
    inner += padDeck(8, 62, 116, 26, { live: hasCap(site), detail });
    inner += dcStall(8, 10, 56, 46, { live: site.dc > 0, raising: raisingType(city.id, "dc", rival.id), extra: Math.max(0, site.dc - 1), detail });
    inner += mcsBay(70, 10, 54, 46, { live: site.mcs > 0, raising: raisingType(city.id, "mcs", rival.id), detail });
    if (detail) {
      inner += `<text x="66" y="90" text-anchor="middle" fill="${PAL.amber}" font-size="6" font-family="Share Tech Mono, monospace">${rival.name} YARD</text>`;
    }
    if (raising) inner += `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="${PAL.amber}" stroke-dasharray="4 3"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" class="compound-svg" aria-hidden="true">${inner}</svg>`;
  }

  function zapsCompound(city, detail) {
    const site = city.sites[YOU];
    const owned = hasCap(site) || jobsFor(city.id).some((j) => j.type === "dc" || j.type === "mcs");
    const w = 240;
    const h = 176;
    const extraDc = Math.max(0, site.dc - 4);
    const siteName = (CITY_BY_ID[city.id]?.name || "SITE").toUpperCase();
    let g = "";
    g += `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="3" fill="#2a2a32" stroke="${PAL.cyan}" stroke-width="1.5"/>`;
    g += `<rect x="6" y="20" width="${w - 12}" height="${h - 26}" fill="${PAL.cream}" opacity="0.08"/>`;
    g += `<rect x="6" y="5" width="${w - 12}" height="13" rx="1.2" fill="${PAL.charcoal}"/>`;
    if (owned) g += `<image href="${BOLT}" x="9" y="6.2" width="10" height="10"/>`;
    if (detail) {
      g += `<text x="24" y="14.2" fill="${PAL.amber}" font-size="6.4" font-family="Share Tech Mono, monospace">${siteName} SITE</text>`;
    }

    const dcLive = [site.dc >= 1, site.dc >= 2, site.dc >= 3, site.dc >= 4];
    const slots = [
      [8, 22, 54, 50],
      [66, 22, 54, 50],
      [124, 22, 54, 50],
      [182, 22, 50, 50],
    ];
    slots.forEach((box, i) => {
      g += dcStall(...box, {
        live: dcLive[i],
        raising: raisingType(city.id, "dc") && !dcLive[i] && (i === site.dc || (site.dc >= 4 && i === 3)),
        extra: i === 3 ? extraDc : 0,
        detail,
      });
    });

    g += mcsBay(8, 76, 108, 46, { live: site.mcs > 0, raising: raisingType(city.id, "mcs"), detail });
    g += bessStack(122, 76, 50, 46, { live: site.bess > 0, raising: raisingType(city.id, "bess"), detail });
    g += loungeHall(178, 76, 54, 46, { live: site.lounge > 0, raising: raisingType(city.id, "lounge"), detail });
    g += marketHall(8, 126, 74, 42, { live: site.market > 0, raising: raisingType(city.id, "market"), detail });
    g += padDeck(88, 126, 144, 42, { live: owned, detail });

    const rival = strongestRival(city);
    if (rival && hasCap(city.sites[rival.id])) {
      g += `<rect x="${w - 30}" y="${h - 16}" width="22" height="10" rx="1" fill="${PAL.charcoal}" stroke="${rival.color}"/>`;
      if (detail) g += `<text x="${w - 19}" y="${h - 8.4}" text-anchor="middle" fill="${PAL.amber}" font-size="5" font-family="Share Tech Mono, monospace">HST</text>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" class="compound-svg" aria-hidden="true">${g}</svg>`;
  }

  function compoundMarkup(city, detail) {
    const you = hasCap(city.sites[YOU]) || jobsFor(city.id).some((j) => j.faction === YOU && (j.type === "dc" || j.type === "mcs"));
    if (you) return zapsCompound(city, detail);
    if (activeRivals().some((r) => hasCap(city.sites[r.id]))) return rivalYard(city, detail);
    return dirtPlot();
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
      const compound = document.createElement("div");
      compound.className = "compound";
      compound.innerHTML = compoundMarkup(city, true);
      const label = document.createElement("span");
      label.className = "city-label";
      label.textContent = meta.name.toUpperCase();
      btn.append(compound);
      if (youSite.dc || youSite.mcs) {
        const kit = document.createElement("span");
        kit.className = "city-kit";
        const bits = [];
        if (youSite.dc) bits.push(`${youSite.dc} DC`);
        if (youSite.mcs) bits.push(`${youSite.mcs} MCS`);
        kit.textContent = bits.join(" · ");
        btn.append(kit);
      }
      if (raising) {
        const raise = document.createElement("span");
        raise.className = "city-raise";
        raise.textContent = "RAISING";
        btn.append(raise);
      }
      btn.append(label);
      layer.appendChild(btn);
    }
  }

  function applyMapZoom() {
    const frame = $("map-frame");
    if (!frame || !selected) return;
    const meta = CITY_BY_ID[selected];
    frame.style.transformOrigin = `${(meta.x / 1200) * 100}% ${(meta.y / 800) * 100}%`;
    frame.classList.add("zoomed");
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
