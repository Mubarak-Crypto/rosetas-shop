"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Save, X, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import { supabase } from "../../../../../lib/supabase";

type Variant = { name: string; values: string; };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams(); // Get ID from URL
  const productId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Glitter Roses");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  
  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantValues, setNewVariantValues] = useState("");

  // --- 1. LOAD DATA ON START ---
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        alert("Error loading product");
        router.push("/admin/products");
      } else if (data) {
        // Fill the form with existing data
        setName(data.name);
        setDescription(data.description || "");
        setPrice(data.price.toString());
        setCategory(data.category || "Glitter Roses");
        setStock(data.stock?.toString() || "0");
        setStatus(data.status || "active");
        setImages(data.images || []);
        setVariants(data.variants || []);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // Fake Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImages([...images, imageUrl]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!newVariantName || !newVariantValues) return;
    setVariants([...variants, { name: newVariantName, values: newVariantValues }]);
    setNewVariantName("");
    setNewVariantValues("");
    setIsAddingVariant(false);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // --- 2. UPDATE FUNCTION ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        status,
        images,
        variants
      })
      .eq('id', productId); // IMPORTANT: Update ONLY this product

    if (error) {
      alert("Error updating: " + error.message);
    } else {
      alert("Product updated successfully!");
      router.push("/admin/products");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-purple" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <form onSubmit={handleUpdate} className="max-w-5xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/products" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <p className="text-gray-400 text-sm">Update bouquet details.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/products" className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all">
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-neon-purple text-white text-sm font-bold hover:bg-purple-600 transition-all flex items-center gap-2 shadow-glow-purple disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">Product Details</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors text-gray-300">
                      <option>Glitter Roses</option>
                      <option>Galaxy Collection</option>
                      <option>Royal Edition</option>
                      <option>Bridal</option>
                      <option>Digital Course</option>
                    </select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors text-gray-300">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="low">Low Stock</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors resize-none"></textarea>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">Pricing & Inventory</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Price (€)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock Qty</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Product Images</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all flex flex-col items-center justify-center cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Upload size={18} className="text-gray-400 group-hover:text-neon-purple" /></div>
                    <span className="text-xs text-gray-500 font-bold uppercase">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Options</h3>
                <div className="space-y-3 mb-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase block">{v.name}</span>
                        <span className="text-sm text-white">{v.values}</span>
                      </div>
                      <button type="button" onClick={() => removeVariant(idx)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                {isAddingVariant ? (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <input type="text" placeholder="e.g. Color" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 focus:border-neon-purple outline-none" />
                    </div>
                    <div>
                      <input type="text" placeholder="Red, Blue" value={newVariantValues} onChange={(e) => setNewVariantValues(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 focus:border-neon-purple outline-none" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={handleAddVariant} className="flex-1 bg-neon-purple text-white text-xs font-bold py-2 rounded-lg">Add</button>
                      <button type="button" onClick={() => setIsAddingVariant(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingVariant(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 text-sm font-bold hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2">
                    <Plus size={16} /> Add Options
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}