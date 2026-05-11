// GitHire v5 · entry. Wires Lenis smooth scroll + GSAP ScrollTrigger
// to the Three.js stage. Scenes mount themselves via Stage.register().

import { Stage } from './three/stage.js';
import { IntroScene } from './three/scenes/intro.js';

// ── Smooth scroll (Lenis) ──────────────────────────────────────
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Navigation menu ────────────────────────────────────────────
(() => {
  const btn = document.getElementById('navMenuBtn');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menu.classList.toggle('is-open', open);
  };

  btn.addEventListener('click', () => {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (menu.contains(event.target) || btn.contains(event.target)) return;
    setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
})();

let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
}

// ── GSAP ScrollTrigger ─────────────────────────────────────────
if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
  if (lenis) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }
}
if (lenis && !(window.gsap && window.ScrollTrigger)) {
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ── Three stage ────────────────────────────────────────────────
const canvas = document.getElementById('stage');
let stage = null;

try {
  stage = new Stage(canvas);
} catch (err) {
  console.warn('[v5] WebGL stage failed to init — falling back.', err);
  document.body.classList.add('no-webgl');
}

if (stage) {
  // Register scenes against their DOM sections. Each <section data-scene="...">
  // becomes a tracked activation source. P1 ships intro only; remaining acts
  // render as plain DOM until their scenes are added.
  const sections = document.querySelectorAll('[data-scene]');
  sections.forEach((el) => {
    const name = el.dataset.scene;
    if (name === 'intro') {
      stage.register(name, el, new IntroScene(stage));
    } else {
      // Pure DOM section — still track its bounds so the intro starfield
      // can soften out / etc. Scene is null.
      stage.register(name, el, null);
    }
  });

  stage.start();
}

// ── Closer dark · reveal on enter ─────────────────────────────
(() => {
  const closer = document.querySelector('.scene-closer');
  if (!closer) return;
  if (reduced) { closer.classList.add('is-revealed'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.3) closer.classList.add('is-revealed');
      else if (entry.intersectionRatio < 0.05) closer.classList.remove('is-revealed');
    });
  }, { threshold: [0, 0.05, 0.3] });
  io.observe(closer);
})();
(() => {
  const ov = document.querySelector('.wf-overview');
  if (!ov) return;
  if (reduced) { ov.classList.add('is-revealed'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.3) ov.classList.add('is-revealed');
      else if (entry.intersectionRatio < 0.05) ov.classList.remove('is-revealed');
    });
  }, { threshold: [0, 0.05, 0.3] });
  io.observe(ov);
})();
(() => {
  const hero = document.querySelector('.scene-intro');
  if (!hero) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const h = hero.offsetHeight || window.innerHeight;
    const t = Math.min(1, Math.max(0, window.scrollY / (h * 0.85)));
    hero.style.setProperty('--hero-exit', t.toFixed(3));
    if (stage && stage.scenes) {
      const intro = stage.scenes.find && stage.scenes.find((s) => s.name === 'intro');
      const sceneObj = intro && intro.scene;
      if (sceneObj) sceneObj._heroExit = t;
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
(() => {
  const panels = document.querySelectorAll('.wf-panel');
  if (!panels.length) return;
  if (reduced) {
    panels.forEach((p) => p.classList.add('is-visible'));
    return;
  }
  // Prep stroke draw-on for every outlined SVG shape
  panels.forEach((panel) => {
    panel.querySelectorAll('.wf-fig svg [fill="none"]').forEach((el, i) => {
      if (typeof el.getTotalLength !== 'function') return;
      let len; try { len = el.getTotalLength(); } catch (e) { return; }
      if (!len) return;
      el.dataset.drawLen = len;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.style.transition = `stroke-dashoffset 1400ms cubic-bezier(.2,.7,.2,1) ${200 + i * 140}ms`;
    });
  });
  const setVis = (panel, on) => {
    panel.classList.toggle('is-visible', on);
    panel.querySelectorAll('.wf-fig svg [fill="none"]').forEach((el) => {
      if (!el.dataset.drawLen) return;
      el.style.strokeDashoffset = on ? '0' : el.dataset.drawLen;
    });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.35) setVis(entry.target, true);
      else if (entry.intersectionRatio < 0.05) setVis(entry.target, false);
    });
  }, { threshold: [0, 0.05, 0.35] });
  panels.forEach((p) => io.observe(p));
})();
(() => {
  const cards = document.querySelectorAll('[data-reveal]');
  if (!cards.length) return;
  if (reduced) {
    cards.forEach((c) => c.classList.add('is-revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = [...el.parentElement.querySelectorAll('[data-reveal]')];
      const i = siblings.indexOf(el);
      setTimeout(() => el.classList.add('is-revealed'), i * 180);
      io.unobserve(el);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
  cards.forEach((c) => io.observe(c));
})();
