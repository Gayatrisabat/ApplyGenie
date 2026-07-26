import { useRef, useEffect, useState } from 'react'

interface HeroPremiumProps {
  onLaunchClick?: () => void
}

export function HeroPremium({ onLaunchClick }: HeroPremiumProps) {
  const [displayedText, setDisplayedText] = useState<string[]>(['', '', ''])
  const [showCursor, setShowCursor] = useState(true)
  const [currentLine, setCurrentLine] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    // Wait for fonts to load
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true)
      })
    } else {
      setFontsLoaded(true)
    }
  }, [])

  const lines = [
    'AI That Finds Jobs.',
    'AI That Applies.',
    'You Get Hired.',
  ]

  const description =
    'ApplyGenie searches live jobs, tailors your resume using AI, generates personalized cover letters, and automatically submits applications—so you can focus on interviews instead of repetitive applications.'

  useEffect(() => {
    if (animationComplete) {
      const timer = setTimeout(() => setShowDescription(true), 500)
      return () => clearTimeout(timer)
    }
  }, [animationComplete])

  useEffect(() => {
    if (showDescription) {
      const timer = setTimeout(() => setShowButtons(true), 800)
      return () => clearTimeout(timer)
    }
  }, [showDescription])

  useEffect(() => {
    if (currentLine > 2) {
      setAnimationComplete(true)
      return
    }

    const currentText = displayedText[currentLine]
    const targetText = lines[currentLine]

    if (currentText === targetText) {
      // Move to next line after pause
      const timer = setTimeout(() => {
        if (currentLine < 2) {
          setCurrentLine(currentLine + 1)
          setShowCursor(true)
        } else {
          setAnimationComplete(true)
          setShowCursor(false)
        }
      }, 700)
      return () => clearTimeout(timer)
    }

    // Type character
    const timer = setTimeout(() => {
      const newText = [...displayedText]
      newText[currentLine] = targetText.substring(0, currentText.length + 1)
      setDisplayedText(newText)
      setShowCursor(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [displayedText, currentLine, animationComplete])

  return (
    <section
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Animated 3D-like background with SVG */}
      <div className="absolute inset-0 opacity-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#glow)" stroke="white" strokeWidth="2" fill="none">
            <circle cx="500" cy="500" r="300" opacity="0.3" />
            <circle cx="500" cy="500" r="200" opacity="0.5" />
            <circle cx="500" cy="500" r="100" opacity="0.3" />
            <path d="M 500 200 L 700 500 L 500 800 L 300 500 Z" opacity="0.4" />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Hero Text */}
        <div className="max-w-4xl text-center mb-12">
          <h1 style={{ fontFamily: "'Playfair Display', 'Lora', serif", fontSize: 'clamp(3rem, 10vw, 9rem)' }} className="font-bold text-white leading-tight tracking-tight">
            {displayedText.map((line, idx) => (
              <div key={idx} className="min-h-[1.2em]">
                {line}
                {idx === currentLine && showCursor && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
            ))}
          </h1>
        </div>

        {/* Description */}
        {showDescription && (
          <div className="max-w-2xl mb-12 animate-fadeInUp">
            <p className="text-lg md:text-xl text-[#D1D1D1] font-light leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Buttons */}
        {showButtons && (
          <div className="flex flex-col sm:flex-row gap-6 animate-fadeInUp">
            <button 
              onClick={onLaunchClick}
              className="px-8 py-3 border border-white text-white font-serif font-medium hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              Launch ApplyGenie
            </button>
            <button className="px-8 py-3 border border-[#D1D1D1] text-[#D1D1D1] font-serif font-medium hover:border-white hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer">
              Watch Demo
            </button>
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-5" />
    </section>
  )
}
