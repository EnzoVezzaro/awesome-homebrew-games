# Entry audit: all 73 entries

Date: 2026-11-17. Scope: every entry in `data/collection.json`. Report only; no data or generated files were edited.

## Summary

| Verdict | Count |
| --- | --- |
| keep | 66 |
| fix | 1 |
| remove | 3 |
| manual review | 3 |
| **total** | **73** |

Mechanical pass (`audit-entries.mjs --repo .`): clean. 73 entries, 0 mechanical issues, 0 flagged entries, 0 schema errors. No duplicate URLs or names, no platform spelling drift, no em/en dashes, first person, or stale counts. The findings below are editorial.

Headline findings: three entries fall outside the homebrew scope and are recommended for removal (Ludum Dare, Mini Jam, LÖVE); one is miscategorized (Neo Geo Dev Wiki); three need a human to confirm the homebrew angle before a decision (Game Jolt, RecompStore, Piko Interactive). Several list-wide issues are worth a look, especially the `jams` category drifting to general game jams and five near-identical retro OS entries in `run`.

Judgment note: per the skill, links that answer scripts with 403 but are known to exist (GBAtemp, NESdev, ROMhacking.net, devkitPro, and the browser-only PSX-Place pages) were judged from their data and the site's reputation, not treated as dead. Anything I could not judge from the data is marked manual review rather than guessed.

## Hubs and marketplaces

| entry | verdict | reason |
| --- | --- | --- |
| Ported2Browser | keep | Directory of browser ports spanning Windows, DOS, arcade and consoles. Fits "place that lists original homebrew and ports"; genuinely cross-platform and useful. Featured flag is fine but see list-wide note. |
| itch.io | keep | Indie marketplace whose tag pages are the main discovery route for retro homebrew. Broad but earns its place via the homebrew tags. |
| itch.io Game Boy tag | keep | Distinct platform tag on an already-listed host; allowed because it covers a different platform. Blurb is accurate. |
| itch.io NES tag | keep | Different platform, honest warning that some results are 8-bit-styled PC games. Keep. |
| itch.io PICO-8 tag | keep | Different platform, accurate about browser play and single-cart export. Keep. |
| itch.io homebrew tag | keep | Author-labeled homebrew across the site. Some overlap with the main itch.io entry, but it is the one cross-platform homebrew filter. Keep for now; see list-wide note. |
| Game Jolt | manual review | Blurb ("Free indie and fan game platform that also hosts jams") states no homebrew or retro target, so it reads like a general indie platform. A human should confirm it has a meaningful homebrew/retro catalog worth browsing. If yes, sharpen the blurb to say what that is. |
| GBAtemp | keep | Console hacking forum with homebrew release threads for GBA, DS, 3DS, Wii and Switch. Clear homebrew angle. 403 to bots is known and acceptable. |
| ROMhacking.net | keep | Archive with a separate original-homebrew section. Legitimate homebrew angle; keep. |
| Homebrew Factory | keep | Storefront for physical homebrew releases and crowdfunded cartridges. Directly fits the cartridge-maker/storefront case. |
| RecompStore | manual review | Sells "recompiled games for PS5 and PC", from ports of older titles. Recompilation is a homebrew-adjacent scene activity, but recompiling copyrighted commercial titles may conflict with the rule against sites that mainly offer copyrighted games. A human should verify whether these are original/authorized homebrew before keeping. |

## Platform scenes

| entry | verdict | reason |
| --- | --- | --- |
| Homebrew Hub | keep | Game Boy / GBC homebrew database from gbdev with ROM links. Core "scene database" fit. |
| gbdev.io | keep | Front door to the Game Boy dev community with Pan Docs, tool lists and links. Community hub, keep; see list-wide note on the build/scenes boundary. |
| NESdev | keep | Wiki and forum for NES programmers and the center of documented NES homebrew technique. Keep. |
| SMS Power! | keep | Master System, Game Gear and SG-1000 site with a homebrew section and its own coding competition. Keep. |
| N64brew | keep | Wiki and community for N64 homebrew, host of a game jam. Keep. |
| AtariAge | keep | Forums, software database and store for new Atari cartridges. Strong scene + studio fit, keep. |
| CSDb | keep | Commodore 64 scene database cataloging new and old releases including games. Primarily demoscene, but it is where the C64 scene keeps releases; keep. |
| Spectrum Computing | keep | ZX Spectrum database and forum including new releases. Keep. |
| MSX Resource Center | keep | MSX news, forums and software database where new homebrew appears. Keep. |
| Neo Geo Dev Wiki | fix | Technical programming wiki (memory maps, sprite system), which is hardware documentation for making games and belongs in `build` per the category table, not a release-keeping scene wiki. Exact change: set `"category": "build"`. Caveat: nesdev and gbdev.io are dev-resource hubs left in scenes, so align those too if consistency matters (see list-wide note). |
| Universal-DB | keep | DS and 3DS homebrew app/game database from Universal-Team. Keep. |
| Open Shop Channel | keep | Wii homebrew app store with a browsable web catalog. Community release hub, keep. |
| Homebrew App Store | keep | Package repository for Switch and Wii U homebrew with source on GitHub. Keep. (Blurb mentions Wii U, but no approved `Wii U` platform spelling exists, so the single `Switch` platform tag is left as is.) |
| VitaDB | keep | Vita homebrew games, ports and tools catalog. Keep. |
| ROMhacking.net homebrew | keep | Original-homebrew section, distinct host path from the ROMhacking.net hub entry. Different section and scope, so not a duplicate; keep. |
| PSX-Place PS2 homebrew | keep | PS2 homebrew resource index with reviews and downloads. Browser-only source but a known valid site; keep. |
| PSX-Place PS3 homebrew | keep | PS3 homebrew resource index, separate platform from the PS2 entry. Keep. |
| Video Game Homebrew Wiki | keep | Community wiki with a page per game across platforms. Keep. |
| r/Homebrews | keep | Subreddit for new releases, dev updates and cartridge projects. Keep. |

