/* Take it Online: language toggle, phone demo, scroll motion, enquiry form. No dependencies. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var WA_NUMBER = "919431505948";
  var WA_TEXT = {
    en: "Hi Ravi, I found Take it Online. I'd like to take my business online.",
    hi: "नमस्ते रवि जी, मैंने Take it Online देखा। मुझे अपना बिज़नेस ऑनलाइन लाना है।"
  };
  var TITLE = {
    en: "Take it Online · Get your local business online | Mumbai & Jamshedpur",
    hi: "Take it Online · अपने बिज़नेस को ऑनलाइन लाएँ | मुंबई और जमशेदपुर"
  };
  var MSG = {
    missing: { en: "Please add your name and phone number.", hi: "कृपया अपना नाम और फ़ोन नंबर लिखें।" },
    sending: { en: "Sending…", hi: "भेज रहे हैं…" },
    ok: { en: "Got it. I'll call you soon.", hi: "मिल गया। मैं जल्द ही कॉल करूँगा।" },
    err: { en: "That didn't go through. Please message me on WhatsApp instead.", hi: "मैसेज नहीं गया। कृपया WhatsApp पर मैसेज करें।" },
    wa: { en: "Opening WhatsApp with your details filled in.", hi: "आपकी जानकारी के साथ WhatsApp खुल रहा है।" }
  };

  function lang() { return doc.getAttribute("data-lang") === "hi" ? "hi" : "en"; }
  function waLink(text) { return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }

  /* ---------- language ---------- */
  function applyLang(l) {
    doc.setAttribute("data-lang", l);
    doc.setAttribute("lang", l === "hi" ? "hi" : "en");
    document.title = TITLE[l];
    try { localStorage.setItem("tio-lang", l); } catch (e) {}
    $$("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === l ? "true" : "false"); });
    $$("[data-wa]").forEach(function (a) { a.href = waLink(WA_TEXT[l]); });
    $$("[data-ph-en]").forEach(function (el) { el.placeholder = el.getAttribute("data-ph-" + l); });
    $$("[data-aria-en]").forEach(function (el) { el.setAttribute("aria-label", el.getAttribute("data-aria-" + l)); });
  }
  $$("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-set-lang")); });
  });
  applyLang(lang());

  /* ---------- header + progress ---------- */
  var header = $(".header"), bar = $(".progress"), fab = $(".fab"), hero = $(".hero");
  var proc = $(".process"), procLine = proc && $(".line i", proc);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    if (fab && hero) fab.classList.toggle("show", y > hero.offsetHeight * 0.7);
    if (procLine) {
      var r = proc.getBoundingClientRect();
      var p = (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.2);
      procLine.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- reveal + count-up ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    if (reduce) { el.textContent = end; return; }
    var t0 = null;
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(function (c) { if (!c._done) { c._done = true; countUp(c); } });
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  $$(".reveal, .step").forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });

  /* ---------- phone demo ---------- */
  var phone = $("[data-phone]");
  if (phone) {
    var screens = $$(".scr", phone);
    var pills = $$(".steps-pills button");
    var typed = $("[data-typed]", phone);
    var query = typed ? typed.getAttribute("data-typed") : "";
    var DUR = 3800, idx = 0, timer = null, visible = true;

    function typeQuery() {
      if (!typed) return;
      if (reduce) { typed.textContent = query; return; }
      typed.textContent = "";
      var k = 0;
      (function t() {
        typed.textContent = query.slice(0, ++k);
        if (k < query.length) setTimeout(t, 55);
      })();
    }
    function show(i) {
      idx = (i + screens.length) % screens.length;
      screens.forEach(function (s, j) { s.classList.toggle("on", j === idx); });
      pills.forEach(function (p, j) {
        p.setAttribute("aria-selected", j === idx ? "true" : "false");
        p.style.setProperty("--dur", (DUR / 1000) + "s");
        if (j === idx) { p.style.animation = "none"; void p.offsetWidth; p.style.animation = ""; }
      });
      if (idx === 0) typeQuery();
    }
    function schedule() {
      clearTimeout(timer);
      if (reduce || !visible) return;
      timer = setTimeout(function () { show(idx + 1); schedule(); }, DUR);
    }
    pills.forEach(function (p, j) { p.addEventListener("click", function () { show(j); schedule(); }); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; schedule(); }).observe(phone);
    }
    show(0); schedule();
  }

  /* ---------- AI change log: rows light up in order, then replay ---------- */
  var log = $("[data-changelog]");
  if (log) {
    var rows = $$("li", log), k = 0, logTimer = null, logVisible = false;
    function tickLog() {
      clearTimeout(logTimer);
      if (!logVisible) return;
      if (k < rows.length) { rows[k].classList.add("on"); k++; logTimer = setTimeout(tickLog, 850); }
      else { logTimer = setTimeout(function () { rows.forEach(function (r) { r.classList.remove("on"); }); k = 0; logTimer = setTimeout(tickLog, 600); }, 3200); }
    }
    if (reduce || !("IntersectionObserver" in window)) rows.forEach(function (r) { r.classList.add("on"); });
    else new IntersectionObserver(function (en) { logVisible = en[0].isIntersecting; if (logVisible) tickLog(); else clearTimeout(logTimer); }, { threshold: 0.35 }).observe(log);
  }

  /* ---------- FSB screenshot swap (home ↔ packages) ---------- */
  var swap = $("[data-shot-swap]");
  if (swap && !reduce) setInterval(function () { swap.classList.toggle("flip"); }, 4200);

  /* ---------- enquiry form ---------- */
  var form = $("form[data-enquiry]");
  if (form) {
    var note = $(".form-note", form);
    var say = function (key, cls) { note.className = "form-note " + (cls || ""); note.textContent = MSG[key][lang()]; };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("bot-field")) return;
      var name = (fd.get("name") || "").toString().trim();
      var phone = (fd.get("phone") || "").toString().trim();
      var biz = (fd.get("business") || "").toString().trim();
      var needs = fd.getAll("needs").join(", ");
      if (!name || phone.replace(/\D/g, "").length < 10) { say("missing", "err"); return; }
      var onNetlify = /ravikumarsingh\.co\.in$|netlify\.app$/.test(location.hostname);
      if (!onNetlify) {
        var text = WA_TEXT[lang()] + "\n\n" + name + " · " + phone + (biz ? "\n" + biz : "") + (needs ? "\n" + needs : "");
        window.open(waLink(text), "_blank", "noopener");
        say("wa", "ok");
        return;
      }
      say("sending");
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fd).toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); say("ok", "ok"); })
        .catch(function () { say("err", "err"); });
    });
  }

  if (reduce) $$("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  onScroll();
})();
