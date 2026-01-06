"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Check, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext"; // <--- IMPORT THIS

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart(); // <--- GET THE CART FUNCTION

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // State for selected Extras (Add-ons)
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
        
        // Set default options
        if (data.variants && Array.isArray(data.variants)) {
          const defaults: Record<string, string> = {};
          data.variants.forEach((v: any) => {
            const values = v.values ? v.values.toString().split(',').map((s: string) => s.trim()) : [];
            if (values.length > 0) defaults[v.name] = values[0];
          });
          setSelectedOptions(defaults);
        }
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  // Handle Colors/Sizes
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  // Handle Extras (Toggle on/off)
  const toggleExtra = (extraName: string) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(prev => prev.filter(e => e !== extraName)); // Remove
    } else {
      setSelectedExtras(prev => [...prev, extraName]); // Add
    }
  };

  // Calculate Unit Price (Base + Extras)
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

  // --- NEW: HANDLE ADD TO CART ---
  const handleAddToCart = () => {
    if (!product) return;

    // Create a unique ID for this specific configuration
    const optionsKey = JSON.stringify(selectedOptions);
    const extrasKey = JSON.stringify(selectedExtras.sort());
    const uniqueId = `${product.id}-${optionsKey}-${extrasKey}`;

    addToCart({
      productId: product.id,
      uniqueId,
      name: product.name,
      price: calculateUnitTotal(), // Save the price WITH extras
      image: activeImage || "/placeholder.jpg",
      quantity: quantity,
      options: selectedOptions,
      extras: selectedExtras
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center text-neon-purple">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!product) return null;

  const unitPrice = calculateUnitTotal();
  const totalPrice = unitPrice * quantity;

  return (
    <main className="min-h-screen bg-midnight text-white selection:bg-neon-rose selection:text-white pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 pt-8">
        
        {/* --- LEFT: IMAGES --- */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[4/5] w-full bg-black rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 opacity-30 blur-3xl z-0 bg-neon-rose/20" />
            <div className="relative z-10 w-full h-full overflow-hidden rounded-[3rem]">
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
            </div>
          </motion.div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? "border-neon-rose scale-110" : "border-transparent opacity-60 hover:opacity-100"
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
              {product.category || "Luxury"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-end gap-4">
              {/* DYNAMIC PRICE DISPLAY */}
              <span className="text-3xl font-light">€{totalPrice.toFixed(2)}</span>
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
                              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
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

          {/* --- EXTRAS (Add-ons) --- */}
          {product.extras && product.extras.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-sm font-bold text-gray-300 block mb-2 uppercase tracking-wider">
                Customize & Upgrade
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.extras.map((extra: any, idx: number) => {
                  const isSelected = selectedExtras.includes(extra.name);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleExtra(extra.name)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? "bg-neon-purple/10 border-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-neon-purple border-neon-purple" : "border-gray-500"
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                          {extra.name}
                        </span>
                      </div>
                      <span className="text-sm text-neon-purple font-mono">+€{extra.price}</span>
                    </button>
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
            
            {/* THIS BUTTON NOW ADDS TO CART */}
            <button 
              onClick={handleAddToCart} 
              className="flex-1 bg-neon-rose text-white font-bold rounded-full py-4 shadow-glow-rose hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Add to Cart - €{totalPrice.toFixed(2)}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}