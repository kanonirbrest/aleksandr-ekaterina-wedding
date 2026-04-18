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

  /**
   * RSVP → Google Form «свадьба А и Е»
   * Редактирование: https://docs.google.com/forms/d/e/1FAIpQLSfvboVxZtfpUT-K4bWhSiD-ue9c3btvxSSTHM058dzUQ300EQ/viewform?usp=publish-editor
   * Переопределение: window.RSVP_GOOGLE_FORMS до загрузки этого файла.
   * Вопрос «Количество персон» в Google Forms лучше переименовать в «Количество взрослых» (entry.449907991 не менять).
   */
  var RSVP_GOOGLE_FORMS = {
    action:
      "https://docs.google.com/forms/d/e/1FAIpQLSfvboVxZtfpUT-K4bWhSiD-ue9c3btvxSSTHM058dzUQ300EQ/formResponse",
    entries: {
      first_name: "entry.1784060440",
      last_name: "entry.126729175",
      attend: "entry.1243509634",
      attendYes: "Я приду",
      attendNo: "Я не приду",
      persons: "entry.449907991",
      children: "entry.2146726756",
      diet_notes: "entry.34150322",
    },
  };

  if (typeof window !== "undefined" && window.RSVP_GOOGLE_FORMS) {
    var ov = window.RSVP_GOOGLE_FORMS;
    if (ov && ov.action) RSVP_GOOGLE_FORMS.action = ov.action;
    if (ov && ov.entries) {
      for (var rk in ov.entries) {
        if (Object.prototype.hasOwnProperty.call(ov.entries, rk)) {
          RSVP_GOOGLE_FORMS.entries[rk] = ov.entries[rk];
        }
      }
    }
  }

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

  function dressStripLogicalCount() {
    return DRESS_SLIDES.length;
  }

  function dressCenterScrollLeft(viewport, slideEl) {
    var left =
      slideEl.offsetLeft + slideEl.offsetWidth / 2 - viewport.clientWidth / 2;
    var max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    if (left < 0) return 0;
    if (left > max) return max;
    return left;
  }

  function dressSliderNearestIndex(viewport, strip) {
    var slides = strip.querySelectorAll(".dress-slide");
    var n = dressStripLogicalCount();
    if (!slides.length || !n) return 0;
    var viewMid = viewport.scrollLeft + viewport.clientWidth / 2;
    var best = 0;
    var bestD = Infinity;
    for (var j = 0; j < slides.length; j++) {
      var el = slides[j];
      var mid = el.offsetLeft + el.offsetWidth / 2;
      var d = Math.abs(mid - viewMid);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    return best % n;
  }

  function dressScrollToIndex(viewport, strip, index, smooth) {
    var slides = strip.querySelectorAll(".dress-slide");
    var n = dressStripLogicalCount();
    if (!slides.length || !n || slides.length < 3 * n) return;
    var i = ((index % n) + n) % n;
    var el = slides[n + i];
    viewport.scrollTo({
      left: dressCenterScrollLeft(viewport, el),
      behavior: smooth === false ? "auto" : "smooth",
    });
  }

  function dressNormalizeLoopScroll(viewport, strip) {
    var slides = strip.querySelectorAll(".dress-slide");
    var n = dressStripLogicalCount();
    if (!slides.length || !n || slides.length < 3 * n) return;
    var blockW = slides[n].offsetLeft - slides[0].offsetLeft;
    if (blockW <= 0) return;
    var sl = viewport.scrollLeft;
    var viewMid = sl + viewport.clientWidth / 2;
    var realStart = slides[n].offsetLeft;
    var thirdStart = slides[2 * n].offsetLeft;
    if (viewMid < realStart) {
      viewport.scrollLeft = sl + blockW;
    } else if (viewMid >= thirdStart) {
      viewport.scrollLeft = sl - blockW;
    }
  }

  function dressInitLoopScroll(viewport, strip) {
    var slides = strip.querySelectorAll(".dress-slide");
    var n = dressStripLogicalCount();
    if (!slides.length || !n || slides.length < 3 * n) return;
    var el = slides[n];
    viewport.scrollLeft = dressCenterScrollLeft(viewport, el);
  }

  function wireDressSlider() {
    var strip = document.getElementById("dress-strip");
    var viewport = document.getElementById("dress-slider-viewport");
    var arrowBtn = document.getElementById("dress-slider-arrow");
    if (!strip || !viewport) return;

    var n = dressStripLogicalCount();
    strip.innerHTML = "";
    for (var b = 0; b < 3; b++) {
      DRESS_SLIDES.forEach(function (name, i) {
        var fig = document.createElement("figure");
        fig.className = "dress-slide";
        fig.setAttribute("role", "listitem");

        var img = document.createElement("img");
        img.src = dressSlideUrl(name);
        img.alt =
          "Пример образа в стиле total black, фото " +
          (i + 1) +
          " из " +
          n;
        img.loading = b === 1 && i < 2 ? "eager" : "lazy";
        img.decoding = "async";

        fig.appendChild(img);
        strip.appendChild(fig);
      });
    }

    function scheduleDressLoopNormalize() {
      if (viewport._dressNormTimer) clearTimeout(viewport._dressNormTimer);
      viewport._dressNormTimer = setTimeout(function () {
        viewport._dressNormTimer = null;
        dressNormalizeLoopScroll(viewport, strip);
      }, 100);
    }

    viewport.addEventListener("scroll", scheduleDressLoopNormalize, {
      passive: true,
    });
    viewport.addEventListener("scrollend", function () {
      if (viewport._dressNormTimer) clearTimeout(viewport._dressNormTimer);
      viewport._dressNormTimer = null;
      dressNormalizeLoopScroll(viewport, strip);
    });

    var dressResizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(dressResizeTimer);
      dressResizeTimer = setTimeout(function () {
        dressResizeTimer = null;
        var idx = dressSliderNearestIndex(viewport, strip);
        dressScrollToIndex(viewport, strip, idx, false);
      }, 150);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        dressInitLoopScroll(viewport, strip);
      });
    });

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
        var prev = (idx - 1 + n) % n;
        dressScrollToIndex(viewport, strip, prev, true);
      });
    }
  }

  function wireRsvpForm() {
    var form = document.getElementById("rsvp-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = RSVP_GOOGLE_FORMS;
      var en = c && c.entries;
      if (
        !c ||
        !c.action ||
        !en ||
        !en.first_name ||
        !en.last_name ||
        !en.attend
      ) {
        window.alert(
          "Отправка в Google Форму не настроена: в js/main.js заполните RSVP_GOOGLE_FORMS.action и entries (поля entry.* из предзаполненной ссылки)."
        );
        return;
      }

      var fd = new FormData(form);
      var first = (fd.get("first_name") || "").toString().trim();
      var last = (fd.get("last_name") || "").toString().trim();
      var attendVal = (fd.get("attend") || "").toString();
      if (!first || !last || !attendVal) {
        window.alert(
          "Пожалуйста, укажите имя, фамилию и выберите «Я приду» или «Я не приду»."
        );
        return;
      }

      var params = new URLSearchParams();
      params.append(en.first_name, first);
      params.append(en.last_name, last);
      var attendLabel =
        attendVal === "no"
          ? en.attendNo || "Я не приду"
          : en.attendYes || "Я приду";
      params.append(en.attend, attendLabel);

      if (en.persons) {
        var pr = (fd.get("persons") || "").toString().trim();
        if (pr !== "") params.append(en.persons, pr);
      }
      if (en.children) {
        var ch = (fd.get("children") || "").toString().trim();
        if (ch !== "") params.append(en.children, ch);
      }
      if (en.diet_notes) {
        var di = (fd.get("diet_notes") || "").toString().trim();
        if (di !== "") params.append(en.diet_notes, di);
      }

      var btn = form.querySelector(".frame12-submit");
      var statusEl = document.getElementById("rsvp-form-status");
      var btnDefault = btn ? btn.textContent : "Отправить";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Отправка…";
      }
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = "Отправка…";
      }

      fetch(c.action, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: params.toString(),
      })
        .then(function () {
          if (btn) {
            btn.textContent = "Отправлено";
            btn.disabled = true;
          }
          if (statusEl) statusEl.textContent = "Спасибо! Ответ записан.";
          form.reset();
          window.setTimeout(function () {
            if (btn) {
              btn.textContent = btnDefault;
              btn.disabled = false;
            }
            if (statusEl) {
              statusEl.textContent = "";
              statusEl.hidden = true;
            }
          }, 6000);
        })
        .catch(function () {
          if (btn) {
            btn.textContent = btnDefault;
            btn.disabled = false;
          }
          if (statusEl) {
            statusEl.textContent = "";
            statusEl.hidden = true;
          }
          window.alert(
            "Не удалось отправить. Проверьте подключение к интернету и настройки формы."
          );
        });
    });
  }

  function wireAssets() {
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
  wireRsvpForm();
})();
