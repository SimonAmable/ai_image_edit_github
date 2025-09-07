'use client'

import { useState, useEffect } from 'react'
import LoadingIntro from "./LoadingIntro";

interface FirstVisitWrapperProps {
  children: React.ReactNode
}

export default function FirstVisitWrapper({ children }: FirstVisitWrapperProps) {
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    // Always show loading on initial load
    setShowLoading(true)
    
    // Hide loading after 5 seconds (duration of slideshow)
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  // Show loading component on every initial load
  if (showLoading) {
    return <LoadingIntro />
  }

  return <>{children}</>
}
