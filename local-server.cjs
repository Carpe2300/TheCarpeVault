const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8788);
const host = "127.0.0.1";

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
  .createServer((req, res) => {
    const requestUrl = new URL(req.url || "/", `http://${host}:${port}`);
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
