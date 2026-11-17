#!/usr/bin/env node
// Deterministic duplicate and validation check for a candidate entry.
//   node check-entry.mjs --repo . --url "https://example.com"
//   cat entry.json | node check-entry.mjs --repo .
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : args[i + 1];
};
const repo = resolve(flag("repo") || process.cwd());
const urlFlag = flag("url");

function normalizeUrl(input) {
  try {
    const u = new URL(input);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (/^utm_|^ref$|^source$/.test(key)) u.searchParams.delete(key);
    }
    return `${u.origin}${u.pathname.replace(/\/$/, "")}${u.search}`;
  } catch { return null; }
}

const collection = JSON.parse(readFileSync(join(repo, "data/collection.json"), "utf8"));
const lib = await import(pathToFileURL(join(repo, "scripts/lib.mjs")).href);

function findDuplicates(url, entries, excludeId) {
  const key = normalizeUrl(url);
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  const exact = entries.filter((e) => e.id !== excludeId && e.url.replace(/\/$/, "") === url.replace(/\/$/, ""));
  const normalized = entries.filter((e) => e.id !== excludeId && normalizeUrl(e.url) === key);
  const onHost = entries.filter((e) => e.id !== excludeId && new URL(e.url).hostname.replace(/^www\./, "") === host);
  return { exact, normalized, onHost };
}

function showDuplicates(url) {
  const d = findDuplicates(url, collection.entries);
  console.log(`URL: ${url}`);
  console.log(`exact: ${d.exact.map((e) => e.id).join(", ") || "none"}`);
  console.log(`normalized: ${d.normalized.map((e) => e.id).join(", ") || "none"}`);
  console.log(`same host: ${d.onHost.map((e) => `${e.id} (${e.url})`).join(", ") || "none"}`);
}

if (urlFlag) {
  showDuplicates(urlFlag);
  process.exit(0);
}

let entry;
try {
  entry = JSON.parse(readFileSync(0, "utf8"));
} catch {
  console.error("Expected a single JSON entry on stdin, or pass --url.");
  process.exit(2);
}

const problems = [];
if (!entry || typeof entry !== "object") problems.push("entry must be a JSON object");
if (!problems.length) {
  const d = findDuplicates(entry.url, collection.entries, entry.id);
  if (d.exact.length) problems.push(`exact URL duplicate of ${d.exact.map((e) => e.id).join(", ")}`);
  if (d.normalized.length) problems.push(`normalized URL duplicate of ${d.normalized.map((e) => e.id).join(", ")}`);
  const nameMatch = collection.entries.find((e) => e.id !== entry.id && e.name.toLowerCase() === String(entry.name || "").toLowerCase());
  if (nameMatch) problems.push(`name already used by ${nameMatch.id}`);
  const errors = lib.validateCollection({ categories: collection.categories, entries: [...collection.entries, entry] });
  problems.push(...errors.filter((e) => e.includes(`"${entry.id}`)));
}

if (problems.length) {
  console.error("PROBLEMS");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const one = { categories: collection.categories, entries: [entry] };
const md = lib.renderCollectionMarkdown(one).split("\n").find((line) => line.startsWith("- "));
const txt = lib.renderLlmsTxt(one, {
  siteUrl: "https://enzovezzaro.github.io/awesome-homebrew-games/",
  repoUrl: "https://github.com/EnzoVezzaro/awesome-homebrew-games",
}).split("\n").find((line) => line.startsWith("- "));
console.log("OK. No duplicate URL or name, validation passed.");
console.log(`README: ${md}`);
console.log(`llms.txt: ${txt}`);
