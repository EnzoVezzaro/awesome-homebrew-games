// Prompt Pad: writes a prompt the visitor pastes into their own assistant. Sends nothing anywhere.
(function () {
  "use strict";

  var h = window.AHG.dom.h;
  var LLMS_URL = "https://raw.githubusercontent.com/EnzoVezzaro/awesome-homebrew-games/main/llms.txt";

  var GOALS = {
    play: "Where do I find new games for it, and which entries should I open first?",
    make: "I want to write my first game for it. Give me a reading order of the entries and say what each one is for.",
    hardware: "I want to play homebrew on real hardware. Which entries cover flash carts, firmware or emulation for it?",
    jam: "Which jams or competitions can I enter, and what do I need to get started?",
  };

  function buildPrompt(platform, goal) {
    var who = platform ? "My platform is " + platform + "." : "Any platform works for me.";
    return [
      "Read " + LLMS_URL + ".",
      who + " " + (GOALS[goal] || GOALS.play),
      "Use only entries from that file. Name each one and say what I will find there.",
    ].join("\n");
  }

  function init(data) {
    var select = document.getElementById("pad-platform");
    var out = document.getElementById("pad-out");
    var copy = document.getElementById("pad-copy");
    var status = document.getElementById("pad-status");
    var shelf = window.AHG.shelf;

    select.appendChild(h("option", { value: "", text: "Any platform" }));
    shelf.platformCounts().forEach(function (p) {
      if (p.name === "Multi") return;
      select.appendChild(h("option", { value: p.name, text: p.name }));
    });

    function goal() {
      var checked = document.querySelector('input[name="goal"]:checked');
      return checked ? checked.value : "play";
    }

    function refresh() {
      out.textContent = buildPrompt(select.value, goal());
      status.textContent = "";
    }

    function fallbackCopy() {
      var range = document.createRange();
      range.selectNodeContents(out);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try {
        return document.execCommand("copy");
      } catch (e) {
        return false;
      }
    }

    copy.addEventListener("click", function () {
      var text = out.textContent;
      var done = function (ok) {
        status.textContent = ok ? "Copied. Paste it into your assistant." : "Copy was blocked. Select the text and copy it by hand.";
        if (ok) window.AHG.xp.award("copy", 20, "for copying a prompt");
        if (ok && window.AHG.track) window.AHG.track("prompt_copied", { platform: select.value || null });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy()); });
      } else {
        done(fallbackCopy());
      }
    });

    document.getElementById("pad").addEventListener("submit", function (event) { event.preventDefault(); });
    select.addEventListener("change", refresh);
    document.getElementById("pad").addEventListener("change", function (event) {
      if (event.target.name === "goal") refresh();
    });

    shelf.onChange(function (platform) {
      if (platform === null || platform === "Multi") select.value = "";
      else select.value = platform;
      refresh();
    });

    refresh();
  }

  window.AHG.promptInit = init;
})();
