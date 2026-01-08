"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, Filter } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import

export default function SuppliesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { language, t } = useLanguage(); // ✨ Access language state

  // FETCH SUPPLIES ONLY
  useEffect(() => {
    const fetchSupplies = async () => {
      // We explicitly ask for items where category is 'supplies'
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('category', 'supplies') 
        .order('name', { ascending: true });

      if (!error && data) {
        setProducts(data);
      }
      setIsLoading(false);
    };

    fetchSupplies();
  }, []);

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

      {/* Header Section */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
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
            {t('supplies_subtitle')}
          </motion.p>
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
        {isLoading ? (
          <div className="flex justify-center py-20 text-[#C9A24D]">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  title={language === 'EN' && product.name_en ? product.name_en : product.name} 
                  price={`€${product.price}`} 
                  category={language === 'EN' ? "Supply" : "Bedarf"} // ✨ Translated Category
                  image={product.images?.[0] || "/placeholder.jpg"} 
                  videoUrl={product.video_url} // ✨ NEW: Passing video data to show the sparkle badge
                  delay={index * 0.05} 
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
        )}
      </section>
    </main>
  );
}