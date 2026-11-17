# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and JavaScript with no build step for the site. A small Node script generates the README list, `llms.txt` and the site data from `data/collection.json`. Deployed to GitHub Pages. (Confirmed by the user.)

## Users

People who like games made outside the commercial pipeline and do not know where to look: players who own a Game Boy, NES, Genesis or handheld emulator and want new games, tinkerers who want to write one, and anyone who asks an AI assistant "where do I find homebrew for X?" (Inferred from the brief.)

## Product Purpose

A curated directory of homebrew games and the places to find them: marketplaces, community databases, cartridge makers, jams, toolchains and ways to run games. Modeled on the structure and simplicity of voltagent/awesome-design-md: one README is the product, the landing page is a friendlier front door to the same data. Success is a visitor opening a real link for their platform within a minute, and an AI agent answering platform questions correctly from `llms.txt`.

## Positioning

Most game lists rank games. This one maps where each scene keeps its releases, and ships its data in a form agents can read (`llms.txt`, `collection.json`). Every link is checked and every claim in a blurb is something the site itself shows.

## Operating Context

Maintained as an open source awesome list. Contributions are one object in `data/collection.json`; the build validates it and regenerates everything else. The list does not host ROMs and does not link to piracy.

## Capabilities and Constraints

- Source of truth: `data/collection.json` (categories, entries with name, url, category, platforms, blurb).
- Counts shown anywhere on the landing come from that file. No invented numbers, testimonials or user counts.
- No backend, no accounts, no analytics. XP on the landing is cosmetic and lives in the visitor's localStorage.
- "AI oriented" means agent-ready data plus a Prompt Pad that writes a prompt the visitor pastes into their own assistant. No embedded chatbot. (Confirmed by the user.)
- Copy follows blader/humanizer: no em or en dashes, no "not X but Y", no forced triads, no sales language, sentence case headings. (Confirmed by the user, replacing antislop.)

## Brand Commitments

- Name: Awesome Homebrew Games. Wordmark is text or the pixel lettering in `assets/banner.svg`. No logo has been supplied.
- Landing reference: gaming.onbeam.com, studied with REA. Borrow the structure and mood (black void, giant serif display, a device you interact with, scroll scenes that swap the device screen, a points mechanic). Do not copy Beam's fonts, video, images or brand.

## Evidence on Hand

The 65 verified entries in `data/collection.json`. Link status was checked on 2026-11-17; four sites answer scripts with 403 (devkitPro, GBAtemp, NESdev, ROMhacking.net) and are known to exist.

## Open Decisions

- Live GitHub Pages URL is assumed to be `https://enzovezzaro.github.io/awesome-homebrew-games/` until the first deploy.
- No Discord, sponsor or donation links exist. None are shown.
