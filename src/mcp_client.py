import logging
import os
import re
from datetime import datetime
from typing import List, Dict, Optional

from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────────────────────────────────────────
# JobSpy import — installed via: pip install python-jobspy
# ──────────────────────────────────────────────────────────────────────────────
try:
    from jobspy import scrape_jobs
    _JOBSPY_AVAILABLE = True
except ImportError:
    _JOBSPY_AVAILABLE = False
    logging.warning(
        "python-jobspy is not installed. "
        "Run: pip install python-jobspy   to enable job searching."
    )

# ──────────────────────────────────────────────────────────────────────────────
# Optional Adzuna fallback (premium, requires free API keys)
# ──────────────────────────────────────────────────────────────────────────────
try:
    import requests as _requests
    _REQUESTS_AVAILABLE = True
except ImportError:
    _REQUESTS_AVAILABLE = False

_REMOTE_KEYWORDS = {"remote", "anywhere", "worldwide", "global", "", "work from home", "wfh"}

# Adzuna country detection map
_COUNTRY_MAP: Dict[str, str] = {
    "uk": "gb", "united kingdom": "gb", "great britain": "gb",
    "london": "gb", "manchester": "gb", "birmingham": "gb",
    "india": "in", "bangalore": "in", "bengaluru": "in", "mumbai": "in",
    "delhi": "in", "new delhi": "in", "hyderabad": "in", "pune": "in",
    "chennai": "in", "kolkata": "in", "noida": "in", "gurgaon": "in",
    "canada": "ca", "toronto": "ca", "vancouver": "ca", "montreal": "ca",
    "australia": "au", "sydney": "au", "melbourne": "au", "brisbane": "au",
    "germany": "de", "berlin": "de", "munich": "de", "hamburg": "de",
    "france": "fr", "paris": "fr",
    "netherlands": "nl", "amsterdam": "nl",
    "singapore": "sg",
    "new zealand": "nz",
    "poland": "pl", "warsaw": "pl",
    "brazil": "br",
    "austria": "at", "vienna": "at",
    "belgium": "be",
    "mexico": "mx",
    "italy": "it", "rome": "it", "milan": "it",
    "spain": "es", "madrid": "es", "barcelona": "es",
}


def _detect_adzuna_country(location: Optional[str]) -> str:
    if not location:
        return "us"
    loc = location.lower().strip()
    for key, country in _COUNTRY_MAP.items():
        if key in loc:
            return country
    return "us"


def _strip_html(text: str) -> str:
    import html
    clean = re.sub(r"<[^>]+>", " ", text or "")
    clean = html.unescape(clean)
    return re.sub(r"\s+", " ", clean).strip()


