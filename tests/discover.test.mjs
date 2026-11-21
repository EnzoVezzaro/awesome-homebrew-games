import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeUrl,
  extractLinks,
  filterCandidates,
  buildReport,
  githubSearchUrls,
  rankGithubProjects,
  filterGameRepos,
  GITHUB_QUERIES,
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

test("GitHub queries are partitioned by star range to pass the 1000-result cap", () => {
  assert.equal(GITHUB_QUERIES.length, 90);
  assert.ok(GITHUB_QUERIES.every((q) => /stars:/.test(q)));
  assert.ok(GITHUB_QUERIES.includes("topic:3ds-homebrew stars:0..9"));
  assert.ok(GITHUB_QUERIES.includes("homebrew game in:name,description stars:>=1000"));
});

test("rankGithubProjects dedupes by URL, keeps the highest stars and sorts descending", () => {
  const repos = [
    { name: "low", url: "https://github.com/a/one", stars: 5, description: "first" },
    { name: "high", url: "https://github.com/a/one", stars: 900, description: "dupe with more stars" },
    { name: "mid", url: "https://www.github.com/b/two/", stars: 40, description: "second" },
    { name: "zero", url: "not a url", stars: 999, description: "ignored" },
  ];
  const ranked = rankGithubProjects(repos, 2);
  assert.deepEqual(ranked.map((p) => p.name), ["high", "mid"]);
  assert.equal(ranked[0].stars, 900);
});

test("filterGameRepos keeps game projects and drops package manager tools", () => {
  const repos = [
    { name: "brew", description: "The missing package manager for macOS", stars: 50000 },
    { name: "hub", description: "hub helps you win at git", stars: 20000 },
    { name: "pyxel", description: "Retro game engine for Python", stars: 18000 },
    { name: "some-homebrew", description: "Homebrew games for the Game Boy", stars: 10 },
  ];
  const kept = filterGameRepos(repos);
  assert.deepEqual(kept.map((r) => r.name), ["pyxel", "some-homebrew"]);
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

test("buildReport lists the most starred GitHub projects with a Show more link", () => {
  const report = buildReport({
    date: "2026-11-19",
    fresh: [],
    blocked: [],
    stats: { githubRepos: 1200 },
    githubTotal: 1200,
    githubTop: [{ name: "Top repo", url: "https://github.com/a/top", stars: 500, description: "desc" }],
  });
  assert.ok(report.includes("## Most starred GitHub projects"));
  assert.ok(report.includes("Top 1 of 1200"));
  assert.ok(report.includes("| Top repo | 500 | https://github.com/a/top |"));
  assert.ok(report.includes("[Show more](https://github.com/search?q=homebrew+games)"));
  assert.ok(report.includes("GH_REPOS=1200"));
});

test("buildReport handles an empty candidate list", () => {
  const report = buildReport({ date: "2026-11-17", fresh: [], blocked: [], stats: {} });
  assert.ok(report.includes("No new candidates today."));
  assert.ok(report.includes("Last checked: 2026-11-17"));
  assert.ok(report.includes("None."));
  assert.ok(report.includes("No GitHub projects collected yet."));
});
