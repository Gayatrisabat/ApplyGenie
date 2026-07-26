import { motion } from 'framer-motion'

interface CTAPremiumProps {
  onLaunchClick?: () => void
}

export function CTAPremium({ onLaunchClick }: CTAPremiumProps) {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight"
        >
          Stop Applying.
          <br />
          Start Getting Interviews.
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg text-[#D1D1D1] font-light mb-10 max-w-2xl mx-auto"
        >
          Join thousands of job seekers who have automated their application process and landed their dream roles.
        </motion.p>

        {/* Button */}
        <motion.button
          onClick={onLaunchClick}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 border border-white text-white font-serif font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
        >
          Launch ApplyGenie
        </motion.button>
      </div>
    </section>
  )
}
