import logging
import os
import re
import html
from datetime import datetime
from typing import List, Dict, Optional

import requests
from dotenv import load_dotenv

load_dotenv()


# ──────────────────────────────────────────────────────────────────────────────
# Country detection helper for Adzuna (country-segmented endpoint)
# ──────────────────────────────────────────────────────────────────────────────
_COUNTRY_MAP: Dict[str, str] = {
    # United Kingdom
    "uk": "gb", "united kingdom": "gb", "great britain": "gb",
    "london": "gb", "manchester": "gb", "birmingham": "gb", "glasgow": "gb",
    "edinburgh": "gb", "bristol": "gb", "leeds": "gb",
    # India
    "india": "in", "bangalore": "in", "bengaluru": "in", "mumbai": "in",
    "delhi": "in", "new delhi": "in", "hyderabad": "in", "pune": "in",
    "chennai": "in", "kolkata": "in", "noida": "in", "gurgaon": "in",
    # Canada
    "canada": "ca", "toronto": "ca", "vancouver": "ca", "montreal": "ca",
    "calgary": "ca", "ottawa": "ca", "edmonton": "ca",
    # Australia
    "australia": "au", "sydney": "au", "melbourne": "au", "brisbane": "au",
    "perth": "au", "adelaide": "au",
    # Germany
    "germany": "de", "berlin": "de", "munich": "de", "hamburg": "de",
    "frankfurt": "de", "cologne": "de", "stuttgart": "de",
    # France
    "france": "fr", "paris": "fr", "lyon": "fr", "marseille": "fr",
    # Netherlands
    "netherlands": "nl", "amsterdam": "nl", "rotterdam": "nl",
    # Other
    "singapore": "sg",
    "new zealand": "nz",
    "south africa": "za",
    "poland": "pl", "warsaw": "pl",
    "brazil": "br", "sao paulo": "br",
    "austria": "at", "vienna": "at",
    "belgium": "be", "brussels": "be",
    "mexico": "mx",
    "italy": "it", "rome": "it", "milan": "it",
    "spain": "es", "madrid": "es", "barcelona": "es",
    "russia": "ru", "moscow": "ru",
}

_REMOTE_KEYWORDS = {"remote", "anywhere", "worldwide", "global", "", "work from home", "wfh"}


def _detect_adzuna_country(location: Optional[str]) -> str:
    if not location:
        return "us"
    loc = location.lower().strip()
    for key, country in _COUNTRY_MAP.items():
        if key in loc:
            return country
    return "us"


def _strip_html(text: str) -> str:
    """Strips HTML tags from a string and decodes HTML entities."""
    clean = re.sub(r"<[^>]+>", " ", text or "")
    clean = html.unescape(clean)
    return re.sub(r"\s+", " ", clean).strip()


