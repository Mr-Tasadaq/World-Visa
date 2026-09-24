/*
 * check-links.mjs — Node 22 script
 * Tests all 195 visa links and writes link-report.csv
 * Usage: node check-links.mjs
 * "verify needed" entries are skipped (reported as SKIP)
 */
import { writeFile } from "node:fs/promises";

// Inline the country data so this script is self-contained
const COUNTRIES = [
  // This will be loaded from countries.js at runtime
];

// Load countries.js in a Node context
import { readFileSync } from 'node:fs';
const countriesSrc = readFileSync(new URL('./countries.js', import.meta.url), 'utf-8');
const window = {};
eval(countriesSrc);
const allCountries = window.JUNI_VISA_COUNTRIES;

const TIMEOUT = 15000;
const CONCURRENCY = 10;

async function checkUrl(url) {
  if (url === 'verify needed' || !url.startsWith('http')) {
    return { status: 'SKIP', code: 0, note: 'No URL (verify needed)' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    return { status: res.ok ? 'OK' : 'FAIL', code: res.status, note: res.statusText };
  } catch (err) {
    if (err.name === 'AbortError') return { status: 'TIMEOUT', code: 0, note: 'Request timed out' };
    return { status: 'ERROR', code: 0, note: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  console.log(`Testing ${allCountries.length} country links...\n`);
  const results = [];

  // Process in batches for concurrency control
  for (let i = 0; i < allCountries.length; i += CONCURRENCY) {
    const batch = allCountries.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (c) => {
        const r = await checkUrl(c.visa_apply_url);
        return { country: c.country, region: c.region, url: c.visa_apply_url, ...r };
      })
    );
    results.push(...batchResults);

    // Progress
    batchResults.forEach((r) => {
      const flag = r.status === 'OK' ? '✓' : r.status === 'SKIP' ? '–' : '✗';
      console.log(`${flag} [${r.status}] ${r.code || ''} ${r.country}`);
    });
  }

  // Write CSV
  const header = 'country,region,url,status,code,note\n';
  const rows = results.map((r) => {
    const note = (r.note || '').replace(/"/g, '""');
    return `"${r.country}","${r.region}","${r.url}","${r.status}","${r.code}","${note}"`;
  });
  await writeFile('link-report.csv', header + rows.join('\n') + '\n', 'utf-8');

  // Summary
  const ok = results.filter((r) => r.status === 'OK').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const err = results.filter((r) => r.status === 'ERROR').length;
  const timeout = results.filter((r) => r.status === 'TIMEOUT').length;
  const skip = results.filter((r) => r.status === 'SKIP').length;

  console.log('\n─── Summary ───');
  console.log(`OK:      ${ok}`);
  console.log(`FAIL:    ${fail} (includes 403 — test by hand on phone)`);
  console.log(`ERROR:   ${err}`);
  console.log(`TIMEOUT: ${timeout}`);
  console.log(`SKIP:    ${skip} (verify needed)`);
  console.log(`Total:   ${results.length}`);
  console.log('\nReport written to link-report.csv');

  // List failures for easy review
  const problems = results.filter((r) => r.status !== 'OK' && r.status !== 'SKIP');
  if (problems.length > 0) {
    console.log('\n─── Problems ───');
    problems.forEach((r) => {
      console.log(`  [${r.status} ${r.code}] ${r.country} — ${r.url}`);
    });
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
