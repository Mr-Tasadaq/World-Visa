// Run: node check-links.mjs      (needs Node 22, internet)
// Optional: node check-links.mjs Pakistan   (test one country)
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { window: {} };
vm.runInNewContext(readFileSync("countries.js", "utf8"), ctx);
const only = process.argv[2]?.toLowerCase();
const list = ctx.window.JUNI_VISA_COUNTRIES.filter(x => !only || x.country.toLowerCase().includes(only));

const UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36";

async function ping(url, method) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 15000);
  try {
    return await fetch(url, { method, redirect: "follow", signal: c.signal, headers: { "User-Agent": UA } });
  } finally { clearTimeout(t); }
}

async function check({ country, visa_apply_url: url }) {
  try {
    let r = await ping(url, "HEAD");
    if (r.status >= 400) r = await ping(url, "GET");
    const s = r.status;
    const status = s < 400 ? "OK" : (s === 403 || s === 429) ? "BLOCKED (test in phone browser)" : "BROKEN";
    return { country, url, code: s, status };
  } catch (e) {
    const why = e.name === "AbortError" ? "TIMEOUT" : "UNVERIFIED " + (e.cause?.code || e.message);
    return { country, url, code: "", status: why };
  }
}

const results = [];
let i = 0;
async function worker() {
  while (i < list.length) {
    const item = list[i++];
    const r = await check(item);
    results.push(r);
    console.log(`${String(results.length).padStart(3)}/${list.length}  ${r.status.padEnd(12)} ${r.country}`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

results.sort((a, b) => a.country.localeCompare(b.country));
const q = s => `"${String(s).replaceAll('"', '""')}"`;
writeFileSync("link-report.csv",
  "country,status,code,url
" + results.map(r => [r.country, r.status, r.code, r.url].map(q).join(",")).join("
"));

const bad = results.filter(r => r.status !== "OK");
console.log(`
OK: ${results.length - bad.length}   Need fixing/testing: ${bad.length}`);
bad.forEach(r => console.log(`- ${r.country}: ${r.status} ${r.code} ${r.url}`));
const hardFailures = results.filter(r => r.status === "BROKEN" || r.status === "ERROR" || r.status === "TIMEOUT");
console.log(`
Hard failures: ${hardFailures.length}`);
hardFailures.forEach(r => console.log(`- ${r.country}: ${r.status} ${r.code} ${r.url}`));
console.log("
Full list saved in link-report.csv");
if (hardFailures.length) process.exitCode = 1;
