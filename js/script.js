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

  /* the footer link scrolls the current view rather than leaving it */
  const toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -----------------------------------------------------------------
     6. REVEAL ON SCROLL
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
     7. COUNT-UP STATS
     ----------------------------------------------------------------- */
  const counters = $$(".stat__num");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function countUp(el) {
    const target = Number(el.dataset.count || 0);
    if (reducedMotionQuery.matches || root.getAttribute("data-motion") === "reduced") {
      el.textContent = String(target);
      return;
    }
    const duration = 1300;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    el.textContent = "0";
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && counters.length) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));
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
     10. CONTACT FORM
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
