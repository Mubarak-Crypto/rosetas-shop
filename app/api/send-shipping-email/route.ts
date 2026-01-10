import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Make sure your API Key is in .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ✅ Restored your original variables + added productId
    const { email, customerName, trackingNumber, carrier, orderId, productId } = body;

    // 🔍 DEBUG LOG: Check your terminal after clicking 'Ship' to see if productId exists
    console.log("Attempting to send shipping email to:", email, "for Product ID:", productId); 

    // ✨ This is the secret link that unlocks the review form on the product page
    // It uses the productId passed from your Admin panel
    const reviewLink = `https://rosetasbouquets.com/product/${productId}?verify=true`;

    const { data, error } = await resend.emails.send({
      from: 'Rosetas <onboarding@resend.dev>', // Keep this as is for your test account
      to: [email],
      subject: `Your Order #${orderId} has been shipped! 🚚`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F6EFE6; margin: 0; padding: 0; }
              .wrapper { width: 100%; background-color: #F6EFE6; padding-bottom: 40px; }
              .main { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
              .header { padding: 40px; text-align: center; background-color: #F6EFE6; }
              .logo { font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1F1F1F; text-transform: uppercase; }
              .content { padding: 40px; text-align: center; color: #1F1F1F; }
              .stars { color: #D4C29A; font-size: 24px; margin-bottom: 10px; }
              h1 { font-size: 26px; font-weight: 300; margin-bottom: 20px; color: #1F1F1F; }
              p { font-size: 15px; line-height: 1.6; color: #666; margin-bottom: 25px; }
              .tracking-card { background-color: #F9F9F9; border: 1px solid #F0F0F0; border-radius: 16px; padding: 25px; margin: 25px 0; text-align: left; }
              .label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 5px; display: block; }
              .value { font-size: 16px; font-weight: bold; color: #1F1F1F; margin-bottom: 15px; display: block; }
              .btn { display: inline-block; padding: 18px 40px; background-color: #D4C29A; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
              .footer { padding: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #F6EFE6; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="main">
                <div class="header">
                  <div class="logo">Roseta's</div>
                  <div style="font-size: 9px; color: #D4C29A; margin-top: 4px; letter-spacing: 2px; font-weight: bold;">LUXURY COLLECTION</div>
                </div>
                <div class="content">
                  <div class="stars">★★★★★</div>
                  <h1>Great News, ${customerName}!</h1>
                  <p>Your order <strong>#${orderId}</strong> has been shipped and is now on its way to you.</p>
                  
                  <div class="tracking-card">
                    <span class="label">Carrier</span>
                    <span class="value">${carrier}</span>
                    <span class="label">Tracking Number</span>
                    <span class="value" style="letter-spacing: 2px;">${trackingNumber}</span>
                  </div>

                  <p>Once your roses arrive and you've experienced their sparkle, we would love to hear your thoughts.</p>
                  
                  <a href="${reviewLink}" class="btn">Leave a Verified Review</a>
                  
                  <p style="margin-top: 30px; font-size: 11px; font-style: italic; color: #999;">Thank you for choosing Rosetas.</p>
                </div>
                <div class="footer">
                  &copy; 2026 Roseta's Bouquets. All rights reserved.
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}