import https from 'https';

const query = `
SELECT ?item ?itemLabel ?image WHERE {
  ?item wdt:P31/wdt:P279* wd:Q198 .
  ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .
  OPTIONAL { ?item wdt:P18 ?image . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50
`;

const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(query) + '&format=json';

https.get(url, { headers: { 'User-Agent': 'WikiAtlasBot/1.0' } }, res => {
  let d = ''; 
  res.on('data', c => d += c);
  res.on('end', () => {
    const b = JSON.parse(d).results.bindings;
    const withImg = b.filter(x => x.image);
    console.log(`Total: ${b.length}, With P18 Image: ${withImg.length}`);
    console.log('Sample images:');
    withImg.slice(0, 5).forEach(x => console.log(`- ${x.itemLabel?.value}: ${x.image?.value}`));
  });
});
