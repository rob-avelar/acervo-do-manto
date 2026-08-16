#!/usr/bin/env node
// Scraper do catálogo Yupoo (fornecedor 13288233939) → prisma/seed-store.ts
//
// Uso:
//   node scripts/scrape-catalog.mjs
//
// Busca as 47 páginas da galeria, classifica cada álbum como camisa
// (categoria / preço / tamanhos), pula itens que não são camisas
// (shorts, meias, jaquetas, agasalhos, polos, patches...), remove
// duplicados por ID de álbum e gera prisma/seed-store.ts completo.
//
// Requer Node.js 18+ (usa fetch nativo). Sem dependências externas.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const USER = '13288233939';
const BASE = `https://${USER}.x.yupoo.com`;
const TOTAL_PAGES = 47;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// 1. Buscar + parsear as páginas
// ---------------------------------------------------------------------------

function unescapeHtml(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&#x3D;/g, '=')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function fetchPage(page) {
  const url = `${BASE}/albums?tab=gallery&page=${page}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === 4) throw err;
      const wait = 2000 * 2 ** (attempt - 1);
      console.warn(`  página ${page} falhou (${err.message}); retry em ${wait}ms`);
      await sleep(wait);
    }
  }
}

function parseAlbums(html) {
  const re =
    /<a\s+class="album__main"\s+title="(.*?)"\s+href="\/albums\/(\d+)\?uid=1"[\s\S]*?src="https:\/\/photo\.yupoo\.com\/13288233939\/([0-9a-f]+)\//g;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ title: unescapeHtml(m[1]).trim(), id: m[2], hash: m[3] });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2. Classificação
// ---------------------------------------------------------------------------

// Itens que NÃO são camisas — pular.
const SKIP_RE =
  /\b(shorts|socks|jacket|windbreaker|tracksuit|training suit|training pants|pants|vest|polo|patch|scarf|beanie|hat|cap|gloves|bag|backpack|boot|shoe)\b/i;

// Seleções nacionais conhecidas (para categoria NATIONAL_TEAM).
const NATIONS = new Set(
  [
    'Brazil','Argentina','Spain','France','Germany','England','Portugal','Netherlands',
    'Croatia','Belgium','Switzerland','Norway','Austria','Scotland','Algeria','Morocco',
    'Tunisia','South Africa','Senegal','Ghana','Egypt','Cape Verde','Ivory Coast',
    'Colombia','Ecuador','Uruguay','Paraguay','Japan','South Korea','Australia',
    'Saudi Arabia','Iran','Jordan','Qatar','Uzbekistan','Panama','Haiti','Curacao',
    'New Zealand','Bosnia','Czech Republic','Turkiye','Sweden','Congo','DR Congo','Iraq',
    'Mexico','USA','Canada','Italy','Ireland','Wales','Bolivia','Chile','Peru','Venezuela',
    'Nigeria','Cameroon','Jamaica','Denmark','Poland','Serbia','Greece','Ukraine','Russia',
    'Springbok','Basque Country',
  ].map((s) => s.toLowerCase()),
);

const KIDS_SIZES = ['16', '18', '20', '22', '24', '26', '28'];
const SIZES_STD = ['P', 'M', 'G', 'GG', '3G', '4G', '5G'];
const SIZES_PV = ['P', 'M', 'G', 'GG', '3G'];

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Extrai o nome do time: parte antes do primeiro token de temporada/keyword.
function extractTeam(title) {
  const stop =
    /\s+(\d{2}-\d{2}|\d{4}|20\d{2}|World Cup|Retro|Home|Away|Third|Fourth|Special|Pre-?Match|Anniversary|Terrace|Concept|Lifestyle|Player|Goalkeeper|Long Sleeve|Kids|Women|Originals|Balompié|Crop Top|x )/i;
  const idx = title.search(stop);
  let team = idx > 0 ? title.slice(0, idx) : title;
  return team.replace(/\s+/g, ' ').trim() || title.trim();
}

// Detecta temporada tipo "26-27", "2025/26", "95-96", "2026".
function extractSeason(title) {
  const m1 = title.match(/\b(\d{2})-(\d{2})\b/);
  if (m1) return `20${m1[1]}/${m1[2]}`;
  const m2 = title.match(/\b(20\d{2})\b/);
  if (m2) return m2[1];
  return '';
}

function classify(title) {
  const t = title.toLowerCase();
  const isRetro = /\bretro\b/.test(t);
  const isKids = /\bkids\b/.test(t) || /16-28/.test(title);
  const isWomen = /\bwomen/.test(t);
  const isPlayer = /player version/.test(t);
  const team = extractTeam(title);
  const isNation = NATIONS.has(team.toLowerCase());
  const isLimited =
    /\b(special|anniversary|terrace icons|concept|lifestyle|originals|x )/i.test(title);

  let category;
  if (isRetro) category = 'RETRO';
  else if (isNation) category = 'NATIONAL_TEAM';
  else if (isLimited) category = 'LIMITED';
  else category = 'CLUB';

  let priceCents = 17990; // padrão R$179,90
  if (isRetro) priceCents = 18990; // retrô R$189,90
  if (isPlayer) priceCents = 21990; // versão jogador R$219,90

  let sizes;
  if (isKids) sizes = KIDS_SIZES;
  else if (isWomen) sizes = 'SIZES_PV';
  else if (isRetro) sizes = 'SIZES_PV';
  else if (isPlayer) sizes = 'SIZES_PV';
  else sizes = 'SIZES_STD';

  const tags = [slugify(team)];
  if (isRetro) tags.push('retro');
  if (isNation) tags.push('national-team');
  if (isKids) tags.push('kids');
  if (isWomen) tags.push('womens');
  if (isPlayer) tags.push('player-version');
  if (/world cup/i.test(title)) tags.push('world-cup-2026');
  if (/home/i.test(title)) tags.push('home');
  else if (/away/i.test(title)) tags.push('away');

  return { category, priceCents, sizes, team, tags: [...new Set(tags)] };
}

function jsArr(arr) {
  return `[${arr.map((s) => `'${s.replace(/'/g, "\\'")}'`).join(', ')}]`;
}

// Países (seleções) em português — para nome e teamName.
const COUNTRY_PT = {
  Brazil: 'Brasil', Spain: 'Espanha', Germany: 'Alemanha', England: 'Inglaterra',
  France: 'França', Italy: 'Itália', Mexico: 'México', Netherlands: 'Holanda',
  Croatia: 'Croácia', Belgium: 'Bélgica', Switzerland: 'Suíça', Norway: 'Noruega',
  Austria: 'Áustria', Scotland: 'Escócia', Algeria: 'Argélia', Morocco: 'Marrocos',
  Tunisia: 'Tunísia', 'South Africa': 'África do Sul', Senegal: 'Senegal', Ghana: 'Gana',
  Egypt: 'Egito', 'Cape Verde': 'Cabo Verde', 'Ivory Coast': 'Costa do Marfim',
  Colombia: 'Colômbia', Ecuador: 'Equador', Uruguay: 'Uruguai', Paraguay: 'Paraguai',
  Japan: 'Japão', 'South Korea': 'Coreia do Sul', Australia: 'Austrália',
  'Saudi Arabia': 'Arábia Saudita', Iran: 'Irã', Jordan: 'Jordânia', Qatar: 'Catar',
  Uzbekistan: 'Uzbequistão', Panama: 'Panamá', Haiti: 'Haiti', Curacao: 'Curaçao',
  'New Zealand': 'Nova Zelândia', Bosnia: 'Bósnia', 'Czech Republic': 'República Tcheca',
  Turkiye: 'Turquia', Sweden: 'Suécia', Congo: 'Congo', 'DR Congo': 'RD Congo',
  Iraq: 'Iraque', USA: 'Estados Unidos', Canada: 'Canadá', Ireland: 'Irlanda',
  Wales: 'País de Gales', Bolivia: 'Bolívia', Chile: 'Chile', Peru: 'Peru',
  Venezuela: 'Venezuela', Nigeria: 'Nigéria', Cameroon: 'Camarões', Jamaica: 'Jamaica',
  Denmark: 'Dinamarca', Poland: 'Polônia', Serbia: 'Sérvia', Greece: 'Grécia',
  Ukraine: 'Ucrânia', Russia: 'Rússia', Portugal: 'Portugal', Argentina: 'Argentina',
};

function teamPt(team) {
  return COUNTRY_PT[team] ?? team;
}

// Substituições ordenadas (multi-palavra primeiro) para traduzir o título.
const NAME_REPLACEMENTS = [
  [/\bWorld Cup\b/gi, 'Copa do Mundo'],
  [/\bPlayer Version\b/gi, 'Versão Jogador'],
  [/\bLong Sleeve\b/gi, 'Manga Longa'],
  [/\bKids Kit\b/gi, 'Infantil'],
  [/\bPre[-\s]?Match\b/gi, 'Pré-Jogo'],
  [/\bGoalkeeper\b/gi, 'Goleiro'],
  [/\bWomen'?s?\b/gi, 'Feminina'],
  [/\bAnniversary\b/gi, 'Aniversário'],
  [/\bSpecial\b/gi, 'Especial'],
  [/\bConcept\b/gi, 'Conceito'],
  [/\bRetro\b/gi, 'Retrô'],
  [/\bHome\b/gi, 'Casa'],
  [/\bAway\b/gi, 'Fora'],
  [/\bThird\b/gi, 'Terceira'],
  [/\bFourth\b/gi, 'Quarta'],
  [/\bFootball Jersey\b/gi, ''],
  [/\bJersey\b/gi, ''],
];

// Monta o nome em português a partir do título em inglês.
function namePtFrom(title, isKids) {
  let s = title;
  // Remove sufixo de tamanho: "S-4XL", "S-XXL", "Size：16-28", etc.
  s = s.replace(/\s+(S-\d?XL|S-XXL|S-XL|Size\s*[:：]\s*[\d-]+)\s*$/i, '');
  // Temporadas: "2026-27" e "26-27" → "26/27"; "95-96" → "95/96"
  s = s.replace(/\b20(\d{2})-(\d{2})\b/g, '$1/$2');
  s = s.replace(/\b(\d{2})-(\d{2})\b/g, '$1/$2');
  // Traduz termos
  for (const [re, to] of NAME_REPLACEMENTS) s = s.replace(re, to);
  // Traduz nome de país no começo (seleções)
  for (const [en, pt] of Object.entries(COUNTRY_PT)) {
    s = s.replace(new RegExp(`^${en}\\b`), pt);
  }
  s = s.replace(/\s{2,}/g, ' ').trim();
  if (isKids) {
    s = s.replace(/\bInfantil\b/i, '').replace(/\s{2,}/g, ' ').trim();
    return `Kit Infantil ${s}`;
  }
  return `Camisa ${s}`;
}

// ---------------------------------------------------------------------------
// 3. Main
// ---------------------------------------------------------------------------

async function main() {
  const seen = new Map(); // id -> album
  console.log(`Buscando ${TOTAL_PAGES} páginas da galeria...`);
  for (let p = 1; p <= TOTAL_PAGES; p++) {
    const html = await fetchPage(p);
    const albums = parseAlbums(html);
    let added = 0;
    for (const a of albums) {
      if (!seen.has(a.id)) {
        seen.set(a.id, a);
        added++;
      }
    }
    console.log(`  página ${p}: ${albums.length} álbuns (${added} novos)`);
    await sleep(500); // educado com o servidor
  }

  const usedSlugs = new Set();
  const rows = [];
  let skipped = 0;
  for (const a of seen.values()) {
    if (SKIP_RE.test(a.title)) {
      skipped++;
      continue;
    }
    const c = classify(a.title);
    let slug = slugify(a.title);
    let base = slug;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);

    const season = extractSeason(a.title);
    const isKids = /16-28/.test(a.title) || /\bkids\b/i.test(a.title);
    const namePt = namePtFrom(a.title, isKids);
    const teamName = teamPt(c.team);
    const sizesExpr =
      typeof c.sizes === 'string' ? c.sizes : jsArr(c.sizes);

    rows.push(
      `  { slug: '${slug}', nameEn: ${JSON.stringify(a.title)}, nameNl: ${JSON.stringify(
        a.title,
      )}, namePt: ${JSON.stringify(namePt)}, teamName: ${JSON.stringify(
        teamName,
      )}, league: '', season: '${season}', category: ProductCategory.${c.category}, priceCents: ${c.priceCents}, comparePriceCents: 29990, images: [IMG('${a.hash}')], sizes: ${sizesExpr}, supplierRef: 'albums/${a.id}', supplierCost: 8700, featured: false, tags: ${jsArr(
        c.tags,
      )} },`,
    );
  }

  const header = `import { PrismaClient, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

const IMG = (hash: string) => \`https://photo.yupoo.com/13288233939/\${hash}/small.jpg\`;

const SIZES_STD = ['P', 'M', 'G', 'GG', '3G', '4G', '5G'];
const SIZES_PV = ['P', 'M', 'G', 'GG', '3G'];

const products = [
`;

  const footer = `];

async function main() {
  for (const p of products) {
    await prisma.storeProduct.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(\`Seeded \${products.length} store products\`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const out = header + rows.join('\n') + '\n' + footer;
  mkdirSync(join(ROOT, 'prisma'), { recursive: true });
  writeFileSync(join(ROOT, 'prisma', 'seed-store.ts'), out, 'utf-8');

  console.log(
    `\n✓ Gerado prisma/seed-store.ts com ${rows.length} camisas (${skipped} itens não-camisa pulados, de ${seen.size} álbuns únicos).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
