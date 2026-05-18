const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PENDING_DIR = "content/pending";
const ASSETS_DIR = "assets";
const GITHUB_RAW = "https://raw.githubusercontent.com/santiago2009edu/nexoia-content/main/assets";

const W = 1080, H = 1080;
const STORY_H = 1920;

const PALETTES = [
  { bg: "#06100A", accent1: "#4DBA87", accent2: "#2E9E67", text: "#EFF9F4" },
  { bg: "#0A1628", accent1: "#1E90FF", accent2: "#0D4F8B", text: "#E8F4FD" },
  { bg: "#1A0A0A", accent1: "#E05252", accent2: "#8B2020", text: "#FDE8E8" },
  { bg: "#1A1628", accent1: "#E8A838", accent2: "#B8860B", text: "#FDF4E0" },
  { bg: "#0D1F13", accent1: "#4DBA87", accent2: "#2E9E67", text: "#EFF9F4" },
  { bg: "#2D1B2E", accent1: "#E8A838", accent2: "#8B5E3C", text: "#FDF4E0" },
  { bg: "#06100A", accent1: "#8AABFF", accent2: "#5E7FCC", text: "#EFF9F4" },
  { bg: "#101010", accent1: "#FFFFFF", accent2: "#AAAAAA", text: "#FFFFFF" },
];

function getPalette(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

function logo(size) {
  const r = size * 0.5;
  return `<g transform="translate(${size * 1.2},${size * 1.2})" opacity="0.8">
    <circle cx="0" cy="0" r="${r}" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="${-r*0.6}" cy="${-r*0.6}" r="${r*0.35}" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="${r*0.6}" cy="${-r*0.6}" r="${r*0.35}" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="${-r*0.6}" cy="${r*0.6}" r="${r*0.35}" fill="none" stroke="currentColor" stroke-width="2.5"/>
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

function gradients(p) {
  return `
    <defs>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.bg}"/>
        <stop offset="100%" style="stop-color:${p.bg}dd"/>
      </linearGradient>
      <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.accent1};stop-opacity:0.15"/>
        <stop offset="100%" style="stop-color:${p.accent2};stop-opacity:0.05"/>
      </linearGradient>
      <linearGradient id="text-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${p.text}"/>
        <stop offset="100%" style="stop-color:${p.text}cc"/>
      </linearGradient>
    </defs>`;
}

function makePostSVG(id, title, subtitle, cta, extra = "") {
  const p = getPalette(id);
  const lines = wrapText(title, 28);
  const lineH = 72;
  const startY = 380 - (lines.length - 1) * lineH * 0.5;
  const textElements = lines.map((l, i) =>
    `<text x="540" y="${startY + i * lineH}" font-family="Georgia,serif" font-size="${lines.length > 3 ? 44 : 52}" fill="url(#text-grad)" text-anchor="middle" font-weight="bold">${l}</text>`
  ).join("\n");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="color:${p.accent1}">
    ${gradients(p)}
    <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
    <rect width="${W}" height="${H}" fill="url(#accent-grad)"/>
    <circle cx="540" cy="540" r="540" fill="${p.accent1}" opacity="0.03"/>
    <circle cx="270" cy="810" r="350" fill="${p.accent2}" opacity="0.04"/>
    <circle cx="810" cy="270" r="250" fill="${p.accent1}" opacity="0.03"/>
    <line x1="0" y1="0" x2="${W}" y2="${H}" stroke="${p.accent1}" stroke-width="1" opacity="0.06"/>
    <line x1="${W}" y1="0" x2="0" y2="${H}" stroke="${p.accent1}" stroke-width="1" opacity="0.06"/>
    <text x="540" y="100" font-family="sans-serif" font-size="12" fill="${p.accent1}" text-anchor="middle" opacity="0.5" letter-spacing="6">NEXO IA</text>
    ${logo(60)}
    ${textElements}
    ${subtitle ? `<text x="540" y="${startY + lines.length * lineH + 24}" font-family="sans-serif" font-size="22" fill="${p.accent1}" text-anchor="middle">${subtitle}</text>` : ""}
    ${cta ? `<text x="540" y="920" font-family="sans-serif" font-size="16" fill="${p.accent1}" text-anchor="middle" opacity="0.6">${cta}</text>` : ""}
    ${extra}
  </svg>`;
}

