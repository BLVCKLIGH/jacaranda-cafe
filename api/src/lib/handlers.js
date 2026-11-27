/* Pure request handlers: take { body, token } and return { status, body }. */
const crypto = require("crypto");
const store = require("./store");
const sec = require("./security");

const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+27|0)[1-8]\d{8}$/;
const rowKey = email => Buffer.from(email).toString("base64url");   // safe Table Storage key
const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const publicUser = u => ({ name: u.name, email: u.email });
const fail = (status, error, extra) => ({ status, body: { error, ...extra } });

const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000;
let dummyHash;   // so unknown emails cost the same time as wrong passwords

const handlers = {
  async register({ body }) {
    const name = clean(body.name, 60), email = clean(body.email, 120).toLowerCase(), password = String(body.password ?? "");
    if (name.length < 2) return fail(400, "Enter your name.", { field: "name" });
    if (!EMAIL.test(email)) return fail(400, "Enter a valid email address.", { field: "email" });
    if (password.length < 8 || password.length > 128) return fail(400, "Password must be 8 to 128 characters.", { field: "password" });
    try {
      await store.createEntity("users", {
        partitionKey: "user", rowKey: rowKey(email), email, name,
        passwordHash: await sec.hashPassword(password), createdAt: new Date().toISOString(), failCount: 0, lockUntil: "",
      });
    } catch (e) {
      if (e.statusCode === 409 || e.code === "EntityAlreadyExists" || /already exists/i.test(e.message || "")) return fail(409, "An account with that email already exists. Try signing in.", { field: "email" });
      throw e;
    }
    return { status: 201, body: { token: sec.signToken({ sub: email, name }), user: { name, email } } };
  },

  async login({ body }) {
    const email = clean(body.email, 120).toLowerCase(), password = String(body.password ?? "");
    if (!EMAIL.test(email) || !password) return fail(400, "Enter your email and password.");
    const user = await store.getEntity("users", "user", rowKey(email));
    const lockedUntil = user && user.lockUntil ? Date.parse(user.lockUntil) : 0;
    if (user && lockedUntil > Date.now()) {
      const mins = Math.ceil((lockedUntil - Date.now()) / 60000);
      return fail(429, `Too many wrong passwords. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
    }
    dummyHash ||= await sec.hashPassword("dummy-password");
    const ok = await sec.verifyPassword(password, user ? user.passwordHash : dummyHash);
    if (!user || !ok) {
      if (user) {
        const fails = Number(user.failCount || 0) + 1;
        await store.mergeEntity("users", { partitionKey: "user", rowKey: user.rowKey, failCount: fails >= MAX_FAILS ? 0 : fails, lockUntil: fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MS).toISOString() : "" });
      }
      return fail(401, "Incorrect email or password.");
    }
    if (Number(user.failCount) > 0) await store.mergeEntity("users", { partitionKey: "user", rowKey: user.rowKey, failCount: 0, lockUntil: "" });
    return { status: 200, body: { token: sec.signToken({ sub: user.email, name: user.name }), user: publicUser(user) } };
  },

  async me({ token }) {
    const claims = sec.verifyToken(token);
    if (!claims) return fail(401, "Your session has expired. Please sign in again.");
    const user = await store.getEntity("users", "user", rowKey(claims.sub));
    if (!user) return fail(401, "Account not found.");
    return { status: 200, body: { user: publicUser(user) } };
  },

  async reservation({ body, token }) {
    const b = {
      name: clean(body.name, 80), phone: clean(body.phone, 20), email: clean(body.email, 120),
      date: clean(body.date, 10), time: clean(body.time, 5), guests: Number(body.guests),
      seat: clean(body.seat, 10), note: clean(body.note, 300),
    };
    if (b.name.length < 2) return fail(400, "Enter the name for the booking.");
    if (!PHONE.test(b.phone.replace(/[\s()-]/g, ""))) return fail(400, "Enter a valid South African mobile number.");
    if (!EMAIL.test(b.email)) return fail(400, "Enter a valid email address.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !/^\d{2}:\d{2}$/.test(b.time)) return fail(400, "Choose a date and time.");
    if (!Number.isInteger(b.guests) || b.guests < 1 || b.guests > 8) return fail(400, "Bookings are for 1 to 8 guests.");
    if (!["Terrace", "Inside", "Either"].includes(b.seat)) b.seat = "Either";
    const claims = sec.verifyToken(token);   // optional: links the booking to a signed-in account
    const ref = "T-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    await store.createEntity("reservations", { partitionKey: b.date, rowKey: ref, ...b, userEmail: claims ? claims.sub : "", createdAt: new Date().toISOString() });
    return { status: 201, body: { ref } };
  },

  async order({ body, token }) {
    const claims = sec.verifyToken(token);
    if (!claims) return fail(401, "Please sign in to place an order.", { signin: true });
    const items = {};
    for (const [id, qty] of Object.entries(body.items || {})) {
      if (/^[a-z0-9-]{1,40}$/.test(id) && Number.isInteger(qty) && qty >= 1 && qty <= 20) items[id] = qty;
    }
    if (!Object.keys(items).length || Object.keys(items).length > 30) return fail(400, "Your order is empty.");
    const name = clean(body.name, 80), phone = clean(body.phone, 20), time = clean(body.time, 5);
    if (name.length < 2) return fail(400, "Enter your name.");
    if (!PHONE.test(phone.replace(/[\s()-]/g, ""))) return fail(400, "Enter a valid South African mobile number.");
    if (!/^\d{2}:\d{2}$/.test(time)) return fail(400, "Choose a pickup time.");
    const total = Number(body.total);
    const day = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
    const ref = "J-" + crypto.randomBytes(2).toString("hex").toUpperCase();
    await store.createEntity("orders", {
      partitionKey: day, rowKey: ref, userEmail: claims.sub, name, phone, pickupTime: time,
      items: JSON.stringify(items), total: Number.isFinite(total) && total > 0 && total < 100000 ? total : 0,
      status: "new", createdAt: new Date().toISOString(),
    });
    return { status: 201, body: { ref } };
  },
};

async function run(name, input) {
  try { return await handlers[name](input); }
  catch (e) {
    if (e.code === "NOT_CONFIGURED") return fail(503, "The database isn't connected yet. Add STORAGE_CONNECTION and AUTH_SECRET in the Static Web App's environment variables.", { setup: true });
    console.error(name, e);
    return fail(500, "Something went wrong on our side. Please try again.", { code: (String(e.code || e.statusCode || e.name || "unknown") + ": " + String(e.message || "").replace(/AccountKey=[^;\s]*/gi, "AccountKey=***").replace(/\s+/g, " ")).slice(0, 140) });
  }
}
module.exports = { run };
