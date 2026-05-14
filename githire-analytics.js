// GitHire · scrollytelling analytics.
//
// Standalone PostHog instrumentation for the v5 scrollytelling page.
// Designed to stay out of githire-scroll.js so visual code and tracking
// code can evolve independently. Reads DOM state (data-scene, prompt
// classes) rather than hooking into scroll.js internals.
//
// Event vocabulary (kept intentionally small):
//   - scene_view              first time a scene becomes ≥50% visible
//   - scene_dwell             when that scene drops below 20% (or unload)
//   - scroll_max              max scroll % reached, flushed once on unload
//   - blog_prompt_shown       bottom-of-page Blog handoff prompt becomes ready
//   - blog_prompt_primed      user has built up handoff momentum (progress > 0)
//   - blog_handoff_complete   handoff finished, navigating to Blog
//   - nav_menu_open           top-right Menu opened
//   - nav_anchor_click        in-page anchor (#scene) clicked from Menu
//   - nav_link_click          cross-page link (e.g. blog.html) clicked from Menu
//   - external_link_click     click on an off-site link (host !== location.host)
//
// Super properties registered once per session:
//   reduced_motion, has_webgl, viewport_w, viewport_h, page_variant
//
// Scene detection uses a bounding-rect ratio normalized by
// min(viewportHeight, sectionHeight) rather than IntersectionObserver's
// intersectionRatio. This is critical for tall sections like wf-stage,
// whose intersectionRatio caps far below the threshold and would never
// register a scene_view under the naive observer approach.
//
// Failure mode: if PostHog never loads (blocker, offline, missing key) every
// capture is a silent no-op. Page UX is never affected.

