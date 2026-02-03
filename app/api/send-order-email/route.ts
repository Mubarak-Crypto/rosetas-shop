import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, address, items, total, email } = body;

    // 1. Format the list of items for the email text
    const itemsList = items.map((item: any) => 
      `- ${item.quantity}x ${item.name} (${Object.values(item.options).join(", ")})`
    ).join("\n");

    // 2. Send Email to the STORE OWNER (Her Private Alert)
    // We send this to her Private Gmail because it is an internal business notification.
    const { data, error } = await resend.emails.send({
      from: 'Rosetas Orders <orders@rosetasbouquets.com>', // Sender (The Website)
      to: ['Rosetasbouquetsde@gmail.com'], // 📧 Receiver (Her Private Gmail)
      subject: `New Order from ${customerName} (€${total})`,
      html: `
        <h1>New Order Received!</h1>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <hr />
        <h3>Order Details:</h3>
        <pre>${itemsList}</pre>
        <hr />
        <h3>Total: €${total}</h3>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}