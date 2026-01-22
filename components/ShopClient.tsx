"use client";

import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import { useEffect, useState, useMemo, Suspense } from "react"; 
import { Loader2, Search, X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"; 
import { useSearchParams } from "next/navigation";
import Link from "next/link"; 
import { useLanguage } from "../context/LanguageContext"; 

interface ShopClientProps {
  initialProducts: any[];
  initialSettings: any;
  initialColors: any[];
}

function ShopContent({ initialProducts, initialSettings, initialColors }: ShopClientProps) {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const urlSearchTerm = searchParams.get("search"); 
  const { language, t } = useLanguage(); 

  // ✨ STATE: We use the data passed from the Server immediately
  const [products] = useState<any[]>(initialProducts);
  const [globalSettings] = useState<any>(initialSettings); 
  const [colors] = useState<any[]>(initialColors);
  
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm || ""); 

  // ✨ NEW: Toggle for Color Guide (Hidden by default on ALL screens now)
  const [showColorGuide, setShowColorGuide] = useState(false);

  useEffect(() => {
    if (urlSearchTerm) {
        setSearchTerm(urlSearchTerm);
    }
  }, [urlSearchTerm]);

  // ✨ PERFORMANCE: Filter instantly on the client side instead of re-fetching from DB
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Filter by Category (Replicating your original DB logic)
    if (categoryFilter) {
        result = result.filter(p => p.category === categoryFilter);
    } else {
        // Default: Exclude supplies if no category selected
        result = result.filter(p => p.category !== 'supplies' && p.category !== 'Floristenbedarf');
    }

    // 2. Filter by Search Term
    if (!searchTerm.trim()) return result;

    const term = searchTerm.toLowerCase();
    return result.filter(product => {
      const matchesNameEn = product.name_en && product.name_en.toLowerCase().includes(term);
      const matchesNameDe = product.name && product.name.toLowerCase().includes(term);
      const matchesCategory = product.category && product.category.toLowerCase().includes(term);

      return matchesNameEn || matchesNameDe || matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

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

        <header className="mb-12 text-center">
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

        {/* ✨ COLOR GUIDE SECTION */}
        {categoryFilter !== "supplies" && categoryFilter !== "Floristenbedarf" && (
          <section className="mb-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="text-center mb-6">
              {/* ✨ UPDATED TITLE: Bolder & Larger */}
              <h2 className="text-3xl font-extrabold text-[#1F1F1F] mb-3 flex items-center justify-center gap-3">
                {language === 'EN' ? "Let Roses Speak" : "Lass Rosen sprechen"}
                <div className="relative pb-2">
                    {/* ✨ CUSTOM ROSE ICON: Updated to match your sketch (5 petals, line art) */}
                    <svg 
                      width="50" 
                      height="50" 
                      viewBox="0 0 100 100" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-[#1F1F1F] drop-shadow-md"
                    >
                      {/* Center */}
                      <path d="M50 52 C52 52 53 50 50 48 C47 50 48 52 50 52" fill="currentColor" stroke="none" />
                      
                      {/* Petal 1 (Top) */}
                      <path d="M50 48 C45 35 40 15 50 5 C60 15 55 35 50 48" />
                      <path d="M50 48 C48 35 48 20 50 10" strokeWidth="0.5" opacity="0.6" />
                      <path d="M50 48 C52 35 52 20 50 10" strokeWidth="0.5" opacity="0.6" />

                      {/* Petal 2 (Top Right) */}
                      <path d="M50 48 C60 42 80 35 95 40 C85 55 65 52 50 48" />
                      <path d="M50 48 C65 44 80 40 90 42" strokeWidth="0.5" opacity="0.6" />
                      <path d="M50 48 C62 46 75 44 85 45" strokeWidth="0.5" opacity="0.6" />

                      {/* Petal 3 (Bottom Right) */}
                      <path d="M50 52 C65 55 80 70 75 90 C60 85 52 65 50 52" />
                      <path d="M50 52 C60 60 70 75 72 85" strokeWidth="0.5" opacity="0.6" />
                      <path d="M50 52 C58 58 65 70 68 80" strokeWidth="0.5" opacity="0.6" />

                      {/* Petal 4 (Bottom Left) */}
                      <path d="M50 52 C48 65 40 85 25 90 C20 70 35 55 50 52" />
                      <path d="M50 52 C40 60 30 75 28 85" strokeWidth="0.5" opacity="0.6" />
                      <path d="M50 52 C42 58 35 70 32 80" strokeWidth="0.5" opacity="0.6" />

                      {/* Petal 5 (Top Left) */}
                      <path d="M50 48 C35 52 15 55 5 40 C20 35 40 42 50 48" />
                      <path d="M50 48 C35 44 20 40 10 42" strokeWidth="0.5" opacity="0.6" />
                      <path d="M50 48 C38 46 25 44 15 45" strokeWidth="0.5" opacity="0.6" />
                    </svg>
                </div>
              </h2>
              {/* ✨ UPDATED SUBTITLE: Darker & Semibold */}
              <p className="text-[#1F1F1F]/80 max-w-2xl mx-auto font-semibold text-base mb-6">
                {language === 'EN' 
                  ? "Colors with meaning. Choose your message." 
                  : "Farben mit Bedeutung. Wählen Sie Ihre Botschaft."}
              </p>
              
              {/* ✨ NEW: Toggle Button - NOW Soft beige (#E6DCCA) */}
              <button 
                onClick={() => setShowColorGuide(!showColorGuide)}
                className="inline-flex items-center gap-2 bg-[#E6DCCA] text-[#1F1F1F] px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all hover:bg-[#d8c8b0]"
              >
                {showColorGuide 
                    ? (language === 'EN' ? "Hide Color Guide" : "Farbleitfaden verbergen") 
                    : (language === 'EN' ? "View Color Guide" : "Farbleitfaden anzeigen")}
                {showColorGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* ✨ UPDATED GRID: Hidden on ALL screens unless toggled. 2 Cols on Mobile, 4 Cols on Desktop */}
            <div className={`${showColorGuide ? 'grid' : 'hidden'} grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-top-4 duration-500`}>
              {/* ✨ DYNAMIC COLORS MAPPING */}
              {colors.map((rose, idx) => {
                const name = language === 'EN' ? rose.name : (rose.name_de || rose.name);
                const feeling = language === 'EN' ? rose.feeling_en : rose.feeling_de;
                const quote = language === 'EN' ? rose.quote_en : rose.quote_de;
                
                const perfectForString = language === 'EN' ? rose.perfect_for_en : rose.perfect_for_de;
                const perfectForList = perfectForString ? perfectForString.split(',').map((s: string) => s.trim()) : [];

                return (
                  <div 
                    key={rose.id || idx} 
                    className="bg-white/60 border border-black/5 rounded-xl p-4 md:p-5 flex flex-col gap-3 hover:shadow-lg hover:border-[#D4C29A]/30 transition-all group backdrop-blur-sm cursor-default"
                  >
                    <div className="flex items-center gap-3 border-b border-black/5 pb-3">
                      <div 
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-black/10 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300" 
                          style={{ backgroundColor: rose.hex_code }}
                      />
                      <h3 className="font-bold text-[#1F1F1F] text-sm md:text-base leading-tight">{name}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {feeling && (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-[#C9A24D] uppercase tracking-wider mb-0.5">
                              {language === 'EN' ? "Feeling" : "Gefühl"}
                          </p>
                          <p className="text-xs md:text-sm font-bold text-[#1F1F1F] leading-tight">{feeling}</p>
                        </div>
                      )}

                      {perfectForList.length > 0 && (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-[#C9A24D] uppercase tracking-wider mb-0.5">
                              {language === 'EN' ? "Perfect For" : "Perfekt für"}
                          </p>
                          <ul className="text-[10px] md:text-xs text-[#1F1F1F]/80 space-y-0.5 list-disc list-inside font-medium">
                              {/* ✨ Shows ALL items (removed slice) */}
                              {perfectForList.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {quote && (
                        <div className="pt-2 mt-auto">
                          <p className="text-[10px] md:text-xs text-[#1F1F1F]/60 italic font-medium">
                              “{quote}”
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

        {/* PRODUCT GRID (Now below the guide) */}
        {filteredProducts.length === 0 ? (
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

      </main>
    </div>
  );
}

export default function ShopClient(props: ShopClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      </div>
    }>
      <ShopContent {...props} />
    </Suspense>
  );
}