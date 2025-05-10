/* scripts/generate-sitemap.js
   --------------------------------------------------------------
   Tiny, v6‑compatible sitemap builder for Vaultopolis
   -------------------------------------------------------------- */
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

const fs = require("fs");
const path = require("path");
const routes = require("../src/routes").default; // ← your pure array

const BASE_URL = "https://vaultopolis.com";
const OUT_FILE = path.resolve(__dirname, "../build/sitemap.xml");
const CHANGEFREQ = "weekly";
const PRIORITY = "0.7";

// 1️⃣ Collect unique, static paths (strip :params and trailing slashes)
const uniq = new Set(
  routes.map(
    (r) =>
      (r.path || "")
        .replace(/\/?:[^/]+[\?\*]?/g, "") // `/profile/:id?` → `/profile`
        .replace(/\/+$/, "") || "/" // empty → root
  )
);

// 2️⃣ Build XML
const urls = [...uniq]
  .map((p) => `${BASE_URL}${p === "/" ? "" : p}`)
  .map(
    (loc) => `
  <url>
    <loc>${loc}</loc>
    <changefreq>${CHANGEFREQ}</changefreq>
    <priority>${PRIORITY}</priority>
  </url>`
  )
  .join("");

const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

// 3️⃣ Write file
fs.writeFileSync(OUT_FILE, xml.trim());
console.log("✅  sitemap.xml created in /build");
