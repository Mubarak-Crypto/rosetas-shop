import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { createInvoiceSnapshot, processAndStorePDF } from "@/lib/invoice-logic";

export const maxDuration = 60; // 🚀 Gives this specific API route 60 seconds to run on Vercel

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const supabase = createAdminClient();

    // 1. FETCH THE ORDER TO VERIFY ELIGIBILITY
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('payment_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order || order.status !== 'paid') {
      return NextResponse.json({ error: "Order not found or not in 'paid' status" }, { status: 400 });
    }

    if (!order.payment_id) {
      return NextResponse.json({ error: "No Stripe transaction found for this order" }, { status: 400 });
    }

    // 🛡️ 2. TRIGGER STRIPE REFUND
    console.log(`💰 Refunding Stripe Payment: ${order.payment_id}`);
    const refund = await stripe.refunds.create({
      payment_intent: order.payment_id,
    });

    if (refund.status !== 'succeeded') {
      throw new Error("Stripe refund failed to process.");
    }

    // ✅ 3. UPDATE ORDER STATUS IN DATABASE
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 📄 4. GENERATE LEGAL CANCELLATION INVOICE (STORNO)
    console.log(`📄 Generating Storno (Cancellation) for Order: ${orderId}`);
    
    // We pass 'cancellation' as the type so the snapshot engine knows to 
    // allow a duplicate and use the Storno template logic.
    const snapshot = await createInvoiceSnapshot(orderId, 'cancellation');

    if (snapshot.success) {
      const { data: inv } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', snapshot.invoiceNumber)
        .single();

      if (inv) {
        // Trigger the Storno PDF generation in the background
        processAndStorePDF(inv.id, orderId).catch(err => 
          console.error("Async Storno PDF Generation Failed:", err)
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Refund processed and Storno invoice generated.",
      stornoNumber: snapshot.invoiceNumber 
    });

  } catch (error: any) {
    console.error("REFUND_API_FAILURE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}