"use client";

import { motion } from "framer-motion";
import { Plus, ShoppingBag, Video, Tag, Sparkles, Heart } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image"; // ✨ PERFORMANCE FIX: Import Next.js Image
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext"; 
import { useWishlist } from "../context/WishlistContext"; 

interface ProductProps {
  id: number;
  title: string;
  price: number | string; 
  salePrice?: number;     
  isOnSale?: boolean;     
  globalDiscount?: number;
  category: string;
  image: string;
  delay: number;
  videoUrl?: string | string[];
  promoLabel?: string; 
  stock?: number; 
}

export default function ProductCard({ 
  id, title, price, salePrice, isOnSale, globalDiscount, 
  category, image, delay, videoUrl, promoLabel, stock 
}: ProductProps) {
  
  const { language } = useLanguage(); 
  const { addToCart } = useCart(); 
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(); 
  
  const videoSrc = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl;
  const hasVideo = videoSrc && videoSrc.trim().length > 0;

  const translatedCategory = language === 'EN' && category === 'Floristenbedarf' ? 'Florist Supplies' : category;

  const originalPrice = Number(price);
  let finalPrice = originalPrice;
  let isDiscounted = false;

  if (globalDiscount && globalDiscount > 0) {
    finalPrice = originalPrice * (1 - globalDiscount / 100);
    isDiscounted = true;
  } 
  else if (isOnSale && salePrice) {
    finalPrice = salePrice;
    isDiscounted = true;
  }

  // ✨ Handle Quick Add to Cart with Stock Check
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();

    // ✨ Fix: If stock is -1, treat as unlimited (999)
    const availableStock = stock === -1 ? 999 : (typeof stock === 'number' ? stock : 0);

    addToCart({ 
      productId: id, 
      uniqueId: `${id}-${Date.now()}`, // Simple unique ID for quick add (no variants)
      name: title, 
      price: finalPrice, 
      image, 
      category, 
      quantity: 1, 
      options: {},
      extras: [],
      promoLabel,
      maxStock: availableStock 
    });
  };

  // Handle Wishlist Toggle
  const isLiked = isInWishlist(id.toString()); // Ensure ID is string for context match

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (isLiked) {
        removeFromWishlist(id.toString());
    } else {
        addToWishlist({
            id: id.toString(),
            title,
            price: originalPrice,
            salePrice,
            isOnSale,
            image,
            category,
            videoUrl,
            promoLabel,
            stock
        });
    }
  };

  // ✨ Check if Out of Stock (0 and NOT -1)
  const isOutOfStock = stock === 0;

  return (
    <Link href={`/product/${id}`} className="block h-full"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.5 }}
        className="group relative h-full bg-white/60 border border-black/5 rounded-2xl overflow-hidden hover:border-black/10 transition-all duration-300 flex flex-col"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent to-[#C9A24D]/10 pointer-events-none" />

        <div className="h-72 w-full bg-black/10 flex items-center justify-center relative overflow-hidden">
          
          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
            {/* SALE BADGE */}
            {isDiscounted && (
              <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Tag size={10} fill="white" /> SALE
              </div>
            )}

            {/* PROMOTION BADGE (Buy 2 Get 1, etc.) */}
            {promoLabel && (
              <div className="bg-white text-[#1F1F1F] border border-[#C9A24D] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-in slide-in-from-left-2 fade-in duration-500">
                <Sparkles size={10} className="text-[#C9A24D]" /> 
                {promoLabel}
              </div>
            )}
          </div>

          {/* ✨ WISHLIST BUTTON (Top Right) - Updated to Pink */}
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-transform active:scale-95 group/heart"
          >
            <Heart 
              size={16} 
              className={`transition-colors ${isLiked ? "fill-[#E76A8D] text-[#E76A8D]" : "text-[#1F1F1F] group-heart:text-[#E76A8D]"}`} 
            />
          </button>

          {hasVideo ? (
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              poster={image}
              className={`w-full h-full object-cover transition-all duration-700 ease-out ${isOutOfStock ? "grayscale opacity-50" : "opacity-90 group-hover:scale-110 group-hover:opacity-100"}`}
            />
          ) : (
            // ✨ PERFORMANCE FIX: Replaced <img> with Next.js <Image />
            <div className={`relative w-full h-full transition-all duration-700 ease-out ${isOutOfStock ? "grayscale opacity-50" : "opacity-90 group-hover:scale-110 group-hover:opacity-100"}`}>
                <Image 
                  src={image} 
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />
            </div>
          )}
          
          {hasVideo && (
            <div className="absolute bottom-3 left-3 z-20 bg-[#1F1F1F] backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-2xl">
              <Video size={12} style={{ color: '#C9A24D' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white" style={{ color: 'white' }}>
                {language === 'EN' ? "Video" : "Video"}
              </span>
            </div>
          )}

          {/* ✨ Out of Stock Overlay */}
          {isOutOfStock && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
                 <div className="bg-black/80 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-xl backdrop-blur-md">
                     {language === 'EN' ? "Sold Out" : "Ausverkauft"}
                 </div>
             </div>
          )}

          {!isOutOfStock && (
              <ShoppingBag 
                className="absolute z-10 text-white/0 group-hover:text-white/80 transition-all duration-300 drop-shadow-lg transform scale-50 group-hover:scale-100" 
                size={48} 
                style={{ color: 'white' }} 
              />
          )}

          {/* Quick Add Button - Hidden if Out of Stock */}
          {!isOutOfStock && (
              <button 
                onClick={handleAddToCart}
                className="absolute bottom-4 right-4 w-10 h-10 bg-[#C9A24D] text-white border-2 border-white rounded-full flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-[0_0_15px_rgba(201,162,77,0.5)] z-20"
              >
                <Plus 
                  size={20} 
                  style={{ color: 'white' }} 
                  className="!text-white" 
                />
              </button>
          )}
        </div>

        {/* FIXED: Reduced padding from py-3 to py-2 to make the white area thinner */}
        <div className="px-4 py-2 flex-1 flex flex-col justify-end">
          <p className="text-[10px] text-[#1F1F1F]/60 uppercase tracking-widest mb-1 font-bold">{translatedCategory}</p>
          <h3 className="text-sm font-bold text-[#1F1F1F] mb-1 group-hover:text-[#C9A24D] transition-colors leading-tight">{title}</h3>
          
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
                {isDiscounted ? (
                <>
                    <span className="text-red-600 font-bold text-sm">€{finalPrice.toFixed(2)}</span>
                    <span className="text-xs text-[#1F1F1F]/40 line-through decoration-red-400/50">€{originalPrice.toFixed(2)}</span>
                </>
                ) : (
                <p className="text-[#1F1F1F] font-semibold text-sm">€{originalPrice.toFixed(2)}</p>
                )}
            </div>
            
            {/* ✨ Low Stock Warning */}
            {stock !== -1 && stock !== undefined && stock > 0 && stock <= 5 && (
                <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                    {language === 'EN' ? `Only ${stock} left` : `Nur noch ${stock}`}
                </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  ); 
}