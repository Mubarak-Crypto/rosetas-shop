"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, Save, X, Plus, Trash2, Loader2, Crop, DollarSign, Image as ImageIcon, ChevronDown, ArrowRight, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Cropper from "react-easy-crop";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import { supabase } from "../../../../../lib/supabase";

// TYPES
type Variant = { name: string; values: string; };
type Extra = { name: string; price: number; image?: string }; // ✨ Added image
type Area = { x: number; y: number; width: number; height: number; };
type UploadType = "product" | "extra"; // ✨ Track upload type

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(""); 
  const [isCustomCategory, setIsCustomCategory] = useState(false); // ✨ NEW: Toggle for manual entry
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  
  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantValues, setNewVariantValues] = useState("");

  // Extras
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newExtraImage, setNewExtraImage] = useState(""); // ✨ New Extra Image State

  // --- CROPPER STATE ---
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>("product"); // ✨ Track what we crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // --- 1. LOAD DATA ---
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
        setName(data.name);
        setDescription(data.description || "");
        setPrice(data.price.toString());
        setCategory(data.category || "");
        setStock(data.stock?.toString() || "0");
        setStatus(data.status || "active");
        setImages(data.images || []);
        setVariants(data.variants || []);
        setExtras(data.extras || []);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // --- 2. IMAGE LOGIC (CROPPER) ---
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: UploadType = "product") => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadType(type); // Set type
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImage(reader.result as string);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("No 2d context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Canvas is empty"));
        resolve(blob as Blob);
      }, "image/jpeg", 0.95);
    });
  };

  const handleUploadCroppedImage = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    setIsUploading(true);

    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const prefix = uploadType === "extra" ? "extra-" : "prod-";
      const fileName = `${prefix}${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      // ✨ Route image to correct place
      if (uploadType === "product") {
          setImages([...images, publicUrl]);
      } else {
          setNewExtraImage(publicUrl);
      }

      setCropImage(null);
      setZoom(1);

    } catch (e: any) {
      alert("Error uploading: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ✨ NEW: REORDER LOGIC (Maintain exact order for frontend mapping)
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  // Helper to get labels from the variant "Values" box
  const getColorLabels = () => {
    const colorVariant = variants.find(v => v.name.toLowerCase() === 'color' || v.name.toLowerCase() === 'farbe');
    if (!colorVariant) return [];
    return colorVariant.values.split(',').map(v => v.trim());
  };

  // --- VARIANTS & EXTRAS ---
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

  const handleAddExtra = () => {
    if (!newExtraName || !newExtraPrice) return;
    setExtras([...extras, { 
        name: newExtraName, 
        price: parseFloat(newExtraPrice),
        image: newExtraImage // ✨ Save Image
    }]);
    
    // Reset
    setNewExtraName("");
    setNewExtraPrice("");
    setNewExtraImage("");
    setIsAddingExtra(false);
  };
  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  // --- 3. SAVE UPDATE ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price),
        category: category.trim(),
        stock: parseInt(stock) || 0,
        status,
        images,
        variants,
        extras // Save Extras (includes images now)
      })
      .eq('id', productId);

    if (error) {
      alert("Error updating: " + error.message);
    } else {
      alert("Product updated successfully!");
      router.push("/admin/products");
    }
    setIsSaving(false);
  };

  const colorLabels = getColorLabels();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-rose" size={48} />
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
                <p className="text-gray-400 text-sm">Update product details.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/products" className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all">
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-neon-rose text-white text-sm font-bold hover:bg-[#D8C3A5] transition-all flex items-center gap-2 shadow-glow-rose disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">Product Details</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {/* ✨ UPDATED CATEGORY SECTION STEP 1 */}
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)} 
                          placeholder="Enter new category name..." 
                          className="w-full bg-black/20 border border-neon-rose/50 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors text-white" 
                          autoFocus
                        />
                        <button 
                          type="button" 
                          onClick={() => { setIsCustomCategory(false); setCategory(""); }}
                          className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <select 
                          value={category} 
                          onChange={(e) => {
                            if (e.target.value === "NEW") {
                              setIsCustomCategory(true);
                              setCategory("");
                            } else {
                              setCategory(e.target.value);
                            }
                          }} 
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors appearance-none text-white cursor-pointer"
                        >
                          <option value="" disabled>Select a Collection...</option>
                          <option value="Glitter Roses">Glitter Roses</option>
                          <option value="Soap Roses">Soap Roses</option>
                          <option value="Rose Baskets">Rose Baskets</option>
                          <option value="Mito Gift Baskets">Mito Gift Baskets</option>
                          <option value="Plush Bouquets">Plush Bouquets</option>
                          <option value="Make-up Bouquets">Make-up Bouquets</option>
                          <option value="NEW" className="text-neon-rose font-bold">+ Create New Category...</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                      </div>
                    )}
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors text-gray-300">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors resize-none"></textarea>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Price (€)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock Qty</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              {/* IMAGES (WITH REORDERING SUPPORT) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Images</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative space-y-2 group">
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        
                        {/* REORDER OVERLAY */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="p-1 hover:text-neon-rose disabled:opacity-30"><ArrowLeftIcon size={14}/></button>
                          <button type="button" onClick={() => removeImage(idx)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                          <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === images.length - 1} className="p-1 hover:text-neon-rose disabled:opacity-30"><ArrowRight size={14}/></button>
                        </div>
                      </div>
                      
                      {/* Mapping Label */}
                      <div className="bg-white/5 rounded px-2 py-1 border border-white/5 text-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter block leading-tight">Position {idx + 1}</span>
                        <span className="text-[10px] font-bold text-neon-rose uppercase truncate block">
                          {colorLabels[idx] || "Extra Photo"}
                        </span>
                      </div>
                    </div>
                  ))}
                  <label className="aspect-[4/5] rounded-lg border-2 border-dashed border-white/10 hover:border-neon-rose/50 hover:bg-neon-rose/5 transition-all flex flex-col items-center justify-center cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      {isUploading && uploadType === 'product' ? <Loader2 className="animate-spin text-neon-rose" /> : <Upload size={18} className="text-gray-400 group-hover:text-neon-rose" />}
                    </div>
                    <span className="text-xs text-gray-500 font-bold uppercase">{isUploading && uploadType === 'product' ? "Uploading..." : "Add Photo"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'product')} disabled={isUploading} />
                  </label>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Options</h3>
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
                    <input type="text" placeholder="e.g. Color" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                    <input type="text" placeholder="Red, Blue" value={newVariantValues} onChange={(e) => setNewVariantValues(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                    <div className="flex gap-2"><button type="button" onClick={handleAddVariant} className="flex-1 bg-neon-rose text-white text-xs font-bold py-2 rounded-lg">Add</button><button type="button" onClick={() => setIsAddingVariant(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-lg">Cancel</button></div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingVariant(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 text-sm font-bold hover:text-white transition-colors flex items-center justify-center gap-2"><Plus size={16} /> Add Options</button>
                )}
              </div>

              {/* EXTRAS (With Images!) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Upsells / Extras</h3>
                <div className="space-y-3 mb-4">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                         {/* Thumbnail */}
                        {ex.image ? (
                            <img src={ex.image} className="w-8 h-8 rounded object-cover border border-white/10" />
                        ) : (
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center"><ImageIcon size={12} className="text-gray-600"/></div>
                        )}
                        <div>
                            <span className="text-sm text-white font-medium block">{ex.name}</span>
                            <span className="text-xs text-neon-rose bg-neon-rose/10 px-2 py-0.5 rounded">+€{ex.price}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeExtra(idx)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                {isAddingExtra ? (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                    {/* Name */}
                    <input type="text" placeholder="Name (e.g. Crown)" value={newExtraName} onChange={(e) => setNewExtraName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                    
                    {/* Price */}
                    <div className="relative"><DollarSign size={14} className="absolute left-3 top-2.5 text-gray-500" /><input type="number" placeholder="Price" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm" /></div>
                    
                    {/* ✨ IMAGE UPLOAD FOR EXTRA */}
                    <div className="flex items-center gap-3">
                        {newExtraImage ? (
                            <div className="relative w-12 h-12 rounded border border-white/20 overflow-hidden group">
                                <img src={newExtraImage} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setNewExtraImage("")} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={14} className="text-white" />
                                </button>
                            </div>
                        ) : (
                            <label className={`w-12 h-12 rounded border border-dashed border-white/20 flex items-center justify-center hover:border-neon-rose cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                                {isUploading && uploadType === 'extra' ? <Loader2 size={14} className="animate-spin text-neon-rose"/> : <Upload size={14} className="text-gray-400" />}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'extra')} disabled={isUploading} />
                            </label>
                        )}
                        <span className="text-[10px] text-gray-500">
                             {newExtraImage ? "Image Uploaded" : "Optional: Add photo"}
                        </span>
                    </div>

                    <div className="flex gap-2 pt-2"><button type="button" onClick={handleAddExtra} className="flex-1 bg-green-500/80 text-white text-xs font-bold py-2 rounded-lg">Add</button><button type="button" onClick={() => setIsAddingExtra(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-lg">Cancel</button></div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingExtra(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-green-400/80 text-xs font-bold hover:text-green-400 transition-colors flex items-center justify-center gap-2"><Plus size={14} /> Add Upsell</button>
                )}
              </div>

            </div>
          </div>
        </form>

        {/* CROPPER MODAL (Adapts to type) */}
        {cropImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg h-[60vh] bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={uploadType === "extra" ? 1 : 4 / 5} // ✨ Switch Aspect Ratio
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="w-full max-w-lg mt-6 space-y-4">
               <div className="flex items-center gap-4"><span className="text-xs font-bold">Zoom</span><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-rose" /></div>
               <div className="flex gap-4">
                 <button onClick={() => setCropImage(null)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors">Cancel</button>
                 <button onClick={handleUploadCroppedImage} disabled={isUploading} className="flex-1 py-3 bg-neon-rose text-black rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2">{isUploading ? <Loader2 className="animate-spin" /> : <><Crop size={18} /> Crop & Upload</>}</button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}