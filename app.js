const STORAGE_KEY = "carpeVerseVault.games.v1";
const RAWG_KEY_STORAGE = "carpeVerseVault.rawgKey.v1";
const RAWG_COVER_MATCH_VERSION = 3;
const PSNPROFILES_USER_STORAGE = "carpeVerseVault.psnProfilesUser.v1";
const TROPHY_PACKS_STORAGE = "carpeVerseVault.trophyPacks.v3";
const LAST_SYNC_STORAGE = "carpeVerseVault.lastSync.v1";
const LAST_SYNC_ATTEMPT_STORAGE = "carpeVerseVault.lastSyncAttempt.v1";
const LAST_SYNC_SOURCE_STORAGE = "carpeVerseVault.lastSyncSource.v1";
const LAST_SYNC_SNAPSHOT_STORAGE = "carpeVerseVault.lastSyncSnapshot.v1";
const LIBRARY_SORT_STORAGE = "carpeVerseVault.librarySort.v1";
const BACKUP_SCHEMA_VERSION = 1;
const PSN_AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
const PSN_AUTO_SYNC_CHECK_MS = 30 * 60 * 1000;
const RAWG_PLATFORM_IDS = {
  all: "4,7,18,187",
  PS5: "187",
  PS4: "18",
  Switch: "7",
  PC: "4",
};

// Juegos cuyo nombre es ambiguo en RAWG. Solo estas fichas se fuerzan; las
// portadas que ya están bien no se vuelven a tocar.
const RAWG_COVER_OVERRIDES = {
  "14122-alan-wake": { search: "Alan Wake Remastered", slug: "alan-wake-remastered", revision: 1 },
  "24347-alan-wake-ii": {
    search: "Alan Wake 2",
    slug: "alan-wake-2",
    fallbackImage: "https://gamesdb-images.launchbox.gg/r2_7f8adb43-d2df-48ea-8969-2233c0fdd527.jpg",
    revision: 2,
  },
  "241-god-of-war": { search: "God of War I", slug: "god-of-war", revision: 1 },
  "7523-god-of-war": { search: "God of War 2018", slug: "god-of-war-2", revision: 1 },
  "40071-resident-evil-requiem": { search: "Resident Evil 9 Requiem", slug: "resident-evil-9-requiem", revision: 1 },
  "5776-resident-evil-7-biohazard": { search: "Resident Evil 7 Biohazard", slug: "resident-evil-7-biohazard", revision: 1 },
  "21539-resident-evil-4": { search: "Resident Evil 4 2023", slug: "resident-evil-4-2023", revision: 1 },
  "12873-resident-evil-village": { search: "Resident Evil Village", slug: "resident-evil-village", revision: 1 },
  "4389-resident-evil-6": { search: "Resident Evil 6", slug: "resident-evil-6", revision: 1 },
  "10633-resident-evil-3": { search: "Resident Evil 3 2020", slug: "resident-evil-3", revision: 1 },
  "4850-resident-evil-5": { search: "Resident Evil 5", slug: "resident-evil-5-biohazard-5", revision: 1 },
  "8671-resident-evil-2": { search: "Resident Evil 2 2019", slug: "resident-evil-2-2019", revision: 1 },
};

// Rangos comprobados directamente contra la estructura de PSNProfiles.
// Permiten conservar Juego base/DLC incluso cuando PSNProfiles bloquea una lectura puntual.
const PSN_TROPHY_PACK_RANGES = {
  "23918-marvels-spider-man-2": [["Base Game",1,42],["New Game+",43,43]],
  "11786-marvels-spider-man-remastered": [["Base Game",1,51],["New Game+",52,53],["CTNS: The Heist",54,60],["CTNS: Turf Wars",61,67],["CTNS: Silver Lining",68,74],["Remastered",75,79]],
  "8143-marvels-spider-man": [["Base Game",1,51],["New Game+",52,53],["CTNS: The Heist",54,60],["CTNS: Turf Wars",61,67],["CTNS: Silver Lining",68,74]],
  "36583-dying-light-the-beast": [["Base Game",1,31],["New Game+ & Legendary Levels",32,34],["Nightmare",35,36],["Restored Land",37,43]],
  "15146-dying-light-2-stay-human": [["Base Game",1,58],["Bloody Ties",59,66]],
  "36989-ghost-of-yōtei": [["Base Game",1,54],["New Game+",55,56],["Legends",57,62]],
  "42262-call-of-duty-black-ops-ii": [["Base Game",1,51],["Revolution",52,61],["Uprising",62,71],["Vengeance",72,81],["Apocalypse",82,91]],
  "23281-blasphemous-ii": [["Base Game",1,46],["Mea Culpa",47,55],["The Third Sin",56,60]],
  "3140-lego-batman-3-beyond-gotham": [["Base Game",1,41],["Man of Steel",42,46],["Batman 75th Anniversary",47,51],["Dark Knight",52,56],["Arrow",57,61],["Bizarro",62,66],["The Squad",67,71]],
  "28905-star-wars-outlaws": [["Base Game",1,50],["Wild Card",51,54],["A Pirate's Fortune",55,60]],
  "15437-cyberpunk-2077": [["Base Game",1,45],["Phantom Liberty",46,58]],
  "11172-cuphead": [["Base Game",1,29],["The Delicious Last Course",30,43]],
  "24347-alan-wake-ii": [["Base Game",1,67],["Night Springs",68,79],["The Lake House",80,89]],
  "35281-killing-floor-3": [["Base Game",1,34],["Operation: Breakout",35,35],["Operation: Deep Freeze",36,42],["Onslaught Update",43,43]],
  "37071-battlefield-6": [["Base Game",1,43],["BATTLEFIELD REDSEC",44,54]],
  "5673-stardew-valley": [["Base Game",1,41],["1.6 Update",42,50]],
  "26710-another-crabs-treasure": [["Base Game",1,33],["Year of the Crab",34,39]],
  "3679-rocket-league": [["Base Game",1,36],["Utopia Coliseum",37,39],["Supersonic Fury",40,45],["Revenge of the Battle-Cars",46,50],["Chaos Run",51,55],["Neo Tokyo",56,63],["AquaDome",64,70],["Dropshot",71,76],["Champions Field",77,82],["Clubs Update",83,88]],
  "18848-call-of-duty-hq": [["Base Game",1,25],["Call of Duty Modern Warfare III",26,64],["Call of Duty Black Ops 6",65,108],["Call of Duty: Black Ops 7",109,158]],
  "22963-remnant-ii": [["Base Game",1,51],["The Awakened King",52,56],["The Forgotten Kingdom",57,61],["The Dark Horizon",62,66]],
  "20832-powerwash-simulator": [["Base Game",1,41],["SpongeBob SquarePants Special",42,51],["Back to the Future Special",52,61],["Warhammer 40,000 Special",62,71],["Alice's Adventures Special",72,81],["Shrek Special",82,91],["Wallace & Gromit Special",92,101]],
  "14122-alan-wake": [["Base Game",1,51],["The Signal",52,59],["The Writer",60,68]],
  "21316-dredge": [["Base Game",1,40],["The Pale Reach",41,48],["The Iron Rig",49,60]],
  "21836-minecraft-legends": [["Base Game",1,31],["Holiday 2023 Update",32,41]],
  "13285-doom-eternal": [["Base Game",1,34],["The Ancient Gods 1",35,41],["The Ancient Gods 2",42,48],["Horde Mode",49,51]],
  "33804-doom-the-dark-ages": [["Base Game",1,29],["Revelations",30,39]],
  "24104-lords-of-the-fallen": [["Base Game",1,63],["Master of Fate",64,72],["Conqueror of Hardships",73,77]],
  "23013-high-on-life": [["Base Game",1,33],["High On Knife",34,45]],
  "25399-prince-of-persia-the-lost-crown": [["Base Game",1,31],["Mask of Darkness",32,42]],
  "15777-ghostwire-tokyo": [["Base Game",1,57],["Spider's Thread Update",58,67]],
  "3091-the-binding-of-isaac-rebirth": [["Base Game",1,59],["Afterbirth",60,66],["Afterbirth+",67,73],["Repentance",74,80]],
  "24064-hot-wheels-unleashed-2-turbocharged": [["Base Game",1,44],["AcceleRacers Expansion",45,47],["Made in Italy Expansion",48,50],["Fast & Furious Expansion",51,53],["Alien Encounters Expansion",54,56]],
  "5776-resident-evil-7-biohazard": [["Base Game",1,38],["Banned Footage Vol. 1",39,43],["Banned Footage Vol. 2",44,51],["End of Zoe",52,57],["Not a Hero",58,59]],
  "3303-dying-light": [["Base Game",1,51],["Parkour Fever",52,54],["The Bozak Horde",55,59],["The Following",60,69]],
  "8671-resident-evil-2": [["Base Game",1,42],["The Ghost Survivors",43,44],["Another Survivor",45,45]],
  "21539-resident-evil-4": [["Base Game",1,40],["Separate Ways",41,47]],
  "12873-resident-evil-village": [["Base Game",1,50],["Winters' Expansion",51,57]],
  "4389-resident-evil-6": [["Base Game",1,51],["Onslaught",52,56],["Survivors",57,61],["Predator",62,66],["Siege",67,71]],
  "4850-resident-evil-5": [["Base Game",1,51],["Versus Pack",52,61],["Lost in Nightmares",62,66],["Desperate Escape",67,71]],
};

