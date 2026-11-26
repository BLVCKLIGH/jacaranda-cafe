const { app } = require("@azure/functions");
const { run } = require("../lib/handlers");

const route = (name, method = "POST") => app.http(name, {
  methods: [method], authLevel: "anonymous", route: name,
  handler: async request => {
    let body = {};
    if (method === "POST") { try { body = await request.json(); } catch { /* empty body */ } }
    const res = await run(name, { body, token: request.headers.get("x-session-token") });
    return { status: res.status, jsonBody: res.body, headers: { "Cache-Control": "no-store" } };
  },
});

route("register");
route("login");
route("reservation");
route("me", "GET");
