---
name: Awesome Homebrew Games
description: A directory you boot like a handheld console in a dim room, with one acid-lime accent and a pixel creature for every entry.
colors:
  void: "#0b0b0b"
  raise: "#121212"
  line: "#2a2a2a"
  line-strong: "#3d3d3d"
  paper: "#f2f2fd"
  dim: "#a8a8b8"
  lime: "#dbff00"
  amber: "#fea514"
  lavender: "#e8bbfb"
typography:
  display:
    fontFamily: "Instrument Serif, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(3.5rem, 12vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Instrument Serif, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.75rem, 7.5vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Instrument Serif, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
  entry:
    fontFamily: "Instrument Serif, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(1.625rem, 3vw, 2.125rem)"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Silkscreen, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  control: "4px"
  card: "6px"
  palette: "8px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  tap: "44px"
  chip-gap: "8px"
  section-y: "clamp(80px, 12vw, 160px)"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.void}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.void}"
  cover-card:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "18px"
    height: "368px"
  prompt-slip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.void}"
    rounded: "{rounded.card}"
    padding: "22px"
  palette-dialog:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.paper}"
    rounded: "{rounded.palette}"
  toast:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# Design System: Awesome Homebrew Games

## Overview

**Creative North Star: "The Console in a Dim Room"**

The page is a handheld that boots in the dark. A black void, a giant serif "Welcome.", a cartridge the visitor inserts, and every later section is a scene the same machine is showing. Dark is fixed on purpose; there is no light theme. The tone is playful and exact: pixel type for anything the machine says, a serif for anything a person would read aloud, a plain grotesk for sentences.

The system is flat. Surfaces are separated by 1px rules and a one-step tonal lift, not by shadow, gradient or blur. One accent, acid lime, carries primary actions, focus, selection and the closing band. Amber and lavender exist only as tints on generated pixel creatures and the cover cards that borrow their tone. Identity comes from a deterministic mirrored pixel creature per entry and category, generated at runtime, so the page ships no image files.

**Key Characteristics:**
- Fixed dark theme: void ground, paper text, one lime accent.
- Three voices: Instrument Serif (display), Silkscreen (machine labels), Hanken Grotesk (reading).
- Flat surfaces, 1px rules, 4/6/8px radii.
- The console and cartridge are drawn in CSS; creatures are generated SVG.
- One authored motion: cartridge insert and boot sequence.

## Colors

A near-black room, cool off-white type, and a single acid-lime light source. Pixel art is the only place the palette widens.

### Primary
- **Acid Lime** (lime): cartridge label, primary buttons, focus ring, selected chips and radios, caret and selection color, XP numerals and fill, link hover, the closing "add" band. Its rarity on any one screen is what makes the band at the end loud.

### Secondary
- **Pixel Amber** (amber): creature tint, cartridge contact pins, and the meta line color on amber-toned cover cards. Never an interface or action color.
- **Pixel Lavender** (lavender): creature tint and the meta line color on lavender-toned cover cards. Never an interface or action color.

### Neutral
- **Void** (void): page ground, HUD, select fields, text on lime.
- **Raise** (raise): one step above void; row hover, cover cards, prompt section, search palette.
- **Line** (line): 1px section, row and HUD dividers.
- **Line Strong** (line-strong): control borders, card borders, scrollbar thumb, XP bar outline.
- **Paper** (paper): primary text, the prompt slip, toast, hover fill on lime buttons.
- **Dim** (dim): secondary text, counts, blurbs, inactive nav and metadata.

### Named Rules
**The One Light Rule.** Lime is the only accent that does interface work. Amber and lavender tint pixel art and the cover cards that inherit a creature's tone, nothing else.
**The Loud Band Rule.** The lime-filled closing section is the single full-bleed loud moment. No other section takes an accent background.

## Typography

