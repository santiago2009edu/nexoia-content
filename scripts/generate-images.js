const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PENDING_DIR = "content/pending";
const ASSETS_DIR = "assets";
const GITHUB_RAW = "https://raw.githubusercontent.com/santiago2009edu/nexoia-content/main/assets";

const W = 1080, H = 1080;
const STORY_H = 1920;
const COLORS = { bg: "#06100A", text: "#EFF9F4", accent: "#4DBA87" };

function logo(size) {
  const r = size * 0.5;
  return `<g transform="translate(${size},${size})">
    <circle cx="0" cy="0" r="${r}" fill="none" stroke="${COLORS.accent}" stroke-width="4"/>
    <circle cx="${-r*0.7}" cy="${-r*0.7}" r="${r*0.45}" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>
    <circle cx="${r*0.7}" cy="${-r*0.7}" r="${r*0.45}" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>
    <circle cx="${-r*0.7}" cy="${r*0.7}" r="${r*0.45}" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>
    <line x1="${r*0.25}" y1="${r*0.25}" x2="${-r*0.7}" y2="${-r*0.7}" stroke="${COLORS.accent}" stroke-width="2"/>
    <line x1="${-r*0.25}" y1="${r*0.25}" x2="${r*0.7}" y2="${-r*0.7}" stroke="${COLORS.accent}" stroke-width="2"/>
    <line x1="${-r*0.25}" y1="${-r*0.25}" x2="${-r*0.7}" y2="${r*0.7}" stroke="${COLORS.accent}" stroke-width="2"/>
  </g>`;
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function makePostSVG(title, subtitle, cta, extra = "") {
  const lines = wrapText(title, 30);
  const lineH = 70;
  const startY = 400 - (lines.length - 1) * lineH * 0.5;
  const textElements = lines.map((l, i) =>
    `<text x="540" y="${startY + i * lineH}" font-family="Georgia,serif" font-size="52" fill="${COLORS.text}" text-anchor="middle" font-weight="bold">${l}</text>`
  ).join("\n");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
    <circle cx="540" cy="540" r="540" fill="${COLORS.accent}" opacity="0.03"/>
    <circle cx="270" cy="810" r="400" fill="${COLORS.accent}" opacity="0.02"/>
    <circle cx="810" cy="270" r="300" fill="${COLORS.accent}" opacity="0.02"/>
    ${logo(80)}
    ${textElements}
    ${subtitle ? `<text x="540" y="${startY + lines.length * lineH + 20}" font-family="sans-serif" font-size="24" fill="${COLORS.accent}" text-anchor="middle">${subtitle}</text>` : ""}
    ${cta ? `<text x="540" y="920" font-family="sans-serif" font-size="18" fill="${COLORS.accent}" text-anchor="middle" opacity="0.7">${cta}</text>` : ""}
    ${extra}
  </svg>`;
}

function makeStorySVG(title, subtitle, cta) {
  const lines = wrapText(title, 25);
  const lineH = 70;
  const startY = 700 - (lines.length - 1) * lineH * 0.5;
  const textElements = lines.map((l, i) =>
    `<text x="540" y="${startY + i * lineH}" font-family="Georgia,serif" font-size="48" fill="${COLORS.text}" text-anchor="middle" font-weight="bold">${l}</text>`
  ).join("\n");
  return `<svg width="${W}" height="${STORY_H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${STORY_H}" fill="${COLORS.bg}"/>
    <circle cx="540" cy="960" r="600" fill="${COLORS.accent}" opacity="0.03"/>
    <circle cx="270" cy="1400" r="450" fill="${COLORS.accent}" opacity="0.02"/>
    ${logo(100)}
    <text x="540" y="200" font-family="sans-serif" font-size="16" fill="${COLORS.accent}" text-anchor="middle" letter-spacing="4">${subtitle || "NEXO IA"}</text>
    ${textElements}
    ${cta ? `<text x="540" y="1600" font-family="sans-serif" font-size="22" fill="${COLORS.accent}" text-anchor="middle" opacity="0.8">${cta}</text>` : ""}
    <text x="540" y="1760" font-family="sans-serif" font-size="14" fill="${COLORS.text}" opacity="0.3" text-anchor="middle">nexoia.cali@gmail.com</text>
  </svg>`;
}

function makeSlideSVG(slideNum, totalSlides, text, title) {
  const lines = wrapText(text, 35);
  const lineH = 50;
  const startY = 450 - (lines.length - 1) * lineH * 0.5;
  const textElements = lines.map((l, i) =>
    `<text x="540" y="${startY + i * lineH}" font-family="sans-serif" font-size="30" fill="${COLORS.text}" text-anchor="middle">${l}</text>`
  ).join("\n");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
    <circle cx="540" cy="540" r="540" fill="${COLORS.accent}" opacity="0.03"/>
    <rect x="0" y="0" width="${W}" height="6" fill="${COLORS.accent}" opacity="0.3"/>
    ${logo(60)}
    ${title ? `<text x="540" y="250" font-family="Georgia,serif" font-size="42" fill="${COLORS.text}" text-anchor="middle" font-weight="bold">${title}</text>` : ""}
    ${textElements}
    <text x="540" y="980" font-family="sans-serif" font-size="14" fill="${COLORS.accent}" text-anchor="middle" opacity="0.5">${slideNum}/${totalSlides}</text>
  </svg>`;
}

async function generateImage(filename, svgContent) {
  const outPath = path.join(ASSETS_DIR, filename);
  await sharp(Buffer.from(svgContent)).jpeg({ quality: 90 }).toFile(outPath);
  console.log(`  ✅ ${filename}`);
  return `${GITHUB_RAW}/${filename}`;
}

async function processFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { id, tipo, contenido } = content;
  const visual = contenido.visual || {};
  const caption = contenido.caption || "";
  const cta = "nexoia.cali@gmail.com";
  const sizes = { post: "1080x1080", carrusel: "1080x1080", story: "1080x1920", reel: "1080x1920" };

  console.log(`\n📄 ${id} (${tipo})`);

  const images = [];

  if (tipo === "story") {
    const url = await generateImage(`${id}.jpg`, makeStorySVG(caption, id, cta));
    images.push(url);
  } else if (tipo === "reel") {
    const url = await generateImage(`${id}.jpg`, makeStorySVG(caption, id, cta));
    images.push(url);
  } else if (tipo === "carrusel") {
    const slides = contenido.carrusel_slides || [caption];
    for (let i = 0; i < slides.length; i++) {
      const slideText = slides[i];
      const title = i === 0 ? visual.elementos?.[0] || id : undefined;
      const url = await generateImage(`${id}-slide-${i + 1}.jpg`, makeSlideSVG(i + 1, slides.length, slideText, title));
      images.push(url);
    }
  } else {
    const subtitle = visual.elementos?.[1] || "";
    const url = await generateImage(`${id}.jpg`, makePostSVG(caption, subtitle, cta));
    images.push(url);
  }

  content.image_urls = images;
  content.image_url = images[0]; // primary image
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`  ✅ ${id} actualizado con image_url`);
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith(".json"));
  for (const f of files) {
    await processFile(path.join(PENDING_DIR, f));
  }
  console.log("\n🎉 Todas las imágenes generadas");
}

main().catch(console.error);
