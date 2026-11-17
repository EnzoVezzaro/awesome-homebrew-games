// The hero: click or press Enter on the cartridge, the console boots, the page scrolls to the shelf.
(function () {
  "use strict";

  var h = window.AHG.dom.h;
  var reduced = window.AHG.dom.reducedMotion;

  function idleScreen(screen) {
    screen.textContent = "";
    screen.appendChild(h("p", { class: "screen-line", text: "AHG-1 HANDHELD" }));
    screen.appendChild(h("p", { class: "screen-line dim", text: "NO CARTRIDGE" }));
    screen.appendChild(h("p", { class: "screen-line" }, [h("span", { class: "caret", text: "_" })]));
  }

  function bootLines(data) {
    var platforms = {};
    data.entries.forEach(function (e) {
      e.platforms.forEach(function (p) { if (p !== "Multi") platforms[p] = true; });
    });
    return [
      "CARTRIDGE DETECTED",
      "READ COLLECTION  OK",
      "READ LLMS.TXT  OK",
      data.entries.length + " PLACES",
      data.categories.length + " SCENES",
      Object.keys(platforms).length + " PLATFORMS",
      "READY",
    ];
  }

  function init(data) {
    var consoleEl = document.getElementById("console-hero");
    var screen = document.getElementById("screen-hero");
    var cart = document.getElementById("cart");
    var status = document.getElementById("boot-status");
    var sprite = document.getElementById("cart-sprite");
    var inserted = false;

    sprite.innerHTML = window.AHG.sprite.svg("ahg", { body: "#0b0b0b", eye: "#dbff00" });
    var lede = document.getElementById("boot-lede");
    var seen = {};
    data.entries.forEach(function (e) { e.platforms.forEach(function (p) { if (p !== "Multi") seen[p] = true; }); });
    lede.textContent += " " + data.entries.length + " places, " + Object.keys(seen).length + " platforms.";
    idleScreen(screen);

    function finish() {
      status.textContent = "The cartridge is in. Choose your machine.";
      consoleEl.classList.add("is-booted");
      window.setTimeout(function () {
        var pick = document.getElementById("pick");
        var scrolledAway = window.scrollY > window.innerHeight * 0.6;
        if (!scrolledAway) pick.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      }, reduced() ? 0 : 900);
    }

    function insert() {
      if (inserted) return;
      inserted = true;
      consoleEl.classList.add("is-inserted");
      cart.setAttribute("aria-disabled", "true");
      cart.tabIndex = -1;
      status.textContent = "Booting.";
      window.AHG.xp.award("insert", 30, "for inserting the cartridge");

      screen.textContent = "";
      var lines = bootLines(data);
      lines.forEach(function (text, i) {
        var p = h("p", { class: "screen-line" + (i === lines.length - 1 ? " go" : ""), text: text });
        window.setTimeout(function () {
          screen.appendChild(p);
          if (i === lines.length - 1) finish();
        }, reduced() ? 0 : 520 + i * 260);
      });
    }

    cart.addEventListener("click", insert);
    window.AHG.boot = { insert: insert };
  }

  window.AHG.bootInit = init;
})();
