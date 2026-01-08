"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Upload, Save, X, Plus, Trash2, DollarSign, Loader2, Crop, Image as ImageIcon, ChevronDown, ArrowRight, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import { supabase } from "../../../../lib/supabase";

// TYPES
type Variant = { name: string; values: string; };
type Extra = { name: string; price: number; image?: string }; // ✨ Added image prop
type Area = { x: number; y: number; width: number; height: number; };

// Helper: which type of image are we cropping?
type UploadType = "product" | "extra"; 

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // --- STATE VARIABLES ---
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(""); 
  const [isCustomCategory, setIsCustomCategory] = useState(false); // ✨ NEW: Toggle for manual entry
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
  const [newExtraImage, setNewExtraImage] = useState(""); // ✨ Temp state for extra image

  // --- CROPPER STATE ---
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>("product"); // ✨ Track what we are uploading
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 1. SELECT IMAGE (Don't upload yet, just show cropper)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: UploadType = "product") => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadType(type); // Set type so we know where to save it later
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

  // 2. HELPER: CREATE CROPPED IMAGE
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

  // 3. UPLOAD THE CROPPED RESULT
  const handleUploadCroppedImage = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    setIsUploading(true);

    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      
      // Create filename
      const prefix = uploadType === "extra" ? "extra-" : "prod-";
      const fileName = `${prefix}${Date.now()}.jpg`; // Simplified filename to avoid issues
      const filePath = `${fileName}`; 

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // ✨ DECIDE WHERE TO PUT THE URL BASED ON TYPE
      if (uploadType === "product") {
          setImages([...images, publicUrl]);
      } else {
          setNewExtraImage(publicUrl); // Save to the extra we are building
      }

      setCropImage(null); // Close Cropper
      setZoom(1);

    } catch (e: any) {
      alert("Error uploading image: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ✨ NEW: REORDER IMAGES (Added to keep the same structure)
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
    setExtras([...extras, { 
        name: newExtraName, 
        price: parseFloat(newExtraPrice),
        image: newExtraImage // ✨ Save the image URL with the extra
    }]);
    
    // Reset Form
    setNewExtraName("");
    setNewExtraPrice("");
    setNewExtraImage(""); 
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

    if (!name || !price || !category) {
      alert("Please fill in Name, Price, and Category.");
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
          category: category.trim(),
          stock: finalStock,
          status,
          images,
          variants,
          extras // This now includes images!
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

  const colorLabels = getColorLabels();

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
            <button type="submit" disabled={isLoading || isUploading} className="px-6 py-3 rounded-xl bg-neon-rose text-white text-sm font-bold hover:bg-[#D8C3A5] transition-all flex items-center gap-2 shadow-glow-rose disabled:opacity-50">
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
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* ✨ START CATEGORY STEP 1 UPDATE */}
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
                          className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors"
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
                  {/* ✨ END CATEGORY STEP 1 UPDATE */}
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock Status</label>
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
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* IMAGES (Main Product) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Images</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative space-y-2 group">
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
                        <img src={img} className="w-full h-full object-cover" />
                        
                        {/* REORDER CONTROLS INSTEAD OF JUST REMOVE */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="p-1 hover:text-neon-rose disabled:opacity-30"><ArrowLeftIcon size={14}/></button>
                          <button type="button" onClick={() => removeImage(idx)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                          <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === images.length - 1} className="p-1 hover:text-neon-rose disabled:opacity-30"><ArrowRight size={14}/></button>
                        </div>
                      </div>

                      {/* Mapping Label Added */}
                      <div className="bg-white/5 rounded px-2 py-1 border border-white/5 text-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block leading-tight">Pos {idx + 1}</span>
                        <span className="text-[10px] font-bold text-neon-rose uppercase truncate block">
                          {colorLabels[idx] || "Extra"}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* UPLOAD BUTTON (Main) */}
                  <label className={`aspect-[4/5] rounded-lg border-2 border-dashed border-white/10 hover:border-neon-rose/50 cursor-pointer flex items-center justify-center relative ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading && uploadType === 'product' ? (
                      <Loader2 className="animate-spin text-neon-rose" size={24} />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Upload size={24} />
                        <span className="text-[10px]">Add Photo</span>
                      </div>
                    )}
                    {/* Note: Pass 'product' as type */}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'product')} disabled={isUploading} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {isUploading ? "Uploading..." : "Tip: Images are automatically cropped to 4:5 Portrait mode."}
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
                      <button type="button" onClick={handleAddVariant} className="flex-1 bg-neon-rose text-xs font-bold py-2 rounded-lg text-black">Add</button>
                      <button type="button" onClick={() => setIsAddingVariant(false)} className="flex-1 bg-white/10 text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingVariant(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-xs font-bold hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Option
                  </button>
                )}
              </div>

              {/* EXTRAS (With Image Support) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Upsells / Extras</h3>
                <div className="space-y-3 mb-4">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        {/* Show tiny preview if image exists */}
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
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Name Input */}
                    <div><input type="text" placeholder="Name (e.g. Crown)" value={newExtraName} onChange={(e) => setNewExtraName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-neon-rose outline-none" /></div>
                    
                    {/* Price Input */}
                    <div className="relative"><DollarSign size={14} className="absolute left-3 top-2.5 text-gray-500" /><input type="number" placeholder="Price (e.g. 15)" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:border-neon-rose outline-none" /></div>
                    
                    {/* ✨ EXTRA IMAGE UPLOADER */}
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

                    <div className="flex gap-2 pt-1"><button type="button" onClick={handleAddExtra} className="flex-1 bg-green-500/80 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-500">Add</button><button type="button" onClick={() => setIsAddingExtra(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-lg">Cancel</button></div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingExtra(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-green-400/80 text-xs font-bold hover:text-green-400 hover:border-green-400/50 transition-colors flex items-center justify-center gap-2"><Plus size={14} /> Add Upsell</button>
                )}
              </div>

            </div>
          </div>
        </form>

        {/* ✨ CROPPER MODAL (Pop up when ANY image is selected) */}
        {cropImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg h-[60vh] bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                // ✨ If it's an Extra, use 1:1 Square. If Product, use 4:5.
                aspect={uploadType === "extra" ? 1 : 4 / 5} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="w-full max-w-lg mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold">Zoom</span>
                  <input 
                    type="range" 
                    value={zoom} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onChange={(e) => setZoom(Number(e.target.value))} 
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-rose" 
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setCropImage(null)} 
                    className="flex-1 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUploadCroppedImage} 
                    disabled={isUploading}
                    className="flex-1 py-3 bg-neon-rose text-black rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <><Crop size={18} /> Crop & Upload</>}
                  </button>
                </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}