import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

import {
  parseCollection,
  validateCollection,
  renderCollectionMarkdown,
  renderLlmsTxt,
  replaceMarked,
  countByCategory,
} from "../scripts/lib.mjs";

const real = JSON.parse(readFileSync(new URL("../data/collection.json", import.meta.url), "utf8"));

const sample = {
  categories: [
    { id: "hubs", title: "Hubs & Marketplaces", blurb: "Browse here." },
    { id: "build", title: "Build Your Own", blurb: "Make things." },
  ],
  entries: [
    { id: "a", name: "Alpha", url: "https://a.example", category: "hubs", platforms: ["Web"], blurb: "First entry." },
    { id: "b", name: "Beta", url: "https://b.example", category: "build", platforms: ["Game Boy"], blurb: "Second entry." },
    { id: "c", name: "Gamma", url: "https://c.example", category: "hubs", platforms: ["NES"], blurb: "Third entry." },
  ],
};

test("the shipped collection passes validation", () => {
  assert.deepEqual(validateCollection(real), []);
});

test("validation rejects duplicate ids", () => {
  const bad = structuredClone(sample);
  bad.entries[1].id = "a";
  const errors = validateCollection(bad);
  assert.ok(errors.some((e) => e.includes("duplicate id") && e.includes('"a"')));
});

test("validation rejects unknown categories", () => {
  const bad = structuredClone(sample);
  bad.entries[0].category = "nope";
  assert.ok(validateCollection(bad).some((e) => e.includes("unknown category")));
});

test("validation rejects non-https urls", () => {
  const bad = structuredClone(sample);
  bad.entries[0].url = "http://a.example";
  assert.ok(validateCollection(bad).some((e) => e.includes("https")));
});

test("validation rejects duplicate urls", () => {
  const bad = structuredClone(sample);
  bad.entries[1].url = bad.entries[0].url;
  assert.ok(validateCollection(bad).some((e) => e.includes("duplicate url")));
});

test("validation rejects empty platforms and blank blurbs", () => {
  const bad = structuredClone(sample);
  bad.entries[0].platforms = [];
  bad.entries[1].blurb = "  ";
  const errors = validateCollection(bad);
  assert.ok(errors.some((e) => e.includes("platforms")));
  assert.ok(errors.some((e) => e.includes("blurb")));
});

test("validation rejects em and en dashes in copy", () => {
  const bad = structuredClone(sample);
  bad.entries[0].blurb = "Fast — and good.";
  bad.categories[0].blurb = "Range 1–2.";
  const errors = validateCollection(bad);
  assert.equal(errors.filter((e) => e.includes("dash")).length, 2);
});

test("validation rejects empty categories", () => {
  const bad = structuredClone(sample);
  bad.entries = bad.entries.filter((e) => e.category !== "build");
  assert.ok(validateCollection(bad).some((e) => e.includes("no entries")));
});

