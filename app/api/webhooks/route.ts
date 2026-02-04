import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { Resend } from 'resend';

// 1. Initialize Stripe and Resend
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // ✅ FIXED: Added 'as any' to ignore version mismatch
});
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. This Secret comes from the Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  
  // ✅ FIXED: Added 'await' for Next.js 15 compatibility
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  // 3. Security: Verify this message is actually from Stripe
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // 4. Handle the "Checkout Completed" event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get customer details
    const customerName = session.customer_details?.name || 'Valued Customer';
    const email = session.customer_details?.email;
    const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
    
    // Create a short Order ID from the Session ID (or use metadata if you have it)
    const orderId = session.metadata?.orderId || session.id.slice(-6).toUpperCase();

    if (email) {
      console.log(`✅ Payment successful! Sending confirmation email to: ${email}`);

      // 5. Send the "Luxury Order Confirmation" Email via Resend
      await resend.emails.send({
        from: 'Rosetas <orders@rosetasbouquets.com>',
        to: [email],
        subject: `Your Order #${orderId} is confirmed! ✨`, 
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F6EFE6; margin: 0; padding: 0; }
              .wrapper { width: 100%; background-color: #F6EFE6; padding-bottom: 40px; }
              
              /* Sharp corners for luxury feel */
              .main { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 0px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
              
              /* Header */
              .header { padding: 40px; text-align: center; background-color: #1F1F1F; border-radius: 0px; }
              
              /* Logo */
              .logo-img { height: 70px; width: auto; display: block; margin: 0 auto; border: none; outline: none; }
              
              .content { padding: 40px; text-align: center; color: #1F1F1F; }
              .stars { color: #D4C29A; font-size: 24px; margin-bottom: 10px; }
              h1 { font-size: 26px; font-weight: 300; margin-bottom: 20px; color: #1F1F1F; }
              p { font-size: 15px; line-height: 1.6; color: #666; margin-bottom: 25px; }
              
              /* Order Info Card */
              .tracking-card { background-color: #F9F9F9; border: 1px solid #F0F0F0; border-radius: 0px; padding: 25px; margin: 25px 0; text-align: left; }
              .label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 5px; display: block; }
              .value { font-size: 16px; font-weight: bold; color: #1F1F1F; margin-bottom: 15px; display: block; }
              
              /* Glowing Button */
              .btn { 
                display: inline-block; 
                padding: 18px 40px; 
                background-color: #D4C29A; 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 50px; 
                font-weight: bold; 
                font-size: 13px; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
                border: 2px solid #ffffff; 
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); 
              }
              
              .footer { padding: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #F6EFE6; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="main">
                <div class="header">
                  <img src="https://czwrfqdaqgvhvfzknneo.supabase.co/storage/v1/object/public/product-images/logo-email.jpg" alt="Rosetas Logo" class="logo-img">
                  <div style="font-size: 9px; color: #D4C29A; margin-top: 10px; letter-spacing: 2px; font-weight: bold;">LUXURY COLLECTION</div>
                </div>
                <div class="content">
                  <div class="stars">★★★★★</div>
                  <h1>Order Confirmed! ✨</h1>
                  <p>Thank you, <strong>${customerName}</strong>. We have received your order and are preparing your luxury roses with love.</p>
                  
                  <div class="tracking-card">
                    <span class="label">Order Number</span>
                    <span class="value">#${orderId}</span>
                    
                    <span class="label">Total Amount</span>
                    <span class="value">€${amountTotal}</span>
                    
                    <span class="label">Status</span>
                    <span class="value" style="color: #D4C29A;">Processing</span>
                  </div>

                  <p>You will receive another email with your tracking number as soon as your bouquet ships.</p>
                  
                  <a href="https://rosetasbouquets.com" class="btn">Visit Our Shop</a>
                  
                  <p style="margin-top: 30px; font-size: 11px; font-style: italic; color: #999;">Thank you for choosing Rosetas.</p>
                </div>
                <div class="footer">
                  &copy; 2026 Roseta's Bouquets. All rights reserved.
                </div>
              </div>
            </div>
          </body>
        </html>
        `
      });
    }
  }

  return NextResponse.json({ received: true });
}