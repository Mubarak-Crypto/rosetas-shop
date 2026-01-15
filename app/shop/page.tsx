"use client";

import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState, Suspense, useMemo } from "react"; 
import { supabase } from "../../lib/supabase";
import { Loader2, Search, X, Info } from "lucide-react"; 
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext"; 

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const { language, t } = useLanguage(); 

  const [products, setProducts] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true); 

      const { data: settingsData } = await supabase
        .from('storefront_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      if (settingsData) setGlobalSettings(settingsData);

      let query = supabase
        .from("products")
        .select("*") 
        .eq('status', 'active');

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      } else {
        query = query.neq('category', 'supplies').neq('category', 'Floristenbedarf');
      }

      const { data } = await query.order('created_at', { ascending: false });
        
      if (data) setProducts(data);
      setIsLoading(false);
    }

    fetchProducts();
  }, [categoryFilter]); 

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    
    return products.filter(product => {
      const matchesNameEn = product.name_en && product.name_en.toLowerCase().includes(term);
      const matchesNameDe = product.name && product.name.toLowerCase().includes(term);
      const matchesCategory = product.category && product.category.toLowerCase().includes(term);

      return matchesNameEn || matchesNameDe || matchesCategory;
    });
  }, [products, searchTerm]);

  const roseMeanings = [
    {
      color: language === 'EN' ? "Red" : "Rot",
      meaning: language === 'EN' ? "Love, Passion, and Romance." : "Liebe, Leidenschaft und Romantik.",
      hex: "#C21807"
    },
    {
      color: language === 'EN' ? "White" : "Weiß",
      meaning: language === 'EN' ? "Purity, Innocence, and New Beginnings." : "Reinheit, Unschuld und Neuanfang.",
      hex: "#F5F5F5"
    },
    {
      color: language === 'EN' ? "Pink" : "Rosa",
      meaning: language === 'EN' ? "Gratitude, Grace, and Joy." : "Dankbarkeit, Anmut und Freude.",
      hex: "#FFC0CB"
    },
    {
      color: language === 'EN' ? "Blue" : "Blau",
      meaning: language === 'EN' ? "Mystery, Unattainable, and Uniqueness." : "Geheimnis, Unerreichbarkeit und Einzigartigkeit.",
      hex: "#00008B"
    },
    {
      color: language === 'EN' ? "Gold" : "Gold",
      meaning: language === 'EN' ? "Luxury, Success, and Achievement." : "Luxus, Erfolg und Errungenschaft.",
      hex: "#D4AF37"
    },
    {
      color: language === 'EN' ? "Black" : "Schwarz",
      meaning: language === 'EN' ? "Elegance, Mystery, and Rebirth." : "Eleganz, Geheimnis und Wiedergeburt.",
      hex: "#1F1F1F"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 capitalize text-[#1F1F1F]">
            {categoryFilter 
              ? (language === 'EN' && (categoryFilter === "Floristenbedarf" || categoryFilter === "supplies") ? "Florist Supplies" : categoryFilter) 
              : (language === 'EN' ? "All Collections" : "Alle Kollektionen")}
          </h1>
          
          <p className="text-[#1F1F1F]/60 max-w-2xl mx-auto font-medium mb-8">
            {categoryFilter 
              ? (language === 'EN' 
                  ? ((categoryFilter === "Floristenbedarf" || categoryFilter === "supplies")
                      ? "Source the same high-quality materials we use for our floral creations — carefully selected for quality and style."
                      : `Viewing our exclusive ${categoryFilter} selection.`)
                  : `Entdecken Sie unsere exklusive ${categoryFilter}-Auswahl.`)
              : (language === 'EN'
                  ? "Explore our complete range of hand-crafted luxury bouquets."
                  : "Entdecken Sie unser komplettes Sortiment an handgefertigten Luxus-Bouquets.")}
          </p>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/40" size={20} />
            <input 
                type="text" 
                placeholder={language === 'EN' ? "Search roses, boxes, crowns..." : "Suchen Sie nach Rosen, Boxen, Kronen..."} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                /* ✨ UPDATED STYLING: Beige Ring (#E3D5C0) and matching glow */
                className="w-full bg-white border border-[#EBE6DF] rounded-full py-3 pl-12 pr-12 text-[#1F1F1F] placeholder:text-[#1F1F1F]/30 focus:outline-none focus:border-[#E3D5C0] focus:ring-4 focus:ring-[#E3D5C0] transition-all font-medium shadow-[0_0_20px_rgba(227,213,192,0.6)]"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/40 hover:text-[#C9A24D] transition-colors"
                >
                    <X size={16} />
                </button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-[#1F1F1F]/40 py-20 flex flex-col items-center font-medium">
            <p className="mb-4">
                {searchTerm 
                    ? (language === 'EN' ? `No results found for "${searchTerm}"` : `Keine Ergebnisse für "${searchTerm}" gefunden`)
                    : (language === 'EN' ? "No products found in this category." : "Keine Produkte in dieser Kategorie gefunden.")
                }
            </p>
            {categoryFilter && !searchTerm && (
                <a href="/shop" className="text-[#C9A24D] hover:underline text-sm font-bold">
                    {language === 'EN' ? "View all products" : "Alle Produkte anzeigen"}
                </a>
            )}
            {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-[#C9A24D] hover:underline text-sm font-bold">
                    {language === 'EN' ? "Clear Search" : "Suche löschen"}
                </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={language === 'EN' && product.name_en ? product.name_en : product.name} 
                price={product.price}
                salePrice={product.sale_price}
                isOnSale={product.is_on_sale}
                globalDiscount={globalSettings?.is_global_sale_active ? globalSettings?.global_discount_percentage : 0}
                category={product.category}
                image={product.images?.[0] || "/products/red-glitter.jpg"} 
                videoUrl={product.video_url} 
                delay={index * 0.1} 
                promoLabel={product.promo_label} 
                stock={product.stock}
              />
            ))}
          </div>
        )}

        {categoryFilter !== "supplies" && categoryFilter !== "Floristenbedarf" && (
          <section className="mt-32 pt-16 border-t border-black/5 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1F1F1F] mb-4 flex items-center justify-center gap-2">
                <Info size={24} className="text-[#D4C29A]" />
                {language === 'EN' ? "The Language of Roses" : "Die Sprache der Rosen"}
              </h2>
              <p className="text-[#1F1F1F]/60 max-w-2xl mx-auto font-medium">
                {language === 'EN' 
                  ? "Every color holds a meaning. Choose the one that speaks for you." 
                  : "Jede Farbe hat eine Bedeutung. Wählen Sie die, die für Sie spricht."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roseMeanings.map((rose, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/50 border border-black/5 rounded-2xl p-6 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-full border border-black/10 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300" 
                    style={{ backgroundColor: rose.hex }}
                  />
                  <div>
                    <h3 className="font-bold text-[#1F1F1F] text-lg mb-1">{rose.color}</h3>
                    <p className="text-sm text-[#1F1F1F]/60 font-medium leading-relaxed">
                      {rose.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}