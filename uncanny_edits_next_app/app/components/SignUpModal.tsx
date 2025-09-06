"use client"

import { useState, useTransition } from "react"
import { signup, login } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import GoogleLoginButton from "./GoogleLoginButton"

export default function SignUpModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSignIn, setIsSignIn] = useState(false)

  if (!open) return null

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // Only close if the user clicked directly on the overlay, not on the modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        // Use login or signup based on current mode
        if (isSignIn) {
          await login(formData)
        } else {
          await signup(formData)
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError(isSignIn ? "Sign in failed" : "Signup failed")
        }
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {isSignIn ? "Sign In" : "Create Account"}
          </h2>
          <p className="text-muted-foreground">
            {isSignIn ? "Welcome back" : "Sign up to get started"}
          </p>
        </div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-destructive/10 border border-destructive rounded">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        {/* Google Button */}
        <div className="mb-6">
          <GoogleLoginButton />
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required className="h-11 bg-background text-foreground border-border" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required className="h-11 bg-background text-foreground border-border" />
            </div>
          </div>
          <div className="space-y-3">
            <Button type="submit" className="w-full h-11 bg-muted text-foreground hover:bg-muted/80 border-border" disabled={isPending}>
              {isPending ? (isSignIn ? "Signing in..." : "Creating...") : (isSignIn ? "Sign in" : "Create account")}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>Cancel</Button>
          </div>
        </form>
        {/* Toggle between signup and signin */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-foreground hover:underline font-medium"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
