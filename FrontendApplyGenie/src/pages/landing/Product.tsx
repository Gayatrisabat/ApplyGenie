import { PageLayout } from '@/components/landing/PageLayout'
import { motion } from 'framer-motion'
import { Zap, Brain, FileText, CheckCircle, MailIcon, Search, BarChart3, Log } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'AI-Powered Job Search',
    description: 'Intelligent job discovery across multiple sources in real-time.'
  },
  {
    icon: FileText,
    title: 'Resume Management',
    description: 'Organize and manage multiple professional profiles.'
  },
  {
    icon: Brain,
    title: 'AI Resume Tailoring',
    description: 'Automatically optimize your resume for each job application.'
  },
  {
    icon: CheckCircle,
    title: 'Automated Applications',
    description: 'Apply to hundreds of jobs automatically with perfect formatting.'
  },
  {
    icon: MailIcon,
    title: 'AI Cover Letter Generation',
    description: 'Generate personalized cover letters instantly.'
  },
  {
    icon: Zap,
    title: 'Recruiter Outreach',
    description: 'Generate compelling outreach messages for recruiters.'
  },
  {
    icon: Brain,
    title: 'Interview Preparation',
    description: 'Get interview tips and practice guidance for each role.'
  },
  {
    icon: BarChart3,
    title: 'Application Tracking',
    description: 'Monitor your applications and track responses.'
  },
  {
    icon: Log,
    title: 'Live Automation Logs',
    description: 'See exactly what ApplyGenie is doing in real-time.'
  },
]

export function Product() {
  return (
    <PageLayout title="The ApplyGenie Platform">
      <div className="prose prose-invert max-w-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-lg text-[#D1D1D1] leading-relaxed mb-6">
            ApplyGenie is an AI-powered job application platform that automates your entire job search process.
            Instead of spending hours filling out applications, ApplyGenie works 24/7 to find jobs, tailor your
            resume, and submit applications on your behalf.
          </p>
        </motion.div>

        <h2 className="text-3xl font-bold mt-12 mb-8">Platform Capabilities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 rounded-lg border border-[rgba(255,255,255,0.15)] hover:border-white transition-colors"
              >
                <Icon className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-[#D1D1D1] text-sm">{feature.description}</p>
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
          <h3 className="text-2xl font-bold mb-4">Why ApplyGenie?</h3>
          <ul className="space-y-3 text-[#D1D1D1]">
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Stop wasting hours on repetitive job applications</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Increase your application volume and interview rate</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Let AI optimize every application for ATS compatibility</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Focus on interviews instead of applications</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">•</span>
              <span>Get hired faster with AI-powered assistance</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </PageLayout>
  )
}
