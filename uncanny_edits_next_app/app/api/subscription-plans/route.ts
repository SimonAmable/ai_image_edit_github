import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
      type: 'recurring',
    });

    const plans = prices.data.map((price: Stripe.Price) => {
      // price.product can be string | Product | DeletedProduct
      // We only want Product, and recurring can be null
      const product = typeof price.product === 'object' && price.product !== null ? price.product as Stripe.Product : null;
      return {
        id: price.id,
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: price.unit_amount,
        interval: price.recurring?.interval ?? '',
        price_id: price.id,
      };
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching subscription plans' }, { status: 500 });
  }
}