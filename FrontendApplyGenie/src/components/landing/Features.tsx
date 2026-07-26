import { motion } from 'framer-motion'
import {
  Wand2,
  Zap,
  Search,
  BarChart3,
  Mail,
  Activity,
} from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'AI Resume Tailoring',
    description: 'Automatically customize your resume for each job application using advanced AI.',
  },
  {
    icon: Zap,
    title: 'Automated Job Applications',
    description: 'Submit applications instantly without manual effort. Let AI handle it all.',
  },
  {
    icon: Search,
    title: 'Live Job Search',
    description: 'Search across multiple job providers in real-time and get instant matches.',
  },
  {
    icon: BarChart3,
    title: 'Application Tracking',
    description: 'Track every application with real-time status updates and ATS scores.',
  },
  {
    icon: Mail,
    title: 'AI Cover Letter Generator',
    description: 'Generate personalized cover letters instantly for perfect job fit.',
  },
  {
    icon: Activity,
    title: 'Real-Time Automation Logs',
    description: 'Monitor every step of the automation process with live console logs.',
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-serif">
            Powerful features designed to automate your job search and land your dream role.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent hover:border-white/40 transition-all duration-300"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-hover:from-white/10 group-hover:via-white/5 group-hover:to-white/10 transition-all duration-300 pointer-events-none" />

                {/* Icon */}
                <motion.div
                  className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-serif font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed font-serif">{feature.description}</p>

                {/* Border Light */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-white/20 to-transparent via-transparent" />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
