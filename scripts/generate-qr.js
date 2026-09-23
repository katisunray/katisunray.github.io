// Generates print-ready QR codes for the permanent /go/<slug>/ redirect URLs.
// Output goes to qr-codes/ (outside src/, so it is not deployed).
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const SITE_URL = "https://katisunray.github.io";
const OUT_DIR = path.join(__dirname, "..", "qr-codes");
const redirects = require("../src/_data/redirects.json");

// High error correction survives print wear and small logos/marks.
const options = { errorCorrectionLevel: "H", margin: 4 };

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const { slug } of redirects) {
    const url = `${SITE_URL}/go/${slug}/`;
    const base = path.join(OUT_DIR, `qr-${slug}`);
    await QRCode.toFile(`${base}.svg`, url, { ...options, type: "svg" });
    await QRCode.toFile(`${base}.png`, url, { ...options, width: 1200 });
    console.log(`${slug}: ${url}`);
  }
})();
