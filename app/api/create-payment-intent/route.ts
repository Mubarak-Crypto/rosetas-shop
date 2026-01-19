import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // We add 'as any' here to prevent TypeScript from complaining about the specific date string
  apiVersion: "2024-06-20" as any, 
  typescript: true,
});

export async function POST(request: Request) {
  try {
    // ✨ UPDATED: Accept metadata (cart items) from the client
    const { amount, metadata } = await request.json();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (e.g., 5000 = €50.00)
      currency: "eur",
      automatic_payment_methods: { enabled: true }, // Enables Apple Pay / Google Pay automatically
      // ✨ Pass metadata to Stripe (helpful for Webhooks later)
      metadata: metadata || {}, 
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}