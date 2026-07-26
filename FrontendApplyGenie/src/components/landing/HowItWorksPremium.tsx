import { motion } from 'framer-motion'

const steps = [
  { title: 'Upload Resume', number: '01' },
  { title: 'Search Jobs', number: '02' },
  { title: 'AI Tailors Resume', number: '03' },
  { title: 'Auto Apply', number: '04' },
  { title: 'Track Applications', number: '05' },
]

export function HowItWorksPremium() {
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
            How It Works
          </h2>
          <p className="text-lg text-[#D1D1D1] font-light">
            Five simple steps to automate your job search.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="flex items-center gap-6 mb-8"
              >
                {/* Number Circle */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 border border-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center">
                    <span className="text-sm font-serif font-bold text-[#D1D1D1]">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-serif font-semibold text-white">
                  {step.title}
                </h3>
              </motion.div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 + 0.2 }}
                  className="h-8 border-l border-[rgba(255,255,255,0.1)] ml-6"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
