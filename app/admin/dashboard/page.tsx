"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { DollarSign, ShoppingBag, Package, Loader2, Calendar, User, Truck, X, Mail, Copy, Check, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    pendingOrders: 0, // ✨ CHANGED: Focus on actionable orders
    lowStockCount: 0, // ✨ NEW: Track inventory issues
    subscribers: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]); // ✨ NEW: Store specific low stock products
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Shipping Modal State
  const [shippingModal, setShippingModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Orders (For Revenue & Pending Count)
        const { data: ordersData } = await supabase.from("orders").select("total, status");
        
        // 2. Fetch Subscribers
        const { data: newsletterData, count: subscriberCount } = await supabase
          .from("newsletter")
          .select("*", { count: 'exact' })
          .order('created_at', { ascending: false });

        // 3. Fetch Low Stock Products (< 5 items left)
        const { data: lowStockData } = await supabase
          .from("products")
          .select("id, name, stock, images")
          .lt('stock', 5) // Less than 5
          .eq('status', 'active'); // Only active products

        // CALCULATE STATS
        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        const pendingCount = ordersData?.filter(o => o.status === 'paid' || o.status === 'pending').length || 0;

        setStats({
          revenue: totalRevenue,
          pendingOrders: pendingCount,
          lowStockCount: lowStockData?.length || 0,
          subscribers: subscriberCount || 0,
        });

        if (newsletterData) setSubscribers(newsletterData);
        if (lowStockData) setLowStockItems(lowStockData);

        // 4. Fetch Recent Orders (Full Details)
        const { data: recentData } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5); // Show top 5

        if (recentData) setRecentOrders(recentData);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyEmails = () => {
    const emailList = subscribers.map(s => s.email).join(", ");
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // HANDLE MARK AS SHIPPED
  const handleMarkShipped = async () => {
    if (!shippingModal.orderId || !trackingNumber) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'shipped', 
        tracking_number: trackingNumber, 
        carrier: carrier,
        shipped_at: new Date().toISOString()
      })
      .eq('id', shippingModal.orderId);

    if (!error) {
      // Send Email Logic (Simplified for dashboard view)
      const orderToUpdate = recentOrders.find(o => o.id === shippingModal.orderId);
      if (orderToUpdate) {
        fetch('/api/send-shipping-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: orderToUpdate.email,
            customerName: orderToUpdate.customer_name,
            trackingNumber,
            carrier,
            orderId: shippingModal.orderId.toString()
          })
        });

        // Update UI
        setRecentOrders(prev => prev.map(o => 
          o.id === shippingModal.orderId 
            ? { ...o, status: 'shipped', tracking_number: trackingNumber, carrier: carrier } 
            : o
        ));
        
        // Decrease pending count locally
        setStats(prev => ({ ...prev, pendingOrders: Math.max(0, prev.pendingOrders - 1) }));
      }
      
      setShippingModal({ open: false, orderId: null });
      setTrackingNumber("");
    } else {
      alert("Error updating order.");
    }
    setIsUpdating(false);
  };

  return (
    /* ✅ FIXED: Theme Colors Updated to Cream & Ink */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 relative overflow-y-auto h-screen selection:bg-[#C9A24D] selection:text-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-[#1F1F1F]/60 font-medium">Overview & Quick Actions</p>
            </div>
            <Link href="/" target="_blank" className="text-sm font-bold text-[#C9A24D] hover:text-[#1F1F1F] transition-colors flex items-center gap-1">
              View Live Store <ArrowRight size={14} />
            </Link>
          </header>

          {isLoading ? (
            <div className="flex items-center gap-2 text-[#C9A24D] font-bold">
              <Loader2 className="animate-spin" /> Loading Command Center...
            </div>
          ) : (
            <>
              {/* --- STATS GRID --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Revenue */}
                <div className="bg-white border border-black/5 p-6 rounded-2xl relative overflow-hidden group hover:border-[#C9A24D]/50 transition-all shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#1F1F1F]"><DollarSign size={80} /></div>
                  <h3 className="text-[#1F1F1F]/50 text-xs font-bold uppercase tracking-widest mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-[#1F1F1F]">€{stats.revenue.toFixed(2)}</p>
                </div>

                {/* ✨ PENDING ORDERS (Actionable) */}
                <div className={`bg-white border p-6 rounded-2xl relative overflow-hidden transition-all shadow-sm ${stats.pendingOrders > 0 ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-black/5'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#1F1F1F]"><ShoppingBag size={80} /></div>
                  <h3 className="text-[#1F1F1F]/50 text-xs font-bold uppercase tracking-widest mb-2">Orders to Ship</h3>
                  <p className={`text-3xl font-bold ${stats.pendingOrders > 0 ? 'text-[#C9A24D]' : 'text-[#1F1F1F]'}`}>
                    {stats.pendingOrders}
                  </p>
                  {stats.pendingOrders > 0 && <span className="text-[10px] font-black uppercase text-[#C9A24D] animate-pulse">Action Required</span>}
                </div>

                {/* ✨ LOW STOCK ALERTS */}
                <div className={`bg-white border p-6 rounded-2xl relative overflow-hidden transition-all shadow-sm ${stats.lowStockCount > 0 ? 'border-red-200 bg-red-50' : 'border-black/5'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#1F1F1F]"><AlertTriangle size={80} /></div>
                  <h3 className="text-[#1F1F1F]/50 text-xs font-bold uppercase tracking-widest mb-2">Low Stock Items</h3>
                  <p className={`text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-[#1F1F1F]'}`}>
                    {stats.lowStockCount}
                  </p>
                </div>

                {/* Subscribers */}
                <div className="bg-white border border-black/5 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-all shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#1F1F1F]"><Mail size={80} /></div>
                  <h3 className="text-[#1F1F1F]/50 text-xs font-bold uppercase tracking-widest mb-2">VIP List</h3>
                  <p className="text-3xl font-bold text-[#1F1F1F]">{stats.subscribers}</p>
                </div>
              </div>

              {/* ✨ LOW STOCK WARNING BANNER (Only shows if items are low) */}
              {lowStockItems.length > 0 && (
                <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-red-600 font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-widest">
                    <AlertTriangle size={18} /> Re-Stock Required
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {lowStockItems.map(item => (
                      <Link href={`/admin/products/edit/${item.id}`} key={item.id} className="min-w-[220px] bg-red-50/50 p-3 rounded-xl border border-red-100 hover:border-red-300 transition-colors flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-red-100">
                            <img src={item.images?.[0] || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={item.name}/>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1F1F1F] truncate w-24">{item.name}</p>
                          <p className="text-[10px] text-red-600 font-black uppercase tracking-tighter">Only {item.stock} left</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-xl font-bold">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-[#C9A24D] hover:text-[#1F1F1F] transition-colors">View All</Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-[#1F1F1F]/40 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-6">Customer</th>
                        <th className="p-6">Status</th>
                        <th className="p-6">Total</th>
                        <th className="p-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-sm">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-6">
                            <div className="font-bold text-[#1F1F1F]">{order.customer_name || "Guest"}</div>
                            <div className="text-xs text-[#1F1F1F]/40 font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                              order.status === 'paid' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' 
                              : order.status === 'shipped' ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-6 font-mono font-bold text-[#C9A24D]">€{order.total?.toFixed(2)}</td>
                          <td className="p-6 text-right">
                            {order.status === 'paid' ? (
                              <button 
                                onClick={() => setShippingModal({ open: true, orderId: order.id })}
                                className="bg-[#1F1F1F] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C9A24D] transition-all flex items-center gap-2 ml-auto shadow-md"
                              >
                                <Truck size={12} /> Ship Now
                              </button>
                            ) : (
                               <span className="text-[10px] font-black uppercase text-[#1F1F1F]/30 flex items-center justify-end gap-1"><Check size={12}/> Fulfilled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentOrders.length === 0 && (
                    <div className="p-12 text-center text-[#1F1F1F]/30 font-bold italic uppercase tracking-widest">No orders yet. Time to sell!</div>
                  )}
                </div>
              </div>

              {/* SUBSCRIBERS LIST */}
              <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mail className="text-[#C9A24D]" size={20} /> Latest Subscribers
                  </h2>
                  <button onClick={copyEmails} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-[#1F1F1F] text-white hover:bg-[#C9A24D] px-4 py-2 rounded-xl transition-all shadow-md">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy Emails"}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-black/5 text-sm">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-[#1F1F1F]/40 text-xs font-bold uppercase">{new Date(sub.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-[#1F1F1F]">{sub.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          )}
        </div>

        {/* SHIPPING MODAL (Re-styled for theme) */}
        {shippingModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white border border-black/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 text-[#1F1F1F]"><Truck className="text-[#C9A24D]" /> Ship Order #{shippingModal.orderId}</h3>
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors" onClick={() => setShippingModal({ open: false, orderId: null })}><X size={20} className="text-[#1F1F1F]/40 hover:text-[#1F1F1F]"/></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40 block mb-2">Select Carrier</label>
                  <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 text-[#1F1F1F] font-bold outline-none focus:border-[#C9A24D] cursor-pointer">
                    <option value="DHL">DHL Express</option>
                    <option value="DPD">DPD</option>
                    <option value="Hermes">Hermes</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40 block mb-2">Tracking Number</label>
                  <input type="text" placeholder="Paste tracking code here..." value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 text-[#1F1F1F] font-bold outline-none focus:border-[#C9A24D] placeholder:text-[#1F1F1F]/20" />
                </div>
                <button onClick={handleMarkShipped} disabled={isUpdating || !trackingNumber} className="w-full bg-[#1F1F1F] text-white font-black uppercase tracking-widest py-5 rounded-2xl mt-4 hover:bg-[#C9A24D] transition-all disabled:opacity-50 shadow-xl">
                  {isUpdating ? "Saving..." : "Confirm Shipment"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}