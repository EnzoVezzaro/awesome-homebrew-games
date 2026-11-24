import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("analytics inits PostHog once, without autocapture or session replay", () => {
  const script = read("site/js/analytics.js");
  assert.match(script, /phc_oA9YRYsvPM4TWSAfaGwHzKeXJPsEEQKGunhTkzqALPyt/);
  assert.match(script, /api_host: "https:\/\/us\.i\.posthog\.com"/);
  assert.match(script, /autocapture: false/);
  assert.match(script, /disable_session_recording: true/);
  assert.equal(script.match(/posthog\.init\(/g).length, 1);
  assert.match(script, /window\.AHG\.track = track/);
});

test("both pages load the analytics script before the app scripts", () => {
  const landing = read("site/index.html");
  const make = read("site/make/index.html");
  assert.ok(landing.indexOf('src="js/analytics.js"') > -1);
  assert.ok(landing.indexOf('src="js/analytics.js"') < landing.indexOf('src="js/main.js"'));
  assert.ok(make.indexOf('src="../js/analytics.js"') > -1);
  assert.ok(make.indexOf('src="../js/analytics.js"') < make.indexOf('src="copy-skill.js"'));
});

test("key actions send events with no free text", () => {
  const sources = {
    "site/js/boot.js": ["cartridge_inserted"],
    "site/js/shelf.js": ["platform_selected", "entry_opened"],
    "site/js/palette.js": ["palette_opened", "entry_opened"],
    "site/js/prompt.js": ["prompt_copied"],
    "site/make/copy-skill.js": ["skill_copied"],
  };
  for (const [file, events] of Object.entries(sources)) {
    const src = read(file);
    for (const name of events) assert.ok(src.includes('track("' + name + '"'), file + " " + name);
  }
  assert.doesNotMatch(read("site/js/palette.js"), /track\([^)]*input\.value/);
});
