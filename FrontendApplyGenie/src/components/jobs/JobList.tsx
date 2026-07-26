import { motion, AnimatePresence } from 'framer-motion'
import { Building2, MapPin } from 'lucide-react'
import { ScrollArea } from '@/components/ui/ScrollArea'
import type { Job } from '@/types'

interface JobListProps {
  jobs: Job[]
  selectedJobId?: string
  isLoading?: boolean
  onSelect: (job: Job) => void
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  selectedJobId,
  isLoading,
  onSelect,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="flex-1 space-y-3 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div>
            <p className="text-sm text-muted-foreground">No jobs found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search criteria</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <motion.div
            className="space-y-2 p-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={item}
                  onClick={() => onSelect(job)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border hover:border-border/50 hover:bg-secondary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                      {job.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </ScrollArea>
      )}
    </div>
  )
}
