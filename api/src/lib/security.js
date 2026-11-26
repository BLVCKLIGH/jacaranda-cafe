/* Password hashing (scrypt) and signed session tokens (HMAC-SHA256). Node built-ins only. */
const crypto = require("crypto");
const { promisify } = require("util");
const scrypt = promisify(crypto.scrypt);
const { NotConfigured } = require("./store");

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}
async function verifyPassword(password, stored) {
  try {
    const [scheme, saltB64, hashB64] = String(stored).split("$");
    if (scheme !== "scrypt") return false;
    const expected = Buffer.from(hashB64, "base64");
    const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch { return false; }
}

function secret() {
  const s = process.env.AUTH_SECRET || (process.env.LOCAL_MEMORY === "1" ? "local-dev-secret-not-for-production" : "");
  if (s.length < 16) throw new NotConfigured("AUTH_SECRET is missing or too short");
  return s;
}
const b64u = b => Buffer.from(b).toString("base64url");

function signToken(payload, ttlSeconds = 7 * 24 * 3600) {
  const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const good = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    return data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch { return null; }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
