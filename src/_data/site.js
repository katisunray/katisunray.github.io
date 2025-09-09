const base = require("./site.json");

module.exports = {
  ...base,
  url: process.env.SITE_URL || base.url || "",
};


