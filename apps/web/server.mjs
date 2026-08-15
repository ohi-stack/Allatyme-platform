import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 3000);
const root = fileURLToPath(new URL("./public/", import.meta.url));

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const requested = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const relative = normalize(requested).replace(/^([.][.][/\\])+/, "").replace(/^[/\\]+/, "");
  const path = join(root, relative);

  if (!path.startsWith(root)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const file = await readFile(path);
    res.writeHead(200, {
      "content-type": mime[extname(path)] || "application/octet-stream",
      "cache-control": extname(path) === ".html" ? "no-cache" : "public, max-age=300",
    });
    res.end(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`ALLATYME web listening on :${port}`);
});
