"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { Package, Mail, MapPin, Calendar, Loader2, CheckCircle, Truck, Clock } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'paid' | 'shipped'>('paid'); // Controls which tab we see

  // FETCH ORDERS
  const fetchOrders = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // FUNCTION TO MARK AS SHIPPED
  const markAsShipped = async (orderId: number) => {
    // 1. Optimistic Update (Update UI instantly so it feels fast)
    setOrders((prev) => 
      prev.map(order => order.id === orderId ? { ...order, status: 'shipped' } : order)
    );

    // 2. Update Database
    const { error } = await supabase
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order:", error);
      alert("Failed to update status");
      fetchOrders(); // Revert if failed
    }
  };

  // Filter orders based on the active tab
  // If tab is 'paid', show 'paid' orders. If 'shipped', show 'shipped'.
  const displayedOrders = orders.filter(order => 
    activeTab === 'paid' ? order.status === 'paid' : order.status === 'shipped'
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* HEADER & TABS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="text-neon-rose" /> Order Management
            </h1>
            
            {/* TABS SWITCHER */}
            <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
              <button 
                onClick={() => setActiveTab('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'paid' ? 'bg-neon-rose text-white shadow-glow-rose' : 'text-gray-400 hover:text-white'}`}
              >
                <Clock size={16} /> Pending ({orders.filter(o => o.status === 'paid').length})
              </button>
              <button 
                onClick={() => setActiveTab('shipped')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'shipped' ? 'bg-green-500 text-white shadow-glow-green' : 'text-gray-400 hover:text-white'}`}
              >
                <Truck size={16} /> Shipped History
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-purple" size={40} /></div>
          ) : displayedOrders.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-2xl text-center border border-white/10 text-gray-500 flex flex-col items-center gap-4">
              <Package size={48} className="opacity-20" />
              <p>No {activeTab} orders found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedOrders.map((order) => (
                <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* ORDER HEADER */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{order.customer_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Mail size={12} /> {order.email}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">ID: #{order.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-neon-rose">€{order.total}</span>
                      
                      {/* ACTION BUTTON */}
                      {order.status === 'paid' ? (
                        <button 
                          onClick={() => markAsShipped(order.id)}
                          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Truck size={16} /> Mark as Shipped
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400 font-bold text-sm bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                          <CheckCircle size={16} /> Shipped
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* SHIPPING INFO */}
                    <div className="space-y-2 text-sm text-gray-400">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Shipping Details</h4>
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-1 text-neon-purple" />
                        {order.address}, {order.city}, {order.zip}
                      </p>
                      <p className="pl-6 text-xs">Phone: {order.phone}</p>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="lg:col-span-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/5">
                            <div className="w-10 h-10 bg-gray-800 rounded overflow-hidden">
                              <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">
                                {item.quantity}x {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {Object.values(item.options).join(", ")} 
                                {item.extras?.length > 0 && ` + ${item.extras.join(", ")}`}
                              </p>
                            </div>
                            <div className="text-sm font-mono text-gray-300">
                              €{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}