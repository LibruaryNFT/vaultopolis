/*  scripts/generate-sitemap.js
    --------------------------------------------------------------
    Build-time sitemap generator for Vaultopolis
    -------------------------------------------------------------- */

require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

const fs = require("fs");
const path = require("path");
const routes = require("../src/routes").default; // pure route array

/* ───── configuration ───── */
const BASE_URL = "https://vaultopolis.com";
const OUT_PATH = path.resolve(__dirname, "../build/sitemap.xml");
const CHANGEFREQ = "weekly";
const PRIORITY = "0.7";

/* ───── helper: strip :params and trailing slashes ───── */
const normalize = (p) =>
  (p || "")
    .replace(/\/?:[^/]+[\?\*]?/g, "") // `/profile/:id?` → `/profile`
    .replace(/\/+$/, "") || "/";

/* ───── filter routes based on env flags ───── */
const includeMaintenance = process.env.REACT_APP_MAINTENANCE_MODE === "true";
const includeComingSoon = process.env.REACT_APP_COMING_SOON_MODE === "true";

const filteredRoutes = routes.filter((r) => {
  if (["/maintenance"].includes(r.path)) return includeMaintenance;
  if (["/comingsoon"].includes(r.path)) return includeComingSoon;
  return true; // keep all other routes
});

/* ───── build URL set (unique, static paths only) ───── */
const uniqPaths = [...new Set(filteredRoutes.map((r) => normalize(r.path)))];

const urlsXml = uniqPaths
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

/* ───── assemble & write XML ───── */
const xml =
  `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXml}
</urlset>`.trim() + "\n";

fs.writeFileSync(OUT_PATH, xml);

console.log("✅  sitemap.xml created in /build");
