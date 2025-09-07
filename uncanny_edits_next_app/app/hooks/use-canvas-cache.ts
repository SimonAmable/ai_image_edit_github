import { useEffect, useCallback } from 'react'

interface CanvasState {
  scale: number
  offsetX: number
  offsetY: number
}

interface CanvasImage {
  id: string
  url: string
  filename: string
  x: number
  y: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  selected: boolean
}

interface CachedCanvasData {
  canvasState: CanvasState
  images: CanvasImage[]
  timestamp: number
}

const CACHE_KEY = 'uncanny-edits-canvas-cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function useCanvasCache() {
  const saveToCache = useCallback((canvasState: CanvasState, images: CanvasImage[]) => {
    try {
      const cacheData: CachedCanvasData = {
        canvasState,
        images,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save canvas to cache:', error)
    }
  }, [])

  const loadFromCache = useCallback((): CachedCanvasData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const data: CachedCanvasData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - data.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return data
    } catch (error) {
      console.warn('Failed to load canvas from cache:', error)
      return null
    }
  }, [])

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.warn('Failed to clear canvas cache:', error)
    }
  }, [])

  const hasCachedData = useCallback((): boolean => {
    const cached = loadFromCache()
    return cached !== null
  }, [loadFromCache])

  return {
    saveToCache,
    loadFromCache,
    clearCache,
    hasCachedData
  }
}