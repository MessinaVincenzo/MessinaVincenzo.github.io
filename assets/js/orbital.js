/* ==========================================================================
   orbital.js - canvas toolkit for the research scenes
   --------------------------------------------------------------------------
   A small orthographic 3D renderer: circular orbits, an Earth built from a
   baked land bitmask, a starfield, and an animation loop that only runs while
   its canvas is on screen. No dependencies, no build step.

   Scenes live in orbital-scenes.js and register themselves on VM.scenes; the
   markup in _includes/orbital-scene.html picks one with data-scene="name".

   Loaded as a normal external script on purpose. Inline scripts are rewritten
   by `layout: compress` in production builds, which silently breaks anything
   that relies on line structure.
   ========================================================================== */
(function () {
  "use strict";

  var VM = (window.VMOrbital = window.VMOrbital || {});
  var TAU = Math.PI * 2;
  var DEG = Math.PI / 180;

  VM.TAU = TAU;
  VM.DEG = DEG;
  VM.scenes = {};
  VM.reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Palette, kept in step with the --space-* tokens in _sass/layout/_space.scss. */
  VM.C = {
    accent: "#4da3ff",
    accent2: "#8b6cff",
    warn: "#f0a35e",
    good: "#5ddc9a",
    ink: "rgba(226,236,252,0.92)",
    dim: "rgba(185,203,232,0.55)",
    faint: "rgba(150,175,215,0.22)"
  };

  /* rgba() from one of the hex colours above, so scenes can fade them. */
  VM.fade = function (hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  };

  /* ------------------------------------------------------------------ maths */

  VM.v = function (x, y, z) { return { x: x, y: y, z: z }; };
  VM.len = function (a) { return Math.hypot(a.x, a.y, a.z); };
  VM.norm = function (a) { var l = VM.len(a) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; };
  VM.dot = function (a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; };
  VM.lerp = function (a, b, u) { return a + (b - a) * u; };
  VM.clamp = function (x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; };
  /* Smooth 0..1 ramp, used all over the scenes for fades and eases. */
  VM.ease = function (x) { x = VM.clamp(x, 0, 1); return x * x * (3 - 2 * x); };

  function rotX(p, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }
  function rotY(p, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }
  VM.rotX = rotX;
  VM.rotY = rotY;

  /* Equatorial (x, y, z=north) -> world (x right, y up = north, z to viewer). */
  function toWorld(x, y, z) { return { x: x, y: z, z: -y }; }

  /* Point at argument of latitude u on a circular orbit. */
  VM.orbit = function (r, inc, raan, u) {
    var cu = Math.cos(u), su = Math.sin(u);
    var ci = Math.cos(inc), si = Math.sin(inc);
    var cO = Math.cos(raan), sO = Math.sin(raan);
    return toWorld(
      r * (cO * cu - sO * su * ci),
      r * (sO * cu + cO * su * ci),
      r * (su * si)
    );
  };

  /* Earth-fixed point at lat/lon, with the globe spun by theta. */
  VM.surface = function (r, lat, lon, theta) {
    var cl = Math.cos(lat);
    return toWorld(r * cl * Math.cos(lon + theta), r * cl * Math.sin(lon + theta), r * Math.sin(lat));
  };

  /* Orthographic camera: yaw about world y, then pitch about x. */
  VM.camera = function (cx, cy, scale, yaw, pitch) {
    return {
      cx: cx, cy: cy, scale: scale, yaw: yaw, pitch: pitch,
      view: function (p) { return rotX(rotY(p, yaw), pitch); },
      project: function (p) {
        var q = this.view(p);
        return { x: cx + q.x * scale, y: cy - q.y * scale, z: q.z, q: q };
      }
    };
  };

  /* Is a view-space point behind the globe of radius R? */
  VM.hidden = function (q, R) { return q.z < 0 && q.x * q.x + q.y * q.y < R * R; };

  /* Deterministic RNG so every reload draws the same constellation. */
  VM.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  };

  /* ------------------------------------------------------------------- land */

  var LAND = null;

  /* Fibonacci-sphere points filtered through the baked land bitmask, so the
     continents come out evenly covered rather than bunched at the poles. */
  VM.land = function () {
    if (LAND) return LAND;
    LAND = [];
    var b64 = window.VM_LANDMASK;
    if (!b64) return LAND;
    var raw = atob(b64);
    var W = 240, H = 120;
    var N = 15000, ga = Math.PI * (3 - Math.sqrt(5));
    for (var n = 0; n < N; n++) {
      var z = 1 - (2 * (n + 0.5)) / N;
      var lat = Math.asin(z);
      var lon = ((n * ga) % TAU) - Math.PI;
      var i = Math.min(W - 1, Math.floor(((lon + Math.PI) / TAU) * W));
      var j = Math.min(H - 1, Math.floor(((Math.PI / 2 - lat) / Math.PI) * H));
      var k = j * W + i;
      if ((raw.charCodeAt(k >> 3) >> (7 - (k & 7))) & 1) LAND.push([lat, lon]);
    }
    return LAND;
  };

  /* Earth: atmosphere, lit ocean, land dots shaded by sun angle, night side. */
  VM.earth = function (ctx, cam, R, theta, sun, opts) {
    opts = opts || {};
    var sR = R * cam.scale, cx = cam.cx, cy = cam.cy;
    var sv = VM.norm(cam.view(sun));

    var glow = ctx.createRadialGradient(cx, cy, sR * 0.97, cx, cy, sR * 1.18);
    glow.addColorStop(0, "rgba(77,163,255,0.26)");
    glow.addColorStop(1, "rgba(77,163,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, sR * 1.18, 0, TAU); ctx.fill();

    var lx = cx + sv.x * sR * 0.45, ly = cy - sv.y * sR * 0.45;
    var oc = ctx.createRadialGradient(lx, ly, sR * 0.05, cx, cy, sR);
    oc.addColorStop(0, "#143d6b");
    oc.addColorStop(0.55, "#0a1c34");
    oc.addColorStop(1, "#050b16");
    ctx.fillStyle = oc;
    ctx.beginPath(); ctx.arc(cx, cy, sR, 0, TAU); ctx.fill();

    var pts = VM.land();
    var dot = Math.max(1, sR / 165) * (opts.dot || 1);
    for (var k = 0; k < pts.length; k++) {
      var q = cam.view(VM.surface(R, pts[k][0], pts[k][1], theta));
      if (q.z <= 0) continue;
      var light = (q.x * sv.x + q.y * sv.y + q.z * sv.z) / R;
      var day = VM.clamp(light * 2.2 + 0.22, 0, 1);
      var edge = q.z / R;
      var a = (0.16 + 0.74 * day) * (0.34 + 0.66 * edge);
      ctx.fillStyle = day > 0.05
        ? "rgba(" + ((152 + 90 * day) | 0) + "," + ((192 + 50 * day) | 0) + ",255," + a + ")"
        : "rgba(78,108,168," + a * 0.8 + ")";
      ctx.fillRect(cx + q.x * cam.scale - dot / 2, cy - q.y * cam.scale - dot / 2, dot, dot);
    }

    var nx = cx - sv.x * sR, ny = cy + sv.y * sR;
    var night = ctx.createRadialGradient(nx, ny, 0, nx, ny, sR * 1.9);
    night.addColorStop(0, "rgba(2,4,9,0.84)");
    night.addColorStop(0.55, "rgba(2,4,9,0.54)");
    night.addColorStop(0.85, "rgba(2,4,9,0)");
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, sR, 0, TAU); ctx.clip();
    ctx.fillStyle = night;
    ctx.fillRect(cx - sR, cy - sR, 2 * sR, 2 * sR);
    ctx.restore();

    ctx.strokeStyle = "rgba(120,180,255,0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, sR, 0, TAU); ctx.stroke();
  };

  /* Draw a full orbit, splitting front and back halves so it reads as 3D. */
  VM.orbitTrack = function (ctx, cam, r, inc, raan, front, colour, steps) {
    steps = steps || 150;
    var prev = null;
    ctx.lineWidth = 1;
    for (var k = 0; k <= steps; k++) {
      var s = cam.project(VM.orbit(r, inc, raan, (k / steps) * TAU));
      if (prev && (s.z >= 0) === front) {
        ctx.strokeStyle = front ? colour : "rgba(140,170,210,0.07)";
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
      prev = s;
    }
  };

  /* ------------------------------------------------------------------ stars */

  VM.Stars = function (n, seed) {
    var rnd = VM.rng(seed || 7);
    this.list = [];
    for (var i = 0; i < n; i++) {
      this.list.push({
        x: rnd(), y: rnd(),
        r: Math.pow(rnd(), 3) * 1.3 + 0.3,
        a: rnd() * 0.65 + 0.15,
        tw: rnd() * TAU
      });
    }
  };
  VM.Stars.prototype.draw = function (ctx, w, h, t, drift) {
    drift = drift || 0;
    for (var i = 0; i < this.list.length; i++) {
      var st = this.list[i];
      var x = (((st.x + drift * st.r * 0.02) % 1) + 1) % 1;
      var a = st.a * (0.75 + 0.25 * Math.sin(t * 1.2 + st.tw));
      ctx.fillStyle = "rgba(220,232,255," + a + ")";
      ctx.fillRect(x * w, st.y * h, st.r, st.r);
    }
  };

  /* --------------------------------------------------------------- drawing */

  var MONO = 'px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

  VM.label = function (ctx, txt, x, y, colour, size, align) {
    ctx.font = (size || 10.5) + MONO;
    ctx.fillStyle = colour || VM.C.dim;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, x, y);
  };

  /* Label with a backing plate, for text that has to sit over the globe.
     maxRight keeps a tag on a moving object from running off the canvas: it
     slides back inside rather than being clipped mid-word. */
  VM.tag = function (ctx, txt, x, y, colour, size, maxRight) {
    size = size || 10.5;
    ctx.font = size + MONO;
    ctx.textAlign = "left";
    var w = ctx.measureText(txt).width;
    if (maxRight) x = Math.max(6, Math.min(x, maxRight - w - 8));
    ctx.fillStyle = "rgba(4,8,20,0.62)";
    ctx.fillRect(x - 4, y - size * 0.8, w + 8, size * 1.6);
    VM.label(ctx, txt, x, y, colour, size);
    return w;
  };

  VM.dotGlow = function (ctx, x, y, r, colour, core) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, VM.fade(colour, 0.85));
    g.addColorStop(1, VM.fade(colour, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (core) {
      ctx.fillStyle = core === true ? "#fff" : core;
      ctx.beginPath(); ctx.arc(x, y, Math.max(1.6, r * 0.18), 0, TAU); ctx.fill();
    }
  };

  /* -------------------------------------------------------------- the loop */

  /* Resizes to its CSS box at devicePixelRatio and runs only while visible.
     draw(ctx, w, h, t, dt) gets CSS-pixel sizes and seconds. Under
     prefers-reduced-motion the clock never advances, so each scene renders as
     a single still frame - which is why every scene is written to look
     finished at its t0 rather than mid-transition. */
  VM.animate = function (canvas, draw, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var w = 1, h = 1, visible = true, raf = 0;
    var last = performance.now();
    var t = opts.t0 || 0;

    function frame(once) {
      var now = performance.now();
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (VM.reduced) dt = 0;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t, dt);
      if (!once && visible && !VM.reduced) raf = requestAnimationFrame(function () { frame(false); });
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2);
      w = Math.max(1, r.width);
      h = Math.max(1, Math.min(r.height, 2400));
      var W = Math.round(w * dpr), H = Math.round(h * dpr);
      if (canvas.width === W && canvas.height === H) return;
      canvas.width = W; canvas.height = H;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (VM.reduced || !visible) frame(true);
    }

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var v = en[0].isIntersecting;
        if (v && !visible) {
          visible = true;
          last = performance.now();
          cancelAnimationFrame(raf);
          frame(false);
        }
        visible = v;
      }, { rootMargin: "120px" }).observe(canvas);
    }

    /* With motion reduced the loop never runs, so a drag would move the
       camera without anything being repainted. Repaint on demand instead.
       orbitControl binds to the same element earlier in scene setup, so its
       handler has already updated the camera by the time this one fires. */
    if (VM.reduced && canvas.parentElement) {
      canvas.parentElement.addEventListener("pointermove", function () { frame(true); });
    }

    resize();
    frame(false);
    return { get t() { return t; }, draw: function () { frame(true); } };
  };

  /* Drag-to-rotate. Returns a state object a scene reads each frame; idle goes
     true once the pointer has been quiet long enough for the drift to resume. */
  VM.orbitControl = function (el, yaw0, pitch0, opts) {
    opts = opts || {};
    var loPitch = opts.minPitch === undefined ? -1.15 : opts.minPitch;
    var hiPitch = opts.maxPitch === undefined ? 1.15 : opts.maxPitch;
    var st = {
      yaw: yaw0,
      pitch: pitch0,
      dragging: false,
      quietAt: 0,
      get idle() { return !this.dragging && performance.now() > this.quietAt; }
    };
    var from = null;

    el.addEventListener("pointerdown", function (e) {
      from = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch };
      st.dragging = true;
      el.classList.add("is-grabbing");
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", function (e) {
      if (!from) return;
      st.yaw = from.yaw + (e.clientX - from.x) * 0.008;
      st.pitch = VM.clamp(from.pitch + (e.clientY - from.y) * 0.006, loPitch, hiPitch);
      st.quietAt = performance.now() + 5000;
    });
    function end() {
      from = null;
      st.dragging = false;
      el.classList.remove("is-grabbing");
      st.quietAt = performance.now() + 5000;
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);
    return st;
  };

  /* ---------------------------------------------------------------- wiring */

  /* Bind every [data-scene] on the page to its registered scene. Safe to call
     more than once; each canvas is only ever bound once. */
  VM.boot = function () {
    var nodes = document.querySelectorAll("[data-scene]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-scene-ready")) continue;
      var name = el.getAttribute("data-scene");
      var fn = VM.scenes[name];
      if (!fn) continue;
      el.setAttribute("data-scene-ready", "1");
      try {
        fn(el);
      } catch (err) {
        /* A broken scene must not take the rest of the page with it. */
        el.setAttribute("data-scene-failed", "1");
        if (window.console) console.error("scene " + name + ":", err);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { VM.boot(); });
  } else {
    VM.boot();
  }
})();
