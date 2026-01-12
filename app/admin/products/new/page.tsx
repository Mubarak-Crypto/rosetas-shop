"use client";

import { useState, useCallback, useEffect } from "react"; // ✨ Added useEffect
import { ArrowLeft, Upload, Save, X, Plus, Trash2, DollarSign, Loader2, Crop, Image as ImageIcon, ChevronDown, ArrowRight, ArrowLeft as ArrowLeftIcon, Video, Globe, Bookmark, Info, LayoutGrid } from "lucide-react"; // ✨ Added Info & LayoutGrid icon
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
  const [isUploading, setIsUploading] = useState(false); // ✅ FIXED: Changed setter from setIsLoading to setIsUploading
  const [isUploadingVideo, setIsUploadingVideo] = useState(false); // ✨ NEW: Video upload state
  
  // --- STATE VARIABLES ---
  const [images, setImages] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]); // ✨ UPDATED: Now an array for multiple videos
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState(""); // ✨ NEW: English Name State
  const [category, setCategory] = useState(""); 
  const [isCustomCategory, setIsCustomCategory] = useState(false); // ✨ NEW: Toggle for manual entry
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState(""); // ✨ NEW: English Description State
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [needsRibbon, setNeedsRibbon] = useState(false); // ✨ NEW: Ribbon Toggle State

  const [variants, setVariants] = useState<Variant[]>([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantValues, setNewVariantValues] = useState("");
  // ✨ NEW: Helper states for building a variant list with stock
  const [tempValueName, setTempValueName] = useState("");
  const [tempValueStock, setTempValueStock] = useState("");
  const [tempList, setTempList] = useState<string[]>([]);

  // ✨ NEW: STOCK MATRIX STATE
  const [stockMatrix, setStockMatrix] = useState<any[]>([]);

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

  // ✨ NEW: AUTO-GENERATE MATRIX LOGIC
  useEffect(() => {
    if (variants.length > 1) {
      const generateMatrix = () => {
        const optionGroups = variants.map(v => ({
          name: v.name,
          values: v.values.split(',').map(val => val.split('(')[0].split('|')[0].trim())
        }));

        // Cartesian product to generate combinations
        const combos = optionGroups.reduce((a, b) => 
          a.flatMap((d: any) => b.values.map(v => ({ ...d, [b.name]: v })))
        , [{}]);

        const newMatrix = combos.map(combo => {
          const existing = stockMatrix.find(m => 
            Object.keys(combo).every(key => m[key] === combo[key])
          );
          return existing || { ...combo, stock: 0 };
        });

        setStockMatrix(newMatrix);
      };
      generateMatrix();
    }
  }, [variants]);

  // ✨ UPDATED: HANDLE MULTIPLE VIDEO UPLOADS
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingVideo(true);

    try {
      const fileName = `video-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // ✨ Append to the array instead of replacing
      setVideoUrls(prev => [...prev, publicUrl]);
    } catch (e: any) {
      alert("Error uploading video: " + e.message);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const removeVideo = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

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
    // Only return the part before the stock separator
    return colorVariant.values.split(',').map(v => v.split('|')[0].trim());
  };

  // --- LOGIC: VARIANTS ---
  const handleAddVariantItem = () => {
    if (!tempValueName) return;
    // Format: "Red | Stock: 5" or "Red (€50) | Stock: 5"
    const entry = `${tempValueName}${tempValueStock ? ` | Stock: ${tempValueStock}` : ''}`;
    setTempList([...tempList, entry]);
    setTempValueName("");
    setTempValueStock("");
  };

  const handleAddVariant = () => {
    if (!newVariantName || tempList.length === 0) return;
    setVariants([...variants, { name: newVariantName, values: tempList.join(', ') }]);
    setNewVariantName("");
    setTempList([]);
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
          name_en: nameEn, // ✨ Save English Name
          description,
          description_en: descriptionEn, // ✨ Save English Description
          price: finalPrice,
          category: category.trim(),
          stock: finalStock,
          status,
          images,
          video_url: videoUrls, // ✨ UPDATED: Now saves the array of URLs
          variants,
          extras, // This now includes images!
          needs_ribbon: needsRibbon, // ✨ NEW: Save the Ribbon requirement
          stock_matrix: stockMatrix // ✨ NEW: Save individual variant stock
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
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <form onSubmit={handleSave} className="max-w-5xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/products" className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-400 hover:text-[#1F1F1F]"><ArrowLeft size={20} /></Link>
              <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>
            <button type="submit" disabled={isLoading || isUploading || isUploadingVideo} className="px-6 py-3 rounded-xl bg-[#1F1F1F] text-white text-sm font-bold hover:bg-[#C9A24D] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50">
              <Save size={18} /> {isLoading ? "Saving..." : "Publish Product"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg mb-4">Product Details</h3>
                
                {/* ✨ BILINGUAL NAMES SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-gray-200 rounded-sm text-[8px] flex items-center justify-center text-gray-500">DE</span>
                      Product Name (German)
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#C9A24D] uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-[#C9A24D]/20 rounded-sm text-[8px] flex items-center justify-center text-[#C9A24D]">EN</span>
                      Product Name (English)
                    </label>
                    <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="English title..." className="w-full bg-gray-50 border border-[#C9A24D]/20 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)} 
                          placeholder="Enter new category name..." 
                          className="w-full bg-gray-50 border border-[#C9A24D]/50 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors text-[#1F1F1F]" 
                          autoFocus
                        />
                        <button 
                          type="button" 
                          onClick={() => { setIsCustomCategory(false); setCategory(""); }}
                          className="px-4 py-2 bg-black/5 rounded-xl text-xs font-bold hover:bg-black/10 transition-colors"
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
                          className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors appearance-none text-[#1F1F1F] cursor-pointer font-medium"
                        >
                          <option value="" disabled>Select a Collection...</option>
                          <option value="Glitter Roses">Glitter Roses</option>
                          <option value="Soap Roses">Soap Roses</option>
                          <option value="Rose Baskets">Rose Baskets</option>
                          <option value="Mito Gift Baskets">Mito Gift Baskets</option>
                          <option value="Plush Bouquets">Plush Bouquets</option>
                          <option value="Make-up Bouquets">Make-up Bouquets</option>
                          <option value="NEW" className="text-[#C9A24D] font-bold">+ Create New Category...</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                      </div>
                    )}
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Stock Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors text-[#1F1F1F] font-medium">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* ✨ BILINGUAL DESCRIPTIONS SECTION */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-gray-200 rounded-sm text-[8px] flex items-center justify-center text-gray-500">DE</span>
                      Description (German)
                    </label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#C9A24D] uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-[#C9A24D]/20 rounded-sm text-[8px] flex items-center justify-center text-[#C9A24D]">EN</span>
                      Description (English)
                    </label>
                    <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={4} placeholder="English description..." className="w-full bg-gray-50 border border-[#C9A24D]/20 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* ✨ NEW: PERSONALIZATION CONFIGURATION SECTION */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Bookmark className="text-[#C9A24D]" size={20} /> Personalization Mode
                </h3>
                <div className="p-4 bg-[#F6EFE6] rounded-xl border border-[#C9A24D]/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1F1F1F]">Require Mandatory Ribbon Text?</p>
                    <p className="text-[11px] text-[#1F1F1F]/50 mt-1 font-medium italic">If active, customers MUST enter text to add this bouquet to their cart.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNeedsRibbon(!needsRibbon)}
                    className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${needsRibbon ? 'bg-[#C9A24D] justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                  </button>
                </div>
              </div>

              {/* ✨ NEW: INDIVIDUAL STOCK MATRIX SECTION */}
              {variants.length > 1 && (
                <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="text-[#C9A24D]" size={20} />
                    <h3 className="font-bold text-lg">Individual Stock Tracking</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50">
                        <tr>
                          {variants.map(v => <th key={v.name} className="px-4 py-3">{v.name}</th>)}
                          <th className="px-4 py-3">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {stockMatrix.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            {variants.map(v => <td key={v.name} className="px-4 py-3 text-xs font-bold">{item[v.name]}</td>)}
                            <td className="px-4 py-2">
                              <input 
                                type="number" 
                                value={item.stock} 
                                onChange={(e) => {
                                  const updated = [...stockMatrix];
                                  updated[idx].stock = parseInt(e.target.value) || 0;
                                  setStockMatrix(updated);
                                }}
                                className="w-24 bg-gray-50 border border-black/5 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:border-[#C9A24D]"
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg mb-4">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Price (€)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Total Capacity</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* IMAGES (Main Product) */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Images</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative space-y-2 group">
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-black/5">
                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="p-1 text-white hover:text-[#C9A24D] disabled:opacity-30"><ArrowLeftIcon size={14}/></button>
                          <button type="button" onClick={() => removeImage(idx)} className="p-1 text-white hover:text-red-500"><Trash2 size={14} /></button>
                          <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === images.length - 1} className="p-1 text-white hover:text-[#C9A24D] disabled:opacity-30"><ArrowRight size={14}/></button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded px-2 py-1 border border-black/5 text-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block leading-tight">Pos {idx + 1}</span>
                        <span className="text-[10px] font-bold text-[#C9A24D] uppercase truncate block">
                          {colorLabels[idx] || "Extra"}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <label className={`aspect-[4/5] rounded-lg border-2 border-dashed border-black/10 hover:border-[#C9A24D]/50 cursor-pointer flex items-center justify-center relative ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="animate-spin text-[#C9A24D]" size={24} />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Upload size={24} />
                        <span className="text-[10px] font-bold uppercase">Add Photo</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'product')} disabled={isUploading} />
                  </label>
                </div>
                <p className="text-xs text-gray-400 italic">
                  {isUploading ? "Uploading..." : "Tip: Images are automatically cropped to 4:5 Portrait mode."}
                </p>
              </div>

              {/* ✨ UPDATED: MULTIPLE PRODUCT VIDEOS SECTION */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Product Videos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {videoUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-black/5 aspect-video bg-black group">
                      <video src={url} className="w-full h-full object-cover" muted loop autoPlay />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-widest">Video {idx + 1}</div>
                      <button 
                        type="button" 
                        onClick={() => removeVideo(idx)} 
                        className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <label className={`w-full aspect-video rounded-xl border-2 border-dashed border-black/10 hover:border-[#C9A24D]/50 cursor-pointer flex items-center justify-center relative ${isUploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploadingVideo ? (
                      <Loader2 className="animate-spin text-[#C9A24D]" size={24} />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Video size={24} />
                        <span className="text-[10px] font-bold uppercase">Add Video (MP4)</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={isUploadingVideo} />
                  </label>
                </div>
              </div>

              {/* OPTIONS (VARIANTS) */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2">Options</h3>
                <p className="text-xs text-gray-400 mb-4">Colors, Sizes (Track individual stock)</p>
                
                <div className="bg-[#F6EFE6] border border-[#C9A24D]/20 p-3 rounded-xl mb-4 flex items-start gap-3">
                  <Info size={16} className="text-[#C9A24D] mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold">Pricing Grid Guide:</p>
                    <p className="text-[9px] font-medium leading-relaxed">
                      Use format: <span className="bg-white px-1 font-bold italic rounded">50 Roses (€100)</span> to update shop price.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-black/5">
                      <div className="max-w-[80%]"><span className="text-xs font-bold text-gray-400 block uppercase">{v.name}</span><span className="text-xs text-[#1F1F1F] font-medium break-words leading-tight">{v.values}</span></div>
                      <button type="button" onClick={() => removeVariant(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>

                {isAddingVariant ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-3">
                    <input type="text" placeholder="Option Name (e.g. Color)" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D]" />
                    
                    <div className="space-y-2 bg-white/50 p-2 rounded-lg border border-black/5">
                        <div className="flex gap-2">
                           <input type="text" placeholder="Value (e.g. Red)" value={tempValueName} onChange={(e) => setTempValueName(e.target.value)} className="flex-[2] bg-white border border-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D]" />
                           <input type="number" placeholder="Stock" value={tempValueStock} onChange={(e) => setTempValueStock(e.target.value)} className="flex-1 bg-white border border-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D]" />
                           <button type="button" onClick={handleAddVariantItem} className="bg-[#C9A24D] text-white px-2 rounded-lg"><Plus size={16}/></button>
                        </div>
                        {tempList.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {tempList.map((t, i) => (
                                    <div key={i} className="bg-white border border-black/5 rounded px-2 py-1 flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold">{t}</span>
                                        <button type="button" onClick={() => setTempList(tempList.filter((_, idx) => idx !== i))}><X size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={handleAddVariant} className="flex-1 bg-[#1F1F1F] text-xs font-bold py-2 rounded-lg text-white">Save Option</button>
                      <button type="button" onClick={() => { setIsAddingVariant(false); setTempList([]); }} className="flex-1 bg-black/5 text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingVariant(true)} className="w-full py-3 rounded-xl border border-dashed border-black/20 text-xs font-bold text-gray-400 hover:text-[#1F1F1F] hover:border-[#1F1F1F] transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Option
                  </button>
                )}
              </div>

              {/* EXTRAS (With Image Support) */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2">Upsells / Extras</h3>
                <div className="space-y-3 mb-4">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-black/5">
                      <div className="flex items-center gap-3">
                        {ex.image ? (
                            <img src={ex.image} alt={ex.name} className="w-8 h-8 rounded object-cover border border-black/5" />
                        ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center"><ImageIcon size={12} className="text-gray-400"/></div>
                        )}
                        <div>
                            <span className="text-sm text-[#1F1F1F] font-bold block">{ex.name}</span>
                            <span className="text-xs text-[#C9A24D] font-bold">+€{ex.price}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeExtra(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                {isAddingExtra ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div><input type="text" placeholder="Name (e.g. Crown)" value={newExtraName} onChange={(e) => setNewExtraName(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm focus:border-[#C9A24D] outline-none" /></div>
                    <div className="relative"><DollarSign size={14} className="absolute left-3 top-2.5 text-gray-400" /><input type="number" placeholder="Price (e.g. 15)" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg pl-8 pr-3 py-2 text-sm focus:border-[#C9A24D] outline-none" /></div>
                    
                    <div className="flex items-center gap-3">
                        {newExtraImage ? (
                            <div className="relative w-12 h-12 rounded border border-black/10 overflow-hidden group">
                                <img src={newExtraImage} alt="Extra preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setNewExtraImage("")} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={14} className="text-white" />
                                </button>
                            </div>
                        ) : (
                            <label className={`w-12 h-12 rounded border border-dashed border-black/10 flex items-center justify-center hover:border-[#C9A24D] cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                                {isUploading ? <Loader2 size={14} className="animate-spin text-[#C9A24D]"/> : <Upload size={14} className="text-gray-400" />}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'extra')} disabled={isUploading} />
                            </label>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                             {newExtraImage ? "Image Uploaded" : "Add photo"}
                        </span>
                    </div>

                    <div className="flex gap-2 pt-1"><button type="button" onClick={handleAddExtra} className="flex-1 bg-[#1F1F1F] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#C9A24D] transition-colors">Add</button><button type="button" onClick={() => setIsAddingExtra(false)} className="flex-1 bg-black/5 text-xs font-bold py-2 rounded-lg">Cancel</button></div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingExtra(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-[#C9A24D] text-xs font-bold hover:text-[#1F1F1F] hover:border-[#1F1F1F] transition-colors flex items-center justify-center gap-2"><Plus size={14} /> Add Upsell</button>
                )}
              </div>

            </div>
          </div>
        </form>

        {cropImage && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg h-[60vh] bg-white border border-black/10 rounded-2xl overflow-hidden shadow-2xl">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={uploadType === "extra" ? 1 : 4 / 5} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="w-full max-w-lg mt-6 space-y-4 bg-white p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[#1F1F1F] uppercase">Zoom</span>
                  <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1F1F1F]" />
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setCropImage(null)} className="flex-1 py-3 bg-black/5 text-[#1F1F1F] rounded-xl font-bold hover:bg-black/10 transition-colors">Cancel</button>
                  <button onClick={handleUploadCroppedImage} disabled={isUploading} className="flex-1 py-3 bg-[#1F1F1F] text-white rounded-xl font-bold hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2">
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