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
    var steps = [{ type: "start", at: 0, text: t("start", { name: nodes[path[0]].name }) }];
    var turns = 0;
    for (var i = 1; i < last; i++) {
      var id = path[i];
      if (adj[id].length < 3) continue;            // bends & simple path points: nothing to decide
      var ang = turnAngle(path[i - 1], id, path[i + 1]);
      if (Math.abs(ang) < 35) {
        steps.push({ type: "straight", at: i, text: t("straight", { near: landmark(id) }) });
        continue;
      }
      turns++;
      var dir = ang > 0 ? "Right" : "Left";
      if (i === last - 1) {
        // the turn straight into the destination: say it once
        steps.push({ type: "end", end: true, at: i, text: t("arrive" + dir, { name: nodes[path[last]].name }) });
        return finish(steps, turns);
      }
      if (i === 1 && adj[path[0]].length === 1) {
        // first junction right outside the start: no need to name it again
        steps.push({ type: "turn", at: i, text: t("leave" + dir, { name: nodes[path[0]].name }) });
        continue;
      }
      steps.push({ type: "turn", at: i, text: t(dir.toLowerCase(), { near: landmark(id) }) });
    }
    steps.push({ type: "end", end: true, at: last, text: t("arrive", { name: nodes[path[last]].name }) });
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
  var currentPath = null, currentSteps = [];

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
    currentSteps = [];
    if (typeof stopAll === "function") stopAll();

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
    currentSteps = d.steps;
    d.steps.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s.text;
      if (s.end) li.className = "is-end";
      s.li = li;
      stepsList.appendChild(li);
    });
    showVoiceBar();
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


  /* ---------- Voice: read the directions aloud ---------- */
  var voiceBar = document.getElementById("voice");
  var speakBtn = document.getElementById("speak");
  var walkBtn = document.getElementById("walk");
  var gpsStatus = document.getElementById("gps-status");
  var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  var reading = false;

  function say(text, queue) {
    if (!canSpeak) return;
    if (!queue) window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";        // SW / SO voices only after native speakers write the text
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    return u;
  }
  function setBtn(btn, key) { btn.textContent = t(key); btn.setAttribute("data-i18n", key); }

  function stopReading() {
    if (canSpeak) window.speechSynthesis.cancel();
    reading = false;
    setBtn(speakBtn, "speak");
    speakBtn.setAttribute("aria-pressed", "false");
  }
  speakBtn.addEventListener("click", function () {
    if (reading) { stopReading(); return; }
    stopWalking();
    reading = true;
    setBtn(speakBtn, "speakStop");
    speakBtn.setAttribute("aria-pressed", "true");
    window.speechSynthesis.cancel();
    currentSteps.forEach(function (st, i) {
      var u = say(st.text, true);
      if (i === currentSteps.length - 1) u.onend = stopReading;
    });
  });

  /* ---------- GPS walking mode ----------
     Needs C.geo: 3+ places whose real GPS position was recorded on campus
     (tools/calibrate.html). From those we fit GPS -> map coordinates. Then:
     a "you are here" dot, and each instruction is spoken as you reach it.
     The location never leaves the phone. */
  var geo = (function () {
    var pts = (C.geo && C.geo.points || []).filter(function (p) { return nodes[p.id]; });
    if (pts.length < 3) return null;
    var lat0 = 0, lon0 = 0;
    pts.forEach(function (p) { lat0 += p.lat / pts.length; lon0 += p.lon / pts.length; });
    var kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110540;
    function local(lat, lon) { return [(lon - lon0) * kx, (lat - lat0) * ky]; }   // metres east, north
    // least squares: map = [E N 1] * coef  (separately for x and y)
    var M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
    pts.forEach(function (p) {
      var l = local(p.lat, p.lon), r = [l[0], l[1], 1], n = nodes[p.id];
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) M[i][j] += r[i] * r[j];
        bx[i] += r[i] * n.x; by[i] += r[i] * n.y;
      }
    });
    function solve(A, b) {                       // 3x3, Cramer's rule
      function det(m) {
        return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      }
      var D = det(A);
      if (Math.abs(D) < 1e-9) return null;
      return [0, 1, 2].map(function (c) {
        var m = A.map(function (row, i) { return row.map(function (v, j) { return j === c ? b[i] : v; }); });
        return det(m) / D;
      });
    }
    var cx = solve(M, bx), cy = solve(M, by);
    if (!cx || !cy) return null;
    var unitsPerM = Math.sqrt(Math.abs(cx[0] * cy[1] - cx[1] * cy[0]));
    return {
      toMap: function (lat, lon) {
        var l = local(lat, lon);
        return { x: cx[0] * l[0] + cx[1] * l[1] + cx[2], y: cy[0] * l[0] + cy[1] * l[1] + cy[2] };
      },
      m: function (units) { return units / unitsPerM; },     // map units -> metres
      u: function (metres) { return metres * unitsPerM; }    // metres -> map units
    };
  })();
  var canWalk = !!(geo && navigator.geolocation);

  var walk = null;   // { watch, spoken:{}, seg, off, lock }
  var youLayer = document.getElementById("layer-you");

  function showVoiceBar() {
    voiceBar.hidden = !(canSpeak || canWalk);
    speakBtn.hidden = !canSpeak;
    walkBtn.hidden = !canWalk;
    gpsStatus.textContent = "";
  }

  function stopWalking() {
    if (!walk) return;
    navigator.geolocation.clearWatch(walk.watch);
    if (walk.lock) { try { walk.lock.release(); } catch (e) {} }
    walk = null;
    youLayer.textContent = "";
    setBtn(walkBtn, "walk");
    walkBtn.setAttribute("aria-pressed", "false");
    currentSteps.forEach(function (st) { if (st.li) st.li.classList.remove("is-current"); });
  }
  function stopAll() { if (canSpeak) stopReading(); stopWalking(); gpsStatus.textContent = ""; }

  // nearest point on the route: segment index, distance (map units)
  function onRoute(p) {
    var best = { seg: 0, d: Infinity };
    for (var i = 0; i < currentPath.length - 1; i++) {
      var a = nodes[currentPath[i]], b = nodes[currentPath[i + 1]];
      var vx = b.x - a.x, vy = b.y - a.y, len = vx * vx + vy * vy || 1;
      var k = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len));
      var d = Math.hypot(a.x + k * vx - p.x, a.y + k * vy - p.y);
      if (d < best.d) best = { seg: i, d: d };
    }
    return best;
  }

  function drawYou(p, accM) {
    youLayer.textContent = "";
    var v = svg.viewBox.baseVal, s = v.width / 400;
    el("circle", { class: "you-acc", cx: p.x, cy: p.y, r: Math.max(geo.u(accM), 6 * s) }, youLayer);
    el("circle", { class: "you", cx: p.x, cy: p.y, r: 7 * s, "stroke-width": 3 * s }, youLayer);
  }

  function highlight(st) {
    currentSteps.forEach(function (x) { if (x.li) x.li.classList.toggle("is-current", x === st); });
  }

  function onFix(pos) {
    if (!walk || !currentPath) return;
    var acc = Math.round(pos.coords.accuracy);
    var p = geo.toMap(pos.coords.latitude, pos.coords.longitude);
    drawYou(p, acc);
    if (acc > 50) { gpsStatus.textContent = t("gpsWeak", { m: acc }); return; }
    var r = onRoute(p), offM = geo.m(r.d);
    if (offM > 300) { gpsStatus.textContent = t("gpsFar"); return; }
    gpsStatus.textContent = t("gpsOk", { m: acc });
    // off the route?
    if (offM > Math.max(35, acc)) {
      walk.off++;
      if (walk.off === 3) say(t("offroute"));
      return;
    }
    walk.off = 0;
    walk.seg = Math.max(walk.seg, r.seg);
    // the next instruction ahead of us: speak it as we reach its junction
    for (var i = 0; i < currentSteps.length; i++) {
      var st = currentSteps[i];
      if (st.type === "start" || walk.spoken[i] || st.at < walk.seg) continue;
      var n = nodes[currentPath[st.at]];
      var dM = geo.m(Math.hypot(n.x - p.x, n.y - p.y));
      var near = st.end && st.at === currentPath.length - 1 ? 15 : 25;
      if (dM <= Math.max(near, acc)) {
        walk.spoken[i] = true;
        highlight(st);
        say(st.text);
        if (st.end) { setTimeout(stopWalking, 400); gpsStatus.textContent = t("arrivedNote"); }
      }
      break;                                        // only ever the next one
    }
  }

  function onGpsError(err) {
    gpsStatus.textContent = err && err.code === 1 ? t("gpsDenied") : t("gpsWait");
    if (err && err.code === 1) stopWalking();
  }

  walkBtn.addEventListener("click", function () {
    if (walk) { stopWalking(); gpsStatus.textContent = ""; return; }
    if (!currentPath) return;
    stopReading();
    walk = { spoken: {}, seg: 0, off: 0, lock: null };
    setBtn(walkBtn, "walkStop");
    walkBtn.setAttribute("aria-pressed", "true");
    gpsStatus.textContent = t("gpsWait");
    say(t("walkStart", { name: nodes[currentPath[currentPath.length - 1]].name }));
    if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { if (walk) walk.lock = l; }, function () {});
    walk.watch = navigator.geolocation.watchPosition(onFix, onGpsError, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  });

  update(false);
})();