## Fantasy consoles and open handhelds

| entry | verdict | reason |
| --- | --- | --- |
| PICO-8 | keep | The reference fantasy console with shareable single-PNG carts. Keep. |
| Lexaloffle BBS | keep | Forum where PICO-8 carts are posted and play in-browser. Keep. |
| TIC-80 | keep | Open source fantasy computer with editors and a public cart library. Keep. |
| WASM-4 | keep | Fantasy console using WebAssembly modules; programmable in several languages. Keep. |
| Pyxel | keep | Retro Python game engine with fixed palette and sound, commonly grouped with the fantasy consoles. Category is debatable (it is an engine rather than a cart machine), but it is a reasonable fit here; keep. |
| Uxn | keep | Tiny VM from Hundred Rabbits that runs across many devices. `Multi` is justified here. Keep. |
| Arduboy | keep | Open handheld whose games are Arduino sketches. Fits "open handheld"; keep. Platform `Multi` is imprecise for a single device; see list-wide note. |
| Gamebuino META | keep | Open source handheld for learning game programming with an online library. Keep. Same `Multi` caveat. |
| Thumby | keep | Keychain console from TinyCircuits programmed in MicroPython. Keep. Same `Multi` caveat. |

## Hall of fame (games)

| entry | verdict | reason |
| --- | --- | --- |
| Celeste Classic | keep | PICO-8 platformer that became Celeste, with a direct cart link. Keep. |
| Micro Mages | keep | Four-player NES co-op platformer released on a real cartridge. Keep. |
| POOM | keep | Doom-style shooter built inside PICO-8 limits, with a project page. Keep. |
| Super Tilt Bro. | keep | NES platform fighter by sgadrat. Keep. |
| Tobu Tobu Girl | keep | Game Boy arcade game with an official project page. Keep. |
| Xeno Crisis | keep | Bitmap Bureau twin-stick shooter released on a Genesis cartridge. Keep. |
| Gunlord | keep | Indie shooter independently released for Neo Geo and Dreamcast, so it fits the made-for-old-hardware rule. Note: the link is a Wikipedia page rather than a project page; acceptable as an info source, but an official NG:DEV.TEAM page would be stronger. |

## Studios and cartridge makers

| entry | verdict | reason |
| --- | --- | --- |
| Bitmap Bureau | keep | UK studio behind new Genesis cartridges (Xeno Crisis). Keep. |
| NG:DEV.TEAM | keep | German team releasing Last Hope, Fast Striker and Gunlord on Neo Geo and Dreamcast. Keep. |
| Mega Cat Studios | keep | Publisher of new games for classic consoles. Keep. |
| Piko Interactive | manual review | Blurb says "new and re-released games", and the company is known for licensed re-releases of commercial retro titles. A human should confirm enough original/new homebrew output to justify the studio slot before keeping. |
| CollectorVision | keep | New ColecoVision games and hardware sold as cartridges. Keep. |
| Super Fighter Team | keep | Publisher of new Genesis cartridges such as Beggar Prince. Keep. |
| Mojon Twins | keep | Spanish 8-bit developers who also publish their engines. Keep. |

## Jams and competitions

| entry | verdict | reason |
| --- | --- | --- |
| Ludum Dare | remove | General game jam whose output is mostly PC/browser games; the blurb gives no homebrew or retro target. A visitor looking for homebrew for specific hardware gets nothing platform-specific here. Recommend removal (drift of the `jams` category, see list-wide note). |
| itch.io Jams | keep | Jam calendar with filters for console-specific jams such as Game Boy and PICO-8; the retro angle is explicit. Keep. |
| Mini Jam | remove | Recurring general jam series on itch.io with no homebrew or retro focus; the "limits what you can use" rule is not a retro target. Recommend removal for the same reason as Ludum Dare. |

## Build your own

