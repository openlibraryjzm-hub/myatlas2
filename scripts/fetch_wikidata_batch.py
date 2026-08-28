import os
import sys
import json
import argparse
import datetime
import urllib.parse
import urllib.request

def normalize_tag(val):
    if not val:
        return None
    val = val.strip().lower()
    # Remove quotes, brackets, parentheses
    val = val.replace('(', '').replace(')', '').replace('[', '').replace(']', '').replace("'", "").replace('"', '')
    # Replace spaces and hyphens with underscores
    val = val.replace(' ', '_').replace('-', '_')
    # Strip any remaining special characters
    val = ''.join(c for c in val if c.isalnum() or c == '_')
    val = val.strip('_')
    return val if val else None

def get_era_tag(start_date_str):
    if not start_date_str:
        return "meta:era:historical"
    try:
        # Format can be 1939-09-01T00:00:00Z or -0431-01-01
        year_str = start_date_str.split('T')[0].split('-')[0]
        if not year_str and start_date_str.startswith('-'):
            return "meta:era:antiquity"
        year = int(year_str)
        if year < 500:
            return "meta:era:antiquity"
        elif year < 1500:
            return "meta:era:middle_ages"
        elif year < 1800:
            return "meta:era:early_modern"
        elif year < 1900:
            return "meta:era:19th_century"
        elif year < 2000:
            return "meta:era:20th_century"
        else:
            return "meta:era:21st_century"
    except Exception:
        return "meta:era:historical"

def fetch_wikidata_batch(root_qid="Q198", limit=50, output_file=None):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%m-%s")
    
    sparql_query = f"""
    SELECT DISTINCT 
      ?item 
      ?itemLabel 
      ?itemDescription 
      ?sitelink 
      ?startDate 
      (GROUP_CONCAT(DISTINCT ?classLabel; separator="|") AS ?classes)
      (GROUP_CONCAT(DISTINCT ?countryLabel; separator="|") AS ?countries)
      (GROUP_CONCAT(DISTINCT ?locationLabel; separator="|") AS ?locations)
      (GROUP_CONCAT(DISTINCT ?participantLabel; separator="|") AS ?participants)
      (GROUP_CONCAT(DISTINCT ?partOfLabel; separator="|") AS ?partOfs)
    WHERE {{
      ?item wdt:P31/wdt:P279* wd:{root_qid} .

      ?sitelink schema:about ?item ;
                schema:isPartOf <https://en.wikipedia.org/> .

      OPTIONAL {{ ?item wdt:P31 ?class . ?class rdfs:label ?classLabel . FILTER(LANG(?classLabel) = "en") }}
      OPTIONAL {{ ?item wdt:P17 ?country . ?country rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }}
      OPTIONAL {{ ?item wdt:P276 ?location . ?location rdfs:label ?locationLabel . FILTER(LANG(?locationLabel) = "en") }}
      OPTIONAL {{ ?item wdt:P710 ?participant . ?participant rdfs:label ?participantLabel . FILTER(LANG(?participantLabel) = "en") }}
      OPTIONAL {{ ?item wdt:P361 ?partOf . ?partOf rdfs:label ?partOfLabel . FILTER(LANG(?partOfLabel) = "en") }}
      OPTIONAL {{ ?item wdt:P580 ?startDate . }}
      OPTIONAL {{ ?item rdfs:label ?itemLabel . FILTER(LANG(?itemLabel) = "en") }}
      OPTIONAL {{ ?item schema:description ?itemDescription . FILTER(LANG(?itemDescription) = "en") }}
    }}
    GROUP BY ?item ?itemLabel ?itemDescription ?sitelink ?startDate
    LIMIT {limit}
    """

    url = "https://query.wikidata.org/sparql"
    params = {
        "query": sparql_query,
        "format": "json"
    }
    encoded_params = urllib.parse.urlencode(params).encode('utf-8')

    req = urllib.request.Request(
        url + "?" + urllib.parse.urlencode(params),
        headers={
            "User-Agent": "WikiAtlasBot/1.0 (https://github.com/redditbooru; user@example.com)",
            "Accept": "application/sparql-results+json"
        }
    )

    print(f"Querying Wikidata SPARQL endpoint for root entity {root_qid} (limit: {limit})...")
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error querying Wikidata: {e}")
        return []

    bindings = data.get("results", {}).get("bindings", [])
    print(f"Retrieved {len(bindings)} entities from Wikidata.")

    items = []
    upload_tag = f"meta:upload:{timestamp}"

    for index, b in enumerate(bindings):
        item_uri = b.get("item", {}).get("value", "")
        qid = item_uri.split('/')[-1] if item_uri else f"Q{index}"
        
        title = b.get("itemLabel", {}).get("value", qid)
        description = b.get("itemDescription", {}).get("value", f"Wikidata entity {qid}")
        sitelink = b.get("sitelink", {}).get("value", f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title)}")
        start_date = b.get("startDate", {}).get("value", "")

        tags = [
            "meta:atlas:wikiatlas",
            f"meta:qid:{qid}",
            upload_tag,
            get_era_tag(start_date),
            "flair:history",
            "flair:military"
        ]

        # Extract pipe-separated properties
        for raw_cls in b.get("classes", {}).get("value", "").split('|'):
            norm = normalize_tag(raw_cls)
            if norm and norm not in ['entity', 'wikibase_item']:
                tags.append(f"class:{norm}")

        for raw_country in b.get("countries", {}).get("value", "").split('|'):
            norm = normalize_tag(raw_country)
            if norm:
                tags.append(f"country:{norm}")

        for raw_loc in b.get("locations", {}).get("value", "").split('|'):
            norm = normalize_tag(raw_loc)
            if norm:
                tags.append(f"location:{norm}")

        for raw_part in b.get("participants", {}).get("value", "").split('|'):
            norm = normalize_tag(raw_part)
            if norm:
                tags.append(f"participant:{norm}")

        for raw_po in b.get("partOfs", {}).get("value", "").split('|'):
            norm = normalize_tag(raw_po)
            if norm:
                tags.append(f"part_of:{norm}")

        # Deduplicate while preserving order
        unique_tags = []
        for t in tags:
            if t not in unique_tags:
                unique_tags.append(t)

        item_obj = {
            "title": title,
            "subreddit": "wikiatlas",
            "author": f"Wikidata {qid}",
            "score": 1000 + index,
            "width": 600,
            "height": 400,
            "created_iso": start_date if start_date else "2026-08-16T00:00:00.000Z",
            "url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Wikipedia-logo-v2-en.svg",
            "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Wikipedia-logo-v2-en.svg",
            "permalink": sitelink,
            "derivedTags": unique_tags,
            "colorTheme": {
                "bg": "#f8f9fa",
                "text": "#202122",
                "accent": "#3366cc",
                "description": description
            }
        }
        items.append(item_obj)

    if output_file:
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved {len(items)} items to {output_file}")

    return items

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch Wikidata entity batch for WikiAtlas")
    parser.add_argument("--qid", default="Q198", help="Root QID entity (default: Q198 War)")
    parser.add_argument("--limit", type=int, default=50, help="Number of items to fetch (default: 50)")
    parser.add_argument("--out", default="import/wikifolio_50_batch1_conflicts.json", help="Output JSON file path")

    args = parser.parse_args()
    fetch_wikidata_batch(args.qid, args.limit, args.out)
