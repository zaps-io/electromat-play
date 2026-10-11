/* ZAPS EMPIRE — AoE loop on the Western Interconnect.
   Spec: docs/design/empire-aoe-design.md (section 9 build order). */
(() => {
  const RED = "#E63225";
  const CHAR = "#1E1E24";
  const AMBER = "#E89A2E";
  const CYAN = "#00D4F5";
  const CREAM = "#F5F0E8";
  const VIOLET = "#7A4CDB";

  const TW = 64;
  const TH = 32;
  const COLS = 132;
  const ROWS = 88;
  const ORIGIN_X = -ROWS * (TW / 2) - 24;
  const ORIGIN_Y = -78;
  const MAP_W = Math.ceil((COLS + ROWS) * (TW / 2) + 48);
  const MAP_H = Math.ceil((COLS + ROWS) * (TH / 2) + 100);

  const DESERT = 0, SCRUB = 1, VALLEY = 2, MOUNTAIN = 3, WATER = 4, GRAVEL = 5, ROAD = 6;
  const FACTION = { zaps: 1, voltspan: 2, gridhawk: 3, arcway: 4, rednode: 5, ampfield: 6 };
  const FACTION_NAME = ["", "Zaps", "Voltspan", "Gridhawk", "Arcway", "Rednode", "Ampfield"];
  const FACTION_COLOR = ["", RED, AMBER, CYAN, VIOLET, "#C45CFF", "#F5F0E8"];

  const AGES = [
    { name: "PILOT AGE", numeral: "I" },
    { name: "FLEET AGE", numeral: "II", time: 60, cost: { capital: 120000, steel: 40, permits: 20 } },
    { name: "MEGAWATT AGE", numeral: "III", time: 90, cost: { capital: 300000, steel: 100, permits: 60 } },
  ];

  const BUILD = {
    hq: { name: "Site HQ", w: 3, h: 3, age: 0, time: 16, cost: { capital: 80000, permits: 30 } },
    dc: { name: "DC Charger", w: 1, h: 1, age: 0, time: 8, cost: { capital: 20000, copper: 10 }, mw: 0.3 },
    warehouse: { name: "Warehouse", w: 2, h: 2, age: 0, time: 8, cost: { capital: 15000 } },
    market: { name: "Market", w: 2, h: 1, age: 0, time: 8, cost: { capital: 30000 } },
    bess: { name: "BESS", w: 2, h: 1, age: 1, time: 12, cost: { capital: 40000, steel: 20 }, mwAdd: 2 },
    lounge: { name: "Lounge", w: 2, h: 2, age: 1, time: 10, cost: { capital: 25000, copper: 10 } },
    mcs: { name: "MCS Bay", w: 2, h: 3, age: 2, time: 14, cost: { capital: 60000, steel: 30, permits: 10 }, mw: 1 },
    sales: { name: "Sales Depot", w: 2, h: 2, age: 1, time: 12, cost: { capital: 45000, steel: 20 } },
    substation: { name: "Substation", w: 2, h: 2, age: 1, time: 14, cost: { capital: 70000, steel: 40, permits: 10 }, mwAdd: 5 },
    permit: { name: "Permit Office", w: 1, h: 2, age: 1, time: 10, cost: { capital: 35000, permits: 10 } },
    crew: { name: "Crew", train: "crew", cost: { capital: 15000 } },
    scout: { name: "Scout", train: "scout", cost: { capital: 12000 } },
  };
  const CARD_PAGES = [
    ["hq", "dc", "warehouse", "market", "bess", "lounge", "mcs", "sales", "substation"],
    ["permit", "crew", "scout", "hq", "dc", "warehouse", "market", "bess", "lounge"],
  ];
  const HOTKEYS = ["q", "w", "e", "a", "s", "d", "z", "x", "c"];
  const ORDERS = {
    2: ["dc", "dc", "dc", "dc", "warehouse", "bess", "lounge", "expand"],
    3: ["warehouse", "warehouse", "substation", "expand"],
    4: ["dc", "sales", "protest", "expand"],
  };

  const VEHICLES = {
    hatch: { name: "Compact EV hatch", kWh: 20, wt: [35, 25, 15], w: 0.42, h: 0.55, body: 8, cab: 10, color: "#7DCAA0", roof: "#E7FFF4" },
    sedan: { name: "Sedan", kWh: 40, wt: [50, 35, 25], w: 0.46, h: 0.78, body: 8, cab: 11, color: "#F5F0E8", roof: "#C5CED6" },
    suv: { name: "SUV", kWh: 60, wt: [15, 20, 20], w: 0.52, h: 0.74, body: 13, cab: 16, color: "#2A2E33", roof: "#00D4F5" },
    pickup: { name: "Pickup", kWh: 80, wt: [0, 10, 10], w: 0.5, h: 0.9, body: 9, cab: 13, bed: true, color: "#E89A2E", roof: "#8A5A16" },
    van: { name: "Delivery van", kWh: 70, wt: [0, 8, 10], w: 0.5, h: 0.86, body: 15, cab: 16, color: "#E63225", roof: "#F5F0E8" },
    box: { name: "Box truck", kWh: 150, wt: [0, 2, 8], w: 0.52, h: 0.62, body: 14, cab: 15, trailer: { w: 0.55, h: 0.7, body: 18, color: "#E7E2D8" }, color: "#E63225", roof: "#1E1E24" },
    semi: { name: "Class 8 semi", kWh: 600, wt: [0, 0, 10], w: 0.52, h: 0.5, body: 12, cab: 16, trailer: { w: 0.56, h: 1.25, body: 20, color: "#F4F1EA" }, color: "#3E4650", roof: "#1E1E24" },
    bus: { name: "Electric school bus", kWh: 300, wt: [0, 0, 2], w: 0.5, h: 1.25, body: 16, cab: 17, windows: 5, color: "#F5C518", roof: "#1E1E24" },
  };

  const ICONS = {
    hq: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#E63225" d="M4 26V12l12-8 12 8v14H4z"/><path fill="#F5F0E8" d="M15 4h2v10h-2z"/></svg>`,
    dc: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#E63225" d="M4 12h24v4H4z"/><path fill="#F5F0E8" d="M8 16h3v10H8zm13 0h3v10h-3z"/></svg>`,
    warehouse: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#C4A574" d="M4 12h24v14H4z"/><path fill="#6B5340" d="M12 18h8v8h-8z"/></svg>`,
    market: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#E63225" d="M3 12h4l2 8H5zm6 0h4l2 8h-4zm6 0h4l2 8h-4zm6 0h4l2 8h-4z"/><path fill="#F5F0E8" d="M6 20h20v6H6z"/></svg>`,
    bess: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#F5F0E8" d="M3 12h26v10H3z"/><path fill="#00D4F5" d="M7 15h4v4H7zm7 0h4v4h-4zm7 0h4v4h-4z"/></svg>`,
    lounge: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#E89A2E" d="M2 14h28v4H2z"/><path fill="#F5F0E8" d="M6 18h20v8H6z"/><path fill="#E89A2E" d="M8 20h6v4H8zm10 0h6v4h-6z"/></svg>`,
    mcs: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#1A1C20" d="M4 8h4v16H4zm20 0h4v16h-4zM4 8h24v4H4z"/><path fill="#F5C518" d="M15 12h2v10h-2z"/></svg>`,
    sales: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#C8C2B8" d="M4 12h24v14H4z"/><path fill="#E63225" d="M4 18h24v3H4z"/><path fill="#F5F0E8" d="M18 20h8v6h-8z"/></svg>`,
    substation: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#8d9298" d="M16 4l8 20H8z"/><path fill="#F5F0E8" d="M8 16h5v3H8zm11 0h5v3h-5z"/></svg>`,
    permit: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#F3EDE2" d="M8 10h16v16H8z"/><path fill="#1E1E24" d="M15 6h2v8h-2z"/><path fill="#E63225" d="M17 6h8v4h-8z"/></svg>`,
    crew: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#E63225" d="M4 16h16v8H4z"/><path fill="#F5C518" d="M18 12h6v4h-6z"/></svg>`,
    scout: `<svg viewBox="0 0 32 32" width="48" height="48"><path fill="#F5F0E8" d="M6 16h16v8H6z"/><circle cx="22" cy="12" r="4" fill="none" stroke="#00D4F5" stroke-width="2"/></svg>`,
  };

  const $ = (id) => document.getElementById(id);
  const canvas = $("world");
  const ctx = canvas.getContext("2d");
  const mini = $("minimap");
  const mctx = mini.getContext("2d");

  const biome = new Uint8Array(COLS * ROWS);
  const owner = new Uint8Array(COLS * ROWS);
  const vis = new Uint8Array(COLS * ROWS);
  const road = new Uint8Array(COLS * ROWS);
  const plotOf = new Int16Array(COLS * ROWS);
  plotOf.fill(-1);

  const cities = [];
  const units = [];
  const buildings = [];
  const vehicles = [];
  const nodes = [];
  const convoys = [];
  const dust = [];
  const hawks = [];
  const camera = { x: 0, y: 0, zoom: 0.9 };
  const keys = {};
  const pointer = { x: 0, y: 0, inside: false };
  const purse = {
    2: { capital: 90000, copper: 50, steel: 30, permits: 16 },
    3: { capital: 90000, copper: 30, steel: 50, permits: 20 },
    4: { capital: 60000, copper: 24, steel: 24, permits: 12 },
  };
  const plan = { 2: 0, 3: 0, 4: 0 };
  let seq = 1;
  let landCanvas = null;
  let fogCanvas = null;
  let landDirty = true;
  let fogDirty = true;
  let miniDirty = true;
  let drag = null;
  let pan = null;
  let visionAcc = 0;
  let aiAcc = 1.5;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let links = [];

  const state = {
    age: 0,
    aging: null,
    res: { capital: 90000, permits: 24, copper: 60, steel: 36 },
    tariff: 1,
    rivalTariff: 1,
    paid: 0,
    monthPaid: 0,
    floatCount: 0,
    liveFloats: 0,
    time: 0,
    hour: 10.25,
    speed: 1,
    build: null,
    cardPage: 0,
    frozen: false,
    holdBanner: false,
    marquee: null,
    fps: 60,
    shot: null,
    notes: [],
    pings: [],
    nextUndercut: 28,
    nextMonth: 60,
    wasBrown: false,
    idleIx: -1,
    portrait: false,
    visKey: "",
  };
  const selection = new Set();

  function hash(c, r) {
    let n = Math.imul(c | 0, 374761393) + Math.imul(r | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function idx(c, r) { return r * COLS + c; }
  function inside(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS; }
  function iso(col, row) { return { x: (col - row) * (TW / 2), y: (col + row) * (TH / 2) }; }
  function viewW() { return canvas.clientWidth || window.innerWidth; }
  function viewH() { return canvas.clientHeight || window.innerHeight; }
  function worldToScreen(col, row) {
    const p = iso(col, row);
    return { x: p.x * camera.zoom + camera.x, y: p.y * camera.zoom + camera.y };
  }
  function screenToWorld(sx, sy) {
    const x = (sx - camera.x) / camera.zoom;
    const y = (sy - camera.y) / camera.zoom;
    return { col: y / TH + x / TW, row: y / TH - x / TW };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function money(n) { return "$" + Math.floor(n).toLocaleString("en-US"); }
  function isNight() { return state.hour >= 19 || state.hour < 6; }

  function canAfford(cost, bank) {
    const bag = bank || state.res;
    if (!cost) return true;
    return Object.entries(cost).every(([k, v]) => (bag[k] || 0) >= v);
  }
  function payCost(cost, bank) {
    const bag = bank || state.res;
    if (!cost) return;
    for (const [k, v] of Object.entries(cost)) bag[k] -= v;
  }
  function crewsOf(faction) { return units.filter((u) => u.faction === faction && u.kind === "crew" && !u.garrison); }
  function idleCrews() { return crewsOf(FACTION.zaps).filter((u) => !u.job); }
  function popUsed() { return units.filter((u) => u.faction === FACTION.zaps && (u.kind === "crew" || u.kind === "scout" || u.kind === "van")).length; }
  function popCap() { return 10 + state.age * 4; }

  function gridCap() {
    let cap = 2;
    for (const b of buildings) {
      if (!b.done || b.faction !== FACTION.zaps) continue;
      if (b.kind === "bess") cap += 2;
      if (b.kind === "substation") cap += 5;
    }
    return cap;
  }
  function gridUsed() {
    let used = 0;
    for (const b of buildings) {
      if (!b.done || b.faction !== FACTION.zaps) continue;
      if (b.protested > state.time) continue;
      if (b.kind === "dc") used += 0.3;
      if (b.kind === "mcs") used += 1;
    }
    return Math.round(used * 10) / 10;
  }
  function isBrownout() { return gridUsed() > gridCap() + 0.001; }

  function projectCities() {
    const raw = [
      ["sacramento", "Sacramento", -121.49, 38.58, 90],
      ["reno", "Reno", -119.81, 39.53, 70],
      ["slc", "Salt Lake City", -111.89, 40.76, 110],
      ["grandjunction", "Grand Junction", -108.55, 39.06, 40],
      ["denver", "Denver", -104.99, 39.74, 140],
      ["la", "Los Angeles", -118.24, 34.05, 220],
      ["vegas", "Las Vegas", -115.14, 36.17, 160],
      ["stgeorge", "St. George", -113.58, 37.1, 35],
      ["flagstaff", "Flagstaff", -111.65, 35.2, 55],
      ["phoenix", "Phoenix", -112.07, 33.45, 150],
      ["sandiego", "San Diego", -117.16, 32.72, 130],
      ["tucson", "Tucson", -110.97, 32.22, 80],
      ["santafe", "Santa Fe", -105.94, 35.69, 45],
      ["albuquerque", "Albuquerque", -106.65, 35.08, 90],
      ["elpaso", "El Paso", -106.49, 31.76, 75],
      ["dallas", "Dallas", -96.8, 32.78, 180],
    ].map(([id, name, lon, lat, demand]) => ({
      id, name, demand, loyalty: 1, owner: 0, contest: 0, attacker: 0,
      col: ((lon + 122.8) / (122.8 - 95.4)) * (COLS - 18) + 9,
      row: ((41.8 - lat) / (41.8 - 30.4)) * (ROWS - 18) + 9,
    }));
    for (let n = 0; n < 12; n++) {
      for (let i = 0; i < raw.length; i++) {
        for (let j = i + 1; j < raw.length; j++) {
          const dx = raw[j].col - raw[i].col;
          const dy = raw[j].row - raw[i].row;
          const cheb = Math.max(Math.abs(dx), Math.abs(dy));
          if (cheb < 9) {
            const push = (9 - cheb) / 2 + 0.4;
            const len = Math.hypot(dx, dy) || 1;
            raw[j].col += (dx / len) * push;
            raw[j].row += (dy / len) * push;
            raw[i].col -= (dx / len) * push;
            raw[i].row -= (dy / len) * push;
          }
        }
      }
    }
    for (const c of raw) {
      c.col = Math.round(clamp(c.col, 6, COLS - 7));
      c.row = Math.round(clamp(c.row, 6, ROWS - 7));
      cities.push(c);
    }
  }

  function lineTiles(a, b, fn) {
    let c = a.col | 0;
    let r = a.row | 0;
    const bc = b.col | 0;
    const br = b.row | 0;
    const dc = Math.abs(bc - c);
    const dr = Math.abs(br - r);
    const sc = c < bc ? 1 : -1;
    const sr = r < br ? 1 : -1;
    let err = dc - dr;
    for (;;) {
      fn(c, r);
      if (c === bc && r === br) break;
      const e2 = 2 * err;
      if (e2 > -dr) { err -= dr; c += sc; }
      if (e2 < dc) { err += dc; r += sr; }
    }
  }

  function paintRiver() {
    const slc = cities.find((c) => c.id === "slc");
    const stg = cities.find((c) => c.id === "stgeorge");
    const ph = cities.find((c) => c.id === "phoenix");
    const pts = [slc, stg, { col: ph.col - 8, row: ph.row + 2 }, { col: ph.col - 6, row: ROWS - 4 }];
    for (let i = 0; i < pts.length - 1; i++) {
      lineTiles(pts[i], pts[i + 1], (c, r) => {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 0; dx++) {
            if (!inside(c + dx, r + dy)) continue;
            if (plotOf[idx(c + dx, r + dy)] >= 0) continue;
            biome[idx(c + dx, r + dy)] = WATER;
          }
        }
      });
    }
  }

  function buildTerrain() {
    projectCities();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const n = hash(c, r);
        const elev = Math.sin(c * 0.18) * 0.45 + Math.sin(r * 0.16) + (n - 0.55);
        let b = SCRUB;
        if (c < 32 && r > 26) b = VALLEY;
        if (r > 46 && c > 34 && c < 104) b = DESERT;
        if (elev > 0.95 && r < 42) b = MOUNTAIN;
        if (r < 8 && elev > 0.4) b = MOUNTAIN;
        biome[idx(c, r)] = b;
      }
    }
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      for (let r = city.row - 3; r <= city.row + 3; r++) {
        for (let c = city.col - 3; c <= city.col + 3; c++) {
          if (!inside(c, r)) continue;
          plotOf[idx(c, r)] = i;
          if (biome[idx(c, r)] !== WATER) biome[idx(c, r)] = GRAVEL;
        }
      }
    }
    paintRiver();
    const byId = Object.fromEntries(cities.map((c) => [c.id, c]));
    links = [
      ["sacramento", "reno"], ["reno", "slc"], ["slc", "grandjunction"], ["grandjunction", "denver"],
      ["slc", "stgeorge"], ["stgeorge", "vegas"], ["vegas", "la"], ["la", "sandiego"],
      ["vegas", "flagstaff"], ["flagstaff", "phoenix"], ["phoenix", "tucson"], ["phoenix", "la"],
      ["flagstaff", "albuquerque"], ["albuquerque", "santafe"], ["santafe", "denver"],
      ["albuquerque", "elpaso"], ["tucson", "elpaso"], ["elpaso", "dallas"],
    ];
    for (const [a, b] of links) {
      lineTiles(byId[a], byId[b], (c, r) => {
        if (!inside(c, r)) return;
        road[idx(c, r)] = 2;
        biome[idx(c, r)] = ROAD;
      });
    }
  }

  function setPlotOwner(city, factionId) {
    city.owner = factionId;
    const ci = cities.indexOf(city);
    for (let r = city.row - 3; r <= city.row + 3; r++) {
      for (let c = city.col - 3; c <= city.col + 3; c++) {
        if (inside(c, r) && plotOf[idx(c, r)] === ci) owner[idx(c, r)] = factionId;
      }
    }
    landDirty = true;
    miniDirty = true;
  }

  function phx() { return cities.find((c) => c.id === "phoenix"); }
  function cityOf(ent) {
    const c = ent.col | 0;
    const r = ent.row | 0;
    if (!inside(c, r)) return null;
    const p = plotOf[idx(c, r)];
    return p >= 0 ? cities[p] : null;
  }
  function sameCity(a, b) {
    const ca = cityOf(a);
    const cb = cityOf(b);
    return ca && cb && ca.id === cb.id;
  }

  function spawnNode(kind, col, row) { nodes.push({ id: "n" + (++seq), kind, col, row, stock: 80 }); }

  function nearestTile(col, row, pred) {
    for (let rad = 1; rad < 10; rad++) {
      for (let r = row - rad; r <= row + rad; r++) {
        for (let c = col - rad; c <= col + rad; c++) {
          if (!inside(c, r)) continue;
          if (Math.max(Math.abs(c - col), Math.abs(r - row)) !== rad) continue;
          if (pred(c, r)) return { c, r };
        }
      }
    }
    return null;
  }

  function makeBuilding(kind, col, row, faction, progress) {
    const spec = BUILD[kind];
    return {
      id: "b" + (++seq), kind, col, row, w: spec.w, h: spec.h, faction,
      progress, done: progress >= 1, time: spec.time, traffic: 0.6, queue: [], protested: 0,
    };
  }
  function makeUnit(kind, faction, col, row) {
    return { id: "u" + (++seq), kind, faction, col, row, job: null, facing: 1, hp: 1, garrison: null };
  }
  function buildingAt(c, r) {
    return buildings.find((b) => c >= b.col && r >= b.row && c < b.col + b.w && r < b.row + b.h);
  }
  function countKind(kind, faction) {
    return buildings.filter((b) => b.kind === kind && b.faction === faction).length;
  }

  function fits(kind, col, row, faction) {
    const spec = BUILD[kind];
    if (!spec || spec.train) return false;
    if (faction === FACTION.zaps && state.age < spec.age) return false;
    if (kind === "substation") {
      const n = countKind("substation", faction);
      const max = faction === FACTION.zaps && state.age < 2 ? 1 : 2;
      if (n >= max) return false;
    }
    let plot = -1;
    for (let dy = 0; dy < spec.h; dy++) {
      for (let dx = 0; dx < spec.w; dx++) {
        const c = col + dx;
        const r = row + dy;
        if (!inside(c, r)) return false;
        const b = biome[idx(c, r)];
        if (b === WATER || b === MOUNTAIN) return false;
        const p = plotOf[idx(c, r)];
        if (p < 0 || cities[p].owner !== faction) return false;
        if (plot === -1) plot = p;
        else if (plot !== p) return false;
        if (buildingAt(c, r)) return false;
      }
    }
    if (kind === "hq") {
      if (buildings.some((b) => b.kind === "hq" && cityOf(b) && cityOf(b).id === cities[plot].id)) return false;
      if (faction === FACTION.zaps && state.age < 1 && cities[plot].id !== "phoenix") return false;
    }
    return true;
  }

  function findSlot(city, kind) {
    const spec = BUILD[kind];
    for (let r = city.row - 3; r <= city.row + 3 - spec.h + 1; r++) {
      for (let c = city.col - 3; c <= city.col + 3 - spec.w + 1; c++) {
        if (fits(kind, c, r, city.owner)) return { c, r };
      }
    }
    return null;
  }

  function seedOwners(play) {
    const own = (id, faction) => setPlotOwner(cities.find((c) => c.id === id), FACTION[faction]);
    own("phoenix", "zaps");
    if (!play) {
      own("tucson", "zaps");
      own("flagstaff", "zaps");
    }
    own("vegas", "voltspan");
    own("la", "voltspan");
    own("denver", "gridhawk");
    own("slc", "gridhawk");
    own("dallas", "arcway");
    own("elpaso", "arcway");
  }

  function seedStart(play) {
    seedOwners(play);
    for (const city of cities) {
      if (!city.owner) continue;
      buildings.push(makeBuilding("hq", city.col - 3, city.row - 3, city.owner, 1));
      units.push(makeUnit("crew", city.owner, city.col + 0.2, city.row + 1.5));
      if (city.owner !== FACTION.zaps) units.push(makeUnit("crew", city.owner, city.col + 1.1, city.row + 1.9));
    }
    const home = phx();
    if (play) {
      units.push(makeUnit("crew", FACTION.zaps, home.col + 0.9, home.row + 1.7));
      units.push(makeUnit("crew", FACTION.zaps, home.col + 1.7, home.row + 1.4));
    }
    for (const city of cities) {
      const hall = nearestTile(city.col, city.row + 4, (c, r) => plotOf[idx(c, r)] < 0 && biome[idx(c, r)] !== WATER && biome[idx(c, r)] !== MOUNTAIN);
      const yard = nearestTile(city.col + 4, city.row + 1, (c, r) => road[idx(c, r)] === 0 && biome[idx(c, r)] !== WATER && biome[idx(c, r)] !== MOUNTAIN);
      if (hall) spawnNode("hall", hall.c + 0.5, hall.r + 0.5);
      if (yard) spawnNode("yard", yard.c + 0.5, yard.r + 0.5);
    }
    let n = 0;
    const kinds = ["hatch", "sedan", "suv", "hatch", "sedan", "van"];
    for (let r = 4; r < ROWS && n < 6; r += 8) {
      for (let c = 4; c < COLS && n < 6; c += 11) {
        if (!road[idx(c, r)]) continue;
        vehicles.push({
          id: "v" + (++seq), kind: kinds[n], buildingId: null, fare: 0,
          col: c + 0.5, row: r + 0.5, facing: 1,
          path: [{ c: c + 4.5, r: r + 0.5 }, { c: c + 0.5, r: r + 0.5 }],
          i: 0, phase: "cruise", speed: 1.35,
        });
        n += 1;
      }
    }
    for (let i = 0; i < 8; i++) dust.push({ col: 18 + i * 12, row: 24 + (i % 5) * 11, a: i });
    hawks.push({ col: 36, row: 28, a: 0 }, { col: 78, row: 48, a: 2 });
  }

  function revealDisk(col, row, radius, level) {
    const r0 = Math.max(0, Math.floor(row - radius));
    const r1 = Math.min(ROWS - 1, Math.ceil(row + radius));
    const c0 = Math.max(0, Math.floor(col - radius));
    const c1 = Math.min(COLS - 1, Math.ceil(col + radius));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (Math.hypot(c + 0.5 - col, r + 0.5 - row) > radius) continue;
        const i = idx(c, r);
        if (level > vis[i]) { vis[i] = level; fogDirty = true; }
      }
    }
  }

  function refreshVision() {
    for (let i = 0; i < vis.length; i++) if (vis[i] === 2) vis[i] = 1;
    for (const b of buildings) {
      if (b.faction === FACTION.zaps) revealDisk(b.col + b.w / 2, b.row + b.h / 2, b.kind === "hq" ? 11 : 6.5, 2);
    }
    for (const u of units) {
      if (u.faction === FACTION.zaps && !u.garrison) revealDisk(u.col, u.row, u.kind === "scout" ? 8 : 5.2, 2);
    }
    const home = phx();
    if (home && home.owner === FACTION.zaps) revealDisk(home.col, home.row, 22, 1);
    fogDirty = true;
  }

  function focus(col, row, zoom) {
    camera.zoom = clamp(zoom, 0.32, 1.85);
    const p = iso(col, row);
    camera.x = viewW() / 2 - p.x * camera.zoom;
    camera.y = viewH() / 2 - p.y * camera.zoom;
    clampCamera();
  }
  function clampCamera() {
    const minX = (0 - ROWS) * (TW / 2);
    const maxX = COLS * (TW / 2);
    const minY = 0;
    const maxY = (COLS + ROWS) * (TH / 2);
    const vw = viewW() / camera.zoom;
    const vh = viewH() / camera.zoom;
    if (maxX - minX <= vw) camera.x = viewW() / 2 - ((minX + maxX) / 2) * camera.zoom;
    else camera.x = clamp(camera.x, viewW() - maxX * camera.zoom, -minX * camera.zoom);
    if (maxY - minY <= vh) camera.y = viewH() / 2 - ((minY + maxY) / 2) * camera.zoom;
    else camera.y = clamp(camera.y, viewH() - maxY * camera.zoom, -minY * camera.zoom);
  }

  function moveToward(ent, tc, tr, dt, speed) {
    const dx = tc - ent.col;
    const dy = tr - ent.row;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.08) { ent.col = tc; ent.row = tr; return true; }
    const step = Math.min(dist, speed * dt);
    ent.col += (dx / dist) * step;
    ent.row += (dy / dist) * step;
    ent.facing = dx - dy >= 0 ? 1 : -1;
    return false;
  }
  function inPlot(ent, city) { return Math.abs(ent.col - city.col) <= 3.4 && Math.abs(ent.row - city.row) <= 3.4; }
  function selectedCrews() { return units.filter((u) => selection.has(u.id) && u.faction === FACTION.zaps && u.kind === "crew" && !u.garrison); }

  function placeBuilding(kind, col, row) {
    const spec = BUILD[kind];
    if (!spec || spec.train) return false;
    if (!fits(kind, col, row, FACTION.zaps)) return false;
    if (!canAfford(spec.cost)) return false;
    const crews = selectedCrews();
    if (!crews.length) return false;
    payCost(spec.cost);
    const b = makeBuilding(kind, col, row, FACTION.zaps, 0);
    buildings.push(b);
    crews.forEach((crew, i) => {
      crew.job = { type: "build", id: b.id, c: col + spec.w + 0.35, r: row + spec.h * 0.45 + i * 0.4 };
    });
    state.build = null;
    return true;
  }

  function train(kind) {
    const spec = BUILD[kind];
    if (!canAfford(spec.cost) || popUsed() >= popCap()) return false;
    const hq = buildings.find((b) => b.kind === "hq" && b.faction === FACTION.zaps && b.done);
    if (!hq) return false;
    if ((kind === "scout" || kind === "van") && !buildings.some((b) => b.kind === "sales" && b.faction === FACTION.zaps && b.done)) return false;
    payCost(spec.cost);
    hq.queue.push({ kind, left: kind === "crew" ? 20 : 12 });
    return true;
  }

  function route(fromC, fromR, toC, toR) {
    const start = { c: fromC | 0, r: fromR | 0 };
    const goal = { c: toC | 0, r: toR | 0 };
    if (!inside(start.c, start.r) || !inside(goal.c, goal.r)) return [{ c: toC, r: toR }];
    const key = (c, r) => c + r * COLS;
    const q = [start];
    const prev = new Map([[key(start.c, start.r), null]]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    let guard = 0;
    let found = false;
    while (q.length && guard++ < 2500) {
      const n = q.shift();
      if (n.c === goal.c && n.r === goal.r) { found = true; break; }
      for (const [dc, dr] of dirs) {
        const c = n.c + dc;
        const r = n.r + dr;
        if (!inside(c, r) || prev.has(key(c, r))) continue;
        const near = Math.abs(c - goal.c) + Math.abs(r - goal.r) < 4;
        const plot = plotOf[idx(c, r)];
        const ok = road[idx(c, r)] || near || (plot >= 0 && plot === plotOf[idx(goal.c, goal.r)]);
        if (!ok || (biome[idx(c, r)] === WATER && !road[idx(c, r)])) continue;
        prev.set(key(c, r), n);
        q.push({ c, r });
      }
    }
    if (!found) return [{ c: toC, r: toR }];
    const path = [];
    let n = goal;
    while (n) {
      path.push({ c: n.c + 0.5, r: n.r + 0.5 });
      n = prev.get(key(n.c, n.r));
    }
    path.reverse();
    return path;
  }

  function rollVehicle(building) {
    const age = clamp(state.age, 0, 2);
    const bag = [];
    for (const [kind, spec] of Object.entries(VEHICLES)) {
      const heavy = kind === "semi" || kind === "bus";
      if (heavy && building.kind !== "mcs") continue;
      if (!heavy && kind !== "box" && building.kind === "mcs") continue;
      const w = spec.wt[age];
      for (let i = 0; i < w; i++) bag.push(kind);
    }
    if (!bag.length) return null;
    return bag[(Math.random() * bag.length) | 0];
  }

  function stallUse(v, building) {
    if (!building || v.buildingId !== building.id) return 0;
    if (v.phase === "leave" || v.phase === "balk" || v.phase === "cruise") return 0;
    if (v.phase === "queue") return 0;
    return v.kind === "box" && building.kind === "dc" ? 2 : 1;
  }
  function stallCap(building) { return building.kind === "mcs" ? 1 : 2; }

  function spawnTraffic(building) {
    if (vehicles.length > 42) return;
    const kind = rollVehicle(building);
    if (!kind) return;
    if (kind === "semi" && building.kind !== "mcs") return;
    if (kind === "bus" && building.kind !== "mcs") return;
    const occ = kind === "box" && building.kind === "dc" ? 2 : 1;
    const cap = stallCap(building);
    let used = 0;
    let queued = 0;
    for (const v of vehicles) {
      if (v.buildingId !== building.id) continue;
      if (v.phase === "queue") queued += 1;
      else used += stallUse(v, building);
    }
    if (queued >= cap * 3 && used + occ > cap) return;
    const queueing = used + occ > cap;
    const stallC = building.col + building.w * 0.45;
    const stallR = building.row + building.h + 0.2;
    let from = null;
    for (let rad = 6; rad < 16 && !from; rad++) {
      from = nearestTile(building.col, building.row, (c, r) => road[idx(c, r)] && Math.abs(c - building.col) + Math.abs(r - building.row) > rad - 2);
    }
    const destC = queueing ? stallC : stallC;
    const destR = queueing ? stallR + 1.2 + queued * 0.65 : stallR;
    const path = from ? route(from.c, from.r, destC, destR) : [{ c: destC, r: destR }];
    vehicles.push({
      id: "v" + (++seq), kind, buildingId: building.id, fare: 0,
      col: path[0].c, row: path[0].r, facing: 1,
      path, i: 0, phase: "drive", queueing, wait: 0, cable: 0, charge: 0,
      speed: kind === "semi" || kind === "bus" ? 1.4 : 2.05,
    });
  }

  function spawnFloat(col, row, text, hold) {
    const p = worldToScreen(col, row);
    const el = document.createElement("div");
    el.className = hold ? "float hold" : "float";
    el.textContent = text;
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
    document.body.appendChild(el);
    if (hold) return el;
    if (state.liveFloats >= 8) { el.remove(); return null; }
    state.liveFloats += 1;
    const cap = $("res-capital");
    if (cap) {
      const r = cap.getBoundingClientRect();
      const dx = r.left + r.width / 2 - p.x;
      const dy = r.top + r.height / 2 - p.y;
      el.animate(
        [{ transform: "translate(0px, 0px)", opacity: 1 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.1 }],
        { duration: 900, easing: "ease-in", fill: "forwards" }
      );
    }
    setTimeout(() => { el.remove(); state.liveFloats = Math.max(0, state.liveFloats - 1); }, 950);
    return el;
  }

  function fareOf(v, building) {
    const spec = VEHICLES[v.kind];
    if (!spec) return 0;
    const lounge = buildings.some((b) => b.kind === "lounge" && b.done && b.faction === building.faction && sameCity(b, building));
    let n = spec.kWh * 8 * state.tariff;
    if (lounge) n *= 1.5;
    if (isBrownout()) n *= 0.5;
    return Math.max(1, Math.round(n));
  }

  function collectFare(v, building) {
    const n = fareOf(v, building);
    v.fare = n;
    if (building.faction !== FACTION.zaps) return;
    state.res.capital += n;
    state.paid += n;
    state.monthPaid += n;
    state.floatCount += 1;
    if (!state.shot) spawnFloat(v.col, v.row, `+$${n}`);
  }

  function notify(text, kind, col, row) {
    state.notes.unshift({ text, kind, col, row });
    if (state.notes.length > 5) state.notes.length = 5;
    if (kind === "attack") {
      state.pings.push({ col: col ?? 0, row: row ?? 0, life: 1, hold: !!state.shot });
      if (!state.shot) horn();
    }
    renderNotes();
  }
  function horn() {
    try {
      const ac = state.audio || (state.audio = new AudioContext());
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sawtooth";
      o.frequency.value = 196;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ac.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.28);
      o.stop(ac.currentTime + 0.3);
    } catch (err) { /* horn is optional when audio is blocked */ }
  }

  function ageGate() {
    if (state.aging) return "Researching";
    if (state.age >= 2) return "Final age";
    const next = AGES[state.age + 1];
    if (state.age === 0) {
      const dc = buildings.filter((b) => b.kind === "dc" && b.faction === FACTION.zaps && b.done).length;
      const wh = buildings.some((b) => b.kind === "warehouse" && b.faction === FACTION.zaps && b.done);
      if (dc < 4) return `Need ${dc}/4 DC`;
      if (!wh) return "Need Warehouse";
      if (!canAfford(next.cost)) return "Need resources";
      return "";
    }
    const sub = buildings.some((b) => b.kind === "substation" && b.faction === FACTION.zaps && b.done);
    const lounge = buildings.some((b) => b.kind === "lounge" && b.faction === FACTION.zaps && b.done);
    const owned = cities.filter((c) => c.owner === FACTION.zaps).length;
    if (!sub) return "Need Substation";
    if (!lounge) return "Need Lounge";
    if (owned < 2) return "Need 2 cities";
    if (!canAfford(next.cost)) return "Need resources";
    return "";
  }

  function finishAge() {
    state.age = state.aging.to;
    state.aging = null;
    landDirty = true;
    showBanner(AGES[state.age].name);
    if (state.age === 1) spawnLate("rednode", "reno");
    if (state.age === 2) spawnLate("ampfield", "albuquerque");
  }
  function spawnLate(name, prefer) {
    const id = FACTION[name];
    const city = cities.find((c) => c.id === prefer && !c.owner) || cities.find((c) => !c.owner);
    if (!city) return;
    setPlotOwner(city, id);
    buildings.push(makeBuilding("hq", city.col - 3, city.row - 3, id, 1));
    units.push(makeUnit("crew", id, city.col + 0.4, city.row + 1.6));
    notify(`${FACTION_NAME[id]} claims ${city.name}`, "attack", city.col, city.row);
  }

  function simulate(dt) {
    state.time += dt;
    state.hour = (state.hour + dt / 8) % 24;
    for (const f of [2, 3, 4]) purse[f].capital += dt * 700;
    const zapsCities = cities.filter((c) => c.owner === FACTION.zaps).length;
    const permitOffices = buildings.filter((b) => b.kind === "permit" && b.faction === FACTION.zaps && b.done).length;
    const warehouses = buildings.filter((b) => b.kind === "warehouse" && b.faction === FACTION.zaps && b.done).length;
    state.res.permits += dt * (0.05 * zapsCities + 0.12 * permitOffices);
    state.res.copper += dt * (0.08 + 0.22 * warehouses);
    state.res.steel += dt * (0.045 + 0.14 * warehouses);

    if (state.aging) {
      state.aging.left -= dt;
      if (state.aging.left <= 0) finishAge();
    }
    for (const b of buildings) {
      if (b.queue && b.queue.length) {
        b.queue[0].left -= dt;
        if (b.queue[0].left <= 0) {
          const job = b.queue.shift();
          units.push(makeUnit(job.kind, b.faction, b.col + b.w + 0.4, b.row + b.h * 0.5));
        }
      }
    }
    for (const u of units) {
      if (u.garrison || !u.job) continue;
      const arrived = moveToward(u, u.job.c, u.job.r, dt, u.kind === "scout" ? 2.4 : 1.85);
      if (arrived && u.job.type === "move") u.job = null;
      if (u.job?.type === "gather" && arrived && u.job.phase === "out") u.job.phase = "work";
      if (u.job?.type === "gather" && u.job.phase === "work") {
        u.job.work -= dt;
        if (u.job.work <= 0) {
          const drop = buildings.find((b) => (b.kind === "warehouse" || b.kind === "hq") && b.faction === u.faction && b.done);
          if (!drop) { u.job = null; continue; }
          u.job.phase = "back";
          u.job.c = drop.col + drop.w * 0.5;
          u.job.r = drop.row + drop.h + 0.35;
        }
      }
      if (u.job?.type === "gather" && u.job.phase === "back" && arrived) {
        state.res[u.job.pack.k] += u.job.pack.n;
        if (state.liveFloats < 8) spawnFloat(u.col, u.row, `+${u.job.pack.n} ${u.job.pack.k}`);
        u.job = null;
      }
      if (u.job?.type === "raid" && arrived) {
        state.res.capital += 4000;
        state.paid += 4000;
        notify("Van stole share", "info", u.col, u.row);
        u.job = null;
      }
    }
    for (const b of buildings) {
      if (b.protested && state.time > b.protested) b.protested = 0;
      if (b.done) {
        if ((b.kind === "dc" || b.kind === "mcs") && !(b.protested > state.time)) {
          b.traffic -= dt;
          if (b.traffic <= 0) {
            spawnTraffic(b);
            const city = cityOf(b);
            const elastic = clamp(1.35 - state.tariff, 0.45, 1.5);
            const loyalty = city ? city.loyalty : 1;
            const demand = ((city && city.demand) || 80) / 100;
            b.traffic = clamp(4 / (demand * elastic * loyalty), 2, 6);
          }
        }
        continue;
      }
      let workers = 0;
      for (const u of units) {
        if (u.job?.type === "build" && u.job.id === b.id) {
          if (Math.hypot(u.col - (b.col + b.w / 2), u.row - (b.row + b.h / 2)) < 2.8) workers += 1;
        }
      }
      if (workers) b.progress = Math.min(1, b.progress + (dt * workers) / b.time);
      else if (b.faction !== FACTION.zaps) b.progress = Math.min(1, b.progress + dt / (b.time * 1.6));
      if (b.progress >= 1) {
        b.done = true;
        b.traffic = 0.4;
        landDirty = true;
        for (const u of units) if (u.job?.id === b.id) u.job = null;
      }
    }
    for (const v of vehicles) stepVehicle(v, dt);
    for (let i = vehicles.length - 1; i >= 0; i--) if (vehicles[i].done) vehicles.splice(i, 1);

    for (const c of convoys) {
      c.eta = Math.max(0, c.eta - dt);
      const wp = c.path[c.i];
      if (!wp) continue;
      if (moveToward(c, wp.c, wp.r, dt, c.speed)) {
        c.i += 1;
        if (c.i >= c.path.length) arriveConvoy(c);
      }
    }
    for (const city of cities) {
      const attackers = units.filter((u) => !u.garrison && u.faction !== city.owner && inPlot(u, city));
      const defenders = units.filter((u) => !u.garrison && u.faction === city.owner && inPlot(u, city));
      if (attackers.length && !defenders.length) {
        city.contest = Math.min(1, city.contest + dt / 12);
        city.attacker = attackers[0].faction;
        if (city.contest >= 1) {
          setPlotOwner(city, attackers[0].faction);
          city.contest = 0;
          notify(`${FACTION_NAME[attackers[0].faction]} took ${city.name}`, "attack", city.col, city.row);
        }
      } else if (city.contest > 0) city.contest = Math.max(0, city.contest - dt / 9);
    }
    if (state.time > state.nextUndercut) {
      state.nextUndercut = state.time + 48;
      state.rivalTariff = 0.9;
      const city = cities.find((c) => c.owner === FACTION.zaps) || phx();
      notify(`Undercut! VOLTSPAN undercut ${city.name}!`, "attack", city.col, city.row);
    }
    if (state.time > state.nextMonth) {
      state.nextMonth = state.time + 60;
      notify(`Month close ${money(state.monthPaid)}`, "info", phx().col, phx().row);
      state.monthPaid = 0;
    }
    const brown = isBrownout();
    if (brown && !state.wasBrown) notify("Brownout — stalls dark, income halved", "attack", phx().col, phx().row);
    state.wasBrown = brown;

    aiAcc += dt;
    if (aiAcc > 4) { aiAcc = 0; thinkAI(); }
    visionAcc += dt;
    if (visionAcc > 0.45) {
      visionAcc = 0;
      const key = units.filter((u) => u.faction === FACTION.zaps && !u.garrison).map((u) => `${u.col | 0},${u.row | 0}`).join("|");
      if (key !== state.visKey) { state.visKey = key; refreshVision(); }
    }
    for (const d of dust) d.a += dt;
    for (const h of hawks) h.a += dt * 0.35;
  }

  function stepVehicle(v, dt) {
    if (v.phase === "drive" || v.phase === "leave" || v.phase === "balk" || v.phase === "cruise") {
      const wp = v.path[v.i];
      if (!wp) {
        if (v.phase === "cruise") v.i = 0;
        else v.done = true;
        return;
      }
      if (moveToward(v, wp.c, wp.r, dt, v.speed || 1.6)) {
        v.i += 1;
        if (v.i >= v.path.length) {
          if (v.phase === "drive") v.phase = v.queueing ? "queue" : "cable";
          else if (v.phase === "cruise") v.i = 0;
          else v.done = true;
        }
      }
      return;
    }
    const building = buildings.find((b) => b.id === v.buildingId);
    if (!building) { v.done = true; return; }
    if (v.phase === "queue") {
      v.wait += dt;
      let used = 0;
      for (const o of vehicles) used += stallUse(o, building);
      const occ = v.kind === "box" && building.kind === "dc" ? 2 : 1;
      if (used + occ <= stallCap(building)) {
        v.queueing = false;
        v.phase = "drive";
        v.path = [{ c: building.col + building.w * 0.45, r: building.row + building.h + 0.2 }];
        v.i = 0;
      } else if (v.wait > 20) {
        v.phase = "balk";
        v.path = [{ c: v.col + 4, r: v.row + 3 }];
        v.i = 0;
        const city = cityOf(building);
        if (city) city.loyalty = Math.max(0.35, city.loyalty - 0.08);
        spawnFloat(v.col, v.row, "honk");
      }
      return;
    }
    if (v.phase === "cable") {
      v.cable += dt * (isBrownout() ? 0.5 : 1);
      if (v.cable > 0.7) v.phase = "charge";
      return;
    }
    if (v.phase === "charge") {
      v.charge += dt * (isBrownout() ? 0.5 : 1);
      const need = Math.max(2.4, (VEHICLES[v.kind]?.kWh || 40) / 18);
      if (v.charge >= need) v.phase = "pay";
      return;
    }
    if (v.phase === "pay") {
      if (!v.didPay) { collectFare(v, building); v.didPay = true; }
      v.phase = "leave";
      v.path = [{ c: v.col - 2.5, r: v.row + 4 }];
      v.i = 0;
    }
  }

  function arriveConvoy(c) {
    c.done = true;
    const city = cities.find((x) => x.id === c.dest);
    if (!city || city.owner) return;
    const raced = units.some((u) => u.faction === FACTION.zaps && !u.garrison && inPlot(u, city));
    if (raced) {
      notify(`You beat ${FACTION_NAME[c.faction]} to ${city.name}`, "info", city.col, city.row);
      return;
    }
    setPlotOwner(city, c.faction);
    buildings.push(makeBuilding("hq", city.col - 3, city.row - 3, c.faction, 0.2));
    notify(`${FACTION_NAME[c.faction]} claims ${city.name}`, "attack", city.col, city.row);
  }

  function launchConvoy(faction, fromCity) {
    if (convoys.some((c) => c.faction === faction && !c.done)) return false;
    let dest = null;
    let best = 1e9;
    for (const city of cities) {
      if (city.owner) continue;
      const d = Math.hypot(city.col - fromCity.col, city.row - fromCity.row);
      if (d < best) { best = d; dest = city; }
    }
    if (!dest) return false;
    const path = route(fromCity.col, fromCity.row, dest.col, dest.row);
    const eta = Math.max(18, path.length * 1.6);
    convoys.push({
      id: "c" + (++seq), faction, col: path[0].c, row: path[0].r,
      path, i: 0, dest: dest.id, eta, max: eta, speed: 1.25, done: false,
    });
    return true;
  }

  function garrisoned(city) {
    if (!city) return false;
    return units.some((u) => u.garrison && buildings.some((b) => b.id === u.garrison && cityOf(b) && cityOf(b).id === city.id));
  }
  function hasLawyer(city) {
    return buildings.some((b) => b.kind === "permit" && b.done && b.faction === FACTION.zaps && city && cityOf(b) && cityOf(b).id === city.id);
  }
  function protest(target) {
    const city = cityOf(target);
    if (hasLawyer(city) || garrisoned(city)) {
      notify(`Lawyer held ${city ? city.name : "the site"}`, "info", target.col, target.row);
      return true;
    }
    target.protested = state.time + 30;
    notify(`ARCWAY protest at ${city ? city.name : "a site"}!`, "attack", target.col, target.row);
    return true;
  }

  function thinkAI() {
    for (const f of [FACTION.voltspan, FACTION.gridhawk, FACTION.arcway]) {
      const stepName = (ORDERS[f] || [])[plan[f]];
      if (!stepName) continue;
      const home = cities.find((c) => c.owner === f);
      if (!home) continue;
      if (stepName === "expand") {
        if (launchConvoy(f, home)) plan[f] += 1;
        continue;
      }
      if (stepName === "protest") {
        const target = buildings.find((b) => b.faction === FACTION.zaps && b.done && (b.kind === "dc" || b.kind === "mcs"));
        if (target && protest(target)) plan[f] += 1;
        continue;
      }
      const spec = BUILD[stepName];
      if (!spec || !canAfford(spec.cost, purse[f])) continue;
      const slot = findSlot(home, stepName);
      if (!slot) continue;
      payCost(spec.cost, purse[f]);
      buildings.push(makeBuilding(stepName, slot.c, slot.r, f, 0.08));
      plan[f] += 1;
    }
  }

  function doPan(dt) {
    const panSpeed = 780 * dt;
    if (keys["arrowleft"]) camera.x += panSpeed;
    if (keys["arrowright"]) camera.x -= panSpeed;
    if (keys["arrowup"]) camera.y += panSpeed;
    if (keys["arrowdown"]) camera.y -= panSpeed;
    if (pointer.inside && !drag && !pan) {
      const m = 16;
      if (pointer.x < m) camera.x += panSpeed;
      if (pointer.x > viewW() - m) camera.x -= panSpeed;
      if (pointer.y < m) camera.y += panSpeed;
      if (pointer.y > viewH() - m) camera.y -= panSpeed;
    }
    clampCamera();
  }

  const SPRITE_KIND = {
    hq: "buildings/site_hq",
    dc: "buildings/dc_canopy",
    mcs: "buildings/mcs_gantry",
    bess: "buildings/bess",
    substation: "buildings/substation",
    lounge: "buildings/lounge",
    market: "buildings/solar_carport",
    warehouse: "buildings/crew_depot",
    sales: "buildings/crew_depot",
    permit: "buildings/site_hq",
    crew: "units/crew_truck",
    scaffold: "units/scaffold",
    hatch: "vehicles/ev_hatch",
    sedan: "vehicles/sedan",
    suv: "vehicles/suv",
    pickup: "vehicles/pickup",
    van: "vehicles/delivery_van",
    box: "vehicles/box_truck",
    semi: "vehicles/semi_trailer",
    bus: "vehicles/school_bus",
  };
  const VEHICLE_LEN = {
    hatch: 0.42, sedan: 0.5, suv: 0.55, pickup: 0.65,
    van: 0.72, box: 1.05, semi: 1.5, bus: 1.2, crew: 0.72,
  };
  const art = { byId: {}, ready: false, tries: 0 };

  function spriteKey(kind) { return SPRITE_KIND[kind] || kind; }

  function normAnchor(entry, img) {
    let ax = entry.anchorX ?? entry.ax ?? (Array.isArray(entry.anchor) ? entry.anchor[0] : entry.anchor?.x) ?? 0.5;
    let ay = entry.anchorY ?? entry.ay ?? (Array.isArray(entry.anchor) ? entry.anchor[1] : entry.anchor?.y) ?? 0.86;
    const nw = img.naturalWidth || entry.w || entry.width || 1;
    const nh = img.naturalHeight || entry.h || entry.height || 1;
    if (ax > 1.01) ax /= nw;
    if (ay > 1.01) ay /= nh;
    return { x: clamp(ax, 0, 1), y: clamp(ay, 0, 1) };
  }

  function opaqueBounds(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hit = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] < 24) continue;
        hit = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (!hit) return { x: 0, y: 0, w: width, h: height };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }
  function rememberSprite(id, img, anchor, frames, raw) {
    if (!id || !img) return;
    const ax = raw?.anchor?.x ?? raw?.anchorX ?? anchor.x * img.naturalWidth;
    const ay = raw?.anchor?.y ?? raw?.anchorY ?? anchor.y * img.naturalHeight;
    const rec = {
      img,
      anchor,
      bounds: opaqueBounds(img),
      frames: frames || null,
      gameScale: Number(raw?.game_scale || raw?.gameScale || 0),
      anchorPx: {
        x: ax > 1.01 ? ax : ax * img.naturalWidth,
        y: ay > 1.01 ? ay : ay * img.naturalHeight,
      },
      bottomY: Number(raw?.bottom_y || raw?.bottomY || img.naturalHeight),
    };
    art.byId[id] = rec;
    art.byId[id.replaceAll("-", "_")] = rec;
    art.byId[id.replaceAll("_", "-")] = rec;
  }

  function gameScaleOf(id) {
    const baseId = id.endsWith("_b") ? id.slice(0, -2) : id;
    return art.byId[baseId]?.gameScale || art.byId[id]?.gameScale || 1;
  }

  function resolveSprite(id, facing) {
    if (facing != null && Number(facing) >= 0) {
      const mir = spriteRecord(id + "_b");
      if (mir) return mir;
    }
    return spriteRecord(id);
  }

  function spriteRecord(id) {
    if (!id) return null;
    if (art.byId[id]) return art.byId[id];
    const keys = Object.keys(art.byId);
    const hit = keys.find((k) => k === id || k.endsWith("_" + id) || k.endsWith("-" + id));
    return hit ? art.byId[hit] : null;
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth ? img : null);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function spriteEntries(data) {
    if (Array.isArray(data)) return data;
    const bag = data.sprites || data.images || data;
    if (Array.isArray(bag)) return bag;
    return Object.entries(bag).map(([id, v]) => {
      if (typeof v === "string") return { id, src: v };
      if (!v || typeof v !== "object") return null;
      return { id, ...v };
    }).filter((e) => e && e.id && e.id !== "version" && e.id !== "meta");
  }

  async function loadSprites() {
    if (art.ready) return;
    art.tries += 1;
    let data = null;
    try {
      const res = await fetch(`assets/sprites/sprites.json?v=${art.tries}`);
      if (!res.ok) return;
      data = await res.json();
    } catch {
      return;
    }
    const jobs = spriteEntries(data).map(async (raw) => {
      const id = raw.id || raw.name || raw.key;
      if (!id) return;
      const files = raw.frames || raw.dirs || raw.images || [raw.src || raw.file || raw.png || raw.image || `${id}.png`];
      const imgs = [];
      for (const file of files) {
        const url = String(file).startsWith("assets/") || String(file).startsWith("/") || String(file).startsWith("http")
          ? file
          : `assets/sprites/${file}`;
        const img = await loadImage(url);
        if (img) imgs.push(img);
      }
      if (!imgs.length) return;
      rememberSprite(id, imgs[0], normAnchor(raw, imgs[0]), imgs.length > 1 ? imgs : null, raw);
    });
    await Promise.all(jobs);
    if (Object.keys(art.byId).length) art.ready = true;
  }

  function depthY(col, row) { return (col + row) * (TH / 2); }

  function dropShadow(g, col, row, rx, ry) {
    const p = iso(col, row);
    g.fillStyle = "rgba(42,28,16,0.38)";
    g.beginPath();
    g.ellipse(p.x, p.y + 2, Math.max(6, rx), Math.max(3, ry), 0, 0, Math.PI * 2);
    g.fill();
  }

  function drawSprite(g, id, col, row, opt = {}) {
    const rec = resolveSprite(id, opt.mirror ? opt.facing : null);
    if (!rec) return false;
    const img = rec.img;
    if (!img || !img.naturalWidth) return false;
    const wTiles = opt.w ?? 0;
    const hTiles = opt.h ?? 0;
    let dw;
    let dh;
    const diamond = wTiles > 0 && hTiles > 0 && rec.bottomY > rec.anchorPx.y + 4;
    if (diamond && !opt.vehicle) {
      const half = rec.bottomY - rec.anchorPx.y;
      const worldHalf = (wTiles + hTiles) * (TH / 4);
      const scale = worldHalf / half;
      dw = img.naturalWidth * scale;
      dh = img.naturalHeight * scale;
    } else if (opt.vehicle || rec.gameScale) {
      const refW = art.byId["vehicles/sedan"]?.img.naturalWidth || 301;
      const tiles = 0.5 * gameScaleOf(id) * (img.naturalWidth / refW);
      dw = tiles * TW;
      dh = dw * (img.naturalHeight / img.naturalWidth);
    } else if (opt.length) {
      dw = opt.length * TW;
      dh = dw * (img.naturalHeight / img.naturalWidth);
    } else {
      dw = Math.max(TW * 0.5, (Math.max(wTiles, 0.2) + Math.max(hTiles, 0.2)) * (TW / 2));
      dh = dw * (img.naturalHeight / img.naturalWidth);
    }
    const p = iso(col + wTiles / 2, row + hTiles / 2);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(img, p.x - rec.anchor.x * dw, p.y - rec.anchor.y * dh, dw, dh);
    return true;
  }

  function tileRGB(c, r) {
    const b = biome[idx(c, r)];
    const n = hash(c, r);
    const n2 = hash(c + 17, r * 3 + 5);
    const plot = plotOf[idx(c, r)];
    let pal = {
      [DESERT]: [[196, 164, 116], [214, 184, 136], [176, 142, 96]],
      [SCRUB]: [[112, 124, 78], [86, 102, 64], [138, 142, 88]],
      [VALLEY]: [[78, 118, 70], [102, 142, 78], [64, 96, 58]],
      [MOUNTAIN]: [[122, 116, 110], [96, 92, 88], [148, 144, 138]],
      [WATER]: [[42, 104, 146], [30, 82, 122], [58, 128, 168]],
      [GRAVEL]: [[168, 142, 108], [186, 158, 122], [150, 126, 96]],
      [ROAD]: [[58, 56, 62], [48, 46, 52], [72, 68, 64]],
    }[b];
    if (plot >= 0 && cities[plot].owner === FACTION.zaps && (b === GRAVEL || b === ROAD)) {
      if (state.age >= 2) pal = [[168, 164, 156], [184, 180, 172], [150, 146, 140]];
      else if (state.age >= 1) pal = [[74, 76, 82], [62, 64, 70], [90, 92, 96]];
    }
    const base = pal[(n * pal.length) | 0];
    const lift = ((n - 0.5) * 14 + (n2 - 0.5) * 8) | 0;
    return [base[0] + lift, base[1] + lift, base[2] + lift];
  }
  function tileColor(c, r) {
    const [r0, g0, b0] = tileRGB(c, r);
    const here = biome[idx(c, r)];
    if (here === ROAD || here === WATER) return `rgb(${r0},${g0},${b0})`;
    let rr = 0, gg = 0, bb = 0, n = 0;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (!inside(c + dc, r + dr)) continue;
      const nb = biome[idx(c + dc, r + dr)];
      if (nb === ROAD || nb === WATER) continue;
      const [r1, g1, b1] = tileRGB(c + dc, r + dr);
      rr += r1; gg += g1; bb += b1; n += 1;
    }
    if (!n) return `rgb(${r0},${g0},${b0})`;
    const mix = (a, b) => (a * 0.58 + (b / n) * 0.42) | 0;
    return `rgb(${mix(r0, rr)},${mix(g0, gg)},${mix(b0, bb)})`;
  }
  function speckleTile(g, c, r) {
    const b = biome[idx(c, r)];
    if (b === WATER || b === ROAD) return;
    const n = hash(c + 3, r + 11);
    const n2 = hash(c * 5 + 1, r * 7 + 2);
    const q = iso(c + 0.22 + n * 0.55, r + 0.22 + n2 * 0.5);
    g.fillStyle = n2 > 0.55 ? "rgba(255,248,230,0.1)" : "rgba(40,24,12,0.11)";
    g.beginPath();
    g.ellipse(q.x, q.y, 2 + n * 5, 1.2 + n2 * 2.4, n * 4, 0, Math.PI * 2);
    g.fill();
    const q2 = iso(c + 0.15 + n2 * 0.4, r + 0.55 + n * 0.25);
    g.fillStyle = n > 0.5 ? "rgba(255,248,230,0.07)" : "rgba(40,24,12,0.08)";
    g.beginPath();
    g.ellipse(q2.x, q2.y, 1.5 + n2 * 3, 1 + n * 1.6, n2 * 3, 0, Math.PI * 2);
    g.fill();
  }
  function blendEdges(g, c, r) {
    const here = biome[idx(c, r)];
    if (here === ROAD) return;
    const edges = [
      [0, -1, [0, 0], [1, 0]],
      [1, 0, [1, 0], [1, 1]],
      [0, 1, [1, 1], [0, 1]],
      [-1, 0, [0, 1], [0, 0]],
    ];
    const center = iso(c + 0.5, r + 0.5);
    for (const [dc, dr, a, b] of edges) {
      const nc = c + dc;
      const nr = r + dr;
      if (!inside(nc, nr)) continue;
      const nb = biome[idx(nc, nr)];
      if (nb === here || nb === ROAD) continue;
      const pa = iso(c + a[0], r + a[1]);
      const pb = iso(c + b[0], r + b[1]);
      const ia = { x: pa.x * 0.58 + center.x * 0.42, y: pa.y * 0.58 + center.y * 0.42 };
      const ib = { x: pb.x * 0.58 + center.x * 0.42, y: pb.y * 0.58 + center.y * 0.42 };
      if (here !== WATER && nb === WATER) g.fillStyle = "rgba(92,74,48,0.62)";
      else {
        const [rr, gg, bb] = tileRGB(nc, nr);
        g.fillStyle = `rgba(${rr},${gg},${bb},0.5)`;
      }
      poly(g, [pa, pb, ib, ia]);
      g.fill();
    }
  }
  function drawRoadMarks(g, c, r) {
    const nbrs = [];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      if (inside(c + dc, r + dr) && road[idx(c + dc, r + dr)]) nbrs.push([dc, dr]);
    }
    g.strokeStyle = AMBER;
    g.globalAlpha = 0.9;
    g.lineWidth = 1.5;
    g.setLineDash([4, 5]);
    g.beginPath();
    const mid = iso(c + 0.5, r + 0.5);
    if (nbrs.length >= 2) {
      for (const [dc, dr] of nbrs) {
        const p = iso(c + 0.5 + dc * 0.46, r + 0.5 + dr * 0.46);
        g.moveTo(mid.x, mid.y);
        g.lineTo(p.x, p.y);
      }
    } else if (nbrs.length === 1) {
      const [dc, dr] = nbrs[0];
      const a = iso(c + 0.5 + dc * 0.46, r + 0.5 + dr * 0.46);
      const b = iso(c + 0.5 - dc * 0.46, r + 0.5 - dr * 0.46);
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    } else {
      const a = iso(c + 0.5, r + 0.12);
      const b = iso(c + 0.5, r + 0.88);
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 1;
  }
  function poly(g, pts) {
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
  }
  function tilePoly(c, r) { return [iso(c, r), iso(c + 1, r), iso(c + 1, r + 1), iso(c, r + 1)]; }

  function paintMaps() {
    if (!landCanvas) {
      landCanvas = document.createElement("canvas");
      landCanvas.width = MAP_W;
      landCanvas.height = MAP_H;
      fogCanvas = document.createElement("canvas");
      fogCanvas.width = MAP_W;
      fogCanvas.height = MAP_H;
    }
    if (landDirty) {
      const g = landCanvas.getContext("2d");
      g.setTransform(1, 0, 0, 1, -ORIGIN_X, -ORIGIN_Y);
      g.clearRect(ORIGIN_X, ORIGIN_Y, MAP_W, MAP_H);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const pts = tilePoly(c, r);
          const fill = tileColor(c, r);
          poly(g, pts);
          g.fillStyle = fill;
          g.fill();
          g.lineWidth = 1;
          g.strokeStyle = fill;
          g.stroke();
          speckleTile(g, c, r);
          blendEdges(g, c, r);
          const o = owner[idx(c, r)];
          if (o) {
            poly(g, pts);
            g.fillStyle = FACTION_COLOR[o];
            g.globalAlpha = 0.15;
            g.fill();
            g.globalAlpha = 1;
          }
          if (biome[idx(c, r)] === MOUNTAIN) {
            const peak = 12 + hash(c, r) * 22;
            const top = iso(c + 0.5, r + 0.5);
            g.fillStyle = "rgba(48,32,18,0.28)";
            g.beginPath();
            g.ellipse(top.x, top.y + 4, 14, 6, 0, 0, Math.PI * 2);
            g.fill();
            poly(g, [{ x: top.x, y: top.y - peak }, { x: top.x + 12, y: top.y - 2 }, { x: top.x - 10, y: top.y - 1 }]);
            g.fillStyle = peak > 26 ? "#E7E2DA" : "#8C8680";
            g.fill();
          }
          if (road[idx(c, r)]) drawRoadMarks(g, c, r);
          const n = hash(c, r);
          const zone = hash((c / 3) | 0, (r / 3) | 0);
          const p = iso(c + 0.35 + n * 0.35, r + 0.3 + hash(c + 9, r + 4) * 0.35);
          if (biome[idx(c, r)] === DESERT && zone > 0.84 && n > 0.72) {
            g.fillStyle = "rgba(48,32,18,0.35)";
            g.beginPath();
            g.ellipse(p.x, p.y + 2, 8, 3, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#2F6B3A";
            g.fillRect(p.x - 1, p.y - 16, 3, 16);
            g.fillRect(p.x - 7, p.y - 12, 6, 2);
            g.fillRect(p.x - 7, p.y - 12, 2, 5);
            g.fillRect(p.x + 2, p.y - 10, 6, 2);
            g.fillRect(p.x + 6, p.y - 14, 2, 5);
          } else if ((biome[idx(c, r)] === SCRUB || biome[idx(c, r)] === VALLEY) && n > 0.9) {
            g.fillStyle = "rgba(48,32,18,0.25)";
            g.beginPath();
            g.ellipse(p.x, p.y + 2, 6, 2.5, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = n > 0.95 ? "#3E6A32" : "#6E8A3E";
            g.beginPath();
            g.ellipse(p.x, p.y, 5, 3, 0, 0, Math.PI * 2);
            g.fill();
          }
          if (o) {
            g.strokeStyle = FACTION_COLOR[o];
            g.lineWidth = 2.2;
            g.setLineDash([6, 5]);
            g.beginPath();
            const edges = [[[0, 0], [1, 0], 0, -1], [[1, 0], [1, 1], 1, 0], [[1, 1], [0, 1], 0, 1], [[0, 1], [0, 0], -1, 0]];
            for (const [a, bpt, dc, dr] of edges) {
              const nc = c + dc;
              const nr = r + dr;
              const no = inside(nc, nr) ? owner[idx(nc, nr)] : 0;
              if (no === o) continue;
              const pa = iso(c + a[0], r + a[1]);
              const pb = iso(c + bpt[0], r + bpt[1]);
              g.moveTo(pa.x, pa.y);
              g.lineTo(pb.x, pb.y);
            }
            g.stroke();
            g.setLineDash([]);
          }
        }
      }
      landDirty = false;
    }
    if (fogDirty && fogCanvas) {
      const g = fogCanvas.getContext("2d");
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, MAP_W, MAP_H);
      g.setTransform(1, 0, 0, 1, -ORIGIN_X, -ORIGIN_Y);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const v = vis[idx(c, r)];
          if (v === 2) continue;
          poly(g, tilePoly(c, r));
          g.fillStyle = v === 0 ? "rgba(62,44,28,0.9)" : "rgba(62,44,28,0.28)";
          g.fill();
        }
      }
      fogDirty = false;
    }
    if (miniDirty) {
      mini.width = COLS;
      mini.height = ROWS;
      const img = mctx.createImageData(COLS, ROWS);
      const dot = { 1: [230, 50, 37], 2: [232, 154, 46], 3: [0, 212, 245], 4: [122, 76, 219], 5: [196, 92, 255], 6: [245, 240, 232] };
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const o = owner[idx(c, r)];
          const b = biome[idx(c, r)];
          let col = [120, 132, 86];
          if (b === DESERT) col = [176, 146, 96];
          else if (b === MOUNTAIN) col = [120, 116, 112];
          else if (b === WATER) col = [40, 100, 150];
          else if (b === ROAD) col = [70, 64, 58];
          else if (b === GRAVEL) col = [150, 126, 96];
          else if (b === VALLEY) col = [70, 120, 68];
          if (o && dot[o]) col = col.map((v, i) => v * 0.4 + dot[o][i] * 0.6);
          const p = (r * COLS + c) * 4;
          img.data[p] = col[0];
          img.data[p + 1] = col[1];
          img.data[p + 2] = col[2];
          img.data[p + 3] = 255;
        }
      }
      mctx.putImageData(img, 0, 0);
      mini._img = mctx.getImageData(0, 0, COLS, ROWS);
      miniDirty = false;
    }
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (s) => clamp(((n >> s) & 255) + amt, 0, 255);
    return `#${[ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  function drawBox(g, col, row, w, h, height, wall, roof) {
    const top = iso(col, row);
    const right = iso(col + w, row);
    const bot = iso(col + w, row + h);
    const left = iso(col, row + h);
    const up = (p) => ({ x: p.x, y: p.y - height });
    g.fillStyle = "rgba(48,32,18,0.32)";
    poly(g, [top, right, bot, left]);
    g.fill();
    g.fillStyle = wall;
    poly(g, [left, bot, up(bot), up(left)]);
    g.fill();
    g.fillStyle = shade(wall, -22);
    poly(g, [bot, right, up(right), up(bot)]);
    g.fill();
    g.fillStyle = roof;
    poly(g, [up(top), up(right), up(bot), up(left)]);
    g.fill();
  }
  function drawFlag(g, x, y, color) {
    g.fillStyle = color || RED;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 12, y + 4);
    g.lineTo(x, y + 8);
    g.fill();
  }
  function drawScaffold(g, b) {
    g.strokeStyle = "#C4A574";
    g.lineWidth = 1.6;
    const h = 12 + 30 * b.progress;
    const corners = [iso(b.col, b.row), iso(b.col + b.w, b.row), iso(b.col + b.w, b.row + b.h), iso(b.col, b.row + b.h)];
    g.beginPath();
    for (const p of corners) { g.moveTo(p.x, p.y); g.lineTo(p.x, p.y - h); }
    g.moveTo(corners[0].x, corners[0].y - h * 0.55);
    g.lineTo(corners[2].x, corners[2].y - h * 0.2);
    g.moveTo(corners[1].x, corners[1].y - h * 0.35);
    g.lineTo(corners[3].x, corners[3].y - h * 0.7);
    g.stroke();
  }
  function drawProgress(g, b) {
    const p = iso(b.col + b.w / 2, b.row + b.h / 2);
    const lift = 36 + (b.w + b.h) * 8;
    g.fillStyle = "rgba(30,30,36,0.82)";
    g.fillRect(p.x - 18, p.y - lift, 36, 6);
    g.fillStyle = CYAN;
    g.fillRect(p.x - 18, p.y - lift, 36 * b.progress, 6);
  }

  function drawHQ(g, b) {
    const h = state.age >= 2 ? 22 : state.age >= 1 ? 18 : 14;
    drawBox(g, b.col, b.row, b.w, b.h, h, RED, "#F7F4EE");
    if (state.age >= 1) drawBox(g, b.col + 0.9, b.row + 0.9, 1.05, 1.05, h + 6, "#C4281C", "#F7F4EE");
    if (state.age >= 2) drawBox(g, b.col + 1.15, b.row + 1.15, 0.55, 0.55, h + 12, "#A81E16", "#F7F4EE");
    const p = iso(b.col + b.w * 0.5, b.row + 0.8);
    g.strokeStyle = CREAM;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(p.x, p.y - h - 4);
    g.lineTo(p.x, p.y - h - 16);
    g.stroke();
    drawFlag(g, p.x, p.y - h - 16, FACTION_COLOR[b.faction]);
  }
  function drawDC(g, b) {
    const dark = isBrownout() || b.protested > state.time;
    const canopy = dark ? "#3A3A42" : RED;
    drawBox(g, b.col + 0.18, b.row + 0.62, 0.16, 0.16, 16, "#F7F4EE", "#FFFFFF");
    drawBox(g, b.col + 0.66, b.row + 0.62, 0.16, 0.16, 16, "#F7F4EE", "#FFFFFF");
    drawBox(g, b.col, b.row + 0.12, 1, 0.38, 22, canopy, shade(canopy, 18));
    if (state.age >= 1 && !dark) {
      const p = iso(b.col + 0.5, b.row + 0.15);
      g.fillStyle = AMBER;
      g.fillRect(p.x - 8, p.y - 30, 16, 3);
    }
  }
  function drawMCS(g, b) {
    const dark = isBrownout() || b.protested > state.time;
    drawBox(g, b.col + 0.08, b.row + 0.25, 0.32, Math.max(0.4, b.h - 0.5), 46, "#1A1C20", "#2A2E33");
    drawBox(g, b.col + b.w - 0.4, b.row + 0.25, 0.32, Math.max(0.4, b.h - 0.5), 46, "#1A1C20", "#2A2E33");
    drawBox(g, b.col, b.row, b.w, 0.42, 50, "#14161A", "#2A2E33");
    const a = iso(b.col + b.w / 2, b.row + 0.35);
    g.strokeStyle = dark ? "#555860" : "#F5C518";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(a.x, a.y - 50);
    g.lineTo(a.x + 2, a.y - 18);
    g.stroke();
  }
  function drawBESS(g, b) {
    drawBox(g, b.col, b.row, b.w, b.h, 16, "#F4F1EA", "#FFFFFF");
    for (let i = 0; i < 3; i++) {
      const p = iso(b.col + 0.35 + i * 0.55, b.row + b.h * 0.65);
      g.fillStyle = CYAN;
      g.fillRect(p.x, p.y - 14, 6, 3);
    }
  }
  function drawSub(g, b) {
    drawBox(g, b.col, b.row, b.w, b.h, 3, "#9AA0A6", "#C5C8CC");
    const p = iso(b.col + 1, b.row + 1);
    g.strokeStyle = "#8d9298";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(p.x - 12, p.y);
    g.lineTo(p.x, p.y - 48);
    g.lineTo(p.x + 12, p.y);
    g.moveTo(p.x - 7, p.y - 18);
    g.lineTo(p.x + 7, p.y - 18);
    g.moveTo(p.x - 4, p.y - 32);
    g.lineTo(p.x + 4, p.y - 32);
    g.stroke();
    g.fillStyle = CREAM;
    g.fillRect(p.x - 9, p.y - 30, 4, 3);
    g.fillRect(p.x + 5, p.y - 30, 4, 3);
  }
  function drawWarehouse(g, b) {
    drawBox(g, b.col, b.row, b.w, b.h, 22, "#C4A574", "#A68455");
    const p = iso(b.col + 0.35, b.row + b.h - 0.15);
    g.fillStyle = "#6B5340";
    g.fillRect(p.x, p.y - 18, 16, 16);
    g.strokeStyle = "#3A2A1C";
    g.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(p.x, p.y - 16 + i * 4);
      g.lineTo(p.x + 16, p.y - 16 + i * 4);
      g.stroke();
    }
  }
  function drawLounge(g, b) {
    drawBox(g, b.col, b.row, b.w, b.h, 18, "#E7C48A", CREAM);
    drawBox(g, b.col - 0.08, b.row - 0.05, b.w + 0.16, 0.32, 24, AMBER, "#F0C27A");
    const p = iso(b.col + 0.35, b.row + b.h * 0.55);
    g.fillStyle = "rgba(232,154,46,0.9)";
    g.fillRect(p.x, p.y - 16, 18, 10);
  }
  function drawMarket(g, b) {
    drawBox(g, b.col, b.row + 0.25, b.w, Math.max(0.4, b.h - 0.2), 12, CREAM, "#E7D7BC");
    for (let i = 0; i < 5; i++) {
      drawBox(g, b.col + i * (b.w / 5), b.row, b.w / 5, 0.36, 16, i % 2 ? RED : CREAM, i % 2 ? "#C4281C" : "#FFFFFF");
    }
  }
  function drawPermit(g, b) {
    drawBox(g, b.col, b.row, b.w, b.h, 24, "#F3EDE2", "#E7DCC8");
    drawBox(g, b.col + 0.08, b.row + b.h - 0.28, 0.16, 0.16, 18, "#F7F4EE", "#FFFFFF");
    drawBox(g, b.col + b.w - 0.28, b.row + b.h - 0.28, 0.16, 0.16, 18, "#F7F4EE", "#FFFFFF");
    const p = iso(b.col + b.w * 0.5, b.row + 0.2);
    g.strokeStyle = CHAR;
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(p.x, p.y - 24);
    g.lineTo(p.x, p.y - 42);
    g.stroke();
    drawFlag(g, p.x, p.y - 42, FACTION_COLOR[b.faction]);
  }
  function drawSales(g, b) {
    drawBox(g, b.col, b.row, b.w, b.h, 20, "#C8C2B8", "#E7E2D8");
    const a = iso(b.col, b.row + 0.2);
    const d = iso(b.col + b.w, b.row + b.h - 0.2);
    g.strokeStyle = RED;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(a.x, a.y - 18);
    g.lineTo(d.x, d.y - 18);
    g.stroke();
    drawBox(g, b.col + b.w * 0.35, b.row + b.h - 0.2, 0.7, 0.5, 12, CREAM, RED);
  }

  function drawBuildingBody(g, b) {
    if (drawSprite(g, spriteKey(b.kind), b.col, b.row, { w: b.w, h: b.h })) return;
    dropShadow(g, b.col + b.w / 2, b.row + b.h / 2, 8 + b.w * 7, 4 + b.h * 2);
    if (b.kind === "hq") drawHQ(g, b);
    else if (b.kind === "dc") drawDC(g, b);
    else if (b.kind === "mcs") drawMCS(g, b);
    else if (b.kind === "bess") drawBESS(g, b);
    else if (b.kind === "substation") drawSub(g, b);
    else if (b.kind === "warehouse") drawWarehouse(g, b);
    else if (b.kind === "lounge") drawLounge(g, b);
    else if (b.kind === "market") drawMarket(g, b);
    else if (b.kind === "permit") drawPermit(g, b);
    else if (b.kind === "sales") drawSales(g, b);
    else drawBox(g, b.col, b.row, b.w, b.h, 18, "#C8B89A", CREAM);
  }
  function drawBuilding(g, b) {
    if (!b.done) {
      const scaffolded = drawSprite(g, spriteKey("scaffold"), b.col, b.row, { w: b.w, h: b.h });
      if (!scaffolded) {
        drawScaffold(g, b);
        g.save();
        g.globalAlpha = 0.25 + b.progress * 0.7;
        drawBuildingBody(g, b);
        g.restore();
      }
    } else drawBuildingBody(g, b);
    if (!b.done && !state.portrait) drawProgress(g, b);
    if (selection.has(b.id) && !state.portrait) {
      const p = iso(b.col + b.w / 2, b.row + b.h / 2);
      g.strokeStyle = CREAM;
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(p.x, p.y + 6, 18 + b.w * 6, 8 + b.h * 2, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }

  function drawUnit(g, u) {
    if (u.garrison) return;
    const crew = u.kind === "crew";
    const drew = crew && drawSprite(g, spriteKey("crew"), u.col, u.row, { vehicle: true, mirror: true, facing: u.facing });
    if (!drew) {
      dropShadow(g, u.col, u.row, crew ? 14 : 12, 6);
      const color = crew ? RED : CREAM;
      const roof = crew ? "#F5C518" : CYAN;
      const w = crew ? 0.52 : 0.48;
      const h = crew ? 0.82 : 0.7;
      drawBox(g, u.col - w / 2, u.row - h / 2, w, h * 0.55, crew ? 10 : 12, color, shade(color, 16));
      drawBox(g, u.col - w * 0.2, u.row - h / 2, w * 0.62, h * 0.38, crew ? 14 : 15, shade(color, -12), roof);
      if (crew) {
        const p = iso(u.col, u.row);
        g.fillStyle = "#F5C518";
        g.beginPath();
        g.arc(p.x + 2, p.y - 20, 3.5, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = CREAM;
        g.beginPath();
        g.arc(p.x + 6, p.y - 16, 2.2, 0, Math.PI * 2);
        g.fill();
      }
    }
    if (u.job?.type === "build" && !state.portrait && !drew) {
      const p = iso(u.col, u.row);
      const swing = Math.sin(state.time * 9) * 8;
      g.strokeStyle = "#8A5A16";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(p.x + 6, p.y - 12);
      g.lineTo(p.x + 14, p.y - 24 - swing);
      g.stroke();
      g.fillStyle = "#8d9298";
      g.fillRect(p.x + 11, p.y - 28 - swing, 7, 4);
    }
    if (selection.has(u.id) && !state.portrait) {
      const p = iso(u.col, u.row);
      g.strokeStyle = CREAM;
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(p.x, p.y + 4, 16, 8, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }

  function drawVehicle(g, v) {
    const spec = VEHICLES[v.kind];
    if (!spec) return;
    const len = VEHICLE_LEN[v.kind] || spec.h;
    const drew = drawSprite(g, spriteKey(v.kind), v.col, v.row, { vehicle: true, mirror: true, facing: v.facing });
    if (drew) {
      drawVehicleExtras(g, v);
      return;
    }
    dropShadow(g, v.col, v.row, len * 16, len * 6);
    const ox = v.col - spec.w / 2;
    const oy = v.row - (spec.trailer ? spec.h + spec.trailer.h : spec.h) / 2;
    if (spec.trailer) drawBox(g, ox, oy + spec.h * 0.2, spec.trailer.w, spec.trailer.h, spec.trailer.body, spec.trailer.color, shade(spec.trailer.color, -12));
    drawBox(g, ox, oy, spec.w, spec.h, spec.body, spec.color, shade(spec.color, 16));
    drawBox(g, ox + spec.w * 0.08, oy, spec.w * 0.72, spec.h * 0.4, spec.cab, shade(spec.color, -14), spec.roof);
    if (spec.bed) drawBox(g, ox, oy + spec.h * 0.48, spec.w, spec.h * 0.45, spec.body * 0.4, shade(spec.color, -28), shade(spec.color, -36));
    if (spec.windows) {
      g.fillStyle = CHAR;
      for (let i = 0; i < spec.windows; i++) {
        const p = iso(ox + spec.w * 0.72, oy + spec.h * (0.2 + i * 0.12));
        g.fillRect(p.x, p.y - spec.body - 2, 3, 3);
      }
    }
    drawVehicleExtras(g, v);
  }
  function drawVehicleExtras(g, v) {
    const spec = VEHICLES[v.kind];
    const building = buildings.find((b) => b.id === v.buildingId);
    if (building && (v.phase === "cable" || v.phase === "charge" || v.phase === "pay")) {
      const stall = iso(building.col + building.w * 0.5, building.row + 0.3);
      const car = iso(v.col, v.row);
      g.strokeStyle = "#F5C518";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(stall.x, stall.y - 20);
      g.quadraticCurveTo((stall.x + car.x) / 2, Math.min(stall.y, car.y) - 16, car.x, car.y - 8);
      g.stroke();
      if (v.phase === "charge") {
        const pulse = 0.45 + 0.55 * Math.abs(Math.sin(state.time * 10));
        g.fillStyle = `rgba(0,212,245,${pulse})`;
        g.beginPath();
        g.arc(car.x, car.y - 8, 3, 0, Math.PI * 2);
        g.fill();
        const need = Math.max(2.4, spec.kWh / 18);
        g.fillStyle = "rgba(30,30,36,0.8)";
        g.fillRect(car.x - 14, car.y - 30, 28, 4);
        g.fillStyle = CYAN;
        g.fillRect(car.x - 14, car.y - 30, 28 * clamp(v.charge / need, 0, 1), 4);
      }
    }
    if ((v.phase === "pay" || v.holdPay) && !state.portrait) {
      const p = iso(v.col, v.row);
      g.fillStyle = "#7CFF6B";
      g.font = "700 16px Share Tech Mono, monospace";
      g.textAlign = "center";
      g.fillText(`+$${v.fare || fareOf(v, building || { faction: FACTION.zaps, col: v.col, row: v.row })}`, p.x, p.y - 34);
    }
    if (v.label) {
      const p = iso(v.col, v.row - 0.2);
      g.font = "700 13px Barlow Condensed, sans-serif";
      g.textAlign = "center";
      const w = g.measureText(v.label).width + 10;
      g.fillStyle = "rgba(30,30,36,0.88)";
      g.fillRect(p.x - w / 2, p.y - 40, w, 16);
      g.fillStyle = CREAM;
      g.fillText(v.label, p.x, p.y - 28);
    }
  }

  function drawConvoy(g, c) {
    if (!drawSprite(g, spriteKey("semi"), c.col, c.row, { vehicle: true, mirror: true, facing: c.facing ?? 1 })) {
      dropShadow(g, c.col, c.row, 22, 8);
      drawBox(g, c.col - 0.85, c.row - 0.32, 0.7, 0.62, 16, CYAN, "#E7FBFF");
      drawBox(g, c.col - 0.2, c.row - 0.28, 0.95, 0.55, 18, "#D7F7FF", CYAN);
    }
    const p = iso(c.col, c.row);
    drawFlag(g, p.x + 8, p.y - 28, FACTION_COLOR[c.faction] || AMBER);
    if (state.portrait) return;
    const frac = c.max ? clamp(c.eta / c.max, 0, 1) : 0.5;
    g.fillStyle = "rgba(30,30,36,0.88)";
    g.fillRect(p.x - 30, p.y - 46, 60, 7);
    g.fillStyle = CYAN;
    g.fillRect(p.x - 30, p.y - 46, 60 * frac, 7);
    g.fillStyle = CREAM;
    g.font = "700 12px Barlow Condensed, sans-serif";
    g.textAlign = "center";
    g.fillText(`${FACTION_NAME[c.faction] || "VOLTSPAN"} ETA`, p.x, p.y - 52);
  }

  function drawNode(g, n) {
    const color = n.kind === "hall" ? "#E7DCC8" : "#C46A3A";
    dropShadow(g, n.col, n.row, 12, 5);
    drawBox(g, n.col - 0.35, n.row - 0.35, 0.7, 0.7, n.kind === "yard" ? 8 : 14, color, shade(color, 20));
  }

  function fenceBox(city) {
    const ci = cities.indexOf(city);
    const mine = buildings.filter((b) => plotOf[idx(clamp(b.col | 0, 0, COLS - 1), clamp(b.row | 0, 0, ROWS - 1))] === ci);
    if (!mine.length) return null;
    let c0 = 999, r0 = 999, c1 = -1, r1 = -1;
    for (const b of mine) {
      c0 = Math.min(c0, b.col);
      r0 = Math.min(r0, b.row);
      c1 = Math.max(c1, b.col + b.w);
      r1 = Math.max(r1, b.row + b.h);
    }
    return { c0: c0 - 0.35, r0: r0 - 0.35, c1: c1 + 0.35, r1: r1 + 0.35 };
  }
  function drawFence(g, city) {
    const box = fenceBox(city);
    if (!box) return;
    const corners = [iso(box.c0, box.r0), iso(box.c1, box.r0), iso(box.c1, box.r1), iso(box.c0, box.r1)];
    g.strokeStyle = state.age >= 1 ? "#C8C2B8" : "rgba(214,206,196,0.95)";
    g.lineWidth = 1.3;
    g.beginPath();
    corners.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.closePath();
    g.stroke();
    g.strokeStyle = "rgba(214,206,196,0.55)";
    g.beginPath();
    corners.forEach((p, i) => (i ? g.lineTo(p.x, p.y - 7) : g.moveTo(p.x, p.y - 7)));
    g.closePath();
    g.stroke();
    for (const p of corners) {
      g.fillStyle = "#D9D3C8";
      g.fillRect(p.x - 1.2, p.y - 10, 2.4, 10);
    }
  }

  function drawGhost(g) {
    if (!state.build || !pointer.inside || state.portrait) return;
    const spec = BUILD[state.build];
    if (!spec || spec.train) return;
    const w = screenToWorld(pointer.x, pointer.y);
    const col = Math.floor(w.col);
    const row = Math.floor(w.row);
    const ok = fits(state.build, col, row, FACTION.zaps);
    g.globalAlpha = 0.5;
    drawBox(g, col, row, spec.w, spec.h, 16, ok ? "#7DDEA0" : RED, ok ? "#D8FFE8" : "#FFB0A8");
    g.globalAlpha = 1;
  }

  function drawGlows(g) {
    if (!isNight() || isBrownout()) return;
    for (const b of buildings) {
      if (!b.done || b.protested > state.time) continue;
      if (b.kind !== "dc" && b.kind !== "mcs" && b.kind !== "bess" && b.kind !== "lounge") continue;
      if (!tileSeen(b.col, b.row)) continue;
      const p = iso(b.col + b.w / 2, b.row + b.h / 2);
      const col = b.kind === "bess" || b.kind === "mcs" ? "0,212,245" : "232,154,46";
      const y = p.y - 18;
      const rad = g.createRadialGradient(p.x, y, 2, p.x, y, 48);
      rad.addColorStop(0, `rgba(${col},0.95)`);
      rad.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = rad;
      g.beginPath();
      g.arc(p.x, y, 48, 0, Math.PI * 2);
      g.fill();
    }
  }

  function drawPins() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const byId = Object.fromEntries(cities.map((c) => [c.id, c]));
    ctx.strokeStyle = "rgba(58,40,24,0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (const [a, b] of links) {
      const pa = worldToScreen(byId[a].col, byId[a].row);
      const pb = worldToScreen(byId[b].col, byId[b].row);
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();
    for (const city of cities) {
      const c = clamp(city.col | 0, 0, COLS - 1);
      const r = clamp(city.row | 0, 0, ROWS - 1);
      if (vis[idx(c, r)] < 1 && state.shot !== "region") continue;
      const p = worldToScreen(city.col, city.row);
      ctx.fillStyle = city.owner ? FACTION_COLOR[city.owner] : "#8A8175";
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#F7F1E4";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 16);
      ctx.lineTo(p.x + 8, p.y - 8);
      ctx.lineTo(p.x - 8, p.y - 8);
      ctx.fill();
      ctx.fillStyle = city.owner ? FACTION_COLOR[city.owner] : "#6A6258";
      ctx.fillRect(p.x - 6, p.y - 8, 12, 8);
      ctx.font = "700 12px Barlow Condensed, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(245,236,214,0.9)";
      ctx.strokeText(city.name, p.x, p.y + 18);
      ctx.fillStyle = "#2A2118";
      ctx.fillText(city.name, p.x, p.y + 18);
    }
  }

  function seen(col, row) {
    const c = clamp(col | 0, 0, COLS - 1);
    const r = clamp(row | 0, 0, ROWS - 1);
    if (state.shot === "vehicles" || state.shot === "region" || state.shot === "convoy" || state.shot === "night") return vis[idx(c, r)] >= 1;
    return vis[idx(c, r)] === 2;
  }
  function tileSeen(col, row) {
    const c = clamp(col | 0, 0, COLS - 1);
    const r = clamp(row | 0, 0, ROWS - 1);
    return vis[idx(c, r)] >= 1;
  }

  function drawShimmer(g) {
    const t = performance.now() / 1000;
    const corners = [screenToWorld(0, 0), screenToWorld(viewW(), 0), screenToWorld(0, viewH()), screenToWorld(viewW(), viewH())];
    let c0 = COLS, c1 = 0, r0 = ROWS, r1 = 0;
    for (const p of corners) {
      c0 = Math.min(c0, p.col);
      c1 = Math.max(c1, p.col);
      r0 = Math.min(r0, p.row);
      r1 = Math.max(r1, p.row);
    }
    c0 = clamp(Math.floor(c0) - 1, 0, COLS - 1);
    c1 = clamp(Math.ceil(c1) + 1, 0, COLS - 1);
    r0 = clamp(Math.floor(r0) - 1, 0, ROWS - 1);
    r1 = clamp(Math.ceil(r1) + 1, 0, ROWS - 1);
    g.lineWidth = 1.2;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (biome[idx(c, r)] !== WATER) continue;
        if (vis[idx(c, r)] === 0 && state.shot !== "region") continue;
        const wobble = Math.sin(t * 1.7 + c * 0.65 + r * 0.4) * 0.07;
        const a = iso(c + 0.22, r + 0.42 + wobble);
        const b = iso(c + 0.78, r + 0.58 - wobble * 0.4);
        g.strokeStyle = `rgba(220,245,255,${0.28 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.2 + c + r))})`;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
    }
  }

  function draw() {
    paintMaps();
    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#C4A474";
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(camera.zoom, 0, 0, camera.zoom, camera.x, camera.y);
    ctx.drawImage(landCanvas, ORIGIN_X, ORIGIN_Y);
    ctx.drawImage(fogCanvas, ORIGIN_X, ORIGIN_Y);
    drawShimmer(ctx);
    if (state.age >= 1) {
      ctx.fillStyle = state.age >= 2 ? "rgba(198,194,186,0.72)" : "rgba(52,54,60,0.78)";
      for (const city of cities) {
        if (city.owner !== FACTION.zaps || !tileSeen(city.col, city.row)) continue;
        poly(ctx, [
          iso(city.col - 3, city.row - 3),
          iso(city.col + 4, city.row - 3),
          iso(city.col + 4, city.row + 4),
          iso(city.col - 3, city.row + 4),
        ]);
        ctx.fill();
      }
    }
    for (const city of cities) if (tileSeen(city.col, city.row)) drawFence(ctx, city);
    const drawables = [];
    for (const n of nodes) drawables.push({ z: depthY(n.col, n.row), draw: () => seen(n.col, n.row) && drawNode(ctx, n) });
    for (const b of buildings) drawables.push({ z: depthY(b.col + b.w / 2, b.row + b.h / 2), draw: () => tileSeen(b.col, b.row) && drawBuilding(ctx, b) });
    for (const u of units) drawables.push({ z: depthY(u.col, u.row), draw: () => seen(u.col, u.row) && drawUnit(ctx, u) });
    for (const v of vehicles) drawables.push({ z: depthY(v.col, v.row), draw: () => (state.shot === "vehicles" || state.shot === "traffic" || seen(v.col, v.row)) && drawVehicle(ctx, v) });
    for (const c of convoys) if (!c.done) drawables.push({ z: depthY(c.col, c.row) + 0.2, draw: () => (state.shot === "convoy" || seen(c.col, c.row)) && drawConvoy(ctx, c) });
    drawables.sort((a, b) => a.z - b.z);
    for (const d of drawables) d.draw();
    for (const d of dust) {
      const p = iso(d.col + Math.sin(d.a) * 0.8, d.row + (d.a % 6));
      if (!seen(d.col, d.row) && state.shot !== "night") continue;
      ctx.fillStyle = "rgba(196,164,116,0.35)";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 12, 4, d.a, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const hk of hawks) {
      const p = iso(hk.col + hk.a * 3, hk.row + Math.sin(hk.a) * 2);
      ctx.strokeStyle = "rgba(30,30,36,0.7)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x - 7, p.y);
      ctx.lineTo(p.x, p.y + 3);
      ctx.lineTo(p.x + 7, p.y);
      ctx.stroke();
    }
    for (const city of cities) {
      if (city.contest > 0.02 && seen(city.col, city.row)) {
        const p = iso(city.col, city.row - 1.2);
        ctx.fillStyle = "rgba(30,30,36,0.75)";
        ctx.fillRect(p.x - 22, p.y - 16, 44, 8);
        ctx.fillStyle = FACTION_COLOR[city.attacker] || AMBER;
        ctx.fillRect(p.x - 22, p.y - 16, 44 * city.contest, 8);
        ctx.fillStyle = CREAM;
        ctx.font = "700 11px Barlow Condensed, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CONTEST", p.x, p.y - 20);
      }
    }
    drawGhost(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (isNight()) {
      ctx.fillStyle = "rgba(10,16,40,0.5)";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.setTransform(camera.zoom, 0, 0, camera.zoom, camera.x, camera.y);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    drawGlows(ctx);
    ctx.restore();
    if (camera.zoom < 0.52) drawPins();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (state.marquee) {
      const m = state.marquee;
      const x = Math.min(m.x1, m.x2);
      const y = Math.min(m.y1, m.y2);
      ctx.fillStyle = "rgba(0,212,245,0.14)";
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, Math.abs(m.x2 - m.x1), Math.abs(m.y2 - m.y1));
      ctx.strokeRect(x, y, Math.abs(m.x2 - m.x1), Math.abs(m.y2 - m.y1));
    }
    paintMinimapFrame();
  }

  function paintMinimapFrame() {
    if (!mini._img) return;
    mctx.putImageData(mini._img, 0, 0);
    const dot = { 1: RED, 2: AMBER, 3: CYAN, 4: VIOLET, 5: "#C45CFF", 6: CREAM };
    for (const u of units) {
      if (u.garrison) continue;
      mctx.fillStyle = dot[u.faction] || CREAM;
      mctx.fillRect(u.col - 0.5, u.row - 0.5, 2, 2);
    }
    for (const c of convoys) {
      if (c.done) continue;
      mctx.fillStyle = CYAN;
      mctx.fillRect(c.col - 1, c.row - 1, 3, 3);
    }
    const pulse = 0.45 + 0.55 * Math.sin(performance.now() / 180);
    for (const ping of state.pings) {
      if (!ping.hold && ping.life <= 0) continue;
      mctx.strokeStyle = `rgba(232,154,46,${0.45 + pulse * 0.55})`;
      mctx.lineWidth = 1.5;
      mctx.beginPath();
      mctx.arc(ping.col, ping.row, 6 + pulse * 7, 0, Math.PI * 2);
      mctx.stroke();
      if (!ping.hold) ping.life -= 0.02;
    }
    state.pings = state.pings.filter((p) => p.hold || p.life > 0);
    const corners = [screenToWorld(0, 0), screenToWorld(viewW(), 0), screenToWorld(viewW(), viewH()), screenToWorld(0, viewH())];
    mctx.strokeStyle = CREAM;
    mctx.lineWidth = 1;
    mctx.beginPath();
    corners.forEach((p, i) => (i ? mctx.lineTo(p.col, p.row) : mctx.moveTo(p.col, p.row)));
    mctx.closePath();
    mctx.stroke();
  }

  function showBanner(text) {
    const el = $("age-banner");
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle("hold", state.holdBanner);
    if (!state.holdBanner) setTimeout(() => { if (!state.holdBanner) el.hidden = true; }, 2800);
  }

  function focusCity() {
    const w = screenToWorld(viewW() / 2, viewH() / 2);
    let best = cities[0];
    let d = 1e9;
    for (const c of cities) {
      const dd = Math.hypot(c.col - w.col, c.row - w.row);
      if (dd < d) { d = dd; best = c; }
    }
    return best;
  }
  function sharePct() {
    let owned = 0;
    let total = 0;
    for (const c of cities) {
      total += c.demand;
      if (c.owner === FACTION.zaps) owned += c.demand;
    }
    return total ? Math.round((100 * owned) / total) : 0;
  }

  function portraitSpriteId(ent) {
    if (!ent) return null;
    if (ent.kind === "crew") return spriteKey("crew");
    if (ent.w || VEHICLES[ent.kind]) return spriteKey(ent.kind);
    return null;
  }
  function blitPortrait(id) {
    const rec = spriteRecord(id);
    const cnv = $("select-portrait");
    const g = cnv.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#141418";
    g.fillRect(0, 0, 160, 160);
    if (!rec?.img?.naturalWidth) return false;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    const img = rec.img;
    const box = rec.bounds || { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
    const fit = Math.min(148 / box.w, 140 / box.h);
    const dw = img.naturalWidth * fit;
    const dh = img.naturalHeight * fit;
    const ox = (box.x + box.w / 2) * fit;
    const oy = (box.y + box.h / 2) * fit;
    g.drawImage(img, 80 - ox, 82 - oy, dw, dh);
    return true;
  }
  function paintPortrait(ent) {
    const id = portraitSpriteId(ent);
    if (id && blitPortrait(id)) return;
    const cnv = $("select-portrait");
    const g = cnv.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#141418";
    g.fillRect(0, 0, 160, 160);
    if (!ent) return;
    g.save();
    state.portrait = true;
    try {
      const anchor = ent.w ? iso(ent.col + ent.w / 2, ent.row + ent.h / 2) : iso(ent.col, ent.row);
      const span = ent.w ? (ent.w + ent.h) * (TW / 2) : 40;
      const scale = ent.w ? Math.min(1.15, 140 / span) : 2.3;
      const foot = ent.w ? 128 : 108;
      g.setTransform(scale, 0, 0, scale, 80 - anchor.x * scale, foot - anchor.y * scale);
      if (ent.w) drawBuilding(g, ent);
      else if (VEHICLES[ent.kind]) drawVehicle(g, ent);
      else drawUnit(g, ent);
    } finally {
      state.portrait = false;
      g.restore();
    }
  }

  function renderNotes() {
    const root = $("notes");
    if (!root) return;
    root.innerHTML = "";
    for (const n of state.notes.slice(0, 5)) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "note" + (n.kind === "attack" ? " attack" : "");
      el.textContent = n.text;
      el.addEventListener("click", () => { if (n.col != null) focus(n.col, n.row, Math.max(camera.zoom, 0.8)); });
      root.appendChild(el);
    }
  }

  function syncHud() {
    $("res-capital").textContent = money(state.res.capital);
    const used = gridUsed();
    const cap = gridCap();
    $("res-grid").textContent = `${used % 1 ? used.toFixed(1) : used}/${cap}`;
    $("chip-grid").classList.toggle("brown", isBrownout());
    $("res-permits").textContent = Math.floor(state.res.permits);
    $("res-copper").textContent = Math.floor(state.res.copper);
    $("res-steel").textContent = Math.floor(state.res.steel);
    const idle = idleCrews().length;
    const total = units.filter((u) => u.faction === FACTION.zaps && u.kind === "crew").length;
    $("res-crews").textContent = `${idle}/${total}`;
    const hh = Math.floor(state.hour) % 24;
    const mm = Math.floor((state.hour % 1) * 60);
    $("clock").textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    for (const id of ["0", "1", "2", "4"]) {
      const btn = $("spd-" + id);
      if (btn) btn.classList.toggle("on", String(state.speed) === id);
    }
    $("age-name").textContent = AGES[state.age].name;
    $("age-emblem").textContent = AGES[state.age].numeral;
    const city = focusCity();
    $("city-name").textContent = city ? city.name : "West";
    $("share").textContent = `${sharePct()}%`;
    const gate = ageGate();
    const ageBtn = $("btn-age");
    const next = AGES[state.age + 1];
    ageBtn.disabled = !!gate;
    ageBtn.textContent = gate || (next ? `Research ${next.name.replace(" AGE", "")}` : "Final age");
    const idleBtn = $("btn-idle");
    idleBtn.textContent = String(idle);
    idleBtn.classList.toggle("hot", idle > 0);
    for (const btn of document.querySelectorAll("#cmd button")) {
      const spec = BUILD[btn.dataset.build];
      if (!spec) continue;
      const locked = spec.age != null && state.age < spec.age;
      const poor = !canAfford(spec.cost);
      const full = spec.train && popUsed() >= popCap();
      btn.disabled = locked || poor || full;
      btn.classList.toggle("locked", locked);
      btn.classList.toggle("poor", poor || full);
      btn.classList.toggle("armed", state.build === btn.dataset.build);
    }
    const selected = [...selection].map((id) => units.find((u) => u.id === id) || buildings.find((b) => b.id === id)).filter(Boolean);
    const first = selected[0];
    const price = $("price-wrap");
    const garrBtn = $("btn-garrison");
    const lawBtn = $("btn-lawyer");
    price.hidden = true;
    garrBtn.hidden = true;
    lawBtn.hidden = true;
    const slots = $("garrison");
    slots.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const s = document.createElement("i");
      slots.appendChild(s);
    }
    if (!first) {
      const looked = focusCity();
      const city = looked && looked.owner === FACTION.zaps
        ? looked
        : (cities.find((c) => c.id === "phoenix" && c.owner === FACTION.zaps) || cities.find((c) => c.owner === FACTION.zaps));
      const hq = buildings.find((b) => b.kind === "hq" && b.faction === FACTION.zaps && city && Math.hypot(b.col + b.w / 2 - city.col, b.row + b.h / 2 - city.row) < 6)
        || buildings.find((b) => b.kind === "hq" && b.faction === FACTION.zaps);
      const share = sharePct();
      const built = buildings.filter((b) => b.faction === FACTION.zaps && b.done).length;
      const noun = built === 1 ? "building" : "buildings";
      $("select-name").textContent = city ? city.name : "Western Interconnect";
      $("select-meta").textContent = city
        ? `${AGES[state.age].name} · ${share}% share · ${built} ${noun}`
        : "Box-select crews. Right-click to move or work.";
      $("select-bar").style.width = hq ? "100%" : "0";
      $("bar-use").style.width = "0";
      $("bar-queue").style.width = "0";
      paintPortrait(hq || null);
    } else if (first.faction && !first.w) {
      const label = first.kind === "scout" ? "Scout van" : first.kind === "van" ? "Raid van" : "Crew truck";
      $("select-name").textContent = selected.length > 1 ? `${selected.length} units` : label;
      $("select-meta").textContent = `${FACTION_NAME[first.faction]} · ${first.job ? first.job.type : "idle"}`;
      $("select-bar").style.width = `${Math.round((first.hp || 1) * 100)}%`;
      $("bar-use").style.width = first.job ? "100%" : "0%";
      $("bar-queue").style.width = "0%";
      paintPortrait(first);
    } else {
      $("select-name").textContent = BUILD[first.kind]?.name || first.kind;
      $("select-meta").textContent = first.done ? `${FACTION_NAME[first.faction]} · online` : `Raising ${Math.round(first.progress * 100)}%`;
      $("select-bar").style.width = first.done ? "100%" : `${Math.round(first.progress * 100)}%`;
      const mine = vehicles.filter((v) => v.buildingId === first.id && v.phase !== "leave" && v.phase !== "cruise");
      const capN = first.kind === "dc" || first.kind === "mcs" ? stallCap(first) : 1;
      $("bar-use").style.width = `${Math.round(clamp(mine.length / capN, 0, 1) * 100)}%`;
      const q = (first.queue ? first.queue.length : 0) + mine.filter((v) => v.phase === "queue").length;
      $("bar-queue").style.width = `${Math.min(100, q * 25)}%`;
      const held = units.filter((u) => u.garrison === first.id);
      [...slots.children].forEach((s, i) => s.classList.toggle("on", i < held.length));
      if (first.kind === "hq" || first.kind === "market") price.hidden = false;
      if (first.kind === "hq" && first.faction === FACTION.zaps) garrBtn.hidden = false;
      if (first.kind === "permit" && first.faction === FACTION.zaps) lawBtn.hidden = false;
      paintPortrait(first);
    }
    renderNotes();
  }

  function cardSlots() { return CARD_PAGES[state.cardPage]; }
  function costTitle(spec) {
    const bits = [];
    if (spec.cost) {
      for (const [k, v] of Object.entries(spec.cost)) {
        if (k === "capital") bits.push(money(v));
        else bits.push(`${v} ${k}`);
      }
    }
    if (spec.mw) bits.push(`${spec.mw} MW`);
    if (spec.mwAdd) bits.push(`+${spec.mwAdd} MW`);
    if (spec.age) bits.push(AGES[spec.age].name);
    return `${spec.name} — ${bits.join(" · ") || "ready"}`;
  }
  function buildCard() {
    const root = $("cmd");
    root.innerHTML = "";
    cardSlots().forEach((id, i) => {
      const spec = BUILD[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.build = id;
      btn.innerHTML = `<kbd>${HOTKEYS[i].toUpperCase()}</kbd>${ICONS[id] || ""}<span>${spec.name}</span>`;
      btn.title = costTitle(spec);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (btn.disabled) return;
        if (spec.train) train(spec.train);
        else state.build = state.build === id ? null : id;
        syncHud();
      });
      root.appendChild(btn);
    });
  }

  function cycleIdle() {
    const idle = idleCrews();
    if (!idle.length) return;
    state.idleIx = (state.idleIx + 1) % idle.length;
    const u = idle[state.idleIx];
    selection.clear();
    selection.add(u.id);
    focus(u.col, u.row, Math.max(camera.zoom, 1));
    syncHud();
  }
  function setSpeed(n) { state.speed = n; syncHud(); }

  function pickAt(sx, sy) {
    const w = screenToWorld(sx, sy);
    let best = null;
    let bestD = 0.72;
    for (const u of units) {
      if (u.garrison || !seen(u.col, u.row)) continue;
      const d = Math.hypot(u.col - w.col, u.row - w.row);
      if (d < bestD) { bestD = d; best = u; }
    }
    if (best) return best;
    const c = Math.floor(w.col);
    const r = Math.floor(w.row);
    if (inside(c, r) && vis[idx(c, r)] >= 1) {
      const b = buildingAt(c, r);
      if (b) return b;
      return nodes.find((n) => Math.hypot(n.col - w.col, n.row - w.row) < 0.65) || null;
    }
    return null;
  }

  function commandAt(sx, sy) {
    const w = screenToWorld(sx, sy);
    const crews = selectedCrews();
    const node = nodes.find((n) => Math.hypot(n.col - w.col, n.row - w.row) < 0.75);
    if (node && crews.length) {
      crews.forEach((crew) => {
        const pack = node.kind === "hall" ? { k: "permits", n: 2 } : { k: Math.random() < 0.55 ? "copper" : "steel", n: 12 };
        crew.job = { type: "gather", c: node.col, r: node.row, phase: "out", work: 3, pack };
      });
      return;
    }
    const c = Math.floor(w.col);
    const r = Math.floor(w.row);
    const b = inside(c, r) ? buildingAt(c, r) : null;
    if (b && b.kind === "hq" && b.done && crews.length) {
      crews.forEach((crew) => { crew.garrison = b.id; crew.job = null; });
      return;
    }
    if (b && !b.done && crews.length) {
      crews.forEach((crew, i) => { crew.job = { type: "build", id: b.id, c: b.col + b.w + 0.35, r: b.row + i * 0.4 }; });
      return;
    }
    const vans = units.filter((u) => selection.has(u.id) && u.kind === "van");
    const city = cities.find((ct) => Math.hypot(ct.col - w.col, ct.row - w.row) < 3 && ct.owner && ct.owner !== FACTION.zaps);
    if (city && vans.length) {
      vans.forEach((u) => { u.job = { type: "raid", c: city.col, r: city.row }; });
      return;
    }
    const movers = crews.length ? crews : units.filter((u) => selection.has(u.id) && u.faction === FACTION.zaps && !u.garrison);
    movers.forEach((u, i) => { u.job = { type: "move", c: w.col + (i % 3) * 0.4, r: w.row + Math.floor(i / 3) * 0.4 }; });
  }

  function boxSelect(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    if (!keys["shift"]) selection.clear();
    for (const u of units) {
      if (u.faction !== FACTION.zaps || u.garrison) continue;
      const p = worldToScreen(u.col, u.row);
      if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) selection.add(u.id);
    }
  }

  function bind() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (e) => {
      if (e.target && e.target.matches && e.target.matches("input, textarea")) return;
      keys[e.key.toLowerCase()] = true;
      const k = e.key.toLowerCase();
      if (k === "tab") {
        e.preventDefault();
        state.cardPage = state.cardPage ? 0 : 1;
        state.build = null;
        buildCard();
        syncHud();
        return;
      }
      if (e.repeat) return;
      const slot = HOTKEYS.indexOf(k);
      if (slot >= 0) {
        e.preventDefault();
        const id = cardSlots()[slot];
        const spec = BUILD[id];
        const locked = spec.age != null && state.age < spec.age;
        if (!locked && canAfford(spec.cost)) {
          if (spec.train) train(spec.train);
          else state.build = state.build === id ? null : id;
        }
      }
      if (k === ".") { e.preventDefault(); cycleIdle(); }
      if (k === "escape") state.build = null;
      if (k === " " || k === "p") { e.preventDefault(); setSpeed(state.speed === 0 ? 1 : 0); }
      if (k === "1") setSpeed(1);
      if (k === "2") setSpeed(2);
      if (k === "4") setSpeed(4);
      syncHud();
    });
    window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => {
      pointer.inside = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (e.button === 1 || (e.button === 2 && e.altKey)) { pan = { x: e.clientX, y: e.clientY }; return; }
      if (e.button === 2) {
        if (state.build) state.build = null;
        else commandAt(e.clientX, e.clientY);
        syncHud();
        return;
      }
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, moved: false };
    });
    canvas.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      if (pan) {
        camera.x += e.clientX - pan.x;
        camera.y += e.clientY - pan.y;
        pan.x = e.clientX;
        pan.y = e.clientY;
        clampCamera();
        return;
      }
      if (!drag) return;
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
        drag.moved = true;
        state.marquee = { x1: drag.x, y1: drag.y, x2: e.clientX, y2: e.clientY };
      }
    });
    window.addEventListener("pointerup", (e) => {
      if (pan && (e.button === 1 || e.button === 2)) { pan = null; return; }
      if (!drag || e.button !== 0) return;
      if (drag.moved) boxSelect(drag.x, drag.y, e.clientX, e.clientY);
      else if (state.build) {
        const w = screenToWorld(e.clientX, e.clientY);
        placeBuilding(state.build, Math.floor(w.col), Math.floor(w.row));
      } else {
        const hit = pickAt(e.clientX, e.clientY);
        if (!keys["shift"]) selection.clear();
        if (hit && hit.id) selection.add(hit.id);
      }
      drag = null;
      if (!state.marqueeHold) state.marquee = null;
      else state.marquee = state.marqueeHold;
      syncHud();
    });
    canvas.addEventListener("pointerleave", () => { pointer.inside = false; });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const before = screenToWorld(e.clientX, e.clientY);
      camera.zoom = clamp(camera.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 0.32, 1.85);
      const p = iso(before.col, before.row);
      camera.x = e.clientX - p.x * camera.zoom;
      camera.y = e.clientY - p.y * camera.zoom;
      clampCamera();
    }, { passive: false });
    mini.addEventListener("pointerdown", (e) => {
      const rect = mini.getBoundingClientRect();
      focus(((e.clientX - rect.left) / rect.width) * COLS, ((e.clientY - rect.top) / rect.height) * ROWS, Math.max(camera.zoom, 0.7));
    });
    $("btn-age").addEventListener("click", () => {
      if (ageGate()) return;
      const next = AGES[state.age + 1];
      payCost(next.cost);
      state.aging = { to: state.age + 1, left: next.time, total: next.time };
      syncHud();
    });
    $("btn-idle").addEventListener("click", (e) => { e.stopPropagation(); cycleIdle(); });
    $("spd-0").addEventListener("click", () => setSpeed(0));
    $("spd-1").addEventListener("click", () => setSpeed(1));
    $("spd-2").addEventListener("click", () => setSpeed(2));
    $("spd-4").addEventListener("click", () => setSpeed(4));
    $("price-slider").addEventListener("input", (e) => { state.tariff = Number(e.target.value) / 100; });
    $("btn-garrison").addEventListener("click", () => {
      const hq = [...selection].map((id) => buildings.find((b) => b.id === id)).find((b) => b && b.kind === "hq");
      if (!hq) return;
      const crews = selectedCrews();
      if (crews.length) crews.forEach((c) => { c.garrison = hq.id; c.job = null; });
      else units.filter((u) => u.garrison === hq.id).forEach((u) => { u.garrison = null; u.col = hq.col + hq.w + 0.4; u.row = hq.row + hq.h; });
      syncHud();
    });
    $("btn-lawyer").addEventListener("click", () => {
      for (const b of buildings) if (b.protested > state.time) b.protested = 0;
      notify("Lawyer cleared the protest", "info", phx().col, phx().row);
      syncHud();
    });
  }

  function resize() {
    canvas.width = Math.max(1, canvas.clientWidth);
    canvas.height = Math.max(1, canvas.clientHeight);
    if (state.shot) frameShot(state.shot);
  }

  function parkVehicle(kind, col, row, phase, extra) {
    const spec = VEHICLES[kind];
    vehicles.push({
      id: "v" + (++seq), kind, buildingId: extra?.buildingId || null,
      col, row, facing: 1, path: [{ c: col, r: row }], i: 0, phase, queueing: phase === "queue",
      wait: phase === "queue" ? 6 : 0, cable: phase === "cable" ? 0.4 : 0,
      charge: phase === "charge" ? (spec.kWh / 18) * 0.55 : 0,
      speed: 0, fare: extra?.fare || Math.round(spec.kWh * 8), holdPay: phase === "pay",
      label: extra?.label || "",
    });
  }

  function applyShot(name) {
    state.shot = name;
    state.frozen = true;
    const city = phx();
    if (name === "region") {
      for (let i = 0; i < vis.length; i++) vis[i] = (i % COLS) < 8 ? 0 : 1;
      for (const c of cities) if (c.owner) revealDisk(c.col, c.row, 8, 2);
      fogDirty = true;
    } else if (name === "compound") {
      state.age = 2;
      dressCompound(city, true);
      revealDisk(city.col, city.row, 24, 2);
    } else if (name === "build") {
      const b = makeBuilding("dc", city.col + 1, city.row - 2, FACTION.zaps, 0.5);
      buildings.push(b);
      const crew = units.find((u) => u.faction === FACTION.zaps && u.kind === "crew");
      crew.col = b.col + b.w + 0.45;
      crew.row = b.row + 0.35;
      crew.job = { type: "build", id: b.id, c: crew.col, r: crew.row };
      selection.add(crew.id);
      revealDisk(city.col, city.row, 18, 2);
    } else if (name === "select") {
      const crews = units.filter((u) => u.faction === FACTION.zaps && u.kind === "crew");
      crews.forEach((u, i) => {
        u.col = city.col - 0.2 + i * 0.75;
        u.row = city.row + 1.5;
        selection.add(u.id);
      });
      revealDisk(city.col, city.row, 16, 2);
    } else if (name === "age") {
      state.age = 1;
      state.holdBanner = true;
      buildings.push(makeBuilding("dc", city.col + 1, city.row - 2, FACTION.zaps, 1));
      buildings.push(makeBuilding("warehouse", city.col + 1, city.row + 1, FACTION.zaps, 1));
      buildings.push(makeBuilding("bess", city.col - 1, city.row + 2, FACTION.zaps, 1));
      revealDisk(city.col, city.row, 18, 2);
    } else if (name === "vehicles") {
      for (let i = 0; i < vis.length; i++) vis[i] = 2;
      fogDirty = true;
      ["hatch", "sedan", "suv", "pickup", "van", "box", "semi", "bus"].forEach((kind, i) => {
        parkVehicle(kind, 100 + (i % 4) * 2.4, 36 + Math.floor(i / 4) * 3.4, "charge", { label: VEHICLES[kind].name });
      });
    } else if (name === "contest") {
      const flag = cities.find((c) => c.id === "flagstaff");
      setPlotOwner(flag, FACTION.zaps);
      const rival = units.find((u) => u.faction === FACTION.voltspan);
      rival.col = flag.col + 1.1;
      rival.row = flag.row + 0.3;
      rival.job = { type: "contest", c: rival.col, r: rival.row };
      flag.contest = 0.66;
      flag.attacker = FACTION.voltspan;
      const crew = units.find((u) => u.faction === FACTION.zaps && u.kind === "crew");
      crew.col = flag.col - 4.4;
      crew.row = flag.row + 1;
      revealDisk(flag.col, flag.row, 12, 2);
    } else if (name === "traffic") {
      const dc = makeBuilding("dc", city.col + 1, city.row - 1, FACTION.zaps, 1);
      buildings.push(dc);
      parkVehicle("hatch", city.col + 3.4, city.row + 2.5, "drive", { buildingId: dc.id });
      parkVehicle("sedan", city.col + 1.3, city.row + 1.7, "queue", { buildingId: dc.id });
      parkVehicle("suv", dc.col + 0.15, dc.row + 1.25, "cable", { buildingId: dc.id });
      parkVehicle("sedan", dc.col + 0.85, dc.row + 1.45, "charge", { buildingId: dc.id });
      parkVehicle("hatch", dc.col + 0.4, dc.row + 0.85, "pay", { buildingId: dc.id, fare: 320 });
      revealDisk(city.col, city.row, 16, 2);
    } else if (name === "convoy") {
      const vegas = cities.find((c) => c.id === "vegas");
      let best = null;
      let bestD = 1e9;
      const mx = (vegas.col + city.col) / 2;
      const my = (vegas.row + city.row) / 2;
      lineTiles(vegas, city, (c, r) => {
        const d = Math.hypot(c - mx, r - my);
        if (d < bestD) { bestD = d; best = { c, r }; }
      });
      convoys.push({
        id: "c" + (++seq), faction: FACTION.voltspan,
        col: best.c + 0.5, row: best.r + 0.5, path: [], i: 0,
        dest: "phoenix", eta: 42, max: 76, speed: 0, done: false,
      });
      revealDisk(best.c, best.r, 14, 2);
    } else if (name === "alert") {
      state.notes.unshift({ text: "Undercut! VOLTSPAN undercut Phoenix!", kind: "attack", col: city.col, row: city.row });
      state.pings.push({ col: city.col, row: city.row, life: 1, hold: true });
      revealDisk(city.col, city.row, 16, 2);
    } else if (name === "night") {
      state.age = 2;
      state.hour = 21.5;
      dressCompound(city, false);
      revealDisk(city.col, city.row, 20, 2);
    }
  }

  function dressCompound(city, withCars) {
    const c = city.col;
    const r = city.row;
    const add = (kind, col, row) => {
      if (!buildings.some((b) => b.kind === kind && b.col === col && b.row === row)) {
        buildings.push(makeBuilding(kind, col, row, FACTION.zaps, 1));
      }
    };
    add("bess", c, r - 3);
    add("dc", c + 2, r - 3);
    add("dc", c + 3, r - 3);
    add("lounge", c, r - 1);
    add("warehouse", c + 2, r - 1);
    add("mcs", c - 3, r + 1);
    add("market", c, r + 2);
    add("substation", c + 2, r + 1);
    if (!withCars) return;
    const left = buildings.find((b) => b.kind === "dc" && b.col === c + 2);
    const right = buildings.find((b) => b.kind === "dc" && b.col === c + 3);
    parkVehicle("sedan", c + 2.15, r - 2.05, "charge", { buildingId: left.id });
    parkVehicle("hatch", c + 3.15, r - 1.9, "cable", { buildingId: right.id });
    parkVehicle("suv", c + 0.4, r - 2.15, "drive");
  }

  function frameShot(name) {
    const city = phx();
    if (name === "region") {
      const c = cities.reduce((s, x) => s + x.col, 0) / cities.length;
      const r = cities.reduce((s, x) => s + x.row, 0) / cities.length;
      focus(c, r - 1, 0.4);
    } else if (name === "compound" || name === "night") focus(city.col + 0.35, city.row + 0.15, 0.92);
    else if (name === "age") focus(city.col + 0.4, city.row + 0.6, 1.48);
    else if (name === "build") focus(city.col + 1.4, city.row - 1.2, 1.4);
    else if (name === "select") {
      focus(city.col + 0.6, city.row + 1.5, 1.15);
      const crews = units.filter((u) => selection.has(u.id));
      const pts = crews.map((u) => worldToScreen(u.col, u.row));
      state.marqueeHold = {
        x1: Math.min(...pts.map((p) => p.x)) - 28,
        y1: Math.min(...pts.map((p) => p.y)) - 24,
        x2: Math.max(...pts.map((p) => p.x)) + 28,
        y2: Math.max(...pts.map((p) => p.y)) + 22,
      };
      state.marquee = state.marqueeHold;
    } else if (name === "vehicles") focus(103.2, 37.8, 1.28);
    else if (name === "contest") {
      const f = cities.find((c) => c.id === "flagstaff");
      focus(f.col, f.row, 1.05);
    } else if (name === "traffic") focus(city.col + 1.2, city.row + 0.8, 1.28);
    else if (name === "convoy") {
      const c = convoys[convoys.length - 1];
      focus(c.col, c.row, 1.2);
    } else if (name === "alert") focus(city.col, city.row + 0.4, 0.95);
  }

  function fast(seconds) {
    const steps = Math.max(1, Math.round(seconds / 0.05));
    for (let i = 0; i < steps; i++) simulate(0.05);
    syncHud();
    draw();
  }

  function prepFleet() {
    const city = phx();
    const spots = [[2, -3], [3, -3], [-3, 2], [3, -1], [0, 3], [3, 2], [-3, 3], [2, 3]];
    let guard = 0;
    while (buildings.filter((b) => b.kind === "dc" && b.faction === FACTION.zaps && b.done).length < 4 && guard++ < 12) {
      let placed = false;
      for (const [dc, dr] of spots) {
        const c = city.col + dc;
        const r = city.row + dr;
        if (fits("dc", c, r, FACTION.zaps)) {
          buildings.push(makeBuilding("dc", c, r, FACTION.zaps, 1));
          placed = true;
          break;
        }
      }
      if (!placed) break;
    }
    if (!buildings.some((b) => b.kind === "warehouse" && b.faction === FACTION.zaps && b.done)) {
      const tries = [[1, 2], [-1, 2], [1, 1], [-3, 1], [0, 2]];
      for (const [dc, dr] of tries) {
        const c = city.col + dc;
        const r = city.row + dr;
        if (fits("warehouse", c, r, FACTION.zaps)) {
          buildings.push(makeBuilding("warehouse", c, r, FACTION.zaps, 1));
          break;
        }
      }
    }
    state.res.capital = Math.max(state.res.capital, 250000);
    state.res.steel = Math.max(state.res.steel, 80);
    state.res.permits = Math.max(state.res.permits, 40);
    syncHud();
    return {
      dc: buildings.filter((b) => b.kind === "dc" && b.faction === FACTION.zaps && b.done).length,
      warehouse: buildings.some((b) => b.kind === "warehouse" && b.faction === FACTION.zaps && b.done),
      gate: ageGate(),
    };
  }

  function boot() {
    buildTerrain();
    const params = new URLSearchParams(location.search);
    const shot = params.get("shot");
    seedStart(!shot || shot === "build" || shot === "select");
    if (shot) applyShot(shot);
    else {
      refreshVision();
      const vegas = cities.find((c) => c.id === "vegas");
      if (vegas) launchConvoy(FACTION.voltspan, vegas);
    }
    buildCard();
    bind();
    resize();
    if (!shot) focus(phx().col, phx().row + 0.4, 0.92);
    if (shot === "age") showBanner("FLEET AGE");
    if (shot === "traffic") {
      const pay = vehicles.find((v) => v.phase === "pay");
      if (pay) spawnFloat(pay.col, pay.row, "+$320", true);
    }
    syncHud();
    loadSprites();
    const spritePoll = setInterval(() => {
      if (art.ready) { clearInterval(spritePoll); return; }
      loadSprites();
    }, 4000);
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!state.frozen) {
        if (state.speed > 0) simulate(dt * state.speed);
        doPan(dt);
      }
      draw();
      syncHud();
      fpsFrames += 1;
      fpsAcc += dt;
      if (fpsAcc >= 0.5) {
        state.fps = Math.round(fpsFrames / fpsAcc);
        fpsFrames = 0;
        fpsAcc = 0;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    window.__EMPIRE_SMOKE__ = {
      ready: true,
      sprites: () => art.ready,
      build: "empire-aoe-design",
      resources: () => ({ ...state.res, grid: gridUsed(), gridCap: gridCap() }),
      age: () => AGES[state.age].name,
      ageIndex: () => state.age,
      paid: () => state.paid,
      floats: () => state.floatCount,
      pop: () => ({ used: popUsed(), cap: popCap() }),
      fps: () => state.fps,
      selected: () => [...selection],
      vehicles: () => vehicles.map((v) => v.kind),
      vehicleTypes: () => Object.keys(VEHICLES),
      buildings: () => buildings.map((b) => ({ kind: b.kind, progress: b.progress, done: b.done, faction: b.faction })),
      notes: () => state.notes.map((n) => n.text),
      brownout: () => isBrownout(),
      convoys: () => convoys.filter((c) => !c.done).length,
      crewScreen: () => {
        const u = units.find((x) => x.faction === FACTION.zaps && x.kind === "crew" && !x.garrison);
        return worldToScreen(u.col, u.row);
      },
      padScreen: () => worldToScreen(phx().col + 1.4, phx().row - 1.6),
      fast: (s) => fast(s),
      place: (kind, col, row) => placeBuilding(kind, col, row),
      train: (kind) => train(kind),
      focus: (col, row, zoom) => focus(col, row, zoom),
      prepFleet: () => prepFleet(),
    };
  }

  let started = false;
  function start() { if (!started) { started = true; boot(); } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  setTimeout(start, 1500);
})();
