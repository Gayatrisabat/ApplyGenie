import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { JobList } from '@/components/jobs/JobList'
import { JobDetails } from '@/components/jobs/JobDetails'
import { AIResultDialog } from '@/components/dialogs/AIResultDialog'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import type { Job } from '@/types'

interface JobSearchProps {
  onApplyClick?: () => void
}

export const JobSearch: React.FC<JobSearchProps> = ({ onApplyClick }) => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [limit, setLimit] = useState('10')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [aiResultOpen, setAiResultOpen] = useState(false)
  const [aiResultType, setAiResultType] = useState<'cover_letter' | 'cold_email' | 'interview_prep'>('cover_letter')
  const [aiResultContent, setAiResultContent] = useState('')
  const [loading, setLoading] = useState(false)

  // Get selected profile and resume from localStorage (simplified for now)
  const selectedProfileId = localStorage.getItem('selectedProfileId')
  const selectedResumeId = localStorage.getItem('selectedResumeId')

  // Search jobs mutation
  const searchMutation = useMutation({
    mutationFn: () =>
      api.searchJobs({
        keyword,
        location,
        limit: parseInt(limit),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['jobs'], data)
      if (data.length === 0) {
        toast.info('No jobs found matching your criteria')
      }
    },
    onError: () => {
      toast.error('Failed to search jobs')
    },
  })

  // Get jobs from cache
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => [],
    initialData: [],
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) {
      toast.error('Please enter a keyword')
      return
    }
    setLoading(true)
    try {
      await searchMutation.mutateAsync()
    } finally {
      setLoading(false)
    }
  }

  const handleTailorAndApply = async () => {
    if (!selectedJob || !selectedProfileId || !selectedResumeId) {
      toast.error('Please select a profile and resume')
      return
    }

    setLoading(true)
    try {
      await api.applyToJob({
        profile_id: selectedProfileId,
        job_id: selectedJob.id,
        resume_id: selectedResumeId,
        job_title: selectedJob.title,
        company_name: selectedJob.company,
        source: selectedJob.source,
      })
      toast.success('Application submitted!')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      onApplyClick?.()
    } catch {
      toast.error('Failed to apply to job')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAI = async (type: 'cover_letter' | 'cold_email' | 'interview_prep') => {
    if (!selectedJob || !selectedProfileId || !selectedResumeId) {
      toast.error('Please select a profile and resume')
      return
    }

    setLoading(true)
    try {
      const result =
        type === 'cover_letter'
          ? await api.generateCoverLetter({
              profile_id: selectedProfileId,
              job_id: selectedJob.id,
              resume_id: selectedResumeId,
              job_title: selectedJob.title,
              company_name: selectedJob.company,
            })
          : type === 'cold_email'
            ? await api.generateColdEmail({
                profile_id: selectedProfileId,
                job_id: selectedJob.id,
                resume_id: selectedResumeId,
                job_title: selectedJob.title,
                company_name: selectedJob.company,
              })
            : await api.generateInterviewPrep({
                profile_id: selectedProfileId,
                job_id: selectedJob.id,
                resume_id: selectedResumeId,
                job_title: selectedJob.title,
                company_name: selectedJob.company,
              })

      setAiResultType(type)
      setAiResultContent(result.content)
      setAiResultOpen(true)
      toast.success('Generated successfully!')
    } catch {
      toast.error(`Failed to generate ${type}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-6">
        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Label htmlFor="keyword">Keyword</Label>
                  <Input
                    id="keyword"
                    placeholder="e.g., React Developer"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={searchMutation.isPending}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={searchMutation.isPending}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Label htmlFor="limit">Results Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="10"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    min="1"
                    max="100"
                    disabled={searchMutation.isPending}
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex gap-2"
              >
                <Button type="submit" disabled={searchMutation.isPending} className="w-full md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Search Jobs
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <Card className="lg:col-span-1 h-[600px]">
            <CardContent className="p-0 h-full">
              <JobList
                jobs={jobs}
                selectedJobId={selectedJob?.id}
                isLoading={searchMutation.isPending}
                onSelect={setSelectedJob}
              />
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="lg:col-span-2 h-[600px]">
            <CardContent className="p-0 h-full">
              <JobDetails
                job={selectedJob}
                profileSelected={!!selectedProfileId}
                resumeSelected={!!selectedResumeId}
                isLoading={loading}
                onTailorAndApply={handleTailorAndApply}
                onGenerateCoverLetter={() => handleGenerateAI('cover_letter')}
                onGenerateOutreach={() => handleGenerateAI('cold_email')}
                onGenerateInterviewPrep={() => handleGenerateAI('interview_prep')}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Result Dialog */}
      <AIResultDialog
        open={aiResultOpen}
        onOpenChange={setAiResultOpen}
        type={aiResultType}
        content={aiResultContent}
        jobTitle={selectedJob?.title || ''}
        companyName={selectedJob?.company || ''}
      />

      {/* Loading Overlay */}
      <LoadingOverlay isOpen={loading} message="Processing..." />
    </div>
  )
}
