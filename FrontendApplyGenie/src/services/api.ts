import type { Profile, Resume, Stats, Job, Application, AIResult, SearchFilters } from '@/types'

const API_BASE = window.location.port === '5173' ? 'http://127.0.0.1:8000' : ''

const headers = {
  'Content-Type': 'application/json',
}

export const api = {
  // Stats
  getStats: async (): Promise<Stats> => {
    const response = await fetch(`${API_BASE}/api/stats`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    return response.json()
  },

  // Profiles
  getProfiles: async (): Promise<Profile[]> => {
    const response = await fetch(`${API_BASE}/api/profiles`)
    if (!response.ok) throw new Error('Failed to fetch profiles')
    return response.json()
  },

  createProfile: async (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> => {
    const response = await fetch(`${API_BASE}/api/profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create profile')
    return response.json()
  },

  updateProfile: async (id: string, data: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_BASE}/api/profiles/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
  },

  deleteProfile: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/profiles/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete profile')
  },

  // Resumes
  getProfileResumes: async (profileId: string): Promise<Resume[]> => {
    const response = await fetch(`${API_BASE}/api/profiles/${profileId}/resumes`)
    if (!response.ok) throw new Error('Failed to fetch resumes')
    return response.json()
  },

  uploadResume: async (profileId: string, file: File, isPrimary: boolean = false): Promise<Resume> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('is_primary', String(isPrimary))

    const response = await fetch(`${API_BASE}/api/profiles/${profileId}/resumes`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Failed to upload resume')
    return response.json()
  },

  deleteResume: async (resumeId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/resumes/${resumeId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete resume')
  },

  getResumePreview: async (resumeId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/preview`)
    if (!response.ok) throw new Error('Failed to fetch resume preview')
    return response.blob()
  },

  // Jobs
  searchJobs: async (filters: SearchFilters): Promise<Job[]> => {
    const response = await fetch(`${API_BASE}/api/jobs/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(filters),
    })
    if (!response.ok) throw new Error('Failed to search jobs')
    return response.json()
  },

  // Applications
  applyToJob: async (data: {
    profile_id: string
    job_id: string
    resume_id: string
    job_title: string
    company_name: string
    source: string
  }): Promise<Application> => {
    const response = await fetch(`${API_BASE}/api/jobs/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to apply to job')
    return response.json()
  },

  getApplications: async (): Promise<Application[]> => {
    const response = await fetch(`${API_BASE}/api/applications`)
    if (!response.ok) throw new Error('Failed to fetch applications')
    return response.json()
  },

  deleteApplication: async (applicationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/applications/${applicationId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete application')
  },

  downloadTailoredResume: async (applicationId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/api/tailored-resumes/${applicationId}/download`)
    if (!response.ok) throw new Error('Failed to download resume')
    return response.blob()
  },

  // AI
  generateCoverLetter: async (data: {
    profile_id: string
    job_id: string
    resume_id: string
    job_title: string
    company_name: string
  }): Promise<AIResult> => {
    const response = await fetch(`${API_BASE}/api/ai/cover-letter`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to generate cover letter')
    return response.json()
  },

  generateColdEmail: async (data: {
    profile_id: string
    job_id: string
    resume_id: string
    job_title: string
    company_name: string
  }): Promise<AIResult> => {
    const response = await fetch(`${API_BASE}/api/ai/cold-email`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to generate cold email')
    return response.json()
  },

  generateInterviewPrep: async (data: {
    profile_id: string
    job_id: string
    resume_id: string
    job_title: string
    company_name: string
  }): Promise<AIResult> => {
    const response = await fetch(`${API_BASE}/api/ai/interview-prep`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to generate interview prep')
    return response.json()
  },
}
