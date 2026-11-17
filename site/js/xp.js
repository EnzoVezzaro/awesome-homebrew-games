// Cosmetic XP. Lives only in this browser's localStorage and rewards real actions.
(function () {
  "use strict";

  var KEY = "ahg:xp:v1";
  var PER_LEVEL = 50;
  var state = { xp: 0, once: {} };
  var toastTimer = null;

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed.xp === "number" && parsed.once && typeof parsed.once === "object") {
        state = { xp: parsed.xp, once: parsed.once };
      }
    } catch (e) {
      /* storage can be blocked; the page works without it */
    }
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function level() {
    return Math.floor(state.xp / PER_LEVEL) + 1;
  }

  function render() {
    var xpEl = document.getElementById("hud-xp");
    var lvEl = document.getElementById("hud-level");
    var bar = document.getElementById("hud-bar");
    if (xpEl) xpEl.textContent = String(state.xp);
    if (lvEl) lvEl.textContent = String(level());
    if (bar) bar.style.setProperty("--fill", ((state.xp % PER_LEVEL) / PER_LEVEL) * 100 + "%");
  }

  function toast(text) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = text;
    el.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove("is-on");
    }, 1800);
  }

  /** Award points once per key. Returns true when points were granted. */
  function award(key, points, label) {
    if (state.once[key]) return false;
    var before = level();
    state.once[key] = true;
    state.xp += points;
    save();
    render();
    toast("+" + points + " XP" + (label ? " " + label : ""));
    if (level() > before) {
      window.setTimeout(function () {
        toast("Level " + level());
      }, 1900);
    }
    return true;
  }

  load();
  window.AHG = window.AHG || {};
  window.AHG.xp = { award: award, render: render, total: function () { return state.xp; }, has: function (k) { return !!state.once[k]; } };
})();
