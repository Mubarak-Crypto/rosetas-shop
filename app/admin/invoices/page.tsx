"use client";

import { useState, useEffect, useMemo } from "react"; // ✨ Added useMemo
import Link from "next/link";
import { 
  Download, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Search,
  FileText,
  Mail,
  Euro, // ✨ Added Icons for Stats
  RefreshCcw,
  Send
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize client-side Supabase with persistence
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export default function InvoiceCenterPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✨ Added search state

  // 1. FETCH INVOICES
  async function fetchInvoices() {
    setLoading(true);
    try {
      // Fetch only invoices first to avoid relationship errors
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .order('sequence_number', { ascending: false });

      if (invError) {
        console.error("SUPABASE ERROR:", invError.message);
      } else if (invData) {
        // Fetch order details for these invoices to fill in the gaps
        const orderIds = invData.map(i => i.order_id).filter(id => id !== null);
        const { data: orderData } = await supabase
          .from('orders')
          .select('id, customer_name, status, total') // ✨ Added total for stats
          .in('id', orderIds);

        // Merge the data together manually
        const combined = invData.map(inv => ({
          ...inv,
          orders: orderData?.find(o => o.id === inv.order_id) || null
        }));
        setInvoices(combined);
      }
    } catch (err) {
      console.error("Fetch Failure:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInvoices(); }, []);

  // 📊 CALCULATE DASHBOARD STATS
  const stats = useMemo(() => {
    const activeInvoices = invoices.filter(inv => inv.type === 'invoice');
    const stornos = invoices.filter(inv => inv.type === 'cancellation');
    
    const totalRevenue = activeInvoices.reduce((sum, inv) => sum + (inv.orders?.total || 0), 0);
    const sentCount = activeInvoices.filter(inv => inv.sent_at).length;
    const sentRate = activeInvoices.length > 0 ? Math.round((sentCount / activeInvoices.length) * 100) : 0;

    return { totalRevenue, stornoCount: stornos.length, sentRate };
  }, [invoices]);

  // 🔍 FILTER LOGIC
  const filteredInvoices = invoices.filter((inv) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = `${inv.invoice_data?.customer?.first_name ?? ''} ${inv.invoice_data?.customer?.last_name ?? ''}`.toLowerCase();
    const email = (inv.invoice_data?.customer?.email ?? "").toLowerCase();
    const invNum = (inv.invoice_number ?? "").toLowerCase();
    
    return customerName.includes(searchLower) || email.includes(searchLower) || invNum.includes(searchLower);
  });

  // 2. HANDLE REFUND (STORNO)
  const handleRefund = async (orderId: string, invoiceNumber: string) => {
    // Security check: (TEMPORARILY DISABLED FOR TESTING)
    // Removed the session check here so you can test the logic immediately.

    const confirm = window.confirm(
      `Confirm refund for Order #${orderId}? This triggers Stripe and Storno ${invoiceNumber}.`
    );

    if (!confirm) return;

    setProcessingId(orderId);
    try {
      const res = await fetch("/api/invoices/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`Success! Storno created.`);
        fetchInvoices(); 
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert("Failed to process refund.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-mono text-slate-400 uppercase tracking-widest">Accessing Vault...</div>;

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      
      <main className="flex-1 p-8 relative overflow-y-auto h-screen selection:bg-[#C9A24D] selection:text-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold">Invoice Center</h1>
              <p className="text-[#1F1F1F]/60 font-medium">Audit Trail & German Storno Management</p>
            </div>
            <div className="bg-white border border-black/5 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <Search className="w-4 h-4 text-[#1F1F1F]/30" />
              <input 
                type="text" 
                placeholder="Search by name, email or ID..." 
                className="bg-transparent outline-none text-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </header>

          {/* ✨ NEW: STATS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm group hover:border-[#C9A24D]/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#C9A24D]/10 text-[#C9A24D] rounded-xl"><Euro size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#1F1F1F]/40 tracking-widest">Total Revenue</p>
                  <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm group hover:border-red-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><RefreshCcw size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#1F1F1F]/40 tracking-widest">Active Stornos</p>
                  <p className="text-2xl font-bold">{stats.stornoCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Send size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#1F1F1F]/40 tracking-widest">Email Delivery</p>
                  <p className="text-2xl font-bold">{stats.sentRate}% <span className="text-[10px] text-[#1F1F1F]/30 ml-1">SENT</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[#1F1F1F]/40 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${inv.type === 'cancellation' ? 'bg-red-50' : 'bg-[#C9A24D]/10'}`}>
                          <FileText className={`w-4 h-4 ${inv.type === 'cancellation' ? 'text-red-600' : 'text-[#C9A24D]'}`} />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-[#1F1F1F] text-sm">{inv.invoice_number}</p>
                          <p className="text-[9px] text-[#1F1F1F]/40 uppercase font-bold tracking-tighter">
                            {inv.type === 'cancellation' ? 'Correction' : 'Invoice'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Link 
                        href={`/admin/orders/${inv.order_id}`}
                        className="text-[#1F1F1F] font-bold hover:text-[#C9A24D] flex items-center gap-1 text-sm"
                      >
                        #{String(inv.order_id).slice(-5)}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-[#1F1F1F]">
                        {inv.invoice_data?.customer?.first_name ?? 'N/A'} {inv.invoice_data?.customer?.last_name ?? ''}
                      </p>
                      <p className="text-[10px] text-[#1F1F1F]/40 font-medium">{inv.invoice_data?.customer?.email ?? 'No Email'}</p>
                    </td>
                    <td className="px-6 py-5">
                      {/* ✨ UPDATED STATUS BADGE LOGIC */}
                      {inv.pdf_status === 'generated' ? (
                        inv.sent_at ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold uppercase tracking-tight">
                            <Mail className="w-3 h-3" /> Sent
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px] font-bold uppercase tracking-tight">
                            <CheckCircle className="w-3 h-3" /> Ready
                          </div>
                        )
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-tight">
                          <AlertCircle className="w-3 h-3" /> {inv.pdf_status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <a 
                          href={`/api/invoices/download/${inv.id}`}
                          target="_blank"
                          className="p-2 text-[#1F1F1F]/30 hover:text-[#C9A24D] hover:bg-[#C9A24D]/5 rounded-lg transition-all"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        {inv.type === 'invoice' && (inv.orders?.status === 'paid' || inv.status === 'issued') && (
                          <button 
                            onClick={() => handleRefund(inv.order_id, inv.invoice_number)}
                            disabled={processingId === inv.order_id}
                            className="p-2 text-[#1F1F1F]/30 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <RotateCcw className={`w-5 h-5 ${processingId === inv.order_id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="py-20 text-center text-[#1F1F1F]/20 text-xs uppercase font-black tracking-widest">No Documents Found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}