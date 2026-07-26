import { PageLayout } from '@/components/landing/PageLayout'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for exploring',
    features: [
      'Resume Management',
      'Live Job Search',
      'Application History',
    ]
  },
  {
    name: 'Pro',
    description: 'Most popular',
    features: [
      'Unlimited Profiles',
      'AI Resume Tailoring',
      'Cover Letter Generator',
      'Outreach Generator',
      'Interview Preparation',
      'Automated Applications',
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    description: 'For teams',
    features: [
      'Team Management',
      'Advanced Analytics',
      'API Access',
      'Priority Support',
    ]
  }
]

export function Pricing() {
  return (
    <PageLayout title="Simple, Transparent Pricing">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-lg text-[#D1D1D1] leading-relaxed">
          Choose the plan that works for you. All plans come with a 14-day free trial.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={`p-8 rounded-lg border transition-all ${
              plan.highlighted
                ? 'border-white bg-white/10 scale-105'
                : 'border-[rgba(255,255,255,0.15)] hover:border-white'
            }`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-[#D1D1D1] mb-6">{plan.description}</p>
            
            <div className="mb-8 p-4 rounded-lg bg-white/5">
              <p className="text-3xl font-bold">Coming Soon</p>
              <p className="text-[#D1D1D1] text-sm mt-2">Pricing will be announced soon</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, fidx) => (
                <li key={fidx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-[#D1D1D1]">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full py-3 rounded-lg border border-white text-white hover:bg-white hover:text-black transition-all font-medium">
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 p-8 rounded-lg border border-[rgba(255,255,255,0.15)] bg-white/5"
      >
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">Can I change plans anytime?</h3>
            <p className="text-[#D1D1D1]">Yes, you can upgrade or downgrade your plan at any time.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Is there a credit card required for the free trial?</h3>
            <p className="text-[#D1D1D1]">No credit card is required to get started.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
            <p className="text-[#D1D1D1]">We accept all major credit cards and payment methods.</p>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  )
}
