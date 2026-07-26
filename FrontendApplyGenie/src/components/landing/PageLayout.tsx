import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
}

export function PageLayout({ title, children }: PageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white font-serif">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.08)] sticky top-0 z-40 bg-black/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            whileHover={{ scale: 1.05 }}
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="font-bold text-lg">ApplyGenie</span>
          </motion.button>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-sm text-[#D1D1D1] hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#D1D1D1] hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="text-sm text-[#D1D1D1] hover:text-white transition-colors">Contact</a>
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 border border-white text-white text-sm hover:bg-white hover:text-black transition-all"
            >
              Launch App
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">{title}</h1>
        <div className="w-12 h-1 bg-white/30 mb-12" />
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#8A8A8A] text-sm">
          <p>&copy; {new Date().getFullYear()} ApplyGenie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
