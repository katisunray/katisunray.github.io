# SIRK Static Site – Developer Read Spec

## 1) Objective

Marketing/presentation site for SIRK prints and greeting cards. Fast static pages, excellent SEO, no backend. Phase 1 uses outbound “Buy” links (Etsy/Shopify).

## 2) Decision Matrix (Eleventy vs Next.js)

**Recommendation:** Start with **Eleventy (11ty)** + Tailwind for minimal complexity and top performance. Switch to **Next.js** only if you need SSR/APIs/customer accounts.

| Criterion     | Eleventy (11ty)                 | Next.js                                |
| ------------- | ------------------------------- | -------------------------------------- |
| Rendering     | SSG only (build-time HTML)      | SSG + SSR + ISR + API routes           |
| Complexity    | Low                             | Medium/High (React conventions)        |
| Performance   | Excellent (flat HTML)           | Excellent but heavier footprint        |
| Content model | Markdown + front‑matter         | MDX/Markdown or CMS + React components |
| Interactivity | Client-side JS only             | Full React app features                |
| Best for      | Marketing/portfolio, small shop | Apps, dashboards, complex e‑com        |

## 3) Tech Stack (Phase 1)

* **Static generator:** Eleventy (11ty)
* **Templating:** Nunjucks
* **Styles:** Tailwind CSS (PostCSS + Autoprefixer)
* **Images:** @11ty/eleventy-img (AVIF/WebP + responsive widths)
* **Content:** Markdown + YAML front‑matter
* **Analytics:** Plausible (or GA4)
* **Hosting/CI:** Azure Static Web Apps (or Vercel/Netlify)

> If switching to Next.js later: keep Tailwind, mirror IA/content fields; add ISR for product pages.

## 4) Information Architecture

* `/` Home
* `/shop/` Grid of all items
* `/shop/<slug>/` Product detail
* `/collections/<collection-slug>/` Optional
* `/about/`, `/contact/`, `/privacy/`, `/terms/`

## 5) Content Models

**Product** (markdown front‑matter)

```
---
title: "Sunlit Iris – A5 Print"
slug: "sunlit-iris-a5"
price: 18
currency: "CAD"
type: "print" # print|card
sku: "P-IRIS-A5"
collections: ["botanical","best-sellers"]
images:
  - src: "/images/products/sunlit-iris/main.jpg"
  - src: "/images/products/sunlit-iris/detail-1.jpg"
buy_url: "https://www.etsy.com/..."
in_stock: true
seo:
  title: "Sunlit Iris A5 Art Print | SIRK Studio"
  description: "Archival botanical print. Ready to frame."
---
Short marketing copy above the fold.
```

**Collection**

```
---
title: "Botanical"
slug: "botanical"
description: "Nature‑inspired pieces."
---
```

**Simple Page**

```
---
title: "About"
slug: "about"
seo:
  title: "About SIRK Studio"
  description: "Small‑batch prints and greeting cards."
---
Body content.
```

## 6) Components

Header, Footer, Hero, ProductCard, ProductGallery (lightbox optional), Badge (print/card), ProductGrid, CollectionGrid, SEO meta partial, Pagination, Notice/Toast (optional), Contact form (Formspree or mailto:).

## 7) Design System

* Tailwind theme tokens:

  * Blue: `#94cadf`
  * Beige: `#f7e8ba`
  * Coral Red: `#ff5757`
* Fonts: Serif display for H1/H2, Sans for body.
* Rounded `md`, subtle transitions. Optional dark mode with `class` toggle.

## 8) Performance & Accessibility

* Lighthouse ≥ 95 (Perf/SEO/A11y/Best Practices).
* Images: AVIF/WebP + JPG fallback; widths `[400, 800, 1200, 1600]`; lazy‑load below fold; `fetchpriority="high"` for LCP.
* Semantic HTML, focus styles, ARIA where needed; contrast ≥ 4.5:1.

## 9) SEO

* Per-page `title` + `meta description`.
* Open Graph + Twitter meta.
* JSON‑LD `Product` on product pages with `name`, `image[]`, `offers` (`price`, `priceCurrency`, `availability`).
* `robots.txt`, `sitemap.xml`, canonical URLs.

## 10) Repository Layout

```
/
├─ .eleventy.js
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ src/
│  ├─ _data/site.json
│  ├─ _includes/        # layouts/partials
│  ├─ images/           # source images
│  ├─ styles/           # input.css (Tailwind)
│  └─ content/
│     ├─ products/
│     ├─ collections/
│     └─ pages/
└─ public/              # favicons, robots.txt, static files
```

