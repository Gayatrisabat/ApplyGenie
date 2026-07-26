import { motion, AnimatePresence } from 'framer-motion'

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
  subtitle?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  message = 'Processing...',
  subtitle,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center space-y-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            {/* Animated Spinner */}
            <motion.div
              className="h-16 w-16 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="url(#spinner-gradient)"
                  strokeWidth="3"
                  strokeDasharray="31.4 94.2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Message */}
            <div className="space-y-1">
              <motion.h2
                className="text-xl font-semibold"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {message}
              </motion.h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
