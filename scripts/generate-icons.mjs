import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

// SVG icon matching the green tile design from the game
function buildSvg(size) {
  const pad = size * 0.1;
  const tileSize = size - pad * 2;
  const radius = tileSize * 0.18;
  const cx = size / 2;
  const cy = size / 2;
  const x = pad;
  const y = pad;

  // Font size scales with tile
  const fontSize = tileSize * 0.52;
  const glowBlur = size * 0.08;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${glowBlur}" result="blur"/>
      <feFlood flood-color="#22c55e" flood-opacity="0.55" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#34d86a"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>

  <!-- Green tile with glow -->
  <rect
    x="${x}" y="${y}"
    width="${tileSize}" height="${tileSize}"
    rx="${radius}" ry="${radius}"
    fill="url(#tileGrad)"
    stroke="#16a34a"
    stroke-width="${size * 0.008}"
    filter="url(#glow)"
  />

  <!-- Subtle top highlight for 3D effect -->
  <rect
    x="${x + tileSize * 0.05}" y="${y + tileSize * 0.04}"
    width="${tileSize * 0.9}" height="${tileSize * 0.18}"
    rx="${radius * 0.6}" ry="${radius * 0.6}"
    fill="rgba(255,255,255,0.12)"
  />

  <!-- Letter D -->
  <text
    x="${cx}" y="${cy + fontSize * 0.36}"
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
