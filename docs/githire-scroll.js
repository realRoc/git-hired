/* ============================================================
   GitHire — scrollytelling controller
   Vanilla JS. Drives:
     - scroll progress bar
     - hero parallax / fade
     - pinned Journey stage (6 modules cross-fade)
     - pinned Workflow stage (6 steps light up sequentially)
     - reveal-on-enter
     - nav highlight
   ============================================================ */
(() => {
  const $  = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ─── scroll progress bar ───────────────────────────
  const bar = $('#progress');
  function updateProgress(){
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    const p = total > 0 ? (h.scrollTop / total) * 100 : 0;
    bar.style.width = p + '%';
  }

  // ─── hero scroll motion ────────────────────────────
  const hero = $('.hero');
  const heroLines = $$('.hero h1.display .l');
  function updateHero(){
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 at start, 1 when hero fully scrolled past
    const t = clamp(-r.top / Math.max(1, r.height), 0, 1);
    hero.style.setProperty('--hero-t', t.toFixed(3));
    heroLines.forEach((el, i) => {
      el.style.transform = `translate3d(0, ${t * (-30 - i*8)}px, 0)`;
      el.style.opacity = (1 - t * 0.85).toFixed(3);
    });
    const grid = $('.hero-grid');
    if (grid) grid.style.opacity = (1 - t).toFixed(3);
    const orn = $('.hero-ornament');
    if (orn) orn.style.transform = `translateY(calc(-50% + ${t * 60}px)) scale(${1 - t * 0.06})`;
  }

  // ─── pinned stage helper ───────────────────────────
  // returns 0..1 progress through the pinned scroll region
  function pinProgress(section){
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = section.offsetHeight - vh; // sticky duration
    if (total <= 0) return 0;
    return clamp(-r.top / total, 0, 1);
  }

  // ─── JOURNEY ──────────────────────────────────────
  const journey = $('.journey-stage');
  const jSlides = journey ? $$('.j-slide', journey) : [];
  const jScenes = journey ? $$('.j-scene', journey) : [];
  const jRailSegs = journey ? $$('.j-rail .seg', journey) : [];
  const jStripBars = journey ? $$('.j-strip .b', journey) : [];
  const jBig = journey ? $('.j-counter .big', journey) : null;
  const jTotal = journey ? $('.j-counter .total', journey) : null;
  const jPath = journey ? $('.j-canvas-bar .path', journey) : null;
  const jMeta = journey ? $('.j-canvas-bar .meta', journey) : null;
  const jSteps = jSlides.length;

  function updateJourney(){
    if (!journey || jSteps === 0) return;
    if (window.innerWidth <= 760){
      // mobile: everything visible
      jSlides.forEach(s => s.classList.add('is-active'));
      jScenes.forEach(s => s.classList.add('is-active'));
      return;
    }
    const t = pinProgress(journey);
    // map 0..1 to phase index. We use jSteps phases each occupying 1/jSteps of progress.
    // But we want first phase fully visible at t=0 and last at t=1, so:
    const phaseSpan = 1 / jSteps;
    let idx = Math.floor(t / phaseSpan);
    if (idx >= jSteps) idx = jSteps - 1;
    // soft snapping happens naturally via CSS transitions

    jSlides.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-prev', i < idx);
    });
    jScenes.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    jRailSegs.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-done', i < idx);
    });
    jStripBars.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-done', i < idx);
    });
    if (jBig) jBig.textContent = String(idx + 1).padStart(2, '0');
    if (jTotal) jTotal.textContent = `／ ${String(jSteps).padStart(2, '0')}`;
    const slide = jSlides[idx];
    if (slide && jPath) jPath.textContent = slide.dataset.path || '~/githire/onboarding';
    if (slide && jMeta) jMeta.textContent = slide.dataset.meta || '';
  }

  // ─── WORKFLOW ─────────────────────────────────────
  const workflow = $('.workflow-stage');
  const wfNodes = workflow ? $$('.wf-node', workflow) : [];
  const wfPanels = workflow ? $$('.wf-info .panel', workflow) : [];
  const wfScenes = workflow ? $$('.wf-card-scene', workflow) : [];
  const wfFill = workflow ? $('.wf-line .fill', workflow) : null;
  const wfBarName = workflow ? $('.wf-card-bar .name', workflow) : null;
  const wfBarBadge = workflow ? $('.wf-card-bar .badge', workflow) : null;
  const wfSteps = wfNodes.length;

  function updateWorkflow(){
    if (!workflow || wfSteps === 0) return;
    if (window.innerWidth <= 760){
      wfPanels.forEach(p => p.classList.add('is-active'));
      wfNodes.forEach(n => n.classList.add('is-done'));
      if (wfFill) wfFill.style.width = '100%';
      return;
    }
    const t = pinProgress(workflow);
    const phaseSpan = 1 / wfSteps;
    let idx = Math.floor(t / phaseSpan);
    if (idx >= wfSteps) idx = wfSteps - 1;
    // sub-progress within current phase
    const sub = clamp((t - idx * phaseSpan) / phaseSpan, 0, 1);

    wfNodes.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-done', i < idx);
    });
    wfPanels.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    wfScenes.forEach((el, i) => el.classList.toggle('is-active', i === idx));

    // line fill grows as user scrolls; reaches 100% at the end
    if (wfFill){
      // the line spans nodes 1..N; convert (idx + sub) of N steps -> percent
      const fillPct = clamp((idx + sub) / (wfSteps - 1), 0, 1) * 100;
      wfFill.style.width = fillPct + '%';
    }
    const panel = wfPanels[idx];
    if (panel){
      if (wfBarName) wfBarName.textContent = panel.dataset.file || 'sandbox/';
      if (wfBarBadge) wfBarBadge.textContent = panel.dataset.badge || '';
    }
  }

  // ─── nav highlight ────────────────────────────────
  const navLinks = $$('nav.top .nav-links a');
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function updateNav(){
    if (!sections.length) return;
    const y = window.scrollY + 120;
    let active = -1;
    sections.forEach((s, i) => { if (s.offsetTop <= y) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));
  }

  // ─── reveal on enter ──────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  $$('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  // ─── prompt copy ──────────────────────────────────
  $$('.prompt-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.closest('.prompt-card').querySelector('.prompt-body');
      try { navigator.clipboard.writeText(body.innerText.trim()); } catch(e){}
      const o = btn.textContent;
      btn.textContent = "COPIED ✓";
      setTimeout(() => btn.textContent = o, 1400);
    });
  });

  // ─── master scroll loop (rAF-throttled) ──────────
  let ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateHero();
      updateJourney();
      updateWorkflow();
      updateNav();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
