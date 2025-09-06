import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClientServiceRole } from '@/app/utils/supabase/serverServiceRole';

// get secret key from env
const secretKey = process.env.STRIPE_SECRET_KEY as string;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

const stripe = new Stripe(secretKey);

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is working' });
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  let event;

  // Always use the service role client for webhooks
  const supabase = await createClientServiceRole();

  try {
    event = stripe.webhooks.constructEvent(body, sig as string, endpointSecret);
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object, supabase);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object, supabase);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaid(event.data.object, supabase);
      break;
    // ... handle other events
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: SupabaseClient) {
  // Update the subscription status in your database
  // You might want to update the user's access level based on the new subscription status
  console.log('Subscription updated:', subscription.id);
  // Add your logic here if needed
  console.log('Subscription updated:', subscription);

  // get the user id from the subscription
  const userId = subscription.metadata?.userId;
  console.log('User id:', userId);
  // need to check what to do with the subscription

}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: SupabaseClient) {
  // Update the subscription status in your database
  // You might want to revoke the user's access to premium features
  console.log('Subscription deleted:', subscription.id);
  // Add your logic here if needed
  console.log('Subscription deleted:', subscription);

  // get the user id from the subscription
  const userId = subscription.metadata?.userId;
  console.log('User id:', userId);

  // update the user's subscription status in the database
  const { data, error } = await supabase.from('profiles').update({
    is_pro: false,
    stripe_customer_id: subscription.customer as string,
  }).eq('id', userId).select();
  if (error) {
    console.error('Error updating user subscription status:', error);
  } else {
    console.log('User subscription status updated successfully:', data);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: SupabaseClient) {
  // Update the user's payment status in your database
  // You might want to extend the user's access period
  console.log('Invoice paid:', invoice.id);
  console.log('Invoice paid:', invoice);

  // get the user id from the invoice
  let userId = invoice.lines?.data?.[0]?.metadata?.userId || invoice.metadata?.userId;

  // Try to get userId from parent.subscription_details.metadata if not found
  if (!userId && typeof (invoice as unknown) === 'object' && invoice && 'parent' in invoice) {
    const parent = (invoice as { parent?: { subscription_details?: { metadata?: { userId?: string } } } }).parent;
    if (parent && parent.subscription_details && parent.subscription_details.metadata && parent.subscription_details.metadata.userId) {
      userId = parent.subscription_details.metadata.userId;
    }
  }

  console.log('User id:', userId);
  // update the user's subscription status in the database,
  if (!userId) {
    console.error('No userId found in invoice metadata');
    return;
  }
  const { data, error } = await supabase.from('profiles').update({
    is_pro: true,
    stripe_customer_id: invoice.customer as string,
  }).eq('id', userId).select();
  if (error) {
    console.error('Error updating user subscription status:', error);
  } else {
    console.log('User subscription status updated successfully:', data);
  }
  

}

export const config = {
  api: {
    bodyParser: false,
  },
};