import React from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface NavbarProps {
  title: string
  sidebarOpen?: boolean
  onSidebarToggle?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  sidebarOpen = false,
  onSidebarToggle,
}) => {
  return (
    <motion.header
      className="fixed top-0 right-0 left-0 lg:left-64 h-16 border-b border-border bg-background/80 backdrop-blur-lg z-30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Title + Menu */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.button>
          <h1 className="text-xl font-semibold truncate">{title}</h1>
        </div>

        {/* Right: Status Indicator */}
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Agent Active</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
