// Renders the 50 most starred repositories collected by scripts/discover.mjs.
// The full set stays in discovery/github-projects.json.
(function () {
  "use strict";

  var section = document.getElementById("gh-top");
  var list = document.getElementById("gh-list");
  var status = document.getElementById("gh-status");
  var data = window.GITHUB_TOP;
  var projects = data && Array.isArray(data.projects) ? data.projects : [];
  var dom = window.AHG && window.AHG.dom;

  if (!section || !list || !dom) return;
  if (projects.length === 0) {
    section.hidden = true;
    return;
  }

  var fragment = document.createDocumentFragment();
  projects.forEach(function (project, index) {
    var rank = String(index + 1).padStart(2, "0");
    var stars = Number(project.stars) || 0;
    var link = dom.h("a", {
      class: "gh-link",
      href: project.url,
      target: "_blank",
      rel: "noopener noreferrer",
    }, [
      dom.h("span", { class: "gh-rank", text: rank }),
      dom.h("span", { class: "gh-main" }, [
        dom.h("span", { class: "gh-name", text: project.name || dom.host(project.url) }),
        dom.h("span", { class: "gh-desc", text: project.description || "" }),
      ]),
      dom.h("span", { class: "gh-stars", text: stars.toLocaleString("en-US") + " stars" }),
      dom.h("span", { class: "sr", text: " (opens in a new tab)" }),
    ]);
    fragment.appendChild(dom.h("li", { class: "gh-row" }, [link]));
  });
  list.appendChild(fragment);

  if (status) {
    var total = Number(data.total) || projects.length;
    status.textContent = total.toLocaleString("en-US") + " repositories found";
  }
})();
