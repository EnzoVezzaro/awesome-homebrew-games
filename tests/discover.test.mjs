import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeUrl,
  extractLinks,
  filterCandidates,
  buildReport,
  githubSearchUrls,
} from "../scripts/discover.mjs";

test("githubSearchUrls paginates each query in order and stays on the API", () => {
  const urls = githubSearchUrls(["topic:3ds-homebrew", "homebrew game in:name,description"], {
    perPage: 100,
    maxPages: 3,
  });
  assert.equal(urls.length, 6);

  const parsed = urls.map((url) => new URL(url));
  assert.ok(
    parsed.every((url) => url.origin === "https://api.github.com" && url.pathname === "/search/repositories"),
  );
  assert.deepEqual(
    parsed.map((url) => url.searchParams.get("page")),
    ["1", "2", "3", "1", "2", "3"],
  );
  assert.deepEqual(
    parsed.map((url) => url.searchParams.get("q")),
    [
      "topic:3ds-homebrew",
      "topic:3ds-homebrew",
      "topic:3ds-homebrew",
      "homebrew game in:name,description",
      "homebrew game in:name,description",
      "homebrew game in:name,description",
    ],
  );
  assert.ok(parsed.every((url) => url.searchParams.get("per_page") === "100"));
});

test("githubSearchUrls defaults to ten pages and skips empty queries", () => {
  const urls = githubSearchUrls(["topic:pico-8", "  "], {});
  assert.equal(urls.length, 10);
  assert.equal(new URL(urls[0]).searchParams.get("q"), "topic:pico-8");
  assert.equal(new URL(urls[9]).searchParams.get("page"), "10");
  assert.deepEqual(githubSearchUrls([]), []);
});

test("normalizeUrl strips www, tracking params, fragment and trailing slash", () => {
  assert.equal(
    normalizeUrl("https://WWW.Example.com/path/?utm_source=news&ref=abc&keep=1#top"),
    "https://example.com/path?keep=1",
  );
  assert.equal(normalizeUrl("  http://WWW.Example.com/  "), "http://example.com");
});

test("normalizeUrl rejects non-http(s) and malformed urls", () => {
  assert.equal(normalizeUrl("mailto:someone@example.com"), null);
  assert.equal(normalizeUrl("javascript:alert(1)"), null);
  assert.equal(normalizeUrl("not a url"), null);
  assert.equal(normalizeUrl(""), null);
});

test("extractLinks resolves relative urls, decodes entities and ignores dead links", () => {
  const html = [
    `<a href="/a?x=1&amp;y=2">Alpha &amp; Beta</a>`,
    `<a href='https://other.test/page'>Tom &#39;s &quot;game&quot;</a>`,
    `<a href="mailto:x@y.z">Mail</a>`,
    `<a href="#top">Top</a>`,
    `<a href="javascript:void(0)">JS</a>`,
  ].join("\n");
  const links = extractLinks(html, "https://example.com/base/page");

  assert.equal(links.length, 2);
  assert.equal(links[0].url, "https://example.com/a?x=1&y=2");
  assert.equal(links[0].title, "Alpha & Beta");
  assert.equal(links[1].url, "https://other.test/page");
  assert.equal(links[1].title, `Tom 's "game"`);
});

test("filterCandidates drops known, seen, duplicate, noise, seed-host and non-keyword links", () => {
  const candidates = [
    { url: "https://www.Good.test/homebrew-games?utm_source=x", title: "Homebrew Game Hub", source: "html" },
    { url: "https://known.test/homebrew", title: "Known entry", source: "html" },
    { url: "https://seen.test/retro", title: "Seen retro game", source: "html" },
    { url: "https://good.test/homebrew-games?utm_source=x", title: "Duplicate", source: "hn" },
    { url: "https://youtube.com/watch?v=retro", title: "Retro video", source: "html" },
    { url: "https://random.test/plain-page", title: "Nothing special", source: "html" },
    { url: "https://hh.gbdev.io/new", title: "New gameboy game", source: "html" },
    { url: "https://itch.io/retro-jam", title: "Retro Jam", source: "github" },
  ];
  const known = ["https://known.test/homebrew"];
  const seen = { "https://seen.test/retro": { title: "Seen", source: "html", firstSeen: "2026-01-01" } };
  const seedHosts = new Set(["hh.gbdev.io"]);

  const fresh = filterCandidates(candidates, { known, seen, seedHosts });

  assert.deepEqual(fresh.map((candidate) => candidate.url), [
    "https://itch.io/retro-jam",
    "https://good.test/homebrew-games",
  ]);
  assert.deepEqual(fresh[0].keywords, ["retro", "jam"]);
  assert.ok(fresh[0].score > fresh[1].score);
});

test("buildReport lists new candidates, stats and blocked sources", () => {
  const report = buildReport({
    date: "2026-11-17",
    fresh: [{ url: "https://new.test/homebrew", title: "New Homebrew", source: "HN", keywords: ["homebrew"] }],
    blocked: [
      {
        name: "PSX-Place",
        url: "https://www.psx-place.com/resources/categories/homebrew-games.22/",
        reason: "Cloudflare challenge",
      },
    ],
    stats: { fresh: 1, blocked: 1, sources: 12 },
  });

  assert.match(report, /2026-11-17/);
  assert.ok(report.includes("https://new.test/homebrew"));
  assert.ok(report.includes("New Homebrew"));
  assert.ok(report.includes("| HN | homebrew |"));
  assert.ok(report.includes("NEW=1"));
  assert.ok(report.includes("BLOCKED=1"));
  assert.ok(report.includes("SOURCES=12"));
  assert.ok(report.includes("Cloudflare challenge"));
  assert.ok(report.includes("https://www.psx-place.com/resources/categories/homebrew-games.22/"));
});

test("buildReport handles an empty candidate list", () => {
  const report = buildReport({ date: "2026-11-17", fresh: [], blocked: [], stats: {} });
  assert.ok(report.includes("No new candidates today."));
  assert.ok(report.includes("Last checked: 2026-11-17"));
  assert.ok(report.includes("None."));
});