function makeStorySVG(id, title, subtitle, cta) {
  const p = getPalette(id);
  const lines = wrapText(title, 22);
  const lineH = 72;
  const startY = 700 - (lines.length - 1) * lineH * 0.5;
  const textElements = lines.map((l, i) =>
    `<text x="540" y="${startY + i * lineH}" font-family="Georgia,serif" font-size="${lines.length > 3 ? 40 : 48}" fill="url(#text-grad)" text-anchor="middle" font-weight="bold">${l}</text>`
  ).join("\n");
  return `<svg width="${W}" height="${STORY_H}" xmlns="http://www.w3.org/2000/svg" style="color:${p.accent1}">
    ${gradients(p)}
    <rect width="${W}" height="${STORY_H}" fill="url(#bg-grad)"/>
    <rect width="${W}" height="${STORY_H}" fill="url(#accent-grad)"/>
    <circle cx="540" cy="960" r="600" fill="${p.accent1}" opacity="0.03"/>
    <circle cx="270" cy="1400" r="400" fill="${p.accent2}" opacity="0.04"/>
    <circle cx="810" cy="400" r="300" fill="${p.accent1}" opacity="0.03"/>
    <line x1="0" y1="0" x2="${W}" y2="${STORY_H}" stroke="${p.accent1}" stroke-width="1" opacity="0.06"/>
    <line x1="${W}" y1="0" x2="0" y2="${STORY_H}" stroke="${p.accent1}" stroke-width="1" opacity="0.06"/>
    ${logo(80)}
    <text x="540" y="200" font-family="sans-serif" font-size="14" fill="${p.accent1}" text-anchor="middle" opacity="0.5" letter-spacing="5">${subtitle || "NEXO IA"}</text>
    ${textElements}
    ${cta ? `<rect x="340" y="1500" width="400" height="56" rx="28" fill="${p.accent1}" opacity="0.9"/><text x="540" y="1536" font-family="sans-serif" font-size="18" fill="${p.bg}" text-anchor="middle" font-weight="bold">${cta}</text>` : ""}
    <text x="540" y="1800" font-family="sans-serif" font-size="13" fill="${p.accent1}" opacity="0.3" text-anchor="middle">@nexoia_cali</text>
  </svg>`;
}

function makeSlideSVG(id, slideNum, totalSlides, text, title) {
  const p = getPalette(id);
  const lines = wrapText(text, 32);
  const lineH = 52;
  const startY = 450 - (lines.length - 1) * lineH * 0.5;
  const textElements = lines.map((l, i) =>
    `<text x="540" y="${startY + i * lineH}" font-family="sans-serif" font-size="28" fill="${p.text}" text-anchor="middle" opacity="0.9">${l}</text>`
  ).join("\n");
  const numSize = 80;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="color:${p.accent1}">
    ${gradients(p)}
    <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
    <rect width="${W}" height="${H}" fill="url(#accent-grad)"/>
    <circle cx="540" cy="540" r="540" fill="${p.accent1}" opacity="0.03"/>
    <circle cx="810" cy="810" r="250" fill="${p.accent2}" opacity="0.04"/>
    <text x="540" y="110" font-family="Georgia,serif" font-size="${numSize}" fill="${p.accent1}" text-anchor="middle" font-weight="bold" opacity="0.15">${slideNum}</text>
    <rect x="380" y="140" width="320" height="3" rx="1.5" fill="${p.accent1}" opacity="0.3"/>
    ${logo(50)}
    ${title ? `<text x="540" y="280" font-family="Georgia,serif" font-size="40" fill="url(#text-grad)" text-anchor="middle" font-weight="bold">${title}</text>` : ""}
    ${textElements}
    <circle cx="540" cy="980" r="24" fill="none" stroke="${p.accent1}" stroke-width="2" opacity="0.3"/>
    <text x="540" y="987" font-family="sans-serif" font-size="14" fill="${p.accent1}" text-anchor="middle" opacity="0.5">${slideNum}/${totalSlides}</text>
  </svg>`;
}

async function generateImage(filename, svgContent) {
  const outPath = path.join(ASSETS_DIR, filename);
  await sharp(Buffer.from(svgContent)).jpeg({ quality: 92 }).toFile(outPath);
  return `${GITHUB_RAW}/${filename}`;
}

function makeCarruselSlideImages(id, slides) {
  const urls = [];
  for (let i = 0; i < slides.length; i++) {
    const text = slides[i];
    const title = i === 0 ? id : undefined;
    const svg = makeSlideSVG(id, i + 1, slides.length, text, title);
    const filename = `${id}-${i + 1}.jpg`;
    const url = generateImage(filename, svg);
    urls.push({ filename, url, promise: url });
  }
  return urls;
}

async function processFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { id, tipo, contenido } = content;
  const caption = contenido.caption || "";
  const cta = "Diagnóstico gratis → nexoia.cali@gmail.com";

  const images = [];

  if (tipo === "story" || tipo === "reel") {
    const url = await generateImage(`${id}.jpg`, makeStorySVG(id, caption, id, "Diagnóstico gratis"));
    images.push(url);
  } else if (tipo === "carrusel") {
    const slides = contenido.carrusel_slides || [caption];
    for (let i = 0; i < slides.length; i++) {
      const title = i === 0 ? id : undefined;
      const url = await generateImage(`${id}-${i + 1}.jpg`, makeSlideSVG(id, i + 1, slides.length, slides[i], title));
      images.push(url);
    }
  } else {
    const subtitle = contenido.visual?.descripcion?.substring(0, 50) || "";
    const url = await generateImage(`${id}.jpg`, makePostSVG(id, caption, subtitle, cta));
    images.push(url);
  }

  content.image_url = images[0];
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`  ${id} → ${images.length} imagen(es)`);
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith(".json") && f.startsWith("post-1") || f.startsWith("carrusel-1") || f.startsWith("story-1") || f.startsWith("reel-1"));
  for (const f of files) {
    console.log(`\n${f}`);
    await processFile(path.join(PENDING_DIR, f));
  }
  console.log("\nDone");
}

main().catch(console.error);
