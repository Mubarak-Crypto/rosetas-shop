"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Save, X, Plus, Trash2, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import { supabase } from "../../../../lib/supabase";

// TYPES
type Variant = { name: string; values: string; };
type Extra = { name: string; price: number; };

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // <--- New State for loading bar
  
  // --- STATE VARIABLES ---
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Glitter Roses");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantValues, setNewVariantValues] = useState("");

  const [extras, setExtras] = useState<Extra[]>([]);
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");

  // --- NEW: REAL IMAGE UPLOAD FUNCTION ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    setIsUploading(true);
    const file = e.target.files[0];
    
    // 1. Create a unique filename (e.g., "rose-123456789.jpg")
    const fileExt = file.name.split('.').pop();
    const fileName = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('products') // Bucket Name
      .upload(filePath, file);

    if (uploadError) {
      alert("Error uploading image: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    // 3. Get the Public URL (The permanent link)
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    // 4. Save that URL to our list
    setImages([...images, publicUrl]);
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // --- LOGIC: VARIANTS ---
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

  // --- LOGIC: EXTRAS ---
  const handleAddExtra = () => {
    if (!newExtraName || !newExtraPrice) return;
    setExtras([...extras, { name: newExtraName, price: parseFloat(newExtraPrice) }]);
    setNewExtraName("");
    setNewExtraPrice("");
    setIsAddingExtra(false);
  };
  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  // --- SAVE FUNCTION ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalPrice = parseFloat(price);
    const finalStock = parseInt(stock) || 0;

    if (!name || !price) {
      alert("Please fill in at least the Name and Price.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('products')
      .insert([
        { 
          name, 
          description,
          price: finalPrice,
          category,
          stock: finalStock,
          status,
          images, // This now contains REAL Supabase URLs
          variants,
          extras
        }
      ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Product Published Successfully!");
      router.push("/admin/products");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <form onSubmit={handleSave} className="max-w-5xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/products" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"><ArrowLeft size={20} /></Link>
              <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>
            <button type="submit" disabled={isLoading || isUploading} className="px-6 py-3 rounded-xl bg-neon-purple text-white text-sm font-bold hover:bg-purple-600 transition-all flex items-center gap-2 shadow-glow-purple disabled:opacity-50">
              <Save size={18} /> {isLoading ? "Saving..." : "Publish Product"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
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
                    </select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors text-gray-300">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors resize-none"></textarea>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Price (€)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-purple outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* IMAGES */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Images</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                    </div>
                  ))}
                  
                  {/* UPLOAD BUTTON */}
                  <label className={`aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-neon-purple/50 cursor-pointer flex items-center justify-center relative ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="animate-spin text-neon-purple" size={24} />
                    ) : (
                      <Upload size={18} className="text-gray-400" />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {isUploading ? "Uploading to Cloud..." : "Images are saved securely to Supabase."}
                </p>
              </div>

              {/* OPTIONS (VARIANTS) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Options</h3>
                <p className="text-xs text-gray-400 mb-4">Colors, Sizes (No price change)</p>
                <div className="space-y-3 mb-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                      <div><span className="text-xs font-bold text-gray-500 block">{v.name}</span><span className="text-sm text-white">{v.values}</span></div>
                      <button type="button" onClick={() => removeVariant(idx)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                {isAddingVariant ? (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                    <input type="text" placeholder="Name (e.g. Color)" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                    <input type="text" placeholder="Values (Red, Blue)" value={newVariantValues} onChange={(e) => setNewVariantValues(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleAddVariant} className="flex-1 bg-neon-purple text-xs font-bold py-2 rounded-lg">Add</button>
                      <button type="button" onClick={() => setIsAddingVariant(false)} className="flex-1 bg-white/10 text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingVariant(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-xs font-bold hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Option
                  </button>
                )}
              </div>

              {/* EXTRAS */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Upsells / Extras</h3>
                <div className="space-y-3 mb-4">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2"><span className="text-sm text-white font-medium">{ex.name}</span><span className="text-xs text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded">+€{ex.price}</span></div>
                      <button type="button" onClick={() => removeExtra(idx)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                {isAddingExtra ? (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div><input type="text" placeholder="Name (e.g. Crown)" value={newExtraName} onChange={(e) => setNewExtraName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-neon-purple outline-none" /></div>
                    <div className="relative"><DollarSign size={14} className="absolute left-3 top-2.5 text-gray-500" /><input type="number" placeholder="Price (e.g. 15)" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:border-neon-purple outline-none" /></div>
                    <div className="flex gap-2 pt-1"><button type="button" onClick={handleAddExtra} className="flex-1 bg-green-500/80 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-500">Add</button><button type="button" onClick={() => setIsAddingExtra(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-lg">Cancel</button></div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingExtra(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-green-400/80 text-xs font-bold hover:text-green-400 hover:border-green-400/50 transition-colors flex items-center justify-center gap-2"><Plus size={14} /> Add Upsell</button>
                )}
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}