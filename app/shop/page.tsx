"use client";

import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
// 1. Remove this import line entirely
// import Footer from "../../components/Footer"; 
import { useEffect, useState, Suspense } from "react"; // Added Suspense
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import

// ✨ Split into a sub-component to handle SearchParams safely for Vercel
function ShopContent() {
  // 2. Get the current search params (the stuff after the ? in the URL)
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const { language, t } = useLanguage(); // ✨ Access language state

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true); // Show loading spinner while switching categories

      // Start building the query
      let query = supabase
        .from("products")
        .select("*")
        .eq('status', 'active');

      // 3. If a category exists in URL, filter by it
      if (categoryFilter) {
        // NOTE: Ensure your database 'category' column matches the text exactly
        // (e.g. "Glitter Roses"). If your DB is lowercase, use .ilike() or convert strictly.
        query = query.eq('category', categoryFilter);
      }

      // Finish query with sorting
      const { data } = await query.order('created_at', { ascending: false });
        
      if (data) setProducts(data);
      setIsLoading(false);
    }

    fetchProducts();
  }, [categoryFilter]); // 4. This ensures the page updates when you click a footer link!

  return (
    /* ✅ FIXED: Background changed to Vanilla Cream and Text to Ink Black */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <header className="mb-12 text-center">
          {/* 5. Dynamic Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 capitalize text-[#1F1F1F]">
            {categoryFilter 
              ? (language === 'EN' && categoryFilter === "Floristenbedarf" ? "Florist Supplies" : categoryFilter) 
              : (language === 'EN' ? "All Collections" : "Alle Kollektionen")}
          </h1>
          <p className="text-[#1F1F1F]/60 max-w-2xl mx-auto font-medium">
            {categoryFilter 
              ? (language === 'EN' 
                  ? `Viewing our exclusive ${categoryFilter === "Floristenbedarf" ? "Florist Supplies" : categoryFilter} selection.`
                  : `Entdecken Sie unsere exklusive ${categoryFilter}-Auswahl.`)
              : (language === 'EN'
                  ? "Explore our complete range of hand-crafted luxury bouquets."
                  : "Entdecken Sie unser komplettes Sortiment an handgefertigten Luxus-Bouquets.")}
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            {/* ✅ FIXED: Loader color updated to Champagne Gold */}
            <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-[#1F1F1F]/40 py-20 flex flex-col items-center font-medium">
            <p className="mb-4">{language === 'EN' ? "No products found in this category." : "Keine Produkte in dieser Kategorie gefunden."}</p>
            {/* Show a button to go back to all products if empty */}
            {categoryFilter && (
                <a href="/shop" className="text-[#C9A24D] hover:underline text-sm font-bold">
                    {language === 'EN' ? "View all products" : "Alle Produkte anzeigen"}
                </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={language === 'EN' && product.name_en ? product.name_en : product.name} 
                price={`€${product.price}`} 
                category={product.category}
                image={product.images?.[0] || "/products/red-glitter.jpg"} 
                videoUrl={product.video_url} // ✨ NEW: Passing video data to show the sparkle badge
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

// ✨ Main Export wrapped in Suspense for Vercel Prerendering
export default function ShopPage() {
  return (
    <Suspense fallback={
      /* ✅ FIXED: Fallback background and loader updated */
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}