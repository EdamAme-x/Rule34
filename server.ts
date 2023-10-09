import "zone.js/node";

import { APP_BASE_HREF } from "@angular/common";
import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppServerModule } from "./src/main.server";
import fetch from "node-fetch";

export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/rule34/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html"))
    ? "index.original.html"
    : "index";

  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set("view engine", "html");
  server.set("views", distFolder);

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
    try {
      const resp = await fetch(url);
      const data = await resp.text();
      res.send(data);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  server.get("/", async (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  server.get("/get-image/*", async (req, res) => {
    try {
      const url = req.path.replace("/get-image/", "");
      const response = await fetch(url);
      const contentType = response.headers.get("content-type");
      res.setHeader("Content-Type", contentType as string);
      const buffer = await response.buffer();
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });
  return server;
}

function run(): void {
  const port = process.env["PORT"] || 4000;

  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
