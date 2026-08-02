const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  exchangeRefreshTokenForAuthTokens,
  getProfileFromAccountId,
  getTitleTrophies,
  getTitleTrophyGroups,
  getUserTitles,
  getUserTrophyProfileSummary,
  getUserTrophiesEarnedForTitle,
} = require("psn-api");

const root = __dirname;
const port = Number(process.env.PORT || 8788);
const host = "127.0.0.1";
const authFile = path.join(root, ".carpe-vault-auth.json");
const trophyCacheFile = path.join(root, ".carpe-vault-trophies.json");
const powershell = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
let activeAuth = null;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const filePath = path.resolve(root, clean || "index.html");
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

function isTrustedLocalRequest(req) {
  const origin = String(req.headers.origin || "");
  return !origin || origin === `http://${host}:${port}`;
}

function readJsonBody(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > limit) {
        reject(new Error("La solicitud es demasiado grande."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON no valido."));
      }
    });
    req.on("error", reject);
  });
}

function protectSecret(value) {
  if (process.platform !== "win32") {
    throw new Error("El almacenamiento seguro local solo esta habilitado en Windows.");
  }
  const script = [
    "Add-Type -AssemblyName System.Security",
    "$bytes=[Text.Encoding]::UTF8.GetBytes($env:CARPE_SECRET)",
    "$encrypted=[Security.Cryptography.ProtectedData]::Protect($bytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)",
    "[Convert]::ToBase64String($encrypted)",
  ].join("; ");
  const result = spawnSync(powershell, ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, CARPE_SECRET: value },
  });
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error("Windows no pudo proteger la credencial local.");
  }
  return result.stdout.trim();
}

function unprotectSecret(value) {
  const script = [
    "Add-Type -AssemblyName System.Security",
    "$encrypted=[Convert]::FromBase64String($env:CARPE_SECRET)",
    "$bytes=[Security.Cryptography.ProtectedData]::Unprotect($encrypted,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)",
    "[Text.Encoding]::UTF8.GetString($bytes)",
  ].join("; ");
  const result = spawnSync(powershell, ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, CARPE_SECRET: value },
  });
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error("No se pudo abrir la credencial local de PlayStation.");
  }
  return result.stdout.trim();
}

function loadStoredAuth() {
  if (!fs.existsSync(authFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(authFile, "utf8"));
  } catch {
    return null;
  }
}

function saveStoredAuth(refreshToken, onlineId = "") {
  const payload = {
    version: 1,
    refreshToken: protectSecret(refreshToken),
    onlineId,
    connectedAt: new Date().toISOString(),
  };
  fs.writeFileSync(authFile, JSON.stringify(payload, null, 2), { encoding: "utf8", mode: 0o600 });
}

function clearStoredAuth() {
  activeAuth = null;
  if (fs.existsSync(authFile)) fs.rmSync(authFile);
}

function loadPlayStationTrophyCache() {
  try {
    const cache = JSON.parse(fs.readFileSync(trophyCacheFile, "utf8"));
    return cache && typeof cache === "object" ? cache : {};
  } catch {
    return {};
  }
}

function savePlayStationTrophyCache(cache) {
  fs.writeFileSync(trophyCacheFile, JSON.stringify(cache), { encoding: "utf8", mode: 0o600 });
}

async function getPlayStationAuthorization() {
  if (activeAuth?.accessToken && activeAuth.expiresAt > Date.now() + 60_000) {
    return activeAuth;
  }
  const stored = loadStoredAuth();
  if (!stored?.refreshToken) throw new Error("PlayStation no esta conectado.");
  const refreshToken = unprotectSecret(stored.refreshToken);
  const tokens = await exchangeRefreshTokenForAuthTokens(refreshToken);
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error("PlayStation no devolvio una sesion valida.");
  }
  saveStoredAuth(tokens.refreshToken, stored.onlineId || "");
  activeAuth = {
    accessToken: tokens.accessToken,
    expiresAt: Date.now() + Number(tokens.expiresIn || 3600) * 1000,
  };
  return activeAuth;
}

