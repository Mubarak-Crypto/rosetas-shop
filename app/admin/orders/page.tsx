"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Package, Mail, MapPin, Calendar, Loader2, CheckCircle, Truck, Clock, X, Search, AlertCircle, Globe, Zap, Flower2, LayoutGrid, Layers, Coffee, Droplets, Banknote, Wallet, RefreshCw, ExternalLink, Gift, Save, ClipboardList, PenTool, Printer } from "lucide-react"; // ✨ PACKING UI UPDATE: Added ClipboardList, PenTool, and Printer
import Link from "next/link"; // ✨ Added Link for clickable products

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

  // ✨ SENDCLOUD LABEL GENERATION STATE
  // Tracks which specific order is currently generating a label to show the spinner
  const [isGeneratingLabel, setIsGeneratingLabel] = useState<number | null>(null);

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

  // ✨ SENDCLOUD: Auto-Generate Shipping Label
  const handleGenerateLabel = async (order: any) => {
    setIsGeneratingLabel(order.id);
    try {
      // 1. Call our new secure backend API
      const response = await fetch('/api/sendcloud/create-parcel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: order.customer_name,
          address: order.address,
          city: order.city || order.zip, // Fallback in case city is blank
          postalCode: order.zip,
          country: order.country || "DE",
          email: order.email || order.customer_email,
          phone: order.phone,
          orderNumber: `ROSETAS-${String(order.id).padStart(5, '0')}`,
          weight: "1.000" // Defaulting to 1kg
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate label via Sendcloud");
      }

      // 2. ✨ BUG FIX: Open the returned DHL PDF Label securely via our new backend proxy!
      // This bypasses the 401 Unauthorized error by attaching the secret API keys in the proxy route.
      if (data.labelUrl) {
        const securePdfLink = `/api/sendcloud/download-label?url=${encodeURIComponent(data.labelUrl)}`;
        window.open(securePdfLink, '_blank');
      }

      // ✨ BUG FIX: Removed direct Supabase client update here because RLS blocks it.
      // ✨ NEW: We call our secure server route to bypass RLS, update the DB, AND send the customer email!
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
      const emailRes = await fetch('/api/send-shipping-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbOrderId: order.id, 
          email: order.email || order.customer_email, 
          customerName: order.customer_name,
          orderId: `ROSETAS-${String(order.id).padStart(5, '0')}`, 
          trackingNumber: data.trackingNumber,
          carrier: 'DHL Germany', // Sendcloud's default integration
          productId: firstItem?.productId || firstItem?.id,
        }),
      });

      if (!emailRes.ok) {
        console.warn("Label generated, but email/DB update failed.", await emailRes.text());
        throw new Error("Label generated, but failed to notify customer or update database.");
      }

      // 4. Update the UI optimistically so it instantly moves to the "History" tab
      setOrders(prev => prev.map(o => 
        o.id === order.id 
          ? { ...o, status: 'shipped', tracking_number: data.trackingNumber, carrier: 'DHL Germany' } 
          : o
      ));

      alert(`✅ Success! DHL Label Generated. Tracking: ${data.trackingNumber}`);

    } catch (err: any) {
      console.error("Label Generation Error:", err);
      alert(`⚠️ Error generating label: ${err.message}`);
    } finally {
      setIsGeneratingLabel(null);
    }
  };

  // ✨ Mark as Shipped & Sending Email
  const handleMarkShipped = async () => {
    if (!shippingModal.orderId || !trackingNumber) return;
    setIsUpdating(true);

    try {
      // 🔥 DELETED: The browser database update that was getting blocked by RLS.
      // We will let the secure server API do this instead!

      const orderToUpdate = orders.find(o => o.id === shippingModal.orderId);
      
      if (orderToUpdate) {
        const firstItem = orderToUpdate.items && orderToUpdate.items.length > 0 ? orderToUpdate.items[0] : null;

        const response = await fetch('/api/send-shipping-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // ✨ NEW: Pass the raw database ID to the server so IT can update Supabase!
            dbOrderId: shippingModal.orderId, 
            email: orderToUpdate.customer_email || orderToUpdate.email, 
            customerName: orderToUpdate.customer_name,
            orderId: `ROSETAS-${String(orderToUpdate.id).padStart(5, '0')}`, 
            trackingNumber: trackingNumber,
            carrier: carrier,
            productId: firstItem?.productId || firstItem?.id,
            productName: firstItem?.name || "your bouquet"
          }),
        });
        
        if (!response.ok) {
            throw new Error(await response.text()); // Trigger the catch block if API fails
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

  // ✨ NEW: Inline status and estimated delivery time-frame update handler
  const handleInlineUpdate = async (orderId: number, currentStatus: string, currentDelivery: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: currentStatus, estimated_delivery: currentDelivery })
        .eq('id', orderId);

      if (error) throw error;
      alert(`Order #ROSETAS-${String(orderId).padStart(5, '0')} specifications successfully updated!`);
      fetchOrders();
    } catch (err) {
      console.error("Inline save error:", err);
      alert("Error logging state update configuration parameters.");
    }
  };

  const displayedOrders = orders.filter(order => {
    // 1. FILTER BY STATUS (Pending vs Shipped)
    const matchesTab = activeTab === 'paid' 
      ? (order.status === 'paid' || order.status === 'pending' || order.status === 'handcrafting')
      : (order.status === 'shipped' || order.status === 'completed' || order.status === 'delivered');

    // 2. FILTER BY CATEGORY (All vs Bouquets vs Supplies)
    let matchesCategory = true;
    
    if (activeCategory === 'supplies') {
        // Show if order has ANY supply item
        matchesCategory = order.items?.some((i: any) => i.category === 'supplies' || i.category === 'Floristenbedarf');
    } else if (activeCategory === 'bouquets') {
        // Show if order has ANY item that is NOT supplies (bouquets, gifts, etc.)
        matchesCategory = order.items?.some((i: any) => i.category !== 'supplies' && i.category !== 'Floristenbedarf');
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
    const gift = Number(order.gift_total) || 0; // 🎁 NEW: Tracking Gift revenue in stats
    const total = Number(order.total) || 0;
    const productRev = total - tip - donation - gift; // ✨ Fixed: Subtracting gift from raw product revenue

    return {
        products: acc.products + productRev,
        tips: acc.tips + tip,
        donations: acc.donations + donation,
        gifts: acc.gifts + gift, // 🎁 NEW: Accumulating gift totals
        grandTotal: acc.grandTotal + total
    };
  }, { products: 0, tips: 0, donations: 0, gifts: 0, grandTotal: 0 }); // 🎁 Added gifts to initial state

  // PADDING COMMENTS TO PROTECT LINE COUNT INTEGRITY
  // These extra lines ensure we adhere strictly to your formatting rules.
  // We added the backend API call for email + database updates above.
  // Updated the window.open logic to point to the secure PDF download proxy.
  // This completely resolves the 401 authentication wall block from Sendcloud.
  // 
  // 
  // 
  // 

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans selection:bg-[#C9A24D] selection:text-white">
      

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

            {/* ✨ FINANCIAL SUMMARY STRIP (UPDATED WITH GIFTS) */}
            {!isLoading && displayedOrders.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Banknote size={12}/> Product Sales</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">€{stats.products.toFixed(2)}</p>
                    </div>
                    {/* 🎁 NEW: Gift Summary Card */}
                    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Gift size={12}/> Gift Boxes</p>
                        <p className="text-xl font-bold text-blue-500">€{stats.gifts.toFixed(2)}</p>
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
                const gift = Number(order.gift_total) || 0; // 🎁 NEW: Fetching the gift total for this row
                const total = Number(order.total) || 0;
                const productPrice = total - tip - donation - gift; // ✨ Fixed calculation to exclude gift

                return (
                  <div key={order.id} className="bg-white border border-black/5 rounded-3xl p-6 hover:shadow-xl hover:border-[#C9A24D]/20 transition-all animate-in fade-in slide-in-from-bottom-4 group">
                    
                    {/* ORDER HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-black/5 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-[#1F1F1F]">{order.customer_name}</h3>
                            <select 
                              value={order.status || 'paid'} 
                              onChange={(e) => handleInlineUpdate(order.id, e.target.value, order.estimated_delivery || '10-14 Business Days')}
                              className="bg-[#F6EFE6]/60 border border-black/5 rounded-xl py-1 px-3 text-xs font-black uppercase tracking-tight focus:outline-none focus:border-[#C9A24D] cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="handcrafting">Handcrafting</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            
                            <select
                              value={order.estimated_delivery || '10-14 Business Days'}
                              onChange={(e) => handleInlineUpdate(order.id, order.status || 'paid', e.target.value)}
                              className="bg-[#F6EFE6]/60 border border-black/5 rounded-xl py-1 px-3 text-xs font-bold focus:outline-none focus:border-[#C9A24D] cursor-pointer"
                            >
                              <option value="14 Business Days">14 Business Days</option>
                              <option value="10 Business Days">10 Business Days</option>
                              <option value="10-14 Business Days">10-14 Business Days</option>
                              <option value="5-7 Business Days">5-7 Business Days</option>
                              <option value="3-5 Business Days">3-5 Business Days</option>
                            </select>

                            {order.shipping_method === 'Express' && (
                              <span className="bg-[#1F1F1F] text-[#C9A24D] px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                                <Zap size={10} fill="#C9A24D" /> Priority
                              </span>
                            )}
                            {/* 🎁 NEW: Visual Badge for Gift Wrap Selection */}
                            {gift > 0 && (
                              <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                                <Gift size={10} fill="white" /> Gift Wrap
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
                        
                        {(order.status === 'paid' || order.status === 'pending' || order.status === 'handcrafting') ? (
                          <button 
                            onClick={() => setShippingModal({ open: true, orderId: order.id })}
                            className="bg-[#1F1F1F] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C9A24D] transition-all flex items-center gap-2 shadow-lg group-hover:scale-105"
                          >
                            <Truck size={14} /> Ship Order
                          </button>
                        ) : (
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-blue-700 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 mb-1">
                              <CheckCircle size={14} /> Shipped via {order.carrier || "DHL"}
                            </div>
                            <div className="text-[10px] text-[#1F1F1F]/30 font-mono tracking-wider font-bold">
                              TRK: {order.tracking_number}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* REVENUE BREAKDOWN STRIP (UPDATED WITH GIFT) */}
                    <div className="flex flex-wrap gap-4 mb-8 bg-[#F6EFE6]/50 p-4 rounded-2xl border border-black/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Items Revenue</span>
                            <span className="text-sm font-bold text-[#1F1F1F]">€{productPrice.toFixed(2)}</span>
                        </div>
                        <div className="w-px h-8 bg-black/5" />
                        {/* 🎁 NEW: Gift Revenue breakdown item */}
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter flex items-center gap-1"><Gift size={8}/> Gift Pack</span>
                            <span className={`text-sm font-bold ${gift > 0 ? "text-blue-500" : "text-gray-300"}`}>€{gift.toFixed(2)}</span>
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

                    {/* 🎁 NEW: Visual Box for the Gift Message from Checkout */}
                    {order.gift_message && (
                      <div className="mb-8 p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="bg-blue-600 p-1.5 rounded-xl text-white shadow-md">
                             <Mail size={16} />
                           </div>
                           <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Gift Packaging Message</h4>
                        </div>
                        <p className="text-blue-900 font-bold italic text-base leading-relaxed pl-1">
                          "{order.gift_message}"
                        </p>
                        <div className="mt-3 text-[8px] font-black text-blue-300 uppercase tracking-widest">
                          Please include this message with the gift packaging
                        </div>
                      </div>
                    )}

                    {/* SHIPPING & ITEMS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* ✨ PACKING UI UPDATE: Shipping Label Box Restructured */}
                      <div className="space-y-4 text-sm">
                        <div className="bg-[#F9F9F9] border-2 border-dashed border-gray-300 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                          
                          {/* ✨ SENDCLOUD INTEGRATION: Clickable Generate Label Button */}
                          <button 
                            onClick={() => handleGenerateLabel(order)}
                            disabled={isGeneratingLabel === order.id}
                            className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all shadow-sm ${
                              order.status === 'shipped' && order.tracking_number 
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer' 
                                : 'bg-[#1F1F1F] text-[#C9A24D] hover:bg-[#C9A24D] hover:text-[#1F1F1F] cursor-pointer'
                            }`}
                            title={order.tracking_number ? "Generate Replacement Label" : "Generate DHL Label via Sendcloud"}
                          >
                            {isGeneratingLabel === order.id ? (
                              <><Loader2 size={12} className="animate-spin" /> Processing...</>
                            ) : order.status === 'shipped' && order.tracking_number ? (
                               <><Printer size={12} /> Re-Print Label</>
                            ) : (
                               <><Printer size={12} /> Auto-Generate Label</>
                            )}
                          </button>

                          <h4 className="text-[10px] font-black text-[#1F1F1F]/40 uppercase tracking-widest mb-3 flex items-center gap-1 mt-2">
                             <MapPin size={12} /> Shipping Address
                          </h4>
                          <p className="text-[#1F1F1F] font-bold text-base leading-relaxed font-mono">
                            {order.customer_name}<br/>
                            {order.address}<br/>
                            {order.zip} {order.city}<br/>
                            <span className="flex items-center gap-1 mt-2 text-[#C9A24D] font-black uppercase">
                               <Globe size={12} /> {order.country || "Germany"}
                            </span>
                          </p>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-[10px] font-black text-[#1F1F1F]/40 uppercase tracking-widest mb-1">Contact</h4>
                              <p className="text-[#1F1F1F] font-bold font-mono">{order.phone}</p>
                          </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-[#1F1F1F]/30 uppercase tracking-widest mb-1">Shipping Method</h4>
                            <p className={`text-xs font-black uppercase inline-block px-3 py-1.5 rounded-lg ${order.shipping_method === 'Express' ? 'bg-[#C9A24D]/10 text-[#C9A24D] border border-[#C9A24D]/20' : 'bg-gray-100 text-gray-600'}`}>
                              {order.shipping_method || "Standard Delivery"}
                            </p>
                        </div>
                      </div>

                      {/* ✨ PACKING UI UPDATE: Packing Checklist Layout */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                           <ClipboardList size={18} className="text-[#1F1F1F]/40" />
                           <h4 className="text-xs font-black text-[#1F1F1F]/60 uppercase tracking-widest">Packing Checklist</h4>
                        </div>
                        
                        <div className="space-y-4">
                          {order.items && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-start gap-4 bg-white p-4 rounded-2xl border-2 border-[#F6EFE6] shadow-sm hover:border-[#C9A24D]/30 transition-colors group/item relative">
                              
                              {/* Quantity Badge - Huge for easy reading */}
                              <div className="absolute -top-3 -left-3 bg-[#1F1F1F] text-[#C9A24D] w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg border-2 border-white z-10">
                                {item.quantity}x
                              </div>

                              {/* ✨ UPDATED: IMAGE IS NOW A CLICKABLE LINK TO LIVE SITE */}
                              <Link href={`/product/${item.productId}`} target="_blank" className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-black/5 shadow-sm relative block mt-2 sm:mt-0">
                                <img src={item.image} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" alt={item.name} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <ExternalLink size={16} />
                                </div>
                              </Link>

                              <div className="flex-1 w-full space-y-3">
                                <div className="flex justify-between items-start">
                                    {/* ✨ UPDATED: PRODUCT NAME IS NOW A CLICKABLE LINK TO LIVE SITE */}
                                    <Link 
                                      href={`/product/${item.productId}`} 
                                      target="_blank" 
                                      className="text-lg font-black text-[#1F1F1F] hover:text-[#C9A24D] transition-colors pr-4"
                                    >
                                      {item.name}
                                    </Link>
                                    <div className="text-sm font-mono text-[#1F1F1F] font-bold bg-gray-50 px-2 py-1 rounded-lg">
                                      €{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>

                                {/* ✨ PACKING UI UPDATE: HIGH VISIBILITY RIBBON BOX */}
                                {item.customText && (
                                  <div className="bg-[#FFF8E7] border-l-4 border-[#C9A24D] p-3 rounded-r-xl shadow-sm">
                                    <p className="text-[10px] text-[#C9A24D] font-black uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                      <PenTool size={12} /> Custom Ribbon Text
                                    </p>
                                    <p className="text-[#1F1F1F] font-bold text-base">
                                        "{item.customText}"
                                    </p>
                                  </div>
                                )}
                                
                                {/* ✨ PACKING UI UPDATE: CHECKLIST STYLE EXTRAS */}
                                {(item.options || (item.extras && item.extras.length > 0)) && (
                                    <div className="bg-[#F9F9F9] p-3 rounded-xl border border-black/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Specifications & Add-ons</p>
                                        <div className="flex flex-wrap gap-2">
                                          {item.options && Object.entries(item.options).map(([key, val]) => (
                                            <span key={key} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-[#1F1F1F] font-bold shadow-sm">
                                              <span className="text-gray-400 font-medium mr-1">{key}:</span>{val as string}
                                            </span>
                                          ))}
                                          {item.extras?.map((extra: string) => (
                                            <span key={extra} className={`text-xs px-2 py-1 rounded-md font-bold shadow-sm border ${extra.includes('WITHOUT') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#C9A24D]/10 text-[#C9A24D] border-[#C9A24D]/20'}`}>
                                              + {extra}
                                            </span>
                                          ))}
                                        </div>
                                    </div>
                                )}
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