const sampleGames = [
  {
    id: crypto.randomUUID(),
    title: "Blasphemous II",
    status: "Platino",
    platform: "PS5",
    platinumNumber: "001",
    duration: "18 h",
    difficulty: "3/10",
    trophy: "Logro de platino",
    progress: 100,
    rarity: "Platino",
    notes: "Platino directo, con una estética brutal y una dificultad bastante llevadera si vas atento a los coleccionables.",
    imageData: "",
    imageUrl: "",
    trophies: [
      { id: crypto.randomUUID(), name: "Logro de platino", type: "Platino", earned: true },
      { id: crypto.randomUUID(), name: "Primer penitente", type: "Bronce", earned: true },
      { id: crypto.randomUUID(), name: "Maestría completa", type: "Oro", earned: true },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: "Final Fantasy VII Rebirth",
    status: "En progreso",
    platform: "PS5",
    platinumNumber: "",
    duration: "72 h",
    difficulty: "7/10",
    trophy: "",
    progress: 62,
    rarity: "Épica",
    notes: "En marcha. Tiene pinta de ser uno de esos platinos largos, de paciencia y cariño.",
    imageData: "",
    imageUrl: "",
    trophies: [
      { id: crypto.randomUUID(), name: "Inicio del viaje", type: "Bronce", earned: true },
      { id: crypto.randomUUID(), name: "Desafío pendiente", type: "Plata", earned: false },
      { id: crypto.randomUUID(), name: "Platino", type: "Platino", earned: false },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const state = {
  games: loadGames(),
  selectedId: null,
  filter: "all",
  platformFilter: "all",
  sort: localStorage.getItem(LIBRARY_SORT_STORAGE) || "added",
  view: "library",
};

const trophyPackState = {
  cache: loadTrophyPackCache(),
  pending: new Set(),
  failed: new Set(),
};

let deferredInstallPrompt = null;
let psnProfilesSyncInFlight = false;
let bundledTrophiesLoadPromise = null;

const elements = {
  statPlatinums: document.querySelector("#statPlatinums"),
  statProgress: document.querySelector("#statProgress"),
  statBacklog: document.querySelector("#statBacklog"),
  gameList: document.querySelector("#gameList"),
  libraryGrid: document.querySelector("#libraryGrid"),
  librarySection: document.querySelector("#librarySection"),
  catalogSection: document.querySelector("#catalogSection"),
  cardsSection: document.querySelector("#cardsSection"),
  vaultSearch: document.querySelector("#vaultSearchInput"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  connectionStatus: document.querySelector("#connectionStatus"),
  installAppButton: document.querySelector("#installAppButton"),
  exportBackupButton: document.querySelector("#exportBackupButton"),
  importBackupButton: document.querySelector("#importBackupButton"),
  backupFileInput: document.querySelector("#backupFileInput"),
  backupStatus: document.querySelector("#backupStatus"),
  lastSyncStatus: document.querySelector("#lastSyncStatus"),
  rawgKey: document.querySelector("#rawgKeyInput"),
  rawgKeyStatus: document.querySelector("#rawgKeyStatus"),
  clearRawgKeyButton: document.querySelector("#clearRawgKeyButton"),
  psnProfilesInput: document.querySelector("#psnProfilesInput"),
  psnProfilesStatus: document.querySelector("#psnProfilesStatus"),
  clearPsnProfilesButton: document.querySelector("#clearPsnProfilesButton"),
  psnProfileCard: document.querySelector("#psnProfileCard"),
  psnProfileCardImage: document.querySelector("#psnProfileCardImage"),
  psnSummaryTitle: document.querySelector("#psnSummaryTitle"),
  psnSummaryText: document.querySelector("#psnSummaryText"),
  openPsnProfileButton: document.querySelector("#openPsnProfileButton"),
  syncPsnProfileButton: document.querySelector("#syncPsnProfileButton"),
  improveCoversButton: document.querySelector("#improveCoversButton"),
  openGamePsnButton: document.querySelector("#openGamePsnButton"),
  findGamePsnButton: document.querySelector("#findGamePsnButton"),
  gameSearch: document.querySelector("#gameSearchInput"),
  searchGameButton: document.querySelector("#searchGameButton"),
  searchResults: document.querySelector("#searchResults"),
  catalogEmptyState: document.querySelector("#catalogEmptyState"),
  emptySearchButton: document.querySelector("#emptySearchButton"),
  newGameButton: document.querySelector("#newGameButton"),
  newGameTopButton: document.querySelector("#newGameTopButton"),
  deleteButton: document.querySelector("#deleteButton"),
  form: document.querySelector("#gameForm"),
  title: document.querySelector("#titleInput"),
  status: document.querySelector("#statusInput"),
  platform: document.querySelector("#platformInput"),
  platinumNumber: document.querySelector("#platinumNumberInput"),
  duration: document.querySelector("#durationInput"),
  difficulty: document.querySelector("#difficultyInput"),
  trophy: document.querySelector("#trophyInput"),
  progress: document.querySelector("#progressInput"),
  progressLabel: document.querySelector("#progressLabel"),
  notes: document.querySelector("#notesInput"),
  trophyImport: document.querySelector("#trophyImportInput"),
  syncGameTrophiesButton: document.querySelector("#syncGameTrophiesButton"),
  importTrophiesButton: document.querySelector("#importTrophiesButton"),
  addTrophyButton: document.querySelector("#addTrophyButton"),
  trophyList: document.querySelector("#trophyList"),
  trophyProgressBadge: document.querySelector("#trophyProgressBadge"),
  gameProgressHero: document.querySelector("#gameProgressHero"),
  copyCaptionButton: document.querySelector("#copyCaptionButton"),
};

init();

function init() {
  if (!state.games.length) {
    state.games = sampleGames;
    saveGames();
  }

  cleanupEmptyNewGames();
  dedupeLibraryGames();
  saveGames();
  state.selectedId = state.games[0]?.id || "";
  elements.rawgKey.value = "";
  elements.psnProfilesInput.value = localStorage.getItem(PSNPROFILES_USER_STORAGE) || "";
  updateRawgKeyStatus();
  updatePsnProfilesConnection();
  updateLastSyncStatus();
  setupPwa();
  importBundledPsnProfilesData();
  restorePsnProfilesCovers();
  setupAutomaticPsnProfilesSync();

  elements.newGameButton?.addEventListener("click", () => {
    addNewGame();
  });

  elements.newGameTopButton?.addEventListener("click", () => {
    addNewGame();
  });

  let catalogSearchTimer = 0;
  let librarySearchFrame = 0;
  elements.vaultSearch.addEventListener("input", () => {
    window.cancelAnimationFrame(librarySearchFrame);
    librarySearchFrame = window.requestAnimationFrame(renderList);
    window.clearTimeout(catalogSearchTimer);
    const query = elements.vaultSearch.value.trim();
    if (query.length < 2) return;
    catalogSearchTimer = window.setTimeout(() => openCatalogSearchFromGlobal(), 650);
  });
  elements.vaultSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openCatalogSearchFromGlobal();
    }
  });

  function addNewGame() {
    const game = createGame();
    state.selectedId = game.id;
    state.view = "detail";
    setActiveViewButton("detail");
    saveGames();
    render();
  }

  function openCatalogSearchFromGlobal() {
    const query = elements.vaultSearch.value.trim();
    if (!query) return;
    state.view = "search";
    setActiveViewButton("search");
    elements.gameSearch.value = query;
    searchRawgGames();
    renderView();
  }

  elements.deleteButton.addEventListener("click", () => {
    if (state.games.length <= 1) {
      alert("Dejo al menos una ficha para que no se quede vacío.");
      return;
    }
    const game = getSelectedGame();
    if (!confirm(`¿Eliminar "${game.title || "esta ficha"}"?`)) return;
    state.games = state.games.filter((item) => item.id !== state.selectedId);
    state.selectedId = state.games[0]?.id;
    saveGames();
    render();
  });

  document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderList();
    });
  });

  document.querySelectorAll(".platform-filter").forEach((button) => {
    button.addEventListener("click", () => {
      state.platformFilter = button.dataset.platform;
      document.querySelectorAll(".platform-filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderList();
    });
  });

  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.sort = button.dataset.sort || "added";
      localStorage.setItem(LIBRARY_SORT_STORAGE, state.sort);
      updateLibrarySortButtons();
      if (state.sort === "recent") {
        await ensureBundledTrophiesLoaded();
      }
      renderList();
    });
  });
  updateLibrarySortButtons();

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
      const shortcut = button.dataset.filterShortcut;
      if (shortcut) {
        state.filter = shortcut;
        state.view = "library";
        document.querySelectorAll(".filter").forEach((item) => {
          item.classList.toggle("active", item.dataset.filter === shortcut);
        });
      } else {
        state.view = button.dataset.view || "library";
        if (state.view === "library") state.filter = "all";
      }
      setActiveViewButton(state.view);
      renderView();
      renderList();
    });
  });

  elements.settingsButton.addEventListener("click", () => {
    elements.settingsDialog.showModal();
  });

  elements.installAppButton?.addEventListener("click", installPwa);
  elements.exportBackupButton?.addEventListener("click", exportVaultBackup);
  elements.importBackupButton?.addEventListener("click", () => elements.backupFileInput?.click());
  elements.backupFileInput?.addEventListener("change", importVaultBackup);

  let rawgKeyTimer = 0;
  elements.rawgKey.addEventListener("input", () => {
    const key = elements.rawgKey.value.trim();
    localStorage.setItem(RAWG_KEY_STORAGE, key);
    updateRawgKeyStatus();
    window.clearTimeout(rawgKeyTimer);
    if (!key) return;
    rawgKeyTimer = window.setTimeout(() => {
      queueAutoCoverUpgrade();
      if (state.view === "search") searchRawgGames();
    }, 700);
  });

  elements.clearRawgKeyButton.addEventListener("click", () => {
    localStorage.removeItem(RAWG_KEY_STORAGE);
    elements.rawgKey.value = "";
    updateRawgKeyStatus();
  });

  elements.psnProfilesInput.addEventListener("input", () => {
    localStorage.setItem(PSNPROFILES_USER_STORAGE, cleanPsnProfilesUser(elements.psnProfilesInput.value));
    updatePsnProfilesConnection();
  });

  elements.clearPsnProfilesButton.addEventListener("click", () => {
    localStorage.removeItem(PSNPROFILES_USER_STORAGE);
    elements.psnProfilesInput.value = "";
    updatePsnProfilesConnection();
  });

  elements.openPsnProfileButton.addEventListener("click", () => {
    const user = getPsnProfilesUser();
    if (!user) {
      elements.settingsDialog.showModal();
      return;
    }
    window.open(getPsnProfilesUrl(user), "_blank", "noopener");
  });

  elements.syncPsnProfileButton.addEventListener("click", () => {
    importPsnProfilesGames({ silent: false });
  });

  elements.improveCoversButton.addEventListener("click", improveLibraryCoversFromRawg);

  elements.openGamePsnButton.addEventListener("click", () => {
    const game = getSelectedGame();
    const url = (game.trophy || "").trim();
    if (/^https?:\/\/(www\.)?psnprofiles\.com\//i.test(url)) {
      window.open(url, "_blank", "noopener");
      return;
    }
    alert("Pega primero el enlace del juego en PSNProfiles.");
  });

  elements.findGamePsnButton.addEventListener("click", () => {
    const game = getSelectedGame();
    const query = encodeURIComponent(game.title || "");
    const user = getPsnProfilesUser();
    const url = user
      ? `${getPsnProfilesUrl(user)}?search=${query}`
      : `https://psnprofiles.com/search/games?q=${query}`;
    window.open(url, "_blank", "noopener");
  });

  elements.gameSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchRawgGames();
    }
  });

  elements.searchGameButton.addEventListener("click", searchRawgGames);
  elements.emptySearchButton.addEventListener("click", () => {
    elements.vaultSearch.value = "Elden Ring";
    elements.gameSearch.value = "Elden Ring";
    searchRawgGames();
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncFormToGame();
    saveGames();
    render();
  });

  [
    elements.title,
    elements.status,
    elements.platform,
    elements.platinumNumber,
    elements.duration,
    elements.difficulty,
    elements.trophy,
    elements.progress,
    elements.notes,
  ].filter(Boolean).forEach((input) => {
    input.addEventListener("input", () => {
      syncFormToGame();
      saveGames();
      renderSoft();
    });
  });

  elements.copyCaptionButton.addEventListener("click", copyCaption);
  elements.syncGameTrophiesButton?.addEventListener("click", importSelectedGameTrophiesFromPsnProfiles);
  elements.importTrophiesButton?.addEventListener("click", importTrophiesFromTextarea);
  elements.addTrophyButton?.addEventListener("click", addBlankTrophy);

  render();
  if (state.sort === "recent") {
    ensureBundledTrophiesLoaded().then(renderList).catch(() => {});
  }
  queueAutoCoverUpgrade();
}

function setupPwa() {
  updateConnectionStatus();
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (elements.installAppButton) {
      elements.installAppButton.disabled = false;
      elements.installAppButton.textContent = "Instalar app";
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (elements.installAppButton) {
      elements.installAppButton.disabled = true;
      elements.installAppButton.textContent = "App instalada";
    }
  });

  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone && elements.installAppButton) {
    elements.installAppButton.disabled = true;
    elements.installAppButton.textContent = "App instalada";
  }

  if ("serviceWorker" in navigator && /^https?:$/i.test(window.location.protocol)) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // La app continúa funcionando aunque el navegador no permita modo offline.
    });
  }
}

function updateConnectionStatus() {
  if (!elements.connectionStatus) return;
  const online = navigator.onLine;
  elements.connectionStatus.textContent = online ? "En línea" : "Sin conexión";
  elements.connectionStatus.classList.toggle("offline", !online);
}

async function installPwa() {
  if (deferredInstallPrompt) {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice?.outcome === "accepted") deferredInstallPrompt = null;
    return;
  }

  alert("En Android: abre el menú del navegador y pulsa ‘Añadir a pantalla de inicio’. En iPhone: Compartir → Añadir a pantalla de inicio.");
}

