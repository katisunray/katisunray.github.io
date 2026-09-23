# SIRK Studio Website (Eleventy + Tailwind)

A static site built with Eleventy (11ty) and Tailwind CSS, deployed to GitHub Pages via GitHub Actions.

## Requirements
- Node.js 20.x
- npm 9+

## Quick start
```bash
# Install dependencies
npm ci

# Start local dev server (watches templates and CSS)
npm run dev

# Build production site to `_site/`
npm run build
```

## Project structure
- `src/` — Eleventy input directory
  - `_includes/` — Nunjucks layouts, partials, and components
    - `layouts/base.njk` — base layout wrapper
    - `layouts/product.njk` — product page layout
    - `components/product-card.njk` — product card markup
  - `_data/` — site data
    - `site.json` — defaults (name, url, etc.)
    - `site.js` — reads `SITE_URL` env at build time
  - `content/` — markdown content
    - `products/*.md` — product entries (front matter defines price, images, etc.)
  - `images/` — source images used by shortcodes
  - `index.njk`, `shop.njk`, `404.njk`, etc.
- `public/` — passthrough to the site root (robots.txt, CNAME if using a custom domain)
- `_site/` — build output (generated)

## CSS pipeline
- Tailwind configured in `tailwind.config.js`
- `postcss` builds `src/styles/input.css` → `_site/assets/main.css`

## Images
- Image shortcode is defined in `.eleventy.js` using `@11ty/eleventy-img`.
- If the native image pipeline (sharp) is unavailable, it gracefully falls back to a plain `<img>` tag.

Note: `src/content/products/ode-to-you-book.md` references `src/images/products/ode-to-you/odetoyou.jpg`. If this file is missing, the build falls back to the SVGs in that folder.

## Deploying to GitHub Pages (Actions)
This repo uses an Actions workflow at `.github/workflows/pages.yml`.

One-time repo settings:
1. Settings → Pages → Build and deployment → Source: select “GitHub Actions”.
2. Settings → Actions → General → Workflow permissions: “Read and write permissions”.

How the workflow works:
- Installs dependencies and runs `npm run build`.
- Writes output to `_site/` and uploads it as the Pages artifact.
- Adds `.nojekyll` so GitHub Pages does not try to Jekyll‑render the output.
- Sets two environment variables used by the build:
  - `PATH_PREFIX` → `/${repo}` for correct absolute URLs when the site is published at `/username/repo`.
  - `SITE_URL` → used by `src/_data/site.js` to compute canonical URLs.

After pushing to `main`, GitHub Actions will build and deploy automatically.

## Troubleshooting
- Red job named “pages build and deployment / build (dynamic)” fails with Liquid errors
  - Switch Settings → Pages → Source to “GitHub Actions”. That removes the legacy Jekyll job (Jekyll tries to parse Nunjucks templates and fails on tags like `productcard`).
- Broken image URLs
  - Ensure paths in front matter (e.g., `/images/...`) point to files under `src/images/...`. The image shortcode strips the leading slash and looks under `src/`.
- Paths look wrong in production
  - Confirm `PATH_PREFIX` and `SITE_URL` variables are set by the workflow (they are in the provided workflow).

## Custom domain (optional)
Add a `CNAME` file under `public/` with your domain name. It will be copied to the site root on build.

## Permanent QR-code links

Encode these URLs in printed QR codes so the destination can change later:

| QR-code URL | Destination before tracking parameters |
| --- | --- |
| https://katisunray.github.io/go/shop/ | https://katisunraystudio.myshopify.com/ |
| https://katisunray.github.io/go/instagram/ | https://www.instagram.com/kati_sunray/ |
| https://katisunray.github.io/go/review/ | https://g.page/r/CSdu8R2JLba_EAI/review |
| https://katisunray.github.io/go/website/ | https://katisunray.github.io/ |

### QR-code images

Print-ready codes for the URLs above are in `qr-codes/` (`qr-<slug>.svg` for print,
`qr-<slug>.png` at 1200px). They use high error correction and only encode the
permanent `/go/` URL, so they never need regenerating when a destination changes.
After adding a new slug to `src/_data/redirects.json`, run `npm run qr` to create its code.

### Change a destination

1. Edit the matching `url` in `src/_data/redirects.json`. Use the full `https://` destination URL and retain the UTM parameters described below.
2. Keep the `slug` unchanged: it determines the permanent address printed in the QR code.
3. Run `npm run build`, then commit and merge the change into `main` to deploy it through the existing Pages workflow.
4. Wait for deployment to succeed, then open the permanent URL and verify the destination before printing or sharing QR codes.

`src/redirects.njk` generates all four pages from this data. Each page uses
`location.replace` plus an HTML refresh fallback for browsers with JavaScript
disabled, and includes a clickable destination link. These are browser redirects,
not HTTP 302 responses. The redirect pages are excluded from the sitemap and marked
`noindex`. Keep the repository, GitHub Pages site, and `/go/` paths available for as
long as the printed codes are in use. A newly deployed destination may take time
to appear because of hosting or browser caching.

### Campaign attribution

The destination URLs in `src/_data/redirects.json` include standard Google Analytics
campaign parameters. Keep the printed `/go/` URLs unchanged.

| Parameter | Value |
| --- | --- |
| `utm_source` | `katisunray.github.io` (the redirect origin) |
| `utm_medium` | `qr_code` |
| `utm_campaign` | `qr_redirect` |
| `utm_content` | The redirect slug: `shop`, `instagram`, `review`, or `website` |

`utm_redirect` is not a standard GA campaign parameter; the redirect origin is
recorded in `utm_source`. Store plain URLs in the JSON, not Markdown links.

UTM tags supply attribution to analytics running on the destination. They do not
send analytics events by themselves. This repository currently has no Google
Analytics tag installed, and Shopify's Analytics setup must be checked separately.
Adding tags to Instagram or Google review links does not report those visits into
the studio's GA property. Measuring those outbound redirects requires separate
event tracking on the redirect pages. See [Google's campaign URL documentation](https://support.google.com/analytics/answer/10917952?hl=en).

## Scripts
- `npm run dev` — concurrently runs Eleventy dev server and PostCSS watcher
- `npm run build` — cleans `_site/`, builds CSS and templates for production
- `npm run qr` — regenerates QR-code images in `qr-codes/` from `src/_data/redirects.json`

## License
Not specified. Add your preferred license file if needed.
