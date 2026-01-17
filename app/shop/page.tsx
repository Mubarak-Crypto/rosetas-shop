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
  const urlSearchTerm = searchParams.get("search"); 
  const { language, t } = useLanguage(); 

  const [products, setProducts] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm || ""); 

  useEffect(() => {
    if (urlSearchTerm) {
        setSearchTerm(urlSearchTerm);
    }
  }, [urlSearchTerm]);

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

  // ✨ UPDATED: Colors coordinated to match your image exactly
  const roseMeanings = [
    {
      color: language === 'EN' ? "Ash Grey" : "Aschgrau",
      hex: "#8C9399", // ✨ Updated from image (Medium Grey)
      feeling: language === 'EN' ? "Neutral, reliable, respectful" : "Neutral, zuverlässig, respektvoll",
      perfectFor: language === 'EN' 
        ? ["Business meetings", "Colleagues", "Teachers", "Meetings with new people", "Thank-you gifts"]
        : ["Business Meetings", "Arbeitskollegen", "Lehrer:innen", "Treffen mit fremden Personen", "Dankeschön-Geschenke"],
      quote: language === 'EN' ? "Appropriate, without being too personal." : "Passend, ohne zu persönlich zu sein."
    },
    {
      color: language === 'EN' ? "Midnight Blue" : "Mitternachtsblau",
      hex: "#002366", // ✨ Updated from image (Deep Royal Blue)
      feeling: language === 'EN' ? "Trust & reliability" : "Vertrauen & Verlässlichkeit",
      perfectFor: language === 'EN'
        ? ["Friendship", "Business partners", "Colleagues", "Gifts for men", "Formal occasions"]
        : ["Freundschaft", "Geschäftspartner", "Kollegen", "Männergeschenke", "formelle Anlässe"],
      quote: language === 'EN' ? "A safe and confident choice." : "Eine sichere Wahl."
    },
    {
      color: language === 'EN' ? "Ice Sea Blue" : "Eismeerblau",
      hex: "#4DB9E3", // ✨ Updated from image (Vivid Sky Blue)
      feeling: language === 'EN' ? "Lightness & positive energy" : "Leichtigkeit & positive Energie",
      perfectFor: language === 'EN'
        ? ["Birthdays", "Baby celebrations", "Easter", "Small gestures", "Friendly attentions"]
        : ["Geburtstage", "Babyfeiern", "Ostern", "kleine Aufmerksamkeiten", "freundliche Gesten"],
      quote: language === 'EN' ? "A gift that brings joy." : "Ein Geschenk, das Freude macht."
    },
    {
      color: language === 'EN' ? "Lavender Dream" : "LavendelTraum",
      hex: "#885FA6", // ✨ Updated from image (Rich Purple)
      feeling: language === 'EN' ? "Uniqueness & appreciation" : "Besonderheit & Wertschätzung",
      perfectFor: language === 'EN'
        ? ["Anniversaries", "Special birthdays", "Events", "People who are “different”", "Creative personalities"]
        : ["Jubiläen", "besondere Geburtstage", "Events", "Menschen, die „anders“ sind", "kreative Persönlichkeiten"],
      quote: language === 'EN' ? "Not ordinary." : "Nicht alltäglich."
    },
    {
      color: language === 'EN' ? "Pastel Violet" : "Pastellviolett",
      hex: "#BFA7C7", // ✨ Updated from image (Muted Dusty Lilac)
      feeling: language === 'EN' ? "Warm & friendly" : "Herzlich & freundlich",
      perfectFor: language === 'EN'
        ? ["Friendship", "Colleagues", "Mothers", "Thank-you gifts", "Visits"]
        : ["Freundschaft", "Kolleg:innen", "Mütter", "Dankeschön", "Besuche"],
      quote: language === 'EN' ? "From the heart, without being overwhelming." : "Von Herzen, ohne zu aufdringlich zu sein."
    },
    {
      color: language === 'EN' ? "Cream White" : "Sahneweiß",
      hex: "#F5E1C3", // ✨ Updated from image (Peachy/Warm Cream)
      feeling: language === 'EN' ? "Warmth & balance" : "Wärme & Ausgeglichenheit",
      perfectFor: language === 'EN'
        ? ["Host gifts", "Christmas", "Family", "Calm occasions", "Elegant events"]
        : ["Gastgebergeschenke", "Weihnachten", "Familie", "ruhige Anlässe", "elegante Events"],
      quote: language === 'EN' ? "Always the right choice." : "Passt immer."
    },
    {
      color: language === 'EN' ? "Snowflake White" : "Schneeflockenweiß",
      hex: "#FFFFFF", // ✨ Pure White
      feeling: language === 'EN' ? "Honesty & new beginnings" : "Ehrlichkeit & Neubeginn",
      perfectFor: language === 'EN'
        ? ["Engagements", "Weddings", "Christenings", "Graduation ceremonies", "Formal events"]
        : ["Verlobung", "Hochzeiten", "Taufen", "Abschlussfeiern", "formelle Events"],
      quote: language === 'EN' ? "Classic and meaningful." : "Klassisch & bedeutungsvoll."
    },
    {
      color: language === 'EN' ? "Ruby Fire" : "Rubinfeuer",
      hex: "#8B0000", // ✨ Updated from image (Deepest Red)
      feeling: language === 'EN' ? "Deep connection" : "Tiefe Verbindung",
      perfectFor: language === 'EN'
        ? ["Romantic relationships", "Engagements", "Anniversaries", "Valentine’s Day", "Special gifts"]
        : ["Beziehung", "Verlobung", "Jahrestage", "Valentinstag", "besondere Geschenke"],
      quote: language === 'EN' ? "For real emotions." : "Für echte Gefühle."
    },
    {
      color: language === 'EN' ? "Soft Pink" : "Zartrosa",
      hex: "#F58F84", // ✨ Updated from image (Salmon/Peachy Pink)
      feeling: language === 'EN' ? "Affection & thoughtfulness" : "Zuneigung & Aufmerksamkeit",
      perfectFor: language === 'EN'
        ? ["Birthdays", "Mother’s Day", "Friendship", "Thank-you gifts", "Loving gestures"]
        : ["Geburtstage", "Muttertag", "Freundschaft", "Dankeschön", "liebe Gesten"],
      quote: language === 'EN' ? "I was thinking of you." : "Ich habe an dich gedacht."
    },
    {
      color: language === 'EN' ? "Rose Kiss" : "Rosenkuss",
      hex: "#E76A8D", // ✨ Updated from image (Medium Rosy Pink)
      feeling: language === 'EN' ? "Closeness & warmth" : "Nähe & Herzlichkeit",
      perfectFor: language === 'EN'
        ? ["Small gifts", "Dates", "Friends", "Surprises"]
        : ["kleine Geschenke", "Dates", "Freund:innen", "Überraschungen"],
      quote: language === 'EN' ? "A gift with feeling." : "Ein Geschenk mit Gefühl."
    },
    {
      color: language === 'EN' ? "Light Rose" : "Light Rose",
      hex: "#F9CCCA", // ✨ Updated from image (Pale Blush)
      feeling: language === 'EN' ? "Appreciation" : "Wertschätzung",
      perfectFor: language === 'EN'
        ? ["Colleagues", "Teachers", "Client gifts", "Visits", "Events"]
        : ["Kolleg:innen", "Lehrer:innen", "Kundengeschenke", "Besuche", "Events"],
      quote: language === 'EN' ? "Stylish and kind." : "Stilvoll & freundlich."
    },
    {
      color: language === 'EN' ? "Night Rose" : "Nachtrose",
      hex: "#000000", // ✨ Black
      feeling: language === 'EN' ? "Strength & impact" : "Stärke & Eindruck",
      perfectFor: language === 'EN'
        ? ["Exclusive events", "Business occasions", "Special personalities", "Strong statements"]
        : ["exklusive Events", "Business-Anlässe", "besondere Menschen", "starke Statements"],
      quote: language === 'EN' ? "Unforgettable." : "Bleibt im Kopf."
    },
    {
      color: language === 'EN' ? "Forest Magic" : "Waldzauber",
      hex: "#0B4227", // ✨ Updated from image (Dark Teal/Forest Green)
      feeling: language === 'EN' ? "Natural & genuine" : "Natürlich & ehrlich",
      perfectFor: language === 'EN'
        ? ["Christmas", "Autumn celebrations", "Family", "Conscious gifts", "Nature lovers"]
        : ["Weihnachten", "Herbstfeste", "Familie", "bewusste Geschenke", "Menschen, die Natur lieben"],
      quote: language === 'EN' ? "Honest and grounding." : "Natürlich & ehrlich."
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
                  className="bg-white/50 border border-black/5 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-full border border-black/10 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300" 
                        style={{ backgroundColor: rose.hex }}
                    />
                    <h3 className="font-bold text-[#1F1F1F] text-lg">{rose.color}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                        <span className="text-xs font-bold text-[#C9A24D] uppercase tracking-wider block mb-1">
                            {language === 'EN' ? "Feeling" : "Gefühl"}
                        </span>
                        <p className="text-sm font-medium text-[#1F1F1F]">{rose.feeling}</p>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-[#C9A24D] uppercase tracking-wider block mb-1">
                            {language === 'EN' ? "Perfect For" : "Perfekt für"}
                        </span>
                        <ul className="text-xs text-[#1F1F1F]/70 space-y-1 list-disc list-inside font-medium">
                            {rose.perfectFor.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-3 border-t border-black/5 mt-auto">
                        <p className="text-sm text-[#1F1F1F] italic font-medium flex gap-2">
                            <span>💬</span> “{rose.quote}”
                        </p>
                    </div>
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