"use client";

import { motion } from "framer-motion";
import { Plus, ShoppingBag, Video } from "lucide-react"; // ✨ Added Video icon for sparkle indicator
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext"; // ✨ Added Language Import

interface ProductProps {
  id: number;
  title: string;
  price: string;
  category: string;
  image: string;
  delay: number;
  videoUrl?: string | string[]; // ✨ Updated to support array or string
}

export default function ProductCard({ id, title, price, category, image, delay, videoUrl }: ProductProps) {
  const { language } = useLanguage(); // ✨ Access current language
  
  // ✨ Logic to check if there is at least one video
  const hasVideo = Array.isArray(videoUrl) ? videoUrl.length > 0 : !!videoUrl;

  // ✨ Logic to translate hardcoded categories if they come from the database
  const translatedCategory = language === 'EN' && category === 'Floristenbedarf' ? 'Florist Supplies' : category;

  return (
    // Link to the REAL ID now
    <Link href={`/product/${id}`} className="block h-full"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.5 }}
        className="group relative h-full bg-white/40 border border-black/5 rounded-2xl overflow-hidden hover:border-black/10 transition-all duration-300 flex flex-col"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent to-[#C9A24D]/10 pointer-events-none" />

        {/* Media Container */}
        <div className="h-72 w-full bg-black/10 flex items-center justify-center relative overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" 
          />
          
          {/* ✨ NEW: Video Indicator Badge (Shows if product has a video) */}
          {/* ✅ FIXED: High-contrast text and forced white color for visibility */}
          {hasVideo && (
            <div className="absolute top-3 right-3 z-20 bg-[#1F1F1F] backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-2xl">
              <Video size={12} style={{ color: '#C9A24D' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white" style={{ color: 'white' }}>
                {language === 'EN' ? "Video" : "Video"}
              </span>
            </div>
          )}

          {/* Centered Shopping Bag on Hover */}
          <ShoppingBag 
            className="absolute z-10 text-white/0 group-hover:text-white/80 transition-all duration-300 drop-shadow-lg transform scale-50 group-hover:scale-100" 
            size={48} 
            style={{ color: 'white' }} 
          />

          {/* ✅ FIXED: Plus Button with forced icon visibility */}
          <button className="absolute bottom-4 right-4 w-10 h-10 bg-[#1F1F1F] text-white rounded-full flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-300 hover:scale-110 shadow-lg z-20">
            <Plus 
              size={20} 
              style={{ color: 'white !important' }} 
              className="!text-white" 
            />
          </button>
        </div>

        {/* Text Details */}
        <div className="p-6 flex-1 flex flex-col justify-end">
          {/* ✨ Category now uses the translation logic */}
          <p className="text-xs text-[#1F1F1F]/60 uppercase tracking-widest mb-2 font-bold">{translatedCategory}</p>
          <h3 className="text-lg font-bold text-[#1F1F1F] mb-1 group-hover:text-[#C9A24D] transition-colors">{title}</h3>
          <p className="text-[#1F1F1F] font-semibold">{price}</p>
        </div>
      </motion.div>
    </Link>
  );
}