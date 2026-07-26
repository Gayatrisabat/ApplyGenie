import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How does AI tailoring actually work?',
    answer:
      'Our AI analyzes job descriptions and your resume, then generates tailored versions highlighting relevant skills and experience. Each version is optimized for that specific role to maximize ATS matching.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use enterprise-grade encryption for all data. Your resume and personal information are never shared with third parties. We comply with GDPR and all privacy regulations.',
  },
  {
    question: 'Can I control which jobs ApplyGenie applies to?',
    answer:
      'Yes. You can set custom filters for job type, salary, location, and company preferences. You can review and approve applications before they\'re submitted.',
  },
  {
    question: 'What job boards does ApplyGenie support?',
    answer:
      'We currently support LinkedIn, Indeed, and Glassdoor with more integrations coming soon. The platform is designed to scale to new job boards easily.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'We offer a free tier with limited applications. Premium plans start at $29/month with unlimited applications and advanced AI features.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Of course. No lock-in contracts. Cancel your subscription at any time without penalties. Your data remains yours.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-b border-indigo-500/20"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-start justify-between gap-4 hover:text-indigo-400 transition-colors text-left"
      >
        <span className="text-lg font-semibold text-white flex-1">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-indigo-400" />
        </motion.div>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

export function FAQ() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-indigo-950/20">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">Everything you need to know</p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          className="border-t border-indigo-500/20"
        >
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
