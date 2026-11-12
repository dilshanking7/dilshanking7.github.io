// Dilshan Ansari — portfolio animations
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- custom cursor ---------- */
  var cursor = document.getElementById("cursor");
  var ring = document.getElementById("cursorRing");
  if (cursor && ring && !reduce && window.matchMedia("(hover:hover)").matches) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = "translate(" + (mx - 5) + "px," + (my - 5) + "px)";
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - 19) + "px," + (ry - 19) + "px)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .card, .project, .skill, .contact-card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
    });
  } else if (cursor && ring) {
    cursor.style.display = "none";
    ring.style.display = "none";
  }

  /* ---------- theme colour cycling ---------- */
  var themes = ["0", "1", "2", "3", "4"];
  var ti = 0;
  if (!reduce) {
    setInterval(function () {
      ti = (ti + 1) % themes.length;
      document.body.setAttribute("data-theme", themes[ti]);
    }, 6000);
  }

  /* ---------- typing effect ---------- */
  function typeEl(el, text, speed) {
    el.textContent = "";
    var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i++);
        setTimeout(step, speed);
      }
    })();
  }
  var typed = Array.prototype.slice.call(document.querySelectorAll(".typed"));
  if (reduce) {
    typed.forEach(function (el) { el.textContent = el.getAttribute("data-text") || ""; });
  } else {
    var delay = 400;
    typed.forEach(function (el) {
      var t = el.getAttribute("data-text") || "";
      setTimeout(function () { typeEl(el, t, 26); }, delay);
      delay += 400 + t.length * 18;
    });
  }

  /* ---------- photo stack gallery ---------- */
  var stack = document.getElementById("stack");
  var dots = document.getElementById("stackDots");
  if (stack) {
    var N = 8;
    var cards = [];
    for (var i = 0; i < N; i++) {
      var c = document.createElement("div");
      c.className = "stack-card";
      var img = document.createElement("img");
      img.src = "assets/photos/filtered/photo" + (i + 1) + ".jpg";
      img.alt = "Dilshan Ansari photo " + (i + 1);
      c.appendChild(img);
      stack.appendChild(c);
      cards.push(c);

      var d = document.createElement("button");
      d.setAttribute("aria-label", "photo " + (i + 1));
      (function (idx) {
        d.addEventListener("click", function () { goTo(idx); reset(); });
      })(i);
      dots.appendChild(d);
    }
    var dotsArr = Array.prototype.slice.call(dots.children);

    var active = 0;
    var timer = null;

    function render() {
      cards.forEach(function (c, i) {
        var off = ((i - active) % N + N) % N;
        if (off > N / 2) off = off - N;
        var abs = Math.abs(off);
        if (abs > 3) {
          c.style.opacity = "0";
          c.style.pointerEvents = "none";
          c.style.transform = "translateX(" + (off > 0 ? 160 : -160) + "px) translateZ(-300px) scale(.7)";
          c.classList.remove("active");
        } else {
          c.style.opacity = String(1 - abs * 0.28);
          c.style.pointerEvents = abs === 0 ? "auto" : "none";
          var x = off * 62;
          var z = -abs * 90;
          var s = 1 - abs * 0.07;
          var rot = off * -3;
          c.style.transform = "translateX(" + x + "px) translateZ(" + z + "px) rotateY(" + rot + "deg) scale(" + s + ")";
          c.style.zIndex = String(20 - abs);
          c.classList.toggle("active", abs === 0);
        }
      });
      dotsArr.forEach(function (d, i) { d.classList.toggle("active", i === active); });
    }

    function goTo(i) { active = ((i % N) + N) % N; render(); }
    function next() { goTo(active + 1); }
    function reset() { if (!reduce) { clearInterval(timer); timer = setInterval(next, 3500); } }

    render();
    if (!reduce) timer = setInterval(next, 3500);
    stack.addEventListener("click", function () { next(); reset(); });
  }

  /* ---------- orb parallax ---------- */
  var orbs = document.querySelectorAll(".orb");
  if (orbs.length && !reduce) {
    window.addEventListener("mousemove", function (ev) {
      var x = (ev.clientX / window.innerWidth - 0.5) * 20;
      var y2 = (ev.clientY / window.innerHeight - 0.5) * 20;
      orbs.forEach(function (o, i) {
        var f = (i + 1) * 8;
        o.style.transform = "translate(" + (x * f / 8) + "px," + (y2 * f / 8) + "px)";
      });
    }, { passive: true });
  }
})();
