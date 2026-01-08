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
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 relative overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400">Overview & Quick Actions</p>
            </div>
            <Link href="/" target="_blank" className="text-sm text-neon-rose hover:text-white transition-colors flex items-center gap-1">
              View Live Store <ArrowRight size={14} />
            </Link>
          </header>

          {isLoading ? (
            <div className="flex items-center gap-2 text-neon-rose">
              <Loader2 className="animate-spin" /> Loading Command Center...
            </div>
          ) : (
            <>
              {/* --- STATS GRID --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Revenue */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-neon-rose/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-white">€{stats.revenue.toFixed(2)}</p>
                </div>

                {/* ✨ PENDING ORDERS (Actionable) */}
                <div className={`bg-white/5 border p-6 rounded-2xl relative overflow-hidden transition-all ${stats.pendingOrders > 0 ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-white/10'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">Orders to Ship</h3>
                  <p className={`text-3xl font-bold ${stats.pendingOrders > 0 ? 'text-yellow-400' : 'text-white'}`}>
                    {stats.pendingOrders}
                  </p>
                  {stats.pendingOrders > 0 && <span className="text-xs text-yellow-500 animate-pulse">Action Required</span>}
                </div>

                {/* ✨ LOW STOCK ALERTS */}
                <div className={`bg-white/5 border p-6 rounded-2xl relative overflow-hidden transition-all ${stats.lowStockCount > 0 ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">Low Stock Items</h3>
                  <p className={`text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
                    {stats.lowStockCount}
                  </p>
                </div>

                {/* Subscribers */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Mail size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">VIP List</h3>
                  <p className="text-3xl font-bold text-white">{stats.subscribers}</p>
                </div>
              </div>

              {/* ✨ LOW STOCK WARNING BANNER (Only shows if items are low) */}
              {lowStockItems.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                  <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} /> Re-Stock Required
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {lowStockItems.map(item => (
                      <Link href={`/admin/products/edit/${item.id}`} key={item.id} className="min-w-[200px] bg-black/40 p-3 rounded-xl border border-red-500/20 hover:border-red-500/50 transition-colors flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                           <img src={item.images?.[0] || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                        </div>
                        <div>
                          <p className="font-bold text-sm truncate w-24">{item.name}</p>
                          <p className="text-xs text-red-400 font-mono">Only {item.stock} left</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-xs font-bold text-neon-rose hover:text-white">View All</Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-bold">{order.customer_name || "Guest"}</div>
                            <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                              order.status === 'paid' ? 'bg-yellow-500/20 text-yellow-400' 
                              : order.status === 'shipped' ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-gray-300">€{order.total?.toFixed(2)}</td>
                          <td className="p-4">
                            {order.status === 'paid' ? (
                              <button 
                                onClick={() => setShippingModal({ open: true, orderId: order.id })}
                                className="bg-neon-rose text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1"
                              >
                                <Truck size={12} /> Ship
                              </button>
                            ) : (
                               <span className="text-xs text-gray-500 flex items-center gap-1"><Check size={12}/> Done</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders yet. Time to sell!</div>
                  )}
                </div>
              </div>

              {/* SUBSCRIBERS LIST (Keeping your existing logic) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mail className="text-neon-rose" /> Latest Subscribers
                  </h2>
                  <button onClick={copyEmails} className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">
                    {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy All Emails"}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-white/5 text-sm">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/5">
                          <td className="p-4 text-gray-400 text-xs">{new Date(sub.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-mono text-neon-rose">{sub.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          )}
        </div>

        {/* SHIPPING MODAL (Re-used for quick action) */}
        {shippingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><Truck className="text-neon-rose" /> Ship Order #{shippingModal.orderId}</h3>
                <button onClick={() => setShippingModal({ open: false, orderId: null })}><X size={20} className="text-gray-500 hover:text-white"/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Carrier</label>
                  <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-rose">
                    <option value="DHL">DHL</option>
                    <option value="DPD">DPD</option>
                    <option value="Hermes">Hermes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Tracking Number</label>
                  <input type="text" placeholder="Tracking Number..." value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-rose" />
                </div>
                <button onClick={handleMarkShipped} disabled={isUpdating || !trackingNumber} className="w-full bg-neon-rose text-black font-bold py-3 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50">
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