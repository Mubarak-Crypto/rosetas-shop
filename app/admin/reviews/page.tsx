"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { motion } from "framer-motion"; 
import { supabase } from "../../../lib/supabase";
import { Star, Save, Plus, Instagram, MessageCircle, Trash2, CheckCircle, Loader2, Check, ShoppingBag, Upload, X, Image as ImageIcon } from "lucide-react"; // ✨ Added new icons
import AdminSidebar from "../../../components/admin/AdminSidebar";

export default function AdminReviewsPage() {
  const router = useRouter(); 
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // ✨ NEW: Uploading State
  const [isUploading, setIsUploading] = useState(false);

  // New Review Form State
  const [formData, setFormData] = useState({
    product_id: "",
    customer_name: "",
    rating: 5,
    comment: "",
    is_verified: true,
    source: "whatsapp",
    status: "approved",
    image_url: "" // ✨ Added image_url to state
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

  // ✨ NEW: Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const fileName = `review-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `${fileName}`;

      // Upload to 'products' bucket (reusing existing bucket for simplicity)
      const { error: uploadError } = await supabase.storage
        .from('products') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([formData]);
    
    if (error) {
      alert("Error saving review: " + error.message);
    } else {
      setIsAdding(false);
      setFormData({ product_id: "", customer_name: "", rating: 5, comment: "", is_verified: true, source: "whatsapp", status: "approved", image_url: "" });
      await fetchInitialData();
      router.refresh(); 
    }
  };

  const approveReview = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      alert("Error approving review: " + error.message);
    } else {
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      router.refresh();
    }
  };

  const deleteReview = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    const previousReviews = [...reviews];

    try {
      setReviews(reviews.filter(r => r.id !== id));
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      router.refresh(); 

    } catch (error: any) {
      alert("Error deleting review: " + error.message);
      setReviews(previousReviews); 
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

              {/* ✨ IMAGE UPLOAD SECTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Review Photo (Optional)</label>
                <div className="flex items-center gap-4">
                    {formData.image_url ? (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-black/10 group">
                            <img src={formData.image_url} alt="Review" className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, image_url: ""})}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>
                    ) : (
                        <label className={`w-20 h-20 rounded-2xl bg-[#F6EFE6] border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A24D] transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                            {isUploading ? <Loader2 size={20} className="animate-spin text-[#C9A24D]" /> : <Upload size={20} className="text-[#1F1F1F]/40" />}
                            <span className="text-[8px] font-bold text-[#1F1F1F]/40 uppercase mt-1">Upload</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                    )}
                    <p className="text-xs text-[#1F1F1F]/40 font-medium italic">Add a photo to make the review look more authentic.</p>
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
                  <div className="flex gap-2">
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
                    {/* ✨ NEW: Shop/Website Button */}
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, source: 'website'})}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.source === 'website' ? 'bg-blue-50 border-blue-500' : 'bg-white border-black/5 opacity-40'}`}
                    >
                      <ShoppingBag size={24} className="text-blue-600" />
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
              <div key={review.id} className={`bg-white p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border shadow-sm hover:shadow-md transition-shadow ${review.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-black/5'}`}>
                <div className="flex gap-6 items-start">
                    {/* ✨ REVIEW IMAGE PREVIEW */}
                    {review.image_url ? (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-black/5 flex-shrink-0">
                            <img src={review.image_url} alt="Customer" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-[#F6EFE6] flex items-center justify-center border border-black/5 flex-shrink-0">
                            <ImageIcon size={24} className="text-[#1F1F1F]/20" />
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-xl">{review.customer_name}</span>
                            <div className="flex items-center gap-2 bg-[#F6EFE6] px-3 py-1 rounded-lg">
                                {review.source === 'whatsapp' && <MessageCircle size={12} className="text-green-600" />}
                                {review.source === 'instagram' && <Instagram size={12} className="text-pink-600" />}
                                {review.source === 'website' && <ShoppingBag size={12} className="text-blue-600" />}
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">{review.source === 'website' ? 'Shop' : review.source}</span>
                            </div>
                            {review.is_verified && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded font-black uppercase">Verified</span>}
                            {review.status === 'pending' && <span className="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">Pending Approval</span>}
                        </div>
                        <p className="text-[#1F1F1F] font-medium opacity-80 leading-relaxed italic">"{review.comment}"</p>
                        <p className="text-[10px] font-black text-[#C9A24D] uppercase tracking-widest">Linked to: {review.products?.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="flex text-[#C9A24D]">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' && (
                      <button 
                        onClick={() => approveReview(review.id)}
                        className="h-12 px-6 rounded-full bg-green-600 text-white flex items-center gap-2 font-bold hover:bg-green-700 transition-all shadow-sm"
                      >
                        <Check size={18} strokeWidth={3} /> Approve
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => deleteReview(e, review.id)} 
                      className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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