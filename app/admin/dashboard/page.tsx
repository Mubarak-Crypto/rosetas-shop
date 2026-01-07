"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { DollarSign, ShoppingBag, Package, Loader2, Calendar, User, Truck, X, Mail, Copy, Check } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    subscribers: 0, // ✨ NEW: Track subscriber count
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]); // ✨ NEW: Store subscriber list
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false); // ✨ NEW: For copy button feedback

  // Shipping Modal State
  const [shippingModal, setShippingModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Orders & Products
        const { data: ordersData } = await supabase.from("orders").select("total");
        const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });

        // ✨ NEW: Fetch Newsletter Subscribers
        const { data: newsletterData, count: subscriberCount } = await supabase
          .from("newsletter")
          .select("*", { count: 'exact' })
          .order('created_at', { ascending: false });

        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        setStats({
          revenue: totalRevenue,
          orders: ordersData?.length || 0,
          products: productCount || 0,
          subscribers: subscriberCount || 0, // Set new stat
        });

        if (newsletterData) setSubscribers(newsletterData);

        // 2. Fetch Recent Orders
        const { data: recentData } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10); 

        if (recentData) setRecentOrders(recentData);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✨ NEW: Function to copy emails to clipboard
  const copyEmails = () => {
    const emailList = subscribers.map(s => s.email).join(", ");
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // HANDLE MARK AS SHIPPED & SEND EMAIL
  const handleMarkShipped = async () => {
    if (!shippingModal.orderId || !trackingNumber) return;
    setIsUpdating(true);

    // 1. Update Database
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'shipped', 
        tracking_number: trackingNumber,
        carrier: carrier 
      })
      .eq('id', shippingModal.orderId);

    if (!error) {
      // 2. Find Order Details for Email
      const orderToUpdate = recentOrders.find(o => o.id === shippingModal.orderId);
      
      if (orderToUpdate) {
        // 3. TRIGGER THE EMAIL API
        fetch('/api/send-shipping-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: orderToUpdate.email,
            customerName: orderToUpdate.customer_name,
            trackingNumber,
            carrier,
            orderId: shippingModal.orderId
          })
        });

        // 4. Update UI
        setRecentOrders(prev => prev.map(o => 
          o.id === shippingModal.orderId 
            ? { ...o, status: 'shipped', tracking_number: trackingNumber, carrier: carrier } 
            : o
        ));
      }
      
      setShippingModal({ open: false, orderId: null });
      setTrackingNumber("");
    } else {
      alert("Error updating order. Please try again.");
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 relative overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          <header>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, Boss.</p>
          </header>

          {isLoading ? (
            <div className="flex items-center gap-2 text-neon-rose">
              <Loader2 className="animate-spin" /> Loading live data...
            </div>
          ) : (
            <>
              {/* STATS GRID - Updated to 4 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Revenue */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-neon-rose/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-white">€{stats.revenue.toFixed(2)}</p>
                </div>

                {/* Orders */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-neon-purple/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">Total Orders</h3>
                  <p className="text-3xl font-bold text-white">{stats.orders}</p>
                </div>

                {/* Products */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">Active Products</h3>
                  <p className="text-3xl font-bold text-white">{stats.products}</p>
                </div>

                {/* ✨ NEW: VIP Subscribers Stat */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Mail size={80} /></div>
                  <h3 className="text-gray-400 font-medium mb-2">VIP List</h3>
                  <p className="text-3xl font-bold text-white">{stats.subscribers}</p>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold">Order Management</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Items</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 font-medium">
                              <User size={14} className="text-neon-rose" />
                              {order.customer_name || "Guest"}
                            </div>
                            <div className="text-xs text-gray-500 ml-6">{order.address}, {order.city}</div>
                          </td>
                          
                          <td className="p-4">
                            <div className="space-y-2">
                              {order.items && order.items.map((item: any, idx: number) => (
                                <div key={idx} className="bg-black/40 p-2 rounded border border-white/5">
                                  <div className="font-bold">{item.name} <span className="text-gray-500">x{item.quantity}</span></div>
                                  {item.customText && (
                                    <div className="mt-1 text-xs text-neon-rose flex items-center gap-1">
                                       🎀 Ribbon: "{item.customText}"
                                    </div>
                                  )}
                                  {item.options && Object.entries(item.options).map(([key, val]: any) => (
                                    <div key={key} className="text-xs text-gray-400">{key}: {val}</div>
                                  ))}
                                </div>
                              ))}
                            </div>
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

                          <td className="p-4">
                            {order.status === 'paid' ? (
                              <button 
                                onClick={() => setShippingModal({ open: true, orderId: order.id })}
                                className="bg-neon-rose text-black px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-glow-rose"
                              >
                                <Truck size={14} /> Ship Order
                              </button>
                            ) : (
                              <div className="text-xs text-gray-400">
                                <div className="font-bold text-white flex items-center gap-1">
                                  <Truck size={12} className="text-neon-rose"/> {order.carrier}
                                </div>
                                {order.tracking_number}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {recentOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders found yet.</div>
                  )}
                </div>
              </div>

              {/* ✨ NEW SECTION: VIP NEWSLETTER SUBSCRIBERS */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mail className="text-neon-rose" /> VIP Subscribers
                  </h2>
                  <button 
                    onClick={copyEmails}
                    className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors border border-white/5"
                  >
                    {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy All Emails"}
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {subscribers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No subscribers yet.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-white/5 text-gray-400 text-xs uppercase sticky top-0 bg-[#0a0a0a]">
                        <tr>
                          <th className="p-4">Date Joined</th>
                          <th className="p-4">Email Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-white/5">
                            <td className="p-4 text-gray-400 text-xs">
                              {new Date(sub.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-mono text-neon-rose">
                              {sub.email}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </>
          )}
        </div>

        {/* SHIPPING MODAL POPUP (Unchanged) */}
        {shippingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Truck className="text-neon-rose" /> Ship Order #{shippingModal.orderId}
                </h3>
                <button onClick={() => setShippingModal({ open: false, orderId: null })} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Carrier</label>
                  <select 
                    value={carrier} 
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-rose transition-colors"
                  >
                    <option value="DHL">DHL</option>
                    <option value="DHL Express">DHL Express</option>
                    <option value="Hermes">Hermes</option>
                    <option value="DPD">DPD</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Tracking Number</label>
                  <input 
                    type="text" 
                    placeholder="Scan or paste tracking number..." 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-neon-rose transition-colors"
                  />
                </div>

                <button 
                  onClick={handleMarkShipped}
                  disabled={isUpdating || !trackingNumber}
                  className="w-full bg-neon-rose text-black font-bold py-3 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-glow-rose"
                >
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