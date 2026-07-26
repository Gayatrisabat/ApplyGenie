import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const demoSteps = [
  'Searching for jobs...',
  'Found 1,247 matching jobs',
  'Tailoring resumes...',
  'Generated 15 tailored versions',
  'Opening applications...',
  'Auto-filling forms...',
  'Submitting applications...',
  'Application Sent ✓',
]

export function LiveDemo() {
  const [displayedText, setDisplayedText] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (stepIndex >= demoSteps.length) {
      setIsComplete(true)
      return
    }

    const step = demoSteps[stepIndex]
    let charIndex = 0

    const typingInterval = setInterval(() => {
      if (charIndex < step.length) {
        setDisplayedText(step.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setDisplayedText('')
          setStepIndex(stepIndex + 1)
        }, 1500)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [stepIndex])

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Live Demo</h2>
          <p className="text-xl text-gray-400">Watch ApplyGenie in action</p>
        </motion.div>

        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-lg overflow-hidden border border-indigo-500/20 bg-gray-950 shadow-2xl"
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-auto text-xs text-gray-500">ApplyGenie Terminal</span>
          </div>

          {/* Terminal Content */}
          <div className="p-6 font-mono text-sm">
            <div className="space-y-2">
              <div className="text-green-400">$ applygenie --search --auto-apply</div>

              {/* Typing Animation */}
              <div className="text-gray-300 mt-6">
                <motion.span
                  key={stepIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {displayedText}
                </motion.span>
                {!isComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-indigo-400"
                  >
                    _
                  </motion.span>
                )}
              </div>

              {/* Completed Steps */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                  className="mt-6 space-y-1"
                >
                  {demoSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 text-green-400"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {step}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="pt-4 border-t border-gray-700 text-indigo-400 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Successfully completed!</span>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Reset Animation on View */}
        {isComplete && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onClick={() => {
              setStepIndex(0)
              setDisplayedText('')
              setIsComplete(false)
            }}
            className="mt-6 mx-auto block px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ↻ Replay Animation
          </motion.button>
        )}
      </div>
    </section>
  )
}
