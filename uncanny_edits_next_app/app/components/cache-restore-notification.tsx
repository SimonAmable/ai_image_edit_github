"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { RotateCcw, X } from 'lucide-react'

interface CacheRestoreNotificationProps {
  onRestore: () => void
  onDismiss: () => void
  hasCachedData: boolean
}

export function CacheRestoreNotification({ 
  onRestore, 
  onDismiss, 
  hasCachedData 
}: CacheRestoreNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (hasCachedData) {
      setIsVisible(true)
    }
  }, [hasCachedData])

  if (!isVisible) return null

  const handleRestore = () => {
    onRestore()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    onDismiss()
    setIsVisible(false)
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center gap-3">
        <RotateCcw className="w-5 h-5 text-blue-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Restore previous session?</p>
          <p className="text-xs text-muted-foreground">
            We found your previous canvas layout
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleRestore}>
            Restore
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}