test("markdown follows the awesome list line format", () => {
  const md = renderCollectionMarkdown(sample);
  assert.match(md, /^### Hubs & Marketplaces$/m);
  assert.match(md, /^- \[\*\*Alpha\*\*\]\(https:\/\/a\.example\) - First entry\.$/m);
  assert.ok(md.indexOf("### Hubs & Marketplaces") < md.indexOf("### Build Your Own"));
  assert.ok(md.indexOf("Alpha") < md.indexOf("Gamma"), "entries keep file order inside a category");
});

test("markdown includes each category blurb under its heading", () => {
  const md = renderCollectionMarkdown(sample);
  assert.match(md, /### Hubs & Marketplaces\n\nBrowse here\.\n\n- /);
});

test("llms.txt lists every entry with its category and url", () => {
  const txt = renderLlmsTxt(sample, { siteUrl: "https://example.dev/", repoUrl: "https://github.com/x/y" });
  assert.match(txt, /^# Awesome Homebrew Games/);
  for (const e of sample.entries) {
    assert.ok(txt.includes(e.url), `missing ${e.url}`);
    assert.ok(txt.includes(e.name), `missing ${e.name}`);
  }
  assert.match(txt, /## Hubs & Marketplaces/);
  assert.ok(txt.includes("https://github.com/x/y"));
});

test("replaceMarked swaps only the marked block", () => {
  const src = "before\n<!-- BEGIN:x -->\nold\n<!-- END:x -->\nafter\n";
  const out = replaceMarked(src, "x", "new");
  assert.equal(out, "before\n<!-- BEGIN:x -->\nnew\n<!-- END:x -->\nafter\n");
});

test("replaceMarked throws when markers are missing", () => {
  assert.throws(() => replaceMarked("nothing here", "x", "new"), /markers/i);
});

test("countByCategory totals match the entry count", () => {
  const counts = countByCategory(sample);
  assert.equal(counts.hubs, 2);
  assert.equal(counts.build, 1);
  const total = Object.values(countByCategory(real)).reduce((a, b) => a + b, 0);
  assert.equal(total, real.entries.length);
});

// ---- hardening: malformed input must produce messages, never a crash ----

test("validation reports malformed top-level shapes instead of throwing", () => {
  for (const bad of [null, undefined, {}, [], { categories: {}, entries: [] }, { categories: [], entries: "x" }]) {
    const errors = validateCollection(bad);
    assert.ok(errors.length > 0, `expected errors for ${JSON.stringify(bad)}`);
  }
});

test("validation reports malformed entries instead of throwing", () => {
  const bad = structuredClone(sample);
  bad.entries.push(null, "text", { id: "n", name: 5, url: 7, category: "hubs", platforms: [1, ""], blurb: 3 });
  const errors = validateCollection(bad);
  assert.ok(errors.length >= 3);
});

test("validation rejects duplicate category ids", () => {
  const bad = structuredClone(sample);
  bad.categories.push({ id: "hubs", title: "Again", blurb: "Dupe." });
  assert.ok(validateCollection(bad).some((e) => e.includes("duplicate category id")));
});

test("validation requires slug ids for categories and entries", () => {
  const bad = structuredClone(sample);
  bad.categories[0].id = "x y";
  bad.entries[0].id = "Has Space";
  bad.entries[0].category = "x y";
  const errors = validateCollection(bad);
  assert.ok(errors.some((e) => e.includes("slug") && e.includes("category")));
  assert.ok(errors.some((e) => e.includes("slug") && e.includes("entry")));
});

test("validation requires trimmed non-empty platform strings", () => {
  const bad = structuredClone(sample);
  bad.entries[0].platforms = [" NES", "", 4];
  assert.ok(validateCollection(bad).some((e) => e.includes("platform")));
});

test("validation flags platform spellings that differ only by case or spacing", () => {
  const bad = structuredClone(sample);
  bad.entries[0].platforms = ["Game Boy"];
  bad.entries[1].platforms = ["GameBoy"];
  assert.ok(validateCollection(bad).some((e) => e.includes("conflicts with")));
});

test("validation rejects markdown-breaking characters in names, blurbs and urls", () => {
  const bad = structuredClone(sample);
  bad.entries[0].name = "Bad]Name";
  bad.entries[1].blurb = "Line one\n## injected";
  bad.entries[2].url = "https://c.example/a)b";
  const errors = validateCollection(bad);
  assert.equal(errors.filter((e) => e.includes("markdown")).length, 3);
});

test("parseCollection explains invalid JSON", () => {
  assert.throws(() => parseCollection("{ nope", "data/collection.json"), /data\/collection\.json is not valid JSON/);
  assert.deepEqual(parseCollection('{"a":1}', "x"), { a: 1 });
});

// ---- replaceMarked ----

test("replaceMarked looks for END after BEGIN", () => {
  const src = "docs mention <!-- END:x --> early\n<!-- BEGIN:x -->\nold\n<!-- END:x -->\n";
  const out = replaceMarked(src, "x", "new");
  assert.ok(out.endsWith("<!-- BEGIN:x -->\nnew\n<!-- END:x -->\n"));
});

test("replaceMarked refuses duplicate marker pairs", () => {
  const src = "<!-- BEGIN:x -->\na\n<!-- END:x -->\n<!-- BEGIN:x -->\nb\n<!-- END:x -->\n";
  assert.throws(() => replaceMarked(src, "x", "new"), /more than once/i);
});

// ---- llms.txt grouping ----

test("llms.txt groups entries under their own category and lists platforms", () => {
  const txt = renderLlmsTxt(sample, { siteUrl: "https://example.dev/", repoUrl: "https://github.com/x/y" });
  const hubs = txt.slice(txt.indexOf("## Hubs & Marketplaces"), txt.indexOf("## Build Your Own"));
  assert.ok(hubs.includes("Alpha") && hubs.includes("Gamma") && !hubs.includes("Beta"));
  assert.match(txt, /\[Beta\]\(https:\/\/b\.example\) \(Game Boy\): Second entry\./);
});

// ---- sprite determinism (identity motif) ----

function loadSprite() {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(new URL("../site/js/sprite.js", import.meta.url), "utf8"), sandbox);
  return sandbox.window.AHG.sprite;
}

test("sprite: same seed gives the same creature, different seeds differ", () => {
  const sprite = loadSprite();
  assert.equal(sprite.svg("itch-io"), sprite.svg("itch-io"));
  assert.notEqual(sprite.svg("itch-io"), sprite.svg("gamejolt"));
});

test("sprite: markup carries only numbers and palette colors", () => {
  const sprite = loadSprite();
  const markup = sprite.svg("<script>alert(1)</script>");
  assert.ok(!markup.includes("script"));
  const colors = markup.match(/#[0-9a-fA-F]{6}/g) ?? [];
  const allowed = new Set([...sprite.colors, "#0b0b0b"].map((c) => c.toLowerCase()));
  assert.ok(colors.every((c) => allowed.has(c.toLowerCase())));
});
