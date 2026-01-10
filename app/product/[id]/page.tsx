"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Check, ChevronLeft, Loader2, AlertCircle, Maximize2, X, ZoomIn, Play, ShieldCheck } from "lucide-react"; // ✨ Added Play & ShieldCheck icons
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation"; // ✨ Added useSearchParams for verification logic
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext"; 
import { useLanguage } from "../../../context/LanguageContext"; // ✨ Added Language Import

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // ✨ NEW: Access URL params for verification
  const { addToCart, setIsCartOpen } = useCart();
  const { language, t } = useLanguage(); // ✨ NEW: Access language and translation function
  const videoRef = useRef<HTMLVideoElement>(null); // ✨ NEW: Ref for lightbox video controls

  // ✨ NEW: Check if this user arrived via a private verified review link
  const isVerifiedBuyer = searchParams.get('verify') === 'true';

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ NEW: Review States
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ customer_name: "", rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Interaction State
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<string | null>(null); // ✨ NEW: Track which video is playing
  const [showVideo, setShowVideo] = useState<boolean>(false); // ✨ NEW: Video toggle state
  
  // ✨ NEW: Smart Zoom State (Can be main image OR extra image)
  const [zoomImage, setZoomImage] = useState<string | null>(null); 
  const [zoomVideo, setZoomVideo] = useState<string | null>(null); // ✨ NEW: Video zoom state
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // Ribbon Text State
  const [customText, setCustomText] = useState(""); 
  
  // State for selected Extras
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // 1. FETCH PRODUCT DATA & REVIEWS
  useEffect(() => {
    const fetchProductData = async () => {
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
        
        // ✨ UPDATED: Multiple Video Logic
        const videos = Array.isArray(data.video_url) ? data.video_url : (data.video_url ? [data.video_url] : []);
        // ✅ FIXED: Ensure valid video source exists before showing video view
        if (videos.length > 0 && videos[0] && videos[0].trim() !== "") {
          setActiveVideo(videos[0]);
          setShowVideo(true);
        }

        // ✨ NEW: Fetch Reviews for this product
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', params.id)
          .eq('status', 'approved') // ✅ RESTRICTION: Only show approved reviews publicly
          .order('created_at', { ascending: false });
        
        if (reviewData) setReviews(reviewData);
      }
      setIsLoading(false);
    };

    fetchProductData();
  }, [params.id]);

  // ✨ UPDATED: INDEX BRIDGE IMAGE SWAP LOGIC
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    
    // Logic Gate: Only switch images if the variant is color-related
    const isColorVariant = optionName.toLowerCase() === 'color' || optionName.toLowerCase() === 'farbe';

    if (isColorVariant && product?.images && product.images.length > 0) {
      setShowVideo(false); 
      const variant = product.variants.find((v: any) => v.name === optionName);
      
      if (variant && variant.values) {
        // Values array logic preserved to maintain index bridge
        const valuesArray = variant.values.toString().split(',').map((s: string) => s.trim());
        const clickedIndex = valuesArray.indexOf(value);
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

  // ✨ NEW: Logic to find stock for current selection
  const getSelectedVariantStock = () => {
    if (!product || !product.variants) return 999;
    
    let lowestStock = 999;
    let hasStockInfo = false;

    product.variants.forEach((v: any) => {
      const selectedValue = selectedOptions[v.name];
      if (selectedValue && selectedValue.includes('| Stock:')) {
        const stockMatch = selectedValue.match(/\| Stock:\s*(\d+)/);
        if (stockMatch) {
          hasStockInfo = true;
          lowestStock = Math.min(lowestStock, parseInt(stockMatch[1]));
        }
      }
    });

    return hasStockInfo ? lowestStock : (product.stock || 0);
  };

  // ✨ NEW: Helper to extract price from variants like "50 Roses (€100)"
  const getBasePrice = () => {
    if (!product) return 0;
    let currentBase = product.price;

    Object.values(selectedOptions).forEach(val => {
      const priceMatch = val.match(/\(€(\d+)\)/);
      if (priceMatch && priceMatch[1]) {
        currentBase = parseFloat(priceMatch[1]);
      }
    });

    return currentBase;
  };

  const calculateUnitTotal = () => {
    const base = getBasePrice(); // ✨ Use dynamic base price from variant
    let extrasCost = 0;
    if (product.extras && Array.isArray(product.extras)) {
      product.extras.forEach((extra: any) => {
        if (selectedExtras.includes(extra.name)) {
          extrasCost += extra.price;
        }
      });
    }
    return base + extrasCost;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const unitPrice = calculateUnitTotal();
    const optionsKey = JSON.stringify(selectedOptions);
    const extrasKey = JSON.stringify(selectedExtras.sort());
    const uniqueId = `${product.id}-${optionsKey}-${extrasKey}-${customText}`;

    addToCart({
      productId: product.id,
      uniqueId,
      // ✨ Use logic for translated name
      name: language === 'EN' && product.name_en ? product.name_en : product.name, 
      price: unitPrice,
      image: activeImage || "/placeholder.jpg",
      quantity: quantity,
      options: selectedOptions,
      extras: selectedExtras,
      // ✅ FIXED: Passing category ensures the €80 limit triggers correctly
      category: product.category,
      customText: customText
    });
    
    setIsCartOpen(true);
  };

  // ✨ NEW: Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    const { error } = await supabase.from('reviews').insert([
      {
        product_id: product.id,
        customer_name: newReview.customer_name,
        rating: newReview.rating,
        comment: newReview.comment,
        source: 'website',
        is_verified: true, // ✅ Set to true as they used a private link
        status: 'pending' // ✅ Admin must still approve manually
      }
    ]);

    if (!error) {
      setNewReview({ customer_name: "", rating: 5, comment: "" });
      // Show a success alert or message here if desired
    }
    setIsSubmittingReview(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center text-[#C9A24D]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!product) return null;

  const unitPrice = calculateUnitTotal();
  const totalPrice = unitPrice * quantity;
  const currentVariantStock = getSelectedVariantStock(); // ✨ Get variant stock

  const allOptionsSelected = product.variants 
    ? product.variants.every((v: any) => selectedOptions[v.name]) 
    : true;

  // ✨ UPDATED: Logic now uses the database 'needs_ribbon' toggle instead of checking category
  const isRibbonRequired = product.needs_ribbon === true;
  const isRibbonValid = isRibbonRequired ? customText.trim().length > 0 : true;
  const isCurrentlyInStock = currentVariantStock > 0; // ✨ Check specific selection stock
  const canAddToCart = allOptionsSelected && isRibbonValid && isCurrentlyInStock;

  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 5.0;

  const productVideos = Array.isArray(product.video_url) ? product.video_url : (product.video_url ? [product.video_url] : []);

  return (
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] selection:bg-[#C9A24D] selection:text-white pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 pt-8">
        
        {/* --- LEFT: IMAGES & VIDEO --- */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            /* ✨ LUXURY UPDATE: Added luminous glow and white border instead of black */
            className="relative aspect-[4/5] w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(255,255,255,0.8),0_0_20px_rgba(201,162,77,0.1)] border border-white flex items-center justify-center overflow-hidden group"
          >
            {showVideo && activeVideo ? (
                <div className="relative w-full h-full cursor-zoom-in" onClick={() => setZoomVideo(activeVideo)}>
                  {/* ✅ FIXED: Plays inline and loops automatically on page load */}
                  <video 
                      key={activeVideo}
                      src={activeVideo} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="text-white drop-shadow-lg" size={48} />
                  </div>
                </div>
            ) : (
                <>
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
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="text-white drop-shadow-lg" size={48} />
                  </div>
                </div>

                <button 
                  onClick={() => setZoomImage(activeImage)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#1F1F1F] border border-white/20 hover:bg-[#D4C29A] transition-all"
                >
                  <Maximize2 size={18} />
                </button>
                </>
            )}
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-center">
            {productVideos.map((vidUrl: string, idx: number) => {
                const isValidVideo = vidUrl && vidUrl.trim() !== "";
                if (!isValidVideo) return null;

                return (
                  <button
                      key={`vid-${idx}`}
                      onClick={() => {
                          setActiveVideo(vidUrl);
                          setShowVideo(true);
                      }}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center bg-black ${
                          (showVideo && activeVideo === vidUrl) ? "border-[#D4C29A] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                      <Play size={24} className="text-white fill-current" />
                      <span className="absolute bottom-1 text-[8px] font-bold text-white uppercase">Video {productVideos.length > 1 ? idx + 1 : ""}</span>
                  </button>
                );
            })}

            {product.images && product.images.map((img: string, idx: number) => (
              <button
                key={`img-${idx}`}
                onClick={() => {
                    setActiveImage(img);
                    setShowVideo(false);
                }}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  (!showVideo && activeImage === img) ? "border-[#D4C29A] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* --- RIGHT: DETAILS --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 pt-4"
        >
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[#1F1F1F]/40 hover:text-[#1F1F1F] transition-colors font-bold uppercase tracking-wider">
            <ChevronLeft size={16} /> {t('back_to_shop')}
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-4 text-[#D4C29A] text-sm font-bold tracking-wider uppercase">
              <Star size={14} fill="currentColor" />
              {language === 'EN' && (product.category === "Floristenbedarf" || product.category === "supplies") ? "Florist Supplies" : product.category || "Luxury Collection"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1F1F1F]">
              {language === 'EN' && product.name_en ? product.name_en : product.name}
            </h1>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-bold text-[#1F1F1F]">€{totalPrice.toFixed(2)}</span>
              {isCurrentlyInStock ? (
                <span className="text-green-600 text-sm mb-1.5 flex items-center gap-1 font-bold"><Check size={14} /> {t('in_stock')} ({currentVariantStock})</span>
              ) : (
                <span className="text-red-600 text-sm mb-1.5 flex items-center gap-1 font-bold">{t('out_of_stock')}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-[#D4C29A]">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= avgRating ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs font-bold text-[#1F1F1F]/60 underline underline-offset-4">
                {reviews.length} {t('customer_reviews')}
              </span>
            </div>
          </div>

          <p className="text-[#1F1F1F]/60 font-medium leading-relaxed border-b border-black/5 pb-8 whitespace-pre-line">
            {language === 'EN' && product.description_en ? product.description_en : product.description}
          </p>

          {/* ✨ GRID LAYOUT FOR VARIANTS - FIXED */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-6">
              {product.variants.map((variant: any, idx: number) => {
                const values = variant.values ? variant.values.toString().split(',').map((s: string) => s.trim()) : [];
                return (
                  <div key={`${variant.name}-${idx}`}>
                    <label className="text-xs font-bold text-[#1F1F1F]/40 block mb-4 uppercase tracking-widest">{variant.name}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {values.map((val: string) => {
                        const isSelected = selectedOptions[variant.name] === val;
                        
                        // Parse "50 Roses (€100) | Stock: 5"
                        const cleanLabel = val.split('(')[0].split('|')[0].trim();
                        const subLabel = val.includes('(') ? val.split('(')[1].split(')')[0] : "";
                        const itemStockMatch = val.match(/\| Stock:\s*(\d+)/);
                        const itemStock = itemStockMatch ? parseInt(itemStockMatch[1]) : 999;

                        return (
                          <button
                            key={`${variant.name}-${val}`}
                            onClick={() => handleOptionSelect(variant.name, val)}
                            disabled={itemStock <= 0}
                            /* ✨ FORCED INLINE STYLING: Fixes text visibility and prevents black blob */
                            style={{
                              backgroundColor: isSelected ? "#1F1F1F" : (itemStock <= 0 ? "#F9F9F9" : "white"),
                              color: isSelected ? "white" : (itemStock <= 0 ? "#CCC" : "#1F1F1F"),
                              borderColor: isSelected ? "#1F1F1F" : "rgba(0,0,0,0.05)",
                              borderRadius: "1rem",
                              padding: "1rem",
                              borderWidth: "2px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              opacity: itemStock <= 0 ? 0.5 : 1,
                              cursor: itemStock <= 0 ? 'not-allowed' : 'pointer'
                            }}
                            className="font-bold text-sm shadow-sm hover:border-[#D4C29A]"
                          >
                            <span className="uppercase tracking-tight font-bold text-xs" style={{ color: "inherit" }}>{cleanLabel}</span>
                            {subLabel && (
                              <span style={{ fontSize: "9px", opacity: isSelected ? 0.6 : 1, color: isSelected ? "white" : "#D4C29A" }}>
                                {subLabel}
                              </span>
                            )}
                            {itemStock <= 5 && itemStock > 0 && (
                              <span className="text-[8px] mt-1 text-red-400 font-bold">Only {itemStock} left</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* ✨ PERSONALIZATION SECTION */}
          {product.needs_ribbon && (
            <div className="space-y-3 pt-6 border-t border-black/5 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-end">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4C29A]">
                  <span>{t('ribbon_label')}</span>
                </label>
              </div>

              <input 
                type="text" 
                placeholder={t('ribbon_placeholder')} 
                value={customText} 
                onChange={(e) => setCustomText(e.target.value)}
                className={`w-full bg-white border rounded-xl px-4 py-4 text-[#1F1F1F] font-bold focus:outline-none transition-all placeholder:text-gray-300 ${
                    !customText.trim() 
                    ? "border-red-200 focus:border-red-500" 
                    : "border-black/5 focus:border-[#D4C29A]"
                }`}
              />
              
              {!customText.trim() && (
                <p className="text-red-500 text-xs flex items-center gap-1 font-bold animate-pulse">
                  <AlertCircle size={12} /> {t('ribbon_error')}
                </p>
              )}
            </div>
          )}

          {product.extras && product.extras.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-black/5">
              <label className="text-xs font-bold text-[#1F1F1F]/40 block mb-2 uppercase tracking-widest">
                {t('customize_upgrade')}
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {product.extras.map((extra: any, idx: number) => {
                  const isSelected = selectedExtras.includes(extra.name);
                  
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center p-2 rounded-xl border transition-all ${
                        isSelected 
                          ? "bg-[#D4C29A]/10 border-[#D4C29A] shadow-sm" 
                          : "bg-white border-black/5 hover:border-black/20"
                      }`}
                    >
                        {extra.image && (
                            <div 
                                className="relative w-16 h-16 mr-4 flex-shrink-0 cursor-zoom-in group/zoom rounded-lg overflow-hidden border border-black/5"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setZoomImage(extra.image);
                                }}
                            >
                                <img src={extra.image} className="w-full h-full object-cover" alt={extra.name} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/zoom:opacity-100 flex items-center justify-center transition-all">
                                    <ZoomIn size={14} className="text-white" />
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => toggleExtra(extra.name)}
                            className="flex-1 flex items-center justify-between h-full text-left px-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                                isSelected ? "bg-[#D4C29A] border-[#D4C29A]" : "border-gray-300"
                                }`}>
                                {isSelected && <Check size={14} style={{ color: 'white' }} />}
                                </div>
                                
                                <span className={`text-sm font-bold ${isSelected ? "text-[#1F1F1F]" : "text-[#1F1F1F]/40"}`}>
                                {extra.name}
                                </span>
                            </div>
                            <span className="text-sm text-[#D4C29A] font-bold ml-2">+€{extra.price}</span>
                        </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-black/5 mt-4">
            <div className="flex items-center bg-white rounded-full border border-black/5 px-4 py-3 w-fit shadow-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-[#D4C29A] text-gray-300 transition-colors"><Minus size={18} /></button>
              <span className="w-12 text-center font-bold text-[#1F1F1F]">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-[#D4C29A] text-gray-300 transition-colors"><Plus size={18} /></button>
            </div>
            
            {/* ✨ LUXURY UPDATE: Cart Button remains Champagne Gold (#D4C29A) */}
            <button 
              onClick={handleAddToCart} 
              disabled={!canAddToCart} 
              className={`flex-1 font-bold rounded-full py-4 transition-all flex items-center justify-center gap-2 
                ${canAddToCart 
                  ? "bg-[#D4C29A] border-2 border-white shadow-[0_10px_20px_rgba(212,194,154,0.3)] hover:shadow-[0_15px_30px_rgba(212,194,154,0.5)] hover:bg-[#C4B28A] scale-100 active:scale-95 cursor-pointer text-white" 
                  : "bg-black/5 text-[#1F1F1F]/20 cursor-not-allowed border-2 border-transparent"
                }`}
            >
              <ShoppingBag size={20} className={canAddToCart ? "text-white" : "text-inherit"} />
              <span className={canAddToCart ? "text-white" : ""}>
                {canAddToCart 
                  ? `${t('add_to_cart')} - €${totalPrice.toFixed(2)}` 
                  : !isCurrentlyInStock ? t('out_of_stock') : !allOptionsSelected ? t('select_options') : t('ribbon_placeholder')}
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-24 border-t border-black/5 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('reviews_title')}</h2>
              <div className="flex items-center gap-2 text-[#D4C29A]">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={20} fill={s <= avgRating ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="font-bold text-[#1F1F1F]">
                  {avgRating.toFixed(1)} ({reviews.length} {language === 'EN' ? "reviews" : "Bewertungen"})
                </span>
              </div>
            </div>

            {/* ✅ Verified Review Logic */}
            {isVerifiedBuyer ? (
              <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-xs opacity-40">{t('write_review')}</h3>
                <input 
                  type="text" placeholder={language === 'EN' ? "Your Name" : "Dein Name"} required
                  className="w-full bg-[#F6EFE6] p-3 rounded-xl outline-none text-sm font-bold"
                  value={newReview.customer_name}
                  onChange={e => setNewReview({...newReview, customer_name: e.target.value})}
                />
                <div className="flex gap-2 text-[#D4C29A]">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                      <Star size={18} fill={newReview.rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea 
                  placeholder={language === 'EN' ? "Share your thoughts..." : "Teile deine Gedanken..."} required rows={3}
                  className="w-full bg-[#F6EFE6] p-3 rounded-xl outline-none text-sm font-medium"
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                />
                <button 
                  disabled={isSubmittingReview}
                  className="w-full bg-[#1F1F1F] text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {isSubmittingReview ? t('posting') : t('post_review')}
                </button>
              </form>
            ) : (
              <div className="bg-white/40 p-10 rounded-3xl border border-dashed border-[#D4C29A]/20 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-full flex items-center justify-center mx-auto">
                   <ShieldCheck className="text-[#D4C29A]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F1F1F] mb-1">
                    {language === 'EN' ? "Verified Reviews Only" : "Nur verifizierte Bewertungen"}
                  </h3>
                  <p className="text-xs text-[#1F1F1F]/40 font-medium leading-relaxed">
                    {language === 'EN' 
                      ? "To ensure absolute authenticity, reviews are exclusively restricted to verified buyers." 
                      : "Um absolute Authentizität zu gewährleisten, sind Bewertungen ausschließlich verifizierten Käufern vorbehalten."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-8">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-black/5 pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{review.customer_name}</span>
                      {review.is_verified && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          <Check size={10} strokeWidth={4} /> {language === 'EN' ? "Verified Buyer" : "Verifizierter Käufer"}
                        </span>
                      )}
                      {review.source !== 'website' && (
                        <span className="text-[10px] font-bold uppercase opacity-40 italic">via {review.source}</span>
                      )}
                    </div>
                    <div className="flex text-[#D4C29A]">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-[#1F1F1F]/70 leading-relaxed font-medium">"{review.comment}"</p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-black/5 rounded-[3rem] p-12">
                <p className="text-black/20 font-bold uppercase tracking-widest text-sm">
                  {t('no_reviews')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {(zoomImage || zoomVideo) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
            onClick={() => { setZoomImage(null); setZoomVideo(null); }} 
          >
            <button 
              onClick={() => { setZoomImage(null); setZoomVideo(null); }}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 z-50"
            >
              <X size={32} />
            </button>

            {zoomImage && (
                <motion.img 
                  src={zoomImage}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()} 
                />
            )}

            {zoomVideo && (
                <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="relative w-full max-w-4xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ✅ FIXED: Removed 'muted' so full sound plays in Zoom View */}
                    <video 
                        ref={videoRef}
                        src={zoomVideo} 
                        className="w-full max-h-[80vh] rounded-2xl shadow-2xl"
                        controls 
                        autoPlay 
                        loop={false} 
                    />
                    <div className="mt-4 text-center">
                        <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
                          {language === 'EN' ? "Sparkle View with Sound" : "Glanz-Ansicht mit Ton"}
                        </p>
                    </div>
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}