/*
 * app.js — search, region filter, favorites, theme, language, cards, dialog
 * Security: textContent only, safeUrl() for all links, try/catch for localStorage
 */
(function () {
  "use strict";

  /* ── Merge i18n ────────────────────────────────────────────── */
  var I18N = {};
  if (window.JUNI_VISA_I18N) Object.assign(I18N, window.JUNI_VISA_I18N);
  if (window.JUNI_VISA_I18N_MORE) Object.assign(I18N, window.JUNI_VISA_I18N_MORE);

  var RTL_LANGS = ["ur", "ar", "fa"];
  var LANG_NAMES = {
    en: "English", ur: "اردو", ar: "العربية", hi: "हिन्दी", fr: "Français",
    es: "Español", pt: "Português", ru: "Русский", zh: "中文", bn: "বাংলা",
    tr: "Türkçe", id: "Indonesia", de: "Deutsch", fa: "فارسی", sw: "Kiswahili",
    it: "Italiano", ja: "日本語", ko: "한국어", vi: "Tiếng Việt", th: "ไทย",
    nl: "Nederlands", pl: "Polski", uk: "Українська", tl: "Filipino", ta: "தமிழ்"
  };
  var LANG_CODES = Object.keys(LANG_NAMES);

  /* ── State ─────────────────────────────────────────────────── */
  var currentLang = "en";
  var currentRegion = "all";
  var searchQuery = "";
  var favorites = [];
  var searchTimer = null;

  /* ── DOM refs ──────────────────────────────────────────────── */
  var elCards = document.getElementById("cards");
  var elNoResults = document.getElementById("no-results");
  var elResultsCount = document.getElementById("results-count");
  var elSearch = document.getElementById("search");
  var elRegionButtons = document.getElementById("region-buttons");
  var elThemeBtn = document.getElementById("theme-btn");
  var elThemeIcon = document.getElementById("theme-icon");
  var elLangBtn = document.getElementById("lang-btn");
  var elLangCurrent = document.getElementById("lang-current");
  var elLangMenu = document.getElementById("lang-menu");
  var elBackToTop = document.getElementById("back-to-top");
  var elTranslateBtn = document.getElementById("translate-btn");
  var elTranslateDialog = document.getElementById("translate-dialog");
  var elTranslateClose = document.getElementById("translate-close");

  /* ── Helpers ───────────────────────────────────────────────── */
  function t(key) {
    var lang = I18N[currentLang] ? currentLang : "en";
    var dict = I18N[lang] || I18N["en"];
    return dict[key] || (I18N["en"] && I18N["en"][key]) || key;
  }

  function tFmt(key, count) {
    return t(key).replace("{count}", String(count));
  }

  function safeUrl(url) {
    if (typeof url !== "string") return null;
    if (url === "verify needed") return null;
    try {
      var u = new URL(url);
      if (u.protocol === "http:" || u.protocol === "https:") return url;
    } catch (e) {}
    return null;
  }

  function normalize(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function getCountryName(country, lang) {
    try {
      var dn = new Intl.DisplayNames([lang], { type: "region" });
      var name = dn.of(country);
      if (name && name !== country) return name;
    } catch (e) {}
    return null;
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  /* ── Language ─────────────────────────────────────────────── */
  function detectLang() {
    var saved = safeGet("wv_lang");
    if (saved && I18N[saved]) return saved;
    try {
      var browser = (navigator.language || "en").split("-")[0];
      if (I18N[browser]) return browser;
    } catch (e) {}
    return "en";
  }

  function setLang(lang) {
    currentLang = (lang && I18N[lang]) ? lang : "en";
    safeSet("wv_lang", currentLang);
    elLangCurrent.textContent = currentLang.toUpperCase();
    document.documentElement.lang = currentLang;
    document.documentElement.dir = RTL_LANGS.indexOf(currentLang) !== -1 ? "rtl" : "ltr";
    applyI18n();
    renderLangMenu();
    renderCards();
  }

  function renderLangMenu() {
    elLangMenu.textContent = "";
    LANG_CODES.forEach(function (code) {
      var btn = document.createElement("button");
      btn.textContent = LANG_NAMES[code];
      if (code === currentLang) btn.className = "active";
      btn.addEventListener("click", function () {
        setLang(code);
        elLangMenu.hidden = true;
        elLangBtn.setAttribute("aria-expanded", "false");
      });
      elLangMenu.appendChild(btn);
    });
  }

  function applyI18n() {
    document.title = t("app_title");
    document.getElementById("app-title").textContent = t("app_title");
    document.getElementById("app-subtitle").textContent = t("app_subtitle");
    elSearch.placeholder = t("search_placeholder");
    elTranslateBtn.textContent = t("need_another_language");
    document.getElementById("translate-title").textContent = t("translate_title");
    document.getElementById("translate-body").textContent = t("translate_body");
    elTranslateClose.textContent = t("translate_close");
    document.getElementById("footer-text").textContent = t("footer_text");
    elBackToTop.setAttribute("aria-label", t("back_to_top"));
    elLangBtn.setAttribute("aria-label", t("language_menu"));
    renderRegionButtons();
  }

  /* ── Region buttons ────────────────────────────────────────── */
  function renderRegionButtons() {
    elRegionButtons.textContent = "";
    var regions = [
      ["all", "region_all"], ["Africa", "region_africa"], ["Americas", "region_americas"],
      ["Asia", "region_asia"], ["Europe", "region_europe"], ["Oceania", "region_oceania"]
    ];
    regions.forEach(function (r) {
      var btn = document.createElement("button");
      btn.textContent = t(r[1]);
      btn.dataset.region = r[0];
      if (r[0] === currentRegion) btn.className = "active";
      btn.addEventListener("click", function () {
        currentRegion = r[0];
        renderRegionButtons();
        renderCards();
      });
      elRegionButtons.appendChild(btn);
    });
  }

  /* ── Theme ─────────────────────────────────────────────────── */
  function initTheme() {
    var saved = safeGet("wv_theme");
    if (saved === "dark") setTheme("dark");
    else if (saved === "light") setTheme("light");
    else {
      try {
        var prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefers ? "dark" : "light");
      } catch (e) { setTheme("light"); }
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    safeSet("wv_theme", theme);
    var isDark = theme === "dark";
    elThemeIcon.textContent = isDark ? "☀️" : "🌙";
    elThemeBtn.setAttribute("aria-label", isDark ? t("light_mode") : t("dark_mode"));
  }

  /* ── Favorites ─────────────────────────────────────────────── */
  function loadFavorites() {
    try {
      var raw = localStorage.getItem("wv_favs");
      favorites = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(favorites)) favorites = [];
    } catch (e) { favorites = []; }
  }

  function saveFavorites() {
    try { localStorage.setItem("wv_favs", JSON.stringify(favorites)); } catch (e) {}
  }

  function toggleFav(country) {
    var idx = favorites.indexOf(country);
    if (idx !== -1) favorites.splice(idx, 1);
    else favorites.push(country);
    saveFavorites();
    renderCards();
  }

  /* ── Search ────────────────────────────────────────────────── */
  function handleSearch() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      searchQuery = elSearch.value.trim();
      renderCards();
    }, 150);
  }

  /* ── Filtering ─────────────────────────────────────────────── */
  function getFiltered() {
    var q = normalize(searchQuery);
    var list = window.JUNI_VISA_COUNTRIES.filter(function (c) {
      if (currentRegion !== "all" && c.region !== currentRegion) return false;
      if (!q) return true;
      var enName = normalize(c.country);
      if (enName.indexOf(q) !== -1) return true;
      var translated = getCountryName(c.country, currentLang);
      if (translated && normalize(translated).indexOf(q) !== -1) return true;
      return false;
    });

    // Sort: favorites first, then names starting with query first
    list.sort(function (a, b) {
      var af = favorites.indexOf(a.country) !== -1 ? 0 : 1;
      var bf = favorites.indexOf(b.country) !== -1 ? 0 : 1;
      if (af !== bf) return af - bf;
      if (q) {
        var as = normalize(a.country).startsWith(q) ? 0 : 1;
        var bs = normalize(b.country).startsWith(q) ? 0 : 1;
        if (as !== bs) return as - bs;
      }
      return a.country.localeCompare(b.country);
    });

    return list;
  }

  /* ── Render cards ──────────────────────────────────────────── */
  function renderCards() {
    var list = getFiltered();
    elCards.textContent = "";

    if (list.length === 0) {
      elNoResults.hidden = false;
      elNoResults.textContent = t("no_results");
      elResultsCount.textContent = "";
      return;
    }

    elNoResults.hidden = true;
    elResultsCount.textContent = tFmt("results_count", list.length);

    list.forEach(function (c) {
      elCards.appendChild(createCard(c));
    });
  }

  function createCard(c) {
    var card = document.createElement("div");
    card.className = "card";

    // Header: flag + names + star
    var header = document.createElement("div");
    header.className = "card-header";

    var flag = document.createElement("span");
    flag.className = "card-flag";
    flag.textContent = c.flag;
    flag.setAttribute("aria-hidden", "true");

    var names = document.createElement("div");
    names.className = "card-names";

    var translated = getCountryName(c.country, currentLang);
    var nameEl = document.createElement("div");
    nameEl.className = "card-name";
    nameEl.textContent = translated || c.country;

    var enEl = document.createElement("div");
    enEl.className = "card-name-en";
    enEl.textContent = c.country;

    names.appendChild(nameEl);
    names.appendChild(enEl);

    var star = document.createElement("button");
    star.className = "star-btn";
    var isFav = favorites.indexOf(c.country) !== -1;
    if (isFav) star.classList.add("active");
    star.setAttribute("aria-label", isFav ? t("star_remove") : t("star_add"));
    star.addEventListener("click", function () { toggleFav(c.country); });
    var starIcon = document.createElement("span");
    starIcon.className = "star";
    starIcon.textContent = "★";
    star.appendChild(starIcon);

    header.appendChild(flag);
    header.appendChild(names);
    header.appendChild(star);
    card.appendChild(header);

    // Note
    var note = document.createElement("p");
    note.className = "card-note";
    note.textContent = t("check_official_site");
    card.appendChild(note);

    // Link button
    var safe = safeUrl(c.visa_apply_url);
    if (safe) {
      var link = document.createElement("a");
      link.className = "card-link";
      link.textContent = t("open_visa_page");
      link.href = safe;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.appendChild(link);
    } else {
      var noLink = document.createElement("span");
      noLink.className = "card-link";
      noLink.style.background = "var(--text-muted)";
      noLink.style.cursor = "default";
      noLink.textContent = "verify needed";
      card.appendChild(noLink);
    }

    // "Link not working?" → Google search
    var broken = document.createElement("button");
    broken.className = "card-broken-link";
    broken.textContent = t("link_not_working");
    broken.addEventListener("click", function () {
      var searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(c.country + " visa official government website");
      window.open(searchUrl, "_blank", "noopener,noreferrer");
    });
    card.appendChild(broken);

    return card;
  }

  /* ── Back to top ───────────────────────────────────────────── */
  function handleScroll() {
    elBackToTop.hidden = window.scrollY < 300;
  }

  /* ── Event listeners ───────────────────────────────────────── */
  elSearch.addEventListener("input", handleSearch);
  elSearch.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      elSearch.value = "";
      searchQuery = "";
      renderCards();
    }
  });

  elThemeBtn.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  elLangBtn.addEventListener("click", function () {
    var isOpen = !elLangMenu.hidden;
    elLangMenu.hidden = isOpen;
    elLangBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", function (e) {
    if (!elLangMenu.hidden && !elLangBtn.contains(e.target) && !elLangMenu.contains(e.target)) {
      elLangMenu.hidden = true;
      elLangBtn.setAttribute("aria-expanded", "false");
    }
  });

  elTranslateBtn.addEventListener("click", function () {
    elTranslateDialog.showModal();
  });

  elTranslateClose.addEventListener("click", function () {
    elTranslateDialog.close();
  });

  elBackToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ── Init ──────────────────────────────────────────────────── */
  loadFavorites();
  currentLang = detectLang();
  initTheme();
  elLangCurrent.textContent = currentLang.toUpperCase();
  document.documentElement.lang = currentLang;
  document.documentElement.dir = RTL_LANGS.indexOf(currentLang) !== -1 ? "rtl" : "ltr";
  applyI18n();
  renderLangMenu();
  renderCards();
})();
