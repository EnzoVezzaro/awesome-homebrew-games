// Copies the SKILL.md file verbatim to the clipboard.
(function () {
  "use strict";

  var button = document.getElementById("copy-skill");
  var status = document.getElementById("copy-status");
  if (!button || !status) return;

  function say(message) { status.textContent = message; }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (_error) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  button.addEventListener("click", function () {
    say("");
    fetch("skill/SKILL.md", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("skill unavailable");
        return response.text();
      })
      .then(function (text) {
        if (!text) throw new Error("empty skill");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text).then(function () {
            return text;
          }, function () {
            return fallbackCopy(text) ? text : Promise.reject(new Error("copy blocked"));
          });
        }
        return fallbackCopy(text) ? text : Promise.reject(new Error("copy blocked"));
      })
      .then(function () {
        say("Skill copied. Paste it into your assistant.");
        if (window.AHG && window.AHG.track) window.AHG.track("skill_copied");
      })
      .catch(function () {
        say("Copy failed. Download SKILL.md and paste the file.");
      });
  });
})();
