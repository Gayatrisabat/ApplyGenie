import { NavbarPremium } from '@/components/landing/NavbarPremium'
import { HeroPremium } from '@/components/landing/Hero3D'
import { FeaturesPremium } from '@/components/landing/FeaturesPremium'
import { HowItWorksPremium } from '@/components/landing/HowItWorksPremium'
import { StatsPremium } from '@/components/landing/StatsPremium'
import { CTAPremium } from '@/components/landing/CTAPremium'
import { Footer } from '@/components/landing/Footer'

interface LandingProps {
  onLaunchClick: () => void
}

export function Landing({ onLaunchClick }: LandingProps) {
  return (
    <div className="w-full bg-black overflow-hidden">
      <NavbarPremium onLaunchClick={onLaunchClick} />
      <HeroPremium onLaunchClick={onLaunchClick} />
      <FeaturesPremium />
      <HowItWorksPremium />
      <StatsPremium />
      <CTAPremium onLaunchClick={onLaunchClick} />
      <Footer />
    </div>
  )
}
