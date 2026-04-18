(function () {
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function parseTarget(iso) {
    var t = Date.parse(iso);
    return Number.isNaN(t) ? null : t;
  }

  var MONTH_GENITIVE_RU = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  var MONTH_NAMES_RU = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  function parseWeddingYmd(raw) {
    var m = (raw || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return {
      year: parseInt(m[1], 10),
      monthIndex: parseInt(m[2], 10) - 1,
      day: parseInt(m[3], 10),
    };
  }

  function weddingFromCountdown() {
    var page = document.querySelector(".page");
    var fromMain = page && page.getAttribute("data-wedding");
    var w = parseWeddingYmd(fromMain);
    if (w) return w;
    var el = document.getElementById("countdown");
    w = parseWeddingYmd(el && el.getAttribute("data-target"));
    if (w) return w;
    return { year: 2026, monthIndex: 7, day: 29 };
  }

  function syncCalendarHeaderFromCountdown(w) {
    if (!w) w = weddingFromCountdown();
    var cy = document.getElementById("calendar-year");
    var cm = document.getElementById("calendar-month");
    if (cy) cy.textContent = String(w.year);
    if (cm) cm.textContent = MONTH_NAMES_RU[w.monthIndex] || "Август";
    return w;
  }

  function syncHeroDateLine(w) {
    if (!w) w = weddingFromCountdown();
    var el = document.getElementById("hero-date-line");
    if (!el) return;
    var gen = MONTH_GENITIVE_RU[w.monthIndex] || "августа";
    el.textContent = String(w.day) + " " + gen + " " + String(w.year);
  }

  function renderCalendar(year, monthIndex, w) {
    var root = document.getElementById("calendar-root");
    if (!root) return;

    if (!w) w = weddingFromCountdown();
    var highlightWedding =
      w.year === year && w.monthIndex === monthIndex;

    var grid = document.createElement("div");
    grid.className = "cal-grid";

    var first = new Date(year, monthIndex, 1);
    var jsDow = first.getDay();
    var mondayBased = (jsDow + 6) % 7;
    var dim = new Date(year, monthIndex + 1, 0).getDate();

    for (var i = 0; i < mondayBased; i++) {
      var empty = document.createElement("div");
      empty.className = "cal-cell cal-cell--muted";
      empty.innerHTML = "&nbsp;";
      grid.appendChild(empty);
    }

    for (var day = 1; day <= dim; day++) {
      var cell = document.createElement("div");
      cell.className = "cal-cell cal-cell--day";

      if (highlightWedding && day === w.day) {
        cell.classList.add("cal-cell--wedding");
        var moon = document.createElement("img");
        moon.className = "cal-pink-moon";
        moon.src = "assets/" + encodeURIComponent("Layer 120 1") + ".png";
        moon.alt = "";
        moon.decoding = "async";
        moon.width = 42;
        moon.height = 41;
        var num = document.createElement("span");
        num.className = "cal-day-num";
        num.textContent = String(day);
        cell.appendChild(moon);
        cell.appendChild(num);
      } else {
        cell.textContent = String(day);
      }

      grid.appendChild(cell);
    }

    root.innerHTML = "";
    root.appendChild(grid);
  }

  function tickCountdown() {
    var el = document.getElementById("countdown");
    if (!el) return;
    var target = parseTarget(el.getAttribute("data-target"));
    if (target === null) return;

    var diff = target - Date.now();
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(function (u) {
        var n = el.querySelector('[data-unit="' + u + '"]');
        if (n) n.textContent = u === "days" ? "0" : "00";
      });
      return;
    }

    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    s -= days * 86400;
    var hours = Math.floor(s / 3600);
    s -= hours * 3600;
    var minutes = Math.floor(s / 60);
    var seconds = s - minutes * 60;

    var map = {
      days: String(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };
    Object.keys(map).forEach(function (u) {
      var n = el.querySelector('[data-unit="' + u + '"]');
      if (n) n.textContent = map[u];
    });
  }

  function tryFirst(el, bases) {
    if (!el || !bases || !bases.length) return;
    var i = 0;
    function kick() {
      if (i >= bases.length) return;
      var url = "assets/" + encodeURIComponent(bases[i]) + ".png";
      var img = new Image();
      img.onload = function () {
        el.classList.add("has-image");
        el.style.backgroundImage = 'url("' + url + '")';
      };
      img.onerror = function () {
        i += 1;
        kick();
      };
      img.src = url;
    }
    kick();
  }

  function tryFirstOnAll(els, bases) {
    if (!els || !els.length) return;
    var arr = Array.prototype.slice.call(els);
    var i = 0;
    function kick() {
      if (i >= bases.length) return;
      var url = "assets/" + encodeURIComponent(bases[i]) + ".png";
      var img = new Image();
      img.onload = function () {
        arr.forEach(function (el) {
          el.classList.add("has-image");
          el.style.backgroundImage = 'url("' + url + '")';
        });
      };
      img.onerror = function () {
        i += 1;
        kick();
      };
      img.src = url;
    }
    kick();
  }

  var DRESS_SLIDES = [
    "Layer 1 21",
    "Layer 2 2",
    "Layer 3 2",
    "Layer 4 3",
    "Layer 3 4",
    "Layer 0 3",
    "Layer 1 22",
    "Layer 2 3",
  ];

  function dressSlideUrl(name) {
    return "assets/" + encodeURIComponent(name) + ".png";
  }

  function dressSliderNearestIndex(viewport, strip) {
    var slides = strip.querySelectorAll(".dress-slide");
    if (!slides.length) return 0;
    var sl = viewport.scrollLeft;
    var best = 0;
    var bestD = Infinity;
    for (var j = 0; j < slides.length; j++) {
      var d = Math.abs(slides[j].offsetLeft - sl);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    return best;
  }

  function dressScrollToIndex(viewport, strip, index, smooth) {
    var slides = strip.querySelectorAll(".dress-slide");
    if (!slides.length) return;
    var n = slides.length;
    var i = ((index % n) + n) % n;
    viewport.scrollTo({
      left: slides[i].offsetLeft,
      behavior: smooth === false ? "auto" : "smooth",
    });
  }

  function wireDressSlider() {
    var strip = document.getElementById("dress-strip");
    var viewport = document.getElementById("dress-slider-viewport");
    var arrowBtn = document.getElementById("dress-slider-arrow");
    if (!strip || !viewport) return;

    strip.innerHTML = "";
    DRESS_SLIDES.forEach(function (name, i) {
      var fig = document.createElement("figure");
      fig.className = "dress-slide";
      fig.setAttribute("role", "listitem");

      var img = document.createElement("img");
      img.src = dressSlideUrl(name);
      img.alt = "Пример образа в стиле total black, фото " + (i + 1) + " из " + DRESS_SLIDES.length;
      img.loading = i < 2 ? "eager" : "lazy";
      img.decoding = "async";

      fig.appendChild(img);
      strip.appendChild(fig);
    });

    var touchStartX = 0;
    var dressWheelLock = false;

    viewport.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchend",
      function (e) {
        var t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        var dx = t.clientX - touchStartX;
        if (Math.abs(dx) < 40) return;
        var slides = strip.querySelectorAll(".dress-slide");
        if (!slides.length) return;
        var idx = dressSliderNearestIndex(viewport, strip);
        if (dx < 0) {
          dressScrollToIndex(viewport, strip, idx + 1, true);
        } else {
          dressScrollToIndex(viewport, strip, idx - 1, true);
        }
      },
      { passive: true }
    );

    viewport.addEventListener(
      "wheel",
      function (e) {
        var hx = Math.abs(e.deltaX);
        var hy = Math.abs(e.deltaY);
        if (hx < 2 && hx <= hy) return;
        e.preventDefault();
        if (dressWheelLock) return;
        dressWheelLock = true;
        window.setTimeout(function () {
          dressWheelLock = false;
        }, 450);
        var slides = strip.querySelectorAll(".dress-slide");
        if (!slides.length) return;
        var idx = dressSliderNearestIndex(viewport, strip);
        var delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        if (delta > 0) {
          dressScrollToIndex(viewport, strip, idx + 1, true);
        } else if (delta < 0) {
          dressScrollToIndex(viewport, strip, idx - 1, true);
        }
      },
      { passive: false }
    );

    viewport.addEventListener("keydown", function (e) {
      var slides = strip.querySelectorAll(".dress-slide");
      if (!slides.length) return;
      var idx = dressSliderNearestIndex(viewport, strip);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        dressScrollToIndex(viewport, strip, idx - 1, true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        dressScrollToIndex(viewport, strip, idx + 1, true);
      }
    });

    if (arrowBtn) {
      arrowBtn.addEventListener("click", function () {
        var slides = strip.querySelectorAll(".dress-slide");
        if (!slides.length) return;
        var idx = dressSliderNearestIndex(viewport, strip);
        var prev = (idx - 1 + slides.length) % slides.length;
        dressScrollToIndex(viewport, strip, prev, true);
      });
    }
  }

  function wireAssets() {
    tryFirst(document.querySelector('[data-asset="plan-group22"]'), ["Group 22"]);
    tryFirst(document.querySelector('[data-asset="plan8-1"]'), ["8"]);
    tryFirst(document.querySelector('[data-asset="plan8-2"]'), ["8"]);
    tryFirst(document.querySelector('[data-asset="plan8-3"]'), ["8"]);

    wireDressSlider();
  }

  var w = weddingFromCountdown();
  syncCalendarHeaderFromCountdown(w);
  syncHeroDateLine(w);
  renderCalendar(w.year, w.monthIndex, w);
  tickCountdown();
  setInterval(tickCountdown, 1000);
  wireAssets();
})();
