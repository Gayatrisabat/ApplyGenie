import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Trash2, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { formatDate, getStatusColor } from '@/utils/format'
import type { Application } from '@/types'

interface ApplicationsTableProps {
  applications: Application[]
  isLoading?: boolean
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onDownload: (applicationId: string) => void
  onDelete: (applicationId: string) => void
  onViewDetails?: (application: Application) => void
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  isLoading,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onDownload,
  onDelete,
  onViewDetails,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalPages = Math.ceil(applications.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedApps = applications.slice(startIndex, startIndex + pageSize)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <p className="text-sm text-muted-foreground">No applications yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Apply to jobs to see them here</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <motion.div
                  className="inline-block min-w-full"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <div className="text-sm">
                    {/* Header */}
                    <div className="hidden md:grid md:grid-cols-8 gap-4 px-4 py-3 border-b border-border font-semibold text-xs text-muted-foreground">
                      <div>Job</div>
                      <div>Company</div>
                      <div>Source</div>
                      <div>Status</div>
                      <div>ATS Score</div>
                      <div>Applied</div>
                      <div>Download</div>
                      <div>Actions</div>
                    </div>

                    {/* Body */}
                    <AnimatePresence>
                      {paginatedApps.map((app) => (
                        <motion.div key={app.id} variants={item}>
                          {/* Desktop Row */}
                          <div
                            className="hidden md:grid md:grid-cols-8 gap-4 px-4 py-3 border-b border-border/50 hover:bg-secondary/30 transition-colors items-center cursor-pointer"
                            onMouseEnter={() => setHoveredId(app.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => onViewDetails?.(app)}
                          >
                            <div className="truncate text-sm font-medium">{app.job_title}</div>
                            <div className="truncate text-sm text-muted-foreground">{app.company_name}</div>
                            <div>
                              <Badge variant="outline" className="text-xs">
                                {app.source}
                              </Badge>
                            </div>
                            <div>
                              <Badge variant="default" className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={app.ats_score} max={100} />
                              <span className="text-xs font-medium">{app.ats_score}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(app.applied_date)}
                            </div>
                            <div>
                              {hoveredId === app.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDownload(app.id)
                                  }}
                                  className="h-7 px-2"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div>
                              {hoveredId === app.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(app.id)
                                  }}
                                  className="h-7 px-2 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Mobile Card */}
                          <div className="md:hidden border-b border-border/50 p-4 hover:bg-secondary/30 transition-colors">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                            >
                              <div className="flex-1">
                                <h3 className="font-medium text-sm mb-1">{app.job_title}</h3>
                                <p className="text-xs text-muted-foreground">{app.company_name}</p>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedId === app.id ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            </div>

                            <AnimatePresence>
                              {expandedId === app.id && (
                                <motion.div
                                  className="mt-3 pt-3 border-t border-border/30 space-y-3"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                                    <Badge variant="default" className={getStatusColor(app.status)}>
                                      {app.status}
                                    </Badge>
                                  </div>

                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">ATS Score</p>
                                    <div className="flex items-center gap-2">
                                      <Progress value={app.ats_score} max={100} className="flex-1" />
                                      <span className="text-xs font-medium">{app.ats_score}%</span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => onDownload(app.id)}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onDelete(app.id)}
                                      className="hover:text-red-400"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {paginatedApps.length === 0
                      ? 'No results'
                      : `${startIndex + 1}-${Math.min(startIndex + pageSize, applications.length)} of ${applications.length}`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPageChange?.(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPageChange?.(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
