import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const ConfirmEmail = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center  p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Check your email
            </h1>
            <p className="text-muted-foreground">
              We&apos;ve sent you a confirmation link to complete your signup
            </p>
          </div>

          {/* Button */}
          <div className="space-y-4">
            <Link href="/signup">
              <Button variant="outline" className="w-full" size="lg">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              Having trouble?{' '}
              <Link
                href="mailto:support@pixelperfect.ai"
                className="text-primary hover:underline font-medium"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail