# Make It Real skill

`SKILL.md` is a portable skill file. It tells your assistant which questions to ask and how to write a transfer guide for a homebrew ROM. It is Markdown with frontmatter. Copy it or save it in a skills folder.

## What the skill does

It asks for your console model, cart or uploader, ROM file and computer. It then writes the steps: back up what matters, use the right tool, check the write and play the game.

Your assistant writes the steps. It may run a tool only after you say yes and the device and tool are there. Without access, it tells you what to do and reads the results you give it. It never says a cart was written before verification and a playtest.

The page's **Copy instructions** button copies the full `SKILL.md` file. The button reads the file itself. Download works too.

## Install

This repository keeps skills at `.agents/skills/<name>/SKILL.md`. Download [SKILL.md](SKILL.md) and save it as `.agents/skills/make-it-real/SKILL.md` in your project. Other assistants accept the file as an attachment or in their own skills folder. The frontmatter names the skill `make-it-real` and says when to use it.

## What to expect

The first answer is a set of questions. If you cannot name the cart model, the uploader or the file type, the assistant stops and asks. A guide that skips the interview is not following the skill.

Each guide has five parts: verified details, backups, transfer steps in your tool, verification and playtest. Before any format, erase or write, the assistant must ask you to confirm the exact cart, port, target and action. It stops while a detail is unclear. The source ROM stays untouched. Backups come before the write. The skill refuses commercial ROMs and DRM bypasses.

## Files

- `SKILL.md`: the portable skill. This is the product.
- `README.md`: this install and usage guide.

## License

MIT, like the rest of Awesome Homebrew Games.
