import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { ApplicationsTable } from '@/components/applications/ApplicationsTable'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import type { Application } from '@/types'

export const Applications = () => {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: api.getApplications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Delete application mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: (id: string) => api.deleteApplication(id),
    onSuccess: () => {
      toast.success('Application deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: () => {
      toast.error('Failed to delete application')
    },
  })

  const handleDeleteApplication = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteApplicationMutation.mutate(id)
    }
  }

  const handleDownloadResume = async (applicationId: string) => {
    setLoading(true)
    try {
      const blob = await api.downloadTailoredResume(applicationId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tailored_resume_${applicationId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Resume downloaded successfully!')
    } catch {
      toast.error('Failed to download resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8">
        <ApplicationsTable
          applications={applications}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={10}
          onPageChange={setCurrentPage}
          onDownload={handleDownloadResume}
          onDelete={handleDeleteApplication}
          onViewDetails={(app) => {
            console.log('View details:', app)
            // TODO: Implement details modal
          }}
        />
      </div>

      <LoadingOverlay isOpen={loading} message="Downloading resume..." />
    </div>
  )
}
