"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5173;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

http.createServer((request, response) => {
  const cleanUrl = decodeURIComponent(request.url.split("?")[0]);
  let relativePath = cleanUrl.replace(/^\/portfolio-builder\/?/, "/");
  if (relativePath === "/") relativePath = "/index.html";

  const filePath = path.resolve(ROOT, "." + relativePath);
  if (!filePath.startsWith(path.resolve(ROOT))) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    response.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log("FolioReady is running at http://127.0.0.1:" + PORT + "/");
  console.log("Compatibility URL: http://127.0.0.1:" + PORT + "/portfolio-builder/");
});
