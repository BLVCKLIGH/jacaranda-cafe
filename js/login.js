/* Login / sign-up page */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

/* Only allow redirects to pages on this site */
function nextUrl() {
  const n = new URLSearchParams(location.search).get("next") || "";
  return /^[\w\-./]+(\?[\w=&%-]*)?(#[\w-]*)?$/.test(n) && !n.startsWith("//") && !n.includes("..") ? n : "index.html";
}

document.addEventListener("error", e => {
  const i = e.target;
  if (i.tagName !== "IMG" || !i.dataset.fallback) return;
  const list = i.dataset.fallback.split("|"), n = Number(i.dataset.n || 0);
  if (n < list.length) { i.dataset.n = n + 1; i.src = list[n]; }   // try the next source
}, true);

document.addEventListener("DOMContentLoaded", () => {
  /* Photo */
  { const h = $("#auth-img"); h.dataset.fallback = photoFallbacks("hero", 1000, 1200); if (h.complete && !h.naturalWidth) h.dispatchEvent(new Event("error")); }

  /* Theme */
  const themeBtn = $("#theme-btn");
  const paint = () => { const d = document.documentElement.dataset.theme === "dark"; themeBtn.innerHTML = d ? SUN : MOON; themeBtn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); };
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("jacaranda:theme", JSON.stringify(next)); } catch { /* ignore */ }
    paint();
  });
  paint();

  /* Already signed in? */
  const session = Auth.get();
  if (session) {
    $("#forms").hidden = true; $("#signed-in").hidden = false;
    $("#who").textContent = session.user.name + " (" + session.user.email + ")";
    $("#signout").addEventListener("click", () => { Auth.clear(); location.reload(); });
    return;
  }

  /* Tabs */
  const tabs = { in: $("#tab-in"), up: $("#tab-up") }, forms = { in: $("#form-in"), up: $("#form-up") };
  function show(which) {
    for (const k of ["in", "up"]) { tabs[k].setAttribute("aria-selected", k === which); forms[k].hidden = k !== which; }
    $("#auth-title").textContent = which === "in" ? "Welcome back" : "Join Jacaranda";
    $("#auth-sub").textContent = which === "in" ? "Sign in to book tables faster and keep your details on file." : "Create an account in under a minute.";
    showAlert("");
    history.replaceState(null, "", which === "up" ? "#signup" : location.pathname + location.search);
    forms[which].querySelector("input").focus();
  }
  tabs.in.addEventListener("click", () => show("in"));
  tabs.up.addEventListener("click", () => show("up"));

  /* Show / hide password */
  $$(".pass-toggle").forEach(b => b.addEventListener("click", () => {
    const input = document.getElementById(b.dataset.for), reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    b.textContent = reveal ? "Hide" : "Show"; b.setAttribute("aria-pressed", reveal); b.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
  }));

  /* Validation */
  const setError = (input, msg) => {
    const f = input.closest(".field");
    f.classList.toggle("invalid", !!msg); f.querySelector(".error").textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };
  const showAlert = (msg, kind = "bad") => { const a = $("#alert"); a.hidden = !msg; a.textContent = msg; a.dataset.kind = kind; };
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rules = {
    "in-email": v => EMAIL.test(v.trim()) ? "" : "Enter your email address.",
    "in-pass": v => v ? "" : "Enter your password.",
    "up-name": v => v.trim().length >= 2 ? "" : "Enter your name.",
    "up-email": v => EMAIL.test(v.trim()) ? "" : "Enter an email address like name@example.com.",
    "up-pass": v => v.length >= 8 ? "" : "That password is too short.",
    "up-pass2": v => v === $("#up-pass").value ? "" : "The passwords don't match.",
  };
  for (const [id, rule] of Object.entries(rules)) {
    const el = document.getElementById(id);
    el.addEventListener("blur", () => { if (el.value) setError(el, rule(el.value)); });
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") setError(el, rule(el.value)); });
  }

  /* Submit */
  async function submit(form, ids, path, payload, remember) {
    showAlert("");
    const ok = ids.map(id => setError(document.getElementById(id), rules[id](document.getElementById(id).value)));
    if (ok.includes(false)) { form.querySelector('[aria-invalid="true"]').focus(); return; }
    const btn = form.querySelector('button[type="submit"]'), label = btn.textContent;
    btn.disabled = true; btn.textContent = "Please wait…";
    const r = await Auth.call(path, payload());
    btn.disabled = false; btn.textContent = label;
    if (!r.ok) {
      const msg = r.status === 404
        ? "The sign-in service isn't set up on this site yet. Deploy the /api folder and connect the database (see README)."
        : r.data.error || "Something went wrong. Please try again.";
      if (r.data.field) { const el = form.querySelector(`[id$="-${r.data.field === "password" ? "pass" : r.data.field}"]`); if (el) { setError(el, r.data.error); el.focus(); return; } }
      showAlert(msg); return;
    }
    Auth.save(r.data, remember());
    showAlert("Signed in. Taking you to the café…", "good");
    setTimeout(() => location.assign(nextUrl()), 500);
  }
  forms.in.addEventListener("submit", e => { e.preventDefault(); submit(forms.in, ["in-email", "in-pass"], "login", () => ({ email: $("#in-email").value, password: $("#in-pass").value }), () => $("#in-remember").checked); });
  forms.up.addEventListener("submit", e => { e.preventDefault(); submit(forms.up, ["up-name", "up-email", "up-pass", "up-pass2"], "register", () => ({ name: $("#up-name").value, email: $("#up-email").value, password: $("#up-pass").value }), () => true); });

  if (location.hash === "#signup") show("up");   // after all handlers exist
});
