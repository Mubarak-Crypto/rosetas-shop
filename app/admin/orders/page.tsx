"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { Package, Mail, MapPin, Calendar, Loader2, CheckCircle, Truck, Clock, X, Search, AlertCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'paid' | 'shipped'>('paid');
  const [searchTerm, setSearchTerm] = useState(""); // ✨ New Search State

  // ✨ SHIPPING MODAL STATE
  const [shippingModal, setShippingModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL Germany");
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

  // ✨ FIXED: Handle Marking as Shipped & Sending Email
  const handleMarkShipped = async () => {
    if (!shippingModal.orderId || !trackingNumber) return;
    setIsUpdating(true);

    try {
      // 1. Update Database Status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'shipped', 
          tracking_number: trackingNumber,
          carrier: carrier,
          shipped_at: new Date().toISOString() // Save the exact time
        })
        .eq('id', shippingModal.orderId);

      if (error) throw error;

      // 2. Find Order Details for Email
      const orderToUpdate = orders.find(o => o.id === shippingModal.orderId);
      
      if (orderToUpdate) {
        // 3. TRIGGER THE CORRECT API (Fixed to match your folder 'send-shipping-email')
        const response = await fetch('/api/send-shipping-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: orderToUpdate.customer_email || orderToUpdate.email, // Handle both field names
            customerName: orderToUpdate.customer_name,
            orderId: orderToUpdate.id.toString().slice(0, 8).toUpperCase(), // Format ID nicely
            trackingNumber: trackingNumber,
            carrier: carrier,
          }),
        });
        
        if (!response.ok) {
            console.error("Email API failed:", await response.text());
            // We don't stop the UI update here, but we log the error
        }

        // 4. Update UI Instantly (Move order to 'Shipped' tab)
        setOrders(prev => prev.map(o => 
          o.id === shippingModal.orderId 
            ? { ...o, status: 'shipped', tracking_number: trackingNumber, carrier: carrier } 
            : o
        ));

        // 5. Success Message
        alert(`Order #${shippingModal.orderId} marked as shipped! Email sent.`);
      }
      
      // Close Modal & Reset
      setShippingModal({ open: false, orderId: null });
      setTrackingNumber("");
      
    } catch (err) {
      console.error("Shipping error:", err);
      alert("Error updating order. Please check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter orders based on the active tab AND search term
  const displayedOrders = orders.filter(order => {
    // Tab Filter
    const matchesTab = activeTab === 'paid' 
      ? (order.status === 'paid' || order.status === 'pending')
      : (order.status === 'shipped' || order.status === 'completed');

    // Search Filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  return (
    /* ✅ FIXED: Background changed to Vanilla Cream and selection color to Champagne Gold */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans selection:bg-[#C9A24D] selection:text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          {/* HEADER & CONTROLS */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="text-[#C9A24D]" /> Order Management
              </h1>
              
              {/* TABS SWITCHER - Styled for Vanilla Theme */}
              <div className="bg-white/50 p-1 rounded-xl flex gap-1 border border-black/5 self-start md:self-auto shadow-sm">
                <button 
                  onClick={() => setActiveTab('paid')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'paid' ? 'bg-[#1F1F1F] text-white shadow-lg' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
                >
                  <Clock size={16} /> Pending
                </button>
                <button 
                  onClick={() => setActiveTab('shipped')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'shipped' ? 'bg-[#C9A24D] text-white shadow-lg' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
                >
                  <Truck size={16} /> Shipped History
                </button>
              </div>
            </div>

            {/* SEARCH BAR - Styled for Vanilla Theme */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/20" size={20} />
              <input 
                type="text" 
                placeholder="Search by customer name, email, or Order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-black/5 rounded-xl py-3 pl-12 pr-4 text-[#1F1F1F] placeholder:text-[#1F1F1F]/20 focus:outline-none focus:border-[#C9A24D] transition-all shadow-sm font-medium"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C9A24D]" size={40} /></div>
          ) : displayedOrders.length === 0 ? (
            <div className="bg-white/40 p-12 rounded-3xl text-center border border-dashed border-black/10 text-[#1F1F1F]/40 flex flex-col items-center gap-4">
              <Package size={48} className="opacity-10" />
              <p className="font-bold uppercase tracking-widest text-sm">No {activeTab} orders found {searchTerm && "matching your search"}.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedOrders.map((order) => (
                <div key={order.id} className="bg-white border border-black/5 rounded-3xl p-6 hover:shadow-xl hover:border-[#C9A24D]/20 transition-all animate-in fade-in slide-in-from-bottom-4 group">
                  
                  {/* ORDER HEADER */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-bold text-[#1F1F1F]">{order.customer_name}</h3>
                         {/* Status Badge */}
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                           order.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                           order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                           'bg-yellow-50 text-yellow-700 border-yellow-100'
                         }`}>
                           {order.status}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#1F1F1F]/40 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Mail size={12} /> {order.email || order.customer_email}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="bg-black/5 px-2 py-0.5 rounded text-xs text-[#1F1F1F]/60 font-mono">#{order.id.toString().slice(0,8).toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#C9A24D]">€{order.total_amount || order.total?.toFixed(2)}</span>
                      
                      {/* ACTION BUTTON */}
                      {(order.status === 'paid' || order.status === 'pending') ? (
                        <button 
                          onClick={() => setShippingModal({ open: true, orderId: order.id })}
                          className="bg-[#1F1F1F] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C9A24D] transition-all flex items-center gap-2 shadow-lg group-hover:scale-105"
                        >
                          <Truck size={14} /> Ship Order
                        </button>
                      ) : (
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-blue-700 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 mb-1">
                            <CheckCircle size={14} /> Shipped via {order.carrier}
                          </div>
                          <div className="text-[10px] text-[#1F1F1F]/30 font-mono tracking-wider font-bold">
                            TRK: {order.tracking_number}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SHIPPING & ITEMS GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* SHIPPING INFO */}
                    <div className="space-y-4 text-sm text-[#1F1F1F]/60">
                      <div>
                        <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-2">Shipping Address</h4>
                        <p className="flex items-start gap-2">
                          <MapPin size={14} className="mt-1 text-[#C9A24D]" />
                          <span className="text-[#1F1F1F] font-medium leading-relaxed">
                            {order.address}<br/>
                            {order.city}, {order.zip}
                          </span>
                        </p>
                      </div>
                      <div>
                         <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-2">Contact</h4>
                         <p className="pl-6 text-[#1F1F1F] font-bold">{order.phone}</p>
                      </div>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="lg:col-span-2">
                      <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items && order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-black/5">
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-black/5 shadow-sm">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#1F1F1F]">
                                <span className="text-[#C9A24D]">{item.quantity}x</span> {item.name}
                              </p>
                              
                              {/* Ribbon Text Display */}
                              {item.customText && (
                                <p className="text-[10px] text-[#C9A24D] mt-0.5 font-black uppercase tracking-tight flex items-center gap-1">
                                  🎀 Ribbon: "{item.customText}"
                                </p>
                              )}
                              
                              <p className="text-[10px] text-[#1F1F1F]/40 mt-0.5 font-bold uppercase tracking-tighter">
                                {item.options && Object.values(item.options).join(", ")} 
                              </p>
                            </div>
                            <div className="text-sm font-mono text-[#1F1F1F] font-bold">
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

        {/* ✨ SHIPPING MODAL POPUP - Redesigned for Vanilla Theme */}
        {shippingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white border border-black/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 text-[#1F1F1F]">
                  <Truck className="text-[#C9A24D]" /> Ship Order
                </h3>
                <button onClick={() => setShippingModal({ open: false, orderId: null })} className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#1F1F1F]/40 hover:text-[#1F1F1F]">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#1F1F1F]/40 block mb-2 tracking-widest">Select Carrier</label>
                  <select 
                    value={carrier} 
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 text-[#1F1F1F] font-bold outline-none focus:border-[#C9A24D] transition-colors cursor-pointer"
                  >
                    <option value="DHL Germany">DHL Germany</option>
                    <option value="DHL Express">DHL Express</option>
                    <option value="Hermes">Hermes</option>
                    <option value="DPD">DPD</option>
                    <option value="UPS">UPS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#1F1F1F]/40 block mb-2 tracking-widest">Tracking Number</label>
                  <input 
                    type="text" 
                    placeholder="Scan or paste tracking number..." 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl p-4 text-[#1F1F1F] font-bold outline-none focus:border-[#C9A24D] transition-colors placeholder:text-[#1F1F1F]/20"
                  />
                </div>

                <button 
                  onClick={handleMarkShipped}
                  disabled={isUpdating || !trackingNumber}
                  className="w-full bg-[#1F1F1F] text-white font-black uppercase tracking-widest py-5 rounded-2xl mt-4 hover:bg-[#C9A24D] transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : null}
                  {isUpdating ? "Processing..." : "Confirm Shipment"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}