**Display Font:** Instrument Serif (with Iowan Old Style, Palatino Linotype, Georgia)
**Body Font:** Hanken Grotesk (with system-ui, Segoe UI)
**Label/Mono Font:** Silkscreen (with ui-monospace, SF Mono, Menlo)

**Character:** A literary serif set very large against a bitmap label face. The serif is the host's voice; Silkscreen is the machine's. Body text stays quiet.

### Hierarchy
- **Display** (400, clamp(3.5rem, 12vw, 6rem), 0.95): the hero "Welcome." and the closing band heading. 6rem is the cap.
- **Headline** (400, clamp(2.75rem, 7.5vw, 6rem), 0.98): section headings (pick, prompt at a smaller 6.5vw/5rem clamp).
- **Title** (400, clamp(2.25rem, 5vw, 3.75rem), 1): scene headings; the "shelf" heading steps down to 2rem to 3rem in dim.
- **Entry** (400, clamp(1.625rem, 3vw, 2.125rem), 1.1): row names; cover names at 2.125rem.
- **Body** (400, 1rem, 1.6): reading text; ledes at 1.125rem in dim; blurbs about 0.875rem to 0.975rem. Cap at 36ch to 62ch.
- **Label** (400, 11px to 13px, 0.04em to 0.06em, uppercase by the face itself): HUD, nav, chips, buttons, counts, screen text, metadata. Silkscreen is never used for sentences.

### Named Rules
**The Three Voices Rule.** Serif speaks in headings and entry names, pixel face labels and reports, grotesk carries sentences. Do not swap roles.
**The Display Cap Rule.** Serif display never exceeds 6rem.

## Layout

Single column of full-width sections on a fluid gutter (clamp(16px, 4vw, 56px)) with generous vertical rhythm (clamp(80px, 12vw, 160px) between major sections). Sections run: boot (100svh, centered), pick (headline and platform chips), shelf, prompt pad, add band, footer. The shelf is a two-column layout at 920px and up: a 300px sticky device column (a smaller handheld whose screen follows the active scene) beside the scenes. Below 920px the device collapses to a one-line sticky status strip pinned under the HUD. Scene rows are a 32px creature, a name and blurb, and a right-aligned metadata column from 720px. The Hall of Fame is a horizontal scroll-snap rail of 212px to 252px cover cards. The prompt section splits 5fr/6fr from 960px.

The fixed HUD is 68px tall at 860px and up (single row) and 112px below (two rows: wordmark and tools, then a nav row). Every interactive target is at least 44px.

Known open item: on a phone the two-row HUD plus the sticky strip takes about 170px of an 844px viewport. Recorded, not resolved.

## Elevation & Depth

Flat by default; depth is tonal. Void to raise is the only surface step, with 1px rules doing the separating. The one exception is the drawn console, which uses bevel insets and a soft drop shadow to read as a physical object. Lifts on hover are movement, not shadow.

### Shadow Vocabulary
- **Console body** (`box-shadow: inset 0 1px 0 #666, inset 0 -3px 0 #181818, 0 28px 40px -12px rgba(0,0,0,0.9)`): the drawn handheld only.
- **Screen scanlines** (`repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)`): the console screen overlay only.
- **Palette backdrop** (`rgba(0,0,0,0.75)`): behind the search dialog.

### Named Rules
**The Flat Page Rule.** Outside the drawn console, nothing carries a shadow, gradient, glow or blur. Hover is translateY, border color or a raise fill.

## Shapes

Small, squared radii that read as hardware. Controls (buttons, chips, fields, toast, rows in the palette) use 4px; cards and the prompt slip use 6px; the search palette uses 8px. Pixel creatures are crisp-edged SVG grids (11 by 11, mirrored). Borders are 1px (2px on primary buttons, matching the fill). The console itself is the only large-radius form (20px top, 34px bottom).

## Components