function exportVaultBackup() {
  const backup = {
    app: "The Carpe Vault",
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    psnProfilesUser: getPsnProfilesUser(),
    lastSync: localStorage.getItem(LAST_SYNC_STORAGE) || "",
    games: state.games,
    trophyPacks: trophyPackState.cache,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `the-carpe-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  if (elements.backupStatus) elements.backupStatus.textContent = `Copia creada: ${new Date().toLocaleString("es-ES")}`;
}

async function importVaultBackup(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 25 * 1024 * 1024) {
    alert("La copia es demasiado grande. El límite es 25 MB.");
    return;
  }

  try {
    const backup = JSON.parse(await file.text());
    if (backup?.app !== "The Carpe Vault" || !Array.isArray(backup.games) || backup.games.length > 5000) {
      throw new Error("El archivo no es una copia válida de The Carpe Vault.");
    }
    if (!confirm(`Se sustituirá la biblioteca actual por la copia de ${backup.games.length} juegos. ¿Continuar?`)) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.games.map(stripStoredTrophies)));
    localStorage.setItem(TROPHY_PACKS_STORAGE, JSON.stringify(backup.trophyPacks && typeof backup.trophyPacks === "object" ? backup.trophyPacks : {}));
    if (backup.psnProfilesUser) localStorage.setItem(PSNPROFILES_USER_STORAGE, cleanPsnProfilesUser(backup.psnProfilesUser));
    if (backup.lastSync) localStorage.setItem(LAST_SYNC_STORAGE, String(backup.lastSync));
    window.location.reload();
  } catch (error) {
    if (elements.backupStatus) elements.backupStatus.textContent = `No se pudo restaurar: ${error.message}`;
    alert(error.message || "No se pudo restaurar la copia.");
  }
}

function updateLastSyncStatus() {
  if (!elements.lastSyncStatus) return;
  const value = localStorage.getItem(LAST_SYNC_STORAGE);
  const date = value ? new Date(value) : null;
  const source = localStorage.getItem(LAST_SYNC_SOURCE_STORAGE);
  const sourceLabel = source === "live"
    ? " · lectura directa"
    : source === "snapshot"
      ? " · copia automática"
      : "";
  elements.lastSyncStatus.textContent = date && !Number.isNaN(date.getTime())
    ? `Última sincronización: ${date.toLocaleString("es-ES")}${sourceLabel}`
    : "Todavía no se ha sincronizado";
  elements.lastSyncStatus.classList.toggle("ok", Boolean(date && !Number.isNaN(date.getTime())));
}

function setupAutomaticPsnProfilesSync() {
  const requestSync = () => {
    void maybeAutoSyncPsnProfiles();
  };

  window.setTimeout(requestSync, 1800);
  window.setInterval(requestSync, PSN_AUTO_SYNC_CHECK_MS);
  window.addEventListener("online", requestSync);
  window.addEventListener("focus", requestSync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestSync();
  });
}

async function maybeAutoSyncPsnProfiles() {
  if (!getPsnProfilesUser() || psnProfilesSyncInFlight || !navigator.onLine) return;

  const lastSync = new Date(localStorage.getItem(LAST_SYNC_STORAGE) || 0).getTime();
  if (Number.isFinite(lastSync) && Date.now() - lastSync < PSN_AUTO_SYNC_INTERVAL_MS) return;

  const lastAttempt = new Date(localStorage.getItem(LAST_SYNC_ATTEMPT_STORAGE) || 0).getTime();
  if (Number.isFinite(lastAttempt) && Date.now() - lastAttempt < PSN_AUTO_SYNC_CHECK_MS) return;

  localStorage.setItem(LAST_SYNC_ATTEMPT_STORAGE, new Date().toISOString());
  await importPsnProfilesGames({ silent: true });
}

function setActiveViewButton(view) {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}

function renderView() {
  document.body.classList.toggle("detail-view", state.view === "detail");
  elements.catalogSection.hidden = state.view !== "search";
  elements.librarySection.hidden = state.view !== "library";
  elements.cardsSection.hidden = state.view !== "detail";
}

function updateRawgKeyStatus() {
  const key = getRawgKey();
  if (key) {
    elements.rawgKeyStatus.textContent = `API key guardada · ${maskKey(key)}`;
    elements.rawgKeyStatus.classList.add("ok");
  } else {
    elements.rawgKeyStatus.textContent = "Sin key guardada";
    elements.rawgKeyStatus.classList.remove("ok");
  }
}

function getRawgKey() {
  return elements.rawgKey?.value.trim() || localStorage.getItem(RAWG_KEY_STORAGE) || "";
}

function cleanPsnProfilesUser(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?psnprofiles\.com\//i, "")
    .split(/[/?#]/)[0]
    .trim();
}

function getPsnProfilesUser() {
  return cleanPsnProfilesUser(
    elements.psnProfilesInput?.value ||
    localStorage.getItem(PSNPROFILES_USER_STORAGE) ||
    getBundledPsnProfilesUser(),
  );
}

function getBundledPsnProfilesUser() {
  const games = Array.isArray(window.CARPE_PSNPROFILES_IMPORT) ? window.CARPE_PSNPROFILES_IMPORT : [];
  for (const game of games) {
    const match = String(game?.psnProfilesUrl || game?.trophy || "")
      .match(/psnprofiles\.com\/trophies\/[^/]+\/([^/?#]+)/i);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return "";
}

function getPsnProfilesUrl(user) {
  return `https://psnprofiles.com/${encodeURIComponent(user)}`;
}

function getPsnProfilesCardUrl(user) {
  return `https://card.psnprofiles.com/1/${encodeURIComponent(user)}.png`;
}

function updatePsnProfilesConnection() {
  const user = getPsnProfilesUser();
  if (elements.psnProfilesInput && elements.psnProfilesInput.value !== user) {
    elements.psnProfilesInput.value = user;
  }

  if (user) {
    localStorage.setItem(PSNPROFILES_USER_STORAGE, user);
    elements.psnProfilesStatus.textContent = `Conectado: ${user}`;
    elements.psnProfilesStatus.classList.add("ok");
    elements.psnSummaryTitle.textContent = `PSNProfiles conectado: ${user}`;
    elements.psnSummaryText.textContent = "Perfil público enlazado. Puedes abrirlo desde aquí y guardar enlaces de juegos en cada ficha.";
    elements.syncPsnProfileButton.disabled = false;
    elements.psnProfileCard.hidden = false;
    elements.psnProfileCard.href = getPsnProfilesUrl(user);
    elements.psnProfileCardImage.src = getPsnProfilesCardUrl(user);
    elements.psnProfileCardImage.alt = `Tarjeta pública de PSNProfiles de ${user}`;
  } else {
    elements.psnProfilesStatus.textContent = "PSNProfiles sin conectar";
    elements.psnProfilesStatus.classList.remove("ok");
    elements.psnSummaryTitle.textContent = "Perfil no conectado";
    elements.psnSummaryText.textContent = "Añade tu ID de PSNProfiles en ⚙️ para enlazar tu perfil público.";
    elements.syncPsnProfileButton.disabled = true;
    elements.psnProfileCard.hidden = true;
    elements.psnProfileCard.removeAttribute("href");
    elements.psnProfileCardImage.removeAttribute("src");
    elements.psnProfileCardImage.alt = "PSNProfiles trophy card";
  }
}

function importBundledPsnProfilesData() {
  const bundledGames = Array.isArray(window.CARPE_PSNPROFILES_IMPORT)
    ? window.CARPE_PSNPROFILES_IMPORT
    : [];
  if (!bundledGames.length) return;

  const result = mergePsnProfilesGames(bundledGames);
  if (result.created || result.updated) {
    saveGames();
    elements.psnSummaryText.textContent = `Importación local PSNProfiles: ${result.created} nuevos y ${result.updated} actualizados.`;
  }
}

function importBundledTrophiesForExistingGames() {
  return 0;
}

function getBundledTrophyMap() {
  return window.CARPE_PSNPROFILES_TROPHIES && typeof window.CARPE_PSNPROFILES_TROPHIES === "object"
    ? window.CARPE_PSNPROFILES_TROPHIES
    : {};
}

function ensureBundledTrophiesLoaded() {
  if (Object.keys(getBundledTrophyMap()).length) {
    return Promise.resolve(getBundledTrophyMap());
  }
  if (bundledTrophiesLoadPromise) return bundledTrophiesLoadPromise;

  bundledTrophiesLoadPromise = loadFreshSnapshotScript(
    `./psnprofiles-trophies.js?v=${Date.now()}`,
    "CARPE_PSNPROFILES_TROPHIES",
  ).then(() => getBundledTrophyMap()).catch((error) => {
    bundledTrophiesLoadPromise = null;
    throw error;
  });
  return bundledTrophiesLoadPromise;
}

function findBundledTrophiesForGame(game, trophyMap = getBundledTrophyMap()) {
  const titleMatch = findBundledPsnProfilesGameByTitle(game?.title, game?.platform);
  const keys = [
    game.psnProfilesId,
    extractPsnProfilesGameId(game.psnProfilesUrl || game.trophy),
    titleMatch?.psnProfilesId,
    normalizeTitle(game.title),
  ].filter(Boolean);
  for (const key of keys) {
    if (Array.isArray(trophyMap[key])) return trophyMap[key];
  }
  return [];
}

function getDisplayTrophies(game) {
  const bundled = findBundledTrophiesForGame(game);
  const trophies = bundled.length ? bundled : Array.isArray(game.trophies) ? game.trophies : [];
  // Los rangos revisados manualmente prevalecen sobre una lectura antigua de caché.
  return applyVerifiedTrophyRanges(game, applyCachedTrophyPacks(game, trophies));
}

function applyVerifiedTrophyRanges(game, trophies) {
  const gameKey = game?.psnProfilesId || extractPsnProfilesGameId(game?.psnProfilesUrl || game?.trophy);
  const ranges = PSN_TROPHY_PACK_RANGES[gameKey];
  if (!ranges?.length) return trophies;

  return trophies.map((trophy, index) => {
    const sourceIndex = index + 1;
    const range = ranges.find(([, start, end]) => sourceIndex >= start && sourceIndex <= end);
    return range ? { ...trophy, group: range[0], sourceIndex } : trophy;
  });
}

function applyCachedTrophyPacks(game, trophies) {
  const packMap = trophyPackState.cache[getTrophyPackCacheKey(game)];
  if (!packMap) return trophies;
  return trophies.map((trophy) => {
    const key = getTrophyPackLookupKeys(trophy).find((item) => packMap[item]);
    if (!key) return trophy;
    const imported = packMap[key];
    if (typeof imported === "string") return { ...trophy, group: imported };
    return {
      ...trophy,
      group: imported.group || trophy.group || "Base Game",
      imageUrl: imported.imageUrl || trophy.imageUrl || "",
      type: imported.type || trophy.type || "Trofeo",
    };
  });
}

function getTrophyPackCacheKey(game) {
  return game?.psnProfilesId || extractPsnProfilesGameId(game?.psnProfilesUrl || game?.trophy) || normalizeTitle(game?.title);
}

function getTrophyPackLookupKeys(trophy) {
  return [
    trophy?.id,
    normalizeTitle(trophy?.name),
  ].filter(Boolean);
}

async function importPsnProfilesGames({ silent = false } = {}) {
  const user = getPsnProfilesUser();
  if (!user) {
    if (!silent) elements.settingsDialog.showModal();
    return false;
  }

  if (psnProfilesSyncInFlight) return false;
  psnProfilesSyncInFlight = true;

  const originalText = elements.syncPsnProfileButton.textContent;
  const previousSummary = elements.psnSummaryText.textContent;
  elements.syncPsnProfileButton.textContent = "Sincronizando...";
  elements.syncPsnProfileButton.disabled = true;
  elements.psnSummaryText.textContent = silent
    ? "Sincronizando automáticamente con PSNProfiles..."
    : "Cargando la última sincronización automática...";

  try {
    if (!silent) {
      const snapshot = await reloadBundledPsnProfilesSnapshot();
      if (snapshot.available) {
        const syncedAt = new Date();
        localStorage.setItem(LAST_SYNC_STORAGE, syncedAt.toISOString());
        localStorage.setItem(LAST_SYNC_SOURCE_STORAGE, "snapshot");
        if (snapshot.updatedAt) {
          localStorage.setItem(LAST_SYNC_SNAPSHOT_STORAGE, snapshot.updatedAt);
        }
        updateLastSyncStatus();
        render();
        const snapshotDate = snapshot.updatedAt
          ? new Date(snapshot.updatedAt).toLocaleString("es-ES")
          : "más reciente";
        elements.psnSummaryText.textContent = `Datos actualizados con la copia automática ${snapshotDate}. ${snapshot.created} juegos nuevos y ${snapshot.updated} revisados.`;
        return true;
      }
      elements.psnSummaryText.textContent = "No encontré una copia automática; intentando la lectura directa de PSNProfiles...";
    }

    const profileText = await fetchPsnProfilesProfile(user);
    const importedGames = parsePsnProfilesGames(profileText, user);

    if (!importedGames.length) {
      throw new Error("No he encontrado juegos en el perfil público. Puede que PSNProfiles haya cambiado el formato o esté bloqueando la lectura.");
    }

    const changedImports = importedGames.filter(hasPsnProfilesProgressChanged);
    const librarySizeBefore = state.games.length;
    const result = mergePsnProfilesGames(importedGames);
    dedupeLibraryGames();
    result.created = Math.max(0, state.games.length - librarySizeBefore);
    const trophyUpdates = await syncChangedPsnProfilesTrophies(changedImports);
    saveGames();
    if (!silent) {
      state.view = "library";
      setActiveViewButton("library");
    }
    const syncedAt = new Date();
    localStorage.setItem(LAST_SYNC_STORAGE, syncedAt.toISOString());
    localStorage.setItem(LAST_SYNC_SOURCE_STORAGE, "live");
    updateLastSyncStatus();
    render();
    const detailText = trophyUpdates ? ` Detalle actualizado en ${trophyUpdates} juego${trophyUpdates === 1 ? "" : "s"}.` : "";
    elements.psnSummaryText.textContent = `Sincronización completa: ${result.created} nuevos y ${result.updated} revisados.${detailText} Última lectura: ${new Date().toLocaleString("es-ES")}.`;
    return true;
  } catch (error) {
    const snapshot = await reloadBundledPsnProfilesSnapshot();
    if (snapshot.available) {
      const syncedAt = new Date();
      localStorage.setItem(LAST_SYNC_STORAGE, syncedAt.toISOString());
      localStorage.setItem(LAST_SYNC_SOURCE_STORAGE, "snapshot");
      if (snapshot.updatedAt) {
        localStorage.setItem(LAST_SYNC_SNAPSHOT_STORAGE, snapshot.updatedAt);
      }
      updateLastSyncStatus();
      render();
      const snapshotDate = snapshot.updatedAt
        ? new Date(snapshot.updatedAt).toLocaleString("es-ES")
        : "disponible";
      elements.psnSummaryText.textContent = `PSNProfiles bloqueó la lectura directa, pero la biblioteca se ha actualizado con la copia automática del ${snapshotDate}. ${snapshot.created} juegos nuevos y ${snapshot.updated} revisados.`;
      return true;
    }

    elements.psnSummaryText.textContent = silent
      ? previousSummary
      : "No se pudo leer PSNProfiles ni cargar la copia automática. Revisa la conexión y vuelve a intentarlo.";
    return false;
  } finally {
    psnProfilesSyncInFlight = false;
    elements.syncPsnProfileButton.textContent = originalText || "Sincronizar ahora";
    elements.syncPsnProfileButton.disabled = !getPsnProfilesUser();
  }
}

async function reloadBundledPsnProfilesSnapshot() {
  try {
    const cacheKey = Date.now();
    await loadFreshSnapshotScript(`./psnprofiles-import.js?v=${cacheKey}`, "CARPE_PSNPROFILES_IMPORT");
    await loadFreshSnapshotScript(`./psnprofiles-trophies.js?v=${cacheKey}`, "CARPE_PSNPROFILES_TROPHIES");

    const bundledGames = Array.isArray(window.CARPE_PSNPROFILES_IMPORT)
      ? window.CARPE_PSNPROFILES_IMPORT
      : [];
    if (!bundledGames.length) {
      return { available: false, created: 0, updated: 0, updatedAt: "" };
    }

    const librarySizeBefore = state.games.length;
    const result = mergePsnProfilesGames(bundledGames);
    dedupeLibraryGames();
    result.created = Math.max(0, state.games.length - librarySizeBefore);
    saveGames();

    let metadata = {};
    try {
      const response = await fetch(`./api/snapshot-meta?v=${cacheKey}`, { cache: "no-store" });
      if (response.ok) metadata = await response.json();
    } catch {
      // La copia sigue siendo utilizable aunque el servidor aún no exponga metadatos.
    }

    return {
      available: true,
      created: result.created,
      updated: result.updated,
      updatedAt: metadata.updatedAt || "",
    };
  } catch {
    return { available: false, created: 0, updated: 0, updatedAt: "" };
  }
}

function loadFreshSnapshotScript(src, globalName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.snapshotGlobal = globalName;
    script.onload = () => {
      script.remove();
      if (window[globalName]) resolve(window[globalName]);
      else reject(new Error(`La copia ${globalName} no contiene datos.`));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`No se pudo cargar ${src}.`));
    };
    document.head.appendChild(script);
  });
}

function hasPsnProfilesProgressChanged(imported) {
  const existing = findExistingLibraryGame(imported);
  if (!existing) return true;
  return Number(existing.progress || 0) !== Number(imported.progress || 0) ||
    Number(existing.trophiesEarned || 0) !== Number(imported.trophiesEarned || 0) ||
    Number(existing.trophiesTotal || 0) !== Number(imported.trophiesTotal || 0);
}

async function syncChangedPsnProfilesTrophies(changedImports, limit = 8) {
  let updated = 0;

  for (const imported of changedImports.slice(0, limit)) {
    const game = findExistingLibraryGame(imported);
    const psnpUrl = imported.psnProfilesUrl || game?.psnProfilesUrl || "";
    if (!game || !/^https?:\/\/(www\.)?psnprofiles\.com\/trophies\/\d+[^/]*\/[^/]+/i.test(psnpUrl)) continue;

    try {
      const text = await fetchPsnProfilesTrophyText(psnpUrl, { preserveUser: true });
      const trophies = parseStandalonePsnProfilesTrophies(text, imported.psnProfilesId || game.psnProfilesId);
      if (!trophies.length) continue;

      game.trophies = trophies;
      game.trophiesEarned = trophies.filter((trophy) => trophy.earned).length;
      game.trophiesTotal = trophies.length;
      game.updatedAt = Date.now();
      delete trophyPackState.cache[getTrophyPackCacheKey(game)];
      updated += 1;
    } catch {
      // Un bloqueo puntual de PSNProfiles no debe detener el resto de la sincronización.
    }
  }

  if (updated) saveTrophyPackCache();
  return updated;
}

