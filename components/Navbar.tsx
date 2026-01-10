"use client";

import { ShoppingBag, Languages } from "lucide-react"; // ✨ Added Languages icon
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext"; // ✨ Import the new language hook

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const { language, setLanguage, t } = useLanguage(); // ✨ Access language state and translation function

  return (
    /* ✅ FIXED: Text color changed to Ink Black for better visibility on Cream background */
    <nav className="relative z-50 flex items-center justify-between px-4 md:px-6 py-4 md:py-6 max-w-7xl mx-auto text-[#1F1F1F]">
      
      {/* ✨ UPDATED: Full Stitch-Style Logo (R-Logo + Rosetas Bouquets Text Image) */}
      <Link href="/" className="flex items-center gap-2 md:gap-4 group flex-shrink">
        
        {/* 1. The Custom "R" Image (Exact Brand Match - Position Unchanged) */}
        <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0">
          <img 
            src="/r-logo.png" 
            alt="R Logo" 
            /* ✅ STITCH EFFECT ENHANCED: Pronounced depth and contrast */
            className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] mix-blend-multiply brightness-95 contrast-125 transition-transform group-hover:scale-110 duration-300" 
          />
        </div>
        
        {/* 2. The Text Logo Image (Replaced text with logo-rosetas-bouquets.png) */}
        <div className="relative h-6 md:h-10 w-auto flex-shrink">
          <img 
            src="/logo-rosetas-bouquets.png" 
            alt="Rosetas Bouquets" 
            /* ✅ MATCHING STYLE: Applied similar blend and shadow for a unified stitch look */
            className="h-full w-auto object-contain mix-blend-multiply brightness-95 contrast-110" 
          />
        </div>
      </Link>
      
      {/* ✅ MOBILE FIX: Optimized spacing for language toggle and cart */}
      <div className="flex gap-2 md:gap-4 items-center flex-shrink-0">
        {/* ✨ NEW: Language Selector (DE | EN) - FIXED: Removed 'hidden sm:flex' to show on mobile */}
        <div className="flex items-center gap-2 bg-black/5 border border-black/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <button 
            onClick={() => setLanguage('DE')}
            className={`text-[10px] font-black tracking-widest transition-colors ${language === 'DE' ? 'text-[#C9A24D]' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
          >
            DE
          </button>
          <span className="w-[1px] h-3 bg-black/10"></span>
          <button 
            onClick={() => setLanguage('EN')}
            className={`text-[10px] font-black tracking-widest transition-colors ${language === 'EN' ? 'text-[#C9A24D]' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]'}`}
          >
            EN
          </button>
        </div>

        {/* Admin Login Button - Hidden on mobile to make room for Language switcher */}
        <Link href="/admin/login" className="hidden lg:block">
          <button className="px-3 py-2 text-sm text-[#1F1F1F]/40 hover:text-[#1F1F1F] transition-colors font-bold uppercase tracking-tighter">
            {t('admin_login')}
          </button>
        </Link>
        
        {/* Cart Button */}
        {/* ✅ LUMINOUS UPDATE: Replaced black border with white border and radiant glow for a lively, creamy look */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="px-3 py-2 md:px-5 md:py-2 btn-luminous rounded-full transition-all flex items-center gap-2 active:scale-95 shadow-sm"
        >
          {/* ✅ FIXED: Restored 'CART' text and applied black icon/text for contrast on cream */}
          <ShoppingBag strokeWidth={2.5} className="text-[#1F1F1F] w-4 h-4" />
          <span className="font-black uppercase tracking-tighter text-[#1F1F1F] text-xs md:text-sm">
            {t('cart')} ({cartCount})
          </span> 
        </button>
      </div>
    </nav>
  );
}