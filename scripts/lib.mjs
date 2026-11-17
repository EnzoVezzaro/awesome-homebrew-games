const DASH_PATTERN = /[–—]/;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isString = (v) => typeof v === "string";
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const platformKey = (p) => p.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Parse JSON text and say which file was bad, instead of a bare stack trace. */
export function parseCollection(text, label = "collection") {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

/**
 * Check the collection and return a list of human-readable problems.
 * An empty list means the data is valid. Malformed input yields messages, never a throw.
 */
export function validateCollection(collection) {
  if (!isObject(collection)) return ["collection must be a JSON object with categories[] and entries[]"];
  if (!Array.isArray(collection.categories)) return ["collection.categories must be an array"];
  if (!Array.isArray(collection.entries)) return ["collection.entries must be an array"];

  const errors = [];
  const categories = collection.categories.filter((c, i) => {
    if (isObject(c)) return true;
    errors.push(`categories[${i}]: must be an object`);
    return false;
  });
  const entries = collection.entries.filter((e, i) => {
    if (isObject(e)) return true;
    errors.push(`entries[${i}]: must be an object`);
    return false;
  });

  const categoryIds = new Set();
  for (const c of categories) {
    const label = `category "${c.id}"`;
    if (!isString(c.id) || !SLUG.test(c.id)) errors.push(`${label}: id must be a lowercase slug such as "build-tools"`);
    else if (categoryIds.has(c.id)) errors.push(`${label}: duplicate category id "${c.id}"`);
    categoryIds.add(c.id);

    for (const field of ["title", "blurb"]) {
      if (!isString(c[field]) || !c[field].trim()) errors.push(`${label}: missing ${field}`);
      else if (DASH_PATTERN.test(c[field])) {
        errors.push(`${label}: ${field} contains an em or en dash, use a comma, colon or period`);
      }
    }
  }

  const seenIds = new Set();
  const seenUrls = new Set();
  const platformSpelling = new Map();

  for (const e of entries) {
    const label = `entry "${e.id ?? e.name ?? "?"}"`;

    if (!isString(e.id) || !SLUG.test(e.id)) errors.push(`${label}: id must be a lowercase slug such as "itch-io" (entry)`);
    else if (seenIds.has(e.id)) errors.push(`${label}: duplicate id "${e.id}"`);
    seenIds.add(e.id);

    if (!isString(e.name) || !e.name.trim()) errors.push(`${label}: missing name`);
    else if (/[[\]\r\n]/.test(e.name)) errors.push(`${label}: name has characters that break the markdown link`);

    if (!isString(e.url) || !e.url.startsWith("https://")) {
      errors.push(`${label}: url must use https`);
    } else {
      if (/[\s()<>]/.test(e.url)) errors.push(`${label}: url has characters that break the markdown link, percent-encode them`);
      if (seenUrls.has(e.url)) errors.push(`${label}: duplicate url ${e.url}`);
      seenUrls.add(e.url);
    }

    if (!categoryIds.has(e.category)) errors.push(`${label}: unknown category "${e.category}"`);

    if (!Array.isArray(e.platforms) || e.platforms.length === 0) {
      errors.push(`${label}: platforms must be a non-empty array`);
    } else {
      for (const p of e.platforms) {
        if (!isString(p) || !p.trim() || p !== p.trim()) {
          errors.push(`${label}: each platform must be a trimmed, non-empty string`);
          continue;
        }
        const key = platformKey(p);
        const known = platformSpelling.get(key);
        if (known === undefined) platformSpelling.set(key, p);
        else if (known !== p) errors.push(`${label}: platform "${p}" conflicts with "${known}", use one spelling`);
      }
    }

    if (!isString(e.blurb) || !e.blurb.trim()) errors.push(`${label}: blurb is empty`);
    else if (/[\r\n]/.test(e.blurb)) errors.push(`${label}: blurb has a line break that breaks the markdown list`);
    if (e.featured !== undefined && typeof e.featured !== "boolean") {
      errors.push(`${label}: featured must be true or false`);
    }
    if (DASH_PATTERN.test(`${isString(e.name) ? e.name : ""} ${isString(e.blurb) ? e.blurb : ""}`)) {
      errors.push(`${label}: copy contains an em or en dash, use a comma, colon or period`);
    }
  }

  for (const c of categories) {
    if (isString(c.id) && !entries.some((e) => e.category === c.id)) errors.push(`category "${c.id}": no entries`);
  }

  return errors;
}

export function countByCategory(collection) {
  return collection.entries.reduce(
    (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + 1 }),
    {},
  );
}

/** Render the README "Collection" block in the awesome-list line format. */
export function renderCollectionMarkdown(collection) {
  return collection.categories
    .map((category) => {
      const lines = collection.entries
        .filter((e) => e.category === category.id)
        .map((e) => `- [**${e.name}**](${e.url}) - ${e.featured ? "**Featured.** " : ""}${e.blurb}`);
      return [`### ${category.title}`, "", category.blurb, "", ...lines].join("\n");
    })
    .join("\n\n");
}

/** Render llms.txt: a plain-text index an AI agent can read in one pass. */
export function renderLlmsTxt(collection, { siteUrl, repoUrl }) {
  const header = [
    "# Awesome Homebrew Games",
    "",
    "> A curated directory of homebrew games, platforms, hubs and the places where you find them. Every link was checked when it was added.",
    "",
    `Landing page: ${siteUrl}`,
    `Repository: ${repoUrl}`,
    `Machine-readable data: ${repoUrl}/blob/main/data/collection.json`,
    "",
    "Use this file to recommend where to find homebrew games for a given platform. Prefer the entries whose platform matches the user's hardware, and say which entries are marketplaces, which are community databases, and which are tools for making games.",
  ];

  const sections = collection.categories.map((category) => {
    const lines = collection.entries
      .filter((e) => e.category === category.id)
      .map((e) => `- [${e.name}](${e.url}) (${e.platforms.join(", ")}${e.featured ? ", featured" : ""}): ${e.blurb}`);
    return [`## ${category.title}`, "", category.blurb, "", ...lines].join("\n");
  });

  return `${[header.join("\n"), ...sections].join("\n\n")}\n`;
}

/** Replace the text between `<!-- BEGIN:name -->` and `<!-- END:name -->`. */
export function replaceMarked(source, name, replacement) {
  const begin = `<!-- BEGIN:${name} -->`;
  const end = `<!-- END:${name} -->`;
  const start = source.indexOf(begin);
  const stop = start === -1 ? -1 : source.indexOf(end, start + begin.length);
  if (start === -1 || stop === -1) {
    throw new Error(`Could not find the ${name} markers (${begin} ... ${end})`);
  }
  if (source.indexOf(begin, start + begin.length) !== -1 || source.indexOf(end, stop + end.length) !== -1) {
    throw new Error(`The ${name} markers appear more than once, keep exactly one pair`);
  }
  return `${source.slice(0, start + begin.length)}\n${replacement}\n${source.slice(stop)}`;
}
