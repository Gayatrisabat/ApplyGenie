import os
import sys
import json
import logging
import asyncio
import shutil
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add parent directory to path to allow src.* imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.database import init_db, Session, UserProfile, Resume, JobPosting, TailoredResume, Application
from src.mcp_client import MCPClient
from src.ats_tailor import ATSTailor
from src.browser_bot import BrowserBot
from src.utils import setup_logging, load_config

# Initialize Database and Logging
setup_logging()
config = load_config()
init_db()

# ──────────────────────────────────────────────
# SSE Handler & Lifespan (defined before app)
# ──────────────────────────────────────────────

# Global list of active SSE queues
active_queues = []

class SSEHandler(logging.Handler):
    """Intercepts standard logs and broadcasts them to all SSE clients."""
    def __init__(self, loop):
        super().__init__()
        self.loop = loop

    def emit(self, record):
        try:
            log_data = {
                "level": record.levelname,
                "message": record.getMessage(),
                "timestamp": datetime.fromtimestamp(record.created).strftime("%H:%M:%S")
            }
            for q in list(active_queues):
                self.loop.call_soon_threadsafe(q.put_nowait, log_data)
        except Exception:
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern FastAPI lifespan handler for startup/shutdown events."""
    # Startup: Set up SSE Logging Handler
    loop = asyncio.get_running_loop()
    handler = SSEHandler(loop)
    handler.setFormatter(logging.Formatter('%(message)s'))
    logging.getLogger().addHandler(handler)
    logging.info("SSE logging stream initialized.")
    yield
    # Shutdown cleanup (if needed) goes here

app = FastAPI(title="Job Automator API", lifespan=lifespan)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Clients
mcp_client = MCPClient()
ats_tailor = ATSTailor()

# ──────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────
class UserProfileSchema(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    linkedin_profile: Optional[str] = None
    github_profile: Optional[str] = None

class JobSearchSchema(BaseModel):
    keywords: str
    location: Optional[str] = None
    limit: Optional[int] = 5

class ApplySchema(BaseModel):
    profile_id: int
    resume_id: int
    job_id: int

class AIGenerationSchema(BaseModel):
    profile_id: int
    resume_id: int
    job_id: int


# ──────────────────────────────────────────────
# REST Endpoints
# ──────────────────────────────────────────────

@app.get("/api/stats")
def get_stats():
    session = Session()
    try:
        profiles_count = session.query(UserProfile).count()
        resumes_count = session.query(Resume).count()
        jobs_count = session.query(JobPosting).count()
        apps_count = session.query(Application).count()
        return {
            "profiles": profiles_count,
            "resumes": resumes_count,
            "jobs": jobs_count,
            "applications": apps_count
        }
    finally:
        session.close()

# Profiles CRUD
@app.get("/api/profiles")
def get_profiles():
    session = Session()
    try:
        profiles = session.query(UserProfile).all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "email": p.email,
                "phone": p.phone,
                "linkedin": p.linkedin_profile,
                "github": p.github_profile,
                "resumes": [{"id": r.id, "title": r.title, "is_primary": r.is_primary} for r in p.resumes]
            }
            for p in profiles
        ]
    finally:
        session.close()

@app.post("/api/profiles")
def create_profile(profile: UserProfileSchema):
    session = Session()
    try:
        existing = session.query(UserProfile).filter_by(email=profile.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Profile with this email already exists.")
        
        p = UserProfile(
            name=profile.name,
            email=profile.email,
            phone=profile.phone,
            linkedin_profile=profile.linkedin_profile,
            github_profile=profile.github_profile
        )
        session.add(p)
        session.commit()
        logging.info(f"Profile created via API: {p.name}")
        return {"status": "success", "profile_id": p.id}
    finally:
        session.close()

@app.delete("/api/profiles/{profile_id}")
def delete_profile(profile_id: int):
    session = Session()
    try:
        p = session.get(UserProfile, profile_id)
        if not p:
            raise HTTPException(status_code=404, detail="Profile not found.")
        
        # Delete profile's resumes as well
        for resume in p.resumes:
            if os.path.exists(resume.file_path):
                try:
                    os.remove(resume.file_path)
                except Exception:
                    pass
            session.delete(resume)
        
        session.delete(p)
        session.commit()
        logging.info(f"Profile deleted via API: {p.name}")
        return {"status": "success"}
    finally:
        session.close()

# Resumes API
@app.get("/api/profiles/{profile_id}/resumes")
def get_resumes(profile_id: int):
    session = Session()
    try:
        p = session.get(UserProfile, profile_id)
        if not p:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return [
            {
                "id": r.id,
                "title": r.title,
                "file_path": r.file_path,
                "is_primary": r.is_primary,
                "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None
            }
            for r in p.resumes
        ]
    finally:
        session.close()

@app.post("/api/profiles/{profile_id}/resumes")
async def upload_resume(profile_id: int, title: str = Form(...), file: UploadFile = File(...)):
    session = Session()
    try:
        p = session.get(UserProfile, profile_id)
        if not p:
            raise HTTPException(status_code=404, detail="Profile not found.")
        
        resume_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'resumes')
        os.makedirs(resume_dir, exist_ok=True)
        
        dest = os.path.join(resume_dir, f"{p.id}_{os.path.basename(file.filename)}")
        with open(dest, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        is_primary = not bool(p.resumes)
        r = Resume(user_profile_id=p.id, title=title, file_path=dest, is_primary=is_primary)
        session.add(r)
        session.commit()
        logging.info(f"Resume '{title}' uploaded for {p.name}")
        return {"status": "success", "resume_id": r.id}
    finally:
        session.close()

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: int):
    session = Session()
    try:
        r = session.get(Resume, resume_id)
        if not r:
            raise HTTPException(status_code=404, detail="Resume not found.")
        
        if os.path.exists(r.file_path):
            try:
                os.remove(r.file_path)
            except Exception:
                pass
                
        session.delete(r)
        session.commit()
        logging.info(f"Resume deleted: {r.title}")
        return {"status": "success"}
    finally:
        session.close()

# Job Search API
@app.post("/api/jobs/search")
def search_jobs(params: JobSearchSchema):
    session = Session()
    try:
        logging.info(f"API Job Search: '{params.keywords}' in '{params.location}'")
        jobs = mcp_client.search_jobs(params.keywords, params.location, params.limit)
        
        results = []
        for jd in jobs:
            existing = session.query(JobPosting).filter_by(
                job_id_on_source=jd['job_id_on_source'], source=jd['source']
            ).first()
            if not existing:
                jp = JobPosting(
                    source=jd['source'],
                    job_id_on_source=jd['job_id_on_source'],
                    title=jd['title'],
                    company=jd['company'],
                    location=jd.get('location', ''),
                    description=jd.get('description', ''),
                    job_url=jd['job_url'],
                    posted_date=datetime.fromisoformat(jd['posted_date']) if 'posted_date' in jd else None,
                )
                session.add(jp)
                session.commit()
                job_db_id = jp.id
            else:
                job_db_id = existing.id
                
            results.append({
                "id": job_db_id,
                "source": jd['source'],
                "job_id_on_source": jd['job_id_on_source'],
                "title": jd['title'],
                "company": jd['company'],
                "location": jd.get('location', ''),
                "description": jd.get('description', ''),
                "job_url": jd['job_url'],
            })
            
        logging.info(f"Found {len(jobs)} job(s) via API search.")
        return results
    finally:
        session.close()

# Tailor & Apply Background Task
async def perform_application_task(profile_id: int, resume_id: int, job_id: int):
    logging.info(f"Background task starting: tailor & apply (Profile={profile_id}, Resume={resume_id}, Job={job_id})")
    
    session = Session()
    try:
        profile = session.get(UserProfile, profile_id)
        resume  = session.get(Resume, resume_id)
        job     = session.get(JobPosting, job_id)
        
        if not profile or not resume or not job:
            logging.error("Invalid database IDs in background task.")
            return

        # Read resume file
        try:
            with open(resume.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                resume_content = f.read()
        except Exception:
            resume_content = f"{profile.name}\nSoftware Developer\nSkills: Python, SQL"

        # Tailor
        logging.info("ATS Engine: Analyzing job description...")
        analysis = ats_tailor.analyze_job_description(job.description)
        logging.info("ATS Engine: Tailoring resume content...")
        tailored_content, score = ats_tailor.tailor_resume(resume_content, analysis)

        # Save tailored resume
        tailored_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'resumes', 'tailored')
        os.makedirs(tailored_dir, exist_ok=True)
        tailored_path = os.path.join(tailored_dir, f"tailored_{job.job_id_on_source}_{profile.id}.txt")
        with open(tailored_path, 'w', encoding='utf-8') as f:
            f.write(tailored_content)

        tr = TailoredResume(
            base_resume_id  = resume.id,
            job_posting_id  = job.id,
            tailored_file_path = tailored_path,
            match_score     = score,
        )
        session.add(tr)
        session.commit()

        logging.info(f"Resume tailored! Match score is {score}%. Starting browser automation...")

        # Browser automation
        status  = 'Applied'
        success = False
        bot = BrowserBot(headless=False)
        try:
            await bot.launch_browser()
            await bot.navigate(job.job_url)

            form_data = {
                'input[name="name"]':  profile.name,
                'input[name="email"]': profile.email,
            }
            await bot.fill_form(form_data, resume_file_path=tailored_path)

            if await bot.check_for_captcha():
                logging.warning("CAPTCHA Required on application page.")
                status  = 'CAPTCHA Required'
                success = False
            else:
                ok = await bot.submit_form()
                status  = 'Applied' if ok else 'Submission Failed'
                success = ok
        except Exception as e:
            status  = 'Automation Error'
            success = False
            logging.error(f"Browser bot automation failed: {e}")
        finally:
            await bot.close_browser()

        app_rec = Application(
            user_profile_id   = profile.id,
            job_posting_id    = job.id,
            tailored_resume_id= tr.id,
            status            = status,
            notes             = f"ATS Match Score: {score}%",
        )
        session.add(app_rec)
        session.commit()
        logging.info(f"Background application job completed. Status: {status}")
    except Exception as ex:
        logging.error(f"Error in background task: {ex}")
    finally:
        session.close()

@app.post("/api/jobs/apply")
def apply_to_job(payload: ApplySchema, background_tasks: BackgroundTasks):
    background_tasks.add_task(
        perform_application_task,
        payload.profile_id,
        payload.resume_id,
        payload.job_id
    )
    logging.info(f"Scheduled application for job_id={payload.job_id} in background.")
    return {"status": "processing", "message": "Application started in background"}

# Application History API
@app.get("/api/applications")
def get_applications():
    session = Session()
    try:
        apps = session.query(Application).all()
        return [
            {
                "id": app.id,
                "job_title": app.job_posting.title if app.job_posting else "—",
                "company": app.job_posting.company if app.job_posting else "—",
                "source": app.job_posting.source if app.job_posting else "—",
                "status": app.status,
                "match_score": app.tailored_resume.match_score if app.tailored_resume else 0,
                "applied_at": app.applied_at.strftime("%Y-%m-%d %H:%M") if app.applied_at else "—"
            }
            for app in apps
        ]
    finally:
        session.close()

# ──────────────────────────────────────────────
# AI Generation Tool Endpoints
# ──────────────────────────────────────────────

@app.post("/api/ai/cover-letter")
def generate_cover_letter_endpoint(payload: AIGenerationSchema):
    session = Session()
    try:
        profile = session.get(UserProfile, payload.profile_id)
        resume  = session.get(Resume, payload.resume_id)
        job     = session.get(JobPosting, payload.job_id)
        
        if not profile or not resume or not job:
            raise HTTPException(status_code=400, detail="Invalid profile, resume, or job ID")
            
        try:
            with open(resume.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                resume_content = f.read()
        except Exception:
            resume_content = f"{profile.name}\nSkills: Software Development"
            
        logging.info(f"AI: Generating tailored cover letter for {profile.name}...")
        result = ats_tailor.generate_cover_letter(resume_content, job.description)
        return {"result": result}
    finally:
        session.close()

@app.post("/api/ai/cold-email")
def generate_cold_email_endpoint(payload: AIGenerationSchema):
    session = Session()
    try:
        profile = session.get(UserProfile, payload.profile_id)
        resume  = session.get(Resume, payload.resume_id)
        job     = session.get(JobPosting, payload.job_id)
        
        if not profile or not resume or not job:
            raise HTTPException(status_code=400, detail="Invalid profile, resume, or job ID")
            
        try:
            with open(resume.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                resume_content = f.read()
        except Exception:
            resume_content = f"{profile.name}\nSkills: Software Development"
            
        logging.info(f"AI: Generating recruiter cold outreach message for {profile.name}...")
        result = ats_tailor.generate_cold_email(resume_content, job.description)
        return {"result": result}
    finally:
        session.close()

@app.post("/api/ai/interview-prep")
def generate_interview_prep_endpoint(payload: AIGenerationSchema):
    session = Session()
    try:
        profile = session.get(UserProfile, payload.profile_id)
        resume  = session.get(Resume, payload.resume_id)
        job     = session.get(JobPosting, payload.job_id)
        
        if not profile or not resume or not job:
            raise HTTPException(status_code=400, detail="Invalid profile, resume, or job ID")
            
        try:
            with open(resume.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                resume_content = f.read()
        except Exception:
            resume_content = f"{profile.name}\nSkills: Software Development"
            
        logging.info(f"AI: Generating tailored interview preparation guide for {profile.name}...")
        result = ats_tailor.generate_interview_prep(resume_content, job.description)
        return {"result": result}
    finally:
        session.close()

# ──────────────────────────────────────────────

# Server-Sent Events (SSE) Live Log Streaming
# ──────────────────────────────────────────────
@app.get("/api/logs/stream")
async def stream_logs():
    async def log_generator():
        q = asyncio.Queue()
        active_queues.append(q)
        try:
            # Yield active handshake
            yield f"data: {json.dumps({'message': 'Live console log stream established', 'level': 'INFO', 'timestamp': datetime.now().strftime('%H:%M:%S')})}\n\n"
            
            while True:
                log_data = await q.get()
                yield f"data: {json.dumps(log_data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            active_queues.remove(q)

    return StreamingResponse(log_generator(), media_type="text/event-stream")

# ──────────────────────────────────────────────
# Serve Static Frontend Files
# ──────────────────────────────────────────────
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')

@app.get("/")
def serve_root():
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return FileResponse(os.path.join(FRONTEND_DIST, 'index.html'))
    return StreamingResponse(
        content=iter(["<html><head><title>Job Automator UI</title><style>body { background-color: #0b0b0f; color: #9ca3af; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } h1 { color: #f3f4f6; } .box { border: 1px solid #2a2a35; padding: 40px; border-radius: 12px; background: #121216; text-align: center; max-width: 500px; }</style></head><body><div class='box'><h1>🤖 Job Application Automation</h1><p>The backend is running perfectly!</p><p style='color: #6366f1; font-weight: bold;'>React Frontend is currently building...</p><p style='font-size: 13px; color: #6b7280;'>Once the frontend is built, this page will automatically display the modern Obsidian & Slate Web interface.</p></div></body></html>"]),
        media_type="text/html"
    )

# Try mounting static files if directory exists
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("src.server:app", host="127.0.0.1", port=8000, reload=True)
