/* ravikumarsingh.co.in: all interaction, no dependencies. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  doc.classList.remove("no-js");

  /* ---------- toast ---------- */
  var toastEl = $(".toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function copy(text, msg) {
    var done = function () { toast(msg || "Copied"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e) {}
    body.removeChild(t);
  }
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      copy(b.getAttribute("data-copy"), b.getAttribute("data-copy-msg"));
    });
  });

  /* ---------- theme ---------- */
  function setTheme(t) {
    doc.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
  }
  function toggleTheme(ev) {
    var next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (!document.startViewTransition || reduce) { setTheme(next); return; }
    var x = ev && ev.clientX != null ? ev.clientX : innerWidth - 40;
    var y = ev && ev.clientY != null ? ev.clientY : 32;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(function () { setTheme(next); });
    vt.ready.then(function () {
      doc.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
        { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(function () {});
  }
  $$("[data-theme-toggle]").forEach(function (b) { b.addEventListener("click", toggleTheme); });

  /* ---------- header + scroll progress ---------- */
  var header = $(".site-header");
  var bar = $(".progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - innerHeight;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    timelineProgress();
    readMeter();
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- reveal + count-up ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    var fmt = function (v) {
      return v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add("in");
      $$("[data-count]", el).forEach(function (c) { if (!c._done) { c._done = true; countUp(c); } });
      if (el.hasAttribute("data-count") && !el._done) { el._done = true; countUp(el); }
      if (el._onReveal) el._onReveal();
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;

  $$(".reveal, .release, .metric, .funnel, [data-observe]").forEach(function (el) {
    if (io) io.observe(el); else el.classList.add("in");
  });

  /* ---------- hero: swapping word ---------- */
  $$(".swap").forEach(function (w) {
    var items = $$("span", w);
    if (items.length < 2 || reduce) { if (items[0]) items[0].classList.add("on"); return; }
    var i = 0;
    items[0].classList.add("on");
    setInterval(function () {
      var cur = items[i];
      i = (i + 1) % items.length;
      cur.classList.remove("on"); cur.classList.add("off");
      items[i].classList.remove("off"); items[i].classList.add("on");
      setTimeout(function () { cur.classList.remove("off"); }, 520);
    }, 2400);
  });

  /* ---------- hero: glow follows pointer ---------- */
  var hero = $(".hero, .cs-hero, .soon-hero");
  var glow = hero && $(".hero-glow:not(.two)", hero);
  if (hero && glow && !reduce && matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
      glow.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  /* ---------- hero: live console ---------- */
  var con = $("[data-console]");
  if (con) {
    var scripts = [
      [
        ["$ ", "whoami", "cmd"],
        ["", "Ravi Kumar Singh · MBA, NMIMS Mumbai (2025–27)", "val"],
        ["$ ", "status --looking-for", "cmd"],
        ["roles    ", "Product Manager · Forward Deployed Engineer", "acc"],
        ["from     ", "April 2027", "val"],
        ["where    ", "Hyderabad · Pune · anywhere in India", "val"],
        ["$ ", "tail -n 4 shipped.log", "cmd"],
        ["✓ ", "sAIge helpdesk bot · web, Teams, voice", "ok"],
        ["✓ ", "password-reset bot · Azure AD → Okta", "ok"],
        ["✓ ", "1,200+ Airflow DAGs · 10x faster", "ok"],
        ["✓ ", "campaign handbook · 16 teams, 3 weeks", "ok"]
      ],
      [
        ["$ ", "ls ~/integrations", "cmd"],
        ["", "servicenow  zendesk  salesforce  azure-ad  okta", "acc"],
        ["", "dialogflow  teams  nice-incontact  airflow  bigquery", "acc"],
        ["$ ", "head -n 3 how-i-work.md", "cmd"],
        ["01 ", "Ask before you build.", "val"],
        ["02 ", "Start from the person stuck on the call.", "val"],
        ["03 ", "Fit into their stack, not ours.", "val"],
        ["$ ", "git log --oneline career | head -n 3", "cmd"],
        ["v3.1 ", "Summer intern · Varahe Analytics", "acc"],
        ["v3.0 ", "MBA · NMIMS Mumbai", "acc"],
        ["v2.4 ", "Module Lead · TEKsystems", "acc"]
      ]
    ];
    var box = $(".console-body", con);
    var cls = { cmd: "c-cmd", val: "c-val", acc: "c-acc", ok: "c-ok" };
    var pre = { "$ ": "c-prompt", "✓ ": "c-ok" };
    var si = 0;
    function render(lines, full) {
      box.innerHTML = "";
      var li = 0;
      function nextLine() {
        if (li >= lines.length) {
          var c = document.createElement("div");
          c.className = "ln"; c.innerHTML = '<span class="c-prompt">$ </span><span class="caret"></span>';
          box.appendChild(c);
          if (!full) setTimeout(function () { si = (si + 1) % scripts.length; render(scripts[si]); }, 5200);
          return;
        }
        var L = lines[li++];
        var d = document.createElement("div");
        d.className = "ln";
        var p = document.createElement("span");
        p.className = pre[L[0]] || "c-key";
        p.textContent = L[0];
        var v = document.createElement("span");
        v.className = cls[L[2]] || "c-val";
        d.appendChild(p); d.appendChild(v);
        box.appendChild(d);
        if (full) { v.textContent = L[1]; nextLine(); return; }
        var isCmd = L[2] === "cmd";
        if (!isCmd) { v.textContent = L[1]; setTimeout(nextLine, 90); return; }
        var k = 0;
        (function type() {
          v.textContent = L[1].slice(0, ++k);
          if (k < L[1].length) setTimeout(type, 28 + Math.random() * 40);
          else setTimeout(nextLine, 260);
        })();
      }
      nextLine();
    }
    if (reduce) render(scripts[0], true);
    else setTimeout(function () { render(scripts[0]); }, 600);
  }

  /* ---------- pointer spotlight on cards ---------- */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    $$(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--x", e.clientX - r.left + "px");
        c.style.setProperty("--y", e.clientY - r.top + "px");
      });
    });
    $$(".cert").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(800px) rotateX(" + (-py * 6) + "deg) rotateY(" + (px * 8) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* ---------- timeline fill ---------- */
  var tl = $(".timeline");
  var tlFill = tl && $(".timeline-fill", tl);
  function timelineProgress() {
    if (!tl || !tlFill) return;
    var r = tl.getBoundingClientRect();
    var p = (innerHeight * 0.6 - r.top) / r.height;
    tlFill.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
  }

  /* ---------- nav: active section (home) ---------- */
  var navLinks = $$(".nav-links a[href^='#']");
  if (navLinks.length && io) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("active"); });
          map[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) secIO.observe(s); });
  }

  /* ---------- case study: toc + read meter ---------- */
  var toc = $(".toc");
  var article = $(".article");
  var meter = toc && $(".read-meter i", toc);
  function readMeter() {
    if (!article || !meter) return;
    var r = article.getBoundingClientRect();
    var p = (innerHeight * 0.5 - r.top) / r.height;
    meter.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
  }
  if (toc && io) {
    var tlinks = $$("a", toc);
    var tmap = {};
    tlinks.forEach(function (a) { tmap[a.getAttribute("href").slice(1)] = a; });
    var tIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && tmap[en.target.id]) {
          tlinks.forEach(function (a) { a.classList.remove("active"); });
          tmap[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(tmap).forEach(function (id) { var s = document.getElementById(id); if (s) tIO.observe(s); });
  }

  /* ---------- document viewer ---------- */
  var viewer = $("#viewer");
  if (viewer) {
    var vTitle = $("[data-viewer-title]", viewer);
    var vBody = $(".viewer-body", viewer);
    var vOpen = $("[data-viewer-open]", viewer);
    $$("[data-view]").forEach(function (t) {
      t.addEventListener("click", function (e) {
        var src = t.getAttribute("data-view");
        var title = t.getAttribute("data-title") || "Document";
        var isImg = /\.(png|jpe?g|webp|gif)$/i.test(src);
        // Phones render inline PDFs badly; open those in a new tab instead.
        if (!isImg && matchMedia("(max-width: 700px)").matches) return;
        e.preventDefault();
        vTitle.textContent = title;
        vOpen.href = src;
        vBody.innerHTML = "";
        if (isImg) {
          var im = new Image(); im.src = src; im.alt = title; vBody.appendChild(im);
        } else {
          var f = document.createElement("iframe"); f.src = src; f.title = title; vBody.appendChild(f);
        }
        viewer.showModal();
      });
    });
    viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });
    $$("[data-viewer-close]", viewer).forEach(function (b) { b.addEventListener("click", function () { viewer.close(); }); });
    viewer.addEventListener("close", function () { vBody.innerHTML = ""; });
  }

  /* ---------- command palette ---------- */
  var cmd = $("#cmdk");
  if (cmd) {
    var home = "/portfolio/";
    var onHome = body.hasAttribute("data-home");
    var sec = function (id) { return onHome ? "#" + id : home + "#" + id; };
    var items = [
      { g: "Pages", t: "Home", h: "/", go: home },
      { g: "Pages", t: "Selected work", h: "section", go: sec("work") },
      { g: "Pages", t: "Integration map", h: "section", go: sec("integrations") },
      { g: "Pages", t: "Experience (release notes)", h: "section", go: sec("experience") },
      { g: "Pages", t: "About and how I work", h: "section", go: sec("about") },
      { g: "Pages", t: "Education", h: "section", go: sec("education") },
      { g: "Pages", t: "Certificates and awards", h: "section", go: sec("certificates") },
      { g: "Pages", t: "Product notes", h: "page", go: "/portfolio/notes/" },
      { g: "Pages", t: "Photography", h: "soon", go: "/portfolio/photography/" },
      { g: "Case studies", t: "sAIge: one helpdesk bot on web, Teams and phone", h: "case", go: "/portfolio/work/saige.html" },
      { g: "Case studies", t: "Password-reset bot: Azure AD + ServiceNow to Okta + Zendesk", h: "case", go: "/portfolio/work/password-reset.html" },
      { g: "Case studies", t: "Campaign handbook for 16 teams", h: "case", go: "/portfolio/work/campaign-handbook.html" },
      { g: "Case studies", t: "Influencer shortlist: 1,463 to 273", h: "case", go: "/portfolio/work/influencer-shortlist.html" },
      { g: "Case studies", t: "Multi-agent video studio", h: "case", go: "/portfolio/work/video-studio.html" },
      { g: "Case studies", t: "1,200+ PowerShell jobs to Airflow", h: "case", go: "/portfolio/work/airflow-migration.html" },
      { g: "Actions", t: "Download resume (PDF)", h: "pdf", go: "/resume/Ravi_Kumar_Singh%20Resume.pdf", blank: true },
      { g: "Actions", t: "Download curriculum vitae (PDF)", h: "pdf", go: "/resume/Ravi_Kumar_Singh_CV.pdf", blank: true },
      { g: "Actions", t: "Copy email address", h: "copy", fn: function () { copy("rvkumarsingh14@gmail.com", "Email copied"); } },
      { g: "Actions", t: "Email me", h: "mail", go: "mailto:rvkumarsingh14@gmail.com" },
      { g: "Actions", t: "Call +91 94315 05948", h: "tel", go: "tel:+919431505948" },
      { g: "Actions", t: "Open LinkedIn", h: "↗", go: "https://www.linkedin.com/in/simplyrks/", blank: true },
      { g: "Actions", t: "Open GitHub", h: "↗", go: "https://github.com/simplyrks", blank: true },
      { g: "Actions", t: "Toggle dark mode", h: "theme", fn: function () { toggleTheme(); } },
      { g: "Actions", t: "Print this page", h: "print", fn: function () { window.print(); } }
    ];
    var input = $("input", cmd);
    var list = $(".cmdk-list", cmd);
    var sel = 0, shown = [];

    function draw() {
      var q = input.value.trim().toLowerCase();
      shown = items.filter(function (it) {
        if (!q) return true;
        var s = (it.t + " " + it.g).toLowerCase();
        return q.split(/\s+/).every(function (w) { return s.indexOf(w) > -1; });
      });
      if (sel >= shown.length) sel = 0;
      list.innerHTML = "";
      if (!shown.length) { list.innerHTML = '<li class="cmdk-empty">Nothing matches that.</li>'; return; }
      var g = null;
      shown.forEach(function (it, i) {
        if (it.g !== g) {
          g = it.g;
          var h = document.createElement("li"); h.className = "cmdk-group"; h.textContent = g; h.setAttribute("role", "presentation");
          list.appendChild(h);
        }
        var li = document.createElement("li");
        li.className = "cmdk-item"; li.setAttribute("role", "option"); li.id = "cmdk-" + i;
        li.setAttribute("aria-selected", i === sel ? "true" : "false");
        li.innerHTML = "<span></span><span class='hint'></span>";
        li.firstChild.textContent = it.t; li.lastChild.textContent = it.h;
        li.addEventListener("mousemove", function () { if (sel !== i) { sel = i; mark(); } });
        li.addEventListener("click", function () { run(it); });
        list.appendChild(li);
      });
      input.setAttribute("aria-activedescendant", "cmdk-" + sel);
    }
    function mark() {
      $$(".cmdk-item", list).forEach(function (el) {
        el.setAttribute("aria-selected", el.id === "cmdk-" + sel ? "true" : "false");
      });
      var cur = $("#cmdk-" + sel);
      if (cur) cur.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", "cmdk-" + sel);
    }
    function run(it) {
      cmd.close();
      if (it.fn) { it.fn(); return; }
      if (it.blank) { window.open(it.go, "_blank", "noopener"); return; }
      window.location.href = it.go;
    }
    function open() { input.value = ""; sel = 0; draw(); cmd.showModal(); input.focus(); }
    input.addEventListener("input", function () { sel = 0; draw(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); mark(); }
      else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); run(shown[sel]); }
    });
    cmd.addEventListener("click", function (e) { if (e.target === cmd) cmd.close(); });
    $$("[data-cmdk]").forEach(function (b) { b.addEventListener("click", open); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmd.open ? cmd.close() : open(); }
      else if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !cmd.open) { e.preventDefault(); open(); }
    });
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    $$("[data-mod]").forEach(function (k) { k.textContent = isMac ? "⌘K" : "Ctrl K"; });
  }

  /* ---------- contact form ---------- */
  var form = $("form[data-contact]");
  if (form) {
    var note = $(".form-note", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("bot-field")) return;
      var name = (fd.get("name") || "").toString().trim();
      var email = (fd.get("email") || "").toString().trim();
      var msg = (fd.get("message") || "").toString().trim();
      if (!name || !email || !msg) { note.className = "form-note err"; note.textContent = "Fill in all three fields and I'll get it."; return; }
      // Netlify handles the form on the custom domain. Anywhere else, fall back to email.
      var onNetlify = /ravikumarsingh\.co\.in$|netlify\.app$/.test(location.hostname);
      if (!onNetlify) {
        var sub = encodeURIComponent("Hello from " + name);
        var bod = encodeURIComponent(msg + "\n\n" + name + " · " + email);
        location.href = "mailto:rvkumarsingh14@gmail.com?subject=" + sub + "&body=" + bod;
        note.className = "form-note ok"; note.textContent = "Opening your email app with the message filled in.";
        return;
      }
      note.className = "form-note"; note.textContent = "Sending…";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fd).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        note.className = "form-note ok"; note.textContent = "Sent. I reply within a day, usually sooner.";
      }).catch(function () {
        note.className = "form-note err"; note.textContent = "That didn't go through. Email rvkumarsingh14@gmail.com instead.";
      });
    });
  }

  /* ---------- clock (IST) ---------- */
  $$("[data-clock]").forEach(function (c) {
    function tick() {
      var now = new Date();
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
      var h = "", m = "";
      parts.forEach(function (p) { if (p.type === "hour") h = p.value; if (p.type === "minute") m = p.value; });
      c.innerHTML = h + '<span class="colon">:</span>' + m;
    }
    tick(); setInterval(tick, 10000);
  });

  /* ---------- airflow: 1,200 DAG grid ---------- */
  var grid = $("[data-dag-grid]");
  if (grid) {
    var N = 1200, cells = [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < N; i++) { var c = document.createElement("i"); c.className = "ps"; frag.appendChild(c); cells.push(c); }
    grid.appendChild(frag);
    var counter = $("[data-dag-count]");
    var order = cells.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    grid._onReveal = function () {
      if (reduce) { cells.forEach(function (c) { c.className = "on"; }); if (counter) counter.textContent = "1,200"; return; }
      var k = 0, per = 14;
      (function step() {
        for (var j = 0; j < per && k < N; j++, k++) cells[order[k]].className = "on";
        if (counter) counter.textContent = k.toLocaleString("en-IN");
        if (k < N) requestAnimationFrame(step);
      })();
    };
    if (io) io.observe(grid); else grid._onReveal();
  }

  /* ---------- password reset: before / after toggle ---------- */
  $$("[data-arch-toggle]").forEach(function (wrap) {
    var btns = $$("button", wrap);
    var fig = wrap.closest(".figure");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        fig.setAttribute("data-state", b.getAttribute("data-state"));
      });
    });
    if (!reduce) {
      var auto = setInterval(function () {
        var cur = fig.getAttribute("data-state") === "before" ? "after" : "before";
        btns.forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-state") === cur ? "true" : "false"); });
        fig.setAttribute("data-state", cur);
      }, 3800);
      btns.forEach(function (b) { b.addEventListener("click", function () { clearInterval(auto); }); });
    }
  });

  /* ---------- handbook: 16-team network ---------- */
  var net = $("canvas[data-net]");
  if (net && net.getContext) {
    var ctx = net.getContext("2d");
    var teams = ["Media", "Legal", "Growth", "Narrative", "Research", "Design", "Video", "Social", "Data", "Field", "PR", "Content", "Ads", "Influencer", "War room", "Ops"];
    var W, H, dpr, nodes, edges = [], pulses = [];
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (var a = 0; a < teams.length; a++) {
      for (var b2 = a + 1; b2 < teams.length; b2++) { if (rnd() < 0.92) edges.push([a, b2]); }
    }
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = net.getBoundingClientRect();
      W = r.width; H = r.height;
      net.width = W * dpr; net.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
      nodes = teams.map(function (t, i) {
        var ang = (i / teams.length) * Math.PI * 2 - Math.PI / 2;
        return { t: t, bx: cx + Math.cos(ang) * R * (W > H ? 1.25 : 1), by: cy + Math.sin(ang) * R, ph: rnd() * 6.28 };
      });
    }
    size();
    window.addEventListener("resize", size);
    var edgeCount = $("[data-edge-count]");
    if (edgeCount) edgeCount.textContent = edges.length;
    var running = false, t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(function (n) {
        n.x = n.bx + Math.cos(t * 0.6 + n.ph) * 5;
        n.y = n.by + Math.sin(t * 0.8 + n.ph) * 5;
      });
      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        var p = nodes[e[0]], q = nodes[e[1]];
        ctx.strokeStyle = "rgba(92,200,255,0.10)";
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      });
      if (!reduce && Math.random() < 0.35) {
        var e = edges[(Math.random() * edges.length) | 0];
        pulses.push({ e: Math.random() < 0.5 ? e : [e[1], e[0]], s: now });
      }
      pulses = pulses.filter(function (p) {
        var k = (now - p.s) / 1400;
        if (k > 1) return false;
        var A = nodes[p.e[0]], B = nodes[p.e[1]];
        var x = A.x + (B.x - A.x) * k, y = A.y + (B.y - A.y) * k;
        ctx.fillStyle = "rgba(52,211,153," + (1 - k * 0.6) + ")";
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.283); ctx.fill();
        return true;
      });
      ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      nodes.forEach(function (n, i) {
        var pr = 5 + Math.sin(t * 2 + i) * 1.2;
        ctx.fillStyle = "rgba(124,155,255,0.18)";
        ctx.beginPath(); ctx.arc(n.x, n.y, pr + 7, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#7C9BFF";
        ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#D6DDE7";
        ctx.fillText(n.t, n.x, n.y + (n.y > H / 2 ? 24 : -16));
      });
      if (running) requestAnimationFrame(frame);
    }
    if (reduce) { requestAnimationFrame(frame); }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(frame); }
        else if (!vis) running = false;
      }).observe(net);
    } else { running = true; requestAnimationFrame(frame); }
  }

  /* SMIL animations (moving dots) respect reduced motion too */
  if (reduce) $$("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  onScroll();
})();
