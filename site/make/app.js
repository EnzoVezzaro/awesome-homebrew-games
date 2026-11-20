// A static, accessible SPA: no accounts, remote API, AI calls or hardware writes.
(function () {
  "use strict";
  const model = window.AHGMake;
  if (!model) return;

  const $ = function (id) { return document.getElementById(id); };
  const state = { platform: "gb", target: "sd", result: null, fileName: "", transferred: false, readToken: 0 };

  const platformSelect = $("platform");
  const targetSelect = $("target");
  const fileInput = $("game-file");
  const copyButton = $("copy-prompt");
  const transferButton = $("transfer-done");
  const playChecks = Array.from(document.querySelectorAll(".play-check"));

  function text(id, value) { $(id).textContent = value; }
  function add(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }
  function resetTransfer() {
    state.transferred = false;
    $("connected").checked = false;
    $("backup-check").checked = false;
    $("rights-check").checked = false;
    playChecks.forEach(function (c) { c.checked = false; });
    renderTransfer();
  }

  function renderTemplates() {
    const container = $("templates");
    container.replaceChildren();
    model.profile(state.platform).examples.forEach(function (item) {
      const a = add("a", "maker-template");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const meta = add("span", "maker-template-type", item.type);
      const name = add("strong", "", item.name + " ↗");
      const note = add("span", "maker-template-note", item.note);
      a.append(meta, name, note);
      container.appendChild(a);
    });
  }
  function renderTargets() {
    const p = model.profile(state.platform);
    targetSelect.replaceChildren();
    p.targets.forEach(function (item) {
      const option = new Option(item.name, item.id);
      targetSelect.appendChild(option);
    });
    state.target = p.targets[0].id;
    targetSelect.value = state.target;
  }
  function renderConnection() {
    const target = model.targetFor(state.platform, state.target);
    text("connect-instructions", target.connect);
    const link = $("connect-docs");
    link.href = target.docs;
    link.textContent = "Check device / tool documentation ↗";
    text("side-platform", model.profile(state.platform).name);
    text("side-target", target.name);
  }
  function renderReport() {
    const container = $("file-report");
    container.replaceChildren();
    container.dataset.level = state.result ? state.result.level : "none";
    if (!state.result) {
      container.append(add("strong", "", "No game file inspected yet."),
        add("p", "", "Export your original game first. This is a local file check only."));
      text("side-file", "Waiting for a game file");
      return;
    }
    container.appendChild(add("strong", "", state.result.summary));
    const list = add("ul");
    state.result.details.forEach(function (line) { list.appendChild(add("li", "", line)); });
    container.appendChild(list);
    text("side-file", state.fileName + " · " + state.result.level.toUpperCase());
  }
  function renderPrompt() {
    text("ai-prompt", model.buildPrompt(state.platform, state.target, $("device-model").value, state.result, $("device-notes").value));
    text("copy-status", "");
  }
  function renderTransfer() {
    const target = model.targetFor(state.platform, state.target);
    const list = $("transfer-plan");
    list.replaceChildren();
    target.transfer.forEach(function (instruction) { list.appendChild(add("li", "", instruction)); });
    text("transfer-warning", target.caution);
    const prepared = $("connected").checked && $("backup-check").checked && $("rights-check").checked;
    const validFile = state.result && state.result.level !== "error";
    transferButton.disabled = !prepared || !validFile || state.transferred;
    if (state.transferred) {
      text("transfer-status", "Transfer marked complete by you. This page cannot verify a physical write. Continue with the playtest.");
      transferButton.textContent = "Transfer marked complete ✓";
    } else {
      transferButton.textContent = "I've completed the transfer";
      text("transfer-status", validFile
        ? (prepared ? "Ready to confirm after you finish the steps in your external tool." : "Check the exact device, backups and rights before confirming a transfer.")
        : "Inspect a matching non-empty game file to enable this step.");
    }
    renderPlay();
  }
  function renderPlay() {
    const all = playChecks.every(function (el) { return el.checked; });
    if (all && state.transferred) text("play-status", "Nice work! Your manual transfer and playtest checklist are complete.");
    else if (all) text("play-status", "Checklist complete. If you used a real device, confirm the transfer step above too.");
    else text("play-status", "Run the game in a compatible emulator / runtime, then check off the tests.");
    const target = model.targetFor(state.platform, state.target);
    const link = $("test-link");
    // The target documentation gives the compatible runtime/uploader for each platform.
    link.href = state.platform === "gb" || state.platform === "nes"
      ? "https://www.retroarch.com/"
      : state.platform === "arduboy" ? "https://www.arduboy.com/emulator" : target.docs;
    link.textContent = (state.platform === "gb" || state.platform === "nes" ? "Open emulator resources" : "Open testing runtime") + " ↗";
  }
  function updateAll() {
    text("file-help", "Expected " + model.profile(state.platform).extension + ". Nothing is uploaded.");
    renderTemplates();
    renderConnection();
    renderReport();
    renderPrompt();
    renderTransfer();
  }

  platformSelect.addEventListener("change", function () {
    state.readToken++;
    state.platform = platformSelect.value;
    state.result = null; state.fileName = "";
    fileInput.value = "";
    renderTargets();
    resetTransfer();
    updateAll();
  });
  targetSelect.addEventListener("change", function () {
    state.target = targetSelect.value;
    resetTransfer();
    renderConnection();
    renderPrompt();
    renderTransfer();
  });
  $("device-model").addEventListener("input", renderPrompt);
  $("device-notes").addEventListener("input", renderPrompt);
  $("template-search").addEventListener("submit", function () {
    const term = $("template-query").value.trim();
    $("template-search-q").value = [model.profile(state.platform).name, "homebrew game starter", term].filter(Boolean).join(" ");
  });
  ["connected", "rights-check", "backup-check"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      if (state.transferred) {
        state.transferred = false;
        playChecks.forEach(function (c) { c.checked = false; });
      }
      renderTransfer();
    });
  });
  playChecks.forEach(function (el) { el.addEventListener("change", renderPlay); });

  fileInput.addEventListener("change", async function () {
    const chosen = fileInput.files && fileInput.files[0];
    const token = ++state.readToken;
    state.result = null;
    state.fileName = "";
    state.transferred = false;
    playChecks.forEach(function (c) { c.checked = false; });
    if (!chosen) { renderReport(); renderPrompt(); renderTransfer(); return; }
    state.fileName = chosen.name;
    const currentPlatform = state.platform;
    const currentTarget = state.target;
    text("side-file", "Inspecting selected file locally…");
    try {
      const sample = new Uint8Array(await chosen.slice(0, 4096).arrayBuffer());
      if (token !== state.readToken || currentPlatform !== state.platform || currentTarget !== state.target) return;
      state.result = model.inspectBytes(state.platform, sample, chosen.name, chosen.size);
    } catch (_error) {
      if (token !== state.readToken) return;
      state.result = { level: "error", summary: "Could not read this file locally.", details: ["Try exporting the game again and selecting it from your computer."] };
    }
    renderReport();
    renderPrompt();
    renderTransfer();
  });

  transferButton.addEventListener("click", function () {
    if (transferButton.disabled) return;
    state.transferred = true;
    renderTransfer();
  });

  function fallbackCopy() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($("ai-prompt"));
    selection.removeAllRanges(); selection.addRange(range);
    try { return document.execCommand("copy"); }
    catch (_error) { return false; }
    finally { selection.removeAllRanges(); }
  }
  copyButton.addEventListener("click", function () {
    const value = $("ai-prompt").textContent;
    function done(ok) { text("copy-status", ok ? "Copied. Paste it into your AI assistant." : "Copy blocked. Select the prompt and copy it manually."); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(fallbackCopy()); });
    } else done(fallbackCopy());
  });

  renderTargets();
  updateAll();
})();
