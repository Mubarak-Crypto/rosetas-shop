"use client";

import { useState, useEffect, useCallback } from "react";
// ✨ ADDED: ShieldCheck for Gatekeeper UI
import { ArrowLeft, Upload, Save, X, Plus, Trash2, DollarSign, Loader2, Crop, Image as ImageIcon, ChevronDown, ArrowRight, ArrowLeft as ArrowLeftIcon, Video, Globe, Bookmark, Info, LayoutGrid, Tag, PenTool, Palette, MessageSquare, FileText, Hash, ToggleLeft, ToggleRight, Layers, Edit2, ShieldAlert, Star, ShieldCheck } from "lucide-react"; 
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Cropper from "react-easy-crop";
import { supabase } from "../../../../../lib/supabase";

// TYPES
type Variant = { name: string; name_en?: string; values: string; values_en?: string; };
type InputType = "none" | "short_note" | "letter";
type Extra = { 
    name: string; 
    name_en?: string; 
    price: number; 
    image?: string; 
    variants?: string[]; 
    inputType?: InputType; 
    allowQuantity?: boolean; 
    allowMultiple?: boolean; 
}; 
type Area = { x: number; y: number; width: number; height: number; };
type UploadType = "product" | "extra"; 

// Helper Type for the Temp List Builder
type TempVariantItem = { de: string; en: string; stock: string };

