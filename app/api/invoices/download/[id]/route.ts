import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const invoiceId = resolvedParams.id;

  try {
    // 1. Fetch invoice record to get the pretty invoice number for the download filename
    const { data: invoice, error: dbError } = await supabaseAdmin
      .from("invoices")
      .select("invoice_number")
      .eq("id", invoiceId)
      .single();

    if (dbError || !invoice) return new NextResponse("Invoice record not found", { status: 404 });

    // ✨ FIX: Match the naming convention seen in your screenshot: "invoice-[ID].pdf"
    const storageFileName = `invoice-${invoiceId}.pdf`;
    const downloadDisplayName = `${invoice.invoice_number}.pdf`;
    
    console.log(`📡 Attempting to download: ${storageFileName}`);

    const { data: fileBlob, error: storageError } = await supabaseAdmin
      .storage
      .from("invoices") 
      .download(storageFileName);

    if (storageError) {
      console.error("❌ SUPABASE STORAGE ERROR:", storageError.message);
      return new NextResponse(`File ${storageFileName} not found in bucket.`, { status: 404 });
    }

    // 2. Return the file, but rename it to the pretty invoice number for the user
    return new NextResponse(fileBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadDisplayName}"`,
      },
    });

  } catch (err) {
    console.error("🚨 Server Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}