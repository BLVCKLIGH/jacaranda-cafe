/* Shared sign-in helpers. The token is kept in localStorage ("remember me") or sessionStorage. */
const Auth = (() => {
  const KEY = "jacaranda:session";
  const read = s => { try { return JSON.parse(s.getItem(KEY)); } catch { return null; } };
  const get = () => read(localStorage) || read(sessionStorage);
  return {
    get,
    save(data, remember) {
      this.clear();
      try { (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify({ token: data.token, user: data.user })); } catch { /* storage blocked */ }
    },
    clear() { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
    /* Calls /api/<path>. Always resolves to { ok, status, data }; never throws. */
    async call(path, body) {
      const s = get();
      try {
        const res = await fetch("/api/" + path, {
          method: body ? "POST" : "GET",
          headers: { "Content-Type": "application/json", ...(s ? { "X-Session-Token": s.token } : {}) },
          body: body ? JSON.stringify(body) : undefined,
        });
        let data = {};
        try { data = await res.json(); } catch { /* non-JSON (e.g. 404 page) */ }
        return { ok: res.ok, status: res.status, data };
      } catch {
        return { ok: false, status: 0, data: { error: "Can't reach the server. Check your connection and try again." } };
      }
    },
  };
})();
