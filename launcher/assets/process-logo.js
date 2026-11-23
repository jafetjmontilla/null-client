const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const source = path.join(
    process.env.USERPROFILE,
    ".cursor",
    "projects",
    "e-Cliente-de-minecraft",
    "assets",
    "null-logo-gen.jpg"
  );

  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convertir fondo claro a transparente y tinta a negro puro
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > 170) {
      // fondo
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else if (lum > 90) {
      // anti-alias / gris → negro semi
      const alpha = Math.round(255 * (1 - (lum - 90) / 80));
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = alpha;
    } else {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }

  // Recortar al contenido opaco + margen
  const cropped = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  const out3000 = path.join(__dirname, "null-client-logo-3000.png");
  const outLogo = path.join(__dirname, "logo.png");
  const outDownloads = path.join(
    process.env.USERPROFILE,
    "Downloads",
    "null-client-logo-3000.png"
  );
  const preview = path.join(__dirname, "logo-preview.png");

  await sharp(cropped)
    .resize(3000, 3000, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(out3000);

  fs.copyFileSync(out3000, outLogo);
  fs.copyFileSync(out3000, outDownloads);

  const small = await sharp(out3000).resize(800, 800).png().toBuffer();
  await sharp({
    create: {
      width: 800,
      height: 800,
      channels: 4,
      background: { r: 230, g: 230, b: 230, alpha: 1 },
    },
  })
    .composite([{ input: small, gravity: "centre" }])
    .png()
    .toFile(preview);

  const meta = await sharp(out3000).metadata();
  console.log("OK", meta.width + "x" + meta.height);
  console.log(out3000);
  console.log(outDownloads);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
