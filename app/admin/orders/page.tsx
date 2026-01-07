"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { Package, Mail, MapPin, Calendar, Loader2, CheckCircle, Truck, Clock, X } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'paid' | 'shipped'>('paid');

  // ✨ NEW: Shipping Modal State (Copied from Dashboard)
  const [shippingModal, setShippingModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL");
  const [isUpdating, setIsUpdating] = useState(false);

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

  // ✨ NEW: Handle Marking as Shipped & Sending Email
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
      const orderToUpdate = orders.find(o => o.id === shippingModal.orderId);
      
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

        // 4. Update UI Instantly
        setOrders(prev => prev.map(o => 
          o.id === shippingModal.orderId 
            ? { ...o, status: 'shipped', tracking_number: trackingNumber, carrier: carrier } 
            : o
        ));
      }
      
      // Close Modal
      setShippingModal({ open: false, orderId: null });
      setTrackingNumber("");
    } else {
      alert("Error updating order. Please try again.");
    }
    setIsUpdating(false);
  };

  // Filter orders based on the active tab
  const displayedOrders = orders.filter(order => 
    activeTab === 'paid' ? order.status === 'paid' : order.status === 'shipped'
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
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
                      <span className="text-2xl font-bold text-neon-rose">€{order.total?.toFixed(2)}</span>
                      
                      {/* ACTION BUTTON */}
                      {order.status === 'paid' ? (
                        <button 
                          onClick={() => setShippingModal({ open: true, orderId: order.id })}
                          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg hover:scale-105"
                        >
                          <Truck size={16} /> Mark as Shipped
                        </button>
                      ) : (
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-green-400 font-bold text-sm bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 mb-1">
                            <CheckCircle size={16} /> Shipped via {order.carrier}
                          </div>
                          <div className="text-xs text-gray-500 font-mono tracking-wider">
                            TRK: {order.tracking_number}
                          </div>
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
                            <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">
                                {item.quantity}x {item.name}
                              </p>
                              
                              {/* ✨ NEW: Ribbon Text Display */}
                              {item.customText && (
                                <p className="text-xs text-neon-rose mt-0.5 font-medium flex items-center gap-1">
                                  🎀 Ribbon: "{item.customText}"
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.options && Object.values(item.options).join(", ")} 
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

        {/* ✨ NEW: SHIPPING MODAL POPUP */}
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