function trophyCount(counts = {}) {
  return ["bronze", "silver", "gold", "platinum"]
    .reduce((sum, key) => sum + Number(counts[key] || 0), 0);
}

function normalizePlayStationPlatform(value) {
  const platform = String(value || "").toUpperCase();
  if (platform.includes("PS5")) return "PS5";
  if (platform.includes("PS4")) return "PS4";
  if (platform.includes("PS3")) return "PS3";
  if (platform.includes("VITA")) return "PS Vita";
  return platform.split(",")[0] || "PlayStation";
}

function normalizePlayStationTitle(title) {
  const earned = trophyCount(title.earnedTrophies);
  const total = trophyCount(title.definedTrophies);
  const progress = Number(title.progress || 0);
  const platinum = Number(title.earnedTrophies?.platinum || 0) > 0;
  return {
    title: title.trophyTitleName,
    platform: normalizePlayStationPlatform(title.trophyTitlePlatform),
    progress,
    status: platinum ? "Platino" : earned > 0 ? "En progreso" : "Backlog",
    imageUrl: title.trophyTitleIconUrl || "",
    trophiesEarned: earned,
    trophiesTotal: total,
    lastUpdatedDateTime: title.lastUpdatedDateTime || "",
    npCommunicationId: title.npCommunicationId,
    npServiceName: title.npServiceName,
    hasTrophyGroups: Boolean(title.hasTrophyGroups),
    hiddenFlag: Boolean(title.hiddenFlag),
    earnedTrophies: title.earnedTrophies || {},
    definedTrophies: title.definedTrophies || {},
    source: "PlayStation",
  };
}

async function connectPlayStation(npsso) {
  const token = String(npsso || "").trim();
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
    throw new Error("El NPSSO no tiene un formato valido.");
  }
  const code = await exchangeNpssoForAccessCode(token);
  const tokens = await exchangeAccessCodeForAuthTokens(code);
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error("PlayStation no devolvio una sesion valida.");
  }
  const authorization = { accessToken: tokens.accessToken };
  const profile = await getProfileFromAccountId(authorization, "me").catch(() => ({}));
  saveStoredAuth(tokens.refreshToken, profile.onlineId || "");
  activeAuth = {
    accessToken: tokens.accessToken,
    expiresAt: Date.now() + Number(tokens.expiresIn || 3600) * 1000,
  };
  return { connected: true, onlineId: profile.onlineId || "" };
}

async function syncPlayStationTitles() {
  const authorization = await getPlayStationAuthorization();
  const [response, profileSummary] = await Promise.all([
    getUserTitles(authorization, "me", {
      limit: 800,
      offset: 0,
      headerOverrides: { "Accept-Language": "es-ES" },
    }),
    getUserTrophyProfileSummary(authorization, "me", {
      headerOverrides: { "Accept-Language": "es-ES" },
    }).catch(() => null),
  ]);
  const titles = Array.isArray(response?.trophyTitles)
    ? response.trophyTitles.map(normalizePlayStationTitle)
    : [];
  const cache = loadPlayStationTrophyCache();
  let cacheChanged = false;
  for (const title of titles) {
    const detail = cache[title.npCommunicationId];
    if (!detail) continue;
    if (detail.title !== title.title || detail.platform !== title.platform) {
      detail.title = title.title;
      detail.platform = title.platform;
      cacheChanged = true;
    }
  }
  if (cacheChanged) savePlayStationTrophyCache(cache);
  const visiblePlatinums = titles.filter((title) => title.status === "Platino" && !title.hiddenFlag).length;
  const officialPlatinums = Number(profileSummary?.earnedTrophies?.platinum || 0);
  return {
    connected: true,
    onlineId: loadStoredAuth()?.onlineId || "",
    total: Number(response?.totalItemCount || titles.length),
    titles,
    profileSummary: {
      trophyLevel: profileSummary?.trophyLevel || "",
      progress: Number(profileSummary?.progress || 0),
      earnedTrophies: profileSummary?.earnedTrophies || {},
      visiblePlatinums,
      hiddenPlatinums: Math.max(officialPlatinums - visiblePlatinums, 0),
    },
    syncedAt: new Date().toISOString(),
  };
}

