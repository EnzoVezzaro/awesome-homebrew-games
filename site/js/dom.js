// Tiny element builder. Data from the collection is only ever set as text or as an
// attribute, never parsed as HTML.
(function () {
  "use strict";

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    var a = attrs || {};
    Object.keys(a).forEach(function (key) {
      var value = a[key];
      if (value === false || value === null || value === undefined) return;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key.slice(0, 2) === "on" && typeof value === "function") el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? "" : String(value));
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return el;
  }

  function host(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  window.AHG = window.AHG || {};
  window.AHG.dom = { h: h, host: host, reducedMotion: reducedMotion };
})();
