/**
 * Generates sitemap.xml from the blog post database.
 *
 * Run after adding or editing posts in js/blog-posts.js:
 *   node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.piotrbak.bio';

const MONTHS_PL = {
  'stycznia': 1, 'styczeń': 1,
  'lutego': 2, 'luty': 2,
  'marca': 3, 'marzec': 3,
  'kwietnia': 4, 'kwiecień': 4,
  'maja': 5, 'maj': 5,
  'czerwca': 6, 'czerwiec': 6,
  'lipca': 7, 'lipiec': 7,
  'sierpnia': 8, 'sierpień': 8,
  'września': 9, 'wrzesień': 9,
  'października': 10, 'październik': 10,
  'listopada': 11, 'listopad': 11,
  'grudnia': 12, 'grudzień': 12
};

// Mirrors parsePlDate() in js/post.js — "07 grudnia 2023" -> "2023-12-07"
function toIsoDate(dateStr) {
  const parts = String(dateStr || '').trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = MONTHS_PL[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    if (day && month && year) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return `${parts[0]}-01-01`;
  return null;
}

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
}

// js/blog-posts.js is a plain `const BLOG_POSTS = [...]` array literal.
const src = readFileSync(resolve(ROOT, 'js/blog-posts.js'), 'utf8');
const posts = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));

const newest = posts
  .map(p => toIsoDate(p.date))
  .filter(Boolean)
  .sort()
  .pop();

const urls = [
  { loc: `${ORIGIN}/`, lastmod: newest },
  { loc: `${ORIGIN}/blog.html`, lastmod: newest },
  ...posts.map(p => ({
    // Slugs are stored already percent-encoded, matching the hrefs in js/blog.js.
    loc: `${ORIGIN}/post.html?post=${p.slug}`,
    lastmod: toIsoDate(p.date)
  }))
];

const body = urls.map(({ loc, lastmod }) => {
  const tags = [`    <loc>${xmlEscape(loc)}</loc>`];
  if (lastmod) tags.push(`    <lastmod>${lastmod}</lastmod>`);
  return `  <url>\n${tags.join('\n')}\n  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(resolve(ROOT, 'sitemap.xml'), sitemap);
console.log(`sitemap.xml: ${urls.length} URLs (${posts.length} posts + 2 pages)`);
