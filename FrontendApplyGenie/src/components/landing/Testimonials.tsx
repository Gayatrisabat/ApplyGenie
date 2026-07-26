import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Tech Startup',
    text: 'ApplyGenie saved me countless hours. I went from manually applying to 5 jobs a week to 50+ with better customization. Landed my dream role in 3 weeks.',
    avatar: '👩‍💼',
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager',
    company: 'Fortune 500',
    text: 'The AI tailoring is incredibly accurate. Each resume felt personalized for the role. My interview rate increased by 300% in the first month.',
    avatar: '👨‍💼',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist',
    company: 'Startup',
    text: 'Finally, an automation tool that actually works. The real-time logs give me confidence that everything is handled correctly.',
    avatar: '👩‍🔬',
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [autoPlay])

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
    setAutoPlay(false)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setAutoPlay(false)
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            What Users Say
          </h2>
          <p className="text-xl text-gray-400">Join thousands of successful job seekers</p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative p-8 sm:p-12 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-indigo-400 text-indigo-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                "{testimonials[current].text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="text-4xl">{testimonials[current].avatar}</div>
                <div>
                  <p className="font-semibold text-white">{testimonials[current].name}</p>
                  <p className="text-sm text-gray-400">
                    {testimonials[current].role} at {testimonials[current].company}
                  </p>
                </div>
              </div>

              {/* Background glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/10 via-transparent to-purple-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrent(index)
                    setAutoPlay(false)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === current
                      ? 'bg-indigo-500 w-8'
                      : 'bg-indigo-500/30 w-2 hover:bg-indigo-500/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-full border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
