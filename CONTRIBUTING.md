# Contributing

Thanks for helping keep this list useful. Most contributions are one entry in `data/collection.json`.

## Add an entry

1. Open `data/collection.json` and add an object to `entries`. Put it at the end of its category's group, because order inside a category is the order readers see.
2. Fill every field:

   ```json
   {
     "id": "kebab-case-name",
     "name": "Display name",
     "url": "https://example.com",
     "category": "hubs",
     "platforms": ["Game Boy"],
     "blurb": "One or two plain sentences on what a visitor finds there."
   }
   ```

3. Run `npm run build`. It validates the data, then regenerates the README list, `llms.txt` and the landing page data.
4. Run `npm test`, then open a PR with only the files the build changed.

Categories are `hubs`, `scenes`, `fantasy`, `games`, `studios`, `jams`, `build` and `run`. Platform names should match ones already in the file so the landing page filter keeps working.

## What belongs here

- Places a person can open today and find homebrew: marketplaces, databases, wikis, forums, stores.
- Original homebrew games and fan games that their authors released publicly.
- Toolchains, engines and references for making games on real or fantasy hardware.
- Emulators, FPGA projects, flash carts and firmware that run homebrew.

## What does not

- Sites that distribute commercial ROMs or other pirated files.
- Dead, paywalled-only or login-only pages with nothing public to see.
- Links that only exist to promote something else. Say what the place is.
- Anything you cannot verify yourself. Open the link before you submit it.

## Writing the blurb

Describe what the place is and one specific thing it has. Write like you would explain it to a friend.

- Use plain verbs: "is", "has", "hosts".
- Skip marketing words such as "amazing", "ultimate" and "vibrant".
- Do not use em or en dashes. The build rejects them. Use a comma, colon or period.
- Keep a claim only if you checked it on the site.

## Check links

```bash
npm run links
```

The script requests every URL and reports failures. A 403 or 429 usually means the site blocks scripts, so open those by hand.

## Larger changes

Open an issue before adding a category, changing the data format or changing the landing page design. The landing page is plain HTML, CSS and JavaScript in `site/`. Run `npm run serve` to preview it.
