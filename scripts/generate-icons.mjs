import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

// SVG icon matching the green tile design from the game
// Full bleed — OS applies its own rounded corner mask
function buildSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size * 0.52;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#34d86a"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>

  <!-- Full bleed green background -->
  <rect width="${size}" height="${size}" fill="url(#tileGrad)"/>

  <!-- Letter D -->
  <text
    x="${cx}" y="${cy + fontSize * 0.38}"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="${fontSize}"
    fill="white"
    text-anchor="middle"
    letter-spacing="-1"
  >D</text>
</svg>`;
}

async function generateIcons() {
  const sizes = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "icon-1024.png", size: 1024 },
    { name: "favicon-32.png", size: 32 },
  ];

  for (const { name, size } of sizes) {
    const svg = Buffer.from(buildSvg(size));
    const outputPath = resolve(publicDir, name);
    await sharp(svg).png().toFile(outputPath);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Also save favicon.ico as a 32x32 PNG renamed (browsers accept PNG favicon)
  const favicoSvg = Buffer.from(buildSvg(32));
  await sharp(favicoSvg).png().toFile(resolve(publicDir, "favicon.ico"));
  console.log("✓ Generated favicon.ico (32x32)");

  console.log("\nAll icons generated in /public/");
}

generateIcons().catch(console.error);
