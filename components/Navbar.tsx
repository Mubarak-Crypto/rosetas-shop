"use client";

import { ShoppingBag, Languages } from "lucide-react"; // ✨ Added Languages icon
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext"; // ✨ Import the new language hook

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const { language, setLanguage, t } = useLanguage(); // ✨ Access language state and translation function

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto text-white">
      
      {/* ✨ UPDATED: Hybrid Logo (Image R + Text Rosetas) with Enhanced Stitch-style design */}
      <Link href="/" className="flex items-center gap-3 group">
        
        {/* 1. The Custom "R" Image (Exact Brand Match with Pronounced Stitch Effect) */}
        <div className="relative w-12 h-12 md:w-14 md:h-14">
          <img 
            src="/r-logo.png" 
            alt="R Logo" 
            /* ✅ STITCH EFFECT ENHANCED: 
               - 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]' adds more realistic depth
               - 'contrast-125' makes the stitch patterns sharper
               - 'mix-blend-screen' remains to keep it clean
            */
            className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(255,255,255,0.4)] mix-blend-screen brightness-110 contrast-125 transition-transform group-hover:scale-110 duration-300" 
          />
        </div>
        
        {/* 2. The Text Block (Clean Code) */}
        <div className="flex flex-col justify-center">
          <span className="text-xl md:text-2xl font-serif font-medium tracking-[0.2em] uppercase leading-none bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Rosetas
          </span>
          <span className="text-[10px] md:text-[11px] font-sans tracking-[0.35em] text-gray-500 uppercase pl-1 mt-0.5 group-hover:text-[#C9A24D] transition-colors duration-300">
            Bouquets
          </span>
        </div>
      </Link>
      
      <div className="flex gap-4 items-center">
        {/* ✨ NEW: Language Selector (DE | EN) */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          <button 
            onClick={() => setLanguage('DE')}
            className={`text-[10px] font-black tracking-widest transition-colors ${language === 'DE' ? 'text-[#C9A24D]' : 'text-gray-500 hover:text-white'}`}
          >
            DE
          </button>
          <span className="w-[1px] h-3 bg-white/10"></span>
          <button 
            onClick={() => setLanguage('EN')}
            className={`text-[10px] font-black tracking-widest transition-colors ${language === 'EN' ? 'text-[#C9A24D]' : 'text-gray-500 hover:text-white'}`}
          >
            EN
          </button>
        </div>

        {/* Admin Login Button */}
        <Link href="/admin/login">
          <button className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            {t('admin_login')}
          </button>
        </Link>
        
        {/* Cart Button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ShoppingBag size={16} />
          <span>{t('cart')} ({cartCount})</span> 
        </button>
      </div>
    </nav>
  );
}