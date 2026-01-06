"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, LogOut, ExternalLink } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  // Helper to check if link is active
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-screen sticky top-0">
      
      {/* HEADER */}
      <div className="p-8 border-b border-white/10">
        <h2 className="text-2xl font-bold tracking-tighter">
          ZAHRAK <span className="text-neon-purple text-xs tracking-widest block font-light">ADMIN PANEL</span>
        </h2>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2">
        
        {/* Dashboard Link */}
        <Link 
          href="/admin/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            isActive("/admin/dashboard") 
              ? "bg-neon-purple text-white shadow-glow-purple" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        {/* Orders Link (NEW) */}
        <Link 
          href="/admin/orders" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            isActive("/admin/orders") 
              ? "bg-neon-purple text-white shadow-glow-purple" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Package size={20} />
          Orders
        </Link>

        {/* Products Link */}
        <Link 
          href="/admin/products" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            isActive("/admin/products") 
              ? "bg-neon-purple text-white shadow-glow-purple" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShoppingBag size={20} />
          Products
        </Link>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm">
          <ExternalLink size={18} /> View Live Shop
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
          <LogOut size={18} /> Logout
        </button>
      </div>

    </aside>
  );
}