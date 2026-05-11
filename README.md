# GitHire — Frontend Source

A scroll-based onboarding entrance for AI-native teams.

## Files

- `index.html` — page markup (Hero · Workflow · Rituals · Skills · CTA · Footer)
- `news.html` — placeholder News route with expandable index lanes
- `githire.css` — full stylesheet (design tokens, layout, scroll-pinned scenes)
- `githire-scroll.js` — scroll-driven choreography (workflow timeline, rituals, journey scenes)

## Running

Open `index.html` directly in a browser, or serve the folder with any static host:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

No build step. No package install. The page loads Google Fonts (Newsreader, IBM Plex Sans, IBM Plex Mono, JetBrains Mono) over the network.

## Design tokens

CSS custom properties live at the top of `githire.css` under `:root` — paper / ink / accent colors, type stacks, easing, shared spacing. Edit there to retheme.

## Notes for re-implementation

- Fixed top nav with `Let's talk` (mailto) + `Menu` (dropdown → Home / back to top).
- Menu links are real route / anchor links, with Home section indexes and a News route entry.
- Each major section (`#workflow`, `#rituals`, `#skills`) is a scroll-pinned stage; the `.pin-stage` wrapper sits inside a tall `.pin-track` so the inner scene plays as the user scrolls. Logic in `githire-scroll.js`.
- Workflow has 6 steps: Issue → Sandbox → Execute & PR → AI review → Architect review → Ship.
- Footer uses a `$ whoami` terminal block with author + repo + license.
