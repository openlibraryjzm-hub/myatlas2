import os
import re
import sys
import time
import json
import urllib.request
import urllib.parse
from pathlib import Path

"""
TF2 Wiki Targeted Media Downloader
Downloads official hero renders & showcases for:
 - Weapons (Category:Weapons)
 - Cosmetics (Category:Cosmetic items)
 - Maps (Category:Maps)

Usage:
 python download_tf2_wiki_media.py --type=weapons
 python download_tf2_wiki_media.py --type=cosmetics
 python download_tf2_wiki_media.py --type=maps
 python download_tf2_wiki_media.py --type=all
"""

API_URL = "https://wiki.teamfortress.com/w/api.php"
USER_AGENT = "MyAtlasImporter/1.0 (TF2 Wiki Offline Archiver)"
BATCH_DELAY_SEC = 0.3
FILE_DELAY_SEC = 0.05

CATEGORIES = {
    "weapons": {"category": "Weapons", "folder": Path("./tf2_downloads/weapons")},
    "cosmetics": {"category": "Cosmetic items", "folder": Path("./tf2_downloads/cosmetics")},
    "maps": {"category": "Maps", "folder": Path("./tf2_downloads/maps")}
}

def sanitize_filename(filename: str) -> str:
    name = filename.strip()
    if name.startswith("File:"):
        name = name[5:]
    return re.sub(r'[\\/:*?"<>|]', '_', name).strip()

def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def download_file(url: str, dest_path: Path):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req) as resp, open(dest_path, "wb") as f:
        f.write(resp.read())

def resolve_file_urls(file_titles: list) -> dict:
    url_map = {}
    for i in range(0, len(file_titles), 50):
        chunk = file_titles[i:i+50]
        titles_param = "|".join([f"File:{t}" if not t.startswith("File:") else t for t in chunk])
        params = urllib.parse.urlencode({
            "action": "query",
            "titles": titles_param,
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json"
        })
        data = fetch_json(f"{API_URL}?{params}")
        pages = data.get("query", {}).get("pages", {}).values()
        for p in pages:
            info = p.get("imageinfo", [])
            if info and "url" in info[0]:
                url_map[p["title"]] = info[0]["url"]
    return url_map

def process_category(cat_key: str, cat_config: dict):
    folder = cat_config["folder"]
    folder.mkdir(parents=True, exist_ok=True)
    print(f"\n==================================================")
    print(f"🚀 Starting extraction for [{cat_key.upper()}]")
    print(f"📁 Saving to: {folder.resolve()}")
    print(f"==================================================\n")

    gcmcontinue = ""
    total_found = 0
    total_downloaded = 0
    total_skipped = 0
    batch_num = 1

    while True:
        params_dict = {
            "action": "query",
            "generator": "categorymembers",
            "gcmtitle": f"Category:{cat_config['category']}",
            "gcmlimit": "50",
            "gcmtype": "page",
            "prop": "revisions",
            "rvprop": "content",
            "format": "json"
        }
        if gcmcontinue:
            params_dict["gcmcontinue"] = gcmcontinue

        params = urllib.parse.urlencode(params_dict)
        print(f"🔍 Fetching category batch #{batch_num}...")
        data = fetch_json(f"{API_URL}?{params}")
        pages = list(data.get("query", {}).get("pages", {}).values())

        if not pages:
            break

        page_image_map = []
        for p in pages:
            text = p.get("revisions", [{}])[0].get("*", "")
            match = re.search(r'\|\s*(?:image|map-image)\s*=\s*([^|\r\n}]+)', text, re.IGNORECASE)
            if match and match.group(1):
                raw_img = match.group(1).strip()
                if raw_img and "<!--" not in raw_img:
                    page_image_map.append({"pageTitle": p["title"], "fileTitle": raw_img})

        total_found += len(page_image_map)

        if page_image_map:
            file_titles = [item["fileTitle"] for item in page_image_map]
            url_map = resolve_file_urls(file_titles)

            for item in page_image_map:
                full_title = f"File:{item['fileTitle']}" if not item['fileTitle'].startswith("File:") else item['fileTitle']
                file_url = url_map.get(full_title)

                if not file_url:
                    continue

                ext = Path(urllib.parse.urlparse(file_url).path).suffix or ".png"
                safe_title = sanitize_filename(item["pageTitle"])
                dest_path = folder / f"{safe_title}{ext}"

                if dest_path.exists():
                    total_skipped += 1
                    continue

                try:
                    download_file(file_url, dest_path)
                    total_downloaded += 1
                    print(f"  [+] Saved: {safe_title}{ext}")
                    time.sleep(FILE_DELAY_SEC)
                except Exception as err:
                    print(f"  [!] Failed downloading {safe_title}{ext}: {err}")

        cont = data.get("continue", {})
        if "gcmcontinue" in cont:
            gcmcontinue = cont["gcmcontinue"]
            batch_num += 1
            time.sleep(BATCH_DELAY_SEC)
        else:
            break

    print(f"\n--- {cat_key.upper()} Summary ---")
    print(f"Found item pages: {total_found}")
    print(f"Downloaded: {total_downloaded}")
    print(f"Skipped (already exists): {total_skipped}")

def main():
    target = "all"
    for arg in sys.argv[1:]:
        if arg.startswith("--type="):
            target = arg.split("=")[1].lower()

    keys = list(CATEGORIES.keys()) if target == "all" else [target]
    for key in keys:
        if key in CATEGORIES:
            process_category(key, CATEGORIES[key])
        else:
            print(f"Unknown type '{key}'. Options: --type=weapons, --type=cosmetics, --type=maps, --type=all")

    print("\n🎉 Finished processing targeted TF2 Wiki downloads!")

if __name__ == "__main__":
    main()