### Buttons
- **Shape:** 4px radius, 48px minimum height, 12px 20px padding, Silkscreen 13px.
- **Primary:** lime fill, void text, 2px lime border.
- **Hover / Focus:** fills paper and lifts 2px; presses 1px down on active. Focus is a 2px lime outline at 3px offset (void on lime and paper surfaces).
- **Quiet:** transparent with a line-strong border, paper text; hover turns border and text lime.
- **On the lime band:** inverts to void fill with lime text.

### Chips
- **Style:** transparent, 1px line-strong border, 4px radius, 44px tall, Silkscreen 12px, with a dim tabular count.
- **State:** `aria-pressed` selected fills lime with void text. Hover turns the border lime and lifts 2px. The prompt pad's goal radios use the same look.

### Cards / Containers
- **Rows:** hairline-ruled list items, 20px 8px padding, serif name, dim blurb, pixel metadata; hover raises to the raise fill and turns the name lime.
- **Cover cards:** raise fill, 1px line-strong border, 6px radius, 18px padding, 368px tall, large creature, serif name, meta in the card's creature tone. Hover lifts 8px and borders in that tone. They sit in a snap rail.
- **Prompt slip:** a paper-colored slip with void text and a monospace pre block, the only light surface on the page besides the toast.

### Inputs / Fields
- **Style:** void fill, 1px line-strong border, 4px radius, 48px tall. Hover borders lime.
- **Focus:** 2px lime outline.

### Navigation
- **HUD:** fixed, void ground with a line bottom border. Pixel wordmark left, sections nav, then XP, skip and search on the right. Inactive links are dim and turn lime on hover. Below 860px the nav drops to a second row.

### Search palette
A native dialog, 660px max, raise fill, 8px radius, 0.75 black backdrop. Rows are creature, name, blurb and a pixel host label; hover and focus fill a slightly lighter grey.

### Toast and XP HUD
The toast is a paper pill (4px radius, pixel text) that fades in bottom right. XP shows pixel text with lime numerals and a 6px bar filling in lime. XP is cosmetic.

### Console and cartridge (signature)
The handheld is drawn in CSS: grey body, slot, a screen with lime pixel text and scanlines, d-pad, grill and buttons. The cartridge has a lime label with a void creature and amber contact pins. Inserting it slides the cartridge 80px down, prints the boot lines on the screen with 260ms staggering and turns the screen outline lime. This is the single authored motion; under `prefers-reduced-motion` all animation and transition is removed and the boot prints at once. A smaller console follows the shelf scenes.

## Do's and Don'ts

### Do:
- **Do** keep the page dark, void ground with paper text, and use lime for primary actions, focus and selection only.
- **Do** give every entry and category its deterministic pixel creature from the generator, and tint it from the palette (lime, amber, lavender, paper).
- **Do** use Silkscreen for HUD, chips, buttons, counts and screen text; Hanken Grotesk for sentences; Instrument Serif for headings, never above 6rem.
- **Do** use 4px radius on controls, 6px on cards, 8px on the palette, 1px rules between surfaces.
- **Do** keep every target at 44px minimum and a 2px lime focus outline.
- **Do** make new motion a transform or color change under the shared ease, and disable it under reduced motion.

### Don't:
- **Don't** add gradient text, glass, glow or blur to any surface.
- **Don't** use amber or lavender as button, link or border colors on interface; they tint pixel art and cover cards.
- **Don't** add a second full-bleed accent section; the lime closing band is the one loud moment.
- **Don't** set sentences in Silkscreen or headings in the grotesk.
- **Don't** introduce a light theme or new greys without a reason; reuse void, raise, line and line-strong.

## Not canonized

Drift carried by the build and left alone: console and cartridge hardware greys (#262626, #232323, #3f3f3f and neighbors), screen dim-line green (#8c9a2c), prompt status grey (#2e2e36), inline code fill (#1c1c1c) and palette hover grey (#1d1d1d) are one-off hardcoded values outside the token set. The mobile top chrome (two-row HUD plus the sticky strip) takes about 170px of an 844px viewport.
