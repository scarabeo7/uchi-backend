import helmet from "helmet";
import path from "path";

export const configuredHelmet = () =>
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'",
          "nominatim.openstreetmap.org",
          "cdnjs.cloudflare.com",
          "fonts.gstatic.com",
          "uchi-app-uploads.s3.eu-west-1.amazonaws.com",
        ],
        objectSrc: ["'none'"],
        imgSrc: [
          "'self'",
          "data:",
          "a.tile.openstreetmap.org",
          "b.tile.openstreetmap.org",
          "c.tile.openstreetmap.org",
          "stamen-tiles-a.a.ssl.fastly.net",
          "stamen-tiles-b.a.ssl.fastly.net",
          "stamen-tiles-c.a.ssl.fastly.net",
          "stamen-tiles-d.a.ssl.fastly.net",
          "unpkg.com",
          "cdn.pixabay.com",
          "uchi-app-uploads.s3.eu-west-1.amazonaws.com",
          "snappygoat.com",
        ],
        scriptSrc: [
          "'self'",
          "unpkg.com",
          "polyfill.io",
          "https: 'unsafe-inline'",
        ],
        styleSrc: ["'self'", "https: 'unsafe-inline'"],
        fontSrc: ["'self'", "https: 'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
  });

export const httpsOnly = () => (req, res, next) => {
  if (!req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
};

export const logErrors = () => (err, _, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.sendStatus(500);
};

export const pushStateRouting = (apiRoot, staticDir) => (req, res, next) => {
  if (req.method === "GET" && !req.url.startsWith(apiRoot)) {
    return res.sendFile(path.join(staticDir, "index.html"));
  }
  next();
};

export const requiresLogin = (req, res, next) => {
  if (req.user) return next();
  res.sendStatus(401);
};
