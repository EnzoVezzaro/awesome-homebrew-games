import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const code = readFileSync(new URL("site/make/logic.js", root), "utf8");
const context = vm.createContext({});
vm.runInContext(code, context);
const make = context.AHGMake;

test("every maker platform has toolchains and documented transfer paths", () => {
  for (const [key, platform] of Object.entries(make.PLATFORMS)) {
    assert.ok(platform.examples.length >= 2, key);
    assert.ok(platform.targets.length >= 1, key);
    for (const source of platform.examples) assert.match(source.url, /^https:\/\//);
    for (const target of platform.targets) {
      assert.ok(target.connect && target.transfer.length > 0 && target.caution);
      assert.match(target.docs, /^https:\/\//);
    }
  }
});
test("Game Boy header inspection reports a recognized format without overstating compatibility", () => {
  const bytes = new Uint8Array(4096);
  bytes.set([0xce, 0xed, 0x66, 0x66], 0x104);
  bytes.set([84, 69, 83, 84], 0x134);
  bytes[0x147] = 0x19;
  bytes[0x148] = 0x03;
  const result = make.inspectBytes("gb", bytes, "my-first-game.gb", 32768);
  assert.equal(result.level, "ok");
  assert.match(result.summary, /Compatibility still needs checking/);
  assert.ok(result.details.some((line) => line.includes("TEST")));
});
test("Game Boy rejects tiny files and warns on unrecognized headers", () => {
  assert.equal(make.inspectBytes("gb", new Uint8Array(20), "game.gb", 20).level, "error");
  assert.equal(make.inspectBytes("gb", new Uint8Array(4096), "game.gb", 32768).level, "warn");
});
test("NES header recognized; unexpected platform extension rejected", () => {
  const data = new Uint8Array(16);
  data.set([78, 69, 83, 26], 0);
  data[4] = 2; data[5] = 1;
  assert.equal(make.inspectBytes("nes", data, "original.nes", 32784).level, "ok");
  assert.equal(make.inspectBytes("gb", data, "original.nes", 32784).level, "error");
});
test("empty and unknown format inspection cannot be confirmed", () => {
  assert.equal(make.inspectBytes("pico", new Uint8Array(), "cart.p8", 0).level, "error");
  assert.equal(make.inspectBytes("tic", new Uint8Array([2, 3]), "cart.tic", 2).level, "warn");
  assert.equal(make.inspectBytes("arduboy", new Uint8Array([65]), "cart.hex", 1).level, "warn");
  assert.equal(make.inspectBytes("pico", new Uint8Array([12]), "cart.p8.png", 1).level, "warn");
});
test("generated prompt includes hardware choice, source guidance and human approval", () => {
  const prompt = make.buildPrompt("gb", "writer", "My own writable cart", { summary: "Header valid", details: ["size checked"] });
  assert.match(prompt, /My own writable cart/);
  assert.match(prompt, /Header valid/);
  assert.match(prompt, /back up saves/);
  assert.match(prompt, /explicit confirmation/);
  assert.match(prompt, /Never assume USB access/);
});
test("landing and single-page maker workflow are linked and have five stages", () => {
  const landing = readFileSync(new URL("site/index.html", root), "utf8");
  const page = readFileSync(new URL("site/make/index.html", root), "utf8");
  assert.match(landing, /href="make\/"[^>]*>Make Your Own/);
  assert.match(landing, /id="make"/);
  for (let i = 1; i <= 5; i++) assert.ok(page.includes('id="step-' + i + '"'), "step " + i);
  assert.match(page, /id="game-file"/);
  assert.match(page, /id="ai-prompt"/);
  assert.match(page, /id="backup-check"/);
  assert.match(page, /id="rights-check"/);
});
