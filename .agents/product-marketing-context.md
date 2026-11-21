# Product marketing context: Awesome Homebrew Games

Status: authoritative context for copywriting and marketing tasks in this repository.
Latest review: 2026-11-18.
Owner: Enzo Vezzaro. License: MIT.

This file is the source of truth for marketing facts and voice. The copywriting skill at
`.agents/skills/copywriting/SKILL.md` reads it before drafting. When code and older
documents disagree, trust the code and the generated data, and update this file.

## 1. Product overview

**Name:** Awesome Homebrew Games (wordmark: AWESOME / HOMEBREW GAMES)

**Category:** A curated, open source link directory with a landing page that presents the
directory as a handheld console you boot.

**What it actually is:** One JSON file (`data/collection.json`) holds 70 places. A build
script generates the README collection, `llms.txt`, `site/collection.js`,
`site/collection.json` and the sitemap from it. The landing page in `site/` is plain HTML,
CSS and classic JavaScript that loads `site/collection.js` inline and renders the entries.
There is no backend, no accounts, no analytics, no embedded AI and no bundler. The page
hosts no games and no ROMs.

**Problem it solves:** Finding new games for old hardware means digging through forums,
wikis, itch.io tags, jams and cartridge makers. The links are scattered, and AI assistants
tend to guess instead of reading a real list. This directory puts the reviewed places in
one index and ships that index in a form agents can read.

**What a visitor can do today:** boot the console, filter the places by platform, browse
eight category scenes, open any external entry in a new tab, search the list with `/` or
Cmd/Ctrl+K, generate and copy a prompt for their own AI assistant, and follow a link to
suggest an entry. Cosmetic XP is awarded for those interactions and stored only in
`localStorage` under `ahg:xp:v1`.

**What it is not:** a game host, a ROM archive, a store, a marketplace checkout, a game
launcher, a chatbot, a social network, or a recommendation engine.

## 2. Audience and personas

These segments are taken from `PRODUCT.md` ("Users"), the landing page's Prompt Pad goals
(`site/js/prompt.js`) and the section copy in `site/index.html`. They are product-defined
segments, not interview findings. No customer research, survey, funnel data or metrics
exist in this repository, so any claim about how many visitors belong to a segment, or how
strongly they feel a pain point, is a hypothesis and must be labeled as such.

| Segment | Evidence in repo | Problem | Motivation | Likely objection |
| --- | --- | --- | --- | --- |
| Player with old hardware or an emulator | PRODUCT.md "Users"; Prompt Pad goal "Find games to play"; `site/index.html` pick section | New games for a console that stopped being sold are hard to find | Keep playing a machine they still own | "Is this a ROM piracy site?" |
| First time maker / tinkerers | PRODUCT.md "Users"; Prompt Pad goal "Make my first game"; `build` category | Does not know which toolchain, docs or reference to start with | Write and ship a game for real or fantasy hardware | "Is this too advanced for a beginner?" |
| Player who wants real hardware | Prompt Pad goal "Play on real hardware"; `run` category | Needs flash carts, firmware, FPGA or emulators that actually run homebrew | Play on a screen and machine they like | "Will these work with my setup?" |
| Jam participant | Prompt Pad goal "Enter a jam"; `jams` category | Wants retro or console-specific competitions rather than general jams | A deadline and a small platform to build for | "Are these homebrew jams or general game jams?" |
| AI assistant user | PRODUCT.md "Capabilities"; `llms.txt`; Prompt Pad section | Assistants invent answers about where homebrew lives | Get accurate, source-grounded recommendations | "Will the assistant just make things up?" |
| Contributor | CONTRIBUTING.md; `suggest-an-entry.yml`; "Know a place we missed?" section | Wants to add a place they know | Get it listed with a small, well defined contribution | "How much work is a contribution?" |

## 3. Positioning and value proposition

**Product name and category:** Awesome Homebrew Games, a curated directory of homebrew
games and the places where they live.

**One-sentence value proposition:** A directory of homebrew games and the places to find
them, with a landing page that filters by machine and an `llms.txt` file an AI assistant
can read.

**Core problem → desired outcome:** Scattered links → a real place to open for your
hardware within a minute.

