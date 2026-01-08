"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto text-white">
      
      {/* ✨ UPDATED: Hybrid Logo (Image R + Text Rosetas) */}
      <Link href="/" className="flex items-center gap-3 group">
        
        {/* 1. The Custom "R" Image (Exact Brand Match) */}
        <div className="relative w-12 h-12 md:w-14 md:h-14">
          <img 
            src="/r-logo.png" 
            alt="R Logo" 
            // ✨ FIX ADDED HERE: 'mix-blend-screen' removes the black box background
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mix-blend-screen" 
          />
        </div>
        
        {/* 2. The Text Block (Clean Code) */}
        <div className="flex flex-col justify-center">
          <span className="text-xl md:text-2xl font-serif font-medium tracking-[0.2em] uppercase leading-none bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Rosetas
          </span>
          <span className="text-[10px] md:text-[11px] font-sans tracking-[0.35em] text-gray-500 uppercase pl-1 mt-0.5 group-hover:text-neon-rose transition-colors">
            Bouquets
          </span>
        </div>
      </Link>
      
      <div className="flex gap-4 items-center">
        {/* Admin Login Button */}
        <Link href="/admin/login">
          <button className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Admin Login
          </button>
        </Link>
        
        {/* Cart Button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ShoppingBag size={16} />
          <span>Cart ({cartCount})</span> 
        </button>
      </div>
    </nav>
  );
}