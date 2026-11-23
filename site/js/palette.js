// Search palette. Opens with "/" or Ctrl/Cmd+K, closes with Esc, Enter opens the top result.
(function () {
  "use strict";

  var h = window.AHG.dom.h;
  var host = window.AHG.dom.host;
  var sprite = window.AHG.sprite;

  var MAX = 8;

  function score(entry, categoryTitle, terms) {
    var name = entry.name.toLowerCase();
    var plats = entry.platforms.join(" ").toLowerCase();
    var blurb = entry.blurb.toLowerCase();
    var cat = categoryTitle.toLowerCase();
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var s = 0;
      if (name.indexOf(t) === 0) s = 6;
      else if (name.indexOf(t) !== -1) s = 4;
      else if (plats.indexOf(t) !== -1) s = 3;
      else if (cat.indexOf(t) !== -1) s = 2;
      else if (blurb.indexOf(t) !== -1) s = 1;
      if (s === 0) return 0;
      total += s;
    }
    return total;
  }

  function search(data, query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return data.entries.slice(0, MAX);
    var titles = {};
    data.categories.forEach(function (c) { titles[c.id] = c.title; });
    return data.entries
      .map(function (e) { return { e: e, s: score(e, titles[e.category] || "", terms) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, MAX)
      .map(function (r) { return r.e; });
  }

  function init(data) {
    var dialog = document.getElementById("palette");
    var input = document.getElementById("palette-input");
    var list = document.getElementById("palette-list");
    var empty = document.getElementById("palette-empty");
    var statusEl = document.getElementById("palette-status");
    document.getElementById("palette-form").addEventListener("submit", function (event) { event.preventDefault(); });
    var openBtn = document.getElementById("open-palette");
    var returnTo = null;

    if (typeof dialog.showModal !== "function") {
      openBtn.hidden = true;
      return;
    }

    function render() {
      var results = search(data, input.value);
      list.textContent = "";
      empty.hidden = results.length > 0;
      statusEl.textContent = results.length === 0 ? "No results." : results.length + (results.length === 1 ? " result." : " results.");
      if (results.length === 0) {
        empty.textContent = 'Nothing matches "' + input.value.trim() + '". Try a platform such as Game Boy, or a word such as jam.';
      }
      results.forEach(function (entry) {
        var mark = h("span", { class: "pal-mark" }, []);
        mark.innerHTML = sprite.svg(entry.id);
        list.appendChild(
          h("li", {}, [
            h("a", {
              class: "pal-row",
              href: entry.url,
              target: "_blank",
              rel: "noopener noreferrer",
              onclick: function () {
                window.AHG.xp.award("open:" + entry.id, 5, "for opening " + entry.name);
                if (window.AHG.track) window.AHG.track("entry_opened", { entry_id: entry.id, source: "palette" });
              },
            }, [
              mark,
              h("span", { class: "pal-main" }, [
                h("span", { class: "pal-name", text: entry.name }),
                h("span", { class: "pal-blurb", text: entry.blurb }),
              ]),
              h("span", { class: "pal-host", text: host(entry.url) }),
            ]),
          ]),
        );
      });
    }

    function open() {
      if (dialog.open) return;
      returnTo = document.activeElement;
      input.value = "";
      render();
      dialog.showModal();
      input.focus();
      window.AHG.xp.award("palette", 5, "for searching");
      if (window.AHG.track) window.AHG.track("palette_opened");
    }

    function close() {
      if (dialog.open) dialog.close();
    }

    dialog.addEventListener("close", function () {
      if (returnTo && typeof returnTo.focus === "function") returnTo.focus();
    });
    // Close only when the press and the release both land on the backdrop,
    // so dragging a text selection out of the field does not dismiss the dialog.
    var pressedOnBackdrop = false;
    dialog.addEventListener("mousedown", function (event) { pressedOnBackdrop = event.target === dialog; });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog && pressedOnBackdrop) close();
      pressedOnBackdrop = false;
    });
    input.addEventListener("input", render);
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      var rows = Array.prototype.slice.call(list.querySelectorAll("a"));
      var at = rows.indexOf(document.activeElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        (rows[at + 1] || rows[0] || input).focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (at <= 0) input.focus();
        else rows[at - 1].focus();
      } else if (event.key === "Enter" && document.activeElement === input && rows[0]) {
        event.preventDefault();
        rows[0].click();
      }
    });

    openBtn.addEventListener("click", open);
    document.addEventListener("keydown", function (event) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "");
      var combo = (event.metaKey || event.ctrlKey) && (event.key || "").toLowerCase() === "k";
      if (combo || (event.key === "/" && !typing && !dialog.open)) {
        event.preventDefault();
        open();
      }
    });
  }

  window.AHG.paletteInit = init;
})();
