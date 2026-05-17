import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import crypto from "crypto";

export default async function InvoicePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, // ✨ Updated for Next.js 15
  searchParams: Promise<{ sig?: string }> // ✨ Updated for Next.js 15
}) {
  // ✨ UNWRAP PROMISES: Next.js 15 requires awaiting params before use
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;
  const sig = resolvedSearchParams.sig;

  const supabase = createAdminClient();
  const secret = process.env.INVOICE_SECRET_TOKEN || "";

  // 🛡️ 1. SECURITY: HMAC Signature Verification
  // We recreate the signature using the ID and our Secret Token
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(id) // Use unwrapped id
    .digest("hex");

  // If the signature is missing or incorrect, block access immediately
  if (!sig || sig !== expectedSignature) {
    console.error("CRITICAL: Unauthorized or invalid access attempt to invoice:", id);
    return notFound();
  }

  // 2. FETCH DATA
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id) // Use unwrapped id
    .single();

  if (!invoice) {
    console.warn("Invoice record not found for ID:", id);
    return notFound();
  }

  const { customer, items, totals, tax_info } = invoice.invoice_data;

  return (
    <>
      {/* 3. PRINT OPTIMIZATION CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          body { background-color: #F6EFE6; padding: 40px 0; }
        }
        @media print {
          /* 🛡️ THE CLOAK: Target cookie banners and popups specifically */
          header, footer, nav, .cookie-banner, #cookie-consent, [role="dialog"], 
          .notwendige-technologien, div[class*="notwendige"], div[id*="cookie"], [class*="popup"] { 
            display: none !important; 
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
          }
          body > *:not(.invoice-container) { display: none !important; }
          body { 
            -webkit-print-color-adjust: exact; 
            margin: 0 !important; 
            padding: 0 !important;
            background: white !important;
          }
          @page { size: A4; margin: 0; }
        }
        /* Ensure font rendering is clean in Puppeteer */
        * { -webkit-font-smoothing: antialiased; }
      `}} />
      
      <div 
        className="mx-auto bg-white text-slate-900 font-sans shadow-sm print:shadow-none invoice-container" 
        style={{ 
          width: '210mm', 
          minHeight: '297mm', // Strict A4 Height
          padding: '20mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              ROSETAS <span style={{ color: "#C9A24D" }}>BOUQUETS</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.3em]">
              Luxury Floral Artisans • Essen
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-slate-300">Invoice</h2>
            <p className="text-slate-900 font-mono font-bold mt-1 text-lg">{invoice.invoice_number}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">
              Issued: {new Date(invoice.issued_at).toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>

        {/* Address Grid */}
        <div className="grid grid-cols-2 gap-12 mt-16">
          <div>
            <h3 className="text-[10px] font-bold uppercase mb-3 tracking-widest" style={{ color: "#C9A24D" }}>Billed To</h3>
            <p className="font-bold text-slate-900 text-lg">{customer.first_name} {customer.last_name}</p>
            <div className="text-slate-500 text-sm mt-1 leading-relaxed">
              <p>{customer.address} {customer.house_number}</p>
              <p>{customer.zip} {customer.city}</p>
              <p className="uppercase font-bold text-xs mt-1 text-slate-400">{customer.country}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-bold uppercase text-slate-300 mb-3 tracking-widest">From</h3>
            <p className="font-bold text-slate-900">Rosetas Bouquets</p>
            <div className="text-slate-500 text-sm mt-1 leading-relaxed">
              <p>Albert-Schweitzer-Str. 5</p>
              <p>45279 Essen, Germany</p>
              <p className="italic text-xs mt-1 font-semibold" style={{ color: "#C9A24D" }}>www.rosetasbouquets.com</p>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="w-full mt-20 text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
              <th className="pb-4">Description</th>
              <th className="pb-4 text-center w-20">Qty</th>
              <th className="pb-4 text-right w-32">Unit Price</th>
              <th className="pb-4 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item: any, i: number) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-6 font-semibold text-slate-700">{item.name}</td>
                <td className="py-6 text-center text-slate-500">{item.quantity}</td>
                <td className="py-6 text-right text-slate-500">€{Number(item.price).toFixed(2)}</td>
                <td className="py-6 text-right font-bold text-slate-900">€{(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="mt-12 flex justify-end">
          <div className="w-72 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
              <span className="font-medium text-slate-700">€{Number(totals.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Shipping</span>
              <span className="font-medium text-slate-700">€{Number(totals.shipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-4 mt-2">
              <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total Amount</span>
              <span className="text-2xl font-black" style={{ color: "#C9A24D" }}>€{Number(totals.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Legal Footer Section */}
        <div className="mt-auto pt-20">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] leading-relaxed text-slate-400 text-center uppercase font-medium tracking-tight">
              {tax_info.legal_notes}
            </p>
          </div>
          <p className="text-[10px] text-slate-300 mt-10 text-center uppercase font-black tracking-[0.5em]">
            Thank you for your order
          </p>
        </div>
      </div>
    </>
  );
}