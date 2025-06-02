/*  scripts/generate-sitemap.js
    --------------------------------------------------------------
    Build-time sitemap generator for Vaultopolis.
    Adds *active wallet* profile URLs from the last 30 days,
    includes <lastmod> and <priority> for every entry.
    -------------------------------------------------------------- */

require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const routes = require("../src/routes").default; // pure route array

/* ───────── configuration ───────── */
const BASE_URL = "https://vaultopolis.com";
const OUT_PATH = path.resolve(__dirname, "../build/sitemap.xml");
const CHANGEFREQ = "weekly";
const PRIORITY = "0.7";
const ACTIVE_API = "https://api.vaultopolis.com/active-wallets?days=30";

/* ───────── helpers ───────── */
const normalize = (p) =>
  (p || "")
    .replace(/\/?:[^/]+[\?\*]?/g, "") // `/profile/:id?` → `/profile`
    .replace(/\/+$/, "") || "/";

const todayISO = () => new Date().toISOString().split("T")[0];

/* ───────── main ───────── */
(async function buildSiteMap() {
  /* 1) static routes */
  const staticUrls = [...new Set(routes.map((r) => normalize(r.path)))].map(
    (p) => ({
      loc: `${BASE_URL}${p === "/" ? "" : p}`,
      lastmod: todayISO(),
      priority: PRIORITY,
    })
  );

  /* 2) active wallets (last-30-days) */
  let walletUrls = [];
  try {
    const resp = await axios.get(ACTIVE_API);
    if (Array.isArray(resp.data)) {
      walletUrls = resp.data.map((w) => ({
        loc: `${BASE_URL}/profile/${w.address.toLowerCase()}`,
        lastmod: new Date(w.lastActivity).toISOString().split("T")[0],
        priority: "0.5", // slightly lower than static
      }));
    }
  } catch (e) {
    console.warn("[sitemap] Couldn’t fetch active wallets – continuing.", e);
  }

  /* 3) XML assembly */
  const urlNodes = [...staticUrls, ...walletUrls]
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
})();
