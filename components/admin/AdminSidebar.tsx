"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LogOut, ExternalLink, Menu, X, Star, Layout, Tag, Heart } from "lucide-react"; // ✨ Added Heart icon
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu

  // Helper to check if link is active
  const isActive = (path: string) => pathname.startsWith(path);

  // Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <>
      {/* 🔴 MOBILE MENU BUTTON (Only visible on small screens) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-[#C9A24D] text-white p-2 rounded-lg shadow-lg hover:bg-[#C9A24D]/80 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🌑 MOBILE OVERLAY (Darkens background when menu is open) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 📂 SIDEBAR */}
      <aside className={`
        fixed md:relative z-40 top-0 left-0
        h-screen w-64 
        bg-[#1F1F1F] border-r border-white/5
        flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 pt-12 md:pt-8">
          <h2 className="text-2xl font-bold tracking-tighter text-white">
            ROSETAS <span className="text-[#C9A24D] text-[10px] tracking-[0.2em] block font-black uppercase mt-1">Admin Panel</span>
          </h2>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2">
          
          {/* Dashboard Link */}
          <Link 
            href="/admin/dashboard" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/dashboard") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          {/* Orders Link */}
          <Link 
            href="/admin/orders" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/orders") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package size={20} />
            Orders
          </Link>

          {/* Products Link */}
          <Link 
            href="/admin/products" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/products") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag size={20} />
            Products
          </Link>

          {/* Sales Manager Link */}
          <Link 
            href="/admin/sales" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/sales") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Tag size={20} />
            Sales & Discounts
          </Link>

          {/* Storefront Link */}
          <Link 
            href="/admin/settings" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/settings") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layout size={20} />
            Storefront
          </Link>

          {/* Manage Reviews Link */}
          <Link 
            href="/admin/reviews" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/reviews") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Star size={20} />
            Manage Reviews
          </Link>

          {/* ✨ Charity Projects Link */}
          <Link 
            href="/admin/charity" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              isActive("/admin/charity") 
                ? "bg-[#C9A24D] text-white shadow-lg shadow-[#C9A24D]/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <Heart size={20} />
            Charity Projects
          </Link>

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link 
            href="/" 
            target="_blank" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
          >
            <ExternalLink size={18} /> View Live Shop
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

      </aside>
    </>
  );
}