| entry | verdict | reason |
| --- | --- | --- |
| GB Studio | keep | Visual editor that exports a real Game Boy ROM. Keep. |
| GBDK-2020 | keep | C compiler and libraries for Game Boy, Master System and Game Gear. Keep. |
| Pan Docs | keep | The canonical Game Boy technical reference. Keep. |
| SGDK | keep | Sega Genesis/Mega Drive C development kit. Keep. |
| cc65 | keep | C compiler and assembler for 6502 machines, including NES, C64 and Atari. Keep. |
| devkitPro | keep | Toolchains and libraries for GBA through Switch. Keep; 403 to bots is known and acceptable. |
| libdragon | keep | Open source N64 SDK. Keep. |
| Wonderful Toolchain | keep | Toolchain for WonderSwan and other unusual targets; `Multi` is appropriate. Keep. |
| LÖVE | remove | General-purpose 2D Lua framework with no retro or hardware target. The blurb admits it is only "a common first step before targeting real hardware", which is the generic-developer-tool near miss the skill rejects. Recommend removal. |

## Run it anywhere

| entry | verdict | reason |
| --- | --- | --- |
| RetroArch | keep | Front end running emulator cores across the systems in this list. Core "way to play homebrew" entry. Keep. |
| Batocera | keep | Linux distro that boots into a retro library from USB, including homebrew. Keep. |
| Recalbox | keep | Retro gaming OS for Raspberry Pi and PC. Keep. |
| MiSTer FPGA | keep | FPGA recreations of old hardware with cores that run new homebrew. Keep. |
| Krikzz | keep | Maker of EverDrive flash carts for running homebrew on real hardware. Keep. |
| muOS | keep | Custom firmware for Anbernic retro handhelds, used to run emulators and homebrew. Keep. |
| ROCKNIX | keep | Linux distro for retro handhelds. Keep. |
| Knulli | keep | Batocera-based firmware for handheld consoles. Keep. |

## List-wide issues

1. **`jams` category has drifted to general game jams.** Two of its three entries (Ludum Dare, Mini Jam) have no homebrew or retro target and are recommended for removal. That leaves only itch.io Jams, a single entry. Either narrow the category blurb to say these are general jams where retro-specific ones can be found, or merge the surviving entry elsewhere and retire the category.
2. **Over-representation of itch.io.** Five entries point to itch.io (main page plus four tag pages). The main entry's blurb already names the Game Boy, NES and PICO-8 tags, so the tag pages partly duplicate it. Different platforms justify separate entries under the skill's rules, but the generic `homebrew tag` page is the weakest. Consider keeping only the platform tags that add real value.
3. **`scenes` vs `build` boundary is fuzzy.** gbdev.io, NESdev and Neo Geo Dev Wiki are developer-resource wikis sitting in a category described as "where each scene keeps its releases." Neo Geo Dev Wiki is flagged to move to `build`; decide whether the other two should follow so the categories are applied consistently.
4. **Five near-identical retro OS entries in `run`.** Batocera, Recalbox, Knulli, muOS and ROCKNIX all serve "boot a retro handheld or Pi into an emulator frontend." They are distinct projects, not duplicates by URL, but the category is heavy on one kind of link at the expense of others. Confirm all five earn a slot.
5. **`Multi` used for single open handhelds.** Arduboy, Gamebuino META and Thumby each tag one specific device but are labeled `Multi`. Uxn genuinely spans machines so `Multi` is correct there. If platform precision matters, add dedicated spellings (for example `Arduboy`, `Gamebuino`, `Thumby`) using the skill's "no existing spelling is accurate" rule. This is optional, not a correctness bug.
6. **Featured flag.** Ported2Browser is the only `featured: true` entry. It is a focused browser-port directory; itch.io is the more broadly useful hub. Confirm the flagship designation is intentional.
7. **Wikipedia link in Hall of Fame.** Gunlord uses an encyclopedia URL while the other games use project or official pages. Not a duplicate or a rule violation, but an official page is preferable when one exists.
8. **Clean mechanical baseline.** No duplicate URLs or names, no platform spelling drift, no dashes, first person, invented counts or broken markdown. The issues above are editorial scope and categorization calls, not data defects.

## Applied decisions (2026-11-17)

- Removed `ludum-dare`, `mini-jam` and `love2d`: no retro or homebrew target.
- Removed `recompstore`: its catalog is mostly recompiled commercial games, which
  conflicts with the list's rule against places that mainly offer copyrighted games.
- Moved `neogeo-dev-wiki` from `scenes` to `build`, since it is programming reference.
- Sharpened the `game-jolt` blurb to name its Retro & Homebrew community.
- Kept `piko-interactive` with an honest blurb covering new physical games alongside
  licensed re-releases.
- Mechanical recheck after the edits: 69 entries, 0 issues, 0 schema errors.

Not applied, left as editorial choices for the owner: narrowing or retiring the
`jams` category, reducing itch.io overlap, moving other developer wikis from
`scenes` to `build`, trimming the retro OS entries in `run`, replacing `Multi` on
single open handhelds, and reconsidering the featured flag.
