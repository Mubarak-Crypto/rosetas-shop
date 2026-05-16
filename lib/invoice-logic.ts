import { createAdminClient } from "./supabase-admin";
import { generateInvoicePDF } from "./pdf-worker"; // ✨ Import the printer

// 🛡️ 1. FULL TYPE SAFETY (As requested by the expert)
export interface InvoiceSnapshot {
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    address: string;
    house_number: string;
    city: string;
    zip: string;
    country: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    options: any;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
  };
  tax_info: {
    tax_mode: "kleinunternehmer" | "standard";
    vat_rate: number;
    legal_notes: string;
  };
  metadata: {
    order_date: string;
    payment_method: string;
    transaction_id: string | null;
  }
}

/**
 * THE INVOICE ENGINE
 * This function builds an immutable snapshot and triggers the Atomic DB Transaction.
 */
export async function createInvoiceSnapshot(
  orderId: number | string,
  type: 'invoice' | 'cancellation' = 'invoice'
) {
  const supabase = createAdminClient(); // ✨ Reused client instance

  try {
    // 2. FETCH ORDER DATA
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`*`)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      await logInvoiceEvent(supabase, orderId, 'snapshot_creation', 'error', `Order ${orderId} not found.`);
      throw new Error(`Order ${orderId} not found.`);
    }

    // 3. BUILD STRUCTURED SNAPSHOT (The "Frozen" Record)
    const snapshot: InvoiceSnapshot = {
      customer: {
        // Fallbacks included to prevent "null" values in legal documents
        first_name: order.first_name || order.customer_name?.split(' ')[0] || 'Valued',
        last_name: order.last_name || order.customer_name?.split(' ')[1] || 'Customer',
        email: order.email || '',
        address: order.address || 'No Address Provided',
        house_number: order.house_number || '',
        city: order.city || '',
        zip: order.zip || '',
        country: order.country || 'DE'
      },
      // ✨ FIX: Safe mapping with fallback to empty array
      items: (order.items || []).map((item: any) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        options: item.options || {}
      })),
      totals: {
        // ✨ Since shipping column is missing, we check for shipping_fee or use 0
        subtotal: Number(order.subtotal) || (Number(order.total) - Number(order.shipping_fee || 0)),
        shipping: Number(order.shipping_fee || 0), 
        total: Number(order.total),
        currency: 'EUR'
      },
      tax_info: {
        tax_mode: "kleinunternehmer",
        vat_rate: 0,
        legal_notes: "Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG."
      },
      metadata: {
        order_date: order.created_at,
        payment_method: order.payment_id ? 'Stripe' : 'Manual',
        transaction_id: order.payment_id || null
      }
    };

    // 4. EXECUTE ATOMIC TRANSACTION (RPC)
    // This handles Idempotency, Sequence Locking, and Insertion in ONE heartbeat.
    const { data, error: rpcError } = await supabase
      .rpc('create_atomic_invoice', {
        p_order_id: orderId,
        p_invoice_data: snapshot,
        p_type: type
      });

    if (rpcError) {
      await logInvoiceEvent(supabase, orderId, 'snapshot_creation', 'error', rpcError.message);
      throw new Error(`Atomic Database Failure: ${rpcError.message}`);
    }

    const invoiceNumber = data[0].final_number;

    // 5. LOG SUCCESS
    await logInvoiceEvent(supabase, orderId, 'snapshot_creation', 'success', `Invoice ${invoiceNumber} created/retrieved.`);

    return { 
      invoiceNumber, 
      success: true 
    };

  } catch (error: any) {
    console.error("CRITICAL_LOGIC_FAILURE:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🪵 INTERNAL LOGGER (Optimized to reuse the supabase client)
 */
async function logInvoiceEvent(
  supabase: any,
  orderId: number | string, 
  eventType: string, 
  status: 'success' | 'error', 
  message: string
) {
  await supabase.from('invoice_logs').insert({
    order_id: orderId,
    event_type: eventType,
    status: status,
    error_message: message
  });
}

/**
 * ✨ STEP 4: PDF ORCHESTRATOR
 * Takes the generated PDF, uploads it to Storage, and updates the DB record.
 */
export async function processAndStorePDF(invoiceId: string, orderId: string | number) {
  const supabase = createAdminClient();

  try {
    // 1. Generate the PDF
    const pdfBuffer = await generateInvoicePDF(invoiceId);

    // 2. Upload to Private Storage
    const fileName = `invoice-${invoiceId}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true 
      });

    if (uploadError) throw uploadError;

    // 3. Update the Invoice Record in the DB
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        pdf_url: fileName,
        pdf_status: 'generated'
      })
      .eq('id', invoiceId);

    if (updateError) throw updateError;

    // 4. Log the success
    await logInvoiceEvent(supabase, orderId, 'pdf_generation', 'success', `Stored: ${fileName}`);

    return { success: true, fileName };

  } catch (error: any) {
    console.error("STORAGE FAILURE:", error);
    
    // Mark as failed so we can see it in the dashboard
    await supabase.from('invoices').update({ pdf_status: 'failed' }).eq('id', invoiceId);
    await logInvoiceEvent(supabase, orderId, 'pdf_generation', 'error', error.message);
    
    return { success: false, error: error.message };
  }
}