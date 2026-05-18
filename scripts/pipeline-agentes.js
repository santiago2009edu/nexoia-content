/*
 * PIPELINE NEXOIA — 5 AGENTES (al estilo N8N)
 *
 * Agente 1: Investigación — temas y tendencias para Cali
 * Agente 2: Redacción — guiones y captions personalizados
 * Agente 3: Diseño — imágenes con sharp + paletas
 * Agente 4: Queue — prepara archivos para aprobación
 * Agente 5: Publicación — GitHub push + trigger workflow
 *
 * Uso: node scripts/pipeline-agentes.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PENDING_DIR = "content/pending";
const ASSETS_DIR = "assets";

// ─── CONFIG ───────────────────────────────────────────────
const INDUSTRIES = [
  { id: "rest", label: "Restaurantes", hashtag: "RestaurantesCali", emoji: "🍽️" },
  { id: "pelu", label: "Peluquerías", hashtag: "PeluqueriasCali", emoji: "✂️" },
  { id: "clin", label: "Consultorios", hashtag: "ConsultoriosCali", emoji: "🏥" },
  { id: "tiend", label: "Tiendas", hashtag: "TiendasCali", emoji: "👗" },
  { id: "tips", label: "Tips generales", hashtag: "MarketingCali", emoji: "💡" },
];

const CONTENT_TYPES = ["post", "story", "carrusel", "reel"];
const DAYS_AHEAD = 30;
const PALETTES = [
  ["#06100A", "#4DBA87", "#EFF9F4"],
  ["#0A1628", "#1E90FF", "#E8F4FD"],
  ["#1A0A0A", "#E05252", "#FDE8E8"],
  ["#1A1628", "#E8A838", "#FDF4E0"],
  ["#0D1F13", "#4DBA87", "#EFF9F4"],
];

// ─── AGENTE 1: INVESTIGACIÓN ───────────────────────────────
// Genera topics para cada industria basado en tendencias
function agent1_research() {
  const topics = {
    rest: [
      "Por qué tu restaurante necesita Instagram",
      "Fotos de comida que venden",
      "Promociones semanales que funcionan",
      "Clientes felices = mejores clientes",
      "El plato del día en historias",
      "Detrás de cámaras de tu cocina",
      "Opiniones de clientes en Google",
      "Horarios y ubicación siempre visibles",
    ],
    pelu: [
      "Antes y después que impactan",
      "Tips de cuidado del cabello",
      "Promociones para días lentos",
      "Clientas satisfechas etiquetan",
      "Tendencias de cortes 2026",
      "Productos que usamos",
      "Cómo cuidar el color en casa",
      "Galería de trabajos realizados",
    ],
    clin: [
      "Contenido educativo que genera confianza",
      "Mitología vs ciencia médica",
      "Testimonios de pacientes reales",
      "Cómo prepararse para tu cita",
      "Prevención y cuidados básicos",
      "Nuestro equipo profesional",
      "FAQ de pacientes nuevos",
      "Google Business Profile para doctores",
    ],
    tiend: [
      "Nuevos productos de la semana",
      "Cómo combinar outfits",
      "Ofertas por tiempo limitado",
      "Clientes muestran sus compras",
      "Detrás del negocio familiar",
      "Tendencias de moda en Cali",
      "Envíos a toda la ciudad",
      "Catálogo virtual interactivo",
    ],
    tips: [
      "Algoritmo de Instagram explicado",
      "Hashtags locales vs globales",
      "Mejores horas para publicar",
      "Por qué la consistencia importa",
      "Errores comunes en redes",
      "Cómo google afecta tu negocio",
      "IA para pequeños negocios",
      "Presupuesto de marketing para PyMEs",
    ],
  };
  return topics;
}

// ─── AGENTE 2: REDACCIÓN ─────────────────────────────────
function agent2_write(industry, topic, idx) {
  const caps = {
    rest: `${topic} 🍽️\n\nEn Cali, la competencia gastronómica es enorme. Si no estás en redes, no existes para tus clientes.\n\nCon NexoIA:\n✅ Contenido diario para tu restaurante\n✅ Fotos profesionales con IA\n✅ Clientes que llegan por Instagram\n\nDiagnóstico gratis → un mes de prueba.`,
    pelu: `${topic} ✂️\n\nTu talento merece ser visto. Cada corte, cada color, cada cliente satisfecho.\n\nNexoIA automatiza tu contenido para que siempre tengas presencia profesional en Instagram.\n\n📸 Galería automática\n💬 Respuestas a clientes\n📅 Posts diarios sin esfuerzo`,
    clin: `${topic} 🏥\n\nLa confianza empieza en redes. Tus pacientes buscan información antes de agendar.\n\nCon NexoIA:\n📚 Contenido educativo automático\n⭐ Testimonios visibles\n🔍 Google + Instagram sincronizados`,
    tiend: `${topic} 👗\n\nTu tienda merece estar en la mira de Cali. Productos nuevos, ofertas, novedades.\n\nNexoIA publica por ti:\n🛍️ Catálogo digital\n📢 Promociones automáticas\n📦 Clientes que compran por redes`,
    tips: `${topic} 💡\n\nInformación que todo negocio en Cali debería saber.\n\nNexoIA te ayuda a aplicar estas estrategias sin que seas experto en marketing.\n\n🤖 Automatización inteligente\n📊 Resultados medibles\n📱 Presencia 24/7`,
  };

  const base = new Date("2026-05-17");
  const d = new Date(base);
  d.setDate(d.getDate() + idx);

  const hashes = [
    `#${INDUSTRIES.find(i => i.id === industry).hashtag}`,
    "#NexoIA", "#CaliColombia", "#AutomatizacionIA",
    "#MarketingDigital", "#EmprendeCali", "#Cali",
  ];

  const caption = caps[industry] || `${topic}\n\nNexoIA — automatización con IA para negocios en Cali.`;

  return {
    id: `${industry}-${String(idx + 1).padStart(3, "0")}`,
    tipo: idx % 4 === 0 ? "carrusel" : idx % 7 === 0 ? "reel" : idx % 3 === 0 ? "story" : "post",
    fecha_generacion: "2026-05-17",
    fecha_propuesta_publicacion: d.toISOString().split("T")[0],
    hora_propuesta: `${8 + (idx % 10)}:00`,
    estado: "pending",
    caption: caption,
    contenido: {
      caption: caption,
      hashtags: hashes,
      visual: {
        descripcion: `${topic} — diseño profesional con colores de la industria`,
        tamano: idx % 3 === 0 ? "1080x1920 (9:16)" : "1080x1080 (1:1)",
      },
    },
  };
}

// ─── AGENTE 3: DISEÑO ────────────────────────────────────
function agent3_design(item, palette) {
  const W = 1080, H = item.tipo === "story" || item.tipo === "reel" ? 1920 : 1080;
  const lines = item.caption.substring(0, 120).split("\n").filter(l => l.trim());
  const lineH = 65;
  const startY = H * 0.45 - lines.length * lineH * 0.3;

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${palette[0]}"/>
        <stop offset="100%" style="stop-color:${palette[0]}dd"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="${W*0.5}" cy="${H*0.5}" r="${H*0.5}" fill="${palette[1]}" opacity="0.04"/>
    <text x="${W*0.5}" y="80" font-family="sans-serif" font-size="12" fill="${palette[1]}" text-anchor="middle" opacity="0.5" letter-spacing="6">NEXO IA · CALI</text>
    ${lines.slice(0, 5).map((l, i) =>
      `<text x="${W*0.5}" y="${startY + i * lineH}" font-family="Georgia,serif" font-size="${lines.length > 4 ? 32 : 40}" fill="${palette[2]}" text-anchor="middle" font-weight="bold">${l.substring(0, 40)}</text>`
    ).join("\n")}
    <text x="${W*0.5}" y="${H - 60}" font-family="sans-serif" font-size="14" fill="${palette[1]}" text-anchor="middle" opacity="0.5">nexoia.cali@gmail.com</text>
  </svg>`;

  const ext = item.tipo === "carrusel" ? "-1" : "";
  const filename = `${item.id}${ext}.jpg`;
  return { filename, svg };
}

// ─── AGENTE 4: QUEUE ────────────────────────────────────
async function agent4_queue(items) {
  if (!fs.existsSync(PENDING_DIR)) fs.mkdirSync(PENDING_DIR, { recursive: true });
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

  for (const item of items) {
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const design = agent3_design(item, palette);

    // Generate image
    const outPath = path.join(ASSETS_DIR, design.filename);
    await sharp(Buffer.from(design.svg)).jpeg({ quality: 90 }).toFile(outPath);
    item.image_url = `https://raw.githubusercontent.com/santiago2009edu/nexoia-content/main/assets/${design.filename}`;

    // Write JSON
    const jsonPath = path.join(PENDING_DIR, `${item.id}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(item, null, 2));
    console.log(`  ✅ ${item.id} (${item.tipo}) — ${item.fecha_propuesta_publicacion}`);
  }
  return items;
}

async function main() {
  console.log("=".repeat(50));
  console.log("PIPELINE NEXOIA — 5 AGENTES");
  console.log("=".repeat(50));

  // Agent 1: Research
  console.log("\n🔍 Agente 1: Investigación");
  const topics = agent1_research();
  console.log(`  ${Object.values(topics).flat().length} temas generados`);

  // Agent 2: Writing
  console.log("\n✍️  Agente 2: Redacción");
  let allItems = [];
  for (const ind of INDUSTRIES) {
    const indTopics = topics[ind.id];
    indTopics.forEach((t, i) => {
      allItems.push(agent2_write(ind.id, t, i));
    });
  }
  console.log(`  ${allItems.length} contenidos escritos`);

  // Agent 4: Queue (includes Agent 3 design inside)
  console.log("\n🎨 Agente 3: Diseño + 📦 Agente 4: Queue");
  const queued = await agent4_queue(allItems);
  console.log(`\n  ${queued.length} contenidos generados en ${PENDING_DIR}/`);

  // Agent 5: Publish — user approves from dashboard, workflow does the rest
  console.log("\n🚀 Agente 5: Publicación");
  console.log("  Pendiente de aprobación en el dashboard");
  console.log("  https://santiago2009edu.github.io/nexoia-content/");

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Pipeline completado");
  console.log(`  ${queued.length} archivos en content/pending/`);
  console.log(`  ${queued.length} imágenes en assets/`);
  console.log("  Esperando aprobación en dashboard...");
  console.log("=".repeat(50));
}

main().catch(console.error);
