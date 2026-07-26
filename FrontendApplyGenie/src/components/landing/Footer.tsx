import { motion } from 'framer-motion'
import { Bot, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
    Company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
    ],
    Legal: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
      { label: 'Contact', href: '#contact' },
    ],
  }

  const socials = [
    { type: 'image', src: '/github.png', href: '#github', label: 'GitHub' },
    { type: 'text', text: 'in', href: '#linkedin', label: 'LinkedIn' },
    { type: 'icon', icon: Mail, href: '#email', label: 'Email' },
  ]

  return (
    <footer className="bg-black border-t border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-6 h-6 text-white" />
              <span className="font-serif font-bold text-lg text-white">
                ApplyGenie
              </span>
            </div>
            <p className="text-[#8A8A8A] text-sm font-light">
              AI-powered job application automation platform.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {links.Product.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#8A8A8A] hover:text-white transition-colors text-sm font-light"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {links.Company.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#8A8A8A] hover:text-white transition-colors text-sm font-light"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.Legal.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#8A8A8A] hover:text-white transition-colors text-sm font-light"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.08)] py-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-[#8A8A8A] text-sm font-light">
            &copy; {currentYear} ApplyGenie. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="p-2 border border-[rgba(255,255,255,0.15)] text-white hover:border-white transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.1, y: -2 }}
                aria-label={social.label}
              >
                {social.type === 'image' ? (
                  <img src={social.src} alt={social.label} className="w-5 h-5" />
                ) : social.type === 'icon' ? (
                  <social.icon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{social.text}</span>
                )}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
