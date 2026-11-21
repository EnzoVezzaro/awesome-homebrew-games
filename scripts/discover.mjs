#!/usr/bin/env node
// Daily discovery of candidate homebrew links for human review. Never edits data/collection.json.
// To add a source: append { name, url, adapter } to SEEDS below. adapter is one of
// html | reddit | fandom | hn | github. Set browserRequired: true for sites that
// only work in a real browser; those are reported as BLOCKED, not fetched.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COLLECTION = join(ROOT, "data/collection.json");
const DISCOVERY = join(ROOT, "discovery");
const STATE_FILE = join(DISCOVERY, "state.json");
const REPORT_FILE = join(DISCOVERY, "latest.md");
const GITHUB_PROJECTS_FILE = join(DISCOVERY, "github-projects.json");
const GITHUB_MORE_URL = "https://github.com/search?q=homebrew+games";

const TIMEOUT_MS = 12_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; awesome-homebrew-games discovery/1.0; +https://github.com/EnzoVezzaro/awesome-homebrew-games)";
const MAX_CANDIDATES = 30;

// GitHub search: topic coverage plus a few broad keyword queries. Each query is
// paginated up to GitHub's 1000-result cap (10 pages of 100).
const GITHUB_TOPIC_QUERIES = [
  "topic:3ds-homebrew",
  "topic:switch-homebrew",
  "topic:wii-homebrew",
  "topic:gba-homebrew",
  "topic:n64-homebrew",
  "topic:nes-homebrew",
  "topic:gameboy-homebrew",
  "topic:pico-8",
  "topic:homebrew-games",
  "topic:homebrew",
  "topic:retro-gaming",
  "topic:gameboy-development",
  "topic:rom-hacking",
  "topic:fantasy-console",
  "topic:gb-studio",
  "topic:devkitpro",
];
const GITHUB_KEYWORD_QUERIES = ["homebrew game in:name,description", "retro game in:name,description"];
const GITHUB_BASE_QUERIES = [...GITHUB_TOPIC_QUERIES, ...GITHUB_KEYWORD_QUERIES];
// GitHub caps a search at 1000 results. Star slices keep each query under that cap
// so the union of all slices covers far more than a single search can return.
const GITHUB_STAR_SLICES = ["stars:0..9", "stars:10..49", "stars:50..199", "stars:200..999", "stars:>=1000"];
export const GITHUB_QUERIES = GITHUB_BASE_QUERIES.flatMap((query) =>
  GITHUB_STAR_SLICES.map((slice) => `${query} ${slice}`),
);
const GITHUB_PER_PAGE = 100;
const GITHUB_MAX_PAGES = 10;
const GITHUB_TOP_LIMIT = 50;
// 2.2s between requests keeps an authenticated search under 30 req/min; a 403 or
// 429 ends that query's pagination and is reported instead of failing the run.
const GITHUB_PACE_MS = 2_200;

// The first ten are the curated seeds. The rest are reliable JSON endpoints that
// work from plain fetch and need no API key.
const SEEDS = [
  { name: "Homebrew Factory", url: "https://www.homebrew-factory.com/", adapter: "html" },
  {
    name: "PSX-Place homebrew games (22)",
    url: "https://www.psx-place.com/resources/categories/homebrew-games.22/",
    adapter: "html",
    browserRequired: true,
    blockedReason: "Cloudflare challenge",
  },
  {
    name: "ROMHacking.net homebrew",
    url: "https://www.romhacking.net/homebrew/",
    adapter: "html",
    browserRequired: true,
    blockedReason: "Cloudflare challenge",
  },
  { name: "GBDev homebrew hub", url: "https://hh.gbdev.io/", adapter: "html" },
  {
    name: "Reddit homebrew games list",
    url: "https://www.reddit.com/r/retrogaming/comments/11dadva/homebrew_games_list/",
    adapter: "reddit",
  },
  {
    name: "Homebrew Games wiki",
    url: "https://videogamehomebrew.fandom.com/wiki/Homebrew_Games",
    adapter: "fandom",
    fetchUrl: "https://videogamehomebrew.fandom.com/api.php?action=query&list=allpages&format=json&aplimit=50",
  },
  { name: "Reddit r/Homebrews", url: "https://www.reddit.com/r/Homebrews/", adapter: "reddit" },
  {
    name: "OpenAI Modretro Chromatic blog",
    url: "https://developers.openai.com/blog/build-a-game-with-modretro-chromatic",
    adapter: "html",
  },
  {
    name: "PSX-Place homebrew games (5)",
    url: "https://www.psx-place.com/resources/categories/homebrew-games.5/",
    adapter: "html",
    browserRequired: true,
    blockedReason: "Cloudflare challenge",
  },
  { name: "Recomp Store", url: "https://recompstore.com/games", adapter: "html" },
  {
    name: "Hacker News search",
    url: "https://hn.algolia.com/api/v1/search?query=homebrew%20game&tags=story&hitsPerPage=20",
    adapter: "hn",
  },
  {
    name: "GitHub repositories",
    url: "https://github.com/search?q=homebrew+games&type=repositories",
    adapter: "github",
  },
];

