import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Bot } from 'lucide-react'

interface LandingNavbarProps {
  onLaunchClick: () => void
}

export function LandingNavbar({ onLaunchClick }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Demo', href: '#demo' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/50 backdrop-blur-md transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2 font-bold text-xl text-white font-serif hover:text-white/80 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Bot className="w-6 h-6 text-white" />
            ApplyGenie
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-white/60 hover:text-white transition-colors text-sm font-serif font-medium"
                whileHover={{ y: -2 }}
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onLaunchClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:inline-block px-6 py-2 rounded-lg bg-white text-background font-serif font-semibold hover:bg-white/90 transition-colors"
            >
              Launch App
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden pb-4 space-y-3"
          >
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg font-serif transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.button
              onClick={() => {
                setIsOpen(false)
                onLaunchClick()
              }}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-indigo-600 transition-colors"
            >
              Launch App
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
