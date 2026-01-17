"use client";

import { ShoppingBag, Heart, Menu, X, Search } from "lucide-react"; 
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext"; 
import { useWishlist } from "../context/WishlistContext"; 
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase"; 
import SmartSearch from "./SmartSearch"; 
import { usePathname } from "next/navigation"; 

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const { language, setLanguage, t } = useLanguage(); 
  const { wishlist } = useWishlist(); 
  const pathname = usePathname(); 
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dropdown State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>([]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category');

        if (error) throw error;

        if (data) {
          const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
          setCategories(uniqueCategories.sort());
        }
      } catch (err) {
        console.error("Error fetching menu categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryLink = (category: string) => {
    if (category.toLowerCase().includes("supplies") || category.toLowerCase().includes("florist")) {
      return "/supplies";
    }
    return `/shop?category=${encodeURIComponent(category)}`;
  };

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between px-4 md:px-6 py-4 md:py-6 max-w-7xl mx-auto text-[#1F1F1F]">
        
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* HAMBURGER MENU ICON (Left) */}
          <div className="relative" ref={menuRef}>
              <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-[#1F1F1F] text-white rotate-90' : 'hover:bg-black/5 text-[#1F1F1F]'}`}
                  title="Browse Categories"
              >
                  {isMenuOpen ? <X size={20} /> : <Menu size={24} strokeWidth={2} />}
              </button>

              <AnimatePresence>
                  {isMenuOpen && (
                      <motion.div 
                          initial={{ opacity: 0, x: -10, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 mt-4 w-64 bg-white/95 backdrop-blur-xl border border-black/5 rounded-[2rem] shadow-2xl overflow-hidden z-[100] p-2"
                      >
                          <div className="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                              <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40 border-b border-black/5 mb-1">
                                  {t('shop_categories') || "Discover"}
                              </div>

                              <Link 
                                  href="/shop"
                                  onClick={() => setIsMenuOpen(false)}
                                  className="px-5 py-3 text-xs font-bold text-[#1F1F1F] hover:bg-[#F6EFE6] hover:text-[#C9A24D] rounded-xl transition-all flex items-center justify-between group"
                              >
                                  {language === 'DE' ? "Alle Produkte" : "All Products"}
                              </Link>

                              {categories.length > 0 ? (
                                  categories.map((cat, idx) => (
                                      <Link 
                                          key={idx}
                                          href={getCategoryLink(cat)}
                                          onClick={() => setIsMenuOpen(false)}
                                          className="px-5 py-3 text-xs font-bold text-[#1F1F1F] hover:bg-[#F6EFE6] hover:text-[#C9A24D] rounded-xl transition-all flex items-center justify-between group"
                                      >
                                          {cat}
                                      </Link>
                                  ))
                              ) : (
                                  <div className="px-5 py-3 text-[10px] text-gray-400 italic">
                                      Loading...
                                  </div>
                              )}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 md:gap-4 group flex-shrink">
            <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0">
              <img 
                src="/r-logo.png" 
                alt="R Logo" 
                className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] mix-blend-multiply brightness-95 contrast-125 transition-transform group-hover:scale-110 duration-300" 
              />
            </div>
            <div className="relative h-6 md:h-10 w-auto flex-shrink">
              <img 
                src="/logo-rosetas-bouquets.png" 
                alt="Rosetas Bouquets" 
                className="h-full w-auto object-contain mix-blend-multiply brightness-95 contrast-110" 
              />
            </div>
          </Link>

        </div>
        
        {/* Right Side Icons */}
        <div className="flex gap-2 md:gap-4 items-center flex-shrink-0">
          
          {/* SEARCH TRIGGER - VISIBLE ONLY IN SHOP SECTION */}
          {pathname?.startsWith('/shop') && (
             <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-all text-[#1F1F1F]"
                title="Search by Occasion"
             >
                <Search size={20} strokeWidth={2} />
             </button>
          )}

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

          <Link href="/admin/login" className="hidden lg:block">
            <button className="px-3 py-2 text-sm text-[#1F1F1F]/40 hover:text-[#1F1F1F] transition-colors font-bold uppercase tracking-tighter">
              {t('admin_login')}
            </button>
          </Link>

          {/* ✨ WISHLIST BUTTON - Updated to Pink (#E76A8D) */}
          <Link href="/wishlist" className="relative hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-transparent hover:border-black/5 hover:bg-white/50 transition-all group">
              <Heart 
                size={20} 
                className={`transition-colors ${wishlist.length > 0 ? "fill-[#E76A8D] text-[#E76A8D]" : "text-[#1F1F1F] group-hover:text-[#E76A8D]"}`} 
              />
              {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E76A8D] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                      {wishlist.length}
                  </span>
              )}
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="px-3 py-2 md:px-5 md:py-2 btn-luminous rounded-full transition-all flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <ShoppingBag strokeWidth={2.5} className="text-[#1F1F1F] w-4 h-4" />
            <span className="font-black uppercase tracking-tighter text-[#1F1F1F] text-xs md:text-sm">
              {t('cart')} ({cartCount})
            </span> 
          </button>
        </div>
      </nav>

      {/* RENDER SMART SEARCH COMPONENT (Logic handled internally) */}
      <SmartSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}