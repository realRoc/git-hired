# GitHire — Frontend Source

A static scrollytelling site for GitHire, built around an AI-native onboarding and hiring workflow.

## Files

- `index.html` — main page markup, SEO schema, workflow panels, rituals, FAQ, and CTA.
- `news.html` — lightweight News route using the same visual system.
- `githire.css` — design tokens, layout, responsive rules, route styles, and animation states.
- `githire-scroll.js` — navigation menu, Lenis smooth scroll, GSAP ScrollTrigger bridge, DOM reveals, and Three.js stage wiring.
- `three/stage.js` — shared Three.js renderer, camera, activation tracking, bloom, and grain.
- `three/scenes/intro.js` — procedural barcode, dust, scanner, and accent intro scene.
- `docs/` — published static bundle mirrored from the root files for GitHub Pages.

## Running

Serve the folder with any static host so the ES modules and import map load correctly:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

No build step or package install is required. Runtime libraries load from CDNs: Google Fonts, Three.js, GSAP, and Lenis.

## Notes

- The page keeps all core content in semantic HTML and JSON-LD so it remains readable without JavaScript.
- WebGL, smooth scrolling, and reveal effects automatically fall back for reduced-motion users or browsers without WebGL.
- `docs/` should stay in sync with the root files when publishing changes.
