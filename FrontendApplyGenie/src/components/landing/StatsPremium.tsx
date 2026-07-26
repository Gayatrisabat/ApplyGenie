import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const stats = [
  { value: 1000, suffix: '+', label: 'Applications Submitted' },
  { value: 95, suffix: '%', label: 'Average ATS Match' },
  { value: 3, suffix: '+', label: 'Live Job Sources' },
  { value: 24, suffix: '/7', label: 'AI Automation' },
]

function Counter({
  target,
  suffix,
}: {
  target: number
  suffix: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    const increment = target / 50

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(timer)
  }, [target])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export function StatsPremium() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black border-y border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[#8A8A8A] font-light text-sm md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
