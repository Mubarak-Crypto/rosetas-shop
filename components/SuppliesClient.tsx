"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, Filter, Truck, ArrowLeft } from "lucide-react"; 
import Link from "next/link"; 
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import FloristCommunityModal from "./FloristCommunityModal"; 
import { useLanguage } from "../context/LanguageContext"; 

interface SuppliesClientProps {
  initialProducts: any[];
  initialSettings: any;
}

export default function SuppliesClient({ initialProducts, initialSettings }: SuppliesClientProps) {
  // ✨ STATE: Initialize directly with Server Data (No Fetching!)
  const [products] = useState<any[]>(initialProducts);
  const [globalSettings] = useState<any>(initialSettings);
  
  const [searchTerm, setSearchTerm] = useState("");
  const { language, t } = useLanguage(); 

  // Simple Search Filter
  const filteredProducts = products.filter(product => {
    // ✨ Search through the currently visible language name
    const nameToSearch = language === 'EN' && product.name_en ? product.name_en : product.name;
    return nameToSearch.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    /* ✅ FIXED: Theme Colors Updated to Cream & Ink */
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] selection:bg-[#C9A24D] selection:text-white">
      <Navbar />

      {/* ✨ NEW: Florist Community Modal (Appears automatically based on logic) */}
      <FloristCommunityModal />

      {/* Header Section */}
      <section className="relative pt-32 pb-12 px-6">
        
        {/* ✨ NEW: Back to Home Button */}
        <div className="max-w-7xl mx-auto mb-6">
            <Link 
                href="/"
                className="inline-flex items-center gap-2 text-[#1F1F1F]/60 hover:text-[#1F1F1F] transition-colors font-bold uppercase tracking-widest text-xs group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {language === 'EN' ? "Back to Home" : "Zurück zur Startseite"}
            </Link>
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-[#1F1F1F]"
          >
            {language === 'EN' ? "Florist" : "Floristen"} <span className="text-[#C9A24D]">{language === 'EN' ? "Essentials" : "Bedarf"}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#1F1F1F]/60 max-w-2xl mx-auto font-medium"
          >
            {/* ✨ UPDATED: Specific English Text as requested */}
            {language === 'EN' 
              ? "Source the same high-quality materials we use for our floral creations — carefully selected for quality and style."
              : t('supplies_subtitle')}
          </motion.p>

          {/* ✨ NEW: Shipping Promise Badge for Florists */}
          {/* This clearly communicates the "Next Day Dispatch" rule for this specific category */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white border border-[#D4C29A] px-6 py-3 rounded-full shadow-sm"
          >
            <div className="bg-[#D4C29A]/20 p-2 rounded-full text-[#D4C29A]">
                <Truck size={18} />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1F1F1F]/40">
                    {language === 'EN' ? "Fast Delivery" : "Schneller Versand"}
                </p>
                <p className="text-sm font-bold text-[#1F1F1F]">
                    {language === 'EN' ? "Ships within 24-48h" : "Versand innerhalb 24-48h"}
                </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 border border-black/5 p-4 rounded-2xl backdrop-blur-md shadow-sm">
          
          <div className="flex items-center gap-2 text-[#1F1F1F]/40 pl-2">
            <Filter size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              {language === 'EN' ? "Professional Supplies" : "Profi-Bedarf"}
            </span>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/20" size={18} />
            <input 
              type="text" 
              placeholder={language === 'EN' ? "Search ribbons, wires, paper..." : "Bänder, Drähte, Papier suchen..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              /* ✅ FIXED: Input styled for Vanilla theme */
              className="w-full bg-white border border-black/5 rounded-xl py-3 pl-12 pr-4 text-[#1F1F1F] placeholder:text-[#1F1F1F]/20 focus:outline-none focus:border-[#C9A24D] transition-all font-medium"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  title={language === 'EN' && product.name_en ? product.name_en : product.name} 
                  price={product.price} // ✨ UPDATED: Pass raw number for math
                  salePrice={product.sale_price} // ✨ NEW: Individual sale price
                  isOnSale={product.is_on_sale} // ✨ NEW: Is individual sale active?
                  globalDiscount={globalSettings?.is_global_sale_active ? globalSettings?.global_discount_percentage : 0} // ✨ NEW: Global discount
                  category={language === 'EN' ? "Supply" : "Bedarf"} // ✨ Translated Category
                  // ✨ FIXED: Use a valid existing image instead of missing placeholder.jpg to stop 404s
                  image={product.images?.[0] || "/products/red-glitter.jpg"} 
                  videoUrl={product.video_url} // ✨ NEW: Passing video data to show the sparkle badge
                  delay={index * 0.05} 
                  promoLabel={product.promo_label} // ✨ NEW: Pass Promo Label
                  stock={product.stock} // ✨ NEW: Pass Stock Limit
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-[#1F1F1F]/40 bg-white/40 rounded-3xl border border-dashed border-black/10">
                <p className="text-lg font-bold">
                  {language === 'EN' ? "No supplies found in the inventory." : "Kein Floristenbedarf im Inventar gefunden."}
                </p>
                <p className="text-sm mt-2 text-[#C9A24D] font-bold uppercase tracking-tight">
                  {language === 'EN' 
                    ? "Make sure to set the product category to 'supplies' in your Admin Panel."
                    : "Stellen Sie sicher, dass die Produktkategorie im Admin-Panel auf 'supplies' gesetzt ist."}
                </p>
              </div>
            )}
          </div>
      </section>
    </main>
  );
}