**Differentiators (all verified in code):**
- It maps *where each scene keeps its releases*, rather than ranking games. Eight
  categories separate hubs, scenes, fantasy consoles, games, studios, jams, build tools
  and ways to run games.
- Machine-readable data is a first class output: `llms.txt`, `site/collection.json` and a
  Prompt Pad that writes a prompt pointing at the raw `llms.txt` on GitHub.
- The landing page is a console you boot, with a deterministic pixel creature for every
  entry and category, drawn in CSS and generated as inline SVG. No image files ship for
  entries.
- A daily GitHub Action searches for candidates (`docs/DISCOVERY.md`), and a review skill
  triages them by hand before they enter the list (`discovery/entry-audit.md`).
- Static, private and free: no backend, no accounts, no analytics, MIT licensed.

**Alternatives and competitors:** Do not name direct commercial competitors; the repo has
no competitive research. The supported framing is the status quo a visitor already knows:
scattered forums, wikis, tag pages, jams, general awesome lists, and a general web search
or chatbot that guesses. `discovery/entry-audit.md` mentions other sites only as entries
being evaluated, never as competitors.

## 4. Features and benefits

| Actual feature | User benefit | Supporting evidence |
| --- | --- | --- |
| One JSON file with 70 entries, 8 categories and 21 platforms, plus `npm run build` | The README, site and agent data cannot drift apart; a contribution is one object | `data/collection.json`; `scripts/build.mjs`; `tests/lib.test.mjs` |
| Platform filter chips with live counts | See only the places that serve the machine you own | `site/js/shelf.js`; `site/index.html` "Which machine is on your desk?" |
| Search palette (`/`, Cmd/Ctrl+K, arrow keys, Enter) | Find a place by name, platform, category or blurb without scrolling | `site/js/palette.js` |
| `llms.txt` alternate link and Prompt Pad with four goals | Get assistant recommendations grounded in the actual file; nothing is sent from the page | `llms.txt`; `site/index.html` Prompt Pad; `site/js/prompt.js` |
| Eight categories including `build` and `run` | Move from "find a game" to "make one" or "play it on real hardware" in the same index | `data/collection.json`; `README.md` Collection |
| Blurbs that follow the writing rules | Know what a place is before opening an external link | `CONTRIBUTING.md` "Writing the blurb"; `.agents/skills/review-homebrew-entry/SKILL.md` |
| Link checker, daily discovery and manual audit | Links were checked when added and the list keeps looking for new places | `scripts/check-links.mjs`; `docs/DISCOVERY.md`; `discovery/entry-audit.md` |
| Static site with no backend or analytics; cosmetic XP in `localStorage` | Private, works from `file://`, no signup and nothing to install | `site/index.html`; `site/js/xp.js`; `PRODUCT.md` "Capabilities and Constraints" |
| CSS console, generated pixel creatures, one authored boot motion | A recognizable, playful identity without external images for entries | `DESIGN.md`; `site/js/sprite.js`; `site/js/boot.js` |
| MIT license and a published README | Reuse the data and links freely; read the whole list without JavaScript | `LICENSE`; `README.md`; `llms.txt` |

**Use cases:** find a specific game to play, discover where a scene publishes, choose a
first toolchain, pick a flash cart or emulator, enter a retro jam, answer an AI assistant
question from real data, contribute a missing place.

**Experimental or planned:** none documented as shipping. Daily discovery and the review
skill are live automation, not experiments. No roadmap file exists in the repository.

**Limitations to state honestly:** no games or ROMs are hosted; no embedded AI, chatbot,
accounts, saved favorites or in-page submissions; entry links open external sites whose
terms and licenses are separate; several sites answer scripts with 403 or 429 and are
known to exist (see `npm run links` output); the `jams` category currently has one entry,
itch.io Jams; the mobile top chrome takes about 170px of an 844px viewport, recorded but
unresolved in `DESIGN.md`; the landing page requests Google Fonts from an external host,
so "no external requests" would be false.

## 5. Differentiators

Use these only with the evidence above:
- Reviewed by people, with an auditable trail in `discovery/entry-audit.md`.
- Agent-ready by design: `llms.txt`, a raw JSON link and a Prompt Pad.
- A console metaphor that makes the directory memorable without adding a game to it.
- Open data under MIT, generated from a single source file.

