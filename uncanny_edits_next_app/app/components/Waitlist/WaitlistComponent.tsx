'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const WaitlistComponent = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Successfully joined the waitlist!')
        setEmail('')
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <Card className="w-full max-w-lg bg-gray-800/50 border-gray-700 p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center mr-3">
            <span className="text-gray-800 font-bold text-lg">U</span>
          </div>
          <h1 className="text-white text-2xl font-bold">uncanny.ai</h1>
        </div>

        {/* Main Title */}
        <h2 className="text-white text-2xl font-bold text-center mb-4">
          Photoshop-level photo edits with AI
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-center mb-8 leading-relaxed">
          Transform your photos with professional-grade AI editing. Remove objects, change backgrounds, enhance details, and create stunning visuals with just a few clicks. Join our waitlist and be the first to experience the future of photo editing.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
            >
              {isLoading ? 'Joining...' : 'Join waitlist'}
            </Button>
          </div>
        </form>

      </Card>
    </div>
  )
}

export default WaitlistComponent