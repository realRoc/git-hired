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

// ── Bottom scroll · News handoff ──────────────────────────────
(() => {
  const targetUrl = 'https://realroc.github.io/git-hired/news.html';
  const bottomTolerance = 8;
  const requiredMomentum = 960;
  const idleDelay = 760;
  const scroller = document.scrollingElement || document.documentElement;
  const prompt = document.createElement('div');
  prompt.className = 'news-jump-prompt';
  prompt.setAttribute('role', 'status');
  prompt.setAttribute('aria-live', 'polite');
  prompt.setAttribute('aria-hidden', 'true');
  prompt.innerHTML = `
    <div class="news-jump-copy">
      <span class="news-jump-kicker">Next page</span>
      <strong>继续向下滑动，前往 News</strong>
    </div>
    <div class="news-jump-track" aria-hidden="true"><span></span></div>
  `;
  document.body.appendChild(prompt);

  const promptText = prompt.querySelector('strong');
  let progress = 0;
  let hideTimer = 0;
  let decayTimer = 0;
  let lastTouchY = null;
  let isRedirecting = false;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const maxScroll = () => Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const isAtBottom = () => maxScroll() - scroller.scrollTop <= bottomTolerance;

  const showPrompt = () => {
    clearTimeout(hideTimer);
    prompt.classList.add('is-visible');
    prompt.setAttribute('aria-hidden', 'false');
  };

  const hidePrompt = () => {
    prompt.classList.remove('is-visible');
    prompt.setAttribute('aria-hidden', 'true');
  };

  const setProgress = (value) => {
    progress = clamp(value);
    prompt.style.setProperty('--news-jump-progress', progress.toFixed(3));
    prompt.classList.toggle('is-primed', progress > 0);
    if (progress > 0) showPrompt();
  };

  const resetProgress = () => {
    clearTimeout(decayTimer);
    setProgress(0);
    hideTimer = setTimeout(hidePrompt, 260);
  };

  const startDecay = () => {
    clearTimeout(decayTimer);
    decayTimer = setTimeout(() => {
      setProgress(progress - 0.18);
      if (progress > 0) startDecay();
      else hideTimer = setTimeout(hidePrompt, 260);
    }, idleDelay);
  };

  const goToNews = () => {
    if (isRedirecting) return;
    isRedirecting = true;
    prompt.classList.add('is-complete');
    promptText.textContent = '正在前往 News…';
    setProgress(1);
    window.setTimeout(() => {
      window.location.href = targetUrl;
    }, 180);
  };

  const addMomentum = (amount) => {
    if (isRedirecting) return;
    if (!isAtBottom()) {
      if (progress > 0) resetProgress();
      return;
    }

    if (amount <= 0) {
      if (progress > 0) {
        setProgress(progress - 0.16);
        startDecay();
      }
      return;
    }

    clearTimeout(decayTimer);
    const cappedMomentum = Math.min(amount, 220);
    setProgress(progress + cappedMomentum / requiredMomentum);
    if (progress >= 1) goToNews();
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
    addMomentum(deltaY * 2.1);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    lastTouchY = null;
    if (progress > 0 && !isRedirecting) startDecay();
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!['ArrowDown', 'PageDown', ' '].includes(event.key)) return;
    addMomentum(event.key === 'ArrowDown' ? 120 : 240);
  });

  window.addEventListener('scroll', () => {
    if (!isAtBottom() && progress > 0) resetProgress();
  }, { passive: true });
})();
