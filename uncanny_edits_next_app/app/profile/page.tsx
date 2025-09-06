import { redirect } from 'next/navigation'

import { createClient } from '@/app/utils/supabase/server'
import SubscribeButton from '../components/SubscribeButton'
import ManageSubscriptionButton from '../components/ManageSubscriptionButton'
import ProfileCard from '../components/ProfileCard'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  // check if variables are set
  if (!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTLY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTLY is not set')
  }
  if (!data.user.id) {
    throw new Error('User id is not set')
  }


  return (
    <div className='flex flex-col items-center justify-center h-[80vh]'>
      {/* <p className='text-foreground'>Hello {data.user.email}</p>
      <SubscribeButton priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC_MONTLY as string} userId={data.user.id} />
      <ManageSubscriptionButton  /> */}

      <ProfileCard />
    </div>
  )

  
}