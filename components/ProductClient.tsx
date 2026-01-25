"use client";

import { useState, useEffect, useRef } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Check, ChevronLeft, Loader2, AlertCircle, Maximize2, X, ZoomIn, Play, ShieldCheck, Tag, Truck, Sparkles, PenTool, Heart, FileText, Type, MessageSquare, Hash, ArrowLeft, ShieldAlert, ChevronDown } from "lucide-react"; // ✨ Added ShieldAlert and ChevronDown
import Image from "next/image"; 
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation"; 
import Navbar from "./Navbar"; // Adjusted path for components folder
import { supabase } from "../lib/supabase"; // Adjusted path
import { useCart } from "../context/CartContext"; // Adjusted path
import { useLanguage } from "../context/LanguageContext"; // Adjusted path
import { useWishlist } from "../context/WishlistContext"; // Adjusted path
import RelatedProducts from "./RelatedProducts"; // Adjusted path

interface ProductClientProps {
  initialProduct: any;
  initialSettings: any;
  initialReviews: any[];
}

export default function ProductClient({ initialProduct, initialSettings, initialReviews }: ProductClientProps) {
  const params = useParams();
  const searchParams = useSearchParams(); 
  const { addToCart, setIsCartOpen } = useCart();
  const { language, t } = useLanguage(); 
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(); 
  const videoRef = useRef<HTMLVideoElement>(null); 

  const isVerifiedBuyer = searchParams.get('verify') === 'true';

  // Initialize state with data passed from Server
  const [product, setProduct] = useState<any>(initialProduct);
  const [globalSettings, setGlobalSettings] = useState<any>(initialSettings); 
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  
  const [newReview, setNewReview] = useState({ customer_name: "", rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [activeImage, setActiveImage] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<string | null>(null); 
  const [showVideo, setShowVideo] = useState<boolean>(false); 
  
  const [zoomImage, setZoomImage] = useState<string | null>(null); 
  const [zoomVideo, setZoomVideo] = useState<string | null>(null); 
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // --- PERSONALIZATION STATES ---
  const [customText, setCustomText] = useState(""); 
  const [textPlacement, setTextPlacement] = useState<'option1' | 'option2'>('option1');
  const [letterText, setLetterText] = useState("");
  const [letterFont, setLetterFont] = useState<'Classic' | 'Modern' | 'Handwritten'>('Classic');
  const [shortNoteText, setShortNoteText] = useState("");

  // ✨ NEW: Safety Reveal State
  const [showSafety, setShowSafety] = useState(false);

  // ✨ NEW: Legal Checkbox State
  const [withdrawalAccepted, setWithdrawalAccepted] = useState(false);

  // State for selected Extras
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
  const [extraVariants, setExtraVariants] = useState<Record<string, string | string[]>>({});
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});

  // Initialize Active Image on Mount
  useEffect(() => {
    if (product) {
        if (product.images && product.images.length > 0) setActiveImage(product.images[0]);
        
        const videos = Array.isArray(product.video_url) ? product.video_url : (product.video_url ? [product.video_url] : []);
        if (videos.length > 0 && videos[0] && videos[0].trim() !== "") {
          setActiveVideo(videos[0]);
          setShowVideo(true);
        }
    }
  }, [product]);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    
    // ✨ FIX START: Check for Color OR Supply Category
    const isColorVariant = optionName.toLowerCase().includes('color') || optionName.toLowerCase().includes('farbe') || optionName.toLowerCase().includes('colour');
    const isSupplyProduct = product.category === 'supplies' || product.category === 'Floristenbedarf';

    // Allow image switching if it's a color variant OR if it's a supply product (Ribbons, etc.)
    if ((isColorVariant || isSupplyProduct) && product?.images && product.images.length > 0) {
      setShowVideo(false); 
      const variant = product.variants.find((v: any) => v.name === optionName);
      
      if (variant && variant.values) {
        const valuesArray = variant.values.toString().split(',').map((s: string) => s.trim());
        const clickedIndex = valuesArray.indexOf(value);
        // Only switch if an image exists at that index
        if (product.images[clickedIndex]) {
          setActiveImage(product.images[clickedIndex]);
        }
      }
    }
    // ✨ FIX END
  };

  const toggleExtra = (extraName: string) => {
    let limit = 100;

    // ✨ BUG FIX: Strictly check for size 20 (ignore 200, 120, etc.)
    const isTwentyRoses = Object.values(selectedOptions).some(val => {
         // Find the first number in the string (e.g., "20 Roses" -> 20, "200 Roses" -> 200)
         const match = val.match(/\d+/);
         if (match) {
             // If the number is exactly 20, return true
             return parseInt(match[0]) === 20;
         }
         return false;
    });

    if (isTwentyRoses) {
        limit = 4; 
    }

    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(prev => prev.filter(e => e !== extraName)); 
      
      const newVariants = { ...extraVariants };
      delete newVariants[extraName];
      setExtraVariants(newVariants);
      
      const newQuantities = { ...extraQuantities };
      delete newQuantities[extraName];
      setExtraQuantities(newQuantities);

      const extraObj = product.extras.find((e: any) => e.name === extraName);
      if (extraObj?.inputType === 'letter' || extraName.toLowerCase().includes("letter")) setLetterText("");
      if (extraObj?.inputType === 'short_note' || extraName.toLowerCase().includes("note")) setShortNoteText("");

    } else {
      if (selectedExtras.length < limit) {
        setSelectedExtras(prev => [...prev, extraName]); 
        setExtraQuantities(prev => ({ ...prev, [extraName]: 1 }));
      } else {
        alert(language === 'EN' 
          ? `For the 20 Roses size, you can select up to ${limit} extras.` 
          : `Für die Größe 20 Rosen können Sie maximal ${limit} Extras auswählen.`);
      }
    }
  };

  const updateExtraQuantity = (extraName: string, delta: number) => {
      setExtraQuantities(prev => {
          const current = prev[extraName] || 1;
          const newQty = Math.max(1, current + delta);
          return { ...prev, [extraName]: Math.min(newQty, 50) };
      });
  };

  const selectExtraVariant = (extra: any, variant: string) => {
    setExtraVariants(prev => {
        const currentVal = prev[extra.name];

        if (extra.allowMultiple) {
            const currentList = Array.isArray(currentVal) 
                ? currentVal 
                : (currentVal ? [currentVal] : []);

            if (currentList.includes(variant)) {
                return { ...prev, [extra.name]: currentList.filter(v => v !== variant) };
            } else {
                return { ...prev, [extra.name]: [...currentList, variant] };
            }
        } else {
            return { ...prev, [extra.name]: variant };
        }
    });
  };

  const handleShortNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const words = val.trim().split(/\s+/);
      if (val === "" || words.length <= 5 || (words.length === 6 && val.endsWith(" "))) {
          setShortNoteText(val);
      }
  };

  const getSelectedVariantStock = () => {
    if (!product || !product.variants || product.variants.length === 0) {
        return product.stock === -1 ? 999 : (product.stock || 0);
    }

    const matrix = Array.isArray(product.stock_matrix) ? product.stock_matrix : [];

    if (matrix.length > 0) {
        const match = matrix.find((item: any) => {
            return Object.keys(selectedOptions).every(key => {
                const selectedClean = selectedOptions[key].split('|')[0].trim();
                return item[key] === selectedClean;
            });
        });

        if (match) {
            return match.stock === -1 ? 999 : match.stock;
        }
        
        const hasAnyStock = matrix.some((item: any) => item.stock === -1 || item.stock > 0);
        if (hasAnyStock) return 999;
    }
    
    return 0;
  };

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

  const getDiscountedBasePrice = (basePrice: number) => {
    if (globalSettings?.is_global_sale_active) {
        return basePrice * (1 - (globalSettings.global_discount_percentage / 100));
    }
    if (product?.is_on_sale && product.sale_price) {
        if (Math.abs(basePrice - product.price) < 0.01) return product.sale_price;
        const discountFactor = product.sale_price / product.price;
        return basePrice * discountFactor;
    }
    return basePrice;
  };

  const calculateUnitTotal = () => {
    const base = getBasePrice(); 
    const discountedBase = getDiscountedBasePrice(base); 
    
    let extrasCost = 0;
    if (product.extras && Array.isArray(product.extras)) {
      product.extras.forEach((extra: any) => {
        if (selectedExtras.includes(extra.name)) {
          const qty = extra.allowQuantity ? (extraQuantities[extra.name] || 1) : 1;
          
          let variantCount = 1;
          const variants = extraVariants[extra.name];
          if (extra.allowMultiple && Array.isArray(variants)) {
              variantCount = Math.max(1, variants.length);
          }

          extrasCost += (extra.price * qty * variantCount);
        }
      });
    }
    return discountedBase + extrasCost;
  };

  const calculateOriginalUnitTotal = () => {
    const base = getBasePrice();
    let extrasCost = 0;
    if (product.extras && Array.isArray(product.extras)) {
      product.extras.forEach((extra: any) => {
        if (selectedExtras.includes(extra.name)) {
          const qty = extra.allowQuantity ? (extraQuantities[extra.name] || 1) : 1;
          
          let variantCount = 1;
          const variants = extraVariants[extra.name];
          if (extra.allowMultiple && Array.isArray(variants)) {
              variantCount = Math.max(1, variants.length);
          }

          extrasCost += (extra.price * qty * variantCount);
        }
      });
    }
    return base + extrasCost;
  };

  const getLabel1 = () => product?.pers_label_1 || (language === 'EN' ? "On Ribbon" : "Auf Schleife");
  const getLabel2 = () => product?.pers_label_2 || (language === 'EN' ? "On Paper" : "Auf Papier");

  const getTranslatedOptionName = (variant: any) => {
      if (language === 'EN' && variant.name_en) return variant.name_en;
      return variant.name;
  };

  const getTranslatedValues = (variant: any) => {
      if (language === 'EN' && variant.values_en) {
          return variant.values_en.split(',').map((s: string) => s.trim());
      }
      return variant.values.toString().split(',').map((s: string) => s.trim());
  };

  const handleAddToCart = () => {
    if (!product) return;

    const unitPrice = calculateUnitTotal();
    const translatedOptions: Record<string, string> = {};
    const dbOptions: Record<string, string> = {};

    Object.keys(selectedOptions).forEach(key => {
        const variant = product.variants.find((v: any) => v.name === key);
        dbOptions[key] = selectedOptions[key].split('|')[0].trim();

        if (variant) {
             const selectedValDE = selectedOptions[key];
             const deValues = variant.values.split(',').map((s: string) => s.trim());
             const index = deValues.indexOf(selectedValDE);
             
             let finalValue = selectedValDE;
             if (language === 'EN' && variant.values_en) {
                 const enValues = variant.values_en.split(',').map((s: string) => s.trim());
                 if (enValues[index]) finalValue = enValues[index];
             }
             
             const finalKey = language === 'EN' && variant.name_en ? variant.name_en : variant.name;
             translatedOptions[finalKey] = finalValue.split('|')[0].trim();
        } else {
             translatedOptions[key] = selectedOptions[key];
        }
    });

    const optionsKey = JSON.stringify(translatedOptions);
    
    const finalExtras = selectedExtras.map(extraName => {
        const extraObj = product.extras.find((e: any) => e.name === extraName);
        const displayName = (language === 'EN' && extraObj?.name_en) ? extraObj.name_en : extraName;
        const variantData = extraVariants[extraName];
        let nameString = displayName;

        if (Array.isArray(variantData) && variantData.length > 0) {
            nameString = `${displayName} (${variantData.join(', ')})`;
        } else if (typeof variantData === 'string' && variantData) {
            nameString = `${displayName} (${variantData})`;
        }

        if (extraObj?.allowQuantity && extraQuantities[extraName] > 1) {
            nameString += ` (x${extraQuantities[extraName]})`;
        }
        return nameString;
    }).sort();

    const extrasKey = JSON.stringify(finalExtras);
    
    let finalCustomText = "";
    if (customText.trim() !== "") {
        const placementLabel = textPlacement === 'option1' ? getLabel1() : getLabel2();
        finalCustomText += `Ribbon (${placementLabel}): ${customText}`;
    }
    if (letterText.trim() !== "") {
        if (finalCustomText) finalCustomText += " | ";
        finalCustomText += `Letter (${letterFont} Font): ${letterText}`;
    }
    if (shortNoteText.trim() !== "") {
        if (finalCustomText) finalCustomText += " | ";
        finalCustomText += `Short Note: ${shortNoteText}`;
    }

    const uniqueId = `${product.id}-${optionsKey}-${extrasKey}-${finalCustomText}`;

    addToCart({
      productId: product.id,
      uniqueId,
      name: language === 'EN' && product.name_en ? product.name_en : product.name, 
      price: unitPrice,
      image: activeImage || "/placeholder.jpg",
      quantity: quantity,
      options: translatedOptions, 
      rawOptions: dbOptions,
      extras: finalExtras, 
      category: product.category,
      customText: finalCustomText, 
      promoLabel: product.promo_label,
      maxStock: getSelectedVariantStock()
    });
    
    setIsCartOpen(true);
  };

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
        is_verified: true, 
        status: 'pending' 
      }
    ]);
    if (!error) {
      setNewReview({ customer_name: "", rating: 5, comment: "" });
    }
    setIsSubmittingReview(false);
  };

  if (!product) return null;

  const unitPrice = calculateUnitTotal();
  const originalUnitPrice = calculateOriginalUnitTotal();
  const totalPrice = unitPrice * quantity;
  const originalTotalPrice = originalUnitPrice * quantity;
  const isOnSale = unitPrice < originalUnitPrice; 
  const currentVariantStock = getSelectedVariantStock(); 
  const allOptionsSelected = product.variants ? product.variants.every((v: any) => selectedOptions[v.name]) : true;

  const hasRibbonExtraSelected = selectedExtras.some(extraName => {
    const e = extraName.toLowerCase();
    if (e.includes("mini")) return false; 
    return e.includes("ribbon") || e.includes("band") || e.includes("personalisieren") || e.includes("personal");
  });

  const hasLetterExtraSelected = selectedExtras.some(extraName => {
    const extraObj = product.extras.find((e: any) => e.name === extraName);
    const e = extraName.toLowerCase();
    return extraObj?.inputType === 'letter' || e.includes("letter") || e.includes("brief");
  });

  const hasShortNoteExtraSelected = selectedExtras.some(extraName => {
    const extraObj = product.extras.find((e: any) => e.name === extraName);
    const e = extraName.toLowerCase();
    return extraObj?.inputType === 'short_note' || e.includes("note") || e.includes("notiz") || e.includes("karte") || e.includes("card");
  });

  const isRibbonInputVisible = product.needs_ribbon === true || hasRibbonExtraSelected;
  const isLetterInputVisible = hasLetterExtraSelected;
  const isShortNoteInputVisible = hasShortNoteExtraSelected;
  const isRibbonValid = isRibbonInputVisible ? customText.trim().length > 0 : true;
  
  // ✨ Check if the product is personalized (triggers the withdrawal check)
  const isPersonalizedOrder = 
      customText.trim().length > 0 || 
      letterText.trim().length > 0 || 
      shortNoteText.trim().length > 0 ||
      selectedExtras.length > 0;

  const isCurrentlyInStock = currentVariantStock > 0; 
  
  // ✨ Updated Logic: Requires checkbox if personalized
  const canAddToCart = allOptionsSelected && isRibbonValid && isCurrentlyInStock && (!isPersonalizedOrder || withdrawalAccepted);
  
  const isSupplyProduct = product.category === 'supplies' || product.category === 'Floristenbedarf';
  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5.0;
  const productVideos = Array.isArray(product.video_url) ? product.video_url : (product.video_url ? [product.video_url] : []);
  const hasPromo = product.promo_label && product.promo_label.length > 0;
  const isLiked = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (isLiked) {
        removeFromWishlist(product.id);
    } else {
        addToWishlist({
            id: product.id,
            title: language === 'EN' && product.name_en ? product.name_en : product.name,
            price: product.price,
            salePrice: product.sale_price,
            isOnSale: product.is_on_sale,
            image: activeImage || "/placeholder.jpg",
            category: product.category,
            videoUrl: product.video_url,
            promoLabel: product.promo_label,
            stock: product.stock
        });
    }
  };

  const activeColor = selectedOptions['Color'] || selectedOptions['Farbe'] || selectedOptions['Colour'] || "";

  // ✨ NEW: Extract the correct safety text based on language
  const safetyText = language === 'EN' ? product.safety_instructions_en : product.safety_instructions_de;
  const hasSafetyInstructions = safetyText && safetyText.trim().length > 0;

  return (
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] selection:bg-[#C9A24D] selection:text-white pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link 
            href={product.category ? `/shop?category=${encodeURIComponent(product.category)}` : "/shop"}
            className="inline-flex items-center gap-2 text-[#1F1F1F]/60 hover:text-[#1F1F1F] transition-colors font-bold uppercase tracking-widest text-xs mb-8 group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'EN' ? `Back to ${product.category || 'Shop'}` : `Zurück zu ${product.category || 'Shop'}`}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* --- LEFT: IMAGES & VIDEO --- */}
            <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative aspect-[4/5] w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(255,255,255,0.8),0_0_20px_rgba(201,162,77,0.1)] border border-white flex items-center justify-center overflow-hidden group"
            >
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                    {isOnSale && (
                        <div className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Tag size={12} fill="white" /> SALE
                        </div>
                    )}
                    {hasPromo && (
                        <div className="bg-white text-[#1F1F1F] border border-[#C9A24D] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-md flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-700">
                            <Sparkles size={12} className="text-[#C9A24D]" /> 
                            {product.promo_label}
                        </div>
                    )}
                </div>

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
                        <motion.div
                            key={activeImage}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1.0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full relative"
                        >
                            <Image 
                                src={activeImage || "/placeholder.jpg"}
                                alt={product.name || "Product Image"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw" 
                                priority
                            />
                        </motion.div>
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
                        onClick={() => { setActiveVideo(vidUrl); setShowVideo(true); }}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center bg-black ${
                            (showVideo && activeVideo === vidUrl) ? "border-[#D4C29A] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                        <Play size={24} className="text-white fill-current" />
                    </button>
                    );
                })}
                {product.images && product.images.map((img: string, idx: number) => (
                <button
                    key={`img-${idx}`}
                    onClick={() => { setActiveImage(img); setShowVideo(false); }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                    (!showVideo && activeImage === img) ? "border-[#D4C29A] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                >
                    <div className="relative w-full h-full aspect-square">
                        <Image 
                            src={img} 
                            alt="Thumbnail" 
                            fill
                            className="object-cover" 
                            sizes="80px"
                        />
                    </div>
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
            <div>
                <div className="flex items-center gap-2 mb-4 text-[#D4C29A] text-sm font-bold tracking-wider uppercase">
                <Star size={14} fill="currentColor" />
                {language === 'EN' && (product.category === "Floristenbedarf" || product.category === "supplies") ? "Florist Supplies" : product.category || "Luxury Collection"}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1F1F1F]">
                {language === 'EN' && product.name_en ? product.name_en : product.name}
                </h1>
                
                <div className="flex items-end gap-4">
                <div className="flex flex-col">
                    {isOnSale && (
                        <span className="text-lg text-red-400 font-bold line-through decoration-2 opacity-60">
                            €{originalTotalPrice.toFixed(2)}
                        </span>
                    )}
                    <span className={`text-3xl font-bold ${isOnSale ? "text-red-600" : "text-[#1F1F1F]"}`}>
                        €{totalPrice.toFixed(2)}
                    </span>
                </div>
                {isCurrentlyInStock ? (
                    <span className="text-green-600 text-sm mb-1.5 flex items-center gap-1 font-bold"><Check size={14} /> {t('in_stock')} {currentVariantStock < 900 && `(${currentVariantStock})`}</span>
                ) : (
                    <span className="text-red-600 text-sm mb-1.5 flex items-center gap-1 font-bold">{t('out_of_stock')}</span>
                )}
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-[#D4C29A]">
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={14} fill={s <= avgRating ? "currentColor" : "none"} />))}
                </div>
                <span className="text-xs font-bold text-[#1F1F1F]/60 underline underline-offset-4">
                    {reviews.length} {t('customer_reviews')}
                </span>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[#1F1F1F]/60 font-medium leading-relaxed whitespace-pre-line">
                    {language === 'EN' && product.description_en ? product.description_en : product.description}
                </p>

                {/* ✨ NEW: CARE & SAFETY REVEAL SECTION */}
                {hasSafetyInstructions && (
                    <div className="pt-2">
                        <button 
                            type="button"
                            onClick={() => setShowSafety(!showSafety)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4C29A] hover:text-[#1F1F1F] transition-colors group"
                        >
                            <ShieldAlert size={14} /> 
                            {language === 'EN' ? "Care & Safety Instructions" : "Pflege- & Sicherheitshinweise"}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showSafety ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                            {showSafety && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 p-4 bg-white/50 border border-[#D4C29A]/20 rounded-2xl">
                                        <p className="text-xs text-[#1F1F1F]/70 font-medium leading-relaxed italic whitespace-pre-line">
                                            {safetyText}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* VARIANTS */}
            {product.variants && product.variants.length > 0 && (
                <div className="space-y-6">
                {product.variants.map((variant: any, idx: number) => {
                    const values = getTranslatedValues(variant);
                    const deValues = variant.values.toString().split(',').map((s: string) => s.trim());
                    return (
                    <div key={`${variant.name}-${idx}`}>
                        <label className="text-xs font-bold text-[#1F1F1F]/40 block mb-4 uppercase tracking-widest">
                            {getTranslatedOptionName(variant)}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {values.map((val: string, valIdx: number) => {
                            const deVal = deValues[valIdx];
                            const isSelected = selectedOptions[variant.name] === deVal;
                            const cleanLabel = val.split('(')[0].split('|')[0].trim();
                            const subLabel = val.includes('(') ? val.split('(')[1].split(')')[0] : "";
                            
                            let itemStock = 999; 
                            const matrix = Array.isArray(product.stock_matrix) ? product.stock_matrix : [];
                            if(matrix.length > 0) {
                                const match = matrix.find((m: any) => m[variant.name] === deVal.split('|')[0].trim());
                                if(match) itemStock = match.stock === -1 ? 999 : match.stock;
                            }

                            return (
                            <button
                                key={`${variant.name}-${val}`}
                                onClick={() => handleOptionSelect(variant.name, deVal)}
                                disabled={itemStock <= 0}
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
                                {subLabel && (<span style={{ fontSize: "9px", opacity: isSelected ? 0.6 : 1, color: isSelected ? "white" : "#D4C29A" }}>{subLabel}</span>)}
                                {itemStock <= 5 && itemStock > 0 && (<span className="text-[8px] mt-1 text-red-400 font-bold">Only {itemStock} left</span>)}
                            </button>
                            );
                        })}
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
            
            {/* EXTRAS */}
            {product.extras && product.extras.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                <label className="text-xs font-bold text-[#1F1F1F]/40 block mb-2 uppercase tracking-widest">
                    {t('customize_upgrade')}
                </label>
                
                <div className="grid grid-cols-1 gap-3">
                    {product.extras.map((extra: any, idx: number) => {
                    const isSelected = selectedExtras.includes(extra.name);
                    const extraDisplayName = (language === 'EN' && extra.name_en) ? extra.name_en : extra.name;
                    const quantity = extraQuantities[extra.name] || 1;

                    return (
                        <div key={idx} className="flex flex-col gap-2">
                            <div 
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
                                            <Image src={extra.image} alt={extra.name} width={64} height={64} className="w-full h-full object-cover" />
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
                                            {extraDisplayName}
                                        </span>
                                    </div>
                                    
                                    <span className={`text-sm font-bold ml-2 ${extra.price < 0 ? "text-red-500" : "text-[#D4C29A]"}`}>
                                        {extra.price < 0 
                                        ? `-€${Math.abs(extra.price).toFixed(2)}` 
                                        : `+€${(extra.price * (isSelected && extra.allowQuantity ? quantity : 1)).toFixed(2)}`
                                        }
                                    </span>
                                </button>

                                {isSelected && extra.allowQuantity && (
                                    <div className="flex items-center bg-white rounded-lg border border-[#D4C29A] ml-4 overflow-hidden shadow-sm h-8">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateExtraQuantity(extra.name, -1); }}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-[#F6EFE6] text-[#1F1F1F] transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-[#1F1F1F]">{quantity}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateExtraQuantity(extra.name, 1); }}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-[#F6EFE6] text-[#1F1F1F] transition-colors"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                    </div>
                                )}
                            </div>

                            {isSelected && extra.variants && extra.variants.length > 0 && (
                                <div className="pl-20 pr-4 animate-in slide-in-from-top-2 fade-in">
                                    <p className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase mb-1.5 ml-1">
                                        {extra.allowMultiple ? (language === 'EN' ? "Select Options:" : "Optionen wählen:") : (language === 'EN' ? "Select Option:" : "Option wählen:")}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {extra.variants.map((v: string) => {
                                            const currentVal = extraVariants[extra.name];
                                            const isVariantActive = Array.isArray(currentVal) 
                                                ? currentVal.includes(v)
                                                : currentVal === v;

                                            return (
                                                <button
                                                    key={v}
                                                    onClick={() => selectExtraVariant(extra, v)} 
                                                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                                        isVariantActive 
                                                        ? "bg-[#1F1F1F] text-white border-[#1F1F1F]" 
                                                        : "bg-white text-[#1F1F1F]/60 border-black/10 hover:border-black/30"
                                                    }`}
                                                >
                                                    {v}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                    })}
                </div>
                </div>
            )}

            {/* --- PERSONALIZATION FIELDS --- */}
            <div className="space-y-6 pt-6 border-t border-black/5 animate-in fade-in slide-in-from-top-2">
                
                {isRibbonInputVisible && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4C29A]">
                                <PenTool size={14} /> 
                                <span>{language === 'EN' ? "Ribbon Text" : "Schleifentext"}</span>
                            </label>
                            <div className="flex bg-white rounded-lg border border-black/10 p-1">
                                <button 
                                    onClick={() => setTextPlacement('option1')}
                                    className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${textPlacement === 'option1' ? 'bg-[#D4C29A] text-white shadow-sm' : 'text-[#1F1F1F]/50 hover:text-[#1F1F1F]'}`}
                                >
                                    {getLabel1()}
                                </button>
                                <button 
                                    onClick={() => setTextPlacement('option2')}
                                    className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${textPlacement === 'option2' ? 'bg-[#D4C29A] text-white shadow-sm' : 'text-[#1F1F1F]/50 hover:text-[#1F1F1F]'}`}
                                >
                                    {getLabel2()}
                                </button>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            placeholder={language === 'EN' ? "Enter personalized text..." : "Persönlichen Text eingeben..."}
                            value={customText} 
                            onChange={(e) => setCustomText(e.target.value)}
                            className={`w-full bg-white border rounded-xl px-4 py-4 text-[#1F1F1F] font-bold focus:outline-none transition-all placeholder:text-gray-300 ${
                                !customText.trim() ? "border-red-200 focus:border-red-500" : "border-black/5 focus:border-[#D4C29A]"
                            }`}
                        />
                        {!customText.trim() && (
                            <p className="text-red-500 text-xs flex items-center gap-1 font-bold animate-pulse">
                                <AlertCircle size={12} /> {t('ribbon_error')}
                            </p>
                        )}
                    </div>
                )}

                {isLetterInputVisible && (
                    <div className="space-y-3 pt-4 border-t border-dashed border-black/5">
                        <div className="flex justify-between items-center mb-2">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4C29A]">
                                <FileText size={14} /> 
                                <span>{language === 'EN' ? "Your Personal Letter" : "Ihr persönlicher Brief"}</span>
                            </label>
                            <div className="flex bg-white rounded-lg border border-black/10 p-1">
                                <button onClick={() => setLetterFont('Classic')} className={`text-[10px] px-3 py-1.5 rounded-md font-serif font-bold transition-all ${letterFont === 'Classic' ? 'bg-[#1F1F1F] text-white' : 'text-[#1F1F1F]/50'}`}>Classic</button>
                                <button onClick={() => setLetterFont('Modern')} className={`text-[10px] px-3 py-1.5 rounded-md font-sans font-bold transition-all ${letterFont === 'Modern' ? 'bg-[#1F1F1F] text-white' : 'text-[#1F1F1F]/50'}`}>Modern</button>
                                <button onClick={() => setLetterFont('Handwritten')} className={`text-[10px] px-3 py-1.5 rounded-md italic font-bold transition-all ${letterFont === 'Handwritten' ? 'bg-[#1F1F1F] text-white' : 'text-[#1F1F1F]/50'}`}>Script</button>
                            </div>
                        </div>
                        <textarea 
                            rows={8}
                            placeholder={language === 'EN' ? "Write your message here (up to 2 pages)..." : "Schreiben Sie hier Ihre Nachricht (bis zu 2 Seiten)..."}
                            value={letterText}
                            onChange={(e) => setLetterText(e.target.value)}
                            className={`w-full bg-white border border-black/5 rounded-xl px-4 py-4 text-[#1F1F1F] focus:outline-none focus:border-[#D4C29A] transition-all placeholder:text-gray-300 resize-y 
                                ${letterFont === 'Classic' ? 'font-serif' : letterFont === 'Modern' ? 'font-sans' : 'italic'}
                            `}
                        />
                    </div>
                )}

                {isShortNoteInputVisible && (
                    <div className="space-y-3 pt-4 border-t border-dashed border-black/5">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4C29A]">
                            <MessageSquare size={14} /> 
                            <span>{language === 'EN' ? "Short Note (Max 5 Words)" : "Kurze Notiz (Max 5 Wörter)"}</span>
                        </label>
                        <input 
                            type="text"
                            placeholder={language === 'EN' ? "e.g., I Love You, Sarah" : "z.B. Ich liebe dich, Sarah"}
                            value={shortNoteText}
                            onChange={handleShortNoteChange}
                            className="w-full bg-white border border-black/5 rounded-xl px-4 py-4 text-[#1F1F1F] font-bold focus:outline-none focus:border-[#D4C29A] transition-all placeholder:text-gray-300"
                        />
                        <p className="text-[10px] text-right font-bold text-[#1F1F1F]/30">{shortNoteText.trim().split(/\s+/).filter(Boolean).length} / 5 Words</p>
                    </div>
                )}

            </div>

            {/* ✨ NEW: RIGHT OF WITHDRAWAL NOTICE (Conditional) */}
            {isPersonalizedOrder && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-amber-900 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle size={14} />
                        {language === 'EN' ? "Right of Withdrawal Notice:" : "Hinweis zum Widerrufsrecht:"}
                    </h4>
                    <div className="flex gap-3 items-start">
                        <input 
                            type="checkbox" 
                            id="withdrawal-check" 
                            checked={withdrawalAccepted} 
                            onChange={(e) => setWithdrawalAccepted(e.target.checked)}
                            className="mt-1 w-5 h-5 accent-[#D4C29A] cursor-pointer shrink-0"
                        />
                        <label htmlFor="withdrawal-check" className="text-xs text-[#1F1F1F]/80 font-medium cursor-pointer leading-relaxed">
                            {language === 'EN' 
                                ? "This product is made individually according to your wishes. A right of withdrawal does not exist pursuant to § 312g (2) No. 1 BGB." 
                                : "Dieses Produkt wird individuell nach Ihren Wünschen angefertigt. Ein Widerrufsrecht besteht gemäß § 312g Abs. 2 Nr. 1 BGB nicht."}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-black/5 mt-4">
                {/* Quantity and Add to Cart Section */}
                <div className="flex items-center bg-white rounded-full border border-black/5 px-4 py-3 w-fit shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-[#D4C29A] text-gray-300 transition-colors"><Minus size={18} /></button>
                <span className="w-12 text-center font-bold text-[#1F1F1F]">{quantity}</span>
                <button 
                    onClick={() => setQuantity(Math.min(currentVariantStock, quantity + 1))} 
                    disabled={quantity >= currentVariantStock}
                    className={`p-1 transition-colors ${quantity >= currentVariantStock ? "text-gray-200 cursor-not-allowed" : "hover:text-[#D4C29A] text-gray-300"}`}
                >
                    <Plus size={18} />
                </button>
                </div>
                
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
                    : !isCurrentlyInStock ? t('out_of_stock') : !allOptionsSelected ? t('select_options') : (isPersonalizedOrder && !withdrawalAccepted ? (language === 'EN' ? "Accept Policy" : "Richtlinie akzeptieren") : t('ribbon_placeholder'))}
                </span>
                </button>

                <button 
                    onClick={handleWishlistToggle}
                    className="w-14 h-14 min-w-[3.5rem] rounded-full border-2 border-[#D4C29A]/30 flex items-center justify-center hover:bg-[#D4C29A]/10 transition-colors group"
                >
                    <Heart size={24} className={`transition-colors ${isLiked ? "fill-[#E76A8D] text-[#E76A8D]" : "text-[#E76A8D] group-hover:scale-110"}`} />
                </button>
            </div>

            </motion.div>
        </div>

        <section className="max-w-7xl mx-auto px-6">
            <RelatedProducts 
                category={product.category} 
                currentId={product.id} 
                currentName={language === 'EN' ? product.name_en : product.name}
                selectedColor={activeColor} 
            />
        </section>

        <section className="max-w-7xl mx-auto px-6 pt-24 border-t border-black/5 mt-24">
            {/* Review Section */}
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
        </div>
    </main>
  );
}