import { motion } from 'framer-motion'
import { BarChart3, FileText, Zap, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Stats } from '@/types'

interface StatisticsPanelProps {
  stats: Stats | null
  isLoading?: boolean
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  index: number
  trend?: number
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, index, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats, isLoading }) => {
  const metrics = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Profiles',
      value: stats?.total_profiles || 0,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Resumes',
      value: stats?.total_resumes || 0,
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: 'Jobs Parsed',
      value: stats?.total_jobs_parsed || 0,
    },
    {
      icon: <Send className="h-5 w-5" />,
      label: 'Applications Sent',
      value: stats?.total_applications_sent || 0,
    },
  ]

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
