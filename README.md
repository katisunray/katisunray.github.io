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

After pushing to `master`, GitHub Actions will build and deploy automatically.

## Troubleshooting
- Red job named “pages build and deployment / build (dynamic)” fails with Liquid errors
  - Switch Settings → Pages → Source to “GitHub Actions”. That removes the legacy Jekyll job (Jekyll tries to parse Nunjucks templates and fails on tags like `productcard`).
- Broken image URLs
  - Ensure paths in front matter (e.g., `/images/...`) point to files under `src/images/...`. The image shortcode strips the leading slash and looks under `src/`.
- Paths look wrong in production
  - Confirm `PATH_PREFIX` and `SITE_URL` variables are set by the workflow (they are in the provided workflow).

## Custom domain (optional)
Add a `CNAME` file under `public/` with your domain name. It will be copied to the site root on build.

## Scripts
- `npm run dev` — concurrently runs Eleventy dev server and PostCSS watcher
- `npm run build` — cleans `_site/`, builds CSS and templates for production

## License
Not specified. Add your preferred license file if needed.

