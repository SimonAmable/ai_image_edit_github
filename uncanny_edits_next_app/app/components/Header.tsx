'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'


/**
 * Header component for the application
 * Displays logo, navigation text, and authentication controls
 */
import { createClient } from '@/app/utils/supabase/client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@supabase/supabase-js'
import { ModeToggle } from './ModeToggle'

type Profile = {
  id: string
  avatar_url: string
  // add other fields as needed
}

const Header = () => {
  const supabase = createClient()
  const router = useRouter()
  // Get user on client side (async)
  const [user, setUser] = React.useState<User | null | undefined>(undefined)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [error, setError] = React.useState<Error | null>(null)

  // make function to sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    // refresh page
    window.location.reload()
    setUser(null)
    setProfile(null)
    setError(null)
  }
  React.useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser()
        // if (userError) {
        //   setError(userError)
        //   return
        // }
        setUser(data.user)
        if (data.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          if (profileError) {
            setError(profileError)
            return
          }
          setProfile(profileData)
        }
      } catch (err) {
        // setError(err)
      }
    }
    fetchUserAndProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  
  if (error) {
    console.error('Error getting user:', error)
  }

  return (
    <div className='sticky top-0 z-40 flex flex-col items-center justify-center w-full px-2'>
    <div
      className="z-40 backdrop-blur-md bg-background/80 text-foreground text-xl rounded-xl min-h-10 flex justify-between items-center flex-row px-2 py-2 w-full "
    >
      {/* Sidebar Trigger & Logo Section */}
      <div className="flex items-center gap-2 ">
        {/* THIS IS THE SIDEBAR TRIGGER */}
        <SidebarTrigger size="default" className="w-10 h-10" />
        {/* <PanelLeftIcon className="w-10 h-10"  onClick={toggleSidebar}/> */}
        {/* THIS IS THE LOGO */}
        {/* <Image 
          src="/logo.png" 
          alt="logo" 
          width={60} 
          height={60}
        /> */}
      </div>
      
      {/* Navigation Text Section (hidden on mobile, visible on lg+) */}
      {/* <div className='hidden lg:flex items-center gap-4'>
        <div className='flex items-center gap-2'>
            <ImageIcon className="w-6 h-6" />
          <p className='text-xl'>Image</p>
        </div>
        <div className='flex items-center gap-2'>
          <Edit3 className="w-5 h-5" />
          <p className='text-xl'>Edit Images</p>
        </div>
        </div>
         */}
      {/* Optionally, add a mobile nav or menu here if needed */}

      {/* Authentication Section */}
      <div className='flex items-center gap-2 sm:gap-4'>
        <ModeToggle /> 
        {typeof user === 'undefined' ? (
          // Loading state - show skeleton
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : user ? (
          // Logged in state - show profile dropdown
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="w-8 h-8">
                  
                  <AvatarImage src={profile?.avatar_url} alt="User avatar" />
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.id}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="w-full text-left">Log out</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Logged out state - show login and sign up
          <div className='flex items-center gap-2 sm:gap-4'>
            <Link href="/login" className='text-base font-bold hover:text-primary transition-colors'>
              Login
            </Link>
            
            <Link href="/signup">
              <Button variant="outline" className='text-base font-bold bg-primary text-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2'>
                <LogIn className="w-4 h-4" />
                Try for free
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default Header