const all = Array.isArray(window.JUNI_VISA_COUNTRIES) ? window.JUNI_VISA_COUNTRIES : [];
const $ = id => document.getElementById(id);
const grid = $("grid"), search = $("search"), clearBtn = $("clear"), count = $("count");
const empty = $("empty"), regionsEl = $("regions"), themeBtn = $("theme"), topBtn = $("top"), langSel = $("lang"), installBtn = $("install");
const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];
let region = "All", timer, lang = "en", deferredInstallPrompt = null;

function load(k) { try { return localStorage.getItem(k); } catch { return null; } }
function save(k, v) { try { localStorage.setItem(k, v); } catch {} }

let favs;
try { favs = new Set(JSON.parse(load("wv_favs") || "[]")); } catch { favs = new Set(); }

// ---------- install ----------\naddEventListener("beforeinstallprompt", e => {\n  e.preventDefault();\n  deferredInstallPrompt = e;\n  installBtn.hidden = false;\n});\ninstallBtn.addEventListener("click", async () => {\n  if (!deferredInstallPrompt) return;\n  deferredInstallPrompt.prompt();\n  try { await deferredInstallPrompt.userChoice; } catch {}\n  deferredInstallPrompt = null;\n  installBtn.hidden = true;\n});\naddEventListener("appinstalled", () => {\n  deferredInstallPrompt = null;\n  installBtn.hidden = true;\n});\n\n// ---------- language ----------
const t = (key, vars = {}) => {
  let s = (WV_I18N[lang] || {})[key] ?? WV_I18N.en[key];
  if (typeof s !== "string") return s;
  for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
};

function fmtCount(s, n) {
  const f = s.split("|");
  let i = 0;
  if (f.length === 2) i = n === 1 ? 0 : 1;
  if (f.length === 3) { const c = new Intl.PluralRules(lang).select(n); i = c === "one" ? 0 : c === "few" ? 1 : 2; }
  return f[i].replace("{n}", n);
}

const codeOf = flag => [...flag].map(ch => String.fromCharCode(ch.codePointAt(0) - 0x1F1E6 + 65)).join("");
all.forEach(x => { x.code = codeOf(x.flag); });

const nameCache = {};
function localName(x) {
  if (lang === "en") return x.country;
  try {
    nameCache[lang] ||= new Intl.DisplayNames([lang], { type: "region" });
    const n = nameCache[lang].of(x.code);
    return n && n !== x.code ? n : x.country;
  } catch { return x.country; }
}

const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const safeUrl = v => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : "#"; } catch { return "#"; } };
const rank = (name, q) => {
  const n = norm(name);
  if (n.startsWith(q)) return 0;
  return n.split(/[\s'-]+/).some(w => w.startsWith(q)) ? 1 : 2;
};

// ---------- cards ----------
function card(x) {
  const local = x.local;
  const el = document.createElement("article");
  el.className = "card";

  const top = document.createElement("div");
  top.className = "country";
  const flagEl = document.createElement("div");
  flagEl.className = "flag";
  flagEl.textContent = x.flag;
  const info = document.createElement("div");
  info.style.minWidth = "0";
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = local;
  info.append(name);
  if (local !== x.country) {
    const en = document.createElement("div");
    en.className = "en";
    en.dir = "ltr";
    en.textContent = x.country;
    info.append(en);
  }
  const url = document.createElement("div");
  url.className = "url";
  url.dir = "ltr";
  url.textContent = x.visa_apply_url;
  info.append(url);

  const star = document.createElement("button");
  star.type = "button";
  star.className = "star";
  const paint = () => {
    const on = favs.has(x.country);
    star.textContent = on ? "★" : "☆";
    star.setAttribute("aria-pressed", on);
    star.setAttribute("aria-label", t(on ? "favRemove" : "favAdd", { c: local }));
  };
  paint();
  star.addEventListener("click", () => {
    favs.has(x.country) ? favs.delete(x.country) : favs.add(x.country);
    save("wv_favs", JSON.stringify([...favs]));
    paint();
  });
  top.append(flagEl, info, star);

  const a = document.createElement("a");
  a.className = "apply";
  a.href = safeUrl(x.visa_apply_url);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = t("apply");
  a.setAttribute("aria-label", t("openAria", { c: local }));

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = t("note");

  const help = document.createElement("a");
  help.className = "help";
  help.href = "https://www.google.com/search?q=" + encodeURIComponent(x.country + " visa official government website");
  help.target = "_blank";
  help.rel = "noopener noreferrer";
  help.textContent = t("help");

  el.append(top, a, note, help);
  return el;
}

function render() {
  const raw = search.value.trim();
  const q = norm(raw);
  all.forEach(x => { x.local = localName(x); });
  const items = all
    .filter(x => (region === "All" || x.region === region) &&
      (!q || norm(x.country).includes(q) || norm(x.local).includes(q)))
    .sort((a, b) =>
      (favs.has(b.country) - favs.has(a.country)) ||
      (q ? Math.min(rank(a.country, q), rank(a.local, q)) - Math.min(rank(b.country, q), rank(b.local, q)) : 0) ||
      a.local.localeCompare(b.local, lang));

  grid.replaceChildren(...items.map(card));
  const c = t("count");
  count.textContent = typeof c === "function" ? c(items.length) : fmtCount(c, items.length);
  empty.hidden = items.length !== 0;
  empty.textContent = q ? t("emptyFor", { q: raw }) : t("empty");
}

// ---------- static text ----------
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = WV_RTL.includes(lang) ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  regionsEl.querySelectorAll(".chip").forEach(c => { c.textContent = t("r_" + c.dataset.r.toLowerCase()); });
  setTheme(document.documentElement.dataset.theme);
  render();
}

function buildLangSelect() {
  Object.entries(WV_LANGS).forEach(([code, label]) => {
    const o = document.createElement("option");
    o.value = code;
    o.textContent = label;
    langSel.append(o);
  });
  langSel.addEventListener("change", () => { lang = langSel.value; save("wv_lang", lang); applyLang(); });
}

function buildChips() {
  REGIONS.forEach(r => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.r = r;
    b.setAttribute("aria-pressed", r === region);
    b.addEventListener("click", () => {
      region = r;
      regionsEl.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.r === r));
      render();
    });
    regionsEl.append(b);
  });
}

function setTheme(th) {
  document.documentElement.dataset.theme = th;
  themeBtn.textContent = th === "dark" ? "☀" : "☾";
  themeBtn.setAttribute("aria-label", t(th === "dark" ? "toLight" : "toDark"));
}
themeBtn.addEventListener("click", () => {
  const th = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(th);
  save("wv_theme", th);
});

search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 150); });
search.addEventListener("keydown", e => { if (e.key === "Escape") { search.value = ""; render(); } });
clearBtn.addEventListener("click", () => { search.value = ""; search.focus(); render(); });
addEventListener("scroll", () => { topBtn.hidden = scrollY < 600; }, { passive: true });
topBtn.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

$("tipbtn").addEventListener("click", () => $("tipdlg").showModal());
$("tipclose").addEventListener("click", () => $("tipdlg").close());

// ---------- start ----------
const saved = load("wv_lang");
const phone = (navigator.language || "en").slice(0, 2);
lang = WV_LANGS[saved] ? saved : WV_LANGS[phone] ? phone : "en";
document.documentElement.dataset.theme = load("wv_theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
buildLangSelect();
langSel.value = lang;
buildChips();
applyLang();
