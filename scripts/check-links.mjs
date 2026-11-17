#!/usr/bin/env node
// Requests every URL in data/collection.json and reports the ones that fail.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { entries } = JSON.parse(readFileSync(join(ROOT, "data/collection.json"), "utf8"));

const CONCURRENCY = 8;
const TIMEOUT_MS = 20_000;
// Sites that block scripts answer with these. They are worth a manual look, not a failure.
const SOFT = new Set([401, 403, 405, 429]);

async function probe(entry) {
  try {
    const res = await fetch(entry.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "Mozilla/5.0 (compatible; awesome-homebrew-games link check)" },
    });
    if (res.ok) return { entry, level: "ok", note: String(res.status) };
    if (SOFT.has(res.status)) return { entry, level: "soft", note: String(res.status) };
    return { entry, level: "fail", note: String(res.status) };
  } catch (error) {
    return { entry, level: "fail", note: error.cause?.code ?? error.name };
  }
}

const results = [];
const queue = [...entries];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) results.push(await probe(queue.shift()));
  }),
);

for (const level of ["fail", "soft"]) {
  const rows = results.filter((r) => r.level === level);
  if (rows.length === 0) continue;
  console.log(level === "fail" ? "\nFailed:" : "\nBlocked or rate limited (check by hand):");
  for (const r of rows) console.log(`  ${r.note.padEnd(10)} ${r.entry.name} ${r.entry.url}`);
}

const failed = results.filter((r) => r.level === "fail").length;
console.log(`\n${results.length} checked, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
