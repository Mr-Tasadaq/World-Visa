# World Visa — Development Notes

## What this is
A static web app (no build step, no server, no API keys). Lists 195 countries with official visa links.

## Running locally
```bash
docker compose -f docker-compose.base44.yml up -d
# App is served on http://localhost:3000
```

## File overview
- `countries.js` — 195 countries: `{flag, country, region, visa_apply_url}`. Regions: Africa 54, Americas 35, Asia 48, Europe 44, Oceania 14
- `i18n.js` — 5 languages (en, ur, ar, hi, fr)
- `i18n-more.js` — 20 more languages (es, pt, ru, zh, bn, tr, id, de, fa, sw, it, ja, ko, vi, th, nl, pl, uk, tl, ta)
- `app.js` — search, region filter, favorites, theme, language, cards, dialog
- `index.html` — page layout
- `styles.css` — light/dark themes, RTL, cards
- `check-links.mjs` — Node 22 script: `node check-links.mjs` → writes `link-report.csv`
- `lang-test.html` — shows all i18n keys in all 25 languages, highlights missing

## Key decisions
- Cyprus, Armenia, Azerbaijan, Georgia → Asia
- "verify needed" in `visa_apply_url` means the official URL is not yet confirmed
- Logo is SVG (`world-visa-logo.svg`), not .webp
- Country names at runtime come from `Intl.DisplayNames` (browser API); countries.js stores English names only

## Security rules
- `textContent` only, never `innerHTML`, for any data
- All links go through `safeUrl()` (http/https only), with `target="_blank"` + `rel="noopener noreferrer"`
- `localStorage` reads/writes inside try/catch
- No inline scripts, no trackers, no API keys

## Open items
1. Run `check-links.mjs` → fix bad links in groups of ~20
2. Optional: add `type` (e-visa/embassy/info) and `last_checked` badges
3. Native speaker review of translations (Urdu, Arabic, Hindi, Farsi first)
4. Screen-reader labels translated beyond French
5. Plural forms in Russian, Ukrainian, Polish
6. Deploy (GitHub Pages or Vercel)