// ✨ NEW: Global Color Presets (Click to Auto-fill)
const COLOR_PRESETS = [
  { de: "Rot", en: "Red" },
  { de: "Weiß", en: "White" },
  { de: "Schwarz", en: "Black" },
  { de: "Lightrose", en: "Lightrose" },
  { de: "Rubinfeuer", en: "Ruby Fire" },
  { de: "Rosenkuss", en: "Rosekiss" },
  { de: "Zartrosa", en: "Softpink" },
  { de: "Sahneweiß", en: "Cream White" },
  { de: "Schneeflockenweiß", en: "Snowflake White" },
  { de: "Nachtrose", en: "Night Rose" },
  { de: "Eismeerblau", en: "Ice Blue" },
  { de: "Pastellviolett", en: "Pastel Violet" }
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [isUploadingVideo, setIsUploadingVideo] = useState(false); 

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]); 
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState(""); 
  const [category, setCategory] = useState(""); 
  const [isCustomCategory, setIsCustomCategory] = useState(false); 
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState(""); 

  const [isFeatured, setIsFeatured] = useState(false);

  // ✨ NEW: GATEKEEPER STATES (For Makeup Add-ons and Wholesale Supplies)
  const [isAddon, setIsAddon] = useState(false);
  const [isSupply, setIsSupply] = useState(false);

  const [safetyInstructions, setSafetyInstructions] = useState("");
  const [safetyInstructionsEn, setSafetyInstructionsEn] = useState("");

  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [needsRibbon, setNeedsRibbon] = useState(false); 
  const [promoLabel, setPromoLabel] = useState(""); 
  
  // Personalization Labels
  const [persLabel1, setPersLabel1] = useState("");
  const [persLabel2, setPersLabel2] = useState("");
  
  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null); 
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantNameEn, setNewVariantNameEn] = useState("");
  
  // Helper states for building values
  const [tempValueName, setTempValueName] = useState("");
  const [tempValueNameEn, setTempValueNameEn] = useState(""); 
  const [tempValueStock, setTempValueStock] = useState("");
  const [tempList, setTempList] = useState<TempVariantItem[]>([]);

  // STOCK MATRIX STATE
  const [stockMatrix, setStockMatrix] = useState<any[]>([]);

  // Extras
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [editingExtraIndex, setEditingExtraIndex] = useState<number | null>(null); 
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraNameEn, setNewExtraNameEn] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newExtraImage, setNewExtraImage] = useState(""); 
  const [newExtraInputType, setNewExtraInputType] = useState<InputType>("none");
  const [newExtraAllowQty, setNewExtraAllowQty] = useState(false);
  const [newExtraAllowMultiple, setNewExtraAllowMultiple] = useState(false);

  // Extra Variants State
  const [isAddingExtraVariants, setIsAddingExtraVariants] = useState(false);
  const [tempExtraVariant, setTempExtraVariant] = useState("");
  const [extraVariantsList, setExtraVariantsList] = useState<string[]>([]);

  // --- CROPPER STATE ---
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>("product"); 
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
        setNameEn(data.name_en || ""); 
        setDescription(data.description || "");
        setDescriptionEn(data.description_en || ""); 

        setIsFeatured(data.is_featured || false);
        
        // ✨ LOAD GATEKEEPER STATES
        setIsAddon(data.is_addon || false);
        setIsSupply(data.is_supply || false);

        setSafetyInstructions(data.safety_instructions_de || "");
        setSafetyInstructionsEn(data.safety_instructions_en || "");

        setPrice(data.price.toString());
        setCategory(data.category || "");
        setStock(data.stock?.toString() || "0"); // Original stock logic restored
        setStatus(data.status || "active");
        setImages(data.images || []);
        
        const loadedVideos = Array.isArray(data.video_url) ? data.video_url : (data.video_url ? [data.video_url] : []);
        setVideoUrls(loadedVideos);
        setVariants(data.variants || []);
        setExtras(data.extras || []);
        setNeedsRibbon(data.needs_ribbon || false); 
        setStockMatrix(data.stock_matrix || []); 
        setPromoLabel(data.promo_label || ""); 
        
        setPersLabel1(data.pers_label_1 || "");
        setPersLabel2(data.pers_label_2 || "");
        
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // AUTO-GENERATE MATRIX LOGIC
  useEffect(() => {
    if (variants.length > 0) {
      const generateMatrix = () => {
        if (!Array.isArray(stockMatrix)) {
            setStockMatrix([]); 
            return;
        }

        const optionGroups = variants.map(v => ({
          name: v.name,
          values: v.values.split(',').map(val => val.split('(')[0].split('|')[0].trim())
        }));

        const combos = optionGroups.reduce((a, b) => 
          a.flatMap((d: any) => b.values.map(v => ({ ...d, [b.name]: v })))
        , [{}]);

        const newMatrix = combos.map(combo => {
          const existing = stockMatrix.find(m => 
            Object.keys(combo).every(key => m[key] === combo[key])
          );
          return existing || { ...combo, stock: -1 };
        });

        setStockMatrix(newMatrix);
      };
      generateMatrix();
    } else {
        setStockMatrix([]);
    }
  }, [variants]);

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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: UploadType = "product") => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadType(type); 
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

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const getColorLabels = () => {
    const colorVariant = variants.find(v => v.name.toLowerCase() === 'color' || v.name.toLowerCase() === 'farbe');
    if (!colorVariant) return [];
    return colorVariant.values.split(',').map(v => v.split('|')[0].trim());
  };

  // --- VARIANTS & EXTRAS ---
  const handleAddVariantItem = () => {
    if (!tempValueName) return;
    
    const newItem: TempVariantItem = {
        de: tempValueName,
        en: tempValueNameEn || tempValueName, 
        stock: tempValueStock
    };
    
    setTempList([...tempList, newItem]);
    
    setTempValueName("");
    setTempValueNameEn("");
    setTempValueStock("");
  };

  // ✨ NEW: Easy Reordering Function for Variants
  const moveTempItem = (index: number, direction: 'left' | 'right') => {
    const newList = [...tempList];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newList.length) return;
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setTempList(newList);
  };

  const handleEditVariant = (index: number) => {
    const variant = variants[index];
    setNewVariantName(variant.name);
    setNewVariantNameEn(variant.name_en || "");

    const valuesDe = variant.values.split(',').map(s => s.trim());
    const valuesEn = variant.values_en ? variant.values_en.split(',').map(s => s.trim()) : [];

    const parsedTempList: TempVariantItem[] = valuesDe.map((valStr, i) => {
        let deName = valStr;
        let stock = "";

        if (valStr.includes('| Stock:')) {
            const parts = valStr.split('| Stock:');
            deName = parts[0].trim();
            stock = parts[1].trim();
        }

        return {
            de: deName,
            en: valuesEn[i] || deName,
            stock: stock
        };
    });

    setTempList(parsedTempList);
    setEditingVariantIndex(index);
    setIsAddingVariant(true);
  };

  const handleAddVariant = () => {
    if (!newVariantName || tempList.length === 0) return;
    
    const valuesDE = tempList.map(item => item.stock ? `${item.de} | Stock: ${item.stock}` : item.de).join(', ');
    const valuesEN = tempList.map(item => item.en).join(', ');

    const newVariantObj = { 
        name: newVariantName, 
        name_en: newVariantNameEn || undefined,
        values: valuesDE,
        values_en: valuesEN
    };

    if (editingVariantIndex !== null) {
        const updatedVariants = [...variants];
        updatedVariants[editingVariantIndex] = newVariantObj;
        setVariants(updatedVariants);
        setEditingVariantIndex(null);
    } else {
        setVariants([...variants, newVariantObj]);
    }

    setNewVariantName("");
    setNewVariantNameEn("");
    setTempList([]);
    setIsAddingVariant(false);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddExtraVariantItem = () => {
    if (!tempExtraVariant) return;
    setExtraVariantsList([...extraVariantsList, tempExtraVariant]);
    setTempExtraVariant("");
  };

  const handleEditExtra = (index: number) => {
    const ex = extras[index];
    setNewExtraName(ex.name);
    setNewExtraNameEn(ex.name_en || "");
    setNewExtraPrice(ex.price.toString());
    setNewExtraImage(ex.image || "");
    setNewExtraInputType(ex.inputType || "none");
    setNewExtraAllowQty(ex.allowQuantity || false);
    setNewExtraAllowMultiple(ex.allowMultiple || false);
    setExtraVariantsList(ex.variants || []);
    
    setEditingExtraIndex(index);
    setIsAddingExtra(true); 
  };

  const handleAddExtra = () => {
    if (!newExtraName || !newExtraPrice) return;
    
    const newExtraObj: Extra = { 
        name: newExtraName,
        name_en: newExtraNameEn || undefined,
        price: parseFloat(newExtraPrice),
        image: newExtraImage,
        variants: extraVariantsList.length > 0 ? extraVariantsList : undefined,
        inputType: newExtraInputType, 
        allowQuantity: newExtraAllowQty, 
        allowMultiple: newExtraAllowMultiple 
    };

    if (editingExtraIndex !== null) {
        const updatedExtras = [...extras];
        updatedExtras[editingExtraIndex] = newExtraObj;
        setExtras(updatedExtras);
        setEditingExtraIndex(null); 
    } else {
        setExtras([...extras, newExtraObj]);
    }
    
    setNewExtraName("");
    setNewExtraNameEn("");
    setNewExtraPrice("");
    setNewExtraImage("");
    setExtraVariantsList([]);
    setNewExtraInputType("none"); 
    setNewExtraAllowQty(false); 
    setNewExtraAllowMultiple(false); 
    setIsAddingExtraVariants(false);
    setIsAddingExtra(false);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  // --- 3. SAVE UPDATE WITH BULLETPROOF ERROR HANDLING ---
  // 🐛 NEW FIX: We fully wrapped this in a try/catch/finally block!
  // If the user's connection drops or the token dies while sitting idle, 
  // the app will catch the crash, alert the user, and immediately stop the spinner.
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name,
          name_en: nameEn, 
          description,
          description_en: descriptionEn, 
          safety_instructions_de: safetyInstructions,
          safety_instructions_en: safetyInstructionsEn,
          price: parseFloat(price),
          category: category.trim(),
          stock: parseInt(stock) || 0,
          status,
          images,
          video_url: videoUrls, 
          variants,
          extras, 
          needs_ribbon: needsRibbon, 
          stock_matrix: stockMatrix, 
          promo_label: promoLabel, 
          is_featured: isFeatured,
          
          // ✨ SAVE GATEKEEPER STATES
          is_addon: isAddon,
          is_supply: isSupply,

          pers_label_1: persLabel1 || null,
          pers_label_2: persLabel2 || null
        })
        .eq('id', productId);

      if (error) throw error; // If Supabase throws a soft error, we throw it hard into the catch block.

      alert("Product updated successfully!");
      router.refresh(); 
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Update Error:", err);
      alert("Error updating: " + (err.message || "Your connection may have timed out. Please try again."));
    } finally {
      setIsSaving(false); // ✨ GUARANTEED UN-FREEZE: Always stops the infinite spinner!
    }
  };

  const colorLabels = getColorLabels();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A24D]" size={48} />
      </div>
    );
  }

  // ✨ BULLETPROOF BUG FIX EXPLANATION ✨
  // Just like the "Add New Product" page, the admin dashboard's global layout 
  // uses a 'select-none' Tailwind class to prevent the sidebars from turning blue.
  // 
  // Because this edit page is rendered inside that layout, the 'select-none' class
  // cascaded down and locked all of your inputs, completely breaking copy & paste!
  // 
  // To fix it, we injected 'select-text' into the main parent container below,
  // and explicitly added it to every single input and textarea to guarantee
  // the browser will allow normal typing, selecting, and pasting.

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      {/* ✨ BUG FIX: Added select-text here to unlock the container */}
      <main className="flex-1 p-8 overflow-y-auto select-text">
        <form onSubmit={handleUpdate} className="max-w-5xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/products" className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-400 hover:text-[#1F1F1F]">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <p className="text-[#1F1F1F]/60 text-sm font-medium">Update product details.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/products" className="px-6 py-3 rounded-xl border border-black/5 text-sm font-bold hover:bg-black/5 transition-all flex items-center justify-center">
                <span className="!text-[#1F1F1F]">Cancel</span>
              </Link>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#1F1F1F] text-white text-sm font-bold hover:bg-[#D4C29A] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Save size={18} style={{ color: 'white' }} />
                <span style={{ color: 'white !important' }} className="!text-white">
                  {isSaving ? "Updating..." : "Save Changes"}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN (Properly contained to prevent layout breakage) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* PRODUCT DETAILS */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-lg">Product Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-gray-200 rounded-sm text-[8px] flex items-center justify-center text-gray-500">DE</span>
                      Name (German)
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors font-bold select-text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#C9A24D] uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-[#C9A24D]/20 rounded-sm text-[8px] flex items-center justify-center text-[#C9A24D]">EN</span>
                      Name (English)
                    </label>
                    <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="English title..." className="w-full bg-gray-50 border border-[#C9A24D]/20 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors font-bold select-text" />
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
                          className="w-full bg-gray-50 border border-[#C9A24D]/50 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors text-[#1F1F1F] select-text" 
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-gray-200 rounded-sm text-[8px] flex items-center justify-center text-gray-500">DE</span>
                      Description (German)
                    </label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors resize-none select-text"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#C9A24D] uppercase flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-[#C9A24D]/20 rounded-sm text-[8px] flex items-center justify-center text-[#C9A24D]">EN</span>
                      Description (English)
                    </label>
                    <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={4} placeholder="English description..." className="w-full bg-gray-50 border border-[#C9A24D]/20 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors resize-none select-text"></textarea>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-red-500">
                    <ShieldAlert size={16} /> Safety & Care Instructions (Reveal Button Content)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                        <span className="w-4 h-3 bg-gray-200 rounded-sm text-[8px] flex items-center justify-center text-gray-500">DE</span>
                        Safety Tips (German)
                      </label>
                      <textarea value={safetyInstructions} onChange={(e) => setSafetyInstructions(e.target.value)} rows={3} placeholder="z.B. Nicht essbar, von Kindern fernhalten..." className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-red-400 outline-none transition-colors resize-none italic select-text"></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#C9A24D] uppercase flex items-center gap-1.5">
                        <span className="w-4 h-3 bg-[#C9A24D]/20 rounded-sm text-[8px] flex items-center justify-center text-[#C9A24D]">EN</span>
                        Safety Tips (English)
                      </label>
                      <textarea value={safetyInstructionsEn} onChange={(e) => setSafetyInstructionsEn(e.target.value)} rows={3} placeholder="e.g. Not edible, keep away from children..." className="w-full bg-gray-50 border border-[#C9A24D]/20 rounded-xl px-4 py-3 text-sm focus:border-red-400 outline-none transition-colors resize-none italic select-text"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* PERSONALIZATION MODE */}
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

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                            <PenTool size={12}/> Label 1 (Default: Ribbon)
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. On Vase" 
                            value={persLabel1}
                            onChange={(e) => setPersLabel1(e.target.value)}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none select-text"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                            <PenTool size={12}/> Label 2 (Default: Paper)
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. On Box" 
                            value={persLabel2}
                            onChange={(e) => setPersLabel2(e.target.value)}
                            className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none select-text"
                        />
                    </div>
                </div>
              </div>

              {/* OPTIONS (VARIANTS) WITH NEW PRESETS AND ARROWS */}
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
                      <div className="max-w-[70%]">
                        <span className="text-xs font-bold text-gray-400 block uppercase">
                            {v.name} {v.name_en ? <span className="text-[#C9A24D]">/ {v.name_en}</span> : ''}
                        </span>
                        <div className="flex flex-col gap-1 mt-1">
                            <span className="text-[10px] font-bold text-gray-400">DE: <span className="text-[#1F1F1F] font-medium">{v.values}</span></span>
                            {v.values_en && <span className="text-[10px] font-bold text-[#C9A24D]/70">EN: <span className="text-[#1F1F1F] font-medium">{v.values_en}</span></span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleEditVariant(idx)} className="text-gray-400 hover:text-[#C9A24D]">
                              <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => removeVariant(idx)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={16} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>

                {isAddingVariant ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Option Name (DE)" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D] select-text" />
                        <input type="text" placeholder="Option Name (EN)" value={newVariantNameEn} onChange={(e) => setNewVariantNameEn(e.target.value)} className="w-full bg-white border border-[#C9A24D]/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D] text-[#C9A24D] select-text" />
                    </div>
                    
                    <div className="space-y-3 bg-white/50 p-3 rounded-lg border border-black/5">
                        
                        {/* ✨ NEW: Quick-Click Color Presets */}
                        <div className="mb-3 border-b border-black/5 pb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Quick-Click Color Presets</span>
                            <div className="flex flex-wrap gap-1.5">
                                {COLOR_PRESETS.map((c, i) => (
                                    <button 
                                        key={i} 
                                        type="button" 
                                        onClick={() => { setTempValueName(c.de); setTempValueNameEn(c.en); }}
                                        className="text-[9px] font-bold bg-white text-[#1F1F1F]/60 border border-black/10 hover:border-[#C9A24D] hover:text-[#C9A24D] rounded px-2 py-1 transition-colors"
                                    >
                                        {c.de}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Value (DE)</span>
                                <input type="text" placeholder="e.g. Rot" value={tempValueName} onChange={(e) => setTempValueName(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D] text-[#1F1F1F] select-text" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-[#C9A24D] uppercase">Value (EN)</span>
                                <input type="text" placeholder="e.g. Red" value={tempValueNameEn} onChange={(e) => setTempValueNameEn(e.target.value)} className="w-full bg-white border border-[#C9A24D]/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D] text-[#C9A24D] select-text" />
                            </div>
                        </div>
                        
                        <div className="flex items-end gap-3">
                            <div className="flex-1 space-y-1">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase">Stock (Optional)</span>
                                 <input type="number" placeholder="Enter qty..." value={tempValueStock} onChange={(e) => setTempValueStock(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A24D] text-[#1F1F1F] select-text" />
                            </div>
                            <button type="button" onClick={handleAddVariantItem} className="h-[38px] px-6 bg-[#C9A24D] text-white rounded-lg flex items-center gap-2 font-bold shadow-sm hover:bg-[#b08d43] transition-colors"><Plus size={18}/> Add Value</button>
                        </div>

                        {tempList.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5 mt-2">
                                {tempList.map((t, i) => (
                                    <div key={i} className="bg-white border border-black/5 rounded px-2 py-1 flex flex-col gap-0.5 min-w-[100px]">
                                            <div className="flex items-center gap-2 justify-between">
                                                <span className="text-[10px] font-bold">{t.de}</span>
                                                <button type="button" onClick={() => setTempList(tempList.filter((_, idx) => idx !== i))}><X size={10} className="text-red-400"/></button>
                                            </div>
                                            <span className="text-[9px] text-[#C9A24D]">{t.en} {t.stock ? `(${t.stock})` : ''}</span>
                                            
                                            {/* ✨ NEW: Easy Reordering Arrows */}
                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5">
                                                <button type="button" onClick={() => moveTempItem(i, 'left')} disabled={i === 0} className="p-0.5 text-gray-400 hover:text-[#1F1F1F] disabled:opacity-30"><ArrowLeftIcon size={12}/></button>
                                                <span className="text-[8px] text-gray-300">Pos {i + 1}</span>
                                                <button type="button" onClick={() => moveTempItem(i, 'right')} disabled={i === tempList.length - 1} className="p-0.5 text-gray-400 hover:text-[#1F1F1F] disabled:opacity-30"><ArrowRight size={12}/></button>
                                            </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={handleAddVariant} className="flex-1 bg-[#1F1F1F] text-xs font-bold py-2 rounded-lg text-white">
                          {editingVariantIndex !== null ? "Update Option" : "Save Option"}
                      </button>
                      <button type="button" onClick={() => { setIsAddingVariant(false); setTempList([]); setEditingVariantIndex(null); }} className="flex-1 bg-black/5 text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingVariant(true)} className="w-full py-3 rounded-xl border border-dashed border-black/20 text-xs font-bold text-gray-400 hover:text-[#1F1F1F] hover:border-[#1F1F1F] transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Option
                  </button>
                )}
              </div>

              {/* INDIVIDUAL STOCK TRACKING */}
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
                          <th className="px-4 py-3">Stock Limit?</th>
                          <th className="px-4 py-3">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {stockMatrix.map((item, idx) => {
                            const isUnlimitedMatrix = item.stock === -1;
                            
                            return (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                {variants.map(v => <td key={v.name} className="px-4 py-3 text-xs font-bold">{item[v.name]}</td>)}
                                
                                {/* Toggle for Unlimited */}
                                <td className="px-4 py-2">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const updated = [...stockMatrix];
                                            // Toggle between -1 (Unlimited) and 0 (Tracked)
                                            updated[idx].stock = isUnlimitedMatrix ? 0 : -1;
                                            setStockMatrix(updated);
                                        }}
                                        className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                                            isUnlimitedMatrix ? "text-green-600 bg-green-50" : "text-[#C9A24D] bg-[#F6EFE6]"
                                        }`}
                                    >
                                        {isUnlimitedMatrix ? <ToggleLeft size={16}/> : <ToggleRight size={16}/>}
                                        {isUnlimitedMatrix ? "Unlimited" : "Tracked"}
                                    </button>
                                </td>

                                {/* Stock Quantity Input */}
                                <td className="px-4 py-2">
                                  {isUnlimitedMatrix ? (
                                    <span className="text-xl text-gray-300 font-bold">∞</span>
                                  ) : (
                                    <input 
                                      type="number" 
                                      value={item.stock} 
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const safeVal = isNaN(val) ? 0 : val;
                                        
                                        const updated = stockMatrix.map((row, i) => 
                                            i === idx ? { ...row, stock: safeVal } : row
                                        );
                                        setStockMatrix(updated);
                                      }}
                                      className="w-24 bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-bold text-[#1F1F1F] outline-none focus:border-[#C9A24D] select-text"
                                      placeholder="0"
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* UPSELLS / EXTRAS */}
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
                          <div className="flex items-center gap-2">
                                <span className="text-sm text-[#1F1F1F] font-bold block">
                                    {ex.name} {ex.name_en ? <span className="text-[#C9A24D]">/ {ex.name_en}</span> : ''}
                                </span>
                                {ex.inputType === 'letter' && <div className="text-[10px] bg-[#1F1F1F] text-white px-1.5 rounded flex items-center gap-1"><FileText size={10}/> Letter</div>}
                                {ex.inputType === 'short_note' && <div className="text-[10px] bg-[#1F1F1F] text-white px-1.5 rounded flex items-center gap-1"><MessageSquare size={10}/> Note</div>}
                                {ex.allowQuantity && <div className="text-[10px] bg-[#C9A24D] text-white px-1.5 rounded flex items-center gap-1"><Hash size={10}/> Qty</div>}
                                {ex.allowMultiple && <div className="text-[10px] bg-blue-600 text-white px-1.5 rounded flex items-center gap-1"><Layers size={10}/> Multi</div>}
                            </div>
                            <span className={`text-xs font-bold ${ex.price < 0 ? "text-red-500" : "text-[#C9A24D]"}`}>
                                {ex.price < 0 ? `-€${Math.abs(ex.price)}` : `+€${ex.price}`}
                            </span>
                            
                            {ex.variants && ex.variants.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                    {ex.variants.map(v => (
                                        <span key={v} className="text-[9px] bg-white border border-black/10 px-1.5 rounded flex items-center gap-1">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                          <button type="button" onClick={() => handleEditExtra(idx)} className="text-gray-400 hover:text-[#C9A24D]">
                              <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => removeExtra(idx)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={16} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
                {isAddingExtra ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Name (DE)" value={newExtraName} onChange={(e) => setNewExtraName(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg px-3 py-2 text-sm focus:border-[#C9A24D] outline-none select-text" />
                        <input type="text" placeholder="Name (EN)" value={newExtraNameEn} onChange={(e) => setNewExtraNameEn(e.target.value)} className="w-full bg-white border border-[#C9A24D]/20 rounded-lg px-3 py-2 text-sm focus:border-[#C9A24D] outline-none text-[#C9A24D] select-text" />
                    </div>

                    <div className="relative"><DollarSign size={14} className="absolute left-3 top-2.5 text-gray-400" /><input type="number" placeholder="Price (e.g. 15 or -10)" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} className="w-full bg-white border border-black/5 rounded-lg pl-8 pr-3 py-2 text-sm focus:border-[#C9A24D] outline-none select-text" /></div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Input Logic (Conditional)</label>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => setNewExtraInputType('none')} 
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${newExtraInputType === 'none' ? 'bg-[#1F1F1F] text-white border-[#1F1F1F]' : 'bg-white text-gray-400 border-black/10'}`}
                            >
                                None
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setNewExtraInputType('short_note')} 
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 ${newExtraInputType === 'short_note' ? 'bg-[#1F1F1F] text-white border-[#1F1F1F]' : 'bg-white text-gray-400 border-black/10'}`}
                            >
                                <MessageSquare size={12}/> Short Note
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setNewExtraInputType('letter')} 
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 ${newExtraInputType === 'letter' ? 'bg-[#1F1F1F] text-white border-[#1F1F1F]' : 'bg-white text-gray-400 border-black/10'}`}
                            >
                                <FileText size={12}/> Letter (A4)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between bg-white border border-black/5 p-2 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#1F1F1F]">Enable Quantity?</span>
                                <span className="text-[9px] text-gray-400">Cust. can select qty</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setNewExtraAllowQty(!newExtraAllowQty)}
                                className={`w-10 h-6 rounded-full transition-all flex items-center p-1 ${newExtraAllowQty ? 'bg-[#C9A24D] justify-end' : 'bg-gray-300 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-white border border-black/5 p-2 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#1F1F1F]">Allow Multiple?</span>
                                <span className="text-[9px] text-gray-400">Cust. can select A+B</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setNewExtraAllowMultiple(!newExtraAllowMultiple)}
                                className={`w-10 h-6 rounded-full transition-all flex items-center p-1 ${newExtraAllowMultiple ? 'bg-[#1F1F1F] justify-end' : 'bg-gray-200 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </button>
                        </div>
                    </div>

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

                    <div className="pt-2 border-t border-black/5">
                        {!isAddingExtraVariants ? (
                            <button type="button" onClick={() => setIsAddingExtraVariants(true)} className="text-[10px] font-bold text-[#C9A24D] flex items-center gap-1 hover:underline">
                                <Palette size={12} /> Add Color Variants (Optional)
                            </button>
                        ) : (
                            <div className="space-y-2 bg-white/50 p-2 rounded-lg border border-black/5">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Color (e.g. Gold)" 
                                        value={tempExtraVariant} 
                                        onChange={(e) => setTempExtraVariant(e.target.value)} 
                                        className="flex-1 bg-white border border-black/5 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#C9A24D] select-text" 
                                    />
                                    <button type="button" onClick={handleAddExtraVariantItem} className="bg-[#1F1F1F] text-white px-2 rounded text-xs font-bold">Add</button>
                                    <button type="button" onClick={() => { setIsAddingExtraVariants(false); setExtraVariantsList([]); }} className="text-xs text-red-400"><X size={14} /></button>
                                </div>
                                {extraVariantsList.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {extraVariantsList.map((v, i) => (
                                            <span key={i} className="text-[9px] bg-white border border-black/10 px-1.5 rounded flex items-center gap-1">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={handleAddExtra} className="flex-1 bg-[#1F1F1F] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#C9A24D] transition-colors">
                            {editingExtraIndex !== null ? "Update" : "Add"}
                        </button>
                        <button type="button" onClick={() => { setIsAddingExtra(false); setEditingExtraIndex(null); }} className="flex-1 bg-black/5 text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsAddingExtra(true)} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-xs font-bold hover:text-[#1F1F1F] hover:border-[#1F1F1F] transition-colors flex items-center justify-center gap-2"><Plus size={14} /> Add Upsell</button>
                )}
              </div>

              {/* PRICING & PROMOTION (Restored to its original state exactly as provided) */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg mb-4">Pricing & Promotion</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Price (€)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors select-text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Total Capacity</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors select-text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#C9A24D] uppercase flex items-center gap-1.5">
                      <Tag size={10} /> Promotion (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={promoLabel} 
                      onChange={(e) => setPromoLabel(e.target.value)} 
                      placeholder="e.g. 2 for 50" 
                      className="w-full bg-[#F6EFE6] border border-[#C9A24D]/30 rounded-xl px-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors text-[#C9A24D] font-bold placeholder:text-[#C9A24D]/30 select-text" 
                    />
                  </div>
                </div>
              </div>

            </div> {/* END RIGHT COLUMN */}
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