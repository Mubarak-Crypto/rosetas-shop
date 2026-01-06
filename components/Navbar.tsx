"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto text-white">
      
      {/* Brand Logo - Updated from Text to Image */}
      <Link href="/" className="flex items-center">
        <img 
          src="/logo.jpg" 
          alt="ROSETAS" 
          className="h-14 w-auto object-contain" // Height set to 14 for good visibility
        />
      </Link>
      
      <div className="flex gap-4 items-center">
        {/* Admin Login Button - Kept exactly as before */}
        <Link href="/admin/login">
          <button className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Admin Login
          </button>
        </Link>
        
        {/* Cart Button - Kept exactly as before */}
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