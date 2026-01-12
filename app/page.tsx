"use client";

import { useEffect, useState, useRef } from "react"; // ✨ Added useRef
import { motion } from "framer-motion";
import { ChevronRight, Star, Loader2, ArrowRight, Scissors, Sparkles, Heart, Crown, ArrowDown } from "lucide-react"; 
import ProductCard from "../components/ProductCard"; 
import Features from "../components/Features"; 
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase"; 
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext"; // ✨ Added Language Import

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const shopSectionRef = useRef<HTMLDivElement>(null); // ✨ Ref for the scroll logic
  const { language, t } = useLanguage(); // ✨ Access translation functions

  // Smooth scroll function
  const scrollToShop = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // FETCH REAL PRODUCTS FROM DATABASE
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active') 
        .neq('category', 'supplies') 
        .order('created_at', { ascending: false }) 
        .limit(3); 

      if (!error && data) {
        setProducts(data);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    /* ✅ FIXED: Background changed to Vanilla Cream and Text to Ink Black */
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] selection:bg-[#C9A24D] selection:text-white overflow-x-hidden relative font-sans">
      
      {/* Background Effects - Subtle Champagne Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C9A24D]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C9A24D]/5 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A24D]/30 bg-[#C9A24D]/10 text-[#C9A24D] text-xs font-bold tracking-widest uppercase shadow-sm">
            <Star size={12} className="fill-[#C9A24D]" />
            {language === 'EN' ? "The Premium Collection" : "Die Premium-Kollektion"}
          </div>

          {/* ✅ FIXED: Updated wording and applied REFINED SHIMMER EFFECT from video */}
          <h1 className="text-4xl md:text-7xl font-bold leading-tight text-[#1F1F1F]">
            Not just flowers <br /> 
            <span className="animate-shimmer inline-block">
              —a statement.
            </span>
          </h1>
          
          <p className="text-lg text-[#1F1F1F]/60 max-w-md leading-relaxed font-medium">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {/* ✅ FIXED: Updated to btn-luminous to remove black border and add glowing white edge */}
            <button 
              onClick={scrollToShop}
              className="group relative px-8 py-5 btn-luminous rounded-full transition-all flex items-center gap-3 active:scale-95"
            >
              <span className="flex items-center gap-2">
                {t('shop_now')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[350px] lg:h-[500px] w-full flex items-center justify-center"
        >
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] bg-white border border-black/5 flex items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10" />
            <img 
              src="/products/image2 (1).jpeg" 
              alt="Hero Rose" 
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
            <div className="z-20 text-center p-8 mt-auto absolute bottom-0 w-full">
              <div className="bg-white/90 backdrop-blur-md border border-black/5 px-6 py-4 rounded-2xl mx-auto w-11/12 shadow-lg">
                <h3 className="text-xl font-bold text-[#1F1F1F]">Glitter Rose Edition</h3>
                <p className="text-xs text-[#1F1F1F]/40 uppercase tracking-wider mt-1 font-bold">Premium Velvet Finish</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* OUR STORY Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-[#C9A24D] font-black tracking-[0.2em] uppercase text-xs">
            {t('story_badge')}
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#1F1F1F]">
            {language === 'EN' 
              ? <>Where Artistry Meets <br /> <span className="italic font-serif text-[#C9A24D]">Elegance.</span></> 
              : <>Wo Kunstfertigkeit auf <br /> <span className="italic font-serif text-[#C9A24D]">Eleganz trifft.</span></>
            }
          </h3>
          <p className="text-[#1F1F1F]/60 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
            {t('story_text')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-black/5">
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-[#C9A24D]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_1_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_1_desc')}
             </p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-[#C9A24D]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_2_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_2_desc')}
             </p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="text-[#C9A24D]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_3_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_3_desc')}
             </p>
          </div>
        </div>

        <div className="pt-8">
          <button 
            onClick={scrollToShop}
            className="px-10 py-4 bg-[#1F1F1F] text-white font-bold rounded-full hover:bg-[#C9A24D] transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            {t('shop_now')} <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      <section ref={shopSectionRef} id="shop" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-black/5 scroll-mt-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('our_collection')}</h2>
            <p className="text-[#1F1F1F]/40 font-medium">{language === 'EN' ? "Chosen by our most exclusive clients." : "Ausgewählt von unseren exklusivsten Kunden."}</p>
          </div>
          
          <Link href="/shop">
            <button className="text-[#C9A24D] hover:text-[#1F1F1F] transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              {language === 'EN' ? "View All" : "Alle anzeigen"} <ChevronRight size={16} />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-[#C9A24D]">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? products.map((product, index) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={language === 'EN' && product.name_en ? product.name_en : product.name} 
                price={`€${product.price}`} 
                category={product.category}
                image={product.images?.[0] || "/products/red-glitter.jpg"} 
                delay={index * 0.1} 
              />
            )) : (
              <div className="col-span-3 text-center py-10 text-[#1F1F1F]/30 bg-white border border-dashed border-black/10 rounded-3xl">
                <p className="font-bold uppercase tracking-widest">{language === 'EN' ? "No active products found." : "Keine aktiven Produkte gefunden."}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SUPPLIES BANNER */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-white border border-black/5 shadow-sm">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C9A24D]/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 text-[#C9A24D] text-sm font-black uppercase tracking-widest">
                  <Scissors size={14} />
                  {language === 'EN' ? "For Professionals" : "Für Profis"}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1F1F1F]">{t('supplies_title')}</h2>
                <p className="text-[#1F1F1F]/60 text-lg leading-relaxed font-medium">
                  {t('supplies_subtitle')}
                </p>
              </div>

              <Link href="/supplies">
                {/* ✅ UPDATED: Added btn-luminous class for a matching glowing look and fixed translation bug */}
                <button className="px-8 py-4 btn-luminous text-[#1F1F1F] font-bold rounded-xl transition-all">
                  {t('browse_supplies')}
                </button>
              </Link>
            </div>
        </div>
      </section>

      <Features />

    </main>
  );
}