Do not claim "the only", "the largest", "the most complete", or any ranking. The repo has
no data to support those claims.

## 6. Competitive context

No direct competitor analysis exists in the repository. Frame the alternative as the
visitor's current habit: digging across forums, wikis, tag pages and jams, or asking an
assistant that has no curated source. Do not invent comparison tables, market shares or
named rivals.

## 7. Voice and tone

**Established voice (from PRODUCT.md, CONTRIBUTING.md and shipped copy):** calm, concrete,
plain and exact, with a playful console metaphor. The design north star in `DESIGN.md` is
"The Console in a Dim Room". `site/index.html` sets the three registers: giant serif lines
a person would read aloud ("Welcome."), pixel face for machine speech and labels
("CARTRIDGE DETECTED", "XP", "Copy prompt"), and a plain grotesk for explanatory sentences.

**Writing rules (established, enforced by the build):**
- No em dashes or en dashes. Use a comma, colon or period. The build rejects them
  (`scripts/lib.mjs`, DASH_PATTERN).
- No "not X but Y" constructions, no forced triads, no sales language, no first person in
  entry blurbs, no invented counts.
- Sentence case headings. No marketing filler: "amazing", "ultimate", "vibrant",
  "revolutionary", "industry-leading", "seamless", "unlock your potential", "transform
  your workflow", "trusted by thousands", "the future of AI".
- Plain verbs in blurbs: "is", "has", "hosts". Describe what a visitor finds, and only
  claims checked on the site.
- Prefer words the audience uses: homebrew, cartridge, ROM, flash cart, fantasy console,
  chip, jam, port, toolchain. Do not relabel these as "solutions", "workflows", "content"
  or "experiences".
- Keep the metaphor where it is native. "Insert the cartridge", "the shelf", "pick your
  machine", "+30 XP" belong on the landing page. A README or `llms.txt` does not need the
  costume.

**Established taglines and where each is used (do not silently replace):**
- Landing page OG/Twitter: "Insert the cartridge. Find the places where homebrew games
  live for your hardware." (`site/index.html`)
- Site/meta/README lead: "A directory of homebrew games and the hubs, scenes and tools
  where you find them." (`site/index.html`, `README.md`)
- Hero lede: "A directory of homebrew games and the places to find them."
  (`site/index.html`)
- Product Hunt v1.1.0 asset: "Curated homebrew games for your old hardware"
  (`docs/social/producthunt-v1.1.0.md`)
- LinkedIn v1.1.0 opening: "A homebrew game is a love letter to a machine that stopped
  being sold years ago." (`docs/social/linkedin-v1.1.0.md`)

**Established owner decision (2026-11-18):** decompilation resources are in scope for the
directory. `Decompedia` (`https://decomp.wiki/`) lives in `build` with platform `Multi`.
Older text in `.agents/skills/review-homebrew-entry/SKILL.md` that says a decompilation of
a retail game is rejected is superseded by the owner's decision for this project.

**Proposed improvements, not brand rules:** update stale counts in older launch documents
and `PRODUCT.md` (they say 69 and 65, the data says 70); consider narrowing the `jams`
blurb; reconsider the single `featured` flag. These are suggestions to raise, not rules to
apply without approval.

## 8. Conversion objectives

**Primary:** open a real entry that serves the visitor's platform.

**Secondary actions:** copy a Prompt Pad prompt; open `llms.txt` or `collection.json`;
suggest a missing entry; read `CONTRIBUTING.md`; browse the README as the no-JavaScript
version of the same list.

**Main objections and honest answers:**
- "Does it host ROMs or pirated games?" No. The footer and README say it links to other
  sites and hosts no games or ROMs. `CONTRIBUTING.md` rejects piracy links.
- "Is the list current?" A daily discovery workflow finds candidates and a review skill
  audits them by hand. Links were checked when added. Bot-protected sites can return 403
  or 429 even though they work in a browser.
- "Will the assistant invent entries?" The Prompt Pad tells the assistant to read
  `llms.txt` and use only entries from that file. The page sends nothing.
- "Do I need an account or to pay?" No. No accounts, no signup, no pricing, MIT licensed.
- "Does it work without JavaScript?" The README and `llms.txt` carry the same list; the
  page has a `<noscript>` note and a load-failure fallback with an "Open the README" link.
