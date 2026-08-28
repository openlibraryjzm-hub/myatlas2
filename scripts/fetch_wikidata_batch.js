import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeTag(val) {
  if (!val) return null;
  let s = val.trim().toLowerCase();
  s = s.replace(/[()[\]'""]/g, '');
  s = s.replace(/[\s-]+/g, '_');
  s = s.replace(/[^a-z0-9_]/g, '');
  s = s.replace(/^_+|_+$/g, '');
  return s || null;
}

function getEraTagValue(startDateStr) {
  if (!startDateStr) return "historical";
  try {
    const yearMatch = startDateStr.match(/-?\d+/);
    if (!yearMatch) return "historical";
    const year = parseInt(yearMatch[0], 10);
    if (year < 500) return "antiquity";
    if (year < 1500) return "middle_ages";
    if (year < 1800) return "early_modern";
    if (year < 1900) return "19th_century";
    if (year < 2000) return "20th_century";
    return "21st_century";
  } catch (e) {
    return "historical";
  }
}

function sanitizeCreatedIso(startDateStr) {
  if (!startDateStr) return new Date().toISOString();
  const trimmed = startDateStr.trim();
  if (trimmed.startsWith('-')) {
    return new Date().toISOString();
  }
  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function formatCommonsUrl(rawUrl, width = 400) {
  if (!rawUrl) return null;
  let filename = rawUrl;
  if (filename.includes('/FilePath/')) {
    filename = filename.split('/FilePath/').pop();
  } else if (filename.includes('/File:')) {
    filename = filename.split('/File:').pop();
  } else {
    filename = filename.split('/').pop();
  }
  try {
    filename = decodeURIComponent(filename);
  } catch(e) {}
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

function getFileExtension(rawUrl) {
  if (!rawUrl) return null;
  try {
    const filename = rawUrl.split('?')[0].split('/FilePath/').pop().split('/File:').pop();
    const extMatch = filename.match(/\.([a-z0-9]+)$/i);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  } catch(e) {}
  return null;
}

async function fetchWikidataBatch(rootQid = 'Q198', limit = 50, outputFile = 'import/wikifolio_50_batch1_conflicts.json') {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const uploadTag = `meta:upload:${dateStr}_${timeStr}`;

  const sparqlQuery = `
  SELECT DISTINCT 
    ?item 
    ?itemLabel 
    ?itemDescription 
    ?sitelink 
    ?startDate 
    ?image
    (GROUP_CONCAT(DISTINCT ?classLabel; separator="|") AS ?classes)
    (GROUP_CONCAT(DISTINCT ?countryLabel; separator="|") AS ?countries)
    (GROUP_CONCAT(DISTINCT ?locationLabel; separator="|") AS ?locations)
    (GROUP_CONCAT(DISTINCT ?participantLabel; separator="|") AS ?participants)
    (GROUP_CONCAT(DISTINCT ?partOfLabel; separator="|") AS ?partOfs)
  WHERE {
    ?item wdt:P31/wdt:P279* wd:${rootQid} .

    ?sitelink schema:about ?item ;
              schema:isPartOf <https://en.wikipedia.org/> .

    OPTIONAL { ?item wdt:P18 ?image . }
    OPTIONAL { ?item wdt:P31 ?class . ?class rdfs:label ?classLabel . FILTER(LANG(?classLabel) = "en") }
    OPTIONAL { ?item wdt:P17 ?country . ?country rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }
    OPTIONAL { ?item wdt:P276 ?location . ?location rdfs:label ?locationLabel . FILTER(LANG(?locationLabel) = "en") }
    OPTIONAL { ?item wdt:P710 ?participant . ?participant rdfs:label ?participantLabel . FILTER(LANG(?participantLabel) = "en") }
    OPTIONAL { ?item wdt:P361 ?partOf . ?partOf rdfs:label ?partOfLabel . FILTER(LANG(?partOfLabel) = "en") }
    OPTIONAL { ?item wdt:P580 ?startDate . }
    OPTIONAL { ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en") }
    OPTIONAL { ?item schema:description ?itemDescription . FILTER(LANG(?itemDescription) = "en") }
  }
  GROUP BY ?item ?itemLabel ?itemDescription ?sitelink ?startDate ?image
  LIMIT ${limit}
  `;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

  console.log(`Querying Wikidata SPARQL endpoint for root entity ${rootQid} with P18 images (limit: ${limit})...`);

  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'WikiAtlasBot/1.0 (https://github.com/redditbooru; user@example.com)',
        'Accept': 'application/sparql-results+json'
      }
    };

    https.get(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.error(`HTTP Status ${res.statusCode}: ${body}`);
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const data = JSON.parse(body);
          const bindings = data.results?.bindings || [];
          console.log(`Retrieved ${bindings.length} entities from Wikidata.`);

          const items = [];
          const defaultLogo = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Wikipedia-logo-v2-en.svg";

          bindings.forEach((b, index) => {
            const itemUri = b.item?.value || '';
            const qid = itemUri.split('/').pop() || `Q${index}`;
            const title = b.itemLabel?.value || qid;
            const description = b.itemDescription?.value || `Wikidata entity ${qid}`;
            const sitelink = b.sitelink?.value || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
            const startDate = b.startDate?.value || '';
            const rawImg = b.image?.value || null;

            const thumbnailUrl = rawImg ? formatCommonsUrl(rawImg, 400) : defaultLogo;
            const highResUrl = rawImg ? formatCommonsUrl(rawImg, 1000) : defaultLogo;
            const imgExt = rawImg ? getFileExtension(rawImg) : 'svg';

            // State 1: Entity Name + QID in brackets
            const normTitle = normalizeTag(title) || 'entity';
            const state1Tag = `qid:${normTitle}_(${qid.toLowerCase()})`;

            const tags = [
              state1Tag,
              `era:${getEraTagValue(startDate)}`
            ];

            // State 2: Entities & Relations
            (b.countries?.value || '').split('|').forEach(c => {
              const norm = normalizeTag(c);
              if (norm) tags.push(`country:${norm}`);
            });

            (b.locations?.value || '').split('|').forEach(c => {
              const norm = normalizeTag(c);
              if (norm) tags.push(`location:${norm}`);
            });

            (b.participants?.value || '').split('|').forEach(c => {
              const norm = normalizeTag(c);
              if (norm) tags.push(`participant:${norm}`);
            });

            // State 3: Super-Structures & Domains (NO hardcoded flairs)
            (b.partOfs?.value || '').split('|').forEach(c => {
              const norm = normalizeTag(c);
              if (norm) tags.push(`part_of:${norm}`);
            });

            (b.classes?.value || '').split('|').forEach(c => {
              const norm = normalizeTag(c);
              if (norm && norm !== 'entity' && norm !== 'wikibase_item') tags.push(`class:${norm}`);
            });

            // State 4: System Metadata & File Extensions ONLY
            tags.push('meta:atlas:wikiatlas');
            tags.push(`meta:qid:${qid}`);
            tags.push(uploadTag);
            if (rawImg) {
              tags.push('meta:format:image');
            }
            if (imgExt) {
              tags.push(`meta:extension:${imgExt}`);
            }

            const uniqueTags = Array.from(new Set(tags));

            items.push({
              title: title,
              subreddit: 'wikiatlas',
              author: `Wikidata ${qid}`,
              score: 1000 + index,
              width: 600,
              height: 400,
              created_iso: sanitizeCreatedIso(startDate),
              url: highResUrl,
              thumbnail: thumbnailUrl,
              permalink: sitelink,
              derivedTags: uniqueTags,
              colorTheme: {
                bg: '#f8f9fa',
                text: '#202122',
                accent: '#3366cc',
                description: description
              }
            });
          });

          if (outputFile) {
            const fullPath = path.resolve(outputFile);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, JSON.stringify(items, null, 2), 'utf-8');
            console.log(`Successfully saved ${items.length} items to ${outputFile}`);
          }

          resolve(items);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

const args = process.argv.slice(2);
let qid = 'Q198';
let limit = 50;
let out = 'import/wikifolio_50_batch1_conflicts.json';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--qid' && args[i + 1]) qid = args[++i];
  if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[++i], 10);
  if (args[i] === '--out' && args[i + 1]) out = args[++i];
}

fetchWikidataBatch(qid, limit, out).catch(err => {
  console.error("Error executing fetch:", err);
  process.exit(1);
});
