import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js'; // ✅ Added Supabase Import

// 1. Initialize Stripe, Resend, and Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Initialize Supabase with the VIP Admin Key to bypass RLS blocks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 FIX 1: Using the Service Role Key!
);

// 2. This Secret comes from the Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  
  // Get the signature
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  // 3. Security: Verify this message is actually from Stripe
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // 4. Handle the "Payment Succeeded" event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(`💰 Payment Succeeded: ${paymentIntent.id}`);

    // --- 🕵️‍♂️ THE ULTIMATE EMAIL SEARCH (4 POCKETS) ---
    
    // Pocket 1: Receipt Email
    let email = paymentIntent.receipt_email; 
    
    // Pocket 2: Metadata
    if (!email && paymentIntent.metadata?.email) {
        email = paymentIntent.metadata.email;
    }
    
    // Pocket 3: Charges (Deep Search for Card/Apple Pay)
    if (!email) {
        try {
            console.log('🔍 Searching for hidden email in charges...');
            const latestCharge = await stripe.charges.list({ 
                payment_intent: paymentIntent.id, 
                limit: 1 
            });
            email = latestCharge.data[0]?.billing_details?.email || null;
        } catch (e) {
            console.log('Could not fetch charges to find email');
        }
    }

    // Pocket 4: The Customer Profile (NEW! 🛠️)
    if (!email && paymentIntent.customer) {
        try {
            console.log('👤 Fetching Customer Profile...');
            const customerId = typeof paymentIntent.customer === 'string' 
                ? paymentIntent.customer 
                : paymentIntent.customer.id;
                
            const customer = await stripe.customers.retrieve(customerId);
            
            if ((customer as any).email) {
                email = (customer as any).email;
            }
        } catch (e) {
            console.log('No email in Customer Profile');
        }
    }
    // ----------------------------------------

    // --- 🆔 BRANDED ORDER ID & NAME SEARCH (MATCHING ROSETAS-000XX) ---
    let orderId = paymentIntent.metadata?.orderId || paymentIntent.id.slice(-6).toUpperCase();
    let dbCustomerName = null; 
    let orderItems: any[] = []; // ✨ NEW: Holder for stock deduction
    
    // 🔥 Extract the exact database ID from metadata
    const supabaseOrderId = paymentIntent.metadata?.supabase_order_id;
    
    try {
        // Wait 2 seconds to ensure DB consistency
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        if (supabaseOrderId) {
            // 🔥 UPDATE THE PENDING ORDER TO PAID
            const { data: updatedOrder, error: updateError } = await supabase
                .from('orders')
                .update({ 
                    status: 'paid', 
                    payment_id: paymentIntent.id 
                })
                .eq('id', supabaseOrderId)
                .select('id, customer_name, items') // ✨ NEW: Fetch items for stock deduction
                .maybeSingle(); 
                
            if (updatedOrder) {
                orderId = `ROSETAS-${String(updatedOrder.id).padStart(5, '0')}`;
                dbCustomerName = updatedOrder.customer_name;
                orderItems = updatedOrder.items || [];

                // --- 🌹 NEW: INVENTORY DEDUCTION LOGIC (Issue #2 & #6) ---
                // Automatically subtracts roses from stock only AFTER payment
                if (Array.isArray(orderItems)) {
                  for (const item of orderItems) {
                    try {
                      const qtyBought = item.quantity || 1;
                      const optionString = JSON.stringify(item.options || {});
                      const roseMatch = optionString.match(/(\d+)\s*(?:Roses|Rosen)/i);
                      const totalRosesToSubtract = roseMatch ? parseInt(roseMatch[1]) * qtyBought : qtyBought;

                      console.log(`📉 Reducing stock for Product ${item.productId} by ${totalRosesToSubtract}`);

                      // Calls the SQL RPC function we created
                      const { error: stockError } = await supabase.rpc('decrement_stock', {
                        product_id_input: item.productId,
                        amount_to_subtract: totalRosesToSubtract
                      });

                      if (stockError) {
                        const { data: currentProd } = await supabase.from('products').select('stock').eq('id', item.productId).single();
                        if (currentProd) {
                          await supabase.from('products').update({ stock: Math.max(0, (currentProd.stock || 0) - totalRosesToSubtract) }).eq('id', item.productId);
                        }
                      }
                    } catch (stockErr) {
                      console.error('Stock reduction error:', stockErr);
                    }
                  }
                }
            } else if (updateError) {
                console.error('Failed to update order to paid:', updateError);
            }
        } else {
            const { data: dbOrder } = await supabase
                .from('orders')
                .select('id, customer_name, items') 
                .eq('payment_id', paymentIntent.id)
                .maybeSingle(); 

            if (dbOrder?.id) {
                orderId = `ROSETAS-${String(dbOrder.id).padStart(5, '0')}`;
                dbCustomerName = dbOrder.customer_name;
                orderItems = dbOrder.items || [];
            }
        }
    } catch (e) {
        console.log('Supabase check/update failed', e);
    }

    const amountTotal = (paymentIntent.amount / 100).toFixed(2);
    const customerName = dbCustomerName || paymentIntent.shipping?.name || 'Valued Customer';

    if (email) {
      console.log(`✅ FOUND IT! Sending confirmation email to: ${email}`);

      // 5. Send the "Luxury Order Confirmation" Email to CUSTOMER
      await resend.emails.send({
        from: 'Rosetas <Kontakt@rosetasbouquets.info>',
        to: [email],
        subject: `Your Order ${orderId} is confirmed! ✨`, 
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              /* ✨ THEME: Soft Beige (#F6EFE6), Gold (#C9A24D), Deep Black (#1F1F1F) */
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F6EFE6; margin: 0; padding: 0; }
              .wrapper { width: 100%; background-color: #F6EFE6; padding: 40px 0; }
              .main { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
              .header { padding: 40px; text-align: center; background-color: #1F1F1F; }
              .logo-img { height: 65px; width: auto; display: block; margin: 0 auto; }
              .content { padding: 40px; text-align: center; color: #1F1F1F; }
              .stars { color: #C9A24D; font-size: 24px; margin-bottom: 10px; }
              h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1F1F1F; }
              p { font-size: 15px; line-height: 1.6; color: #666; margin-bottom: 25px; }
              .tracking-card { background-color: #FBF9F6; border: 1px solid #F0E6D8; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: left; }
              .label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 5px; display: block; }
              .value { font-size: 16px; font-weight: bold; color: #1F1F1F; margin-bottom: 15px; display: block; }
              .item-row { text-align: left; border-top: 1px solid #F6EFE6; padding: 15px 0; }
              .item-name { font-weight: bold; font-size: 14px; color: #1F1F1F; }
              .item-meta { font-size: 11px; color: #C9A24D; font-weight: bold; text-transform: uppercase; }
              .btn { display: inline-block; padding: 18px 40px; background-color: #1F1F1F; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
              .footer { padding: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #F6EFE6; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="main">
                <div class="header">
                  <img src="https://czwrfqdaqgvhvfzknneo.supabase.co/storage/v1/object/public/product-images/logo-email.png" alt="Rosetas Logo" class="logo-img">
                  <div style="font-size: 9px; color: #C9A24D; margin-top: 10px; letter-spacing: 2px; font-weight: bold;">LUXURY COLLECTION</div>
                </div>
                <div class="content">
                  <div class="stars">★★★★★</div>
                  <h1>Order Confirmed! ✨</h1>
                  <p>Thank you, <strong>${customerName}</strong>. We have received your payment and are preparing your handcrafted roses with love.</p>
                  
                  <div class="tracking-card">
                    <span class="label">Branded Order Number</span>
                    <span class="value" style="color: #C9A24D;">${orderId}</span>
                    
                    <span class="label">Total Paid</span>
                    <span class="value">€${amountTotal}</span>
                    
                    <span class="label">Current Status</span>
                    <span class="value">Paid & Handcrafting</span>
                  </div>

                  <div style="margin-bottom: 30px;">
                    <h4 style="text-align: left; text-transform: uppercase; font-size: 10px; color: #999;">Your Selection:</h4>
                    ${orderItems.map((item: any) => `
                      <div class="item-row">
                        <span class="item-name">${item.quantity}x ${item.name}</span><br/>
                        <span class="item-meta">
                          ${Object.values(item.options || {}).join(", ")}
                          ${item.extras && item.extras.length > 0 ? ` • ${item.extras.join(", ")}` : ''}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                  
                  <a href="https://rosetasbouquets.com" class="btn">View Our Shop</a>
                  
                  <p style="margin-top: 30px; font-size: 11px; font-style: italic; color: #999;">Thank you for choosing Rosetas.</p>
                </div>
                <div class="footer">
                  &copy; 2026 Roseta's Bouquets. Handcrafted with elegance.
                </div>
              </div>
            </div>
          </body>
        </html>
        `
      });

      // ✨ NEW: Send Detailed Work Order Alert to OWNER (Rosetasbouquetsde@gmail.com)
      await resend.emails.send({
        from: 'Rosetas Orders <orders@rosetasbouquets.com>',
        to: ['Rosetasbouquetsde@gmail.com'], 
        subject: `🚨 NEW PAID ORDER: ${orderId} - ${customerName}`,
        html: `
          <div style="font-family: sans-serif; color: #1F1F1F; max-width: 600px; border: 2px solid #C9A24D; padding: 20px; border-radius: 15px;">
            <h2 style="color: #C9A24D; text-transform: uppercase; letter-spacing: 1px;">New Paid Order Details</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerName} (${email})</p>
            <hr />
            <h3 style="text-transform: uppercase; font-size: 14px; color: #666;">Items to Prepare:</h3>
            ${orderItems.map((item: any) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p style="font-size: 16px; font-weight: bold; margin: 0;">${item.quantity}x ${item.name}</p>
                <p style="margin: 5px 0; font-size: 13px; color: #555;">Options: ${Object.values(item.options || {}).join(", ")}</p>
                ${item.extras && item.extras.length > 0 ? `<p style="margin: 5px 0; font-size: 13px; color: #C9A24D;">✨ Extras: ${item.extras.join(" + ")}</p>` : ''}
                ${item.customText ? `<p style="margin: 5px 0; font-size: 13px; padding: 5px; background: #F6EFE6; border-radius: 4px;">🎀 Ribbon: "${item.customText}"</p>` : ''}
              </div>
            `).join('')}
            <div style="margin-top: 20px; font-weight: bold;">
              Total Revenue: €${amountTotal}
            </div>
          </div>
        `
      });

    } else {
        console.log('⚠️ Payment Succeeded but NO Email found in any pocket.');
    }
  }

  return NextResponse.json({ received: true });
}