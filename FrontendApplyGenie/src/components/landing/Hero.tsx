import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroProps {
  onLaunchClick: () => void
}

export function Hero({ onLaunchClick }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const headline = ['Land', 'Your', 'Dream', 'Job.', 'Automatically.']
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
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Dark gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-background to-slate-950"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* 3D Animated White Cubes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`cube-${i}`}
            className="absolute w-16 h-16 border-2 border-white/30 bg-white/5"
            style={{
              perspective: '1000px',
            }}
            initial={{
              x: Math.random() * window.innerWidth - 32,
              y: Math.random() * window.innerHeight - 32,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              opacity: 0.2,
            }}
            animate={{
              rotateX: [0, 360, 0],
              rotateY: [0, 360, 0],
              rotateZ: [0, 360, 0],
              y: [0, -150, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Floating White Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.4,
            }}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Mouse Following Glow */}
        <motion.div
          className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: 'spring', damping: 30, mass: 0.5 }}
        />

        {/* Animated Blobs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm text-white/90 font-serif">AI-Powered Job Automation</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {headline.map((word, index) => (
              <motion.span
                key={index}
                variants={itemVariants}
                className={`text-4xl sm:text-5xl lg:text-7xl font-serif font-bold tracking-tight ${
                  word === 'Dream' || word === 'Job.'
                    ? 'bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent'
                    : 'text-white'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg sm:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed font-serif"
        >
          Manage resumes, discover live jobs, tailor every application with AI, and let ApplyGenie
          automatically submit applications while you focus on interviews.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={onLaunchClick}
            className="group relative px-8 py-4 rounded-lg bg-white text-background font-serif font-semibold overflow-hidden hover:bg-white/90 transition-all duration-300 flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              Start Applying
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button className="px-8 py-4 rounded-lg border-2 border-white text-white font-serif font-semibold hover:bg-white/10 transition-colors duration-300">
            Watch Demo
          </button>
        </motion.div>
      </div>
    </div>
  )
}
