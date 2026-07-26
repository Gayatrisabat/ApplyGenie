import { PageLayout } from '@/components/landing/PageLayout'
import { motion } from 'framer-motion'
import { Database, Zap, Lock, Users, Clock, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Database,
    title: 'Multi-Resume Support',
    description: 'Store and manage multiple professional profiles for different industries.'
  },
  {
    icon: Zap,
    title: 'One-Click Applications',
    description: 'Submit applications with a single click. AI handles the rest.'
  },
  {
    icon: Lock,
    title: 'ATS Optimization',
    description: 'Every application is automatically optimized for Applicant Tracking Systems.'
  },
  {
    icon: Users,
    title: 'Recruiter Intelligence',
    description: 'Identify and reach out to relevant recruiters automatically.'
  },
  {
    icon: Clock,
    title: '24/7 Automation',
    description: 'Work while you sleep. ApplyGenie continues applying around the clock.'
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track application success rates and interview metrics.'
  },
]

export function Features() {
  return (
    <PageLayout title="Core Features">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-lg text-[#D1D1D1] leading-relaxed">
          Discover the powerful features that make ApplyGenie the most effective job automation platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-8 rounded-lg border border-[rgba(255,255,255,0.15)] hover:border-white transition-all group hover:bg-white/5"
            >
              <div className="mb-4 p-3 w-fit rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-[#D1D1D1]">{feature.description}</p>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 p-8 rounded-lg border border-[rgba(255,255,255,0.15)] bg-white/5"
      >
        <h2 className="text-2xl font-bold mb-4">Built with Job Seekers in Mind</h2>
        <p className="text-[#D1D1D1] mb-4">
          Every feature is designed to save you time and increase your chances of landing interviews.
          Whether you're job searching actively or passively, ApplyGenie adapts to your needs.
        </p>
        <p className="text-[#D1D1D1]">
          Our AI continuously learns from successful applications to improve your results over time.
        </p>
      </motion.div>
    </PageLayout>
  )
}
