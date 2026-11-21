import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("landing page links to Make It Real and drops the old workshop", () => {
  const landing = read("site/index.html");
  assert.match(landing, /href="make\/"[^>]*>Make It Real/);
  assert.match(landing, /id="make"/);
  assert.doesNotMatch(landing, /Make Your Own/);
  assert.doesNotMatch(landing, /maker-cta|maker-demo|maker-route|maker-cta\.js/);
});

test("Make It Real page offers copy and download without a wizard", () => {
  const page = read("site/make/index.html");
  assert.match(page, /<title>Make It Real \| Awesome Homebrew Games<\/title>/);
  assert.match(page, /id="copy-skill"[^>]*>Copy instructions</);
  assert.match(page, /id="copy-status"[^>]*role="status"/);
  assert.match(page, /href="skill\/SKILL\.md"[^>]*download/);
  assert.match(page, /href="skill\/README\.md"/);
  assert.match(page, /<script src="copy-skill\.js" defer><\/script>/);
  for (const id of ["get-skill", "interview", "guide", "safety"]) {
    assert.ok(page.includes('id="' + id + '"'), id);
  }
  for (const stale of ['id="step-1"', 'id="game-file"', 'id="ai-prompt"', 'logic.js', 'app.js', 'finale.js', 'search.js', 'transfer-done', 'maker-complete', "marked complete", "The assistant writes instructions. You run the transfer in your own tool."]) {
    assert.ok(!page.includes(stale), "stale or simulated state: " + stale);
  }
});

test("copy button reads the whole skill file and copies its exact text", () => {
  const script = read("site/make/copy-skill.js");
  assert.match(script, /fetch\("skill\/SKILL\.md", \{ cache: "no-store" \}\)/);
  assert.match(script, /navigator\.clipboard\.writeText\(text\)/);
  assert.match(script, /fallbackCopy\(text\)/);
  assert.doesNotMatch(script, /curl\s|npm\s|git clone/);
  assert.match(script, /Paste it into your assistant/);
});

test("skill file is portable Markdown with an interview and a transfer guide", () => {
  const skill = read("site/make/skill/SKILL.md");
  assert.match(skill, /^---\nname: make-it-real\n/);
  assert.match(skill, /description:.*Interview about the exact console/s);
  for (const topic of ["Console:", "Cartridge and writer:", "Computer:", "ROM file:", "full path, format, size and where it came from"]) {
    assert.ok(skill.includes(topic), topic);
  }
  for (const section of ["## 2. Consult reliable documentation", "## 3. Preserve the original and back up", "## 4. Confirm before a destructive step"]) {
    assert.ok(skill.includes(section), section);
  }
  for (const section of ["Before you start", "Backups", "Transfer steps in your tool", "Verify", "Playtest"]) {
    assert.ok(skill.includes("### " + section), section);
  }
  for (const rule of [
    "Keep the source ROM untouched",
    "Ask for explicit confirmation immediately before any format, erase or write",
    "Say the transfer succeeded only after verification and a playtest",
    "Never ask for a commercial ROM and never help bypass DRM",
    "Never invent a command, a compatibility claim, a backup or a result",
    "do not have a tool, or lack permission, give the person the exact steps",
  ]) {
    assert.ok(skill.includes(rule), rule);
  }
});

test("install guide documents copy, path and download", () => {
  const guide = read("site/make/skill/README.md");
  assert.match(guide, /\.agents\/skills\/make-it-real\/SKILL\.md/);
  assert.match(guide, /[Dd]ownload \[SKILL\.md\]\(SKILL\.md\)/);
  assert.match(guide, /Copy instructions/);
  assert.match(guide, /must ask you to confirm/);
});

test("retired wizard scripts are gone", () => {
  for (const file of ["site/make/app.js", "site/make/logic.js", "site/make/search.js", "site/make/finale.js", "site/js/maker-cta.js"]) {
    assert.ok(!existsSync(new URL(file, root)), file);
  }
});
