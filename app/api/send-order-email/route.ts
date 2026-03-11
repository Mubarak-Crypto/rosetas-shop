import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ✨ UPDATED: Now receiving 'orderNumber' (ROSETAS-000XX) from the checkout/webhook
    const { customerName, address, items, total, email, orderNumber } = body;

    // 1. Format the list of items with better visibility for Extras (Issue #1 Fix)
    const itemsListHtml = items.map((item: any) => {
      const optionsStr = item.options ? Object.values(item.options).join(", ") : "";
      const extrasStr = item.extras && item.extras.length > 0 ? ` [EXTRAS: ${item.extras.join(", ")}]` : "";
      const ribbonStr = item.customText ? ` <br/>🎀 RIBBON: "${item.customText}"` : "";
      
      return `
        <div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #C9A24D; background: #fafafa;">
          <strong>${item.quantity}x ${item.name}</strong><br/>
          <small style="color: #666;">Options: ${optionsStr}${extrasStr}</small>
          ${ribbonStr}
        </div>
      `;
    }).join("");

    // 2. Send Email to the STORE OWNER (Internal Alert)
    // ✨ UPDATED: Included orderNumber in the subject and HTML body
    const { data, error } = await resend.emails.send({
      from: 'Rosetas Orders <orders@rosetasbouquets.com>',
      to: ['Rosetasbouquetsde@gmail.com'], 
      subject: `New Order #${orderNumber || 'PENDING'} - ${customerName} (€${total})`,
      html: `
        <div style="font-family: sans-serif; color: #1f1f1f; line-height: 1.6;">
          <h1 style="color: #C9A24D;">New Order Received!</h1>
          <p style="font-size: 18px; font-weight: bold;">Order ID: ${orderNumber || 'Pending Confirmation'}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Address:</strong> ${address}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <h3>Order Details:</h3>
          ${itemsListHtml}
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <h2 style="text-align: right;">Total: €${total}</h2>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email API Catch Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}