export interface Profile {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  profile_id: string
  filename: string
  file_path: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  salary?: string
  job_url: string
  description: string
  source: string
  posted_date?: string
  raw_content?: string
}

export interface Application {
  id: string
  profile_id: string
  job_id: string
  resume_id: string
  job_title: string
  company_name: string
  source: string
  status: 'pending' | 'applied' | 'rejected' | 'interview' | 'offer'
  ats_score: number
  applied_date: string
  tailored_resume_id?: string
  cover_letter?: string
}

export interface Stats {
  total_profiles: number
  total_resumes: number
  total_jobs_parsed: number
  total_applications_sent: number
}

export interface LogEntry {
  timestamp: string
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DEBUG'
  message: string
}

export interface AIResult {
  type: 'cover_letter' | 'cold_email' | 'interview_prep'
  content: string
  job_title: string
  company_name: string
}

export interface SearchFilters {
  keyword: string
  location: string
  limit: number
}