function normalizePlayStationTrophyType(value) {
  const type = String(value || "").toLowerCase();
  if (type === "platinum") return "Platino";
  if (type === "gold") return "Oro";
  if (type === "silver") return "Plata";
  if (type === "bronze") return "Bronce";
  return "Trofeo";
}

function normalizePlayStationTrophyRarity(rate) {
  const value = Number.parseFloat(String(rate || "0"));
  const label = value <= 5 ? "Ultra Rare"
    : value <= 10 ? "Very Rare"
      : value <= 50 ? "Rare"
        : "Common";
  return `${Number.isFinite(value) ? value : 0}% ${label}`;
}

async function getAllPlayStationTrophies(fetchPage) {
  const trophies = [];
  let offset = 0;
  let firstResponse = null;

  while (true) {
    const response = await fetchPage(offset);
    if (!firstResponse) firstResponse = response;
    const page = Array.isArray(response?.trophies) ? response.trophies : [];
    trophies.push(...page);
    const nextOffset = Number(response?.nextOffset);
    if (!page.length || !Number.isFinite(nextOffset) || nextOffset <= offset) break;
    offset = nextOffset;
  }

  return { ...(firstResponse || {}), trophies };
}

async function syncPlayStationTrophySet(authorization, title) {
  const npCommunicationId = String(title?.npCommunicationId || "").trim();
  if (!npCommunicationId) throw new Error("El juego no tiene identificador de trofeos.");
  const npServiceName = title?.npServiceName ||
    (normalizePlayStationPlatform(title?.platform) === "PS5" ? "trophy2" : "trophy");
  const options = {
    npServiceName,
    headerOverrides: { "Accept-Language": "es-ES" },
  };

  const [definedResponse, earnedResponse, groupsResponse] = await Promise.all([
    getAllPlayStationTrophies((offset) => getTitleTrophies(
      authorization,
      npCommunicationId,
      "all",
      { ...options, limit: 100, offset }
    )),
    getAllPlayStationTrophies((offset) => getUserTrophiesEarnedForTitle(
      authorization,
      "me",
      npCommunicationId,
      "all",
      { ...options, limit: 100, offset }
    )),
    title?.hasTrophyGroups
      ? getTitleTrophyGroups(authorization, npCommunicationId, {
        npServiceName,
        headerOverrides: options.headerOverrides,
      }).catch(() => ({ trophyGroups: [] }))
      : Promise.resolve({ trophyGroups: [] }),
  ]);

  const earnedById = new Map(
    (earnedResponse?.trophies || []).map((trophy) => [Number(trophy.trophyId), trophy])
  );
  const groupById = new Map(
    (groupsResponse?.trophyGroups || []).map((group) => [String(group.trophyGroupId), group])
  );
  const trophies = (definedResponse?.trophies || []).map((trophy) => {
    const earned = earnedById.get(Number(trophy.trophyId)) || {};
    const groupId = String(trophy.trophyGroupId || "default");
    const group = groupById.get(groupId);
    const groupName = groupId === "default"
      ? "Juego base"
      : group?.trophyGroupName || group?.trophyGroupDetail || `DLC ${groupId}`;
    return {
      id: `psn-${npCommunicationId}-${trophy.trophyId}`,
      trophyId: Number(trophy.trophyId),
      name: trophy.trophyName || `Trofeo ${Number(trophy.trophyId) + 1}`,
      description: trophy.trophyDetail || "",
      type: normalizePlayStationTrophyType(trophy.trophyType || earned.trophyType),
      rarity: normalizePlayStationTrophyRarity(earned.trophyEarnedRate),
      earned: Boolean(earned.earned),
      earnedAt: earned.earnedDateTime || "",
      imageUrl: trophy.trophyIconUrl || "",
      group: groupName,
      trophyGroupId: groupId,
      hidden: Boolean(trophy.trophyHidden),
      source: "PlayStation",
    };
  });

  return {
    npCommunicationId,
    title: title?.title || "",
    platform: title?.platform || "",
    npServiceName,
    trophySetVersion: definedResponse?.trophySetVersion || earnedResponse?.trophySetVersion || "",
    lastUpdatedDateTime: earnedResponse?.lastUpdatedDateTime || title?.lastUpdatedDateTime || "",
    hasTrophyGroups: Boolean(definedResponse?.hasTrophyGroups || earnedResponse?.hasTrophyGroups),
    trophies,
    trophiesEarned: trophies.filter((trophy) => trophy.earned).length,
    trophiesTotal: trophies.length,
  };
}

