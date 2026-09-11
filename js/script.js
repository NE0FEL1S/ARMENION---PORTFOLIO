/* =====================================================================
   Arbien M. Armenion — Portfolio
   Vanilla JavaScript. No dependencies.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* localStorage can throw in private mode — never let it break the page */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
  };

  /* -----------------------------------------------------------------
     1. CURRENT YEAR
     ----------------------------------------------------------------- */
  const year = String(new Date().getFullYear());
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = year;
  $$(".year").forEach(el => { el.textContent = year; });

  /* -----------------------------------------------------------------
     2. THEME (light / dark)
     ----------------------------------------------------------------- */
  const root         = document.documentElement;
  const themeToggle  = $("#themeToggle");
  const themeIcon    = $("#themeIcon");
  const prefersDark  = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    if (themeIcon) themeIcon.className = isDark ? "ph-bold ph-sun" : "ph-bold ph-moon";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  applyTheme(store.get("theme") || (prefersDark.matches ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("theme", next);
    });
  }

  /* Follow the OS setting until the visitor picks a theme themselves */
  prefersDark.addEventListener("change", (e) => {
    if (!store.get("theme")) applyTheme(e.matches ? "dark" : "light");
  });

  /* -----------------------------------------------------------------
     3. MOBILE NAVIGATION
     ----------------------------------------------------------------- */
  const sidebar   = $("#sidebar");
  const navToggle = $("#navToggle");
  const navScrim  = $("#navScrim");

  function openNav() {
    sidebar.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
    navToggle.innerHTML = '<i class="ph-bold ph-x" aria-hidden="true"></i>';
    navScrim.hidden = false;
  }

  function closeNav() {
    sidebar.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    navToggle.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
    navScrim.hidden = true;
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      sidebar.classList.contains("is-open") ? closeNav() : openNav();
    });
  }
  if (navScrim) navScrim.addEventListener("click", closeNav);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  /* -----------------------------------------------------------------
     4. VIEW SWITCHING
     The nav shows one section at a time instead of scrolling to it.
     Every section stays in the markup, so with JavaScript off the page
     still reads top to bottom and crawlers see all of it.
     ----------------------------------------------------------------- */
  const navLinks = $$(".nav__link");
  const views = $$("main section[id]");
  const BASE_TITLE = document.title;

  /* view id -> the label used in the nav, for the document title */
  const viewNames = {};
  navLinks.forEach(link => {
    const id = (link.getAttribute("href") || "").slice(1);
    const label = link.querySelector("span");
    if (id && label) viewNames[id] = label.textContent.trim();
  });

  function isView(el) { return views.indexOf(el) > -1; }

  function showView(id, opts) {
    opts = opts || {};
    const target = document.getElementById(id);
    if (!target || !isView(target)) return false;

    views.forEach(view => { view.hidden = view !== target; });

    navLinks.forEach(link => {
      const active = link.getAttribute("href") === "#" + target.id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const name = viewNames[target.id];
    document.title = (!name || target.id === "home") ? BASE_TITLE : name + " — " + BASE_TITLE;

    if (opts.scroll !== false) {
      try { window.scrollTo({ top: 0, behavior: "instant" }); }
      catch (err) { window.scrollTo(0, 0); }
    }
    /* park focus on the new view so keyboard and screen-reader users
       carry on from the right place instead of the top of the document */
    if (opts.focus) target.focus({ preventScroll: true });
    return true;
  }

  /* any in-page link that points at a view switches to it */
  $$('a[href^="#"]').forEach(link => {
    const id = link.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target || !isView(target)) return;      /* leaves the skip link alone */

    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.innerWidth <= 900) closeNav();
      showView(id, { focus: true });
      if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    });
  });

  /* back and forward move between views */
  window.addEventListener("popstate", () => {
    showView((location.hash || "#home").slice(1) || "home", { focus: false });
  });

  /* opening a #hash link from outside lands on that view */
  if (!showView((location.hash || "#home").slice(1) || "home", { focus: false })) {
    showView("home", { focus: false });
  }

  /* -----------------------------------------------------------------
     5. REVEAL ON SCROLL
     ----------------------------------------------------------------- */
  const reveals = $$(".reveal");

  if ("IntersectionObserver" in window && reveals.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => entry.target.classList.add("is-visible"), i * 90);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  /* -----------------------------------------------------------------
     6. MOTION PREFERENCE
     Read once here; the reading-options panel below uses it too.
     ----------------------------------------------------------------- */
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -----------------------------------------------------------------
     7. BACKGROUND FIELD
     A WebGL shader behind the page: a faint square grid plus thin
     contour lines drawn from 2D simplex noise, drifting slowly. Ported
     from the TopoField effect, which shipped as a React component
     wrapping a sandboxed iframe; the iframe only existed to isolate a
     demo page, so none of it is needed here. What matters is the
     fragment shader, which is framework-agnostic.

     It draws straight alpha onto a transparent canvas rather than
     baking in a paper colour, so the page's own background shows
     through and light and dark need no separate build.
     ----------------------------------------------------------------- */
  const fieldCanvas = $("#bgField");

  if (fieldCanvas) {
    const VERT = [
      "attribute vec2 a_position;",
      "void main() { gl_Position = vec4(a_position, 0.0, 1.0); }"
    ].join("\n");

    const FRAG = [
      "precision highp float;",
      "uniform vec2  u_resolution;",
      "uniform float u_time;",
      "uniform float u_dpr;",
      "uniform vec3  u_ink;",
      "uniform float u_grid;",
      "uniform float u_topo;",

      "vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }",
      "float snoise(vec2 v) {",
      "  const vec4 C = vec4(0.211324865405187, 0.366025403784439,",
      "                     -0.577350269189626, 0.024390243902439);",
      "  vec2 i  = floor(v + dot(v, C.yy));",
      "  vec2 x0 = v - i + dot(i, C.xx);",
      "  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
      "  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;",
      "  i = mod(i, 289.0);",
      "  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));",
      "  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);",
      "  m = m * m; m = m * m;",
      "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
      "  vec3 h = abs(x) - 0.5;",
      "  vec3 ox = floor(x + 0.5);",
      "  vec3 a0 = x - ox;",
      "  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);",
      "  vec3 g;",
      "  g.x  = a0.x * x0.x + h.x * x0.y;",
      "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
      "  return 130.0 * dot(m, g);",
      "}",

      "void main() {",
      "  vec2 st = gl_FragCoord.xy / u_resolution.xy;",
      "  st.x *= u_resolution.x / u_resolution.y;",

      /* a one-device-pixel grid, so the rule stays hairline at any density */
      "  float gridSize = 48.0 * u_dpr;",
      "  vec2  gridFract = fract(gl_FragCoord.xy / gridSize);",
      "  float thickness = 1.0 / gridSize;",
      "  float gridLines = step(1.0 - thickness, gridFract.x) + step(1.0 - thickness, gridFract.y);",
      "  gridLines = clamp(gridLines, 0.0, 1.0) * u_grid;",

      /* contours: slice the noise into bands and keep only the band edges */
      "  vec2  noisePos = st * 1.4 + vec2(u_time * 0.015, u_time * 0.025);",
      "  float n = snoise(noisePos) * 0.5 + 0.5;",
      "  float wave = abs(fract(n * 10.0) - 0.5) * 2.0;",
      "  float topoLines = smoothstep(0.025, 0.0, wave) * u_topo;",

      "  float lines = clamp(gridLines + topoLines, 0.0, 1.0);",
      "  gl_FragColor = vec4(u_ink, lines);",
      "}"
    ].join("\n");

    /* premultipliedAlpha off so the shader can output straight alpha */
    const gl = fieldCanvas.getContext("webgl", {
      alpha: true, antialias: false, depth: false,
      premultipliedAlpha: false, powerPreference: "low-power"
    }) || fieldCanvas.getContext("experimental-webgl");

    if (gl) {
      function compile(type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
      }

      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      const program = vs && fs ? gl.createProgram() : null;

      if (program) {
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
      }

      /* a shader that will not build is not worth a broken page: leave the
         canvas blank and let the rest of the site carry on */
      if (program && gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const uRes  = gl.getUniformLocation(program, "u_resolution");
        const uTime = gl.getUniformLocation(program, "u_time");
        const uDpr  = gl.getUniformLocation(program, "u_dpr");
        const uInk  = gl.getUniformLocation(program, "u_ink");
        const uGrid = gl.getUniformLocation(program, "u_grid");
        const uTopo = gl.getUniformLocation(program, "u_topo");

        let frame = 0, running = false, startedAt = 0;

        function fieldMotionOff() {
          return reducedMotionQuery.matches ||
                 root.getAttribute("data-motion") === "reduced";
        }

        function sizeField() {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = window.innerWidth, h = window.innerHeight;
          fieldCanvas.width = Math.round(w * dpr);
          fieldCanvas.height = Math.round(h * dpr);
          gl.viewport(0, 0, fieldCanvas.width, fieldCanvas.height);
          gl.uniform2f(uRes, fieldCanvas.width, fieldCanvas.height);
          gl.uniform1f(uDpr, dpr);
        }

        function paint(now) {
          const dark = root.getAttribute("data-theme") === "dark";
          /* navy on a light page, white on a dark one */
          if (dark) gl.uniform3f(uInk, 1.0, 1.0, 1.0);
          else      gl.uniform3f(uInk, 0.086, 0.129, 0.243);
          gl.uniform1f(uGrid, dark ? 0.09 : 0.07);
          gl.uniform1f(uTopo, dark ? 0.30 : 0.26);
          gl.uniform1f(uTime, (now - startedAt) * 0.001);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          frame = requestAnimationFrame(paint);
        }

        function startField() {
          if (running || fieldMotionOff()) return;
          running = true;
          startedAt = performance.now();
          sizeField();
          frame = requestAnimationFrame(paint);
        }

        function stopField() {
          if (!running) return;
          running = false;
          cancelAnimationFrame(frame);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }

        let fieldResize = 0;
        window.addEventListener("resize", () => {
          if (!running) return;
          window.clearTimeout(fieldResize);
          fieldResize = window.setTimeout(sizeField, 180);
        });

        document.addEventListener("visibilitychange", () => {
          document.hidden ? stopField() : startField();
        });

        /* the reading-options switch can turn motion off mid-run */
        new MutationObserver(() => { fieldMotionOff() ? stopField() : startField(); })
          .observe(root, { attributes: true, attributeFilter: ["data-motion"] });
        reducedMotionQuery.addEventListener("change", () => {
          fieldMotionOff() ? stopField() : startField();
        });

        startField();
      }
    }
  }

  /* -----------------------------------------------------------------
     8. MARQUEE PAUSE CONTROL
     ----------------------------------------------------------------- */
  const marquee      = $("#marquee");
  const marqueePause = $("#marqueePause");

  if (marquee && marqueePause) {
    marqueePause.addEventListener("click", () => {
      const paused = marquee.classList.toggle("is-paused");
      marqueePause.setAttribute("aria-pressed", String(paused));
      marqueePause.setAttribute("aria-label", paused
        ? "Resume the scrolling tools list"
        : "Pause the scrolling tools list");
      marqueePause.innerHTML = paused
        ? '<i class="ph-bold ph-play" aria-hidden="true"></i><span>Play</span>'
        : '<i class="ph-bold ph-pause" aria-hidden="true"></i><span>Pause</span>';
    });
  }

  /* -----------------------------------------------------------------
     8b. CLICK-TO-PLAY VIDEO
     The poster image stands in for the YouTube player, so none of
     YouTube's scripts load unless a visitor actually asks to watch.
     ----------------------------------------------------------------- */
  $$(".video-play").forEach(button => {
    button.addEventListener("click", () => {
      const holder = button.parentElement;
      const id = button.dataset.video;
      if (!id) return;

      const frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
                  "?autoplay=1&rel=0";
      frame.title = button.dataset.title || "Video";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; " +
                    "gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

      holder.innerHTML = "";
      holder.appendChild(frame);
      frame.focus();
    });
  });

  /* -----------------------------------------------------------------
     8c. PROJECT DIALOGS
     Each card opens a native <dialog>, which brings focus trapping,
     Escape to close and a backdrop without any of it being hand-rolled.
     ----------------------------------------------------------------- */
  $$(".pcard[data-modal]").forEach(card => {
    const dialog = document.getElementById(card.dataset.modal);
    if (!dialog) return;

    card.addEventListener("click", () => {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");   /* very old browsers */
    });
  });

  $$(".pmodal").forEach(dialog => {
    const close = () => {
      /* stop a playing video when the dialog is dismissed */
      const frame = dialog.querySelector("iframe");
      if (frame) frame.remove();
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    };

    dialog.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", close));

    /* clicking the backdrop closes it; clicks inside the panel do not */
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) close();
    });

    /* Escape fires the native cancel event, so tidy up the video there too */
    dialog.addEventListener("close", () => {
      const frame = dialog.querySelector("iframe");
      if (frame) frame.remove();
    });
  });

  /* -----------------------------------------------------------------
     9. ACCESSIBILITY PANEL (text size / contrast / motion / underlines)
     ----------------------------------------------------------------- */
  const fab       = $("#a11yFab");
  const panel     = $("#a11yPanel");
  const closeBtn  = $("#a11yClose");
  const sizeBtns  = $$(".a11y-size");
  const contrastToggle  = $("#contrastToggle");
  const motionToggle    = $("#motionToggle");
  const underlineToggle = $("#underlineToggle");
  const resetBtn  = $("#a11yReset");

  /* Three fixed steps rather than a running percentage: fewer decisions for
     the visitor, and every step is a size the layout has been checked at. */
  const SCALES = ["1", "1.25", "1.5"];

  function applyScale(value) {
    const scale = SCALES.indexOf(String(value)) > -1 ? String(value) : "1";
    root.style.setProperty("--fs-scale", scale);
    sizeBtns.forEach(btn => {
      const on = btn.dataset.scale === scale;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    store.set("fontScale", scale);
  }
  applyScale(store.get("fontScale") || "1");

  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => applyScale(btn.dataset.scale));
  });

  /* each switch flips one attribute on <html> that the stylesheet keys off */
  function makeSwitch(button, attr, onValue, storeKey) {
    function apply(on) {
      if (on) root.setAttribute(attr, onValue);
      else root.removeAttribute(attr);
      if (button) button.setAttribute("aria-checked", String(on));
      store.set(storeKey, on ? onValue : "off");
    }
    if (button) {
      button.addEventListener("click", () => {
        apply(button.getAttribute("aria-checked") !== "true");
      });
    }
    return apply;
  }

  const applyContrast  = makeSwitch(contrastToggle,  "data-contrast",  "high",    "contrast");
  const applyMotion    = makeSwitch(motionToggle,    "data-motion",    "reduced", "motion");
  const applyUnderline = makeSwitch(underlineToggle, "data-underline", "on",      "underline");

  applyContrast(store.get("contrast") === "high");
  applyMotion(store.get("motion") === "reduced" || reducedMotionQuery.matches);
  applyUnderline(store.get("underline") === "on");

  function openPanel() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    const focusable = panel.querySelector("button:not([disabled])");
    if (focusable) focusable.focus();
  }
  function closePanel(returnFocus) {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    if (returnFocus) fab.focus();
  }

  if (fab) {
    fab.addEventListener("click", () => {
      panel.hidden ? openPanel() : closePanel(false);
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", () => closePanel(true));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel && !panel.hidden) closePanel(true);
  });

  document.addEventListener("click", (e) => {
    if (!panel || panel.hidden) return;
    if (!panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
      closePanel(false);
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      store.remove("fontScale");
      store.remove("contrast");
      store.remove("motion");
      store.remove("underline");
      applyScale("1");
      applyContrast(false);
      applyMotion(reducedMotionQuery.matches);
      applyUnderline(false);
    });
  }

  /* -----------------------------------------------------------------
     10. CURSOR RING
     An open ring that runs after the pointer on a rAF loop. The system
     cursor is left visible and marks the exact point, which is what
     frees this one to lag: it is decoration and a hover cue, not a
     position indicator, so it never has to keep up.

     It runs only where there is a real pointer to follow and only
     while motion is allowed, and it parks itself the moment the tab is
     hidden or the pointer leaves the window.
     ----------------------------------------------------------------- */
  const cursor = $("#cursorRing");

  if (cursor) {
    const ring = $(".cursor__ring", cursor);
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    /* what should make the ring open up: anything a visitor can act on */
    const INTERACTIVE = "a, button, input, textarea, select, summary, " +
                        "[role='button'], [tabindex]:not([tabindex='-1'])";

    let targetX = 0, targetY = 0;   /* where the pointer is */
    let ringX   = 0, ringY   = 0;   /* where the ring has caught up to */
    let frame = 0, running = false, seen = false;

    function cursorOff() {
      return !finePointer.matches ||
             reducedMotionQuery.matches ||
             root.getAttribute("data-motion") === "reduced";
    }

    /* The trail. The ring closes this fraction of the remaining distance each
       frame, so it starts fast and settles slowly - which is what makes it
       read as something running after the pointer rather than pinned to it.
       At 0.055 it takes a little under a second to settle after a long flick.
       Anything above ~0.1 tracks too closely to notice; much below this and
       the ring stops feeling connected to the pointer at all. */
    const EASE = 0.055;

    function follow() {
      ringX += (targetX - ringX) * EASE;
      ringY += (targetY - ringY) * EASE;
      ring.style.setProperty("--x", ringX + "px");
      ring.style.setProperty("--y", ringY + "px");
      frame = requestAnimationFrame(follow);
    }

    function startCursor() {
      if (running || cursorOff()) return;
      running = true;
      frame = requestAnimationFrame(follow);
    }

    function stopCursor() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
      cursor.classList.remove("is-awake", "is-over-link", "is-down");
      seen = false;
    }

    document.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || cursorOff()) return;

      targetX = e.clientX;
      targetY = e.clientY;

      /* First move: drop the ring straight onto the pointer rather than
         letting it fly in from the corner, then fade the whole thing up.
         The position has to be written here and not left to the loop: until
         the first frame runs the ring has no coordinates at all, and would
         paint once at the top-left corner. */
      if (!seen) {
        seen = true;
        ringX = targetX;
        ringY = targetY;
        ring.style.setProperty("--x", ringX + "px");
        ring.style.setProperty("--y", ringY + "px");
        cursor.classList.add("is-awake");
        startCursor();
      }

      cursor.classList.toggle("is-over-link", !!e.target.closest(INTERACTIVE));
    }, { passive: true });

    document.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") cursor.classList.add("is-down");
    }, { passive: true });
    document.addEventListener("pointerup", () => {
      cursor.classList.remove("is-down");
    }, { passive: true });

    /* off the edge of the window there is no pointer to follow */
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-awake"));
    document.addEventListener("mouseenter", () => {
      if (seen && !cursorOff()) cursor.classList.add("is-awake");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopCursor();
    });

    /* the reading options can turn motion off after the loop has started */
    new MutationObserver(() => { if (cursorOff()) stopCursor(); })
      .observe(root, { attributes: true, attributeFilter: ["data-motion"] });
    reducedMotionQuery.addEventListener("change", () => {
      if (cursorOff()) stopCursor();
    });
  }

  /* -----------------------------------------------------------------
     11. CONTACT FORM
     Client-side only: validates, then hands the message to the
     visitor's own email app. No third-party form service involved.
     ----------------------------------------------------------------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  const RECIPIENT = "armenionarbien53@gmail.com";

  function setError(input, errorEl, show) {
    input.setAttribute("aria-invalid", String(show));
    errorEl.hidden = !show;
  }

  if (form) {
    const firstInput = $("#cFirst");
    const lastInput  = $("#cLast");
    const emailInput = $("#cEmail");
    const msgInput   = $("#cMessage");
    const firstErr = $("#cFirstErr");
    const emailErr = $("#cEmailErr");
    const msgErr   = $("#cMessageErr");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstBad = firstInput.value.trim() === "";
      const emailBad = !emailPattern.test(emailInput.value.trim());
      const msgBad   = msgInput.value.trim().length < 5;

      setError(firstInput, firstErr, firstBad);
      setError(emailInput, emailErr, emailBad);
      setError(msgInput, msgErr, msgBad);

      if (firstBad || emailBad || msgBad) {
        note.classList.remove("is-ok");
        note.textContent = "Please fix the highlighted fields above.";
        const firstFaulty = form.querySelector('[aria-invalid="true"]');
        if (firstFaulty) firstFaulty.focus();
        return;
      }

      /* last name is optional, so build the display name from what we have */
      const fullName = [firstInput.value.trim(), lastInput.value.trim()]
        .filter(Boolean).join(" ");

      const subject = "Portfolio enquiry from " + fullName;
      const body =
        "Name: " + fullName + "\n" +
        "Email: " + emailInput.value.trim() + "\n\n" +
        msgInput.value.trim();

      window.location.href =
        "mailto:" + RECIPIENT +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      note.classList.add("is-ok");
      note.textContent = "Your email app is opening with the message ready to send.";
    });

    /* clear an error the moment the visitor fixes it */
    [[firstInput, firstErr], [emailInput, emailErr], [msgInput, msgErr]].forEach(([input, err]) => {
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") setError(input, err, false);
      });
    });
  }
})();
