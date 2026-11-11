/* ==========================================================================
   orbital-scenes.js - the research scenes
   --------------------------------------------------------------------------
   One scene per research line. Each registers itself on VMOrbital.scenes under
   the name the markup asks for with data-scene="...", and is handed the frame
   element; the canvas is inside it.

   Every scene draws something that is actually in the papers rather than
   generic space decoration, and every one is written so that its first frame
   already reads as a finished picture, because under prefers-reduced-motion
   the clock never advances and that first frame is all anyone sees.

   Numbers shown in the readouts are illustrative unless a caption says
   otherwise.
   ========================================================================== */
(function () {
  "use strict";

  var VM = window.VMOrbital;
  if (!VM) return;

  var TAU = VM.TAU;
  var DEG = VM.DEG;
  var C = VM.C;

  /* ---------------------------------------------------------------- shared */

  function canvasOf(el) {
    return el.querySelector("canvas");
  }

  /* A framed sub-panel with a mono caption in its top-left, for the
     instrument-readout halves of the scenes. */
  function panel(ctx, x, y, w, h, title) {
    ctx.fillStyle = "rgba(8,14,30,0.55)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(120,160,220,0.20)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    if (title) VM.label(ctx, title, x + 9, y + 13, "rgba(160,190,230,0.75)", 9.5);
  }

  /* Corner ticks, the same motif the CSS panels use. */
  function ticks(ctx, x, y, w, h, len, colour) {
    len = len || 8;
    ctx.strokeStyle = colour || "rgba(120,160,220,0.5)";
    ctx.lineWidth = 1;
    var c = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]];
    for (var i = 0; i < c.length; i++) {
      ctx.beginPath();
      ctx.moveTo(c[i][0] + c[i][2] * len, c[i][1]);
      ctx.lineTo(c[i][0], c[i][1]);
      ctx.lineTo(c[i][0], c[i][1] + c[i][3] * len);
      ctx.stroke();
    }
  }

  /* Right-align a small integer in four columns, for the event stream rows. */
  function pad4(n) {
    var s = String(n);
    while (s.length < 4) s = " " + s;
    return s;
  }

  /* Stacked mono readout lines. Each line is [label, value, colour]. */
  function readout(ctx, x, y, lines, lh) {
    lh = lh || 15;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      VM.label(ctx, l[0], x, y + i * lh, "rgba(150,175,215,0.6)", 9.5);
      VM.label(ctx, l[1], x + 86, y + i * lh, l[2] || C.ink, 10.5);
    }
  }

  /* A short dashed leader line with a label at its end. */
  function leader(ctx, x1, y1, x2, y2, txt, colour) {
    ctx.strokeStyle = VM.fade(colour, 0.5);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    VM.tag(ctx, txt, x2 + 5, y2, VM.fade(colour, 0.95), 10);
  }

  /* ======================================================================
     coordination - the homepage scene
     ----------------------------------------------------------------------
     A Walker constellation with intra- and inter-plane links. A request
     appears on the ground; every satellite that can see it scores the
     opportunity; only {id, best reward} crosses the links, hop by hop, until
     the network has agreed which satellite takes the observation.

     This is the mechanism in the selective-propagation papers, which is why
     the topology here is a fixed ring-plus-ladder graph: that is what gives
     the hop count its meaning.
     ====================================================================== */

  var PLANES = 3, PER_PLANE = 8, NSAT = PLANES * PER_PLANE;
  var ALT = 1.24;

  function constellation() {
    var sats = [];
    for (var p = 0; p < PLANES; p++) {
      for (var i = 0; i < PER_PLANE; i++) {
        sats.push({
          p: p, i: i, id: "S" + (p * PER_PLANE + i + 1),
          inc: 72 * DEG,
          raan: (p / PLANES) * Math.PI + 0.4,
          /* Walker phasing, so the planes interleave instead of lining up. */
          u0: (i / PER_PLANE) * TAU + (p * TAU) / (PLANES * PER_PLANE)
        });
      }
    }
    return sats;
  }

  /* Intra-plane ring plus one inter-plane rung per satellite. Constant, so
     hop distance is well defined and the links never flicker. */
  function links() {
    var out = [];
    var at = function (p, i) { return p * PER_PLANE + ((i + PER_PLANE) % PER_PLANE); };
    for (var p = 0; p < PLANES; p++) {
      for (var i = 0; i < PER_PLANE; i++) {
        out.push([at(p, i), at(p, i + 1)]);
        if (p < PLANES - 1) out.push([at(p, i), at(p + 1, i)]);
      }
    }
    return out;
  }

  function hopLevels(edges, n, from) {
    var adj = [];
    for (var i = 0; i < n; i++) adj.push([]);
    for (var e = 0; e < edges.length; e++) {
      adj[edges[e][0]].push(edges[e][1]);
      adj[edges[e][1]].push(edges[e][0]);
    }
    var lvl = new Array(n).fill(-1);
    lvl[from] = 0;
    var q = [from];
    while (q.length) {
      var v = q.shift();
      for (var k = 0; k < adj[v].length; k++) {
        var u = adj[v][k];
        if (lvl[u] < 0) { lvl[u] = lvl[v] + 1; q.push(u); }
      }
    }
    return lvl;
  }

  /* Request sites, chosen so one is always somewhere sensible as Earth spins. */
  var SITES = [
    { lat: 48.1 * DEG, lon: 11.6 * DEG, name: "MUNICH" },
    { lat: -3.1 * DEG, lon: -60.0 * DEG, name: "AMAZONAS" },
    { lat: 35.7 * DEG, lon: 139.7 * DEG, name: "KANTO" },
    { lat: -33.9 * DEG, lon: 18.4 * DEG, name: "CAPE" },
    { lat: 19.4 * DEG, lon: -99.1 * DEG, name: "ANAHUAC" }
  ];

  var CYCLE = 11.0;
  var PHASE = { score: 1.6, prop: 4.2, hold: 9.4 };

  /* opts.hero composes the same animation for the homepage masthead, where it
     sits behind the name and the lede: the globe moves to the bottom-right,
     the per-satellite reward values come off because they are unreadable
     behind text, and the two floating tags only appear while they are clear
     of the text column. */
  function coordinationScene(el, opts) {
    opts = opts || {};
    var hero = !!opts.hero;
    var canvas = canvasOf(el);
    if (!canvas) return;

    var sats = constellation();
    var edges = links();
    var stars = new VM.Stars(460, 11);
    var sun = VM.norm(VM.v(-0.42, 0.30, 0.86));
    var ctl = VM.orbitControl(el, -0.45, 0.34, { minPitch: -0.2, maxPitch: 1.0 });
    var rnd = VM.rng(4242);

    /* Everything that is fixed for one request. Recomputed when the cycle
       rolls over, not per frame, so the readout numbers hold still. */
    var cyc = -1, plan = null;

    function planFor(n) {
      var site = SITES[n % SITES.length];
      var inject = (n * 7 + 3) % NSAT;
      var lvl = hopLevels(edges, NSAT, inject);
      /* Per-satellite variation standing in for the parts of the reward that
         are not geometric: power, storage, schedule, instrument availability.
         The geometric part is computed from the actual elevation each frame. */
      var jitter = [];
      for (var i = 0; i < NSAT; i++) jitter.push(rnd());
      return {
        site: site,
        inject: inject,
        lvl: lvl,
        jitter: jitter,
        locked: null,
        maxHop: Math.max.apply(null, lvl)
      };
    }

    VM.animate(canvas, function (ctx, w, h, t) {
      var n = Math.floor(t / CYCLE);
      if (n !== cyc) { cyc = n; plan = planFor(n); }
      var ph = t % CYCLE;

      var narrow = w < 720;
      var m = Math.min(w, h);
      if (ctl.idle) ctl.yaw += 0.0016;
      var cam = hero
        ? VM.camera(w * (narrow ? 0.5 : 0.72), h * 1.04, m * (narrow ? 0.5 : 0.66), ctl.yaw, ctl.pitch)
        : VM.camera(
          narrow ? w * 0.5 : w * 0.42,
          narrow ? h * 0.56 : h * 0.54,
          m * (narrow ? 0.34 : 0.42),
          ctl.yaw, ctl.pitch
        );
      var theta = t * 0.024;

      stars.draw(ctx, w, h, t, t * 0.04);

      /* Current satellite positions and the ground target. */
      var pos = [], scr = [];
      for (var i = 0; i < NSAT; i++) {
        pos.push(VM.orbit(ALT, sats[i].inc, sats[i].raan, sats[i].u0 + t * 0.035));
        scr.push(cam.project(pos[i]));
      }
      var tp = VM.surface(1, plan.site.lat, plan.site.lon, theta);
      var ts = cam.project(tp);
      var targetUp = VM.norm(tp);

      /* A satellite can serve the request only if the target is above its
         local horizon, and the better the elevation the better it scores -
         so the reward shown on a node really does follow its geometry, and
         the satellite that wins is visibly the one best placed. */
      var visible = [], rewards = [];
      for (i = 0; i < NSAT; i++) {
        var toSat = VM.norm({ x: pos[i].x - tp.x, y: pos[i].y - tp.y, z: pos[i].z - tp.z });
        var elev = VM.dot(toSat, targetUp);
        var see = elev > 0.22;
        visible.push(see);
        rewards.push(see
          ? VM.clamp(0.34 + 0.56 * ((elev - 0.22) / 0.78) + 0.10 * plan.jitter[i], 0, 0.99)
          : 0);
      }

      /* The winner is settled during the scoring phase and then held, so the
         readout does not keep changing its mind while the result propagates. */
      if (ph < PHASE.score || !plan.locked) {
        var w0 = -1, best = -1;
        for (i = 0; i < NSAT; i++) {
          if (visible[i] && rewards[i] > best) { best = rewards[i]; w0 = i; }
        }
        if (w0 >= 0) plan.locked = { win: w0, reward: rewards[w0] };
      }
      var win = plan.locked ? plan.locked.win : -1;
      var winR = plan.locked ? plan.locked.reward : 0;

      /* How far the {id, reward} message has spread. */
      var front = ph < PHASE.score ? -1
        : ph < PHASE.prop
          ? ((ph - PHASE.score) / (PHASE.prop - PHASE.score)) * (plan.maxHop + 0.6)
          : plan.maxHop + 0.6;
      var settled = ph >= PHASE.prop;

      /* -------------------------------------------------- back half, Earth */

      function tracks(frontSide) {
        for (var p = 0; p < PLANES; p++) {
          VM.orbitTrack(ctx, cam, ALT, sats[p * PER_PLANE].inc, sats[p * PER_PLANE].raan,
            frontSide, VM.fade(C.accent, 0.17));
        }
      }

      function drawEdges(frontSide) {
        for (var e = 0; e < edges.length; e++) {
          var a = scr[edges[e][0]], b = scr[edges[e][1]];
          var isFront = a.z >= 0 && b.z >= 0;
          if (isFront !== frontSide) continue;
          if (!frontSide && (VM.hidden(a.q, 1) || VM.hidden(b.q, 1))) continue;

          var la = plan.lvl[edges[e][0]], lb = plan.lvl[edges[e][1]];
          var lit = front >= Math.max(la, lb);
          ctx.strokeStyle = lit
            ? VM.fade(C.accent, frontSide ? 0.5 : 0.16)
            : (frontSide ? "rgba(140,170,210,0.13)" : "rgba(140,170,210,0.05)");
          ctx.lineWidth = lit ? 1.3 : 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      function drawSats(frontSide) {
        for (var i2 = 0; i2 < NSAT; i2++) {
          var s = scr[i2];
          if ((s.z >= 0) !== frontSide) continue;
          if (!frontSide && VM.hidden(s.q, 1)) continue;

          var known = front >= plan.lvl[i2];
          var isWin = settled && i2 === win;
          var a = frontSide ? 1 : 0.4;

          if (isWin) {
            VM.dotGlow(ctx, s.x, s.y, 17, C.good, true);
          } else if (i2 === plan.inject) {
            ctx.fillStyle = VM.fade(C.warn, 0.95 * a);
            ctx.beginPath(); ctx.arc(s.x, s.y, 3.4, 0, TAU); ctx.fill();
          } else {
            ctx.fillStyle = known ? VM.fade(C.accent, 0.95 * a) : "rgba(170,195,230," + 0.4 * a + ")";
            ctx.beginPath(); ctx.arc(s.x, s.y, known ? 2.9 : 2.2, 0, TAU); ctx.fill();
          }

          /* Reward values appear on the satellites that can see the target. */
          if (!hero && frontSide && visible[i2] && ph > 0.5 && !(settled && i2 === win)) {
            var fadeIn = VM.ease((ph - 0.5) / 1.1) * (settled ? 0.45 : 1);
            if (fadeIn > 0.02) {
              VM.label(ctx, rewards[i2].toFixed(2), s.x + 6, s.y - 7,
                VM.fade(C.accent, 0.75 * fadeIn), 9);
            }
          }
        }
      }

      tracks(false);
      drawEdges(false);
      drawSats(false);

      VM.earth(ctx, cam, 1, theta, sun, { dot: 1.2 });

      /* Ground target. */
      if (ts.z > 0 || !VM.hidden(ts.q, 1)) {
        var pulse = 0.5 + 0.5 * Math.sin(t * 3.4);
        ctx.strokeStyle = VM.fade(C.warn, 0.35 + 0.4 * pulse);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(ts.x, ts.y, 7 + 5 * pulse, 0, TAU); ctx.stroke();
        ctx.fillStyle = C.warn;
        ctx.beginPath(); ctx.arc(ts.x, ts.y, 3, 0, TAU); ctx.fill();
      }

      tracks(true);
      drawEdges(true);

      /* The observation itself. */
      if (settled && win >= 0 && scr[win].z > 0 && (ts.z > 0 || !VM.hidden(ts.q, 1))) {
        var k = VM.ease((ph - PHASE.prop) / 0.7);
        ctx.strokeStyle = VM.fade(C.good, 0.55 * k);
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(scr[win].x, scr[win].y);
        ctx.lineTo(scr[win].x + (ts.x - scr[win].x) * k, scr[win].y + (ts.y - scr[win].y) * k);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawSats(true);

      /* Packets riding the lit edges, so the direction of flow is visible. */
      if (!settled && front > 0) {
        for (var e2 = 0; e2 < edges.length; e2++) {
          var ia = edges[e2][0], ib = edges[e2][1];
          var lo = plan.lvl[ia] < plan.lvl[ib] ? ia : ib;
          var hi = lo === ia ? ib : ia;
          if (plan.lvl[hi] !== plan.lvl[lo] + 1) continue;
          var u = front - plan.lvl[lo];
          if (u <= 0 || u >= 1) continue;
          var A = scr[lo], B = scr[hi];
          if (A.z < 0 || B.z < 0) continue;
          ctx.fillStyle = VM.fade(C.accent, 0.95);
          ctx.beginPath();
          ctx.arc(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u, 2.3, 0, TAU);
          ctx.fill();
        }
      }

      /* ----------------------------------------------------------- labels */

      /* In hero mode the left of the canvas is under the name and the lede,
         so a tag is only drawn once it has moved clear of that column. */
      var clear = hero
        ? function (x) { return x > w * 0.54; }
        : function () { return true; };

      if (!narrow) {
        if ((ts.z > 0 || !VM.hidden(ts.q, 1)) && clear(ts.x)) {
          VM.tag(ctx, "REQUEST · " + plan.site.name, ts.x + 14, ts.y - 16, VM.fade(C.warn, 0.95), 10, w);
        }
        if (settled && win >= 0 && (scr[win].z > 0 || !VM.hidden(scr[win].q, 1)) && clear(scr[win].x)) {
          VM.tag(ctx, sats[win].id + " · R " + winR.toFixed(2),
            scr[win].x + 16, scr[win].y + 16, VM.fade(C.good, 0.98), 10.5, w);
        }
      }

      /* ---------------------------------------------------------- readout */

      var state = ph < PHASE.score ? "REQUEST RECEIVED"
        : ph < PHASE.prop ? "PROPAGATING"
          : "ASSIGNED";
      var hops = Math.min(plan.maxHop, Math.max(0, Math.floor(front)));

      if (!(hero && narrow)) {
        var rows = [
          ["STATE", state, state === "ASSIGNED" ? C.good : C.ink],
          ["NODES", String(NSAT), C.ink],
          ["HOPS", hops + " / " + plan.maxHop, C.ink],
          ["PAYLOAD", "{id, reward}", VM.fade(C.accent, 0.95)]
        ];
        if (hero) rows.splice(1, 1);

        /* In the hero the top-right belongs to the page's own eyebrow line,
           so the readout sits bottom-right instead - over the Earth, hence
           the backing plate. */
        var rw = hero ? 224 : 200;
        var rx = hero ? w - rw - 32 : (narrow ? 16 : w - 236);
        var ry = hero ? h - (26 + rows.length * 15) - 26 : (narrow ? h - 92 : 34);

        ctx.save();
        if (hero) {
          ctx.fillStyle = "rgba(4,8,20,0.52)";
          ctx.fillRect(rx - 14, ry - 20, rw + 28, 26 + rows.length * 15 + 16);
        }
        VM.label(ctx, "SELECTIVE PROPAGATION", rx, ry, VM.fade(C.accent, 0.8), 10);
        ctx.strokeStyle = "rgba(120,160,220,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(rx, ry + 10); ctx.lineTo(rx + rw, ry + 10); ctx.stroke();
        readout(ctx, rx, ry + 26, rows);
        ctx.restore();
      }

      /* The hero panel has its own rounded border; ticks would fight it. */
      if (!hero) ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 0.1 });
  }

  VM.scenes.coordination = function (el) { coordinationScene(el, {}); };
  VM.scenes.hero = function (el) { coordinationScene(el, { hero: true }); };

  /* ======================================================================
     central-nodes - the doctoral-research project scene
     ----------------------------------------------------------------------
     The same network, run three times with a different fraction of central
     nodes, keeping a bar of the convergence time each run took. This is the
     shape of the result in the IWPSS and MASSpace papers: a few central nodes
     buy back most of the responsiveness of a centralised scheme.
     ====================================================================== */

  /* Convergence times as quoted in the papers; the 5% figure is the one on
     the project page, under 100 s. Bars are scaled to the slowest run. */
  var RUNS = [
    { f: 0.05, label: "5% central nodes", secs: 95 },
    { f: 0.20, label: "20% central nodes", secs: 62 },
    { f: 0.50, label: "50% central nodes", secs: 48 }
  ];

  VM.scenes["central-nodes"] = function (el) {
    var canvas = canvasOf(el);
    if (!canvas) return;

    var N = 64;
    var rnd = VM.rng(90210);
    var stars = new VM.Stars(240, 5);

    /* Nodes on a shell, spread by the Fibonacci spiral so the shell looks
       evenly covered from any angle. */
    var nodes = [];
    var ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var z = 1 - (2 * (i + 0.5)) / N;
      var r = Math.sqrt(1 - z * z);
      var a = i * ga;
      nodes.push({ p: VM.v(r * Math.cos(a), z, r * Math.sin(a)), rank: rnd() });
    }

    /* Distances once, reused by every run. */
    var D = [];
    for (i = 0; i < N; i++) {
      D.push([]);
      for (var j = 0; j < N; j++) {
        D[i].push(VM.len(VM.v(
          nodes[i].p.x - nodes[j].p.x,
          nodes[i].p.y - nodes[j].p.y,
          nodes[i].p.z - nodes[j].p.z)));
      }
    }

    /* Chord distances on the shell, beyond which two satellites are taken to
       be out of reach of one another. */
    var HUB_RANGE = 0.95;
    var PEER_RANGE = 0.70;
    var PEER_MAX = 3;

    var ctl = VM.orbitControl(el, -0.5, 0.2);
    var RUN_T = 4.6;
    var cached = {};

    function levelsFor(runIdx) {
      if (cached[runIdx]) return cached[runIdx];
      var f = RUNS[runIdx].f;

      /* Exactly round(f*N) central nodes, placed by farthest-point sampling:
         each new one goes wherever is currently worst served. Picking them at
         random instead bunches them together, which both looks like a single
         hub and misrepresents the problem - where the central nodes sit is
         part of the question, not an afterthought. */
      var want = Math.round(f * N);
      var start = 0;
      for (var i2 = 1; i2 < N; i2++) if (nodes[i2].rank < nodes[start].rank) start = i2;
      var chosen = [start];
      var taken = {};
      taken[start] = 1;
      while (chosen.length < want) {
        var best = -1, bestD = -1;
        for (i2 = 0; i2 < N; i2++) {
          if (taken[i2]) continue;
          var md = 1e9;
          for (var c2 = 0; c2 < chosen.length; c2++) md = Math.min(md, D[i2][chosen[c2]]);
          if (md > bestD) { bestD = md; best = i2; }
        }
        if (best < 0) break;
        chosen.push(best);
        taken[best] = 1;
      }
      var central = [];
      for (i2 = 0; i2 < N; i2++) central.push(false);
      for (i2 = 0; i2 < chosen.length; i2++) central[chosen[i2]] = true;

      var hubs = [], peers = [];
      for (i2 = 0; i2 < N; i2++) (central[i2] ? hubs : peers).push(i2);

      /* Every link has to touch a central node. An ordinary satellite never
         exchanges a task with another ordinary satellite - it only ever bids
         to the central nodes it can reach - so the only two kinds of edge in
         the network are peer-to-central and central-to-central. */
      var edges = [], seen = {};
      function add(x, y) {
        if (x === y) return;
        var lo = Math.min(x, y), hi = Math.max(x, y), k = lo + ":" + hi;
        if (seen[k]) return;
        seen[k] = 1;
        edges.push([lo, hi]);
      }

      function byDistanceFrom(from, list) {
        var out = [];
        for (var q = 0; q < list.length; q++) if (list[q] !== from) out.push(list[q]);
        out.sort(function (x, y) { return D[from][x] - D[from][y]; });
        return out;
      }

      for (var pi = 0; pi < peers.length; pi++) {
        var p = peers[pi];
        var near = byDistanceFrom(p, hubs);
        if (!near.length) continue;
        /* The nearest central node always counts as reachable, even when it
           is far: otherwise a sparse run would simply strand half the
           constellation instead of being slow. */
        add(p, near[0]);
        for (var k2 = 1; k2 < near.length && k2 < PEER_MAX; k2++) {
          if (D[p][near[k2]] <= PEER_RANGE) add(p, near[k2]);
        }
      }

      /* The central-node backbone: everything in range, plus the nearest one
         so a handful of hubs still forms a connected chain. */
      for (var hi2 = 0; hi2 < hubs.length; hi2++) {
        var hA = hubs[hi2];
        var others = byDistanceFrom(hA, hubs);
        if (!others.length) continue;
        add(hA, others[0]);
        for (var c1 = 1; c1 < others.length; c1++) {
          if (D[hA][others[c1]] <= HUB_RANGE) add(hA, others[c1]);
        }
      }

      var lvl = hopLevels(edges, N, 0);
      var max = 0;
      for (i2 = 0; i2 < N; i2++) if (lvl[i2] > max) max = lvl[i2];
      /* Anything the walk never reached must not read as "knows already". */
      for (i2 = 0; i2 < N; i2++) if (lvl[i2] < 0) lvl[i2] = max + 1;

      cached[runIdx] = {
        lvl: lvl, central: central, hubs: hubs.length,
        edges: edges, max: Math.max(max, 1)
      };
      return cached[runIdx];
    }

    var slowest = 0;
    for (var ri = 0; ri < RUNS.length; ri++) slowest = Math.max(slowest, RUNS[ri].secs);

    VM.animate(canvas, function (ctx, w, h, t) {
      var idx = Math.floor(t / RUN_T) % RUNS.length;
      var ph = (t % RUN_T) / RUN_T;
      var run = RUNS[idx];
      var L = levelsFor(idx);

      if (ctl.idle) ctl.yaw += 0.0022;

      var narrow = w < 640;
      var m = Math.min(w, h);
      var cam = VM.camera(narrow ? w * 0.5 : w * 0.38, h * 0.5, m * 0.33, ctl.yaw, ctl.pitch);

      stars.draw(ctx, w, h, t, 0);

      /* Faint Earth at the centre, so the shell reads as an orbit shell. */
      var cr = m * 0.33 * 0.52;
      var g = ctx.createRadialGradient(cam.cx, cam.cy, 0, cam.cx, cam.cy, cr);
      g.addColorStop(0, "rgba(30,70,130,0.45)");
      g.addColorStop(1, "rgba(12,26,52,0.12)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cam.cx, cam.cy, cr, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(120,180,255,0.18)";
      ctx.beginPath(); ctx.arc(cam.cx, cam.cy, cr, 0, TAU); ctx.stroke();

      var front = VM.ease(Math.min(1, ph / 0.72)) * (L.max + 0.5);
      var scr = [];
      for (var i3 = 0; i3 < N; i3++) scr.push(cam.project(nodes[i3].p));

      /* The globe's radius in world units, so links can be hidden where they
         pass behind it instead of being drawn straight through the planet. */
      var RW = 0.52;

      /* Draw a link as a run of short pieces, dropping the pieces that fall
         behind the globe. A single straight stroke would cut through it. */
      function link(x, y, colour) {
        var SEG = 8, prev = null, prevHid = false;
        for (var q = 0; q <= SEG; q++) {
          var u = q / SEG;
          var p = VM.v(
            nodes[x].p.x + (nodes[y].p.x - nodes[x].p.x) * u,
            nodes[x].p.y + (nodes[y].p.y - nodes[x].p.y) * u,
            nodes[x].p.z + (nodes[y].p.z - nodes[x].p.z) * u
          );
          var s = cam.project(p);
          var hid = VM.hidden(s.q, RW);
          if (prev && !hid && !prevHid) {
            ctx.strokeStyle = colour;
            ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(s.x, s.y); ctx.stroke();
          }
          prev = s; prevHid = hid;
        }
      }

      /* Backbone links dashed, so the two kinds of edge stay distinguishable. */
      ctx.lineWidth = 1;
      for (var pass = 0; pass < 2; pass++) {
        var backbone = pass === 1;
        if (backbone) ctx.setLineDash([2, 4]);
        for (var e = 0; e < L.edges.length; e++) {
          var ea = L.edges[e][0], eb = L.edges[e][1];
          var isBackbone = L.central[ea] && L.central[eb];
          if (isBackbone !== backbone) continue;
          var lit = front >= Math.max(L.lvl[ea], L.lvl[eb]);
          var depth = (scr[ea].z + scr[eb].z) * 0.5 > 0 ? 1 : 0.35;
          var col = backbone
            ? VM.fade(C.accent2, (lit ? 0.42 : 0.12) * depth)
            : (lit ? VM.fade(C.accent, 0.42 * depth) : "rgba(150,175,215," + 0.1 * depth + ")");
          link(ea, eb, col);
        }
        if (backbone) ctx.setLineDash([]);
      }

      var sorted = [];
      for (i3 = 0; i3 < N; i3++) sorted.push(i3);
      sorted.sort(function (x, y) { return scr[x].z - scr[y].z; });

      for (var q2 = 0; q2 < sorted.length; q2++) {
        var i4 = sorted[q2];
        var s = scr[i4];
        if (VM.hidden(s.q, RW)) continue;      /* behind the globe */
        var known = front >= L.lvl[i4];
        var depth2 = scr[i4].z > 0 ? 1 : 0.45;
        if (L.central[i4]) {
          VM.dotGlow(ctx, s.x, s.y, 13 * depth2, C.accent2, false);
          ctx.fillStyle = VM.fade(C.accent2, 0.98 * depth2);
          ctx.beginPath(); ctx.arc(s.x, s.y, 4.4, 0, TAU); ctx.fill();
        } else {
          ctx.fillStyle = known
            ? VM.fade(C.accent, 0.95 * depth2)
            : "rgba(170,195,230," + 0.34 * depth2 + ")";
          ctx.beginPath(); ctx.arc(s.x, s.y, known ? 2.9 : 2.2, 0, TAU); ctx.fill();
        }
      }
      ctx.fillStyle = C.warn;
      ctx.beginPath(); ctx.arc(scr[0].x, scr[0].y, 3.6, 0, TAU); ctx.fill();

      /* ------------------------------------------------- the result panel */

      var px = narrow ? 16 : w - 258;
      var py = narrow ? h - 132 : 28;
      var pw = narrow ? w - 32 : 230;
      panel(ctx, px, py, pw, 116, "CONVERGENCE vs CENTRAL-NODE FRACTION");

      for (var b = 0; b < RUNS.length; b++) {
        var by = py + 34 + b * 22;
        var on = b === idx;
        var done = b < idx || (on && ph > 0.72);
        var grow = b < idx ? 1 : on ? VM.ease((ph - 0.5) / 0.4) : 0;
        VM.label(ctx, Math.round(RUNS[b].f * 100) + "%",
          px + 10, by, on ? C.ink : "rgba(150,175,215,0.55)", 9.5);
        var bx = px + 42, bw = pw - 86;
        ctx.fillStyle = "rgba(150,175,215,0.12)";
        ctx.fillRect(bx, by - 4, bw, 8);
        ctx.fillStyle = on ? VM.fade(C.accent, 0.95) : VM.fade(C.accent, 0.4);
        ctx.fillRect(bx, by - 4, bw * (RUNS[b].secs / slowest) * grow, 8);
        if (done) {
          VM.label(ctx, RUNS[b].secs + "s", px + pw - 38, by,
            on ? C.good : "rgba(150,175,215,0.55)", 9.5);
        }
      }

      var rx2 = narrow ? 16 : 24;
      var ry2 = narrow ? 26 : h - 74;
      VM.label(ctx, "RUN " + (idx + 1) + " / " + RUNS.length, rx2, ry2, VM.fade(C.accent, 0.8), 10);
      VM.label(ctx, run.label.toUpperCase(), rx2, ry2 + 16, C.ink, 11);
      VM.label(ctx, L.hubs + " CENTRAL · " + L.edges.length + " LINKS · EVERY LINK TOUCHES ONE",
        rx2, ry2 + 32, "rgba(150,175,215,0.6)", 9.5);

      ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 3.6 });
  };

  /* ======================================================================
     eventsat - the CubeSat mission scene
     ----------------------------------------------------------------------
     What the payload sees. An event camera has no frames: each pixel reports
     a brightness change on its own, so a still scene produces almost nothing
     and anything that moves lights up. The scene alternates between the two
     cases that matter for space object detection:

       SLEWING        the spacecraft is turning, so the whole starfield
                      sweeps across the sensor and every star emits
       INERTIAL HOLD  the spacecraft holds attitude, the stars go quiet, and
                      the only thing still emitting is the object that is
                      actually moving against them

     The second case is the mission in one picture, and it is why the onboard
     detector can find a dim, fast target that a frame camera would lose.

     Down the right-hand side are the two subsystems I lead: the pointing
     state from ADCS, and the face temperatures through eclipse.
     ====================================================================== */

  VM.scenes.eventsat = function (el) {
    var canvas = canvasOf(el);
    if (!canvas) return;

    var rnd = VM.rng(1402);
    var SW = 960, SH = 600;             /* sensor coordinates */
    var CYC = 15.0;
    var HOLD_FROM = 6.0;                /* when the spacecraft stops slewing */

    /* Background stars, in sensor space. */
    var sky = [];
    for (var i = 0; i < 90; i++) {
      sky.push({ x: rnd() * SW * 1.5 - SW * 0.25, y: rnd() * SH * 1.5 - SH * 0.25, m: Math.pow(rnd(), 2.2) });
    }

    var events = [];        /* {x, y, p, t} */
    var ticker = [];
    var clock = 13958000;   /* microseconds, for the event ticker */
    var ctl = VM.orbitControl(el, -0.35, 0.3, { minPitch: -0.1, maxPitch: 0.9 });
    var sun = VM.norm(VM.v(-0.40, 0.28, 0.88));

    VM.animate(canvas, function (ctx, w, h, t, dt) {
      var ph = t % CYC;
      var slewing = ph < HOLD_FROM;
      var narrow = w < 700;

      /* ---------------------------------------------------------- layout */
      var pad = 12;
      var railW = narrow ? 0 : Math.min(226, w * 0.30);
      var sx0 = pad + 10, sy0 = pad + 10;
      var sw = w - railW - pad * 2 - 20, sh = h - pad * 2 - 20;

      /* --------------------------------------------------------- physics */
      /* Apparent drift of the sky across the sensor, in sensor px/s. */
      var dx = slewing ? -46 : 0;
      var dy = slewing ? 17 : 0;
      clock += Math.round(dt * 1e6);

      /* The resident space object crosses on its own track, and keeps moving
         relative to the stars whether or not the spacecraft is slewing.
         Taking it as a function of phase lets the seeding path walk it
         backwards and lay down a trail. */
      function objAt(p) {
        var o = ((p % CYC) - 1.2) / (CYC - 2.4);
        if (o <= 0 || o >= 1) return null;
        return { x: SW * (0.06 + 0.88 * o), y: SH * (0.74 - 0.42 * o), ou: o };
      }
      var obj = objAt(ph);
      var ou = obj ? obj.ou : 0;

      function emit(x, y, p) {
        if (x < 0 || y < 0 || x >= SW || y >= SH) return;
        events.push({ x: x, y: y, p: p, t: t });
        if (rnd() < 0.012 && ticker.length < 60) {
          ticker.unshift({ x: x | 0, y: y | 0, p: p, us: clock + ((rnd() * 900) | 0) });
          if (ticker.length > 6) ticker.pop();
        }
      }

      /* One slice of sensor activity. Pulled out of the frame loop so that
         the reduced-motion path can seed a representative still by running a
         few slices by hand - the clock never advances there, so without this
         the frame would be sensor noise and nothing else. */
      function step(sdt, at) {
        /* Stars only fire while the sky is moving across the pixels. */
        if (slewing) {
          for (var k = 0; k < sky.length; k++) {
            var s2 = sky[k];
            var px = (((s2.x + dx * at) % (SW * 1.5)) + SW * 1.5) % (SW * 1.5) - SW * 0.25;
            var py = (((s2.y + dy * at) % (SH * 1.5)) + SH * 1.5) % (SH * 1.5) - SH * 0.25;
            var n = (2 + 26 * s2.m) * sdt * 10;
            for (var q = 0; q < n; q++) {
              var a = rnd() * TAU, rr = (1.4 + s2.m * 4) * Math.sqrt(rnd());
              emit(px + Math.cos(a) * rr, py + Math.sin(a) * rr,
                Math.cos(a) * (dx < 0 ? -1 : 1) > 0 ? 1 : 0);
            }
          }
        }
        /* The object fires in both regimes - that is the whole point - and
           hard enough to stand out from the slewing starfield. */
        var ob = objAt(at);
        if (ob) {
          var m2 = 130 * sdt * 10;
          for (var q2 = 0; q2 < m2; q2++) {
            var a2 = rnd() * TAU, r2 = 3.4 * Math.sqrt(rnd());
            emit(ob.x + Math.cos(a2) * r2, ob.y + Math.sin(a2) * r2,
              Math.cos(a2) > 0 ? 1 : 0);
          }
        }
        /* Sensor noise, always there. */
        for (var q3 = 0; q3 < 55 * sdt * 10; q3++) {
          emit(rnd() * SW, rnd() * SH, rnd() < 0.5 ? 1 : 0);
        }
      }

      if (dt > 0) {
        step(dt, t);
      } else if (!events.length) {
        for (var z = 7; z >= 0; z--) step(0.055, t - z * 0.05);
      }

      /* Events fade out over a fixed window, like a real event viewer. */
      var LIFE = 0.55;
      while (events.length && t - events[0].t > LIFE) events.shift();
      if (events.length > 9000) events.splice(0, events.length - 9000);

      /* ---------------------------------------------------------- sensor */
      panel(ctx, pad, pad, w - railW - pad * 2, h - pad * 2,
        "EVENT CAMERA · " + (slewing ? "SLEWING" : "INERTIAL HOLD"));

      ctx.save();
      ctx.beginPath(); ctx.rect(sx0, sy0, sw, sh); ctx.clip();

      var kx = sw / SW, ky = sh / SH;
      for (var e = 0; e < events.length; e++) {
        var ev = events[e];
        var age = dt > 0 ? 1 - (t - ev.t) / LIFE : 0.75;
        ctx.fillStyle = ev.p
          ? "rgba(77,163,255," + age + ")"
          : "rgba(139,108,255," + age + ")";
        ctx.fillRect(sx0 + ev.x * kx, sy0 + ev.y * ky, 1.7, 1.7);
      }

      /* Onboard detection, once the object has been tracked long enough. */
      var detected = obj && ou > 0.3;
      if (detected) {
        var bx = sx0 + obj.x * kx, by = sy0 + obj.y * ky;
        var b = 17;
        ctx.strokeStyle = VM.fade(C.good, 0.95);
        ctx.lineWidth = 1.3;
        var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        for (var ci = 0; ci < 4; ci++) {
          var cxs = corners[ci][0], cys = corners[ci][1];
          ctx.beginPath();
          ctx.moveTo(bx + cxs * b - cxs * 6, by + cys * b);
          ctx.lineTo(bx + cxs * b, by + cys * b);
          ctx.lineTo(bx + cxs * b, by + cys * b - cys * 6);
          ctx.stroke();
        }
        /* The fitted track, back to where it was first picked up. */
        var t0u = 0.3;
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = VM.fade(C.good, 0.45);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx0 + SW * (0.06 + 0.88 * t0u) * kx, sy0 + SH * (0.74 - 0.42 * t0u) * ky);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.setLineDash([]);
        VM.tag(ctx, "OBJECT · TRACKED ON BOARD", bx + b + 8, by - b - 2,
          VM.fade(C.good, 0.95), 9.5, sx0 + sw);
      }
      ctx.restore();

      /* The line that explains what is happening, inside the sensor frame. */
      VM.label(ctx,
        slewing
          ? "SLEWING · THE WHOLE SKY MOVES, SO EVERY STAR FIRES"
          : "HOLDING · STARS GO QUIET, THE MOVING OBJECT DOES NOT",
        sx0 + 2, sy0 + sh - 8,
        slewing ? "rgba(185,203,232,0.7)" : VM.fade(C.good, 0.9), 9.5);

      VM.label(ctx, "+ ON", pad + (w - railW - pad * 2) - 76, pad + 13, VM.fade(C.accent, 0.9), 9);
      VM.label(ctx, "− OFF", pad + (w - railW - pad * 2) - 40, pad + 13, VM.fade(C.accent2, 0.9), 9);

      /* ------------------------------------------------------------ rail */
      if (!narrow) {
        var rx = w - railW - pad + 6, rw = railW - 6;

        /* Where the spacecraft is, and whether it is in sunlight. */
        var inc = 97.6 * DEG, raan = 38 * DEG, u = t * 0.14;
        var sp = VM.orbit(1.22, inc, raan, u);
        var eclipse = VM.dot(VM.norm(sp), sun) < -0.18;

        var oh = Math.min(rw * 0.78, h * 0.34);
        panel(ctx, rx, pad, rw, oh, "ORBIT");
        if (ctl.idle) ctl.yaw += 0.0018;
        var cam = VM.camera(rx + rw * 0.5, pad + oh * 0.58, Math.min(rw, oh) * 0.30, ctl.yaw, ctl.pitch);
        ctx.save();
        ctx.beginPath(); ctx.rect(rx + 1, pad + 16, rw - 2, oh - 18); ctx.clip();
        VM.orbitTrack(ctx, cam, 1.22, inc, raan, false, VM.fade(C.accent, 0.18));
        VM.earth(ctx, cam, 1, t * 0.022, sun, { dot: 0.9 });
        VM.orbitTrack(ctx, cam, 1.22, inc, raan, true, VM.fade(C.accent, 0.3));
        var ss = cam.project(sp);
        if (!VM.hidden(ss.q, 1)) VM.dotGlow(ctx, ss.x, ss.y, 12, eclipse ? C.accent2 : C.accent, true);
        ctx.restore();

        /* ADCS and thermal, the two subsystems I lead. */
        var ry2 = pad + oh + 10;
        var rh = h - ry2 - pad;
        panel(ctx, rx, ry2, rw, rh, "SUBSYSTEMS");

        readout(ctx, rx + 10, ry2 + 30, [
          ["ADCS", slewing ? "SLEW" : "INERTIAL HOLD", slewing ? C.warn : C.good],
          ["PAYLOAD", detected ? "OBJECT TRACK" : "SURVEYING",
            detected ? VM.fade(C.good, 0.95) : C.ink],
          ["POWER", eclipse ? "ECLIPSE" : "SUNLIT", eclipse ? C.accent2 : C.good]
        ], 15);

        /* A compact thermal strip rather than a full chart. */
        var tx = rx + 10, tw2 = rw - 20;
        var ty = ry2 + 88, th2 = 30;
        VM.label(ctx, "FACE TEMPERATURES", tx, ty - 8, "rgba(150,175,215,0.6)", 8.5);
        ctx.fillStyle = "rgba(139,108,255,0.10)";
        ctx.fillRect(tx + tw2 * 0.46, ty, tw2 * 0.34, th2);
        var curves = [
          { c: C.warn, amp: 0.30, off: 0.34 },
          { c: C.accent, amp: 0.13, off: 0.64 }
        ];
        for (var cu2 = 0; cu2 < curves.length; cu2++) {
          var cu = curves[cu2];
          ctx.strokeStyle = VM.fade(cu.c, 0.9);
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          for (var s3 = 0; s3 <= 60; s3++) {
            var fx = s3 / 60;
            var v = cu.off + cu.amp * Math.sin((fx - 0.46) / 0.34 * Math.PI) *
              (fx > 0.46 && fx < 0.80 ? 1 : 0.18);
            var X = tx + tw2 * fx, Y = ty + th2 * v;
            if (s3 === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
          }
          ctx.stroke();
        }
        var nowX = tx + tw2 * (((u / TAU) % 1 + 1) % 1);
        ctx.strokeStyle = "rgba(226,236,252,0.45)";
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(nowX, ty); ctx.lineTo(nowX, ty + th2); ctx.stroke();
        ctx.setLineDash([]);

        /* The raw event stream, which is all the sensor actually outputs. */
        var kY = ty + th2 + 22;
        if (kY + 70 < h - pad) {
          VM.label(ctx, "EVENT STREAM", tx, kY - 8, "rgba(150,175,215,0.6)", 8.5);
          VM.label(ctx, "   x    y  p      t µs", tx, kY + 4, "rgba(150,175,215,0.45)", 8.5);
          for (var ti = 0; ti < Math.min(ticker.length, 4); ti++) {
            var it = ticker[ti];
            var row = pad4(it.x) + " " + pad4(it.y) + "  " + it.p + "  " + it.us;
            VM.label(ctx, row, tx, kY + 18 + ti * 12,
              it.p ? VM.fade(C.accent, 0.8) : VM.fade(C.accent2, 0.8), 8.5);
          }
        }
      }

      ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 7.5 });
  };

  /* ======================================================================
     navigation - cooperative satellite navigation
     ----------------------------------------------------------------------
     The finding on this project is that the limit is geometric, not
     protocolar: what matters is how the visible transmitters are spread
     around the receiver, not how many there are. So the PDOP here is really
     computed from the lines of sight on screen - trace of (G'G) inverse, with
     G the matrix of unit vectors to the visible transmitters - and the error
     ellipse is drawn from it. Watch it stay poor through a pass where four
     satellites are visible but clustered.
     ====================================================================== */

  /* Inverse of a symmetric 3x3 via the adjugate; null if near-singular. */
  function inv3(M) {
    var a = M[0][0], b = M[0][1], c = M[0][2];
    var d = M[1][0], e = M[1][1], f = M[1][2];
    var g = M[2][0], hh = M[2][1], i = M[2][2];
    var A = e * i - f * hh, B = -(d * i - f * g), Cc = d * hh - e * g;
    var det = a * A + b * B + c * Cc;
    if (Math.abs(det) < 1e-9) return null;
    return [
      [A / det, (c * hh - b * i) / det, (b * f - c * e) / det],
      [B / det, (a * i - c * g) / det, (c * d - a * f) / det],
      [Cc / det, (b * g - a * hh) / det, (a * e - b * d) / det]
    ];
  }

  /* PDOP from unit line-of-sight vectors. Needs at least three, well spread. */
  function pdop(los) {
    if (los.length < 3) return null;
    var M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var k = 0; k < los.length; k++) {
      var u = los[k];
      var r = [u.x, u.y, u.z];
      for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) M[a][b] += r[a] * r[b];
    }
    var I = inv3(M);
    if (!I) return null;
    var tr = I[0][0] + I[1][1] + I[2][2];
    return tr > 0 ? Math.sqrt(tr) : null;
  }

  VM.scenes.navigation = function (el) {
    var canvas = canvasOf(el);
    if (!canvas) return;

    var stars = new VM.Stars(220, 31);
    var sun = VM.norm(VM.v(-0.40, 0.32, 0.86));
    var ctl = VM.orbitControl(el, -0.6, 0.28, { minPitch: -0.1, maxPitch: 0.9 });

    /* Three planes, which is the configuration the paper rules out as a
       navigation provider however many satellites you put in it. Six per
       plane, so the receiver usually has enough in view for a fix and the
       failure you see is the geometry rather than the count. */
    var PLN = 3, PER = 6;
    var peers = [];
    for (var i = 0; i < PLN * PER; i++) {
      peers.push({
        inc: 56 * DEG,
        raan: Math.floor(i / PER) * 60 * DEG,
        u0: ((i % PER) / PER) * TAU + Math.floor(i / PER) * 0.35,
        w: 0.075
      });
    }

    VM.animate(canvas, function (ctx, w, h, t) {
      var narrow = w < 640;
      var m = Math.min(w, h);
      if (ctl.idle) ctl.yaw += 0.0019;
      var cam = VM.camera(w * (narrow ? 0.5 : 0.44), h * 0.52, m * (narrow ? 0.19 : 0.23), ctl.yaw, ctl.pitch);
      var theta = t * 0.02;

      stars.draw(ctx, w, h, t, 0);

      /* The receiver, and who it can actually see. */
      var up = VM.orbit(1.12, 24 * DEG, 200 * DEG, t * 0.085);
      var us = cam.project(up);
      var recvUp = VM.norm(up);

      var pw = [], ps = [], vis = [], los = [];
      for (i = 0; i < peers.length; i++) {
        var p = VM.orbit(2.0, peers[i].inc, peers[i].raan, peers[i].u0 + t * peers[i].w);
        pw.push(p);
        ps.push(cam.project(p));
        var d = VM.norm({ x: p.x - up.x, y: p.y - up.y, z: p.z - up.z });
        /* Above the receiver's local horizon, with a mask angle. */
        var seen = VM.dot(d, recvUp) > 0.04;
        vis.push(seen);
        if (seen) los.push(d);
      }

      var dop = pdop(los);
      var good = dop !== null && dop < 3.2;

      VM.earth(ctx, cam, 1, theta, sun, { dot: 1.1 });
      for (var pl = 0; pl < PLN; pl++) {
        VM.orbitTrack(ctx, cam, 2.0, 56 * DEG, pl * 60 * DEG, true, VM.fade(C.accent, 0.14));
      }
      VM.orbitTrack(ctx, cam, 1.12, 24 * DEG, 200 * DEG, true, VM.fade(C.good, 0.22));

      /* Ranging links from every visible transmitter. */
      for (i = 0; i < peers.length; i++) {
        if (vis[i]) {
          ctx.strokeStyle = VM.fade(C.accent, 0.4);
          ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(us.x, us.y); ctx.stroke();
          /* A range measurement running down the link. */
          var k = ((t * 0.5 + i * 0.37) % 1);
          ctx.fillStyle = VM.fade(C.accent, 0.9);
          ctx.beginPath();
          ctx.arc(ps[i].x + (us.x - ps[i].x) * k, ps[i].y + (us.y - ps[i].y) * k, 2, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = vis[i] ? VM.fade(C.accent, 0.95) : "rgba(170,195,230,0.32)";
        ctx.beginPath(); ctx.arc(ps[i].x, ps[i].y, vis[i] ? 3.4 : 2.2, 0, TAU); ctx.fill();
      }

      /* Error ellipse straight off the PDOP. It grows when the visible
         transmitters bunch up, even though the count has not changed. */
      var rr = dop === null ? m * 0.085 : VM.clamp(dop, 0.8, 7) * m * 0.011;
      ctx.strokeStyle = VM.fade(good ? C.good : C.warn, 0.75);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(us.x, us.y, rr * 1.45, rr, 0.5, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = VM.fade(good ? C.good : C.warn, 0.1);
      ctx.fill();
      VM.dotGlow(ctx, us.x, us.y, 12, good ? C.good : C.warn, true);

      if (!narrow) VM.tag(ctx, "RECEIVER", us.x + 14, us.y + 18, C.ink, 10, w);

      var rx = narrow ? 14 : w - 216;
      var ry = narrow ? h - 86 : 32;
      VM.label(ctx, "GEOMETRY, NOT COUNT", rx, ry, VM.fade(C.accent, 0.8), 10);
      readout(ctx, rx, ry + 22, [
        ["VISIBLE", los.length + " / " + peers.length, C.ink],
        ["PDOP", dop === null ? "no fix" : dop.toFixed(1), good ? C.good : C.warn],
        ["FIX", dop === null ? "UNDERDETERMINED" : good ? "USABLE" : "DEGRADED",
          good ? C.good : C.warn]
      ]);

      ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 6.0 });
  };

  /* ======================================================================
     formation - collision avoidance and formation flight
     ----------------------------------------------------------------------
     Two views side by side, because a conjunction genuinely happens at two
     scales and forcing them into one picture is what made the earlier
     version meaningless.

       left    the orbital geometry. Two circular orbits at different
               inclinations, which really do intersect - the crossing point
               is found numerically from the two orbits actually drawn - and
               two objects closing on that point at the same time.

       right   the encounter plane, a few kilometres across, which is the
               only scale at which a miss distance in metres means anything.

     The manoeuvre is the honest one. An avoidance burn does not shove the
     spacecraft sideways; a very small along-track dv changes the orbital
     period, and an orbit later that has become several hundred metres of
     along-track displacement. The spacecraft still flies through the same
     crossing point - it simply is not there at the same moment. That is why
     the left view barely changes while the right view changes completely.

     Which of the two objects manoeuvres is the part this project is about,
     and it is settled between the operators rather than imposed.
     ====================================================================== */

  VM.scenes.formation = function (el) {
    var canvas = canvasOf(el);
    if (!canvas) return;

    var stars = new VM.Stars(170, 47);
    var sun = VM.norm(VM.v(-0.42, 0.30, 0.86));

    /* Two orbits of the same radius at different inclinations: they cross. */
    var ORB_A = { r: 1.19, inc: 51.6 * DEG, raan: 12 * DEG };   /* ours */
    var ORB_B = { r: 1.19, inc: 77.0 * DEG, raan: 58 * DEG };   /* the other object */
    var RATE = 0.13;                 /* rad/s on screen */

    /* Encounter numbers. */
    var V_REL = 11200;               /* m/s, a fast crossing */
    var MISS_BEFORE = 150;           /* predicted miss, metres */
    var SHIFT = 820;                 /* along-track displacement from the burn */
    var MISS_AFTER = Math.round(Math.hypot(MISS_BEFORE, SHIFT));
    var KEEPOUT_M = 400;
    var DV = 0.12;                   /* m/s, along-track, one orbit ahead */
    var PC_BEFORE = "1.2e-3", PC_AFTER = "3.0e-7", PC_LIMIT = "1.0e-4";

    var FRAME_M = 2000;              /* width of the encounter view */
    var MIN_PER_S = 20;              /* animation seconds -> minutes to TCA */

    var CYC = 17.0, T_TCA = 12.0, T_BURN = 8.2;
    var PHASES = [
      { to: 5.2, key: "screen", name: "CONJUNCTION SCREENED" },
      { to: 8.2, key: "decide", name: "WHO MANOEUVRES" },
      { to: 9.6, key: "burn", name: "BURN EXECUTED" },
      { to: CYC, key: "pass", name: "PASS" }
    ];
    function phaseAt(ph) {
      for (var i = 0; i < PHASES.length; i++) if (ph < PHASES[i].to) return PHASES[i];
      return PHASES[PHASES.length - 1];
    }

    /* Where the two orbits cross. Found from the orbits themselves rather
       than assumed, so the marker always sits on both tracks. */
    function crossing() {
      var N = 260, pa = [], pb = [];
      for (var i = 0; i < N; i++) {
        pa.push(VM.orbit(ORB_A.r, ORB_A.inc, ORB_A.raan, (i / N) * TAU));
        pb.push(VM.orbit(ORB_B.r, ORB_B.inc, ORB_B.raan, (i / N) * TAU));
      }
      var bi = 0, bj = 0, bd = 1e9;
      for (i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          var d = Math.hypot(pa[i].x - pb[j].x, pa[i].y - pb[j].y, pa[i].z - pb[j].z);
          if (d < bd) { bd = d; bi = i; bj = j; }
        }
      }
      /* Refine around the coarse hit. */
      var ua = (bi / N) * TAU, ub = (bj / N) * TAU, span = TAU / N;
      for (var pass = 0; pass < 3; pass++) {
        var best = { d: 1e9, ua: ua, ub: ub };
        for (var s = -10; s <= 10; s++) {
          var ca = ua + (s / 10) * span;
          var qa = VM.orbit(ORB_A.r, ORB_A.inc, ORB_A.raan, ca);
          for (var u = -10; u <= 10; u++) {
            var cb = ub + (u / 10) * span;
            var qb = VM.orbit(ORB_B.r, ORB_B.inc, ORB_B.raan, cb);
            var dd = Math.hypot(qa.x - qb.x, qa.y - qb.y, qa.z - qb.z);
            if (dd < best.d) { best = { d: dd, ua: ca, ub: cb }; }
          }
        }
        ua = best.ua; ub = best.ub; span /= 8;
      }
      return { ua: ua, ub: ub, p: VM.orbit(ORB_A.r, ORB_A.inc, ORB_A.raan, ua) };
    }
    var CROSS = crossing();

    /* Aim the camera at the crossing so it is on the near side from the off. */
    var L = Math.hypot(CROSS.p.x, CROSS.p.z);
    var ctl = VM.orbitControl(el,
      Math.atan2(-CROSS.p.x, CROSS.p.z),
      Math.atan2(CROSS.p.y, L) + 0.18,
      { minPitch: -0.6, maxPitch: 1.1 });

    VM.animate(canvas, function (ctx, w, h, t) {
      var ph = t % CYC;
      var phase = phaseAt(ph);
      var burned = ph >= T_BURN;
      var narrow = w < 700;
      stars.draw(ctx, w, h, t, 0);

      /* --------------------------------------------------- orbital view */
      var viewW = narrow ? w : w * 0.60;
      var m = Math.min(viewW, h);
      if (ctl.idle) ctl.yaw += 0.0009;
      var cam = VM.camera(viewW * 0.5, h * 0.52, m * 0.33, ctl.yaw, ctl.pitch);

      ctx.save();
      ctx.beginPath(); ctx.rect(2, 2, viewW - 4, h - 4); ctx.clip();

      /* Both objects reach the crossing at the same instant. */
      var du = (ph - T_TCA) * RATE;
      var ourU = CROSS.ua + du;
      var theirU = CROSS.ub + du;
      var ourP = VM.orbit(ORB_A.r, ORB_A.inc, ORB_A.raan, ourU);
      var theirP = VM.orbit(ORB_B.r, ORB_B.inc, ORB_B.raan, theirU);

      VM.orbitTrack(ctx, cam, ORB_A.r, ORB_A.inc, ORB_A.raan, false, VM.fade(C.accent, 0.12));
      VM.orbitTrack(ctx, cam, ORB_B.r, ORB_B.inc, ORB_B.raan, false, VM.fade(C.warn, 0.12));
      VM.earth(ctx, cam, 1, t * 0.016, sun, { dot: 1.0 });
      VM.orbitTrack(ctx, cam, ORB_A.r, ORB_A.inc, ORB_A.raan, true,
        VM.fade(burned ? C.good : C.accent, 0.6));
      VM.orbitTrack(ctx, cam, ORB_B.r, ORB_B.inc, ORB_B.raan, true, VM.fade(C.warn, 0.6));

      /* The crossing point. */
      var cs = cam.project(CROSS.p);
      if (!VM.hidden(cs.q, 1)) {
        var pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
        var alarm = !burned;
        ctx.strokeStyle = VM.fade(alarm ? C.warn : C.good, 0.35 + 0.45 * pulse);
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(cs.x, cs.y, 11 + 7 * pulse, 0, TAU); ctx.stroke();
        ctx.strokeStyle = VM.fade(alarm ? C.warn : C.good, 0.7);
        ctx.beginPath(); ctx.arc(cs.x, cs.y, 5, 0, TAU); ctx.stroke();
        /* Drop the caption once a spacecraft is on top of the marker; the
           ring says the same thing and two tags there collide. */
        var osq = cam.project(ourP), tsq = cam.project(theirP);
        var busy = Math.hypot(osq.x - cs.x, osq.y - cs.y) < 56 ||
          Math.hypot(tsq.x - cs.x, tsq.y - cs.y) < 56;
        if (!narrow && !busy) {
          VM.tag(ctx, "ORBITS CROSS HERE", cs.x + 16, cs.y - 16,
            VM.fade(alarm ? C.warn : C.good, 0.95), 9.5, viewW - 6);
        }
      }

      /* The two objects. */
      var os = cam.project(ourP), ts2 = cam.project(theirP);
      if (!VM.hidden(ts2.q, 1)) {
        VM.dotGlow(ctx, ts2.x, ts2.y, 13, C.warn, true);
        VM.tag(ctx, "DEBRIS OBJECT", ts2.x + 12, ts2.y + 16, VM.fade(C.warn, 0.95), 9.5, viewW - 6);
      }
      if (!VM.hidden(os.q, 1)) {
        VM.dotGlow(ctx, os.x, os.y, 14, burned ? C.good : C.accent, true);
        VM.tag(ctx, "OUR SPACECRAFT", os.x + 12, os.y - 14,
          VM.fade(burned ? C.good : C.accent, 0.95), 9.5, viewW - 6);
      }

      /* The burn: a flash on our spacecraft, one orbit before the crossing. */
      if (ph >= T_BURN && ph < T_BURN + 1.4 && !VM.hidden(os.q, 1)) {
        var bk = VM.ease((ph - T_BURN) / 1.2);
        ctx.fillStyle = VM.fade(C.good, 0.75 * (1 - bk));
        ctx.beginPath(); ctx.arc(os.x, os.y, 7 + 26 * bk, 0, TAU); ctx.fill();
        VM.tag(ctx, "Δv " + DV.toFixed(2) + " m/s ALONG-TRACK",
          os.x + 14, os.y + 18, VM.fade(C.good, 0.95), 10, viewW - 6);
      }

      VM.label(ctx, "ORBITAL GEOMETRY", 20, 26, VM.fade(C.accent, 0.8), 10);
      VM.label(ctx, burned
        ? "SAME ORBIT · ARRIVES " + SHIFT + " m FURTHER BACK"
        : "TWO ORBITS, ONE CROSSING POINT, BOTH ARRIVE TOGETHER",
        20, h - 22, burned ? VM.fade(C.good, 0.85) : "rgba(185,203,232,0.6)", 9.5);
      ctx.restore();

      /* ------------------------------------------------- encounter plane */
      if (!narrow) {
        var ex = viewW + 14, ew = w - viewW - 28;
        var eh = Math.min(ew * 0.72, h * 0.46);
        var ey = 22;
        panel(ctx, ex, ey, ew, eh,
          "ENCOUNTER PLANE · " + FRAME_M + " m ACROSS");

        var ecx = ex + ew * 0.5, ecy = ey + eh * 0.66;
        var mpp = Math.min(ew, eh) * 0.80 / FRAME_M;
        var miss = burned ? MISS_AFTER : MISS_BEFORE;

        ctx.save();
        ctx.beginPath(); ctx.rect(ex + 1, ey + 17, ew - 2, eh - 18); ctx.clip();

        /* Keep-out around our spacecraft. */
        var kr = KEEPOUT_M * mpp;
        ctx.fillStyle = VM.fade(C.warn, 0.07);
        ctx.beginPath(); ctx.arc(ecx, ecy, kr, 0, TAU); ctx.fill();
        ctx.strokeStyle = VM.fade(C.warn, 0.4);
        ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ecx, ecy, kr, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);

        /* Relative track of the debris: a straight line past us. */
        function relTrack(mi, colour, width, dash) {
          ctx.strokeStyle = colour; ctx.lineWidth = width;
          if (dash) ctx.setLineDash(dash);
          ctx.beginPath();
          ctx.moveTo(ecx - FRAME_M * 0.6 * mpp, ecy - mi * mpp);
          ctx.lineTo(ecx + FRAME_M * 0.6 * mpp, ecy - mi * mpp);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (burned) relTrack(MISS_BEFORE, VM.fade(C.warn, 0.28), 1, [4, 4]);
        relTrack(miss, VM.fade(burned ? C.good : C.warn, 0.9), 1.5, burned ? null : [4, 4]);

        /* Where the debris is now, in the encounter window. */
        var tau = (ph - T_TCA) * 0.055;          /* animation s -> encounter s */
        var along = VM.clamp(tau * V_REL, -FRAME_M * 0.6, FRAME_M * 0.6);
        var dxp = ecx + along * mpp, dyp = ecy - miss * mpp;

        /* Combined position uncertainty at closest approach. */
        ctx.strokeStyle = VM.fade(C.warn, 0.4);
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.ellipse(ecx, ecy - miss * mpp, 330 * mpp, 120 * mpp, 0.22, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);

        VM.dotGlow(ctx, dxp, dyp, 11, C.warn, true);
        VM.dotGlow(ctx, ecx, ecy, 12, burned ? C.good : C.accent, true);

        /* The miss distance, where it is measured. */
        ctx.strokeStyle = VM.fade(burned ? C.good : C.warn, 0.75);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(ecx, ecy); ctx.lineTo(ecx, ecy - miss * mpp); ctx.stroke();
        VM.label(ctx, miss + " m", ecx - 7, ecy - miss * mpp * 0.5,
          VM.fade(burned ? C.good : C.warn, 0.95), 9.5, "right");

        /* Scale bar. */
        var barM = 500, bw2 = barM * mpp;
        var bX = ex + 14, bY = ey + eh - 12;
        ctx.strokeStyle = "rgba(185,203,232,0.5)"; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bX, bY - 4); ctx.lineTo(bX, bY);
        ctx.lineTo(bX + bw2, bY); ctx.lineTo(bX + bw2, bY - 4);
        ctx.stroke();
        VM.label(ctx, barM + " m", bX + bw2 / 2, bY - 10, "rgba(185,203,232,0.6)", 8, "center");
        VM.label(ctx, V_REL / 1000 + " km/s REL", ex + ew - 12, ey + eh - 16,
          "rgba(185,203,232,0.5)", 8, "right");
        ctx.restore();

        /* ------------------------------------------------------ readout */
        var rx = ex, ry = ey + eh + 26;
        VM.label(ctx, "CONJUNCTION ASSESSMENT", rx, ry, VM.fade(C.accent, 0.8), 10);
        ctx.strokeStyle = "rgba(120,160,220,0.22)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(rx, ry + 10); ctx.lineTo(rx + ew, ry + 10); ctx.stroke();

        var mins = Math.round((T_TCA - ph) * MIN_PER_S);
        readout(ctx, rx, ry + 28, [
          ["TCA", (mins >= 0 ? "T−" : "T+") + Math.abs(mins) + " min", C.ink],
          ["MISS DISTANCE", miss + " m", miss < KEEPOUT_M ? C.warn : C.good],
          ["P(collision)", burned ? PC_AFTER : PC_BEFORE, burned ? C.good : C.warn],
          ["ACTION LIMIT", PC_LIMIT, "rgba(150,175,215,0.7)"],
          ["MANOEUVRE", burned ? "Δv " + DV.toFixed(2) + " m/s" : "—",
            burned ? VM.fade(C.good, 0.95) : C.ink]
        ]);

        var sy2 = ry + 28 + 5 * 15 + 16;
        VM.label(ctx, "STATUS", rx, sy2, "rgba(150,175,215,0.6)", 9.5);
        VM.label(ctx, phase.name, rx + 56, sy2,
          burned ? VM.fade(C.good, 0.95) : VM.fade(C.warn, 0.95), 10);

        /* The one line that says what is going on right now. */
        var says = {
          screen: "PREDICTED MISS IS INSIDE THE KEEP-OUT · ACTION REQUIRED",
          decide: "PRIMARY 4% PROPELLANT MARGIN · OURS 31% · WE MOVE",
          burn: "SMALL ALONG-TRACK BURN, ONE ORBIT AHEAD OF THE CROSSING",
          pass: "SAME CROSSING POINT — WE ARRIVE AFTER IT HAS GONE"
        };
        var words = says[phase.key].split(" ");
        var line = "", lines = [];
        for (var wi = 0; wi < words.length; wi++) {
          var trial = line ? line + " " + words[wi] : words[wi];
          if (trial.length > 42) { lines.push(line); line = words[wi]; }
          else line = trial;
        }
        if (line) lines.push(line);
        for (var li = 0; li < lines.length && li < 3; li++) {
          VM.label(ctx, lines[li], rx, sy2 + 20 + li * 13, "rgba(185,203,232,0.65)", 9);
        }
      }

      ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 1.0 });
  };

  /* ======================================================================
     federation - HLA-based simulation of federated satellite systems
     ----------------------------------------------------------------------
     The thing worth understanding here is that no operator hands over their
     spacecraft. Each one runs its own simulation; what crosses the shared
     bus is only the handful of attributes the others subscribed to, and the
     bus will not let anyone run ahead of the rest.

     So the scene walks one exchange at a time and says in words which step
     it is on, rather than animating everything at once.
     ====================================================================== */

  VM.scenes.federation = function (el) {
    var canvas = canvasOf(el);
    if (!canvas) return;

    var stars = new VM.Stars(140, 59);
    var OPS = [
      { name: "OPERATOR A", c: C.accent, n: 4 },
      { name: "OPERATOR B", c: C.accent2, n: 3 },
      { name: "OPERATOR C", c: C.warn, n: 3 }
    ];

    /* One publish-and-deliver exchange, narrated. */
    var STEPS = [
      { d: 2.0, key: "publish", say: "OPERATOR A PUBLISHES ONE SPACECRAFT STATE" },
      { d: 2.0, key: "bus", say: "THE RTI CARRIES IT — ATTRIBUTES ONLY, NOT THE MODEL" },
      { d: 2.0, key: "deliver", say: "DELIVERED TO THE FEDERATES THAT SUBSCRIBED" },
      { d: 1.8, key: "advance", say: "EVERYONE ADVANCES TO THE NEXT TIME STEP TOGETHER" }
    ];
    var TOTAL = 0;
    for (var si = 0; si < STEPS.length; si++) TOTAL += STEPS[si].d;

    function phaseAt(tt) {
      var x = tt % TOTAL;
      for (var i = 0; i < STEPS.length; i++) {
        if (x < STEPS[i].d) return { i: i, k: x / STEPS[i].d, step: STEPS[i] };
        x -= STEPS[i].d;
      }
      return { i: 0, k: 0, step: STEPS[0] };
    }

    VM.animate(canvas, function (ctx, w, h, t) {
      stars.draw(ctx, w, h, t, 0);

      var cycle = Math.floor(t / TOTAL);
      var st = phaseAt(t);
      var key = st.step.key;
      var narrow = w < 640;

      var bx0 = w * 0.08, bx1 = w * 0.92;
      var busY = h * 0.56;
      var fw = (bx1 - bx0) / OPS.length;
      var boxW = Math.min(fw * 0.74, 210);
      var fy = h * 0.22;

      /* --------------------------------------------------------- the bus */
      ctx.strokeStyle = VM.fade(C.accent, key === "bus" ? 0.6 : 0.3);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx0, busY); ctx.lineTo(bx1, busY); ctx.stroke();
      for (var g = 0; g <= 36; g++) {
        var gxp = bx0 + ((bx1 - bx0) * g) / 36;
        ctx.strokeStyle = "rgba(120,160,220,0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gxp, busY - 4); ctx.lineTo(gxp, busY + 4); ctx.stroke();
      }
      VM.label(ctx, "SHARED BUS · IEEE 1516 RUN-TIME INFRASTRUCTURE",
        bx0, busY + 22, VM.fade(C.accent, 0.75), 9.5);

      /* ---------------------------------------------------- the federates */
      var centres = [];
      for (var i = 0; i < OPS.length; i++) {
        var op = OPS[i];
        var fx = bx0 + fw * i + fw * 0.5;
        centres.push(fx);

        var isSource = i === 0;
        var active = (key === "publish" && isSource) ||
          (key === "deliver" && !isSource) ||
          key === "advance";

        /* Stem down to the bus. */
        ctx.strokeStyle = VM.fade(op.c, active ? 0.55 : 0.2);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fx, fy + 46); ctx.lineTo(fx, busY); ctx.stroke();

        panel(ctx, fx - boxW / 2, fy - 30, boxW, 76, null);
        VM.label(ctx, op.name, fx, fy - 14, VM.fade(op.c, 0.95), 10, "center");

        /* The spacecraft stay inside their owner's federate. */
        for (var s2 = 0; s2 < op.n; s2++) {
          var sx = fx - boxW / 2 + (boxW * (s2 + 0.5)) / op.n;
          var sy = fy + 6;
          var lit = isSource && s2 === 1 && key !== "advance";
          if (lit) VM.dotGlow(ctx, sx, sy, 10, op.c, false);
          ctx.fillStyle = VM.fade(op.c, lit ? 1 : 0.75);
          ctx.beginPath(); ctx.arc(sx, sy, lit ? 3.6 : 2.8, 0, TAU); ctx.fill();
        }
        VM.label(ctx, op.n + " SPACECRAFT · PRIVATE MODEL", fx, fy + 24,
          "rgba(150,175,215,0.55)", 8.5, "center");

        var granted = key === "advance";
        VM.label(ctx, granted ? "TIME ADVANCE GRANTED" : "AT T = " + cycle + ".00 s",
          fx, fy + 38, granted ? VM.fade(C.good, 0.9) : "rgba(150,175,215,0.6)", 8.5, "center");
      }

      /* --------------------------------------------- the message in flight */
      function parcel(x, y, label) {
        ctx.fillStyle = VM.fade(C.good, 0.9);
        ctx.fillRect(x - 5, y - 3.5, 10, 7);
        if (label && !narrow) {
          VM.tag(ctx, label, x + 10, y, VM.fade(C.good, 0.95), 9, w - 8);
        }
      }
      if (key === "publish") {
        parcel(centres[0], VM.lerp(fy + 46, busY, VM.ease(st.k)), "SAT-02 STATE");
      } else if (key === "bus") {
        parcel(VM.lerp(centres[0], centres[2], VM.ease(st.k)), busY, "ATTRIBUTES");
      } else if (key === "deliver") {
        for (var d2 = 1; d2 < OPS.length; d2++) {
          parcel(centres[d2], VM.lerp(busY, fy + 46, VM.ease(st.k)), d2 === 2 ? "SUBSCRIBED" : null);
        }
      }

      /* ----------------------------------------------- what is going on now */
      var sayY = h * 0.76;
      ctx.fillStyle = "rgba(8,14,30,0.5)";
      ctx.fillRect(bx0 - 10, sayY - 15, bx1 - bx0 + 20, 30);
      VM.label(ctx, "STEP " + (st.i + 1) + " / " + STEPS.length, bx0, sayY - 1,
        VM.fade(C.accent, 0.75), 9);
      VM.label(ctx, st.step.say, bx0 + 70, sayY - 1, C.ink, 10.5);

      /* Progress through the exchange. */
      var pw = bx1 - bx0;
      ctx.fillStyle = "rgba(150,175,215,0.14)";
      ctx.fillRect(bx0, sayY + 11, pw, 2);
      var done = 0;
      for (var pi = 0; pi < st.i; pi++) done += STEPS[pi].d;
      ctx.fillStyle = VM.fade(C.accent, 0.8);
      ctx.fillRect(bx0, sayY + 11, pw * ((done + st.k * st.step.d) / TOTAL), 2);

      VM.label(ctx,
        "NO OPERATOR GIVES UP CONTROL · ONLY SUBSCRIBED ATTRIBUTES CROSS THE BUS",
        bx0, h - 22, "rgba(150,175,215,0.55)", 9);

      ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 0.4 });
  };

  /* ======================================================================
     demand - space-based communication infrastructure
     ----------------------------------------------------------------------
     This project runs backwards from demand rather than forwards from an
     architecture, and the conclusion is that the binding constraint is launch
     capacity, not spectrum or power. So the scene runs a clock from 2025 to
     2060: the demand curve climbs, the constellation fills in behind it, and
     the deployable capacity flattens against a launch ceiling. The gap that
     opens after the curves cross is the finding.
     ====================================================================== */

  VM.scenes.demand = function (el) {
    var canvas = canvasOf(el);
    if (!canvas) return;

    var stars = new VM.Stars(220, 83);
    var sun = VM.norm(VM.v(-0.5, 0.42, 0.75));
    var ctl = VM.orbitControl(el, -0.7, 0.3, { minPitch: -0.1, maxPitch: 0.9 });

    var Y0 = 2025, Y1 = 2060, SPAN = 16.0;
    var NMAX = 54;
    var rnd = VM.rng(515);
    var fleet = [];
    for (var i = 0; i < NMAX; i++) {
      fleet.push({
        r: 1.16 + Math.floor(rnd() * 3) * 0.14,
        inc: (35 + rnd() * 60) * DEG,
        raan: rnd() * TAU,
        u0: rnd() * TAU,
        w: 0.05 + rnd() * 0.03
      });
    }

    /* Demand grows close to exponentially; capacity is what the launch market
       can actually put up, so it saturates. */
    function demandAt(f) { return Math.pow(f, 1.9) * 0.95 + 0.04; }
    function capacityAt(f) { return 0.62 * (1 - Math.exp(-2.6 * f)); }

    VM.animate(canvas, function (ctx, w, h, t) {
      var f = (t % SPAN) / SPAN;
      var year = Math.round(VM.lerp(Y0, Y1, f));
      var narrow = w < 700;
      var m = Math.min(narrow ? w : w * 0.58, h);
      if (ctl.idle) ctl.yaw += 0.0016;
      var cam = VM.camera(narrow ? w * 0.5 : w * 0.3, h * (narrow ? 0.36 : 0.52),
        m * (narrow ? 0.3 : 0.4), ctl.yaw, ctl.pitch);
      var theta = t * 0.02;

      stars.draw(ctx, w, h, t, 0);

      /* The fleet fills in as the years pass, capped by what can be launched. */
      var flown = Math.round(NMAX * capacityAt(f) / 0.62);

      VM.earth(ctx, cam, 1, theta, sun, { dot: 1.1 });

      for (var i2 = 0; i2 < flown; i2++) {
        var s = cam.project(VM.orbit(fleet[i2].r, fleet[i2].inc, fleet[i2].raan,
          fleet[i2].u0 + t * fleet[i2].w));
        if (s.z < 0 && VM.hidden(s.q, 1)) continue;
        var depth = s.z > 0 ? 1 : 0.4;
        /* The newest few arrivals flash as they are deployed. */
        var fresh = i2 > flown - 3;
        if (fresh) VM.dotGlow(ctx, s.x, s.y, 10, C.good, false);
        ctx.fillStyle = VM.fade(fresh ? C.good : C.accent, 0.9 * depth);
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, TAU); ctx.fill();
      }

      /* ------------------------------------------------- the demand chart */

      var px = narrow ? 14 : w * 0.56;
      var pw2 = narrow ? w - 28 : w * 0.40;
      var py = narrow ? h * 0.60 : h * 0.20;
      var phh = narrow ? h * 0.34 : h * 0.56;
      panel(ctx, px, py, pw2, phh, "DEMAND vs DEPLOYABLE CAPACITY");

      var gx = px + 34, gy = py + 28;
      var gw = pw2 - 50, gh = phh - 58;

      ctx.strokeStyle = "rgba(150,175,215,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      VM.label(ctx, "Tb/s", px + 8, gy + 4, "rgba(150,175,215,0.55)", 8.5);
      VM.label(ctx, String(Y0), gx, gy + gh + 13, "rgba(150,175,215,0.55)", 8.5);
      VM.label(ctx, String(Y1), gx + gw, gy + gh + 13, "rgba(150,175,215,0.55)", 8.5, "right");

      /* The launch ceiling. */
      var ceil = gy + gh * (1 - 0.62);
      ctx.strokeStyle = VM.fade(C.warn, 0.5);
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(gx, ceil); ctx.lineTo(gx + gw, ceil); ctx.stroke();
      ctx.setLineDash([]);
      VM.label(ctx, "LAUNCH CEILING", gx + gw - 2, ceil - 8, VM.fade(C.warn, 0.85), 8.5, "right");

      function curve(fn, colour, width) {
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        ctx.beginPath();
        for (var k = 0; k <= 90; k++) {
          var u = (k / 90) * f;
          var X = gx + gw * u, Y = gy + gh * (1 - fn(u));
          if (k === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.stroke();
      }

      /* The shortfall, once demand has passed what can be deployed. */
      if (demandAt(f) > capacityAt(f)) {
        ctx.fillStyle = VM.fade(C.warn, 0.14);
        ctx.beginPath();
        for (var k2 = 0; k2 <= 60; k2++) {
          var u2 = (k2 / 60) * f;
          ctx.lineTo(gx + gw * u2, gy + gh * (1 - demandAt(u2)));
        }
        for (k2 = 60; k2 >= 0; k2--) {
          var u3 = (k2 / 60) * f;
          ctx.lineTo(gx + gw * u3, gy + gh * (1 - capacityAt(u3)));
        }
        ctx.closePath(); ctx.fill();
      }

      curve(capacityAt, VM.fade(C.accent, 0.9), 1.5);
      curve(demandAt, VM.fade(C.accent2, 0.95), 1.6);

      VM.label(ctx, "DEMAND", gx + 6, gy + 10, VM.fade(C.accent2, 0.9), 8.5);
      VM.label(ctx, "CAPACITY", gx + 6, gy + 24, VM.fade(C.accent, 0.9), 8.5);

      /* Where we are on the chart. */
      var nowX = gx + gw * f;
      ctx.strokeStyle = "rgba(226,236,252,0.4)";
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(nowX, gy); ctx.lineTo(nowX, gy + gh); ctx.stroke();
      ctx.setLineDash([]);

      var short = Math.max(0, demandAt(f) - capacityAt(f));
      var rx = narrow ? 14 : 20;
      var ry = narrow ? h * 0.50 : h - 86;
      VM.label(ctx, String(year), rx, ry, VM.fade(C.accent, 0.9), 20);
      readout(ctx, rx, ry + 26, [
        ["IN ORBIT", flown + " sats", C.ink],
        ["SHORTFALL", short < 0.01 ? "none" : (short * 100).toFixed(0) + "% of demand",
          short < 0.01 ? C.good : C.warn]
      ]);

      ticks(ctx, 12, 12, w - 24, h - 24, 9, "rgba(120,160,220,0.28)");
    }, { t0: 0.6 });
  };

  VM.boot();
})();
