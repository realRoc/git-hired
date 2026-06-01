// Regression guard for the scroll-reveal failsafe.
//
// Scroll-reveal sections (workflow panels, the overview, ritual cards, the dark
// closer) start at opacity:0 and are revealed by docs/githire-scroll.js. That
// script adds `.js` to <html> ONLY once it is executing, so the hidden states
// are gated behind `html.js`. If the script never runs — ES modules unsupported,
// a 404 on the script, a failed `three` import, JS disabled, or a non-JS crawler
// — `.js` must stay absent and the `html:not(.js)` failsafe in githire.css must
// force every revealed section back to visible. This test fails if a future edit
// reintroduces an unconditional `.js` (e.g. in the <head>) or drops a selector
// from the failsafe block, either of which would ship a blank section.
//
// Run: npm run check:failsafe

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');

let failed = 0;
const assert = (cond, msg) => {
  console.log((cond ? '✓' : '✗') + ' ' + msg);
  if (!cond) failed++;
};

// 1) With no script execution (module unsupported / not loaded), <html> must
//    NOT carry `.js`, so the failsafe path is the one that applies.
for (const page of ['index.html', 'en/index.html']) {
  const html = readFileSync(join(DOCS, page), 'utf8');
  // runScripts is left off: neither inline nor external scripts execute.
  const dom = new JSDOM(html);
  const hasJs = dom.window.document.documentElement.classList.contains('js');
  assert(!hasJs, `${page}: <html> has no .js before any script runs`);
}

// 2) The failsafe block must reset every initially-hidden reveal selector.
const css = readFileSync(join(DOCS, 'githire.css'), 'utf8');
const marker = 'Reveal failsafe';
assert(css.includes(marker), 'githire.css contains the reveal-failsafe block');
const failsafe = css.slice(css.indexOf(marker));
const mustCover = [
  '.wf-panel .wf-counter', '.wf-panel h3', '.wf-panel .wf-body', '.wf-panel .wf-en', '.wf-panel .wf-fig',
  '.wf-overview .wf-overview-title', '.wf-overview .wf-flow li', '.wf-overview .wf-overview-foot',
  '.ritual-card .ritual-inner',
  '.scene-closer.is-dark .meta', '.scene-closer.is-dark .closer-line',
  '.scene-closer.is-dark .closer-en', '.scene-closer.is-dark .closer-cta',
];
for (const sel of mustCover) {
  assert(failsafe.includes('html:not(.js) ' + sel), `failsafe covers ${sel}`);
}
assert(
  /opacity:\s*1\s*!important/.test(failsafe) && /transform:\s*none\s*!important/.test(failsafe),
  'failsafe forces opacity:1 + transform:none',
);

// 3) `.js` is added exactly once, by the reveal script, after stage init — never
//    unconditionally in a <head> inline script.
const js = readFileSync(join(DOCS, 'githire-scroll.js'), 'utf8');
const adds = (js.match(/classList\.add\(['"]js['"]\)/g) || []).length;
assert(adds === 1, '.js is added in exactly one place (githire-scroll.js)');
assert(
  js.indexOf('stage.start()') < js.search(/classList\.add\(['"]js['"]\)/),
  '.js is added after stage init (WebGL failure is caught and still reaches it)',
);
for (const page of ['index.html', 'en/index.html']) {
  const html = readFileSync(join(DOCS, page), 'utf8');
  assert(!/classList\.add\(['"]js['"]\)/.test(html), `${page} does not add .js in inline HTML`);
}

console.log(failed === 0
  ? '\nPASS — reveal sections fail open when the script does not run'
  : `\nFAIL — ${failed} check(s) failed`);
process.exit(failed ? 1 : 0);
