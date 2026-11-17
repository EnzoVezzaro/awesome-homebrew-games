// Identity motif: every entry and category gets a deterministic, mirrored pixel creature.
// Same id in, same creature out. Generated at runtime, so no image files ship.
(function () {
  "use strict";

  var COLORS = ["#dbff00", "#fea514", "#e8bbfb", "#f2f2fd"];
  var COLS = 11;
  var ROWS = 11;
  var HALF = 6;

  function hash(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function rng(seed) {
    var next = hash(String(seed));
    var a = next();
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Returns { grid, color } for a seed. grid[row][col] is true where a pixel is lit. */
  function creature(seed) {
    var rand = rng(seed);
    var color = COLORS[Math.floor(rand() * COLORS.length)];
    var grid = [];
    for (var r = 0; r < ROWS; r++) {
      var row = new Array(COLS).fill(false);
      for (var c = 0; c < HALF; c++) {
        var edgeBias = c === HALF - 1 ? 0.62 : 0.48;
        var on = rand() < edgeBias && r > 0 && r < ROWS - 1;
        row[c] = on;
        row[COLS - 1 - c] = on;
      }
      grid.push(row);
    }
    // Two eyes, always readable, mirrored.
    var eyeRow = 3 + Math.floor(rand() * 2);
    var eyeCol = 2 + Math.floor(rand() * 2);
    grid[eyeRow][eyeCol] = true;
    grid[eyeRow][COLS - 1 - eyeCol] = true;
    return { grid: grid, color: color, eyeRow: eyeRow, eyeCol: eyeCol };
  }

  /** SVG markup for a creature. Contains only numbers and palette colors. */
  function svg(seed, options) {
    var o = options || {};
    var bodyOverride = o.body;
    var eyeColor = o.eye || "#0b0b0b";
    var c = creature(seed);
    var body = bodyOverride || c.color;
    var rects = [];
    for (var r = 0; r < ROWS; r++) {
      var start = -1;
      for (var x = 0; x <= COLS; x++) {
        var on = x < COLS && c.grid[r][x];
        if (on && start === -1) start = x;
        if (!on && start !== -1) {
          rects.push('<rect x="' + start + '" y="' + r + '" width="' + (x - start) + '" height="1"/>');
          start = -1;
        }
      }
    }
    var eyes =
      '<rect x="' + c.eyeCol + '" y="' + c.eyeRow + '" width="1" height="1" fill="' + eyeColor + '"/>' +
      '<rect x="' + (COLS - 1 - c.eyeCol) + '" y="' + c.eyeRow + '" width="1" height="1" fill="' + eyeColor + '"/>';
    return (
      '<svg viewBox="0 0 ' + COLS + " " + ROWS + '" xmlns="http://www.w3.org/2000/svg" ' +
      'shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
      '<g fill="' + body + '">' + rects.join("") + "</g>" + eyes + "</svg>"
    );
  }

  window.AHG = window.AHG || {};
  window.AHG.sprite = { svg: svg, creature: creature, colors: COLORS };
})();
