"use client";

import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState, Suspense, useMemo } from "react"; 
import { supabase } from "../../lib/supabase";
import { Loader2, Search, X, ArrowLeft } from "lucide-react"; // ✨ Removed Info icon
import { useSearchParams } from "next/navigation";
import Link from "next/link"; 
import { useLanguage } from "../../context/LanguageContext"; 

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const urlSearchTerm = searchParams.get("search"); 
  const { language, t } = useLanguage(); 

  const [products, setProducts] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null); 
  // ✨ NEW: State for Dynamic Colors
  const [colors, setColors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm || ""); 

  useEffect(() => {
    if (urlSearchTerm) {
        setSearchTerm(urlSearchTerm);
    }
  }, [urlSearchTerm]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true); 

      // 1. Fetch Global Settings
      const { data: settingsData } = await supabase
        .from('storefront_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      if (settingsData) setGlobalSettings(settingsData);

      // 2. Fetch Products
      let query = supabase
        .from("products")
        .select("*") 
        .eq('status', 'active');

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      } else {
        query = query.neq('category', 'supplies').neq('category', 'Floristenbedarf');
      }

      const { data: productsData } = await query.order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);

      // 3. ✨ NEW: Fetch Active Colors for "Let Roses Speak" section
      const { data: colorsData } = await supabase
        .from('product_colors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (colorsData) setColors(colorsData);

      setIsLoading(false);
    }

    fetchData();
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

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        
        {/* ✨ NEW: Back to Home Button */}
        <div className="mb-8">
            <Link 
                href="/"
                className="inline-flex items-center gap-2 text-[#1F1F1F]/60 hover:text-[#1F1F1F] transition-colors font-bold uppercase tracking-widest text-xs group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {language === 'EN' ? "Back to Home" : "Zurück zur Startseite"}
            </Link>
        </div>

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
                  ? "Explore our exclusive products for special moments."
                  : "Entdecken Sie unsere exklusiven Produkte für besondere Momente.")}
          </p>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/40" size={20} />
            <input 
                type="text" 
                placeholder={language === 'EN' ? "Search roses, boxes, crowns..." : "Suchen Sie nach Rosen, Boxen, Kronen..."} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {/* ✨ UPDATED TITLE - Added emoji as design element */}
                {language === 'EN' ? "Let Roses Speak 🌹" : "Lass Rosen sprechen 🌹"}
              </h2>
              {/* ✨ UPDATED SUBTITLE */}
              <p className="text-[#1F1F1F]/60 max-w-2xl mx-auto font-medium">
                {language === 'EN' 
                  ? "Colors with meaning. Choose your message." 
                  : "Farben mit Bedeutung. Wählen Sie Ihre Botschaft."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* ✨ DYNAMIC COLORS MAPPING */}
              {colors.map((rose, idx) => {
                // Helper to get text based on language
                const name = language === 'EN' ? rose.name : (rose.name_de || rose.name);
                const feeling = language === 'EN' ? rose.feeling_en : rose.feeling_de;
                const quote = language === 'EN' ? rose.quote_en : rose.quote_de;
                
                // Perfect For is stored as string in DB, split by comma for list
                const perfectForString = language === 'EN' ? rose.perfect_for_en : rose.perfect_for_de;
                const perfectForList = perfectForString ? perfectForString.split(',').map((s: string) => s.trim()) : [];

                return (
                  <div 
                    key={rose.id || idx} 
                    className="bg-white/50 border border-black/5 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                          className="w-12 h-12 rounded-full border border-black/10 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300" 
                          style={{ backgroundColor: rose.hex_code }}
                      />
                      <h3 className="font-bold text-[#1F1F1F] text-lg">{name}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {feeling && (
                        <div>
                          <span className="text-xs font-bold text-[#C9A24D] uppercase tracking-wider block mb-1">
                              {language === 'EN' ? "Feeling" : "Gefühl"}
                          </span>
                          <p className="text-sm font-medium text-[#1F1F1F]">{feeling}</p>
                        </div>
                      )}

                      {perfectForList.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-[#C9A24D] uppercase tracking-wider block mb-1">
                              {language === 'EN' ? "Perfect For" : "Perfekt für"}
                          </span>
                          <ul className="text-xs text-[#1F1F1F]/70 space-y-1 list-disc list-inside font-medium">
                              {perfectForList.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {quote && (
                        <div className="pt-3 border-t border-black/5 mt-auto">
                          <p className="text-sm text-[#1F1F1F] italic font-medium flex gap-2">
                              <span>💬</span> “{quote}”
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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