async function fetchPsnProfilesProfile(user) {
  const profileUrl = getPsnProfilesUrl(user);
  const localProxy = `http://127.0.0.1:8788/api/psnprofiles?url=${encodeURIComponent(profileUrl)}`;
  const urls = [
    localProxy,
    profileUrl,
    `https://r.jina.ai/http://${profileUrl.replace(/^https?:\/\//, "")}`,
    `https://r.jina.ai/http://http://${profileUrl.replace(/^https?:\/\//, "")}`,
    `https://r.jina.ai/http://https://${profileUrl.replace(/^https?:\/\//, "")}`,
  ];
  const errors = [];

  for (const url of [...new Set(urls)]) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html,text/plain,*/*" },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const text = await response.text();
      if (text && /GAMES|Games Played|Trophies/i.test(text)) {
        return text;
      }
      errors.push(`${shortUrl(url)} sin datos reconocibles`);
    } catch (error) {
      errors.push(`${shortUrl(url)}: ${error.message}`);
    }
  }

  throw new Error(`PSNProfiles no dejó leer el perfil desde la app. Detalle: ${errors.slice(0, 2).join(" · ")}`);
}

function shortUrl(url) {
  return url.replace(/^https?:\/\//, "").slice(0, 70);
}

function parsePsnProfilesGames(text, user) {
  if (/<table[^>]+id=["']gamesTable["']/i.test(text)) {
    return parsePsnProfilesGamesFromHtml(text, user);
  }
  return parsePsnProfilesGamesFromText(text, user);
}

function parsePsnProfilesGamesFromHtml(html, user) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = [...doc.querySelectorAll("#gamesTable tr")];
  const games = [];

  for (const row of rows) {
    const titleLink = row.querySelector('a.title[href*="/trophies/"]') || [...row.querySelectorAll('a[href*="/trophies/"]')].find((link) => cleanGameTitle(link.textContent));
    if (!titleLink) continue;

    const title = cleanGameTitle(titleLink.textContent);
    if (!title) continue;

    const text = normalizeSpaces(row.textContent);
    const progress = extractIntegerProgress(text);
    const counts = extractTrophyCounts(text);
    const platform = extractPlatform(text);
    const hasPlatinum = /Platinum in|All\s+\d+\s+Trophies/i.test(text) || progress === 100;

    games.push({
      title,
      platform,
      progress,
      status: hasPlatinum ? "Platino" : progress > 0 ? "En progreso" : "Backlog",
      trophy: absolutePsnProfilesUrl(titleLink.getAttribute("href"), user),
      psnProfilesUrl: absolutePsnProfilesUrl(titleLink.getAttribute("href"), user),
      psnProfilesId: extractPsnProfilesGameId(titleLink.getAttribute("href")),
      trophiesEarned: counts.earned,
      trophiesTotal: counts.total,
      notes: createPsnProfilesNote(counts, progress, hasPlatinum),
      source: "PSNProfiles",
      updatedAt: Date.now(),
    });
  }

  return uniquePsnGames(games);
}

function parsePsnProfilesGamesFromText(text, user) {
  const lines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => normalizeSpaces(line))
    .filter(Boolean);
  const games = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const title = cleanGameTitle(lines[index]);
    const trophyLine = lines[index + 1] || "";
    const counts = extractTrophyCounts(trophyLine);
    if (!title || !counts.total) continue;
    if (!/Trophies/i.test(trophyLine)) continue;
    if (/^(HOME|FORUMS|GUIDES|GAMES|PROFILE|TROPHY LOG|STATS)$/i.test(title)) continue;

    const windowLines = lines.slice(index, index + 14);
    const joined = windowLines.join(" ");
    const platform = extractPlatform(joined);
    const progress = extractIntegerProgress(joined);
    const hasPlatinum = /Platinum in|All\s+\d+\s+Trophies/i.test(joined) || progress === 100;
    const slug = slugifyPsnTitle(title);
    const fallbackUrl = `https://psnprofiles.com/search/games?q=${encodeURIComponent(title)}`;

    games.push({
      title,
      platform,
      progress,
      status: hasPlatinum ? "Platino" : progress > 0 ? "En progreso" : "Backlog",
      trophy: fallbackUrl,
      psnProfilesUrl: fallbackUrl,
      psnProfilesId: slug,
      trophiesEarned: counts.earned,
      trophiesTotal: counts.total,
      notes: createPsnProfilesNote(counts, progress, hasPlatinum),
      source: "PSNProfiles",
      updatedAt: Date.now(),
    });
  }

  return uniquePsnGames(games);
}

function uniquePsnGames(games) {
  const seen = new Set();
  return games.filter((game) => {
    const key = `${normalizeTitle(game.title)}|${game.platform}|${game.trophiesTotal}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergePsnProfilesGames(importedGames) {
  let created = 0;
  let updated = 0;

  for (const imported of importedGames) {
    const reusableCover = findReusableRawgCover(imported);
    const existing = state.games.find((game) => {
      if (imported.psnProfilesId && game.psnProfilesId === imported.psnProfilesId) return true;
      return normalizeTitle(game.title) === normalizeTitle(imported.title) && normalizePlatform(game.platform) === normalizePlatform(imported.platform);
    });

    if (existing) {
      Object.assign(existing, {
        title: imported.title,
        platform: imported.platform || existing.platform,
        status: imported.status,
        progress: imported.progress,
        trophy: imported.psnProfilesUrl || existing.trophy,
        imageUrl: shouldKeepExistingCover(existing) ? existing.imageUrl : reusableCover?.imageUrl || imported.imageUrl || existing.imageUrl,
        imageData: existing.imageData || imported.imageData || "",
        coverSource: shouldKeepExistingCover(existing) ? existing.coverSource : reusableCover ? "rawg" : existing.coverSource,
        rawgId: existing.rawgId || reusableCover?.rawgId,
        rawgSlug: existing.rawgSlug || reusableCover?.rawgSlug,
        coverMatchVersion: existing.coverMatchVersion || reusableCover?.coverMatchVersion,
        psnProfilesUrl: imported.psnProfilesUrl,
        psnProfilesId: imported.psnProfilesId || existing.psnProfilesId,
        trophiesEarned: imported.trophiesEarned,
        trophiesTotal: imported.trophiesTotal,
        notes: mergeNotes(existing.notes, imported.notes),
        updatedAt: Date.now(),
      });
      updated += 1;
    } else {
      state.games.unshift({
        id: crypto.randomUUID(),
        title: imported.title,
        status: imported.status,
        platform: imported.platform || "PS5",
        platinumNumber: "",
        duration: "",
        difficulty: "",
        trophy: imported.psnProfilesUrl || "",
        progress: imported.progress,
        rarity: imported.status === "Platino" ? "Platino" : "PSNProfiles",
        notes: imported.notes,
        imageData: "",
        imageUrl: reusableCover?.imageUrl || imported.imageUrl || "",
        coverSource: reusableCover ? "rawg" : "psnprofiles",
        rawgId: reusableCover?.rawgId,
        rawgSlug: reusableCover?.rawgSlug,
        coverMatchVersion: reusableCover?.coverMatchVersion,
        trophies: [],
        psnProfilesUrl: imported.psnProfilesUrl,
        psnProfilesId: imported.psnProfilesId,
        trophiesEarned: imported.trophiesEarned,
        trophiesTotal: imported.trophiesTotal,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      created += 1;
    }
  }

  state.selectedId = state.games[0]?.id || state.selectedId;
  dedupeLibraryGames();
  return { created, updated };
}

function findExistingLibraryGame(candidate) {
  return state.games.find((game) => {
    if (candidate.psnProfilesId && game.psnProfilesId === candidate.psnProfilesId) return true;
    if (candidate.rawgId && game.rawgId === candidate.rawgId) return true;
    return normalizeTitle(game.title) === normalizeTitle(candidate.title) &&
      normalizePlatform(game.platform) === normalizePlatform(candidate.platform);
  });
}

function dedupeLibraryGames() {
  const buckets = new Map();

  for (const game of state.games) {
    const keys = getLibraryDedupeKeys(game);
    if (!keys.length) continue;
    const current = keys.map((key) => buckets.get(key)).find(Boolean);
    const winner = current ? mergeDuplicateLibraryGames(current, game) : game;

    for (const key of keys) buckets.set(key, winner);
    if (current && winner !== current) {
      for (const key of getLibraryDedupeKeys(current)) buckets.set(key, winner);
    }
  }

  const keep = new Set();
  const cleaned = [];
  for (const game of state.games) {
    const winner = buckets.get(getLibraryDedupeKeys(game)[0]);
    if (!winner || keep.has(winner)) continue;
    keep.add(winner);
    cleaned.push(winner);
  }

  state.games = cleaned;
  if (state.selectedId && !state.games.some((game) => game.id === state.selectedId)) {
    state.selectedId = state.games[0]?.id || "";
  }
}

function getLibraryDedupeKeys(game) {
  // Cada identificador de PSNProfiles representa una lista de trofeos real.
  // Dos ediciones pueden compartir título y ficha de RAWG, pero no deben
  // fusionarse si PSNProfiles las considera juegos distintos.
  if (game?.psnProfilesId) {
    return [`psn:${game.psnProfilesId}`];
  }

  const keys = [];
  const titleKey = normalizeTitle(game?.title);
  const platformKey = normalizePlatform(game?.platform);
  if (titleKey) keys.push(`title:${titleKey}|${platformKey}`);
  if (game?.rawgId) keys.push(`rawg:${game.rawgId}`);
  return [...new Set(keys)];
}

function mergeDuplicateLibraryGames(a, b) {
  const winner = getLibraryGameQualityScore(b) > getLibraryGameQualityScore(a) ? b : a;
  const other = winner === a ? b : a;
  winner.imageUrl = chooseBestCover(winner.imageUrl, other.imageUrl);
  winner.rawgId = winner.rawgId || other.rawgId;
  winner.rawgSlug = winner.rawgSlug || other.rawgSlug;
  winner.psnProfilesId = winner.psnProfilesId || other.psnProfilesId;
  winner.psnProfilesUrl = winner.psnProfilesUrl || other.psnProfilesUrl;
  winner.trophy = winner.trophy || other.trophy;
  winner.trophies = Array.isArray(winner.trophies) && winner.trophies.length ? winner.trophies : other.trophies;
  winner.trophiesEarned = Math.max(Number(winner.trophiesEarned || 0), Number(other.trophiesEarned || 0));
  winner.trophiesTotal = Math.max(Number(winner.trophiesTotal || 0), Number(other.trophiesTotal || 0));
  winner.progress = Math.max(Number(winner.progress || 0), Number(other.progress || 0));
  return winner;
}

function getLibraryGameQualityScore(game) {
  return (game?.psnProfilesId ? 1000 : 0) +
    (game?.psnProfilesUrl || game?.trophy ? 400 : 0) +
    (Number(game?.trophiesTotal || 0) * 4) +
    (Number(game?.trophiesEarned || 0) * 2) +
    (game?.rawgId ? 120 : 0) +
    (game?.imageUrl ? (isPsnProfilesCover(game.imageUrl) ? 90 : 40) : 0) +
    Number(game?.updatedAt || 0) / 100000000000;
}

function chooseBestCover(primary, fallback) {
  if (!primary) return fallback || "";
  if (!fallback) return primary;
  if (isPsnProfilesCover(primary) && !isPsnProfilesCover(fallback)) return fallback;
  return primary;
}

function restorePsnProfilesCovers() {
  // Cuando RAWG está conectado, PSNProfiles solo aporta trofeos: sus miniaturas
  // son demasiado pequeñas para las tarjetas grandes de la biblioteca.
  if (getRawgKey()) return;
  const imports = Array.isArray(window.CARPE_PSNPROFILES_IMPORT) ? window.CARPE_PSNPROFILES_IMPORT : [];
  const byId = new Map(imports.filter((game) => game.psnProfilesId).map((game) => [game.psnProfilesId, game]));
  let changed = false;

  for (const game of state.games) {
    const imported = byId.get(game.psnProfilesId || extractPsnProfilesGameId(game.psnProfilesUrl || game.trophy));
    if (!imported?.imageUrl) continue;
    if (shouldKeepExistingCover(game)) continue;
    if (game.imageUrl === imported.imageUrl && !game.imageData && game.coverSource !== "rawg") continue;
    game.imageUrl = imported.imageUrl;
    game.imageData = "";
    game.coverSource = "psnprofiles";
    changed = true;
  }

  if (changed) saveGames();
}

function isPsnProfilesCover(url) {
  return String(url || "").includes("img.psnprofiles.com/game/");
}

function findReusableRawgCover(imported) {
  if (RAWG_COVER_OVERRIDES[getRawgCoverOverrideKey(imported)]) return null;
  const title = normalizeTitle(imported?.title);
  const total = Number(imported?.trophiesTotal || 0);
  if (!title) return null;

  return state.games.find((game) => {
    if (normalizeTitle(game.title) !== title) return false;
    if (total && Number(game.trophiesTotal || 0) && Number(game.trophiesTotal) !== total) return false;
    if (!game.imageUrl || isPsnProfilesCover(game.imageUrl)) return false;
    return Boolean(game.coverSource === "rawg" || game.rawgId || game.rawgSlug);
  }) || null;
}

function shouldKeepExistingCover(game) {
  const imageUrl = String(game?.imageUrl || "");
  if (!imageUrl) return false;
  if (game.rawgId || game.rawgSlug || game.coverSource === "rawg") return true;
  return !isPsnProfilesCover(imageUrl);
}

function mergeNotes(current, incoming) {
  if (!incoming) return current || "";
  if (!current) return incoming;
  if (current.includes(incoming)) return current;
  return `${current}\n\n${incoming}`;
}

function normalizeSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanGameTitle(value) {
  return normalizeSpaces(value)
    .replace(/\s+•\s+(EU|NA|JP|AS|DG)$/i, "")
    .replace(/\s+\|\s+PSNProfiles.*$/i, "")
    .trim();
}

function normalizeTitle(value) {
  return cleanGameTitle(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function slugifyPsnTitle(value) {
  return normalizeTitle(value).slice(0, 80);
}

function extractTrophyCounts(text) {
  const normalized = normalizeSpaces(text);
  const allMatch = normalized.match(/All\s+(\d+)\s+Trophies/i);
  if (allMatch) return { earned: Number(allMatch[1]), total: Number(allMatch[1]) };
  const partialMatch = normalized.match(/(\d+)\s+of\s+(\d+)\s+Trophies/i);
  if (partialMatch) return { earned: Number(partialMatch[1]), total: Number(partialMatch[2]) };
  return { earned: 0, total: 0 };
}

function extractIntegerProgress(text) {
  const matches = [...normalizeSpaces(text).matchAll(/(^|\s)(\d{1,3})%(?=\s|$)/g)]
    .map((match) => Number(match[2]))
    .filter((value) => value >= 0 && value <= 100);
  return matches.length ? matches[0] : 0;
}

function extractPlatform(text) {
  const matches = normalizeSpaces(text).match(/\b(PS5|PS4|PS3|Vita|PC|PS5PC|PS4Vita)\b/i);
  if (!matches) return "PS5";
  const value = matches[1].toUpperCase();
  if (value.includes("PS5")) return "PS5";
  if (value.includes("PS4")) return "PS4";
  if (value.includes("PC")) return "PC";
  if (value.includes("VITA")) return "PS4";
  return value;
}

function absolutePsnProfilesUrl(href, user) {
  if (!href) return getPsnProfilesUrl(user);
  if (/^https?:\/\//i.test(href)) return href;
  return `https://psnprofiles.com${href.startsWith("/") ? "" : "/"}${href}`;
}

function extractPsnProfilesGameId(href) {
  const match = String(href || "").match(/\/trophies\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

function createPsnProfilesNote(counts, progress, hasPlatinum) {
  const total = counts.total ? `${counts.earned}/${counts.total} trofeos` : "Trofeos importados desde PSNProfiles";
  return `${total} · ${progress}% completado${hasPlatinum ? " · Platino detectado" : ""}.`;
}

function maskKey(key) {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

async function searchRawgGames() {
  const key = getRawgKey();
  const query = (elements.gameSearch.value || elements.vaultSearch.value).trim();

  if (!key) {
    elements.searchResults.innerHTML = `
      <div class="empty-state">
        <p>Activa una vez la conexiÃ³n con RAWG para buscar fuera de tu biblioteca y descargar portadas en alta calidad.</p>
        <button id="configureRawgButton" class="primary" type="button">Conectar RAWG</button>
      </div>`;
    document.querySelector("#configureRawgButton")?.addEventListener("click", () => elements.settingsDialog.showModal());
    elements.catalogEmptyState.hidden = true;
    return;
  }

  if (query.length < 2) {
    elements.searchResults.innerHTML = `<p class="muted">Escribe al menos 2 letras.</p>`;
    elements.catalogEmptyState.hidden = true;
    return;
  }

  elements.searchGameButton.textContent = "Buscando...";
  elements.searchGameButton.disabled = true;
  elements.searchResults.innerHTML = "";
  elements.catalogEmptyState.hidden = true;

  try {
    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", key);
    url.searchParams.set("search", query);
    url.searchParams.set("platforms", RAWG_PLATFORM_IDS[state.platformFilter] || RAWG_PLATFORM_IDS.all);
    url.searchParams.set("page_size", "6");
    url.searchParams.set("search_precise", "false");

    const response = await fetch(url);
    if (!response.ok) throw new Error(`RAWG respondió ${response.status}`);
    const data = await response.json();
    renderSearchResults(data.results || []);
  } catch (error) {
    elements.searchResults.innerHTML = `<p class="muted">No he podido buscar: ${escapeHtml(error.message)}</p>`;
  } finally {
    elements.searchGameButton.textContent = "Buscar juego";
    elements.searchGameButton.disabled = false;
  }
}

function queueAutoCoverUpgrade() {
  const key = getRawgKey();
  if (!key) return;
  const pending = state.games.some((game) => needsBetterCover(game));
  if (!pending) return;
  window.setTimeout(() => {
    improveLibraryCoversFromRawg({ silent: true, limit: 100 });
  }, 900);
}

function needsBetterCover(game) {
  if (!game.title || game.imageData) return false;
  const current = String(game.imageUrl || "");
  const override = RAWG_COVER_OVERRIDES[getRawgCoverOverrideKey(game)];
  if (override) {
    return Boolean(
      !current ||
      isPsnProfilesCover(current) ||
      Number(game.coverOverrideRevision || 0) < override.revision ||
      (game.coverSource === "rawg" && game.rawgSlug !== override.slug)
    );
  }
  // Una portada ya comprobada en esta versión no se consulta de nuevo si RAWG
  // no encontró una alternativa segura. Evita bucles y no toca portadas válidas.
  if (Number(game.coverMatchVersion || 0) >= RAWG_COVER_MATCH_VERSION) return false;
  return Boolean(!current || isPsnProfilesCover(current));
}

function getRawgCoverOverrideKey(game) {
  return game?.psnProfilesId || extractPsnProfilesGameId(game?.psnProfilesUrl || game?.trophy);
}

async function improveLibraryCoversFromRawg(options = {}) {
  const { silent = false, limit = Infinity } = options;
  const key = getRawgKey();
  if (!key) {
    if (!silent) elements.settingsDialog.showModal();
    return;
  }

  const button = elements.improveCoversButton;
  const originalText = button.textContent;
  button.disabled = true;
  let improved = 0;
  let checked = 0;

  try {
    const targets = state.games.filter(needsBetterCover).slice(0, limit);
    if (!targets.length) {
      if (!silent) button.textContent = "Portadas OK";
      return;
    }

    let cursor = 0;
    const updateGameCover = async () => {
      while (cursor < targets.length) {
        const game = targets[cursor];
        cursor += 1;
        checked += 1;
        button.textContent = `Portadas ${checked}/${targets.length}`;

        try {
          const override = RAWG_COVER_OVERRIDES[getRawgCoverOverrideKey(game)];
          const url = new URL("https://api.rawg.io/api/games");
          url.searchParams.set("key", key);
          url.searchParams.set("search", override?.search || game.title);
          url.searchParams.set("page_size", "8");
          url.searchParams.set("platforms", RAWG_PLATFORM_IDS[normalizePlatform(game.platform)] || RAWG_PLATFORM_IDS.all);
          url.searchParams.set("search_precise", "false");

          let response = await fetch(url);
          let data = response.ok ? await response.json() : { results: [] };
          let result = chooseBestRawgCoverResult(game, data.results || []);

          // Algunos juegos cross-buy aparecen en PSN como PS5 aunque RAWG solo los
          // catalogue en PS4/PS3. Reintentamos por título sin limitar plataforma.
          if (!result?.background_image) {
            url.searchParams.delete("platforms");
            response = await fetch(url);
            if (response.ok) {
              data = await response.json();
              result = chooseBestRawgCoverResult(game, data.results || []);
            }
          }

          // Las excepciones verificadas consultan también la ficha canónica. Así
          // evitamos conservar una miniatura de PSN si la búsqueda no devuelve
          // el juego exacto entre sus primeros resultados.
          if (override && result?.slug !== override.slug) {
            const exactUrl = new URL(`https://api.rawg.io/api/games/${override.slug}`);
            exactUrl.searchParams.set("key", key);
            const exactResponse = await fetch(exactUrl);
            if (exactResponse.ok) {
              const exactResult = await exactResponse.json();
              if (exactResult?.background_image) result = exactResult;
            }
          }

          // Respaldo verificado para casos donde RAWG no responde o no devuelve
          // imagen. Solo se usa en excepciones concretas, nunca en el resto.
          if (!result?.background_image && override?.fallbackImage) {
            result = {
              background_image: override.fallbackImage,
              slug: override.slug,
              coverSource: "verified",
            };
          }

          if (!result?.background_image) {
            game.coverMatchVersion = RAWG_COVER_MATCH_VERSION;
            if (override) game.coverOverrideRevision = override.revision;
            continue;
          }

          game.imageUrl = result.background_image;
          game.imageData = "";
          game.coverSource = result.coverSource || "rawg";
          game.coverMatchVersion = RAWG_COVER_MATCH_VERSION;
          game.rawgId = result.id;
          game.rawgSlug = result.slug;
          if (override) game.coverOverrideRevision = override.revision;
          game.rawgReleased = result.released || game.rawgReleased;
          game.rawgRating = result.rating || game.rawgRating;
          game.updatedAt = Date.now();
          improved += 1;
        } catch {
          // Una portada que falle no debe detener la renovación del resto.
        }
      }
    };

    const workers = Math.min(6, targets.length);
    await Promise.all(Array.from({ length: workers }, () => updateGameCover()));

    dedupeLibraryGames();
    saveGames();
    render();
    const remaining = state.games.filter(needsBetterCover).length;
    button.textContent = `${checked} revisadas · ${improved} mejoradas`;
    if (remaining && silent && targets.length >= limit) {
      window.setTimeout(() => improveLibraryCoversFromRawg({ silent: true, limit: 100 }), 1200);
    }
  } catch (error) {
    button.textContent = "Error portadas";
    if (!silent) alert(`No he podido mejorar portadas: ${error.message}`);
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, silent ? 800 : 2000);
  }
}

function chooseBestRawgCoverResult(game, results) {
  const override = RAWG_COVER_OVERRIDES[getRawgCoverOverrideKey(game)];
  if (override) {
    const exactOverride = results.find((result) => result?.slug === override.slug && result?.background_image);
    if (exactOverride) return exactOverride;
  }
  const normalizedTitle = normalizeTitle(game.title);
  const platform = normalizePlatform(game.platform);
  const candidates = results
    .filter((result) => result?.background_image)
    .map((result) => {
      const titleScore = getRawgTitleScore(normalizedTitle, normalizeTitle(result.name));
      return {
      result,
      titleScore,
      score:
        titleScore +
        getRawgPlatformScore(platform, result.platforms || []) +
        (Number(result.metacritic || 0) / 10) +
        (Number(result.rating || 0) * 2) +
        (result.background_image ? 10 : 0),
      };
    })
    .filter((candidate) => candidate.titleScore >= 60)
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.result || null;
}

function getRawgTitleScore(expected, actual) {
  if (!expected || !actual) return 0;
  if (actual === expected) return 100;
  const expectedWords = new Set(expected.split(" ").filter((word) => word.length > 1));
  const actualWords = new Set(actual.split(" ").filter((word) => word.length > 1));
  const overlap = [...expectedWords].filter((word) => actualWords.has(word)).length;
  const expectedCoverage = overlap / Math.max(expectedWords.size, 1);
  const actualCoverage = overlap / Math.max(actualWords.size, 1);
  if (expectedCoverage === 1 && actualCoverage >= 0.8) return 90;
  if (expectedCoverage >= 0.8 && actualCoverage >= 0.8) return 75;
  return Math.round(Math.min(expectedCoverage, actualCoverage) * 50);
}

function getRawgPlatformScore(platform, platforms = []) {
  const names = platforms.map((item) => item.platform?.name || "").join(" ");
  if (platform === "PS5" && /playstation 5/i.test(names)) return 18;
  if (platform === "PS4" && /playstation 4/i.test(names)) return 18;
  if (platform === "Switch" && /nintendo switch/i.test(names)) return 18;
  if (platform === "PC" && /\bpc\b/i.test(names)) return 18;
  return 0;
}

function renderSearchResults(results) {
  elements.searchResults.innerHTML = "";
  elements.catalogEmptyState.hidden = true;

  if (!results.length) {
    elements.searchResults.innerHTML = `<div class="empty-state">🧐<p>No he encontrado juegos con ese filtro.</p></div>`;
    return;
  }

  for (const result of results) {
    const card = document.createElement("article");
    card.className = "search-result";
    const platforms = (result.platforms || [])
      .map((item) => item.platform?.name)
      .filter(Boolean)
      .filter((name) => /playstation|nintendo switch|pc/i.test(name))
      .slice(0, 3)
      .join(" · ");
    card.innerHTML = `
      <div class="search-cover">
        ${result.background_image ? `<img alt="" src="${escapeHtml(result.background_image)}" loading="lazy" referrerpolicy="no-referrer" />` : ""}
      </div>
      <span>
        <strong>${escapeHtml(result.name || "Sin título")}</strong>
        <span>${escapeHtml([result.released || "Sin fecha", platforms].filter(Boolean).join(" · "))}</span>
        <em>Vista previa del catálogo</em>
      </span>
      <button class="tiny add-search-result" type="button">Añadir</button>
    `;
    card.querySelector(".add-search-result").addEventListener("click", () => applyRawgGame(result));
    elements.searchResults.appendChild(card);
  }
}

async function applyRawgGame(result) {
  const candidate = {
    title: result.name || "Nuevo juego",
    platform: detectPlayStationPlatform(result.platforms) || "PS5",
    rawgId: result.id,
  };
  const existing = findExistingLibraryGame(candidate);
  const game = existing || createGame();
  game.title = result.name || game.title;
  game.platform = detectPlayStationPlatform(result.platforms) || game.platform || "PS5";
  game.status = game.status || "En progreso";
  game.notes = game.notes || createRawgNote(result);
  game.rawgId = result.id;
  game.rawgSlug = result.slug;
  game.rawgReleased = result.released;
  game.rawgRating = result.rating;

  if (result.background_image) {
    game.imageUrl = result.background_image;
    game.coverSource = "rawg";
    game.coverMatchVersion = RAWG_COVER_MATCH_VERSION;
    try {
      game.imageData = await imageUrlToDataUrl(result.background_image);
    } catch {
      game.imageUrl = result.background_image;
    }
  }

  const psnMatch = findBundledPsnProfilesGameByTitle(game.title);
  if (psnMatch) {
    Object.assign(game, {
      title: psnMatch.title || game.title,
      status: psnMatch.status || game.status,
      platform: psnMatch.platform || game.platform,
      progress: Number(psnMatch.progress || game.progress || 0),
      trophy: psnMatch.psnProfilesUrl || game.trophy,
      psnProfilesUrl: psnMatch.psnProfilesUrl,
      psnProfilesId: psnMatch.psnProfilesId,
      trophiesEarned: psnMatch.trophiesEarned,
      trophiesTotal: psnMatch.trophiesTotal,
      imageUrl: game.imageUrl || psnMatch.imageUrl,
      imageData: game.imageData || "",
      coverSource: game.imageUrl ? "rawg" : "psnprofiles",
      rarity: psnMatch.rarity || game.rarity,
      notes: mergeNotes(game.notes, psnMatch.notes),
    });
  } else {
    await importPsnProfilesTrophySetForGame(game, result.name || game.title);
  }

  game.updatedAt = Date.now();
  state.selectedId = game.id;
  dedupeLibraryGames();
  saveGames();
  state.view = "detail";
  setActiveViewButton("detail");
  await render();
}

function findBundledPsnProfilesGameByTitle(title, platform = "") {
  const games = Array.isArray(window.CARPE_PSNPROFILES_IMPORT) ? window.CARPE_PSNPROFILES_IMPORT : [];
  const normalizedTitle = normalizeTitle(title);
  if (!normalizedTitle) return null;
  const normalizedPlatform = normalizePlatform(platform);
  const exactMatches = games.filter((game) => normalizeTitle(game.title) === normalizedTitle);
  return exactMatches.find((game) => !normalizedPlatform || normalizePlatform(game.platform) === normalizedPlatform) ||
    exactMatches[0] ||
    games.find((game) => {
      const candidate = normalizeTitle(game.title);
      return candidate.length >= 6 && normalizedTitle.length >= 6 &&
        (candidate.includes(normalizedTitle) || normalizedTitle.includes(candidate));
    });
}

async function importPsnProfilesTrophySetForGame(game, title) {
  try {
    const trophyPage = await findPsnProfilesTrophyPage(title);
    if (!trophyPage) return false;
    const text = await fetchPsnProfilesTrophyText(trophyPage.url);
    const trophies = parseStandalonePsnProfilesTrophies(text, trophyPage.id);
    if (!trophies.length) return false;

    game.psnProfilesUrl = trophyPage.url;
    game.trophy = trophyPage.url;
    game.psnProfilesId = trophyPage.id;
    game.trophies = trophies;
    game.trophiesTotal = trophies.length;
    game.trophiesEarned = 0;
    game.progress = 0;
    game.notes = mergeNotes(game.notes, `${trophies.length} trofeos importados desde PSNProfiles.`);
    return true;
  } catch {
    return false;
  }
}

async function findPsnProfilesTrophyPage(title) {
  const query = encodeURIComponent(title || "");
  if (!query) return null;
  const text = await fetchTextFromFallbackUrls([
    `https://r.jina.ai/http://https://psnprofiles.com/search/games?q=${query}`,
    `https://r.jina.ai/http://psnprofiles.com/search/games?q=${query}`,
  ]);
  const matches = [...text.matchAll(/\/trophies\/([0-9]+-[a-z0-9-]+)/gi)];
  if (!matches.length) return null;
  const normalizedTitle = normalizeTitle(title);
  const candidates = [...new Set(matches.map((match) => match[1]))].map((id) => ({
    id,
    title: id.replace(/^\d+-/, "").replace(/-/g, " "),
    url: `https://psnprofiles.com/trophies/${id}`,
  }));
  return candidates.find((item) => normalizeTitle(item.title) === normalizedTitle) ||
    candidates.find((item) => normalizeTitle(item.title).includes(normalizedTitle) || normalizedTitle.includes(normalizeTitle(item.title))) ||
    candidates[0];
}

async function fetchTextFromFallbackUrls(urls) {
  const errors = [];
  for (const url of [...new Set(urls)]) {
    try {
      const response = await fetch(url, { headers: { Accept: "text/html,text/plain,*/*" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const text = await response.text();
      if (text) return text;
    } catch (error) {
      errors.push(`${shortUrl(url)}: ${error.message}`);
    }
  }
  throw new Error(errors.slice(0, 2).join(" · "));
}

