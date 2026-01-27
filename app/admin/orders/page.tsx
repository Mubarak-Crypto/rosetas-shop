"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { Package, Mail, MapPin, Calendar, Loader2, CheckCircle, Truck, Clock, X, Search, AlertCircle, Globe, Zap, Flower2, LayoutGrid, Layers, Coffee, Droplets, Banknote, Wallet, RefreshCw } from "lucide-react"; 

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✨ Category Tab State ('all' | 'bouquets' | 'supplies')
  const [activeCategory, setActiveCategory] = useState<'all' | 'bouquets' | 'supplies'>('all');
  
  const [activeTab, setActiveTab] = useState<'paid' | 'shipped'>('paid');
  const [searchTerm, setSearchTerm] = useState(""); 

  // ✨ SHIPPING MODAL STATE
  const [shippingModal, setShippingModal] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("DHL Germany");
  const [isUpdating, setIsUpdating] = useState(false);

  // FETCH ORDERS
  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
    } else if (data) {
        setOrders(data);
    }
    setIsLoading(false);
  };

  // ✨ NEW: REALTIME SUBSCRIPTION (Live Updates)
  useEffect(() => {
    // 1. Initial Fetch
    fetchOrders();

    // 2. Subscribe to changes
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // If a new order comes in or an order changes, just re-fetch to be safe and accurate
          fetchOrders(); 
        }
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✨ Mark as Shipped & Sending Email
  const handleMarkShipped = async () => {
    if (!shippingModal.orderId || !trackingNumber) return;
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'shipped', 
          tracking_number: trackingNumber,
          carrier: carrier,
          shipped_at: new Date().toISOString() 
        })
        .eq('id', shippingModal.orderId);

      if (error) throw error;

      const orderToUpdate = orders.find(o => o.id === shippingModal.orderId);
      
      if (orderToUpdate) {
        const firstItem = orderToUpdate.items && orderToUpdate.items.length > 0 ? orderToUpdate.items[0] : null;

        const response = await fetch('/api/send-shipping-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: orderToUpdate.customer_email || orderToUpdate.email, 
            customerName: orderToUpdate.customer_name,
            // ✨ UPDATED: Send the branded ID in the email too
            orderId: `ROSETAS-${String(orderToUpdate.id).padStart(5, '0')}`, 
            trackingNumber: trackingNumber,
            carrier: carrier,
            productId: firstItem?.productId || firstItem?.id,
            productName: firstItem?.name || "your bouquet"
          }),
        });
        
        if (!response.ok) {
            console.error("Email API failed:", await response.text());
        }

        // Optimistic Update (UI updates instantly)
        setOrders(prev => prev.map(o => 
          o.id === shippingModal.orderId 
            ? { ...o, status: 'shipped', tracking_number: trackingNumber, carrier: carrier } 
            : o
        ));

        // ✨ UPDATED: Alert shows branded ID
        alert(`Order #ROSETAS-${String(shippingModal.orderId).padStart(5, '0')} marked as shipped! Email sent.`);
      }
      
      setShippingModal({ open: false, orderId: null });
      setTrackingNumber("");
      
    } catch (err) {
      console.error("Shipping error:", err);
      alert("Error updating order. Please check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  const displayedOrders = orders.filter(order => {
    // 1. FILTER BY STATUS (Pending vs Shipped)
    const matchesTab = activeTab === 'paid' 
      ? (order.status === 'paid' || order.status === 'pending')
      : (order.status === 'shipped' || order.status === 'completed');

    // 2. FILTER BY CATEGORY (All vs Bouquets vs Supplies)
    let matchesCategory = true;
    
    if (activeCategory === 'supplies') {
        // Show if order has ANY supply item
        matchesCategory = order.items?.some((i: any) => i.category === 'supplies');
    } else if (activeCategory === 'bouquets') {
        // Show if order has ANY item that is NOT supplies (bouquets, gifts, etc.)
        matchesCategory = order.items?.some((i: any) => i.category !== 'supplies');
    }

    // 3. SEARCH FILTER
    const searchLower = searchTerm.toLowerCase();
    // ✨ UPDATED: Generate the branded ID string for searching
    const formattedId = `ROSETAS-${String(order.id).padStart(5, '0')}`.toLowerCase();

    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.country?.toLowerCase().includes(searchLower) || 
      order.id.toString().includes(searchLower) ||
      formattedId.includes(searchLower); // ✨ Allow searching by "ROSETAS-00..."

    return matchesTab && matchesCategory && matchesSearch;
  });

  // ✨ Financials Calculation
  const stats = displayedOrders.reduce((acc, order) => {
    const tip = Number(order.tip_amount) || 0;
    const donation = Number(order.donation_amount) || 0;
    const total = Number(order.total) || 0;
    const productRev = total - tip - donation;

    return {
        products: acc.products + productRev,
        tips: acc.tips + tip,
        donations: acc.donations + donation,
        grandTotal: acc.grandTotal + total
    };
  }, { products: 0, tips: 0, donations: 0, grandTotal: 0 });

  return (
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
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* ✨ MANUAL REFRESH BUTTON (Just in case) */}
                <button 
                    onClick={fetchOrders}
                    className="p-2 bg-white border border-black/10 rounded-xl hover:bg-black/5 transition-colors text-[#1F1F1F]/60"
                    title="Force Refresh"
                >
                    <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                </button>

                <div className="bg-white p-1 rounded-xl flex gap-1 border border-black/5 shadow-sm">
                   <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeCategory === 'all' ? 'bg-[#C9A24D] text-white shadow-md' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
                  >
                    <Layers size={16} /> All
                  </button>
                   <button 
                    onClick={() => setActiveCategory('bouquets')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeCategory === 'bouquets' ? 'bg-[#C9A24D] text-white shadow-md' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
                  >
                    <Flower2 size={16} /> Bouquets
                  </button>
                  <button 
                    onClick={() => setActiveCategory('supplies')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeCategory === 'supplies' ? 'bg-[#C9A24D] text-white shadow-md' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
                  >
                    <LayoutGrid size={16} /> Supplies
                  </button>
                </div>

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
                    <Truck size={16} /> History
                  </button>
                </div>
              </div>
            </div>

            {/* ✨ FINANCIAL SUMMARY STRIP (FIXED COLORS) */}
            {!isLoading && displayedOrders.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Banknote size={12}/> Product Sales</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">€{stats.products.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Coffee size={12}/> Team Tips</p>
                        <p className="text-xl font-bold text-amber-600">€{stats.tips.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Droplets size={12}/> Well Project</p>
                        <p className="text-xl font-bold text-blue-600">€{stats.donations.toFixed(2)}</p>
                    </div>
                    {/* ✅ FIXED BLOCK: White background with Gold Border for readability */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-[#C9A24D] shadow-lg">
                        <p className="text-[10px] font-black text-[#C9A24D] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Wallet size={12}/> Total Revenue</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">€{stats.grandTotal.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* SEARCH BAR */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/20" size={20} />
              <input 
                type="text" 
                placeholder={`Search ${activeCategory === 'all' ? '' : activeCategory} orders by name, email, or ID...`} 
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
              <p className="font-bold uppercase tracking-widest text-sm">
                No {activeCategory === 'all' ? '' : activeCategory} orders found.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedOrders.map((order) => {
                const tip = Number(order.tip_amount) || 0;
                const donation = Number(order.donation_amount) || 0;
                const total = Number(order.total) || 0;
                const productPrice = total - tip - donation;

                return (
                  <div key={order.id} className="bg-white border border-black/5 rounded-3xl p-6 hover:shadow-xl hover:border-[#C9A24D]/20 transition-all animate-in fade-in slide-in-from-bottom-4 group">
                    
                    {/* ORDER HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-[#1F1F1F]">{order.customer_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                              order.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-yellow-50 text-yellow-700 border-yellow-100'
                            }`}>
                              {order.status}
                            </span>
                            {order.shipping_method === 'Express' && (
                              <span className="bg-[#1F1F1F] text-[#C9A24D] px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                                <Zap size={10} fill="#C9A24D" /> Priority
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#1F1F1F]/40 mt-1 font-medium">
                          <span className="flex items-center gap-1"><Mail size={12} /> {order.email || order.customer_email}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}</span>
                          
                          {/* ✨ UPDATED: Branded Order ID Display */}
                          <span className="bg-black/5 px-2 py-0.5 rounded text-xs text-[#1F1F1F]/60 font-mono font-bold">
                            ROSETAS-{String(order.id).padStart(5, '0')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[#1F1F1F]/20 uppercase tracking-widest">Grand Total</p>
                            <span className="text-2xl font-bold text-[#C9A24D]">€{total.toFixed(2)}</span>
                        </div>
                        
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

                    {/* REVENUE BREAKDOWN STRIP */}
                    <div className="flex flex-wrap gap-4 mb-8 bg-[#F6EFE6]/50 p-4 rounded-2xl border border-black/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Items Revenue</span>
                            <span className="text-sm font-bold text-[#1F1F1F]">€{productPrice.toFixed(2)}</span>
                        </div>
                        <div className="w-px h-8 bg-black/5" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter flex items-center gap-1"><Coffee size={8}/> Team Tip</span>
                            <span className={`text-sm font-bold ${tip > 0 ? "text-amber-600" : "text-gray-300"}`}>€{tip.toFixed(2)}</span>
                        </div>
                        <div className="w-px h-8 bg-black/5" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter flex items-center gap-1"><Droplets size={8}/> Well Donation</span>
                            <span className={`text-sm font-bold ${donation > 0 ? "text-blue-600" : "text-gray-300"}`}>€{donation.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* SHIPPING & ITEMS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="space-y-4 text-sm text-[#1F1F1F]/60">
                        <div>
                          <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-2">Shipping Address</h4>
                          <p className="flex items-start gap-2">
                            <MapPin size={14} className="mt-1 text-[#C9A24D]" />
                            <span className="text-[#1F1F1F] font-medium leading-relaxed">
                              {order.address}<br/>
                              {order.city}, {order.zip}<br/>
                              <span className="flex items-center gap-1 mt-1 text-[#1F1F1F] font-bold">
                                 <Globe size={12} className="text-[#C9A24D]" /> {order.country || "Germany"}
                              </span>
                            </span>
                          </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-1">Method</h4>
                            <p className={`text-[11px] font-black uppercase ${order.shipping_method === 'Express' ? 'text-[#C9A24D]' : 'text-[#1F1F1F]'}`}>
                              {order.shipping_method || "Standard"}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-1">Contact</h4>
                            <p className="text-[#1F1F1F] font-bold">{order.phone}</p>
                        </div>
                      </div>

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
                );
              })}
            </div>
          )}
        </div>

        {/* SHIPPING MODAL */}
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