import { NextResponse } from "next/server";
import { createInvoiceSnapshot, processAndStorePDF } from "@/lib/invoice-logic"; // ✨ Added processAndStorePDF
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  // 🛡️ SECURITY LAYER: Check for Admin Key
  const adminKey = request.headers.get("x-admin-key");

  // 🔍 DEBUG LOGS: Check your terminal after running the fetch
  console.log("--- INVOICE AUTH DEBUG ---");
  console.log("Expected Key (ENV):", process.env.ADMIN_INTERNAL_KEY);
  console.log("Received Key (Header):", adminKey);
  console.log("--------------------------");

  if (adminKey !== process.env.ADMIN_INTERNAL_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    // STEP A: Create the Snapshot & Record
    const snapshotResult = await createInvoiceSnapshot(orderId);
    
    if (!snapshotResult.success) {
      throw new Error(snapshotResult.error || "Snapshot failed");
    }

    // STEP B: Fetch the UUID of the invoice we just made
    const { data: inv, error: invError } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', snapshotResult.invoiceNumber)
      .single();

    if (invError || !inv) {
      throw new Error("Could not find invoice record for storage processing");
    }

    // STEP C: Run the Full Pipeline (Generation + Cloud Storage)
    // ✨ This replaces the raw generateInvoicePDF call
    console.log("🚀 Starting Full Pipeline (Generate + Store) for Invoice:", inv.id);
    const storageResult = await processAndStorePDF(inv.id, orderId);

    if (!storageResult.success) {
      throw new Error(storageResult.error || "Storage processing failed");
    }

    return NextResponse.json({
      message: "Full Pipeline Success!",
      invoiceNumber: snapshotResult.invoiceNumber,
      storage: {
        status: "generated",
        fileName: storageResult.fileName,
        location: "Supabase Private Storage (invoices bucket)"
      }
    });

  } catch (error: any) {
    console.error("TEST ROUTE FAILURE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}