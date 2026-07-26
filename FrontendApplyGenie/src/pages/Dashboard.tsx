import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { ProfilesPanel } from '@/components/dashboard/ProfilesPanel'
import { ResumesPanel } from '@/components/dashboard/ResumesPanel'
import { StatisticsPanel } from '@/components/dashboard/StatisticsPanel'
import { CreateProfileDialog } from '@/components/dialogs/CreateProfileDialog'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import type { Profile } from '@/types'

export const Dashboard = () => {
  const queryClient = useQueryClient()
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  // Fetch profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: api.getProfiles,
  })

  // Fetch resumes for selected profile
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ['resumes', selectedProfileId],
    queryFn: () => api.getProfileResumes(selectedProfileId!),
    enabled: !!selectedProfileId,
  })

  // Auto-select first profile and its primary resume
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id)
    }
  }, [profiles, selectedProfileId])

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const primaryResume = resumes.find((r) => r.is_primary)
      setSelectedResumeId(primaryResume ? primaryResume.id : resumes[0].id)
    }
  }, [resumes, selectedResumeId])

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: any) => api.createProfile(data),
    onSuccess: () => {
      toast.success('Profile created successfully!')
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setCreateProfileOpen(false)
    },
    onError: () => {
      toast.error('Failed to create profile')
    },
  })

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: (id: string) => api.deleteProfile(id),
    onSuccess: () => {
      toast.success('Profile deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setSelectedProfileId(null)
    },
    onError: () => {
      toast.error('Failed to delete profile')
    },
  })

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => api.deleteResume(id),
    onSuccess: () => {
      toast.success('Resume deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['resumes', selectedProfileId] })
    },
    onError: () => {
      toast.error('Failed to delete resume')
    },
  })

  const handleDeleteProfile = (id: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      deleteProfileMutation.mutate(id)
    }
  }

  const handleDeleteResume = (id: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      deleteResumeMutation.mutate(id)
    }
  }

  const handleUploadResume = () => {
    if (!selectedProfileId) {
      toast.error('Please select a profile first')
      return
    }
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setLoading(true)
        try {
          await api.uploadResume(selectedProfileId, file)
          toast.success('Resume uploaded successfully!')
          queryClient.invalidateQueries({ queryKey: ['resumes', selectedProfileId] })
        } catch {
          toast.error('Failed to upload resume')
        } finally {
          setLoading(false)
        }
      }
    }
    input.click()
  }

  const handlePreviewResume = async (resumeId: string) => {
    try {
      const blob = await api.getResumePreview(resumeId)
      const url = URL.createObjectURL(blob)
      window.open(url)
    } catch {
      toast.error('Failed to load resume preview')
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-8">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profiles */}
          <div className="min-h-[600px]">
            <ProfilesPanel
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              isLoading={profilesLoading}
              onSelect={setSelectedProfileId}
              onAdd={() => setCreateProfileOpen(true)}
              onEdit={() => {}} // TODO: Implement edit dialog
              onDelete={handleDeleteProfile}
            />
          </div>

          {/* Center: Resumes */}
          <div className="min-h-[600px]">
            <ResumesPanel
              resumes={resumes}
              selectedResumeId={selectedResumeId}
              isLoading={resumesLoading}
              profileSelected={!!selectedProfileId}
              onSelect={setSelectedResumeId}
              onUpload={handleUploadResume}
              onPreview={handlePreviewResume}
              onDelete={handleDeleteResume}
            />
          </div>

          {/* Right: Statistics */}
          <div className="min-h-[600px]">
            <StatisticsPanel stats={stats} isLoading={false} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateProfileDialog
        open={createProfileOpen}
        onOpenChange={setCreateProfileOpen}
        onSubmit={(data) => createProfileMutation.mutate(data)}
        isLoading={createProfileMutation.isPending}
      />

      {/* Loading Overlay */}
      <LoadingOverlay isOpen={loading} message="Uploading resume..." />
    </div>
  )
}
