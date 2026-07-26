import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Trash2, Star, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Resume } from '@/types'

interface ResumesPanelProps {
  resumes: Resume[]
  selectedResumeId?: string
  isLoading?: boolean
  profileSelected?: boolean
  onSelect: (resumeId: string) => void
  onUpload: () => void
  onPreview: (resumeId: string) => void
  onDelete: (resumeId: string) => void
}

export const ResumesPanel: React.FC<ResumesPanelProps> = ({
  resumes,
  selectedResumeId,
  isLoading,
  profileSelected = false,
  onSelect,
  onUpload,
  onPreview,
  onDelete,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle>Resumes</CardTitle>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            size="sm" 
            onClick={onUpload} 
            disabled={isLoading || !profileSelected}
            title={!profileSelected ? 'Select a profile first' : ''}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </motion.div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-secondary rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : !profileSelected ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Select a profile to view resumes</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No resumes uploaded</p>
            <Button size="sm" variant="outline" onClick={onUpload}>
              Upload Resume
            </Button>
          </div>
        ) : (
          <motion.div
            className="space-y-2 overflow-y-auto pr-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {resumes.map((resume) => (
                <motion.div
                  key={resume.id}
                  variants={item}
                  onHoverStart={() => setHoveredId(resume.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => onSelect(resume.id)}
                  className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedResumeId === resume.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border hover:border-border/50 hover:bg-secondary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">{resume.filename}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {resume.is_primary && (
                      <Badge variant="success" className="ml-2">
                        <Star className="h-2 w-2 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>

                  {hoveredId === resume.id && (
                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPreview(resume.id)
                        }}
                        className="h-7 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(resume.id)
                        }}
                        className="h-7 px-2 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
