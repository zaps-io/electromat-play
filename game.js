/* ZAPS EMPIRE — one isometric Western Interconnect. AoE loop, Zaps brand. */
(() => {
  const RED = "#E63225";
  const CHAR = "#1E1E24";
  const AMBER = "#E89A2E";
  const CYAN = "#00D4F5";
  const CREAM = "#F5F0E8";

  const TW = 64;
  const TH = 32;
  const COLS = 132;
  const ROWS = 88;
  const ORIGIN_X = -ROWS * (TW / 2) - 24;
  const ORIGIN_Y = -78;
  const MAP_W = Math.ceil((COLS + ROWS) * (TW / 2) + 48);
  const MAP_H = Math.ceil((COLS + ROWS) * (TH / 2) + 100);

  const DESERT = 0, SCRUB = 1, VALLEY = 2, MOUNTAIN = 3, WATER = 4, GRAVEL = 5, ROAD = 6;
  const FACTION = { zaps: 1, voltspan: 2, gridhawk: 3, arcway: 4 };
  const FACTION_NAME = ["", "Zaps", "Voltspan", "Gridhawk", "Arcway"];
  const FACTION_COLOR = ["", RED, AMBER, CYAN, "#C6F54E"];

  const AGES = [
    { name: "PILOT AGE" },
    { name: "FLEET AGE", time: 16, cost: { capital: 700, permits: 3, copper: 60 } },
    { name: "MEGAWATT AGE", time: 22, cost: { capital: 1400, permits: 6, steel: 80, grid: 10 } },
  ];

  const BUILD = {
    hq: { name: "Site HQ", key: "q", w: 2, h: 2, age: 0, time: 14, cost: { capital: 280, copper: 40 } },
    dc: { name: "DC Row", key: "w", w: 3, h: 1, age: 0, time: 10, cost: { capital: 280, copper: 30 } },
    l2: { name: "L2 Stalls", key: "f", w: 2, h: 1, age: 0, time: 7, cost: { capital: 160, copper: 16 } },
    lounge: { name: "Lounge", key: "t", w: 2, h: 2, age: 0, time: 9, cost: { capital: 300, permits: 1 } },
    crew: { name: "Crew", key: "c", train: "crew", cost: { capital: 100 } },
    mcs: { name: "MCS Bay", key: "e", w: 3, h: 2, age: 1, time: 16, cost: { capital: 720, steel: 50, grid: 8 } },
    bess: { name: "BESS", key: "r", w: 2, h: 2, age: 1, time: 14, cost: { capital: 640, steel: 40 } },
    market: { name: "Market", key: "a", w: 2, h: 2, age: 1, time: 12, cost: { capital: 420, permits: 2, copper: 20 } },
    substation: { name: "Tie-in", key: "s", w: 2, h: 2, age: 2, time: 15, cost: { capital: 800, steel: 40, permits: 2 } },
    depot: { name: "Depot", key: "d", w: 2, h: 2, age: 2, time: 12, cost: { capital: 540, copper: 20, steel: 20 } },
    scout: { name: "Scout", key: "v", train: "scout", cost: { capital: 80 } },
  };
  const CARD = ["hq", "dc", "l2", "lounge", "crew", "mcs", "bess", "market", "substation", "depot", "scout"];

  const VEHICLES = {
    hatch: { name: "Compact EV hatch", fare: 4, w: 0.42, h: 0.62, body: 9, cab: 12, color: "#6FCB9A", roof: "#D8FFF0" },
    sedan: { name: "Sedan", fare: 6, w: 0.44, h: 0.74, body: 8, cab: 11, color: "#F5F0E8", roof: "#C9D2DC" },
    suv: { name: "SUV", fare: 8, w: 0.5, h: 0.72, body: 12, cab: 15, color: "#2A2E33", roof: "#00D4F5" },
    pickup: { name: "Pickup", fare: 7, w: 0.48, h: 0.86, body: 8, cab: 13, bed: true, color: "#E89A2E", roof: "#8A5A16" },
    van: { name: "Delivery van", fare: 9, w: 0.48, h: 0.82, body: 14, cab: 15, color: "#E63225", roof: "#F5F0E8" },
    box: { name: "Box truck", fare: 14, w: 0.52, h: 0.7, body: 16, cab: 14, trailer: { w: 0.52, h: 0.7, body: 18, color: "#E7E2D8" }, color: "#E63225", roof: "#1E1E24" },
    semi: { name: "Class 8 semi", fare: 28, w: 0.5, h: 0.55, body: 12, cab: 16, trailer: { w: 0.52, h: 1.15, body: 20, color: "#F4F1EA" }, color: "#3E4650", roof: "#1E1E24" },
    bus: { name: "Electric school bus", fare: 16, w: 0.5, h: 1.2, body: 15, cab: 16, windows: 5, color: "#F5C518", roof: "#1E1E24" },
  };

  const ICONS = {
    hq: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#E63225" d="M6 26V14L16 6l10 8v12h-7v-7h-6v7z"/></svg>`,
    dc: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#F5F0E8" d="M4 20h24v3H4z"/><path fill="#00D4F5" d="M8 14h3v6H8zm6 0h3v6h-3zm7 0h3v6h-3z"/></svg>`,
    l2: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#E89A2E" d="M5 18h22v2H5z"/><path fill="#F5F0E8" d="M9 12h2v6H9zm12 0h2v6h-2z"/></svg>`,
    lounge: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#E63225" d="M4 16h24l-3 8H7z"/><path fill="#F5F0E8" d="M8 16V11h4v5zm12 0V11h4v5z"/></svg>`,
    crew: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#F5F0E8" d="M6 16h12v6H6z"/><path fill="#E63225" d="M18 14h8v8h-8z"/></svg>`,
    mcs: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#8d9298" d="M5 12h22v12H5z"/><path fill="#00D4F5" d="M8 16h16v3H8z"/></svg>`,
    bess: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#00D4F5" d="M6 10h6v12H6zm7 2h6v10h-6zm7-2h6v12h-6z"/></svg>`,
    market: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#E89A2E" d="M6 14h20l-2 10H8z"/><path fill="#E63225" d="M4 12h24l-2 3H6z"/></svg>`,
    substation: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#E89A2E" d="M15 4h2v20h-2z"/><path fill="#F5F0E8" d="M8 22h16v4H8zM10 14h4v4h-4zm8 0h4v4h-4z"/></svg>`,
    depot: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#8d9298" d="M4 14h16v12H4z"/><path fill="#C46A3A" d="M22 18h6v8h-6z"/></svg>`,
    scout: `<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#F5F0E8" d="M7 16h16v7H7z"/><circle cx="22" cy="11" r="4" fill="none" stroke="#00D4F5" stroke-width="2"/></svg>`,
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
  const camera = { x: 0, y: 0, zoom: 0.9 };
  const keys = {};
  const pointer = { x: 0, y: 0, inside: false };
  let seq = 1;
  let landCanvas = null;
  let fogCanvas = null;
  let landDirty = true;
  let fogDirty = true;
  let miniDirty = true;
  let drag = null;
  let pan = null;
  let visionAcc = 0;
  let aiAcc = 2;
  let fpsAcc = 0;
  let fpsFrames = 0;

  const state = {
    age: 0,
    aging: null,
    res: { capital: 1600, grid: 24, permits: 8, copper: 120, steel: 60 },
    paid: 0,
    floatCount: 0,
    liveFloats: 0,
    time: 0,
    build: null,
    frozen: false,
    holdBanner: false,
    marquee: null,
    fps: 60,
    shot: null,
  };
  const selection = new Set();

  function hash(c, r) {
    let n = Math.imul(c | 0, 374761393) + Math.imul(r | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function idx(c, r) { return r * COLS + c; }
  function inside(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS; }
  function iso(col, row) {
    return { x: (col - row) * (TW / 2), y: (col + row) * (TH / 2) };
  }
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

  function canAfford(cost) {
    if (!cost) return true;
    return Object.entries(cost).every(([k, v]) => state.res[k] >= v);
  }
  function payCost(cost) {
    if (!cost) return;
    for (const [k, v] of Object.entries(cost)) state.res[k] -= v;
  }
  function popUsed() {
    return units.filter((u) => u.faction === "zaps").length;
  }
  function popCap() {
    const hqs = buildings.filter((b) => b.kind === "hq" && b.faction === "zaps" && b.done).length;
    return 8 + state.age * 4 + Math.max(0, hqs - 1) * 4;
  }

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
      id, name, demand,
      col: ((lon + 122.8) / (122.8 - 95.4)) * (COLS - 18) + 9,
      row: ((41.8 - lat) / (41.8 - 30.4)) * (ROWS - 18) + 9,
      owner: 0,
      contest: 0,
      attacker: 0,
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
    let c = a.col;
    let r = a.row;
    const dc = Math.abs(b.col - a.col);
    const dr = Math.abs(b.row - a.row);
    const sc = a.col < b.col ? 1 : -1;
    const sr = a.row < b.row ? 1 : -1;
    let err = dc - dr;
    for (;;) {
      fn(c, r);
      if (c === b.col && r === b.row) break;
      const e2 = 2 * err;
      if (e2 > -dr) { err -= dr; c += sc; }
      if (e2 < dc) { err += dc; r += sr; }
    }
  }

  function paintRiver() {
    const slc = cities.find((c) => c.id === "slc");
    const stg = cities.find((c) => c.id === "stgeorge");
    const phx = cities.find((c) => c.id === "phoenix");
    const pts = [slc, stg, { col: phx.col - 8, row: phx.row + 2 }, { col: phx.col - 6, row: ROWS - 4 }];
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
    const links = [
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
    for (let r = city.row - 3; r <= city.row + 3; r++) {
      for (let c = city.col - 3; c <= city.col + 3; c++) {
        if (inside(c, r) && plotOf[idx(c, r)] === cities.indexOf(city)) owner[idx(c, r)] = factionId;
      }
    }
    landDirty = true;
    miniDirty = true;
  }

  function cityIndex(city) { return cities.indexOf(city); }

  function spawnNode(kind, col, row, cityIndex) {
    nodes.push({ id: "n" + (++seq), kind, col, row, city: cityIndex, stock: 80 });
  }

  function nearestTile(col, row, pred) {
    for (let rad = 1; rad < 8; rad++) {
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
      id: "b" + (++seq),
      kind, col, row, w: spec.w, h: spec.h, faction,
      progress, done: progress >= 1, time: spec.time, traffic: 1.4,
    };
  }

  function makeUnit(kind, faction, col, row) {
    return {
      id: "u" + (++seq),
      kind, faction, col, row, job: null, facing: 1,
    };
  }

  function buildingAt(c, r) {
    return buildings.find((b) => c >= b.col && r >= b.row && c < b.col + b.w && r < b.row + b.h);
  }

  function fits(kind, col, row, faction) {
    const spec = BUILD[kind];
    if (!spec || spec.train) return false;
    if (faction === "zaps" && state.age < spec.age) return false;
    for (let dy = 0; dy < spec.h; dy++) {
      for (let dx = 0; dx < spec.w; dx++) {
        const c = col + dx;
        const r = row + dy;
        if (!inside(c, r)) return false;
        const b = biome[idx(c, r)];
        if (b === WATER || b === MOUNTAIN) return false;
        const p = plotOf[idx(c, r)];
        if (p < 0 || cities[p].owner !== faction) return false;
        if (buildingAt(c, r)) return false;
      }
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
    const own = (id, faction) => {
      const city = cities.find((c) => c.id === id);
      setPlotOwner(city, FACTION[faction]);
    };
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
      const hqC = city.col - 2;
      const hqR = city.row - 2;
      buildings.push(makeBuilding("hq", hqC, hqR, city.owner, 1));
      if (city.owner !== FACTION.zaps && !play) {
        const slot = findSlot(city, "dc");
        if (slot) buildings.push(makeBuilding("dc", slot.c, slot.r, city.owner, 1));
      }
      const stand = { c: city.col + 0.3, r: city.row + 1.6 };
      const crew = makeUnit("crew", city.owner, stand.c, stand.r);
      units.push(crew);
      if (city.owner !== FACTION.zaps) {
        units.push(makeUnit("crew", city.owner, stand.c + 0.8, stand.r + 0.4));
      }
    }
    const phx = cities.find((c) => c.id === "phoenix");
    units.push(makeUnit("crew", FACTION.zaps, phx.col + 1.1, phx.row + 1.5));
    units.push(makeUnit("crew", FACTION.zaps, phx.col - 0.4, phx.row + 2.1));
    units.push(makeUnit("scout", FACTION.zaps, phx.col + 1.8, phx.row + 2.2));
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const hall = nearestTile(city.col, city.row + 4, (c, r) => plotOf[idx(c, r)] < 0 && biome[idx(c, r)] !== WATER && biome[idx(c, r)] !== MOUNTAIN);
      const tie = nearestTile(city.col - 4, city.row, (c, r) => road[idx(c, r)] === 0 && biome[idx(c, r)] !== WATER);
      const yard = nearestTile(city.col + 4, city.row + 1, (c, r) => road[idx(c, r)] === 0 && biome[idx(c, r)] !== WATER && biome[idx(c, r)] !== MOUNTAIN);
      if (hall) spawnNode("hall", hall.c + 0.5, hall.r + 0.5, i);
      if (tie) spawnNode("tie", tie.c + 0.5, tie.r + 0.5, i);
      if (yard) spawnNode("yard", yard.c + 0.5, yard.r + 0.5, i);
    }
  }

  function revealDisk(col, row, radius, level) {
    const r0 = Math.max(0, Math.floor(row - radius));
    const r1 = Math.min(ROWS - 1, Math.ceil(row + radius));
    const c0 = Math.max(0, Math.floor(col - radius));
    const c1 = Math.min(COLS - 1, Math.ceil(col + radius));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const d = Math.hypot(c + 0.5 - col, r + 0.5 - row);
        if (d > radius) continue;
        const i = idx(c, r);
        if (level > vis[i]) {
          vis[i] = level;
          fogDirty = true;
        }
      }
    }
  }

  function refreshVision() {
    for (let i = 0; i < vis.length; i++) if (vis[i] === 2) vis[i] = 1;
    for (const b of buildings) {
      if (b.faction === FACTION.zaps) revealDisk(b.col + b.w / 2, b.row + b.h / 2, b.kind === "hq" ? 7.2 : 4.6, 2);
    }
    for (const u of units) {
      if (u.faction === FACTION.zaps) revealDisk(u.col, u.row, u.kind === "scout" ? 6.8 : 3.4, 2);
    }
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
    if (dist < 0.08) {
      ent.col = tc;
      ent.row = tr;
      return true;
    }
    const step = Math.min(dist, speed * dt);
    ent.col += (dx / dist) * step;
    ent.row += (dy / dist) * step;
    ent.facing = dx - dy >= 0 ? 1 : -1;
    return false;
  }

  function inPlot(ent, city) {
    return Math.abs(ent.col - city.col) <= 3.4 && Math.abs(ent.row - city.row) <= 3.4;
  }

  function selectedCrews() {
    return units.filter((u) => selection.has(u.id) && u.faction === FACTION.zaps && u.kind === "crew");
  }

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
    const standC = col + spec.w + 0.35;
    const standR = row + spec.h * 0.5;
    crews.forEach((crew, i) => {
      crew.job = { type: "build", id: b.id, c: standC, r: standR + i * 0.45 };
    });
    state.build = null;
    return true;
  }

  function train(kind) {
    const spec = BUILD[kind];
    if (!canAfford(spec.cost) || popUsed() >= popCap()) return false;
    const hq = buildings.find((b) => b.kind === "hq" && b.faction === FACTION.zaps && b.done);
    if (!hq) return false;
    payCost(spec.cost);
    units.push(makeUnit(kind === "scout" ? "scout" : "crew", FACTION.zaps, hq.col + hq.w + 0.4, hq.row + hq.h * 0.5));
    return true;
  }

  function route(fromC, fromR, toC, toR) {
    const start = { c: fromC | 0, r: fromR | 0 };
    const goal = { c: toC | 0, r: toR | 0 };
    const key = (c, r) => c + r * COLS;
    const q = [start];
    const prev = new Map([[key(start.c, start.r), null]]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    let guard = 0;
    let found = false;
    while (q.length && guard++ < 3000) {
      const n = q.shift();
      if (n.c === goal.c && n.r === goal.r) { found = true; break; }
      for (const [dc, dr] of dirs) {
        const c = n.c + dc;
        const r = n.r + dr;
        if (!inside(c, r) || prev.has(key(c, r))) continue;
        const near = Math.abs(c - goal.c) + Math.abs(r - goal.r) < 4;
        const plot = plotOf[idx(c, r)];
        const ok = road[idx(c, r)] || near || (plot >= 0 && plot === plotOf[idx(goal.c, goal.r)]);
        if (!ok) continue;
        if (biome[idx(c, r)] === WATER && !road[idx(c, r)]) continue;
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
    const city = cities[plotOf[idx(building.col, building.row)]];
    const demand = city ? city.demand : 80;
    if (building.kind === "mcs") {
      const bag = demand > 100 ? ["semi", "semi", "box", "bus"] : ["semi", "box", "bus"];
      return bag[(Math.random() * bag.length) | 0];
    }
    const bag = ["hatch", "sedan", "sedan", "suv", "pickup", "van"];
    if (demand > 130) bag.push("suv", "van", "pickup");
    return bag[(Math.random() * bag.length) | 0];
  }

  function spawnTraffic(building) {
    const kind = rollVehicle(building);
    if (kind === "semi" && building.kind !== "mcs") return;
    const spec = VEHICLES[kind];
    const open = vehicles.filter((v) => v.buildingId === building.id && v.phase !== "leave").length;
    const stalls = building.kind === "mcs" ? 1 : building.kind === "dc" ? 3 : 2;
    if (open >= stalls) return;
    let from = null;
    for (let rad = 8; rad < 18 && !from; rad++) {
      from = nearestTile(building.col, building.row, (c, r) => road[idx(c, r)] && Math.abs(c - building.col) + Math.abs(r - building.row) > rad - 2);
    }
    const destC = building.col + building.w * 0.5;
    const destR = building.row + building.h + 0.4;
    const path = from ? route(from.c, from.r, destC, destR) : [{ c: destC, r: destR }];
    vehicles.push({
      id: "v" + (++seq),
      kind, fare: spec.fare, buildingId: building.id,
      col: path[0].c, row: path[0].r, facing: 1,
      path, i: 0, phase: "drive", wait: 2.4, speed: kind === "semi" ? 1.55 : 2.15,
    });
  }

  function spawnFloat(col, row, text) {
    const p = worldToScreen(col, row);
    const el = document.createElement("div");
    el.className = "float";
    el.textContent = text;
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
    document.body.appendChild(el);
    state.liveFloats += 1;
    setTimeout(() => {
      el.remove();
      state.liveFloats = Math.max(0, state.liveFloats - 1);
    }, 1000);
  }

  function collectFare(v) {
    state.res.capital += v.fare;
    state.paid += v.fare;
    state.floatCount += 1;
    if (state.liveFloats < 8) spawnFloat(v.col, v.row, `+$${v.fare}`);
  }

  function step(dt) {
    if (state.frozen) return;
    state.time += dt;
    if (state.aging) {
      state.aging.left -= dt;
      if (state.aging.left <= 0) {
        state.age = state.aging.to;
        state.aging = null;
        showBanner(AGES[state.age].name);
      }
    }
    for (const u of units) {
      if (!u.job) continue;
      if (u.job.type === "move" || u.job.type === "build" || u.job.type === "contest" || u.job.type === "gather") {
        const arrived = moveToward(u, u.job.c, u.job.r, dt, u.kind === "scout" ? 2.4 : 1.85);
        if (arrived && u.job.type === "move") u.job = null;
        if (arrived && u.job?.type === "gather") {
          u.job.phase = u.job.phase === "out" ? "work" : u.job.phase;
          if (u.job.phase === "work") {
            u.job.work -= dt;
            if (u.job.work <= 0) {
              const hq = buildings.find((b) => b.kind === "hq" && b.faction === u.faction && b.done);
              if (!hq) { u.job = null; continue; }
              u.job.phase = "back";
              u.job.c = hq.col + hq.w * 0.5;
              u.job.r = hq.row + hq.h + 0.3;
            }
          }
        }
        if (u.job?.type === "gather" && u.job.phase === "back" && arrived) {
          const pack = u.job.pack;
          state.res[pack.k] += pack.n;
          if (state.liveFloats < 8) spawnFloat(u.col, u.row, `+${pack.n} ${pack.k}`);
          u.job = null;
        }
      }
    }
    for (const b of buildings) {
      if (b.done) {
        if ((b.kind === "dc" || b.kind === "mcs" || b.kind === "l2") && b.faction === FACTION.zaps) {
          b.traffic -= dt;
          if (b.traffic <= 0) {
            spawnTraffic(b);
            b.traffic = b.kind === "mcs" ? 6.5 : 4.2;
          }
        }
        if (b.kind === "substation" && b.faction === FACTION.zaps) state.res.grid += dt * 0.35;
        if (b.kind === "depot" && b.faction === FACTION.zaps) {
          state.res.copper += dt * 0.45;
          state.res.steel += dt * 0.28;
        }
        continue;
      }
      let workers = 0;
      for (const u of units) {
        if (u.job?.type === "build" && u.job.id === b.id) {
          const d = Math.hypot(u.col - (b.col + b.w / 2), u.row - (b.row + b.h / 2));
          if (d < 2.6) workers += 1;
        }
      }
      if (workers) b.progress = Math.min(1, b.progress + (dt * workers) / b.time);
      else if (b.faction !== FACTION.zaps) b.progress = Math.min(1, b.progress + dt / (b.time * 1.6));
      if (b.progress >= 1) {
        b.done = true;
        b.traffic = 1.1;
        for (const u of units) if (u.job?.id === b.id) u.job = null;
      }
    }
    for (const v of vehicles) {
      if (v.phase === "drive" || v.phase === "leave") {
        const wp = v.path[v.i];
        if (!wp) { v.done = true; continue; }
        if (moveToward(v, wp.c, wp.r, dt, v.speed)) {
          v.i += 1;
          if (v.i >= v.path.length) {
            if (v.phase === "drive") v.phase = "charge";
            else v.done = true;
          }
        }
      } else if (v.phase === "charge") {
        v.wait -= dt;
        if (v.wait <= 0) {
          collectFare(v);
          v.phase = "leave";
          v.path = v.path.slice().reverse();
          v.i = 0;
        }
      }
    }
    for (let i = vehicles.length - 1; i >= 0; i--) if (vehicles[i].done) vehicles.splice(i, 1);

    for (const city of cities) {
      const attackers = units.filter((u) => u.faction !== city.owner && inPlot(u, city));
      const defenders = units.filter((u) => u.faction === city.owner && inPlot(u, city));
      if (attackers.length && !defenders.length) {
        city.contest = Math.min(1, city.contest + dt / 12);
        city.attacker = attackers[0].faction;
        if (city.contest >= 1) {
          setPlotOwner(city, attackers[0].faction);
          city.contest = 0;
        }
      } else if (city.contest > 0) {
        city.contest = Math.max(0, city.contest - dt / 9);
      }
    }

    aiAcc += dt;
    if (aiAcc > 4) {
      aiAcc = 0;
      thinkAI();
    }
    visionAcc += dt;
    if (visionAcc > 0.4) {
      visionAcc = 0;
      const key = units
        .filter((u) => u.faction === FACTION.zaps)
        .map((u) => `${u.col | 0},${u.row | 0}`)
        .join("|");
      if (key !== state.visKey) {
        state.visKey = key;
        refreshVision();
      }
    }
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

  function thinkAI() {
    for (const faction of [FACTION.voltspan, FACTION.gridhawk, FACTION.arcway]) {
      const crew = units.find((u) => u.faction === faction && !u.job);
      if (crew) {
        let best = null;
        let bestD = 1e9;
        for (const city of cities) {
          if (city.owner === faction) continue;
          const d = Math.hypot(city.col - crew.col, city.row - crew.row);
          if (d < bestD) { bestD = d; best = city; }
        }
        if (best) crew.job = { type: "contest", c: best.col + 0.2, r: best.row + 0.2, city: best.id };
      }
      if (Math.random() < 0.45) {
        const city = cities.find((c) => c.owner === faction);
        const kind = Math.random() < 0.5 ? "dc" : "l2";
        const slot = city && findSlot(city, kind);
        if (slot) buildings.push(makeBuilding(kind, slot.c, slot.r, faction, 0.05));
      }
    }
  }

  function tileColor(c, r) {
    const b = biome[idx(c, r)];
    const n = hash(c, r);
    const pal = {
      [DESERT]: [[196, 164, 116], [214, 184, 136], [168, 136, 92]],
      [SCRUB]: [[112, 124, 78], [86, 102, 64], [138, 142, 88]],
      [VALLEY]: [[78, 118, 70], [102, 142, 78], [64, 96, 58]],
      [MOUNTAIN]: [[122, 116, 110], [96, 92, 88], [148, 144, 138]],
      [WATER]: [[42, 104, 146], [30, 82, 122], [58, 128, 168]],
      [GRAVEL]: [[142, 126, 106], [158, 140, 118], [124, 110, 92]],
      [ROAD]: [[54, 52, 58], [42, 40, 46], [70, 66, 62]],
    }[b];
    const base = pal[(n * pal.length) | 0];
    const lift = ((n - 0.5) * 18) | 0;
    return `rgb(${base[0] + lift},${base[1] + lift},${base[2] + lift})`;
  }

  function poly(g, pts) {
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
  }

  function tilePoly(c, r) {
    return [iso(c, r), iso(c + 1, r), iso(c + 1, r + 1), iso(c, r + 1)];
  }

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
          const o = owner[idx(c, r)];
          if (o) {
            g.fillStyle = FACTION_COLOR[o];
            g.globalAlpha = 0.14;
            g.fill();
            g.globalAlpha = 1;
          }
          if (biome[idx(c, r)] === MOUNTAIN) {
            const peak = 12 + hash(c, r) * 22;
            const top = iso(c + 0.5, r + 0.5);
            g.fillStyle = "rgba(0,0,0,0.18)";
            g.beginPath();
            g.ellipse(top.x, top.y + 4, 14, 6, 0, 0, Math.PI * 2);
            g.fill();
            poly(g, [
              { x: top.x, y: top.y - peak },
              { x: top.x + 12, y: top.y - 2 },
              { x: top.x - 10, y: top.y - 1 },
            ]);
            g.fillStyle = peak > 26 ? "#E7E2DA" : "#8C8680";
            g.fill();
          }
          if (biome[idx(c, r)] === WATER) {
            g.strokeStyle = "rgba(210,236,255,0.35)";
            g.lineWidth = 1;
            const a = iso(c + 0.2, r + 0.45);
            const b = iso(c + 0.8, r + 0.6);
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
            g.stroke();
          }
          if (road[idx(c, r)]) {
            g.strokeStyle = AMBER;
            g.globalAlpha = 0.75;
            g.lineWidth = 1.4;
            g.setLineDash([5, 6]);
            const a = iso(c + 0.5, r + 0.15);
            const b = iso(c + 0.5, r + 0.85);
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
            g.stroke();
            g.setLineDash([]);
            g.globalAlpha = 1;
          }
          const n = hash(c, r);
          const p = iso(c + 0.55, r + 0.55);
          if (biome[idx(c, r)] === DESERT && n > 0.94) {
            g.fillStyle = "#2E6A38";
            g.fillRect(p.x, p.y - 11, 2, 11);
            g.fillRect(p.x - 5, p.y - 8, 5, 2);
          } else if ((biome[idx(c, r)] === SCRUB || biome[idx(c, r)] === VALLEY) && n > 0.9) {
            g.fillStyle = n > 0.95 ? "#3E6A32" : "#6E8A3E";
            g.beginPath();
            g.ellipse(p.x, p.y, 5, 3, 0, 0, Math.PI * 2);
            g.fill();
          }
          if (o) {
            g.strokeStyle = FACTION_COLOR[o];
            g.lineWidth = 2.6;
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
          g.fillStyle = v === 0 ? "rgba(14,16,20,0.94)" : "rgba(12,14,18,0.5)";
          g.fill();
        }
      }
      fogDirty = false;
    }
    if (miniDirty) {
      mini.width = COLS;
      mini.height = ROWS;
      const img = mctx.createImageData(COLS, ROWS);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const o = owner[idx(c, r)];
          let col = [90, 110, 70];
          const b = biome[idx(c, r)];
          if (b === DESERT) col = [176, 146, 96];
          else if (b === MOUNTAIN) col = [120, 116, 112];
          else if (b === WATER) col = [40, 100, 150];
          else if (b === ROAD) col = [60, 58, 64];
          else if (b === GRAVEL) col = [140, 124, 104];
          else if (b === VALLEY) col = [70, 120, 68];
          if (o) col = col.map((v, i) => (v * 0.45 + [230, 50, 37, 232, 154, 46, 0, 212, 245, 198, 245, 78][o * 3 - 3 + i] * 0.55));
          const p = (r * COLS + c) * 4;
          img.data[p] = col[0];
          img.data[p + 1] = col[1];
          img.data[p + 2] = col[2];
          img.data[p + 3] = 255;
        }
      }
      mctx.putImageData(img, 0, 0);
      miniDirty = false;
      mini._img = mctx.getImageData(0, 0, COLS, ROWS);
    }
  }

  function drawBox(g, col, row, w, h, height, wall, roof) {
    const top = iso(col, row);
    const right = iso(col + w, row);
    const bot = iso(col + w, row + h);
    const left = iso(col, row + h);
    const up = (p) => ({ x: p.x, y: p.y - height });
    g.fillStyle = "rgba(0,0,0,0.28)";
    poly(g, [top, right, bot, left]);
    g.fill();
    g.fillStyle = wall;
    poly(g, [left, bot, up(bot), up(left)]);
    g.fill();
    g.fillStyle = shade(wall, -18);
    poly(g, [bot, right, up(right), up(bot)]);
    g.fill();
    g.fillStyle = roof;
    poly(g, [up(top), up(right), up(bot), up(left)]);
    g.fill();
    return up(bot);
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (s) => clamp(((n >> s) & 255) + amt, 0, 255);
    return `#${[ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }

  function drawBuilding(g, b) {
    const age = state.age;
    const progress = b.done ? 1 : b.progress;
    const heightScale = 0.35 + 0.65 * progress;
    const tint = FACTION_COLOR[b.faction] || RED;
    let wall = "#C8B89A";
    let roof = "#E7D7BC";
    let hgt = 26;
    if (age === 1) { wall = "#9AA3AD"; roof = "#D5DCE3"; }
    if (age >= 2) { wall = "#3C444C"; roof = "#22282E"; }
    if (b.kind === "hq") hgt = 48;
    else if (b.kind === "mcs") hgt = 34;
    else if (b.kind === "dc" || b.kind === "l2") hgt = 16;
    else if (b.kind === "bess") hgt = 22;
    else if (b.kind === "lounge") hgt = 20;
    else if (b.kind === "substation") hgt = 18;
    else if (b.kind === "depot") hgt = 28;
    else if (b.kind === "market") hgt = 24;
    hgt *= heightScale;
    const front = drawBox(g, b.col, b.row, b.w, b.h, hgt, wall, roof);
    if (b.kind === "dc" || b.kind === "l2") {
      g.fillStyle = age >= 2 ? CYAN : AMBER;
      for (let i = 0; i < b.w; i++) {
        const p = iso(b.col + i + 0.5, b.row + b.h);
        g.fillRect(p.x - 1, p.y - hgt - 6, 2, 8);
      }
    }
    if (b.kind === "mcs") {
      g.fillStyle = "#1A1C20";
      const door = iso(b.col + 0.4, b.row + b.h - 0.1);
      g.fillRect(door.x, door.y - hgt * 0.7, 14, hgt * 0.55);
    }
    if (b.kind === "bess") {
      g.fillStyle = CYAN;
      const p = iso(b.col + 0.3, b.row + 0.4);
      g.fillRect(p.x, p.y - hgt - 2, 6, 4);
    }
    if (b.kind === "bus" ) { /* noop */ }
    if (age >= 2 && b.done) {
      g.strokeStyle = CYAN;
      g.globalAlpha = 0.85;
      g.lineWidth = 1.5;
      const a = iso(b.col, b.row);
      const d = iso(b.col + b.w, b.row + b.h);
      g.beginPath();
      g.moveTo(a.x, a.y - hgt);
      g.lineTo(d.x, d.y - hgt);
      g.stroke();
      g.globalAlpha = 1;
    }
    const flag = iso(b.col + b.w * 0.5, b.row + 0.2);
    g.fillStyle = "#E7E1D6";
    g.fillRect(flag.x, flag.y - hgt - 16, 1.6, 16);
    g.fillStyle = tint;
    g.beginPath();
    g.moveTo(flag.x + 1.6, flag.y - hgt - 16);
    g.lineTo(flag.x + 12, flag.y - hgt - 12);
    g.lineTo(flag.x + 1.6, flag.y - hgt - 8);
    g.fill();
    if (!b.done) {
      const base = iso(b.col, b.row + b.h);
      const top = iso(b.col + b.w, b.row);
      g.strokeStyle = "rgba(245,240,232,0.7)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(base.x, base.y);
      g.lineTo(base.x, base.y - 36 * progress - 8);
      g.moveTo(top.x, top.y);
      g.lineTo(top.x, top.y - 36 * progress - 8);
      g.moveTo(base.x, base.y - 10);
      g.lineTo(top.x, top.y - 28);
      g.stroke();
      const bar = iso(b.col + b.w / 2, b.row);
      g.fillStyle = "rgba(0,0,0,0.55)";
      g.fillRect(bar.x - 16, bar.y - hgt - 22, 32, 5);
      g.fillStyle = CYAN;
      g.fillRect(bar.x - 16, bar.y - hgt - 22, 32 * progress, 5);
    }
    return front;
  }

  function drawUnit(g, u) {
    const spec = u.kind === "scout"
      ? { w: 0.46, h: 0.7, body: 12, cab: 14, color: CREAM, roof: CYAN }
      : { w: 0.48, h: 0.78, body: 10, cab: 13, color: CREAM, roof: FACTION_COLOR[u.faction] };
    const ox = u.col - spec.w / 2;
    const oy = u.row - spec.h / 2;
    drawBox(g, ox, oy, spec.w, spec.h * 0.55, spec.body, spec.color, shade(spec.color, 20));
    const cabC = u.facing > 0 ? ox + spec.w * 0.35 : ox;
    drawBox(g, cabC, oy, spec.w * 0.62, spec.h * 0.4, spec.cab, shade(spec.color, -10), spec.roof);
    if (u.kind === "scout") {
      const p = iso(u.col, u.row);
      g.strokeStyle = CYAN;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(p.x, p.y - 20, 6, Math.PI, 0);
      g.stroke();
    }
    if (selection.has(u.id)) {
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
    const ox = v.col - spec.w / 2;
    const oy = v.row - (spec.trailer ? spec.h + spec.trailer.h : spec.h) / 2;
    if (spec.trailer) {
      drawBox(g, ox, oy + spec.h * 0.15, spec.trailer.w, spec.trailer.h, spec.trailer.body, spec.trailer.color, shade(spec.trailer.color, -12));
    }
    drawBox(g, ox, oy, spec.w, spec.h, spec.body, spec.color, shade(spec.color, 16));
    drawBox(g, ox + spec.w * 0.1, oy, spec.w * 0.8, spec.h * 0.42, spec.cab, shade(spec.color, -12), spec.roof);
    if (spec.bed) {
      drawBox(g, ox, oy + spec.h * 0.45, spec.w, spec.h * 0.5, spec.body * 0.45, shade(spec.color, -30), shade(spec.color, -40));
    }
    if (spec.windows) {
      g.fillStyle = "#1E1E24";
      for (let i = 0; i < spec.windows; i++) {
        const p = iso(ox + spec.w * 0.7, oy + spec.h * (0.25 + i * 0.12));
        g.fillRect(p.x, p.y - spec.body - 2, 3, 3);
      }
    }
    if (v.label) {
      const p = iso(v.col, v.row - 0.2);
      g.font = "700 13px Barlow Condensed, sans-serif";
      g.textAlign = "center";
      const text = v.label;
      const w = g.measureText(text).width + 10;
      g.fillStyle = "rgba(30,30,36,0.88)";
      g.fillRect(p.x - w / 2, p.y - 36, w, 16);
      g.fillStyle = CREAM;
      g.fillText(text, p.x, p.y - 24);
    }
  }

  function drawNode(g, n) {
    const color = n.kind === "hall" ? "#E7DCC8" : n.kind === "tie" ? AMBER : "#C46A3A";
    drawBox(g, n.col - 0.35, n.row - 0.35, 0.7, 0.7, n.kind === "yard" ? 8 : 14, color, shade(color, 24));
    if (n.kind === "tie") {
      const p = iso(n.col, n.row);
      g.strokeStyle = AMBER;
      g.beginPath();
      g.moveTo(p.x, p.y - 14);
      g.lineTo(p.x, p.y - 28);
      g.stroke();
    }
  }

  function drawGhost(g) {
    if (!state.build || !pointer.inside) return;
    const spec = BUILD[state.build];
    if (!spec || spec.train) return;
    const w = screenToWorld(pointer.x, pointer.y);
    const col = Math.floor(w.col);
    const row = Math.floor(w.row);
    const ok = fits(state.build, col, row, FACTION.zaps);
    g.globalAlpha = 0.55;
    drawBox(g, col, row, spec.w, spec.h, 18, ok ? "#7DDEA0" : "#E63225", ok ? "#D8FFE8" : "#FFB0A8");
    g.globalAlpha = 1;
  }

  function draw() {
    paintMaps();
    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#17202A";
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(camera.zoom, 0, 0, camera.zoom, camera.x, camera.y);
    ctx.drawImage(landCanvas, ORIGIN_X, ORIGIN_Y);
    ctx.drawImage(fogCanvas, ORIGIN_X, ORIGIN_Y);
    const drawables = [];
    for (const n of nodes) drawables.push({ z: n.col + n.row, draw: () => seen(n.col, n.row) && drawNode(ctx, n) });
    for (const b of buildings) drawables.push({ z: b.col + b.row + b.w, draw: () => tileSeen(b.col, b.row) && drawBuilding(ctx, b) });
    for (const u of units) drawables.push({ z: u.col + u.row, draw: () => seen(u.col, u.row) && drawUnit(ctx, u) });
    for (const v of vehicles) drawables.push({ z: v.col + v.row, draw: () => (state.shot === "vehicles" || seen(v.col, v.row)) && drawVehicle(ctx, v) });
    drawables.sort((a, b) => a.z - b.z);
    for (const d of drawables) d.draw();
    for (const city of cities) {
      if (city.contest > 0.02 && seen(city.col, city.row)) {
        const p = iso(city.col, city.row - 1.2);
        ctx.fillStyle = "rgba(0,0,0,0.65)";
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
    if (state.marquee) {
      const m = state.marquee;
      const x = Math.min(m.x1, m.x2);
      const y = Math.min(m.y1, m.y2);
      const rw = Math.abs(m.x2 - m.x1);
      const rh = Math.abs(m.y2 - m.y1);
      ctx.fillStyle = "rgba(0,212,245,0.14)";
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, rw, rh);
      ctx.strokeRect(x, y, rw, rh);
    }
    paintMinimapFrame();
  }

  function seen(col, row) {
    if (state.shot === "vehicles" || state.shot === "region") return vis[idx(clamp(col | 0, 0, COLS - 1), clamp(row | 0, 0, ROWS - 1))] >= 1;
    const c = clamp(col | 0, 0, COLS - 1);
    const r = clamp(row | 0, 0, ROWS - 1);
    return vis[idx(c, r)] === 2;
  }
  function tileSeen(col, row) {
    const c = clamp(col | 0, 0, COLS - 1);
    const r = clamp(row | 0, 0, ROWS - 1);
    return vis[idx(c, r)] >= 1;
  }

  function paintMinimapFrame() {
    if (!mini._img) return;
    mctx.putImageData(mini._img, 0, 0);
    mctx.fillStyle = RED;
    for (const u of units) {
      if (u.faction === FACTION.zaps) mctx.fillRect(u.col, u.row, 2, 2);
    }
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
    if (!state.holdBanner) {
      el.classList.remove("show");
      void el.offsetWidth;
      el.classList.add("show");
      setTimeout(() => { el.hidden = true; }, 2800);
    }
  }

  function syncHud() {
    $("res-capital").textContent = Math.floor(state.res.capital).toLocaleString();
    $("res-grid").textContent = Math.floor(state.res.grid);
    $("res-permits").textContent = Math.floor(state.res.permits);
    $("res-copper").textContent = Math.floor(state.res.copper);
    $("res-steel").textContent = Math.floor(state.res.steel);
    $("age-name").textContent = AGES[state.age].name;
    $("pop").textContent = `${popUsed()}/${popCap()}`;
    const next = AGES[state.age + 1];
    const ageBtn = $("btn-age");
    if (state.aging) {
      ageBtn.disabled = true;
      ageBtn.textContent = `Aging ${Math.round((1 - state.aging.left / state.aging.total) * 100)}%`;
    } else if (!next) {
      ageBtn.disabled = true;
      ageBtn.textContent = "Final age";
    } else {
      ageBtn.disabled = !canAfford(next.cost);
      ageBtn.textContent = `Advance · ${next.name.replace(" AGE", "")}`;
    }
    const hasDc = buildings.some((b) => b.kind === "dc" && b.faction === FACTION.zaps && b.done);
    $("objective").textContent = !hasDc
      ? "Select a crew and raise a DC row"
      : state.age === 0
        ? "Traffic is paying. Advance to Fleet Age"
        : state.age === 1
          ? "Raise an MCS bay so semis can charge"
          : "Tie in a substation. Hold the corridor";
    for (const btn of document.querySelectorAll("#cmd button")) {
      const spec = BUILD[btn.dataset.build];
      const locked = spec.age != null && state.age < spec.age;
      const poor = !canAfford(spec.cost);
      const full = spec.train && popUsed() >= popCap();
      btn.disabled = locked || poor || full;
      btn.classList.toggle("locked", locked);
      btn.classList.toggle("armed", state.build === btn.dataset.build);
    }
    const selected = [...selection].map((id) => units.find((u) => u.id === id) || buildings.find((b) => b.id === id)).filter(Boolean);
    const first = selected[0];
    if (!first) {
      $("select-name").textContent = "Western Interconnect";
      $("select-meta").textContent = "Box-select crews. Right-click to move or work.";
      $("select-bar").style.width = "0";
      $("select-swatch").style.background = CHAR;
    } else if (first.kind && first.faction && !first.w) {
      const names = selected.map((u) => (u.kind === "scout" ? "Scout van" : "Crew truck"));
      $("select-name").textContent = selected.length > 1 ? `${selected.length} units` : names[0];
      $("select-meta").textContent = `${FACTION_NAME[first.faction]} · ${first.job ? first.job.type : "idle"}`;
      $("select-bar").style.width = "100%";
      $("select-swatch").style.background = FACTION_COLOR[first.faction];
    } else {
      $("select-name").textContent = BUILD[first.kind]?.name || first.kind;
      $("select-meta").textContent = first.done ? `${FACTION_NAME[first.faction]} · online` : `Raising ${Math.round(first.progress * 100)}%`;
      $("select-bar").style.width = `${Math.round((first.done ? 1 : first.progress) * 100)}%`;
      $("select-swatch").style.background = FACTION_COLOR[first.faction] || AMBER;
    }
  }

  function buildCard() {
    const root = $("cmd");
    root.innerHTML = "";
    for (const id of CARD) {
      const spec = BUILD[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.build = id;
      btn.innerHTML = `${ICONS[id]}<span>${spec.name}</span><kbd>${spec.key.toUpperCase()}</kbd>`;
      btn.title = spec.cost ? Object.entries(spec.cost).map(([k, v]) => `${v} ${k}`).join(" · ") : spec.name;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (spec.train) train(spec.train);
        else state.build = state.build === id ? null : id;
        syncHud();
      });
      root.appendChild(btn);
    }
  }

  function pickAt(sx, sy) {
    const w = screenToWorld(sx, sy);
    let best = null;
    let bestD = 0.7;
    for (const u of units) {
      if (!seen(u.col, u.row)) continue;
      const d = Math.hypot(u.col - w.col, u.row - w.row);
      if (d < bestD) { bestD = d; best = u; }
    }
    if (best) return best;
    const c = Math.floor(w.col);
    const r = Math.floor(w.row);
    if (inside(c, r) && vis[idx(c, r)] >= 1) {
      const b = buildingAt(c, r);
      if (b) return b;
      return nodes.find((n) => Math.hypot(n.col - w.col, n.row - w.row) < 0.6) || null;
    }
    return null;
  }

  function commandAt(sx, sy) {
    const w = screenToWorld(sx, sy);
    const crews = selectedCrews();
    const scouts = units.filter((u) => selection.has(u.id) && u.kind === "scout");
    const node = nodes.find((n) => Math.hypot(n.col - w.col, n.row - w.row) < 0.7);
    if (node && crews.length) {
      crews.forEach((crew) => {
        const pack = node.kind === "hall" ? { k: "permits", n: 1 } : node.kind === "tie" ? { k: "grid", n: 4 } : { k: Math.random() < 0.5 ? "copper" : "steel", n: 12 };
        crew.job = { type: "gather", c: node.col, r: node.row, phase: "out", work: 2.5, pack };
      });
      return;
    }
    const c = Math.floor(w.col);
    const r = Math.floor(w.row);
    const b = inside(c, r) ? buildingAt(c, r) : null;
    if (b && !b.done && crews.length) {
      crews.forEach((crew, i) => {
        crew.job = { type: "build", id: b.id, c: b.col + b.w + 0.3, r: b.row + i * 0.4 };
      });
      return;
    }
    const movers = crews.length ? crews : scouts;
    movers.forEach((u, i) => {
      u.job = { type: "move", c: w.col + (i % 3) * 0.45, r: w.row + Math.floor(i / 3) * 0.45 };
    });
  }

  function boxSelect(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    if (!keys["shift"]) selection.clear();
    for (const u of units) {
      if (u.faction !== FACTION.zaps) continue;
      const p = worldToScreen(u.col, u.row);
      if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) selection.add(u.id);
    }
  }

  function bind() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      const specId = Object.keys(BUILD).find((id) => BUILD[id].key === k);
      if (specId) {
        e.preventDefault();
        const spec = BUILD[specId];
        if (spec.train) train(spec.train);
        else state.build = state.build === specId ? null : specId;
      }
      if (k === "escape") state.build = null;
    });
    window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => {
      pointer.inside = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (e.button === 1 || e.button === 2 && e.altKey) {
        pan = { x: e.clientX, y: e.clientY };
        return;
      }
      if (e.button === 2) {
        if (state.build) state.build = null;
        else commandAt(e.clientX, e.clientY);
        return;
      }
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, x2: e.clientX, y2: e.clientY, moved: false };
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
    canvas.addEventListener("pointerup", (e) => {
      if (pan && (e.button === 1 || e.button === 2)) { pan = null; return; }
      if (!drag || e.button !== 0) return;
      if (drag.moved) boxSelect(drag.x, drag.y, e.clientX, e.clientY);
      else if (state.build) {
        const w = screenToWorld(e.clientX, e.clientY);
        placeBuilding(state.build, Math.floor(w.col), Math.floor(w.row));
      } else {
        const hit = pickAt(e.clientX, e.clientY);
        if (!keys["shift"]) selection.clear();
        if (hit) selection.add(hit.id);
      }
      if (!state.holdBanner) state.marquee = state.marqueeHold || null;
      else state.marquee = state.marqueeHold || null;
      drag = null;
      if (!state.marqueeHold) state.marquee = null;
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
      const col = ((e.clientX - rect.left) / rect.width) * COLS;
      const row = ((e.clientY - rect.top) / rect.height) * ROWS;
      focus(col, row, camera.zoom);
    });
    $("btn-age").addEventListener("click", () => {
      const next = AGES[state.age + 1];
      if (!next || state.aging || !canAfford(next.cost)) return;
      payCost(next.cost);
      state.aging = { to: state.age + 1, left: next.time, total: next.time };
      syncHud();
    });
  }

  function resize() {
    canvas.width = Math.max(1, canvas.clientWidth);
    canvas.height = Math.max(1, canvas.clientHeight);
    if (state.shot) frameShot(state.shot);
  }

  function phx() { return cities.find((c) => c.id === "phoenix"); }

  function applyShot(name) {
    state.shot = name;
    state.frozen = true;
    if (name === "region") {
      for (let i = 0; i < vis.length; i++) vis[i] = (i % COLS) < 8 ? 0 : 1;
      for (const city of cities) if (city.owner) revealDisk(city.col, city.row, 9, 2);
      fogDirty = true;
    } else if (name === "compound") {
      state.age = 1;
      const city = phx();
      buildings.push(makeBuilding("dc", city.col + 1, city.row - 3, FACTION.zaps, 1));
      buildings.push(makeBuilding("l2", city.col - 3, city.row + 1, FACTION.zaps, 1));
      buildings.push(makeBuilding("lounge", city.col + 1, city.row + 1, FACTION.zaps, 1));
      buildings.push(makeBuilding("bess", city.col + 1, city.row - 1, FACTION.zaps, 1));
      buildings.push(makeBuilding("mcs", city.col - 3, city.row + 2, FACTION.zaps, 1));
      revealDisk(city.col, city.row, 8, 2);
      const dc = buildings.find((b) => b.kind === "dc" && b.faction === FACTION.zaps);
      if (dc) {
        for (const kind of ["sedan", "suv", "hatch"]) {
          vehicles.push({
            id: "v" + (++seq), kind, fare: VEHICLES[kind].fare, buildingId: dc.id,
            col: dc.col + 0.4, row: dc.row + 1.4, facing: 1, path: [], i: 0, phase: "charge", wait: 9, speed: 0,
          });
        }
      }
    } else if (name === "build") {
      const city = phx();
      const b = makeBuilding("dc", city.col + 1, city.row - 2, FACTION.zaps, 0.42);
      buildings.push(b);
      const crew = units.find((u) => u.faction === FACTION.zaps && u.kind === "crew");
      crew.col = b.col + b.w + 0.3;
      crew.row = b.row + 0.4;
      crew.job = { type: "build", id: b.id, c: crew.col, r: crew.row };
      selection.add(crew.id);
      revealDisk(city.col, city.row, 8, 2);
    } else if (name === "select") {
      const city = phx();
      const crews = units.filter((u) => u.faction === FACTION.zaps && u.kind === "crew");
      crews.forEach((u, i) => {
        u.col = city.col - 0.2 + i * 0.7;
        u.row = city.row + 1.4;
        selection.add(u.id);
      });
      revealDisk(city.col, city.row, 8, 2);
      state.marqueeHold = { x1: 0, y1: 0, x2: 10, y2: 10 };
    } else if (name === "age") {
      state.age = 1;
      state.holdBanner = true;
      const city = phx();
      buildings.push(makeBuilding("dc", city.col + 1, city.row - 2, FACTION.zaps, 1));
      buildings.push(makeBuilding("mcs", city.col - 3, city.row + 1, FACTION.zaps, 1));
      revealDisk(city.col, city.row, 8, 2);
    } else if (name === "vehicles") {
      for (let i = 0; i < vis.length; i++) vis[i] = 2;
      fogDirty = true;
      const order = ["hatch", "sedan", "suv", "pickup", "van", "box", "semi", "bus"];
      order.forEach((kind, i) => {
        vehicles.push({
          id: "v" + (++seq), kind, fare: VEHICLES[kind].fare,
          col: 100 + (i % 4) * 2.2, row: 36 + Math.floor(i / 4) * 3.2,
          facing: 1, path: [], i: 0, phase: "charge", wait: 99, speed: 0,
          label: VEHICLES[kind].name,
        });
      });
    } else if (name === "contest") {
      const city = cities.find((c) => c.id === "flagstaff");
      setPlotOwner(city, FACTION.zaps);
      if (!buildings.some((b) => b.kind === "hq" && Math.hypot(b.col - city.col, b.row - city.row) < 3)) {
        buildings.push(makeBuilding("hq", city.col - 2, city.row - 2, FACTION.zaps, 1));
      }
      const rival = units.find((u) => u.faction === FACTION.voltspan);
      rival.col = city.col + 1.2;
      rival.row = city.row + 0.4;
      rival.job = { type: "contest", c: rival.col, r: rival.row };
      city.contest = 0.66;
      city.attacker = FACTION.voltspan;
      revealDisk(city.col, city.row, 8, 2);
      const crew = units.find((u) => u.faction === FACTION.zaps && u.kind === "crew");
      crew.col = city.col - 4.2;
      crew.row = city.row + 1;
    }
  }

  function frameShot(name) {
    const city = phx();
    if (name === "region") {
      const c = cities.reduce((s, x) => s + x.col, 0) / cities.length;
      const r = cities.reduce((s, x) => s + x.row, 0) / cities.length;
      focus(c, r - 2, 0.42);
    } else if (name === "compound" || name === "age") focus(city.col, city.row, 1.15);
    else if (name === "build") focus(city.col + 1, city.row - 1, 1.35);
    else if (name === "select") {
      focus(city.col, city.row + 1.2, 1.2);
      const crews = units.filter((u) => selection.has(u.id));
      const pts = crews.map((u) => worldToScreen(u.col, u.row));
      state.marqueeHold = {
        x1: Math.min(...pts.map((p) => p.x)) - 28,
        y1: Math.min(...pts.map((p) => p.y)) - 24,
        x2: Math.max(...pts.map((p) => p.x)) + 28,
        y2: Math.max(...pts.map((p) => p.y)) + 22,
      };
      state.marquee = state.marqueeHold;
    } else if (name === "vehicles") focus(103.2, 37.6, 1.35);
    else if (name === "contest") {
      const f = cities.find((c) => c.id === "flagstaff");
      focus(f.col, f.row, 1.05);
    }
  }

  function fast(seconds) {
    const was = state.frozen;
    state.frozen = false;
    const steps = Math.max(1, Math.round(seconds / 0.05));
    for (let i = 0; i < steps; i++) step(0.05);
    state.frozen = was;
    syncHud();
    draw();
  }

  function boot() {
    buildTerrain();
    const params = new URLSearchParams(location.search);
    const shot = params.get("shot");
    seedStart(!shot || shot === "build" || shot === "select");
    if (shot) applyShot(shot);
    else refreshVision();
    buildCard();
    bind();
    resize();
    if (!shot) {
      const home = phx();
      focus(home.col, home.row + 0.4, 0.92);
    }
    if (shot === "age") showBanner("FLEET AGE");
    syncHud();
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
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
      build: "empire-aoe",
      resources: () => ({ ...state.res }),
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
      crewScreen: () => {
        const u = units.find((x) => x.faction === FACTION.zaps && x.kind === "crew");
        return worldToScreen(u.col, u.row);
      },
      padScreen: () => {
        const city = phx();
        return worldToScreen(city.col + 1.4, city.row - 1.6);
      },
      fast: (s) => fast(s),
      place: (kind, col, row) => placeBuilding(kind, col, row),
      train: (kind) => train(kind),
      focus: (col, row, zoom) => focus(col, row, zoom),
    };
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else boot();
})();
