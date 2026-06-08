# 🤖 Automated Job Application Software

An AI-powered desktop application that automates the entire job application workflow — from searching job portals, tailoring your resume with GPT, to auto-filling and submitting applications via browser automation.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Multi-Profile Management** | Manage multiple applicant profiles and resumes |
| **Real Job Search (3 sources)** | Adzuna · RemoteOK · Arbeitnow — live data, no scraping |
| **AI Resume Tailoring** | GPT-powered ATS keyword optimization with match scores |
| **AI Cover Letter** | GPT-generated tailored cover letter for any job |
| **AI Cold Email** | Recruiter outreach message auto-generated from resume + JD |
| **AI Interview Prep** | Custom Q&A guide based on your profile and the job |
| **Browser Automation** | Playwright-based auto form-fill and submission |
| **Application Tracker** | SQLite-backed dashboard tracking every application |
| **Dark Mode Web UI** | Modern React + FastAPI Obsidian-themed interface |
| **SSE Live Log Stream** | Real-time console log feed in the browser |

---

## 🗂️ Project Structure

```
job_automator/
├── src/
│   ├── __init__.py
│   ├── main.py          # PyQt6 GUI entry point
│   ├── database.py      # SQLAlchemy ORM models
│   ├── mcp_client.py    # Job portal MCP client
│   ├── ats_tailor.py    # OpenAI resume tailoring engine
│   ├── browser_bot.py   # Playwright browser automation
│   └── utils.py         # Logging & config utilities
├── config/
│   └── settings.ini     # App configuration
├── data/
│   ├── resumes/         # Uploaded & tailored resumes
│   └── applications.db  # SQLite database
├── tests/               # Pytest test suite
├── logs/                # Application logs
├── requirements.txt
├── .env                 # API keys (do NOT commit)
└── README.md
```

---

## ⚙️ Setup

### 1. Prerequisites
- **Python 3.11+** (already installed & in PATH)
- **OpenAI API Key** (optional — fallback mode works without it)

### 2. Create & activate virtual environment
```powershell
cd job_automator
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install dependencies
```powershell
pip install -r requirements.txt
playwright install chromium
```

### 4. Configure API Key
Edit `.env`:
```
OPENAI_API_KEY="sk-your-key-here"
```

### 5. Initialise the database
```powershell
python src/database.py
```

---

## 🌐 Job API Sources

The app aggregates **real job listings** from three sources:

| Source | Auth | Coverage | Notes |
|---|---|---|---|
| **Adzuna** | Free key required | US, UK, India, AU, DE, FR + more | 250 calls/day free |
| **RemoteOK** | None | Remote-only worldwide | Always active |
| **Arbeitnow** | None | EU + Remote | Always active |

### Setting up Adzuna (Optional but recommended for location search)
1. Register free at **https://developer.adzuna.com/**
2. Copy your `App ID` and `App Key`
3. Add them to `.env`:
   ```
   ADZUNA_APP_ID="your_app_id_here"
   ADZUNA_APP_KEY="your_app_key_here"
   ```

> **No API key?** The app still returns real jobs from RemoteOK and Arbeitnow without any setup.

---

## 🚀 Running the App

```powershell
# Start the full web stack (FastAPI backend + React frontend)
python run_web.py

# Or run the PyQt6 desktop GUI directly
python src/main.py
```

### Test job search from CLI
```powershell
# Smoke-test the job client (no server needed)
python src/mcp_client.py "Python Developer" "Remote"
python src/mcp_client.py "Data Scientist" "London"
```

---

## 🧪 Running Tests

```powershell
pip install pytest
pytest tests/ -v
```

---

## 🔑 Usage Guide

1. **Dashboard Tab** → Add a user profile → Upload your resume (PDF/DOCX/TXT)
2. **Job Search Tab** → Enter keywords + location → Click **Search**
3. Select a job from results → Click **Tailor Resume & Apply**
4. The app will:
   - Analyse the job description with GPT
   - Generate an ATS-optimised resume
   - Open a browser and attempt to fill & submit the form
5. **Applications Tab** → Track status of all submissions

---

## ⚠️ Important Notes

- **CAPTCHA**: Job portals may show CAPTCHAs. The browser will open visibly so you can solve them manually.
- **Portal-specific selectors**: Each job site has unique form HTML. Edit `browser_bot.py → fill_form()` to add site-specific CSS selectors.
- **Terms of Service**: Review each job portal's ToS before running automated applications.
- **API costs**: Resume tailoring uses OpenAI tokens. Monitor your usage at [platform.openai.com](https://platform.openai.com).

---

## 🛠️ Tech Stack

- **GUI**: PyQt6
- **Database**: SQLAlchemy + SQLite
- **AI**: OpenAI GPT (gpt-4o-mini)
- **Browser**: Playwright (Chromium)
- **Config**: python-dotenv + configparser

---

## 📄 License
MIT
