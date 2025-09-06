'use client'

import React from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Button } from '@/components/ui/button'

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      // Optionally handle error here, e.g. show a toast or alert
      console.error('Google login error:', error)
    }
    // No need to handle data here, as redirect will occur
  }

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full h-11 bg-card text-foreground border border-border hover:bg-muted flex items-center justify-center gap-2"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <g>
          <path
            d="M44.5 20H24v8.5h11.7C34.7 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.3-.2-3z"
            fill="#FFC107"
          />
          <path
            d="M6.3 14.7l7 5.1C15.2 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 6.5 29.6 4 24 4c-7.1 0-13.1 4.1-16.1 10.7z"
            fill="#FF3D00"
          />
          <path
            d="M24 44c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.2 36.1 26.7 37 24 37c-6.1 0-11.2-4.1-13-9.7l-7 5.4C6.9 39.9 14.8 44 24 44z"
            fill="#4CAF50"
          />
          <path
            d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C17.8 41.9 20.7 44 24 44c7.1 0 13.1-4.1 16.1-10.7z"
            fill="#1976D2"
          />
        </g>
      </svg>
      Continue with Google
    </Button>
  )
}

export default GoogleLoginButton