(() => {
  const SCENE_VIEW_RATIO = 0.5;    // enter (visible / min(viewportH, sectionH))
  const SCENE_LEAVE_RATIO = 0.2;   // leave — hysteresis to avoid flicker
  const MIN_DWELL_MS = 600;        // filter "scrolled past" noise
  const PAGE_VARIANT = 'githire-v5';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── PostHog ready gate ──────────────────────────────────────
  // The snippet stubs window.posthog before the real lib loads, so we just
  // need to guard against the case where it was never installed at all.
  const ph = () => (typeof window !== 'undefined' ? window.posthog : null);
  const capture = (name, props) => {
    const p = ph();
    if (!p || typeof p.capture !== 'function') return;
    try { p.capture(name, props || {}); } catch (_) { /* swallow */ }
  };
  const register = (props) => {
    const p = ph();
    if (!p || typeof p.register !== 'function') return;
    try { p.register(props); } catch (_) { /* swallow */ }
  };

  // ── Super properties ────────────────────────────────────────
  register({
    reduced_motion: reduced,
    has_webgl: !document.body.classList.contains('no-webgl'),
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    page_variant: PAGE_VARIANT,
  });

  // ── Scene visibility + dwell ────────────────────────────────
  const sections = Array.from(document.querySelectorAll('[data-scene]'));
  const order = new Map(sections.map((el, i) => [el.dataset.scene, i + 1]));
  const enterAt = new Map();       // scene -> performance.now() (active dwell timer)
  const visibleScenes = new Set(); // scenes currently meeting the view ratio
  const viewed = new Set();        // scene_view fires only once per scene

  const flushDwell = (scene, opts) => {
    const { unloaded = false, suspended = false } = opts || {};
    const t0 = enterAt.get(scene);
    if (t0 == null) return;
    enterAt.delete(scene);
    const dwell_ms = Math.round(performance.now() - t0);
    if (!unloaded && !suspended && dwell_ms < MIN_DWELL_MS) return;
    const el = document.querySelector(`[data-scene="${scene}"]`);
    capture('scene_dwell', {
      scene,
      label: el && el.dataset.screenLabel,
      dwell_ms,
      unloaded,
      suspended,
    });
  };

  // Compute "how much of this section is on screen, relative to whichever is
  // smaller — the viewport or the section itself". This caps at 1.0 for both
  // tall sections (workflow) and short ones (definition), giving a single
  // threshold semantic across the whole page.
  const visibilityRatio = (rect, vh) => {
    const visible = Math.max(0, Math.min(vh, rect.bottom) - Math.max(0, rect.top));
    const denom = Math.min(vh, rect.height) || vh;
    return denom > 0 ? visible / denom : 0;
  };

  let scrollRaf = 0;
  const recomputeScenes = () => {
    scrollRaf = 0;
    const vh = window.innerHeight;
    const now = performance.now();
    sections.forEach((el) => {
      const scene = el.dataset.scene;
      const ratio = visibilityRatio(el.getBoundingClientRect(), vh);

      if (ratio >= SCENE_VIEW_RATIO) {
        if (!visibleScenes.has(scene)) {
          visibleScenes.add(scene);
          enterAt.set(scene, now);
          if (!viewed.has(scene)) {
            viewed.add(scene);
            capture('scene_view', {
              scene,
              label: el.dataset.screenLabel,
              order: order.get(scene),
              scroll_y: window.scrollY,
            });
          }
        }
      } else if (ratio < SCENE_LEAVE_RATIO) {
        if (visibleScenes.has(scene)) {
          visibleScenes.delete(scene);
          flushDwell(scene);
        }
      }
    });
  };
  const scheduleRecompute = () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(recomputeScenes);
  };
  window.addEventListener('scroll', scheduleRecompute, { passive: true });
  window.addEventListener('resize', scheduleRecompute, { passive: true });
  recomputeScenes();

  // ── Scroll depth (single summary event) ─────────────────────
  let maxPct = 0;
  const trackScrollMax = () => {
    const h = (document.documentElement.scrollHeight || 0) - window.innerHeight;
    if (h <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY / h) * 100));
    if (pct > maxPct) maxPct = pct;
  };
  window.addEventListener('scroll', trackScrollMax, { passive: true });
  trackScrollMax();

  // ── Blog handoff funnel (DOM-driven, no scroll.js coupling) ──
  const prompt = document.getElementById('blogJumpPrompt');
  let primedAt = 0;
  let primedFired = false;
  let shownFired = false;
  let completeFired = false;

  if (prompt) {
    const onClassChange = () => {
      const cls = prompt.classList;
      if (cls.contains('is-ready') && !shownFired) {
        shownFired = true;
        capture('blog_prompt_shown', {
          scroll_y: window.scrollY,
        });
      }
      if (cls.contains('is-primed') && !primedFired) {
        primedFired = true;
        primedAt = performance.now();
        capture('blog_prompt_primed');
      }
      if (cls.contains('is-complete') && !completeFired) {
        completeFired = true;
        capture('blog_handoff_complete', {
          time_to_complete_ms: primedAt ? Math.round(performance.now() - primedAt) : null,
        });
      }
    };
    const mo = new MutationObserver(onClassChange);
    mo.observe(prompt, { attributes: true, attributeFilter: ['class'] });
    onClassChange(); // initial state
  }

  // ── Nav menu + anchor + external link interactions ──────────
  const navBtn = document.getElementById('navMenuBtn');
  if (navBtn) {
    navBtn.addEventListener('click', () => {
      // The toggle runs in scroll.js; read the resulting aria-expanded one
      // tick later so we capture the new state, not the previous one.
      requestAnimationFrame(() => {
        if (navBtn.getAttribute('aria-expanded') === 'true') {
          capture('nav_menu_open');
        }
      });
    });
  }

  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const label = (link.textContent || '').trim();
      if (href.startsWith('#')) {
        // In-page scrollytelling jump: track the target scene.
        capture('nav_anchor_click', {
          href,
          target_scene: href.slice(1),
          label,
        });
      } else if (href) {
        // Cross-page link (blog.html, skill.html, etc.) — kept separate so
        // funnel queries on nav_anchor_click stay clean.
        capture('nav_link_click', {
          href,
          label,
        });
      }
    });
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    if (navMenu && navMenu.contains(link)) return; // already covered above
    let url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
      capture('external_link_click', { href: link.href, kind: url.protocol.replace(':', '') });
      return;
    }
    if (url.host && url.host !== window.location.host) {
      capture('external_link_click', { href: link.href, kind: 'http', host: url.host });
    }
  }, { capture: true });

  // ── Unload / suspend flush ──────────────────────────────────
  // Two distinct paths:
  //   1) Tab is *backgrounded* (visibilitychange → hidden): pause dwell timers
  //      so we don't bill background time as engagement. When the tab comes
  //      back, re-arm timers for whichever scenes are still in view.
  //   2) Page is *unloaded* (pagehide, incl. bfcache): final flush — dwells
  //      with unloaded:true, and scroll_max once. The scrollMaxFlushed guard
  //      ensures a user who backgrounds the tab and then returns and later
  //      leaves produces exactly one scroll_max event per visit.
  let scrollMaxFlushed = false;
  const flushScrollMax = () => {
    if (scrollMaxFlushed) return;
    scrollMaxFlushed = true;
    capture('scroll_max', { max_pct: maxPct });
  };
  const flushAllDwells = (opts) => {
    Array.from(enterAt.keys()).forEach((scene) => flushDwell(scene, opts));
  };

  window.addEventListener('pagehide', () => {
    flushAllDwells({ unloaded: true });
    flushScrollMax();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAllDwells({ suspended: true });
    } else if (document.visibilityState === 'visible') {
      const now = performance.now();
      visibleScenes.forEach((scene) => {
        if (!enterAt.has(scene)) enterAt.set(scene, now);
      });
    }
  });
})();
