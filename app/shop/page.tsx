"use client";

import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
// 1. Remove this import line entirely
// import Footer from "../../components/Footer"; 
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true); 
      let query = supabase
        .from("products")
        .select("*")
        .eq('status', 'active');

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data } = await query.order('created_at', { ascending: false });
        
      if (data) setProducts(data);
      setIsLoading(false);
    }

    fetchProducts();
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-rose selection:text-black">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 capitalize">
            {categoryFilter ? categoryFilter : "All Collections"}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {categoryFilter 
              ? `Viewing our exclusive ${categoryFilter} selection.`
              : "Explore our complete range of hand-crafted luxury bouquets."}
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-neon-rose" size={40} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-20 flex flex-col items-center">
            <p className="mb-4">No products found in this category.</p>
            {categoryFilter && (
                <a href="/shop" className="text-neon-rose hover:underline text-sm">
                    View all products
                </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={product.name} 
                price={`€${product.price}`} 
                category={product.category}
                image={product.images?.[0] || "/products/red-glitter.jpg"} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        )}
      </main>

      {/* 2. REMOVED THE EXTRA <Footer /> FROM HERE */}
    </div>
  );
}