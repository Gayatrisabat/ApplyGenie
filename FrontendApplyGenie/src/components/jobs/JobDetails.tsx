import { motion } from 'framer-motion'
import { Building2, MapPin, ExternalLink, Wand2, FileText, Mail, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScrollArea } from '@/components/ui/ScrollArea'
import type { Job } from '@/types'

interface JobDetailsProps {
  job: Job | null
  profileSelected?: boolean
  resumeSelected?: boolean
  isLoading?: boolean
  onTailorAndApply: () => void
  onGenerateCoverLetter: () => void
  onGenerateOutreach: () => void
  onGenerateInterviewPrep: () => void
}

export const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  profileSelected = false,
  resumeSelected = false,
  isLoading,
  onTailorAndApply,
  onGenerateCoverLetter,
  onGenerateOutreach,
  onGenerateInterviewPrep,
}) => {
  const isDisabled = !profileSelected || !resumeSelected || isLoading

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Select a job to view details</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <motion.div
        className="p-6 space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{job.company}</span>
              </div>
              {job.location && (
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
            </div>
            <motion.a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </motion.a>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{job.source}</Badge>
            {job.salary && <Badge variant="success">{job.salary}</Badge>}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full"
              onClick={onTailorAndApply}
              disabled={isDisabled}
              title={isDisabled ? 'Select profile and resume first' : ''}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Tailor & Auto Apply
            </Button>
          </motion.div>

          <div className="grid grid-cols-3 gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={onGenerateCoverLetter}
                disabled={isDisabled}
                title={isDisabled ? 'Select profile and resume first' : ''}
              >
                <FileText className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Cover Letter</span>
                <span className="sm:hidden">Letter</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={onGenerateOutreach}
                disabled={isDisabled}
                title={isDisabled ? 'Select profile and resume first' : ''}
              >
                <Mail className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Outreach</span>
                <span className="sm:hidden">Email</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={onGenerateInterviewPrep}
                disabled={isDisabled}
                title={isDisabled ? 'Select profile and resume first' : ''}
              >
                <Briefcase className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Interview</span>
                <span className="sm:hidden">Prep</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold mb-3">Job Description</h2>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>
      </motion.div>
    </ScrollArea>
  )
}
