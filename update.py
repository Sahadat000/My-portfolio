import json
import os
import urllib.request
from datetime import datetime, timezone

TOKEN = os.environ["GH_TOKEN"]
TOPIC = "portfolio"


def api(url):
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + TOKEN,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


repos = []
page = 1
while True:
    batch = api(
        "https://api.github.com/user/repos?per_page=100&affiliation=owner&sort=pushed&page=%d" % page
    )
    if not batch:
        break
    repos.extend(batch)
    page += 1
    if page > 10:
        break

shown = []
for r in repos:
    if r.get("fork") or r.get("archived"):
        continue
    if TOPIC not in (r.get("topics") or []):
        continue
    is_private = bool(r.get("private"))
    shown.append({
        "name": r["name"],
        "description": r.get("description") or "",
        # Private repos expose only name + description (no code details)
        "language": "" if is_private else (r.get("language") or ""),
        "private": is_private,
        "updated": "" if is_private else (r.get("pushed_at") or "")[:10],
    })

try:
    with open("data.json", encoding="utf-8") as f:
        data = json.load(f)
except Exception:
    data = {
        "profile": {"name": "Sahadat000", "tagline": "Turning Ideas into Powerful Solutions",
                    "github": "https://github.com/Sahadat000", "socials": {}},
        "facebook": {"pages": []},
    }

data.setdefault("github", {})["repos"] = shown
data["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done. Projects shown:", len(shown))
