# Daily web discovery

`scripts/discover.mjs` searches a fixed set of sources once a day and writes candidates
for a human to review. It never edits `data/collection.json` and never adds entries on
its own. The point is to find places we have missed, not to publish unverified links.

## When it runs

`.github/workflows/discover.yml` runs every day at 06:23 UTC and can also be started
from the Actions tab. It uses Node 22 and no npm dependencies. When the run finds new
candidates it commits `discovery/state.json` and `discovery/latest.md` to `main`.
When it finds nothing, it commits nothing.

## Sources

Sources live in the `SEEDS` array at the top of `scripts/discover.mjs`. Each one has a
kind that decides how it is read.

| Kind | How it reads | Examples |
|------|--------------|----------|
| `html` | Plain fetch, then extracts links and their text | Homebrew Hub, RecompStore, Homebrew Factory, the ModRetro article |
| `reddit` | `old.reddit.com` JSON endpoints | r/Homebrews, the retrogaming homebrew list thread |
| `fandom` | MediaWiki `api.php` page list | Video Game Homebrew Wiki |
| `hn` | Hacker News Algolia search API | recent "homebrew game" stories |
| `github` | GitHub repository search API, paginated | repos tagged `3ds-homebrew`, `switch-homebrew`, `gba-homebrew`, `pico-8`, `homebrew-games` and more, plus keyword searches |
| `browserRequired` | Reported as a manual check, not scraped | PSX-Place PS2 and PS3 resource categories, ROMhacking.net homebrew |

The `browserRequired` sources serve a Cloudflare challenge to scripted requests, and
headless Chrome is challenged too. They are listed in the report so someone can open
them by hand. The script does not try to bypass the challenge.

Each source gets a short timeout. A source that fails is recorded in the report and
the run continues, so a single dead site cannot stop the job. GitHub search uses
`GITHUB_TOKEN` when the workflow supplies it, which raises the rate limit.

The GitHub source covers both topic pages such as `github.com/topics/3ds-homebrew` and
repository searches such as `github.com/search?q=homebrew+games&type=repositories`. It
uses the API directly, walks up to ten pages of 100 results per query and pauses
between requests to stay under the search rate limit. A rate-limited query is recorded
as blocked and the rest of the queries continue. Repos appear as candidates only:
hundreds of them are tools, engines or forks, so they need human triage before any of
them reach the list.

## Output

- `discovery/state.json` maps each normalized URL we have ever seen to its title,
  source and first seen date. This prevents the same candidate appearing twice.
- `discovery/latest.md` is the human-readable report: new candidates with the
  keywords that matched, run statistics, and the manual-check list.

`README.md` links to the latest report so it is easy to find.

## Promoting a candidate

The `review-homebrew-entry` skill in `.agents/skills/` handles this triage. It decides
whether a candidate belongs, explains how, classifies it and drafts a compliant entry.

1. Open the candidate URL and confirm it is still a place to find homebrew games or
   the tools and communities around them.
2. Add an object to `data/collection.json` with a unique slug `id`, `name`, `url`,
   `category`, `platforms` and a one or two sentence `blurb`. Use an existing
   category and platform spelling.
3. Run `npm run build` and commit the generated files.
4. Run `npm run links` to check the new URL.

The candidate stays in the state file as already seen, so it will not be reported
again.

## Adding a source

Add a row to `SEEDS` with an `id`, `label`, `url` and `kind`. Use one of the kinds
above. For a site that blocks scripted requests, set `browserRequired: true` and give
it a `reason`; it will appear in the manual-check section instead of causing a
failed run. Keep the number of seeds modest: one request per source per day is
enough.
