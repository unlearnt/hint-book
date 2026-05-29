import dotenv from "dotenv";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

// Prefer project .env values over any stale shell-level env values.
dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PASSWORD = (process.env.APP_PASSWORD || "").trim();
const DEEPINFRA_API_KEY = (process.env.DEEPINFRA_API_KEY || "").trim();
const COSMOS_API_KEY = (process.env.COSMOS_API_KEY || "").trim();
const PORT = process.env.PORT || 3000;

if (!PASSWORD) { console.error("APP_PASSWORD is not set"); process.exit(1); }
if (!DEEPINFRA_API_KEY) { console.error("DEEPINFRA_API_KEY is not set"); process.exit(1); }

const sessions = new Set();

function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf("=");
      return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
}

function requireAuth(req, res, next) {
  const token = parseCookies(req.headers.cookie).hb_session;
  if (token && sessions.has(token)) return next();
  res.status(401).json({ error: "Unauthorized" });
}

const app = express();

app.post("/api/auth/login", express.json(), (req, res) => {
  if (!PASSWORD || req.body.password === PASSWORD) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.add(token);
    res.setHeader("Set-Cookie", `hb_session=${token}; HttpOnly; SameSite=Strict; Path=/`);
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

app.post("/api/auth/logout", express.json(), (req, res) => {
  const token = parseCookies(req.headers.cookie).hb_session;
  sessions.delete(token);
  res.setHeader("Set-Cookie", "hb_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
  res.json({ ok: true });
});

app.get("/api/auth/check", (req, res) => {
  const token = parseCookies(req.headers.cookie).hb_session;
  res.json({ authed: !!(token && sessions.has(token)) });
});

app.use("/api/llm", requireAuth, createProxyMiddleware({
  target: "https://api.deepinfra.com",
  changeOrigin: true,
  pathRewrite: (path) => `/v1/openai${path}`,
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader("Authorization", `Bearer ${DEEPINFRA_API_KEY}`);
    },
  },
}));

app.use("/api/cosmos", requireAuth, createProxyMiddleware({
  target: "https://aiplatform.dev51.cbf.dev.paypalinc.com",
  changeOrigin: true,
  pathRewrite: (path) => `/cosmosai/llm/v1${path}`,
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader("Authorization", `Bearer ${COSMOS_API_KEY}`);
    },
  },
}));

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(PORT, () => console.log(`HintBook running on http://localhost:${PORT}`));
