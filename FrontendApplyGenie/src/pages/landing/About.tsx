import { PageLayout } from '@/components/landing/PageLayout'
import { motion } from 'framer-motion'

export function About() {
  return (
    <PageLayout title="About ApplyGenie">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="prose prose-invert max-w-none space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">What is ApplyGenie?</h2>
          <p className="text-lg text-[#D1D1D1] leading-relaxed">
            ApplyGenie is an AI-powered job search automation platform designed to revolutionize how job seekers approach 
            their career transitions. We automate the tedious, repetitive process of applying to jobs so you can focus on 
            what matters: preparing for interviews and landing your dream role.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Why We Built It</h2>
          <p className="text-lg text-[#D1D1D1] leading-relaxed">
            The traditional job search is broken. Job seekers spend countless hours filling out applications, tailoring 
            resumes for each position, and managing responses from multiple companies. Meanwhile, quality opportunities 
            go unnoticed because they weren't seen at the right time.
          </p>
          <p className="text-lg text-[#D1D1D1] leading-relaxed">
            We created ApplyGenie to solve this problem. By automating applications and leveraging AI to optimize your 
            candidacy, we help you apply to more jobs with better fit, faster.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold">The Problem We Solve</h2>
          <ul className="space-y-3 text-lg text-[#D1D1D1]">
            <li className="flex gap-3">
              <span className="text-white">•</span>
              <span>Manual applications are time-consuming and repetitive</span>
            </li>
            <li className="flex gap-3">
              <span className="text-white">•</span>
              <span>Most applications fail to pass ATS (Applicant Tracking Systems)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-white">•</span>
              <span>Job seekers miss opportunities while sleeping or working</span>
            </li>
            <li className="flex gap-3">
              <span className="text-white">•</span>
              <span>Application volume directly correlates with interview rate</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-lg border border-[rgba(255,255,255,0.15)] bg-white/5">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-[#D1D1D1] text-lg">
            To empower job seekers with AI-driven automation that increases their application volume, improves 
            candidacy optimization, and ultimately leads to more interviews and job offers.
          </p>
        </div>
      </motion.div>
    </PageLayout>
  )
}
