const base = require("./site.json");

module.exports = {
  ...base,
  url: process.env.SITE_URL || base.url || "",
  buildVersion: process.env.SITE_VERSION || process.env.GITHUB_SHA || "dev",
};

