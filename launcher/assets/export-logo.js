const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const dir = __dirname;
  const svgPath = path.join(dir, "logo.svg");
  const out3000 = path.join(dir, "null-client-logo-3000.png");
  const outLogo = path.join(dir, "logo.png");
  const outDownloads = path.join(
    process.env.USERPROFILE || "",
    "Downloads",
    "null-client-logo-3000.png"
  );

  const svg = fs.readFileSync(svgPath);

  // PNG maestro 3000x3000 con transparencia
  await sharp(svg, { density: 600 })
    .resize(3000, 3000, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(out3000);

  // Copia para el launcher (mismo archivo)
  fs.copyFileSync(out3000, outLogo);

  // Copia a Descargas para que lo encuentres fácil
  if (outDownloads) {
    fs.copyFileSync(out3000, outDownloads);
  }

  const meta = await sharp(out3000).metadata();
  console.log("OK", meta.width + "x" + meta.height, meta.format);
  console.log("launcher:", outLogo);
  console.log("descargas:", outDownloads);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
