'use client'

import React, { useState, useEffect, useMemo } from 'react'

const LoadingIntro = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([])
  const [allImagesReady, setAllImagesReady] = useState(false)
  const [showWelcomeSlide, setShowWelcomeSlide] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  
  // Array of 10 images using your local loading images
  const images = useMemo(() => [
    '/loading_images/g1.jpeg',
    '/loading_images/g2.jpeg',
    '/loading_images/g3.jpeg',
    '/loading_images/g4.jpeg',
    '/loading_images/g5.jpeg',
    '/loading_images/g6.jpeg',
    '/loading_images/g7.jpeg',
    '/loading_images/g7.jpeg',
    '/loading_images/g6.jpeg',
    '/loading_images/g5.jpeg',
    '/loading_images/g4.jpeg',
    '/loading_images/g3.jpeg',
    '/loading_images/g2.jpeg',
    '/loading_images/g1.jpeg',


  ], [])

  // Preload all images with better error handling
  useEffect(() => {
    const loadedStatus = new Array(images.length).fill(false)
    setImagesLoaded(loadedStatus)

    const preloadPromises = images.map((src, index) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image()
        
        img.onload = () => {
          console.log(`✅ Successfully loaded: ${src}`)
          setImagesLoaded(prev => {
            const newLoaded = [...prev]
            newLoaded[index] = true
            return newLoaded
          })
          resolve()
        }
        
        img.onerror = (error) => {
          console.error(`❌ Failed to load: ${src}`, error)
          // Still resolve to not block the slideshow
          resolve()
        }
        
        img.src = src
      })
    })

    // Wait for at least the first few images to load before starting slideshow
    Promise.allSettled(preloadPromises).then(() => {
      setAllImagesReady(true)
      console.log('🎬 All images processed, starting slideshow')
    })
  }, [images])

  // Start slideshow only after images are ready
  useEffect(() => {
    if (!allImagesReady) return

    let timeoutId: NodeJS.Timeout

    const showNextImage = (imageIndex: number) => {
      // Set the current image index
      setCurrentImageIndex(imageIndex)
      
      // Calculate display duration: 500ms for first image, decreasing by 50ms each time
      // Minimum duration of 100ms to prevent it from being too fast
      const baseDuration = 500
      const decreasePerImage = 50
      const minDuration = 100
      const duration = Math.max(minDuration, baseDuration - (imageIndex * decreasePerImage))
      
      console.log(`🖼️ Showing image ${imageIndex} for ${duration}ms`)
      
      timeoutId = setTimeout(() => {
        const nextIndex = imageIndex + 1
        
        // If we're at the last image, show welcome slide instead of looping
        if (nextIndex >= images.length) {
          setShowWelcomeSlide(true)
          // After showing welcome slide for 1 second, start fade out
          setTimeout(() => {
            setFadeOut(true)
          }, 1000)
        } else {
          showNextImage(nextIndex)
        }
      }, duration)
    }

    // Start the slideshow
    showNextImage(0)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [allImagesReady, images.length])

  // Show loading state if images aren't ready
  if (!allImagesReady) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl font-bold mb-4">Loading...</div>
          <div className="w-32 h-1 bg-white mx-auto rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black overflow-hidden transition-opacity duration-[2000ms] ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Image layers for layered fade transition - only show if not on welcome slide */}
      {!showWelcomeSlide && (
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                index <= currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${image}')`,
                zIndex: 50 + index
              }}
            />
          ))}
        </div>
      )}
      
      {/* Debug Info - only show if not on welcome slide */}
      {!showWelcomeSlide && (
        <div className="absolute top-4 left-4 text-white text-xs bg-black bg-opacity-75 p-2 rounded z-30">
          <div>Current: {images[currentImageIndex]}</div>
          <div>Index: {currentImageIndex}/{images.length - 1}</div>
          <div>Loaded: {imagesLoaded[currentImageIndex] ? '✅' : '❌'}</div>
          <div>All Ready: {allImagesReady ? '✅' : '❌'}</div>
        </div>
      )}

      {/* Text Overlay - Always visible and centered */}
      <div className="absolute inset-0 flex items-center justify-center z-70">
        <div className="text-center">
          <h1 className={`text-5xl md:text-9xl font-bold text-white tracking-wider drop-shadow-2xl transition-all duration-1000 ease-in-out ${
            showWelcomeSlide ? 'scale-100' : 'scale-100'
          }`}>
            {showWelcomeSlide ? 'Welcome to Uncanny Edits' : 'Uncanny.ai'}
          </h1>
          {!showWelcomeSlide && (
            <div className="mt-4">
              <div className="w-32 h-1 bg-white mx-auto rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingIntro