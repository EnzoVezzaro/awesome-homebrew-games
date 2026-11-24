// Platform filter, category scenes and the sticky device screen that follows the scroll.
(function () {
  "use strict";

  var h = window.AHG.dom.h;
  var host = window.AHG.dom.host;
  var sprite = window.AHG.sprite;

  var data = null;
  var platform = null;
  var listeners = [];
  var sceneObserver = null;

  function platformLabel(p) {
    return p === "Multi" ? "Cross-platform" : p;
  }

  function matches(entry) {
    return platform === null || entry.platforms.indexOf(platform) !== -1;
  }

  function visibleEntries() {
    return data.entries.filter(matches);
  }

  function platformCounts() {
    var counts = {};
    data.entries.forEach(function (e) {
      e.platforms.forEach(function (p) {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(function (p) { return { name: p, count: counts[p] }; })
      .sort(function (a, b) {
        if (a.name === "Multi") return 1;
        if (b.name === "Multi") return -1;
        return b.count - a.count || a.name.localeCompare(b.name);
      });
  }

  function onOpen(entry) {
    window.AHG.xp.award("open:" + entry.id, 5, "for opening " + entry.name);
    if (window.AHG.track) window.AHG.track("entry_opened", { entry_id: entry.id, source: "shelf", platform: platform });
  }

  function renderChips() {
    var wrap = document.getElementById("chips");
    wrap.textContent = "";
    var all = h("button", { class: "chip", type: "button", "aria-pressed": String(platform === null), "data-platform": "" }, [
      "All places ", h("span", { class: "chip-n", text: String(data.entries.length) }),
    ]);
    wrap.appendChild(all);
    platformCounts().forEach(function (p) {
      wrap.appendChild(
        h("button", { class: "chip", type: "button", "aria-pressed": String(platform === p.name), "data-platform": p.name }, [
          platformLabel(p.name) + " ",
          h("span", { class: "chip-n", text: String(p.count) }),
        ]),
      );
    });
  }

  function renderCount() {
    var n = visibleEntries().length;
    var total = data.entries.length;
    var el = document.getElementById("count");
    el.textContent = platform === null
      ? "Showing all " + total + " places."
      : "Showing " + n + " of " + total + " places for " + platformLabel(platform) + ".";
  }

  function entryRow(entry) {
    var mark = h("span", { class: "row-mark" }, []);
    mark.innerHTML = sprite.svg(entry.id);
    return h("li", { class: "row" }, [
      h("a", { class: "row-link", href: entry.url, target: "_blank", rel: "noopener noreferrer", onclick: function () { onOpen(entry); } }, [
        mark,
        h("span", { class: "row-main" }, [
          h("span", { class: "row-heading" }, [
            h("span", { class: "row-name", text: entry.name }),
            entry.featured ? h("span", { class: "featured-tag", text: "Featured" }) : null,
          ]),
          h("span", { class: "row-blurb", text: entry.blurb }),
        ]),
        h("span", { class: "row-meta" }, [
          h("span", { class: "row-host", text: host(entry.url) }),
          h("span", { class: "row-tags", text: entry.platforms.map(platformLabel).join(" / ") }),
        ]),
        h("span", { class: "sr", text: " (opens in a new tab)" }),
      ]),
    ]);
  }

  function coverFor(entry, index) {
    var tones = ["#dbff00", "#e8bbfb", "#fea514", "#dbff00"];
    var tone = tones[index % tones.length];
    var art = h("span", { class: "cover-art" }, []);
    art.innerHTML = sprite.svg(entry.id, { body: tone, eye: "#121212" });
    return h("li", { class: "cover-item" }, [
      h("a", {
        class: "cover",
        href: entry.url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: "--cover-tone:" + tone,
        onclick: function () { onOpen(entry); },
      }, [
        art,
        h("span", { class: "cover-heading" }, [
          h("span", { class: "cover-name", text: entry.name }),
          entry.featured ? h("span", { class: "featured-tag", text: "Featured" }) : null,
        ]),
        h("span", { class: "cover-blurb", text: entry.blurb }),
        h("span", { class: "cover-meta", text: entry.platforms.map(platformLabel).join(" / ") + "  " + host(entry.url) }),
        h("span", { class: "sr", text: " (opens in a new tab)" }),
      ]),
    ]);
  }

  function scene(category, entries) {
    var mark = h("span", { class: "scene-mark" }, []);
    mark.innerHTML = sprite.svg("cat:" + category.id);
    var isRail = category.id === "games";
    var list = isRail
      ? h("ul", { class: "rail", role: "list" }, entries.map(coverFor))
      : h("ul", { class: "rows", role: "list" }, entries.map(entryRow));
    var controls = null;
    if (isRail) {
      var step = function (dir) {
        return function () {
          var first = list.querySelector(".cover-item");
          var by = (first ? first.getBoundingClientRect().width : 240) + 16;
          list.scrollBy({ left: dir * by, behavior: window.AHG.dom.reducedMotion() ? "auto" : "smooth" });
        };
      };
      controls = h("div", { class: "rail-ctl" }, [
        h("button", { class: "chip", type: "button", "aria-label": "Scroll the games left", onclick: step(-1), text: "Prev" }),
        h("button", { class: "chip", type: "button", "aria-label": "Scroll the games right", onclick: step(1), text: "Next" }),
      ]);
    }
    return h("section", { class: "scene" + (isRail ? " scene-rail" : ""), id: "scene-" + category.id, "data-cat": category.id, "aria-labelledby": "h-" + category.id }, [
      h("header", { class: "scene-head" }, [
        mark,
        h("h3", { id: "h-" + category.id, text: category.title }),
        h("span", { class: "scene-n", text: entries.length + (entries.length === 1 ? " place" : " places") }),
        h("p", { class: "scene-blurb", text: category.blurb }),
      ]),
      controls,
      list,
    ]);
  }

  function renderScenes() {
    var root = document.getElementById("scenes");
    root.textContent = "";
    data.categories.forEach(function (category) {
      var entries = data.entries.filter(function (e) {
        return e.category === category.id && matches(e);
      });
      if (entries.length > 0) root.appendChild(scene(category, entries));
    });
    observeScenes();
  }

  // ---- sticky device -------------------------------------------------------

  var device = null;
  var screen = null;

  function buildDevice() {
    var hero = document.getElementById("console-hero");
    var clone = hero.cloneNode(true);
    clone.removeAttribute("id");
    Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (n) { n.removeAttribute("id"); });
    var cart = clone.querySelector(".cart-wrap");
    if (cart) cart.remove();
    clone.classList.add("console-mini", "is-booted");
    document.getElementById("shelf-device").appendChild(clone);
    screen = clone.querySelector(".screen-inner");
    device = clone;
  }

  function showOnScreen(categoryId) {
    if (!screen) return;
    var category = data.categories.filter(function (c) { return c.id === categoryId; })[0];
    if (!category) return;
    var n = data.entries.filter(function (e) { return e.category === categoryId && matches(e); }).length;
    var art = h("div", { class: "screen-art" }, []);
    art.innerHTML = sprite.svg("cat:" + category.id, { body: "#dbff00", eye: "#050505" });
    screen.textContent = "";
    screen.appendChild(art);
    screen.appendChild(h("p", { class: "screen-title", text: category.title }));
    screen.appendChild(h("p", { class: "screen-sub", text: n + (n === 1 ? " PLACE" : " PLACES") }));
    var inScene = data.entries.filter(function (e) { return e.category === categoryId && matches(e); });
    var tally = {};
    inScene.forEach(function (e) { e.platforms.forEach(function (p) { tally[p] = (tally[p] || 0) + 1; }); });
    var top = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a] || a.localeCompare(b); }).slice(0, 3);
    screen.appendChild(h("p", { class: "screen-sub", text: "FOR " + top.map(function (p) { return platformLabel(p).toUpperCase(); }).join(" / ") }));
    if (inScene[0]) screen.appendChild(h("p", { class: "screen-line go", text: "START " + host(inScene[0].url).toUpperCase() }));
  }

  function observeScenes() {
    if (sceneObserver) sceneObserver.disconnect();
    var scenes = document.querySelectorAll(".scene");
    if (scenes.length === 0) return;
    showOnScreen(scenes[0].getAttribute("data-cat"));
    if (!("IntersectionObserver" in window)) return;
    sceneObserver = new IntersectionObserver(
      function (records) {
        records.forEach(function (r) {
          if (r.isIntersecting) showOnScreen(r.target.getAttribute("data-cat"));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    scenes.forEach(function (s) { sceneObserver.observe(s); });
  }

  // ---- public --------------------------------------------------------------

  function render() {
    renderChips();
    renderCount();
    renderScenes();
  }

  function setPlatform(next) {
    platform = next;
    render();
    listeners.forEach(function (fn) { fn(platform); });
  }

  function init(collection) {
    data = collection;
    buildDevice();
    render();
    document.getElementById("chips").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-platform]");
      if (!btn) return;
      var value = btn.getAttribute("data-platform");
      var next = value === "" || value === platform ? null : value;
      setPlatform(next);
      if (next !== null) {
        window.AHG.xp.award("filter", 10, "for picking a machine");
        if (window.AHG.track) window.AHG.track("platform_selected", { platform: next });
        var shelf = document.getElementById("shelf");
        if (shelf.getBoundingClientRect().top > window.innerHeight * 0.6) {
          window.setTimeout(function () {
            shelf.scrollIntoView({ behavior: window.AHG.dom.reducedMotion() ? "auto" : "smooth", block: "start" });
          }, 220);
        }
      }
      var again = document.querySelector('#chips [data-platform="' + CSS.escape(value) + '"]');
      if (again) again.focus();
    });
  }

  window.AHG.shelf = {
    init: init,
    setPlatform: setPlatform,
    getPlatform: function () { return platform; },
    onChange: function (fn) { listeners.push(fn); },
    platformLabel: platformLabel,
    platformCounts: platformCounts,
  };
})();
