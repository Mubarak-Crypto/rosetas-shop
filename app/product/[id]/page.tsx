"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Check, ChevronLeft, Loader2, AlertCircle, Maximize2, X, ZoomIn } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext"; 

export default function ProductPage() {
  const params = useParams();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [activeImage, setActiveImage] = useState<string>("");
  
  // ✨ NEW: Smart Zoom State (Can be main image OR extra image)
  const [zoomImage, setZoomImage] = useState<string | null>(null); 
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // Ribbon Text State
  const [customText, setCustomText] = useState(""); 
  
  // State for selected Extras
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // 1. FETCH PRODUCT DATA
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error("Error:", error);
      } else if (data) {
        setProduct(data);
        if (data.images && data.images.length > 0) setActiveImage(data.images[0]);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  // ✨ UPDATED: INDEX BRIDGE IMAGE SWAP LOGIC
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));

    if (product?.images && product.images.length > 0) {
      // Find the specific variant configuration
      const variant = product.variants.find((v: any) => v.name === optionName);
      
      if (variant && variant.values) {
        // Turn the comma-separated values into an array
        const valuesArray = variant.values.toString().split(',').map((s: string) => s.trim());
        
        // Find the index of the clicked color (e.g., 0, 1, or 2)
        const clickedIndex = valuesArray.indexOf(value);
        
        // Match that index to the image array position
        if (product.images[clickedIndex]) {
          setActiveImage(product.images[clickedIndex]);
        }
      }
    }
  };

  const toggleExtra = (extraName: string) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(prev => prev.filter(e => e !== extraName)); 
    } else {
      setSelectedExtras(prev => [...prev, extraName]); 
    }
  };

  const calculateUnitTotal = () => {
    if (!product) return 0;
    let extrasCost = 0;
    if (product.extras && Array.isArray(product.extras)) {
      product.extras.forEach((extra: any) => {
        if (selectedExtras.includes(extra.name)) {
          extrasCost += extra.price;
        }
      });
    }
    return product.price + extrasCost;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const optionsKey = JSON.stringify(selectedOptions);
    const extrasKey = JSON.stringify(selectedExtras.sort());
    const uniqueId = `${product.id}-${optionsKey}-${extrasKey}-${customText}`;

    addToCart({
      productId: product.id,
      uniqueId,
      name: product.name,
      price: calculateUnitTotal(),
      image: activeImage || "/placeholder.jpg",
      quantity: quantity,
      options: selectedOptions,
      extras: selectedExtras,
      customText: customText
    });
    
    setIsCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center text-neon-rose">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!product) return null;

  const unitPrice = calculateUnitTotal();
  const totalPrice = unitPrice * quantity;

  // ✨ UPDATED VALIDATION (Mandatory Ribbon)
  const allOptionsSelected = product.variants 
    ? product.variants.every((v: any) => selectedOptions[v.name]) 
    : true;

  // The ribbon text is now mandatory for the Add to Cart button to unlock
  const isRibbonValid = customText.trim().length > 0;
  const canAddToCart = allOptionsSelected && isRibbonValid;

  return (
    <main className="min-h-screen bg-midnight text-white selection:bg-neon-rose selection:text-black pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 pt-8">
        
        {/* --- LEFT: IMAGES --- */}
        <div className="space-y-6">
          {/* Main Image Container */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[4/5] w-full bg-black rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 opacity-30 blur-3xl z-0 bg-neon-rose/20" />
            
            {/* Click Main Image to Open Lightbox */}
            <div 
              className="relative z-10 w-full h-full overflow-hidden rounded-[3rem] cursor-zoom-in"
              onClick={() => setZoomImage(activeImage)}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  src={activeImage || "/placeholder.jpg"}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1.0 }} 
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Zoom Hint Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                 <Maximize2 className="text-white drop-shadow-lg" size={48} />
              </div>
            </div>

            {/* Corner Zoom Button */}
            <button 
              onClick={() => setZoomImage(activeImage)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-neon-rose hover:text-black transition-all"
            >
              <Maximize2 size={18} />
            </button>
          </motion.div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? "border-neon-rose scale-110 shadow-glow-rose" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT: DETAILS --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 pt-4"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Back to Shop
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-4 text-neon-rose text-sm font-bold tracking-wider uppercase">
              <Star size={14} fill="currentColor" />
              {product.category || "Luxury Collection"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-light text-neon-rose">€{totalPrice.toFixed(2)}</span>
              {product.stock > 0 ? (
                <span className="text-green-400 text-sm mb-1.5 flex items-center gap-1"><Check size={14} /> In Stock</span>
              ) : (
                <span className="text-red-400 text-sm mb-1.5 flex items-center gap-1">Out of Stock</span>
              )}
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed border-b border-white/10 pb-8 whitespace-pre-line">
            {product.description}
          </p>

          {/* --- VARIANTS (Colors) --- */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-6">
              {product.variants.map((variant: any, idx: number) => {
                const values = variant.values ? variant.values.toString().split(',').map((s: string) => s.trim()) : [];
                return (
                  <div key={`${variant.name}-${idx}`}>
                    <label className="text-sm font-bold text-gray-300 block mb-3 uppercase tracking-wider">{variant.name}</label>
                    <div className="flex flex-wrap gap-3">
                      {values.map((val: string) => (
                        <button
                          key={`${variant.name}-${val}`}
                          onClick={() => handleOptionSelect(variant.name, val)}
                          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all border ${
                            selectedOptions[variant.name] === val
                              ? "bg-neon-rose text-white border-neon-rose shadow-glow-rose font-bold"
                              : "bg-transparent text-gray-400 border-white/20 hover:border-white hover:text-white"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* PERSONALIZED RIBBON INPUT - REQUIRED */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex justify-between items-end">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neon-rose">
                <span>Personalized Ribbon Text *</span>
              </label>
            </div>

            <input 
              type="text" 
              placeholder="Enter required text for ribbon..." 
              value={customText} 
              onChange={(e) => setCustomText(e.target.value)}
              className={`w-full bg-black/50 border rounded-xl px-4 py-4 text-white focus:outline-none transition-all placeholder:text-gray-600 ${
                 !customText.trim() 
                  ? "border-red-500/50 focus:border-red-500" 
                  : "border-white/20 focus:border-neon-rose focus:ring-1 focus:ring-neon-rose"
              }`}
            />
            
            {!customText.trim() && (
              <p className="text-red-400 text-xs flex items-center gap-1 animate-pulse">
                <AlertCircle size={12} /> Please enter your custom text to proceed.
              </p>
            )}
          </div>

          {/* --- EXTRAS (Add-ons with IMAGES) --- */}
          {product.extras && product.extras.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-sm font-bold text-gray-300 block mb-2 uppercase tracking-wider">
                Customize & Upgrade
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {product.extras.map((extra: any, idx: number) => {
                  const isSelected = selectedExtras.includes(extra.name);
                  
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center p-2 rounded-xl border transition-all ${
                        isSelected 
                          ? "bg-neon-rose/10 border-neon-rose shadow-glow-rose" 
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                        {/* 1. EXTRA IMAGE THUMBNAIL (Optional) */}
                        {extra.image && (
                            <div 
                                className="relative w-16 h-16 mr-4 flex-shrink-0 cursor-zoom-in group/zoom rounded-lg overflow-hidden border border-white/10"
                                onClick={(e) => {
                                    e.stopPropagation(); // Don't toggle selection when zooming
                                    setZoomImage(extra.image);
                                }}
                            >
                                <img src={extra.image} className="w-full h-full object-cover" alt={extra.name} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/zoom:opacity-100 flex items-center justify-center transition-all">
                                    <ZoomIn size={14} className="text-white" />
                                </div>
                            </div>
                        )}

                        {/* 2. SELECTION CLICK AREA (The text part) */}
                        <button 
                            onClick={() => toggleExtra(extra.name)}
                            className="flex-1 flex items-center justify-between h-full text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                                isSelected ? "bg-neon-rose border-neon-rose" : "border-gray-500"
                                }`}>
                                {isSelected && <Check size={14} className="text-black" />}
                                </div>
                                
                                <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                                {extra.name}
                                </span>
                            </div>
                            <span className="text-sm text-neon-rose font-mono ml-2">+€{extra.price}</span>
                        </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cart Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10 mt-4">
            <div className="flex items-center bg-white/5 rounded-full border border-white/10 px-4 py-3 w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-white text-gray-500 transition-colors"><Minus size={18} /></button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-white text-gray-500 transition-colors"><Plus size={18} /></button>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              disabled={!canAddToCart} 
              className={`flex-1 font-bold rounded-full py-4 transition-all flex items-center justify-center gap-2 ${
                canAddToCart 
                  ? "bg-neon-rose text-white shadow-glow-rose hover:scale-[1.02] active:scale-95 cursor-pointer" 
                  : "bg-white/10 text-gray-500 cursor-not-allowed opacity-50"
              }`}
            >
              <ShoppingBag size={20} />
              {canAddToCart 
                ? `Add to Cart - €${totalPrice.toFixed(2)}` 
                : !allOptionsSelected ? "Select Options" : "Enter Ribbon Text"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ✨ LIGHTBOX MODAL */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setZoomImage(null)} // Close when clicking background
          >
            {/* Close Button */}
            <button 
              onClick={() => setZoomImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 z-50"
            >
              <X size={32} />
            </button>

            {/* The Zoomed Image */}
            <motion.img 
              src={zoomImage}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Don't close when clicking the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}