## 11) Key Files

**package.json (scripts + deps)**

```
{
  "scripts": {
    "dev": "concurrently \"npm:watch:*\"",
    "watch:11ty": "eleventy --serve --quiet",
    "watch:css": "postcss src/styles/input.css -o _site/assets/main.css --watch",
    "build": "rimraf _site && NODE_ENV=production postcss src/styles/input.css -o _site/assets/main.css && eleventy"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-img": "^5.0.0",
    "autoprefixer": "^10.4.20",
    "concurrently": "^8.2.2",
    "postcss": "^8.4.47",
    "postcss-cli": "^11.0.0",
    "rimraf": "^6.0.1",
    "tailwindcss": "^3.4.10"
  }
}
```

**tailwind.config.js**

```
module.exports = {
  content: ["_site/**/*.html", "src/**/*.njk", "src/**/*.md"],
  theme: { extend: { colors: { brand: { 600: "#2E5A6B", 800: "#1F3E49" }, blue: "#94cadf", beige: "#f7e8ba", coral: "#ff5757" } } },
  plugins: []
};
```

**.eleventy.js (essentials)**

```
const Image = require("@11ty/eleventy-img");
const path = require("path");

async function imgShortcode(src, alt, widths=[400,800,1200,1600], sizes="(min-width: 768px) 50vw, 100vw") {
  const fullSrc = path.join("src", src.replace(/^\//, ""));
  const metadata = await Image(fullSrc, {
    widths,
    formats: ["avif","webp","jpeg"],
    urlPath: "/assets/img/",
    outputDir: "_site/assets/img/"
  });
  const attrs = { alt, sizes, loading: "lazy", decoding: "async" };
  return Image.generateHTML(metadata, attrs);
}

module.exports = function(config) {
  config.addNunjucksAsyncShortcode("img", imgShortcode);
  config.addPassthroughCopy({ "public": "/" });
  config.addCollection("products", (api) =>
    api.getFilteredByGlob("src/content/products/*.md").sort((a,b) => a.data.title.localeCompare(b.data.title))
  );
  return { dir: { input: "src", output: "_site", includes: "_includes" }, htmlTemplateEngine: "njk" };
};
```

## 12) Build & Deploy

* **Dev:** `npm run dev` (11ty serve + Tailwind watch)
* **Build:** `npm run build`
* **Deploy target:** Azure Static Web Apps

  * App folder: repo root
  * Output folder: `_site`
  * Build command: `npm ci && npm run build`
  * `staticwebapp.config.json` (security headers, 404 rewrite, clean URLs)

## 13) Acceptance Criteria

* Pages render with responsive images and valid meta.
* Lighthouse ≥ 95 across categories.
* JSON‑LD validates in Google Rich Results.
* Deployed behind CDN; first view TTFB on CDN hit < 200 ms.

## 14) Backlog (Later)

* Stripe Checkout via SWA Functions (cart-less: direct Checkout per product).
* CMS (Decap/Netlify CMS) for content editing.
* i18n (`/pt/` folder) + language switcher.
* Dark mode + theme toggle.

## 15) Risks/Notes

* Image source assets must be high‑res; maintain aspect ratios.
* Outbound `buy_url` ownership/consistency.
* If moving to Next.js later, map the same content fields to avoid migration churn.

---

## 16) In‑Store Poster Content (Marketing Copy)

**Tagline:** Thoughtful Gifts for Baby, Kids & Parents
Cherishing simple (and precious) family moments & celebrating presence with our little ones.

**Hero product:** *An Ode to You, Our Baby* (nursery book).

* Heartfelt poetic book for babies, toddlers, and parents.
* Celebrates the joy of simple moments that babies inspire.
* Written and illustrated by Kati Sunray.
* Emotional wellbeing specialist, mother of three.
* Illustrated tribute to cherished experiences.

**Other gifts:**

* Greeting cards
* Art prints
* Baby custom illustration & art print keepsake

**Footer claims:**

* Made in Canada – Created and printed in Ontario
* Local author (The Beach)
* Contact & orders: [katisunray@gmail.com](mailto:katisunray@gmail.com)
* Instagram: @kati\_sunray
* Mailing list: QR code signup

## 17) Product Lineups

### Greeting Cards

* Lineup placeholder: 10–20 product images TBD.

### Art Prints (8.5x11 in)

* Lineup placeholder: 10–20 product images TBD.

### Baby Custom Illustration & Art Print Keepsake

* Product image placeholder to showcase sample.
* Price: CAD 120.
* Ordering: via email **[katisunray@gmail.com](mailto:katisunray@gmail.com)**.
