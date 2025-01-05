import fs from "node:fs";
import http from "node:http";
import chokidar from "chokidar";
import { build } from "./builder.js";
import { siteDestinationDir } from "./consts.js";

build();

const port = 8080;
const contentTypes: { [ext: string]: string } = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
};

let clients: http.ServerResponse[] = [];

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (!req.url) {
      res.statusCode = 400;
      res.end();
      return;
    }
    if (req.url !== "/poll") {
      const url = new URL(
        req.url.endsWith("/") ? `${req.url}index.html` : req.url,
        `http://localhost:${port}`,
      );
      const filePath = `${siteDestinationDir}${url.pathname}`;
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const extMatch = url.pathname.match(/\.\w+$/);
      const contentType =
        contentTypes[extMatch ? extMatch[0] : ""] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": contentType });
      if (url.pathname === "/index.html") {
        res.end(
          `${fs.readFileSync(filePath, "utf-8")}<script src="poll.js"></script>`,
          "utf-8",
        );
        return;
      }
      res.end(fs.readFileSync(filePath), "utf-8");
      return;
    }
    clients.push(res);
  })
  .listen(port, () => {
    console.log(`Listen on http://localhost:${port}`);
  });

chokidar.watch("./src").on("all", async (event, filepath) => {
  build();
  for (const client of clients) {
    client.end();
  }
  clients = [];
});
