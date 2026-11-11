(function () {
  /* Save resume as PDF */
  document.getElementById("save-pdf").addEventListener("click", function () {
    var framed = false;
    try { framed = window.self !== window.top; } catch (e) { framed = true; }
    if (framed) {   /* previews (OneDrive, Teams, Outlook, Copilot) block printing */
      alert("To save the resume as a PDF, download this file and open it in your browser (Edge, Chrome, Safari or Firefox), then click Save as PDF again.");
      return;
    }
    window.print();   /* choose "Save as PDF" in the print window */
  });

  /* ---- Pages: show one page at a time, chosen by the link (#...) ---- */
  var pages = {};
  document.querySelectorAll(".page").forEach(function (p) { pages[p.getAttribute("data-page")] = p; });
  function pageFor(hash) {
    if (!hash || hash === "#" || hash === "#top" || hash === "#story" || hash === "#contact") return "home";
    var el = document.getElementById(hash.slice(1));
    var p = el && el.closest ? el.closest(".page") : null;
    return p ? p.getAttribute("data-page") : "home";
  }
  function route() {
    var hash = location.hash, name = pageFor(hash);
    if (hash === "#contact") name = current || "home";
    Object.keys(pages).forEach(function (k) { pages[k].classList.toggle("active", k === name); });
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === name && !(name === "home" && hash !== "#story")) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    current = name;
    var target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    var pageTop = (!hash || ["#top", "#about", "#work", "#resume"].indexOf(hash) > -1 || target === pages[name]);
    /* run after the browser's own jump-to-anchor so ours wins */
    setTimeout(function () {
      if (target && !pageTop) target.scrollIntoView({ behavior: "auto", block: "start" });
      else document.getElementById("scroller").scrollTo(0, 0);
    }, 30);
  }
  var current = null;
  window.addEventListener("hashchange", route);
  route();

  /* An image used twice is stored once; copies point to it with data-src (keeps the file small) */
  document.querySelectorAll("img[data-src]").forEach(function (img) {
    var src = document.getElementById(img.getAttribute("data-src"));
    if (src) img.src = src.src;
  });

  /* ---- Gallery slideshows: 1 s on screen + 0.4 s fade, looping; pause on hover ---- */
  var STAY = 1000, FADE = 400;
  document.querySelectorAll(".show").forEach(function (show) {
    var slides = show.querySelectorAll(".slide");
    var count = show.querySelector(".count");
    var i = 0, timer = null, hovered = false, visible = false;
    function paint() { if (count) count.textContent = (i + 1) + " / " + slides.length; }
    function step() {
      slides[i].classList.remove("on");
      i = (i + 1) % slides.length;
      slides[i].classList.add("on");
      paint();
      schedule();
    }
    function schedule() { clearTimeout(timer); timer = null; if (slides.length > 1 && visible && !hovered) timer = setTimeout(step, STAY + FADE); }
    /* Pause only for a real mouse hover or keyboard focus. Touch screens fire fake
       hover/focus events on tap that never end, which would freeze the slideshow. */
    function pause() { hovered = true; clearTimeout(timer); timer = null; show.classList.add("paused"); }
    function resume() { hovered = false; show.classList.remove("paused"); schedule(); }
    show.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pause(); });
    show.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") resume(); });
    show.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(":focus-visible")) pause(); });
    show.addEventListener("focusout", function () { if (hovered && !show.matches(":hover")) resume(); });
    /* Only run while on screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(show);
    } else { visible = true; }
    /* Manual navigation (chevrons appear while paused) */
    function go(n) {
      if (n < 0 || n >= slides.length || n === i) return;
      slides[i].classList.remove("on"); i = n; slides[i].classList.add("on"); paint();
    }
    var area = show.querySelector(".slides"), prev = null, next = null;
    if (slides.length > 1) {
      prev = chevron("prev", "Previous image"); next = chevron("next", "Next image");
      area.appendChild(prev); area.appendChild(next);
      prev.addEventListener("click", function (e) { e.stopPropagation(); go(i - 1); });
      next.addEventListener("click", function (e) { e.stopPropagation(); go(i + 1); });
    }
    var basePaint = paint;
    paint = function () { basePaint(); if (prev) { prev.hidden = i === 0; next.hidden = i === slides.length - 1; } };
    paint(); schedule();

    /* Click the slideshow to see the current image full size */
    var api = { slides: slides, get: function () { return i; }, go: go, show: show };
    area.addEventListener("click", function () { openBox(api); });
    area.addEventListener("keydown", function (e) { if (e.target === area && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openBox(api); } });
  });

  function chevron(dir, label) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chev " + dir; b.setAttribute("aria-label", label);
    b.innerHTML = dir === "prev" ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
    return b;
  }

  var box = document.getElementById("lightbox"), lbImg = document.getElementById("lb-img"), lbCap = document.getElementById("lb-cap");
  var lbStage = box.querySelector(".lb-stage"), lbPrev = chevron("prev", "Previous image"), lbNext = chevron("next", "Next image"), cur = null;
  lbStage.appendChild(lbPrev); lbStage.appendChild(lbNext);
  function lbPaint() {
    var n = cur.get(), img = cur.slides[n];
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = cur.show.querySelector(".txt").textContent + (cur.slides.length > 1 ? "  \u00b7  " + (n + 1) + " / " + cur.slides.length : "");
    lbPrev.hidden = n === 0; lbNext.hidden = n === cur.slides.length - 1;
  }
  function lbGo(d) { var n = cur.get() + d; if (n < 0 || n >= cur.slides.length) return; cur.go(n); lbPaint(); }
  lbPrev.addEventListener("click", function (e) { e.stopPropagation(); lbGo(-1); });
  lbNext.addEventListener("click", function (e) { e.stopPropagation(); lbGo(1); });
  box.addEventListener("keydown", function (e) { if (!cur) return; if (e.key === "ArrowLeft") lbGo(-1); if (e.key === "ArrowRight") lbGo(1); });
  function openBox(api) {
    cur = api; lbPaint();
    if (box.showModal) box.showModal(); else window.open(lbImg.src);
  }
  document.getElementById("lb-close").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
})();
