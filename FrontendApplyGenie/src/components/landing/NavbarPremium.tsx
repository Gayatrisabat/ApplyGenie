import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Bot } from 'lucide-react'

interface NavbarPremiumProps {
  onLaunchClick: () => void
}

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'FAQ', href: '#faq' },
]

export function NavbarPremium({ onLaunchClick }: NavbarPremiumProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/50 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="font-serif font-bold text-white text-lg">
              ApplyGenie
            </span>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-[#D1D1D1] hover:text-white transition-colors text-sm font-medium"
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
              className="hidden sm:block px-6 py-2 border border-white text-white font-medium text-sm hover:bg-white hover:text-black transition-all duration-300"
            >
              Launch App
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2"
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
            className="md:hidden pb-4 border-t border-[rgba(255,255,255,0.08)]"
          >
            <div className="pt-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-[#D1D1D1] hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setIsOpen(false)
                  onLaunchClick()
                }}
                className="w-full px-4 py-2 border border-white text-white font-medium hover:bg-white hover:text-black transition-all duration-300"
              >
                Launch App
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
