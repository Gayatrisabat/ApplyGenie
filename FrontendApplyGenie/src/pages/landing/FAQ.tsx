import { PageLayout } from '@/components/landing/PageLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What is ApplyGenie?',
    a: 'ApplyGenie is an AI-powered job application automation platform that helps you find jobs, tailor applications, and apply to positions automatically while you focus on interviews.'
  },
  {
    q: 'How does Auto Apply work?',
    a: 'Our AI analyzes job descriptions, tailors your resume for each position, generates personalized cover letters, and submits applications automatically 24/7.'
  },
  {
    q: 'Is my data secure?',
    a: 'Yes, we take security seriously. All data is encrypted, stored securely, and never shared with third parties. Your information is fully protected.'
  },
  {
    q: 'Can I manage multiple resumes?',
    a: 'Absolutely. You can create and manage multiple professional profiles for different industries and career paths.'
  },
  {
    q: 'Which AI tools are available?',
    a: 'We offer AI resume tailoring, cover letter generation, recruiter outreach message generation, and interview preparation guidance.'
  },
  {
    q: 'How is application history tracked?',
    a: 'Every application is logged in real-time with status updates, recruiter responses, and interview invitations tracked in your dashboard.'
  },
]

function FAQItem({ item, idx }: { item: typeof faqs[0]; idx: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      className="border border-[rgba(255,255,255,0.15)] rounded-lg overflow-hidden hover:border-white transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h3 className="font-bold text-lg text-left">{item.q}</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6 border-t border-[rgba(255,255,255,0.15)]"
        >
          <p className="text-[#D1D1D1]">{item.a}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export function FAQ() {
  return (
    <PageLayout title="Frequently Asked Questions">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-lg text-[#D1D1D1] leading-relaxed">
          Find answers to common questions about ApplyGenie and how it can help accelerate your job search.
        </p>
      </motion.div>

      <div className="space-y-4 max-w-3xl">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} item={faq} idx={idx} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 p-8 rounded-lg border border-[rgba(255,255,255,0.15)] bg-white/5 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="text-[#D1D1D1] mb-6">
          Can't find the answer you're looking for? Please contact our support team.
        </p>
        <a
          href="mailto:support@applygenie.com"
          className="inline-block px-6 py-3 border border-white text-white hover:bg-white hover:text-black transition-all font-medium rounded-lg"
        >
          Contact Support
        </a>
      </motion.div>
    </PageLayout>
  )
}
