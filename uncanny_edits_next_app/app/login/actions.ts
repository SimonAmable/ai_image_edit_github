'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/app/utils/supabase/server'

export async function login(formData: FormData) {
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
    redirect('/login?error=missing-credentials')
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (!authData.user) {
    console.error('No user data returned')
    redirect('/login?error=no-user-data')
  }

  console.log('Login successful for user:', authData.user.email)
  revalidatePath('/', 'layout')
  redirect('/')
  
}

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
    redirect('/login?error=missing-credentials')
  }

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (!authData.user) {
    console.error('No user data returned from signup')
    redirect('/login?error=no-user-data')
  }

  console.log('Signup successful for user:', authData.user.email)
  revalidatePath('/', 'layout')
  // redirect to confirm page
  redirect('/')
}