- "Is it only games?" No. The directory includes hubs, scene databases, cartridge makers,
  jams, build references (including decompilation), emulators, flash carts and firmware.

**Trust signals:** counts derived from the data, real checked https links, human review,
public audit trail, MIT license, no analytics, test suite and `--check` build gate.

**Distribution and pricing:** GitHub repository and GitHub Pages landing page, README as
an awesome list, `llms.txt` for agents, and launch assets for Product Hunt and LinkedIn.
Free. No donation, sponsor or newsletter links exist; do not add them.

## 9. Evidence and limitations

**Verified facts:** 70 entries, 8 categories, 21 non-`Multi` platforms; 38 passing tests at
last review; one `featured` entry (Ported2Browser); MIT license; link check reports 0
failed URLs with a known blocked list; no backend, analytics, accounts or telemetry;
no games hosted.

**Interpretations (label as such when used):** the console metaphor suits the audience;
the three-voice typography matches the tone; the Prompt Pad is the differentiator for
agent users.

**Unknown / do not assert:** visitor counts, conversion rates, customer testimonials,
search volume, market share, uptime of external links beyond the last check, licensing
terms of linked sites, whether the live GitHub Pages URL differs from the assumed one,
and any user research. `PRODUCT.md` records the live Pages URL as assumed until first
deploy.

**Stale numbers to avoid:** 65 in `PRODUCT.md`, 69 in `docs/social/*.md` and
`discovery/entry-audit.md`. Always recompute from `data/collection.json` or use the current
count reported by the build.

## 10. Approved terminology and primary URLs

**Approved:** homebrew, homebrew game, fan game, port, fantasy console, open handheld,
scene, release, cartridge, ROM (as a format, not as piracy), flash cart, toolchain, jam,
llms.txt, Prompt Pad, shelf, cartridge route, insert the cartridge.

**Avoid:** solutions, content, experiences, workflows, ecosystem (unless describing a real
scene), revolutionary, industry-leading, seamless, trusted by thousands, gaming hub in the
abstract, "games and counting".

**Primary URLs:**
- Landing page: https://enzovezzaro.github.io/awesome-homebrew-games/
- Repository: https://github.com/EnzoVezzaro/awesome-homebrew-games
- Entry suggestion: https://github.com/EnzoVezzaro/awesome-homebrew-games/issues/new?template=suggest-an-entry.yml
- Machine-readable index: https://enzovezzaro.github.io/awesome-homebrew-games/llms.txt
- Raw agent index: https://raw.githubusercontent.com/EnzoVezzaro/awesome-homebrew-games/main/llms.txt

## 11. Sources within the repository

Ranked by authority for copy decisions:
1. `data/collection.json` and `scripts/build.mjs` for facts, counts and categories.
2. `site/index.html`, `site/js/*.js` and `site/styles.css` for shipped user-facing strings
   and real behaviour.
3. `README.md` and `llms.txt` for the public and agent-facing voice.
4. `PRODUCT.md` for purpose, users and copy rules.
5. `DESIGN.md` and `.impeccable/design.json` for the console metaphor, palette and type.
6. `CONTRIBUTING.md`, `docs/DISCOVERY.md` and `discovery/entry-audit.md` for editorial
   policy and curation proof.
7. `docs/social/*.md` for existing launch copy, counts there are stale.
8. `tests/*.test.mjs` and `scripts/check-links.mjs` for validation claims.
9. `.agents/skills/review-homebrew-entry/SKILL.md` for the established entry-writing rules,
   with the decompilation decision noted above as an owner override.

## 12. Open questions and evidence gaps

- No customer research, analytics or interviews exist. All audience pain and motivation
  statements are grounded in product copy, not measured user evidence.
- No dedicated About page, pricing page, docs site, changelog file or roadmap exists.
  Do not write copy that implies they do.
- No owned social account list beyond the launch docs; X and email copy would be new
  channels and should be marked as such.
- The live Pages URL is assumed, not confirmed.
- Stale counts in older documents need an owner decision to update.
- The `jams` category has one entry; positioning it as a broad jam directory would be
  misleading until that changes.
