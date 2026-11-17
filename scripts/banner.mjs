#!/usr/bin/env node
// Draws assets/banner.svg from rectangles. GitHub renders SVG as an image with no
// webfonts, so the title is built from a 5x7 bitmap font instead of text nodes.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FONT = {
  A: "01110 10001 10001 11111 10001 10001 10001",
  B: "11110 10001 10001 11110 10001 10001 11110",
  C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110",
  E: "11111 10000 10000 11110 10000 10000 11111",
  F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111",
  H: "10001 10001 10001 11111 10001 10001 10001",
  I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100",
  K: "10001 10010 10100 11000 10100 10010 10001",
  L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001",
  N: "10001 11001 10101 10011 10001 10001 10001",
  O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000",
  Q: "01110 10001 10001 10001 10101 10010 01101",
  R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110",
  T: "11111 00100 00100 00100 00100 00100 00100",
  U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100",
  W: "10001 10001 10001 10101 10101 11011 10001",
  X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100",
  Z: "11111 00001 00010 00100 01000 10000 11111",
};

const GLYPH_W = 5;
const GLYPH_H = 7;
const ADVANCE = GLYPH_W + 1;
const INK = "#dbff00";
const PAPER = "#f2f2fd";
const VOID = "#0b0b0b";

const CARTRIDGE = [
  "................",
  "..oooooooooooo..",
  ".o############o.",
  ".o############o.",
  ".o#LLLLLLLLLL#o.",
  ".o#LLLLLLLLLL#o.",
  ".o#LLkkkkkkLL#o.",
  ".o#LLLLLLLLLL#o.",
  ".o#LLLLLLLLLL#o.",
  ".o############o.",
  ".o############o.",
  ".o############o.",
  ".oooooooooooooo.",
  "..occoccoccocc..",
];
const CART_COLORS = { o: "#4a4a4a", "#": "#262626", L: INK, k: VOID, c: "#fea514" };

/** Merge horizontal runs so each row costs one rect per run, not per pixel. */
function rowRuns(cells) {
  const runs = [];
  let start = null;
  cells.forEach((on, i) => {
    if (on && start === null) start = i;
    if ((!on || i === cells.length - 1) && start !== null) {
      runs.push([start, (on ? i + 1 : i) - start]);
      start = null;
    }
  });
  return runs;
}

function text(str, x, y, px, fill) {
  const rects = [];
  [...str].forEach((ch, index) => {
    if (ch === " ") return;
    const glyph = FONT[ch];
    if (!glyph) throw new Error(`No glyph for "${ch}"`);
    glyph.split(" ").forEach((row, r) => {
      for (const [col, len] of rowRuns([...row].map((c) => c === "1"))) {
        const rx = x + (index * ADVANCE + col) * px;
        rects.push(`<rect x="${rx}" y="${y + r * px}" width="${len * px}" height="${px}"/>`);
      }
    });
  });
  return `<g fill="${fill}">${rects.join("")}</g>`;
}

function sprite(rows, x, y, px, colors) {
  const rects = [];
  rows.forEach((row, r) => {
    const cells = [...row];
    let i = 0;
    while (i < cells.length) {
      const key = cells[i];
      if (key === ".") { i += 1; continue; }
      let j = i;
      while (j < cells.length && cells[j] === key) j += 1;
      rects.push(`<rect x="${x + i * px}" y="${y + r * px}" width="${(j - i) * px}" height="${px}" fill="${colors[key]}"/>`);
      i = j;
    }
  });
  return rects.join("");
}

const W = 1200;
const H = 500;
const LEFT = 80;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d" shape-rendering="crispEdges">
<title id="t">Awesome Homebrew Games</title>
<desc id="d">Pixel lettering reading Awesome Homebrew Games next to a game cartridge.</desc>
<rect width="${W}" height="${H}" fill="${VOID}"/>
${text("AWESOME", LEFT, 56, 8, PAPER)}
${text("HOMEBREW", LEFT, 130, 18, INK)}
${text("GAMES", LEFT, 280, 18, PAPER)}
${sprite(CARTRIDGE, 960, 56, 12, CART_COLORS)}
${text("THE BEST GAMES AND WHERE TO FIND THEM", LEFT, 436, 5, "#9a9aa6")}
</svg>
`;

mkdirSync(join(ROOT, "assets"), { recursive: true });
writeFileSync(join(ROOT, "assets/banner.svg"), svg);
console.log(`wrote assets/banner.svg (${svg.length} bytes)`);
