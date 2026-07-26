import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = window.location.port === '5173' ? 'http://127.0.0.1:8000' : '';
const APPS_PER_PAGE = 10;

function App() {
  // ── Navigation ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ profiles: 0, resumes: 0, jobs: 0, applications: 0 });

  // ── Profiles ─────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', email: '', phone: '', linkedin: '', github: '' });
  // Edit profile
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState(null);

  // ── Resumes ──────────────────────────────────────────────────────────────
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  // Resume preview
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [resumePreviewData, setResumePreviewData] = useState({ title: '', content: '' });

  // ── Job Search ───────────────────────────────────────────────────────────
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // ── Applications ─────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [appsPage, setAppsPage] = useState(1);

  // ── Logs (SSE) ───────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  // ── Loading overlay ───────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingSubtext, setLoadingSubtext] = useState('');

  // ── AI Results modal ──────────────────────────────────────────────────────
  const [aiResultModalOpen, setAiResultModalOpen] = useState(false);
  const [aiResultTitle, setAiResultTitle] = useState('');
  const [aiResultText, setAiResultText] = useState('');

  // ── Toast notifications ───────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── Confirm dialog ────────────────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });

  // ─────────────────────────────────────────────────────────────────────────
  // Toast helpers
  // ─────────────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Confirm dialog helper
  const showConfirm = (message) =>
    new Promise(resolve => {
      setConfirmModal({ open: true, message, onConfirm: resolve });
    });

  const handleConfirmResponse = (answer) => {
    confirmModal.onConfirm?.(answer);
    setConfirmModal({ open: false, message: '', onConfirm: null });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle effects
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchProfiles();
    fetchApplications();
  }, []);

  // SSE log stream – proper cleanup on unmount
  useEffect(() => {
    const cleanup = setupLogStream();
    return cleanup;
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load resumes when profile changes
  useEffect(() => {
    if (selectedProfile) {
      fetchResumes(selectedProfile.id);
    } else {
      setResumes([]);
      setSelectedResume(null);
    }
  }, [selectedProfile]);

  // Reset apps pagination when applications list changes
  useEffect(() => { setAppsPage(1); }, [applications.length]);

  // ─────────────────────────────────────────────────────────────────────────
  // SSE Event stream
  // ─────────────────────────────────────────────────────────────────────────
  const setupLogStream = () => {
    const es = new EventSource(`${API_BASE}/api/logs/stream`);
    es.onmessage = (e) => {
      try { setLogs(prev => [...prev, JSON.parse(e.data)]); }
      catch { /* ignore parse errors */ }
    };
    es.onerror = () => {
      es.close();
      setTimeout(setupLogStream, 3000);
    };
    return () => es.close();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // API helpers
  // ─────────────────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profiles`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        if (data.length > 0 && !selectedProfile) setSelectedProfile(data[0]);
      }
    } catch { /* silent */ }
  };

  const fetchResumes = async (profileId) => {
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${profileId}/resumes`);
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        const primary = data.find(r => r.is_primary) || data[0] || null;
        setSelectedResume(primary);
      }
    } catch { /* silent */ }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications`);
      if (res.ok) setApplications(await res.json());
    } catch { /* silent */ }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Profile actions
  // ─────────────────────────────────────────────────────────────────────────
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newProfile.name || !newProfile.email) return;
    try {
      const res = await fetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfile.name, email: newProfile.email,
          phone: newProfile.phone || null,
          linkedin_profile: newProfile.linkedin || null,
          github_profile: newProfile.github || null,
        }),
      });
      if (res.ok) {
        setProfileModalOpen(false);
        setNewProfile({ name: '', email: '', phone: '', linkedin: '', github: '' });
        await fetchProfiles();
        await fetchStats();
        showToast('Profile created successfully!', 'success');
      } else {
        const err = await res.json();
        showToast(err.detail || 'Failed to create profile', 'error');
      }
    } catch { showToast('Network error creating profile', 'error'); }
  };

  const openEditProfile = (profile, e) => {
    e.stopPropagation();
    setEditProfileData({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',
    });
    setEditProfileModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editProfileData) return;
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${editProfileData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProfileData.name, email: editProfileData.email,
          phone: editProfileData.phone || null,
          linkedin_profile: editProfileData.linkedin || null,
          github_profile: editProfileData.github || null,
        }),
      });
      if (res.ok) {
        setEditProfileModalOpen(false);
        setEditProfileData(null);
        await fetchProfiles();
        showToast('Profile updated!', 'success');
      } else {
        const err = await res.json();
        showToast(err.detail || 'Failed to update profile', 'error');
      }
    } catch { showToast('Network error updating profile', 'error'); }
  };

  const handleDeleteProfile = async (profileId) => {
    const confirmed = await showConfirm('Delete this profile? All its resumes will also be deleted.');
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${profileId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedProfile?.id === profileId) setSelectedProfile(null);
        await fetchProfiles();
        await fetchStats();
        showToast('Profile deleted.', 'warn');
      }
    } catch { showToast('Failed to delete profile', 'error'); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Resume actions
  // ─────────────────────────────────────────────────────────────────────────
  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!selectedProfile || !newResumeTitle || !selectedFile) return;
    const formData = new FormData();
    formData.append('title', newResumeTitle);
    formData.append('file', selectedFile);
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${selectedProfile.id}/resumes`, {
        method: 'POST', body: formData,
      });
      if (res.ok) {
        setResumeModalOpen(false);
        setNewResumeTitle('');
        setSelectedFile(null);
        await fetchResumes(selectedProfile.id);
        await fetchStats();
        showToast('Resume uploaded successfully!', 'success');
      } else {
        showToast('Failed to upload resume.', 'error');
      }
    } catch { showToast('Network error uploading resume', 'error'); }
  };

  const handleDeleteResume = async (resumeId) => {
    const confirmed = await showConfirm('Delete this resume?');
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedProfile) await fetchResumes(selectedProfile.id);
        await fetchStats();
        showToast('Resume deleted.', 'warn');
      }
    } catch { showToast('Failed to delete resume', 'error'); }
  };

  const handlePreviewResume = async (resumeId) => {
    try {
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}/preview`);
      if (res.ok) {
        const data = await res.json();
        setResumePreviewData(data);
        setResumePreviewOpen(true);
      } else {
        showToast('Could not load resume preview.', 'error');
      }
    } catch { showToast('Network error loading preview', 'error'); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Job search
  // ─────────────────────────────────────────────────────────────────────────
  const handleSearchJobs = async (e) => {
    e.preventDefault();
    if (!searchKeywords) return;
    setLoading(true);
    setLoadingText('Searching live job listings...');
    setLoadingSubtext(`Querying RemoteOK · Arbeitnow · Adzuna for '${searchKeywords}'`);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: searchKeywords, location: searchLocation || null, limit: parseInt(searchLimit) || 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        setSelectedJob(data.length > 0 ? data[0] : null);
        await fetchStats();
        if (data.length === 0) showToast('No jobs found. Try different keywords.', 'warn');
        else showToast(`Found ${data.length} job(s)!`, 'success');
      } else {
        showToast('Job search failed.', 'error');
      }
    } catch { showToast('Network error during job search', 'error'); }
    finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Apply + auto-refresh
  // ─────────────────────────────────────────────────────────────────────────
  const handleApply = async () => {
    if (!selectedProfile) return showToast('Select a profile first!', 'warn');
    if (!selectedResume)  return showToast('Upload a resume first!', 'warn');
    if (!selectedJob)     return showToast('Select a job first!', 'warn');

    setLoading(true);
    setLoadingText('Tailoring resume & auto-applying...');
    setLoadingSubtext('ATS optimizer running. Switch to the Logs tab to follow progress.');

    try {
      const res = await fetch(`${API_BASE}/api/jobs/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: selectedProfile.id, resume_id: selectedResume.id, job_id: selectedJob.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setLoading(false);

        if (data.status === 'duplicate') {
          showToast(`Already applied! ${data.message}`, 'warn');
          return;
        }

        showToast('Application queued! Watch the Logs tab for live updates.', 'success');
        setActiveTab('logs');

        // Auto-refresh applications table every 5s for 60s
        let attempts = 0;
        const poll = setInterval(async () => {
          await fetchApplications();
          await fetchStats();
          attempts++;
          if (attempts >= 12) clearInterval(poll);
        }, 5000);
      } else {
        setLoading(false);
        showToast('Failed to queue application.', 'error');
      }
    } catch {
      setLoading(false);
      showToast('Network error submitting application', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AI Tools
  // ─────────────────────────────────────────────────────────────────────────
  const handleAIGenerate = async (toolType) => {
    if (!selectedProfile) return showToast('Select a profile first!', 'warn');
    if (!selectedResume)  return showToast('Upload a resume first!', 'warn');
    if (!selectedJob)     return showToast('Select a job first!', 'warn');

    setLoading(true);
    const textMap = {
      'cover-letter':   'Generating Tailored Cover Letter...',
      'cold-email':     'Generating Recruiter Outreach Message...',
      'interview-prep': 'Creating Interview Prep Guide...',
    };
    const titleMap = {
      'cover-letter':   'Tailored Cover Letter',
      'cold-email':     'LinkedIn / Email Outreach Message',
      'interview-prep': 'Custom Interview Preparation Guide',
    };
    setLoadingText(textMap[toolType] || 'Running AI Assistant...');
    setLoadingSubtext('Synthesizing via OpenAI GPT. Please wait...');

    try {
      const res = await fetch(`${API_BASE}/api/ai/${toolType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: selectedProfile.id, resume_id: selectedResume.id, job_id: selectedJob.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResultTitle(titleMap[toolType]);
        setAiResultText(data.result);
        setAiResultModalOpen(true);
      } else {
        const err = await res.json();
        showToast(err.detail || 'AI generation failed', 'error');
      }
    } catch { showToast('Network error during AI generation', 'error'); }
    finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Delete application
  // ─────────────────────────────────────────────────────────────────────────
  const handleDeleteApplication = async (appId) => {
    const confirmed = await showConfirm('Remove this application record?');
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchApplications();
        await fetchStats();
        showToast('Application record removed.', 'warn');
      }
    } catch { showToast('Failed to delete application', 'error'); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UI helpers
  // ─────────────────────────────────────────────────────────────────────────
  const getSourceBadgeClass = (source) => {
    const s = (source || '').toLowerCase();
    if (s.includes('indeed'))    return 'source-indeed';
    if (s.includes('linkedin'))  return 'source-linkedin';
    if (s.includes('glassdoor')) return 'source-glassdoor';
    if (s.includes('naukri'))    return 'source-naukri';
    if (s.includes('monster'))   return 'source-monster';
    if (s.includes('remoteok'))  return 'source-remoteok';
    if (s.includes('arbeitnow')) return 'source-arbeitnow';
    if (s.includes('adzuna'))    return 'source-adzuna';
    return 'source-other';
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('captcha')) return <span className="badge badge-captcha">CAPTCHA</span>;
    if (s.includes('fail') || s.includes('error')) return <span className="badge badge-failed">Failed</span>;
    if (s.includes('applied')) return <span className="badge badge-applied">Applied ✓</span>;
    if (s.includes('processing')) return <span className="badge badge-processing">Processing…</span>;
    return <span className="badge">{status}</span>;
  };

  // Paginated applications
  const totalAppsPages = Math.max(1, Math.ceil(applications.length / APPS_PER_PAGE));
  const pagedApplications = applications.slice((appsPage - 1) * APPS_PER_PAGE, appsPage * APPS_PER_PAGE);

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="app-container">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span>🤖</span>
          <h1>ApplyGenie</h1>
        </div>
        <ul className="sidebar-menu">
          {[
            { id: 'dashboard',    icon: '📋', label: 'Dashboard' },
            { id: 'search',       icon: '🔍', label: 'Job Search' },
            { id: 'applications', icon: '📨', label: 'Applications', badge: applications.length || null },
            { id: 'logs',         icon: '📜', label: 'Console Logs' },
          ].map(({ id, icon, label, badge }) => (
            <li
              key={id}
              className={`menu-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => { setActiveTab(id); if (id === 'applications') fetchApplications(); }}
            >
              {icon}  {label}
              {badge ? <span className="menu-badge">{badge}</span> : null}
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">v1.2.0 · ApplyGenie</div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="main-wrapper">
        <header className="navbar">
          <div className="navbar-title">
            <h2>{{
              dashboard:    'Dashboard Overview',
              search:       'Live Job Portal Search',
              applications: 'Application History',
              logs:         'Real-time Console',
            }[activeTab]}</h2>
          </div>
          <div className="system-status">
            <div className="status-dot" />
            <span>Agent Active</span>
          </div>
        </header>

        <main className="content-area">

          {/* ══════════════════════════════════════════════════════════════
              DASHBOARD TAB
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-grid">

              {/* Profiles column */}
              <div className="panel-card">
                <div className="panel-title">
                  <span>👤 User Profiles</span>
                  <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => setProfileModalOpen(true)}>
                    ➕ Add
                  </button>
                </div>
                <div className="scrollable-list">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className={`list-item ${selectedProfile?.id === p.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProfile(p)}
                    >
                      <div className="item-info">
                        <span className="item-title">{p.name}</span>
                        <span className="item-subtitle">{p.email}</span>
                        {p.linkedin && <span className="item-subtitle" style={{ color: '#6366f1' }}>🔗 LinkedIn</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={(e) => openEditProfile(p, e)}>✏️</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}>🗑</button>
                      </div>
                    </div>
                  ))}
                  {profiles.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                      No profiles yet. Create one to begin.
                    </div>
                  )}
                </div>
              </div>

              {/* Resumes column */}
              <div className="panel-card">
                <div className="panel-title">
                  <span>📄 Resumes {selectedProfile && `(${selectedProfile.name})`}</span>
                  <button
                    className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}
                    disabled={!selectedProfile}
                    onClick={() => { if (!selectedProfile) return showToast('Select a profile first.', 'warn'); setResumeModalOpen(true); }}
                  >
                    📤 Upload
                  </button>
                </div>
                <div className="scrollable-list">
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      className={`list-item ${selectedResume?.id === r.id ? 'selected' : ''}`}
                      onClick={() => setSelectedResume(r)}
                    >
                      <div className="item-info">
                        <span className="item-title">{r.title}</span>
                        <span className="item-subtitle">Uploaded {new Date(r.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {r.is_primary && <span className="item-badge">★ Primary</span>}
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={(e) => { e.stopPropagation(); handlePreviewResume(r.id); }} title="Preview resume text">
                          👁
                        </button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id); }}>🗑</button>
                      </div>
                    </div>
                  ))}
                  {resumes.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                      {selectedProfile ? 'No resumes uploaded yet.' : 'Select a profile to manage resumes.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats column */}
              <div className="stats-panel">
                {[
                  { icon: '👤', val: stats.profiles,     lbl: 'Active Profiles' },
                  { icon: '📄', val: stats.resumes,      lbl: 'Total Resumes' },
                  { icon: '🔍', val: stats.jobs,         lbl: 'Jobs Parsed' },
                  { icon: '📨', val: stats.applications, lbl: 'Applications Sent' },
                ].map(({ icon, val, lbl }) => (
                  <div key={lbl} className="stat-card">
                    <div className="stat-icon">{icon}</div>
                    <div className="stat-info">
                      <span className="stat-val">{val}</span>
                      <span className="stat-lbl">{lbl}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              JOB SEARCH TAB
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <form className="search-row" onSubmit={handleSearchJobs}>
                <div style={{ flexGrow: 3 }}>
                  <input type="text" className="form-control" placeholder="🔑 Keywords (e.g. Python Developer)"
                    value={searchKeywords} onChange={(e) => setSearchKeywords(e.target.value)} required />
                </div>
                <div style={{ flexGrow: 2 }}>
                  <input type="text" className="form-control" placeholder="📍 Location (e.g. Remote, Berlin)"
                    value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} />
                </div>
                <div style={{ width: '80px' }}>
                  <input type="number" className="form-control" placeholder="Limit" min="1" max="20"
                    value={searchLimit} onChange={(e) => setSearchLimit(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                  🔍 Search
                </button>
              </form>

              <div className="job-explorer-layout">
                {/* Job list */}
                <div className="jobs-list-panel">
                  <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Results ({jobs.length})
                  </h4>
                  <div className="scrollable-list" style={{ margin: 0 }}>
                    {jobs.map((job) => (
                      <div key={job.id} className={`job-card ${selectedJob?.id === job.id ? 'active' : ''}`}
                        onClick={() => setSelectedJob(job)}>
                        <span className="job-card-title">{job.title}</span>
                        <div className="job-card-meta">
                          <span>🏢 {job.company}</span>
                          <span>📍 {job.location || 'Remote'}</span>
                        </div>
                        <span className={`source-badge ${getSourceBadgeClass(job.source)}`}>{job.source}</span>
                      </div>
                    ))}
                    {jobs.length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                        Enter keywords above to query live job portals.
                      </div>
                    )}
                  </div>
                </div>

                {/* Job detail */}
                <div className="job-detail-panel">
                  {selectedJob ? (
                    <>
                      <div className="job-detail-header">
                        <h3>{selectedJob.title}</h3>
                        <div className="job-detail-meta-grid">
                          <div className="job-detail-meta-item"><strong>Company</strong>{selectedJob.company}</div>
                          <div className="job-detail-meta-item"><strong>Location</strong>{selectedJob.location || 'Remote'}</div>
                          <div className="job-detail-meta-item">
                            <strong>Source</strong>
                            <span className={`source-badge ${getSourceBadgeClass(selectedJob.source)}`}>{selectedJob.source}</span>
                          </div>
                        </div>
                        <a href={selectedJob.job_url} target="_blank" rel="noreferrer"
                          style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '8px', display: 'inline-block' }}>
                          🔗 Open original listing ↗
                        </a>
                      </div>

                      <div className="job-detail-body">
                        <h4 style={{ fontSize: '13px', color: 'var(--text-title)', textTransform: 'uppercase', marginBottom: '8px' }}>Description</h4>
                        <div className="job-detail-description">{selectedJob.description || 'No description available.'}</div>
                      </div>

                      <div className="btn-group" style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <button className="btn btn-primary" onClick={handleApply}
                          disabled={!selectedProfile || !selectedResume}
                          style={{ flexGrow: 2, padding: '12px 20px', fontSize: '14px', minWidth: '180px' }}>
                          🚀 Tailor & Auto-Apply
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleAIGenerate('cover-letter')}
                          disabled={!selectedProfile || !selectedResume} style={{ flexGrow: 1 }}>
                          ✉️ Cover Letter
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleAIGenerate('cold-email')}
                          disabled={!selectedProfile || !selectedResume} style={{ flexGrow: 1 }}>
                          💬 Outreach
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleAIGenerate('interview-prep')}
                          disabled={!selectedProfile || !selectedResume} style={{ flexGrow: 1 }}>
                          🎯 Interview Prep
                        </button>
                      </div>
                      {(!selectedProfile || !selectedResume) && (
                        <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>
                          ⚠️ Select a Profile and upload a Resume on the Dashboard first.
                        </p>
                      )}
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                      Select a job card on the left to review details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              APPLICATIONS TAB
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'applications' && (
            <div className="table-panel">
              <div className="panel-title" style={{ marginBottom: '16px' }}>
                <span>📨 Application History ({applications.length})</span>
                <button className="btn btn-secondary" onClick={fetchApplications}>🔄 Refresh</button>
              </div>

              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>ATS Score</th>
                      <th>Applied At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedApplications.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{app.job_title}</td>
                        <td>{app.company}</td>
                        <td><span className={`source-badge ${getSourceBadgeClass(app.source)}`}>{app.source}</span></td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${app.match_score}%`, background: app.match_score > 75 ? 'var(--success)' : app.match_score > 50 ? 'var(--warning)' : 'var(--danger)' }} />
                            </div>
                            <span style={{ fontWeight: '600', minWidth: '36px' }}>{app.match_score}%</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{app.applied_at}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {app.tailored_resume_id && (
                              <a
                                href={`${API_BASE}/api/tailored-resumes/${app.tailored_resume_id}/download`}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none' }}
                                title="Download tailored resume"
                                download
                              >⬇️</a>
                            )}
                            <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleDeleteApplication(app.id)} title="Delete record">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                          No applications sent yet. Apply to a job to see records here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalAppsPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-secondary" disabled={appsPage === 1} onClick={() => setAppsPage(p => p - 1)}>← Prev</button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Page {appsPage} of {totalAppsPages}
                  </span>
                  <button className="btn btn-secondary" disabled={appsPage === totalAppsPages} onClick={() => setAppsPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              CONSOLE LOGS TAB
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'logs' && (
            <div className="terminal-panel">
              <div className="terminal-header">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  agent_log_stream.sh — {logs.length} events
                </div>
                <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}
                  onClick={() => setLogs([])}>🧹 Clear</button>
              </div>
              <div className="terminal-view">
                {logs.map((log, i) => (
                  <div key={i} className={`log-row log-${log.level}`}>
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-msg">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', opacity: 0.4, margin: 'auto', fontFamily: 'var(--font-mono)' }}>
                    Live stream active. Events will appear here…
                  </div>
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Create Profile */}
      {profileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>👤 Create User Profile</span>
              <span className="modal-close" onClick={() => setProfileModalOpen(false)}>×</span>
            </div>
            <form onSubmit={handleCreateProfile}>
              <ProfileFormFields data={newProfile} setData={setNewProfile} />
              <div className="btn-group" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile */}
      {editProfileModalOpen && editProfileData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>✏️ Edit Profile</span>
              <span className="modal-close" onClick={() => setEditProfileModalOpen(false)}>×</span>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <ProfileFormFields data={editProfileData} setData={setEditProfileData} />
              <div className="btn-group" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resume */}
      {resumeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>📄 Upload Resume</span>
              <span className="modal-close" onClick={() => setResumeModalOpen(false)}>×</span>
            </div>
            <form onSubmit={handleUploadResume}>
              <div className="form-group">
                <label>Resume Title</label>
                <input type="text" className="form-control" placeholder="e.g. Senior Software Engineer Resume"
                  value={newResumeTitle} onChange={(e) => setNewResumeTitle(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Resume File</label>
                <input type="file" id="resume-file" style={{ display: 'none' }} accept=".txt,.pdf,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])} required />
                <div className="file-upload-zone" onClick={() => document.getElementById('resume-file').click()}>
                  <span className="upload-icon">📁</span>
                  <p>{selectedFile ? selectedFile.name : 'Click to select a file'}</p>
                  <span>Supports: PDF, DOCX, TXT (Max 5MB)</span>
                </div>
              </div>
              <div className="btn-group" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResumeModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile}>Upload Resume</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Preview */}
      {resumePreviewOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '660px', maxWidth: '92vw' }}>
            <div className="modal-header">
              <span>👁 Resume Preview — {resumePreviewData.title}</span>
              <span className="modal-close" onClick={() => setResumePreviewOpen(false)}>×</span>
            </div>
            <div style={{ background: '#060608', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', maxHeight: '420px', overflowY: 'auto', marginBottom: '16px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00ff88', lineHeight: '1.5', margin: 0 }}>
                {resumePreviewData.content || 'No text content could be extracted.'}
              </pre>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setResumePreviewOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(resumePreviewData.content); showToast('Copied to clipboard!', 'success'); }}>
                📋 Copy Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Result */}
      {aiResultModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '640px', maxWidth: '92vw' }}>
            <div className="modal-header">
              <span>🤖 AI Assistant — {aiResultTitle}</span>
              <span className="modal-close" onClick={() => setAiResultModalOpen(false)}>×</span>
            </div>
            <div style={{ background: '#0d0d12', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-subtle)', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
                {aiResultText}
              </pre>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setAiResultModalOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(aiResultText); showToast('Copied!', 'success'); }}>
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmModal.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header"><span>⚠️ Confirm</span></div>
            <p style={{ color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => handleConfirmResponse(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleConfirmResponse(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="progress-overlay">
          <div className="spinner" />
          <span className="progress-text">{loadingText}</span>
          <span className="progress-subtext">{loadingSubtext}</span>
        </div>
      )}

      {/* Toast stack */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismissToast(t.id)}>
            <span className="toast-icon">
              {{ success: '✅', warn: '⚠️', error: '❌', info: 'ℹ️' }[t.type] || 'ℹ️'}
            </span>
            <span className="toast-msg">{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Profile form fields (used by both Create and Edit modals)
// ─────────────────────────────────────────────────────────────────────────────
function ProfileFormFields({ data, setData }) {
  return (
    <>
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" className="form-control" value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Jane Doe" required />
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" className="form-control" value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="jane@example.com" required />
      </div>
      <div className="form-group">
        <label>Phone (Optional)</label>
        <input type="text" className="form-control" value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="+1 555 019 2834" />
      </div>
      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label>LinkedIn URL</label>
          <input type="text" className="form-control" value={data.linkedin}
            onChange={(e) => setData({ ...data, linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>GitHub URL</label>
          <input type="text" className="form-control" value={data.github}
            onChange={(e) => setData({ ...data, github: e.target.value })} placeholder="github.com/..." />
        </div>
      </div>
    </>
  );
}

export default App;
