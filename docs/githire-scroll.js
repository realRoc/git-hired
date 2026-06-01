// GitHire v5 · entry. Wires navigation, DOM reveals, and the Three.js stage.

import { Stage } from './three/stage.js';
import { IntroScene } from './three/scenes/intro.js';

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

// ── Navigation contrast on dark sections ──────────────────────
(() => {
  const nav = document.querySelector('.topnav');
  const darkSection = document.querySelector('.scene-closer.is-dark');
  if (!nav || !darkSection) return;

  let raf = 0;
  const update = () => {
    raf = 0;
    const probeY = nav.getBoundingClientRect().top + nav.offsetHeight * 0.5;
    const rect = darkSection.getBoundingClientRect();
    nav.classList.toggle('nav-on-dark', rect.top <= probeY && rect.bottom >= probeY);
  };
  const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
})();

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

// Hand the reveal system control of the hidden initial states — but only now,
// once this script is actually executing. If the module never runs (no ES-module
// support, a network/404 on the script, or a failed `three` import that aborts
// the module before this line), `.js` is never added and the `html:not(.js)`
// failsafe in githire.css keeps every revealed section visible. Stage init above
// is wrapped in try/catch, so a WebGL failure still reaches this point.
document.documentElement.classList.add('js');

// ── Closer dark · reveal on enter ─────────────────────────────
(() => {
  const closer = document.querySelector('.scene-closer');
  if (!closer) return;
  if (reduced || !('IntersectionObserver' in window)) { closer.classList.add('is-revealed'); return; }
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
  if (reduced || !('IntersectionObserver' in window)) { ov.classList.add('is-revealed'); return; }
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
  const closer = document.querySelector('.scene-closer');
  if (!hero) return;
  const root = document.documentElement;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / Math.max(0.001, edge1 - edge0));
    return t * t * (3 - 2 * t);
  };
  let raf = 0;
  const update = () => {
    raf = 0;
    const h = hero.offsetHeight || window.innerHeight;
    const t = clamp(window.scrollY / (h * 0.85));
    const stageFade = smoothstep(0.48, 0.96, t);
    hero.style.setProperty('--hero-exit', t.toFixed(3));
    root.style.setProperty('--stage-opacity', (1 - stageFade).toFixed(3));
    root.style.setProperty('--hero-wash', (0.2 + stageFade * 0.8).toFixed(3));
    root.style.setProperty('--definition-opacity', (0.72 + stageFade * 0.28).toFixed(3));
    root.style.setProperty('--definition-y', `${((1 - stageFade) * 18).toFixed(2)}px`);
    if (closer) {
      const r = closer.getBoundingClientRect();
      const closerT = smoothstep(0, window.innerHeight * 0.82, window.innerHeight - r.top);
      root.style.setProperty('--closer-overlay', (0.25 + closerT * 0.75).toFixed(3));
      root.style.setProperty('--closer-beam-opacity', (0.42 + closerT * 0.58).toFixed(3));
      root.style.setProperty('--closer-beam-y', `${((1 - closerT) * -28).toFixed(2)}px`);
    }
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
  if (reduced || !('IntersectionObserver' in window)) {
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
  if (reduced || !('IntersectionObserver' in window)) {
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

// ── Bottom scroll · Blog handoff ──────────────────────────────
(() => {
  const targetUrl = 'https://realroc.github.io/git-hired/blog.html';
  const bottomTolerance = 4;
  const idleDelay = 840;
  const scroller = document.scrollingElement || document.documentElement;
  const prompt = document.getElementById('blogJumpPrompt');
  if (!prompt) return;

  const promptText = prompt.querySelector('strong');
  const defaultText = promptText ? promptText.textContent : '';
  let progress = 0;
  let decayTimer = 0;
  let lastTouchY = null;
  let isRedirecting = false;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const maxScroll = () => Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const distanceFromBottom = () => Math.max(0, maxScroll() - scroller.scrollTop);
  const isAtPageEnd = () => distanceFromBottom() <= bottomTolerance;

  const refreshState = () => {
    const atEnd = isAtPageEnd();
    prompt.classList.toggle('is-ready', atEnd && !isRedirecting);
    prompt.classList.toggle('is-primed', progress > 0);
    if (promptText && !isRedirecting) {
      promptText.textContent = progress > 0 ? '继续向下滑动，前往 Blog' : defaultText;
    }
  };

  const setProgress = (value) => {
    progress = clamp(value);
    prompt.style.setProperty('--blog-jump-progress', progress.toFixed(3));
    refreshState();
  };

  const resetProgress = () => {
    clearTimeout(decayTimer);
    setProgress(0);
  };

  const startDecay = () => {
    clearTimeout(decayTimer);
    decayTimer = setTimeout(() => {
      setProgress(progress - 0.18);
      if (progress > 0) startDecay();
    }, idleDelay);
  };

  const goToBlog = () => {
    if (isRedirecting) return;
    isRedirecting = true;
    prompt.classList.add('is-complete');
    if (promptText) promptText.textContent = '正在前往 Blog…';
    setProgress(1);
    window.setTimeout(() => {
      window.location.href = targetUrl;
    }, 180);
  };

  const progressFromWheel = (amount) => {
    if (amount >= 80) return 0.5;
    return Math.min(amount / 520, 0.32);
  };

  const addMomentum = (amount) => {
    if (isRedirecting) return;
    if (!isAtPageEnd()) {
      if (progress > 0) resetProgress();
      else refreshState();
      return;
    }

    if (amount <= 0) {
      if (progress > 0) {
        setProgress(progress - 0.14);
        startDecay();
      } else {
        refreshState();
      }
      return;
    }

    clearTimeout(decayTimer);
    setProgress(progress + progressFromWheel(amount));
    if (progress >= 1) goToBlog();
    else startDecay();
  };

  window.addEventListener('wheel', (event) => {
    addMomentum(event.deltaY);
  }, { passive: true });

  window.addEventListener('touchstart', (event) => {
    lastTouchY = event.touches[0] ? event.touches[0].clientY : null;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (lastTouchY === null || !event.touches[0]) return;
    const touchY = event.touches[0].clientY;
    const deltaY = lastTouchY - touchY;
    lastTouchY = touchY;
    addMomentum(deltaY * 1.7);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    lastTouchY = null;
    if (progress > 0 && !isRedirecting) startDecay();
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!['ArrowDown', 'PageDown', ' '].includes(event.key)) return;
    addMomentum(event.key === 'ArrowDown' ? 90 : 120);
  });

  window.addEventListener('scroll', () => {
    if (!isAtPageEnd() && progress > 0) resetProgress();
    else refreshState();
  }, { passive: true });

  window.addEventListener('resize', refreshState);
  setProgress(0);
})();
