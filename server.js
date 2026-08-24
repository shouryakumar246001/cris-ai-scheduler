/**
 * ============================================================
 * CRIS AI Block Scheduling System — Multi-Page Web Server
 * ============================================================
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3030;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "text/javascript",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".csv":  "text/csv",
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split("?")[0];
  if (reqUrl === "/") reqUrl = "/index.html";

  // Map /coa, /bdms, /fois, /milp, /analytics to their respective HTML pages
  if (reqUrl === "/coa") reqUrl = "/pages/coa.html";
  if (reqUrl === "/bdms") reqUrl = "/pages/bdms.html";
  if (reqUrl === "/fois") reqUrl = "/pages/fois.html";
  if (reqUrl === "/milp") reqUrl = "/pages/milp.html";
  if (reqUrl === "/analytics" || reqUrl === "/data") reqUrl = "/pages/analytics.html";

  const filePath = path.join(BASE_DIR, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`<h2>404 Not Found</h2><p>The requested URL ${reqUrl} was not found.</p><a href="/">Return to Dashboard</a>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚆 CRIS AI Block Scheduler Server running at: http://localhost:${PORT}`);
  console.log(`   - Overview Dashboard: http://localhost:${PORT}/`);
  console.log(`   - COA Telemetry Lab:  http://localhost:${PORT}/pages/coa.html`);
  console.log(`   - BDMS Shadow Block:  http://localhost:${PORT}/pages/bdms.html`);
  console.log(`   - FOIS Priority Hub:  http://localhost:${PORT}/pages/fois.html`);
  console.log(`   - MILP & XAI Studio:  http://localhost:${PORT}/pages/milp.html`);
  console.log(`   - Dataset Analytics:  http://localhost:${PORT}/pages/analytics.html\n`);
});
