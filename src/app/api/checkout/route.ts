import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe securely on the backend
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use the latest stable API version
});

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Your $15/mo subscription price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Pass the user ID so we know who paid when the webhook fires later
      client_reference_id: userId,
      // Where to send them after they pay (or cancel)
      success_url: `${request.headers.get('origin')}/settings?success=true`,
      cancel_url: `${request.headers.get('origin')}/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}