async function syncPlayStationTrophySets(requestedTitles) {
  const authorization = await getPlayStationAuthorization();
  const titles = Array.isArray(requestedTitles) ? requestedTitles.slice(0, 6) : [];
  const results = await Promise.allSettled(
    titles.map((title) => syncPlayStationTrophySet(authorization, title))
  );
  const details = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  if (details.length) {
    const cache = loadPlayStationTrophyCache();
    for (const detail of details) cache[detail.npCommunicationId] = detail;
    savePlayStationTrophyCache(cache);
  }
  return {
    connected: true,
    details,
    errors: results
      .map((result, index) => ({ result, title: titles[index] }))
      .filter(({ result }) => result.status === "rejected")
      .map(({ result, title }) => ({
        npCommunicationId: title?.npCommunicationId || "",
        title: title?.title || "",
        error: result.reason?.message || "No se pudo leer el juego.",
      })),
    syncedAt: new Date().toISOString(),
  };
}

function getSnapshotMetadata() {
  const snapshots = ["psnprofiles-import.js", "psnprofiles-trophies.js"].map((name) => {
    const filePath = path.join(root, name);
    if (!fs.existsSync(filePath)) return { name, exists: false };
    const stats = fs.statSync(filePath);
    return {
      name,
      exists: true,
      bytes: stats.size,
      updatedAt: stats.mtime.toISOString(),
    };
  });
  const available = snapshots.every((snapshot) => snapshot.exists);
  const updatedAt = available
    ? snapshots.map((snapshot) => snapshot.updatedAt).sort().at(-1)
    : null;
  return { available, updatedAt, files: snapshots };
}

function proxyRemote(req, res, target, allowedHosts, contentType) {
  let remote;
  try {
    remote = new URL(target);
  } catch {
    sendJson(res, 400, { error: "URL no valida" });
    return;
  }

  if (remote.protocol !== "https:" || !allowedHosts.has(remote.hostname)) {
    sendJson(res, 403, { error: "Destino no permitido" });
    return;
  }

  const upstream = https.get(remote, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      "Accept": contentType === "text/html; charset=utf-8" ? "text/html,application/xhtml+xml" : "image/avif,image/webp,image/png,image/jpeg,*/*",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    },
  }, (upstreamResponse) => {
    if ((upstreamResponse.statusCode === 301 || upstreamResponse.statusCode === 302) && upstreamResponse.headers.location) {
      proxyRemote(req, res, new URL(upstreamResponse.headers.location, remote).href, allowedHosts, contentType);
      upstreamResponse.resume();
      return;
    }

    if (upstreamResponse.statusCode !== 200) {
      upstreamResponse.resume();
      sendJson(res, upstreamResponse.statusCode || 502, { error: `El origen respondio ${upstreamResponse.statusCode || 502}` });
      return;
    }

    res.writeHead(200, {
      "Content-Type": upstreamResponse.headers["content-type"] || contentType,
      "Cache-Control": contentType.startsWith("image/") ? "public, max-age=86400" : "no-store",
      "Access-Control-Allow-Origin": "*",
    });
    upstreamResponse.pipe(res);
  });

  upstream.setTimeout(20000, () => upstream.destroy(new Error("Tiempo de espera agotado")));
  upstream.on("error", (error) => sendJson(res, 502, { error: error.message }));
}

