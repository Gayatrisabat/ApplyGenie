import { motion } from 'framer-motion'
import {
  FileText,
  Zap,
  Search,
  Shield,
  Mail,
  Activity,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'AI Resume Tailoring',
    description: 'Automatically tailors your resume to match job requirements.',
  },
  {
    icon: Zap,
    title: 'Automated Applications',
    description: 'Submit applications to hundreds of jobs in your sleep.',
  },
  {
    icon: Search,
    title: 'Live Job Search',
    description: 'Scans multiple job boards continuously for new opportunities.',
  },
  {
    icon: Shield,
    title: 'ATS Optimization',
    description: 'Ensures your resume passes Applicant Tracking Systems.',
  },
  {
    icon: Mail,
    title: 'AI Cover Letters',
    description: 'Generates personalized cover letters for each application.',
  },
  {
    icon: Activity,
    title: 'Real-Time Logs',
    description: 'Track every action with detailed automation logs.',
  },
]

export function FeaturesPremium() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-[#D1D1D1] max-w-2xl mx-auto font-light">
            A complete suite of AI-powered features designed to automate your job search.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative p-6 border border-[rgba(255,255,255,0.08)] bg-[#090909] hover:border-[rgba(255,255,255,0.15)] transition-all duration-300"
              >
                {/* Icon */}
                <div className="mb-4">
                  <Icon className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-serif font-semibold text-white mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#8A8A8A] font-light text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover border glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-[rgba(255,255,255,0.1)]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
