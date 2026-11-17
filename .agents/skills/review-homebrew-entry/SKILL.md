---
name: review-homebrew-entry
description: Review candidate sites, forums, wikis and GitHub repos for the awesome-homebrew-games directory. Decide whether each one belongs, explain how it relates to homebrew games, choose the right category and platforms, write a compliant blurb, and add approved entries to data/collection.json. Use this skill whenever you are triaging candidates from discovery/latest.md, auditing existing entries for relevance, deciding whether a pasted URL belongs in the list, or adding a new entry. Do not skip it because a link looks obviously relevant; the classification rules and duplicate checks matter even then.
---

# Review a homebrew entry

This list is curated. A link earns a place only when a visitor can use it to find,
make, run or discuss games for hardware its maker did not officially bless, or for a
fantasy console built to be programmed. Everything else is a near miss.

## Inputs

- **One candidate:** a URL, a GitHub repo, or a row from `discovery/latest.md`.
- **A batch:** the whole "New candidates" table in `discovery/latest.md`.
- **An audit:** the user asks to review all or some existing entries.

Read `docs/DISCOVERY.md` for where candidates come from and `PRODUCT.md` for the
editorial voice. Read `scripts/lib.mjs` for the validation rules the data must pass.

## What belongs

Accept a candidate when it is one of these:

- a place that lists or distributes original homebrew games, fan games or ports
- a project page for a game that runs on real or fantasy hardware
- a community, database, wiki or forum where such releases are posted and discussed
- a jam, storefront or cartridge maker for physical homebrew releases
- a toolchain, engine, emulator, FPGA core or firmware used to make or run those games

Reject or hold for manual review:

- sites that mainly offer copyrighted ROMs or pirated games
- ordinary commercial games and storefronts with no homebrew angle
- a decompilation of a retail game, unless the project also ships an original game
- generic developer tools, AI demos, asset packs and tutorial blogs with no retro target
- links you could not open and verify yourself

When a site is blocked, say so and leave it for a human. Never guess its contents.

## Step 1: open and understand it

Fetch the URL. If a plain request is blocked, open it in a browser. Record what the
page actually is, who maintains it, and whether it is current. Note the exact words it
uses for itself, since those usually give the best blurb.

## Step 2: check for duplicates

Compare against `data/collection.json` by exact URL, normalized URL (lowercase host,
no `www.`, no trailing slash, no tracking parameters), host plus path, and name.
A related page on a host we already list can still be a valid separate entry when it
covers a different platform, for example a PS2 resource category next to a PS3 one.

Use the bundled checker for a deterministic answer:

```bash
node .agents/skills/review-homebrew-entry/scripts/check-entry.mjs --repo . --url "https://example.com"
```

It reports exact, normalized and host matches. When you have drafted a full entry,
pipe its JSON to the same script to validate it and preview the rendered lines.

## Step 3: classify

| Category | Use when |
|----------|----------|
| `hubs` | Cross-platform marketplace, index or storefront to browse many places |
| `scenes` | One console, computer or community keeps its own releases here |
| `fantasy` | A fantasy console or open handheld and its cart sharing site |
| `games` | A single homebrew game worth starting with |
| `studios` | A team or shop releasing games on physical cartridges |
| `jams` | A recurring competition with deadlines |
| `build` | Toolchain, engine, reference or hardware documentation for making games |
| `run` | Emulator, FPGA, flash cart or firmware for playing homebrew |

Pick one category. If two fit, choose the one a visitor would browse to first.

## Step 4: choose platforms

Reuse a spelling already in `data/collection.json`: `Multi`, `Web`, `PC`, `Game Boy`,
`NES`, `Genesis`, `PICO-8`, `DS/3DS`, `N64`, `Neo Geo`, `Switch`, `Wii`, `Atari`,
`C64`, `MSX`, `Master System`, `ZX Spectrum`, `ColecoVision`, `TIC-80`, `Vita`, `PS2`,
`PS3`, `PS5`. Use `Multi` only when the place really spans several unrelated machines.
Add a new spelling only when no existing one is accurate, and keep it consistent with
the ones above.

## Step 5: write the blurb

One or two sentences, present tense. Say what a visitor finds and why it is useful.
No em or en dashes, no "not X but Y", no forced triads, no first person, and no
invented counts. Avoid numbers that will drift, such as a current entry total. Match
the calm, concrete voice of the existing entries.

```text
Good: Resource index for PS2 homebrew games and ports, with reviews, downloads and a separate section for tools.
Bad:  The ultimate hub for all your retro gaming needs - 387 games and counting!
```

Mark an entry `featured: true` only for an exceptional, broadly useful hub. Most
entries omit the field.

## Output

**Single candidate.** Give the decision first, then the reason, then the draft:

```text
ADD. A community database of original Game Boy releases with download links. It fits scenes because it is dedicated to one platform and is not a game itself.

{
  "id": "example-db",
  "name": "Example DB",
  "url": "https://example.com",
  "category": "scenes",
  "platforms": ["Game Boy"],
  "blurb": "Community database of original Game Boy releases, with download links and notes from the developers."
}
```

**Batch.** Use a table with columns `candidate | decision | category | why`. Put
rejections and manual checks in the same table. Do not write any files until the user
approves the batch.

**Audit.** Use a table with `entry | verdict | reason`. Verdicts are `keep`, `fix`
with the exact change, or `remove` with the reason. Never remove an entry without
approval.

## When approved to add

1. Insert the object into `data/collection.json`, keeping file order inside its
   category. Use a unique lowercase slug for `id`.
2. Run `npm run build` to regenerate the README, `llms.txt`, `site/collection.js`,
   `site/collection.json` and the sitemap.
3. Run `node --test "tests/*.test.mjs"` and `node scripts/build.mjs --check`.
4. Run `node scripts/check-links.mjs` and read the blocked list. A 403 from a
   bot-protected site is acceptable when you opened it successfully in a browser.
5. Commit the source and generated files together.
