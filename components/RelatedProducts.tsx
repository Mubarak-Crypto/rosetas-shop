"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "./ProductCard";
import { Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface RelatedProps {
  category: string;
  currentId: any;
  selectedColor?: string; // ✨ NEW: The color the user clicked
  currentName: string;    // ✨ NEW: To check for "Glitter" vs "No Glitter"
}

export default function RelatedProducts({ category, currentId, selectedColor, currentName }: RelatedProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    const fetchAndScoreRelated = async () => {
      // 1. Get Settings
      const { data: settings } = await supabase.from('storefront_settings').select('*').eq('id', '00000000-0000-0000-0000-000000000000').single();
      if (settings) setGlobalSettings(settings);

      // 2. Fetch a pool of candidates from the same category (e.g., 20 items)
      // We fetch more than we need so we can filter/rank them in the next step
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('category', category)
        .neq('id', currentId) 
        .limit(20); 

      if (data) {
        // ✨ 3. THE SMART RANKING ALGORITHM
        const scoredProducts = data.map(product => {
            let score = 0;

            // A. Color Match (+10 points)
            // We check if the product's variants string contains the selected color (e.g. "Royal Blue")
            if (selectedColor && JSON.stringify(product.variants).toLowerCase().includes(selectedColor.toLowerCase())) {
                score += 10;
            }

            // B. Theme Match (+5 points)
            // Check if both match "Glitter" or both don't match "Glitter"
            const isGlitter = currentName.toLowerCase().includes("glitter");
            const productIsGlitter = (product.name_en || product.name).toLowerCase().includes("glitter");
            
            if (isGlitter === productIsGlitter) {
                score += 5;
            }

            return { ...product, score };
        });

        // 4. Sort by Score (High to Low) and take top 4
        const topPicks = scoredProducts.sort((a, b) => b.score - a.score).slice(0, 4);
        setProducts(topPicks);
      }
      
      setLoading(false);
    };

    if (category) fetchAndScoreRelated();
  }, [category, currentId, selectedColor, currentName]); // Re-run if color changes

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#D4C29A]" /></div>;
  if (products.length === 0) return null;

  return (
    <section className="py-16 border-t border-black/5 mt-16">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold text-[#1F1F1F]">
            {language === 'EN' ? "Recommended for You" : "Für dich empfohlen"}
        </h2>
        <div className="flex items-center justify-center gap-2 text-[#D4C29A] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> 
            {selectedColor 
                ? (language === 'EN' ? `Matching ${selectedColor}` : `Passend zu ${selectedColor}`) 
                : (language === 'EN' ? "Curated Selection" : "Ausgewählte Kollektion")
            }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={language === 'EN' && product.name_en ? product.name_en : product.name}
            price={product.price}
            salePrice={product.sale_price}
            isOnSale={product.is_on_sale}
            globalDiscount={globalSettings?.is_global_sale_active ? globalSettings?.global_discount_percentage : 0}
            category={product.category}
            image={product.images?.[0] || "/placeholder.jpg"}
            videoUrl={product.video_url}
            promoLabel={product.promo_label}
            stock={product.stock}
            delay={idx * 0.1}
          />
        ))}
      </div>
    </section>
  );
}