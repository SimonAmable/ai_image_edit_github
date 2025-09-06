import { login, signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import GoogleLoginButton from '../components/GoogleLoginButton'
// import OneTapComponent from '../components/OneTapComponent'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Await searchParams as required by Next.js dynamic API usage
  const error = (await searchParams)?.error

  
  return (
    <div className="h-[90vh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl lg:border lg:border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">
                {decodeURIComponent(error)}
              </p>
            </div>
          )}

          {/* Google Button */}
          <div className="mb-6">
            <GoogleLoginButton />
            {/* <OneTapComponent />  */}
          </div>
          
          {/* Form */}
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-11 bg-background text-foreground border-border"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-11 bg-background text-foreground border-border"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button 
                formAction={login}
                className="w-full h-11 bg-card text-foreground hover:bg-muted"
              >
                Sign in
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
              </div>
              <Button 
                formAction={signup}
                variant="outline"
                className="w-full h-11 bg-muted text-foreground hover:bg-muted/80 border-border"
              >
                Create account
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}