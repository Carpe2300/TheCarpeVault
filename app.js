const STORAGE_KEY = "carpeVerseVault.games.v1";
const RAWG_KEY_STORAGE = "carpeVerseVault.rawgKey.v1";
const PSNPROFILES_USER_STORAGE = "carpeVerseVault.psnProfilesUser.v1";
const RAWG_PLATFORM_IDS = {
  all: "4,7,18,187",
  PS5: "187",
  PS4: "18",
  Switch: "7",
  PC: "4",
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
  view: "library",
};

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

  state.selectedId = state.games[0]?.id || createGame().id;
  elements.rawgKey.value = localStorage.getItem(RAWG_KEY_STORAGE) || "";
  elements.psnProfilesInput.value = localStorage.getItem(PSNPROFILES_USER_STORAGE) || "";
  updateRawgKeyStatus();
  updatePsnProfilesConnection();
  importBundledPsnProfilesData();

  elements.newGameButton.addEventListener("click", () => {
    addNewGame();
  });

  elements.newGameTopButton.addEventListener("click", () => {
    addNewGame();
  });

  elements.vaultSearch.addEventListener("input", renderList);
  elements.vaultSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      state.view = "search";
      setActiveViewButton("search");
      elements.gameSearch.value = elements.vaultSearch.value.trim();
      searchRawgGames();
      renderView();
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
      }
      setActiveViewButton(state.view);
      renderView();
      renderList();
    });
  });

  elements.settingsButton.addEventListener("click", () => {
    elements.settingsDialog.showModal();
  });

  elements.rawgKey.addEventListener("input", () => {
    localStorage.setItem(RAWG_KEY_STORAGE, elements.rawgKey.value.trim());
    updateRawgKeyStatus();
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
    importPsnProfilesGames();
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
  elements.syncGameTrophiesButton.addEventListener("click", importSelectedGameTrophiesFromPsnProfiles);
  elements.importTrophiesButton.addEventListener("click", importTrophiesFromTextarea);
  elements.addTrophyButton.addEventListener("click", addBlankTrophy);

  render();
}

function setActiveViewButton(view) {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}

function renderView() {
  elements.catalogSection.hidden = state.view !== "search";
  elements.librarySection.hidden = state.view !== "library";
  elements.cardsSection.hidden = state.view !== "detail";
}

function updateRawgKeyStatus() {
  const key = elements.rawgKey.value.trim();
  if (key) {
    elements.rawgKeyStatus.textContent = `API key guardada · ${maskKey(key)}`;
    elements.rawgKeyStatus.classList.add("ok");
  } else {
    elements.rawgKeyStatus.textContent = "Sin key guardada";
    elements.rawgKeyStatus.classList.remove("ok");
  }
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
  return cleanPsnProfilesUser(elements.psnProfilesInput?.value || localStorage.getItem(PSNPROFILES_USER_STORAGE));
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

function findBundledTrophiesForGame(game, trophyMap = getBundledTrophyMap()) {
  const keys = [
    game.psnProfilesId,
    extractPsnProfilesGameId(game.psnProfilesUrl || game.trophy),
    normalizeTitle(game.title),
  ].filter(Boolean);
  for (const key of keys) {
    if (Array.isArray(trophyMap[key])) return trophyMap[key];
  }
  return [];
}

function getDisplayTrophies(game) {
  const bundled = findBundledTrophiesForGame(game);
  if (bundled.length) return bundled;
  return Array.isArray(game.trophies) ? game.trophies : [];
}

async function importPsnProfilesGames() {
  const user = getPsnProfilesUser();
  if (!user) {
    elements.settingsDialog.showModal();
    return;
  }

  const originalText = elements.syncPsnProfileButton.textContent;
  elements.syncPsnProfileButton.textContent = "Importando...";
  elements.syncPsnProfileButton.disabled = true;
  elements.psnSummaryText.textContent = "Leyendo tu perfil público de PSNProfiles...";

  try {
    const profileText = await fetchPsnProfilesProfile(user);
    const importedGames = parsePsnProfilesGames(profileText, user);

    if (!importedGames.length) {
      throw new Error("No he encontrado juegos en el perfil público. Puede que PSNProfiles haya cambiado el formato o esté bloqueando la lectura.");
    }

    const result = mergePsnProfilesGames(importedGames);
    saveGames();
    state.view = "library";
    setActiveViewButton("library");
    render();
    elements.psnSummaryText.textContent = `Importados ${result.created} nuevos y actualizados ${result.updated}. Última lectura: ${new Date().toLocaleString("es-ES")}.`;
  } catch (error) {
    elements.psnSummaryText.textContent = `No he podido importar: ${error.message}`;
    alert(`No he podido importar desde PSNProfiles.\n\n${error.message}`);
  } finally {
    elements.syncPsnProfileButton.textContent = originalText || "Importar juegos";
    elements.syncPsnProfileButton.disabled = !getPsnProfilesUser();
  }
}

async function fetchPsnProfilesProfile(user) {
  const profileUrl = getPsnProfilesUrl(user);
  const urls = [
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
        imageUrl: imported.imageUrl || existing.imageUrl,
        imageData: existing.imageData || imported.imageData || "",
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
        imageUrl: imported.imageUrl || "",
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
  return { created, updated };
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
  const key = elements.rawgKey.value.trim();
  const query = (elements.gameSearch.value || elements.vaultSearch.value).trim();

  if (!key) {
    elements.searchResults.innerHTML = `<p class="muted">Necesitas una API key gratis de RAWG.</p>`;
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

async function improveLibraryCoversFromRawg() {
  const key = elements.rawgKey.value.trim();
  if (!key) {
    elements.settingsDialog.showModal();
    return;
  }

  const button = elements.improveCoversButton;
  const originalText = button.textContent;
  button.disabled = true;
  let improved = 0;
  let checked = 0;

  try {
    const targets = state.games.filter((game) => {
      const current = String(game.imageUrl || game.imageData || "");
      return game.title && (!current || current.includes("img.psnprofiles.com/game/"));
    });

    for (const game of targets) {
      checked += 1;
      button.textContent = `Portadas ${checked}/${targets.length}`;
      const url = new URL("https://api.rawg.io/api/games");
      url.searchParams.set("key", key);
      url.searchParams.set("search", game.title);
      url.searchParams.set("page_size", "1");
      url.searchParams.set("platforms", RAWG_PLATFORM_IDS[normalizePlatform(game.platform)] || RAWG_PLATFORM_IDS.all);
      url.searchParams.set("search_precise", "false");

      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const result = data.results?.[0];
      if (!result?.background_image) continue;

      game.imageUrl = result.background_image;
      game.imageData = "";
      game.rawgId = result.id;
      game.rawgSlug = result.slug;
      game.rawgReleased = result.released || game.rawgReleased;
      game.rawgRating = result.rating || game.rawgRating;
      game.updatedAt = Date.now();
      improved += 1;
    }

    saveGames();
    render();
    button.textContent = improved ? `Mejoradas ${improved}` : "Sin cambios";
    setTimeout(() => {
      button.textContent = originalText;
    }, 1800);
  } catch (error) {
    button.textContent = "Error portadas";
    alert(`No he podido mejorar portadas: ${error.message}`);
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 2000);
  }
}

function renderSearchResults(results) {
  elements.searchResults.innerHTML = "";
  elements.catalogEmptyState.hidden = true;

  if (!results.length) {
    elements.searchResults.innerHTML = `<div class="empty-state">🧐<p>No he encontrado juegos con ese filtro.</p></div>`;
    return;
  }

  for (const result of results) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    const platforms = (result.platforms || [])
      .map((item) => item.platform?.name)
      .filter(Boolean)
      .filter((name) => /playstation|nintendo switch|pc/i.test(name))
      .slice(0, 3)
      .join(" · ");
    button.innerHTML = `
      <div class="search-cover">
        ${result.background_image ? `<img alt="" src="${escapeHtml(result.background_image)}" loading="lazy" referrerpolicy="no-referrer" />` : ""}
      </div>
      <span>
        <strong>${escapeHtml(result.name || "Sin título")}</strong>
        <span>${escapeHtml([result.released || "Sin fecha", platforms].filter(Boolean).join(" · "))}</span>
        <em>Añadir a biblioteca</em>
      </span>
    `;
    button.addEventListener("click", () => applyRawgGame(result));
    elements.searchResults.appendChild(button);
  }
}

async function applyRawgGame(result) {
  const game = getSelectedGame();
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
    try {
      game.imageData = await imageUrlToDataUrl(result.background_image);
    } catch {
      game.imageUrl = result.background_image;
    }
  }

  game.updatedAt = Date.now();
  saveGames();
  state.view = "detail";
  setActiveViewButton("detail");
  await render();
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

function saveGames() {
  const compactGames = JSON.stringify(state.games.map(stripStoredTrophies));
  try {
    localStorage.setItem(STORAGE_KEY, compactGames);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, compactGames);
  }
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
  renderList();
  renderStats();
  renderView();
}

function renderSoft() {
  const game = getSelectedGame();
  renderList();
  renderStats();
  renderGameProgressHero(game);
  renderTrophies(game);
  renderView();
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
  elements.trophyImport.value = "";
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
    elements.trophyList.innerHTML = `<p class="muted">Aún no hay logros. Pega una lista o añade uno manualmente.</p>`;
    return;
  }

  for (const trophy of trophies) {
    const row = document.createElement("div");
    row.className = `trophy-row ${trophy.earned ? "earned" : ""}`;
    row.innerHTML = `
      <label class="trophy-check">
        <input type="checkbox" ${trophy.earned ? "checked" : ""} />
        <span></span>
      </label>
      <select class="trophy-type" aria-label="Tipo de trofeo">
        ${["Trofeo", "Bronce", "Plata", "Oro", "Platino"].map((type) => `<option ${type === trophy.type ? "selected" : ""}>${type}</option>`).join("")}
      </select>
      <input class="trophy-name" value="${escapeHtml(trophy.name || "")}" aria-label="Nombre del logro" />
      <button class="tiny ghost trophy-delete" type="button">Eliminar</button>
    `;
    row.querySelector("input[type='checkbox']").addEventListener("change", (event) => {
      trophy.earned = event.target.checked;
      game.updatedAt = Date.now();
      autoUpdateProgressFromTrophies(game);
      saveGames();
      renderSoft();
    });
    row.querySelector(".trophy-type").addEventListener("input", (event) => {
      trophy.type = event.target.value;
      game.updatedAt = Date.now();
      saveGames();
      renderSoft();
    });
    row.querySelector(".trophy-name").addEventListener("input", (event) => {
      trophy.name = event.target.value;
      game.updatedAt = Date.now();
      saveGames();
    });
    row.querySelector(".trophy-delete").addEventListener("click", () => {
      game.trophies = game.trophies.filter((item) => item.id !== trophy.id);
      game.updatedAt = Date.now();
      autoUpdateProgressFromTrophies(game);
      saveGames();
      renderSoft();
    });
    elements.trophyList.appendChild(row);
  }
}

function renderTrophies(game) {
  const trophies = getDisplayTrophies(game);
  const earned = trophies.filter((trophy) => trophy.earned).length;
  elements.trophyProgressBadge.textContent = `${earned}/${trophies.length}`;
  elements.trophyList.innerHTML = "";

  if (!trophies.length) {
    elements.trophyList.innerHTML = `<p class="muted">Todavia no tengo el checklist detallado de este juego. Cuando lo importemos desde PSNProfiles aparecera aqui con los conseguidos marcados.</p>`;
    return;
  }

  for (const trophy of trophies) {
    const row = document.createElement("div");
    row.className = `trophy-row trophy-row-readonly ${trophy.earned ? "earned" : ""}`;
    const type = trophy.type || "Trofeo";
    const image = trophy.imageUrl
      ? `<img src="${escapeHtml(trophy.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
      : `<span>${getTrophyTypeIcon(type)}</span>`;
    const rarity = trophy.rarity ? `<small>${escapeHtml(trophy.rarity)}</small>` : "";
    const earnedDate = trophy.earnedAt ? `<small class="earned-date">${escapeHtml(trophy.earnedAt)}</small>` : "";
    row.innerHTML = `
      <div class="trophy-icon ${trophy.earned ? "is-earned" : ""}">${image}</div>
      <div class="trophy-copy">
        <strong>${escapeHtml(trophy.name || "Trofeo sin nombre")}</strong>
        ${trophy.description ? `<p>${escapeHtml(trophy.description)}</p>` : ""}
      </div>
      <div class="trophy-meta">
        <span class="trophy-type-pill ${getTrophyTypeClass(type)}">${escapeHtml(type)}</span>
        ${rarity}
        ${earnedDate}
      </div>
      <div class="trophy-earned-mark" title="${trophy.earned ? "Conseguido" : "Pendiente"}">${trophy.earned ? "✓" : ""}</div>
    `;
    elements.trophyList.appendChild(row);
  }
}

function getTrophyTypeIcon(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("platino")) return "🏆";
  if (value.includes("oro")) return "🥇";
  if (value.includes("plata")) return "🥈";
  if (value.includes("bronce")) return "🥉";
  return "◇";
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
  });
  elements.gameList.innerHTML = "";
  elements.libraryGrid.innerHTML = "";

  if (!games.length) {
    elements.gameList.innerHTML = `<p class="muted">No hay juegos en este filtro.</p>`;
    elements.libraryGrid.innerHTML = `<div class="empty-state">🧐<p>No hay juegos aquí. Busca uno arriba y añádelo a tu biblioteca.</p></div>`;
    return;
  }

  for (const game of games) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `game-item ${game.id === state.selectedId ? "active" : ""}`;
    button.innerHTML = `
      <strong>${escapeHtml(game.title || "Sin título")}</strong>
      <span>${escapeHtml(game.status)} · ${escapeHtml(game.platform || "Sin plataforma")} · ${Number(game.progress || 0)}%</span>
    `;
    button.addEventListener("click", async () => {
      state.selectedId = game.id;
      state.view = "detail";
      setActiveViewButton("detail");
      await render();
    });
    elements.gameList.appendChild(button);
    elements.libraryGrid.appendChild(createLibraryCard(game));
  }
}

function createLibraryCard(game) {
  const card = document.createElement("article");
  card.className = "library-game-card";
  const background = game.imageData || game.imageUrl || "";
  const trophyCount = Number(game.trophiesTotal || 0);
  const trophyDone = Number(game.trophiesEarned || (Array.isArray(game.trophies) ? game.trophies.filter((trophy) => trophy.earned).length : 0));
  card.innerHTML = `
    <div class="library-cover">
      ${background ? `<img alt="" src="${escapeHtml(background)}" loading="lazy" referrerpolicy="no-referrer" />` : `<div class="cover-fallback">${escapeHtml((game.title || "?").slice(0, 1))}</div>`}
      <span>${escapeHtml(game.platform || "Multi")}</span>
    </div>
    <div class="library-info">
      <strong>${escapeHtml(game.title || "Sin título")}</strong>
      <span>${escapeHtml(game.status)} · ${Number(game.progress || 0)}%</span>
      ${trophyCount ? `<small>${trophyDone}/${trophyCount} trofeos</small>` : ""}
      <div class="progress-bar"><i style="width:${Number(game.progress || 0)}%"></i></div>
      <div class="card-actions-row">
        <button class="tiny" data-action="progress" type="button">Ver progreso</button>
      </div>
    </div>
  `;
  card.querySelector('[data-action="progress"]').addEventListener("click", async () => {
    state.selectedId = game.id;
    state.view = "detail";
    setActiveViewButton("detail");
    await render();
  });
  return card;
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
