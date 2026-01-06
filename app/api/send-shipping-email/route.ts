import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Make sure your API Key is in .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, customerName, trackingNumber, carrier, orderId } = body;

    console.log("Attempting to send shipping email to:", email); // Debug log

    const { data, error } = await resend.emails.send({
      from: 'Rosetas <onboarding@resend.dev>', // Use this exact email if you haven't verified a domain yet
      to: [email],
      subject: `Your Order #${orderId} has been shipped! 🚚`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1 style="color: #d4af37;">Great News, ${customerName}!</h1>
          <p>Your order <strong>#${orderId}</strong> has been shipped.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Carrier:</p>
            <p style="margin: 0 0 10px 0; font-weight: bold;">${carrier}</p>
            
            <p style="margin: 0; font-size: 14px; color: #666;">Tracking Number:</p>
            <p style="margin: 0; font-weight: bold; font-size: 18px; letter-spacing: 1px;">${trackingNumber}</p>
          </div>

          <p>You can track your package on the ${carrier} website.</p>
          <p>Thank you for choosing Rosetas.</p>
        </div>
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