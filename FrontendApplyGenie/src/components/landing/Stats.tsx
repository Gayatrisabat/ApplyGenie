import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string
  target?: number
  suffix?: string
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    // Auto-start counter after component mounts
    const timeout = setTimeout(() => setHasStarted(true), 500)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    let current = 0
    const increment = target / 50
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [hasStarted, target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

function StatCard({ label, value, target, suffix }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative p-8 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent hover:border-indigo-500/40 transition-all duration-300"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          {target !== undefined ? <AnimatedCounter target={target} suffix={suffix} /> : value}
        </p>
      </div>
    </motion.div>
  )
}

export function Stats() {
  const stats = [
    { label: 'Applications Submitted', value: '1000+', target: 1000, suffix: '+' },
    { label: 'ATS Match Rate', value: '95%', target: 95, suffix: '%' },
    { label: 'Job Providers', value: '3+', target: 3, suffix: '+' },
    { label: 'Availability', value: '24/7', target: 0, suffix: '' },
  ]

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

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-indigo-950/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Proven Results
          </h2>
          <p className="text-xl text-gray-400">ApplyGenie by the numbers</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              target={stat.target}
              suffix={stat.suffix}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