const KEYWORDS = [
  "homebrew",
  "retro",
  "rom hack",
  "romhack",
  "fangame",
  "fan game",
  "pico-8",
  "pico8",
  "gameboy",
  "game boy",
  "nes",
  "snes",
  "genesis",
  "dreamcast",
  "n64",
  "atari",
  "cartridge",
  "gb studio",
  "fantasy console",
  "devkit",
  "emulat",
  "ported",
  "browser game",
  "indie game",
  "scene",
  "forum",
  "jam",
  "wiki",
  "marketplace",
  "database",
];

// Hosts that never lead to a useful directory entry. Checked exactly and by subdomain.
const NOISE_HOSTS = [
  "google.com",
  "goo.gl",
  "facebook.com",
  "fb.me",
  "instagram.com",
  "twitter.com",
  "x.com",
  "t.co",
  "youtube.com",
  "youtu.be",
  "discord.com",
  "discord.gg",
  "patreon.com",
  "amazon.com",
  "amazon.co.uk",
  "paypal.com",
  "cloudflare.com",
  "jina.ai",
  "r.jina.ai",
  "tiktok.com",
  "pinterest.com",
  "linkedin.com",
];

const ENTITIES = { amp: "&", quot: '"', "#39": "'", lt: "<", gt: ">", nbsp: " " };
const TRACKING_PARAM = /^(utm_|ref$|source$|utm$)/i;

/* ------------------------------------------------------------------ *\
 * Exported helpers (pure, no I/O): import these from tests.
\* ------------------------------------------------------------------ */

/** Ordered GitHub search URLs: every page of each query, in query order. */
export function githubSearchUrls(queries, { perPage = GITHUB_PER_PAGE, maxPages = GITHUB_MAX_PAGES } = {}) {
  const urls = [];
  for (const query of queries ?? []) {
    const q = String(query).trim();
    if (!q) continue;
    for (let page = 1; page <= maxPages; page += 1) {
      const params = new URLSearchParams({
        q,
        per_page: String(perPage),
        page: String(page),
        sort: "stars",
        order: "desc",
      });
      urls.push(`https://api.github.com/search/repositories?${params}`);
    }
  }
  return urls;
}

/** Canonical absolute http(s) URL: lowercase host, no www., fragment or tracking params. */
export function normalizeUrl(url) {
  if (typeof url !== "string") return null;
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  let host = parsed.host.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host) return null;

  for (const key of [...parsed.searchParams.keys()]) {
    if (TRACKING_PARAM.test(key)) parsed.searchParams.delete(key);
  }

  let pathname = parsed.pathname;
  while (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  if (pathname === "/") pathname = "";
  const search = parsed.searchParams.toString();
  return `${parsed.protocol}//${host}${pathname}${search ? `?${search}` : ""}`;
}

