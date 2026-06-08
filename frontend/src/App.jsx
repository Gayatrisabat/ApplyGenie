import { useState, useEffect, useRef } from 'react';

// Determine backend API host based on development environment
const API_BASE = window.location.port === '5173' ? 'http://127.0.0.1:8000' : '';

function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ profiles: 0, resumes: 0, jobs: 0, applications: 0 });
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  
  // Job Search State
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Applications State
  const [applications, setApplications] = useState([]);

  // Logs State
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  // Progress/Overlay States
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingSubtext, setLoadingSubtext] = useState('');

  // Modals States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', email: '', phone: '', linkedin: '', github: '' });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // AI Generation States
  const [aiResultModalOpen, setAiResultModalOpen] = useState(false);
  const [aiResultTitle, setAiResultTitle] = useState('');
  const [aiResultText, setAiResultText] = useState('');


  // ──────────────────────────────────────────────
  // Lifecycles & API syncs
  // ──────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchProfiles();
    fetchApplications();
  }, []);

  // Separate useEffect for SSE so its cleanup is properly handled
  useEffect(() => {
    const cleanup = setupLogStream();
    return cleanup;  // Properly tears down EventSource on unmount
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Load resumes when profile selection changes
  useEffect(() => {
    if (selectedProfile) {
      fetchResumes(selectedProfile.id);
    } else {
      setResumes([]);
      setSelectedResume(null);
    }
  }, [selectedProfile]);

  // ──────────────────────────────────────────────
  // SSE Event Stream
  // ──────────────────────────────────────────────
  const setupLogStream = () => {
    const eventSource = new EventSource(`${API_BASE}/api/logs/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data);
        setLogs((prevLogs) => [...prevLogs, logData]);
      } catch (err) {
        console.error("Failed to parse log event", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Log stream disconnected. Reconnecting...");
      eventSource.close();
      // Retry in 3 seconds
      setTimeout(setupLogStream, 3000);
    };

    return () => {
      eventSource.close();
    };
  };

  // ──────────────────────────────────────────────
  // API Request Functions
  // ──────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profiles`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        // Select first profile if none selected
        if (data.length > 0 && !selectedProfile) {
          setSelectedProfile(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const fetchResumes = async (profileId) => {
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${profileId}/resumes`);
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        // Select primary resume by default
        const primary = data.find(r => r.is_primary) || data[0];
        if (primary) {
          setSelectedResume(primary);
        } else {
          setSelectedResume(null);
        }
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newProfile.name || !newProfile.email) return;

    try {
      const res = await fetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone || null,
          linkedin_profile: newProfile.linkedin || null,
          github_profile: newProfile.github || null
        })
      });

      if (res.ok) {
        setProfileModalOpen(false);
        setNewProfile({ name: '', email: '', phone: '', linkedin: '', github: '' });
        await fetchProfiles();
        await fetchStats();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Failed to create profile'}`);
      }
    } catch (err) {
      console.error("Error creating profile:", err);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!confirm("Are you sure you want to delete this profile? This will delete all its resumes.")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${profileId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null);
        }
        await fetchProfiles();
        await fetchStats();
      }
    } catch (err) {
      console.error("Error deleting profile:", err);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!selectedProfile || !newResumeTitle || !selectedFile) return;

    const formData = new FormData();
    formData.append('title', newResumeTitle);
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_BASE}/api/profiles/${selectedProfile.id}/resumes`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setResumeModalOpen(false);
        setNewResumeTitle('');
        setSelectedFile(null);
        await fetchResumes(selectedProfile.id);
        await fetchStats();
      } else {
        alert("Failed to upload resume.");
      }
    } catch (err) {
      console.error("Error uploading resume:", err);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedProfile) {
          await fetchResumes(selectedProfile.id);
        }
        await fetchStats();
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  const handleSearchJobs = async (e) => {
    e.preventDefault();
    if (!searchKeywords) return;

    setLoading(true);
    setLoadingText("Searching job listings...");
    setLoadingSubtext(`Fetching from MCP job portals for '${searchKeywords}'`);

    try {
      const res = await fetch(`${API_BASE}/api/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: searchKeywords,
          location: searchLocation || null,
          limit: parseInt(searchLimit) || 5
        })
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        if (data.length > 0) {
          setSelectedJob(data[0]);
        } else {
          setSelectedJob(null);
        }
        await fetchStats();
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedProfile) return alert("Please select a profile first!");
    if (!selectedResume) return alert("Please upload a resume first!");
    if (!selectedJob) return alert("Please select a job first!");

    setLoading(true);
    setLoadingText("Tailoring resume & auto-applying...");
    setLoadingSubtext(`Running ATS optimizer & Playwright automation. Please watch the Logs tab.`);

    try {
      const res = await fetch(`${API_BASE}/api/jobs/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: selectedProfile.id,
          resume_id: selectedResume.id,
          job_id: selectedJob.id
        })
      });

      if (res.ok) {
        // Since it runs in the background, we switch to logs tab so they can see progress!
        setTimeout(() => {
          setActiveTab('logs');
          setLoading(false);
        }, 1500);
      } else {
        alert("Failed to queue application task.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Apply request failed:", err);
      setLoading(false);
    }
  };

  const handleAIGenerate = async (toolType) => {
    if (!selectedProfile) return alert("Please select a profile first!");
    if (!selectedResume) return alert("Please upload a resume first!");
    if (!selectedJob) return alert("Please select a job first!");

    setLoading(true);
    const textMap = {
      'cover-letter': 'Generating Tailored Cover Letter...',
      'cold-email': 'Generating Recruiter Outreach Message...',
      'interview-prep': 'Creating Customized Interview Prep Guide...'
    };
    const titleMap = {
      'cover-letter': 'Tailored Cover Letter',
      'cold-email': 'LinkedIn / Email Outreach Message',
      'interview-prep': 'Custom Interview Preparation Guide'
    };

    setLoadingText(textMap[toolType] || 'Running AI Assistant...');
    setLoadingSubtext('Synthesizing details via OpenAI GPT. Please wait...');

    try {
      const res = await fetch(`${API_BASE}/api/ai/${toolType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: selectedProfile.id,
          resume_id: selectedResume.id,
          job_id: selectedJob.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResultTitle(titleMap[toolType]);
        setAiResultText(data.result);
        setAiResultModalOpen(true);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Generation failed'}`);
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert("API request failed.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for sourcing CSS source badges
  const getSourceBadgeClass = (source) => {
    const s = source?.toLowerCase() || '';
    if (s.includes('indeed')) return 'source-indeed';
    if (s.includes('linkedin')) return 'source-linkedin';
    if (s.includes('glassdoor')) return 'source-glassdoor';
    if (s.includes('naukri')) return 'source-naukri';
    if (s.includes('monster')) return 'source-monster';
    return '';
  };

  // Dynamic status badges
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('captcha')) return <span className="badge badge-captcha">CAPTCHA Needed</span>;
    if (s.includes('fail') || s.includes('error')) return <span className="badge badge-failed">Failed</span>;
    if (s.includes('applied')) return <span className="badge badge-applied">Applied</span>;
    return <span className="badge">{status}</span>;
  };

  return (
    <div className="app-container">
      {/* ──────────────────────────────────────────────
          Sidebar Navigation Panel
          ────────────────────────────────────────────── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span>🤖</span>
          <h1>Job Automator</h1>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📋  Dashboard
          </li>
          <li 
            className={`menu-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍  Job Search
          </li>
          <li 
            className={`menu-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => { setActiveTab('applications'); fetchApplications(); }}
          >
            📨  Applications
          </li>
          <li 
            className={`menu-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📜  Console Logs
          </li>
        </ul>

        <div className="sidebar-footer">
          v1.1.0 • Obsidian Theme
        </div>
      </nav>

      {/* ──────────────────────────────────────────────
          Main App Canvas Area
          ────────────────────────────────────────────── */}
      <div className="main-wrapper">
        <header className="navbar">
          <div className="navbar-title">
            <h2>{
              activeTab === 'dashboard' ? 'Dashboard Overview' :
              activeTab === 'search' ? 'MCP AI Job Portal Search' :
              activeTab === 'applications' ? 'Application Submission History' :
              'Real-time Logging Console'
            }</h2>
          </div>
          <div className="system-status">
            <div className="status-dot"></div>
            <span>Agent Active & Connected</span>
          </div>
        </header>

        <main className="content-area">
          {/* ──────────────────────────────────────────────
              DASHBOARD TAB PANEL
              ────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-grid">
              
              {/* User Profiles Column */}
              <div className="panel-card">
                <div className="panel-title">
                  <span>👤 User Profiles</span>
                  <button className="btn btn-secondary" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => setProfileModalOpen(true)}>
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
                      </div>
                      <button 
                        className="btn btn-danger" 
                        style={{padding: '4px 8px', fontSize: '11px'}}
                        onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                  {profiles.length === 0 && (
                    <div style={{color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px'}}>
                      No profiles found. Create one to begin.
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Profile's Resumes Column */}
              <div className="panel-card">
                <div className="panel-title">
                  <span>📄 Resumes {selectedProfile && `(${selectedProfile.name})`}</span>
                  <button 
                    className="btn btn-secondary" 
                    style={{padding: '5px 10px', fontSize: '12px'}} 
                    onClick={() => {
                      if (!selectedProfile) return alert("Select a profile first.");
                      setResumeModalOpen(true);
                    }}
                    disabled={!selectedProfile}
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
                      <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                        {r.is_primary && <span className="item-badge">★ Primary</span>}
                        <button 
                          className="btn btn-danger" 
                          style={{padding: '4px 8px', fontSize: '11px'}}
                          onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id); }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                  {resumes.length === 0 && (
                    <div style={{color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px'}}>
                      {selectedProfile ? "No resumes uploaded yet." : "Please select a profile on the left."}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats Panel Column */}
              <div className="stats-panel">
                <div className="stat-card">
                  <div className="stat-icon">👤</div>
                  <div className="stat-info">
                    <span className="stat-val">{stats.profiles}</span>
                    <span className="stat-lbl">Active Profiles</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📄</div>
                  <div className="stat-info">
                    <span className="stat-val">{stats.resumes}</span>
                    <span className="stat-lbl">Total Resumes</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔍</div>
                  <div className="stat-info">
                    <span className="stat-val">{stats.jobs}</span>
                    <span className="stat-lbl">Jobs Parsed</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📨</div>
                  <div className="stat-info">
                    <span className="stat-val">{stats.applications}</span>
                    <span className="stat-lbl">Applications Sent</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────
              JOB SEARCH TAB PANEL
              ────────────────────────────────────────────── */}
          {activeTab === 'search' && (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              
              <form className="search-row" onSubmit={handleSearchJobs}>
                <div style={{flexGrow: 3}}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="🔑 Keywords (e.g. Python Developer)" 
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    required
                  />
                </div>
                <div style={{flexGrow: 2}}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="📍 Location (e.g. Remote, Dallas, TX)" 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div style={{width: '90px'}}>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Limit" 
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(e.target.value)}
                    min="1"
                    max="20"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{flexShrink: 0}}>
                  🔍 Search Listings
                </button>
              </form>

              <div className="job-explorer-layout">
                
                {/* Search Results List */}
                <div className="jobs-list-panel">
                  <h4 style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase'}}>
                    Search Results ({jobs.length})
                  </h4>
                  <div className="scrollable-list" style={{margin: 0}}>
                    {jobs.map((job) => (
                      <div 
                        key={job.id} 
                        className={`job-card ${selectedJob?.id === job.id ? 'active' : ''}`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <span className="job-card-title">{job.title}</span>
                        <div className="job-card-meta">
                          <span>🏢 {job.company}</span>
                          <span>📍 {job.location || 'Remote'}</span>
                        </div>
                        <div style={{marginTop: '4px'}}>
                          <span className={`source-badge ${getSourceBadgeClass(job.source)}`}>
                            {job.source}
                          </span>
                        </div>
                      </div>
                    ))}
                    {jobs.length === 0 && (
                      <div style={{color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px'}}>
                        Enter keywords above to query job portals.
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Detail Description Panel */}
                <div className="job-detail-panel">
                  {selectedJob ? (
                    <>
                      <div className="job-detail-header">
                        <h3>{selectedJob.title}</h3>
                        <div className="job-detail-meta-grid">
                          <div className="job-detail-meta-item">
                            <strong>Company</strong>
                            {selectedJob.company}
                          </div>
                          <div className="job-detail-meta-item">
                            <strong>Location</strong>
                            {selectedJob.location || 'Remote'}
                          </div>
                          <div className="job-detail-meta-item">
                            <strong>Source Portal</strong>
                            <span className={`source-badge ${getSourceBadgeClass(selectedJob.source)}`}>
                              {selectedJob.source}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="job-detail-body">
                        <h4 style={{fontSize: '13px', color: 'var(--text-title)', textTransform: 'uppercase', marginBottom: '8px'}}>
                          Description
                        </h4>
                        <div className="job-detail-description">
                          {selectedJob.description}
                        </div>
                      </div>

                      <div className="btn-group" style={{marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flexWrap: 'wrap', gap: '8px'}}>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleApply}
                          disabled={!selectedProfile || !selectedResume}
                          style={{flexGrow: 2, padding: '12px 20px', fontSize: '14px', minWidth: '200px'}}
                        >
                          🚀 Tailor Resume & Auto-Apply
                        </button>
                        <button 
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => handleAIGenerate('cover-letter')}
                          disabled={!selectedProfile || !selectedResume}
                          style={{flexGrow: 1, padding: '12px 14px', fontSize: '13px'}}
                        >
                          ✉️ Cover Letter
                        </button>
                        <button 
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => handleAIGenerate('cold-email')}
                          disabled={!selectedProfile || !selectedResume}
                          style={{flexGrow: 1, padding: '12px 14px', fontSize: '13px'}}
                        >
                          💬 Outreach
                        </button>
                        <button 
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => handleAIGenerate('interview-prep')}
                          disabled={!selectedProfile || !selectedResume}
                          style={{flexGrow: 1, padding: '12px 14px', fontSize: '13px'}}
                        >
                          🎯 Interview Prep
                        </button>
                      </div>
                      
                      {(!selectedProfile || !selectedResume) && (
                        <p style={{fontSize: '12px', color: 'var(--danger)', marginTop: '8px', textAlign: 'center'}}>
                          ⚠️ Note: Select a User Profile and Upload a Base Resume on the Dashboard first!
                        </p>
                      )}
                    </>
                  ) : (
                    <div style={{color: 'var(--text-muted)', textAlign: 'center', margin: 'auto'}}>
                      📋 Double click or select a job card on the left to review descriptions.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ──────────────────────────────────────────────
              APPLICATIONS TAB PANEL
              ────────────────────────────────────────────── */}
          {activeTab === 'applications' && (
            <div className="table-panel">
              <div className="panel-title" style={{marginBottom: '16px'}}>
                <span>📨 Application Activity History</span>
                <button className="btn btn-secondary" onClick={fetchApplications}>
                  🔄 Refresh Table
                </button>
              </div>

              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Source Portal</th>
                      <th>Submission Status</th>
                      <th>ATS Match Score</th>
                      <th>Applied Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td style={{fontWeight: '600', color: 'var(--text-title)'}}>{app.job_title}</td>
                        <td>{app.company}</td>
                        <td>
                          <span className={`source-badge ${getSourceBadgeClass(app.source)}`}>
                            {app.source}
                          </span>
                        </td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{width: '60px', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden'}}>
                              <div style={{height: '100%', width: `${app.match_score}%`, background: app.match_score > 75 ? 'var(--success)' : app.match_score > 50 ? 'var(--warning)' : 'var(--danger)'}}></div>
                            </div>
                            <span style={{fontWeight: '600'}}>{app.match_score}%</span>
                          </div>
                        </td>
                        <td style={{color: 'var(--text-muted)'}}>{app.applied_at}</td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', color: 'var(--text-muted)', padding: '40px'}}>
                          No applications have been sent yet. Apply to a job to see it listed here!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────
              CONSOLE LOGS TAB PANEL
              ────────────────────────────────────────────── */}
          {activeTab === 'logs' && (
            <div className="terminal-panel">
              <div className="terminal-header">
                <div style={{display: 'flex', gap: '6px'}}>
                  <div className="terminal-dot red"></div>
                  <div className="terminal-dot yellow"></div>
                  <div className="terminal-dot green"></div>
                </div>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'}}>
                  logs_daemon_stream.sh
                </div>
                <button className="btn btn-secondary" style={{padding: '5px 12px', fontSize: '12px'}} onClick={() => setLogs([])}>
                  🧹 Clear Console
                </button>
              </div>

              <div className="terminal-view">
                {logs.map((log, index) => (
                  <div key={index} className={`log-row log-${log.level}`}>
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-msg">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{color: 'var(--text-muted)', opacity: '0.4', margin: 'auto', fontFamily: 'var(--font-mono)'}}>
                    Console empty. Live events stream active...
                  </div>
                )}
                <div ref={logEndRef}></div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ──────────────────────────────────────────────
          MODALS & OVERLAYS SYSTEM
          ────────────────────────────────────────────── */}

      {/* Create Profile Modal */}
      {profileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>👤 Create User Profile</span>
              <span className="modal-close" onClick={() => setProfileModalOpen(false)}>×</span>
            </div>
            <form onSubmit={handleCreateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                  placeholder="Jane Doe" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={newProfile.email}
                  onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
                  placeholder="jane.doe@example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newProfile.phone}
                  onChange={(e) => setNewProfile({...newProfile, phone: e.target.value})}
                  placeholder="+1 (555) 019-2834" 
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label>LinkedIn URL</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newProfile.linkedin}
                    onChange={(e) => setNewProfile({...newProfile, linkedin: e.target.value})}
                    placeholder="linkedin.com/in/..." 
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>GitHub URL</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newProfile.github}
                    onChange={(e) => setNewProfile({...newProfile, github: e.target.value})}
                    placeholder="github.com/..." 
                  />
                </div>
              </div>
              <div className="btn-group" style={{marginTop: '20px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setProfileModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resume Modal */}
      {resumeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>📄 Upload Base Resume</span>
              <span className="modal-close" onClick={() => setResumeModalOpen(false)}>×</span>
            </div>
            <form onSubmit={handleUploadResume}>
              <div className="form-group">
                <label>Resume Label / Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Senior Software Engineer Resume" 
                  value={newResumeTitle}
                  onChange={(e) => setNewResumeTitle(e.target.value)}
                  required 
                />
              </div>
              
              <div className="form-group" style={{marginTop: '12px'}}>
                <label>Resume File</label>
                <input 
                  type="file" 
                  id="resume-file" 
                  style={{display: 'none'}} 
                  accept=".txt,.pdf,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
                <div 
                  className="file-upload-zone"
                  onClick={() => document.getElementById('resume-file').click()}
                >
                  <span className="upload-icon">📁</span>
                  <p>{selectedFile ? selectedFile.name : "Click to select a file from your system"}</p>
                  <span>Supports: PDF, DOCX, TXT (Max 5MB)</span>
                </div>
              </div>

              <div className="btn-group" style={{marginTop: '24px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setResumeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
                  Upload Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Results Modal */}
      {aiResultModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width: '620px', maxWidth: '90vw'}}>
            <div className="modal-header">
              <span>🤖 AI Career Assistant: {aiResultTitle}</span>
              <span className="modal-close" onClick={() => setAiResultModalOpen(false)}>×</span>
            </div>
            <div style={{background: '#0d0d12', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-subtle)', maxHeight: '380px', overflowY: 'auto', marginBottom: '20px', textAlign: 'left'}}>
              <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6'}}>
                {aiResultText}
              </pre>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-secondary" onClick={() => setAiResultModalOpen(false)}>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(aiResultText);
                  alert("Copied to clipboard!");
                }}
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Processing Progress Overlay */}
      {loading && (
        <div className="progress-overlay">
          <div className="spinner"></div>
          <span className="progress-text">{loadingText}</span>
          <span className="progress-subtext">{loadingSubtext}</span>
        </div>
      )}
    </div>
  );
}

export default App;
