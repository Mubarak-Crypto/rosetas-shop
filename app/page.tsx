"use client";

import { useEffect, useState, useRef } from "react"; 
import { motion } from "framer-motion";
import { ChevronRight, Star, Loader2, ArrowRight, Scissors, Sparkles, Heart, Crown, ArrowDown } from "lucide-react"; 
import ProductCard from "../components/ProductCard"; 
import Features from "../components/Features"; 
import Navbar from "../components/Navbar";
import CharityImpact from "../components/CharityImpact"; 
import { supabase } from "../lib/supabase"; 
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext"; 

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const shopSectionRef = useRef<HTMLDivElement>(null); 
  const { language, t } = useLanguage(); 

  const scrollToShop = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      const productsRes = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active') 
        .neq('category', 'supplies') 
        .order('created_at', { ascending: false }) 
        .limit(3); 

      const settingsRes = await supabase
        .from('storefront_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();

      if (productsRes.data) setProducts(productsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] selection:bg-[#D4C29A] selection:text-white overflow-x-hidden relative font-sans">
      
      <style jsx global>{`
        /* ✨ FONTS PRESERVED EXACTLY AS REQUESTED */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Allura&display=swap');
        
        @keyframes shine-glide {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .silver-glow-text {
          background: linear-gradient(
            120deg, 
            #1F1F1F 40%, 
            #C0C0C0 48%, 
            #FFFFFF 50%, 
            #C0C0C0 52%, 
            #1F1F1F 60%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent; 
          animation: shine-glide 4s linear infinite;
        }

        .font-playfair {
            font-family: 'Playfair Display', serif;
        }

        .handwritten-font {
            font-family: 'Allura', cursive;
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4C29A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4C29A]/5 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      {/* ✨ FIX APPLIED: Changed 'lg:grid-cols-2' to 'xl:grid-cols-2'. 
         This forces iPads/Tablets to stack the layout (Text Top / Image Bottom), 
         ensuring the button is never covered. Side-by-side only happens on large screens (PC/Laptop). */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 grid xl:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 relative z-20" // Added z-20 to ensure it sits on top
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4C29A]/30 bg-[#D4C29A]/10 text-[#D4C29A] text-xs font-bold tracking-widest uppercase shadow-sm">
            <Star size={12} className="fill-[#D4C29A]" />
            {language === 'EN' ? "The Premium Collection" : "Die Premium-Kollektion"}
          </div>

          {/* ✨ STRUCTURE PRESERVED: 2 Lines, Whitespace-nowrap kept */}
          <h1 className="text-5xl md:text-7xl xl:text-8xl font-bold leading-tight text-[#1F1F1F] tracking-tight font-playfair">
            {/* Line 1 */}
            <span className="block whitespace-nowrap">Not just Flowers</span>
            
            {/* Line 2 */}
            <span className="flex items-center gap-4 mt-2 whitespace-nowrap">
              <span className="opacity-40 text-4xl md:text-6xl font-light font-sans">—</span>
              <span 
                className="handwritten-font text-6xl md:text-8xl xl:text-9xl silver-glow-text pr-6 py-2" 
                style={{ lineHeight: 1.3 }}
              >
                A Statement
              </span>
            </span>
          </h1>
          
          <p className="text-lg text-[#1F1F1F]/60 max-w-md leading-relaxed font-medium">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {/* ✨ BUTTON PRESERVED */}
            <button 
              onClick={scrollToShop}
              className="group relative px-8 py-5 rounded-full transition-all flex items-center gap-3 active:scale-95 z-30" // High Z-index
              style={{
                boxShadow: '0 0 25px rgba(205, 175, 149, 0.9), 0 0 50px rgba(205, 175, 149, 0.6)', 
                border: '1px solid #CDAF95',
                backgroundColor: '#CDAF95',
                color: '#1F1F1F'
              }}
            >
              <span className="flex items-center gap-2 font-bold">
                {t('shop_now')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* Hero Image - Stacks below text on Tablets now */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[350px] lg:h-[500px] w-full flex items-center justify-center mt-8 xl:mt-0"
        >
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] bg-white border border-black/5 flex items-center justify-center overflow-hidden shadow-2xl">
            {settings?.show_hero_image && settings?.hero_image_url ? (
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                <img 
                  src={settings.hero_image_url} 
                  alt="Hero Bouquet" 
                  className="absolute w-full h-full object-cover transition-transform duration-700" 
                  style={{ 
                    transform: `scale(${parseInt(settings.hero_zoom || '100') / 100}) translateY(${(parseInt(settings.hero_vertical_shift || '50') - 50) * 0.5}%)`
                  }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#F6EFE6] flex items-center justify-center italic text-black/10 font-serif text-2xl">Rosetas</div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none" />
            
            <div className="z-20 text-center p-8 mt-auto absolute bottom-0 w-full">
              <div className="bg-white/90 backdrop-blur-md border border-black/5 px-6 py-4 rounded-2xl mx-auto w-11/12 shadow-lg">
                <h3 className="text-xl font-bold text-[#1F1F1F] leading-tight">
                  {settings?.hero_title || 'Glitter Rose Edition'}
                </h3>
                <p className="text-xs text-[#1F1F1F]/40 uppercase tracking-wider mt-1 font-bold">
                  {settings?.hero_subtitle || 'Premium Velvet Finish'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* OUR STORY Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-[#D4C29A] font-black tracking-[0.2em] uppercase text-xs">
            {t('story_badge')}
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#1F1F1F]">
            {language === 'EN' 
              ? <>Where Artistry Meets <br /> <span className="italic font-serif text-[#D4C29A]">Elegance.</span></> 
              : <>Wo Kunstfertigkeit auf <br /> <span className="italic font-serif text-[#D4C29A]">Eleganz trifft.</span></>
            }
          </h3>
          <p className="text-[#1F1F1F]/60 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
            {t('story_text')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-black/5">
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-[#D4C29A]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_1_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_1_desc')}
             </p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-[#D4C29A]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_2_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_2_desc')}
             </p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="text-[#D4C29A]" size={24} />
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
            className="px-10 py-4 font-bold rounded-full transition-all flex items-center gap-2 mx-auto active:scale-95"
            style={{
              boxShadow: '0 0 25px rgba(205, 175, 149, 0.9), 0 0 50px rgba(205, 175, 149, 0.6)', 
              border: '1px solid #CDAF95',
              backgroundColor: '#CDAF95',
              color: '#1F1F1F'
            }}
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
            <button 
                className="px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border backdrop-blur-sm"
                style={{
                    backgroundColor: '#CDAF95',
                    color: '#1F1F1F',
                    borderColor: '#CDAF95',
                    boxShadow: '0 0 15px rgba(205, 175, 149, 0.6)'
                }}
            >
              {language === 'EN' ? "View All" : "Alle anzeigen"} <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-[#D4C29A]">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? products.map((product, index) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={language === 'EN' && product.name_en ? product.name_en : product.name} 
                price={product.price} 
                salePrice={product.sale_price} 
                isOnSale={product.is_on_sale} 
                globalDiscount={settings?.is_global_sale_active ? settings?.global_discount_percentage : 0} 
                category={product.category}
                image={product.images?.[0] || "/products/red-glitter.jpg"} 
                delay={index * 0.1} 
                promoLabel={product.promo_label}
                stock={product.stock}
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
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4C29A]/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 text-[#D4C29A] text-sm font-black uppercase tracking-widest">
                  <Scissors size={14} />
                  {language === 'EN' ? "For Professionals" : "Für Profis"}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1F1F1F]">{t('supplies_title')}</h2>
                <p className="text-[#1F1F1F]/60 text-lg leading-relaxed font-medium">
                  {language === 'EN' 
                    ? "Source the same high-quality materials we use for our floral creations — carefully selected for quality and style."
                    : t('supplies_subtitle')}
                </p>
              </div>

              <Link href="/supplies">
                <button className="px-8 py-4 btn-luminous text-[#1F1F1F] font-bold rounded-xl transition-all">
                  {t('browse_supplies')}
                </button>
              </Link>
            </div>
        </div>
      </section>

      <CharityImpact />

      <Features />

    </main>
  );
}