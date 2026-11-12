// Dilshan Ansari — portfolio shared script
(function () {
  "use strict";

  /* if JS is off, the page still works and the normal cursor stays */
  document.documentElement.classList.remove("no-js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hidden = false;

  document.querySelectorAll(".year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- animated rainbow background ---------- */
  var bg = null;
  if (!reduce) {
    bg = document.createElement("div");
    bg.className = "bg-anim";
    bg.setAttribute("aria-hidden", "true");
    for (var b = 0; b < 5; b++) { var o = document.createElement("i"); bg.appendChild(o); }
    document.body.appendChild(bg);
  }

  document.addEventListener("visibilitychange", function () {
    hidden = document.hidden;
  });

  /* Colour cycle: small stepped changes instead of a per-frame filter animation.
     Smooth to the eye, but cheap enough for software rendering and weak laptops. */
  if (bg) {
    var hues = [265, 190, 330, 45, 120];
    setInterval(function () {
      if (hidden) return;
      for (var k = 0; k < hues.length; k++) hues[k] = (hues[k] + 6) % 360;
      var orbs = bg.querySelectorAll("i");
      for (var j = 0; j < orbs.length; j++) orbs[j].style.background = "hsl(" + hues[j] + " 95% 62%)";
    }, 1200);
  }

  /* ---------- colourful flowing cursor trail ---------- */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    var N = 14, trails = [], mx = -100, my = -100, pi = 0, raf = null, lastMove = 0;
    for (var i = 0; i < N; i++) {
      var size = 12 - i * 0.7;
      var t = document.createElement("div");
      t.className = "trail";
      t.style.opacity = String(0.9 * (1 - i / N));
      t.style.width = size + "px";
      t.style.height = size + "px";
      document.body.appendChild(t);
      trails.push({ el: t, x: -100, y: -100, half: size / 2 });
    }
    function frame() {
      var px = mx, py = my, moving = false;
      for (var j = 0; j < N; j++) {
        var tr = trails[j];
        tr.x += (px - tr.x) * 0.35;
        tr.y += (py - tr.y) * 0.35;
        if (Math.abs(px - tr.x) > 0.3 || Math.abs(py - tr.y) > 0.3) moving = true;
        px = tr.x; py = tr.y;
        tr.el.style.setProperty("--c", "hsl(" + ((pi + j * 22) % 360) + " 85% 62%)");
        tr.el.style.transform = "translate(" + (tr.x - tr.half) + "px," + (tr.y - tr.half) + "px)";
      }
      pi = (pi + 3) % 360;
      /* stop the loop when the cursor is idle so the laptop stays cool */
      if (moving || Date.now() - lastMove < 900) raf = requestAnimationFrame(frame);
      else raf = null;
    }
    function kick() {
      lastMove = Date.now();
      if (!raf && !hidden) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 3) + "px," + (my - 3) + "px)";
      kick();
    });
    kick();
  }

  /* ---------- typing on scroll ---------- */
  function typeInto(el) {
    var text = el.getAttribute("data-text") || "";
    el.textContent = "";
    var i = 0;
    (function step() {
      if (i <= text.length) { el.textContent = text.slice(0, i++); setTimeout(step, 34); }
    })();
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.92 && r.bottom > 0;
  }
  var targets = Array.prototype.slice.call(document.querySelectorAll(".will-type[data-text]"));
  var fades = Array.prototype.slice.call(document.querySelectorAll(".fade"));

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.textContent = el.getAttribute("data-text"); });
    fades.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove("pre");
          en.target.classList.add("in");
          if (en.target.hasAttribute("data-text")) typeInto(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) {
      if (inView(el)) { el.classList.add("in"); typeInto(el); }
      else { el.classList.add("pre"); io.observe(el); }
    });
    var ioF = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove("pre"); en.target.classList.add("in"); ioF.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    fades.forEach(function (el) {
      if (inView(el)) { el.classList.add("in"); }
      else { el.classList.add("pre"); ioF.observe(el); }
    });
    /* safety net: never leave content hidden */
    setTimeout(function () {
      targets.forEach(function (el) {
        if (el.classList.contains("pre") && inView(el)) { el.classList.remove("pre"); el.classList.add("in"); if (!el.textContent) el.textContent = el.getAttribute("data-text"); }
      });
      fades.forEach(function (el) {
        if (el.classList.contains("pre") && inView(el)) { el.classList.remove("pre"); el.classList.add("in"); }
      });
    }, 2500);
  }

  /* ---------- skill bars ---------- */
  var bars = document.querySelectorAll(".skill");
  if (bars.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      bars.forEach(function (b) { b.classList.add("in"); });
    } else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io2.unobserve(en.target); } });
      }, { threshold: 0.25 });
      bars.forEach(function (b) { io2.observe(b); });
    }
  }

  /* ---------- gallery stack ---------- */
  var stack = document.getElementById("stack");
  var dotsWrap = document.getElementById("stackDots");
  if (stack && dotsWrap) {
    var imgs = stack.getAttribute("data-imgs").split(",");
    var N = imgs.length, cards = [], dots = [], active = 0, timer = null, stackVisible = true;
    imgs.forEach(function (src, i) {
      var c = document.createElement("div");
      c.className = "stack-card";
      var im = document.createElement("img");
      im.src = src.trim(); im.alt = "Dilshan Ansari photo " + (i + 1);
      im.loading = "lazy"; im.decoding = "async";
      c.appendChild(im); stack.appendChild(c); cards.push(c);
      var d = document.createElement("button");
      d.setAttribute("aria-label", "photo " + (i + 1));
      d.addEventListener("click", function () { goTo(i); reset(); });
      dotsWrap.appendChild(d); dots.push(d);
    });
    function render() {
      cards.forEach(function (c, i) {
        var off = ((i - active) % N + N) % N;
        if (off > N / 2) off -= N;
        var abs = Math.abs(off);
        if (abs > 3) {
          c.style.opacity = "0"; c.style.pointerEvents = "none";
          c.style.transform = "translateX(" + (off > 0 ? 170 : -170) + "px) translateZ(-320px) scale(.7)";
          c.classList.remove("active");
        } else {
          c.style.opacity = String(1 - abs * 0.26);
          c.style.pointerEvents = abs === 0 ? "auto" : "none";
          c.style.transform = "translateX(" + (off * 64) + "px) translateZ(" + (-abs * 95) + "px) rotateY(" + (off * -3) + "deg) scale(" + (1 - abs * 0.07) + ")";
          c.style.zIndex = String(20 - abs);
          c.classList.toggle("active", abs === 0);
        }
      });
      dots.forEach(function (d, i) { d.classList.toggle("active", i === active); });
    }
    function goTo(i) { active = ((i % N) + N) % N; render(); }
    function start() { if (!reduce && !timer && stackVisible && !document.hidden) { timer = setInterval(function () { goTo(active + 1); }, 3500); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function reset() { stop(); start(); }
    render();
    start();
    if ("IntersectionObserver" in window) {
      var ioS = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          stackVisible = en.isIntersecting;
          if (stackVisible) start(); else stop();
        });
      }, { threshold: 0.1 });
      ioS.observe(stack);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- video: plays on its own, user can still pause it ---------- */
  var vid = document.querySelector("video");
  if (vid) {
    var tryPlay = function () {
      try { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    };
    if (vid.readyState >= 2) tryPlay();
    else vid.addEventListener("loadeddata", tryPlay, { once: true });
  }
})();
