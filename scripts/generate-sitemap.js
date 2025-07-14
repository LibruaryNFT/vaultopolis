/* scripts/generate-sitemap.js
    --------------------------------------------------------------
    Build-time sitemap generator for Vaultopolis.
    Generates a sitemap for all static routes, includes <lastmod> 
    and <priority> for every entry.
    -------------------------------------------------------------- */

require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

const fs = require("fs");
const path = require("path");
const routes = require("../src/routes").default; // pure route array

/* ───────── configuration ───────── */
const BASE_URL = "https://vaultopolis.com";
const OUT_PATH = path.resolve(__dirname, "../build/sitemap.xml");
const CHANGEFREQ = "weekly";
const PRIORITY = "0.7";

/* ───────── helpers ───────── */
const isStaticRoute = (path) => {
  // Check if the route contains dynamic parameters (colons)
  return !path.includes(":");
};

const normalize = (p) => (p || "").replace(/\/+$/, "") || "/"; // Only remove trailing slashes, don't strip dynamic params

const todayISO = () => new Date().toISOString().split("T")[0];

/* ───────── main ───────── */
(async function buildSiteMap() {
  /* 1) static routes only - exclude dynamic routes */
  const staticRoutes = routes.filter((r) => isStaticRoute(r.path));
  const staticUrls = staticRoutes.map((r) => ({
    loc: `${BASE_URL}${r.path === "/" ? "" : r.path}`,
    lastmod: todayISO(),
    priority: PRIORITY,
  }));

  /* 2) XML assembly */
  const urlNodes = staticUrls
    .map(
      (u) => `
          <url>
            <loc>${u.loc}</loc>
            <lastmod>${u.lastmod}</lastmod>
            <changefreq>${CHANGEFREQ}</changefreq>
            <priority>${u.priority}</priority>
          </url>`
    )
    .join("");

  const xml =
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urlNodes +
    `\n</urlset>\n`;

  fs.writeFileSync(OUT_PATH, xml);
  console.log("✅  sitemap.xml created in /build");
  console.log(
    `📊  Generated ${staticUrls.length} static URLs (excluded ${
      routes.length - staticRoutes.length
    } dynamic routes)`
  );
})();