class MCPClient:
    """
    Multi-source real job search aggregator.

    Sources (in priority order):
    1. Adzuna        — Requires free account at https://developer.adzuna.com/
                       Set ADZUNA_APP_ID + ADZUNA_APP_KEY in .env
                       25 req/min · 250 req/day free tier
    2. RemoteOK      — Completely free, no auth. Remote jobs only.
                       Endpoint: https://remoteok.com/api
    3. Arbeitnow     — Completely free, no auth. EU + Remote jobs.
                       Endpoint: https://www.arbeitnow.com/api/job-board-api

    Results from all sources are normalised to the same dict schema and
    de-duplicated by job URL before being returned.
    """

    def __init__(self):
        self.adzuna_app_id  = os.getenv("ADZUNA_APP_ID", "").strip()
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "").strip()

        self._http = requests.Session()
        self._http.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
        })

        sources = []
        if self.adzuna_app_id and self.adzuna_app_key:
            sources.append("Adzuna")
        sources += ["RemoteOK", "Arbeitnow"]
        logging.info(f"MCPClient ready. Active sources: {', '.join(sources)}")

    # ──────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────
    def search_jobs(
        self,
        keywords: str,
        location: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict]:
        """
        Search real job portals and return normalised job dicts.

        Each dict contains:
            source, job_id_on_source, title, company, location,
            description, job_url, posted_date
        """
        logging.info(
            f"Job search — keywords='{keywords}' | "
            f"location='{location}' | limit={limit}"
        )

        is_remote = (location or "").lower().strip() in _REMOTE_KEYWORDS
        results: List[Dict] = []

        # ── 1. Adzuna (best quality, location-aware) ─────────────────────
        if self.adzuna_app_id and self.adzuna_app_key:
            try:
                batch = self._search_adzuna(keywords, location, limit)
                results.extend(batch)
                logging.info(f"Adzuna → {len(batch)} job(s).")
            except Exception as exc:
                logging.warning(f"Adzuna search failed: {exc}")

        # ── 2. RemoteOK (free, remote-only) ─────────────────────────────
        if len(results) < limit and is_remote:
            try:
                batch = self._search_remoteok(keywords, limit - len(results))
                results.extend(batch)
                logging.info(f"RemoteOK → {len(batch)} job(s).")
            except Exception as exc:
                logging.warning(f"RemoteOK search failed: {exc}")

        # ── 3. Arbeitnow (free, EU + remote) ────────────────────────────
        if len(results) < limit:
            try:
                batch = self._search_arbeitnow(
                    keywords, location, limit - len(results)
                )
                results.extend(batch)
                logging.info(f"Arbeitnow → {len(batch)} job(s).")
            except Exception as exc:
                logging.warning(f"Arbeitnow search failed: {exc}")

        # ── De-duplicate by URL, cap at limit ────────────────────────────
        seen: set = set()
        unique: List[Dict] = []
        for job in results:
            url = job.get("job_url", "")
            if url and url not in seen:
                seen.add(url)
                unique.append(job)

        final = unique[:limit]
        logging.info(f"Total unique jobs returned: {len(final)}")
        return final

    def get_job_details(
        self, job_id_on_source: str, source: str
    ) -> Optional[Dict]:
        """
        Placeholder — details are already embedded in search results.
        Override to make a live API call if needed.
        """
        logging.info(
            f"get_job_details called for id={job_id_on_source} source={source}"
        )
        return None

    # ──────────────────────────────────────────────────────────────────────
    # Adzuna
    # ──────────────────────────────────────────────────────────────────────
    def _search_adzuna(
        self,
        keywords: str,
        location: Optional[str],
        limit: int,
    ) -> List[Dict]:
        country = _detect_adzuna_country(location)
        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"

        params: Dict = {
            "app_id":          self.adzuna_app_id,
            "app_key":         self.adzuna_app_key,
            "results_per_page": min(limit, 20),
            "what":            keywords,
            "sort_by":         "date",
            "content-type":    "application/json",
        }
        loc_stripped = (location or "").strip()
        if loc_stripped.lower() not in _REMOTE_KEYWORDS:
            params["where"] = loc_stripped

        resp = self._http.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        jobs: List[Dict] = []
        for item in data.get("results", []):
            posted_raw = item.get("created", "")
            try:
                # Adzuna returns ISO-8601: "2024-05-20T09:00:00Z"
                posted_dt = datetime.fromisoformat(
                    posted_raw.replace("Z", "+00:00")
                ).isoformat()
            except Exception:
                posted_dt = datetime.now().isoformat()

            jobs.append({
                "source":           "Adzuna",
                "job_id_on_source": f"adzuna_{item.get('id', '')}",
                "title":            item.get("title", "N/A"),
                "company":          item.get("company", {}).get("display_name", "Unknown"),
                "location":         item.get("location", {}).get("display_name", loc_stripped or "Remote"),
                "description":      _strip_html(item.get("description", "")),
                "job_url":          item.get("redirect_url", ""),
                "posted_date":      posted_dt,
            })
        return jobs

    # ──────────────────────────────────────────────────────────────────────
    # RemoteOK
    # ──────────────────────────────────────────────────────────────────────
    def _search_remoteok(self, keywords: str, limit: int) -> List[Dict]:
        resp = self._http.get(
            "https://remoteok.com/api",
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()

        kw_tokens = [
            t.lower().strip()
            for t in re.split(r"[\s,]+", keywords)
            if len(t) > 2
        ]

        jobs: List[Dict] = []
        for item in data:
            if not isinstance(item, dict) or "position" not in item:
                continue

            tags = " ".join(item.get("tags", []) or [])
            searchable = (
                f"{item.get('position', '')} "
                f"{tags} "
                f"{item.get('description', '')}"
            ).lower()

            # At least one keyword must match
            if not any(kw in searchable for kw in kw_tokens):
                continue

            slug = item.get("slug", item.get("id", ""))
            desc = _strip_html(item.get("description", ""))
            if not desc and tags:
                desc = f"Tags: {tags}"

            posted_raw = item.get("date", "")
            try:
                posted_dt = datetime.fromisoformat(
                    posted_raw.replace("Z", "+00:00")
                ).isoformat()
            except Exception:
                posted_dt = datetime.now().isoformat()

            jobs.append({
                "source":           "RemoteOK",
                "job_id_on_source": f"remoteok_{slug}",
                "title":            item.get("position", "N/A"),
                "company":          item.get("company", "Unknown"),
                "location":         "Remote",
                "description":      desc,
                "job_url":          item.get("url", f"https://remoteok.com/l/{slug}"),
                "posted_date":      posted_dt,
            })

            if len(jobs) >= limit:
                break

        return jobs

    # ──────────────────────────────────────────────────────────────────────
    # Arbeitnow
    # ──────────────────────────────────────────────────────────────────────
    def _search_arbeitnow(
        self,
        keywords: str,
        location: Optional[str],
        limit: int,
    ) -> List[Dict]:
        params: Dict = {"search": keywords, "page": 1}
        loc_stripped = (location or "").strip()
        if loc_stripped.lower() not in _REMOTE_KEYWORDS:
            params["location"] = loc_stripped

        resp = self._http.get(
            "https://www.arbeitnow.com/api/job-board-api",
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        jobs: List[Dict] = []
        for item in data.get("data", []):
            slug = item.get("slug", "")
            is_remote_flag = item.get("remote", False)
            raw_loc = item.get("location", "")
            display_loc = "Remote" if is_remote_flag else (raw_loc or "Unknown")

            created_ts = item.get("created_at")
            try:
                posted_dt = datetime.fromtimestamp(float(created_ts)).isoformat()
            except Exception:
                posted_dt = datetime.now().isoformat()

            jobs.append({
                "source":           "Arbeitnow",
                "job_id_on_source": f"arbeitnow_{slug}",
                "title":            item.get("title", "N/A"),
                "company":          item.get("company_name", "Unknown"),
                "location":         display_loc,
                "description":      _strip_html(item.get("description", "")),
                "job_url":          item.get("url", ""),
                "posted_date":      posted_dt,
            })

            if len(jobs) >= limit:
                break

        return jobs


# ──────────────────────────────────────────────────────────────────────────────
# Quick smoke-test (run as: python src/mcp_client.py)
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    kw  = sys.argv[1] if len(sys.argv) > 1 else "Python Developer"
    loc = sys.argv[2] if len(sys.argv) > 2 else "Remote"

    client = MCPClient()
    jobs   = client.search_jobs(keywords=kw, location=loc, limit=5)

    if not jobs:
        print("No jobs found. Check your API keys and network connection.")
    else:
        print(f"\nFound {len(jobs)} job(s) for '{kw}' in '{loc}':\n")
        for i, j in enumerate(jobs, 1):
            print(f"  [{i}] {j['title']} @ {j['company']} ({j['source']})")
            print(f"       {j['location']}  |  {j['job_url'][:70]}")
            print()
