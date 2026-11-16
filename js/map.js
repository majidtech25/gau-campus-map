/* =========================================================
   GaU campus route-finder (vanilla JS, no build step)
   - Shortest walking route (Dijkstra) over js/data.js
   - Route drawn over the campus map image; the view zooms to it
   - Landmark directions: turns announced only at real junctions
   - URL presets: ?from=gate&to=admissions (gate QR codes use ?from=gate)
   ========================================================= */
(function () {
  "use strict";

  var C = window.CAMPUS;
  var dict = window.I18N || {};
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- i18n ---------- */
  var lang = "en";
  try { lang = localStorage.getItem("gau-lang") || "en"; } catch (e) {}
  if (!dict[lang]) lang = "en";
  document.documentElement.lang = lang;
  function t(key, vars) {
    var s = (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
    Object.keys(vars || {}).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var k = el.getAttribute("data-i18n");
    if (dict.en && dict.en[k]) el.textContent = t(k);
  });

  /* ---------- graph ---------- */
  var nodes = {}, adj = {};
  C.nodes.forEach(function (n) { nodes[n.id] = n; adj[n.id] = []; });
  function dist(a, b) { return Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y); }
  C.edges.forEach(function (e) {
    var d = dist(e[0], e[1]);
    adj[e[0]].push({ to: e[1], d: d });
    adj[e[1]].push({ to: e[0], d: d });
  });

  function shortestPath(from, to) {
    var best = {}, prev = {}, done = {};
    Object.keys(nodes).forEach(function (id) { best[id] = Infinity; });
    best[from] = 0;
    for (;;) {
      var u = null;
      Object.keys(best).forEach(function (id) {
        if (!done[id] && best[id] < Infinity && (u === null || best[id] < best[u])) u = id;
      });
      if (u === null || u === to) break;
      done[u] = true;
      adj[u].forEach(function (e) {
        if (best[u] + e.d < best[e.to]) { best[e.to] = best[u] + e.d; prev[e.to] = u; }
      });
    }
    if (best[to] === Infinity) return null;
    var path = [to];
    while (path[0] !== from) path.unshift(prev[path[0]]);
    return path;
  }

  // Turn at b going a → b → c (screen coords, y down): positive = right.
  function turnAngle(a, b, c) {
    var v1x = nodes[b].x - nodes[a].x, v1y = nodes[b].y - nodes[a].y;
    var v2x = nodes[c].x - nodes[b].x, v2y = nodes[c].y - nodes[b].y;
    return Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y) * 180 / Math.PI;
  }
  function landmark(id) { return nodes[id].name || nodes[id].near; }

  function directions(path) {
    var last = path.length - 1;
    var steps = [{ type: "start", text: t("start", { name: nodes[path[0]].name }) }];
    var turns = 0;
    for (var i = 1; i < last; i++) {
      var id = path[i];
      if (adj[id].length < 3) continue;            // bends & simple path points: nothing to decide
      var ang = turnAngle(path[i - 1], id, path[i + 1]);
      if (Math.abs(ang) < 35) {
        steps.push({ type: "straight", text: t("straight", { near: landmark(id) }) });
        continue;
      }
      turns++;
      var dir = ang > 0 ? "Right" : "Left";
      if (i === last - 1) {
        // the turn straight into the destination: say it once
        steps.push({ type: "end", end: true, text: t("arrive" + dir, { name: nodes[path[last]].name }) });
        return finish(steps, turns);
      }
      if (i === 1 && adj[path[0]].length === 1) {
        // first junction right outside the start: no need to name it again
        steps.push({ type: "turn", text: t("leave" + dir, { name: nodes[path[0]].name }) });
        continue;
      }
      steps.push({ type: "turn", text: t(dir.toLowerCase(), { near: landmark(id) }) });
    }
    steps.push({ type: "end", end: true, text: t("arrive", { name: nodes[path[last]].name }) });
    return finish(steps, turns);
  }
  // keep only the last of several "go straight" steps in a row
  function finish(steps, turns) {
    steps = steps.filter(function (st, i) {
      return !(st.type === "straight" && steps[i + 1] && steps[i + 1].type === "straight");
    });
    return { steps: steps, turns: turns };
  }

  /* ---------- map drawing ---------- */
  var svg = document.getElementById("map");
  var img = document.getElementById("map-image");
  img.setAttribute("href", C.image.src);
  img.setAttribute("width", C.image.w);
  img.setAttribute("height", C.image.h);
  var routeLayer = document.getElementById("layer-route");

  function setView(x, y, w, h) {
    var aspect = 4 / 3;                              // matches the CSS aspect-ratio
    if (w / h > aspect) { var nh = w / aspect; y -= (nh - h) / 2; h = nh; }
    else { var nw = h * aspect; x -= (nw - w) / 2; w = nw; }
    svg.setAttribute("viewBox", [x, y, w, h].map(Math.round).join(" "));
    return w;
  }
  function fullView() { var e = C.extent; return setView(e.x, e.y, e.w, e.h); }

  function el(name, attrs, parent) {
    var e = document.createElementNS(SVGNS, name);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    parent.appendChild(e);
    return e;
  }

  function drawRoute(path) {
    routeLayer.textContent = "";
    if (!path) { fullView(); return; }
    var xs = path.map(function (id) { return nodes[id].x; });
    var ys = path.map(function (id) { return nodes[id].y; });
    var pad = 70, minW = 380;
    var x0 = Math.min.apply(null, xs) - pad, x1 = Math.max.apply(null, xs) + pad;
    var y0 = Math.min.apply(null, ys) - pad, y1 = Math.max.apply(null, ys) + pad;
    if (x1 - x0 < minW) { var cx = (x0 + x1) / 2; x0 = cx - minW / 2; x1 = cx + minW / 2; }
    var w = setView(x0, y0, x1 - x0, y1 - y0);
    var s = w / 400;                                  // keep strokes the same on-screen size
    var pts = path.map(function (id) { return nodes[id].x + "," + nodes[id].y; }).join(" ");
    el("polyline", { class: "route-casing", points: pts, "stroke-width": 11 * s }, routeLayer);
    el("polyline", { class: "route", points: pts, "stroke-width": 6 * s, "stroke-dasharray": (14 * s) + " " + (9 * s) }, routeLayer);
    var a = nodes[path[0]], b = nodes[path[path.length - 1]];
    el("circle", { class: "marker-start", cx: a.x, cy: a.y, r: 9 * s, "stroke-width": 3 * s }, routeLayer);
    el("circle", { class: "marker-end", cx: b.x, cy: b.y, r: 9 * s, "stroke-width": 3 * s }, routeLayer);
  }

  /* ---------- UI ---------- */
  var fromSel = document.getElementById("from");
  var toSel = document.getElementById("to");
  var summary = document.getElementById("summary");
  var stepsList = document.getElementById("steps");

  [fromSel, toSel].forEach(function (sel) {
    var ph = document.createElement("option");
    ph.value = ""; ph.textContent = t("choose");
    sel.appendChild(ph);
    C.categories.forEach(function (cat) {
      var places = C.nodes.filter(function (n) { return n.kind === "place" && n.cat === cat[0]; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
      if (!places.length) return;
      var g = document.createElement("optgroup");
      g.label = cat[1];
      places.forEach(function (p) {
        var o = document.createElement("option");
        o.value = p.id; o.textContent = p.name;
        g.appendChild(o);
      });
      sel.appendChild(g);
    });
  });

  var params = new URLSearchParams(location.search);
  if (nodes[params.get("from")]) fromSel.value = params.get("from");
  if (nodes[params.get("to")]) toSel.value = params.get("to");

  function update(fromUser) {
    var from = fromSel.value, to = toSel.value;
    stepsList.textContent = "";
    summary.textContent = "";

    // After a visitor changes something, keep from/to in the URL (shareable) and drop
    // the QR tag so shared links aren't counted as scans. Never on first load: the
    // scan counter must still see ?campaign=… then.
    if (fromUser) {
      var q = new URLSearchParams();
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      try { history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); } catch (e) {}
    }

    if (!from || !to) { drawRoute(null); summary.textContent = t("pick"); return; }
    if (from === to) { drawRoute(null); summary.textContent = t("same"); return; }

    var path = shortestPath(from, to);
    if (!path) { drawRoute(null); summary.textContent = t("noroute"); return; }
    drawRoute(path);
    var d = directions(path);
    summary.textContent = d.turns === 0 ? t("summary0") : d.turns === 1 ? t("summary1") : t("summary", { turns: d.turns });
    d.steps.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s.text;
      if (s.end) li.className = "is-end";
      stepsList.appendChild(li);
    });
  }

  fromSel.addEventListener("change", function () { update(true); });
  toSel.addEventListener("change", function () { update(true); });
  document.getElementById("swap").addEventListener("click", function () {
    var f = fromSel.value; fromSel.value = toSel.value; toSel.value = f; update(true);
  });
  document.getElementById("full").addEventListener("click", fullView);

  update(false);
})();
