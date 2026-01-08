"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, Filter } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabase";

export default function SuppliesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-midnight text-white selection:bg-neon-rose selection:text-black">
      <Navbar />

      {/* Header Section */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold"
          >
            Florist <span className="text-neon-rose">Essentials</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Premium wires, ribbons, and tools for professional creators.
          </motion.p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          
          <div className="flex items-center gap-2 text-gray-400 pl-2">
            <Filter size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Professional Supplies</span>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search ribbons, wires, paper..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-rose focus:ring-1 focus:ring-neon-rose transition-all"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20 text-neon-rose">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  title={product.name} 
                  price={`€${product.price}`} 
                  category="Supply" // Hardcoded for this page
                  image={product.images?.[0] || "/placeholder.jpg"} 
                  delay={index * 0.05} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-lg">No supplies found in the inventory.</p>
                <p className="text-sm mt-2 text-neon-rose">
                  Make sure to set the product category to "supplies" in your Admin Panel.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}