function parseStandalonePsnProfilesTrophies(text, gameId) {
  if (looksLikeHtml(text)) {
    const htmlTrophies = parseStandalonePsnProfilesTrophiesFromHtml(text, gameId);
    if (htmlTrophies.length) return htmlTrophies;
  }

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .filter(Boolean);
  const trophies = [];
  let currentGroup = "Base Game";
  let pendingImage = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const packName = extractTrophyPackName(line);
    if (packName) {
      currentGroup = packName;
      continue;
    }

    const imageMatch = line.match(/https:\/\/img\.psnprofiles\.com\/trophy\/[^)\s"']+\.png/i);
    if (imageMatch) {
      pendingImage = imageMatch[0];
      continue;
    }

    const next = lines[index + 1] || "";
    const rarityLine = lines.slice(index + 1, index + 5).find((item) => /\d+(?:\.\d+)?%/.test(item)) || "";
    if (!pendingImage || !line || !next || isPsnProfilesMetaLine(line) || isPsnProfilesMetaLine(next)) continue;

    trophies.push({
      id: `psnp-${gameId || "game"}-${trophies.length + 1}-${slugifyPsnTitle(line)}`,
      name: line.replace(/^#+\s*/, ""),
      description: next,
      type: inferTrophyTypeFromText(`${line} ${next} ${rarityLine}`),
      rarity: extractCleanRarity(rarityLine),
      earned: false,
      earnedAt: "",
      imageUrl: pendingImage,
      group: currentGroup,
    });
    pendingImage = "";
  }

  return dedupeTrophies(trophies);
}

function parseStandalonePsnProfilesTrophiesFromHtml(html, gameId) {
  const doc = parseHtmlDocument(html);
  if (!doc) return [];

  const trophies = [];

  for (const section of extractPsnProfilesHtmlSections(doc)) {
    for (const trophy of section.trophies) {
      trophies.push({
        id: `psnp-${gameId || "game"}-${trophy.sourceIndex || trophies.length + 1}-${slugifyPsnTitle(trophy.name)}`,
        name: trophy.name,
        description: trophy.description,
        type: trophy.type,
        rarity: trophy.rarity,
        earned: trophy.earned,
        earnedAt: trophy.earnedAt,
        imageUrl: trophy.imageUrl,
        group: section.title,
      });
    }
  }

  return dedupeTrophies(trophies);
}

function dedupeTrophies(trophies) {
  const seen = new Set();
  return trophies.filter((trophy) => {
    const key = `${normalizeTitle(trophy.group || trophy.section || trophy.pack || trophy.dlc || "")}|${normalizeTitle(trophy.name)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isPsnProfilesMetaLine(line) {
  return /^(owners?|points?|trophies?|platinum|gold|silver|bronze|\d+(?:\.\d+)?%|common|rare|uncommon|ultra rare|very rare)$/i.test(normalizeSpaces(line));
}

function inferTrophyTypeFromText(text) {
  const value = String(text || "").toLowerCase();
  if (value.includes("platinum") || value.includes("platino")) return "Platino";
  if (value.includes("gold") || value.includes("oro")) return "Oro";
  if (value.includes("silver") || value.includes("plata")) return "Plata";
  if (value.includes("bronze") || value.includes("bronce")) return "Bronce";
  return "Trofeo";
}

function inferTrophyTypeFromNode(node, text) {
  const img = node.querySelector("img[src]");
  const src = String(img?.getAttribute("src") || "").toLowerCase();
  const alt = String(img?.getAttribute("alt") || "");
  return normalizeTrophyType(`${text} ${alt} ${src}`) || inferTrophyTypeFromText(`${text} ${alt} ${src}`);
}

function getTrophyTypeFromIconUrl(url) {
  const value = String(url || "").toLowerCase();
  if (value.includes("40-platinum")) return "Platino";
  if (value.includes("40-gold")) return "Oro";
  if (value.includes("40-silver")) return "Plata";
  if (value.includes("40-bronze")) return "Bronce";
  return "";
}

function detectPlayStationPlatform(platforms = []) {
  const names = platforms.map((item) => item.platform?.name).filter(Boolean);
  if (names.some((name) => /playstation 5/i.test(name))) return "PS5";
  if (names.some((name) => /playstation 4/i.test(name))) return "PS4";
  if (names.some((name) => /nintendo switch/i.test(name))) return "Switch";
  if (names.some((name) => /^pc$/i.test(name))) return "PC";
  return names.find((name) => /playstation/i.test(name)) || "";
}

function createRawgNote(result) {
  const parts = [];
  if (result.released) parts.push(`Lanzado el ${result.released}.`);
  if (result.rating) parts.push(`Valoración RAWG: ${result.rating}/5.`);
  return parts.join(" ");
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo descargar la portada");
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadGames() {
  try {
    const games = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(games) ? games.map(stripStoredTrophies) : [];
  } catch {
    return [];
  }
}

function loadTrophyPackCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(TROPHY_PACKS_STORAGE) || "{}");
    return cache && typeof cache === "object" ? cache : {};
  } catch {
    return {};
  }
}

function saveTrophyPackCache() {
  localStorage.setItem(TROPHY_PACKS_STORAGE, JSON.stringify(trophyPackState.cache));
}

function saveGames() {
  const compactGames = JSON.stringify(state.games.map(stripStoredTrophies));
  try {
    localStorage.setItem(STORAGE_KEY, compactGames);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, compactGames);
  }
}

function cleanupEmptyNewGames() {
  const before = state.games.length;
  state.games = state.games.filter((game) => !isEmptyPlaceholderGame(game));
  if (state.games.length !== before) saveGames();
}

function isEmptyPlaceholderGame(game) {
  return normalizeSpaces(game?.title).toLowerCase() === "nuevo juego" &&
    Number(game?.progress || 0) === 0 &&
    !normalizeSpaces(game?.notes) &&
    !normalizeSpaces(game?.trophy || game?.psnProfilesUrl) &&
    !normalizeSpaces(game?.imageUrl || game?.imageData) &&
    !game?.rawgId &&
    !game?.psnProfilesId;
}

function stripStoredTrophies(game) {
  if (!game || typeof game !== "object") return game;
  const { trophies, ...rest } = game;
  return rest;
}

function createGame() {
  const game = {
    id: crypto.randomUUID(),
    title: "Nuevo juego",
    status: "En progreso",
    platform: "PS5",
    platinumNumber: "",
    duration: "",
    difficulty: "",
    trophy: "",
    progress: 0,
    notes: "",
    imageData: "",
    imageUrl: "",
    trophies: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state.games.unshift(game);
  return game;
}

function getSelectedGame() {
  return state.games.find((game) => game.id === state.selectedId) || state.games[0];
}

async function render() {
  const game = getSelectedGame();
  fillForm(game);
  if (state.view === "library") renderList();
  renderStats();
  renderView();
  if (state.view === "detail" && Object.keys(getBundledTrophyMap()).length) {
    queueTrophyPackSync(game);
  }
}

function renderSoft() {
  const game = getSelectedGame();
  renderStats();
  renderGameProgressHero(game);
  renderTrophies(game);
  renderView();
  if (state.view === "detail" && Object.keys(getBundledTrophyMap()).length) {
    queueTrophyPackSync(game);
  }
}

async function openGameDetail(game) {
  state.selectedId = game.id;
  state.view = "detail";
  setActiveViewButton("detail");
  elements.libraryGrid.replaceChildren();
  await render();

  try {
    await ensureBundledTrophiesLoaded();
    if (state.view === "detail" && state.selectedId === game.id) await render();
  } catch {
    // La ficha sigue disponible aunque el detalle de trofeos no pueda cargarse.
  }
}

function fillForm(game) {
  elements.title.value = game.title || "";
  elements.status.value = game.status || "En progreso";
  elements.platform.value = game.platform || "";
  elements.platinumNumber.value = game.platinumNumber || "";
  elements.duration.value = game.duration || "";
  elements.difficulty.value = game.difficulty || "";
  elements.trophy.value = game.trophy || "";
  elements.progress.value = Number(game.progress || 0);
  elements.progressLabel.textContent = `${elements.progress.value}%`;
  elements.notes.value = game.notes || "";
  if (elements.trophyImport) elements.trophyImport.value = "";
  renderGameProgressHero(game);
  renderTrophies(game);
}

function renderGameProgressHero(game) {
  if (!elements.gameProgressHero || !game) return;
  const background = game.imageData || game.imageUrl || "";
  const trophies = getDisplayTrophies(game);
  const earned = Number(game.trophiesEarned || trophies.filter((trophy) => trophy.earned).length || 0);
  const total = Number(game.trophiesTotal || trophies.length || 0);
  const progress = total ? Math.round((earned / total) * 100) : Number(game.progress || 0);
  const psnp = game.psnProfilesUrl || game.trophy || "";
  elements.gameProgressHero.innerHTML = `
    <div class="progress-cover">
      ${background ? `<img src="${escapeHtml(background)}" alt="" loading="lazy" referrerpolicy="no-referrer" />` : `<div class="cover-fallback">${escapeHtml((game.title || "?").slice(0, 1))}</div>`}
    </div>
    <div class="progress-detail">
      <p class="eyebrow">${escapeHtml(game.platform || "PlayStation")}</p>
      <h3>${escapeHtml(game.title || "Sin titulo")}</h3>
      <p class="muted">${escapeHtml(game.status || "En progreso")} · ${progress}% completado${total ? ` · ${earned}/${total} trofeos` : ""}</p>
      <div class="progress-bar large"><i style="width:${progress}%"></i></div>
      <div class="progress-facts">
        <span><b>${earned}</b><small>conseguidos</small></span>
        <span><b>${Math.max(total - earned, 0)}</b><small>pendientes</small></span>
        <span><b>${progress}%</b><small>progreso</small></span>
      </div>
      ${psnp ? `<a class="psnp-link" href="${escapeHtml(psnp)}" target="_blank" rel="noopener">Ver fuente en PSNProfiles</a>` : ""}
    </div>
  `;
}

function syncFormToGame() {
  const game = getSelectedGame();
  game.title = elements.title.value.trim();
  game.status = elements.status.value;
  game.platform = elements.platform.value.trim();
  game.platinumNumber = elements.platinumNumber.value.trim();
  game.duration = elements.duration.value.trim();
  game.difficulty = elements.difficulty.value.trim();
  game.trophy = elements.trophy.value.trim();
  game.progress = Number(elements.progress.value);
  game.notes = elements.notes.value.trim();
  game.updatedAt = Date.now();
  elements.progressLabel.textContent = `${game.progress}%`;
}

function renderStats() {
  elements.statPlatinums.textContent = state.games.filter((game) => game.status === "Platino").length;
  elements.statProgress.textContent = state.games.filter((game) => game.status === "En progreso").length;
  elements.statBacklog.textContent = state.games.filter((game) => game.status === "Backlog").length;
}

function importTrophiesFromTextarea() {
  if (!elements.trophyImport) return;
  const game = getSelectedGame();
  const lines = elements.trophyImport.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    alert("Pega al menos un logro o trofeo, uno por línea.");
    return;
  }

  const imported = lines.map(parseTrophyLine);
  const existing = Array.isArray(game.trophies) ? game.trophies : [];
  game.trophies = [...existing, ...imported];
  game.updatedAt = Date.now();
  elements.trophyImport.value = "";
  autoUpdateProgressFromTrophies(game);
  saveGames();
  renderSoft();
}

function importSelectedGameTrophiesFromPsnProfiles() {
  const game = getSelectedGame();
  const trophies = findBundledTrophiesForGame(game);

  if (!trophies.length) {
    alert("Aún no tengo los trofeos detallados de este juego importados. Puedo sacarlos por tandas desde PSNProfiles y dejarlos guardados en la app.");
    return;
  }

  game.trophies = trophies.map((trophy) => ({ ...trophy }));
  autoUpdateProgressFromTrophies(game);
  game.updatedAt = Date.now();
  saveGames();
  renderSoft();
}

function parseTrophyLine(line) {
  const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
  const maybeType = parts.length > 1 ? normalizeTrophyType(parts[0]) : "";
  return {
    id: crypto.randomUUID(),
    type: maybeType || "Trofeo",
    name: maybeType ? parts.slice(1).join(" | ") : line,
    earned: false,
  };
}

function normalizeTrophyType(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("platino") || text.includes("platinum")) return "Platino";
  if (text.includes("oro") || text.includes("gold")) return "Oro";
  if (text.includes("plata") || text.includes("silver")) return "Plata";
  if (text.includes("bronce") || text.includes("bronze")) return "Bronce";
  return "";
}

function addBlankTrophy() {
  const game = getSelectedGame();
  game.trophies = Array.isArray(game.trophies) ? game.trophies : [];
  game.trophies.push({
    id: crypto.randomUUID(),
    name: "Nuevo logro",
    type: "Trofeo",
    earned: false,
  });
  game.updatedAt = Date.now();
  saveGames();
  renderSoft();
}

function renderTrophies(game) {
  const trophies = getDisplayTrophies(game);
  const earned = trophies.filter((trophy) => trophy.earned).length;
  elements.trophyProgressBadge.textContent = `${earned}/${trophies.length}`;
  elements.trophyList.innerHTML = "";

  if (!trophies.length) {
    elements.trophyList.innerHTML = `<p class="muted">Todavía no tengo el checklist detallado de este juego. Cuando lo importemos desde PSNProfiles aparecerá aquí con los conseguidos marcados.</p>`;
    return;
  }

  const groups = groupTrophiesByPsnSection(trophies);

  for (const group of groups) {
    const groupElement = document.createElement("section");
    const groupEarned = group.trophies.filter((trophy) => trophy.earned).length;
    const groupProgress = group.trophies.length ? Math.round((groupEarned / group.trophies.length) * 100) : 0;
    groupElement.className = `trophy-group ${group.isDlc ? "is-dlc" : "is-base-game"}`;
    groupElement.innerHTML = `
      <header class="trophy-group-header">
        <div>
          <p class="eyebrow">${group.isDlc ? "DLC" : "Juego base"}</p>
          <h4>${escapeHtml(group.title)}</h4>
          <div class="progress-bar pack-progress"><i style="width:${groupProgress}%"></i></div>
        </div>
        <span>${groupEarned}/${group.trophies.length}</span>
      </header>
      <div class="trophy-group-list"></div>
    `;
    const groupList = groupElement.querySelector(".trophy-group-list");
    for (const trophy of group.trophies) {
      groupList.appendChild(createReadonlyTrophyRow(trophy));
    }
    elements.trophyList.appendChild(groupElement);
  }
}

function groupTrophiesByPsnSection(trophies) {
  const groups = new Map();

  for (const trophy of trophies) {
    const rawGroup = normalizeSpaces(
      trophy.group ||
      trophy.section ||
      trophy.trophyGroup ||
      trophy.pack ||
      trophy.dlc ||
      trophy.dlcName ||
      ""
    );
    const title = rawGroup || "Base Game";
    const key = normalizeTitle(title) || "basegame";
    const isDlc = rawGroup ? !/^(base game|juego base|main game|base)$/i.test(rawGroup) : false;

    if (!groups.has(key)) {
      groups.set(key, {
        title: translateTrophyGroupTitle(title),
        isDlc,
        trophies: [],
      });
    }

    groups.get(key).trophies.push(trophy);
  }

  return [...groups.values()].sort((a, b) => Number(a.isDlc) - Number(b.isDlc));
}

function queueTrophyPackSync(game) {
  const trophies = getDisplayTrophies(game);
  const cacheKey = getTrophyPackCacheKey(game);
  const psnpUrl = game?.psnProfilesUrl || game?.trophy || "";
  if (!cacheKey || !trophies.length || trophyPackState.cache[cacheKey] || trophyPackState.pending.has(cacheKey)) return;
  if (trophyPackState.failed.has(cacheKey)) return;
  if (!/^https?:\/\/(www\.)?psnprofiles\.com\/trophies\//i.test(psnpUrl)) return;
  if (trophies.some((trophy) => trophy.group || trophy.section || trophy.pack || trophy.dlc || trophy.dlcName)) return;

  trophyPackState.pending.add(cacheKey);
  syncTrophyPacksFromPsnProfiles(game, trophies, cacheKey, psnpUrl)
    .catch(() => trophyPackState.failed.add(cacheKey))
    .finally(() => trophyPackState.pending.delete(cacheKey));
}

function queueVisibleTrophyPackSync() {
  if (trophyPackState.backgroundQueued) return;
  trophyPackState.backgroundQueued = true;
  window.setTimeout(async () => {
    const candidates = state.games
      .filter((game) => {
        const cacheKey = getTrophyPackCacheKey(game);
        const psnpUrl = game?.psnProfilesUrl || game?.trophy || "";
        const trophies = getDisplayTrophies(game);
        return cacheKey &&
          /^https?:\/\/(www\.)?psnprofiles\.com\/trophies\//i.test(psnpUrl) &&
          trophies.length &&
          !trophyPackState.cache[cacheKey] &&
          !trophyPackState.pending.has(cacheKey) &&
          !trophyPackState.failed.has(cacheKey) &&
          !trophies.some((trophy) => trophy.group || trophy.section || trophy.pack || trophy.dlc || trophy.dlcName);
      })
      .slice(0, 18);

    for (const game of candidates) {
      const trophies = getDisplayTrophies(game);
      const cacheKey = getTrophyPackCacheKey(game);
      const psnpUrl = game?.psnProfilesUrl || game?.trophy || "";
      if (!cacheKey || trophyPackState.pending.has(cacheKey)) continue;
      trophyPackState.pending.add(cacheKey);
      try {
        await syncTrophyPacksFromPsnProfiles(game, trophies, cacheKey, psnpUrl);
      } catch {
        trophyPackState.failed.add(cacheKey);
        // PSNProfiles puede bloquear lecturas puntuales; dejamos el juego sin romper la app.
      } finally {
        trophyPackState.pending.delete(cacheKey);
      }
    }

    trophyPackState.backgroundQueued = false;
    const remaining = state.games.some((game) => {
      const cacheKey = getTrophyPackCacheKey(game);
      const trophies = getDisplayTrophies(game);
      return cacheKey && trophies.length &&
        !trophyPackState.cache[cacheKey] &&
        !trophyPackState.pending.has(cacheKey) &&
        !trophyPackState.failed.has(cacheKey) &&
        !trophies.some((trophy) => trophy.group || trophy.section || trophy.pack || trophy.dlc || trophy.dlcName);
    });
    if (remaining) queueVisibleTrophyPackSync();
  }, 1200);
}

async function syncTrophyPacksFromPsnProfiles(game, trophies, cacheKey, psnpUrl) {
  const text = await fetchPsnProfilesTrophyText(psnpUrl);
  const packMap = parseTrophyPacksFromSource(text, trophies);
  const importedValues = Object.values(packMap || {});
  if (!importedValues.length) return;
  trophyPackState.cache[cacheKey] = packMap;
  saveTrophyPackCache();
  if (getSelectedGame()?.id === game.id) renderSoft();
}

async function fetchPsnProfilesTrophyText(psnpUrl, { preserveUser = false } = {}) {
  const gameId = extractPsnProfilesGameId(psnpUrl);
  const cleanUrl = preserveUser
    ? psnpUrl
    : gameId ? `https://psnprofiles.com/trophies/${gameId}` : psnpUrl.replace(/\/[^/]+$/, "");
  const hostPath = cleanUrl.replace(/^https?:\/\//, "");
  const localProxy = `http://127.0.0.1:8788/api/psnprofiles?url=${encodeURIComponent(cleanUrl)}`;
  const text = await fetchTextFromFallbackUrls([
    localProxy,
    cleanUrl,
    `https://r.jina.ai/http://${hostPath}`,
    `https://r.jina.ai/http://https://${hostPath}`,
  ]);
  if (/DLC Trophy Pack|Base Game|Trophies|Trophy/i.test(text)) return text;
  throw new Error("PSNProfiles no devolvió una lista de trofeos reconocible.");
}

function parseTrophyPacksFromSource(source, trophies) {
  if (looksLikeHtml(source)) {
    const htmlMap = parseTrophyPacksFromHtml(source, trophies);
    if (Object.keys(htmlMap).length) return htmlMap;
  }
  return parseTrophyPacksFromText(source, trophies);
}

function parseTrophyPacksFromHtml(html, trophies) {
  const doc = parseHtmlDocument(html);
  if (!doc) return {};

  const trophyByName = new Map(trophies.map((trophy) => [normalizeTitle(trophy.name), trophy]));
  const trophyByIndex = new Map(trophies.map((trophy) => [extractTrophySourceIndex(trophy), trophy]).filter(([index]) => index));
  const packMap = {};

  for (const section of extractPsnProfilesHtmlSections(doc)) {
    for (const imported of section.trophies) {
      const trophy = trophyByIndex.get(String(imported.sourceIndex)) || trophyByName.get(normalizeTitle(imported.name));
      if (!trophy) continue;
      const metadata = {
        group: section.title,
        imageUrl: imported.imageUrl || trophy.imageUrl || "",
        type: imported.type || trophy.type || "Trofeo",
      };
      for (const key of getTrophyPackLookupKeys(trophy)) packMap[key] = metadata;
    }
  }

  return packMap;
}

function extractPsnProfilesHtmlSections(doc) {
  const sections = [];
  const trophyTables = [...doc.querySelectorAll("table.zebra")]
    .filter((table) => table.querySelector("a.title[href*='/trophy/']"));

  for (const table of trophyTables) {
    const previousTable = table.previousElementSibling;
    const headerTable = previousTable?.matches?.("table.zebra") &&
      !previousTable.querySelector("a.title[href*='/trophy/']")
      ? previousTable
      : table;
    const headerRow = headerTable.querySelector("tr");
    const title = extractPsnProfilesSectionTitle(headerRow);
    const trophies = [...table.querySelectorAll("tr")]
      .map((row, index) => extractPsnProfilesTrophyRow(row, index))
      .filter(Boolean);

    if (trophies.length) sections.push({ title, trophies });
  }

  return sections;
}

function extractPsnProfilesSectionTitle(headerRow) {
  const rawTitle = normalizeSpaces(
    headerRow?.querySelector("span.title, .title")?.textContent ||
    headerRow?.textContent ||
    "Base Game"
  );
  return rawTitle.replace(/\s+\d+\s+of\s+\d+\s+Trophies.*$/i, "").trim() || "Base Game";
}

function extractPsnProfilesTrophyRow(row, index) {
  const link = row.querySelector("a.title[href*='/trophy/']");
  if (!link) return null;

  const name = normalizeSpaces(link.textContent);
  const href = link.getAttribute("href") || "";
  const image = row.querySelector("picture img[src*='/trophy/']") || row.querySelector("img[src*='/trophy/']");
  const typeIcon = [...row.querySelectorAll("img")]
    .map((img) => img.getAttribute("src") || "")
    .find((src) => /40-(platinum|gold|silver|bronze)\.png/i.test(src)) || "";
  const titleCell = link.closest("td") || row;
  const description = normalizeSpaces(
    [...titleCell.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent)
      .join(" ")
  ) || normalizeSpaces(link.parentElement?.textContent || "").replace(name, "").trim();
  const text = normalizeSpaces(row.textContent);
  const rarity = extractCleanRarity(text);
  const earnedAt = extractCleanEarnedDate(text);
  const sourceIndex = Number((href.match(/\/trophy\/[^/]+\/(\d+)-/) || [])[1] || index + 1);

  return {
    sourceIndex,
    name,
    description,
    type: getTrophyTypeFromIconUrl(typeIcon) || inferTrophyTypeFromNode(row, text),
    rarity,
    earned: /\bcompleted\b/i.test(row.className || "") || Boolean(row.querySelector(".trophy.earned, picture.earned")),
    earnedAt,
    imageUrl: getAbsolutePsnProfilesImageUrl(image?.getAttribute("src") || ""),
  };
}

function parseTrophyPacksFromText(text, trophies) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line.replace(/\[|\]|\(|\)|#/g, " ")))
    .filter(Boolean);
  const trophyByName = new Map(trophies.map((trophy) => [normalizeTitle(trophy.name), trophy]));
  const packMap = {};
  let currentPack = "Base Game";

  for (const line of lines) {
    const packName = extractTrophyPackName(line);
    if (packName) {
      currentPack = packName;
      continue;
    }

    const direct = trophyByName.get(normalizeTitle(line));
    if (direct) {
      for (const key of getTrophyPackLookupKeys(direct)) packMap[key] = currentPack;
      continue;
    }

    for (const [nameKey, trophy] of trophyByName.entries()) {
      if (nameKey.length > 4 && normalizeTitle(line).includes(nameKey)) {
        for (const key of getTrophyPackLookupKeys(trophy)) packMap[key] = currentPack;
        break;
      }
    }
  }

  return packMap;
}

function extractTrophySourceIndex(trophy) {
  const direct = trophy?.sourceIndex || trophy?.index || trophy?.order;
  if (direct) return String(direct);
  const match = String(trophy?.id || "").match(/-(\d+)(?:-[^-]+)?$/);
  return match ? match[1] : "";
}

function extractTrophyPackName(line) {
  const text = normalizeSpaces(line);
  if (/^(base game|juego base|main game)\b/i.test(text) || /\bbase game\s+\d+\s+of\s+\d+\s+trophies\b/i.test(text)) return "Base Game";
  const dlcMatch = text.match(/\b(DLC\s+Trophy\s+Pack\s+\d+|DLC\s+Pack\s+\d+|DLC\s+\d+|Trophy\s+Pack\s+\d+|Expansion\s+\d+|Add-on\s+\d+)\b(?:\s*[:\-–—]\s*([^|]+?))?(?=\s{2,}|$|\d+\s+of\s+\d+\s+Trophies|Owners?)/i);
  if (dlcMatch) {
    const label = dlcMatch[1].replace(/\s+/g, " ").toUpperCase();
    const subtitle = normalizeSpaces(dlcMatch[2] || "");
    return subtitle ? `${label}: ${subtitle}` : label;
  }
  return "";
}

function isLikelyPackHeader(node, text) {
  const className = String(node.className || "");
  if (/title|header|pack|section|box/i.test(className)) return true;
  if (/^(base game|juego base|main game|DLC\s+Trophy\s+Pack\s+\d+|DLC\s+Pack\s+\d+|DLC\s+\d+|Trophy\s+Pack\s+\d+)/i.test(text)) return true;
  return /\b\d+\s+of\s+\d+\s+Trophies\b/i.test(text) && /\b(Base Game|DLC|Trophy Pack)\b/i.test(text);
}

function looksLikeHtml(value) {
  return /<\s*(html|body|table|tr|div|section|article|li|img|a)\b/i.test(String(value || ""));
}

function parseHtmlDocument(html) {
  try {
    return new DOMParser().parseFromString(String(html || ""), "text/html");
  } catch {
    return null;
  }
}

function getAbsolutePsnProfilesImageUrl(src) {
  const value = String(src || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `https://psnprofiles.com${value}`;
  return value;
}

function getReliableRemoteImageUrl(src) {
  const value = String(src || "").trim();
  if (!value) return "";
  if (/^https:\/\/img\.psnprofiles\.com\/trophy\/s\//i.test(value)) {
    return value.replace("/trophy/s/", "/trophy/m/");
  }
  return value;
}

function createReadonlyTrophyRow(trophy) {
    const row = document.createElement("div");
    row.className = `trophy-row trophy-row-readonly ${trophy.earned ? "earned" : ""}`;
    const type = trophy.type || "Trofeo";
    const proxiedImage = getReliableRemoteImageUrl(trophy.imageUrl);
    const image = trophy.imageUrl
      ? `<img src="${escapeHtml(proxiedImage)}" data-original-src="${escapeHtml(trophy.imageUrl)}" alt="" loading="eager" referrerpolicy="no-referrer" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src=this.dataset.originalSrc}else{this.replaceWith(document.createTextNode('${getTrophyTypeIcon(type)}'))}" />`
      : `<span>${getTrophyTypeIcon(type)}</span>`;
    const typeIconUrl = getPsnProfilesTrophyTypeIconUrl(type);
    const typeIcon = typeIconUrl
      ? `<img class="trophy-type-icon" src="${escapeHtml(typeIconUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
      : "";
    const typePill = type && !/^trofeo$/i.test(type)
      ? `<span class="trophy-type-pill ${getTrophyTypeClass(type)}">${typeIcon}${escapeHtml(type)}</span>`
      : "";
    const cleanRarity = extractCleanRarity(trophy.rarity || trophy.earnedAt);
    const cleanEarnedDate = extractCleanEarnedDate(trophy.earnedAt);
    const rarity = cleanRarity ? `<small>${escapeHtml(formatTrophyRarity(cleanRarity))}</small>` : "";
    const earnedDate = cleanEarnedDate ? `<small class="earned-date">${escapeHtml(cleanEarnedDate)}</small>` : "";
    const translatedName = translateTrophyText(trophy.name);
    const translatedDescription = translateTrophyText(trophy.description);
    const originalName = translatedName !== trophy.name ? `<small class="trophy-original">${escapeHtml(trophy.name || "")}</small>` : "";
    const originalDescription = translatedDescription !== trophy.description && trophy.description
      ? `<small class="trophy-original">${escapeHtml(trophy.description)}</small>`
      : "";
    row.innerHTML = `
      <div class="trophy-icon ${trophy.earned ? "is-earned" : ""}">${image}</div>
      <div class="trophy-copy">
        <strong>${escapeHtml(translatedName || "Trofeo sin nombre")}</strong>
        ${originalName}
        ${translatedDescription ? `<p>${escapeHtml(translatedDescription)}</p>` : ""}
        ${originalDescription}
      </div>
      <div class="trophy-meta">
        ${typePill}
        ${rarity}
        ${earnedDate}
      </div>
      <div class="trophy-earned-mark ${trophy.earned ? "is-earned" : "is-locked"}" title="${trophy.earned ? "Conseguido" : "Pendiente"}">${trophy.earned ? "✓" : "○"}</div>
    `;
    return row;
}

function translateTrophyGroupTitle(title) {
  const value = normalizeSpaces(title);
  if (/^base game$/i.test(value)) return "Juego base";
  if (/^main game$/i.test(value)) return "Juego principal";
  return value || "Juego base";
}

function translateTrophyText(value) {
  const text = normalizeSpaces(value);
  if (!text) return "";
  const lower = text.toLowerCase();
  const dictionary = {
    "we'll talk about it next time i see you": "Hablaremos de ello la próxima vez que te vea",
    "flight of the crane": "El vuelo de la grúa",
    "my left or your left?": "¿Mi izquierda o tu izquierda?",
    "snake in the grass": "Serpiente entre la hierba",
    "sightseeing": "Haciendo turismo",
    "making faces": "Poniendo caras",
    "tied loose end": "Cabo suelto atado",
    "now you can come in": "Ahora puedes entrar",
    "vertigo": "Vértigo",
    "bittersweet": "Agridulce",
    "get all game trophies": "Consigue todos los trofeos del juego",
    "jump from the crane": "Salta desde la grúa",
    "meet with rais": "Reúnete con Rais",
    "escape the arena": "Escapa de la arena",
    "reach the old town": "Llega a la Ciudad Vieja",
    "show the outside world that you're still alive": "Demuestra al mundo exterior que sigues con vida",
    "deal with tahir": "Encárgate de Tahir",
    "find camden": "Encuentra a Camden",
    "activate the amplifier": "Activa el amplificador",
    "complete the game": "Completa el juego",
    "complete the campaign": "Completa la campaña",
    "finish the game": "Termina el juego",
    "collect all trophies": "Consigue todos los trofeos",
    "unlock all trophies": "Desbloquea todos los trofeos",
  };
  return dictionary[lower] || text;
}

function formatTrophyRarity(value) {
  return normalizeSpaces(value)
    .replace(/\bULTRA RARE\b/gi, "ULTRA RARO")
    .replace(/\bVERY RARE\b/gi, "MUY RARO")
    .replace(/\bUNCOMMON\b/gi, "POCO COMÚN")
    .replace(/\bCOMMON\b/gi, "COMÚN")
    .replace(/\bRARE\b/gi, "RARO");
}

function extractCleanRarity(value) {
  const text = normalizeSpaces(value);
  const match = text.match(/(\d+(?:\.\d+)?%)\s*(Ultra Rare|Very Rare|Uncommon|Common|Rare|Ultra Raro|Muy Raro|Poco Común|Común|Raro)/i);
  return match ? `${match[1]} ${match[2]}` : "";
}

function extractCleanEarnedDate(value) {
  const text = normalizeSpaces(value);
  if (!text) return "";
  const date = text.match(/\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-zÁÉÍÓÚáéíóúñÑ]+\s+\d{4}/);
  const time = text.match(/\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)?/i);
  if (!date) return "";
  return normalizeSpaces(`${date[0]} ${time ? time[0] : ""}`);
}

function getTrophyTypeIcon(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("platino")) return "🏆";
  if (value.includes("oro")) return "🥇";
  if (value.includes("plata")) return "🥈";
  if (value.includes("bronce")) return "🥉";
  return "◇";
}

function getPsnProfilesTrophyTypeIconUrl(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("platino") || value.includes("platinum")) return "https://psnprofiles.com/lib/img/icons/40-platinum.png";
  if (value.includes("oro") || value.includes("gold")) return "https://psnprofiles.com/lib/img/icons/40-gold.png";
  if (value.includes("plata") || value.includes("silver")) return "https://psnprofiles.com/lib/img/icons/40-silver.png";
  if (value.includes("bronce") || value.includes("bronze")) return "https://psnprofiles.com/lib/img/icons/40-bronze.png";
  return "";
}

function getTrophyTypeClass(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("platino")) return "platinum";
  if (value.includes("oro")) return "gold";
  if (value.includes("plata")) return "silver";
  if (value.includes("bronce")) return "bronze";
  return "generic";
}

function autoUpdateProgressFromTrophies(game) {
  const trophies = getDisplayTrophies(game);
  if (!trophies.length) return;
  const earned = trophies.filter((trophy) => trophy.earned).length;
  game.progress = Math.round((earned / trophies.length) * 100);
  elements.progress.value = game.progress;
  elements.progressLabel.textContent = `${game.progress}%`;
  if (earned === trophies.length && trophies.length > 0) {
    game.status = "Platino";
    elements.status.value = "Platino";
  }
}

function renderList() {
  const query = elements.vaultSearch.value.trim().toLowerCase();
  const games = state.games.filter((game) => {
    const matchesFilter = state.filter === "all" || game.status === state.filter;
    const matchesPlatform =
      state.platformFilter === "all" ||
      normalizePlatform(game.platform) === state.platformFilter;
    const haystack = `${game.title} ${game.platform} ${game.status} ${game.notes}`.toLowerCase();
    return matchesFilter && matchesPlatform && (!query || haystack.includes(query));
  }).sort(compareLibraryGames);
  if (elements.gameList) elements.gameList.innerHTML = "";
  elements.libraryGrid.innerHTML = "";

  if (!games.length) {
    if (elements.gameList) elements.gameList.innerHTML = `<p class="muted">No hay juegos en este filtro.</p>`;
    elements.libraryGrid.innerHTML = `<div class="empty-state">🧐<p>No hay juegos aquí. Busca uno arriba y añádelo a tu biblioteca.</p></div>`;
    return;
  }

  const gridFragment = document.createDocumentFragment();
  for (const game of games) {
    if (elements.gameList) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `game-item ${game.id === state.selectedId ? "active" : ""}`;
      button.innerHTML = `
        <strong>${escapeHtml(game.title || "Sin título")}</strong>
        <span>${escapeHtml(game.status)} · ${escapeHtml(game.platform || "Sin plataforma")} · ${Number(game.progress || 0)}%</span>
      `;
      button.addEventListener("click", () => openGameDetail(game));
      elements.gameList.appendChild(button);
    }
    gridFragment.appendChild(createLibraryCard(game));
  }
  elements.libraryGrid.appendChild(gridFragment);
}

function createLibraryCard(game) {
  const card = document.createElement("article");
  card.className = "library-game-card";
  const background = game.imageData || game.imageUrl || "";
  const lowQualityCover = background && isPsnProfilesCover(background);
  const trophyCount = Number(game.trophiesTotal || 0);
  const trophyDone = Number(game.trophiesEarned || (Array.isArray(game.trophies) ? game.trophies.filter((trophy) => trophy.earned).length : 0));
  const latestActivity = getGameLatestTrophyAt(game);
  card.innerHTML = `
    <div class="library-cover ${lowQualityCover ? "low-res-cover" : "hero-cover"}">
      ${background ? `<img class="cover-bg" alt="" src="${escapeHtml(background)}" loading="lazy" referrerpolicy="no-referrer" /><img class="cover-main" alt="" src="${escapeHtml(background)}" loading="lazy" referrerpolicy="no-referrer" />` : `<div class="cover-fallback">${escapeHtml((game.title || "?").slice(0, 1))}</div>`}
      <span>${escapeHtml(game.platform || "Multi")}</span>
    </div>
    <div class="library-info">
      <strong>${escapeHtml(game.title || "Sin título")}</strong>
      <span>${escapeHtml(game.status)} · ${Number(game.progress || 0)}%</span>
      ${trophyCount ? `<small>${trophyDone}/${trophyCount} trofeos</small>` : ""}
      ${latestActivity ? `<small class="recent-activity">Último trofeo: ${escapeHtml(formatRecentActivity(latestActivity))}</small>` : ""}
      <em class="progress-chip">${Number(game.progress || 0)}% completado</em>
    </div>
  `;
  card.tabIndex = 0;
  card.role = "button";
  card.addEventListener("click", () => openGameDetail(game));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openGameDetail(game);
  });
  return card;
}

function updateLibrarySortButtons() {
  document.querySelectorAll("[data-sort]").forEach((button) => {
    const isActive = button.dataset.sort === state.sort;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function compareLibraryGames(a, b) {
  if (state.sort === "recent") {
    const recentDifference = getGameLatestTrophyAt(b) - getGameLatestTrophyAt(a);
    if (recentDifference) return recentDifference;
  }

  if (state.sort === "progress") {
    const progressDifference = Number(b.progress || 0) - Number(a.progress || 0);
    if (progressDifference) return progressDifference;
  }

  return Number(b.createdAt || b.updatedAt || 0) - Number(a.createdAt || a.updatedAt || 0);
}

function getGameLatestTrophyAt(game) {
  const trophies = getDisplayTrophies(game);
  return trophies.reduce((latest, trophy) => {
    if (!trophy?.earned || !trophy.earnedAt) return latest;
    return Math.max(latest, parsePsnProfilesDate(trophy.earnedAt));
  }, 0);
}

function parsePsnProfilesDate(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!match) return 0;
  const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);

  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const month = months[match[2].toLowerCase().slice(0, 3)];
  if (month === undefined) return 0;

  let hour = Number(timeMatch?.[1] || 0);
  const meridiem = String(timeMatch?.[4] || "").toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return new Date(
    Number(match[3]),
    month,
    Number(match[1]),
    hour,
    Number(timeMatch?.[2] || 0),
    Number(timeMatch?.[3] || 0),
  ).getTime();
}

function formatRecentActivity(timestamp) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function normalizePlatform(platform) {
  const value = String(platform || "").toLowerCase();
  if (value.includes("ps5") || value.includes("playstation 5")) return "PS5";
  if (value.includes("ps4") || value.includes("playstation 4")) return "PS4";
  if (value.includes("switch")) return "Switch";
  if (value.includes("pc")) return "PC";
  return platform || "Multi";
}

async function loadCurrentImage(dataUrl) {
  state.currentImage = null;
  if (!dataUrl) return;
  try {
    state.currentImage = await loadImage(dataUrl);
  } catch {
    state.currentImage = null;
  }
}

function renderCard(game) {
  const width = elements.canvas.width;
  const height = elements.canvas.height;

  drawBackground(width, height);
  drawArtwork(game, width, height);
  drawFrame(width, height, game);
  drawInfoPanel(game, width, height);
  drawCaptionPreview(game);
}

function drawBackground(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#09090a");
  gradient.addColorStop(0.45, "#111018");
  gradient.addColorStop(1, "#050506");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 120; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.8 + 0.4;
    ctx.fillStyle = `rgba(255, ${150 + Math.random() * 80}, 40, ${0.06 + Math.random() * 0.16})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawArtwork(game, width) {
  const area = { x: 42, y: 42, w: width - 84, h: 720 };
  ctx.save();
  roundedRect(area.x, area.y, area.w, area.h, 30);
  ctx.clip();

  if (state.currentImage) {
    drawImageCover(state.currentImage, area.x, area.y, area.w, area.h);
    const fade = ctx.createLinearGradient(0, area.y, 0, area.y + area.h);
    fade.addColorStop(0, "rgba(0,0,0,0.05)");
    fade.addColorStop(0.62, "rgba(0,0,0,0.12)");
    fade.addColorStop(1, "rgba(0,0,0,0.72)");
    ctx.fillStyle = fade;
    ctx.fillRect(area.x, area.y, area.w, area.h);
  } else {
    const bg = ctx.createRadialGradient(520, 260, 20, 520, 360, 620);
    bg.addColorStop(0, "#28445c");
    bg.addColorStop(0.44, "#14202c");
    bg.addColorStop(1, "#07070a");
    ctx.fillStyle = bg;
    ctx.fillRect(area.x, area.y, area.w, area.h);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.font = "900 52px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("AÑADE UNA IMAGEN", width / 2, 380);
  }

  ctx.restore();

  ctx.strokeStyle = "rgba(255, 212, 93, 0.62)";
  ctx.lineWidth = 3;
  roundedRect(area.x, area.y, area.w, area.h, 30);
  ctx.stroke();
}

function drawFrame(width, height, game) {
  const margin = 22;
  ctx.strokeStyle = "rgba(255, 212, 93, 0.72)";
  ctx.lineWidth = 4;
  roundedRect(margin, margin, width - margin * 2, height - margin * 2, 34);
  ctx.stroke();

  ctx.strokeStyle = "rgba(122, 20, 28, 0.78)";
  ctx.lineWidth = 2;
  roundedRect(34, 34, width - 68, height - 68, 26);
  ctx.stroke();

  drawOrnament(70, 70);
  drawOrnament(width - 70, 70, true);
  drawOrnament(70, height - 70, false, true);
  drawOrnament(width - 70, height - 70, true, true);

  ctx.fillStyle = "rgba(0,0,0,0.62)";
  roundedRect(380, 24, 320, 64, 0);
  ctx.fill();
  ctx.fillStyle = "#ffd45d";
  ctx.font = "900 22px Georgia";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("THE CARPE VERSE", width / 2, 64);

  const rarityColor = getRarityColor(game.rarity);
  ctx.fillStyle = rarityColor;
  ctx.beginPath();
  ctx.arc(width / 2, 808, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#09090a";
  ctx.font = "900 38px Georgia";
  ctx.fillText(game.status === "Platino" ? "P" : "%", width / 2, 822);
}

function drawInfoPanel(game, width, height) {
  const panel = { x: 42, y: 790, w: width - 84, h: height - 832 };
  const panelGradient = ctx.createLinearGradient(0, panel.y, 0, panel.y + panel.h);
  panelGradient.addColorStop(0, "rgba(9, 9, 10, 0.96)");
  panelGradient.addColorStop(1, "rgba(18, 13, 12, 0.98)");
  ctx.fillStyle = panelGradient;
  roundedRect(panel.x, panel.y, panel.w, panel.h, 26);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 212, 93, 0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#f3a81e";
  ctx.font = "900 40px Georgia";
  ctx.fillText((game.status || "EN PROGRESO").toUpperCase(), width / 2, 870);

  ctx.fillStyle = "#f7f2e8";
  drawWrappedText((game.title || "Sin título").toUpperCase(), width / 2, 950, 800, 78, "900 76px Georgia", "center", 2);

  ctx.fillStyle = "#b9b1a4";
  ctx.font = "700 26px Georgia";
  const trophy = game.trophy || (game.status === "Platino" ? "Logro de platino" : "Camino al platino");
  ctx.fillText(trophy.toUpperCase(), width / 2, 1076);

  drawMetricBox(86, 1134, 260, 128, "DURACIÓN", game.duration || "—");
  drawMetricBox(410, 1134, 260, 128, "DIFICULTAD", game.difficulty || "—");
  drawMetricBox(734, 1134, 260, 128, game.status === "Platino" ? "PLATINO Nº" : "PROGRESO", game.status === "Platino" ? padNumber(game.platinumNumber) : `${game.progress || 0}%`);

  ctx.fillStyle = "#8f877b";
  ctx.font = "700 24px Georgia";
  ctx.fillText(`${game.platform || "PS"} · ${game.rarity || "Épica"}`.toUpperCase(), width / 2, 1304);
}

function drawMetricBox(x, y, w, h, label, value) {
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  roundedRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 212, 93, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#f3a81e";
  ctx.font = "900 20px Georgia";
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + 38);
  ctx.fillStyle = "#f7f2e8";
  ctx.font = "900 42px Georgia";
  ctx.fillText(String(value).toUpperCase(), x + w / 2, y + 92);
}

function drawOrnament(x, y, flipX = false, flipY = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.strokeStyle = "rgba(255, 212, 93, 0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(34, -8, 58, -28, 80, -58);
  ctx.bezierCurveTo(48, -42, 26, -42, 0, -32);
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-8, 34, -28, 58, -58, 80);
  ctx.bezierCurveTo(-42, 48, -42, 26, -32, 0);
  ctx.stroke();
  ctx.restore();
}

function drawCaptionPreview(game) {
  if (!elements.captionPreview) return;
  elements.captionPreview.textContent = createCaption(game);
}

function createCaption(game) {
  const title = game.title || "este juego";
  const statusLine =
    game.status === "Platino"
      ? `Platino conseguido en ${title}${game.duration ? ` tras ${game.duration}` : ""}${game.difficulty ? `, dificultad ${game.difficulty}` : ""}.`
      : `Sigo avanzando con ${title}${game.progress ? `, ahora mismo al ${game.progress}%` : ""}.`;
  const note = game.notes ? `\n\n${game.notes}` : "";
  const trophyLine = createTrophyCaptionLine(game);
  const tags = createHashtags(game);
  return `${statusLine}${trophyLine}${note}\n\n${tags}`;
}

function createTrophyCaptionLine(game) {
  const trophies = getDisplayTrophies(game);
  if (!trophies.length) return "";
  const earned = trophies.filter((trophy) => trophy.earned).length;
  return `\n\nTrofeos: ${earned}/${trophies.length}.`;
}

function createHashtags(game) {
  const cleanTitle = (game.title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  const base = ["#TheCarpeVerse", "#Videojuegos", "#Gaming", "#PlayStation"];
  if (game.status === "Platino") base.push("#Platino", "#TrophyHunter");
  if (cleanTitle) base.push(`#${cleanTitle}`);
  return [...new Set(base)].slice(0, 8).join(" ");
}

async function downloadCard() {
  const blob = await canvasToBlob();
  const game = getSelectedGame();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(game.title || "carpe-verse")}-card.png`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function shareCard() {
  const blob = await canvasToBlob();
  const game = getSelectedGame();
  const file = new File([blob], `${slugify(game.title || "carpe-verse")}-card.png`, {
    type: "image/png",
  });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `The Carpe Verse · ${game.title}`,
      text: createCaption(game),
      files: [file],
    });
    return;
  }

  await copyCaption();
  alert("Tu navegador no permite compartir archivos desde aquí. He copiado el texto; descarga la imagen y mándala al bot.");
}

async function copyCaption() {
  await navigator.clipboard.writeText(createCaption(getSelectedGame()));
  elements.copyCaptionButton.textContent = "Resumen copiado";
  setTimeout(() => {
    elements.copyCaptionButton.textContent = "Copiar resumen";
  }, 1400);
}

function canvasToBlob() {
  return new Promise((resolve) => elements.canvas.toBlob(resolve, "image/png", 0.95));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(src)) {
      image.crossOrigin = "anonymous";
      image.referrerPolicy = "no-referrer";
    }
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawImageCover(image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, font, align = "left", maxLines = 3) {
  ctx.font = font;
  ctx.textAlign = align;
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function padNumber(value) {
  const text = String(value || "").trim();
  if (!text) return "—";
  return /^\d+$/.test(text) ? text.padStart(3, "0") : text;
}

function getRarityColor(rarity) {
  return {
    Platino: "#d9f4ff",
    Legendaria: "#ffd45d",
    Épica: "#b86cff",
    Rara: "#69c4ff",
    Común: "#b8b8b8",
  }[rarity] || "#ffd45d";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return String(value).replace(/'/g, "%27").replace(/\)/g, "%29");
}
