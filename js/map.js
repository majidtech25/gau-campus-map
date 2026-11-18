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

  /* ---------- map drawing (dots & lines, no building outlines) ---------- */
  var svg = document.getElementById("map");
  var L = {
    paths: document.getElementById("layer-paths"),
    route: document.getElementById("layer-route"),
    dots: document.getElementById("layer-dots"),
    labels: document.getElementById("layer-labels")
  };
  var currentPath = null;

  function el(name, attrs, parent, text) {
    var e = document.createElementNS(SVGNS, name);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text) e.textContent = text;
    parent.appendChild(e);
    return e;
  }

  // Fit a box into the 4:3 map frame; returns the view box.
  function fit(x, y, w, h) {
    var aspect = 4 / 3;
    if (w / h > aspect) { var nh = w / aspect; y -= (nh - h) / 2; h = nh; }
    else { var nw = h * aspect; x -= (nw - w) / 2; w = nw; }
    return { x: x, y: y, w: w, h: h };
  }

  function routeBox(path) {
    var xs = path.map(function (id) { return nodes[id].x; });
    var ys = path.map(function (id) { return nodes[id].y; });
    var pad = 80, minW = 420;
    var x0 = Math.min.apply(null, xs) - pad, x1 = Math.max.apply(null, xs) + pad;
    var y0 = Math.min.apply(null, ys) - pad * 1.6, y1 = Math.max.apply(null, ys) + pad;   // extra room for labels
    if (x1 - x0 < minW) { var cx = (x0 + x1) / 2; x0 = cx - minW / 2; x1 = cx + minW / 2; }
    return fit(x0, y0, x1 - x0, y1 - y0);
  }

  function render(path, wholeCampus, picked) {
    var e = C.extent;
    var v = (path && !wholeCampus) ? routeBox(path) : fit(e.x, e.y, e.w, e.h);
    svg.setAttribute("viewBox", [v.x, v.y, v.w, v.h].map(Math.round).join(" "));
    var s = v.w / 400;                               // 1 screen px ≈ s map units (phone width)
    Object.keys(L).forEach(function (k) { L[k].textContent = ""; });

    // walkways
    C.edges.forEach(function (ed) {
      var a = nodes[ed[0]], b = nodes[ed[1]];
      var road = ed[2] === "road";
      el("line", {
        class: road ? "walkway walkway--road" : "walkway",
        x1: a.x, y1: a.y, x2: b.x, y2: b.y, "stroke-width": (road ? 8 : 4) * s
      }, L.paths);
    });

    // route
    var onRoute = {};
    if (path) {
      path.forEach(function (id) { onRoute[id] = true; });
      var pts = path.map(function (id) { return nodes[id].x + "," + nodes[id].y; }).join(" ");
      el("polyline", { class: "route-casing", points: pts, "stroke-width": 11 * s }, L.route);
      el("polyline", { class: "route", points: pts, "stroke-width": 6 * s, "stroke-dasharray": (14 * s) + " " + (9 * s) }, L.route);
    }

    // place dots (tap to pick)
    C.nodes.forEach(function (n) {
      if (n.kind !== "place") return;
      var c = el("circle", {
        class: "dot" + (onRoute[n.id] ? " dot--on-route" : ""),
        cx: n.x, cy: n.y, r: (onRoute[n.id] ? 5.5 : 4.5) * s, "stroke-width": 1.5 * s
      }, L.dots);
      el("title", {}, c, n.name);
      // bigger invisible hit area for fingers
      var hit = el("circle", { cx: n.x, cy: n.y, r: 14 * s, fill: "transparent", "data-id": n.id }, L.dots);
      hit.style.cursor = "pointer";
      hit.addEventListener("click", function () { pick(n.id); });
    });

    // start / end markers
    if (path) {
      var a0 = nodes[path[0]], b0 = nodes[path[path.length - 1]];
      el("circle", { class: "marker-start", cx: a0.x, cy: a0.y, r: 9 * s, "stroke-width": 3 * s }, L.route);
      el("circle", { class: "marker-end", cx: b0.x, cy: b0.y, r: 9 * s, "stroke-width": 3 * s }, L.route);
    }

    // labels: start & end (bold), places passed on the route, and a just-tapped dot
    var labelled = [];
    if (path) {
      labelled.push([path[0], true], [path[path.length - 1], true]);
      if (!wholeCampus) path.slice(1, -1).forEach(function (id) { if (nodes[id].kind === "place") labelled.push([id, false]); });
    } else {
      labelled.push(["gate", true]);
    }
    if (picked && !onRoute[picked]) labelled.push([picked, true]);
    // place labels; a minor label is skipped if it would overlap one already placed
    var boxes = [];
    labelled.forEach(function (item) {
      var n = nodes[item[0]], major = item[1];
      var fs = (major ? 13 : 11) * s, w = n.name.length * fs * 0.56, h = fs * 1.2;
      var right = n.x + 12 * s + w < v.x + v.w;          // flip left if it would run off the right edge
      var x = n.x + (right ? 12 : -12) * s, y = Math.max(n.y - 10 * s, v.y + fs * 1.1);
      if (!right && x - w < v.x + 4 * s) x = v.x + 4 * s + w;   // ...but never off the left edge
      var box = { x0: right ? x : x - w, x1: right ? x + w : x, y0: y - h, y1: y };
      var hits = boxes.some(function (b) { return box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0; });
      if (hits && !major) return;
      boxes.push(box);
      el("text", {
        class: "label" + (major ? "" : " label--minor"), x: x, y: y,
        "text-anchor": right ? "start" : "end", "font-size": fs, "stroke-width": 3.5 * s
      }, L.labels, n.name);
    });
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

    currentPath = null;
    if (!from || !to) { render(null, true, from || to); summary.textContent = t("pick"); return; }
    if (from === to) { render(null, true, from); summary.textContent = t("same"); return; }

    var path = shortestPath(from, to);
    if (!path) { render(null, true); summary.textContent = t("noroute"); return; }
    currentPath = path;
    render(path, false);
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
  document.getElementById("full").addEventListener("click", function () { render(currentPath, true); });

  // Tapping a dot: fills "You are at" first, then "Going to".
  function pick(id) {
    if (!fromSel.value) fromSel.value = id;
    else if (id !== fromSel.value) toSel.value = id;
    update(true);
  }

  update(false);
})();
