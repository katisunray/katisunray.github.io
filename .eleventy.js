let Image;
try {
  Image = require("@11ty/eleventy-img");
} catch (e) {
  Image = null; // Fallback when sharp is unavailable
}
const path = require("path");
const fs = require("fs");

async function imgShortcode(src, alt, widths = [400, 800, 1200, 1600], sizes = "(min-width: 768px) 50vw, 100vw", pathPrefix = "") {
  const cleanSrc = src.replace(/^\//, "");
  const fullSrc = path.join("src", cleanSrc);

  // Skip rendering if source file is missing
  try {
    if (!fs.existsSync(fullSrc)) {
      return "";
    }
  } catch (_) {}

  if (!Image) {
    // Fallback: just emit a plain <img> pointing at the passthrough images path
    const url = path.join(pathPrefix, "/" + cleanSrc).replace(/\\/g, "/");
    return `<img src="${url}" alt="${alt || ""}" loading="lazy" decoding="async">`;
  }

  const metadata = await Image(fullSrc, {
    widths,
    formats: ["avif", "webp", "jpeg"],
    urlPath: path.join(pathPrefix, "/assets/img/"),
    outputDir: "_site/assets/img/"
  });
  const attrs = { alt, sizes, loading: "lazy", decoding: "async" };
  return Image.generateHTML(metadata, attrs);
}

module.exports = function (config) {
  const pathPrefix = process.env.PATH_PREFIX || "/";
  config.addFilter("dateToISO", (date) => new Date(date).toISOString());
  config.addFilter("date", (dateInput, format) => {
    const d = dateInput === "now" || !dateInput ? new Date() : new Date(dateInput);
    if (format === "yyyy") return String(d.getUTCFullYear());
    return d.toISOString();
  });
  config.addFilter("pluck", (arr, key) => Array.isArray(arr) ? arr.map((o) => o && o[key]).filter(Boolean) : []);
  config.addNunjucksAsyncShortcode("img", (src, alt, widths, sizes) => imgShortcode(src, alt, widths, sizes, pathPrefix));
  config.addNunjucksAsyncShortcode("productcard", async (product) => {
    const d = product && product.data || {};
    const url = product && product.url || '#';
    let imageHtml = '';
    if (d.images && d.images.length) {
      let chosen = null;
      for (const it of d.images) {
        if (!it || !it.src) continue;
        const clean = it.src.replace(/^\//, "");
        try {
          if (fs.existsSync(path.join("src", clean))) { chosen = it.src; break; }
        } catch (_) {}
      }
      if (chosen) {
        imageHtml = await imgShortcode(chosen, d.title, [400, 800, 1200], "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw", pathPrefix);
      }
    }
    return `
<a class="block group rounded-md overflow-hidden border hover:shadow-md transition" href="${url}">
  <div class="aspect-[4/3] bg-gray-100 overflow-hidden">${imageHtml}</div>
  <div class="p-3">
    <div class="flex items-center justify-between">
      <h3 class="font-medium group-hover:underline">${d.title || ''}</h3>
      <span class="text-sm font-semibold">${d.price || ''} ${d.currency || 'CAD'}</span>
    </div>
    ${d.type ? `<span class=\"mt-2 inline-block text-[11px] uppercase tracking-wide bg-beige px-2 py-1 rounded-md\">${d.type}</span>` : ''}
  </div>
</a>`;
  });
  config.addPassthroughCopy({ "public": "/" });
  // Ensure raw images are available in dev/fallback
  config.addPassthroughCopy({ "src/images": "images" });
  config.addCollection("products", (api) =>
    api
      .getFilteredByGlob("src/content/products/*.md")
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
  );
  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    htmlTemplateEngine: "njk",
    pathPrefix
  };
};
