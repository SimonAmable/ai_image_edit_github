import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClientServiceRole } from '@/app/utils/supabase/serverServiceRole';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// define 

export async function POST(request) {
  try {
    // Get the customer ID from your database based on the authenticated user
    const supabase = await createClientServiceRole(); 
    const { data: { user } } = await supabase.auth.getUser();
    
    const userId = user.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { data: { stripe_customer_id } } = await supabase.from('profiles').select('stripe_customer_id').eq('id', userId).single();
    if (!stripe_customer_id) {
      return NextResponse.json({ error: 'User not currently subscribed' }, { status: 404 });
    }
    
    


    const session = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${request.headers.get('origin')}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating portal session' }, { status: 500 });
  }
}