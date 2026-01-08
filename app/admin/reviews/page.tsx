"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✨ Added for data revalidation
import { motion } from "framer-motion"; 
import { supabase } from "../../../lib/supabase";
import { Star, Save, Plus, Instagram, MessageCircle, Trash2, CheckCircle, Loader2 } from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";

export default function AdminReviewsPage() {
  const router = useRouter(); // ✨ Initialize router
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Review Form State
  const [formData, setFormData] = useState({
    product_id: "",
    customer_name: "",
    rating: 5,
    comment: "",
    is_verified: true,
    source: "whatsapp"
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    const { data: pData } = await supabase.from('products').select('id, name').eq('status', 'active');
    const { data: rData } = await supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false });
    
    if (pData) setProducts(pData);
    if (rData) setReviews(rData);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([formData]);
    
    if (error) {
      alert("Error saving review: " + error.message);
    } else {
      setIsAdding(false);
      setFormData({ product_id: "", customer_name: "", rating: 5, comment: "", is_verified: true, source: "whatsapp" });
      await fetchInitialData();
      router.refresh(); // ✨ Force Product Pages to update their review lists
    }
  };

  // ✨ UPDATED: Robust delete logic that refreshes the whole site cache
  const deleteReview = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    // Save current state in case we need to revert
    const previousReviews = [...reviews];

    try {
      // 1. Instantly remove from UI for a fast feel
      setReviews(reviews.filter(r => r.id !== id));

      // 2. Delete from Database
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      
      if (error) {
        throw error;
      }

      // 3. Sync with the rest of the app (Ensures it's gone from Product Page too)
      router.refresh(); 

    } catch (error: any) {
      alert("Error deleting review: " + error.message);
      setReviews(previousReviews); // Put it back in the list if the database call failed
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F6EFE6]">
        <AdminSidebar /> 
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C9A24D]" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6EFE6]">
      <AdminSidebar /> 

      <main className="flex-1 p-8 md:p-12 overflow-y-auto text-[#1F1F1F]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Review Manager</h1>
              <p className="opacity-50 font-bold uppercase text-xs tracking-widest mt-2">Manage customer feedback & imports</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-[#1F1F1F] text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold hover:scale-105 transition-transform shadow-lg"
            >
              {isAdding ? "Close Form" : <><Plus size={20} /> Import New Review</>}
            </button>
          </div>

          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit} 
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl mb-16 space-y-8 border border-black/5 max-w-3xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Assign to Product</label>
                  <select 
                    required
                    className="w-full bg-[#F6EFE6] p-4 rounded-2xl outline-none font-bold border-none"
                    value={formData.product_id}
                    onChange={e => setFormData({...formData, product_id: e.target.value})}
                  >
                    <option value="">Select Bouquet...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Customer Name</label>
                  <input 
                    type="text" required
                    className="w-full bg-[#F6EFE6] p-4 rounded-2xl outline-none font-bold"
                    placeholder="e.g. Sarah M."
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Review Content</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-[#F6EFE6] p-4 rounded-2xl outline-none font-medium leading-relaxed"
                  placeholder="Paste the message from WhatsApp or Instagram here..."
                  value={formData.comment}
                  onChange={e => setFormData({...formData, comment: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-3 block">Star Rating</label>
                  <div className="flex gap-2 text-[#C9A24D] bg-[#F6EFE6] p-3 rounded-2xl w-fit">
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setFormData({...formData, rating: star})}>
                        <Star size={20} fill={formData.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-3 block">Review Source</label>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, source: 'whatsapp'})}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.source === 'whatsapp' ? 'bg-green-50 border-green-500' : 'bg-white border-black/5 opacity-40'}`}
                    >
                      <MessageCircle size={24} className="text-green-600" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, source: 'instagram'})}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.source === 'instagram' ? 'bg-pink-50 border-pink-500' : 'bg-white border-black/5 opacity-40'}`}
                    >
                      <Instagram size={24} className="text-pink-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#F6EFE6] p-4 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, is_verified: !formData.is_verified})}>
                  <CheckCircle size={20} className={formData.is_verified ? "text-green-600" : "text-gray-300"} />
                  <span className="text-xs font-bold uppercase tracking-wider">Verified Buyer</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#C9A24D] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3">
                <Save size={20} /> Publish Review
              </button>
            </motion.form>
          )}

          <div className="grid grid-cols-1 gap-6">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="bg-white p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl">{review.customer_name}</span>
                    <div className="flex items-center gap-2 bg-[#F6EFE6] px-3 py-1 rounded-lg">
                       {review.source === 'whatsapp' ? <MessageCircle size={12} className="text-green-600" /> : <Instagram size={12} className="text-pink-600" />}
                       <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">{review.source}</span>
                    </div>
                    {review.is_verified && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-black uppercase">Verified</span>}
                  </div>
                  <p className="text-[#1F1F1F] font-medium opacity-80 leading-relaxed italic">"{review.comment}"</p>
                  <p className="text-[10px] font-black text-[#C9A24D] uppercase tracking-widest">Linked to: {review.products?.name}</p>
                </div>
                
                <div className="flex items-center gap-8 self-end md:self-center">
                  <div className="flex text-[#C9A24D]">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <button 
                    onClick={(e) => deleteReview(e, review.id)} 
                    className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-black/5">
                <p className="text-black/20 font-black uppercase tracking-widest">No reviews found in database</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}