http
  .createServer(async (req, res) => {
    const requestUrl = new URL(req.url || "/", `http://${host}:${port}`);
    if (requestUrl.pathname === "/api/playstation/status") {
      const stored = loadStoredAuth();
      sendJson(res, 200, {
        connected: Boolean(stored?.refreshToken),
        onlineId: stored?.onlineId || "",
        connectedAt: stored?.connectedAt || "",
      });
      return;
    }

    if (requestUrl.pathname === "/api/playstation/connect" && req.method === "POST") {
      if (!isTrustedLocalRequest(req)) {
        sendJson(res, 403, { error: "Origen no permitido." });
        return;
      }
      try {
        const body = await readJsonBody(req);
        sendJson(res, 200, await connectPlayStation(body.npsso));
      } catch (error) {
        sendJson(res, 400, { error: error.message || "No se pudo conectar PlayStation." });
      }
      return;
    }

    if (requestUrl.pathname === "/api/playstation/disconnect" && req.method === "POST") {
      if (!isTrustedLocalRequest(req)) {
        sendJson(res, 403, { error: "Origen no permitido." });
        return;
      }
      clearStoredAuth();
      sendJson(res, 200, { connected: false });
      return;
    }

    if (requestUrl.pathname === "/api/playstation/sync" && req.method === "POST") {
      if (!isTrustedLocalRequest(req)) {
        sendJson(res, 403, { error: "Origen no permitido." });
        return;
      }
      try {
        sendJson(res, 200, await syncPlayStationTitles());
      } catch (error) {
        sendJson(res, 502, { error: error.message || "No se pudo sincronizar PlayStation." });
      }
      return;
    }

    if (requestUrl.pathname === "/api/playstation/trophies" && req.method === "POST") {
      if (!isTrustedLocalRequest(req)) {
        sendJson(res, 403, { error: "Origen no permitido." });
        return;
      }
      try {
        const body = await readJsonBody(req, 128 * 1024);
        sendJson(res, 200, await syncPlayStationTrophySets(body.titles));
      } catch (error) {
        sendJson(res, 502, { error: error.message || "No se pudieron sincronizar los trofeos." });
      }
      return;
    }

    if (requestUrl.pathname === "/api/playstation/trophies/cache" && req.method === "GET") {
      const details = Object.values(loadPlayStationTrophyCache());
      sendJson(res, 200, { details, total: details.length });
      return;
    }

    if (requestUrl.pathname === "/api/snapshot-meta") {
      sendJson(res, 200, getSnapshotMetadata());
      return;
    }

    if (requestUrl.pathname === "/api/psnprofiles") {
      const target = requestUrl.searchParams.get("url") || "";
      proxyRemote(req, res, target, new Set(["psnprofiles.com", "www.psnprofiles.com"]), "text/html; charset=utf-8");
      return;
    }

    if (requestUrl.pathname === "/api/image") {
      const target = requestUrl.searchParams.get("url") || "";
      proxyRemote(req, res, target, new Set(["img.psnprofiles.com", "media.rawg.io"]), "image/png");
      return;
    }

    const requested = safePath(req.url || "/");
    const filePath = requested && fs.existsSync(requested) && fs.statSync(requested).isDirectory()
      ? path.join(requested, "index.html")
      : requested;

    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  })
  .listen(port, host, () => {
    console.log(`The Carpe Vault running at http://${host}:${port}/`);
  });
