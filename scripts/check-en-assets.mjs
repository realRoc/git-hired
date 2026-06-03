// Regression guard for /en/ pages that are generated one directory below
// docs/. Root-level assets must be referenced with ../ so they do not resolve
// to missing /en/<asset> URLs.
//
// Run: npm run check:en-assets

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const EN = join(DOCS, 'en');

const pages = [
  'index.html',
  'blog.html',
  'skill.html',
  'case-redis-scan.html',
];

const rootAssets = new Set([
  'favicon.svg',
  'githire.css',
  'githire-scroll.js',
  'githire-analytics.js',
  'i18n.js',
  'game.html',
]);

let failed = 0;
const assert = (cond, msg) => {
  console.log((cond ? '✓' : '✗') + ' ' + msg);
  if (!cond) failed++;
};

for (const asset of rootAssets) {
  assert(existsSync(join(DOCS, asset)), `root asset exists: docs/${asset}`);
}

for (const page of pages) {
  const html = readFileSync(join(EN, page), 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  let checked = 0;

  for (const el of doc.querySelectorAll('[href], [src]')) {
    for (const attr of ['href', 'src']) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      if (/^([a-z]+:|\/\/|#|\/)/i.test(value)) continue;

      const path = value.split('#')[0].split('?')[0];
      if (rootAssets.has(path)) {
        assert(false, `${page}: ${attr}="${value}" is a bare root asset`);
      }
      if (path.startsWith('../') && rootAssets.has(path.slice(3))) {
        checked++;
        assert(existsSync(join(EN, path)), `${page}: ${attr}="${value}" resolves to an existing asset`);
      }
    }
  }
  assert(checked > 0, `${page}: checked ${checked} rewritten root asset references`);
}

console.log(failed === 0
  ? '\nPASS — /en/ pages resolve root assets from the site root'
  : `\nFAIL — ${failed} check(s) failed`);
process.exit(failed ? 1 : 0);
