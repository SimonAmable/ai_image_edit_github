import React from 'react'
import { signup } from './actions'
import GoogleLoginButton from '../components/GoogleLoginButton'

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl lg:border lg:border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Sign up to get started
            </p>
          </div>
          {/* Google Button */}
          <div className="mb-6">
            <GoogleLoginButton />
          </div>
          <form action={signup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-11 w-full rounded-md border border-border px-3 py-2 bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-11 w-full rounded-md border border-border px-3 py-2 bg-background text-foreground"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-muted text-foreground hover:bg-muted/80 rounded-md font-semibold transition-colors"
            >
              Sign up
            </button>
          </form>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage