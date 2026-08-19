/* ZAPS EMPIRE — Civ / C&C charging-continent board. Not the night-shift walk. */
(() => {
  const SAVE_KEY = "zaps-empire-v1";
  const YOU = "zaps";
  const TICK = { 0: 0, 1: 1800, 2: 900, 4: 450 };
  const MAX_CREWS = 3;

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
    rednode: { id: "rednode", name: "REDNODE", color: "#c45c6a", home: "vegas", unlock: 18, priceBias: 0.94 },
    ampfield: { id: "ampfield", name: "AMPFIELD", color: "#7ec8a3", home: "albuquerque", unlock: 24, priceBias: 1.0 },
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
    const meta = CITY_BY_ID[id];
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
      nextDeal: 5,
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

  function log(msg, kind = "") {
    state.log.unshift({ t: state.month, msg, kind });
    state.log = state.log.slice(0, 40);
    renderTicker();
  }

  function crewsBusy() {
    return state.queue.filter((q) => q.left > 0 && q.faction === YOU).length;
  }

  function deployCost(type, cityId) {
    const meta = CITY_BY_ID[cityId];
    let n = Math.round(BUILD[type].cost * meta.land);
    if (state.landOption) n = Math.round(n * 0.7);
    return n;
  }

  function canDeploy(type, cityId) {
    if (state.over) return false;
    const city = state.cities[cityId];
    const spec = BUILD[type];
    const site = city.sites[YOU];
    if (state.cash < deployCost(type, cityId)) return false;
    if (crewsBusy() >= MAX_CREWS) return false;
    if (spec.unique && (site[type] > 0 || state.queue.some((q) => q.city === cityId && q.type === type && q.faction === YOU))) {
      return false;
    }
    if ((type === "mcs" || type === "lounge" || type === "market" || type === "bess") && !hasCap(site) && !state.queue.some((q) => q.city === cityId && q.faction === YOU && (q.type === "dc" || q.type === "mcs"))) {
      return false;
    }
    return true;
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
    // Soft budget so AI keeps building without a full ledger.
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
    const city = state.cities[targetId];
    if (city.share[YOU] > 0.35 && city.price[rid] > 0.32) {
      city.price[rid] = Math.max(0.28, +(city.price[rid] - 0.03).toFixed(2));
      city.war = 3;
      log(`${rival.name} opens a price war in ${CITY_BY_ID[targetId].name}.`, "deal");
    }
  }

  function maybeDeal() {
    if (state.month < state.nextDeal) return;
    state.nextDeal = state.month + 4 + Math.floor(Math.random() * 4);
    const deck = [
      {
        title: "WESTBOUND FLEET",
        body: "A corridor hauler wants MCS in two cities. Sign and take a 12-month truck offtake — or keep the stalls public.",
        yes: "SIGN OFTAKE",
        no: "KEEP PUBLIC",
        accept() {
          state.cash += 420000;
          log("Fleet offtake signed. +$420K now, truck demand lifts where you hold MCS.", "deal");
          for (const c of CITIES) if (state.cities[c.id].sites[YOU].mcs) state.cities[c.id].truckBoost += 8;
        },
      },
      {
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
          } else {
            state.cash += 280000;
            log("Rebate arrives as cash. +$280K.", "good");
          }
        },
      },
      {
        title: "LAND OPTION",
        body: "A dirt parcel next to an empty node is cheap this month. Exercise and the next deploy anywhere is 30% off.",
        yes: "EXERCISE",
        no: "LET IT GO",
        accept() {
          state.landOption = 1;
          log("Land option live. Next deploy is 30% off.", "deal");
        },
      },
      {
        title: "PRICE CEILING",
        body: "A city desk wants a consumer ceiling. Drop Phoenix price to $0.34/kWh for 6 months in exchange for loyalty.",
        yes: "CUT PHOENIX",
        no: "HOLD RATE",
        accept() {
          state.cities.phoenix.price[YOU] = 0.34;
          state.cities.phoenix.war = 0;
          log("Phoenix ceiling accepted. Share should thicken.", "deal");
        },
      },
      {
        title: "CREW SURGE",
        body: "A civil crew can burn a month of calendar if you float their overtime.",
        yes: "PAY OVERTIME ($180K)",
        no: "KEEP THE QUEUE",
        accept() {
          if (state.cash < 180000) {
            log("Overtime declined — treasury too thin.", "bad");
            return;
          }
          state.cash -= 180000;
          for (const q of state.queue) if (q.faction === YOU) q.left = Math.max(1, q.left - 1);
          log("Crew surge. Your jobs pull one month forward.", "good");
        },
      },
    ];
    const deal = deck[Math.floor(Math.random() * deck.length)];
    showModal({
      kicker: "INCOMING DEAL",
      title: deal.title,
      body: deal.body,
      actions: [
        {
          label: deal.yes,
          primary: true,
          run() {
            deal.accept();
            hideModal();
            renderAll();
          },
        },
        { label: deal.no, run: hideModal },
      ],
    });
    log(`Deal on the table: ${deal.title}.`, "deal");
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
        title: "ZAPS EMPIRE HOLDS THE BOARD",
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

  function loadManual() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      log("No save found.", "bad");
      return;
    }
    state = JSON.parse(raw);
    selected = hasCap(state.cities.phoenix.sites[YOU]) ? "phoenix" : CITIES.find((c) => hasCap(state.cities[c.id].sites[YOU]))?.id || "phoenix";
    log("Campaign loaded.", "good");
    showBoard();
    renderAll();
  }

  function newGame() {
    hideModal();
    state = freshState();
    selected = "phoenix";
    lastNet = 0;
    setSpeed(1);
    showBoard();
    renderAll();
  }

  function setSpeed(v) {
    state.speed = v;
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
        const col = aLive && bLive ? "#E63225" : "#3a3a44";
        lines += `<line x1="${c.x}" y1="${c.y}" x2="${b.x}" y2="${b.y}" stroke="${col}" stroke-width="${aLive && bLive ? 3 : 1.2}" stroke-opacity="0.85"/>`;
      }
    }
    svg.innerHTML = lines;
  }

  function occupantClass(city) {
    const you = hasCap(city.sites[YOU]);
    const them = activeRivals().some((r) => hasCap(city.sites[r.id]));
    if (you && them) return "contested";
    if (you) return "zaps";
    if (them) return "rival";
    return "";
  }

  function renderCities() {
    const layer = $("city-layer");
    layer.innerHTML = "";
    for (const meta of CITIES) {
      const city = state.cities[meta.id];
      recomputeShare(city);
      const btn = document.createElement("button");
      btn.className = `city ${occupantClass(city)} ${selected === meta.id ? "selected" : ""}`;
      btn.style.left = `${(meta.x / 1200) * 100}%`;
      btn.style.top = `${(meta.y / 800) * 100}%`;
      btn.title = `${meta.name}, ${meta.state}`;
      btn.addEventListener("click", () => {
        selected = meta.id;
        renderAll();
      });
      const pips = document.createElement("div");
      pips.className = "city-pips";
      const site = city.sites[YOU];
      if (site.dc) pips.innerHTML += `<img src="assets/station.svg" alt="">`;
      if (site.bess) pips.innerHTML += `<img src="assets/bess.svg" alt="">`;
      if (site.lounge) pips.innerHTML += `<img src="assets/lounge.svg" alt="">`;
      if (activeRivals().some((r) => hasCap(city.sites[r.id]))) {
        pips.innerHTML += `<img src="assets/rival.svg" alt="">`;
      }
      const label = document.createElement("span");
      label.className = "city-label";
      label.textContent = meta.name.toUpperCase();
      btn.append(pips, label);
      layer.appendChild(btn);
    }
  }

  function renderInspector() {
    const meta = CITY_BY_ID[selected];
    const city = state.cities[selected];
    recomputeShare(city);
    $("insp-kicker").textContent = `${meta.state} // NODE`;
    $("insp-name").textContent = meta.name;
    const you = city.sites[YOU];
    $("insp-blurb").textContent = you.dc || you.mcs
      ? `Your price ${city.price[YOU].toFixed(2)}/kWh. Share ${Math.round((city.share[YOU] || 0) * 100)}%. Queue ${crewsBusy()}/${MAX_CREWS} crews.`
      : `Unbuilt dirt. Land multiplier ${meta.land.toFixed(2)}. Neighbors: ${meta.neighbors.map((id) => CITY_BY_ID[id].name).join(", ")}.`;

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
      const actual = state.landOption ? Math.round(cost * 0.7) : cost;
      const btn = document.createElement("button");
      btn.className = "deploy";
      btn.disabled = !canDeploy(spec.id, selected);
      btn.innerHTML = `<img src="${spec.icon}" alt=""><span>${spec.name}<small>${money(actual)} · ${spec.months} mo</small></span>`;
      btn.addEventListener("click", () => enqueue(spec.id, selected));
      grid.appendChild(btn);
    }
  }

  function renderHud() {
    const y = Math.floor((state.month - 1) / 12) + 1;
    const m = ((state.month - 1) % 12) + 1;
    $("stat-date").textContent = `Y${y} M${String(m).padStart(2, "0")}`;
    $("stat-cash").textContent = money(state.cash);
    $("stat-cash").style.color = state.cash < 0 ? "#E63225" : "";
    $("stat-share").textContent = `${Math.round(continentalShare() * 100)}%`;
    $("stat-cities").textContent = `${presenceCount(YOU)}/16`;
    $("stat-net").textContent = money(lastNet);
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
  }

  function hasSave() {
    return Boolean(localStorage.getItem(SAVE_KEY));
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
      if (e.key === "Escape") hideModal();
    });
  }

  boot();
})();
