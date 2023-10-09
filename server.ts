import "zone.js/node";
import { APP_BASE_HREF } from "@angular/common";
import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppServerModule } from "./src/main.server";
import fetch from "node-fetch";

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/rule34/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html"))
    ? "index.original.html"
    : "index";

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set("view engine", "html");
  server.set("views", distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    "*.*",
    express.static(distFolder, {
      maxAge: "1y",
    })
  );

  server.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });

  server.get("/image/:id", async (req, res) => {
    const id = req.params.id;
    const url = `https://rule34.xxx/index.php?page=post&s=view&id=${id}`;
    const resp = await fetch(url);
    const data = await resp.text();

    res.send(data);
  });

  // All regular routes use the Universal engine
  server.get("/", (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  server.get("/get-image/*", async (req, res) => {
    try {
      const url = req.path.replace("/get-image/", "");
      const response = await fetch(url, { method: "GET" });
      const contentType = response.headers.get("content-type") || "";
      res.setHeader("Content-Type", contentType);
      const buffer = await response.buffer();
      res.send(buffer);
    } catch (error: any) {
      console.error(error);
      res.status(500).send("画像を取得できませんでした。");
    }
  });
  return server;
}

function run(): void {
  const port = process.env["PORT"] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
