"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Check, ChevronLeft, Loader2, AlertCircle, Maximize2, X, ZoomIn, Play } from "lucide-react"; // ✨ Added Play icon
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext"; 
import { useLanguage } from "../../../context/LanguageContext"; // ✨ Added Language Import

export default function ProductPage() {
  const params = useParams();
  const { addToCart, setIsCartOpen } = useCart();
  const { language, t } = useLanguage(); // ✨ NEW: Access language and translation function
  const videoRef = useRef<HTMLVideoElement>(null); // ✨ NEW: Ref for lightbox video controls

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
        if (videos.length > 0) {
          setActiveVideo(videos[0]);
          setShowVideo(true);
        }

        // ✨ NEW: Fetch Reviews for this product
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', params.id)
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
    setShowVideo(false); // ✨ Switch to image view when a color is picked

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
      // ✨ Use logic for translated name
      name: language === 'EN' && product.name_en ? product.name_en : product.name, 
      price: calculateUnitTotal(),
      image: activeImage || "/placeholder.jpg",
      quantity: quantity,
      options: selectedOptions,
      extras: selectedExtras,
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
        is_verified: false
      }
    ]);

    if (!error) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
      setNewReview({ customer_name: "", rating: 5, comment: "" });
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

  const allOptionsSelected = product.variants 
    ? product.variants.every((v: any) => selectedOptions[v.name]) 
    : true;

  const isRibbonValid = customText.trim().length > 0;
  const canAddToCart = allOptionsSelected && isRibbonValid;

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
            className="relative aspect-[4/5] w-full bg-black rounded-[3rem] border border-black/5 flex items-center justify-center overflow-hidden group shadow-2xl"
          >
            {showVideo && activeVideo ? (
                <div className="relative w-full h-full cursor-zoom-in" onClick={() => setZoomVideo(activeVideo)}>
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
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-[#C9A24D] hover:text-black transition-all"
                >
                  <Maximize2 size={18} />
                </button>
                </>
            )}
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-center">
            {productVideos.map((vidUrl: string, idx: number) => (
                <button
                    key={`vid-${idx}`}
                    onClick={() => {
                        setActiveVideo(vidUrl);
                        setShowVideo(true);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center bg-black ${
                        (showVideo && activeVideo === vidUrl) ? "border-[#C9A24D] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                >
                    <Play size={24} className="text-white fill-current" />
                    <span className="absolute bottom-1 text-[8px] font-bold text-white uppercase">Video {productVideos.length > 1 ? idx + 1 : ""}</span>
                </button>
            ))}

            {product.images && product.images.map((img: string, idx: number) => (
              <button
                key={`img-${idx}`}
                onClick={() => {
                    setActiveImage(img);
                    setShowVideo(false);
                }}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  (!showVideo && activeImage === img) ? "border-[#C9A24D] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
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
            <div className="flex items-center gap-2 mb-4 text-[#C9A24D] text-sm font-bold tracking-wider uppercase">
              <Star size={14} fill="currentColor" />
              {language === 'EN' && product.category === "Floristenbedarf" ? "Florist Supplies" : product.category || "Luxury Collection"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1F1F1F]">
              {language === 'EN' && product.name_en ? product.name_en : product.name}
            </h1>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-bold text-[#1F1F1F]">€{totalPrice.toFixed(2)}</span>
              {product.stock > 0 ? (
                <span className="text-green-600 text-sm mb-1.5 flex items-center gap-1 font-bold"><Check size={14} /> {t('in_stock')}</span>
              ) : (
                <span className="text-red-600 text-sm mb-1.5 flex items-center gap-1 font-bold">{t('out_of_stock')}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-[#C9A24D]">
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

          {product.variants && product.variants.length > 0 && (
            <div className="space-y-6">
              {product.variants.map((variant: any, idx: number) => {
                const values = variant.values ? variant.values.toString().split(',').map((s: string) => s.trim()) : [];
                return (
                  <div key={`${variant.name}-${idx}`}>
                    <label className="text-xs font-bold text-[#1F1F1F]/40 block mb-3 uppercase tracking-widest">{variant.name}</label>
                    <div className="flex flex-wrap gap-3">
                      {values.map((val: string) => {
                        const isSelected = selectedOptions[variant.name] === val;
                        return (
                          <button
                            key={`${variant.name}-${val}`}
                            onClick={() => handleOptionSelect(variant.name, val)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center ${
                              isSelected
                                ? "bg-[#1F1F1F] border-[#1F1F1F] shadow-lg"
                                : "bg-white text-[#1F1F1F]/40 border-black/5 hover:border-[#1F1F1F] hover:text-[#1F1F1F]"
                            }`}
                          >
                            <span 
                                style={{ 
                                    color: isSelected ? 'white !important' : 'inherit',
                                    fontWeight: isSelected ? '800' : '500' 
                                }}
                                className={isSelected ? "!text-white" : ""}
                            >
                                {val}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="space-y-3 pt-6 border-t border-black/5">
            <div className="flex justify-between items-end">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A24D]">
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
                  : "border-black/5 focus:border-[#C9A24D]"
              }`}
            />
            
            {!customText.trim() && (
              <p className="text-red-500 text-xs flex items-center gap-1 font-bold animate-pulse">
                <AlertCircle size={12} /> {t('ribbon_error')}
              </p>
            )}
          </div>

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
                          ? "bg-[#C9A24D]/10 border-[#C9A24D] shadow-sm" 
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
                                isSelected ? "bg-[#C9A24D] border-[#C9A24D]" : "border-gray-300"
                                }`}>
                                {isSelected && <Check size={14} style={{ color: 'white' }} />}
                                </div>
                                
                                <span className={`text-sm font-bold ${isSelected ? "text-[#1F1F1F]" : "text-[#1F1F1F]/40"}`}>
                                {extra.name}
                                </span>
                            </div>
                            <span className="text-sm text-[#C9A24D] font-bold ml-2">+€{extra.price}</span>
                        </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-black/5 mt-4">
            <div className="flex items-center bg-white rounded-full border border-black/5 px-4 py-3 w-fit shadow-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-[#C9A24D] text-gray-300 transition-colors"><Minus size={18} /></button>
              <span className="w-12 text-center font-bold text-[#1F1F1F]">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-[#C9A24D] text-gray-300 transition-colors"><Plus size={18} /></button>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              disabled={!canAddToCart} 
              className={`flex-1 font-bold rounded-full py-4 transition-all flex items-center justify-center gap-2 ${
                canAddToCart 
                  ? "bg-[#1F1F1F] text-white shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer" 
                  : "bg-black/5 text-[#1F1F1F]/20 cursor-not-allowed"
              }`}
            >
              <ShoppingBag size={20} style={{ color: canAddToCart ? 'white !important' : 'inherit' }} />
              <span 
                className={canAddToCart ? "!text-white" : ""}
                style={{ color: canAddToCart ? 'white !important' : 'inherit' }}
              >
                {canAddToCart 
                  ? `${t('add_to_cart')} - €${totalPrice.toFixed(2)}` 
                  : !allOptionsSelected ? t('select_options') : t('ribbon_placeholder')}
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ✨ REVIEWS SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 pt-24 border-t border-black/5 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('reviews_title')}</h2>
              <div className="flex items-center gap-2 text-[#C9A24D]">
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

            <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-xs opacity-40">{t('write_review')}</h3>
              <input 
                type="text" placeholder={language === 'EN' ? "Your Name" : "Dein Name"} required
                className="w-full bg-[#F6EFE6] p-3 rounded-xl outline-none text-sm font-bold"
                value={newReview.customer_name}
                onChange={e => setNewReview({...newReview, customer_name: e.target.value})}
              />
              <div className="flex gap-2 text-[#C9A24D]">
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
                    <div className="flex text-[#C9A24D]">
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
                    <video 
                        ref={videoRef}
                        src={zoomVideo} 
                        className="w-full max-h-[80vh] rounded-2xl shadow-2xl"
                        controls 
                        autoPlay 
                        loop 
                    />
                    <div className="mt-4 text-center">
                        <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Sparkle View Active</p>
                    </div>
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}