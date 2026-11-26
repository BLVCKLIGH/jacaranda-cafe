process.env.LOCAL_MEMORY = "1";
const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src/lib/handlers");

const good = { name: "Thandi Nkosi", email: "Thandi@Example.com", password: "correct horse" };

test("register then login then me", async () => {
  const r = await run("register", { body: good });
  assert.equal(r.status, 201); assert.ok(r.body.token);
  assert.equal(r.body.user.email, "thandi@example.com");
  const l = await run("login", { body: { email: "THANDI@example.com", password: good.password } });
  assert.equal(l.status, 200);
  const me = await run("me", { token: l.body.token });
  assert.equal(me.status, 200); assert.equal(me.body.user.name, "Thandi Nkosi");
});
test("duplicate email is rejected", async () => {
  assert.equal((await run("register", { body: good })).status, 409);
});
test("validation", async () => {
  assert.equal((await run("register", { body: { ...good, email: "nope" } })).status, 400);
  assert.equal((await run("register", { body: { ...good, email: "a@b.co", password: "short" } })).status, 400);
  assert.equal((await run("register", { body: { ...good, email: "a@b.co", name: "" } })).status, 400);
});
test("wrong password and unknown email give the same message", async () => {
  const a = await run("login", { body: { email: good.email, password: "wrong-password" } });
  const b = await run("login", { body: { email: "ghost@example.com", password: "wrong-password" } });
  assert.equal(a.status, 401); assert.equal(b.status, 401); assert.equal(a.body.error, b.body.error);
});
test("account locks after 5 wrong passwords", async () => {
  await run("register", { body: { name: "Locky", email: "lock@example.com", password: "right-password" } });
  for (let i = 0; i < 5; i++) await run("login", { body: { email: "lock@example.com", password: "bad-password" } });
  const l = await run("login", { body: { email: "lock@example.com", password: "right-password" } });
  assert.equal(l.status, 429);
});
test("tampered or missing token is rejected", async () => {
  const r = await run("login", { body: { email: good.email, password: good.password } });
  assert.equal((await run("me", { token: r.body.token + "x" })).status, 401);
  assert.equal((await run("me", { token: "" })).status, 401);
});
test("reservation saves and links to account", async () => {
  const l = await run("login", { body: { email: good.email, password: good.password } });
  const body = { name: "Thandi", phone: "082 123 4567", email: "t@example.com", date: "2026-12-01", time: "09:00", guests: 2, seat: "Terrace", note: "" };
  const r = await run("reservation", { body, token: l.body.token });
  assert.equal(r.status, 201); assert.match(r.body.ref, /^T-[0-9A-F]{6}$/);
  assert.equal((await run("reservation", { body: { ...body, phone: "123" } })).status, 400);
});
test("without a database it explains what to set up", async () => {
  delete process.env.LOCAL_MEMORY;
  const r = await run("login", { body: { email: "a@b.co", password: "whatever1" } });
  assert.equal(r.status, 503); assert.equal(r.body.setup, true);
  process.env.LOCAL_MEMORY = "1";
});
