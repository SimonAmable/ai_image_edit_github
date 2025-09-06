'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/app/utils/supabase/server'
import { checkRateLimit } from '@/lib/ratelimiting'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate inputs
  if (!data.email || !data.password) {
    console.error('Missing email or password')
    redirect('/signup?error=missing-credentials')
  }

  // Check rate limit for signup (using email as identifier for unauthenticated users)
  const rateLimitResult = await checkRateLimit(data.email, 'signup')
  if (!rateLimitResult.success) {
    console.error('Rate limit exceeded for signup')
    redirect('/signup?error=rate-limit-exceeded')
  }

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (!authData.user) {
    console.error('No user data returned from signup')
    redirect('/signup?error=no-user-data')
  }

  console.log('Signup successful for user:', authData.user.email)
  revalidatePath('/', 'layout')
  // redirect to confirm page or dashboard
  redirect('/auth/confirm-email')
} 