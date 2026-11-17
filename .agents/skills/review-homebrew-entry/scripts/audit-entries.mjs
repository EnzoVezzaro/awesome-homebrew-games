#!/usr/bin/env node
// Mechanical audit of data/collection.json. Reports issues, never edits files.
//   node audit-entries.mjs --repo . [--out report.md]
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : args[i + 1];
};
const repo = resolve(flag("repo") || process.cwd());
const out = flag("out");

const collection = JSON.parse(readFileSync(join(repo, "data/collection.json"), "utf8"));
const lib = await import(pathToFileURL(join(repo, "scripts/lib.mjs")).href);

const norm = (input) => {
  try {
    const u = new URL(input);
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) if (/^utm_|^ref$|^source$/.test(k)) u.searchParams.delete(k);
    return `${u.origin}${u.pathname.replace(/\/$/, "")}${u.search}`;
  } catch { return String(input); }
};
const host = (input) => { try { return new URL(input).hostname.replace(/^www\./, ""); } catch { return ""; } };
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();

const rows = [];
const add = (entry, check, detail, suggestion) => rows.push({ name: entry.name, id: entry.id, check, detail, suggestion });

const byUrl = new Map();
const byName = new Map();
for (const e of collection.entries) {
  const key = norm(e.url);
  if (!byUrl.has(key)) byUrl.set(key, []);
  byUrl.get(key).push(e);
  const n = String(e.name).toLowerCase();
  if (!byName.has(n)) byName.set(n, []);
  byName.get(n).push(e);
}

for (const [key, group] of byUrl) {
  if (group.length > 1) for (const e of group) add(e, "duplicate-url", key, "Merge these entries or give one a distinct URL.");
}
for (const [key, group] of byName) {
  if (group.length > 1) for (const e of group) add(e, "duplicate-name", key, "Rename one entry so names stay distinct.");
}

const platformKeys = new Map();
for (const e of collection.entries) {
  for (const p of e.platforms ?? []) {
    const k = slug(p);
    if (!platformKeys.has(k)) platformKeys.set(k, p);
    else if (platformKeys.get(k) !== p) add(e, "platform-spelling", p, `Use the existing spelling ${platformKeys.get(k)}.`);
  }
}

const countPattern = /(?<![\w-])\b\d+\s+(entries|games|places|platforms|resources|hubs|apps)\b/i;
const platformPrefix = /\b(nintendo|pico-?|game boy|atari|sega|master|zx|ps)\s*$/i;
const dashPattern = /\u2014|\u2013/;
const firstPerson = /\b(we|our|us|i|my)\b/i;
for (const e of collection.entries) {
  const text = `${e.name} ${e.blurb}`;
  if (dashPattern.test(text)) add(e, "dash", "em or en dash in copy", "Replace with a comma, colon or period.");
  const countMatch = e.blurb.match(countPattern);
  if (countMatch && !platformPrefix.test(e.blurb.slice(0, countMatch.index))) {
    add(e, "stale-count", countMatch[0], "Remove the count or date it so it cannot drift.");
  }
  if (/\bnot\b[^.]*\bbut\b/i.test(e.blurb)) add(e, "copy-pattern", "not X but Y", "Rewrite as a direct statement.");
  if (firstPerson.test(e.blurb)) add(e, "first-person", e.blurb.match(firstPerson)[0], "Use second person or no person.");
  if (/\shttps?:\/\//.test(e.blurb)) add(e, "url-in-blurb", "raw URL in blurb", "Keep links out of blurbs.")
}

const featured = collection.entries.filter((e) => e.featured === true);
if (featured.length > 3) for (const e of featured) add(e, "featured-count", `${featured.length} featured entries`, "Reserve the flag for exceptional hubs.");

const baseErrors = lib.validateCollection(collection);
const lines = [
  "# Entry audit: mechanical checks",
  "",
  `Generated: ${new Date().toISOString().slice(0, 10)}. Entries: ${collection.entries.length}.`,
  "",
  "## Summary",
  "",
  `- Mechanical issues: ${rows.length}`,
  `- Entries flagged: ${new Set(rows.map((r) => r.id)).size}`,
  `- Schema validation errors: ${baseErrors.length}`,
  "",
  "## Issues",
  "",
  "| Entry | Check | Detail | Suggestion |",
  "| --- | --- | --- | --- |",
];
for (const r of rows) lines.push(`| ${cell(r.name)} (${cell(r.id)}) | ${r.check} | ${cell(r.detail)} | ${cell(r.suggestion)} |`);
if (!rows.length) lines.push("| none | | | |");
lines.push("", "## Schema validation", "");
if (baseErrors.length) for (const e of baseErrors) lines.push(`- ${e}`);
else lines.push("- none");
lines.push("");

const report = lines.join("\n");
if (out) writeFileSync(out, report);
else console.log(report);