function decodeEntities(text) {
  return String(text).replace(/&(amp|quot|#39|lt|gt|nbsp);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

/** Regex-only <a href=...>text</a> parser with relative URL resolution. */
export function extractLinks(html, baseUrl) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    return [];
  }
  const ANCHOR = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  const links = [];
  for (const match of String(html ?? "").matchAll(ANCHOR)) {
    const href = decodeEntities(match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!href || /^(#|mailto:|javascript:|tel:|data:)/i.test(href)) continue;
    let resolved;
    try {
      resolved = new URL(href, base).href;
    } catch {
      continue;
    }
    const title = decodeEntities(match[4].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
    links.push({ url: resolved, title });
  }
  return links;
}

function hostOf(value) {
  const normalized = normalizeUrl(value);
  if (normalized) return new URL(normalized).hostname.replace(/^www\./, "");
  return String(value ?? "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0];
}

function asItems(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value];
  if (Array.isArray(value)) return value;
  return Object.keys(value);
}

function urlSet(value) {
  const set = new Set();
  for (const item of asItems(value)) {
    const url = normalizeUrl(typeof item === "string" ? item : item?.url);
    if (url) set.add(url);
  }
  return set;
}

function hostSet(value) {
  const set = new Set();
  for (const item of asItems(value)) {
    const host = hostOf(typeof item === "string" ? item : item?.url);
    if (host) set.add(host);
  }
  return set;
}

function isNoiseHost(host, seedHosts) {
  if (!host) return true;
  if (NOISE_HOSTS.some((bad) => host === bad || host.endsWith(`.${bad}`))) return true;
  return seedHosts.has(host);
}

/** Match keywords with flexible separators and word boundaries for short terms. */
function keywordHits(text) {
  const haystack = String(text ?? "").toLowerCase();
  const hits = [];
  for (const keyword of KEYWORDS) {
    const parts = keyword.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const pattern = parts.join("[\\s_\\-./]+");
    const stem = keyword === "emulat";
    const expression = new RegExp(`\\b${pattern}${stem ? "" : "s?\\b"}`, "i");
    if (expression.test(haystack)) hits.push(keyword);
  }
  return hits;
}

/** Drop known/seen/duplicate/noise candidates, require a keyword, score and cap. */
export function filterCandidates(candidates, { known, seen, seedHosts } = {}) {
  const knownUrls = urlSet(known);
  const seenUrls = urlSet(seen);
  const seeds = hostSet(seedHosts);
  const fresh = [];
  const emitted = new Set();

  for (const candidate of candidates ?? []) {
    const url = normalizeUrl(candidate?.url);
    if (!url) continue;
    if (isNoiseHost(hostOf(url), seeds)) continue;
    if (knownUrls.has(url) || seenUrls.has(url) || emitted.has(url)) continue;
    const keywords = keywordHits(`${candidate.title ?? ""} ${url}`);
    if (keywords.length === 0) continue;
    emitted.add(url);
    fresh.push({
      url,
      title: String(candidate.title ?? "").trim() || url,
      source: String(candidate.source ?? "").trim(),
      keywords,
      score: keywords.length,
    });
  }

  fresh.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  return fresh.slice(0, MAX_CANDIDATES);
}

// The `homebrew` topic is dominated by the macOS package manager and its tools.
// Keep only repos whose name or description reads as a game, a game tool or a scene.
const PACKAGE_MANAGER_PATTERN = /\b(package manager|homebrew[- ]?(core|cask)|homebrew for mac|brew install|linuxbrew|formulas?|casks?)\b/i;
const GAME_SIGNAL_PATTERN = /\b(homebrew\s+(game|games|rom|roms|port|ports|title|titles)|retro\s+(game|games|gaming)|game\s*jam|fan\s*game|fangame|rom\s*hack|romhack|fantasy\s+console|cartridge|game\s*boy|gameboy|\bnes\b|\bsnes\b|n64|nintendo\s+64|dreamcast|genesis|mega\s+drive|atari|pico-?8|tic-80|emulat(e|or|ion)|homebrew\s+for|flash\s+cart)\b/i;

/** Drop repos that are not about games, so the top list is not package manager tools. */
export function filterGameRepos(repos) {
  return (repos ?? []).filter((repo) => {
    const text = `${repo?.name ?? ""} ${repo?.description ?? ""}`;
    if (PACKAGE_MANAGER_PATTERN.test(text)) return false;
    return GAME_SIGNAL_PATTERN.test(text);
  });
}

/** Dedupe repos by normalized URL, keeping the highest star count, then sort by stars. */
export function rankGithubProjects(repos, limit = Infinity) {
  const byUrl = new Map();
  for (const repo of repos ?? []) {
    const key = normalizeUrl(repo?.url);
    if (!key) continue;
    const candidate = {
      name: String(repo.name ?? key.split("/").pop() ?? key),
      url: String(repo.url),
      stars: Number(repo.stars) || 0,
      description: String(repo.description ?? ""),
    };
    const current = byUrl.get(key);
    if (!current || candidate.stars > current.stars) byUrl.set(key, candidate);
  }
  return [...byUrl.values()]
    .sort((a, b) => b.stars - a.stars || a.url.localeCompare(b.url))
    .slice(0, limit);
}

function cell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

/** Markdown report for human review, including the manual-check list. */
export function buildReport({ date, fresh = [], blocked = [], stats = {}, githubTop = [], githubTotal = 0 } = {}) {
  const lines = ["# Homebrew discovery report", "", `Last checked: ${date}`, "", "## New candidates", ""];
  if (fresh.length === 0) {
    lines.push("No new candidates today.", "");
  } else {
    lines.push(
      "| Title | URL | Source | Matched keywords |",
      "| --- | --- | --- | --- |",
      ...fresh.map(
        (c) => `| ${cell(c.title)} | ${cell(c.url)} | ${cell(c.source)} | ${cell((c.keywords ?? []).join(", "))} |`,
      ),
      "",
    );
  }
  lines.push("## Most starred GitHub projects", "");
  if (githubTop.length === 0) {
    lines.push("No GitHub projects collected yet.", "");
  } else {
    lines.push(
      `Top ${githubTop.length} of ${githubTotal || githubTop.length} repositories found across all GitHub queries.`,
      "",
      "| Project | Stars | URL |",
      "| --- | --- | --- |",
      ...githubTop.map((p) => `| ${cell(p.name)} | ${cell(p.stars)} | ${cell(p.url)} |`),
      "",
      `[Show more](${GITHUB_MORE_URL})`,
      "",
    );
  }

  const statLabels = {
    fresh: "NEW",
    blocked: "BLOCKED",
    sources: "SOURCES",
    githubQueries: "GH_QUERIES",
    githubRequests: "GH_REQUESTS",
    githubRepos: "GH_REPOS",
  };
  const statLine = Object.entries(stats)
    .map(([key, value]) => `${statLabels[key] ?? key.toUpperCase()}=${value}`)
    .join("  ");
  lines.push("## Stats", "", statLine || "No stats.", "", "## Blocked / manual check", "");
  if (blocked.length === 0) {
    lines.push("None.", "");
  } else {
    for (const item of blocked) {
      lines.push(`- ${cell(item.name ?? item.url)}: ${cell(item.reason ?? "blocked")} (${cell(item.url)})`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

/* ------------------------------------------------------------------ *\
 * Source adapters. One request per source, short timeout, no retries.
\* ------------------------------------------------------------------ */

async function fetchText(url, { json = false, headers = {} } = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "user-agent": USER_AGENT,
      accept: json ? "application/json, text/plain, */*" : "text/html,application/xhtml+xml,*/*;q=0.8",
      ...headers,
    },
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const text = await response.text();
  const head = text.slice(0, 4000);
  if (/just a moment|checking your browser|cf-browser-verification|attention required/i.test(head)) {
    throw new Error("Cloudflare challenge");
  }
  if (json && /^\s*(<!doctype|<html)/i.test(text)) throw new Error("HTML returned instead of JSON");
  return text;
}

function redditJsonUrl(url) {
  const target = new URL(url);
  target.hostname = "old.reddit.com";
  if (!target.pathname.endsWith(".json")) target.pathname = `${target.pathname.replace(/\/$/, "")}/.json`;
  target.searchParams.set("limit", "25");
  return target.href;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Paginate every GitHub query, stopping a query early on a short page or a
 * 403/429. Rate-limited queries land in blocked; they never fail the run.
 */
async function fetchGithub(seed) {
  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" } : {};
  const links = [];
  const repos = [];
  const failures = [];
  let requests = 0;

  for (const query of GITHUB_QUERIES) {
    const urls = githubSearchUrls([query], { perPage: GITHUB_PER_PAGE, maxPages: GITHUB_MAX_PAGES });
    for (const url of urls) {
      if (requests > 0) await sleep(GITHUB_PACE_MS);
      requests += 1;
      try {
        const payload = JSON.parse(await fetchText(url, { json: true, headers }));
        const items = payload?.items ?? [];
        for (const repo of items) {
          if (!repo?.html_url) continue;
          links.push({ url: repo.html_url, title: repo.description ?? repo.name });
          repos.push({
            name: repo.name ?? repo.full_name ?? repo.html_url,
            url: repo.html_url,
            stars: Number(repo.stargazers_count) || 0,
            description: repo.description ?? "",
          });
        }
        if (items.length < GITHUB_PER_PAGE) break;
      } catch (error) {
        const status = error?.status;
        const reason =
          status === 403 || status === 429
            ? `GitHub rate limit (HTTP ${status})`
            : error?.message ?? "request failed";
        failures.push({ name: `GitHub: ${query}`, url, reason });
        break;
      }
    }
  }
  return { links, repos, blocked: failures, requests, seedName: seed.name };
}

async function fetchSource(seed) {
  const url = seed.fetchUrl ?? seed.url;
  if (seed.adapter === "html") return extractLinks(await fetchText(url), url);

  if (seed.adapter === "reddit") {
    const payload = JSON.parse(await fetchText(redditJsonUrl(url), { json: true }));
    const listings = Array.isArray(payload) ? payload : [payload];
    return listings
      .flatMap((listing) => listing?.data?.children ?? [])
      .map((child) => child?.data)
      .filter(Boolean)
      .map((post) => ({ url: post.url, title: post.title }));
  }

  if (seed.adapter === "fandom") {
    const payload = JSON.parse(await fetchText(url, { json: true }));
    const query = payload?.query ?? {};
    const pages = query.allpages ?? Object.values(query.pages ?? {});
    return pages.map((page) => ({
      title: page.title,
      url: `https://videogamehomebrew.fandom.com/wiki/${encodeURIComponent(String(page.title ?? "").replace(/ /g, "_"))}`,
    }));
  }

  if (seed.adapter === "hn") {
    const payload = JSON.parse(await fetchText(url, { json: true }));
    return (payload?.hits ?? []).map((hit) => ({ url: hit.url, title: hit.title }));
  }

  throw new Error(`unknown adapter: ${seed.adapter}`);
}

/* ------------------------------------------------------------------ *\
 * Orchestration. Filesystem/state errors are fatal; source errors are not.
\* ------------------------------------------------------------------ */

function loadKnown() {
  const collection = JSON.parse(readFileSync(COLLECTION, "utf8"));
  return urlSet([
    ...(collection.entries ?? []).map((entry) => entry.url),
    "https://github.com/EnzoVezzaro/awesome-homebrew-games",
  ]);
}

function loadState() {
  if (!existsSync(STATE_FILE)) return {};
  const state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
  return state && typeof state === "object" && state.seen && typeof state.seen === "object" ? state.seen : {};
}

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  const known = loadKnown();
  const seen = loadState();

  const raw = [];
  const allRepos = [];
  const blocked = [];
  let githubRequests = 0;
  for (const seed of SEEDS) {
    if (seed.browserRequired) {
      blocked.push({ name: seed.name, url: seed.url, reason: seed.blockedReason ?? "Cloudflare challenge" });
      continue;
    }
    try {
      if (seed.adapter === "github") {
        const result = await fetchGithub(seed);
        for (const link of result.links) raw.push({ ...link, source: result.seedName });
        allRepos.push(...result.repos);
        blocked.push(...result.blocked);
        githubRequests += result.requests;
      } else {
        const links = await fetchSource(seed);
        for (const link of links) raw.push({ ...link, source: seed.name });
      }
    } catch (error) {
      blocked.push({ name: seed.name, url: seed.url, reason: error?.message ?? "request failed" });
    }
  }

  const seedHosts = new Set(SEEDS.map((seed) => hostOf(seed.fetchUrl ?? seed.url)));
  const fresh = filterCandidates(raw, { known, seen, seedHosts });
  const allGithubProjects = rankGithubProjects(filterGameRepos(allRepos));
  const githubTop = allGithubProjects.slice(0, GITHUB_TOP_LIMIT);
  const githubData = { updated: date, total: allGithubProjects.length, projects: allGithubProjects };
  const stats = {
    fresh: fresh.length,
    blocked: blocked.length,
    sources: SEEDS.length,
    raw: raw.length,
    known: known.size,
    seen: Object.keys(seen).length,
    githubQueries: GITHUB_QUERIES.length,
    githubRequests,
    githubRepos: allGithubProjects.length,
  };

  const nextSeen = { ...seen };
  for (const candidate of fresh) {
    if (!nextSeen[candidate.url]) {
      nextSeen[candidate.url] = { title: candidate.title, source: candidate.source, firstSeen: date };
    }
  }
  const ordered = Object.fromEntries(Object.keys(nextSeen).sort().map((key) => [key, nextSeen[key]]));
  const state = { updated: date, seen: ordered };
  const report = buildReport({ date, fresh, blocked, stats, githubTop, githubTotal: allGithubProjects.length });

  mkdirSync(DISCOVERY, { recursive: true });
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(REPORT_FILE, report);
  writeFileSync(GITHUB_PROJECTS_FILE, `${JSON.stringify(githubData, null, 2)}\n`);

  console.log(
    `NEW=${fresh.length} BLOCKED=${blocked.length} SOURCES=${SEEDS.length} GH_REPOS=${allGithubProjects.length}`,
  );
}

function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  try {
    await main();
  } catch (error) {
    console.error(`discover: ${error.message}`);
    process.exitCode = 1;
  }
}
