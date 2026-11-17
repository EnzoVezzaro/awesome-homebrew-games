(function () {
  "use strict";

  var h = window.AHG.dom.h;

  function showLoadError() {
    var state = document.getElementById("shelf-state");
    state.hidden = false;
    state.textContent = "";
    state.appendChild(h("p", { class: "state-title", text: "The collection did not load." }));
    state.appendChild(h("p", { text: "The script that carries the list failed to load. The same list is in the README, and your assistant can read llms.txt." }));
    state.appendChild(
      h("p", {}, [
        h("a", { class: "btn", href: "https://github.com/EnzoVezzaro/awesome-homebrew-games#collection", rel: "noopener", text: "Open the README" }),
      ]),
    );
    ["chips", "count", "open-palette", "pick", "prompt"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    document.querySelector(".shelf-layout").hidden = true;
    Array.prototype.forEach.call(document.querySelectorAll(".hud-nav, .hud-skip, .skip"), function (el) { el.hidden = true; });
    var cart = document.getElementById("cart");
    cart.addEventListener("click", function () {
      document.getElementById("boot-status").textContent = "The collection is missing, so the console has nothing to boot.";
    });
  }

  function start() {
    window.AHG.xp.render();
    var data = window.HOMEBREW;
    if (!data || !Array.isArray(data.entries) || !Array.isArray(data.categories)) {
      showLoadError();
      return;
    }
    // Each part starts on its own, so one failure does not take the others down.
    [
      function () { window.AHG.shelf.init(data); },
      function () { window.AHG.bootInit(data); },
      function () { window.AHG.paletteInit(data); },
      function () { window.AHG.promptInit(data); },
    ].forEach(function (init) {
      try {
        init();
      } catch (error) {
        if (window.console) console.error(error);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
