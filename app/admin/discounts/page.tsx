"use client";

import { useState, useEffect } from "react";
import { 
  Tag, Plus, Trash2, Loader2, Save, X, ToggleLeft, ToggleRight, 
  Calendar, Hash, DollarSign, Percent, ShoppingBag, Users 
} from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";

// Match the SQL Table we just created
interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // 1. Fetch Codes
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCodes(data);
    setIsLoading(false);
  };

  // 2. Create Code
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newValue) return;

    const { data, error } = await supabase.from('discount_codes').insert([
      {
        code: newCode.toUpperCase().trim(), // Auto uppercase
        discount_type: newType,
        value: parseFloat(newValue),
        min_order_value: minOrder ? parseFloat(minOrder) : 0,
        max_uses: maxUses ? parseInt(maxUses) : null, // Null means unlimited
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
        is_active: true
      }
    ]).select();

    if (error) {
      alert("Error: " + error.message);
    } else {
      setCodes([data[0], ...codes]); // Add to list instantly
      // Reset Form
      setNewCode("");
      setNewValue("");
      setMinOrder("");
      setMaxUses("");
      setExpiryDate("");
      setIsCreating(false);
    }
  };

  // 3. Delete Code
  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this code?")) return;
    
    await supabase.from('discount_codes').delete().eq('id', id);
    setCodes(codes.filter(c => c.id !== id));
  };

  // 4. Toggle Status (Active/Inactive)
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic Update (Update UI first)
    setCodes(codes.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    
    await supabase.from('discount_codes').update({ is_active: !currentStatus }).eq('id', id);
  };

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Tag className="text-[#C9A24D]" /> Discount Codes
              </h1>
              <p className="text-[#1F1F1F]/60 text-sm font-medium mt-1">Manage your promotions and coupons.</p>
            </div>
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="bg-[#1F1F1F] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#C9A24D] transition-colors shadow-lg"
            >
              {isCreating ? <X size={20} /> : <Plus size={20} />}
              {isCreating ? "Cancel" : "New Code"}
            </button>
          </div>

          {/* CREATE FORM */}
          {isCreating && (
            <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm mb-8 animate-in slide-in-from-top-4">
              <h3 className="font-bold text-lg mb-4">Create New Promotion</h3>
              <form onSubmit={handleCreate} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Code Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Code Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VALENTINE10" 
                      value={newCode}
                      onChange={e => setNewCode(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 font-bold uppercase tracking-wider focus:border-[#C9A24D] outline-none"
                      required
                    />
                  </div>

                  {/* Discount Value */}
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <div className="flex bg-gray-50 rounded-xl p-1 border border-black/5">
                            <button 
                                type="button" 
                                onClick={() => setNewType('percentage')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newType === 'percentage' ? 'bg-[#1F1F1F] text-white shadow-sm' : 'text-gray-400'}`}
                            >
                                % Percent
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setNewType('fixed')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newType === 'fixed' ? 'bg-[#1F1F1F] text-white shadow-sm' : 'text-gray-400'}`}
                            >
                                € Fixed
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Value</label>
                        <div className="relative">
                            {newType === 'fixed' ? (
                                <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            ) : (
                                <Percent size={14} className="absolute left-3 top-3.5 text-gray-400" />
                            )}
                            <input 
                                type="number" 
                                placeholder={newType === 'percentage' ? "10" : "20"} 
                                value={newValue}
                                onChange={e => setNewValue(e.target.value)}
                                className="w-full bg-gray-50 border border-black/5 rounded-xl pl-9 pr-4 py-3 font-bold focus:border-[#C9A24D] outline-none"
                                required
                            />
                        </div>
                    </div>
                  </div>
                </div>

                {/* THE BULLETPROOF SETTINGS */}
                <div className="bg-[#F6EFE6] p-4 rounded-xl border border-[#C9A24D]/20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Min Spend */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#C9A24D] uppercase flex items-center gap-1">
                            <ShoppingBag size={12}/> Min Order Value (€)
                        </label>
                        <input 
                            type="number" 
                            placeholder="0 (None)" 
                            value={minOrder}
                            onChange={e => setMinOrder(e.target.value)}
                            className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm font-bold focus:border-[#C9A24D] outline-none"
                        />
                        <p className="text-[9px] text-gray-400">Cart must be above this amount.</p>
                    </div>

                    {/* Usage Limit */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#C9A24D] uppercase flex items-center gap-1">
                            <Users size={12}/> Max Usage Limit
                        </label>
                        <input 
                            type="number" 
                            placeholder="Unlimited" 
                            value={maxUses}
                            onChange={e => setMaxUses(e.target.value)}
                            className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm font-bold focus:border-[#C9A24D] outline-none"
                        />
                        <p className="text-[9px] text-gray-400">Total times this code can be used.</p>
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#C9A24D] uppercase flex items-center gap-1">
                            <Calendar size={12}/> Expiry Date
                        </label>
                        <input 
                            type="date" 
                            value={expiryDate}
                            onChange={e => setExpiryDate(e.target.value)}
                            className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm font-bold focus:border-[#C9A24D] outline-none text-[#1F1F1F]"
                        />
                        <p className="text-[9px] text-gray-400">Code stops working after this date.</p>
                    </div>
                </div>

                <button className="w-full bg-[#1F1F1F] text-white py-4 rounded-xl font-bold hover:bg-[#C9A24D] transition-colors flex items-center justify-center gap-2">
                    <Save size={18} /> Create Code
                </button>
              </form>
            </div>
          )}

          {/* LIST VIEW */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
          ) : codes.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-black/10">
                <Tag size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold">No discount codes active.</p>
            </div>
          ) : (
            <div className="space-y-4">
                {codes.map((code) => {
                    const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
                    const isFullyUsed = code.max_uses !== null && code.current_uses >= code.max_uses;
                    const isValid = code.is_active && !isExpired && !isFullyUsed;

                    return (
                        <div key={code.id} className={`bg-white p-5 rounded-2xl border transition-all flex items-center justify-between ${isValid ? 'border-black/5 shadow-sm' : 'border-red-100 opacity-60'}`}>
                            
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black ${isValid ? 'bg-[#F6EFE6] text-[#C9A24D]' : 'bg-gray-100 text-gray-400'}`}>
                                    {code.discount_type === 'percentage' ? '%' : '€'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#1F1F1F] flex items-center gap-3">
                                        {code.code}
                                        {!isValid && <span className="text-[9px] bg-red-100 text-red-500 px-2 py-0.5 rounded uppercase">Inactive</span>}
                                        {isValid && <span className="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase">Active</span>}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-medium">
                                        <span>
                                            <span className="text-[#1F1F1F] font-bold">
                                                {code.discount_type === 'percentage' ? `${code.value}%` : `€${code.value}`} OFF
                                            </span>
                                        </span>
                                        {code.min_order_value > 0 && (
                                            <span className="flex items-center gap-1"><ShoppingBag size={10}/> Min €{code.min_order_value}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users size={10}/> Used: <span className={isFullyUsed ? "text-red-500 font-bold" : ""}>{code.current_uses}</span> 
                                            {code.max_uses ? ` / ${code.max_uses}` : " (∞)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4">
                                    <p className="text-[10px] font-bold uppercase text-gray-400">Expires</p>
                                    <p className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-[#1F1F1F]'}`}>
                                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "Never"}
                                    </p>
                                </div>

                                <button 
                                    onClick={() => toggleStatus(code.id, code.is_active)}
                                    className={`transition-colors ${code.is_active ? 'text-green-600' : 'text-gray-300'}`}
                                    title="Toggle Status"
                                >
                                    {code.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </button>

                                <button 
                                    onClick={() => handleDelete(code.id)}
                                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                    title="Delete Code"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}