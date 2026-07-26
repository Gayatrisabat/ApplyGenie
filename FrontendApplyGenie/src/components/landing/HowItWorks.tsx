import { motion } from 'framer-motion'
import { Upload, Search, Wand2, Send } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload Resume',
    description: 'Add your resume and profile information to ApplyGenie.',
  },
  {
    icon: Search,
    title: 'Find Jobs',
    description: 'Search and discover jobs from multiple providers in real-time.',
  },
  {
    icon: Wand2,
    title: 'AI Tailors Resume',
    description: 'Our AI customizes your resume for each specific job posting.',
  },
  {
    icon: Send,
    title: 'Auto Apply',
    description: 'Applications are submitted automatically with perfect fit.',
  },
]

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  }

  const arrowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.3 },
    },
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-indigo-950/20 to-black">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">Four simple steps to automate your job search</p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index}>
                <motion.div
                  variants={itemVariants}
                  className="flex gap-6 items-start"
                >
                  {/* Icon Circle */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-gray-400 text-lg">{step.description}</p>
                  </div>
                </motion.div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    variants={arrowVariants}
                    className="flex justify-center my-8"
                  >
                    <div className="text-indigo-400 text-4xl">↓</div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
