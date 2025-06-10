// This is the final, environment-aware server.js.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;

// This smarter function handles redirects correctly for all environments.
function smartRedirect(req, res) {
  // This logic only runs when deployed to Heroku.
  if (process.env.NODE_ENV === "production") {
    const host = req.headers.host;
    const isHttp = req.headers["x-forwarded-proto"] !== "https";

    // Special case: If the host is 'www.vaultopolis.com', redirect to the secure, non-www version.
    if (host === "www.vaultopolis.com") {
      res.writeHead(301, { Location: `https://vaultopolis.com${req.url}` });
      res.end();
      return true; // Redirect was sent.
    }

    // For all other domains (like vaultopolis.com or testing.vaultopolis.com),
    // just force HTTPS if the request is insecure.
    if (isHttp) {
      res.writeHead(301, { Location: `https://${host}${req.url}` });
      res.end();
      return true; // Redirect was sent.
    }
  }

  return false; // No redirect was needed.
}

// This function determines the correct content type for files (unchanged).
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case ".js":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    default:
      return "text/html";
  }
}

const server = http.createServer((req, res) => {
  // First, check if we need to perform a redirect.
  if (smartRedirect(req, res)) {
    return; // Stop processing if a redirect was sent.
  }

  // Determine the file path to serve from the 'build' folder.
  let filePath = path.join(
    __dirname,
    "build",
    req.url === "/" ? "index.html" : req.url
  );

  // Check if the requested file exists.
  fs.access(filePath, fs.constants.F_OK, (err) => {
    // If the file doesn't exist (e.g., /swap), serve the index.html for client-side routing.
    if (err) {
      filePath = path.join(__dirname, "build", "index.html");
    }

    // Read and serve the determined file.
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end("Server Error: " + error.code);
      } else {
        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        res.end(content, "utf-8");
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