# ──────────────────────────────────────────────────────────────────────────────
# MCPClient
# ──────────────────────────────────────────────────────────────────────────────
class MCPClient:
    """
    Multi-source real job search aggregator.

    Primary source  — python-jobspy (Indeed, LinkedIn, Glassdoor, ZipRecruiter,
                      Google Jobs). No API keys required.
                      Install: pip install python-jobspy

    Fallback source — Adzuna REST API (optional, better for non-US/EU locations).
                      Requires free keys from https://developer.adzuna.com/
                      Set ADZUNA_APP_ID + ADZUNA_APP_KEY in your .env file.

    Configuration via .env:
        ADZUNA_APP_ID   = your_id_here
        ADZUNA_APP_KEY  = your_key_here
        JOBSPY_SITES    = indeed,linkedin,glassdoor,zip_recruiter,google
                          (comma-separated; defaults to all five)
        JOBSPY_HOURS_OLD = 72   (only return jobs posted within N hours)
    """

    # Default sites to search — can be overridden in .env
    _DEFAULT_SITES = ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google"]

    def __init__(self):
        self.adzuna_app_id  = os.getenv("ADZUNA_APP_ID", "").strip()
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "").strip()

        sites_env = os.getenv("JOBSPY_SITES", "").strip()
        self._sites = [s.strip() for s in sites_env.split(",") if s.strip()] \
                      if sites_env else self._DEFAULT_SITES

        try:
            self._hours_old = int(os.getenv("JOBSPY_HOURS_OLD", "72"))
        except ValueError:
            self._hours_old = 72

        if _REQUESTS_AVAILABLE:
            self._http = _requests.Session()
            self._http.headers.update({
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                "Accept": "application/json",
            })

        # Log active config
        sources = []
        if _JOBSPY_AVAILABLE:
            sources.append(f"JobSpy({', '.join(self._sites)})")
        if self.adzuna_app_id and self.adzuna_app_key:
            sources.append("Adzuna")
        if not sources:
            logging.warning(
                "MCPClient: No job sources available! "
                "Run 'pip install python-jobspy' to enable searching."
            )
        else:
            logging.info(f"MCPClient ready. Sources: {', '.join(sources)}")

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────
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

        results: List[Dict] = []

        # ── 1. JobSpy (primary, no-key) ────────────────────────────────────
        if _JOBSPY_AVAILABLE:
            try:
                batch = self._search_jobspy(keywords, location, limit)
                results.extend(batch)
                logging.info(f"JobSpy → {len(batch)} job(s).")
            except Exception as exc:
                logging.warning(f"JobSpy search failed: {exc}")

        # ── 2. Adzuna (optional fallback with API key) ─────────────────────
        if len(results) < limit and self.adzuna_app_id and self.adzuna_app_key and _REQUESTS_AVAILABLE:
            try:
                batch = self._search_adzuna(keywords, location, limit - len(results))
                results.extend(batch)
                logging.info(f"Adzuna → {len(batch)} job(s).")
            except Exception as exc:
                logging.warning(f"Adzuna search failed: {exc}")

        # ── De-duplicate by URL, cap at limit ─────────────────────────────
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

    # ──────────────────────────────────────────────────────────────────────────
    # JobSpy
    # ──────────────────────────────────────────────────────────────────────────
    def _search_jobspy(
        self,
        keywords: str,
        location: Optional[str],
        limit: int,
    ) -> List[Dict]:
        is_remote = (location or "").lower().strip() in _REMOTE_KEYWORDS

        df = scrape_jobs(
            site_name        = self._sites,
            search_term      = keywords,
            location         = location if not is_remote else "Remote",
            is_remote        = is_remote,
            results_wanted   = min(limit, 20),   # per-site cap; total may be up to limit*sites
            hours_old        = self._hours_old,
            description_format = "markdown",
            verbose          = 0,
        )

        if df is None or df.empty:
            return []

        jobs: List[Dict] = []
        for _, row in df.iterrows():
            # Build a stable unique ID
            job_id = str(row.get("id") or "") or re.sub(r"[^a-z0-9]", "_", str(row.get("job_url", ""))[-60:])

            # Resolve location
            loc_obj  = row.get("location")
            if hasattr(loc_obj, "display_location"):
                loc_str = loc_obj.display_location()
            elif loc_obj is not None:
                loc_str = str(loc_obj)
            else:
                loc_str = "Remote" if row.get("is_remote") else (location or "Unknown")

            # Resolve posted date
            date_posted = row.get("date_posted")
            if date_posted is not None:
                try:
                    posted_dt = datetime.combine(date_posted, datetime.min.time()).isoformat()
                except Exception:
                    posted_dt = datetime.now().isoformat()
            else:
                posted_dt = datetime.now().isoformat()

            # Source label (jobspy 'site' column is a Site enum or string)
            site_raw = row.get("site", "jobspy")
            source   = site_raw.value.title() if hasattr(site_raw, "value") else str(site_raw).title()

            desc = str(row.get("description") or "")

            jobs.append({
                "source":           source,
                "job_id_on_source": f"{source.lower()}_{job_id}",
                "title":            str(row.get("title") or "N/A"),
                "company":          str(row.get("company_name") or "Unknown"),
                "location":         loc_str,
                "description":      desc[:5000],   # guard against huge descriptions
                "job_url":          str(row.get("job_url") or ""),
                "posted_date":      posted_dt,
            })

            if len(jobs) >= limit:
                break

        return jobs

    # ──────────────────────────────────────────────────────────────────────────
    # Adzuna (optional premium fallback)
    # ──────────────────────────────────────────────────────────────────────────
    def _search_adzuna(
        self,
        keywords: str,
        location: Optional[str],
        limit: int,
    ) -> List[Dict]:
        country = _detect_adzuna_country(location)
        url     = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"

        params: Dict = {
            "app_id":           self.adzuna_app_id,
            "app_key":          self.adzuna_app_key,
            "results_per_page": min(limit, 20),
            "what":             keywords,
            "sort_by":          "date",
            "content-type":     "application/json",
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


# ──────────────────────────────────────────────────────────────────────────────
# Smoke-test  (run as: python src/mcp_client.py  [keywords]  [location])
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    kw  = sys.argv[1] if len(sys.argv) > 1 else "Python Developer"
    loc = sys.argv[2] if len(sys.argv) > 2 else "Remote"

    client = MCPClient()
    jobs   = client.search_jobs(keywords=kw, location=loc, limit=5)

    if not jobs:
        print(
            "\nNo jobs found.\n"
            "Make sure python-jobspy is installed:  pip install python-jobspy\n"
            "Or add ADZUNA_APP_ID / ADZUNA_APP_KEY to your .env for the Adzuna fallback."
        )
    else:
        print(f"\nFound {len(jobs)} job(s) for '{kw}' in '{loc}':\n")
        for i, j in enumerate(jobs, 1):
            print(f"  [{i}] {j['title']} @ {j['company']}  ({j['source']})")
            print(f"       {j['location']}  |  {j['job_url'][:70]}")
            print()