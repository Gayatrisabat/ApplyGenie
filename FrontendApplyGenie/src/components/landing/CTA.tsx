import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface CTAProps {
  onLaunchClick: () => void
}

export function CTA({ onLaunchClick }: CTAProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_50%)]" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
          Ready to Let AI Apply for Jobs While You Sleep?
        </h2>

        <p className="text-xl text-white/70 mb-8 font-serif">
          Join thousands of job seekers automating their applications and landing interviews faster.
        </p>

        <motion.button
          onClick={onLaunchClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center gap-2 px-10 py-4 text-lg font-serif font-semibold text-background"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white to-white/80 p-0.5">
            <div className="absolute inset-0 rounded-lg bg-background" />
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-white/20 blur-xl"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Content */}
          <span className="relative flex items-center gap-2">
            Launch ApplyGenie
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 10 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/70 font-serif"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Free trial for 14 days
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Cancel anytime
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
