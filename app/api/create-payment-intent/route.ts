import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js"; // ✨ Import Supabase Client

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any, 
  typescript: true,
});

// ✨ Initialize Supabase for Server-Side Checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // ✨ UPDATED: Accept discountCode from the client
    const { amount, metadata, discountCode } = await request.json();

    // 🛡️ SECURITY CHECK: Verify Discount Code if one is provided
    if (discountCode) {
        const { data: code, error } = await supabase
            .from('discount_codes')
            .select('*')
            .eq('code', discountCode)
            .single();

        // 1. Check if code exists and is active
        if (error || !code || !code.is_active) {
            throw new Error("Security Alert: Invalid or inactive discount code detected.");
        }
        
        // 2. Check if code is expired
        if (code.expires_at && new Date(code.expires_at) < new Date()) {
            throw new Error("Security Alert: This discount code has expired.");
        }

        // 3. Check usage limits
        if (code.max_uses !== null && code.current_uses >= code.max_uses) {
             throw new Error("Security Alert: Discount usage limit reached.");
        }
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: "eur",
      automatic_payment_methods: { enabled: true }, 
      // ✨ Pass discount code to Stripe Metadata for your records
      metadata: { ...metadata, discountCode: discountCode || 'NONE' }, 
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