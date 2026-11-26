/* Jacaranda Café: menu, pickup orders, gallery, reviews, reservations. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const R = n => "R" + Number(n).toLocaleString("en-ZA").replace(/,/g, " ");
const store = {
  get(k, d) { try { const v = localStorage.getItem("jacaranda:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("jacaranda:" + k, JSON.stringify(v)); } catch { /* unavailable */ } },
};
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2600);
}

/* Time in Johannesburg, whatever the visitor's timezone */
function joburgNow() {
  const parts = new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: Number(get("hour")) * 60 + Number(get("minute")), iso: `${get("year")}-${get("month")}-${get("day")}` };
}
// Opening hours in minutes per weekday (0 = Sunday)
const OPEN = { 0: [480, 840], 1: [390, 960], 2: [390, 960], 3: [390, 960], 4: [390, 960], 5: [390, 960], 6: [420, 960] };
const hhmm = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

/* If a photo fails to load, swap in the illustration named in data-fallback */
document.addEventListener("error", e => {
  const i = e.target;
  if (i.tagName === "IMG" && i.dataset.fallback && !i.src.endsWith(i.dataset.fallback)) i.src = i.dataset.fallback;
}, true);

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  if (typeof photo === "function") $("#hero-img").src = photo("hero", 900);

  /* Account button: sign in link, or initial + menu when signed in */
  const session = Auth.get(), acctBtn = $("#account-btn"), acctMenu = $("#account-menu");
  if (session) {
    acctBtn.textContent = session.user.name.trim()[0].toUpperCase();
    acctBtn.classList.add("on");
    acctBtn.setAttribute("aria-label", "Account: " + session.user.name);
    acctBtn.setAttribute("aria-expanded", "false");
    acctBtn.removeAttribute("href"); acctBtn.setAttribute("role", "button"); acctBtn.tabIndex = 0;
    $("#account-name").textContent = session.user.name;
    const toggle = () => { acctMenu.hidden = !acctMenu.hidden; acctBtn.setAttribute("aria-expanded", String(!acctMenu.hidden)); };
    acctBtn.addEventListener("click", toggle);
    acctBtn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    document.addEventListener("click", e => { if (!e.target.closest("#account")) { acctMenu.hidden = true; acctBtn.setAttribute("aria-expanded", "false"); } });
    $("#signout-btn").addEventListener("click", () => { Auth.clear(); location.reload(); });
    Auth.call("me").then(r => { if (r.status === 401) { Auth.clear(); location.reload(); } });   // token expired or account removed
  } else {
    acctBtn.href = "login.html";
  }

  /* Theme */
  const themeBtn = $("#theme-btn");
  const paintTheme = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    themeBtn.innerHTML = dark ? SUN : MOON;
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next; store.set("theme", next); paintTheme();
  });
  paintTheme();

  /* Mobile nav */
  $("#menu-btn").addEventListener("click", e => {
    const open = $("#nav-links").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
  $$("#nav-links a").forEach(a => a.addEventListener("click", () => { $("#nav-links").classList.remove("open"); $("#menu-btn").setAttribute("aria-expanded", "false"); }));

  // Highlight the section in view
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) $$("#nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["menu", "about", "gallery", "reviews", "visit"].forEach(id => io.observe(document.getElementById(id)));

  /* Open now */
  const now = joburgNow(), [o, c] = OPEN[now.day];
  const isOpen = now.mins >= o && now.mins < c;
  const openEl = $("#open-now");
  openEl.classList.toggle("closed", !isOpen);
  const tomorrow = OPEN[(now.day + 1) % 7][0];
  openEl.lastElementChild.textContent = isOpen ? `Open now, until ${hhmm(c)}` : now.mins < o ? `Closed. Opens today at ${hhmm(o)}` : `Closed. Opens tomorrow at ${hhmm(tomorrow)}`;

  /* One shower of petals on load */
  const petals = $("#petals");
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.left = (Math.random() * 100) + "%";
    p.style.animationDelay = (Math.random() * 1.8) + "s";
    p.style.animationDuration = (3.5 + Math.random() * 2) + "s";
    petals.appendChild(p);
  }

  /* Hours table */
  const todayRow = now.day === 0 ? 2 : now.day === 6 ? 1 : 0;
  $("#hours").innerHTML = HOURS.map(([d, h], i) => `<tr${i === todayRow ? ' class="today"' : ""}><td>${d}${i === todayRow ? " (today)" : ""}</td><td>${h}</td></tr>`).join("");

  /* Menu */
  const tabs = ["All", ...MENU_CATS];
  let activeCat = "All";
  $("#tabs").innerHTML = tabs.map(t => `<button class="tab" role="tab" type="button" aria-selected="${t === activeCat}" data-cat="${t}">${t}</button>`).join("");
  function renderMenu() {
    const items = activeCat === "All" ? MENU : MENU.filter(m => m.cat === activeCat);
    $("#menu-list").innerHTML = items.map(m => `
      <article class="dish">
        <img src="${m.img}" data-fallback="${m.fallback}" alt="${esc(m.name)}" loading="lazy" width="112" height="112">
        <div>
          <div class="dish-top"><h3>${esc(m.name)}</h3><span class="leader" aria-hidden="true"></span><span class="cost">${R(m.price)}</span></div>
          <p>${esc(m.desc)}</p>
          <div class="dish-foot">
            <div class="tags">${(m.tags || []).map(t => `<span class="tag ${t}">${t}</span>`).join("")}</div>
            <button class="add-btn" type="button" data-add="${m.id}" aria-label="Add ${esc(m.name)} to your order">Add</button>
          </div>
        </div>
      </article>`).join("");
  }
  $("#tabs").addEventListener("click", e => {
    const b = e.target.closest(".tab"); if (!b) return;
    activeCat = b.dataset.cat;
    $$(".tab").forEach(t => t.setAttribute("aria-selected", t === b));
    renderMenu();
  });
  $("#tabs").addEventListener("keydown", e => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const list = $$(".tab"), i = list.indexOf(document.activeElement);
    const n = list[(i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length];
    n.focus(); n.click();
  });
  renderMenu();

  /* Cart */
  let cart = store.get("cart", {});
  const drawer = $("#cart"), bg = $("#drawer-bg");
  const openCart = () => { drawer.classList.add("open"); bg.classList.add("show"); drawer.setAttribute("aria-hidden", "false"); $("#cart-close").focus(); };
  const closeCart = () => { drawer.classList.remove("open"); bg.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); };
  $("#cart-btn").addEventListener("click", openCart);
  $("#footer-cart").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  bg.addEventListener("click", closeCart);

  function pickupSlots() {
    const n = joburgNow(), [op, cl] = OPEN[n.day];
    const slots = [];
    let start = Math.max(op, Math.ceil((n.mins + 20) / 15) * 15);
    for (let m = start; m <= cl - 15; m += 15) slots.push(m);
    return slots;
  }

  function renderCart() {
    const ids = Object.keys(cart).filter(id => cart[id] > 0);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const total = ids.reduce((s, id) => s + MENU.find(m => m.id === id).price * cart[id], 0);
    $("#cart-count").hidden = !count; $("#cart-count").textContent = count;
    store.set("cart", cart);
    if (!ids.length) {
      $("#cart-body").innerHTML = `<div style="text-align:center;padding:3rem 0"><h3>Your order is empty</h3><p class="muted" style="margin-inline:auto">Add something from the menu and collect it at the counter.</p><a class="btn btn-outline" href="#menu" id="to-menu">Browse the menu</a></div>`;
      $("#cart-foot").innerHTML = "";
      $("#to-menu").addEventListener("click", closeCart);
      return;
    }
    $("#cart-body").innerHTML = ids.map(id => {
      const m = MENU.find(x => x.id === id);
      return `<div class="line-item"><img src="${m.img}" data-fallback="${m.fallback}" alt=""><div><strong>${esc(m.name)}</strong>
        <div class="qty"><button type="button" data-dec="${id}" aria-label="Remove one ${esc(m.name)}">−</button><span>${cart[id]}</span><button type="button" data-inc="${id}" aria-label="Add one ${esc(m.name)}">+</button></div></div>
        <span>${R(m.price * cart[id])}</span></div>`;
    }).join("");
    const slots = pickupSlots();
    $("#cart-foot").innerHTML = `
      <div class="subtotal"><span>Total</span><span>${R(total)}</span></div>
      ${slots.length ? `<form id="order-form" novalidate>
        <div class="field"><label for="o-time">Pickup time today</label><select id="o-time">${slots.map(s => `<option>${hhmm(s)}</option>`).join("")}</select></div>
        <div class="row-2">
          <div class="field"><label for="o-name">Name</label><input id="o-name" autocomplete="name"><span class="error"></span></div>
          <div class="field"><label for="o-phone">Mobile</label><input id="o-phone" type="tel" autocomplete="tel"><span class="error"></span></div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Place order, pay at pickup</button>
      </form>` : `<p class="muted">We're closed for pickup orders now. Ordering opens again at ${hhmm(OPEN[(joburgNow().day + 1) % 7][0])}.</p>`}`;
    const f = $("#order-form");
    if (f) f.addEventListener("submit", e => {
      e.preventDefault();
      const nm = $("#o-name"), ph = $("#o-phone");
      const ok = [setError(nm, nm.value.trim().length >= 2 ? "" : "Enter your name."), setError(ph, saPhone(ph.value) ? "" : "Enter a valid mobile number.")];
      if (ok.includes(false)) return;
      const ref = "J" + Math.floor(100 + Math.random() * 900);
      const orders = store.get("orders", []);
      orders.unshift({ ref, items: { ...cart }, total, time: $("#o-time").value, name: nm.value.trim(), placed: new Date().toISOString() });
      store.set("orders", orders);
      const time = $("#o-time").value;
      cart = {}; renderCart();
      $("#cart-body").innerHTML = `<div class="confirm"><p class="big">Order ${ref}</p><p style="margin-inline:auto">Thanks, ${esc(nm.value.trim().split(" ")[0])}. Your order will be ready at <strong>${time}</strong>. Give your order number at the counter and pay by card or SnapScan.</p></div>`;
    });
  }
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]"), inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (add) { const id = add.dataset.add; cart[id] = (cart[id] || 0) + 1; renderCart(); toast(`${MENU.find(m => m.id === id).name} added to your order`); }
    if (inc) { cart[inc.dataset.inc]++; renderCart(); }
    if (dec) { cart[dec.dataset.dec]--; if (cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec]; renderCart(); }
  });
  renderCart();

  /* Gallery + lightbox */
  $("#gallery-grid").innerHTML = GALLERY.map((g, i) => `<button type="button" data-i="${i}" aria-label="Open photo: ${esc(g.caption)}"><img src="${g.src}" data-fallback="${g.fallback}" alt="${esc(g.alt)}" loading="lazy"><figcaption>${esc(g.caption)}</figcaption></button>`).join("");
  let lbIndex = 0, lastFocus = null;
  const lb = $("#lightbox");
  const showLb = i => { lbIndex = (i + GALLERY.length) % GALLERY.length; const g = GALLERY[lbIndex]; $("#lb-img").dataset.fallback = g.fallback; $("#lb-img").src = g.full || g.src; $("#lb-img").alt = g.alt; $("#lb-cap").textContent = g.caption; };
  $("#gallery-grid").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; lastFocus = b; showLb(Number(b.dataset.i)); lb.classList.add("open"); $("#lb-close").focus(); });
  const closeLb = () => { lb.classList.remove("open"); if (lastFocus) lastFocus.focus(); };
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb-prev").addEventListener("click", () => showLb(lbIndex - 1));
  $("#lb-next").addEventListener("click", () => showLb(lbIndex + 1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    } else if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
  });

  /* Reviews carousel */
  const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
  $("#score").textContent = avg.toFixed(1).replace(".", ",") + " / 5";
  $("#score-note").textContent = `Average of ${REVIEWS.length} recent reviews on Google.`;
  $("#track").innerHTML = REVIEWS.map((r, i) => `<div class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${REVIEWS.length}"><blockquote>“${esc(r.text)}”</blockquote><div class="who"><span>${esc(r.name)}, ${r.when}</span><span class="stars" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span></div></div>`).join("");
  $("#dots").innerHTML = REVIEWS.map((_, i) => `<button type="button" aria-label="Show review ${i + 1}" data-dot="${i}"></button>`).join("");
  let slide = 0;
  const go = i => { slide = (i + REVIEWS.length) % REVIEWS.length; $("#track").style.transform = `translateX(-${slide * 100}%)`; $$("#dots button").forEach((d, j) => d.setAttribute("aria-current", j === slide)); };
  $("#prev").addEventListener("click", () => go(slide - 1));
  $("#next").addEventListener("click", () => go(slide + 1));
  $("#dots").addEventListener("click", e => { if (e.target.dataset.dot) go(Number(e.target.dataset.dot)); });
  let touchX = null;
  $(".slides").addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  $(".slides").addEventListener("touchend", e => { if (touchX === null) return; const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 40) go(slide + (dx < 0 ? 1 : -1)); touchX = null; });
  go(0);

  /* Reservation */
  const date = $("#r-date"), time = $("#r-time");
  date.min = now.iso;
  const max = new Date(now.iso + "T00:00:00"); max.setDate(max.getDate() + 60);
  date.max = `${max.getFullYear()}-${String(max.getMonth() + 1).padStart(2, "0")}-${String(max.getDate()).padStart(2, "0")}`;
  date.value = now.iso;
  $("#r-guests").innerHTML = Array.from({ length: 8 }, (_, i) => `<option value="${i + 1}"${i === 1 ? " selected" : ""}>${i + 1} ${i ? "people" : "person"}</option>`).join("");

  function fillTimes() {
    if (!date.value) { time.innerHTML = `<option value="">Pick a date first</option>`; return; }
    const day = new Date(date.value + "T00:00:00").getDay();
    const [op, cl] = OPEN[day];
    const isToday = date.value === joburgNow().iso;
    const earliest = isToday ? Math.max(op, Math.ceil((joburgNow().mins + 30) / 30) * 30) : op;
    const slots = [];
    for (let m = Math.ceil(earliest / 30) * 30; m <= cl - 60; m += 30) slots.push(m); // last seating an hour before close
    const prev = time.value;
    time.innerHTML = slots.length ? slots.map(s => `<option value="${hhmm(s)}">${hhmm(s)}</option>`).join("") : `<option value="">No times left today</option>`;
    if (slots.map(hhmm).includes(prev)) time.value = prev;
  }
  date.addEventListener("change", fillTimes);
  fillTimes();
  if (!time.value) { // nothing left today, so start on tomorrow
    const t = new Date(now.iso + "T00:00:00"); t.setDate(t.getDate() + 1);
    date.value = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    fillTimes();
  }
  if (session) { $("#r-name").value = session.user.name; $("#r-email").value = session.user.email; }
  $("#r-msg").addEventListener("input", e => { $("#msg-count").textContent = `${e.target.value.length} / 300`; });

  function setError(input, msg) {
    const f = input.closest(".field");
    f.classList.toggle("invalid", !!msg);
    f.querySelector(".error").textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function saPhone(v) { return /^(\+27|0)[1-8]\d{8}$/.test(v.replace(/[\s()-]/g, "")); }
  const checks = {
    "r-name": v => v.trim().length >= 2 ? "" : "Enter the name for the booking.",
    "r-phone": v => !v.trim() ? "Enter a mobile number so we can reach you." : saPhone(v) ? "" : "Enter a South African number, e.g. 082 123 4567.",
    "r-email": v => !v.trim() ? "Enter your email address." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@example.com.",
    "r-date": v => !v ? "Choose a date." : v < joburgNow().iso ? "Choose today or a later date." : v > date.max ? "We take bookings up to 60 days ahead." : "",
    "r-time": v => v ? "" : "No times are left on this day. Choose another date.",
  };
  Object.keys(checks).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("blur", () => { if (el.value) setError(el, checks[id](el.value)); });
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") setError(el, checks[id](el.value)); });
  });

  $("#reserve-form").addEventListener("submit", async e => {
    e.preventDefault();
    fillTimes();
    const ok = Object.keys(checks).map(id => setError(document.getElementById(id), checks[id](document.getElementById(id).value)));
    if (ok.includes(false)) { $('[aria-invalid="true"]').focus(); return; }
    const b = {
      ref: "T-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      name: $("#r-name").value.trim(), phone: $("#r-phone").value.trim(), email: $("#r-email").value.trim(),
      date: date.value, time: time.value, guests: Number($("#r-guests").value), seat: $('input[name="seat"]:checked').value, note: $("#r-msg").value.trim(),
    };
    const submitBtn = $('#reserve-form button[type="submit"]');
    submitBtn.disabled = true; submitBtn.textContent = "Sending…";
    const saved = await Auth.call("reservation", { ...b, guests: b.guests });   // saved in Azure Table Storage
    if (saved.ok) b.ref = saved.data.ref;
    store.set("reservations", [b, ...store.get("reservations", [])]);
    const nice = new Date(b.date + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });
    $("#reserve-card").innerHTML = `<div class="confirm" tabindex="-1" id="confirm-box">
      <p class="big">Table requested</p>
      <p style="margin-inline:auto">${esc(b.name.split(" ")[0])}, we've received your booking for <strong>${b.guests} ${b.guests === 1 ? "person" : "people"}</strong> on <strong>${nice} at ${b.time}</strong> (${b.seat === "Either" ? "any table" : b.seat.toLowerCase()}).</p>
      ${saved.ok
        ? `<p style="margin-inline:auto">Your reference is <strong>${b.ref}</strong>. We'll confirm by SMS to ${esc(b.phone)} within two hours.</p>`
        : `<p style="margin-inline:auto"><strong>We couldn't send this to our booking system</strong>, so please call us on <a href="tel:+27110000001">011 000 0001</a> to confirm. Your reference is ${b.ref}.</p>`}
      <button class="btn btn-outline" type="button" id="another">Make another booking</button></div>`;
    $("#confirm-box").focus();
    $("#another").addEventListener("click", () => location.reload());
  });
});
