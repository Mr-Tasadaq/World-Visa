# World Visa App

Standalone static web app containing 195 countries with flags and visa application/information links.

## Run
Open `index.html` in a browser, or upload the whole folder to a static host such as GitHub Pages.

## Files
- `index.html` — app screen
- `styles.css` — styling
- `countries.js` — 195-country dataset
- `app.js` — search and rendering
- `world-visa-logo.webp` — small square logo (256px)

## Integration
Copy `countries.js` and `app.js` into your existing JUNI-AI frontend and use the same card/search pattern in the current page.

## Important
Visa portals and requirements can change. Verify the destination government's current instructions before submitting an application.

## Features
Accent-free search, region filter, favorites, dark mode, back-to-top, official-site notes. Each country has a `region` field.

## Check links
Run `node check-links.mjs` (Node 22). It tests all 195 links and saves `link-report.csv`. A 403 result may still work in a phone browser, so test those by hand.

## Languages
`i18n.js` holds English, Urdu, Arabic, Hindi and French text. Country names come from the browser (`Intl.DisplayNames`). Please have native speakers review the texts.

## 25 languages
`i18n.js` (5 languages) + `i18n-more.js` (20 more). `lang-test.html` shows all texts; `translations-review.csv` is for native speakers. Other languages: the "Need another language?" link explains the browser's built-in Translate.
